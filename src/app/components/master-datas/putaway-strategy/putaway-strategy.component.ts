import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { Storage } from '../../../shared/utils/storage';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ApexService } from '../../../shared/services/apex.service';
import { PutawayStrategyEntity } from '../../../entities/PutawayStrategy.entity';
import { NgForm } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Constants } from '../../../constants/constants'
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-putaway-strategy',
  templateUrl: './putaway-strategy.component.html'
})
export class PutawayStrategyComponent implements OnInit, OnDestroy, AfterViewInit {
  putawayStrategies: any = [];
  putawayStrategy: any = {
    zoneInfos: []

  };
  putawayStrategiesDownloadData: any = [];
  zones: any[] = [];
  failureRecords: any = [];
  missingParams: any;
  isShowOrHideError: any = false;
  isReadMode: any = false;
  zonesData: any = [];
  putawayStrategyData: any;
  putawayStrategiesWithZones: any[] = [];
  focusedElement: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Putaway Strategy', Storage.getSessionUser());
  forPermissionsSubscription:any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(
    private apexService: ApexService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService,
    private excelRestService: ExcelRestService,
    private excelService: ExcelService,
    private toastr: ToastrService,
    private translate:TranslateService,) {
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
   /*  this.forPermissionsSubscription=this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Putaway Strategy', Storage.getSessionUser());
        this.getFunctionsCall();
      }
    }) */
    this.getFunctionsCall();
  }
  getFunctionsCall(){
    if (this.permissionsList.includes('View')) {
      this.putawayStrategyData = new PutawayStrategyEntity();
      this.fetchAllPutawayStrategyByID();
      this.fetchAllZones();
      this.fetchAllPutawayStrategies();
      this.apexService.getPanelIconsToggle();
    }
  }
  clearPutawayStrategyData(putawayStrategyForm: NgForm) {
    this.putawayStrategyData = {
      zoneInfo: {}
    };
    this.isReadMode = false;
    putawayStrategyForm.form.reset();
    this.makeReadOnly = false;
    this.makeThisDisabled = false;

  }
  save(putawayStrategyForm: NgForm) {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
    this.putawayStrategyData.zoneInfos = [];
    this.putawayStrategyData.zoneInfos.push(this.putawayStrategyData.zoneInfo);
    const putawayStrategyData = Object.assign({}, this.putawayStrategyData);
    delete putawayStrategyData.zoneInfo;
    if (this.putawayStrategyData && this.putawayStrategyData._id) {
      this.wmsService.UpdateIndividualPutawayStrategyByID(JSON.stringify(putawayStrategyData)).subscribe(
        (response) => {
          if (!!response && response.status === 0) {
            this.putawayStrategyData = {
              zoneInfo: {}
            };
            this.rerender();
            this.fetchAllPutawayStrategies();
            putawayStrategyForm.form.reset();
            this.toastr.success('Updated successfully');
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in updating');
          }
        },
        (error) => {
          this.toastr.error('Failed in updating');
        }
        
      );
      this.isReadMode = false;
    } else {
      putawayStrategyData['organizationInfo'] = this.configService.getOrganization();
      putawayStrategyData['wareHouseInfo'] = this.configService.getWarehouse();
      this.wmsService.saveOrUpdatePutawayStrategyDetails(JSON.stringify(putawayStrategyData)).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.putawayStrategyData = {
              zoneInfo: {}
            };
            this.rerender();
            this.fetchAllPutawayStrategies();
            putawayStrategyForm.form.reset();
            this.toastr.success('Added successfully');
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in adding');
          }
        },
        (error) => {
          this.toastr.error('Failed in adding');
        }
      );
    }
  }
  else
  {
    this.toastr.error("User doesn't have Permissions.")
  }
  this.globalIDs = null
  }
  makeReadOnly:boolean = false;
makeThisDisabled:boolean = false;
globalIDs:any;
  editPutawayStrategyDetails(details: any) {
    console.log(details);
    this.globalIDs = details.PSID
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
    Storage.setSessionItem('isPASEdit', 'true');
    this.putawayStrategyData.putawayStrategyName = details.putawayStrategyName;
    this.putawayStrategyData._id = details.PSID;
    this.putawayStrategyData.zoneInfo.zoneID = details.zoneID;
    this.putawayStrategyData.zoneInfo.zoneName = details.zoneName;
    this.putawayStrategyData.zoneInfo.sequenceNumber = details.sequenceNumber;
    this.putawayStrategyData.wareHouseInfo = details.wareHouseInfo;
    this.putawayStrategyData.organizationInfo = details.organizationInfo;
    window.scroll(0, 0);
    this.makeReadOnly = false;
    this.isReadMode = true;
    this.makeThisDisabled = false;
    }
    else if(this.permissionsList.includes('View')){
      this.putawayStrategyData.putawayStrategyName = details.putawayStrategyName;
      this.putawayStrategyData._id = details.PSID;
      this.putawayStrategyData.zoneInfo.zoneID = details.zoneID;
      this.putawayStrategyData.zoneInfo.zoneName = details.zoneName;
      this.putawayStrategyData.zoneInfo.sequenceNumber = details.sequenceNumber;
      this.putawayStrategyData.wareHouseInfo = details.wareHouseInfo;
      this.putawayStrategyData.organizationInfo = details.organizationInfo;
      window.scroll(0, 0);
      this.makeReadOnly = true;
      this.makeThisDisabled = true;

    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
    this.deleteInfo = { name: 'putawayStrategy', id: data.PSID, zoneID: data.zoneID };
    this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else{
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllPutawayStrategies();
    }
  }
  getZoneSelected(value) {
    this.zones.forEach((zone) => {
      if (zone.zoneName === value) {
        this.putawayStrategyData.zoneInfo.zoneID = zone._id;
      }
    });
  }
  fetchAllPutawayStrategyByID(id?: any) {
    let _id = '';
    if (!!id) {
      _id = id;
    }
    this.wmsService.fetchAllPutawayStrategyByID(_id, this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.putawayStrategy) {
          this.putawayStrategy = response.data.putawayStrategy;
          this.rerender();
        } else {
          this.putawayStrategy = {};
        }
      },
      (error) => {
        this.putawayStrategy = {};
      });
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.zones) {
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
  fetchAllPutawayStrategies() {
    this.wmsService.fetchAllPutawayStrategies(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.putawayStrategies) {
          this.putawayStrategies = response.data.putawayStrategies;
          this.putawayStrategiesDownloadData = response.data.putawayStrategies;
          this.putawayStrategiesWithZones = this.getFilteredPutawayStrategiesForTable();
          console.log(this.putawayStrategiesWithZones);
          this.rerender();
        } else {
          this.putawayStrategies = [];
        }
      },
      (error) => {
        this.putawayStrategies = [];
      });
  }
  getFilteredPutawayStrategiesForTable() {
    let putawayStrategies = this.putawayStrategies.slice();
    let putawayStrategieswithZones = []
    putawayStrategies.forEach(outer => {
      outer.zoneInfos.forEach(inner => {
        let obj = {};
        obj['putawayStrategyName'] = outer['putawayStrategyName'];
        obj['PSID'] = outer._id;
        obj['zoneID'] = inner.zoneID;
        obj['zoneName'] = inner.zoneName;
        obj['sequenceNumber'] = inner.sequenceNumber;
        obj['organizationInfo'] = outer.organizationInfo;
        obj['wareHouseInfo'] = outer.wareHouseInfo;
        putawayStrategieswithZones.push(obj);
      });
    });
    return putawayStrategieswithZones;

    // let putawayStrategyName, PSID, putawayStrategieswithZones = [];
    // putawayStrategies.forEach((strategy, index) => {
    //   for (let key in strategy) {
    //     if (key == 'putawayStrategyName') {
    //       putawayStrategyName = strategy.putawayStrategyName;
    //     }
    //     if (key == '_id') {
    //       PSID = strategy._id;
    //     }
    //     // if (key == 'organizationInfo') {
    //     //   organizationInfo = strategy.organizationInfo;
    //     // }
    //     // if (key == 'wareHouseInfo') {
    //     //   wareHouseInfo = strategy.wareHouseInfo;
    //     // }
    //     if (key == 'zoneInfos') {
    //       strategy[key].forEach(zone => {
    //         zone.putawayStrategyName = putawayStrategyName;
    //         zone.PSID = PSID;
    //         // zone.organizationInfo = organizationInfo;
    //         // zone.wareHouseInfo = wareHouseInfo;
    //         putawayStrategieswithZones.push(zone);
    //       });
    //     }
    //   }
    // });
    // return putawayStrategieswithZones;
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
  ngAfterViewInit(): void {
    this.dtTrigger.next();
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
    const data = this.excelService.formatJSONForHeaderLines(this.putawayStrategiesDownloadData, 'zoneInfos');
    const changedData = this.exportTypeMethod(data)
    this.excelService.exportAsExcelFile(changedData, 'Putaway Strategy', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['finishedPutawayStrategyName'] = k.finishedPutawayStrategyName
        obj['zoneName'] = k.zoneName
        obj['sequenceNumber'] = k.sequenceNumber
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['finishedPutawayStrategyName'] = null
      obj['zoneName'] =null
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
        console.log(jsonData);
        const data1 = [];
        const logs = [];
        this.missingParams = null;
        let invalidRecord = false;

        const missingParamsArray = this.mandatoryCheckForHeaderLines(jsonData);
        if (missingParamsArray.length > 1) {
          this.failureRecords = missingParamsArray;
          this.missingParams = missingParamsArray.join(', ');
          this.toastr.error('Please download log file to fill mandatory fields');
          this.fetchAllPutawayStrategies();
        }
        else{
          jsonData.forEach((s, index) => {
            console.log(s)
            if (s['finishedPutawayStrategyName']) {
              data1.push(this.getPutawayStrategyHeadersData(s))
            }
            else if (!s['finishedPutawayStrategyName']) {
              if (data1.length > 0) {
                data1[data1.length - 1]['zoneInfos'].push(this.putawayStrategyLinesData(s))
              } else if (invalidRecord) {
                logs[data1.length - 1]['zoneInfos'].push(this.putawayStrategyLinesData(s))
              }
            }
            else {
              if (!s['finishedPutawayStrategyName']) {
                invalidRecord = true;
                logs.push(this.getPutawayStrategyHeadersData(s));
                const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PUTAWAY_STRATEGY;
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
         if(data1.length > 0){
          this.excelRestService.savePutawayStrategyBulkdata(data1).subscribe(res => {
            if (res && res.status === 0 && res.data.putawayStrategyList && res.data.putawayStrategyList.failureList
              && res.data.putawayStrategyList.failureList.length > 0 && res.data.sucessExcelList &&
              res.data.sucessExcelList.length > 0) {
              this.failureRecords = res.data.putawayStrategyList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.putawayStrategyList.duplicateList);
              console.log(this.failureRecords);
              this.toastr.error('Partially failed in uploading, Please download log for reasons');
              this.fetchAllPutawayStrategies();

            } else if (res && res.status === 0 && res.data.putawayStrategyList && res.data.putawayStrategyList.failureList && res.data.putawayStrategyList.failureList.length > 0) {
              this.failureRecords = res.data.putawayStrategyList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.putawayStrategyList.duplicateList);
              console.log(this.failureRecords);
              this.toastr.error('Failed in uploading, Please download log for reasons');
              this.fetchAllPutawayStrategies();
            } else if (res && res.status === 0 && res.data.putawayStrategyList && res.data.putawayStrategyList.failureList && res.data.putawayStrategyList.failureList.length === 0) {
              if (res && res.status === 0 && res.data.putawayStrategyList && res.data.putawayStrategyList.duplicateList && res.data.putawayStrategyList.duplicateList.length > 0) {
                this.failureRecords = res.data.putawayStrategyList.duplicateList;
                this.toastr.error('Duplicates present in the excel, Please download log file.');
                this.fetchAllPutawayStrategies();
              } else {
                this.fetchAllPutawayStrategies();
                this.toastr.success('Uploaded successfully');
                this.failureRecords = [];
              }
            } else {
              this.toastr.error('Faild in uploading');
              this.failureRecords = [];
              this.fetchAllPutawayStrategies();
            }
          }, error => { })
         }
        }
      }, 500)
    }
  }
  getPutawayStrategyHeadersData(s) {
    return {
      'putawayStrategyName': s['finishedPutawayStrategyName'],
      "zoneInfos": [this.putawayStrategyLinesData(s)]
    }
  }
  putawayStrategyLinesData(document?) {
    if (document) {
      return {
        "zoneID": this.mapId("zoneName", document.zoneName),
        "zoneName": document.zoneName,
        "sequenceNumber": document.sequenceNumber,
      }
    }
  }

  mapId(type, value, rackName?) {
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
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PUTAWAY_STRATEGY;
      const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
      if (missingParams.length > 0) {
        missingParamsArray.push(`Row No. ${1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
      }
    }
    return missingParamsArray;
  }
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Putaway Strategy Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }

}

/* All uploads files or functionality is shifted to down  */
/*   uploadExcel = async (event) => {
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
            const { finishedPutawayStrategyName, ...filteredrecord} = record;
            const {zoneName , sequenceNumber, ...filteredLine} = JSON.parse(JSON.stringify(filteredrecord));
            if (record['finishedPutawayStrategyName'] && record['zoneName']) {
              endArray.push({
                putawayStrategyName: finishedPutawayStrategyName,
                  zoneInfos: [
                    {...filteredLine,
                      zoneID: this.mapzoneMasterID(zoneName),
                      zoneName,
                      sequenceNumber,
                    }
                  ]
              });
            } else {
              if (endArray.length > 0) {
                endArray[endArray.length - 1].zoneInfos.push({...filteredLine,
                  zoneID: this.mapzoneMasterID(zoneName),
                  zoneName,
                  sequenceNumber,
                });
              }
            }
          });
          if (endArray && endArray.length > 0) {
            this.excelRestService.savePutawayStrategyBulkdata(endArray).subscribe(res => {
              if (res && res.status === 0 && res.data.putawayStrategyList && res.data.putawayStrategyList.failureList &&
                res.data.putawayStrategyList.failureList.length > 0 && res.data.putawayStrategyList.successList &&
                res.data.putawayStrategyList.successList.length > 0) {
                this.failureRecords = res.data.putawayStrategyList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.putawayStrategyList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.putawayStrategyList && res.data.putawayStrategyList.failureList && res.data.putawayStrategyList.failureList.length > 0) {
                this.failureRecords = res.data.putawayStrategyList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.putawayStrategyList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
                this.fetchAllPutawayStrategies();
              } else if (res && res.status === 0 && res.data.putawayStrategyList && res.data.putawayStrategyList.failureList && res.data.putawayStrategyList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.putawayStrategyList && res.data.putawayStrategyList.duplicateList && res.data.putawayStrategyList.duplicateList.length > 0) {
                  this.failureRecords = res.data.putawayStrategyList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllPutawayStrategies();
                } else {
                  this.fetchAllPutawayStrategies();
                  this.toastr.success('Uploaded successfully');
                  this.fetchAllPutawayStrategies();
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
  mapzoneMasterID(zoneID) {
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
        if (record['finishedPutawayStrategyName'] && record['zoneName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PUTAWAY_STRATEGY_HEADER
          .concat(Constants.UPLOAD_MANDAT_FIELDS.PUTAWAY_STRATEGY_HEADER);
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        } else {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PUTAWAY_STRATEGY_LINE;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArray;
  } */
