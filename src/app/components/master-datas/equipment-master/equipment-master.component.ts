import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CommonMasterDataService } from '../../../services/integration-services/commonMasterData.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { EquimentEntity } from '../../../entities/equimentMasterData.entity';
import { Subject } from 'rxjs/Subject';
import { NgForm } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Constants } from '../../../constants/constants';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-equipment-master',
  templateUrl: './equipment-master.component.html'
})
export class EquipmentMasterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('equipmentForm') equipmentForm: NgForm;
  equipments: any[] = [];
  equipmentDetails: any;
  deleteInfo: any;
  focusedElement: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  statuss: any = ['Active', 'In Active'];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  isReadMode: any = false;
  missingParams: any;
  isShowOrHideError: any = false;
  failureRecords: any = [];
  // equipmentType:any=[];
  equipmentType: any;
  units: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Equipment', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;


  constructor(public ngxSmartModalService: NgxSmartModalService,
    private commonMasterDataService: CommonMasterDataService,
    private excelService: ExcelService, private configService: ConfigurationService,
    private excelRestService: ExcelRestService,
    private toastr: ToastrService, private metaDataService: MetaDataService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
     }

  ngOnInit() {
    this.equipmentDetails = new EquimentEntity();
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
    /* this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Equipment', Storage.getSessionUser());
        this.getFunctionCalls()
      }
    }) */
    this.getFunctionCalls()
  }
  getFunctionCalls() {
    if (this.permissionsList.includes('View')) {
      this.fetchAllEquipments();
      this.fetchAllEquipmentType();
      this.findAllUnits();
    }
  }
  findAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {
      });
  }
  getEquipmentIDName() {
    this.equipmentForm.controls.equipmentIDName.setValue
      (`${this.equipmentForm.value.equipmentID}:${this.equipmentForm.value.equipmentName}`);
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

  fetchAllEquipments() {
    this.commonMasterDataService.fetchAllEquipments(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.equipmentMaster) {
          this.equipments = response.data.equipmentMaster;
          this.rerender();
        } else {
          this.equipments = [];
        }
      },
      (error) => {
        this.equipments = [];
      });
  }
  clear(equipmentForm: NgForm) {
    document.getElementById("equipmentID").removeAttribute('readonly')
    document.getElementById("equipmentName").removeAttribute('readonly')
    this.equipmentDetails = {};
    this.isReadMode = false;
    this.equipmentDetails = new EquimentEntity();
    this.makeReadOnly = false;
    this.makeThisDisabled = false;

  }
  save(equipmentForm: NgForm) {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const req = JSON.parse(JSON.stringify(this.equipmentDetails));
      req['organizationInfo'] = this.configService.getOrganization();
      req['wareHouseInfo'] = this.configService.getWarehouse();
      this.commonMasterDataService.saveOrUpdateEquipmentDetails
        (JSON.stringify(req)).subscribe(
          (response) => {
            if (response && response.status === 0) {

              this.toastr.success(response.statusMsg);
              equipmentForm.form.reset();
              this.fetchAllEquipments();
              document.getElementById("equipmentID").removeAttribute('readonly')
              document.getElementById("equipmentName").removeAttribute('readonly')
              this.equipmentDetails = {}
              this.equipmentForm.controls.status.setValue("Active")
              // this.equipmentDetails.status = "Active";
              // this.equipmentDetails = equipmentDetails.status;
              console.log(this.equipmentForm.value)
            } else if (response && response.status === 2 && response.statusMsg) {
              this.toastr.error(response.statusMsg);
            } else {
              this.toastr.error('Failed to update');
              console.log(response.statusMsg);
              console.log(response.status);
              console.log(response);
            }
          },
          (error) => {
            console.log(error);
            this.toastr.error('Failed in updating');
          }
        );
      (error) => {
        console.log(error);
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  edit(details) {
    this.globalIDs = details._id
    document.getElementById("equipmentID").setAttribute('readonly', "true")
    document.getElementById("equipmentName").setAttribute('readonly', "true")

    //// this.makeReadOnly = true;
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.equipmentDetails = Object.assign({}, details);
      window.scroll(0, 0);
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
    }
    else if (this.permissionsList.includes('View')) {
      this.equipmentDetails = Object.assign({}, details);
      this.makeReadOnly = true;
      this.makeThisDisabled = true;
    }
    // this.equipmentDetails = {}
  }
  getWeeklyCapacity() {
    if (this.equipmentDetails.daysCapacity && this.equipmentDetails.noOfDaysPerWeek) {
      this.equipmentDetails.weeklyCapacity = DecimalUtils.multiply(this.equipmentDetails.daysCapacity, this.equipmentDetails.noOfDaysPerWeek);
    }
  }
  getDayCapacity() {
    if (this.equipmentDetails.hoursPerShift && this.equipmentDetails.noofShifts) {
      this.equipmentDetails.daysCapacity = DecimalUtils.multiply(this.equipmentDetails.hoursPerShift , this.equipmentDetails.noofShifts);
    }
  }
  getVolumeCalculation() {
    if (this.equipmentDetails.length && this.equipmentDetails.width && this.equipmentDetails.height) {
      this.equipmentDetails.volume =
      DecimalUtils.multiply(DecimalUtils.multiply(this.equipmentDetails.length , this.equipmentDetails.width), this.equipmentDetails.height)
    }
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.invalid && fieldName.touched;
    }
  }
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.valid && fieldName.touched;
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      console.log(data)
      //this.equipmentDetails = { name: 'equipment', id: data._id };
      let organizationInfo = data.organizationInfo;
      let wareHouseInfo = data.wareHouseInfo;
      this.deleteInfo = { name: 'equipment', id: data._id, organizationIDName: organizationInfo.organizationIDName, wareHouseIDName: wareHouseInfo.wareHouseIDName };
      console.log(this.deleteInfo)
      this.ngxSmartModalService.getModal('deletePopup').open();
      //data._id = null
      // this.equipmentDetails = {}
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllEquipments();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  exportAsXLSX() {
    const changedEquipmentsList = this.exportTypeMethod(this.equipments)
    this.excelService.exportAsExcelFile(changedEquipmentsList, 'Equipments-Data', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['equipmentID'] = k.equipmentID
        obj['equipmentName'] = k.equipmentName
        obj['noofShifts'] = k.noofShifts
        obj['daysCapacity'] = k.daysCapacity
        obj['weeklyCapacity'] = k.weeklyCapacity
        obj['utilization'] = k.utilization
        obj['hoursPerShift'] = k.hoursPerShift
        obj['noOfDaysPerWeek'] = k.noOfDaysPerWeek
        obj['efficiency'] = k.efficiency
        obj['sequenceNumber'] = k.sequenceNumber
        obj['equipmentType'] = k.equipmentType
        obj['equipmentRate'] = k.equipmentRate
       /*  obj['volume'] = k.volume */
       if(k.volume){
        obj['volume'] = DecimalUtils.fixedDecimal(Number(k.volume),2)
       }
       else{
        obj['volume'] = null
       }
        obj['uomVolume'] = k.uomVolume
        if(k.weight){
          obj['weight'] = DecimalUtils.fixedDecimal(Number(k.weight),2)
         }
         else{
          obj['weight'] = null
         }
       /*  obj['weight'] = k.weight */
        obj['uomWeight'] = k.uomWeight
        if(k.height){
          obj['height'] = DecimalUtils.fixedDecimal(Number(k.height),2)
         }
         else{
          obj['height'] = null
         }
       /*  obj['height'] = k.height */
        obj['uomHeight'] = k.uomHeight
        if(k.length){
          obj['length'] = DecimalUtils.fixedDecimal(Number(k.length),2)
         }
         else{
          obj['length'] = null
         }
      /*   obj['length'] = k.length */
        obj['uomLength'] = k.uomLength
       /*  obj['width'] = k.width */
       if(k.width){
        obj['width'] = DecimalUtils.fixedDecimal(Number(k.width),2)
       }
       else{
        obj['width'] = null
       }
        obj['uomWidth'] = k.uomWidth
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['equipmentID'] =null
      obj['equipmentName'] = null
      obj['noofShifts'] =null
      obj['daysCapacity'] = null
      obj['weeklyCapacity'] =null
      obj['utilization'] =null
      obj['hoursPerShift'] = null
      obj['noOfDaysPerWeek'] =null
      obj['efficiency'] =null
      obj['sequenceNumber'] = null
      obj['equipmentType'] = null
      obj['equipmentRate'] = null
      obj['volume'] =null
      obj['uomVolume'] = null
      obj['weight'] = null
      obj['uomWeight'] = null
      obj['height'] = null
      obj['uomHeight'] =null
      obj['length'] = null
      obj['uomLength'] = null
      obj['width'] = null
      obj['uomWidth'] = null
      arr.push(obj)
    }
    return arr
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
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.EQUIPMENT;
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
            let reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.RACK);
            reqData.forEach(r => {
              console.log(r);
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r.noofShifts = r.noofShifts ? r.noofShifts.toString() : null
              r.hoursPerShift = r.hoursPerShift ? r.hoursPerShift.toString() : null
              r.daysCapacity = r.daysCapacity ? r.daysCapacity.toString() : null
              r.noOfDaysPerWeek = r.noOfDaysPerWeek ? r.noOfDaysPerWeek.toString() : null
              r.weeklyCapacity = r.weeklyCapacity ? r.weeklyCapacity.toString() : null
              r.utilization = r.utilization ? r.utilization.toString() : null
              r.efficiency = r.efficiency ? r.efficiency.toString() : null
              r.sequenceNumber = r.sequenceNumber ? r.sequenceNumber.toString() : null
              r.equipmentRate = r.equipmentRate ? r.equipmentRate.toString() : null
              r.volume = r.volume ? r.volume.toString() : null
              r.weight = r.weight ? r.weight.toString() : null
              r.height = r.height ? r.height.toString() : null
              r.length = r.length ? r.length.toString() : null
              r.width = r.width ? r.width.toString() : null
            })
            this.excelRestService.saveEquipmentBulkdata(jsonData).subscribe(res => {
              if (res && res.status === 0 && res.data.equipmentList && res.data.equipmentList.failureList &&
                res.data.equipmentList.failureList.length > 0 && res.data.equipmentList.successList &&
                res.data.equipmentList.successList.length > 0) {
                this.failureRecords = res.data.equipmentList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.equipmentList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllEquipments();
              } else if (res && res.status === 0 && res.data.equipmentList && res.data.equipmentList.failureList && res.data.equipmentList.failureList.length > 0) {
                this.failureRecords = res.data.equipmentList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.equipmentList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.equipmentList && res.data.equipmentList.failureList && res.data.equipmentList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.equipmentList && res.data.equipmentList.duplicateList && res.data.equipmentList.duplicateList.length > 0) {
                  this.failureRecords = res.data.equipmentList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllEquipments();
                } else {
                  this.fetchAllEquipments();
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
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['equipmentName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.EQUIPMENT;
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
        fileName: "Equipment Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}
