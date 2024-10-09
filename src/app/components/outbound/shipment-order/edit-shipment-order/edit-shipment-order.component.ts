import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { OutboundProcessService } from '../../../../services/integration-services/outboundProcess.service';
import { ToastrService } from 'ngx-toastr';
import { EditShipmentOrderLine } from '../../../../entities/editShipmentOrder.entity';
import { ShipmentOrder } from '../../../../entities/editShipmentOrder.entity';
import { AppService } from '../../../../shared/services/app.service';
import { FormGroup, FormBuilder, NgForm } from '@angular/forms';
import { WmsCommonService } from '../../../../services/wms-common.service';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../../shared/utils/custom-validator';
import { Constants } from '../../../../constants/constants';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { MetaDataService } from '../../../../services/integration-services/metadata.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { CompleterData } from 'ng2-completer';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { DatePipe } from '@angular/common';
import { shipmentOrderHead, shipmentOrderManagementHeader } from 'src/app/constants/paginationConstants';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';
import { BarcodeService } from 'src/app/services/barcode.service';
@Component({
  selector: 'app-shipment-order',
  templateUrl: './edit-shipment-order.component.html',
  styles: [`.e-input-group-icon e-ddl-icon .e-search-icon{
    position: relative!important;
    left: 27px!important;
  }
.e-ddl-icon{
    position: relative!important;
    left: -18px!important;
  }`]
})
export class EditShipmentOrderComponent implements OnInit, OnDestroy {

  @ViewChild("grRemote")
  public instance: ComboBoxComponent;
  @ViewChild('remote')
  public dropdownObj: ComboBoxComponent;


  @ViewChild('editShipmentDetails') editShipmentDetails: NgForm;
  eSOForm: FormGroup;
  editShipmentOrderReq: any = {};
  editSOLine: any = {};
  soID: any;
  shipmentOrder: any;
  shipmentOrderLines: any;
  header: any = {
    customerMasterInfo: {
      customerID: ''
    },
    "wareHouseTransferDestinationInfo": {
      "wareHouseTransferTransactionID": null,
      "wareHouseID": null,
      "wareHouseName": null,
      "wareHouseIDName": null,
      "wareHouseTransferMasterID": null,
      "organizationIDName": null,
      "organizationID": null,
      "organizationName": null,
      "fullWareHouseTransferTransactionID": null,
      "wareHouseTransferTransactionIDPrefix": null,
    },
    supplierMasterInfo: {
      supplierMasterID: null,
      supplierID: null,
      supplierName: null,
      supplierIDName: null
    },
    orderType: 'Sales Order'
  };
  updatedFShipmentOrderLines: any = [];
  updatedTShipmentOrderLines: any = [];
  dummyUpdatedShipmentLines: any = [];
  soLineToUpdate: any = {};
  focusedElement: any;
  salesOrderID: any;
  @ViewChild('getProductIDName') getProductIDName: ElementRef;
  paymentStatus: any = Constants.PAYMENT_STATUS;
  @Output() passGRStatus = new EventEmitter<any>();
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  shipmentTimeSlots: any = [];
  units: any = [];
  isAllProductsNotUpdated: any = true;
  isShipmentConfirmed: any = false;
  vehicleData: any;
  vehicleIDs: CompleterData;
  serviceProviders: any;
  serviceProvidersIDs: CompleterData;
  newProvidersData: any;
  vehicleNumberIDs: CompleterData;
  mappingVehicleNumber: any;
  dataService: CompleterData;
  newVehicleArrayTyle: any[];
  sNumber: any = null;
  bNumber: any = null;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Shipment Order', Storage.getSessionUser());
  serialNumberAllocation: any = 'No';
  thirdPartyCustomersCheckAllocation: any = 'No';
  spDummyID: any = null;
  dummyVehicle: any = null;
  grNoteInvoices: any = [];
  grnotesData: any = [];
  dummyInv: any = null;
  addValuesCheck: Boolean = true;
  productLogo: any;
  showImage: boolean = false;
  raisedStatus: boolean = false;
  taxData: any = [];
  taxIDs: any = [];
  priceFromBE: number = 0;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  uomConversions: any = [];
  products: any = []
  selectedLineIndex: any;
  tableHeadings: any = ['S.No', 'Image', 'WMSO Line Number', 'Product ID', 'Product Name', 'Product Description', 'Brand Name', 'UOM', 'Batch Number', 'Customer Order Quantity',
    'Shipped Quantity', 'Order Unit Price', 'Discount', 'Gross Amount', 'Tax Amount', 'Amount', 'Expected Delivery Date'
    , 'Dispatch Date', 'Invoice Number & Date', 'Vehicle Number', 'Vehicle Type', 'WayBill Number', 'BOE No'
    , 'BOE Date', 'Ex Bond Number', 'Ex Bond Date', 'Remarks']

  selectAllLinesVariable: boolean = false;
  @ViewChild('grRemote')
  public dropdownObj1: ComboBoxComponent;
  public array = new Array(100).fill(null);
  public data = this.array.map((v, i) => ({ text: i, id: i }));

  // bind the Query instance to query property
  public query: Query = new Query().take(10);
  public fields: Object = {
    text: 'text', value: 'id', itemCreated: (e: any) => {
      highlightSearch(e.item, (this as any).queryString, true, 'Contains');
    }
  };
  // public fields: Object = { text: 'text', value: 'id' };
  paginationStop: boolean = false;
  showTooltip: any = false;

  selectedLinesArray: any = [];
  includeExportData: any = [];
  loopToStop: any = null;
  dataPerPage: any = null;
  overAllBarcodeData: any = [];
  barcodePermissionUser: boolean = false;

  globalProductIndex: any = null;
  barcodeInfo: any = null;

  constructor(
    private outboundProcessService: OutboundProcessService,
    private toastr: ToastrService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService, private commonMasterDataService: CommonMasterDataService,
    private customValidators: CustomValidators, private bService: BarcodeService,
    private util: Util, private commonDataService: CommonMasterDataService,
    private metaDataService: MetaDataService,
    private wmsCommonService: WmsCommonService,
    private appService: AppService, private datePipe: DatePipe,
    private wmsService: WMSService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    // To create it from string
    this.fetchSerialConfig();
    this.grnNotes();
    this.createEditShipmentOrderForm();
    this.fetchAllShipmentTimeSlots();
    this.findAllUnits();
    this.fetchAllUOMs();
    this.soID = this.appService.getParam('id');
    this.fetchShipmentOrderByID();
    this.fetchManagementLines();
    this.fetchAllVehiclesDetails();
    this.fetchMetaData();
    this.getForDisabled();
    this.fetchProductConfig();
    this.fetchConfigurations();
  }

  ngAfterViewInit(): void {
    this.onCreated();
  }
  public inputSize: number = 9;
  onCreated(): void {
    let inputElement: HTMLInputElement;
    if (this.instance === undefined) {
      inputElement.size = this.inputSize;
    } else {
      inputElement = this.instance.element.firstElementChild.children[1] as HTMLInputElement;
      inputElement.addEventListener("keydown", (args) => {
        // Your keydown logic here
      });
      if (inputElement.value.length && inputElement.value.length > this.inputSize) {
        inputElement.size = inputElement.value.length;
      } else {
        inputElement.size = this.inputSize;
      }
    }
  }
  fetchProductConfig() {
    this.bService.fetchAllProductsBarcode(this.formObj).subscribe(res => {
      if (res['status'] === 0 && res['data']['productBarcodeConfigurations'].length > 0) {
        this.overAllBarcodeData = res['data']['productBarcodeConfigurations'];
      }
      else {
        this.overAllBarcodeData = [];
      }
    })
  }
  fetchConfigurations() {
    this.bService.fetchAllBarcodeAccess(this.formObj).subscribe(data => {
      if (data['status'] == 0 && data['data']['processBarcodeAccessConfigurations']) {
        const pType = data['data']['processBarcodeAccessConfigurations'].find(x => x.name == "Shipment Order");
        if (pType) {
          const haveRole = pType.roleConfigurations.find(x => x.role.roleName == this.configService.userDetails.authorities[0].authority);
          if (haveRole) {
            const existedRole = haveRole.userInfos.find(x => x.email == this.configService.userDetails.username);
            if (existedRole) {
              this.barcodePermissionUser = true;
            }
          }
        }
      }
    })
  }
  onOpen1(args, key) {
    if (!this.paginationStop) {
      let start: number = 10;
      let end: number = 20;
      let listElement: HTMLElement = (this[key] as any).list;
      listElement.addEventListener('scroll', () => {
        if (
          listElement.scrollTop + listElement.offsetHeight + 1 >=
          listElement.scrollHeight
        ) {
          let filterQuery = new Query();
          if (!this.paginationStop) {
            this.page += 1;
            const form = {
              noteType: 'Outward Shipment',
              "page": this.page,
              "pageSize": 10,
              "organizationIDName": this.formObj.organizationIDName,
              "wareHouseIDName": this.formObj.wareHouseIDName,
            }
            this.commonMasterDataService.fetchAllGRNote(form).subscribe(res => {
              if (res['status'] == 0 && res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes']) {
                this.grnotesData = [...this.grnotesData, ...res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes];
                this.paginationStop = res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes.length == 0 ? true : false;
                if (!this.paginationStop) {
                  const arr = res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes;
                  // if (arr && arr.length > 0) {
                  if (this.grNoteInvoices.length > 0) {
                    let index = this.grNoteInvoices.length;
                    arr.forEach((v, i) => {
                      i = index;
                      if (!this.grNoteInvoices.find(x => x.text == v.invoiceNumber)) {
                        this.grNoteInvoices.push({ text: v.invoiceNumber, id: i });
                        index += 1;
                      }
                    });
                  }
                  else {
                    this.grNoteInvoices = arr.map((v, i) => ({ text: v.invoiceNumber, id: i }));
                  }
                  new DataManager(this.grNoteInvoices)
                    .executeQuery(filterQuery.range(start, end))
                    .then((event: any) => {
                      start = end;
                      end += 10;
                      this[key].addItem(
                        event.result as {
                          [key: string]: Object;
                        }[]
                      );
                    })
                    .catch((e: Object) => { });
                  // }
                }
              }
              else {
                this.grNoteInvoices = [];
              }
            })
          }
        }
      });
    }
  }
  onFiltering(e, key) {
    let query: Query = new Query();
    query = (e.text !== '') ? query.where('text', 'contains', e.text, true) : query;
    e.updateData(this[key], query);
  }

  fetchAllD(page, event, header) {
    if (event) {
      if (header) {
        this.pageHeader = 1;
        this.fetchShipmentOrderByID(page, event.target.value);
      }
      else {
        this.itemsPerPageManagement = event.target.value;
        this.fetchManagementLines(page);
      }
    }
  }
  grnNotes() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    form['noteType'] = 'Outward Shipment';
    form['page'] = 1
    form['pageSize'] = 10;
    this.commonDataService.fetchAllGRNote(form).subscribe(res => {
      // if (res['status'] == 0 && res['data']['goodsReceiptNotePaginationResponse']['goodsReceiptNotes']) {
      //   // this.grNoteInvoices = res['data']['goodsReceiptNotes'].filter(x => x.invoiceNumber).map(x => x.invoiceNumber);
      //   this.grnotesData = res['data']['goodsReceiptNotePaginationResponse']['goodsReceiptNotes'];
      //   this.grnotesData = res['data']['goodsReceiptNotePaginationResponse']['goodsReceiptNotes'].filter(x => !x.wmsoNumber);
      //   this.grNoteInvoices = this.grnotesData.map(x => x.invoiceNumber);
      //   console.log(this.grNoteInvoices);
      // }
      if (res['status'] == 0 && res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes']) {
        this.grnotesData = res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes.filter(x => !x.wmsoNumber);;
        const arr = res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes.filter(x => !x.wmsoNumber);;
        if (this.grNoteInvoices.length > 0) {
          let index = this.grNoteInvoices.length;
          arr.forEach((v, i) => {
            i = index;
            if (!this.grNoteInvoices.find(x => x.text == v.invoiceNumber)) {
              this.grNoteInvoices.push({ text: v.invoiceNumber, id: i });
              index += 1;
            }
          });
        }
        else {
          this.grNoteInvoices = arr.map((v, i) => ({ text: v.invoiceNumber, id: i }));
        }
      }
    })
  }
  pageHeader: number = 1;
  page: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  pageManagement: number = 1;
  itemsPerPageManagement = 5;
  totalItemsManagement: any;
  searchKeyManagement: any = null;

  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = shipmentOrderManagementHeader['shipmentOrderManagementArrays'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.fetchShipmentOrderByID(1, this.itemsPerPage);
  }
  // setInvoiceTo(event) {
  //   if (event) {
  //     if (event != 'yes') {
  //       this.header.invoiceNumber = event.originalObject;
  //       this.dummyInv = null;
  //     }
  //     this.grnotesById();
  //   }
  // }
  setInvoiceTo(event) {
    if (event) {
      if (event != 'yes' && event.itemData) {
        this.header.invoiceNumber = event.itemData ? event.itemData.text : null;
        this.dummyInv = null;
      }
      this.grnotesById();
    }
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
        }
      })
    this.commonMasterDataService.fetchAllUOMConversion(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.uoms) {
          this.uomConversions = response.data.uoms;
        }
      },
      (error) => {
      });
  }
  grnotesById() {
    const noteDetails = this.grnotesData.find(x => x.invoiceNumber == this.header.invoiceNumber);
    if (noteDetails) {
      this.header.invoiceDate = (noteDetails.invoiceDate ? this.wmsCommonService.getDateFromMilliSec(noteDetails.invoiceDate) : null)
      this.header.vehicleNumber = (noteDetails.vehicleInfo ? noteDetails.vehicleInfo.vehicleNumber : null);
      this.header.waybillNumber = (noteDetails.waybillNumber);
      this.header.vehicleType = (noteDetails.vehicleType);
      // this.header.containerNumber = (noteDetails.equipmentInfo ? noteDetails.equipmentInfo.equipmentID : null);
      this.header.serviceProviderIDName = (noteDetails.serviceProviderInfo ? noteDetails.serviceProviderInfo.serviceProviderIDName : null);
      this.callAllValues();
    }
    else {
      this.header.invoiceDate = null
      this.header.vehicleNumber = null
      this.header.waybillNumber = null;
      this.header.vehicleType = null;
      this.header.serviceProviderIDName = null;
      this.callAllValues();
    }
  }
  fetchSerialConfig() {
    this.metaDataService.getAllSerialNumberConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberAllocation = res.data.serialNumberConfigurations[0].serialNumberCheck;
        if (this.serialNumberAllocation == 'Yes') {
          this.tableHeadings = ['S.No', 'Image', 'WMSO Line Number', 'Product ID',
            'Product Name', 'Product Description', 'Brand Name', 'UOM',
            'Batch Number', 'Customer Order Quantity',
            'Shipped Quantity', 'Serial Number', 'Order Unit Price', 'Discount', 'Gross Amount',
            'Tax Amount', 'Amount',
            'Expected Delivery Date', 'Dispatch Date',
            'Invoice Number & Date',
            'Vehicle Number',
            'Vehicle Type',
            'WayBill Number',
            'BOE No', 'BOE Date', 'Bond No', 'Bond Date',
            'Ex Bond Number',
            'Ex Bond Date',
            'Remarks']
        }
        else {
          this.serialNumberAllocation == 'No';
          this.tableHeadings = ['S.No', 'Image', 'WMSO Line Number', 'Product ID',
            'Product Name', 'Product Description', 'Brand Name', 'UOM',
            'Batch Number', 'Customer Order Quantity',
            'Shipped Quantity', 'Order Unit Price', 'Discount', 'Gross Amount',
            'Tax Amount', 'Amount',
            'Expected Delivery Date', 'Dispatch Date',
            'Invoice Number & Date',
            'Vehicle Number',
            'Vehicle Type',
            'WayBill Number',
            'BOE No', 'BOE Date', 'Bond No', 'Bond Date',
            'Ex Bond Number',
            'Ex Bond Date',
            'Remarks']

        }
      }
      else {

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
  calculateTaxPercentage() {
    if (this.eSOForm.controls.saleTaxes.value && this.eSOForm.controls.saleTaxes.value.length > 0) {
      this.eSOForm.controls.taxAmount.setValue(0);
      this.calculate();
    }
    else {
      this.eSOForm.controls.taxAmount.setValue(0);
      this.calculate();
    }
  }
  selectCheck(i, data) {
    this.onSelect(true, i, data);
  }
  calculateTransferQty(tableRec?, i?, dontHit?, fromScan?) {
    const line = tableRec ? tableRec : this.eSOForm.value;
    const arr = dontHit ? 'selectedLinesArray' : 'updatedFShipmentOrderLines';
    if (!dontHit) {
      this.onSelect(true, i, tableRec);
    }
    const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === line.shipmentUnit &&
      uom.unitConversionTo === line.inventoryUnit && uom.productMasterInfo.productIDName === line.productMasterInfo.productIDName);
    if (filteredUOMConversion && filteredUOMConversion.conversionFactor) {
      let disQty = DecimalUtils.multiply(line.customerDispatchQuantity, filteredUOMConversion.conversionFactor);
      if (tableRec) {
        this[arr][i]['dispatchQuantity'] = disQty;
        if (!dontHit) {
          this.onSelect(true, i, tableRec);
        }
      }
      else {
        this.eSOForm.controls.dispatchQuantity.setValue(disQty);
      }
    }
    else {
      if (this[arr][i].uomConversionAvailability == 'Yes') {
        this.toastr.error("No Matching Unit Conversion Factor.");
      }
      else {
        const conversionFactor = DecimalUtils.divide(this[arr][i].orderUnitPrice, this[arr][i].unitPrice);
        let disQty = DecimalUtils.multiply(line.customerDispatchQuantity, conversionFactor);
        if (tableRec) {
          this[arr][i]['dispatchQuantity'] = disQty;
          if (!dontHit) {
            this.onSelect(true, i, tableRec);
          }
        }
        else {
          this.eSOForm.controls.dispatchQuantity.setValue(disQty);
        }
      }
    }
    this.calculate(tableRec, i, dontHit, fromScan);
    // }
  }
  validateDecimal(key, i) {
    this.updatedFShipmentOrderLines[i][key] = DecimalUtils.enterLimitedDecimals(this.updatedFShipmentOrderLines[i][key], ((key == 'discount') ? 3 : 10));
  }
  calculate(tableRec?, i?, dontHit?, fromScan?) {
    // const findIndex = this.updatedFShipmentOrderLines.findIndex(x => x.isChecked)
    // if (findIndex != -1 && findIndex != i) {
    //   this.toastr.error("Update Enter Data Line");
    // }
    // else {
    const arr = dontHit ? 'selectedLinesArray' : 'updatedFShipmentOrderLines';
    let amount: any = 0;
    let taxes: any = 0;
    let taxPercentage: any = 0;
    const soLine = tableRec ? tableRec : this.eSOForm.value;
    if (soLine.orderUnitPrice && soLine.customerDispatchQuantity) {
      amount = DecimalUtils.multiply(soLine.orderUnitPrice, soLine.customerDispatchQuantity);
      // if (soLine.unitPrice && soLine.dispatchQuantity) {
      //   amount = (soLine.unitPrice * soLine.dispatchQuantity);
      if (tableRec) {
        this[arr][i].grossAmount = amount;
      }
      else {
        this.eSOForm.controls.grossAmount.setValue(amount);
      }
      if (soLine.discount) {
        // amount = amount * (1 - (soLine.discount) / 100);

        amount = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(soLine.discount, 100)), amount);

        if (tableRec) {
          this[arr][i].discountAmount = (DecimalUtils.subtract(this[arr][i].grossAmount, amount));
        }
        else {
          const discountAmount = (DecimalUtils.subtract(this[arr][i].grossAmount, amount));
          this.eSOForm.controls.discountAmount.setValue(discountAmount);
        }
      }
      if (soLine.saleTaxes && soLine.saleTaxes.length > 0) {
        soLine.saleTaxes.forEach(el => {
          taxPercentage = DecimalUtils.add(taxPercentage, (el.taxPercentage ? el.taxPercentage : 0))
        });
        if (tableRec) {
          this[arr][i].taxPercentage = taxPercentage;
        }
        else {
          this.eSOForm.controls.taxPercentage.setValue(taxPercentage);
        }
        soLine.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);
        if (tableRec) {
          this[arr][i].taxAmount = soLine.taxAmount;
        }
        else {
          this.eSOForm.controls.taxAmount.setValue(soLine.taxAmount);
        }
        taxes = soLine.taxAmount;
      }
      if (tableRec) {
        if (!dontHit) {
          this.onSelect(true, i, tableRec);
        }
        this[arr][i].netAmount = (DecimalUtils.add(amount, taxes));
      }
      else {
        this.eSOForm.controls.netAmount.setValue((DecimalUtils.add(amount, taxes)));
      }
    }
    else {
      if (tableRec) {
        if (!dontHit) {
          this.onSelect(false, i, tableRec);
        }
        this[arr][i].netAmount = null;
        this[arr][i].grossAmount = null;
        this[arr][i].taxAmount = null;
        this[arr][i].discountAmount = null;
        this[arr][i].taxPercentage = null;
      }
      else {
        this.eSOForm.controls.netAmount.setValue(null);
        this.eSOForm.controls.grossAmount.setValue(null);
        this.eSOForm.controls.taxAmount.setValue(null);
        this.eSOForm.controls.discountAmount.setValue(null);
        this.eSOForm.controls.taxPercentage.setValue(null);
      }
    }
    if (fromScan) {
      this.updateContinue([this[arr][i]]);
    }
    // }
  }

  isReadonly: boolean = false;
  getForDisabled() {
    if (this.permissionsList.includes('View') && this.appService.getParam('id') && this.permissionsList.includes('Update')) {
      this.eSOForm.enable();
    }
    else if (this.permissionsList.includes('View') && this.appService.getParam('id')) {
      this.eSOForm.disable();

    }
  }
  fetchMetaData() {
    // this.reportsCommonService.FetchAllServiceProviderDetails();
    // this.reportsCommonService.serviceProviderValues.subscribe(res => {
    //   this.dataService = this.completerService.local(res);
    // });
    this.wmsService.fetchAllServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.serviceProviders) {
        this.serviceProviders = response.data.serviceProviders;
        this.dataService = this.serviceProviders.map(x => x.serviceProviderIDName);
      } else {
        this.serviceProviders = [];
      }
    }, error => {
      this.serviceProviders = [];
    });
  }
  fetchAllUOMs() {
    this.commonDataService.fetchAllUOMConversion(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.uoms) {
          this.uomConversions = response.data.uoms;
        }
      },
      (error) => {
      });
  }
  setSearchValueToText(event, keyName) {
    if (event) {
      this.header[keyName] = event.originalObject;
      this.spDummyID = null;
      this.dummyVehicle = null;
      if (keyName == 'vehicleNumber') {
        const fined = this.vehicleData.find(x => x.vehicleNumber == event.originalObject);
        this.header['vehicleType'] = fined.vehicleType;
        this.addLine('vehicleType', 'vehicleType');
      }
      this.addLine(keyName, keyName);
    }
  }
  setVehicleType() {
    const fined = this.vehicleData.find(x => x.vehicleNumber == this.header.vehicleNumber);
    if (fined) {
      this.header['vehicleType'] = fined.vehicleType;
    }
    else {
      this.header['vehicleType'] = null;
    }
    this.addLine('vehicleType', 'vehicleType');
  }
  callAllValues() {
    this.addLine('waybillNumber', 'wayBillNumber');
    this.addLine('invoiceNumber', 'invoiceNumber');
    this.addLine('invoiceDate', 'invoiceDate');
    this.addLine('vehicleNumber', 'vehicleNumber');
    this.addLine('vehicleType', 'vehicleType');
    this.addLine('modeOfTransport', 'modeOfTransport');
    this.addLine('serviceProviderIDName', 'serviceProviderIDName');
  }
  addLine(headForm, lineForm) {
    if (this.addValuesCheck) {
      this.eSOForm.controls[lineForm].setValue(this.header[headForm]);
      if (this.updatedFShipmentOrderLines && this.updatedFShipmentOrderLines.length) {
        this.updatedFShipmentOrderLines.forEach(element => {
          element[lineForm] = this.header[headForm];
        });
      }
    }
  }
  checkingaddValuesCheck(event) {
    if (event) {
      this.callAllValues();
    }
    else {
      if (this.updatedFShipmentOrderLines && this.updatedFShipmentOrderLines.length) {
        this.updatedFShipmentOrderLines.forEach(element => {
          element.wayBillNumber = null;
          element.invoiceNumber = null;
          element.invoiceDate = null;
          element.vehicleNumber = null;
          element.modeOfTransport = null;
          element.serviceProviderIDName = null;
        });
      }
      this.eSOForm.controls.wayBillNumber.setValue(null);
      this.eSOForm.controls.invoiceNumber.setValue(null);
      this.eSOForm.controls.invoiceDate.setValue(null);
      this.eSOForm.controls.vehicleNumber.setValue(null);
      this.eSOForm.controls.modeOfTransport.setValue(null);
      this.eSOForm.controls.serviceProviderIDName.setValue(null);
    }
  }
  fetchAllVehiclesDetails() {
    this.commonDataService.fetchAllVehicles(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.vehicleMasters) {
          this.vehicleIDs = response.data.vehicleMasters.map(x => x.vehicleNumber);
          this.vehicleData = response.data.vehicleMasters;
        }
      });
  }


  totalNetAmount: any;
  fetchShipmentOrderByID(page?, pageSize?) {
    if (this.soID) {
      const formValues = {
        'organizationIDName': this.formObj.organizationIDName,
        'wareHouseIDName': this.formObj.wareHouseIDName,
        "page": page ? page : 1,
        "pageSize": this.itemsPerPage,
        "sortDirection": this.sortDirection,
        "sortFields": this.sortFields,
        "searchOnKeys": shipmentOrderHead.shipmentByIDSearchOnKeys,
        "searchKeyword": this.searchKey,
        _id: this.soID,
        "shipmentOrderLineStatus": "Completely Dispatched",
        "shipmentOrderLineStatusOperatorType": "ne"
      }
      this.outboundProcessService.fetchShipmentOrderByIDPagination(formValues).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.shipmentOrderPaginationResponse.shipmentOrder) {
            this.totalItems = response.data.shipmentOrderPaginationResponse.totalElements;
            this.raisedStatus = response.data.shipmentOrderPaginationResponse.shipmentOrder.status != 'Open' ? true : false;
            if (this.raisedStatus) {
              this.eSOForm.disable();
            }
            this.shipmentOrder = response.data.shipmentOrderPaginationResponse.shipmentOrder;
            if (this.shipmentOrder && this.shipmentOrder.status === 'Closed') { this.isShipmentConfirmed = true; }
            if (!response.data.shipmentOrderPaginationResponse.shipmentOrder.customerMasterInfo) {
              response.data.shipmentOrderPaginationResponse.shipmentOrder.customerMasterInfo = {
                customerIDName: null,
                customerID: null,
                customerName: null,
                customerMasterID: null
              }
            }
            if (!response.data.shipmentOrderPaginationResponse.shipmentOrder.supplierMasterInfo) {
              response.data.shipmentOrderPaginationResponse.shipmentOrder.supplierMasterInfo = {
                supplierMasterID: null,
                supplierID: null,
                supplierName: null,
                supplierIDName: null
              }
            }
            if (!response.data.shipmentOrderPaginationResponse.shipmentOrder.wareHouseTransferDestinationInfo) {
              response.data.shipmentOrderPaginationResponse.shipmentOrder["wareHouseTransferDestinationInfo"] = {
                "wareHouseTransferTransactionID": null,
                "wareHouseID": null,
                "wareHouseName": null,
                "wareHouseIDName": null,
                "wareHouseTransferMasterID": null,
                "organizationIDName": null,
                "organizationID": null,
                "organizationName": null,
                "fullWareHouseTransferTransactionID": null,
                "wareHouseTransferTransactionIDPrefix": null,
              }
            }
            this.header = response.data.shipmentOrderPaginationResponse.shipmentOrder;
            this.header["page"] = page,
              this.header["pageSize"] = this.itemsPerPage,
              this.header["searchKeyword"] = null,
              this.header["searchOnKeys"] = shipmentOrderManagementHeader.shipmentOrderManagementKeys,
              this.header["sortDirection"] = null,
              this.header["sortFields"] = null
            // this.findAllTaxes();
            this.totalNetAmount = response.data.shipmentOrderPaginationResponse.shipmentOrder.totalNetAmount;
            this.header.vehicleNumber = null;
            this.header.serviceProviderIDName = null;
            if (response.data.shipmentOrderPaginationResponse.shipmentOrder.vehicleInfo) {
              this.header.vehicleNumber = response.data.shipmentOrderPaginationResponse.shipmentOrder.vehicleInfo.vehicleNumber
            }
            if (response.data.shipmentOrderPaginationResponse.shipmentOrder.serviceProviderInfo) {
              this.header.serviceProviderIDName = response.data.shipmentOrderPaginationResponse.shipmentOrder.serviceProviderInfo.serviceProviderIDName
            }
            this.header.orderDate = this.header.salesOrderDate ?
              this.wmsCommonService.getDateFromMilliSec(this.header.salesOrderDate) : this.header.salesOrderDate;
            this.header.invoiceDate = this.header.invoiceDate ?
              this.wmsCommonService.getDateFromMilliSec(this.header.invoiceDate) : this.header.invoiceDate;

            this.salesOrderID = this.shipmentOrder.soID;
            this.shipmentOrderLines = response.data.shipmentOrderPaginationResponse.shipmentOrder.shipmentOrderLines;
            if (!this.shipmentOrderLines) {
              this.shipmentOrderLines = [];
            }
            if (this.productUpdatedStatus()) {
              this.isAllProductsNotUpdated = false;
            }
            this.updatedFShipmentOrderLines = this.shipmentOrderLines;
            // this.updatedFShipmentOrderLines = this.shipmentOrderLines.filter((line: any) => {
            //   return line.status != 'Completely Dispatched';
            // });
            let selectedCheckIDs = [];
            if (this.selectedLinesArray.length > 0) {
              selectedCheckIDs = this.selectedLinesArray.map(x => x._id);
            }
            this.updatedFShipmentOrderLines.forEach(ele => {
              ele.customerDispatchQuantity = null;
              ele.forBarcode = null;
              ele.isChecked = false;
              if (this.selectAllLinesVariable) {
                ele.isChecked = true;
              }
              if (selectedCheckIDs.includes(ele._id)) {
                const choosedLine = this.selectedLinesArray.find(x => x._id === ele._id);
                ele.isChecked = true;
                ele.customerDispatchQuantity = choosedLine.customerDispatchQuantity;
                ele.discount = choosedLine.discount;
                ele.dispatchDate = choosedLine.dispatchDate;
              }
              if (ele.dispatchDate) {
                ele.dispatchDate = this.datePipe.transform(new Date(ele.dispatchDate), 'yyyy-MM-dd');
              }
              else {
                ele.dispatchDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
              }
              ele.expectedDeliveryDate = ele.expectedDeliveryDate ? this.wmsCommonService.getDateFromMilliSec(ele.expectedDeliveryDate) : null
            });
            this.callAllValues();
            this.dummyUpdatedShipmentLines = this.updatedFShipmentOrderLines;
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
            this.dtTrigger.next();

          } else {
            this.shipmentOrder = {};
            this.updatedFShipmentOrderLines = [];
            this.dummyUpdatedShipmentLines = this.updatedFShipmentOrderLines;
            // this.updatedTShipmentOrderLines = [];
            this.dtTrigger.next();
            this.dtTrigger2.next();
          }
        },
        (error) => {
          this.shipmentOrderLines = [];
        }
      );
    }
  }


  fetchManagementLines(page?) {
    const formValues = {
      'organizationIDName': this.formObj.organizationIDName,
      'wareHouseIDName': this.formObj.wareHouseIDName,
      "page": page ? page : 1,
      "pageSize": this.itemsPerPageManagement,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "searchOnKeys": shipmentOrderHead.shipmentByManagementByIDSearchOnKeys,
      "searchKeyword": this.searchKeyManagement,
      _id: this.soID,
    }
    this.outboundProcessService.fetchShipmentOrderManagementByID(formValues).subscribe(
      (response) => {
        if (response.status === 0 && response.data.shipmentOrderManagementPaginationResponse.shipmentOrderManagement) {
          this.updatedTShipmentOrderLines = response.data.shipmentOrderManagementPaginationResponse.shipmentOrderManagement.shipmentOrderManagementLines;
          this.totalItemsManagement = response.data.shipmentOrderManagementPaginationResponse.totalElements;
          // this.dtTrigger2.next();
        }
        else {
          this.updatedTShipmentOrderLines = []

        }
      })
  }
  isReadMode = false;

  selectAllData(event, arr) {
    if (event.target.checked) {
      this[arr].forEach(element => {
        element.isChecked = true;
      });
    }
    else {
      this[arr].forEach(element => {
        element.isChecked = false;
      });
    }
    if (this.includeExportData.length == 0 && event.target.checked) {
      this.getAllLinesLists();
    }
    else if (this.includeExportData.length && event.target.checked) {
      this.selectedLinesArray = this.includeExportData;
    }
  }
  getAllLinesLists(index?) {
    if (!index) {
      this.includeExportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      console.log(this.includeExportData);
      if (this.selectAllLinesVariable) {
        this.includeExportData.forEach(grLine => {
          grLine.isChecked = true;
        });
        this.selectedLinesArray = this.includeExportData;
      }
    }
    else {
      if (((i == 1) || (i != 1 && this.includeExportData.length > 0)) && i <= this.loopToStop) {
        const formValues = {
          'organizationIDName': this.formObj.organizationIDName,
          'wareHouseIDName': this.formObj.wareHouseIDName,
          "page": i,
          "pageSize": parseInt(this.dataPerPage),
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "searchOnKeys": shipmentOrderHead.shipmentByIDSearchOnKeys,
          "searchKeyword": this.searchKey,
          _id: this.soID,
          "shipmentOrderLineStatus": "Completely Dispatched",
          "shipmentOrderLineStatusOperatorType": "ne"
        }
        this.outboundProcessService.fetchShipmentOrderByIDPagination(formValues).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.shipmentOrderPaginationResponse.shipmentOrder && response.data.shipmentOrderPaginationResponse.shipmentOrder.shipmentOrderLines) {
              this.includeExportData = [...this.includeExportData, ...response.data.shipmentOrderPaginationResponse.shipmentOrder.shipmentOrderLines];
              this.getAllLinesLists(i);
            }
          })
      }
    }
  }
  onSelect(event, i, data) {
    this.updatedFShipmentOrderLines[i].isChecked = event;
    if (event) {
      if (this.selectedLinesArray.length) {
        const selectedIDs = this.selectedLinesArray.map(x => x._id);
        if (selectedIDs.includes(data._id)) {
          const findIn = this.selectedLinesArray.findIndex(x => x._id === data._id);
          if (findIn != -1) {
            this.selectedLinesArray[findIn].isChecked = true;
            this.selectedLinesArray[findIn].customerDispatchQuantity = data.customerDispatchQuantity;
            this.selectedLinesArray[findIn].discount = data.discount;
            this.selectedLinesArray[findIn].dispatchDate = data.dispatchDate;
          }
        }
        else {
          this.selectedLinesArray.push(data);
        }

      }
      else {
        this.selectedLinesArray.push(data);
      }
    }
    else {
      this.selectedLinesArray = this.selectedLinesArray.filter(x => x._id != data._id);
    }
    // this.selectAllLinesVariable = this.updatedFShipmentOrderLines.every(function (item: any) {
    //   return item.isChecked == true;
    // })
  }

  editShipmentOrderLine(soLine: any) {
    this.productLogo = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    if (this.permissionsList.includes('Update')) {
      if (soLine.productCategoryInfo == null || soLine.productCategoryInfo == undefined) {
        soLine.productCategoryInfo = {}
      }
      this.isReadMode = true;
      soLine.invoiceDate = soLine.invoiceDate ? this.wmsCommonService.getDateFromMilliSec(soLine.invoiceDate) : null;
      soLine.billOfEntryDate = soLine.billOfEntryDate ? this.wmsCommonService.getDateFromMilliSec(soLine.billOfEntryDate) : null;
      soLine.billOfLandingDate = soLine.billOfLandingDate ? this.wmsCommonService.getDateFromMilliSec(soLine.billOfLandingDate) : null;
      this.eSOForm.patchValue(new EditShipmentOrderLine(soLine));


      const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === soLine.shipmentUnit &&
        uom.unitConversionTo === soLine.inventoryUnit && uom.productMasterInfo.productIDName === soLine.productMasterInfo.productIDName);
      if (filteredUOMConversion && filteredUOMConversion.conversionFactor) {
        this.eSOForm.controls.pickedQuantity.setValue(soLine.pickedQuantity)
        this.eSOForm.controls.customerPickedQuantity.setValue(soLine.customerPickedQuantity)
      }

      this.eSOForm['controls'].saleTaxes.setValue(soLine.saleTaxes ? soLine.saleTaxes.map(x => x.taxNamePercentage) : null);
      if (soLine.productImage && this.showImage) {
        const fileNames = JSON.parse(JSON.stringify(soLine.productImage));
        this.metaDataService.viewImages(fileNames).subscribe(data => {
          if (data['status'] == 0) {
            this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
            this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
            this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
          }
        });
      }
      this.eSOForm.controls.shipmentTimeSlot.setValue(this.shipmentOrder.shipmentTimeSlot);
      // this.eSOForm.controls.shipmentTimeSlot.setValue(soLine.shipmentTimeSlot);
      this.eSOForm.controls.invoiceNumber.setValue(this.shipmentOrder.invoiceNumber);
      this.eSOForm.controls.productImage.setValue(this.shipmentOrder.productImage);
      this.eSOForm.controls.hsnCode.setValue(this.shipmentOrder.hsnCode);
      this.eSOForm.controls.dispathInstruciton.setValue(soLine.dispathInstruciton);
      this.eSOForm.controls.invoiceType.setValue(this.shipmentOrder.invoiceType);
      this.eSOForm.controls.batchNumber.setValue(soLine.batchNumber);
      this.eSOForm.controls.inventoryUnit.setValue(soLine.inventoryUnit);
      this.eSOForm.controls.billOfEntryDate.setValue(soLine.billOfEntryDate);
      this.eSOForm.controls.vehicleType.setValue(soLine.vehicleType);
      this.eSOForm.controls.productCategoryInfo.setValue(soLine.productCategoryInfo);
      this.eSOForm.controls.vehicleInfo.setValue(soLine.vehicleInfo);
      this.eSOForm.controls.lrNumber.setValue(soLine.lrNumber);
      this.eSOForm.controls.billOfEntryNumberDate.setValue(soLine.billOfEntryNumberDate);
      this.eSOForm.controls.billOfLandingNumber.setValue(soLine.billOfLandingNumber);
      this.eSOForm.controls.billOfLandingDate.setValue(soLine.billOfLandingDate);
      this.eSOForm.controls.billOfLandingNumberDate.setValue(soLine.billOfLandingNumberDate);
      this.eSOForm.controls.invoiceDate.setValue(soLine.invoiceDate);
      // this.eSOForm.controls.dispatchDate.setValue(this.wmsCommonService.getDateFromMilliSec(soLine.dispatchDate || new Date()));

      if (soLine.dispatchDate) {
        this.eSOForm.controls.dispatchDate.setValue(this.datePipe.transform(new Date(soLine.dispatchDate), 'yyyy-MM-dd HH:mm'))
      }
      else {
        this.eSOForm.controls.dispatchDate.setValue(this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm'))
      }
      // if (soLine.serialNumbers && soLine.serialNumbers.length > 0) {
      //   this.sNumber = soLine.serialNumbers.toString();
      // }
      // if (soLine.batchNumbers && soLine.batchNumbers.length > 0) {
      //   this.bNumber = soLine.batchNumbers.toString();
      // }

      const eDate = soLine.expectedDeliveryDate ? this.wmsCommonService.getDateFromMilliSec(soLine.expectedDeliveryDate) : null
      this.eSOForm.controls.expectedDeliveryDate.setValue(eDate);
      this.editSOLine = Object.assign({}, soLine);
      this.soLineToUpdate = Object.assign({}, soLine);
      this.callAllValues();
      this.updatedFShipmentOrderLines = JSON.parse(JSON.stringify(this.dummyUpdatedShipmentLines));
      if (this.updatedFShipmentOrderLines) {
        this.updatedFShipmentOrderLines.forEach((line, index) => {
          if (line._id === soLine._id) {
            this.updatedFShipmentOrderLines.splice(index, 1);
          }
        });
      }
      this.getProductIDName.nativeElement.focus();
    }
    else {
      this.toastr.error("User doesn't have this permission to access");
    }
  }
  cancel() {
    if (this.permissionsList.includes('Update')) {
      const obj = Object.values(this.soLineToUpdate);
      if (obj.length > 0) {
        this.updatedFShipmentOrderLines.push(this.soLineToUpdate);
        this.dummyUpdatedShipmentLines = this.updatedFShipmentOrderLines;
        this.soLineToUpdate = {};
        this.eSOForm.reset();
        this.sNumber = null;
        this.bNumber = null;
        if (this.showImage) {
          const element = <HTMLImageElement>(document.getElementById('pLogo'));
          element.src = null;
        }
      }
      else {
        this.toastr.error("user doesnt have permission");
      }

    }
  }
  mapId(key, name) {
    if (key == 'vehicle') {
      const vehicleDetals = this.vehicleData.find(x => x.vehicleNumber == name);
      if (vehicleDetals) {
        return { _id: vehicleDetals._id, vehicleNumber: vehicleDetals.vehicleNumber }
      }
      else {
        return { _id: null, vehicleNumber: name }
      }
    }
    if (key == 'serviceInfo') {
      const spDetails = this.serviceProviders.find(x => x.serviceProviderIDName == name);
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
  setShippedQty() {
    this.updatedFShipmentOrderLines.forEach((element, i) => {
      if (element.isChecked) {
        element.customerDispatchQuantity = element.customerQuantity;
        this.calculateTransferQty(element, i);
      }
    });
    if (this.selectedLinesArray.length) {
      this.selectedLinesArray.forEach((element, i) => {
        if (element.isChecked) {
          element.customerDispatchQuantity = element.customerQuantity;
          this.calculateTransferQty(element, i, 'Dont');
        }
      });
    }
  }
  update() {
    // if (this.header.paymentStatus) {
    let arr = this.updatedFShipmentOrderLines.filter(x => x.isChecked);
    if (this.selectedLinesArray.length > 0) {
      arr = this.selectedLinesArray;
    }
    if (arr && arr.length > 0) {
      this.updateContinue(arr);
    }
    else {
      this.toastr.error('No Data to Proceed');
    }

  }
  updateContinue(arr) {
    if (this.permissionsList.includes('Update')) {
      if (arr.length) {
        // changed customerPickedQuantity to customerDispatchQuantity
        // customerQuantity , customerDispatchQuantity , totalCustomerDispatchQuantity

        // customerQuantity < customerDispatchQuantity

        const dontProceeed = arr.find(x => !x.productMasterInfo.productIDName || !x.customerDispatchQuantity ||
          (x.customerDispatchQuantity && DecimalUtils.lessThan(x.customerQuantity, x.customerDispatchQuantity)) ||
          (x.customerDispatchQuantity && x.totalCustomerDispatchQuantity && DecimalUtils.lessThan(
            x.customerQuantity, DecimalUtils.add(x.customerDispatchQuantity, x.totalCustomerDispatchQuantity)
          )))

        if (dontProceeed) {
          this.toastr.error('Shipment quantity should not greater than Picked quantity');
        }
        else {
          this.editShipmentOrderReq = Object.assign({}, new ShipmentOrder(this.shipmentOrder));
          this.editShipmentOrderReq['vehicleInfo'] = this.mapId('vehicle', this.header.vehicleNumber);
          this.editShipmentOrderReq['serviceProviderInfo'] = this.mapId('serviceInfo', this.header.serviceProviderIDName);
          this.editShipmentOrderReq['invoiceNumber'] = this.header.invoiceNumber;
          this.editShipmentOrderReq['invoiceDate'] = this.header.invoiceDate ? new Date(this.header.invoiceDate) : null;
          this.editShipmentOrderReq['vehicleType'] = this.header.vehicleType;
          this.editShipmentOrderReq['driverName'] = this.header.driverName;
          this.editShipmentOrderReq['driverPhoneNumber'] = this.header.driverPhoneNumber;
          this.editShipmentOrderReq['waybillNumber'] = this.header.waybillNumber;
          this.editShipmentOrderReq['modeOfTransport'] = this.header.modeOfTransport;
          this.editShipmentOrderReq['customersCustomerAddress'] = this.header.customersCustomerAddress;
          this.editShipmentOrderReq['customersCustomerName'] = this.header.customersCustomerName;
          if (this.editShipmentOrderReq.customerMasterInfo && !this.editShipmentOrderReq.customerMasterInfo.customerIDName) {
            this.editShipmentOrderReq.customerMasterInfo = null;
          }
          if (this.editShipmentOrderReq.wareHouseTransferDestinationInfo && !this.editShipmentOrderReq.wareHouseTransferDestinationInfo.wareHouseIDName) {
            this.editShipmentOrderReq.wareHouseTransferDestinationInfo = null;
          }
          if (this.editShipmentOrderReq.supplierMasterInfo && !this.editShipmentOrderReq.supplierMasterInfo.supplierIDName) {
            this.editShipmentOrderReq.supplierMasterInfo = null;
          }
          this.editShipmentOrderReq.shipmentOrderLines = [];
          //below commenting lines is for panel View
          // if (!line) {
          //   this.eSOForm.value._id = this.editSOLine._id;
          //   this.eSOForm.value.wmsoLineNumber = this.editSOLine.wmsoLineNumber;
          // }
          this.editShipmentOrderReq._id = this.soID;
          //below commenting lines is for panel View
          // if (!line) {
          //   this.editShipmentOrderReq.shipmentOrderLines[0].productCategoryInfo = this.editSOLine.productCategoryInfo;
          //   this.editShipmentOrderReq.shipmentOrderLines[0].productMasterInfo = this.editSOLine.productMasterInfo;
          // }
          this.editShipmentOrderReq.paymentStatus = this.header.paymentStatus;
          //below commenting lines is for panel View
          // if (!line) {
          //   delete this.editShipmentOrderReq.shipmentOrderLines[0].productMasterInfo.moq;
          // }
          arr.forEach(line => {
            // const line = arr ? arr : this.eSOForm.value;
            const dummyForm = line ? line : this.eSOForm.value;
            dummyForm['vehicleInfo'] = this.mapId('vehicle', dummyForm.vehicleNumber);
            delete dummyForm.vehicleNumber;
            dummyForm['serviceProviderInfo'] = this.mapId('serviceInfo', dummyForm.serviceProviderIDName);
            delete dummyForm.serviceProviderIDName;
            if (dummyForm.dispatchDate) {

              let d = new Date();
              d.getHours();
              d.getMinutes();
              d.getSeconds();
              dummyForm.dispatchDate = dummyForm.dispatchDate + " " + d.getHours() + ":" + d.getMinutes();

            }
            const product = Object.assign({}, new EditShipmentOrderLine(dummyForm));
            this.editShipmentOrderReq.shipmentOrderLines.push(product);
          });
          let totalAmount: any = 0;
          let grossAmount: any = 0;
          let taxAmount: any = 0;
          let discount: any = 0;
          let discountAmount: any = 0;
          let taxPercentage: any = 0;
          let saleTaxes = [];
          if (this.editShipmentOrderReq.shipmentOrderLines.length > 0) {
            this.editShipmentOrderReq.shipmentOrderLines.forEach(product => {
              totalAmount = DecimalUtils.add(totalAmount, product.netAmount);
              grossAmount = DecimalUtils.add(grossAmount, product.grossAmount);
              taxAmount = DecimalUtils.add(taxAmount, product.taxAmount);
              if (product.discount && product.discountAmount) {
                discount = DecimalUtils.add(discount, product.discount);
                discountAmount = DecimalUtils.add(discountAmount, product.discountAmount);
              }
              taxPercentage = DecimalUtils.add(taxPercentage, product.taxPercentage);
              saleTaxes = [...saleTaxes, ...product.saleTaxes];
            });
          }
          let grouped = saleTaxes.reduce(
            (result: any, currentValue: any) => {
              (result[currentValue['taxNamePercentage']] = result[currentValue['taxNamePercentage']] || []).push(currentValue);
              return result;
            }, {});
          this.editShipmentOrderReq['totalNetAmount'] = totalAmount;
          this.editShipmentOrderReq['totalGrossAmount'] = grossAmount;
          this.editShipmentOrderReq['totalTaxAmount'] = taxAmount;
          this.editShipmentOrderReq['totalDiscount'] = discount;
          this.editShipmentOrderReq['totalDiscountAmount'] = discountAmount;
          this.editShipmentOrderReq['totalTaxPercentage'] = taxPercentage;
          if (grouped) {
            this.editShipmentOrderReq['totalSaleTaxes'] = [];
            const headers = Object.keys(grouped);
            headers.forEach(element => {
              let taxA: any = 0;
              grouped[element].forEach(tax => {
                taxA = DecimalUtils.add(taxA, tax.taxAmount);
              });
              this.editShipmentOrderReq['totalSaleTaxes'].push({
                taxAmount: taxA,
                taxName: element.split(':')[0],
                taxNamePercentage: element,
                taxPercentage: element.split(':')[1],
              })
            });
          }
          if (this.editShipmentOrderReq.customerMasterInfo) {
            delete this.editShipmentOrderReq.customerMasterInfo.organizationIDName;
            delete this.editShipmentOrderReq.customerMasterInfo.wareHouseIDName;
          }
          this.outboundProcessService.updateShipmentOrder(this.editShipmentOrderReq).subscribe(
            (response) => {
              this.passGRStatus.emit(true);
              if (response && response.status === 0 && response.data.shipmentOrder) {
                this.rerender();
                this.eSOForm.reset();

                this.soLineToUpdate = {};
                this.sNumber = null;
                this.bNumber = null;
                this.selectedLinesArray = [];
                this.pageHeader = 1;
                this.itemsPerPage = 5;
                this.fetchShipmentOrderByID(1);
                this.pageManagement = 1;
                this.itemsPerPageManagement = 5;
                this.fetchManagementLines(1);
                this.passGRStatus.emit(true);
                if (this.showImage) {
                  const element = <HTMLImageElement>(document.getElementById('pLogo'));
                  element.src = null;
                }
                if (this.productUpdatedStatus()) { this.isAllProductsNotUpdated = false; }
                this.toastr.success('Updated successfully');
              } else {
                if (response && response.status === 1) {
                  this.toastr.error(response['statusMsg']);
                }
                else {
                  this.toastr.error('Failed in updating');
                }
              }
            },
            (error) => {
              this.toastr.error('Failed in updating');
            });
        }
      }
      else {
        this.editShipmentOrderReq = Object.assign({}, new ShipmentOrder(this.shipmentOrder));
        this.editShipmentOrderReq['vehicleInfo'] = this.mapId('vehicle', this.header.vehicleNumber);
        this.editShipmentOrderReq['serviceProviderInfo'] = this.mapId('serviceInfo', this.header.serviceProviderIDName);
        this.editShipmentOrderReq['invoiceNumber'] = this.header.invoiceNumber;
        this.editShipmentOrderReq['invoiceDate'] = this.header.invoiceDate ? new Date(this.header.invoiceDate) : null;
        this.editShipmentOrderReq['vehicleType'] = this.header.vehicleType;
        this.editShipmentOrderReq['waybillNumber'] = this.header.waybillNumber;
        this.editShipmentOrderReq['modeOfTransport'] = this.header.modeOfTransport;
        this.editShipmentOrderReq['customersCustomerAddress'] = this.header.customersCustomerAddress;
        this.editShipmentOrderReq['customersCustomerName'] = this.header.customersCustomerName;
        if (this.editShipmentOrderReq.customerMasterInfo && !this.editShipmentOrderReq.customerMasterInfo.customerIDName) {
          this.editShipmentOrderReq.customerMasterInfo = null;
        }
        if (this.editShipmentOrderReq.wareHouseTransferDestinationInfo && !this.editShipmentOrderReq.wareHouseTransferDestinationInfo.wareHouseIDName) {
          this.editShipmentOrderReq.wareHouseTransferDestinationInfo = null;
        }
        if (this.editShipmentOrderReq.supplierMasterInfo && !this.editShipmentOrderReq.supplierMasterInfo.supplierIDName) {
          this.editShipmentOrderReq.supplierMasterInfo = null;
        }
        this.editShipmentOrderReq._id = this.soID;
        this.editShipmentOrderReq.paymentStatus = this.header.paymentStatus;
        this.editShipmentOrderReq.shipmentOrderLines = [];
        this.shipmentOrder.shipmentOrderLines.forEach(element => {
          const product = Object.assign({}, new EditShipmentOrderLine(element));
          this.editShipmentOrderReq.shipmentOrderLines.push(product);
        });

        if (this.editShipmentOrderReq.customerMasterInfo) {
          delete this.editShipmentOrderReq.customerMasterInfo.organizationIDName;
          delete this.editShipmentOrderReq.customerMasterInfo.wareHouseIDName;
        }
        this.outboundProcessService.updateShipmentOrder(this.editShipmentOrderReq).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.shipmentOrder) {
              this.rerender();
              this.pageHeader = 1;
              this.itemsPerPage = 5;
              this.fetchShipmentOrderByID(this.pageHeader);
              this.pageManagement = 1;
              this.itemsPerPageManagement = 5;
              this.fetchManagementLines(1);
              this.toastr.success('Updated successfully');
            }
            else {
              if (response && response.status === 1) {
                this.toastr.error(response['statusMsg']);
              }
              else {
                this.toastr.error('Failed in updating');
              }

            }
          },
          (error) => {
            this.toastr.error('Failed in updating');
          });
      }

    }
    else {
      this.toastr.error("User doesn't have permission");
    }
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName, formName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.util.shouldShowErrors(fieldName, formName);
    }
  }
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.eSOForm.controls[fieldName].valid && this.eSOForm.controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  fetchAllShipmentTimeSlots() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.metaDataService.fetchAllShipmentTimeSlots(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentTimeSlots) {
          this.shipmentTimeSlots = response.data.shipmentTimeSlots;
        } else {
          this.shipmentTimeSlots = [];
        }
      },
      (error) => {
        this.shipmentTimeSlots = [];
      });
    this.metaDataService.getImageConfigbyName(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Shipment Order') ? true : false;
      }
    })
  }
  findAllUnits() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.metaDataService.fetchAllUnits(form).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {
      });
  }
  createEditShipmentOrderForm() {
    this.eSOForm = new FormBuilder().group({
      shipmentTimeSlot: [null],
      expectedDeliveryDate: [null],
      vehicleNumber: [''],
      productImage: [''],
      hsnCode: null,
      dispathInstruciton: [''],
      lrNumber: [''],
      invoiceType: [null],
      invoiceNumber: [null],
      serviceProviderIDName: [''],
      modeOfTransport: [''],
      paymentStatus: [null],
      quantity: [''],
      saleTaxes: null,
      netAmount: null,
      serialNumber: null,
      customerQuantity: null,
      pickedQuantity: [''],
      dispatchQuantity: ['', this.customValidators.required],
      customerPickedQuantity: [''],
      customerDispatchQuantity: ['', this.customValidators.required],
      batchNumber: null,
      mfgDate: null,
      expiryDate: null,
      inventoryUnit: [''],
      shelfLife: [''],
      shipmentUnit: [null],
      createdBy: [null],
      createdDate: [null],
      productMasterInfo: new FormBuilder().group({
        productIDName: ['']
      }),
      productCategoryInfo: new FormBuilder().group({
        productCategory: [''],
        productCategoryName: [''],
        productCategoryID: ['']
      }),
      remarks: [''],
      productConfiguration: [''],
      productDescription: null,
      storageInstruction: null,
      type: [''],
      dfsCode: [''],
      brandName: [''],
      referenceSONumber: [null],
      eta: [''],
      // lrNumber: [null],
      serviceProviderInfo: [null],
      equipmentInfo: [null],
      vehicleType: [null],
      vehicleInfo: [null],
      billOfEntryNumber: [null],
      billOfEntryDate: [null],
      billOfEntryNumberDate: [null],
      billOfLandingNumber: [null],
      billOfLandingDate: [null],
      billOfLandingNumberDate: [null],
      dispatchDate: [null],
      orderQuantity: [null],
      invoiceDate: [null],
      coPackingBillingDate: null,
      coPackingBillingStatus: null,
      coPackingDate: null,
      coPackingInfo: null,
      coPackingStatus: null,
      convertionType: null,
      courierName: null,
      customerLabelingConfirmation: null,
      discount: null,
      grossWeightLossOrGain: null,
      labelingBillingDate: null,
      labelingBillingStatus: null,
      labelingDate: null,
      labelingInfo: null,
      labelingStatus: null,
      packingBillingDate: null,
      packingBillingStatus: null,
      packingDate: null,
      packingInfo: null,
      packingStatus: null,
      rePackedQuanity: null,
      rePacking: null,
      rePackingBillingDate: null,
      rePackingBillingStatus: null,
      rePackingDate: null,
      rePackingInfo: null,
      rePackingStatus: null,
      shippingAddress: null,
      totalQuantity: null,
      unitPrice: null,
      orderUnitPrice: null,
      currency: null,
      taxAmount: null,
      grossAmount: null,
      updated: null,
      status: null,
      wayBillNumber: null,
      driverName: null,
      driverPhoneNumber: null,
      wmsoLineNumber: null,
      _id: null,
      totalCustomerDispatchQuantity: null,
      totalDispatchQuantity: null,
      taxPercentage: null,
      discountAmount: null,
      uomConversionAvailability: null
    });
  }
  getConcatDateNumber(key) {
    const formLine = this.eSOForm.value;
    if (key == 'Entry' && formLine.billOfEntryNumber && formLine.billOfEntryDate) {
      this.eSOForm.controls.billOfEntryNumberDate.setValue(formLine.billOfEntryNumber + ':' + formLine.billOfEntryDate);
    }
    if (key == 'Landing' && formLine.billOfLandingNumber && formLine.billOfLandingDate) {
      this.eSOForm.controls.billOfLandingNumberDate.setValue(formLine.billOfLandingNumber + ':' + formLine.billOfLandingDate);
    }
  }
  FetchAllServiceProviderDetails() {
    this.newVehicleArrayTyle = [];
    this.eSOForm.controls.vehicleNumber.setValue(null);
    this.wmsService.fetchAllVehicleServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.vehicleByServiceProviders) {
        const matchingserviceProvider = response.data.vehicleByServiceProviders.find(serviceprovidername =>
          serviceprovidername.serviceProviderIDName === this.eSOForm.controls.serviceProviderIDName.value);
        if (matchingserviceProvider && matchingserviceProvider.vehicleLines && matchingserviceProvider.vehicleLines.length > 0) {
          matchingserviceProvider.vehicleLines.forEach(getVehilceNumber => {
            if (getVehilceNumber.vehicleInfo) {
              this.newVehicleArrayTyle.push(getVehilceNumber.vehicleInfo.vehicleNumber);
            }
          })
        }
      }
    })
  }
  confirmShipment() {
    if (this.permissionsList.includes('Update')) {
      const form = this.formObj;
      form["_id"] = this.soID;
      this.outboundProcessService.validateBackOrder(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].isBackOrder) {
          this.checkBackOrderStatus();
        }
        else {
          this.closeShipmentOrder(false);
        }
      })
      // if (this.shipmentOrder) {
      //   const isUpdated = this.shipmentOrderLines.every(line => {
      //     return line.status === 'Completely Dispatched';
      //   });
      //   if (isUpdated) {
      //     this.checkBackOrderStatus();
      //   } else {
      //     this.toastr.error('Update all the products');
      //   }
      // } else {
      //   this.toastr.error('No Shipment order');
      // }
    }
    else {
      this.toastr.error("User doesn't have this permission");
    }
  }
  closeShipmentOrder(backOrder) {
    const closeShipmentReq = {
      _id: this.soID,
      isBackOrder: backOrder
    };
    this.outboundProcessService.closeShipmentOrderByID(closeShipmentReq, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrder) {
          this.isShipmentConfirmed = true;
          this.shipmentOrder = response.data.shipmentOrder;
          this.shipmentOrderLines = response.data.shipmentOrder.shipmentOrderLines;
          // this.rerender();
          // if (this.productUpdatedStatus()) { this.closeSO(); }
          this.closeSO();
          this.toastr.success('Shipment confirmed successfully');
        } else {
          this.toastr.error('Failed in confirming');
        }
      },
      (error) => {
        this.toastr.error('Failed in closing shipment order');
      });
  }
  closeSO() {
    if (this.shipmentOrder && this.shipmentOrder.status) {
      this.outboundProcessService.closeSalesOrder(this.soID, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data) {
            this.toastr.success('Closed sales order successfully');
            this.appService.navigate('/v1/outbound/maintainShipmentOrder');
          } else {
            this.toastr.success('Failed in closing sales order');
          }
        },
        (error) => {
          this.toastr.error('Failed in closing sales order');
        }
      );
    } else {
      this.toastr.error('Please close shipment order');
    }
  }
  printInvoice() {
    this.toastr.success('Future enhancement');
  }
  checkBackOrderStatus() {
    // let isBackOrder = false;
    // this.shipmentOrderLines.forEach(line => {
    //   // line.quantity > line.dispatchQuantity) &&
    //   if (((line.orderQuantity != line.totalDispatchQuantity) && (line.orderQuantity > line.totalDispatchQuantity)) || line.status != 'Completely Dispatched') {
    //     isBackOrder = true;
    //   }
    // });
    // if (isBackOrder) {
    this.ngxSmartModalService.getModal('backOrderPopup').open();
    const viewData = `Do you want to create back order?`;
    this.ngxSmartModalService.setModalData(viewData, 'backOrderPopup');
    // return true;
    // } else {
    //   this.closeShipmentOrder(false);
    //   return false;
    // }
  }
  confirmBackOrder(confirm) {
    this.closeShipmentOrder(confirm);
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
  productUpdatedStatus() {
    const result = this.shipmentOrderLines.every(line => {
      return line.updated === true;
    });
    return result;
  }
  generatePDF() {
    setTimeout(() => {
      window.print();
    }, 800);
  }
  openScanner(data, i) {
    this.globalProductIndex = i;
    this.barcodeInfo = { 'toggle': true };
    this.ngxSmartModalService.getModal('scannerModalForWebCam').open();
  }
  getBarcodeEvent(status) {
    if (status) {
      this.scanSuccessHandler(status);
    }
  }
  scanSuccessHandler(event) {
    if (this.globalProductIndex || (this.globalProductIndex == 0)) {
      this.isProductAvailable(event, this.updatedFShipmentOrderLines[this.globalProductIndex], this.globalProductIndex);
      this.globalProductIndex = null;
    }
  }
  isProductAvailable(event, data, i) {
    if (event && event.length == 12) {
      const filterBarcode = this.overAllBarcodeData.find(x => x.upcEANNumber == event);
      if (filterBarcode && filterBarcode.productMasterInfo.productIDName === data.productMasterInfo.productIDName && filterBarcode.unitCode == data.inventoryUnit) {
        data.customerDispatchQuantity = data.customerDispatchQuantity ? (DecimalUtils.add(data.customerDispatchQuantity, 1)) : 1;

        if (!data.productMasterInfo.productIDName || !data.customerDispatchQuantity ||
          (data.customerDispatchQuantity && DecimalUtils.lessThan(data.customerQuantity, data.customerDispatchQuantity)) ||
          (data.customerDispatchQuantity && data.totalCustomerDispatchQuantity && DecimalUtils.lessThan(
            data.customerQuantity, DecimalUtils.add(data.customerDispatchQuantity, data.totalCustomerDispatchQuantity)
          ))) {
          this.toastr.error('Shipment quantity should not greater than Picked quantity');
          data.customerDispatchQuantity = null;
        }
        else {
          this.calculateTransferQty(data, i, null, 'fromScan');
        }
      }
      else {
        this.toastr.error('No matching product');
      }
      data.forPBarcode = null;
    }
    else {
      if (data.forPBarcode.length > 12) {
        event = null;
        data.forPBarcode = null;
        this.toastr.error('Enter valid Product');
      }
    }
  }
}
