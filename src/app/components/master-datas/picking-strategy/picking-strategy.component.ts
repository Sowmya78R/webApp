import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { PickingStrategyEntity } from '../../../entities/PickingStrategy.entity';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ApexService } from '../../../shared/services/apex.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { Storage } from '../../../shared/utils/storage';
import { NgForm } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Constants } from '../../../constants/constants';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-picking-strategy',
  templateUrl: './picking-strategy.component.html'
})
export class PickingStrategyComponent implements OnInit, AfterViewInit, OnDestroy {
  pickingStrategies: any[] = [];
  pickingStrategiesDataDownload: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  pickingStrategy: any = {
    zoneInfo: {}
  };
  zones: any[] = [];
  zonesData: any = [];
  failureRecords: any = [];
  missingParams: any;
  isShowOrHideError: any = false;
  isReadMode: any = false;
  pickingStrategyData: any;
  pickingStrategiesWithZones: any[] = [];
  focusedElement: any;
  pickingStrategyTypes: any[] = ['EACH', 'BULK'];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Picking Strategy', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  constructor(
    private apexService: ApexService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService,
    private excelService: ExcelService,
    private excelRestService: ExcelRestService,
    private toastr: ToastrService,
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
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    /* this.forPermissionsSubscription= this.configService.forPermissions$.subscribe(data => {
       if (data) {
         this.formObj = this.configService.getGlobalpayload();
         this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Picking Strategy', Storage.getSessionUser());
         this.getFunctionsCall();
       }
     }) */
    this.getFunctionsCall();

  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.pickingStrategyData = new PickingStrategyEntity();
      this.fetchPickingStrategyByID();
      this.fetchAllZones();
      this.fetchAllPickingStrategies();
      this.apexService.getPanelIconsToggle();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  clearPickingyStrategyData(pickingStrategyForm: NgForm) {
    this.pickingStrategyData = {
      zoneInfo: {}
    };
    pickingStrategyForm.form.reset();
    this.makeReadOnly = false;
    this.isReadMode = false;
    this.makeThisDisabled = false;

  }
  save(pickingStrategyForm: NgForm) {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      this.pickingStrategyData.zoneInfos = [];
      this.pickingStrategyData.zoneInfos.push(this.pickingStrategyData.zoneInfo);
      const pickingStrategyData = Object.assign({}, this.pickingStrategyData);
      delete pickingStrategyData.zoneInfo;
      if (this.pickingStrategyData && this.pickingStrategyData._id) {
        this.wmsService.UpdateIndividualPickingStrategyByID(JSON.stringify(pickingStrategyData)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data) {
              this.pickingStrategyData = {
                zoneInfo: {
                  zoneName: ''
                }
              };
              this.rerender();
              this.fetchAllPickingStrategies();
              this.toastr.success('Picking Strategy updated.');
              this.makeThisDisabled = false;
              pickingStrategyForm.form.reset();
            } else if (response && response.status === 2 && response.statusMsg) {
              this.toastr.error(response.statusMsg);
            } else {
              this.toastr.error('Failed in updating picking strategy.');
            }
          },
          (error) => {
            this.toastr.error('Failed in updating picking strategy.');
          });
        this.isReadMode = false;


      } else {
        pickingStrategyData['organizationInfo'] = this.configService.getOrganization();
        pickingStrategyData['wareHouseInfo'] = this.configService.getWarehouse();
        this.wmsService.saveOrUpdatePickingStrategyDetails(JSON.stringify(pickingStrategyData)).subscribe(
          (response) => {
            if (!!response && response.status === 0) {
              this.pickingStrategyData = {
                zoneInfo: {
                  zoneName: ''
                }
              };
              this.fetchAllPickingStrategies();
              this.toastr.success('Picking details saved.');
              this.makeThisDisabled = false;
            } else if (response && response.status === 2 && response.statusMsg) {
              this.toastr.error(response.statusMsg);
            } else {
              this.toastr.error('Failed in saving picking strategy.');
            }
          },
          (error) => {
            this.toastr.error('Failed in updating picking strategy.');
          });
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  makeReadOnly: boolean = false;
  editable: boolean = true;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  editPickingStrategyDetails(details) {
    console.log(details)
    this.globalIDs = details.PSID;
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      console.log(details)
      Storage.setSessionItem('isPASEdit', 'true');
      this.pickingStrategyData.pickingStrategyName = details.pickingStrategyName;
      this.pickingStrategyData.pickingStrategyType = details.pickingStrategyType;
      this.pickingStrategyData._id = details.PSID;
      this.pickingStrategyData.zoneInfo.zoneID = details.zoneID;
      this.pickingStrategyData.zoneInfo.zoneName = details.zoneName;
      this.pickingStrategyData.zoneInfo.sequenceNumber = details.sequenceNumber;
      console.log(this.pickingStrategyData.zoneInfo.sequenceNumber);
      window.scroll(0, 0);
      this.makeReadOnly = false;
      this.makeThisDisabled = true;
      this.isReadMode = true
    }
    else if (this.permissionsList.includes('View')) {
      this.pickingStrategyData.pickingStrategyName = details.pickingStrategyName;
      this.pickingStrategyData.pickingStrategyType = details.pickingStrategyType;
      this.pickingStrategyData._id = details.PSID;
      this.pickingStrategyData.zoneInfo.zoneID = details.zoneID;
      this.pickingStrategyData.zoneInfo.zoneName = details.zoneName;
      this.pickingStrategyData.zoneInfo.sequenceNumber = details.sequenceNumber;
      this.makeReadOnly = true;
      this.makeThisDisabled = true;
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'pickingStrategy', id: data.PSID, zoneID: data.zoneID };
      this.ngxSmartModalService.getModal('deletePopup').open();
    } else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllPickingStrategies();
    }
  }
  getSelected(type, value) {
    switch (type) {
      case 'zone': {
        this.zones.forEach((zone) => {
          if (zone.zoneName === value) {
            this.pickingStrategyData.zoneInfo.zoneID = zone._id;
          }
        });
        break;
      }
    }
  }
  fetchPickingStrategyByID(id?: any) {
    let ID = '5d27f6517ef1a11a60cd9bbc';
    if (id) {
      ID = id;
    }
    this.wmsService.fetchPickingStrategyByID(ID, this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.putawayStrategy) {
          this.pickingStrategy = response.data.putawayStrategy;
        } else {
          this.pickingStrategy = {};
        }
      },
      (error) => {
        this.pickingStrategy = {};
      });
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones) {
          this.zones = response.data.zones;
          this.zonesData = response.data.zones;
        } else {
          this.zones = [];
        }
      },
      (error) => {
        this.zones = [];
      });
  }
  fetchAllPickingStrategies() {
    this.wmsService.fetchAllPickingStrategies(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.pickingStrategies) {
          this.pickingStrategies = response.data.pickingStrategies;
          this.pickingStrategiesDataDownload = response.data.pickingStrategies;
          this.pickingStrategiesWithZones = this.getFilteredPickingStrategiesForTable();
          this.rerender();
        } else {
          this.pickingStrategies = [];
        }
      },
      (error) => {
        this.pickingStrategies = [];
      })
  }
  getFilteredPickingStrategiesForTable() {
    const pickingStrategies = this.pickingStrategies.slice();
    const pickingStrategieswithZones = [];
    pickingStrategies.forEach((strategy, index) => {
      for (const key in strategy) {
        if (key && key === 'zoneInfos') {
          strategy[key].forEach(zone => {
            zone.pickingStrategyName = strategy.pickingStrategyName;
            zone.PSID = strategy._id;
            zone.pickingStrategyType = strategy.pickingStrategyType;
            zone.organizationInfo = strategy.organizationInfo;
            zone.wareHouseInfo = strategy.wareHouseInfo;
            pickingStrategieswithZones.push(zone);
          });
        }
      }
    });
    return pickingStrategieswithZones;
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
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
  }
  exportAsXLSX() {
    const data = this.excelService.formatJSONForHeaderLines(this.pickingStrategiesDataDownload, 'zoneInfos');
    const changedData = this.exportTypeMethod(data)
    this.excelService.exportAsExcelFile(changedData, 'Piciking Strategy', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['finishedPickingStrategyName'] = k.finishedPickingStrategyName
        obj['pickingStrategyType'] = k.pickingStrategyType
        obj['zoneName'] = k.zoneName
        obj['sequenceNumber'] = k.sequenceNumber
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['finishedPickingStrategyName'] = null
      obj['pickingStrategyType'] = null
      obj['zoneName'] = null
      obj['sequenceNumber'] = null
      arr.push(obj)
    }
    return arr
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        const data1 = [];
        const logs = [];
        // const missingParamsArray = [];
        this.missingParams = null;
        let invalidRecord = false;
        const missingParamsArray = this.mandatoryCheckForHeaderLines(jsonData);
        if (missingParamsArray.length > 1) {
          this.failureRecords = missingParamsArray;
          this.missingParams = missingParamsArray.join(', ');
          this.toastr.error('Please download log file to fill mandatory fields');
          this.fetchAllPickingStrategies();
        }
        else {
          jsonData.forEach((s, index) => {
            console.log(s)
            if (s['finishedPickingStrategyName']) {
              data1.push(this.getPickingStrategyHeadersData(s))
            }
            else if (!s['finishedPickingStrategyName']) {
              if (data1.length > 0) {
                data1[data1.length - 1]['zoneInfos'].push(this.pickingStrategyLinesData(s))
              } else if (invalidRecord) {
                logs[data1.length - 1]['zoneInfos'].push(this.pickingStrategyLinesData(s))
              }
            }
            else {
              if (!s['finishedPickingStrategyName']) {
                invalidRecord = true;
                logs.push(this.getPickingStrategyHeadersData(s));
                const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PICKING_STRATEGY

                const missingParams = requiredParams.filter((param: any) => !(!!s[param]));
                if (missingParams.length > 0) {
                  missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', '\r\n')} \r\n`);
                }
              }
            }
          })
        }
        if (data1.length > 0) {
          data1.forEach(r => {
            r['organizationInfo'] = this.configService.getOrganization();
            r['wareHouseInfo'] = this.configService.getWarehouse();
          });
          if (data1.length > 0) {
            this.excelRestService.savePickingStrategyBulkdata(data1).subscribe(res => {
              if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.failureList && res.data.pickingStrategyList.failureList.length > 0 && res.data.sucessExcelList && res.data.sucessExcelList.length > 0) {
                this.failureRecords = res.data.pickingStrategyList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.pickingStrategyList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllPickingStrategies();
              } else if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.failureList && res.data.pickingStrategyList.failureList.length > 0) {
                this.failureRecords = res.data.pickingStrategyList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.pickingStrategyList.duplicateList);
                console.log(this.failureRecords);
                this.toastr.error('Failed in uploading, Please download log for reasons');
                this.fetchAllPickingStrategies();

              } else if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.failureList && res.data.pickingStrategyList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.duplicateList && res.data.pickingStrategyList.duplicateList.length > 0) {
                  this.failureRecords = res.data.pickingStrategyList.duplicateList;
                  console.log(this.failureRecords);
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllPickingStrategies();
                } else {
                  this.fetchAllPickingStrategies();
                  this.toastr.success('Uploaded successfully');
                  this.failureRecords = [];
                }
              } else {
                this.toastr.error('Failed in uploading');
                this.failureRecords = [];
                this.fetchAllPickingStrategies();

              }
            }, error => { })
          }

        }
      }, 500)
    }
  }
  getPickingStrategyHeadersData(s) {
    return {
      'pickingStrategyName': s['finishedPickingStrategyName'],
      'pickingStrategyType': s['pickingStrategyType'],
      "zoneInfos": [this.pickingStrategyLinesData(s)]
    }
  }
  pickingStrategyLinesData(document?) {
    if (document) {
      return {
        "zoneID": this.mapId("zoneName", document.zoneName),
        "zoneName": document.zoneName,
        "sequenceNumber": document.sequenceNumber ? document.sequenceNumber.toString() : null,
      }
    }
  }
  mapId(type, value) {
    switch (type) {
      case 'zoneName': {
        const zone = this.zones.find(w => w.zoneName === value);
        return zone && zone._id ? zone._id : null;
      }
    }
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


  mandatoryCheckForHeaderLines(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      let record = data[0];
      console.log(record)
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PICKING_STRATEGY;
      console.log(requiredParams)
      const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
      console.log(missingParams)
      if (missingParams.length > 0) {
        missingParamsArray.push(`Row No. ${1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
      }

    }
    return missingParamsArray;
  }
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "PICKING Strategy Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
    if (this.missingParams) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "PICKING Strategy Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}

/* getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        console.log(jsonData);
        const data1 = [];
        const logs = [];
        const missingParamsArray = [];
        this.missingParams = null;
        let invalidRecord = false;
        jsonData.forEach((s, index) => {
          console.log(s)
          if (s['finishedPickingStrategyName']) {
            data1.push(this.getPickingStrategyHeadersData(s))
          } if (!s['finishedPickingStrategyName'] && !s['pickingStrategyType']) {
            if (data1.length > 0) {
              data1[data1.length - 1]['zoneInfos'].push(this.pickingStrategyLinesData(s))
            } else if (invalidRecord) {
              logs[data1.length - 1]['zoneInfos'].push(this.pickingStrategyLinesData(s))
            }
          } else {
            if (!s['finishedPickingStrategyName'] && !s['pickingStrategyType']) {
              invalidRecord = true;
              logs.push(this.getPickingStrategyHeadersData(s));
              const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PICKING_STRATEGY_HEADER;

              const missingParams = requiredParams.filter((param: any) => !(!!s[param]));
              if (missingParams.length > 0) {
                missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', '\r\n')} \r\n`);
              }
            }
          }
        })
        if (data1.length > 0) {
          this.excelRestService.savePickingStrategyBulkdata(data1).subscribe(res => {
            if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.failureList && res.data.pickingStrategyList.failureList.length > 0 && res.data.sucessExcelList && res.data.sucessExcelList.length > 0) {
              this.failureRecords = res.data.pickingStrategyList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.pickingStrategyList.duplicateList);
              console.log(this.failureRecords);
              this.toastr.error('Partially failed in uploading, Please download log for reasons');
            } else if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.failureList && res.data.pickingStrategyList.failureList.length > 0) {
              this.failureRecords = res.data.pickingStrategyList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.pickingStrategyList.duplicateList);
              console.log(this.failureRecords);
              this.toastr.error('Failed in uploading, Please download log for reasons');
            } else if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.failureList && res.data.pickingStrategyList.failureList.length === 0) {
              if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.duplicateList && res.data.pickingStrategyList.duplicateList.length > 0) {
                this.failureRecords = res.data.pickingStrategyList.duplicateList;
                console.log(this.failureRecords);
                this.toastr.error('Duplicates present in the excel, Please download log file.');
              } else {
                this.fetchAllPickingStrategies();
                this.toastr.success('Uploaded successfully');
                this.failureRecords = [];
              }
            } else {
              this.toastr.error('Faild in uploading');
              this.failureRecords = [];
            }
          }, error => { })
        }
      }, 500)
    }
  }
  getPickingStrategyHeadersData(s) {
    return {
      'pickingStrategyName': s['finishedPickingStrategyName'],
      'pickingStrategyType': s['pickingStrategyType'],
      "zoneInfos": [this.pickingStrategyLinesData(s)]
    }
  }
  pickingStrategyLinesData(document?) {
    if (document) {
      return {
        "zoneID": this.mapId("zoneName", document.zoneName),
        "zoneName": document.zoneName,
        "sequenceNumber": document.sequenceNumber,
      }
    }
  }
  mapId(type, value) {
    switch (type) {
      case 'zoneName': {
        const zone = this.zones.find(w => w.zoneName === value);
        return zone && zone._id ? zone._id : null;
      }
    }
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
        fileName: "PICKING Strategy Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  } */
/* Uload Function  */
/* uploadExcel = async (event) => {
  if (event.target.files && event.target.files[0]) {
    this.failureRecords = [];
    this.isShowOrHideError = false;
    await this.excelService.generateJsonUsingExcel(event);
    setTimeout(() => {
      const jsonData = this.excelService.getJsonData();
      const endArray = [];
      event.target.value ='';
      const missingParamsArray = this.mandatoryCheck(jsonData);
      if (missingParamsArray.length > 1) {
        this.failureRecords = missingParamsArray;
        this.toastr.error('Please download log file to fill mandatory fields');
      } else {
        jsonData.forEach(record => {
          const { finishedPickingStrategyName, pickingStrategyType, ...filteredrecord} = record;
          const {zoneName , sequenceNumber, ...filteredLine} = JSON.parse(JSON.stringify(filteredrecord));
          if (record['finishedPickingStrategyName'] && record['pickingStrategyType']) {
            endArray.push({
              pickingStrategyName: finishedPickingStrategyName,
              pickingStrategyType,
                zoneInfos: [{
                  zoneID: this.mapZoneMasterID(zoneName),
                  zoneName,
                  sequenceNumber,
                }],
            });
          } else {
            if (endArray.length > 0) {
              endArray[endArray.length - 1].zoneInfos.push({...filteredLine,
                zoneID: this.mapZoneMasterID(zoneName),
                zoneName,
                sequenceNumber,
              });
            }
          }
        });
        if (endArray && endArray.length > 0) {
          this.excelRestService.savePickingStrategyBulkdata(endArray).subscribe(res => {
            if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.failureList &&
              res.data.pickingStrategyList.failureList.length > 0 && res.data.pickingStrategyList.successList &&
              res.data.pickingStrategyList.successList.length > 0) {
              this.failureRecords = res.data.pickingStrategyList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.pickingStrategyList.duplicateList);
              this.toastr.error('Partially failed in uploading, Please download log for reasons');
              this.fetchAllPickingStrategies();
            } else if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.failureList && res.data.pickingStrategyList.failureList.length > 0) {
              this.failureRecords = res.data.pickingStrategyList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.pickingStrategyList.duplicateList);
              this.toastr.error('Failed in uploading, Please download log for reasons');
            } else if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.failureList && res.data.pickingStrategyList.failureList.length === 0) {
              if (res && res.status === 0 && res.data.pickingStrategyList && res.data.pickingStrategyList.duplicateList && res.data.pickingStrategyList.duplicateList.length > 0) {
                this.failureRecords = res.data.pickingStrategyList.duplicateList;
                this.toastr.error('Duplicates present in the excel, Please download log file.');
                this.fetchAllPickingStrategies();
              } else {
                this.fetchAllPickingStrategies();
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
mapZoneMasterID(zoneID) {
  if (zoneID && this.zonesData.length > 0) {
    const filteredZone = this.zonesData.find(zone => zone.zoneName === zoneID);
    if (filteredZone && filteredZone._id) {
      return filteredZone._id;
    }
  }
}
mandatoryCheck(data) {
  const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
  if (data && data.length > 0) {
    data.forEach((record, index) => {
      if (record['pickingStrategyName'] && record['pickingStrategyType']) {
        const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PICKING_STRATEGY_HEADER.concat(Constants.UPLOAD_MANDAT_FIELDS.PICKING_STRATEGY_LINE);
        const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
        if (missingParams.length > 0) {
          missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
        }
      } else {
        const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PICKING_STRATEGY_LINE;
        const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
        if (missingParams.length > 0) {
          missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
        }
      }
    });
  }
  return missingParamsArray;
}

downloadLogFile() {
  if (this.failureRecords) {
    this.dyanmicDownloadByHtmlTag({
      fileName: "Picking Strategy Error Reasons",
      text: this.failureRecords.toString().replace(/,/g, '\n')
    });
  }
}
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
private setting = {
  element: {
    dynamicDownload: null as HTMLElement
  }
}; */
