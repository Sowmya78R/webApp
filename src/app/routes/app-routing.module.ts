

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WarehouseLayoutComponent } from '../components/common/warehouse-layout/warehouse-layout.component';
import { HomePageComponent } from '../components/common/home-page/home-page.component';
import { SubMenuComponent } from '../components/common/sub-menu/sub-menu.component';
import { UserGuard } from '../shared/route-guards/user.guard';
import { MaintainwarehousetransferComponent } from '../components/common/warehouseScreens/maintainwarehousetransfer/maintainwarehousetransfer.component';
import { WarehousetransferComponent } from '../components/common/warehouseScreens/warehousetransfer/warehousetransfer.component';
import { CreateWareHouseComponent } from '../components/common/warehouseScreens/create-ware-house/create-ware-house.component';
import { IssueinventoryComponent } from '../components/outbound/issueinventory/issueinventory.component';
import { MainWarehousetransferComponent } from '../components/common/warehouseScreens/main-warehousetransfer/main-warehousetransfer.component';
import { PurchaseReturnsComponent } from '../components/outbound/purchase-returns/purchase-returns.component';
import {  } from '../components/inbound/put-away/putawaymanagement/putawaymanagement.component';
import { HistoryMainComponent } from '../components/common/history-main/history-main.component';

const routes: Routes = [
  { path: 'homepage', component: HomePageComponent },
  {
    path: 'masterdata', loadChildren: () => import('../modules/masterdata.module').then(m => m.MasterDataModule),
    // data: { preload: true, loadAfterSeconds: 10 },
  },
  // { path: 'dashboard', component: DashboardComponent },

  // {path: 'dashboard', component: DashboardComponent,
  // children: [
  //   { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  //   { path: 'overAllDashboard', component: OveralldashboardComponent}
  // ]
  // },
  //{ path: 'overAllDashboard', component: OveralldashboardComponent},
  { path: 'dashboard', loadChildren: () => import('../modules/dashboard.module').then(m => m.DashboardModule) },
  { path: 'config', loadChildren: () => import('../modules/configuration.module').then(m => m.ConfigurationModule) },
  { path: 'reports', loadChildren: () => import('../modules/reports.module').then(m => m.ReportsModule) },
  { path: 'subMenu/:id', component: SubMenuComponent },
  { path: 'v1/inbound', loadChildren: () => import('../modules/inbound.module').then(m => m.InboundModule) },
  { path: 'v1/outbound', loadChildren: () => import('../modules/outbound.module').then(m => m.OutboundModule) },
  { path: 'v1/inventory', loadChildren: () => import('../modules/inventory.module').then(m => m.InventoryModule) },
  { path: 'v1/vas', loadChildren: () => import('../modules/vas.module').then(m => m.VASModule) },
  { path: 'v1/workforce', loadChildren: () => import('../modules/workforce.module').then(m => m.WorkforceModule) },
  { path: 'v1/barcode', loadChildren: () => import('../modules/barcode.module').then(m => m.BarcodeModule) },

  { path: 'v1', loadChildren: () => import('../modules/wms.module').then(m => m.WMSModule) },
  { path: 'putawayHistory', component: HistoryMainComponent, canActivate: [UserGuard] },
  { path: 'pickingHistory', component: HistoryMainComponent, canActivate: [UserGuard] },
  { path: 'warehouseLayout', component: WarehouseLayoutComponent },
  { path: 'wareHouseTransfer', component: WarehousetransferComponent, canActivate: [UserGuard] },
  { path: 'maintainWarehouseTransfer', component: MainWarehousetransferComponent, canActivate: [UserGuard] },
  { path: 'createWareHouseTransfer', component: CreateWareHouseComponent, canActivate: [UserGuard] },
  { path: 'issueInventory', component: IssueinventoryComponent, canActivate: [UserGuard] },
  { path: 'purchaseReturns', component: PurchaseReturnsComponent, canActivate: [UserGuard] },

];

@NgModule({
  // preloadingStrategy: CustomPreloadingStrategyService,
  imports: [RouterModule.forRoot(routes,
    { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
