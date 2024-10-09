import { NgModule, forwardRef, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OveralldashboardComponent } from '../components/common/dashboard/overalldashboard/overalldashboard.component';
import { DashboardRoutingModule } from '../routes/dashboard-routing.module';
import { DashboardComponent } from '../components/common/dashboard/dashboard.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { TagInputModule } from 'ngx-chips';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { InbounddashboardComponent } from '../components/common/dashboard/dashboard/inbounddashboard/inbounddashboard.component';
import { OutboundComponent } from '../components/common/dashboard/dashboard/outbound/outbound.component';
import { SpaceutilizationComponent } from '../components/common/dashboard/dashboard/spaceutilization/spaceutilization.component';
// import { NgxOrgChartModule } from 'ngx-org-chart';
import { DashboarddemoComponent } from '../components/common/dashboard/dashboard/dashboarddemo/dashboarddemo.component';
import { RegionwiseComponent } from '../components/common/dashboard/dashboard/dashboarddemo/regionwise/regionwise.component';
import { CustomerwiseComponent } from '../components/common/dashboard/dashboard/dashboarddemo/customerwise/customerwise.component';
import { ProductwiseComponent } from '../components/common/dashboard/dashboard/dashboarddemo/productwise/productwise.component';
import { CategorywiseComponent } from '../components/common/dashboard/dashboard/dashboarddemo/categorywise/categorywise.component';
import { PurchaseanalyticsComponent } from '../components/common/dashboard/dashboard/purchaseanalytics/purchaseanalytics.component';
import { SalesanalyticsComponent } from '../components/common/dashboard/dashboard/salesanalytics/salesanalytics.component';
// import { PurchasedataComponent } from '../components/common/dashboard/dashboard/purchaseanalytics/purchasedata/purchasedata.component';
import { ProductwisepurchaseComponent } from '../components/common/dashboard/dashboard/purchaseanalytics/productwisepurchase/productwisepurchase.component';
import { CategorywisepurchaseComponent } from '../components/common/dashboard/dashboard/purchaseanalytics/categorywisepurchase/categorywisepurchase.component';
import { SupplierwiseComponent } from '../components/common/dashboard/dashboard/purchaseanalytics/supplierwise/supplierwise.component';
import { SupplierwisepurchaseComponent } from '../components/common/dashboard/dashboard/purchaseanalytics/supplierwisepurchase/supplierwisepurchase.component';
import { RegionwisepurchaseorderComponent } from '../components/common/dashboard/dashboard/purchaseanalytics/regionwisepurchaseorder/regionwisepurchaseorder.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { AbcanalysisdashboardComponent } from '../components/common/dashboard/dashboard/abcanalysisdashboard/abcanalysisdashboard.component';
import { AbcanalysisseconddashboardComponent } from '../components/common/dashboard/dashboard/abcanalysisdashboard/abcanalysisseconddashboard/abcanalysisseconddashboard.component';
import { AbcanalysisfirstdashboardsComponent } from '../components/common/dashboard/dashboard/abcanalysisdashboard/abcanalysisfirstdashboards/abcanalysisfirstdashboards.component';
import { InventoryComponent } from '../components/common/dashboard/inventory/inventory.component';
import { OrderratedashboardComponent } from '../components/common/dashboard/orderratedashboard/orderratedashboard.component';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { OrdervolumefillrateComponent } from '../components/common/dashboard/orderratedashboard/ordervolumefillrate/ordervolumefillrate.component';
import { OntimeordervolumedeliverydashboardComponent } from '../components/common/dashboard/orderratedashboard/ontimeordervolumedeliverydashboard/ontimeordervolumedeliverydashboard.component';
import { PerfectordervolumerateComponent } from '../components/common/dashboard/orderratedashboard/perfectordervolumerate/perfectordervolumerate.component';
import { InboundoutbounddashboardsComponent } from '../components/common/dashboard/orderratedashboard/inboundoutbounddashboards/inboundoutbounddashboards.component';
import { OrderstatustransactiondashboardsComponent } from '../components/common/dashboard/orderratedashboard/orderstatustransactiondashboards/orderstatustransactiondashboards.component';
import { SharedModule } from '../shared/shared.module';
import { EmployeeInboundOutBoundDashboardComponent } from '../components/common/dashboard/employee-inbound-out-bound-dashboard/employee-inbound-out-bound-dashboard.component';
import { DailyOperationBasedDashboardComponent } from '../components/common/dashboard/daily-operation-based-dashboard/daily-operation-based-dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
    OveralldashboardComponent,
    InbounddashboardComponent,
    SpaceutilizationComponent,
    DashboarddemoComponent,
    OutboundComponent,
    RegionwiseComponent,
    CustomerwiseComponent,
    ProductwiseComponent,
    CategorywiseComponent,
    SalesanalyticsComponent,
    PurchaseanalyticsComponent,
    // PurchasedataComponent,
    ProductwisepurchaseComponent,
    CategorywisepurchaseComponent,
    SupplierwisepurchaseComponent,
    RegionwisepurchaseorderComponent,
    AbcanalysisdashboardComponent,
    SupplierwiseComponent,
    AbcanalysisseconddashboardComponent,
    AbcanalysisfirstdashboardsComponent,
    InventoryComponent,
    OrderratedashboardComponent,
    OrdervolumefillrateComponent,
    OntimeordervolumedeliverydashboardComponent,
    PerfectordervolumerateComponent,
    InboundoutbounddashboardsComponent,
    OrderstatustransactiondashboardsComponent,
    EmployeeInboundOutBoundDashboardComponent,
    DailyOperationBasedDashboardComponent

  ],
  imports: [
    CommonModule,
    // NgxOrgChartModule,
    Ng2CompleterModule,
    TagInputModule,
    NgxChartsModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    DashboardRoutingModule,
    NgApexchartsModule,
    NgxChartsModule,
    BsDatepickerModule.forRoot(),
    NgxSmartModalModule.forRoot(),
    SharedModule
  ],
  providers: [DatePipe, NgxSmartModalService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PurchaseanalyticsComponent),
    },BsDatepickerConfig],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class DashboardModule { }
