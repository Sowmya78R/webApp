
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
  ApexStates
} from "ng-apexcharts";
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ConfigurationService } from "src/app/services/integration-services/configuration.service";
import { WMSService } from "src/app/services/integration-services/wms.service";
import { DatePipe } from "@angular/common";
import { ToastrService } from "ngx-toastr";



export type UnloadCountTypeDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type qualityCheckDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type goodsReceiptNotesDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type putawayCompletedObjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type pickingsCompletedObjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type purchaseordrObjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type salesOrderObjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type shipmentOrdersObjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
/* outBound Dashboards */
export type loadOutboundrobjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type outboundQualityCheckobjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type replishmentHistoryOrderObjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type goodsReceiptObjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};

export type packingShipmentOrderObjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type rePackingShipmentOrderObjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type coPackingShipmentOrdersOdjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
export type labellingShipmentOrderobjectDetails = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: any;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  labels: any;
  colors: any;
  stroke: ApexStroke;
  theme: ApexTheme;
  states: ApexStates;
  pattern: any;
};
@Component({
  selector: 'app-orderstatustransactiondashboards',
  templateUrl: './orderstatustransactiondashboards.component.html',
  styleUrls: ['./orderstatustransactiondashboards.component.scss']
})
export class OrderstatustransactiondashboardsComponent implements OnInit {
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

  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private wmsService: WMSService, private datepipe: DatePipe,private toastr: ToastrService) { }

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
    this.createOrderStatusTranactionDashboardsForm();
    this.putawayCompletedGraphCall();
    this.pickingCompletedGraphCall();
    this.purchaseOrderGraphCall();
    this.salesOrderGraphCall();
    this.shipmentOrdersGraphCall();
    this.replishmentHistoryOrderGraphCall();
    this.goodsReceipCountGraphCall();
    this.goodsReceiptNotesGraphCall();
    this.packingShipmentOrderGraphCall();
    this.rePackingShipmentOrderGraphCall();
    this.coPackingShipmentOrdersGraphCall();
    this.labellingShipmentOrderGraphCall();
    this.tableObjectCount();
    this.unloadingGraphCall();
    this.qualityCheckGraphCall();
    this.loadOutboundGraphCall();
    this.outBoundCheckListGraphCall();
    this.odderStatusTransactionDashboardsForms.get("orderType").setValue("Sales Order")
    this.odderStatusTransactionDashboardsForms.get("dummyOrderType").setValue("Purchase Order")
  }
  filter() {
    this.putawayCompletedGraphCall();
    this.pickingCompletedGraphCall();
    this.purchaseOrderGraphCall();
    this.salesOrderGraphCall();
    this.shipmentOrdersGraphCall();
    this.replishmentHistoryOrderGraphCall();
    this.goodsReceipCountGraphCall();
    this.goodsReceiptNotesGraphCall();
    this.packingShipmentOrderGraphCall();
    this.rePackingShipmentOrderGraphCall();
    this.coPackingShipmentOrdersGraphCall();
    this.labellingShipmentOrderGraphCall();
    this.tableObjectCount();
    this.unloadingGraphCall();
    this.qualityCheckGraphCall();
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
  unloadingGraphCall() {
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
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96"],
          labels: ['Unload Count'],
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
                  width: 200,
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
  }
  qualityCheckGraphCall() {
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
        this.qualityCheckDetails = {
          series: [this.goodsReceiptNotesResponceList.outboundQualityCheckCount],
          chart: {
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96"],
          labels: ['Outbound Quality Check Count'],
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
                  width: 200,
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
  }
  goodsReceiptNotesGraphCall() {
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
            width: 340,
            height: 340,
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
                  width: 200,
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
  }
  putawayCompletedResponceList: any;
  putawayCompletedGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
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
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96"],
          labels: ["Completed Count"],
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
                  width: 200,
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
  }
  pickingsCompletedResponceList: any;
  pickingCompletedGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.pickingCompletedDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.pickingsCount) {

        this.pickingsCompletedResponceList = response.data.pickingsCount
        this.pickingsCompletedObjectDetails = {
          series: [this.pickingsCompletedResponceList.incompleteCount, this.pickingsCompletedResponceList.completedCount,
          this.pickingsCompletedResponceList.inprocessCount],
          chart: {
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96", "#febe42", "#10e49c"],
          labels: ["Incomplete Count", "Completed Count", "In-process Count"],
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
                  width: 200,
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
  }
  purchaseOderResponceList: any;
  purchaseOrderGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
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
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96"],
          labels: ["Purchase Order",],
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
                  width: 200,
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
  }
  salesOrdertResponceList: any;
  salesOrderGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
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
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96"],
          labels: ["Sales Order Count"],
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
                  width: 200,
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
  }
  shipmentvOrderResponceList: any;
  shipmentOrdersGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.shipmentOrderDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.shipmentOrdersCount) {

        this.shipmentvOrderResponceList = response.data.shipmentOrdersCount
        this.shipmentOrdersObjectDetails = {
          series: [this.shipmentvOrderResponceList],
          chart: {
            height: 350,
            type: "radialBar",
            offsetY: -10
          },
          plotOptions: {
            radialBar: {
              startAngle: -135,
              endAngle: 135,
              dataLabels: {
                name: {
                  fontSize: "16px",
                  color: undefined,
                  offsetY: 120
                },
                value: {
                  offsetY: 76,
                  fontSize: "22px",
                  color: undefined,
                  formatter: function (val) {
                    return val + "%";
                  }
                }
              }
            }
          },
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              shadeIntensity: 0.15,
              inverseColors: false,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 50, 65, 91]
            }
          },
          stroke: {
            dashArray: 4
          },
          labels: ["Median Ratio"]
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
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
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
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96"],
          labels: ['Load Count'],
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
                  width: 200,
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
  }
  outBoundCheckListGraphCall() {
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
        this.outboundQualityCheckobjectDetails = {
          series: [this.goodsReceiptNotesResponceList.outboundQualityCheckCount],
          chart: {
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96"],
          labels: ['Outbound Quality Check Count'],
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
                  width: 200,
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
  }
  replishmentHistoryOrderResponceList: any;
  replishmentHistoryOrderGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
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
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96"],
          labels: ["Replelishment History"],
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
                  width: 200,
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
  }
  goodsReceiptCountResponceList: any;
  goodsReceipCountGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
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
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96"],
          labels: ["Open"],
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
                  width: 200,
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
  }
  packingShipmentOrderResponceList: any;
  packingShipmentOrderGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.packingShipmentOrdersDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.packingCountMap) {

        this.packingShipmentOrderResponceList = response.data.packingCountMap
        this.packingShipmentOrderObjectDetails = {
          series: [this.packingShipmentOrderResponceList.shipmentOrdersCount, this.packingShipmentOrderResponceList.packingCount],
          chart: {
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96", "#febe42"],
          labels: ["Shipment Orders Count", "Packing Count"],
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
        }
      }
    })
  }
  rePackingShipmentOrderResponceList: any;
  rePackingShipmentOrderGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.rePackingShipmentOrdersDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.rePackingCountMap) {

        this.rePackingShipmentOrderResponceList = response.data.rePackingCountMap
        this.rePackingShipmentOrderObjectDetails = {
          series: [this.rePackingShipmentOrderResponceList.shipmentOrdersCount, this.rePackingShipmentOrderResponceList.rePackingCount],
          chart: {
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96", "#febe42"],
          labels: ["Shipment Orders Count", "Re-Packing Count"],
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
                  width: 200,
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
  }
  coPackingShipmentOrdersResponseList: any;
  coPackingShipmentOrdersGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.coPackingShipmentOrdersDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.coPackingCountMap) {

        this.coPackingShipmentOrdersResponseList = response.data.coPackingCountMap
        this.coPackingShipmentOrdersOdjectDetails = {
          series: [this.coPackingShipmentOrdersResponseList.shipmentOrdersCount, this.coPackingShipmentOrdersResponseList.coPackingCount],
          chart: {
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96", "#febe42"],
          labels: ["Shipment Orders Count", "Co-Packing Count"],
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
                  width: 200,
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
  }
  labellingShipmentOrderResponceList: any;
  labellingShipmentOrderGraphCall() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      orderType: this.odderStatusTransactionDashboardsForms.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.labellingDailyOperationsDashboard(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.labelingCountMap) {

        this.labellingShipmentOrderResponceList = response.data.labelingCountMap
        this.labellingShipmentOrderobjectDetails = {
          series: [this.labellingShipmentOrderResponceList.shipmentOrdersCount, this.labellingShipmentOrderResponceList.labelingCount],
          chart: {
            width: 340,
            height: 340,
            type: "pie"
          },
          colors: ["#808b96", "#febe42"],
          labels: ["Shipment Orders Count", "labelliing Count"],
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
                  width: 200,
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
  }
  tableObjectCount() {
    const reqObject={
      fromDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
      toDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'),
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
        + Number(this.releasedForPutawayCountobj) + Number(this.inPutawayCountobj) + Number(this.releasedForOutwardQualityCheckCountobj)


      /* OtBound Total */

      this.totalOutBoundCountDisplay = this.releasedForPickingCountobj + this.inPickingCountobj + Number(this.releasedForOutwardQualityCheckCountobj) +
        this.releasedForPackingCountObj + this.inPackingCountobj + Number(this.releasedForRePackingCountobj) + this.inRePackingCountobj +
        this.releasedForCoPackingCountobj + this.inCoPackingCountobj + this.releasedForLabelingCountobj + + this.inLabelingCountobj +
        + this.releasedForShipmentOrdersCountobj + this.releasedForLoadCountobj + this.inLoadCountobj

    })
  }
}
