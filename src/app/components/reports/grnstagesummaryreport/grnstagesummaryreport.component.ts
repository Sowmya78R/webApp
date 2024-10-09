import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ReportsCommonService } from '../../../services/reports-common.service';
import { ReportsService } from '../../../services/integration-services/reports.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { Constants } from 'src/app/constants/constants';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-grnstagesummaryreport',
  templateUrl: './grnstagesummaryreport.component.html',
  styleUrls: ['./grnstagesummaryreport.component.scss']
})
export class GrnstagesummaryreportComponent implements OnInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  productTypes: any = Constants.PRODUCT_TYPES;
  grnSummaryReportForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  customerIDNameValues: CompleterData;
  productIDNameValues: CompleterData;
  shipmentOrderData: any = [];
  grnStageSummary: any = ['', '', ''
    , '', ''];
  productCategories: any;
  summaryReportList: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inbound', 'GRN Stage Summary', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  constructor(private toastr: ToastrService,
    private reportsService: ReportsService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService, private wmsService: WMSService, private configService: ConfigurationService,
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
    //         'Inbound', 'GRN Stage Summary', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createShipmentOrderForm();
      this.fetchMetaData();
      this.fetchAllProductCategories();
    }
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategories = response.data.productCategories;
        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  generate() {
    this.grnSummaryReportForm.value.fromDate = this.grnSummaryReportForm.value.fromDate ? new Date(this.grnSummaryReportForm.value.fromDate) : null;
    this.grnSummaryReportForm.value.toDate = this.grnSummaryReportForm.value.toDate ? new Date(this.grnSummaryReportForm.value.toDate) : null;
    this.grnSummaryReportForm.value.productIDName = this.grnSummaryReportForm.value.productIDName ? this.grnSummaryReportForm.value.productIDName: null;
    this.grnSummaryReportForm.value.status = this.grnSummaryReportForm.value.status === 'All' ? null :this.grnSummaryReportForm.value.status
    

    
    this.wmsService.grnStageSummaryFormDataPassing  = this.grnSummaryReportForm.value;
    this.reportsService.fetchrGRNStageSummary(JSON.stringify(this.grnSummaryReportForm.value)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptStageReportResponseList) {
          this.shipmentOrderData = response.data.goodsReceiptStageReportResponseList;
          this.wmsService.grnStageSummaryReportsDisplayTableList = this.shipmentOrderData;
          this.rerender();
        } else {
          this.shipmentOrderData = [];
         /*  this.toastr.error('Enter valid data'); */
        }
      },
      (error) => {
      });
  }
  clear() {
    this.grnSummaryReportForm.reset();
    this.createShipmentOrderForm();
  }

 /*  exportAsXLSX() {
    if (this.shipmentOrderData.length) {
      this.excelService.exportAsExcelFile(this.shipmentOrderData, 'Grn Stage Summary', Constants.EXCEL_IGNORE_FIELDS.GRNSTAGESUMMARY);
    } else {
      this.toastr.error('No data available');
    }
  } */

  exportAsXLSX() {
    if (this.shipmentOrderData.length) {
      const changedPickingData = this.exportTypeMethod(this.shipmentOrderData)
      this.excelService.exportAsExcelFile(changedPickingData, 'Grn-Stage-Summary-Report', null);
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
        obj['Product ID'] = k.productID
        obj['Product Name'] = k.productName
        obj['UOM'] =  k.inventoryUnit
        obj['Received Quantity'] = k.receivedQuantity
        obj['Status'] = k.status
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Product ID'] = null;
      obj['Product Name'] = null;
      obj['UOM'] = null;
      obj['Received Quantity'] = null
      obj['Status'] = null
      arr.push(obj)
    }
    return arr
  }
  fetchMetaData() {
    this.reportsCommonService.fetchAllProducts();
    this.reportsCommonService.productIDNameValues.subscribe(res => {
      this.productIDNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllCustomers();
    this.reportsCommonService.customerIDNameValues.subscribe(res => {
      this.customerIDNameValues = this.completerService.local(res);
    });
  }
  createShipmentOrderForm() {
    this.grnSummaryReportForm = new FormBuilder().group({
      productIDName: [null],
      productCategoryName: [null],
      status: ['All'],
      productType: [null],
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
    //this.forPermissionsSubscription.unsubscribe();
  }

  generatePDF() {
    if(this.shipmentOrderData.length > 0)
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
  } */


