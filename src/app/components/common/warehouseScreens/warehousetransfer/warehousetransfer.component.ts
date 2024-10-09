import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CompleterData } from 'ng2-completer';
import { Constants } from 'src/app/constants/constants';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Storage } from 'src/app/shared/utils/storage';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TranslateService } from '@ngx-translate/core';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-warehousetransfer',
  templateUrl: './warehousetransfer.component.html',
  styleUrls: ['./warehousetransfer.component.scss']
})
export class WarehousetransferComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  tableHeadings = ['S.No', 'Transaction ID', 'Order Number', 'Destination Warehouse',
   'Created Date', 'Dispatch Date', 'Total Amount', 'Order Status']

   tableLinesData = ['Image','Transaction ID','Order Number','Source Warehouse','Product ID', 'Product Name','Product Specification',
   'Brand Name','UOM','Customer Order Quantity','Dispatch Quantity','Expected Delivery Date','Created By']
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  locationsIDs: CompleterData;
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData
  rackIDs: CompleterData;
  warehouseTransferForm: FormGroup;
  products: CompleterData;
  //categoryDrp: any;
  warehouses: CompleterData;
  warehouseIDName: any;
  inventoryData: any;
  productCategories: any;
  zoneNameIDs: CompleterData;
  userDetails: any;
  // conversion = JSON.stringify(this.formObj);
  formObj = this.configService.getGlobalpayload();
  permissionsList: any = null; transfersData: any = [];
  deleteInfo: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  page: number = 1;
  itemsPerPage = 10;
  showTooltip: any = false;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  headerDetails: any = [];
  pageHeader: number = 1;
  itemsPerPageHeader = 5;
  totalItemsForHeader: any;
  searchKeyForHeader: any = null;
  constructor(private configService: ConfigurationService, private ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService, private appService: AppService, private toastr: ToastrService,
    private translate: TranslateService) {
    this.translate.use(this.language);
    if (sessionStorage.getItem('module') === 'Inbound') {
      this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Inbound Warehouse Transfer', Storage.getSessionUser());
    }
    else if (sessionStorage.getItem('module') === 'Outbound') {
      this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Outbound Warehouse Transfer', Storage.getSessionUser());
    }
    else {
      this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inventory', 'Warehouse Transfer', Storage.getSessionUser());
    }
  }
  ngOnInit() {
    this.fetchWaeHOusource();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    if (this.permissionsList.includes('View')) {
      this.headerGet(1);
      this.get(1, this.itemsPerPage);
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }

  fetchAllD(page, event) {
    if (event) {
      this.get(page, event.target.value);
    }
  }

  headerWareHouseTransfer: any = [];

  reqObj = {
    createdDateFrom: null,
    createdDateTo: null,
    expectedDeliveryDateFrom: null,
    expectedDeliveryDateTo: null,
    status: "All",
    sourceWareHouseIDName: null,
    destinationWareHouseIDName: null

  }
  navigateToSch(data) {
    const formValues = {
      'orderType': 'WareHouseTransfer',
      'fullWmsoNumber': data.fullWmsoNumber
    }
    sessionStorage.setItem('idInfos', JSON.stringify(formValues));
    this.appService.navigate(`v1/outbound/picking`);
  }
  backtoNormal() {
    this.reqObj = {
      createdDateFrom: null,
      createdDateTo: null,
      expectedDeliveryDateFrom: null,
      expectedDeliveryDateTo: null,
      status: "Draft",
      sourceWareHouseIDName: null,
      destinationWareHouseIDName: null
    }
    this.makeDestinationDisable = false;
    this.makesourceDisable = false;
    this.makeExpectedDateDisable = false
    this.makeCreatedDateDisable = false;
    this.selectParedDates();
  }


  makeExpectedDateDisable: boolean
  forValidDateDifferencecreatedDateFrom(data) {
    console.log(data);
    if (data) {
      this.makeExpectedDateDisable = true;
    }
    if (data === '') {
      console.log(this.reqObj.createdDateFrom);
      this.reqObj.createdDateFrom = null
      console.log(this.reqObj.createdDateFrom);
    }
    if (this.reqObj.createdDateFrom && this.reqObj.createdDateTo) {
      if (this.reqObj.createdDateFrom <= this.reqObj.createdDateTo) {
      }
      else {
        this.toastr.error("please select Valid Date Difference");
        this.reqObj.createdDateFrom = null;
        this.reqObj.createdDateTo = null;
        this.makeExpectedDateDisable = false;
      }
    }
    else if (this.reqObj.createdDateFrom === null && this.reqObj.createdDateTo === null) {
      this.makeExpectedDateDisable = false;
    }
  }

  forValidDateDifferencecreatedDateTo(data) {
    console.log(data);
    if (data) {
      this.makeExpectedDateDisable = true;
    }
    if (data === '') {
      console.log(this.reqObj.createdDateTo);
      this.reqObj.createdDateTo = null
      console.log(this.reqObj.createdDateTo);
    }
    if (this.reqObj.createdDateFrom && this.reqObj.createdDateTo) {
      if (this.reqObj.createdDateFrom <= this.reqObj.createdDateTo) {
      }
      else {
        this.toastr.error("please select Valid Date Difference");
        this.reqObj.createdDateFrom = null,
          this.reqObj.createdDateTo = null
        this.makeExpectedDateDisable = false;
      }
    }
    else if (this.reqObj.createdDateFrom === null && this.reqObj.createdDateTo === null) {
      this.makeExpectedDateDisable = false;
    }
  }
  makeDestinationDisable: boolean;
  makesourceDisable: boolean;
  makeMeEnable: boolean;
  disableDestination(data) {
    if (data) {
      this.makeDestinationDisable = true;
    }
  }
  disableSource(data) {
    if (data) {
      this.makesourceDisable = true;
    }
  }
  makeCreatedDateDisable: boolean;
  forValidDateDifferenceexpectedDeliveryDateFrom(data) {
    console.log(data);
    if (data) {
      this.makeCreatedDateDisable = true;
    }
    if (data === '') {
      this.reqObj.expectedDeliveryDateFrom = null
      console.log(this.reqObj);
    }

    if (this.reqObj.expectedDeliveryDateFrom && this.reqObj.expectedDeliveryDateTo) {
      if (this.reqObj.expectedDeliveryDateFrom <= this.reqObj.expectedDeliveryDateTo) {
      }
      else {
        this.toastr.error("please select Valid Date Difference");
        this.reqObj.expectedDeliveryDateFrom = null,
          this.reqObj.expectedDeliveryDateTo = null
        this.makeCreatedDateDisable = false;
      }
    }
    else if (this.reqObj.expectedDeliveryDateFrom === null && this.reqObj.expectedDeliveryDateTo === null) {

      this.makeCreatedDateDisable = false;
    }
  }
  forValidDateDifferenceexpectedDeliveryDateTo(data) {
    console.log(data);
    if (data) {
      this.makeCreatedDateDisable = true;
    }
    if (data === '') {
      this.reqObj.expectedDeliveryDateTo = null
      console.log(this.reqObj);
    }

    if (this.reqObj.expectedDeliveryDateFrom && this.reqObj.expectedDeliveryDateTo) {
      if (this.reqObj.expectedDeliveryDateFrom <= this.reqObj.expectedDeliveryDateTo) {
      }
      else {
        this.toastr.error("please select Valid Date Difference");
        this.reqObj.expectedDeliveryDateFrom = null,
          this.reqObj.expectedDeliveryDateTo = null
        this.makeCreatedDateDisable = false;
      }
    }
    else if (this.reqObj.expectedDeliveryDateFrom === null && this.reqObj.expectedDeliveryDateTo === null) {
      this.makeCreatedDateDisable = false;
    }
  }
  selectParedDates() {
    console.log(this.reqObj)
    const { reqObj } = this;
    if (reqObj.createdDateFrom || reqObj.createdDateTo) {
      if (!reqObj.createdDateTo) {
        this.toastr.error("Select Created Date To As well");
      } else if ((!reqObj.createdDateFrom)) {
        this.toastr.error("Select Created Date From as well");
      }
      else {
        console.log(reqObj);
        this.headerGet();
        this.get();
      }
    } else if (reqObj.expectedDeliveryDateFrom || reqObj.expectedDeliveryDateTo) {
      console.log(this.reqObj)
      if (!reqObj.expectedDeliveryDateTo) {
        this.toastr.error("Select Expected Date To as well");
      } else if (!reqObj.expectedDeliveryDateFrom) {
        this.toastr.error("Select Expected Date From as Well ");
      }
      else {
        console.log(reqObj);
        this.headerGet();
        this.get();
      }
    } else {
      this.headerGet();
      this.get();
    }
  }
  /* selectParedDates(){
    if(this.reqObj.createdDateFrom && this.reqObj.createdDateTo === null)
    {
      this.toastr.error("select Created To Date As Well")
    }
    else  if(this.reqObj.createdDateFrom === '' && this.reqObj.createdDateTo)
    {
      this.toastr.error("select Created From  Date As Well")
    }
    else  if(this.reqObj.createdDateFrom === '')
    {
      this.toastr.error("select Created Date From")
    }
    else  if(this.reqObj.createdDateTo === '')
    {
      this.toastr.error("select missing Date To")
    }
    else if (this.reqObj.expectedDeliveryDateFrom && this.reqObj.expectedDeliveryDateTo === null)
    {
      this.toastr.error("select Expected To Date as Well")
    }
    else{
      console.log(this.reqObj);
      this.get();
    }
  } */
  fetchAllDHeader(page, event) {
    console.log(page)
    console.log(event);
    if (event) {
        this.headerGet(page); 
    }
  }
  fetchAllDLines(page, event) {
    console.log(page)
    console.log(event);
    if (event) {
          this.get(page, event.target.value);
        }
     
    
  }
  setDirection(type, headerName, header) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['wareHouseTransferHeaderSortKeys'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (header) {
      this.headerGet(this.page);
    }
    else {
     /*  this.get(this.page, this.itemsPerPage); */
    }
  }
  wareHouseTransferResponceList: any[] = [];
  headerGet(page?) {
    const form = {
      "createdDateFrom": this.reqObj.createdDateFrom,
      "createdDateTo": this.reqObj.createdDateTo,
      "expectedDeliveryDateFrom": this.reqObj.expectedDeliveryDateFrom,
      "expectedDeliveryDateTo": this.reqObj.expectedDeliveryDateTo,
      "status": this.reqObj.status === 'All' ? null : this.reqObj.status,
      "page": page ? page : 1,
      "pageSize": this.itemsPerPageHeader,
      "searchKeyword": this.searchKeyForHeader,
      "searchOnKeys": PaginationConstants.wareHouseTransferHeaderSearchOnKeys,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "sourceWareHouseIDName": this.reqObj.sourceWareHouseIDName,
      "destinationWareHouseIDName": this.reqObj.destinationWareHouseIDName
    }
    this.wmsService.getWTDetailsHeaderWithPaginations(form).subscribe(res => {
      if (res['status'] == 0 && res['data'].wareHouseTransferPaginationResponse.wareHouseTransfers
       && res['data'].wareHouseTransferPaginationResponse.wareHouseTransfers.length > 0) {
        this.headerDetails = res['data'].wareHouseTransferPaginationResponse.wareHouseTransfers;
        this.totalItemsForHeader = res['data'].wareHouseTransferPaginationResponse.totalElements;
        this.headerDetails.forEach(k => {
          k['isViewToggle'] = false
        })
      } else {
        this.headerDetails = [];
      }
    },
      (error) => {
        this.wareHouseTransferResponceList = [];
      });
  }

  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['wareHouseTransferLinesSortKeys'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.get(this.page, this.itemsPerPage);
    }
    else {
     
    }
  }
  get(page?, pageSize?) {
    const form = {
      "createdDateFrom": this.reqObj.createdDateFrom,
      "createdDateTo": this.reqObj.createdDateTo,
      "expectedDeliveryDateFrom": this.reqObj.expectedDeliveryDateFrom,
      "expectedDeliveryDateTo": this.reqObj.expectedDeliveryDateTo,
      "status": this.reqObj.status === 'All' ? null : this.reqObj.status,
      "page": page ? page : 1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": PaginationConstants.wareHouseTransferLinesSearchOnKeys,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "sourceWareHouseIDName": this.reqObj.sourceWareHouseIDName,
      "destinationWareHouseIDName": this.reqObj.destinationWareHouseIDName

    }

    this.wmsService.getWareHouseTransferDetailsWithPaginations(form).subscribe(res => {
      if (res['status'] == 0 && res['data'].wareHouseTransferPaginationResponse.wareHouseTransfers && res['data'].wareHouseTransferPaginationResponse.wareHouseTransfers.length > 0) {
        this.wareHouseTransferResponceList = res['data'].wareHouseTransferPaginationResponse.wareHouseTransfers;
        this.headerWareHouseTransfer = this.wareHouseTransferResponceList;
        this.headerWareHouseTransfer.forEach(k => {
          k['isViewToggle'] = false
        })
        this.totalItems = res['data'].wareHouseTransferPaginationResponse.totalElements;
        this.getFinalProducts();
      } else {
        this.wareHouseTransferResponceList = [];
        this.headerWareHouseTransfer = [];
      }
    },
      (error) => {
        this.wareHouseTransferResponceList = [];
      });
    //  this.rerender();
    //this.dtTrigger.next();
  }


  changeUpToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  changeDownToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  sourceWareHouses: any = []
  fetchWaeHOusource() {
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          const abc: any = response.data.wareHouses;
          this.sourceWareHouses = abc.filter(x => x.wareHouseIDName != this.configService.getGlobalpayload().wareHouseIDName)
        }
      })
  }

  getFinalProducts() {
    const pos = this.headerWareHouseTransfer;
    const transfers = [];
    pos.forEach(po => {
      for (const key in po) {
        if (key && key === 'wareHouseTransferLines') {
          po[key].forEach(a => {
            a.fullWmsoNumber = po.fullWmsoNumber;
            a.fullWareHouseTransferTransactionID = po.fullWareHouseTransferTransactionID
            transfers.push(a);
          });
        }
      }
    });
    this.wareHouseTransferResponceList = transfers;
    //this.dtTrigger2.next();
  }
  navigateClick(id, data) {
    if (this.permissionsList.includes('Create')) {
      if (id) {
        if (data.statusStages[data.statusStages.length - 1].status == 'Draft') {
          this.wmsService.getWarehouseTransferPriceMulti(data).subscribe(res => {
            console.log(res);
          })
        }
        this.appService.navigate('/maintainWarehouseTransfer', { id: id });
      }
      else {
        this.appService.navigate('/createWareHouseTransfer')
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  /*   framedData(jsonData) {
      const arr = [];
      if (jsonData.length > 0) {
        jsonData.forEach((element, i) => {
          if (element.wareHouseTransferLines.length > 0) {
            element.wareHouseTransferLines.forEach((el, j) => {
              let obj = {}
              obj['isShow'] = false;
              if (j == 0) {
                obj['isShow'] = true;
              }
              obj['_id'] = element._id;
              obj['wareHouseTransferTransactionID'] = element.wareHouseTransferTransactionID;
              obj['sourceWareHouseInfo'] = element.sourceWareHouseInfo;
              obj['destinationWareHouseInfo'] = element.destinationWareHouseInfo;
              obj['productMasterInfo'] = el.productMasterInfo;
              obj['transferQuantity'] = el.transferQuantity;
              obj['requestedDate'] = el.requestedDate;
              obj['status'] = element.status;
              arr.push(obj);
            });
          }
        });
      }
      return arr
    } */
  /*   frameJSON(data) {
      const arr = [];
      if (data.length > 0) {
        data.forEach((outer, i) => {
          outer.wareHouseTransferLines.forEach((inner, j) => {
            let obj = {};
            obj['isShow'] = false;
            if (j == 0) {
              obj['isShow'] = true;
            }
            obj['_id'] = outer._id;
            obj['index'] = i;
            obj['wareHouseTransferTransactionID'] = outer.wareHouseTransferTransactionID;
            obj['sourceWareHouse'] = outer.sourceWareHouseInfo.wareHouseIDName;
            obj['destinationWareHouse'] = outer.destinationWareHouseInfo.wareHouseIDName;
            obj['quantity'] = inner.transferQuantity;
            obj['status'] = outer.status;
            obj['createdDate'] = inner.requestedDate;
            arr.push(obj);
          });
        });
      }
      return arr
    } */

  getConfirmation(status) {
    if (status === 'Yes') {
      // this.rerender();
      this.headerGet();
      this.get();
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'wareHouseTransfer', id: data };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
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
}
