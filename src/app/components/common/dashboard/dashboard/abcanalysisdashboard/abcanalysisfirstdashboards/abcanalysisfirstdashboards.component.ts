

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
  ApexGrid
} from "ng-apexcharts";
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ConfigurationService } from "src/app/services/integration-services/configuration.service";
import { formatDate } from "@angular/common";


@Component({
  selector: 'app-abcanalysisfirstdashboards',
  templateUrl: './abcanalysisfirstdashboards.component.html',
  styleUrls: ['./abcanalysisfirstdashboards.component.scss']
})
export class AbcanalysisfirstdashboardsComponent implements OnInit {


  showFields = false;
  abcAnalysisFirstDashboardsForm: FormGroup;
  @ViewChild("chart") chart: ChartComponent;
  periodWisePurchaseOrderQuantityList: any;
  periodWisePurchaseOrderList: any;
  quantityArray: any = [];
  periodArray: any = [];
  splittedPart: any;
  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective;

  abcGroupList: any;
  productArray = [];
  percentageUsageArray: any = []
  abcAnalysisArray: any = []
  productIdListArray: any = []
  labelClassArray: any = []
  reqObj = {}




  /* CanVas Chart */
  @ViewChild('myCanvas')
  public canvas: ElementRef;
  public context: CanvasRenderingContext2D;
  public chartType: string = 'line';
  public chartData: any[];
  public chartLabels: any[];
  public chartColors: any[];
  public chartOptions: any;
  constructor(private dashboardService: DashboardService,
    private fb: FormBuilder,
    public ngxSmartModalService: NgxSmartModalService,
    private excelService: ExcelService,
    private toastr: ToastrService, private wmsService: WMSService, private configService: ConfigurationService) {
   /*  this.wmsService.NewshareFormData.subscribe((response) => {
      this.createabcAnalysisFirstDashboardsForm();
      this.valueimg = response;
      if (this.valueimg) {
        console.log(this.valueimg)
        this.abcAnalysisFirstDashboardsForm.controls.fromDate.setValue(response.fromDate ? formatDate(response.fromDate, 'yyyy-MM-dd', 'en') : null);
        this.abcAnalysisFirstDashboardsForm.controls.toDate.setValue(response.toDate ? formatDate(response.toDate, 'yyyy-MM-dd', 'en') : null);
        console.log(this.abcAnalysisFirstDashboardsForm.value);
     // this.getGraphData();
      }
      else {
      }
    }) */
  }
  valueimg: any
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.createabcAnalysisFirstDashboardsForm();

    console.log(this.abcAnalysisFirstDashboardsForm.value);
  }
  createabcAnalysisFirstDashboardsForm() {
    this.abcAnalysisFirstDashboardsForm = this.fb.group({
      fromDate: [null],
      toDate: [null]
    })
  }
  getGraphData() {
    const formGroupData = this.abcAnalysisFirstDashboardsForm.value;
    formGroupData["organizationIdName"] = this.configService.getOrganization().organizationIDName,
      formGroupData["wareHouseIdName"] = this.configService.getWarehouse().wareHouseIDName
    this.wmsService.fetchAllABCAnalyisGroup(JSON.stringify(formGroupData)).subscribe(
      (response) => {
        if (response || response.status === 0 || response.data.abcGroup) {
          this.abcGroupList = response.data.abcGroup;
          if (response.data.abcGroup.abcAnalysisGroups != null && response.data.abcGroup.abcAnalysisGroups != undefined) {
            response.data.abcGroup.abcAnalysisGroups.forEach(innerElement => {
              this.percentageUsageArray.push(innerElement.percentageUsage)
            })
            this.abcGroupList.abcAnalysisGroups.forEach(innerElement => {
              this.productIdListArray.push(innerElement.productMasterInfo.productID)
            })
            this.abcGroupList.abcAnalysisGroups.forEach(innerElement => {
              this.labelClassArray.push(innerElement.abcAnalysisClass)
            })
          }
          this.chartData = [{
            data: this.percentageUsageArray,
            label: 'Class',
            fill: false
          }];
          this.chartLabels = this.labelClassArray
          this.chartColors = [{
            backgroundColor: 'grey',
            borderColor: 'grey'
          }];
          this.chartOptions = {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true,
                  stepSize: 10
                }
              }]
            },
            annotation: {
              drawTime: 'beforeDatasetsDraw',
              annotations: [{
                type: 'box',
                id: 'a-box-1',
                yScaleID: 'y-axis-0',
                yMin: 0,
                yMax: 1,
                backgroundColor: '#4cf03b'
              }, {
                type: 'box',
                id: 'a-box-2',
                yScaleID: 'y-axis-0',
                yMin: 1,
                yMax: 2.7,
                backgroundColor: '#fefe32'
              }, {
                type: 'box',
                id: 'a-box-3',
                yScaleID: 'y-axis-0',
                yMin: 2.7,
                yMax: 5,
                backgroundColor: '#fe3232'
              }]
            }
          }
        };
      })
    this.productIdListArray = [];
    this.labelClassArray = [];
    this.percentageUsageArray = [];
    this.abcAnalysisFirstDashboardsForm.reset();
  }

  exportAsXLSX() {
    if (this.periodWisePurchaseOrderList && this.periodWisePurchaseOrderList.length > 0) {
      this.excelService.exportAsExcelFile(this.periodWisePurchaseOrderList, 'purchaseAnalytics', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }
  ngAfterViewInit(): void {

  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
   /*  this.wmsService.NewshareFormData.unsubscribe();
    this.wmsService.NewshareFormData.next(false); */
  }
  openModalPopUp() {
    this.ngxSmartModalService.getModal('purchaseAnalyticsOrder').open();

  }
}
