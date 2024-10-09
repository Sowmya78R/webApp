import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { Constants } from 'src/app/constants/constants';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { PaginationConstants, purchaseOrderHeader } from 'src/app/constants/paginationConstants';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';

@Component({
  selector: 'app-inventorytransaction',
  templateUrl: './inventorytransaction.component.html',
  styleUrls: ['./inventorytransaction.component.scss']
})
export class InventorytransactionComponent implements OnInit {

  inventoryTransactionForm: FormGroup
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  tableHeadings: any = ['S.No','Image', 'Transaction ID', 'Supplier/Customer/Warehouse', 'Order ID', 'Line No', 'UOM', 'Currency', 'Product ID/Name', 'Product Description',
    'Brand Name', 'Quantity', 'MFG Date', 'Expiry Date', 'Batch No', 'Product Purchase Price', 'Product Sale Price', 'Transaction Type', 'Transaction Time',
    'Zone Name', 'Rack Name', 'Column Name', 'Level Name', 'Location Name', 'BOE No', 'BOE Date', 'Invoice Number', 'Invoice Date', 'Bond Number', 'Bond Date', 'Ex Bond Number', 'Ex Bond Date']
  inventoryByTransactionForm: FormGroup;
  productTypes: any = Constants.PRODUCT_TYPES;
  permissionsList = this.configService.getPermissions("mainFunctionalities", "Inventory", "Inventory Transactions", Storage.getSessionUser());
  categoryDrop: CompleterData;
  products: any = [];
  inventoryData: any;
  productData: any;
  inventoryTransactionsList: any;
  formObj = this.configService.getGlobalpayload();
  suppliers: any = [];
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
  showTooltip: any = false;

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
              "searchOnKeys": this.searchKey,
              "searchKeyword": null,
              "transactionType": this.inventoryTransactionForm.controls.transactionType.value
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
    private excelService: ExcelService, private IBMDService: InboundMasterDataService,
    private reportsService: ReportsService,
    private toastr: ToastrService, private fb: FormBuilder,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.createInventoryTransactionDetailstForm();
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
    this.fetchAllCustomers();
    this.fetchAllSuppliers();
    this.generate(1, this.itemsPerPage);
    this.fetchAllProducts();
    this.fetchAllZones();
    this.fetchAllRacks();
    this.fetchAllLocations();
    this.fetchAllSupplierDetails();
    this.fetchAllWarehouseDetails();


  }

  fetchAllSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierIDNames = response.data.supplierMasters.map(x => x.supplierIDName)
        }
      })
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
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
          this.suppliers = response.data.supplierMasters;
          this.getRole();
        }
      },
      (error) => {
      
      });
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
      "transactionType": this.inventoryTransactionForm.controls.transactionType.value
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
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      this.supplierIDName = (role === 'SUPPLIER') ? this.suppliers.find(x => x.supplierEmailID == user.username).supplierIDName : null;
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
    this.inventoryTransactionForm = this.fb.group({
      transactionType: null,
      productIDNames: null,
      supplierIDNames: null,
      customerIDNames: null,
      wareHouseIDNames: null,
      orderID: this.globaOrderID ? this.globaOrderID : null,
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
      this.inventoryTransactionForm.controls.orderID.setValue(Number(this.globaOrderID));
    }
  }

 

  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  } supplierIDNames: any[]


  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['inventoryTransactionBindArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.generate(this.page, this.itemsPerPage);
  }

  generate(page?, pageSize?) {
    const form = {
      "page": page ? page : 1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": PaginationConstants.inventoryTransaction,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields, 
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName
    }
    const form2 = this.inventoryTransactionForm.value
    const final = { ...form, ...form2 }
    console.log(form2);
    this.wmsService.fetchAllInventoryTransactionWithPagination(final).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryTransactionPaginationResponse.inventoryTransactions) {
          this.inventoryTransactionsList = response.data.inventoryTransactionPaginationResponse.inventoryTransactions
          this.totalItems = response['data'].inventoryTransactionPaginationResponse.totalElements;
          // this.rerender();
          // this.dtTrigger.next();
        }
      },
      (error) => {
      });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }
  /*
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  } */
  exportAsXLSX() {
    if (this.inventoryTransactionsList.length) {
      this.excelService.exportAsExcelFile(this.inventoryTransactionsList, 'Inventory By Transaction', null);
    } else {
      this.toastr.error('No data available');
    }
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  clear() {
    this.inventoryTransactionForm.reset();
    this.newReqObj.dummyorderID = null;
    this.createInventoryTransactionDetailstForm();
    this.generate(1, this.itemsPerPage);
  }


}
