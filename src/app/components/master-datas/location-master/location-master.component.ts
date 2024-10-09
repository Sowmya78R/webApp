import { Component, OnInit, OnDestroy, ViewChild, EventEmitter, Output } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { LocationMasterDataEntity } from '../../../entities/LocationMasterData.entity';
import { ApexService } from '../../../shared/services/apex.service';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Constants } from '../../../constants/constants';
import { DataTableDirective } from 'angular-datatables';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ThrowStmt } from '@angular/compiler';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-location-master',
  templateUrl: './location-master.component.html',
  styles: [`.wmsDataTables {
     overflow-y:hidden!important;
    display: block;

  }`]
})
export class LocationMasterComponent implements OnInit, OnDestroy {
  @ViewChild('locationForm') locationForm: NgForm
  locationSpaceStatus: any = Constants.LOCATION_SPACE_STATUS;
  locations: any;
  locationDetails: any;
  levels: any[] = [];
  racks: any[] = [];
  zones: any[] = [];
  isReadMode: any = false;

  wareHouses: any[] = [];
  storageTypes: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  focusedElement: any;
  statuss: any = ['Active', 'In Active'];
  @ViewChild(DataTableDirective)

  dtElement: DataTableDirective;
  deleteInfo: any;
  // wareHouseNameValues: CompleterData;
  zoneNameValues: CompleterData;
  rackNameValues: CompleterData;
  levelNameValues: CompleterData;
  storageTypeValues: CompleterData;
  columnValues: CompleterData;
  missingParams: any;
  isShowOrHideError: any = false;
  failureRecords: any = [];
  columns: any = [];
  mode: string;
  allColumns: any = [];
  filteredZones: any = [];
  filteredLevels: any = [];
  filteredRacks: any = [];
  filteredColumns: any = [];
  units: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Location', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  selectedLocations: any = [];
  page: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  clearTimeInterval: any
  exportData: any = [];
  loopToStop: any = null;
  dataPerPage: number;
  finalArray: any = [];
  totalItemsB: any;
  loopToStopB: any = null;
  dataPerPageB: number;

  tableHeadings: any = ['Warehouse Name', 'Zone Name', 'Rack Name', 'Column Name', 'Level Name', 'Position'
    , 'Location Name', 'Capacity', 'Storage Type', 'Location Merge', 'Location Availabilty', 'Location Space Status', 'Total Space'
    , 'Usable Space', 'Length', 'Breadth', 'Height', 'Weight', 'Allowable Weight', 'Max Dimension', 'Allowable Max Dimension'
    , 'Usable Space Check', 'Weight Check', 'Max-Dimension Check', 'Block Location', 'Status', 'Action']
  selectAllCheckboxValue: any = false;

  constructor(
    private apexService: ApexService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService,
    private excelService: ExcelService,
    private completerService: CompleterService,
    private commonService: CommonService,
    private toastr: ToastrService,
    private excelRestService: ExcelRestService,
    private metaDataService: MetaDataService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    /*   this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
        if (data) {
          this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Location', Storage.getSessionUser());
          this.formObj = this.configService.getGlobalpayload();
          this.getFunctionsCall();
        }
      }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.findAllUnits();
      this.locations = [];
      this.locationDetails = new LocationMasterDataEntity();
      this.locationDetails.wareHouseInfo = this.configService.getWarehouse();
      this.fetchAllLocations();
      this.fetchAllLevels();
      this.fetchAllColumns();
      this.fetchAllRacks();
      this.fetchAllZones();
      // this.fetchAllWarehouseDetails();
      this.fetchAllStorageTypes();
      this.apexService.getPanelIconsToggle();
    }
  }
  calculateVolume() {
    if (this.locationDetails.length && this.locationDetails.breadth && this.locationDetails.height) {
      const lb = DecimalUtils.multiply(this.locationDetails.length, this.locationDetails.breadth)
      this.locationDetails.totalSpace = DecimalUtils.multiply(lb, this.locationDetails.height)
    }
  }
  fetchAllD(page, event) {
    if (event) {
      this.fetchAllLocations(page, event.target.value);
    }
  }

  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['locationBindArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.fetchAllLocations(this.page, this.itemsPerPage);
  }
  fetchAllLocations(page?, pageSize?) {
    const form = {
      "page": page ? page : 1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": PaginationConstants.location,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName
    }
    this.wmsService.fetchAllLocationsWithPaginations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locationPaginationResponse.locations) {
          this.locations = response.data.locationPaginationResponse.locations;
          const selectedIDs = this.selectedLocations.map(x => x._id);
          this.locations.forEach(element => {
            element.isChecked = false;
            if (this.selectAllCheckboxValue) {
              element.isChecked = true;
            }
            if (selectedIDs.includes(element._id)) {
              element.isChecked = true;
            }
          });
          this.totalItems = response.data.locationPaginationResponse.totalElements;

          const lengthofTotalItems = this.totalItems.toString().length;
          const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          count.forEach(el => {
            if (lengthofTotalItems == el) {
              let value: any = 1 + this.configService.addZerosMethod(el);
              this.dataPerPage = parseInt(value);
            }
          });
          const n: any = (this.totalItems / this.dataPerPage).toString()
          let m = n.split('.')
          if (m[1]) {
            this.loopToStop = parseInt(m[0]) + 1
          } else {
            this.loopToStop = parseInt(m[0])
          }
          // this.dtTrigger.next();
        } else {
          this.locations = [];
        }
      },
      (error) => {
        this.locations = [];
      });
  }
  selectAllData(event) {
    if (event.target.checked) {
      this.locations.forEach(element => {
        element.isChecked = true;
      });
    }
    else {
      this.locations.forEach(element => {
        element.isChecked = false;
      });
    }
    if (this.exportData.length == 0) {
      this.getAllLocationsForDownload();
    }
    else {
      this.exportData.forEach(element => {
        element.isChecked = event.target.checked;
      });
      if (event.target.checked) {
        this.selectedLocations = this.exportData;
      }
      else {
        this.selectedLocations = [];
      }
    }
  }
  getAllLocationsFor(forExport?) {
    if (this.exportData.length == 0) {
      this.getAllLocationsForDownload(null, forExport);
    }
    else {
      this.exportAsXLSX();
    }
  }

  getAllLocationsForDownload(index?, forExport?) {
    if (!index) {
      this.exportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      console.log(this.exportData);
      this.exportData.forEach(element => {
        element.isChecked = false;
      });
      if (forExport) {
        this.exportAsXLSX();
      }
      else {
        this.selectedLocations = this.exportData;
      }
    }
    else {
      if (((i == 1) || (i != 1 && this.exportData.length > 0)) && i <= this.loopToStop) {
        const form = {
          "page": i,
          "pageSize": this.dataPerPage,
          "searchKeyword": this.searchKey,
          "searchOnKeys": null,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }

        this.wmsService.fetchAllLocationsWithPaginations(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.locationPaginationResponse.locations) {
              this.exportData = [...this.exportData, ...response.data.locationPaginationResponse.locations];
              this.getAllLocationsForDownload(i, forExport);
            }
          })
      }
    }
  }

  exportAsXLSX(key?) {
    if (this.permissionsList.includes('Update')) {
      if (key) {
        const changedTaskList = this.exportTypeMethod(null)
        this.excelService.exportAsExcelFile(changedTaskList, 'locations', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
      } else {
        const changedTaskList = this.exportTypeMethod(this.exportData)
        this.excelService.exportAsExcelFile(changedTaskList, 'locations', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  exportTypeMethod(data) {
    console.log(data)
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['locationName'] = k.locationName
        obj['zoneName'] = k.zoneInfo.zoneName
        obj['rackName'] = k.rackInfo.rackName
        obj['levelName'] = k.levelInfo.levelName
        if (k.storageType) {
          obj['storageType'] = k.storageType.storageTypeCode
        } else {
          obj['storageType'] = null
        }
        obj['capacity'] = k.capacity
        obj['totalSpace'] = k.totalSpace
        obj['totalSpaceUom'] = k.totalSpaceUom
        obj['usableSpace'] = k.usableSpace
        obj['usableSpaceUom'] = k.usableSpaceUom
        obj['locationAvailability'] = k.locationAvailability
        obj['locationBarCode'] = k.locationBarCode
        obj['columnName'] = k.columnInfo.columnName
        obj['position'] = k.position
        obj['length'] = k.length
        obj['lengthUom'] = k.lengthUom
        obj['breadth'] = k.breadth
        obj['breadthUom'] = k.breadthUom
        obj['height'] = k.height
        obj['heightUom'] = k.heightUom
        obj['weight'] = k.weight
        obj['weightUom'] = k.weightUom
        obj['maxDimension'] = k.maxDimension
        obj['maxDimensionUom'] = k.maxDimensionUom
        obj['locationSpaceStatus'] = k.locationSpaceStatus
        obj['locationMerge'] = k.locationMerge
        obj['allowableMaxDimension'] = k.allowableMaxDimension
        obj['allowableMaxDimensionUom'] = k.allowableMaxDimensionUom
        obj['allowableWeight'] = k.allowableWeight
        obj['allowableWeightUom'] = k.allowableWeightUom
        obj['usableSpaceCheck'] = k.usableSpaceCheck
        obj['weightCheck'] = k.weightCheck
        obj['maxDimensionCheck'] = k.maxDimensionCheck
        obj['blockLocation'] = k.blockLocation
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['locationName'] = null
      obj['zoneName'] = null
      obj['rackName'] = null
      obj['levelName'] = null
      obj['storageType'] = null
      obj['capacity'] = null
      obj['totalSpace'] = null
      obj['totalSpaceUom'] = null
      obj['usableSpace'] = null
      obj['usableSpaceUom'] = null
      obj['locationAvailability'] = null
      obj['locationBarCode'] = null
      obj['columnName'] = null
      obj['position'] = null
      obj['length'] = null
      obj['lengthUom'] = null
      obj['breadth'] = null
      obj['breadthUom'] = null
      obj['height'] = null
      obj['heightUom'] = null
      obj['weight'] = null
      obj['weightUom'] = null
      obj['maxDimension'] = null
      obj['maxDimensionUom'] = null
      obj['locationSpaceStatus'] = null
      obj['locationMerge'] = null
      obj['allowableMaxDimension'] = null
      obj['allowableMaxDimensionUom'] = null
      obj['allowableWeight'] = null
      obj['allowableWeightUom'] = null
      obj['usableSpaceCheck'] = null
      obj['weightCheck'] = null
      obj['maxDimensionCheck'] = null
      obj['blockLocation'] = null
      arr.push(obj)
    }
    return arr
  }


  clearLocationData(locationForm: NgForm) {
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.isReadMode = false
    this.locationDetails = {
      rackInfo: {},
      wareHouseInfo: {},
      zoneInfo: {},
      levelInfo: {},
      storageType: {},
      column: {},
    };
    this.mode = undefined;
    this.locationDetails = new LocationMasterDataEntity();
    this.filteredZones = this.completerService.local([]);
    this.filteredRacks = this.completerService.local([]);
    this.columnValues = this.completerService.local([]);
    this.filteredLevels = this.completerService.local([]);
    this.locationForm.controls.status.setValue("Active")
    this.locationDetails.wareHouseInfo = this.configService.getWarehouse();
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
  save(locationForm: NgForm) {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      // if (!this.locationDetails._id) {
      this.locationDetails['organizationInfo'] = this.configService.getOrganization();
      // }
      delete this.locationDetails.isChecked;
      this.wmsService.saveOrUpdateLocationDetails(JSON.stringify(this.locationDetails)).subscribe(
        (response) => {
          console.log(this.locationDetails);
          if (response && response.status === 0 && response.data.locationMaster) {
            // this.locationDetails = {
            //   rackInfo: {},
            //   wareHouseInfo: {},
            //   zoneInfo: {},
            //   levelInfo: {},
            //   storageType: {},
            //   columnInfo: {},
            //   status: 'Active',
            // };
            this.mode = undefined;
            this.exportData = [];
            //  this.rerender();
            this.fetchAllLocations(this.page, this.itemsPerPage);
            // this.filteredZones = this.completerService.local([]);
            this.filteredRacks = this.completerService.local([]);
            this.columnValues = this.completerService.local([]);
            this.filteredLevels = this.completerService.local([]);
            //locationForm.form.reset();
            this.toastr.success(response.statusMsg)
            this.locationDetails = new LocationMasterDataEntity();
            this.locationDetails.wareHouseInfo = this.configService.getWarehouse();

            this.locationDetails = new LocationMasterDataEntity();
            this.locationDetails.wareHouseInfo = this.configService.getWarehouse();
            /*  this.toastr.success('Location details updated'); */
            /*
                        this.locationDetails = {
                          rackInfo: {},
                          wareHouseInfo: {},
                          zoneInfo: {},
                          levelInfo: {},
                          storageType: {},
                          columnInfo: {},
                          status: 'Active',
                        }; */
            // this.locationDetails = [];

            this.locationForm.controls.status.setValue("Active")
            // this.locationDetails.wareHouseInfo = this.configService.getWarehouse();
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg)
            // locationForm.form.reset();
          } else {
            this.toastr.error('Failed in updating location details');
          }
        },
        (error) => {
          this.toastr.error('Failed in updating location details');
        });
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.makeReadOnly = false;
    this.isReadMode = false;
    this.globalIDs = null
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs: any;
  editLocationDetails(details) {
    this.globalIDs = details._id;
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      if (details.columnInfo === null) details.columnInfo = { columnName: '' };
      this.locationDetails = new LocationMasterDataEntity();
      if (!details.storageType) {
        details.storageType = {}
      }
      this.locationDetails = Object.assign({}, details);
      this.columns = details.columnInfo;
      this.getSelectedValue('rackName', { originalObject: details.rackInfo.rackName });
      window.scroll(0, 0);
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
      this.isReadMode = true
      this.locationDetails.wareHouseInfo = this.configService.getWarehouse();
    }
    else if (this.permissionsList.includes('View')) {
      if (!details.storageType) {
        details.storageType = {}
      }
      this.locationDetails = Object.assign({}, details);
      this.makeReadOnly = true;
      this.makeThisDisabled = true;
      window.scroll(0, 0);
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'location', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }

  getConfirmation(status) {
    if (status === 'Yes') {
      this.exportData = [];
      this.fetchAllLocations();
    }
  }
  fetchAllColumns() {
    this.wmsService.fetchAllColumns(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.columns.length) {
          this.allColumns = response.data.columns;
        }
      },
      error => {
      }
    )
  }
  read(event, data) {
    if (event.target.checked) {
      data.isChecked = true;
      this.selectedLocations.push(data);
    }
    else {
      data.isChecked = false;
      this.selectedLocations = this.selectedLocations.filter(x => x._id != data._id);
    }
    // this.selectAllCheckboxValue = this.employees.every(function (item: any) {
    //   return item.isChecked == true;
    // })
  }
  getSelectedValue(type, value) {
    if (value) {
      switch (type) {

        case 'zoneName': {
          this.zones.forEach(zone => {
            if (value && zone.zoneName === value.originalObject) {
              this.locationDetails.zoneInfo.zoneID = zone._id;
              const filteredRacks = this.racks.filter(rack => rack.zoneInfo.zoneName === zone.zoneName);
              this.filteredRacks = this.completerService.local(
                this.commonService.getFiltValuesFromArrayOfObjs(filteredRacks, 'rackName'));
            }
          });
          break;
        }
        case 'rackName': {
          this.racks.forEach(rack => {
            if (value && rack.rackName === value.originalObject && rack.zoneInfo.zoneName == this.locationDetails.zoneInfo.zoneName) {
              this.locationDetails.rackInfo.rackID = rack._id;
              this.columns = rack.columnHelpers;
              this.mode = rack.mode;
              const filteredLevels = this.levels.filter(level => level.rackInfo.rackName === rack.rackName && level.zoneInfo.zoneName === this.locationDetails.zoneInfo.zoneName);
              this.filteredLevels = this.completerService.local(
                this.commonService.getFiltValuesFromArrayOfObjs(filteredLevels, 'levelName'));
              this.columnValues = this.completerService.local(
                this.commonService.getFiltValuesFromArrayOfObjs(rack.columnHelpers, 'columnName'));
            }
          });
          break;
        }
        case 'levelName': {
          this.levels.forEach(level => {
            if (value && level.levelName === value.originalObject && level.zoneInfo.zoneName == this.locationDetails.zoneInfo.zoneName && level.rackInfo.rackName === this.locationDetails.rackInfo.rackName) {
              this.locationDetails.levelInfo.levelID = level._id;
              this.columnValues = this.completerService.local(
                this.commonService.getFiltValuesFromArrayOfObjs(level.columnHelpers, 'columnName'));
            }
          });
          break;
        }
        case 'column': {
          this.columns.forEach(col => {
            if (value && value.originalObject && col.columnName === value.originalObject) {
              this.locationDetails.columnInfo._id = col.columnMasterID;
            }
          });
          break;
        }
        case 'storageType': {
          this.storageTypes.forEach(storageType => {
            if (value && storageType.storageTypeCode === value.originalObject) {
              this.locationDetails.storageType._id = storageType._id;
              this.locationDetails.storageType.storageTypeCode = storageType.storageTypeCode;
              this.locationDetails.storageType.storageTypeDescription = storageType.storageTypeDescription;
              this.locationDetails.storageType.organizationInfo = storageType.organizationInfo;
              this.locationDetails.storageType.wareHouseInfo = storageType.wareHouseInfo;
            }
          });
          break;
        }
        default:
          break;
      }
    }
  }
  fetchAllLevels() {

    this.wmsService.fetchAllLevels(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.levels) {
          this.levels = response.data.levels;
          console.log(this.levels);
          /*  this.levelNameValues = this.completerService.local(
             this.commonService.getFiltValuesFromArrayOfObjs(response.data.levels, 'levelName'));
 
         /*   this.levelNameValues = this.completerService.local(
             this.commonService.getFiltValuesFromArrayOfObjs(response.data.racks, 'rackName'));
 
           this.levelNameValues = this.completerService.local(
             this.commonService.getFiltValuesFromArrayOfObjs(response.data.columns, 'columnName'));
 
           this.levelNameValues = this.completerService.local(
             this.commonService.getFiltValuesFromArrayOfObjs(response.data.zones, 'zoneName')); */
        } else {
          this.levels = [];
        }
      },
      (error) => {
        this.levels = [];
      });
  }
  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.racks = response.data.racks;
          this.rackNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.racks, 'rackName'));
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
        if (response && response.status === 0 && response.data.zones) {
          this.zones = response.data.zones;
          const filteredZones = this.zones.filter(zone => zone.wareHouseInfo.wareHouseName === this.locationDetails.wareHouseInfo.wareHouseName);
          this.filteredZones = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(filteredZones, 'zoneName'));
        } else {
          this.zones = [];
        }
      },
      (error) => {
        this.zones = [];
      });
  }
  // fetchAllWarehouseDetails() {
  //   this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
  //     (response) => {
  //       if (response && response.status === 0 && response.data.wareHouses) {
  //         this.wareHouses = response.data.wareHouses;
  //         this.wareHouseNameValues = this.completerService.local(
  //           this.commonService.getFiltValuesFromArrayOfObjs(response.data.wareHouses, 'wareHouseName'));
  //       } else {
  //         this.wareHouses = [];
  //       }
  //     },
  //     (error) => {
  //       this.wareHouses = [];
  //     });
  // }
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
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
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
      dtInstance.destroy();
    });
  }
  getFile1() {
    document.getElementById('upfile1').click();
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  mapId(type, value, rackName?, levelName?, zoneName?, wareHouseName?) {
    switch (type) {
      case 'wareHouseName': {
        const warehouse = this.wareHouses.find(w => w.wareHouseName === value);
        return warehouse && warehouse._id ? warehouse._id : null;
      }
      case 'zoneName': {
        const zone = this.zones.find(w => w.zoneName === zoneName && w.wareHouseInfo.wareHouseName === wareHouseName);
        console.log(zone)
        return zone ? zone : null;
      } case 'rackName': {
        if (zoneName) {
          const rack = this.racks.find(w => w.rackName === value && w.zoneInfo.zoneName === zoneName);
          return rack && rack._id ? rack._id : null;
        }
      }
      case 'levelName': {
        console.log(rackName)
        console.log(value)
        if (rackName) {
          const level = this.levels.find(w => w.levelName === value && w.rackInfo.rackName === rackName);
          return level && level._id ? level._id : null;
        }
      }
      case 'levelName': {
        const level = this.levels.find(w => w.levelName === value);
        return level && level._id ? level._id : null;
      }
      case 'Id': {
        const columns = this.allColumns.find(w => w.columnName === value);
        // console.log(columns._id)
        return columns && columns._id ? columns._id : null;
      }

      case 'column': {
        console.log(value)
        console.log(rackName)
        console.log(levelName)
        if (rackName && levelName) {
          const column = this.allColumns.find(w => w.columnName === value);
          return column ? column : null;
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
  mapIdSecond(type, value) {
    switch (type) {
      case 'zoneName': {
        const zone = this.zones.find(w => w.zoneName === value);
        console.log(zone)
        return zone ? zone : null;
      } case 'rackName': {
        const rack = (value.rackInfo && value.zoneInfo) ? this.racks.find(w => w.rackName === value.rackInfo.rackName && w.zoneInfo.zoneName == value.zoneInfo.zoneName) : null;
        return rack && rack._id ? rack._id : null;
      }
      case 'levelName': {
        const el = (value.levelInfo && value.rackInfo && value.zoneInfo) ? this.levels.find(w => w.levelName === value.levelInfo.levelName && w.rackInfo.rackName === value.rackInfo.rackName && w.zoneInfo.zoneName == value.zoneInfo.zoneName) : null;
        return {
          "levelID": el ? el._id : null,
          "levelName": value.levelInfo.levelName ? value.levelInfo.levelName : null,
        }
      }

      case 'Id': {
        const columns = this.allColumns.find(w => w.columnName === value);
        // console.log(columns._id)
        return columns && columns._id ? columns._id : null;
      }
      case 'column': {
        const column = this.allColumns.find(w => w.columnName === value);
        return column ? column : null;
      }
    }
  }
  /*  case 'levelName': {
       if (rackName) {
         const level = this.levels.find(w => w.levelName === value && w.rackInfo.rackName === rackName);
         return level && level._id ? level._id : null;
       }
     } */

  /* Old Upload Functionality Start */




  /* Old Upload Functionality Ends */


  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      let invalidData: boolean = false;
      this.isShowOrHideError = false;
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.LOCATION;
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
            let reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.LOCATION);
            reqData = this.excelService.deleteUnRequiredParams(reqData, ['levelName', 'rackName', 'storageTypeCode', 'storageTypeDescription',
              'wareHouseName', 'zoneName', 'binName']);
            console.log(reqData)
            for (let i = 0; i < reqData.length; i++) {
              let r: any = reqData[i];
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r.capacity = r.capacity ? r.capacity.toString() : null
              r.totalSpace = r.totalSpace ? r.totalSpace.toString() : null
              r.usableSpace = r.usableSpace ? r.usableSpace.toString() : null
              r.length = r.length ? r.length.toString() : null
              r.breadth = r.breadth ? r.breadth.toString() : null
              r.height = r.height ? r.height.toString() : null
              r.weight = r.weight ? r.weight.toString() : null
              r.maxDimension = r.maxDimension ? r.maxDimension.toString() : null
              r.allowableMaxDimension = r.allowableMaxDimension ? r.allowableMaxDimension.toString() : null
              r.allowableWeight = r.allowableWeight ? r.allowableWeight.toString() : null
              if (!(typeof (r.locationAvailability) === 'boolean')) {
                this.failureRecords = r.locationAvailability;
                console.log(r.locationAvailability);
                invalidData = true;
                break
              }
              if (r.zoneInfo) {
                let zonesinfo = this.mapIdSecond('zoneName', r.zoneInfo.zoneName);
                r['zoneInfo'] = {
                  "zoneID": null,
                  "zoneName": r.zoneInfo.zoneName,
                  "sequenceNumber": null,
                  "isActive": null
                }
                if (zonesinfo) {
                  r['zoneInfo']['zoneID'] = zonesinfo._id
                  r['zoneInfo']['zoneName'] = zonesinfo.zoneName
                  r['zoneInfo']['sequenceNumber'] = zonesinfo.sequence
                  r['zoneInfo']['isActive'] = zonesinfo.active
                } else {
                  r['zoneInfo']['zoneID'] = null
                  r['zoneInfo']['zoneName'] = r.zoneInfo.zoneName
                  r['zoneInfo']['sequenceNumber'] = null
                  r['zoneInfo']['isActive'] = null
                }
              } else {
                r['zoneInfo'] = null
              }

              if (r.rackInfo) {
                let racks = this.mapIdSecond('rackName', r);

                if (racks) {
                  r['rackInfo']['rackID'] = racks
                } else {
                  r['rackInfo']['rackID'] = null
                }
              } else {
                r['rackInfo'] = null
              }
              console.log(r)
              if (r.levelInfo) {
                r['levelInfo'] = {
                  "levelID": r.levelInfo.levelID,
                  "levelName": r.levelInfo.levelName
                }
                let levelNameObj = this.mapIdSecond('levelName', r);
                console.log("levelNameObj" + JSON.stringify(levelNameObj));
                /*  let levelNameObj = this.mapIdSecond('levelName', r.levelName) */

                if (levelNameObj) {
                  r['levelInfo']['levelID'] = levelNameObj.levelID
                  r['levelInfo']['levelName'] = levelNameObj.levelName
                }
                else {
                  r['levelInfo']['levelID'] = null
                  r['levelInfo']['levelName'] = r.levelName
                }
              } else {
                r['levelInfo'] = null
              }

              /* if (r.levelInfo) {
                let levels = this.mapIdSecond('levelName', r);
             
                if (levels) {
                  r['levelInfo']['levelID'] = levels
                } else {
                  r['levelInfo']['levelID'] = null
                }
              } else {
                r['levelInfo'] = null
              } */
              if (r.locationName) {
                r['locationName'] = r.locationName
              }
              else {
                r['locationName'] = null

              }



              /*  r['levelInfo'] = this.mapIdSecond('levelName', r);
                if( r.levelInfo){
                 r['levelInfo'] = this.mapIdSecond('levelName', r.levelInfo.levelName);
                let levels = this.mapIdSecond('levelName', r);
          
               }
               else{
                 r['levelInfo']['levelName'] = null
               } */
              if (r.columnName) {
                r['columnInfo'] = {
                  "_id": null,
                  "columnName": null,
                }
                let columnObj = this.mapIdSecond('column', r.columnName)

                if (columnObj) {
                  r['columnInfo']['_id'] = columnObj._id
                  r['columnInfo']['columnName'] = columnObj.columnName
                }
                else {
                  r['columnInfo']['_id'] = null
                  r['columnInfo']['columnName'] = r.columnName
                }
              } else {
                r['columnInfo'] = null
              }

              // if (r.columnInfo != null && r.columnInfo.columnName != null && r.rackInfo && r.rackInfo != null && r.levelInfo && r.levelInfo != null) {
              //   r['columnInfo']['_id'] = this.mapId('columnName', r.columnInfo.columnName, r.rackInfo.rackName, r.levelInfo.levelName);
              // }
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              if (!r.storageType) {
                r['storageType'] = null;
              }
              else if (r.storageType) {
                r.storageType = this.mapId('storageType', r.storageType.storageTypeCode);
                delete r.storageTypeCode;
              }

            }
            console.log(reqData)
            if (!invalidData) {
              this.excelRestService.saveLocationBulkdata(reqData).subscribe(res => {
                if (res && res.status === 0 && res.data.locationList && res.data.locationList.failureList &&
                  res.data.locationList.failureList.length > 0 && res.data.locationList.successList &&
                  res.data.locationList.successList.length > 0) {
                  this.failureRecords = res.data.locationList.failureList;
                  this.failureRecords = this.failureRecords.concat(res.data.locationList.duplicateList);
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.dtTrigger.next();
                  //   this.rerender();
                  this.fetchAllLocations();
                } else if (res && res.status === 0 && res.data.locationList &&
                  res.data.locationList.failureList && res.data.locationList.failureList.length > 0) {
                  this.failureRecords = res.data.locationList.failureList;
                  this.failureRecords = this.failureRecords.concat(res.data.locationList.duplicateList);
                  this.toastr.error('Failed in uploading, Please download log for reasons');
                } else if (res && res.status === 0 && res.data.locationList && res.data.locationList.failureList
                  && res.data.locationList.failureList.length === 0) {
                  if (res && res.status === 0 && res.data.locationList && res.data.locationList.duplicateList
                    && res.data.locationList.duplicateList.length > 0) {
                    this.failureRecords = res.data.locationList.duplicateList;
                    this.toastr.error('Duplicates present in the excel, Please download log file.');
                    // this.rerender();
                    this.fetchAllLocations();
                  } else {
                    //  this.rerender();
                    this.toastr.success('Uploaded successfully');
                    this.fetchAllLocations();
                    this.failureRecords = [];
                  }
                } else {
                  this.toastr.error('Failed in uploading');
                  this.failureRecords = [];
                }
              },
                error => { });
            } else {
              this.failureRecords = ['Location availability should be boolean value'];
            }
          }
        }
        else {
          this.toastr.error('Failed in uploading');
          this.failureRecords = [];
        }
      }, 500);
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.LOCATION;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param] || record[param] === 0));
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
        fileName: "Location Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }

  /* New Upload Location CHanges */

  failureRecordsNew: any = [];
  missingParamsNew: any;
  requiredParamsNew: any;
  newuploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      let invalidData: boolean = false;
      this.isShowOrHideError = false;
      const requiredParamsNew = Constants.UPLOAD_MANDAT_FIELDS.LOCATION;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        if (jsonData.length > 0) {
          event.target.value = '';
          const missingParamsArrayNew = this.MandatoryCheckNew(jsonData);
          if (missingParamsArrayNew.length > 1) {
            this.failureRecordsNew = missingParamsArrayNew;
            this.missingParamsNew = missingParamsArrayNew.join(', ');
            this.toastr.error('Please download log file to fill mandatory fields');
          } else {
            let reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.LOCATION);
            reqData = this.excelService.deleteUnRequiredParams(reqData, ['levelName', 'rackName', 'storageTypeCode', 'storageTypeDescription',
              'wareHouseName', 'zoneName', 'binName']);
            console.log(reqData)
            for (let i = 0; i < reqData.length; i++) {
              let r: any = reqData[i];
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r.capacity = r.capacity ? r.capacity.toString() : null
              r.totalSpace = r.totalSpace ? r.totalSpace.toString() : null
              r.usableSpace = r.usableSpace ? r.usableSpace.toString() : null
              r.length = r.length ? r.length.toString() : null
              r.breadth = r.breadth ? r.breadth.toString() : null
              r.height = r.height ? r.height.toString() : null
              r.weight = r.weight ? r.weight.toString() : null
              r.maxDimension = r.maxDimension ? r.maxDimension.toString() : null
              r.allowableMaxDimension = r.allowableMaxDimension ? r.allowableMaxDimension.toString() : null
              r.allowableWeight = r.allowableWeight ? r.allowableWeight.toString() : null
              if (!(typeof (r.locationAvailability) === 'boolean')) {
                this.failureRecordsNew = r.locationAvailability;
                console.log(r.locationAvailability);
                invalidData = true;
                break
              }
              console.log(r)
              if (r.zoneInfo) {
                let zonesinfo = this.mapIdSecond('zoneName', r.zoneInfo.zoneName);
                console.log(zonesinfo);
                r['zoneInfo'] = {
                  "zoneID": null,
                  "zoneName": r.zoneInfo.zoneName,
                  "sequenceNumber": null,
                  "isActive": null
                }
                if (zonesinfo) {
                  r['zoneInfo']['zoneID'] = zonesinfo._id
                  r['zoneInfo']['zoneName'] = zonesinfo.zoneName
                  r['zoneInfo']['sequenceNumber'] = zonesinfo.sequence
                  r['zoneInfo']['isActive'] = zonesinfo.active
                } else {
                  console.log(r)
                  r['zoneInfo']['zoneID'] = null
                  r['zoneInfo']['zoneName'] = r.zoneInfo.zoneName
                  r['zoneInfo']['sequenceNumber'] = null
                  r['zoneInfo']['isActive'] = null
                }
              } else {
                r['zoneInfo'] = null
              }

              if (r.rackInfo) {
                let racks = this.mapIdSecond('rackName', r);
                console.log(racks)
                if (racks) {
                  r['rackInfo']['rackID'] = racks
                } else {
                  r['rackInfo']['rackID'] = null
                }
              } else {
                r['rackInfo'] = null
              }
              if (r.levelInfo) {
                r['levelInfo'] = this.mapIdSecond('levelName', r.levelInfo.levelName);
              }
              else {
                r['levelInfo']['levelName'] = null
              }
              //r['levelInfo'] = this.mapIdSecond('levelName', r);
              if (r.columnName) {
                r['columnInfo'] = {
                  "_id": null,
                  "columnName": null,
                }
                let columnObj = this.mapIdSecond('column', r.columnName)
                console.log(columnObj)
                if (columnObj) {
                  r['columnInfo']['_id'] = columnObj._id
                  r['columnInfo']['columnName'] = columnObj.columnName
                }
                else {
                  r['columnInfo']['_id'] = null
                  r['columnInfo']['columnName'] = r.columnName
                }
              } else {
                r['columnInfo'] = null
              }
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              if (!r.storageType) {
                r['storageType'] = null;
              }
              else if (r.storageType) {
                r.storageType = this.mapId('storageType', r.storageType.storageTypeCode);
                delete r.storageTypeCode;
              }
              r['_id'] = null;
              const findID = this.locations.find(x => x.locationName == r.locationName);
              if (findID) {
                r['_id'] = findID._id;
              }
            }
            console.log(reqData)
            if (!invalidData) {
              this.excelRestService.saveLocationBulkdataNew(reqData).subscribe(res => {
                if (res && res.status === 0 && res.data.locationList && res.data.locationList.failureList &&
                  res.data.locationList.failureList.length > 0 && res.data.locationList.successList &&
                  res.data.locationList.successList.length > 0) {
                  this.failureRecordsNew = res.data.locationList.failureList;
                  this.failureRecordsNew = this.failureRecordsNew.concat(res.data.locationList.duplicateList);
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.dtTrigger.next();
                  // this.rerender();
                  this.fetchAllLocations();
                } else if (res && res.status === 0 && res.data.locationList && res.data.locationList.failureList
                  && res.data.locationList.failureList.length > 0) {
                  this.failureRecordsNew = res.data.locationList.failureList;
                  this.failureRecordsNew = this.failureRecordsNew.concat(res.data.locationList.duplicateList);
                  this.toastr.error('Failed in uploading, Please download log for reasons');
                } else if (res && res.status === 0) {
                  if (res && res.status === 0 && res.data.locationList && res.data.locationList.duplicateList
                    && res.data.locationList.duplicateList.length > 0) {
                    this.failureRecordsNew = res.data.locationList.duplicateList;
                    this.toastr.error('Duplicates present in the excel, Please download log file.');
                    ////  this.rerender();
                    this.fetchAllLocations();
                  } else {
                    //  this.rerender();
                    this.toastr.success('Uploaded successfully');
                    this.fetchAllLocations();
                    this.failureRecordsNew = [];
                  }
                } else {
                  this.toastr.error('Failed in uploading');
                  this.failureRecordsNew = [];
                }
              },
                error => { });
            } else {
              this.failureRecordsNew = ['Location availability should be boolean value'];
            }
          }
        }
        else {
          this.toastr.error('Failed in uploading');
          this.failureRecordsNew = [];
        }
      }, 500);
    }
  }
  MandatoryCheckNew(data) {
    const missingParamsArrayNew = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record) {
          const requiredParamsNew = Constants.UPLOAD_MANDAT_FIELDS.LOCATION;
          const missingParamsNew = requiredParamsNew.filter((param: any) => !(!!record[param] || record[param] === 0));
          if (missingParamsNew.length > 0) {
            missingParamsArrayNew.push(`Row No. ${index + 1} - ${missingParamsNew.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArrayNew;
  }
  private settingNew = {
    element: {
      dynamicDownloadNew: null as HTMLElement
    }
  };
  dyanmicDownloadByHtmlTagNew(arg: { fileName: string; text: string }) {
    if (!this.settingNew.element.dynamicDownloadNew) {
      this.settingNew.element.dynamicDownloadNew = document.createElement("a");
    }
    const element = this.settingNew.element.dynamicDownloadNew;
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
  downloadLogFileNew() {
    if (this.failureRecordsNew) {
      this.dyanmicDownloadByHtmlTagNew({
        fileName: "Location Error Reasons",
        text: this.failureRecordsNew.toString().replace(/,/g, '\n')
      });
    }
  }
  generatePDF() {
    this.finalArray = [];
    this.loopToStopB = null;
    this.totalItemsB = null;
    this.dataPerPageB = null;
    this.getAllLocForBarcodes();
  }
  getAllLocForBarcodes(index?) {
    if (!index) {
      this.finalArray = [];
    }
    if (this.dataPerPageB && this.loopToStopB) {
      let i = index ? index + 1 : 1;
      if (i > this.loopToStopB) {
      }
      else {
        if (((i == 1) || (i != 1 && this.finalArray.length > 0)) && i <= this.loopToStopB) {
          const form = {
            "page": i,
            "pageSize": this.dataPerPageB,
            "locationNames": (this.selectedLocations.length > 0) ? (this.selectedLocations.map(x => x.locationName)) : [],
            "organizationIDName": this.formObj.organizationIDName,
            "wareHouseIDName": this.formObj.wareHouseIDName
          }
          this.metaDataService.fetchAllLocationBarcodes(form).subscribe(res => {
            if (res['status'] == 0 && res['data'].locationBarcodePaginationResponse) {
              this.finalArray = [...this.finalArray, ...res['data'].locationBarcodePaginationResponse.locationBarcodeResponses];
              this.getAllLocForBarcodes(i);
              if (i == this.loopToStopB) {
                this.configService.selectedLocations = this.finalArray;
                setTimeout(() => {
                  window.print();
                }, 300);
              }
            }
          })
        }
      }
    }
    else {
      const payload = {
        'page': 1, 'pageSize': 10,
        "organizationIDName": this.formObj.organizationIDName,
        "wareHouseIDName": this.formObj.wareHouseIDName,
        "locationNames": (this.selectedLocations.length > 0) ? (this.selectedLocations.map(x => x.locationName)) : []
      }
      this.metaDataService.fetchAllLocationBarcodes(payload).subscribe(res => {
        if (res['status'] == 0 && res['data'].locationBarcodePaginationResponse) {
          this.finalArray = res['data'].locationBarcodePaginationResponse.locationBarcodeResponses;
          this.totalItemsB = res['data'].locationBarcodePaginationResponse.totalElements;
          if (this.totalItemsB <= 10) {
            this.configService.selectedLocations = this.finalArray;
            setTimeout(() => {
              window.print();
            }, 300);
          }
          else {
            const lengthofTotalItems = this.totalItemsB.toString().length;
            const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            count.forEach(el => {
              if (lengthofTotalItems == el) {
                let value: any = 1 + this.configService.addZerosMethod(el);
                this.dataPerPageB = parseInt(value);
              }
            });
            const n: any = (this.totalItemsB / this.dataPerPageB).toString()
            let m = n.split('.')
            if (m[1]) {
              this.loopToStopB = parseInt(m[0]) + 1
            } else {
              this.loopToStopB = parseInt(m[0])
            }
            this.getAllLocForBarcodes();
          }
        }
      })
    }
  }
}





