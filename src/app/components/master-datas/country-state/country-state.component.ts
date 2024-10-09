import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Storage } from '../../../shared/utils/storage';

@Component({
  selector: 'app-country-state',
  templateUrl: './country-state.component.html',
  styleUrls: ['./country-state.component.scss']
})
export class CountryStateComponent implements OnInit {
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'State', Storage.getSessionUser());
  stateForm: FormGroup;
  countries: any = [];
  statesData: any = [];
  stateName: any = null;
  deleteInfo: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;

  constructor(private commonMasterDataService: CommonMasterDataService, private toastr: ToastrService,
    private ngxSmartModalService: NgxSmartModalService,
    private configService: ConfigurationService, private fb: FormBuilder, private wmsService: WMSService) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        lengthMenu: 'Show _MENU_ Entries',
      }
    };

    this.fetchAllCountries();
    this.createForm();
    this.fetchAllStates();
  }
  fetchAllCountries() {
    this.commonMasterDataService.fetchAllCountries(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.countries) {
        this.countries = response.data.countries;
      } else {
        this.countries = [];
      }
    }, error => {
      this.countries = [];
    });
  }
  createForm() {
    this.stateForm = this.fb.group({
      "countryName": [null, Validators.required],
      "stateNames": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      _id: null,
      createdDate: null,
      lastUpdatedDate: null
    })
  }
  save() {
    const hasUpdatePermission = this.permissionsList.includes("Update");
    const hasCreatePermission = this.permissionsList.includes("Create");
    if (hasUpdatePermission && hasCreatePermission) {
      let form = this.stateForm.value;
      const filteredRec = this.statesData.find(x => x.countryName === form.countryName);
      if (filteredRec) {
        form = filteredRec;
      }
      if (form.stateNames && form.stateNames.length > 0) {
        form['stateNames'].push(this.stateName);
      } else {
        form['stateNames'] = [this.stateName];
      }
      this.wmsService.saveorUpdateStates(form).subscribe(res => {
        if (res['status'] === 0 && res['data'].countryStateMaster) {
          this.toastr.success("Saved Successfully");
          this.clear();
          this.rerender();
          this.fetchAllStates();
        }
      });
    } 
    else if(hasCreatePermission)
    {
      let form = this.stateForm.value;
      const filteredRec = this.statesData.find(x => x.countryName === form.countryName);
      if (filteredRec) {
        form = filteredRec;
      }
      if (form.stateNames && form.stateNames.length > 0) {
        form['stateNames'].push(this.stateName);
      } else {
        form['stateNames'] = [this.stateName];
      }
      this.wmsService.saveorUpdateStates(form).subscribe(res => {
        if (res['status'] === 0 && res['data'].countryStateMaster) {
          this.toastr.success("Saved Successfully");
          this.clear();
          this.rerender();
          this.fetchAllStates();
        }
      });
    } 
    else if((hasUpdatePermission &&  this.stateForm.value._id))
      {
        let form = this.stateForm.value;
        const filteredRec = this.statesData.find(x => x.countryName === form.countryName);
        if (filteredRec) {
          form = filteredRec;
        }
        if (form.stateNames && form.stateNames.length > 0) {
          form['stateNames'].push(this.stateName);
        } else {
          form['stateNames'] = [this.stateName];
        }
        this.wmsService.saveorUpdateStates(form).subscribe(res => {
          if (res['status'] === 0 && res['data'].countryStateMaster) {
            this.toastr.success("Saved Successfully");
            this.clear();
            this.rerender();
            this.fetchAllStates();
          }
        });
      }
      else{
        this.toastr.error("User Doesnt Have Permission ")
      }
  }
  
  clear() {
    this.createForm();
    this.stateName = null;
  }
  fetchAllStates() {
    this.wmsService.fetchStates(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].countryStateMasters) {
        this.statesData = res['data'].countryStateMasters;
        this.dtTrigger.next();
      }
    })
  }
  delete(data) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'State', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.rerender();
      this.fetchAllStates();
    }
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
}
