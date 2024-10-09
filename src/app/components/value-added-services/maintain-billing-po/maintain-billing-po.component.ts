import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { VASRestService } from '../../../services/integration-services/vas-rest.service';
import { AppService } from '../../../shared/services/app.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-maintain-billing-po',
  templateUrl: './maintain-billing-po.component.html'
})
export class MaintainBillingPoComponent implements OnInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  billingPurchaseOrders: any = [];
  deleteInfo: any = {};
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Billing', 'Billing PO', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  constructor(
    private vasRestService: VASRestService, private configService: ConfigurationService,
    private appService: AppService, private toastr: ToastrService,
    public ngxSmartModalService: NgxSmartModalService,
    private translate:TranslateService,
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
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Accounting', 'Billing PO', Storage.getSessionUser());
        this.rerender();
        this.getFunctionsCall();
      }
    }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.findAllBillingPurchaseOrders();
    }
  }
  editBillingPO(soID: any) {
    this.appService.navigate('/v1/vas/create-billing-po', { id: soID });
  }

  deleteBillingPO(id) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'billingPo', id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions");
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.rerender();
      this.findAllBillingPurchaseOrders();
    }
  }
  findAllBillingPurchaseOrders() {
    this.vasRestService.findAllBillingPurchaseOrders(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.billingPurchaseOrders) {
          this.billingPurchaseOrders = response.data.billingPurchaseOrders;
          this.dtTrigger.next();
          this.dtTrigger2.next();
        }
      },
      (error) => {
      });
  }
  forCreate() {
    if (this.permissionsList.includes('Create')) {
      this.appService.navigate('/v1/vas/create-billing-po', null);
    }
    else {
      this.toastr.error("User doesnt have permissions")

    }
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
    this.dtTrigger.unsubscribe();
    this.dtTrigger2.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
  }

}
