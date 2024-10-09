import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ReportsCommonService } from '../../../services/reports-common.service';
import { ReportsService } from '../../../services/integration-services/reports.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Constants } from 'src/app/constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { DecimalUtils } from 'src/app/constants/decimal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-grnsummary',
  templateUrl: './grnsummary.component.html',
  styleUrls: ['./grnsummary.component.scss']
})
export class GrnsummaryComponent implements OnInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;

  productTypes: any = Constants.PRODUCT_TYPES;
  grnTransactionReport: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  customerIDNameValues: CompleterData;
  supplierIDNames: CompleterData;
  productIDNameValues: CompleterData;
  shipmentOrderData: any = [];
  grnSummary: any = [];
  thirdPartyCustomersCheckAllocation = 'No';
  priceCheck = true ? true : false;
  productCategories: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inbound', 'GRN Summary', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private toastr: ToastrService,
    private metaDataService: MetaDataService,
    private reportsService: ReportsService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService,
    private wmsService: WMSService,
    private configService: ConfigurationService,
    private datepipe: DatePipe,
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
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    this.createShipmentOrderForm();
    this.fetchMetaData();
    this.fetchAllProductCategories();
    this.callSerialNumber();
    const form = this.grnSummary.value;
    this.wmsService.goodsReceivingReportsFormDataPassing = form
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  SerialNumberCallingmappingList: any = [];
  SerialNumberCallingFilterList: CompleterData;
  setSerialNumberCheck(key) {
    this.grnTransactionReport.controls.serialNumberCheck.patchValue((key == 'No') ? 'Yes' : "No");
    if (key === 'Yes') {
      this.callSerialNumber()
    }
    else {
      this.singleFieldsCalled();
    }
  }
  callSerialNumber() {
    this.SerialNumberCallingmappingList = [];
    //  this.grnTransactionReport.controls.serialNumber.setValue(null)
    this.reportsService.fetchGRNSummary(JSON.stringify(this.grnTransactionReport.value)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptStageReportResponseList) {
          this.SerialNumberCallingmappingList = response.data.goodsReceiptStageReportResponseList.map(mapList => mapList.serialNumbers);
          console.log(this.SerialNumberCallingmappingList);
          this.SerialNumberCallingFilterList = this.SerialNumberCallingmappingList.filter(filterList => filterList != null)
          console.log(this.SerialNumberCallingFilterList);
          this.rerender();
        } else {
        }
      },
      (error) => {
      });
  }
  singleFieldsCalled() {
    this.SerialNumberCallingmappingList[0] = 0;
    this.reportsService.fetchGRNSummary(JSON.stringify(this.grnTransactionReport.value)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptStageReportResponseList) {
          this.SerialNumberCallingmappingList = response.data.goodsReceiptStageReportResponseList.map(mapList => mapList.serialNumber);
          console.log(this.SerialNumberCallingmappingList);
          this.SerialNumberCallingFilterList = this.SerialNumberCallingmappingList.filter(filterList => filterList != null)
          console.log(this.SerialNumberCallingFilterList);
          this.rerender();
        } else {
        }
      },
      (error) => {
      });
  }
  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  finalArray: any = [];
  totalItemsB: any;
  loopToStopB: any = null;
  dataPerPageB: number;
  dataPerPage: number;
  exportData: any = [];
  exportDataForPrintPDf: any = [];
  loopToStop: any = null;

  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['GrnSummaryReportSortKeysArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.generate(this.page, this.itemsPerPage);
  }
  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  }

  generate(page?, pageSize?) {
    delete this.grnTransactionReport.value.dummyCheckBoxValue;
    this.grnTransactionReport.value.fromDate = this.grnTransactionReport.value.fromDate ? new Date(this.grnTransactionReport.value.fromDate) : null;
    this.grnTransactionReport.value.toDate = this.grnTransactionReport.value.toDate ? new Date(this.grnTransactionReport.value.toDate) : null;
    this.grnTransactionReport.value.supplierIDName = this.grnTransactionReport.value.supplierIDName ? this.grnTransactionReport.value.supplierIDName : null;
    this.grnTransactionReport.value.productIDName = this.grnTransactionReport.value.productIDName ? this.grnTransactionReport.value.productIDName : null;
    this.grnTransactionReport.value.status = this.grnTransactionReport.value.status === 'All' ? null : this.grnTransactionReport.value.status;
    this.grnTransactionReport.value.serialNumber = this.grnTransactionReport.value.serialNumber ? this.grnTransactionReport.value.serialNumber : null;
    this.wmsService.grnSummaryFormDataPassing = this.grnTransactionReport.value;
    const form = this.grnTransactionReport.value;

    form['page'] = page ? page : 1
    form['pageSize'] = this.itemsPerPage
    form['searchKeyword'] = this.searchKey
    form['searchOnKeys'] = PaginationConstants.grnSummaryReportSearchKeys
    form['sortDirection'] = this.sortDirection
    form['sortFields'] = this.sortFields
    this.reportsService.fetchGRNSummary(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptSummaryReportPaginationResponse) {
          this.shipmentOrderData = response.data.goodsReceiptSummaryReportPaginationResponse.
            goodsReceiptStageReportResponses;
          this.shipmentOrderData.forEach(element => {
            element.isChecked = false;
          });
          this.totalItems = response.data.goodsReceiptSummaryReportPaginationResponse.totalElements;
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
        }

      },
      (error) => {
      });
  }
  onCheckCHanges(event) {
    console.log(event);
    if (event.target.checked) {
      this.priceCheck = false
      this.grnTransactionReport.value.dummyCheckBoxValue = event.target.checked
      this.wmsService.makeThisVisible = this.grnTransactionReport.value.dummyCheckBoxValue
    }
    else {
      this.priceCheck = true
      this.grnTransactionReport.value.dummyCheckBoxValue = event.target.checked
      this.wmsService.makeThisVisible = this.grnTransactionReport.value.dummyCheckBoxValue
    }
  }
  getAllGrnSummaryDownload(index?) {
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
          "searchOnKeys": PaginationConstants.grnSummaryReportSearchKeys,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }
        this.reportsService.fetchGRNSummary(JSON.stringify(this.grnTransactionReport.value)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.goodsReceiptSummaryReportPaginationResponse) {
              // this.shipmentOrderData = response.data.goodsReceiptSummaryReportPaginationResponse.goodsReceiptStageReportResponseList;
              this.exportData = [...this.exportData, ...response.data.goodsReceiptSummaryReportPaginationResponse.goodsReceiptStageReportResponses];
              this.getAllGrnSummaryDownload(i);
            }
          })
      }
    }
  }
  clear() {
    this.grnTransactionReport.reset();
    this.createShipmentOrderForm();
    this.priceCheck = true ? true : false;
  }
  /*
  exportAsXLSX() {
    if (this.shipmentOrderData.length) {
      this.excelService.exportAsExcelFile(this.shipmentOrderData, 'Grn Summary', null);
    } else {
      this.toastr.error('No data available');
    }
  } */
  /*  exportAsXLSX() {
     if (this.shipmentOrderData && this.shipmentOrderData.length > 0) {
       console.log(this.shipmentOrderData)
       const changedTaskList = this.exportTypeMethod(this.shipmentOrderData)
       this.excelService.exportAsExcelFile(changedTaskList, 'Grn Summary Data', Constants.EXCEL_IGNORE_FIELDS.GRNSUMMARY);
     } else {
       this.toastr.error('No data found');
     }
   } */
  exportAsXLSX(key?) {
    if (key) {
      const changedTaskList = this.exportTypeMethod(null)
      this.excelService.exportAsExcelFile(changedTaskList, 'Grn Summary Data', null);
    } else {
      const changedTaskList = this.exportTypeMethod(this.exportData)
      this.excelService.exportAsExcelFile(changedTaskList, 'Grn Summary Data', null);
    }
  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = [];
    data.forEach(ele => {
      const obj = {}
      if (ele) {
        obj['supplier/Customer/WareHouse ID Name'] = ele.supplierIDName ? ele.supplierIDName : null + '' + ele.customerMasterInfo
          ? ele.customerMasterInfo.customerIDName : null + ' ' + ele.wareHouseTransferSourceInfo
            ? ele.wareHouseTransferDestinationInfo.wareHouseIDName : null
        obj['wmpoNumber'] = ele.wmpoNumber
        obj['referenceInvoiceNumber'] = ele.referenceInvoiceNumber
        obj['productID'] = ele.productID
        obj['productName'] = ele.productName
        obj['UOM'] = ele.receivingUnit
        obj['productCategoryName'] = ele.productCategoryName
        obj['Ordered Quantity'] = ele.orderedQuantity
        if (ele.receivedQuantity) {
          obj['Received Quantity'] = ele.receivedQuantity
        }
        else {
          obj['Received Quantity'] = null
        }
        obj['Total Suppplier Received Quantity'] = ele.totalSupplierReceivedQuantity
        obj['Total Suppplier Return Quantity'] = ele.totalSupplierReturnQuantity
        obj['Total Suppplier Receivable Quantity'] = ele.supplierReceivableQuantity
        obj['serialNumber'] = ele.serialNumber
        obj['batchNumber'] = ele.batchNumber
        obj['mfgDate'] = ele.mfgDate
        obj['Expiry Date'] = ele.expiryDate ? this.datepipe.transform(new Date(ele.expiryDate), 'yyyy-dd-MM') : null
        obj['invoiceNumber'] = ele.invoiceNumber
        obj['invoiceDate'] = ele.invoiceDate ? this.datepipe.transform(new Date(ele.invoiceDate), 'yyyy-dd-MM') : null
        obj['LR Number'] = ele.wayBillNumber
        obj['vehicleNumber'] = ele.vehicleNumber
        obj['vehicleType'] = ele.vehicleType
        obj['Bill Of Entry Number'] = ele.billOfEntryNumber
        obj['Bill Of Lading Number'] = ele.billOfLandingNumber
        obj['Bill Of Entry Date'] = ele.billOfEntryDate ? this.datepipe.transform(new Date(ele.billOfEntryDate), 'yyyy-dd-MM') : null
        obj['Bill Of Landing Date'] = ele.billOfLandingDate ? this.datepipe.transform(new Date(ele.billOfLandingDate), 'yyyy-dd-MM') : null
        obj['customersSupplierName'] = ele.customersSupplierName
        obj['customersSupplierAddress'] = ele.customersSupplierAddress
        obj['createdBy'] = ele.createdBy
        obj['Grn Date'] = ele.grnDate ? this.datepipe.transform(new Date(ele.grnDate), 'dd/MM/yyyy HH:mm:ss') : null,
          (this.priceCheck == false) ? obj['Order Unit Price'] = DecimalUtils.fixedDecimal(Number(ele.orderUnitPrice), 2) : null,
          (this.priceCheck == false) ? obj['Tax Amount'] = DecimalUtils.fixedDecimal(Number(ele.taxAmount), 2) : null,
          (this.priceCheck == false) ? obj['Gross Amount'] = DecimalUtils.fixedDecimal(Number(ele.grossAmount), 2) : null,
          (this.priceCheck == false) ? obj['Net Amount'] = DecimalUtils.fixedDecimal(Number(ele.netAmount), 2) : null,
          obj['Status'] = ele.status
        arr.push(obj)
      } else {
        obj['Wmpo Number'] = null
        obj['Reference Invoice Number'] = null
        obj['Product ID'] = null
        obj['Product Name'] = null
        obj['Product Category Name'] = null
        obj['Received Quantity'] = null
        obj['Total Suppplier Received Quantity'] = null
        obj['Total Suppplier Return Quantity'] = null
        obj['Total Suppplier Receivable Quantity'] = null
        obj['Serial Number'] = null
        obj['Batch Number'] = null
        obj['Mfg Date'] = null
        obj['expiryDate'] = null
        obj['Invoice Number'] = null
        obj['Invoice Date'] = null
        obj['Way Bill Number'] = null
        obj['Vehicle Number'] = null
        obj['Vehicle Type'] = null
        obj['Bill Of Entry Number'] = null
        obj['Bill Of Landing Number'] = null
        obj['Bill Of Entry Date'] = null
        obj['Bill Of Landing Date'] = null
        obj['Customers Supplier Name'] = null
        obj['Customers Supplier Address'] = null
        obj['Created By'] = null
        obj['Grn Date'] = null
        obj['Status'] = null
        arr.push(obj)
      }
    })
    return arr;
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
    this.reportsCommonService.fetchAllSuppliers();
    this.reportsCommonService.supplierIDNameValues.subscribe(res => {
      this.supplierIDNames = this.completerService.local(res);
    });
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
    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
        this.wmsService.grnsummaryreportrgirdPartCustomerCheckAllocation = this.thirdPartyCustomersCheckAllocation;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
  }
  createShipmentOrderForm() {
    this.grnTransactionReport = new FormBuilder().group({
      orderType: 'Purchase Order',
      supplierIDName: [null],
      customerIDName: [null],
      productIDName: [null],
      productType: [null],
      productCategoryName: [null],
      status: [null],
      serialNumber: [null],
      toDate: [null],
      fromDate: [null],
      wareHouseTransferSourceInfoWareHouseIDName: null,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      serialNumberCheck: 'No',
      dummyCheckBoxValue: [null]
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
  /*  generatePDF() {
     if (this.shipmentOrderData.length > 0) {
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
     else {
       this.toastr.error("No Data to print")
     }
   } */
  generatePDF() {
    this.finalArray = []; // Reset finalArray to collect all data
    this.loopToStopB = null;
    this.totalItemsB = null;
    this.dataPerPageB = null;
    this.getAlGrnSummaryPrintPDF();
  }
  getAlGrnSummaryPrintPDF(index?) {
    if (!index) {
      this.exportDataForPrintPDf = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      this.wmsService.grnSummaryReportsDisplayTableList = this.exportDataForPrintPDf;
      setTimeout(() => {
        this.openPrintDialog();
      }, 500);
    } else {
      if (((i == 1) || (i != 1 && this.exportDataForPrintPDf.length > 0)) && i <= this.loopToStop) {
        const form = {
          "page": i,
          "pageSize": this.dataPerPage,
          "searchKeyword": this.searchKey,
          'searchOnKeys': PaginationConstants.grnSummaryReportSearchKeys,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        };
        this.reportsService.fetchGRNSummary(JSON.stringify(form)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.goodsReceiptSummaryReportPaginationResponse) {
              this.exportDataForPrintPDf = [...this.exportDataForPrintPDf, ...response.data.goodsReceiptSummaryReportPaginationResponse.goodsReceiptStageReportResponses
                ];
              this.getAlGrnSummaryPrintPDF(i);
            }
          })
      }
    }
  }
  openPrintDialog() {
    window.print();

  }
}
