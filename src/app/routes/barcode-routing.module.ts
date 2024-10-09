import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrintingBarcodeComponent } from '../components/Barcode/printing-barcode/printing-barcode.component';
import { ProcessBConfigComponent } from '../components/Barcode/process-bconfig/process-bconfig.component';
import { UserBConfigComponent } from '../components/Barcode/user-bconfig/user-bconfig.component';
import { UserGuard } from '../shared/route-guards/user.guard';

const routes: Routes = [
  {
    path: '', children: [
      { path: 'productConfig', component: PrintingBarcodeComponent, canActivate: [UserGuard] },
      { path: 'processConfig', component: ProcessBConfigComponent, canActivate: [UserGuard] },
      { path: 'userConfig', component: UserBConfigComponent, canActivate: [UserGuard] },
    ]
  }]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BarcodeRoutingModule { }
