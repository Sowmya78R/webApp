import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CompleterData } from 'ng2-completer';
import { Constants } from 'src/app/constants/constants';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inventorybylocation',
  templateUrl: './inventorybylocation.component.html',
  styleUrls: ['./inventorybylocation.component.scss']
})
export class InventorybylocationComponent implements OnInit, AfterViewInit, OnDestroy {

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
  inventoryData: any;
  productCategories: any;
  zoneNameIDs: CompleterData;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities',
    'Inventory', 'Inventory by Location', Storage.getSessionUser());
  forPermissionsSubscription: any;
  suppliers: any = [];
  supplierIDName: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  showTooltip: any = false;

  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private wmsService: WMSService,
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
    /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
       if (data) {
         this.formObj = this.configService.getGlobalpayload();
         if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
           this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
             'Inventory', 'Inventory by Location', Storage.getSessionUser());
         }
         this.getFunctionsCall();
       }
     }) */
    this.getFunctionsCall();
  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      this.supplierIDName = (role === 'SUPPLIER') ? this.suppliers.find(x => x.supplierEmailID == user.username).supplierIDName : null;
      this.generate();
    }
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createInventoryByLocationForm()
      this.fetchAllProducts();
      this.fetchAllWarehouseDetails();
      this.fetchAllRacks();
      this.fetchAllLocations();
      this.fetchAllSupplierDetails();
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
          //  this.rerender();
        }
      },
      (error) => {
        this.suppliers = [];
      });
  }
  createInventoryByLocationForm() {
    this.inventoryByLocationForm = this.fb.group({
      productIDName: [null],
      productCategoryName: [null],
      productType: [null],
      rackName: [null],
      locationName: [null],
      zoneName: [null],
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
          // console.log(response.data.productMasters);
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
          //   console.log(response.data.wareHouses);
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
    const form = this.inventoryByLocationForm.value;
    form['supplierIDName']= this.supplierIDName;
    this.reportsService.fetchInventoryByLocation(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryList) {
          this.inventoryData = response.data.inventoryList;
          this.rerender();

        } else {

        }
      },
      (error) => {
      });
  }
  clear() {
    this.createInventoryByLocationForm();
  }
  exportAsXLSX() {
    if (this.inventoryData.length) {
      this.excelService.exportAsExcelFile(this.inventoryData, 'Inventory By Location', null);
    } else {
      this.toastr.error('No data available');
    }
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
}
