import { Component, OnInit, ViewChild, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { AppService } from '../../../../shared/services/app.service';
import { OutboundProcessService } from '../../../../services/integration-services/outboundProcess.service';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { Router } from '@angular/router';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { salesOrderrHeader } from 'src/app/constants/paginationConstants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import * as XLSX from 'xlsx';
import { OutboundMasterDataService } from 'src/app/services/integration-services/outboundMasterData.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Constants } from 'src/app/constants/constants';
import { WmsCommonService } from 'src/app/services/wms-common.service';
@Component({
  selector: 'app-maintain-sales-order',
  templateUrl: './maintain-sales-order.component.html'
})
export class MaintainSalesOrderComponent implements OnInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  productStatusTypes: any = ['Open', 'Closed'];
  salesOrders: any = [];
  filteredSalesOrders: any = [];
  filteredSalesOrderKeys: any = ['#', 'WMSO Number', 'Customer/Warehouse IDName', 'Customers CustomerName', 'Customers CustomerAddress', 'Ship To Address', 'Order Date', 'Delivery expected Date',
    'Order Type', 'Total Amount', 'Status', 'Action'];
  filteredSOProducts: any = [];
  sOProducts: any = [];
  filteredSOProductKeys: any = ['#', 'WMSO Number', 'WMSO Line Number', 'Product ID/Name', 'Order Quantity', 'Order Date', 'Expected Delivery Date'];
  customerID: any = '';
  fromDate: any;
  toDate: any;
  status: any = 'Open';
  serialNumberAllocation: any = 'No';
  thirdPartyCustomersCheckAllocation = 'No';
  reqObj = { customerID: this.customerID, expectedDeliveryDateFrom: null, expectedDeliveryDateTo: null };
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  deleteInfo: any;
  locAllocation = { "_id": null, "pickingLocationAllocationType": "Manual", "isActive": true };
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
  exportData: any = [];
  failureRecords: any = [];
  missingParams: any;
  customerList: any = [];
  tableHeadings: any = ['Sr.No', 'WMSO Number', 'Customer/Supplier/Warehouse', 'Order Type', 'Order Date', 'Confirmed By', 'Confirmed Date', 'Total Amount', 'Action']
  orderType: any = null;
  orderTypeDropdown = ['All', 'Sales Order', 'Purchase Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns'];
  permissionsListForCart = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Workforce Picking', Storage.getSessionUser(), null, 'sendEmpty');
  shipTOAddressDropdown: any = [];
  shipFromAddressDropdown: any = [];
  billTOAddressDropdown: any = [];
  products: any = [];
  locations: any = [];
  salesOrderData: any = [];
  showTooltip: any = false;
  fProducts: any = null;

  constructor(private appService: AppService, public configService: ConfigurationService,
    private toastr: ToastrService, private router: Router, private metaDataService: MetaDataService,
    private outboundProcessService: OutboundProcessService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService, private excelService: ExcelService, private wmsCommonService: WmsCommonService,
    private outboundMasterDataService: OutboundMasterDataService, private wmsService: WMSService) {
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
         this.formObj = this.configService.getGlobalpayload();
         this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
         this.getFunctionsCall();
       }
     }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    this.findAllSalesOrdersForHeader(1);
    this.findAllSalesOrders(1, this.itemsPerPage);
    if (this.permissionsList.includes('View')) {
      this.fetchSerialConfig();
    }
    this.fetchAllWarehouses();
    this.fetchAllCustomers();
  }
  fetchAllWarehouses() {
    this.wmsService.fetchWareHouseDetailsByID(Constants.WAREHOUSE_ID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse && response.data.wareHouse) {
          this.shipFromAddressDropdown = response.data.wareHouse.shipFromAddresses;
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllCustomers() {
    this.outboundMasterDataService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers) {
          this.customerList = response.data.customers;
        }
      })
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
        }
      },
      (error) => {
      });
    this.wmsService.fetchAllLocations(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locations = response.data.locations;
        }
      },
      (error) => {
      });
    this.metaDataService.getLocationAllocationType(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.pickingLocationAllocationConfigurations && res.data.pickingLocationAllocationConfigurations.length > 0) {
        this.locAllocation = res.data.pickingLocationAllocationConfigurations[0];
      }
      else {
        this.locAllocation = { "_id": null, "pickingLocationAllocationType": "Manual", "isActive": true }
      }
    })
    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
  }
  fetchAllDHeader(page, event) {
    console.log(page)
    console.log(event);
    if (event) {
      this.findAllSalesOrdersForHeader(page);
    }
  }
  fetchAllDLines(page, event, header?) {
    console.log(page)
    console.log(event);
    if (event) {
      this.findAllSalesOrders(page, event.target.value);
    }


  }
  downloadLogFile() {
    let htmlText = '';
    if (this.failureRecords) {
      htmlText = this.failureRecords.toString().replace(/,/g, '\r\n');;
    }
    this.dyanmicDownloadByHtmlTag({
      fileName: "Sales Order Error Details",
      text: htmlText
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
  exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      const changedTaskList = this.exportTypeMethod();
      this.excelService.exportAsExcelFile(changedTaskList, 'Maintain Sales Order', null);
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  exportTypeMethod() {
    const arr = []
    const obj = {}
    obj['CustomerID'] = null;
    (this.thirdPartyCustomersCheckAllocation == 'Yes') ? obj['Customers customer Name'] = null : '';
    (this.thirdPartyCustomersCheckAllocation == 'Yes') ? obj['Customers customer Address'] = null : '';
    obj['Expected Delivery Date'] = null;
    obj['Name(billToAddress)'] = null
    obj['Name(shipToAddress)'] = null
    obj['Name(shipFromAddress)'] = null;
    obj['Ex BondDate'] = null;
    obj['Ex BondNumber'] = null;
    obj['ProductID'] = null
    obj['BrandName'] = null
    obj['Exp Delivery Date'] = null;
    obj['Ordered Quantity'] = null
    obj['Shipment Unit'] = null
    // this.locAllocation.pickingLocationAllocationType
    obj['Pickup Location Line Number'] = null
    obj['inventoryIDPrefix'] = null
    obj['inventoryID'] = null
    obj['Pickup Location Name'] = null
    obj['Picked Quantity'] = null
    obj['Line ExBondDate'] = null;
    obj['Line ExBondNumber'] = null;
    obj['Batch Number'] = null;
    (this.serialNumberAllocation == 'Yes') ? obj['Serial Numbers'] = null : '';
    arr.push(obj)
    return arr
  }
  getFormat(jsonData) {
    const data1 = []
    this.missingParams = null;
    jsonData.forEach((k, index) => {
      if (k['CustomerID'] && k['ProductID']) {
        data1.push(this.getHeaderData(k))
      }
      else {
        if (!k['CustomerID'] && k['ProductID']) {
          if (data1.length > 0) {
            data1[data1.length - 1]['salesOrderLines'].push(this.getLinesData(k));
          }
          else {
            data1.push(this.getHeaderData(k))
          }
        }
        if (k['CustomerID'] && !k['ProductID']) {
          data1.push(this.getHeaderData(k))
        }
        else if (!k['CustomerID'] && !k['ProductID']) {
          if (k['Pickup Location Line Number'] && data1.length > 0) {
            const soLength = data1[data1.length - 1]['salesOrderLines'].length;
            data1[data1.length - 1]['salesOrderLines'][soLength - 1]['inventoryHelpers'].push(this.getInventoryHelpersDetails(k));
          }
        }
      }
    })
    return data1
  }
  getHeaderData(doc) {
    return {
      customerMasterInfo: this.mapCustomer(doc),
      customersCustomerName: doc['Customers customer Name'] ? doc['Customers customer Name'] : null,
      customersCustomerAddress: doc['Customers customer Address'] ? doc['Customers customer Address'] : null,
      deliveryExpDate: doc['Expected Delivery Date'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['Expected Delivery Date']) : null,
      billToAddress: doc['Name(billToAddress)'] ? this.setBillTo(doc['Name(billToAddress)']) : null,
      shipToAddress: doc['Name(shipToAddress)'] ? this.setJsonto(doc['Name(shipToAddress)']) : null,
      shipFromAddress: doc['Name(shipFromAddress)'] ? this.setJsonFrom(doc['Name(shipFromAddress)']) : null,
      exBondDate: doc['Ex BondDate'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['Ex BondDate']) : null,
      exBondNumber: doc['Ex BondNumber'],
      soOrderDate: this.getDateForImport(),
      salesOrderLines: [this.getLinesData(doc)]
    }
  }
  mapProductMasterID(doc) {
    let filteredProduct = null;
    if (doc['ProductID'] && this.products.length > 0) {
      const productID = doc['ProductID'];
      filteredProduct = this.products.find(x => x.productID == productID);
      this.fProducts = filteredProduct;
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
    this.fProducts = null;
    let arr = [];
    if (doc['Serial Numbers'] && doc['Serial Numbers'].toString().includes(',')) {
      arr = doc['Serial Numbers'].toString().split(',');
    }
    else {
      arr = doc['Serial Numbers'] ? [doc['Serial Numbers']] : null;
    }
    return {
      _id: null,
      sequenceNumber: null,
      productMasterInfo: this.mapProductMasterID(doc),
      inventoryHelpers: doc['Pickup Location Line Number'] ? [this.getInventoryHelpersDetails(doc)] : [],
      expectedDeliveryDate: doc['Exp Delivery Date'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['Exp Delivery Date']) : null,
      brandName: doc['BrandName'] ? doc['BrandName'] : null,
      batchNumber: doc['Batch Number'] ? doc['Batch Number'] : null,
      serialNumbers: arr,
      shipmentUnit: doc['Shipment Unit'] ? doc['Shipment Unit'] : null,
      inventoryUnit: this.fProducts ? this.fProducts.inventoryUnit : null,
      orderQuantity: doc['Ordered Quantity'] ? doc['Ordered Quantity'].toString() : null,
      exBondDate: doc['Line ExBondDate'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['Line ExBondDate']) : null,
      exBondNumber: doc['Line ExBondNumber'],
    }
  }
  getInventoryHelpersDetails(doc) {
    let fullID = null;
    if (doc['inventoryIDPrefix']) {
      fullID = doc['inventoryIDPrefix'].trim();
    }
    if (doc['inventoryID']) {
      if (fullID) {
        fullID = fullID + doc['inventoryID'].toString().trim();
      }
      else {
        fullID = doc['inventoryID'].toString().trim();
      }
    }
    if (doc['Pickup Location Line Number'] && doc['Pickup Location Name'] && doc['Picked Quantity']) {
      const _idLocal = this.locations.find(loc => loc.locationName === (doc['Pickup Location Name']).replace(/\s/g, ""));
      let obj = {
        locationInfo: {
          "locationID": _idLocal ? _idLocal._id : null,
          "locationName": doc['Pickup Location Name'],
        },
        "pickedQuantity": doc['Picked Quantity'],
        inventoryIDPrefix: doc['inventoryIDPrefix'] ? doc['inventoryIDPrefix'].trim() : null,
        "inventoryID": doc['inventoryID'] ? doc['inventoryID'] : null,
        fullInventoryID: fullID,
      }
      return obj
    }
    else {
      return {
        locationInfo: {
          "locationID": null,
          "locationName": doc['Pickup Location Name'] ? doc['Pickup Location Name'] : null,
        },
        "pickedQuantity": doc['Picked Quantity'] ? doc['Picked Quantity'] : null,
        inventoryIDPrefix: doc['inventoryIDPrefix'] ? doc['inventoryIDPrefix'].trim() : null,
        "inventoryID": doc['inventoryID'] ? doc['inventoryID'] : null,
        fullInventoryID: fullID
      }
    }
  }
  getDateForImport(data?) {
    const date = data ? new Date(data) : new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  setJsonto(event) {
    const obj = this.shipTOAddressDropdown.find(x => x.name == event);
    if (obj) {
      return obj;
    }
    else {
      return { name: event };
    }
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
  mapCustomer(doc) {
    const filteredC = this.customerList.find(x => x.customerID == doc['CustomerID']);
    if (filteredC) {
      this.shipTOAddressDropdown = filteredC.shipToAddresses;
      this.billTOAddressDropdown = filteredC.billToAddresses;
      return {
        "customerIDName": filteredC.customerIDName,
        "customerID": filteredC.customerID,
        "customerName": filteredC.customerName,
        "customerMasterID": filteredC._id
      }

    }
    else {
      return {
        "customerIDName": null,
        "customerID": doc['CustomerID'],
        "customerName": null,
        "customerMasterID": null,
      }
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
              line['orderType'] = 'Sales Order';
              line.salesOrderLines.forEach(element => {
                element.locationAllocationType = this.locAllocation.pickingLocationAllocationType;
                if (element.locationAllocationType == 'Auto') {
                  element.inventoryHelpers = null;
                }
                if (!element.expectedDeliveryDate) {
                  element.expectedDeliveryDate = line.deliveryExpDate ? line.deliveryExpDate : null;
                }
                if (!element.exBondDate) {
                  element.exBondDate = line.exBondDate ? line.exBondDate : null;
                }
                if (!element.exBondNumber) {
                  element.exBondNumber = line.exBondNumber ? line.exBondNumber : null;
                }
              });
            })
            if (data1.length > 0) {
              this.wmsService.soUploadExcel(data1).subscribe(res => {
                if (res && res.status === 0 && res.data.salesOrderResponseMap && res.data.salesOrderResponseMap.salesOrderSuccessExcelList &&
                  res.data.salesOrderResponseMap.salesOrderSuccessExcelList.length > 0) {
                  this.toastr.success('Uploaded successfully');
                  this.findAllSalesOrdersForHeader(1);
                  this.findAllSalesOrders(1, this.itemsPerPage);
                  this.failureRecords = [];
                }
                else if (res && (res.status === 2 || res.status == 0) && res.data.salesOrderResponseMap && res.data.salesOrderResponseMap.salesOrderFailureExcelList &&
                  res.data.salesOrderResponseMap.salesOrderFailureExcelList.length > 0 && res.data.salesOrderResponseMap.salesOrderSuccessExcelList &&
                  res.data.salesOrderResponseMap.salesOrderSuccessExcelList.length > 0) {
                  this.failureRecords = res.data.salesOrderResponseMap.salesOrderFailureExcelList;
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.findAllSalesOrdersForHeader(1);
                  this.findAllSalesOrders(1, this.itemsPerPage);
                }
                else if (res && (res.status === 2 || res.status == 0) && res.data.salesOrderResponseMap && res.data.salesOrderResponseMap.salesOrderFailureExcelList &&
                  res.data.salesOrderResponseMap.salesOrderFailureExcelList.length > 0) {
                  this.failureRecords = res.data.salesOrderResponseMap.salesOrderFailureExcelList;
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
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = salesOrderrHeader['salesOrderHeaderSortFieldsArrays'].filter(x => x.key == headerName);
    if (arr.length > 1) {
      this.sortFields = arr.map(x => x.name);
    }
    else {
      this.sortFields = [arr[0].name];
    }
    if (headerName) {
      this.findAllSalesOrdersForHeader(1);
    }
    else {
    }
  }
  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = salesOrderrHeader['salesOrderLinesSortFieldsArrays'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.findAllSalesOrders(1, this.itemsPerPage);
    }
    else {

    }
  }
  fetchSerialConfig() {
    this.metaDataService.getAllSerialNumberConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberAllocation = res.data.serialNumberConfigurations[0].serialNumberCheck;
      }
      else {
        this.serialNumberAllocation = 'No';
      }
    })
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.findAllSalesOrdersForHeader(1);
      this.findAllSalesOrders(1);
    }
  }
  delete(data: any) {
    this.deleteInfo = { name: 'salesOrder', id: data._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  navigatetoCreatePage() {
    if (this.permissionsList.includes('Create')) {
      this.router.navigate(['/v1/outbound/createSalesOrder'])
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  navigateToSch(data) {
    sessionStorage.setItem('idInfos', JSON.stringify(data))
    this.appService.navigate(`v1/outbound/picking`);
  }
  filterSalesOrders(status: any) {
    this.rerender();
    if (status === '0') {
      this.filteredSalesOrders = this.salesOrders.slice();
      this.dtTrigger.next();
    } else {
      this.filteredSalesOrders = this.salesOrders.filter((order: any) => {
        return order.status === status;
      });
      this.dtTrigger.next();
    }
    this.getFinalProducts();
  }
  findAllSalesOrdersForHeader(page) {
    this.reqObj['organizationIDName'] = this.configService.getOrganization().organizationIDName;
    this.reqObj['wareHouseIDName'] = this.configService.getWarehouse().wareHouseIDName;
    this.reqObj['status'] = this.status == 'All' ? null : this.status;
    this.reqObj['page'] = page ? page : 1;
    this.reqObj['pageSize'] = this.headerItemsPerPage;
    this.reqObj['searchKeyword'] = this.headerSearchKey;
    this.reqObj['orderType'] = (this.orderType === 'All') ? null : this.orderType;
    this.reqObj['searchOnKeys'] = salesOrderrHeader.salesOrderHeaderSearchOnKeys;
    this.reqObj['sortDirection'] = this.sortDirection;
    this.reqObj['sortFields'] = this.sortFields
    this.outboundProcessService.findAllSalesOrdersWithPagination(JSON.stringify(this.reqObj), 'header').subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.salesOrderPaginationResponse.salesOrders.length > 0) {
          this.salesOrderData = response.data.salesOrderPaginationResponse.salesOrders;
          this.headerTotalItems = response.data.salesOrderPaginationResponse.totalElements;
        }
        else {
          this.salesOrderData = []

        }
      })
  }
  findAllSalesOrders(page?, pageSize?) {
    this.reqObj['organizationIDName'] = this.configService.getOrganization().organizationIDName;
    this.reqObj['wareHouseIDName'] = this.configService.getWarehouse().wareHouseIDName;
    this.reqObj['status'] = this.status == 'All' ? null : this.status;
    this.reqObj['page'] = page ? page : 1;
    this.reqObj['pageSize'] = this.itemsPerPage;
    this.reqObj['searchKeyword'] = this.searchKey;
    this.reqObj['orderType'] = (this.orderType === 'All') ? null : this.orderType;
    this.reqObj['searchOnKeys'] = salesOrderrHeader.salesOrderLinesSearchOnKeys;
    this.reqObj['sortDirection'] = this.sortDirection;
    this.reqObj['sortFields'] = this.sortFields
    this.outboundProcessService.findAllSalesOrdersWithPagination(JSON.stringify(this.reqObj)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.salesOrderPaginationResponse.salesOrders.length > 0) {
          this.salesOrders = response.data.salesOrders;
          this.filteredSalesOrders = response.data.salesOrderPaginationResponse.salesOrders;
          this.totalItems = response.data.salesOrderPaginationResponse.totalElements;
          this.rerender();
          this.dtTrigger.next();
          this.getFinalProducts();
        } else {
          this.filteredSalesOrders = [];
          this.filteredSOProducts = [];
          this.rerender();
          this.dtTrigger.next();
          this.dtTrigger2.next();
        }
      },
      (error) => {
        this.salesOrders = [];
      });
  }
  getFinalProducts() {
    const salesOrders = this.filteredSalesOrders;
    const products = [];
    salesOrders.forEach(so => {
      for (const key in so) {
        if (key === 'salesOrderLines') {
          so[key].forEach(a => {
            a.fullWmsoNumber = so.wmsoNumberPrefix + so.wmsoNumber;
            // a.customerID = so.customerMasterInfo.customerID || '';
            a.soOrderDate = so.soOrderDate || '';
            products.push(a);
          });
        }
      }
    });
    this.sOProducts = products;  //not using
    this.filteredSOProducts = products;
    this.dtTrigger2.next();
  }
  editSalesOrder(soID: any) {
    this.appService.navigate('/v1/outbound/createSalesOrder', { id: soID });
  }
  getDate(dateRef: any, dateValue: any) {
    if (dateRef === 'fromDate') {
      this.fromDate = new Date(dateValue);
    } else if (dateRef === 'toDate') {
      this.toDate = new Date(dateValue);
    }
  }
  filterDataFromDates() {
    if ((this.fromDate && this.toDate && this.fromDate <= this.toDate) || (!this.fromDate && !this.toDate)) {
      // let filteredPOS = [];
      // filteredPOS = this.commonService.getProductBWDates(
      //   {fromDate: this.fromDate,
      //    toDate: this.toDate,
      //    currentDate: 'soOrderDate',
      //    products: this.salesOrders});
      // if (filteredPOS.length > 0) {
      //   this.filteredSalesOrders = filteredPOS;
      //   this.getFinalProducts();
      // } else {
      //   this.filteredSalesOrders = [];
      //   this.filteredSOProducts = [];
      // }
      this.reqObj.expectedDeliveryDateFrom = this.fromDate;
      this.reqObj.expectedDeliveryDateTo = this.toDate;
      // this.rerender();
      this.findAllSalesOrdersForHeader(1);
      this.findAllSalesOrders(1);
    } else {
      this.toastr.error('Select valid date difference');
    }
  }
  reset() {
    this.reqObj = { customerID: '', expectedDeliveryDateFrom: null, expectedDeliveryDateTo: null };
    // this.filteredSalesOrders = this.salesOrders;
    // this.getFinalProducts();
    //this.rerender();
    this.status = 'Open';
    this.orderType = "All";
    this.findAllSalesOrdersForHeader(1);
    this.findAllSalesOrders(1);
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
