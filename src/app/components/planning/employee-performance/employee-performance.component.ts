import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { EmployeesService } from 'src/app/services/employees.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employee-performance',
  templateUrl: './employee-performance.component.html',
  styleUrls: ['./employee-performance.component.scss']
})
export class EmployeePerformanceComponent implements OnInit {
  @Output() emitTripSheet: any = new EventEmitter<any>();


  wareHouseTeamsListIDs: CompleterData
  formObj = this.configService.getGlobalpayload();
  employeesPerformanceForm: FormGroup
  UnLoadingEmployeePerformanceList: any = [];
  LoadingEmployeePerformanceList: any = [];
  grnListData: any = [];
  inwardQtyData: any = [];
  outwardQtyData: any = [];
  salesListData: any = [];
  shipmentListData: any = [];
  employeePerformancePermissionList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Employee Performance', Storage.getSessionUser());
  loadingList: any = [];
  unLoadingList: any = [];
  showInput: boolean = true
  shoTextArea: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  overAllPutawayData: any = null;
  overAllPickingData: any = null;
  overAllInternalTransfersData: any = null;
  overAllPackingData: any = null;
  overAllCopackingData: any = null;
  overAllRePackingData: any = null;
  overAllLabellingData: any = null;
  overAllOutwardShipLoadUnloadData: any = null;
  overAllInwardShipLoadUnloadData: any = null;
  overAllOutwardShipQualityCheckData: any = null;
  overAllInwardShipQualityCheckData: any = null;
  overAllGRNDataData: any = null;
  overAllSalesorderData: any = null;
  overAllShipmentOrderData: any = null;

  totalNetActualWorkDuration: any = null;
  totalNetPlannedWorkDuration: any = null;
  totalNetEarlyTime: any = null;
  totalNetDelayedTime: any = null;
  days = 0;
  Hours = 0;
  Minutes = 0;
  Seconds = 0;
  count: number;
  daysDelay = 0;
  HoursDelay = 0;
  MinutesDelay = 0;
  SecondsDelay = 0;
  countDelay: number = 0;
  daysPlanned = 0;
  HoursPlanned = 0;
  MinutesPlanned = 0;
  SecondsPlanned = 0;
  countPlanned: number = 0;
  daysEarly = 0;
  HoursEarly = 0;
  MinutesEarly = 0;
  SecondsEarly = 0;
  countEarly: number = 0;

  constructor(private employeeService: EmployeesService, private wmsService: WMSService,
    private fb: FormBuilder, private toastr: ToastrService, private datepipe: DatePipe,
    private configService: ConfigurationService, private commonmasterdataservice: CommonMasterDataService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  ngOnInit() {
    this.createEMployeePeformanceForm();
    this.employeesPerformanceForm.controls.endTimeFrom.setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'))
    this.employeesPerformanceForm.controls.endTimeTo.setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'))
    this.fetchAllExecutionIDName();
    this.generateAllFunctions();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  wareHouseTeamsList: any;
  fetchAllExecutionIDName() {
    this.commonmasterdataservice.fetchAllExecutionIDName(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
  }
  createEMployeePeformanceForm() {
    this.employeesPerformanceForm = this.fb.group({
      "endTimeFrom": [null],
      "endTimeTo": [null],
      "assignedBys": [null],
      "assignedTos": [null],
      "completedBys": null
    })
  }
  clear() {
    this.employeesPerformanceForm.reset();
    this.pickingEmployeePerformanceList = [];
    this.putawayEmployeePerformanceList = [];
    this.internalTransferEmployeePerformanceList = [];
    this.packingEmployeePerformanceList = [];
    this.rePackingEmployeePerformanceList = [];
    this.labelingEmployeePerformanceList = [];
    this.UnLoadingEmployeePerformanceList = [];
    this.LoadingEmployeePerformanceList = [];
    this.grnListData = [];
    this.inwardQtyData = [];
    this.outwardQtyData = [];
    this.salesListData = [];
    this.shipmentListData = [];
  }

  generateAllFunctions() {
    this.fetchEmployeesPerformanceDataPutAwayDetails();
    this.fetchEmployeesPerformanceDataPickingDetails();
    this.fetchEmployeesPerformanceInternalTransfersDetails();
    this.fetchEmployeesPerformancePackingDetails();
    this.fetchEmployeesPerformanceRePackingDetails();
    this.fetchEmployeesPerformanceCoPackingDetails();
    this.fetchEmployeesPerformanceLabellingDetails();
    this.fetchEmployeesPerformanceLoadingDetails();
    this.fetchEmployeesPerformanceUnLoadingDetails();
    this.fetchGRNData();
    this.fetchInwardQualityCheck();
    this.fetchSalesData();
    this.fetchShipmentOrderData();
    setTimeout(() => {
      this.days = 0;
      this.Hours = 0;
      this.Minutes = 0;
      this.Seconds = 0;
      this.count = 0;

      this.daysDelay = 0;
      this.HoursDelay = 0;
      this.MinutesDelay = 0;
      this.SecondsDelay = 0;
      this.countDelay = 0;

      this.daysPlanned = 0;
      this.HoursPlanned = 0;
      this.MinutesPlanned = 0;
      this.SecondsPlanned = 0;
      this.countPlanned = 0;

      this.daysEarly = 0;
      this.HoursEarly = 0;
      this.MinutesEarly = 0;
      this.SecondsEarly = 0;
      this.countEarly = 0;
      this.calculateNetTotals('overAllPutawayData');
      this.calculateNetTotals('overAllPickingData');
      this.calculateNetTotals('overAllInternalTransfersData');
      this.calculateNetTotals('overAllPackingData');
      this.calculateNetTotals('overAllCopackingData');
      this.calculateNetTotals('overAllRePackingData');
      this.calculateNetTotals('overAllLabellingData');
      this.calculateNetTotals('overAllOutwardShipLoadUnloadData');
      this.calculateNetTotals('overAllInwardShipLoadUnloadData');
      this.calculateNetTotals('overAllGRNDataData', 'grnTotal');
      this.calculateNetTotals('overAllSalesorderData', 'salesOrderTotal');
      this.calculateNetTotals('overAllInwardShipQualityCheckData', 'qualityCheckTotal');
      this.calculateNetTotals('overAllOutwardShipQualityCheckData', 'qualityCheckTotal');
      this.calculateNetTotals('overAllShipmentOrderData', 'shipmentOrderTotal');
    }, 500);
  }
  calculateNetTotals(dataForm, key?) {
    let value = key ? `${key}ActualWorkDurationDays` : `totalActualWorkDurationDays`;
    let value1 = key ? `${key}ActualWorkDurationHours` : `totalActualWorkDurationHours`;
    let value2 = key ? `${key}ActualWorkDurationMinutes` : `totalActualWorkDurationMinutes`;
    let value3 = key ? `${key}ActualWorkDurationSeconds` : `totalActualWorkDurationSeconds`;
    this.returnValues(dataForm, value, value1, value2, value3);


    let delay = key ? `${key}DelayedTimeDays` : `totalDelayedTimeDays`;
    let delay1 = key ? `${key}DelayedTimeHours` : `totalDelayedTimeHours`;
    let delay2 = key ? `${key}DelayedTimeMinutes` : `totalDelayedTimeMinutes`;
    let delay3 = key ? `${key}DelayedTimeSeconds` : `totalDelayedTimeSeconds`;

    this.returnValuesDelay(dataForm, delay, delay1, delay2, delay3);


    let planned = key ? `${key}PlannedWorkDurationDays` : `totalPlannedWorkDurationDays`;
    let planned1 = key ? `${key}PlannedWorkDurationHours` : `totalPlannedWorkDurationHours`;
    let planned2 = key ? `${key}PlannedWorkDurationMinutes` : `totalPlannedWorkDurationMinutes`;
    let planned3 = key ? `${key}PlannedWorkDurationSeconds` : `totalPlannedWorkDurationSeconds`;
    this.returnValuesPlanned(dataForm, planned, planned1, planned2, planned3);

    let early = key ? `${key}EarlyTimeDays` : `totalEarlyTimeDays`;
    let early1 = key ? `${key}EarlyTimeHours` : `totalEarlyTimeHours`;
    let early2 = key ? `${key}EarlyTimeMinutes` : `totalEarlyTimeMinutes`;
    let early3 = key ? `${key}EarlyTimeSeconds` : `totalEarlyTimeSeconds`;
    this.returnValuesEarly(dataForm, early, early1, early2, early3);
  }

  returnValues(dataForm, value, value1, value2, value3) {
    if (this[dataForm] && this[dataForm][value] && this[dataForm][value] > 0) {
      this.days += this[dataForm][value];
    }
    if (this[dataForm] && this[dataForm][value1] && this[dataForm][value1] > 0) {
      this.Hours += this[dataForm][value1];
    }
    if (this[dataForm] && this[dataForm][value2] && this[dataForm][value2] > 0) {
      this.Minutes += this[dataForm][value2];
    }
    if (this[dataForm] && this[dataForm][value3] && this[dataForm][value3] > 0) {
      this.Seconds += this[dataForm][value3];
    }
    this.count += 1;
    if (this.count == 14) {
      //converting hours,Minutes into Seconds
      if (this.Hours) {
        this.Seconds += (this.Hours * 60) * 60;
        this.Hours = 0;
      }
      if (this.Minutes) {
        this.Seconds += (this.Minutes * 60);
        this.Minutes = 0;
      }

      //converting Seconds to Minutes
      const totalSeconds = this.Seconds
      const totalMinutes = Math.floor(totalSeconds / 60);
      this.Seconds = totalSeconds % 60;

      //converting Minutes to Hours
      this.Minutes = totalMinutes % 60;

      this.Hours = Math.floor(totalMinutes / 60);

      //converting Hours to Days
      var addonDays = Math.floor(this.Hours / 24);
      this.Hours -= addonDays * 24;
      this.days += addonDays;

      this.totalNetActualWorkDuration = `${this.days} days, ${this.Hours}:${this.Minutes}:${this.Seconds}`;
      this.wmsService.dataPassingFortotalNetActualWorkDuration = this.totalNetActualWorkDuration;
    }
  }
  returnValuesDelay(dataForm, value, value1, value2, value3) {
    if (this[dataForm] && this[dataForm][value] && this[dataForm][value] > 0) {
      this.daysDelay += this[dataForm][value];
    }
    if (this[dataForm] && this[dataForm][value1] && this[dataForm][value1] > 0) {
      this.HoursDelay += this[dataForm][value1];
    }
    if (this[dataForm] && this[dataForm][value2] && this[dataForm][value2] > 0) {
      this.MinutesDelay += this[dataForm][value2];
    }
    if (this[dataForm] && this[dataForm][value3] && this[dataForm][value3] > 0) {
      this.SecondsDelay += this[dataForm][value3];
    }
    this.countDelay += 1;
    if (this.countDelay == 14) {
      //converting hours,Minutes into Seconds
      if (this.HoursDelay) {
        this.SecondsDelay += (this.HoursDelay * 60) * 60;
        this.HoursDelay = 0;
      }
      if (this.MinutesDelay) {
        this.SecondsDelay += (this.MinutesDelay * 60);
        this.MinutesDelay = 0;
      }

      //converting Seconds to Minutes
      const totalSeconds = this.SecondsDelay
      const totalMinutes = Math.floor(totalSeconds / 60);
      this.SecondsDelay = totalSeconds % 60;

      //converting Minutes to Hours
      this.MinutesDelay = totalMinutes % 60;

      this.HoursDelay = Math.floor(totalMinutes / 60);

      //converting Hours to Days
      var addonDays = Math.floor(this.HoursDelay / 24);
      this.HoursDelay -= addonDays * 24;
      this.daysDelay += addonDays;

      this.totalNetDelayedTime = `${this.daysDelay} days, ${this.HoursDelay}:${this.MinutesDelay}:${this.SecondsDelay}`;
      this.wmsService.dataPassingtotalNetDelayedTime = this.totalNetDelayedTime

    }
  }
  returnValuesPlanned(dataForm, value, value1, value2, value3) {
    if (this[dataForm] && this[dataForm][value] && this[dataForm][value] > 0) {
      this.daysPlanned += this[dataForm][value];
    }
    if (this[dataForm] && this[dataForm][value1] && this[dataForm][value1] > 0) {
      this.HoursPlanned += this[dataForm][value1];
    }
    if (this[dataForm] && this[dataForm][value2] && this[dataForm][value2] > 0) {
      this.MinutesPlanned += this[dataForm][value2];
    }
    if (this[dataForm] && this[dataForm][value3] && this[dataForm][value3] > 0) {
      this.SecondsPlanned += this[dataForm][value3];
    }
    this.countPlanned += 1;
    if (this.countPlanned == 14) {
      //converting hours,Minutes into Seconds
      if (this.HoursPlanned) {
        this.SecondsPlanned += (this.HoursPlanned * 60) * 60;
        this.HoursPlanned = 0;
      }
      if (this.MinutesPlanned) {
        this.SecondsPlanned += (this.MinutesPlanned * 60);
        this.MinutesPlanned = 0;
      }

      //converting Seconds to Minutes
      const totalSeconds = this.SecondsPlanned
      const totalMinutes = Math.floor(totalSeconds / 60);
      this.SecondsPlanned = totalSeconds % 60;

      //converting Minutes to Hours
      this.MinutesPlanned = totalMinutes % 60;

      this.HoursPlanned = Math.floor(totalMinutes / 60);

      //converting Hours to Days
      var addonDays = Math.floor(this.HoursPlanned / 24);
      this.HoursPlanned -= addonDays * 24;
      this.daysPlanned += addonDays;

      this.totalNetPlannedWorkDuration = `${this.daysPlanned} days, ${this.HoursPlanned}:${this.MinutesPlanned}:${this.SecondsPlanned}`;
      this.wmsService.dataPassingFortotalNetPlannedWorkDuration = this.totalNetPlannedWorkDuration;

    }
  }
  returnValuesEarly(dataForm, value, value1, value2, value3) {
    if (this[dataForm] && this[dataForm][value] && this[dataForm][value] > 0) {
      this.daysEarly += this[dataForm][value];
    }
    if (this[dataForm] && this[dataForm][value1] && this[dataForm][value1] > 0) {
      this.HoursEarly += this[dataForm][value1];
    }
    if (this[dataForm] && this[dataForm][value2] && this[dataForm][value2] > 0) {
      this.MinutesEarly += this[dataForm][value2];
    }
    if (this[dataForm] && this[dataForm][value3] && this[dataForm][value3] > 0) {
      this.SecondsEarly += this[dataForm][value3];
    }
    this.countEarly += 1;
    if (this.countEarly == 14) {
      //converting hours,Minutes into Seconds
      if (this.HoursEarly) {
        this.SecondsEarly += (this.HoursEarly * 60) * 60;
        this.HoursEarly = 0;
      }
      if (this.MinutesEarly) {
        this.SecondsEarly += (this.MinutesEarly * 60);
        this.MinutesEarly = 0;
      }

      //converting Seconds to Minutes
      const totalSeconds = this.SecondsEarly
      const totalMinutes = Math.floor(totalSeconds / 60);
      this.SecondsEarly = totalSeconds % 60;

      //converting Minutes to Hours
      this.MinutesEarly = totalMinutes % 60;

      this.HoursEarly = Math.floor(totalMinutes / 60);

      //converting Hours to Days
      var addonDays = Math.floor(this.HoursEarly / 24);
      this.HoursEarly -= addonDays * 24;
      this.daysEarly += addonDays;

      this.totalNetEarlyTime = `${this.daysEarly} days, ${this.HoursEarly}:${this.MinutesEarly}:${this.SecondsEarly}`;
      this.wmsService.dataPassingTotalNetEarlyTime = this.totalNetEarlyTime

    }
  }
  putAwayListForPassingData: any;
  putawayEmployeePerformanceList: any = [];
  fetchEmployeesPerformanceDataPutAwayDetails() {
    const appendingFormData0 = this.employeesPerformanceForm.value;
    this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos ? [this.employeesPerformanceForm.value.assignedTos] : null
    this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys ? [this.employeesPerformanceForm.value.assignedBys] : null
    this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys ? [this.employeesPerformanceForm.value.completedBys] : null
    appendingFormData0["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData0["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    delete appendingFormData0["noteType"]
    appendingFormData0['endTimeFrom'] = appendingFormData0['endTimeFrom'] ? new Date(appendingFormData0['endTimeFrom']) : null,
    appendingFormData0['endTimeTo'] = appendingFormData0['endTimeTo'] ? new Date(appendingFormData0['endTimeTo']) : null,
      this.wmsService.employeePerformanceFormDatapassing = this.employeesPerformanceForm.value;
    //appendingFormData0['completedBys'] = appendingFormData0.completedBys ? [appendingFormData0.completedBys] : null;
    this.employeeService.fetchAllemployesPutAwayPerformance(JSON.stringify(appendingFormData0)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putawayManagementEmployeePerformanceOverview.putawayManagementEmployeePerformanceResponses) {
          this.overAllPutawayData = response.data.putawayManagementEmployeePerformanceOverview;
          this.wmsService.overAllPutawayDataPassing = this.overAllPutawayData;
          this.putAwayListForPassingData = response.data.putawayManagementEmployeePerformanceOverview.putawayManagementEmployeePerformanceResponses
          this.putawayEmployeePerformanceList = response.data.putawayManagementEmployeePerformanceOverview.putawayManagementEmployeePerformanceResponses.filter(x => x.endTime);
          this.wmsService.passingPutawayEmployeePerformanceDataTableList = this.putAwayListForPassingData
        }
        else {
          this.putawayEmployeePerformanceList = [];
          this.overAllPutawayData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }
  }

  pickingEmployeePerformanceList: any = [];
  pickingListForPassingData: any;

  fetchEmployeesPerformanceDataPickingDetails() {
    const form = this.employeesPerformanceForm.value;
    const formValue = this.employeesPerformanceForm.value;

    const appendingFormData1 = this.employeesPerformanceForm.value;
    this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos ? [this.employeesPerformanceForm.value.assignedTos] : null
    this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys ? [this.employeesPerformanceForm.value.assignedBys] : null
    this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys ? [this.employeesPerformanceForm.value.completedBys] : null
    appendingFormData1["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData1["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    delete appendingFormData1["noteType"];
    this.employeeService.fetchAllemployesPicKingPerformance(JSON.stringify(appendingFormData1)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickingEmployeePerformanceOverview && response.data.pickingEmployeePerformanceOverview.pickingEmployeePerformanceResponses) {
          this.overAllPickingData = response.data.pickingEmployeePerformanceOverview;

          this.wmsService.overAllPickingDataPassing = this.overAllPickingData;

          this.pickingListForPassingData = response.data.pickingEmployeePerformanceOverview.pickingEmployeePerformanceResponses
          this.wmsService.passingPickingEmployeePerformanceDataTableList = this.pickingListForPassingData
          this.pickingEmployeePerformanceList = response.data.pickingEmployeePerformanceOverview.pickingEmployeePerformanceResponses.filter(x => x.endTime);
        }
        else {
          this.pickingEmployeePerformanceList = [];
          this.overAllPickingData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }
  }
  internalTransferEmployeePerformanceList: any = [];
  internalTransferListForPassingData: any;
  fetchEmployeesPerformanceInternalTransfersDetails() {
    const appendingFormData2 = this.employeesPerformanceForm.value;
    this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos ? [this.employeesPerformanceForm.value.assignedTos] : null
    this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys ? [this.employeesPerformanceForm.value.assignedBys] : null
    this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys ? [this.employeesPerformanceForm.value.completedBys] : null
    appendingFormData2["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData2["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    delete appendingFormData2["noteType"]
    this.employeeService.fetchAllemployesInternalTransferPerformance(JSON.stringify(appendingFormData2)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.internalTransferEmployeePerformanceOverview && response.data.internalTransferEmployeePerformanceOverview.internalTransferEmployeePerformanceResponses) {
          this.overAllInternalTransfersData = response.data.internalTransferEmployeePerformanceOverview;
          this.wmsService.overAllInternalTransfersDataPassing = this.overAllInternalTransfersData;
          this.internalTransferListForPassingData = response.data.internalTransferEmployeePerformanceOverview.internalTransferEmployeePerformanceResponses;
          this.wmsService.passingInternalTransfersEmployeePerformanceDataTableList = this.internalTransferListForPassingData;
          this.internalTransferEmployeePerformanceList = response.data.internalTransferEmployeePerformanceOverview.internalTransferEmployeePerformanceResponses.filter(x => x.endDate);
        }
        else {
          this.internalTransferEmployeePerformanceList = [];
          this.overAllInternalTransfersData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }
  }
  packingEmployeePerformanceList: any = [];
  packinListForPassingData: any;
  fetchEmployeesPerformancePackingDetails() {
    const appendingFormData3 = this.employeesPerformanceForm.value;
    this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos ? [this.employeesPerformanceForm.value.assignedTos] : null
    this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys ? [this.employeesPerformanceForm.value.assignedBys] : null
    this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys ? [this.employeesPerformanceForm.value.completedBys] : null
    appendingFormData3["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData3["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    delete appendingFormData3["noteType"];
    // appendingFormData3['completedBys'] = appendingFormData3.completedBys ? [appendingFormData3.completedBys] : null;
    this.employeeService.fetchAllemployesPackingPerformance(JSON.stringify(appendingFormData3)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.packingEmployeePerformanceOverview && response.data.packingEmployeePerformanceOverview.packingEmployeePerformanceResponses) {
          this.overAllPackingData = response.data.packingEmployeePerformanceOverview;
          this.wmsService.overAllPackingDatapPassing = this.overAllPackingData;
          this.packinListForPassingData = response.data.packingEmployeePerformanceOverview.packingEmployeePerformanceResponses
          this.wmsService.passingPackingListEmployeePerformanceDataTableList = this.packinListForPassingData
          this.packingEmployeePerformanceList = response.data.packingEmployeePerformanceOverview.packingEmployeePerformanceResponses
        }
        else {
          this.packingEmployeePerformanceList = [];
          this.overAllPackingData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }
  }
  rePackingEmployeePerformanceList: any = [];
  repackinListForPassingData: any;
  fetchEmployeesPerformanceRePackingDetails() {
    const appendingFormData4 = this.employeesPerformanceForm.value;
    this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos ? [this.employeesPerformanceForm.value.assignedTos] : null
    this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys ? [this.employeesPerformanceForm.value.assignedBys] : null
    this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys ? [this.employeesPerformanceForm.value.completedBys] : null
    appendingFormData4["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData4["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    delete appendingFormData4["noteType"]
    // appendingFormData4['completedBys'] = appendingFormData4.completedBys ? [appendingFormData4.completedBys] : null;
    this.employeeService.fetchAllemployesRePackingPerformance(JSON.stringify(appendingFormData4)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.rePackingEmployeePerformanceOverview && response.data.rePackingEmployeePerformanceOverview.rePackingEmployeePerformanceResponses) {
          this.overAllRePackingData = response.data.rePackingEmployeePerformanceOverview;
          this.wmsService.overAllRePackingDataPassing = this.overAllRePackingData;
          this.repackinListForPassingData = response.data.rePackingEmployeePerformanceOverview.rePackingEmployeePerformanceResponses;
          this.wmsService.passingrePackingListEmployeePerformanceDataTableList = this.repackinListForPassingData
          this.rePackingEmployeePerformanceList = response.data.rePackingEmployeePerformanceOverview.rePackingEmployeePerformanceResponses
        }
        else {
          this.overAllRePackingData = null;
          this.rePackingEmployeePerformanceList = [];
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }
  }
  coPackingEmployeePerformanceList: any = [];
  copackinListForPassingData: any;
  fetchEmployeesPerformanceCoPackingDetails() {
    const appendingFormData5 = this.employeesPerformanceForm.value;
    this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos ? [this.employeesPerformanceForm.value.assignedTos] : null
    this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys ? [this.employeesPerformanceForm.value.assignedBys] : null
    this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys ? [this.employeesPerformanceForm.value.completedBys] : null

    appendingFormData5["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData5["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    delete appendingFormData5["noteType"]

    // appendingFormData5['completedBys'] = appendingFormData5.completedBys ? [appendingFormData5.completedBys] : null;
    this.employeeService.fetchAllemployesCoPackingPerformance(JSON.stringify(appendingFormData5)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.coPackingEmployeePerformanceOverview.coPackingEmployeePerformanceResponses) {
          this.overAllCopackingData = response.data.coPackingEmployeePerformanceOverview;
          this.wmsService.overAllCopackingDataPassing = this.overAllCopackingData;
          this.copackinListForPassingData = response.data.coPackingEmployeePerformanceOverview.coPackingEmployeePerformanceResponses
          this.wmsService.passingcoPackingListEmployeePerformanceDataTableList = this.copackinListForPassingData;
          this.coPackingEmployeePerformanceList = response.data.coPackingEmployeePerformanceOverview.coPackingEmployeePerformanceResponses
        }
        else {
          this.coPackingEmployeePerformanceList = [];
          this.overAllCopackingData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }
  }
  labelingEmployeePerformanceList: any = [];
  labellingForPassingData: any;

  fetchEmployeesPerformanceLabellingDetails() {
    const appendingFormData6 = this.employeesPerformanceForm.value;
    this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos ? [this.employeesPerformanceForm.value.assignedTos] : null
    this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys ? [this.employeesPerformanceForm.value.assignedBys] : null
    this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys ? [this.employeesPerformanceForm.value.completedBys] : null
    appendingFormData6["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData6["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    delete appendingFormData6["noteType"]

    // appendingFormData6['completedBys'] = appendingFormData6.completedBys ? [appendingFormData6.completedBys] : null;
    this.employeeService.fetchAllemployesLabellingPerformance(JSON.stringify(appendingFormData6)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.labelingEmployeePerformanceOverview.labelingEmployeePerformanceResponses) {
          this.overAllLabellingData = response.data.labelingEmployeePerformanceOverview;
          this.wmsService.overAllLabellingDataPassing = this.overAllLabellingData;
          this.labellingForPassingData = response.data.labelingEmployeePerformanceOverview.labelingEmployeePerformanceResponses
          this.wmsService.passingLabellingDataListInEmployeePerformance = this.labellingForPassingData;
          this.labelingEmployeePerformanceList = response.data.labelingEmployeePerformanceOverview.labelingEmployeePerformanceResponses
        }
        else {
          this.labelingEmployeePerformanceList = [];
          this.overAllLabellingData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }
  }
  /* Loading Screeesns */
  loadingListForPassingData: any;
  fetchEmployeesPerformanceLoadingDetails() {
    const appendingFormData7 = this.employeesPerformanceForm.value;
    this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos ? [this.employeesPerformanceForm.value.assignedTos] : null
    this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys ? [this.employeesPerformanceForm.value.assignedBys] : null
    this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys ? [this.employeesPerformanceForm.value.completedBys] : null
    appendingFormData7["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData7["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName,
      appendingFormData7["noteType"] = 'Outward Shipment';
    appendingFormData7['type'] = 'LoadUnload';

    this.employeeService.fetchAllemployesLoadingPerformance(JSON.stringify(appendingFormData7)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses) {
          this.overAllOutwardShipLoadUnloadData = response.data.goodsReceiptNoteEmployeePerformanceOverview;

          this.wmsService.overAllOutwardShipLoadUnloadDataPassing = this.overAllOutwardShipLoadUnloadData;
          this.loadingListForPassingData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
          this.wmsService.passingLoadingListEmployeePerformanceDataTableList = this.loadingListForPassingData;
          this.LoadingEmployeePerformanceList = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses
        }
        else {
          this.LoadingEmployeePerformanceList = [];
          this.overAllOutwardShipLoadUnloadData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }
  }
  /* UnLoading Screens */
  UnloadingListForPassingData: any;
  fetchEmployeesPerformanceUnLoadingDetails() {
    const appendingFormData8 = this.employeesPerformanceForm.value;
    this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos ? [this.employeesPerformanceForm.value.assignedTos] : null
    this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys ? [this.employeesPerformanceForm.value.assignedBys] : null
    this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys ? [this.employeesPerformanceForm.value.completedBys] : null
    appendingFormData8["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      appendingFormData8["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    appendingFormData8["noteType"] = 'Inward Shipment';
    appendingFormData8['type'] = 'LoadUnload';

    // appendingFormData8['completedBys'] = appendingFormData8.completedBys ? [appendingFormData8.completedBys] : null;
    this.employeeService.fetchAllemployesUnLoadingPerformance(JSON.stringify(appendingFormData8)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses) {
          this.overAllInwardShipLoadUnloadData = response.data.goodsReceiptNoteEmployeePerformanceOverview;
          this.wmsService.unLoadingScreensDataPassing = this.overAllInwardShipLoadUnloadData;




          this.UnloadingListForPassingData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses
          this.wmsService.passingUnLoadingListEmployeePerformanceDataTableList = this.UnloadingListForPassingData;
          this.UnLoadingEmployeePerformanceList = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses
        }
        else {
          this.UnLoadingEmployeePerformanceList = [];
          this.overAllInwardShipLoadUnloadData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }
  }
  GRNListForPassingData: any;
  fetchGRNData() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    const formValue = this.employeesPerformanceForm.value;
    form['type'] = 'Grn';
    form['noteType'] = 'Inward Shipment';
    form['grnAssignedTos'] = formValue.assignedTos ? [formValue.assignedTos] : null;

    form['grnAssignedBys'] = formValue.assignedBys ? [formValue.assignedBys] : null;
    form['grnCompletedBys'] = formValue.completedBys ? [formValue.completedBys] : null;
    form['grnEndDateFrom'] = formValue.endTimeFrom;
    form['grnEndDateTo'] = formValue.endTimeTo;
    this.employeeService.fetchAllemployesUnLoadingPerformance(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses) {
          this.overAllGRNDataData = response.data.goodsReceiptNoteEmployeePerformanceOverview;

          this.wmsService.overAllGRNDataPassing = this.overAllGRNDataData;

          this.GRNListForPassingData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
          this.wmsService.passingGRNListEmployeePerformanceDataTableList = this.GRNListForPassingData
          this.grnListData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
        }
        else {
          this.grnListData = [];
          this.overAllGRNDataData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }

  }
  passingInwardCheckQuanlityData: any;
  passingOutwardData: any;
  fetchInwardQualityCheck() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    const formValue = this.employeesPerformanceForm.value;
    form['type'] = 'QualityCheck';
    form['noteType'] = 'Inward Shipment';
    form['qualityCheckAssignedTos'] = formValue.assignedTos ? [formValue.assignedTos] : null;
    form['qualityCheckAssignedBys'] = formValue.assignedBys ? [formValue.assignedBys] : null;
    form['qualityCheckCompletedBys'] = formValue.completedBys ? [formValue.completedBys] : null;
    form['qualityCheckEndDateFrom'] = formValue.endTimeFrom;
    form['qualityCheckEndDateTo'] = formValue.endTimeTo;
    this.employeeService.fetchAllemployesUnLoadingPerformance(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses) {
          this.overAllInwardShipQualityCheckData = response.data.goodsReceiptNoteEmployeePerformanceOverview;

          this.wmsService.overAllInwardShipQualityCheckDataDataPassing = this.overAllInwardShipQualityCheckData;

          this.passingInwardCheckQuanlityData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
          this.wmsService.passingInwardQualityCheckListInEmployeePerformance = this.passingInwardCheckQuanlityData;
          this.inwardQtyData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
        }
        else {
          this.inwardQtyData = [];
          this.overAllInwardShipQualityCheckData = null;
        }
      })
    form['noteType'] = 'Outward Shipment';
    this.employeeService.fetchAllemployesUnLoadingPerformance(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses) {
          this.overAllOutwardShipQualityCheckData = response.data.goodsReceiptNoteEmployeePerformanceOverview;
          this.wmsService.overAllOutwardShipQualityCheckDataPassing = this.overAllOutwardShipQualityCheckData;
          this.passingOutwardData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses
          this.wmsService.passingOutwardQualityCheckInEmployeePerformance = this.passingOutwardData
          this.outwardQtyData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
        }
        else {
          this.outwardQtyData = [];
          this.overAllOutwardShipQualityCheckData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }

  }
  passingSalesDataQuanlityData: any
  fetchSalesData() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    const formValue = this.employeesPerformanceForm.value;
    form['type'] = 'SalesOrder';
    form['noteType'] = 'Outward Shipment';
    form['salesOrderAssignedTos'] = formValue.assignedTos ? [formValue.assignedTos] : null;
    form['salesOrderAssignedBys'] = formValue.assignedBys ? [formValue.assignedBys] : null;
    form['salesOrderCompletedBys'] = formValue.completedBys ? [formValue.completedBys] : null;
    form['salesOrderEndDateFrom'] = formValue.endTimeFrom;
    form['salesOrderEndDateTo'] = formValue.endTimeTo;
    this.employeeService.fetchAllemployesUnLoadingPerformance(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses) {
          this.overAllSalesorderData = response.data.goodsReceiptNoteEmployeePerformanceOverview;
          this.wmsService.overAllSalesorderDataPassing = this.overAllSalesorderData;
          this.passingSalesDataQuanlityData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
          this.wmsService.passingSalesListDataEmployeePerformanceDataTableList = this.passingSalesDataQuanlityData;
          this.salesListData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
        }
        else {
          this.salesListData = [];
          this.overAllSalesorderData = null;
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }

  }
  passingShipmentOrderListData: any;
  fetchShipmentOrderData() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    const formValue = this.employeesPerformanceForm.value;
    form['type'] = 'ShipmentOrder';
    form['noteType'] = 'Outward Shipment';
    form['shipmentOrderAssignedTos'] = formValue.assignedTos ? [formValue.assignedTos] : null;
    form['shipmentOrderAssignedBys'] = formValue.assignedBys ? [formValue.assignedBys] : null;
    form['shipmentOrderCompletedBys'] = formValue.completedBys ? [formValue.completedBys] : null;
    form['shipmentOrderEndDateFrom'] = formValue.endTimeFrom;
    form['shipmentOrderEndDateTo'] = formValue.endTimeTo;
    this.employeeService.fetchAllemployesUnLoadingPerformance(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses) {
          this.overAllShipmentOrderData = response.data.goodsReceiptNoteEmployeePerformanceOverview;
          this.wmsService.overAllShipmentOrderDataPassing = this.overAllShipmentOrderData;
          this.passingShipmentOrderListData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
          this.wmsService.passingShipmentOrderDataEmployeePerformanceDataTableList = this.passingShipmentOrderListData;

          this.shipmentListData = response.data.goodsReceiptNoteEmployeePerformanceOverview.goodsReceiptNoteEmployeePerformanceResponses;
        }
        else {
          this.overAllShipmentOrderData = null;
          this.shipmentListData = [];
        }
      })
    if (this.employeesPerformanceForm.value.assignedTos != null && this.employeesPerformanceForm.value.assignedBys != null
      && this.employeesPerformanceForm.value.completedBys != null) {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();
    }

    if (this.employeesPerformanceForm.value.assignedTos === null) {
    }
    else {
      this.employeesPerformanceForm.value.assignedTos = this.employeesPerformanceForm.value.assignedTos.toString();

    }
    if (this.employeesPerformanceForm.value.assignedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.assignedBys = this.employeesPerformanceForm.value.assignedBys.toString();

    }
    if (this.employeesPerformanceForm.value.completedBys === null) {

    }
    else {
      this.employeesPerformanceForm.value.completedBys = this.employeesPerformanceForm.value.completedBys.toString();

    }

  }

  moreProductID() {
    this.showInput = false
    this.shoTextArea = true
  }
  moreProductIDArea() {
    this.showInput = true
    this.shoTextArea = false
  }
  generatePDF() {
    if (this.UnLoadingEmployeePerformanceList.length > 0 || this.inwardQtyData.length > 0 || this.grnListData.length > 0 || this.putawayEmployeePerformanceList.length > 0
      || this.salesListData.length > 0 || this.pickingEmployeePerformanceList.length > 0 || this.outwardQtyData.length > 0 || this.packingEmployeePerformanceList.length > 0 ||
      this.rePackingEmployeePerformanceList.length > 0 || this.coPackingEmployeePerformanceList.length > 0 || this.labelingEmployeePerformanceList.length > 0 ||
      this.shipmentListData.length > 0 || this.internalTransferEmployeePerformanceList.length > 0 || this.LoadingEmployeePerformanceList.length > 0) {
      this.emitTripSheet.emit();
      setTimeout(() => {
        window.print();
      }, 300);
    }
    else {
      this.toastr.error("No content to print ..Please Check Data")

    }
  }
}


