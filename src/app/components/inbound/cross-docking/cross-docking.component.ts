import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { WMSService } from '../../../services/integration-services/wms.service';
import { DataTableDirective } from 'angular-datatables';
import { Storage } from '../../../shared/utils/storage';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cross-docking',
  templateUrl: './cross-docking.component.html'
})
export class CrossDockingComponent implements OnInit, OnDestroy, AfterViewInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  crossDockingHistories: any = [];
  id: any = [];
  formObj = this.configService.getGlobalpayload();
  crossDockingList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Cross Docking', Storage.getSessionUser());
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  crossDockingKeys: any = ['', '', '', '', '', '',
    '', '', '', '', '', '',
    '', '', '', ''];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  forPermissionsSubscription: any;
  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private translate:TranslateService) {
      this.translate.use(this.language);
     }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
   /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.crossDockingList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Cross Docking', Storage.getSessionUser());
        this.getFunctionsCall();
      }
    }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.crossDockingList.includes('View')) {
      this.findAllCrossDockingHistoryDetails();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  findAllCrossDockingHistoryDetails() {
    this.wmsService.fetchAllCrossDockingHistoryDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.crossDockingHistories.length) {
          this.crossDockingHistories = response.data.crossDockingHistories;
          this.rerender();
        } else {
          this.crossDockingHistories = [];
        }
      },
      (error) => {
        this.crossDockingHistories = [];
      });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  //  this.forPermissionsSubscription.unsubscribe();
  }
}
