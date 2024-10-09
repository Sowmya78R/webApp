import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { LevelMasterDataEntity } from '../../../entities/LevelMasterData.entity';
import { ApexService } from '../../../shared/services/apex.service';
import { InboundMasterDataService } from '../../../services/integration-services/inboundMasterData.service';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Constants } from '../../../constants/constants';
import { DataTableDirective } from 'angular-datatables';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-level-master',
  templateUrl: './level-master.component.html'
})
export class LevelMasterComponent implements OnInit, OnDestroy {
  @ViewChild('levelForm') levelForm: NgForm

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};

  levels: any[] = [];
  levelDetails: any;
  racks: any[] = [];
  storageTypes: any = [];
  focusedElement: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  statuss: any = ['Active', 'In Active'];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  isReadMode: any = false;

  rackNameValues: CompleterData;
  storageTypeValues: CompleterData;
  missingParams: any;
  isShowOrHideError: any = false;
  failureRecords: any = [];
  columns: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Level', Storage.getSessionUser());
  columnsListData: any = [];
  columnsShowValues: any;
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private apexService: ApexService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService,
    private excelService: ExcelService,
    private completerService: CompleterService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private excelRestService: ExcelRestService,
    private configService: ConfigurationService
    , private metaDataService: MetaDataService,
    private translate:TranslateService,
    ) {
      this.translate.use(this.language);

     }

  ngOnInit() {
    this.levelDetails = new LevelMasterDataEntity();
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
    /*   this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
        if (data) {
          this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Level', Storage.getSessionUser());
          this.formObj = this.configService.getGlobalpayload();
          this.getFunctionsCall();
        }
      }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
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
      this.fetchAllLevels();
      this.fetchAllRacks();
      this.fetchAllStorageTypes();
      this.apexService.getPanelIconsToggle();
      this.fetchAllColumns();
      this.fetchAllZones();
    }
  }

  openModalColumns(form) {
    this.ngxSmartModalService.getModal('recieveLocationsModal').open();
  }

  fetchAllColumns() {
   
    this.wmsService.fetchAllColumns(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.columns.length) {
          this.columns = response.data.columns;
          this.dropdownList = response.data.columns.map(x => x.columnName);
          this.columnsListData = response.data.columns;
          this.columnsListData.forEach(element => {
            element['isChecked'] = false;
            element['isEdit'] = false;
            element['xcoordinate'] = null;
            element['ycoordinate'] = null;
          });
        }
      },
      error => {
        this.columns = [];
      }
    )
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next()

  }
  zoneNameValues: CompleterData
  zoneList: any;




  fetchAllLevels() {
    this.wmsService.fetchAllLevels(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.levels) {
          this.levels = response.data.levels;
          console.log(this.levels);
          this.levels.forEach(level => {
            level.columnsList = '';
            if (level.columnHelpers != null) {
              level.columnHelpers.forEach((col, index) => {
                if (col != null) {
                  if (index === level.columnHelpers.length - 1) level.columnsList += col.columnName;
                  else level.columnsList += col.columnName + ', ';
                }
              });
            }
          });
          this.rerender();
        } else {
          this.levels = [];
        }
      },
      (error) => {
        this.levels = [];
      });

    //  this.dtTrigger.next();
  }
  onDocumentSelect1(event, form) {
    form.isChecked = false;
    if (event && form.xcoordinate && form.ycoordinate) {
    }
    else {
      if (event) {
        delete form.isChecked;
        this.toastr.error('Enter Coordinates')
      }
      else {
        form.isEdit = false;
        form['xcoordinate'] = '';
        form['ycoordinate'] = '';
      }
    }
  }
  savequantity(value, data, key) {
    data[key] = value;
    if (data.xcoordinate && data.ycoordinate) {
      data['isChecked'] = true;
    }
    else {
      data['isChecked'] = false;
    }
  }
  saveColumnsToRack() {
    let filteredRecieveLocations = [];
    filteredRecieveLocations = this.columnsListData.filter(x => x.isChecked == true);
    const framedColumns = []
    if (filteredRecieveLocations.length > 0) {
      this.columnsShowValues = filteredRecieveLocations.map(x => x.columnName).toString();
      filteredRecieveLocations.forEach(el => {
        framedColumns.push({
          "columnMasterID": el._id,
          "columnName": el.columnName,
          "xcoordinate": el.xcoordinate,
          "ycoordinate": el.ycoordinate
        })
      });
    }
    this.levelDetails.columnHelpers = framedColumns;
    this.toastr.success('columns added.')
    this.ngxSmartModalService.getModal('recieveLocationsModal').close();
  }
  resetColumns() {
    this.columnsListData.forEach(x => {
      x['isEdit'] = false;
      x['isChecked'] = false;
      x['xcoordinate'] = null;
      x['ycoordinate'] = null;
    });
    this.columnsShowValues = null;
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
  clearLevelData(levelForm: NgForm) {
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
   this.isReadMode = false
    this.levelDetails = {
      rackInfo: {},
      storageType: {}
    };
    // levelForm.form.reset();
    this.levelDetails = new LevelMasterDataEntity();
    this.dropdownList = [];
    this.columnsShowValues = null;
    this.columnsListData.forEach(x => {
      x['isChecked'] = false;
      x['xcoordinate'] = null;
      x['ycoordinate'] = null;
    });
  }
  save(levelForm: NgForm) {
    
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {

      const req = JSON.parse(JSON.stringify(this.levelDetails));
      delete req.columnsList;
      req['columnHelpers'] = [];
      console.log(req);
      if (req.columns && req.columns.length > 0) {
        req.columns.forEach(element => {
          let columnHelper = {
            "columnMasterID": null,
            "columnName": null,
            "xcoordinate": null,
            "ycoordinate": null,
          }
          let columnMatchedObj = this.mapId('column', element);
          if (columnMatchedObj) {
            columnHelper.columnMasterID = columnMatchedObj._id
            columnHelper.columnName = columnMatchedObj.columnName
            columnHelper.xcoordinate = columnMatchedObj.xcoordinate
            columnHelper.ycoordinate = columnMatchedObj.xcoordinate
          }
          else {
            columnHelper = null;
          }
          if (columnHelper) {
            req['columnHelpers'].push(columnHelper)
          }
        });
      }
      delete req.columns;
      req['organizationInfo'] = this.configService.getOrganization();
      req['wareHouseInfo'] = this.configService.getWarehouse();
      this.wmsService.saveOrUpdateLevelDetails(JSON.stringify(req)).subscribe(
        (response) => {
          console.log(req);
          console.log(response);
          delete req.zoneInfo.sequenceNumber;
          delete req.zoneInfo.isActive;
          if (response && response.status === 0) {
            this.levelDetails = {
              rackInfo: {},
              zoneInfo: {},
              storageType: {}
            };
            this.rerender();
            this.columnsShowValues = null;
            this.columnsListData.forEach(x => {
              x['isChecked'] = false;
              x['xcoordinate'] = null;
              x['ycoordinate'] = null;
            });
            this.fetchAllLevels();

            levelForm.form.reset();
            this.dropdownList = [];
         
            this.toastr.success(response.statusMsg);
           
            this.levelForm.controls.status.setValue("Active")
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
            this.makeThisDisabled = false;
          } else {
            this.toastr.error('Failed in updating level details.');
          }
        },
        (error) => {
          this.toastr.error('Failed in updating level details.');
        }
      );
      this.levelDetails = new LevelMasterDataEntity();
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
    this.makeThisDisabled = false;
    this.isReadMode = false
    this.makeReadOnly = false
    this.globalIDs = null
    this.fetchAllColumns();
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  editLevelDetails(details) {
    this.globalIDs = details._id;
    console.log(this.permissionsList);
    this.fetchAllColumns
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      if (!details.storageType) {
        details.storageType = {}
      }
      this.getSelectedValue('rack', { originalObject: details.rackInfo.rackName });
      if (details.columnHelpers && details.columnHelpers.length > 0) {
        details['columns'] = details.columnHelpers.map(x => x.columnName);
      }
      this.levelDetails = Object.assign({}, details);
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
      this.isReadMode = true
      window.scroll(0, 0);
    }
    else if (this.permissionsList.includes('View')) {
      {
        if (!details.storageType) {
          details.storageType = {}
        }
        this.getSelectedValue('rack', { originalObject: details.rackInfo.rackName });
        if (details.columnHelpers && details.columnHelpers.length > 0) {
          details['columns'] = details.columnHelpers.map(x => x.columnName);
        }
        this.levelDetails = Object.assign({}, details);
        this.makeReadOnly = true;
        this.makeThisDisabled = true;
        window.scroll(0, 0);
        this.fetchAllColumns();
      }
     
    }
    else {
    }
  }


  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'level', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }

  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllLevels();
    }
  }
  getSelectedValue(type, value) {
    if (value) {
      switch (type) {
        case 'zone': {
          this.zoneList.forEach(zone => {
            if (zone.zoneName === value.originalObject) {
              this.levelDetails.zoneInfo.zoneID = zone._id;
              const racks = this.racks.filter(x => x.zoneInfo.zoneName == value.originalObject);
              console.log(racks)
              this.rackNameValues = this.completerService.local(
                this.commonService.getFiltValuesFromArrayOfObjs(racks, 'rackName'));
              // this.dropdownList = zone.columnHelpers.map(x => x.columnName);
            }
          });
          break;
        }
        case 'rack': {
          this.racks.forEach(rack => {
            if (rack.rackName === value.originalObject && rack.zoneInfo.zoneName == this.levelDetails.zoneInfo.zoneName) {
              this.levelDetails.rackInfo.rackID = rack._id;
              this.dropdownList = rack.columnHelpers.map(x => x.columnName);
            }
          });
          break;
        }
        case 'storageType': {
          this.storageTypes.forEach(storageType => {
            if (storageType.storageTypeCode === value.originalObject) {
              this.levelDetails.storageType._id = storageType._id;
              this.levelDetails.storageType.storageTypeCode = storageType.storageTypeCode;
              this.levelDetails.storageType.storageTypeDescription = storageType.storageTypeDescription;
            }
          });
          break;
        }
        default:
          break;
      }
    }
  }
  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.racks = response.data.racks;
        } else {
          this.racks = [];
        }
      },
      (error) => {
        this.racks = [];
      });
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          if (response.data.zones.length > 0) {
            this.zoneList = response.data.zones;
            this.zoneNameValues = this.completerService.local(
              this.commonService.getFiltValuesFromArrayOfObjs(response.data.zones, 'zoneName'));
            //  this.zoneNameValues = response.data.zones.map(zonename =>zonename.zoneName)

          }
        }
      })
  }
  fetchAllStorageTypes() {
    this.metaDataService.fetchAllStorageTypes(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          if (response.data.storageTypes.length > 0) {
            this.storageTypes = response.data.storageTypes;
            this.storageTypeValues = this.completerService.local(
              this.commonService.getFiltValuesFromArrayOfObjs(response.data.storageTypes, 'storageTypeCode'));
          } else {
            this.storageTypes = [];
          }
        } else {
          this.storageTypes = [];
        }
      },
      (error) => {
        this.storageTypes = [];
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
  shouldShowErrors(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.invalid && fieldName.to
    }
  }
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.valid && fieldName.touched;
    }
  }
  /*  exportAsXLSX() {
     if (this.levels && this.levels.length > 0) {
       this.excelService.exportAsExcelFile(this.levels, 'Levels-Data', Constants.EXCEL_IGNORE_FIELDS.LEVELS);
     } else {this.toastr.error('No data found');}} */
  /*   exportAsXLSX() {
        this.excelService.exportAsExcelFile(this.levels, 'Levels-Data', Constants.EXCEL_IGNORE_FIELDS.LEVELS);
    } */


  getFile() {
    document.getElementById('upfile').click();
  }
  mapId(type, value) {
    switch (type) {
      case 'rackName': {
        const rack = this.racks.find(w => w.rackName === value.rackInfo.rackName && w.zoneInfo.zoneName === value.zoneName);
        return rack && rack._id ? rack._id : null;
      }
      case 'column': {
        const el = this.columns.find(w => w.columnName === value);
        console.log(el)
        return el
      }
      case 'zone': {
        const el = this.zoneList.find(w => w.zoneName === value);
        return {
          "zoneID": el ? el._id : null,
          "zoneName": value,
          "sequenceNumber": el ? el.sequenceNumber : null,
          "isActive": el ? el.isActive : null
        }

      }
      case 'storageType': {
        const formDetails = this.storageTypes.find(x => x.storageTypeCode == value);
        if (formDetails) {
          return formDetails;
        }
        else {
          return {
            organizationInfo: null,
            storageTypeCode: value,
            storageTypeDescription: null,
            wareHouseInfo: null,
            _id: null,
          }
        }
      }
    }
  }

  exportAsXLSX() {
      const changedTaskList = this.exportTypeMethod(this.levels)
      this.excelService.exportAsExcelFile(changedTaskList, 'levels', Constants.EXCEL_IGNORE_FIELDS.LEVELS);
  }
  exportTypeMethod(data) {
    const arr = [];
    console.log(data)
    if(data && data.length > 0){
    data.forEach(ele => {
      const obj = {}
      obj['levelName'] = ele.levelName
      obj['zoneName'] = ele.zoneInfo.zoneName
      obj['rackName'] = ele.rackInfo.rackName
      let columnNamesArray = [];
      let columnNames = null;
      if (ele.columnHelpers && ele.columnHelpers.length > 0 && ele.columnHelpers != null && ele.columnHelpers != undefined) {
        ele.columnHelpers.forEach((columnHelper, index) => {
          columnNamesArray.push(columnHelper.columnName)
        })
      }
      if (columnNamesArray.length > 0) {
        columnNames = columnNamesArray.join(",")
        obj['columnHelpers'] = columnNames;
        // arr.push(obj);
      }
      else {
        obj['columnsList'] = null
      }
      if (!ele.storageType) {
        obj['storageTypeCode'] = null
      }
      else {
        obj['storageTypeCode'] = ele.storageType.storageTypeCode
      }
      obj['capacity'] = ele.capacity
      obj['height'] = ele.height
      obj['width'] = ele.width
      arr.push(obj)
    })
  } else {
   let  obj = {}
    obj['levelName'] = null
    obj['zoneName'] =null
    obj['rackName'] =null
    obj['columnHelpers'] = null
    obj['storageTypeCode'] = null
    obj['capacity'] = null
    obj['height'] = null
    obj['width'] = null
    arr.push(obj)
  }
    return arr
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.LEVEL;
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
            const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.LEVEL);
            reqData.forEach(r => {
              if (r.rackInfo != null && r.rackInfo.rackName != null) {
                r['rackInfo']['rackID'] = this.mapId('rackName', r);
              }
              r['zoneInfo'] = this.mapId('zone', r.zoneName);
              if (!r.storageType) {
                r['storageType'] = null;
              }
              else if (r.storageType) {
                r.storageType = this.mapId('storageType', r.storageTypeCode);
                delete r.storageTypeCode;
              }
              if (r.columnHelpers) {
                r['columnHelpers'] = this.genColumnsStruct(r.columnHelpers);
                r.columnHelpers.forEach(deleteOrgWarehouse => {
                  delete deleteOrgWarehouse.organizationInfo
                  delete deleteOrgWarehouse.wareHouseInfo
                })
              } else {
                r['columnHelpers'] = null
              }
              // delete r.columnHelpers;
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r.capacity = r.capacity ? r.capacity.toString() : null
            });
            this.excelRestService.saveLevelBulkdata(reqData).subscribe(res => {
              if (res && res.status === 0 && res.data.levelList && res.data.levelList.failureList &&
                res.data.levelList.failureList.length > 0 && res.data.levelList.successList &&
                res.data.levelList.successList.length > 0) {
                this.failureRecords = res.data.levelList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.levelList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllLevels();
                this.rerender();
                this.dtTrigger.next();
              } else if (res && res.status === 0 && res.data.levelList && res.data.levelList.failureList && res.data.levelList.failureList.length > 0) {
                this.failureRecords = res.data.levelList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.levelList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.levelList && res.data.levelList.failureList && res.data.levelList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.levelList && res.data.levelList.duplicateList && res.data.levelList.duplicateList.length > 0) {
                  this.failureRecords = res.data.levelList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllLevels();
                  // this.dtTrigger.next();
                  // this.rerender();
                } else {
                  this.rerender();
                  this.toastr.success('Uploaded successfully');
                  this.fetchAllLevels();
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
  genColumnsStruct(columns) {
    if (columns) {
      const toArr = columns.replace(/\, /gi, ',').split(',');
      const genColumns = [];
      toArr.forEach(col => {
        let columnObj = {
          "columnName": col
        }
        const filColumn = this.columns.find(c => c.columnName == col);
        if (filColumn) {
          genColumns.push(filColumn);
        }
        else {
          columnObj.columnName = col
          genColumns.push(columnObj)
        }
      })
      return genColumns;
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['rackName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.LEVEL;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(',').replace('', ',')} \n`);
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
      let logText = "";
      for (let i = 0; i < this.failureRecords.length; i++) {
        logText = logText + `\n` + this.failureRecords[i];
      }
      console.log(logText)
      this.dyanmicDownloadByHtmlTag({
        fileName: "Level Error Reasons",
        text: logText.replace(/<br\s*\/?>/gi, ' ')
      });
    }
  }
}
