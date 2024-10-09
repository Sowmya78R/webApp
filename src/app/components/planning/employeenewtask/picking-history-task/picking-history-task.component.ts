import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-picking-history-task',
  templateUrl: './picking-history-task.component.html',
  styleUrls: ['./picking-history-task.component.scss']
})
export class PickingHistoryTaskComponent implements OnInit {
  subscription: Subscription;
  @Input() item = '';
  valueimg: any;
  fetchUserLoginIDName: any;
  pickingsList: any = [];
  totalItems: any;
  page: any = 1;
  itemsPerPage: any = 5;

  constructor(private wmsService: WMSService, private router: Router, private configService: ConfigurationService) {
    this.subscription = this.wmsService.selectedValueSubject.subscribe((data) => {
      if (data) {
        this.valueimg = data;
        if (this.router.url.includes(`/employeeTask/employeeTaskpicking`)) {
          this.getCallDataOnDropDownChange(this.valueimg)
        }
        this.item = this.valueimg
      } else {
        const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
        this.fetchUserLoginIDName = loginUserRole;
        this.getCallDataOnPageLoad();
      }
    });
  }

  ngOnInit() {
  }

  getCallDataOnDropDownChange(user) {
    const inputData = {
      "zoneName": null,
      "locationName": null,
      "executiveIDName": user,
      "page": 1,
      "pageSize": 5,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPickingPlanningTableData(inputData);
  }
  getCallDataOnPageLoad() {
    const inputData = {
      "zoneName": null,
      "locationName": null,
      "page": 1,
      "pageSize": 5,
      "executiveIDName": this.fetchUserLoginIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPickingPlanningTableData(inputData);
  }

  fetchAllPickingPlanningTableData(payload) {
    this.wmsService.fetchAllPickingWithPagination(payload).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickingPaginationResponse && response.data.pickingPaginationResponse.pickings.length > 0) {
          this.pickingsList = response.data.pickingPaginationResponse.pickings;
          this.totalItems = response.data.pickingPaginationResponse.totalElements

        }
        else {
          this.pickingsList = [];
        }
      },
      (error) => {
      });
  }
}
