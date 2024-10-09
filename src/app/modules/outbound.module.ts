import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { OutboundRoutingModule } from '../routes/outbound-routing.module';
import { MaintainSalesOrderComponent } from '../components/outbound/sales-order/maintain-sales-order/maintain-sales-order.component';
import { PickingComponent } from '../components/outbound/picking/picking.component';
import { EditShipmentOrderComponent } from '../components/outbound/shipment-order/edit-shipment-order/edit-shipment-order.component';
import { MaintainShipmentOrderComponent } from '../components/outbound/shipment-order/maintain-shipment-order/maintain-shipment-order.component';
import { ReplenishmentHistoryComponent } from '../components/outbound/replenishment/replenishment-history/replenishment-history.component';
import { MaintainInvoicingComponent } from '../components/outbound/invoicing/maintain-invoicing/maintain-invoicing.component';
import { PrintInvoicingComponent } from '../components/outbound/invoicing/print-invoicing/print-invoicing.component';
import { MainInvoicingComponent } from '../components/outbound/invoicing/main-invoicing/main-invoicing.component';
import { EditInvoicingComponent } from '../components/outbound/invoicing/edit-invoicing/edit-invoicing.component';
import { OutboundProcessService } from '../services/integration-services/outboundProcess.service';
import { InboundMasterDataService } from '../services/integration-services/inboundMasterData.service';
import { CreateSOComponent } from '../components/outbound/sales-order/create-so/create-so.component';
import { EditCustomerDetailsComponent } from '../components/outbound/sales-order/edit-customer-details/edit-customer-details.component';
import { SOEditProductLinesComponent } from '../components/outbound/sales-order/edit-product-lines/edit-product-lines.component';
import { SOEditShippingDetailsComponent } from '../components/outbound/sales-order/edit-shipping-details/edit-shipping-details.component';
import { SorecentHistoryComponent } from '../components/outbound/sales-order/sorecent-history/sorecent-history.component';
import { MainShipmentOrderComponent } from '../components/outbound/shipment-order/main-shipment-order/main-shipment-order.component';
import { PrintShipmentOrderComponent } from '../components/outbound/shipment-order/print-shipment-order/print-shipment-order.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PdfpickingComponent } from '../components/outbound/picking/pdfpicking/pdfpicking.component';
import { GateentryoutboundComponent } from '../components/outbound/gateentryoutbound/gateentryoutbound.component';
import { ReplacementOrderComponent } from '../components/outbound/picking/replacement-order/replacement-order.component';

@NgModule({
  declarations: [
    MaintainSalesOrderComponent,
    EditCustomerDetailsComponent,
    SOEditProductLinesComponent,
    SOEditShippingDetailsComponent,
    SorecentHistoryComponent,
    PickingComponent,
    EditShipmentOrderComponent,
    MaintainShipmentOrderComponent,
    ReplenishmentHistoryComponent,
    PrintInvoicingComponent,
    MainInvoicingComponent,
    EditInvoicingComponent,
    CreateSOComponent,
    MainShipmentOrderComponent,
    PrintShipmentOrderComponent,
    PdfpickingComponent,
    GateentryoutboundComponent,
    ReplacementOrderComponent
  ],
  imports: [
    SharedModule,
    NgxPaginationModule,
    OutboundRoutingModule
  ],
  providers: [InboundMasterDataService, OutboundProcessService]
})
export class OutboundModule { }
