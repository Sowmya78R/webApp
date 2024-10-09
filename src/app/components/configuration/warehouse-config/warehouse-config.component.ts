import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-warehouse-config',
  templateUrl: './warehouse-config.component.html',
  styleUrls: ['./warehouse-config.component.scss']
})
export class WarehouseConfigComponent implements OnInit {
  permissionForm: FormGroup;
  wareHouseFunctionalities: FormArray;
  permissions: FormArray;
  users: any = [];
  orgData: any = [];
  warehouses: any = [];
  userRelatedDetails: any = [];
  childWareHouseDropdown: any = null;
  childOrganizationDropdown: any = null;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  tableHeadings: any = ['', '', '', '', ''];
  finalArray = []
  getAllData: any = [];
  deleteInfo: any;
  disabledToggle: boolean = false;
  configPermissionsList: any = [];
  userIDNames: CompleterData;
  orgIDNames: CompleterData;
  wareHouseIDNames: CompleterData;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private fb: FormBuilder, private commonMasterDataService: CommonMasterDataService,
    private configService: ConfigurationService, private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
     }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.configPermissionsList = this.configService.getConfigurationPermissions('mainFunctionalities', 'Warehouse Config', this.getClientRole());
    if (this.getClientRole() && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View', 'Update', 'Delete'];
    }
    if (this.configPermissionsList.includes('View')) {
      this.create();
      this.getAllUsers();
      this.getAll();
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
  getClientRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_CLIENT', 'ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  tableDisplayForm(configDataList) {
    const arr = [];
    const framedArray = []
    configDataList.forEach(outerElement => {
      const org: string[] = outerElement.wareHouseFunctionalities.map(x => x.organizationInfo.organizationIDName);
      const uniqueOrganization = [...new Set(org)];
      uniqueOrganization.forEach(innerElement => {
        framedArray.push({ '_id': outerElement._id, 'user': outerElement.userInfo.userIDName, 'organization': innerElement, 'warehousesArray': outerElement.wareHouseFunctionalities.filter(x => x.organizationInfo.organizationIDName == innerElement) });
      });
    });
    framedArray.forEach(outerElement => {
      outerElement.warehousesArray.forEach((innerElement, j) => {
        const obj = {};
        obj['isShowUser'] = false;
        obj['isShowOrg'] = false;
        if (j == 0) {
          obj['isShowUser'] = true;
        }
        if (arr.length > 0 && arr.find(x => x._id == outerElement._id)) {
          obj['isShowUser'] = false;
        } if (j == 0) {
          obj['isShowOrg'] = true;
        }
        obj['_id'] = outerElement._id;
        obj['user'] = outerElement.user;
        obj['organisation'] = outerElement.organization;
        obj['warehouse'] = innerElement.wareHouseInfo.wareHouseIDName;
        obj['permissions'] = innerElement.permissions;
        obj['Update'] = innerElement.permissions.length > 0 ? (innerElement.permissions.find(x => x.permissionName == 'Update') ? true : false) : false;
        obj['View'] = innerElement.permissions.length > 0 ? (innerElement.permissions.find(x => x.permissionName == 'View') ? true : false) : false;
        obj['Delete'] = innerElement.permissions.length > 0 ? (innerElement.permissions.find(x => x.permissionName == 'Delete') ? true : false) : false;
        arr.push(obj)
      });
    });
    return arr
  }
  create() {
    this.permissionForm = this.fb.group({
      "_id": null,
      "userInfo": this.fb.group({
        "_id": null,
        "userID": null,
        "name": null,
        "userIDName": null,
        "email": null
      }),
      wareHouseFunctionalities: this.fb.array([]),
      "defaultWareHouseInfo": this.fb.group({
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      }),
      "defaultOrganizationInfo": this.fb.group({
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      })
    })
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.getAll();
    }
  }
  delete(data: any) {
    if (this.configPermissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'wareHouseConfig', id: data };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
  addFunctionalities(organizationInfo, warehouseInfo, Permission) {
    this.wareHouseFunctionalities = this.permissionForm.get('wareHouseFunctionalities') as FormArray;
    this.wareHouseFunctionalities.push(this.createFunctionality(organizationInfo, warehouseInfo, Permission));
  }
  createFunctionality(orgInfo, wareInfo, permissions) {
    return this.fb.group({
      _id: null,
      organizationInfo: this.fb.group({
        "_id": orgInfo._id,
        "organizationID": orgInfo.organizationID,
        "organizationName": orgInfo.organizationName,
        "organizationIDName": orgInfo.organizationIDName
      }),
      wareHouseInfo: this.fb.group({
        "wareHouseMasterID": wareInfo._id ? wareInfo._id : wareInfo.wareHouseMasterID,
        "wareHouseID": wareInfo.wareHouseID,
        "wareHouseName": wareInfo.wareHouseName,
        "wareHouseIDName": wareInfo.wareHouseIDName
      }),
      permissions: this.fb.array([])
    })

  }
  addChildPermissions(permissions, parentIndex) {
    this.permissions = this.permissionForm.controls.wareHouseFunctionalities['controls'][parentIndex].get('permissions') as FormArray;
    this.permissions.push(this.createChild(permissions))
  }
  createChild(permissions) {
    return this.fb.group({
      _id: permissions._id,
      permissionName: permissions.permissionName
    })
  }
  getPermissionsArray(permissions) {
    const arr = [];
    if (permissions.length > 0) {
      permissions.forEach(per => {
        arr.push({
          "_id": per._id,
          "permissionName": per.permissionName
        })
      })
    }
    return arr
  }
  getAllUsers() {
    this.commonMasterDataService.fetchAllUsers().subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.users) {
          this.users = response.data.users;
          this.userIDNames = this.users.map(x => x.userIDName);
        } else {
          this.users = [];
        }
      },
      (error) => {
        this.users = [];
      });
  }
  checkUser(event) {
    const formDetails = this.permissionForm.value;
    if (formDetails.userInfo.userIDName && this.childWareHouseDropdown && this.childOrganizationDropdown) {
      const have_id = this.getAllData.find(x => x.userInfo.userIDName == formDetails.userInfo.userIDName && x.wareHouseFunctionalities.find(y => y.wareHouseInfo.wareHouseIDName == this.childWareHouseDropdown && y.organizationInfo.organizationIDName == this.childOrganizationDropdown))
      const needPush_id = this.getAllData.find(x => x.userInfo.userIDName == formDetails.userInfo.userIDName)
      if (have_id) {
        this.edit(have_id.userInfo.userIDName);
      }
      else if (!have_id && needPush_id) {
        this.permissionForm.patchValue(needPush_id);
        const formArray = this.permissionForm.get('wareHouseFunctionalities') as FormArray;
        while (formArray.length !== 0) {
          formArray.removeAt(0);
        }
        needPush_id['wareHouseFunctionalities'].forEach((element, i) => {
          this.addFunctionalities(element.organizationInfo, element.wareHouseInfo, element.permissions);
          if (element.permissions.length > 0) {
            element.permissions.forEach(child => {
              this.addChildPermissions(child, i)
            });
          }
        });
        this.childWareHouse(event);
      }
      else {
        this.childWareHouse(event);
      }
    }
  }
  setUserInfo(event, fromHtml?) {
    if (event) {
      if (fromHtml) {
        this.permissionForm.reset();
        const formArray = this.permissionForm.get('wareHouseFunctionalities') as FormArray;
        while (formArray.length !== 0) {
          formArray.removeAt(0);
        }
        this.childWareHouseDropdown = null;
        this.childOrganizationDropdown = null;
      }
      const userDetails = this.users.find(x => x.userIDName == event)
      this.permissionForm.controls.userInfo.patchValue(userDetails);
      this.commonMasterDataService.findOrgandWarehouseByUserIdName(userDetails.userIDName).subscribe(res => {
        if (res['status'] == 0 && res['data']['organizationWareHouseHelpers']) {
          this.userRelatedDetails = res['data']['organizationWareHouseHelpers'];
          this.permissionForm.controls.defaultOrganizationInfo.patchValue(res['data']['organizationWareHouseHelpers'][0].organizationInfo);
          this.orgData = res['data']['organizationWareHouseHelpers'].map(x => x.organizationInfo);
          this.orgIDNames = this.orgData.map(x => x.organizationIDName);
          this.warehouses = this.userRelatedDetails.find(x => x.organizationInfo.organizationIDName == this.orgData[0].organizationIDName).wareHouses;
          this.wareHouseIDNames = this.warehouses.map(x => x.wareHouseIDName);
        }
      })
    }
  }
  setOrgInfo(event) {
    if (event) {
      this.warehouses = this.userRelatedDetails.find(x => x.organizationInfo.organizationIDName == event).wareHouses;
      this.wareHouseIDNames = this.warehouses.map(x => x.wareHouseIDName);
    }
    if (event && this.childOrganizationDropdown && this.permissionForm.controls.userInfo.value.userIDName) {
      this.checkUser(this.childOrganizationDropdown);
    }
  }
  setWareHouseInfo(event) {
    if (event) {
      this.permissionForm.controls.defaultWareHouseInfo.patchValue(this.warehouses.find(x => x.wareHouseIDName == event));
      this.permissionForm.controls.defaultWareHouseInfo['controls'].wareHouseMasterID.patchValue(this.warehouses.find(x => x.wareHouseIDName == event)._id);
    }
  }
  childWareHouse(event) {
    if (event) {
      const orgIndex = this.userRelatedDetails.findIndex(x => x.organizationInfo.organizationIDName == this.childOrganizationDropdown);
      const warehouseDetail = this.userRelatedDetails[orgIndex].wareHouses.find(x => x.wareHouseIDName == event);
      const permissions = [];
      this.addFunctionalities(this.userRelatedDetails[orgIndex].organizationInfo, warehouseDetail, permissions);
    }
  }
  save() {
    if (this.configPermissionsList.includes('Update')) {
      this.disabledToggle = false;
      this.permissionForm.controls.userInfo.enable();
      this.permissionForm.controls.defaultWareHouseInfo.enable();
      this.commonMasterDataService.saveOrUpdateWarehouseConfig(this.permissionForm.value).subscribe(data => {
        if (data['status'] == 0) {
          this.toastr.success('Saved Successfully');
          this.clear();
          this.getAll();
        }
      })
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
  clear() {
    this.disabledToggle = false;
    this.permissionForm.controls.userInfo.enable();
    this.permissionForm.controls.defaultWareHouseInfo.enable();
    this.permissionForm.reset();
    const formArray = this.permissionForm.get('wareHouseFunctionalities') as FormArray;
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
    this.childWareHouseDropdown = null;
    this.childOrganizationDropdown = null;
  }
  edit(details, fromHtml?) {
    if (this.configPermissionsList.includes('Update')) {
      this.commonMasterDataService.findWHConfigbyUId(details).subscribe(data => {
        if (data['status'] == 0 && data['data']['wareHouseConfiguration']) {
          this.setUserInfo(data['data']['wareHouseConfiguration'].userInfo.userIDName);
          this.permissionForm.patchValue(data['data']['wareHouseConfiguration']);
          const formArray = this.permissionForm.get('wareHouseFunctionalities') as FormArray;
          while (formArray.length !== 0) {
            formArray.removeAt(0);
          }
          data['data']['wareHouseConfiguration']['wareHouseFunctionalities'].forEach((element, i) => {
            this.addFunctionalities(element.organizationInfo, element.wareHouseInfo, element.permissions);
            if (element.permissions.length > 0) {
              element.permissions.forEach(child => {
                this.addChildPermissions(child, i)
              });
            }
          });
        }
      })
      if (fromHtml) {
        this.disabledToggle = true;
        this.permissionForm.controls.userInfo.disable();
        this.permissionForm.controls.defaultWareHouseInfo.disable();
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
  getAll() {
    const bodyParams = {
      "userID": null,
      "userIDName": null,
      "wareHouseID": null,
      "wareHouseName": null,
      "wareHouseIDName": null,
      "organizationID": null,
      "organizationName": null,
      "organizationIDName": null
    }
    this.commonMasterDataService.findAllWareHouseConfigurations(bodyParams).subscribe(data => {
      if (data['status'] == 0 && data['data']['wareHouseConfigurations'].length > 0) {
        this.getAllData = data['data']['wareHouseConfigurations'];
        this.finalArray = this.tableDisplayForm(data['data']['wareHouseConfigurations']);
      }
      else {
        this.finalArray = [];
      }
    })
  }
  setCheckboxValue(event, data, key) {
    const formIndex = this.permissionForm.controls.wareHouseFunctionalities.value.findIndex(x => x.wareHouseInfo.wareHouseIDName == data.warehouse);
    const formPermissions = this.permissionForm.controls.wareHouseFunctionalities['controls'][formIndex].controls.permissions.value;
    if (event.target.checked) {
      const abc = {
        _id: null,
        permissionName: key
      }
      formPermissions.push(abc);
    }
    else {
      formPermissions.splice(formPermissions.findIndex(x => x.permissionName == key), 1)
    }
  }
}
