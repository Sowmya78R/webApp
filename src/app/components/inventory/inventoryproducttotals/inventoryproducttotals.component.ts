import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-inventoryproducttotals',
  templateUrl: './inventoryproducttotals.component.html',
  styleUrls: ['./inventoryproducttotals.component.scss']
})
export class InventoryproducttotalsComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  inventoryProductTotals: any;
  inventoryProduct: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities',
    'Inventory', 'Inventory Item Totals', Storage.getSessionUser());
    suppliers: any = [];
    supplierIDName: any = null;
    language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;


  constructor(private reportsService: ReportsService, private configService: ConfigurationService,
    private wmsService:WMSService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
     }

  ngOnInit() {
    if (this.permissionsList.includes('View')) {
      this.fetchAllSupplierDetails();
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
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
      this.generate();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  quantityInventoryUnit: any;
  availbleQuantity: any;
  reservedQuantity: any;

  generate() {
  this.formObj['supplierIDName'] = this.supplierIDName;
    this.reportsService.fetchProductTotal(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryProductTotals) {
          this.inventoryProduct = response.data.inventoryProductTotals;
          this.quantityInventoryUnit = this.inventoryProduct.totalQuantityInventoryUnit;
          this.availbleQuantity = this.inventoryProduct.totalAvailableQuantity;
          this.reservedQuantity = this.inventoryProduct.totalReservedQuantity;
          this.rerender();
        } else {
        }
      },
      (error) => {
      });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}
