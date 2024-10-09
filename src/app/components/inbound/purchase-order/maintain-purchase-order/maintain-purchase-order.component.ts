import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AppService } from '../../../../shared/services/app.service';
import { ApexService } from '../../../../shared/services/apex.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../../services/integration-services/wms.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective, } from 'angular-datatables';
import { ExcelRestService } from '../../../../services/integration-services/excel-rest.service';
import { ExcelService } from '../../../../shared/services/excel.service';
import { Constants } from '../../../../constants/constants';
//import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { purchaseOrderHeader } from 'src/app/constants/paginationConstants';
import { DecimalUtils } from 'src/app/constants/decimal';
import * as XLSX from 'xlsx';
import { WmsCommonService } from 'src/app/services/wms-common.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-maintain-purchase-order',
  templateUrl: './maintain-purchase-order.component.html',
  styles: [`.tableColor{color:white!important}`]
})
export class MaintainPurchaseOrderComponent implements OnInit, OnDestroy {

  productStatusTypes: any[] = ['Open', 'Closed'];
  filteredProducts: any[] = [];
  purchaseOrders: any[] = [];
  model: any;
  fromDate: any;
  deleteInfo: any;
  toDate: any;
  status: any = 'Open';
  filteredPurchaseOrders: any[] = [];
  poDataKeys: any = ['', '', '', '', '', '', '', '', '',
    '', '', '', ''];
  poLineKeys: any = ['', '', '', '', '', '', ''];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  // dtTrigger3: any = false;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  dateReq: any = { fromDate: null, toDate: null };
  failureRecords: any = [];
  purchaseOrdersForExcel: any = [];
  missingParams: any;
  isShowOrHideError: any = false;
  suppliers: any = [];
  products: any = [];
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Purchase Order', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  tableHeadings: any = ['S.No', 'WMPO Number', 'Supplier/Customer/Warehouse', 
  'Receipt Type', 'Receipt Date', 'Delivery Date', 'Total Amount', 'Stage Status', 'Status', 'Action']
  showUpToggle: boolean = false
  showDownToggle: boolean = true;
  receiptType: any = null;
  orderTypeDropdown = ['All', 'Purchase Order', 'Sales Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns'];
  shipTOAddressDropdown: any = [];
  shipFromAddressDropdown: any = [];
  billTOAddressDropdown: any = [];
  showTooltip = false;

  constructor(
    private appService: AppService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService,
    private wmsCommonService: WmsCommonService,
    private excelService: ExcelService,
    private toastr: ToastrService,
    private translate: TranslateService, private activateRouter: ActivatedRoute) {
    this.translate.use(this.language);
  }
  configPermissionsList: any = [];

  storeCurrentRoute() {
    const currentRoute = this.activateRouter.snapshot.url.join('/');
    sessionStorage.setItem('currentRoute', currentRoute);
  }

  ngOnInit(): void {
    this.storeCurrentRoute();

    this.receiptType = 'All'
    this.configPermissionsList = this.configService.getConfigurationPermissions('mainFunctionalities', 'Process Permissions', this.configService.getClientRole());
    if (this.configService.getClientRole() && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View', 'Create', 'Update', 'Delete'];
    }
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.getFunctionsCall();
    console.log(this.configPermissionsList);
  }
  getFunctionsCall() {
    console.log(this.permissionsList);
    if (this.permissionsList.includes('View')) {
      this.fetchPOHeaders(1);
      this.fetchAllPurchaseOrders(this.page, this.itemsPerPage);
      this.fetchAllSupplierDetails();
      this.fetchAllProducts();
    }
  }

  setDirection(type, headerName, header) {
    this.sortDirection = type;
    let arr: any = purchaseOrderHeader['purchaseOrderArrays'].filter(x => x.key == headerName);
    if (arr.length > 1) {
      this.sortFields = arr.map(x => x.name);
    }
    else {
      this.sortFields = [arr[0].name];
    }
    if (header) {
      this.fetchPOHeaders(this.pageForHeader);
    }
    else {
      this.fetchAllPurchaseOrders(this.page, this.itemsPerPage);
    }
  }
  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = purchaseOrderHeader['purchaseOrderLinesSortingFields'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.fetchAllPurchaseOrders(this.page, this.itemsPerPage);
    }
    else {

    }
  }
  redirectToCreatePO() {
    if (this.permissionsList.includes('Create')) {
      this.appService.navigate('/v1/inbound/createPurchaseOrder');
    }
    else {
      this.toastr.error("user doesnt have permission");
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchPOHeaders(1);
      this.fetchAllPurchaseOrders(1, 5);
    }
  }
  fetchAllD(page, event, type) {
    if (event) {
      if (type) {
        this.fetchPOHeaders(page);
      }
      else {
        this.fetchAllPurchaseOrders(page, event.target.value);
      }
    }
  }
  delete(data: any) {
    this.deleteInfo = { name: 'purchaseOrder', id: data._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  page: number = 1;
  itemsPerPage = 5;
  pageForHeader: number = 1;
  itemsPerPageForheader = 5;
  totalItems: any;
  headerTotalItems: any = null;
  searchKey: any = null;
  headerSearchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  pageSize: number = 10;
  fetchPOHeaders(page) {
    const sentObj = {
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "orderType": (this.receiptType === 'All') ? null : this.receiptType,
      "status": this.status == 'All' ? null : this.status,
      "etaFrom": this.dateReq.fromDate,
      "etaTo": this.dateReq.toDate,
      "page": page ? page : 1,
      "raisePO": null,
      "pageSize": this.itemsPerPageForheader,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "searchKeyword": this.headerSearchKey,
      "searchOnKeys": purchaseOrderHeader.purchaseOrderHeaderSearchKeys,
    }
    this.wmsService.findAllPurchaseOrdersWithPagination(sentObj, 'header').subscribe(response => {
      if (response && response.status === 0 && response.data.purchaseOrderPaginationResponse) {
        this.purchaseOrders = response.data.purchaseOrderPaginationResponse.purchaseOrders;
        this.headerTotalItems = response.data.purchaseOrderPaginationResponse.totalElements;
      }
    })
  }
  fetchAllPurchaseOrders(page?, pageSize?) {
    const sentObj = {
      "raisePO": null,
      "status": this.status == 'All' ? null : this.status,
      "poDeliveryDateFrom": null,
      "poDeliveryDateTo": null,
      "etaFrom": this.dateReq.fromDate,
      "etaTo": this.dateReq.toDate,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "orderType": (this.receiptType === 'All') ? null : this.receiptType,
      "page": page ? page : 1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": purchaseOrderHeader.purchaseOrderLinesSearchKeys,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
    }
    this.wmsService.findAllPurchaseOrdersWithPagination(sentObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrderPaginationResponse) {

          this.purchaseOrdersForExcel = response.data.purchaseOrderPaginationResponse.purchaseOrders;

          // this.purchaseOrders = response.data.purchaseOrderPaginationResponse;
          this.totalItems = response.data.purchaseOrderPaginationResponse.totalElements;
          this.filteredPurchaseOrders = response.data.purchaseOrderPaginationResponse.purchaseOrders;
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
          this.filteredPurchaseOrders.forEach(k => {
            k['isViewToggle'] = false
          })
          this.rerender();
          this.dtTrigger.next();
          this.getFinalProducts();
        } else {
          this.filteredPurchaseOrders = [];
          this.filteredProducts = [];
          this.rerender();
          this.dtTrigger.next();
          this.dtTrigger2.next();
        }
      },
      (error) => {
        this.filteredPurchaseOrders = [];
      });
  }
  editPurchaseOrder(poID: any) {
    if (this.permissionsList.includes('Update')) {
      this.appService.navigate('/v1/inbound/createPurchaseOrder', { id: poID });
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }

  }
  changeUpToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  changeDownToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  getFinalProducts() {
    const pos = this.filteredPurchaseOrders;
    const products = [];
    pos.forEach(po => {
      for (const key in po) {
        if (key && key === 'purchaseOrderLines') {
          po[key].forEach(a => {
            a.fullWmpoNumber = po.fullWmpoNumber;
            a.receiptDate = po.receiptDate;
            products.push(a);
          });
        }
      }
    });
    this.filteredProducts = products;
    this.dtTrigger2.next();
  }
  // getDate(dateRef: any, dateValue: any) {
  //   if (dateRef === 'fromDate') {
  //     this.fromDate = new Date(dateValue);
  //   } else if (dateRef === 'toDate') {
  //     this.toDate = new Date(dateValue);
  //   }
  // }
  filterDataFromDates() {
    if (this.permissionsList.includes('Update')) {
      if ((this.fromDate && this.toDate && this.fromDate <= this.toDate) || (!this.fromDate && !this.toDate)) {
        this.dateReq.fromDate = this.fromDate;
        this.dateReq.toDate = this.toDate;
        this.fetchPOHeaders(1);
        this.fetchAllPurchaseOrders(1, 5);
      } else {
        this.toastr.error('Select valid dates');
      }
    }
    else {
      this.toastr.error("user doesnt have permission");
    }

  }

  resetPurchaseOrders() {
    if (this.permissionsList.includes('Update')) {
      this.dateReq = { fromDate: null, toDate: null };
      this.fromDate = null;
      this.toDate = null;
      this.status = 'Open';
      this.fetchPOHeaders(1);
      this.fetchAllPurchaseOrders(1, 5);
      this.receiptType = 'All'
    }
    else {
      this.toastr.error("user Doesnt have permission");
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
    //  this.forPermissionsSubscription.unsubscribe();
  }
  /*  exportAsXLSX() {
     if (this.purchaseOrdersForExcel) {
       const data = this.excelService.formatJSONForHeaderLines(this.purchaseOrdersForExcel, 'purchaseOrderLines');
       this.excelService.exportAsExcelFile(data, 'Purchase Orders', Constants.EXCEL_IGNORE_FIELDS.PURCHASE_ORDER);
     } else {
       this.toastr.error('No data found');
     }
   } */

  exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      const changedTaskList = this.exportTypeMethod();
      this.excelService.exportAsExcelFile(changedTaskList, 'Maintain Purchase Order', null);
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  exportTypeMethod() {
    const arr = []
    const obj = {}
    obj['SupplierID'] = null;
    obj['PO Delivery Date'] = null;
    obj['Name(billToAddress)'] = null
    obj['Name(shipToAddress)'] = null
    obj['Name(shipFromAddress)'] = null
    obj['ProductID'] = null
    obj['BrandName'] = null
    obj['Ordered Quantity'] = null
    obj['Order Unit'] = null
    obj['Order Unit Price'] = null
    obj['ETA Date'] = null
    arr.push(obj)
    return arr
  }
  exportData: any = [];
  loopToStop: any = null;
  dataPerPage: number;
  getAllMaintainPurchaseOrderForDownload(index?) {
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
          "searchKeyword": null,
          "orderType": (this.receiptType === 'All') ? null : this.receiptType,
          "searchOnKeys": purchaseOrderHeader.purchaseOrderHeaderSearchKeys,
          "sortDirection": null,
          "sortFields": null,
          "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
          "organizationIDName": this.configService.getOrganization().organizationIDName,
          "raisePO": null,
          "status": this.status == 'All' ? null : this.status,
          "poDeliveryDateFrom": null,
          "poDeliveryDateTo": null,
          "etaFrom": this.dateReq.fromDate,
          "etaTo": this.dateReq.toDate,
        }
        this.wmsService.findAllPurchaseOrdersWithPagination(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.purchaseOrderPaginationResponse) {

              this.purchaseOrdersForExcel = response.data.purchaseOrderPaginationResponse.purchaseOrders;
              this.exportData = [...this.exportData, ...response.data.purchaseOrderPaginationResponse.purchaseOrders];
              this.getAllMaintainPurchaseOrderForDownload(i);
            }
          })
      }
    }
  }
  exportAsXLSX1(key?) {
    if (this.permissionsList.includes('Update')) {
      // if (key) {
      //   const changedTaskList = this.exportTypeMethod(null)
      //   this.excelService.exportAsExcelFile(changedTaskList, 'Maintain Purchase Order', null)
      // } else {
      //   const changedTaskList = this.exportTypeMethod(this.exportData)
      //   this.excelService.exportAsExcelFile(changedTaskList, 'Maintain Purchase Order', null);
      // }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }

  exportTypeMethod1(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['wmpoNumber'] = k.wmpoNumber
        if (k.supplierMasterInfo || k.wareHouseTransferSourceInfo || k.customerMasterInfo) {
          obj['suppierIDName/CustomerName/WarehouseName'] =
            (k.supplierMasterInfo ? k.supplierMasterInfo.supplierName : '') + " " +
            (k.wareHouseTransferSourceInfo ? k.wareHouseTransferSourceInfo.wareHouseName : '') + " " +
            (k.customerMasterInfo ? k.customerMasterInfo.customerName : '');
        }
        else {
          obj['suppierIDName/CustomerName/WarehouseName'] = null
        }
        obj['receiptType'] = k.receiptType
        obj['receiptDate'] = k.receiptDate
        obj['poDeliveryDate'] = k.poDeliveryDate
        obj['totalNetAmount'] = DecimalUtils.fixedDecimal(k.totalNetAmount, 2)
        obj['status'] = k.statusStages[k.statusStages.length - 1].status
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['wmpoNumber'] = null
      obj['suppierIDName/CustomerName/WarehouseName'] = null
      obj['receiptType'] = null
      obj['receiptDate'] = null
      obj['poDeliveryDate'] = null
      obj['totalNetAmount'] = null
      obj['status'] = null
      arr.push(obj)
    }
    return arr
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  setJsonto(event) {
    const obj = this.shipTOAddressDropdown.find(x => x.name == event);
    return obj ? obj : { name: event };
  }
  setJsonFrom(event) {
    if (this.shipFromAddressDropdown.length > 0) {
      const obj = this.shipFromAddressDropdown.find(x => x.name == event);
      return obj ? obj : { name: event };
    }
    else {
      return null;
    }
  }
  setBillTo(event) {
    const obj = this.billTOAddressDropdown.find(x => x.name == event);
    return obj ? obj : { name: event };
  }
  getFormat(jsonData) {
    const data1 = []
    this.missingParams = null;
    jsonData.forEach((k, index) => {
      if (k['SupplierID'] && k['ProductID']) {
        data1.push(this.getHeaderData(k))
      }
      else {
        if (!k['SupplierID'] && k['ProductID']) {
          if (data1.length > 0) {
            data1[data1.length - 1]['purchaseOrderLines'].push(this.getLinesData(k));
          }
          else {
            data1.push(this.getHeaderData(k))
          }
        }
        if (k['SupplierID'] && !k['ProductID']) {
          data1.push(this.getHeaderData(k))
        }
        if (!k['SupplierID'] && !k['ProductID']) {
          if (data1.length > 0) {
            data1[data1.length - 1]['purchaseOrderLines'].push(this.getLinesData(k));
          }
        }
      }
    })
    return data1
  }
  getHeaderData(doc) {
    return {
      supplierMasterInfo: this.mapSupplierMasterID(doc['SupplierID']),
      poDeliveryDate: doc['PO Delivery Date'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['PO Delivery Date']) : null,
      billToAddress: doc['Name(billToAddress)'] ? this.setBillTo(doc['Name(billToAddress)']) : null,
      shipToAddress: doc['Name(shipToAddress)'] ? this.setJsonto(doc['Name(shipToAddress)']) : null,
      shipFromAddress: doc['Name(shipFromAddress)'] ? this.setJsonFrom(doc['Name(shipFromAddress)']) : null,
      receiptDate: this.getDateForImport(),
      purchaseOrderLines: [this.getLinesData(doc)]
    }
  }
  getDateForImport(data?) {
    const date = data ? new Date(data) : new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  mapProductMasterID(doc) {
    let filteredProduct = null;
    if (doc['ProductID'] && this.products.length > 0) {
      const productID = doc['ProductID'];
      filteredProduct = this.products.find(x => x.productID == productID);
      if (filteredProduct) {
        return {
          "productIDName": filteredProduct.productIDName,
          "productID": filteredProduct.productID,
          "productName": filteredProduct.productName,
          "productMasterID": filteredProduct._id
        }
      }
      else {
        return {
          "productIDName": null,
          "productID": productID,
          "productName": null,
          "productMasterID": null,
        }
      }
    }
    else {
      return {
        productIDName: null,
        productID: null,
        productMasterID: null,
        productName: null,
      };
    }
  }
  getLinesData(doc) {
    let arr = [];
    if (doc['Serial Numbers'] && doc['Serial Numbers'].toString().includes(',')) {
      arr = doc['Serial Numbers'].toString().split(',');
    }
    else {
      arr = doc['Serial Numbers'] ? [doc['Serial Numbers']] : null;
    }
    return {
      productMasterInfo: this.mapProductMasterID(doc),
      eta: doc['ETA Date'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['ETA Date']) : null,
      brandName: doc['BrandName'] ? doc['BrandName'] : null,
      // batchNumber: doc['Batch Number'] ? doc['Batch Number'] : null,
      // serialNumbers: arr,
      units: doc['Order Unit'] ? doc['Order Unit'] : null,
      quantity: doc['Ordered Quantity'] ? doc['Ordered Quantity'].toString() : null,
      orderUnitPrice: doc['Order Unit Price'] ? doc['Order Unit Price'] : null,
    }
  }
  uploadExcel(event) {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      if (file) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = async (e) => {
          const arrayBuffer: any = fileReader.result;
          const fileData = new Uint8Array(arrayBuffer);
          const arr = new Array();
          for (let i = 0; i !== fileData.length; ++i) { arr[i] = String.fromCharCode(fileData[i]); }
          const bstr = arr.join('');
          const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
          if (jsonData && jsonData.length > 0) {
            const missingParamsArray = [];
            let data1 = this.getFormat(jsonData);
            if (missingParamsArray.length > 0) {
              this.missingParams = missingParamsArray;
            }
            data1.forEach(line => {
              line['organizationInfo'] = this.configService.getOrganization();
              line['wareHouseInfo'] = this.configService.getWarehouse();
              line['receiptType'] = 'Purchase Order';
              line.purchaseOrderLines.forEach(element => {
                if (!element.eta) {
                  element.eta = line.poDeliveryDate ? line.poDeliveryDate : null;
                }
              });
            })
            if (data1.length > 0) {
              console.log(data1);
              this.wmsService.purchaseOrderImportExcel(data1).subscribe(res => {
                if (res && res.status === 0 && res.data.purchaseOrderResponseMap && res.data.purchaseOrderResponseMap.purchaseOrderSuccessExcelList &&
                  res.data.purchaseOrderResponseMap.purchaseOrderSuccessExcelList.length > 0) {
                  this.toastr.success('Uploaded successfully');
                  this.fetchPOHeaders(1);
                  this.fetchAllPurchaseOrders(1, this.itemsPerPage);
                  this.failureRecords = [];
                }
                else if (res && (res.status === 2 || res.status == 0) && res.data.purchaseOrderResponseMap && res.data.purchaseOrderResponseMap.purchaseOrderFailureExcelList &&
                  res.data.purchaseOrderResponseMap.purchaseOrderFailureExcelList.length > 0 && res.data.purchaseOrderResponseMap.purchaseOrderSuccessExcelList &&
                  res.data.purchaseOrderResponseMap.purchaseOrderSuccessExcelList.length > 0) {
                  this.failureRecords = res.data.purchaseOrderResponseMap.purchaseOrderFailureExcelList;
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.fetchPOHeaders(1);
                  this.fetchAllPurchaseOrders(1, this.itemsPerPage);
                }
                else if (res && (res.status === 2 || res.status == 0) && res.data.purchaseOrderResponseMap && res.data.purchaseOrderResponseMap.purchaseOrderFailureExcelList &&
                  res.data.purchaseOrderResponseMap.purchaseOrderFailureExcelList.length > 0) {
                  this.failureRecords = res.data.purchaseOrderResponseMap.purchaseOrderFailureExcelList;
                  this.toastr.error('Failed in uploading, Please download log for reasons');
                }
                else {
                  this.toastr.error('Failed in uploading');
                  this.failureRecords = [];
                }
              })
            }
          }
        }
      }
    }
  }
  // uploadExcel = async (event) => {
  //   if (event.target.files && event.target.files[0]) {
  //     this.failureRecords = [];
  //     this.isShowOrHideError = false;
  //     await this.excelService.generateJsonUsingExcel(event);
  //     setTimeout(() => {
  //       const jsonData = this.excelService.getJsonData();
  //       const endArray = [];
  //       event.target.value = '';
  //       const missingParamsArray = this.mandatoryCheck(jsonData);
  //       if (missingParamsArray.length > 1) {
  //         this.failureRecords = missingParamsArray;
  //         this.toastr.error('Please download log file to fill mandatory fields');
  //       } else {
  //         jsonData.forEach(record => {
  //           const { supplierID, supplierName, supplierIDName, storageType, storageDescription,
  //             currency, poDeliveryDate, poReferenceA, poReferenceB, receiptDate,
  //             receiptType, referencePONumber, remarks, shipTOAddress, taxGroup,
  //             taxGroupDescription, termsAndConditions, termsOfPayment, wmpoNumber, status, totalAmount, ...filteredrecord } = record;
  //           const { productID, productName, productIDName, wmsPOLineNumber, ...filteredLine } = JSON.parse(JSON.stringify(filteredrecord));
  //           if (record['supplierID'] && record['supplierName']) {
  //             endArray.push({
  //               "organizationInfo": this.configService.getOrganization(),
  //               "wareHouseInfo": this.configService.getWarehouse(),
  //               currency, poReferenceA, poReferenceB,
  //               receiptType, referencePONumber, remarks, shipTOAddress,
  //               taxGroup: { taxGroup, taxGroupDescription },
  //               termsAndConditions,
  //               termsOfPayment: termsOfPayment,
  //               poDeliveryDate: poDeliveryDate ? poDeliveryDate : null,
  //               receiptDate: receiptDate ? receiptDate : null,
  //               supplierMasterInfo: {
  //                 supplierMasterID: this.mapSupplierMasterID(supplierID),
  //                 supplierID,
  //                 supplierName,
  //                 supplierIDName
  //               },
  //               storageTypeInfo: { storageType: storageType, storageDescription },
  //               purchaseOrderLines: [
  //                 {
  //                   ...filteredLine, productMasterInfo: {
  //                     productMasterID: this.mapProductMasterID(productID),
  //                     productID,
  //                     productName,
  //                     productIDName
  //                   }
  //                 }
  //               ]
  //             });
  //           } else {
  //             if (endArray.length > 0) {
  //               endArray[endArray.length - 1].purchaseOrderLines.push({
  //                 ...filteredLine, productMasterInfo: {
  //                   productMasterID: this.mapProductMasterID(productID),
  //                   productID,
  //                   productName,
  //                   productIDName
  //                 }
  //               });
  //             }
  //           }

  //         });

  //         if (endArray && endArray.length > 0) {
  //           this.excelRestService.savePurchaseOrderBulkdata(endArray).subscribe(res => {
  //             if (res && res.status === 0 && res.data.purchaseOrders && res.data.purchaseOrders.failureList &&
  //               res.data.purchaseOrders.failureList.length > 0 && res.data.purchaseOrders.successList &&
  //               res.data.purchaseOrders.successList.length > 0) {
  //               this.failureRecords = res.data.purchaseOrders.failureList;
  //               this.toastr.error('Partially failed in uploading, Please download log for reasons');
  //             } else if (res && res.status === 0 && res.data.purchaseOrders && res.data.purchaseOrders.failureList && res.data.purchaseOrders.failureList.length > 0) {
  //               this.failureRecords = res.data.purchaseOrders.failureList;
  //               this.toastr.error('Failed in uploading, Please download log for reasons');
  //             } else if (res && res.status === 0 && res.data.purchaseOrders && res.data.purchaseOrders.failureList && res.data.purchaseOrders.failureList.length === 0) {
  //               this.fetchAllPurchaseOrders();
  //               this.rerender();
  //               this.toastr.success('Uploaded successfully');
  //               this.failureRecords = [];
  //             } else {
  //               this.toastr.error('Failed in uploading');
  //               this.failureRecords = [];
  //             }
  //           },
  //             error => { });
  //         }
  //       }

  //     }, 500);
  //   }
  // }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['supplierID'] && record['supplierName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PURCHASE_ORDER_HEADER.concat(Constants.UPLOAD_MANDAT_FIELDS.PURCHASE_ORDER_LINE);
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        } else {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PURCHASE_ORDER_LINE;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArray;
  }
  mapSupplierMasterID(supplierID) {
    if (supplierID && this.suppliers.length > 0) {
      const filteredSupplier = this.suppliers.find(supplier => supplier.supplierID === supplierID.toString());
      if (filteredSupplier && filteredSupplier._id) {
        this.shipFromAddressDropdown = filteredSupplier ? filteredSupplier.shipFromAddresses : [];
        return {
          supplierID: filteredSupplier.supplierID,
          supplierIDName: filteredSupplier.supplierIDName,
          supplierMasterID: filteredSupplier._id,
          supplierName: filteredSupplier.supplierName,
        }
      }
      else {
        return {
          supplierID: supplierID,
          supplierIDName: null,
          supplierMasterID: null,
          supplierName: null,
        }
      }
    }
  }
  // mapProductMasterID(productID) {
  //   if (productID && this.products.length > 0) {
  //     const filteredProduct = this.products.find(product => product.productID === productID);
  //     if (filteredProduct && filteredProduct._id) {
  //       return filteredProduct._id;
  //     }
  //   }
  // }
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;

        }
      },
      (error) => {
      });
    this.wmsService.fetchAllWarehouses(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          if (response.data.wareHouses && response.data.wareHouses.length > 0) {
            this.shipTOAddressDropdown = response.data.wareHouses[0].shipToAddresses;
            this.billTOAddressDropdown = response.data.wareHouses[0].billToAddresses;
          }
        }
      })
  }
  fetchAllProducts() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
        }
      },
      (error) => {
      });
  }
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };
  dyanmicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement("a");
    }
    const element = this.setting.element.dynamicDownload;
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Purchase Order Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}
