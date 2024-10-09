import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryReceivingComponent } from '../components/inventory/inventory-receiving/inventory-receiving.component';
import { InventoryTableComponent } from '../components/inventory/inventory-table.component';
import { InventorybylocationComponent } from '../components/inventory/inventorybylocation/inventorybylocation.component';
import { InventorymainscreenComponent } from '../components/inventory/inventorymainscreen.component';
import { InventorybyproductComponent } from '../components/inventory/inventorybyproduct/inventorybyproduct.component';
import { InventoryproducttotalsComponent } from '../components/inventory/inventoryproducttotals/inventoryproducttotals.component';
import { InventorytransactionComponent } from '../components/inventory/inventorytransaction/inventorytransaction.component';
import { InventorytransactiondetailsComponent } from '../components/inventory/inventorytransactiondetails/inventorytransactiondetails.component';
import { CreateabcanalysisComponent } from '../components/inventory/createabcanalysis/createabcanalysis.component';
import { AbcanalysisComponent } from '../components/inventory/abcanalysis/abcanalysis.component';
import { SharedModule } from '../shared/shared.module';
import { InventoryRoutingModule } from '../routes/inventory-routing.module';
import { InternalTransfersComponent } from '../components/internal-transfers/internal-transfers/internal-transfers.component';
import { InventoryAdjustmentsComponent } from '../components/internal-transfers/inventory-adjustments/inventory-adjustments.component';
import { InboundMasterDataService } from '../services/integration-services/inboundMasterData.service';
import { AbcgraphComponent } from '../components/inventory/abcgraph/abcgraph.component';
import { MultidimensionalanalysisComponent } from '../components/inventory/abcanalysis/multidimensionalanalysis/multidimensionalanalysis.component';
import { AbcproductsComponent } from '../components/inventory/abcanalysis/abcproducts/abcproducts.component';
import { MultidimensionalproductsComponent } from '../components/inventory/abcanalysis/multidimensionalproducts/multidimensionalproducts.component';
import { InventorycountingComponent } from '../components/inventory/inventorycounting/inventorycounting.component';
import { MaintaincyclecountingComponent } from '../components/inventory/maintaincyclecounting/maintaincyclecounting.component';
import { PhysicalInventoryComponent } from '../components/internal-transfers/physical-inventory/physical-inventory.component';
import { OverallinventoryComponent } from '../components/inventory/overallinventory/overallinventory.component';
import { AegingreportComponent } from '../components/inventory/aegingreport/aegingreport.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    InventoryReceivingComponent,
    InventoryTableComponent,
    InventorybylocationComponent,
    InventorymainscreenComponent,
    InventorybyproductComponent,
    InventoryproducttotalsComponent,
    InventorytransactionComponent,
    InventorytransactiondetailsComponent,
    CreateabcanalysisComponent,
    AbcanalysisComponent,
    InternalTransfersComponent,
    InventoryAdjustmentsComponent,
    PhysicalInventoryComponent,
    AbcgraphComponent,
    MultidimensionalanalysisComponent,
    AbcproductsComponent,
    MultidimensionalproductsComponent,

    InventorycountingComponent,
    MaintaincyclecountingComponent,
    OverallinventoryComponent,
    AegingreportComponent
  ],
  imports: [
    SharedModule,
    InventoryRoutingModule,
    NgxPaginationModule
  ],
  providers:[InboundMasterDataService]
})
export class InventoryModule { }
