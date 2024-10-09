import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DecimalUtils } from 'src/app/constants/decimal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import { Storage } from 'src/app/shared/utils/storage';
@Component({
  selector: 'app-createcyclecounting',
  templateUrl: './createcyclecounting.component.html',
  styleUrls: ['./createcyclecounting.component.scss']
})
export class CreatecyclecountingComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  cycleCountingForm: FormGroup;
  showTooltip: any = false;
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
  wareHouseTeamsList: any = [];
  wareHouseTeamsNamesList: any = [];
  selected: any;
  selectedEmployees: any;
  locations: any = [];
  productCategorys: any = [];
  productLinesData: any = [];
  products: any = [];
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
  dropdownSettingsUser = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
    limitSelection: 10
  };
  id: any = null;
  selectAllCheckboxValue: boolean = false;
  makeThisDisable: Boolean = false;
  counterValue1: boolean = false;
  counterValue2: boolean = false;
  role: any = null;
  userIDName: any = null;
  dropdownDisabled: Boolean = false;
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inventory', 'Cycle Counting', Storage.getSessionUser());
  noPermissions: Boolean = false;
  permissionToggle: any = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  supplierIDNameIdValues: any = [];
  suppliers: any = [];
  supplierIDNames: any = [];
  statusObj = { 'status': null, 'statusSequence': null };
  totalStatusCount: Number = 0;
  headerData: any = null
  approveCCcheck: boolean = false;
  disableToggle: boolean = false;
  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = 'DESC';
  sortFields: any = null;

  constructor(private fb: FormBuilder, private customValidators: CustomValidators,
    private configService: ConfigurationService, private wmsService: WMSService,
    private common: CommonMasterDataService, private datePipe: DatePipe,
    private toastr: ToastrService, private router: Router, private appService: AppService,
    private ngxSmartModalService: NgxSmartModalService, private excelService: ExcelService, private datepipe: DatePipe,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    this.id = this.appService.getParam('id')
    // this.wmsService.PassCycleCounting = this.id;
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
    this.role = Storage.getSessionUser().authorities[0].authority;
    this.userIDName = Storage.getSessionUser().userPermissionFunctionalityInfo.userInfo.userIDName
    this.createForm();
    this.noPermissions = (this.permissionsList.includes('Update')) ? false : true;
    if (this.permissionsList.includes('View')) {
      this.fetchMulti();
      this.getPermissions();
      if (!this.id) {
        this.fetchAllSupplierDetails();
      }
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
  getPermissions() {
    this.configService.getAllInventoryConfiguration(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['processConfigurations'] && res['data']['processConfigurations'].length > 0) {
        if (res['data']['processConfigurations'].find(x => x.name == 'Cycle Counting')) {
          const havePermission = res['data']['processConfigurations'].find(x => x.name == 'Cycle Counting');
          if (havePermission && havePermission.processStatusPolicies && havePermission.processStatusPolicies.length > 0) {
            const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).authorities[0].authority;
            const loginUser = JSON.parse(sessionStorage.getItem('dli-wms-user')).username;
            havePermission.processStatusPolicies.forEach(outer => {
              const rolesStatusIndex = outer.statusRoleConfigurations.findIndex(x => x.role.roleName == loginUserRole);
              if (rolesStatusIndex != -1 && !this.permissionToggle) {
                const listOfUsers = outer.statusRoleConfigurations[rolesStatusIndex].userInfos.map(x => x.email);
                this.permissionToggle = (listOfUsers.includes(loginUser)) ? true : false;
                if (this.permissionToggle) {
                  this.statusObj = { 'status': outer.status, 'statusSequence': outer.statusSequence };
                  this.totalStatusCount = havePermission.processStatusPolicies.length;
                  console.log(this.statusObj)
                }
                else {
                  this.totalStatusCount = 0;
                }
              }
              else {
                this.permissionToggle = this.permissionToggle ? this.permissionToggle : false;
                if (!this.permissionToggle) {
                  this.totalStatusCount = 0;
                }
              }
            });
          } else {
            this.permissionToggle = false;
            this.totalStatusCount = 1;
          }
        }
        else {
          this.permissionToggle = false;
          this.totalStatusCount = 1;
        }
      } else {
        this.permissionToggle = false;
        this.totalStatusCount = 1;
      }
    })
  }
  ngAfterViewInit(): void {
    // this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  validateDecimal(arr, key, i) {
    this[arr][i][key] = DecimalUtils.enterLimitedDecimals(this[arr][i][key], 10);

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
    const final = Object.assign({ "workType": "Cycle Counting" }, this.formObj);
    this.common.fetchAllExecutionIDName(final).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsNamesList = response.data.wareHouseTeams.map(x => x.executiveIDName);
        }
      })

    if (this.id) {
      this.exisitingRecordDetails(1, this.cycleCountingForm.controls.orderStatus.value);
    }
  }
  exisitingRecordDetails(page?, orderStatus?, goTOSave?) {
    if (goTOSave) {
      this.save(goTOSave);
    }
    if (orderStatus == 'Draft') {
      this.productLinesData = [];
      const form = {
        "cycleCode": this.cycleCountingForm.controls.cycleCode.value,
        "criteriaType": this.cycleCountingForm.controls.criteriaType.value,
        "criteriaTypeValues": this.cycleCountingForm.controls.criteriaTypeValues.value,
        "page": page ? page : 1,
        "pageSize": this.itemsPerPage,
        "sortDirection": this.sortDirection,
        "sortFields": this.sortFields,
        "searchOnKeys": PaginationConstants.cycleCountingTableKeys,
        "searchKeyword": this.searchKey,
        "inventoryCountingMasterID": this.id ? this.id : null
      }
      const final = Object.assign(form, this.formObj)
      final['organizationInfo'] = this.configService.getOrganization();
      final['wareHouseInfo'] = this.configService.getWarehouse();
      this.configService.getCountingLines(final).subscribe(res => {
        if (res['status'] == 0 && res['data'].inventoryCountingPaginationResponse && res['data'].inventoryCountingPaginationResponse['inventoryCounting']) {
          res['data'].inventoryCountingPaginationResponse['inventoryCounting'].inventoryCountingLines.forEach(element => {
            element.isEdit = false;
          });
          // this.productLinesData = res['data'].inventoryCountingPaginationResponse['inventoryCounting'].inventoryCountingLines;
          this.totalItems = res['data'].inventoryCountingPaginationResponse.totalElements;
          this.headerData = res['data'].inventoryCountingPaginationResponse.inventoryCounting;
          this.wmsService.passTableData = res['data'].inventoryCountingPaginationResponse['inventoryCounting'].inventoryCountingLines;
          this.linesContinution(res['data'].inventoryCountingPaginationResponse['inventoryCounting'], goTOSave);
        }
      })
    }
    else {
      const final =
      {
        "page": page ? page : this.page,
        "pageSize": this.itemsPerPage,
        "sortDirection": this.sortDirection,
        "sortFields": this.sortFields,
        // "searchOnKeys": PaginationConstants['cycleCountingBindArray'].map(x => x.name),
        "searchOnKeys": null,
        "searchKeyword": this.searchKey,
        "organizationIDName": this.formObj.organizationIDName, 
        "wareHouseIDName": this.formObj.wareHouseIDName,
        "inventoryCountingMasterID": this.id
      }
      this.configService.getCycleCountingIDPagination(final).subscribe(res => {
        if (res['status'] == 0 && res['data'].inventoryCountingPaginationResponse && res['data'].inventoryCountingPaginationResponse.inventoryCounting) {
          const existedOne = res['data'].inventoryCountingPaginationResponse.inventoryCounting;
          if (existedOne.orderStatus == 'Draft') {
            this.cycleCountingForm.controls.cycleCode.setValue(existedOne.cycleCode),
              this.cycleCountingForm.controls.criteriaType.setValue(existedOne.criteriaType),
              this.cycleCountingForm.controls.criteriaTypeValues.setValue(existedOne.criteriaTypeValues),
              this.exisitingRecordDetails(page, existedOne.orderStatus);
          }
          else {
            this.headerData = res['data'].inventoryCountingPaginationResponse.inventoryCounting;
            this.totalItems = res['data']['inventoryCountingPaginationResponse'].totalElements;
            this.linesContinution(existedOne, goTOSave);
          }
        }
      })
    }
  }
  linesContinution(existedOne, goTOSave) {
    if (existedOne.statusStages && existedOne.statusStages.length > 0 && existedOne.statusStages[existedOne.statusStages.length - 1].status == 'Rejected') {
      this.approveCCcheck = true;
    }
    if (this.headerData.statusStages.length && (this.headerData.statusStages[this.headerData.statusStages.length - 1].status == 'Rejected' ||
      this.headerData.statusStages[this.headerData.statusStages.length - 1].status == 'Completed')) {
      this.disableToggle = true;
    }
    else {
      this.disableToggle = false;
    }
    this.getCriteria(existedOne.criteriaType, 'forD');
    this.selected = existedOne.criteriaTypeValues;
    this.getDropdownSettings(existedOne.countingType);
    this.cycleCountingForm.patchValue(existedOne);
    this.wmsService.PassCycleCounting = existedOne;
    this.selectedEmployees = existedOne.wareHouseTeamInfos ? existedOne.wareHouseTeamInfos.map(x => x.executiveIDName) : null;
    if (existedOne.status == 'Completed') {
      this.cycleCountingForm.controls.countingType.disable();
      this.makeThisDisable = true;
    }
    if (existedOne.inventoryCountingLines && existedOne.inventoryCountingLines.length > 0) {
      this.productLinesData = existedOne.inventoryCountingLines;
      this.productLinesData.forEach(element => {
        element.isEdit = false;
      });
      // this.dtTrigger.next();
      this.selectAllCheckboxValue = this.productLinesData.every(function (item: any) {
        return item.freezeInventory == true;
      })
    }
    else {
      this.setUserstoForm('Criteria', 'forD');
    }
    this.dropdownDisabled = true;
  }
  getCriteria(event, fromEdit?) {
    this.selected = null;
    this.supplierIDNames = [];
    this.cycleCountingForm.controls.criteriaTypeValues.setValue([]);
    this.dropdownList = [];
    let filteredData = [];
    if (!fromEdit) {
      this.productLinesData = [];
      // this.rerender();
      // this.dtTrigger.next();
    }
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
        (!this.id) ? this.setUserstoForm('Criteria') : '';
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
  setUserstoForm(key, Edit?) {
    if (this.permissionsList.includes('Update')) {
      if (key == 'Criteria') {
        if (!this.dropdownDisabled) {
          // this.cycleCountingForm.controls.criteriaTypeValues.setValue(this.selected);
          if (typeof (this.selected) == 'object') {
            this.cycleCountingForm.controls.criteriaTypeValues.setValue(this.selected);
          }
          else {
            this.cycleCountingForm.controls.criteriaTypeValues.setValue([this.selected]);
          }
          // if (this.cycleCountingForm.controls.criteriaType.value == 'Warehouse') {


          // }
          if (this.selected && this.selected.length > 0) {
            // if (this.productLinesData.length === 0) {
            this.getProductLines(Edit, 1);
            // }
          }
          else {
            // this.rerender();
            // this.dtTrigger.next();
          }
        }
      }
      else if (key == 'emp') {
        this.cycleCountingForm.controls.wareHouseTeamInfos.setValue(null);
        this.cycleCountingForm.controls.wareHouseTeamInfo1.setValue(null);
        this.cycleCountingForm.controls.wareHouseTeamInfo2.setValue(null);
        if (this.selectedEmployees && this.selectedEmployees.length > 0) {
          let pushObj = []
          this.selectedEmployees.forEach((element, i) => {
            pushObj.push(this.frameWarehouseTeamInfo(element));
            if (i == 0) {
              this.cycleCountingForm.controls.wareHouseTeamInfo1.setValue(this.frameWarehouseTeamInfo(element));
            }
            if (i == 1) {
              this.cycleCountingForm.controls.wareHouseTeamInfo2.setValue(this.frameWarehouseTeamInfo(element));
            }
          });
          this.cycleCountingForm.controls.wareHouseTeamInfos.setValue(pushObj);
        }
      }
    }
  }
  frameWarehouseTeamInfo(idName) {
    const filteredTeam = this.wareHouseTeamsList.find(x => x.executiveIDName == idName);
    return {
      "executiveID": filteredTeam.executiveID,
      "executiveIDName": filteredTeam.executiveIDName,
      "executiveName": filteredTeam.executiveName,
      "_id": filteredTeam._id,
      "executiveFirstName": filteredTeam.executiveFirstName,
      "executiveLastName": filteredTeam.executiveLastName
    }
  }
  fetchAllD(page, event) {
    if (event) {
      this.itemsPerPage = event;
      if (this.id) {
        this.exisitingRecordDetails(page, this.cycleCountingForm.controls.orderStatus.value)
      }
      else {
        this.getProductLines(null, page);
      }
    }
  }
  getPageDetails(page, goTOSave) {
    if (this.id) {
      this.exisitingRecordDetails(page, this.cycleCountingForm.controls.orderStatus.value, goTOSave)
    }
    else {
      this.getProductLines(null, page);
    }
  }
  setDirection(type, headerName) {
  
    this.sortDirection = type;
    let arr: any = PaginationConstants['createcycleCountingArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.getProductLines(null, this.page);
  }
  getProductLines(Edit?, page?) {
    this.productLinesData = [];
    // (!Edit) ? this.rerender() : '';
    const form = {
      "cycleCode": this.cycleCountingForm.controls.cycleCode.value,
      "criteriaType": this.cycleCountingForm.controls.criteriaType.value,
      "criteriaTypeValues": this.cycleCountingForm.controls.criteriaTypeValues.value,
      "page": page,
      "pageSize": this.itemsPerPage,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      // "searchOnKeys": PaginationConstants['cycleCountingBindArray'].map(x => x.name),
      "searchOnKeys": null,
      "searchKeyword": this.searchKey,
      "inventoryCountingMasterID": this.id ? this.id : null
    }
    ///this.wmsService.PassCycleCounting = form
    const final = Object.assign(form, this.formObj)
    final['organizationInfo'] = this.configService.getOrganization();
    final['wareHouseInfo'] = this.configService.getWarehouse();
    this.configService.getCountingLines(final).subscribe(res => {
      if (res['status'] == 0 && res['data'].inventoryCountingPaginationResponse['inventoryCounting']) {
        res['data'].inventoryCountingPaginationResponse['inventoryCounting'].inventoryCountingLines.forEach(element => {
          element.isEdit = false;
        });
        this.productLinesData = res['data'].inventoryCountingPaginationResponse['inventoryCounting'].inventoryCountingLines;
        this.totalItems = res['data'].inventoryCountingPaginationResponse.totalElements;
        this.wmsService.passTableData = this.productLinesData;
        // this.dtTrigger.next();
      }
    })
  }
  manipulateOriginalData(value, key, data) {
    if (value) {
      data[key] = parseFloat(value);
    }
    else {
      data[key] = null;
    }
  }
  createForm() {
    if (this.role == 'EMPLOYEE' && this.id) {
      this.makeThisDisable = true;
      this.dropdownDisabled = true;
      this.cycleCountingForm = this.fb.group({
        _id: null,
        actualCycleCountingDate: null,
        "cycleCode": [{ value: null, disabled: true }],
        cycleCountingCode: null,
        cycleCountingCodePrefix: null,
        fullCycleCountingCode: null,
        "criteriaType": [{ value: null, disabled: true }, this.customValidators.required],
        "criteriaTypeValues": [{ value: null, disabled: true }, this.customValidators.required],
        countingType: [{ value: null, disabled: true }, this.customValidators.required],
        wareHouseTeamInfos: null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
        "wareHouseTeamInfo1": null,
        "wareHouseTeamInfo2": null,
        "createdDate": this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
        "lastUpdatedDate": null,
        "countingSelectedUser": null,
        "plannedScheduleDate": null,
        "statusStage": null,
        "statusStages": [],
        'orderStatus': null,
      })
    }
    else {
      this.cycleCountingForm = this.fb.group({
        _id: null,
        actualCycleCountingDate: null,
        "cycleCode": null,
        cycleCountingCode: null,
        cycleCountingCodePrefix: null,
        fullCycleCountingCode: null,
        "criteriaType": [null, this.customValidators.required],
        "criteriaTypeValues": [null, this.customValidators.required],
        countingType: [null, this.customValidators.required],
        wareHouseTeamInfos: null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
        "wareHouseTeamInfo1": null,
        "wareHouseTeamInfo2": null,
        "createdDate": this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
        "lastUpdatedDate": null,
        "countingSelectedUser": null,
        "plannedScheduleDate": null,
        "statusStage": null,
        "statusStages": [],
        orderStatus: null
      })
    }

  }
  getDropdownSettings(event) {
    this.selectedEmployees = null;
    if (event == 'Single') {
      this.dropdownSettingsUser = {
        multiselect: false,
        singleSelection: true,
        idField: '_id',
        textField: 'users',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 2,
        limitSelection: 10,
        allowSearchFilter: true,
      }
    }
    else if (event == 'Double') {
      this.dropdownSettingsUser = {
        multiselect: false,
        singleSelection: false,
        idField: '_id',
        textField: 'users',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 2,
        limitSelection: 2,
        allowSearchFilter: true,
      }
    }
  }
  createConfirm() {
    const form = this.cycleCountingForm.value;
    if (form.criteriaType == 'Supplier') {
      form.criteriaType = 'Product';
    }
    form['inventoryCountingLines'] = null
    this.configService.updateCCorderStatus(form).subscribe(data => {
      if (data.status == 0 && data['data']['inventoryCounting']) {
        this.toastr.success("Success");
        this.clear();
        this.id = data['data']['inventoryCounting']._id;
        this.cycleCountingForm.controls.orderStatus.setValue(data['data']['inventoryCounting'].orderStatus);
        this.exisitingRecordDetails(1, data['data']['inventoryCounting'].orderStatus);
      }
    })
  }
  save(goTOSave) {
    if (this.permissionsList.includes('Update')) {
      const form = this.cycleCountingForm.value;
      console.log(form);
      this.wmsService.PassCycleCounting = form;
      if (form.criteriaType == 'Supplier') {
        form.criteriaType = 'Product';
      }
      form['inventoryCountingLines'] = this.productLinesData;
      this.configService.saveorUpdateCycleCounting(form).subscribe(data => {
        if (data.status == 0 && data['data']['inventoryCounting']) {
          this.id = data['data']['inventoryCounting']._id;
          if (!goTOSave) {
            this.toastr.success("Saved Successfully");
            this.clear();
            this.createForm();
            this.cycleCountingForm.controls.orderStatus.setValue(data['data']['inventoryCounting'].orderStatus)
            // this.dtTrigger.next();
            this.cycleCountingForm.controls.cycleCode.setValue(data['data']['inventoryCounting'].cycleCode),
              this.cycleCountingForm.controls.criteriaType.setValue(data['data']['inventoryCounting'].criteriaType),
              this.cycleCountingForm.controls.criteriaTypeValues.setValue(data['data']['inventoryCounting'].criteriaTypeValues),
              this.exisitingRecordDetails(this.page, data['data']['inventoryCounting'].orderStatus);
          }
        }
      })
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  clear() {
    this.createForm();
  }
  setFreeze(event) {
    if (this.productLinesData.length > 0) {
      this.productLinesData.forEach(data => {
        data['freezeInventory'] = event.target.checked;
      });
    }
    else {
      this.toastr.error("No inventory to freeze")
      event.target.checked = false;
    }
  }
  edit(data) {
    if (this.permissionsList.includes('Update')) {
      this.productLinesData.map(element => element.isEdit = false);
      data.isEdit = true;
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  updateInventory() {
    if (this.permissionsList.includes('Update')) {
      const form = this.cycleCountingForm.value
      if (this.id || this.cycleCountingForm.controls._id.value) {
        const payload = this.productLinesData.find(element => element.isEdit == true);
        if (payload) {
          const formValue = this.cycleCountingForm.value;
          formValue['inventoryCountingLines'] = [payload];
          form['statusStage'] = this.headerData.statusStage;
          form['statusStages'] = this.headerData.statusStages;
          this.wmsService.passingFormDataValue = formValue
          this.configService.updateSingleInvCountingLine(formValue).subscribe(res => {
            if (res['status'] == 0) {
              this.toastr.success('Updated');
              if (this.id) {
                const final = {
                  "page": this.page,
                  "pageSize": this.itemsPerPage,
                  "sortDirection": this.sortDirection,
                  "sortFields": this.sortFields,
                  // "searchOnKeys": PaginationConstants['cycleCountingBindArray'].map(x => x.name),
                  "searchOnKeys": null,
                  "searchKeyword": this.searchKey,
                  "organizationIDName": this.formObj.organizationIDName,
                  "wareHouseIDName": this.formObj.wareHouseIDName,
                  "inventoryCountingMasterID": this.id
                }
                this.configService.getAllInventoryCountingWithPaginations(final).subscribe(res => {
                  if (res['status'] == 0 && res['data'].inventoryCountingPaginationResponse && res['data'].inventoryCountingPaginationResponse.inventoryCountings.length > 0) {
                    const existedOne = res['data'].inventoryCountingPaginationResponse.inventoryCountings[0];

                    this.cycleCountingForm.controls._id.patchValue(existedOne._id);
                    if (res['data'].inventoryCountingPaginationResponse.inventoryCountings[0].statusStages.length && (res['data'].inventoryCountingPaginationResponse.inventoryCountings[0].statusStages[res['data'].inventoryCountingPaginationResponse.inventoryCountings[0].statusStages.length - 1].status == 'Rejected' ||
                      res['data'].inventoryCountingPaginationResponse.inventoryCountings[0].statusStages[res['data'].inventoryCountingPaginationResponse.inventoryCountings[0].statusStages.length - 1].status == 'Completed')) {
                      this.disableToggle = true;
                    }
                    else {
                      this.disableToggle = false;
                    }
                    // this.dtTrigger.next();
                    this.productLinesData = existedOne.inventoryCountingLines;
                    if (this.productLinesData && this.productLinesData.length > 0) {
                      this.productLinesData.forEach(element => {
                        element.isEdit = false;
                      });
                    }
                    this.totalItems = res['data']['inventoryCountingPaginationResponse'].totalElements;
                  }
                })
              }
            } else {
              if (res['status'] == 2) {
                this.toastr.error(res.statusMsg);
              }
            }
          })
        }
      }
      else {
        this.toastr.error("Save Details for Update.")
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  openModal() {
    if (this.permissionsList.includes('Update')) {
      const form = this.cycleCountingForm.value;
      console.log(this.headerData)
      let checkLinesEntry = true;
      if (form.countingType == 'Double' && form.wareHouseTeamInfos.length == 2) {
        // checkLinesEntry = this.productLinesData.every(function (item: any) {
        //   return item.counter1Quantity && item.counter2Quantity;
        // })
        this.productLinesData.forEach(element => {
          if (checkLinesEntry) {
            if ((!element.counter1Quantity && element.counter1Quantity != 0) || (!element.counter2Quantity && element.counter2Quantity != 0)) {
              checkLinesEntry = false;
            }
          }
        });
        if (checkLinesEntry) {
          this.ngxSmartModalService.getModal('ccConfig').open();
          this.counterValue1 = false;
          this.counterValue2 = false;
        }
        else {
          this.toastr.error("Enter Quantities to Proceed");
        }
      }
      else if (form.countingType == 'Single') {
        this.productLinesData.forEach(element => {
          if (checkLinesEntry) {
            if (!element.counter1Quantity && element.counter1Quantity != 0) {
              checkLinesEntry = false;
            }
          }
        });
        if (checkLinesEntry) {
          this.cycleCountingForm.controls.countingSelectedUser.patchValue("Counter1");
          (this.permissionToggle || (!this.permissionToggle && this.totalStatusCount == 0)) ? this.perform() : this.noApprovalsPerform();
        }
        else {
          this.toastr.error("Enter Quantities to Proceed");
        }
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  setCounterforPerform(key) {
    this.cycleCountingForm.controls.countingSelectedUser.setValue(key);
  }
  noApprovalsPerform(key?) {
    if (key) {
      this.headerData.statusStage = {
        status: 'Rejected',
        statusSequence: null
      }
      this.performContinue(key);
    }
    else {
      this.headerData.statusStage = {
        status: 'Confirmed',
        statusSequence: null
      }
      this.performContinue();
    }
  }
  perform(key?) {
    if (this.permissionsList.includes("Update")) {
      if (this.id) {
        if (key) {
          if (this.permissionToggle && this.headerData.statusStages && this.statusObj) {
            if (this.headerData.statusStages[this.headerData.statusStages.length - 1].statusSequence == this.statusObj.statusSequence) {
              this.headerData.statusStage = {
                status: 'Rejected',
                statusSequence: this.statusObj.statusSequence + 1
              }
              this.performContinue(key);
            }
            else {
              this.toastr.error('No Scope for Reject');
            }
          }
          else {
            this.toastr.error('No Scope for Raise');
          }
        }
        else {
          if (this.permissionToggle && this.headerData.statusStages && this.statusObj) {
            if (this.totalStatusCount == this.headerData.statusStages[this.headerData.statusStages.length - 1].statusSequence) {
              this.headerData.statusStage = {
                status: this.statusObj.status,
                statusSequence: this.statusObj.statusSequence + 1
              }
              this.performContinue();
            }
            else if (this.headerData.statusStages[this.headerData.statusStages.length - 1].statusSequence == this.statusObj.statusSequence) {
              this.headerData.statusStage = {
                status: this.statusObj.status,
                statusSequence: this.statusObj.statusSequence + 1
              }
              this.performContinue();
            }
            else {
              this.toastr.error('No Scope for Raise');
            }
          }
          else {
            this.toastr.error('No Scope for Raise');
          }
        }
      } else {
        this.toastr.error('Save details before raising CC');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  performContinue(key?) {
    if (key) {
      this.ngxSmartModalService.getModal('ccConfig').close();
      const form = this.cycleCountingForm.value;
      form['inventoryCountingLines'] = this.productLinesData;
      form['statusStage'] = this.headerData.statusStage;
      form['statusStages'] = this.headerData.statusStages;
      this.configService.rejectCycleCounting(form).subscribe(data => {
        if (data.status == 0) {
          this.toastr.success("Cycle Counting rejected Successfully");
          this.router.navigate(['/v1/inventory/maintaincyclecounting'])
        }
        else {
          if (data.status == 2) {
            this.toastr.error(data.statusMsg);
          }
        }
      })
    } else {
      this.ngxSmartModalService.getModal('ccConfig').close();
      const form = this.cycleCountingForm.value;
      form['inventoryCountingLines'] = this.productLinesData;
      form['statusStage'] = this.headerData.statusStage;
      form['statusStages'] = this.headerData.statusStages;
      this.configService.performCycleCounting(form).subscribe(data => {
        if (data.status == 0) {
          this.toastr.success("Performed Successfully");
          this.router.navigate(['/v1/inventory/maintaincyclecounting'])
        }
        else {
          if (data.status == 2) {
            this.toastr.error(data.statusMsg);
          }
        }
      })
    }
  }
  exportAsXLSX() {
    const changedProductList = this.exportTypeMethod(this.productLinesData)
    this.excelService.exportAsExcelFile(changedProductList, 'Cycle Counting', null);
  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        console.log(ele);
        const obj = {}
        obj['productIDName'] = ele.productMasterInfo.productIDName
        obj['locationName'] = ele.locationInfo.locationName
        obj['availableQuantity'] = ele.availableQuantity
        obj['quantityInventoryUnit'] = ele.quantityInventoryUnit
        obj['inventoryUnit'] = ele.inventoryUnit
        obj['variance'] = ele.variance
        obj['variancePercentage'] = ele.variancePercentage
        arr.push(obj)
        console.log(arr)
      })
    }
    else {
      const obj = {}
      obj['productIDName'] = null
      obj['locationName'] = null
      obj['availableQuantity'] = null
      obj['quantityInventoryUnit'] = null
      obj['inventoryUnit'] = null
      obj['variance'] = null
      obj['variancePercentage'] = null
      arr.push(obj)
    }
    return arr
  }
  generatePDF() {
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 300);

  }

}
