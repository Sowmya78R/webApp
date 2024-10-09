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
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Storage } from '../../../../shared/utils/storage';
@Component({
  selector: 'app-employeetaskpacking',
  templateUrl: './employeetaskpacking.component.html',
  styleUrls: ['./employeetaskpacking.component.scss']
})
export class EmployeetaskpackingComponent implements OnInit {

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
  packingData: any = [];
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
  employeeTaskForm: FormGroup
  passedAssignedToValue: any;
  unSubscribeTheValue: any;
  getGlobalEmployeeIDName: any;
  vinay = this.wmsService["PassEmployeeIDNameValue"]
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Employee Tasks', Storage.getSessionUser());
  @Input() item = '';
  subscription:Subscription;
  valueimg:any;
  constructor(private configService: ConfigurationService, private commonDataService: CommonMasterDataService, private toastr: ToastrService
    , private outboundProcessService: OutboundProcessService,
    private internaltransfersService: InternaltransfersService,
    private fb: FormBuilder, private wmsService: WMSService) {
      this.subscription = this.wmsService.selectedValueSubject.subscribe((data) => {
        if(data){
          this.valueimg = data;
          console.log(this.valueimg);
          this.getCallOnDataChange(this.valueimg)
          this.item = this.valueimg
        } else {
          const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
          this.fetchUserLoginIDName = loginUserRole;
          this.geCallOnPageLoad();
        }  
      });
     /*  this.wmsService.selectedValueSubject.subscribe((data) => {
        if(data){
          this.valueimg = data;
        console.log(this.valueimg);
        this.getCallOnDataChange(this.valueimg)
        this.item = this.valueimg  
        }
  }) */
  }
  /* ngOnChanges(changes: SimpleChanges) {
    this.getCallOnDataChange(changes.item.currentValue);
    this.item = changes.item.currentValue;
  } */

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole;
    //this.geCallOnPageLoad();
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
    form["workType"] = "Packing";
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
    this.geCallOnPageLoad({ "assignedTos": this.forSearchEmp, "wmsoNumber": this.wmsoNumber });
  }
  geCallOnPageLoad(key?) {
    const reqPackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Packing",
      "status": "Open",
      "assignedTos": this.fetchUserLoginIDName ? [this.fetchUserLoginIDName] : null
    }
    console.log(reqPackingObj);
    this.internaltransfersService.fetchAllPlanningPacking(reqPackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.packingData = this.linesFraming(res['data']['shipmentOrders']);
        this.rerender();
        this.dtTrigger.next();
       
      }
      else {
        this.rerender();
        this.dtTrigger.next();
        this.packingData = [];       
      }
    })
  }
  updateData() {
    this.wmsService.updateData({ 'currentUser' : this.valueimg});
}
  getCallOnDataChange(user) {
    const reqPackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Packing",
      "status": "Open",
      "assignedTos": [user]
    }
    /* "assignedTos": [this.unSubscribeTheValue] ? [this.unSubscribeTheValue]:null  */
    this.internaltransfersService.fetchAllPlanningPacking(reqPackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.packingData = this.linesFraming(res['data']['shipmentOrders']);
        this.rerender();
        this.dtTrigger.next()
      }
      else {
        this.packingData = [];
        this.rerender();
        this.dtTrigger.next()
      }
    })
  }
  onSendingNullPartDrpDownValue(key?) {
    const reqPackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Packing",
      "status": "Open",
      "assignedTos": this.fetchUserLoginIDName ? [this.fetchUserLoginIDName] : null
    }
    this.internaltransfersService.fetchAllPlanningPacking(reqPackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.packingData = this.linesFraming(res['data']['shipmentOrders']);
      }
      else {
        this.packingData = [];
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
              a.packingInfo.status = 'Open';
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
    this.selectAllCheckboxValue = this.packingData.every(function (item: any) {
      return item.isChecked == true;
    })
  }

  onStatusChange(key, data) {
    if (this.permissionsList.includes('Update')) {
      const obj = {
        "endDate": (key == 'status') ? new Date() : null,
        "startDate": (key == 'status') ? data.packingInfo.startDate : new Date(),
      }
      data.packingInfo.startDate = obj.startDate;
      data.packingInfo.endDate = obj.endDate;
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
        packingInfo: attr.packingInfo
      }]
    }
    this.internaltransfersService.updatePlanningPacking([formBody]).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrderRespObj']) {
        this.selectAllCheckboxValue = false;
        event ? this.toastr.success("Assigned User Successfully") :
          (forStatus ? ((attr.packingInfo.endDate) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
        this.completionDate = null;
        if (attr.packingInfo.endDate) {
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
    this.getCallOnDataChange(this.item);
  }
  resetOnly() {
    this.forSearchEmp = null;
    this.wmsoNumber = null;
    this.selectAllCheckboxValue = null;
    this.completionDate = null;
  }

}
