import { Component, OnInit, Output, Input, OnChanges, EventEmitter, Injector, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Storage } from '../../../shared/utils/storage';
import { AppService } from '../../../shared/services/app.service';
import { ApexService } from '../../../shared/services/apex.service';
import { WmsCommonService } from '../../../services/wms-common.service';
import { AuthReqService } from '../../../services/integration-services/auth-req.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { MasterDataNavConstants, ReportsNavConstants, dashboardsNavConstants, ConfigurationNavConstants } from 'src/app/constants/nav.constants';



@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styles: [`.active{
    color: green!important;
    border-top-left-radius: 5px!important;
  border-top-right-radius: 5px!important;
  }
`]
})

export class NavBarComponent implements OnInit, OnChanges {
  @ViewChild('openModal') openModel;
  @Input() helpData: any;
  changeFileData: any;
  navHelpFileData: any;
  navLinks: any = [];
  userData: any;
  userDetails: any = {
    firstName: '',
    lastName: ''
  };
  subscriptionValue: Subscription[] = [];
  deafultColor: string = '#000';
  deafultColorCombo: string = '#fff';
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  inventorySubMenus: any = null;
  scheduleSubMenus: any = null;
  footerImg = this.configService.getThemeContent('Menu Page Footer Image');
  homeTitle = this.configService.getThemeContent('Home Page Title');
  homeTextColor = this.configService.getThemeContent('Home Page Title color');
  HeaderImg = this.configService.getThemeContent('Home Page Header Image');
  subMenuImg: any;
  footerLinks: any = [];
  role: any = null;
  homeTitletext: any = 'Warehouse Management'

  arr = [{ name: 'Workforce Picking', link: 'pickingPlanning' }, { name: 'Workforce Putaway', link: 'putawayPlanning' },
  { name: 'Workforce Internal Transfer', link: 'internalTransferPlanning' }, { name: 'Workforce Packing', link: 'packingPlanning' },
  { name: 'Workforce Re Packing', link: 'rePackingPlanning' }, { name: 'Workforce Co Packing', link: 'coPackingPlanning' },
  { name: 'Workforce Labelling', link: 'labellingPlanning' },
  { name: 'Workforce Loading', link: 'loadingPlanning' },
  { name: 'Workforce Unloading', link: 'unloadingPlanning' }];

  inArr: any = [{ name: 'Inventory', link: 'inventoryTables' }, { name: 'Inventory by Location', link: 'inventoryByLocation' },
  { name: 'Inventory by Product', link: 'inventoryByProduct' },
  { name: 'Inventory Item Totals', link: 'inventoryproductTotals' },
  { name: 'Inventory Transactions', link: 'inventoryTransaction' },
  { name: 'Inventory Transactions Details', link: 'inventoryTransactionDetails' },
  { name: 'Over All Inventory', link: 'overAllInventory' }]
  constructor(
    private appService: AppService, public configService: ConfigurationService,
    private apexService: ApexService, private router: Router,
    public injector: Injector,
    private toastr: ToastrService, public ngxSmartModalService: NgxSmartModalService,
    private commonMasterDataService: CommonMasterDataService,
    private authReqService: AuthReqService, private translate: TranslateService,
    private el: ElementRef, private renderer: Renderer2,
    private wmsCommonService: WmsCommonService, private metaDataService: MetaDataService) { }


  deafultColorWareHouseManagement: string = '#fff'

  organizationFontColor = this.configService.getThemeContent('Organization Font Color');

  logoIcon = this.configService.getThemeContent('Menu Page Logo');
  logo1: any = null;
  ssMenu = "";
  /*  globalRoute:any;
   globalRoute1:any;
   globalRoute2:any;
   globalRoute3:any;
   globalRoute4:any; */
  /* private storeCurrentRoute(url: string): void {
    sessionStorage.setItem('currentRoute', url);
    console.log(url)
    let splitUrl = url.split("/")
    this.globalRoute = splitUrl[0];
    this.globalRoute1 = splitUrl[1];
    this.globalRoute2 = splitUrl[2];
    this.globalRoute3 = splitUrl[3];
    this.globalRoute3 = splitUrl[3];
  } */

  ngOnInit() {
    /*  this.router.events
     .pipe(filter(event => event instanceof NavigationEnd))
     .subscribe((event: NavigationEnd) => {
       this.storeCurrentRoute(event.urlAfterRedirects);
     }); */


    /*   const storedRoute = sessionStorage.getItem('currentRoute');
      console.log('Stored Route:', storedRoute);
      this.globalRoute = storedRoute;
      console.log(this.globalRoute); */

    this.fetchLogo();
    this.getNavLinksWithRoutes();
    this.getRole();
    this.userDetails = Storage.getSessionItem('userDetails');
    if (this.footerImg) {
      const fileNames = JSON.parse(JSON.stringify(this.footerImg));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.subMenuImg = 'data:text/plain;base64,' + data['data']['resource'];
      });
    }
    if (this.logoIcon) {
      const fileNames = JSON.parse(JSON.stringify(this.logoIcon));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.logo1 = 'data:text/plain;base64,' + data['data']['resource'];
        this.logo1 = this.metaDataService.dataURLtoFile(this.logo1, fileNames);
        this.metaDataService.imgGlobalChanged(this.logo1, 'logo1', true);
      });
    }
    if (this.HeaderImg) {
      const fileNames = JSON.parse(JSON.stringify(this.HeaderImg));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.logoImage = 'data:text/plain;base64,' + data['data']['resource'];
        // this.logoImage = this.metaDataService.dataURLtoFile(this.logoImage, fileNames);
        // this.metaDataService.imgGlobalChanged(this.logoImage, 'logoImage', true);
      });
    }

    if (this.homeTitle) {
      this.homeTitletext = this.homeTitle
    }
    // this.displaySubmenus();
  }
  ngOnChanges(changes: any) {
    if (changes['helpData'] && this.helpData) {
      this.changeFileData = this.helpData;
    }
  }
  shiftView(i, count) {
    if ((i == 1) && count > 6) {
      return '-118px';
    }
    if ((i == 2) && count > 6) {
      return '-221px';
    }
    if ((i == 3) && count > 6) {
      return '-324px';
    }
    if ((i == 4) && count > 6) {
      return '-412px';
    }
    if ((i == 5) && count > 6) {
      return '-500px';
    }
    if ((i > 5) && count > 6) {
      return '-1025px';
    }
    else {
      return '0px';
    }
  }

  isActive(base: string) {
    base = base.split('/')[2];
    if ((this.router.url.includes(`wareHouseTransfer`) || this.router.url.includes(`purchaseReturns`) || this.router.url.includes(`issueInventory`)) && base == ('inventory' || 'inbound' || 'outbound' || 'planning')) {
      return 'active'
    }
    else {
      return this.router.url.includes(`${base}/`);
    }
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
  // isActive1(base: string) {
  //   base = base.split('/')[2];
  //   this.router.url.includes(`${base}/`);
  //   if (this.router.url.includes(`wareHouseTransfer`) && base == 'inventory') {
  //     return 'active'
  //   }
  // }
  /*
  isSubMenuActive(url:string){
    if(url && url.split('/')[3]){

    url=url.split('/')[3];
    }
    return this.router.url.includes(`/${url}`);
  } */
  useLanguage(language) {
    console.log(language);
    this.configService.forLanguage.next(language);
    this.configService.language = language;
    console.log(this.configService.language);
    this.direction = (language == 'ar') ? "rtl" : "ltr";
    this.translate.use(this.configService.language);
  }
  openCreateModal() {
    const myService = this.injector.get(NgxSmartModalService);
    debugger
    myService.getModal('openModal').open();

  }
  getNavLinksWithRoutes() {
    this.navLinks = this.wmsCommonService.getNavigationLinksWithRoutes(this.configService.getModulesList('mainFunctionalities'));
    const removeIndex = this.navLinks.findIndex(x => x.name === 'Configurations');
    if (this.navLinks.length > 0 && removeIndex != -1) {
      const arr = this.navLinks.splice(removeIndex, 1);
    }
    const warehouseFindIndex = this.navLinks.findIndex(x => x.name == 'Layout');
    if (warehouseFindIndex != -1) {
      this.navLinks[warehouseFindIndex].subFunctionalities = [
        {
          "name": "Layout", "permissions": this.navLinks[warehouseFindIndex].permissions,
          content: "Visibility of available Inventory in locations.",
          "route": "/warehouseLayout"
        }
      ]
    }
    const wFIndex = this.navLinks.findIndex(x => x.name == 'Workforce')
    if (wFIndex != -1) {
      this.scheduleSubMenus = null;
      const BEWFArray = this.navLinks[wFIndex];
      const tasksLocalPer = BEWFArray.subFunctionalities.find(x => x.name == 'Employee Tasks')
      const scheduleLocalPer = BEWFArray.subFunctionalities.find(x => x.name == 'Workforce Picking' || x.name == 'Workforce Putaway' || x.name == 'Workforce Internal Transfer' || x.name == 'Workforce Packing' || x.name == 'Workforce Re-Packing' || x.name == 'Workforce Co-Packing' || x.name == 'Workforce Labeling' || x.name == 'Workforce Loading' || x.name == 'Workforce Unloading')
      const performanceLocalPer = BEWFArray.subFunctionalities.find(x => x.name == 'Employee Performance')
      this.navLinks[wFIndex].subFunctionalities = [];
      if (scheduleLocalPer) {
        this.scheduleSubMenus = this.arr.find(x => x.name == scheduleLocalPer.name).link;
        this.navLinks[wFIndex].subFunctionalities.push({
          "name": "Employee Schedule", "permissions": scheduleLocalPer ? scheduleLocalPer.permissions : [],
          content: "Visibility of available Inventory in locations.",
          "route": "v1/workforce/employeeSchedule"
        })
      }
      if (performanceLocalPer) {
        this.navLinks[wFIndex].subFunctionalities.push({
          "name": "Employee Performance", "permissions": performanceLocalPer ? performanceLocalPer.permissions : [],
          content: "Visibility of available Inventory in locations.",
          "route": "v1/workforce/employeePerformance"
        })
      }
      if (tasksLocalPer) {
        this.navLinks[wFIndex].subFunctionalities.push({
          "name": "Employee Tasks", "permissions": tasksLocalPer ? tasksLocalPer.permissions : [],
          content: "Visibility of available Inventory in locations.",
          "route": "v1/workforce/employeeTask"
        })
      }
    }
    const inventoryIndex = this.navLinks.findIndex(x => x.name == 'Inventory');
    if (inventoryIndex != -1) {
      const subMenus = [];
      this.inventorySubMenus = null;
      const overAllArray = this.navLinks[inventoryIndex];
      overAllArray.subFunctionalities.forEach(element => {
        if (element.name == "Inventory" || element.name == "Inventory by Location" || element.name == "Inventory by Product"
          || element.name == "Inventory Item Totals" || element.name == "Inventory Transactions" || element.name == "Inventory Transactions Details" || element.name == "Over All Inventory") {
          const names = subMenus.map(x => x.name);
          if (!(names.length > 0 && names.includes('Inventory'))) {
            this.inventorySubMenus = this.inArr.find(x => x.name == element.name).link;
            subMenus.push({
              "name": "Inventory", "permissions": element.permissions,
              content: "View Available Inventory in locations by storage unit.",
              "route": "/v1/inventory/lists"
            })
          }
        }
        else {
          subMenus.push(element);
        }
      });
      this.navLinks[inventoryIndex].subFunctionalities = subMenus;
    }
    this.userData = Storage.getSessionUser();
    this.ssMenu = sessionStorage.getItem('module');
    // let index = this.navLinks.findIndex(x => x.name == this.ssMenu);
    // this.displaySubmenus();
    /* if(index != -1) {
      let submenu = this.el.nativeElement.querySelector('#subMenus0'+index);
      submenu.style.display = '-webkit-box';
      if(submenu.style.display === '-webkit-box' ) {
        this.renderer.setStyle(submenu, 'position', 'absolute')
        this.renderer.setStyle(submenu, 'margin-left', '0px')
        this.renderer.setStyle(submenu, 'margin-top', '0px')
        this.renderer.setStyle(submenu, 'width', 'max-content')
      }
    } */
  }

  ngAfterViewInit(val) {
    /*  console.log(sessionStorage.getItem('menuName')); */
    this.displaySubmenus();
  }
  getOrgandWareChanged(event) {
    this.configService.setWareHouseRelatedorg(event);
    this.configService.forPermissions.next(true);
    (this.router.url.includes('masterdata')) ? this.configService.forMaster.next(true) : '';
    (this.router.url.includes('config')) ? this.configService.forParameters.next(true) : '';
    this.getNavLinksWithRoutes();
  }
  getwareHouseValue(data) {
    this.configService['newDropDownValue'] = data;
  }
  displaySubMDefault = false;
  displaySubmenus() {
    this.ssMenu = sessionStorage.getItem('module');
    this.displaySubMDefault = false;


    /*  console.log(this.getNavBaarValue); */

    /* for(let i=0; i<this.navLinks[i].subFunctionalities[i].route.length; i++) {
     if(this.navLinks[i].subFunctionalities[i].route === this.getNavBaarValue)
     {
      alert();
     }
    } */
    /*   this.navLinks.forEach(ele =>{
        console.log(ele.subFunctionalities.forEach(innerElement =>{
          const getNavBaarValue = sessionStorage.getItem("routeSubMenu")
          if(innerElement.route === getNavBaarValue){

          }
        })
      })
   */

    /*   this.navLinks.forEach((process, i) => {
        process.subFunctionalities.forEach((innerElement,k) => {
          const getNavBaarValue = sessionStorage.getItem("routeSubMenu")
            if (innerElement.route === getNavBaarValue) {
              console.log(innerElement.route +  "===" + getNavBaarValue)
             let submenu = document.querySelector<HTMLInputElement>("#submenuLiA");
              console.log(submenu);
              submenu.style.color = 'green';
            }
        });
      }); */


    for (let i = 0; i < this.navLinks.length; i++) {
      if (this.navLinks[i].name == 'Barcode') {
        let submenu = this.el.nativeElement.querySelector('#subMenus' + i);
        this.renderer.setStyle(submenu, 'position', 'absolute')
        this.renderer.setStyle(submenu, 'left', '-230px')
        this.renderer.setStyle(submenu, 'margin-top', '0px')
        this.renderer.setStyle(submenu, 'width', 'max-content')
      }
      let submenu = this.el.nativeElement.querySelector('#subMenus' + i);
      submenu.style.display = (submenu.style.display = 'none');
      if (this.navLinks[i].name == this.ssMenu) {
        this.displaySubMDefault = true;
        let submenu = this.el.nativeElement.querySelector('#subMenus' + i);
        // let colorSubmenu = this.el.nativeElement.querySelector('#submenuLiA'+i);
        // colorSubmenu.style.color = 'green';
        submenu.style.display = (submenu.style.display === 'none' ? '-webkit-box' : 'none');
        if (submenu.style.display === '-webkit-box') {
          this.renderer.setStyle(submenu, 'position', 'absolute')
          this.renderer.setStyle(submenu, 'margin-left', '0px')
          this.renderer.setStyle(submenu, 'margin-top', '0px')
          this.renderer.setStyle(submenu, 'width', 'max-content')
        }
      } else {
        let submenu = this.el.nativeElement.querySelector('#subMenus' + i);
        submenu.style.display = (submenu.style.display = 'none');
      }


    };

  }
  getNavBaarValue: any;


  checkSubMenuLength(navLink, id) {
    /*  console.log(this.navLinks) */
    if (navLink.subFunctionalities.length == 1) {
      this.redirectToSpecificPage(navLink.subFunctionalities[0].route);
    }
    sessionStorage.setItem('module', navLink.name);
    // this.subMenuFor(id);
  }
  subMenuFor(id) {
    let submenu = this.el.nativeElement.querySelector('#submenuLiA');
    /*  console.log(submenu); */
    submenu.style.color = '#f3476f';
  }
  redirectToSpecificPage(route) {
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
      if (route === '/v1/inventory/lists') {
        this.appService.navigate(route + '/' + this.inventorySubMenus, null);
      }
      else if (route === 'v1/workforce/employeeSchedule') {
        this.appService.navigate(route + '/' + this.scheduleSubMenus, null);
      }
      else {
        this.appService.navigate(route, null);
      }
      // this.appService.navigate(route, null);
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
  logout() {
    const accessToken = Storage.getAccessToken();
    if (accessToken) {
      this.authReqService.logout(accessToken).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.status === 'true') {
            this.toastr.success('Logged successfully');
            Storage.clearSession();
            this.apexService.sessionUserEmit('');
            this.appService.navigate('/login', null);
            this.configService.organizationValue = null;
            this.configService.wareHouseValue = null;
            this.configService.organizationDropdown = [];
            this.configService.wareHouseDropdown = [];
            this.configService.userDetails = null;
          } else {
            this.toastr.error('Failed in logging out');
          }
        },
        (error) => {
        });
    }
  }
  formObj = this.configService.getGlobalpayload();
  logoList = { "_id": null, "logoName": null };
  logoImage: any;
  fetchLogo() {
    this.metaDataService.getAllLogos(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.logos) {
        this.logoList = res.data.logos[0];
        if (this.logoList) {
          const fileNames = JSON.parse(JSON.stringify(this.logoList.logoName));
          this.metaDataService.viewImages(fileNames).subscribe(data => {
            this.logoImage = 'data:text/plain;base64,' + data['data']['resource'];
            this.logoImage = this.metaDataService.dataURLtoFile(this.logoImage, fileNames);
            this.metaDataService.imgGlobalChanged(this.logoImage, 'logoImage', true);
          });
        }
      }
      else {
        this.logoList = { "_id": null, "logoName": null };
      }
    })
  }
}
