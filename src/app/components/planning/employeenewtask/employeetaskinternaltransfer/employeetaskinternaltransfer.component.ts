import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InternaltransfersService } from 'src/app/services/integration-services/internaltransfers.service';
import { Storage } from 'src/app/shared/utils/storage';
import { ApexService } from 'src/app/shared/services/apex.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-employeetaskinternaltransfer',
  templateUrl: './employeetaskinternaltransfer.component.html',
  styleUrls: ['./employeetaskinternaltransfer.component.scss']
})
export class EmployeetaskinternaltransferComponent implements OnInit {
  
  internalTransferForm: FormGroup;
  showTooltip: any = false;
  focusedElement: any;
  products: any = [];
  internalTransfers: any = [];
  productMasterInfo: any = {};
  supplierID: any = '';
  inventories: any = [];
  productIDNames: any = [];
  dataService: CompleterData;
  internalTransferReq: any = {};
  inventoryKeys: any = ['#', 'Product ID/Name', 'Zone Name', 'Location Name', 'Quantity Inventory Unit', 'Available Quantity', 'Reserved Quantity'];
  internalTransferKeys: any = ['#', 'Transaction ID', 'Product ID/Name', 'Source Location',
    'Destination Location', 'Transfer Quantity', 'Reason', 'Start Date', 'End Date', 'Status'];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  filteredInventoryByProduct: any = [];
  locationNames: CompleterData;
  destinationLocationNames: CompleterData;
  locationMaster: any = [];
  permissionToggle: any = false;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Employee Tasks', Storage.getSessionUser());
  forPermissionsSubscription: any;
  itData: any = [];
  makeThisDisable: boolean = false;
  selectAllCheckboxValue: boolean = false;
  selectedDocuments: any = [];
  wareHouseTeamsListIDs: CompleterData;
  wareHouseTeamsList: any = [];
  assignedEmployeeIDName: any = null;
  forSearchEmp: any = null;
  completionDate: any = null;
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
  passedAssignedToValue: any;
  @Input() item = '';
  valueimg:any
  constructor(private apexService: ApexService, private configService: ConfigurationService,
    private toastr: ToastrService, private commonDataService: CommonMasterDataService,
    private internaltransfersService: InternaltransfersService, private fb: FormBuilder
    ,private wmsService: WMSService,) {
      this.wmsService.selectedValueSubject.subscribe((data) => {
        if(data){
          this.valueimg = data;
          console.log(this.valueimg);
          this.getCallOnDropDownChange(this.valueimg)
          this.item = this.valueimg 
        }  
        else{
          this.getCallOnPageLoad();
        }

  })
    this.apexService.getPanelIconsToggle();
  }
  fetchUserLoginIDName: any;
  /* ngOnChanges(changes: SimpleChanges) {
    this.getCallOnDropDownChange(changes.item.currentValue);
    this.item = changes.item.currentValue;
  } */
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5
    };
    // this.warehouseTeams
    //  this.fetchAllExecutionIDName();
    // const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    // this.fetchUserLoginIDName = loginUserRole;
    // this.getCallOnPageLoad();
  }
  employeeTaskForm: FormGroup
  createEmployeeNewTaskForm() {
    this.employeeTaskForm = this.fb.group({
      assignedTos: [null]
    })
  }
  getDataForFilters() {
    this.selectAllCheckboxValue = false;
    this.selectedDocuments = [];
    this.rerender();
    this.getCallOnPageLoad({ "assignedTos": this.forSearchEmp });
  }

  getCallOnPageLoad(key?) {
  
    const internalTransferReq = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Transfers",
      "status": "Approved",
      "assignedTos": [this.fetchUserLoginIDName] ? [this.fetchUserLoginIDName] : null
    }
    // this.dtTrigger.next();
    
    this.internaltransfersService.fetchAllTransferPlanning(internalTransferReq).subscribe(res => {
      if (res['status'] == 0 && res['data']['internalTransfers']) {
        this.itData = res['data']['internalTransfers'];
      
        // this.dtTrigger.next();
        this.itData.forEach(element => {
          element.isChecked = false;
        });
        
        
      }
      else {
       
        // this.dtTrigger.next();
        this.itData = [];
      }

    })
  }


  getCallOnDropDownChange(user) {
    const internalTransferReq = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Transfers",
      "status": "Approved",
      "assignedTos": [user]
    }
    this.internaltransfersService.fetchAllTransferPlanning(internalTransferReq).subscribe(res => {
      if (res['status'] == 0 && res['data']['internalTransfers'].length > 0) {
        this.itData = res['data']['internalTransfers'];
        this.itData.forEach(element => {
          element.isChecked = false;
        });
      //  this.dtTrigger.next();
      } 
      else {
        this.itData = [];
      }

    })
  }
  onSendingNullPartDrpDownValue(key?) {
    const internalTransferReq = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Transfers",
      "status": "Approved",
      "assignedTos": [this.fetchUserLoginIDName]
    }
    this.internaltransfersService.fetchAllTransferPlanning(internalTransferReq).subscribe(res => {
      if (res['status'] == 0 && res['data']['internalTransfers'].length > 0) {
        this.itData = res['data']['internalTransfers'];
        this.itData.forEach(element => {
          element.isChecked = false;
        });
        // this.dtTrigger.next();
      }
      else {
        this.itData = [];
      }
    })
  }
  fetchAllExecutionIDName() {
    const form = this.formObj;
    form["workType"] = "Transfers"
    this.commonDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
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
    this.selectAllCheckboxValue = this.itData.every(function (item: any) {
      return item.isChecked == true;
    })
  }
  multiStart(key) {
    if (this.selectedDocuments.length > 0) {
      if (key == 'startDate') {
        let proceed: Boolean = true;
        this.selectedDocuments.forEach(element => {
          if (proceed) {
            if (this.itData.find(x => x._id == element._id).startDate) {
              proceed = false;
            }
          }
        });
        proceed ? this.assignEmployeeforMulti(key) : this.toastr.error("Selected Data Already Started");
      }
      else {
        let proceed: Boolean = true;
        this.selectedDocuments.forEach(element => {
          if (proceed) {
            if (!this.itData.find(x => x._id == element._id).startDate) {
              proceed = false;
            }
          }
        });
        proceed ? this.assignEmployeeforMulti(key) : this.toastr.error("Selected Data Not Yet Start");
      }
    }
    else {
      this.toastr.error("Atleast Select One");
    }
  }
  assignEmployeeforMulti(key?) {
    if (this.selectedDocuments.length > 0) {
      if (key) {
        this.selectedDocuments.forEach(element => {
          element["endDate"] = (key == 'status') ? new Date() : element.endDate,
            element["startDate"] = (key == 'status') ? element.startDate : new Date()
        });
      }
      else {
        this.selectedDocuments.forEach(element => {
          if (this.assignedEmployeeIDName && this.assignedEmployeeIDName.length > 0) {
            element['assignedTo'] = this.assignedEmployeeIDName
          }
          if (this.completionDate) {
            element["plannedCompletionDate"] = new Date(this.completionDate);
          }
        });
      }
      this.internaltransfersService.updateplanningTransfers(this.selectedDocuments).subscribe(data => {
        if (data.status == 0 && data.data.internalTransfer) {
          (!key) ? this.toastr.success("Assigned Successfully") : (key == 'status' ? this.toastr.success("Completed Successfully") : this.toastr.success("Started Successfully"));
          this.selectedDocuments = [];
          this.selectAllCheckboxValue = false;
          this.assignedEmployeeIDName = null;
          this.completionDate = null;
          this.reset();
        }
        else if (data && data.status === 2) {
          this.toastr.error(data.statusMsg);
          this.selectedDocuments = [];
          this.selectAllCheckboxValue = false;
          this.assignedEmployeeIDName = null;
          this.completionDate = null;
          this.reset();
        }
        else {
          this.toastr.error("Failed to Assign")
        }
      })
    }
    else {
      this.toastr.error("Atleast Select One");
      this.assignedEmployeeIDName = null;
    }
  }
  updateData() {
    this.wmsService.updateData({ 'currentUser' : this.valueimg});
}
  onStatusChange(key, data) {
    if (this.permissionsList.includes('Update')) {
      const obj = {
        "endDate": (key == 'status') ? new Date() : null,
        "startDate": (key == 'status') ? data.startDate : new Date(),
      }
      if (key == 'status') {
        data['statusStage'] = {
          status: 'Completed',
          statusSequence: (data.statusStages[data.statusStages.length - 1].statusSequence) + 1
        }
      }
      data.startDate = obj.startDate;
      data.endDate = obj.endDate;
      this.intoEmployee(data, null, 'yes');
      if (data.startDate && data.endDate) {
        this.itData = [];
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  intoEmployee(attr, event?, forStatus?) {
    this.internaltransfersService.updateplanningTransfers([attr]).subscribe(res => {
      if (res['status'] == 0 && res['data']['internalTransfer']) {
        this.selectAllCheckboxValue = false;
        event ? this.toastr.success("Assigned User Successfully") :
          (forStatus ? ((attr.endDate) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
        this.completionDate = null;
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
  reset() {
    // this.rerender();
    this.getCallOnDropDownChange(this.item);
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
