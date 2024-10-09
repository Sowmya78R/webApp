import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeescheduleComponent } from '../components/planning/employeeschedule/employeeschedule.component';
import { UserGuard } from '../shared/route-guards/user.guard';
import { EmployeenewtaskComponent } from '../components/planning/employeenewtask/employeenewtask.component';
import { ReportprintComponent } from '../components/planning/reportprint/reportprint.component';
import { EmployeetaskunloadingComponent } from '../components/planning/employeenewtask/employeetaskunloading/employeetaskunloading.component';
import { EmployeetaskloadingComponent } from '../components/planning/employeenewtask/employeetaskloading/employeetaskloading.component';
import { EmployeetaskinternaltransferComponent } from '../components/planning/employeenewtask/employeetaskinternaltransfer/employeetaskinternaltransfer.component';
import { EmployeetasklabellingComponent } from '../components/planning/employeenewtask/employeetasklabelling/employeetasklabelling.component';
import { EmployeetaskcopackingComponent } from '../components/planning/employeenewtask/employeetaskcopacking/employeetaskcopacking.component';
import { EmployeetaskpackingComponent } from '../components/planning/employeenewtask/employeetaskpacking/employeetaskpacking.component';
import { EmployeetaskrepackingComponent } from '../components/planning/employeenewtask/employeetaskrepacking/employeetaskrepacking.component';
import { PutawayHistoryTaskComponent } from '../components/planning/employeenewtask/putaway-history-task/putaway-history-task.component';
import { PutAwayTableComponent } from '../components/inbound/put-away/put-away-table/put-away-table.component';
import { PickingnewversionComponent } from '../components/outbound/picking/pickingnewversion/pickingnewversion.component';
import { PickingHistoryTaskComponent } from '../components/planning/employeenewtask/picking-history-task/picking-history-task.component';
const routes: Routes = [
  { path: 'employeePerformance', component: ReportprintComponent },
  {
    path: 'employeeSchedule', component: EmployeescheduleComponent,
    children: [
      // { path: '', redirectTo: 'pickingPlanning', pathMatch: 'full' },
      { path: 'pickingPlanning', component: ReportprintComponent, canActivate: [UserGuard] },
      { path: 'putawayPlanning', component: ReportprintComponent, canActivate: [UserGuard] },
      { path: 'packingPlanning', component: ReportprintComponent, canActivate: [UserGuard] },
      { path: 'rePackingPlanning', component: ReportprintComponent, canActivate: [UserGuard] },
      { path: 'coPackingPlanning', component: ReportprintComponent, canActivate: [UserGuard] },
      { path: 'labellingPlanning', component: ReportprintComponent, canActivate: [UserGuard] },
      { path: 'internalTransferPlanning', component: ReportprintComponent, canActivate: [UserGuard] },
      { path: 'loadingPlanning', component: ReportprintComponent, canActivate: [UserGuard] },
      { path: 'unloadingPlanning', component: ReportprintComponent, canActivate: [UserGuard] },
    ]
  },
  {
    path: 'employeeTask', component: EmployeenewtaskComponent, canActivate: [UserGuard],
    children: [
      { path: '', redirectTo: 'employeeTaskputaway', pathMatch: 'full' },
      //changed EmployeetaskputawayComponent to PutAwayTableComponent
      { path: 'employeeTaskputaway', component: PutAwayTableComponent, canActivate: [UserGuard] },
      { path: 'putawayHistory', component: PutawayHistoryTaskComponent, canActivate: [UserGuard] },
      //changed EmployeetaskpickingComponent to PickingnewversionComponent
      { path: 'employeeTaskpicking', component: PickingnewversionComponent, canActivate: [UserGuard] },
      { path: 'pickingHistory', component: PickingHistoryTaskComponent, canActivate: [UserGuard] },
      { path: 'employeeTaskpacking', component: EmployeetaskpackingComponent, canActivate: [UserGuard] },
      { path: 'employeeTaskrePacking', component: EmployeetaskrepackingComponent, canActivate: [UserGuard] },
      { path: 'employeeTaskcoPacking', component: EmployeetaskcopackingComponent, canActivate: [UserGuard] },
      { path: 'employeeTasklabelling', component: EmployeetasklabellingComponent, canActivate: [UserGuard] },
      { path: 'employeeTaskinternalTransfer', component: EmployeetaskinternaltransferComponent, canActivate: [UserGuard] },
      { path: 'employeeTaskloading', component: EmployeetaskloadingComponent, canActivate: [UserGuard] },
      { path: 'employeeTaskunloading', component: EmployeetaskunloadingComponent, canActivate: [UserGuard] },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkforceRoutingModule { }
