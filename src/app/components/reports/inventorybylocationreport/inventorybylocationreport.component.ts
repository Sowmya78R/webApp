import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { Constants } from 'src/app/constants/constants';
import { FormGroup, FormBuilder } from '@angular/forms';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inventorybylocationreport',
  templateUrl: './inventorybylocationreport.component.html',
  styleUrls: ['./inventorybylocationreport.component.scss']
})
export class InventorybylocationreportComponent implements OnInit, OnDestroy {


  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  locationsIDs: CompleterData;
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData
  rackIDs: CompleterData;
  inventoryByLocationForm: FormGroup;
  products: CompleterData;
  //categoryDrp: any;
  warehouses: CompleterData;
  warehouseIDName: any;
  inventoryData: any = [];
  productCategories: any;
  zoneNameIDs: CompleterData;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inventory', 'Inventory by Location', Storage.getSessionUser());
  forPermissionsSubscription: any;
  suppliers: any = [];
  supplierIDName: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private wmsService: WMSService,private datepipe: DatePipe,
    private reportsService: ReportsService,
    private excelService: ExcelService, private toastr: ToastrService
    , private metaDataService: MetaDataService,
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
    //         'Inventory', 'Inventory by Location', Storage.getSessionUser());
    //     }
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createInventoryByLocationForm();
      this.fetchAllSupplierDetails();
      this.fetchAllProducts();
      this.fetchAllWarehouseDetails();
      this.fetchAllRacks();
      this.fetchAllLocations();
      this.fetchAllProductCategories();
      this.fetchAllZones();
    }
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
  newFormGroup() {
    const newReqObj = {
      "wareHouseIDName1": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName
    }
  }
  createInventoryByLocationForm() {
    this.inventoryByLocationForm = this.fb.group({
      productIDName: [''],
      productCategoryName: [''],
      productType: [''],
      rackName: [''],
      locationName: [''],
      zoneName: [''],
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName
    })
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones) {
          this.zoneNameIDs = response.data.zones.map(x => x.zoneName)
        }
      })
  }
  fetchAllProductCategories() {
    this.metaDataService.fetchAllProductCategories(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length) {
          this.categoryDrop = response.data.productCategories.map(categoryname => categoryname.productCategoryName);
        }
      },
      error => {
        this.productCategories = [];
      }
    );
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          console.log(response.data.productMasters);
          this.products = response.data.productMasters.map(productID => productID.productIDName);
          //  this.categoryDrop = response.data.productMasters.map(productID => productID.productCategoryInfo.productCategory);
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          console.log(response.data.wareHouses);
          this.warehouses = response.data.wareHouses.map(warehouse => warehouse.wareHouseIDName);
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
          this.rackIDs = response.data.racks.map(rackname => rackname.rackName);
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
          this.locationsIDs = response.data.locations.map(locationname => locationname.locationName);
        } else {
        }
      },
      (error) => {
      });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  generate() {
    this.inventoryByLocationForm.value.productIDName = this.inventoryByLocationForm.value.productIDName ? this.inventoryByLocationForm.value.productIDName : null;
    this.inventoryByLocationForm.value.productCategoryName = this.inventoryByLocationForm.value.productCategoryName ? this.inventoryByLocationForm.value.productCategoryName : null;
    this.inventoryByLocationForm.value.productType = this.inventoryByLocationForm.value.productType ? this.inventoryByLocationForm.value.productType : null;
    this.inventoryByLocationForm.value.rackName = this.inventoryByLocationForm.value.rackName ? this.inventoryByLocationForm.value.rackName : null;
    this.inventoryByLocationForm.value.locationName = this.inventoryByLocationForm.value.locationName ? this.inventoryByLocationForm.value.locationName : null;
    this.inventoryByLocationForm.value.zoneName = this.inventoryByLocationForm.value.zoneName ? this.inventoryByLocationForm.value.zoneName : null;
    this.wmsService.inventoryByLocationFormDataPassing = this.inventoryByLocationForm.value;
    const form = this.inventoryByLocationForm.value;
    form['supplierIDName'] = this.supplierIDName
    this.reportsService.fetchInventoryByLocation(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryList) {
          this.inventoryData = response.data.inventoryList;
          this.wmsService.inventoryByLocationsDisplayTableList = this.inventoryData;
          console.log(this.wmsService.inventoryByLocationsDisplayTableList);
          this.rerender();
        } else {
          alert('no data')
        }
      },
      (error) => {
      });
  }
  clear() {
    this.createInventoryByLocationForm();
  }
  // exportAsXLSX() {
  //   if (this.inventoryData.length) {
  //     this.excelService.exportAsExcelFile(this.inventoryData, 'Inventory By Location', Constants.EXCEL_IGNORE_FIELDS.INVENTORY_BY_LOCATION_REPORT);
  //   } else {
  //     this.toastr.error('No data available');
  //   }
  // }
  exportAsXLSX() {
    if (this.inventoryData.length) {
      const changedPickingData = this.exportTypeMethod(this.inventoryData)
      this.excelService.exportAsExcelFile(changedPickingData, 'Inventory-By-Location-Report', null);
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
        obj['Product ID'] = k.productMasterInfo.productID
        obj['Product Name'] = k.productMasterInfo.productName
        obj['UOM'] =k.inventoryUnit
        obj['Product Description'] = k.productDescription
        obj['Product Category'] = k.productCategoryInfo.productCategory
        obj['Quantity Inventory Unit'] = k.quantityInventoryUnit
        obj['Available Quantity'] = k.availableQuantity
        obj['Reserved Quantity'] = k.reservedQuantity
        obj['Batch Number'] = k.batchNumber
        obj['Manufacture Date'] = k.mfgDate ? this.datepipe.transform(new Date(k.mfgDate), 'dd/MM/yyyy') : null
        obj['Expiry Date'] = k.expiryDate ? this.datepipe.transform(new Date(k.expiryDate), 'dd/MM/yyyy') : null
        obj['WareHouse ID Name'] = k.wareHouseInfo.wareHouseIDName
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
      obj['Product Description'] = null;
      obj['Product Category'] = null;
      obj['Quantity Inventory Unit'] = null;
      obj['Available Quantity'] = null;
      obj['Reserved Quantity'] = null;
      obj['Batch Number'] = null;
      obj['Mfg Date'] = null;
      obj['Expiry Date'] = null;
      obj['wareHouseName'] = null;
      obj['WareHouse ID Name'] = null;
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
 */
  generatePDF() {
    if(this.inventoryData.length > 0)
    {
      console.log(this.inventoryData);
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
