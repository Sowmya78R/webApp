import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExcelService } from '../../../shared/services/excel.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ApexService } from '../../../shared/services/apex.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { Constants } from '../../../constants/constants';
import { DataTableDirective } from 'angular-datatables';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { EmitterService } from 'src/app/services/emitter.service';
import { CompleterData, CompleterService } from 'ng2-completer';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html'
})
export class VehicleComponent implements OnInit, AfterViewInit, OnDestroy {
  vehicleForm: FormGroup;
  vehicles: any[] = [];
  vehicleInfo: any = {};
  vehicleKeys: any[] = ['#', 'Vehicle No', 'Chasis No', 'Type of Vehicle', 'Vehicle Capacity', 'Registration State', 'Owner',
    'Driver Name', 'Contact No', 'No of Shifts', 'Hours per Shift', 'Day Capacity', 'No of days per week', 'Weekly Capacity', 'Efficiency',
    'Utilization', 'Status', 'Action'];
  focusedElement: any;
  id: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  statuss: any = ['Active', 'InActive'];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isReadMode: any = false;
  missingParams: any;
  isShowOrHideError: any = false;
  equipmentIdValues: any = [];
  failureRecords: any = [];
  equipmentType: any;
  equipmentIds: CompleterData;
  equipmentIDNameIDs: CompleterData;
  equipmentMasters: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Vehicle', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;



  constructor(private apexService: ApexService,
    public ngxSmartModalService: NgxSmartModalService,
    private excelService: ExcelService,
    private toastr: ToastrService, private configService: ConfigurationService,
    private commonMasterDataService: CommonMasterDataService,
    private customValidators: CustomValidators,
    private excelRestService: ExcelRestService,
    private util: Util, private metaDataService: MetaDataService,
    private emitterService: EmitterService, private completerService: CompleterService,
    private translate: TranslateService,) {
      this.translate.use(this.language);

  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        lengthMenu: 'Show _MENU_ Entries',
      }
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
       if (data) {
         this.formObj = this.configService.getGlobalpayload();
         this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Vehicle', Storage.getSessionUser());
         this.getFunctionCalls()
       }
     }) */
    this.getFunctionCalls()
  }
  getFunctionCalls() {
    if (this.permissionsList.includes('View')) {
      this.createVehicleForm();
      this.fetchAllVehicles();
      this.apexService.getPanelIconsToggle();
      this.fetchAllEquipmentType();
      this.fetchAllEquipments();
      // this.fetchData();
    }
  }
  fetchData() {
    this.emitterService.fetchAllEquipments();
    this.emitterService.equipmentDescriptionValues.subscribe(res => {
      this.equipmentIdValues = res;
      if (res.length > 0) {
        this.equipmentIds = this.completerService.local(res, 'equipmentIDName', 'equipmentIDName');
      }
    });
  }
  onSelectedEquipmentType(data) {
    const filteredData = this.equipmentMasters.find(x => x.equipmentIDName ===
      this.vehicleForm.value.equipmentInfo.equipmentIDName)
    this.vehicleForm.controls.equipmentType.setValue(filteredData.equipmentType);
  }
  fetchAllEquipments() {
    this.commonMasterDataService.fetchAllEquipments(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.equipmentMaster) {
          this.equipmentMasters = response.data.equipmentMaster;
          this.equipmentIds = this.completerService.local(this.equipmentMasters, 'equipmentIDName', 'equipmentIDName');

        } else {
          this.equipmentMasters = [];
          this.equipmentIds = this.completerService.local(this.equipmentMasters, 'equipmentIDName', 'equipmentIDName');
        }
      },
      (error) => {
        this.equipmentMasters = [];
        this.equipmentIds = this.completerService.local(this.equipmentMasters, 'equipmentIDName', 'equipmentIDName');
      });
  }
  fetchAllEquipmentType() {
    this.metaDataService.fetchAllEquipmentTypes(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.equipmentTypes.length) {
          this.equipmentType = response.data.equipmentTypes;
          console.log(this.equipmentType);
        }
      },
      error => {
        this.equipmentType = [];
      }
    )
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  edit(details: any) {
    this.globalIDs = details._id;

    console.log(details)
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      window.scroll(0, 0);
      this.vehicleForm.patchValue(this.vehicleInfo);
      this.id = details._id;
      this.vehicleForm.patchValue(details);

      this.isReadMode = true;
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
    }
    else if (this.permissionsList.includes('View')) {
      console.log(this.permissionsList);
      window.scroll(0, 0);
      this.vehicleForm.patchValue(this.vehicleInfo);
      this.vehicleForm.disable();
      this.vehicleForm.patchValue(details);

    }
  }
  /*
  edit(details: any) {
    window.scroll(0, 0);
    this.isReadMode = true;
    this.vehicleInfo = Object.assign({}, details);
    this.id = details._id;
    this.vehicleForm.patchValue(this.vehicleInfo);
  } */
  save() {
  if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const reqFormData = this.vehicleForm.value;
      if (this.id) {
        this.vehicleForm.value._id = this.id;
      }
      if (reqFormData.equipmentInfo != null) {
        const filteredEquipmentMaster = this.equipmentMasters.find(e => e.equipmentIDName == reqFormData.equipmentInfo.equipmentIDName);
        if (filteredEquipmentMaster) {
          reqFormData.equipmentInfo = {
            equipmentMasterID: filteredEquipmentMaster._id,
            equipmentID: filteredEquipmentMaster.equipmentID,
            equipmentName: filteredEquipmentMaster.equipmentName,
            equipmentIDName: filteredEquipmentMaster.equipmentIDName
          };
        }
      }
      else {
        reqFormData.equipmentInfo = null;
      }
      reqFormData['organizationInfo'] = this.configService.getOrganization();
      reqFormData['wareHouseInfo'] = this.configService.getWarehouse();
      this.commonMasterDataService.saveOrUpdateVehicle(JSON.stringify(reqFormData)).subscribe(
        (response) => {
          console.log(response);
          if (response && response.status === 0 && response.data.vehicleMaster) {
            this.isReadMode = false;
            this.fetchAllVehicles();
            this.toastr.success(response.statusMsg);
            this.vehicleForm.reset();
            this.vehicleForm.get('status').setValue('Active');
            this.id = '';
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error(response.statusMsg);
            this.toastr.error(response.status);
            this.toastr.error('Failed in saving details before');
            this.fetchAllVehicles();
          }
        },
        (error) => {
          console.log(error);
          this.toastr.error('Failed in saving details after');
        }
      );
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
    this.globalIDs = null
  }
  clear() {
    this.vehicleForm.reset();
    this.vehicleForm.get('status').setValue('Active');
    this.isReadMode = false;
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.vehicleForm.enable();
    this.id = ''
  }
  fetchAllVehicles() {
    this.commonMasterDataService.fetchAllVehicles(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.vehicleMasters) {
          this.vehicles = response.data.vehicleMasters;
          this.rerender();
        } else {
          this.vehicles = [];
        }
      },
      (error) => {
        this.vehicles = [];
      });
  }
  createVehicleForm() {
    this.vehicleForm = new FormBuilder().group({
      vehicleNumber: ['', this.customValidators.required],
      chasisNumber: [''],
      vehicleType: [''],
      vehicleName: ['', this.customValidators.required],
      registrationState: [''],
      vehicleCapacity: [''],
      noOfShifts: [''],
      dayCapacity: [''],
      weeklyCappacity: [''],
      utilization: [''],
      hoursPerShift: [''],
      noOfDaysPerWeek: [''],
      efficency: [''],
      sequenceNumber: [''],
      //sequenceNumber: ['', Validators.compose([null, Validators.maxLength(99)])],
      owner: [''],
      driverName: [''],
      contactNumber: [''],
      vehicleRate: [''],
      status: ['Active', [Validators.required]],
      equipmentType: [''],
      equipmentInfo: new FormBuilder().group({
        equipmentMasterID: [null],
        equipmentID: [null],
        equipmentName: [null],
        equipmentIDName: [null],
        equipmentType: [null]
      })
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
      return this.vehicleForm.controls[fieldName].valid && this.vehicleForm.controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  exportAsXLSX() {
    const changedVehiclesList = this.exportTypeMethod(this.vehicles)
    this.excelService.exportAsExcelFile(changedVehiclesList, 'Vehicles', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['vehicleNumber'] = k.vehicleNumber
        obj['chasisNumber'] = k.chasisNumber
        obj['owner'] = k.owner
        obj['registrationState'] = k.registrationState
        obj['driverName'] = k.driverName
        obj['vehicleCapacity'] = k.vehicleCapacity
        obj['contactNumber'] = k.contactNumber
        obj['noOfShifts'] = k.noOfShifts
        obj['hoursPerShift'] = k.hoursPerShift
        obj['dayCapacity'] = k.dayCapacity
        obj['noOfDaysPerWeek'] = k.noOfDaysPerWeek
        obj['weeklyCappacity'] = k.weeklyCappacity
        obj['efficency'] = k.efficency
        obj['utilization'] = k.utilization
        obj['vehicleType'] = k.vehicleType
        obj['equipmentType'] = k.equipmentType
        obj['vehicleRate'] = k.vehicleRate
        obj['vehicleName'] = k.vehicleName
        if (k.equipmentInfo) {
          obj['equipmentID'] = k.equipmentInfo.equipmentID
        } else {
          obj['equipmentID'] = null
        }
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['vehicleNumber'] = null
      obj['chasisNumber'] = null
      obj['owner'] = null
      obj['registrationState'] = null
      obj['driverName'] = null
      obj['vehicleCapacity'] = null
      obj['contactNumber'] = null
      obj['noOfShifts'] = null
      obj['hoursPerShift'] = null
      obj['dayCapacity'] = null
      obj['noOfDaysPerWeek'] = null
      obj['weeklyCappacity'] = null
      obj['efficency'] = null
      obj['utilization'] = null
      obj['vehicleType'] = null
      obj['equipmentType'] = null
      obj['vehicleRate'] = null
      obj['vehicleName'] = null
      obj['equipmentID'] = null
      arr.push(obj)
    }
    return arr
  }
  getWeeklyCapacity() {
    const dayCapacity = this.vehicleForm.value.dayCapacity || 0;
    const noOfDaysPerWeek = this.vehicleForm.value.noOfDaysPerWeek || 0;
    if (dayCapacity && noOfDaysPerWeek) {
      this.vehicleForm.controls.weeklyCappacity.setValue(DecimalUtils.multiply(dayCapacity , noOfDaysPerWeek));
    } else {
      this.vehicleForm.controls.weeklyCappacity.setValue(null);
    }
  }
  getDayCapacity() {
    const hoursPerShift = this.vehicleForm.value.hoursPerShift || 0;
    const noOfShifts = this.vehicleForm.value.noOfShifts || 0;
    if (hoursPerShift && noOfShifts) {
      this.vehicleForm.controls.dayCapacity.setValue(DecimalUtils.multiply(hoursPerShift , noOfShifts));
    } else {
      this.vehicleForm.controls.dayCapacity.setValue(null);
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.vehicleInfo = { name: 'Vehicle', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllVehicles();
    }
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
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.VEHICLE;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        console.log(jsonData);
        if (jsonData.length > 0) {
          event.target.value = '';
          const missingParamsArray = this.mandatoryCheck(jsonData);
          console.log(jsonData);
          if (missingParamsArray.length > 1) {
            this.failureRecords = missingParamsArray;
            this.missingParams = missingParamsArray.join(', ');
            this.toastr.error('Please download log file to fill mandatory fields');
          } else {
            const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.VEHICLE);
            console.log(JSON.stringify(reqData));
            reqData.forEach(r => {
              console.log(r.equipmentID);
              if (r.equipmentID) {
                let equip = this.mapId('equipmentID', r.equipmentID);
                console.log(equip)
                if (equip) {
                  r['equipmentInfo']['equipmentID'] = equip.equipmentID
                  r['equipmentInfo']['equipmentName'] = equip.equipmentName
                  r['equipmentInfo']['equipmentMasterID'] = equip._id
                  r['equipmentInfo']['equipmentIDName'] = equip.equipmentIDName
                  r['equipmentInfo']['equipmentType'] = equip.equipmentType
                } else {
                  r['equipmentInfo']['equipmentID'] = r.equipmentID
                  r['equipmentInfo']['equipmentName'] = null
                  r['equipmentInfo']['equipmentMasterID'] = null
                  r['equipmentInfo']['equipmentIDName'] = null
                  r['equipmentInfo']['equipmentType'] = null
                }
              }
              delete r.equipmentIDName
              reqData.forEach(r => {
                r['organizationInfo'] = this.configService.getOrganization();
                r['wareHouseInfo'] = this.configService.getWarehouse();
                r.vehicleCapacity = r.vehicleCapacity ? r.vehicleCapacity.toString():null
                r.contactNumber = r.contactNumber ? r.contactNumber.toString():null
                r.noOfShifts = r.noOfShifts ? r.noOfShifts.toString():null
                r.hoursPerShift = r.hoursPerShift ? r.hoursPerShift.toString():null
                r.dayCapacity = r.dayCapacity ? r.dayCapacity.toString():null
                r.noOfDaysPerWeek = r.noOfDaysPerWeek ? r.noOfDaysPerWeek.toString():null
                r.weeklyCappacity = r.weeklyCappacity ? r.weeklyCappacity.toString():null
                r.efficency = r.efficency ? r.efficency.toString():null
                r.utilization = r.utilization ? r.utilization.toString():null
                r.vehicleRate = r.vehicleRate ? r.vehicleRate.toString():null
              });
            });
            this.excelRestService.saveVehicleBulkdata(reqData).subscribe(res => {
              console.log((reqData));
              if (res && res.status === 0 && res.data.vehicleList && res.data.vehicleList.failureList &&
                res.data.vehicleList.failureList.length > 0 && res.data.vehicleList.successList &&
                res.data.vehicleList.successList.length > 0) {
                this.failureRecords = res.data.vehicleList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.vehicleList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllVehicles();
              } else if (res && res.status === 0 && res.data.vehicleList && res.data.vehicleList.failureList && res.data.vehicleList.failureList.length > 0) {
                this.failureRecords = res.data.vehicleList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.vehicleList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.vehicleList && res.data.vehicleList.failureList && res.data.vehicleList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.vehicleList && res.data.vehicleList.duplicateList && res.data.vehicleList.duplicateList.length > 0) {
                  this.failureRecords = res.data.vehicleList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllVehicles();
                } else {
                  this.fetchAllVehicles();
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

  mapId(type, value) {
    switch (type) {
      case 'equipmentID': {
        const equipmentIds = this.equipmentMasters.find(e => e.equipmentID == value);
        return equipmentIds ? equipmentIds : null;
      }
      
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['vehicleNumber']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.VEHICLE;
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
        fileName: "Vehicle Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}
