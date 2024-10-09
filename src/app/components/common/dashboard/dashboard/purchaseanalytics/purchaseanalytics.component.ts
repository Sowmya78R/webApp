
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
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ViewChildren, QueryList } from '@angular/core';
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
  selector: 'app-purchaseanalytics',
  templateUrl: './purchaseanalytics.component.html',
  styleUrls: ['./purchaseanalytics.component.scss']
})
export class PurchaseanalyticsComponent implements OnInit, OnDestroy {
  purchaseOrderWiseGraphName: any;

  showFields = false;
  purchaseAnalyticsForm: FormGroup;
  @ViewChild("chart") chart: ChartComponent;
  periodWisePurchaseOrderQuantityList: any;
  periodWisePurchaseOrderList: any;
  periodWisePurchaseOrderReturnList: any;
  periodWisePurchaseOrderReceiveList: any;
  quantityArray: any = [];
  periodArray: any = [];
  splittedPart: any;
 /*  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective; */
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");


  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective;
  @ViewChild(DataTableDirective)
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;

  dtTrigger1: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  dtTrigger4: Subject<any> = new Subject<any>();
  dtTrigger5: Subject<any> = new Subject<any>();
  dtTrigger6: Subject<any> = new Subject<any>();
  dtTrigger7: Subject<any> = new Subject<any>();


  productWiseResponseList: any;
  productWisePurchseReturnResponseList: any;

  categoryWiseResponseList: any;
  categoryWiseNewResponseList: any;

  supplierWiseResponseList: any;
  supplierWiseNewResponseList: any;

  locationWiseResponseList: any;
  locationWiseNewResponseList: any;

  /* CanVas Chart */
  @ViewChild('myCanvas')
  public canvas: ElementRef;
  public context: CanvasRenderingContext2D;
  public chartType: string = 'line';
  public chartData: any[];
  public chartLabels: any[];
  public chartColors: any[];
  public chartOptions: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Purchase Analytics', 'Purchase Order wise', Storage.getSessionUser());
  productWiseList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Purchase Analytics', 'Product Wise', Storage.getSessionUser());
  categoryWiseList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Purchase Analytics', 'Category Wise', Storage.getSessionUser());
  supplierWiseList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Purchase Analytics', 'Supplier Wise', Storage.getSessionUser());
  regionWiseList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Purchase Analytics', 'Region Wise', Storage.getSessionUser());
  forPermissionsSubscription: any;
  orderType: any = 'Purchase Order';
  constructor(private dashboardService: DashboardService,
    private fb: FormBuilder,
    public ngxSmartModalService: NgxSmartModalService,
    private excelService: ExcelService,
    private toastr: ToastrService, private configService: ConfigurationService,
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
    if (this.getRole()) {
      this.permissionsList = ['View', 'Update', 'Delete'];
      this.productWiseList = ['View', 'Update', 'Delete'];
      this.categoryWiseList = ['View', 'Update', 'Delete'];
      this.supplierWiseList = ['View', 'Update', 'Delete'];
      this.regionWiseList = ['View', 'Update', 'Delete'];
    }
    this.getFunctionsCall();
    this.purchaseOrderWiseGraphName = 'Purchase Order Wise'
  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  getFunctionsCall() {
    // if (this.permissionsList.includes('View')) {
      this.createPurchaseorderForm();
      this.getGraphData("");
    // }
  }
  createPurchaseorderForm() {
    this.purchaseAnalyticsForm = this.fb.group({
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      type: ['Last 3 Months'],
      etaFrom: [null],
      etaTo: [null],
      functionalityType: ['purchaseOrder']
    })
  }
  changeFunctionalityType(data?) {
    if (this.purchaseAnalyticsForm.value.etaTo === '') {

    }
    else {
      const passingListType = this.purchaseAnalyticsForm.value.type;
      const functionalityType = this.purchaseAnalyticsForm.value.functionalityType;
      const etaFrom = this.purchaseAnalyticsForm.value.etaFrom;
      const etaTo = this.purchaseAnalyticsForm.value.etaTo;
      if (passingListType && (passingListType != "Custom Dates")
        || (passingListType == "Custom Dates" && etaFrom && etaTo)) {
       
        if (functionalityType === 'purchaseOrder') {
          //this.getGraphData(passingListType);
          this.fetchAllProductWisePurchaseOrderDetails(passingListType);
          this.fetchAllCategoryWisePurchaseOrderDetails(passingListType);
          this.fetchAllSupplierWisePurchaseOrderDetails(passingListType);
          this.fetchAllLocationWisePurchaseOrderDetails(passingListType);
          this.fetchpurchaseWisepurchaseOrderDetails(passingListType);
        }
        else if (functionalityType === 'purchaseReturns') {
          this.fetchAllProductWisePurchaseReturnsDetails(passingListType);
          this.fetchAllCategoryWisePurchaseReturnDetails(passingListType);
          this.fetchAllSupplierWisePurchaseReturnDetails(passingListType);
          this.fetchAllLocationWisePurchaseReturnsDetails(passingListType);
          this.getPurchaseReturnpurchaseOrderorderData(passingListType);
          this.purchaseOrderWiseGraphName = 'Purchase Return Wise'
        }
        else if (functionalityType === 'purchaseReceived') {
          this.fetchAllProductWisePurchaseReceivedDetails(passingListType);
          this.fetchAllCategoryWisePurchaseReceivedDetails(passingListType);
          this.fetchAllSupplierWisePurchaseReceivedDetails(passingListType);
          this.fetchAllLocationWisePurchaseReceivedDetails(passingListType)
          this.getPurchaseReceivedpurchaseOrderorderData(passingListType)
          this.purchaseOrderWiseGraphName = 'Purchase Received Wise'
        }
      }
    }
  }

  /* Product Wise purchase Order From Dropdown  */
  fetchAllProductWisePurchaseOrderDetails(typeValue) {
    const productFormDetails = {
      'type': typeValue,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      etaFrom: this.purchaseAnalyticsForm.value.etaFrom,
      etaTo: this.purchaseAnalyticsForm.value.etaTo,
      functionalityType: 'purchaseOrder',
      orderType: this.orderType
    }
    this.dashboardService.fetchAllProductWisePurchaseOrders(productFormDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.productWisePurchaseOrderResponseList) {
        const productWisePurchaseReturnResponseList = response.data.productWisePurchaseOrderResponseList;
        const productWisePurchaseReturnfinalArray = [];
        productWisePurchaseReturnResponseList.forEach(resp => {
          productWisePurchaseReturnfinalArray.push(
            { name: resp.productName, value: DecimalUtils.fixedDecimal(resp.quantity,3)})
        })
        this.productWisePurchseReturnResponseList = productWisePurchaseReturnfinalArray;
        this.rerender();
        this.dtTrigger3.next();
      }
    },
      (error: any) => {
      })
  }
  fetchAllProductWisePurchaseReturnsDetails(typeValue) {
    const listType = this.purchaseAnalyticsForm.value.type;
    const formDetails = {
      'type': listType,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      grnType: 'Return',
      orderType: this.orderType
    }
    this.dashboardService.fetchAllProductWisePurchaseReturns(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.productWiseGoodsReceiptManagementResponseList) {
        const productWisePurchaseReturnResponseList = response.data.productWiseGoodsReceiptManagementResponseList;
        const productWisePurchaseReturnfinalArray = [];
        productWisePurchaseReturnResponseList.forEach(resp => {
          productWisePurchaseReturnfinalArray.push(
            { name: resp.productName, value: DecimalUtils.fixedDecimal(resp.quantity,3)})
        })
        this.productWisePurchseReturnResponseList = productWisePurchaseReturnfinalArray;
        this.rerender();
        this.dtTrigger3.next();
      }
    },
      (error: any) => {
      })
  }
  fetchAllProductWisePurchaseReceivedDetails(typeValue) {
    const formDetails = {
      'type': typeValue,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnType: 'Receive',
      orderType: this.orderType
    }
    this.dashboardService.fetchAllProductWisePurchaseReceived(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.productWiseGoodsReceiptManagementResponseList) {
        const productWispurchaseReceivedeResponseList = response.data.productWiseGoodsReceiptManagementResponseList;
        const productWisePurchaseReturnfinalArray = [];
        productWispurchaseReceivedeResponseList.forEach(resp => {
          productWisePurchaseReturnfinalArray.push(
            { name: resp.productName, value: DecimalUtils.fixedDecimal(resp.quantity,3)})
        })
        this.productWisePurchseReturnResponseList = productWisePurchaseReturnfinalArray;
        //  this.rerender();
      }
    },
      (error: any) => {
      })
  }
  /* Category Wise Purchase Order Details Fetch  */
  fetchAllCategoryWisePurchaseOrderDetails(typeValue) {
    const categoryFormDetails = {
      'type': typeValue,
      etaFrom: this.purchaseAnalyticsForm.value.etaFrom,
      etaTo: this.purchaseAnalyticsForm.value.etaTo,
      functionalityType: 'purchaseOrder',
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      orderType: this.orderType

    }
    this.dashboardService.fetchAllCategoryWisePurchaseOrders(categoryFormDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.productCategoryWisePurchaseOrderResponseList) {
        const categoryWiseResponseList = response.data.productCategoryWisePurchaseOrderResponseList;
        const categoryWisefinalArray = [];
        categoryWiseResponseList.forEach(resp => {
          categoryWisefinalArray.push(
            { name: resp.productCategoryName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.categoryWiseNewResponseList = categoryWisefinalArray;
        //   this.rerender();
      }
    },
      (error: any) => {
      })
  }
  makeEmpty() {
    // this.pickingReportForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.setValue(null);
    // this.pickingReportForm.controls.supplierIDName.setValue(null);
    // this.pickingReportForm.controls.customerIDName.setValue(null);
    this.changeFunctionalityType();
  }
  fetchAllCategoryWisePurchaseReturnDetails(typeValue) {
    const formDetails = {
      "type": typeValue,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      grnType: "Return",
      orderType: this.orderType
    }
    this.dashboardService.fetchAllCategoryWisePurchaseReturns(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.productCategoryWiseGoodsReceiptManagementResponseList) {
        const categoryWiseResponseList = response.data.productCategoryWiseGoodsReceiptManagementResponseList;
        const categoryWisefinalArray = [];
        categoryWiseResponseList.forEach(resp => {
          categoryWisefinalArray.push(
            { name: resp.productCategoryName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.categoryWiseNewResponseList = categoryWisefinalArray;
        //    this.rerender();
      }
    },
      (error: any) => {
      })
  }
  fetchAllCategoryWisePurchaseReceivedDetails(typeValue) {
    const formDetails = {
      "type": typeValue,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnType: "Receive",
      orderType: this.orderType
    }
    this.dashboardService.fetchAllCategoryWisePurchaseReceived(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.productCategoryWiseGoodsReceiptManagementResponseList) {
        const categoryWiseResponseList = response.data.productCategoryWiseGoodsReceiptManagementResponseList;
        const categoryWisefinalArray = [];
        categoryWiseResponseList.forEach(resp => {
          categoryWisefinalArray.push(
            { name: resp.productCategoryName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.categoryWiseNewResponseList = categoryWisefinalArray;
        // this.rerender();
      }
    },
      (error: any) => {
      })
  }
  /* Supplier Wise Purchase Order List  */
  fetchAllSupplierWisePurchaseOrderDetails(typeValue) {
    const suppplierFormDetails = {
      'type': typeValue,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      etaFrom: this.purchaseAnalyticsForm.value.etaFrom,
      etaTo: this.purchaseAnalyticsForm.value.etaTo,
      functionalityType: 'purchaseOrder',
      orderType: this.orderType

    }
    this.dashboardService.fetchAllSupplierWisePurchaseOrders(suppplierFormDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.responseMap) {
        const supplierWiseResponseList = response.data.responseMap;
        const supplierWisefinalArray = [];
        if (this.orderType === 'Purchase Order') {
          supplierWiseResponseList.SupplierWise.forEach(resp => {
            supplierWisefinalArray.push(
              { name: resp.supplierIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.supplierWiseNewResponseList = supplierWisefinalArray;
        }
        else if (this.orderType === 'Return') {
          supplierWiseResponseList.CustomerWise.forEach(resp => {
            supplierWisefinalArray.push(
              { name: resp.customerIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.supplierWiseNewResponseList = supplierWisefinalArray;
        }
        else if (this.orderType === 'WareHouseTransfer') {
          supplierWiseResponseList.WareHouseTransferSourceInfoWise.forEach(resp => {
            supplierWisefinalArray.push(
              { name: resp.wareHouseIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.supplierWiseNewResponseList = supplierWisefinalArray;
        }
        // this.rerender();
      }
    },
      (error: any) => {
      })
  }
  fetchAllSupplierWisePurchaseReturnDetails(typeValue) {
    const formDetails = {
      "type": typeValue,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnType: "Return",
      orderType: this.orderType
    }
    this.dashboardService.fetchAllSupplierWisePurchaseReturn(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.responseMap) {
        const supplierWiseResponseList = response.data.responseMap;
        const supplierWisefinalArray = [];
        if (this.orderType === 'Purchase Order') {
          supplierWiseResponseList.SupplierWise.forEach(resp => {
            supplierWisefinalArray.push(
              { name: resp.supplierIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.supplierWiseNewResponseList = supplierWisefinalArray;
        }
        else if (this.orderType === 'Return') {
          supplierWiseResponseList.CustomerWise.forEach(resp => {
            supplierWisefinalArray.push(
              { name: resp.customerIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.supplierWiseNewResponseList = supplierWisefinalArray;
        }
        else if (this.orderType === 'WareHouseTransfer') {
          supplierWiseResponseList.WareHouseTransferSourceInfoWise.forEach(resp => {
            supplierWisefinalArray.push(
              { name: resp.wareHouseIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.supplierWiseNewResponseList = supplierWisefinalArray;
        }

        //  this.rerender();
      }
    },
      (error: any) => {
      })
  }
  fetchAllSupplierWisePurchaseReceivedDetails(typeValue) {
    const formDetails = {
      "type": typeValue,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnType: "Receive",
      orderType: this.orderType
    }
    this.dashboardService.fetchAllSupplierWisePurchaseReceived(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.responseMap) {
        const supplierWiseResponseList = response.data.responseMap;
        const supplierWisefinalArray = [];
        if (this.orderType === 'Purchase Order') {
          supplierWiseResponseList.SupplierWise.forEach(resp => {
            supplierWisefinalArray.push(
              { name: resp.supplierIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.supplierWiseNewResponseList = supplierWisefinalArray;
        }
        else if (this.orderType === 'Return') {
          supplierWiseResponseList.CustomerWise.forEach(resp => {
            supplierWisefinalArray.push(
              { name: resp.customerIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.supplierWiseNewResponseList = supplierWisefinalArray;
        }
        else if (this.orderType === 'WareHouseTransfer') {
          supplierWiseResponseList.WareHouseTransferSourceInfoWise.forEach(resp => {
            supplierWisefinalArray.push(
              { name: resp.wareHouseIDName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
          })
          this.supplierWiseNewResponseList = supplierWisefinalArray;
        }
      }
    },
      (error: any) => {
      })
  }
  /* Region/Location Wise Purchase Order List  */

  fetchAllLocationWisePurchaseOrderDetails(typeValue) {
    const locationFormDetails = {
      'type': typeValue,
      etaFrom: this.purchaseAnalyticsForm.value.etaFrom,
      etaTo: this.purchaseAnalyticsForm.value.etaTo,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      functionalityType: 'purchaseOrder',
      orderType: this.orderType

    }
    this.dashboardService.fetchAlllocationWisePurchaseOrder(locationFormDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.locationWisePurchaseOrderResponseList) {
        const locationWiseResponseList = response.data.locationWisePurchaseOrderResponseList;
        const locationWisefinalArray = [];
        locationWiseResponseList.forEach(resp => {
          locationWisefinalArray.push(
            { name: resp.locationName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.locationWiseNewResponseList = locationWisefinalArray;
        //   this.rerender();
      }
    },
      (error: any) => {
      })
  }

  fetchAllLocationWisePurchaseReturnsDetails(typeValue) {
    const formDetails = {
      "type": typeValue,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      grnType: "Return",
      orderType: this.orderType
    }
    this.dashboardService.fetchAlllocationWisePurchaseReturn(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.locationWiseGoodsReceiptManagementResponseList) {
        const locationWiseResponseList = response.data.locationWiseGoodsReceiptManagementResponseList;
        const locationWisefinalArray = [];
        locationWiseResponseList.forEach(resp => {
          locationWisefinalArray.push(
            { name: resp.locationName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.locationWiseNewResponseList = locationWisefinalArray;
        // this.rerender();
      }
    },
      (error: any) => {
      })
  }
  fetchAllLocationWisePurchaseReceivedDetails(typeValue) {
    const formDetails = {
      "type": typeValue,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnType: "Receive",
      orderType: this.orderType
    }
    this.dashboardService.fetchAlllocationWisePurchaseReceived(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.locationWiseGoodsReceiptManagementResponseList) {
        const locationWiseResponseList = response.data.locationWiseGoodsReceiptManagementResponseList;
        const locationWisefinalArray = [];
        locationWiseResponseList.forEach(resp => {
          locationWisefinalArray.push(
            { name: resp.locationName, value: DecimalUtils.fixedDecimal(resp.quantity,3) })
        })
        this.locationWiseNewResponseList = locationWisefinalArray;
        //  this.rerender();
      }
    },
      (error: any) => {
      })
  }
  newArrayForQuantity: any = []
  newArrayForPeriod: any = []

  getGraphData(data) {
    if (data === 'Custom Dates') {
      this.showFields = true
    }
    else {
      const newReqObjForQuantity = {}
      const newReqObjForPeriod = {};
      const form = this.purchaseAnalyticsForm.value;
      form['orderType'] = this.orderType
      this.dashboardService.fetchAllPurchaseOrderGraph(form).subscribe(response => {
        if (response && response.status === 0 && response.data.periodWisePurchaseOrderQuantityResponse) {
          this.periodWisePurchaseOrderList = response.data.periodWisePurchaseOrderQuantityResponse;
          this.periodWisePurchaseOrderList.forEach(innerElement => {
           
            if (this.periodWisePurchaseOrderList != null && this.periodWisePurchaseOrderList != undefined) {
              newReqObjForQuantity['quantity'] = innerElement.quantity
              this.newArrayForQuantity.push(DecimalUtils.fixedDecimal(innerElement.quantity,3))
            }
            if (this.periodWisePurchaseOrderList != null && this.periodWisePurchaseOrderList != undefined) {
              newReqObjForPeriod['period'] = innerElement.period
              this.newArrayForPeriod.push(innerElement.period);
              this.rerender();
              this.dtTrigger1.next();

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
      this.newArrayForQuantity = []
      this.newArrayForPeriod = []
      this.fetchAllProductWisePurchaseOrderDetails(this.purchaseAnalyticsForm.value.type)
      this.fetchAllCategoryWisePurchaseOrderDetails(this.purchaseAnalyticsForm.value.type);
      this.fetchAllSupplierWisePurchaseOrderDetails(this.purchaseAnalyticsForm.value.type);
      this.fetchAllLocationWisePurchaseOrderDetails(this.purchaseAnalyticsForm.value.type);
    }
  }
  exportAsXLSX() {
    if (this.periodWisePurchaseOrderList && this.periodWisePurchaseOrderList.length > 0) {
      this.excelService.exportAsExcelFile(this.periodWisePurchaseOrderList, 'purchaseAnalytics', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }
  OnDataChange() {
    this.dashboardService.shareFormData.next(this.purchaseAnalyticsForm.value);
  }
  enableDate(data) {
    if (data === "Custom Dates") {
      this.showFields = true;
    }
    else {
      this.purchaseAnalyticsForm.controls.etaFrom.setValue(null);
      this.purchaseAnalyticsForm.controls.etaTo.setValue(null);
      this.showFields = false;
    }
  }
  ngAfterViewInit(): void {

    this.dtTrigger1.next();
    this.dtTrigger2.next();
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger1.unsubscribe();
    this.dtTrigger2.unsubscribe();

  }
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance)
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
    });
    setTimeout(() => {
      this.dtTrigger1.next();
      this.dtTrigger2.next();
    });
  }
/*   rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    // this.forPermissionsSubscription.unsubscribe();
  } */
  openModalPopUp() {
    this.ngxSmartModalService.getModal('purchaseAnalyticsOrder').open();
  }
  getPurchaseReceivedpurchaseOrderorderData(typeValue) {
    const formDetails = {
      'type': typeValue,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnType: "Receive",
      orderType: this.orderType
    }

    const newReqObjForQuantity = {}
    const newReqObjForPeriod = {}
    this.dashboardService.fetchAllPurchaseReceivedGraph(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.periodWiseGoodsReceiptManagementQuantityResponse) {
        this.periodWisePurchaseOrderReceiveList = response.data.periodWiseGoodsReceiptManagementQuantityResponse;
        this.periodWisePurchaseOrderReceiveList.forEach(innerElement => {
         
          if (this.periodWisePurchaseOrderReceiveList != null && this.periodWisePurchaseOrderReceiveList != undefined) {
            newReqObjForQuantity['quantity'] = innerElement.quantity
            this.newArrayForQuantity.push(DecimalUtils.fixedDecimal(innerElement.quantity,3))
          }
          if (this.periodWisePurchaseOrderReceiveList != null && this.periodWisePurchaseOrderReceiveList != undefined) {
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
    this.newArrayForQuantity = []
    this.newArrayForPeriod = []

  }
  getPurchaseReturnpurchaseOrderorderData(typeValue) {
    const formDetails = {
      'type': typeValue,
      grnDateFrom: this.purchaseAnalyticsForm.value.etaFrom,
      grnDateTo: this.purchaseAnalyticsForm.value.etaTo,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      grnType: "Return",
      orderType: this.orderType
    }

    const newReqObjForQuantity = {}
    const newReqObjForPeriod = {}
    this.dashboardService.fetchAllPurchaseReturnGraph(formDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.periodWiseGoodsReceiptManagementQuantityResponse) {
        this.periodWisePurchaseOrderReturnList = response.data.periodWiseGoodsReceiptManagementQuantityResponse;
        this.periodWisePurchaseOrderReturnList.forEach(innerElement => {
        
          if (this.periodWisePurchaseOrderReturnList != null && this.periodWisePurchaseOrderReturnList != undefined) {
            newReqObjForQuantity['quantity'] = innerElement.quantity
            this.newArrayForQuantity.push(DecimalUtils.fixedDecimal(innerElement.quantity,3))

          }
          if (this.periodWisePurchaseOrderReturnList != null && this.periodWisePurchaseOrderList != undefined) {
            newReqObjForPeriod['period'] = innerElement.period
            this.newArrayForPeriod.push(innerElement.period);
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
    this.newArrayForQuantity = []
    this.newArrayForPeriod = [];
  }
  fetchpurchaseWisepurchaseOrderDetails(typeValue) {
    const purchaseWiseDetails = {
      'type': typeValue,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      etaFrom: this.purchaseAnalyticsForm.value.etaFrom,
      etaTo: this.purchaseAnalyticsForm.value.etaTo,
      functionalityType: 'purchaseOrder',
      orderType: this.orderType
    }
    const newReqObjForQuantity = {}
    const newReqObjForPeriod = {}
    this.dashboardService.fetchAllPurchaseOrderGraph(purchaseWiseDetails).subscribe(response => {
      if (response && response.status === 0 && response.data.periodWisePurchaseOrderQuantityResponse) {
        this.periodWisePurchaseOrderList = response.data.periodWisePurchaseOrderQuantityResponse;
        this.periodWisePurchaseOrderList.forEach(innerElement => {
         
          if (this.periodWisePurchaseOrderList != null && this.periodWisePurchaseOrderList != undefined) {
            newReqObjForQuantity['quantity'] = innerElement.quantity
            this.newArrayForQuantity.push(DecimalUtils.fixedDecimal(innerElement.quantity,3))
            this.dtTrigger.next();
            this.dtTrigger1.next();
            this.rerender();

          }
          if (this.periodWisePurchaseOrderList != null && this.periodWisePurchaseOrderList != undefined) {
            newReqObjForPeriod['period'] = innerElement.period
            this.newArrayForPeriod.push(innerElement.period);
            this.dtTrigger.next();
            this.dtTrigger1.next();
            this.rerender();
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
    this.newArrayForQuantity = []
    this.newArrayForPeriod = [];

  }
 //this.forPermissionsSubscription.unsubscribe();
  }



