import { Component, OnInit, ViewChildren, QueryList, OnDestroy, ViewChild } from '@angular/core';
import { WMSService } from '../../../../services/integration-services/wms.service';
import { AppService } from '../../../../shared/services/app.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective, } from 'angular-datatables';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import * as XLSX from 'xlsx';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Constants } from 'src/app/constants/constants';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WmsCommonService } from 'src/app/services/wms-common.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
import { DecimalUtils } from 'src/app/constants/decimal';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-maintain-goods-receipt',
  templateUrl: './maintain-goods-receipt.component.html',
  styles: [`.multiselect-dropdown .dropdown-btn{
    padding:0px 12px!important
  }
  .multiselect-dropdown.dropdown-btn .dropdown-multiselect__caret:before {
    position: relative;
    right: 0;
    top: 65%;
    color: #999;
    margin-top: 4px;
    border-style: solid;
    border-width: 5px 5px 0!important;
    border-color: #999 transparent;
    content: "";
    font-size: 10px; /* Adjust the font size as needed */
}`]
})
export class MaintainGoodsReceiptComponent implements OnInit, OnDestroy {
  filteredGoodsReceipts: any[] = [];
  grnData: any = [];
  goodsReceipts: any[] = [];
  filteredGoodsReceiptLines: any[] = [];
  grnDateFrom: any = null;
  grnDateTo: any = null;
  status: any = 'Open';
  productStatusTypes: any[] = ['Open', 'Closed'];
  grnDataKeys: any = ['#', 'WMPO Number', 'Supplier/Warehouse IDName', 'Receipt Type', 'Receipt Date', 'Status', 'Action'];
  grnDate: any;
  failureRecords: any = [];
  MANDITORY_FIELDS = ['quantity', 'supplierID', 'productID']
  missingParams: any;
  suppliers: any = [];
  supplierByProducts: any = [];
  products: any = [];
  uomConversions: any = [];
  filteredProduct = null;
  locReceiveAllocation = 'Manual';
  locReturnAllocation = 'Manual';
  locations: any = [];
  serialNumberAllocation = 'No';
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Goods Receiving', Storage.getSessionUser());
  forPermissionsSubscription: any;
  thirdPartyCustomersCheckAllocation = 'No';
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  grNoteInvoices: any = [];
  serviceProviders: any = [];
  vehicles: any = [];
  equipments: any = [];
  shipTOAddressDropdown: any = [];
  shipFromAddressDropdown: any = [];
  billTOAddressDropdown: any = [];
  shelfLife: any = null;
  datePipe: any;
  orderType: any = null;
  orderTypeDropdown = ['All', 'Purchase Order', 'Sales Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns'];
  supplierIDForLine: any = null;
  permissionsListForCart = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Workforce Putaway', Storage.getSessionUser(), null, 'sendEmpty');
  grnManualUpload: any = 'No';
  exportData: any = [];
  dataPerPage: number;
  loopToStop: any = null;
  selectedRectoDownload: any = [];

  constructor(private wmsService: WMSService, private wmsCommonService: WmsCommonService,
    private metaDataService: MetaDataService,
    private toastr: ToastrService, private configService: ConfigurationService,
    private appService: AppService, private commonMasterDataService: CommonMasterDataService,
    private router: Router, private excelService: ExcelService,
    private translate: TranslateService, private activateRouter: ActivatedRoute) {
    this.translate.use(this.language);
  }
  storeCurrentRoute(url: string) {
    const currentRoute = this.activateRouter.snapshot.url.join('/');
    sessionStorage.setItem('currentRoute', url);
  }
  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.storeCurrentRoute(event.urlAfterRedirects);
      });
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
    /* this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Goods Receiving', Storage.getSessionUser());
        this.formObj = this.configService.getGlobalpayload();
        this.getCalls();
      }
    }) */
    this.getCalls();
  }
  getCalls() {
    if (this.permissionsList.includes('View')) {
      this.grnHeadersData(1);
      this.FetchAllGoodsReceipts(1, this.itemsPerPage);
      this.fetchGrnUploadConfig();
      this.fetchAllProducts();
      this.fetchAllUOMs();
      this.fetchAllSupplierDetails();
      this.fetchAllocationType();
      this.fetchAllLocations();
      this.grnNotes();
      this.fetchAllVehicles();
      this.fetchAllEquipments();
      this.fetchAllServiceProvider();
      this.fetchAllWarehouses();
    }
  }
  fetchAllWarehouses() {
    this.wmsService.fetchAllWarehouses(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status == 0 && response.data.wareHouses) {
          if (response.data.wareHouses && response.data.wareHouses.length > 0) {
            this.shipTOAddressDropdown = response.data.wareHouses[0].shipToAddresses;
            this.billTOAddressDropdown = response.data.wareHouses[0].billToAddresses;
          }
        }
      })
  }
  fetchGrnUploadConfig() {
    this.metaDataService.findAllGRNUploadConfig(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.goodsReceiptReceivedTypeConfigurations && res.data.goodsReceiptReceivedTypeConfigurations.length > 0) {
        this.grnManualUpload = res.data.goodsReceiptReceivedTypeConfigurations[0].receivedType;
      }
      else {
        this.grnManualUpload = "No";
      }
    })
  }
  grnNotes() {
    const form = {};
    form["organizationIDName"] = this.formObj.organizationIDName;
    form["wareHouseIDName"] = this.formObj.wareHouseIDName;
    form['noteType'] = 'Inward Shipment';
    form['page'] = 1;
    form['pageSize'] = 100;
    this.commonMasterDataService.fetchAllGRNote(form).subscribe(res => {
      if (res['status'] == 0 && res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes']) {
        this.grNoteInvoices = res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes'];
      }
    })
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
  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.formObj).subscribe(
      (response) => {
        if (response && response.status == 0 && response.data.locations) {
          this.locations = response.data.locations;
        }
      },
      (error) => {
      });
  }
  fetchAllD(page, event, header) {
    if (event) {
      if (header) {
        this.grnHeadersData(page);
      }
      else {
        this.FetchAllGoodsReceipts(page, event.target.value);
      }
    }
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
  showTooltip: any = false;

  totalitems: any;
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['goodsReceiptHeaderArray'].filter(x => x.key == headerName);
    if (arr.length > 1) {
      this.sortFields = arr.map(x => x.name);
    }
    else {
      this.sortFields = [arr[0].name];
    }
    if (headerName) {
      this.grnHeadersData(this.pageHeader);
    } else {

    }
  }
  setDirection1(type, headerName,) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['goodsReceiptLinesArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.FetchAllGoodsReceipts(this.page, this.itemsPerPage);
    } else {

    }
  }
  grnHeadersData(page) {
    this.formObj['grnDateFrom'] = this.grnDateFrom;
    this.formObj['grnDateTo'] = this.grnDateTo;
    this.formObj['status'] = this.status == 'All' ? null : this.status
    this.formObj['page'] = this.pageHeader ? this.pageHeader : 1
    this.formObj['pageSize'] = this.headerItemsPerPage
    this.formObj['orderType'] = (this.orderType == 'All') ? null : this.orderType
    this.formObj['searchKeyword'] = this.headerSearchKey
    this.formObj['searchOnKeys'] = PaginationConstants.goodsReceiptHeaderSearchOnKeys
    this.formObj['sortDirection'] = this.sortDirection
    this.formObj['sortFields'] = this.sortFields,
      this.wmsService.findAllGoodsReceiptsWithPagination(this.formObj, 'header').subscribe(
        (response) => {
          this.grnData = response.data.goodsReceiptPaginationResponse.goodsReceipts;
          this.grnData.forEach(element => {
            element.isChecked = false;
          });
          this.headerTotalItems = response.data.goodsReceiptPaginationResponse.totalElements;
        })
  }

  FetchAllGoodsReceipts(page?, pageSize?) {
    this.formObj['grnDateFrom'] = this.grnDateFrom;
    this.formObj['grnDateTo'] = this.grnDateTo;
    this.formObj['status'] = this.status == 'All' ? null : this.status
    this.formObj['page'] = page ? page : 1
    this.formObj['pageSize'] = this.itemsPerPage
    this.formObj['orderType'] = (this.orderType == 'All') ? null : this.orderType
    this.formObj['searchKeyword'] = this.searchKey
    this.formObj['searchOnKeys'] = PaginationConstants.goodsReceiptLinesSearchOnKeys
    this.formObj['sortDirection'] = this.sortDirection
    this.formObj['sortFields'] = this.sortFields
    this.wmsService.findAllGoodsReceiptsWithPagination(this.formObj).subscribe(
      (response) => {
        if (response && response.status == 0 && response.data.goodsReceiptPaginationResponse.goodsReceipts) {
          this.goodsReceipts = response.data.goodsReceiptPaginationResponse.goodsReceipts;
          this.filteredGoodsReceipts = response.data.goodsReceiptPaginationResponse.goodsReceipts;
          this.filteredGoodsReceipts.forEach(element => {
            element.isChecked = false;
          });
          this.totalItems = response.data.goodsReceiptPaginationResponse.totalElements;
          const lengthofTotalItems = this.totalItems.toString().length;
          const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          count.forEach(el => {
            if (lengthofTotalItems == el) {
              let value: any = 1 + this.configService.addZerosMethod(el);
              this.dataPerPage = parseInt(value);
            }
          });
          // this.loopToStop =Math.round(this.totalItems / this.dataPerPage)
          const n: any = (this.totalItems / this.dataPerPage).toString()
          let m = n.split('.')
          if (m[1]) {
            this.loopToStop = parseInt(m[0]) + 1
          } else {
            this.loopToStop = parseInt(m[0])
          }

          this.rerender();
          this.dtTrigger.next();
          this.getGoodsReceiptLines();
        }
        else {
          this.filteredGoodsReceipts = [];
          this.filteredGoodsReceiptLines = [];
          this.rerender();
          this.dtTrigger.next();
          this.dtTrigger2.next();
        }
      },
      (error) => {

      });
  }
  fetchAllUOMs() {
    this.commonMasterDataService.fetchAllUOMConversion(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status == 0 && response.data.uoms) {
          this.uomConversions = response.data.uoms;
        }
      },
      (error) => {
      });
  }
  fetchAllocationType() {
    const body = this.configService.getGlobalpayload();
    this.metaDataService.getReceiveLocationAllocationType(body).subscribe(res => {
      if (res.status == 0 && res.data.putawayLocationAllocationConfigurations && res.data.putawayLocationAllocationConfigurations.length > 0) {
        this.locReceiveAllocation = res.data.putawayLocationAllocationConfigurations[0].putawayLocationAllocationType;
      }
    })
    this.metaDataService.getReturnLocationAllocationType(body).subscribe(res => {
      if (res.status == 0 && res.data.putawayReturnLocationAllocationConfigurations && res.data.putawayReturnLocationAllocationConfigurations.length > 0) {
        this.locReturnAllocation = res.data.putawayReturnLocationAllocationConfigurations[0].putawayReturnLocationAllocationType;
      }
    })
    this.metaDataService.getAllSerialNumberConfigurations(body).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberAllocation = res.data.serialNumberConfigurations[0].serialNumberCheck;
      }
      else {
        this.serialNumberAllocation = 'No';
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
  getHeaderData(doc) {
    let noteDetails = null;
    if (doc['Invoice Number']) {
      noteDetails = this.grNoteInvoices.find(x => x.invoiceNumber == doc['Invoice Number']);
    }
    return {
      wmpoNumber: doc['wmpoNumber'] ? doc['wmpoNumber'] : null,
      wmpoNumberPrefix: doc['wmpoNumberPrefix'] ? doc['wmpoNumberPrefix'] : null,
      fullWmpoNumber: doc['fullWmpoNumber'] ? doc['fullWmpoNumber'] : null,
      supplierMasterInfo: this.mapSupplierMasterID(doc),
      customersSupplierName: doc['Customers Supplier Name'] ? doc['Customers Supplier Name'] : null,
      customersSupplierAddress: doc['Customers Supplier Address'] ? doc['Customers Supplier Address'] : null,
      invoiceNumber: doc['Invoice Number'] ? doc['Invoice Number'] : null,
      invoiceDate: doc['Invoice Date'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['Invoice Date']) : (noteDetails && noteDetails.invoiceDate ? (this.wmsCommonService.getDateFromMilliSec(noteDetails.invoiceDate)) : null),
      serviceProviderName: doc['Transporter'] ? doc['Transporter'] : (noteDetails && noteDetails.serviceProviderInfo ? noteDetails.serviceProviderInfo.serviceProviderIDName : null),
      vehicleNumber: doc['Vehicle Number'] ? doc['Vehicle Number'] : ((noteDetails && noteDetails.vehicleInfo) ? noteDetails.vehicleInfo.vehicleNumber : null),
      vehicleType: doc['Vehicle Type'] ? doc['Vehicle Type'] : (noteDetails ? noteDetails.vehicleType : null),
      containerNumber: doc['Container Number'] ? doc['Container Number'] : (noteDetails && noteDetails.equipmentInfo ? noteDetails.equipmentInfo.equipmentID : null),
      lrNumber: doc['LrNumber'] ? doc['LrNumber'] : (noteDetails ? noteDetails.lrNumber : null),
      billOfEntryDate: doc['BillofEntryDate'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['BillofEntryDate']) : (noteDetails && noteDetails.billOfEntryDate ? (this.wmsCommonService.getDateFromMilliSec(noteDetails.billOfEntryDate)) : null),
      bondDate: doc['Bond Date'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['Bond Date']) : null,
      billOfEntryNumber: doc['BillofEntryNumber'] ? doc['BillofEntryNumber'] : (noteDetails ? noteDetails.billOfEntryNumber : null),
      billOfLandingDate: doc['BillofLandingDate'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['BillofLandingDate']) : (noteDetails && noteDetails.billOfLandingDate ? (this.wmsCommonService.getDateFromMilliSec(noteDetails.billOfLandingDate)) : null),
      billOfLandingNumber: doc['BillofLandingNumber'] ? doc['BillofLandingNumber'] : (noteDetails ? noteDetails.billOfLandingNumber : null),
      bondNumber: doc['Bond Number'] ? doc['Bond Number'] : null,
      referencePONumber: null,
      billToAddress: doc['name(billToAddress)'] ? this.setBillTo(doc['name(billToAddress)']) : null,
      shipToAddress: doc['name(shipToAddress)'] ? this.setJsonto(doc['name(shipToAddress)']) : null,
      shipFromAddress: doc['name(shipFromAddress)'] ? this.setJsonFrom(doc['name(shipFromAddress)']) : null,
      receiptDate: this.getDateForImport(),
      receivedType: this.grnManualUpload == 'Yes' ? 'Manual' : null,
      receiptType: this.grnManualUpload == 'Yes' ? 'Purchase Order' : null,
      // receivedType: 'From PO',
      // receiptType: 'Purchase Order',
      goodsReceiptLines: [this.getLinesData(doc)]
    }
  }
  getDateForImport(data?) {
    const date = data ? new Date(data) : new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  getLinesData(doc) {
    let arr = [];
    if (doc['Serial Numbers'] && doc['Serial Numbers'].toString().includes(',')) {
      arr = doc['Serial Numbers'].toString().split(',');
    }
    else {
      arr = doc['Serial Numbers'] ? [doc['Serial Numbers']] : null;
    }
    let tax = [];
    if (doc['Taxes']) {
      const taxIDNames = doc['Taxes'].split(',');
      if (taxIDNames.length > 0 && doc['productID']) {
        this.filteredProduct = this.products.find(product => product.productID == doc['productID']);
        if (this.filteredProduct && this.filteredProduct.purchaseTaxes && this.filteredProduct.purchaseTaxes.length > 0) {
          taxIDNames.forEach(el => {
            const taxName = this.filteredProduct.purchaseTaxes.find(x => x.taxNamePercentage == el);
            taxName ? tax.push(taxName) : null;
          });
        }
      }
    }
    let noteDetails = null;
    if (doc.invoiceNumber) {
      noteDetails = this.grNoteInvoices.find(x => x.invoiceNumber == doc.invoiceNumber);
    }
    return {
      // _id: null,
      // sequenceNumber: null,
      poLineNumber: doc['poLineNumber'] ? doc['poLineNumber'] : null,
      productMasterInfo: this.mapProductMasterID(doc),
      receiveLocationHelpers: doc['ReceiveLocationLineNumber'] ? [this.getReceiveHelpersDetails(doc)] : [],
      returnLocationHelpers: doc['ReturnLocationLineNumber'] ? [this.getReturnHelpersDetails(doc)] : [],
      grnDate: doc['grnDate'] ? this.getDateForImport(doc['grnDate']) : this.getDateForImport(),
      mfgDate: doc['mfgDate'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['mfgDate']) : null,
      expiryDate: doc['expiryDate'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['expiryDate']) : this.getExpiryDate(doc['mfgDate']),
      brandName: doc['brandName'] ? doc['brandName'] : null,
      lrNumber: doc['Line LrNumber'] ? doc['Line LrNumber'] : (noteDetails ? noteDetails.lrNumber : null),
      batchNumber: doc['batchNumber'] ? doc['batchNumber'] : null,
      serialNumbers: arr,
      orderUnitPrice: doc['orderUnitPrice'] ? doc['orderUnitPrice'] : null,
      receivingUnit: doc['receivingUnit'] ? doc['receivingUnit'] : null,
      supplierReceivedQuantity: doc['supplier Received Qty'] ? doc['supplier Received Qty'].toString() : null,
      returnQuantity: doc['Return Quantity'] ? doc['Return Quantity'] : this.calculateReceivedQty(doc, 'Return'),
      supplierReturnQuantity: doc['Supplier Return Qty'] ? doc['Supplier Return Qty'].toString() : null,
      referenceInvoiceNumber: doc['referenceInvoiceNumber'] ? doc['referenceInvoiceNumber'] : null,
      invoiceNumber: doc['invoiceNumber'] ? doc['invoiceNumber'] : null,
      receivableQuantity: doc['receivableQuantity'] ? doc['receivableQuantity'] : null,
      receivedQuantity: doc['Received Quantity'] ? doc['Received Quantity'] : this.calculateReceivedQty(doc),
      orderedQuantity: doc['orderedQuantity'] ? doc['orderedQuantity'] : null,
      shippedQuantity: doc['shippedQuantity'] ? doc['shippedQuantity'] : null,
      noOfReturnLocationsRequired: doc['noOfReturnLocationsRequired'] ? doc['noOfReturnLocationsRequired'] : 0,
      noOfReceiveLocationsRequired: doc['noOfReceiveLocationsRequired'] ? doc['noOfReceiveLocationsRequired'] : 0,
      totalReceivedQuantity: doc['totalReceivedQuantity'] ? doc['totalReceivedQuantity'] : null,
      totalReturnQuantity: doc['totalReturnQuantity'] ? doc['totalReturnQuantity'] : null,
      receiveLocationAllocationType: this.locReceiveAllocation,
      returnLocationAllocationType: this.locReturnAllocation,
      invoiceDate: doc.invoiceDate ? this.wmsCommonService.getDateFromMilliSecAddDay(doc.invoiceDate) : (noteDetails ? this.wmsCommonService.getDateFromMilliSec(noteDetails.invoiceDate) : null),
      purchaseTaxes: tax,
      serviceProviderName: doc['Line Transporter'] ? doc['Line Transporter'] : (noteDetails && noteDetails.serviceProviderInfo ? noteDetails.serviceProviderInfo.serviceProviderIDName : null),
      vehicleNumber: doc['Line Vehicle Number'] ? doc['Line Vehicle Number'] : ((noteDetails && noteDetails.vehicleInfo) ? noteDetails.vehicleInfo.vehicleNumber : null),
      vehicleType: doc['Line Vehicle Type'] ? doc['Line Vehicle Type'] : (noteDetails ? noteDetails.vehicleType : null),
      containerNumber: doc['Line Container Number'] ? doc['Line Container Number'] : (noteDetails && noteDetails.equipmentInfo ? noteDetails.equipmentInfo.equipmentID : null),
      billOfEntryDate: doc['Line BillofEntryDate'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['Line BillofEntryDate']) : (noteDetails && noteDetails.billOfEntryDate ? (this.wmsCommonService.getDateFromMilliSec(noteDetails.billOfEntryDate)) : null),
      billOfEntryNumber: doc['Line BillofEntryNumber'] ? doc['Line BillofEntryNumber'] : (noteDetails ? noteDetails.billOfEntryNumber : null),
      billOfLandingDate: doc['Line BillofLandingDate'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['Line BillofLandingDate']) : (noteDetails && noteDetails.billOfLandingDate ? (this.wmsCommonService.getDateFromMilliSec(noteDetails.billOfLandingDate)) : null),
      billOfLandingNumber: doc['Line BillofLandingNumber'] ? doc['Line BillofLandingNumber'] : (noteDetails ? noteDetails.billOfLandingNumber : null),
      bondDate: doc['Line Bond Date'] ? this.wmsCommonService.getDateFromMilliSecAddDay(doc['Line Bond Date']) : null,
      bondNumber: doc['Line Bond Number'] ? doc['Line Bond Number'] : null,
    }
  }
  getExpiryDate(event) {
    if (event && this.shelfLife) {
      let result = new Date(event);
      result.setDate(result.getDate() + this.shelfLife);
      return this.getDateForImport(result);
    }
    else {
      return null
    }
  }
  calculateReceivedQty(doc, key?) {
    if (this.filteredProduct && this.filteredProduct.inventoryUnit && doc['receivingUnit']) {
      const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom == doc['receivingUnit'] &&
        uom.unitConversionTo == this.filteredProduct.inventoryUnit && uom.productMasterInfo.productIDName == this.filteredProduct.productIDName);
      if (filteredUOMConversion && filteredUOMConversion.conversionFactor) {
        if (key) {
          doc['Return Qty'] = DecimalUtils.multiply(doc['Supplier Return Qty'], filteredUOMConversion.conversionFactor);
        }
        else {
          doc['Received Qty'] = DecimalUtils.multiply(doc['supplier Received Qty'], filteredUOMConversion.conversionFactor);
        }
      } else {
        if (key) {
          doc['Return Qty'] = null;
        }
        else {
          doc['Received Qty'] = null;
        }
      }
    }
    else {
      if (key) {
        doc['Return Qty'] = null;
      }
      else {
        doc['Received Qty'] = null;
      }
    }
    return key ? doc['Return Qty'] : doc['Received Qty'];
  }
  getReceiveHelpersDetails(doc) {
    if (doc['ReceiveLocationLineNumber'] && doc['Receive Location Name'] && doc['Receive Required Qty']) {
      const _idLocal = this.locations.find(loc => loc.locationName == (doc['Receive Location Name']).replace(/\s/g, ""));
      let obj = {
        "locationName": doc['Receive Location Name'],
        "quantity": doc['Receive Required Qty'],
        "_id": _idLocal ? _idLocal._id : null,
        "packingRemarks": doc['Receive Packing Remarks']
      }
      return obj
    }
    else {
      return {
        "locationName": doc['Receive Location Name'] ? doc['Receive Location Name'] : null,
        "quantity": doc['Receive Required Qty'] ? doc['Receive Required Qty'] : null,
        _id: null,
        "packingRemarks": doc['Receive Packing Remarks'] ? doc['Receive Packing Remarks'] : null
      }
    }
  }
  getReturnHelpersDetails(doc) {
    if (doc['ReturnLocationLineNumber'] && doc['Return Location Name'] && doc['Return Required Qty']) {
      const _idLocal = this.locations.find(loc => loc.locationName == (doc['Return Location Name']).replace(/\s/g, ""))
      let obj = {
        "locationName": doc['Return Location Name'],
        "quantity": doc['Return Required Qty'],
        "_id": _idLocal ? _idLocal._id : null,
        "packingRemarks": doc['Return Packing Remarks']
      }
      return obj
    }
    else {
      return {
        "locationName": doc['Return Location Name'] ? doc['Return Location Name'] : null,
        "quantity": doc['Return Required Qty'] ? doc['Return Required Qty'] : null,
        "_id": null,
        "packingRemarks": doc['Return Packing Remarks'] ? doc['Return Packing Remarks'] : null
      }
    }
  }
  editGoodsReceipt(grId: any) {
    this.appService.navigate('/v1/inbound/goodsReceipt', { id: grId });
  }
  getGoodsReceiptLines() {
    this.filteredGoodsReceiptLines = [];
    const grs = this.filteredGoodsReceipts.slice();
    const products = [];
    grs.forEach((po, index) => {
      for (const key in po) {
        if (!!key) {
          if (!!po.goodsReceiptLines && key == 'goodsReceiptLines') {
            po[key].forEach(a => {
              a.fullWmpoNumber = po.wmpoNumberPrefix + po.wmpoNumber;
              products.push(a);
            });
          }
        }
      }
    });
    this.grnDate = products && products[0] && products[0].grnDate ? products[0].grnDate : '';
    this.filteredGoodsReceiptLines = products;
    this.dtTrigger2.next();
  }
  navigateToSch(data) {
    sessionStorage.setItem('idInfo', JSON.stringify(data))
    this.appService.navigate(`/v1/inbound/putaway`);
  }
  filterProductsList(productStatus: string): any {
    this.rerender();
    if (productStatus == '0') {
      this.filteredGoodsReceipts = this.goodsReceipts.slice();
      this.dtTrigger.next();
    } else {
      this.filteredGoodsReceipts = this.goodsReceipts.filter((product: any) => {
        return product.status == productStatus;
      });
      this.dtTrigger.next();
    }
    this.getGoodsReceiptLines();
  }
  // getDate(dateRef: any, dateValue: any) {
  //   if (dateRef == 'grnDateFrom') {
  //     this.grnDateFrom = new Date(dateValue);
  //   } else if (dateRef == 'grnDateTo') {
  //     this.grnDateTo = new Date(dateValue);
  //   }
  // }
  // filterDataFromDates() {
  //   if (this.grnDateFrom && this.grnDateTo && this.grnDateFrom <= this.grnDateTo) {
  //     this.datesObj.grnDateFrom = this.grnDateFrom;
  //     this.datesObj.grnDateTo = this.grnDateTo;
  //     this.FetchAllGoodsReceipts();
  //   } else {
  //     this.toastr.error('Select valid date difference');
  //   }
  // }
  filterDataFromDates() {
    if ((this.grnDateFrom && this.grnDateTo && this.grnDateFrom <= this.grnDateTo) || (!this.grnDateFrom && !this.grnDateTo)) {
      this.grnHeadersData(1);
      this.FetchAllGoodsReceipts(1, this.itemsPerPage);
    }
    else {
      this.toastr.error("Enter Valid Dates");
    }
  }
  reset() {
    this.status = 'Open';
    this.grnDateFrom = null;
    this.grnDateTo = null;
    this.orderType = "All";
    this.grnHeadersData(1);
    this.FetchAllGoodsReceipts(1, this.itemsPerPage);
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
    //this.forPermissionsSubscription.unsubscribe();
  }
  getId(index) {
    return `_${index + 1}`;
  }
  createGRNCTA() {
    if (this.permissionsList.includes('Create')) {
      this.router.navigate(['/v1/inbound/goodsReceipt']);
    }
    else {
      this.toastr.error("User doesnt have permission");
    }

  }
  fetchAllVehicles() {
    this.commonMasterDataService.fetchAllVehicles(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status == 0 && response.data.vehicleMasters) {
          this.vehicles = response.data.vehicleMasters;
        } else {
          this.vehicles = [];
        }
      },
      (error) => {
        this.vehicles = [];
      });
  }
  fetchAllEquipments() {
    this.commonMasterDataService.fetchAllEquipments(this.formObj).subscribe(
      (response) => {
        if (response && response.status == 0 && response.data.equipmentMaster) {
          this.equipments = response.data.equipmentMaster;
        } else {
          this.equipments = [];
        }
      },
      (error) => {
        this.equipments = [];
      });
  }
  fetchAllServiceProvider() {
    this.wmsService.fetchAllServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status == 0 && response.data.serviceProviders) {
        this.serviceProviders = response.data.serviceProviders;
      } else {
        this.serviceProviders = [];
      }
    }, error => {
      this.serviceProviders = [];
    });
  }
  mapId(key, name) {
    if (key == 'vehicle') {
      const vehicleDetals = this.vehicles.find(x => x.vehicleNumber == name);
      if (vehicleDetals) {
        return { _id: vehicleDetals._id, vehicleNumber: vehicleDetals.vehicleNumber }
      }
      else {
        return { _id: null, vehicleNumber: name }
      }
    }
    if (key == 'equipment') {
      const equipmentDetails = this.equipments.find(x => x.equipmentID == name);
      if (equipmentDetails) {
        return {
          equipmentMasterID: equipmentDetails._id, equipmentID: equipmentDetails.equipmentID,
          "equipmentName": equipmentDetails.equipmentName,
          "equipmentIDName": equipmentDetails.equipmentIDName,
          "equipmentType": equipmentDetails.equipmentType
        }
      }
      else {
        return {
          equipmentMasterID: null, equipmentID: name, "equipmentName": null,
          "equipmentIDName": null,
          "equipmentType": null
        }
      }
    }
    if (key == 'serviceID') {
      const spDetails = this.serviceProviders.find(x => x.serviceProviderID == name);
      if (spDetails) {
        return {
          serviceProviderMasterID: spDetails._id,
          serviceProviderID: spDetails.serviceProviderID,
          "serviceProviderName": spDetails.serviceProviderName,
          "serviceProviderIDName": spDetails.serviceProviderIDName
        }
      }
      else {
        return {
          serviceProviderMasterID: null,
          serviceProviderID: null,
          "serviceProviderName": null,
          "serviceProviderIDName": name,
        }
      }

    }
  }
  uploadExcel(event) {
    if (event.target.files && event.target.files[0]) {
      // const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.INVENTORY;
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
              line.goodsReceiptLines.forEach(req => {
                req['lrNumber'] = req['lrNumber'] ? req['lrNumber'] : line.lrNumber;
                req['invoiceNumber'] = req['invoiceNumber'] ? req['invoiceNumber'] : line.invoiceNumber;
                req['invoiceDate'] = req['invoiceDate'] ? req['invoiceDate'] : line.invoiceDate;
                req['vehicleNumber'] = req['vehicleNumber'] ? req['vehicleNumber'] : line.vehicleNumber;
                req['vehicleType'] = req['vehicleType'] ? req['vehicleType'] : line.vehicleType;
                req['containerNumber'] = req['containerNumber'] ? req['containerNumber'] : line.containerNumber;
                req['billOfEntryNumber'] = req['billOfEntryNumber'] ? req['billOfEntryNumber'] : line.billOfEntryNumber;
                req['billOfEntryDate'] = req['billOfEntryDate'] ? req['billOfEntryDate'] : line.billOfEntryDate;
                req['billOfEntryNumberDate'] = req['billOfEntryNumberDate'] ? req['billOfEntryNumberDate'] : line.billOfEntryNumberDate;
                req['billOfLandingNumber'] = req['billOfLandingNumber'] ? req['billOfLandingNumber'] : line.billOfLandingNumber;
                req['billOfLandingDate'] = req['billOfLandingDate'] ? req['billOfLandingDate'] : line.billOfLandingDate;
                req['billOfLandingNumberDate'] = req['billOfLandingNumberDate'] ? req['billOfLandingNumberDate'] : line.billOfLandingNumberDate;
                req['bondDate'] = req['bondDate'] ? req['bondDate'] : line['bondDate'];
                req['bondNumber'] = req['bondNumber'] ? req['bondNumber'] : line['bondNumber'];
                req['serviceProviderName'] = req['serviceProviderName'] ? req['serviceProviderName'] : line.serviceProviderName;
                req['transport'] = req.serviceProviderName;
                req['vehicleInfo'] = req.vehicleNumber ? this.mapId('vehicle', req.vehicleNumber) : null;
                delete req.vehicleNumber;
                req['equipmentInfo'] = req.containerNumber ? this.mapId('equipment', req.containerNumber) : null;
                delete line.containerNumber;
                req['serviceProviderInfo'] = req.serviceProviderName ? this.mapId('serviceID', req.serviceProviderName) : null;
                delete req.serviceProviderName;
                if (req.productMasterInfo) {
                  req['productClass'] = req.productMasterInfo.productClass ? req.productMasterInfo.productClass : null;
                  req['productType'] = req.productMasterInfo.productType ? req.productMasterInfo.productType : null;
                  req['productCategory'] = req.productMasterInfo.productCategory ? req.productMasterInfo.productCategory : null;
                  req['inventoryUnit'] = req.productMasterInfo.inventoryUnit ? req.productMasterInfo.inventoryUnit : null;
                  req['productImage'] = req.productMasterInfo.productImage ? req.productMasterInfo.productImage : null;
                  req['hsnCode'] = req.productMasterInfo.hsnCode ? req.productMasterInfo.hsnCode : null;
                  req['receivingInstruction'] = req.productMasterInfo.receivingInstruction ? req.productMasterInfo.receivingInstruction : null;
                  req['currency'] = req.productMasterInfo.currency ? req.productMasterInfo.currency : null;
                  req['productDescription'] = req.productMasterInfo.productDescription ? req.productMasterInfo.productDescription : null;
                  req['storageInstruction'] = req.productMasterInfo.storageInstruction ? req.productMasterInfo.storageInstruction : null;
                  delete req.productMasterInfo.productClass;
                  delete req.productMasterInfo.productType;
                  delete req.productMasterInfo.productCategory;
                  delete req.productMasterInfo.inventoryUnit;
                  delete req.productMasterInfo.productImage;
                  delete req.productMasterInfo.hsnCode;
                  delete req.productMasterInfo.receivingInstruction;
                  delete req.productMasterInfo.currency;
                  delete req.productMasterInfo.productDescription;
                  delete req.productMasterInfo.storageInstruction;
                }
                if (req.billOfLandingNumber && req.billOfLandingDate) {
                  req['billOfLandingNumberDate'] = req['billOfLandingNumber'] + ':' + req['billOfLandingDate'];
                }
                if (req.billOfEntryNumber && req.billOfEntryDate) {
                  req['billOfEntryNumberDate'] = req['billOfEntryNumber'] + ':' + req['billOfEntryDate'];
                }
              });
              line['vehicleInfo'] = line.vehicleNumber ? this.mapId('vehicle', line.vehicleNumber) : null;
              delete line.vehicleNumber;
              line['equipmentInfo'] = line.containerNumber ? this.mapId('equipment', line.containerNumber) : null;
              delete line.containerNumber;
              line['serviceProviderInfo'] = line.serviceProviderName ? this.mapId('serviceID', line.serviceProviderName) : null;
              delete line.serviceProviderName;
            })
            if (data1.length > 0) {
              this.wmsService.goodsreceivingImportExcel(data1).subscribe(res => {
                if (res && (res.status == 2 || res.status == 0) && res.data.goodsReceipts && res.data.goodsReceipts.goodsReceiptFailureExcelList &&
                  res.data.goodsReceipts.goodsReceiptFailureExcelList.length > 0 && res.data.goodsReceipts.goodsReceiptSuccessExcelList &&
                  res.data.goodsReceipts.goodsReceiptSuccessExcelList.length > 0) {
                  this.failureRecords = res.data.goodsReceipts.goodsReceiptFailureExcelList;
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.grnHeadersData(1);
                  this.FetchAllGoodsReceipts(1, this.itemsPerPage);
                  this.selectedRectoDownload = [];
                }
                else if (res && res.status == 0 && res.data.goodsReceipts && res.data.goodsReceipts.goodsReceiptSuccessExcelList &&
                  res.data.goodsReceipts.goodsReceiptSuccessExcelList.length > 0) {
                  this.toastr.success('Uploaded successfully');
                  this.grnHeadersData(1);
                  this.FetchAllGoodsReceipts(1, this.itemsPerPage);
                  this.failureRecords = [];
                  this.selectedRectoDownload = [];
                }
                else if (res && (res.status == 2 || res.status == 0) && res.data.goodsReceipts && res.data.goodsReceipts.goodsReceiptFailureExcelList &&
                  res.data.goodsReceipts.goodsReceiptFailureExcelList.length > 0) {
                  this.failureRecords = res.data.goodsReceipts.goodsReceiptFailureExcelList;
                  this.toastr.error('Failed in uploading, Please download log for reasons');
                  this.selectedRectoDownload = [];
                }
                else {
                  this.toastr.error('Failed in uploading');
                  this.failureRecords = [];
                  this.selectedRectoDownload = [];
                }
                // if (res && res.status == 0 && res.data.goodsReceipts && res.data.goodsReceipts.failureList &&
                //   res.data.goodsReceipts.failureList.length > 0 && res.data.goodsReceipts.goodsReceiptSuccessExcelList &&
                //   res.data.goodsReceipts.goodsReceiptSuccessExcelList.length > 0) {
                //   this.failureRecords = res.data.goodsReceipts.failureList;
                //   this.failureRecords = this.failureRecords.concat(res.data.goodsReceipts.duplicateList);
                //   this.toastr.error('Partially failed in uploading, Please download log for reasons');
                //   this.rerender();
                //   this.FetchAllGoodsReceipts();
                // } else if (res && res.status == 0 && res.data.goodsReceipts && res.data.goodsReceipts.failureList && res.data.goodsReceipts.failureList.length > 0) {
                //   this.failureRecords = res.data.goodsReceipts.failureList;
                //   this.failureRecords = this.failureRecords.concat(res.data.goodsReceipts.duplicateList);
                //   this.toastr.error('Failed in uploading, Please download log for reasons');
                // } else if (res && res.status == 0 && res.data.goodsReceipts && res.data.goodsReceipts.failureList && res.data.goodsReceipts.failureList.length == 0) {
                //   if (res && res.status == 0 && res.data.goodsReceipts && res.data.goodsReceipts.duplicateList && res.data.goodsReceipts.duplicateList.length > 0) {
                //     this.failureRecords = res.data.goodsReceipts.duplicateList;
                //     this.toastr.error('Duplicates present in the excel, Please download log file.');
                //   } else {
                //     this.toastr.success('Uploaded successfully');
                //     this.rerender();
                //     this.FetchAllGoodsReceipts();
                //     this.failureRecords = [];
                //   }
                // }
              },
                error => { });
            }
          }
        }
      }
    }
  }
  getFormat(jsonData) {
    const data1 = []
    // const logs = [];
    this.missingParams = null;
    // let inValidRecord = false;
    jsonData.forEach((k, index) => {
      if (k['supplierID'] && k['productID']) {
        data1.push(this.getHeaderData(k))
        // inValidRecord = false;
      }
      else {
        if (!k['supplierID'] && k['productID']) {
          // if (!inValidRecord && data1.length > 0) {
          if (data1.length > 0) {
            data1[data1.length - 1]['goodsReceiptLines'].push(this.getLinesData(k));
          }
          // else if (inValidRecord) {
          //   // logs[logs.length - 1]['goodsReceiptLines'].push(this.getLinesData(k));
          // }
        }
        if (k['supplierID'] && !k['productID']) {
          data1.push(this.getHeaderData(k))
        }
        else if (!k['supplierID'] && !k['productID']) {
          if (k['ReceiveLocationLineNumber'] && data1.length > 0) {
            const grLinesLength = data1[data1.length - 1]['goodsReceiptLines'].length;
            data1[data1.length - 1]['goodsReceiptLines'][grLinesLength - 1]['receiveLocationHelpers'].push(this.getReceiveHelpersDetails(k));
          }
          if (k['ReturnLocationLineNumber'] && data1.length > 0) {
            const grLinesLength = data1[data1.length - 1]['goodsReceiptLines'].length
            data1[data1.length - 1]['goodsReceiptLines'][grLinesLength - 1]['returnLocationHelpers'].push(this.getReturnHelpersDetails(k));
          }
        }
        // else if (!k['supplierID'] && !k['productID'] && k['ReceiveLocationLineNumber']) {
        //   // if (!inValidRecord && data1.length > 0) {
        //   if (data1.length > 0) {
        //     const grLinesLength = data1[data1.length - 1]['goodsReceiptLines'].length;
        //     data1[data1.length - 1]['goodsReceiptLines'][grLinesLength - 1]['receiveLocationHelpers'].push(this.getReceiveHelpersDetails(k));
        //   }
        //   // else if (inValidRecord) {
        //   //   const grLinesLogsLength = logs[logs.length - 1]['goodsReceiptLines'].length;
        //   //   logs[logs.length - 1]['goodsReceiptLines'][grLinesLogsLength - 1]['receiveLocationHelpers'].push(this.getReceiveHelpersDetails(k));
        //   // }
        // }
        // else if (!k['supplierID'] && !k['productID'] && k['ReturnLocationLineNumber']) {
        //   if (data1.length > 0) {
        //     const grLinesLength = data1[data1.length - 1]['goodsReceiptLines'].length
        //     data1[data1.length - 1]['goodsReceiptLines'][grLinesLength - 1]['returnLocationHelpers'].push(this.getReturnHelpersDetails(k));
        //   }
        //   // else if (inValidRecord) {
        //   //   const grLinesLogsLength = logs[logs.length - 1]['goodsReceiptLines'].length;
        //   //   logs[logs.length - 1]['goodsReceiptLines'][grLinesLogsLength - 1]['returnLocationHelpers'].push(this.getReturnHelpersDetails(k));
        //   // }
        // }
        else {
          if (!k['supplierID'] || !k['productID']) {
            // inValidRecord = true;
            // logs.push(this.getHeaderData(k));
          }
        }
      }
    })
    return data1
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
    let htmlText = '';
    let htmlText1 = '';
    let htmlText2 = '';
    // if (this.missingParams && (this.missingParams != null || this.missingParams != 'null')) {
    //   htmlText1 = `Please add missing fields :` + "\r\n" + this.missingParams.toString().replace(/,/g, '\r\n');
    // }
    if (this.failureRecords) {
      htmlText = this.failureRecords.toString().replace(/,/g, '\r\n');;
    }
    // if (htmlText1 && htmlText2) {
    //   htmlText = htmlText1.concat(htmlText2.toString());
    // }
    // else if (htmlText1 && !htmlText2) {
    //   htmlText = htmlText1;
    // }
    // else if (!htmlText1 && htmlText2) {
    //   htmlText = htmlText2;
    // }
    this.dyanmicDownloadByHtmlTag({
      fileName: "GoodsReciept Error Details",
      text: htmlText
    });
  }
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status == 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
        }
      },
      (error) => {
      });
    this.wmsService.fetchAllProductBySupplierData(this.formObj).subscribe(
      (response) => {
        if (response && response.status == 0 && response.data.productBySuppliers) {
          this.supplierByProducts = response.data.productBySuppliers;
        }
      }
    );
  }
  fetchAllProducts() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status == 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
        }
      },
      (error) => {
      });
  }
  mapSupplierMasterID(doc) {
    this.supplierIDForLine = doc['supplierID'];
    if (doc['supplierID'] && this.suppliers.length > 0) {
      const filteredSupplier = this.suppliers.find(supplier => supplier.supplierID == doc['supplierID']);
      if (filteredSupplier && filteredSupplier._id) {
        this.shipFromAddressDropdown = filteredSupplier ? filteredSupplier.shipFromAddresses : [];
        return {
          supplierIDName: filteredSupplier.supplierIDName,
          supplierID: filteredSupplier.supplierID,
          supplierMasterID: filteredSupplier._id,
          supplierName: filteredSupplier.supplierName,
        }
      }
      else {
        return {
          supplierIDName: null,
          supplierID: doc['supplierID'],
          supplierName: null,
        }
      }
    }
  }
  mapProductMasterID(doc) {
    this.filteredProduct = null;
    if (doc['productID'] && this.products.length > 0) {
      this.filteredProduct = this.products.find(product => product.productID == doc['productID']);
      let supplierFilteredproduct = null;
      if (doc['supplierID'] || this.supplierIDForLine) {
        const supplierID = doc['supplierID'] ? doc['supplierID'] : this.supplierIDForLine;
        const filteredSupplier = this.supplierByProducts.find(supplier => supplier.supplierID == supplierID);
        supplierFilteredproduct = filteredSupplier ? filteredSupplier.productMasterInfos.find(x => x.productID == doc['productID']) : null;
      }
      if (this.filteredProduct && this.filteredProduct._id) {
        this.shelfLife = this.filteredProduct.shelfLife;
        return {
          productIDName: this.filteredProduct.productIDName,
          productID: this.filteredProduct.productID,
          productMasterID: this.filteredProduct._id,
          productName: this.filteredProduct.productName,
          productClass: this.filteredProduct.productClass,
          productType: this.filteredProduct.productType,
          productCategory: this.filteredProduct.productCategoryInfo,
          inventoryUnit: this.filteredProduct.inventoryUnit,
          productImage: this.filteredProduct.productImage,
          hsnCode: this.filteredProduct.hsnCode,
          receivingInstruction: this.filteredProduct.receivingInstruction,
          currency: supplierFilteredproduct ? supplierFilteredproduct.currency : null,
          productDescription: supplierFilteredproduct ? supplierFilteredproduct.productDescription : null,
          storageInstruction: this.filteredProduct.storageInstruction,
        }
      }
      else {
        this.filteredProduct = null;
        this.shelfLife = null;
        return {
          productIDName: null,
          productID: doc['productID'],
          productName: null,
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

  exportAsXLSX() {
    let formValues = []
    if (this.grnManualUpload == 'Yes') {
      formValues = [this.headerandEmptyArray()];
      if (this.serialNumberAllocation == 'No') {
        formValues.forEach(element => {
          delete element['Serial Numbers'];
        });
      }
      this.excelService.exportAsExcelFile(formValues, 'Goods Receipt', Constants.EXCEL_IGNORE_FIELDS.GOODS_RECEIVING);
    }
    else {
      this.getAllRecordsofGRN();
    }
  }
  export1() {
    let formValues = [];
    const selected = (this.selectedRectoDownload.length > 0) ? 'selectedRectoDownload' : 'exportData';
    const arr = this[selected].filter(x => x.status == 'Open' && x.receivedType != 'Manual');
    if (arr.length > 0) {
      // arr.forEach(element => {
      formValues = (this.getExcelRecords(arr));
      // });
      if (this.serialNumberAllocation == 'No') {
        formValues.forEach(element => {
          delete element['Serial Numbers'];
        });
      }
      this.excelService.exportAsExcelFile(formValues, 'Goods Receipt', Constants.EXCEL_IGNORE_FIELDS.GOODS_RECEIVING);
    }
  }
  read(event, data) {
    if (event.target.checked) {
      data.isChecked = true;
      this.selectedRectoDownload.push(data);
    }
    else {
      data.isChecked = false;
      this.selectedRectoDownload = this.selectedRectoDownload.filter(x => x._id != data._id);
    }
    // this.selectAllCheckboxValue = this.overAllRecords.every(function (item: any) {
    //   return item.isChecked == true;
    // })
  }
  getAllRecordsofGRN(index?) {
    if (!index) {
      this.exportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      this.export1();
    }
    else {
      if (((i == 1) || (i != 1 && this.exportData.length > 0)) && i <= this.loopToStop) {
        const form = {
          "page": i,
          "pageSize": this.dataPerPage,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }

        this.wmsService.findAllGoodsReceiptsWithPagination(form).subscribe(
          (response) => {
            if (response && response.status == 0 && response.data.goodsReceiptPaginationResponse.goodsReceipts) {
              this.exportData = [...this.exportData, ...response.data.goodsReceiptPaginationResponse.goodsReceipts];
              this.getAllRecordsofGRN(i);
            }
          })
      }
    }
  }
  headerandEmptyArray(element?) {
    const obj = {};
    (this.grnManualUpload != 'Yes') ? obj['wmpoNumberPrefix'] = element.wmpoNumberPrefix : null,
      (this.grnManualUpload != 'Yes') ? obj['wmpoNumber'] = element.wmpoNumber : null,
      (this.grnManualUpload != 'Yes') ? obj['fullWmpoNumber'] = element.fullWmpoNumber : null,
      obj['supplierID'] = element ? element.supplierMasterInfo.supplierID : null,
      obj['Customers Supplier Name'] = element ? element.customersSupplierName : null,
      obj['Customers Supplier Address'] = element ? element.customersSupplierAddress : null,
      obj['Invoice Number'] = element ? element.invoiceNumber : null,
      obj['Invoice Date'] = element && element.invoiceDate ? this.wmsCommonService.getDateFromMilliSec(element.invoiceDate) : null,
      obj['Transporter'] = element && element.serviceProviders ? element.serviceProviders.serviceProviderIDName : null,
      obj['Vehicle Number'] = element && element.vehicleInfo ? element.vehicleInfo.vehicleNumber : null,
      obj['Container Number'] = element && element.equipmentInfo ? element.equipmentInfo.equipmentID : null,
      obj['Vehicle Type'] = element ? element.vehicleType : null,
      obj['LrNumber'] = element ? element.lrNumber : null,
      obj['BillofEntryNumber'] = element ? element.billOfEntryNumber : null,
      obj['BillofEntryDate'] = element && element.billOfEntryDate ? this.wmsCommonService.getDateFromMilliSec(element.billOfEntryDate) : null,
      obj['Bond Date'] = element && element.bondDate ? this.wmsCommonService.getDateFromMilliSec(element['bondDate']) : null,
      obj['Bond Number'] = element ? element.bondNumber : null,
      obj['BillofLandingNumber'] = element ? element.billOfLandingNumber : null,
      obj['BillofLandingDate'] = element && element.billOfLandingDate ? this.wmsCommonService.getDateFromMilliSec(element.billOfLandingDate) : null,
      obj['name(billToAddress)'] = null,
      obj['name(shipToAddress)'] = null,
      obj['name(shipFromAddress)'] = null,
      obj['productID'] = null,
      obj['receivingUnit'] = null,
      obj['brandName'] = null,
      obj['mfgDate'] = null,
      obj['expiryDate'] = null,
      obj['invoiceDate'] = null,
      obj['invoiceNumber'] = null,
      obj['Line LrNumber'] = null,
      obj['batchNumber'] = null,
      obj['Serial Numbers'] = null,
      obj['orderUnitPrice'] = null,
      obj['orderedQuantity'] = null,
      obj['shippedQuantity'] = null,
      obj['supplier Received Qty'] = null,
      obj['ReceiveLocationLineNumber'] = null,
      obj['Receive Location Name'] = null,
      obj['Receive Required Qty'] = null,
      obj['Received Quantity'] = null,
      obj['Receive Packing Remarks'] = null,
      obj['Supplier Return Qty'] = null,
      obj['ReturnLocationLineNumber'] = null,
      obj['Return Location Name'] = null,
      obj['Return Required Qty'] = null,
      obj['Return Packing Remarks'] = null,
      obj['Return Quantity'] = null,
      obj['Taxes'] = null,
      obj['Line Transporter'] = null,
      obj['Line Vehicle Number'] = null,
      obj['Line Container Number'] = null,
      obj['Line Vehicle Type'] = null,
      obj['Line BillofEntryNumber'] = null,
      obj['Line BillofEntryDate'] = null,
      obj['Line BillofLandingNumber'] = null,
      obj['Line BillofLandingDate'] = null,
      obj['Line Bond Number'] = null,
      obj['Line Bond Date'] = null
    return obj;
  }
  getExcelRecords(arr) {
    let newArray = []
    arr.forEach(element => {
      if (element.goodsReceiptLines && element.goodsReceiptLines.length > 0) {
        element.goodsReceiptLines.forEach((deli, index) => {
          if (deli.updated == false) {
            newArray.push(this.getProductLines(element, deli, newArray, index));
          }
        })
      }
      else {
        newArray.push(this.headerandEmptyArray(element))
      }
    });
    return newArray
  }
  getProductLines(element, deli, newArray, index) {
    let info = {};
    (this.grnManualUpload != 'Yes') ? info['wmpoNumberPrefix'] = ((index == 0) ? element.wmpoNumberPrefix : null) : null,
      (this.grnManualUpload != 'Yes') ? info['wmpoNumber'] = ((index == 0) ? element.wmpoNumber : null) : null,
      (this.grnManualUpload != 'Yes') ? info['fullWmpoNumber'] = ((index == 0) ? element.fullWmpoNumber : null) : null,
      info['supplierID'] = (index == 0 && element.supplierMasterInfo) ? element.supplierMasterInfo.supplierID : null,
      info['Customers Supplier Name'] = (index == 0) ? element.customersSupplierName : null,
      info['Customers Supplier Address'] = (index == 0) ? element.customersSupplierAddress : null,
      info['Invoice Number'] = (index == 0) ? element.invoiceNumber : null,
      info['Invoice Date'] = (index == 0 && element.invoiceDate) ? this.wmsCommonService.getDateFromMilliSec(element.invoiceDate) : null,
      info['Transporter'] = (index == 0 && element.serviceProviderInfo) ? element.serviceProviderInfo.serviceProviderID : null,
      info['Vehicle Number'] = (index == 0 && element.vehicleInfo) ? element.vehicleInfo.vehicleNumber : null,
      info['Container Number'] = (index == 0 && element.equipmentInfo) ? element.equipmentInfo.equipmentID : null,
      info['Vehicle Type'] = (index == 0) ? element.vehicleType : null,
      info['LrNumber'] = (index == 0) ? element.lrNumber : null,
      info['BillofEntryNumber'] = (index == 0) ? element.billOfEntryNumber : null,
      info['BillofEntryDate'] = (index == 0 && element.billOfEntryDate) ? this.wmsCommonService.getDateFromMilliSec(element.billOfEntryDate) : null,
      info['Bond Date'] = (index == 0 && element.bondDate) ? this.wmsCommonService.getDateFromMilliSec(element.bondDate) : null,
      info['BillofLandingNumber'] = (index == 0) ? element.billOfLandingNumber : null,
      info['Bond Number'] = (index == 0) ? element.bondNumber : null,
      info['BillofLandingDate'] = (index == 0 && element.BillofLandingDate) ? this.wmsCommonService.getDateFromMilliSec(element.BillofLandingDate) : null,
      info['name(billToAddress)'] = (index == 0 && element.billToAddress) ? element.billToAddress.name : null,
      info['name(shipToAddress)'] = (index == 0 && element.shipToAddress) ? element.shipToAddress.name : null,
      info['name(shipFromAddress)'] = (index == 0 && element.shipFromAddress) ? element.shipFromAddress.name : null,
      info['poLineNumber'] = deli.poLineNumber,
      info['productID'] = deli.productMasterInfo.productID,
      info['receivingUnit'] = deli.receivingUnit,
      info['brandName'] = deli.brandName,
      info['mfgDate'] = deli.mfgDate ? this.wmsCommonService.getDateFromMilliSec(deli.mfgDate) : null,
      info['expiryDate'] = deli.expiryDate ? this.wmsCommonService.getDateFromMilliSec(deli.expiryDate) : null,
      info['invoiceDate'] = deli.invoiceDate ? this.wmsCommonService.getDateFromMilliSec(deli.invoiceDate) : null,
      info['invoiceNumber'] = deli.invoiceNumber,
      info['Line LrNumber'] = deli.lrNumber,
      info['batchNumber'] = deli.batchNumber,
      (this.serialNumberAllocation == 'Yes') ? info['Serial Numbers'] = (deli.serialNumbers && deli.serialNumbers.length > 0) ? deli.serialNumbers.toString() : null : null,
      info['orderedQuantity'] = deli.orderedQuantity,
      info['shippedQuantity'] = deli.shippedQuantity,
      info['supplier Received Qty'] = deli.supplierReceivedQuantity,
      info['ReceiveLocationLineNumber'] = (deli.receiveLocationHelpers && deli.receiveLocationHelpers.length > 0) ? 1 : null,
      info['Receive Location Name'] = (deli.receiveLocationHelpers && deli.receiveLocationHelpers.length > 0) ? deli.receiveLocationHelpers[0].locationName : null,
      info['Receive Required Qty'] = (deli.receiveLocationHelpers && deli.receiveLocationHelpers.length > 0) ? deli.receiveLocationHelpers[0].quantity : null,
      info['Supplier Return Qty'] = deli.supplierReturnQuantity,
      info['Receive Packing Remarks'] = (deli.receiveLocationHelpers && deli.receiveLocationHelpers.length > 0) ? deli.receiveLocationHelpers[0].packingRemarks : null,
      info['ReturnLocationLineNumber'] = (deli.returnLocationHelpers && deli.returnLocationHelpers.length > 0) ? 1 : null,
      info['Return Location Name'] = (deli.returnLocationHelpers && deli.returnLocationHelpers.length > 0) ? deli.returnLocationHelpers[0].locationName : null,
      info['Return Required Qty'] = (deli.returnLocationHelpers && deli.returnLocationHelpers.length > 0) ? deli.returnLocationHelpers[0].quantity : null,
      info['Return Packing Remarks'] = (deli.returnLocationHelpers && deli.returnLocationHelpers.length > 0) ? deli.returnLocationHelpers[0].packingRemarks : null,
      info['Taxes'] = (deli.purchaseTaxes && deli.purchaseTaxes.length > 0) ? (deli.purchaseTaxes.map(x => x.taxNamePercentage)).toString() : null,
      info['Line Transporter'] = deli.transport,
      info['Line Vehicle Number'] = deli && deli.vehicleInfo ? deli.vehicleInfo.vehicleNumber : null,
      info['Line Container Number'] = deli && deli.equipmentInfo ? deli.equipmentInfo.equipmentID : null,
      info['Line Vehicle Type'] = deli.vehicleType,
      info['Line BillofEntryNumber'] = deli.billOfEntryNumber,
      info['Line BillofEntryDate'] = deli.billOfEntryDate ? this.wmsCommonService.getDateFromMilliSec(deli.billOfEntryDate) : null,
      info['Line BillofLandingNumber'] = deli.billOfLandingNumber,
      info['Line BillofLandingDate'] = deli.billOfLandingDate ? this.wmsCommonService.getDateFromMilliSec(deli.billOfLandingDate) : null,
      info['Line Bond Number'] = deli.bondNumber,
      info['Line Bond Date'] = deli.bondDate ? this.wmsCommonService.getDateFromMilliSec(deli.bondDate) : null
    // newArray.push(info)
    // newArray = this.addReceiveandReturninExistingLine(element, deli, newArray)
    return info
  }
  addReceiveandReturninExistingLine(element, deli, newArray) {
    if (deli.receiveLocationHelpers && deli.receiveLocationHelpers.length > 1) {
      deli.receiveLocationHelpers.forEach((recieveEle, i) => {
        if (i > 0 && newArray.length > 0) {
          newArray.push(this.getRecieveandReturnNewLines(recieveEle, newArray, 'recieve'));
        }
      });
    }
    if (deli.returnLocationHelpers && deli.returnLocationHelpers.length > 1) {
      deli.returnLocationHelpers.forEach((returnELe, i) => {
        if (i > 0 && newArray.length > 0) {
          const returnLocFirstPositionIndex = newArray.findIndex(x => x.supplierID == element.supplierMasterInfo.supplierID)
          if (newArray[newArray.length - 1].ReturnLocationLineNumber) {
            newArray.push(this.getRecieveandReturnNewLines(returnELe, newArray, 'return'));
          }
          else {
            const info = newArray[newArray.length - 1];
            newArray.splice((newArray.length - 1), 1);
            info['ReturnLocationLineNumber'] = (newArray[returnLocFirstPositionIndex].ReturnLocationLineNumber) + 1,
              info['Return Location Name'] = returnELe.locationName,
              info['Return Required Qty'] = returnELe.quantity,
              info['Return Packing Remarks'] = returnELe.packingRemarks,
              newArray.push(info)
          }
        }
      });
    }
    return newArray;
  }
  getRecieveandReturnNewLines(loopElement, newArray, key) {
    let info = {};
    (this.grnManualUpload != 'Yes') ? info['wmpoNumberPrefix'] = null : '',
      (this.grnManualUpload != 'Yes') ? info['wmpoNumber'] = null : '',
      (this.grnManualUpload != 'Yes') ? info['fullWmpoNumber'] = null : '',
      info['supplierID'] = null,
      info['Customers Supplier Name'] = null,
      info['Customers Supplier Address'] = null,
      info['Invoice Number'] = null,
      info['Invoice Date'] = null,
      info['Transporter'] = null,
      info['Vehicle Number'] = null,
      info['Container Number'] = null,
      info['Vehicle Type'] = null,
      info['LrNumber'] = null,
      info['BillofEntryNumber'] = null,
      info['BillofEntryDate'] = null,
      info['BillofLandingNumber'] = null,
      info['BillofLandingDate'] = null,
      info['name(billToAddress)'] = null,
      info['name(shipToAddress)'] = null,
      info['name(shipFromAddress)'] = null,
      info['poLineNumber'] = null,
      info['productID'] = null,
      info['receivingUnit'] = null,
      info['brandName'] = null,
      info['mfgDate'] = null,
      info['expiryDate'] = null,
      info['invoiceNumber'] = null,
      info['Line LrNumber'] = null,
      info['batchNumber'] = null,
      (this.serialNumberAllocation == 'Yes') ? (info['Serial Numbers'] = null) : null,
      info['orderUnitPrice'] = null,
      info['orderedQuantity'] = null,
      info['shippedQuantity'] = null,
      info['supplier Received Qty'] = null,
      info['ReceiveLocationLineNumber'] = (key == 'recieve') ? (newArray[newArray.length - 1].ReceiveLocationLineNumber) + 1 : null,
      info['Receive Location Name'] = (key == 'recieve') ? loopElement.locationName : null,
      info['Receive Required Qty'] = (key == 'recieve') ? loopElement.quantity : null,
      info['Receive Packing Remarks'] = (key == 'recieve') ? loopElement.packingRemarks : null,
      info['Supplier Return Qty'] = null,
      info['ReturnLocationLineNumber'] = (key == 'return') ? (newArray[newArray.length - 1].ReturnLocationLineNumber) + 1 : null,
      info['Return Location Name'] = (key == 'return') ? loopElement.locationName : null,
      info['Return Required Qty'] = (key == 'return') ? loopElement.quantity : null,
      info['Return Packing Remarks'] = (key == 'return') ? loopElement.packingRemarks : null,
      info['Taxes'] = null,
      info['Line Transporter'] = null,
      info['Line Vehicle Number'] = null,
      info['Line Container Number'] = null,
      info['Line Vehicle Type'] = null,
      info['Line BillofEntryNumber'] = null,
      info['Line BillofEntryDate'] = null,
      info['Line BillofLandingNumber'] = null,
      info['Line BillofLandingDate'] = null

    return info
  }
}
