import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData, CompleterService } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
@Component({
  selector: 'app-accountingspaceutilization',
  templateUrl: './accountingspaceutilization.component.html',
  styleUrls: ['./accountingspaceutilization.component.scss']
})
export class AccountingspaceutilizationComponent implements OnInit {
  id: any;
  dtOptions: DataTables.Settings = {};
  accountingspaceUtilizationPermission = this.configService.getPermissions('mainFunctionalities', 'Billing', 'Space Utilization', Storage.getSessionUser());
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: Subject<any> = new Subject();

  tableHeadings:any=['S.No','Supplier','Zone','Date','Total Area','Openinng Balance','In','Out','Occupied'
  ,'Pallet','Opening Balance','Action']
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  accountingSpaceUtilizationForm: FormGroup
  formObj = this.configService.getGlobalpayload();
  number: number = 5
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  zoneValueDetailsIds: CompleterData;
  zoneNames: any = [];
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

  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private wmsService: WMSService, private toastr: ToastrService,
    private metaDataService: MetaDataService, private completerService: CompleterService, public ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  ngOnInit() {
    this.cretateAccountingSpaceUtilizationForm();
    this.fetchAllUnits();
    this.fetchAllSupplierDetails();
    this.fetchAllThirdPartySpaceUtilizationDetails();
    this.fetchAllZones();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  getZoneDetails(event) {
    if (event) {
      const form = JSON.parse(JSON.stringify(this.formObj));
      form['supplierIDName'] = event.originalObject;
      this.configService.getAllSUConfig(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].spaceUtilizationConfigurations) {
          const zone = res['data'].spaceUtilizationConfigurations.find(x => x.supplierIDName == event.originalObject)
          this.zoneNames = zone ? zone.zoneNames : null;
        }
      })
    }
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          if (response.data.zones.length > 0) {
            this.zoneValueDetailsIds = response.data.zones.map(y => y.zoneName);
          } else {
          }
        } else {
        }
      },
      (error) => {
      });
  }
  cretateAccountingSpaceUtilizationForm() {
    this.accountingSpaceUtilizationForm = this.fb.group({
      "supplierIDName": [null, Validators.required],
      "fromDate": [null, Validators.required],
      "toDate": [null, Validators.required],
      "openingBalance": [null],
      "openingBalanceUom": [null],
      //  'organizationInfo': this.configService.getOrganization(),
      //  'wareHouseInfo': this.configService.getWarehouse()
    })
  }
  generate() {
    const formDetails = this.accountingSpaceUtilizationForm.value;
    const values = {
      "supplierIDName": formDetails.supplierIDName,
      "zoneNames": this.zoneNames,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      "openingBalance": formDetails.openingBalance,
      "openingBalanceUom": formDetails.openingBalanceUom,
      "fromDate": formDetails.fromDate,
      "toDate": formDetails.toDate
    }
    this.wmsService.generateSpaceUtilization(values).subscribe(res => {
      if (res['status'] == 0) {
        this.toastr.success(res['statusMsg']);
        this.cretateAccountingSpaceUtilizationForm();
        this.zoneNames = [];
        this.fetchAllThirdPartySpaceUtilizationDetails();
      } else if (res.status == 2) {
        this.toastr.error(res.statusMsg);
      }
    })
  }
  save() {
    if (this.accountingspaceUtilizationPermission.includes('Update')) {
      const formReq = this.accountingSpaceUtilizationForm.value;
      formReq["openingBalance"] = Number(this.accountingSpaceUtilizationForm.value.openingBalance)
      formReq["organizationInfo"] = this.configService.getOrganization(),
        formReq["wareHouseInfo"] = this.configService.getWarehouse(),
        formReq['zoneNames'] = this.zoneNames;
      this.wmsService.saveThirdPartySpaceUtilization(formReq).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.toastr.success(response.statusMsg);
            this.fetchAllThirdPartySpaceUtilizationDetails();
            this.accountingSpaceUtilizationForm.reset();
            this.zoneNames = [];
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);

          } else {
            this.toastr.error('Failed in saving details');
          }
        })
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
  }
  modalReq = {
    in: null,
    out: null,
  }
  getGlobalValue: any;
  catchValue(data, event, i) {
    this.getGlobalValue = event.target.value;
    this.modalReq.in = Number(this.getGlobalValue) ? Number(this.getGlobalValue) : 0
  }
  globalModalReq: any;
  updateFunction(data, event, i) {
    if (this.accountingspaceUtilizationPermission.includes('Update')) {
      this.globalModalReq = Number(event.target.value)
      this.modalReq.out = Number(data.out) ? Number(data.out) : 0
      this.modalReq.in = Number(data.in) ? Number(data.in) : 0
      let reqModa = {
        _id: data._id,
        "supplierIDName": data.supplierIDName,
        "date": data.date,
        "totalArea": data.totalArea,
        "openingBalance": data.openingBalance,
        "occupied": data.occupied,
        "pallet": data.pallet,
        "openingBalanceUom": data.openingBalanceUom,
        "zoneNames": data.zoneNames,
        'organizationInfo': this.configService.getOrganization(),
        'wareHouseInfo': this.configService.getWarehouse(),
        'openingBalanceConversionUom': data.openingBalanceConversionUom,
        'openingBalanceConversionValue': data.openingBalanceConversionValue
      }
      if (data.out < data.occupied) {
        const finalPreparedObj = Object.assign(reqModa, this.modalReq)
        this.wmsService.updateThirdPartySpaceUtilization(finalPreparedObj).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success(response.statusMsg);
              this.fetchAllThirdPartySpaceUtilizationDetails();
            } else if (response && response.status === 2 && response.statusMsg) {
              this.toastr.error(response.statusMsg);
            } else {
              this.toastr.error('Failed in saving details');
            }
          })
      }
      else {
        this.toastr.error("Please enter the data less than Occupied value");
        data.out = 0
      }
    }
    else {
      this.thirdPartySpaceUtilizationsList.forEach(element => {
        element.in = 0;
        element.out = 0;
      })
      this.toastr.error('user doesnt have permission');
    }
  }
  calculationPart(outData, i) {
    console.log(outData);
    console.log(i)
    if (outData) {
      console.log("OutData" + outData);
      const singeObj = {
        singeInOb: outData.in,
        singeOutObj: outData.out,
        singleopeningBalance: outData.openingBalance,
      }
      if (singeObj.singleopeningBalance > singeObj.singeOutObj) {
      }
      else {
        this.toastr.error("Your entered Value of Out " + outData.out + " should not be greater than Opening Balance " + outData.openingBalance);
      }

    }
  }
  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  fetchAllD(page, event) {
    if (event) {
      this.fetchAllThirdPartySpaceUtilizationDetails(page, event.target.value);
    }
  }
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['inventoryTransactionBindArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.fetchAllThirdPartySpaceUtilizationDetails(this.page, this.itemsPerPage);
  }
  thirdPartySpaceUtilizationsList: any = [];
  fetchAllThirdPartySpaceUtilizationDetails(page?,pageSize?) {
    const values = {
      "page": page?page:1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
     "searchOnKeys":null,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName
    }
    this.wmsService.fetchThirdPartySpaceUtilization(values).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.thirdPartySpaceUtilizationPaginationResponse.thirdPartySpaceUtilizations) {
          this.thirdPartySpaceUtilizationsList = response.data.thirdPartySpaceUtilizationPaginationResponse.thirdPartySpaceUtilizations;
          this.totalItems  = response.data.thirdPartySpaceUtilizationPaginationResponse;
          this.rerender();
        }
      },
      (error) => {
      });
  }
  clear() {
    this.zoneNames = [];
    this.accountingSpaceUtilizationForm.reset();
  }
  deleteInfo: any;
  delete(data: any) {
    if (this.accountingspaceUtilizationPermission.includes('Delete')) {
      this.deleteInfo = { name: 'accountingSpaceUtilization', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error('user doesnt have permission to delete');
    }

  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllThirdPartySpaceUtilizationDetails();
    }
  }

  supplierList: any;
  supplierIDNames: any;
  dataService: CompleterData;
  fetchAllSupplierDetails() {
    this.supplierList = [];
    this.supplierIDNames = [];
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierList = response.data.supplierMasters;
          this.supplierIDNames = this.supplierList.map(x => x.supplierIDName);
          this.dataService = this.completerService.local(this.supplierIDNames);
          if (this.id) {
            this.rerender();
          }
        } else {
        }
      },
      (error) => {
        this.supplierList = [];
      });
  }

  unitsList: any;
  fetchAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.units && response.data.units.length) {
          this.unitsList = response.data.units;
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
  filterDataFromDates() {
    const fromSelectedDate = this.accountingSpaceUtilizationForm.value.fromDate;
    const toSelectedDate = this.accountingSpaceUtilizationForm.value.toDate;
    if (this.accountingspaceUtilizationPermission.includes('Update')) {
      if (fromSelectedDate && toSelectedDate && fromSelectedDate <= toSelectedDate) {

      } else {
        this.toastr.error('Select valid date');
        setTimeout(() => {
          this.clearDatePart()
        }, 5000);


      }
    }
    else {
      this.toastr.error("user doesnt have permission");
    }
  }

  clearDatePart() {
    this.accountingSpaceUtilizationForm.controls.fromDate.setValue(null);
    this.accountingSpaceUtilizationForm.controls.toDate.setValue(null);

  }
}
