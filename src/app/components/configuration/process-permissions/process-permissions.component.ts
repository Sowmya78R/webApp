import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ConfigurationService } from '../../../services/integration-services/configuration.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ToastrService } from 'ngx-toastr';
import { Storage } from '../../../shared/utils/storage';
import { CompleterData } from 'ng2-completer';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-process-permissions',
  templateUrl: './process-permissions.component.html'
})
export class ProcessPermissionsComponent implements OnInit {
  roles: any = [];
  permissionsForm: FormGroup;
  constructor(
    private configurationService: ConfigurationService,
    private configService: ConfigurationService,
    private toastr: ToastrService,
    private commonMasterDataService: CommonMasterDataService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  functionalities: any = [];
  roleSpecificFunctionalities: any = [];
  role: any = 'ROLE_TEMPLATE';
  completeResponse: any = {};
  users: any = [];
  childWareHouseDropdown: any = null;
  childOrganizationDropdown: any = null;
  userRelatedDetails: any = [];
  orgData: any = [];
  warehouses: any = [];
  permissionsList: any = [];
  individualFunctionality: any = null;
  configPermissionsList: any = [];
  userIDNames: CompleterData;
  orgIDNames: CompleterData;
  wareHouseIDNames: CompleterData;
  yesAdmin: Boolean = false;
  selectedUser: any = null;
  clientTemplate: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  ngOnInit() {
    
    // this.fetchAllRoles();
    this.configPermissionsList = this.configurationService.getConfigurationPermissions('mainFunctionalities', 'Process Permissions', this.getClientRole());
    if (this.getClientRole() && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View','Create', 'Update', 'Delete'];
    }
    if (this.configPermissionsList.includes('View')) {
      this.getAllUsers();
      if (this.yesAdmin) {
        this.fetchAllFunctionalities();
      }
      this.createProcessPermissionsForm();
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    console.log(this.configPermissionsList);
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
  createProcessPermissionsForm() {
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
  onSelectUser(event) {
    this.resetIsEnabledFlag();
    this.childOrganizationDropdown = null;
    this.childWareHouseDropdown = null;
    this.orgData = [];
    this.warehouses = [];
    this.orgIDNames = this.orgData;
    this.wareHouseIDNames = this.warehouses;
    this.permissionsList = this.yesAdmin ? ['View','Create', 'Update', 'Delete'] : [];
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
  }
  onSelectWareHouse(event) {
    if (event) {
      this.getPermissions(this.permissionsForm.value.userInfo.userIDName, this.childOrganizationDropdown, event.originalObject);
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
          this.individualFunctionality = response.data.userPermissionFunctionality.userPermissionWareHouseFunctionality.find(x => x.organizationInfo.organizationIDName == this.childOrganizationDropdown && x.wareHouseInfo.wareHouseIDName == this.childWareHouseDropdown);
          this.completeResponse = response.data.userPermissionFunctionality;
          this.functionalities.forEach((functionality, i) => {
            functionality.subFunctionalities.forEach((subFunctionality, j) => {
              this.functionalities[i].subFunctionalities[j].isEnabled = false;
              this.functionalities[i].subFunctionalities[j].Create = false;
              this.functionalities[i].subFunctionalities[j].Update = false;
              this.functionalities[i].subFunctionalities[j].View = false;
              this.functionalities[i].subFunctionalities[j].Delete = false;
            });
          });
          this.roleSpecificFunctionalities = this.individualFunctionality ? this.individualFunctionality.mainFunctionalities : [];
          if (!this.individualFunctionality && this.permissionsList.length > 0) {
            this.toastr.error('No Process Groups Found')
          }
          if (this.roleSpecificFunctionalities.length > 0) {
            this.functionalities.forEach((functionality, i) => {
              const foundValue = this.individualFunctionality.mainFunctionalities.find(x => x.name == functionality.name);
              functionality.permissions = foundValue ? foundValue.permissions : 'No';
              functionality['selectAllCreateCheckBox'] = false;
              functionality['selectAllUpdateCheckBox'] = false;
              functionality['selectAllDeleteCheckBox'] = false;
              functionality.rename = foundValue ? foundValue.rename : null;
              functionality.subFunctionalities.forEach((subFunctionality, j) => {
                this.roleSpecificFunctionalities.forEach((rFunctionality, k) => {
                  rFunctionality.subFunctionalities.forEach((rSubFunctionality, l) => {
                    if (subFunctionality.name === rSubFunctionality.name) {
                      this.functionalities[i].subFunctionalities[j].isEnabled = true;
                      this.functionalities[i].subFunctionalities[j].rename = rSubFunctionality.rename;
                      this.functionalities[i].subFunctionalities[j]['Create'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('View')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'Create') ? true : false) : false;
                      this.functionalities[i].subFunctionalities[j]['Update'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('Update')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'Update') ? true : false) : false;
                      this.functionalities[i].subFunctionalities[j]['View'] = true;
                      this.functionalities[i].subFunctionalities[j]['Delete'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('Delete')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'Delete') ? true : false) : false;
                    }
                  });
                });
              });
              if (foundValue) {
                this.isAllSelected('Create', functionality.name);
                this.isAllSelected('Update', functionality.name);
                this.isAllSelected('Delete', functionality.name)
              }
            });
          }
        }
      })
  }
  selectAllData(event, key, name) {
    if (event.target.checked) {
      this.functionalities.forEach((functionality, i) => {
        if (functionality.name == name) {
          functionality.subFunctionalities.forEach((subFunctionality, j) => {
            if (key == 'isEnabled') {
              subFunctionality.isEnabled = true;
              subFunctionality.View = true;
            }
            else {
              subFunctionality.Create = (key == 'Create') ? subFunctionality.View : subFunctionality.Create;
              subFunctionality.Update = (key == 'Update') ? subFunctionality.View : subFunctionality.Update;
              subFunctionality.Delete = (key == 'Delete') ? subFunctionality.View : subFunctionality.Delete;
            }
          })
        }
      })
    }
    else {
      this.functionalities.forEach((functionality, i) => {
        if (functionality.name == name) {
          functionality.subFunctionalities.forEach((subFunctionality, j) => {
            if (key == 'isEnabled') {
              subFunctionality.isEnabled = false;
              subFunctionality.View = false;
            }
            else {
              (key == 'Update') ? (subFunctionality.Update = false) : ((key == 'Delete') ? subFunctionality.Delete = false : ((key == 'Create') ? subFunctionality.Create = false : ''));
            }
          })
        }
      })
    }
  }
  isAllSelected(key, name) {
    this.functionalities.forEach((functionality, i) => {
      if (functionality.name == name) {
        if (key == 'Create') {
          functionality['selectAllCreateCheckBox'] = functionality.subFunctionalities.every(function (item: any) {
            return item.Create == true;
          })
        }
        if (key == 'Update') {
          functionality.selectAllUpdateCheckBox = functionality.subFunctionalities.every(function (item: any) {
            return item.Update == true;
          })
        }
        if (key == 'Delete') {
          functionality.selectAllDeleteCheckBox = functionality.subFunctionalities.every(function (item: any) {
            return item.Delete == true;
          })
        }
      }

    })

  }
  getCheckedSubProcess(subProcessValue, isChecked) {
    this.functionalities.forEach((process, i) => {
      process.subFunctionalities.forEach((subProcess, j) => {
        if (subProcess.name === subProcessValue) {
          this.functionalities[i].subFunctionalities[j].isEnabled = isChecked.target.checked;
          subProcess.View = isChecked.target.checked;
          if (!isChecked.target.checked) {
            subProcess.Create = isChecked.target.checked;
            subProcess.Update = isChecked.target.checked;
            subProcess.Delete = isChecked.target.checked;
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
      })
    });
  }
  fetchTemplate() {
    this.configurationService.fetchDBWisePermissionsTemplate({ "email": this.selectedUser }).subscribe(res => {
      if (res.status == 0 && res['data'].functionality) {
        this.clientTemplate = res['data'].functionality;
        if (this.clientTemplate.mainFunctionalities && this.clientTemplate.mainFunctionalities.length) {
          if (this.yesAdmin) {
            this.functionalities.forEach((functionality, i) => {
              const foundValue = this.clientTemplate.mainFunctionalities.find(x => x.name == functionality.name);
              functionality.permissions = foundValue ? foundValue.permissions : 'No';
              functionality['selectAllCreateCheckBox'] = false;
              functionality['selectAllUpdateCheckBox'] = false;
              functionality['selectAllDeleteCheckBox'] = false;
              functionality.subFunctionalities.forEach((subFunctionality, j) => {
                this.clientTemplate.mainFunctionalities.forEach((rFunctionality, k) => {
                  rFunctionality.subFunctionalities.forEach((rSubFunctionality, l) => {
                    if (subFunctionality.name === rSubFunctionality.name) {
                      this.functionalities[i].subFunctionalities[j].rename = rSubFunctionality.rename;
                      this.functionalities[i].subFunctionalities[j].isEnabled = true;  
                      this.functionalities[i].subFunctionalities[j]['Create'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('View')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'Create') ? true : false) : false;
                      this.functionalities[i].subFunctionalities[j]['Update'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('Update')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'Update') ? true : false) : false;
                      this.functionalities[i].subFunctionalities[j]['View'] = true;
                      this.functionalities[i].subFunctionalities[j]['Delete'] = (rSubFunctionality.permissions && rSubFunctionality.permissions.length > 0 && this.permissionsList.includes('Delete')) ? (rSubFunctionality.permissions.find(x => x.permissionName == 'Delete') ? true : false) : false;
                    }
                  });
                });
              });
              if (foundValue) {
                this.isAllSelected('Create', functionality.name);
                this.isAllSelected('Update', functionality.name);
                this.isAllSelected('Delete', functionality.name)
              }
            })
          }
          else {
            this.functionalities = this.clientTemplate.mainFunctionalities;
            this.resetIsEnabledFlag();
          }
        }
        else {
          this.toastr.error('No Process Groups Found')
        }

      }
      else {
        this.clientTemplate = null;
        this.functionalities = this.yesAdmin ? this.functionalities : [];
        this.toastr.error('No Process Groups Found');
      }
    })
  }
  fetchAllFunctionalities() {
    this.configurationService.findAllFunctionalitiesByRoleID('ROLE_TEMPLATE').subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.functionality && response.data.functionality.mainFunctionalities) {
          if (this.role === 'ROLE_TEMPLATE') {
            this.completeResponse = response.data.functionality;
            this.functionalities = response.data.functionality.mainFunctionalities;
            this.functionalities.forEach((functionality, i) => {
              functionality.subFunctionalities.forEach((subFunctionality, j) => {
                this.functionalities[i].subFunctionalities[j].isEnabled = false;
                this.functionalities[i].subFunctionalities[j].Create = false;
                this.functionalities[i].subFunctionalities[j].Update = false;
                this.functionalities[i].subFunctionalities[j].View = false;
                this.functionalities[i].subFunctionalities[j].Delete = false;
              });
            });
          }
          else {

          }
        } else {
          this.functionalities.forEach((functionality, i) => {
            functionality.subFunctionalities.forEach((subFunctionality, j) => {
              this.functionalities[i].subFunctionalities[j].isEnabled = false;
            });
          });
          this.completeResponse = {
            name: 'WMS Functionality Names',
            mainFunctionalities: [],
            roleList: this.roles.filter(role => role.roleName === this.role)
          };
        }
      },
      (error) => {
      });
  }
  getRole(role) {
    this.role = role;
    this.fetchAllFunctionalities();
  }
  fetchAllRoles() {
    this.commonMasterDataService.fetchAllRoles(this.configurationService.getGlobalpayload()).subscribe(response => {
      if (response && response.status === 0 && response.data.roles) {
        this.roles = response.data.roles;
      } else {
        this.roles = [];
      }
    }, error => {
      this.roles = [];
    });
  }
  update() {
    if (this.configPermissionsList.includes('Update')) {
      if (this.yesAdmin && !this.permissionsForm.controls.userInfo.value.userIDName) {
        this.toastr.error("Enter Manditory Fields");
      }
      else {
        const reqJSON = JSON.parse(JSON.stringify(this.functionalities));
        const endData = [];
        reqJSON.forEach(functionality => {
          functionality.permissions = (functionality.permissions == 'No') ? null : functionality.permissions;
          for (let i = 0; i < functionality.subFunctionalities.length; i++) {
            if (functionality.subFunctionalities[i].isEnabled === true) {
              endData.push({ name: functionality.name, rename: functionality.rename, subFunctionalities: [], permissions: functionality.permissions });
              break;
            }
          }
        });
        endData.forEach(element => {
          const index = reqJSON.findIndex(x => x.name == element.name);
          if (index != -1) {
            reqJSON[index].subFunctionalities.forEach(ele => {
              if (ele.isEnabled == true) {
                let funcPermissions = [];
                if (ele.View) {
                  funcPermissions.push({ permissionName: 'View' })
                }
                if (ele.Create) {
                  funcPermissions.push({ permissionName: 'Create' })
                }
                if (ele.Update) {
                  funcPermissions.push({ permissionName: 'Update' })
                }
                if (ele.Delete) {
                  funcPermissions.push({ permissionName: 'Delete' })
                }
                element.subFunctionalities.push({ name: ele.name, rename: ele.rename, permissions: funcPermissions });
              }
            });
          }
        });
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
                this.role = 'ROLE_TEMPLATE';
                this.toastr.success('Updated successfully');
                this.permissionsForm.reset();
                this.childOrganizationDropdown = null;
                this.childWareHouseDropdown = null;
                this.individualFunctionality = null;
                this.permissionsList = [];
                this.fetchTemplate();
              } else {
                this.toastr.error('Failed in updating');
              }
            },
            (error) => {

            });
        }

      }
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }

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
  fetchImgSrc(name) {
    return `assets/subMenusIcons/${name}.png`;
  }
  resetIsEnabledFlag() {
    this.individualFunctionality = null;
    this.functionalities.forEach((functionality, i) => {
      functionality['selectAllCreateCheckBox'] = false;
      functionality.selectAllUpdateCheckBox = false;
      functionality.selectAllDeleteCheckBox = false;
      functionality.subFunctionalities.forEach((subFunctionality, j) => {
        this.functionalities[i].subFunctionalities[j].isEnabled = false;
        this.functionalities[i].subFunctionalities[j]['Create'] = false;
        this.functionalities[i].subFunctionalities[j]['Update'] = false;
        this.functionalities[i].subFunctionalities[j]['View'] = false;
        this.functionalities[i].subFunctionalities[j]['Delete'] = false;
      });
    });
  }
}
