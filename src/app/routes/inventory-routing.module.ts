import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryTableComponent } from '../components/inventory/inventory-table.component';
import { InventorymainscreenComponent } from '../components/inventory/inventorymainscreen.component';
import { UserGuard } from '../shared/route-guards/user.guard';
import { InventorybylocationComponent } from '../components/inventory/inventorybylocation/inventorybylocation.component';
import { InventorybyproductComponent } from '../components/inventory/inventorybyproduct/inventorybyproduct.component';
import { InventoryproducttotalsComponent } from '../components/inventory/inventoryproducttotals/inventoryproducttotals.component';
import { InventorytransactionComponent } from '../components/inventory/inventorytransaction/inventorytransaction.component';
import { InventorytransactiondetailsComponent } from '../components/inventory/inventorytransactiondetails/inventorytransactiondetails.component';
import { InternalTransfersComponent } from '../components/internal-transfers/internal-transfers/internal-transfers.component';
import { InventoryAdjustmentsComponent } from '../components/internal-transfers/inventory-adjustments/inventory-adjustments.component';
import { InventoryReceivingComponent } from '../components/inventory/inventory-receiving/inventory-receiving.component';
import { AbcanalysisComponent } from '../components/inventory/abcanalysis/abcanalysis.component';
import { CreateabcanalysisComponent } from '../components/inventory/createabcanalysis/createabcanalysis.component';
import { InventorycountingComponent } from '../components/inventory/inventorycounting/inventorycounting.component';
import { MaintaincyclecountingComponent } from '../components/inventory/maintaincyclecounting/maintaincyclecounting.component';
import { PhysicalInventoryComponent } from '../components/internal-transfers/physical-inventory/physical-inventory.component';
import { GlobalreportprintingComponent } from '../shared/globalreportprinting/globalreportprinting.component';
import { OverallinventoryComponent } from '../components/inventory/overallinventory/overallinventory.component';
import { AegingreportComponent } from '../components/inventory/aegingreport/aegingreport.component';

const routes: Routes = [
  {
    path: '', component: InventoryTableComponent,
    children: [
      // { path: '', redirectTo: 'inventoryTables', pathMatch: 'full' },
      { path: 'lists/inventoryTables', component: InventorymainscreenComponent, canActivate: [UserGuard] },
      { path: 'lists/inventoryByLocation', component: InventorybylocationComponent, canActivate: [UserGuard] },
      { path: 'lists/inventoryByProduct', component: InventorybyproductComponent, canActivate: [UserGuard] },
      { path: 'lists/inventoryproductTotals', component: InventoryproducttotalsComponent, canActivate: [UserGuard] },
      { path: 'lists/inventoryTransaction', component: InventorytransactionComponent, canActivate: [UserGuard] },
      { path: 'lists/inventoryTransactionDetails', component: InventorytransactiondetailsComponent, canActivate: [UserGuard] },
      { path: 'lists/overAllInventory', component: OverallinventoryComponent, canActivate: [UserGuard] },

     ]
  },
  {
    path: '',
    children: [
      // {path: '', redirectTo: 'internalTransfers', pathMatch: 'full'},
      { path: 'internalTransfers', component: InternalTransfersComponent, canActivate: [UserGuard] },
      { path: 'inventoryAdjustments', component: InventoryAdjustmentsComponent, canActivate: [UserGuard] },
      { path: 'inventoryReceiving', component: InventoryReceivingComponent, canActivate: [UserGuard] },
      { path: 'physicalInventory', component: PhysicalInventoryComponent, canActivate: [UserGuard] },
      { path: 'abcAnalysis', component: AbcanalysisComponent, canActivate: [UserGuard] },
      { path: 'createMaintainAnalysis', component: CreateabcanalysisComponent, canActivate: [UserGuard] },
      { path: 'inventoryCounting', component: InventorycountingComponent, canActivate: [UserGuard] },
      { path: 'maintaincyclecounting', component: MaintaincyclecountingComponent, canActivate: [UserGuard] },
      { path: 'createcyclecounting', component: GlobalreportprintingComponent, canActivate: [UserGuard] },
      { path: 'ageingReport', component: AegingreportComponent, canActivate: [UserGuard] },


     // { path: 'createcyclecounting', component: CreatecyclecountingComponent, canActivate: [UserGuard] },
    ]
  }]
@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
