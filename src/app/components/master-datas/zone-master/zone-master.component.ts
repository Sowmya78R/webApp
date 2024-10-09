import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { ZoneMasterDataEntity } from '../../../entities/ZoneMasterData.entity';
import { ApexService } from '../../../shared/services/apex.service';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { Constants } from '../../../constants/constants';
import { DataTableDirective } from 'angular-datatables';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { ReportsCommonService } from 'src/app/services/reports-common.service';
import { TranslateService } from '@ngx-translate/core';
import { copyStyles } from '@angular/animations/browser/src/util';
import { DecimalUtils } from 'src/app/constants/decimal';


@Component({
  selector: 'app-zone-master',
  templateUrl: './zone-master.component.html'
})
export class ZoneMasterComponent implements OnInit, OnDestroy, AfterViewInit {
  zones: any[] = [];
  warehouses: any[] = [];
  zoneMasterData: any;
  storageTypes: any[] = [];
  focusedElement: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  statuss: any = ['Active', 'In Active'];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  warehouseNameValues: CompleterData;
  storageTypeValues: CompleterData;
  missingParams: any;
  isShowOrHideError: any = false;
  isReadMode: any = false;
  failureRecords: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Zone', Storage.getSessionUser());
  forPermissionsSubscription: any;
  suppliersList: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private apexService: ApexService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService,

    private excelService: ExcelService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private completerService: CompleterService,
    private excelRestService: ExcelRestService,
    private metaDataService: MetaDataService, private reportsCommonService: ReportsCommonService,
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
    /*   this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
        if (data) {
          this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Zone', Storage.getSessionUser());
          this.formObj = this.configService.getGlobalpayload();
          this.warehouseNameValues = this.completerService.local([], 'wareHouseName', 'wareHouseName');
          this.getFunctionsCall();
        }
      }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.zoneMasterData = new ZoneMasterDataEntity();
      this.fetchAllWarehouseDetails();
      this.fetchAllZones();
      this.fetchAllStorageTypes();
      this.apexService.getPanelIconsToggle();
      //   this.fetchMetaData();
      this.fetchAllSupplierDetails();
    }
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses.length > 0) {
          this.warehouses = response.data.wareHouses;
          this.warehouseNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.wareHouses, 'wareHouseName'));
        } else {
          this.warehouses = [];
          this.toastr.success('No warehouses found');
        }
      },
      (error) => {
        this.warehouses = [];
      });
  }
  supplierIDNameValues: CompleterData
  /*  fetchMetaData() {
     this.reportsCommonService.fetchAllSuppliers();
     this.reportsCommonService.supplierIDNameValues.subscribe(res => {
       this.supplierIDNameValues = this.completerService.local(res);
     });
   } */
  /*   fetchAllSupplierDetails() {
      this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.supplierMasters) {
            this.suppliers = response.data.supplierMasters;
            this.rerender();
          }
        },
        (error) => {
          this.suppliers = [];
        });
    } */
  clearZoneData(zoneForm: NgForm) {
    // this.makeReadOnly = false;
    this.isReadMode = false;
    // this.makeThisDisabled = false;

    this.zoneMasterData = {
      wareHouseInfo: {},
      storageType: {},
      supplierMasterInfo: {}
    };
    this.zoneMasterData = new ZoneMasterDataEntity();
  }
  save(zoneForm: NgForm) {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      if (!this.zoneMasterData._id) {
        this.zoneMasterData['organizationInfo'] = this.configService.getOrganization();
        this.zoneMasterData['wareHouseInfo'] = this.configService.getWarehouse();
      }
      console.log(this.zoneMasterData);
      this.isReadMode = false
      this.wmsService.saveOrUpdateZoneDetails(JSON.stringify(this.zoneMasterData)).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.zoneMasterData = {
              wareHouseInfo: {},
              storageType: {},
              supplierMasterInfo: {}
            };
            this.fetchAllZones();
            this.toastr.success('Zone details updated.');
            zoneForm.form.reset();
            zoneForm.controls.status.setValue("Active")
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in updating zone details.');
          }
        },
        (error) => {
          this.toastr.error('Failed in updating zone details.');
        }
      );
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  makeReadOnly: boolean = false;
  makeThisFieldDisabled: boolean = false;

  globalIDs:any;
  editZoneDetails(details) {
    this.globalIDs = details._id;
    const det = details;
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      if (!det.storageType) {
        det.storageType = {}
      }
      if (details.supplierMasterInfo && details.supplierMasterInfo != null) {
        this.zoneMasterData.supplierMasterInfo.supplierIDName = details.supplierMasterInfo.supplierIDName
      } else {
        this.zoneMasterData.supplierMasterInfo = {}
        det.supplierMasterInfo = {}
      }
      this.zoneMasterData = Object.assign({}, det);
      this.isReadMode = true
      window.scroll(0, 0);
    }
    else if (this.permissionsList.includes('View')) {
      if (!det.storageType) {
        det.storageType = {}
      }
      this.zoneMasterData = Object.assign({}, det);
      this.makeReadOnly = true;
      this.makeThisFieldDisabled = true;

    }
  }
  // getWareHouseSelected(value) {
  //   this.warehouses.forEach(wareHouse => {
  //     if (wareHouse.wareHouseIDName === value) {
  //       this.zoneMasterData.wareHouseInfo.wareHouseID = wareHouse._id;
  //     }
  //   });
  // }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.rerender();
          if (response.data.zones.length > 0) {
            this.zones = response.data.zones;
          } else {
            this.zones = [];
          }
        } else {
          this.zones = [];
        }
      },
      (error) => {
        this.zones = [];
      });
  }
  fetchAllStorageTypes() {
    const arr: any = [];
    this.storageTypeValues = arr;
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

  /*   fetchAllSupplierDetails() {
      this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.supplierMasters) {
            this.suppliers = response.data.supplierMasters;
            this.rerender();
          }
        },
        (error) => {
          this.suppliers = [];
        });
    } */
  supplierMastersValues: CompleterData
  supplierMaster: any;
  fetchAllSupplierDetails() {
    const arr: any = [];
    this.supplierMastersValues = arr;
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          if (response.data.supplierMasters.length > 0) {
            this.supplierMaster = response.data.supplierMasters;
            this.supplierMastersValues = this.completerService.local(
              this.commonService.getFiltValuesFromArrayOfObjs(response.data.supplierMasters, 'supplierIDName'));
          } else {
            this.supplierMaster = [];
          }
        } else {
          this.supplierMaster = [];
        }
      },
      (error) => {
        this.supplierMaster = [];
      });
  }
  getSelectedValue(type, value) {
    console.log("type" + type)
    console.log("value" + value)
    if (value) {
      switch (type) {
        case 'storageType': {
          this.storageTypes.forEach(storageType => {
            if (storageType.storageTypeCode === value) {
              this.zoneMasterData.storageType._id = storageType._id;
              this.zoneMasterData.storageType.storageTypeCode = storageType.storageTypeCode;
              this.zoneMasterData.storageType.storageTypeDescription = storageType.storageTypeDescription;
              /*  this.zoneMasterData.storageType.organizationInfo = storageType.organizationInfo;
               this.zoneMasterData.storageType.wareHouseInfo = storageType.wareHouseInfo; */
            }
          });
          break;
        }
        case 'supplierIDName': {
          this.supplierMaster.forEach(supplieridname => {
            console.log(supplieridname);
            console.log(supplieridname.supplierIDName)
            console.log(type)
            if (supplieridname.supplierIDName === value) {
              this.zoneMasterData.supplierMasterInfo.supplierMasterID = supplieridname._id;
              this.zoneMasterData.supplierMasterInfo.supplierID = supplieridname.supplierID;
              this.zoneMasterData.supplierMasterInfo.supplierName = supplieridname.supplierName;
              /*  this.zoneMasterData.supplierMasterInfo.organizationInfo = supplieridname.organizationInfo;
               this.zoneMasterData.supplierMasterInfo.wareHouseInfo = supplieridname.wareHouseInfo; */
            }
          });
          break;
        }
      }
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

      this.deleteInfo = { name: 'zone', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllZones();
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
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  exportAsXLSX() {
    const changedZonesList = this.exportTypeMethod(this.zones)
    this.excelService.exportAsExcelFile(changedZonesList, 'Zones', null);
  }
  exportTypeMethod(data) {
    console.log(data)
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['zoneName'] = k.zoneName
        if (!k.storageType) {
          obj['storageTypeCode'] = null
        }
        else {
          obj['storageTypeCode'] = k.storageType.storageTypeCode
        }
        if (k.supplierMasterInfo) {
          obj['supplierIDName'] = k.supplierMasterInfo.supplierIDName
        } else {
          obj['supplierIDName'] = null
        }
        /*  obj['capacity'] = DecimalUtils.fixedDecimal(Number(k.capacity),2) ? DecimalUtils.fixedDecimal(Number(k.capacity),2):'123' */
        if (k.capacity) {
          obj['capacity'] = DecimalUtils.fixedDecimal(Number(k.capacity), 2)
        }
        else {
          obj['capacity'] = null
        }

        if (k.height) {
          obj['height'] = DecimalUtils.fixedDecimal(Number(k.height), 2)
        }
        else {
          obj['height'] = null
        }


        if (k.width) {
          obj['width'] = DecimalUtils.fixedDecimal(Number(k.width), 2)
        }
        else {
          obj['width'] = null
        }


        if (k.xcoordinate) {
          obj['xcoordinate'] = DecimalUtils.fixedDecimal(Number(k.xcoordinate), 2)
        }
        else {
          obj['xcoordinate'] = null
        }
        if (k.ycoordinate) {
          obj['ycoordinate'] = DecimalUtils.fixedDecimal(Number(k.ycoordinate), 2)
        }
        else {
          obj['ycoordinate'] = null
        }


        /*  obj['height'] = DecimalUtils.fixedDecimal(Number(k.height),2) ? DecimalUtils.fixedDecimal(Number(k.height),2):null
         obj['width'] = DecimalUtils.fixedDecimal(Number(k.width),2) ? DecimalUtils.fixedDecimal(Number(k.width),2) :null
         obj['xcoordinate'] = DecimalUtils.fixedDecimal(Number(k.xcoordinate),2) ? DecimalUtils.fixedDecimal(Number(k.xcoordinate),2):null
         obj['ycoordinate'] = DecimalUtils.fixedDecimal(Number(k.ycoordinate),2) ? DecimalUtils.fixedDecimal(Number(k.ycoordinate),2):null */
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['zoneName'] = null
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
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
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
            const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.ZONE);
            reqData.forEach(r => {
              if (r['supplierMasterInfo'] == null) {
                r['supplierMasterInfo'] = null;
              }
              else if (r.supplierMasterInfo) {
                r.supplierMasterInfo = this.mapId('supplierMasterInfo', r.supplierIDName);
              }
              if (r.wareHouseInfo != null && r.wareHouseInfo.wareHouseName != null) {
                r['wareHouseInfo']['wareHouseID'] = this.mapId('wareHouseNames', r.wareHouseInfo.wareHouseName);
              }
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r.capacity = r.capacity ? r.capacity.toString() : null
              r.height = r.height ? r.height.toString() : null
              r.width = r.width ? r.width.toString() : null
              r.xcoordinate = r.xcoordinate ? r.xcoordinate.toString() : null
              r.ycoordinate = r.ycoordinate ? r.ycoordinate.toString() : null
              if (r['supplierMasterInfo'] != null) {
                delete r["supplierMasterInfo"].organizationInfo;
                delete r["supplierMasterInfo"].wareHouseInfo;
                delete r["supplierMasterInfo"].serviceType
                delete r["supplierMasterInfo"].address1
                delete r["supplierMasterInfo"].address2
                delete r["supplierMasterInfo"].country
                delete r["supplierMasterInfo"].state
                delete r["supplierMasterInfo"].city
                delete r["supplierMasterInfo"].pin
                delete r["supplierMasterInfo"].email
                delete r["supplierMasterInfo"].phoneNumber
                delete r["supplierMasterInfo"].businessHeadName
                delete r["supplierMasterInfo"].businessHeadNumber
                delete r["supplierMasterInfo"].businessHeadEmail
                delete r["supplierMasterInfo"].spocName
                delete r["supplierMasterInfo"].spocNumber
                delete r["supplierMasterInfo"].spocEmail
                delete r["supplierMasterInfo"].taxRegNumber1
                delete r["supplierMasterInfo"].taxRegNumber2
                delete r["supplierMasterInfo"].pan
                delete r["supplierMasterInfo"].bankName
                delete r["supplierMasterInfo"].accountNumber
                delete r["supplierMasterInfo"].accountHolderName
                delete r["supplierMasterInfo"].accountType
                delete r["supplierMasterInfo"].ifscCode
                delete r["supplierMasterInfo"].bankAddress
                delete r["supplierMasterInfo"].poExpiryDate
                delete r["supplierMasterInfo"].supplierType
                delete r["supplierMasterInfo"].daysRequiredToSupply
                delete r["supplierMasterInfo"].leadTime
                delete r["supplierMasterInfo"].creditPeriod
                delete r["supplierMasterInfo"].status
                delete r["supplierMasterInfo"].termsOfPayment
                delete r["supplierMasterInfo"].currency
                delete r["supplierMasterInfo"].taxType
                delete r["supplierMasterInfo"].period
                delete r["supplierMasterInfo"].rate
                delete r["supplierMasterInfo"].contractStartDate
                delete r["supplierMasterInfo"].contractEndDate
                delete r["supplierMasterInfo"].palletPosition
                delete r["supplierMasterInfo"].ratePerPolycover
                delete r["supplierMasterInfo"].ratePerLabel
                delete r["supplierMasterInfo"].ratePerCarbonBox
                delete r["supplierMasterInfo"].supplierEmailID
                delete r["supplierMasterInfo"].supplierFirstName
                delete r["supplierMasterInfo"].supplierLastName
                delete r["supplierMasterInfo"].supplierUserID
                delete r["supplierMasterInfo"].supplierPassword
                delete r["supplierMasterInfo"].active
                delete r["supplierMasterInfo"].uom
                delete r["supplierMasterInfo"].taxGroup
              }
            });

            this.excelRestService.saveZoneBulkdata(reqData).subscribe(res => {
              if (res && res.status === 0 && res.data.zoneList && res.data.zoneList.failureList &&
                res.data.zoneList.failureList.length > 0 && res.data.zoneList.successList &&
                res.data.zoneList.successList.length > 0) {
                this.failureRecords = res.data.zoneList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.zoneList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllZones();
              } else if (res && res.status === 0 && res.data.zoneList && res.data.zoneList.failureList
                && res.data.zoneList.failureList.length > 0) {
                this.failureRecords = res.data.zoneList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.zoneList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.zoneList && res.data.zoneList.failureList && res.data.zoneList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.zoneList && res.data.zoneList.duplicateList && res.data.zoneList.duplicateList.length > 0) {
                  this.failureRecords = res.data.zoneList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllZones();
                } else {
                  console.log('Upload');
                  this.fetchAllZones();
                  this.toastr.success('Uploaded successfully');
                  this.failureRecords = [];
                  this.fetchAllZones();
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
  /*  fetchAllSupplierDetails() {
     this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
       (response) => {
         if (response && response.status === 0 && response.data.supplierMasters) {
           this.suppliersList = response.data.supplierMasters;
           this.rerender();
         }
       },
       (error) => {
         this.suppliersList = [];
       });
   } */
  mapId(type, value) {
    switch (type) {
      case 'wareHouseNames': {
        const warehouse = this.warehouses.find(w => w.wareHouseName === value);
        return warehouse && warehouse._id ? warehouse._id : null;
      }
      case 'storageType': {
        const formDetails = this.storageTypes.find(x => x.storageTypeCode == value);
        if (formDetails) {
          return formDetails;
        }
        else {
          return {
            storageTypeCode: value,
            storageTypeDescription: null,
            _id: null,
          }
        }
      }
      case 'supplierMasterInfo': {
        console.log(this.supplierMaster)
        const spplierDetails = this.supplierMaster.find(x => x.supplierIDName == value);
        if (spplierDetails) {
          return spplierDetails;
        }
        else {
          return {
            organizationInfo: this.configService.getOrganization(),
            supplierIDName: value,
            supplierID: null,
            supplierName: null,
            supplierMasterID: null,
            wareHouseInfo: this.configService.getWarehouse(),
            _id: null,
          }
        }
      }
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['zoneName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.ZONE;
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
        fileName: "Zone Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
    if (this.missingParams) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Zone Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}
