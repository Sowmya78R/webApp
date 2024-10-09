import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-putaway-history-task',
  templateUrl: './putaway-history-task.component.html',
  styleUrls: ['./putaway-history-task.component.scss']
})
export class PutawayHistoryTaskComponent implements OnInit {
  putAwaysList: any = [];
  putawayPlanningForm: FormGroup;
  orderTypeDropdown = ['Purchase Order', 'Sales Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns'];
  formObj = this.configService.getGlobalpayload();
  supplierIds: any = [];
  customerIds: any = [];
  wareHouseIds: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  overAllPO: any = [];
  zonesIDs: CompleterData
  locations: any;
  locationIDs: CompleterData;
  usersList: any;
  userIDs: CompleterData;
  wareHouseTeamsListIDs: CompleterData;
  responseValues: any;
  putAwaySaveList: any;
  userValues: any = [];
  selectedDocuments = [];
  WMPOs: any = [];
  wareHouseTeamsList: any = [];
  page: number = 1;
  itemsPerPage = 5;
  pageForHeader: number = 1;
  itemsPerPageForheader = 5;
  totalItems: any = null;
  searchKey: any = null;
  wmpoFilteredObj: any = null;
  subscription: Subscription;
  @Input() item = '';
  valueimg: any;
  fetchUserLoginIDName: any;

  constructor(private wmsService: WMSService,private configService: ConfigurationService) {
    this.subscription = null
    this.subscription = this.wmsService.selectedValueSubject.subscribe((data) => {
      if (data) {
        this.valueimg = data;
        this.getCallOnDropDownChange(this.valueimg, 1);
        this.item = this.valueimg
      } else {
        const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
        this.fetchUserLoginIDName = loginUserRole;
        this.getCallOnPageLoad(1);
      }
    });
  }

  ngOnInit() {
  }
  getCallOnDropDownChange(user,page) {
    const reqPutawayObj = {
      executiveIDName: user,
      locationName: null,
      zoneName: null,
      page: page,
      pageSize: this.itemsPerPage,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPutawayDetails(reqPutawayObj);
  }
  getCallOnPageLoad(page) {
    const reqPutawayObj = {
      executiveIDName: this.fetchUserLoginIDName,
      locationName: null,
      zoneName: null,
      page: page,
      pageSize: this.itemsPerPage,
      // wmpoNumber: null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPutawayDetails(reqPutawayObj);
  }
  fetchAllPutawayDetails(payload?) {
    this.wmsService.putawayManagement(payload).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putawayManagementPaginationResponse.putawayManagements.length > 0) {
          this.putAwaysList = response.data.putawayManagementPaginationResponse.putawayManagements;
          this.totalItems = response.data.putawayManagementPaginationResponse.totalElements;
        }
        else {
          this.putAwaysList = [];
        }
      },
      (error) => {
      });
  }
}
