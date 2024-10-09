import { Component, OnInit, OnDestroy, ViewChild, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ApexService } from '../../../shared/services/apex.service';
import { Subject } from 'rxjs/Subject';
import { ToastrService } from 'ngx-toastr';
import { OutboundProcessService } from '../../../services/integration-services/outboundProcess.service';
import { DataTableDirective } from 'angular-datatables';
import { DashboardService } from '../../../services/integration-services/dashboard.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompleterData } from 'ng2-completer';
import { Constants } from 'src/app/constants/constants';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';

@Component({
  selector: 'app-picking',
  templateUrl: './picking.component.html'
})
export class PickingComponent implements OnInit {
  ngOnInit(): void {
    
      }
 
}
