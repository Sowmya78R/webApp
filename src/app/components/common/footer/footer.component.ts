import { Component, OnInit } from '@angular/core';
import { Storage } from '../../../shared/utils/storage';
import { WmsCommonService } from '../../../services/wms-common.service';
import { ConfigurationNavConstants, dashboardsNavConstants, MasterDataNavConstants, ReportsNavConstants } from '../../../constants/nav.constants';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Router } from '@angular/router';
import { InboundProcessService } from 'src/app/services/integration-services/inboundProcess.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styles: ['table,th,td,tr {text-align: left;color:black}']
})
export class FooterComponent implements OnInit {

  callingPicking = false;
  callingPutaway = true;
  footerLinks: any = [];
  filteredFooterLinks: any = [];
  role: any;
  user: any;
  locations: any;
  putaways: any;
  pickings: any;
  pickingsList: any = [];
  putawaysLst: any = [];
  products: any[];
  isStatusUpdated: any = false;
  wmpoNo: any;
  formObj = this.configService.getGlobalpayload();
  putawayChartData: any = [];
  deafultColor: string = '#ffff'
  userDetails: any = JSON.parse(sessionStorage.getItem('dli-wms-user'));
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  footerImg = this.configService.getThemeContent('Home Page Footer Image');
  HomePageTitlecolor = this.configService.getThemeContent('Home Page Title color');
  footerMenuFontColor = this.configService.getThemeContent('Footer Menu Font Color');

  logoImage: any;

  constructor(private router: Router, private metaDataService: MetaDataService,
    private wmsService: WMSService, public ngxSmartModalService: NgxSmartModalService,
    private configService: ConfigurationService,
    private translate: TranslateService) {
    this.translate.use(this.language);
  }
  ngOnInit() {
    this.getRole();

    if (this.footerImg) {
      const fileNames = JSON.parse(JSON.stringify(this.footerImg));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        this.logoImage = 'data:text/plain;base64,' + data['data']['resource'];
      });
    }

    // this.fetchAllEmployeeViewForPutAway();
    this.fetchAllProducts();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })

  }
  getBackground() {
    if (this.logoImage) {
      return `url(${this.logoImage})`
    }
    else {
      return `url(assets/bttmMenuBG.jpg);`
    }
  }
  fetchAllProducts() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
        } else {
          this.products = [];
        }
      },
      (error) => {
        this.products = [];
      });
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
  getRoutingEmployeeView(data) {
    this.router.navigate([data.route]);
    // if (data.name == 'Employee View') {
    //   this.fetchAllEmployeeViewForPutAway()
    //   this.openModalPopup()
    // }
    // else {
    //   this.router.navigate([data.route])
    // }
  }
  // openModalPopup() {
  //   this.ngxSmartModalService.getModal('footerPage').open();
  // }
  getRole() {
    this.user = Storage.getSessionUser();
    if (this.user && this.user.authorities && this.user.authorities[0] && this.user.authorities[0].authority) {
      this.role = this.user.authorities[0].authority;
      this.getFooterLinksWithRoutes();
    }
  }
  visibletruecomplete = true;
  visibletrueincomplete = false;

  }
