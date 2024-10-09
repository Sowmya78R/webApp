import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CompleterData, CompleterService } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { CreateSalesOrderService } from 'src/app/services/createSalesOrder.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { OutboundMasterDataService } from 'src/app/services/integration-services/outboundMasterData.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import { Util } from 'src/app/shared/utils/util';
import { Storage } from '../../../../shared/utils/storage';
import { Constants } from '../../../../constants/constants';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ApexService } from 'src/app/shared/services/apex.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { DecimalUtils } from 'src/app/constants/decimal';
import { BarcodeService } from 'src/app/services/barcode.service';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';
import { salesOrderrHeader } from 'src/app/constants/paginationConstants';
@Component({
  selector: 'app-create-so',
  templateUrl: './create-so.component.html',
  styleUrls: ['./create-so.component.scss']
})
export class CreateSOComponent implements OnInit, OnDestroy, AfterViewInit {
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
  formObj = this.configService.getGlobalpayload();
  soHeaderForm: FormGroup;
  soLineForm: FormGroup;
  customerList: any = [];
  customerIDNames: any = [];
  dataService: CompleterData;
  productsDataService: any = [];
  thirdPartyCustomersCheckAllocation: any = 'No';
  termsOfPayments: any[] = [];
  focusedElement: any;
  paymentModes: any;
  taxGroups: any = [];
  currencies: any = [];
  shipmentTimeSlots: any = [];
  productList: any = [];
  productIDNames: any = [];
  inventories: any = [];
  // returnShowValues: any;
  pickupLocationValues: CompleterData;
  pickupLocations: any = [];
  returnALLocations: any[];
  locAllocation = { "_id": null, "pickingLocationAllocationType": "Manual", "isActive": true };
  batchNumberIDs: CompleterData;
  serialNumberIDs: CompleterData;
  units: any = [];
  inCheckfromConfig: any = 'No';
  serialNumberCheckFrmConfig: any = "No";
  id: any = this.appService.getParam('id');
  salesOrderLinesAll: any = [];
  soTablekeys: any = ['', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', ''];
  serialNumberAllocation: any = "No";
  totalAmount: any = 0;
  termsAndConditions: any;
  currentEditProductId: any = null;
  deleteInfo: any;
  onlyHeaderUpdateToggle: Boolean = true;
  productLogo: any;
  showImage: boolean = false;
  products: any = [];
  statusCheck: boolean = false;
  statusEditCheck: boolean = false;
  uomConversions: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  hideFields: any = ['Customer IdName', 'Reference SO No'];
  selectedHideFields: any = null;
  taxData: any = [];
  taxIDs: any = [];
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
  priceFromBE: number = 0;
  brandList: any = [];
  taxesDisabled: boolean = false;
  sourceFromDropdowns: any = [];
  sourceToDropdowns: any = [];
  billToDropdowns: any = [];
  showQuantity: boolean = true;
  overAllBarcodeData: any = [];
  scanInprocess: boolean = false;
  soArrayLines: any = [];
  selectedLineIndex: any = null;
  showTableType: any = 'No';
  pByCMapping: any = 'No';
  selectAllAllcateCheckboxValue: any = null;
  dummyProductIDName: any = null;
  showTooltip: any = false;

  pageForTable: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  leadTime: any = null;

  page = 1;
  @ViewChild('remote')
  public dropdownObj: ComboBoxComponent;
  public array = new Array(100).fill(null);
  public data = this.array.map((v, i) => ({ text: i, id: i }));
  productIDNamesForBarcodeDropdown: any = [];
  barcodeInfo: any = null;

  // bind the Query instance to query property
  public query: Query = new Query().take(10);
  public fields: Object = {
    text: 'text', value: 'id', itemCreated: (e: any) => {
      highlightSearch(e.item, (this as any).queryString, true, 'Contains');
    }
  };
  // public fields: Object = { text: 'text', value: 'id' };
  paginationStop: boolean = false;
  requestedDiagnosisArray: any = [];
  existedUnitPrice: any = null;
  existedEditRecord: any = null;
  bConfig: any = null;
  finalReceiveObj: any;
  selectedReceiveRecords: any = [];
  finalPickupLocations: any = [];

  onFiltering(e) {
    let query: Query = new Query();
    query = (e.text !== '') ? query.where('text', 'contains', e.text, true) : query;
    e.updateData(this.includeExportDataForProudcts, query);
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
                    if (this.productsDataService.length > 0) {
                      let index = this.productsDataService.length;
                      arr.forEach((v, i) => {
                        i = index;
                        if (!this.productsDataService.find(x => x.text == v.productIDName)) {
                          this.productsDataService.push({ text: v.productIDName, id: i });
                          index += 1;
                        }
                      });
                    }
                    else {
                      this.productsDataService = arr.map((v, i) => ({ text: v.productIDName, id: i }));
                    }
                    new DataManager(this.productsDataService)
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
                  this.productsDataService = [];
                }
              })
          }
        }
      });
    }
  }
  totalItemsForReceive: any;
  pageForTableForReceive: number = 1;
  itemsPerPageForReceive: any = 5;
  searchKeyForReceive: any = null;

  totalItemsForProductMaster: any = null;
  includeExportDataForProudcts: any = [];
  loopToStopForProduct: any = null;
  dataPerPageForProduct: any = null;

  constructor(private toastr: ToastrService, private datePipe: DatePipe,
    private wmsService: WMSService, private configService: ConfigurationService,
    private outboundMasterDataService: OutboundMasterDataService,
    private createSalesOrderService: CreateSalesOrderService,
    private completerService: CompleterService, private commonMasterDataService: CommonMasterDataService,
    private outboundProcessService: OutboundProcessService,
    private appService: AppService, private apexService: ApexService,
    private customValidators: CustomValidators,
    private metaDataService: MetaDataService,
    private IBMDService: InboundMasterDataService,
    public ngxSmartModalService: NgxSmartModalService,
    private util: Util, private bService: BarcodeService,
    private translate: TranslateService) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.fetchAllPDbyCustomerConfigurations();
    this.createSOHeaderForm();
    this.soHeaderForm.controls.soOrderDate.setValue(this.apexService.getDateFromMilliSec(new Date()));
    this.createSOLinesForm();
    this.getExpDate(this.soHeaderForm.controls.soOrderDate.value);
    this.fetchUomDetails();
    // this.fetchAllProducts(1, 10);
    // this.fetchAllProducts();
    this.fetchAllCustomers();
    this.fetchAllMetaData();
    this.fetchProductConfig();
    if (this.pByCMapping == 'No' && this.showTableType == 'Yes') {
      this.getInventoryDetails();
    }
  }
  accessOrderID(event) {
    if (event && event.itemData) {
      this.soLineForm.controls.productMasterInfo['controls'].productIDName.setValue(event.itemData.text);
      this.onProductIDNameChange(event);
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
  fetchAllProducts(page, size, searchKey) {
    // this.wmsService.fetchAllProducts(this.formObj).subscribe(
    //   (response) => {
    //     if (response && response.status === 0 && response.data.productMasters) {
    //       this.products = response.data.productMasters;
    //       this.productsDataService = this.products.map(x => x.productIDName);
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
            this.productsDataService = arr.map((v, i) => ({ text: v.productIDName, id: i }));
          }
          else {
            if (!this.paginationStop) {
              if (this.productsDataService.length > 0) {
                let index = this.productsDataService.length;
                arr.forEach((v, i) => {
                  i = index;
                  if (!this.productsDataService.find(x => x.text == v.productIDName)) {
                    this.productsDataService.push({ text: v.productIDName, id: i });
                    index += 1;
                  }
                });
              }
              else {
                this.productsDataService = arr.map((v, i) => ({ text: v.productIDName, id: i }));
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
          this.productsDataService = [];
        }
      })
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

 
  fetchUomDetails() {
    this.commonMasterDataService.fetchAllUOMConversion(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.uoms) {
          this.uomConversions = response.data.uoms;
        }
      },
      (error) => {
      });
  }
  // findAllTaxes() {
  //   const shipFromObj = this.sourceToDropdowns.find(x => x.name == this.soHeaderForm.value.shipToAddress);
  //   const form = this.formObj;
  //   form['countryName'] = shipFromObj ? shipFromObj.country : null;
  //   form['stateName'] = shipFromObj ? shipFromObj.state : null;
  //   this.wmsService.fetchTaxes(form).subscribe(res => {
  //     if (res['status'] == 0 && res['data'].taxMasters) {
  //       this.taxData = res['data'].taxMasters;
  //       this.taxIDs = this.taxData.map(x => x.taxNamePercentage);
  //     }
  //     else {
  //       this.taxData = [];
  //       this.taxIDs = this.taxData;
  //     }
  //   })
  // }

  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = salesOrderrHeader['createSalesOrderSortFieldsArrays'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.findSalesOrderByID(this.pageForTable, this.itemsPerPage);
    }
    else {

    }
  }
  salesOrderCurrency: any;
  findSalesOrderByID(page?, pageSize?) {
    if (this.id) {
      const form = {
        'organizationIDName': this.formObj.organizationIDName,
        'wareHouseIDName': this.formObj.wareHouseIDName,
        "page": page ? page : 1,
        "pageSize": this.itemsPerPage,
        "sortDirection": this.sortDirection,
        "sortFields": this.sortFields,
        "searchOnKeys": salesOrderrHeader.salesOrderByIDSearchOnKeysKeys,
        "searchKeyword": this.searchKey,
        _id: this.id
      }
      this.outboundProcessService.fetchSalesOrderByIDWithPagination(form).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.salesOrderPaginationResponse.salesOrder) {
            this.salesOrderCurrency = response.data.salesOrderPaginationResponse.salesOrder.currency;
            this.salesOrderLinesAll = response.data.salesOrderPaginationResponse.salesOrder.salesOrderLines;
            this.salesOrderLinesAll.forEach(element => {
              element.isEdit = false;
            });
            this.totalItems = response.data.salesOrderPaginationResponse.totalElements;
            const disableForm = response.data.salesOrderPaginationResponse.salesOrder.raiseSOStatus;
            this.statusCheck = response.data.salesOrderPaginationResponse.salesOrder.raiseSOStatus;
            if (disableForm) {
              this.soHeaderForm.disable();
              this.soLineForm.disable();
              this.taxesDisabled = true;
            }
            this.statusEditCheck = response.data.salesOrderPaginationResponse.salesOrder.status == 'Open' ? false : true;
            if (!response.data.salesOrderPaginationResponse.salesOrder.customerMasterInfo) {
              response.data.salesOrderPaginationResponse.salesOrder.customerMasterInfo = {
                customerIDName: null,
                customerID: null,
                customerName: null
              }
            }
            else {
              const abc = this.customerList.find(x => x.customerIDName == response.data.salesOrderPaginationResponse.salesOrder.customerMasterInfo.customerIDName);
              if (abc) {
                this.sourceToDropdowns = abc.shipToAddresses;
                this.billToDropdowns = abc.billToAddresses;

              }
            }
            if (!response.data.salesOrderPaginationResponse.salesOrder.wareHouseTransferDestinationInfo) {
              response.data.salesOrderPaginationResponse.salesOrder["wareHouseTransferDestinationInfo"] = {
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
            if (!response.data.salesOrderPaginationResponse.salesOrder.supplierMasterInfo) {
              response.data.salesOrderPaginationResponse.salesOrder['supplierMasterInfo'] = {
                supplierIDName: null,
                supplierID: null,
                supplierName: null,
                supplierMasterID: null
              }
            }
            if (response.data.salesOrderPaginationResponse.salesOrder.soOrderDate) {
              // this.soHeaderForm.controls.soOrderDate.setValue(this.apexService.getDateFromMilliSec(response.data.salesOrderPaginationResponse.salesOrder.soOrderDate));
              response.data.salesOrderPaginationResponse.salesOrder.soOrderDate = this.apexService.getDateFromMilliSec(response.data.salesOrderPaginationResponse.salesOrder.soOrderDate);
            }
            if (response.data.salesOrderPaginationResponse.salesOrder.deliveryExpDate) {
              // this.soHeaderForm.controls.deliveryExpDate.setValue(this.apexService.getDateFromMilliSec(response.data.salesOrderPaginationResponse.salesOrder.deliveryExpDate));
              response.data.salesOrderPaginationResponse.salesOrder.deliveryExpDate = this.apexService.getDateFromMilliSec(response.data.salesOrderPaginationResponse.salesOrder.deliveryExpDate);
            }
            if (response.data.salesOrderPaginationResponse.salesOrder.exBondDate) {
              response.data.salesOrderPaginationResponse.salesOrder.exBondDate = this.apexService.getDateFromMilliSec(response.data.salesOrderPaginationResponse.salesOrder.exBondDate);
            }
            this.soHeaderForm.patchValue(response.data.salesOrderPaginationResponse.salesOrder);
            if (response.data.salesOrderPaginationResponse.exBondDate) {
              this.soHeaderForm.controls.exBondDate.patchValue(this.apexService.getDateFromMilliSec(response.data.salesOrderPaginationResponse.exBondDate))
            }
            if (response.data.salesOrderPaginationResponse.salesOrder.shipFromAddress) {
              this.soHeaderForm.controls.shipFromAddress.patchValue(response.data.salesOrderPaginationResponse.salesOrder.shipFromAddress.name);
            }
            if (response.data.salesOrderPaginationResponse.salesOrder.shipToAddress) {
              this.soHeaderForm.controls.shipToAddress.patchValue(response.data.salesOrderPaginationResponse.salesOrder.shipToAddress.name);
            }
            if (response.data.salesOrderPaginationResponse.salesOrder.billToAddress) {
              this.soHeaderForm.controls.billToAddress.patchValue(response.data.salesOrderPaginationResponse.salesOrder.billToAddress.name);
            }
            this.getTotalAmount();
            // this.findAllTaxes();
            if (response.data.salesOrderPaginationResponse.salesOrder.orderType != 'WareHouseTransfer' && response.data.salesOrderPaginationResponse.salesOrder.orderType != 'WareHouseTransfer Returns') {
              // this.onCustomerIDNameChange(response.data.salesOrderPaginationResponse.salesOrder.customerMasterInfo.customerIDName);
              const customerDetails = response.data.salesOrderPaginationResponse.salesOrder.customerMasterInfo;
              this.getCustomerEditpageDetails(customerDetails, this.soHeaderForm.value);
            }
            if (this.showTableType == 'Yes') {
              this.getInventoryDetails();
            }
          } else {
            if (!this.searchKey) {
              this.salesOrderLinesAll = [];
              this.appService.navigate('/v1/outbound/maintainSalesOrder');
            }
          }
        },
        (error) => {
        });
    }
  }
  totalAmountWithDecimal: any;
  getTotalAmount() {
    this.totalAmount = 0;
    if (this.salesOrderLinesAll) {
      this.salesOrderLinesAll.forEach(product => {
        this.totalAmount = DecimalUtils.add(this.totalAmount, product.netAmount);
        this.totalAmountWithDecimal = this.totalAmount.toFixed(2);
      });
    }
  }
  fetchAllPDbyCustomerConfigurations() {
    this.metaDataService.findAllCustomerConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.productByCustomerMappingConfigurations && res.data.productByCustomerMappingConfigurations.length > 0) {
        this.pByCMapping = res.data.productByCustomerMappingConfigurations[0].mapping;
        if (this.pByCMapping == 'No') {
          this.fetchAllProducts(1, 10, null);
        }
      }
      else {
        this.fetchAllProducts(1, 10, null);
      }
    })
  };
  selectAllData1(event) {
    if (event.target.checked) {
      this.soArrayLines.forEach(element => {
        element.isChecked = true;
      });
    }
    else {
      this.soArrayLines.forEach(element => {
        element.isChecked = false;
      });
    }
  }
  createSOHeaderForm() {
    this.soHeaderForm = new FormBuilder().group({
      customerMasterInfo: new FormBuilder().group({
        customerIDName: [null, this.customValidators.required],
        customerID: [null],
        customerName: [null, this.customValidators.required],
        customerMasterID: [null]
      }),
      "organizationInfo": {
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      },
      "wareHouseInfo": {
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      },
      "wareHouseTransferDestinationInfo": new FormBuilder().group({
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
      }),
      "supplierMasterInfo": new FormBuilder().group({
        supplierIDName: null,
        supplierID: null,
        supplierName: null,
        supplierMasterID: null
      }),
      backOrder: null,
      wareHouseTransferType: null,
      wmsoNumber: [null],
      fullWmsoNumber: null,
      wmsoNumberPrefix: null,
      locationName: [null],
      soReferenceA: [null],
      soReferenceB: [null],
      orderType: ['Sales Order', this.customValidators.required],
      deliveryExpDate: [null, this.customValidators.required],
      modeOfTransport: [null],
      closedBy: [null],
      closedDate: [null],

      orderTakenBy: [null],
      soOrderDate: [null],
      shipmentTimeSlot: [null],
      currency: [null],
      referenceSoNumber: [null],
      customersCustomerAddress: null,
      customersCustomerName: null,
      shipFromAddress: [null, this.customValidators.required],
      shipToAddress: [null, this.customValidators.required],
      billToAddress: null,
      // shipFrom: [null, this.customValidators.required],
      // shipTo: [null, this.customValidators.required],
      // address1: [null],
      // address2: [null],
      invoiceType: [null],
      taxGroup: [null],
      paymentMode: [null],
      termsOfPayment: [null],
      _id: null,
      "totalGrossAmount": null,
      "totalNetAmount": null,
      "totalTaxAmount": null,
      "totalDiscount": null,
      "totalDiscountAmount": null,
      "totalSaleTaxes": null,
      "totalTaxPercentage": null,
      exBondDate: null,
      exBondNumber: null
    });
  }
  createSOLinesForm() {
    this.soLineForm = new FormBuilder().group({
      productMasterInfo: new FormBuilder().group({
        productMasterID: [null],
        productIDName: [null],
        productID: [null],
        productName: [null],
      }),
      brandName: null,
      // upcEANNumber: [null],
      productImage: null,
      hsnCode: null,
      dispathInstruciton: null,
      orderQuantity: [null],
      productDescription: null,
      storageInstruction: null,
      quantity: [null, this.customValidators.required],
      shipmentUnit: [null, this.customValidators.required],
      storageUnit: [null],
      inventoryUnit: [null, this.customValidators.required],
      unitPrice: [null, this.customValidators.required],
      orderUnitPrice: null,
      discount: [null],
      // tax1: [null],
      // tax2: [null],
      // tax3: [null],
      // tax4: [null],
      // tax5: [null],
      saleTaxes: null,
      "grossAmount": null,
      "taxAmount": null,
      "taxPercentage": null,
      "discountAmount": null,
      "netAmount": [null, this.customValidators.required],
      createdBy: [null],
      createdDate: [null],
      remarks: [null],
      availableQuantity: [null],
      expectedDeliveryDate: [null, this.customValidators.required],
      inventoryHelpers: [[]],
      locationAllocationType: "Manual",
      uomConversionAvailability: null,
      wmsoLineNumber: null,
      _id: null,
      currency: null,
      exBondDate: null,
      exBondNumber: null
    });
  }
  getProductDetails() {
    this.scanInprocess = false;
    // const upcEANNumber = (this.pByCMapping == 'Yes') ? this.soLineForm.controls.productMasterInfo['controls'].productIDName.value : this.dummyProductIDName;
    let upcEANNumber = this.dummyProductIDName ? this.dummyProductIDName : this.soLineForm.controls.productMasterInfo['controls'].productIDName.value;
    if (upcEANNumber && upcEANNumber.length == 12) {
      this.scanInprocess = true;
      if (this.pByCMapping == 'Yes') {
        this.soLineForm.controls.productMasterInfo['controls'].productIDName.setValue(null);
      }
      else {
        this.dummyProductIDName = null;
      }
      this.scanSuccessHandler(upcEANNumber);
    }
  }
  openScanner() {
    if (this.soHeaderForm.controls.customerMasterInfo.value.customerIDName) {
      this.barcodeInfo = { 'toggle': true };
      this.ngxSmartModalService.getModal('scannerModalForWebCam').open();
    }
    else {
      this.toastr.error("Enter Customer.")
    }
  }
  getBarcodeEvent(status) {
    if (status) {
      this.scanSuccessHandler(status);
    }
  }
  scanSuccessHandler(e: Event): void {
    if (e) {
      const bConfig = this.overAllBarcodeData.find(x => x.upcEANNumber == e);
      if (bConfig) {
        this.bConfig = bConfig;
        this.dummyProductIDName = bConfig.productMasterInfo.productIDName;
        this.soLineForm.controls.productMasterInfo['controls'].productIDName.setValue(bConfig.productMasterInfo.productIDName);
        this.soLineForm.controls.shipmentUnit.setValue(bConfig.unitCode);
        const obj = this.salesOrderLinesAll.find(x => x.productMasterInfo.productIDName == this.soLineForm.controls.productMasterInfo['controls'].productIDName.value && x.shipmentUnit == this.soLineForm.controls.shipmentUnit.value);
        if (obj) {
          this.edit(obj, 'fromScan');
        }
        else {
          this.onProductIDNameChange('yes', null, 'fromScan');
        }
      }
    }
  }
  fetchAllCustomers() {
    this.metaDataService.getImageConfigbyName(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Sales Order') ? true : false;
      }
    })
    this.outboundMasterDataService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers) {
          this.customerList = response.data.customers;
          this.customerList.forEach(item => {
            for (const subkey in item) {
              if (subkey === 'customerIDName') {
                this.customerIDNames.push(item[subkey]);
              }
            }
          });
          this.dataService = this.completerService.local(this.customerIDNames);
          if (this.id) {
            this.findSalesOrderByID(this.pageForTable, this.itemsPerPage);
          }
        } else {
          this.dataService = this.completerService.local(this.customerIDNames);
        }
      },
      (error) => {
        this.customerIDNames = [];
      });
  }
  calculateReceivedQty(type?) {
    this.showQuantity = true;
    // const filteredProduct = this.products.find(product => product.productIDName === this.soLineForm.value.productMasterInfo.productIDName);
    this.wmsService.fetchProductDetailsById(this.soLineForm.value.productMasterInfo.productMasterID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMaster) {
          const filteredProduct = response.data.productMaster;
          if (filteredProduct && filteredProduct.inventoryUnit && this.soLineForm.value.shipmentUnit) {
            let CF = null;
            if (filteredProduct.inventoryUnit == this.soLineForm.value.shipmentUnit) {
              CF = DecimalUtils.valueOf(1);
            }
            else {
              const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === this.soLineForm.value.shipmentUnit &&
                uom.unitConversionTo === filteredProduct.inventoryUnit && uom.productMasterInfo.productIDName === filteredProduct.productIDName);
              CF = filteredUOMConversion ? filteredUOMConversion.conversionFactor : null;
            }
            if (CF) {
              this.soLineForm.controls.quantity.setValue(DecimalUtils.multiply(this.soLineForm.value.orderQuantity, CF));
              if (!this.currentEditProductId) {
                this.soLineForm.controls.orderUnitPrice.setValue(DecimalUtils.multiply(this.priceFromBE, CF));
              }
              else {
                this.soLineForm.controls.unitPrice.setValue(this.existedUnitPrice);
                this.soLineForm.controls.orderUnitPrice.setValue(DecimalUtils.multiply(this.existedUnitPrice, CF));
              }
              if (this.locAllocation.pickingLocationAllocationType == 'Manual') {
                this.soLineForm.controls.inventoryHelpers.setValue(null);
                // this.returnShowValues = null;
                this.selectedReceiveRecords = [];
              }
            } else {
              if (filteredProduct.uomConversionAvailability == 'Yes') {
                this.toastr.error('No matching Unit Conversion Factor');
                this.soLineForm.controls.quantity.setValue(null);
              }
              else {
                this.soLineForm.controls.quantity.setValue(null);
                this.showQuantity = false;
              }
            }
            this.calculate(type);
          }
        }
      });
  }
  calculateReceivedQtyForTable(line, i, secondTable?) {
    const arr = secondTable ? 'salesOrderLinesAll' : 'soArrayLines';
    if (line.orderQuantity) {
      if (!secondTable) {
        this.soArrayLines[i].showQuantity = true;
        this.soArrayLines[i].isChecked = true;
      }
      this.onlyHeaderUpdateToggle = false;
      // const filteredProduct = this.products.find(product => product.productIDName === line.productMasterInfo.productIDName);
      this.wmsService.fetchProductDetailsById(line.productMasterInfo.productMasterID, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productMaster) {
            const filteredProduct = response.data.productMaster;
            if (filteredProduct && filteredProduct.inventoryUnit && line.shipmentUnit) {
              let CF = null;
              if (filteredProduct.inventoryUnit == line.shipmentUnit) {
                CF = DecimalUtils.valueOf(1);
              }
              else {
                const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === line.shipmentUnit &&
                  uom.unitConversionTo === filteredProduct.inventoryUnit && uom.productMasterInfo.productIDName === filteredProduct.productIDName);
                CF = filteredUOMConversion ? filteredUOMConversion.conversionFactor : null;
              }
              if (CF) {
                this[arr][i].quantity = DecimalUtils.multiply(line.orderQuantity, CF);
                this[arr][i].orderUnitPrice = DecimalUtils.multiply(line.unitPrice, CF);
                if (this.locAllocation.pickingLocationAllocationType == 'Manual') {
                  this[arr][i].inventoryHelpers = null;
                  // this.returnShowValues = null;
                  this.finalReceiveObj = null;
                  this.selectedReceiveRecords = [];
                }
              } else {
                if (filteredProduct.uomConversionAvailability == 'Yes') {
                  this.toastr.error('No matching Unit Conversion Factor');
                  this.soArrayLines[i].quantity = null;
                }
                else {
                  this.soArrayLines[i].quantity = null;
                  this.soArrayLines[i].showQuantity = false;
                }
              }
              this.calculateForTable(line, i, arr, secondTable);
            }
          }
        })
    }
    else {
      this[arr][i].isChecked = false;
      this[arr][i].quantity = null;
      this[arr][i].orderUnitPrice = null;
      if (this.locAllocation.pickingLocationAllocationType == 'Manual') {
        this[arr][i].inventoryHelpers = null;
      }
      this.calculateForTable(line, i, arr, secondTable);
    }
  }
  calUnitPrice(table?, line?, i?) {
    const values = line ? line : this.soLineForm.value;
    const uomConversion = DecimalUtils.divide(values.quantity, values.orderQuantity);
    if (table) {
      this.soArrayLines[i].orderUnitPrice = DecimalUtils.multiply(this.priceFromBE, uomConversion);
      this.calculateForTable(line, i, 'soArrayLines', null);
    }
    else {
      this.soLineForm.controls.orderUnitPrice.setValue(DecimalUtils.multiply(this.priceFromBE, uomConversion));
      this.calculate();
    }
  }
  getExpDate(event) {
    if (event && this.leadTime) {
      let result = new Date(event);
      result.setDate(result.getDate() + this.leadTime);
      this.soHeaderForm.controls.deliveryExpDate.setValue(this.datePipe.transform(new Date(result), 'yyyy-MM-dd'));
    }
    else {
      this.soHeaderForm.controls.deliveryExpDate.setValue(null);
    }
    this.addLineDate(this.soHeaderForm, this.soLineForm);
  }
  addLineDate(headerForm, lineform, key?) {
    if (this.showTableType == 'Yes') {
      this.soArrayLines.forEach(element => {
        if (key) {
          element[key] = headerForm.controls[key].value;
        }
        else {
          element.expectedDeliveryDate = headerForm.controls.deliveryExpDate.value;
        }
      });
    }
    else {
      if (key) {
        lineform.controls[key].setValue(headerForm.controls[key].value);
      }
      else {
        lineform.controls.expectedDeliveryDate.setValue(headerForm.controls.deliveryExpDate.value);
      }
    }
  }
  fetchAllMetaData() {
    this.metaDataService.getAllSerialNumberConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberAllocation = res.data.serialNumberConfigurations[0].serialNumberCheck;
        if (this.serialNumberAllocation == 'Yes') {
          this.soTablekeys = ['#', 'WMSO Line Number', 'Product ID', 'Product Name', 'Customer Order Quantity', 'Quantity', 'Serial Number', 'Location Names', 'Unit Price',
            'Discount', 'Tax1%', 'Tax2%', 'Tax3%', 'Tax4%', 'Tax5', 'Amount', 'Remarks', 'Action'];
        }
      }
      else {
        this.serialNumberAllocation = 'No';
      }
    })
    this.metaDataService.fetchAllTermOfPayments(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.termsOfPayments) {
          this.termsOfPayments = response.data.termsOfPayments;
        } else {
          this.termsOfPayments = [];
        }
      },
      (error) => {
        this.termsOfPayments = [];
      });
    this.metaDataService.fetchAllTaxGroups(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.taxGroups) {
          this.taxGroups = response.data.taxGroups;
        } else {
          this.taxGroups = [];
        }
      },
      (error) => {
        this.taxGroups = [];
      });
    this.metaDataService.fetchAllCurrencies(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.currencies) {
          this.currencies = response.data.currencies;
        } else {
          this.currencies = [];
        }
      },
      (error) => {
        this.currencies = [];
      });
    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
    this.metaDataService.fetchAllShipmentTimeSlots(this.formObj).subscribe(
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
    this.metaDataService.fetchAllPaymentMode(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.paymentModes.length) {
          this.paymentModes = response.data.paymentModes;
        }
      },
      error => {
        this.paymentModes = [];
      });
    this.sourceFromDropdowns = [];
    this.billToDropdowns = [];

    this.wmsService.fetchWareHouseDetailsByID(Constants.WAREHOUSE_ID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse && response.data.wareHouse) {
          this.sourceFromDropdowns = response.data.wareHouse.shipFromAddresses;
          this.soHeaderForm.controls.shipFromAddress.setValue(response.data.wareHouse.shipFromAddresses.find(x => x.defaultAddress).name);
        } else {
          this.soHeaderForm.controls.shipFromAddress.setValue(null);
        }
      },
      (error) => {
        this.soHeaderForm.controls.shipFromAddress.setValue(null);
      });
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {

      });
    this.metaDataService.getLocationAllocationType(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.pickingLocationAllocationConfigurations && res.data.pickingLocationAllocationConfigurations.length > 0) {
        this.locAllocation = res.data.pickingLocationAllocationConfigurations[0];
        this.soLineForm.controls.locationAllocationType.setValue(res.data.pickingLocationAllocationConfigurations[0].pickingLocationAllocationType)
      }
      else {
        this.locAllocation = { "_id": null, "pickingLocationAllocationType": "Manual", "isActive": true }
        this.soLineForm.controls.locationAllocationType.setValue("Manual");
      }
    })
    this.metaDataService.getAllSerialNumberConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberCheckFrmConfig = res.data.serialNumberConfigurations[0].serialNumberCheck;
      }
      else {
        this.serialNumberCheckFrmConfig = "No";
      }
    })
    this.metaDataService.fetchAllTermsAndConditions(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.TermsAndConditions.length) {
          for (let i = 0; i < response.data.TermsAndConditions.length; i++) {
            if (response.data.TermsAndConditions[i].type === 'so') {
              this.termsAndConditions = response.data.TermsAndConditions[i].termsAndConditions;
              break;
            }
          }
        }
      },
      error => {
      });
    this.metaDataService.fetchAllSalesOrderWithInventories(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.salesOrderInventoryConfigurations && res.data.salesOrderInventoryConfigurations.length > 0) {
        this.inCheckfromConfig = res.data.salesOrderInventoryConfigurations[0].inventoryCheck;
      }
    })
    this.metaDataService.findAllSalesOrderConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.salesOrderPanelViewConfigurations && res.data.salesOrderPanelViewConfigurations.length > 0) {
        this.showTableType = res.data.salesOrderPanelViewConfigurations[0].viewType;
      }
      else {
        this.showTableType = 'No';
      }
    })
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
  shouldShowSuccess(fieldName, formName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this[formName].controls[fieldName].valid && this[formName].controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  onCustomerIDNameChange(event) {
    const soHeaderData = this.soHeaderForm.value;
    if (event && soHeaderData && soHeaderData.customerMasterInfo && soHeaderData.customerMasterInfo.customerIDName) {
      this.customerList.forEach((customer) => {
        if (customer.customerIDName === soHeaderData.customerMasterInfo.customerIDName) {
          this.soHeaderForm['controls'].customerMasterInfo['controls'].customerName.setValue(customer.customerName);
          this.soHeaderForm['controls'].customerMasterInfo['controls'].customerID.setValue(customer.customerID);
          this.soHeaderForm['controls'].customerMasterInfo['controls'].customerMasterID.setValue(customer._id);
          this.soHeaderForm.controls.taxGroup.setValue(customer.taxGroup);
          this.soHeaderForm.controls.currency.setValue(customer.currency);
          this.soHeaderForm.controls.termsOfPayment.setValue(customer.termsOfPayment);
          this.sourceToDropdowns = customer.shipToAddresses;
          this.soHeaderForm.controls.shipToAddress.setValue(customer.shipToAddresses.find(x => x.defaultAddress).name);
          this.billToDropdowns = customer.billToAddresses;
          this.soHeaderForm.controls.billToAddress.setValue(customer.billToAddresses.find(x => x.defaultAddress).name);
          this.soHeaderForm.controls.organizationInfo.setValue(customer.organizationInfo);
          this.soHeaderForm.controls.wareHouseInfo.setValue(customer.wareHouseInfo);
          this.soHeaderForm.controls.soOrderDate.setValue(this.apexService.getDateFromMilliSec(new Date()));
          this.leadTime = customer.leadTime;
          this.getExpDate(this.soHeaderForm.controls.soOrderDate.value);
          const customerDetails = {
            customerMasterID: customer._id,
            customerID: customer.customerID,
            customerIDName: customer.customerIDName,
            customerName: customer.customerName
          };
          this.getCustomerEditpageDetails(customerDetails, soHeaderData);
          // this.findAllTaxes();
        }
      });
      if (this.showTableType == 'Yes') {
        this.getInventoryDetails();
      }
    }
    else {
      const customerDetails = {
        customerMasterID: null,
        customerID: null,
        customerIDName: null,
        customerName: null
      };
      this.leadTime = null;
      const oldOne = this.soHeaderForm.value;
      this.createSalesOrderService.createCustomerIDNameChange(customerDetails);
      this.createSOHeaderForm();
      this.createSOLinesForm();
      this.createSalesOrderService.clearProductDetails();
      this.soHeaderForm.controls.shipFromAddress.setValue((typeof (oldOne.shipFromAddress)) == 'string' ? oldOne.shipFromAddress : oldOne.shipFromAddress.name);
      this.productLogo = null;
      if (this.showImage) {
        const element = <HTMLImageElement>(document.getElementById('pLogo'));
        element.src = null;
      }
    }
  }
  getInventoryDetails() {
    const form = this.soHeaderForm.value;
    if (form.customerMasterInfo && !form.customerMasterInfo.customerIDName) {
      form.customerMasterInfo = null;
    }
    if (form.wareHouseTransferDestinationInfo && !form.wareHouseTransferDestinationInfo.wareHouseIDName) {
      form.wareHouseTransferDestinationInfo = null;
    }
    if (form.supplierMasterInfo && !form.supplierMasterInfo.supplierIDName) {
      form.supplierMasterInfo = null;
    }
    if (typeof (form.shipToAddress) == 'string') {
      form.shipToAddress = this.setJsonto(form.shipToAddress)
    }
    if (typeof (form.shipFromAddress) == 'string') {
      form.shipFromAddress = this.setJsonFrom(form.shipFromAddress)
    }
    if (typeof (form.billToAddress) == 'string') {
      form.billToAddress = this.setJsonBillTo(form.billToAddress)
    }
    form['salesOrderLines'] = [this.soLineForm.value];
    if (this.pByCMapping != 'Yes') {
      // form.customerMasterInfo = null;
    }
    this.wmsService.fetchInventoriesForSalesOrders(form).subscribe(res => {
      if (res['status'] == 0 && res['data'].salesOrder.salesOrderLines) {
        this.soArrayLines = res['data'].salesOrder.salesOrderLines;
        this.soArrayLines.forEach(element => {
          element.isChecked = false;
          element.showQuantity = true;
          element.pickingLocationAllocationType = this.locAllocation.pickingLocationAllocationType;
          if (this.soHeaderForm.controls.deliveryExpDate.value) {
            element.expectedDeliveryDate = this.soHeaderForm.controls.deliveryExpDate.value;
          }
          if (this.soHeaderForm.controls.exBondNumber.value) {
            element.exBondNumber = this.soHeaderForm.controls.exBondNumber.value;
          }
          if (this.soHeaderForm.controls.exBondDate.value) {
            element.exBondDate = this.soHeaderForm.controls.exBondDate.value;
          }
        });
      }
    })
  }
  getCustomerEditpageDetails(customerDetails, soHeaderData) {
    this.createSalesOrderService.createCustomerIDNameChange(customerDetails);
    this.fetchAllProductsByCustomer(soHeaderData.customerMasterInfo.customerIDName);
  }
  // clear() {
  //   if (this.permissionsList.includes('Update')) {
  //     this.soHeaderForm.reset();
  //     this.soHeaderForm.controls.orderType.setValue('Sales Order');
  //     this.createSalesOrderService.clearCustomerDetails();
  //   }
  //   else {
  //     this.toastr.error("user doesnt have permission");
  //   }

  // }
  fetchAllProductsByCustomer(customer) {
    if (this.pByCMapping == 'Yes') {
      this.IBMDService.fetchProductCustomerByID(customer, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productByCustomer) {
            this.productList = response.data.productByCustomer.productMasterInfos;
            this.productList.forEach(item => {
              for (const subkey in item) {
                if (subkey === 'productIDName' && this.productIDNames.indexOf(item[subkey]) === -1) {
                  this.productIDNames.push(item[subkey]);
                }
              }
            });
            this.productsDataService = this.completerService.local(this.productIDNames);
          } else {
            this.productsDataService = this.completerService.local(this.productIDNames);
          }
        },
        (error) => {
          this.productIDNames = [];
        });
    }
    else {
      this.productList = this.products;
      // this.productsDataService = this.products.map(x => x.productIDName);
    }
  }
  onProductIDNameChange(event, isEdit?, type?) {
    this.selectedReceiveRecords = [];
    const form = this.soHeaderForm.value
    if (event) {
      if (!isEdit) {
        let date = form.deliveryExpDate ? form.deliveryExpDate.toLocaleString() : null;
        this.soLineForm.controls.expectedDeliveryDate.setValue(date);
        let date1 = form.exBondDate ? form.exBondDate.toLocaleString() : null;
        this.soLineForm.controls.exBondDate.setValue(date1);
        this.soLineForm.controls.exBondNumber.setValue(form.exBondNumber ? form.exBondNumber : null);
      }
      this.productLogo = null;
      if (this.showImage) {
        const element = <HTMLImageElement>(document.getElementById('pLogo'));
        element.src = null;
      }
      this.onlyHeaderUpdateToggle = false;
      const createSOLineEntity = this.soLineForm.value;
      if (createSOLineEntity && createSOLineEntity.productMasterInfo.productIDName) {
        // let proceed: boolean = true;
        // if (!this.currentEditProductId && this.salesOrderLinesAll.length > 0) {
        //   const index = this.salesOrderLinesAll.findIndex(x => x.productMasterInfo.productIDName == createSOLineEntity.productMasterInfo.productIDName);
        //   proceed = (index == -1) ? true : false;
        // }
        // if (proceed) {
        let selectedProduct = this.productList.filter(k => k.productIDName === createSOLineEntity.productMasterInfo.productIDName)
        if (selectedProduct && selectedProduct.length > 0) {
          this.brandList = (selectedProduct && selectedProduct.length > 0) ? selectedProduct[0].brandNames : null;
          this.productList.forEach((product) => {
            // console.log(product.expectedDeliveryDate);
            // const pMasterData = this.products.find(x => x.productIDName == createSOLineEntity.productMasterInfo.productIDName)
            if (product.productIDName === createSOLineEntity.productMasterInfo.productIDName) {
              this.soLineForm['controls'].productMasterInfo['controls'].productID.setValue(product.productID);
              this.soLineForm['controls'].productMasterInfo['controls'].productName.setValue(product.productName);
              this.soLineForm['controls'].productMasterInfo['controls'].productMasterID.setValue((this.pByCMapping == 'Yes') ? product.productMasterID : product._id);
              this.soLineForm['controls'].productMasterInfo['controls'].productIDName.setValue(product.productIDName);
              // this.soLineForm.controls.upcEANNumber.setValue(product.upcEANNumber);

              this.wmsService.fetchProductDetailsById(this.soLineForm['controls'].productMasterInfo['controls'].productMasterID.value, this.formObj).subscribe(
                (response) => {
                  if (response && response.status === 0 && response.data.productMaster) {
                    const pMasterData = response.data.productMaster;
                    if (pMasterData) {
                      this.soLineForm['controls'].productImage.setValue(pMasterData.productImage);
                      this.soLineForm['controls'].currency.setValue(pMasterData.currency);
                      this.soLineForm['controls'].hsnCode.setValue(pMasterData.hsnCode);
                      this.soLineForm.controls.productDescription.setValue(pMasterData.productDescription);
                    }
                    if (!isEdit) {
                      let name = this.soHeaderForm.value.shipToAddress;
                      if (typeof (this.soHeaderForm.value.shipToAddress) == 'object') {
                        name = this.soHeaderForm.value.shipToAddress.name
                      }
                      const shipFromObj = this.sourceToDropdowns.find(x => x.name == name);

                      const payload = {
                        "organizationIDName": this.configService.getGlobalpayload().organizationIDName,
                        "wareHouseIDName": this.configService.getGlobalpayload().wareHouseIDName,
                        "taxName": null,
                        "hsnCode": pMasterData ? pMasterData.hsnCode : null,
                        "countryName": shipFromObj ? shipFromObj.country : null,
                        "stateName": shipFromObj ? shipFromObj.state : null,
                        "supplierIDName": null,
                        "customerIDName": this.soHeaderForm.value.customerMasterInfo.customerIDName,
                        "type": "SaleTax",
                        "productIDName": product.productIDName,
                      }
                      this.wmsService.fetchTaxesforOrder(payload).subscribe(res => {
                        if (res['status'] == 0 && res['data'].taxMasters && res['data'].taxMasters.length > 0) {
                          this.taxData = res['data'].taxMasters;
                          this.soLineForm['controls'].saleTaxes.setValue(res['data'].taxMasters.map(x => x.taxNamePercentage));
                          this.calculateTaxPercentage();
                        }
                        else {
                          this.soLineForm['controls'].saleTaxes.setValue(null);
                          this.taxData = [];
                          this.calculateTaxPercentage();
                        }
                      })
                    }
                    this.soLineForm.controls.dispathInstruciton.setValue(pMasterData ? pMasterData.dispathInstruciton : null);
                    this.soLineForm.controls.inventoryUnit.setValue(product.receivingUnit);
                    this.soLineForm.controls.shipmentUnit.setValue((this.pByCMapping == 'Yes') ? product.receivingUnit : product.shipmentUnit);
                    if (this.bConfig) {
                      this.soLineForm.controls.shipmentUnit.setValue(this.bConfig.unitCode);
                    }
                    const productMasterInfo = {
                      productMasterID: (this.pByCMapping == 'Yes') ? product.productMasterID : product._id,
                      productID: product.productID,
                      productIDName: product.productIDName,
                      productName: product.productName
                    };
                    this.soLineForm.controls.locationAllocationType.setValue(this.locAllocation.pickingLocationAllocationType);
                    this.createSalesOrderService.createSOProductIDChange(productMasterInfo);
                    this.fetchProductDetailsByID((this.pByCMapping == 'Yes') ? product.productMasterID : product._id, type);
                    if (pMasterData && pMasterData.productImage && this.showImage) {
                      const fileNames = JSON.parse(JSON.stringify(pMasterData.productImage));
                      this.metaDataService.viewImages(fileNames).subscribe(data => {
                        if (data['status'] == 0) {
                          this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
                          this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
                          this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
                        }
                      });
                    }
                  }
                })
            }
          });
          // this.fetchAllInventories();
          this.calAvailQuantityUsingInventory();
          if (!this.currentEditProductId) {
            this.fetchPrice();
          }
          // }
          // else {
          //   this.toastr.error("Already Exists");
          //   this.soLineForm.controls.productMasterInfo['controls'].productIDName.setValue(null);
          // }
        }
        else {
          this.toastr.error('No Matching Product');
        }
      }
    }
    else {
      this.createSOLinesForm();
      this.createSalesOrderService.clearProductDetails();
    }
  }
  fetchProductDetailsByID(id, type) {
    const form = this.soLineForm.value
    if (id) {
      this.wmsService.fetchProductDetailsById(id, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productMaster) {
            // this.soLineForm.controls.upcEANNumber.setValue(response.data.productMaster.upcEANNumber);
            this.soLineForm.controls.storageUnit.setValue(response.data.productMaster.storageUnit);
            this.soLineForm.controls.inventoryUnit.setValue(response.data.productMaster.inventoryUnit);
            if (!this.currentEditProductId) {
              this.calAvailQuantityUsingInventory();
              this.fetchPrice(type);
            }
            else {
              if (type && type != 'scanEdit') {
                this.soLineForm.controls.orderQuantity.setValue(1);
                this.calculateReceivedQty(type);
              }
              else if (type && type == 'scanEdit') {
                this.soLineForm.controls.orderQuantity.setValue(DecimalUtils.add(this.soLineForm.controls.orderQuantity.value, 1));
                this.calculateReceivedQty(type);
              }
            }
            //using in editmode
            if (this.currentEditProductId && form.productMasterInfo.productID &&
              this.currentEditProductId !== form.productMasterInfo.productID) {
              this.calculate();
              this.currentEditProductId = null;
            }
          } else {
            this.soLineForm.controls.unitPrice.setValue(null);
          }
        },
        (error) => {
          this.soLineForm.controls.unitPrice.setValue(null);
        });
    }

  }
  // fetchAllInventories() {
  //   this.wmsService.findAllInventories('', this.formObj).subscribe(
  //     (response) => {
  //       if (response && response.status === 0 && response.data.inventories) {
  //         this.inventories = response.data.inventories;
  //         const bIn = response.data.inventories.filter(x => x.batchNumber != null);
  //         const sIn = response.data.inventories.filter(x => x.serialNumber != null);
  //         const dupBin = bIn ? bIn.map(x => x.batchNumber) : null;
  //         this.batchNumberIDs = this.removeDuplicates(dupBin);
  //         const dupsIn = sIn ? sIn.map(x => x.serialNumber) : null;
  //         this.serialNumberIDs = this.removeDuplicates(dupsIn);
  //       } else {
  //         this.inventories = [];
  //         this.batchNumberIDs = null;
  //         this.serialNumberIDs = null;
  //       }
  //     },
  //     (error) => {
  //       this.inventories = [];
  //       this.batchNumberIDs = null;
  //       this.serialNumberIDs = null;
  //     });
  // }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  removeLocationsWhenManual() {
    this.selectedReceiveRecords = [];
    this.finalReceiveObj = null;
    if (this.locAllocation.pickingLocationAllocationType == 'Manual') {
      this.soLineForm.controls.inventoryHelpers.setValue(null);
    }
    this.calAvailQuantityUsingInventory();
  }
  calAvailQuantityUsingInventory() {
    let formValue: any = {};
    formValue = this.soHeaderForm.value;
    const formLine = this.soLineForm.value;
    if (formLine.saleTaxes && formLine.saleTaxes.length > 0) {
      const purchase = JSON.parse(JSON.stringify(formLine.saleTaxes));
      formLine.saleTaxes = [];
      purchase.forEach(inner => {
        if (typeof (inner) == 'string') {
          formLine.saleTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
        }
        else {
          formLine.saleTaxes.push(inner);
        }
      });
    }
    formValue['salesOrderLines'] = [formLine];
    if (typeof (formValue.shipToAddress) == 'string') {
      formValue.shipToAddress = this.setJsonto(formValue.shipToAddress)
    }
    if (typeof (formValue.shipFromAddress) == 'string') {
      formValue.shipFromAddress = this.setJsonFrom(formValue.shipFromAddress)
    }
    if (typeof (formValue.billToAddress) == 'string') {
      formValue.billToAddress = this.setJsonBillTo(formValue.billToAddress)
    }
    this.outboundProcessService.checkInventoryforSalesOrder(formValue).subscribe(res => {
      if (res['status'] == 0 && res['data'].inventoryDetails) {
        this.soLineForm.controls.availableQuantity.setValue(res['data'].inventoryDetails.quantity);
      }
      else {
        this.soLineForm.controls.availableQuantity.setValue(null);
      }
    })

  }
  calculateTaxPercentage() {
    if (this.soLineForm.controls.saleTaxes.value && this.soLineForm.controls.saleTaxes.value.length > 0) {
      this.soLineForm.controls.taxAmount.setValue(0);
      this.calculate();
    }
    else {
      this.soLineForm.controls.taxAmount.setValue(0);
      this.calculate();
    }
  }
  calculate(type?) {
    let amount: any = 0;
    let taxes: any = 0;
    let taxPercentage: any = 0;
    const soLine = this.soLineForm.value;
    if (soLine.orderUnitPrice && soLine.orderQuantity) {
      amount = DecimalUtils.multiply(soLine.orderUnitPrice, soLine.orderQuantity);
      this.soLineForm.controls.grossAmount.setValue(amount);

      if (soLine.discount) {
        amount = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(soLine.discount, 100)), amount);
        this.soLineForm.controls.discountAmount.setValue((DecimalUtils.subtract(this.soLineForm.controls.grossAmount.value, amount)));
      }
      if (soLine.saleTaxes && soLine.saleTaxes.length > 0) {
        soLine.saleTaxes.forEach(el => {
          const filter = this.taxData.find(x => x.taxNamePercentage == el);
          taxPercentage = DecimalUtils.add(taxPercentage, (filter ? filter.taxPercentage : 0))
        });
        this.soLineForm.controls.taxPercentage.setValue(taxPercentage);
        soLine.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);

        this.soLineForm.controls.taxAmount.setValue(soLine.taxAmount);
        taxes = soLine.taxAmount;
      }
      this.soLineForm.controls.netAmount.setValue((DecimalUtils.add(amount, taxes)));
      if (type) {
        if (soLine.orderUnitPrice != 0 && this.soHeaderForm.controls.deliveryExpDate.value && this.soLineForm.controls.expectedDeliveryDate.value) {
          this.checkAvailablity();
        }
        else {
          this.toastr.error('Enter Manditory Dates');
        }
      }
    }
    else {
      this.soLineForm.controls.netAmount.setValue(null);
      this.soLineForm.controls.grossAmount.setValue(null);
      this.soLineForm.controls.taxAmount.setValue(null);
      this.soLineForm.controls.discountAmount.setValue(null);
      this.soLineForm.controls.taxPercentage.setValue(null);
    }
  }
  calculateForTable(line, i, arr, secondTable) {
    let amount: any = 0;
    let taxes: any = 0;
    let taxPercentage: any = 0;
    const soLine = line;
    if (soLine.orderUnitPrice && soLine.orderQuantity) {
      amount = DecimalUtils.multiply(soLine.orderUnitPrice, soLine.orderQuantity);
      this[arr][i].grossAmount = amount;
      if (soLine.discount) {
        amount = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(soLine.discount, 100)), amount);
        this[arr][i].discountAmount = (DecimalUtils.subtract(this[arr][i].grossAmount, amount));
      }
      if (soLine.saleTaxes && soLine.saleTaxes.length > 0) {
        soLine.saleTaxes.forEach(el => {
          let filter: any = 0;
          if (typeof (el) == 'object') {
            filter = el;
          }
          else {
            filter = this.taxData.find(x => x.taxNamePercentage == el);
          }
          taxPercentage = DecimalUtils.add(taxPercentage, (filter ? filter.taxPercentage : 0))
        });
        this[arr][i].taxPercentage = taxPercentage;
        soLine.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);

        this[arr][i].taxAmount = soLine.taxAmount;
        taxes = soLine.taxAmount;
      }
      this[arr][i].netAmount = (DecimalUtils.add(amount, taxes));
      if (secondTable) {
        this.checkAvailablity(null, secondTable, i, arr);
      }
    }
    else {
      this[arr][i].netAmount = null;
      this[arr][i].grossAmount = null;
      this[arr][i].taxAmount = null;
      this[arr][i].discountAmount = null;
      this[arr][i].taxPercentage = null;
    }
  }
  copyAvailabletoOrder() {
    this.soArrayLines.forEach((element, i) => {
      if (element.isChecked) {
        element.orderQuantity = element.availableQuantity;
        // element.shipmentUnit = element.inventoryUnit;
        this.calculateReceivedQtyForTable(element, i);
      }
    });
  }
  openFieldModal() {
    this.ngxSmartModalService.getModal('fieldsChange').open();
  }
  fetchPrice(type?) {
    this.priceFromBE = null;
    let formValue = {};
    formValue = this.soHeaderForm.value;
    const formLine = this.soLineForm.value;
    // formLine.salesOrderLines.forEach(outer => {
    if (formLine.saleTaxes && formLine.saleTaxes.length > 0) {
      const purchase = JSON.parse(JSON.stringify(formLine.saleTaxes));
      formLine.saleTaxes = [];
      purchase.forEach(inner => {
        if (typeof (inner) == 'string') {
          formLine.saleTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
        }
        else {
          formLine.saleTaxes.push(inner);
        }
      });
    }
    // });
    formValue['salesOrderLines'] = [formLine];
    this.wmsService.fetchProductSalePrice(formValue).subscribe(data => {
      if (data.status == 0) {
        this.soLineForm.controls.unitPrice.setValue(data.data.productSalePrice);
        this.priceFromBE = data.data.productSalePrice;
        // this.soLineForm.controls.orderUnitPrice.setValue(this.priceFromBE * filteredUOMConversion.conversionFactor);
        if (type && type != 'scanEdit') {
          this.soLineForm.controls.orderQuantity.setValue(1);
          this.calculateReceivedQty(type);
        }
        else if (type && type == 'scanEdit') {
          this.soLineForm.controls.orderQuantity.setValue(DecimalUtils.add(this.soLineForm.controls.orderQuantity.value, 1));
          this.calculateReceivedQty(type);
        }
        if (!this.currentEditProductId) {
          this.calculateReceivedQty()
        }
        this.calculate();
      }
      else {
        this.soLineForm.controls.unitPrice.setValue(null);
      }
    })
  }
  openModalRecievedLocations(line, i) {
    this.pageForTableForReceive = 1;
    const lineValue = line ? line : this.soLineForm.value;
    this.selectedReceiveRecords = lineValue.inventoryHelpers;
    this.selectedLineIndex = i;
    if (lineValue && lineValue.orderQuantity) {
      this.ngxSmartModalService.getModal('pickupLocationsModal').open();
      let formValue = {};
      formValue = this.soHeaderForm.value;
      const formLine = lineValue;
      if (formLine.saleTaxes && formLine.saleTaxes.length > 0) {
        const purchase = JSON.parse(JSON.stringify(formLine.saleTaxes));
        formLine.saleTaxes = [];
        purchase.forEach(inner => {
          if (typeof (inner) == 'string') {
            formLine.saleTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
          }
          else {
            formLine.saleTaxes.push(inner);
          }
        });
      }
      formValue['salesOrderLines'] = [formLine];

      this.fetchAllPickupLocations(formValue, 1);
    }
    else {
      this.toastr.error("Enter Ordered Quantity!!")
    }
    // }
    // else {
    //   this.toastr.error("Enter Manditory Fields!!")
    // }
  }
  returnLocationsByLocationName(event) {
    if (event) {
      this.pickupLocations = this.pickupLocations.filter(x => x.locationInfo.locationName == event.originalObject);
    }
    else {
      this.pickupLocations = this.returnALLocations
    }
  }
  returnLocationsByBatchNumber(event) {
    if (event) {
      this.pickupLocations = this.pickupLocations.filter(x => x.batchNumber == event.originalObject);
    }
    else {
      this.pickupLocations = this.returnALLocations
    }
  }
  returnLocationsBySerialNumber(event) {
    if (event) {
      this.pickupLocations = this.pickupLocations.filter(x => x.serialNumber == event.originalObject);
    }
    else {
      this.pickupLocations = this.returnALLocations
    }
  }
  receiveLocForTablePagination(pageForTableForReceive, fromselectEntries?) {
    if (fromselectEntries) {
      this.pageForTableForReceive = 1;
    }
    let filteredRecieveLocations = [];
    filteredRecieveLocations = this.pickupLocations.filter(x => x.isChecked == true && x.pickedQuantity);
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
            this.selectedReceiveRecords[findIndex].pickedQuantity = element.pickedQuantity
          }
        })
      }
      else {
        this.selectedReceiveRecords = filteredRecieveLocations;
      }
      if (this.selectedLineIndex || this.selectedLineIndex == 0) {
        this.soArrayLines[this.selectedLineIndex].inventoryHelpers = filteredRecieveLocations
      }
      else {
        this.soLineForm.controls.inventoryHelpers.setValue(filteredRecieveLocations);
      }
    }

    this.fetchAllPickupLocations(this.finalReceiveObj, pageForTableForReceive);
  }
  fetchAllPickupLocations(val?, page?) {
    this.pickupLocations = [];
    if (typeof (val.shipToAddress) == 'string') {
      val.shipToAddress = this.setJsonto(val.shipToAddress)
    }
    if (typeof (val.shipFromAddress) == 'string') {
      val.shipFromAddress = this.setJsonFrom(val.shipFromAddress)
    }
    if (typeof (val.billToAddress) == 'string') {
      val.billToAddress = this.setJsonBillTo(val.billToAddress)
    }
    this.finalReceiveObj = val;
    const obj = {}
    obj['page'] = page ? page : this.pageForTableForReceive;
    obj['pageSize'] = parseInt(this.itemsPerPageForReceive);
    obj['searchKeyword'] = this.searchKeyForReceive;
    obj["searchOnKeys"] = ['locationName', 'bondNumber', 'bondDate', 'batchNumber', 'packingRemarks','serialNumber'];
    obj['salesOrder'] = val;
    this.wmsService.fetchAllPickupLocations(obj).subscribe(res => {
      if (res && res.status === 0 && res.data.inventoryPaginationResponse.inventoryHelpers && res.data.inventoryPaginationResponse.inventoryHelpers.length > 0) {
        this.pickupLocations = res.data.inventoryPaginationResponse.inventoryHelpers;
        this.totalItemsForReceive = res.data.inventoryPaginationResponse.totalElements;
        const bIn = res.data.inventoryPaginationResponse.inventoryHelpers.filter(x => x.batchNumber != null);
        const sIn = res.data.inventoryPaginationResponse.inventoryHelpers.filter(x => x.serialNumber != null);
        const dupBin = bIn ? bIn.map(x => x.batchNumber) : null;
        this.batchNumberIDs = this.removeDuplicates(dupBin);
        const dupsIn = sIn ? sIn.map(x => x.serialNumber) : null;
        this.serialNumberIDs = this.removeDuplicates(dupsIn);
        this.returnALLocations = this.pickupLocations;
        this.pickupLocationValues = this.pickupLocations.map(x => x.locationInfo.locationName);

        let locationHelpers = null;
        if (this.selectedLineIndex && (this.selectedLineIndex != -1 || this.selectedLineIndex == 0)) {
          if (this.soArrayLines[this.selectedLineIndex].inventoryHelpers && this.soArrayLines[this.selectedLineIndex].inventoryHelpers.length > 0) {
            locationHelpers = this.soArrayLines[this.selectedLineIndex].inventoryHelpers.map(x => x._id);
          }
        }
        if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
          locationHelpers = this.selectedReceiveRecords.map(x => x._id);
        }
        else {
          if (this.soLineForm.controls.inventoryHelpers.value && this.soLineForm.controls.inventoryHelpers.value.length > 0) {
            locationHelpers = this.soLineForm.controls.inventoryHelpers.value.map(x => x._id);
          }
        }
        this.pickupLocations.forEach(x => {
          x['isEdit'] = false;
          x['isChecked'] = false;
          if (locationHelpers && locationHelpers.length > 0 && locationHelpers.includes(x._id)) {
            let existed = null;
            if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
              existed = this.selectedReceiveRecords.find(y => y._id == x._id);
            }
            else {
              if (this.soLineForm.controls.inventoryHelpers.value && this.soLineForm.controls.inventoryHelpers.value.length > 0) {
                existed = this.soLineForm.controls.inventoryHelpers.value.find(y => y._id == x._id);
              }
              else {
                existed = this.soArrayLines[this.selectedLineIndex].inventoryHelpers.find(y => y._id == x._id);
              }
            }
            x['pickedQuantity'] = existed.pickedQuantity;
            x['isEdit'] = true;
            x['isChecked'] = true;
          }
        });
      }
      else {
        if (res.status == 2) {
          this.toastr.error(res.statusMsg);
        }
        this.pickupLocations = [];
        this.batchNumberIDs = null;
        this.serialNumberIDs = null;
      }
    });
  }
  saveAllocationType(key, i?) {
    if (i || i == 0) {
      this.soArrayLines[i].isChecked = true;
      this.soArrayLines[i].pickingLocationAllocationType = (key == 'Manual') ? 'Auto' : "Manual";

    }
    else {
      if (this.scanInprocess == false) {
        this.locAllocation.pickingLocationAllocationType = (key == 'Manual') ? 'Auto' : "Manual";
        this.soLineForm.controls.locationAllocationType.setValue((key == 'Manual') ? 'Auto' : "Manual");
      }
    }
  }
  ngOnDestroy(): void {
  }
  ngAfterViewInit(): void {
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  read1(event, data1) {
    this.pickupLocations.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.pickupLocations.find(x => x.isEdit == true);
      if (currentItem && (currentItem.pickedQuantity == null)) {
        this.toastr.warning('Please enter Picked Quantity');
      }
      this.pickupLocations.map(element => element.isEdit = false);
      data1.isEdit = true;
      if (currentItem && currentItem.pickedQuantity) {
        if (event.target.checked && data1.pickedQuantity) {
          data1.isChecked = event.target.value;
        }
        else if (event.target.checked && !data1.pickedQuantity) {
          data1.isChecked = event.target.value;
          data1.isEdit = true;
        }
        else {
          data1.isChecked = false;
          data1.isEdit = false;
          data1['pickedQuantity'] = '';
        }
      }
    }
    else {
      data1.isChecked = false;
      data1.isEdit = false;
      data1.pickedQuantity = null;
    }
    if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
      this.selectedReceiveRecords = this.selectedReceiveRecords.filter(x => x._id != data1._id);
    }
    if (this.selectedLineIndex || this.selectedLineIndex == 0) {
      if (this.soArrayLines[this.selectedLineIndex].inventoryHelpers && this.soArrayLines[this.selectedLineIndex].inventoryHelpers.length > 0) {
        this.soArrayLines[this.selectedLineIndex].inventoryHelpers = this.soArrayLines[this.selectedLineIndex].inventoryHelpers.filter(x => x._id != data1._id);
      }
    }
    else {
      if (this.soLineForm.controls.inventoryHelpers.value && this.soLineForm.controls.inventoryHelpers.value.length > 0) {
        this.soLineForm.controls.inventoryHelpers.setValue(this.soLineForm.controls.inventoryHelpers.value.filter(x => x._id != data1._id));
      }
    }
    this.pickupLocations.forEach(element => {
      if (element.pickedQuantity) {
        element.isChecked = true;
      }
    });
  }
  // onDocumentSelect1(event, form) {
  //   form.isChecked = false;
  //   if (event && form.pickedQuantity) {
  //   }
  //   else {
  //     if (event) {
  //       delete form.isChecked;
  //       this.toastr.error('Enter Picked Quantity')
  //     }
  //     else {
  //       form.isEdit = false;
  //       form['pickedQuantity'] = '';
  //     }
  //   }
  // }
  savequantity(value, data) {
    if (value == null || (typeof (value) == 'string' ? value.trim() : value) == '') {
      data.isEdit = false;
      data['pickedQuantity'] = '';
      data['isChecked'] = false;
    }
    else {
      if (DecimalUtils.greaterThanOrEqual(data.quantityInventoryUnit, value)) {
        data['pickedQuantity'] = value;
        data['isChecked'] = true;
        if (!this.selectedReceiveRecords) {
          this.selectedReceiveRecords = [];
        }
        if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
          const FI = this.selectedReceiveRecords.findIndex(x => x._id == data._id)
          if (FI == -1) {
            this.selectedReceiveRecords.push(data);
          }
          else {
            this.selectedReceiveRecords[FI].pickedQuantity = data.pickedQuantity;
          }
        }
        else {
          this.selectedReceiveRecords.push(data);
        }

      }
      else {
        data.isEdit = false;
        data['pickedQuantity'] = '';
        data['isChecked'] = false;
        this.toastr.error('Pickup Quantity should be less than or equal to Available Quantity')
      }
    }
  }
  validateDecimal(key) {
    this.soLineForm.controls[key].setValue(DecimalUtils.enterLimitedDecimals(this.soLineForm.controls[key].value));
  }
  validateLocationDecimal(i) {
    this.pickupLocations[i].pickedQuantity = DecimalUtils.enterLimitedDecimals(this.pickupLocations[i].pickedQuantity);
  }
  validate(key, type, i, secondTable?) {
    const arr = secondTable ? 'salesOrderLinesAll' : 'soArrayLines';
    this[arr][i][key] = DecimalUtils.enterLimitedDecimals(this[arr][i][key]);
  }
  closeEvent(modalType) {
    if (this.selectedLineIndex || this.selectedLineIndex == 0) {
      this.soArrayLines[this.selectedLineIndex].inventoryHelpers = this.finalPickupLocations;
    }
    else {
      this.soLineForm.controls.inventoryHelpers.setValue(this.finalPickupLocations);
    }
    this.ngxSmartModalService.getModal('pickupLocationsModal').close();
  }
  savePickupLocations() {
    let count: any = 0;
    if (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) {
      let filteredRecieveLocations = [];
      filteredRecieveLocations = this.pickupLocations.filter(x => x.isChecked == true && x.pickedQuantity);
      if (filteredRecieveLocations.length > 0) {
        const dummy = this.selectedReceiveRecords;
        if (dummy && dummy.length > 0) {
          filteredRecieveLocations.forEach(element => {
            const findIndex = this.selectedReceiveRecords.findIndex(srr => srr._id == element._id);
            if (findIndex == -1) {
              this.selectedReceiveRecords.push(element);
            }
            else {
              this.selectedReceiveRecords[findIndex].pickedQuantity = element.pickedQuantity
            }
          })
        }
        else {
          this.selectedReceiveRecords = filteredRecieveLocations;
        }
      }
      this.selectedReceiveRecords.forEach(element => {
        count = DecimalUtils.add(count, element.pickedQuantity);
      });
    }
    else {
      let filteredRecieveLocations = [];
      let existedRecords = [];
      filteredRecieveLocations = this.pickupLocations.filter(x => x.isChecked == true && x.pickedQuantity);
      if (filteredRecieveLocations.length > 0) {

        if (this.selectedLineIndex || this.selectedLineIndex == 0) {
          if (this.soArrayLines[this.selectedLineIndex].inventoryHelpers && this.soArrayLines[this.selectedLineIndex].inventoryHelpers.length > 0) {
            existedRecords = this.soArrayLines[this.selectedLineIndex].inventoryHelpers;
          }
        }
        else {
          if (this.soLineForm.controls.inventoryHelpers.value && this.soLineForm.controls.inventoryHelpers.value.length > 0) {
            existedRecords = this.soLineForm.controls.inventoryHelpers.value;
          }
        }

        const dummy = existedRecords;
        if (dummy && dummy.length > 0) {
          filteredRecieveLocations.forEach(element => {
            const findIndex = existedRecords.findIndex(srr => srr._id == element._id);
            if (findIndex == -1) {
              existedRecords.push(element);
            }
            else {
              existedRecords[findIndex].pickedQuantity = element.pickedQuantity
            }
          })
        }
        else {
          existedRecords = filteredRecieveLocations;
        }
      }
      existedRecords.forEach(element => {
        count = DecimalUtils.add(count, element.pickedQuantity);
      });
    }
    let countValue = this.soLineForm.controls.quantity.value;
    if (this.selectedLineIndex || this.selectedLineIndex == 0) {
      countValue = this.soArrayLines[this.selectedLineIndex].quantity;
    }
    if (DecimalUtils.equals(count, countValue)) {
      this.ngxSmartModalService.getModal('pickupLocationsModal').close();
      this.toastr.success('Saved');
      let filteredRecieveLocations = (this.selectedReceiveRecords && this.selectedReceiveRecords.length > 0) ? this.selectedReceiveRecords.filter(x => x.pickedQuantity) : this.pickupLocations.filter(x => x.isChecked == true && x.pickedQuantity);
      if (filteredRecieveLocations.length > 0) {
        // this.returnShowValues = filteredRecieveLocations.map(x => x.locationInfo.locationName).toString();
        filteredRecieveLocations.forEach(element => {
          delete element.isEdit;
          delete element.isChecked;
        });
      }
      if (this.selectedLineIndex || this.selectedLineIndex == 0) {
        this.soArrayLines[this.selectedLineIndex].inventoryHelpers = filteredRecieveLocations
      }
      else {
        this.soLineForm.controls.inventoryHelpers.setValue(filteredRecieveLocations);
      }
      this.finalPickupLocations = this.selectedReceiveRecords;
      this.selectedReceiveRecords = [];
    }
    else {
      this.toastr.error("Selected Locations Quantity should be equal to Ordered Quantity");
    }
  }
  resetRecieveLocations() {
    if (this.permissionsList.includes('Update')) {
      // let formValue = {};
      // formValue = this.soHeaderForm.value;
      // formValue['salesOrderLines'] = [this.soLineForm.value];
      this.selectedReceiveRecords = [];
      this.finalReceiveObj = null;
      this.fetchAllPickupLocations(this.finalReceiveObj, 1);
      // this.returnShowValues = null;

    }
    else {
      this.toastr.error("user doesnt have permmission");
    }
  }
  checkAvailablity(table?, secondTable?, i?, arr?) {
    if (this.id && this.onlyHeaderUpdateToggle) {
      const form = this.soHeaderForm.value;
      form.salesOrderLines = this.salesOrderLinesAll;
      form.soOrderDate = form.soOrderDate ? new Date(form.soOrderDate) : null;
      form.deliveryExpDate = form.deliveryExpDate ? new Date(form.deliveryExpDate) : null;
      if (form.customerMasterInfo && !form.customerMasterInfo.customerIDName) {
        form.customerMasterInfo = null;
      }
      if (form.wareHouseTransferDestinationInfo && !form.wareHouseTransferDestinationInfo.wareHouseIDName) {
        form.wareHouseTransferDestinationInfo = null;
      }
      if (form.supplierMasterInfo && !form.supplierMasterInfo.supplierIDName) {
        form.supplierMasterInfo = null;
      }
      if (typeof (form.shipToAddress) == 'string') {
        form.shipToAddress = this.setJsonto(form.shipToAddress)
      }
      if (typeof (form.shipFromAddress) == 'string') {
        form.shipFromAddress = this.setJsonFrom(form.shipFromAddress)
      }
      if (typeof (form.billToAddress) == 'string') {
        form.billToAddress = this.setJsonBillTo(form.billToAddress)
      }
      this.saveContintion1(form, table);
    }
    else {
      if (this.inCheckfromConfig == 'Yes') {
        const final = Object.assign({
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }, this.soLineForm.value);
        if (table) {
          let proceed = true;
          let toastrMsg = null;
          const lines = this.soArrayLines.filter(x => x.isChecked);
          if (lines.length > 0) {
            if (proceed) {
              lines.forEach(element => {
                if (element.pickingLocationAllocationType == 'Manual' && (element.inventoryHelpers == null ||
                  element.inventoryHelpers == 'null' ||
                  element.inventoryHelpers.length == 0)) {
                  proceed = false;
                  toastrMsg = 'Select Pick location';
                }
                else if (!element.expectedDeliveryDate) {
                  proceed = false;
                  toastrMsg = 'Select Expected Delivery Date'
                }
                else {
                  if (element.pickingLocationAllocationType == 'Auto') {
                    element.inventoryHelpers = null;
                  }
                  else {
                    let count: any = 0;
                    element.inventoryHelpers.forEach(li => {
                      count = DecimalUtils.add(count, li.pickedQuantity);
                    });
                    let countValue = element.quantity;
                    if (DecimalUtils.notEquals(count, countValue)) {
                      element.inventoryHelpers = null;
                      this.selectedReceiveRecords = [];
                      proceed = false;
                      toastrMsg = "Selected Locations Quantity should be equal to Ordered Quantity";
                    }
                  }
                }
              });
            }
          }
          if (proceed) {
            this.save(table);
          }
          else {
            this.toastr.error(toastrMsg);
          }
        }
        else {
          this.save(null, secondTable, i, arr);
        }
        // }
        // }
        // else {
        //   if (res.status == 2) {
        //     this.toastr.error(res.statusMsg);
        //     this.soLineForm.controls.quantity.setValue(null);
        //     this.soLineForm.controls.netAmount.setValue(null);
        //   }
        // }
        // })
      }
      else {
        this.save(null, secondTable, i, arr);
      }
    }
  }
  lineClear() {
    const form = this.soHeaderForm.value
    this.soLineForm.reset();
    this.soLineForm.controls.locationAllocationType.setValue(this.locAllocation.pickingLocationAllocationType);
    this.soLineForm.controls.expectedDeliveryDate.setValue(form.expectedDeliveryDate);
    // this.returnShowValues = null;
    this.currentEditProductId = null;
    this.taxesDisabled = false;
    this.createSalesOrderService.clearProductDetails();
    this.onlyHeaderUpdateToggle = true;
    this.dummyProductIDName = null;
    this.bConfig = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element ? element.src = null : '';
    }
    let lineform = this.soLineForm.value
    //  console.log(lineform)
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.findSalesOrderByID();
    }
  }
  delete(data: any) {
    this.deleteInfo = { name: 'salesOrder', id: data.wmsoLineNumber };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  showEdit(line) {
    if (this.showTableType == 'Yes') {
      line.isEdit = !line.isEdit;
      line.expectedDeliveryDate = this.datePipe.transform(new Date(line.expectedDeliveryDate), 'yyyy-MM-dd');
    }
    else {
      line.isEdit = !line.isEdit;
      line.expectedDeliveryDate = this.datePipe.transform(new Date(line.expectedDeliveryDate), 'yyyy-MM-dd');
      this.edit(line);
    }
  }
  saveETADate(value, data, key, i) {
    if (this.permissionsList.includes('Update')) {
      data[key] = new Date(value);
      this.checkAvailablity(null, true, i, 'salesOrderLinesAll');
    }
    else {
      this.toastr.error('user doesnt have permission');
    }
  }
  edit(line, type?) {
    if (this.permissionsList.includes('Update')) {
      window.scroll(0, 0);
      if (this.pByCMapping != 'Yes') {
        this.dummyProductIDName = line.productMasterInfo.productIDName;
      }
      this.soLineForm.patchValue(line);
      this.existedUnitPrice = line.unitPrice;
      this.existedEditRecord = line;
      if (line.expectedDeliveryDate) {
        this.soLineForm.controls.expectedDeliveryDate.setValue(this.apexService.getDateFromMilliSec(line.expectedDeliveryDate));
      }
      if (line.exBondDate) {
        this.soLineForm.controls.exBondDate.setValue(this.apexService.getDateFromMilliSec(line.exBondDate));
      }
      this.locAllocation = { "_id": null, "pickingLocationAllocationType": line.locationAllocationType, "isActive": true }
      this.soLineForm.controls.locationAllocationType.setValue(this.locAllocation.pickingLocationAllocationType);
      // const updatedLocationsList = this.soLineForm.controls.inventoryHelpers.value;
      // this.returnShowValues = (updatedLocationsList && updatedLocationsList.length > 0) ? updatedLocationsList.map(x => x.locationInfo.locationName).toString() : '';
      this.finalPickupLocations = this.soLineForm.controls.inventoryHelpers.value;
      this.currentEditProductId = line.productMasterInfo.productID;
      this.soLineForm.controls.productMasterInfo['controls'].productIDName.setValue(line.productMasterInfo.productIDName);
      this.onProductIDNameChange('yes', line, (type ? 'scanEdit' : null));
      this.soLineForm['controls'].saleTaxes.setValue(line.saleTaxes ? line.saleTaxes.map(x => x.taxNamePercentage) : null);
      this.taxData = line.saleTaxes;
      this.calculateTaxPercentage();
      this.taxesDisabled = true;
    }
    else {
      this.toastr.error("user doesn't have permissions");
    }
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
  setJsonto(event) {
    return this.sourceToDropdowns.find(x => x.name == event);
  }
  setJsonFrom(event) {
    return this.sourceFromDropdowns.find(x => x.name == event);
  }
  setJsonBillTo(event) {
    return this.billToDropdowns.find(x => x.name == event);
  }
  save(table?, secondTable?, i?, arr?) {
    if (this.permissionsList.includes('Update')) {
      const form = this.soHeaderForm.value;
      if (typeof (form.shipToAddress) == 'string') {
        form.shipToAddress = this.setJsonto(form.shipToAddress)
      }
      if (typeof (form.shipFromAddress) == 'string') {
        form.shipFromAddress = this.setJsonFrom(form.shipFromAddress)
      }
      if (typeof (form.billToAddress) == 'string') {
        form.billToAddress = this.setJsonBillTo(form.billToAddress)
      }
      if (table) {
        form.salesOrderLines = this.soArrayLines.filter(x => x.isChecked);
        this.saveContinution0(form, table);
      }
      else {
        if (!secondTable) {
          if (this.soLineForm.controls.locationAllocationType.value == 'Manual' && (this.soLineForm.controls.inventoryHelpers.value == null || this.soLineForm.controls.inventoryHelpers.value == 'null' ||
            this.soLineForm.controls.inventoryHelpers.value.length == 0)) {
            this.toastr.error("Select Pick location");
          }
          else {
            if (this.soLineForm.controls.locationAllocationType.value == 'Auto') {
              this.soLineForm.controls.inventoryHelpers.setValue(null);
              form.salesOrderLines = [this.soLineForm.value];
              this.saveContinution0(form, table);
            }
            else {
              let count: any = 0;
              this.soLineForm.controls.inventoryHelpers.value.forEach(element => {
                count = DecimalUtils.add(count, element.pickedQuantity);
              });
              let countValue = this.soLineForm.controls.quantity.value;
              if (DecimalUtils.equals(count, countValue)) {
                form.salesOrderLines = [this.soLineForm.value];
                this.saveContinution0(form, table);
              }
              else {
                this.soLineForm.controls.inventoryHelpers.setValue(null);
                this.selectedReceiveRecords = [];
                this.toastr.error("Selected Locations Quantity should be equal to Ordered Quantity");
              }
            }
          }
        }
        else {
          form.salesOrderLines = [this[arr][i]];
          this.saveContinution0(form, table);
        }
      }
    }
    else {
      this.toastr.error("user doesn't have permission");
    }
  }
  saveContinution0(form, table) {
    form.soOrderDate = form.soOrderDate ? new Date(form.soOrderDate) : null;
    form.deliveryExpDate = form.deliveryExpDate ? new Date(form.deliveryExpDate) : null;
    if (form.customerMasterInfo && !form.customerMasterInfo.customerIDName) {
      form.customerMasterInfo = null;
    }
    if (form.wareHouseTransferDestinationInfo && !form.wareHouseTransferDestinationInfo.wareHouseIDName) {
      form.wareHouseTransferDestinationInfo = null;
    }
    if (form.supplierMasterInfo && !form.supplierMasterInfo.supplierIDName) {
      form.supplierMasterInfo = null;
    }
    if (form.salesOrderLines.length > 0) {
      if (this.id && !table) {
        form._id = this.id;
        let totalAmount: any = 0;
        let grossAmount: any = 0;
        let taxAmount: any = 0;
        let discount: any = 0;
        let discountAmount: any = 0;
        let taxPercentage: any = 0;
        let saleTaxes = [];
        if (form.salesOrderLines.length > 0) {
          form.salesOrderLines.forEach(product => {
            if (product.brandName == "") {
              product.brandName = null;
            }
            if (product.saleTaxes && product.saleTaxes.length > 0) {
              const purchase = JSON.parse(JSON.stringify(product.saleTaxes));
              product.saleTaxes = [];
              purchase.forEach(inner => {
                if (typeof (inner) == 'string') {
                  product.saleTaxes.push(this.getTaxJson(inner, product.grossAmount, product.discount));
                }
                else {
                  product.saleTaxes.push(inner);
                }
              });
            }
            totalAmount = DecimalUtils.add(totalAmount, product.netAmount);
            grossAmount = DecimalUtils.add(grossAmount, product.grossAmount);
            taxAmount = DecimalUtils.add(taxAmount, product.taxAmount);
            if (product.discount && product.discountAmount) {
              discount = DecimalUtils.add(discount, product.discount);
              discountAmount = DecimalUtils.add(discountAmount, product.discountAmount);
            }
            taxPercentage = DecimalUtils.add(taxPercentage, product.taxPercentage);
            if (product.saleTaxes && product.saleTaxes.length) {
              saleTaxes = [...saleTaxes, ...product.saleTaxes];
            }
          });
        }
        let grouped = saleTaxes.reduce(
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
          form['totalSaleTaxes'] = [];
          const headers = Object.keys(grouped);
          headers.forEach(element => {
            let taxA: any = 0;
            grouped[element].forEach(tax => {
              taxA = DecimalUtils.add(taxA, tax.taxAmount);
            });
            form['totalSaleTaxes'].push({
              taxAmount: taxA,
              taxName: element.split(':')[0],
              taxNamePercentage: element,
              taxPercentage: element.split(':')[1],
            })
          });
        }
        this.outboundProcessService.updateIndividualLineinSalesOrder(form).subscribe(res => {
          if (res['status'] == 0 && res['data']['SalesOrder']) {
            this.toastr.success(`${res['data'].SalesOrder.fullWmsoNumber} - Updated successfully`);
            this.lineClear();
            this.selectedReceiveRecords = [];
            this.id = res['data'].SalesOrder._id;
            this.selectedLineIndex = null;
            this.findSalesOrderByID();
          }
        })
      }
      else {
        if (this.id) {
          form._id = this.id;
        }
        this.saveContintion1(form, table);
      }
    } else {
      this.toastr.error('No products found');
    }
  }
  saveContintion1(form, table) {
    let totalAmount: any = 0;
    let grossAmount: any = 0;
    let taxAmount: any = 0;
    let discount: any = 0;
    let discountAmount: any = 0;
    let taxPercentage: any = 0;
    let saleTaxes = [];
    if (form.salesOrderLines.length > 0) {
      form.salesOrderLines.forEach(product => {
        if (product.brandName == "") {
          product.brandName = null;
        }
        delete product.isChecked;
        delete product.showQuantity;
        delete product.pickingLocationAllocationType;
        if (product.saleTaxes && product.saleTaxes.length > 0) {
          const purchase = JSON.parse(JSON.stringify(product.saleTaxes));
          product.saleTaxes = [];
          purchase.forEach(inner => {
            if (typeof (inner) == 'string') {
              product.saleTaxes.push(this.getTaxJson(inner, product.grossAmount, product.discount));
            }
            else {
              product.saleTaxes.push(inner);
            }
          });
        }
        totalAmount = DecimalUtils.add(totalAmount, product.netAmount);
        grossAmount = DecimalUtils.add(grossAmount, product.grossAmount);
        taxAmount = DecimalUtils.add(taxAmount, product.taxAmount);
        if (product.discount && product.discountAmount) {
          discount = DecimalUtils.add(discount, product.discount);
          discountAmount = DecimalUtils.add(discountAmount, product.discountAmount);
        }
        taxPercentage = DecimalUtils.add(taxPercentage, product.taxPercentage);
        if (product.saleTaxes && product.saleTaxes.length > 0) {
          saleTaxes = [...saleTaxes, ...product.saleTaxes];
        }
      });
    }
    let grouped = saleTaxes.reduce(
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
      form['totalSaleTaxes'] = [];
      const headers = Object.keys(grouped);
      headers.forEach(element => {
        let taxA: any = 0;
        grouped[element].forEach(tax => {
          taxA = DecimalUtils.add(taxA, tax.taxAmount);
        });
        form['totalSaleTaxes'].push({
          taxAmount: taxA,
          taxName: element.split(':')[0],
          taxNamePercentage: element,
          taxPercentage: element.split(':')[1],
        })
      });
    }
    if (table && form._id) {
      this.outboundProcessService.updateSalesOrder(JSON.stringify(form)).subscribe(
        (response) => {
          this.saveContinution2(response, form);
        },
        (error) => {
          this.toastr.error('Failed in saving');
        });
    }
    else {
      this.outboundProcessService.saveOrUpdateSalesOrder(JSON.stringify(form)).subscribe(
        (response) => {
          this.saveContinution2(response, form);
        },
        (error) => {
          this.toastr.error('Failed in saving');
        });
    }
  }
  saveContinution2(response, form) {
    if (response && response.status === 0 && response.data.salesOrder) {
      const soResponse = response.data.salesOrder;
      if (form._id) {
        this.toastr.success(`${soResponse.fullWmsoNumber} - Updated successfully`);
      }
      else {
        this.toastr.success(`${soResponse.fullWmsoNumber} - Created successfully`);
      }
      this.lineClear();
      this.selectedReceiveRecords = [];
      this.selectAllAllcateCheckboxValue = false;
      this.appService.navigate('/v1/outbound/createSalesOrder', { id: soResponse._id });
      this.id = soResponse._id;
      this.selectedLineIndex = null;
      this.findSalesOrderByID();
    } else {
      this.toastr.error('Failed in saving');
    }
  }
  raiseSO() {
    if (this.permissionsList.includes('Update')) {
      const form = this.soHeaderForm.value;
      if (typeof (form.shipToAddress) == 'string') {
        form.shipToAddress = this.setJsonto(form.shipToAddress)
      }
      if (typeof (form.shipFromAddress) == 'string') {
        form.shipFromAddress = this.setJsonFrom(form.shipFromAddress)
      }
      if (typeof (form.billToAddress) == 'string') {
        form.billToAddress = this.setJsonBillTo(form.billToAddress)
      }
      form['salesOrderLines'] = this.salesOrderLinesAll;
      // if (this.inCheckfromConfig == 'Yes') {
      this.outboundProcessService.validateRaiseSO(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].inventoryValidationDetails.inventoryAvailability == 'Yes') {
          this.raiseSOContinue();
        }
        else if (res['data'].inventoryValidationDetails && res['data'].inventoryValidationDetails.inventoryAvailability == 'No') {
          // this.toastr.error('Required Quantity not available in Inventory');
          this.ngxSmartModalService.getModal('closePOPopup').open();
          const viewData = `Required Quantity not available in Inventory,Do you want to Raise SO?`;
          this.ngxSmartModalService.setModalData(viewData, 'closePOPopup');
        }
        else {
          this.toastr.error('Failed in rasing SO');
        }
      })
      // }
      // else {
      //   this.raiseSOContinue();
      // }

    }
    else {
      this.toastr.error("User doesn't have permission")
    }
  }

  raiseSOContinue() {
    this.outboundProcessService.saveOrUpdateRaiseSO(this.id, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data && response.data.raiseSOStatus) {
          this.toastr.success('SO raised successfully');
          this.appService.navigate('/v1/outbound/maintainSalesOrder');
        } else if (response && (response.status === 2 || (response.status === 0 && response.data.raiseSOStatus == false))) {
          this.toastr.error(response.statusMsg);
        } else {
          this.toastr.error('Failed in rasing SO');
        }
      },
      (error) => {
        this.toastr.error('Failed in rasing SO');
      });
  }
}
