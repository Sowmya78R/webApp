import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ReportsService } from '../../../services/integration-services/reports.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ReportsCommonService } from '../../../services/reports-common.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ThemeService } from 'ng2-charts';
import { Constants } from 'src/app/constants/constants';
import { DatePipe } from '@angular/common';
import { WmsCommonService } from 'src/app/services/wms-common.service';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-goods-receiving-report',
  templateUrl: './goods-receiving-report.component.html'
})
export class GoodsReceivingReportComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  grnReportData: any[] = [];
  grnForm: FormGroup;
  focusedElement: any;
  dataService: CompleterData;
  supplierIDName: CompleterData;
  customerIDNameValues: CompleterData;
  grnKeys: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inbound', 'Goods Receiving', Storage.getSessionUser());
  forPermissionsSubscription: any;
  thirdPartyCustomersCheckAllocation = 'No';
  sourceWareHouses: CompleterData;
  language = this.configService.language;
  priceCheck = true ? true : false;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  constructor(private reportsService: ReportsService, private wmsService: WMSService,
    private toastr: ToastrService, private metaDataService: MetaDataService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService, private wmsCommonService: WmsCommonService,
    private configService: ConfigurationService, private datepipe: DatePipe,
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
    // this.wmsService.goodsReceivingShowFields = true
    // this.wmsService.goodsReceivingHideFields = false
    // this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
    //   if (data) {
    //     this.formObj = this.configService.getGlobalpayload();
    //     if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
    //       this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
    //         'Inbound', 'Goods Receiving', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createGRNForm();
      this.fetchMetaData();
      this.FetchAllGoodsReceipts();
      this.fetchAllWarehouseDetails();
      const form = this.grnForm.value;


      if (form['orderType'] == 'Purchase Order') {
        form['orderType'] = "'Purchase Order'"
      }
      this.wmsService.goodsReceivingReportsFormDataPassing = form
    }
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.sourceWareHouses = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  }
  dataPerPage: number;
  exportData: any = [];
  exportDataForPrintPDf: any = [];
  totalCalculatedValue: any;
  ordrVale: any
  totalrevceviedvalue: any
  totalreturnValue: any
  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  loopToStop: any = null;
  getAllGooddReceivingForDownload(index?) {
    if (!index) {
      this.exportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      this.exportAsXLSX();
    }
    else {
      if (((i == 1) || (i != 1 && this.exportData.length > 0)) && i <= this.loopToStop) {
        const form = {
          "page": i,
          "pageSize": this.dataPerPage,
          "searchKeyword": this.searchKey,
          "searchOnKeys": PaginationConstants.GoodsReceivingReportSearchOnKeys,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }
        this.reportsService.fetchGoodsReceivingReport(JSON.stringify(form)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.goodsRecievingReportPaginationResponse.goodsRecievingReportResponseList ) {
              this.exportData = [...this.exportData, ...response.data.goodsRecievingReportPaginationResponse.goodsRecievingReportResponseList];
              this.getAllGooddReceivingForDownload(i);
            } 
          })
      }
    }
  }
  generate(page?, pageSize?) {
    delete this.grnForm.value.dummyCheckValue;
    this.grnForm.value.supplierIDName = this.grnForm.value.supplierIDName ? this.grnForm.value.supplierIDName : null;
    this.grnForm.value.productIDName = this.grnForm.value.productIDName ? this.grnForm.value.productIDName : null;
    this.grnForm.value.fromDate = this.grnForm.value.fromDate ? new Date(this.grnForm.value.fromDate) : null;
    this.grnForm.value.toDate = this.grnForm.value.toDate ? new Date(this.grnForm.value.toDate) : null;
    this.grnForm.value.orderType = this.grnForm.value.orderType ? this.grnForm.value.orderType : null;
    const form = JSON.parse(JSON.stringify(this.grnForm.value));

    if (form['orderType'] == 'Purchase Order') {
      form['orderType'] = 'Purchase Order'
      this.wmsService.goodsReceivingReportsFormDataPassing = form
      this.wmsService.goodsReceivingReportsFormDataPassing.orderType == 'Purchase Order'
    }
    else {
      this.wmsService.goodsReceivingReportsFormDataPassing = form
    }
    form['page'] = page ? page : 1
    form['pageSize'] = this.itemsPerPage
    form['searchKeyword'] = this.searchKey
    form['searchOnKeys'] = PaginationConstants.GoodsReceivingReportSearchOnKeys
    form['sortDirection'] = this.sortDirection
    form['sortFields'] = this.sortFields 
    this.reportsService.fetchGoodsReceivingReport(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsRecievingReportPaginationResponse.goodsRecievingReportResponseList ) {
          this.grnReportData = response.data.goodsRecievingReportPaginationResponse.goodsRecievingReportResponseList;
          this.wmsService.goodsReceivingReportsFormDataPassing.GRNValuesCheck = this.priceCheck;
          this.wmsService.goodsReceivingReportsDisplayTableList = this.grnReportData;
          this.totalItems = response.data.goodsRecievingReportPaginationResponse.totalElements;
          for (var i = 0; i <= this.grnReportData.length; i++) {
            this.calclulationTotal(this.grnReportData[i]);
          }
          this.grnReportData.forEach(element => {
            element.isChecked = false;
          });
          const lengthofTotalItems = this.totalItems.toString().length;
          const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          count.forEach(el => {
            if (lengthofTotalItems == el) {
              let value: any = 1 + this.configService.addZerosMethod(el);
              this.dataPerPage = parseInt(value);
            }
          });
          const n: any = (this.totalItems / this.dataPerPage).toString()
          let m = n.split('.')
          if (m[1]) {
            this.loopToStop = parseInt(m[0]) + 1
          } else {
            this.loopToStop = parseInt(m[0])
          }
        } else {
         // this.locations = [];
        }
       
      },
      (error) => {
      });
  }
  calclulationTotal(data) {
    this.passingDataValue(data)
    return data.orderedQuantity - (data.totalReceivedQuantity + data.totalReturnQuantity)
  }
  passedData: any;
  passingDataValue(data) {
    if(data.orderedQuantity !=null || data.orderedQuantity !=undefined || data.orderedQuantity !=''){
      this.passedData = data.orderedQuantity - (data.totalReceivedQuantity + data.totalReturnQuantity)
      this.wmsService.passingCalculationData = this.passedData;
    }
  }
  reqObj = {
    isChecked: null
  }
  onCheckCHanges(event) {
    if (event.target.checked) {
      this.priceCheck = false
      this.grnForm.value.dummyCheckValue = event.target.checked
      this.wmsService.makeThisVisible = this.grnForm.value.dummyCheckValue;
    }
    else {
      this.priceCheck = true
      this.grnForm.value.dummyCheckValue = event.target.checked
      this.wmsService.makeThisVisible = this.grnForm.value.dummyCheckValue;
    }
    this.wmsService.goodsReceivingReportsFormDataPassing.GRNValuesCheck = this.priceCheck;
  }

  clear() {
    this.grnForm.reset();
    this.createGRNForm();
    this.priceCheck = true ? true : false;
  }
  /*
  exportAsXLSX() {
    if (this.grnReportData.length) {
      this.excelService.exportAsExcelFile(this.grnReportData, 'GoodsReceiving-Data', Constants.EXCEL_IGNORE_FIELDS.GOODS_RECEIVING_REPORTS);
    } else {
      this.toastr.error('No data available');
    }
  } */

 /*  exportAsXLSX() {
    if (this.grnReportData.length) {
      const changedPutawayList = this.exportTypeMethod(this.grnReportData)
      this.excelService.exportAsExcelFile(changedPutawayList, 'Goods-Receiving-Report', null);
    } else {
      this.toastr.error('No data available');
    }
  } */
  exportAsXLSX(key?) {
    if (key) {
      const changedTaskList = this.exportTypeMethod(null)
      this.excelService.exportAsExcelFile(changedTaskList, 'Good Receiving',null);
    } else {
      const changedTaskList = this.exportTypeMethod(this.exportData)
      this.excelService.exportAsExcelFile(changedTaskList, 'Good Receiving', null);
    }  
}
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['Grn Date'] = k.grnDate ? this.datepipe.transform(new Date(k.grnDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Wmpo Number'] = k.wmpoNumber
        obj['Reference PO Number'] = k.referencePONumber
        obj['Supplier ID Name'] = k.supplierIDName
        obj['Product ID'] = k.productID
        obj['Product Name'] = k.productName
        obj['UOM'] = k.receivingUnit
        obj['Ordered Quantity'] = k.orderedQuantity
        obj['Total Received Quantity'] = k.totalReceivedQuantity
        obj['Total Return Quantity'] = k.totalReturnQuantity
        obj['Total Supplier Received Quantity'] = k.totalSupplierReceivedQuantity
        obj['Total Supplier Return Quantity'] = k.totalSupplierReturnQuantity
        obj['Receivable Quantity'] = this.calclulationTotalForExcel(k)
        obj['Total Supplier Receivable Quantity'] = k.supplierReceivableQuantity,
          (this.priceCheck == false) ? obj['Unit Price'] = k.unitPrice : null,
          (this.priceCheck == false) ? obj['Order Unit Price'] = DecimalUtils.fixedDecimal(Number(k.orderUnitPrice), 2) : null,
          (this.priceCheck == false) ? obj['Tax Amount'] = DecimalUtils.fixedDecimal(Number(k.taxAmount), 2) : null,
          (this.priceCheck == false) ? obj['Gross Amount'] = DecimalUtils.fixedDecimal(Number(k.grossAmount), 2) : null,
          (this.priceCheck == false) ? obj['Net Amount'] = DecimalUtils.fixedDecimal(Number(k.netAmount), 2) : null,
          obj['Customers Supplier Name'] = k.customersSupplierName
        obj['Customers Supplier Address'] = k.customersSupplierAddress
        obj['Status'] = k.status
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Grn Date'] = null
      obj['Wmpo Number'] = null
      obj['Reference PO Number'] = null
      obj['Supplier ID Name'] = null
      obj['Product ID'] = null
      obj['Product Name'] = null
      obj['UOM'] = null
      obj['Ordered Quantity'] = null
      obj['Total Received Quantity'] = null
      obj['Total Return Quantity'] = null
      obj['Total Supplier Received Quantity'] = null
      obj['Total Supplier Return Quantity'] = null
      obj['Receivable Quantity'] = null
      obj['Total Supplier Receivable Quantity'] = null
      obj['Customers Supplier Name'] = null
      obj['Customers Supplier Address'] = null
      obj['Status'] = null
      arr.push(obj)
    }
    return arr

  }
  calclulationTotalForExcel(data) {
    return Number(data.orderedQuantity) - (Number(data.totalSupplierReceivedQuantity) + Number(data.totalSupplierReturnQuantity))
  }
  fetchMetaData() {
    this.reportsCommonService.fetchAllProducts();
    this.reportsCommonService.productIDNameValues.subscribe(res => {
      this.dataService = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllSuppliers();
    this.reportsCommonService.supplierIDNameValues.subscribe(res => {
      this.supplierIDName = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllCustomers();
    this.reportsCommonService.customerIDNameValues.subscribe(res => {
      this.customerIDNameValues = this.completerService.local(res);
    });
    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;

        this.wmsService.goodsRecevingThirdPartyCustomerCheckAlocation = this.thirdPartyCustomersCheckAllocation;

      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
  }
  customerServiceNameMapList: any;
  customerServiceAddressMapList: any;
  customerServiceNameFilterIDs: CompleterData
  customerServiceAddresFilterIDs: CompleterData
  FetchAllGoodsReceipts() {
    this.wmsService.fetchAllGoodsReceipts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceipts) {
          this.customerServiceNameMapList = response.data.goodsReceipts.map(supplierName => supplierName.customersSupplierName)
          this.customerServiceNameFilterIDs = this.customerServiceNameMapList.filter(supplierName => supplierName != null)
          this.customerServiceAddressMapList = response.data.goodsReceipts.map(supplierName => supplierName.customersSupplierAddress)
          this.customerServiceAddresFilterIDs = this.customerServiceAddressMapList.filter(supplierAddres => supplierAddres != null)
        }
      },
      (error) => {

      });
  }
  createGRNForm() {
    this.grnForm = new FormBuilder().group({
      supplierIDName: [null],
      customerIDName: [null],
      productIDName: [null],
      fromDate: [null],
      toDate: [null],
      customersSupplierName: [null],
      customersSupplierAddress: [null],
      wareHouseTransferSourceInfoWareHouseIDName: null,
      orderType: 'Purchase Order',
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      dummyCheckValue: [null]
    });
  }
  makeEmpty() {
    this.grnForm.controls.wareHouseTransferSourceInfoWareHouseIDName.setValue(null);
    this.grnForm.controls.supplierIDName.setValue(null);
    this.grnForm.controls.customerIDName.setValue(null);
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
    if (this.grnReportData.length > 0) {
      if (this.permissionsList.includes('Update')) {
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 500);
      }
      else {
        this.toastr.error("User doesn't have Permissions.")
      }
    }
    else {
      this.toastr.error("No Data to Print.")

    }
  } */

  makeFieldsHidenAndShow() {
    if (this.grnForm.controls.orderType.value == 'WareHouseTransfer') {
      this.wmsService.goodsReceivingShowFields = this.grnForm.controls.orderType.value;
    } else
      if (this.grnForm.controls.orderType.value == 'Sales Returns') {
        this.wmsService.goodsReceivingReturnsFields == 'Sales Returns'
      }
      else if (this.grnForm.controls.orderType.value == 'WareHouseTransfer Returns') {
        this.wmsService.goodsReceivingShowFields = this.grnForm.controls.orderType.value;
      }
  }

  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['GoodsReceivingReportSortKeysArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.generate(this.page, this.itemsPerPage);
  }
  finalArray: any = [];
  totalItemsB: any;
  loopToStopB: any = null;
  dataPerPageB: number;
  
  generatePDF() {
    this.finalArray = []; // Reset finalArray to collect all data
    this.loopToStopB = null;
    this.totalItemsB = null;
    this.dataPerPageB = null;
    this.getAllGoodsReceivingForPrintPDF();
}
getAllGoodsReceivingForPrintPDF(index?) {
    if (!index) {
        this.exportDataForPrintPDf = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      this.wmsService.goodsReceivingReportsDisplayTableList  = this.exportDataForPrintPDf;
        setTimeout(() => {
            this.openPrintDialog();
        }, 500);
    } else {
        if (((i == 1) || (i != 1 && this.exportDataForPrintPDf.length > 0)) && i <= this.loopToStop) {
            const form = {
                "page": i,
                "pageSize": this.dataPerPage,
                "searchKeyword": this.searchKey,
                "searchOnKeys": PaginationConstants.GoodsReceivingReportSearchOnKeys,
                "sortDirection": this.sortDirection,
                "sortFields": this.sortFields,
                "organizationIDName": this.formObj.organizationIDName,
                "wareHouseIDName": this.formObj.wareHouseIDName
            };
            this.reportsService.fetchGoodsReceivingReport(JSON.stringify(form)).subscribe(
              (response) => {
                if (response && response.status === 0 && response.data.goodsRecievingReportPaginationResponse ) {
                        this.exportDataForPrintPDf = [...this.exportDataForPrintPDf, ...response.data.goodsRecievingReportPaginationResponse.goodsRecievingReportResponseList];
                        this.getAllGoodsReceivingForPrintPDF(i);
                    }
                });
        }
    }
}  
openPrintDialog() {
    window.print();
}

}
