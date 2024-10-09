import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './routes/app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth.module';
import { AuthReqService } from './services/integration-services/auth-req.service';
import { MetaDataService } from './services/integration-services/metadata.service';
import { ApexService } from './shared/services/apex.service';
import { NavBarComponent } from './components/common/nav-bar/nav-bar.component';
import { WarehouseLayoutComponent } from './components/common/warehouse-layout/warehouse-layout.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { HomePageComponent } from './components/common/home-page/home-page.component';
import { SubMenuComponent } from './components/common/sub-menu/sub-menu.component';
import { MasterMenusComponent } from './components/common/master-menus/master-menus.component';
import { DataTableComponent } from './components/common/data-table/data-table.component';
import { ReportsService } from './services/integration-services/reports.service';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { MasterDataModule } from './modules/masterdata.module';
import { NgApexchartsModule } from "ng-apexcharts";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { WarehousetransferComponent } from './components/common/warehouseScreens/warehousetransfer/warehousetransfer.component';
import { CreateWareHouseComponent } from './components/common/warehouseScreens/create-ware-house/create-ware-house.component';
import { MaintainwarehousetransferComponent } from './components/common/warehouseScreens/maintainwarehousetransfer/maintainwarehousetransfer.component';
import { NzTreeSelectModule } from 'ng-zorro-antd';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { IssueinventoryComponent } from './components/outbound/issueinventory/issueinventory.component';
import { MainWarehousetransferComponent } from './components/common/warehouseScreens/main-warehousetransfer/main-warehousetransfer.component';
import { PrintWarehousetransferComponent } from './components/common/warehouseScreens/print-warehousetransfer/print-warehousetransfer.component';
import { PurchaseReturnsComponent } from './components/outbound/purchase-returns/purchase-returns.component';
import { NgxPaginationModule } from 'ngx-pagination';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    WarehouseLayoutComponent,
    FooterComponent,
    HomePageComponent,
    SubMenuComponent,
    MasterMenusComponent,
    DataTableComponent,
    WarehousetransferComponent,
    CreateWareHouseComponent,
    MaintainwarehousetransferComponent,
    IssueinventoryComponent,
    MainWarehousetransferComponent,
    PrintWarehousetransferComponent,
    PurchaseReturnsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    AuthModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({ positionClass: 'toast-top-center', timeOut: 2000 }),
    NgxSmartModalModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    MasterDataModule,
    NgApexchartsModule,
    NzTreeSelectModule,
    NgxPaginationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

  ],
  providers: [
    ApexService,
    AuthReqService,
    MetaDataService,
    ReportsService,
  ],
  exports: [
    NavBarComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
