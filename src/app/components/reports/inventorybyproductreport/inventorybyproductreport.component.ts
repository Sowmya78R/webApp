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
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inventorybyproductreport',
  templateUrl: './inventorybyproductreport.component.html',
  styleUrls: ['./inventorybyproductreport.component.scss']
})
export class InventorybyproductreportComponent implements OnInit, OnDestroy {


  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  inventoryByProdyctForm: FormGroup;

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
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inventory', 'Inventory by Product', Storage.getSessionUser());
  forPermissionsSubscription: any;
  suppliers: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  supplierIDName: any = null;

  constructor(private wmsService: WMSService,
    private excelService: ExcelService, private configService: ConfigurationService,
    private reportsService: ReportsService, private completerService: CompleterService
    , private toastr: ToastrService, private fb: FormBuilder, private metaDataService: MetaDataService, private commonService: CommonService,
    private translate: TranslateService,private datepipe: DatePipe,) {
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
    //         'Inventory', 'Inventory by Product', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createInventoryByProductForm();
      this.fetchAllProducts();
      this.fetchAllSupplierDetails();
      this.fetchAllProductCategories();
      this.fetchAllInventories();
      this.fetchAllZones();
    }

  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      this.supplierIDName = (role === 'SUPPLIER') ? this.suppliers.find(x => x.supplierEmailID == user.username).supplierIDName : null;
      this.inventoryByProdyctForm.controls.supplierIDName.patchValue(this.supplierIDName);
    }
  }
  createInventoryByProductForm() {
    this.inventoryByProdyctForm = this.fb.group({
      productIDName: null,
      productCategoryName: null,
      productType: null,
      supplierIDName: null,
      batchNumber: null,
      serialNumber: null,
      zoneName: null,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
    })
  }
  zoneNameValues: CompleterData;
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
        //  this.productCategories = [];
      }
    );
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          console.log(response.data.productMasters);
          this.products = response.data.productMasters.map(productID => productID.productIDName);
          // this.categoryDrop = response.data.productMasters.map(productID => productID.productCategoryInfo.productCategoryName);
        } else {
        }
      },
      (error) => {
      });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  fetchAllInventories() {
    this.wmsService.findAllInventories('', this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventories) {
          const bIn = response.data.inventories.filter(x => x.batchNumber != null);
          const sIn = response.data.inventories.filter(x => x.serialNumber != null);
          const dupBin = bIn ? bIn.map(x => x.batchNumber) : null;
          this.batchNumberIDs = this.removeDuplicates(dupBin);
          const dupsIn = sIn ? sIn.map(x => x.serialNumber) : null;
          this.serialNumberIDs = this.removeDuplicates(dupsIn);
        } else {
          this.batchNumberIDs = null;
          this.serialNumberIDs = null;
        }
      },
      (error) => {
        this.batchNumberIDs = null;
        this.serialNumberIDs = null;
      });
  }


  generate() {
    this.inventoryByProdyctForm.value.productIDName = this.inventoryByProdyctForm.value.productIDName ? this.inventoryByProdyctForm.value.productIDName : null;
    this.inventoryByProdyctForm.value.productCategoryName = this.inventoryByProdyctForm.value.productCategoryName ? this.inventoryByProdyctForm.value.productCategoryName : null;
    this.inventoryByProdyctForm.value.productType = this.inventoryByProdyctForm.value.productType ? this.inventoryByProdyctForm.value.productType : null;
    this.inventoryByProdyctForm.value.supplierIDName = this.inventoryByProdyctForm.value.supplierIDName ? this.inventoryByProdyctForm.value.supplierIDName : null;
    this.inventoryByProdyctForm.value.batchNumber = this.inventoryByProdyctForm.value.batchNumber ? this.inventoryByProdyctForm.value.batchNumber : null;
    this.inventoryByProdyctForm.value.serialNumber = this.inventoryByProdyctForm.value.serialNumber ? this.inventoryByProdyctForm.value.serialNumber : null;
    this.inventoryByProdyctForm.value.zoneName = this.inventoryByProdyctForm.value.zoneName ? this.inventoryByProdyctForm.value.zoneName : null;
    this.wmsService.inventoryByProductReportFormDataPassing = this.inventoryByProdyctForm.value;
    this.reportsService.fetchInventoryByProduct(this.inventoryByProdyctForm.value).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryList) {
          this.productData = response.data.inventoryList;
          this.wmsService.inventoryByProductReportsDisplayTableList = this.productData;
          this.rerender();
        } else {
          // this.toastr.error('Enter valid data');
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
          this.suppliersIDs = response.data.supplierMasters.map(supplier => supplier.supplierIDName);
          console.log(response.data.supplierMasters)
          this.getRole();
        }
      },
      (error) => {
        //  this.suppliers = [];
      });
  }
  clear() {
    this.createInventoryByProductForm();
  }
  exportAsXLSX() {
    if (this.productData) {
      const changedPickingData = this.exportTypeMethod(this.productData)
      this.excelService.exportAsExcelFile(changedPickingData, 'Inventory-By-Product-Report', null);
    } else {
      this.toastr.error('No data to download');
    }
  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['Product ID'] = k.productMasterInfo.productID
        obj['Product Name'] = k.productMasterInfo.productName
        obj['UOM'] =k.inventoryUnit
        obj['Supplier ID Name'] = k.supplierMasterInfo.supplierIDName
        obj['Product Type'] = k.productType
        obj['Product Class'] = k.productClass
        obj['Product Description'] = k.productDescription
        obj['Product Category Name'] = k.productCategoryInfo.productCategoryName
        obj['Quantity Inventory Unit'] = k.quantityInventoryUnit
        obj['Available Quantity'] = k.availableQuantity
        obj['Reserved Quantity'] = k.reservedQuantity
        obj['Batch Number'] = k.batchNumber
        obj['Serial Number'] = k.serialNumber
        obj['Mfg Date'] =k.mfgDate ? this.datepipe.transform(new Date(k.mfgDate), 'dd/MM/yyyy') : null
        obj['WareHouse Name'] = k.wareHouseInfo.wareHouseName
        obj['Zone Name'] = k.zoneInfo.zoneName
        obj['Rack Name'] = k.rackInfo.rackName
        obj['Column Name'] = k.columnInfo.columnName
        obj['Level Name'] = k.levelInfo.levelName
        obj['Location Name'] = k.locationInfo.locationName
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Product ID'] = null;
      obj['Product Name'] = null;
      obj['UOM'] = null
      obj['Supplier ID Name'] = null;
      obj['Product Type'] = null;
      obj['Product Class'] = null;
      obj['Product Description'] = null;
      obj['Product Category Name'] = null;
      obj['Quantity Inventory Unit'] = null;
      obj['Available Quantity'] = null;
      obj['Reserved Quantity'] = null;
      obj['Batch Number'] = null;
      obj['Serial Number'] = null;
      obj['Mfg Date'] = null;
      obj['WareHouse Name'] = null;
      obj['Zone Name'] = null;
      obj['Rack Name'] = null;
      obj['Column Name'] = null;
      obj['Level Name'] = null;
      obj['Location Name'] = null;
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

/*
  generatePDF() {
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 300);
  }
 */
  generatePDF() {
    if(this.productData.length > 0)
    {
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
  else{
    this.toastr.error("No Data to Print.")

  }
}


}
