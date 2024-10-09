import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PackingComponent } from '../components/value-added-services/packing/packing.component';
import { CoPackingComponent } from '../components/value-added-services/co-packing/co-packing.component';
import { RePackingComponent } from '../components/value-added-services/re-packing/re-packing.component';
import { LabellingComponent } from '../components/value-added-services/labelling/labelling.component';
import { BillingPoComponent } from '../components/value-added-services/billing-po/billing-po.component';
import { BillingPoInvoiceComponent } from '../components/value-added-services/billing-po-invoice/billing-po-invoice.component';
import {BillingInvoiceComponent} from '../components/value-added-services/billing-invoice/billing-invoice.component'
import { MaintainBillingPoComponent } from '../components/value-added-services/maintain-billing-po/maintain-billing-po.component';
import {MainBillingInvoiceComponent} from '../components/value-added-services/main-billing-invoice/main-billing-invoice.component'
import { AccountingspaceutilizationComponent } from '../components/value-added-services/accountingspaceutilization/accountingspaceutilization.component';
import { SpaceutilizationbillingComponent } from '../components/value-added-services/spaceutilizationbilling/spaceutilizationbilling.component';
import { GlobalreportprintingComponent } from '../shared/globalreportprinting/globalreportprinting.component';
const routes: Routes = [
  {path: '', redirectTo: 'packing', pathMatch: 'full'},
  {path: 'packing', component: PackingComponent},
  {path: 'co-packing', component: CoPackingComponent},
  {path: 're-packing', component: RePackingComponent},
  {path: 'labelling', component: LabellingComponent},
  {path: 'billing-po', component: MaintainBillingPoComponent},
  {path: 'create-billing-po', component: BillingPoComponent},
  {path: 'billing-po-invoice', component: MainBillingInvoiceComponent},
  {path: 'spaceUtilization', component: AccountingspaceutilizationComponent},
  {path: 'spaceUtilizationBilling', component: GlobalreportprintingComponent},
/*   {path: 'spaceUtilizationBilling', component: SpaceutilizationbillingComponent}, */

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VASRoutingModule { }
