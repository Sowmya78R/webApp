import { Component, OnInit } from '@angular/core';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notification-config',
  templateUrl: './notification-config.component.html',
  styleUrls: ['./notification-config.component.scss']
})
export class NotificationConfigComponent implements OnInit {
  purchaseOrderForm: FormGroup;
  putAwayForm: FormGroup;
  salesOrderForm: FormGroup;
  pickingForm: FormGroup;
  expiredForm: FormGroup;
  goingToExpiredForm: FormGroup;
  zoneCapacityForm: FormGroup;
  formObj = this.configService.getGlobalpayload();
  rolesList: any = [];
  usersList: any = [];
  allUsersList: any = [];
  completeResponse = [];
  dropdownList: any = [];
  PurchaseOrderPendingList: any = {};
  putAwayList: any = {};
  salesOrderList: any = {};
  pickingList: any = {};
  expiryList: any = {};
  goingToExpiryList: any = {};
  zoneCapacityList: any = {};
  transfers: any = {};
  popupData: any = null;
  physicalCounting: any = {}
  cycleCounting: any = {}
  transferSelected: any = [];
  physicalSelected: any = [];
  notificationDataList: any;
  cycleCountingSelected: any = [];
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  configPermissionsList: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private configService: ConfigurationService, private metaDataService: MetaDataService,
    private common: CommonMasterDataService, private fb: FormBuilder,

    private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
     }

  ngOnInit() {
    //this.configPermissionsList = this.configService.getConfigurationPermissions('mainFunctionalities', 'Process Config', this.getClientRole());
    this.getNotifications();
    this.createItem();
    this.fetchAllRoles();
    this.findAllUsersforIds();
    this.fetchNotificationConfigurations();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    // this.getNotifications();
  }
  getClientRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_CLIENT', 'ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  createItem() {
    this.purchaseOrderForm = this.fb.group({
      "_id": null,
      "notificationName": 'Purchase Order',
      "notificationCheck": "Yes",
      "notificationsUserConfigurations": this.fb.array([]),
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null,
        'organizationInfo': this.configService.getOrganization(),
        'wareHouseInfo': this.configService.getWarehouse()
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.putAwayForm = this.fb.group({
      "_id": null,
      "notificationCheck": "Yes",
      "notificationName": 'putAway',
      "notificationsUserConfigurations": this.fb.array([]),
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null,
        'organizationInfo': this.configService.getOrganization(),
        'wareHouseInfo': this.configService.getWarehouse()
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.salesOrderForm = this.fb.group({
      "_id": null,
      "notificationCheck": "Yes",
      "notificationName": 'Sales Order',
      "notificationsUserConfigurations": this.fb.array([]),
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null,
        'organizationInfo': this.configService.getOrganization(),
        'wareHouseInfo': this.configService.getWarehouse()
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.pickingForm = this.fb.group({
      "_id": null,
      "notificationCheck": "Yes",
      "notificationName": 'Picking',
      "notificationsUserConfigurations": this.fb.array([]),
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null,
        'organizationInfo': this.configService.getOrganization(),
        'wareHouseInfo': this.configService.getWarehouse()
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.expiredForm = this.fb.group({
      "_id": null,
      "notificationCheck": "Yes",
      "notificationName": 'Expired',
      "notificationsUserConfigurations": this.fb.array([]),
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null,
        'organizationInfo': this.configService.getOrganization(),
        'wareHouseInfo': this.configService.getWarehouse()
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.goingToExpiredForm = this.fb.group({
      "_id": null,
      "notificationCheck": "Yes",
      "notificationName": 'Going To Expire',
      "notificationsUserConfigurations": this.fb.array([]),
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null,
        'organizationInfo': this.configService.getOrganization(),
        'wareHouseInfo': this.configService.getWarehouse()
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.zoneCapacityForm = this.fb.group({
      "_id": null,
      "notificationCheck": "Yes",
      "notificationName": 'zone capacity',
      "notificationsUserConfigurations": this.fb.array([]),
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null,
        'organizationInfo': this.configService.getOrganization(),
        'wareHouseInfo': this.configService.getWarehouse()
      }),

      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
  }
  findAllUsersforIds() {
    this.common.fetchAllUsers().subscribe(data => {
      if (data.status == 0 && data.data.users) {
        this.allUsersList = data.data.users;
      }
    })
  }
  getNotifications() {
    this.metaDataService.fetchAllNotifications(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.notificationsResponseList.length > 0) {
        this.notificationDataList = res.data.notificationsResponseList;
        //console.log(this.notificationDataList)
      }
    })
  }

  fetchAllRoles() {
    this.metaDataService.fetchAllRoles(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.roles && response.data.roles.length) {
          this.rolesList = response.data.roles;
        }
        else {
          this.rolesList = [];
        }
      },
      error => {
        this.rolesList = [];
      });
  }
  purchaseorderPendingSelected: any = [];
  putAwaySelected: any = [];
  SalesOrderPendingSelected: any = [];
  expiredFormSelected: any = [];
  PickingPendingSelected: any = [];
  goingToExpireSelected: any = [];
  zoneCapacitySelected: any = [];

  getUsers(role, form) {
    switch (form) {
      case 'purchaseOrderForm': {
        this.purchaseorderPendingSelected = [];
        break;
      }
      case 'putAwayForm': {
        this.putAwaySelected = [];
        break;
      }
      case 'salesOrderForm': {
        this.SalesOrderPendingSelected = [];
        break;
      }
      case 'pickingForm': {
        this.PickingPendingSelected = [];
        break;
      }
      case 'expiredForm': {
        this.expiredFormSelected = [];
        break;
      }
      case 'goingToExpiredForm': {
        this.goingToExpireSelected = [];
        break;
      }
      case 'zoneCapacityForm': {
        this.zoneCapacitySelected = [];
        break;
      }
    }
    this[form].controls.notificationsUserConfigurations.setValue([]);
    this.common.fetchNotificationConfigUserListByRoleName(this.formObj, role).subscribe(response => {
      if (response && response['status'] === 0 && response['data'].users) {
        this.usersList = response.data.users;
        this.dropdownList = this.usersList.map(x => x.userIDName);
      }
    })
    this[form].controls.notificationsUserConfigurations.value.push({ 'role': this[form].controls.role.value });

    if (form == 'purchaseOrderForm' && this.notificationResponceList.length > 0) {
      const getSavedUserofRole = this.PurchaseOrderPendingList.notificationsUserConfigurations.find(x => x.role.roleName === this[form].controls.role.value.roleName)
      this.purchaseorderPendingSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'putAwayForm' && this.notificationResponceList.length > 0) {
      const getSavedUserofRole = this.putAwayList.notificationsUserConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.putAwaySelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'salesOrderForm' && this.notificationResponceList.length > 0) {
      const getSavedUserofRole = this.salesOrderList.notificationsUserConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.SalesOrderPendingSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'pickingForm' && this.notificationResponceList.length > 0) {
      const getSavedUserofRole = this.pickingList.notificationsUserConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.PickingPendingSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'expiredForm' && this.notificationResponceList.length > 0) {
      const getSavedUserofRole = this.expiryList.notificationsUserConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.expiredFormSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'goingToExpiredForm' && this.notificationResponceList.length > 0) {
      const getSavedUserofRole = this.goingToExpiryList.notificationsUserConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.goingToExpireSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'zoneCapacityForm' && this.notificationResponceList.length > 0) {
      const getSavedUserofRole = this.zoneCapacityList.notificationsUserConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.zoneCapacitySelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
  }
  mapId(key, name) {
    if (key == 'user') {
      const userDetails = this.allUsersList.find(x => x.userIDName == name);
      if (userDetails) {
        return {
          "_id": userDetails._id,
          "userID": userDetails.userID,
          "name": userDetails.name,
          "userIDName": userDetails.userIDName,
          "email": userDetails.email
        }
      }
    }
  }
  setUserstoForm(items: any, formName) {
    if (items) {
      //console.log(this.purchaseorderPendingSelected)
      const form = this[formName].value;
      let formUserValue = [];
      formUserValue = (formName == 'purchaseOrderForm') ? this.purchaseorderPendingSelected :
        (formName == 'putAwayForm') ? this.putAwaySelected :
          (formName == 'salesOrderForm') ? this.SalesOrderPendingSelected :
            (formName == 'pickingForm') ? this.PickingPendingSelected :
              (formName == 'expiredForm') ? this.expiredFormSelected :
                (formName == 'goingToExpiredForm') ? this.goingToExpireSelected :
                  (formName == 'zoneCapacityForm') ? this.zoneCapacitySelected : '';
      const getRoleIndex = form.notificationsUserConfigurations.findIndex(x => x.role.roleName == form.role.roleName);
      if (getRoleIndex != -1) {
        form.notificationsUserConfigurations[getRoleIndex]['userInfos'] = formUserValue;
      }
    }
  }

  finalFramingArray(form, globalArray) {
    //console.log(form);
    delete form.role;
    delete form.createdDate;
    delete form.lastUpdatedDate
    //console.log(form)
    let spliceIndex = [];
    form.notificationsUserConfigurations.forEach((el,i) => {
      if (el.userInfos) {
        el['dummy'] = el.userInfos;
        el.userInfos = [];
        if (el.dummy && el.dummy.length > 0) {
          el.dummy.forEach(element => {
            const abc = this.mapId('user', element);
            abc ? el['userInfos'].push(abc) : '';
          });
        }
        delete el.dummy;
      }
      else {
        spliceIndex.push(i);
      }
    })
    if (spliceIndex.length > 0) {
      spliceIndex.forEach(indexValue => {
        form.notificationsUserConfigurations.splice(indexValue, 1);
      });
    }
    if (globalArray && globalArray.notificationsUserConfigurations && globalArray.notificationsUserConfigurations.length > 0) {
      const dummyForms = form.notificationsUserConfigurations;
      globalArray.notificationsUserConfigurations.forEach((element, i) => {
        const findIndex = dummyForms.findIndex(x => x.role.roleName == element.role.roleName);
        if (findIndex != -1) {
          globalArray.notificationsUserConfigurations.splice(i, 1);
        }
      });
      globalArray.notificationsUserConfigurations.forEach(element => {
        form.notificationsUserConfigurations.push(element);
      });
    }
    //console.log(form)
    return form;
  }
  save() {
    const final = [];
    final.push(this.finalFramingArray(this.purchaseOrderForm.value, this.PurchaseOrderPendingList));
    final.push(this.finalFramingArray(this.putAwayForm.value, this.putAwayList));
    final.push(this.finalFramingArray(this.salesOrderForm.value, this.salesOrderList));
    final.push(this.finalFramingArray(this.pickingForm.value, this.pickingList));
    final.push(this.finalFramingArray(this.expiredForm.value, this.expiryList));
    final.push(this.finalFramingArray(this.goingToExpiredForm.value, this.goingToExpiryList));
    final.push(this.finalFramingArray(this.zoneCapacityForm.value, this.zoneCapacityList));
    console.log(final)
    this.configService.saveOrUpdateNotificationConfiguration(final).subscribe(data => {
      if (data['status'] == 0 && data.data.notificationsConfigurations) {
        this.toastr.success(data.statusMsg);
        this.clear();
      }
    })
  }
  notificationResponceList: any = [];
  fetchNotificationConfigurations() {
    this.configService.fetchNotificationConfiguration(this.formObj).subscribe(data => {
      if (data['status'] == 0 && data.data.notificationsConfigurations) {
        this.notificationResponceList = data.data.notificationsConfigurations
        this.PurchaseOrderPendingList = this.notificationResponceList.find(x => x.notificationName == "Purchase Order");
        this.PurchaseOrderPendingList ? this.purchaseOrderForm.patchValue(this.PurchaseOrderPendingList) : '';

        this.putAwayList = this.notificationResponceList.find(x => x.notificationName == "putAway");
        this.putAwayList ? this.putAwayForm.patchValue(this.putAwayList) : '';

        this.salesOrderList = this.notificationResponceList.find(x => x.notificationName == "Sales Order");
        this.salesOrderList ? this.salesOrderForm.patchValue(this.salesOrderList) : '';

        this.pickingList = this.notificationResponceList.find(x => x.notificationName == "Picking");
        this.pickingList ? this.pickingForm.patchValue(this.pickingList) : '';

        this.expiryList = this.notificationResponceList.find(x => x.notificationName == "Expired");
        this.expiryList ? this.expiredForm.patchValue(this.expiryList) : '';

        this.goingToExpiryList = this.notificationResponceList.find(x => x.notificationName == "Going To Expire");
        this.goingToExpiryList ? this.goingToExpiredForm.patchValue(this.goingToExpiryList) : '';

        this.zoneCapacityList = this.notificationResponceList.find(x => x.notificationName == "zone capacity");
        this.zoneCapacityList ? this.zoneCapacityForm.patchValue(this.zoneCapacityList) : '';
      }
      else {
      }
    })
  }
  getTable(key) {
    this.popupData = null;
    this.popupData = this[key];
    this.ngxSmartModalService.getModal('spaceUtilization').open();
  }
  clear() {
    this.purchaseorderPendingSelected = [];
    this.putAwaySelected = [];
    this.SalesOrderPendingSelected = [];
    this.expiredFormSelected = [];
    this.PickingPendingSelected = [];
    this.goingToExpireSelected = [];
    this.zoneCapacitySelected = [];
    this.notificationResponceList = [];
    this.PurchaseOrderPendingList = null
    this.putAwayList = null
    this.salesOrderList = null
    this.pickingList = null
    this.expiryList = null
    this.goingToExpiryList = null
    this.zoneCapacityList = null
    this.createItem();
    this.fetchNotificationConfigurations();
  }

  /*   rolesData: any;
    usersData: any = []
    finalArr: any = [] */
  /*   getData() {
      //console.log(this.usersList)
      this.usersList.forEach(k => {
        let datas: any = this.usersList.find(m => m.userIDName === k)
        let obj = {}
        obj['_id'] = datas._id
        obj['tenatID'] = datas.tenatID
        obj['roleName'] = datas.rolesList[0].roleName
        obj['organizationInfo'] = this.configService.getOrganization(),
          obj['wareHouseInfo'] = this.configService.getWarehouse()
        this.rolesData = obj
        let object = {}
        object['_id'] = datas._id
        object['userID'] = datas.userID
        object['name'] = datas.name
        object['email'] = datas.email
        this.usersData.push(object)
        this.frameData()
      })
    }
    frameData() {
      let obj = {}
      obj['role'] = this.rolesData
      obj['userInfos'] = this.usersData
      this.finalArr.push(obj)
      this.purchaseOrderForm.controls.notificationsUserConfigurations.patchValue(this.finalArr)
      //console.log(this.purchaseOrderForm.value)
    } */
}
