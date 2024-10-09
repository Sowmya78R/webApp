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
import { DatePipe } from '@angular/common';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-open-sales-order-report',
  templateUrl: './open-sales-order-report.component.html'
})
export class OpenSalesOrderReportComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  salesOrderForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  productIDNameValues: CompleterData;
  customerIDNameValues: CompleterData;
  salesOrderData: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Outbound', 'Open Sales Order', Storage.getSessionUser());
  salesOrderKeys: any = ['', '', '', '', '', '', '',
    ''];
  suppliersIDs: CompleterData;
  sourceWareHouses: CompleterData;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  forPermissionsSubscription: any;
  constructor(private toastr: ToastrService, private datepipe: DatePipe,
    private reportsService: ReportsService, private wmsService: WMSService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService,
    private configService: ConfigurationService,
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
    //         'Outbound', 'Open Sales Order', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createSalesOrderForm();
      this.fetchMetaData();
      this.fetchAllWarehouseDetails();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.sourceWareHouses = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
  }
  generate() {
    this.salesOrderForm.value.productIDName = this.salesOrderForm.value.productIDName ? this.salesOrderForm.value.productIDName : null;
    this.salesOrderForm.value.customerIDName = this.salesOrderForm.value.customerIDName ? this.salesOrderForm.value.customerIDName : null;
    this.salesOrderForm.value.fromDate = this.salesOrderForm.value.fromDate ? new Date(this.salesOrderForm.value.fromDate) : null;
    this.salesOrderForm.value.toDate = this.salesOrderForm.value.toDate ? new Date(this.salesOrderForm.value.toDate) : null;

    const form = this.salesOrderForm.value;
    this.wmsService.openSalesOrderFormDataPassing = form
    this.reportsService.fetchOpenSalesOrderReport(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.OpenSalesOrderResponseList) {
          this.salesOrderData = response.data.OpenSalesOrderResponseList;
          this.wmsService.openSalesOrderDisplayTableList = this.salesOrderData;
          this.rerender();
        } else {
          this.toastr.error('Enter valid data');
        }
      },
      (error) => {
      });
  }
  clear() {
    this.createSalesOrderForm();

  }
  exportAsXLSX() {
    if (this.salesOrderData.length) {
      const changedSalesOrderData = this.exportTypeMethod(this.salesOrderData)
      this.excelService.exportAsExcelFile(changedSalesOrderData, 'OpenSalesOrder-Report', null);
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
        obj['Expected Delivery Date'] = k.expectedDeliveryDate ? this.datepipe.transform(new Date(k.expectedDeliveryDate), 'dd/MM/yyyy') : null
        obj['Wmso Number'] = k.wmsoNumber
        obj['Product ID'] = k.productID
        obj['Product Name'] = k.productName
        obj['UOM'] = k.inventoryUnit
        obj['Order Quantity'] = k.quantity
        obj['Order Unit'] = k.shipmentUnit
        obj['Customer Order Quantity'] = k.orderedQuantity
        obj['Unit Price'] = k.unitPrice
        obj['Order unit price'] = k.orderUnitPrice
        obj['Tax Amount'] = DecimalUtils.fixedDecimal(Number(k.taxAmount),2)
        obj['Gross Amount'] = DecimalUtils.fixedDecimal(Number(k.grossAmount),2)
        obj['Net Amount'] = DecimalUtils.fixedDecimal(Number(k.netAmount),2)
        obj['So Order Date'] = k.soOrderDate ? this.datepipe.transform(new Date(k.soOrderDate), 'dd/MM/yyyy') : null
        /*  obj['Wmso Number'] = k.wmsoNumber
         obj['Product ID'] = k.productID
         obj['Product Name'] = k.productName
         obj['UOM'] = k.inventoryUnit
         obj['Customer ID'] = k.customerID
         obj['Customer Name'] = k.customerName
         obj['Quantity'] = k.quantity
         obj['So Order Date'] = k.soOrderDate ? this.datepipe.transform(new Date(k.soOrderDate), 'dd/MM/yyyy') : null
         obj['Expected Delivery Date'] = k.expectedDeliveryDate ? this.datepipe.transform(new Date(k.expectedDeliveryDate), 'dd/MM/yyyy') : null */
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Supplier/Customer/WareHouse ID Name'] = null
      obj['Expected Delivery Date'] = null
      obj['Wmso Number'] = null
      obj['Product ID'] = null
      obj['Product Name'] = null
      obj['UOM'] = null
      obj['Order Quantity'] = null
      obj['Order Unit'] = null
      obj['Customer Order Quantity'] = null
      obj['Order unit price'] = null
      obj['Tax Amount'] = null
      obj['Gross Amount'] = null
      obj['Net Amount'] = null
      obj['So Order Date'] = null

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
  }
  makeEmpty() {
    this.salesOrderForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.setValue(null);
    this.salesOrderForm.controls.supplierIDName.setValue(null);
    this.salesOrderForm.controls.customerIDName.setValue(null);
  }
  createSalesOrderForm() {
    this.salesOrderForm = new FormBuilder().group({
      productIDName: [null],
      customerIDName: [null],
      toDate: [null],
      fromDate: [null],
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      wareHouseTransferDestinationInfoWareHouseIDName: null,
      orderType: 'Sales Order',
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
    // this.forPermissionsSubscription.unsubscribe();
  }
  /*
  generatePDF() {
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 300);
  }
 */

  generatePDF() {
    if (this.salesOrderData.length > 0) {
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
  }

}
