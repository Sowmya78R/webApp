import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApexService } from '../../../shared/services/apex.service';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { Constants } from '../../../constants/constants';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
@Component({
  selector: 'app-warehouse-team',
  templateUrl: './warehouse-team.component.html'
})
export class WarehouseTeamComponent implements OnInit, OnDestroy {
  warehouseTeamForm: FormGroup;
  warehouseTeams: any[] = [];
  focusedElement: any;
  warehouseInfo: any;
  id: any;
  countries: any[] = [];
  missingParams: any;
  isShowOrHideError: any = false;
  wareHouseKeys: any = ['#', 'Executive ID', 'Executive Name', 'Executive ID Name', 'Email ID', 'Address', 'Country', 'State', 'City', 'Pin', 'Phone No',
    'Work Type', 'No of Shifts', 'Hours per Shift', 'Day Capacity', 'No of Days per week', 'Weekly capacity', 'Efficiency', 'utilization',
    'Login Time', 'Logout Time', 'Rate/Hr', 'Status', 'Action'];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  statuss: any = ['Active', 'InActive'];
  workTypes: any = Constants.WORK_TYPES;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  isReadMode: any = false;
  failureRecords: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Executives', Storage.getSessionUser());
  forPermissionsSubscription: any;
  dropdownSettings: {};
  statesData: any = [];
  statesList: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private apexService: ApexService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService,
    private excelService: ExcelService,
    private customValidators: CustomValidators,
    private configService: ConfigurationService,
    private excelRestService: ExcelRestService,
    private commonMasterDataService: CommonMasterDataService,
    private util: Util,
    private toastr: ToastrService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    this.createWarehouseTeamForm();
    // this.checkBoxEnableDisable();
  }

  ngOnInit() {

    this.dropdownSettings = {
      multiselect: false,
      singleSelection: false,
      idField: '_id',
      textField: 'column',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.dtOptions = {
     pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        lengthMenu: 'Show _MENU_ Entries',
      }
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.getFunctionCalls()
  }
  getFunctionCalls() {
    if (this.permissionsList.includes('View')) {
      this.fetchAllCountries();
      this.fetchAllStates();
      this.fetchAllWarehouseTeams();
      this.apexService.getPanelIconsToggle();

    }
  }
  zoneDropDownList: any = ['Al', 'B1'];

  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  executivePassword: boolean = false;
  readonlyPasswordMail: boolean = false
  globalIDs:any;
  edit(details: any) {
    this.globalIDs = details._id;
   
    this.getStates(details.country);
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      window.scroll(0, 0);
      this.isReadMode = true;
      this.warehouseInfo = Object.assign({}, details);
      this.id = details._id;
      this.warehouseInfo.loginTime = this.warehouseInfo.loginTime ? this.apexService.getDateTimeFromMilliSec(this.warehouseInfo.loginTime) : null;
      this.warehouseInfo.logoutTime = this.warehouseInfo.logoutTime ? this.apexService.getDateTimeFromMilliSec(this.warehouseInfo.logoutTime) : null;
      this.warehouseTeamForm.patchValue(this.warehouseInfo);
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
      this.executivePassword = true;

      if (details.email == null && details.executivePassword == null) {
        this.readonlyPasswordMail = false;

      }
      else {
        this.readonlyPasswordMail = true;
      }

    }
    else if (this.permissionsList.includes('View')) {

      window.scroll(0, 0);
      this.isReadMode = true;
      this.makeThisDisabled = false;
      this.warehouseInfo = Object.assign({}, details);
      this.id = details._id;
      this.warehouseInfo.loginTime = this.warehouseInfo.loginTime ? this.apexService.getDateTimeFromMilliSec(this.warehouseInfo.loginTime) : null;
      this.warehouseInfo.logoutTime = this.warehouseInfo.logoutTime ? this.apexService.getDateTimeFromMilliSec(this.warehouseInfo.logoutTime) : null;
      this.warehouseTeamForm.patchValue(this.warehouseInfo);
      window.scroll(0, 0);
      this.warehouseTeamForm.disable();
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'warehouseTeam', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllWarehouseTeams();
    }
  }
  fetchAllCountries() {
    this.commonMasterDataService.fetchAllCountries(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.countries) {
        this.countries = response.data.countries;
      } else {
        this.countries = [];
      }
    }, error => {
      this.countries = [];
    });
  }
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const wareHouseItemReq = this.warehouseTeamForm.value;
      wareHouseItemReq.loginTime = wareHouseItemReq.loginTime ? new Date(wareHouseItemReq.loginTime) : null;
      wareHouseItemReq.logoutTime = wareHouseItemReq.logoutTime ? new Date(wareHouseItemReq.logoutTime) : null;
      wareHouseItemReq.executiveUserID = wareHouseItemReq.executiveUserID ? wareHouseItemReq.executiveUserID : null
      wareHouseItemReq.executivePassword = wareHouseItemReq.executivePassword ? wareHouseItemReq.executivePassword : null
      wareHouseItemReq.email = wareHouseItemReq.email ? wareHouseItemReq.email : null
      if (this.id) {
        wareHouseItemReq._id = this.id;
      }
      wareHouseItemReq['organizationInfo'] = this.configService.getOrganization();
      wareHouseItemReq['wareHouseInfo'] = this.configService.getWarehouse();
      this.commonMasterDataService.saveOrUpdateWarehouseTeam(JSON.stringify(wareHouseItemReq)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouseTeam) {
            this.fetchAllWarehouseTeams();
            this.isReadMode = false;
            this.toastr.success('Saved successfully');
            this.warehouseTeamForm.reset();
            this.warehouseTeamForm.get('status').setValue('Active');
            this.id = ''
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in saving details');
          }
        },
        (error) => {
          this.toastr.error('Failed in saving details');
        }
      );
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
    this.readonlyPasswordMail = false
    this.globalIDs = null
  }
  clear() {
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.readonlyPasswordMail = false;
    this.warehouseTeamForm.reset();
    this.warehouseTeamForm.get('status').setValue('Active');
    this.isReadMode = false;
    this.warehouseTeamForm.enable();
    this.id = ''

  }
  WorkTypeVariableArray: any = [];
  myObjectVariable: any;
  fetchAllWarehouseTeams() {
    this.commonMasterDataService.fetchAllWarehouseTeams(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.warehouseTeams = response.data.wareHouseTeams;
          this.warehouseTeams.forEach(getWorkType => {
            this.WorkTypeVariableArray.push(getWorkType.workTypes)
            this.WorkTypeVariableArray.forEach(getDataOut => {
              this.myObjectVariable = getDataOut.workTypes
            })

          })
          //this. WorkTypeVariableArray=[]



          this.rerender();
        } else {
          // this.warehouseTeams = [];
        }
      },
      (error) => {
        //  this.warehouseTeams = [];
      });
  }
  executiveNameChanges() {
    this.warehouseTeamForm.controls.executiveName.setValue(`${this.warehouseTeamForm.value.executiveFirstName} ${this.warehouseTeamForm.value.executiveLastName}`);
  }
  getEquipmentIDName() {
    this.warehouseTeamForm.controls.executiveIDName.setValue(`${this.warehouseTeamForm.value.executiveID}:${this.warehouseTeamForm.value.executiveFirstName} ${this.warehouseTeamForm.value.executiveLastName}`);
    //this.warehouseTeamForm.controls.executiveIDName.setValue(`${this.warehouseTeamForm.value.executiveID}:${this.warehouseTeamForm.value.executiveFirstName} ${this.warehouseTeamForm.value.executiveLastName}`);
    //  this.warehouseTeamForm.controls.executiveUserID.setValue(`${this.warehouseTeamForm.value.executiveID}`);
    //  this.warehouseTeamForm.controls.executiveName.setValue(`${this.warehouseTeamForm.value.executiveFirstName} ${this.warehouseTeamForm.value.executiveLastName}`);
  }
  isAlreadyChecked: boolean;
  onChekedFunctions(event) {
    const checkbox = document.getElementById('subscribe') as HTMLInputElement | null;
    if (checkbox != null) {
      this.warehouseTeamForm.controls.executiveUserID.setValue(`${this.warehouseTeamForm.value.executiveID ? this.warehouseTeamForm.value.executiveID : ''}`);
      this.warehouseTeamForm.controls.executiveIDName.setValue(`${this.warehouseTeamForm.value.executiveID ? this.warehouseTeamForm.value.executiveID : null}:${this.warehouseTeamForm.value.executiveFirstName ? this.warehouseTeamForm.value.executiveFirstName : null} ${this.warehouseTeamForm.value.executiveLastName ? this.warehouseTeamForm.value.executiveLastName : null}`);
      this.warehouseTeamForm.controls.executiveName.setValue(`${this.warehouseTeamForm.value.executiveFirstName ? this.warehouseTeamForm.value.executiveFirstName : null} ${this.warehouseTeamForm.value.executiveLastName ? this.warehouseTeamForm.value.executiveLastName : null}`);
      if (event) {
        this.warehouseTeamForm.controls.executiveUserID.setValue(`${this.warehouseTeamForm.value.executiveID ? this.warehouseTeamForm.value.executiveID : ''}`);
        this.warehouseTeamForm.controls.executiveIDName.setValue(`${this.warehouseTeamForm.value.executiveID ? this.warehouseTeamForm.value.executiveID : null}:${this.warehouseTeamForm.value.executiveFirstName ? this.warehouseTeamForm.value.executiveFirstName : null} ${this.warehouseTeamForm.value.executiveLastName ? this.warehouseTeamForm.value.executiveLastName : null}`);
        this.warehouseTeamForm.controls.executiveName.setValue(`${this.warehouseTeamForm.value.executiveFirstName ? this.warehouseTeamForm.value.executiveFirstName : null} ${this.warehouseTeamForm.value.executiveLastName ? this.warehouseTeamForm.value.executiveLastName : null}`);
      }
      else {
        this.warehouseTeamForm.controls.executiveUserID.setValue(null)
        this.warehouseTeamForm.controls.executiveName.setValue(null)
      }
    }
  }
  fetchAllStates() {
    this.wmsService.fetchStates(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].countryStateMasters) {
        this.statesData = res['data'].countryStateMasters;
      }
    })
  }
  getStates(event) {
    const filteredRec = this.statesData.find(x => x.countryName == event);
    this.statesList = filteredRec ? filteredRec.stateNames : [];
  }
  checkBoxEnableDisable() {
    if (this.warehouseTeamForm.controls.executiveID != null && this.warehouseTeamForm.controls.executiveID.value != '') {
      document.getElementById("subscribe").removeAttribute('disabled')
    }
    else {
      document.getElementById("subscribe").setAttribute('disabled', "true")
    }
  }

  createWarehouseTeamForm() {
    this.warehouseTeamForm = new FormBuilder().group({
      executiveName: [null],
      executiveFirstName: [null, this.customValidators.required],
      email: [null],
      executiveIDName: [null],
      address: [null],
      state: [null],
      pin: [null],
      executiveID: [null, Validators.required],
      phoneNumber: [null],
      country: [null],
      city: [null],
      hoursPerShift: [null],
      noOfDaysPerWeek: [null],
      utilization: [null],
      loginTime: [null],
      sequenceNumber: [null],
      noOfShifts: [null],
      dayCapacity: [null],
      weeklyCapacity: [null],
      efficency: [null],
      logoutTime: [null],
      rate: [null],
      workTypes: [null, [Validators.required]],
      executiveUserID: [null],
      executiveLastName: [null],
      executivePassword: [null],
      status: ['Active', Validators.required],
    });
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName, formName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.util.shouldShowErrors(fieldName, formName);
    }
  }
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.warehouseTeamForm.controls[fieldName].valid && this.warehouseTeamForm.controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  exportAsXLSX() {
    const changedTaskList = this.exportTypeMethod(this.warehouseTeams)
    this.excelService.exportAsExcelFile(changedTaskList, 'WAREHOUSE TEAMS', Constants.EXCEL_IGNORE_FIELDS.WAREHOUSETEAMS);
  }
  exportTypeMethod(data) {
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        const obj = {}
        obj['executiveID'] = ele.executiveID
        obj['executiveFirstName'] = ele.executiveFirstName
        obj['executiveLastName'] = ele.executiveLastName
        obj['address'] = ele.address
        obj['country'] = ele.country
        obj['state'] = ele.state
        obj['city'] = ele.city
        obj['phoneNumber'] = ele.phoneNumber
        obj['email'] = ele.email
        obj['pin'] = ele.pin
        let workTypesArray = [];
        let workTypes = null;
        if (ele.workTypes && ele.workTypes.length > 0 && ele.workTypes != null && ele.workTypes != undefined) {
          ele.workTypes.forEach((workType) => {
            workTypesArray.push(workType)
          })
        }
        if (workTypesArray.length > 0) {
          workTypes = workTypesArray.join(",")
          obj['workTypes'] = workTypes;
        }
        else {
          obj['workTypes'] = null
        }
        obj['noofShifts'] = ele.noOfShifts
        obj['hoursPerShift'] = ele.hoursPerShift
        obj['daysCapacity'] = ele.dayCapacity
        obj['noOfDaysPerWeek'] = ele.noOfDaysPerWeek
        obj['weeklyCapacity'] = ele.weeklyCapacity
        obj['utilization'] = ele.utilization
        obj['loginTime'] = ele.loginTime
        obj['logoutTime'] = ele.logoutTime
        obj['efficiency'] = ele.efficiency
        obj['sequenceNumber'] = ele.sequenceNumber
        obj['Rate'] = ele.rate
        obj['Status'] = ele.status
        arr.push(obj)
      })
    } else {
      let obj = {}
      obj['executiveID'] = null
      obj['executiveFirstName'] = null
      obj['executiveLastName'] = null
      obj['address'] = null
      obj['country'] = null
      obj['state'] = null
      obj['city'] = null
      obj['phoneNumber'] = null
      obj['email'] = null
      obj['pin'] = null
      obj['workTypes'] = null
      obj['noofShifts'] = null
      obj['hoursPerShift'] = null
      obj['daysCapacity'] = null
      obj['noOfDaysPerWeek'] = null
      obj['weeklyCapacity'] = null
      obj['utilization'] = null
      obj['loginTime'] = null
      obj['logoutTime'] = null
      obj['efficiency'] = null
      obj['sequenceNumber'] = null
      obj['Rate'] = null
      obj['Status'] = null
      arr.push(obj)
    }
    return arr
  }
  getWeeklyCapacity() {
    const dayCapacity = this.warehouseTeamForm.value.dayCapacity || 0;
    const noOfDaysPerWeek = this.warehouseTeamForm.value.noOfDaysPerWeek || 0;
    if (dayCapacity && noOfDaysPerWeek) {
      this.warehouseTeamForm.controls.weeklyCapacity.setValue(DecimalUtils.multiply(dayCapacity, noOfDaysPerWeek));
    } else {
      this.warehouseTeamForm.controls.weeklyCapacity.setValue(null);
    }
  }
  getDayCapacity() {
    const hoursPerShift = this.warehouseTeamForm.value.hoursPerShift || 0;
    const noOfShifts = this.warehouseTeamForm.value.noOfShifts || 0;
    if (hoursPerShift && noOfShifts) {
      this.warehouseTeamForm.controls.dayCapacity.setValue(DecimalUtils.multiply(hoursPerShift, noOfShifts));
    } else {
      this.warehouseTeamForm.controls.dayCapacity.setValue(null);
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.onChekedFunctions(this.isAlreadyChecked);
    this.checkBoxEnableDisable();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    // this.forPermissionsSubscription.unsubscribe();
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.WAREHOUSETEAM;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        if (jsonData.length > 0) {
          event.target.value = '';
          const missingParamsArray = this.mandatoryCheck(jsonData);
          if (missingParamsArray.length > 1) {
            this.failureRecords = missingParamsArray;
            this.missingParams = missingParamsArray.join(', ');
            this.toastr.error('Please download log file to fill mandatory fields');
          } else {
            let reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.WAREHOUSETEAM);
            reqData.forEach(r => {
            
              if (r.state) {
                r['state'] = r.state
              } else {
                r['state'] = null
              }
              if (r.workTypes) {
                r['workTypes'] = this.genColumnsStruct(r.workTypes);
              
                /*   r.workTypes.forEach(deleteOrgWarehouse => {
                    delete deleteOrgWarehouse.organizationInfo
                    delete deleteOrgWarehouse.wareHouseInfo
                  }) */
              } else {
                r['workTypes'] = null
              }
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r["executiveName"] = r["executiveFirstName"] + " " + r["executiveLastName"]
              r["executiveIDName"] = r["executiveID"] + ":" + r["executiveFirstName"]
              r['GST'] = r.gstNumber
              r.phoneNumber = r.phoneNumber ? r.phoneNumber.toString() : null
              r.pin = r.pin ? r.pin.toString() : null
              r.noofShifts = r.noofShifts ? r.noofShifts.toString() : null
              r.hoursPerShift = r.hoursPerShift ? r.hoursPerShift.toString() : null
              r.daysCapacity = r.daysCapacity ? r.daysCapacity.toString() : null
              r.noOfDaysPerWeek = r.noOfDaysPerWeek ? r.noOfDaysPerWeek.toString() : null
              r.weeklyCapacity = r.weeklyCapacity ? r.weeklyCapacity.toString() : null
              r.utilization = r.utilization ? r.utilization.toString() : null
              r.efficiency = r.efficiency ? r.efficiency.toString() : null
              r.sequenceNumber = r.sequenceNumber ? r.sequenceNumber.toString() : null
              r.Rate = r.Rate ? r.Rate.toString() : null
            })

            this.excelRestService.saveTeamBulkdata(jsonData).subscribe(res => {
              if (res && res.status === 0 && res.data.wareHouseTeamList && res.data.wareHouseTeamList.failureList &&
                res.data.wareHouseTeamList.failureList.length > 0 && res.data.wareHouseTeamList.successList &&
                res.data.wareHouseTeamList.successList.length > 0) {
                this.failureRecords = res.data.wareHouseTeamList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.wareHouseTeamList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllWarehouseTeams();
              } else if (res && res.status === 0 && res.data.wareHouseTeamList && res.data.wareHouseTeamList.failureList && res.data.wareHouseTeamList.failureList.length > 0) {
                this.failureRecords = res.data.wareHouseTeamList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.wareHouseTeamList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.wareHouseTeamList && res.data.wareHouseTeamList.failureList && res.data.wareHouseTeamList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.wareHouseTeamList && res.data.wareHouseTeamList.duplicateList && res.data.wareHouseTeamList.duplicateList.length > 0) {
                  this.failureRecords = res.data.wareHouseTeamList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllWarehouseTeams();
                } else {
                  this.fetchAllWarehouseTeams();
                  this.toastr.success('Uploaded successfully');
                  this.failureRecords = [];
                }
              } else {
                this.toastr.error('Failed in uploading');
                this.failureRecords = [];
              }
            },
              error => { });
          }
        }
      }, 500);
    }
  }
  /* Default Dates Are Coming Isuue */
  genWorkTypesArray: any;
  genColumnsStruct(workType) {
   
    if (workType && workType.includes(',')) {
      const toArr = workType.split(',');
      this.genWorkTypesArray = toArr
      return this.genWorkTypesArray;
    }
    else if (this.workTypes.length > 0) {
      return workType = [workType];
    }
    else {
      return workType = []
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.WAREHOUSETEAM;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArray;
  }

  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };
  dyanmicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement("a");
    }
    const element = this.setting.element.dynamicDownload;
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Warehouse Team Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}
