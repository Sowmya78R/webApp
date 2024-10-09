import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InternaltransfersService } from 'src/app/services/integration-services/internaltransfers.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { Storage } from '../../../../shared/utils/storage';
import { WMSService } from 'src/app/services/integration-services/wms.service';
@Component({
  selector: 'app-employeetasklabelling',
  templateUrl: './employeetasklabelling.component.html',
  styleUrls: ['./employeetasklabelling.component.scss']
})
export class EmployeetasklabellingComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  WMSOs: any = [];
  formObj = this.configService.getGlobalpayload();
  selectAllCheckboxValue: boolean = false;
  selectedDocuments: any = [];
  forSearchEmp: any = null;
  wmsoNumber: any = null;
  assignedEmployeeIDName: any = null;
  wareHouseTeamsListIDs: CompleterData;
  wareHouseTeamsList: any = [];
  labellingData: any = [];
  completionDate: any = null;
  makeThisDisable: boolean = false;
  showTooltip: any = false;
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };
  fetchUserLoginIDName: any;
  passedAssignedToValue: any;
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Employee Tasks', Storage.getSessionUser());
  @Input() item = '';
  subscription:Subscription;
  constructor(private configService: ConfigurationService, private commonDataService: CommonMasterDataService, private toastr: ToastrService
    , private outboundProcessService: OutboundProcessService, private internaltransfersService: InternaltransfersService,
    private wmsService:WMSService) {
      this.subscription = this.wmsService.selectedValueSubject.subscribe((data) => {
        if(data){
          this.valueimg = data;
          console.log(this.valueimg);
          this.getCallOnDropDownChange(this.valueimg)
          this.item = this.valueimg
        } else {
          const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
          this.fetchUserLoginIDName = loginUserRole;
          this.getCallOnPageLoad();
        }  
      });
    /*   this.wmsService.selectedValueSubject.subscribe((data) => {
        if(data){
          this.valueimg = data;
          console.log(this.valueimg);
          this.getCallOnDropDownChange(this.valueimg)
          this.item = this.valueimg    
        }
  }) */
  }
  valueimg:any;
 /*  ngOnChanges(changes: SimpleChanges) {
    this.getCallOnDropDownChange(changes.item.currentValue);
    this.item = changes.item.currentValue;
  } */
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
  //  this.fetchwmsoNumbers();
   // this.fetchAllExecutionIDName();
   /*  const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole; */
    /* this.getCallOnPageLoad(); */
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
  }
  fetchwmsoNumbers() {
    this.outboundProcessService.fetchAllPickings(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickings) {
          this.getWMSOS(response.data.pickings);
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllExecutionIDName() {
    const form = this.formObj;
    form["workType"] = "Labeling";
    this.commonDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
  }
  getWMSOS(data) {
    this.WMSOs = [];
    if (data) {
      data.forEach(line => {
        if (line.wmsoNumber && this.WMSOs.indexOf(line.wmsoNumber) === -1 && (line.pickingCompleted === true)) {
          this.WMSOs.push(line.wmsoNumber);
        }
      });
    }
  }
  getDataForFilters() {
    this.selectAllCheckboxValue = false;
    this.selectedDocuments = [];
    this.rerender();
    this.getCallOnPageLoad({ "assignedTos": this.forSearchEmp, "wmsoNumber": this.wmsoNumber });
  }
  getCallOnPageLoad(key?) {
    const lebellingPlanning = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Labeling",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName] ? [this.fetchUserLoginIDName] : null
    }

    this.internaltransfersService.fetchAllPlanningLabelling(lebellingPlanning).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.labellingData = this.linesFraming(res['data']['shipmentOrders']);
       // this.dtTrigger.next();
      }
      else {
        this.labellingData = [];
        this.dtTrigger.next();
      }
    })
  }
  getCallOnDropDownChange(user) {
    /*  const form = Object.assign(this.formObj, { "status": "Open" }, key) */
    const lebellingPlanning = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Labeling",
      "status": "Open",
      "assignedTos": [user]
    }
    this.internaltransfersService.fetchAllPlanningLabelling(lebellingPlanning).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.labellingData = this.linesFraming(res['data']['shipmentOrders']);
        this.dtTrigger.next();
      }
      else {
        this.labellingData = [];
        this.rerender();
        this.dtTrigger.next();
      }
    })
  }
  onSendingNullPartDrpDownValue(key?) {
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole;
    const lebellingPlanning = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Labeling",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName]
    }
    console.log(this.fetchUserLoginIDName);
    this.internaltransfersService.fetchAllPlanningLabelling(lebellingPlanning).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.labellingData = this.linesFraming(res['data']['shipmentOrders']);
      //  this.dtTrigger.next();
      }
      else {
        this.labellingData = [];
        this.dtTrigger.next();
      }
    })
  }
  
  linesFraming(json) {
    const shipmentOrders = json;
    const products = [];
    if (shipmentOrders) {
      shipmentOrders.forEach((so) => {
        for (const key in so) {
          if (so.shipmentOrderLines && key === 'shipmentOrderLines') {
            so[key].forEach(a => {
              a.headerID = so._id;
              a.wmsoNumber = so.wmsoNumber;
              a.fullWmsoNumber = so.fullWmsoNumber;              
              a.isChecked = false;
              if (a.labelingInfo) {
                a.labelingInfo['status'] = 'Open';
              }
              else {
                a.labelingInfo = {};
                a.labelingInfo['status'] = 'Open'
              }
              products.push(a);
            });
          }
        }
      });
      return products
    }
  }
  onDocumentSelect(event, data) {
    if (event.target.checked) {
      data.isChecked = true;
      this.selectedDocuments.push(data);
    }
    else {
      data.isChecked = false;
      this.selectedDocuments = this.selectedDocuments.filter(x => x._id != data._id);
    }
    this.selectAllCheckboxValue = this.labellingData.every(function (item: any) {
      return item.isChecked == true;
    })
  }

  onStatusChange(key, data) {
    if (this.permissionsList.includes('Update')) {
      const obj = {
        "endDate": (key == 'status') ? new Date() : null,
        "startDate": (key == 'status') ? data.labelingInfo.startDate : new Date(),
      }
      data.labelingInfo.startDate = obj.startDate;
      data.labelingInfo.endDate = obj.endDate;
      this.intoEmployee(data, null, 'yes');
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  intoEmployee(attr, event?, forStatus?) {
    const formBody = {
      _id: attr.headerID,
      shipmentOrderLines: [{
        _id: attr._id,
        labelingInfo: attr.labelingInfo
      }]
    }
    this.internaltransfersService.updatePlanningLabelling([formBody]).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrderRespObj']) {
        this.selectAllCheckboxValue = false;
        event ? this.toastr.success("Assigned User Successfully") :
          (forStatus ? ((attr.labelingInfo.endDate) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
        this.completionDate = null;
        if (attr.labelingInfo.endDate) {
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
    this.rerender();
    this.getCallOnDropDownChange(this.item);
  }
  resetOnly() {
    this.forSearchEmp = null;
    this.wmsoNumber = null;
    this.selectAllCheckboxValue = null;
    this.completionDate = null;
  }

}
