import { Component, OnInit, ChangeDetectorRef, AfterViewChecked, TemplateRef, Input, ViewChild, OnDestroy } from '@angular/core';
import { ApexService } from './shared/services/apex.service';
import { Router, NavigationStart, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { MasterDataNavConstants, ReportsNavConstants, ConfigurationNavConstants } from './constants/nav.constants';
import { ConfigurationService } from './services/integration-services/configuration.service';
import { Storage } from './shared/utils/storage';
import { HELP_FILE, HOMEPAGE_HELP_FILE, SUBMENU_HELP_FILE, REPORTS_HELP_FILE, DASHBOARDS_HELP_FILE } from './constants/helpfile';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { DecimalUtils } from './constants/decimal';
// import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle } from 'ng-apexcharts';
// import { ChartComponent } from 'ng-apexcharts';

// export type ChartOptions = {
//   series: ApexAxisChartSeries;
//   chart: ApexChart;
//   xaxis: ApexXAxis;
//   title: ApexTitleSubtitle;
// };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, AfterViewChecked, OnDestroy {
  // @ViewChild("chart") chart: ChartComponent;
  // public chartOptions: Partial<ChartOptions>;
  title = 'dli-app';
  showLoader: any = true;
  showNavbar: any = false;
  showFooter: any = false;
  isShowMasterMenu: any = false;
  maplocation = [
    '/',
    '/login',
    '/newlogin',
    '/register',
    '/server',
    '/forgotPassword',
    '/updatePassword',
    '/changePassword',
    '/v1/serverError',
    '/homepage',
    '/subMenu/inbound',
    '/subMenu/outbound',
    '/subMenu/returns',
    '/subMenu/planning',
    '/subMenu/quality',
    '/subMenu/inventory',
    '/subMenu/accounting',
    '/subMenu/warehouse%20layout',
    '/subMenu/value%20added%20services',
    '/subMenu/workforce',
    '/subMenu/maintenance',
    '/subMenu/integration',
    '/subMenu/value-added',
    '/subMenu/layout',
    '/subMenu/asset',
    '/subMenu/billing',
    '/subMenu/barcode'
  ];
  path: any;
  masterDatasOrReportsOrConfigData: any = [];
  reportsFunctionalities: any = [];
  mainFunctionalitiesForMasters: any = [];
  role: any;
  userData: any = {};
  pageLevelHelp: any;
  helpFileData = HELP_FILE;
  homeppageHelpFileData = HOMEPAGE_HELP_FILE;
  ReportsHelpFileData = REPORTS_HELP_FILE;
  submenuHelpFileData = SUBMENU_HELP_FILE;
  forPermissionsSubscription: any;
  subscription: Subscription
  browserRefresh: boolean = false;
  constructor(
    private apexService: ApexService,
    private cdRef: ChangeDetectorRef,
    private configService: ConfigurationService, public ngxSmartModalService: NgxSmartModalService,
    public router: Router) {
    this.apexService.showLoader(false);
    this.subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.browserRefresh = !router.navigated;
        if (this.browserRefresh && sessionStorage.getItem('dli-wms-access_token') && sessionStorage.getItem('changedWareHouse')) {
          const warehouse = sessionStorage.getItem('changedWareHouse');
          if (warehouse) {
            this.configService.setWareHouseRelatedorg(warehouse, 'fromApp');
          }
        }
      }
    });
    // this.chartOptions = {
    //   series: [
    //     {
    //       name: "My-series",
    //       data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
    //     }
    //   ],
    //   chart: {
    //     height: 350,
    //     type: "bar"
    //   },
    //   title: {
    //     text: "My First Angular Chart"
    //   },
    //   xaxis: {
    //     categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
    //   }
    // };
  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  ngOnDestroy(): void {
    this.forPermissionsSubscription.unsubscribe();
  }
  ngOnInit() {
    DecimalUtils.initializeDecimalLibrary();
    this.apexService.loaderEventValue.subscribe(data => {
      if (data !== this.showLoader) {
        this.showLoader = data;
      }
    });
    this.cdRef.detectChanges();
    this.onDetectRoute();
    this.forPermissionsSubscription = this.configService.forMaster$.subscribe(data => {
      if (data) {
        if (this.router.url.includes('/masterdata')) {
          this.masterDatasOrReportsOrConfigData = [];
          // this.isShowMasterMenu = true;
          this.getMasterRoutes();
        }
        if (this.router.url.includes('/reports')) {
          this.masterDatasOrReportsOrConfigData = [];
          // this.isShowMasterMenu = true;
          this.getReportsRoutes();
        }
      }
    })
  }
  onDetectRoute() {
    this.router.events.subscribe((event: any) => {
      this.getRole();
      if ((event instanceof NavigationStart)) {
        if (event.url.includes('/masterdata')) {
          this.masterDatasOrReportsOrConfigData = [];
          this.isShowMasterMenu = true;
          this.getMasterRoutes();
        } else if (event.url.includes('/reports')) {
          this.masterDatasOrReportsOrConfigData = [];
          this.isShowMasterMenu = true;
          this.getReportsRoutes();
        } else if (event.url.includes('/config')) {
          this.masterDatasOrReportsOrConfigData = [];
          this.isShowMasterMenu = true;
          this.getConfigRoutes();
        } else {
          this.isShowMasterMenu = false;
        }
        let count = this.maplocation.length;
        for (let i = 0; i < this.maplocation.length; i++) {
          const currentRoute = event.url.includes('?') ? event.url.substring(0, event.url.indexOf('?')) : event.url;
          if (currentRoute && currentRoute === this.maplocation[i]) {
            this.showNavbar = false;
            i = count++;
            break;
          } else {
            this.showNavbar = true;
          }
          this.showHelpFileData(currentRoute);
        }
      }
      if (event instanceof RouteConfigLoadStart) {
        this.showLoader = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.showLoader = false;
      }
      window.scrollTo(0, 0);
    });
  }
  showHelpFileData(url: any) {
    this.submenuHelpFileData = SUBMENU_HELP_FILE;
    this.homeppageHelpFileData = HOMEPAGE_HELP_FILE;
    this.helpFileData = HELP_FILE;
    switch (url) {
      case '/v1/inbound/maintainPurchaseOrder':
        this.pageLevelHelp = HELP_FILE.MAINTAIN_PURCHASEORDER;
        break;
      case '/v1/inbound/createPurchaseOrder':
        this.pageLevelHelp = HELP_FILE.CREATE_PURCHASEORDER;
        break;
      case '/v1/inbound/maintainGoodsReceipt':
        this.pageLevelHelp = HELP_FILE.MAINTAIN_GOODSRECEIVING;
        break;
      case '/v1/inbound/goodsReceipt':
        this.pageLevelHelp = HELP_FILE.CREATE_GOODSRECEIVING;
        break;
      case '/v1/inbound/goods-receiving':
        this.pageLevelHelp = HELP_FILE.CREATE_GOODS_RECEIVING;
        break;
      case '/v1/inbound/editGoodsReceipt':
        this.pageLevelHelp = HELP_FILE.EDIT_GOODS_RECEIVING;
        break;
      case '/v1/inbound/crossDocking':
        this.pageLevelHelp = HELP_FILE.CROSSDOCKING;
        break;
      case '/v1/inbound/putaway':
        this.pageLevelHelp = HELP_FILE.PUTAWAY;
        break;
      case '/v1/outbound/maintainSalesOrder':
        this.pageLevelHelp = HELP_FILE.MAINTAINSALESORDER;
        break;
      case '/v1/outbound/createSalesOrder':
        this.pageLevelHelp = HELP_FILE.CREATESALESORDER;
        break;
      case '/v1/outbound/replenishmentHistory':
        this.pageLevelHelp = HELP_FILE.Replenishment;
        break;
      case '/v1/outbound/picking':
        this.pageLevelHelp = HELP_FILE.PICKING;
        break;
      case '/v1/outbound/maintainShipmentOrder':
        this.pageLevelHelp = HELP_FILE.MAINTAIN_SHIPMENT_ORDER;
        break;
      case '/v1/outbound/maintainInvoicing':
        this.pageLevelHelp = HELP_FILE.MAINTAIN_INVOICING;
        break;
      case '/purchaseReturns':
        this.pageLevelHelp = HELP_FILE.Purchase_Return;
        break;
      case '/v1/inbound/sales-returns':
        this.pageLevelHelp = HELP_FILE.Sales_Return;
        break;
      case '/v1/inventory/lists/inventoryTables':
        this.pageLevelHelp = HELP_FILE.InventoryMain;
        break;
      case '/v1/inventory/lists/inventoryByProduct':
        this.pageLevelHelp = HELP_FILE.InventoryByProduct;
        break;

      case '/v1/inbound/purchase-request':
        this.pageLevelHelp = HELP_FILE.PURCHASE_REQUEST;
        break;
        case '/v1/inbound/goodsReceiptNote':
          this.pageLevelHelp = HELP_FILE.GATE_ENTRY;
          break;
      case '/v1/inventory/lists/inventoryByProduct':
        this.pageLevelHelp = HELP_FILE.InventoryByProduct;
        break;
      case '/v1/inventory/lists/inventoryByProduct':
        this.pageLevelHelp = HELP_FILE.InventoryByProduct;
        break;
      case '/v1/inventory/lists/inventoryByLocation':
        this.pageLevelHelp = HELP_FILE.InventoryByLocation;
        break;
      case '/v1/inventory/lists/inventoryproductTotals':
        this.pageLevelHelp = HELP_FILE.InventoryByProductTotals;
        break;
      case '/v1/inventory/lists/inventoryTransaction':
        this.pageLevelHelp = HELP_FILE.InventoryByTransaction;
        break;
      case '/v1/inventory/lists/inventoryTransactionDetails':
        this.pageLevelHelp = HELP_FILE.InventoryByTransactionDetails;
        break;
        case '/v1/inventory/lists/overAllInventory':
          this.pageLevelHelp = HELP_FILE.InventoryByTransactionDetails;
          break;
      case '/v1/vas/billing-po':
        this.pageLevelHelp = HELP_FILE.BillingPO;
        break;
      case '/v1/vas/billing-po-invoice':
        this.pageLevelHelp = HELP_FILE.BillingPOInvoice;
        break;
      case '/v1/inventory/inventoryTransactionDetails':
        this.pageLevelHelp = HELP_FILE.InventoryByTransactionDetails;
        break;
      case ' /v1/inventory/internalTransfers':
        this.pageLevelHelp = HELP_FILE.Internal_Transfers;
        break;
      case '/v1/inventory/inventoryAdjustments':
        this.pageLevelHelp = HELP_FILE.Internal_Adjustments;
        break;
      case '/v1/inventory/cycleCounting':
        this.pageLevelHelp = HELP_FILE.Cycle_Counting;
        break;
      case '/v1/planning/inboundCapacityPlanning':
        this.pageLevelHelp = HELP_FILE.Inbound_Capacity_Planning;
        break;
        case '/wareHouseTransfer':
        this.pageLevelHelp = HELP_FILE.wareHouseTransfer;
        break;
        case '/createWareHouseTransfer':
        this.pageLevelHelp = HELP_FILE.WT_Create_Order
        break;
        case '/maintainWarehouseTransfer':
          this.pageLevelHelp = HELP_FILE.WT_Order_Summary
          break;
        case '/v1/planning/inboundCapacityPlanning':
        this.pageLevelHelp = HELP_FILE.Inbound_Capacity_Planning;
        break;
      case '/v1/planning/outboundCapacityPlanning':
        this.pageLevelHelp = HELP_FILE.Outbound_Capacity_Planning
        break;
      case '/issueInventory':
        this.pageLevelHelp = HELP_FILE.Issue_Inventory
        break;
      case '/v1/planning/putawayPlanning':
        this.pageLevelHelp = HELP_FILE.Putaway_Planning
        break;
      case '/v1/workforce/employeeSchedule/putawayPlanning':
        this.pageLevelHelp = HELP_FILE.EMPWF_PUTAWAY_PLANNING
        break;
      case '/v1/workforce/employeeSchedule/pickingPlanning':
        this.pageLevelHelp = HELP_FILE.EMPWF_PICKING_PLANNING
        break;
      case '/v1/workforce/employeeSchedule/internalTransferPlanning':
        this.pageLevelHelp = HELP_FILE.EMPWF_INTERNAL_TRANSFER
        break;
      case '/v1/workforce/employeeSchedule/packingPlanning':
        this.pageLevelHelp = HELP_FILE.EMPWF_PACKING
        break;
      case '/v1/workforce/employeeSchedule/rePackingPlanning':
        this.pageLevelHelp = HELP_FILE.EMPWF_RE_PACKING
        break;
      case '/v1/workforce/employeeSchedule/coPackingPlanning':
        this.pageLevelHelp = HELP_FILE.EMPWF_CO_PACKING
        break;
      case '/v1/workforce/employeeSchedule/labellingPlanning':
        this.pageLevelHelp = HELP_FILE.EMPWF_LABELLING
        break;
      case '/v1/workforce/employeeSchedule/loadingPlanning':
        this.pageLevelHelp = HELP_FILE.EMPWF_LOADING
        break;
      case '/v1/workforce/employeeSchedule/unloadingPlanning':
        this.pageLevelHelp = HELP_FILE.EMPWF_UN_LOADING
        break;
      case '/v1/workforce/employeePerformance':
        this.pageLevelHelp = HELP_FILE.EMPWF_EMPLOYEEPERFORMANCE
        break;
      case '/v1/workforce/employeeTask':
        this.pageLevelHelp = HELP_FILE.EMPWF_EMPLOYEE_TASK
        break;
      case '/v1/vas/packing':
        this.pageLevelHelp = HELP_FILE.Packing;
        break;
      case '/v1/vas/re-packing':
        this.pageLevelHelp = HELP_FILE.RePacking;
        break;
      case '/v1/vas/co-packing':
        this.pageLevelHelp = HELP_FILE.CoPacking;
        break;
      case '/v1/vas/labelling':
        this.pageLevelHelp = HELP_FILE.Labeling;
        break;
      case '/v1/planning/pickingPlanning':
        this.pageLevelHelp = HELP_FILE.Picking_Planning;
        break;
      case '/warehouseLayout':
        this.pageLevelHelp = HELP_FILE.WAREHOUSELAYOUT;
        break;
      case '/masterdata/warehouse':
        this.pageLevelHelp = HELP_FILE.Warehouse_Master;
        break;
      case '/masterdata/zone':
        this.pageLevelHelp = HELP_FILE.Zone_Master;
        break;
      case '/masterdata/rack':
        this.pageLevelHelp = HELP_FILE.Rack_Master;
        break;
      case '/masterdata/column':
        this.pageLevelHelp = HELP_FILE.Column_Master;
        break;
      case '/masterdata/level':
        this.pageLevelHelp = HELP_FILE.Level_Master;
        break;
      case '/masterdata/location':
        this.pageLevelHelp = HELP_FILE.Location_Master;
        break;
      case '/masterdata/product':
        this.pageLevelHelp = HELP_FILE.Product_Master;
        break;
      case '/masterdata/supplier':
        this.pageLevelHelp = HELP_FILE.Supplier_Master;
        break;
      case '/masterdata/customer':
        this.pageLevelHelp = HELP_FILE.Customer_Master;
        break;
      case '/masterdata/productBySupplier':
        this.pageLevelHelp = HELP_FILE.Product_by_Supplier_Master;
        break;
      case '/masterdata/productByCustomer':
        this.pageLevelHelp = HELP_FILE.Product_by_Customer_Master;
        break;
      case '/masterdata/putawayStrategy':
        this.pageLevelHelp = HELP_FILE.Putaway_Strategy;
        break;
      case '/masterdata/pickingStrategy':
        this.pageLevelHelp = HELP_FILE.Picking_Strategy;
        break;
      case '/masterdata/productStrategy':
        this.pageLevelHelp = HELP_FILE.Product_Strategy;
        break;
      case '/masterdata/uom-conversion':
        this.pageLevelHelp = HELP_FILE.Uom_Conversion;
        break;
      case '/masterdata/replenishment':
        this.pageLevelHelp = HELP_FILE.Replenishment_MASTER;
        break;
      case '/masterdata/vehicle':
        this.pageLevelHelp = HELP_FILE.Vehicle_Master;
        break;
      case '/masterdata/warehouseTeam':
        this.pageLevelHelp = HELP_FILE.Warehouse_Team_Master;
        break;
      case '/masterdata/equipment':
        this.pageLevelHelp = HELP_FILE.Equipment_Master;
        break;
      case '/masterdata/billOfResources':
        this.pageLevelHelp = HELP_FILE.Bill_of_Resources;
        break;
      case '/masterdata/billToAddress':
        this.pageLevelHelp = HELP_FILE.Bill_to_Address;
        break;
      case '/masterdata/Transporator':
        this.pageLevelHelp = HELP_FILE.Transporter;
        break;
      case '/masterdata/vehicclebytransporator':
        this.pageLevelHelp = HELP_FILE.Vehicle_By_Transporter;
        break;
      case '/masterdata/abcAnalysisClass':
        this.pageLevelHelp = HELP_FILE.ABCXYZ_Master;
        break;
      case '/masterdata/state':
        this.pageLevelHelp = HELP_FILE.State_MASTER;
        break;
      case '/masterdata/productCategoryGroup':
        this.pageLevelHelp = HELP_FILE.Product__Category_Group_MASTER;
        break;
      case '/masterdata/tax':
        this.pageLevelHelp = HELP_FILE.Tax_MASTER;
        break;
      case '/masterdata/organization':
        this.pageLevelHelp = HELP_FILE.Organization_Master;
        break;


      case '/homepage':
        this.pageLevelHelp = HOMEPAGE_HELP_FILE.HOMEPAGE
        break;
      // case '/subMenu/inbound':
      //   this.pageLevelHelp = SUBMENU_HELP_FILE.INBOUND;
      //   break;
      // case '/subMenu/planning':
      //   this.pageLevelHelp = SUBMENU_HELP_FILE.PLANNING;
      //   break;
      // case '/subMenu/outbound':
      //   this.pageLevelHelp = SUBMENU_HELP_FILE.OUTBOUND;
      //   break;
      // case '/subMenu/inbound':
      //   this.pageLevelHelp = SUBMENU_HELP_FILE.INBOUND;
      //   break;

      // case '/subMenu/outbound':
      //   this.pageLevelHelp = SUBMENU_HELP_FILE.OUTBOUND;
      //   break;

      case '/reports/goodsReceiving':
        this.pageLevelHelp = REPORTS_HELP_FILE.GOODSRECEIVING_REPORTS;
        break;
      case '/reports/grnStageSummary':
        this.pageLevelHelp = REPORTS_HELP_FILE.GRN_STAGE_SUMMARY_REPORTS;
        break;
      case '/reports/grnStageTransaction':
        this.pageLevelHelp = REPORTS_HELP_FILE.GRN_STAGE_TRANSACTION_REPORTS;
        break;
      case '/reports/grnSummary':
        this.pageLevelHelp = REPORTS_HELP_FILE.GRN_SUMMARY_REPORTS
        break;
      case '/reports/grnHistory':
        this.pageLevelHelp = REPORTS_HELP_FILE.GRN_HISTORY
        break;
      case '/reports/putaway':
        this.pageLevelHelp = REPORTS_HELP_FILE.PUTAWAY;
        break;
      case '/reports/returnOrder':
        this.pageLevelHelp = REPORTS_HELP_FILE.RETURNS;
        break;
      case '/reports/inventory':
        this.pageLevelHelp = REPORTS_HELP_FILE.INVENTORY_SUMMARY;
        break;
      case '/reports/cycleCounting':
        this.pageLevelHelp = REPORTS_HELP_FILE.CYCLE_COUNTING;
        break;
      case '/reports/inventoryAdjustments':
        this.pageLevelHelp = REPORTS_HELP_FILE.INVENTORY_ADJUSTMENT;
        break;
      case '/reports/inventoryByProductReport':
        this.pageLevelHelp = REPORTS_HELP_FILE.INVENTORY_BY_PRODUCT;
        break;
      case '/reports/inventoryByLocationReport':
        this.pageLevelHelp = REPORTS_HELP_FILE.INVENTORY_BY_LOCATION_Report;
        break;
      case '/reports/inventoryTransactionReport':
        this.pageLevelHelp = REPORTS_HELP_FILE.INVENTORY_TRANSACTION_REPORTS;
        break;
      case '/reports/inventoryTransactionDetailsReport':
        this.pageLevelHelp = REPORTS_HELP_FILE.INVENTORY_TRANSACTION_DETAILS_REPORTS;
        break;
      case '/reports/openSalesOrder':
        this.pageLevelHelp = REPORTS_HELP_FILE.OPEN_SALES_ORDER_REPORTS;
        break;
      case '/reports/shipment':
        this.pageLevelHelp = REPORTS_HELP_FILE.SHIPMENT_REPORTS;
        break;
      case '/reports/Newshipmentorder':
        this.pageLevelHelp = REPORTS_HELP_FILE.SHIPMENT_ORDER_REPORTS;
        break;
      case '/reports/shipmentHistory':
        this.pageLevelHelp = REPORTS_HELP_FILE.SHIPMENT_HISTORY_REPORTS;
        break;
      case '/reports/picking':
        this.pageLevelHelp = REPORTS_HELP_FILE.PICKING;
        break;
      case '/reports/picklist':
        this.pageLevelHelp = REPORTS_HELP_FILE.PICKLIST;
        break;
      case '/reports/spaceutilizationReports':
        this.pageLevelHelp = REPORTS_HELP_FILE.SPACE_UTILIZATION_REPORT;
        break;
      case '/config/parameters':
        this.pageLevelHelp = HELP_FILE.Parameters;
        break;

      case '/config/orderSequenceConfig':
        this.pageLevelHelp = HELP_FILE.Prefix_Config;
        break;

      case '/config/financialConfig':
        this.pageLevelHelp = HELP_FILE.Financial_Configuration;
        break;

      case '/config/notificationConfig':
        this.pageLevelHelp = HELP_FILE.Notification_Configuration;
        break;
      case '/config/processGroups':
        this.pageLevelHelp = HELP_FILE.Process_Groups;
        break;
      case '/config/processPermissions':
        this.pageLevelHelp = HELP_FILE.Process_Permissions;
        break;
      case '/config/statusConfig':
        this.pageLevelHelp = HELP_FILE.STATUS_CONFIGURATION;
        break;
      case '/config/warehouse':
        this.pageLevelHelp = HELP_FILE.WAREHOUSE_CONFIGURATION;
        break;
      case '/config/inventory':
        this.pageLevelHelp = HELP_FILE.INVENTORY_CONFIGURATION;
        break;
      case '/config/kpi':
        this.pageLevelHelp = HELP_FILE.KPI_Configuration;
        break;
      case '/config/report':
        this.pageLevelHelp = HELP_FILE.Report_Configuration;
        break;
      case '/config/master':
        this.pageLevelHelp = HELP_FILE.Master_Configuration;
        break;
      case '/config/user':
        this.pageLevelHelp = HELP_FILE.User_Configurations;
        break;
      case '/config/loginMonitor':
        this.pageLevelHelp = HELP_FILE.login_monitor;
        break;
        case '/config/cycleCounting':
          this.pageLevelHelp = HELP_FILE.CYCLE_COUNTING_CONFIG_;
          break;
      // DASH BOARDS
      case '/dashboard/overAllDashboard':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.OVER_ALLDASHBOARDS;
        break;
      case '/dashboard/spaceUtilization':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.SPACE_UTILIZATION_DASHBOARD;
        break;
      case '/dashboard/inbound':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.INBOUND_DASHBOARD;
        break;
      case '/dashboard/outbound':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.OUTBOUND_DASHBOARD;
        break;
      case '/dashboard/salesAnalytics':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.SALES_ANALYTIS_DASHBOARD;
        break;
      case '/dashboard/purchaseAnalytics':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.PURCHASE_ANALYTIS_DASHBOARD;
        break;
      case '/dashboard/AbcAnalysis':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.ABC_ANALYSIS_DASHBOARD;
        break;

      case '/dashboard/Inventory':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.INVENTORY_DASHBOARD;
        break;
      case '/dashboard/employeeInboundOutBoundDashboard':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.EMPLOYEE_DASHBOARD;
        break;
      case '/dashboard/dailyOperationBasedDashboard':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.Daily_Operations;
        break;
      case '/dashboard/orderRateTypeDashboard':
        this.pageLevelHelp = DASHBOARDS_HELP_FILE.Order_Rate_Dashboard;
        break;
      case '/subMenu/planning':
        this.pageLevelHelp = SUBMENU_HELP_FILE.PLANNING_SUBMENU;
        break;
      case '/subMenu/planning':
        this.pageLevelHelp = SUBMENU_HELP_FILE.PLANNING_SUBMENU;
        break;
      default:
        this.pageLevelHelp = {};
    }
  }

  getReportsRoutes() {
    // this.reportsFunctionalities = Storage.getSessionUser().functionalityMenuAccess.reportsFunctionalities;
    this.reportsFunctionalities = this.configService.getModulesList('reportsFunctionalities');
    const reportLinks = [];
    if (this.reportsFunctionalities.length > 0) {
      this.reportsFunctionalities.forEach((process, i) => {
        process.subFunctionalities.forEach(report => {
          ReportsNavConstants.forEach(reportRoute => {
            if (report.name === reportRoute.name) {
              reportLinks.push(reportRoute);
            }
          });
        });
      });
      if (reportLinks.length) { reportLinks[0].header = 'Reports List'; };
      if (reportLinks.length == 0) { this.isShowMasterMenu = false };
      this.masterDatasOrReportsOrConfigData = reportLinks;
    }
  }
  getMasterRoutes() {
    this.mainFunctionalitiesForMasters = this.configService.getModulesList('mainFunctionalitiesForMasters');
    const masterLinks = [];
    if (this.mainFunctionalitiesForMasters.length > 0) {
      this.mainFunctionalitiesForMasters.forEach((process, i) => {
        process.subFunctionalities.forEach(master => {
          MasterDataNavConstants.forEach(masterRoute => {
            if (master.name === masterRoute.name) {
              masterLinks.push(masterRoute);
            }
          });
        });
      });
      if (masterLinks.length) { masterLinks[0].header = 'Master Data List'; }
      if (masterLinks.length == 0) { this.isShowMasterMenu = false };
      this.masterDatasOrReportsOrConfigData = masterLinks;
    }
    else {
      if (this.role == 'ROLE_CLIENT') {
        masterLinks.push({ name: 'Warehouse', route: '/masterdata/warehouse' });
        masterLinks.push({ name: 'Organization', route: '/masterdata/organization' });
        this.masterDatasOrReportsOrConfigData = masterLinks;
      }
    }
  }
  getConfigRoutes() {
    if (this.role && ['ROLE_SUPER_ADMIN'].includes(this.role)) {
      this.masterDatasOrReportsOrConfigData = ConfigurationNavConstants;
    } else {
      const userDetails = JSON.parse(sessionStorage.getItem('dli-wms-user'));
      let mainModules: any = [];
      let indexValue: any = -1
      if (userDetails && userDetails.userPermissionFunctionalityInfo &&
        userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.length > 0) {
        const modulesList = userDetails.userPermissionFunctionalityInfo.userPermissionWareHouseFunctionality.find(x =>
          x.organizationInfo.organizationIDName == this.configService.organizationValue && x.wareHouseInfo.wareHouseIDName == this.configService.wareHouseValue);
        if (modulesList && modulesList['mainFunctionalities'] && modulesList['mainFunctionalities'].length > 0) {
          mainModules = modulesList['mainFunctionalities'];
          indexValue = mainModules.findIndex(x => x.name === 'Configurations');
        }
        else if (this.role && ['ROLE_CLIENT'].includes(this.role)) {
          this.masterDatasOrReportsOrConfigData = ConfigurationNavConstants;
        }
      }
      else if (this.role && ['ROLE_CLIENT'].includes(this.role)) {
        this.masterDatasOrReportsOrConfigData = ConfigurationNavConstants;
      }
      const reportLinks = [];
      if (indexValue != -1 && mainModules[indexValue].subFunctionalities.length > 0) {
        mainModules[indexValue].subFunctionalities.forEach(report => {
          ConfigurationNavConstants.forEach(reportRoute => {
            if (report.name === reportRoute.name) {
              reportLinks.push(reportRoute);
            }
          });
        });
        if (reportLinks.length) { reportLinks[0].header = 'Configurations'; };
        if (reportLinks.length == 0) { this.isShowMasterMenu = false };
        this.masterDatasOrReportsOrConfigData = reportLinks;
      }
    }
  }
  getRole() {
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      this.role = user.authorities[0].authority;
      return this.role;
    }
  }

}
