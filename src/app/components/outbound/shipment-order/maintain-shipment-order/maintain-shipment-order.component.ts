import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { OutboundProcessService } from '../../../../services/integration-services/outboundProcess.service';
import { AppService } from '../../../../shared/services/app.service';
import { ToastrService } from 'ngx-toastr';
import { Storage } from '../../../../shared/utils/storage';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { shipmentOrderHead} from 'src/app/constants/paginationConstants';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-maintain-shipment-order',
  templateUrl: './maintain-shipment-order.component.html'
})
export class MaintainShipmentOrderComponent implements OnInit {
  filteredShipmentOrders: any[] = [];
  //shipmentOrders: any[] = [];
  shipmentOrders: any = [];
  filteredShipmentOrderLines: any[] = [];
  customerID: any = '';
  productStatusTypes: any = ['Open', 'Closed'];
  shipmentOrderKeys: any[] = ['#', 'WMSO Number', 'Customer/WareHouse IDName', 'Order Type', 'Order Date', 'Delivery Expected Date',
    'Status', 'Action'];
  shipmentOrderLinesKeys: any[] = ['#', 'WMSO Number', 'WMSO Line Number', 'Product ID/Name', 'Order Quantity', 'Batch Number', 'ExpecteDeliveryDate'];
  serialNumberCheckFrmConfig: any = 'No';
  fromDate: any;
  toDate: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  reqObj: any = { customerID: this.customerID, fromDate: null, toDate: null };
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Shipment Order', Storage.getSessionUser());
  forPermissionsSubscription: any;
  thirdPartyCustomersCheckAllocation: any = 'No';
  status: any = 'Open';
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  showTooltip: any = false;

  orderType: any = null;
  orderTypeDropdown = ['All', 'Sales Order', 'Purchase Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns'];
  tableHeadings: any = ['Sr.No', 'SO Number', 'Customer/Supplier/Warehouse', 'Order Type', 'Order Date', 'Closed By', 'Closed Date', 'Status']
  constructor(private outboundProcessService: OutboundProcessService, private metaDataService: MetaDataService,
    private configService: ConfigurationService,private wmsService:WMSService,
    private toastr: ToastrService,
    private appService: AppService,
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
    /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
       if (data) {
         this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Shipment Order', Storage.getSessionUser());
         this.getFunctionsCall();
       }
     }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    this.fetchAllSerialNumbers();
    this.fetchAllSOHeaderDetails(1);
    this.fetchAllShipmentOrders(1, this.itemsPerPage);
  }
  
  fetchAllD(page, event, header?) {
    if (event) {
      if (header) {
        this.fetchAllSOHeaderDetails(1);
      }
      else {
        this.fetchAllShipmentOrders(page, event.target.value);
      }
    }
  }
  setDirection(type, headerName, header?) { 
    this.sortDirection = type;
    let arr: any = shipmentOrderHead['shipmentHeaderSortFieldArrays'].filter(x => x.key == headerName);
    if (arr.length > 1) {
      this.sortFields = arr.map(x => x.name);
    }
    else {
      this.sortFields = [arr[0].name];
    }
    if (header) {
      this.fetchAllSOHeaderDetails(1);
    }
    else {
    }
  }
  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = shipmentOrderHead['shipmentLinesSortFieldsrArrays'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.fetchAllShipmentOrders(1, this.itemsPerPage);
    }
    else {
    }
  }
  fetchAllSerialNumbers() {
    this.metaDataService.getAllSerialNumberConfigurations(this.configService.getGlobalpayload()).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberCheckFrmConfig = res.data.serialNumberConfigurations[0].serialNumberCheck;
      }
      else {
        this.serialNumberCheckFrmConfig = "No";
      }
    })
    this.metaDataService.getAllThirdpartyCustomers(this.configService.getGlobalpayload()).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
  }
  page: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;
  pageHeader: number = 1;
  headerItemsPerPage = 5;
  headerTotalItems: any;
  headerSearchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;

  fetchAllShipmentOrders(page?, pageSize?) {
    const form =
    {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "productIDName": null,
      "status": this.status == 'All' ? null : this.status,
      "dispatchDateFrom": this.fromDate,
      "dispatchDateTo": this.toDate,
      "orderType": (this.orderType === 'All') ? null : this.orderType,
      "page": page ? page : 1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": shipmentOrderHead.shipmentLinesSearchOnKeys,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
    }
    this.outboundProcessService.findAllShipmentOrdersWithPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderPaginationResponse.shipmentOrders.length > 0) {
          // this.shipmentOrders = response.data.shipmentOrderPaginationResponse.shipmentOrders;
          this.totalItems = response.data.shipmentOrderPaginationResponse.totalElements;
          this.filteredShipmentOrders = response.data.shipmentOrderPaginationResponse.shipmentOrders;
          //this.rerender();
        //  this.dtTrigger.next();
          this.getShipmentOrderLines();
        } else {
          this.filteredShipmentOrders = [];
          this.filteredShipmentOrderLines = [];
          this.rerender();
          this.dtTrigger.next();
          this.dtTrigger2.next();
        }
      },
      (error) => {
        // this.shipmentOrders = [];
      });
  }
  fetchAllSOHeaderDetails(page) {
    const form =
    {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "productIDName": null,
      "status": this.status == 'All' ? null : this.status,
      "dispatchDateFrom": this.fromDate,
      "dispatchDateTo": this.toDate,
      "orderType": (this.orderType === 'All') ? null : this.orderType,
      "page": page ? page : 1,
      "pageSize": this.headerItemsPerPage,
      "searchKeyword": this.headerSearchKey,
      "searchOnKeys": shipmentOrderHead.shipmentHeaderSearchOnKeys,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,

    }
    this.outboundProcessService.findAllShipmentOrdersWithPagination(form,'header').subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderPaginationResponse.shipmentOrders.length > 0) {
          this.shipmentOrders = response.data.shipmentOrderPaginationResponse.shipmentOrders;
          this.headerTotalItems = response.data.shipmentOrderPaginationResponse.totalElements;
         
        }
        else {
          this.shipmentOrders = [];
        }
      })
  }
  editShipmentOrder(grId: any) {
    this.appService.navigate('/v1/outbound/editShipmentOrder', { id: grId });
    // this.wmsService.passingVisibleData = true
  }
  getShipmentOrderLines() {
    const shipmentOrders = this.filteredShipmentOrders;
    const products = [];
    if (shipmentOrders) {
      shipmentOrders.forEach((so) => {
        for (const key in so) {
          if (so.shipmentOrderLines && key === 'shipmentOrderLines') {
            so[key].forEach(a => {
              a.fullWmsoNumber = so.wmsoNumberPrefix + so.wmsoNumber;
              // a.customerID = so.customerMasterInfo ? so.customerMasterInfo.customerID : null;
              products.push(a);
              console.log(a);
            });
          }
        }
      });
      this.filteredShipmentOrderLines = products;
      this.dtTrigger2.next();
    }
  }
  // filterShipmentOrders(status: any) {
  //   this.rerender();
  //   if (status === '0') {
  //     this.filteredShipmentOrders = this.shipmentOrders.slice();
  //     this.dtTrigger.next();
  //   } else {
  //     this.filteredShipmentOrders = this.shipmentOrders.filter((order: any) => {
  //       return order.status === status;
  //     });
  //     this.dtTrigger.next();
  //   }
  //   this.getShipmentOrderLines();
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
      this.reqObj.fromDate = this.fromDate;
      this.reqObj.toDate = this.toDate;
      this.fetchAllSOHeaderDetails(1);
      this.fetchAllShipmentOrders(1);
    } else {
      this.toastr.error('Select valid date difference');
    }
  }
  reset() {
    // this.filteredShipmentOrders = this.shipmentOrders;
    // this.getShipmentOrderLines();
    // this.filteredShipmentOrders = [];
    // this.filteredShipmentOrderLines = [];
    this.reqObj.fromDate = null;
    this.reqObj.toDate = null;
    this.fromDate = null;
    this.toDate = null;
    this.status = 'Open';
    this.orderType = "All";
    this.fetchAllSOHeaderDetails(1);
    this.fetchAllShipmentOrders(1);
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
    // this.forPermissionsSubscription.unsubscribe();
  }
}
