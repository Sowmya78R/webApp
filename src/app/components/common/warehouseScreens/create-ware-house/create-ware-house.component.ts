import { animate, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DecimalUtils } from 'src/app/constants/decimal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Storage } from 'src/app/shared/utils/storage';
@Component({
  selector: 'app-create-ware-house',
  templateUrl: './create-ware-house.component.html',
  styleUrls: ['./create-ware-house.component.scss'],
  animations: [
    trigger('slidein', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate(120, style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate(120, style({ transform: 'translate(-100%)' }))
      ])
    ])
  ]
})

export class CreateWareHouseComponent implements OnInit, OnDestroy, AfterViewInit {
  whTransferForm: FormGroup;
  sourceWareHouses: any = [];
  productsData: CompleterData;
  products: any = [];
  wareHouseTransferLine: FormGroup;
  destinationFormObj = this.configService.getGlobalpayload();
  globalFormObj = this.configService.getGlobalpayload();
  sourceFormObj: any = {};
  allocationType: any = 'Manual';
  returnShowValues: any;
  units: any = [];
  value: any = []
  idForUpdate = this.appService.getParam('id');
  pickupLocationValues: CompleterData;
  returnALLocations: any[];
  batchNumberIDs: CompleterData;
  serialNumberIDs: CompleterData;
  enableTransfer: Boolean = true;
  deleteInfo: any;
  permissionsList: any = null;
  globalIdforDelete: any = null;
  productLogo: any;
  showImage: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  productCategories: any = [];
  taxData: any = [];
  taxIDs: any = [];
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
  tempMoq: number = 0;
  priceFromBE: number = 0;
  taxExemption: any = ''
  transferLines: any = [];
  // expectedDeliveryDate: any = null;
  saveDraftResponse: any = null;
  isShow: boolean = false
  expanded: boolean = true;
  formObj = this.configService.getGlobalpayload();
  productCategoryGroupsResponseList: any = []
  nodes: any = []
  parent: any = []
  selectedData: any;
  finalArr: any;
  firstObject: any;
  secondObj: any;
  thirdArr: any = [];
  secondArr: any = []
  firstArr: any = []
  focusedElement: any;
  subData1: any = []
  firstselectedData: any;
  secondSelectedData: any;
  brandsList: any = []
  wareHouseData: any;
  SubCatogrys1: any = []
  SubCatogrys2: any = []
  SubCatogrys3: any = []
  isSub1Disable: boolean = false;
  isSub2Disable: boolean = false
  isSub3Disable: boolean = false
  categoryData: any;
  detailsData: any
  wareHouseCatalogTransferLine: FormGroup;
  filterdList: any = []
  categoriesList: any = []
  subList1: any = []
  subList3: any = []
  subList2: any = []
  newProductlist: any = []
  bransLists: any = [];
  exisitingRecord: any = null;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  dummySources: any = [];
  basicLines: any = [];
  overAllShipTo: any = null;
  overAllBillTo: any = null;
  shipTOAddressDropdown: any = [];
  billTOAddressDropdown: any = [];
  createPage: any = 1;
  itemsPerPageCreate: any = 10;
  createTotalItems: any;
  searchKey:any = null;
  showTooltip: any = false;


  constructor(private configService: ConfigurationService, private fb: FormBuilder, private metaDataService: MetaDataService,
    private wmsService: WMSService, private mData: MetaDataService, private datepipe: DatePipe,
    private appService: AppService, private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService, private commonMasterDataService: CommonMasterDataService) {
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
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.createForm();
    this.createLinesForm();
    this.fetchAllWarehouseDetails();
    this.fetchingAllBrandConfigurations();
    this.fetchAllProductCategories();
    this.getProductDetails();
    this.fetchAllProductCategoryGroupsDetails();
    this.fetchAllUnits();
    this.findAllTaxes();
    if (this.idForUpdate) {
      // this.rerender();
      this.editbyId(this.idForUpdate, this.createPage);
    } else {

    }
  }
  clear() {
    this.fetchAllProductCategories();
    this.wareHouseTransferLine.controls.brandName.setValue(null);
    this.wareHouseTransferLine.controls.productMasterInfo['controls'].productIDName.setValue(null);
    this.wareHouseTransferLine.controls.productCategoryInfo['controls'].productCategoryName.setValue(null);
    this.whTransferForm.controls.subcatgory1.setValue(null);
    this.whTransferForm.controls.subcatgory2.setValue(null);
    this.whTransferForm.controls.subcatgory3.setValue(null);
    this.isSub1Disable = false;
    this.isSub2Disable = false;
    this.isSub3Disable = false;
    this.getProductDetails();
    this.fetchingAllBrandConfigurations();
    this.filter();
  }
  setJsonto(event, key) {
    if (event) {
      if (key == 'shipToAddress') {
        const shiTo = this.shipTOAddressDropdown.find(x => x.name == event.target.value);
        this.whTransferForm.controls.shipToAddress.setValue(shiTo);
        this.transferLines.forEach((element, i) => {
          element.shipToAddress = shiTo;
        })
      }
      else {
        const bilTo = this.billTOAddressDropdown.find(x => x.name == event.target.value);
        this.whTransferForm.controls.billToAddress.setValue(bilTo);
        this.transferLines.forEach((element, i) => {
          element.billToAddress = bilTo;
        })
      }
    }
  }
  editbyId(id, page?) {
    const form = {
      "page": page ? page : 1,
      "pageSize": this.itemsPerPageCreate,
      "sortDirection": null,
      "sortFields": null,
      "searchOnKeys": PaginationConstants.wareHouseTransferHeaderSearchOnKeys,
      "searchKeyword": null,
      _id: id,
      "organizationIDName": this.destinationFormObj.organizationIDName,
      "wareHouseIDName": this.destinationFormObj.wareHouseIDName,
    }

    this.wmsService.getWTDetailsByIDPaginations(form).subscribe(data => {
      if (data['status'] == 0 && data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer) {
        this.basicLines = data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.wareHouseTransferLines;
        this.createTotalItems = data['data'].wareHouseTransferPaginationResponse.totalElements
        if (!data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.sourceWareHouseInfo || !data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.sourceWareHouseInfo.wareHouseIDName) {
          data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.sourceWareHouseInfo = {
            wareHouseID: null,
            wareHouseIDName: null,
            wareHouseMasterID: null,
            wareHouseName: null
          }
        }
        this.whTransferForm.patchValue(data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer);
        this.saveDraftResponse = data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer;
        this.transferLines = data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.wareHouseTransferLines;
        if (this.transferLines.length) {
          this.transferLines.forEach(element => {
            if (this.dummySources.length > 0) {
              if (!element.sourceWareHouseInfo) {
                if (element.sourceWareHouseInfos) {
                  element.sourceWareHouseInfo = element.sourceWareHouseInfos[0];
                  // element['shipFromAddressDropdown'] = this.dummySources.find(x => x.wareHouseIDName == element.sourceWareHouseInfo.wareHouseIDName).shipFromAddresses;
                  // element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null);

                }
                else {
                  element.sourceWareHouseInfo = this.whTransferForm.controls.sourceWareHouseInfo.value;
                  if (element.sourceWareHouseInfo) {
                    // element['shipFromAddressDropdown'] = this.dummySources.find(x => x.wareHouseIDName == element.sourceWareHouseInfo.wareHouseIDName).shipFromAddresses;
                    // element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null);
                  }
                }
              }
              // else {
              //   if (element.sourceWareHouseInfo.wareHouseIDName) {
              //     element['shipFromAddressDropdown'] = this.dummySources.find(x => x.wareHouseIDName == element.sourceWareHouseInfo.wareHouseIDName).shipFromAddresses;
              //     element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null);
              //   }
              // }
            }
          });
        }
        this.rerender();
        this.framingSourceObj(this.whTransferForm.value.sourceWareHouseInfo.wareHouseIDName);
      }
    })
  }
  createForm() {
    this.whTransferForm = this.fb.group({
      _id: null,
      backOrder: null,
      wareHouseTransferTransactionID: null,
      wareHouseTransferTransactionIDPrefix: null,
      fullWareHouseTransferTransactionID: null,
      organizationInfo: this.configService.getOrganization(),
      wareHouseInfo: this.configService.getWarehouse(),
      destinationWareHouseInfo: this.fb.group(this.configService.getWarehouse()),
      wareHouseTransferLines: [],
      draftApproval: null,
      sourceWareHouseInfo: this.fb.group({
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      }),
      statusStage: null,
      statusStages: [],
      createdDate: null,
      lastUpdatedDate: null,
      wareHouseTransferRequestFromInfo: {
        "_id": null,
        "wareHouseTransferTransactionID": null,
        fullWareHouseTransferTransactionID: null,
        wareHouseTransferTransactionIDPrefix: null,
      },
      confirmedBy: null,
      confirmedDate
        :
        null,

      createdBy
        : null,
      rejectedBy
        :
        null,
      rejectedDate
        :
        null,
      wareHouseTransferRequestToInfo
        :
        null,
      sourceOrganizationInfo: null,
      destinationOrganizationInfo: this.configService.getOrganization(),
      shipToAddress: null,
      shipFromAddress: null,
      billToAddress: null,
      productCategoryGroupDetail: null,
      // productCategoryGroupDetail: this.fb.group({
      //   "_id": null,
      //   "productCategoryName": null,
      //   "hierarchyLevel": 0,
      //   childProductSubCategories: null,
      // }),
      //
      subcatgory1: null,
      subcatgory2: null,
      subcatgory3: null
    })
  }
  unitChange(data, i) {
    if (this.transferLines[i].customerOrderQuantity && this.transferLines[i].shipmentUnit) {
      this.transferLines[i].select = true;
    }
    else {
      this.transferLines[i].select = false;
    }
    this.calculateReceivedQty(data, i);
  }
  setSelect1(event, i) {
    this.transferLines[i].customerOrderQuantity = (event && event.target.value) ? Number(event.target.value) : null;
    if (this.transferLines[i].customerOrderQuantity && this.transferLines[i].shipmentUnit) {
      this.transferLines[i].select = (event && event.target.value) ? true : false;
    }
  }
  setWareHouseinTable(event, i, data) {
    const obj = data.sourceWareHouseInfos.find(x => x.wareHouseIDName == event.target.value);
    this.transferLines[i].sourceWareHouseInfo = obj ? obj : null;
    const final = {
      "destinationWareHouseIDName": this.globalFormObj.wareHouseIDName,
      "sourceWareHouseIDName": data.sourceWareHouseInfo.wareHouseIDName,
      "productIDNames": [data.productMasterInfo.productIDName],
      "productCategoryNames": this.wareHouseTransferLine.controls.productCategoryInfo.value.productCategoryName,
      "organizationIDName": this.destinationFormObj.organizationIDName,
      "wareHouseIDName": this.destinationFormObj.wareHouseIDName,
      "wareHouseTransferID": this.idForUpdate ? this.idForUpdate : null,
      "productCategoryGroupDetail": null,
      "productCategoryHierarchies": this.heirarchiesFraming(),
      "brandNames": this.wareHouseTransferLine.controls.brandName.value,
      "destinationWareHouseMasterID": this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseMasterID,
      "sourceWareHouseMasterID": data.sourceWareHouseInfo.wareHouseMasterID,
      "linesSourceWareHouseIDNameChange": true,
      page: this.createPage,
      pageSize: this.itemsPerPageCreate
    }

    this.wmsService.getWarehouseTransferLines(final).subscribe(res => {
      if (res['status'] == 0 && res['data'].wareHouseTransferPaginationResponse.wareHouseTransferLines) {
        this.transferLines[i] = res['data'].wareHouseTransferPaginationResponse.wareHouseTransferLines[0];
        this.createTotalItems = data['data'].wareHouseTransferPaginationResponse.totalElements
        this.wmsService.fetchAllWarehouses({ "_id": obj.wareHouseMasterID }).subscribe(res => {
          if (res['status'] == 0 && res.data.wareHouses) {
            this.transferLines[i].sourceOrganizationInfo = res.data.wareHouses[0].organizationInfo;
            // const soID = this.dummySources.find(x => x.wareHouseIDName == obj.wareHouseIDName);
            // this.transferLines[i]['shipFromAddressDropdown'] = soID.shipFromAddresses;
            // this.transferLines[i].shipFromAddress = this.transferLines[i]['shipFromAddressDropdown'].find(x => x.defaultAddress);

          }
          else {
            this.transferLines[i].sourceOrganizationInfo = null;
            // this.transferLines[i]['shipFromAddressDropdown'] = [];
            // this.transferLines[i].shipFromAddress = null;
          }
        });
      }
    })
  }
  createLinesForm() {
    this.wareHouseTransferLine = this.fb.group(
      {
        "_id": null,
        "productMasterInfo": this.fb.group({
          "productMasterID": null,
          "productID": null,
          "productName": null,
          "productIDName": null,
          "moq": null,
          "leadTime": null,
          "receivingUnit": null,
          "isActive": true,
          "price": null
        }),
        productCategoryInfo: this.fb.group({
          productCategoryID: null,
          productCategory: null,
          productCategoryName: null
        }),
        productImage: null,
        "quantityInventoryUnit": null,
        "transferQuantity": null,
        "orderQuantity": null,
        "discount": null,
        "unitPrice": null,
        "orderUnitPrice": null,
        "grossAmount": null,
        "saleTaxes": null,
        "taxAmount": null,
        "taxPercentage": null,
        "discountAmount": null,
        "netAmount": null,
        "currency": null,
        "customerOrderQuantity": null,
        "brandName": null,
        // "markupPercentage": null,
        "shipmentUnit": null,
        "inventoryUnit": null,
        "inventoryHelpers": [[]],
        "locationAllocationType": this.allocationType,
        "requestedDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd')
      }
    )
  }

  validate(key, i) {
    this.transferLines[i][key] = DecimalUtils.enterLimitedDecimals(this.transferLines[i][key]);
  }
  warehousesDataResponceList: any = [];
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehousesByGlobal(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTransferConfigurations && response.data.wareHouseTransferConfigurations.length > 0) {
          const sHouses = response.data.wareHouseTransferConfigurations[0].sourceOrganizationWareHouseInfos;
          this.sourceWareHouses = sHouses.map(x => x.wareHouseInfo);
          this.wmsService.fetchAllWarehouses({}).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data.wareHouses) {
                this.dummySources = JSON.parse(JSON.stringify(response.data.wareHouses));
                // this.dummySources = sHouses.map(x => x.wareHouseInfo);
                if (!this.idForUpdate && this.sourceWareHouses.length > 0) {
                  this.whTransferForm.controls.sourceWareHouseInfo.patchValue(this.sourceWareHouses[0])
                  this.framingSourceObj(this.sourceWareHouses[0].wareHouseIDName);

                }
                else {
                  this.wmsService.fetchAllWarehouses({}).subscribe(
                    (response) => {
                      if (response && response.status === 0 && response.data.wareHouses) {
                        this.dummySources = JSON.parse(JSON.stringify(response.data.wareHouses));
                        const abc: any = response.data.wareHouses;
                        this.sourceWareHouses = abc.filter(x => x.wareHouseIDName != this.configService.getGlobalpayload().wareHouseIDName)
                        if (this.idForUpdate) {
                          this.rerender();
                        }
                        this.getLines();
                      }
                    })
                }
              }
            })
        }
        else {
          this.wmsService.fetchAllWarehouses({}).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data.wareHouses) {
                const abc: any = response.data.wareHouses;
                this.dummySources = JSON.parse(JSON.stringify(response.data.wareHouses));
                this.sourceWareHouses = abc.filter(x => x.wareHouseIDName != this.configService.getGlobalpayload().wareHouseIDName)
                if (this.idForUpdate) {
                  this.rerender();
                }
                this.getLines();
              }
            })
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
  // tree select dropdown data framing  and related methods
  getProductCategoryDetails() {
    const form = this.wareHouseTransferLine.value
    let data = this.productCategoryGroupsResponseList.find(k => k.productCategoryName === form.productCategoryInfo.productCategoryName)
    this.selectedData = data
    if (data) {
      console.log(data);
      if (data.childProductSubCategories.length > 0) {
        this.parent = JSON.parse(JSON.stringify(data.childProductSubCategories));
        this.parent.forEach(el => {
          el.title = el.productSubCategoryName
          el.key = el.productSubCategoryName
          if (el.childProductSubCategories && el.childProductSubCategories.length > 0) {
            el.children = el.childProductSubCategories
            if (el.children && el.children.length > 0) {
              el.children.forEach(sub1 => {
                sub1.title = sub1.productSubCategoryName
                sub1.key = sub1.productSubCategoryName
                if (sub1.childProductSubCategories && sub1.childProductSubCategories.length > 0) {
                  sub1.children = sub1.childProductSubCategories
                  if (sub1.children && sub1.children.length > 0) {
                    sub1.children.forEach(sub2 => {
                      sub2.title = sub2.productSubCategoryName
                      sub2.key = sub2.productSubCategoryName
                      if (sub2.childProductSubCategories && sub2.childProductSubCategories.length > 0) {
                        sub2.children = sub2.childProductSubCategories
                      } else {
                        sub2.children = null
                      }
                    })
                  }
                } else {
                  sub1.children = null
                }
              })
            }

          } else {
            el.children = null
          }
        })
        this.nodes = this.parent
      }
    }
  }
  saveDataframing() {
    if (this.nodes.length > 0) {
      this.nodes.forEach(ele => {
        this.firstArr = []
        if (ele.checked === true) {
          this.firstArr.push(ele)
        } else {
          this.firstObject = ele
          if (ele.childProductSubCategories && ele.childProductSubCategories.length > 0) {
            this.secondArr = []
            ele.childProductSubCategories.forEach(s => {
              if (s.checked === true) {
                this.secondArr.push(s)
              } else {
                this.secondObj = s
                if (s.childProductSubCategories && s.childProductSubCategories.length > 0) {
                  this.thirdArr = []
                  s.childProductSubCategories.forEach(m => {
                    if (m.checked === true) {
                      this.thirdArr.push(m)
                    } else {
                      console.log(m)
                    }
                  })
                }
              }
            })
          } else {

          }
        }
      })
      this.finalArr = []
      if (this.firstArr.length > 0) {
        // this.finalArr = this.firstArr
        this.firstArr.forEach(ele => {
          delete ele.checked
          delete ele.children
          delete ele.expanded
          delete ele.title
          delete ele.key
          delete ele.selected
          if (ele.childProductSubCategories && ele.childProductSubCategories.length > 0) {
            ele.childProductSubCategories.forEach(n => {
              delete n.checked
              delete n.children
              delete n.expanded
              delete n.title
              delete n.key
              delete n.selected
              if (n.childProductSubCategories && n.childProductSubCategories.length > 0) {
                n.childProductSubCategories.forEach(u => {
                  delete u.checked
                  delete u.children
                  delete u.expanded
                  delete u.title
                  delete u.key
                  delete u.selected
                })
              }
            })
          }
        })
        console.log(this.firstArr)
      } else {
        if (this.secondArr.length > 0) {
          this.secondArr.forEach(o => {
            delete o.checked
            delete o.children
            delete o.expanded
            delete o.title
            delete o.key
            delete o.selected
            if (o.childProductSubCategories && o.childProductSubCategories.length > 0) {
              o.childProductSubCategories.forEach(u => {
                delete u.checked
                delete u.children
                delete u.expanded
                delete u.title
                delete u.key
                delete u.selected
              })
            }
          })
          let obj = {}
          obj['hierarchyLevel'] = this.firstObject.hierarchyLevel
          obj['productSubCategoryName'] = this.firstObject.productSubCategoryName
          obj['childProductSubCategories'] = this.secondArr
          this.finalArr.push(obj)
        } else {
          let thirddummyArr: any = []
          if (this.thirdArr && this.thirdArr.length > 0) {
            this.thirdArr.forEach(d => {
              let thobj = {}
              thobj['hierarchyLevel'] = d.hierarchyLevel
              thobj['productSubCategoryName'] = d.productSubCategoryName
              thobj['childProductSubCategories'] = null
              thirddummyArr.push(thobj)
            })
          } else {
            thirddummyArr = null
          }
          let arr = []
          let object = {}
          object['hierarchyLevel'] = this.secondObj.hierarchyLevel
          object['productSubCategoryName'] = this.secondObj.productSubCategoryName
          object['childProductSubCategories'] = thirddummyArr
          arr.push(object)
          let obj = {}
          obj['hierarchyLevel'] = this.firstObject.hierarchyLevel
          obj['productSubCategoryName'] = this.firstObject.productSubCategoryName
          obj['childProductSubCategories'] = arr
          this.finalArr.push(obj)
        }
      }
      let objcets = {}
      objcets['_id'] = this.selectedData._id
      objcets['productCategoryName'] = this.selectedData.productCategoryName
      objcets['childProductSubCategories'] = this.finalArr
      objcets['hierarchyLevel'] = this.selectedData.hierarchyLevel
      this.whTransferForm.controls.productCategoryGroupDetail.patchValue(objcets)
      console.log(objcets)
    }
  }
  onChange(event: any): void {
    if (event) {
      this.getLines()
    }
  }
  fetchingAllBrandConfigurations() {
    let obj = this.configService.getGlobalpayload()
    this.metaDataService.fetchAllBrandConfigurations(obj).subscribe(response => {
      if (response && response.status === 0 && response.data.brandConfigurations) {
        this.brandsList = response.data.brandConfigurations;
      } else {
        this.brandsList = []
      }
    });
  }
  selectedBrand(data, event, i) {
    if (event.target.value && this.transferLines[i].customerOrderQuantity && this.transferLines[i].shipmentUnit) {
      data.brandName = event.target.value
      this.transferLines[i].select = true;
    }
    else {
      this.transferLines[i].select = false;
    }
  }
  // getSubData1Details(){
  //   this.subData1 =[]
  //   const form = this.wareHouseTransferLine.value
  //   let subDataLevel1:any =[]
  //   let data = this.productCategoryGroupsResponseList.find(k => k.productCategoryName === form.productCategoryInfo.productCategoryName)
  //   delete data.organizationInfo
  //   delete data.wareHouseInfo
  //   this.selectedData = data
  //   this.firstselectedData = data
  //   this.secondSelectedData = data
  //   data.childProductSubCategories.forEach(ele=> {
  //       subDataLevel1.push(ele)
  //     })
  //     this.subData1 = subDataLevel1.map(k=>k.productSubCategoryName)
  // }
  getSubdata(val) {
    if (val === 'sub1') {
      const form = this.whTransferForm.value
      if (this.firstselectedData.childProductSubCategories && this.firstselectedData.childProductSubCategories.length > 0) {
        this.firstselectedData.childProductSubCategories.forEach(ele => {
          ele.childProductSubCategories = null
        })
      }
      this.whTransferForm.controls.productCategoryGroupDetail.patchValue(this.firstselectedData)
      this.getLines()
    }
  }
  getSubData1Details(event) {
    const form = this.whTransferForm.value
    console.log(form.productCategoryGroupDetail.childProductSubCategories)
    this.detailsData = this.productCategoryGroupsResponseList.filter(k => k.productCategoryName === event)
    this.whTransferForm.controls.productCategoryGroupDetail.patchValue(this.detailsData[0])
    this.productCategoryGroupsResponseList.filter(k => {
      if (k.productCategoryName == event) {
        this.SubCatogrys1 = k.childProductSubCategories
      }
    })
  }
  OnsubcatgoryChange(event) {
    const form = this.whTransferForm.value
    let dummyArr: any
    this.SubCatogrys1.filter(k => {
      if (k.productSubCategoryName == event) {
        dummyArr = k
        this.SubCatogrys2 = k.childProductSubCategories
      }
    })
    dummyArr.childProductSubCategories = null
    delete dummyArr._id
    let arr: any = []
    arr.push(dummyArr)
    form.productCategoryGroupDetail.childProductSubCategories = arr
    this.getLines()
  }
  Onsub2catgoryChange(event) {
    const form = this.whTransferForm.value
    let dubliArr: any
    this.SubCatogrys2.filter(k => {
      if (k.productSubCategoryName == event) {
        dubliArr = k
        this.SubCatogrys3 = k.childProductSubCategories
        console.log(this.SubCatogrys3)
      }
    })
    let arr: any = []
    dubliArr.childProductSubCategories = null
    delete dubliArr._id
    arr.push(dubliArr)
    form.productCategoryGroupDetail.childProductSubCategories.forEach(ele => {
      ele.childProductSubCategories = arr
    })
    this.getLines()
  }
  Onsub3catgoryChange(event) {
    const form = this.whTransferForm.value
    let duArr: any
    this.SubCatogrys3.filter(k => {
      if (k.productSubCategoryName == event) {
        duArr = k
      }
    })
    let arr: any = []
    duArr.childProductSubCategories = null
    delete duArr._id
    arr.push(duArr)
    form.productCategoryGroupDetail.childProductSubCategories.forEach(ele => {
      ele.childProductSubCategories.forEach(el => {
        el.childProductSubCategories = arr
      })
    })
    this.getLines()
  }
  framingSourceObj(event) {
    if (event) {
      const wareHouseDetails = this.sourceWareHouses.find(x => x.wareHouseIDName == event);
      if (wareHouseDetails) {
        this.whTransferForm.controls.sourceWareHouseInfo.patchValue(wareHouseDetails);
        this.whTransferForm.controls.sourceWareHouseInfo['controls'].wareHouseMasterID.patchValue(wareHouseDetails._id ? wareHouseDetails._id : wareHouseDetails.wareHouseMasterID);
        this.sourceFormObj['wareHouseIDName'] = wareHouseDetails.wareHouseIDName;
        // this.sourceFormObj['organizationIDName'] = wareHouseDetails.organizationInfo.organizationIDName;

        // if (this.idForUpdate) {
        this.rerender();
        // }
        this.getLines();
        if (this.globalFormObj.wareHouseIDName == this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName) {
          this.fetchPickingAllocationTpe();
        }
      }
    }
    else {
      this.whTransferForm.controls.sourceWareHouseInfo.patchValue({
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      })
    }
  }
  productCategoriesIDs: CompleterData;
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.globalFormObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.productCategories = response.data.productCategories
          this.categoriesList = response.data.productCategories.map(x => x.productCategoryName);
        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
    this.metaDataService.fetchAllCommonSubCategory1s(this.globalFormObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory1s) {
          this.subList1 = response.data.productSubCategory1s.map(x => x.productSubCategory1Name);
        }
        else {
          this.subList1 = [];
        }
      },
      error => {
        this.subList1 = [];
      }
    );


    this.metaDataService.fetchAllCommonSubCategory2s(this.globalFormObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory2s) {
          this.subList2 = response.data.productSubCategory2s.map(x => x.productSubCategory2Name);
        }
        else {
          this.subList2 = [];
        }
      },
      error => {
        this.subList2 = [];
      }
    );


    this.metaDataService.fetchAllCommonSubCategory3s(this.globalFormObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory3s) {
          this.subList3 = response.data.productSubCategory3s.map(x => x.productSubCategory3Name);
        }
        else {
          this.subList3 = [];
        }
      },
      error => {
        this.subList3 = [];
      }
    );
  }
  fetchAllProductCategoryGroupsDetails() {
    this.wmsService.fetchAllProductCategoryGroups(this.globalFormObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategoryGroups && response.data.productCategoryGroups) {
          this.productCategoryGroupsResponseList = response.data.productCategoryGroups
        }
      })
  }


  getProductDetails() {
    this.wmsService.fetchAllProducts(this.globalFormObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
          this.productsData = this.products.map(x => x.productIDName);
          this.newProductlist = this.productsData;
        }
      })
  }
  findAllTaxes() {
    this.commonMasterDataService.fetchAllUOMConversion(this.destinationFormObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.uoms) {
          this.uomConversions = response.data.uoms;
        }
      },
      (error) => {
      });

  }

  fetchAllUnits() {
    this.mData.fetchAllUnits(this.destinationFormObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.units && response.data.units.length) {
          this.units = response.data.units;
        }
        else {
          this.units = [];
        }
      },
      error => {
        this.units = [];
      });
  }
  fetchPickingAllocationTpe() {
    this.allocationType = 'Manual'
    this.mData.getLocationAllocationType(this.sourceFormObj).subscribe(res => {
      if (res.status == 0 && res.data.pickingLocationAllocationConfigurations && res.data.pickingLocationAllocationConfigurations.length > 0) {
        this.allocationType = res.data.pickingLocationAllocationConfigurations[0].pickingLocationAllocationType;
        this.wareHouseTransferLine.controls.locationAllocationType.setValue(res.data.pickingLocationAllocationConfigurations[0].pickingLocationAllocationType);
      }
    })
  }
  getProductsList(event) {
    if (event && event != '-Select--' && event != "null") {
      this.productsData = this.products.filter(x => x.productCategoryInfo.productCategoryName == event).map(x => x.productIDName);
      this.getProductCategory(event);
    }
    else {
      this.productsData = this.products.map(x => x.productIDName);
      this.wareHouseTransferLine.controls.productCategoryInfo['controls'].productCategoryID.setValue(null);
      this.wareHouseTransferLine.controls.productCategoryInfo['controls'].productCategory.setValue(null);

    }
    this.getLines();
    // this.getProductFiltersData();
    // this.getDropdownDatas();
  }
  getProductCategory(value) {
    if (this.productCategories) {
      this.productCategories.forEach(productCategory => {
        if (productCategory.productCategoryName === value) {
          this.wareHouseTransferLine.controls.productCategoryInfo['controls'].productCategoryID.setValue(productCategory._id);
          this.wareHouseTransferLine.controls.productCategoryInfo['controls'].productCategory.setValue(productCategory.productCategory);
        }
      });
    }
  }
  onProductIDNameChange(event) {
    this.productLogo = null;
    this.tempMoq = 0;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    if (event) {
      const productDetails = this.products.find(x => x.productIDName == event.originalObject);
      this.wareHouseTransferLine.controls.productMasterInfo.patchValue(productDetails);
      this.wareHouseTransferLine.controls.productMasterInfo['controls'].productMasterID.setValue(productDetails._id);
      this.wareHouseTransferLine.controls.inventoryUnit.patchValue(productDetails.inventoryUnit);
      this.wareHouseTransferLine.controls.productImage.patchValue(productDetails.productImage);
      this.tempMoq = productDetails.moq;
      this.getLines();
      this.getDropdownDatas();
    }
  }
  heirarchiesFraming() {
    const form = this.whTransferForm.value;
    const formChild = this.wareHouseTransferLine.value;
    if (formChild.productCategoryInfo.productCategoryName && (!form.subcatgory1 && !form.subcatgory2 && !form.subcatgory3)) {
      // this.whTransferForm.controls.productCategoryHierarchies.patchValue(null);
      return null;
    }
    else {
      if (!formChild.productCategoryInfo.productCategoryName && (!form.subcatgory1 && !form.subcatgory2 && !form.subcatgory3)) {
        return null;
      }
      else {
        let arr: any = []
        let obj = {
          "hierarchyLevel": 0,
          "productSubCategoryNames": this.wareHouseTransferLine.controls.productCategoryInfo.value.productCategoryName,
        }
        arr.push(obj)
        if (form.subcatgory1 && form.subcatgory1.length > 0) {
          let obj = {
            "hierarchyLevel": 1,
            "productSubCategoryNames": form.subcatgory1
          }
          arr.push(obj)
        }
        if (form.subcatgory2 && form.subcatgory2.length > 0) {
          let obj = {
            "hierarchyLevel": 2,
            "productSubCategoryNames": form.subcatgory2
          }
          arr.push(obj)
        }
        if (form.subcatgory3 && form.subcatgory3.length > 0) {
          let obj = {
            "hierarchyLevel": 3,
            "productSubCategoryNames": form.subcatgory3
          }
          arr.push(obj)
        }
        return arr;
      }
    }
  }
  getExistingCategory() {
    const form = this.wareHouseTransferLine.value;
    const headerForm = this.whTransferForm.value;
    if (form.productCategoryInfo && form.productCategoryInfo.productCategoryName && form.productCategoryInfo.productCategoryName.length == 1) {
      this.exisitingRecord = this.productCategoryGroupsResponseList.find(k => k.productCategoryName === form.productCategoryInfo.productCategoryName[0])

      if (this.exisitingRecord && headerForm.subcatgory1 && headerForm.subcatgory1.length == 1) {
        // this.whTransferForm.controls.subcatgory1.setValue(this.exisitingRecord.childProductSubCategories.map(x => x.productSubCategoryName));
        this.isSub2Disable = false;
        const child = this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == headerForm.subcatgory1[0]);

        if (child) {
          this.whTransferForm.controls.subcatgory2.setValue(child.childProductSubCategories.map(x => x.productSubCategoryName));
          this.getSub3DropdownDisable();
        }
        else {
          this.whTransferForm.controls.subcatgory2.setValue(null);
          this.whTransferForm.controls.subcatgory3.setValue(null);
        }
      }
      else {
        this.isSub3Disable = true;
        this.isSub2Disable = true;
        this.whTransferForm.controls.subcatgory2.setValue(null);
        this.whTransferForm.controls.subcatgory3.setValue(null);
      }
    }
    else {
      this.isSub3Disable = true;
      this.isSub2Disable = true;
      this.isSub1Disable = true;
      this.whTransferForm.controls.subcatgory1.setValue(null);
      this.whTransferForm.controls.subcatgory2.setValue(null);
      this.whTransferForm.controls.subcatgory3.setValue(null);
    }
    this.getDropdownDatas();
  }
  getSub3DropdownDisable() {
    const data = this.whTransferForm.value;
    if (data.subcatgory2 != null && data.subcatgory2.length > 1) {
      this.isSub3Disable = true;
      this.whTransferForm.controls.subcatgory3.setValue(null);
    } else {
      if (data.subcatgory2 == null || data.subcatgory2.length == 0) {
        this.isSub3Disable = true;
        this.whTransferForm.controls.subcatgory3.setValue(null);
      }
      else if (data.subcatgory2.length == 1) {
        this.isSub3Disable = false;
        const child = this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == data.subcatgory1[0]);
        if (child) {
          const child1 = child.childProductSubCategories.find(x => x.productSubCategoryName == data.subcatgory2[0]);
          if (child1 && child1.childProductSubCategories) {
            this.whTransferForm.controls.subcatgory3.setValue(child1.childProductSubCategories.map(x => x.productSubCategoryName));
            // this.isSub3Disable = false;
          }
          else {
            this.whTransferForm.controls.subcatgory3.setValue(null);
            // this.isSub3Disable = true;
          }
        }
        else {
          this.whTransferForm.controls.subcatgory3.setValue(null);
          // this.isSub3Disable = true;
        }

      }
      else {
        this.isSub3Disable = false;
      }
    }
    this.getDropdownDatas();
  }
  getCategoryName() {
    if (this.wareHouseTransferLine.controls.productCategoryInfo.value.productCategoryName) {
      this.getDropdownDatas();
      const form = this.wareHouseTransferLine.value;
      if (form.productCategoryInfo && form.productCategoryInfo.productCategoryName && form.productCategoryInfo.productCategoryName.length > 1) {
        this.isSub3Disable = true;
        this.isSub2Disable = true;
        this.isSub1Disable = true;
        this.whTransferForm.controls.subcatgory1.setValue(null);
        this.whTransferForm.controls.subcatgory2.setValue(null);
        this.whTransferForm.controls.subcatgory3.setValue(null);
      }
      else {
        this.isSub3Disable = false;
        this.isSub2Disable = false;
        this.isSub1Disable = false;
      }
    }
  }

  getDropdownDatas() {
    const final = {
      "productIDNames": this.wareHouseTransferLine.controls.productMasterInfo.value.productIDName,
      "productCategoryNames": this.wareHouseTransferLine.controls.productCategoryInfo.value.productCategoryName,
      "organizationIDName": this.destinationFormObj.organizationIDName,
      "wareHouseIDName": this.destinationFormObj.wareHouseIDName,
      "productIDName": null,
      "productCategoryName": null,
      "productCategoryGroupDetail": null,
      "brandNames": this.wareHouseTransferLine.controls.brandName.value,
      "productCategoryHierarchies": this.heirarchiesFraming()
    }
    if (final.wareHouseIDName && final.organizationIDName && !final.productIDNames && !final.productCategoryNames
      && !final.productIDName && !final.productCategoryName && !final.productCategoryGroupDetail &&
      !final.productCategoryHierarchies && !final.brandNames) { }
    else {
      this.wmsService.getProductFiltersData(final).subscribe(res => {
        if (res['status'] == 0 && res['data'].productFilterResponse) {
          this.filterdList = res['data'].productFilterResponse;
          // if (selected != 'productCategoryName') {
          //   this.categoriesList = this.filterdList.productCategoryNames;
          // }
          this.bransLists = this.filterdList.brandNames
          this.newProductlist = this.filterdList.productIDNames;
          // if (this.filterdList.productCategoryHierarchies && this.filterdList.productCategoryHierarchies.length > 0) {
          //   this.filterdList.productCategoryHierarchies.forEach(ele => {
          //     if (ele.hierarchyLevel === 1 && selected != 'subcatgory1') {
          //       this.subList1 = ele.productSubCategoryNames;
          //     } else if (ele.hierarchyLevel === 2 && selected != 'subcatgory2') {
          //       this.subList2 = ele.productSubCategoryNames;
          //     } else if (ele.hierarchyLevel === 3 && selected != 'subcatgory3') {
          //       this.subList3 = ele.productSubCategoryNames;
          //     }
          //   })
          // }
        }
      })
    }
  }


  getCategoriesFraming() {
    const form = this.whTransferForm.value
    let arr: any = []
    let obj = {
      "hierarchyLevel": 0,
      "productSubCategoryNames": this.wareHouseTransferLine.controls.productCategoryInfo.value.productCategoryName,
    }
    arr.push(obj)
    if (form.subcatgory1 && form.subcatgory1.length > 0) {
      let obj = {
        "hierarchyLevel": 1,
        "productSubCategoryNames": form.subcatgory1
      }
      arr.push(obj)
    }
    if (form.subcatgory2 && form.subcatgory2.length > 0) {
      let obj = {
        "hierarchyLevel": 2,
        "productSubCategoryNames": form.subcatgory2
      }
      arr.push(obj)
    }
    if (form.subcatgory3 && form.subcatgory3.length > 0) {
      let obj = {
        "hierarchyLevel": 3,
        "productSubCategoryNames": form.subcatgory3
      }
      arr.push(obj)
    }
    this.whTransferForm.controls.productCategoryGroupDetail.patchValue(arr)
  }
  filter() {
    this.rerender();
    this.getLines();
  }

  getLines(createPage?) {
    // this.saveDataframing()
    let sID: any = this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseMasterID;
    if (typeof (this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseMasterID) == 'object' && this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName) {
      sID = this.dummySources.find(x => x.wareHouseIDName == this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName)._id;
      this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseMasterID = sID;
    }
    const final = {
      "destinationWareHouseIDName": this.globalFormObj.wareHouseIDName,
      "sourceWareHouseIDName": this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName,
      "productIDNames": this.wareHouseTransferLine.controls.productMasterInfo.value.productIDName,
      "productCategoryNames": this.wareHouseTransferLine.controls.productCategoryInfo.value.productCategoryName,
      "organizationIDName": this.destinationFormObj.organizationIDName,
      "wareHouseIDName": this.destinationFormObj.wareHouseIDName,
      "wareHouseTransferID": this.idForUpdate ? this.idForUpdate : null,
      "productCategoryGroupDetail": null,
      // "productCategoryHierarchies": this.whTransferForm.controls.productCategoryGroupDetail.value,
      "productCategoryHierarchies": this.heirarchiesFraming(),
      "brandNames": this.wareHouseTransferLine.controls.brandName.value,
      "destinationWareHouseMasterID": this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseMasterID,
      "sourceWareHouseMasterID": sID,
      "linesSourceWareHouseIDNameChange": false,
      page: createPage ? createPage : 1 ,
      pageSize: this.itemsPerPageCreate
    }

    if (this.idForUpdate) {
      this.wmsService.getNewWarehouseTransferLines(final).subscribe(res => {
        if (res['status'] == 0 && res['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.wareHouseTransferLines) {
          this.transferLines = res['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.wareHouseTransferLines;
          this.createTotalItems = res['data'].wareHouseTransferPaginationResponse.totalElements
          this.shipTOAddressDropdown = this.dummySources.find(x => x.wareHouseIDName == this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseIDName).shipToAddresses;
          const shiTo = this.shipTOAddressDropdown.find(x => x.defaultAddress);
          if (!this.whTransferForm.controls.shipToAddress.value) {
            this.whTransferForm.controls.shipToAddress.setValue(shiTo);
          }
          this.overAllShipTo = this.whTransferForm.controls.shipToAddress.value.name;

          this.billTOAddressDropdown = this.dummySources.find(x => x.wareHouseIDName == this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseIDName).billToAddresses;
          const bilTo = this.billTOAddressDropdown.find(x => x.defaultAddress);
          if (!this.whTransferForm.controls.billToAddress.value) {
            this.whTransferForm.controls.billToAddress.setValue(bilTo);
          }
          this.overAllBillTo = this.whTransferForm.controls.billToAddress.value.name;

          if (this.transferLines.length) {
            this.transferLines.forEach(element => {
              element.shipToAddress = this.whTransferForm.controls.shipToAddress.value;
              element.billToAddress = this.whTransferForm.controls.billToAddress.value;
              if (!element.sourceWareHouseInfo) {
                if (element.sourceWareHouseInfos) {
                  element.sourceWareHouseInfo = element.sourceWareHouseInfos[0];
                  // element['shipFromAddressDropdown'] = this.dummySources.find(x => x.wareHouseIDName == element.sourceWareHouseInfo.wareHouseIDName).shipFromAddresses;
                  // element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null);

                }
                else {
                  element.sourceWareHouseInfo = this.whTransferForm.controls.sourceWareHouseInfo.value;
                  if (element.sourceWareHouseInfo) {
                    // element['shipFromAddressDropdown'] = this.dummySources.find(x => x.wareHouseIDName == element.sourceWareHouseInfo.wareHouseIDName).shipFromAddresses;
                    // element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null);
                  }
                }
              }
              else {
                if (element.sourceWareHouseInfo.wareHouseIDName) {
                  // element['shipFromAddressDropdown'] = this.dummySources.find(x => x.wareHouseIDName == element.sourceWareHouseInfo.wareHouseIDName).shipFromAddresses;
                  // element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null);
                }
              }
            });
          }
          this.dtTrigger.next()
        }
        else {
          this.transferLines = [];

        }
      })
    }
    else {
      this.wmsService.getWarehouseTransferLines(final).subscribe(res => {
        if (res['status'] == 0 && res['data'].wareHouseTransferPaginationResponse.wareHouseTransferLines) {
          this.transferLines = res['data'].wareHouseTransferPaginationResponse.wareHouseTransferLines;
          this.createTotalItems = res['data'].wareHouseTransferPaginationResponse.totalElements
          this.shipTOAddressDropdown = this.dummySources.find(x => x.wareHouseIDName == this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseIDName).shipToAddresses;
          const shiTo = this.shipTOAddressDropdown.find(x => x.defaultAddress);
          if (!this.whTransferForm.controls.shipToAddress.value) {
            this.whTransferForm.controls.shipToAddress.setValue(shiTo);
          }
          this.overAllShipTo = this.whTransferForm.controls.shipToAddress.value.name;

          this.billTOAddressDropdown = this.dummySources.find(x => x.wareHouseIDName == this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseIDName).billToAddresses;
          const bilTo = this.billTOAddressDropdown.find(x => x.defaultAddress);
          if (!this.whTransferForm.controls.billToAddress.value) {
            this.whTransferForm.controls.billToAddress.setValue(bilTo);
          }
          this.overAllBillTo = this.whTransferForm.controls.billToAddress.value.name;

          if (this.transferLines.length) {
            this.transferLines.forEach(element => {
              element.shipToAddress = this.whTransferForm.controls.shipToAddress.value;
              element.billToAddress = this.whTransferForm.controls.billToAddress.value;
              if (!element.sourceWareHouseInfo || !element.sourceWareHouseInfo.wareHouseIDName) {
                if (element.sourceWareHouseInfos) {
                  element.sourceWareHouseInfo = element.sourceWareHouseInfos[0];
                  const sID1 = this.sourceWareHouses.find(x => x._id == element.sourceWareHouseInfos[0].wareHouseMasterID);
                  element.sourceOrganizationInfo = sID1.organizationInfo;
                  // element['shipFromAddressDropdown'] = sID1.shipFromAddresses;
                  // element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null);

                }
                else {
                  element.sourceWareHouseInfo = this.whTransferForm.controls.sourceWareHouseInfo.value;
                  const sID2 = this.dummySources.find(x => x._id == this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseMasterID);
                  if (sID2) {
                    element.sourceOrganizationInfo = sID2.organizationInfo;
                    // element['shipFromAddressDropdown'] = sID2.shipFromAddresses;
                    // element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null);
                  }
                }
              }
              else {
                const soID = this.dummySources.find(x => x.wareHouseIDName == element.sourceWareHouseInfo.wareHouseIDName);
                element.sourceOrganizationInfo = soID.organizationInfo;
                // element['shipFromAddressDropdown'] = soID.shipFromAddresses;

                // element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null) : null);
              }
            });
            if (this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName) {
              this.wmsService.fetchAllWarehouses({ "wareHouseIDName": this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName }).subscribe(res => {
                if (res['status'] == 0 && res.data.wareHouses) {
                  this.transferLines.forEach(element => {
                    if (!element.sourceWareHouseInfo || !element.sourceWareHouseInfo.wareHouseIDName) {
                    }
                    else {
                      element.sourceOrganizationInfo = res.data.wareHouses[0].organizationInfo;
                      // const objAddre = this.dummySources.find(x => x.wareHouseIDName == element.sourceWareHouseInfo.sourceWareHouseIDName);
                      // element['shipFromAddressDropdown'] = objAddre.shipFromAddresses;
                      // element.shipFromAddress = element.shipFromAddress ? element.shipFromAddress : (element['shipFromAddressDropdown'] ? element['shipFromAddressDropdown'].find(x => x.defaultAddress) : null);
                    }
                  })
                }
              });
            }
          }
          this.dtTrigger.next();
        }
        else {
          this.transferLines = [];
        }
      })
    }
  }
  setshipFrominTable(event, i, data) {
    const obj1 = this.dummySources.find(x => x.wareHouseIDName == data.sourceWareHouseInfo.wareHouseIDName);
    this.wmsService.fetchAllWarehouses({ "wareHouseIDName": obj1.wareHouseIDName, "organizationIDName": obj1.organizationInfo.organizationIDName }).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          const obj = response.data.wareHouses[0]['shipFromAddresses'].find(x => x.name == event.target.value);
          if (obj) {
            this.transferLines.forEach((ele, index) => {
              if (ele.sourceWareHouseInfo.wareHouseIDName == data.sourceWareHouseInfo.wareHouseIDName) {
                ele.shipFromAddress = obj;
                this.transferLines[i]['shipFromAddressDropdown'] = response.data.wareHouses[0].shipFromAddresses;
                this.transferLines[index]['shipFromAddressDropdown'] = response.data.wareHouses[0].shipFromAddresses;
              }
            });
            data.shipFromAddress = obj;
            this.transferLines[i].shipFromAddress = obj ? obj : null;
          }
        }
      })
  }
  calculateReceivedQty(line, i) {
    const filteredProduct = this.products.find(product => product.productIDName === line.productMasterInfo.productIDName);
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
      const formValue = this.whTransferForm.value;
      formValue['wareHouseTransferLines'] = [line];
      delete formValue.subcatgory1;
      delete formValue.subcatgory2;
      delete formValue.subcatgory3;
      delete formValue.productCategoryGroupDetail;
      formValue.destinationOrganizationInfo = this.configService.getOrganization();
      if (this.sourceFormObj['wareHouseIDName']) {
        this.wmsService.fetchAllWarehouses({ "wareHouseIDName": this.sourceFormObj['wareHouseIDName'] }).subscribe(res => {
          if (res['status'] == 0 && res.data.wareHouses) {
            formValue.sourceOrganizationInfo = res.data.wareHouses[0].organizationInfo;
            this.whTransferForm.controls.sourceOrganizationInfo.patchValue(res.data.wareHouses[0].organizationInfo);
            this.transferPrice(formValue, line, CF, i);
          }
        })
      }
      else {
        this.transferPrice(formValue, line, CF, i);
      }
    }
  }

  transferPrice(formValue, line, CF, i) {
    if (formValue.sourceWareHouseInfo && !formValue.sourceWareHouseInfo.wareHouseIDName) {
      formValue.sourceWareHouseInfo = null;
    }
    if (line.sourceWareHouseInfo && line.sourceWareHouseInfo.wareHouseIDName) {
      this.wmsService.fetchAllWarehouses({ "wareHouseIDName": line.sourceWareHouseInfo['wareHouseIDName'] }).subscribe(res => {
        if (res['status'] == 0 && res.data.wareHouses) {
          line.sourceOrganizationInfo = res.data.wareHouses[0].organizationInfo;
          this.transferLines[i].sourceOrganizationInfo = res.data.wareHouses[0].organizationInfo;
          formValue.wareHouseTransferLines[0].sourceOrganizationInfo = res.data.wareHouses[0].organizationInfo;
          this.transferPriceContinution(formValue, line, CF, i);
        }
      })
    }
    else {
      formValue.wareHouseTransferLines[0].sourceOrganizationInfo = null;
      formValue.wareHouseTransferLines[0].sourceWareHouseInfo = null;
      this.transferPriceContinution(formValue, line, CF, i);
    }
  }
  transferPriceContinution(formValue, line, CF, i) {
    this.wmsService.fetchProductTransferSalePrice(formValue).subscribe(data => {
      if (data.status == 0 && data.data.wareHouseTransferPricingResponse) {
        line.unitPrice = data.data.wareHouseTransferPricingResponse.unitPrice;
        this.transferLines[i].unitPrice = data.data.wareHouseTransferPricingResponse.unitPrice
        this.priceFromBE = data.data.wareHouseTransferPricingResponse.unitPrice;
        if (CF) {
          line['orderUnitPrice'] = DecimalUtils.multiply(this.priceFromBE, CF);
          this.transferLines[i].orderUnitPrice = DecimalUtils.multiply(this.priceFromBE, CF);
        } else {
          this.toastr.error('No matching Unit Conversion Factor');
          line['orderUnitPrice'] = null;
          this.transferLines[i].orderUnitPrice = null;
        }
      }
      else {
        this.wareHouseTransferLine.controls.unitPrice.setValue(null);
      }
    })
  }
  navigate() {
    const form = this.whTransferForm.value;
    const selectedLines = this.transferLines.filter(x => x.select);
    if (this.idForUpdate) {
      form['wareHouseTransferLines'] = [...selectedLines, ...this.basicLines];
    }
    else {
      form['wareHouseTransferLines'] = selectedLines;
    }
    this.wmsService.getWarehouseTransferPriceMulti(form).subscribe(res => {
      // console.log(res);
    })
    this.appService.navigate('/maintainWarehouseTransfer', { id: this.saveDraftResponse._id });
  }
  pageIndirectSave(){
    const selectedLines = this.transferLines.filter(x => x.select);
    if (selectedLines.length > 0) {
      this.save();
    }
  }
  save() {
    const selectedLines = this.transferLines.filter(x => x.select);
    if (selectedLines.length > 0) {
      const findValue = selectedLines.find(x => !x.customerOrderQuantity || (x.customerOrderQuantity == 0) || !x.sourceWareHouseInfo || (x.sourceWareHouseInfo && !x.sourceWareHouseInfo.wareHouseIDName) || !x.shipFromAddress);
      let proceed = findValue ? false : true;
      if (proceed) {
        const jsonData = this.whTransferForm.value;
        jsonData['wareHouseTransferLines'] = selectedLines;
        jsonData.wareHouseTransferLines.forEach(element => {
          if (element.brandName == "null") {
            element.brandName = null;
          }
          if (!element.sourceWareHouseInfo || !element.sourceWareHouseInfo.wareHouseIDName) {
            element.sourceWareHouseInfo = null;
            element.organizationInfo = null;
          }
        });
        if (this.idForUpdate) {
          if (!jsonData.sourceWareHouseInfo || !jsonData.sourceWareHouseInfo.wareHouseIDName) {
            jsonData.sourceWareHouseInfo = null;
          }
          this.wmsService.updateDraft(jsonData).subscribe(res => {
            // if (res['status'] == 0 && res.data.WareHouseTransfer) {
            this.toastr.success("Added to Cart Successfully");
            // this.saveDraftResponse = res.data.WareHouseTransfer;
            // }
          })
        }
        else {
          jsonData.destinationOrganizationInfo = this.configService.getOrganization();
          if (this.sourceFormObj['wareHouseIDName']) {
            this.wmsService.fetchAllWarehouses({ "wareHouseIDName": this.sourceFormObj['wareHouseIDName'] }).subscribe(res => {
              if (res['status'] == 0 && res.data.wareHouses) {
                if (jsonData.sourceWareHouseInfo && jsonData.sourceWareHouseInfo.wareHouseIDName) {
                  jsonData.sourceOrganizationInfo = res.data.wareHouses[0].organizationInfo;
                  this.whTransferForm.controls.sourceOrganizationInfo.patchValue(res.data.wareHouses[0].organizationInfo);
                }
                else {
                  jsonData.sourceOrganizationInfo = null;
                  this.whTransferForm.controls.sourceOrganizationInfo.patchValue(null);
                  jsonData.sourceWareHouseInfo = null;
                }
                this.saveContinution(jsonData);
              }
            })
          }
          else {
            jsonData.sourceOrganizationInfo = null;
            this.whTransferForm.controls.sourceOrganizationInfo.patchValue(null);
            jsonData.sourceWareHouseInfo = null;
            this.saveContinution(jsonData);
          }

        }
      }
      else {
        this.toastr.error("Enter Quantity for selected Lines.")
      }
    }
    else {
      this.toastr.error("Select Lines to Add")
    }
  }
  saveContinution(jsonData) {
    this.wmsService.saveDraftWarehouseTransfer(jsonData).subscribe(res => {
      if (res['status'] == 0 && res.data.wareHouseTransfer) {
        this.toastr.success("Added to Cart Successfully");
        this.saveDraftResponse = res.data.wareHouseTransfer;
        this.idForUpdate = res.data.wareHouseTransfer._id;
        this.editbyId(this.idForUpdate, this.createPage);
      }
    })
  }
  getPrice() {
    const jsonData = this.whTransferForm.value;
    jsonData['wareHouseTransferLines'] = this.transferLines.filter(x => x.select);
    this.wmsService.getWarehouseTransferPriceMulti(jsonData).subscribe(res => {
      console.log(res);
    })
  }
  setSelect(event, data, i) {
    if (this.transferLines[i].customerOrderQuantity && this.transferLines[i].shipmentUnit) {
      data['select'] = event.target.checked;
    }
    else {
      event.target.checked = false;
      data['select'] = false;
    }
  }
  ngAfterViewInit(): void {
    // this.dtTrigger.next();
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
  openModalPopUp() {
    this.ngxSmartModalService.getModal('createWarehouseT').open();
  }
  changeWareHouse(event) {
    // this.rerender();
    this.framingSourceObj(event);

  }
  // catalog code
  createCatelogForm() {
    this.wareHouseCatalogTransferLine = this.fb.group(
      {
        "productIDName": null,
        "brandName": null,
        "productCategoryName": null,
        productCategoryGroupDetail: this.fb.group({
          "_id": null,
          "productCategoryName": null,
          "hierarchyLevel": 0,
          childProductSubCategories: null,
        }),
        subcatgory1: null,
        subcatgory2: null,
        subcatgory3: null
      })
  }
  getCatalogLines() {
    //this.saveDataframing()
    const final = {
      "destinationWareHouseIDName": this.globalFormObj.wareHouseIDName,
      "sourceWareHouseIDName": this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName,
      "productIDName": this.wareHouseTransferLine.controls.productMasterInfo.value.productIDName,
      "productCategoryName": this.wareHouseTransferLine.controls.productCategoryInfo.value.productCategoryName,
      "organizationIDName": this.destinationFormObj.organizationIDName,
      "wareHouseIDName": this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName,
      "wareHouseTransferID": this.idForUpdate ? this.idForUpdate : null,
      "productCategoryGroupDetail": this.whTransferForm.controls.productCategoryGroupDetail.value,
      "brandName": this.wareHouseTransferLine.controls.brandName.value,
      "linesSourceWareHouseIDNameChange": false,
      page: this.createPage,
      pageSize: this.itemsPerPageCreate
    }
    if (this.idForUpdate) {
      this.wmsService.getNewWarehouseTransferLines(final).subscribe(res => {
        if (res['status'] == 0 && res['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.wareHouseTransferLines) {
          this.transferLines = res['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.wareHouseTransferLines;
          this.createTotalItems = res['data'].wareHouseTransferPaginationResponse.totalElements
          this.dtTrigger.next();
        }
        else {
          this.transferLines = [];

        }
      })
    }
    else {
      this.wmsService.getWarehouseTransferLines(final).subscribe(res => {
        if (res['status'] == 0 && res['data'].wareHouseTransferPaginationResponse.wareHouseTransferLines) {
          this.transferLines = res['data'].wareHouseTransferPaginationResponse.wareHouseTransferLines;
          this.createTotalItems = res['data'].wareHouseTransferPaginationResponse.totalElements
          this.dtTrigger.next();
        }
        else {
          this.transferLines = [];
        }
      })
    }
  }
  onCatelogProductIDNameChange(event) {
    if (event) {
      this.getCatalogLines()
    }
  }
  getcatelogSubData1Details(event) {
    const form = this.whTransferForm.value
    this.detailsData = this.productCategoryGroupsResponseList.filter(k => k.productCategoryName === event)
    this.whTransferForm.controls.productCategoryGroupDetail.patchValue(this.detailsData[0])
    this.productCategoryGroupsResponseList.filter(k => {
      if (k.productCategoryName == event) {
        this.SubCatogrys1 = k.childProductSubCategories
      }
    })
  }

}
