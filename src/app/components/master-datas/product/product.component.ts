import { Component, OnInit, ViewChild, OnDestroy, EventEmitter, Output, AfterViewInit, } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { Util } from 'src/app/shared/utils/util';
import { ApexService } from '../../../shared/services/apex.service';
import { AppService } from '../../../shared/services/app.service';
import { Constants } from '../../../constants/constants';
import { MetaDataService } from '../../../services/integration-services/metadata.service';
import { WMSService } from '../../../services/integration-services/wms.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { WmsCommonService } from '../../../services/wms-common.service';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { DatePipe } from '@angular/common';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { CommonService } from 'src/app/shared/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',

})
export class ProductComponent implements OnInit, OnDestroy, AfterViewInit {
  product: any;
  showTooltip = false;
  productForm: FormGroup;
  id: any = '';
  focusedElement: any;
  isReloadCustTable: any = false;
  countries: any = [];
  mergeTypes: any = Constants.MERGE_TYPE;
  productMerge: any = Constants.PRODUCT_MERGE

  customerTypes: any = Constants.CUSTOMER_TYPES;
  pickDirection: any = Constants.pick_Direction;
  currencies: any = [];
  brandConfigurationsResponceList: any = [];
  productCategories: any = [];
  units: any = [];
  palletSizes: any = [];
  taxTypes: any = Constants.TAX_TYPES;
  serviceTypes: any = Constants.SERVICE_TYPES;
  productTypes: any = Constants.PRODUCT_TYPES;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  products: any[] = [];
  statuss: any = ['Active', 'InActive'];
  @Output() sendCustomer: any = new EventEmitter<any>();
  termsOfPayments: any = [];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isReadMode: any = false;

  deleteInfo: any;
  missingParams: any;
  isShowOrHideError: any = false;
  failureRecords: any[] = [];
  pickingTypes: any;
  packingTypeList: any;
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Product', Storage.getSessionUser());
  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;
  imageHidden: boolean = false;
  imageID: any;
  showImage: boolean = true;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  dummyHsnCode: any = null;
  tableHeadings: any = ['S.No','Image', 'Product ID', 'Product Name', 'Product Description',
    'Product Configuration', 'DFS Code', 'Type', 'HSN Code', 'UPC EAN Number', 'Product Type', 'Product Class', 'Category',
    'Category 1', 'Category 2', 'Category 3',
    'Product ID/Name', 'Inventory Unit', 'Receiving Unit', 'Picking Unit', 'Shipment Unit',
    'Length', 'Breadth', 'Height', 'Volume', 'Weight',
    'Max Dimension', 'Pallet Quantity', 'Pallet Size', 'Currency', 'Brand Configure', 'Price', 'Avg Cost Price',
    'Avg Sales Price', 'MRP', 'Product Merge', 'Expiry Flag', 'Merge Type', 'Lead Time', 'MOQ', 'Picking Direction', 'Packing Type', 'Location',
    'Reorder Point', 'Quality Check', 'Created On', 'Shelf Life', 'Pricing Method', 'Purchase Tax', 'Sales Tax', 'Source Warehouse', 'Block Inventory', 'Markup',
    'Markup Type', 'Status', 'Action'];
  overAllJSON: any = {
    "_id": null,
    "screenName": "Product Master",
    "manditoryfields": [
      {
        "backendFieldName": "productID",
        "frontendFieldName": "Product ID"
      }
    ],
    "hidefields": [
      {
        "backendFieldName": "productID",
        "frontendFieldName": "Product ID"
      }
    ],
    "renameFields": [
      {
        "backendFieldName": "productID",
        "frontendFieldName": "Product ID"
      }
    ],
    "allFields": [
      {
        "backendFieldName": "productID",
        "frontendFieldName": "Product ID"
      }
    ],
    "organizationInfo": {
      "_id": "637dad114ae32f73bedcd112",
      "organizationID": "ORG1",
      "organizationName": "Hyderabad",
      "organizationIDName": "ORG1:Hyderabad"
    },
    "wareHouseInfo": {
      "wareHouseMasterID": "637db2784ae32f73bedcd11a",
      "wareHouseID": "Utl",
      "wareHouseName": "Logicstics",
      "wareHouseIDName": "Utl:Logicstics"
    }
  }
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
  getHSNCodes: any = [];
  purchaseTaxes: any = [];
  saleTaxes: any = [];
  purchaseTaxArray: any = [];
  brandConfigurations: any = []
  purchaseTaxs: any;
  brandNamesObj: any;
  brandNames: any;
  salestaxs: any;
  salesTaxArray: any = []
  uploadPurchaseTax: any = []
  uploadSalesTax: any = [];
  productCategoryGroupsResponseList: any = []
  arrList: any[];
  parent: any = [];
  childs: any = [];
  nodes: any = []
  value: any = []
  subChild: any = []
  selectedData: any = null;
  treeSelectValue: any = [];
  firstArr: any = []
  firstObject: any;
  secondArr: any = []
  secondObj: any;
  thirdArr: any = []
  finalArr: any = []
  detailsData: any = []
  SubCatogrys1: any = []
  SubCatogrys2: any = []
  SubCatogrys3: any = []
  isSub2Disable: boolean = false
  isSub3Disable: boolean = false
  categoryList: any = []
  categoryList2: any = []
  categoryList3: any = []
  firstarr: any = [];
  dumArr: any = [];
  thirdarr: any = [];
  list3: any = [];
  list2: any = [];
  list1: any = [];
  sourceWareHousesDropdownData: any = [];
  sourceWareHouses: any = [];
  wareHouseselected: any = [];
  page: number = 1;
  itemsPerPage = 5;
  totalItems: any = null;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  exportData: any = [];
  dataPerPage: number;
  loopToStop: any = null;
  locationDimensionCheck: any = 'No';

  constructor(
    private apexService: ApexService,
    public ngxSmartModalService: NgxSmartModalService,
    private excelService: ExcelService,
    private wmsService: WMSService,
    private metaDataService: MetaDataService,
    private wmsCommonService: WmsCommonService,
    private appService: AppService, private fb: FormBuilder,
    private util: Util, private configService: ConfigurationService,
    private excelRestService: ExcelRestService,
    private toastr: ToastrService, private datepipe: DatePipe, private commonSerice: CommonService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  deleteandscrollcolor = this.configService.getThemeContent('Delete And Scroll Color');
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        lengthMenu: 'Show _MENU_ Entries',
      }
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
       if (data) {
         this.formObj = this.configService.getGlobalpayload();
         this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Product', Storage.getSessionUser());
         this.getFunctionsCall();
       }
     }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.apexService.getPanelIconsToggle();
      this.createProductForm();
      const manditoryFields = this.overAllJSON.manditoryfields.map(x => x.backendFieldName);
      if (manditoryFields.length > 0) {
        manditoryFields.forEach(element => {
          this.productForm.get(element).setValidators(Validators.required);
        });
      }
      this.fetchAllBrandConfigurations();
      this.fetchProductDetailsByID();
      this.getAllCurrencies();
      this.fetchAllProductCategories();
      this.fetchAllProducts(1, this.itemsPerPage);
      this.findAllUnits();
      this.findAllPalletSizes();
      this.fetchAllPickingType();
      this.findAllTaxes();
      this.fetchAllProductCategoryGroupsDetails();
      this.getAllWarehouses();
      this.fetchAllPDbyLocationsConfigurations();
      this.productForm.patchValue({ creationDate: this.wmsCommonService.getDateFromMilliSec(new Date()) });
    }
  }
  fetchAllPDbyLocationsConfigurations() {
    this.metaDataService.findAllPDLocationConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.productDimensionsByLocationConfigurations && res.data.productDimensionsByLocationConfigurations.length > 0) {
        this.locationDimensionCheck = res.data.productDimensionsByLocationConfigurations[0].calculateDimensions;
      }
    })
  }
  filterData: any;
  findAllTaxes() {
    this.wmsService.fetchTaxes(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].taxMasters) {
        this.taxData = res['data'].taxMasters;
        const getHSNCodes = [...new Set(res['data'].taxMasters.map(x => x.hsnCode))];
        this.getHSNCodes = getHSNCodes.filter(x => x != null)
        this.taxIDs = [...new Set(this.taxData.map(x => x.taxNamePercentage))];
        this.filterData = this.taxIDs.filter(x => x != null)
        this.taxIDs = this.filterData;
      }
      else {
        this.getHSNCodes = [];
        this.taxData = [];
        this.taxIDs = this.taxData;
      }
    })
  }
  getAllWarehouses() {
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.sourceWareHouses = response.data.wareHouses;
          const abc: any = response.data.wareHouses;
          this.sourceWareHousesDropdownData = (abc.filter(x => x.wareHouseIDName != this.formObj.wareHouseIDName)).map(x => x.wareHouseIDName);

        }
      })
  }
  setHsnCode(event) {
    if (event) {
      if (event != 'yes') {
        this.productForm.controls.hsnCode.setValue(event.originalObject);
        this.dummyHsnCode = null;
      }
      this.getTaxDropdown(this.productForm.controls.hsnCode.value);
    }
  }
  getTaxDropdown(event) {
    if (event && event != "null") {
      const filteredHSNTaxes = this.taxData.filter(x => x.hsnCode == event);
      this.taxIDs = [...new Set(filteredHSNTaxes.map(x => x.taxNamePercentage))];
      this.filterData = this.taxIDs.filter(x => x != null)
      this.taxIDs = this.filterData;
    }
    else {
      this.taxIDs = [...new Set(this.taxData.map(x => x.taxNamePercentage))];
      this.filterData = this.taxIDs.filter(x => x != null)
      this.taxIDs = this.filterData;
      this.saleTaxes = [];
      this.purchaseTaxes = [];
    }
  }
  fetchAllProductCategoryGroupsDetails() {
    this.wmsService.fetchAllProductCategoryGroups(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategoryGroups && response.data.productCategoryGroups) {
          this.productCategoryGroupsResponseList = response.data.productCategoryGroups
        }
      })
  }
  getSubData1Details(event) {
    const form = this.productForm.value
    this.detailsData = this.productCategoryGroupsResponseList.filter(k => k.productCategoryName === event)
    if (this.detailsData[0]) {
      let obj = {
        "_id": null,
        "productCategoryName": form.productCategoryInfo.productCategoryName,
        "hierarchyLevel": 0,
        childProductSubCategories: null
      }
      this.productForm.controls.productCategoryGroupDetail.patchValue(obj)
      this.productCategoryGroupsResponseList.filter(k => {
        if (k.productCategoryName == event) {
          if (k.childProductSubCategories && k.childProductSubCategories.length > 0) {
            this.SubCatogrys1 = k.childProductSubCategories
            console.log(this.SubCatogrys1)
            this.categoryList = this.SubCatogrys1.map(k => k.productSubCategoryName)
          }
        }
      })
    } else {
      this.productForm.controls.productCategoryGroupDetail.patchValue(null)
    }
  }
  OnsubcatgoryChange() {
    const form = this.productForm.value
    if (form.subcatgory1 && form.subcatgory1.length < 2) {
      let dummyArr: any
      this.SubCatogrys1.filter(k => {
        if (k.productSubCategoryName == form.subcatgory1[0]) {
          dummyArr = k
          if (k.childProductSubCategories && k.childProductSubCategories.length > 0) {
            this.SubCatogrys2 = k.childProductSubCategories
            this.categoryList2 = this.SubCatogrys2.map(k => k.productSubCategoryName)
          }
        }
      })
      if (dummyArr) {
        dummyArr.childProductSubCategories = null
        delete dummyArr._id
        let arr: any = []
        arr.push(dummyArr)
        let obj = {
          "_id": null,
          "productCategoryName": form.productCategoryInfo.productCategoryName,
          "hierarchyLevel": 0,
          childProductSubCategories: arr,
        }
        this.productForm.controls.productCategoryGroupDetail.setValue(obj)
      }
    } else {
      let arr: any = []
      if (form.subcatgory1 && form.subcatgory1.length > 0) {
        form.subcatgory1.forEach(m => {
          let dummyArr: any
          this.SubCatogrys1.filter(k => {
            if (k.productSubCategoryName == m) {
              dummyArr = k
            }
          })
          dummyArr.childProductSubCategories = null
          delete dummyArr._id
          arr.push(dummyArr)
        })
        let obj = {
          "_id": null,
          "productCategoryName": form.productCategoryInfo.productCategoryName,
          "hierarchyLevel": 0,
          childProductSubCategories: arr,
        }
        this.productForm.controls.productCategoryGroupDetail.setValue(obj)
      }
    }
  }
  Onsub2catgoryChange() {
    const form = this.productForm.value
    if (form.subcatgory2 && form.subcatgory2.length < 2) {
      let dubliArr: any = null;
      this.SubCatogrys2.filter(k => {
        if (k.productSubCategoryName == form.subcatgory2[0]) {
          dubliArr = k
          if (k.childProductSubCategories && k.childProductSubCategories.length > 0) {
            this.SubCatogrys3 = k.childProductSubCategories
            this.categoryList3 = this.SubCatogrys3.map(k => k.productSubCategoryName)
          }
        }
      })
      let arr: any = []
      if (dubliArr) {
        dubliArr.childProductSubCategories = null
        delete dubliArr._id
        arr.push(dubliArr)
      }
      form.productCategoryGroupDetail.childProductSubCategories.forEach(ele => {
        ele.childProductSubCategories = arr
      })
    } else {
      let arr: any = []
      if (form.subcatgory2 && form.subcatgory2.length > 0) {
        form.subcatgory2.forEach(m => {
          let dummyArr: any
          this.SubCatogrys2.filter(k => {
            if (k.productSubCategoryName == m) {
              dummyArr = k
            }
          })
          dummyArr.childProductSubCategories = null
          delete dummyArr._id
          arr.push(dummyArr)
        })
        form.productCategoryGroupDetail.childProductSubCategories.forEach(ele => {
          ele.childProductSubCategories = arr
        })
      }
    }
  }
  changeUpToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  changeDownToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  Onsub3catgoryChange() {
    const form = this.productForm.value
    if (form.subcatgory3 && form.subcatgory3.length < 2) {
      let duArr: any = null;
      this.SubCatogrys3.filter(k => {
        if (k.productSubCategoryName == form.subcatgory3[0]) {
          duArr = k
        }
      })
      let arr: any = []
      if (duArr) {
        duArr.childProductSubCategories = null
        delete duArr._id
        arr.push(duArr)
      }
      form.productCategoryGroupDetail.childProductSubCategories.forEach(ele => {
        ele.childProductSubCategories.forEach(el => {
          el.childProductSubCategories = arr
        })
      })
    } else {
      let arr: any = []
      if (form.subcatgory3 && form.subcatgory3.length > 0) {
        form.subcatgory3.forEach(m => {
          let dummyArr: any
          this.SubCatogrys3.filter(k => {
            if (k.productSubCategoryName == m) {
              dummyArr = k
            }
          })
          if (dummyArr) {
            dummyArr.childProductSubCategories = null
            delete dummyArr._id
            arr.push(dummyArr);
          }
        })
        form.productCategoryGroupDetail.childProductSubCategories.forEach(ele => {
          ele.childProductSubCategories.forEach(el => {
            el.childProductSubCategories = arr
          })
        })
      }
      console.log(form)
    }
  }
  getSub2DropdownDisable() {
    const form = this.productForm.value
    if (form.dummySub1 != null && form.dummySub1.length > 1) {
      this.isSub2Disable = true
      this.isSub3Disable = true
      //this.productForm.controls.dummySub2.setValue(null)
      //this.productForm.controls.dummySub3.setValue(null)
    } else {
      this.isSub2Disable = false
      this.isSub3Disable = false
    }
  }
  getSub3DropdownDisable() {
    const data = this.productForm.value
    if (data.dummySub2 != null && data.dummySub2.length > 1) {
      this.isSub3Disable = true
      //  this.productForm.controls.dummySub3.setValue(null)
    } else {
      this.isSub3Disable = false
    }
  }
  getProductCategoryDetails() {
    const form = this.productForm.value
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
                      // delete sub2.hierarchyLevel
                      // delete sub2.productSubCategoryName
                      // delete sub2.childProductSubCategories
                    })
                  }
                } else {
                  sub1.children = null
                }
                // delete sub1.hierarchyLevel
                // delete sub1.productSubCategoryName
                // delete sub1.childProductSubCategories
              })
            }

          } else {
            el.children = null
          }
          // delete el.hierarchyLevel
          // delete el.productSubCategoryName
          // delete el.childProductSubCategories
        })
        // console.log(this.parent)
        this.nodes = this.parent


        // data.childProductSubCategories.forEach(ele => {
        //   this.childs = []
        //   if (ele.childProductSubCategories != null) {
        //     ele.childProductSubCategories.forEach(s => {
        //       this.subChild = []
        //       if (s.childProductSubCategories != null) {
        //         s.childProductSubCategories.forEach(m => {
        //           let subJrchil = {}
        //           subJrchil['title'] = m.productSubCategoryName
        //           subJrchil['key'] = m.productSubCategoryName
        //           subJrchil['isLeaf'] = true
        //           this.subChild.push(subJrchil)
        //         })
        //       }
        //       let subchil = {}
        //       subchil['title'] = s.productSubCategoryName
        //       subchil['key'] = s.productSubCategoryName
        //       subchil['children'] = this.subChild
        //       subchil['isLeaf'] = true
        //       this.childs.push(subchil)
        //     })
        //   }
        //   let chil = {}
        //   chil['title'] = ele.productSubCategoryName
        //   chil['key'] = ele.productSubCategoryName
        //   chil['children'] = this.childs
        //   this.parent.push(chil)
        // })

      }
      // this.nodes = this.parent
      // console.log(this.nodes)
    }
  }
  onChange(event) {
    this.treeSelectValue = []
    this.treeSelectValue = event
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
      this.productForm.controls.productCategoryGroupDetail.patchValue(objcets)
      console.log(objcets)
    }
  }
  fetchAllPickingType() {
    this.metaDataService.fetchAllPickingType(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.packingTypes && response.data.packingTypes.length) {
          this.packingTypeList = response.data.packingTypes;
        }
      },
      error => {
        this.packingTypeList = [];
      });
  }
  getTaxJson(taxNamePercentage) {
    const filteredtax = this.taxData.find(x => x.taxNamePercentage == taxNamePercentage);
    return {
      _id: filteredtax._id,
      taxName: filteredtax.taxName,
      taxPercentage: filteredtax.taxPercentage,
      taxNamePercentage: filteredtax.taxNamePercentage
    }
  }
  getWarehouseJson(wIDName) {
    const filteredWH = this.sourceWareHouses.find(x => x.wareHouseIDName == wIDName);
    return {
      wareHouseMasterID: filteredWH._id,
      wareHouseID: filteredWH.wareHouseID,
      wareHouseName: filteredWH.wareHouseName,
      wareHouseIDName: filteredWH.wareHouseIDName
    }
  }
  /*  if(this.permissionsList.includes("Update")){
     this.supplier = this.supplierForm.value;
     this.supplier.poExpiryDate = this.supplier.poExpiryDate ? new Date(this.supplier.poExpiryDate) : null;
     if (!this.id) {
       this.supplier['organizationInfo'] = this.configService.getOrganization();
       this.supplier['wareHouseInfo'] = this.configService.getWarehouse();
     }
     const finalSupplierMasterData = Object.assign({}, this.supplier);
     if (this.id) { finalSupplierMasterData._id = this.id; } */

  palletSizeValue: any;
  lettersRemove(val) {
    const form = this.productForm.value
    if (val == 'purchasePrice') {
      let a: any = DecimalUtils.valueOf(form.purchasePrice)
      if (!isNaN(a)) {
        form.purchasePrice = DecimalUtils.valueOf(form.purchasePrice)
      } else {
        this.productForm.controls.purchasePrice.setValue('')
      }
    } else if (val === 'length') {
      let a: any = DecimalUtils.valueOf(form.length)
      if (!isNaN(a)) {
        form.length = DecimalUtils.valueOf(form.length)
      } else {
        this.productForm.controls.length.setValue(null)
      }
    } else if (val === 'breadth') {
      let a: any = DecimalUtils.valueOf(form.breadth)
      if (!isNaN(a)) {
        form.breadth = DecimalUtils.valueOf(form.breadth)
      } else {
        this.productForm.controls.breadth.setValue(null)
      }
    } else if (val === 'height') {
      let a: any = DecimalUtils.valueOf(form.height)
      if (!isNaN(a)) {
        form.height = DecimalUtils.valueOf(form.height)
      } else {
        this.productForm.controls.height.setValue(null)
      }
    } else if (val === 'weight') {
      let a: any = DecimalUtils.valueOf(form.weight)
      if (!isNaN(a)) {
        form.weight = DecimalUtils.valueOf(form.weight)
      } else {
        this.productForm.controls.weight.setValue(null)
      }
    } else if (val === 'volume') {
      let a: any = DecimalUtils.valueOf(form.volume)
      if (!isNaN(a)) {
        form.volume = DecimalUtils.valueOf(form.volume)
      } else {
        this.productForm.controls.volume.setValue(null)
      }
    } else if (val === 'maxDimension') {
      let a: any = DecimalUtils.valueOf(form.maxDimension)
      if (!isNaN(a)) {
        form.maxDimension = DecimalUtils.valueOf(form.maxDimension)
      } else {
        this.productForm.controls.maxDimension.setValue(null)
      }
    }
  }
  save() {
    // this.saveDataframing()
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      this.product = this.productForm.value;
      this.product.locationWeightUom = this.product.weightUom;
      this.product.locationTotalSpaceUom = this.product.volumeUom;
      if (this.product.invoiceType != 'GRN') {
        this.product.invoiceType = null;
      }
      delete this.product.subcatgory1
      delete this.product.subcatgory2
      delete this.product.subcatgory3
      if (this.purchaseTaxes.length > 0) {
        this.product.purchaseTaxes = [];
        this.purchaseTaxes.forEach(element => {
          this.product.purchaseTaxes.push(this.getTaxJson(element));
        });
      }
      else if (this.purchaseTaxes.length == 0) {
        this.product.purchaseTaxes = [];
      }
      if (this.saleTaxes.length > 0) {
        this.product.saleTaxes = [];
        this.saleTaxes.forEach(element => {
          this.product.saleTaxes.push(this.getTaxJson(element));
        });
      }
      else if (this.saleTaxes.length == 0) {
        this.product.saleTaxes = [];
      }
      if (this.wareHouseselected && this.wareHouseselected.length) {
        this.product.sourceWareHouseInfos = [];
        this.wareHouseselected.forEach(wh => {
          this.product.sourceWareHouseInfos.push(this.getWarehouseJson(wh))
        });
      }
      else {
        this.product.sourceWareHouseInfos = null;
      }
      this.product.creationDate = this.product.creationDate ? new Date(this.product.creationDate) : null;
      if (!this.id) {
        this.product['organizationInfo'] = this.configService.getOrganization();
        this.product['wareHouseInfo'] = this.configService.getWarehouse();
      }
      const finalProductMasterData = Object.assign({}, this.product);
      if (this.product.
        organizationInfo && this.product.wareHouseInfo && this.product.organizationInfo.organizationIDName && this.product.wareHouseInfo.wareHouseIDName) {
        if (this.id) { finalProductMasterData._id = this.id; }
        const filteredCategory = this.productCategories.find(pc => pc.productCategoryName === this.product.productCategoryInfo.productCategoryName);
        if (filteredCategory) finalProductMasterData.productCategoryInfo = { productCategoryID: filteredCategory._id, productCategoryName: filteredCategory.productCategoryName, productCategory: filteredCategory.productCategory };

        if (finalProductMasterData.hsnCode == "null") {
          finalProductMasterData.hsnCode = null;
        }

        this.wmsService.productMasterData(JSON.stringify(finalProductMasterData)).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.isReadMode = false;
              this.toastr.success(response.statusMsg);
              /*  this.toastr.success('Saved successfully'); */
              this.productForm.reset();
              this.productForm.get('moq').setValue('1');
              this.saleTaxes = [];
              this.purchaseTaxes = [];
              this.wareHouseselected = [];
              if (this.showImage) {
                const element = <HTMLImageElement>(document.getElementById('imageID'));
                element.src = null;
              }
              this.productForm.controls.serialNumberCheck.setValue('No');

              this.id = '';
              this.productForm.get('creationDate').setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));
              this.fetchAllProducts(this.page, this.itemsPerPage);
              this.productNameReadOnly = false
              if (this.appService.getParam('id')) {
                this.appService.navigate('/masterdata/product', null);
              }
              this.productForm.get('productMerge').setValue('Yes');
              this.dummyHsnCode = null;
            } else if (response && response.status === 2 && response.statusMsg) {
              this.toastr.error(response.statusMsg);
            } else {
              this.toastr.error('Failed in saving');
            }
          },
          (error) => {
            this.toastr.error('Failed in saving');
          }
        );
        this.productForm.get('creationDate').setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));
      }
      else {
        this.toastr.error('Enter Organization and WareHouse.');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
    this.globalIDs = null;
  }
  saveSerialConfiguration(value) {
    this.productForm.controls.serialNumberCheck.setValue(value);
  }
   imageUrl: string | ArrayBuffer | null = null;
  clear() {
    if (this.showImage) {
      (<HTMLInputElement>document.getElementById('importMeasure')).value = ''; 
      const element = <HTMLImageElement>document.getElementById('imageID'); 
      if (element) {
        element.src = ''; 
      }
    }
    this.imageUrl = null; 
     /*  const element = <HTMLImageElement>(document.getElementById('imageID'));
      element.src = null; */
    
    this.productForm.reset();
    this.saleTaxes = [];
    this.purchaseTaxes = [];
    this.wareHouseselected = [];
    this.productForm.controls.serialNumberCheck.setValue('No');
    this.productForm.get('productMerge').setValue('Yes');
    this.productForm.get('uomConversionAvailability').setValue('Yes');
    this.productForm.get('status').setValue('Active');
    this.productForm.get('moq').setValue('1');
    this.productForm.get('creationDate').setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));
    this.isReadMode = false;
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.productNameReadOnly = false;
    this.productForm.enable();
    this.findAllTaxes();
    this.id = ''
    this.value = [];
    this.dummyHsnCode = null;
    this.productForm.patchValue({
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })

  }
  fetchProductDetailsByID() {
    if (this.appService.getParam('id')) {
      this.id = this.appService.getParam('id');
      this.wmsService.fetchProductDetailsById(this.appService.getParam('id'), this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productMaster) {
            this.product = response.data.productMaster;
            this.product.creationDate = this.wmsCommonService.getDateFromMilliSec(this.product.creationDate);
            this.productForm.patchValue(this.product);
          }
        },
        (error) => {
        });
    }
    this.metaDataService.getImageConfigbyName(this.configService.getGlobalpayload()).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Product') ? true : false;
      }
    })
  }
  getProductIDName() {
    this.productForm.controls.productIDName.setValue(`${this.productForm.value.productID}:${this.productForm.value.productName}`);
  }
  fetchAllD(page, event) {
    if (event) {
      this.fetchAllProducts(page, event.target.value);
    }
  }
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['productBindArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.fetchAllProducts(this.page, this.itemsPerPage);
  }
  productImage: any;
  fetchAllProducts(page?, pageSize?) {
    const form = {
      "page": page,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      // "searchOnKeys":PaginationConstants.product,
      "searchOnKeys": PaginationConstants.product,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName
    }
    this.wmsService.fetchAllProductsWithPaginations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasterPaginationResponse.productMasters) {
          this.products = response.data.productMasterPaginationResponse.productMasters;
          this.products.forEach(element => {
            element['isViewToggle'] = false;
            // console.log(DecimalUtils.valueOf(element.volume).toString());
            // console.log(DecimalUtils.valueOf(element.weight).toString());
            // element.volume = "0.00059733333333333333333333333333333";
          })
          console.log(this.products);
          this.totalItems = response['data'].productMasterPaginationResponse.totalElements;
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

          // this.products.forEach(element => {
          //   const fileName = element.productImage;
          //   this.wmsService.viewProductImages(fileName).subscribe(res => {
          //     this.productImage = 'data:image/png;base64,' + res['data']['resource'];
          //     element.productImage = this.productImage

          //   });
          // });
          //this.rerender();
        }
      })
  }

  /*  fetchAllProducts() {
     this.wmsService.fetchAllProducts(this.formObj).subscribe(
       (response) => {
         if (response && response.status === 0 && response.data.productMasters) {
           this.products = response.data.productMasters;
           this.products.forEach(element => {
             const fileName = element.productImage;
             this.wmsService.viewProductImages(fileName).subscribe(res => {
               this.productImage = 'data:image/png;base64,' + res['data']['resource'];
               element.productImage = this.productImage
             });
           });
           this.rerender();
         }
       })
   } */
  findAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {
      });
  }
  findAllPalletSizes() {
    this.metaDataService.fetchAllPalletSizes(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.palletSizes) {
          this.palletSizes = response.data.palletSizes;
        } else {
          this.palletSizes = [];
        }
      },
      (error) => {
        this.palletSizes = [];
      });
  }
  calculateVolume() {
    if (this.productForm.value.length && this.productForm.value.breadth && this.productForm.value.height && this.locationDimensionCheck != 'Yes') {
      const lb = DecimalUtils.multiply(this.productForm.value.length, this.productForm.value.breadth)
      this.productForm.controls.volume.setValue((DecimalUtils.multiply(lb, this.productForm.value.height)));
    }
    this.calculateVolumeForLocation();
  }
  calculateVolumeForLocation() {
    if (this.productForm.controls.palletQuantity.value) {
      if (this.productForm.controls.locationTotalSpace.value) {
        this.productForm.controls.volume.setValue((DecimalUtils.divideForProduct(this.productForm.controls.locationTotalSpace.value, this.productForm.value.palletQuantity)));
        this.productForm.controls.maxDimension.setValue(this.productForm.controls.volume.value);
        console.log((DecimalUtils.divideForProduct(this.productForm.controls.locationTotalSpace.value, this.productForm.value.palletQuantity)).toString());
      }
      if (this.productForm.controls.locationWeight.value) {
        this.productForm.controls.weight.setValue((DecimalUtils.divideForProduct(this.productForm.controls.locationWeight.value, this.productForm.value.palletQuantity)));
      }
      if (this.productForm.controls.volume.value && this.productForm.controls.breadth.value && this.productForm.controls.length.value) {
        const lw = DecimalUtils.multiply(this.productForm.controls.length.value, this.productForm.controls.breadth.value);
        this.productForm.controls.height.setValue(DecimalUtils.divideForProduct(this.productForm.controls.volume.value, lw));
      }
    }
  }

  createProductForm() {
    this.productForm = new FormBuilder().group({
      productID: ['', [Validators.compose([null, Validators.required, Validators.maxLength(99)])]],
      productName: ['', [Validators.compose([null, Validators.required, Validators.maxLength(99)])]],
      productIDName: ['', [Validators.compose([null, Validators.required, Validators.maxLength(99)])]],
      productCategoryInfo: new FormBuilder().group({
        productCategoryName: ['', [Validators.required]],
      }),
      //  productImage: [null],
      productDescription: null,
      productConfiguration: null,
      dfsCode: null,
      type: null,
      productClass: ['', [Validators.compose([null, Validators.maxLength(99)])]],
      productType: [null, [Validators.compose([null, Validators.maxLength(99)])]],
      upcEANNumber: null,
      hsnCode: null,
      productImage: null,
      inventoryUnit: ['', [Validators.compose([null, Validators.required, Validators.maxLength(5)])]],
      storageUnit: [null],
      receivingUnit: ['', [Validators.compose([null, Validators.required, Validators.maxLength(5)])]],
      pickingUnit: [null],
      shipmentUnit: [null],
      palletQuantity: ['', [Validators.compose([null, Validators.maxLength(99)])]],
      productMerge: ['Yes'],
      locationTotalSpace: null,
      locationTotalSpaceUom: null,
      locationWeight: null,
      locationWeightUom: null,
      mergeType: ['', [Validators.compose([null,Validators.required])]],
      invoiceType: null,
      uomConversionAvailability: 'Yes',
      serialNumberCheck: ['No'],
      length: [null, [Validators.compose([null, Validators.maxLength(99)])]],
      breadth: [null, [Validators.compose([null, Validators.maxLength(99)])]],
      height: [null, [Validators.compose([null, Validators.maxLength(99)])]],
      volume: null,
      lengthUom: null,
      breadthUom: null,
      heightUom: null,
      volumeUom: null,
      weightUom: null,
      maxDimensionUom: null,
      weight: [null, [Validators.compose([null, Validators.maxLength(99)])]],
      palletSize: [null, [Validators.compose([null, Validators.maxLength(99)])]],
      maxDimension: null,
      brandNames: null,
      currency: null,
      avgCostPrice: null,
      salePrice: null,
      purchasePrice: ['', [Validators.required, Validators.compose([null, Validators.maxLength(99)])]],
      pricingMethod: null,
      mrp: null,
      location: null,
      shelfLife: null,
      expiryFlag: null,
      status: ['Active', [Validators.compose([null, Validators.maxLength(99)])]],
      moq: 1,
      packageType: [null],
      leadTime: null,
      reOrderPoint: [null],
      qualityCheck: [null],
      creationDate: [this.datepipe.transform(new Date(), 'yyyy-MM-dd')],
      receivingInstruction: null,
      storageInstruction: null,
      dispathInstruciton: null,
      pickingDirection: null,
      blockInventory: null,
      markup: null,
      markupType: null,
      saleTaxes: null,
      purchaseTaxes: null,
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      //productCategoryGroupDetail:null,
      productCategoryGroupDetail: null,
      // dummy fields
      subcatgory1: [null],
      subcatgory2: [null],
      subcatgory3: [null]
    });
  }
  /* setUomName(data)
  {
    console.log(data);
    if(data)
    {
      /* console.log(this.productForm.controls.lengthUom.value)
      this.productForm.controls.breadthUom.setValue(data ? data : null)
      this.productForm.controls.heightUom.setValue(data ? data : null)
      this.productForm.controls.weightUom.setValue(data ? data : null)
      this.productForm.controls.volumeUom.setValue(data ? data : null)

    }

  }
 */
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
    /*  if (this.focusedElement && this.focusedElement === fieldName) {
       return false;
     } else {
       return this.productForm.controls[fieldName].valid && this.productForm.controls[fieldName].touched;
     } */
  }
  getAllCurrencies() {
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
  }
  brandConfigureIDs = [];
  fetchAllBrandConfigurations() {
    this.metaDataService.fetchAllBrandConfigurations(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.brandConfigurations) {
          this.brandConfigurationsResponceList = response.data.brandConfigurations;
          this.brandConfigureIDs = response.data.brandConfigurations.map(x => x.brandName);
          /*   console.log(response.data.brandConfigurations); */
        } else {
          this.brandConfigurationsResponceList = [];
        }
      },
      (error) => {
        this.brandConfigurationsResponceList = [];
      });
  }

  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategories = response.data.productCategories;
        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
  getAllProductsForDownload(index?) {
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
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }
        this.wmsService.fetchAllProductsWithPaginations(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.productMasterPaginationResponse.productMasters) {
              this.exportData = [...this.exportData, ...response.data.productMasterPaginationResponse.productMasters];
              this.getAllProductsForDownload(i);
            }
          })
      }
    }
  }
  exportAsXLSX() {
    const changedProductList = this.exportTypeMethod(this.exportData);
    this.excelService.exportAsExcelFile(changedProductList, 'products', null);
  }
  exportTypeMethod(data) {
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        const obj = {}
        this.purchaseTaxArray = []
        if (ele.purchaseTaxes) {
          ele.purchaseTaxes.forEach(s => {
            this.purchaseTaxArray.push(s.taxNamePercentage);
          })
        }
        this.purchaseTaxs = this.purchaseTaxArray.join(",");
        this.brandConfigurations = [];
        if (ele.brandNames) {
          ele.brandNames.forEach(brancdNameString => {
            this.brandConfigurations.push(brancdNameString);
          })
        }
        this.brandNames = this.brandConfigurations.join(",");
        this.salesTaxArray = []
        if (ele.saleTaxes) {
          ele.saleTaxes.forEach(s => {
            this.salesTaxArray.push(s.taxNamePercentage)
          })
        }
        this.salestaxs = this.salesTaxArray.join(",")


        const sourceWare = []
        if (ele.sourceWareHouseInfos && ele.sourceWareHouseInfos.length > 0) {
          ele.sourceWareHouseInfos.forEach(s => {
            sourceWare.push(s.wareHouseIDName)
          })
        }
        const sourceWH = sourceWare.join(",")


        let brandArr: any = []
        obj['productID'] = ele.productID
        obj['productName'] = ele.productName
        obj['productDescription'] = ele.productDescription
        obj['productConfiguration'] = ele.productConfiguration
        obj['dfsCode'] = ele.dfsCode
        obj['type'] = ele.type
        obj['hsnCode'] = ele.hsnCode
        obj['upcEANNumber'] = ele.upcEANNumber
        obj['productType'] = ele.productType
        obj['productClass'] = ele.productClass
        if (ele.productCategoryInfo) {
          obj['productCategoryName'] = ele.productCategoryInfo.productCategoryName
        } else {
          obj['productCategoryName'] = null
        }
        // below code working fine. hold it for some other priority works.
        if (ele.productCategoryGroupDetail && ele.productCategoryGroupDetail.childProductSubCategories && ele.productCategoryGroupDetail.childProductSubCategories.length > 0) {
          if (ele.productCategoryGroupDetail.childProductSubCategories.length === 1) {
            obj['ProductCategory1'] = ele.productCategoryGroupDetail.childProductSubCategories[0].productSubCategoryName;
          }
          else if (ele.productCategoryGroupDetail.childProductSubCategories.length > 1) {
            let arr = ele.productCategoryGroupDetail.childProductSubCategories.map(x => x.productSubCategoryName);
            obj['ProductCategory1'] = arr.toString();
          }
        }
        else {
          obj['ProductCategory1'] = null;
        }
        if (ele.productCategoryGroupDetail && ele.productCategoryGroupDetail.childProductSubCategories && ele.productCategoryGroupDetail.childProductSubCategories.length > 0) {
          ele.productCategoryGroupDetail.childProductSubCategories.forEach(m => {
            if (m.childProductSubCategories && m.childProductSubCategories.length > 0) {
              if (m.childProductSubCategories.length == 1) {
                obj['ProductCategory2'] = m.childProductSubCategories[0].productSubCategoryName;
              }
              else if (m.childProductSubCategories.length > 1) {
                let arr = m.childProductSubCategories.map(x => x.productSubCategoryName);
                obj['ProductCategory2'] = arr.toString();
              }
            } else {
              obj['ProductCategory2'] = null
            }
          })
        }
        else {
          obj['ProductCategory2'] = null;
        }
        if (ele.productCategoryGroupDetail && ele.productCategoryGroupDetail.childProductSubCategories && ele.productCategoryGroupDetail.childProductSubCategories.length > 0) {
          ele.productCategoryGroupDetail.childProductSubCategories.forEach(m => {
            if (m.childProductSubCategories && m.childProductSubCategories.length > 0) {
              m.childProductSubCategories.forEach(s => {
                if (s.childProductSubCategories && s.childProductSubCategories.length > 0) {
                  if (s.childProductSubCategories.length == 1) {
                    obj['ProductCategory3'] = s.childProductSubCategories[0].productSubCategoryName;
                  }
                  else if (s.childProductSubCategories.length > 1) {
                    let arr = s.childProductSubCategories.map(x => x.productSubCategoryName);
                    obj['ProductCategory3'] = arr.toString();
                  }
                } else {
                  obj['ProductCategory3'] = null
                }
              })
            } else {
              obj['ProductCategory3'] = null
            }
          })
        }
        else {
          obj['ProductCategory3'] = null;
        }
        obj['avgCostPrice'] = ele.avgCostPrice
        obj['salePrice'] = ele.salePrice
        obj['breadth'] = ele.breadth
        obj['breadthUom'] = ele.breadthUom
        obj['batchNumber'] = ele.batchNumber
        obj['currency'] = ele.currency
        if (ele.brandNames && ele.brandNames.length > 0) {
          brandArr = ele.brandNames.join(",")
          obj['brandNames'] = brandArr;
        }
        else {
          obj['brandNames'] = null
        }
        obj['dispatchInstruciton'] = ele.dispathInstruciton
        obj['expiryFlag'] = ele.expiryFlag
        obj['invoiceType'] = ele.invoiceType,
          obj['uomConversionAvailability'] = ele.uomConversionAvailability ? ele.uomConversionAvailability : 'Yes',
          (this.locationDimensionCheck == 'No') ? obj['height'] = ele.height : null,
          obj['heightUom'] = ele.heightUom
        obj['inventoryUnit'] = ele.inventoryUnit
        obj['leadTime'] = ele.leadTime
        obj['brandNames'] = this.brandNames
        obj['length'] = ele.length
        obj['lengthUom'] = ele.lengthUom
        obj['maxDimension'] = ele.maxDimension
        obj['maxDimensionUom'] = ele.maxDimensionUom
        obj['mergeType'] = ele.mergeType
        obj['moq'] = ele.moq ? ele.moq : '1'
        obj['packageType'] = ele.packageType
        obj['palletQuantity'] = ele.palletQuantity,
          (this.locationDimensionCheck == 'Yes') ? obj['locationTotalSpace'] = ele.locationTotalSpace : null,
          (this.locationDimensionCheck == 'Yes') ? obj['locationWeight'] = ele.locationWeight : null,
          obj['palletSize'] = ele.palletSize
        obj['pickingDirection'] = ele.pickingDirection
        obj['pickingUnit'] = ele.pickingUnit
        obj['purchasePrice'] = ele.purchasePrice
        obj['productMerge'] = ele.productMerge
        obj['qualityCheck'] = ele.qualityCheck
        obj['reOrderPoint'] = ele.reOrderPoint
        obj['receivingInstruction'] = ele.receivingInstruction
        obj['receivingUnit'] = ele.receivingUnit
        obj['serialNumberCheck'] = ele.serialNumberCheck
        obj['shelfLife'] = ele.shelfLife
        obj['shipmentUnit'] = ele.shipmentUnit
        obj['storageInstruction'] = ele.storageInstruction
        obj['storageUnit'] = ele.storageUnit
        obj['taxGroup'] = ele.taxGroup
        obj['updatedDate'] = ele.updatedDate ? this.datepipe.transform(new Date(ele.updatedDate), 'dd/MM/yyyy') : null,
          (this.locationDimensionCheck == 'No') ? obj['volume'] = ele.volume : null,
          obj['volumeUom'] = ele.volumeUom,
          obj['storageUnit'] = ele.storageUnit,
          (this.locationDimensionCheck == 'No') ? obj['weight'] = ele.weight : null,
          obj['weightUom'] = ele.weightUom
        obj['pricingMethod'] = ele.pricingMethod
        obj['purchaseTax'] = this.purchaseTaxs
        obj['salesTax'] = this.salestaxs
        obj['blockInventory'] = ele.blockInventory
        obj['markup'] = ele.markup
        obj['markupType'] = ele.markupType
        obj['sourceWareHouses'] = sourceWH
        arr.push(obj)
        console.log(arr)
      })
    }
    else {
      const obj = {}

      obj['productID'] = null
      obj['productName'] = null
      obj['productDescription'] = null
      obj['productConfiguration'] = null
      obj['dfsCode'] = null
      obj['type'] = null
      obj['hsnCode'] = null
      obj['upcEANNumber'] = null
      obj['productType'] = null
      obj['productClass'] = null
      obj['productCategoryName'] = null
      obj['avgCostPrice'] = null
      obj['salePrice'] = null
      obj['breadth'] = null
      obj['breadthUom'] = null
      obj['batchNumber'] = null
      obj['currency'] = null
      obj['dispatchInstruciton'] = null
      obj['expiryFlag'] = null
      obj['invoiceType'] = null
      obj['uomConversionAvailability'] = null
      obj['height'] = null
      obj['heightUom'] = null
      obj['inventoryUnit'] = null
      obj['leadTime'] = null
      obj['length'] = null
      obj['lengthUom'] = null
      obj['maxDimension'] = null
      obj['maxDimensionUom'] = null
      obj['mergeType'] = null
      obj['moq'] = null
      obj['packageType'] = null
      obj['palletQuantity'] = null
      obj['palletSize'] = null
      obj['pickingDirection'] = null
      obj['pickingUnit'] = null
      obj['purchasePrice'] = null
      obj['productMerge'] = null
      obj['qualityCheck'] = null
      obj['reOrderPoint'] = null
      obj['receivingInstruction'] = null
      obj['receivingUnit'] = null
      obj['serialNumberCheck'] = null
      obj['shelfLife'] = null
      obj['shipmentUnit'] = null
      obj['storageInstruction'] = null
      obj['storageUnit'] = null
      obj['taxGroup'] = null
      obj['updatedDate'] = null
      obj['volume'] = null
      obj['volumeUom'] = null
      obj['storageUnit'] = null
      obj['weight'] = null
      obj['weightUom'] = null
      obj['pricingMethod'] = null
      obj['purchaseTax'] = null
      obj['salesTax'] = null
      obj['blockInventory'] = null
      obj['`markup`'] = null
      obj['markupType'] = null
      arr.push(obj)
    }
    return arr
  }

  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  productNameReadOnly: boolean = false;
  // checkX() {
  //   console.log(this.value);
  //   console.log(this.selectedData);
  //   const productCategoryGroupDetail = this.selectedData;
  // }
  globalIDs: any;
  edit(product: any) {
    this.globalIDs = product._id
    this.imageID = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('imageID'));
      element.src = null;
    }
    this.productNameReadOnly = true;
    if (!product.serialNumberCheck) {
      product.serialNumberCheck = 'No';
    }
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.makeReadOnly = false
      this.makeThisDisabled = false;
      this.productForm.enable();
      window.scroll(0, 0);
      if (product.productImage && this.showImage) {
        this.metaDataService.viewImages(product.productImage).subscribe(data => {
          this.imageID = 'data:text/plain;base64,' + data['data']['resource'];

          this.imageID = this.metaDataService.dataURLtoFile(this.imageID, product.productImage);
          this.metaDataService.imgGlobalChanged(this.imageID, 'imageID', true);

        });
      }
      this.fetchAllProductCategoryGroupsDetails()
      if (product.creationDate) {
        product.creationDate = this.wmsCommonService.getDateFromMilliSec(product.creationDate);
      }
      console.log(product);
      // this.productForm.patchValue(product)
      this.productForm.patchValue({
        ...product,
        productCategoryInfo: product.productCategoryInfo || {},
        // currencyMaster: product.currencyMaster || {},
        productCategoryGroupDetail: product.productCategoryGroupDetail || {},
        brandNames: product.brandNames || []
      });



      console.log(this.productForm.value)
      // this.getProductCategoryDetails()

      this.id = product._id;
      this.product = product;
      this.saleTaxes = product.saleTaxes ? product.saleTaxes.map(x => x.taxNamePercentage) : [];
      this.purchaseTaxes = product.purchaseTaxes ? product.purchaseTaxes.map(x => x.taxNamePercentage) : [];
      this.productForm.get('productMerge').setValue('Yes');
      if (product.hsnCode) {
        const filteredHSNTaxes = this.taxData.filter(x => x.hsnCode == product.hsnCode);
        this.taxIDs = [...new Set(filteredHSNTaxes.map(x => x.taxNamePercentage))];
        this.filterData = this.taxIDs.filter(x => x != null)
        this.taxIDs = this.filterData;
      }
      if (product.sourceWareHouseInfos && product.sourceWareHouseInfos.length > 0) {
        this.wareHouseselected = product.sourceWareHouseInfos.map(x => x.wareHouseIDName);
      }
      else {
        this.wareHouseselected = [];
      }
      this.getSubData1Details(product.productCategoryInfo.productCategoryName)
      if (product.productCategoryGroupDetail && product.productCategoryGroupDetail.childProductSubCategories && product.productCategoryGroupDetail.childProductSubCategories.length > 0) {
        this.firstarr = []
        product.productCategoryGroupDetail.childProductSubCategories.forEach(ele => {
          this.firstarr.push(ele.productSubCategoryName)
          this.dumArr = []
          if (ele.childProductSubCategories && ele.childProductSubCategories.length > 0) {
            ele.childProductSubCategories.forEach(s => {
              this.dumArr.push(s.productSubCategoryName)
              this.thirdarr = []
              if (s.childProductSubCategories && s.childProductSubCategories.length > 0) {
                s.childProductSubCategories.forEach(m => {
                  this.thirdarr.push(m.productSubCategoryName)
                })
              }
            })
          }
        })
      } else {
        this.firstarr = null
      }
      this.productForm.controls.subcatgory1.setValue(this.firstarr)
      this.OnsubcatgoryChange()
      if (this.productForm.controls.subcatgory1.value && this.productForm.controls.subcatgory1.value.length < 2) {
        this.productForm.controls.subcatgory2.setValue(this.dumArr)
        this.Onsub2catgoryChange()
      } else {
        this.productForm.controls.subcatgory2.setValue(null)
      }
      if (this.productForm.controls.subcatgory2.value && this.productForm.controls.subcatgory2.value.length < 2) {
        this.productForm.controls.subcatgory3.setValue(this.thirdarr)
        this.Onsub3catgoryChange()
      } else {
        this.productForm.controls.subcatgory3.setValue(null)
      }

      // if (product.productCategoryGroupDetail) {
      //   product.productCategoryGroupDetail.childProductSubCategories.forEach(ele => {
      //     if (ele.childProductSubCategories && ele.childProductSubCategories.length > 0) {
      //       ele.childProductSubCategories.forEach(s => {
      //         this.value.push(s.productSubCategoryName)
      //         if (s.childProductSubCategories && s.childProductSubCategories.length > 0) {
      //           s.childProductSubCategories.forEach(m => {
      //             this.value.push(m.productSubCategoryName)
      //           })
      //         } else {
      //           this.value.push(ele.productSubCategoryName)
      //         }
      //       })
      //     } else {
      //       this.value.push(ele.productSubCategoryName)
      //     }
      //   })

      // }
      // const fileNames = product.productImage;
      /*  this.metaDataService.uploadProductImage(fileNames).subscribe(res => {
         console.log(res);
         this.productForm.get('productImage').setValue(res['data']['fileName']);
         this.productImage.get('productImage').setValue(res['data']['fileName']);
         this.productImage = this.metaDataService.dataURLtoFile(this.productImage, fileNames);
         this.metaDataService.imgGlobalChanged(this.productImage, 'productImage', true);
     }) */
    }

    else if (this.permissionsList.includes('View')) {
      window.scroll(0, 0);
      this.productForm.patchValue(product);
      this.productForm.disable();
      this.productForm.get('productMerge').setValue('Yes');
    }
    console.log(this.productForm.value);
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'Product', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
      //  this.deleteProductImage();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllProducts(this.page, this.itemsPerPage);
    }
  }

  /* Upload New part  Start */

  getFileNew() {
    document.getElementById('upfileNew').click();
  }

  failureRecordsNew: any[] = [];
  missingParamsNew: any;
  newUploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.failureRecordsNew = [];
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        const endArray = [];
        event.target.value = '';
        const missingParamsArrayNew = this.mandatoryCheckNew(jsonData);
        if (missingParamsArrayNew.length > 1) {
          this.failureRecordsNew = missingParamsArrayNew;
          this.toastr.error('Please download log file to fill mandatory fields');
        } else {
          const reqData = this.excelService.generateInnerProdutObjs(jsonData, Constants.GEN_INNER_OBJS.PRODUCT);
          reqData.forEach(r => {
            r['creationDate'] = r['creationDate'] ? new Date(r['creationDate']) : new Date();
            r['updatedDate'] = r['updatedDate'] ? new Date(r['updatedDate']) : null;
            let productCategoryObj = this.mapId('productCategoryDetails', r.productCategoryName);
            if (r.productCategoryName && productCategoryObj) {
              r['productCategoryInfo'] = {
                "productCategoryID": productCategoryObj._id,
                "productCategory": productCategoryObj.productCategory,
                "productCategoryName": productCategoryObj.productCategoryName
              }
            } else if (r.productCategoryName) {
              r['productCategoryInfo'] = {
                "productCategoryName": r.productCategoryName,
                "productCategoryID": null,
                "productCategory": null,
              }
            } else {
              r['productCategoryInfo'] = null
            }
            r['brandNames'] = this.getBrandFraming(r);
            if (r.purchaseTax) {
              let arr = []
              arr = r.purchaseTax.split(',')
              this.uploadPurchaseTax = []
              arr.forEach(element => {
                this.uploadPurchaseTax.push(this.getTaxJson(element));
              });
              r['purchaseTaxes'] = this.uploadPurchaseTax
            } else {
              r['purchaseTaxes'] = null
            }
            this.getSubData1Details(r.productCategoryName)
            r['ProductCategory1'] = this.getSub1Framing(r);
            r['ProductCategory2'] = this.getSub2Framing(r);
            r['ProductCategory3'] = this.getSub3Framing(r);

            if (r.salesTax) {
              let salesArr = []
              salesArr = r.salesTax.split(',')
              this.uploadSalesTax = []
              salesArr.forEach(element => {
                this.uploadSalesTax.push(this.getTaxJson(element));
              });
              r['saleTaxes'] = this.uploadSalesTax
            } else {
              r['saleTaxes'] = null
            }
            delete r.salesTax
            r['organizationInfo'] = this.configService.getOrganization();
            r['wareHouseInfo'] = this.configService.getWarehouse();
            r['locationTotalSpaceUom'] = (this.locationDimensionCheck == 'Yes') ? r.volumeUom : null;
            r['locationWeightUom'] = (this.locationDimensionCheck == 'Yes') ? r.weightUom : null;
            r.avgCostPrice = r.avgCostPrice ? r.avgCostPrice.toString() : null
            r.salePrice = r.salePrice ? r.salePrice.toString() : null
            r.breadth = r.breadth ? r.breadth.toString() : null
            r.batchNumber = r.batchNumber ? r.batchNumber.toString() : null
            r.expiryFlag = r.expiryFlag ? r.expiryFlag.toString() : null
            r.leadTime = r.leadTime ? r.leadTime.toString() : null
            r.length = r.length ? r.length.toString() : null
            r.maxDimension = r.maxDimension ? r.maxDimension.toString() : null
            r.moq = r.moq ? r.moq.toString() : '1';
            r.palletQuantity = r.palletQuantity ? r.palletQuantity.toString() : null
            r.locationTotalSpace = r.locationTotalSpace ? r.locationTotalSpace.toString() : null
            r.locationWeight = r.locationWeight ? r.locationWeight.toString() : null
            r.purchasePrice = r.purchasePrice ? r.purchasePrice.toString() : null
            r.shelfLife = r.shelfLife ? r.shelfLife.toString() : null
            r.markup = r.markup ? r.markup.toString() : null
            r['uomConversionAvailability'] = r.uomConversionAvailability ? r.uomConversionAvailability : 'Yes',
              r['_id'] = null;
            const findID = this.products.find(x => x.productID == r.productID);
            if (findID) {
              r['_id'] = findID._id;
            }
            delete r["Currency"]
            delete r['currencyMaster']
            r['productCategoryGroupDetail'] = null
            r["productCategoryGroupExcelRequest"] = {
              "productCategoryName": r['productCategoryName'],
              "productSubCategory1": r['ProductCategory1'],
              "productSubCategory2": r['ProductCategory2'],
              "productSubCategory3": r['ProductCategory3']
            }
            delete r.productCategoryName
            delete r['ProductCategory1']
            delete r['ProductCategory2']
            delete r['ProductCategory3']
            if (r.sourceWareHouses) {
              let sourceArr = []
              sourceArr = r.sourceWareHouses.split(',')
              const uploadSourceWh = []
              sourceArr.forEach(element => {
                uploadSourceWh.push(this.getWarehouseJson(element));
              });
              r['sourceWareHouseInfos'] = uploadSourceWh
            } else {
              r['sourceWareHouseInfos'] = null
            }
            delete r.sourceWareHouses
          });
          console.log(reqData);
          this.excelRestService.saveProductBulkdataNew(reqData).subscribe(res => {
            if (res && res.status === 0 && res.data.productMasterList && res.data.productMasterList.failureList &&
              res.data.productMasterList.failureList.length > 0 && res.data.productMasterList.successList &&
              res.data.productMasterList.successList.length > 0) {
              this.failureRecordsNew = res.data.productMasterList.failureList;
              this.failureRecordsNew = this.failureRecordsNew.concat(res.data.productMasterList.duplicateList);
              this.toastr.error('Partially failed in uploading, Please download log for reasons');
              this.fetchAllProducts(1, this.itemsPerPage);
            } else if (res && res.status === 0 && res.data.productMasterList && res.data.productMasterList.failureList && res.data.productMasterList.failureList.length > 0) {
              this.failureRecordsNew = res.data.productMasterList.failureList;
              this.failureRecordsNew = this.failureRecordsNew.concat(res.data.productMasterList.duplicateList);
              this.toastr.error('Failed in uploading, Please download log for reasons');
            } else if (res && res.status === 0 && res.data.productMasterList && res.data.productMasterList.failureList && res.data.productMasterList.failureList.length === 0) {
              if (res && res.status === 0 && res.data.productMasterList && res.data.productMasterList.duplicateList && res.data.productMasterList.duplicateList.length > 0) {
                this.failureRecordsNew = res.data.productMasterList.duplicateList;
                this.toastr.error('Duplicates present in the excel, Please download log file.');
                this.fetchAllProducts(1, this.itemsPerPage);
              } else {
                this.fetchAllProducts(1, this.itemsPerPage);
                this.toastr.success('Uploaded successfully');
                this.failureRecordsNew = [];
              }
            } else {
              this.toastr.error('Failed in uploading');
              this.failureRecordsNew = [];
            }
          },
            error => { });

        }
      }, 500);
    }
  }





  mandatoryCheckNew(data) {
    const missingParamsArrayNew = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        console.log(record);
        if (record) {
          const requiredParamsNew = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT;
          const missingParamsArrayNew = requiredParamsNew.filter((param: any) => !(!!record[param]));
          if (missingParamsArrayNew.length > 0) {
            missingParamsArrayNew.push(`Row No. ${index + 1} - ${missingParamsArrayNew.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArrayNew;
  }
  private setting1 = {
    element: {
      dynamicDownloadNew: null as HTMLElement
    }
  };

  dyanmicDownloadByHtmlTagNew(arg: { fileName: string; text: string }) {
    if (!this.setting1.element.dynamicDownloadNew) {
      this.setting1.element.dynamicDownloadNew = document.createElement("a");
    }
    const element = this.setting1.element.dynamicDownloadNew;
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
  downloadLogFileNew() {
    if (this.failureRecordsNew) {
      this.dyanmicDownloadByHtmlTagNew({
        fileName: "Product Error Reasons",
        text: this.failureRecordsNew.toString().replace(/,/g, '\n')
      });
    }
    else if (this.missingParamsNew) {
      this.dyanmicDownloadByHtmlTagNew({
        fileName: "Product Error Reasons",
        text: this.missingParamsNew.toString().replace(/,/g, '\n')
      });
    }
  }

  /* Upload New End */
  getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.failureRecords = [];
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        const endArray = [];
        event.target.value = '';
        const missingParamsArray = this.mandatoryCheck(jsonData);
        if (missingParamsArray.length > 1) {
          this.failureRecords = missingParamsArray;
          this.toastr.error('Please download log file to fill mandatory fields');
        } else {
          const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.PRODUCT);
          reqData.forEach(r => {
            r['creationDate'] = r['creationDate'] ? new Date(r['creationDate']) : new Date();
            r['updatedDate'] = r['updatedDate'] ? new Date(r['updatedDate']) : null;
            let productCategoryObj = this.mapId('productCategoryDetails', r.productCategoryName);
            if (r.productCategoryName && productCategoryObj) {
              r['productCategoryInfo'] = {
                "productCategoryID": productCategoryObj._id,
                "productCategory": productCategoryObj.productCategory,
                "productCategoryName": productCategoryObj.productCategoryName
              }
            }
            else if (r.productCategoryName) {
              r['productCategoryInfo'] = {
                "productCategoryName": r.productCategoryName,
                "productCategoryID": null,
                "productCategory": null,
              }
            }
            else {
              r['productCategoryInfo'] = null
            }
            r['brandNames'] = this.getBrandFraming(r);
            if (r.purchaseTax) {
              let arr = []
              arr = r.purchaseTax.split(',')
              this.uploadPurchaseTax = []
              arr.forEach(element => {
                this.uploadPurchaseTax.push(this.getTaxJson(element));
              });
              r['purchaseTaxes'] = this.uploadPurchaseTax
            } else {
              r['purchaseTaxes'] = null
            }
            this.getSubData1Details(r.productCategoryName)
            r['ProductCategory1'] = this.getSub1Framing(r);
            r['ProductCategory2'] = this.getSub2Framing(r);
            r['ProductCategory3'] = this.getSub3Framing(r);

            if (r.salesTax) {
              let salesArr = []
              salesArr = r.salesTax.split(',')
              this.uploadSalesTax = []
              salesArr.forEach(element => {
                this.uploadSalesTax.push(this.getTaxJson(element));
              });
              r['saleTaxes'] = this.uploadSalesTax
            } else {
              r['saleTaxes'] = null
            }
            delete r.salesTax
            r['organizationInfo'] = this.configService.getOrganization();
            r['wareHouseInfo'] = this.configService.getWarehouse();
            r['locationTotalSpaceUom'] = (this.locationDimensionCheck == 'Yes') ? r.volumeUom : null;
            r['locationWeightUom'] = (this.locationDimensionCheck == 'Yes') ? r.weightUom : null;
            r.avgCostPrice = r.avgCostPrice ? r.avgCostPrice.toString() : null
            r.salePrice = r.salePrice ? r.salePrice.toString() : null
            r.breadth = r.breadth ? r.breadth.toString() : null
            r.batchNumber = r.batchNumber ? r.batchNumber.toString() : null
            r.expiryFlag = r.expiryFlag ? r.expiryFlag.toString() : null
            r.leadTime = r.leadTime ? r.leadTime.toString() : null
            r.length = r.length ? r.length.toString() : null
            r.maxDimension = r.maxDimension ? r.maxDimension.toString() : null
            r.moq = r.moq ? r.moq.toString() : '1';
            r.palletQuantity = r.palletQuantity ? r.palletQuantity.toString() : null
            r.locationTotalSpace = r.locationTotalSpace ? r.locationTotalSpace.toString() : null
            r.locationWeight = r.locationWeight ? r.locationWeight.toString() : null
            r.purchasePrice = r.purchasePrice ? r.purchasePrice.toString() : null
            r.shelfLife = r.shelfLife ? r.shelfLife.toString() : null
            r.markup = r.markup ? r.markup.toString() : null
            r['uomConversionAvailability'] = r.uomConversionAvailability ? r.uomConversionAvailability : 'Yes',
              r['_id'] = null;
            const findID = this.products.find(x => x.productID == r.productID);
            if (findID) {
              r['_id'] = findID._id;
            }
            delete r["Currency"]
            delete r['currencyMaster']
            r['productCategoryGroupDetail'] = null
            r["productCategoryGroupExcelRequest"] = {
              "productCategoryName": r['productCategoryName'],
              "productSubCategory1": r['ProductCategory1'],
              "productSubCategory2": r['ProductCategory2'],
              "productSubCategory3": r['ProductCategory3']
            }
            delete r.productCategoryName
            delete r['ProductCategory1']
            delete r['ProductCategory2']
            delete r['ProductCategory3']
            if (r.sourceWareHouses) {
              let sourceArr = []
              sourceArr = r.sourceWareHouses.split(',')
              const uploadSourceWh = []
              sourceArr.forEach(element => {
                uploadSourceWh.push(this.getWarehouseJson(element));
              });
              r['sourceWareHouseInfos'] = uploadSourceWh
            } else {
              r['sourceWareHouseInfos'] = null
            }
            delete r.sourceWareHouses
          });
          this.excelRestService.saveProductBulkdata(reqData).subscribe(res => {
            if (res && res.status === 0 && res.data.productMasterList && res.data.productMasterList.failureList &&
              res.data.productMasterList.failureList.length > 0 && res.data.productMasterList.successList &&
              res.data.productMasterList.successList.length > 0) {
              this.failureRecords = res.data.productMasterList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.productMasterList.duplicateList);
              this.toastr.error('Partially failed in uploading, Please download log for reasons');
              this.fetchAllProducts(1, this.itemsPerPage);
            } else if (res && res.status === 0 && res.data.productMasterList && res.data.productMasterList.failureList && res.data.productMasterList.failureList.length > 0) {
              this.failureRecords = res.data.productMasterList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.productMasterList.duplicateList);
              this.toastr.error('Failed in uploading, Please download log for reasons');
            } else if (res && res.status === 0 && res.data.productMasterList && res.data.productMasterList.failureList && res.data.productMasterList.failureList.length === 0) {
              if (res && res.status === 0 && res.data.productMasterList && res.data.productMasterList.duplicateList && res.data.productMasterList.duplicateList.length > 0) {
                this.failureRecords = res.data.productMasterList.duplicateList;
                this.toastr.error('Duplicates present in the excel, Please download log file.');
                this.fetchAllProducts(1, this.itemsPerPage);
              } else {
                this.fetchAllProducts(1, this.itemsPerPage);
                this.toastr.success('Uploaded successfully');
                this.failureRecords = [];
              }
            } else {
              this.toastr.error('Failed in uploading');
              this.failureRecords = [];
            }
          },
            error => { });

        }
      }, 500);
    }
  }



  mapId(type, value) {
    switch (type) {
      case 'productCategoryDetails': {
        const productCategory = this.productCategories.find(w => w.productCategoryName === value);
        return productCategory ? productCategory : null;
      }
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        console.log(record);
        if (record) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArray;
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
        fileName: "Product Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
    else if (this.missingParams) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Product Error Reasons",
        text: this.missingParams.toString().replace(/,/g, '\n')
      });
    }
  }

  dataFraming(val) {
    this.thirdArr = []
    if (this.list3 && this.list3.length > 0) {
      this.list3.forEach((ele, i) => {
        let obj = {}
        obj['_id'] = null;
        obj['hierarchyLevel'] = 3
        obj['productSubCategoryName'] = ele;
        obj['childProductSubCategories'] = null;
        this.thirdArr.push(obj)
      })
    } else {
      this.thirdArr = null
    }
    this.secondArr = []
    if (this.list2 && this.list2.length > 0) {
      this.list2.forEach((s, i) => {
        let obj = {}
        obj['hierarchyLevel'] = 2
        obj['productSubCategoryName'] = s
        obj['childProductSubCategories'] = this.thirdArr
        this.secondArr.push(obj)
      })
    } else {
      this.secondArr = null
    }
    this.firstArr = []
    if (this.list1 && this.list1.length > 0) {
      this.list1.forEach((m, i) => {
        let obj = {}
        obj['_id'] = null;
        obj['hierarchyLevel'] = 1
        obj['productSubCategoryName'] = m
        obj['childProductSubCategories'] = this.secondArr
        this.firstArr.push(obj)
      })
    }
    if (this.firstArr && this.firstArr.length > 0) {
      let obj = {
        "_id": null,
        "productCategoryName": val,
        "hierarchyLevel": 0,
        "childProductSubCategories": this.firstArr,
      }
      this.productForm.controls.productCategoryGroupDetail.setValue(obj)
    }
  }

  getBrandStruct(brand) {
    if (brand.brandNames != null && brand.brandNames != undefined) {
      const toBrandArr = brand.brandNames.replace(/\, /gi, ',').split(',');
      const genBrand = toBrandArr ? toBrandArr : null
      return genBrand;
    }
    else {
      const genBrand = null
      return genBrand;
    }
  }
  uploadImagesAndFiles(data, variable, id) {
    this.imageHidden = true;
    if (data && data.target.files) {
      this.metaDataService.uploadImage(data.target.files[0]).subscribe(res => {
        if (res['status'] == 0 && res['data']['fileName']) {
          this[variable] = res['data']['fileName'];
          this.productForm.get("productImage").setValue(res['data']['fileName']);
        }
      });
      this.metaDataService.imgGlobalChanged(data, id);
    }
  }
  deleteImage(variable) {
    (<HTMLInputElement>(document.getElementById(variable))).value = ''
    const element = <HTMLInputElement>document.getElementById(variable);
    element.src = null;
    this.metaDataService.deleteImage(this.productForm.controls.productImage.value).subscribe(data => {

    });
    this.productForm.controls.productImage.setValue(null);
    this.imageHidden = false;
  }



  getBrandFraming(k) {
    if (k.brandNames) {
      const brandsArr = k.brandNames.replace(/\, /gi, ',').split(',');
      console.log(brandsArr)
      return brandsArr;
    } else {
      const brandsArr = null;
      return brandsArr;
    }
  }
  getSub1Framing(k) {
    if (k.ProductCategory1) {
      const arr = k.ProductCategory1.replace(/\, /gi, ',').split(',');
      return arr;
    } else {
      const arr = null;
      return arr;
    }
  }
  getSub2Framing(k) {
    if (k.ProductCategory2) {
      const arr = k.ProductCategory2.replace(/\, /gi, ',').split(',');
      return arr;
    } else {
      const arr = null;
      return arr;
    }
  }
  getSub3Framing(k) {
    if (k.ProductCategory3) {
      const arr = k.ProductCategory3.replace(/\, /gi, ',').split(',');
      return arr;
    } else {
      const arr = null;
      return arr;
    }
  }

}