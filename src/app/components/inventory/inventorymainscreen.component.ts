import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { Constants } from 'src/app/constants/constants';
import { CompleterData, CompleterService } from 'ng2-completer';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from 'src/app/shared/utils/storage';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Query, DataManager, ODataV4Adaptor } from '@syncfusion/ej2-data';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DecimalUtils } from 'src/app/constants/decimal';
import { CheckBoxSelectionService, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { WmsCommonService } from 'src/app/services/wms-common.service';
@Component({
  selector: 'app-inventorymainscreen',
  templateUrl: './inventorymainscreen.component.html',
  styleUrls: ['./inventorymainscreen.component.scss'],
  providers: [CheckBoxSelectionService]
})
export class InventorymainscreenComponent implements OnInit, OnDestroy {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  inventories: any[] = [];
  supplierID: any = '';
  inventoryKeys: any[] = ['', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', ''];
  /* 'Product Configuration',
    'DFC Code', */
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  missingParams: any;
  tableHeadings: any = ['S.No', 'Image', 'Inventory ID', 'Product ID', 'Product Name', 'Product Description', 'UOM', 'Brand Name', 'Mfg Date', 'Expiry Date', 'Batch Number', 'Serial Number', 'Quantity Inventory Unit', 'Available Quantity',
    'Reserved Quantity', 'Supplier/Warehouse IDName', 'Location Name', 'Zone Name', 'Rack Name', 'Level Name', 'Column', 'Remarks', 'Product Purchase Price',
    'Stock Value', 'product Category', 'Product Type', 'Product Class', 'Invoice Number', 'Invoice Date', 'BOE No', 'BOE Date', 'Bond Number'
    , 'Bond Date', 'Created Date', 'Inventory Availabilty', 'Action']
  isShowOrHideError: any = false;
  failureRecords: any = [];
  levels: any;
  rackNameValues: CompleterData;
  levelNameValues: CompleterData;
  racksList: any;
  zones: any;
  zoneNameValues: CompleterData;
  wareHouses: any;
  wareHouseNameValues: CompleterData;
  locationNameValues: CompleterData;
  storageTypes: any;
  storageTypeValues: CompleterData
  productCategories: any;
  allColumns: any;
  locations: any = []
  productIDNames: any;
  products: any;
  suppliers: any;
  serialNumberAllocation = { "_id": null, "serialNumberCheck": "No", "isActive": true };
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inventory', 'Inventory', Storage.getSessionUser());
  forPermissionsSubscription: any;
  supplierIDName: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  inventoryForm: FormGroup;
  categoryDrop: any = [];
  productTypes: any = Constants.PRODUCT_TYPES;
  zoneNameIDs: any = [];;
  rackIDs: any = [];;
  locationsIDs: any = [];;
  batchNumberIDs: any = [];;
  serialNumberIDs: any = [];;
  suppliersIDs: any = [];;
  productIDNameValues: any = [];;
  productDes: any = [];
  exportData: any = [];
  dataPerPage: number;
  loopToStop: any = null;
  racks: any = [];
  showTooltip: any = false;
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
  // public records: { [key: string]: Object }[] = [];
  //   // maps the appropriate column to fields property
  //   public fields: object = { text: 'text', value: 'id' };
  public mode?: string = 'CheckBox';

  //   // set the placeholder to AutoComplete input
  //   public waterMark: string = 'e.g. Item 1';


  @ViewChild('multiCheck')
  public dropdownObj: any;
  public array = new Array(100).fill(null);
  public data = this.array.map((v, i) => ({ text: i, id: i }));

  // bind the Query instance to query property
  // public query: Query = new Query().take(10);
  // public fields: Object = {
  //   text: 'text', value: 'id', itemCreated: (e: any) => {
  //     highlightSearch(e.item, (this as any).queryString, true, 'Contains');
  //   }
  // };
  // // public fields: Object = { text: 'text', value: 'id' };
  // paginationStop: boolean = false;
  // productsIDNamesforScroll:any=[];

  constructor(
    private wmsService: WMSService, private configService: ConfigurationService,
    private commonService: CommonService, public datepipe: DatePipe,
    private excelService: ExcelService, private toastr: ToastrService,
    private excelRestService: ExcelRestService, private wmsCommonService: WmsCommonService,
    private completerService: CompleterService, private metaDataService: MetaDataService,
    private translate: TranslateService, private fb: FormBuilder) {
    this.translate.use(this.language);
    //   for (let i: number = 1; i <= 150; i++) {
    //     const item: { [key: string]: Object } = {
    //         id: 'id' + i,
    //         text: `Item ${i}`,
    //     };
    //     this.records.push(item);
    // }
  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    // this.mode = 'CheckBox';
    this.getFunctionsCall();
  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      this.supplierIDName = (role === 'SUPPLIER') ? this.suppliers.find(x => x.supplierEmailID == user.username).supplierIDName : null;
      this.fetchAllInventories(1, this.itemsPerPage);
    }
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createInventoryForm()
      this.fetchAllSupplierDetails();
      this.fetchAllLevels();
      this.fetchAllRacks();
      this.fetchAllZones();
      this.fetchAllWarehouseDetails();
      this.fetchAllProductCategories();
      this.fetchAllColumns();
      this.fetchAllLocations();
      this.fetchAllProducts();
      this.serialConfig();
      this.fetchAllInventoryBatchAndSerialNumbers()
    }
  }
  // fetchAllProducts(page, pageSize) {
  //   const formValue = {};
  //   formValue['page'] = page;
  //   formValue['pageSize'] = pageSize;
  //   formValue["organizationIDName"] = this.formObj.organizationIDName;
  //   formValue["wareHouseIDName"] = this.formObj.wareHouseIDName;
  //   this.wmsService.fetchAllProductsWithPaginations(formValue).subscribe(
  //     (response) => {
  //       if (response && response.status === 0 && response.data.productMasterPaginationResponse.productMasters) {
  //         this.products = response.data.productMasterPaginationResponse.productMasters;
  //         const arr = response.data.productMasterPaginationResponse.productMasters;
  //         if (this.productsIDNamesforScroll.length > 0) {
  //           let index = this.productsIDNamesforScroll.length;
  //           arr.forEach((v, i) => {
  //             i = index;
  //             if (!this.productsIDNamesforScroll.find(x => x.text == v.productIDName)) {
  //               this.productsIDNamesforScroll.push({ text: v.productIDName, id: i });
  //               index += 1;
  //             }
  //           });
  //         }
  //         else {
  //           this.productsIDNamesforScroll = arr.map((v, i) => ({ text: v.productIDName, id: i }));
  //         }
  //       }
  //       else {
  //         this.productsIDNamesforScroll = [];
  //       }
  //     })
  // }
  // fetchMore(event) {
  //   console.log(event);
  // }
  // onOpen(args, key) {
  //   if (!this.paginationStop) {
  //     let start: number = 10;
  //     let end: number = 20;
  //     let listElement: HTMLElement = (this[key] as any).list;
  //     listElement.addEventListener('scroll', () => {
  //       if (
  //         listElement.scrollTop + listElement.offsetHeight + 1 >=
  //         listElement.scrollHeight
  //       ) {
  //         let filterQuery = new Query();
  //         if (!this.paginationStop) {
  //           this.page += 1;
  //           const form = {
  //             "page": this.page,
  //             "pageSize": 10,
  //             "organizationIDName": this.formObj.organizationIDName,
  //             "wareHouseIDName": this.formObj.wareHouseIDName,
  //             "searchOnKeys": ['productIDName'],
  //             "searchKeyword": null
  //           }
  //           this.wmsService.fetchAllProductsWithPaginations(form).subscribe(
  //             (response) => {
  //               if (response && response.status === 0 && response.data.productMasterPaginationResponse.productMasters) {
  //                 this.products = [...this.products, ...response.data.productMasterPaginationResponse.productMasters];
  //                 this.paginationStop = response.data.productMasterPaginationResponse.productMasters.length == 0 ? true : false;
  //                 if (!this.paginationStop) {
  //                   const arr = response.data.productMasterPaginationResponse.productMasters;
  //                   // if (arr && arr.length > 0) {
  //                   if (this.productsIDNamesforScroll.length > 0) {
  //                     let index = this.productsIDNamesforScroll.length;
  //                     arr.forEach((v, i) => {
  //                       i = index;
  //                       if (!this.productsIDNamesforScroll.find(x => x.text == v.productIDName)) {
  //                         this.productsIDNamesforScroll.push({ text: v.productIDName, id: i });
  //                         index += 1;
  //                       }
  //                     });
  //                   }
  //                   else {
  //                     this.productsIDNamesforScroll = arr.map((v, i) => ({ text: v.productIDName, id: i }));
  //                   }
  //                   new DataManager(this.productsIDNamesforScroll)
  //                     .executeQuery(filterQuery.range(start, end))
  //                     .then((event: any) => {
  //                       start = end;
  //                       end += 10;
  //                       this[key].addItem(
  //                         event.result as {
  //                           [key: string]: Object;
  //                         }[]
  //                       );
  //                     })
  //                     .catch((e: Object) => { });
  //                   // }
  //                 }
  //               }
  //               else {
  //                 this.productsIDNamesforScroll = [];
  //               }
  //             })
  //         }
  //       }
  //     });
  //   }
  // }
  clear() {
    this.inventoryForm.reset();
    this.getFunctionsCall();
    this.rackIDs = [];
  }
  createInventoryForm() {
    this.inventoryForm = this.fb.group({
      "productIDNames": null,
      // "wareHouseIDName":null,
      "productCategoryNames": null,
      "productDescriptions": null,
      "rackNames": null,
      "locationNames": null,
      "batchNumbers": null,
      "brandNames": null,
      "supplierIDNames": null,
      "zoneNames": null,
      "serialNumbers": null,
      "createdDateFrom": null,
      "createdDateTo": null,
      "expiryDateFrom": null,
      "expiryDateTo": null,
      "mfgDateFrom": null,
      "mfgDateTo": null
    })
  }
  serialConfig() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.metaDataService.getAllSerialNumberConfigurations(form).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberAllocation = res.data.serialNumberConfigurations[0];
      }
      else {
        this.serialNumberAllocation = { "_id": null, "serialNumberCheck": "No", "isActive": true };
      }
    })
  }
  fetchAllLevels() {
    this.wmsService.fetchAllLevels(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.levels) {
          this.levels = response.data.levels;
          this.levelNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.levels, 'levelName'));
        } else {
          this.levels = [];
        }
      },
      (error) => {
        this.levels = [];
      });
  }
  fetchAllInventoryBatchAndSerialNumbers() {
    this.wmsService.findAllInventories('', this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventories) {
          const bIn = response.data.inventories.filter(x => x.batchNumber != null);
          const sIn = response.data.inventories.filter(x => x.serialNumber != null);
          const dupBin = bIn ? bIn.map(x => x.batchNumber) : null;
          this.batchNumberIDs = this.removeDuplicates(dupBin);
          const dupsIn = sIn ? sIn.map(x => x.serialNumber) : null;
          this.serialNumberIDs = this.removeDuplicates(dupsIn);
          const productDes = response.data.inventories.map(x => x.productDescription);
          this.productDes = [...new Set(productDes.filter(x => x != null))];
        } else {
          this.batchNumberIDs = null;
          this.serialNumberIDs = null;
          this.productDes = null;
        }
      },
      (error) => {
        this.batchNumberIDs = null;
        this.serialNumberIDs = null;
        this.productDes = null;
      });
  }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.racks = response.data.racks
        }
      });
  }
  getSelectedValue() {
    const arr = this.inventoryForm.value.zoneNames;
    this.rackIDs = [];
    if (arr && arr.length > 0) {
      arr.forEach(rl => {
        const filteredRacks = this.racks.filter(rack => rack.zoneInfo.zoneName === rl);
        this.rackIDs = [...this.rackIDs, ...filteredRacks.map(rackname => rackname.rackName)];
      });
    }
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones) {
          this.zoneNameIDs = response.data.zones.map(x => x.zoneName)

        }
      },
    );
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouses = response.data.wareHouses;
          this.wareHouseNameValues = response.data.wareHouses.map(warehouse => warehouse.wareHouseIDName);

        } else {
          this.wareHouses = [];
        }
      },
      (error) => {
        this.wareHouses = [];
      });
  }
  fetchAllStorageTypes() {
    this.metaDataService.fetchAllStorageTypes(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          if (response.data.storageTypes.length > 0) {
            this.storageTypes = response.data.storageTypes;
            this.storageTypeValues = this.completerService.local(
              this.commonService.getFiltValuesFromArrayOfObjs(response.data.storageTypes, 'storageTypeCode'));
          } else {
            this.storageTypes = [];
          }
        } else {
          this.storageTypes = [];
        }
      },
      (error) => {
        this.storageTypes = [];
      });
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategories = response.data.productCategories;
          this.categoryDrop = response.data.productCategories.map(categoryname => categoryname.productCategoryName);

        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
  edit(data) {
    if (this.permissionsList.includes('Update')) {
      this.inventories.map(element => element.isEdit = false);
      data['mfgDate'] = this.datepipe.transform(data['mfgDate'], 'yyyy-MM-dd');
      data['expiryDate'] = this.datepipe.transform(data['expiryDate'], 'yyyy-MM-dd');
      data.isEdit = true;
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  manipulateOriginalData(value, key, data) {
    data[key] = value;
  }
  update() {
    if (this.permissionsList.includes('Update')) {
      const payload = this.inventories.find(element => element.isEdit == true);
      if (payload) {
        if ((payload.mfgDate && payload.expiryDate && payload.mfgDate > payload.expiryDate)) {
          this.toastr.error("Enter Valid Dates.");
        }
        else {
          this.wmsService.updateInventoryy(payload).subscribe(res => {
            if (res['status'] == 0 && res['data']['inventory']) {
              this.toastr.success('Updated');
              this.rerender();
              this.fetchAllInventories(1, this.itemsPerPage);
            }
          })
        }
      }
      else {
        this.toastr.error('Edit Data');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  fetchAllD(page, event) {
    if (event) {
      this.fetchAllInventories(page, event.target.value);
    }
  }
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['inventoryBindArray'].filter(x => x.key == headerName);
    if (arr.length > 1) {
      this.sortFields = arr.map(x => x.name);
    }
    else {
      this.sortFields = [arr[0].name];
    }
    this.fetchAllInventories(this.page, this.itemsPerPage);
  }
  fetchAllInventories(page?, pageSize?) {
    const form = {
      "page": page,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      // "searchOnKeys":PaginationConstants.product,
      "searchOnKeys": PaginationConstants.inventory,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName
    }
    form['supplierIDName'] = this.supplierIDName
    const form2 = this.inventoryForm.value
    const final = { ...form, ...form2 }
    this.wmsService.findAllInventoriesWithPaginations(this.supplierID, final).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryPaginationResponse.inventories) {
          this.inventories = response.data.inventoryPaginationResponse.inventories;
          this.totalItems = response['data'].inventoryPaginationResponse.totalElements;
          this.inventories.map(x => {
            x['isEdit'] = false;
          })
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
          // this.dtTrigger.next();
        } else {
          this.inventories = [];
        }
      },
      (error) => {
        this.inventories = [];
      });
  }

  fetchAllColumns() {
    this.wmsService.fetchAllColumns(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.columns.length) {
          this.allColumns = response.data.columns;
        }
      },
      error => {
      }
    )
  }
  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locationsIDs = response.data.locations.map(locationname => locationname.locationName);
          this.locations = response.data.locations
        } else {
        }
      },
      (error) => {
        this.locations = [];
      });
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
          this.productIDNameValues = response.data.productMasters.map(productID => productID.productIDName);

        } else {
          this.products = [];
        }
      })
  }

  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
          this.suppliersIDs = response.data.supplierMasters.map(supplier => supplier.supplierIDName);
          this.getRole();
          //  this.rerender();
        }
      },
      (error) => {
        this.suppliers = [];
      });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getAllInventoriesForDownload(index?) {
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
          "searchKeyword": this.searchKey,
          "searchOnKeys": PaginationConstants.inventory,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }
        form['supplierIDName'] = this.supplierIDName
        const form2 = this.inventoryForm.value
        const final = { ...form, ...form2 }
        this.wmsService.findAllInventoriesWithPaginations(this.supplierID, final).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.inventoryPaginationResponse.inventories) {
              this.exportData = [...this.exportData, ...response.data.inventoryPaginationResponse.inventories];
              this.getAllInventoriesForDownload(i);
            }
          })
      }
    }
  }
  exportAsXLSX(key?) {
    if (this.permissionsList.includes('Update')) {
      if (key) {
        const changedTaskList = this.exportTypeMethod(null)
        this.excelService.exportAsExcelFile(changedTaskList, 'inventories', Constants.EXCEL_IGNORE_FIELDS.INVENTORYTABLE);
      } else {
        const changedTaskList = this.exportTypeMethod(this.exportData)
        this.excelService.exportAsExcelFile(changedTaskList, 'inventories', Constants.EXCEL_IGNORE_FIELDS.INVENTORYTABLE);
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        const obj = {}
        obj['productID'] = ele.productMasterInfo ? ele.productMasterInfo.productID : null
        obj['productDescription'] = ele.productDescription
        obj['inventoryUnit'] = ele.inventoryUnit
        obj['mfgDate'] = ele.mfgDate
        obj['expiryDate'] = ele.expiryDate
        obj['inventoryIDPrefix'] = ele.inventoryIDPrefix
        obj['inventoryID'] = ele.inventoryID
        obj['locationName'] = ele.locationInfo.locationName
        obj['quantityInventoryUnit'] = ele.quantityInventoryUnit
        obj['brandName'] = ele.brandName;
        obj['availableQuantity'] = DecimalUtils.fixedDecimal(ele.availableQuantity, 2)
        obj['storageUnit'] = ele.storageUnit
        obj['batchNumber'] = ele.batchNumber
        obj['createdDate'] = ele.createdDate
        obj['packingRemarks'] = ele.packingRemarks
        obj['productPurchasePrice'] = ele.productPurchasePrice
        obj['currency'] = ele.currency
        obj['avgCostPrice'] = ele.avgCostPrice
        obj['reservedQuantity'] = ele.reservedQuantity/* Reserved Quantity Added new download fields */
        obj['supplierID'] = ele.supplierMasterInfo ? ele.supplierMasterInfo.supplierID : null

        if (ele.supplierMasterInfo != null) {
          obj['City'] = ele.supplierMasterInfo.city
        }
        else {
          obj['City'] = null
        }
        if
          (this.serialNumberAllocation && this.serialNumberAllocation.serialNumberCheck === 'Yes') {
          obj['serialNumber'] = ele.serialNumber
        }
        obj['storageInstruction'] = ele.storageInstruction
        obj['billOfEntryDate'] = ele.billOfEntryDate ? this.wmsCommonService.getDateFromMilliSec(ele.billOfEntryDate) : null,
          obj['billOfEntryNumber'] = ele.billOfEntryNumber,
          obj['bondDate'] = ele.bondDate ? this.wmsCommonService.getDateFromMilliSec(ele.bondDate) : null,
          obj['bondNumber'] = ele.bondNumber,
          obj['invoiceDate'] = ele.invoiceDate ? this.wmsCommonService.getDateFromMilliSec(ele.invoiceDate) : null,
          obj['invoiceNumber'] = ele.invoiceNumber
        arr.push(obj)
      })
    }
    else {
      const obj = {}
      obj['productID'] = null
      obj['inventoryUnit'] = null
      obj['mfgDate'] = null
      obj['expiryDate'] = null
      obj['locationName'] = null
      obj['quantityInventoryUnit'] = null
      obj['brandName'] = null
      obj['availableQuantity'] = null
      obj['storageUnit'] = null
      obj['batchNumber'] = null
      obj['createdDate'] = null
      obj['packingRemarks'] = null
      obj['productPurchasePrice'] = null
      obj['currency'] = null
      obj['avgCostPrice'] = null
      obj['reservedQuantity'] = null
      obj['supplierID'] = null
      obj['City'] = null
      if (this.serialNumberAllocation && this.serialNumberAllocation.serialNumberCheck === 'Yes') {
        obj['serialNumber'] = null
      }
      obj['storageInstruction'] = null
      obj['billOfEntryDate'] = null,
        obj['billOfEntryNumber'] = null,
        obj['bondDate'] = null,
        obj['bondNumber'] = null,
        obj['invoiceDate'] = null,
        obj['invoiceNumber'] = null
      arr.push(obj)
    }
    return arr
  }
  /*
    exportAsXLSX() {
      const arr = [];
      if (this.inventories && this.inventories.length > 0) {
        const jsonData = this.inventories;
        if (this.serialNumberAllocation && this.serialNumberAllocation.serialNumberCheck === 'No') {
          jsonData.forEach(element => {
            delete element.serialNumber;
          });
          this.excelService.exportAsExcelFile(jsonData, 'Inventory', Constants.EXCEL_IGNORE_FIELDS.INVENTORYTABLE);
        }
        else{
          this.exportTypeMethod()
        }
    }
  }
  exportTypeMethod()
  {
    const arr = [];
      if (this.serialNumberAllocation && this.serialNumberAllocation.serialNumberCheck === 'Yes') {
        this.inventories.forEach(ele => {
          const obj = {}

          obj['productName'] = ele.productName
          obj['productIDName'] = ele.productIDName
          obj['productDescription'] = ele.productDescription
          obj['productConfiguration'] = ele.productConfiguration
          obj['type'] = ele.type
          obj['dfsCode'] = ele.dfsCode
          obj['inventoryUnit'] = ele.inventoryUnit
          obj['mfgDate'] = ele.mfgDate
          obj['locationName'] = ele.locationName
          obj['quantityInventoryUnit'] = ele.quantityInventoryUnit
          obj['availableQuantity'] = ele.availableQuantity
          obj['storageUnit'] = ele.storageUnit
          obj['batchNumber'] = ele.batchNumber
          obj['createdDate'] = ele.createdDate
          obj['stockValue'] = ele.stockValue
          obj['avgCostPrice'] = ele.avgCostPrice
          obj['inventoryAvailability'] = ele.inventoryAvailability
          obj['shelfLife'] = ele.shelfLife
          obj['supplierIDName'] = ele.supplierIDName
          arr.push(obj)
        })
      }
      else {
        const obj = {}
        obj['productName'] = null
        obj['productIDName'] = null
        obj['productDescription'] = null
        obj['productConfiguration'] = null
        obj['type'] = null
        obj['dfsCode'] = null
        obj['inventoryUnit'] = null
        obj['mfgDate'] = null
        obj['locationName'] = null
        obj['quantityInventoryUnit'] = null
        obj['availableQuantity'] = null
        obj['storageUnit'] = null
        obj['batchNumber'] = null
        obj['createdDate'] = null
        obj['stockValue'] = null
        obj['avgCostPrice'] = null
        obj['inventoryAvailability'] = null
        obj['shelfLife'] = null
        obj['supplierIDName'] = null
        arr.push(obj)
      }
      return arr
    } */

  getFile() {
    if (this.permissionsList.includes('Update')) {
      document.getElementById('upfile').click();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  uploadExcel = async (event) => {
    if (this.permissionsList.includes('Update')) {
      if (event.target.files && event.target.files[0]) {
        this.isShowOrHideError = false;
        const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.INVENTORY;
        await this.excelService.generateJsonUsingExcel(event, 'in');
        setTimeout(() => {
          const jsonData = this.excelService.getJsonData();
          if (jsonData.length > 0) {
            event.target.value = '';
            const missingParamsArray = this.mandatoryCheck(jsonData);
            if (missingParamsArray.length > 1) {
              this.failureRecords = missingParamsArray;
              this.missingParams = missingParamsArray.join(', ');
              this.toastr.error('Please download log file to fill mandatory fields');
            } else {
              let reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.INVENTORY);
              reqData.forEach(r => {
                if (r.productID) {
                  let produc = this.mapId('productID', r.productID);
                  if (produc) {
                    r['productMasterInfo']['productID'] = produc ? produc.productID : null
                    r['productMasterInfo']['productName'] = produc ? produc.productName : null
                    r['productMasterInfo']['productMasterID'] = produc ? produc._id : null
                    r['productMasterInfo']['productIDName'] = produc ? produc.productIDName : null
                  } else {
                    r['productMasterInfo']['productID'] = r.productID;
                    r['productMasterInfo']['productName'] = null;
                    r['productMasterInfo']['productMasterID'] = null;
                    r['productMasterInfo']['productIDName'] = null
                  }
                }
                if (r.supplierID) {
                  let supplier = this.mapId('supplierID', r.supplierID);
                  if (supplier) {
                    r['supplierMasterInfo']['supplierID'] = supplier.supplierID
                    r['supplierMasterInfo']['supplierName'] = supplier.supplierName;
                    r['supplierMasterInfo']['supplierMasterID'] = supplier._id;
                    r['supplierMasterInfo']['supplierIDName'] = supplier.supplierIDName;

                  } else {

                    r['supplierMasterInfo']['supplierID'] = r.supplierID;
                    r['supplierMasterInfo']['supplierName'] = null;
                    r['supplierMasterInfo']['supplierMasterID'] = null;
                    r['supplierMasterInfo']['supplierIDName'] = null
                  }
                }
                Object.keys(r).forEach((el, i) => {
                  r[el] = typeof (r[el]) === 'string' ? r[el].trim() : r[el];
                })
                /*  r['productMasterInfo'] = this.getProducMasterInfo(r); */

                r["organizationInfo"] = this.getOrganizationInfo();
                r["wareHouseInfo"] = this.getwarehouseMasterInfo();
                /*   r['supplierMasterInfo'] = this.getSupplierMasterInfo(r); */
                r['levelInfo'] = this.getLevelMasterInfo();
                r['locationInfo'] = this.getLocationMasterInfo();
                r['wareHouseInfo'] = this.getwarehouseMasterInfo();
                r['zoneInfo'] = this.getZoneMasterInfo();
                r['rackInfo'] = this.getRackMasterInfo();
                r['columnInfo'] = this.getColumnMasterInfo();
                r['productCategoryInfo'] = this.getProductCategoryMasterInfo();
                /*      let productMaster = this.mapId('productMaster', r.productIDName);
                     let supplierMaster = this.mapId('supplierMaster', r.supplierIDName); */
                /* if (productMaster && productMaster != null) {
                  r['productMasterInfo']['productID'] = productMaster.productID;
                  r['productMasterInfo']['productName'] = productMaster.productName;
                  r['productMasterInfo']['productMasterID'] = productMaster._id;
                  r['productMasterInfo']['productIDName'] = productMaster.productIDName;
                  r['productClass'] = productMaster.productClass;
                  r['productType'] = productMaster.productType;
                  r['productDescription'] = productMaster.productDescription;
                  r['productConfiguration'] = productMaster.productConfiguration;
                  r['type'] = productMaster.type;
                  r['dfsCode'] = productMaster.dfsCode;
                  r['storageInstruction'] = productMaster.storageInstruction;
                } */
                /*   if (supplierMaster && supplierMaster != null) {
                    r['supplierMasterInfo']['supplierID'] = supplierMaster.supplierID
                    r['supplierMasterInfo']['supplierName'] = supplierMaster.supplierName
                    r['supplierMasterInfo']['supplierMasterID'] = supplierMaster._id
                    r['supplierMasterInfo']['supplierIDName'] = supplierMaster.supplierIDName
                    r['supplierMasterInfo']['city'] = supplierMaster.city
                  } */
                r['locationInfo']['locationID'] = this.mapId('locationNames', r.locationName);
                r['locationInfo']['locationName'] = r.locationName;
                r['wareHouseInfo'] = this.mapId('wareHouseID', r.locationName);
                r['zoneInfo'] = this.mapId('zoneName', r.locationName);
                r['rackInfo'] = this.mapId('rackName', r.locationName);
                r['levelInfo'] = this.mapId('levelName', r.locationName);
                r['productCategoryInfo'] = this.mapId('productCategoryName', r.productIDName);
                r['columnInfo'] = this.mapId('column', r.locationName);
                r.availableQuantity = r.availableQuantity ? r.availableQuantity.toString() : null;
                r.batchNumber = r.batchNumber ? r.batchNumber.toString() : null;
                r.productPurchasePrice = r.productPurchasePrice ? r.productPurchasePrice.toString() : null;
                r.avgCostPrice = r.avgCostPrice ? r.avgCostPrice.toString() : null;
                r.reservedQuantity = r.reservedQuantity ? r.reservedQuantity.toString() : null;
                delete r.productMasterID
                delete r.productID
                delete r.productName
                delete r.productIDName
                delete r.productCategoryID
                delete r.productCategory
                delete r.productCategoryName
                delete r.wareHouseID
                delete r.wareHouseName
                delete r.zoneID
                delete r.zoneName
                delete r.rackID
                delete r.rackName
                delete r.levelID
                delete r.levelName
                delete r.supplierMasterID
                delete r.supplierID
                delete r.supplierName
                delete r.supplierIDName
                delete r.locationName
                delete r.locationID
                if (r.createdDate) {
                  const date = new Date(r.createdDate);
                  r.createdDate = date.setDate(date.getDate() + 1);
                }
                else {
                  r.createdDate = null;
                }
                if (r.mfgDate) {
                  const date = new Date(r.mfgDate);
                  r.mfgDate = date.setDate(date.getDate() + 1);
                }
                else {
                  r.mfgDate = null;
                }
                if (r.invoiceDate) {
                  const date = new Date(r.invoiceDate);
                  r.invoiceDate = date.setDate(date.getDate() + 1);
                }
                else {
                  r.invoiceDate = null;
                }
                if (r.bondDate) {
                  const date = new Date(r.bondDate);
                  r.bondDate = date.setDate(date.getDate() + 1);
                }
                else {
                  r.bondDate = null;
                }
                if (r.billOfEntryDate) {
                  const date = new Date(r.billOfEntryDate);
                  r.billOfEntryDate = date.setDate(date.getDate() + 1);
                }
                else {
                  r.billOfEntryDate = null;
                }
                if (r.expiryDate) {
                  const date = new Date(r.expiryDate);
                  r.expiryDate = date.setDate(date.getDate() + 1);
                }
                else {
                  r.expiryDate = null;
                }

                r.invoiceDate = r.invoiceDate ? new Date(r.invoiceDate) : null;
                r.billOfEntryDate = r.billOfEntryDate ? new Date(r.billOfEntryDate) : null;
                r.bondDate = r.bondDate ? new Date(r.bondDate) : null;
                if (r.billOfEntryNumber && r.billOfEntryDate) {
                  r['billOfEntryNumberDate'] = r['billOfEntryNumber'] + ':' + r['billOfEntryDate'];
                }
                r.createdDate = r.createdDate ? new Date(r.createdDate) : null;
                r.mfgDate = r.mfgDate ? new Date(r.mfgDate) : null;
                r.expiryDate = r.expiryDate ? new Date(r.expiryDate) : null;

                // r['productMasterInfo']['productIDName'] = r.productMasterInfo.productIDName ?  r.productMasterInfo.productIDName : null
                console.log(reqData);
              });
              this.excelRestService.inventoriesByExcelUpload(jsonData).subscribe(res => {
                if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.failureList &&
                  res.data.inventoryList.failureList.length > 0 && res.data.inventoryList.successList &&
                  res.data.inventoryList.successList.length > 0) {
                  this.failureRecords = res.data.inventoryList.failureList;
                  this.failureRecords = this.failureRecords.concat(res.data.inventoryList.duplicateList);
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.fetchAllInventories(1, 10);
                } else if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.failureList && res.data.inventoryList.failureList.length > 0) {
                  this.failureRecords = res.data.inventoryList.failureList;
                  this.failureRecords = this.failureRecords.concat(res.data.inventoryList.duplicateList);
                  this.toastr.error('Failed in uploading, Please download log for reasons');
                } else if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.failureList && res.data.inventoryList.failureList.length === 0) {
                  if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.duplicateList && res.data.inventoryList.duplicateList.length > 0) {
                    this.failureRecords = res.data.inventoryList.duplicateList;
                    this.toastr.error('Duplicates present in the excel, Please download log file.');
                    this.fetchAllInventories(1, 10);
                  } else {
                    this.fetchAllInventories(1, 10);
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
          }
        }, 500);
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }

  getProducMasterInfo(data) {
    console.log(data)
    return {
      "productMasterID": null,
      "productID": data.productID ? data.productID : null,
      "productName": null,
      "productIDName": data.productIDName ? data.productIDName : null,
    }
  }
  getOrganizationInfo() {
    return this.configService.getOrganization()

  }
  getWareHouseInfo() {
    return this.configService.getWarehouse()
  }
  getSupplierMasterInfo(data) {
    return {
      "supplierMasterID": null,
      "supplierID": data.supplierID ? data.supplierID : null,
      "supplierName": null,
      "supplierIDName": data.supplierIDName ? data.supplierIDName : null,
      "city": null
    }
  }
  getLevelMasterInfo() {
    return {
      "levelID": null,
      "levelName": null
    }
  }
  getLocationMasterInfo() {
    return {
      "locationID": null,
      "locationName": null
    }
  }
  getwarehouseMasterInfo() {
    return {
      "warehouseID": null,
      "wareHouseName": null
    }
  }
  getZoneMasterInfo() {
    return {
      "zoneID": null,
      "zoneName": null
    }
  }
  getRackMasterInfo() {
    return {
      "rackID": null,
      "RackName": null
    }
  }
  getColumnMasterInfo() {
    return {
      "columnID": null,
      "columnName": null,
      "height": null,
      "sequence": null,
      "width": null
    }
  }
  getProductCategoryMasterInfo() {
    return {
      "productCategory": null,
      "productCategoryName": null
    }
  }

  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.INVENTORY;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param] || record[param] === 0));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArray;
  }
  mapId(type, value, rackName?) {
    switch (type) {
      case 'locationNames': {
        const locationid = this.locations.find(w => w.locationName === value);
        return locationid && locationid._id ? locationid._id : null;
      }
      case 'productID': {
        const productIds = this.products.find(e => e.productID == value);
        console.log(productIds)
        return productIds ? productIds : null;
      }
      /*  case 'productMaster': {
         const productMaster = this.products.find(w => w.productIDName === value);
         return productMaster;
       } */
      case 'supplierMaster': {
        const supplierMaster = this.suppliers.find(w => w.supplierIDName === value);
        return supplierMaster;
      }
      case 'supplierID': {
        const supplierid = this.suppliers.find(w => w.supplierID == value);
        return supplierid ? supplierid : null;
      }
      case 'supplierName': {
        const suppliername = this.suppliers.find(w => w.supplierIDName === value);
        return suppliername && suppliername.supplierName ? suppliername.supplierName : null;
      }
      case 'suppliertMasterID': {
        const suppliermasterid = this.suppliers.find(w => w.supplierIDName === value);
        return suppliermasterid && suppliermasterid._id ? suppliermasterid._id : null;
      }
      case 'supplierIDName': {
        const supplieridname = this.suppliers.find(w => w.supplierIDName === value);
        return supplieridname && supplieridname.supplierIDName ? supplieridname.supplierIDName : null;
      }
      case 'wareHouseID': {
        const locationid = this.locations.find(w => w.locationName === value);
        return locationid && locationid.wareHouseInfo ? locationid.wareHouseInfo : null
      }
      /*   case 'wareHouseName': {
          const warehousename = this.wareHouses.find(w => w.wareHouseName === value);
          return warehousename && warehousename.wareHouseName ? warehousename.wareHouseName : null;
        } */
      case 'zoneName': {
        const zone = this.locations.find(w => w.locationName === value);
        return zone && zone.zoneInfo ? zone.zoneInfo : null;
      }
      case 'rackName': {
        const rack = this.locations.find(w => w.locationName === value);
        return rack && rack.rackInfo ? rack.rackInfo : null;
      }
      case 'levelName': {
        const level = this.locations.find(w => w.locationName === value);
        return level && level.levelInfo ? level.levelInfo : null;
      }
      /*  case 'productIDName': {
         const productidname = this.products.find(w => w.productIDName === value);
         return productidname && productidname.productIDName ? productidname.productIDName : null;
       } */
      case 'productCategoryName': {
        const category = this.products.find(w => w.productIDName === value);
        return category && category.productCategoryInfo ? category.productCategoryInfo : null;
      }
      case 'column': {
        const column = this.locations.find(w => w.locationName === value);
        return column && column.columnInfo ? column.columnInfo : null;
      }

    }
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
        fileName: "Inventory Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
    if (this.missingParams) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Inventory Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }



}
