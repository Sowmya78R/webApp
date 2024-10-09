import { Component, Input, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InternaltransfersService } from 'src/app/services/integration-services/internaltransfers.service';
import { Storage } from '../../../../shared/utils/storage';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-employeetaskunloading',
  templateUrl: './employeetaskunloading.component.html',
  styleUrls: ['./employeetaskunloading.component.scss']
})
export class EmployeetaskunloadingComponent implements OnInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  loadingList: any = [];
  showTooltip: any = false;
  @Input() item = '';
  subscription:Subscription
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Employee Tasks', Storage.getSessionUser());
  constructor(private configService: ConfigurationService,
    private itService: InternaltransfersService, private toastr: ToastrService,private wmsService:WMSService) {
      this.subscription = this.wmsService.selectedValueSubject.subscribe((data) => {
        if(data){
          this.valueimg = data;
          console.log(this.valueimg);
          this.get(this.valueimg)
          this.item = this.valueimg
        } else {
          const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
          this.fetchUserLoginIDName = loginUserRole;
          this.geCallOnPageLoad();
        }  
      });
     }
     valueimg:any;
 /*  ngOnChanges(changes: SimpleChanges) {
    this.get(changes.item.currentValue);
    this.item = changes.item.currentValue;
  } */
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
  }
  unLoadingList:any=[]
  get(user) {
    const form = {
      "organizationIDName": this.configService.getGlobalpayload().organizationIDName,
      "wareHouseIDName": this.configService.getGlobalpayload().wareHouseIDName,
      "assignedTos": [user],
      "status": "GATE IN",
      "noteType": "Inward Shipment"
    }
    this.itService.fetchGRNEmployeeTask(form).subscribe(res => {
      if (res.status == 0 && res.data.goodsReceiptNotes) {
        this.unLoadingList = res.data.goodsReceiptNotes.filter(x => !x.endDate)
      this.rerender();
      this.dtTrigger.next();
      }
      else {
        this.loadingList = [];
        this.dtTrigger.next();
      }
    })
  }
  fetchUserLoginIDName:any;
  geCallOnPageLoad() {
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
          this.fetchUserLoginIDName = loginUserRole;
    const form = {
      "organizationIDName": this.configService.getGlobalpayload().organizationIDName,
      "wareHouseIDName": this.configService.getGlobalpayload().wareHouseIDName,
      "assignedTos": [this.fetchUserLoginIDName],
      "status": "GATE IN",
      "noteType": "Inward Shipment"
    }
    this.itService.fetchGRNEmployeeTask(form).subscribe(res => {
      if (res.status == 0 && res.data.goodsReceiptNotes) {
        this.unLoadingList = res.data.goodsReceiptNotes.filter(x => !x.endDate)
      //  this.dtTrigger.next();
      this.rerender();
      }
      else {
        this.loadingList = [];
        this.dtTrigger.next();
      }
    })
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  onStatusChange(key, data) {
    if (this.permissionsList.includes('Update')) {
      const obj = {
        "endDate": (key == 'status') ? new Date() : null,
        "startDate": (key == 'status') ? data.startDate : new Date(),
      }
      data.startDate = obj.startDate;
      data.endDate = obj.endDate;
      this.intoEmployee(data, null, 'yes');
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  intoEmployee(attr, event?, forStatus?) {
    this.itService.updateLoadingPlanning([attr]).subscribe(res => {
      if (res['status'] == 0 && res['data']['goodsReceiptNote']) {
        event ? this.toastr.success("Assigned User Successfully") :
          (forStatus ? ((attr.endDate) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
        if (attr.endDate) {
          this.reset();
          this.updateData(); 
        }
      }
      else if (res && res.status === 2) {
        this.toastr.error(res.statusMsg);
        this.reset();
      }
    })
  }
  updateData() {
    this.wmsService.updateData({ 'currentUser' : this.valueimg});
}
  reset() {
 //   this.rerender();
    this.get(this.item);
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
}
