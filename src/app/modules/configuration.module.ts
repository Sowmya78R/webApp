import { NgModule } from '@angular/core';
import { ConfigRoutingModule } from '../routes/config-route.module';
import { ProcessPermissionsComponent } from '../components/configuration/process-permissions/process-permissions.component';
import { ProcessGroupsComponent } from '../components/configuration/process-groups/process-groups.component';
import { LoginMonitorComponent } from '../components/configuration/login-monitor/login-monitor.component';
import { KpiConfigComponent } from '../components/configuration/kpi-config/kpi-config.component';
import { ReportConfigComponent } from '../components/configuration/report-config/report-config.component';
import { UserConfigComponent } from '../components/configuration/User/user-config/user-config.component';
import { ParametersComponent } from '../components/configuration/parameters/parameters.component';
import { SharedModule } from '../shared/shared.module';
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
import { ReactiveFormsModule } from '@angular/forms';
import { FinancialyearconfigComponent } from '../components/configuration/financialyearconfig/financialyearconfig.component';
import { MainUserComponent } from '../components/configuration/User/main-user/main-user.component';
import { PrintUserComponent } from '../components/configuration/User/print-user/print-user.component';
@NgModule({
  declarations: [
    ProcessPermissionsComponent,
    LoginMonitorComponent,
    KpiConfigComponent,
    ReportConfigComponent,
    UserConfigComponent,
    ParametersComponent,
    ProcessGroupsComponent,
    MasterConfigComponent,
    WarehouseConfigComponent,
    InventoryConfigComponent,
    CyclecountingconfigComponent,
    NotificationConfigComponent,
    SchedulerscreenconfigurationComponent,
    ApplicationconfigComponent,
    SpacezoneconfigComponent,
    ThemeconfigComponent,
    LoginthemeConfigComponent,
    StatusConfigComponent,
    OrdersequencenumberconfigurationComponent,
    FinancialyearconfigComponent,
    MainUserComponent,
    PrintUserComponent
  ],
  imports: [
    SharedModule,
    ConfigRoutingModule,

  ],
  providers: []
})
export class ConfigurationModule { }
