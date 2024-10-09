import { DatePipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CompleterData, CompleterService } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { BarcodeService } from 'src/app/services/barcode.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InboundProcessService } from 'src/app/services/integration-services/inboundProcess.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ApexService } from 'src/app/shared/services/apex.service';
import { AppService } from 'src/app/shared/services/app.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import { Util } from 'src/app/shared/utils/util';
import { Storage } from 'src/app/shared/utils/storage';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DecimalUtils } from 'src/app/constants/decimal';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-create-grn',
  templateUrl: './create-grn.component.html',
  styleUrls: ['./create-grn.component.scss']
})
export class CreateGRNComponent implements OnInit {

  @ViewChild("grRemote")
  public instance: ComboBoxComponent;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Goods Receiving', Storage.getSessionUser());
  receivingForm: FormGroup;
  headerForm: FormGroup;
  addValuesCheck: Boolean = true;
  arrayForTable: any = [];
  supplierIDNames: CompleterData;
  suppliers: any = [];
  shipTOAddressDropdown: any = [];
  shipFromAddressDropdown: any = [];
  billTOAddressDropdown: any = [];
  id = this.appService.getParam('id');
  goodsReceiptData: any = [];
  dummyProductIDName: any = null;
  pBySMapping: any = 'Yes';
  supplierProductsDetails: any = [];
  productIDNames: any = [];
  products: any = [];
  uomConversions: any = [];
  locReceiveAllocation = { "_id": null, "putawayLocationAllocationType": "Manual", "isActive": true };
  locReturnAllocation = { "_id": null, "putawayReturnLocationAllocationType": "Manual", "isActive": true };
  thirdPartyCustomersCheckAllocation = 'No';
  serialNumberCheck: any = 'No';
  serialNumberCheckFrmConfig: any = 'No';
  vehicles: any = [];
  equipments: any = [];
  vehicleIDs: CompleterData;
  containerIDS: CompleterData;
  grNoteInvoices: any = [];
  grnotesData: any = [];
  grnInvoiceConfirmationCheck: any = 'No';
  dummyInv: any = null;
  dummyVehicle: any = null;
  dummyContainer: any = null;
  spDummyID: any = null;
  putAwayToggle: boolean = false;
  statusCheck: boolean = false;
  bransList: any = [];
  productLogo: any;
  filteredSUpplierProd: any = null;
  showImage: boolean = false;
  onlyHeaderUpdateToggle: Boolean = true;
  shelfLife: any = null;
  uomAvailabilityCheck: any = null;
  taxData: any = [];
  taxIDs: any = [];
  conversionFactor: any = null;
  noMatchingUnitError: Boolean = false;
  receiveLocationValues: CompleterData;
  returnLocationValues: CompleterData;
  receiveLocations: any = [];
  returnLocations: any = [];
  recieveALLocations: any = [];
  returnALLocations: any = [];
  recieveShowValues: any;
  returnShowValues: any;
  isShow: boolean = true;
  units: any = [];
  hideReceive: boolean = false;
  hideReturn: boolean = false;
  globalUpdateIndex: any = -1;
  toastrMsg: any = null;
  selectAllCheckboxValue: any = null;
  selectAllAllcateCheckboxValue: any = null;
  showAllocate: boolean = true;
  grManagementLines: any = [];
  isAllocateObject: boolean = false;
  lineQuantity: any = null;
  serviceProviders: any = [];
  spIDs: CompleterData;
  sNumber: any = null;
  overGoodsReceiptLines: any = [];
  // goodsReceiptLines: any = [];
  // dummyGRNLines: any = [];
  hidePanel: boolean = false;
  overAllBarcodeData: any = [];
  pageForTable: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;

  totalItemsForManagement: any;
  pageForTableManagement: number = 1;
  itemsPerPageManagement = 5;
  searchKeyManagement: any = null;

  totalItemsForReceive: any;
  pageForTableForReceive: number = 1;
  itemsPerPageForReceive: any = 5;
  searchKeyForReceive: any = null;

  totalItemsForReturn: any;
  pageForTableForReturn: number = 1;
  itemsPerPageForReturn: any = 5;
  searchKeyForReturn: any = null;

  showTooltip: any = false;

  page = 1;
  @ViewChild('remote')
  public dropdownObj: ComboBoxComponent;
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
  existedLineDetails: any = null;
  productIDNamesForBarcodeDropdown: any = [];
  overAllarrayForTable: any = [];
  bConfig: any = null;
  productFromMaster: any = null;

  finalReceiveObj: null;
  selectedReceiveRecords: any = [];
  finalReceiveLocations: any = [];

  finalReturnObj: null;
  selectedReturnRecords: any = [];
  finalReturnLocations: any = [];
  isEditToggle: any = null;

  selectedLinesArray: any = [];
  includeExportData: any = [];
  loopToStop: any = null;
  dataPerPage: any = null;

  selectedLinesArrayForManagement: any = [];
  includeExportDataForManagement: any = [];
  loopToStopForManagement: any = null;
  dataPerPageForManagement: any = null;

  totalItemsForProductMaster: any = null;
  includeExportDataForProudcts: any = [];
  loopToStopForProduct: any = null;
  dataPerPageForProduct: any = null;
  barcodeInfo: any = null;

  constructor(private apexService: ApexService, private configService: ConfigurationService,
    private toastr: ToastrService, private bService: BarcodeService,
    private wmsService: WMSService,
    private customValidators: CustomValidators,
    public ngxSmartModalService: NgxSmartModalService,
    private completerService: CompleterService,
    private metaDataService: MetaDataService, private datePipe: DatePipe,
    private appService: AppService, private fb: FormBuilder,
    private router: Router, private util: Util, private inboundProcessService: InboundProcessService,
    private commonMasterDataService: CommonMasterDataService,
    private translate: TranslateService,) {
    this.translate.use(this.language);

  }
  ngOnInit() {

    this.toggleParagraph();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    if (!this.id) {
      this.id = sessionStorage.getItem('grnID');
    }
    this.createForm();
    this.fetchAllPDbySupplierConfigurations();
    this.fetchAllSupplierDetails();
    this.fetchAllUOMs();
    this.fetchAllSerialNumbers();
    this.fetchAllEquipments();
    this.fetchAllVehicles();
    this.fetchAllServiceProvider();
    this.grnNotes();
    this.findAllUnits();
    this.getGoodsReceiptByID();
    this.getGoodsReceiptManagementByID();
    this.fetchProductConfig();
    // this.onCreated();
    this.headerForm.controls.receiptDate.setValue(this.apexService.getDateFromMilliSec(new Date()));
    this.receivingForm.controls.grnDate.setValue(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm'));

    if (this.goodsReceiptData && this.goodsReceiptData.shipToAddress) {
      this.headerForm.controls.shipToAddress.setValue(this.goodsReceiptData.shipToAddress.name);
    }
    if (this.goodsReceiptData && this.goodsReceiptData.shipFromAddress) {
      this.headerForm.controls.shipFromAddress.setValue(this.goodsReceiptData.shipFromAddress.name);
    }
    if (this.goodsReceiptData && this.goodsReceiptData.billToAddress) {
      this.headerForm.controls.billToAddress.setValue(this.goodsReceiptData.billToAddress.name);
    }
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
        console.log(inputElement.size);
        console.log(inputElement.value.length);
      } else {
        inputElement.size = this.inputSize;
      }
    }
  }
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['goodsReceiptByIDArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.getGoodsReceiptByID(this.pageForTable)
    } else {

    }
  }

  getGoodsReceiptByID(page?) {
    if (this.id) {
      const form = {
        'organizationIDName': this.formObj.organizationIDName,
        'wareHouseIDName': this.formObj.wareHouseIDName,
        "page": page ? page : 1,
        "pageSize": this.itemsPerPage,
        "locationPage": 1,
        "locationPageSize": 5,
        "returnLocationPage": 1,
        "returnLocationPageSize": 5,
        _id: this.id,
        "grnLineStatus": "Completely Received",
        "grnLineStatusOperatorType": "ne"
      }
      this.wmsService.fetchGRNLocations(form).subscribe(
        //   console.log(res);
        // })
        // this.wmsService.fetchGoodsReceiptByID(form).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.goodsReceiptPaginationResponse.goodsReceipt) {
            this.statusCheck = response.data.goodsReceiptPaginationResponse.goodsReceipt.status != 'Open' ? true : false;
            this.totalItems = response.data.goodsReceiptPaginationResponse.totalItems;
            if (this.statusCheck) {
              this.headerForm.disable();
              this.receivingForm.disable();
            }
            if (!response.data.goodsReceiptPaginationResponse.goodsReceipt.supplierMasterInfo || (response.data.goodsReceiptPaginationResponse.goodsReceipt.supplierMasterInfo && !response.data.goodsReceiptPaginationResponse.goodsReceipt.supplierMasterInfo.supplierIDName)) {
              response.data.goodsReceiptPaginationResponse.goodsReceipt.supplierMasterInfo = {
                supplierIDName: null,
                supplierID: null,
                supplierName: null,
                supplierMasterID: null
              }
            }
            else {
              this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
                (r) => {
                  if (r && r.status === 0 && r.data.supplierMasters) {
                    this.suppliers = r.data.supplierMasters;
                    const filteredS = this.suppliers.find(sup => sup.supplierIDName === response.data.goodsReceiptPaginationResponse.goodsReceipt.supplierMasterInfo.supplierIDName);
                    this.shipFromAddressDropdown = filteredS ? filteredS.shipFromAddresses : [];
                  }
                })
            }
            if (!response.data.goodsReceiptPaginationResponse.goodsReceipt.wareHouseTransferSourceInfo) {
              response.data.goodsReceiptPaginationResponse.goodsReceipt["wareHouseTransferSourceInfo"] = {
                wareHouseTransferTransactionID: null,
                wareHouseID: null,
                wareHouseName: null,
                wareHouseIDName: null,
                "wareHouseTransferMasterID": null,
                "organizationIDName": null,
                "organizationID": null,
                "organizationName": null,
                fullWareHouseTransferTransactionID: null,
                wareHouseTransferTransactionIDPrefix: null,
              }
            }
            if (!response.data.goodsReceiptPaginationResponse.goodsReceipt.customerMasterInfo) {
              response.data.goodsReceiptPaginationResponse.goodsReceipt["customerMasterInfo"] = {
                customerID: null,
                customerIDName: null,
                customerMasterID: null,
                customerName: null
              }
            }
            this.goodsReceiptData = response.data.goodsReceiptPaginationResponse.goodsReceipt;

            this.overGoodsReceiptLines = JSON.parse(JSON.stringify(response.data.goodsReceiptPaginationResponse.goodsReceipt.goodsReceiptLines));
            let goodsReceiptLines = response.data.goodsReceiptPaginationResponse.goodsReceipt.goodsReceiptLines;
            if (!goodsReceiptLines) {
              goodsReceiptLines = [];
            }
            this.totalItems = response.data.goodsReceiptPaginationResponse.totalElements;
            // this.goodsReceiptLines = goodsReceiptLines.filter((line: any) => {
            //   return line.updated === false;
            // });
            this.arrayForTable = JSON.parse(JSON.stringify(goodsReceiptLines));
            this.fetchAllocationType();
            this.productIDNamesForBarcodeDropdown = [];
            let selectedCheckIDs = [];
            if (this.selectedLinesArray.length > 0) {
              selectedCheckIDs = this.selectedLinesArray.map(x => x._id);
            }
            if (this.arrayForTable && this.arrayForTable.length > 0) {
              this.arrayForTable.forEach(grLine => {
                grLine.saveRecentReceive = false;
                grLine.saveRecentReturn = false;
                if (grLine.receiveLocationAllocationType == 'Manual') {
                  grLine.savedReceiveLocations = grLine.receiveLocationHelpers;
                }
                else {
                  grLine.savedReceiveLocations = [];
                }
                if (grLine.returnLocationAllocationType == 'Manual') {
                  grLine.savedReturnLocations = grLine.returnLocationHelpers;
                }
                else {
                  grLine.savedReturnLocations = [];
                }
                this.productIDNamesForBarcodeDropdown.push(grLine.productMasterInfo.productIDName);

                grLine.isChecked = false;
                if (this.selectAllCheckboxValue) {
                  grLine.isChecked = true;
                }
                if (selectedCheckIDs.includes(grLine._id)) {
                  const choosedLine = this.selectedLinesArray.find(x => x._id === grLine._id);
                  grLine.isChecked = true;
                  grLine.saveRecentReceive = choosedLine.saveRecentReceive;
                  grLine.saveRecentReturn = choosedLine.saveRecentReturn;
                  grLine.savedReceiveLocations = choosedLine.savedReceiveLocations;
                  grLine.receiveLocationHelpers = choosedLine.receiveLocationHelpers;
                  grLine.receiveLocationAllocationType = choosedLine.receiveLocationAllocationType;
                  grLine.returnLocationAllocationType = choosedLine.returnLocationAllocationType;
                  grLine.savedReturnLocations = choosedLine.savedReturnLocations;
                  grLine.returnLocationHelpers = choosedLine.returnLocationHelpers;
                  grLine.hideReceive = choosedLine.hideReceive;
                  grLine.hideReturn = choosedLine.hideReturn;
                  grLine.mfgDate = choosedLine.mfgDate;
                  grLine.expiryDate = choosedLine.expiryDate;
                  grLine.grnDate = choosedLine.grnDate;
                  grLine.batchNumber = choosedLine.batchNumber;
                  grLine.serialNumbers = choosedLine.serialNumbers;
                  grLine.receivingUnit = choosedLine.receivingUnit;
                  grLine.supplierReceivedQuantity = choosedLine.supplierReceivedQuantity;
                  grLine.supplierReturnQuantity = choosedLine.supplierReturnQuantity;
                  grLine.receivedQuantity = choosedLine.receivedQuantity;
                  grLine.returnQuantity = choosedLine.returnQuantity;
                  grLine.totalReceivedQuantity = choosedLine.totalReceivedQuantity;
                  grLine.totalReturnQuantity = choosedLine.totalReturnQuantity;
                  grLine.noOfReceiveLocationsRequired = choosedLine.noOfReceiveLocationsRequired;
                  grLine.noOfReturnLocationsRequired = choosedLine.noOfReturnLocationsRequired;
                }
                // if (grLine.supplierReceivableQuantity && grLine.supplierReceivableQuantity != "0") {
                //   grLine.supplierReceivedQuantity = 0;
                //   grLine.receivedQuantity = null;
                //   grLine.supplierReturnQuantity = 0;
                //   grLine.returnQuantity = 0;
                // }
                // grLine.shippedQuantity = null;
                // grLine.supplierReceivedQuantity = 0;
                // grLine.receivedQuantity = null;
                // grLine.returnQuantity = 0;
                // grLine.supplierReturnQuantity = 0;
                grLine.supplierIDName = null;
                // grLine.uomConversionAvailability = 'Yes'; //remove
                grLine.hideReceive = false;
                grLine.hideReturn = false;
                if (grLine.supplierMasterInfo && grLine.supplierMasterInfo.supplierIDName) {
                  grLine.supplierIDName = grLine.supplierMasterInfo.supplierIDName;
                }
                this.wmsService.fetchProductDetailsById(grLine.productMasterInfo['productMasterID'], this.formObj).subscribe(
                  (response) => {
                    if (response && response.status === 0 && response.data.productMaster) {
                      grLine.serialNumberCheck = response.data.productMaster.serialNumberCheck;
                    }
                    else {
                      grLine.serialNumberCheck = null;
                    }
                  })
                if (grLine.serialNumbers && grLine.serialNumbers.length > 0) {
                  grLine.serialNumbers = grLine.serialNumbers.toString();
                }
                else {
                  grLine.serialNumbers = null;
                }
                if (grLine.grnDate) {
                  grLine.grnDate = this.datePipe.transform(new Date(grLine.grnDate), 'yyyy-MM-dd HH:mm');
                }
                else {
                  grLine.grnDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm');
                }
                if (grLine.mfgDate) {
                  grLine.mfgDate = this.apexService.getDateFromMilliSec(grLine.mfgDate);
                }
                grLine.expiryDate = grLine.expiryDate ?
                  this.apexService.getDateFromMilliSec(grLine.expiryDate) : grLine.expiryDate;
              });

            }
            this.overAllarrayForTable = this.arrayForTable;
            this.productIDNamesForBarcodeDropdown = [...new Set(this.productIDNamesForBarcodeDropdown)];
            // this.dummyGRNLines = this.goodsReceiptLines;
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
            this.headerForm.patchValue(this.goodsReceiptData);
            if (this.goodsReceiptData.bondDate) {
              this.headerForm.controls.bondDate.patchValue(this.apexService.getDateFromMilliSec(this.goodsReceiptData.bondDate))
            }
            if (this.goodsReceiptData.shipToAddress) {
              this.headerForm.controls.shipToAddress.setValue(this.goodsReceiptData.shipToAddress.name);
            }
            if (this.goodsReceiptData.shipFromAddress) {
              this.headerForm.controls.shipFromAddress.setValue(this.goodsReceiptData.shipFromAddress.name);
            }
            if (this.goodsReceiptData.billToAddress) {
              this.headerForm.controls.billToAddress.setValue(this.goodsReceiptData.billToAddress.name);
            }
            // this.findAllTaxes();
            // this.fetchAllProductsBySupplier();
            if (this.headerForm.controls.receivedType.value == 'Manual') {
              this.hidePanel = false;
              this.isAllocateObject = false;
            }
            else {
              this.hidePanel = true;
              // this.isAllocateObject = true;
            }
            if (this.goodsReceiptData.receiptType == 'WareHouseTransfer') {
              this.fetchGrnInvoiceConfiguration();
            }
            this.headerForm.controls.vehicleNumber.setValue(this.goodsReceiptData.vehicleInfo ? this.goodsReceiptData.vehicleInfo.vehicleNumber : null);
            this.headerForm.controls.receiptDate.setValue(this.goodsReceiptData.receiptDate ? this.apexService.getDateFromMilliSec(this.goodsReceiptData.receiptDate) : null);
            this.headerForm.controls.containerNumber.setValue(this.goodsReceiptData.equipmentInfo ? this.goodsReceiptData.equipmentInfo.equipmentID : null);
            this.headerForm.controls.invoiceDate.setValue(this.goodsReceiptData.invoiceDate ? this.apexService.getDateFromMilliSec(this.goodsReceiptData.invoiceDate) : null);
            this.headerForm.controls.serviceProviderID.setValue(this.goodsReceiptData.serviceProviderInfo ? this.goodsReceiptData.serviceProviderInfo.serviceProviderID : null);
            this.headerForm.controls.billOfEntryDate.setValue(this.goodsReceiptData.billOfEntryDate ? this.apexService.getDateFromMilliSec(this.goodsReceiptData.billOfEntryDate) : null);
            this.headerForm.controls.billOfLandingDate.setValue(this.goodsReceiptData.billOfLandingDate ? this.apexService.getDateFromMilliSec(this.goodsReceiptData.billOfLandingDate) : null);
            if (this.headerForm.value.supplierMasterInfo.supplierIDName) {
              this.fetchAllProductsBySupplier();
            }
            if (this.addValuesCheck) {
              this.callAllValues();
            }
          } else {
            this.goodsReceiptData = {
              supplierMasterInfo: {},
              wareHouseTransferSourceInfo: {}
            };
            this.arrayForTable = [];
            // this.goodsReceiptLines = [];
            // this.dummyGRNLines = this.goodsReceiptLines;
          }
        },
        (error) => {
          this.arrayForTable = [];
          // this.goodsReceiptLines = [];
          // this.dummyGRNLines = this.goodsReceiptLines;
        }
      );
    }
    else {
      this.isAllocateObject = false;
      this.hidePanel = false;
      this.fetchAllocationType();
    }
  }
  toggleParagraph() {
    $(document).ready(function () {
      $("#yourButtonId").click(function () {
        $("#yourParagraphId").fadeToggle("slow");
      });
    });
  }
  generatePDF() {
    setTimeout(() => {
      window.print();
    }, 800);
  }
  createForm() {
    this.headerForm = new FormBuilder().group({
      supplierMasterInfo: new FormBuilder().group({
        supplierIDName: [null, this.customValidators.required],
        supplierID: null,
        supplierName: null,
        supplierMasterID: null
      }),
      referencePONumber: null,
      receiptDate: null,
      waybillNumber: null,
      lrNumber: null,
      invoiceNumber: null,
      invoiceDate: null,
      customersSupplierAddress: null,
      customersSupplierName: null,
      receiptType: ['Purchase Order'],
      shipToAddress: null,
      billToAddress: null,
      shipFromAddress: null,
      vehicleNumber: null,
      vehicleType: null,
      containerNumber: null,
      _id: null,
      locationName: null,
      shipmentOrderMasterID: null,
      wareHouseTransferSourceInfo: new FormBuilder().group({
        wareHouseTransferTransactionID: null,
        wareHouseID: null,
        wareHouseName: null,
        wareHouseIDName: null,
        "wareHouseTransferMasterID": null,
        "organizationIDName": null,
        "organizationID": null,
        "organizationName": null,
        fullWareHouseTransferTransactionID: null,
        wareHouseTransferTransactionIDPrefix: null,
      }),
      customerMasterInfo: new FormBuilder().group({
        customerID: null,
        customerIDName: null,
        customerMasterID: null,
        customerName: null
      }),
      // customerMasterInfo: null,
      wmpoNumber: null,
      fullWmpoNumber: null,
      wmpoNumberPrefix: null,
      poID: null,
      organizationInfo: {
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      },
      wareHouseInfo: {
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      },
      "serviceProviderID": null,
      "poReferenceA": null,
      "poReferenceB": null,
      "grn": null,
      "grnDate": null,
      "grnTime": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "remarks": null,
      "status": null,
      "grnRecievingDeliveryDate": null,
      "receivedType": "Manual",
      "wareHouseTransferType": null,
      "returnOrderType": null,
      billOfEntryNumber: null,
      billOfEntryDate: null,
      billOfEntryNumberDate: null,
      billOfLandingNumber: null,
      billOfLandingDate: null,
      billOfLandingNumberDate: null,
      "totalGrossAmount": null,
      "totalNetAmount": null,
      "totalTaxAmount": null,
      "totalDiscount": null,
      "totalDiscountAmount": null,
      "totalPurchaseTaxes": null,
      "totalTaxPercentage": null,
      bondDate: null,
      bondNumber: null
    });
    this.receivingForm = new FormBuilder().group({
      productMasterInfo: new FormBuilder().group({
        productIDName: [null, this.customValidators.required],
        productID: null,
        productName: null,
        productMasterID: null,
      }),
      brandName: null,
      productDescription: null,
      storageInstruction: null,
      receiveLocationHelpers: [[]],
      returnLocationHelpers: [[]],
      returnQuantity: [0],
      shippedQuantity: [null, this.customValidators.required],
      grnDate: null,
      mfgDate: null,
      expiryDate: null,
      wayBillNumber: null,
      lrNumber: null,
      batchNumber: null,
      serialNumbers: [],
      receivingUnit: null,
      supplierReceivedQuantity: null,
      referenceInvoiceNumber: null,
      invoiceNumber: null,
      inventoryUnit: null,
      receivableQuantity: null,
      supplierReceivableQuantity: null,
      returnLocationHelperPaginationResponse: null,
      receiveLocationHelperPaginationResponse: null,
      receivedQuantity: null,
      receivingInstruction: null,
      orderedQuantity: [null, this.customValidators.required],
      noOfReturnLocationsRequired: [0],
      noOfReceiveLocationsRequired: [0],
      totalReceivedQuantity: null,
      totalSupplierReceivedQuantity: null,
      totalReturnQuantity: null,
      totalSupplierReturnQuantity: null,
      receiveLocationAllocationType: "Manual",
      returnLocationAllocationType: "Manual",
      sequenceNumber: null,
      _id: null,
      invoiceDate: null,
      billOfEntryNumber: null,
      billOfEntryDate: null,
      billOfEntryNumberDate: null,
      billOfLandingNumber: null,
      billOfLandingDate: null,
      billOfLandingNumberDate: null,
      vehicleNumber: null,
      productImage: null,
      hsnCode: null,
      vehicleType: null,
      containerNumber: null,
      sealNumber: null,
      transport: null,
      createdBy: null,
      createdDate: null,
      "poLineNumber": null,
      "productCategoryInfo": null,
      "productType": null,
      "productClass": null,
      "carrierName": null,
      "receiptDate": null,
      "alphaNumeric": null,
      "quantity": null,
      "acceptedQuantity": null,
      "unitPrice": null,
      "orderUnitPrice": null,
      "discount": null,
      "currency": null,
      "netAmount": null,
      "volume": null,
      "totalVolume": null,
      "totalAmount": null,
      // "createdDate": null,
      "lastUpdatedDate": null,
      "eta": null,
      "remarks": null,
      "status": null,
      "avgCostPrice": null,
      "supplierReturnQuantity": null,
      "returnPalletConsideration": null,
      "updated": null,
      "returnLocationsFound": null,
      "receiveLocationsFound": null,
      "locationFound": null,
      "taxAmount": null,
      "purchaseTaxes": null,
      "grossAmount": null,
      supplierMasterInfo: null,
      supplierIDName: null,
      discountAmount: null,
      taxPercentage: null,
      shipmentOrderLineID: null,
      uomConversionAvailability: null,
      bondDate: null,
      bondNumber: null
    })
  }
  fetchAllServiceProvider() {
    this.wmsService.fetchAllServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.serviceProviders) {
        this.serviceProviders = response.data.serviceProviders;
        this.spIDs = response.data.serviceProviders.map(x => x.serviceProviderID);
      } else {
        this.serviceProviders = [];
      }
    }, error => {
      this.serviceProviders = [];
    });
  }
  checkingaddValuesCheck(event) {
    if (event) {
      this.callAllValues();
    }
    else {
      this.receivingForm.controls.wayBillNumber.setValue(null);
      this.receivingForm.controls.lrNumber.setValue(null);
      this.receivingForm.controls.invoiceNumber.setValue(null);
      this.receivingForm.controls.invoiceDate.setValue(null);
      this.receivingForm.controls.vehicleNumber.setValue(null);
      this.receivingForm.controls.containerNumber.setValue(null);
      this.receivingForm.controls.vehicleType.setValue(null);
      this.receivingForm.controls.billOfEntryDate.setValue(null);
      this.receivingForm.controls.billOfLandingDate.setValue(null);
      this.receivingForm.controls.billOfLandingNumber.setValue(null);
      this.receivingForm.controls.billOfEntryNumber.setValue(null);
      this.receivingForm.controls.billOfLandingNumberDate.setValue(null);
      this.receivingForm.controls.billOfEntryNumberDate.setValue(null);
      this.receivingForm.controls.transport.setValue(null);
      if (this.arrayForTable.length) {
        this.arrayForTable.forEach(element => {
          element['wayBillNumber'] = null;
          element['lrNumber'] = null;
          element['invoiceNumber'] = null;
          element['invoiceDate'] = null;
          element['vehicleNumber'] = null;
          element['containerNumber'] = null;
          element['vehicleType'] = null;
          element['billOfEntryDate'] = null;
          element['billOfLandingDate'] = null;
          element['billOfLandingNumber'] = null;
          element['billOfEntryNumber'] = null;
          element['billOfLandingNumberDate'] = null;
          element['billOfEntryNumberDate'] = null;
          element['transport'] = null;
        });
      }
    }
  }
  callAllValues() {
    this.addLine('waybillNumber', 'wayBillNumber');
    this.addLine('lrNumber', 'lrNumber');
    this.addLine('invoiceNumber', 'invoiceNumber');
    this.addLine('invoiceDate', 'invoiceDate');
    this.addLine('vehicleNumber', 'vehicleNumber');
    this.addLine('vehicleType', 'vehicleType');
    this.addLine('containerNumber', 'containerNumber');
    this.addLine('billOfEntryNumber', 'billOfEntryNumber');
    this.addLine('billOfEntryDate', 'billOfEntryDate');
    this.addLine('billOfEntryNumberDate', 'billOfEntryNumberDate');
    this.addLine('billOfLandingNumber', 'billOfLandingNumber');
    this.addLine('billOfLandingDate', 'billOfLandingDate');
    this.addLine('billOfLandingNumberDate', 'billOfLandingNumberDate');
    this.addLine('serviceProviderID', 'transport');
    this.addLine('bondDate', 'bondDate');
    this.addLine('bondNumber', 'bondNumber');
  }
  addLine(headForm, lineForm) {
    if (this.addValuesCheck) {
      this.receivingForm.controls[lineForm].setValue(this.headerForm.controls[headForm].value);
      if (this.arrayForTable.length) {
        this.arrayForTable.forEach(element => {
          element[lineForm] = this.headerForm.controls[headForm].value;
        });
      }
    }
  }
  findAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {

      });
  }
  onSupplierIDNameChange(event) {
    if (event && this.headerForm.value.supplierMasterInfo.supplierIDName) {
      const filteredSupplier = this.suppliers.find(sup => sup.supplierIDName === this.headerForm.value.supplierMasterInfo.supplierIDName);
      if (filteredSupplier) {
        this.headerForm.patchValue({
          supplierMasterInfo:
          {
            supplierID: filteredSupplier.supplierID, supplierName: filteredSupplier.supplierName,
            supplierMasterID: filteredSupplier._id
          },
          locationName: filteredSupplier.city
        });
        this.headerForm.controls.organizationInfo.patchValue(filteredSupplier.organizationInfo);
        this.headerForm.controls.wareHouseInfo.patchValue(filteredSupplier.wareHouseInfo);
        this.shipFromAddressDropdown = filteredSupplier.shipFromAddresses;
        if (this.id && this.goodsReceiptData && this.goodsReceiptData.shipFromAddress) {
          this.headerForm.controls.shipFromAddress.setValue(this.goodsReceiptData.shipFromAddress.name);
        }
        else {
          if (!this.id && filteredSupplier) {
            this.headerForm.controls.shipFromAddress.patchValue(filteredSupplier.shipFromAddresses.find(x => x.defaultAddress).name);
          }
        }
        this.fetchAllProductsBySupplier();
      }
    }
    else {
      const shipTo = this.headerForm.value;
      this.headerForm.reset();
      this.headerForm.controls.shipToAddress.patchValue(shipTo.shipToAddress);
      this.headerForm.controls.billToAddress.patchValue(shipTo.billToAddress);
      this.headerForm.controls.receiptType.setValue('Purchase Order');
      this.headerForm.controls.receivedType.setValue('Manual');
      this.headerForm.controls.receiptDate.setValue(this.apexService.getDateFromMilliSec(new Date()));
      this.receivingForm.reset();
      this.receivingForm.controls.grnDate.setValue(
        this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm'));
      this.dummyProductIDName = null;
      this.bConfig = null;
    }
  }
  fetchAllProductsBySupplier() {
    if (this.pBySMapping == 'Yes') {
      this.wmsService.fetchProductsBySupplier(this.headerForm.value.supplierMasterInfo.supplierIDName, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productBySupplier &&
            response.data.productBySupplier.productMasterInfos) {
            this.supplierProductsDetails = response.data.productBySupplier;
            this.productIDNames = response.data.productBySupplier.productMasterInfos.map(x => x.productIDName);
          } else {
            const products1: any = [];
            this.productIDNames = products1;
          }
        },
        (error) => {
          const products1: any = [];
          this.productIDNames = products1;
        });
    }
    else {
    }
  }
  fetchAllPDbySupplierConfigurations() {
    this.metaDataService.findAllSupplierConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.productBySupplierMappingConfigurations && res.data.productBySupplierMappingConfigurations.length > 0) {
        this.pBySMapping = res.data.productBySupplierMappingConfigurations[0].mapping;
        if (this.pBySMapping == 'No') {
          this.fetchAllProducts(1, 10, null);
        }
      }
      else {
        this.fetchAllProducts(1, 10, null);
      }
    })
  }
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
          this.supplierIDNames = this.completerService.local(response.data.supplierMasters, 'supplierIDName', 'supplierIDName');
        }
        else {
          this.suppliers = [];
          this.completerService.local(this.suppliers, 'supplierIDName', 'supplierIDName');
        }
      },
      (error) => {
        this.suppliers = [];
        this.completerService.local(this.suppliers, 'supplierIDName', 'supplierIDName');
      });
    this.shipTOAddressDropdown = [];
    this.billTOAddressDropdown = [];
    this.wmsService.fetchAllWarehouses(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          if (response.data.wareHouses && response.data.wareHouses.length > 0) {
            this.shipTOAddressDropdown = response.data.wareHouses[0].shipToAddresses;
            if (this.id && this.goodsReceiptData && this.goodsReceiptData.shipToAddress) {
              this.headerForm.controls.shipToAddress.setValue(this.goodsReceiptData.shipToAddress.name);
            }
            else {
              if (!this.id) {
                this.headerForm.controls.shipToAddress.patchValue(response.data.wareHouses[0].shipToAddresses.find(x => x.defaultAddress).name);
              }
            }
            this.billTOAddressDropdown = response.data.wareHouses[0].billToAddresses;
            if (this.id && this.goodsReceiptData && this.goodsReceiptData.billToAddress) {
              this.headerForm.controls.billToAddress.setValue(this.goodsReceiptData.billToAddress.name);
            }
            else {
              if (!this.id) {
                this.headerForm.controls.billToAddress.patchValue(response.data.wareHouses[0].billToAddresses.find(x => x.defaultAddress).name);
              }
            }
          }
        } else {
          this.headerForm.controls.shipToAddress.patchValue(null);
          this.headerForm.controls.billToAddress.patchValue(null);
        }
      },
      (error) => {
        this.headerForm.controls.shipToAddress.patchValue(null);
        this.headerForm.controls.billToAddress.patchValue(null);
      });
  }
  fetchMasterProducts(index?) {
    if (!index) {
      this.includeExportDataForProudcts = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStopForProduct) {
      this.products = this.includeExportDataForProudcts;
      this.includeExportDataForProudcts = this.products.map((v, i) => ({ text: v.productIDName, id: i }));
    }
    else {
      if (((i == 1) || (i != 1 && this.includeExportDataForProudcts.length > 0)) && i <= this.loopToStopForProduct) {
        const form = {
          "page": i,
          "pageSize": parseInt(this.dataPerPageForProduct),
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName,
        }
        this.wmsService.fetchAllProductsWithPaginations(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.productMasterPaginationResponse.productMasters) {
              this.includeExportDataForProudcts = [...this.includeExportDataForProudcts, ...response.data.productMasterPaginationResponse.productMasters];
              this.fetchMasterProducts(i);
            }
          })
      }
    }
  }

  fetchAllProducts(page, size, searchKey) {
    // this.wmsService.fetchAllProducts(this.formObj).subscribe(
    //   (response) => {
    //     if (response && response.status === 0 && response.data.productMasters) {
    //       this.products = response.data.productMasters;
    //       this.productIDNames = this.products.map(x => x.productIDName);
    //     } else {
    //       this.products = [];
    //     }
    //   },
    //   (error) => {
    //     this.products = [];
    //   });
    const form = {
      "page": page,
      "pageSize": size,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "searchOnKeys": ['productIDName'],
      "searchKeyword": searchKey ? (searchKey == "" ? null : searchKey) : null
    }
    this.wmsService.fetchAllProductsWithPaginations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasterPaginationResponse.productMasters) {
          this.products = [...this.products, ...response.data.productMasterPaginationResponse.productMasters];
          this.paginationStop = response.data.productMasterPaginationResponse.productMasters.length == 0 ? true : false;
          const arr = response.data.productMasterPaginationResponse.productMasters;
          if (searchKey) {
            this.dummyProductIDName = searchKey;
            this.productIDNames = arr.map((v, i) => ({ text: v.productIDName, id: i }));
          }
          else {
            if (!this.paginationStop) {
              if (this.productIDNames.length > 0) {
                let index = this.productIDNames.length;
                arr.forEach((v, i) => {
                  i = index;
                  if (!this.productIDNames.find(x => x.text == v.productIDName)) {
                    this.productIDNames.push({ text: v.productIDName, id: i });
                    index += 1;
                  }
                });
              }
              else {
                this.productIDNames = arr.map((v, i) => ({ text: v.productIDName, id: i }));
              }
            }
          }
          this.totalItemsForProductMaster = response.data.productMasterPaginationResponse.totalElements;
          const lengthofTotalItems = this.totalItemsForProductMaster.toString().length;
          const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          count.forEach(el => {
            if (lengthofTotalItems == el) {
              let value: any = 1 + this.configService.addZerosMethod(el);
              this.dataPerPageForProduct = parseInt(value);
            }
          });
          const n: any = (this.totalItemsForProductMaster / this.dataPerPageForProduct).toString()
          let m = n.split('.')
          if (m[1]) {
            this.loopToStopForProduct = parseInt(m[0]) + 1
          } else {
            this.loopToStopForProduct = parseInt(m[0])
          }
          this.fetchMasterProducts();

        }
        else {
          this.productIDNames = [];
        }
      })
  }
  fetchAllUOMs() {
    this.commonMasterDataService.fetchAllUOMConversion(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.uoms) {
          this.uomConversions = response.data.uoms;
        }
      },
      (error) => {
      });
  }
  fetchAllocationType() {
    this.metaDataService.getReceiveLocationAllocationType(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.putawayLocationAllocationConfigurations && res.data.putawayLocationAllocationConfigurations.length > 0) {
        this.locReceiveAllocation = res.data.putawayLocationAllocationConfigurations[0];
        this.receivingForm.controls.receiveLocationAllocationType.setValue(this.locReceiveAllocation.putawayLocationAllocationType)
        if (this.arrayForTable.length > 0) {
          this.arrayForTable.forEach(element => {
            if (!element.receiveLocationAllocationType) {
              element.receiveLocationAllocationType = this.locReceiveAllocation.putawayLocationAllocationType;
            }
          });
        }
      }
      else {
        this.locReceiveAllocation = { "_id": null, "putawayLocationAllocationType": "Manual", "isActive": true };
        this.receivingForm.controls.receiveLocationAllocationType.
          setValue(this.locReceiveAllocation.putawayLocationAllocationType);
        if (this.arrayForTable.length > 0) {
          this.arrayForTable.forEach(element => {
            element.receiveLocationAllocationType = "Manual";
          });
        }
      }
    })
    this.metaDataService.getReturnLocationAllocationType(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.putawayReturnLocationAllocationConfigurations && res.data.putawayReturnLocationAllocationConfigurations.length > 0) {
        this.locReturnAllocation = res.data.putawayReturnLocationAllocationConfigurations[0];
        this.receivingForm.controls.returnLocationAllocationType.setValue(this.locReturnAllocation.putawayReturnLocationAllocationType)
        if (this.arrayForTable.length > 0) {
          this.arrayForTable.forEach(element => {
            if (!element.returnLocationAllocationType) {
              element.returnLocationAllocationType = this.locReturnAllocation.putawayReturnLocationAllocationType;
            }
          });
        }
      }
      else {
        this.locReturnAllocation = { "_id": null, "putawayReturnLocationAllocationType": "Manual", "isActive": true };
        this.receivingForm.controls.returnLocationAllocationType.setValue(this.locReturnAllocation.putawayReturnLocationAllocationType)
        if (this.arrayForTable.length > 0) {
          this.arrayForTable.forEach(element => {
            element.returnLocationAllocationType = "Manual";
          });
        }
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
  fetchAllSerialNumbers() {
    this.metaDataService.getAllSerialNumberConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberCheckFrmConfig = res.data.serialNumberConfigurations[0].serialNumberCheck;
      }
      else {
        this.serialNumberCheckFrmConfig = "No";
      }
    })
  }
  fetchAllVehicles() {
    this.commonMasterDataService.fetchAllVehicles(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.vehicleMasters) {
          this.vehicles = response.data.vehicleMasters;
          this.vehicleIDs = response.data.vehicleMasters.map(x => x.vehicleNumber);
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
        if (response && response.status === 0 && response.data.equipmentMaster) {
          this.equipments = response.data.equipmentMaster;
          this.containerIDS = response.data.equipmentMaster.map(x => x.equipmentID);
        } else {
          this.equipments = [];
        }
      },
      (error) => {
        this.equipments = [];
      });
  }
  grnNotes() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    form['noteType'] = 'Inward Shipment';
    form['page'] = 1;
    form['pageSize'] = 10;
    this.commonMasterDataService.fetchAllGRNote(form).subscribe(res => {
      if (res['status'] == 0 && res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes']) {
        // this.grnotesData = res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes'].filter(x => !x.wmpoNumber);
        // this.grNoteInvoices = this.grnotesData.map(x => x.invoiceNumber);
        this.grnotesData = res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes.filter(x => !x.wmpoNumber);
        const arr = res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes.filter(x => !x.wmpoNumber);
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
  fetchGrnInvoiceConfiguration() {
    this.metaDataService.getAllGrnInvoiceConfiguration(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.grnInvoiceConfigurations && res.data.grnInvoiceConfigurations.length > 0) {
        this.grnInvoiceConfirmationCheck = res.data.grnInvoiceConfigurations[0].grnInvoiceConfirmation;
      }
    })
  }
  setInvoiceTo(event) {
    if (event) {
      if (event != 'yes' && event.itemData) {
        this.headerForm.controls.invoiceNumber.setValue(event.itemData ? event.itemData.text : null);
        this.dummyInv = null;
      }
      this.grnotesById();
    }
  }
  grnotesById() {
    const noteDetails = this.grnotesData.find(x => x.invoiceNumber == this.headerForm.controls.invoiceNumber.value);
    this.dummyInv = null;
    if (noteDetails) {
      this.headerForm.controls.invoiceDate.setValue(noteDetails.invoiceDate ? this.apexService.getDateFromMilliSec(noteDetails.invoiceDate) : null)
      this.headerForm.controls.vehicleNumber.setValue(noteDetails.vehicleInfo ? noteDetails.vehicleInfo.vehicleNumber : null);
      this.headerForm.controls.waybillNumber.setValue(noteDetails.waybillNumber);
      this.headerForm.controls.lrNumber.setValue(noteDetails.lrNumber);
      this.headerForm.controls.vehicleType.setValue(noteDetails.vehicleType);
      this.headerForm.controls.containerNumber.setValue(noteDetails.equipmentInfo ? noteDetails.equipmentInfo.equipmentID : null);
      this.headerForm.controls.serviceProviderID.setValue(noteDetails.serviceProviderInfo ? noteDetails.serviceProviderInfo.serviceProviderID : null);
      this.headerForm.controls.billOfEntryDate.setValue(noteDetails.billOfEntryDate ? this.apexService.getDateFromMilliSec(noteDetails.billOfEntryDate) : null)
      this.headerForm.controls.billOfLandingDate.setValue(noteDetails.billOfLandingDate ? this.apexService.getDateFromMilliSec(noteDetails.billOfLandingDate) : null)
      this.headerForm.controls.billOfLandingNumber.setValue(noteDetails.billOfLandingNumber);
      this.headerForm.controls.billOfEntryNumber.setValue(noteDetails.billOfEntryNumber);
      this.headerForm.controls.billOfLandingNumberDate.setValue(noteDetails.billOfLandingNumberDate);
      this.headerForm.controls.billOfEntryNumberDate.setValue(noteDetails.billOfEntryNumberDate);
      this.callAllValues();
    }
    else {
      this.headerForm.controls.invoiceDate.setValue(null);
      this.headerForm.controls.vehicleNumber.setValue(null);
      this.headerForm.controls.waybillNumber.setValue(null);
      this.headerForm.controls.lrNumber.setValue(null);
      this.headerForm.controls.vehicleType.setValue(null);
      this.headerForm.controls.containerNumber.setValue(null);
      this.headerForm.controls.billOfEntryDate.setValue(null);
      this.headerForm.controls.billOfLandingDate.setValue(null);
      this.headerForm.controls.billOfLandingNumber.setValue(null);
      this.headerForm.controls.billOfEntryNumber.setValue(null);
      this.headerForm.controls.billOfLandingNumberDate.setValue(null);
      this.headerForm.controls.billOfEntryNumberDate.setValue(null);
      this.headerForm.controls.serviceProviderID.setValue(null);
      this.callAllValues();
    }
  }
  setSearchValueToText(event, keyName) {
    if (event) {
      this.headerForm.controls[keyName].setValue(event.originalObject);
      this.dummyVehicle = null;
      this.dummyContainer = null;
      this.spDummyID = null;
      if (keyName == 'vehicleNumber') {
        const fined = this.vehicles.find(x => x.vehicleNumber == event.originalObject);
        this.headerForm.controls.vehicleType.setValue(fined.vehicleType);
        this.addLine('vehicleType', 'vehicleType');
      }
      (keyName == 'serviceProviderID') ? this.addLine('serviceProviderID', 'transport') : this.addLine(keyName, keyName);
    }
  }
  setVehicleType() {
    const fined = this.vehicles.find(x => x.vehicleNumber == this.headerForm.controls.vehicleNumber.value);
    if (fined) {
      this.headerForm.controls.vehicleType.setValue(fined.vehicleType);
      this.addLine('vehicleType', 'vehicleType');
    }
    else {
      this.headerForm.controls.vehicleType.setValue(null);
      this.receivingForm.controls.vehicleType.setValue(null);
    }
  }
  getConcatDateNumber(key, form) {
    const formLine = this[form].value;
    if (key === 'Entry') {
      this.addLine('billOfEntryNumber', 'billOfEntryNumber');
      this.addLine('billOfEntryDate', 'billOfEntryDate');
    }
    if (key == 'Entry' && formLine.billOfEntryNumber && formLine.billOfEntryDate) {
      this[form].controls.billOfEntryNumberDate.setValue(formLine.billOfEntryNumber + ':' + formLine.billOfEntryDate);
      this.addLine('billOfEntryNumberDate', 'billOfEntryNumberDate');
    }
    if (key == 'Landing') {
      this.addLine('billOfLandingNumber', 'billOfLandingNumber');
      this.addLine('billOfLandingDate', 'billOfLandingDate');
    }
    if (key == 'Landing' && formLine.billOfLandingNumber && formLine.billOfLandingDate) {
      this[form].controls.billOfLandingNumberDate.setValue(formLine.billOfLandingNumber + ':' + formLine.billOfLandingDate);
      this.addLine('billOfLandingNumberDate', 'billOfLandingNumberDate');
    }
  }
  setSupplierName(event, i) {
    if (event) {
      this.arrayForTable[i].supplierMasterInfo = this.onSupplierIDNameChangeOnLine(event.originalObject);
    }
    else {
      this.arrayForTable[i].supplierMasterInfo = null;
    }
  }
  onProductIDNameChange(fromScan?) {
    this.bransList = [];
    this.selectedReceiveRecords = [];
    this.selectedReturnRecords = [];
    this.finalReceiveLocations = [];
    this.finalReturnLocations = [];
    this.productLogo = null;
    this.productFromMaster = null;
    this.filteredSUpplierProd = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    const productIDName = this.receivingForm.value.productMasterInfo.productIDName;
    let ID = null;
    const filterDetails = this.products.find(prod => prod.productIDName === productIDName);
    if (filterDetails) {
      ID = filterDetails._id;
    }
    else {
      const fbyS = this.supplierProductsDetails.productMasterInfos.find(x => x.productIDName == productIDName);
      ID = fbyS ? fbyS.productMasterID : null;
    }
    let filteredProd = null;
    this.wmsService.fetchProductDetailsById(ID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMaster) {
          filteredProd = response.data.productMaster;
          this.productFromMaster = response.data.productMaster;
          if (this.pBySMapping == 'Yes') {
            this.filteredSUpplierProd = this.supplierProductsDetails.productMasterInfos.find(x => x.productIDName == productIDName);
          }
          else {
            this.filteredSUpplierProd = filteredProd;
          }
          if (this.filteredSUpplierProd) {
            if (this.filteredSUpplierProd.brandNames && this.filteredSUpplierProd.brandNames.length > 0) {
              this.bransList = this.filteredSUpplierProd.brandNames
            }
            this.onlyHeaderUpdateToggle = false;

            if (filteredProd) {
              this.shelfLife = filteredProd.shelfLife;
              this.uomAvailabilityCheck = filteredProd.uomConversionAvailability;
              this.serialNumberCheck = filteredProd.serialNumberCheck ? filteredProd.serialNumberCheck : 'No';
              if (filteredProd.productImage && this.showImage) {
                const fileNames = JSON.parse(JSON.stringify(filteredProd.productImage));
                this.metaDataService.viewImages(fileNames).subscribe(data => {
                  if (data['status'] == 0) {
                    this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
                    this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
                    this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
                  }
                });
              }
              this.receivingForm.patchValue({
                productMasterInfo: {
                  productID: filteredProd.productID,
                  productName: filteredProd.productName,
                  "productMasterID": filteredProd._id
                },
                productClass: filteredProd.productClass,
                productType: filteredProd.productType,
                productCategory: filteredProd.productCategoryInfo,
                receivingUnit: this.filteredSUpplierProd.receivingUnit,
                inventoryUnit: filteredProd.inventoryUnit,
                productImage: filteredProd.productImage,
                hsnCode: filteredProd.hsnCode,
                receivingInstruction: filteredProd.receivingInstruction,
                unitPrice: (this.pBySMapping != 'Yes') ? this.filteredSUpplierProd.purchasePrice : this.filteredSUpplierProd.price,
                currency: this.filteredSUpplierProd.currency,
                productDescription: this.filteredSUpplierProd.productDescription,
                storageInstruction: filteredProd.storageInstruction,
              });
              if (this.existedLineDetails) {
                this.receivingForm.controls.unitPrice.setValue(this.existedLineDetails.unitPrice);
                this.receivingForm.controls.receivingUnit.setValue(this.existedLineDetails.receivingUnit);
              }
              if (!this.existedLineDetails && this.bConfig) {
                this.receivingForm.controls.receivingUnit.setValue(this.bConfig.unitCode);
              }
            }
            else {
              this.shelfLife = null;
              this.uomAvailabilityCheck = null;
              this.serialNumberCheck = 'No';
              if (this.pBySMapping == 'Yes') {
                this.toastr.error('No Matching Product');
              }
            }
            if (productIDName) {
              const req = this.headerForm.value;
              if (typeof (req.shipToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
                req.shipToAddress = this.setJsonto(req.shipToAddress)
              }
              else {
                if (typeof (req.shipToAddress) != 'object') {
                  req.shipToAddress = this.goodsReceiptData ? this.goodsReceiptData.shipToAddress : null;
                }
              }
              if (typeof (req.shipFromAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
                req.shipFromAddress = this.setJsonFrom(req.shipFromAddress)
              }
              else {
                if (typeof (req.shipFromAddress) != 'object') {
                  req.shipFromAddress = this.goodsReceiptData ? this.goodsReceiptData.shipFromAddress : null;
                }
              }
              if (typeof (req.billToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
                req.billToAddress = this.setBillTo(req.billToAddress)
              }
              else {
                if (typeof (req.billToAddress) != 'object') {
                  req.billToAddress = this.goodsReceiptData ? this.goodsReceiptData.billToAddress : null;
                }
              }
              req.goodsReceiptLines = [this.receivingForm.getRawValue()];
              this.getDataForFilters(req);
              const payload = {
                "organizationIDName": this.configService.getGlobalpayload().organizationIDName,
                "wareHouseIDName": this.configService.getGlobalpayload().wareHouseIDName,
                "taxName": null,
                "hsnCode": filteredProd.hsnCode,
                "countryName": this.headerForm.value.shipFromAddress ? this.headerForm.value.shipFromAddress.country : null,
                "stateName": this.headerForm.value.shipFromAddress ? this.headerForm.value.shipFromAddress.state : null,
                "supplierIDName": this.headerForm.value.supplierMasterInfo.supplierIDName,
                "customerIDName": null,
                "type": "PurchaseTax",
                "productIDName": filteredProd.productIDName
              }
              this.wmsService.fetchTaxesforOrder(payload).subscribe(res => {
                if (res['status'] == 0 && res['data'].taxMasters && res['data'].taxMasters.length > 0) {
                  this.taxData = res['data'].taxMasters;
                  this.taxIDs = this.taxData.map(x => x.taxNamePercentage);
                  this.receivingForm.controls.purchaseTaxes.setValue(res['data'].taxMasters.map(x => x.taxNamePercentage));
                  this.calculateReceivedQty(null, fromScan);
                }
                else {
                  this.receivingForm.controls.purchaseTaxes.setValue(null);
                  this.taxData = [];
                  this.taxIDs = this.taxData;
                  this.calculateReceivedQty(null, fromScan);
                }
              })
            }
          }
          else {
            this.toastr.error('No Matching Product');
            this.receivingForm.controls.productMasterInfo['controls'].productIDName.patchValue(null);
            this.receivingForm.controls.receivingUnit.patchValue(null);
          }
        }
        else {
          this.toastr.error('No Matching Product');
        }

      })
  }
  setJsonto(event) {
    return this.shipTOAddressDropdown.find(x => x.name == event);
  }
  setJsonFrom(event) {
    return this.shipFromAddressDropdown.find(x => x.name == event);
  }
  setBillTo(event) {
    return this.billTOAddressDropdown.find(x => x.name == event);
  }
  calculateReceivedQty(key?, fromScan?) {
    if (fromScan) {
      this.receivingForm.controls.supplierReceivedQuantity.setValue(1);
    }
    if (fromScan && this.existedLineDetails) {
      this.receivingForm.controls.supplierReceivedQuantity.setValue(DecimalUtils.add(this.existedLineDetails.supplierReceivedQuantity, 1));
    }
    this.conversionFactor = null;
    const filteredProduct = this.productFromMaster;
    if (filteredProduct && filteredProduct.inventoryUnit && this.receivingForm.value.receivingUnit) {
      if (filteredProduct.inventoryUnit == this.receivingForm.value.receivingUnit) {
        this.conversionFactor = DecimalUtils.valueOf(1);
      }
      else {
        const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === this.receivingForm.value.receivingUnit &&
          uom.unitConversionTo === filteredProduct.inventoryUnit && uom.productMasterInfo.productIDName === filteredProduct.productIDName);
        this.conversionFactor = filteredUOMConversion.conversionFactor;
      }
      if (this.conversionFactor) {
        this.priceMethodContinution(key, this.conversionFactor, filteredProduct, fromScan);
        this.noMatchingUnitError = false;
      } else {
        if (this.uomAvailabilityCheck == 'Yes') {
          this.toastr.error('No matching Unit Conversion Factor');
        }
        this.noMatchingUnitError = true;
        this.receivingForm.controls.receivedQuantity.setValue(null);
        this.receivingForm.controls.grossAmount.setValue(null);
        this.receivingForm.controls.taxAmount.setValue(null);
        this.receivingForm.controls.netAmount.setValue(null);
      }
      if (key) {
        if (this.locReturnAllocation.putawayReturnLocationAllocationType == 'Manual') {
          this.resetRecieveLocations('Return');
          this.returnShowValues = null;
          // this.finalReturnObj = null;
          this.selectedReturnRecords = [];
          this.finalReturnLocations = [];
        }
      }
      else {
        if (this.locReceiveAllocation.putawayLocationAllocationType == 'Manual') {
          this.resetRecieveLocations('Receive');
          this.recieveShowValues = null;
          // this.finalReceiveObj = null;
          this.selectedReceiveRecords = [];
          this.finalReceiveLocations = [];

        }
      }
      this.recieveShowValues = null;
      this.receivableQuantityCal();
    }
  }
  receivableQuantityCal(table?, i?) {
    const req = this.headerForm.value;
    if (req.receivedType && req.receivedType == 'Manual') {
      if (table) {
        this.arrayForTable[i].orderedQuantity = DecimalUtils.add(this.arrayForTable[i].supplierReceivedQuantity, this.arrayForTable[i].supplierReturnQuantity)
        this.arrayForTable[i].shippedQuantity = this.arrayForTable[i].orderedQuantity;
      }
      else {
        this.receivingForm.controls.orderedQuantity.setValue(DecimalUtils.add(this.receivingForm.value.supplierReceivedQuantity, this.receivingForm.value.supplierReturnQuantity));
        this.receivingForm.controls.shippedQuantity.setValue(this.receivingForm.value.orderedQuantity);
      }
    }
  }
  selectAllData1(event) {
    this.selectedLinesArrayForManagement = [];
    if (event.target.checked) {
      this.grManagementLines.forEach(element => {
        if (element.locationFound == false) {
          element.isChecked = true;
        }
      });
    }
    else {
      this.grManagementLines.forEach(element => {
        element.isChecked = false;
      });
    }
    this.showAllocate = false;
    this.isAllocateObject = true;
    if (this.includeExportDataForManagement.length == 0 && event.target.checked) {
      this.getAllManagementLists();
    }
    else if (this.includeExportDataForManagement.length && event.target.checked) {
      this.selectedLinesArrayForManagement = this.includeExportDataForManagement;
    }
  }
  selectAllData(event) {
    this.selectedLinesArray = [];
    this.onlyHeaderUpdateToggle = false;
    if (event.target.checked) {
      this.arrayForTable.forEach(element => {
        if (element.orderedQuantity != 0 || element.orderedQuantity != "0") {
          element.isChecked = true;
        }
      });
    }
    else {
      this.arrayForTable.forEach(element => {
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

  getAllManagementLists(index?) {
    if (!index) {
      this.includeExportDataForManagement = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStopForManagement) {
      console.log(this.includeExportDataForManagement);
      if (this.selectAllAllcateCheckboxValue) {
        this.includeExportDataForManagement.forEach(element => {
          element.isChecked = false;
          element.saveRecentReceive = false;
          element.saveRecentReturn = false;
          if (element.receiveLocationAllocationType == 'Manual') {
            element.savedReceiveLocations = element.receiveLocationHelpers;
          }
          else {
            element.savedReceiveLocations = [];
          }
          if (element.returnLocationAllocationType == 'Manual') {
            element.savedReturnLocations = element.returnLocationHelpers;
          }
          else {
            element.savedReturnLocations = [];
          }
        });
        this.selectedLinesArrayForManagement = this.includeExportDataForManagement.filter(x => x.locationFound == false);
      }
    }
    else {
      if (((i == 1) || (i != 1 && this.includeExportDataForManagement.length > 0)) && i <= this.loopToStopForManagement) {
        const form = {
          'organizationIDName': this.formObj.organizationIDName,
          'wareHouseIDName': this.formObj.wareHouseIDName,
          "page": i,
          "pageSize": parseInt(this.dataPerPageForManagement),
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "searchOnKeys": PaginationConstants.goodsReceiptByIDSearchOnKeys,
          "searchKeyword": this.searchKeyManagement,
          "locationPage": 1,
          "locationPageSize": 5,
          "returnLocationPage": 1,
          "returnLocationPageSize": 5,
          _id: this.id
        }
        this.wmsService.fetchGoodsReceiptManagementByIDPagination(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.goodsReceiptManagementPaginationResponse.goodsReceiptManagement) {
              this.includeExportDataForManagement = [...this.includeExportDataForManagement, ...response.data.goodsReceiptManagementPaginationResponse.goodsReceiptManagement.goodsReceiptManagementLines];
              this.getAllManagementLists(i);
            }
          })
      }
    }
  }

  getAllLinesLists(index?) {
    if (!index) {
      this.includeExportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      console.log(this.includeExportData);
      if (this.selectAllCheckboxValue) {
        this.includeExportData.forEach(grLine => {
          grLine.saveRecentReceive = false;
          grLine.saveRecentReturn = false;
          if (grLine.receiveLocationAllocationType == 'Manual') {
            grLine.savedReceiveLocations = grLine.receiveLocationHelpers;
          }
          else {
            grLine.savedReceiveLocations = [];
          }
          if (grLine.returnLocationAllocationType == 'Manual') {
            grLine.savedReturnLocations = grLine.returnLocationHelpers;
          }
          else {
            grLine.savedReturnLocations = [];
          }
          grLine.isChecked = true;
          grLine.supplierIDName = null;
          grLine.hideReceive = false;
          grLine.hideReturn = false;
          if (grLine.supplierMasterInfo && grLine.supplierMasterInfo.supplierIDName) {
            grLine.supplierIDName = grLine.supplierMasterInfo.supplierIDName;
          }
          this.wmsService.fetchProductDetailsById(grLine.productMasterInfo['productMasterID'], this.formObj).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data.productMaster) {
                grLine.serialNumberCheck = response.data.productMaster.serialNumberCheck;
              }
              else {
                grLine.serialNumberCheck = null;
              }
            })
        });
        this.selectedLinesArray = this.includeExportData;
      }
    }
    else {
      if (((i == 1) || (i != 1 && this.includeExportData.length > 0)) && i <= this.loopToStop) {
        const form = {
          'organizationIDName': this.formObj.organizationIDName,
          'wareHouseIDName': this.formObj.wareHouseIDName,
          "page": i,
          "pageSize": parseInt(this.dataPerPage),
          "locationPage": 1,
          "locationPageSize": 5,
          "returnLocationPage": 1,
          "returnLocationPageSize": 5,
          _id: this.id,
          "grnLineStatus": "Completely Received",
          "grnLineStatusOperatorType": "ne"
        }
        this.wmsService.fetchGRNLocations(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.goodsReceiptPaginationResponse.goodsReceipt && response.data.goodsReceiptPaginationResponse.goodsReceipt.goodsReceiptLines) {
              this.includeExportData = [...this.includeExportData, ...response.data.goodsReceiptPaginationResponse.goodsReceipt.goodsReceiptLines];
              this.getAllLinesLists(i);
            }
          })
      }
    }
  }
  getDataForFilters(req) {
    if (req.goodsReceiptLines && req.goodsReceiptLines.length > 0) {
      req.goodsReceiptLines.forEach(formLine => {
        formLine['vehicleInfo'] = formLine.vehicleNumber ? this.mapId('vehicle', formLine.vehicleNumber) : null;
        delete formLine.vehicleNumber;
        formLine['equipmentInfo'] = formLine.containerNumber ? this.mapId('equipment', formLine.containerNumber) : null;
        delete formLine.containerNumber;
        formLine['serviceProviderInfo'] = formLine.transport ? this.mapId('serviceID', formLine.transport) : null;
        delete formLine.transport;
        if (formLine.supplierIDName) {
          formLine.supplierMasterInfo = this.onSupplierIDNameChangeOnLine(formLine.supplierIDName);
        }
        if (formLine.purchaseTaxes && formLine.purchaseTaxes.length > 0) {
          if (typeof (formLine.purchaseTaxes[0]) == 'string') {
            const purchase = JSON.parse(JSON.stringify(formLine.purchaseTaxes));
            formLine.purchaseTaxes = [];
            purchase.forEach(inner => {
              if (typeof (inner) == 'string') {
                formLine.purchaseTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
              }
              else {
                formLine.purchaseTaxes.push(inner);
              }
            });
          }
        }
        if (typeof (formLine.serialNumbers) == 'string' && formLine.serialNumbers != "") {
          formLine.serialNumbers = formLine.serialNumbers.split(',');
        }
        if (formLine.serialNumbers == "") {
          formLine.serialNumbers = null;
        }
      });
    }
    if (req.goodsReceiptManagementLines && req.goodsReceiptManagementLines.length > 0) {
      req.goodsReceiptManagementLines.forEach(formLine => {
        if (formLine.purchaseTaxes && formLine.purchaseTaxes.length > 0) {
          if (typeof (formLine.purchaseTaxes[0]) == 'string') {
            const purchase = JSON.parse(JSON.stringify(formLine.purchaseTaxes));
            formLine.purchaseTaxes = [];
            purchase.forEach(inner => {
              if (typeof (inner) == 'string') {
                formLine.purchaseTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
              }
              else {
                formLine.purchaseTaxes.push(inner);
              }
            });
          }
        }
        if (typeof (formLine.serialNumbers) == 'string' && formLine.serialNumbers != "") {
          formLine.serialNumbers = formLine.serialNumbers.split(',');
        }
        if (formLine.serialNumbers == "") {
          formLine.serialNumbers = null;
        }
      });
    }
    this.fetchAllReceiveLocations(req, null); //vodhu
    this.fetchAllReturnLocations(req, null);
  }
  getTaxJson(taxNamePercentage, qty, discount) {
    const filteredtax = this.taxData.find(x => x.taxNamePercentage == taxNamePercentage);
    if (discount) {
      qty = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(discount, 100)), qty);
    }
    return {
      _id: filteredtax._id,
      taxName: filteredtax.taxName,
      taxPercentage: filteredtax.taxPercentage,
      taxNamePercentage: filteredtax.taxNamePercentage,
      taxAmount: DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(filteredtax.taxPercentage, 100), 1), qty), qty)

    }
  }
  priceMethodContinution(key, conversionFactor, filteredProduct, fromScan?) {
    if (key && this.receivingForm.value.supplierReturnQuantity) {
      this.receivingForm.controls.returnQuantity.setValue(DecimalUtils.multiply(this.receivingForm.value.supplierReturnQuantity, conversionFactor));
      const returnRounded: any = DecimalUtils.divide((DecimalUtils.multiply(this.receivingForm.value.supplierReturnQuantity, conversionFactor)), filteredProduct.palletQuantity);
      if (returnRounded.toString().includes('.')) {
        const splitNumber = returnRounded.toString().split('.')[0];
        this.receivingForm.controls.noOfReturnLocationsRequired.setValue(DecimalUtils.add(splitNumber, 1))
      }
      else {
        this.receivingForm.controls.noOfReturnLocationsRequired.setValue(returnRounded)
      }
      if (this.receivingForm.controls.noOfReturnLocationsRequired.value == 'Infinity') {
        this.receivingForm.controls.noOfReturnLocationsRequired.setValue(0);
      }
    }
    else {
      if (this.receivingForm.value.supplierReceivedQuantity) {
        this.receivingForm.controls.receivedQuantity.setValue(DecimalUtils.multiply(this.receivingForm.value.supplierReceivedQuantity, conversionFactor));
        const roundedValue: any = DecimalUtils.divide((DecimalUtils.multiply(this.receivingForm.value.supplierReceivedQuantity, conversionFactor)), filteredProduct.palletQuantity);
        if (roundedValue.toString().includes('.')) {
          const splitNumber = roundedValue.toString().split('.')[0];
          this.receivingForm.controls.noOfReceiveLocationsRequired.setValue(DecimalUtils.add(splitNumber, 1))
        }
        else {
          this.receivingForm.controls.noOfReceiveLocationsRequired.setValue(roundedValue)
        }
      }
    }
    if (this.filteredSUpplierProd && this.receivingForm.controls.unitPrice.value && !this.receivingForm.controls.orderUnitPrice.value) {
      this.receivingForm.controls.orderUnitPrice.setValue(DecimalUtils.multiply(this.receivingForm.controls.unitPrice.value, conversionFactor));
    }
    if (this.receivingForm.controls.orderUnitPrice.value) {
      this.receivingForm.controls.orderUnitPrice.setValue(DecimalUtils.multiply(this.receivingForm.controls.unitPrice.value, conversionFactor));
      this.getUnitPrice('dontCall');
    }
    this.calculate(fromScan);
  }
  getUnitPrice(key?) {
    if (this.conversionFactor && this.receivingForm.controls.orderUnitPrice.value) {
      this.receivingForm.controls.unitPrice.setValue(DecimalUtils.divide(this.receivingForm.controls.orderUnitPrice.value, this.conversionFactor));
      (key) ? '' : this.calculate();
    }
  }
  calculate(fromScan?) {
    let amount: any = 0;
    let taxes: any = 0;
    let taxPercentage: any = 0;
    const soLine = this.receivingForm.value;
    let qty: any = 0;
    if (soLine.supplierReceivedQuantity) {
      qty = DecimalUtils.add(qty, soLine.supplierReceivedQuantity);
    }
    if (soLine.supplierReturnQuantity) {
      qty = DecimalUtils.add(qty, soLine.supplierReturnQuantity);
    }
    if (soLine.orderUnitPrice && qty) {
      amount = DecimalUtils.multiply(soLine.orderUnitPrice, qty);
      this.receivingForm.controls.grossAmount.setValue(amount);

      if (soLine.discount) {
        amount = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(soLine.discount, 100)), amount);
        const discountAmount = (DecimalUtils.subtract(this.receivingForm.controls.grossAmount.value, amount));
        this.receivingForm.controls.discountAmount.setValue(discountAmount);
      }
      if (soLine.purchaseTaxes && soLine.purchaseTaxes.length > 0) {
        soLine.purchaseTaxes.forEach(el => {
          const filter = this.taxData.find(x => x.taxNamePercentage == el);
          taxPercentage = DecimalUtils.add(taxPercentage, (filter ? filter.taxPercentage : 0))
        });
        this.receivingForm.controls.taxPercentage.setValue(taxPercentage);

        soLine.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);
        this.receivingForm.controls.taxAmount.setValue((soLine.taxAmount));
        taxes = soLine.taxAmount;
      }
      this.receivingForm.controls.netAmount.setValue((DecimalUtils.add(amount, taxes)));
      if (fromScan) {
        this.saveFirst();
      }
    }
    else {
      this.receivingForm.controls.netAmount.setValue(null);
      this.receivingForm.controls.grossAmount.setValue(null);
      this.receivingForm.controls.taxAmount.setValue(null);
      this.receivingForm.controls.discountAmount.setValue(null);
      this.receivingForm.controls.taxPercentage.setValue(null);
    }
  }

  receiveLocForTablePagination(pageForTableForReceive, fromselectEntries?) {
    if (fromselectEntries) {
      this.pageForTableForReceive = 1;
    }
    const array = this.isAllocateObject ? 'grManagementLines' : 'arrayForTable';
    let filteredRecieveLocations = [];
    filteredRecieveLocations = this.receiveLocations.filter(x => x.isChecked == true && x.quantity);
    if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0)) {
      if (this[array][this.globalUpdateIndex].saveRecentReceive) {
        this.selectedReceiveRecords = this[array][this.globalUpdateIndex].receiveLocationHelpers;
      }
    }
    else {
      this.selectedReceiveRecords = this.receivingForm.controls.receiveLocationHelpers.value;
    }
    if (filteredRecieveLocations.length > 0) {
      filteredRecieveLocations.forEach(element => {
        delete element.isEdit;
        delete element.isChecked;
      });
      const dummy = this.selectedReceiveRecords;
      if (dummy && dummy.length > 0) {
        filteredRecieveLocations.forEach(element => {
          const findIndex = this.selectedReceiveRecords.findIndex(srr => srr._id == element._id);
          if (findIndex == -1) {
            this.selectedReceiveRecords.push(element);
          }
          else {
            this.selectedReceiveRecords[findIndex].quantity = element.quantity;
            this.selectedReceiveRecords[findIndex].packingRemarks = element.packingRemarks;
          }
        })
      }
      else {
        this.selectedReceiveRecords = filteredRecieveLocations;
      }
      if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) || this.isAllocateObject) {
        this[array][this.globalUpdateIndex].receiveLocationHelpers = this.selectedReceiveRecords
      }
      else {
        this.receivingForm.controls.receiveLocationHelpers.setValue(this.selectedReceiveRecords);
      }
    }
    this.fetchAllReceiveLocations(this.finalReceiveObj, pageForTableForReceive, 'true', (((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) || this.isAllocateObject) ? 'forTable' : null));
  }
  fetchAllReceiveLocations(value?, page?, showError?, forTable?) {
    this.receiveLocations = [];
    this.finalReceiveObj = value;
    if (forTable) {
      if (this.isAllocateObject) {
        this.fetchReceiveLocationsForTableManagement(page, showError);
      }
      else {
        this.fetchReceiveLocationsForTable(page, showError);
      }
    }
    else {
      this.fetchReceiveLocationsForManual(value, page, showError);
    }
  }
  fetchReceiveLocationsForTableManagement(page, showError) {
    const form = {
      'organizationIDName': this.formObj.organizationIDName,
      'wareHouseIDName': this.formObj.wareHouseIDName,
      "page": this.pageForTable,
      "pageSize": this.itemsPerPage,
      "locationPage": page ? page : 1,
      "locationPageSize": this.itemsPerPageForReceive,
      "locationSearchKeyword": this.searchKeyForReceive,
      "locationSearchOnKeys": ['locationName'],
      "returnLocationPage": 1,
      "returnLocationPageSize": 5,
      _id: this.id,
      "grnLineStatus": "Completely Received",
      "grnLineStatusOperatorType": "is"
    }
    this.wmsService.fetchGRNLocations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptPaginationResponse.goodsReceipt) {
          const obj = response.data.goodsReceiptPaginationResponse.goodsReceipt;
          // obj.goodsReceiptLines = obj.goodsReceiptLines.filter((line: any) => {
          //   return line.updated === true;
          // });
          if (showError) {
            this.ngxSmartModalService.getModal('recieveLocationsModal').open();
            this.totalItemsForReceive = obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.totalElements;
          }
          this.totalItemsForReceive = obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.totalElements;
          if (obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.locationHelpers && obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.locationHelpers.length > 0) {
            obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.locationHelpers.forEach(x => {
              x['isEdit'] = false;
              x['isChecked'] = false;
              x['packingRemarks'] = null;
              if (x.quantity) {
                x.isChecked = true;
              }
            });
          }
          else {
            this.totalItemsForReceive = 0;
          }
          let locationHelpers = null;
          this.receiveLocations = obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.locationHelpers;
          if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0)) {
            if (this.grManagementLines[this.globalUpdateIndex].receiveLocationHelpers && this.grManagementLines[this.globalUpdateIndex].receiveLocationHelpers.length > 0) {
              locationHelpers = this.grManagementLines[this.globalUpdateIndex].receiveLocationHelpers.map(x => x._id);
            }
          }
          this.receiveLocations.forEach(x => {
            x['isEdit'] = false;
            x['isChecked'] = false;
            x['quantity'] = null;
            x['packingRemarks'] = null;
            if (locationHelpers && locationHelpers.length > 0 && locationHelpers.includes(x._id)) {
              let existed = null;
              existed = this.grManagementLines[this.globalUpdateIndex].receiveLocationHelpers.find(y => y._id == x._id);
              x['isEdit'] = true;
              x['isChecked'] = true;
              x['quantity'] = existed.quantity;
              x['packingRemarks'] = existed.packingRemarks;
            }
          });
        }
      })
  }
  fetchReceiveLocationsForManual(value, page, showError) {
    value.receiptDate = value.receiptDate ? new Date(value.receiptDate) : null;
    const obj = {}
    obj['locationPage'] = page ? page : this.pageForTableForReceive;
    obj['locationPageSize'] = parseInt(this.itemsPerPageForReceive);
    obj['locationSearchKeyword'] = this.searchKeyForReceive;
    obj["locationSearchOnKeys"] = ['locationName'];
    obj['goodsReceipt'] = JSON.parse(JSON.stringify(value));
    obj['goodsReceipt'].goodsReceiptLines[0].grnDate = obj['goodsReceipt'].goodsReceiptLines[0].grnDate ? new Date(obj['goodsReceipt'].goodsReceiptLines[0].grnDate) : null;
    this.wmsService.fetchAllReceiveLocationsWithPagination(obj).subscribe(res => {
      if (res && res.status === 0 && res.data.goodsReceiptLocationsResponse && res.data.goodsReceiptLocationsResponse.locationHelpers.length > 0) {
        this.receiveLocations = res.data.goodsReceiptLocationsResponse.locationHelpers;
        this.totalItemsForReceive = res.data.goodsReceiptLocationsResponse.totalElements;
        if (showError) {
          this.totalItemsForReceive = res.data.goodsReceiptLocationsResponse.totalElements;
          this.ngxSmartModalService.getModal('recieveLocationsModal').open();
        }
        this.recieveALLocations = this.receiveLocations;
        this.receiveLocationValues = this.receiveLocations.map(x => x.locationName);
        let locationHelpers = null;
        if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) && !this.isAllocateObject) {
          if (this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers && this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers.length > 0) {
            locationHelpers = this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers.map(x => x._id);
          }
        }
        // if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
        //   locationHelpers = this.selectedReceiveRecords.map(x => x._id);
        // }
        else {
          if (this.receivingForm.controls.receiveLocationHelpers.value && this.receivingForm.controls.receiveLocationHelpers.value.length > 0) {
            locationHelpers = this.receivingForm.controls.receiveLocationHelpers.value.map(x => x._id);
          }
        }
        this.receiveLocations.forEach(x => {
          x['isEdit'] = false;
          x['isChecked'] = false;
          if (locationHelpers && locationHelpers.length > 0 && locationHelpers.includes(x._id)) {
            let existed = null;
            // if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
            //   existed = this.selectedReceiveRecords.find(y => y._id == x._id);
            // }
            // else {
            if (this.receivingForm.controls.receiveLocationHelpers.value && this.receivingForm.controls.receiveLocationHelpers.value.length > 0) {
              existed = this.receivingForm.controls.receiveLocationHelpers.value.find(y => y._id == x._id);
            }
            else {
              existed = this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers.find(y => y._id == x._id);
            }
            // }
            x['isEdit'] = true;
            x['isChecked'] = true;
            x['quantity'] = existed.quantity;
            x['packingRemarks'] = existed.packingRemarks;
          }
        });
      }
      else {
        this.totalItemsForReceive = null;
        if (showError && !this.searchKeyForReceive) {
          this.toastr.error('No Locations Found');
        }
        if (!this.searchKeyForReceive) {
          this.ngxSmartModalService.getModal('recieveLocationsModal').close();
          this.searchKeyForReceive = null;
        }
        if (res.status == 2) {
          this.toastr.error(res.statusMsg);
        }
        this.receiveLocations = [];
      }
    });
  }
  fetchReceiveLocationsForTable(page, showError) {
    const form = {
      'organizationIDName': this.formObj.organizationIDName,
      'wareHouseIDName': this.formObj.wareHouseIDName,
      "page": this.pageForTable,
      "pageSize": this.itemsPerPage,
      "locationPage": page ? page : 1,
      "locationPageSize": this.itemsPerPageForReceive,
      "locationSearchKeyword": this.searchKeyForReceive,
      "locationSearchOnKeys": ['locationName'],
      "returnLocationPage": 1,
      "returnLocationPageSize": 5,
      _id: this.id,
      "grnLineStatus": "Completely Received",
      "grnLineStatusOperatorType": "ne"
    }
    this.wmsService.fetchGRNLocations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptPaginationResponse.goodsReceipt) {
          const obj = response.data.goodsReceiptPaginationResponse.goodsReceipt;
          // obj.goodsReceiptLines = obj.goodsReceiptLines.filter((line: any) => {
          //   return line.updated === false;
          // });
          if (showError) {
            this.ngxSmartModalService.getModal('recieveLocationsModal').open();
            this.totalItemsForReceive = obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.totalElements;
          }
          this.totalItemsForReceive = obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.totalElements;
          if (obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.locationHelpers && obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.locationHelpers.length > 0) {
            obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.locationHelpers.forEach(x => {
              x['isEdit'] = false;
              x['isChecked'] = false;
              x['packingRemarks'] = null;
              if (x.quantity) {
                x.isChecked = true;
              }
            });
          }
          else {
            this.totalItemsForReceive = 0;
          }
          let locationHelpers = null;
          this.receiveLocations = obj.goodsReceiptLines[this.globalUpdateIndex].receiveLocationHelperPaginationResponse.locationHelpers;
          if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) && !this.isAllocateObject) {
            if (this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers && this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers.length > 0) {
              locationHelpers = this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers.map(x => x._id);
            }
          }
          // if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
          //   locationHelpers = this.selectedReceiveRecords.map(x => x._id);
          // }
          else {
            if (this.receivingForm.controls.receiveLocationHelpers.value && this.receivingForm.controls.receiveLocationHelpers.value.length > 0) {
              locationHelpers = this.receivingForm.controls.receiveLocationHelpers.value.map(x => x._id);
            }
          }
          this.receiveLocations.forEach(x => {
            x['isEdit'] = false;
            x['isChecked'] = false;
            x['quantity'] = null;
            x['packingRemarks'] = null;
            if (locationHelpers && locationHelpers.length > 0 && locationHelpers.includes(x._id)) {
              let existed = null;
              // if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
              //   existed = this.selectedReceiveRecords.find(y => y._id == x._id);
              // }
              // else {
              if (this.receivingForm.controls.receiveLocationHelpers.value && this.receivingForm.controls.receiveLocationHelpers.value.length > 0) {
                existed = this.receivingForm.controls.receiveLocationHelpers.value.find(y => y._id == x._id);
              }
              else {
                existed = this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers.find(y => y._id == x._id);
              }
              // }
              x['isEdit'] = true;
              x['isChecked'] = true;
              x['quantity'] = existed.quantity;
              x['packingRemarks'] = existed.packingRemarks;
            }
          });
        }
      })
  }
  returnLocForTablePagination(pageForTableForReturn, fromselectEntries?) {
    if (fromselectEntries) {
      this.pageForTableForReturn = 1;
    }
    const array = this.isAllocateObject ? 'grManagementLines' : 'arrayForTable';
    let filteredReturnLocations = [];
    filteredReturnLocations = this.returnLocations.filter(x => x.isChecked == true && x.quantity);
    if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0)) {
      if (this[array][this.globalUpdateIndex].saveRecentReturn) {
        this.selectedReturnRecords = this[array][this.globalUpdateIndex].returnLocationHelpers;
      }
    }
    else {
      this.selectedReturnRecords = this.receivingForm.controls.returnLocationHelpers.value;
    }
    if (filteredReturnLocations.length > 0) {
      filteredReturnLocations.forEach(element => {
        delete element.isEdit;
        delete element.isChecked;
      });
      const dummy = this.selectedReturnRecords;
      if (dummy && dummy.length > 0) {
        filteredReturnLocations.forEach(element => {
          const findIndex = this.selectedReturnRecords.findIndex(srr => srr._id == element._id);
          if (findIndex == -1) {
            this.selectedReturnRecords.push(element);
          }
          else {
            this.selectedReturnRecords[findIndex].quantity = element.quantity;
            this.selectedReturnRecords[findIndex].packingRemarks = element.packingRemarks;
          }
        })
      }
      else {
        this.selectedReturnRecords = filteredReturnLocations;
      }
      if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) || this.isAllocateObject) {
        this[array][this.globalUpdateIndex].returnLocationHelpers = this.selectedReturnRecords;
      }
      else {
        this.receivingForm.controls.returnLocationHelpers.setValue(this.selectedReturnRecords);
      }
    }
    this.fetchAllReturnLocations(this.finalReturnObj, pageForTableForReturn, 'true', (((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) || this.isAllocateObject) ? 'forTable' : null));
  }
  fetchAllReturnLocations(val?, page?, showError?, forTable?) {
    this.returnLocations = [];
    this.finalReturnObj = val;
    if (forTable) {
      if (this.isAllocateObject) {
        this.fetchReturnLocationsForTableManagement(val, page, showError);
      }
      else {
        this.fetchReturnLocationsForTable(val, page, showError);
      }
    }
    else {
      this.fetchReturnLocationsForManual(val, page, showError);
    }
  }
  fetchReturnLocationsForManual(val, page, showError) {
    const obj = {}
    obj['returnLocationPage'] = page ? page : this.pageForTableForReturn;
    obj['returnLocationPageSize'] = parseInt(this.itemsPerPageForReturn);
    obj["locationSearchKeyword"] = this.searchKeyForReturn;
    obj["locationSearchOnKeys"] = ['locationName'];
    obj['goodsReceipt'] = JSON.parse(JSON.stringify(val));
    obj['goodsReceipt'].goodsReceiptLines[0].grnDate = obj['goodsReceipt'].goodsReceiptLines[0].grnDate ? new Date(obj['goodsReceipt'].goodsReceiptLines[0].grnDate) : null;
    this.wmsService.fetchAllReturnLocation(obj).subscribe(res => {
      if (res && res.status === 0 && res.data.goodsReceiptLocationsResponse.locationHelpers && res.data.goodsReceiptLocationsResponse.locationHelpers.length > 0) {
        this.returnLocations = res.data.goodsReceiptLocationsResponse.locationHelpers;
        if (showError) {
          this.totalItemsForReturn = res.data.goodsReceiptLocationsResponse.totalElements;
          this.ngxSmartModalService.getModal('returnLocationsModal').open();
        }
        this.returnALLocations = this.returnLocations;
        this.returnLocationValues = this.returnLocations.map(x => x.locationName);
        let locationHelpers = null;
        if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) && !this.isAllocateObject) {
          if (this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers && this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers.length > 0) {
            locationHelpers = this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers.map(x => x._id);
          }
        }
        // if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
        //   locationHelpers = this.selectedReturnRecords.map(x => x._id);
        // }
        else {
          if (this.receivingForm.controls.returnLocationHelpers.value && this.receivingForm.controls.returnLocationHelpers.value.length > 0) {
            locationHelpers = this.receivingForm.controls.returnLocationHelpers.value.map(x => x._id);
          }
        }
        this.returnLocations.forEach(x => {
          x['isEdit'] = false;
          x['isChecked'] = false;
          if (locationHelpers && locationHelpers.length > 0 && locationHelpers.includes(x._id)) {
            let existed = null;
            // if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
            //   existed = this.selectedReturnRecords.find(y => y._id == x._id);
            // }
            // else {
            if (this.receivingForm.controls.returnLocationHelpers.value && this.receivingForm.controls.returnLocationHelpers.value.length > 0) {
              existed = this.receivingForm.controls.returnLocationHelpers.value.find(y => y._id == x._id);
            }
            else {
              existed = this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers.find(y => y._id == x._id);
            }
            // }
            x['isEdit'] = true;
            x['isChecked'] = true;
            x['quantity'] = existed.quantity;
            x['packingRemarks'] = existed.packingRemarks;
          }
        });
      }

      else {
        this.totalItemsForReturn = null;
        if (showError && !this.searchKeyForReturn) {
          this.toastr.error('No Locations Found');
        }
        if (!this.searchKeyForReturn) {
          this.ngxSmartModalService.getModal('returnLocationsModal').close();
          this.searchKeyForReturn = null;
        }
        if (res.status == 2) {
          this.toastr.error(res.statusMsg);
        }
        this.returnLocations = [];
      }
    });
  }
  fetchReturnLocationsForTable(val, page, showError) {
    const form = {
      'organizationIDName': this.formObj.organizationIDName,
      'wareHouseIDName': this.formObj.wareHouseIDName,
      "page": this.pageForTable,
      "pageSize": this.itemsPerPage,
      "returnLocationPage": page ? page : 1,
      "returnLocationPageSize": this.itemsPerPageForReturn,
      "returnLocationSearchKeyword": this.searchKeyForReturn,
      "returnLocationSearchOnKeys": ['locationName'],
      "locationPage": 1,
      "locationPageSize": 5,
      _id: this.id,
      "grnLineStatus": "Completely Received",
      "grnLineStatusOperatorType": "ne"
    }
    this.wmsService.fetchGRNLocations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptPaginationResponse.goodsReceipt) {
          const obj = response.data.goodsReceiptPaginationResponse.goodsReceipt;
          // obj.goodsReceiptLines = obj.goodsReceiptLines.filter((line: any) => {
          //   return line.updated === false;
          // });
          if (showError) {
            this.ngxSmartModalService.getModal('returnLocationsModal').open();
            this.totalItemsForReturn = obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.totalElements;
          }
          if (obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.locationHelpers && obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.locationHelpers.length > 0) {
            obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.locationHelpers.forEach(x => {
              x['isEdit'] = false;
              x['isChecked'] = false;
              x['packingRemarks'] = null;
              if (x.quantity) {
                x.isChecked = true;
              }
            });
          }
          let locationHelpers = null;
          this.returnLocations = obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.locationHelpers;
          this.totalItemsForReturn = obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.totalElements;
          if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) && !this.isAllocateObject) {
            if (this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers && this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers.length > 0) {
              locationHelpers = this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers.map(x => x._id);
            }
          }
          // if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
          //   locationHelpers = this.selectedReturnRecords.map(x => x._id);
          // }
          else {
            if (this.receivingForm.controls.returnLocationHelpers.value && this.receivingForm.controls.returnLocationHelpers.value.length > 0) {
              locationHelpers = this.receivingForm.controls.returnLocationHelpers.value.map(x => x._id);
            }
          }
          this.returnLocations.forEach(x => {
            x['isEdit'] = false;
            x['isChecked'] = false;
            x['quantity'] = null;
            x['packingRemarks'] = null;
            if (locationHelpers && locationHelpers.length > 0 && locationHelpers.includes(x._id)) {
              let existed = null;
              // if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
              //   existed = this.selectedReturnRecords.find(y => y._id == x._id);
              // }
              // else {
              if (this.receivingForm.controls.returnLocationHelpers.value && this.receivingForm.controls.returnLocationHelpers.value.length > 0) {
                existed = this.receivingForm.controls.returnLocationHelpers.value.find(y => y._id == x._id);
              }
              else {
                existed = this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers.find(y => y._id == x._id);
              }
              // }
              x['isEdit'] = true;
              x['isChecked'] = true;
              x['quantity'] = existed.quantity;
              x['packingRemarks'] = existed.packingRemarks;
            }
          });
        }
      })
  }
  fetchReturnLocationsForTableManagement(val, page, showError) {
    const form = {
      'organizationIDName': this.formObj.organizationIDName,
      'wareHouseIDName': this.formObj.wareHouseIDName,
      "page": this.pageForTable,
      "pageSize": this.itemsPerPage,
      "returnLocationPage": page ? page : 1,
      "returnLocationPageSize": this.itemsPerPageForReturn,
      "returnLocationSearchKeyword": this.searchKeyForReturn,
      "returnLocationSearchOnKeys": ['locationName'],
      "locationPage": 1,
      "locationPageSize": 5,
      _id: this.id,
      "grnLineStatus": "Completely Received",
      "grnLineStatusOperatorType": "is"
    }
    this.wmsService.fetchGRNLocations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptPaginationResponse.goodsReceipt) {
          const obj = response.data.goodsReceiptPaginationResponse.goodsReceipt;
          // obj.goodsReceiptLines = obj.goodsReceiptLines.filter((line: any) => {
          //   return line.updated === true;
          // });
          if (showError) {
            this.ngxSmartModalService.getModal('returnLocationsModal').open();
            this.totalItemsForReturn = obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.totalElements;
          }
          if (obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.locationHelpers && obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.locationHelpers.length > 0) {
            obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.locationHelpers.forEach(x => {
              x['isEdit'] = false;
              x['isChecked'] = false;
              x['packingRemarks'] = null;
              if (x.quantity) {
                x.isChecked = true;
              }
            });
          }
          let locationHelpers = null;
          this.returnLocations = obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.locationHelpers;
          this.totalItemsForReturn = obj.goodsReceiptLines[this.globalUpdateIndex].returnLocationHelperPaginationResponse.totalElements;
          if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0)) {
            if (this.grManagementLines[this.globalUpdateIndex].returnLocationHelpers && this.grManagementLines[this.globalUpdateIndex].returnLocationHelpers.length > 0) {
              locationHelpers = this.grManagementLines[this.globalUpdateIndex].returnLocationHelpers.map(x => x._id);
            }
          }
          this.returnLocations.forEach(x => {
            x['isEdit'] = false;
            x['isChecked'] = false;
            x['quantity'] = null;
            x['packingRemarks'] = null;
            if (locationHelpers && locationHelpers.length > 0 && locationHelpers.includes(x._id)) {
              let existed = null;
              existed = this.grManagementLines[this.globalUpdateIndex].returnLocationHelpers.find(y => y._id == x._id);
              x['isEdit'] = true;
              x['isChecked'] = true;
              x['quantity'] = existed.quantity;
              x['packingRemarks'] = existed.packingRemarks;
            }
          });
        }
      })
  }
  ngOnDestroy(): void {
    sessionStorage.removeItem('grnID');
  }
  openScanner(edit?) {
    this.isEditToggle = edit;
    if (this.headerForm.value.supplierMasterInfo.supplierIDName) {
      this.barcodeInfo = { 'toggle': true };
      this.ngxSmartModalService.getModal('scannerModalForWebCam').open();
    }
    else {
      this.toastr.error("Enter Supplier.")
    }
  }
  getProductDetails(forEdit?) {
    if (forEdit) {
      this.onlyHeaderUpdateToggle = false;
    }
    let upcEANNumber = this.dummyProductIDName ? this.dummyProductIDName : this.receivingForm.controls.productMasterInfo.value.productIDName;
    if (upcEANNumber && upcEANNumber.length == 12) {
      this.receivingForm.controls.productMasterInfo['controls'].productIDName.setValue(null);
      this.dummyProductIDName = null;
      this.scanSuccessHandler(upcEANNumber, forEdit);
      upcEANNumber = null;
    }
  }
  getBarcodeEvent(status) {
    if (status) {
      this.scanSuccessHandler(status, this.isEditToggle);
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
  scanSuccessHandler(e: Event, forEdit): void {
    if (e) {
      const bConfig = this.overAllBarcodeData.find(x => x.upcEANNumber == e);
      if (bConfig) {
        this.bConfig = bConfig;
        this.dummyProductIDName = bConfig.productMasterInfo.productIDName;
        this.receivingForm.controls.productMasterInfo['controls'].productIDName.setValue(bConfig.productMasterInfo.productIDName);
        this.receivingForm.controls.receivingUnit.setValue(bConfig.unitCode);
        const form = this.receivingForm.value;
        this.existedLineDetails = this.arrayForTable.find(x => x.productMasterInfo.productIDName == form.productMasterInfo.productIDName && x.receivingUnit == form.receivingUnit);
        if (this.existedLineDetails) {
          if (!forEdit) {
            this.onProductIDNameChange('fromScan');
            this.isEditToggle = null;
          }
          else {
            const fIndex = this.arrayForTable.findIndex(x => x.productMasterInfo.productIDName == form.productMasterInfo.productIDName && x.receivingUnit == form.receivingUnit);
            this.arrayForTable[fIndex].isChecked = true;
            this.receivingForm.controls.productMasterInfo['controls'].productIDName.setValue(null);
            this.receivingForm.controls.receivingUnit.setValue(null);
            if (DecimalUtils.lessThan((DecimalUtils.add(this.arrayForTable[fIndex].supplierReceivedQuantity, this.arrayForTable[fIndex].supplierReturnQuantity)), this.arrayForTable[fIndex].orderedQuantity)) {
              if ((!this.arrayForTable[fIndex].supplierReceivableQuantity || (this.arrayForTable[fIndex].supplierReceivableQuantity && this.arrayForTable[fIndex].supplierReceivableQuantity == 0)) ||
                (this.arrayForTable[fIndex].supplierReceivableQuantity && DecimalUtils.lessThan(this.arrayForTable[fIndex].supplierReceivedQuantity, this.arrayForTable[fIndex].supplierReceivableQuantity))) {
                this.arrayForTable[fIndex].supplierReceivedQuantity = DecimalUtils.add(this.arrayForTable[fIndex].supplierReceivedQuantity, 1);
                this.calculateReceivedQtyFortable('', fIndex, 'Barcode');
                this.toastr.success('Scan Success');
                this.isEditToggle = null;
              }
              else {
                this.toastr.error("Supplier Received Quantity should be less than Supplier Receivable Quantity");
                this.dummyProductIDName = null;
                this.arrayForTable[fIndex].isChecked = false;
              }
            }
            else {
              this.toastr.error("Ordered quantity should be greater than or equal to Supplier received quantity plus return quantity");
              this.arrayForTable[fIndex].isChecked = false;
              this.dummyProductIDName = null;
            }
          }
        }
        else {
          if (forEdit) {
            this.toastr.error('No Matching Product');
            this.dummyProductIDName = null;
          }
          else {
            this.isEditToggle = null;
            this.onProductIDNameChange('fromScan');
          }
        }
      }
    }
  }
  onFiltering(event, key) {
    let query: Query = new Query();
    query = (event.text !== '') ? query.where('text', 'contains', event.text, true) : query;
    event.updateData(this[key], query);

  }
  onOpen(args, key) {
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
              "page": this.page,
              "pageSize": 10,
              "organizationIDName": this.formObj.organizationIDName,
              "wareHouseIDName": this.formObj.wareHouseIDName,
              "searchOnKeys": ['productIDName'],
              "searchKeyword": null
            }
            this.wmsService.fetchAllProductsWithPaginations(form).subscribe(
              (response) => {
                if (response && response.status === 0 && response.data.productMasterPaginationResponse.productMasters) {
                  this.products = [...this.products, ...response.data.productMasterPaginationResponse.productMasters];
                  this.paginationStop = response.data.productMasterPaginationResponse.productMasters.length == 0 ? true : false;
                  if (!this.paginationStop) {
                    const arr = response.data.productMasterPaginationResponse.productMasters;
                    // if (arr && arr.length > 0) {
                    if (this.productIDNames.length > 0) {
                      let index = this.productIDNames.length;
                      arr.forEach((v, i) => {
                        i = index;
                        if (!this.productIDNames.find(x => x.text == v.productIDName)) {
                          this.productIDNames.push({ text: v.productIDName, id: i });
                          index += 1;
                        }
                      });
                    }
                    else {
                      this.productIDNames = arr.map((v, i) => ({ text: v.productIDName, id: i }));
                    }
                    new DataManager(this.productIDNames)
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
                  this.productIDNames = [];
                }
              })
          }
        }
      });
    }
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
              noteType: 'Inward Shipment',
              "page": this.page,
              "pageSize": 10,
              "organizationIDName": this.formObj.organizationIDName,
              "wareHouseIDName": this.formObj.wareHouseIDName,
            }
            this.commonMasterDataService.fetchAllGRNote(form).subscribe(res => {
              if (res['status'] == 0 && res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes']) {
                // this.grnotesData = res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes'].filter(x => !x.wmpoNumber);
                // this.grNoteInvoices = this.grnotesData.map(x => x.invoiceNumber);
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
  accessOrderID(event) {
    if (event && event.itemData) {
      this.receivingForm.controls.productMasterInfo['controls'].productIDName.setValue(event.itemData.text);
      this.onProductIDNameChange();
    }
  }
  validate(key, type, i) {
    if (type == 'form') {
      this.receivingForm.controls[key].setValue(DecimalUtils.enterLimitedDecimals(this.receivingForm.controls[key].value));
    }
    else {
      this.arrayForTable[i][key] = DecimalUtils.enterLimitedDecimals(this.arrayForTable[i][key]);
    }
  }
  validateLocationDecimal(arr, i) {
    this[arr][i].quantity = DecimalUtils.enterLimitedDecimals(this[arr][i].quantity);
  }
  hideReturnOrReceive(key?) {
    if ((!key || key != 'Return') && !this.receivingForm.controls.supplierReceivedQuantity.value) {
      this.receivingForm.controls.receivedQuantity.setValue(null);
    }
    if (key == 'Return' && !this.receivingForm.controls.supplierReturnQuantity.value) {
      this.receivingForm.controls.returnQuantity.setValue(null);
    }
    if (this.uomAvailabilityCheck != 'Yes' && ((key && this.hideReturn == false) || (!key && this.hideReceive == false))) {
      if (key && this.receivingForm.controls.supplierReturnQuantity.value && this.receivingForm.controls.supplierReturnQuantity.value != 0) {
        this.hideReceive = true;
      }
      else if (!key && this.receivingForm.controls.supplierReceivedQuantity.value && this.receivingForm.controls.supplierReceivedQuantity.value != 0) {
        this.hideReturn = true;
      }
      else {
        this.hideReceive = false;
        this.hideReturn = false;
      }
    }
    else {
      if (this.uomAvailabilityCheck == 'Yes') {
        this.hideReceive = false;
        this.hideReturn = false;
      }
    }
  }
  hideReturnOrReceiveForTable(i, key?) {
    if ((!key || key != 'Return') && !this.arrayForTable[i].supplierReceivedQuantity) {
      this.arrayForTable[i].receivedQuantity = null;
    }
    if (key == 'Return' && !this.arrayForTable[i].supplierReturnQuantity) {
      this.arrayForTable[i].returnQuantity = null;
    }
    if (this.arrayForTable[i].uomConversionAvailability != 'Yes' && ((key && this.arrayForTable[i].hideReturn == false) || (!key && this.arrayForTable[i].hideReceive == false))) {
      if (key && this.arrayForTable[i].supplierReturnQuantity && this.arrayForTable[i].supplierReturnQuantity != 0) {
        this.arrayForTable[i].hideReceive = true;
      }
      else if (!key && this.arrayForTable[i].supplierReceivedQuantity && this.arrayForTable[i].supplierReceivedQuantity != 0) {
        this.arrayForTable[i].hideReturn = true;
      }
      else {
        this.arrayForTable[i].hideReceive = false;
        this.arrayForTable[i].hideReturn = false;
      }
    }
    else {
      if (this.arrayForTable[i].uomConversionAvailability == 'Yes') {
        this.arrayForTable[i].hideReceive = false;
        this.arrayForTable[i].hideReturn = false;
      }
    }
  }
  saveAllocationType(type, i?) {
    this.locReceiveAllocation.putawayLocationAllocationType = (type == 'Manual') ? 'Auto' : "Manual";
    if (i || i == 0) {
      this.arrayForTable[i].receiveLocationAllocationType = ((type == 'Manual') ? 'Auto' : "Manual");
      this.onSelect(true, i);
    }
    else {
      this.receivingForm.controls.receiveLocationAllocationType.setValue((type == 'Manual') ? 'Auto' : "Manual");
    }
  }
  saveAllocationType1(type, i?) {
    this.locReturnAllocation.putawayReturnLocationAllocationType = (type == 'Manual') ? 'Auto' : "Manual";
    if (i || i == 0) {
      this.arrayForTable[i].returnLocationAllocationType = ((type == 'Manual') ? 'Auto' : "Manual");
      this.onSelect(true, i);
    }
    else {
      this.receivingForm.controls.returnLocationAllocationType.setValue((type == 'Manual') ? 'Auto' : "Manual");
    }
  }
  onSelect(event, i) {
    if ((this.arrayForTable[i].supplierReceivedQuantity == "0" || this.arrayForTable[i].supplierReceivedQuantity == 0 || !this.arrayForTable[i].supplierReceivedQuantity) && (this.arrayForTable[i].supplierReturnQuantity == "0" || this.arrayForTable[i].supplierReturnQuantity == 0 || !this.arrayForTable[i].supplierReturnQuantity)) {
      this.arrayForTable[i].isChecked = false;
      this.globalUpdateIndex = -1;
    }
    else {
      if (this.arrayForTable[i].supplierReceivedQuantity || this.arrayForTable[i].supplierReturnQuantity) {
        if (this.arrayForTable[i].orderedQuantity == 0 || this.arrayForTable[i].orderedQuantity == "0") {
          this.arrayForTable[i].isChecked = false;
          event = false;
          this.globalUpdateIndex = -1;
        }
        else {
          this.arrayForTable[i].isChecked = event;
          this.globalUpdateIndex = i;
          if (this.selectedLinesArray.length) {
            const selectedIDs = this.selectedLinesArray.map(x => x._id);
            if (selectedIDs.includes(this.arrayForTable[i]._id)) {
              const findIn = this.selectedLinesArray.findIndex(x => x._id === this.arrayForTable[i]._id);
              if (findIn != -1) {
                this.selectedLinesArray[findIn].isChecked = true;
                this.selectedLinesArray[findIn].saveRecentReceive = this.arrayForTable[i].saveRecentReceive;
                this.selectedLinesArray[findIn].saveRecentReturn = this.arrayForTable[i].saveRecentReturn;
                this.selectedLinesArray[findIn].savedReceiveLocations = this.arrayForTable[i].savedReceiveLocations;
                this.selectedLinesArray[findIn].receiveLocationHelpers = this.arrayForTable[i].receiveLocationHelpers;
                this.selectedLinesArray[findIn].receiveLocationAllocationType = this.arrayForTable[i].receiveLocationAllocationType;
                this.selectedLinesArray[findIn].returnLocationAllocationType = this.arrayForTable[i].returnLocationAllocationType;
                this.selectedLinesArray[findIn].savedReturnLocations = this.arrayForTable[i].savedReturnLocations;
                this.selectedLinesArray[findIn].returnLocationHelpers = this.arrayForTable[i].returnLocationHelpers;
                this.selectedLinesArray[findIn].hideReceive = this.arrayForTable[i].hideReceive;
                this.selectedLinesArray[findIn].hideReturn = this.arrayForTable[i].hideReturn;
                this.selectedLinesArray[findIn].mfgDate = this.arrayForTable[i].mfgDate;
                this.selectedLinesArray[findIn].expiryDate = this.arrayForTable[i].expiryDate;
                this.selectedLinesArray[findIn].grnDate = this.arrayForTable[i].grnDate;
                this.selectedLinesArray[findIn].batchNumber = this.arrayForTable[i].batchNumber;
                this.selectedLinesArray[findIn].serialNumbers = this.arrayForTable[i].serialNumbers;
                this.selectedLinesArray[findIn].receivingUnit = this.arrayForTable[i].receivingUnit;
                this.selectedLinesArray[findIn].supplierReceivedQuantity = this.arrayForTable[i].supplierReceivedQuantity;
                this.selectedLinesArray[findIn].supplierReturnQuantity = this.arrayForTable[i].supplierReturnQuantity;
                this.selectedLinesArray[findIn].receivedQuantity = this.arrayForTable[i].receivedQuantity;
                this.selectedLinesArray[findIn].returnQuantity = this.arrayForTable[i].returnQuantity;
                this.selectedLinesArray[findIn].totalReceivedQuantity = this.arrayForTable[i].totalReceivedQuantity;
                this.selectedLinesArray[findIn].totalReturnQuantity = this.arrayForTable[i].totalReturnQuantity;
                this.selectedLinesArray[findIn].noOfReceiveLocationsRequired = this.arrayForTable[i].noOfReceiveLocationsRequired;
                this.selectedLinesArray[findIn].noOfReturnLocationsRequired = this.arrayForTable[i].noOfReturnLocationsRequired;
              }
            }
            else {
              this.selectedLinesArray.push(this.arrayForTable[i]);
            }

          }
          else {
            this.selectedLinesArray.push(this.arrayForTable[i]);
          }
        }
      }
      else {
        this.arrayForTable[i].isChecked = false;
        this.globalUpdateIndex = -1;
      }
    }
    if (this.globalUpdateIndex == -1) {
      this.selectedLinesArray = this.selectedLinesArray.filter(x => x._id != this.arrayForTable[i]._id);
    }
    this.onlyHeaderUpdateToggle = false;
    // this.selectAllCheckboxValue = this.arrayForTable.every(function (item: any) {
    //   return item.isChecked == true;
    // })
  }
  onSelect1(event, data) {
    if (event) {
      data.isChecked = true
      if (this.selectedLinesArrayForManagement.length) {
        const selectedIDs = this.selectedLinesArrayForManagement.map(x => x._id);
        if (selectedIDs.includes(data._id)) {
          const findIn = this.selectedLinesArrayForManagement.findIndex(x => x._id === data._id);
          if (findIn != -1) {
            this.selectedLinesArrayForManagement[findIn].isChecked = true;
            this.selectedLinesArrayForManagement[findIn].receiveLocationHelpers = data.receiveLocationHelpers;
            this.selectedLinesArrayForManagement[findIn].receiveLocationAllocationType = data.receiveLocationAllocationType;
            this.selectedLinesArrayForManagement[findIn].returnLocationAllocationType = data.returnLocationAllocationType;
            this.selectedLinesArrayForManagement[findIn].returnLocationHelpers = data.returnLocationHelpers;
          }
        }
        else {
          this.selectedLinesArrayForManagement.push(data);
        }
      }
      else {
        this.selectedLinesArrayForManagement.push(data);
      }
    } else {
      data.isChecked = false
      this.selectedLinesArrayForManagement = this.selectedLinesArrayForManagement.filter(x => x._id != data._id);
    }
    // this.selectAllAllcateCheckboxValue = this.grManagementLines.every(function (item: any) {
    //   return item.isChecked == true;
    // })
    const obj = this.grManagementLines.find(x => x.isChecked);
    this.showAllocate = obj ? false : true;
  }
  getCFCount(key?) {
    if (key) {
      if (this.uomAvailabilityCheck != 'Yes' && this.receivingForm.controls.returnQuantity.value && this.receivingForm.controls.supplierReturnQuantity.value) {
        this.conversionFactor = DecimalUtils.divide(this.receivingForm.controls.returnQuantity.value, this.receivingForm.controls.supplierReturnQuantity.value);
        const filteredProduct = this.productFromMaster;
        this.priceMethodContinution(key, this.conversionFactor, filteredProduct);
      }
    }
    else {
      if (this.uomAvailabilityCheck != 'Yes' && this.receivingForm.controls.receivedQuantity.value && this.receivingForm.controls.supplierReceivedQuantity.value) {
        this.conversionFactor = DecimalUtils.divide(this.receivingForm.controls.receivedQuantity.value, this.receivingForm.controls.supplierReceivedQuantity.value);
        const filteredProduct = this.productFromMaster;
        this.priceMethodContinution(null, this.conversionFactor, filteredProduct);
      }
    }
  }
  getCFCountForTable(line, i, key?) {
    if (key) {
      if (line.supplierReturnQuantity && line.returnQuantity) {
        const conversionFactor = DecimalUtils.divide(line.returnQuantity, line.supplierReturnQuantity);
        if (line.orderUnitPrice) {
          line.unitPrice = DecimalUtils.divide(line.orderUnitPrice, conversionFactor);
        }
      }
    }
    else {
      if (line.supplierReceivedQuantity && line.receivedQuantity) {
        const conversionFactor = DecimalUtils.divide(line.receivedQuantity, line.supplierReceivedQuantity);
        if (line.orderUnitPrice) {
          line.unitPrice = DecimalUtils.divide(line.orderUnitPrice, conversionFactor);
        }
      }
    }
  }
  openModalRecievedLocations(form, key) {
    if (form.valid) {
      this.lineQuantity = ((key == 'Recieve') ? this.receivingForm.controls.receivedQuantity.value : this.receivingForm.controls.returnQuantity.value) + ' ' + this.receivingForm.controls.inventoryUnit.value;
      if (key == 'Recieve') {
        this.pageForTableForReceive = 1;
        this.finalReceiveLocations = this.receivingForm.controls.receiveLocationHelpers.value;
        this.selectedReceiveRecords = JSON.parse(JSON.stringify(this.finalReceiveLocations));
        if (this.receivingForm.controls.supplierReceivedQuantity.value && this.receivingForm.controls.supplierReceivedQuantity.value != 0) {
          this.fetchAllReceiveLocations(this.finalReceiveObj, 1, 'true'); //vodhu
        }
        else {
          this.toastr.error("Enter Receive Quantity!!")
        }
      }
      else {
        this.pageForTableForReturn = 1;
        this.finalReturnLocations = this.receivingForm.controls.returnLocationHelpers.value;
        this.selectedReturnRecords = JSON.parse(JSON.stringify(this.finalReturnLocations));
        if (this.receivingForm.controls.returnQuantity.value && this.receivingForm.controls.supplierReturnQuantity.value != 0) {
          this.fetchAllReturnLocations(this.finalReturnObj, 1, 'true');
        }
        else {
          this.toastr.error("Enter Return Quantity!!")
        }
      }
    }
    else {
      this.toastr.error("Enter Manditory Fields!!")
    }
  }

  openModalRecievedLocationsforTable(i, key, allocateKey?) {
    const array = allocateKey ? 'grManagementLines' : 'arrayForTable';
    if (key == 'Recieve') {
      const previousIndex = this.globalUpdateIndex;
      if (this[array][i].receivedQuantity && (this[array][i].receivedQuantity != "0" || this[array][i].receivedQuantity != 0) && this[array][i].supplierReceivedQuantity != 0) {
        this.globalUpdateIndex = i;
        if (previousIndex != this.globalUpdateIndex) {
          this.finalReceiveLocations = [];
        }
        if (this[array][i].saveRecentReceive == false) {
          this.finalReceiveLocations = JSON.parse(JSON.stringify(this[array][i].savedReceiveLocations));
        }
        else {
          this.finalReceiveLocations = JSON.parse(JSON.stringify(this[array][i].receiveLocationHelpers));
        }
        this.continutionofOpenModal(array, key, allocateKey, i);
      }
      else {
        this.toastr.error("Enter Received Quantity!!")
      }
    }
    else {
      const previousIndex = this.globalUpdateIndex;
      if (this[array][i].returnQuantity && (this[array][i].returnQuantity != "0" || this[array][i].returnQuantity != 0) && this[array][i].supplierReturnQuantity != 0) {
        this.globalUpdateIndex = i;
        if (previousIndex != this.globalUpdateIndex) {
          this.finalReturnLocations = [];
        }
        if (this[array][i].saveRecentReturn == false) {
          this.finalReturnLocations = JSON.parse(JSON.stringify(this[array][i].savedReturnLocations));
        }
        else {
          this.finalReturnLocations = JSON.parse(JSON.stringify(this[array][i].returnLocationHelpers));
        }
        this.continutionofOpenModal(array, key, allocateKey, i);
      }
      else {
        this.toastr.error("Enter Return Quantity!!")
      }
    }
  }
  continutionofOpenModal(array, key, allocateKey, i) {
    this.pageForTableForReceive = 1;
    this.pageForTableForReturn = 1;
    if (allocateKey) {
      this.isAllocateObject = true;
    }
    this.lineQuantity = ((key == 'Recieve') ? this[array][i].receivedQuantity : this[array][i].returnQuantity) + ' ' + this[array][i].inventoryUnit;
    const req = this.headerForm.value;
    if (typeof (req.shipToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.shipToAddress = this.setJsonto(req.shipToAddress)
    }
    else {
      if (typeof (req.shipToAddress) != 'object') {
        req.shipToAddress = this.goodsReceiptData ? this.goodsReceiptData.shipToAddress : null;
      }
    }
    if (typeof (req.shipFromAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.shipFromAddress = this.setJsonFrom(req.shipFromAddress)
    }
    else {
      if (typeof (req.shipFromAddress) != 'object') {
        req.shipFromAddress = this.goodsReceiptData ? this.goodsReceiptData.shipFromAddress : null;
      }
    }
    if (typeof (req.billToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.billToAddress = this.setBillTo(req.billToAddress)
    }
    else {
      if (typeof (req.billToAddress) != 'object') {
        req.billToAddress = this.goodsReceiptData ? this.goodsReceiptData.billToAddress : null;
      }
    }
    if (this[array][i].supplierReceivedQuantity || this[array][i].supplierReturnQuantity) {
      this.globalUpdateIndex = i;
    }
    else {
      this.globalUpdateIndex = -1;
    }
    req.goodsReceiptLines = [this[array][i]];
    if (key == 'Recieve') {
      this.selectedReceiveRecords = JSON.parse(JSON.stringify(this.finalReceiveLocations));
    }
    else {
      this.selectedReturnRecords = JSON.parse(JSON.stringify(this.finalReturnLocations));
    }
    if ((this[array][i].receivedQuantity && this[array][i].supplierReceivedQuantity != 0) || (this[array][i].returnQuantity && this[array][i].supplierReturnQuantity != 0)) {
      if (req.goodsReceiptLines && req.goodsReceiptLines.length > 0) {
        req.goodsReceiptLines.forEach(formLine => {
          formLine['vehicleInfo'] = formLine.vehicleNumber ? this.mapId('vehicle', formLine.vehicleNumber) : null;
          delete formLine.vehicleNumber;
          formLine['equipmentInfo'] = formLine.containerNumber ? this.mapId('equipment', formLine.containerNumber) : null;
          delete formLine.containerNumber;
          formLine['serviceProviderInfo'] = formLine.transport ? this.mapId('serviceID', formLine.transport) : null;
          delete formLine.transport;
          if (formLine.supplierIDName) {
            formLine.supplierMasterInfo = this.onSupplierIDNameChangeOnLine(formLine.supplierIDName);
          }
          if (formLine.purchaseTaxes && formLine.purchaseTaxes.length > 0) {
            if (typeof (formLine.purchaseTaxes[0]) == 'string') {
              const purchase = JSON.parse(JSON.stringify(formLine.purchaseTaxes));
              formLine.purchaseTaxes = [];
              purchase.forEach(inner => {
                if (typeof (inner) == 'string') {
                  formLine.purchaseTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
                }
                else {
                  formLine.purchaseTaxes.push(inner);
                }
              });
            }
          }
          if (typeof (formLine.serialNumbers) == 'string' && formLine.serialNumbers != "") {
            formLine.serialNumbers = formLine.serialNumbers.split(',');
          }
          if (formLine.serialNumbers == "") {
            formLine.serialNumbers = null;
          }
        });
      }
      if (req.goodsReceiptManagementLines && req.goodsReceiptManagementLines.length > 0) {
        req.goodsReceiptManagementLines.forEach(formLine => {
          if (formLine.purchaseTaxes && formLine.purchaseTaxes.length > 0) {
            if (typeof (formLine.purchaseTaxes[0]) == 'string') {
              const purchase = JSON.parse(JSON.stringify(formLine.purchaseTaxes));
              formLine.purchaseTaxes = [];
              purchase.forEach(inner => {
                if (typeof (inner) == 'string') {
                  formLine.purchaseTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
                }
                else {
                  formLine.purchaseTaxes.push(inner);
                }
              });
            }
          }
          if (typeof (formLine.serialNumbers) == 'string' && formLine.serialNumbers != "") {
            formLine.serialNumbers = formLine.serialNumbers.split(',');
          }
          if (formLine.serialNumbers == "") {
            formLine.serialNumbers = null;
          }
        });
      }
      if (key == 'Recieve') {
        this.fetchAllReceiveLocations(req, null, 'true', 'forTable');
      }
      else {
        this.fetchAllReturnLocations(req, null, 'true', 'forTable');
      }
    }
  }
  getUnitPriceForTable(line, i) {
    console.log(this.arrayForTable[i]);
    if (this.arrayForTable[i].uomConversionAvailability == 'Yes') {
      this.calculateReceivedQtyFortable(null, i);
    }
  }
  calculateReceivedQtyFortable(key, i, forBarcode?) {
    if (key) {
      if (this.arrayForTable[i].returnLocationAllocationType == 'Manual') {
        this.arrayForTable[i].returnLocationHelpers = null;
        this.finalReturnObj = null;
        this.selectedReturnRecords = [];
        this.finalReturnLocations = [];
        this.arrayForTable[i].savedReturnLocations = [];
      }
    }
    else {
      if (this.arrayForTable[i].receiveLocationAllocationType == 'Manual') {
        this.arrayForTable[i].receiveLocationHelpers = null;
        this.finalReceiveObj = null;
        this.selectedReceiveRecords = [];
        this.finalReceiveLocations = [];
        this.arrayForTable[i].savedReceiveLocations = [];
      }
    }
    const req = this.headerForm.value;
    if (req.receivedType && req.receivedType == 'Manual') {
      this.arrayForTable[i].orderedQuantity = DecimalUtils.add(this.arrayForTable[i].supplierReceivedQuantity, this.arrayForTable[i].supplierReturnQuantity)
      this.arrayForTable[i].shippedQuantity = this.arrayForTable[i].orderedQuantity;
    }
    if (DecimalUtils.lessThanOrEqual((DecimalUtils.add(this.arrayForTable[i].supplierReceivedQuantity, this.arrayForTable[i].supplierReturnQuantity)), this.arrayForTable[i].orderedQuantity)) {

      this.wmsService.fetchProductDetailsById(this.arrayForTable[i].productMasterInfo['productMasterID'], this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productMaster) {
            let filteredProduct = response.data.productMaster;
            if (filteredProduct && filteredProduct.inventoryUnit && this.arrayForTable[i].receivingUnit) {
              let CF = null;
              if (filteredProduct.inventoryUnit == this.arrayForTable[i].receivingUnit) {
                CF = DecimalUtils.valueOf(1);
              }
              else {
                const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === this.arrayForTable[i].receivingUnit &&
                  uom.unitConversionTo === filteredProduct.inventoryUnit && uom.productMasterInfo.productIDName === filteredProduct.productIDName);
                CF = filteredUOMConversion ? filteredUOMConversion.conversionFactor : null;
              }
              if (CF) {
                if (key && this.arrayForTable[i].supplierReturnQuantity) {
                  this.arrayForTable[i].returnQuantity = DecimalUtils.multiply(this.arrayForTable[i].supplierReturnQuantity, CF);
                  const roundedValue = DecimalUtils.divide(filteredProduct.palletQuantity, (DecimalUtils.multiply(this.arrayForTable[i].supplierReturnQuantity, CF)));
                  if (roundedValue.toString().includes('.')) {
                    const splitNumber = roundedValue.toString().split('.')[0];
                    this.arrayForTable[i].noOfReturnLocationsRequired = DecimalUtils.add(splitNumber, 1);
                  }
                  else {
                    this.arrayForTable[i].noOfReturnLocationsRequired = roundedValue;
                  }
                  if (this.arrayForTable[i].noOfReturnLocationsRequired == 'Infinity') {
                    this.arrayForTable[i].noOfReturnLocationsRequired = 0;
                  }
                }
                else {
                  if (this.arrayForTable[i].supplierReceivedQuantity) {
                    this.arrayForTable[i].receivedQuantity = DecimalUtils.multiply(this.arrayForTable[i].supplierReceivedQuantity, CF);
                    const receivedRounded = DecimalUtils.divide(filteredProduct.palletQuantity, (DecimalUtils.multiply(this.arrayForTable[i].supplierReceivedQuantity, CF)));

                    if (receivedRounded.toString().includes('.')) {
                      const splitNumber = receivedRounded.toString().split('.')[0];
                      this.arrayForTable[i].noOfReceiveLocationsRequired = DecimalUtils.add(splitNumber, 1);
                    }
                    else {
                      this.arrayForTable[i].noOfReceiveLocationsRequired = receivedRounded;
                    }
                  }
                }
                let filteredSUpplierProd = null;
                if (this.supplierProductsDetails.productMasterInfos && this.supplierProductsDetails.productMasterInfos.length > 0) {
                  filteredSUpplierProd = this.supplierProductsDetails.productMasterInfos.find(x => x.productIDName == this.arrayForTable[i].productMasterInfo.productIDName);
                }
                if ((this.headerForm.value.wareHouseTransferSourceInfo && this.headerForm.value.wareHouseTransferSourceInfo.wareHouseIDName) || (this.headerForm.value.customerMasterInfo && this.headerForm.value.customerMasterInfo.customerIDName)) {

                }
                else {
                  // if (filteredSUpplierProd && filteredSUpplierProd.price) {
                  //   this.arrayForTable[i].orderUnitPrice = DecimalUtils.multiply(filteredSUpplierProd.price, filteredUOMConversion.conversionFactor);
                  //   this.arrayForTable[i].unitPrice = this.arrayForTable[i].unitPrice ? this.arrayForTable[i].unitPrice : filteredSUpplierProd.price;
                  // }
                  // else {
                  //   this.arrayForTable[i].orderUnitPrice = null;
                  //   this.arrayForTable[i].unitPrice = null
                  // }
                }
                this.noMatchingUnitError = false;
              } else {
                if (this.arrayForTable[i].uomConversionAvailability == 'Yes') {
                  this.toastr.error('No matching Unit Conversion Factor');
                  this.noMatchingUnitError = true;
                }
                else {
                  this.getCFCountForTable(this.arrayForTable[i], i, key);
                }
              }
              this.receivableQuantityCalForTable(i, forBarcode);
            }
            this.onSelect(true, i);
          }
        })
    }
    else {
      this.toastr.error("Ordered quantity should be greater than or equal to Supplier received quantity plus return quantity")
      if (key) {
        this.arrayForTable[i].supplierReturnQuantity = null;
      }
      else {
        this.arrayForTable[i].supplierReceivedQuantity = null;
      }
      this.onSelect(false, i);
    }
  }
  closeEvent(modalType) {
    const array = this.isAllocateObject ? 'grManagementLines' : 'arrayForTable';
    if (modalType == 'recieveLocationsModal') {
      if (this.finalReceiveLocations.length > 0) {
        if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) || this.isAllocateObject) {
          this[array][this.globalUpdateIndex].receiveLocationHelpers = this.finalReceiveLocations;
        }
        else {
          this.receivingForm.controls.receiveLocationHelpers.setValue(this.finalReceiveLocations);
        }
      }
      this.ngxSmartModalService.getModal('recieveLocationsModal').close();
      this.searchKeyForReceive = null;

    }
    else {
      if (this.finalReturnLocations.length) {
        if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) || this.isAllocateObject) {
          this[array][this.globalUpdateIndex].returnLocationHelpers = this.finalReturnLocations;
        }
        else {
          this.receivingForm.controls.returnLocationHelpers.setValue(this.finalReturnLocations);
        }
      }
      this.ngxSmartModalService.getModal('returnLocationsModal').close();
      this.searchKeyForReturn = null;
    }
  }
  receivableQuantityCalForTable(i, forBarcode?) {
    if (this.globalUpdateIndex != -1 && this.globalUpdateIndex != i) {
    }
    else {
      if (DecimalUtils.lessThanOrEqual((DecimalUtils.add(this.arrayForTable[i].supplierReceivedQuantity, this.arrayForTable[i].supplierReturnQuantity)), this.arrayForTable[i].orderedQuantity)) {
        this.calculateForTable(i, forBarcode);
        this.onSelect(true, i);
      }
    }
  }
  getFilter() {
    if (!this.dummyProductIDName) {
      this.arrayForTable = this.overAllarrayForTable;
    }
    else {
      this.arrayForTable = this.overAllarrayForTable.filter(x => x.productMasterInfo.productIDName == this.dummyProductIDName);
    }
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
          serviceProviderID: name,
          "serviceProviderName": null,
          "serviceProviderIDName": null,
        }
      }

    }
  }
  calculateForTable(i, forBarcode) {
    let amount: any = 0;
    let taxes: any = 0;
    let taxPercentage: any = 0;
    const soLine = this.arrayForTable[i];
    let qty: any = 0;
    if (soLine.supplierReceivedQuantity) {
      qty = DecimalUtils.add(qty, soLine.supplierReceivedQuantity);
    }
    if (soLine.supplierReturnQuantity) {
      qty = DecimalUtils.add(qty, soLine.supplierReturnQuantity);
    }
    if (soLine.orderUnitPrice && qty) {
      amount = DecimalUtils.multiply(soLine.orderUnitPrice, qty);
      this.arrayForTable[i].grossAmount = amount;

      if (soLine.discount) {
        amount = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(soLine.discount, 100)), amount);
        const discountAmount = DecimalUtils.subtract(this.arrayForTable[i].grossAmount, amount);
        this.arrayForTable[i].discountAmount = discountAmount;
      }
      if (soLine.purchaseTaxes && soLine.purchaseTaxes.length > 0) {
        soLine.purchaseTaxes.forEach(el => {
          taxPercentage = DecimalUtils.add(taxPercentage, (el.taxPercentage ? el.taxPercentage : 0));
        });
        this.arrayForTable[i].taxPercentage = taxPercentage;
        soLine.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);

        this.arrayForTable[i].taxAmount = (soLine.taxAmount)
        taxes = soLine.taxAmount;
      }
      this.arrayForTable[i].netAmount = (DecimalUtils.add(amount, taxes));
      if (forBarcode) {
        this.saveFirst(forBarcode);
      }
    }
    else {

      this.arrayForTable[i].netAmount = null;
      this.arrayForTable[i].grossAmount = null;
      this.arrayForTable[i].taxAmount = null;
      this.arrayForTable[i].taxPercentage = null;
      this.arrayForTable[i].discountAmount = null;
    }
  }
  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }
  getExpiryLimit(i?) {
    if (i) {
      if (this.arrayForTable[i].mfgDate) {
        return new Date(this.arrayForTable[i].mfgDate).toISOString().split('T')[0];
      }
    }
    else {
      if (this.receivingForm.controls.mfgDate.value) {
        return new Date(this.receivingForm.controls.mfgDate.value).toISOString().split('T')[0];
      }
    }
  }
  getExpiryDate(event) {
    if (event && this.shelfLife) {
      let result = new Date(event);
      result.setDate(result.getDate() + this.shelfLife);
      this.receivingForm.controls.expiryDate.setValue(this.datePipe.transform(new Date(result), 'yyyy-MM-dd'));
    }
    else {
      this.receivingForm.controls.expiryDate.setValue(null);
    }
  }
  getExpiryDateInTableView(event, i) {
    let filteredProd = null;
    this.wmsService.fetchProductDetailsById(this.arrayForTable[i].productMasterInfo.productMasterID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMaster) {
          filteredProd = response.data.productMaster;
          if (event && filteredProd.shelfLife) {
            let result = new Date(event);
            result.setDate(result.getDate() + filteredProd.shelfLife);
            this.arrayForTable[i].expiryDate = this.datePipe.transform(new Date(result), 'yyyy-MM-dd');
          }
          else {
            this.arrayForTable[i].expiryDate = null;
          }
        }
        this.onSelect(true, i);
      })
  }
  getSerialNumbers() {
    this.receivingForm.controls.serialNumbers.patchValue(this.sNumber.split(','));
  }
  recieveLocationsByLocationName(event) {
    if (event) {
      this.receiveLocations = this.receiveLocations.filter(x => x.locationName == event.originalObject);
    }
    else {
      this.receiveLocations = this.recieveALLocations
    }
  }

  returnLocationsByLocationName(event) {
    if (event) {
      this.returnLocations = this.returnLocations.filter(x => x.locationName == event.originalObject);
    }
    else {
      this.returnLocations = this.returnALLocations
    }
  }

  read(event, data1) {
    this.receiveLocations.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.receiveLocations.find(x => x.isEdit == true);
      if (currentItem && (currentItem.quantity == null)) {
        this.toastr.warning("Please enter Required Quantity");
      }
      this.receiveLocations.map(element => element.isEdit = false);
      data1.isEdit = true;
      if (currentItem && currentItem.quantity) {
        if (event.target.checked && data1.quantity) {
          data1.isChecked = event.target.value;
        }
        else if (event.target.checked && !data1.quantity) {
          data1.isChecked = event.target.value;
          data1.isEdit = true;
        }
        else {
          data1.isChecked = false;
          data1.isEdit = false;
          data1['quantity'] = '';
        }
      }
    }
    else {
      data1.isChecked = false;
      data1.isEdit = false;
      data1.quantity = null;
    }
    if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
      this.selectedReceiveRecords = this.selectedReceiveRecords.filter(x => x._id != data1._id);
    }
    if (this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) {
      if (this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers && this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers.length > 0) {
        this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers = this.arrayForTable[this.globalUpdateIndex].receiveLocationHelpers.filter(x => x._id != data1._id);
      }
    }
    else {
      if (this.receivingForm.controls.receiveLocationHelpers.value && this.receivingForm.controls.receiveLocationHelpers.value.length > 0) {
        this.receivingForm.controls.receiveLocationHelpers.setValue(this.receivingForm.controls.receiveLocationHelpers.value.filter(x => x._id != data1._id));
      }
    }
    this.receiveLocations.forEach(element => {
      if (element.quantity) {
        element.isChecked = true;
      }
    });
  }
  read1(event, data1) {
    this.returnLocations.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.returnLocations.find(x => x.isEdit == true);
      if (currentItem && (currentItem.quantity == null)) {
        this.toastr.warning('Please enter Picked Quantity');
      }
      this.returnLocations.map(element => element.isEdit = false);
      data1.isEdit = true;
      if (currentItem && currentItem.quantity) {
        if (event.target.checked && data1.quantity) {
          data1.isChecked = event.target.value;
        }
        else if (event.target.checked && !data1.quantity) {
          data1.isChecked = event.target.value;
          data1.isEdit = true;
        }
        else {
          data1.isChecked = false;
          data1.isEdit = false;
          data1['quantity'] = '';
        }
      }
    }
    else {
      data1.isChecked = false;
      data1.isEdit = false;
      data1.quantity = null;
    }
    if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
      this.selectedReturnRecords = this.selectedReturnRecords.filter(x => x._id != data1._id);
    }
    if (this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) {
      if (this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers && this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers.length > 0) {
        this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers = this.arrayForTable[this.globalUpdateIndex].returnLocationHelpers.filter(x => x._id != data1._id);
      }
    }
    else {
      if (this.receivingForm.controls.returnLocationHelpers.value && this.receivingForm.controls.returnLocationHelpers.value.length > 0) {
        this.receivingForm.controls.returnLocationHelpers.setValue(this.receivingForm.controls.returnLocationHelpers.value.filter(x => x._id != data1._id));
      }
    }
    this.returnLocations.forEach(element => {
      if (element.quantity) {
        element.isChecked = true;
      }
    });
  }
  saveRecieveLocations() {
    let count: any = 0;
    if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
      this.selectedReceiveRecords.forEach(element => {
        count = DecimalUtils.add(count, element.quantity);
      });
    }
    else {
      this.receiveLocations.forEach(element => {
        if (element.isChecked) {
          count = DecimalUtils.add(count, element.quantity);
        }
      });
    }
    const array = this.isAllocateObject ? 'grManagementLines' : 'arrayForTable';
    let dummyCount = this.receivingForm.controls.receivedQuantity.value;
    if (this.isAllocateObject || !dummyCount) {
      dummyCount = this[array][this.globalUpdateIndex].receivedQuantity;
    }
    if (DecimalUtils.equals(count, dummyCount)) {
      this.ngxSmartModalService.getModal('recieveLocationsModal').close();
      this.searchKeyForReceive = null;
      this.toastr.success('Saved');
      let filteredRecieveLocations = (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) ? this.selectedReceiveRecords : this.receiveLocations.filter(x => x.isChecked == true);
      if (filteredRecieveLocations.length > 0) {
        this.recieveShowValues = filteredRecieveLocations.map(x => x.locationName).toString();
        filteredRecieveLocations.forEach(element => {
          delete element.isEdit;
          delete element.isChecked;
        });
      }
      if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) || this.isAllocateObject) {
        this[array][this.globalUpdateIndex].saveRecentReceive = true;
        this[array][this.globalUpdateIndex].receiveLocationHelpers = filteredRecieveLocations;
        this.onSelect(true, this.globalUpdateIndex);
      }
      else {
        this.receivingForm.controls.receiveLocationHelpers.setValue(filteredRecieveLocations);
      }
      this.finalReceiveLocations = JSON.parse(JSON.stringify(filteredRecieveLocations));
      this.selectedReceiveRecords = [];
    }
    else {
      this.toastr.error("Selected Locations Quantity should be equal Recieved Quantity");
      this.finalReceiveLocations = [];
    }
  }
  saveReturnLocations() {
    let count: any = 0;
    if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
      this.selectedReturnRecords.forEach(element => {
        count = DecimalUtils.add(count, element.quantity);
      });
    }
    else {
      this.returnLocations.forEach(element => {
        if (element.isChecked) {
          count = DecimalUtils.add(count, element.quantity);
        }
      });
    }
    const array = this.isAllocateObject ? 'grManagementLines' : 'arrayForTable';
    let dummyCount = this.receivingForm.controls.returnQuantity.value;
    if (this.isAllocateObject || !dummyCount) {
      dummyCount = this[array][this.globalUpdateIndex].returnQuantity;
    }
    if (DecimalUtils.equals(count, dummyCount)) {
      this.ngxSmartModalService.getModal('returnLocationsModal').close();
      this.searchKeyForReturn = null;
      this.toastr.success('Saved');
      let filteredReturnLocations = (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) ? this.selectedReturnRecords : this.returnLocations.filter(x => x.isChecked == true);
      if (filteredReturnLocations.length > 0) {
        this.returnShowValues = filteredReturnLocations.map(x => x.locationName).toString();
        filteredReturnLocations.forEach(element => {
          delete element.isEdit;
          delete element.isChecked;
        });
      }
      if ((this.globalUpdateIndex != -1 || this.globalUpdateIndex == 0) || this.isAllocateObject) {
        this[array][this.globalUpdateIndex].saveRecentReturn = true;
        this[array][this.globalUpdateIndex].returnLocationHelpers = filteredReturnLocations;
        this.onSelect(true, this.globalUpdateIndex);
      }
      else {
        this.receivingForm.controls.returnLocationHelpers.setValue(filteredReturnLocations);
      }
      this.finalReturnLocations = JSON.parse(JSON.stringify(this.selectedReturnRecords));
      this.selectedReturnRecords = [];
    }
    else {
      this.toastr.error("Selected Locations Quantity should be equal Return Quantity");
      this.finalReturnLocations = [];
    }
  }
  resetRecieveLocations(key) {
    if (key == 'Recieve') {
      this.receiveLocations.forEach(x => {
        x['isEdit'] = false;
        x['isChecked'] = false;
        x['quantity'] = null;
        x['packingRemarks'] = null;
      });
      this.recieveShowValues = null;
    }
    else {
      this.returnLocations.forEach(x => {
        x['isEdit'] = false;
        x['isChecked'] = false;
        x['quantity'] = null;
        x['packingRemarks'] = null;
      });
      this.returnShowValues = null;
    }
  }
  saveRemark(value, data, key) {
    data['packingRemarks'] = value;
    const arr = (key == 'Receive') ? 'selectedReceiveRecords' : 'selectedReturnRecords';
    if (this[arr] && this[arr].length > 0) {
      const FI = this[arr].findIndex(x => x._id == data._id)
      if (FI != -1) {
        this[arr][FI].packingRemarks = data.packingRemarks;
      }
    }
  }

  savequantity(value, data, key) {
    const arr = (key == 'Receive') ? 'selectedReceiveRecords' : 'selectedReturnRecords';
    if (data.usableSpaceCheck != 'Yes') {
      data['quantity'] = value;
      data['isChecked'] = true;
      if (data.maxDimensionCheck == 'Yes' || data.weightCheck == 'Yes') {
        this.onDocumentSelect(true, data);
      }
    }
    else {
      if (DecimalUtils.greaterThanOrEqual(data.allowableQuantity, value)) {
        data['quantity'] = value;
        data['isChecked'] = true;
        if (!this[arr]) {
          this[arr] = [];
        }
        if (this[arr] && this[arr].length > 0) {
          const FI = this[arr].findIndex(x => x._id == data._id)
          if (FI != -1 && (!data.quantity || data.quantity == "0")) {
            this[arr] = this[arr].filter(x => x._id != x._id);
          }
          else {
            if (FI == -1) {
              if (data.quantity && data.quantity != "0") {
                this[arr].push(data);
              }
            }
            else {
              if (data.quantity && data.quantity != "0") {
                this[arr][FI].quantity = data.quantity;
              }
            }
          }
        }
        else {
          if (data.quantity && data.quantity != "0") {
            this[arr].push(data);
          }
        }
        if (data.maxDimensionCheck == 'Yes' || data.weightCheck == 'Yes') {
          this.onDocumentSelect(true, data);
        }
      }
      else {
        data.isEdit = false;
        data['quantity'] = '';
        data['isChecked'] = false;
        this.toastr.error('Required Quantity should be less than Quantity')
      }
    }
  }
  onDocumentSelect(event, form) {
    if (event && form.quantity) {
      const locName = form.locationName + ':' + form.allowableQuantity;
      const array = this.isAllocateObject ? 'grManagementLines' : 'arrayForTable';
      let pID = this.receivingForm.controls.productMasterInfo.value.productMasterID;
      if (!pID) {
        pID = this[array][this.globalUpdateIndex].productMasterInfo.productMasterID
      }
      // (this.hidePanel || this.isAllocateObject) ? this[array][this.globalUpdateIndex].productMasterInfo.productMasterID : this.receivingForm.controls.productMasterInfo.value.productMasterID;
      this.wmsService.fetchCheckRecieveLoc(form.locationName, locName, pID,
        form.quantity, this.formObj).subscribe(res => {
          if (res.status == '0' && res.data.locationValidations) {
            if (res.data.locationValidations.validMaxDimension && res.data.locationValidations.validWeight) {
              form.isChecked = event;
            }
            else {
              form.quantity = '';
              form.isEdit = false;
              // this.toastr.error('Unable to Add')
              this.toastr.error('Received Quantity Should not be greather than Order Quantity')
              form.isChecked = false;
            }
          }
        })
    }
    else {
      if (event) {
        delete form.isChecked;
        this.toastr.error('Enter Required Quantity')
      }
      else {
        form.isEdit = false;
        form['quantity'] = '';
      }
    }
  }
  selectCheck(i) {
    this.onSelect(true, i);
  }
  onSupplierIDNameChangeOnLine(event) {
    if (event) {
      const filteredSupplier = this.suppliers.find(sup => sup.supplierIDName === event);
      if (filteredSupplier) {
        return {
          supplierID: filteredSupplier.supplierID, supplierName: filteredSupplier.supplierName,
          supplierMasterID: filteredSupplier._id, supplierIDName: event
        }
      }
      else {
        return null
      }
    }
  }
  saveFirst(forBarcode?) {
    if (this.receivingForm.value.productMasterInfo.productIDName && !forBarcode) {
      this.save([this.receivingForm.value]);
    }
    else {
      let arr = this.arrayForTable.filter(x => x.isChecked);
      if (this.selectedLinesArray.length > 0) {
        arr = this.selectedLinesArray;
      }
      if (arr && arr.length > 0) {
        this.save(arr);
      }
      else {
        this.toastr.error('No Data to Proceed');
      }
    }
  }
  save(arr) {
    if (this.permissionsList.includes('Update')) {
      if (this.id && this.onlyHeaderUpdateToggle) {
        const form = this.headerForm.value;
        if (typeof (form.shipToAddress) == 'string' && form.supplierMasterInfo && form.supplierMasterInfo.supplierIDName) {
          form.shipToAddress = this.setJsonto(form.shipToAddress)
        }
        else {
          if (typeof (form.shipToAddress) != 'object') {
            form.shipToAddress = this.goodsReceiptData ? this.goodsReceiptData.shipToAddress : null;
          }
        }
        if (typeof (form.shipFromAddress) == 'string' && form.supplierMasterInfo && form.supplierMasterInfo.supplierIDName) {
          form.shipFromAddress = this.setJsonFrom(form.shipFromAddress)
        }
        else {
          if (typeof (form.shipFromAddress) != 'object') {
            form.shipFromAddress = this.goodsReceiptData ? this.goodsReceiptData.shipFromAddress : null;
          }
        }
        if (typeof (form.billToAddress) == 'string' && form.supplierMasterInfo && form.supplierMasterInfo.supplierIDName) {
          form.billToAddress = this.setBillTo(form.billToAddress)
        }
        else {
          if (typeof (form.billToAddress) != 'object') {
            form.billToAddress = this.goodsReceiptData ? this.goodsReceiptData.billToAddress : null;
          }
        }
        form['vehicleInfo'] = form.vehicleNumber ? this.mapId('vehicle', form.vehicleNumber) : null;
        delete form.vehicleNumber;
        form['equipmentInfo'] = form.containerNumber ? this.mapId('equipment', form.containerNumber) : null;
        delete form.containerNumber;
        form['serviceProviderInfo'] = form.serviceProviderID ? this.mapId('serviceID', form.serviceProviderID) : null;
        delete form.serviceProviderID;
        form.receiptDate = form.receiptDate ? new Date(form.receiptDate) : null;
        form.invoiceDate = form.invoiceDate ? new Date(form.invoiceDate) : null;
        form.grnDate = form.grnDate ? new Date(form.grnDate) : null;
        form.billOfEntryDate = form.billOfEntryDate ? new Date(form.billOfEntryDate) : null;
        form.billOfLandingDate = form.billOfLandingDate ? new Date(form.billOfLandingDate) : null;
        form.goodsReceiptLines = this.overGoodsReceiptLines;
        let totalAmount: any = 0;
        let grossAmount: any = 0;
        let taxAmount: any = 0;
        let discount: any = 0;
        let discountAmount: any = 0;
        let taxPercentage: any = 0;
        let purchaseTaxes = [];
        if (form.goodsReceiptLines.length > 0) {
          form.goodsReceiptLines.forEach(product => {
            delete product.savedReceiveLocations;
            delete product.saveRecentReceive;
            delete product.saveRecentReturn;
            delete product.savedReturnLocations;
            delete product.productImageResource;
            if (product.supplierIDName) {
              product.supplierMasterInfo = this.onSupplierIDNameChangeOnLine(product.supplierIDName);
            }
            delete product.supplierIDName;
            totalAmount = DecimalUtils.add(totalAmount, product.netAmount);
            grossAmount = DecimalUtils.add(grossAmount, product.grossAmount);
            taxAmount = DecimalUtils.add(taxAmount, product.taxAmount);
            if (product.discount && product.discountAmount) {
              discount = DecimalUtils.add(discount, product.discount);
              discountAmount = DecimalUtils.add(discountAmount, product.discountAmount);
            }

            taxPercentage = DecimalUtils.add(taxPercentage, product.taxPercentage);
            if (product.purchaseTaxes && product.purchaseTaxes.length) {
              purchaseTaxes = [...purchaseTaxes, ...product.purchaseTaxes];
            }
          });
        }
        let grouped = purchaseTaxes.reduce(
          (result: any, currentValue: any) => {
            (result[currentValue['taxNamePercentage']] = result[currentValue['taxNamePercentage']] || []).push(currentValue);
            return result;
          }, {});
        form['totalNetAmount'] = totalAmount;
        form['totalGrossAmount'] = grossAmount;
        form['totalTaxAmount'] = taxAmount;
        form['totalDiscount'] = discount;
        form['totalDiscountAmount'] = discountAmount;
        form['totalTaxPercentage'] = taxPercentage;
        if (grouped) {
          form['totalPurchaseTaxes'] = [];
          const headers = Object.keys(grouped);
          headers.forEach(element => {
            let taxA: any = 0;
            grouped[element].forEach(tax => {
              taxA = DecimalUtils.add(taxA, tax.taxAmount);
            });
            form['totalPurchaseTaxes'].push({
              taxAmount: taxA,
              taxName: element.split(':')[0],
              taxNamePercentage: element,
              taxPercentage: element.split(':')[1],
            })
          });
        }

        this.wmsService.saveOrUpdateGoodsReceipt(JSON.stringify(form)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data) {
              this.toastr.success("Updated Successfully");
              this.selectAllCheckboxValue = false;
              this.includeExportData = [];
              this.selectedLinesArray = [];
              this.onlyHeaderUpdateToggle = true;
              const formValue = response['data']['goodsReceipt'];
              this.headerForm.patchValue(formValue);
              if (this.showImage) {
                const element = <HTMLImageElement>(document.getElementById('pLogo'));
                element.src = null;
              }
              if (this.goodsReceiptData.shipToAddress) {
                this.headerForm.controls.shipToAddress.setValue(this.goodsReceiptData.shipToAddress.name);
              }
              if (this.goodsReceiptData.shipFromAddress) {
                this.headerForm.controls.shipFromAddress.setValue(this.goodsReceiptData.shipFromAddress.name);
              }
              if (this.goodsReceiptData.billToAddress) {
                this.headerForm.controls.billToAddress.setValue(this.goodsReceiptData.billToAddress.name);
              }
              this.headerForm.controls.vehicleNumber.setValue(formValue.vehicleInfo ? formValue.vehicleInfo.vehicleNumber : null);
              this.headerForm.controls.receiptDate.setValue(formValue.receiptDate ? this.apexService.getDateFromMilliSec(formValue.receiptDate) : null);
              this.headerForm.controls.containerNumber.setValue(formValue.equipmentInfo ? formValue.equipmentInfo.equipmentID : null);
              this.headerForm.controls.invoiceDate.setValue(formValue.invoiceDate ? this.apexService.getDateFromMilliSec(formValue.invoiceDate) : null);
              this.headerForm.controls.serviceProviderID.setValue(formValue.serviceProviderInfo ? formValue.serviceProviderInfo.serviceProviderID : null);
              this.headerForm.controls.billOfEntryDate.setValue(formValue.billOfEntryDate ? this.apexService.getDateFromMilliSec(formValue.billOfEntryDate) : null);
              this.headerForm.controls.billOfLandingDate.setValue(formValue.billOfLandingDate ? this.apexService.getDateFromMilliSec(formValue.billOfLandingDate) : null);
              this.finalReceiveLocations = [];
              this.finalReturnLocations = [];
              if (this.addValuesCheck) {
                this.callAllValues();
              }
            } else if (response && response.status === 2 && response.statusMsg) {
              this.toastr.error(response.statusMsg);
            } else {
              this.toastr.error('Failed in updating product');
            }
          },
          (error) => {
            this.toastr.error('Failed in updating product');
          }
        );
      }
      else {
        const req = JSON.parse(JSON.stringify(this.headerForm.value));
        if (typeof (req.shipToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
          req.shipToAddress = this.setJsonto(req.shipToAddress)
        }
        else {
          if (typeof (req.shipToAddress) != 'object') {
            req.shipToAddress = this.goodsReceiptData ? this.goodsReceiptData.shipToAddress : null;
          }
        }
        if (typeof (req.shipFromAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
          req.shipFromAddress = this.setJsonFrom(req.shipFromAddress)
        }
        else {
          if (typeof (req.shipFromAddress) != 'object') {
            req.shipFromAddress = this.goodsReceiptData ? this.goodsReceiptData.shipFromAddress : null;
          }
        }
        if (typeof (req.billToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
          req.billToAddress = this.setBillTo(req.billToAddress)
        }
        else {
          if (typeof (req.billToAddress) != 'object') {
            req.billToAddress = this.goodsReceiptData ? this.goodsReceiptData.billToAddress : null;
          }
        }
        req['vehicleInfo'] = req.vehicleNumber ? this.mapId('vehicle', req.vehicleNumber) : null;
        delete req.vehicleNumber;
        req['equipmentInfo'] = req.containerNumber ? this.mapId('equipment', req.containerNumber) : null;
        delete req.containerNumber;
        req['serviceProviderInfo'] = req.serviceProviderID ? this.mapId('serviceID', req.serviceProviderID) : null;
        delete req.serviceProviderID;
        req.receiptDate = req.receiptDate ? new Date(req.receiptDate) : null;
        req.goodsReceiptLines = JSON.parse(JSON.stringify(arr));
        if (req.goodsReceiptLines && req.goodsReceiptLines.length > 0) {
          req.goodsReceiptLines.forEach(formLine => {
            formLine['vehicleInfo'] = formLine.vehicleNumber ? this.mapId('vehicle', formLine.vehicleNumber) : null;
            delete formLine.vehicleNumber;
            formLine['equipmentInfo'] = formLine.containerNumber ? this.mapId('equipment', formLine.containerNumber) : null;
            delete formLine.containerNumber;
            formLine['serviceProviderInfo'] = formLine.transport ? this.mapId('serviceID', formLine.transport) : null;
            delete formLine.transport;
            const filteredP = this.productFromMaster;
            if (filteredP) formLine.productMasterInfo.productMasterID = filteredP._id;

            if (formLine.purchaseTaxes && formLine.purchaseTaxes.length > 0) {
              const purchase = JSON.parse(JSON.stringify(formLine.purchaseTaxes));
              formLine.purchaseTaxes = [];
              purchase.forEach(inner => {
                if (typeof (inner) == 'string') {
                  formLine.purchaseTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
                }
                else {
                  formLine.purchaseTaxes.push(inner);
                }
              });
            }
          });
        }
        let proceed = true;
        if (req && req.goodsReceiptLines.length > 0 && req.goodsReceiptLines.find(x => (x.supplierReceivedQuantity && x.supplierReceivedQuantity != 0) || (x.supplierReturnQuantity && x.supplierReturnQuantity != 0))) {
          req.goodsReceiptLines.forEach(grnLine => {
            grnLine.mfgDate = grnLine.mfgDate ? new Date(grnLine.mfgDate) : null;
            grnLine.expiryDate = grnLine.expiryDate ? new Date(grnLine.expiryDate) : null;
            grnLine.grnDate = grnLine.grnDate ? new Date(grnLine.grnDate) : null;
            if (proceed) {
              if ((grnLine.supplierReceivedQuantity && grnLine.supplierReceivedQuantity != 0) || (grnLine.totalReturnQuantity && grnLine.totalReturnQuantity != 0)
                || (grnLine.supplierReturnQuantity && grnLine.supplierReturnQuantity != 0)) {
                grnLine.shippedQuantity = DecimalUtils.add(grnLine.supplierReceivedQuantity, grnLine.supplierReturnQuantity);
                if (req.receivedType && req.receivedType == 'Manual') {
                  grnLine.orderedQuantity = DecimalUtils.add(grnLine.supplierReceivedQuantity, grnLine.supplierReturnQuantity);
                }
                if (!grnLine.mfgDate || !grnLine.expiryDate ||
                  (grnLine.mfgDate && grnLine.expiryDate && grnLine.mfgDate <= grnLine.expiryDate)) {

                  if (DecimalUtils.lessThanOrEqual((DecimalUtils.add(grnLine.supplierReceivedQuantity, grnLine.supplierReturnQuantity)), grnLine.orderedQuantity)) {
                    // grnLine.receiveLocationHelpers = this.finalReceiveLocations.length > 0 ? this.finalReceiveLocations : (grnLine.savedReceiveLocations && grnLine.savedReceiveLocations.length > 0 ? grnLine.savedReceiveLocations : grnLine.receiveLocationHelpers);

                    if (grnLine.receiveLocationAllocationType == 'Manual' && grnLine['saveRecentReceive'] == false) {
                      grnLine.receiveLocationHelpers = grnLine.savedReceiveLocations;
                    }
                    if (grnLine.returnLocationAllocationType == 'Manual' && grnLine['saveRecentReturn'] == false) {
                      grnLine.returnLocationHelpers = grnLine.savedReturnLocations;
                    }
                    if (grnLine.receiveLocationAllocationType == 'Manual' && (grnLine.receiveLocationHelpers == null || grnLine.receiveLocationHelpers == 'null' ||
                      grnLine.receiveLocationHelpers.length == 0) && (grnLine.supplierReceivedQuantity || grnLine.supplierReceivedQuantity > 0)) {
                      if (grnLine.poLineNumber) {
                        this.toastrMsg = `${grnLine.poLineNumber} - Select Receive Locations`;
                      }
                      else {
                        this.toastrMsg = `Select Receive Locations`;
                      }
                      proceed = false;
                      grnLine.receiveLocationHelpers = [];
                    }
                    else {
                      if (grnLine.returnLocationAllocationType == 'Manual' && (grnLine.returnLocationHelpers == null || grnLine.returnLocationHelpers == 'null' ||
                        grnLine.returnLocationHelpers.length == 0) && (grnLine.supplierReturnQuantity || grnLine.supplierReturnQuantity > 0)) {
                        if (grnLine.poLineNumber) {
                          this.toastrMsg = `${grnLine.poLineNumber} - Select Return Locations`;
                        }
                        else {
                          this.toastrMsg = `Select Return Locations`;
                        }
                        proceed = false;
                        grnLine.returnLocationHelpers = [];
                      }
                      else {
                        if (grnLine.returnLocationAllocationType == 'Auto') {
                          grnLine.returnLocationHelpers = null;
                        }
                        else {
                          if (grnLine.returnLocationHelpers && grnLine.returnLocationHelpers.length > 0) {
                            grnLine.returnLocationHelpers.forEach(ret => {
                              delete ret.isChecked;
                              delete ret.isEdit;
                            });
                            let count: any = 0;
                            let dummyCount = grnLine.supplierReturnQuantity;
                            grnLine.returnLocationHelpers.forEach(element => {
                              count = DecimalUtils.add(count, element.quantity);
                            });
                            if (DecimalUtils.equals(count, dummyCount)) {
                              proceed = true;
                            }
                            else {
                              if (grnLine.poLineNumber) {
                                this.toastrMsg = `${grnLine.poLineNumber} - Select Return Locations`;
                              }
                              else {
                                this.toastrMsg = `Select Return Locations`;
                              }
                              proceed = false;
                              grnLine.returnLocationHelpers = [];
                            }
                          }
                        }
                        if (proceed) {
                          if (grnLine.receiveLocationAllocationType == 'Auto') {
                            grnLine.receiveLocationHelpers = null;
                          }
                          else {
                            if (grnLine.receiveLocationHelpers && grnLine.receiveLocationHelpers.length > 0) {
                              grnLine.receiveLocationHelpers.forEach(ret => {
                                delete ret.isChecked;
                                delete ret.isEdit;
                              });
                              let count: any = 0;
                              let dummyCount = grnLine.receivedQuantity;
                              grnLine.receiveLocationHelpers.forEach(element => {
                                count = DecimalUtils.add(count, element.quantity);
                              });
                              if (DecimalUtils.equals(count, dummyCount)) {
                                proceed = true;
                              }
                              else {
                                if (grnLine.poLineNumber) {
                                  this.toastrMsg = `${grnLine.poLineNumber} - Select Receive Locations`;
                                }
                                else {
                                  this.toastrMsg = `Select Receive Locations`;
                                }
                                proceed = false;
                                grnLine.receiveLocationHelpers = [];
                              }
                            }
                          }
                          if (proceed && DecimalUtils.lessThanOrEqual(grnLine.supplierReceivedQuantity, grnLine.orderedQuantity)) {
                            if ((!grnLine.supplierReceivableQuantity || (grnLine.supplierReceivableQuantity && grnLine.supplierReceivableQuantity == 0)) ||
                              (grnLine.supplierReceivableQuantity && DecimalUtils.lessThanOrEqual(grnLine.supplierReceivedQuantity, grnLine.supplierReceivableQuantity))) {
                              if (((this.serialNumberCheck == 'Yes') || (grnLine.serialNumberCheck == 'Yes')) && grnLine.receivedQuantity && grnLine.receivedQuantity != 0) {
                                if (typeof (grnLine.serialNumbers) == 'string' && grnLine.serialNumbers != "") {
                                  grnLine.serialNumbers = grnLine.serialNumbers.split(',');
                                }
                                if (!grnLine.serialNumbers || grnLine.serialNumbers == "") {
                                  grnLine.serialNumbers = null;
                                }
                                if (grnLine.serialNumbers && grnLine.serialNumbers.length != 0) {
                                  if (grnLine.receivedQuantity == grnLine.serialNumbers.length) {
                                    // this.apiCall(req, 'lineUpdate');
                                    proceed = true;
                                  }
                                  else {
                                    this.toastrMsg = `${grnLine.poLineNumber} -Enter All Serial Numbers`;
                                    proceed = false;
                                  }
                                }
                                else {
                                  this.toastrMsg = `${grnLine.poLineNumber} - Enter Serial Numbers`;
                                  // this.toastr.error('Enter Serial Numbers');
                                  proceed = false;
                                }
                              }
                              else {
                                // this.apiCall(req, 'lineUpdate');
                                proceed = true;
                              }
                            }
                            else {
                              this.toastrMsg = `${grnLine.poLineNumber} - Supplier Received Quantity should not be greater than Supplier Receivable Quantity`;
                              proceed = false;
                            }
                          } else {
                            if (proceed) {
                              // this.toastr.error('Supplier received quantity should not be greater than ordered quantity');
                              this.toastrMsg = `${grnLine.poLineNumber} - Supplier received quantity should not be greater than ordered quantity`;
                              proceed = false;
                            }
                          }
                        }
                      }
                    }
                  }
                  // }
                  else {
                    proceed = false;
                    this.toastrMsg = `${grnLine.poLineNumber} - Ordered quantity should be greater than or equal to Supplier received quantity plus return quantity`
                    // this.toastr.error('Ordered quantity should be greater than or equal to Supplier received quantity plus return quantity');
                  }
                } else {
                  proceed = false;
                  this.toastrMsg = `${grnLine.poLineNumber} - Manufacturing date should be greater than Expiry date`;
                }
              }
              else {
                proceed = false;
                this.toastrMsg = `${grnLine.poLineNumber} - Enter Supplier Received Quantity or Return Quantity`;
              }
            }
          });
        }
        else {
          this.toastrMsg = `Fill the details`;
          proceed = false;
        }
        if (proceed) {
          this.apiCall(req, this.receivingForm.value.productMasterInfo.productIDName ? null : 'lineUpdate', 'fromSave');
        }
        else {
          this.toastr.error(this.toastrMsg);
        }
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions");
    }
  }
  apiCall(req, key?, fromSaveButton?) {
    if (!key) {
      req.goodsReceiptLines.forEach(element => {
        delete element.sequenceNumber
      });
    }
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    if (this.id && !fromSaveButton) {
      let finalUpdateObj = {};
      finalUpdateObj = req;
      finalUpdateObj['goodsReceiptLines'] = req.goodsReceiptLines;
      this.updateIndividualGRN({ ...finalUpdateObj, _id: this.id });
    } else {
      if (req)
        if (!fromSaveButton) {
          delete req._id;
        }
      this.saveContinuion(req);
    };
  }
  saveContinuion(req) {
    let totalAmount: any = 0;
    let grossAmount: any = 0;
    let taxAmount: any = 0;
    let discount: any = 0;
    let discountAmount: any = 0;
    let taxPercentage: any = 0;
    let purchaseTaxes = [];
    if (req.goodsReceiptLines.length > 0) {
      req.goodsReceiptLines.forEach(product => {
        delete product.isChecked;
        delete product.hideReceive;
        delete product.hideReturn;
        delete product.serialNumberCheck;
        delete product.savedReceiveLocations;
        delete product.saveRecentReceive;
        delete product.saveRecentReturn;
        delete product.savedReturnLocations;
        delete product.productImageResource;
        if (product.supplierIDName) {
          product.supplierMasterInfo = this.onSupplierIDNameChangeOnLine(product.supplierIDName);
        }
        delete product.supplierIDName;
        totalAmount = DecimalUtils.add(totalAmount, product.netAmount);
        grossAmount = DecimalUtils.add(grossAmount, product.grossAmount);
        taxAmount = DecimalUtils.add(taxAmount, product.taxAmount);
        if (product.discount && product.discountAmount) {
          discount = DecimalUtils.add(discount, product.discount);
          discountAmount = DecimalUtils.add(discountAmount, product.discountAmount);
        }
        taxPercentage = DecimalUtils.add(taxPercentage, product.taxPercentage);
        if (product.purchaseTaxes && product.purchaseTaxes.length) {
          purchaseTaxes = [...purchaseTaxes, ...product.purchaseTaxes];
        }
      });
    }
    let grouped = purchaseTaxes.reduce(
      (result: any, currentValue: any) => {
        (result[currentValue['taxNamePercentage']] = result[currentValue['taxNamePercentage']] || []).push(currentValue);
        return result;
      }, {});
    req['totalNetAmount'] = totalAmount;
    req['totalGrossAmount'] = grossAmount;
    req['totalTaxAmount'] = taxAmount;
    req['totalDiscount'] = discount;
    req['totalDiscountAmount'] = discountAmount;
    req['totalTaxPercentage'] = taxPercentage;
    if (grouped) {
      req['totalPurchaseTaxes'] = [];
      const headers = Object.keys(grouped);
      headers.forEach(element => {
        let taxA: any = 0;
        grouped[element].forEach(tax => {
          taxA = DecimalUtils.add(taxA, tax.taxAmount);
        });
        req['totalPurchaseTaxes'].push({
          taxAmount: taxA,
          taxName: element.split(':')[0],
          taxNamePercentage: element,
          taxPercentage: element.split(':')[1],
        })
      });
    }
    this.wmsService.saveOrUpdateGoodsReceipt(JSON.stringify(req)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data) {
          this.toastr.success("Saved Successfully");
          this.ngxSmartModalService.getModal('recieveLocationsModal').close();
          this.searchKeyForReceive = null;
          this.recieveShowValues = null;
          this.existedLineDetails = null;
          this.returnShowValues = null;
          this.onlyHeaderUpdateToggle = true;
          this.selectAllCheckboxValue = false;
          this.includeExportData = [];
          this.selectedLinesArray = [];
          this.sNumber = null;
          this.serialNumberCheck = 'No';
          this.putAwayToggle = false;
          // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
          //   this.router.navigate([`/v1/inbound/goodsReceipt`], { queryParams: { id: response.data.goodsReceipt._id } }));
          this.id = response.data.goodsReceipt._id;
          sessionStorage.setItem('grnID', this.id);
          this.receivingForm.reset();
          this.dummyProductIDName = null;
          this.bConfig = null;
          this.finalReceiveLocations = [];
          this.finalReturnLocations = [];
          this.fetchAllocationType();
          this.pageForTable = 1;
          this.itemsPerPage = 5;
          this.getGoodsReceiptByID();
          this.pageForTableManagement = 1;
          this.itemsPerPageManagement = 5;
          this.getGoodsReceiptManagementByID();
        } else if (response && response.status === 2 && response.statusMsg) {
          this.toastr.error(response.statusMsg);
        } else {
          this.toastr.error('Failed in updating product');
        }
      },
      (error) => {
        this.toastr.error('Failed in updating product');
      }
    );
  }
  updateIndividualGRN(req, allocateprocess?) {
    if (this.isAllocateObject) {
      let totalAmount: any = 0;
      let grossAmount: any = 0;
      let taxAmount: any = 0;
      let discount: any = 0;
      let discountAmount: any = 0;
      let taxPercentage: any = 0;
      let purchaseTaxes = [];
      const dummyGoodsReceiptManagementLines = JSON.parse(JSON.stringify(req.goodsReceiptManagementLines));
      if (req.goodsReceiptManagementLines.length > 0) {
        req.goodsReceiptManagementLines.forEach(product => {
          if (product.supplierIDName) {
            product.supplierMasterInfo = this.onSupplierIDNameChangeOnLine(product.supplierIDName);
          }
          delete product.supplierIDName;
          delete product.savedReceiveLocations;
          delete product.saveRecentReceive;
          delete product.saveRecentReturn;
          delete product.savedReturnLocations;
          delete product.productImageResource;

          totalAmount = DecimalUtils.add(totalAmount, product.netAmount);
          grossAmount = DecimalUtils.add(grossAmount, product.grossAmount);
          taxAmount = DecimalUtils.add(taxAmount, product.taxAmount);
          if (product.discount && product.discountAmount) {
            discount = DecimalUtils.add(discount, product.discount);
            discountAmount = DecimalUtils.add(discountAmount, product.discountAmount);
          }
          taxPercentage = DecimalUtils.add(taxPercentage, product.taxPercentage);
          if (product.purchaseTaxes && product.purchaseTaxes.length) {
            purchaseTaxes = [...purchaseTaxes, ...product.purchaseTaxes];
          }
        });
      }
      let grouped = purchaseTaxes.reduce(
        (result: any, currentValue: any) => {
          (result[currentValue['taxNamePercentage']] = result[currentValue['taxNamePercentage']] || []).push(currentValue);
          return result;
        }, {});
      req['totalNetAmount'] = totalAmount;
      req['totalGrossAmount'] = grossAmount;
      req['totalTaxAmount'] = taxAmount;
      req['totalDiscount'] = discount;
      req['totalDiscountAmount'] = discountAmount;
      req['totalTaxPercentage'] = taxPercentage;
      if (grouped) {
        req['totalPurchaseTaxes'] = [];
        const headers = Object.keys(grouped);
        headers.forEach(element => {
          let taxA: any = 0;
          grouped[element].forEach(tax => {
            taxA = DecimalUtils.add(taxA, tax.taxAmount);
          });
          req['totalPurchaseTaxes'].push({
            taxAmount: taxA,
            taxName: element.split(':')[0],
            taxNamePercentage: element,
            taxPercentage: element.split(':')[1],
          })
        });
      }
      this.wmsService.validateGRNManagementLocations(req).subscribe(response => {
        if (response['data'].locationValidationsMap && response['data'].locationValidationsMap.ReceiveLocations.dimensions && response['data'].locationValidationsMap.ReturnLocations.dimensions) {
          this.wmsService.updateIndividualGoodsReceiptManagement(req).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data) {
                this.toastr.success('Updated product details successfully');
                this.ngxSmartModalService.getModal('recieveLocationsModal').close();
                this.searchKeyForReceive = null;
                this.recieveShowValues = null;
                this.returnShowValues = null;
                this.selectAllCheckboxValue = false;
                this.selectAllAllcateCheckboxValue = false;
                this.includeExportDataForManagement = [];
                this.selectedLinesArrayForManagement = [];
                this.includeExportData = [];
                this.selectedLinesArray = [];
                this.putAwayToggle = false;
                this.isAllocateObject = false;
                this.showAllocate = true;
                this.sNumber = null;
                this.onlyHeaderUpdateToggle = true;
                this.serialNumberCheck = 'No';
                this.finalReceiveLocations = [];
                this.finalReturnLocations = [];
                this.getGoodsReceiptManagementByID();
                this.receivingForm.reset();
                this.dummyProductIDName = null;
                this.bConfig = null;
                this.fetchAllocationType();
              } else if (response && response.status === 2 && response.statusMsg) {
                this.toastr.error(response.statusMsg);
                this.putAwayToggle = false;
                this.isAllocateObject = false;
              } else {
                this.toastr.error(response.statusMsg);
                this.ngxSmartModalService.getModal('recieveLocationsModal').close();
                this.searchKeyForReceive = null;
                this.recieveShowValues = null;
                this.returnShowValues = null;
                this.putAwayToggle = false;
                this.isAllocateObject = false;
                this.sNumber = null;
                this.onlyHeaderUpdateToggle = true;
                this.serialNumberCheck = 'No';
                this.getGoodsReceiptManagementByID();
                this.receivingForm.reset();
                this.dummyProductIDName = null;
                this.bConfig = null;
                this.fetchAllocationType();
                this.putAwayToggle = false;
                this.isAllocateObject = false;
              }
            },
            (error) => {
              this.toastr.error('Failed in updating product');
            }
          );
        }
        else {
          req.goodsReceiptManagementLines = dummyGoodsReceiptManagementLines;
          this.grManagementLines = dummyGoodsReceiptManagementLines;
          this.toastr.error('Locations Unavailable');
        }
      })
    }
    else {
      let totalAmount: any = 0;
      let grossAmount: any = 0;
      let taxAmount: any = 0;
      let discount: any = 0;
      let discountAmount: any = 0;
      let taxPercentage: any = 0;
      let purchaseTaxes = [];
      const dummyGoodsReceiptLines = JSON.parse(JSON.stringify(req.goodsReceiptLines));
      if (req.goodsReceiptLines.length > 0) {
        req.goodsReceiptLines.forEach(product => {
          if (typeof (product.serialNumbers) == 'string' && product.serialNumbers != "") {
            product.serialNumbers = product.serialNumbers.split(',');
          }
          if (product.supplierIDName) {
            product.supplierMasterInfo = this.onSupplierIDNameChangeOnLine(product.supplierIDName);
          }
          delete product.supplierIDName;
          delete product.savedReceiveLocations;
          delete product.saveRecentReceive;
          delete product.saveRecentReturn;
          delete product.savedReturnLocations;
          delete product.productImageResource;
          totalAmount = DecimalUtils.add(totalAmount, product.netAmount);
          grossAmount = DecimalUtils.add(grossAmount, product.grossAmount);
          taxAmount = DecimalUtils.add(taxAmount, product.taxAmount);
          if (product.discount && product.discountAmount) {
            discount = DecimalUtils.add(discount, product.discount);
            discountAmount = DecimalUtils.add(discountAmount, product.discountAmount);
          }
          taxPercentage = DecimalUtils.add(taxPercentage, product.taxPercentage);
          if (product.purchaseTaxes && product.purchaseTaxes.length) {
            purchaseTaxes = [...purchaseTaxes, ...product.purchaseTaxes];
          }
        });
      }
      let grouped = purchaseTaxes.reduce(
        (result: any, currentValue: any) => {
          (result[currentValue['taxNamePercentage']] = result[currentValue['taxNamePercentage']] || []).push(currentValue);
          return result;
        }, {});
      req['totalNetAmount'] = totalAmount;
      req['totalGrossAmount'] = grossAmount;
      req['totalTaxAmount'] = taxAmount;
      req['totalDiscount'] = discount;
      req['totalDiscountAmount'] = discountAmount;
      req['totalTaxPercentage'] = taxPercentage;
      if (grouped) {
        req['totalPurchaseTaxes'] = [];
        const headers = Object.keys(grouped);
        headers.forEach(element => {
          let taxA: any = 0;
          grouped[element].forEach(tax => {
            taxA = DecimalUtils.add(taxA, tax.taxAmount);
          });
          req['totalPurchaseTaxes'].push({
            taxAmount: taxA,
            taxName: element.split(':')[0],
            taxNamePercentage: element,
            taxPercentage: element.split(':')[1],
          })
        });
      }
      this.wmsService.validateGRNLocations(req).subscribe(response => {
        if (response['data'].locationValidationsMap && response['data'].locationValidationsMap.ReceiveLocations.dimensions && response['data'].locationValidationsMap.ReturnLocations.dimensions) {
          this.wmsService.updateIndividualGoodsReceipt(req).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data) {
                this.toastr.success('Updated product details successfully');
                this.ngxSmartModalService.getModal('recieveLocationsModal').close();
                this.searchKeyForReceive = null;
                this.recieveShowValues = null;
                this.returnShowValues = null;
                this.onlyHeaderUpdateToggle = true;
                this.sNumber = null;
                this.serialNumberCheck = 'No';
                this.putAwayToggle = false;
                // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                //   this.router.navigate([`/v1/inbound/goodsReceipt`], { queryParams: { id: response.data.goodsReceipt._id } }));
                this.receivingForm.reset();
                this.dummyProductIDName = null;
                this.finalReceiveLocations = [];
                this.finalReturnLocations = [];
                this.bConfig = null;
                this.selectedLinesArray = [];
                this.id = response.data.goodsReceipt._id;
                sessionStorage.setItem('grnID', this.id);
                this.fetchAllocationType();
                this.pageForTable = 1;
                this.itemsPerPage = 5;
                this.getGoodsReceiptByID();
                this.pageForTableManagement = 1;
                this.itemsPerPageManagement = 5;
                this.getGoodsReceiptManagementByID();
              } else if (response && response.status === 2 && response.statusMsg) {
                this.toastr.error(response.statusMsg);
                this.arrayForTable.forEach(grLine => {
                  if (grLine.grnDate) {
                    grLine.grnDate = this.datePipe.transform(new Date(grLine.grnDate), 'yyyy-MM-dd HH:mm');
                  }
                  else {
                    grLine.grnDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm');
                  }
                  if (grLine.mfgDate) {
                    grLine.mfgDate = this.apexService.getDateFromMilliSec(grLine.mfgDate);
                  }
                  grLine.expiryDate = grLine.expiryDate ?
                    this.apexService.getDateFromMilliSec(grLine.expiryDate) : grLine.expiryDate;
                });
              }
              else if (response && response.status === 1 && response.statusMsg) {
                this.toastr.error(response.statusMsg);
                this.arrayForTable.forEach(grLine => {
                  if (grLine.grnDate) {
                    grLine.grnDate = this.datePipe.transform(new Date(grLine.grnDate), 'yyyy-MM-dd HH:mm');
                  }
                  else {
                    grLine.grnDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm');
                  }
                  if (grLine.mfgDate) {
                    grLine.mfgDate = this.apexService.getDateFromMilliSec(grLine.mfgDate);
                  }
                  grLine.expiryDate = grLine.expiryDate ?
                    this.apexService.getDateFromMilliSec(grLine.expiryDate) : grLine.expiryDate;
                });
              } else {
                this.toastr.error('Failed in updating product');
              }
            },
            (error) => {
              this.toastr.error('Failed in updating product');
            }
          );
        }
        else {
          req.goodsReceiptLines = dummyGoodsReceiptLines;
          this.arrayForTable = dummyGoodsReceiptLines;
          this.toastr.error('Locations Unavailable');
        }
      })
    }
  }
  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['goodsReceiptManagementByIDArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.getGoodsReceiptManagementByID(this.pageForTableManagement)
    } else {

    }
  }
  getGoodsReceiptManagementByID(page?) {
    if (this.id) {
      const form = {
        'organizationIDName': this.formObj.organizationIDName,
        'wareHouseIDName': this.formObj.wareHouseIDName,
        "page": page ? page : 1,
        "pageSize": this.itemsPerPageManagement,
        "sortDirection": this.sortDirection,
        "sortFields": this.sortFields,
        "searchOnKeys": PaginationConstants.goodsReceiptByIDSearchOnKeys,
        "searchKeyword": this.searchKeyManagement,
        "locationPage": 1,
        "locationPageSize": 5,
        "returnLocationPage": 1,
        "returnLocationPageSize": 5,
        _id: this.id
      }
      this.wmsService.fetchGoodsReceiptManagementByIDPagination(form).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.goodsReceiptManagementPaginationResponse.goodsReceiptManagement) {
            this.grManagementLines = response.data.goodsReceiptManagementPaginationResponse.goodsReceiptManagement.goodsReceiptManagementLines;
            this.totalItemsForManagement = response.data.goodsReceiptManagementPaginationResponse.totalElements;
            let selectedCheckIDs = [];
            if (this.selectedLinesArrayForManagement.length > 0) {
              selectedCheckIDs = this.selectedLinesArrayForManagement.map(x => x._id);
            }
            this.grManagementLines.forEach(element => {
              element.isChecked = false;
              element.saveRecentReceive = false;
              element.saveRecentReturn = false;
              if (element.receiveLocationAllocationType == 'Manual') {
                element.savedReceiveLocations = element.receiveLocationHelpers;
              }
              else {
                element.savedReceiveLocations = [];
              }
              if (element.returnLocationAllocationType == 'Manual') {
                element.savedReturnLocations = element.returnLocationHelpers;
              }
              else {
                element.savedReturnLocations = [];
              }
              if (this.selectAllAllcateCheckboxValue) {
                element.isChecked = true;
              }
              if (selectedCheckIDs.includes(element._id)) {
                const choosedLine = this.selectedLinesArrayForManagement.find(x => x._id === element._id);
                element.isChecked = true;
                element.receiveLocationHelpers = choosedLine.receiveLocationHelpers;
                element.receiveLocationAllocationType = choosedLine.receiveLocationAllocationType;
                element.returnLocationAllocationType = choosedLine.returnLocationAllocationType;
                element.returnLocationHelpers = choosedLine.returnLocationHelpers;
              }
            });
            const lengthofTotalItems = this.totalItemsForManagement.toString().length;
            const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            count.forEach(el => {
              if (lengthofTotalItems == el) {
                let value: any = 1 + this.configService.addZerosMethod(el);
                this.dataPerPageForManagement = parseInt(value);
              }
            });
            const n: any = (this.totalItemsForManagement / this.dataPerPageForManagement).toString()
            let m = n.split('.')
            if (m[1]) {
              this.loopToStopForManagement = parseInt(m[0]) + 1
            } else {
              this.loopToStopForManagement = parseInt(m[0])
            }
          }
          else {
            this.grManagementLines = [];
          }
        },
        (error) => {
          this.grManagementLines = [];
        }
      );
    }
    else {
      this.grManagementLines = [];
    }
  }

  showPopup() {
    if (this.arrayForTable.length > 0) {
      this.ngxSmartModalService.getModal('closePOPopup').open();
      const viewData = `Do you want to close order?`;
      this.ngxSmartModalService.setModalData(viewData, 'closePOPopup');
    }
    else {
      this.closePO();
    }
  }
  closePO() {
    const proceed = this.grManagementLines.find(x => x.locationFound == false) ? false : true;
    if (proceed) {
      const final = Object.assign({ _id: this.goodsReceiptData._id }, this.formObj)
      this.inboundProcessService.closePO(final).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data) {
            this.router.navigate(['/v1/inbound/maintainGoodsReceipt']);
            this.toastr.success('Closed PO successfully');
          } else {
            if (response.status == 2) {
              this.toastr.error(response.statusMsg);
            }
          }
        },
        (error) => {
          this.toastr.error('Failed in closing PO');
        });
    }
    else {
      this.toastr.error('Allocate Locations before Closing PO');
    }
  }
  allocateLocation() {
    if (this.permissionsList.includes('Update')) {
      this.isAllocateObject = true;
      let arr = this.grManagementLines.filter(x => x.isChecked);
      if (this.selectedLinesArrayForManagement.length > 0) {
        arr = this.selectedLinesArrayForManagement;
      }
      if (arr && arr.length > 0) {
        this.updateLoc(arr);
      }
      else {
        this.toastr.error('No Data to Proceed');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions");
    }
  }
  updateLoc(arr?) {
    const req = JSON.parse(JSON.stringify(this.headerForm.value));
    if (typeof (req.shipToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.shipToAddress = this.setJsonto(req.shipToAddress)
    }
    else {
      if (typeof (req.shipToAddress) != 'object') {
        req.shipToAddress = this.goodsReceiptData ? this.goodsReceiptData.shipToAddress : null;
      }
    }
    if (typeof (req.shipFromAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.shipFromAddress = this.setJsonFrom(req.shipFromAddress)
    }
    else {
      if (typeof (req.shipFromAddress) != 'object') {
        req.shipFromAddress = this.goodsReceiptData ? this.goodsReceiptData.shipFromAddress : null;
      }
    }
    if (typeof (req.billToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.billToAddress = this.setBillTo(req.billToAddress)
    }
    else {
      if (typeof (req.billToAddress) != 'object') {
        req.billToAddress = this.goodsReceiptData ? this.goodsReceiptData.billToAddress : null;
      }
    }
    if (arr) {
      req.goodsReceiptManagementLines = JSON.parse(JSON.stringify(arr));
    }
    else {
      req.goodsReceiptManagementLines = JSON.parse(JSON.stringify([this.receivingForm.getRawValue()]))
    }
    if (req.goodsReceiptManagementLines && req.goodsReceiptManagementLines.length > 0) {
      req.goodsReceiptManagementLines.forEach(formLine => {
        if (formLine.purchaseTaxes && formLine.purchaseTaxes.length > 0) {
          if (typeof (formLine.purchaseTaxes[0]) == 'string') {
            const purchase = JSON.parse(JSON.stringify(formLine.purchaseTaxes));
            formLine.purchaseTaxes = [];
            purchase.forEach(inner => {
              if (typeof (inner) == 'string') {
                formLine.purchaseTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
              }
              else {
                formLine.purchaseTaxes.push(inner);
              }
            });
          }
        }
      });
    }
    req.receiptDate = req.receiptDate ? new Date(req.receiptDate) : null;
    let proceed = true;
    req.goodsReceiptManagementLines.forEach(element => {
      if (proceed) {
        element.mfgDate = element.mfgDate ? new Date(element.mfgDate) : null;
        element.expiryDate = element.expiryDate ? new Date(element.expiryDate) : null;
        element.grnDate = element.grnDate ? new Date(element.grnDate) : null;
        const filteredS = this.suppliers.find(sup => sup.supplierIDName === req.supplierMasterInfo.supplierIDName);
        const filteredP = this.productFromMaster;
        if (filteredP) element.productMasterInfo.productMasterID = filteredP._id;
        if (!element.mfgDate || !element.expiryDate ||
          (element.mfgDate && element.expiryDate && element.mfgDate <= element.expiryDate)) {
          if (DecimalUtils.lessThanOrEqual((DecimalUtils.add(element.supplierReceivedQuantity, element.supplierReturnQuantity)), element.orderedQuantity)) {

            if (element.receiveLocationAllocationType == 'Manual' && element['saveRecentReceive'] == false) {
              element.receiveLocationHelpers = element.savedReceiveLocations;
            }
            if (element.returnLocationAllocationType == 'Manual' && element['saveRecentReturn'] == false) {
              element.returnLocationHelpers = element.savedReturnLocations;
            }
            if (element.receiveLocationAllocationType == 'Manual' && (element.receiveLocationHelpers == null || element.receiveLocationHelpers == 'null' ||
              element.receiveLocationHelpers.length == 0) && (element.supplierReceivedQuantity || element.supplierReceivedQuantity > 0)) {
              this.toastrMsg = `${element.poLineNumber} - Select Receive Locations`;
              proceed = false;
              element.receiveLocationHelpers = [];
            }
            else {
              if (element.returnLocationAllocationType == 'Manual' && (element.returnLocationHelpers == null || element.returnLocationHelpers == 'null' ||
                element.returnLocationHelpers.length == 0) && (element.supplierReturnQuantity || element.returnQuantity > 0)) {
                this.toastrMsg = `${element.poLineNumber} - Select Return Locations`;
                proceed = false;
                element.receiveLocationHelpers = [];
              }

              else {
                if (element.returnLocationAllocationType == 'Auto') {
                  element.returnLocationHelpers = null;
                }
                else {
                  if (element.returnLocationHelpers && element.returnLocationHelpers.length > 0) {
                    element.returnLocationHelpers.forEach(ret => {
                      delete ret.isChecked;
                      delete ret.isEdit;
                    });
                    let count: any = 0;
                    let dummyCount = element.supplierReturnQuantity;
                    element.returnLocationHelpers.forEach(element => {
                      count = DecimalUtils.add(count, element.quantity);
                    });
                    if (DecimalUtils.equals(count, dummyCount)) {
                      proceed = true;
                    }
                    else {
                      if (element.poLineNumber) {
                        this.toastrMsg = `${element.poLineNumber} - Select Return Locations`;
                      }
                      else {
                        this.toastrMsg = `Select Return Locations`;
                      }
                      proceed = false;
                      element.returnLocationHelpers = [];
                    }
                  }
                }
                if (proceed) {
                  if (element.receiveLocationAllocationType == 'Auto') {
                    element.receiveLocationHelpers = null;
                  }
                  else {
                    if (element.receiveLocationHelpers && element.receiveLocationHelpers.length > 0) {
                      element.receiveLocationHelpers.forEach(ret => {
                        delete ret.isChecked;
                        delete ret.isEdit;
                      });
                      let count: any = 0;
                      let dummyCount = element.receivedQuantity;
                      element.receiveLocationHelpers.forEach(element => {
                        count = DecimalUtils.add(count, element.quantity);
                      });
                      if (DecimalUtils.equals(count, dummyCount)) {
                        proceed = true;
                      }
                      else {
                        if (element.poLineNumber) {
                          this.toastrMsg = `${element.poLineNumber} - Select Receive Locations`;
                        }
                        else {
                          this.toastrMsg = `Select Receive Locations`;
                        }
                        proceed = false;
                        element.receiveLocationHelpers = [];
                      }
                    }
                  }
                }
              }
            }
          } else {

            // this.toastr.error('Supplier Received & Returned quantity should not be greater than ordered quantity');
            this.toastrMsg = `${element.poLineNumber} - Supplier Received & Returned quantity should not be greater than ordered quantity`;
            proceed = false;
          }
        } else {
          // this.toastr.error('Manufacturing date should not be greater than Expiry date');
          this.toastrMsg = `${element.poLineNumber} - Manufacturing date should not be greater than Expiry date`;
          proceed = false;
        }
      }
    });
    if (proceed) {
      this.apiCallManagement(req);
    }
    else {
      this.toastr.error(this.toastrMsg);
    }
  }
  apiCallManagement(req) {
    if (this.id) {
      this.wmsService.fetchGoodsReceiptManagementByID(this.id, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.goodsReceiptManagement) {
            let finalUpdateObj = {};
            finalUpdateObj = response.data.goodsReceiptManagement;
            finalUpdateObj['goodsReceiptManagementLines'] = req.goodsReceiptManagementLines;
            this.updateIndividualGRN({ ...finalUpdateObj, _id: this.id }, 'AllocateProcess');
          }
        })
    }
  }
  saveAllocationTypeAllocate(type, i) {
    this.isAllocateObject = true;
    this.grManagementLines[i].isChecked = true;
    this.grManagementLines[i].receiveLocationAllocationType = (type == 'Manual') ? 'Auto' : "Manual";
    this.onSelect1('yes', this.grManagementLines[i]);
  }
  saveAllocationTypeAllocate1(type, i) {
    this.isAllocateObject = true;
    this.grManagementLines[i].isChecked = true;
    this.grManagementLines[i].returnLocationAllocationType = (type == 'Manual') ? 'Auto' : "Manual";
    this.onSelect1('yes', this.grManagementLines[i]);
  }

  update() {
    if (this.permissionsList.includes('Update')) {
      if (!this.receivingForm.controls.productMasterInfo.value.productIDName) {
        if (((this.globalUpdateIndex || this.globalUpdateIndex == 0) && this.globalUpdateIndex != -1) || (this.globalUpdateIndex == -1 && this.arrayForTable.find(x => x.isChecked))) {
          if ((this.globalUpdateIndex == -1 && this.arrayForTable.find(x => x.isChecked))) {
            this.globalUpdateIndex = this.arrayForTable.findIndex(x => x.isChecked);
          }
          let arr = this.arrayForTable.filter(x => x.isChecked);
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
        else {
          this.toastr.error("Enter details for Update")
        }
      }
      else {
        this.updateContinue([this.receivingForm.getRawValue()]);
      }

    }
    else {
      this.toastr.error("User doesn't have Permissions");
    }
  }
  updateContinue(selectedArr) {
    const req = JSON.parse(JSON.stringify(this.headerForm.value));
    if (typeof (req.shipToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.shipToAddress = this.setJsonto(req.shipToAddress)
    }
    else {
      if (typeof (req.shipToAddress) != 'object') {
        req.shipToAddress = this.goodsReceiptData ? this.goodsReceiptData.shipToAddress : null;
      }
    }
    if (typeof (req.shipFromAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.shipFromAddress = this.setJsonFrom(req.shipFromAddress)
    }
    else {
      if (typeof (req.shipFromAddress) != 'object') {
        req.shipFromAddress = this.goodsReceiptData ? this.goodsReceiptData.shipFromAddress : null;
      }
    }
    if (typeof (req.billToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.billToAddress = this.setBillTo(req.billToAddress)
    }
    else {
      if (typeof (req.billToAddress) != 'object') {
        req.billToAddress = this.goodsReceiptData ? this.goodsReceiptData.billToAddress : null;
      }
    }
    if ((req.receiptType == 'WareHouseTransfer') && this.grnInvoiceConfirmationCheck == 'Yes') {
      this.wmsService.fetchAllWarehouses({ "wareHouseIDName": req.wareHouseTransferSourceInfo.wareHouseIDName }).subscribe(res => {
        if (res['status'] == 0) {
          const body = {
            "wareHouseIDName": req.wareHouseTransferSourceInfo.wareHouseIDName,
            "organizationIDName": res.data.wareHouses[0].organizationInfo.organizationIDName,
            "wareHouseTransferTransactionID": req.wareHouseTransferSourceInfo.wareHouseTransferTransactionID,
            "fullWareHouseTransferTransactionID": req.wareHouseTransferSourceInfo.fullWareHouseTransferTransactionID,
            "wareHouseTransferTransactionIDPrefix": req.wareHouseTransferSourceInfo.wareHouseTransferTransactionIDPrefix,
            "orderType": req.receiptType
          }
          this.wmsService.checkInvoiceForGRN(body).subscribe(response => {
            if (response['status'] == 0 && response['data'].status == 'Closed') {
              this.updateContinue1(selectedArr);
            }
            else {
              this.toastr.error("Invoice not yet Conformed");
            }
          })
        }
      })
    }
    else {
      this.updateContinue1(selectedArr);
    }
  }
  updateContinue1(selectedArr, fromSaveButton?) {
    const req = JSON.parse(JSON.stringify(this.headerForm.value));
    if (typeof (req.shipToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.shipToAddress = this.setJsonto(req.shipToAddress)
    }
    else {
      if (typeof (req.shipToAddress) != 'object') {
        req.shipToAddress = this.goodsReceiptData ? this.goodsReceiptData.shipToAddress : null;
      }
    }
    if (typeof (req.shipFromAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.shipFromAddress = this.setJsonFrom(req.shipFromAddress)
    }
    else {
      if (typeof (req.shipFromAddress) != 'object') {
        req.shipFromAddress = this.goodsReceiptData ? this.goodsReceiptData.shipFromAddress : null;
      }
    }
    if (typeof (req.billToAddress) == 'string' && req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.billToAddress = this.setBillTo(req.billToAddress)
    }
    else {
      if (typeof (req.billToAddress) != 'object') {
        req.billToAddress = this.goodsReceiptData ? this.goodsReceiptData.billToAddress : null;
      }
    }
    req['vehicleInfo'] = req.vehicleNumber ? this.mapId('vehicle', req.vehicleNumber) : null;
    delete req.vehicleNumber;
    req['equipmentInfo'] = req.containerNumber ? this.mapId('equipment', req.containerNumber) : null;
    delete req.containerNumber;
    req['serviceProviderInfo'] = req.serviceProviderID ? this.mapId('serviceID', req.serviceProviderID) : null;
    delete req.serviceProviderID;
    req.goodsReceiptLines = JSON.parse(JSON.stringify(selectedArr));
    if (req.goodsReceiptLines && req.goodsReceiptLines.length > 0) {
      req.goodsReceiptLines.forEach(formLine => {
        formLine['vehicleInfo'] = formLine.vehicleNumber ? this.mapId('vehicle', formLine.vehicleNumber) : null;
        delete formLine.vehicleNumber;
        formLine['equipmentInfo'] = formLine.containerNumber ? this.mapId('equipment', formLine.containerNumber) : null;
        delete formLine.containerNumber;
        formLine['serviceProviderInfo'] = formLine.transport ? this.mapId('serviceID', formLine.transport) : null;
        delete formLine.transport;
        if (typeof (formLine.serialNumbers) == 'string' && formLine.serialNumbers != "") {
          formLine.serialNumbers = formLine.serialNumbers.split(',');
        }
        if (formLine.serialNumbers == "") {
          formLine.serialNumbers = null;
        }
        if (!this.hidePanel && formLine.purchaseTaxes && formLine.purchaseTaxes.length > 0) {
          const purchase = JSON.parse(JSON.stringify(formLine.purchaseTaxes));
          formLine.purchaseTaxes = [];
          purchase.forEach(inner => {
            if (typeof (inner) == 'string') {
              formLine.purchaseTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
            }
            else {
              formLine.purchaseTaxes.push(inner);
            }
          });
        }
      });
    }
    if (req.goodsReceiptManagementLines && req.goodsReceiptManagementLines.length > 0) {
      req.goodsReceiptManagementLines.forEach(formLine => {
        if (typeof (formLine.serialNumbers) == 'string' && formLine.serialNumbers != "") {
          formLine.serialNumbers = formLine.serialNumbers.split(',');
        }
        if (formLine.serialNumbers == "") {
          formLine.serialNumbers = null;
        }
        if (!this.hidePanel && formLine.purchaseTaxes && formLine.purchaseTaxes.length > 0) {
          const purchase = JSON.parse(JSON.stringify(formLine.purchaseTaxes));
          formLine.purchaseTaxes = [];
          purchase.forEach(inner => {
            if (typeof (inner) == 'string') {
              formLine.purchaseTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
            }
            else {
              formLine.purchaseTaxes.push(inner);
            }
          });
        }
      });
    }
    if (req.supplierMasterInfo && req.supplierMasterInfo.supplierIDName) {
      req.supplierMasterInfo = req.supplierMasterInfo;
    }
    else {
      req.supplierMasterInfo = null;
    }
    if (this.goodsReceiptData.wareHouseTransferSourceInfo && this.goodsReceiptData.wareHouseTransferSourceInfo.wareHouseIDName) {
      req.wareHouseTransferSourceInfo = this.goodsReceiptData.wareHouseTransferSourceInfo;
    }
    else {
      req.wareHouseTransferSourceInfo = null;
    }
    req.organizationInfo = this.goodsReceiptData.organizationInfo;
    req.wareHouseInfo = this.goodsReceiptData.wareHouseInfo;
    req._id = this.goodsReceiptData._id;
    req.goodsReceiptLines = [];
    req.goodsReceiptLines = selectedArr;
    req.goodsReceiptLines.forEach(grnLine => {
      grnLine.grnDate = grnLine.grnDate ? new Date(grnLine.grnDate) : null;
      grnLine.mfgDate = grnLine.mfgDate ? new Date(grnLine.mfgDate) : null;
      grnLine.expiryDate = grnLine.expiryDate ? new Date(grnLine.expiryDate) : null;
    });

    req.wmpoNumber = this.goodsReceiptData.wmpoNumber;
    req.fullWmpoNumber = this.goodsReceiptData.fullWmpoNumber;
    req.wmpoNumberPrefix = this.goodsReceiptData.wmpoNumberPrefix;
    req.referencePONumber = this.goodsReceiptData.referencePONumber;
    req.poReferenceA = this.goodsReceiptData.poReferenceA;
    req.poReferenceB = this.goodsReceiptData.poReferenceB;
    let proceed = true;
    if (req && req._id && req.goodsReceiptLines.length > 0 && req.goodsReceiptLines.find(x => (x.supplierReceivedQuantity && x.supplierReceivedQuantity != 0) || (x.supplierReturnQuantity && x.supplierReturnQuantity != 0))) {
      req.goodsReceiptLines.forEach(grnLine => {
        if (proceed) {
          if ((grnLine.supplierReceivedQuantity && grnLine.supplierReceivedQuantity != 0) ||
            (grnLine.totalReturnQuantity && grnLine.totalReturnQuantity != 0) ||
            (grnLine.supplierReturnQuantity && grnLine.supplierReturnQuantity != 0)) {
            grnLine.shippedQuantity = DecimalUtils.add(grnLine.supplierReceivedQuantity, grnLine.supplierReturnQuantity);
            if (!grnLine.mfgDate || !grnLine.expiryDate ||
              (grnLine.mfgDate && grnLine.expiryDate && grnLine.mfgDate <= grnLine.expiryDate)) {
              if (DecimalUtils.lessThanOrEqual((DecimalUtils.add(grnLine.supplierReceivedQuantity, grnLine.supplierReturnQuantity)), grnLine.orderedQuantity)) {
                if (grnLine.receiveLocationAllocationType == 'Manual' && grnLine['saveRecentReceive'] == false) {
                  grnLine.receiveLocationHelpers = grnLine.savedReceiveLocations;
                }
                if (grnLine.returnLocationAllocationType == 'Manual' && grnLine['saveRecentReturn'] == false) {
                  grnLine.returnLocationHelpers = grnLine.savedReturnLocations;
                }
                if (grnLine.receiveLocationAllocationType == 'Manual' && (grnLine.receiveLocationHelpers == null || grnLine.receiveLocationHelpers == 'null' ||
                  grnLine.receiveLocationHelpers.length == 0) && (grnLine.supplierReceivedQuantity || grnLine.supplierReceivedQuantity > 0)) {
                  this.toastrMsg = `${grnLine.poLineNumber} - Select Receive Locations`;
                  proceed = false;
                  grnLine.receiveLocationHelpers = [];
                }
                else {
                  if (grnLine.returnLocationAllocationType == 'Manual' && (grnLine.returnLocationHelpers == null || grnLine.returnLocationHelpers == 'null' ||
                    grnLine.returnLocationHelpers.length == 0) && (grnLine.supplierReturnQuantity || grnLine.supplierReturnQuantity > 0)) {
                    this.toastrMsg = `${grnLine.poLineNumber} - Select Return Locations`;
                    proceed = false;
                    grnLine.returnLocationHelpers = [];
                  }
                  else {
                    if (grnLine.returnLocationAllocationType == 'Auto') {
                      grnLine.returnLocationHelpers = null;
                    }
                    else {
                      if (grnLine.returnLocationHelpers && grnLine.returnLocationHelpers.length > 0) {
                        grnLine.returnLocationHelpers.forEach(ret => {
                          delete ret.isChecked;
                          delete ret.isEdit;
                        });
                        let count: any = 0;
                        let dummyCount = grnLine.supplierReturnQuantity;
                        grnLine.returnLocationHelpers.forEach(element => {
                          count = DecimalUtils.add(count, element.quantity);
                        });
                        if (DecimalUtils.equals(count, dummyCount)) {
                          proceed = true;
                        }
                        else {
                          if (grnLine.poLineNumber) {
                            this.toastrMsg = `${grnLine.poLineNumber} - Select Return Locations`;
                          }
                          else {
                            this.toastrMsg = `Select Return Locations`;
                          }
                          proceed = false;
                          grnLine.returnLocationHelpers = [];
                        }
                      }
                    }
                    if (proceed) {
                      if (grnLine.receiveLocationAllocationType == 'Auto') {
                        grnLine.receiveLocationHelpers = null;
                      }
                      else {
                        if (grnLine.receiveLocationHelpers && grnLine.receiveLocationHelpers.length > 0) {
                          grnLine.receiveLocationHelpers.forEach(ret => {
                            delete ret.isChecked;
                            delete ret.isEdit;
                          });
                          let count: any = 0;
                          let dummyCount = grnLine.receivedQuantity;
                          grnLine.receiveLocationHelpers.forEach(element => {
                            count = DecimalUtils.add(count, element.quantity);
                          });
                          if (DecimalUtils.equals(count, dummyCount)) {
                            proceed = true;
                          }
                          else {
                            if (grnLine.poLineNumber) {
                              this.toastrMsg = `${grnLine.poLineNumber} - Select Receive Locations`;
                            }
                            else {
                              this.toastrMsg = `Select Receive Locations`;
                            }
                            proceed = false;
                            grnLine.receiveLocationHelpers = [];
                          }
                        }
                      }
                      if (DecimalUtils.lessThanOrEqual(grnLine.supplierReceivedQuantity, grnLine.orderedQuantity)) {
                        if (((!this.hidePanel && this.serialNumberCheck == 'Yes') || (this.hidePanel && grnLine.serialNumberCheck == 'Yes')) && grnLine.receivedQuantity && grnLine.receivedQuantity != 0) {
                          if (typeof (grnLine.serialNumbers) == 'string' && grnLine.serialNumbers != "") {
                            grnLine.serialNumbers = grnLine.serialNumbers.split(',');
                          }
                          if (!grnLine.serialNumbers || grnLine.serialNumbers == "") {
                            grnLine.serialNumbers = null;
                          }

                          if (grnLine.serialNumbers && grnLine.serialNumbers.length != 0) {
                            if (grnLine.receivedQuantity == grnLine.serialNumbers.length) {
                              proceed = true;
                            }
                            else {
                              this.toastrMsg = `${grnLine.poLineNumber} -Enter All Serial Numbers`;
                              proceed = false;
                            }
                          }
                          else {
                            this.toastrMsg = `${grnLine.poLineNumber} - Enter Serial Numbers`;
                            // this.toastr.error('Enter Serial Numbers');
                            proceed = false;
                          }
                        }
                        else {
                          // this.apiCall(req, 'lineUpdate');
                          proceed = true;
                        }
                      } else {
                        if (proceed) {
                          // this.toastr.error('Supplier received quantity should not be greater than ordered quantity');
                          this.toastrMsg = `${grnLine.poLineNumber} - Supplier received quantity should not be greater than ordered quantity`;
                          proceed = false;
                        }
                      }
                    }
                  }
                }
              }
              // }
              else {
                proceed = false;
                this.toastrMsg = `${grnLine.poLineNumber} - Ordered quantity should be greater than or equal to Supplier received quantity plus return quantity`
              }
            } else {
              proceed = false;
              this.toastrMsg = `${grnLine.poLineNumber} - Manufacturing date should be greater than Expiry date`;
            }
          }
          else {
            proceed = false;
            this.toastrMsg = `${grnLine.poLineNumber} - Enter Supplier Received Quantity or Return Quantity`;
          }
        }
      });
    }
    else {
      this.toastrMsg = `Fill the details`;
      proceed = false;
    }
    if (proceed) {
      this.apiCall(req, 'lineUpdate', fromSaveButton);
    }
    else {
      this.toastr.error(this.toastrMsg);
    }
  }
  clear() {
    this.receivingForm.reset();
    this.bConfig = null;
    this.dummyProductIDName = null;
    this.receivingForm.controls.returnQuantity.setValue(0);
    this.receivingForm.controls.grnDate.setValue(this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm'));
    this.putAwayToggle = false;
    this.sNumber = null;
    this.serialNumberCheck = 'No';
    this.onlyHeaderUpdateToggle = true;
    this.recieveShowValues = null;
    this.returnShowValues = null;
    this.hideReceive = false;
    this.hideReturn = false;
    this.searchKeyForReturn = null;
    this.searchKeyForReceive = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    this.fetchAllocationType();
    // this.goodsReceiptLines = this.overGoodsReceiptLines.filter((line: any) => {
    //   return line.updated === false;
    // });
    // this.dummyGRNLines = this.goodsReceiptLines;
  }
}


