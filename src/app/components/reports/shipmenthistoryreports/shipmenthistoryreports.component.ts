import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Constants } from 'src/app/constants/constants';
import { CompleterData, CompleterService } from 'ng2-completer';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { ToastrService } from 'ngx-toastr';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-shipmenthistoryreports',
  templateUrl: './shipmenthistoryreports.component.html',
  styleUrls: ['./shipmenthistoryreports.component.scss']
})
export class ShipmenthistoryreportsComponent implements OnInit, OnDestroy {
  isFormVisible = false
  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  shipmentOrderHistoryReportForm: FormGroup;
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData;
  products: CompleterData;
  inventoryData: any;
  productData: any;
  customerIDs: CompleterData;
  productCategoriesIDs: CompleterData;
  batchNumberIDs: CompleterData;
  serialNumberIDs: CompleterData;
  zones: any;
  locationsIDs: CompleterData
  zoneNameValues: CompleterData;
  grnhistoryResponseList: any = [];
  customers: any;
  forPermissionsSubscription: any;
  thirdPartyCustomersCheckAllocation = 'No';
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Outbound', 'Shipment History', Storage.getSessionUser());
  suppliersIDs: CompleterData;
  sourceWareHouses: CompleterData;
  locationList: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private excelService: ExcelService,
    private reportsService: ReportsService, private completerService: CompleterService
    , private toastr: ToastrService,
    private fb: FormBuilder, private metaDataService: MetaDataService,
    private commonService: CommonService, private IBMDService: InboundMasterDataService,
    private outboundProcessService: OutboundProcessService, private datepipe: DatePipe,
    private translate: TranslateService,) {
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
    //  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
    //     if (data) {
    //       this.formObj = this.configService.getGlobalpayload();
    //       if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
    //         this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
    //           'Outbound', 'Shipment History', Storage.getSessionUser());
    //       }
    //       this.getFunctionsCall();
    //     }
    //   })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createShipmentHistoryReportForm();
      this.fetchAllProducts();
      this.fetchAllProductCategories();
      // this.fetchAllInventories();
      this.fetchAllZones();
      this.fetchAllLocations();
      this.fetchAllCustomers();
      this.findAllShipmentOrders();
    }
  }
  locationNameValues: CompleterData;
  sourceWareHouseList: any;
  supplierIDNameList: any;
  dataArrayList: any = [];
  getSelectedValue(event, key) {
    this.dataArrayList = [];

    if (event) {
      switch (key) {
        case 'regionLocation': {
          this.shipmentOrderHistoryReportForm.controls.locationName.setValue(null);
          const filteredLocations = this.customers.filter(x => x.customerIDName === this.shipmentOrderHistoryReportForm.controls.customerIDName.value);
          // this.locationNameValues = filteredLocations ? filteredLocations.map(x => x.city) : [];
          this.dataArrayList.push(filteredLocations.map(x => x.city))
          break;
        }
        case 'sourceWareHouseLocation': {
          const filteredSourceLocationsValue = this.sourceWareHouseList.filter(x => x.wareHouseIDName === this.shipmentOrderHistoryReportForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.value);
          // this.locationNameValues = filteredSourceLocationsValue ? filteredSourceLocationsValue.map(x => x.city) : [];
          this.dataArrayList.push(filteredSourceLocationsValue.map(x => x.city))
          break;
        }
        case 'regionFromSupplierIDName': {
          const filteredSupplierIDName = this.supplierIDNameList.filter(x => x.supplierIDName === this.shipmentOrderHistoryReportForm.controls.supplierIDName.value);
          // this.locationNameValues = filteredSourceLocationsValue ? filteredSourceLocationsValue.map(x => x.city) : [];
          this.dataArrayList.push(filteredSupplierIDName.map(x => x.city))
          break;
        }
      }
    }
    else {

    }
  }

  makeEmpty() {
    this.shipmentOrderHistoryReportForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.setValue(null);
    this.shipmentOrderHistoryReportForm.controls.supplierIDName.setValue(null);
    this.shipmentOrderHistoryReportForm.controls.customerIDName.setValue(null);
  }
  createShipmentHistoryReportForm() {
    this.shipmentOrderHistoryReportForm = this.fb.group({
      productIDName: [null],
      productCategoryName: [null],
      customerIDName: [null],
      locationName: [null],
      filterType: [null],
      expectedDeliveryDateFrom: [null],
      expectedDeliveryDateTo: [null],
      customersCustomerAddress: [null],
      customersCustomerName: [null],
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      wareHouseTransferDestinationInfoWareHouseIDName: null,
      orderType: 'Sales Order',
      supplierIDName: null
    })
  }
  salesOrders: any;
  salesOrdersNameMapList: any;
  salesOrdersMapList: any;
  salesOrdersAddressMapList: any;
  salesOrdersSupplierNameFiterIDs: CompleterData;
  salesOrdersSupplierAddressFilterIDs: CompleterData
  findAllShipmentOrders() {
    this.outboundProcessService.fetchAllShipmentOrders(JSON.stringify(this.formObj)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrders) {
          const salesOrdersNameMapList = response.data.shipmentOrders.map(customerName => customerName.customersCustomerName);
          this.salesOrdersSupplierNameFiterIDs = salesOrdersNameMapList.filter(customerNameFilter => customerNameFilter != null);
          const salesOrdersAddressMapList = response.data.shipmentOrders.map(customerName => customerName.customersCustomerAddress);
          this.salesOrdersSupplierAddressFilterIDs = salesOrdersAddressMapList.filter(customerAddressFilter => customerAddressFilter != null);
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
          this.locationList = response.data.locations
          this.locationsIDs = response.data.locations.map(locationname => locationname.locationName);
        } else {
        }
      },
      (error) => {
      });
  }
  customerLocationIDs: CompleterData;
  customersIDs: CompleterData
  fetchAllCustomers() {
    this.IBMDService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers) {
          this.customersIDs = response.data.customers.map(customerData => customerData.customerIDName)
          this.customers = response.data.customers;
          let cities = response.data.customers.map(cityList => cityList.city);
          let uniqueNewValues = cities.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
          })
          let dymmyArr: any[] = [];
          console.log(uniqueNewValues);

          this.customerLocationIDs = uniqueNewValues;


        }
      },
      (error) => {
      });
  }

  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones.length > 0) {
          this.zones = response.data.zones;
          this.zoneNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.zones, 'zoneName'));
        } else {
          this.zones = [];
        }
      },
      (error) => {
        this.zones = [];
      });
  }
  fetchAllProductCategories() {
    this.metaDataService.fetchAllProductCategories(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length) {
          this.productCategoriesIDs = response.data.productCategories.map(category => category.productCategoryName);
        }
      },
      error => {
      }
    );
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {

          this.products = response.data.productMasters.map(productID => productID.productIDName);
          // this.categoryDrop = response.data.productMasters.map(productID => productID.productCategoryInfo.productCategoryName);
        } else {
        }
      },
      (error) => {
      });
    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
        this.wmsService.shipmentHistoryReportthirdPartyCustomersCheckAllocation = this.thirdPartyCustomersCheckAllocation;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierIDNameList = response.data.supplierMasters
          this.suppliersIDs = response.data.supplierMasters.map(supp => supp.supplierIDName);
        }
      })
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.sourceWareHouseList = response.data.wareHouses
          this.sourceWareHouses = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  // fetchAllInventories() {
  //   this.wmsService.findAllInventories('', this.formObj).subscribe(
  //     (response) => {
  //       if (response && response.status === 0 && response.data.inventories) {
  //         const bIn = response.data.inventories.filter(x => x.batchNumber != null);
  //         const sIn = response.data.inventories.filter(x => x.serialNumber != null);
  //         const dupBin = bIn ? bIn.map(x => x.batchNumber) : null;
  //         this.batchNumberIDs = this.removeDuplicates(dupBin);
  //         const dupsIn = sIn ? sIn.map(x => x.serialNumber) : null;
  //         this.serialNumberIDs = this.removeDuplicates(dupsIn);
  //       } else {
  //         this.batchNumberIDs = null;
  //         this.serialNumberIDs = null;
  //       }
  //     },
  //     (error) => {
  //       this.batchNumberIDs = null;
  //       this.serialNumberIDs = null;
  //     });
  // }
  totalProductWiseQtyObj: any;
  downloadExcelResponseList: any;
  generate() {
    this.shipmentOrderHistoryReportForm.value.productIDName = this.shipmentOrderHistoryReportForm.value.productIDName ? this.shipmentOrderHistoryReportForm.value.productIDName : null;
    this.shipmentOrderHistoryReportForm.value.productCategoryName = this.shipmentOrderHistoryReportForm.value.productCategoryName ? this.shipmentOrderHistoryReportForm.value.productCategoryName : null;
    this.shipmentOrderHistoryReportForm.value.customerIDName = this.shipmentOrderHistoryReportForm.value.customerIDName ? this.shipmentOrderHistoryReportForm.value.customerIDName : null;
    this.shipmentOrderHistoryReportForm.value.locationName = this.shipmentOrderHistoryReportForm.value.locationName ? this.shipmentOrderHistoryReportForm.value.locationName : null;
    this.shipmentOrderHistoryReportForm.value.expectedDeliveryDateFrom = this.shipmentOrderHistoryReportForm.value.expectedDeliveryDateFrom ? this.shipmentOrderHistoryReportForm.value.expectedDeliveryDateFrom : null;
    this.shipmentOrderHistoryReportForm.value.expectedDeliveryDateTo = this.shipmentOrderHistoryReportForm.value.expectedDeliveryDateTo ? this.shipmentOrderHistoryReportForm.value.expectedDeliveryDateTo : null;
    const form = this.shipmentOrderHistoryReportForm.value;
    this.wmsService.shipmentHistoryFormDataPassing = form;
    this.reportsService.fetchAllShipmentOrderHistoryReport(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderHistoryReportResponseMap.shipmentOrderHistoryReportResponseList) {
          this.grnhistoryResponseList = response.data.shipmentOrderHistoryReportResponseMap.shipmentOrderHistoryReportResponseList;
          this.wmsService.shipmentHistoryDisplayTableList = this.grnhistoryResponseList;
          this.totalProductWiseQtyObj = response.data.shipmentOrderHistoryReportResponseMap.totalProductWiseQty
          this.wmsService.shipmentHistoryDisplayTableList = this.grnhistoryResponseList;
          this.wmsService.shipmentHistoryObjDisplay = response.data.shipmentOrderHistoryReportResponseMap.totalProductWiseQty
          this.downloadExcelResponseList = response.data.shipmentOrderHistoryReportResponseMap
          this.rerender();
        } else {
          this.grnhistoryResponseList = [];
          this.totalProductWiseQtyObj = null;
          // this.toastr.error(Constants.noDataAvailbleGlobalMsg.noDataAvailble);
          this.rerender();
        }
      },
      (error) => {
      });
    this.grnhistoryResponseList = [];
    this.rerender();
  }
  clear() {
    // this.shipmentOrderHistoryReportForm.reset();
    this.createShipmentHistoryReportForm()
    this.isFormVisible = false;
  }
  /*  exportAsXLSX() {
     if (this.grnhistoryResponseList.length) {
       this.excelService.exportAsExcelFile(this.grnhistoryResponseList, 'Shipment Hiistory Report', null);
     } else {
       this.toastr.error('No data available');
     }
   } */

  exportAsXLSX() {
    console.log(this.grnhistoryResponseList);
    const changedTaskList = this.exportTypeMethod(this.grnhistoryResponseList)
    this.excelService.exportAsExcelFile(changedTaskList, 'Shipment History Reports',
      Constants.EXCEL_IGNORE_FIELDS.SHIPMENTHISTORYREPORTS, this.downloadExcelResponseList);
  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = [];
    if (data && data.length) {
      console.log(data)
      data.forEach(ele => {
        if (ele) {
          const obj = {}
          if (ele.supplierIDName != null || ele.customerIDName != null || ele.wareHouseTransferDestinationInfoWareHouseID != null) {
            obj['Supplier/Customer/WareHouse ID Name'] = ele.supplierIDName ? ele.supplierIDName : null + '' +
              ele.customerIDName ? ele.customerIDName : null + ' ' + ele.wareHouseTransferDestinationInfoWareHouseID ?
              ele.wareHouseTransferDestinationInfo.wareHouseIDName : null
          }
          else {
            obj['Supplier/Customer/WareHouse ID Name'] = null
          }
          obj['Product ID'] = ele.productID
          obj['Product ID Name'] = ele.productIDName
          obj['UOM'] = ele.inventoryUnit
          obj['Product Category Name'] = ele.productCategoryName
          obj['Quantity'] = ele.quantity
          obj['Customers Customer Name'] = ele.customersCustomerName
          obj['Customers Customer Address'] = ele.customersCustomerAddress
          obj['Customer Location'] = ele.locationName
          arr.push(obj)
          console.log(obj)
        }
        else {
          const obj = {}
          obj['supplier/Customer/WareHouse ID Name'] = null
          obj['Product ID'] = null
          obj['Product ID Name'] = null
          obj['UOM'] = null
          obj['Product Category Name'] = null
          obj['Quantity'] = null
          obj['Customers Customer Name'] = null
          obj['Customers Customer Address'] = null
          obj['Customer Location'] = null
          arr.push(obj)
        }
      })
      return arr
    } else {
      const obj = {}
      obj['Supplier/Customer/WareHouse ID Name'] = null
      obj['Product ID'] = null
      obj['Product ID Name'] = null
      obj['Product Category Name'] = null
      obj['Quantity'] = null
      obj['Customers Customer Name'] = null
      obj['Customers Customer Address'] = null
      obj['Customer Location'] = null
      arr.push(obj)
    }
    return arr
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    // this.forPermissionsSubscription.unsubscribe();
  }
  onDropDownChange(data) {
    if (data === "Custom Dates") {
      this.wmsService.datePassingHideAndShow = true;
      this.isFormVisible = true
    }
    else {
      this.wmsService.datePassingHideAndShow = false;
      this.isFormVisible = false
    }
  }
  /*
  generatePDF(){
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 300);
} */
  generatePDF() {
    if (this.grnhistoryResponseList.length) {
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
