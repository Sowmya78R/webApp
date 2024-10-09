import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WMSRoutingModule } from '../routes/wms-routing.modules';
import { SharedModule } from '../shared/shared.module';
import { InboundCapacityComponent } from '../components/planning/inbound-capacity/inbound-capacity.component';
import { OutboundCapacityComponent } from '../components/planning/outbound-capacity/outbound-capacity.component';
import { InboundMasterDataService } from '../services/integration-services/inboundMasterData.service';
import { PlanningService } from '../services/integration-services/planning.service';
// import { FilterPipe } from '../shared/pipes/filter.pipe';
import { ServerErrorComponent } from '../components/common/server-error/server-error.component';
import { OutboundProcessService } from '../services/integration-services/outboundProcess.service';
import { MaintenancecreateplanningComponent } from '../components/planning/maintenancecreateplanning/maintenancecreateplanning.component';
import { MaintenanceplanningComponent } from '../components/planning/maintenanceplanning/maintenanceplanning.component';
import { NumbertowordsPipe } from '../shared/numbertowords.pipe';

@NgModule({
  declarations: [
    // FilterPipe,
    InboundCapacityComponent,
    OutboundCapacityComponent,
    MaintenanceplanningComponent,
    MaintenancecreateplanningComponent,
    ServerErrorComponent,
    NumbertowordsPipe
  ],
  imports: [
    SharedModule,
    WMSRoutingModule,
  ],
  providers: [
    InboundMasterDataService,
    PlanningService,
    OutboundProcessService]
})
export class WMSModule { }
