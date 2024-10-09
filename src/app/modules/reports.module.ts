import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { DataTablesModule } from 'angular-datatables';
// import { NgxSmartModalModule } from 'ngx-smart-modal';
// import { Ng2CompleterModule } from 'ng2-completer';

import { ReportsRoutingModule } from '../routes/reports-routing.module';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportsService } from '../services/integration-services/reports.service';

import { GoodsReceivingReportComponent } from '../components/reports/goods-receiving-report/goods-receiving-report.component';
import { InventorySummaryComponent } from '../components/reports/inventory-summary/inventory-summary.component';
import { PutawayReportComponent } from '../components/reports/putaway-report/putaway-report.component';
import { PicklistReportComponent } from '../components/reports/picklist-report/picklist-report.component';
import { PickingReportComponent } from '../components/reports/picking-report/picking-report.component';
import { ShipmentOrderReportComponent } from '../components/reports/shipment-order-report/shipment-order-report.component';
import { InventoryAdjustmentsReportComponent } from '../components/reports/inventory-adjustments-report/inventory-adjustments-report.component';
import { CycleCountingReportComponent } from '../components/reports/cycle-counting-report/cycle-counting-report.component';
import { OpenSalesOrderReportComponent } from '../components/reports/open-sales-order-report/open-sales-order-report.component';
import { SharedModule } from '../shared/shared.module';
import { ReturnOrderComponent } from '../components/reports/return-order/return-order.component';
import { ShipmentorderreportComponent } from '../components/reports/shipmentorderreport/shipmentorderreport.component';
import { GrnstagesummaryreportComponent } from '../components/reports/grnstagesummaryreport/grnstagesummaryreport.component';
import { GrnstagetransactionreportComponent } from '../components/reports/grnstagetransactionreport/grnstagetransactionreport.component';
import { GrnsummaryComponent } from '../components/reports/grnsummary/grnsummary.component';
import { InventoryreportComponent } from '../components/reports/inventoryreport/inventoryreport.component';
import { InventorybylocationreportComponent } from '../components/reports/inventorybylocationreport/inventorybylocationreport.component';
import { InventorybyproductreportComponent } from '../components/reports/inventorybyproductreport/inventorybyproductreport.component';
import { InventorytransactionreportComponent } from '../components/reports/inventorytransactionreport/inventorytransactionreport.component';
import { InventorytransactiondetailsreportComponent } from '../components/reports/inventorytransactiondetailsreport/inventorytransactiondetailsreport.component';
import { ShipmenthistoryreportsComponent } from '../components/reports/shipmenthistoryreports/shipmenthistoryreports.component';
import { GrnhistoryreportComponent } from '../components/reports/grnhistoryreport/grnhistoryreport.component';
import { SpaceutilizationhistoryreportComponent } from '../components/reports/spaceutilizationhistoryreport/spaceutilizationhistoryreport.component';
import { SpaceutilizationComponent } from '../components/reports/spaceutilization/spaceutilization.component';
import { ReportsmodulemainprintComponent } from '../components/reports/reportsmodulemainprint/reportsmodulemainprint.component';
import { ReportsmodulereportsprintingComponent } from '../components/reports/reportsmodulereportsprinting/reportsmodulereportsprinting.component';
import { InventoryReportComponent } from '../components/reports/inventory-report/inventory-report.component';
import { LocationavaillibityComponent } from '../components/reports/locationavaillibity/locationavaillibity.component';

@NgModule({
  declarations: [
    GoodsReceivingReportComponent,
    InventorySummaryComponent,
    PutawayReportComponent,
    PicklistReportComponent,
    PickingReportComponent,
    ShipmentOrderReportComponent,
    InventoryAdjustmentsReportComponent,
    CycleCountingReportComponent,
    OpenSalesOrderReportComponent,
    ReturnOrderComponent,
    ShipmentorderreportComponent,
    GrnstagetransactionreportComponent,
    GrnstagesummaryreportComponent,
    GrnsummaryComponent,
    InventoryreportComponent,
    InventorybylocationreportComponent,
    InventorybyproductreportComponent,
    InventorytransactionreportComponent,
    InventorytransactiondetailsreportComponent,
    ShipmenthistoryreportsComponent,
    GrnhistoryreportComponent,
    SpaceutilizationhistoryreportComponent,
    SpaceutilizationComponent,
    ReportsmodulereportsprintingComponent,
    ReportsmodulemainprintComponent,
    InventoryReportComponent,
    LocationavaillibityComponent,
  ],
  imports: [
    SharedModule,
    ReportsRoutingModule,
  ],
  providers: [
    ReportsService
  ]
})
export class ReportsModule { }
