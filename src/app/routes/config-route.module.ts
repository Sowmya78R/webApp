import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParametersComponent } from '../components/configuration/parameters/parameters.component';
import { ProcessPermissionsComponent } from '../components/configuration/process-permissions/process-permissions.component';
import { ProcessGroupsComponent } from '../components/configuration/process-groups/process-groups.component';
import { LoginMonitorComponent } from '../components/configuration/login-monitor/login-monitor.component';
import { KpiConfigComponent } from '../components/configuration/kpi-config/kpi-config.component';
import { ReportConfigComponent } from '../components/configuration/report-config/report-config.component';
import { UserGuard } from '../shared/route-guards/user.guard';
import { MasterConfigComponent } from '../components/configuration/master-config/master-config.component';
import { WarehouseConfigComponent } from '../components/configuration/warehouse-config/warehouse-config.component';
import { InventoryConfigComponent } from '../components/configuration/inventory-config/inventory-config.component';
import { CyclecountingconfigComponent } from '../components/configuration/cyclecountingconfig/cyclecountingconfig.component';
import { NotificationConfigComponent } from '../components/configuration/notification-config/notification-config.component';
import { SchedulerscreenconfigurationComponent } from '../components/configuration/schedulerscreenconfiguration/schedulerscreenconfiguration.component';
import { ApplicationconfigComponent } from '../components/configuration/applicationconfig/applicationconfig.component';
import { SpacezoneconfigComponent } from '../components/configuration/spacezoneconfig/spacezoneconfig.component';
import { ThemeconfigComponent } from '../components/configuration/themeconfig/themeconfig.component';
import { LoginthemeConfigComponent } from '../components/configuration/logintheme-config/logintheme-config.component';
import { StatusConfigComponent } from '../components/configuration/status-config/status-config.component';
import { OrdersequencenumberconfigurationComponent } from '../components/configuration/ordersequencenumberconfiguration/ordersequencenumberconfiguration.component';
import { FinancialyearconfigComponent } from '../components/configuration/financialyearconfig/financialyearconfig.component';
import { MainUserComponent } from '../components/configuration/User/main-user/main-user.component';

const routes: Routes = [
    { path: '', redirectTo: 'parameters', pathMatch: 'full' },
    { path: 'parameters', component: ParametersComponent, canActivate: [UserGuard] },
    { path: 'processPermissions', component: ProcessPermissionsComponent, canActivate: [UserGuard] },
    { path: 'processGroups', component: ProcessGroupsComponent, canActivate: [UserGuard] },
    { path: 'loginMonitor', component: LoginMonitorComponent, canActivate: [UserGuard] },
    { path: 'kpi', component: KpiConfigComponent, canActivate: [UserGuard] },
    { path: 'report', component: ReportConfigComponent, canActivate: [UserGuard] },
    { path: 'master', component: MasterConfigComponent, canActivate: [UserGuard] },
    { path: 'user', component: MainUserComponent, canActivate: [UserGuard] },
    { path: 'warehouse', component: WarehouseConfigComponent, canActivate: [UserGuard] },
    { path: 'inventory', component: InventoryConfigComponent, canActivate: [UserGuard] },
    { path: 'cycleCounting', component: CyclecountingconfigComponent, canActivate: [UserGuard] },
    { path: 'notificationConfig', component: NotificationConfigComponent, canActivate: [UserGuard] },
    { path: 'schedularScreen', component: SchedulerscreenconfigurationComponent, canActivate: [UserGuard] },
    { path: 'applicationConfig', component: ApplicationconfigComponent, canActivate: [UserGuard] },
    { path: 'spaceZoneConfig', component: SpacezoneconfigComponent, canActivate: [UserGuard] },
    { path: 'themeConfig', component: ThemeconfigComponent, canActivate: [UserGuard] },
    { path: 'logintheme-config', component: LoginthemeConfigComponent, canActivate: [UserGuard] },
    { path: 'statusConfig', component: StatusConfigComponent, canActivate: [UserGuard] },
    { path: 'orderSequenceConfig', component: OrdersequencenumberconfigurationComponent, canActivate: [UserGuard] },
    { path: 'financialConfig', component: FinancialyearconfigComponent, canActivate: [UserGuard] }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ConfigRoutingModule { }
