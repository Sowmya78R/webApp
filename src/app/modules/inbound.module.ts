import { NgModule } from '@angular/core';
import { MaintainPurchaseOrderComponent } from '../components/inbound/purchase-order/maintain-purchase-order/maintain-purchase-order.component';
import { PutAwayComponent } from '../components/inbound/put-away/put-away.component';
import { CrossDockingComponent } from '../components/inbound/cross-docking/cross-docking.component';
import { SharedModule } from '../shared/shared.module';
import { InboundMasterDataService } from '../services/integration-services/inboundMasterData.service';
import { InboundRoutingModule } from '../routes/inbound-routing.module';
import { MaintainGoodsReceiptComponent } from '../components/inbound/GRN/maintain-goods-receipt/maintain-goods-receipt.component';
import { CreatePoComponent } from '../components/inbound/purchase-order/create-po/create-po.component';
import { SalesReturnsComponent } from '../components/inbound/sales-returns/sales-returns.component';
import { EditProductLinesComponent } from '../components/inbound/purchase-order/edit-product-lines/edit-product-lines.component';
import { EditShippingDetailsComponent } from '../components/inbound/purchase-order/edit-shipping-details/edit-shipping-details.component';
import { EditSupplierDetailsComponent } from '../components/inbound/purchase-order/edit-supplier-details/edit-supplier-details.component';
import { GrnNoteComponent } from '../components/grn-note/grn-note.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MainCreatepopdfComponent } from '../components/inbound/purchase-order/main-createpopdf/main-createpopdf.component';
import { CreatepopdfComponent } from '../components/inbound/purchase-order/createpopdf/createpopdf.component';
import { MaingrnpdfComponent } from '../components/inbound/GRN/maingrnpdf/maingrnpdf.component';
import { GrnpdfComponent } from '../components/inbound/GRN/grnpdf/grnpdf.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PdfputwayComponent } from '../components/inbound/put-away/pdfputway/pdfputway.component';
import { CreateGRNComponent } from '../components/inbound/GRN/create-grn/create-grn.component';
import { DamagedStockComponent } from '../components/inbound/damaged-stock/damaged-stock.component';
@NgModule({
  declarations: [
    MaintainPurchaseOrderComponent,
    EditShippingDetailsComponent,
    EditSupplierDetailsComponent,
    EditProductLinesComponent,
    MaintainGoodsReceiptComponent,
    PutAwayComponent,
    CrossDockingComponent,
    // AdvancedShipmentNoticeComponent,
    // CreateEditGRNComponent,
    CreateGRNComponent,
    CreatePoComponent,
    SalesReturnsComponent,
    GrnNoteComponent,
    MainCreatepopdfComponent,
    CreatepopdfComponent,
    MaingrnpdfComponent,
    GrnpdfComponent,
    PdfputwayComponent,
    DamagedStockComponent
  
   // PurchaseRequestComponent

  ],
  imports: [
    SharedModule,
    InboundRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  providers: [
    InboundMasterDataService]
})
export class InboundModule { }
