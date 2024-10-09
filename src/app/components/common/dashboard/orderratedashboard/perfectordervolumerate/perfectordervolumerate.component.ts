import { DatePipe } from "@angular/common";
import { Component, Input, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { formatDate } from '@angular/common';

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
import { WMSService } from "src/app/services/integration-services/wms.service";
import { Subscription } from "rxjs";
import { DashboardService } from "src/app/services/integration-services/dashboard.service";
import { ConfigurationService } from "src/app/services/integration-services/configuration.service";
import { Storage } from '../../../../../shared/utils/storage';
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
export type ChartOptions2 = {
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

export type ChartOptions3 = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
};

@Component({
  selector: 'app-perfectordervolumerate',
  templateUrl: './perfectordervolumerate.component.html',
  styleUrls: ['./perfectordervolumerate.component.scss']
})
export class PerfectordervolumerateComponent implements OnInit {




  perfectOrderRatepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Perfect Order Rate', Storage.getSessionUser());
  perfectOrderRatePercentagepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Perfect Order Rate Percentage', Storage.getSessionUser());
  perfectVolumeRatepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Perfect Volume Rate', Storage.getSessionUser());
  perfectVolumeRatePercentagepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Perfect Volume Rate Percentage', Storage.getSessionUser());

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  @ViewChild("chart1") chart1: ChartOptions1;
  public ChartOptions1: Partial<ChartOptions1>;
  subscription: Subscription;

  @ViewChild("chart3") chart3: ChartComponent;
  public chartOptions3: Partial<ChartOptions>;

  @ViewChild("chart2") chart2: ChartOptions2;
  public ChartOptions2: Partial<ChartOptions2>;
  // subscription: Subscription;

  @Input() item = '';
  perfectOrderVolumeRateForm: FormGroup;
  valueimg: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private fb: FormBuilder, private wmsService: WMSService, private datepipe: DatePipe,
    private dashboardService: DashboardService, private configService: ConfigurationService , private translate: TranslateService,) {
      this.translate.use(this.language);
    // this.subscription = this.wmsService.passingOrderRateDashboardData.subscribe((data) => {
    // this.createonTimeDeliveryQuantityForm();
    // this.perfectOrderVolumeRateForm.reset();
    // console.log(data);
    // this.valueimg = data;
    // if (data != {}) {
    //   this.perfectOrderVolumeRateForm.controls.yearChangeType.setValue(data.yearChangeType ? formatDate(data.yearChangeType, 'yyyy', 'en'):null);
    //   this.perfectOrderVolumeRateForm.controls.monthChangeType.setValue(data.monthChangeType ? formatDate(data.monthChangeType, 'yyyy-MM', 'en'):null);
    //   this.perfectOrderVolumeRateForm.controls.dateChangeType.setValue(data.dateChangeType ? formatDate(data.dateChangeType, 'yyyy-MM-dd', 'en'):null);
    //   console.log(this.perfectOrderVolumeRateForm.value.yearChangeType);
    //   console.log(this.perfectOrderVolumeRateForm.value.monthChangeType);
    //   console.log(this.perfectOrderVolumeRateForm.value.dateChangeType);
    // }
    // data.yearChangeType = ''
    // data.monthChangeType = ''
    // data.dateChangeType = ''
    // console.log(data);
    // })
    // this.perfectOrderVolumeRateForm.controls.yearChangeType.setValue(null);
    // this.perfectOrderVolumeRateForm.controls.monthChangeType.setValue(null);
    // this.perfectOrderVolumeRateForm.controls.dateChangeType.setValue(null);
  }
  ngOnChanges(changes: SimpleChanges) {
    this.getGraphData(changes.item.currentValue);
    this.item = changes.item.currentValue;
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
      this.dashboardService.fetchPerfectVolumeVsDate(payload).subscribe(res => {
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
  createonTimeDeliveryQuantityForm() {
    this.perfectOrderVolumeRateForm = this.fb.group({
      periodChangeType: [null],
      yearChangeType: [null],
      monthChangeType: [null],
      dateChangeType: [null]
    })
  }
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

  ngOnDestroy() {
   // this.subscription.unsubscribe();
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
  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    // this.yearDisplay = true;
    // this.monthDisplay = false;
    // this.dateDisplay = false;
    // this.semiRadialBaarGrph();
    // this.mainGraphBaar();
  }

  semiRadialBaarGrph(order, quantity) {
    this.chartOptions = {
      series: [DecimalUtils.fixedDecimal(order,3)],
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
          data: arr ? arr.map(x => DecimalUtils.fixedDecimal(x.order,3)) : []
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

