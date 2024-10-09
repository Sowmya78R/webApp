import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cyclecountingconfig',
  templateUrl: './cyclecountingconfig.component.html',
  styleUrls: ['./cyclecountingconfig.component.scss']
})
export class CyclecountingconfigComponent implements OnInit, OnDestroy, AfterViewInit {
  configData: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  cycleCountingCriterias: any = [
    { value: 'productCategory', viewValue: 'Product Category' },
    { value: 'wareHouse', viewValue: 'Warehouse' },
    { value: 'zone', viewValue: 'Zone' },
    { value: 'location', viewValue: 'Location' },
    { value: 'product', viewValue: 'Product' },
    { value: 'supplier', viewValue: 'Supplier' }
  ];
  formObj = this.configService.getGlobalpayload();
  dropdownList: any = [];
  selected: any;
  locations: any = [];
  products: any = [];
  productCategorys: any = [];
  cycleCountingForm: FormGroup;
  cycleCountingScheduleForm: FormGroup;
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };
  booleanValue: Boolean = true;
  ccScheduleLocal = { noEndDate: this.booleanValue }
  ccWeekDayScheduleLocal = {
    "sundayName": 'sunday',
    "sundayValue": false,
    "mondayName": 'monday',
    "mondayValue": false,
    "tuesdayName": 'tuesday',
    "tuesdayValue": false,
    "wednesdayName": 'wednesday',
    "wednesdayValue": false,
    "thursdayName": 'thursday',
    "thursdayValue": false,
    "fridayName": 'friday',
    "fridayValue": false,
    "saturdayName": 'saturday',
    "saturdayValue": false
  }
  status: any = 'Created';
  configPermissionsList: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  supplierIDNameIdValues: any = [];
  suppliers: any = [];
  supplierIDNames: any = [];

  constructor(private ngxSmartModalService: NgxSmartModalService, private wmsService: WMSService,
    private configService: ConfigurationService, private fb: FormBuilder, public datePipe: DatePipe,
    private toastr: ToastrService, private customValidators: CustomValidators,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.configPermissionsList = this.configService.getConfigurationPermissions('mainFunctionalities', 'Cycle Counting Config', this.getClientRole());
    if (this.getClientRole() && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View', 'Update', 'Delete'];
    }
    if (this.configPermissionsList.includes('View')) {
      this.fetchMulti();
      this.createForm();
      this.createScheduleForm();
      this.getCycleCountingDetails();
      this.fetchAllSupplierDetails();
    }
  }
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllProductBySupplierData(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productBySuppliers) {
          this.suppliers = response.data.productBySuppliers;
          this.supplierIDNameIdValues = response.data.productBySuppliers.map(sup => sup.supplierIDName);
        }
      }
    );
  }
  getClientRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_CLIENT', 'ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  getValue(event) {
    if (event.target.checked) {
      this.cycleCountingScheduleForm.controls.noEndDate.setValue(true);
    }
    else {
      this.cycleCountingScheduleForm.controls.noEndDate.setValue(false);
    }
  }
  getWeekValue(key, event) {
    this.cycleCountingScheduleForm.value.cycleCountingWeekDaySchedule[key + 'Value'] = event;
  }
  getCycleCountingDetails() {
    this.configService.getAllccConfiguration(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['cycleCountingConfigurations']) {
        this.configData = res['data']['cycleCountingConfigurations'];
        this.rerender();
      }
    })
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  edit(line) {
    const detail = JSON.parse(JSON.stringify(line));
    if (detail.status === 'Confirmed') {
      this.cycleCountingForm.disable();
      this.cycleCountingScheduleForm.disable();
    }
    else {
      this.cycleCountingForm.enable();
      this.cycleCountingScheduleForm.enable();
    }
    this.getCriteria(detail.criteriaType);
    this.selected = detail.criteriaTypeValues;
    this.cycleCountingForm.patchValue(detail);
    this.status = this.cycleCountingForm.controls.status.value;
    if (detail.cycleCountingSchedule) {
      this.cycleCountingScheduleForm.patchValue(detail.cycleCountingSchedule);
      this.ccScheduleLocal.noEndDate = detail.cycleCountingSchedule.noEndDate;
      const arr = [{ name: 'mondayName', value: 'mondayValue' }, { name: 'tuesdayName', value: 'tuesdayValue' },
      { name: 'wednesdayName', value: 'wednesdayValue' }, { name: 'thursdayName', value: 'thursdayValue' },
      { name: 'fridayName', value: 'fridayValue' }, { name: 'saturdayName', value: 'saturdayValue' },
      { name: 'sundayName', value: 'sundayValue' }];
      arr.forEach(element => {
        if (detail.cycleCountingSchedule.cycleCountingWeekDaySchedule[element.name]) {
          detail.cycleCountingSchedule.cycleCountingWeekDaySchedule[element.value] =
            (detail.cycleCountingSchedule.cycleCountingWeekDaySchedule[element.value] == 'Yes') ? true : false;
        }
      });
      this.ccWeekDayScheduleLocal = detail.cycleCountingSchedule.cycleCountingWeekDaySchedule;
      if (detail.cycleCountingSchedule.startDateTime) {
        this.cycleCountingScheduleForm.controls.startDateTime.setValue(
          this.datePipe.transform(detail.cycleCountingSchedule.startDateTime, 'yyyy-MM-dd HH:mm'));
      }
      if (detail.cycleCountingSchedule.endDateTime) {
        this.cycleCountingScheduleForm.controls.endDateTime.setValue(
          this.datePipe.transform(detail.cycleCountingSchedule.endDateTime, 'yyyy-MM-dd HH:mm'));
      }
    }
  }
  createForm() {
    this.cycleCountingForm = this.fb.group({
      _id: null,
      "cycleCode": [null, this.customValidators.required],
      "criteriaType": [null, this.customValidators.required],
      "criteriaTypeValues": [null, this.customValidators.required],
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      "createdDate": new Date(),
      "status": ['Created'],
      "lastUpdatedDate": null,
    })
  }
  createScheduleForm() {
    this.cycleCountingScheduleForm = this.fb.group({
      "_id": null,
      "scheduleJob": ['Days', this.customValidators.required],
      "startDateTime": [null, this.customValidators.required],
      "endDateTime": null,
      "noEndDate": null,
      "recurrence": null,
      "cycleCountingWeekDaySchedule": {
        "sundayName": 'sunday',
        "sundayValue": null,
        "mondayName": 'monday',
        "mondayValue": null,
        "tuesdayName": 'tuesday',
        "tuesdayValue": null,
        "wednesdayName": 'wednesday',
        "wednesdayValue": null,
        "thursdayName": 'thursday',
        "thursdayValue": null,
        "fridayName": 'friday',
        "fridayValue": null,
        "saturdayName": 'saturday',
        "saturdayValue": null
      }
    })
  }
  fetchMulti() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategorys = [...new Set(response.data.productCategories.map(x => x.productCategoryName))]
        } else {
          this.productCategorys = [];
        }
      },
      (error) => {
      });

    this.wmsService.fetchAllLocations(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locations = response.data.locations;
        } else {
          this.locations = [];
        }
      },
      (error) => {
        this.locations = [];
      });
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
        } else {
          this.products = [];
        }
      },
      (error) => {
        this.products = [];
      });
  }
  openPopup() {
    if (this.configPermissionsList.includes('Update')) {
      this.ngxSmartModalService.getModal('ccConfig').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
  closePopup() {
    this.toastr.success("Added");
    this.ngxSmartModalService.getModal('ccConfig').close();
  }
  overAllClear() {
    this.createForm();
    this.clearPopupDetails();
    this.selected = null;
    this.status = 'Created';
    this.supplierIDNames = [];
    this.cycleCountingForm.enable();
    this.cycleCountingScheduleForm.enable();
  }
  clearPopupDetails() {
    this.ccWeekDayScheduleLocal = {
      "sundayName": 'sunday',
      "sundayValue": false,
      "mondayName": 'monday',
      "mondayValue": false,
      "tuesdayName": 'tuesday',
      "tuesdayValue": false,
      "wednesdayName": 'wednesday',
      "wednesdayValue": false,
      "thursdayName": 'thursday',
      "thursdayValue": false,
      "fridayName": 'friday',
      "fridayValue": false,
      "saturdayName": 'saturday',
      "saturdayValue": false
    }
    this.ccScheduleLocal.noEndDate = false;
    this.createScheduleForm();
  }
  getCriteria(event) {
    this.selected = null;
    this.cycleCountingForm.controls.criteriaTypeValues.setValue([]);
    this.dropdownList = [];
    let filteredData = [];
    switch (event) {
      case 'Product Category':
        if (this.productCategorys.length > 0) {
          this.dropdownList = this.productCategorys;
        } else {
          this.dropdownList = [];
        }
        break;
      case 'Warehouse':
        this.selected = this.configService.getWarehouse().wareHouseIDName;
        this.cycleCountingForm.controls.criteriaTypeValues.setValue([this.selected]);
        break;
      case 'Zone':
        if (this.locations.length > 0) {
          filteredData = [...new Set(this.locations.map(x => x.zoneInfo.zoneName))];
          this.dropdownList = filteredData;
        }
        else {
          this.dropdownList = [];
        }
        break;
      case 'Location':
        if (this.locations.length > 0) {
          filteredData = this.locations.map(x => x.locationName);
          this.dropdownList = filteredData;
        }
        else {
          this.dropdownList = [];
        }
        break;
      case 'Product':
        if (this.products.length > 0) {
          filteredData = this.products.map(x => x.productIDName);
          this.dropdownList = filteredData;
        }
        else {
          this.dropdownList = [];
        }
        break;
    }
  }
  fetchAllProductBySupplier() {
    let arr: any = [];
    if (this.supplierIDNames.length > 0) {
      this.supplierIDNames.forEach(element => {
        const abc = this.suppliers.find(x => x.supplierIDName == element);
        if (abc) {
          arr = [...new Set([...abc.productMasterInfos.map(x => x.productIDName)])];
          this.dropdownList = arr;
        }
      });
    }
    else {
      this.dropdownList = arr;
    }
  }
  setUserstoForm(event) {
    this.cycleCountingForm.controls.criteriaTypeValues.setValue(this.selected);

  }
  save() {
    if (this.configPermissionsList.includes('Update')) {
      if (this.cycleCountingScheduleForm.valid) {
        const data = this.cycleCountingForm.value;
        if (data.criteriaType == 'Supplier') {
          data.criteriaType = 'Product';
        }
        if (!this.cycleCountingScheduleForm.value.noEndDate) {
          this.cycleCountingScheduleForm.value.noEndDate = false
        }
        const arr = [{ name: 'mondayName', value: 'mondayValue' }, { name: 'tuesdayName', value: 'tuesdayValue' },
        { name: 'wednesdayName', value: 'wednesdayValue' }, { name: 'thursdayName', value: 'thursdayValue' },
        { name: 'fridayName', value: 'fridayValue' }, { name: 'saturdayName', value: 'saturdayValue' },
        { name: 'sundayName', value: 'sundayValue' }];
        arr.forEach(element => {
          if (this.cycleCountingScheduleForm.value.cycleCountingWeekDaySchedule[element.name]) {
            this.cycleCountingScheduleForm.value.cycleCountingWeekDaySchedule[element.value] =
              (this.cycleCountingScheduleForm.value.cycleCountingWeekDaySchedule[element.value] == 'true' ||
                this.cycleCountingScheduleForm.value.cycleCountingWeekDaySchedule[element.value] == true ||
                this.cycleCountingScheduleForm.value.cycleCountingWeekDaySchedule[element.value] == 'Yes') ? 'Yes' : 'No';
          }
        });
        data['cycleCountingSchedule'] = this.cycleCountingScheduleForm.value;
        data.cycleCountingSchedule['startDateTime'] = new Date(data.cycleCountingSchedule['startDateTime']);
        data.cycleCountingSchedule['endDateTime'] = data.cycleCountingSchedule['endDateTime'] ? new Date(data.cycleCountingSchedule['endDateTime']) : null;
        this.configService.saveOrUpdatecycleCountingConfig(data).subscribe(res => {
          if (res['status'] == 0) {
            this.toastr.success("Saved Successfully");
            this.getCycleCountingDetails();
            this.overAllClear();
          }
        })
      }
      else {
        this.toastr.error("Enter Schedule Details.")
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
}
