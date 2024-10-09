import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData, CompleterService } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/constants/constants';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Storage } from 'src/app/shared/utils/storage';
import { CommonService } from 'src/app/shared/services/common.service';
import { ExcelService } from 'src/app/shared/services/excel.service';

@Component({
  selector: 'app-inventory-report',
  templateUrl: './inventory-report.component.html',
  styleUrls: ['./inventory-report.component.scss']
})
export class InventoryReportComponent implements OnInit {
  tableHeadings: any = ['S.No', 'Inventory ID', 'Product ID', 'Product Name', 'Product Description', 'UOM', 'Brand Name', 'Mfg Date', 'Expiry Date', 'Batch Number', 'Serial Number', 'Quantity Inventory Unit', 'Available Quantity',
  'Reserved Quantity', 'Supplier/Warehouse IDName', 'Location Name', 'Zone Name', 'Rack Name', 'Level Name', 'Column', 'Remarks', 'Product Purchase Price',
  'Stock Value', 'product Category',  'Product Type', 'Product Class',
  'Created Date', 'Inventory Availabilty', 'Action']
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  inventories: any[] = [];
  supplierID: any = '';
  inventoryKeys: any[] = ['', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', ''];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  missingParams: any;
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
  constructor(
    private wmsService: WMSService, private configService: ConfigurationService,
    private commonService: CommonService, public datepipe: DatePipe,
    private excelService: ExcelService, private toastr: ToastrService,
    private excelRestService: ExcelRestService,
    private completerService: CompleterService, private inboundMasterDataService: InboundMasterDataService,
    private metaDataService: MetaDataService,
    private translate: TranslateService, private fb: FormBuilder) {
    this.translate.use(this.language);
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
              this.fetchAllInventories();
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
    let arr: any = PaginationConstants['inventoryBindArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
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
          this.loopToStop = response['data'].inventoryPaginationResponse.totalPages + 1;
          const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          count.forEach(el => {
            if (lengthofTotalItems == el) {
              let value: any = 1 + this.configService.addZerosMethod(el);
              this.dataPerPage = parseInt(value);
            }
          });
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
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        const obj = {}
        obj['Product ID'] = ele.productMasterInfo.productID
        obj['Product Name'] = ele.productMasterInfo.productName
        obj['productDescription'] = ele.productDescription
        obj['inventoryUnit'] = ele.inventoryUnit
        obj['mfgDate'] = ele.mfgDate
        obj['expiryDate'] = ele.expiryDate
        obj['locationName'] = ele.locationInfo.locationName
        obj['quantityInventoryUnit'] = ele.quantityInventoryUnit
        obj['brandName'] = ele.brandName;
        obj['availableQuantity'] = ele.availableQuantity
        obj['storageUnit'] = ele.storageUnit
        obj['batchNumber'] = ele.batchNumber
        obj['createdDate'] = ele.createdDate
        obj['packingRemarks'] = ele.packingRemarks
        obj['productPurchasePrice'] = ele.productPurchasePrice
        obj['currency'] = ele.currency
        obj['avgCostPrice'] = ele.avgCostPrice
        obj['reservedQuantity'] = ele.reservedQuantity/* Reserved Quantity Added new download fields */
        if (ele.supplierMasterInfo != null) {
          obj['supplierIDName'] = ele.supplierMasterInfo.supplierIDName
        }
        else {
          obj['supplierIDName'] = null
        }
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
        obj['remarks'] = ele.packingRemarks
        arr.push(obj)
      })
    }
    else {
      const obj = {}
      obj['Product ID'] = null
      obj['Product Name'] = null
      obj['productDescription'] = null
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
      obj['supplierIDName'] = null
      obj['City'] = null
      if (this.serialNumberAllocation && this.serialNumberAllocation.serialNumberCheck === 'Yes') {
        obj['serialNumber'] = null
      }
      obj['storageInstruction'] = null
      obj['remarks'] = null
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
              // let reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.INVENTORY);
              let reqData = jsonData;
              reqData.forEach(r => {
                Object.keys(r).forEach((el, i) => {
                  r[el] = typeof (r[el]) === 'string' ? r[el].trim() : r[el];
                })
                r['productMasterInfo'] = this.getProducMasterInfo(r);
                r["organizationInfo"] = this.getOrganizationInfo();
                r["wareHouseInfo"] = this.getwarehouseMasterInfo();
                r['supplierMasterInfo'] = this.getSupplierMasterInfo(r);
                r['levelInfo'] = this.getLevelMasterInfo();
                r['locationInfo'] = this.getLocationMasterInfo();
                r['wareHouseInfo'] = this.getwarehouseMasterInfo();
                r['zoneInfo'] = this.getZoneMasterInfo();
                r['rackInfo'] = this.getRackMasterInfo();
                r['columnInfo'] = this.getColumnMasterInfo();
                r['productCategoryInfo'] = this.getProductCategoryMasterInfo();
                let productMaster = this.mapId('productMaster', r.productIDName);
                let supplierMaster = this.mapId('supplierMaster', r.supplierIDName);
                if (productMaster && productMaster != null) {
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
                }
                if (supplierMaster && supplierMaster != null) {
                  r['supplierMasterInfo']['supplierID'] = supplierMaster.supplierID
                  r['supplierMasterInfo']['supplierName'] = supplierMaster.supplierName
                  r['supplierMasterInfo']['supplierMasterID'] = supplierMaster._id
                  r['supplierMasterInfo']['supplierIDName'] = supplierMaster.supplierIDName
                  r['supplierMasterInfo']['city'] = supplierMaster.city
                }
                r['locationInfo']['locationID'] = this.mapId('locationNames', r.locationName);
                r['locationInfo']['locationName'] = r.locationName;
                r['wareHouseInfo'] = this.mapId('wareHouseID', r.locationName);
                r['zoneInfo'] = this.mapId('zoneName', r.locationName);
                r['rackInfo'] = this.mapId('rackName', r.locationName);
                r['levelInfo'] = this.mapId('levelName', r.locationName);
                r['productCategoryInfo'] = this.mapId('productCategoryName', r.productIDName);
                r['columnInfo'] = this.mapId('column', r.locationName);
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
                if (r.expiryDate) {
                  const date = new Date(r.expiryDate);
                  r.expiryDate = date.setDate(date.getDate() + 1);
                }
                else {
                  r.expiryDate = null;
                }

                r.createdDate = r.createdDate ? new Date(r.createdDate) : null;
                r.mfgDate = r.mfgDate ? new Date(r.mfgDate) : null;
                r.expiryDate = r.expiryDate ? new Date(r.expiryDate) : null;

                // r['productMasterInfo']['productIDName'] = r.productMasterInfo.productIDName ?  r.productMasterInfo.productIDName : null
              });
              this.excelRestService.inventoriesByExcelUpload(reqData).subscribe(res => {
                if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.failureList &&
                  res.data.inventoryList.failureList.length > 0 && res.data.inventoryList.successList &&
                  res.data.inventoryList.successList.length > 0) {
                  this.failureRecords = res.data.inventoryList.failureList;
                  this.failureRecords = this.failureRecords.concat(res.data.inventoryList.duplicateList);
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.fetchAllInventories();
                } else if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.failureList && res.data.inventoryList.failureList.length > 0) {
                  this.failureRecords = res.data.inventoryList.failureList;
                  this.failureRecords = this.failureRecords.concat(res.data.inventoryList.duplicateList);
                  this.toastr.error('Failed in uploading, Please download log for reasons');
                } else if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.failureList && res.data.inventoryList.failureList.length === 0) {
                  if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.duplicateList && res.data.inventoryList.duplicateList.length > 0) {
                    this.failureRecords = res.data.inventoryList.duplicateList;
                    this.toastr.error('Duplicates present in the excel, Please download log file.');
                    this.fetchAllInventories();
                  } else {

                    this.fetchAllInventories();

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
      "productID": null,
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
      "supplierID": null,
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
      case 'productMaster': {
        const productMaster = this.products.find(w => w.productIDName === value);
        return productMaster;
      }
      case 'supplierMaster': {
        const supplierMaster = this.suppliers.find(w => w.supplierIDName === value);
        return supplierMaster;
      }
      case 'supplierID': {
        const supplierid = this.suppliers.find(w => w.supplierIDName === value);
        return supplierid && supplierid.supplierID ? supplierid.supplierID : null;
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
      case 'productIDName': {
        const productidname = this.products.find(w => w.productIDName === value);
        return productidname && productidname.productIDName ? productidname.productIDName : null;
      }
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
