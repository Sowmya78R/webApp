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
import { inventoryTransactionDetails } from 'src/app/constants/paginationConstants';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';

@Component({
  selector: 'app-inventorytransactiondetailsreport',
  templateUrl: './inventorytransactiondetailsreport.component.html',
  styleUrls: ['./inventorytransactiondetailsreport.component.scss']
})
export class InventorytransactiondetailsreportComponent implements OnInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;

  inventoryTransactionDetailsForm: FormGroup

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  inventoryByTransactionForm: FormGroup;
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData;
  products: CompleterData;
  inventoryData: any;
  productData: any; p
  inventoryTransactionsList: any;
  inventoryTransactionDetailsList: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inventory', 'Inventory Transaction Details', Storage.getSessionUser());
  purchaseOrders: any = [];
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
  loopToStop: any = null
  dataPerPage: number;
  inventoryTrnsactionDetailsReport: any = ['S.No', 'Transaction Details ID', 'Supplier ID', 'Supplier Name', 'Status', 'Transaction Date & Time', 'Transaction Type'
    , 'Order ID', 'Line Number', 'Product ID', 'Product Name', 'UOM', 'Quantity', 'Expiry Date', 'Manufacturing Date', 'Batch Number', 'Warehouse ID/Name',
    'Zone Name', 'Rack Name', 'Column Name', 'Level Name', 'Location Name', 'BOE No', 'BOE Date', 'Invoice Number', 'Invoice Date', 'Bond Number',
    'Bond Date', 'Ex Bond Number', 'Ex Bond Date', 'Product Category Name']
  exportData: any[];

  dummyorderID: any = null;
  purchaseIds: any = []

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
              "transactionType": this.inventoryTransactionDetailsForm.controls.transactionType.value
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
    private excelService: ExcelService, private datepipe: DatePipe, private IBMDService: InboundMasterDataService,
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
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createInventoryTransactionDetailstForm();
      this.fetchAllProducts();
      this.fetchAllSupplierDetails();
      this.fetchAllZones();
      this.fetchAllLocations();
      this.fetchAllRacks();
      this.fetchAllPurchaseOrders();
      this.fetchAllWarehouseDetails();
      this.fetchAllCustomers();
      this.fetchAllSuppliers();
    }
  }
  supplierIDNames: any = []
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
      "transactionType": this.inventoryTransactionDetailsForm.controls.transactionType.value
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

  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  }
  setDirection(type, headerName) {
    this.sortDirection = type;
    //let arr: any = Columns['diagnosisBindArray'].find(x => x.key == headerName);
    //this.sortFields = [arr.name];
    this.generate(this.page, this.itemsPerPage);
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

        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllPurchaseOrders() {
    this.wmsService.fetchAllPurchaseOrders(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrders) {
          this.purchaseIds = response.data.purchaseOrders.map(l => l.wmpoNumber);
        } else {
        }
      },
      (error) => {
      });
  }
  createInventoryTransactionDetailstForm() {
    this.inventoryTransactionDetailsForm = this.fb.group({
      transactionType: [null],
      productIDNames: [null],
      supplierIDNames: null,
      customerIDNames: null,
      wareHouseIDNames: null,
      orderID: this.globaOrderID ? this.globaOrderID : null,
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
      this.inventoryTransactionDetailsForm.controls.orderID.setValue(Number(this.globaOrderID));
    }
  }
   /* accessOrderID(event) {
    if (event && event.itemData) {
      this.inventoryTransactionDetailsForm.controls.orderID.setValue(event.itemData.text);
    }
  } */
  ngAfterViewInit() {
    this.dtTrigger.next();
  }
  generate(page?, pageSize?) {
    this.inventoryTransactionDetailsForm.value.transactionType = this.inventoryTransactionDetailsForm.value.transactionType ? this.inventoryTransactionDetailsForm.value.transactionType : null;
    this.inventoryTransactionDetailsForm.value.productIDName = this.inventoryTransactionDetailsForm.value.productIDName ? this.inventoryTransactionDetailsForm.value.productIDName : null;
    this.inventoryTransactionDetailsForm.value.orderID = this.inventoryTransactionDetailsForm.value.orderID ? this.inventoryTransactionDetailsForm.value.orderID : null;
    this.inventoryTransactionDetailsForm.value.zoneName = this.inventoryTransactionDetailsForm.value.zoneName ? this.inventoryTransactionDetailsForm.value.zoneName : null;
    this.inventoryTransactionDetailsForm.value.rackName = this.inventoryTransactionDetailsForm.value.rackName ? this.inventoryTransactionDetailsForm.value.rackName : null;
    this.inventoryTransactionDetailsForm.value.locationName = this.inventoryTransactionDetailsForm.value.locationName ? this.inventoryTransactionDetailsForm.value.locationName : null;
    this.inventoryTransactionDetailsForm.value.transactionDateTimeFrom = this.inventoryTransactionDetailsForm.value.transactionDateTimeFrom ? new Date(this.inventoryTransactionDetailsForm.value.transactionDateTimeFrom) : null;
    this.inventoryTransactionDetailsForm.value.transactionDateTimeTo = this.inventoryTransactionDetailsForm.value.transactionDateTimeTo ? new Date(this.inventoryTransactionDetailsForm.value.transactionDateTimeTo) : null;
    this.wmsService.inventoryTransactionDetailsReportFormDataPassing = this.inventoryTransactionDetailsForm.value
    const form = this.inventoryTransactionDetailsForm.value;
    form['page'] = page ? page : 1
    form['pageSize'] = this.itemsPerPage
    form['searchKeyword'] = this.searchKey
    form['searchOnKeys'] = inventoryTransactionDetails.InventoryTransactionDetailsKeys
    form['sortDirection'] = null
    form['sortFields'] = null
    this.wmsService.fetchAllInventoryTransactionDetailsPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryTransactionDetailsPaginationResponse.inventoryTransactionDetailsList) {

          this.inventoryTransactionDetailsList = response.data.inventoryTransactionDetailsPaginationResponse.inventoryTransactionDetailsList;
          this.inventoryTransactionDetailsList = this.excelService.formatJSONForHeaderLines
            (this.inventoryTransactionDetailsList, 'inventoryTransactions');
          console.log(this.inventoryTransactionDetailsList)
          this.wmsService.inventoryTransactionDetailsReporttDisplayTableList = this.inventoryTransactionDetailsList;
          this.totalItems = response.data.inventoryTransactionDetailsPaginationResponse.totalElements;
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
    this.createInventoryTransactionDetailstForm();
    this.dummyorderID = null;
  }
  getAllInventoryTransactionDetailsData(index?) {
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

        this.inventoryTransactionDetailsForm.value.transactionType = this.inventoryTransactionDetailsForm.value.transactionType ? this.inventoryTransactionDetailsForm.value.transactionType : null;
        this.inventoryTransactionDetailsForm.value.productIDName = this.inventoryTransactionDetailsForm.value.productIDName ? this.inventoryTransactionDetailsForm.value.productIDName : null;
        this.inventoryTransactionDetailsForm.value.orderID = this.inventoryTransactionDetailsForm.value.orderID ? this.inventoryTransactionDetailsForm.value.orderID : null;
        this.inventoryTransactionDetailsForm.value.zoneName = this.inventoryTransactionDetailsForm.value.zoneName ? this.inventoryTransactionDetailsForm.value.zoneName : null;
        this.inventoryTransactionDetailsForm.value.rackName = this.inventoryTransactionDetailsForm.value.rackName ? this.inventoryTransactionDetailsForm.value.rackName : null;
        this.inventoryTransactionDetailsForm.value.locationName = this.inventoryTransactionDetailsForm.value.locationName ? this.inventoryTransactionDetailsForm.value.locationName : null;
        this.inventoryTransactionDetailsForm.value.transactionDateTimeFrom = this.inventoryTransactionDetailsForm.value.transactionDateTimeFrom ? new Date(this.inventoryTransactionDetailsForm.value.transactionDateTimeFrom) : null;
        this.inventoryTransactionDetailsForm.value.transactionDateTimeTo = this.inventoryTransactionDetailsForm.value.transactionDateTimeTo ? new Date(this.inventoryTransactionDetailsForm.value.transactionDateTimeTo) : null;
        this.wmsService.inventoryTransactionDetailsReportFormDataPassing = this.inventoryTransactionDetailsForm.value
        const form = this.inventoryTransactionDetailsForm.value;
        form['page'] = i,
          form['pageSize'] = this.dataPerPage
        form['searchKeyword'] = this.searchKey
        form['searchOnKeys'] = inventoryTransactionDetails.InventoryTransactionDetailsKeys
        form['sortDirection'] = null
        form['sortFields'] = null
        form['organizationIDName'] = this.formObj.organizationIDName,
          form['wareHouseIDName'] = this.formObj.wareHouseIDName
        this.wmsService.fetchAllInventoryTransactionDetailsPagination(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.inventoryTransactionDetailsPaginationResponse.inventoryTransactionDetailsList) {
              const arr = this.excelService.formatJSONForHeaderLines
                (response.data.inventoryTransactionDetailsPaginationResponse.inventoryTransactionDetailsList, 'inventoryTransactions');
              this.exportData = [...this.exportData, ...arr];
              this.getAllInventoryTransactionDetailsData(i);
              console.log(this.exportData)
            }
          })
      }
    }
  }

  exportAsXLSX() {
    if (this.inventoryTransactionDetailsList.length) {
      const changedInventoryTransactionDetailsList = this.exportTypeMethod(this.exportData)
      this.excelService.exportAsExcelFile(changedInventoryTransactionDetailsList, 'Inventory By Transaction Details', null);
    } else {
      this.toastr.error('No data available');
    }
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['Inventory Transaction Details ID'] = k.inventoryTransactionDetailsID
        if (k.supplierMasterInfo) {
          obj['Supplier ID Name'] = k.supplierMasterInfo.supplierIDName
        } else {
          obj['Supplier ID Name'] = null
        }
        obj['Quantity'] = k.quantity
        obj['Transaction Type'] = k.transactionType
        obj['Transaction Date Time'] = k.transactionDateTime ? this.datepipe.transform(new Date(k.transactionDateTime), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Order ID'] = k.orderID
        obj['Status'] = k.status
        obj['Line Number'] = k.lineNumber
        obj['Product ID'] = k.productMasterInfo.productID
        obj['Product Name'] = k.productMasterInfo.productName
        obj['UOM'] = k.inventoryUnit
        obj['WareHouse ID Name'] = k.wareHouseInfo.wareHouseIDName
        obj['Zone Name'] = k.zoneInfo.zoneName
        obj['Rack Name'] = k.rackInfo.rackName
        obj['Column Name'] = k.columnInfo.columnName
        obj['Location Name'] = k.locationInfo.locationName
        obj['Bill Of Entry Number'] = k.billOfEntryNumber
        obj['Bill Of Entry Date'] = k.billOfEntryDate
        obj['Invoice Number'] = k.invoiceNumber
        obj['Invoice Date'] = k.invoiceDate
        obj['Bond Number'] = k.bondNumber
        obj['Bond Date'] = k.bondDate
        obj['Ex Bond Number'] = k.exBondNumber
        obj['Ex Bond Date'] = k.exBondDate
        obj['Product Category Name'] = k.productCategoryInfo ? k.productCategoryInfo.productCategoryName : null
        obj['Expiry Date'] = k.expiryDate ? this.datepipe.transform(new Date(k.expiryDate), 'dd/MM/yyyy') : null
        obj['Mfg Date'] = k.mfgDate ? this.datepipe.transform(new Date(k.mfgDate), 'dd/MM/yyyy') : null
        obj['Batch Number'] = k.batchNumber

        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Inventory Transaction ID'] = null
      obj['Supplier ID Name'] = null
      obj['Quantity'] = null
      obj['Inventory Unit'] = null
      obj['Transaction Type'] = null
      obj['transactionDateTime'] = null
      obj['Order ID'] = null
      obj['Status'] = null
      obj['Line Number'] = null
      obj['Product ID'] = null
      obj['Product Name'] = null
      obj['UOM'] = null
      obj['WareHouse ID Name'] = null
      obj['Zone Name'] = null
      obj['Rack Name'] = null
      obj['Column Name'] = null
      obj['Level Name'] = null
      obj['Expiry Date'] = null
      obj['Mfg Date'] = null
      obj['Batch Number'] = null
      arr.push(obj)
    }
    return arr
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
    this.dtTrigger.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
  }
  /*
  generatePDF() {
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 300);
  }
 */
  generatePDF() {
    if (this.inventoryTransactionDetailsList.length > 0) {
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
