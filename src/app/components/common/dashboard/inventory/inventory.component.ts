import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChartType } from 'chart.js';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke, ApexLegend, ApexNonAxisChartSeries, ApexResponsive, ApexTitleSubtitle, ApexTheme } from 'ng-apexcharts';
import { Label, SingleDataSet } from 'ng2-charts';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Storage } from '../../../../shared/utils/storage';
import { turnOverDaysChart } from '../overalldashboard/overalldashboard.component';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
export type ChartOptions1 = {
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

export type internalAdjustmentDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle
  legend: any;
  theme: ApexTheme
  colors: any;
}
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})

export class InventoryComponent implements OnInit {
  expiredProducts = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inventory', 'Expired Products', Storage.getSessionUser());
  totalInventoryQuantity = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inventory', 'Total Inventory Quantity', Storage.getSessionUser());
  stockinInventory = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inventory', 'Stock in Inventory', Storage.getSessionUser());
  inventoryAccuracy = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inventory', 'Inventory Accuracy', Storage.getSessionUser());
  turnOverDays = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inventory', 'Turn Over Days', Storage.getSessionUser());
  topProdutsInventory = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Inventory', 'Top Produts Inventory', Storage.getSessionUser());

  public stockInInventoryLabels: Label[] = [];

  public internalAdjustmentDetails: Partial<internalAdjustmentDetails>;
  public stockInInventoryData: SingleDataSet[] = [];
  headerCountList: any = {};
  formObj = this.configService.getGlobalpayload();
  supplierIDName: any = null;
  public doughnutChartType: ChartType = 'doughnut';
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
  }
  ];
  options: any = {
    legend: { display: false }
  };
  inventryAccuracyGraphForm: FormGroup;
  maxValue: any = 100;
  minValue: any = 0;
  // toDate: any = new Date();
  // fromDate: any = new Date().setDate(this.toDate.getDate() - 30);
  // confirmedDateTo: any = new Date();
  // confirmedDateFrom: any = new Date().setDate(this.confirmedDateTo.getDate() - 30);
  inventoryAccuracySingle: any = [];
  inventoryAccuracyView: any[] = [350, 250];
  inventoryAccuracylegend: any = false;
  inventoryAccuracylegendPosition: any = 'below';
  inventoryAccuracycolorScheme = {
    domain: ['#5AA454']
  };
  @ViewChild("chart") chart3: turnOverDaysChart;
  public turnOverDaysChart: Partial<turnOverDaysChart>;
  tunOverDaysList: any;
  yearArrayList: any = [];
  quantityArrayList: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  @ViewChild("chart") chart: ChartOptions1;
  public chartOptions1: Partial<ChartOptions1>;

  constructor(private configService: ConfigurationService, private dashboardService: DashboardService,
    private wmsService: WMSService, private fb: FormBuilder, private toastr: ToastrService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
     }

  ngOnInit() {
    console.log(this.expiredProducts);
    if (this.getRole()) {
      this.expiredProducts = ['View', 'Update', 'Delete'];
      this.totalInventoryQuantity = ['View', 'Update', 'Delete'];
      this.stockinInventory = ['View', 'Update', 'Delete'];
      this.inventoryAccuracy = ['View', 'Update', 'Delete'];
      this.turnOverDays = ['View', 'Update', 'Delete'];
      this.topProdutsInventory = ['View', 'Update', 'Delete'];
    }
    this.getSupplierDetails();
    this.createInventoryAccuracyForm();
    this.findAllDashboardCountList();
    this.fetchInventoryAccuracyGraph();
    this.fetchTurnOverDays();
    this.topProductsInInventory();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.internalAdjustmentGraphDetailsgraph();
  }
  createInventoryAccuracyForm() {
    this.inventryAccuracyGraphForm = this.fb.group({
      confirmedDateFrom: [null],
      confirmedDateTo: [null]
    })
  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  someNumber:any
  roundOffNumber:any;
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
           this.someNumber = this.headerCountList.totalQuantityInventory
          this.roundOffNumber = DecimalUtils.fixedDecimal(this.someNumber,2)
          console.log(this.roundOffNumber);

        }
      },
      (error) => {

      });
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
            quantities.push(DecimalUtils.fixedDecimal(product.availableQuantity,3))})
          this.stockInInventoryLabels = labels;
          const resData = [];
          resData.push(quantities);
          this.stockInInventoryData = resData;
        }
      },
      (error) => {
      });
  }
  filterDataFromDates() {
    const form = this.inventryAccuracyGraphForm.value;
    if ((form.confirmedDateFrom && form.confirmedDateTo && form.confirmedDateFrom <= form.confirmedDateTo) || (!form.confirmedDateFrom || !form.confirmedDateTo)) {
      this.fetchInventoryAccuracyGraph();
    } else {
      this.toastr.error('Select valid date');
    }
  }
  reset() {
    // this.confirmedDateTo = new Date();
    // this.confirmedDateFrom = new Date().setDate(this.confirmedDateTo.getDate() - 30);
    this.createInventoryAccuracyForm();
    this.fetchInventoryAccuracyGraph();
  }
  fetchInventoryAccuracyGraph() {
    const data = [];
    const obj = {};
    // const datesObj = { fromDate: this.fromDate, toDate: this.toDate };
    obj["organizationID"] = this.configService.getOrganization().organizationID,
      obj["organizationName"] = this.configService.getOrganization().organizationName,
      obj["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      obj["wareHouseID"] = this.configService.getWarehouse().wareHouseID,
      obj["wareHouseName"] = this.configService.getWarehouse().wareHouseName,
      obj["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName,
      obj["confirmedDateFrom"] = this.inventryAccuracyGraphForm.controls.confirmedDateFrom.value ? this.inventryAccuracyGraphForm.controls.confirmedDateFrom.value : null
    obj["confirmedDateTo"] = this.inventryAccuracyGraphForm.controls.confirmedDateFrom.value ? this.inventryAccuracyGraphForm.controls.confirmedDateTo.value : null
    this.dashboardService.fetchInventoryAccuracy(obj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.InventoryAccuracyResponse) {
          if (response.data.InventoryAccuracyResponse.inventoryTotalAccuracy) {
            const percentageValue = (response.data.InventoryAccuracyResponse.inventoryAccuracy / response.data.InventoryAccuracyResponse.inventoryTotalAccuracy) * 100;
            console.log(percentageValue);
            data.push({ name: '', value: percentageValue });
            this.inventoryAccuracySingle = data;
          }
          else {
            this.inventoryAccuracySingle = [];
          }
        }
        else {
          this.inventoryAccuracySingle = [];
        }
      },
      (error) => {
      });
  }
  fetchTurnOverDays() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      orderType: 'Purchase Order'
    }
    this.dashboardService.fetchYearWiseProductWiseTotalQuantityInventory(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryYearQuantityList) {
          this.tunOverDaysList = response.data.inventoryYearQuantityList
          this.tunOverDaysList.forEach(turnOverDays => {
            this.yearArrayList.push(turnOverDays.year)
            this.quantityArrayList.push(DecimalUtils.fixedDecimal(turnOverDays.quantity,3))
            this.turnOverDaysChart = {
              series: [
                {
                  name: '',
                  data: this.quantityArrayList
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
                categories: this.yearArrayList
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
                    return "Quantity " + val + "";
                  }
                }
              }
            };
          })
        }
      })
  }
  topProductsProductsIDArray: any = []
  topProductsQuantityArray: any = []

  topProductsInInventory() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.dashboardService.findTopProductsInInvetory(form.organizationIDName, form.wareHouseIDName).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.TopProductsInInventory) {
          response.data.TopProductsInInventory.forEach(product => {

            if (product && product.productID != null && product.productID != undefined) {
              this.topProductsProductsIDArray.push(product.productID)
            }
            else {
              this.topProductsProductsIDArray.push(0)
            }
            if (product && product.quantity != null && product.quantity != undefined) {
              this.topProductsQuantityArray.push(DecimalUtils.fixedDecimal(product.quantity,3))
            }
            else {
              this.topProductsQuantityArray.push(0);
            }
          })
        }
        this.chartOptions1 = {
          series: [
            {
              name: "",
              data: this.topProductsQuantityArray
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
            categories: this.topProductsProductsIDArray

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

                return "Quantity " + val + "";
              }
            }
          }
        };

      },
      (error) => {
      });
  }
  totalinventoryAdjustmentsCountObjectList:any;
  internalAdjustmentGraphDetailsgraph() {
    const reqForm = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
   /*  if ((this.inboundOutboundDashboardsForm.value.createdDateFrom === "" || this.inboundOutboundDashboardsForm.value.createdDateFrom === null) &&
      (this.inboundOutboundDashboardsForm.value.createdDateTo === "" || this.inboundOutboundDashboardsForm.value.createdDateTo === null)) {
      reqObject["createdDateFrom"] = this.inboundOutboundDashboardsForm.value.assignedDateFrom,
        reqObject["createdDateTo"] = this.inboundOutboundDashboardsForm.value.assignedDateTo
      reqObject["assignedDateFrom"] = null,
        reqObject["assignedDateTo"] = null
    }
    else if (this.inboundOutboundDashboardsForm.value.createdDateFrom != null && this.inboundOutboundDashboardsForm.value.createdDateTo != null) {
      reqObject["createdDateFrom"] = this.inboundOutboundDashboardsForm.value.createdDateFrom,
        reqObject["createdDateTo"] = this.inboundOutboundDashboardsForm.value.createdDateTo,
        reqObject["assignedDateFrom"] = null,
        reqObject["assignedDateTo"] = null
    }
    else {
    } */
    this.wmsService.fetchAllInternalAdjustmentsInboundOutboundDashboardsGraphDetail(reqForm).subscribe(response => {
      if (response && response.status === 0 && response.data.inventoryAdjustmentsCount) {

        this.totalinventoryAdjustmentsCountObjectList = response.data.inventoryAdjustmentsCount;
        this.internalAdjustmentDetails = {
          series: [this.totalinventoryAdjustmentsCountObjectList.completedCount, this.totalinventoryAdjustmentsCountObjectList.approvedCount,
          this.totalinventoryAdjustmentsCountObjectList.inprocessCount, this.totalinventoryAdjustmentsCountObjectList.createdCount],
          chart: {
            width: 375,
            height: 375,
            type: "pie"
          },
          labels: ["Completed Count", "Approved Count", "In Process Count", "Created Count"],
          dataLabels: {
            formatter: function (val, opts) {
              return opts.w.config.series[opts.seriesIndex]
            },
          },
          legend: {
            formatter: function (series, opts) {
              return [series + " - " + opts.w.globals.series[opts.seriesIndex]]
            }
          },
          responsive: [
            {
              breakpoint: 480,
              options: {

                legend: {
                  position: "bottom"
                }
              }
            }
          ]
        }
      }
    })
  }
}
