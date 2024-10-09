import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ConfigurationService } from '../../../services/integration-services/configuration.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ToastrService } from 'ngx-toastr';
import { Storage } from '../../../shared/utils/storage';
import { CompleterData } from 'ng2-completer';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-process-groups',
  templateUrl: './process-groups.component.html'
})
export class ProcessGroupsComponent implements OnInit {
  users: any = [];
  permissionsForm: FormGroup;
  functionalities: any = [];
  roleSpecificFunctionalities: any = [];
  completeResponse: any = {};
  childWareHouseDropdown: any = null;
  childOrganizationDropdown: any = null;
  userRelatedDetails: any = [];
  orgData: any = [];

  warehouses: any = [];
  permissionsList: any = [];
  selectAllCheckboxValue: boolean = false;
  configPermissionsList: any = [];
  userIDNames: CompleterData;

  orgIDNames: CompleterData;
  wareHouseIDNames: CompleterData;
  yesAdmin: Boolean = false;
  selectedUser: any = null;
  clientTemplate: any = null;
  dummyClientTemplate: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  constructor(
    private toastr: ToastrService,
    private configService: ConfigurationService,
    private configurationService: ConfigurationService,
    private commonMasterDataService: CommonMasterDataService,
    private translate: TranslateService,
  ) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.configPermissionsList = this.configurationService.getConfigurationPermissions('mainFunctionalities', 'Process Groups', this.getRole());
    if (this.getRole() && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View', 'Update', 'Delete'];
    }
    if (this.configPermissionsList.includes('View')) {
      this.getAllUsers();
      if (this.yesAdmin) {
        this.fetchAllFunctionalities();
      }
      this.createProcessGroupsForm();
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      this.yesAdmin = ['ROLE_SUPER_ADMIN'].includes(role) ? true : false;
      return ['ROLE_CLIENT', 'ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  selectAllData(event, key) {
    if (event.target.checked) {
      this.functionalities.forEach((process, i) => {
        process.isEnabled = true;
        process.View = true;
      });
    }
    else {
      this.functionalities.forEach((functionality, i) => {
        functionality.isEnabled = false;
        functionality.View = false;
      })
    }
  }
  isAllSelected(key) {
    this.selectAllCheckboxValue = this.functionalities.every(function (item: any) {
      return item.isEnabled == true;
    })
  }
  getAllUsers() {
    this.commonMasterDataService.fetchAllUsers().subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.users) {
          this.users = response.data.users;
          this.userIDNames = this.users.map(x => x.userIDName);
          if (!this.yesAdmin) {
            const businessUnit = sessionStorage.getItem('businessUnit');
            this.selectedUser = this.users.find(x => x.businessUnit == businessUnit && x.rolesList[0].roleName == 'ROLE_CLIENT').email;
            this.fetchTemplate();
          }
        } else {
          this.users = [];
        }
      },
      (error) => {
        this.users = [];
      });
  }
  createProcessGroupsForm() {
    this.permissionsForm = new FormBuilder().group({
      role: [null],
      userInfo: new FormBuilder().group({
        "_id": null,
        "userID": null,
        "name": null,
        "userIDName": null,
        "email": null
      }),
    });
  }
  update() {
    if (this.configPermissionsList.includes('Update')) {
      if ((this.yesAdmin && this.permissionsForm.controls.userInfo.value.userIDName) || this.permissionsForm.controls.userInfo.value.userIDName && this.childOrganizationDropdown && this.childWareHouseDropdown) {
        const reqJSON = JSON.parse(JSON.stringify(this.functionalities));
        const endData = [];
        reqJSON.forEach((functionality, i) => {
          if (functionality.isEnabled === true) {
            let funcPermissions = [];
            // if (functionality.Update) {
            //   funcPermissions.push({ permissionName: 'Update' })
            // }
            if (functionality.View) {
              funcPermissions.push({ permissionName: 'View' })
            }
            // if (functionality.Delete) {
            //   funcPermissions.push({ permissionName: 'Delete' })
            // }
            endData.push({ name: functionality.name, rename: functionality.rename, subFunctionalities: functionality.subFunctionalities, permissions: funcPermissions });
          }
        });
        console.log(endData);
        if (this.yesAdmin) {
          if (this.clientTemplate && this.clientTemplate._id) {
            this.clientTemplate.mainFunctionalities = endData;
          }
          else {
            this.clientTemplate = {
              "userInfo": this.permissionsForm.controls.userInfo.value,
              "_id": null,
              "name": "WMS Functionality Names",
              "mainFunctionalities": endData
            }
          }
          this.configurationService.saveTemplateForClient(this.clientTemplate).subscribe(
            (response) => {
              if (response) {
                this.toastr.success('Updated successfully');
                this.permissionsForm.reset();
                this.fetchAllFunctionalities();
                this.childWareHouseDropdown = null;
                this.childOrganizationDropdown = null;
                this.selectAllCheckboxValue = false;
              } else {
                this.toastr.error('Failed in updating');
              }
            })
        }
        else {
          const index = this.completeResponse.userPermissionWareHouseFunctionality.findIndex(x => x.organizationInfo.organizationIDName == this.childOrganizationDropdown && x.wareHouseInfo.wareHouseIDName == this.childWareHouseDropdown);
          this.completeResponse.userPermissionWareHouseFunctionality[index].mainFunctionalities = endData;
          this.configurationService.saveOrUpdateProcessFunctionalities(this.completeResponse).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data.userPermissionFunctionality) {
                this.toastr.success('Updated successfully');
                this.permissionsForm.reset();
                this.permissionsList = [];
                this.fetchTemplate();
                this.childWareHouseDropdown = null;
                this.childOrganizationDropdown = null;
                this.selectAllCheckboxValue = false;
              } else {
                this.toastr.error('Failed in updating');
              }
            },
            (error) => {

            });
        }
      } else {
        this.toastr.error('Select Manditory Fields.');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
  onSelectUser(event) {
    this.resetIsEnabledFlag();
    this.childOrganizationDropdown = null;
    this.childWareHouseDropdown = null;
    this.selectAllCheckboxValue = false;
    this.orgData = [];
    this.warehouses = [];
    this.orgIDNames = this.orgData;
    this.wareHouseIDNames = this.warehouses;
    this.permissionsList = this.yesAdmin ? ['View', 'Update', 'Delete'] : [];
    if (event) {
      if (this.yesAdmin) {
        const userDet = this.users.find(x => x.userIDName == event.originalObject);
        this.selectedUser = userDet.email;
        this.permissionsForm.controls.userInfo.patchValue(userDet);
        this.fetchTemplate();
      }
      else {
        this.commonMasterDataService.findOrgandWarehouseByUserIdName(event.originalObject).subscribe(res => {
          if (res['status'] == 0 && res['data']['organizationWareHouseHelpers']) {
            this.userRelatedDetails = res['data']['organizationWareHouseHelpers'];
            this.permissionsForm.controls.userInfo.patchValue(this.users.find(x => x.userIDName == event.originalObject))
            this.orgData = res['data']['organizationWareHouseHelpers'].map(x => x.organizationInfo);
            this.orgIDNames = this.orgData.map(x => x.organizationIDName);
            this.warehouses = this.userRelatedDetails.find(x => x.organizationInfo.organizationIDName == this.orgData[0].organizationIDName).wareHouses;
          }
        })
      }
    }
  }
  onSelectOrg(event) {
    this.warehouses = [];
    this.wareHouseIDNames = this.warehouses;
    if (event) {
      this.warehouses = this.userRelatedDetails.find(x => x.organizationInfo.organizationIDName == event.originalObject).wareHouses;
      this.wareHouseIDNames = this.warehouses.map(x => x.wareHouseIDName);
      this.childWareHouseDropdown ? this.onSelectWareHouse(this.childWareHouseDropdown) : '';
    }
    else {
      this.resetIsEnabledFlag();
      this.selectAllCheckboxValue = false;
      this.permissionsList = this.yesAdmin ? ['View', 'Update', 'Delete'] : [];
    }
  }
  onSelectWareHouse(event) {
    if (event) {
      this.getPermissions(this.permissionsForm.value.userInfo.userIDName, this.childOrganizationDropdown, event.originalObject);
    }
    else {
      this.resetIsEnabledFlag();
      this.permissionsList = this.yesAdmin ? ['View', 'Update', 'Delete'] : [];
      this.selectAllCheckboxValue = false;
    }
  }
  getPermissions(user, org, warehouse) {
    const formData = {
      "userID": user,
      "organizationID": org,
      "wareHouseID": warehouse
    }
    this.configurationService.findAllPermissionsByDetails(formData).subscribe(res => {
      if (res['status'] == 0 && res['data']['wareHouseConfigurationPermissions']) {
        this.permissionsList = res['data']['wareHouseConfigurationPermissions'].map(x => x.permissionName);
        this.permissionsList = (this.yesAdmin && (this.permissionsList.length == 0)) ? ['View', 'Update', 'Delete'] : this.permissionsList;
        this.fetchFunctionalitiesByUserIDName(formData.userID);
        if (this.permissionsList.length == 0) {
          this.toastr.error("Add Warehouse Configurations");
        }
      }
    })
  }
  fetchTemplate() {
    this.configurationService.fetchDBWisePermissionsTemplate({ "email": this.selectedUser }).subscribe(res => {
      if (res.status == 0 && res['data'].functionality) {
        this.dummyClientTemplate = JSON.parse(JSON.stringify(res['data'].functionality));
        this.clientTemplate = res['data'].functionality;
        if (this.yesAdmin) {
          this.functionalities.forEach((functionality, i) => {
            if (this.clientTemplate.mainFunctionalities.length > 0) {
              this.clientTemplate.mainFunctionalities.forEach((rFunctionality, k) => {
                if (functionality.name === rFunctionality.name) {
                  this.functionalities[i].subFunctionalities = rFunctionality.subFunctionalities;
                  this.functionalities[i].isEnabled = true;
                  this.functionalities[i]['Update'] = false;
                  this.functionalities[i]['View'] = (rFunctionality.permissions && rFunctionality.permissions.length > 0 && this.permissionsList.includes('View')) ? (rFunctionality.permissions.find(x => x.permissionName == 'View') ? true : false) : false;
                  this.functionalities[i]['Delete'] = false;
                }
              });
              this.isAllSelected('isEnabled');
            }
          });
        }
        else {
          this.functionalities = this.clientTemplate.mainFunctionalities;
          this.resetIsEnabledFlag();
        }
      }
      else {
        this.clientTemplate = null;
        this.functionalities = this.yesAdmin ? this.functionalities : [];
      }
    })
  }
  fetchAllFunctionalities() { //only for template
    this.configurationService.findAllFunctionalitiesByRoleID('ROLE_TEMPLATE').subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.functionality && response.data.functionality.mainFunctionalities) {
          this.functionalities = response.data.functionality.mainFunctionalities;
          this.resetIsEnabledFlag();
        }
      },
      (error) => {
      });
  }

  fetchFunctionalitiesByUserIDName(user) {
    this.configurationService.getFunctionalitiesbyUserIDName(user).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.userPermissionFunctionality && response.data.userPermissionFunctionality.userPermissionWareHouseFunctionality.length > 0) {
          this.resetIsEnabledFlag();
          const individualFunctionality = response.data.userPermissionFunctionality.userPermissionWareHouseFunctionality.find(x => x.organizationInfo.organizationIDName == this.childOrganizationDropdown && x.wareHouseInfo.wareHouseIDName == this.childWareHouseDropdown);
          this.completeResponse = response.data.userPermissionFunctionality;
          if (!individualFunctionality) {
            let wareHouseDetails = null;
            let orgDetails = null;
            if (this.childWareHouseDropdown) {
              wareHouseDetails = this.warehouses.find(x => x.wareHouseIDName == this.childWareHouseDropdown)
            }
            if (this.childOrganizationDropdown) {
              orgDetails = this.orgData.find(x => x.organizationIDName == this.childOrganizationDropdown)
            }
            this.completeResponse.userPermissionWareHouseFunctionality.push({
              name: 'WMS Functionality Names',
              mainFunctionalities: [],
              organizationInfo: orgDetails,
              wareHouseInfo: {
                "wareHouseID": wareHouseDetails.wareHouseID,
                "wareHouseName": wareHouseDetails.wareHouseName,
                "wareHouseIDName": wareHouseDetails.wareHouseIDName,
                "wareHouseMasterID": wareHouseDetails._id
              }
            });
          }
          this.roleSpecificFunctionalities = individualFunctionality ? individualFunctionality.mainFunctionalities : [];
          this.functionalities.forEach((functionality, i) => {
            if (this.roleSpecificFunctionalities.length > 0) {
              this.roleSpecificFunctionalities.forEach((rFunctionality, k) => {
                if (functionality.name === rFunctionality.name) {
                  this.functionalities[i].subFunctionalities = rFunctionality.subFunctionalities;
                  this.functionalities[i].rename = rFunctionality.rename;
                  this.functionalities[i].isEnabled = true;
                  this.functionalities[i]['Update'] = false;
                  this.functionalities[i]['View'] = (rFunctionality.permissions && rFunctionality.permissions.length > 0 && this.permissionsList.includes('View')) ? (rFunctionality.permissions.find(x => x.permissionName == 'View') ? true : false) : false;
                  this.functionalities[i]['Delete'] = false;
                }
              });
              this.isAllSelected('isEnabled');
            }
          });
          console.log(this.functionalities);
        } else {
          this.resetIsEnabledFlag();
          let wareHouseDetails = null;
          let orgDetails = null;
          if (this.childWareHouseDropdown) {
            wareHouseDetails = this.warehouses.find(x => x.wareHouseIDName == this.childWareHouseDropdown)
          }
          if (this.childOrganizationDropdown) {
            orgDetails = this.orgData.find(x => x.organizationIDName == this.childOrganizationDropdown)
          }
          this.completeResponse = {
            userInfo: this.permissionsForm.controls.userInfo.value,
            "userPermissionWareHouseFunctionality": [{
              name: 'WMS Functionality Names',
              mainFunctionalities: [],
              organizationInfo: orgDetails,
              wareHouseInfo: {
                "wareHouseID": wareHouseDetails.wareHouseID,
                "wareHouseName": wareHouseDetails.wareHouseName,
                "wareHouseIDName": wareHouseDetails.wareHouseIDName,
                "wareHouseMasterID": wareHouseDetails._id
              }
            }]
          };
        }
      },
      (error) => {
      });
  }
  getCheckedProcess(processValue, isChecked) {
    this.functionalities.forEach((process, i) => {
      if (process.name === processValue) {
        if (this.dummyClientTemplate) {
          const sub = this.dummyClientTemplate.mainFunctionalities.find(x => x.name == process.name);
          if (sub) {
            this.functionalities[i].subFunctionalities = sub.subFunctionalities;
          }
        }
        this.functionalities[i].isEnabled = isChecked.target.checked;
        this.functionalities[i]['View'] = isChecked.target.checked;
        if (!isChecked.target.checked) {
          this.functionalities[i].subFunctionalities = [];
        }
      }
    });
  }
  resetIsEnabledFlag() {
    this.functionalities.forEach(functionality => {
      functionality.isEnabled = false;
      functionality.Update = false;
      functionality.View = false;
      functionality.Delete = false;
    });
  }
}
