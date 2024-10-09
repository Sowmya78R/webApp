import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OveralldashboardComponent } from '../components/common/dashboard/overalldashboard/overalldashboard.component';
import { UserGuard } from '../shared/route-guards/user.guard';
import { DashboardComponent } from '../components/common/dashboard/dashboard.component';
import { InboundCapacityComponent } from '../components/planning/inbound-capacity/inbound-capacity.component';
import { InbounddashboardComponent } from '../components/common/dashboard/dashboard/inbounddashboard/inbounddashboard.component';
import { OutboundComponent } from '../components/common/dashboard/dashboard/outbound/outbound.component';
import { SpaceutilizationComponent } from '../components/common/dashboard/dashboard/spaceutilization/spaceutilization.component';
import { DashboarddemoComponent } from '../components/common/dashboard/dashboard/dashboarddemo/dashboarddemo.component';
import { PurchaseanalyticsComponent } from '../components/common/dashboard/dashboard/purchaseanalytics/purchaseanalytics.component';
import { SalesanalyticsComponent } from '../components/common/dashboard/dashboard/salesanalytics/salesanalytics.component';
import { AbcanalysisdashboardComponent } from '../components/common/dashboard/dashboard/abcanalysisdashboard/abcanalysisdashboard.component';
import { InventoryComponent } from '../components/common/dashboard/inventory/inventory.component';
import { OrderratedashboardComponent } from '../components/common/dashboard/orderratedashboard/orderratedashboard.component';
import { InboundoutbounddashboardsComponent } from '../components/common/dashboard/orderratedashboard/inboundoutbounddashboards/inboundoutbounddashboards.component';
import { OrderstatustransactiondashboardsComponent } from '../components/common/dashboard/orderratedashboard/orderstatustransactiondashboards/orderstatustransactiondashboards.component';
import { DailyOperationBasedDashboardComponent } from '../components/common/dashboard/daily-operation-based-dashboard/daily-operation-based-dashboard.component';
import { EmployeeInboundOutBoundDashboardComponent } from '../components/common/dashboard/employee-inbound-out-bound-dashboard/employee-inbound-out-bound-dashboard.component';

const routes: Routes = [{
  path: '', component: DashboardComponent,
  children: [
    { path: 'dashboard', component: DashboardComponent, canActivate: [UserGuard] },
    { path: 'overAllDashboard', component: OveralldashboardComponent, canActivate: [UserGuard] },
    { path: 'inbound', component: InbounddashboardComponent, canActivate: [UserGuard] },
    { path: 'outbound', component: OutboundComponent, canActivate: [UserGuard] },
    { path: 'spaceUtilization', component: SpaceutilizationComponent, canActivate: [UserGuard] },
    { path: 'salesAnalytics', component: SalesanalyticsComponent, canActivate: [UserGuard] },
    { path: 'purchaseAnalytics', component: PurchaseanalyticsComponent, canActivate: [UserGuard] },
    { path: 'AbcAnalysis', component: AbcanalysisdashboardComponent, canActivate: [UserGuard] },
    { path: 'Inventory', component: InventoryComponent, canActivate: [UserGuard] },
    { path: 'orderRateTypeDashboard', component: OrderratedashboardComponent, canActivate: [UserGuard] },
    { path: 'employeeInboundOutBoundDashboard', component: EmployeeInboundOutBoundDashboardComponent, canActivate: [UserGuard] },
    { path: 'dailyOperationBasedDashboard', component: DailyOperationBasedDashboardComponent, canActivate: [UserGuard] },

    /* { path: 'orderRateTypeDashboard', component: OrderratedashboardComponent, canActivate: [UserGuard] },
    { path: 'employeeInboundOutBoundDashboard', component: InboundoutbounddashboardsComponent, canActivate: [UserGuard] },
    { path: 'dailyOperationBasedDashboard', component: OrderstatustransactiondashboardsComponent, canActivate: [UserGuard] },  */
  ]
}]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
