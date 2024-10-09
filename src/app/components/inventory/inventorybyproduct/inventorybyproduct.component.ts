import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Constants } from 'src/app/constants/constants';
import { CompleterData } from 'ng2-completer';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { ToastrService } from 'ngx-toastr';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inventorybyproduct',
  templateUrl: './inventorybyproduct.component.html',
  styleUrls: ['./inventorybyproduct.component.scss']
})
export class InventorybyproductComponent implements OnInit, OnDestroy {

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
  permissionsList = this.configService.getPermissions('mainFunctionalities',
    'Inventory', 'Inventory by Product', Storage.getSessionUser());
  forPermissionsSubscription: any;
  suppliers: any = [];
  supplierIDName: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  showTooltip: any = false;

  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private excelService: ExcelService,
    private reportsService: ReportsService,
    private toastr: ToastrService, private fb: FormBuilder, private metaDataService: MetaDataService,
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
    /*   this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
        if (data) {
          if (this.configService.getPermissions != null && this.configService.getPermissions != undefined) {
            this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
              'Inventory', 'Inventory by Product', Storage.getSessionUser());
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
      this.inventoryByProdyctForm.controls.supplierIDName.setValue(this.supplierIDName);
      this.generate();
    }
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createInventoryByProductForm();
      this.fetchAllProducts();
      this.fetchAllSupplierDetails();
      this.fetchAllProductCategories();
      this.fetchAllInventories();
    }
  }
  createInventoryByProductForm() {
    this.inventoryByProdyctForm = this.fb.group({
      productIDName: [null],
      productCategoryName: [null],
      productType: [null],
      supplierIDName: [null],
      batchNumber: [null],
      serialNumber: [null],
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName
    })
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
        //  this.productCategories = [];
      }
    );
  }
  fetchAllProducts() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          //  console.log(response.data.productMasters);
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
    this.wmsService.findAllInventories('', this.configService.getGlobalpayload()).subscribe(
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
    this.reportsService.fetchInventoryByProduct(this.inventoryByProdyctForm.value).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryList) {
          this.productData = response.data.inventoryList;
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
          this.suppliersIDs = response.data.supplierMasters.map(supplier => supplier.supplierIDName);
          //   console.log(response.data.supplierMasters)
          this.getRole();

        }
      },
      (error) => {
      });
  }

  clear() {
    this.createInventoryByProductForm();
  }
  exportAsXLSX() {
    if (this.productData.length) {
      this.excelService.exportAsExcelFile(this.productData, 'Inventory By Product', null);
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
