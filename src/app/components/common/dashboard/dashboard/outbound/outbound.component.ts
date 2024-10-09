import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { Storage } from '../../../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-outbound',
  templateUrl: './outbound.component.html',
  styleUrls: ['./outbound.component.scss']
})
export class OutboundComponent implements OnInit, OnDestroy {
  pendingSalesorderList: any;
  pendingShipmentList: any;
  pendingpickingresponseList: any;
  orgNameWarehouuseIDNameForm: FormGroup;
  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;
  permissionsList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Outbound', 'Pending Sales Orders', Storage.getSessionUser());
  pendingShipments = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Outbound', 'Pending Shipments', Storage.getSessionUser());
  pendingPicking = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Outbound', 'Pending Picking', Storage.getSessionUser());
  orderType: any = 'Sales Order';
  radio1: boolean = true;
  radio2: boolean = false;
  radio3: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  constructor(private dashboardService: DashboardService,
    private configService: ConfigurationService, private fb: FormBuilder,
    private translate: TranslateService,) { 
      this.translate.use(this.language);
    }

  ngOnInit() {
    /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
       console.log(data);
       if (data) {
         if(this.configService.getPermissions !=null && this.configService.getPermissions !=undefined){
           this.formObj = this.configService.getGlobalpayload();
           this.permissionsList = this.configService.getPermissions('kpiConfigurationFunctionalities', 'Outbound', 'Pending Sales Orders', Storage.getSessionUser());
           console.log(this.permissionsList);
           this.getFunctionsCall();
         }
       }
     }) */
    if (this.getRole()) {
      this.permissionsList = ['View', 'Update', 'Delete'];
      this.pendingShipments = ['View', 'Update', 'Delete'];
      this.pendingPicking = ['View', 'Update', 'Delete'];
    }
    this.createorgWareHouseIDName();
    this.getFunctionsCall();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  getOrderType(key) {
    this.orderType = key;
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    // if (this.permissionsList.includes('View')) {
    this.fetchAllPendingSalesOrder();
    this.fetchAllPendingShipmentList();
    this.fetchAllPendingPickingDetails();
    // }
  }
  ngOnDestroy(): void {
    //this.forPermissionsSubscription.unsubscribe();
  }
  createorgWareHouseIDName() {
    this.orgNameWarehouuseIDNameForm = this.fb.group({
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    })
  }
  fetchAllPendingSalesOrder() {
    const form = this.configService.getGlobalpayload();
    form['orderType'] = this.orderType;
    this.dashboardService.fetchAllPendingSalesOrder(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pendingSalesOrderResponseList) {
          this.pendingSalesorderList = response.data.pendingSalesOrderResponseList
        }
      },
      (error) => {
      });
  }
  fetchAllPendingShipmentList() {
    const form = this.configService.getGlobalpayload();
    form['orderType'] = this.orderType;
    this.dashboardService.fetchAllPendingShipmentDetails(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pendingShipmentOrderResponseList) {
          this.pendingShipmentList = response.data.pendingShipmentOrderResponseList
        }
      },
      (error) => {
      });
  }
  fetchAllPendingPickingDetails() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    const orderType = this.orderType;
    this.dashboardService.fetchAllPendingPickingDetails(form.organizationIDName, form.wareHouseIDName, orderType).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pendingPickingResponseList) {
          this.pendingpickingresponseList = response.data.pendingPickingResponseList;
        }
      },
      (error) => {
      });
  }
}
