import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Constants } from 'src/app/constants/constants';
import { CompleterData } from 'ng2-completer';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { inventoryTransactionDetails, PaginationConstants } from 'src/app/constants/paginationConstants';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';
@Component({
  selector: 'app-inventorytransactionreport',
  templateUrl: './inventorytransactionreport.component.html',
  styleUrls: ['./inventorytransactionreport.component.scss']
})
export class InventorytransactionreportComponent implements OnInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;

  inventoryTransactionForm: FormGroup
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  inventoryByTransactionForm: FormGroup;
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData;
  purchaseIds:any = [];
  inventoryData: any;
  productData: any;
  inventoryTransactionsList: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inventory', 'Inventory Transaction', Storage.getSessionUser());
  forPermissionsSubscription: any;
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

  inventoryTrnsactionDetailsReport: any = ['S.No', 'Transaction Details ID', 'Supplier ID', 'Supplier Name', 'Status', 'Transaction Date & Time', 'Transaction Type'
    , 'Order ID', 'Line Number', 'Product ID', 'Product Name', 'UOM', 'Quantity', 'Expiry Date', 'Manufacturing Date', 'Batch Number', 'Warehouse ID/Name',
    'Zone Name', 'Rack Name', 'Column Name', 'Level Name', 'Location Name','BOE No','BOE Date',
    'Invoice Number','Invoice Date','Bond Number','Bond Date','Ex Bond Number','Ex Bond Date']
  exportData: any = [];
  loopToStop: any = null
  dataPerPage: number;

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
    e.updateData(this.purchaseIds, query);
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
              "transactionType": this.inventoryTransactionForm.controls.transactionType.value
            }
            this.wmsService.fetchOrderIDsForInvType(form).subscribe(response => {
              if (response && response.status === 0 && response.data.inventoryTransactionPaginationResponse.inventoryTransactionOrderNumber) {
                this.paginationStop = response.data.inventoryTransactionPaginationResponse.inventoryTransactionOrderNumber.length == 0 ? true : false;
                if (!this.paginationStop) {
                  const arr = response.data.inventoryTransactionPaginationResponse.inventoryTransactionOrderNumber;
                  if (this.purchaseIds.length > 0) {
                    let index = this.purchaseIds.length;
                    arr.forEach((v, i) => {
                      i = index;
                      if (!this.purchaseIds.find(x => x.text == v.fullOrderID)) {
                        this.purchaseIds.push({ text: v.fullOrderID, id: i });
                        index += 1;
                      }
                    });
                  }
                  else {
                    this.purchaseIds = arr.map((v, i) => ({ text: v.fullOrderID, id: i }));
                  }
                  new DataManager(this.purchaseIds)
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
                this.purchaseIds = [];
              }
            })
          }
        }
      });
    }
  }


  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private IBMDService: InboundMasterDataService,
    private excelService: ExcelService, private datepipe: DatePipe,
    private reportsService: ReportsService,
    private toastr: ToastrService, private fb: FormBuilder,
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

  ngAfterViewInit(): void {
    this.onCreated();
  }
  @ViewChild("remote")
  public instance: ComboBoxComponent;
  public inputSize: number = 27;
  onCreated(): void {
    let inputElement: HTMLInputElement;
    if (this.instance === undefined) {
      inputElement.size = this.inputSize;
    } else {
      console.log(this.instance);
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
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createInventoryTransactionDetailstForm();
      this.fetchAllProducts();
      this.fetchAllSupplierDetails();
      this.fetchAllZones();
      this.fetchAllRacks();
      this.fetchAllLocations();
      this.fetchAllPurchaseOrders();
      this.fetchAllSuppliers();
      this.fetchAllWarehouseDetails();
      this.fetchAllCustomers();
    }
  }
  supplierIDNames:any = []
  fetchAllSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierIDNames = response.data.supplierMasters.map(x => x.supplierIDName)
        }
      })
  }
  wareHouseIDNamesList:any =[];
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
    this.wmsService.fetchAllSupplierDetails(this.configService.getGlobalpayload()).subscribe(
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
  
  getOrderIDs() {
    this.purchaseIds = [];
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
        if (this.purchaseIds.length > 0) {
          let index = this.purchaseIds.length;
          arr.forEach((v, i) => {
            i = index;
            if (!this.purchaseIds.find(x => x.text == v.fullOrderID)) {
              this.purchaseIds.push({ text: v.fullOrderID, id: i });
              index += 1;
            }
          });
        }
        else {
          this.purchaseIds = arr.map((v, i) => ({ text: v.fullOrderID, id: i }));
        }
      }
      else {
        this.purchaseIds = [];
      }
    })
    this.newReqObj.dummyorderID = null
  }
  fetchAllPurchaseOrders() {
    this.wmsService.fetchAllPurchaseOrders(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrders) {
          this.purchaseIds = response.data.purchaseOrders.map(l => l.wmpoNumber);
          // this.dtTrigger.next();
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
      transactionType: [null],
      productIDNames: [null],
      wareHouseIDNames:[null],
      supplierIDNames:[null],
      customerIDNames:[null],
      orderID: this.globaOrderID ? this.globaOrderID:null,
      zoneNames: [null],
      rackNames: [null],
      locationNames: [null],
      transactionDateTimeFrom: [null],
      transactionDateTimeTo: [null],
      "wareHouseID": this.configService.getWarehouse().wareHouseID,
      "wareHouseName": this.configService.getWarehouse().wareHouseName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "organizationID": this.configService.getOrganization().organizationID,
      "organizationName": this.configService.getOrganization().organizationName
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
  /* accessOrderID(event) {
    if (event && event.itemData) {
      this.inventoryTransactionForm.controls.orderID.setValue(event.itemData.text);
    }
  } */

  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  }
  setDirection(type, headerName) {
    this.sortDirection = type;
    this.generate(this.page, this.itemsPerPage);
  }
  generate(page?, pageize?) {
    this.inventoryTransactionForm.value.transactionType = this.inventoryTransactionForm.value.transactionType ? this.inventoryTransactionForm.value.transactionType : null;
    this.inventoryTransactionForm.value.productIDNames = this.inventoryTransactionForm.value.productIDNames ? this.inventoryTransactionForm.value.productIDNames : null;
    this.inventoryTransactionForm.value.orderID = this.inventoryTransactionForm.value.orderID ? this.inventoryTransactionForm.value.orderID : null;
    this.inventoryTransactionForm.value.zoneNames = this.inventoryTransactionForm.value.zoneNames ? this.inventoryTransactionForm.value.zoneNames : null;
    this.inventoryTransactionForm.value.rackNames = this.inventoryTransactionForm.value.rackNames ? this.inventoryTransactionForm.value.rackNames : null;
    this.inventoryTransactionForm.value.locationNames = this.inventoryTransactionForm.value.locationNames ? this.inventoryTransactionForm.value.locationNames : null;
    this.inventoryTransactionForm.value.transactionDateTimeFrom = this.inventoryTransactionForm.value.transactionDateTimeFrom ? new Date(this.inventoryTransactionForm.value.transactionDateTimeFrom) : null;
    this.inventoryTransactionForm.value.transactionDateTimeTo = this.inventoryTransactionForm.value.transactionDateTimeTo ? new Date(this.inventoryTransactionForm.value.transactionDateTimeTo) : null;
    this.wmsService.inventoryTransactionReportReportFormDataPassing = this.inventoryTransactionForm.value;
    const form = this.inventoryTransactionForm.value;

    form['page'] = page ? page : 1
    form['pageSize'] = this.itemsPerPage
    form['searchKeyword'] = this.searchKey
    form['searchOnKeys'] = PaginationConstants.inventoryTransaction
    form['sortDirection'] = null
    form['sortFields'] = null
    this.wmsService.fetchAllInventoryTransactionWithPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryTransactionPaginationResponse.inventoryTransactions) {
          this.inventoryTransactionsList = response.data.inventoryTransactionPaginationResponse.inventoryTransactions
          this.wmsService.inventoryTransactionReportDisplayTableList = this.inventoryTransactionsList;
          this.totalItems = response['data'].inventoryTransactionPaginationResponse.totalElements;
          // this.loopToStop = response['data'].inventoryTransactionPaginationResponse.totalPages ;
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
          console.log(this.loopToStop);
          this.rerender();
        }
      },
      (error) => {
      });
  }
  clear() {
    this.inventoryTransactionForm.reset();
    this.createInventoryTransactionDetailstForm();
    this.newReqObj.dummyorderID = null
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
  ngOnDestroy(): void {
    //this.forPermissionsSubscription.unsubscribe();
  }
  getAllInventoryTransactionsData(index?) {
    console.log(this.loopToStop)
    if (!index) {
      this.exportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      this.exportAsXLSX();
    }
    else {
      if (((i == 1) || (i != 1 && this.exportData.length > 0)) && i <= this.loopToStop) {
        this.inventoryTransactionForm.value.transactionType = this.inventoryTransactionForm.value.transactionType ? this.inventoryTransactionForm.value.transactionType : null;
        this.inventoryTransactionForm.value.productIDNames = this.inventoryTransactionForm.value.productIDNames ? this.inventoryTransactionForm.value.productIDNames : null;
        this.inventoryTransactionForm.value.orderID = this.inventoryTransactionForm.value.orderID ? this.inventoryTransactionForm.value.orderID : null;
        this.inventoryTransactionForm.value.zoneNames = this.inventoryTransactionForm.value.zoneNames ? this.inventoryTransactionForm.value.zoneNames : null;
        this.inventoryTransactionForm.value.rackNames= this.inventoryTransactionForm.value.rackNames ? this.inventoryTransactionForm.value.rackNames : null;
        this.inventoryTransactionForm.value.locationNames = this.inventoryTransactionForm.value.locationNames ? this.inventoryTransactionForm.value.locationNames : null;
        this.inventoryTransactionForm.value.transactionDateTimeFrom = this.inventoryTransactionForm.value.transactionDateTimeFrom ? new Date(this.inventoryTransactionForm.value.transactionDateTimeFrom) : null;
        this.inventoryTransactionForm.value.transactionDateTimeTo = this.inventoryTransactionForm.value.transactionDateTimeTo ? new Date(this.inventoryTransactionForm.value.transactionDateTimeTo) : null;
        this.wmsService.inventoryTransactionReportReportFormDataPassing = this.inventoryTransactionForm.value;
        const form = this.inventoryTransactionForm.value;
        form['page'] = i,
          form['pageSize'] = this.dataPerPage
        form['searchKeyword'] = this.searchKey
        form['searchOnKeys'] = PaginationConstants.inventoryTransaction
        form['sortDirection'] = null
        form['sortFields'] = null
        form['supplierIDName'] = this.supplierIDName
        form['organizationIDName'] = this.formObj.organizationIDName,
          form['wareHouseIDName'] = this.formObj.wareHouseIDName

        this.wmsService.fetchAllInventoryTransactionWithPagination(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.inventoryTransactionPaginationResponse.inventoryTransactions) {
              //  this.inventoryTransactionsList = response.data.inventoryTransactionPaginationResponse.inventoryTransactions
              this.exportData = [...this.exportData, ...response.data.inventoryTransactionPaginationResponse.inventoryTransactions];
              this.getAllInventoryTransactionsData(i);
              console.log(this.exportData)
            }
          })
      }
    }
  }
  exportAsXLSX() {
    if (this.inventoryTransactionsList.length) {
      const changedInventoryTransactionList = this.exportTypeMethod(this.exportData)
      this.excelService.exportAsExcelFile(changedInventoryTransactionList, 'Inventory By Transaction', null);
    } else {
      this.toastr.error('No data available');
    }
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['Transaction Date Time'] = k.transactionDateTime ? this.datepipe.transform(new Date(k.transactionDateTime), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Transaction Type'] = k.transactionType
        obj['Inventory Transaction ID'] = k.inventoryTransactionID
        obj['Order ID'] = k.orderID
        if (k.supplierMasterInfo) {
          obj['Supplier/Customer/WareHouse ID Name'] = k.supplierMasterInfo ? k.supplierMasterInfo.supplierIDName : null + ''
            + k.customerMasterInfo ? k.customerMasterInfo.customerIDName : null + '' + k.wareHouseInfo ? k.wareHouseInfo.wareHouseName : null
        } else {
          obj['Supplier/Customer/WareHouse ID Name'] = null
        }
        obj['Line Number'] = k.lineNumber
        obj['Product ID'] = k.productMasterInfo.productID
        obj['Product Name'] = k.productMasterInfo.productName
        obj['UOM'] = k.inventoryUnit
        obj['Quantity'] = k.quantity
        obj['Expiry Date'] = k.expiryDate ? this.datepipe.transform(new Date(k.expiryDate), 'dd/MM/yyyy') : null
        obj['Mfg Date'] = k.mfgDate ? this.datepipe.transform(new Date(k.mfgDate), 'dd/MM/yyyy') : null
        obj['Batch Number'] = k.batchNumber
        obj['WareHouse ID Name'] = k.wareHouseInfo.wareHouseIDName
        obj['Zone Name'] = k.zoneInfo.zoneName
        obj['Rack Name'] = k.rackInfo.rackName
        obj['Column Name'] = k.columnInfo.columnName
        obj['Level Name'] = k.levelInfo.levelName
        obj['Location Name'] = k.locationName
        obj['Bill Of Entry Number'] = k.billOfEntryNumber
        obj['Bill Of Entry Date'] = k.billOfEntryDate ? this.datepipe.transform(new Date(k.billOfEntryDate), 'dd/MM/yyyy') : null
        obj['Invoice Number'] = k.invoiceNumber
        obj['Invoice Date'] = k.invoiceDate ? this.datepipe.transform(new Date(k.invoiceDate), 'dd/MM/yyyy') : null
        obj['Bond Number'] = k.bondNumber
        obj['Bond Date'] = k.bondDate ? this.datepipe.transform(new Date(k.bondDate), 'dd/MM/yyyy') : null
        obj['Ex Bond Number'] = k.exBondNumber
        obj['Ex Bond Date'] = k.exBondDate ? this.datepipe.transform(new Date(k.exBondDate), 'dd/MM/yyyy') : null
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Transaction Date Time'] = null
      obj['Transaction Type'] = null
      obj['Inventory Transaction ID'] = null
      obj['Order ID'] = null
      obj['Supplier ID Name'] = null
      obj['Line Number'] = null
      obj['Product ID'] = null
      obj['Product Name'] = null
      obj['UOM'] = null
      obj['Quantity'] = null
      obj['Expiry Date'] = null
      obj['Mfg Date'] = null
      obj['Batch Number'] = null
      obj['WareHouse ID Name'] = null
      obj['Zone Name'] = null
      obj['Rack Name'] = null
      obj['Column Name'] = null
      obj['Level Name'] = null
      obj['Location Name'] =null
      obj['Bill Of Entry Number'] = null
      obj['Bill Of Entry Date'] = null
      obj['Invoice Number'] = null
      obj['Invoice Date'] = null
      obj['Bond Number'] = null
      obj['Bond Date'] = null
      obj['Ex Bond Number'] = null
      obj['Ex Bond Date'] = null
      arr.push(obj)
    }
    return arr
  }

  /*
  generatePDF(){
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 300);
} */
  generatePDF() {
    if (this.inventoryTransactionsList.length > 0) {
      if (this.permissionsList.includes('Update')) {
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 300);
      }
      else {
        this.toastr.error("User doesn't have Permissions.")
      }
    }
    else {
      this.toastr.error("No Data to Print.")

    }
  }
}
