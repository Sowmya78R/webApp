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
import { Storage } from '../../../../../shared/utils/storage';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-abcanalysisdashboard',
  templateUrl: './abcanalysisdashboard.component.html',
  styleUrls: ['./abcanalysisdashboard.component.scss']
})
export class AbcanalysisdashboardComponent implements OnInit {

  showFields = false;
  abcAnalysisDashboardForm: FormGroup;
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
  formObj = this.configService.getGlobalpayload();
  abcAnalysisList = this.configService.getPermissions('kpiConfigurationFunctionalities', 'ABC Analysis', 'ABC Analysis', Storage.getSessionUser());

  abcGroupList: any;
  productArray = [];
  percentageUsageArray: any = []
  abcAnalysisArray: any = []
  productIdListArray: any = []
  labelClassArray: any = []
  reqObj = {}
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");




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
    private toastr: ToastrService, private wmsService: WMSService, private configService: ConfigurationService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
  }
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createAbcAnalysisDashboardForm();
    //  this.getGraphData();
  }
  createAbcAnalysisDashboardForm() {
    this.abcAnalysisDashboardForm = this.fb.group({
      fromDate: [null],
      toDate: [null]
    })
  }
  getGraphData() {
    const appendingFormData = this.abcAnalysisDashboardForm.value;
    appendingFormData["organizationIdName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData["wareHouseIdName"] = this.configService.getWarehouse().wareHouseIDName
    this.wmsService.fetchAllABCAnalyisGroup(JSON.stringify(appendingFormData)).subscribe(
      (response) => {
        if (response || response.status === 0 || response.data.abcGroup) {
          this.abcGroupList = response.data.abcGroup;
          this.abcGroupList.abcAnalysisGroups.forEach(innerElement => {
            this.percentageUsageArray.push(innerElement.percentageUsage)
          })
          this.abcGroupList.abcAnalysisGroups.forEach(innerElement => {
            this.productIdListArray.push(innerElement.productMasterInfo.productID)
          })
          this.abcGroupList.abcAnalysisGroups.forEach(innerElement => {
            this.labelClassArray.push(innerElement.abcAnalysisClass)
          })
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
    this.productIdListArray = []
    this.labelClassArray = []
    this.percentageUsageArray = []
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
  OnDataChange() {
    this.dashboardService.shareFormData.next(this.abcAnalysisDashboardForm.value);
  }
  enableDate(data) {
    console.log(data);
    if (data === "Custom Dates") {
      this.showFields = true;
    }
    else {
      this.showFields = false;
    }
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  openModalPopUp() {
    this.ngxSmartModalService.getModal('purchaseAnalyticsOrder').open();
  }
}



