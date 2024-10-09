import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData, CompleterService } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CreateProductLines } from 'src/app/entities/createPurchaseOrder/createProductLines.entity';
import { ProductHeader } from 'src/app/entities/createPurchaseOrder/productHeader.entity';
import { PurchaseOrderLines } from 'src/app/entities/createPurchaseOrder/purchaseOrderLines.entity';
import { CreatePurchaseOrderService } from 'src/app/services/createPurchaseOrder.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ApexService } from 'src/app/shared/services/apex.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Storage } from '../../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { DecimalUtils } from 'src/app/constants/decimal';
import { decimalPipe } from 'src/app/shared/pipes/filter.pipe';
import { BarcodeService } from 'src/app/services/barcode.service';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';
import { purchaseOrderHeader } from 'src/app/constants/paginationConstants';


@Component({
  selector: 'app-create-po',
  templateUrl: './create-po.component.html',
  styles: [`.completer-input{
    width:250px!important
  }`]
})
export class CreatePoComponent implements OnInit, OnDestroy, AfterViewInit {
  supplierList: any = [];
  supplierIDNames: any[] = [];
  dataService: CompleterData;
  productDataService: CompleterData;
  supplierName: any;
  isReadOnly: any = false;
  taxGroups: any[] = [];
  supplierMasterInfo: any = {};
  // @Output() isClearPOHeader = new EventEmitter();
  focusedElement: any;
  termsOfPayments: any[] = [];
  currencies: any = [];
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Purchase Order', Storage.getSessionUser());
  formObj = this.configService.getGlobalpayload();
  makeReadOnly: boolean = false;
  productHeaderData: any;
  createPOLines: any;
  makeThisDisabled: boolean;
  productList: any;
  productIDNames: any[] = [];
  orderQuantity: boolean = false;
  units: any = [];
  id = this.appService.getParam('id');
  productMasterInfo: {};
  totalAmount: any = 0;
  productsPOLines: any = [];
  productToEdit: boolean = false;
  tempMoq: any;
  lineID: any;
  deleteInfo: any;
  supplierSubscription: any;
  termsAndConditions: any = null;
  dtOptions: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  recentHistories: any = [];
  onlyHeaderUpdateToggle: Boolean = true;
  productLogo: any;
  showImage: boolean = false;
  raisedPOCheck: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  barcodeInfo: any = null;
  uomConversions: any = [];
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
  taxData: any = [];
  taxIDs: any = [];
  products: any = [];
  selectedProductMaster: any = null;
  bySupplierPrice: any = '';
  supplierMaster: any;
  shipTOAddressDropdown: any = [];
  shipFromAddressDropdown: any = [];
  billTOAddressDropdown: any = [];
  permissionToggle: any = false;
  statusObj = { 'status': null, 'statusSequence': null };
  totalStatusCount: Number = 0;
  conversionFactor: any;
  barcodeCheck = 'No';
  overAllBarcodeData: any = [];
  upcEANNumber: any = null;
  existedQuantity: any = null;
  existedLineDetails: any = null;
  pBySMapping: any = 'Yes';
  productsIDNamesforScroll: any = [];
  dummyProductIDName: any = null;

  pageForTable: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  showTooltip = false;

  page = 1;
  @ViewChild('remote')
  public dropdownObj: ComboBoxComponent;
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
  bConfig: any = null;

  onFiltering(e) {
    let query: Query = new Query();
    query = (e.text !== '') ? query.where('text', 'contains', e.text, true) : query;
    e.updateData(this.productsIDNamesforScroll, query);
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
              "searchOnKeys": purchaseOrderHeader.purchaseOrderSearcByIDhKeys,/* ['productIDName'], */
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
                    if (this.productsIDNamesforScroll.length > 0) {
                      let index = this.productsIDNamesforScroll.length;
                      arr.forEach((v, i) => {
                        i = index;
                        if (!this.productsIDNamesforScroll.find(x => x.text == v.productIDName)) {
                          this.productsIDNamesforScroll.push({ text: v.productIDName, id: i });
                          index += 1;
                        }
                      });
                    }
                    else {
                      this.productsIDNamesforScroll = arr.map((v, i) => ({ text: v.productIDName, id: i }));
                    }
                    new DataManager(this.productsIDNamesforScroll)
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
                  this.productsIDNamesforScroll = [];
                }
              })
          }
        }
      });
    }
  }

  constructor(private configService: ConfigurationService, private wmsService: WMSService, private bService: BarcodeService,
    private completerService: CompleterService, private metaDataService: MetaDataService,
    private appService: AppService, private toastr: ToastrService, private apexService: ApexService,
    private ngxSmartModalService: NgxSmartModalService, private createPurchaseOrderService: CreatePurchaseOrderService,
    private translate: TranslateService, private commonMasterDataService: CommonMasterDataService) {
    this.translate.use(this.language);
    this.productHeaderData = new ProductHeader();
    this.createPOLines = new CreateProductLines();
    this.addLine('poDeliveryDate', 'eta');
  }
  isSub2Disable: boolean = false
  ngOnInit() {
    this.isSub2Disable = true;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.dtOptions2 = {
      pagingType: 'full_numbers',
      pageLength: 2,
    };
    this.fetchAllSupplierDetails();
    this.id = this.appService.getParam('id');
    this.getPermissions();
    this.fetchMetadata();
    // this.fetchAllProducts();
    this.fetchAllProducts(1, 10);
    this.fetchAllUOMs();
    this.fetchAllTermsAndConditions();
    this.productHeaderData.receiptDate = this.apexService.getDateFromMilliSec(new Date());
    this.productHeaderData.receiptType = 'Purchase Order';
    this.fetchWareHouseDetailsByID();
    this.fetchBarcodeConfig();
    this.fetchProductConfig();
    this.fetchAllPDbySupplierConfigurations();
  }
  getPermissions() {
    this.configService.getAllInventoryConfiguration(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['processConfigurations'] && res['data']['processConfigurations'].length > 0) {
        if (res['data']['processConfigurations'].find(x => x.name == 'Purchase Order')) {
          const havePermission = res['data']['processConfigurations'].find(x => x.name == 'Purchase Order');
          if (havePermission && havePermission.processStatusPolicies && havePermission.processStatusPolicies.length > 0) {
            const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).authorities[0].authority;
            const loginUser = JSON.parse(sessionStorage.getItem('dli-wms-user')).username;
            havePermission.processStatusPolicies.forEach(outer => {
              const rolesStatusIndex = outer.statusRoleConfigurations.findIndex(x => x.role.roleName == loginUserRole);
              if (rolesStatusIndex != -1 && !this.permissionToggle) {
                const listOfUsers = outer.statusRoleConfigurations[rolesStatusIndex].userInfos.map(x => x.email);
                this.permissionToggle = (listOfUsers.includes(loginUser)) ? true : false;
                if (this.permissionToggle) {
                  this.statusObj = { 'status': outer.status, 'statusSequence': outer.statusSequence };
                  this.totalStatusCount = havePermission.processStatusPolicies.length;
                }
                else {
                  this.totalStatusCount = 0;
                }
              }
              else {
                this.permissionToggle = this.permissionToggle ? this.permissionToggle : false;
                if (!this.permissionToggle) {
                  this.totalStatusCount = 0;
                }
              }
            });
          }
          else {
            this.permissionToggle = false;
            this.totalStatusCount = 1;
          }
        }
        else {
          this.permissionToggle = false;
          this.totalStatusCount = 1;
        }
      }
      else {
        this.permissionToggle = false;
        this.totalStatusCount = 1;
      }
    })
  }
  fetchBarcodeConfig() {
    this.bService.fetchAllBarcodeConfig(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.barcodeConfigurations && res.data.barcodeConfigurations.length > 0) {
        this.barcodeCheck = res.data.barcodeConfigurations[0].barcodeCheck;
      }
      else {
        this.barcodeCheck = "No"
      }
    })
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

  openScanner() {
    if (this.raisedPOCheck) {
      this.toastr.error("Unable to Scan Raised Order.")
    }
    else {
      if (this.productHeaderData.supplierMasterInfo.supplierIDName) {
        this.barcodeInfo = { 'toggle': true };
        this.ngxSmartModalService.getModal('scannerModalForWebCam').open();
      }
      else {
        this.toastr.error("Enter Supplier.")
      }
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
      this.bConfig = e;
      if (bConfig) {
        this.dummyProductIDName = bConfig.productMasterInfo.productIDName;
        this.createPOLines.productIDName = bConfig.productMasterInfo.productIDName;
        this.createPOLines.units = bConfig.unitCode;
        this.existedLineDetails = this.productsPOLines.find(x => x.productMasterInfo.productIDName == this.createPOLines.productIDName && x.units == this.createPOLines.units);
        if (this.existedLineDetails) {
          this.edit(this.existedLineDetails, 'fromScan');
        }
        else {
          if (this.productHeaderData.poDeliveryDate && this.createPOLines.eta) {
            this.onProductIDNameChange('yes', 'fromScan', 'fromHTML');
          }
          else {
            this.toastr.error('Enter Manditory Dates');
          }
        }
      }
    }
  }
  // fetchAllProducts() {
  //   this.wmsService.fetchAllProducts(this.formObj).subscribe(
  //     (response) => {
  //       if (response && response.status === 0 && response.data.productMasters) {
  //         this.products = response.data.productMasters;
  //         this.productsIDNamesforScroll = response.data.productMasters.map(x => x.productIDName);
  //       }
  //     })
  // }
  accessOrderID(event) {
    if (event && event.itemData) {
      this.createPOLines.productIDName = event.itemData.text;
      this.onProductIDNameChange('yes', null, 'fromHTML');
    }
  }
  fetchAllProducts(page, pageSize) {
    const formValue = {};
    formValue['page'] = page;
    formValue['pageSize'] = pageSize;
    formValue["organizationIDName"] = this.formObj.organizationIDName;
    formValue["wareHouseIDName"] = this.formObj.wareHouseIDName;
    this.wmsService.fetchAllProductsWithPaginations(formValue).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasterPaginationResponse.productMasters) {
          this.products = response.data.productMasterPaginationResponse.productMasters;
          const arr = response.data.productMasterPaginationResponse.productMasters;
          if (this.productsIDNamesforScroll.length > 0) {
            let index = this.productsIDNamesforScroll.length;
            arr.forEach((v, i) => {
              i = index;
              if (!this.productsIDNamesforScroll.find(x => x.text == v.productIDName)) {
                this.productsIDNamesforScroll.push({ text: v.productIDName, id: i });
                index += 1;
              }
            });
          }
          else {
            this.productsIDNamesforScroll = arr.map((v, i) => ({ text: v.productIDName, id: i }));
          }
        }
        else {
          this.productsIDNamesforScroll = [];
        }
      })
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
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  findPurchaseOrderByID(page?) {
    const form = {
      'organizationIDName': this.formObj.organizationIDName,
      'wareHouseIDName': this.formObj.wareHouseIDName,
      "page": page ? page : 1,
      "pageSize": this.itemsPerPage,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "searchOnKeys": purchaseOrderHeader.purchaseOrderSearcByIDhKeys,
      "searchKeyword": this.searchKey,
      _id: this.id
    }
    this.wmsService.fetchPurchaseOrderByIDPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrderPaginationResponse.purchaseOrder) {
          const responseData = JSON.parse(JSON.stringify(response.data.purchaseOrderPaginationResponse.purchaseOrder));
          this.totalItems = response.data.purchaseOrderPaginationResponse.totalElements;
          this.wmsService.passedData = responseData;
          this.wmsService.passedData.financialYearName = null;
          const pId = this.formObj;
          pId['dateFrom'] = new Date(this.wmsService.passedData.receiptDate);
          pId['dateTo'] = new Date(this.wmsService.passedData.receiptDate);
          this.wmsService.fetchFinancialYearConfigByDates(pId).subscribe(res => {
            if (res && res['status'] == 0 && res['data'].financialYearConfiguration) {
              this.wmsService.passedData.financialYearName = res['data'].financialYearConfiguration.financialYearName
            }
          })
          this.raisedPOCheck = responseData.raisePO;
          if (responseData.statusStages && responseData.statusStages.length > 0 && responseData.statusStages[responseData.statusStages.length - 1].status == 'Rejected') {
            this.raisedPOCheck = true;
          }
          if (!responseData.supplierMasterInfo) {
            responseData.supplierMasterInfo = {
              supplierIDName: null,
              supplierID: null,
              supplierName: null,
              supplierMasterID: null
            }
          }
          else {
            this.shipFromAddressDropdown = this.supplierList.find(x => x.supplierIDName == responseData.supplierMasterInfo.supplierIDName).shipFromAddresses;
          }
          if (!responseData.wareHouseTransferSourceInfo) {
            responseData["wareHouseTransferSourceInfo"] = {
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
          if (!responseData.customerMasterInfo) {
            responseData["customerMasterInfo"] = {
              "customerMasterID": null,
              "customerID": null,
              "customerName": null,
              "customerIDName": null
            }
          }

          // responseData.purchaseOrderLines.forEach((product, index) => {
          //   if (index.toString().length === 1) {
          //     product.wmsPOLineNumber = `10${index + 1}`;
          //   } else if (index.toString().length === 2) {
          //     product.wmsPOLineNumber = `1${index + 1}`;
          //   } else {
          //     product.wmsPOLineNumber = index;
          //   }
          // });
          if (!responseData.shipToAddress) {
            responseData.shipToAddress = {
              "name": null,
              "address": null,
              "city": null,
              "pin": null,
              "state": null,
              "country": null,
              "defaultAddress": null,
              "contactDetail": {
                "phoneNumber": null,
                "alternativePhoneNumber": null,
                "contactName": null,
                "email": null,
              }
            };
          }
          if (!responseData.shipFromAddress) {
            responseData.shipFromAddress = {
              "name": null,
              "address": null,
              "city": null,
              "pin": null,
              "state": null,
              "country": null,
              "defaultAddress": null,
              "contactDetail": {

                "phoneNumber": null,
                "alternativePhoneNumber": null,
                "contactName": null,
                "email": null,
              }
            };
          }
          if (!responseData.billToAddress) {
            responseData.billToAddress = {
              "name": null,
              "address": null,
              "city": null,
              "pin": null,
              "state": null,
              "country": null,
              "defaultAddress": null,
              "contactDetail": {

                "phoneNumber": null,
                "alternativePhoneNumber": null,
                "contactName": null,
                "email": null,
              }
            };
          }
          if (!responseData.statusStages) {
            responseData.statusStages = [];
          }
          this.productHeaderData = JSON.parse(JSON.stringify(responseData));
          if (responseData.taxGroup && responseData.taxGroup.taxGroup) {
            this.productHeaderData.taxGroup = {
              _id: responseData.taxGroup._id,
              taxGroup: responseData.taxGroup.taxGroup,
              taxGroupDescription: responseData.taxGroup.taxGroupDescription,
            }
          }
          else {
            this.productHeaderData.taxGroup = {
              _id: null,
              taxGroup: null,
              taxGroupDescription: null,
            }
          }
          if (this.productHeaderData.supplierMasterInfo && this.productHeaderData.supplierMasterInfo.supplierIDName) {
            this.supplierMasterInfo = responseData.supplierMasterInfo;
            this.getSupplierEditpageDetails();
          }
          // this.findAllTaxes();
          this.productsPOLines = responseData.purchaseOrderLines;
          this.dtTrigger.next();
          if (responseData.supplierMasterInfo && responseData.supplierMasterInfo.supplierIDName != null) {
            this.productHeaderData.supplierMasterInfo.supplierIDName = responseData.supplierMasterInfo.supplierIDName;
          } else {
            this.productHeaderData.supplierMasterInfo = {};
            this.productHeaderData.supplierMasterInfo.supplierIDName = '';
          }
          // if (responseData.taxGroup) {
          //   this.productHeaderData.taxGroup = responseData.taxGroup.taxGroup;
          // }
          this.productHeaderData.poDeliveryDate =
            this.apexService.getDateFromMilliSec(responseData.poDeliveryDate);
          this.productHeaderData.receiptDate =
            this.apexService.getDateFromMilliSec(responseData.receiptDate);
          this.addLine('poDeliveryDate', 'eta');
          // this.onSupplierIDNameChange();
          // this.productHeaderData.receiptType = 'Purchase Order';
          this.getTotalAmount();

        } else {
          this.productsPOLines = [];
          this.getTotalAmount();
          if (!this.searchKey) {
            this.productHeaderData = {};
            this.appService.navigate('/v1/inbound/maintainPurchaseOrder');
          }
        }
      },
      (error) => {
        this.productHeaderData = {};
      });
  }
  restrictedNumber = 0;
  getTotalAmount() {
    this.totalAmount = 0;
    this.restrictedNumber = 0;
    if (this.productsPOLines && this.productsPOLines.length) {
      this.productsPOLines.forEach(product => {
        this.totalAmount = DecimalUtils.add(this.totalAmount, product.netAmount);
        this.restrictedNumber = this.totalAmount.toFixed(2);
      });
    }
  }
  calculateTaxPercentage() {
    if (this.createPOLines.purchaseTaxes && this.createPOLines.purchaseTaxes.length > 0) {
      this.createPOLines.taxAmount = 0;
      this.calculate();
    }
    else {
      this.createPOLines.taxAmount = 0;
      this.calculate();
    }
  }
  fetchAllTermsAndConditions() {
    this.metaDataService.fetchAllTermsAndConditions(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.TermsAndConditions.length) {
          for (let i = 0; i < response.data.TermsAndConditions.length; i++) {
            if (response.data.TermsAndConditions[i].type === 'po') {
              this.termsAndConditions = response.data.TermsAndConditions[i].termsAndConditions;
              break;
            }
          }
        }
      },
      error => {
      });
  }
  fetchAllSupplierDetails() {
    this.supplierList = [];
    this.supplierIDNames = [];
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierList = response.data.supplierMasters;
          this.getSupplierDetailsById();
          this.dataService = this.supplierList.map(x => x.supplierIDName);
          if (this.id) {
            this.rerender();
            this.findPurchaseOrderByID(this.pageForTable = 1);
          }
        } else {
          this.dataService = this.completerService.local(this.supplierIDNames);
        }
      },
      (error) => {
        this.supplierList = [];
      });
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
  onSupplierIDNameChange(event) {
    if (event) {
      if (this.productHeaderData && this.productHeaderData.supplierMasterInfo &&
        this.productHeaderData.supplierMasterInfo.supplierIDName !== null) {
        this.supplierList.forEach((supplier) => {
          if (supplier.supplierIDName === this.productHeaderData.supplierMasterInfo.supplierIDName) {
            this.productHeaderData.supplierMasterInfo.supplierName = supplier.supplierName;
            this.productHeaderData.supplierMasterInfo.supplierMasterID = supplier._id;
            this.productHeaderData.supplierMasterInfo.supplierID = supplier.supplierID;
            if (supplier.taxGroup && supplier.taxGroup.taxGroup) {
              this.productHeaderData.taxGroup = supplier.taxGroup
            }
            else {
              this.productHeaderData.taxGroup = {
                taxGroup: null,
              }
            }
            this.productHeaderData.termsOfPayment = supplier.termsOfPayment;
            this.productHeaderData.currency = supplier.currency;
            this.productHeaderData.organizationInfo = supplier.organizationInfo;
            this.productHeaderData.wareHouseInfo = supplier.wareHouseInfo;
            this.shipFromAddressDropdown = supplier.shipFromAddresses;
            if (supplier.shipFromAddresses.length) {
              this.productHeaderData.shipFromAddress = JSON.parse(JSON.stringify(supplier.shipFromAddresses.find(x => x.defaultAddress)));
            }
            else {
              if (this.id) {

              }
            }
            this.supplierMasterInfo = {
              supplierMasterID: supplier._id,
              supplierID: supplier.supplierID,
              supplierIDName: supplier.supplierIDName,
              supplierName: supplier.supplierName,
            };
            // this.findAllTaxes();
            this.getSupplierEditpageDetails();
          }
        });
      }
    }
    else {
      this.recentHistories = [];
      this.supplierMasterInfo = {
        supplierMasterID: null,
        supplierID: null,
        supplierIDName: null,
        supplierName: null
      };
      const forShipping = this.productHeaderData;
      this.productHeaderData = new ProductHeader();
      this.createPOLines = new CreateProductLines();
      this.dummyProductIDName = null;
      this.paginationStop = false;
      this.addLine('poDeliveryDate', 'eta');
      this.productHeaderData.receiptDate = this.apexService.getDateFromMilliSec(new Date());
      this.productHeaderData.receiptType = 'Purchase Order';
      this.productHeaderData.shipToAddress = forShipping.shipToAddress;
      this.productHeaderData.billToAddress = forShipping.billToAddress;
      this.getSupplierEditpageDetails();
      this.onProductIDNameChange();
    }
  }
  getSupplierEditpageDetails() {
    this.supplierSubscription = this.createPurchaseOrderService.createPOSupplierIDChange(this.supplierMasterInfo);
    this.isReadOnly = true;
    if (this.pBySMapping == 'Yes') {
      this.fetchAllProductsBySupplier();
    }
    // this.findPORecentHistory();
  }
  myCurrency: any;
  findPORecentHistory() {
    if (this.supplierMasterInfo.supplierMasterID) {
      const iD = this.supplierMasterInfo.supplierMasterID;
      this.wmsService.findPORecentHistoryBySupplierID(iD, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.purchaseOrderLines.length > 0) {
            this.recentHistories = response.data.purchaseOrderLines;


            this.myCurrency = this.recentHistories[0].currency;




          } else {
            this.recentHistories = [];
          }
        },
        (error) => {
          this.recentHistories = [];
        });
    }

  }
  fetchMetadata() {
    this.metaDataService.fetchAllCurrencies(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.currencies) {
          this.currencies = response.data.currencies;
        } else {
          this.currencies = [];
        }
      },
      (error) => {
        this.currencies = [];
      });
    this.metaDataService.fetchAllTaxGroups(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.taxGroups) {
          this.taxGroups = response.data.taxGroups;
        } else {
          this.taxGroups = [];
        }
      },
      (error) => {
        this.taxGroups = [];
      });
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {

      });
    this.shipTOAddressDropdown = [];
    this.billTOAddressDropdown = [];
    this.wmsService.fetchAllWarehouses(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          if (response.data.wareHouses && response.data.wareHouses.length > 0) {
            this.isReadOnly = true;
            this.productHeaderData.shipToAddress = response.data.wareHouses[0].shipToAddresses.find(x => x.defaultAddress);
            this.shipTOAddressDropdown = JSON.parse(JSON.stringify(response.data.wareHouses[0].shipToAddresses));
            this.productHeaderData.billToAddress = response.data.wareHouses[0].billToAddresses.find(x => x.defaultAddress);
            this.billTOAddressDropdown = JSON.parse(JSON.stringify(response.data.wareHouses[0].billToAddresses));
          }
        } else {
          this.productHeaderData.shipToAddress = {};
        }
      },
      (error) => {
        this.productHeaderData.shipToAddress = {};
      });
    this.metaDataService.getImageConfigbyName(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Purchase Order') ? true : false;
      }
    })
  }
  setJsonto(event) {
    this.productHeaderData.shipToAddress = this.shipTOAddressDropdown.find(x => x.name == event.target.value);
  }
  setJsonFrom(event) {
    this.productHeaderData.shipFromAddress = this.shipFromAddressDropdown.find(x => x.name == event.target.value);
  }
  setBillTo(event) {
    this.productHeaderData.billToAddress = this.billTOAddressDropdown.find(x => x.name == event.target.value);
  }
  selectedBrand(event) {
    this.createPOLines.brandName = event.target.value
  }
  fetchAllPDbySupplierConfigurations() {
    this.metaDataService.findAllSupplierConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.productBySupplierMappingConfigurations && res.data.productBySupplierMappingConfigurations.length > 0) {
        this.pBySMapping = res.data.productBySupplierMappingConfigurations[0].mapping;
      }
    })
  }
  fetchAllProductsBySupplier() {
    this.productIDNames = [];
    this.productList = [];
    this.wmsService.fetchProductsBySupplier(this.productHeaderData.supplierMasterInfo.supplierIDName, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productBySupplier &&
          response.data.productBySupplier.productMasterInfos) {
          this.productList = response.data.productBySupplier.productMasterInfos;
          this.productIDNames = [];
          this.productIDNames = this.productList.map(x => x.productIDName);
          this.productDataService = this.completerService.local(this.productIDNames);
        } else {
          this.productList = [];
          this.productDataService = this.completerService.local(this.productIDNames);
        }
      },
      (error) => {
        this.productList = [];
        this.productDataService = this.completerService.local(this.productIDNames);
      });
  }
  onProductIDNameChange(event?, type?, fromHtml?) {
    this.productLogo = null;
    if (fromHtml) {
      this.createPOLines.unitPrice = null;
    }
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    if (event) {
      this.bySupplierPrice = null;
      this.onlyHeaderUpdateToggle = false;
      if (this.createPOLines && this.createPOLines.productIDName) {
        let productList = this.productList;
        if (this.pBySMapping != 'Yes') {
          productList = this.products;
        }
        if (productList) {
          let product = productList.find(x => x.productIDName === this.createPOLines.productIDName);
          if (product) {
            this.createPOLines.productName = product.productName;
            this.createPOLines.upcEANNumber = product.upcEANNumber;
            this.createPOLines.brandNames = product.brandNames;
            this.createPOLines.productDescription = product.productDescription;
            this.tempMoq = product.moq;
            this.productMasterInfo = {
              productMasterID: (this.pBySMapping != 'Yes') ? product._id : product.productMasterID,
              productID: product.productID,
              productIDName: product.productIDName,
              productName: product.productName
            };
            const bConfig = this.overAllBarcodeData.find(x => x.upcEANNumber == this.bConfig);
            this.wmsService.fetchProductDetailsById(this.productMasterInfo['productMasterID'], this.formObj).subscribe(
              (response) => {
                if (response && response.status === 0 && response.data.productMaster) {
                  let prod = JSON.parse(JSON.stringify(response.data.productMaster));
                  this.createPOLines.storageInstruction = prod.storageInstruction;
                  this.createPOLines.productImage = prod.productImage;
                  this.createPOLines.hsnCode = prod.hsnCode;
                  this.createPOLines.inventoryUnit = prod.inventoryUnit;
                  this.createPOLines.unitPrice = this.createPOLines.unitPrice ? this.createPOLines.unitPrice : ((this.pBySMapping != 'Yes') ? product.purchasePrice : product.price);
                  this.bySupplierPrice = (this.pBySMapping != 'Yes') ? product.purchasePrice : product.price;
                  this.createPOLines.currency = product.currency;
                  this.createPOLines.units = bConfig ? bConfig.unitCode : null;
                  if (prod.productImage && this.showImage) {
                    const fileNames = JSON.parse(JSON.stringify(prod.productImage));
                    this.metaDataService.viewImages(fileNames).subscribe(data => {
                      if (data['status'] == 0) {
                        this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
                        this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
                        this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
                      }
                    });
                  }
                  const payload = {
                    "organizationIDName": this.configService.getGlobalpayload().organizationIDName,
                    "wareHouseIDName": this.configService.getGlobalpayload().wareHouseIDName,
                    "taxName": null,
                    "hsnCode": prod.hsnCode,
                    "countryName": this.productHeaderData.shipFromAddress ? this.productHeaderData.shipFromAddress.country : null,
                    "stateName": this.productHeaderData.shipFromAddress ? this.productHeaderData.shipFromAddress.state : null,
                    "supplierIDName": this.productHeaderData.supplierMasterInfo ? this.productHeaderData.supplierMasterInfo.supplierIDName : null,
                    "customerIDName": this.productHeaderData.customerMasterInfo ? this.productHeaderData.customerMasterInfo.customerIDName : null,
                    "type": "PurchaseTax",
                    "productIDName": this.createPOLines.productIDName
                  }
                  this.wmsService.fetchTaxesforOrder(payload).subscribe(res => {
                    if (res['status'] == 0 && res['data'].taxMasters && res['data'].taxMasters.length > 0) {
                      this.taxData = res['data'].taxMasters;
                      const taxValue = res['data'].taxMasters.map(x => x.taxNamePercentage);
                      this.createPOLines.purchaseTaxes = JSON.parse(JSON.stringify(taxValue));
                      if (this.productMasterInfo['productMasterID']) {
                        // this.createPurchaseOrderService.createPOProductIDChange(this.productMasterInfo);
                        this.createPOLines.unitPrice = this.createPOLines.unitPrice ? this.createPOLines.unitPrice : ((this.pBySMapping != 'Yes') ? product.purchasePrice : product.price);
                        this.fetchProductDetailsByID(this.productMasterInfo['productMasterID'], this.createPOLines.unitPrice, (this.createPOLines.units ? this.createPOLines.units : product.receivingUnit), type, prod);
                      }
                    }
                    else {
                      this.createPOLines.purchaseTaxes = null;
                      if (this.productMasterInfo['productMasterID']) {
                        // this.createPurchaseOrderService.createPOProductIDChange(this.productMasterInfo);
                        this.fetchProductDetailsByID(this.productMasterInfo['productMasterID'], this.createPOLines.unitPrice, (this.createPOLines.units ? this.createPOLines.units : product.receivingUnit), type, prod);
                      }
                    }
                  })
                }
              });
          }
          else {
            if (this.pBySMapping == 'Yes') {
              this.toastr.error('No Matching Product');
            }
          }
          // productList.forEach((product) => {
          //   if (product.productIDName === this.createPOLines.productIDName) {

          //   }
          // })
        }
        else {
          if (this.createPOLines.purchaseTaxes.length > 0) {
            this.taxData = this.createPOLines.purchaseTaxes;
            this.createPOLines.purchaseTaxes = this.createPOLines.purchaseTaxes.map(x => x.taxNamePercentage);
          }
          else {
            this.createPOLines.purchaseTaxes = null;
          }
        }
        // }
        // else {
        //   this.toastr.error("Already Exists");
        //   this.createPOLines.productIDName = null;
        // }
      }
    }
    else {
      this.productMasterInfo = {
        productMasterID: null,
        productID: null,
        productIDName: null,
        productName: null,
      };
      this.createPurchaseOrderService.clearProductDetails();
    }
  }
  fetchProductDetailsByID(id, price, receivingUnit, type?, prod?) {
    // this.wmsService.fetchProductDetailsById(id, this.formObj).subscribe(
    //   (response) => {
    //     if (response && response.status === 0 && response.data.productMaster) {
    if (prod) {
      this.selectedProductMaster = prod;
      // this.createPOLines.unitPrice = response.data.productMaster.price;
      this.createPOLines.upcEANNumber = prod.upcEANNumber;
      // this.createPOLines.units = response.data.productMaster.receivingUnit;

      // if (this.currentEditProductId && this.productMasterInfo.productID &&
      //   this.currentEditProductId !== this.productMasterInfo.productID) {
      //   this.calculate();
      //   this.currentEditProductId = undefined;
      // }

      this.createPOLines.units = receivingUnit;
      if (this.selectedProductMaster && (this.selectedProductMaster.inventoryUnit == this.createPOLines.units) && price) {
        this.conversionFactor = DecimalUtils.valueOf(1);
        this.createPOLines.orderUnitPrice = DecimalUtils.multiply(price, this.conversionFactor);
      }
      else {
        this.createPOLines.orderUnitPrice = null;
        if (this.selectedProductMaster && this.selectedProductMaster.inventoryUnit && this.createPOLines.units) {
          const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === this.createPOLines.units &&
            uom.unitConversionTo === this.selectedProductMaster.inventoryUnit && uom.productMasterInfo.productIDName === this.selectedProductMaster.productIDName);
          if (filteredUOMConversion && filteredUOMConversion.conversionFactor && price) {
            this.conversionFactor = filteredUOMConversion.conversionFactor;
            this.createPOLines.orderUnitPrice = DecimalUtils.multiply(price, filteredUOMConversion.conversionFactor);
          }
          else {
            this.conversionFactor = null;
            this.createPOLines.orderUnitPrice = '';
          }
        } else {
          this.createPOLines.orderUnitPrice = '';
        }
      }
      if (type && type != 'scanEdit') {
        this.createPOLines.quantity = 1;
        this.calculate(type);
      }
      else if (type && type == 'scanEdit') {
        this.createPOLines.quantity = DecimalUtils.add(this.existedQuantity, 1);
        this.calculate(type);
      }
      else {
        this.calculateTaxPercentage();
      }
    }
    else {
      this.selectedProductMaster = null;
      this.createPOLines.orderUnitPrice = '';
    }
    // },
    // (error) => {
    //   this.createPOLines.orderUnitPrice = '';
    // });
  }
  getUnitPriceWithCalculation() {
    this.conversionFactor = null;
    if (this.selectedProductMaster && this.selectedProductMaster.inventoryUnit && this.createPOLines.units) {
      if (this.selectedProductMaster.inventoryUnit == this.createPOLines.units) {
        this.conversionFactor = DecimalUtils.valueOf(1);
      }
      else {
        const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === this.createPOLines.units &&
          uom.unitConversionTo === this.selectedProductMaster.inventoryUnit && uom.productMasterInfo.productIDName === this.selectedProductMaster.productIDName);
        this.conversionFactor = filteredUOMConversion ? filteredUOMConversion.conversionFactor : null;
      }
      if (this.conversionFactor) {
        if (!this.createPOLines.orderUnitPrice) {
          this.createPOLines.orderUnitPrice = DecimalUtils.multiply(this.bySupplierPrice, this.conversionFactor);
        }
        else {
          this.createPOLines.orderUnitPrice = DecimalUtils.multiply(this.createPOLines.unitPrice, this.conversionFactor);
          this.getUnitPrice('dontCall')
        }
        this.calculate();
      }
      else {
        this.createPOLines.orderUnitPrice = '';
      }
    } else {
      this.createPOLines.orderUnitPrice = '';
    }
  }
  getUnitPrice(key?) {
    if (this.conversionFactor && this.createPOLines.orderUnitPrice) {
      this.createPOLines.unitPrice = (DecimalUtils.divide(this.createPOLines.orderUnitPrice, this.conversionFactor));
      (key) ? '' : this.calculate();
    }
  }
  addLine(headerValue, lineValue) {
    this.createPOLines[lineValue] = this.productHeaderData[headerValue];
  }
  calculate(type?, product?) {
    if (type && type == 'scanEdit') {
      this.createPOLines.quantity = DecimalUtils.add(this.existedQuantity, 1);
    }
    let amount: any = 0;
    let taxes: any = 0;
    let taxPercentage: any = 0;
    if (product) {
      this.createPOLines = product;
      this.productMasterInfo = product.productMasterInfo;
      this.lineID = product._id;
      let productList = null;
      if (this.pBySMapping != 'Yes') {
        productList = this.products;
      }
      else {
        productList = this.productList;
      }
      let filteredProduct = productList.find(x => x.productIDName === this.createPOLines.productMasterInfo.productIDName);
      this.tempMoq = filteredProduct.moq;
    }
    if (this.createPOLines.orderUnitPrice && this.createPOLines.quantity) {
      amount = DecimalUtils.multiply(this.createPOLines.orderUnitPrice, this.createPOLines.quantity);
      this.createPOLines.grossAmount = amount;
      if (this.createPOLines.discount) {
        amount = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(this.createPOLines.discount, 100)), amount);
        this.createPOLines.discountAmount = (DecimalUtils.subtract(this.createPOLines.grossAmount, amount));
      }
      if (this.createPOLines.purchaseTaxes && this.createPOLines.purchaseTaxes.length > 0) {
        this.createPOLines.purchaseTaxes.forEach(el => {
          if (product) {
            taxPercentage = DecimalUtils.add(taxPercentage, el.taxPercentage);
          }
          else {
            const filter = this.taxData.find(x => x.taxNamePercentage == el);
            taxPercentage = DecimalUtils.add(taxPercentage, (filter ? filter.taxPercentage : 0));
          }
        });
        this.createPOLines.taxPercentage = taxPercentage;
        this.createPOLines.taxAmount =
          DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);
        taxes = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);
      }
      this.createPOLines.netAmount = DecimalUtils.add(amount, taxes);
      if (type) {
        this.onlyHeaderUpdateToggle = false;
        if (this.existedLineDetails) {
          this.createPOLines.wmsPOLineNumber = this.existedLineDetails.wmsPOLineNumber;
          this.createPOLines._id = this.existedLineDetails._id;
          this.createPOLines.discountAmount = this.existedLineDetails.discountAmount;
          this.createPOLines.taxPercentage = this.existedLineDetails.taxPercentage;
          this.createPOLines.inventoryUnit = this.existedLineDetails.inventoryUnit;
          this.createPOLines.discount = this.existedLineDetails.discount;
          this.createPOLines.unitPrice = this.existedLineDetails.unitPrice;
          this.createPOLines.currency = this.existedLineDetails.currency;
          this.createPOLines.remarks = this.existedLineDetails.remarks;
          this.productToEdit = true;
        }
        if (this.productHeaderData.poDeliveryDate && this.createPOLines.eta) {
          this.save();
        }
        else {
          this.toastr.error('Enter Manditory Dates');
        }
      }
      if (product) {
        this.onlyHeaderUpdateToggle = false;
        this.save();
      }
    }
    else {
      this.createPOLines.taxPercentage = '';
      this.createPOLines.taxAmount = '';
      this.createPOLines.netAmount = '';
      this.createPOLines.grossAmount = '';
      this.createPOLines.discountAmount = '';
    }
  }
  validateDecimal(i) {
    if (i || i == 0) {
      this.productsPOLines[i].quantity = DecimalUtils.enterLimitedDecimals(this.productsPOLines[i].quantity);
    }
    else {
      this.createPOLines.quantity = DecimalUtils.enterLimitedDecimals(this.createPOLines.quantity);
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
  shouldShowErrors(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.invalid && fieldName.touched;
    }
  }
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.valid && fieldName.touched;
    }
  }
  getTaxGroup(value) {
    if (this.taxGroups) {
      const taxGroup = this.taxGroups.find(x => x.taxGroup == value);
      if (taxGroup) {
        return {
          _id: taxGroup._id,
          taxGroup: value,
          taxGroupDescription: taxGroup.taxGroupDescription,
          organizationInfo: taxGroup.organizationInfo,
          wareHouseInfo: taxGroup.wareHouseInfo
        };
      }
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
  save() {
    if (this.permissionsList.includes("Update")) {
      if (this.id && this.onlyHeaderUpdateToggle) {
        const purchaseOrderDetails = JSON.parse(JSON.stringify(this.productHeaderData));
        if (typeof (purchaseOrderDetails.shipToAddress) == 'object' && !purchaseOrderDetails.shipToAddress.name) {
          purchaseOrderDetails.shipToAddress = null;
        }
        if (typeof (purchaseOrderDetails.shipFromAddress) == 'object' && !purchaseOrderDetails.shipFromAddress.name) {
          purchaseOrderDetails.shipFromAddress = null;
        }
        if (typeof (purchaseOrderDetails.billToAddress) == 'object' && !purchaseOrderDetails.billToAddress.name) {
          purchaseOrderDetails.billToAddress = null;
        }
        purchaseOrderDetails['purchaseOrderLines'] = this.productsPOLines;
        purchaseOrderDetails.taxGroup = (purchaseOrderDetails.taxGroup && purchaseOrderDetails.taxGroup.taxGroup) ? this.getTaxGroup(purchaseOrderDetails.taxGroup.taxGroup) : null;
        this.saveorUpdateContinution(purchaseOrderDetails);
      }
      else {
        if (this.createPOLines.quantity) {
          if (this.tempMoq > -1 && DecimalUtils.greaterThanOrEqual(this.createPOLines.quantity, this.tempMoq)) {
            const purchaseOrderDetails = JSON.parse(JSON.stringify(this.productHeaderData));
            if (typeof (purchaseOrderDetails.shipToAddress) == 'object' && !purchaseOrderDetails.shipToAddress.name) {
              purchaseOrderDetails.shipToAddress = null;
            }
            if (typeof (purchaseOrderDetails.shipFromAddress) == 'object' && !purchaseOrderDetails.shipFromAddress.name) {
              purchaseOrderDetails.shipFromAddress = null;
            }
            if (typeof (purchaseOrderDetails.billToAddress) == 'object' && !purchaseOrderDetails.billToAddress.name) {
              purchaseOrderDetails.billToAddress = null;
            }
            if (!this.productMasterInfo) {
              this.productMasterInfo = this.createPOLines.productMasterInfo;
            }
            purchaseOrderDetails['purchaseOrderLines'] = [new PurchaseOrderLines(this.createPOLines, this.productMasterInfo)];
            if (purchaseOrderDetails && (purchaseOrderDetails.supplierMasterInfo || purchaseOrderDetails.wareHouseTransferSourceInfo || purchaseOrderDetails.customerMasterInfo) &&
              purchaseOrderDetails.purchaseOrderLines.length > 0) {
              if (this.id && this.productToEdit) {
                purchaseOrderDetails.purchaseOrderLines[0]._id = this.lineID;
              }
              if (purchaseOrderDetails.supplierMasterInfo && !purchaseOrderDetails.supplierMasterInfo.supplierIDName) {
                purchaseOrderDetails.supplierMasterInfo = null;
              }
              if (purchaseOrderDetails.wareHouseTransferSourceInfo && !purchaseOrderDetails.wareHouseTransferSourceInfo.wareHouseIDName) {
                purchaseOrderDetails.wareHouseTransferSourceInfo = null;
              }
              if (purchaseOrderDetails.customerMasterInfo && !purchaseOrderDetails.customerMasterInfo.customerIDName) {
                purchaseOrderDetails.customerMasterInfo = null;
              }
              purchaseOrderDetails.taxGroup = (purchaseOrderDetails.taxGroup && purchaseOrderDetails.taxGroup.taxGroup) ? this.getTaxGroup(purchaseOrderDetails.taxGroup.taxGroup) : null;
              purchaseOrderDetails.poDeliveryDate = new Date(purchaseOrderDetails.poDeliveryDate);
              purchaseOrderDetails.receiptDate = new Date(purchaseOrderDetails.receiptDate);
              purchaseOrderDetails.receiptType = 'Purchase Order';
              purchaseOrderDetails.purchaseOrderLines.forEach(outer => {
                if (outer.purchaseTaxes && outer.purchaseTaxes.length > 0) {
                  const purchase = JSON.parse(JSON.stringify(outer.purchaseTaxes));
                  outer.purchaseTaxes = [];
                  purchase.forEach(inner => {
                    if (typeof (inner) == 'string') {
                      outer.purchaseTaxes.push(this.getTaxJson(inner, outer.grossAmount, outer.discount));
                    }
                    else {
                      outer.purchaseTaxes.push(inner);
                    }
                    // outer.purchaseTaxes.push(this.getTaxJson(inner, outer.grossAmount, outer.discount));
                  });
                }
              });
              if (this.id) {
                purchaseOrderDetails._id = this.id;
                let totalAmount: any = 0;
                let grossAmount: any = 0;
                let taxAmount: any = 0;
                let discount: any = 0;
                let discountAmount: any = 0;
                let taxPercentage: any = 0;
                let purchaseTaxes = [];
                if (purchaseOrderDetails.purchaseOrderLines.length > 0) {
                  purchaseOrderDetails.purchaseOrderLines.forEach(product => {
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
                purchaseOrderDetails['totalNetAmount'] = totalAmount;
                purchaseOrderDetails['totalGrossAmount'] = grossAmount;
                purchaseOrderDetails['totalTaxAmount'] = taxAmount;
                purchaseOrderDetails['totalDiscount'] = discount;
                purchaseOrderDetails['totalDiscountAmount'] = discountAmount;
                purchaseOrderDetails['totalTaxPercentage'] = taxPercentage;
                if (grouped) {
                  purchaseOrderDetails['totalPurchaseTaxes'] = [];
                  const headers = Object.keys(grouped);
                  headers.forEach(element => {
                    let taxA: any = 0;
                    grouped[element].forEach(tax => {
                      taxA = DecimalUtils.add(taxA, tax.taxAmount);
                    });
                    purchaseOrderDetails['totalPurchaseTaxes'].push({
                      taxAmount: taxA,
                      taxName: element.split(':')[0],
                      taxNamePercentage: element,
                      taxPercentage: element.split(':')[1],
                    })
                  });
                }
                if (!this.existedLineDetails || (this.existedLineDetails && this.existedQuantity != purchaseOrderDetails.purchaseOrderLines[0].quantity)) {
                  this.wmsService.updateIndividualLineinPO(purchaseOrderDetails).subscribe(res => {
                    if (res['status'] == 0 && res['data']['PurchaseOrder']) {
                      this.toastr.success(`${res['data'].PurchaseOrder.fullWmpoNumber} - Updated purchase order successfully`);
                      this.id = res['data'].PurchaseOrder._id;
                      this.lineID = null;
                      this.clear();
                      this.rerender();
                      this.findPurchaseOrderByID(this.pageForTable = 1);
                    }
                  })
                }
              }
              else {
                delete purchaseOrderDetails.totalAmount;
                purchaseOrderDetails['organizationInfo'] = this.configService.getOrganization();
                purchaseOrderDetails['wareHouseInfo'] = this.configService.getWarehouse();
                this.saveorUpdateContinution(purchaseOrderDetails);
              }
            } else {
              this.toastr.error('Please fill details');
            }
          } else {
            this.toastr.error('Order Quantity should be greater than or equal to moq');
          }
        }
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  saveorUpdateContinution(purchaseOrderDetails) {
    let totalAmount: any = 0;
    let grossAmount: any = 0;
    let taxAmount: any = 0;
    let discount: any = 0;
    let discountAmount: any = 0;
    let taxPercentage: any = 0;
    let purchaseTaxes = [];
    if (purchaseOrderDetails.purchaseOrderLines.length > 0) {
      purchaseOrderDetails.purchaseOrderLines.forEach(product => {
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
    purchaseOrderDetails['totalNetAmount'] = totalAmount;
    purchaseOrderDetails['totalGrossAmount'] = grossAmount;
    purchaseOrderDetails['totalTaxAmount'] = taxAmount;
    purchaseOrderDetails['totalDiscount'] = discount;
    purchaseOrderDetails['totalDiscountAmount'] = discountAmount;
    purchaseOrderDetails['totalTaxPercentage'] = taxPercentage;
    if (grouped) {
      purchaseOrderDetails['totalPurchaseTaxes'] = [];
      const headers = Object.keys(grouped);
      headers.forEach(element => {
        let taxA: any = 0;
        grouped[element].forEach(tax => {
          taxA = DecimalUtils.add(taxA, tax.taxAmount);
        });
        purchaseOrderDetails['totalPurchaseTaxes'].push({
          taxAmount: taxA,
          taxName: element.split(':')[0],
          taxNamePercentage: element,
          taxPercentage: element.split(':')[1],
        })
      });
    }
    delete purchaseOrderDetails.financialYearName;
    this.wmsService.saveOrUpdatePurchaseOrderData(JSON.stringify(purchaseOrderDetails)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrder) {
          const poResponse = response.data.purchaseOrder;
          // this.createPurchaseOrderService.createPurchaseOrder = {};
          if (purchaseOrderDetails._id) {
            this.toastr.success(`${poResponse.fullWmpoNumber} - Updated purchase order successfully`);
          }
          else {
            this.toastr.success(`${poResponse.fullWmpoNumber} - Created purchase order successfully`);
          }
          this.appService.navigate('/v1/inbound/createPurchaseOrder', { id: poResponse._id });
          this.id = poResponse._id;
          this.clear();
          this.rerender();
          this.findPurchaseOrderByID(this.pageForTable = 1);
        } else if (response.status === 2 && response.statusMsg === 'Please enter mandatory fields...!') {
          this.toastr.error('Please enter mandatory fields.');
        } else {
          this.toastr.error('Failed in creating purchase order');
        }
      },
      (error) => {
        this.toastr.error('Failed in creating purchase order');
      });
  }
  clear() {
    this.createPOLines = new CreateProductLines();
    this.productToEdit = false;
    this.createPurchaseOrderService.clearProductDetails();
    this.productHeaderData.receiptType = 'Purchase Order';
    this.addLine('poDeliveryDate', 'eta');
    this.onlyHeaderUpdateToggle = true;
    this.bConfig = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    this.dummyProductIDName = null;
    this.paginationStop = false;
  }
  noApprovalsRaisePO(key?) {
    if (key) {
      this.productHeaderData.statusStage = {
        status: 'Rejected',
        statusSequence: null
      }
      this.raisePOContinue(key);
    }
    else {
      this.productHeaderData.statusStage = {
        status: 'Confirmed',
        statusSequence: null
      }
      this.raisePOContinue();
    }
  }
  raisePO(key?) {
    if (this.permissionsList.includes("Update")) {
      if (this.id) {
        if (key) {
          if (this.permissionToggle && this.productHeaderData.statusStages && this.statusObj) {
            if (this.productHeaderData.statusStages[this.productHeaderData.statusStages.length - 1].statusSequence == this.statusObj.statusSequence) {
              this.productHeaderData.statusStage = {
                status: 'Rejected',
                statusSequence: this.statusObj.statusSequence + 1
              }
              this.raisePOContinue(key);
            }
            else {
              this.toastr.error('No Scope for Reject');
            }
          }
        }
        else {
          if (this.permissionToggle && this.productHeaderData.statusStages && this.statusObj) {
            if (this.totalStatusCount == this.productHeaderData.statusStages[this.productHeaderData.statusStages.length - 1].statusSequence) {
              this.productHeaderData.statusStage = {
                status: this.statusObj.status,
                statusSequence: this.statusObj.statusSequence + 1
              }
              this.raisePOContinue();
            }
            else if (this.productHeaderData.statusStages[this.productHeaderData.statusStages.length - 1].statusSequence == this.statusObj.statusSequence) {
              this.productHeaderData.statusStage = {
                status: this.statusObj.status,
                statusSequence: this.statusObj.statusSequence + 1
              }
              this.raisePOContinue();
            }
            else {
              this.toastr.error('No Scope for Raise');
            }
          }
        }
      } else {
        this.toastr.error('Save details before raising PO');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  raisePOContinue(key?) {
    if (key) {
      this.wmsService.rejectRaisePO(this.productHeaderData).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.purchaseOrder) {
            this.toastr.success('PO Rejected successfully');
            this.appService.navigate('/v1/inbound/maintainPurchaseOrder');
          } else {
            this.toastr.error('Failed in Rejecting PO');
          }
        },
        (error) => {
          this.toastr.error('Failed in Rejecting PO');
        });
    }
    else {
      this.wmsService.saveOrUpdateRaisePO(this.productHeaderData, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.toastr.success('PO raised successfully');
            this.appService.navigate('/v1/inbound/maintainPurchaseOrder');
          } else {
            this.toastr.error('Failed in raising PO');
          }
        },
        (error) => {
          this.toastr.error('Failed in raising PO');
        });
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.rerender();
      this.findPurchaseOrderByID(this.pageForTable = 1);
    }
  }
  delete(data: any) {
    this.deleteInfo = { name: 'purchaseOrder', id: data._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  getProductDetails() {
    this.upcEANNumber = (this.pBySMapping == 'Yes') ? this.createPOLines.productIDName : this.dummyProductIDName;
    if (this.upcEANNumber && this.upcEANNumber.length == 12) {
      this.dummyProductIDName = null;
      this.createPOLines.productIDName = null;
      this.scanSuccessHandler(this.upcEANNumber);
      this.upcEANNumber = null;
    }
  }
  edit(line, type?) {
    this.createPOLines = JSON.parse(JSON.stringify(line));
    this.existedQuantity = line.quantity;
    this.dummyProductIDName = line.productMasterInfo.productIDName;
    this.productToEdit = true;
    this.lineID = line._id;
    // this.CreatePurchaseOrderService.createPurchaseOrder.purchaseOrderLines.forEach((product, index) => {
    //   if (product.productMasterInfo.productID === data.productMasterInfo.productID) {
    //     this.editProductIndex = index;
    //   }
    // });
    this.createPOLines.productID = line.productMasterInfo.productID;
    this.createPOLines.productIDName = line.productMasterInfo.productIDName;
    this.createPOLines.productName = line.productMasterInfo.productName;
    this.createPOLines.eta = this.createPOLines.eta ? this.apexService.getDateFromMilliSec(this.createPOLines.eta) : null;
    window.scroll(0, 0);
    this.onProductIDNameChange('Hai', (type ? 'scanEdit' : null));
    // this.calculate();
  }
  generatePDF() {
    setTimeout(() => {
      window.print();
    }, 800);
  }
  /* Supplier Details By ID */
  supplierData: any;
  getSupplierDetailsById() {
    this.createPurchaseOrderService.supplierIDChange.subscribe(data => {
      if (data) {
        this.supplierData = data;
        this.fetchSupplierDetailsById();
        // this.fetchAllCountries();
      }
    });
  }
  printSupplierDetails: any = {}
  fetchSupplierDetailsById() {
    this.printSupplierDetails = this.supplierList.find(x => x._id == this.supplierData.supplierMasterID)
    this.wmsService.passedSupplierDetails = this.printSupplierDetails;
    // this.wmsService.fetchSupplierDetailsById(this.supplierData.supplierMasterID, this.formObj).subscribe(
    //   (response) => {
    //     if (response && response.data.supplierMaster) {
    //       this.printSupplierDetails = response.data.supplierMaster
    //       this.wmsService.passedSupplierDetails = this.printSupplierDetails;
    //     }
    //     else {

    //     }
    //   },
    //   (error) => {

    //   });
  }
  wareHouseDetails: any;
  fetchWareHouseDetailsByID() {
    if (this.id) {
      this.wmsService.fetchWareHouseDetailsByID(this.id, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouse) {
            this.wareHouseDetails = response.data.wareHouse;
          }
        },
        (error) => {
        }
      );
    }
  }
}
