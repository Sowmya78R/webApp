import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Importing WMS routing components
import { InboundCapacityComponent } from '../components/planning/inbound-capacity/inbound-capacity.component';
import { ServerErrorComponent } from '../components/common/server-error/server-error.component';
import { UserGuard } from '../shared/route-guards/user.guard';
import { OutboundCapacityComponent } from '../components/planning/outbound-capacity/outbound-capacity.component';
import { MaintenancecreateplanningComponent } from '../components/planning/maintenancecreateplanning/maintenancecreateplanning.component';
import { MaintenanceplanningComponent } from '../components/planning/maintenanceplanning/maintenanceplanning.component';
const routes: Routes = [  {
    path: 'planning',
    children: [
      { path: '', redirectTo: 'inboundCapacityPlanning', pathMatch: 'full' },
      { path: 'inboundCapacityPlanning', component: InboundCapacityComponent, canActivate: [UserGuard] },
      { path: 'outboundCapacityPlanning', component: OutboundCapacityComponent, canActivate: [UserGuard] },
       { path: 'maintenance_planning', component: MaintenanceplanningComponent, canActivate: [UserGuard] },
      { path: 'maintenanceCreatePlanning', component: MaintenancecreateplanningComponent, canActivate: [UserGuard] },
    ]
  },
 { path: 'serverError', component: ServerErrorComponent },
 { path: '**', component: ServerErrorComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WMSRoutingModule { }
