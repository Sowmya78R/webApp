
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
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from "src/app/services/integration-services/configuration.service";
import { Storage } from '../../../../../shared/utils/storage';
import { TranslateService } from "@ngx-translate/core";
import { DecimalUtils } from "src/app/constants/decimal";

export type ChartOptions = {
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
  grid: ApexGrid
};

@Component({
  selector: 'app-salesanalytics',
  templateUrl: './salesanalytics.component.html',
  styleUrls: ['./salesanalytics.component.scss']
})
export class SalesanalyticsComponent implements OnInit, OnDestroy {
  salesOrdrWiseGraphName: any;
  forPermissionsSubscription: any;
  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective;
  /* CanVas Chart */
  @ViewChild('myCanvas')
  public canvas: ElementRef;
  public context: CanvasRenderingContext2D;
  public chartType: string = 'line';
  public chartData: any[];
  public chartLabels: any[];
  public chartColors: any[];
  public chartOptions: any;
  showFields = false;
  quantityArray: any = [];
  periodArray: any = [];
  splittedPart: any;
  salesAnalyticsForm: FormGroup;
  periodWiseSalesOrderList: any;
  periodWiseShipmentOrderList: any;
  @ViewChild("chart") chart: ChartComponent;
  customerWiseList: any;
  shipmentAnalyticsForm: FormGroup
  valueTopass = "PasedValue";
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  newValue = "Passed Value"
  againValue = "passing Value";
  valuePassingContent = "Passing Value"
  locationWiseResponseList: any;
  periodWiseShipmentOrderQuantityList: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Sales Analytics', 'Sales Order wise', Storage.getSessionUser());
  productWise = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Sales Analytics', 'Sales Product Wise', Storage.getSessionUser());
  categoryWise = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Sales Analytics', 'Sales Category Wise', Storage.getSessionUser());
  customerWise = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Sales Analytics', 'Sales Customer Wise', Storage.getSessionUser());
  regionWise = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Sales Analytics', 'Sales Region Wise', Storage.getSessionUser());
  orderType: any = 'Sales Order';

  constructor(private dashboardService: DashboardService,
    private fb: FormBuilder, public ngxSmartModalService: NgxSmartModalService,
    private excelService: ExcelService, private toastr: ToastrService, private configService: ConfigurationService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
     }

  ngOnInit(): void {
    this.salesOrdrWiseGraphName = 'Sales Order Wise'
    if (this.getRole()) {
      this.permissionsList = ['View', 'Update', 'Delete'];
      this.productWise = ['View', 'Update', 'Delete'];
      this.categoryWise = ['View', 'Update', 'Delete'];
      this.customerWise = ['View', 'Update', 'Delete'];
      this.regionWise = ['View', 'Update', 'Delete'];
    }
    this.getFunctionCalls();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
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
  getFunctionCalls() {
    // if (this.permissionsList.includes('View')) {
      this.createSalesorderForm()
      this.getGraphData("");
      this.showFields = false;
    // }
  }
  createSalesorderForm() {
    this.salesAnalyticsForm = this.fb.group({
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      type: ['Last 3 Months'],
      expectedDeliveryDateFrom: [null],
      expectedDeliveryDateTo: [null],
      functionalityType: 'salesOrder'
    })
  }
  ngOnDestroy(): void {
    // this.forPermissionsSubscription.unsubscribe();
  }
  changeFunctionalityType(data?) {
    if (this.salesAnalyticsForm.value.expectedDeliveryDateTo === '') {

    }
    else {
      const passingListType = this.salesAnalyticsForm.value.type;
      const functionalityType = this.salesAnalyticsForm.value.functionalityType;
      const expectedDeliveryDateFrom = this.salesAnalyticsForm.value.expectedDeliveryDateFrom;
      const expectedDeliveryDateTo = this.salesAnalyticsForm.value.expectedDeliveryDateTo;
      if (passingListType && (passingListType != "Custom Dates")
        || (passingListType == "Custom Dates" && expectedDeliveryDateFrom &&
          expectedDeliveryDateTo)) {
      
        if (functionalityType === 'salesOrder') {
          this.customerWiseSalesOrderDetails();
          this.productWiseSalesOrderDetails();
          this.categoryWiseSalesOrderDetails();
          this.locationWiseSalesOrderDetails();
          this.callForSalesOrder();
        }
        else if (functionalityType === 'shipmentOrder') {
          this.customerWiseshipmentOrderDetails();
          this.productWiseshipmentOrderDetails();
          this.categoryWiseshipmentOrderDetails();
          this.locationWiseShipmentOrderDetails();
          this.callForShipmentOrder()
          this.salesOrdrWiseGraphName = "Shipment Order Wise"
        }
      }
    }
  }
  newArrayForQuantity: any = []
  newArrayForPeriod: any = []
  getGraphData(data) {

    const newReqObjForQuantity = {};
    const newReqObjForPeriod = {};
    this.showFields = false;
    const form = this.salesAnalyticsForm.value;

    form['orderType'] = this.orderType;
    this.dashboardService.fetchAllSalesOrderGraph(form).subscribe(response => {
      if (response && response.status === 0 && response.data.periodWiseSalesOrderQuantityResponse) {
        this.periodWiseSalesOrderList = response.data.periodWiseSalesOrderQuantityResponse;
        this.periodWiseSalesOrderList.forEach(innerElement => {
          if (this.periodWiseSalesOrderList != null && this.periodWiseSalesOrderList != undefined) {
            newReqObjForQuantity['quantity'] = innerElement.quantity
            this.newArrayForQuantity.push(DecimalUtils.fixedDecimal(innerElement.quantity,3))
          }
          if (this.periodWiseSalesOrderList != null && this.periodWiseSalesOrderList != undefined) {
            newReqObjForPeriod['period'] = innerElement.period
            this.newArrayForPeriod.push(innerElement.period)
          }
        })
        this.chartData = [{
          data: this.newArrayForQuantity,
          label: 'Quantity',
          fill: false
        }];
        this.chartLabels = this.newArrayForPeriod
        this.chartColors = [{
          backgroundColor: 'grey',
          borderColor: 'grey'
        }];
        this.chartOptions = {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                stepSize: 50
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
              backgroundColor: 'green'
            }, {
              type: 'box',
              id: 'a-box-2',
              yScaleID: 'y-axis-0',
              yMin: 1,
              yMax: 2.7,
              backgroundColor: 'green'
            }, {
              type: 'box',
              id: 'a-box-3',
              yScaleID: 'y-axis-0',
              yMin: 2.7,
              yMax: 5,
              backgroundColor: 'green'
            }]
          }
        }
      };
    })
    this.newArrayForQuantity = [];
    this.newArrayForPeriod = []
    this.customerWiseSalesOrderDetails();
    this.productWiseSalesOrderDetails();
    this.categoryWiseSalesOrderDetails();
    this.locationWiseSalesOrderDetails();
  }


  /* Location Wise Sales Order */
  locationWiseSalesOrderDetails() {
    const form = this.salesAnalyticsForm.value;
    form['orderType'] = this.orderType;
    this.dashboardService.fetchAlllocationiseSalesOrder(form).subscribe(response => {
      if (response && response.status === 0 && response.data.locationWiseSalesOrderResponseList) {
        const locationWiseResponseList = response.data.locationWiseSalesOrderResponseList;
        const locationWisefinalArray = [];
        locationWiseResponseList.forEach(resp => {
          locationWisefinalArray.push(
            { name: resp.locationName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.locationWiseResponseList = locationWisefinalArray;
        //  this.rerender();
      }
    },
      (error: any) => {
      })
  }
  locationWiseShipmentOrderDetails() {

    const shipmentOrderFormData = {
      type: this.salesAnalyticsForm.value.type,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      dispatchDateFrom: this.salesAnalyticsForm.value.expectedDeliveryDateFrom,
      dispatchDateTo: this.salesAnalyticsForm.value.expectedDeliveryDateTo,
      functionalityType: 'shipmentOrder',
      orderType: this.orderType
    }
    this.dashboardService.fetchAllShipmentOrderLocationWiseGraph(shipmentOrderFormData).subscribe(response => {
      if (response && response.status === 0 && response.data.locationWiseShipmentOrderResponseList) {
        const locationWiseResponseList = response.data.locationWiseShipmentOrderResponseList;
        const locationShipmentOrdersfinalArray = [];
        locationWiseResponseList.forEach(resp => {
          locationShipmentOrdersfinalArray.push(
            { name: resp.locationName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.locationWiseResponseList = locationShipmentOrdersfinalArray;
      }
    })
  }
  /* Customer Wise Sales Order  */
  customerWiseSalesOrderDetails() {
    const form = this.salesAnalyticsForm.value;
    form['orderType'] = this.orderType;
    this.dashboardService.fetchAllCustomerWiseDetails(form).subscribe(response => {
      if (response && response.status === 0 && response.data.responseMap) {
        const customerWiseResponse = response.data.responseMap;
        const finalArray = [];

        // this.rerender();
        if (this.orderType === 'Sales Order') {
          customerWiseResponse.CustomerWise.forEach(resp => {
            finalArray.push(
              { name: resp.customerIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.customerWiseResponseList = finalArray;
        }
        else if (this.orderType === 'Return') {
          customerWiseResponse.SupplierWise.forEach(resp => {
            finalArray.push(
              { name: resp.supplierIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.customerWiseResponseList = finalArray;
        }
        else if (this.orderType === 'WareHouseTransfer') {
          customerWiseResponse.WareHouseTransferDestinationInfoWise.forEach(resp => {
            finalArray.push(
              { name: resp.wareHouseIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.customerWiseResponseList = finalArray;
        }
      }
    },
      (error: any) => {
      })
  }
  customerWiseResponseList: any;
  customerWiseshipmentOrderDetails() {
    const shipmentOrderFormData = {
      type: this.salesAnalyticsForm.value.type,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      dispatchDateFrom: this.salesAnalyticsForm.value.expectedDeliveryDateFrom,
      dispatchDateTo: this.salesAnalyticsForm.value.expectedDeliveryDateTo,
      functionalityType: 'shipmentOrder',
      orderType: this.orderType,
    }
    this.dashboardService.fetchAllShipmentOrderCustomernWiseGraph(shipmentOrderFormData).subscribe(response => {
      if (response && response.status === 0 && response.data.responseMap) {
        const customerWiseResponse = response.data.responseMap;
        const finalArray = [];
        if (this.orderType === 'Sales Order') {
          customerWiseResponse.CustomerWise.forEach(resp => {
            finalArray.push(
              { name: resp.customerIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.customerWiseResponseList = finalArray;
        }
        else if (this.orderType === 'Return') {
          customerWiseResponse.SupplierWise.forEach(resp => {
            finalArray.push(
              { name: resp.supplierIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.customerWiseResponseList = finalArray;
        }
        else if (this.orderType === 'WareHouseTransfer') {
          customerWiseResponse.WareHouseTransferDestinationInfoWise.forEach(resp => {
            finalArray.push(
              { name: resp.wareHouseIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.customerWiseResponseList = finalArray;
        }
      }
    })
  }
  /* Product Wise Sales Order Api Callling */
  productWiseShipmentOrderPassingist: any;
  salesOrderProductRespnceList: any;
  productWiseSalesOrderDetails() {
    const form = this.salesAnalyticsForm.value;
    form['orderType'] = this.orderType;
    this.dashboardService.fetchAllProductWiseSalesOrderDetails(form).subscribe(response => {
      if (response && response.status === 0 && response.data.productWiseSalesOrderResponseList) {
        const salesOrderProductRespnceList = response.data.productWiseSalesOrderResponseList
        const productWisefinalArray = [];
        salesOrderProductRespnceList.forEach(resp => {
          productWisefinalArray.push(
            { name: resp.productIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.productWiseShipmentOrderPassingist = productWisefinalArray;
        //   this.rerender();
      }
    },
      (error: any) => {
      })
  }
  /* Calling Product Wise Shipment Order API From Parent  */
  productWiseshipmentOrderDetails() {
    const shipmentOrderFormData = {
      type: this.salesAnalyticsForm.value.type,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      dispatchDateFrom: this.salesAnalyticsForm.value.expectedDeliveryDateFrom,
      dispatchDateTo: this.salesAnalyticsForm.value.expectedDeliveryDateTo,
      functionalityType: 'shipmentOrder',
      orderType: this.orderType
    }
    this.dashboardService.fetchAllShipmentOrderProductWiseGraph(shipmentOrderFormData).subscribe(response => {
      if (response && response.status === 0 && response.data.productWiseShipmentOrderResponseList) {
        const productWiseShipmentorderList = response.data.productWiseShipmentOrderResponseList;
        const finalArray = [];
        productWiseShipmentorderList.forEach(resp => {
          finalArray.push(
            { name: resp.productIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.productWiseShipmentOrderPassingist = finalArray;
      }
    })
  }
  /* Calling Category Wise Shipment Order API From Parent  */
  categoryWiseShipmentOrderPassingist: any;
  categoryWiseSalesOrderDetails() {
    const form = this.salesAnalyticsForm.value;
    form['orderType'] = this.orderType;
    this.dashboardService.fetchAllCategoryWiseSalesOrder(form).subscribe(response => {
      if (response && response.status === 0 && response.data.productCategoryWiseSalesOrderResponseList) {
        const categoriesSalesOrderWiseList = response.data.productCategoryWiseSalesOrderResponseList;
        const categoryWisefinalArray = [];
        categoriesSalesOrderWiseList.forEach(resp => {
          categoryWisefinalArray.push(
            { name: resp.productCategoryName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.categoryWiseShipmentOrderPassingist = categoryWisefinalArray;
      }
    })
  }
  categoryWiseshipmentOrderDetails() {
    const shipmentOrderFormData = {
      type: this.salesAnalyticsForm.value.type,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      dispatchDateFrom: this.salesAnalyticsForm.value.expectedDeliveryDateFrom,
      dispatchDateTo: this.salesAnalyticsForm.value.expectedDeliveryDateTo,
      functionalityType: 'shipmentOrder',
      orderType: this.orderType
    }
    this.dashboardService.fetchAllShipmentOrderCategoryWiseGraph(shipmentOrderFormData).subscribe(response => {
      if (response && response.status === 0 && response.data.productCategoryWiseShipmentOrderResponseList) {
        const categoryWiseResponceList = response.data.productCategoryWiseShipmentOrderResponseList;
        const categoryWisefinalArray = [];
        categoryWiseResponceList.forEach(resp => {
          categoryWisefinalArray.push(
            { name: resp.productCategoryName, value:DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.categoryWiseShipmentOrderPassingist = categoryWisefinalArray;
      }
    })
  }


  exportAsXLSX() {
    if (this.periodWiseSalesOrderList && this.periodWiseSalesOrderList.length > 0) {
      this.excelService.exportAsExcelFile(this.periodWiseSalesOrderList, 'periodWiseSalesOrderList', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }
  OnDataChange() {
    this.dashboardService.shareFormData.next(this.salesAnalyticsForm.value);
  }
  enableDate(data) {
    if (data === "Custom Dates") {
      this.showFields = true;
    }
    else if (this.salesAnalyticsForm.value.expectedDeliveryDateFrom && this.salesAnalyticsForm.value.expectedDeliveryDateFrom) {
      this.salesAnalyticsForm.controls.expectedDeliveryDateFrom.setValue(null);
      this.salesAnalyticsForm.controls.expectedDeliveryDateTo.setValue(null);
      this.showFields = false;
    }
  }
  openModalPopUp() {
    this.ngxSmartModalService.getModal('salesAnalytics').open();
  }
  callForSalesOrder() {

    const newReqObjForQuantity = {}
    const newReqObjForPeriod = {}
    const form = this.salesAnalyticsForm.value;
    form['orderType'] = this.orderType;
    this.dashboardService.fetchAllSalesOrderGraph(form).subscribe(response => {
      if (response && response.status === 0 && response.data.periodWiseSalesOrderQuantityResponse) {
        this.periodWiseSalesOrderList = response.data.periodWiseSalesOrderQuantityResponse;
        this.periodWiseSalesOrderList.forEach(innerElement => {
          if (this.periodWiseSalesOrderList != null && this.periodWiseSalesOrderList != undefined) {
            newReqObjForQuantity['quantity'] = innerElement.quantity
            this.newArrayForQuantity.push(DecimalUtils.fixedDecimal(innerElement.quantity,3))
          }
          if (this.periodWiseSalesOrderList != null && this.periodWiseSalesOrderList != undefined) {
            newReqObjForPeriod['period'] = innerElement.period
            this.newArrayForPeriod.push(DecimalUtils.fixedDecimal(innerElement.period,3))
          }
        })
        this.chartData = [{
          data: this.newArrayForQuantity,
          label: 'Quantity',
          fill: false
        }];
        this.chartLabels = this.newArrayForPeriod
        this.chartColors = [{
          backgroundColor: 'grey',
          borderColor: 'grey'
        }];
        this.chartOptions = {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                stepSize: 50
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
              backgroundColor: 'green'
            }, {
              type: 'box',
              id: 'a-box-2',
              yScaleID: 'y-axis-0',
              yMin: 1,
              yMax: 2.7,
              backgroundColor: 'green'
            }, {
              type: 'box',
              id: 'a-box-3',
              yScaleID: 'y-axis-0',
              yMin: 2.7,
              yMax: 5,
              backgroundColor: 'green'
            }]
          }
        }
      };
    })
    this.newArrayForQuantity = [];
    this.newArrayForPeriod = []
  }
  callForShipmentOrder() {
    const shipmentOrderFormData = {
      type: this.salesAnalyticsForm.value.type,
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      dispatchDateFrom: this.salesAnalyticsForm.value.expectedDeliveryDateFrom,
      dispatchDateTo: this.salesAnalyticsForm.value.expectedDeliveryDateTo,
      functionalityType: 'shipmentOrder',
      orderType: this.orderType
    }
    const newReqObjForQuantity = {}
    const newReqObjForPeriod = {}
    this.dashboardService.fetchAllSalesAnalyticsShipmentOrderGraph(shipmentOrderFormData).subscribe(response => {
      if (response && response.status === 0 && response.data.periodWiseShipmentOrderQuantityResponse) {
        this.periodWiseShipmentOrderList = response.data.periodWiseShipmentOrderQuantityResponse;
        this.periodWiseShipmentOrderList.forEach(innerElement => {
          if (this.periodWiseShipmentOrderList != null && this.periodWiseShipmentOrderList != undefined) {
            newReqObjForQuantity['quantity'] = innerElement.quantity
            this.newArrayForQuantity.push(DecimalUtils.fixedDecimal(innerElement.quantity,3))
          }
          if (this.periodWiseShipmentOrderList != null && this.periodWiseShipmentOrderList != undefined) {
            newReqObjForPeriod['period'] = innerElement.period
            this.newArrayForPeriod.push(DecimalUtils.fixedDecimal(innerElement.period,3))
          }
        })
        this.chartData = [{
          data: this.newArrayForQuantity,
          label: 'Quantity',
          fill: false
        }];
        this.chartLabels = this.newArrayForPeriod
        this.chartColors = [{
          backgroundColor: 'grey',
          borderColor: 'grey'
        }];
        this.chartOptions = {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                stepSize: 50
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
              backgroundColor: 'green'
            }, {
              type: 'box',
              id: 'a-box-2',
              yScaleID: 'y-axis-0',
              yMin: 1,
              yMax: 2.7,
              backgroundColor: 'green'
            }, {
              type: 'box',
              id: 'a-box-3',
              yScaleID: 'y-axis-0',
              yMin: 2.7,
              yMax: 5,
              backgroundColor: 'green'
            }]
          }
        }
      };
    })
    this.newArrayForQuantity = [];
    this.newArrayForPeriod = []
  }
}








