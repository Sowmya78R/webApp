import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-picklist-report',
  templateUrl: './picklist-report.component.html'
})
export class PicklistReportComponent implements OnInit, AfterViewInit, OnDestroy {
  pickListReportForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  warehouseNameValues: CompleterData;
  zoneNameValues: CompleterData;
  rackNameValues: CompleterData;
  levelNameValues: CompleterData;
  locationNameValues: CompleterData;
  productIDNameValues: CompleterData;
  pickingData: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Outbound', 'Pick List', Storage.getSessionUser());
  pickingKeys: any = ['S.No', 'Picking No', 'Product ID', 'Product Name', 'quantity', 'Location Name', 'Picked Quantity',
    'Picking Executive', 'Created On', 'Completed Date', 'Start Time', 'End Time', 'Status'];
  forPermissionsSubscription: any;
  constructor(private toastr: ToastrService,private datepipe: DatePipe,
    private reportsService: ReportsService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService, private configService: ConfigurationService) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    // this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
    //   if (data) {
    //     this.formObj = this.configService.getGlobalpayload();
    //     if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
    //       this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
    //         'Outbound', 'Pick List', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createpickListReportForm();
      this.fetchMetaData();
    }

  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  generate() {
    this.pickListReportForm.value.wareHouseName = this.pickListReportForm.value.wareHouseName ?  this.pickListReportForm.value.wareHouseName : null;
    this.pickListReportForm.value.zoneName = this.pickListReportForm.value.zoneName ?  this.pickListReportForm.value.zoneName : null;
    this.pickListReportForm.value.rackName = this.pickListReportForm.value.rackName ?  this.pickListReportForm.value.rackName : null;
    this.pickListReportForm.value.levelName = this.pickListReportForm.value.levelName ?  this.pickListReportForm.value.levelName : null;
    this.pickListReportForm.value.locationName = this.pickListReportForm.value.locationName ?  this.pickListReportForm.value.locationName : null;
    this.pickListReportForm.value.productIDName = this.pickListReportForm.value.productIDName ?  this.pickListReportForm.value.productIDName : null;
    this.pickListReportForm.value.fromDate = this.pickListReportForm.value.fromDate ? new Date(this.pickListReportForm.value.fromDate) : null;
    this.pickListReportForm.value.toDate = this.pickListReportForm.value.toDate ? new Date(this.pickListReportForm.value.toDate) : null;
    this.reportsService.fetchPickListReport(JSON.stringify(this.pickListReportForm.value)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickListReportResponseList) {
          this.pickingData = response.data.pickListReportResponseList;
          this.rerender();
        } else {
          this.toastr.error('Enter valid data');
        }
      },
      (error) => {
      });
  }
  clear() {
    this.createpickListReportForm();
  }
  exportAsXLSX() {
    if (this.pickingData.length) {
      const changedPickListData = this.exportTypeMethod(this.pickingData)
      this.excelService.exportAsExcelFile(changedPickListData, 'PickList-Report', null);
    } else {
      this.toastr.error('No data available');
    }
  }
  exportTypeMethod(data){
    const arr = []
    if(data && data.length > 0) {
      data.forEach(k=> {
        const obj = {}
        obj['pickingNumber'] = k.pickingNumber
        obj['productID'] = k.productID
        obj['productName'] = k.productName
        obj['quantity'] = k.quantity
        obj['inventoryUnit'] = k.inventoryUnit
        obj['locationName'] = k.locationName
        obj['pickedQuantity'] = k.pickedQuantity
        obj['pickingExecutive'] = k.pickingExecutive
        obj['createdDate'] = k.createdDate ? this.datepipe.transform(new Date(k.createdDate), 'yyyy-MM-dd') : null
        obj['lastUpdatedDate'] = k.lastUpdatedDate ? this.datepipe.transform(new Date(k.lastUpdatedDate), 'yyyy-MM-dd') : null
        obj['status'] = k.status
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['pickingNumber'] = null
      obj['productID'] =null
      obj['productName'] = null
      obj['quantity'] = null
      obj['locationName'] = null
      obj['pickedQuantity'] = null
      obj['inventoryUnit'] =null
      obj['pickingExecutive']=null
      obj['createdDate'] =null
      obj['lastUpdatedDate'] = null
      obj['status'] =null
      arr.push(obj)
    }
    return arr
    
  }
  fetchMetaData() {
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
    this.reportsCommonService.fetchAllProducts();
    this.reportsCommonService.productIDNameValues.subscribe(res => {
      this.productIDNameValues = this.completerService.local(res);
    });
  }
  createpickListReportForm() {
    this.pickListReportForm = new FormBuilder().group({
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
   // this.forPermissionsSubscription.unsubscribe();
  }

}
