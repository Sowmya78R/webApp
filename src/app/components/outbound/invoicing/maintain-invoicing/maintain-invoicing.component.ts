import { Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { OutboundProcessService } from '../../../../services/integration-services/outboundProcess.service';
import { AppService } from '../../../../shared/services/app.service';
import { CommonService } from '../../../../shared/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { NgForm } from '@angular/forms';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
@Component({
  selector: 'app-maintain-invoicing',
  templateUrl: './maintain-invoicing.component.html'
})
export class MaintainInvoicingComponent implements OnInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();

  filteredInvoices: any[] = [];
  invoices: any[] = [];
  filteredInvoiceLines: any[] = [];
  customerID: any = '';
  productStatusTypes: any = ['Open', 'Closed'];
  invoiceKeys: any[] = ['#', 'WMSO Number', 'Invoice Number', 'Customer/WareHouse IDName', 'Delivery Expected Date', 'Status', 'Action'];
  invoiceLinesKeys: any[] = ['#', 'WMSO Number', 'WMSO Line Number', 'Product ID/Name', 'Batch Number', 'Shelf Life',
    'Shipment Quantity', 'Amount'];
  fromDate: any;
  toDate: any;
  status: any = 'Open';
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Invoicing', Storage.getSessionUser());
  forPermissionsSubscription: any;
  serialNumberCheckFrmConfig: any = 'No';
  thirdPartyCustomersCheckAllocation: any = 'No';
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  page: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;
  pageHeader: number = 1;
  headerItemsPerPage = 5;
  headerTotalItems: any;
  headerSearchKey: any = null;
  invoicesData: any = [];
  sortDirection: any = null;
  sortFields: any = null;
  orderType: any = null;
  orderTypeDropdown = ['All', 'Sales Order', 'Purchase Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns'];
  // emitTripSheet: any;
  showTooltip: any = false;

  constructor(private outboundProcessService: OutboundProcessService,
    private configService: ConfigurationService,
    private toastr: ToastrService, private metaDataService: MetaDataService,
    private appService: AppService, private wmsService: WMSService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.orderType = "All";
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.getFunctionsCall()
  }
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger2.unsubscribe();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.fetchAllSerialNumbers();
      this.fetchInvoicesHeader(this.page);
      this.fetchAllInvoices(this.page, this.itemsPerPage);

    }
  }
  fetchAllSerialNumbers() {
    this.metaDataService.getAllSerialNumberConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberCheckFrmConfig = res.data.serialNumberConfigurations[0].serialNumberCheck;
        this.wmsService.invoicingserialNumberCheckConfig = this.serialNumberCheckFrmConfig;
      }
      else {
        this.serialNumberCheckFrmConfig = "No";
      }
    })
    this.metaDataService.getAllThirdpartyCustomers(this.configService.getGlobalpayload()).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
        this.wmsService.invoicingThirdPartyCheck = this.thirdPartyCustomersCheckAllocation
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
  }
  convertedPage:number
  fetchAllD(page, event, header?) {
    if (event) {
      if (header) {
      const NumberValue = Number(page);
        this.fetchInvoicesHeader(NumberValue);
      }
      else {
        this.fetchAllInvoices(page, event.target.value);
      }
    }
  }
  setDirection(type, headerName, header?) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['invoiceHeaderSortFieldsArray'].filter(x => x.key == headerName);
    if (arr.length > 1) {
      this.sortFields = arr.map(x => x.name);
    }
    else {
      this.sortFields = [arr[0].name];
    }
    if (header) {
      this.fetchInvoicesHeader(this.page);
    }
    else {
      this.fetchAllInvoices();
    }
  }
  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['invoiceLinesSortFieldsArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.fetchAllInvoices(this.page, this.itemsPerPage);
    }
    else {
     
    }
  }
  fetchInvoicesHeader(page) {
    const form = {
      "page": page ? page : 1,
      "pageSize": this.headerItemsPerPage,
      "searchKeyword": this.headerSearchKey,
      "searchOnKeys": PaginationConstants.invoiceHeaderSearchOnKeys, 
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      'status': (this.status == 'All') ? null : this.status,
      "dispatchDateFrom": this.fromDate,
      "dispatchDateTo": this.toDate,
      "orderType": (this.orderType === 'All') ? null : this.orderType
    }
    this.outboundProcessService.fetchAllInvoicesWithPagination(form, 'header').subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.invoicePaginationResponse.invoices.length > 0) {
          this.invoicesData = response.data.invoicePaginationResponse.invoices;
          this.headerTotalItems = response.data.invoicePaginationResponse.totalElements;
        }
        else {
          this.invoicesData = [];
        }
      })
  }
  fetchAllInvoices(page?, pageSize?) {
    const form = {
      "page": page,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": PaginationConstants.invoiceLinesSearchOnKeys,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      'status': (this.status == 'All') ? null : this.status,
      "dispatchDateFrom": this.fromDate,
      "dispatchDateTo": this.toDate,
      "orderType": (this.orderType === 'All') ? null : this.orderType
    }
    this.outboundProcessService.fetchAllInvoicesWithPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.invoicePaginationResponse.invoices.length > 0) {
          this.invoices = response.data.invoicePaginationResponse.invoices;
          this.filteredInvoices = response.data.invoicePaginationResponse.invoices;
          this.wmsService.invoicingFirstTable = this.filteredInvoices;
          this.totalItems = response.data.invoicePaginationResponse.totalElements;
          this.rerender();
          this.dtTrigger.next();
          this.getInvoicingLines();
        } else {
          this.filteredInvoices = [];
          this.filteredInvoiceLines = [];
          this.rerender();
          this.dtTrigger.next();
          this.dtTrigger2.next();
        }
      },
      (error) => {
        this.invoices = [];
      });
  }
  editInvoice(grId: any) {
    this.appService.navigate('/v1/outbound/editInvoicing', { id: grId });
  }
  getInvoicingLines() {
    const invoices = this.filteredInvoices;
    const products = [];
    if (invoices) {
      invoices.forEach((so) => {
        for (const key in so) {
          if (so.invoiceOrderLines && key === 'invoiceOrderLines') {
            so[key].forEach(a => {
              a.fullWmsoNumber = so.fullWmsoNumber;
              products.push(a);
            });
          }
        }
      });
      this.filteredInvoiceLines = products;
      this.wmsService.invoicingSecondTable = this.filteredInvoiceLines
      this.dtTrigger2.next();
    }
  }
  // filterShipmentOrders(status: any) {
  //   if (status === '0') {
  //     this.filteredInvoices = this.invoices.slice();
  //   } else {
  //     this.filteredInvoices = this.invoices.filter((order: any) => {
  //       return order.status === status;
  //     });
  //   }
  //   this.getInvoicingLines();
  // }
  // getDate(dateRef: any, dateValue: any) {
  //   if (dateRef === 'fromDate') {
  //     this.fromDate = new Date(dateValue);
  //   } else if (dateRef === 'toDate') {
  //     this.toDate = new Date(dateValue);
  //   }
  // }
  filterDataFromDates() {
    if ((this.fromDate && this.toDate && this.fromDate <= this.toDate) || (!this.fromDate && !this.toDate)) {
      this.fetchInvoicesHeader(1);
      this.fetchAllInvoices(1, this.itemsPerPage);
    } else {
      this.toastr.error('Select valid date difference');
    }
  }
  // filterDataFromDates() {
  //   if ((this.fromDate && this.toDate && this.fromDate <= this.toDate) || (!this.fromDate && !this.toDate)) {

  //     let filteredPOS = [];
  //     filteredPOS = this.commonService.getProductBWDates(
  //       {
  //         fromDate: this.fromDate,
  //         toDate: this.toDate,
  //         currentDate: 'deliveryExpDate',
  //         products: this.invoices
  //       });
  //     if (filteredPOS.length > 0) {
  //       this.filteredInvoices = filteredPOS;
  //       this.getInvoicingLines();
  //     } else {
  //       this.filteredInvoices = [];
  //       this.filteredInvoiceLines = [];
  //     }
  //   } else {
  //     this.toastr.error('Select valid date difference');
  //   }
  // }
  reset() {
    this.fromDate = null;
    this.toDate = null;
    this.status = 'Open';
    this.orderType = "All";
    this.fetchInvoicesHeader(1);
    this.fetchAllInvoices(1, 10);
  }
  generatePDF() {
    if (this.filteredInvoices.length) {
      this.emitTripSheet.emit();
      setTimeout(() => {
        window.print();
      }, 300);
    }
    else {
      this.toastr.error("No Data to print");
    }
  }
}
