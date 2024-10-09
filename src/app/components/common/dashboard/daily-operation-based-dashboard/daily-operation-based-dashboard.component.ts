
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexResponsive,
  ApexXAxis,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexStroke,
  ApexTitleSubtitle,
  ApexYAxis,
  ApexTooltip,
  ChartComponent,
  ApexTheme,
  ApexStates,
  ApexOptions
} from "ng-apexcharts";
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ConfigurationService } from "src/app/services/integration-services/configuration.service";
import { WMSService } from "src/app/services/integration-services/wms.service";
import { DatePipe } from "@angular/common";
import { ToastrService } from "ngx-toastr";
import { Storage } from '../../../../shared/utils/storage';
import { TranslateService } from "@ngx-translate/core";



export type UnloadCountTypeDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type qualityCheckDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type goodsReceiptNotesDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type putawayCompletedObjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type pickingsCompletedObjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type purchaseordrObjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type salesOrderObjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type shipmentOrdersObjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
/* outBound Dashboards */
export type loadOutboundrobjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type outboundQualityCheckobjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type replishmentHistoryOrderObjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type goodsReceiptObjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};

export type packingShipmentOrderObjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type rePackingShipmentOrderObjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type coPackingShipmentOrdersOdjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};
export type labellingShipmentOrderobjectDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke
};

@Component({
  selector: 'app-daily-operation-based-dashboard',
  templateUrl: './daily-operation-based-dashboard.component.html',
  styleUrls: ['./daily-operation-based-dashboard.component.scss']
})
export class DailyOperationBasedDashboardComponent implements OnInit {

  inboundUnloading = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Inbound Unloading', Storage.getSessionUser());
  inboundOrderDetails = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Inbound Order Details', Storage.getSessionUser());
  inboundQualityCheck = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Inbound Quality Check', Storage.getSessionUser());
  inboundPurchaseOrder = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Inbound Purchase Order', Storage.getSessionUser());
  inboundGoodsReceiving = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Inbound Goods Receiving', Storage.getSessionUser());
  inboundPutawayCompleted = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Inbound Putaway Completed', Storage.getSessionUser());
  outboundSalesOrder = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Sales Order', Storage.getSessionUser());
  outboundReplenishmentOrderHistory = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Replenishment Order History', Storage.getSessionUser());
  outboundPickingCompleted = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Picking Completed', Storage.getSessionUser());
  outboundQualityCheck = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Quality Check', Storage.getSessionUser());
  outboundPacking = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Packing', Storage.getSessionUser());
  outboundRepacking = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Repacking', Storage.getSessionUser());
  outboundCopacking = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Copacking', Storage.getSessionUser());
  outboundLabelling = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Labelling', Storage.getSessionUser());
  outboundShipmentOrder = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Shipment Order', Storage.getSessionUser());
  outboundLoading = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Loading', Storage.getSessionUser());
  outboundOrderDetails = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Daily Operations', 'Outbound Order Details', Storage.getSessionUser());


  releasedForPackingCountObj: any
  tableObjectCuntDailyCountOperationResponceList: any;
  inCoPackingCountobj: any
  releasedForOutwardQualityCheckCountobj: any
  releasedForPutawayCountobj: any
  releasedForRePackingCountobj: any
  inPackingCountobj: any
  inRePackingCountobj: any
  inLabelingCountobj: any
  inGrnCountobj: any
  releasedForShipmentOrdersCountobj: any
  releasedForPickingCountobj: any
  inLoadCountobj: any
  inInwardQualityCheckCountobj: any
  releasedForInwardQualityCheckCountobj: any
  releasedForGrnCountobj: any
  inPickingCountobj: any
  inShipmentOrdersCountobj: any
  releasedForUnloadCountobj: any
  releasedForLoadCountobj: any
  releasedForCoPackingCountobj: any
  releasedForLabelingCountobj: any
  inUnloadCountobj: any
  inPutawayCountobj: any
  inOutwardQualityCheckCountobj: any
  totalInBoundCountDisplay: any;
  totalOutBoundCountDisplay: any;
  @ViewChild("chart") chart: ChartComponent;
  public loadOutboundrobjectDetails: Partial<loadOutboundrobjectDetails>;

  public outboundQualityCheckobjectDetails: Partial<outboundQualityCheckobjectDetails>;

  public UnloadCountTypeDetails: Partial<UnloadCountTypeDetails>;

  public qualityCheckDetails: Partial<qualityCheckDetails>;

  public goodsReceiptNotesDetails: Partial<goodsReceiptNotesDetails>;

  public putawayCompletedObjectDetails: Partial<putawayCompletedObjectDetails>

  public pickingsCompletedObjectDetails: Partial<pickingsCompletedObjectDetails>

  public purchaseordrObjectDetails: Partial<purchaseordrObjectDetails>

  public salesOrderObjectDetails: Partial<salesOrderObjectDetails>

  public shipmentOrdersObjectDetails: Partial<shipmentOrdersObjectDetails>

  public replishmentHistoryOrderObjectDetails: Partial<replishmentHistoryOrderObjectDetails>

  public goodsReceiptObjectDetails: Partial<goodsReceiptObjectDetails>

  public packingShipmentOrderObjectDetails: Partial<packingShipmentOrderObjectDetails>

  public rePackingShipmentOrderObjectDetails: Partial<rePackingShipmentOrderObjectDetails>

  public coPackingShipmentOrdersOdjectDetails: Partial<coPackingShipmentOrdersOdjectDetails>

  public labellingShipmentOrderobjectDetails: Partial<labellingShipmentOrderobjectDetails>

  odderStatusTransactionDashboardsForms: FormGroup
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private translate: TranslateService,
    private wmsService: WMSService, private datepipe: DatePipe,private toastr: ToastrService) { 
      this.translate.use(this.language);
    }

  createOrderStatusTranactionDashboardsForm(){
    this.odderStatusTransactionDashboardsForms = this.fb.group({
      fromDate: [this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd')],
      toDate: [this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd')],
      orderType: ['Sales Order'],
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      dummyOrderType:['Purchase Order']
    })
  }
  fromDates:any;
  toDates:any;
  filterDataFromDates() {
    this.fromDates = this.odderStatusTransactionDashboardsForms.value.fromDate;
    this.toDates = this.odderStatusTransactionDashboardsForms.value.toDate;
    if (this.fromDates <= this.toDates) {
      this.filter();
    } else {
      this.toastr.error('Select valid date difference');
      this.odderStatusTransactionDashboardsForms.get("fromDate").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'));
      this.odderStatusTransactionDashboardsForms.get("toDate").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'));
    }
  }


  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createOrderStatusTranactionDashboardsForm();
    this.putawayCompletedGraphCall();
    this.pickingCompletedGraphCall();
    this.purchaseOrderGraphCall();
    this.salesOrderGraphCall();
    this.shipmentOrdersGraphCall();
    this.replishmentHistoryOrderGraphCall();
    this.goodsReceipCountGraphCall();
   /// this.goodsReceiptNotesGraphCall();
    this.packingShipmentOrderGraphCall();
    this.rePackingShipmentOrderGraphCall();
    this.coPackingShipmentOrdersGraphCall();
    this.labellingShipmentOrderGraphCall();
    this.tableObjectCount();
    this.InboundUnloadingGraphCall();
    this.InboundQualityCheckGraphCall();
    this.loadOutboundGraphCall();
    this.outBoundCheckListGraphCall();
    this.odderStatusTransactionDashboardsForms.get("orderType").setValue("Sales Order")
    this.odderStatusTransactionDashboardsForms.get("dummyOrderType").setValue("Purchase Order")
  }
  filter() {
    this.InboundUnloadingGraphCall();
    this.InboundQualityCheckGraphCall();
    this.putawayCompletedGraphCall();
    this.pickingCompletedGraphCall();
    this.purchaseOrderGraphCall();
    this.salesOrderGraphCall();
    this.shipmentOrdersGraphCall();
    this.replishmentHistoryOrderGraphCall();
    this.goodsReceipCountGraphCall();
  //  this.goodsReceiptNotesGraphCall();
    this.packingShipmentOrderGraphCall();
    this.rePackingShipmentOrderGraphCall();
    this.coPackingShipmentOrdersGraphCall();
    this.labellingShipmentOrderGraphCall();
    this.tableObjectCount();

  }
  reset() {
    this.odderStatusTransactionDashboardsForms.reset();
   // this.odderStatusTransactionDashboardsForms.get("fromDate").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'))
   // this.odderStatusTransactionDashboardsForms.get("toDate").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'))
  //  this.odderStatusTransactionDashboardsForms.get("orderType").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'))
  //  this.odderStatusTransactionDashboardsForms.get("fromDate").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'))
   // this.odderStatusTransactionDashboardsForms.get("orderType").setValue("Purchase Order");
   this.createOrderStatusTranactionDashboardsForm();
  }
  goodsReceiptNotesResponceList: any;
  InboundUnloadingGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.goodsReceiptNotesDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.grnNoteCount) {
        this.goodsReceiptNotesResponceList = response.data.grnNoteCount
        this.UnloadCountTypeDetails = {
          series: [this.goodsReceiptNotesResponceList.unloadCount],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  InboundQualityCheckGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.goodsReceiptNotesDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.grnNoteCount) {

        this.goodsReceiptNotesResponceList = response.data.grnNoteCount;
        this.qualityCheckDetails = {
          series: [this.goodsReceiptNotesResponceList.inboundQualityCheckCount],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
/*   goodsReceiptNotesGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.goodsReceiptNotesDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.grnNoteCount) {

        this.goodsReceiptNotesResponceList = response.data.grnNoteCount
        this.goodsReceiptNotesDetails = {
          series: [this.goodsReceiptNotesResponceList.outboundQualityCheckCount, this.goodsReceiptNotesResponceList.unloadCount,
          this.goodsReceiptNotesResponceList.inboundQualityCheckCount, this.goodsReceiptNotesResponceList.loadCount],
          chart: {
            width: 400,
            height: 400,
            type: "pie"
          },
          colors: ["#808b96", "#febe42", "#10e49c"],
          labels: ['Outbound Quality Check Count', 'Unload Count', 'Inbound Quality Check Count', 'Load Count'],
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
          plotOptions: {

          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 350,
                  height: 350
                },
                legend: {
                  position: "bottom"
                }
              }
            }
          ]
        }
      }
    })
  } */
  putawayCompletedResponceList: any;
  putawayCompletedGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.dummyOrderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.putawayCompletedDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.putawaysCount) {

        this.putawayCompletedResponceList = response.data.putawaysCount
        this.putawayCompletedObjectDetails = {
          series: [this.putawayCompletedResponceList.completedCount],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  pickingsCompletedResponceList: any;
  pickingCompletedGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.pickingCompletedDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.pickingsCount) {

        this.pickingsCompletedResponceList = response.data.pickingsCount
        this.pickingsCompletedObjectDetails = {
          series: [this.pickingsCompletedResponceList.completedCount],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  purchaseOderResponceList: any;
  purchaseOrderGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.purchaseOrderDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.purchaseOrdersCount) {
        this.purchaseOderResponceList = response.data.purchaseOrdersCount
        this.purchaseordrObjectDetails = {
          series: [this.purchaseOderResponceList],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        };
        }
      })
    }
  salesOrdertResponceList: any;
  salesOrderGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.salesOrderDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.salesOrdersCount) {

        this.salesOrdertResponceList = response.data.salesOrdersCount

        this.salesOrderObjectDetails = {
          series: [this.salesOrdertResponceList],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  shipmentvOrderResponceList: any;
  shipmentOrdersGraphCall() {

    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.shipmentOrderDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status == 0){
        this.shipmentvOrderResponceList = response.data.shipmentOrdersCount
        this.shipmentOrdersObjectDetails = {
          series: [this.shipmentvOrderResponceList],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        };
        /*   this.shipmentOrdersObjectDetails = {
            series: [this.shipmentvOrderResponceList],
            chart: {
              width: 340,
              height: 340,
              type: "pie"
            },
            colors: ["#808b96"],
            labels: ["Shipment Order Count"],
            dataLabels: {
              formatter: function (val, opts) {
                return opts.w.config.series[opts.seriesIndex]
              },
            },
            legend: {
              formatter: function (series, opts) {
                return [series, " - ", opts.w.globals.series[opts.seriesIndex]]
              }
            },
            plotOptions: {

            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200,
                    height: 350
                  },
                  legend: {
                    position: "bottom"
                  }
                }
              }
            ]
          } */
      }
    })
  }
  /* Outbound Dashboards Details */
  loadOutboundResponceList: any;
  loadOutboundGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.goodsReceiptNotesDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.grnNoteCount) {
        this.loadOutboundResponceList = response.data.grnNoteCount
        this.loadOutboundrobjectDetails = {
          series: [this.loadOutboundResponceList.loadCount],

          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  outBoundCheckListGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.goodsReceiptNotesDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.grnNoteCount) {
        this.goodsReceiptNotesResponceList = response.data.grnNoteCount
        this.outboundQualityCheckobjectDetails = {
          series: [this.goodsReceiptNotesResponceList.outboundQualityCheckCount],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  replishmentHistoryOrderResponceList: any;
  replishmentHistoryOrderGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.replishmentOrderHistoryDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0) {
        this.replishmentHistoryOrderResponceList = response.data.replenishmentOrderHistorysCount
        this.replishmentHistoryOrderObjectDetails = {
          series: [this.replishmentHistoryOrderResponceList],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  goodsReceiptCountResponceList: any;
  goodsReceipCountGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.goodsReceiptCountDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.goodsReceiptsCount) {

        this.goodsReceiptCountResponceList = response.data.goodsReceiptsCount
        this.goodsReceiptObjectDetails = {
          series: [this.goodsReceiptCountResponceList],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  packingShipmentOrderResponceList: any;
  packingShipmentOrderGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.packingShipmentOrdersDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.packingCountMap) {

        this.packingShipmentOrderResponceList = response.data.packingCountMap

        this.packingShipmentOrderObjectDetails = {
          series: [ this.packingShipmentOrderResponceList.packingCount],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  rePackingShipmentOrderResponceList: any;
  rePackingShipmentOrderGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.rePackingShipmentOrdersDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.rePackingCountMap) {

        this.rePackingShipmentOrderResponceList = response.data.rePackingCountMap
        this.rePackingShipmentOrderObjectDetails = {
          series: [this.rePackingShipmentOrderResponceList.rePackingCount],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  coPackingShipmentOrdersResponseList: any;
  coPackingShipmentOrdersGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.coPackingShipmentOrdersDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.coPackingCountMap) {

        this.coPackingShipmentOrdersResponseList = response.data.coPackingCountMap
        this.coPackingShipmentOrdersOdjectDetails = {
          series: [this.coPackingShipmentOrdersResponseList.coPackingCount],
          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  labellingShipmentOrderResponceList: any;
  labellingShipmentOrderGraphCall() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.labellingDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.labelingCountMap) {

        this.labellingShipmentOrderResponceList = response.data.labelingCountMap
        this.labellingShipmentOrderobjectDetails = {
          series: [this.labellingShipmentOrderResponceList.labelingCount],

          chart: {
            height:230,
            type: "radialBar",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 225,
              hollow: {
                margin: 0,
                size: "70%",
                background: "#fff",
                image: undefined,
                position: "front",
                dropShadow: {
                  enabled: true,
                  top: 3,
                  left: 0,
                  blur: 4,
                  opacity: 0.24
                }
              },
              track: {
                background: "#fff",
                strokeWidth: "67%",
                margin: 0, // margin is in pixels
                dropShadow: {
                  enabled: true,
                  top: -3,
                  left: 0,
                  blur: 4,
                  opacity: 0.35
                }
              },

              dataLabels: {
                show: true,
                name: {
                  offsetY: -10,
                  show: true,
                  color: "#888",
                  fontSize: "17px"
                },
                value: {
                  formatter: function(val) {
                    return parseInt(val.toString(), 10).toString();
                  },
                  color: "#111",
                  fontSize: "36px",
                  show: true
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "horizontal",
              shadeIntensity: 0.5,
              gradientToColors: ["#ABE5A1"],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: "round"
          },
          labels: [""]
        }
      }
    })
  }
  tableObjectCount() {
    const reqObject={
      // fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      // toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      fromDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.fromDate.value),'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date(this.odderStatusTransactionDashboardsForms.controls.toDate.value),'yyyy-MM-dd'),
      
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.tableObjectCountDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0) {
        this.tableObjectCuntDailyCountOperationResponceList = response.data.ordersCount
        this.releasedForPackingCountObj = this.tableObjectCuntDailyCountOperationResponceList.releasedForPackingCount
        this.inCoPackingCountobj = this.tableObjectCuntDailyCountOperationResponceList.inCoPackingCount
        this.releasedForOutwardQualityCheckCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForOutwardQualityCheckCount
        this.releasedForPutawayCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForPutawayCount
        this.releasedForRePackingCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForRePackingCount
        this.inPackingCountobj = this.tableObjectCuntDailyCountOperationResponceList.inPackingCount
        this.inRePackingCountobj = this.tableObjectCuntDailyCountOperationResponceList.inRePackingCount
        this.inLabelingCountobj = this.tableObjectCuntDailyCountOperationResponceList.inLabelingCount
        this.inGrnCountobj = this.tableObjectCuntDailyCountOperationResponceList.inGrnCount
        this.releasedForShipmentOrdersCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForShipmentOrdersCount
        this.releasedForPickingCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForPickingCount
        this.inLoadCountobj = this.tableObjectCuntDailyCountOperationResponceList.inLoadCount
        this.inInwardQualityCheckCountobj = this.tableObjectCuntDailyCountOperationResponceList.inInwardQualityCheckCount
        this.releasedForInwardQualityCheckCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForInwardQualityCheckCount
        this.releasedForGrnCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForGrnCount
        this.inPickingCountobj = this.tableObjectCuntDailyCountOperationResponceList.inPickingCount
        this.inShipmentOrdersCountobj = this.tableObjectCuntDailyCountOperationResponceList.inShipmentOrdersCount
        this.releasedForUnloadCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForUnloadCount
        this.releasedForLoadCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForLoadCount
        this.releasedForCoPackingCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForCoPackingCount
        this.releasedForLabelingCountobj = this.tableObjectCuntDailyCountOperationResponceList.releasedForLabelingCount
        this.inUnloadCountobj = this.tableObjectCuntDailyCountOperationResponceList.inUnloadCount
        this.inPutawayCountobj = this.tableObjectCuntDailyCountOperationResponceList.inPutawayCount
        this.inOutwardQualityCheckCountobj = this.tableObjectCuntDailyCountOperationResponceList.inOutwardQualityCheckCount
      }
      /* Inbound Total */
      this.totalInBoundCountDisplay = Number(this.releasedForUnloadCountobj)
        + Number(this.inUnloadCountobj) + Number(this.inOutwardQualityCheckCountobj) + Number(this.releasedForGrnCountobj) + Number(this.inGrnCountobj)
        + Number(this.releasedForPutawayCountobj) + Number(this.inPutawayCountobj) + Number(this.releasedForInwardQualityCheckCountobj)


      /* OtBound Total */

      this.totalOutBoundCountDisplay = this.releasedForPickingCountobj + this.inPickingCountobj + Number(this.releasedForOutwardQualityCheckCountobj) +
        this.releasedForPackingCountObj + this.inPackingCountobj + Number(this.releasedForRePackingCountobj) + this.inRePackingCountobj +
        this.releasedForCoPackingCountobj + this.inCoPackingCountobj + this.releasedForLabelingCountobj + + this.inLabelingCountobj +
        + this.releasedForShipmentOrdersCountobj + this.releasedForLoadCountobj + this.inLoadCountobj

    })
  }
}
