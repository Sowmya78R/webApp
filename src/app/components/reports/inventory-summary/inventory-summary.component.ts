import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ReportsCommonService } from '../../../services/reports-common.service';
import { ReportsService } from '../../../services/integration-services/reports.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inventory-summary',
  templateUrl: './inventory-summary.component.html'
})
export class InventorySummaryComponent implements OnInit, AfterViewInit, OnDestroy {


  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  inventoryForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  productIDNameValues: CompleterData;
  warehouseNameValues: CompleterData;
  zoneNameValues: CompleterData;
  rackNameValues: CompleterData;
  levelNameValues: CompleterData;
  locationNameValues: CompleterData;
  inventoryData: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inventory', 'Inventory Summary', Storage.getSessionUser());
  inventoryKeys: any = ['','','','','','','','',''];
  forPermissionsSubscription:any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  constructor(private toastr: ToastrService, private wmsService: WMSService,
    private reportsService: ReportsService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService, private configService: ConfigurationService,private datepipe:DatePipe,
    private translate: TranslateService,) {
      this.translate.use(this.language);
     }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  //  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
  //     if (data) {
  //       this.formObj = this.configService.getGlobalpayload();
  //       if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
  //         this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
  //           'Inventory', 'Inventory Summary', Storage.getSessionUser());
  //       }
  //       this.getFunctionsCall();
  //     }
  //   })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if(this.permissionsList.includes('View')){
      this.createInventoryForm();
      this.fetchMetaData();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  generate() {
    this.inventoryForm.value.fromDate = this.inventoryForm.value.fromDate ? new Date(this.inventoryForm.value.fromDate) : null;
    this.inventoryForm.value.toDate = this.inventoryForm.value.toDate ? new Date(this.inventoryForm.value.toDate) : null;
    this.inventoryForm.value.wareHouseName = this.inventoryForm.value.wareHouseName ?this.inventoryForm.value.wareHouseName : null;
    this.inventoryForm.value.zoneName = this.inventoryForm.value.zoneName ?this.inventoryForm.value.zoneName : null;
    this.inventoryForm.value.rackName = this.inventoryForm.value.rackName ?this.inventoryForm.value.rackName : null;
    this.inventoryForm.value.levelName = this.inventoryForm.value.levelName ?this.inventoryForm.value.levelName : null;
    this.inventoryForm.value.locationName = this.inventoryForm.value.locationName ?this.inventoryForm.value.locationName : null;
    this.inventoryForm.value.productIDName = this.inventoryForm.value.productIDName ?this.inventoryForm.value.productIDName : null;
    this.wmsService.inventorySummaryFormDataPassing = this.inventoryForm.value

    this.reportsService.fetchInventoryReport(JSON.stringify(this.inventoryForm.value)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryReportResponseList) {
          this.inventoryData = response.data.inventoryReportResponseList;
          this.wmsService.inventorySummaryyReportsDisplayTableList = this.inventoryData
          this.rerender();
        } else {
          this.toastr.error('No Data to fetch with this Filter');
        }
      },
      (error) => {
      });
  }
  clear() {
    this.inventoryForm.reset();
    this.createInventoryForm();
  }
 /*  exportAsXLSX() {
    if (this.inventoryData.length) {
      this.excelService.exportAsExcelFile(this.inventoryData, 'Inventory-Report', null);
    } else {
      this.toastr.error('No data available');
    }
  } */

  exportAsXLSX(){

    if (this.inventoryData.length) {
      const changedPutawayList = this.exportTypeMethod(this.inventoryData)
      this.excelService.exportAsExcelFile(changedPutawayList, 'Inventory Summary Report', null);
    } else {
      this.toastr.error('No data available');
    }
  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['Product IDName'] = k.productIDName
        obj['UOM'] = k.inventoryUnit
        obj['Available Quantity'] = k.availableQuantity
        obj['locationName'] = k.locationName
        obj['createdDate'] = k.createdDate ? this.datepipe.transform(new Date(k.createdDate), 'yyyy-MM-dd') : null
        obj['serialNumber'] = k.serialNumber
        obj['batchNumber'] = k.batchNumber
        obj['mfgDate'] = k.mfgDate
        obj['expiryDate'] = k.expiryDate
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Product IDName'] = null
      obj['UOM'] = null
        obj['Available Quantity'] = null
        obj['locationName'] =null
        obj['createdDate'] =null
        obj['serialNumber'] = null
        obj['batchNumber'] = null
        obj['mfgDate'] = null
        obj['expiryDate'] =null
      arr.push(obj)
    }
    return arr

  }

  fetchMetaData() {
    this.reportsCommonService.fetchAllProducts();
    this.reportsCommonService.productIDNameValues.subscribe(res => {
      this.productIDNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllWarehouses();
    this.reportsCommonService.warehouseNameValues.subscribe(res => {
      this.warehouseNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllZones();
    this.reportsCommonService.zoneNameValues.subscribe(res => {
      this.zoneNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllRacks();
    this.reportsCommonService.rackNameValues.subscribe(res => {
      this.rackNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllLevels();
    this.reportsCommonService.levelNameValues.subscribe(res => {
      this.levelNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllLocations();
    this.reportsCommonService.locationNameValues.subscribe(res => {
      this.locationNameValues = this.completerService.local(res);
    });
  }
  createInventoryForm() {
    this.inventoryForm = new FormBuilder().group({
      wareHouseName: [null],
      zoneName: [null],
      rackName: [null],
      levelName: [null],
      locationName: [null],
      productIDName: [null],
      toDate: [null],
      fromDate: [null],
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,

    });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  //  this.forPermissionsSubscription.unsubscribe();
  }
  generatePDF(){
    if(this.inventoryData.length > 0){
    if (this.permissionsList.includes('Update')) {
      this.emitTripSheet.emit();
      setTimeout(() => {
        window.print();
      }, 300);
  }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  else{
    this.toastr.error("No Data to print")

  }
}
}
