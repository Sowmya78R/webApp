import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserGuard } from '../shared/route-guards/user.guard';
import { MaintainSalesOrderComponent } from '../components/outbound/sales-order/maintain-sales-order/maintain-sales-order.component';
import { PickingComponent } from '../components/outbound/picking/picking.component';
import { MaintainShipmentOrderComponent } from '../components/outbound/shipment-order/maintain-shipment-order/maintain-shipment-order.component';
import { ReplenishmentHistoryComponent } from '../components/outbound/replenishment/replenishment-history/replenishment-history.component';
import { MainInvoicingComponent } from '../components/outbound/invoicing/main-invoicing/main-invoicing.component';
import { CreateSOComponent } from '../components/outbound/sales-order/create-so/create-so.component';
import { GlobalreportprintingComponent } from '../shared/globalreportprinting/globalreportprinting.component';
import { MainShipmentOrderComponent } from '../components/outbound/shipment-order/main-shipment-order/main-shipment-order.component';
import { GateentryoutboundComponent } from '../components/outbound/gateentryoutbound/gateentryoutbound.component';
import { ReplacementOrderComponent } from '../components/outbound/picking/replacement-order/replacement-order.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'createSalesOrder', component: CreateSOComponent, canActivate: [UserGuard] },
      { path: 'maintainSalesOrder', component: MaintainSalesOrderComponent, canActivate: [UserGuard] },
      { path: 'picking', component: PickingComponent, canActivate: [UserGuard] },
      { path: 'replacementOrder', component: ReplacementOrderComponent, canActivate: [UserGuard] },
      { path: 'replenishmentHistory', component: ReplenishmentHistoryComponent, canActivate: [UserGuard] },
      { path: 'editShipmentOrder', component: MainShipmentOrderComponent, canActivate: [UserGuard] },
      { path: 'maintainShipmentOrder', component: MaintainShipmentOrderComponent, canActivate: [UserGuard] },
      { path: 'editInvoicing', component: MainInvoicingComponent, canActivate: [UserGuard] },
      { path: 'outward', component: GlobalreportprintingComponent, canActivate: [UserGuard] },
      { path: 'maintainInvoicing', component: GlobalreportprintingComponent, canActivate: [UserGuard] },
      { path: 'outboundGateEntry', component: GateentryoutboundComponent, canActivate: [UserGuard] },

    ]
  }]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutboundRoutingModule { }
