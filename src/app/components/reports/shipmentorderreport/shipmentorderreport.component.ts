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
import { DatePipe } from '@angular/common';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-shipmentorderreport',
  templateUrl: './shipmentorderreport.component.html',
  styleUrls: ['./shipmentorderreport.component.scss']
})
export class ShipmentorderreportComponent implements OnInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  productTypes: any = Constants.PRODUCT_TYPES;
  newShipmentOrderForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  customerIDNameValues: CompleterData;
  productIDNameValues: CompleterData;
  shipmentOrderData: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Outbound', 'Shipment', Storage.getSessionUser());
  shipmentOrderKeys: any = ['S.No', 'WMSO Number', 'Product ID', 'Product Name', 'Product Category', 'Product Description',
    'Quantity', 'Batch Number', 'Inventory Unit', 'Serial Number', 'Customer ID', 'Customer Name', 'Location Name',
    'Invoice Number', 'Invoice Date', 'Bill Of Entry No/Date', 'Bill OF Ladging No',
    'LR.No', 'Way Bill No', 'Mode of Transport', 'Status'];
  shipmentOrderKeysWith: any = ['S.No', 'WMSO Number', 'Product ID', 'Product Name', 'Product Category',
    'Product Description',
    'Quantity', 'Batch Number', 'Inventory Unit', 'Serial Number', 'Customer ID', 'Customer Name',
    'Location Name',
    'Invoice Number', 'Invoice Date', 'Bill Of Entry No/Date', 'Bill OF Ladging No',
    'LR.No', 'Way Bill No', 'Mode of Transport', 'Customers Customer Name',
    'Customers Customer Address', 'Status'];

  productCategories: any;
  forPermissionsSubscription: any;
  thirdPartyCustomersCheckAllocation = 'No';
  suppliersIDs: CompleterData;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  sourceWareHouses: CompleterData;

  constructor(private toastr: ToastrService, private datepipe: DatePipe,
    private reportsService: ReportsService, private metaDataService: MetaDataService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService,
    private wmsService: WMSService, private outboundProcessService: OutboundProcessService, private configService: ConfigurationService,
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
    //         'Outbound', 'Shipment', Storage.getSessionUser());
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
      this.findAllShipmentOrders();
    }
  }
  salesOrders: any;
  salesOrdersNameMapList: any;
  salesOrdersMapList: any;
  salesOrdersAddressMapList: any;
  salesOrdersSupplierNameFiterIDs: CompleterData;
  salesOrdersSupplierAddressFilterIDs: CompleterData

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
    this.newShipmentOrderForm.value.productIDName = this.newShipmentOrderForm.value.productIDName ? this.newShipmentOrderForm.value.productIDName : null;
    this.newShipmentOrderForm.value.customerIDName = this.newShipmentOrderForm.value.customerIDName ? this.newShipmentOrderForm.value.customerIDName : null;
    this.newShipmentOrderForm.value.productType = this.newShipmentOrderForm.value.productType ? this.newShipmentOrderForm.value.productType : null;
    this.newShipmentOrderForm.value.productCategoryName = this.newShipmentOrderForm.value.productCategoryName ? this.newShipmentOrderForm.value.productCategoryName : null;
    this.newShipmentOrderForm.value.fromDate = this.newShipmentOrderForm.value.fromDate ? new Date(this.newShipmentOrderForm.value.fromDate) : null;
    this.newShipmentOrderForm.value.toDate = this.newShipmentOrderForm.value.toDate ? new Date(this.newShipmentOrderForm.value.toDate) : null;
    const form = this.newShipmentOrderForm.value;
    this.wmsService.NewshipmentorderFormDataPassing = form;
    this.reportsService.fetchNewShipmentOrderReport(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderReportResponseList) {
          this.shipmentOrderData = response.data.shipmentOrderReportResponseList;
          this.wmsService.NewshipmentorderDisplayTableList = this.shipmentOrderData;
          this.rerender();
        } else {
          this.toastr.error('Enter valid data');
        }
      },
      (error) => {
      });
  }
  clear() {
    this.createShipmentOrderForm();

  }
  exportAsXLSX() {
    if (this.shipmentOrderData.length) {
      const changedShipmentOrderData = this.exportTypeMethod(this.shipmentOrderData)
      this.excelService.exportAsExcelFile(changedShipmentOrderData, 'ShipmentOrder-Report', Constants.EXCEL_IGNORE_FIELDS.NEWSHIPMENTORDERREPORT);
    } else {
      this.toastr.error('No data available');
    }
  }
  exportTypeMethod(data) {
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
        obj['wmsoNumber'] = k.wmsoNumber
        obj['productID'] = k.productID
        obj['productName'] = k.productName
        obj['UOM'] = k.inventoryUnit
        obj['productCategoryName'] = k.productCategoryInfo.productCategoryName
        obj['productDescription'] = k.productDescription
        obj['Dispatch Quantity'] = k.quantity
        obj['Batch Number'] = k.batchNumbers[0]
        obj['Dispatch Date'] = k.dispatchDate ? this.datepipe.transform(new Date(k.dispatchDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['serialNumber'] = k.serialNumber
        obj['locationName'] = k.locationName
        obj['invoiceNumber'] = k.invoiceNumber
        obj['invoiceDate'] = k.invoiceDate ? this.datepipe.transform(new Date(k.invoiceDate), 'dd/MM/yyyy') : null

        obj['vehicleNumber'] = k.vehicleInfo ? k.vehicleInfo.vehicleNumber:null
        obj['vehicleType'] = k.vehicleType
        obj['wayBillNumber'] = k.wayBillNumber
        obj['customersCustomerName'] = k.customersCustomerName
        obj['customersCustomerAddress'] = k.customersCustomerAddress
        obj['referenceBillOfEntryNumber'] = k.referenceBillOfEntryNumber
        obj['referenceBillOfEntryDate'] = k.referenceBillOfEntryDate ? this.datepipe.transform(new Date(k.referenceBillOfEntryDate), 'dd/MM/yyyy') : null
        obj['referenceBondNumber'] = k.referenceBondNumber
        obj['referenceBondDate'] = k.referenceBondDate ? this.datepipe.transform(new Date(k.referenceBondDate), 'dd/MM/yyyy') : null
        obj['exBondNumber'] = k.exBondNumber
        obj['exBondDate'] = k.exBondDate ? this.datepipe.transform(new Date(k.exBondDate), 'dd/MM/yyyy') : null      
        obj['status'] = k.status
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Wmso Number'] = null
        obj['Product ID'] = null
        obj['Product Name'] = null
        obj['UOM'] = null
        obj['Product Category Name'] = null
        obj['product Description'] = null
        obj['Dispatch quantity'] = null
        obj['batchNumber'] = null
        obj['Serial Number'] = null
        obj['Location Name'] = null
        obj['Invoice Number'] = null
        obj['Invoice Date'] = null
        obj['Customers Customer Name'] = null
        obj['Customers Customer Address'] = null
        obj['referenceBillOfEntryNumber'] = null
        obj['referenceBillOfEntryDate'] =  null
        obj['referenceBondNumber'] =null
        obj['referenceBondDate'] =  null
        obj['exBondNumber'] = null
        obj['exBondDate'] =  null   
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
    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
        this.wmsService.newShipmentReportthirdPartyCustomersCheckAllocation = this.thirdPartyCustomersCheckAllocation;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
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
  }
  makeEmpty() {
    this.newShipmentOrderForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.setValue(null);
    this.newShipmentOrderForm.controls.supplierIDName.setValue(null);
    this.newShipmentOrderForm.controls.customerIDName.setValue(null);
  }
  setSerialNumberCheck(key) {
    this.newShipmentOrderForm.controls.serialNumberCheck.patchValue((key == 'No') ? 'Yes' : "No");
  }
  createShipmentOrderForm() {
    this.newShipmentOrderForm = new FormBuilder().group({
      productIDName: [null],
      customerIDName: [null],
      productType: [null],
      productCategoryName: [null],
      toDate: [null],
      fromDate: [null],
      customersCustomerAddress: [null],
      customersCustomerName: [null],
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      wareHouseTransferDestinationInfoWareHouseIDName: null,
      orderType: 'Sales Order',
      serialNumberCheck: 'No',
      supplierIDName: null
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
     if (this.shipmentOrderData.length > 0) {
      if (this.permissionsList.includes('Update')) {
      this.emitTripSheet.emit();
      setTimeout(() => {
        window.print();
      }, 300);
    }
    else{
      this.toastr.error("User doesn't have Permissions.")
    }
    }
    else {
      this.toastr.error("No Data Available.")
    }
  }

}
