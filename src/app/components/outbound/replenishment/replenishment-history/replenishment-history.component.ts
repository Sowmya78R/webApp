import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { AppService } from '../../../../shared/services/app.service';
import { OutboundProcessService } from '../../../../services/integration-services/outboundProcess.service';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-replenishment-table',
  templateUrl: './replenishment-history.component.html'
})
export class ReplenishmentHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  productId: any;
  productData: any;
  replenishments: any[];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  formObj = this.configService.getGlobalpayload();
  replishmentHistoryList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
  replenishmentsKeys: any = ['', '', '', '', '',
    '', '', '', ''];
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  showTooltip: any = false;

  constructor(private toastr: ToastrService,
    private outboundProcessService: OutboundProcessService, private configService: ConfigurationService,
    private translate: TranslateService,
  ) { 
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
        this.formObj = this.configService.getGlobalpayload();
        this.replishmentHistoryList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
        this.getFunctionsCall();
      }
    }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    this.findAllReplenishmentOrderHistoryDetails();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  findAllReplenishmentOrderHistoryDetails() {
    this.outboundProcessService.findAllReplenishmentOrderHistoryDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.replenishmentOrderHistories) {
          this.replenishments = response.data.replenishmentOrderHistories;
          this.rerender();
        } else {
          this.replenishments = [];
        }
      },
      (error) => {
        this.replenishments = [];
      });
  }
  onStatusChange(status, id) {
    this.outboundProcessService.updateReplenishmentOrderHistory({ id, status }).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.replenishmentOrderHistory) {
          this.toastr.success('Completed successfully');
        } else {
          this.toastr.error('Failed in completing');
        }
      },
      (error) => {

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
    //this.forPermissionsSubscription.unsubscribe();
  }

}
