import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { data } from 'jquery';
@Component({
  selector: 'app-inventory-config',
  templateUrl: './inventory-config.component.html'
})
export class InventoryConfigComponent implements OnInit {
  adjustmentsForm: FormGroup;
  purchaseOrderForm: FormGroup;
  internalTransfersForm: FormGroup;
  cycleCountingForm: FormGroup;
  wtCreateForm: FormGroup;
  wtApproveForm: FormGroup;
  purchaseReceiveLocationForm: FormGroup;
  // transfersForm: FormGroup;
  // physicalCountingForm: FormGroup;
  // cycleCountingForm: FormGroup;
  // purchaseReturnConfigForm: FormGroup;
  // wareHouseTransferForm: FormGroup;
  formObj = this.configService.getGlobalpayload();
  rolesList: any = [];
  usersList: any = [];
  allUsersList: any = [];
  completeResponse = [];
  dropdownList: any = [];
  adjustments: any = {};
  poData: any = {};
  iTData: any = []
  ccData: any = []
  wtDataCreate: any = []
  wtDataApprove: any = []
  prlData: any = []
  // transfers: any = {};
  // wareHouseTransfers: any = {};
  popupData: any = null;
  // physicalCounting: any = {}
  // purchaseReturn: any = {}
  // cycleCounting: any = {}
  selected: any = [];
  poSelected: any = [];
  iTSelected: any = []
  ccSelected: any = []
  wtCreateSelected: any = []
  wtApproveSelected: any = []
  prlSelected: any = []
  // transferSelected: any = [];
  // physicalSelected: any = [];
  // cycleCountingSelected: any = [];
  // purchaseReturnSelected: any = [];
  // whTransferSelected: any = [];
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
  statusConfigForAdjustments: any = [];
  statusConfigForPO: any = [];
  statusConfigForIT: any = []
  statusConfigForCC: any = []
  statusConfigForWTCreate: any = []
  statusConfigForWTApprove: any = []
  statusConfigForPRL: any = []
  adjustmentsStatusPolicis: any = FormGroup;
  poStatusPolicis: any = FormGroup;
  ioStatusPolicis: any = FormGroup;
  ccStatusPolicis: any = FormGroup;
  wtCreateStatusPolicis: any = FormGroup;
  wtApproveStatusPolicis: any = FormGroup;
  prlStatusPolicis: any = FormGroup;
  constructor(private configService: ConfigurationService, private metaDataService: MetaDataService,
    private common: CommonMasterDataService, private fb: FormBuilder,
    private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.configPermissionsList = this.configService.getConfigurationPermissions('mainFunctionalities', 'Process Config', this.getClientRole());
    if (this.getClientRole() && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View', 'Update', 'Delete'];
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    if (this.configPermissionsList.includes('View')) {
      this.createItem();
      this.getStatusConfig();
      this.fetchAllRoles();
      this.findAllUsersforIds();
      this.fetchConfigurations();
    }
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
    this.adjustmentsStatusPolicis = this.fb.group({
      "_id": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "status": null,
      "statusSequence": null,
      "comparisonType": null,
      "comparisonValue": null,
      "statusRoleConfigurations": [],
    })
    this.adjustmentsForm = this.fb.group({
      "_id": null,
      "name": 'Inventory Adjustments',
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      'processStatusPolicies': this.adjustmentsStatusPolicis,
    })
    this.poStatusPolicis = this.fb.group({
      "_id": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "status": null,
      "statusSequence": null,
      "comparisonType": null,
      "comparisonValue": null,
      "statusRoleConfigurations": [],
    })
    this.purchaseOrderForm = this.fb.group({
      "_id": null,
      "name": 'Purchase Order',
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      'processStatusPolicies': this.poStatusPolicis,
    })
    this.ioStatusPolicis = this.fb.group({
      "_id": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "status": null,
      "statusSequence": null,
      "comparisonType": null,
      "comparisonValue": null,
      "statusRoleConfigurations": [],
    })
    this.internalTransfersForm = this.fb.group({
      "_id": null,
      "name": 'Internal Transfers',
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      'processStatusPolicies': this.ioStatusPolicis,
    })
    this.ccStatusPolicis = this.fb.group({
      "_id": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "status": null,
      "statusSequence": null,
      "comparisonType": null,
      "comparisonValue": null,
      "statusRoleConfigurations": [],
    })
    this.cycleCountingForm = this.fb.group({
      "_id": null,
      "name": 'Cycle Counting',
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      'processStatusPolicies': this.ccStatusPolicis,
    })

    this.wtCreateStatusPolicis = this.fb.group({
      "_id": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "status": null,
      "statusSequence": null,
      "comparisonType": null,
      "comparisonValue": null,
      "statusRoleConfigurations": [],
    })
    this.wtCreateForm = this.fb.group({
      "_id": null,
      "name": 'Warehouse Transfer Create',
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      'processStatusPolicies': this.wtCreateStatusPolicis,
    })
    this.wtApproveStatusPolicis = this.fb.group({
      "_id": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "status": null,
      "statusSequence": null,
      "comparisonType": null,
      "comparisonValue": null,
      "statusRoleConfigurations": [],
    })
    this.wtApproveForm = this.fb.group({
      "_id": null,
      "name": 'Warehouse Transfer Approve',
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      'processStatusPolicies': this.wtApproveStatusPolicis,
    })
    this.prlStatusPolicis = this.fb.group({
      "_id": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "status": '',
      "statusSequence": null,
      "comparisonType": null,
      "comparisonValue": null,
      "statusRoleConfigurations": [],
    })
    this.purchaseReceiveLocationForm = this.fb.group({
      "_id": null,
      "name": 'Purchase Receive Location',
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      'processStatusPolicies': this.prlStatusPolicis,
    })
    // this.cycleCountingForm = this.fb.group({
    //   "_id": null,
    //   "name": 'Cycle Counting',
    //   "roleConfigurations": this.fb.array([]),
    //   users: [[]],
    //   "createdDate": null,
    //   "lastUpdatedDate": null,
    //   "role": this.fb.group({
    //     "_id": null,
    //     "roleName": null,
    //     "tenatID": null
    //   }),
    //   'organizationInfo': this.configService.getOrganization(),
    //   'wareHouseInfo': this.configService.getWarehouse()
    // })
    // this.transfersForm = this.fb.group({
    //   "_id": null,
    //   "name": 'Internal Transfers',
    //   "roleConfigurations": this.fb.array([]),
    //   users: [[]],
    //   "createdDate": null,
    //   "lastUpdatedDate": null,
    //   "role": this.fb.group({
    //     "_id": null,
    //     "roleName": null,
    //     "tenatID": null
    //   }),
    //   'organizationInfo': this.configService.getOrganization(),
    //   'wareHouseInfo': this.configService.getWarehouse()
    // })
    // this.physicalCountingForm = this.fb.group({
    //   "_id": null,
    //   "name": 'Physical Inventory',
    //   "roleConfigurations": this.fb.array([]),
    //   users: [[]],
    //   "createdDate": null,
    //   "lastUpdatedDate": null,
    //   "role": this.fb.group({
    //     "_id": null,
    //     "roleName": null,
    //     "tenatID": null
    //   }),
    //   'organizationInfo': this.configService.getOrganization(),
    //   'wareHouseInfo': this.configService.getWarehouse()
    // })
    // this.purchaseReturnConfigForm = this.fb.group({
    //   "_id": null,
    //   "name": 'PurchaseReturn Config',
    //   "roleConfigurations": this.fb.array([]),
    //   users: [[]],
    //   "createdDate": null,
    //   "lastUpdatedDate": null,
    //   "role": this.fb.group({
    //     "_id": null,
    //     "roleName": null,
    //     "tenatID": null
    //   }),
    //   'organizationInfo': this.configService.getOrganization(),
    //   'wareHouseInfo': this.configService.getWarehouse()
    // })
    // this.wareHouseTransferForm = this.fb.group({
    //   "_id": null,
    //   "name": 'Warehouse Transfer Config',
    //   "roleConfigurations": this.fb.array([]),
    //   users: [[]],
    //   "createdDate": null,
    //   "lastUpdatedDate": null,
    //   "role": this.fb.group({
    //     "_id": null,
    //     "roleName": null,
    //     "tenatID": null
    //   }),
    //   'organizationInfo': this.configService.getOrganization(),
    //   'wareHouseInfo': this.configService.getWarehouse()
    // })
  }
  findAllUsersforIds() {
    this.common.fetchAllUsers().subscribe(data => {
      if (data.status == 0 && data.data.users) {
        this.allUsersList = data.data.users;
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
  getUsers(role, form, nameValue) {
    switch (form) {
      case 'adjustmentsForm': {
        this.selected = [];
        this[form].controls.processStatusPolicies['controls'].statusRoleConfigurations.value = [];
        break;
      }
      case 'purchaseOrderForm': {
        this.poSelected = [];
        this[form].controls.processStatusPolicies['controls'].statusRoleConfigurations.value = [];
        break;
      }
      case 'internalTransfersForm': {
        this.iTSelected = [];
        this[form].controls.processStatusPolicies['controls'].statusRoleConfigurations.value = [];
        break;
      }
      case 'cycleCountingForm': {
        this.ccSelected = [];
        this[form].controls.processStatusPolicies['controls'].statusRoleConfigurations.value = [];
        break;
      }
      case 'wtCreateForm': {
        this.wtCreateSelected = [];
        this[form].controls.processStatusPolicies['controls'].statusRoleConfigurations.value = [];
        break;
      }
      case 'wtApproveForm': {
        this.wtApproveSelected = [];
        this[form].controls.processStatusPolicies['controls'].statusRoleConfigurations.value = [];
        break;
      }
      case 'purchaseReceiveLocationForm': {
        this.prlSelected = [];
        this[form].controls.processStatusPolicies['controls'].statusRoleConfigurations.value = [];
        break;
      }
      // case 'transfersForm': {
      //   this.transferSelected = [];
      //   this[form].controls.roleConfigurations.setValue([]);
      //   break;
      // }
      // case 'physicalCountingForm': {
      //   this.physicalSelected = [];
      //   this[form].controls.roleConfigurations.setValue([]);
      //   break;
      // }
      // case 'cycleCountingForm': {
      //   this.cycleCountingSelected = [];
      //   this[form].controls.roleConfigurations.setValue([]);
      //   break;
      // }
      // case 'purchaseReturnConfigForm': {
      //   this.purchaseReturnSelected = [];
      //   this[form].controls.roleConfigurations.setValue([]);
      //   break;
      // }
      // case 'wareHouseTransferForm': {
      //   this.whTransferSelected = [];
      //   this[form].controls.roleConfigurations.setValue([]);
      //   break;
      // }
    }
    this.common.fetchUsersbyRoleID(this.formObj, role).subscribe(response => {
      if (response && response['status'] === 0 && response['data'].users) {
        this.usersList = response.data.users;
        this.dropdownList = response.data.users.map(x => x.userIDName);
      }
    })
    this[form].controls.processStatusPolicies['controls'].statusRoleConfigurations.value.push({ 'role': this[form].controls.role.value });
    // if (form == 'adjustmentsForm' && this.adjustments && this.adjustments.controls.processStatusPolicies.roleConfigurations.length > 0) {
    //   const getSavedUserofRole = this.adjustments.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
    //   this.selected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    // }
    // if (form == 'transfersForm' && this.transfers && this.transfers.roleConfigurations.length > 0) {
    //   const getSavedUserofRole = this.transfers.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
    //   this.transferSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    // }
    // if (form == 'wareHouseTransferForm' && this.wareHouseTransfers && this.wareHouseTransfers.roleConfigurations.length > 0) {
    //   const getSavedUserofRole = this.wareHouseTransfers.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
    //   this.whTransferSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    // }
    // if (form == 'physicalCountingForm' && this.physicalCounting && this.physicalCounting.roleConfigurations.length > 0) {
    //   const getSavedUserofRole = this.physicalCounting.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
    //   this.physicalSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    //   // getSavedUserofRole ? this.physicalCountingForm.controls.roleConfigurations.patchValue(this.physicalCounting.roleConfigurations) : ''
    // }
    // if (form == 'cycleCountingForm' && this.cycleCounting && this.cycleCounting.roleConfigurations.length > 0) {
    //   const getSavedUserofRole = this.cycleCounting.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
    //   this.cycleCountingSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    //   // getSavedUserofRole ? this.cycleCountingForm.controls.roleConfigurations.patchValue(this.cycleCounting.roleConfigurations) : ''
    // }
    // if (form == 'purchaseReturnConfigForm' && this.purchaseReturn && this.purchaseReturn.roleConfigurations.length > 0) {
    //   const getSavedUserofRole = this.purchaseReturn.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
    //   this.purchaseReturnSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    //   // getSavedUserofRole ? this.purchaseReturnConfigForm.controls.roleConfigurations.patchValue(this.purchaseReturn.roleConfigurations) : ''
    // }
  }
  mapId(key, name) {
    if (key == 'user' && typeof (name) == 'string') {
      const vehicleDetals = this.allUsersList.find(x => x.userIDName == name);
      if (vehicleDetals) {
        return {
          "_id": vehicleDetals._id,
          "userID": vehicleDetals.userID,
          "name": vehicleDetals.name,
          "userIDName": vehicleDetals.userIDName,
          "email": vehicleDetals.email
        }
      }
    }
    else {
      return name;
    }
  }
  getStatusConfig() {
    this.configService.getAllStatusConfig(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res.data.processStatusConfigurations && res['data'].processStatusConfigurations.length) {
        const overAllStatusConfig = res['data'].processStatusConfigurations;
        const haveStatus = overAllStatusConfig.find(x => x.name == 'Inventory Adjustment');
        this.statusConfigForAdjustments = haveStatus ? haveStatus.processStatusStages : [];
        const haveStatus1 = overAllStatusConfig.find(x => x.name == 'Purchase Order');
        this.statusConfigForPO = haveStatus1 ? haveStatus1.processStatusStages : [];
        const haveStatus2 = overAllStatusConfig.find(x => x.name == 'Internal Transfers');
        this.statusConfigForIT = haveStatus2 ? haveStatus2.processStatusStages : [];
        const haveStatus3 = overAllStatusConfig.find(x => x.name == 'Cycle Counting');
        this.statusConfigForCC = haveStatus3 ? haveStatus3.processStatusStages : [];
        const haveStatus4 = overAllStatusConfig.find(x => x.name == 'Warehouse Transfer Create');
        this.statusConfigForWTCreate = haveStatus4 ? haveStatus4.processStatusStages : [];
        const haveStatus5 = overAllStatusConfig.find(x => x.name == 'Warehouse Transfer Approve');
        this.statusConfigForWTApprove = haveStatus5 ? haveStatus5.processStatusStages : [];
        const haveStatus6 = overAllStatusConfig.find(x => x.name == 'Status');
        this.statusConfigForPRL = haveStatus6 ? haveStatus6.processStatusStages : [];
      }
    })
  }
  setUserstoForm(items: any, formName) {
    if (items) {
      const form = this[formName].controls.processStatusPolicies.value;
      let formUserValue = [];
      formUserValue = (formName == 'adjustmentsForm') ? this.selected :
        (formName == 'purchaseOrderForm') ? this.poSelected :
          (formName == 'internalTransfersForm') ? this.iTSelected :
            (formName == 'cycleCountingForm') ? this.ccSelected :
              (formName == 'wtCreateForm') ? this.wtCreateSelected :
                (formName == 'wtApproveForm') ? this.wtApproveSelected : 
      (formName == 'purchaseReceiveLocationForm') ? this.prlSelected : '';
      const getRoleIndex = form.statusRoleConfigurations.findIndex(x => x.role.roleName == this[formName].value.role.roleName);
      if (getRoleIndex != -1) {
        form.statusRoleConfigurations[getRoleIndex]['userInfos'] = formUserValue;
      }
      else {
        form.statusRoleConfigurations = [{
          'role': { roleName: this[formName].value.role.roleName, _id: null, tenatID: null, organizationInfo: null, wareHouseInfo: null },
          'userInfos': formUserValue
        }]
      }
    }
  }
  finalFramingArray(form, globalArray) {
    delete form.role;
    let spliceIndex = []
    if (form.processStatusPolicies && form.processStatusPolicies.statusRoleConfigurations) {
      form.processStatusPolicies.statusRoleConfigurations.forEach((el, i) => {
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
          form.processStatusPolicies.statusRoleConfigurations.splice(indexValue, 1);
        });
      }
    }

    if (!form.processStatusPolicies.length || form.processStatusPolicies.length == 0) {
      if (form.processStatusPolicies.statusRoleConfigurations) {
        form.processStatusPolicies = [form.processStatusPolicies];
      }
      else {
        form.processStatusPolicies = null;
      }
    }
    // if (globalArray && globalArray.processStatusPolicies.length && form.processStatusPolicies.length) {
    //   globalArray.processStatusPolicies.forEach(element => {
    //     if (element.status != this.adjustmentsForm.controls.processStatusPolicies['controls'].status.value) {
    //       form.processStatusPolicies.push(element);
    //     }
    //   });
    // }
    //  if (globalArray && globalArray.processStatusPolicies.length) {
    //   const policy = globalArray.processStatusPolicies.find(x => x.status == this.adjustmentsForm.controls.processStatusPolicies['controls'].status.value)
    //   if (policy.statusRoleConfigurations && policy.statusRoleConfigurations.length > 0) {
    //     const dummyForms = JSON.parse(JSON.stringify(form.processStatusPolicies.statusRoleConfigurations));
    //     policy.statusRoleConfigurations.forEach((element, i) => {
    //       const findIndex = dummyForms.findIndex(x => x.role.roleName == element.role.roleName);
    //       if (findIndex != -1) {
    //         policy.statusRoleConfigurations.splice(i, 1);
    //       }
    //     });
    //     policy.statusRoleConfigurations.forEach(element => {
    //       form.processStatusPolicies.statusRoleConfigurations.push(element);
    //     });
    //   }
    // }

    if (globalArray && globalArray.processStatusPolicies.length) {
      globalArray.processStatusPolicies.forEach(adjust => {
        if (form.processStatusPolicies && adjust.status == form.processStatusPolicies[0].status) {
          adjust.statusRoleConfigurations.forEach(sameRole => {
            if (sameRole.role.roleName == form.processStatusPolicies[0].statusRoleConfigurations[0].role.roleName) {
            }
            else {
              form.processStatusPolicies[0].statusRoleConfigurations.push(sameRole);
            }
          });
        }
        else {
          if (!form.processStatusPolicies) {
            form.processStatusPolicies = [];
          }
          form.processStatusPolicies.push(adjust);
        }
      });
    }
    return form;
  }

  save() {
    if (this.configPermissionsList.includes('Update')) {
      const final = [];
      final.push(this.finalFramingArray(this.adjustmentsForm.value, this.adjustments));
      final.push(this.finalFramingArray(this.purchaseOrderForm.value, this.poData));
      final.push(this.finalFramingArray(this.internalTransfersForm.value, this.iTData));
      final.push(this.finalFramingArray(this.cycleCountingForm.value, this.ccData));
      final.push(this.finalFramingArray(this.wtCreateForm.value, this.wtDataCreate));
      final.push(this.finalFramingArray(this.wtApproveForm.value, this.wtDataApprove));
      final.push(this.finalFramingArray(this.purchaseReceiveLocationForm.value, this.prlData));
      // final.push(this.finalFramingArray(this.transfersForm.value, this.transfers));
      // final.push(this.finalFramingArray(this.physicalCountingForm.value, this.physicalCounting));
      // final.push(this.finalFramingArray(this.cycleCountingForm.value, this.cycleCounting));
      // final.push(this.finalFramingArray(this.purchaseReturnConfigForm.value, this.purchaseReturn));
      // final.push(this.finalFramingArray(this.wareHouseTransferForm.value, this.wareHouseTransfers));

      this.configService.saveOrUpdateInventoryConfiguration(final).subscribe(data => {
        if (data['status'] == 0 && data['data']['processConfigurations']) {
          this.toastr.success('Saved Successfully');
          this.clear();
        }
      })
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
  setStatusSequence(value, form, dataName) {
    if (value) {
      let stat = null;
      if (form == 'adjustmentsForm') {
        stat = this.statusConfigForAdjustments.find(x => x.status == value).statusSequence
      }
      else if (form == 'purchaseOrderForm') {
        stat = this.statusConfigForPO.find(x => x.status == value).statusSequence
      }
      else if (form == 'internalTransfersForm') {
        stat = this.statusConfigForIT.find(x => x.status == value).statusSequence
      }
      else if (form == 'cycleCountingForm') {
        stat = this.statusConfigForCC.find(x => x.status == value).statusSequence
      }
      else if (form == 'wtCreateForm') {
        stat = this.statusConfigForWTCreate.find(x => x.status == value).statusSequence
      }
      else if (form == 'wtApproveForm') {
        stat = this.statusConfigForWTApprove.find(x => x.status == value).statusSequence
      } else if (form == 'purchaseReceiveLocationForm') {
        stat = this.statusConfigForPRL.find(x => x.status == value).statusSequence
      }
      this[form].controls.processStatusPolicies['controls'].statusSequence.setValue(stat);
      if (this[dataName] && this[dataName].processStatusPolicies.length) {
        const policy = this[dataName].processStatusPolicies.find(x => x.status == this[form].controls.processStatusPolicies['controls'].status.value)
        if (policy) {
          this[form].controls.processStatusPolicies.patchValue(policy);
          if (form == 'adjustmentsForm' && policy.statusRoleConfigurations.length > 0) {
            const getSavedUserofRole = policy.statusRoleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
            this.selected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
          }
          if (form == 'purchaseOrderForm' && policy.statusRoleConfigurations.length > 0) {
            const getSavedUserofRole = policy.statusRoleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
            this.poSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
          }
          if (form == 'internalTransfersForm' && policy.statusRoleConfigurations.length > 0) {
            const getSavedUserofRole = policy.statusRoleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
            this.iTSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
          }
          if (form == 'cycleCountingForm' && policy.statusRoleConfigurations.length > 0) {
            const getSavedUserofRole = policy.statusRoleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
            this.ccSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
          }
          if (form == 'wtCreateForm' && policy.statusRoleConfigurations.length > 0) {
            const getSavedUserofRole = policy.statusRoleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
            this.wtCreateSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
          }
          if (form == 'wtApproveForm' && policy.statusRoleConfigurations.length > 0) {
            const getSavedUserofRole = policy.statusRoleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
            this.wtApproveSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
          } 
          if (form == 'purchaseReceiveLocationForm' && policy.statusRoleConfigurations.length > 0) {
            const getSavedUserofRole = policy.statusRoleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
            this.prlSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
          }
        }
      }
    }
  }
  fetchConfigurations() {
    this.configService.getAllInventoryConfiguration(this.formObj).subscribe(data => {
      if (data['status'] == 0 && data['data']['processConfigurations']) {
        this.completeResponse = data['data']['processConfigurations'];
        this.adjustments = this.completeResponse.find(x => x.name == 'Inventory Adjustments');
        if (this.adjustments && !this.adjustments.processStatusPolicies) {
          this.adjustments.processStatusPolicies = {};
        }
        this.adjustments ? this.adjustmentsForm.patchValue(this.adjustments) : '';
        this.poData = this.completeResponse.find(x => x.name == 'Purchase Order');
        if (this.poData && !this.poData.processStatusPolicies) {
          this.poData.processStatusPolicies = {};
        }
        this.poData ? this.purchaseOrderForm.patchValue(this.poData) : '';
        this.iTData = this.completeResponse.find(x => x.name == 'Internal Transfers');
        if (this.iTData && !this.iTData.processStatusPolicies) {
          this.iTData.processStatusPolicies = {};
        }
        this.iTData ? this.internalTransfersForm.patchValue(this.iTData) : '';
        this.ccData = this.completeResponse.find(x => x.name == 'Cycle Counting');
        if (this.ccData && !this.ccData.processStatusPolicies) {
          this.ccData.processStatusPolicies = {};
        }
        this.ccData ? this.cycleCountingForm.patchValue(this.ccData) : '';

        this.wtDataCreate = this.completeResponse.find(x => x.name == 'Warehouse Transfer Create');
        if (this.wtDataCreate && !this.wtDataCreate.processStatusPolicies) {
          this.wtDataCreate.processStatusPolicies = {};
        }
        this.wtDataCreate ? this.wtCreateForm.patchValue(this.wtDataCreate) : '';

        this.wtDataApprove = this.completeResponse.find(x => x.name == 'Warehouse Transfer Approve');
        if (this.wtDataApprove && !this.wtDataApprove.processStatusPolicies) {
          this.wtDataApprove.processStatusPolicies = {};
        }
        this.wtDataApprove ? this.wtApproveForm.patchValue(this.wtDataApprove) : '';
        this.prlData = this.completeResponse.find(x => x.name == 'Purchase Receive Location');
        if (this.prlData && !this.prlData.processStatusPolicies) {
          this.prlData.processStatusPolicies = {};
        }
        this.prlData ? this.purchaseReceiveLocationForm.patchValue(this.prlData) : '';
        // this.cycleCounting = this.completeResponse.find(x => x.name == 'Cycle Counting');
        // this.cycleCounting ? this.cycleCountingForm.patchValue(this.cycleCounting) : '';
        // this.transfers = this.completeResponse.find(x => x.name == 'Internal Transfers');
        // this.transfers ? this.transfersForm.patchValue(this.transfers) : '';
        // this.physicalCounting = this.completeResponse.find(x => x.name == 'Physical Inventory');
        // this.physicalCounting ? this.physicalCountingForm.patchValue(this.physicalCounting) : '';
        // this.purchaseReturn = this.completeResponse.find(x => x.name == 'PurchaseReturn Config');
        // this.purchaseReturn ? this.purchaseReturnConfigForm.patchValue(this.purchaseReturn) : '';
        // this.wareHouseTransfers = this.completeResponse.find(x => x.name == 'Warehouse Transfer Config');
        // this.wareHouseTransfers ? this.wareHouseTransferForm.patchValue(this.wareHouseTransfers) : '';
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
    this.completeResponse = [];
    this.adjustments = null;
    this.poData = null;
    this.iTData = null;
    this.ccData = null;
    this.wtDataCreate = null;
    this.wtDataApprove = null;
    this.selected = [];
    this.poSelected = [];
    this.iTSelected = [];
    this.ccSelected = [];
    this.wtCreateSelected = [];
    this.wtApproveSelected = [];
    this.prlSelected = []
    this.adjustmentsForm.reset();
    this.purchaseOrderForm.reset();
    this.internalTransfersForm.reset();
    this.cycleCountingForm.reset();
    this.wtCreateForm.reset();
    this.wtApproveForm.reset();
    this.purchaseReceiveLocationForm.reset();
    this.fetchConfigurations();
  }
}
