import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { BarcodeRoutingModule } from '../routes/barcode-routing.module';
import { ProcessBConfigComponent } from '../components/Barcode/process-bconfig/process-bconfig.component';
import { ProductBConfigComponent } from '../components/Barcode/product-bconfig/product-bconfig.component';
import { UserBConfigComponent } from '../components/Barcode/user-bconfig/user-bconfig.component';
import { BarcodePrintComponent } from '../components/Barcode/barcode-print/barcode-print.component';
import { PrintingBarcodeComponent } from '../components/Barcode/printing-barcode/printing-barcode.component';

@NgModule({
  declarations: [
    ProductBConfigComponent,
    ProcessBConfigComponent,
    UserBConfigComponent,
    BarcodePrintComponent,
    PrintingBarcodeComponent
  ], 
  imports: [
    CommonModule,
    SharedModule,
    BarcodeRoutingModule
  ]
})
export class BarcodeModule { }
