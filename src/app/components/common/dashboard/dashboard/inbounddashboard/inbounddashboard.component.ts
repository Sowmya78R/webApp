import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { Storage } from '../../../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inbounddashboard',
  templateUrl: './inbounddashboard.component.html',
  styleUrls: ['./inbounddashboard.component.scss']
})
export class InbounddashboardComponent implements OnInit, OnDestroy {
  pendingGoodsReceivingList: any;
  pendingPutawayList: any;
  pendinglocationallocatedProductsList: any;
  pendingPutawayResponseList: any;
  beforePutawayGeneration: any;
  orgNameWarehouseIDNameForm: FormGroup;
  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;

  permissionsList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inbound', 'Pending Goods Receiving', Storage.getSessionUser());
  PendingProductLocationAllocation = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inbound', 'Pending Product Location Allocation', Storage.getSessionUser());
  // PendingPutawayGeneration = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inbound', 'Pending Putaway Generation', Storage.getSessionUser());
  PendingPutawayList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inbound', 'Pending Putaway List', Storage.getSessionUser());
  orderType = 'Purchase Order';
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
    /*   this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
        console.log(data);
        if (data) {
          this.formObj = this.configService.getGlobalpayload();
          this.permissionsList = this.configService.getPermissions('kpiConfigurationFunctionalities', 'Inbound', 'Pending Putaway List', Storage.getSessionUser());
          console.log(this.permissionsList)
          this.geFunctionsCall();
        }
      }) */
    if (this.getRole()) {
      this.permissionsList = ['View', 'Update', 'Delete'];
      this.PendingProductLocationAllocation = ['View', 'Update', 'Delete'];
      // this.PendingPutawayGeneration = ['View', 'Update', 'Delete'];
      this.PendingPutawayList = ['View', 'Update', 'Delete'];
    }
    this.geFunctionsCall();
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
  geFunctionsCall() {
    // if (this.permissionsList.includes('View')) {
      this.fetchAllPendingGoodsReceiving();
      this.fetchAllPendingLocationAllocationGoodsReceiptManagementOrderDetails();
      // this.fetchAllPendingPutawaySoftLocationDetails();
      this.fetchALlPendingPutaway();
    // }
  }
  ngOnDestroy(): void {
    //this.forPermissionsSubscription.unsubscribe();
  }
  createorgWareHouseIDName() {
    this.orgNameWarehouseIDNameForm = this.fb.group({
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    })
  }
  getOrderType(key) {
    this.orderType = key;
    this.geFunctionsCall();
  }
  fetchAllPendingGoodsReceiving() {
    const form = this.configService.getGlobalpayload();
    form['orderType'] = this.orderType;
    this.dashboardService.fetchAllPendingGoodsReceiving(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pendingGoodsReceiptResponseList) {
          this.pendingGoodsReceivingList = response.data.pendingGoodsReceiptResponseList
        }
      },
      (error) => {
      });
  }
  fetchAllPendingLocationAllocationGoodsReceiptManagementOrderDetails() {
    const form = this.configService.getGlobalpayload();
    form['orderType'] = this.orderType;
    this.dashboardService.findPendingLocationAllocationGoodsReceiptManagementOrderDetails(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pendingGRMLocationNotallocatedResponseList) {
          this.pendinglocationallocatedProductsList = response.data.pendingGRMLocationNotallocatedResponseList
        }
      },
      (error) => {
      });
  }
  fetchAllPendingPutawaySoftLocationDetails() {
    const form = this.configService.getGlobalpayload();
    form['orderType'] = this.orderType;
    this.dashboardService.fetchAllPendingPutawaySoftLocationDetails(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pendingPutawaySoftLocationResponseList) {
          this.beforePutawayGeneration = response.data.pendingPutawaySoftLocationResponseList;
        }
      },
      (error) => {
      });
  }
  fetchALlPendingPutaway() {
    const form = this.configService.getGlobalpayload();
    form['orderType'] = this.orderType;
    this.dashboardService.findALLPendingPutaway(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pendingPutawayResponseList) {
          this.pendingPutawayResponseList = response.data.pendingPutawayResponseList
        }
      },
      (error) => {
      });
  }
}
