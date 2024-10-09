import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExcelService } from '../../../../shared/services/excel.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApexService } from '../../../../shared/services/apex.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { CustomValidators } from '../../../../shared/utils/custom-validator';
import { Util } from 'src/app/shared/utils/util';
import { Subject } from 'rxjs';
import { Constants } from '../../../../constants/constants';
import { WmsCommonService } from '../../../../services/wms-common.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from '../../../../shared/services/common.service';
import { Storage } from '../../../../shared/utils/storage';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-config',
  templateUrl: './user-config.component.html'
})
export class UserConfigComponent implements OnInit, OnDestroy, AfterViewInit {
  userConfigForm: FormGroup;
  userConfigKeys = ['', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', ''];
  userConfigData: any = {
    // tenatID: []
  };
  users: any = [];
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  focusedElement: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  statuss: any = ['Active', 'InActive'];
  roles: any = [];
  id: any;
  isReadMode: any = false;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  role: any;
  isEdit: any = false;
  orgData: any = [];
  formObj = this.configService.getGlobalpayload();
  configPermissionsList: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  finalArray: any = [];
  selectedUsers: any = [];


  constructor(private apexService: ApexService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private excelService: ExcelService,
    private toastr: ToastrService,
    private customValidators: CustomValidators,
    private util: Util,
    private commonService: CommonService,
    private wmsCommonService: WmsCommonService,
    private commonMasterDataService: CommonMasterDataService, private excelRestService: ExcelRestService,
    private translate: TranslateService,) {
    this.createUserConfigForm();
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.getRole();
    const value = (this.role == 'ROLE_CLIENT' || this.role == 'ROLE_SUPER_ADMIN') ? true : false;
    this.configPermissionsList = this.configService.getConfigurationPermissions('mainFunctionalities', 'User Config', value);
    if (value && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View', 'Update', 'Delete'];
    }
    if (this.configPermissionsList.includes('View')) {
      this.userConfigForm.patchValue({
        createdBy: Storage.getSessionItem('userDetails') ?
          Storage.getSessionItem('userDetails').userIDName : ''
      });
      this.apexService.getPanelIconsToggle();
      this.fetchAllOrganizations();
      this.fetchAllUsersByRoleInfo();
      this.fetchAllCountries();
      this.fetchAllRoles();
      // this.getRole();
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 5,
      };
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  save() {
    if (this.configPermissionsList.includes('Update')) {
      this.userConfigData = this.userConfigForm.value;
      if (!this.userConfigData.organizationInfo.organizationIDName) {
        this.userConfigData.organizationInfo = null;
      }
      if (this.id) {
        this.userConfigData._id = this.id;
      }
      this.userConfigData.rolesList =
        this.commonService.getFilteredObjectsFromArray(this.roles, 'roleName', this.userConfigForm.value.rolesList);
      // this.userConfigData.tenatID = tenatID;
      if (this.userConfigData.rolesList.length === 0) { delete this.userConfigData.rolesList; }
      // if (this.userConfigData.tenatID.length === 0) { delete this.userConfigData.tenantID; };
      if (['ROLE_SUPER_ADMIN'].includes(this.role)) {
        this.commonMasterDataService.saveOrUpdateUserConfig(JSON.stringify(this.userConfigData)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data) {
              this.id = null;
              this.userConfigForm.reset();
              this.fetchAllUsersByRoleInfo();
              this.isReadMode = false;
              this.userConfigData = {
                // tenatID: []
              };
              this.toastr.success('User details saved');
            } else if (response && response.status === 2 && response.statusMsg) {
              this.toastr.error(response.statusMsg);
            } else {
              this.toastr.error('Failed in saving details');
            }
          },
          (error) => {
            this.toastr.error('Failed in saving details');
          });
      } else {
        this.userConfigData.businessUnit = sessionStorage.getItem('businessUnit');
        if (this.userConfigForm.value.rolesList !== '') {
          if (!this.userConfigForm.value.rolesList && this.role == 'ROLE_CLIENT') {
            this.userConfigData.rolesList =
              [{
                roleName
                  :
                  "ROLE_USER"
              }]

          }
          this.commonMasterDataService.saveOrUpdateRoleUser(JSON.stringify(this.userConfigData)).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data) {
                this.id = null;
                this.userConfigForm.reset();
                this.fetchAllUsersByRoleInfo();
                this.isReadMode = false;
                this.userConfigData = {
                  // tenatID: []
                };
                this.toastr.success('User details saved');
              } else if (response && response.status === 2 && response.statusMsg) {
                this.toastr.error(response.statusMsg);
              } else {
                this.toastr.error('Failed in saving details');
              }
            },
            (error) => {
              this.toastr.error('Failed in saving details');
            });
        } else {
          this.toastr.error('Please select role');
        }
      }
    }
    // const tenatID = this.userConfigData.tenatID.slice();
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
  clear() {
    this.userIDName = false;
    this.userConfigForm.reset();
    this.userConfigForm.controls.createdOn.setValue(this.wmsCommonService.getDateFromMilliSec(Date.now()));
    this.userConfigForm.patchValue({
      createdBy: Storage.getSessionItem('userDetails') ?
        Storage.getSessionItem('userDetails').userIDName : ''
    });
    this.id = null;
    this.isReadMode = false;
  }
  userIDName: boolean = false;
  edit(data: any) {
    this.userIDName = true;
    this.isEdit = true;
    window.scroll(0, 0);
    this.id = data._id;
    if (!data.organizationInfo) {
      data.organizationInfo = {
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      }
    }
    this.userConfigData = Object.assign({}, data);
    this.userConfigForm.patchValue(this.userConfigData);
    this.userConfigForm.controls.rolesList.setValue(this.userConfigData.rolesList[0].roleName);
    this.userConfigForm.controls.createdOn.setValue(this.wmsCommonService.getDateFromMilliSec(this.userConfigData.createdOn));
    this.isReadMode = true;
  }
  // fetchAllUsers() {
  //   this.userConfigForm.controls.createdOn.setValue(this.wmsCommonService.getDateFromMilliSec(Date.now()));
  //   this.commonMasterDataService.fetchAllUsers().subscribe(
  //     (response) => {
  //       if (response && response.status === 0 && response.data.users) {
  //         this.users = response.data.users;
  //         this.rerender();
  //       } else {
  //         this.users = [];
  //       }
  //     },
  //     (error) => {
  //       this.users = [];
  //     });
  // }
  fetchAllUsersByRoleInfo() {
    this.userConfigForm.controls.createdOn.setValue(this.wmsCommonService.getDateFromMilliSec(Date.now()));
    this.userConfigForm.patchValue({
      createdBy: Storage.getSessionItem('userDetails') ?
        Storage.getSessionItem('userDetails').userIDName : ''
    });
    this.commonMasterDataService.fetchAllUsers().subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.users) {
          this.users = response.data.users;
          this.users.forEach(element => {
            element.isChecked = false;
          });
          // if (['ROLE_CLIENT'].includes(this.role)) {
          //   this.users = response.data.users.filter(user =>
          //     user.rolesList && user.rolesList[0] && user.rolesList[0].roleName !== 'ROLE_CLIENT');
          // }
          this.rerender();
        } else {
          this.users = [];
        }
      },
      (error) => {
        this.users = [];
      });
  }
  fetchAllRoles() {
    this.commonMasterDataService.fetchAllRoles(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.roles) {
        this.roles = response.data.roles;
      } else {
        this.roles = [];
      }
    }, error => {
      this.roles = [];
    });
  }
  getSelectedValue(type, value) {
    switch (type) {
      // case 'Country': {
      //   if (value) {
      //     for (let i = 0; i < this.countries.length; i++) {
      //       if (this.countries[i].name === value) {
      //         this.fetchAllStatesByCountryID(this.countries[i]._id);
      //         break;
      //       }
      //     }
      //   }
      //   break;
      // }
      // case 'State': {
      //   if (value) {
      //     for (let i = 0; i < this.states.length; i++) {
      //       if (this.states[i].name === value) {
      //         this.fetchAllCitiesByStateID(this.states[i]._id);
      //         break;
      //       }
      //     }
      //   }
      //   break;
      // }
      // case 'ROLE': {
      //   if (value) {
      //     for (let i = 0; i < this.roles.length; i++) {
      //       if (this.role[i].name === value) {
      //         break;
      //       }
      //     }
      //   }
      //   break;
      // }
    }
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
  fetchAllStatesByCountryID(id: any) {
    this.commonMasterDataService.fetchAllStatesByCountryID(id).subscribe(response => {
      if (response && response.status === 0 && response.data.states) {
        this.states = response.data.states;
      } else {
        this.states = [];
      }
    }, error => {
      this.states = [];
    });
  }
  fetchAllCitiesByStateID(id: any) {
    this.commonMasterDataService.fetchAllCitiesByStateID(id).subscribe(response => {
      if (response && response.status === 0 && response.data.cities) {
        this.cities = response.data.cities;
      } else {
        this.cities = [];
      }
    }, error => {
      this.cities = [];
    });
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName, formName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.util.shouldShowErrors(fieldName, formName);
    }
  }
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.userConfigForm.controls[fieldName].valid && this.userConfigForm.controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  createUserConfigForm() {
    this.userConfigForm = new FormBuilder().group({
      firstName: ['', this.customValidators.required],
      userID: ['', this.customValidators.required],
      userIDName: ['', this.customValidators.required],
      lastName: ['', this.customValidators.required],
      password: ['', this.customValidators.required],
      rolesList: [null],
      businessUnit: null,
      createdBy: ['', this.customValidators.required],
      phoneNumber: ['', this.customValidators.required],
      address: ['', this.customValidators.required],
      state: [''],
      name: ['', this.customValidators.required],
      pin: [''],
      email: ['', this.customValidators.validateSkrillEmail],
      city: [''],
      country: [null, this.customValidators.required],
      status: ['Active'],
      createdOn: [''],
      usersCreationLimit: null,
      organizationInfo: new FormBuilder().group({
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      })
    });
  }
  fetchAllOrganizations() {
    this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['organizations'].length > 0) {
        this.orgData = res['data']['organizations'];
        this.rerender();
      }
      else {
        this.orgData = [];
      }
    })
  }
  frameParentOrg(event) {
    if (event) {
      const orgDetails = this.orgData.find(x => x.organizationIDName == event);
      this.userConfigForm.controls.organizationInfo.patchValue(orgDetails);
    }
    else {
      const orgDetails = {
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      }
      this.userConfigForm.controls.organizationInfo.patchValue(orgDetails);
    }
  }
  exportAsXLSX() {
    if (this.users) {
      this.excelService.exportAsExcelFile(this.users, 'Users', Constants.EXCEL_IGNORE_FIELDS.USERS);
    }
  }
  delete(data: any) {
    if (this.configPermissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'userConfig', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllUsersByRoleInfo();
    }
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
  getRole() {
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      this.role = user.authorities[0].authority;
      return this.role;
    }
  }
  setName() {
    const a = this.userConfigForm.controls.firstName.value;
    const b = this.userConfigForm.controls.lastName.value;
    if (a && b) {
      this.userConfigForm.controls.name.setValue(a + " " + b);
      if (this.userConfigForm.controls.userID.value) {
        this.userConfigForm.controls.userIDName.setValue(this.userConfigForm.controls.userID.value + ':' + this.userConfigForm.controls.name.value)
      }
    }
  }
  read(event, data) {
    if (event.target.checked) {
      data.isChecked = true;
      this.selectedUsers.push(data.email);
    }
    else {
      data.isChecked = false;
      this.selectedUsers = this.selectedUsers.filter(x => x != data.email);
    }
  }
  generatePDF() {
    this.finalArray = [];
    // this.loopToStop = null;
    // this.totalItems = null;
    // this.dataPerPage = null;
    this.getAllBarcodes();
  }
  getAllBarcodes() {
    const payload = {
      "emails": (this.selectedUsers.length > 0) ? this.selectedUsers : []
    }
    this.commonMasterDataService.fetchUserBarcodes(payload).subscribe(res => {
      if (res['status'] == 0 && res['data'].userBarcodeResponses) {
        this.finalArray = res['data'].userBarcodeResponses;
        this.configService.selectedUsers = this.finalArray;
        setTimeout(() => {
          window.print();
        }, 300);
      }
    })
  }
}
