import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppService } from 'src/app/shared/services/app.service';
import { AppComponent } from 'src/app/app.component';
import { Constants } from 'src/app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import { Storage } from '../../shared/utils/storage';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  organizationValue: any = null;
  wareHouseValue: any = null;
  organizationDropdown: any = [];
  wareHouseDropdown: any = [];
  language: any = 'en';
  userDetails: any = JSON.parse(sessionStorage.getItem('dli-wms-user'));
  role: any = null;
  selectedLocations: any = [];
  selectedUsers: any = [];


  public shareFormData: any = new BehaviorSubject({});

  public forPermissions = new BehaviorSubject<boolean>(false);
  forPermissions$: any = this.forPermissions.asObservable();

  public forMaster = new BehaviorSubject<boolean>(false);
  forMaster$ = this.forMaster.asObservable();

  public forParameters = new BehaviorSubject<boolean>(false);
  forParameters$ = this.forParameters.asObservable();

  public forLanguage = new BehaviorSubject<string>('en');
  forLanguage$ = this.forLanguage.asObservable();

  private subject = new Subject<any>();


  constructor(private httpService: HttpService, private appService: AppService,
    private toastr: ToastrService) {
    this.organizationValue = sessionStorage.getItem('dli-wms-userDetails') ? JSON.parse(sessionStorage.getItem('dli-wms-userDetails')).orgIDName : null;
    this.role = sessionStorage.getItem('role');
    if (this.userDetails && this.userDetails.wareHouseConfiguration && this.userDetails.wareHouseConfiguration.wareHouseFunctionalities.length > 0) {
      this.organizationDropdown = this.userDetails.wareHouseConfiguration.wareHouseFunctionalities.map(x => x.organizationInfo.organizationIDName);
      this.wareHouseDropdown = this.userDetails.wareHouseConfiguration.wareHouseFunctionalities.map(x => x.wareHouseInfo.wareHouseIDName);
      this.organizationValue = this.userDetails.wareHouseConfiguration.defaultOrganizationInfo.organizationIDName;
      this.wareHouseValue = this.userDetails.wareHouseConfiguration.defaultWareHouseInfo.wareHouseIDName;
    }
  }

  sendClickEvent() {
    this.subject.next();
  }
  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  getImageShortCut(str) {
    if (str.includes(' ')) {
      return str.charAt(0).concat(str.substr(str.indexOf(' ') + 1, 1));
    }
    else {
      return str.charAt(0) + str.charAt(1);
    }
  }
  getThemeContent(value) {
    if (this.userDetails && this.userDetails.themeConfigurations && this.userDetails.themeConfigurations.length > 0) {
      const themeConfig = this.userDetails.themeConfigurations.find(x => x.organizationInfo.organizationIDName == this.getGlobalpayload().organizationIDName && x.wareHouseInfo.wareHouseIDName == this.getGlobalpayload().wareHouseIDName);
      if (themeConfig) {
        const filteredOne = themeConfig.themeProcesses.find(x => x.name == value);
        return (filteredOne ? filteredOne.processValue : null);
      }
      return null;
    }
  }
  yesAdmin: Boolean = false;
  getClientRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      this.yesAdmin = ['ROLE_SUPER_ADMIN'].includes(role) ? true : false;
      return ['ROLE_CLIENT', 'ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  getGlobalpayload() {
    return {
      "organizationIDName": this.getOrganization().organizationIDName ? this.getOrganization().organizationIDName : this.organizationValue,
      "wareHouseIDName": this.getWarehouse().wareHouseIDName
    }
  }

  getOrganization() {
    let org = {
      "_id": null,
      "organizationID": null,
      "organizationName": null,
      "organizationIDName": null
    }
    if (this.organizationValue && this.userDetails && this.userDetails.wareHouseConfiguration && this.userDetails.wareHouseConfiguration.wareHouseFunctionalities && this.userDetails.wareHouseConfiguration.wareHouseFunctionalities.length > 0) {
      org = this.userDetails.wareHouseConfiguration.wareHouseFunctionalities.find(x => x.organizationInfo.organizationIDName == this.organizationValue).organizationInfo;
    }
    return org;
  }
  getWarehouse() {
    let org = {
      "wareHouseMasterID": null,
      "wareHouseID": null,
      "wareHouseName": null,
      "wareHouseIDName": null
    }
    if ((this.wareHouseValue != "null") && this.userDetails && this.userDetails.wareHouseConfiguration && this.userDetails.wareHouseConfiguration.wareHouseFunctionalities && this.userDetails.wareHouseConfiguration.wareHouseFunctionalities.length > 0) {
      org = this.userDetails.wareHouseConfiguration.wareHouseFunctionalities.find(x => x.wareHouseInfo.wareHouseIDName == this.wareHouseValue).wareHouseInfo;
      Constants.WAREHOUSE_ID = org['wareHouseMasterID']
    }
    return org;
  }
  setWareHouseRelatedorg(warehouseIDName, key?) {
    this.wareHouseValue = warehouseIDName;
    if (warehouseIDName != 'null') {
      const index = this.userDetails.wareHouseConfiguration.wareHouseFunctionalities
        .findIndex(x => x.wareHouseInfo.wareHouseIDName == warehouseIDName);
      if (index != -1) {
        this.organizationValue = this.userDetails.wareHouseConfiguration.wareHouseFunctionalities
        [index].organizationInfo.organizationIDName;
        sessionStorage.setItem('changedWareHouse', warehouseIDName);
        if (!key) {
          if (window.location.href.includes('createPurchaseOrder?id=')) {
            this.appService.navigate('/v1/inbound/maintainPurchaseOrder');
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          }
          else if (window.location.href.includes('goodsReceipt?id=')) {
            this.appService.navigate('/v1/inbound/maintainGoodsReceipt');
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          }
          else if (window.location.href.includes('createSalesOrder?id=')) {
            this.appService.navigate('/v1/outbound/maintainSalesOrder');
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          }
          else if (window.location.href.includes('editShipmentOrder?id=')) {
            this.appService.navigate('/v1/outbound/maintainShipmentOrder');
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          }
          else if (window.location.href.includes('editInvoicing?id=')) {
            this.appService.navigate('/v1/outbound/maintainInvoicing');
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          }
          else if (window.location.href.includes('create-billing-po?id=')) {
            this.appService.navigate('/v1/vas/billing-po');
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          }
          else if (window.location.href.includes('maintainWarehouseTransfer?id=') || window.location.href.includes('createWareHouseTransfer?id=')) {
            this.appService.navigate('/wareHouseTransfer');
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          }
          else {
            window.location.reload();
          }
        }
      }
      else {
        this.organizationValue = null;
        // window.location.reload();
        // if (this.appService.getParam('id')) {
        //   this.appService.navigate('/homepage', null);
        // }
      }
    }
    else {
      this.organizationValue = null;
      // window.location.reload();
    }
  }
  getModulesList(arrayName) {
    let arr = [];
    if (this.role === 'ROLE_SUPER_ADMIN') {
      arr = this.userDetails.functionality[arrayName];
    }
    if (this.role != 'ROLE_SUPER_ADMIN' && this.userDetails && this.userDetails.userPermissionFunctionalityInfo &&
      this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.length > 0) {
      const modulesList = this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.find(x =>
        x.organizationInfo.organizationIDName == this.organizationValue && x.wareHouseInfo.wareHouseIDName == this.wareHouseValue);
      if (modulesList) {
        arr = modulesList[arrayName];
      }
    }
    return arr;
  }
  getConfigurationPermissions(arrayName, componentName, isRole) {
    this.userDetails = JSON.parse(sessionStorage.getItem('dli-wms-user'));
    let arr = [];
    if (this.role === 'ROLE_SUPER_ADMIN') {
      arr = ['View', 'Create', 'Update', 'Delete',];
    }
    else {
      if (this.userDetails && this.userDetails.userPermissionFunctionalityInfo &&
        this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.length > 0) {
        const modulesList = this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.find(x =>
          x.organizationInfo.organizationIDName == this.organizationValue && x.wareHouseInfo.wareHouseIDName == this.wareHouseValue);
        if (modulesList) {
          const config = modulesList[arrayName].find(x => x.name == 'Configurations');
          if (config && config.subFunctionalities.length > 0) {
            const permissionsExist = (config.subFunctionalities.find(x => x.name == componentName));
            if (permissionsExist && permissionsExist.permissions) {
              arr = permissionsExist.permissions.map(x => x.permissionName);
            }
            else {
              if (isRole) {
                arr = [];
              }
              else {
                this.appService.navigate('/homepage', null);
                this.toastr.error("No Permissions");
              }
            }
          }
          else {
            if (isRole) {
              arr = [];
            }
            else {
              this.appService.navigate('/homepage', null);
              this.toastr.error("No Permissions");
            }
          }
        }
      }
    }
    return arr;
  }

  getPermissions(arrayName, moduleName, componentName, user, key?, noErr?) {
    let arr = [];
    if (this.role === 'ROLE_SUPER_ADMIN') {
      arr = ['View', 'Update', 'Delete', 'Create'];
    }
    else {
      this.userDetails = user;
      if (this.userDetails && this.userDetails.userPermissionFunctionalityInfo && this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.length > 0) {
        const modulesList = this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.find(x => x.organizationInfo.organizationIDName == this.organizationValue && x.wareHouseInfo.wareHouseIDName == this.wareHouseValue);
        if (modulesList && modulesList[arrayName]) {
          const module = modulesList[arrayName].find(x => x.name == moduleName);
          if (module) {
            if (key) {
              if (module.subFunctionalities.length > 0) {
                let dummyBoolean: Boolean = false;
                module.subFunctionalities.forEach(el => {
                  if (el.permissions) {
                    dummyBoolean = true;
                  }
                });
                if (dummyBoolean) {

                  return module.subFunctionalities;
                }
                else {
                  this.appService.navigate('/homepage', null);
                  this.toastr.error("No Permissions");
                }
              }
              else {
                this.appService.navigate('/homepage', null);
                this.toastr.error("No Permissions");
              }
            }
            const permissionsExist = (module.subFunctionalities.find(x => x.name == componentName));
            if (permissionsExist && permissionsExist.permissions) {
              arr = permissionsExist.permissions.map(x => x.permissionName);
            }
            else {
              if (!noErr) {
                this.appService.navigate('/homepage', null);
                this.toastr.error("No Permissions");
              }
            }
          }
          else {
            if ((componentName == 'Warehouse' || componentName == 'Organization') && this.userDetails.authorities[0].authority == 'ROLE_CLIENT') {
              arr = ['View', 'Update', 'Delete', 'Create'];
            }
          }
        }
        else {
          if ((componentName == 'Warehouse' || componentName == 'Organization') && this.userDetails.authorities[0].authority == 'ROLE_CLIENT') {
            arr = ['View', 'Update', 'Delete', 'Create'];
          }
        }
      }
      else {
        if ((componentName == 'Warehouse' || componentName == 'Organization') && this.userDetails.authorities[0].authority == 'ROLE_CLIENT') {
          arr = ['View', 'Update', 'Delete', 'Create'];
        }
      }
    }
    return arr;
  }

  getPermissionsForDashboard(arrayName?, moduleName?, componentName?, user?) {
    let arr = [];
    this.userDetails = user;
    if (this.role === 'ROLE_SUPER_ADMIN') {
      arr = ['View', 'Update', 'Delete'];
    }
    else {
      if (this.userDetails && this.userDetails.userPermissionFunctionalityInfo && this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.length > 0) {
        const modulesList = this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.find(x => x.organizationInfo.organizationIDName == this.organizationValue && x.wareHouseInfo.wareHouseIDName == this.wareHouseValue);
        if (modulesList != null && modulesList != undefined && modulesList[arrayName]) {
          const module = modulesList[arrayName].find(x => x.name == moduleName);
          if (module) {
            const permissionsExist = (module.subFunctionalities.find(x => x.name == componentName))
            if (permissionsExist) {
              arr = permissionsExist.permissions.map(x => x.permissionName);
            }
            else {
              /*  this.appService.navigate('/homepage', null); */
            }
          }
        }
      }
    }
    return arr;
  }
  findAllFunctionalitiesByRoleID(role) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'login/services/findFunctionalitiesByRoleID';
    httpReq.showLoader = true;
    const data = `authority=${role}&accessLink=`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchDBWisePermissionsTemplate(formBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'login/services/findDefaultFunctionalityTemplateByUserIDNameOrEmail';
    httpReq.showLoader = true;
    httpReq.body = formBody;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateFunctionalities(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'saveorUpdateFunctionality';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getLoginActivities() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'findLoginActivityByEmail';
    httpReq.showLoader = true;
    httpReq.body = `email=`;
    return this.httpService.restCall(httpReq);
  }
  findAllPermissionsByDetails(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'login/services/findPermissionsFromWareHouseConfiguration';
    httpReq.showLoader = true;
    const data = `userIDName=${details.userID}&organizationIDName=${encodeURIComponent(details.organizationID)}&wareHouseIDName=${encodeURIComponent(details.wareHouseID)}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  findInventoryConfigPermissions(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `configuration/services/findProcessConfigurationForLoggedInUser?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  getFunctionalitiesOfUser(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'findAllUserPermissionFunctionalities';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getFunctionalitiesbyUserIDName(user) {
    const encodedSyntax = encodeURIComponent(user);
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'login/services/findUserPermissionFunctionalityByUserIDName';
    httpReq.showLoader = true;
    const data = `userIDName=${encodedSyntax}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateProcessFunctionalities(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'login/services/saveorUpdateUserPermissionFunctionality';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveTemplateForClient(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'login/services/saveorUpdateFunctionality';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateInventoryConfiguration(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/saveorUpdateProcessConfiguration';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getAllInventoryConfiguration(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/findByAllProcessConfigurations';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchNotificationConfiguration(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllNotificationsConfigurations';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  //cyclecountingConfig

  saveOrUpdatecycleCountingConfig(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/saveorUpdateCycleCountingConfiguration';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getAllccConfiguration(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/findAllCycleCountingConfigurations';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  // getAllInventoryCounting(data) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.contentType = 'applicationJSON';
  //   httpReq.url = 'cycleCounting/services/findAllInventoryCountingsWithPagination';
  //   httpReq.showLoader = true;
  //   httpReq.body = data;
  //   return this.httpService.restCall(httpReq);
  // }
  getAllInventoryCountingWithPaginations(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/findAllInventoryCountingsWithPagination';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getCycleCountingIDPagination(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/findInventoryCountingByIDWithPagination';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  getCountingLines(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/findInventoryCountingLines';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateCycleCounting(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/saveorUpdateInventoryCounting';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  updateSingleInvCountingLine(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/updateIndividualInventoryCounting';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  performCycleCounting(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/performCycleCounting';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  rejectCycleCounting(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/rejectInventoryCounting';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  updateCCorderStatus(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'cycleCounting/services/updateInventoryCountingOrderStatus';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getCycleCountingById(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `cycleCounting/services/findInventoryCountingByID?_id=${data._id}&organizationIDName=${encodeURIComponent(data.organizationIDName)}&wareHouseIDName=${encodeURIComponent(data.wareHouseIDName)}`
    httpReq.showLoader = true;
    return this.httpService.restCall(httpReq);
  }

  saveOrUpdateNotificationConfiguration(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/saveorUpdateNotificationsConfiguration';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateSUConfig(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'thirdParty/services/saveorUpdateSpaceUtilizationConfiguration';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getAllSUConfig(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'thirdParty/services/findAllSpaceUtilizationConfigurations';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateThemeConfigDetails(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/saveorUpdateThemeConfiguration';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  findAllThemeConfigurations(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/findAllThemeConfigurations';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateLoginThemeConfigDetails(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/saveorUpdateLoginThemeConfiguration';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  findAllLoginThemeConfigurations(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/findAllLoginThemeConfigurations';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  saveOrUpdateStatusConfig(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/saveOrUpdateProcessStatusConfiguration';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getAllStatusConfig(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/findAllProcessStatusConfigurations';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getALLOrderSequenceNumberConfig(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/findByAllOrderSequenceNumberConfigurations';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  savePrefixConfig(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/saveOrUpdateOrderSequenceNumberConfiguration';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  addZerosMethod(i) {
    const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let value: any = '0';
    if (i >= 5) {
      value = value + "00"
    }
    else {
      count.forEach(element => {
        if (element < (i - 1)) {
          value = value + 0;
        }
      });
    }
    return value.toString();
  }
}
