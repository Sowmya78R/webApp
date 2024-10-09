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
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { ReportsCommonService } from 'src/app/services/reports-common.service';
import { OutboundMasterDataService } from 'src/app/services/integration-services/outboundMasterData.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-grnhistoryreport',
  templateUrl: './grnhistoryreport.component.html',
  styleUrls: ['./grnhistoryreport.component.scss']
})
export class GrnhistoryreportComponent implements OnInit, OnDestroy {


  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  grnHistoryReportForm: FormGroup;
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData;
  products: CompleterData;
  inventoryData: any;
  productData: any;
  suppliersIDs: CompleterData;
  productCategoriesIDs: CompleterData;
  batchNumberIDs: CompleterData;
  serialNumberIDs: CompleterData;
  zones: any;
  locationsIDs: CompleterData
  zoneNameValues: CompleterData;
  grnhistoryResponseList: any = [];
  supplierLocationNameIDs: CompleterData;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inbound', 'GRN History', Storage.getSessionUser());
  forPermissionsSubscription: any;
  thirdPartyCustomersCheckAllocation = 'No';
  sourceWareHouses: CompleterData;
  customerIDNameValues: CompleterData;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private excelService: ExcelService, private reportsCommonService: ReportsCommonService,
    private reportsService: ReportsService, private completerService: CompleterService
    , private toastr: ToastrService, private fb: FormBuilder,
    private metaDataService: MetaDataService, private commonService: CommonService,private outboundMasterDataService: OutboundMasterDataService,
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
    // this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
    //   if (data) {
    //     this.formObj = this.configService.getGlobalpayload();
    //     if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
    //       this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
    //         'Inbound', 'GRN History', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createGrnHistoryReportForm();
      this.fetchAllProducts();
      this.fetchAllSupplierDetails();
      this.fetchAllProductCategories();
      // this.fetchAllInventories();
      this.fetchAllZones();
      this.fetchAllLocations();
      this.FetchAllGoodsReceipts();
      this.fetchAllWarehouseDetails();
      this.fetchAllCustomers();
    }
  }
  regionArrayList:any;
  wareHouseList:any;
  customerList:any;
  getSelectedValue(event, key) {
    console.log(key);
    if (event) {
      switch (key) {
        case 'getRegionFromSupplierIDName': {
          const filterSupplierIDName = this.supplierMasterList.filter(x => x.supplierIDName === this.grnHistoryReportForm.controls.supplierIDName.value);
          this.regionArrayList = filterSupplierIDName ? filterSupplierIDName.map(x => x.city) : [];
          break;
        }
        case 'getRegionFromSourceWareHouse': {
          const filerSourceWareHouseName = this.wareHouseList.filter(x => x.wareHouseIDName === this.grnHistoryReportForm.controls.wareHouseTransferSourceInfoWareHouseIDName.value);
          this.regionArrayList = filerSourceWareHouseName ? filerSourceWareHouseName.map(x => x.city) : [];
          break;
        }
        case 'getRegionFromCustomerIDName': {
          const filerCustomerIDName = this.customerList.filter(x => x.customerIDName === this.grnHistoryReportForm.controls.customerIDName.value);
          this.regionArrayList = filerCustomerIDName ? filerCustomerIDName.map(x => x.city) : [];
          break;
        }
      }
    }
    else{

      this.grnHistoryReportForm.controls.locationName.setValue(null);
    }
  }

  customerServiceAddressFilterIDs: CompleterData
  customerServiceNameFilterIDs: CompleterData
  customerServiceNameMapList: any;
  customerServiceAddressMapList: any;
  FetchAllGoodsReceipts() {
    this.wmsService.fetchAllGoodsReceipts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceipts) {
          console.log(response.data.goodsReceipts)
          this.customerServiceNameMapList = response.data.goodsReceipts.map(supplierName => supplierName.customersSupplierName)
          this.customerServiceNameFilterIDs = this.customerServiceNameMapList.filter(filterList => filterList != null)
          this.customerServiceAddressMapList = response.data.goodsReceipts.map(supplierName => supplierName.customersSupplierAddress)
          this.customerServiceAddressFilterIDs = this.customerServiceAddressMapList.filter(filterList => filterList != null)
        }
      },
      (error) => {
      });
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseList = response.data.wareHouses;
          this.sourceWareHouses = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
  }
  makeEmpty() {
    this.grnHistoryReportForm.controls.wareHouseTransferSourceInfoWareHouseIDName.setValue(null);
    this.grnHistoryReportForm.controls.supplierIDName.setValue(null);
    this.grnHistoryReportForm.controls.customerIDName.setValue(null);
  }
  createGrnHistoryReportForm() {
    this.grnHistoryReportForm = this.fb.group({
      type: [null],
      grnDateFrom: [null],
      grnDateTo: [null],
      locationName: [null],
      productIDName: [null],
      productCategoryName: [null],
      status: [null],
      supplierIDName: [null],
      customerIDName: null,
      wareHouseTransferSourceInfoWareHouseIDName: null,
      orderType: 'Purchase Order',
      customersSupplierName: [null],
      customersSupplierAddress: [null],
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
    })
  }
  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locationsIDs = response.data.locations.map(locationname => locationname.locationName);
        } else {
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
    this.metaDataService.fetchAllProductCategories({
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
    }).subscribe(
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
        this.wmsService.grnHistoryReportthirdPartyCustomersCheckAllocation = this.thirdPartyCustomersCheckAllocation;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
    this.reportsCommonService.fetchAllCustomers();
    this.reportsCommonService.customerIDNameValues.subscribe(res => {
      this.customerIDNameValues = this.completerService.local(res);
    });
  }

  fetchAllCustomers() {
    this.outboundMasterDataService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers) {
          this.customerList = response.data.customers
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
  generate() {
    this.grnHistoryReportForm.value.grnDateFrom = this.grnHistoryReportForm.value.grnDateFrom ? new Date(this.grnHistoryReportForm.value.grnDateFrom) : null;
    this.grnHistoryReportForm.value.grnDateTo = this.grnHistoryReportForm.value.grnDateTo ? new Date(this.grnHistoryReportForm.value.grnDateTo) : null;
    this.grnHistoryReportForm.value.status = this.grnHistoryReportForm.value.status ? this.grnHistoryReportForm.value.status : null;
    this.grnHistoryReportForm.value.type = this.grnHistoryReportForm.value.type ? this.grnHistoryReportForm.value.type : null;
    this.grnHistoryReportForm.value.locationName = this.grnHistoryReportForm.value.locationName ? this.grnHistoryReportForm.value.locationName : null;
    this.grnHistoryReportForm.value.productIDName = this.grnHistoryReportForm.value.productIDName ? this.grnHistoryReportForm.value.productIDName : null;
    this.grnHistoryReportForm.value.productCategoryName = this.grnHistoryReportForm.value.productCategoryName ? this.grnHistoryReportForm.value.productCategoryName : null;

    const form = this.grnHistoryReportForm.value;
    this.wmsService.grnHistoryFormDataPassing = form

    this.reportsService.fetchAllGrnHistoryReport(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptManagementHistoryReportResponseMap.goodsReceiptManagementHistoryReportResponseList) {
          this.grnhistoryResponseList = response.data.goodsReceiptManagementHistoryReportResponseMap.goodsReceiptManagementHistoryReportResponseList;
          this.totalProductWiseQtyObj = response.data.goodsReceiptManagementHistoryReportResponseMap.totalProductWiseQty;
          this.reportsService.myListhere = this.grnhistoryResponseList;
          this.wmsService.grnHistoryyReportsDisplayTableList = this.grnhistoryResponseList;
          this.wmsService.totalProductWiseQtyObj = response.data.goodsReceiptManagementHistoryReportResponseMap.totalProductWiseQty;

          this.rerender();
        } else {
          this.grnhistoryResponseList = [];
          this.totalProductWiseQtyObj = 0;
          this.rerender();
          // this.toastr.error('Enter valid data');


        }
      },
      (error) => {
      });
  }
  supplierMasterList: any
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierMasterList = response.data.supplierMasters;
          this.suppliersIDs = response.data.supplierMasters.map(supp => supp.supplierIDName);
          console.log(response.data.supplierMasters)
          let cities = response.data.supplierMasters.map(supplier => supplier.city);
          let uniqueNewValues = cities.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
          })
          this.supplierLocationNameIDs = uniqueNewValues;


        }
      },
      (error) => {
      });
  }
  clear() {
    this.grnHistoryReportForm.reset();
    this.createGrnHistoryReportForm();
  }
  // exportAsXLSX() {
  //   if (this.grnhistoryResponseList.length) {
  //     this.excelService.exportAsExcelFile(this.grnhistoryResponseList, 'Grn Hiistory Report', null);
  //   } else {
  //     this.toastr.error('No data available');
  //   }
  // }
  exportAsXLSX() {
    if (this.grnhistoryResponseList.length) {
      const changedPickingData = this.exportTypeMethod(this.grnhistoryResponseList)
      this.excelService.exportAsExcelFile(changedPickingData, 'Grn-History-Report', null);
    } else {
      this.toastr.error('No data available');
    }
  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['Supplier ID Name'] = k.supplierIDName ? k.supplierIDName :null +''+k.customerIDName ? k.customerIDName :null+''+k.wareHouseIDName ? k.wareHouseIDName:null
        obj['Product ID'] = k.productID
        obj['Product Name'] = k.productName
        obj['UOM'] =  k.inventoryUnit
        obj['Product ID Name'] = k.productIDName
        obj['Product Category Name'] = k.productCategoryName
        obj['Received Quantity'] = k.receivedQuantity
        obj['Location Name'] = k.locationName
        obj['Customers Supplier Name'] = k.customersSupplierName
        obj['Customers Supplier Address'] = k.customersSupplierAddress
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Supplier ID Name'] = null
        obj['Product ID'] = null
        obj['Product Name'] = null
        obj['UOM'] = null
        obj['Product ID Name'] = null
        obj['Product Category Name'] = null
        obj['Received Quantity'] = null
        obj['Customers Supplier Name'] = null
        obj['Customers Supplier Address'] = null
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
    //this.forPermissionsSubscription.unsubscribe();
  }
  isFormVisible = false
  onDropDownChange(data) {
    if (data === "Custom Dates") {
      this.wmsService.datePassingHideAndShow = true
      this.isFormVisible = true
    }
    else {
      this.wmsService.datePassingHideAndShow = false
      this.isFormVisible = false
    }
  }
  generatePDF() {
    if (this.grnhistoryResponseList.length > 0) {
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
      this.toastr.error("No Data to print");
    }
  }


}
