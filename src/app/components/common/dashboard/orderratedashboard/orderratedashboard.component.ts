import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { CompleterData } from "ng2-completer";
import { ConfigurationService } from "src/app/services/integration-services/configuration.service";
import { OutboundMasterDataService } from "src/app/services/integration-services/outboundMasterData.service";
import { WMSService } from "src/app/services/integration-services/wms.service";
import { Storage } from '../../../../shared/utils/storage';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-orderratedashboard',
  templateUrl: './orderratedashboard.component.html',
  styleUrls: ['./orderratedashboard.component.scss']
})
export class OrderratedashboardComponent implements OnInit {


  orderFillRatePermission =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Order Fill Rate', Storage.getSessionUser());
  orderFillRatePercentagepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Order Fill Rate Percentage', Storage.getSessionUser());
  volumeFillRatepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Volume Fill Rate', Storage.getSessionUser());
  volumeFillRatePercentagepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Volume Fill Rate Percentage', Storage.getSessionUser());
  onTimeOrderDeliverypermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'On Time Order Delivery', Storage.getSessionUser());
  onTimeOrderDeliveryPercentagepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'On Time Order Delivery Percentage', Storage.getSessionUser());
  onTimeVolumeDeliverypermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'On Time Volume Delivery', Storage.getSessionUser());
  onTimeVolumeDeliveryPercentagepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'On Time Volume Delivery Percentage', Storage.getSessionUser());
  perfectOrderRatepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Perfect Order Rate', Storage.getSessionUser());
  perfectOrderRatePercentagepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Perfect Order Rate Percentage', Storage.getSessionUser());
  perfectVolumeRatepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Perfect Volume Rate', Storage.getSessionUser());
  perfectVolumeRatePercentagepermissions =  this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Order Rate', 'Perfect Volume Rate Percentage', Storage.getSessionUser());

  currentItem: any = {
    "customerIDName": null,
    "type": null,
    "monthFrom": null,
    "monthTo": null,
    "yearFrom": null,
    "yearTo": null,
    "orderType": null,
    "organizationIDName": this.configService.getOrganization().organizationIDName,
    "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
    dispatchDateFrom: null,
    dispatchDateTo: null
  };
  periodChangeType: any = 'Year';
  "monthFrom": any = null;
  "monthTo": any = null;
  "yearFrom": any = this.datepipe.transform(new Date(), 'yyyy');
  "yearTo": any = this.datepipe.transform(new Date(), 'yyyy');
  dispatchDateFrom: any = null;
  dispatchDateTo: any = null;

  formObj = this.configService.getGlobalpayload();
  customerIDNameValues: CompleterData;
  customerIDName: any = null;
  yearDisplay: boolean = true;
  monthDisplay: boolean = false;
  dateDisplay: boolean = false;
  orderType: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  ngOnInit() {
    // this.createorderVolumeFillRateForm();
    this.fetchAllCustomers();
    this.filter1();
    this.orderType = "Sales Order";
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  constructor(private fb: FormBuilder, private wmsService: WMSService,
    private configService: ConfigurationService, private datepipe: DatePipe,
    private outboundMasterDataService: OutboundMasterDataService,  private translate: TranslateService,) {
      this.translate.use(this.language);
  }
  orderRateDashboardForm: FormGroup
  createorderVolumeFillRateForm() {
    this.orderRateDashboardForm = this.fb.group({
      periodChangeType: [null],
      yearChangeType: [null],
      monthChangeType: [null],
      dateChangeType: [null]
    })
  }
  fetchAllCustomers() {
    this.outboundMasterDataService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers) {
          this.customerIDNameValues = response.data.customers.map(x => x.customerIDName);
        }
      },
      (error) => {
      });
  }
  filter1() {
    this.currentItem = {
      "customerIDName": this.customerIDName,
      "type": this.periodChangeType,
      "monthFrom": this.periodChangeType == 'Month' ? this.monthFrom.split('-')[1] : null,
      "monthTo": this.periodChangeType == 'Month' ? this.monthTo.split('-')[1] : null,
      "yearFrom": this.periodChangeType == 'Year' ? (typeof (this.yearFrom) == 'object' ? this.datepipe.transform(new Date(this.yearFrom), 'yyyy') : this.yearFrom) : this.periodChangeType == 'Month' ? this.monthFrom.split('-')[0] : null,
      "yearTo": this.periodChangeType == 'Year' ? (typeof (this.yearTo) == 'object' ? this.datepipe.transform(new Date(this.yearTo), 'yyyy') : this.yearTo) : this.periodChangeType == 'Month' ? this.monthTo.split('-')[0] : null,
      "orderType": this.orderType ? this.orderType : 'Sales Order',
      "dispatchDateFrom": this.periodChangeType == 'Day' ?
        this.datepipe.transform(new Date(this.dispatchDateFrom), 'yyyy-MM-dd') : null,
      "dispatchDateTo": this.periodChangeType == 'Day' ?
        this.datepipe.transform(new Date(this.dispatchDateTo), 'yyyy-MM-dd') : null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    };
  }
  pasingInputValue: any;
  passData: any;
  filter() {
   // console.log(this.orderRateDashboardForm.value);
    this.pasingInputValue = this.orderRateDashboardForm
    console.log(this.pasingInputValue);
    this.wmsService.passCurrentFormData = this.pasingInputValue
    console.log(this.wmsService.passCurrentFormData);
  }

  onDataChange() {
    this.wmsService.passingOrderRateDashboardData.next(this.orderRateDashboardForm.value);
  }
  title = 'appBootstrap';

  model;

  onOpenCalendar(container) {
    container.yearSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('year');
  }
  onChangePeriods(data) {
    if (data === 'Year') {
      this.yearDisplay = true;
      this.monthDisplay = false;
      this.dateDisplay = false;
    }
    else if (data === 'Month') {
      this.yearDisplay = false;
      this.monthDisplay = true;
      this.dateDisplay = false;
    }
    else if (data === 'Day') {
      this.yearDisplay = false;
      this.monthDisplay = false;
      this.dateDisplay = true;
    }
  }

}
