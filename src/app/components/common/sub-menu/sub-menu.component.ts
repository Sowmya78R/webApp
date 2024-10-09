import { Component, OnInit, OnChanges, ElementRef, Renderer2 } from '@angular/core';
import { Storage } from '../../../shared/utils/storage';
import { WmsCommonService } from '../../../services/wms-common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../../../shared/services/app.service';
import { ApexService } from '../../../shared/services/apex.service';
import { ToastrService } from 'ngx-toastr';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HELP_FILE, SUBMENU_HELP_FILE } from 'src/app/constants/helpfile';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { MasterDataNavConstants, ReportsNavConstants, dashboardsNavConstants, ConfigurationNavConstants } from 'src/app/constants/nav.constants';


@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styles: [`#inTop .inMenus .inMenusRightSide ul li a{
  display: inline-block!important;
  padding: 12px 18px 28px 22px!important;
  margin: -5px 3px!important;
    height: 39px!important;
    color: white!important;
  }
  #inTop .inMenus .inMenusRightSide ul li:hover a{
    display: inline-block!important;
    padding: 12px 18px 28px 22px!important;
  margin: -5px 3px!important;
    height: 39px!important;

    color:black!important;
  }
  #inTop .inMenus .inMenusRightSide ul li a.active{
    display: inline-block!important;
    padding: 12px 18px 28px 22px!important;
  margin: -5px 3px!important;
    height: 30px!important;
    color:black!important;
  }
  .inMenusRightSide {
  padding-top: 35px!important;
  padding: 12px 8px 36px 16px!important;
}
  .active{
    background-color:white;
    border-top-left-radius: 5px;
  border-top-right-radius: 5px;

} #inTop .inMenus .inMenusRightSide ul li a.active img.menuColrIcon {
  display: inline-block;
}
#inTop .inMenus .inMenusRightSide ul li a.active img.menuWhiteIcon {
  display: none;
}`]
})
export class SubMenuComponent implements OnInit {
  navLinks: any = [];
  subMenus: any = [];
  footerLinks: any = [];
  role:any=null;
  currentProcess: any;
  userData: any;
  userDetails: any = {
    firstName: '',
    lastName: ''
  };
  navigationSubscription: any;
  deafultColor: string = '#000';
  deafultColorCombo: string = '#fff';
  changeFileData: any;
  hideNav = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  footerImg = this.configService.getThemeContent('Menu Page Footer Image');
  subMenuImg: any;
  homeTitle = this.configService.getThemeContent('Home Page Title');
  homeTextColor = this.configService.getThemeContent('Home Page Title color');
  homeTitletext: any = 'Warehouse Management'
  logoIcon = this.configService.getThemeContent('Menu Page Logo');
  logo1: any = null;
  organizationFontColor = this.configService.getThemeContent('Organization Font Color');
  constructor(
    private wmsCommonService: WmsCommonService, public configService: ConfigurationService,
    private toastr: ToastrService, public ngxSmartModalService: NgxSmartModalService,
    private appService: AppService, private metaDataService: MetaDataService,
    private apexService: ApexService,
    private router: Router,
    private activatedRoute: ActivatedRoute, private el: ElementRef, private renderer: Renderer2,
    private commonMasterDataService: CommonMasterDataService, private translate: TranslateService) {
      this.translate.use(this.language);
    }

  ngOnInit() {
    this.showHelpFileData(this.router.url);
    this.getNavLinksWithRoutes();
    this.getRole();
    this.userDetails = Storage.getSessionItem('userDetails');
    if (this.footerImg) {
      const fileNames = JSON.parse(JSON.stringify(this.footerImg));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.subMenuImg = 'data:text/plain;base64,' + data['data']['resource'];
        /*  console.log(this.subMenuImg); */
      });
    }
    if (this.homeTitle) {
      this.homeTitletext = this.homeTitle
    }
    if (this.logoIcon) {
      /*  console.log(this.logoIcon) */
      const fileNames = JSON.parse(JSON.stringify(this.logoIcon));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.logo1 = 'data:text/plain;base64,' + data['data']['resource'];
        this.logo1 = this.metaDataService.dataURLtoFile(this.logo1, fileNames);
        this.metaDataService.imgGlobalChanged(this.logo1, 'logo1', true);
      });
    }
  }

  hover: boolean = false;

  defaultStyle = {
    // default styles when not hovering
    'color': 'white',
    'background-color': 'white'
  };

  ngAfterViewInit(val) {
    /*   console.log(sessionStorage.getItem('menuName')); */
    this.displaySubmenus();
  }
  ssMenu = "";
  displaySubMDefault = false;
  displaySubmenus() {
    this.ssMenu = sessionStorage.getItem('module');

    this.displaySubMDefault = false;
    for (let i = 0; i < this.navLinks.length; i++) {
      if (this.navLinks[i].name == this.ssMenu) {
        this.displaySubMDefault = true;
        let submenu = document.querySelector<HTMLInputElement>("#anchorPart" + i);
        submenu.style.color = 'black'
      }
    };
  }

  hoveredStyle = {
    // styles to apply when hovering
    'color': 'white',
    'background-color': 'blue'
  };
  useLanguage(language) {
    this.configService.forLanguage.next(language);
    this.configService.language = language;
    this.direction = (language == 'ar') ? "rtl" : "ltr";
    this.translate.use(this.configService.language);
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

  findUserDetailsByEmail() {
    this.commonMasterDataService.fetchUserDetailsByEmail(this.userData.username).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.users) {
          this.userDetails = response.data.users;
        }
      },
      (error) => {

      });
  }
  objectRequest: any = []
  getNavLinksWithRoutes(event?) {
    if (event) { this.configService.setWareHouseRelatedorg(event); }
    this.currentProcess = this.currentProcess || this.activatedRoute.snapshot.paramMap.get('id');
    this.navLinks = this.wmsCommonService.getNavigationLinksWithRoutes(this.configService.getModulesList('mainFunctionalities'));
    if (this.navLinks.length > 0) {
      this.navLinks.forEach(process => {
        if (process.name == 'Layout') {
          process.route = "/warehouseLayout";
        }
        if (this.currentProcess && process.name.toLowerCase() === this.currentProcess) {
          if (this.currentProcess == 'workforce') {
            this.subMenus = [];
            const tasksLocalPer = this.navLinks.find(x => x.name == 'Workforce').subFunctionalities.find(x => x.name == 'Employee Tasks')
            const scheduleLocalPer = this.navLinks.find(x => x.name == 'Workforce').subFunctionalities.find(x => x.name == 'Workforce Putaway' || x.name == 'Workforce Picking' || x.name == 'Workforce Internal Transfer' || x.name == 'Workforce Packing' || x.name == 'Workforce Re-Packing' || x.name == 'Workforce Labeling' || x.name == 'Workforce Loading' || x.name == 'Workforce Unloading' || x.name == 'Workforce Co-Packing' || x.name == 'Employee Schedule')
            const performanceLocalPer = this.navLinks.find(x => x.name == 'Workforce').subFunctionalities.find(x => x.name == 'Employee Performance')
            if (scheduleLocalPer) {
              this.subMenus.push({
                "name": "Employee Schedule", "permissions": scheduleLocalPer ? scheduleLocalPer.permissions : [],
                content: "Assign employees for the operational tasks proactively",
                "route": "v1/workforce/employeeSchedule"
              })
            }
            if (performanceLocalPer) {
              this.subMenus.push({
                "name": "Employee Performance", "permissions": performanceLocalPer ? performanceLocalPer.permissions : [],
                content: "Monitor employee performance with plan versus actuals",
                "route": "v1/workforce/employeePerformance"
              })
            }
            if (tasksLocalPer) {
              this.subMenus.push({
                "name": "Employee Tasks", "permissions": tasksLocalPer ? tasksLocalPer.permissions : [],
                content: "Manage tasks assigned to individuals and complete operations",
                "route": "v1/workforce/employeeTask"
              })
            }
          }
          else if (this.currentProcess == 'layout') {
            process.route = "/warehouseLayout"
          }
          else if (this.currentProcess == 'inventory') {
            this.subMenus = [];
            const overAllArray = this.navLinks.find(x => x.name == "Inventory");
            overAllArray.subFunctionalities.forEach(element => {
              if (element.name == "Inventory" || element.name == "Inventory by Location" || element.name == "Inventory by Product"
                || element.name == "Inventory Item Totals" || element.name == "Inventory Transactions" || element.name == "Inventory Transactions Details" || element.name == "Over All Inventory") {
                const names = this.subMenus.map(x => x.name);
                if (!(names.length > 0 && names.includes('Inventory'))) {
                  this.subMenus.push({
                    "name": "Inventory", "permissions": element.permissions,
                    content: "View Available Inventory in locations by storage unit.",
                    "route": "/v1/inventory/"
                  })
                }
              }
              else {
                this.subMenus.push(element);
              }
            });
          }
          else {
            this.subMenus = process.subFunctionalities;
          }
        }
      });
    }
  }
  showHelpFileData(url: any) {
    switch (url) {
      case '/subMenu/inbound':
        this.changeFileData = SUBMENU_HELP_FILE.INBOUND;
        break;
      case '/subMenu/outbound':
        this.changeFileData = SUBMENU_HELP_FILE.OUTBOUND;
        break;
      case '/subMenu/billing':
        this.changeFileData = SUBMENU_HELP_FILE.BILLING;
        break;
      case '/subMenu/inventory':
        this.changeFileData = SUBMENU_HELP_FILE.INVENTORY;
        break;
      case '/subMenu/planning':
        this.changeFileData = SUBMENU_HELP_FILE.PLANNING_SUBMENU;
        break;
      case '/subMenu/quality':
        this.changeFileData = SUBMENU_HELP_FILE.QUALITY;
        break;
      case '/subMenu/accounting':
        this.changeFileData = SUBMENU_HELP_FILE.ACCOUNTING;
        break;
      case '/subMenu/value-added':
        this.changeFileData = SUBMENU_HELP_FILE.VALUEADDEDSERVICE;
        break;
      case '/subMenu/warehouse%20layout':
        this.changeFileData = SUBMENU_HELP_FILE.WAREHOUSELAYOUT_SUBMENU;
        break;
        case '/subMenu/workforce':
          this.changeFileData = SUBMENU_HELP_FILE.WORKFORCE_MODULE_SUBMENU;
          break;
      default:
        this.changeFileData = {};
    }
  }
  openCreateModal() {
    this.showHelpFileData(this.router.url);
    this.ngxSmartModalService.getModal('openModal').open();
  }
  changeProcess(process) {
    this.currentProcess = process.toLowerCase();
    this.router.navigate([`/subMenu/${process.toLowerCase()}`]);
    sessionStorage.setItem('module', process);
    this.getNavLinksWithRoutes();
  }
  logout() {
    Storage.clearSession();
    this.apexService.sessionUserEmit('');
    this.appService.navigate('/login', null);
    this.configService.organizationValue = null;
    this.configService.wareHouseValue = null;
    this.configService.organizationDropdown = [];
    this.configService.wareHouseDropdown = [];
    this.configService.userDetails = null;
  }
  redirectToSpecificPage(route) {
    sessionStorage.setItem('routeSubMenu', route);
    const futureEnchancementRoutes = ['/planning/wavePlanning', '/planning/abcAnalysis', '/inbound/goodsReceivingNote', '/inventory/kanban',
      '/quality/inboundQualityInspection', '/quality/outboundQualityInspection', '/accounting/hoursAccounting',
      '/accounting/expenseAccounting', '/outbound/advanceShipmentNotify', '/returns/outboundReturns', '/inbound/flowThru',
      '/planning/outboundScheduling', '/valueAddedServices'];
    let isPresent = false;
    futureEnchancementRoutes.forEach(routePath => {
      if (routePath === route) {
        isPresent = true;
      }
    });
    if (isPresent) {
      isPresent = false;
      this.toastr.success('Future enchancement');
    } else {
      this.router.navigate([route]);
    }
    this.hideNav = true
  }
  fetchImgSrc(name) {
    return `assets/subMenusIcons/${name}.svg`;
  }
}
