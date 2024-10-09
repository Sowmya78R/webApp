import { Component, Input, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Storage } from '../../../../../shared/utils/storage';

import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexFill,
} from "ng-apexcharts";

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexYAxis,
  ApexTooltip,
  ApexMarkers,
  ApexXAxis,
  ApexPlotOptions
} from "ng-apexcharts";
import { ConfigurationService } from "src/app/services/integration-services/configuration.service";
import { DashboardService } from "src/app/services/integration-services/dashboard.service";
import { WMSService } from "src/app/services/integration-services/wms.service";
import { ChartOptions2 } from "../perfectordervolumerate/perfectordervolumerate.component";
import { TranslateService } from "@ngx-translate/core";
import { DecimalUtils } from "src/app/constants/decimal";

export type ChartOptions1 = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  labels: string[];
  stroke: any; // ApexStroke;
  markers: ApexMarkers;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  tooltip: ApexTooltip;
};

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
};

@Component({
  selector: 'app-ordervolumefillrate',
  templateUrl: './ordervolumefillrate.component.html',
  styleUrls: ['./ordervolumefillrate.component.scss']
})
export class OrdervolumefillrateComponent implements OnInit {


  orderFillRatePermission = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Order Fill Rate', Storage.getSessionUser());
  orderFillRatePercentagepermissions = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Order Fill Rate Percentage', Storage.getSessionUser());
  volumeFillRatepermissions = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Volume Fill Rate', Storage.getSessionUser());
  volumeFillRatePercentagepermissions = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Volume Fill Rate Percentage', Storage.getSessionUser());


  @Input() item = '';
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private fb: FormBuilder, private wmsService: WMSService,
    private dashboardService: DashboardService, private configService: ConfigurationService, private translate: TranslateService,) {
    this.translate.use(this.language);

    this.createorderVolumeFillRateForm();
    this.wmsService.passingOrderRateDashboardData.subscribe((data) => {
      console.log(data);
    })
  }
  ngOnChanges(changes: SimpleChanges) {
    this.getGraphData(changes.item.currentValue);
    this.item = changes.item.currentValue;
  }
  @Input() getPassedData

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  @ViewChild("chart1") chart1: ChartOptions1;
  public ChartOptions1: Partial<ChartOptions1>;

  @ViewChild("chart3") chart3: ChartComponent;
  public chartOptions3: Partial<ChartOptions>;

  @ViewChild("chart2") chart2: ChartOptions2;
  public ChartOptions2: Partial<ChartOptions2>;

  title = 'appBootstrap';
  yearDisplay: boolean;
  monthDisplay: boolean;
  dateDisplay: boolean;
  model;
  onOpenCalendar(container) {
    container.yearSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('year');
  }

  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      console.log(role);
      return ['ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  onChangePeriods(data) {
    if (data === 'year') {
      this.yearDisplay = true;
      this.monthDisplay = false;
      this.dateDisplay = false;
    }
    else if (data === 'month') {
      this.yearDisplay = false;
      this.monthDisplay = true;
      this.dateDisplay = false;
    }
    else if (data === 'date') {
      this.yearDisplay = false;
      this.monthDisplay = false;
      this.dateDisplay = true;
    }
  }
  orderVolumeFillRateForm: FormGroup
  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    console.log(this.getRole);
    if (this.getRole()) {
      this.orderFillRatePermission = ['View', 'Update', 'Delete'];
      this.orderFillRatePercentagepermissions = ['View', 'Update', 'Delete'];
      this.volumeFillRatepermissions = ['View', 'Update', 'Delete'];
      this.volumeFillRatePercentagepermissions = ['View', 'Update', 'Delete'];
      console.log(this.orderFillRatePermission);
    }
    console.log(this.orderFillRatePermission);
    console.log(this.getPassedData)
    this.yearDisplay = true;
    this.monthDisplay = false;
    this.dateDisplay = false;
    // this.semiRadialBaarGrph(0);
    // this.mainGraphBaar();
  }

  getGraphData(payload) {
    if (payload.type) {
      switch (payload.monthFrom) {
        case "01":
          payload.monthFrom = parseInt("1");
          break;
        case "02":
          payload.monthFrom = parseInt("2");
          break;
        case "03":
          payload.monthFrom = parseInt("3");
          break;
        case "04":
          payload.monthFrom = parseInt("4");
          break;
        case "05":
          payload.monthFrom = parseInt("5");
          break;
        case "06":
          payload.monthFrom = parseInt("6");
          break;
        case "07":
          payload.monthFrom = parseInt("7");
          break;
        case "08":
          payload.monthFrom = parseInt("8");
          break;
        case "09":
          payload.monthFrom = parseInt("9");
          break;
        case "10":
          payload.monthFrom = parseInt("10");
          break;
        case "11":
          payload.monthFrom = parseInt("11");
          break;
        case "12":
          payload.monthFrom = parseInt("12");
          break;
      }
      switch (payload.monthTo) {
        case "01":
          payload.monthTo = parseInt("1");
          break;
        case "02":
          payload.monthTo = parseInt("2");
          break;
        case "03":
          payload.monthTo = parseInt("3");
          break;
        case "04":
          payload.monthTo = parseInt("4");
          break;
        case "05":
          payload.monthTo = parseInt("5");
          break;
        case "06":
          payload.monthTo = parseInt("6");
          break;
        case "07":
          payload.monthTo = parseInt("7");
          break;
        case "08":
          payload.monthTo = parseInt("8");
          break;
        case "09":
          payload.monthTo = parseInt("9");
          break;
        case "10":
          payload.monthTo = parseInt("10");
          break;
        case "11":
          payload.monthTo = parseInt("11");
          break;
        case "12":
          payload.monthTo = parseInt("12");
          break;
      }
      this.dashboardService.fetchOrderFillRateDetails(payload).subscribe(res => {
        if (res['status'] == 0 && res.data.responseMap && res.data.responseMap.periodWiseShipmentOrderResponseList && res.data.responseMap.periodWiseShipmentOrderResponseList.length > 0) {
          if (payload.type == 'Day') {
            if (res.data.responseMap.periodWiseShipmentOrderResponseList.length > 0) {
              res.data.responseMap.periodWiseShipmentOrderResponseList.forEach(element => {
                const value = element.period;
                element.period = value.split(' ')[2] + '-' + value.split(' ')[1] + '-' + value.split(' ')[5];
              });
            }
          }
          this.semiRadialBaarGrph(res.data.responseMap.netNoOfDispatchOrdersPercentage, res.data.responseMap.netDispatchQuantityPercentage);
          this.mainGraphBaar(res.data.responseMap.periodWiseShipmentOrderResponseList);

        }
        else {
          this.semiRadialBaarGrph(0, 0);
          this.mainGraphBaar();
        }
      })
    }
  }


  createorderVolumeFillRateForm() {
    this.orderVolumeFillRateForm = this.fb.group({
      periodChangeType: [null],
      yearChangeType: [null],
      monthChangeType: [null],
      dateChangeType: [null]
    })
  }

  semiRadialBaarGrph(order, quantity) {
    this.chartOptions = {
      series: [DecimalUtils.showLimitedDecimals(order)],
      chart: {
        type: "radialBar",
        offsetY: -20
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: "#e7e7e7",
            strokeWidth: "97%",
            margin: 5, // margin is in pixels
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              opacity: 0.31,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              offsetY: -2,
              fontSize: "22px"
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91]
        }
      },
      labels: ["Average Results"]
    };
    this.chartOptions3 = {
      series: [DecimalUtils.fixedDecimal(quantity,3)],
      chart: {
        type: "radialBar",
        offsetY: -20
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: "#e7e7e7",
            strokeWidth: "97%",
            margin: 5, // margin is in pixels
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              opacity: 0.31,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              offsetY: -2,
              fontSize: "22px"
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91]
        }
      },
      labels: ["Average Results"]
    };
  }
  mainGraphBaar(arr?) {
    this.ChartOptions1 = {
      series: [
        {
          name: "TEAM B",
          type: "area",
          data: arr ? arr.map(x => DecimalUtils.fixedDecimal(x.order,3)):[]
        }

      ],
      chart: {
        height: 300,
        type: "line",
        stacked: false
      },
      stroke: {
        width: [0, 2, 5],
        curve: "smooth"
      },
      plotOptions: {
        bar: {
          columnWidth: "50%"
        }
      },

      fill: {
        opacity: [0.85, 0.25, 1],
        gradient: {
          inverseColors: false,
          shade: "light",
          type: "vertical",
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [0, 100, 100, 100]
        }
      },
      labels: arr ? arr.map(x => x.period) : [],
      markers: {
        size: 0
      },
      xaxis: {
        type: "category",
        categories: arr ? arr.map(x => x.period) : [],
      },
      yaxis: {
        title: {
          text: "Percentage"
        },
        min: 0
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (typeof y !== "undefined") {
              return y.toFixed(0) + " points";
            }
            return y;
          }
        }
      }
    };
    this.ChartOptions2 = {
      series: [
        {
          name: "TEAM B",
          type: "area",
          data: arr ? arr.map(x => DecimalUtils.fixedDecimal(x.dispatchQuantity,3)) : []
        },

      ],
      chart: {
        height: 300,
        type: "line",
        stacked: false
      },
      stroke: {
        width: [0, 2, 5],
        curve: "smooth"
      },
      plotOptions: {
        bar: {
          columnWidth: "50%"
        }
      },

      fill: {
        opacity: [0.85, 0.25, 1],
        gradient: {
          inverseColors: false,
          shade: "light",
          type: "vertical",
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [0, 100, 100, 100]
        }
      },
      labels: arr ? arr.map(x => x.period) : [],
      markers: {
        size: 0
      },
      xaxis: {
        type: "category",
        categories: arr ? arr.map(x => x.period) : [],
      },
      yaxis: {
        title: {
          text: "Percentage"
        },
        min: 0
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (typeof y !== "undefined") {
              return y.toFixed(0) + " points";
            }
            return y;
          }
        }
      }
    };
  }
  public generateData(count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = "w" + (i + 1).toString();
      var y =
        Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

      series.push({
        x: x,
        y: y
      });
      i++;
    }
    return series;
  }
}
