import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShipmentOrderReportComponent } from '../components/reports/shipment-order-report/shipment-order-report.component';
import { UserGuard } from '../shared/route-guards/user.guard';
import { InventoryreportComponent } from '../components/reports/inventoryreport/inventoryreport.component';
import { ReportsmodulereportsprintingComponent } from '../components/reports/reportsmodulereportsprinting/reportsmodulereportsprinting.component';
import { HistoryMainComponent } from '../components/common/history-main/history-main.component';

const routes: Routes = [
  { path: '', redirectTo: 'goodsReceiving', pathMatch: 'full' },
  { path: 'goodsReceiving', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'putaway', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'returnOrder', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'grnStageTransaction', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'grnStageSummary', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'grnSummary', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'grnHistory', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'inventory', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'cycleCounting', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'inventoryAdjustments', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'inventoryByLocationReport', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },


  /* Remaining reports */

  { path: 'inventoryByProductReport', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'inventoryTransactionReport', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'inventoryTransactionDetailsReport', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'openSalesOrder', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'picking', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'shipment', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'Newshipmentorder', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'shipmentHistory', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'spaceutilizationHistory', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'spaceutilizationReports', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'locationAvailability', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  { path: 'putawayHistory', component: HistoryMainComponent, canActivate: [UserGuard] },
  { path: 'pickingHistory', component: HistoryMainComponent, canActivate: [UserGuard] },



  /* Others Screen */
  { path: 'shipmentorderReport', component: ShipmentOrderReportComponent, canActivate: [UserGuard] },
  { path: 'inventoryReport', component: InventoryreportComponent, canActivate: [UserGuard] },
  { path: 'inventory-report', component: ReportsmodulereportsprintingComponent, canActivate: [UserGuard] },
  // { path: 'picklist', component: PicklistReportComponent, canActivate: [UserGuard] },






];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
