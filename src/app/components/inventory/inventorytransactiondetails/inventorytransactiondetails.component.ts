import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Constants } from 'src/app/constants/constants';
import { CompleterData } from 'ng2-completer';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DatePipe } from '@angular/common';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { inventoryTransactionDetails } from 'src/app/constants/paginationConstants';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';

@Component({
  selector: 'app-inventorytransactiondetails',
  templateUrl: './inventorytransactiondetails.component.html',
  styleUrls: ['./inventorytransactiondetails.component.scss']
})
export class InventorytransactiondetailsComponent implements OnInit {

  inventoryTransactionDetailsForm: FormGroup

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  inventoryByTransactionForm: FormGroup;
  permissionsList = this.configService.getPermissions("mainFunctionalities", "Inventory", "Inventory Transactions Details", Storage.getSessionUser());
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData;
  products: any = [];
  inventoryData: any;
  productData: any;
  inventoryTransactionsList: any;
  inventoryTransactionDetailsList: any;
  formObj = this.configService.getGlobalpayload();
  suppliers: any = [];
  supplierIDName: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  showTooltip: any = false;

  inventoryTransactiontableHeadings: any = ['S.No','Image', 'Transaction Details ID', 'Supplier/Customer/Warehouse IDName', 'UOM', 'Quantity', 'Transaction Type', 'Transaction Date & Time'
    , 'Status', 'Transaction ID', 'Order ID', 'Line Number', 'Product ID', 'Product Name', 'Product Description', 'Brand Name', 'Quantity', 'Manufacturing Date', 'Expiry Date',
    'Batch Number', 'Product Purchase Price', 'Product Sales Price', 'Currency', 'Zone Name', 'Rack Name', 'Column Name', 'Level Name', 'Location Name',
    'BOE No', 'BOE Date', 'Invoice Number', 'Invoice Date', 'Bond Number', 'Bond Date', 'Ex Bond Number', 'Ex Bond Date', 'Product Category Name']
  dummyorderID: any = null;

  pageForOrder = 1;
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

  onFiltering(e) {
    let query: Query = new Query();
    query = (e.text !== '') ? query.where('text', 'contains', e.text, true) : query;
    e.updateData(this.products, query);
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
            this.pageForOrder += 1;
            const form = {
              "page": this.pageForOrder,
              "pageSize": 10,
              "organizationIDName": this.formObj.organizationIDName,
              "wareHouseIDName": this.formObj.wareHouseIDName,
              "searchOnKeys": null,
              "searchKeyword": null,
              "transactionType": this.inventoryTransactionDetailsForm.controls.transactionType.value
            }
            this.wmsService.fetchOrderIDsForInvType(form).subscribe(response => {
              if (response && response.status === 0 && response.data.inventoryTransactionPaginationResponse.inventoryTransactionOrderNumber) {
                this.paginationStop = response.data.inventoryTransactionPaginationResponse.inventoryTransactionOrderNumber.length == 0 ? true : false;
                if (!this.paginationStop) {
                  const arr = response.data.inventoryTransactionPaginationResponse.inventoryTransactionOrderNumber;
                  if (this.products.length > 0) {
                    let index = this.products.length;
                    arr.forEach((v, i) => {
                      i = index;
                      if (!this.products.find(x => x.text == v.fullOrderID)) {
                        this.products.push({ text: v.fullOrderID, id: i });
                        index += 1;
                      }
                    });
                  }
                  else {
                    this.products = arr.map((v, i) => ({ text: v.fullOrderID, id: i }));
                  }
                  new DataManager(this.products)
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
                this.products = [];
              }
            })
          }
        }
      });
    }
  }
  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private IBMDService: InboundMasterDataService,
    private excelService: ExcelService, private fb: FormBuilder, public datepipe: DatePipe,
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
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createInventoryTransactionDetailstForm();
      this.fetchAllSuppliers();
      this.fetchAllCustomers();
      this.fetchAllWarehouseDetails();
      this.fetchAllSupplierDetails();
      this.fetchAllProducts();
      this.fetchAllZones();
      this.fetchAllLocations();
      this.fetchAllRacks();
    }
  }
  supplierIDNames: any[]
  fetchAllSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierIDNames = response.data.supplierMasters.map(x => x.supplierIDName)
        }
      })
  }
  customersIDsList: any = []
  fetchAllCustomers() {
    this.IBMDService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.customers.length > 0) {
          this.customersIDsList = response.data.customers.map(x => x.customerIDName);
          this.rerender();
        } else {
        }
      },
      (error) => {
      });
  }
  wareHouseIDNamesList: any = [];
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseIDNamesList = response.data.wareHouses.map(warehouse => warehouse.wareHouseIDName);

        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
          this.getRole();
        }
      },
      (error) => {
      });
  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      this.supplierIDName = (role === 'SUPPLIER') ? this.suppliers.find(x => x.supplierEmailID == user.username).supplierIDName : null;
      console.log(this.supplierIDName);
      this.generate(1, this.itemsPerPage);
    }
  }
  productIDs: CompleterData
  zonesIDs: CompleterData
  racksIDs: CompleterData
  locationsIDs: CompleterData
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.productIDs = response.data.productMasters.map(w => w.productIDName);
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {

          if (response.data.zones.length > 0) {
            this.zonesIDs = response.data.zones.map(x => x.zoneName);
          } else {
          }
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.racksIDs = response.data.racks.map(q => q.rackName);
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locationsIDs = response.data.locations.map(l => l.locationName);
          this.dtTrigger.next();
        } else {
        }
      },
      (error) => {
      });
  }
  createInventoryTransactionDetailstForm() {
    this.inventoryTransactionDetailsForm = this.fb.group({
      transactionType: null,
      productIDNames: null,
      orderID: this.globaOrderID ? this.globaOrderID : null,
      supplierIDNames: null,
      customerIDNames: null,
      wareHouseIDNames: null,
      zoneNames: null,
      rackNames: null,
      locationNames: null,
      transactionDateTimeFrom: null,
      transactionDateTimeTo: null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName

    })
  }
  newReqObj={
    dummyorderID : null
  }
  globaOrderID:any;
  newFunctionToExecute(dummyorderID) {
   
    console.log(dummyorderID);
    var thestring = dummyorderID
    var thenum = thestring.match(/\d+/g).join('');
//var thenum = thestring.replace(/^.*(\d+).*$/i,'$1');
    this.globaOrderID = Number(thenum);
    console.log("OrderIDNumber" + thenum)
}
  accessOrderID(event) {
    this.newFunctionToExecute(event.itemData.text)
    console.log(event);
    if (event && event.itemData) {
      this.inventoryTransactionDetailsForm.controls.orderID.setValue(Number(this.globaOrderID));
    }
  }

  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  }

  ngAfterViewInit(): void {
  }
  searchKey: any = null;
  totalItems: any;
  generate(page?, pageSize?) {
    const form = {
      "transactionType": null,
      "orderID": null,
      "transactionDateTimeFrom": null,
      "transactionDateTimeTo": null,
      "page": page ? page : 1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": inventoryTransactionDetails.InventoryTransactionDetailsKeys,
      "sortDirection": null,
      "sortFields": null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
    }
    const form2 = this.inventoryTransactionDetailsForm.value;
    const final = { ...form, ...form2 }
    this.wmsService.fetchAllInventoryTransactionDetailsPagination(final).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryTransactionDetailsPaginationResponse) {
          this.inventoryTransactionDetailsList = response.data.inventoryTransactionDetailsPaginationResponse.inventoryTransactionDetailsList;

          this.inventoryTransactionDetailsList = this.excelService.formatJSONForHeaderLines
            (this.inventoryTransactionDetailsList, 'inventoryTransactions');
          this.totalItems = response.data.inventoryTransactionDetailsPaginationResponse.totalElements;
          this.rerender();
          this.dtTrigger.next();
        }
      },
      (error) => {
      });
  }
  clear() {
    this.inventoryTransactionDetailsForm.reset();
    this.createInventoryTransactionDetailstForm();
    this.newReqObj.dummyorderID = null
    this.generate(1, this.itemsPerPage);
  }
  
  getOrderIDs() {
    this.products = [];
    this.pageForOrder = 1;
    this.paginationStop = false;
    const form = {
      "page": this.pageForOrder,
      "pageSize": 10,
      "searchKeyword": null,
      "searchOnKeys": null,
      "sortFields": null,
      "sortDirection": null,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "transactionType": this.inventoryTransactionDetailsForm.controls.transactionType.value
    }
    this.wmsService.fetchOrderIDsForInvType(form).subscribe(response => {
      if (response && response.status === 0 && response.data.inventoryTransactionPaginationResponse.inventoryTransactionOrderNumber) {
        const arr = response.data.inventoryTransactionPaginationResponse.inventoryTransactionOrderNumber;
        if (this.products.length > 0) {
          let index = this.products.length;
          arr.forEach((v, i) => {
            i = index;
            if (!this.products.find(x => x.text == v.fullOrderID)) {
              this.products.push({ text: v.fullOrderID, id: i });
              index += 1;
            }
          });
        }
        else {
          this.products = arr.map((v, i) => ({ text: v.fullOrderID, id: i }));
        }
      }
      else {
        this.products = [];
      }
    })
    this.newReqObj.dummyorderID = null
  }
  /*   rerender(): void {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger.next();
      });
    } */
  /*
    exportAsXLSX() {
      if (this.inventoryTransactionDetailsList.length) {
        this.excelService.exportAsExcelFile(this.inventoryTransactionDetailsList,
          'Inventory By Transaction', Constants.EXCEL_IGNORE_FIELDS.INVENTORYBYTRANSACTIONDETAILS);
      } else {
        this.toastr.error('No data available');
      }
    } */


  exportAsXLSX() {
    console.log(this.inventoryTransactionDetailsList)
    const changedTaskList = this.exportTypeMethod(this.inventoryTransactionDetailsList)
    this.excelService.exportAsExcelFile(changedTaskList, 'inventories', null);
  }
  exportTypeMethod(data) {
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        const obj = {}
        obj['Inventory Transaction Details ID'] = ele.inventoryTransactionDetailsID
        if (ele.supplierMasterInfo == null) {
          obj['Supplier ID Name'] = null
        }
        else {
          obj['Supplier ID Name'] = ele.supplierMasterInfo.supplierIDName
        }
        obj['Quantity'] = ele.totalQuantity
        obj['Transaction Type'] = ele.transactionType
        obj['Transaction Date Time'] = ele.transactionDateTime
        obj['Status'] = ele.status
        obj['Transaction ID'] = ele.inventoryTransactionID
        obj['Order ID'] = ele.orderID
        obj['Line Number'] = ele.lineNumber
        obj['Product ID'] = ele.productMasterInfo.productID
        obj['Product Name'] = ele.productMasterInfo.productName
        obj['Quantity'] = ele.quantity
        obj['WareHouse Name'] = ele.wareHouseInfo.wareHouseName
        obj['Zone Name'] = ele.zoneInfo.zoneName
        obj['Rack Name'] = ele.rackInfo.rackName
        obj['Column Name'] = ele.columnInfo.columnName
        obj['Level Name'] = ele.levelInfo.levelName
        obj['Location Name'] = ele.locationInfo.locationName
        obj['Expiry Date'] = ele.expiryDate
        obj['Manufactured Date'] = ele.mfgDate
        obj['BatchNumber'] = ele.batchNumber
        arr.push(obj)
      })
    }
    else {
      const obj = {}
      obj['Inventory Transaction Details ID'] = null
      obj['wareHouse ID Name'] = null
      obj['quantity'] = null
      obj['Transaction Type'] = null
      obj['Transaction Date Time'] = null
      obj['Status'] = null
      obj['Transaction ID'] = null
      obj['Order ID'] = null
      obj['line Number'] = null
      obj['productID'] = null
      obj['productName'] = null
      obj['quantity'] = null
      obj['wareHouseName'] = null
      obj['zoneName'] = null
      obj['Rack Name'] = null
      obj['Column Name'] = null
      obj['Level Name'] = null
      obj['Location Name'] = null
      obj['Manufactured Date'] = null
      obj['batchNumber'] = null
      arr.push(obj)
    }
    return arr
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

  sortDirection: any = null;
  sortFields: any = null;
  page: number = 1;
  itemsPerPage = 10;
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = inventoryTransactionDetails['InventoryTransactionBindArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.generate(this.page, this.itemsPerPage);
  }
}
