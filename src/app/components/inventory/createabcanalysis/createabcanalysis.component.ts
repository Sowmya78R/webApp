import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AppService } from 'src/app/shared/services/app.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-createabcanalysis',
  templateUrl: './createabcanalysis.component.html',
  styleUrls: ['./createabcanalysis.component.scss']
})
export class CreateabcanalysisComponent implements OnInit {
  ngOnInit(): void {
    throw new Error("Method not implemented.");
  }
 
}
