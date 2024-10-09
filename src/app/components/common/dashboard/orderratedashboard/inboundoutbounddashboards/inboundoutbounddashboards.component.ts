import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ApexDataLabels, ApexLegend, ApexTheme, ApexTitleSubtitle, ChartComponent } from "ng-apexcharts";

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from "ng-apexcharts";
import { CompleterData } from "ng2-completer";
import { CommonMasterDataService } from "src/app/services/integration-services/commonMasterData.service";
import { ConfigurationService } from "src/app/services/integration-services/configuration.service";
import { WMSService } from "src/app/services/integration-services/wms.service";

export type putawayChartDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  legend: any;
  title: ApexTitleSubtitle
}
export type internalTRansferstDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  legend: any;
}
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
export type pickingDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  legend: any;
}
export type packingDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  legend: any;
}
export type coPackingDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  legend: any;
}
export type rePackingDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  legend: any;
}
export type labellingDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  legend: any;
}
export type cycleTransferDetails = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  legend: any;
}

@Component({
  selector: 'app-inboundoutbounddashboards',
  templateUrl: './inboundoutbounddashboards.component.html',
  styleUrls: ['./inboundoutbounddashboards.component.scss']
})
export class InboundoutbounddashboardsComponent implements OnInit {

  @ViewChild("chart") chart: ChartComponent;
  public putawayChartDetails: Partial<putawayChartDetails>;
  public internalTRansferstDetails: Partial<internalTRansferstDetails>;
  public internalAdjustmentDetails: Partial<internalAdjustmentDetails>;
  public pickingDetails: Partial<pickingDetails>;
  public packingDetails: Partial<packingDetails>;
  public rePackingDetails: Partial<rePackingDetails>;
  public coPackingDetails: Partial<coPackingDetails>;
  public labellingDetails: Partial<labellingDetails>;
  public cycleTransferDetails: Partial<cycleTransferDetails>;

  inboundOutboundDashboardsForm: FormGroup
  wareHouseTeamsList: any;
  wareHouseTeamsListIDs: CompleterData
  formObj = this.configService.getGlobalpayload();
  constructor(private wmsService: WMSService, private fb: FormBuilder, private configService: ConfigurationService,
    private commonmasterdataservice: CommonMasterDataService, private datepipe: DatePipe) {
    //this.putAwayGraphDetailsgraph();
  }
  ngOnInit() {
    this.createInboundOutboundDashboardsForm();
    this.putAwayGraphDetailsgraph();
    this.internalTransferGraphDetailsgraph();
    this.pickingGraphDetailsgraph();
    this.internalAdjustmentGraphDetailsgraph();
    this.packingGraphDetailsgraph();
    this.coPackingGraphDetailsgraph();
    this.rePackingGraphDetailsgraph();
    this.labellingDetailsgraph();
    this.fetchAllExecutionIDName();
    this.inboundOutboundDashboardsForm.get("orderType").setValue("Sales Order")
    this.inboundOutboundDashboardsForm.get("dummyOrderType").setValue("Purchase Order")
  }
  createInboundOutboundDashboardsForm() {
    this.inboundOutboundDashboardsForm = this.fb.group({
      createdDateFrom: [null],
      createdDateTo: [null],
      assignedDateFrom: [null],
      assignedDateTo: [null],
      assignedTo: [null],
      orderType: ['Sales Order'],
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      dummyOrderType:['Purchase Order']
    })
  }
  filter() {
    this.putAwayGraphDetailsgraph();
    this.internalTransferGraphDetailsgraph();
    this.pickingGraphDetailsgraph();
    this.internalAdjustmentGraphDetailsgraph();
    this.packingGraphDetailsgraph();
    this.coPackingGraphDetailsgraph();
    this.rePackingGraphDetailsgraph();
    this.labellingDetailsgraph();
    this.fetchAllExecutionIDName();
  }
  reset() {
    this.inboundOutboundDashboardsForm.reset();
    this.createInboundOutboundDashboardsForm();
    // this.inboundOutboundDashboardsForm.get("createdDateFrom").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'));
    /// this.inboundOutboundDashboardsForm.get("createdDateTo").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'));
    // this.inboundOutboundDashboardsForm.get("assignedDateFrom").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'));
    //  this.inboundOutboundDashboardsForm.get("assignedDateTo").setValue(this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd'));
  }
  fetchAllExecutionIDName() {
    this.commonmasterdataservice.fetchAllExecutionIDName(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
  }
  periodWisePurchaseOrderReceiveList: any;
  totalObjectList: any;
  putAwayGraphDetailsgraph() {
    const reqObject = {
      createdDateFrom: this.inboundOutboundDashboardsForm.value.createdDateFrom,
      createdDateTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      assignedDateFrom: this.inboundOutboundDashboardsForm.value.assignedDateFrom,
      assignedDateTo: this.inboundOutboundDashboardsForm.value.assignedDateTo,
      assignedTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      orderType: this.inboundOutboundDashboardsForm.value.dummyOrderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllPutawayInboundOutboundDashboardsGraphDetail(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.putawaysCount) {

        this.totalObjectList = response.data.putawaysCount
        this.putawayChartDetails = {
          series: [this.totalObjectList.incompleteCount, this.totalObjectList.completedCount, this.totalObjectList.inprocessCount],
          chart: {
            width: 375,
            height: 375,
            type: "pie"
          },
          labels: ["Incomplete Count", "Complete Count", "Inprocess Count"],
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
        };
      }
    })
  }
  totalInternalTransfersObjectList: any;
  internalTransferGraphDetailsgraph() {
    const reqObject = {
      createdDateFrom: this.inboundOutboundDashboardsForm.value.createdDateFrom,
      createdDateTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      assignedDateFrom: this.inboundOutboundDashboardsForm.value.assignedDateFrom,
      assignedDateTo: this.inboundOutboundDashboardsForm.value.assignedDateTo,
      assignedTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      orderType: null,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllInternalTransferInboundOutboundDashboardsGraphDetail(reqObject).subscribe(response => {
      if (response && response.status === 0 && response.data.internalTransfersCount) {

        this.totalInternalTransfersObjectList = response.data.internalTransfersCount
        this.internalTRansferstDetails = {
          series: [this.totalInternalTransfersObjectList.completedCount, this.totalInternalTransfersObjectList.approvedCount,
          this.totalInternalTransfersObjectList.inprocessCount, this.totalInternalTransfersObjectList.createdCount],
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
        };
      }
    })
  }
  totalinventoryAdjustmentsCountObjectList: any;
  internalAdjustmentGraphDetailsgraph() {
    const reqObject = {
      createdDateFrom: this.inboundOutboundDashboardsForm.value.createdDateFrom,
      createdDateTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      assignedDateFrom: this.inboundOutboundDashboardsForm.value.assignedDateFrom,
      assignedDateTo: this.inboundOutboundDashboardsForm.value.assignedDateTo,
      assignedTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      orderType: null,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllInternalAdjustmentsInboundOutboundDashboardsGraphDetail(reqObject).subscribe(response => {
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
  pickingDetailsObjwct: any;
  pickingGraphDetailsgraph() {
    const reqObjModal= {
      createdDateFrom: this.inboundOutboundDashboardsForm.value.createdDateFrom,
      createdDateTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      assignedDateFrom: this.inboundOutboundDashboardsForm.value.assignedDateFrom,
      assignedDateTo: this.inboundOutboundDashboardsForm.value.assignedDateTo,
      assignedTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      orderType: this.inboundOutboundDashboardsForm.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllPickingInboundOutboundDashboardsGraphDetail(reqObjModal).subscribe(response => {
      if (response && response.status === 0 && response.data.pickingsCount) {

        this.pickingDetailsObjwct = response.data.pickingsCount;
        this.pickingDetails = {
          series: [this.pickingDetailsObjwct.incompleteCount, this.pickingDetailsObjwct.completedCount, this.pickingDetailsObjwct.inprocessCount],
          chart: {
            width: 375,
            height: 375,
            type: "pie"
          },
          labels: ["InComplete Count", "Completed Count", "Inprocess Count"],
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
  packingGraphDetailsgraph() {
    const reqObjModal= {
      createdDateFrom: this.inboundOutboundDashboardsForm.value.createdDateFrom,
      createdDateTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      assignedDateFrom: this.inboundOutboundDashboardsForm.value.assignedDateFrom,
      assignedDateTo: this.inboundOutboundDashboardsForm.value.assignedDateTo,
      assignedTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      orderType: this.inboundOutboundDashboardsForm.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllPackingOutboundDashboardsGraphDetail(reqObjModal).subscribe(response => {
      if (response && response.status === 0 && response.data.packingCount) {

        this.pickingDetailsObjwct = response.data.packingCount;
        this.packingDetails = {
          series: [this.pickingDetailsObjwct.incompleteCount, this.pickingDetailsObjwct.completedCount, this.pickingDetailsObjwct.inprocessCount],
          chart: {
            width: 375,
            height: 375,
            type: "pie"
          },
          labels: ["Incomplete Count", "Complete Count", "Inprocess Count"],
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
        };
      }
    })
  }
  coPackingDetailsObject: any
  coPackingGraphDetailsgraph() {
    const reqObjModal= {
      createdDateFrom: this.inboundOutboundDashboardsForm.value.createdDateFrom,
      createdDateTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      assignedDateFrom: this.inboundOutboundDashboardsForm.value.assignedDateFrom,
      assignedDateTo: this.inboundOutboundDashboardsForm.value.assignedDateTo,
      assignedTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      orderType: this.inboundOutboundDashboardsForm.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllCopackingInboundOutboundDashboardsGraphDetail(reqObjModal).subscribe(response => {
      if (response && response.status === 0 && response.data.coPackingCount) {

        this.coPackingDetailsObject = response.data.coPackingCount;
        this.coPackingDetails = {
          series: [this.coPackingDetailsObject.incompleteCount, this.coPackingDetailsObject.completedCount, this.coPackingDetailsObject.inprocessCount],
          chart: {
            width: 375,
            height: 375,
            type: "pie"
          },
          labels: ["Incomplete Count", "Complete Count", "Inprocess Count"],
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
        };
      }
    })
  }
  rePackingDetailsObject: any;
  rePackingGraphDetailsgraph() {
    const reqObjModal= {
      createdDateFrom: this.inboundOutboundDashboardsForm.value.createdDateFrom,
      createdDateTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      assignedDateFrom: this.inboundOutboundDashboardsForm.value.assignedDateFrom,
      assignedDateTo: this.inboundOutboundDashboardsForm.value.assignedDateTo,
      assignedTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      orderType: this.inboundOutboundDashboardsForm.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllRepackingInboundOutboundDashboardsGraphDetail(reqObjModal).subscribe(response => {
      if (response && response.status === 0 && response.data.rePackingCount) {

        this.rePackingDetailsObject = response.data.rePackingCount;
        this.rePackingDetails = {
          series: [this.rePackingDetailsObject.incompleteCount, this.rePackingDetailsObject.completedCount, this.rePackingDetailsObject.inprocessCount],
          chart: {
            width: 375,
            height: 375,
            type: "pie"
          },
          labels: ["Incomplete Count", "Complete Count", "Inprocess Count"],
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
        };
      }
    })
  }
  labellingDetailsObject: any;
  labellingDetailsgraph() {
    const reqObjModal= {
      createdDateFrom: this.inboundOutboundDashboardsForm.value.createdDateFrom,
      createdDateTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      assignedDateFrom: this.inboundOutboundDashboardsForm.value.assignedDateFrom,
      assignedDateTo: this.inboundOutboundDashboardsForm.value.assignedDateTo,
      assignedTo: this.inboundOutboundDashboardsForm.value.createdDateTo,
      orderType: this.inboundOutboundDashboardsForm.value.orderType,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllLabelligInboundOutboundDashboardsGraphDetail(reqObjModal).subscribe(response => {
      if (response && response.status === 0 && response.data.labelingCount) {

        this.labellingDetailsObject = response.data.labelingCount;
        this.labellingDetails = {
          series: [this.labellingDetailsObject.incompleteCount, this.labellingDetailsObject.completedCount, this.labellingDetailsObject.inprocessCount],
          chart: {
            width: 375,
            height: 375,
            type: "pie"
          },
          labels: ["Incomplete Count", "Complete Count", "Inprocess Count"],
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
        };
      }
    })
  }
}

