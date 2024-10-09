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
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-grnstagetransactionreport',
  templateUrl: './grnstagetransactionreport.component.html',
  styleUrls: ['./grnstagetransactionreport.component.scss']
})
export class GrnstagetransactionreportComponent implements OnInit, OnDestroy {

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
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inbound', 'GRN Stage Transaction', Storage.getSessionUser());

  grnStagetransaction: any = ['S.No', 'GRN Date', 'Order Quantity', 'Received Quantity', 'WMPO Number', 'Product ID', 'Product Name', 'Product Category', 'Batch Number', 'MFG Date', 'Expiry Date',
    'supplier  ID', 'Supplier Name', 'status',];
  productCategories: any;
  forPermissionsSubscription: any;
  thirdPartyCustomersCheckAllocation = 'No';
  customerServiceNameFilterIDs: CompleterData;
  customerServiceAddresFilterIDs: CompleterData;
  sourceWareHouses: CompleterData;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private toastr: ToastrService, private metaDataService: MetaDataService,
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
    // this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
    //   if (data) {
    //     this.formObj = this.configService.getGlobalpayload();
    //     if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
    //       this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
    //         'Inbound', 'GRN Stage Transaction', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createShipmentOrderForm();
      this.fetchAllWarehouseDetails();
      this.fetchAllGoodsReceipts();
      this.fetchMetaData();
      this.fetchAllProductCategories();
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
  fetchAllGoodsReceipts() {
    this.wmsService.fetchAllGoodsReceipts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceipts) {
          console.log(response.data.goodsReceipts)
          const customerServiceNameMapList = response.data.goodsReceipts.map(supplierName => supplierName.customersSupplierName)
          this.customerServiceNameFilterIDs = customerServiceNameMapList.filter(supplierName => supplierName != null)
          const customerServiceAddressMapList = response.data.goodsReceipts.map(supplierName => supplierName.customersSupplierAddress)
          this.customerServiceAddresFilterIDs = customerServiceAddressMapList.filter(supplierAddres => supplierAddres != null)
        }
      },
      (error) => {

      });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  generate() {
    this.grnTransactionReport.value.fromDate = this.grnTransactionReport.value.fromDate ? new Date(this.grnTransactionReport.value.fromDate) : null;
    this.grnTransactionReport.value.toDate = this.grnTransactionReport.value.toDate ? new Date(this.grnTransactionReport.value.toDate) : null;
    this.grnTransactionReport.value.productIDName = this.grnTransactionReport.value.productIDName ? this.grnTransactionReport.value.productIDName : null;
    this.grnTransactionReport.value.supplierIDName = this.grnTransactionReport.value.supplierIDName ? this.grnTransactionReport.value.supplierIDName : null;
    this.grnTransactionReport.value.status = this.grnTransactionReport.value.status === 'All' ? null : this.grnTransactionReport.value.status;

    const form = this.grnTransactionReport.value;
    this.wmsService.grnStageTransactionFormDataPassing = form;
    this.reportsService.fetchrGRNStageTransaction(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptStageReportResponseList) {
          this.shipmentOrderData = response.data.goodsReceiptStageReportResponseList;
          this.wmsService.grnStageTransactionReportsDisplayTableList = this.shipmentOrderData;
          this.rerender();
        } else {
          //this.toastr.error('Enter valid data');
        }
      },
      (error) => {
      });
  }
  clear() {
    this.grnTransactionReport.reset();
    this.createShipmentOrderForm();
  }
 /*  exportAsXLSX() {
    if (this.shipmentOrderData.length) {
      this.excelService.exportAsExcelFile(this.shipmentOrderData, 'Grn Stage Transaction', Constants.EXCEL_IGNORE_FIELDS.GRNSTAGETRANSACTION);
    } else {
      this.toastr.error('No data available');
    }
  } */


  exportAsXLSX() {
    if (this.shipmentOrderData.length) {
      const changedPutawayList = this.exportTypeMethod(this.shipmentOrderData)
      this.excelService.exportAsExcelFile(changedPutawayList, 'Grn Stage Transaction', null);
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
        obj['Grn Date'] = k.grnDate ? this.datepipe.transform(new Date(k.grnDate), 'dd/MM/yyyy HH:mm:ss') : null +''+ k.createdDate ? this.datepipe.transform(new Date(k.createdDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Wmpo Number'] = k.wmpoNumber
        obj['Supplier ID Name'] = k.supplierIDName
        obj['Product ID'] = k.productID
        obj['Product ID Name'] = k.productIDName
        obj['UOM'] =  k.receivingUnit
        obj['Product Category Name'] = k.productCategoryName
        obj['Ordered Quantity'] = k.orderedQuantity
        obj['Received Quantity'] = k.receivedQuantity
        obj['Batch Number'] = k.batchNumber
        obj['Mfg Date'] = k.mfgDate
        obj['Expiry Date'] = k.expiryDate
        obj['Customers Supplier Name'] = k.customersSupplierName
        obj['Customers Supplier Address'] = k.customersSupplierAddress
        obj['Status'] = k.status
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Grn Date'] = null   
      obj['Wmpo Number'] = null
      obj['Supplier ID Name'] = null
      obj['Product ID'] = null
      obj['Product ID Name'] =null
      obj['UOM'] =null
      obj['Product Category Name'] = null
      obj['Ordered Quantity'] =null
      obj['Received Quantity'] =null
      obj['Batch Number'] = null
      obj['Mfg Date'] =  null
      obj['Expiry Date'] = null
      obj['Customers Supplier Name'] = null
      obj['Customers Supplier Address'] = null
      obj['Status'] =null
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
    this.reportsCommonService.fetchAllSuppliers();
    this.reportsCommonService.supplierIDNameValues.subscribe(res => {
      this.supplierIDNames = this.completerService.local(res);
    });
    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
        this.wmsService.grnStageTransactionThirdPartyCustomersCheckAllocation = this.thirdPartyCustomersCheckAllocation;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
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
  makeEmpty() {
    this.grnTransactionReport.controls.wareHouseTransferSourceInfoWareHouseIDName.setValue(null);
    this.grnTransactionReport.controls.supplierIDName.setValue(null);
    this.grnTransactionReport.controls.customerIDName.setValue(null);
  }
  createShipmentOrderForm() {
    this.grnTransactionReport = new FormBuilder().group({
      supplierIDName: [null],
      customerIDName: null,
      productIDName: [null],
      status: ['All'],
      toDate: [null],
      fromDate: [null],
      customersSupplierName: [null],
      customersSupplierAddress: [null],
      wareHouseTransferSourceInfoWareHouseIDName: null,
      orderType: 'Purchase Order',
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
  generatePDF() {
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
      this.toastr.error("No data to print")
    }
  }
}
