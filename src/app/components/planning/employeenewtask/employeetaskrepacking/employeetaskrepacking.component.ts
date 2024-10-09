import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  selector: 'app-employeetaskrepacking',
  templateUrl: './employeetaskrepacking.component.html',
  styleUrls: ['./employeetaskrepacking.component.scss']
})
export class EmployeetaskrepackingComponent implements OnInit {
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
  rePackingData: any = [];
  completionDate: any = null;
  makeThisDisable: boolean = false;
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
  unSubscribeTheValue: any;
  passedAssignedToValue: any;
  fetchUserLoginIDName: any;
  subscription:Subscription;
  showTooltip: any = false;
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Employee Tasks', Storage.getSessionUser());
  @Input() item = '';
  constructor(private configService: ConfigurationService, private commonDataService: CommonMasterDataService, private toastr: ToastrService
    , private outboundProcessService: OutboundProcessService, 
    private internaltransfersService: InternaltransfersService, private fb: FormBuilder,
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
  /* ngOnChanges(changes: SimpleChanges) {
    this.getCallOnDropDownChange(changes.item.currentValue);
    this.item = changes.item.currentValue;
  } */
  employeeTaskForm: FormGroup
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
  //  this.fetchwmsoNumbers();
  //  this.fetchAllExecutionIDName();

   /*  const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole; */
  //  this.getCallOnPageLoad();
  }

  createEmployeeNewTaskForm() {
    this.employeeTaskForm = this.fb.group({
      assignedTos: this.passedAssignedToValue
    })
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
    if(this.subscription){
      this.subscription.unsubscribe();
    }
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
    form["workType"] = "Repacking";
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
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole;

    const reqRePackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Repacking",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName] ? [this.fetchUserLoginIDName] : null
    }
    this.internaltransfersService.fetchAllPlanningRePacking(reqRePackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.rePackingData = this.linesFraming(res['data']['shipmentOrders']);
        console.log(this.rePackingData);
        this.rerender();
        this.dtTrigger.next();
      }
      else {
        this.rePackingData = [];
        this.rerender();
        this.dtTrigger.next();
      }
    })
  }

  getCallOnDropDownChange(user) {
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole;

    const reqRePackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Repacking",
      "status": "Open",
      "assignedTos": [user]
    }
    this.internaltransfersService.fetchAllPlanningRePacking(reqRePackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.rePackingData = this.linesFraming(res['data']['shipmentOrders']);
        this.rerender();
        this.dtTrigger.next();
      }
      else {
        this.rePackingData = [];
        this.rerender();
        this.dtTrigger.next();
      }
    })
  }
  onSendingNullPartDrpDownValue(key?) {
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole;
    const reqRePackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Repacking",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName]
    }
    this.internaltransfersService.fetchAllPlanningRePacking(reqRePackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.rePackingData = this.linesFraming(res['data']['shipmentOrders']);
        //this.dtTrigger.next();
      }
      else {
        this.rePackingData = [];
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
              a.rePackingInfo.status = 'Open';
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
    this.selectAllCheckboxValue = this.rePackingData.every(function (item: any) {
      return item.isChecked == true;
    })
  }

  onStatusChange(key, data) {
    if (this.permissionsList.includes('Update')) {
      const obj = {
        "endDate": (key == 'status') ? new Date() : null,
        "startDate": (key == 'status') ? data.rePackingInfo.startDate : new Date(),
      }
      data.rePackingInfo.startDate = obj.startDate;
      data.rePackingInfo.endDate = obj.endDate;
      this.intoEmployee(data, null, 'yes');
      if (data.rePackingInfo.startDate && data.rePackingInfo.endDate) {
        this.rePackingData = [];
      }
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
        rePackingInfo: attr.rePackingInfo
      }]
    }
    this.internaltransfersService.updatePlanningRePacking([formBody]).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrderRespObj']) {
        this.selectAllCheckboxValue = false;
        event ? this.toastr.success("Assigned User Successfully") :
          (forStatus ? ((attr.rePackingInfo.endDate) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
        this.completionDate = null;
        if (attr.rePackingInfo.endDate) {
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
