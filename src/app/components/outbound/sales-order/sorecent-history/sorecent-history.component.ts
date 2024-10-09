import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CreateSalesOrderService } from 'src/app/services/createSalesOrder.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-sorecent-history',
  templateUrl: './sorecent-history.component.html'
})
export class SorecentHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
  soID: any;
  customerData: any;
  recentHistories: any[] = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger6: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private createSalesOrderService: CreateSalesOrderService, private configService: ConfigurationService,
    private outboundProcessService: OutboundProcessService,
    private translate:TranslateService) { 
      this.translate.use(this.language);
    }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 2,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
      }
    })
    if (this.permissionsList.includes('View')) {
      this.createSalesOrderService.customerIDChange.subscribe(data => {
        this.customerData = data;
        this.rerender();
      //  this.findSORecentHistoryByCustomerID();
      });
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger6.next();
  }
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.forPermissionsSubscription.unsubscribe();
    this.dtTrigger6.unsubscribe();
  }
  findSORecentHistoryByCustomerID() {
    // this.soID = this.appService.getParam('id') ? this.appService.getParam('id') : this.customerData.customerMasterID;
    this.soID = this.customerData.customerMasterID;
    this.outboundProcessService.findSORecentHistoryByCustomerID(this.soID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.salesOrderLines) {
          this.recentHistories = response.data.salesOrderLines;
          this.dtTrigger6.next();
        } else {
          this.recentHistories = [];
        }
      },
      (error) => {
        this.recentHistories = [];
      });
  }

}
