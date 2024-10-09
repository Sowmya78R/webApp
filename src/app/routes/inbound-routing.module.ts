import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaintainPurchaseOrderComponent } from '../components/inbound/purchase-order/maintain-purchase-order/maintain-purchase-order.component';
import { UserGuard } from '../shared/route-guards/user.guard';
import { PutAwayComponent } from '../components/inbound/put-away/put-away.component';
import { CrossDockingComponent } from '../components/inbound/cross-docking/cross-docking.component';
import { MaintainGoodsReceiptComponent } from '../components/inbound/GRN/maintain-goods-receipt/maintain-goods-receipt.component';
import { SalesReturnsComponent } from '../components/inbound/sales-returns/sales-returns.component';
import { GrnNoteComponent } from '../components/grn-note/grn-note.component';
import { GlobalreportprintingComponent } from '../shared/globalreportprinting/globalreportprinting.component';
import { MainCreatepopdfComponent } from '../components/inbound/purchase-order/main-createpopdf/main-createpopdf.component';
import { MaingrnpdfComponent } from '../components/inbound/GRN/maingrnpdf/maingrnpdf.component';
import { DamagedStockComponent } from '../components/inbound/damaged-stock/damaged-stock.component';

const routes: Routes = [
  {
    path: '', children: [
      { path: 'maintainPurchaseOrder', component: MaintainPurchaseOrderComponent, canActivate: [UserGuard] },
      { path: 'createPurchaseOrder', component: MainCreatepopdfComponent, canActivate: [UserGuard] },
      { path: 'maintainGoodsReceipt', component: MaintainGoodsReceiptComponent, canActivate: [UserGuard] },
      { path: 'putaway', component: PutAwayComponent, canActivate: [UserGuard] },
      { path: 'crossDocking', component: CrossDockingComponent, canActivate: [UserGuard] },
      // { path: 'goodsReceiptNote', component: AdvancedShipmentNoticeComponent, canActivate: [UserGuard] },
      { path: 'goodsReceiptNote', component: GrnNoteComponent, canActivate: [UserGuard] },
      // { path: 'goods-receiving', component: ReceivingComponent, canActivate: [UserGuard] },
      { path: 'goodsReceipt', component: MaingrnpdfComponent, canActivate: [UserGuard] },
      { path: 'sales-returns', component: SalesReturnsComponent, canActivate: [UserGuard] },
      { path: 'Inward', component: GlobalreportprintingComponent, canActivate: [UserGuard] },
      /*  { path: 'Inward', component: GlobalreportprintingComponent, canActivate: [UserGuard] }, */
      { path: 'purchase-request', component: GlobalreportprintingComponent, canActivate: [UserGuard] },
      { path: 'damagedStock', component: DamagedStockComponent, canActivate: [UserGuard] },
    ]
  }]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboundRoutingModule { }
