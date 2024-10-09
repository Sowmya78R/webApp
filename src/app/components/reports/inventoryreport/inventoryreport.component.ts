import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData, CompleterService } from 'ng2-completer';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { Constants } from 'src/app/constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';


@Component({
  selector: 'app-inventoryreport',
  templateUrl: './inventoryreport.component.html',
  styleUrls: ['./inventoryreport.component.scss']
})
export class InventoryreportComponent implements OnInit ,OnDestroy{
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  inventories: any[] = [];

  supplierID: any = '';
  inventoryKeys: any[] = ['S.No', 'Product ID/Name', 'Product Name', 'Serial Number', 'product Category', 'Product Type',
    'Product Class', 'Supplier ID Name', 'Product Description', 'Product Configuration', 'DFC Code', 'Quantity Inventory Unit', 'Type', 'Warehouse Name',
    'Zone Name', 'Rack Name', 'Level Name', 'Location Name', 'Column', 'Created Date', 'Storage Unit', 'Inventory Unit',
    'Available Quantity', 'Reserved Quantity', 'Batch Number', 'Mfg Date', 'Expiry Date', 'Shelf Life', 'Stock Value',
    'Avg Cost Price', 'Inventory Availabilty'];
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
  locations: any;
  productIDNames: any;
  products: any;
  suppliers: any;

  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inventory', 'Inventory', Storage.getSessionUser());
    forPermissionsSubscription:any;

  constructor(
    private wmsService: WMSService, private configService: ConfigurationService,
    private commonService: CommonService,
    private excelService: ExcelService, private toastr: ToastrService,
    private excelRestService: ExcelRestService,
    private completerService: CompleterService,
    private metaDataService: MetaDataService) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
   this.forPermissionsSubscription= this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
          this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
            'Inventory', 'Inventory', Storage.getSessionUser());
        }
        this.getFunctionsCall();
      }
    })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.fetchAllInventories();
      this.fetchAllSupplierDetails();
      this.fetchAllLevels();
      this.fetchAllRacks();
      this.fetchAllZones();
      this.fetchAllWarehouseDetails();
      this.fetchAllProductCategories();
      this.fetchAllColumns();
      this.fetchAllLocations();
      this.fetchAllProducts();
    }

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
  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.racksList = response.data.racks;
          this.rackNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.racks, 'rackName'));
        } else {
          this.racksList = [];
        }
      },
      (error) => {
        this.racksList = [];
      });
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones) {
          this.zones = response.data.zones;
          this.zoneNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.zones, 'zoneName', 'sequenceNumber'));
        } else {
          this.zones = [];
        }
      },
      (error) => {
        this.zones = [];
      });
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouses = response.data.wareHouses;
          console.log(this.wareHouses)
          this.wareHouseNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.wareHouses, 'wareHouseName', 'wareHouseID'));
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
        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
  fetchAllInventories() {
    this.wmsService.findAllInventories(this.supplierID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventories) {
          this.inventories = response.data.inventories;

          this.dtTrigger.next();
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
          this.locations = response.data.locations;
          // this.dtTrigger.next();
        } else {
          this.locations = [];
        }
      },
      (error) => {
        this.locations = [];
      });
  }
  productIDNameValues: CompleterData;

  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;

          this.productIDNameValues = this.completerService.local(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.productMasters, 'productIDName'));

        } else {
          this.products = [];
        }
      })
  }

  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
          //  this.rerender();
        }
      },
      (error) => {
        this.suppliers = [];
      });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.forPermissionsSubscription.unsubscribe();
  }
  /*   exportAsXLSX() {
      if (this.inventories.length) {
        this.excelService.exportAsExcelFile(this.inventories, 'Inventory', Constants.EXCEL_IGNORE_FIELDS.INVENTORYTABLE);
      } else {
        this.toastr.error('No data available');
      }
    } */

  exportAsXLSX() {
    if (this.inventories.length > 0) {
      console.log(this.inventories)
      const changedTaskList = this.exportTypeMethod(this.inventories)
      console.log(changedTaskList)
      this.excelService.exportAsExcelFile(changedTaskList, 'inventories', Constants.EXCEL_IGNORE_FIELDS.VEHICLEBYSERVICEPROVIDER);
    } else {
      this.toastr.error('No data found');
    }
  }

  exportTypeMethod(data) {
    const obj = {}
    const arr = [];
    data.forEach(ele => {
      console.log(ele)
      if (ele && ele.length > 0 && ele != null && ele != undefined) {
        if (ele) {
          obj['Product ID Name'] = ele.productMasterInfo.productIDName;
          obj['Product Name'] = ele.productMasterInfo.productName
          obj['Serial Number'] = ele.serialNumber
          obj['Product Category Name'] = ele.productCategoryInfo.productCategoryName
          obj['Product Type'] = ele.productType
          obj['Product Class'] = ele.productClass
          obj['Supplier ID Name'] = ele.supplierMasterInfo.supplierIDName
          obj['Dfs Code'] = ele.dfsCode
          obj['Quantity Inventory Unit'] = ele.quantityInventoryUnit
          obj['Type'] = ele.type
          obj['WareHouse Name'] = ele.wareHouseInfo.wareHouseName
          obj['Zone Name'] = ele.zoneInfo.zoneName
          obj['Rack Name'] = ele.rackInfo.rackName
          obj['Level Name'] = ele.levelInfo.levelName
          obj['Location Name'] = ele.locationInfo.locationName
          obj['Column Name'] = ele.columnInfo.columnName
          obj['Created Date'] = ele.createdDate
          obj['Storage Unit'] = ele.storageUnit
          obj['Inventory Unit'] = ele.inventoryUnit
          obj['Available Quantity'] = ele.availableQuantity
          obj['Reserved Quantity'] = ele.reservedQuantity
          obj['Batch Number'] = ele.batchNumber
          obj['Mfg Date'] = ele.mfgDate
          obj['Remaining Shelf Life'] = ele.remainingShelfLife
          obj['Available Quantity'] = ele.availableQuantity
          obj['Avg Cost Price'] = ele.avgCostPrice
          obj['Inventory Availability'] = ele.inventoryAvailability
          obj['Expiry Date'] = ele.expiryDate

          arr.push(obj)
        } else {
          obj['Product ID Name'] = null
          obj['Product Name'] = null
          obj['Serial Number'] = null
          obj['Product Category Name'] = null
          obj['Product Type'] = null
          obj['Product Class'] = null
          obj['Supplier ID Name'] = null
          obj['Dfs Code'] = null
          obj['Quantity Inventory Unit'] = null
          obj['Type'] = null
          obj['WareHouse Name'] = null
          obj['Zone Name'] = null
          obj['Rack Name'] = null
          obj['Level Name'] = null
          obj['Location Name'] = null
          obj['Column Name'] = null
          obj['Created Date'] = null
          obj['Storage Unit'] = null
          obj['Inventory Unit'] = null
          obj['Available Quantity'] = null
          obj['Reserved Quantity'] = null
          obj['Batch Number'] = null
          obj['Mfg Date'] = null
          obj['Remaining Shelf Life'] = null
          obj['Available Quantity'] = null
          obj['Avg Cost Price'] = null
          obj['Inventory Availability'] = null
          obj['Expiry Date'] = null
          arr.push(obj)
        }
      }
      else {
        const obj = {}
        obj['Product ID Name'] = ele.productMasterInfo.productIDName;
        obj['Product Name'] = ele.productMasterInfo.productName
        obj['Serial Number'] = ele.serialNumber
        obj['Product Category Name'] = ele.productCategoryInfo.productCategoryName
        obj['Product Type'] = ele.productType
        obj['Product Class'] = ele.productClass
        obj['Supplier ID Name'] = ele.supplierMasterInfo.supplierIDName
        obj['Dfs Code'] = ele.dfsCode
        obj['Quantity Inventory Unit'] = ele.quantityInventoryUnit
        obj['Type'] = ele.type
        obj['WareHouse Name'] = ele.wareHouseInfo.wareHouseName
        obj['Zone Name'] = ele.zoneInfo.zoneName
        obj['Rack Name'] = ele.rackInfo.rackName
        obj['Level Name'] = ele.levelInfo.levelName
        obj['Location Name'] = ele.locationInfo.locationName
        obj['Column Name'] = ele.columnInfo.columnName
        obj['Created Date'] = ele.createdDate
        obj['Storage Unit'] = ele.storageUnit
        obj['Inventory Unit'] = ele.inventoryUnit
        obj['Available Quantity'] = ele.availableQuantity
        obj['Reserved Quantity'] = ele.reservedQuantity
        obj['Batch Number'] = ele.batchNumber
        obj['Mfg Date'] = ele.mfgDate
        obj['Remaining Shelf Life'] = ele.remainingShelfLife
        obj['Available Quantity'] = ele.availableQuantity
        obj['Avg Cost Price'] = ele.avgCostPrice
        obj['Inventory Availability'] = ele.inventoryAvailability
        obj['Expiry Date'] = ele.expiryDate
        arr.push(obj)
      }
    })
    return arr
  }

  getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.INVENTORY;
      await this.excelService.generateJsonUsingExcel(event);
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
            /*  reqData = this.excelService.deleteUnRequiredParams(reqData, ['levelName', 'rackName', 'storageTypeCode', 'storageTypeDescription',
                'wareHouseName', 'zoneName', 'binName']); */
            reqData.forEach(r => {
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

              r['productMasterInfo']['productID'] = this.mapId('productID', r.productMasterInfo.productIDName);
              r['productMasterInfo']['productName'] = this.mapId('productName', r.productMasterInfo.productIDName);
              r['productMasterInfo']['productMasterID'] = this.mapId('productMasterID', r.productMasterInfo.productIDName);
              r['productMasterInfo']['productIDName'] = this.mapId('productIDName', r.productMasterInfo.productIDName);
              r['productMasterInfo']['productClass'] = this.mapId('productClass', r.productMasterInfo.productIDName);
              r['productMasterInfo']['productType'] = this.mapId('productType', r.productMasterInfo.productIDName);
              r['productMasterInfo']['productDescription'] = this.mapId('productDescription', r.productMasterInfo.productIDName);
              r['productMasterInfo']['productConfiguration'] = this.mapId('productConfiguration', r.productMasterInfo.productIDName);
              r['productMasterInfo']['type'] = this.mapId('type', r.productMasterInfo.productIDName);
              r['productMasterInfo']['dfsCode'] = this.mapId('dfsCode', r.productMasterInfo.productIDName);
              r['supplierMasterInfo']['supplierID'] = this.mapId('supplierID', r.supplierMasterInfo.supplierIDName);
              r['supplierMasterInfo']['supplierName'] = this.mapId('supplierName', r.supplierMasterInfo.supplierIDName);
              r['supplierMasterInfo']['suppliertMasterID'] = this.mapId('suppliertMasterID', r.supplierMasterInfo.supplierIDName);
              r['supplierMasterInfo']['supplierIDName'] = this.mapId('supplierIDName', r.supplierMasterInfo.supplierIDName);

              r['locationInfo']['locationID'] = this.mapId('locationNames', r.locationInfo.locationName);
              r['wareHouseInfo'] = this.mapId('wareHouseID', r.locationInfo.locationName);
              r['zoneInfo'] = this.mapId('zoneName', r.locationInfo.locationName);
              r['rackInfo'] = this.mapId('rackName', r.locationInfo.locationName);
              r['levelInfo'] = this.mapId('levelName', r.locationInfo.locationName);
              r['productCategoryInfo'] = this.mapId('productCategoryName', r.productMasterInfo.productIDName);
              r['columnInfo'] = this.mapId('column', r.locationInfo.locationName);
            });
            this.excelRestService.inventoriesByExcelUpload(reqData).subscribe(res => {
              if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.failureList &&
                res.data.inventoryList.failureList.length > 0 && res.data.inventoryList.successList &&
                res.data.inventoryList.successList.length > 0) {
                this.failureRecords = res.data.inventoryList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.inventoryList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.failureList && res.data.inventoryList.failureList.length > 0) {
                this.failureRecords = res.data.inventoryList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.inventoryList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.failureList && res.data.inventoryList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.inventoryList && res.data.inventoryList.duplicateList && res.data.inventoryList.duplicateList.length > 0) {
                  this.failureRecords = res.data.inventoryList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                } else {
                  this.toastr.success('Uploaded successfully');
                  this.fetchAllInventories();
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
      case 'productClass': {
        const productclass = this.products.find(w => w.productIDName === value);
        return productclass && productclass.productClass ? productclass.productClass : null;
      }
      case 'productType': {
        const producttype = this.products.find(w => w.productIDName === value);
        return producttype && producttype.productType ? producttype.productType : null;
      }
      case 'productName': {
        const productname = this.products.find(w => w.productIDName === value);
        return productname && productname.productIDName ? productname.productIDName : null;
      }
      case 'productID': {
        const productid = this.products.find(w => w.productIDName === value);
        return productid && productid.productID ? productid.productID : null;
      }
      case 'productMasterID': {
        const productmasterid = this.products.find(w => w.productIDName === value);
        return productmasterid && productmasterid._id ? productmasterid._id : null;
      }
      // r['productMasterInfo']['productID'] = this.mapId('productID', r.productMasterInfo.productIDName);
      case 'productIDName': {
        const productidname = this.products.find(w => w.productIDName === value);
        return productidname && productidname.productIDName ? productidname.productIDName : null;
      }
      case 'productDescription': {
        const productidname = this.products.find(w => w.productIDName === value);
        return productidname && productidname.productDescription ? productidname.productDescription : null;
      }
      case 'productConfiguration': {
        const productidname = this.products.find(w => w.productIDName === value);
        return productidname && productidname.productConfiguration ? productidname.productConfiguration : null;
      }
      case 'type': {
        const productidname = this.products.find(w => w.productIDName === value);
        return productidname && productidname.type ? productidname.type : null;
      }
      case 'dfsCode': {
        const productidname = this.products.find(w => w.productIDName === value);
        return productidname && productidname.dfsCode ? productidname.dfsCode : null;
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
