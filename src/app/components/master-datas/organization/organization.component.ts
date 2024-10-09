import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
  organizationForm: FormGroup;
  focusedElement: any;
  orgData: any = [];
  countries: any = [];
  operationalUnit: Boolean = false;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  tableHeadings: any = ['S.No', 'Organization ID', 'Organization Name', 'Parent Organization', 'Operational Unit', 'Contact Name',
    'Email ID', 'Phone Number','GST Number','PAN Number', 'Address', 'Country', 'State', 'City', 'Pincode', 'Action']
  deleteInfo: any;
  formObj = this.configService.getGlobalpayload();
  isReadMode: any = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  statesData: any = [];
  statesList: any = [];

  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Organization', Storage.getSessionUser());
  /* table commit */

  constructor(private fb: FormBuilder, private commonMasterDataService: CommonMasterDataService,
    private excelRestService: ExcelRestService, private customValidators: CustomValidators,
    private wmsService: WMSService,
    private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private configService: ConfigurationService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        lengthMenu: 'Show _MENU_ Entries',
      }
    };
    this.role = Storage.getSessionUser().authorities[0].authority;
    if ((this.role == 'ROLE_CLIENT' || this.role == 'ROLE_SUPER_ADMIN') && this.permissionsList.length == 0) {
      this.permissionsList = ['View', 'Update', 'Delete'];
    }
    this.getFunctionsCall();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createForm();
      this.fetchAllStates();
      this.fetchAllCountries();
      this.fetchAllOrganizations();
    }
  }
  createForm() {
    this.organizationForm = this.fb.group({
      "_id": null,
      "organizationID": [null, this.customValidators.required],
      "organizationName": [null, this.customValidators.required],
      "organizationIDName": null,
      "contactName": null,
      "emailID": null,
      "phoneNumber": null,
      "address": null,
      "city": null,
      "pincode": null,
      "state": null,
      "country": null,
      "operationalUnit": "No",
      "gstNumber": null,
      "panNumber": null,
      "parentOrganizationInfo": this.fb.group({
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      })
    })
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
  fetchAllStates() {
    this.wmsService.fetchStates(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].countryStateMasters) {
        this.statesData = res['data'].countryStateMasters;
      }
    })
  }
  getStates(event) {
    const filteredRec = this.statesData.find(x => x.countryName == event);
    this.statesList = filteredRec ? filteredRec.stateNames : [];
  }
  fetchAllOrganizations() {
    this.excelRestService.fetchAllOrganizations({}).subscribe(res => {
      this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
        if (res['status'] == 0 && res['data']['organizations'].length > 0) {
          this.orgData = res['data']['organizations'];
          this.rerender();
        }
      })
    })
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllOrganizations();
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'organization', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  getOrganizationIDName() {
    if (this.organizationForm.controls.organizationID.value && this.organizationForm.controls.organizationName.value) {
      this.organizationForm.controls.organizationIDName.setValue(`${this.organizationForm.value.organizationID}:${this.organizationForm.value.organizationName}`);
    }
  }
  setCheckValue(event) {
    if (event) {
      this.organizationForm.controls.operationalUnit.setValue('Yes');
    }
    else {
      this.organizationForm.controls.operationalUnit.setValue('No');
    }
  }
  frameParentOrg(event) {
    if (event) {
      const orgDetails = this.orgData.find(x => x.organizationIDName == event);
      this.organizationForm.controls.parentOrganizationInfo.patchValue(orgDetails);
    }
    else {
      const orgDetails = {
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      }
      this.organizationForm.controls.parentOrganizationInfo.patchValue(orgDetails);
    }
  }
  save() {
  if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const form = this.organizationForm.value;
      if (!form.parentOrganizationInfo.organizationIDName) {
        form.parentOrganizationInfo = null;
      }
      this.excelRestService.saveorUpdateOrganization(form).subscribe(data => {
        console.log(data);
        if (data['status'] == 0) {
          this.toastr.success(data['statusMsg']);
          this.clear();
          this.fetchAllOrganizations();
        }
      })
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  edit(data) {
    this.globalIDs = data._id;
    this.getStates(data.country);
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      if (data.operationalUnit) {
        this.operationalUnit = (data.operationalUnit == 'No') ? false : true;
      }
      if (!data.parentOrganizationInfo) {
        data.parentOrganizationInfo = {
          "_id": null,
          "organizationID": null,
          "organizationName": null,
          "organizationIDName": null
        }
      }
      this.organizationForm.patchValue(data);
      window.scroll(0, 0);
      this.isReadMode = true
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
    }
    else if (this.permissionsList.includes('View')) {
      if (data.operationalUnit) {
        this.operationalUnit = (data.operationalUnit == 'No') ? false : true;
      }
      if (!data.parentOrganizationInfo) {
        data.parentOrganizationInfo = {
          "_id": null,
          "organizationID": null,
          "organizationName": null,
          "organizationIDName": null
        }
      }
      this.organizationForm.patchValue(data);
      window.scroll(0, 0);
      this.organizationForm.disable();
    }
  }
  clear() {
    this.isReadMode = false
    this.organizationForm.reset();
    this.organizationForm.controls.operationalUnit.setValue('No');
    this.operationalUnit = false;
    this.organizationForm.enable();
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
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.invalid && fieldName.touched;
    }
  }
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.valid && fieldName.touched;
    }
  }
}
