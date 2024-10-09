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
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cycle-counting-report',
  templateUrl: './cycle-counting-report.component.html'
})
export class CycleCountingReportComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  cycleCountingForm: FormGroup;
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
  cycleCountingCriteriaValues: CompleterData;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inventory', 'Cycle Counting', Storage.getSessionUser());
  cycleCountingData: any = [];
  cycleCountingKeys: any = ['', '', '', '', '',
    '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', ''];
  cycleCountingCriterias: any = [
    { value: 'productCategoryInfo', viewValue: 'Product Category' },
    { value: 'wareHouseInfo', viewValue: 'Warehouse' },
    { value: 'zoneInfo', viewValue: 'Zone' },
    { value: 'locationInfo', viewValue: 'Location' }
  ];
  forPermissionsSubscription: any;
  executiveIDs: CompleterData;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private toastr: ToastrService, private commonMasterDataService: CommonMasterDataService,
    private reportsService: ReportsService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService,
    private configService: ConfigurationService
    , private wmsService: WMSService,private datepipe:DatePipe,
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
    //  this.forPermissionsSubscription= this.configService.forPermissions$.subscribe(data => {
    //     if (data) {
    //       this.formObj = this.configService.getGlobalpayload();
    //       if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
    //         this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
    //           'Inventory', 'Cycle Counting', Storage.getSessionUser());
    //       }
    //       this.getFunctionsCall();
    //     }
    //   })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createCycleCountingForm();
      this.fetchMetaData();
    }

  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  generate() {
    const ccReq = this.cycleCountingForm.value;
    ccReq.confirmedDateFrom = ccReq.confirmedDateFrom ? new Date(ccReq.confirmedDateFrom) : null;
    ccReq.confirmedDateTo = ccReq.confirmedDateTo ? new Date(ccReq.confirmedDateTo) : null;
    ccReq.wareHouseName = ccReq.wareHouseName ? ccReq.wareHouseName : null;
    ccReq.zoneName = ccReq.zoneName ? ccReq.zoneName : null;
    ccReq.rackName = ccReq.rackName ? ccReq.rackName : null;
    ccReq.levelName = ccReq.levelName ? ccReq.levelName : null;
    ccReq.locationName = ccReq.locationName ? ccReq.locationName : null;
    ccReq.productIDName = ccReq.productIDName ? ccReq.productIDName : null;
    this.wmsService.cycleCountingFormDataPassing = ccReq
    this.reportsService.fetchCycleCountingReport(JSON.stringify(ccReq)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryCountingReportResponseList) {
          this.cycleCountingData = response.data.inventoryCountingReportResponseList;
          this.wmsService.cycleCountingReportsDisplayTableList = this.cycleCountingData;
          this.rerender();
        } else {
          this.toastr.error('Enter valid data');
        }
      },
      (error) => {
      });
  }
  clear() {
    this.cycleCountingForm.reset();
    this.createCycleCountingForm()
  }
  // exportAsXLSX() {
  //   if (this.cycleCountingData.length) {
  //     this.excelService.exportAsExcelFile(this.cycleCountingData, 'CycleCounting-Report', null);
  //   } else {
  //     this.toastr.error('No data available');
  //   }
  // }
  exportAsXLSX() {
    if (this.cycleCountingData.length) {
      const changedPickingData = this.exportTypeMethod(this.cycleCountingData)
      this.excelService.exportAsExcelFile(changedPickingData, 'Cycle-Counting-Report', null);
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

        obj['Cycle Counting Code'] = k.cycleCountingCode
        obj['Criteria Type'] = k.criteriaType
        obj['Product ID Name'] = k.productMasterInfo.productIDName
        obj['UOM'] = k.inventoryUnit
        obj['Serial Number'] = k.serialNumber
        obj['Batch Number'] = k.batchNumber
        obj['Adjusted Quantity'] = k.adjustedQuantity
        obj['Quantity Inventory Unit'] = k.quantityInventoryUnit
        obj['Counter User'] = k.counterUser
        obj['Confirmed By'] = k.confirmedBy
        obj['Confirmed Date'] = k.confirmedDate ? this.datepipe.transform(new Date(k.confirmedDate), 'dd/MM/yyyy') : null
        obj['Available Quantity'] = k.availableQuantity
        obj['Warehouse Name'] = k.wareHouseInfo.wareHouseName
        obj['Zone Name'] = k.zoneInfo.zoneName
        obj['Rack Name'] = k.rackInfo.rackName
        obj['Location Name'] = k.locationInfo.locationName
        obj['Level Name'] = k.levelInfo.levelName
        obj['Variance'] = k.variance
        obj['Variance Percentage'] = k.variancePercentage
        obj['Planned Date'] ; k.PlannedDate
        obj['Actual Cycle Counting Date'] = k.actualCycleCountingDate ? this.datepipe.transform(new Date(k.actualCycleCountingDate), 'dd/MM/yyyy HH:mm:ss') : null
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Cycle Counting Code'] = null
      obj['Criteria Type'] =null
      obj['Product ID Name'] = null
      obj['Serial Number'] = null
      obj['Batch Number'] =null
      obj['Adjusted Quantity'] = null
      obj['Quantity Inventory Unit'] = null
      obj['Counter User'] = null
      obj['Confirmed By'] = null
      obj['Confirmed Date'] = null
      obj['Available Quantity'] = null
      obj['Warehouse Name'] = null
      obj['Zone Name'] =null
      obj['Rack Name'] = null
      obj['Location Name'] = null
      obj['Level Name'] = null
      obj['Variance'] = null
      obj['Variance Percentage'] =null
      obj['Planned Date']  = null
      obj['Actual Cycle Counting Date'] = null
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
    const form = JSON.parse(JSON.stringify(this.formObj));
    this.commonMasterDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.executiveIDs = response.data.wareHouseTeams.map(x => x.executiveIDName);
        }
      })
  }
  createCycleCountingForm() {
    this.cycleCountingForm = new FormBuilder().group({
      wareHouseName: [null],
      zoneName: [null],
      rackName: [null],
      levelName: [null],
      locationName: [null],
      productIDName: [null],
      confirmedDateFrom: [null],
      confirmedDateTo: [null],
      "executiveIDName": null,
      "confirmedBy": null,
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
  /* generatePDF() {
    if (this.permissionsList.includes('Update')) {
      this.emitTripSheet.emit();
      setTimeout(() => {
        window.print();
      }, 300);
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  } */
  generatePDF() {
    if(this.cycleCountingData.length > 0)
    {
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
    this.toastr.error("No Data to Print.")

  }
}

}
