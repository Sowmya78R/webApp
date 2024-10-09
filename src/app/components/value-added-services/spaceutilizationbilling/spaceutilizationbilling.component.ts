import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData, CompleterService } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-spaceutilizationbilling',
  templateUrl: './spaceutilizationbilling.component.html',
  styleUrls: ['./spaceutilizationbilling.component.scss']
})
export class SpaceutilizationbillingComponent implements OnInit {

  @Output() emitTripSheet: any = new EventEmitter<any>();

 

  
  tableHeadings: any = ['S.No', 'Date', 'Opening Balance', 'In', 'Out', 'Occupied', 'pallet', 'Supplier IDName','Zone Names'];
  tripInput: any;
  formObj = this.configService.getGlobalpayload();
  spaceUtilizationBillingPermission = this.configService.getPermissions('mainFunctionalities', 'Billing', 'Space Utilization Billing', Storage.getSessionUser());
  spaceUtilizationBillingForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  totalInObj: any;
  totalOccupiedObj: any;
  totalOpeningBalanceObj: any;
  totalOutObj: any;
  averageSpaceOccupiedObj: any;
  thirdPartySpaceUtilizationReportResponseList: any;
  no: any;
  thirdPartySpaceUtilizationResponceList: any;
  displaySpaceUtilizationListValues: any;
  thirdPartySpaceUtilizationObjResponce: any;
  hidePanel: boolean = false;
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

  constructor(private configService: ConfigurationService,
    private wmsService: WMSService,
    private completerService: CompleterService,
    private excelService: ExcelService, private fb: FormBuilder, private toastr: ToastrService, private datepipe: DatePipe,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }


  ngOnInit() {
    this.createSpaceUtilizationBillingForm();
    this.fetchAllSupplierDetails();
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
  createSpaceUtilizationBillingForm() {
    this.spaceUtilizationBillingForm = this.fb.group({
      supplierIDName: [null],
      dateFrom: [null],
      dateTo: [null],
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    })
  }
  getZoneDetails(event) {
    if (event) {
      const form = this.formObj;
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

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  } 

  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  setDirection(type, headerName) {
    this.sortDirection = type;
 //   let arr: any = PaginationConstants['inventoryTransactionBindArray'].find(x => x.key == headerName);
   // this.sortFields = [arr.name];
    this.generate(this.page, this.itemsPerPage);
  }
  decimalAverageSpaceOccupiedobj:any
  generate(page?,pageSize?) {
    if (this.spaceUtilizationBillingPermission.includes('Update')) {
      const form = this.spaceUtilizationBillingForm.value;
      form['zoneNames'] = this.zoneNames;
      form['page'] = page? page : 1,
      form['pageSize'] = this.itemsPerPage
      this.wmsService.getFormDetails = form;
      this.wmsService.fetchAllBillingSpaceUtiliztion(form).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.thirdPartySpaceUtilizationObjResponce = response.data.thirdPartySpaceUtilizationReportResponse.thirdPartySpaceUtilizationPaginationResponse.thirdPartySpaceUtilizations
            this.thirdPartySpaceUtilizationResponceList = response.data.thirdPartySpaceUtilizationReportResponse.thirdPartySpaceUtilizationPaginationResponse.thirdPartySpaceUtilizations;
            this.wmsService.dataPassinspaceUtilizationBillingResponse = this.thirdPartySpaceUtilizationResponceList;
            this.totalInObj = response.data.thirdPartySpaceUtilizationReportResponse.totalIn
            this.totalItems  = response.data.thirdPartySpaceUtilizationReportResponse.thirdPartySpaceUtilizationPaginationResponse.totalElements
            this.totalOccupiedObj = response.data.thirdPartySpaceUtilizationReportResponse.totalOccupied
            this.totalOpeningBalanceObj = response.data.thirdPartySpaceUtilizationReportResponse.totalOpeningBalance
            this.totalOutObj = response.data.thirdPartySpaceUtilizationReportResponse.totalOut
            this.averageSpaceOccupiedObj = response.data.thirdPartySpaceUtilizationReportResponse.averageSpaceOccupied
            this.decimalAverageSpaceOccupiedobj = this.averageSpaceOccupiedObj

            this.wmsService.receivedThirdPartySpaceUtilizationObject = this.thirdPartySpaceUtilizationObjResponce;
            this.no = 1;
            this.zoneNames = [];
            this.hidePanel = true;
            this.rerender();
          }
        },
        (error) => {
        });
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
  }
  clear() {
    this.spaceUtilizationBillingForm.reset();
    this.zoneNames = [];
  }
  supplierList: any;
  supplierIDNames: any;
  dataService: CompleterData
  fetchAllSupplierDetails() {
    this.supplierList = [];
    this.supplierIDNames = [];
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierList = response.data.supplierMasters;
          this.supplierIDNames = this.supplierList.map(x => x.supplierIDName);
          this.dataService = this.completerService.local(this.supplierIDNames);
        }
      })
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  /*
  exportAsXLSX() {
    if (this.thirdPartySpaceUtilizationResponceList) {
      this.excelService.exportAsExcelFile(this.thirdPartySpaceUtilizationObjResponce.thirdPartySpaceUtilizations,
        'Space Utilization Billing', Constants.EXCEL_IGNORE_FIELDS.SPACEUTILIZATIONBILLING);
    } else {
      this.toastr.error('No data available');
    }
  } */
  exportAsXLSX() {
    if (this.spaceUtilizationBillingPermission.includes('Update')) {
      const changedTaskList = this.exportTypeMethod(this.thirdPartySpaceUtilizationResponceList)
      this.excelService.exportAsExcelFile(changedTaskList, 'Third Party Space Utilization',
        Constants.EXCEL_IGNORE_FIELDS.VEHICLEBYSERVICEPROVIDER, this.thirdPartySpaceUtilizationObjResponce);
    }
    else {
      this.toastr.error('User doesnt have permissions');
    }
  }
  exportTypeMethod(data) {
    const arr = [];
    if (data && data.length) {
      console.log(data)
      data.forEach(ele => {
        if (ele) {
          const obj = {}
          obj['supplierIDName'] = ele.supplierIDName
          obj['date'] = ele.date ? this.datepipe.transform(new Date(ele.date), 'dd/MM/yyyy') : null
          obj['in'] = ele.in
          obj['out'] = ele.out
          obj['openingBalance'] = ele.openingBalance
          obj['occupied'] = ele.occupied
          obj['openingBalanceUom'] = ele.openingBalanceUom
          obj['pallet'] = ele.pallet
          arr.push(obj)
          console.log(obj)
        }
        else {
          const obj = {}
          obj['supplierIDName'] = null
          obj['date'] = null
          obj['in'] = null
          obj['out'] = null
          obj['openingBalance'] = null
          obj['openingBalanceUom'] = null
          obj['occupied'] = null
          obj['pallet'] = null
          arr.push(obj)
        }
      })
      return arr
    } else {
      const obj = {}
      obj['supplierIDName'] = null
      obj['date'] = null
      obj['in'] = null
      obj['out'] = null
      obj['openingBalance'] = null
      obj['openingBalanceUom'] = null
      obj['occupied'] = null
      obj['pallet'] = null
      arr.push(obj)
    }
    return arr
  }
  generatePDF() {
    if (this.spaceUtilizationBillingPermission.includes('Update')) {
      this.emitTripSheet.emit();
      setTimeout(() => {
        window.print();
      }, 300);
    }
  }
}

