import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { Subject, forkJoin } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { WmsCommonService } from 'src/app/services/wms-common.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ToastrService } from 'ngx-toastr';
import { Constants } from 'src/app/constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip
} from "ng-apexcharts";
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';




export type salesSummary = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};

export type topSellingProduct = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};
export type turnOverDaysChart = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};
@Component({
  selector: 'app-overalldashboard',
  templateUrl: './overalldashboard.component.html',
  styleUrls: ['./overalldashboard.component.scss']
})
export class OveralldashboardComponent implements OnInit, AfterViewInit, OnDestroy {



  @ViewChild("chart") chart1: salesSummary;
  public salesSummary: Partial<salesSummary>;

  @ViewChild("chart") chart2: topSellingProduct;
  public topSellingProduct: Partial<topSellingProduct>;


  headerCountList: any = {};
  salesOrderCountList:any ={}
  returnHeaderCountList: any = {};
  purchaseReturnCountList:any={}
  transferHeaderCountList: any = {};
  salesReturnCountList:any ={}
  wTReturnCountList:any={}
  // Active Purchase Orders
  purchaseOrderLines: any = [];
  purchaseReturnLines: any = [];
  warehouseTransferLines: any = [];
  // Active Shipment Orders
  shipmentOrderLines: any = [];
  salesReturnLines: any = [];
  warehouseDeliveriesLines: any = [];
  // Active Return Orders
  returnOrderLines: any = [];
  // Pie Grid Chart for putaway and picking
  // completed: any = 'Completed';
  // putawayCount: any = [];
  // pickingCount: any = [];
  // view: any[] = [200, 200];
  // colorScheme1 = {
  //   domain: ['#5AA454']
  // };
  // colorScheme2 = {
  //   domain: ['#E44D25']
  // };
  pview: any[] = [200, 200];
  pgradient: any = true;
  pshowLegend: any = false;
  pshowLabels: any = false;
  pisDoughnut: any = false;
  plegendPosition: any = 'below';
  pcolorScheme = {
    domain: ['rgba(0,0,255,0.3)', 'rgba(255,0,0,0.3)']
  };
  putawayChartData: any = [];
  pickingChartData: any = [];
  // Pie Chart for Zones
  gradient: any = true;
  showLegend: any = false;
  showLabels: any = false;
  isDoughnut: any = false;
  legendPosition: any = 'below';
  colorScheme3 = {
    domain: ['rgba(0,0,255,0.3)', 'rgba(255,0,0,0.3)']
  };
  zone1: any = [{ name: 'Used Capacity', value: 0 }, { name: 'Unused Capacity', value: 0 }];
  zone2: any = [{ name: 'Used Capacity', value: 0 }, { name: 'Unused Capacity', value: 0 }];
  zone3: any = [{ name: 'Used Capacity', value: 0 }, { name: 'Unused Capacity', value: 0 }];
  // Vertical bar graph for top selling products and products in inventory
  showXAxis = true;
  showYAxis = true;
  gradient4 = false;
  showLegend4 = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Population';
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  colorScheme4 = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  permissionsList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Purchase Orders', Storage.getSessionUser());
  salesOrderList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Sales Order', Storage.getSessionUser());
  IncomingPurchaseOrders = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Incoming Purchase Orders', Storage.getSessionUser());
  Putaway = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Putaway', Storage.getSessionUser());
  returnOrdersCount = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Return Orders Count', Storage.getSessionUser());
  returnOrders = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Return Orders', Storage.getSessionUser());
  inboundOrderStatus = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Inbound Order Status', Storage.getSessionUser());
  topSellingProductslist = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Top Selling Products', Storage.getSessionUser());
  Picking = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Picking', Storage.getSessionUser());
  outgoingShipment = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Outgoing Shipment', Storage.getSessionUser());
  outboundOrderStatus = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Outbound Order Status', Storage.getSessionUser());
  salesSummaryList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Sales Summary', Storage.getSessionUser());
  WarehouseDeliveriesList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Warehouse deliveries', Storage.getSessionUser());
  warehouseTransfersList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Warehouse transfers', Storage.getSessionUser());
  salesReturnsList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Sales returns', Storage.getSessionUser());
  purchaseReturnsList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Purchase returns', Storage.getSessionUser());
  warehouseCountList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Warehouse deliveries Count', Storage.getSessionUser());
  warehouseTransferCountList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Warehouse transfers Count', Storage.getSessionUser());
  salesReturnsCountList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Sales returns Count', Storage.getSessionUser());
  purchaseReturnsCountList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Purchase returns Count', Storage.getSessionUser());


  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' }
  ];
  public barChartData2: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
    { data: [28, 48, 40, 19, 86, 27, 190], label: 'Series C' },
  ];

  // Inventory Summary
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  header: any = ['Product Name', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
    'November', 'December'];
  formObj = this.configService.getGlobalpayload();
  inventorySummary: any = [
    {
      productName: 'Five Star',
      january: 20,
      febuary: 55,
      march: 77,
      april: 66,
      may: 83,
      june: 99,
      july: 77,
      august: 88,
      september: 55,
      october: 67,
      november: 88,
      december: 66
    },
    {
      productName: 'Bubly Silk',
      january: 20,
      febuary: 55,
      march: 77,
      april: 66,
      may: 83,
      june: 99,
      july: 77,
      august: 88,
      september: 55,
      october: 67,
      november: 88,
      december: 66
    },
    {
      productName: 'Cadbury',
      january: 20,
      febuary: 55,
      march: 77,
      april: 66,
      may: 83,
      june: 99,
      july: 77,
      august: 88,
      september: 55,
      october: 67,
      november: 88,
      december: 66
    },
    {
      productName: 'Bubly Silk',
      january: 20,
      febuary: 55,
      march: 77,
      april: 66,
      may: 83,
      june: 99,
      july: 77,
      august: 88,
      september: 55,
      october: 67,
      november: 88,
      december: 66
    },
    {
      productName: 'Perk',
      january: 20,
      febuary: 55,
      march: 77,
      april: 66,
      may: 83,
      june: 99,
      july: 77,
      august: 88,
      september: 55,
      october: 67,
      november: 88,
      december: 66
    }
  ];
  topProductsInventory: any = [
    { data: [], label: 'Quantity' }

  ];
  /*  topSellingProducts: any = [
     { data: [], label: 'Quantity' }
   ]; */
  // public barChartLabelsForTopInventory: Label[] = [];
  //public labelsForTopSellingProducts: Label[] = [];
  // Year wise Month wise Inventory
  yearMonthWiseInventory: any = [];
  // Stock In Inventory


  // Warehouse Capacity
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };

  public pieChartPlugins: any = [];
  public warehouseCapacityLabels: Label[] = ['Total Locations', 'Available Locations'];
  public warehouseCapacityData: SingleDataSet = [];
  public warehouseCapacityType: ChartType = 'pie';
  public warehouseCapacityLegend = true;
  pieChartColors: any = [{
    backgroundColor: ['rgba(0,0,255,0.3)', 'rgba(255,0,0,0.3)'],
  }];
  public warehouseCapacityPlugins = [];

  // Pie Charts for zones
  public zoneLabels: Label[] = ['Unused Capacity', 'Used Capacity'];
  public zone1Data: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;

  // Turn Over Days
  /*   public turnOverDaysLabels: Label[] = [];
    public turnOverDaysData: any = [
      { data: [], label: 'Quantities' }
    ];
   */
  // Sales Summary
  public salesSummaryLabels: Label[] = [];
  public salesSummaryData: any = [
    { data: [], label: 'Return Count' },
    { data: [], label: 'SO Count' }
  ];
  // Cycle Counting Graph


  zones: any = [];
  pendingGoodsReceivingList: any;
  forPermissionsSubscription: any;

  constructor(
    private dashboardService: DashboardService, private configService: ConfigurationService,
    private wmsCommonService: WmsCommonService,
    private wmsService: WMSService,
    private toastr: ToastrService, private fb: FormBuilder,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,

    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    if (this.getRole()) {
      this.permissionsList = ['View', 'Update', 'Delete'];
      this.salesOrderList = ['View', 'Update', 'Delete'];
      this.IncomingPurchaseOrders = ['View', 'Update', 'Delete'];
      this.Putaway = ['View', 'Update', 'Delete'];
      this.returnOrdersCount = ['View', 'Update', 'Delete'];
      this.returnOrders = ['View', 'Update', 'Delete'];
      this.inboundOrderStatus = ['View', 'Update', 'Delete'];
      this.topSellingProductslist = ['View', 'Update', 'Delete'];
      this.Picking = ['View', 'Update', 'Delete'];
      this.outgoingShipment = ['View', 'Update', 'Delete'];
      this.outboundOrderStatus = ['View', 'Update', 'Delete'];
      this.salesSummaryList = ['View', 'Update', 'Delete'];
      this.WarehouseDeliveriesList = ['View', 'Update', 'Delete'];
      this.warehouseTransfersList = ['View', 'Update', 'Delete'];
      this.salesReturnsList = ['View', 'Update', 'Delete'];
      this.purchaseReturnsList = ['View', 'Update', 'Delete'];
      this.warehouseCountList = ['View', 'Update', 'Delete'];
      this.warehouseTransferCountList = ['View', 'Update', 'Delete'];
      this.salesReturnsCountList = ['View', 'Update', 'Delete'];
      this.purchaseReturnsCountList = ['View', 'Update', 'Delete'];
    }
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.TopSellingProductGraph();
      this.salesSummaryGraph();
      this.findAllDashboardCountList();
      this.findAllPutawayAndPickingCountList();
      this.findAllPurchaseOrders();
      this.fetchAllShipmentOrders();
      //   this.fetchTopProductsInventory();
      //  this.fetchTopSellingProducts();

      this.fetchZonesCapacity();
      this.fetchYearWiseMonthWiseInventory();
      // this.fetchYearWiseSalesAndReturnOrderSummary();
      this.fetchWarehouseDetails();

    }
  }

  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  findAllDashboardCountList() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    let orderType = 'Purchase Order';
    this.dashboardService.findAllDashboardCountList(form.organizationIDName, form.wareHouseIDName, orderType).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.dashBoardCount) {
          this.headerCountList = response.data.dashBoardCount;
        }
      },
      (error) => {

      });
      orderType = 'Sales Order';
      this.dashboardService.findAllDashboardCountList(form.organizationIDName, form.wareHouseIDName, orderType).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.dashBoardCount) {
            this.salesOrderCountList = response.data.dashBoardCount;
          }
        },
        (error) => {

        });
    orderType = 'Sales Returns';
    this.dashboardService.findAllDashboardCountList(form.organizationIDName, form.wareHouseIDName, orderType).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.dashBoardCount) {
          this.salesReturnCountList = response.data.dashBoardCount;
        }
      },
      (error) => {

      });
    orderType = 'Purchase Returns';
    this.dashboardService.findAllDashboardCountList(form.organizationIDName, form.wareHouseIDName, orderType).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.dashBoardCount) {
          this.purchaseReturnCountList = response.data.dashBoardCount;

        }
      },
      (error) => {

      });
    orderType = 'WareHouseTransfer Returns';
    this.dashboardService.findAllDashboardCountList(form.organizationIDName, form.wareHouseIDName, orderType).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.dashBoardCount) {
          this.wTReturnCountList = response.data.dashBoardCount;
        }
      },
      (error) => {

      });
    orderType = 'WareHouseTransfer';
    this.dashboardService.findAllDashboardCountList(form.organizationIDName, form.wareHouseIDName, orderType).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.dashBoardCount) {
          this.transferHeaderCountList = response.data.dashBoardCount;
        }
      },
      (error) => {

      });
  }

  findAllPutawayAndPickingCountList() {
    this.dashboardService.findAllPutawayAndPickingCountList(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putAwayAndPickingMap) {
          const putAwayAndPickingCount = response.data.putAwayAndPickingMap;
          this.putawayChartData = [{ name: 'Completed', value: putAwayAndPickingCount.PutAwayInActiveCount },
          { name: 'Incomplete', value: putAwayAndPickingCount.PutAwayActiveCount }];
          this.pickingChartData = [{ name: 'Completed', value: putAwayAndPickingCount.PickingInActiveCount },
          { name: 'Incomplete', value: putAwayAndPickingCount.PickingActiveCount }];

        }
      },
      (error) => {

      });
  }
  findAllPurchaseOrders() {
    // const req = [];
    // const types = ['Purchase Order', 'Return Order'];
    // types.forEach(type => {
    //   const form = {
    //     organizationIDName: this.configService.getOrganization().organizationIDName,
    //     wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    //     recieptType: type,
    //     orderType: null
    //   }
    //   req.push(this.dashboardService.findAllActivePurchaseOrders(form));
    // });
    // forkJoin(req).subscribe(
    //   (response: any) => {
    //     if (response && response[0].status === 0 && response[0].data.purchaseOrderList.length) {
    //       this.getProducts(response[0].data.purchaseOrderList, 'default');
    //     }
    //     if (response && response[1].status === 0 && response[1].data.purchaseOrderList.length) {
    //       //   this.getProducts(response[1].data.purchaseOrderList);
    //     }
    //   },
    //   (error) => { });
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      // recieptType: 'Purchase Order',
      orderType: 'Purchase Order',
      status: 'Open'
    }
    this.dashboardService.findAllActivePurchaseOrders(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrders) {
          this.getProducts(response.data.purchaseOrders, 'default');
        }
      },
      (error) => {
      });
    /* form['orderType'] = 'Return';
    this.dashboardService.findAllActivePurchaseOrders(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrders) {
          this.getProducts(response.data.purchaseOrders, 'Return');
        }
      },
      (error) => {
      }); */
    form['orderType'] = 'WareHouseTransfer';
    this.dashboardService.findAllActivePurchaseOrders(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrders) {
          this.getProducts(response.data.purchaseOrders, 'WareHouseTransfer');
        }
      },
      (error) => {
      });
      form['orderType'] = 'WareHouseTransfer Returns';
    this.dashboardService.findAllActivePurchaseOrders(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrders) {
          this.getProducts(response.data.purchaseOrders, 'WareHouseTransfer Returns');
        }
      },
      (error) => {
      });
      form['orderType'] = 'Sales Returns';
    this.dashboardService.findAllActivePurchaseOrders(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrders) {
          this.getProducts(response.data.purchaseOrders, 'Sales Returns');
        }
      },
      (error) => {
      });
  }
  fetchAllShipmentOrders() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      orderType: 'Sales Order'
    }
    this.dashboardService.findAllActiveShipmentOrders(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderList) {
          this.getProducts(response.data.shipmentOrderList, 'default');
        }
      },
      (error) => {
      });
    form['orderType'] = 'WareHouseTransfer';
    this.dashboardService.findAllActiveShipmentOrders(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderList) {
          this.getProducts(response.data.shipmentOrderList, 'WareHouseTransfer');
        }
      },
      (error) => {
      });
      form['orderType'] = 'Sales Returns';
      this.dashboardService.findAllActiveShipmentOrders(form).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.shipmentOrderList) {
            this.getProducts(response.data.shipmentOrderList, 'Sales Returns');
          }
        },
        (error) => {
        });
        form['orderType'] = 'Purchase Returns';
        this.dashboardService.findAllActiveShipmentOrders(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.shipmentOrderList) {
              this.getProducts(response.data.shipmentOrderList, 'Purchase Returns');
            }
          },
          (error) => {
          });
    /* form['orderType'] = 'WareHouseTransfer';
    this.dashboardService.findAllActiveShipmentOrders(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderList) {
          this.getProducts(response.data.shipmentOrderList, 'WareHouseTransfer');
        }
      },
      (error) => {
      }); */
  }
  getProducts(orders, type) {
    orders.forEach(order => {
      if (order.purchaseOrderLines) {
        order.purchaseOrderLines.forEach(product => {
          if (type == 'default') {
            this.purchaseOrderLines.push({
              fullWmpoNumber: order.fullWmpoNumber, productIDName: product.productMasterInfo.productIDName,
              quantity: product.quantity, deliveryDate: order.poDeliveryDate
            });
          }
          if (type == 'Sales Returns') {
            this.purchaseReturnLines.push({
              fullWmpoNumber: order.fullWmpoNumber, productIDName: product.productMasterInfo.productIDName,
              quantity: product.quantity, deliveryDate: order.poDeliveryDate
            });
          }
          if (type == 'WareHouseTransfer') {
            this.warehouseTransferLines.push({
              fullWmpoNumber: order.fullWmpoNumber, productIDName: product.productMasterInfo.productIDName,
              quantity: product.quantity, deliveryDate: order.poDeliveryDate
            });
          }
        });
      } else if (order.shipmentOrderLines) {
        order.shipmentOrderLines.forEach(product => {
          if (type == 'default') {
            this.shipmentOrderLines.push({
              fullWmsoNumber: order.fullWmsoNumber, productIDName: product.productMasterInfo.productIDName,
              quantity: product.quantity, deliveryDate: order.deliveryExpDate
            });
          }
          else if (type == 'Purchase Returns') {
            this.salesReturnLines.push({
              fullWmsoNumber: order.fullWmsoNumber, productIDName: product.productMasterInfo.productIDName,
              quantity: product.quantity, deliveryDate: order.deliveryExpDate
            });
          }
          else if (type == 'WareHouseTransfer') {
            this.warehouseDeliveriesLines.push({
              fullWmsoNumber: order.fullWmsoNumber, productIDName: product.productMasterInfo.productIDName,
              quantity: product.quantity, deliveryDate: order.deliveryExpDate
            });
          }
        });
      }
      //  else if (order.purchaseOrderLines && order.receiptType === 'Return Order') {
      //   order.purchaseOrderLines.forEach(product => {
      //     this.returnOrderLines.push({
      //       wmpoNumber: order.wmpoNumber, productIDName: product.productMasterInfo.productIDName,
      //       quantity: product.quantity, deliveryDate: order.poDeliveryDate
      //     });
      //   });
      // }
    });
  }

  fetchZonesCapacity() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.dashboardService.findAllZoneCapacity(form.organizationIDName, form.wareHouseIDName).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseCapacity) {
          response.data.wareHouseCapacity.forEach(zone => {
            zone.dashboardInfo = [
              { name: 'Used Capacity', value: zone.totalUsedCapacity },
              { name: 'Unused Capacity', value: zone.totalCapacity - zone.totalUsedCapacity }
            ]
          });

          this.zones = response.data.wareHouseCapacity;
          // this.zone1 = [{name: 'Used Capacity', value: response.data.wareHouseCapacity.Z01TotalUsedCapacity},
          //  {name: 'Unused Capacity', value: response.data.wareHouseCapacity.Z01TotalCapacity -
          //  response.data.wareHouseCapacity.Z01TotalUsedCapacity}];
          // this.zone2 = [{name: 'Used Capacity', value: response.data.wareHouseCapacity.Z02TotalUsedCapacity},
          //  {name: 'Unused Capacity', value: response.data.wareHouseCapacity.Z02TotalCapacity -
          //  response.data.wareHouseCapacity.Z02TotalUsedCapacity}];
          // this.zone3 = [{name: 'Used Capacity', value: response.data.wareHouseCapacity.Z03TotalUsedCapacity},
          //  {name: 'Unused Capacity', value: response.data.wareHouseCapacity.Z03TotalCapacity -
          //  response.data.wareHouseCapacity.Z03TotalUsedCapacity}];
        }
      },
      (error) => {
      });
  }
  /*  fetchTopProductsInventory() {
     const form = {
       organizationIDName: this.configService.getOrganization().organizationIDName,
       wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
     }
     const labels = [];
     const data = [{ data: [], label: 'Quantity' }];
     this.dashboardService.findTopProductsInInvetory(form.organizationIDName, form.wareHouseIDName).subscribe(
       (response) => {
         if (response && response.status === 0 && response.data.TopProductsInInventory) {
           response.data.TopProductsInInventory.forEach(product => {
             labels.push(product.productID);
             data[0].data.push(product.quantity);
           });
           this.barChartLabelsForTopInventory = labels;
           this.topProductsInventory = data;
         }
       },
       (error) => {
       });
   } */
  /*  fetchTopSellingProducts() {
     const form = {
       organizationIDName: this.configService.getOrganization().organizationIDName,
       wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
     }
     const labels = [];
     const data = [{ data: [], label: 'Quantity' }];
     this.dashboardService.findTopSellingProducts(form.organizationIDName, form.wareHouseIDName).subscribe(
       (response) => {
         if (response && response.status === 0 && response.data.topSellingProductsInSalesOrder) {
           response.data.topSellingProductsInSalesOrder.forEach(product => {
             labels.push(product.productID);
             data[0].data.push(product.quantity);
           });
           this.labelsForTopSellingProducts = labels;
           this.topSellingProducts = data;
         }
       },
       (error) => {
       });
   } */

  fetchYearWiseMonthWiseInventory() {
    this.dashboardService.fetchYearWiseMonthWiseInventory(2020).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.monthAndProductQuantityMap) {
          this.formatYearWiseMonthWiseInventoryData(response.data.monthAndProductQuantityMap);
        }
      },
      (error) => {
      });
  }


  /* fetchTurnOverDays() {
    const data = [{ data: [], label: 'Quantity' }];
    this.dashboardService.fetchYearWiseProductWiseTotalQuantityInventory().subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productAndQuantitymap) {
          this.turnOverDaysLabels = Object.keys(response.data.productAndQuantitymap);
          data[0].data = Object.values(response.data.productAndQuantitymap);
          this.turnOverDaysData = data;
        }
      },
      (error) => {
      });
  } */


  /*  fetchYearWiseSalesAndReturnOrderSummary() {
     const data = [{ data: [], label: 'Return Count' }, { data: [], label: 'SO Count' }];
     const years = [];
     this.dashboardService.fetchYearWiseSalesAndReturnOrderSummary(this.configService.getGlobalpayload()).subscribe(
       (response) => {
         if (response && response.status === 0 && response.data.YearWiseSalesAndReturnOrderSummary) {
           response.data.YearWiseSalesAndReturnOrderSummary.forEach(order => {
             years.push(order.year);
             data[0].data.push(order.purchaseOrderCount);
             data[1].data.push(order.salesOrderCount);
           });
           this.salesSummaryLabels = years;
           this.salesSummaryData = data;
         }
       },
       (error) => {
       });
   } */
  fetchWarehouseDetails() {
    this.wmsService.fetchWareHouseDetailsByID(Constants.WAREHOUSE_ID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse && response.data.wareHouse.address) {
          this.fetchWarehouseCapacity(response.data.wareHouse.wareHouseName)
        }
      },
      (error) => {
      });
  }
  fetchWarehouseCapacity(wareHouseName) {
    const data = [];
    this.dashboardService.fetchWarehouseCapacity(wareHouseName, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseCapacity) {
          data.push(response.data.wareHouseCapacity.wareHouseTotalLocations);
          data.push(response.data.wareHouseCapacity.wareHouseLoacationAvailable);
          this.warehouseCapacityData = data;
        }
      },
      (error) => {
      });
  }
  formatYearWiseMonthWiseInventoryData(data) {
    const productsList = [];
    let productsArrayList = [];
    data.forEach(day => {
      if (day.productQuantityList) {
        day.productQuantityList.forEach(product => {
          if (productsList.indexOf(product.productName) === -1) {
            productsList.push(product.productName);
          }
        });
      }
    });
    productsList.forEach(product => {
      productsArrayList.push({
        name: product,
        january: { month: 1, quantity: 0 },
        febuary: { month: 2, quantity: 0 },
        march: { month: 3, quantity: 0 },
        april: { month: 4, quantity: 0 },
        may: { month: 5, quantity: 0 },
        june: { month: 6, quantity: 0 },
        july: { month: 7, quantity: 0 },
        august: { month: 8, quantity: 0 },
        september: { month: 9, quantity: 0 },
        october: { month: 10, quantity: 0 },
        november: { month: 11, quantity: 0 },
        december: { month: 12, quantity: 0 }
      });
    });

    productsArrayList = this.wmsCommonService.getQuantitesForYearWiseMonthWiseInventories(productsArrayList, data);
    this.yearMonthWiseInventory = productsArrayList;
    this.rerender();
  }


  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    // this.forPermissionsSubscription.unsubscribe();
  }

  purchaseOrderCountArray: any = []
  salesOrderCountArray: any = []
  salesSummaryGraph() {
    const form = this.configService.getGlobalpayload();
    form['orderType'] = 'Sales Order';
    this.dashboardService.fetchYearWiseSalesAndReturnOrderSummary(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.YearWiseSalesAndReturnOrderSummary) {
          response.data.YearWiseSalesAndReturnOrderSummary.forEach(order => {
            if (order && order.purchaseOrderCount != null && order.purchaseOrderCount != undefined) {
              this.purchaseOrderCountArray.push(order.purchaseOrderCount)
            }
            else {
              this.purchaseOrderCountArray.push(0)
            }
            if (order && order.salesOrderCount != null && order.salesOrderCount != undefined) {
              this.salesOrderCountArray.push(order.salesOrderCount)
            }
            else {
              this.salesOrderCountArray.push(0)
            }
            this.salesSummary = {
              series: [
                {
                  name: "purchase Order Count",
                  data: this.purchaseOrderCountArray
                },
                {
                  name: "sales Order Count",
                  data: this.salesOrderCountArray
                },
              ],
              chart: {
                type: "bar",
                height: 350,
                toolbar: {
                  show: false
                }
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: "55%",
                }
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                show: true,
                width: 2,
                colors: ["transparent"]
              },
              xaxis: {
                categories: [order.year]
              },
              yaxis: {
                title: {
                  text: "hello"
                }
              },
              fill: {
                opacity: 1
              },
              tooltip: {
                y: {
                  formatter: function (val, index) {

                    return " " + val + "";
                  }
                }
              }
            };
          })
        }
      })
  }
  topSellingProductsIDArray: any = []
  topSellingProductsQuantityArray: any = []
  TopSellingProductGraph() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.dashboardService.findTopSellingProducts(form.organizationIDName, form.wareHouseIDName).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.topSellingProductsInSalesOrder) {
          response.data.topSellingProductsInSalesOrder.forEach(product => {
            if (product && product.productID != null && product.productID != undefined) {
              this.topSellingProductsIDArray.push(product.productID)
            }
            else {
              this.topSellingProductsIDArray.push(0)
            }
            if (product && product.quantity != null && product.quantity != undefined) {
              this.topSellingProductsQuantityArray.push(DecimalUtils.fixedDecimal(product.quantity,2));
            }
            else {
              this.topSellingProductsQuantityArray.push(0);
            }

            this.topSellingProduct = {
              series: [
                {
                  name: "",
                  data: this.topSellingProductsQuantityArray
                },
              ],
              chart: {
                type: "bar",
                height: 350,
                toolbar: {
                  show: false
                }
              },

              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: "55%",
                }
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                show: true,
                width: 2,
                colors: ["transparent"]
              },
              xaxis: {
                categories: this.topSellingProductsIDArray
              },
              yaxis: {
                title: {
                  text: "hello"
                }
              },
              fill: {
                opacity: 1
              },
              tooltip: {
                y: {
                  formatter: function (val, index) {
                    return "Quantity" + val + "";
                  }
                }
              }
            };
          })
        }
      })
  }
}
