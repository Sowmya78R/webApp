import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { WmsCommonService } from '../../../services/wms-common.service';
import { Storage } from '../../../shared/utils/storage';
import { ApexService } from '../../../shared/services/apex.service';
import { AppService } from '../../../shared/services/app.service';
import { MetaDataService } from '../../../services/integration-services/metadata.service';
import { DashboardService } from '../../../services/integration-services/dashboard.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ChartType, ChartLegendOptions, Tooltip, ChartOptions } from 'chart.js';

import { Label, SingleDataSet } from 'ng2-charts';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HOMEPAGE_HELP_FILE } from 'src/app/constants/helpfile';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ConfigurationNavConstants, MasterDataNavConstants, ReportsNavConstants, dashboardsNavConstants } from 'src/app/constants/nav.constants';
declare let $: any;

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styles: ['p{padding:10px;font-size: 12px;color:black;}.material-icons{font-size:16px!important}.fa-truck{font-size:14px!important}']
})
export class HomePageComponent implements OnInit {
  navLinks: any = [];
  homePageText: any;
  role: any = null;
  footerLinks: any = [];
  defaultText: any = ``;
  // direction = "ltr";
  // language = "en";
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutlegend: false
  // options: any = {
  //   tooltips: {
  //     enabled: false
  //   }
  // };
  public donutColors = [{
    backgroundColor: [
      'rgba(110, 114, 20, 1)',
      'rgba(118, 183, 172, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(129, 78, 40, 1)',
      'rgba(129, 199, 111, 1)',
      'rgba(255,0,0,0.3)',
      'rgba(0,0,255,0.3)',
      'rgba(0,255,0,230)',
      'rgba(140, 162, 140, 0.64)',
      'rgba(140, 162, 140, 0.20)',
      'rgba(140, 120, 140, 0.40)',
      'rgba(120, 120, 140, 0.60)',
      'rgba(110, 114, 20, 1)',
      'rgba(118, 183, 172, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(129, 78, 40, 1)',
      'rgba(129, 199, 111, 1)',
      'rgba(255,0,0,0.3)',
      'rgba(0,0,255,0.3)',
      'rgba(0,255,0,230)',
      'rgba(140, 162, 140, 0.64)',
      'rgba(140, 162, 140, 0.20)',
      'rgba(140, 120, 140, 0.40)',
      'rgba(120, 120, 140, 0.60)',
      'rgba(120, 120, 140, 0.60)',
      'rgba(110, 114, 20, 1)',
      'rgba(118, 183, 172, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(129, 78, 40, 1)',
      'rgba(129, 199, 111, 1)',
      'rgba(255,0,0,0.3)',
      'rgba(0,0,255,0.3)',
      'rgba(0,255,0,230)',
      'rgba(140, 162, 140, 0.64)',
      'rgba(140, 162, 140, 0.20)',
      'rgba(110, 114, 20, 1)',
      'rgba(118, 183, 172, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(129, 78, 40, 1)',
      'rgba(129, 199, 111, 1)',
      'rgba(255,0,0,0.3)',
      'rgba(0,0,255,0.3)',
      'rgba(110, 114, 20, 1)',
      'rgba(118, 183, 172, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(129, 78, 40, 1)',
      'rgba(129, 199, 111, 1)',
      'rgba(255,0,0,0.3)',
      'rgba(0,0,255,0.3)',
      'rgba(0,255,0,230)',
      'rgba(140, 162, 140, 0.64)',
      'rgba(140, 162, 140, 0.20)',
      'rgba(140, 120, 140, 0.40)',
      'rgba(120, 120, 140, 0.60)',
      'rgba(110, 114, 20, 1)',
      'rgba(118, 183, 172, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(129, 78, 40, 1)',
      'rgba(129, 199, 111, 1)',
      'rgba(255,0,0,0.3)',
      'rgba(0,0,255,0.3)',
      'rgba(0,255,0,230)',
      'rgba(140, 162, 140, 0.64)',
      'rgba(140, 162, 140, 0.20)',
      'rgba(140, 120, 140, 0.40)',
      'rgba(120, 120, 140, 0.60)',
      'rgba(120, 120, 140, 0.60)',
      'rgba(110, 114, 20, 1)',
      'rgba(118, 183, 172, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(129, 78, 40, 1)',
      'rgba(129, 199, 111, 1)',
      'rgba(255,0,0,0.3)',
      'rgba(0,0,255,0.3)',
      'rgba(0,255,0,230)',
      'rgba(140, 162, 140, 0.64)',
      'rgba(140, 162, 140, 0.20)',
      'rgba(110, 114, 20, 1)',
      'rgba(118, 183, 172, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(0, 148, 97, 1)',
      'rgba(129, 78, 40, 1)',
      'rgba(129, 199, 111, 1)',
      'rgba(255,0,0,0.3)',
      'rgba(0,0,255,0.3)',
    ]
  },
  ];

  showSubMenu(menuName) {
    this.apexService.SubMenu.next(menuName.name);
  }
  getModuleName(val) {
    sessionStorage.setItem('menuName', val);
    sessionStorage.setItem('linkName', val);
  }
  options: any = {
    responsive: true,
    maintainAspectRatio: true,

    legend: {
      display: false,

    }
  };

  public stockInInventoryLabels: Label[] = [];
  public stockInInventoryData: SingleDataSet[] = [];


  userData: any;
  userDetails: any = {};
  logoList = { "_id": null, "logoName": null };
  logoImage: any;
  logoImage1: any;
  notificationDataList: any = [];
  viewAllNotifications: any = [];
  changeFileData: any;


  deafultColorCombo: string = '#fff';
  deafultColor: string = '#000';
  deafultColorWareHouseColor: string = '#fff';
  formObj = this.configService.getGlobalpayload();
  inExpiryCheck: boolean = false;
  expiredCheck: boolean = false;
  poCheck: boolean = false;
  putawayCheck: boolean = false;
  pickingCheck: boolean = false;
  zoneCheck: boolean = false;
  soCheck: boolean = false;
  supplierIDName: any = null;
  homeTitletext: any = 'Warehouse Management'
  HeaderImg = this.configService.getThemeContent('Home Page Header Image');
  // homePageHeaderIamgeOnly = this.configService.getThemeContent('Home Page Header Image Only');
  homeTitle = this.configService.getThemeContent('Home Page Title');
  homepageSideTitleHeading = this.configService.getThemeContent('Home page Side Title Heading');
  homeText = this.configService.getThemeContent('Home Page Text');
  homeTextColor = this.configService.getThemeContent('Home Page Title color');
  homeUpdatedText: any
  organizationFontColor = this.configService.getThemeContent('Organization Font Color');
  logoIcon = this.configService.getThemeContent('Menu Page Logo');

  homePageHeaderImageOnly = this.configService.getThemeContent('Home Page Header Image Only');

  header = this.configService.getThemeContent('Menu Page Logo');
  inventoryGraphPermissions = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Homepage', 'Inventory Stock', Storage.getSessionUser());
  logo1: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  zone1: any = [{ name: 'Used Capacity', value: 'red' }, { name: 'Unused Capacity', value: 'red' }];
  zone2: any = [{ name: 'Used Capacity', value: 'red' }, { name: 'Unused Capacity', value: 'red' }];
  zone3: any = [{ name: 'Used Capacity', value: 'red' }, { name: 'Unused Capacity', value: 'red' }];


  // Pie Charts for zones
  public zoneLabels: Label[] = ['Unused Capacity', 'Used Capacity'];
  public zone1Data: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  // Warehouse Capacity
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };

  public pieChartPlugins: any = [];
  public warehouseCapacityLabels: Label[] = ['Completely Available ', 'Partially Available', 'Un-Available'];
  public warehouseCapacityData: SingleDataSet = [];
  public warehouseCapacityType: ChartType = 'pie';
  public warehouseCapacityLegend = true;
  // storagePopupData: any = [];
  locDimension: any = null;
  pieChartColors: any = [{
    backgroundColor: ['#08DDC1', '#FFDC1B', '#FF5E3A'],
  }];
  public warehouseCapacityPlugins = [];

  colorScheme = {
    domain: ['#08DDC1', '#FFDC1B', '#FF5E3A']
  };

  constructor(private wmsCommonService: WmsCommonService, public configService: ConfigurationService,
    private appService: AppService, private wmsService: WMSService,
    private metaDataService: MetaDataService,
    private commonMasterDataService: CommonMasterDataService,
    private apexService: ApexService,
    private dashboardService: DashboardService, public ngxSmartModalService: NgxSmartModalService,
    private el: ElementRef, private renderer: Renderer2,
    private translate: TranslateService) {
    // this.translate.setDefaultLang(this.configService.language);
    this.translate.use(this.language);

  }
  ngOnInit() {

    this.fetchZonesCapacity();
    $(document).ready(function () {
      $('.carousel').carousel({
        interval: 5000
      })
    });

    this.language = this.configService.language;
    this.direction = (this.language == 'ar') ? "rtl" : "ltr";
    this.translate.use(this.language);
    this.userData = Storage.getSessionUser();
    /* if (this.logoIcon) {
      const fileNames = JSON.parse(JSON.stringify(this.logoIcon));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.logo1 = 'data:text/plain;base64,' + data['data']['resource'];
        this.logo1 = this.metaDataService.dataURLtoFile(this.logo1, fileNames);
        this.metaDataService.imgGlobalChanged(this.logo1, 'logo1', true);
      });
    } */
    if (this.homePageHeaderImageOnly) {
      const fileNames = JSON.parse(JSON.stringify(this.homePageHeaderImageOnly));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.logo1 = 'data:text/plain;base64,' + data['data']['resource'];
        this.logo1 = this.metaDataService.dataURLtoFile(this.logo1, fileNames);
        this.metaDataService.imgGlobalChanged(this.logo1, 'logo1', true);
      });
    }
    this.getAllCalls();
    this.getRole();

    if (this.homeTitle) {
      this.homeTitletext = this.homeTitle
    }
    if (this.homeTextColor) {
      this.deafultColor = this.homeTextColor
    }
    if (this.HeaderImg) {
      const fileNames = JSON.parse(JSON.stringify(this.HeaderImg));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.logoImage1 = 'data:text/plain;base64,' + data['data']['resource'];
      });
    }
    if (this.homePageHeaderImageOnly) {
      const fileNames = JSON.parse(JSON.stringify(this.homePageHeaderImageOnly));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.logoImage = 'data:text/plain;base64,' + data['data']['resource'];
      });
    }
    // Example JavaScript to add new content
    let newContent = document.createElement('div');
    newContent.className = 'marquee-content new';
    // Add new content to the existing marquee container
    if (document.querySelector('.marquee')) {
      document.querySelector('.marquee').appendChild(newContent);
    }
  }
  utilizationHeader: any = null;
  getDimensions(data) {
    this.utilizationHeader = data.zoneName;
    this.locDimension = data.locationDimensionsResponse;
    this.ngxSmartModalService.getModal('utilPopup').open();
  }
  getAllCalls(event?) {
    this.getSupplierDetails();
    this.findUserDetailsByEmail();
    this.getNavLinksWithRoutes(event);
    if (this.userData.authorities[0].authority == 'ROLE_SUPER_ADMIN') {
      this.homePageText = `Warehouse management support warehouse staff in performing the processes required to handle all of the major and many minor warehouse tasks such as receiving, inspection and acceptance, put-away, internal replenishment to picking positions, picking, packing, value added services, order assembly on the shipping dock, documentation and shipping. A warehouse management also helps in directing and validating each step capturing and recording all inventory movement and status changes to the data file`;
    }
    else {
      this.fetchAllHomePageText();
    }
    if (this.homeText) {
      this.homeUpdatedText = this.homeText
    } else {
      this.homeUpdatedText = `Warehouse management support warehouse staff in performing the processes required to handle all of the major and many minor warehouse tasks such as receiving, inspection and acceptance, put-away, internal replenishment to picking positions, picking, packing, value added services, order assembly on the shipping dock, documentation and shipping. A warehouse management also helps in directing and validating each step capturing and recording all inventory movement and status changes to the data file`;
      //this.homeUpdatedText = '';
      //this.homeUpdatedText = `Warehouse management support warehouse staff in performing the processes required to handle all of the major and many minor warehouse tasks such as receiving, inspection and acceptance, put-away, internal replenishment to picking positions, picking, packing, value added services, order assembly on the shipping dock, documentation and shipping. A warehouse management also helps in directing and validating each step capturing and recording all inventory movement and status changes to the data file`;
      //this.homeUpdatedText = '';
    }
    this.fetchLogo();
    this.getNotifications();
    this.getNotificationConfig();
  }
  getSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          const suppliers = response.data.supplierMasters;
          let role;
          const user = Storage.getSessionUser();
          if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
            role = user.authorities[0].authority;
            this.supplierIDName = (role === 'SUPPLIER') ? suppliers.find(x => x.supplierEmailID == user.username).supplierIDName : null;
            this.fetchStockInInventory();
          }
        }
        else {
          this.fetchStockInInventory();
        }
      })
  }
  getNotificationConfig() {
    this.configService.fetchNotificationConfiguration(this.formObj).subscribe(data => {
      if (data['status'] == 0 && data.data.notificationsConfigurations) {
        const notificationResponceList = data.data.notificationsConfigurations;
        this.inExpiryCheck = this.avaiableCheck(notificationResponceList, 'Going To Expire');
        this.expiredCheck = this.avaiableCheck(notificationResponceList, 'Expired');
        this.poCheck = this.avaiableCheck(notificationResponceList, 'Purchase Order');
        this.putawayCheck = this.avaiableCheck(notificationResponceList, 'putAway');
        this.pickingCheck = this.avaiableCheck(notificationResponceList, 'Picking');
        this.zoneCheck = this.avaiableCheck(notificationResponceList, 'zone capacity');
        this.soCheck = this.avaiableCheck(notificationResponceList, 'Sales Order');
      }
    })
  }

  avaiableCheck(notificationResponceList, key) {
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).authorities[0].authority;
    if (notificationResponceList.find(x => x.notificationName == key)) {
      const rolePermissionsArray = notificationResponceList.find(x => x.notificationName == key).notificationsUserConfigurations;
      const filterArr = rolePermissionsArray.length > 0 ? rolePermissionsArray.filter(x => x.userInfos.length) : [];
      if (filterArr.length > 0) {
        const rolePermissionsArrayIDS = filterArr.map(x => x.role.roleName);
        if (rolePermissionsArrayIDS.length > 0) {
          return rolePermissionsArrayIDS.includes(loginUserRole) ? true : false;
        }
        else {
          return true;
        }
      }
      else {
        return true;
      }
    }
    else {
      return true;
    }
  }
  useLanguage(language) {
    this.configService.forLanguage.next(language);
    this.configService.language = language;
    this.direction = (language == 'ar') ? "rtl" : "ltr";
    this.translate.use(this.configService.language);
  }
  getProcess(name) {
    sessionStorage.setItem('module', name);
  }
  getNavLinksWithRoutes(event?) {
    if (event) { this.configService.setWareHouseRelatedorg(event); }
    this.navLinks = this.wmsCommonService.getNavigationLinksWithRoutes(this.configService.getModulesList('mainFunctionalities'));
    const removeIndex = this.navLinks.findIndex(x => x.name === 'Configurations');
    if (this.navLinks.length > 0 && removeIndex != -1) {
      const arr = this.navLinks.splice(removeIndex, 1);
    }
    if (this.navLinks.length > 0) {
      this.navLinks.forEach(ele => {
        if (ele.name == "Layout") {
          ele.route = '/warehouseLayout';
        }
        else {
          if (ele.subFunctionalities.length == 1) {
            ele.route = ele.subFunctionalities[0].route;
            if (ele.name == 'Inventory') {
              const arr = [];
              if (ele.subFunctionalities[0].name == 'Inventory') {
                arr.push({ name: 'Inventory', link: 'inventoryTables' });
              }
              if (ele.subFunctionalities[0].name == 'Inventory by Location') {
                arr.push({ name: 'Inventory By Location', link: 'inventoryByLocation' });
              }
              if (ele.subFunctionalities[0].name == 'Inventory by Product') {
                arr.push({ name: 'Inventory By Product', link: 'inventoryByProduct' });
              }
              if (ele.subFunctionalities[0].name == 'Inventory Item Totals') {
                arr.push({ name: 'Inventory Product Totals', link: 'inventoryproductTotals' });
              }
              if (ele.subFunctionalities[0].name == 'Inventory Transactions') {
                arr.push({ name: 'Inventory Transactions', link: 'inventoryTransaction' });
              }
              if (ele.subFunctionalities[0].name == 'Inventory Transactions Details') {
                arr.push({ name: 'Inventory Transaction Details', link: 'inventoryTransactionDetails' });
              }
              if (ele.subFunctionalities[0].name == "Over All Inventory") {
                arr.push({ name: "Over All Inventory", link: 'overAllInventory' });
              }
              ele.route = '/v1/inventory/lists/' + arr[0].link;
            }
            if (ele.name == "Workforce") {
              const scheduleLocalPer = ele.subFunctionalities.find(x => x.name == 'Workforce Picking' || x.name == 'Workforce Putaway' || x.name == 'Workforce Internal Transfer' || x.name == 'Workforce Packing' || x.name == 'Workforce Re-Packing' || x.name == 'Workforce Co-Packing' || x.name == 'Workforce Labeling' || x.name == 'Workforce Loading' || x.name == 'Workforce Unloading')
              if (scheduleLocalPer) {
                const arr = [];
                if (ele.subFunctionalities[0].name == 'Workforce Putaway') {
                  arr.push({ name: 'Putaway Planning', link: 'putawayPlanning' });
                }
                if (ele.subFunctionalities[0].name == 'Workforce Picking') {
                  arr.push({ name: 'Picking Planning', link: 'pickingPlanning' });
                }
                if (ele.subFunctionalities[0].name == 'Workforce Internal Transfer') {
                  arr.push({ name: 'Internal Transfer', link: 'internalTransferPlanning' });
                }
                if (ele.subFunctionalities[0].name == 'Workforce Packing') {
                  arr.push({ name: 'Packing', link: 'packingPlanning' });
                }
                if (ele.subFunctionalities[0].name == 'Workforce Re Packing') {
                  arr.push({ name: 'Re-Packing', link: 'rePackingPlanning' });
                }
                if (ele.subFunctionalities[0].name == 'Workforce Co Packing') {
                  arr.push({ name: 'Co-Packing', link: 'coPackingPlanning' });
                }
                if (ele.subFunctionalities[0].name == 'Workforce Labelling') {
                  arr.push({ name: 'Labelling', link: 'labellingPlanning' });
                }
                if (ele.subFunctionalities[0].name == 'Workforce Loading') {
                  arr.push({ name: 'Loading', link: 'loadingPlanning' });
                }
                if (ele.subFunctionalities[0].name == 'Workforce Unloading') {
                  arr.push({ name: 'UnLoading', link: 'unloadingPlanning' });
                }
                ele.route = '/v1/workforce/employeeSchedule/' + arr[0].link;
              }
            }
          }
        }
      });
    }
  }
  openModalPopup() {
    this.ngxSmartModalService.getModal('homePageModal').open();
  }
  logout() {
    Storage.clearSession();
    this.apexService.sessionUserEmit('');
    this.configService.language = 'en';
    this.configService.organizationValue = null;
    this.configService.wareHouseValue = null;
    this.configService.organizationDropdown = [];
    this.configService.wareHouseDropdown = [];
    this.configService.userDetails = null;
    // this.appService.navigate('/newlogin', null);
    this.appService.navigate('/login', null);
  }
  fetchAllHomePageText() {
    this.metaDataService.fetchAllHomePageText(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.HomePageText && response.data.HomePageText.length > 0) {
          this.homePageText = response.data.HomePageText[0].homePage;
        }
        else {
          this.homePageText = null;
        }
      },
      error => {
      });
  }
  fetchLogo() {
    this.metaDataService.getAllLogos(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.logos && res.data.logos.length > 0) {
        this.logoList = res.data.logos[0];
        const fileNames = JSON.parse(JSON.stringify(this.logoList.logoName));
        this.metaDataService.viewImages(fileNames).subscribe(data => {
          this.logoImage = 'data:text/plain;base64,' + data['data']['resource'];
          this.logoImage = this.metaDataService.dataURLtoFile(this.logoImage, fileNames);
          this.metaDataService.imgGlobalChanged(this.logoImage, 'logoImage', true);
        });
      }
      else {
        this.logoList = { "_id": null, "logoName": null };
      }
    })
  }
  findUserDetailsByEmail() {
    this.commonMasterDataService.fetchUserDetailsByEmail(this.userData.username).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.users) {
          this.userDetails = response.data.users;
          Storage.setSessionItem('userDetails', {
            firstName: this.userDetails.firstName,
            lastName: this.userDetails.lastName,
            userID: this.userDetails.userID,
            userIDName: this.userDetails.userIDName,
            orgIDName: this.userDetails.organizationInfo ? this.userDetails.organizationInfo.organizationIDName : null
          });
        }
        else {
          this.userDetails = [];
        }
      },
      (error) => {
      });
  }
  productIDNameArray: any = [];
  quantitiesArray: any = [];

  fetchStockInInventory() {
    let labels = [];
    let data = [];
    const quantities = [];

    this.dashboardService.fetchStockInInventory(this.formObj, this.supplierIDName).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.monthAndProductQuantityMap) {
          labels = Object.keys(response.data.monthAndProductQuantityMap);
          data = Object.values(response.data.monthAndProductQuantityMap);
          data.forEach(product => {
            quantities.push(product.availableQuantity);
            this.quantitiesArray.push(product.availableQuantity);

          });
          labels.forEach(x => {
            this.stockInInventoryLabels.push(x);
            this.productIDNameArray.push(x);
            this.productIDNameArray.push(this.quantitiesArray);


          })
          const resData = [];
          resData.push(quantities);
          this.stockInInventoryData = resData;
        }
        else {
          this.stockInInventoryData = [];
        }
      },
      (error) => {
      });
  }
  expandToggle(data) {
    data.isToggle = !data.isToggle;
  }
  expandToggle1(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  getNotifications() {
    this.metaDataService.fetchAllNotifications(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.notificationsResponseList.length > 0) {
        this.notificationDataList = res.data.notificationsResponseList;
        this.viewAllNotifications = this.notificationDataList;
        if (this.notificationDataList[5].notificationMessages && this.notificationDataList[5].notificationMessages.length != 0) {
          this.notificationDataList[5].notificationMessages.forEach(ele => {
            ele['isToggle'] = false;
          });
        }
        if (this.notificationDataList[6].notificationMessages && this.notificationDataList[6].notificationMessages.length != 0) {
          this.notificationDataList[6].notificationMessages.forEach(ele => {
            ele['isToggle'] = false;
          });
        }
        if (this.viewAllNotifications[5].notificationMessages && this.viewAllNotifications[5].notificationMessages.length != 0) {
          this.viewAllNotifications[5].notificationMessages.forEach(ele => {
            ele['isViewToggle'] = false;
          });
        }
        if (this.viewAllNotifications[6].notificationMessages && this.viewAllNotifications[6].notificationMessages.length != 0) {
          this.viewAllNotifications[6].notificationMessages.forEach(ele => {
            ele['isViewToggle'] = false;
          });
        }
      }
      else {
        this.notificationDataList = [];
        this.viewAllNotifications = [];
      }
    })
  }
  openCreateModal() {
    this.showHelpFileData();
    this.ngxSmartModalService.getModal('openModal').open();
  }
  showHelpFileData() {
    const url = '/homepage'
    switch (url) {
      case '/homepage':
        this.changeFileData = HOMEPAGE_HELP_FILE.HOMEPAGE;
        break;
      default:
        this.changeFileData = {};
    }
  }
  zoneNameArrayList: any = []
  fetchZonesCapacity() {
    const data = {};
    data['organizationIDName'] = this.formObj.organizationIDName;
    data['wareHouseIDNames'] = [this.formObj.wareHouseIDName];
    data['supplierIDNames'] = this.supplierIDName ? [this.supplierIDName] : null;
    this.dashboardService.fetchSpaceUtilisationForGraphy(data).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zoneSpaceUtilizations) {
          const finalArray = response.data.zoneSpaceUtilizations;
          this.zoneNameArrayList = [];
          finalArray.forEach(element => {
            let obj = {};
            obj['zoneName'] = element.zoneName;
            obj['locationDimensionsResponse'] = element.locationDimensionsResponse;
            obj['zoneDashboard'] = [];
            if (element.spaceUtilizationResponses && element.spaceUtilizationResponses.length > 0) {
              element.spaceUtilizationResponses.forEach(el => {
                if (el.locationSpaceStatus == 'Completely Available') {
                  obj['zoneDashboard'].push({ name: 'Completely Available', value: el.locationsCount })
                }
                else {
                  obj['zoneDashboard'].push({ name: 'Completely Available', value: 0 })
                }
                if (el.locationSpaceStatus == 'Partially Available') {
                  obj['zoneDashboard'].push({ name: 'Partially Available', value: el.locationsCount })
                }
                else {
                  obj['zoneDashboard'].push({ name: 'Partially Available', value: 0 })
                }
                if (el.locationSpaceStatus == 'UnAvailable') {
                  obj['zoneDashboard'].push({ name: 'UnAvailable', value: el.locationsCount })
                }
                else {
                  obj['zoneDashboard'].push({ name: 'UnAvailable', value: 0 })
                }
              });
            }
            this.zoneNameArrayList.push(obj);
          });
        }
      },
      (error) => {
      });
  }
  marqueeSpeed: number = 3;

  pauseMarquee() {
    this.marqueeSpeed = 0;
  }
  resumeMarquee() {
    this.marqueeSpeed = 3;
  }
  getRole() {
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      this.role = user.authorities[0].authority;
      this.getFooterLinksWithRoutes();
    }
  }
  getFooterLinksWithRoutes() {
    const userMasters = this.configService.getModulesList('mainFunctionalitiesForMasters');
    const userReports = this.configService.getModulesList('reportsFunctionalities');
    const userDashboards = this.configService.getModulesList('kpiConfigurationFunctionalities');
    if (userMasters && userMasters[0] && userMasters[0].subFunctionalities[0]) {
      const defaultReport = userMasters[0].subFunctionalities[0];
      for (let i = 0; i < MasterDataNavConstants.length; i++) {
        if (MasterDataNavConstants[i].name === defaultReport.name) {
          this.footerLinks.push({ name: 'Master data', route: MasterDataNavConstants[i].route });
          break;
        }
      }
    }
    else {
      if (this.role == 'ROLE_CLIENT') {
        this.footerLinks.push({ name: 'Master data', route: '/masterdata/warehouse' })
      }
    }

    if (this.role && ['ROLE_SUPER_ADMIN'].includes(this.role)) {
      this.footerLinks.push({ name: 'Reports', route: '/reports/goodsReceiving' });
    }
    else {
      if (userReports && userReports[0] && userReports[0].subFunctionalities[0]) {
        const defaultReport = userReports[0].subFunctionalities[0];
        const reportNames = [];
        userReports.forEach(report => {
          const reportSubFunctionalities = report.subFunctionalities;
          reportSubFunctionalities.forEach(e => {
            reportNames.push(e)
          })
        })
        for (let i = 0; i < ReportsNavConstants.length; i++) {
          const reportName = reportNames.find(x => x.name == ReportsNavConstants[i].name);
          if (reportName) {
            const permissionsArray = reportName.permissions;
            if (permissionsArray && permissionsArray.length > 0) {
              const permissionObj = permissionsArray.find(x => x.permissionName == "View");
              if (permissionsArray && permissionsArray.length > 0 && permissionObj && permissionObj.permissionName == "View") {
                if (ReportsNavConstants[i].name === defaultReport.name) {
                  this.footerLinks.push({ name: 'Reports', route: ReportsNavConstants[i].route });
                  break;
                }
              }
            }
          }

        }
      }
    }

    if (this.role && ['ROLE_SUPER_ADMIN'].includes(this.role)) {
      this.footerLinks.push({ name: 'Dashboard', route: '/dashboard/overAllDashboard' });
    }
    else {
      if (userDashboards && userDashboards[0] && userDashboards[0].subFunctionalities[0]) {
        for (let i = 0; i < dashboardsNavConstants.length; i++) {
          const reportName = userDashboards.find(x => x.name == dashboardsNavConstants[i].name);
          if (reportName) {
            reportName['permissions'] = (reportName.subFunctionalities.length > 0) ? [{ _id: null, permissionName: 'View' }] : []
            const permissionsArray = reportName.permissions;
            if (permissionsArray && permissionsArray.length > 0) {
              const permissionObj = permissionsArray.find(x => x.permissionName == "View");
              if (permissionsArray && permissionsArray.length > 0 && permissionObj && permissionObj.permissionName == "View") {
                if (dashboardsNavConstants[i].name === userDashboards[0].name) {
                  this.footerLinks.push({ name: 'Dashboard', route: dashboardsNavConstants[i].route });
                  break;
                }
              }
            }
          }

        }
      }
    }
    if (this.role && ['ROLE_SUPER_ADMIN'].includes(this.role)) {
      this.footerLinks.push({ name: 'Configurations', route: '/config/parameters' });
    }
    else {
      let arr: any = [];
      let indexValue: any = -1;
      if (this.userDetails && this.userDetails.userPermissionFunctionalityInfo &&
        this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.length > 0) {
        const modulesList = this.userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.find(x =>
          x.organizationInfo.organizationIDName == this.configService.organizationValue && x.wareHouseInfo.wareHouseIDName == this.configService.wareHouseValue);
        if (modulesList && modulesList['mainFunctionalities'] && modulesList['mainFunctionalities'].length > 0) {
          arr = modulesList['mainFunctionalities'];
          indexValue = arr.findIndex(x => x.name === 'Configurations');
        }
        else if (this.role && ['ROLE_CLIENT'].includes(this.role)) {
          this.footerLinks.push({ name: 'Configurations', route: '/config/parameters' });
        }
      }
      else if (this.role && ['ROLE_CLIENT'].includes(this.role)) {
        this.footerLinks.push({ name: 'Configurations', route: '/config/parameters' });
      }
      if (indexValue != -1) {
        const defaultReport = arr[indexValue].subFunctionalities[0];
        for (let i = 0; i < ConfigurationNavConstants.length; i++) {
          if (ConfigurationNavConstants[i].name === defaultReport.name) {
            this.footerLinks.push({ name: 'Configurations', route: ConfigurationNavConstants[i].route });
            break;
          }
        }
      }
    }
  }
}
