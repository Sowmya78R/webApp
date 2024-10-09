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
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-inventory-adjustments-report',
  templateUrl: './inventory-adjustments-report.component.html'
})
export class InventoryAdjustmentsReportComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  inventoryAdjustmentForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  productIDNameValues: CompleterData;
  inventoryAdjustmentData: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inventory', 'Inventory Adjustments', Storage.getSessionUser());
  inventoryAdjustmentKeys: any = ['', '', '', '', '','',
    '', '', ''];
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  constructor(private toastr: ToastrService,
    private reportsService: ReportsService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService,
    private configService: ConfigurationService,private wmsService:WMSService,
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
    // this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
    //   if (data) {
    //     this.formObj = this.configService.getGlobalpayload();
    //     if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
    //       this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
    //         'Inventory', 'Inventory Adjustments', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createInventoryAdjustmentForm();
      this.fetchMetaData();
    }

  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  generate() {
    this.inventoryAdjustmentForm.value.fromDate = this.inventoryAdjustmentForm.value.fromDate ? new Date(this.inventoryAdjustmentForm.value.fromDate) : null;
    this.inventoryAdjustmentForm.value.toDate = this.inventoryAdjustmentForm.value.toDate ? new Date(this.inventoryAdjustmentForm.value.toDate) : null;
    this.inventoryAdjustmentForm.value.productIDName = this.inventoryAdjustmentForm.value.productIDName ? this.inventoryAdjustmentForm.value.productIDName : null;
    this.wmsService.inventoryAdjustmentsFormDataPassing = this.inventoryAdjustmentForm.value;
    this.reportsService.fetchInventoryAdjustmentReport(JSON.stringify(this.inventoryAdjustmentForm.value)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryAdjustmentReportResponseList) {
          this.inventoryAdjustmentData = response.data.inventoryAdjustmentReportResponseList;
          this.wmsService.inventoryAdjustmentssDisplayTableList = this.inventoryAdjustmentData;
          this.rerender();
        } else {
          this.toastr.error('Enter valid data');
        }
      },
      (error) => {
      });
  }
  clear() {
    this.inventoryAdjustmentForm.reset();
    this.createInventoryAdjustmentForm()
  }
  // exportAsXLSX() {
  //   if (this.inventoryAdjustmentData.length) {
  //     this.excelService.exportAsExcelFile(this.inventoryAdjustmentData, 'InventoryAdjustment-Data', null);
  //   } else {
  //     this.toastr.error('No data available');
  //   }
  // }
  exportAsXLSX() {
    if (this.inventoryAdjustmentData.length) {
      const changedPickingData = this.exportTypeMethod(this.inventoryAdjustmentData)
      this.excelService.exportAsExcelFile(changedPickingData, 'Inventory-Adjustments-Report', null);
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
        obj['Transaction ID'] = k.fullInventoryAdjustmentTransactionID
        obj['Product ID'] = k.productID
        obj['Product Name'] = k.productName
        obj['UOM'] = k.inventoryUnit
        obj['Product Category'] = k.productCategory
        obj['Adjusted Quantity'] = k.adjustedQuantity
        obj['Created Date'] = k.createdDate
        obj['Available Quantity'] = k.availableQuantity
        obj['Reserved Quantity'] = k.reservedQuantity
        obj['Location Name'] = k.locationName

        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Transaction ID'] = null
      obj['Product ID'] = null;
      obj['Product Name'] = null;
      obj['UOM'] = null;
      obj['Product Category'] = null;
      obj['Adjusted Quantity'] = null;
      obj['Created Date'] = null;
      obj['Available Quantity'] = null;
      obj['Reserved Quantity'] = null;
      obj['Location Name'] = null;

      arr.push(obj)
    }
    return arr
  }
  fetchMetaData() {
    this.reportsCommonService.fetchAllProducts();
    this.reportsCommonService.productIDNameValues.subscribe(res => {
      this.productIDNameValues = this.completerService.local(res);
    });
  }
  createInventoryAdjustmentForm() {
    this.inventoryAdjustmentForm = new FormBuilder().group({
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

  /*
  generatePDF(){
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
 */
  generatePDF() {
    if(this.inventoryAdjustmentData.length > 0)
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
