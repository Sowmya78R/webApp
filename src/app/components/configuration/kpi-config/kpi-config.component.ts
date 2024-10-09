import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from '../../../services/integration-services/configuration.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Storage } from '../../../shared/utils/storage';
import { CompleterData } from 'ng2-completer';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-kpi-config',
  templateUrl: './kpi-config.component.html'
})
export class KpiConfigComponent implements OnInit {
  roles: any = [];
  functionalities: any = [];
  roleSpecificFunctionalities: any = [];
  role: any = 'ROLE_TEMPLATE';
  completeResponse: any = {};
  users: any = [];
  kpiForm: FormGroup;
  childWareHouseDropdown: any = null;
  childOrganizationDropdown: any = null;
  userRelatedDetails: any = [];
  orgData: any = [];
  warehouses: any = [];
  permissionsList: any = [];
  selectAllCheckboxValue: boolean = false;
  selectAllUpdateCheckBox: boolean = false;
  configPermissionsList: any = [];
  userIDNames: CompleterData;
  orgIDNames: CompleterData;
  wareHouseIDNames: CompleterData;
  yesAdmin: Boolean = false;
  selectedUser: any = null;
  clientTemplate: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
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
    // this.fetchAllRoles();
    this.configPermissionsList = this.configurationService.getConfigurationPermissions('mainFunctionalities', 'KPI Config', this.getClientRole());
    if (this.getClientRole() && this.configPermissionsList.length == 0) {
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
  getClientRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      this.yesAdmin = ['ROLE_SUPER_ADMIN'].includes(role) ? true : false;
      return ['ROLE_CLIENT', 'ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  // fetchAllRoles() {
  //   this.commonMasterDataService.fetchAllRoles().subscribe(response => {
  //     if (response && response.status === 0 && response.data.roles) {
  //       this.roles = response.data.roles;
  //     }
  //   }, error => {
  //   });
  // }
  selectAllData(event, key) {
    if (event.target.checked) {
      this.functionalities.forEach((functionality, i) => {
        functionality.subFunctionalities.forEach((subFunctionality, j) => {
          if (key == 'isEnabled') {
            subFunctionality.isEnabled = true;
            subFunctionality.View = true;
          }
          else {
            subFunctionality.Update = subFunctionality.View;
          }
        })
      })
    }
    else {
      this.functionalities.forEach((functionality, i) => {
        functionality.subFunctionalities.forEach((subFunctionality, j) => {
          if (key == 'isEnabled') {
            subFunctionality.isEnabled = false;
            subFunctionality.View = false;
          }
          else {
            subFunctionality.Update = false;
          }
        })
      })
    }
  }
  isAllSelected(key) {
    const formArray = [];
    this.functionalities.forEach((functionality, i) => {
      formArray.push(...functionality.subFunctionalities);
    })
    if (key == 'isEnabled') {
      this.selectAllCheckboxValue = formArray.every(function (item: any) {
        return item.isEnabled == true;
      })
    }
    else {
      this.selectAllUpdateCheckBox = formArray.every(function (item: any) {
        return item.Update == true;
      })
    }
  }
  getAllUsers() {
    this.commonMasterDataService.fetchAllUsers().subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.users) {
          this.users = response.data.users;
          this.userIDNames = this.users.map(x => x.userIDName);
          if (!this.yesAdmin) {
            const businessUnit = sessionStorage.getItem('businessUnit');
            console.log(businessUnit);
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
    this.kpiForm = new FormBuilder().group({
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
  fetchTemplate() {
    this.configurationService.fetchDBWisePermissionsTemplate({ "email": this.selectedUser }).subscribe(res => {
      if (res.status == 0 && res['data'].functionality) {
        this.clientTemplate = res['data'].functionality;
        if (this.yesAdmin) {
          if (this.clientTemplate.kpiConfigurationFunctionalities && this.clientTemplate.kpiConfigurationFunctionalities.length > 0) {
            this.functionalities.forEach((functionality, i) => {
              functionality.subFunctionalities.forEach((subFunctionality, j) => {
                this.clientTemplate.kpiConfigurationFunctionalities.forEach((rFunctionality, k) => {
                  rFunctionality.subFunctionalities.forEach((rSubFunctionality, l) => {
                    if (subFunctionality.name === rSubFunctionality.name) {
                      this.functionalities[i].subFunctionalities[j].isEnabled = true;
                      this.functionalities[i].subFunctionalities[j]['Update'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('Update')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'Update') ? true : false) : false;
                      this.functionalities[i].subFunctionalities[j]['View'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('View')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'View') ? true : false) : false;
                      this.functionalities[i].subFunctionalities[j]['Delete'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('Delete')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'Delete') ? true : false) : false;
                    }
                  });
                });
              });
            });
            this.isAllSelected('isEnabled');
            this.isAllSelected('Update');
            this.isAllSelected('Delete');
          }
          else {
            this.functionalities = this.yesAdmin ? this.functionalities : [];
          }
        }
        else {
          this.functionalities = this.clientTemplate.kpiConfigurationFunctionalities ? this.clientTemplate.kpiConfigurationFunctionalities : this.functionalities;
          this.resetIsEnabledFlag();
        }
      }
      else {
        this.clientTemplate = null;
        this.functionalities = this.yesAdmin ? this.functionalities : [];
      }
    })
  }
  fetchAllFunctionalities() {
    this.configurationService.findAllFunctionalitiesByRoleID('ROLE_TEMPLATE').subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.functionality && response.data.functionality.kpiConfigurationFunctionalities) {
          if (this.role === 'ROLE_TEMPLATE') {
            this.completeResponse = response.data.functionality;
            this.functionalities = response.data.functionality.kpiConfigurationFunctionalities;
            this.resetIsEnabledFlag();
          } else {
            this.resetIsEnabledFlag();
            this.completeResponse = response.data.functionality;
            this.roleSpecificFunctionalities = response.data.functionality.kpiConfigurationFunctionalities;
            this.functionalities.forEach((functionality, i) => {
              functionality.subFunctionalities.forEach((subFunctionality, j) => {
                this.roleSpecificFunctionalities.forEach((rFunctionality, k) => {
                  rFunctionality.subFunctionalities.forEach((rSubFunctionality, l) => {
                    if (subFunctionality.name === rSubFunctionality.name) {
                      this.functionalities[i].subFunctionalities[j].isEnabled = true;
                    }
                  });
                });
              });
            });
          }
        } else if (response && response.status === 0 && response.data.functionality && response.data.functionality.mainFunctionalities) {
          this.resetIsEnabledFlag();
          this.completeResponse = response.data.functionality;
        } else {
          this.resetIsEnabledFlag();
          this.completeResponse = {
            name: 'WMS Functionality Names',
            kpiConfigurationFunctionalities: [],
          };
        }
      },
      (error) => {
      });
  }
  onSelectUser(event) {
    this.resetIsEnabledFlag();
    this.childOrganizationDropdown = null;
    this.childWareHouseDropdown = null;
    this.selectAllCheckboxValue = false;
    this.selectAllUpdateCheckBox = false;
    this.orgData = [];
    this.warehouses = [];
    this.orgIDNames = this.orgData;
    this.wareHouseIDNames = this.warehouses;
    this.permissionsList = this.yesAdmin ? ['View', 'Update', 'Delete'] : [];
    if (event) {
      if (this.yesAdmin) {
        const userDet = this.users.find(x => x.userIDName == event.originalObject);
        this.selectedUser = userDet.email;
        this.kpiForm.controls.userInfo.patchValue(userDet);
        this.fetchTemplate();
      }
      else {
        this.commonMasterDataService.findOrgandWarehouseByUserIdName(event.originalObject).subscribe(res => {
          if (res['status'] == 0 && res['data']['organizationWareHouseHelpers']) {
            this.userRelatedDetails = res['data']['organizationWareHouseHelpers'];
            this.kpiForm.controls.userInfo.patchValue(this.users.find(x => x.userIDName == event.originalObject))
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
      this.permissionsList = [];
      this.selectAllCheckboxValue = false;
      this.selectAllUpdateCheckBox = false;
    }
  }
  onSelectWareHouse(event) {
    if (event) {
      this.getPermissions(this.kpiForm.value.userInfo.userIDName, this.childOrganizationDropdown, event.originalObject);
    }
    else {
      this.resetIsEnabledFlag();
      this.permissionsList = [];
      this.selectAllCheckboxValue = false;
      this.selectAllUpdateCheckBox = false;
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
        this.fetchFunctionalitiesByUserIDName(formData.userID);
        if (this.permissionsList.length == 0) {
          this.toastr.error("Add Warehouse Configurations");
        }
      }
    })
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
              kpiConfigurationFunctionalities: [],
              organizationInfo: orgDetails,
              wareHouseInfo: {
                "wareHouseID": wareHouseDetails.wareHouseID,
                "wareHouseName": wareHouseDetails.wareHouseName,
                "wareHouseIDName": wareHouseDetails.wareHouseIDName,
                "wareHouseMasterID": wareHouseDetails._id
              }
            });
          }
          this.roleSpecificFunctionalities = individualFunctionality ? individualFunctionality.kpiConfigurationFunctionalities : [];
          if (this.roleSpecificFunctionalities && this.roleSpecificFunctionalities.length > 0) {
            this.functionalities.forEach((functionality, i) => {
              functionality.subFunctionalities.forEach((subFunctionality, j) => {
                this.roleSpecificFunctionalities.forEach((rFunctionality, k) => {
                  rFunctionality.subFunctionalities.forEach((rSubFunctionality, l) => {
                    if (subFunctionality.name === rSubFunctionality.name) {
                      this.functionalities[i].subFunctionalities[j].isEnabled = true;
                      this.functionalities[i].subFunctionalities[j]['Update'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('Update')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'Update') ? true : false) : false;
                      this.functionalities[i].subFunctionalities[j]['View'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('View')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'View') ? true : false) : false;
                    }
                  });
                });
              });
            });
            this.isAllSelected('isEnabled');
            this.isAllSelected('Update');
          }
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
            userInfo: this.kpiForm.controls.userInfo.value,
            "userPermissionWareHouseFunctionality": [{
              name: 'WMS Functionality Names',
              kpiConfigurationFunctionalities: [],
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
  selectAllchkbox() {

  }
  getCheckedReport(subFunctionality, reportValue, isChecked) {
    this.functionalities.forEach((process, i) => {
      process.subFunctionalities.forEach((subProcess, j) => {
        if (subProcess.name === reportValue) {
          this.functionalities[i].subFunctionalities[j].isEnabled = isChecked.target.checked;
          this.functionalities[i].subFunctionalities[j]['View'] = isChecked.target.checked;
          if (!isChecked.target.checked) {
            this.functionalities[i].subFunctionalities[j]['Update'] = isChecked.target.checked;
            this.isAllSelected('Update');
          }
        }
      });
    });
  }
  getCheckPermissions(processValue, isChecked, key) {
    this.functionalities.forEach((process, i) => {
      process.subFunctionalities.forEach((subProcess, j) => {
        if (subProcess.name === processValue) {
          this.functionalities[i].subFunctionalities[j][key] = isChecked.target.checked;
        }
      });
    });
  }
  resetIsEnabledFlag() {
    this.functionalities.forEach((functionality, i) => {
      functionality.subFunctionalities.forEach((subFunctionality, j) => {
        this.functionalities[i].subFunctionalities[j].isEnabled = false;
        this.functionalities[i].subFunctionalities[j]['Update'] = false;
        this.functionalities[i].subFunctionalities[j]['View'] = false;
      });
    });
  }

  getRole(role) {
    this.role = role;
    this.fetchAllFunctionalities();
  }
  checkIsConfiguredRole() {
    let isConfigured = false;
    this.roles.forEach((role) => {
      if (role.roleName === this.role) {
        isConfigured = true;
      }
    });
    return isConfigured;
  }
  update() {
    if (this.configPermissionsList.includes('Update')) {
      if ((this.yesAdmin && this.kpiForm.controls.userInfo.value.userIDName) || this.kpiForm.controls.userInfo.value && this.childOrganizationDropdown && this.childWareHouseDropdown) {
        const reqJSON = JSON.parse(JSON.stringify(this.functionalities));
        const endData = [];
        reqJSON.forEach(functionality => {
          for (let i = 0; i < functionality.subFunctionalities.length; i++) {
            if (functionality.subFunctionalities[i].isEnabled === true) {
              endData.push({ name: functionality.name, subFunctionalities: [] });
              break;
            }
          }
        });
        reqJSON.forEach((functionality, i) => {
          for (const subFunctionality of functionality.subFunctionalities) {
            const index = endData.findIndex(x => x.name == functionality.name)
            if (subFunctionality.isEnabled === true) {
              let funcPermissions = [];
              if (subFunctionality.View) {
                funcPermissions.push({ permissionName: 'View' })
              }
              if (subFunctionality.Update) {
                funcPermissions.push({ permissionName: 'Update' })
              }
              endData[index].subFunctionalities.push({ name: subFunctionality.name, permissions: funcPermissions });
            }
          }
        });
        if (this.yesAdmin) {
          if (this.clientTemplate && this.clientTemplate._id) {
            this.clientTemplate.kpiConfigurationFunctionalities = endData;
          }
          else {
            this.clientTemplate = {
              "userInfo": this.kpiForm.controls.userInfo.value,
              "_id": null,
              "name": "WMS Functionality Names",
              "kpiConfigurationFunctionalities": endData
            }
          }
          this.configurationService.saveTemplateForClient(this.clientTemplate).subscribe(
            (response) => {
              if (response) {
                this.role = 'ROLE_TEMPLATE';
                this.toastr.success('Updated successfully');
                this.kpiForm.reset();
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
          this.completeResponse.userPermissionWareHouseFunctionality[index].kpiConfigurationFunctionalities = endData;

          this.configurationService.saveOrUpdateProcessFunctionalities(this.completeResponse).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data.userPermissionFunctionality) {
                this.toastr.success('Updated successfully');
                this.kpiForm.reset();
                this.childOrganizationDropdown = null;
                this.childWareHouseDropdown = null;
                this.selectAllCheckboxValue = false;
                this.selectAllUpdateCheckBox = false;
                this.permissionsList = this.yesAdmin ? ['View', 'Update', 'Delete'] : [];
                this.fetchTemplate();
              } else {
                this.toastr.error('Failed in updating');
              }
            },
            (error) => {

            });
        }
      }
      else {
        this.toastr.error('Select Manditory Fields.');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }

}
