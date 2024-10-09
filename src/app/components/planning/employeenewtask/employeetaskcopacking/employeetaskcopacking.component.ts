import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscribable, Subscription } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InternaltransfersService } from 'src/app/services/integration-services/internaltransfers.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { Storage } from '../../../../shared/utils/storage';
import { WMSService } from 'src/app/services/integration-services/wms.service';
@Component({
  selector: 'app-employeetaskcopacking',
  templateUrl: './employeetaskcopacking.component.html',
  styleUrls: ['./employeetaskcopacking.component.scss']
})
export class EmployeetaskcopackingComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  WMSOs: any = [];
  showTooltip: any = false;
  formObj = this.configService.getGlobalpayload();
  selectAllCheckboxValue: boolean = false;
  selectedDocuments: any = [];
  forSearchEmp: any = null;
  wmsoNumber: any = null;
  assignedEmployeeIDName: any = null;
  wareHouseTeamsListIDs: CompleterData;
  wareHouseTeamsList: any = [];
  coPackingData: any = [];
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
  fetchUserLoginIDName: any;
  unSubscribeTheValue: any;
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Employee Tasks', Storage.getSessionUser());
  @Input() item = '';
  subscription:Subscription

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
     /*  this.wmsService.selectedValueSubject.subscribe((data) => {
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
   /*  const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole;
    this.getCallOnPageLoad(); */
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
    form["workType"] = "Co-Packing";
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
    const CoPacking = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Co-Packing",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName] ? [this.fetchUserLoginIDName] : null
    }
    this.internaltransfersService.fetchAllPlanningCoPacking(CoPacking).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.coPackingData = this.linesFraming(res['data']['shipmentOrders']);
      }
      else {
        this.coPackingData = [];
        this.dtTrigger.next();
      }
    })
  }
  employeeTaskForm: FormGroup
  passedAssignedToValue: any;
  createEmployeeNewTaskForm() {
    this.employeeTaskForm = this.fb.group({
      assignedTos: this.passedAssignedToValue
    })
  }

  getCallOnDropDownChange(user) {
    const CoPacking = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Co-Packing",
      "status": "Open",
      "assignedTos": [user]
    }
    this.internaltransfersService.fetchAllPlanningCoPacking(CoPacking).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.coPackingData = this.linesFraming(res['data']['shipmentOrders']);
        console.log(this.coPackingData);
        this.rerender();
        this.dtTrigger.next();
      }
      else {

        this.coPackingData = [];
       this.rerender();
        this.dtTrigger.next();
      } 
    })
  }
    updateData() {
      this.wmsService.updateData({ 'currentUser' : this.valueimg});
  }
  onSendingNullPartDrpDownValue(key?) {
    /* const form = Object.assign(this.formObj, { "status": "Open" }, key) */
    const CoPacking = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Co-Packing",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName]
    }
    this.internaltransfersService.fetchAllPlanningCoPacking(CoPacking).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.coPackingData = this.linesFraming(res['data']['shipmentOrders']);
      //  this.dtTrigger.next();
      }
      else {
        this.coPackingData = [];
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
              a.coPackingInfo.status = 'Open';
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
    this.selectAllCheckboxValue = this.coPackingData.every(function (item: any) {
      return item.isChecked == true;
    })
  }

  onStatusChange(key, data) {
    if (this.permissionsList.includes('Update')) {
      const obj = {
        "endDate": (key == 'status') ? new Date() : null,
        "startDate": (key == 'status') ? data.coPackingInfo.startDate : new Date(),
      }
      data.coPackingInfo.startDate = obj.startDate;
      data.coPackingInfo.endDate = obj.endDate;
      this.intoEmployee(data, null, 'yes');
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    /*  if( data.coPackingInfo.startDate &&  data.rePackingInfo.endDate )
     {
      this.coPackingData = ''
     } */

  }
  intoEmployee(attr, event?, forStatus?) {
    const formBody = {
      _id: attr.headerID,
      shipmentOrderLines: [{
        _id: attr._id,
        coPackingInfo: attr.coPackingInfo
      }]
    }
    this.internaltransfersService.updatePlanningCoPacking([formBody]).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrderRespObj']) {
        this.selectAllCheckboxValue = false;
        event ? this.toastr.success("Assigned User Successfully") :
          (forStatus ? ((attr.coPackingInfo.endDate) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
        this.completionDate = null;
        if (attr.coPackingInfo.endDate) {
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
