import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ReportsCommonService } from '../../../services/reports-common.service';
import { ReportsService } from '../../../services/integration-services/reports.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { DatePipe } from '@angular/common';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Constants } from 'src/app/constants/constants';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-shipment-order-report',
  templateUrl: './shipment-order-report.component.html'
})
export class ShipmentOrderReportComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  shipmentOrderForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  customerIDNameValues: CompleterData;
  productIDNameValues: CompleterData;
  shipmentOrderData: any = [];
  productCategoryNameIDs: CompleterData;
  productCategories: any;
  priceCheck = true ? true : false;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Outbound', 'Shipment Order', Storage.getSessionUser());
  shipmentOrderKeys: any = ['S.No', 'Dispatch Date', 'WMSO Number', 'Product ID', 'Product Name', 'Product Description', 'Product Category Name', 'Order Quantity',
    'Shipped Quantity', 'Shipment Unit', 'Batch Number', 'Invoice Date', 'Customer ID', 'Customer Name', 'Order Date'];
  forPermissionsSubscription: any;
  salesOrdersSupplierAddressFilterIDs: CompleterData;
  salesOrdersSupplierNameFiterIDs: CompleterData;
  suppliersIDs: CompleterData;
  sourceWareHouses: CompleterData;
  thirdPartyCustomersCheckAllocation: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private toastr: ToastrService, private configService: ConfigurationService,
    private reportsService: ReportsService, private datepipe: DatePipe,
    private wmsService: WMSService,
    private excelService: ExcelService, private outboundProcessService: OutboundProcessService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService, private metaDataService: MetaDataService,
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
    //         'Outbound', 'Shipment Order', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createShipmentOrderForm();
      // this.fetchMetaData();
      // this.fetchAllProductCategories();
      // this.findAllShipmentOrders();
    }
  }
  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
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

  getAllShipmentOrderForDownload(index?) {
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
          "searchOnKeys": PaginationConstants.shipmentReportSearchOnKeysArray,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }
        this.reportsService.fetchShipmentOrderReport(JSON.stringify(form)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.shipmentOrderReportResponseMap) {
              this.exportData = [...this.exportData, ...response.data.shipmentOrderReportResponseMap.shipmentOrderReportResponseList];
              this.getAllShipmentOrderForDownload(i);
            }
          })
      }
    }
  }
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['shipmentReportOrderSortFieldsrrays'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.generate(this.page, this.itemsPerPage);
  }
  generate(page?, pageSize?) {
    delete this.shipmentOrderForm.value.dummyCheckBoxValue;
    this.shipmentOrderForm.value.productIDName = this.shipmentOrderForm.value.productIDName ? this.shipmentOrderForm.value.productIDName : null;
    this.shipmentOrderForm.value.customerIDName = this.shipmentOrderForm.value.customerIDName ? this.shipmentOrderForm.value.customerIDName : null;
    this.shipmentOrderForm.value.productCategoryName = this.shipmentOrderForm.value.productCategoryName ? this.shipmentOrderForm.value.productCategoryName : null;
    this.shipmentOrderForm.value.fromDate = this.shipmentOrderForm.value.fromDate ? new Date(this.shipmentOrderForm.value.fromDate) : null;
    this.shipmentOrderForm.value.toDate = this.shipmentOrderForm.value.toDate ? new Date(this.shipmentOrderForm.value.toDate) : null;

    const form = this.shipmentOrderForm.value;
    this.wmsService.shipmentFormDataPassing = form;
    form['page'] = page ? page : 1
    form['pageSize'] = this.itemsPerPage
    form['searchKeyword'] = this.searchKey
    form['searchOnKeys'] = PaginationConstants.shipmentReportSearchOnKeysArray
    form['sortDirection'] = this.sortDirection
    form['sortFields'] = this.sortFields
    this.reportsService.fetchShipmentOrderReport(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderReportResponseMap) {
          this.shipmentOrderData = response.data.shipmentOrderReportResponseMap.shipmentOrderReportResponseList;
          //this.wmsService.shipmentDisplayTableList = this.shipmentOrderData;

          this.totalItems = response.data.shipmentOrderReportResponseMap.totalElements;
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
          //this.locations = [];
        }

      },
      (error) => {
      });
  }

  findAllShipmentOrders() {
    this.outboundProcessService.fetchAllShipmentOrders(JSON.stringify(this.formObj)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrders) {
          const salesOrdersNameMapList = response.data.shipmentOrders.map(customerName => customerName.customersCustomerName);
          this.salesOrdersSupplierNameFiterIDs = salesOrdersNameMapList.filter(customerNameFilter => customerNameFilter != null);
          const salesOrdersAddressMapList = response.data.shipmentOrders.map(customerName => customerName.customersCustomerAddress);
          this.salesOrdersSupplierAddressFilterIDs = salesOrdersAddressMapList.filter(customerAddressFilter => customerAddressFilter != null);
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
      this.shipmentOrderForm.value.dummyCheckBoxValue = event.target.checked
      this.wmsService.makeThisVisible = this.shipmentOrderForm.value.dummyCheckBoxValue
    }
    else {
      this.priceCheck = true
      this.shipmentOrderForm.value.dummyCheckBoxValue = event.target.checked
      this.wmsService.makeThisVisible = this.shipmentOrderForm.value.dummyCheckBoxValue
    }
  }
  clear() {
    this.shipmentOrderForm.reset();
    this.createShipmentOrderForm();
    this.priceCheck = true ? true : false;
  }
  exportAsXLSX() {
    if (this.exportData.length && this.shipmentOrderData.length) {
      const changedShipmentData = this.exportTypeMethod(this.exportData)
      this.excelService.exportAsExcelFile(changedShipmentData, 'Shipment-Report', Constants.EXCEL_IGNORE_FIELDS.SHIPMENTORDERREPORT);
    } else {
      this.toastr.error('No data available');
    }
  }
  exportTypeMethod(data) {
    console.log(data)
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        if (k.supplierMasterInfo != null || k.customerMasterInfo != null || k.wareHouseTransferDestinationInfo != null) {
          obj['Supplier/Customer/WareHouse ID Name'] = k.supplierMasterInfo ? k.supplierMasterInfo.supplierIDName : null + '' + k.customerMasterInfo ? k.customerMasterInfo.customerIDName : null + ' ' + k.wareHouseTransferDestinationInfo ? k.wareHouseTransferDestinationInfo.wareHouseIDName : null
        }
        else {
          obj['Supplier/Customer/WareHouse ID Name'] = null
        }
        obj['Dispatch Date'] = k.dispatchDate ? this.datepipe.transform(new Date(k.dispatchDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Wmso Number'] = k.wmsoNumber
        obj['Product ID'] = k.productID
        obj['Product Name'] = k.productName
        obj['UOM'] = k.inventoryUnit
        obj['Product Description'] = k.productDescription
        obj['Product Category Name'] = k.productCategoryInfo.productCategoryName
        obj['Order Quantity'] = k.quantity
        obj['Shipped Quantity'] = k.dispatchQuantity
        obj['Total Dispatched Quantity'] = k.totalCustomerDispatchQuantity
        obj['Batch Numbers'] = k.batchNumbers[0]
        obj['Invoice Date'] = k.invoiceDate ? this.datepipe.transform(new Date(k.invoiceDate), 'dd/MM/yyyy') : null
        obj['Customers Customer Name'] = k.customersCustomerName
        obj['Customers Customer Address'] = k.customersCustomerAddress,
          (this.priceCheck == false) ? obj['Order Unit Price'] = DecimalUtils.fixedDecimal(Number(k.orderUnitPrice), 2) : null,
          (this.priceCheck == false) ? obj['Tax Amount'] = DecimalUtils.fixedDecimal(Number(k.taxAmount), 2) : null,
          (this.priceCheck == false) ? obj['Gross Amount'] = DecimalUtils.fixedDecimal(Number(k.grossAmount), 2) : null,
          (this.priceCheck == false) ? obj['Net Amount'] = DecimalUtils.fixedDecimal(Number(k.netAmount), 2) : null,
          obj['Invoice Number'] = k.invoiceNumber,
          obj['Reference Bill Of Entry Number'] = k.referenceBillOfEntryNumber,
          obj['Reference Bill Of Entry Date'] = k.referenceBillOfEntryDate ? this.datepipe.transform(new Date(k.referenceBillOfEntryDate), 'dd/MM/yyyy') : null
        obj['Reference Bond Number'] = k.referenceBondNumber,
          obj['Reference Bond Date'] = k.referenceBondDate ? this.datepipe.transform(new Date(k.referenceBondDate), 'dd/MM/yyyy') : null
        obj['Ex Bond Number'] = k.exBondNumber,
          obj['Ex Bond Date'] = k.exBondDate ? this.datepipe.transform(new Date(k.exBondDate), 'dd/MM/yyyy') : null
        obj['Order Date'] = k.orderDate ? this.datepipe.transform(new Date(k.orderDate), 'dd/MM/yyyy') : null
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Wmso Number'] = null
      obj['Product ID'] = null
      obj['Product Name'] = null
      obj['UOM'] = null
      obj['Product Description'] = null
      obj['Product Category Name'] = null
      obj['Order Quantity'] = null
      obj['Shipped Quantity'] = null
      obj['Total Dispatched Quantity'] = null
      obj['Batch Numbers'] = null
      obj['Invoice Date'] = null
      obj['Customers Customer Name'] = null,
        obj['Customers Customer Address'] = null,
        (this.priceCheck == false) ? obj['Order Unit Price'] : null,
        (this.priceCheck == false) ? obj['Tax Amount'] : null,
        (this.priceCheck == false) ? obj['Gross Amount'] : null,
        (this.priceCheck == false) ? obj['Net Amount'] : null,
        obj['Invoice Number'] = null
      obj['Reference Bill Of Entry Number'] = null
      obj['Reference Bill Of Entry Date'] = null
      obj['Reference Bond Number'] = null
      obj['Reference Bond Date'] = null
      obj['Ex Bond Number'] = null
      obj['Ex Bond Date'] = null
      obj['Order Date'] = null


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
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliersIDs = response.data.supplierMasters.map(supp => supp.supplierIDName);
        }
      })
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.sourceWareHouses = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
        this.wmsService.shipmentReportthirdPartyCustomersCheckAllocation = this.thirdPartyCustomersCheckAllocation;
        console.log(this.wmsService.shipmentReportthirdPartyCustomersCheckAllocation);
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
  }

  fetchAllProductCategories() {
    this.metaDataService.fetchAllProductCategories({
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
    }).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length) {
          this.productCategoryNameIDs = response.data.productCategories.map(mapping => mapping.productCategoryName);
          console.log(this.productCategories);
        }
      },
      error => {
        this.productCategories = [];
      }
    );
  }
  makeEmpty() {
    this.shipmentOrderForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.setValue(null);
    this.shipmentOrderForm.controls.supplierIDName.setValue(null);
    this.shipmentOrderForm.controls.customerIDName.setValue(null);
  }
  createShipmentOrderForm() {
    this.shipmentOrderForm = new FormBuilder().group({
      productIDName: [null],
      customerIDName: [null],
      productCategoryName: [null],
      customersCustomerName: null,
      customersCustomerAddress: null,
      toDate: [null],
      fromDate: [null],
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      wareHouseTransferDestinationInfoWareHouseIDName: null,
      orderType: 'Sales Order',
      supplierIDName: null,
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

  /*
  generatePDF(){
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 300);
} */

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
       this.toastr.error("No Data to Print.")
     }
   } */

  generatePDF() {
    this.finalArray = []; // Reset finalArray to collect all data
    this.loopToStopB = null;
    this.totalItemsB = null;
    this.dataPerPageB = null;
    this.getAllShippingForPrintPDF();
  }
  getAllShippingForPrintPDF(index?) {
    if (!index) {
      this.exportDataForPrintPDf = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      this.wmsService.shipmentDisplayTableList = this.exportDataForPrintPDf;
      //this.wmsService.shipmentDisplayTableList = this.shipmentOrderData;
      setTimeout(() => {
        this.openPrintDialog();
      }, 500);
    } else {
      if (((i == 1) || (i != 1 && this.exportDataForPrintPDf.length > 0)) && i <= this.loopToStop) {
        const form = {
          "page": i,
          "pageSize": 11111,
          "searchKeyword": this.searchKey,
          "searchOnKeys": PaginationConstants.shipmentReportSearchOnKeysArray,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        };
        this.reportsService.fetchShipmentOrderReport(JSON.stringify(form)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.shipmentOrderReportResponseMap) {
              this.exportDataForPrintPDf = [...this.exportDataForPrintPDf, ...response.data.shipmentOrderReportResponseMap.shipmentOrderReportResponseList];
              this.getAllShippingForPrintPDF(i);
            }
          });
      }
    }
  }
  openPrintDialog() {
    window.print();
  }

}

