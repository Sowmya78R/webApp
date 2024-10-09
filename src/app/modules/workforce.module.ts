import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkforceRoutingModule } from '../routes/workforce-routing.module';
import { SharedModule } from '../shared/shared.module';
import { EmployeePerformanceComponent } from '../components/planning/employee-performance/employee-performance.component';
import { CopackingplanningComponent } from '../components/planning/copackingplanning/copackingplanning.component';
import { InternaltransferplanningComponent } from '../components/planning/internaltransferplanning/internaltransferplanning.component';
import { LabellingplanningComponent } from '../components/planning/labellingplanning/labellingplanning.component';
import { PackingplanningComponent } from '../components/planning/packingplanning/packingplanning.component';
import { RepackingplanningComponent } from '../components/planning/repackingplanning/repackingplanning.component';
import { EmployeescheduleComponent } from '../components/planning/employeeschedule/employeeschedule.component';
import { EmployeenewtaskComponent } from '../components/planning/employeenewtask/employeenewtask.component';
import { EmployeetaskcopackingComponent } from '../components/planning/employeenewtask/employeetaskcopacking/employeetaskcopacking.component';
import { EmployeetaskinternaltransferComponent } from '../components/planning/employeenewtask/employeetaskinternaltransfer/employeetaskinternaltransfer.component';
import { EmployeetasklabellingComponent } from '../components/planning/employeenewtask/employeetasklabelling/employeetasklabelling.component';
import { EmployeetaskpackingComponent } from '../components/planning/employeenewtask/employeetaskpacking/employeetaskpacking.component';
import { EmployeetaskrepackingComponent } from '../components/planning/employeenewtask/employeetaskrepacking/employeetaskrepacking.component';
import { ReportprintComponent } from '../components/planning/reportprint/reportprint.component';
import { MainprintComponent } from '../components/planning/mainprint/mainprint.component';
import { LoadingplanningComponent } from '../components/planning/loadingplanning/loadingplanning.component';
import { UnloadingplanningComponent } from '../components/planning/unloadingplanning/unloadingplanning.component';
import { EmployeetaskloadingComponent } from '../components/planning/employeenewtask/employeetaskloading/employeetaskloading.component';
import { EmployeetaskunloadingComponent } from '../components/planning/employeenewtask/employeetaskunloading/employeetaskunloading.component';
import { EmployeeperformanceprintingpageComponent } from '../components/planning/employeeperformanceprintingpage/employeeperformanceprintingpage.component';
import { PutawayHistoryTaskComponent } from '../components/planning/employeenewtask/putaway-history-task/putaway-history-task.component';
import { PickingHistoryTaskComponent } from '../components/planning/employeenewtask/picking-history-task/picking-history-task.component';


@NgModule({
  declarations: [
    EmployeePerformanceComponent,
    EmployeeperformanceprintingpageComponent,
    MainprintComponent,
    ReportprintComponent,
    EmployeescheduleComponent,
    PackingplanningComponent,
    RepackingplanningComponent,
    CopackingplanningComponent,
    LabellingplanningComponent,
    InternaltransferplanningComponent,
    EmployeenewtaskComponent,
    EmployeetaskinternaltransferComponent,
    EmployeetaskpackingComponent,
    EmployeetaskrepackingComponent,
    EmployeetaskcopackingComponent,
    EmployeetasklabellingComponent,
    LoadingplanningComponent,
    UnloadingplanningComponent,
    EmployeetaskloadingComponent,
    EmployeetaskunloadingComponent,
    PutawayHistoryTaskComponent,
    PickingHistoryTaskComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    WorkforceRoutingModule
  ]
})
export class WorkforceModule { }
