import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { RackMasterDataEntity } from '../../../entities/RackMasterData.entity';
import { ApexService } from '../../../shared/services/apex.service';
import { NgForm } from '@angular/forms';
import { Constants } from '../../../constants/constants';
import { DataTableDirective } from 'angular-datatables';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { AppService } from 'src/app/shared/services/app.service';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-rack-master',
  templateUrl: './rack-master.component.html'
})
export class RackMasterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('rackForm') rackForm: NgForm
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};

  racks = [];
  rackDetails: any;
  zones: any[] = [];
  storageTypes: any = [];
  focusedElement: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: Subject<any> = new Subject();


  statuss: any = ['Active', 'In Active'];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  zoneNameValues: CompleterData;
  storageTypeValues: CompleterData;
  isReadMode: any = false;
  missingParams: any;
  isShowOrHideError: any = false;
  failureRecords: any = [];
  columns: any;
  showArray: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Rack', Storage.getSessionUser());
  columnsListData: any = [];
  columnsShowValues: any;
  columnNamesArray: any = [];
  columnNames: any;
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private apexService: ApexService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService,
    private excelService: ExcelService,
    private completerService: CompleterService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private excelRestService: ExcelRestService,
    private metaDataService: MetaDataService,
    private appService: AppService,
    private translate:TranslateService,
    ) {
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
    this.getFunctionsCall();
    if (this.permissionsList.includes('Delete')) {
      const input = document.getElementById('deleteIcon') as HTMLInputElement | null;
    }
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
      this.rackDetails = new RackMasterDataEntity();
      this.fetchAllZones();
      this.fetchAllRacks();
      this.fetchAllStorageTypes();
      this.apexService.getPanelIconsToggle();
      this.fetchAllColumns();
    }

  }
  openModalColumns(form) {
    this.ngxSmartModalService.getModal('recieveLocationsModal').open();
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
    this.rackDetails.columnHelpers = framedColumns;
    this.toastr.success('columns added.')
    this.ngxSmartModalService.getModal('recieveLocationsModal').close();
       this.columnsListData.map(element => element.isEdit = false);
  }
  resetColumns() {
    this.columnsListData.forEach(x => {
      x['isChecked'] = false;
      x['xcoordinate'] = null;
      x['ycoordinate'] = null;
      x['isEdit'] = false;
    });
    this.columnsShowValues = null;
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones.length > 0) {
          this.zones = response.data.zones;
          this.zoneNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.zones, 'zoneName'));
        } else {
          this.zones = [];
        }
      },
      (error) => {
        this.zones = [];
      });
  }

  clearRackData(rackForm: NgForm) {
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.isReadMode = false;
    // this.setActiveStatus();
    this.rackDetails = {
      zoneInfo: {},
      storageType: {}
    };
    this.rackDetails = new RackMasterDataEntity();
    this.columnsShowValues = null;
    this.columnsListData.forEach(x => {
      x['isChecked'] = false;
      x['xcoordinate'] = null;
      x['ycoordinate'] = null;
    });
  }
  /*  setActiveStatus() {
     this.rackForm.form.setValue({
       rackDetails: {
         status: 'Active'
       }
     })
   } */
  save(rackForm: NgForm) {

   if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const req = JSON.parse(JSON.stringify(this.rackDetails));
      delete req.columnsList;
      req['organizationInfo'] = this.configService.getOrganization();
      req['wareHouseInfo'] = this.configService.getWarehouse();
      this.wmsService.saveOrUpdateRackDetails(JSON.stringify(req)).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.rackDetails = {
              zoneInfo: {},
              storageType: {}
            };
            this.columnsShowValues = null;
            this.columnsListData.forEach(x => {
              x['isChecked'] = false;
              x['xcoordinate'] = null;
              x['ycoordinate'] = null;
            });
            this.fetchAllRacks();
            this.toastr.success(response.statusMsg);
            rackForm.form.reset();
            rackForm.controls.status.setValue("Active")
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error('Already exist');
          } else {
            this.toastr.error('Failed in updating rack details.');
          }
        },
        (error) => {
          this.toastr.error('Failed in updating rack details.');
        })
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null;
    this.makeReadOnly = false;
    this.isReadMode = false;
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  editRackDetails(details) {
    this.globalIDs = details._id
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.columnsListData.forEach(x => {
        x['isChecked'] = false;
        x['xcoordinate'] = null;
        x['ycoordinate'] = null;
      });
      if (!details.storageType) {
        details.storageType = {}
      }
      this.rackDetails = Object.assign({}, details);

      if (details.columnHelpers.length > 0) {
        this.columnsShowValues = details.columnHelpers.map(x => x.columnName).toString();
        details.columnHelpers.forEach(element => {
          this.columnsListData.forEach(col => {
            if (col.columnName == element.columnName) {
              col['xcoordinate'] = element.xcoordinate;
              col['ycoordinate'] = element.ycoordinate;
              col['isChecked'] = true;
            }
          });
        });
      }
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
      this.isReadMode = true
    }
    else if (this.permissionsList.includes('View')) {
      this.columnsListData.forEach(x => {
        x['isChecked'] = false;
        x['xcoordinate'] = null;
        x['ycoordinate'] = null;
      });
      this.makeReadOnly = true;
      this.makeThisDisabled = true;
      if (!details.storageType) {
        details.storageType = {}
      }
      this.rackDetails = Object.assign({}, details);
      if (details.columnHelpers.length > 0) {
        this.columnsShowValues = details.columnHelpers.map(x => x.columnName).toString();
        details.columnHelpers.forEach(element => {
          this.columnsListData.forEach(col => {
            if (col.columnName == element.columnName) {
              col['xcoordinate'] = element.xcoordinate;
              col['ycoordinate'] = element.ycoordinate;
              col['isChecked'] = true;
            }
          });
        });
      }

    }
    else {

    }
    window.scroll(0, 0);

  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'rack', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllRacks();
    }
  }
  getSelectedValue(type, value) {
    switch (type) {

      case 'zone': {
        this.zones.forEach(zone => {
          if (zone.zoneName === value.originalObject) {
            this.rackDetails.zoneInfo.zoneID = zone._id;
          }
        });
        break;
      }
      case 'storageType': {
        this.storageTypes.forEach(storageType => {
          if (storageType.storageTypeCode === value.originalObject) {
            this.rackDetails.storageType._id = storageType._id;
            this.rackDetails.storageType.storageTypeCode = storageType.storageTypeCode;
            this.rackDetails.storageType.storageTypeDescription = storageType.storageTypeDescription;
          }
        });
        break;
      }
      default:
        break;
    }
  }

  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.racks) {
          this.racks = response.data.racks;
          console.log(this.racks)
          this.racks.forEach(rack => {
            rack.columnsList = '';
            /*
            if (rack.columnHelpers) {

              rack.columnHelpers.forEach((col, index) => {
                if (index === rack.columnHelpers.length - 1) rack.columnHelpers.columnName += col.columnName;
                 else rack.columnHelpers += col.columnName + ', ';
              });
            }
            */
          });
          console.log(this.racks)
          this.rerender();
        } else {
          this.racks = [];
          this.toastr.error('No racks found');
        }
      },
      (error) => {
        this.racks = [];
      });
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
  /*
  exportAsXLSX() {
    if (this.racks) {
      console.log(this.racks);
      this.excelService.exportAsExcelFile(this.racks, 'Racks', Constants.EXCEL_IGNORE_FIELDS.RACKS);
    } else {
      this.toastr.error('No data available');
    }
  } */


  exportAsXLSX() {
    const changedTaskList = this.exportTypeMethod(this.racks)
    this.excelService.exportAsExcelFile(changedTaskList, 'racks', null)
  }
  /*  exportTypeMethod(data) {
     const arr = [];
     const obj = {}
     data.forEach(ele => {
       if (ele.columns && ele.columns.length > 0 && ele.columns != null && ele.columns != undefined) {
         ele.columns.forEach((vehele, index) => {
              if (index === 0) {
               obj['rackName'] = ele.rackName
               obj['zoneName'] = ele.zoneName
               obj['mode'] = ele.mode
               obj['columns'] = vehele.columns
              // obj['storageTypeCode'] = ele.storageType.storageTypeCode
               obj['capacity'] = ele.capacity
               obj['height'] = ele.height
               obj['width'] = ele.width
               obj['sequenceNumber'] = ele.sequenceNumber
               arr.push(obj)
             } else {
               obj['rackName'] = null
               obj['mode'] = null
               obj['zoneName'] = null
               obj['storageTypeCode'] = null
               obj['capacity'] = null
               obj['height'] = null
               obj['width'] = null
               obj['sequenceNumber'] = null
               obj['columns'] = vehele.columns
               arr.push(obj)
             }

         })
       }
       else {
         const obj = {}
         obj['rackName'] = ele.rackName
         obj['zoneName'] = ele.zoneName
         obj['mode'] = ele.mode
         obj['columns'] = null
         obj['storageTypeCode'] = ele.storageType.storageTypeCode
         obj['capacity'] = ele.capacity
         obj['height'] = ele.height
         obj['width'] = ele.width
         obj['sequenceNumber'] = ele.sequenceNumber
         arr.push(obj)
       }
     })
     return arr
   } */
  /*  exportTypeMethod(data) {
     const arr = [];
     data.forEach(ele => {
       const obj = {}
       obj['rackName'] = ele.rackName
       obj['zoneName'] = ele.zoneInfo.zoneName
       obj['mode'] = ele.mode
       obj['columnList'] = ele.columnsList
       obj['storageTypeCode'] = ele.storageType.storageTypeCode
       obj['capacity'] = ele.capacity
       obj['height'] = ele.height
       obj['width'] = ele.width
       obj['sequenceNumber'] = ele.sequenceNumber

       arr.push(obj)
     })
     return arr
   } */
  exportTypeMethod(data) {
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        const obj = {}
        this.columnNamesArray = [];
        const xCoordinates = [];
        const yCoordinates = [];
        console.log(ele.columnHelpers)
        if (ele.columnHelpers) {
          ele.columnHelpers.forEach(k => {
            this.columnNamesArray.push(k.columnName)
            xCoordinates.push(k.xcoordinate);
            yCoordinates.push(k.ycoordinate);
          })
        }
        this.columnNames = this.columnNamesArray.join(",")
        obj['rackName'] = ele.rackName
        obj['zoneName'] = ele.zoneInfo.zoneName
        obj['mode'] = ele.mode
        obj['columnHelpers'] = this.columnNames;
        obj['columnXcoordinates'] = xCoordinates.join(",");
        obj['columnYcoordinates'] = yCoordinates.join(",");
        if (!ele.storageType) {
          obj['storageTypeCode'] = null
        }
        else {
          obj['storageTypeCode'] = ele.storageType.storageTypeCode
        }
        if(ele.capacity){
          obj['capacity'] = DecimalUtils.fixedDecimal(Number(ele.capacity),2)
         }
         else{
          obj['capacity'] = null
         }

         if(ele.height){
          obj['height'] = DecimalUtils.fixedDecimal(Number(ele.height),2)
         }
         else{
          obj['height'] = null
         }


         if(ele.width){
          obj['width'] = DecimalUtils.fixedDecimal(Number(ele.width),2)
         }
         else{
          obj['width'] = null
         }


         if(ele.xcoordinate){
          obj['xcoordinate'] = DecimalUtils.fixedDecimal(Number(ele.xcoordinate),2)
         }
         else{
          obj['xcoordinate'] = null
         }
         if(ele.ycoordinate){
          obj['ycoordinate'] = DecimalUtils.fixedDecimal(Number(ele.ycoordinate),2)
         }
         else{
          obj['ycoordinate'] = null
         }

        arr.push(obj)
      })
    } else {
      let obj = {}
      obj['rackName'] = null
      obj['zoneName'] = null
      obj['mode'] = null
      obj['columnHelpers'] = null;
      obj['columnXcoordinates'] = null
      obj['columnYcoordinates'] = null
      obj['storageTypeCode'] = null
      obj['capacity'] = null
      obj['height'] = null
      obj['width'] = null
      obj['xcoordinate'] = null
      obj['ycoordinate'] = null
      arr.push(obj)
    }
    return arr
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
    // this.forPermissionsSubscription.unsubscribe();
  }

  fetchAllColumns() {
    this.wmsService.fetchAllColumns(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.columns.length) {
          this.columns = response.data.columns;
          this.dropdownList = response.data.columns;
          this.columnsListData = response.data.columns;
          this.rerender();
          this.dtTrigger2.next();
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
  // onDocumentSelect1(event, form) {
  //   form.isChecked = false;
  //   if (event && form.xcoordinate && form.ycoordinate) {
  //   }
  //   else {
  //     if (event) {
  //       delete form.isChecked;
  //       this.toastr.error('Enter Coordinates')
  //     }
  //     else {
  //       form.isEdit = false;
  //       form['xcoordinate'] = '';
  //       form['ycoordinate'] = '';
  //     }
  //   }
  // }
  read(event, data1) {
    this.columnsListData.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.columnsListData.find(x => x.isEdit == true);
      if (currentItem && (currentItem.xcoordinate == null || currentItem.ycoordinate == null)) {
        this.toastr.warning('Please enter Coordinates');
      }
      this.columnsListData.map(element => element.isEdit = false);
      data1.isEdit = true;
      if (currentItem && currentItem.xcoordinate && currentItem.ycoordinate) {
        if (event.target.checked && data1.xcoordinate) {
          data1.isChecked = event.target.value;
        }
        else if (event.target.checked && (!data1.xcoordinate || !data1.ycoordinate)) {
          data1.isChecked = event.target.value;
          data1.isEdit = true;
        }
        else {
          data1.isChecked = false;
          data1.isEdit = false;
          data1['xcoordinate'] = '';
          data1['ycoordinate'] = '';
        }
      }
    }
    else {
      data1.isChecked = false;
      data1.isEdit = false;
      data1.xcoordinate = null;
      data1['ycoordinate'] = '';
      this.columnsShowValues = null
    }
    this.columnsListData.forEach(element => {
      if (element.xcoordinate && element.ycoordinate) {
        element.isChecked = true;
      }
    });
  }
  savequantity(value, data, key) {
    data[key] = value;
    if (data.xcoordinate && data.ycoordinate) {
      data['isChecked'] = true;
    }
    else {
      if (key == 'ycoordinate') {
        data['isChecked'] = false;
      }
    }
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  mapId(type, value) {
    switch (type) {
      case 'zoneName': {
        const zone = this.zones.find(w => w.zoneName === value);
        if (zone) {
          return zone._id;
        } else {
          return null;
        }
      }
      case 'columnName': {
        const colum = this.columns.find(x => x.columnName === value);
        if (colum) {
          return colum._id;
        } else {
          return null;
        }
      }

    }
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.RACK;
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
              if (r.zoneInfo != null && r.zoneInfo.zoneName != null) {
                r['zoneInfo']['zoneID'] = this.mapId('zoneName', r.zoneInfo.zoneName);
              }
              r['columnHelpers'] = this.genColumnsStruct(r);
              if (r.columnHelpers != null && r.columnHelpers != undefined) {
                r.columnHelpers.forEach(deleteOrgWarehouse => {
                  delete deleteOrgWarehouse.organizationInfo
                  delete deleteOrgWarehouse.wareHouseInfo
                })
              }
              else{
                r['columnHelpers'] = []

              }
              // delete r.columnHelpers;
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r.capacity = r.capacity ? r.capacity.toString() : null
              r.height=r.height? r.height.toString():null
              r.width = r.width? r.width.toString():null
              r.xcoordinate= r.xcoordinate ?r.xcoordinate.toString():null
              r.ycoordinate =r.ycoordinate ?r.ycoordinate.toString():null
            });
            this.excelRestService.saveRackBulkdata(reqData).subscribe(res => {
              if (res && res.status === 0 && res.data.RackList && res.data.RackList.failureList &&
                res.data.RackList.failureList.length > 0 && res.data.RackList.successList &&
                res.data.RackList.successList.length > 0) {
                this.failureRecords = res.data.RackList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.RackList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllRacks();
              } else if (res && res.status === 0 && res.data.RackList && res.data.RackList.failureList && res.data.RackList.failureList.length > 0) {
                this.failureRecords = res.data.RackList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.RackList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.RackList && res.data.RackList.failureList && res.data.RackList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.RackList && res.data.RackList.duplicateList && res.data.RackList.duplicateList.length > 0) {
                  this.failureRecords = res.data.RackList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllRacks();
                } else {
                  this.fetchAllRacks();
                  this.rerender();
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
  genColumnsStruct(columns) {
    console.log(columns)
    if (columns.columnHelpers) {
      const toArr = columns.columnHelpers.replace(/\, /gi, ',').split(',');
      const toXaxis = columns.columnXcoordinates ? ((typeof (columns.columnXcoordinates) == 'number') ? columns.columnXcoordinates : columns.columnXcoordinates.replace(/\, /gi, ',').split(',')) : [];
      const toYaxis = columns.columnYcoordinates ? ((typeof (columns.columnYcoordinates) == 'number') ? columns.columnYcoordinates : columns.columnYcoordinates.replace(/\, /gi, ',').split(',')) : [];
      const genColumns = [];
      toArr.forEach((col, i) => {
        console.log(col)
        let columnObj = {
          "columnMasterID": null,
          "xcoordinate": null,
          "ycoordinate": null,
          "columnName": col
        }
        const filColumn = this.columns.find(c => c.columnName == col);
        if (filColumn) {
          genColumns.push(
            {
              columnMasterID: filColumn._id ? filColumn._id : null, columnName: filColumn.columnName ? filColumn.columnName : null,
              xcoordinate: toXaxis.length > 0 ? toXaxis[i] : null,
              ycoordinate: toYaxis.length > 0 ? toYaxis[i] : null,
            }
          )
          // genColumns.push(filColumn);
          // genColumns['columnMasterID'] = filColumn._id;
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
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.RACK;
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
        fileName: "Rack Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }


}


