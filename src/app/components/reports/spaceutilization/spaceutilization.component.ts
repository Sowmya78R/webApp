import { Component, ContentChild, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { FormGroup, FormBuilder, FormControlName } from '@angular/forms';
import { Constants } from 'src/app/constants/constants';
import { CompleterData, CompleterService } from 'ng2-completer';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { ToastrService } from 'ngx-toastr';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportsCommonService } from 'src/app/services/reports-common.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Label, SingleDataSet } from 'ng2-charts';
import { Storage } from '../../../shared/utils/storage';
import { ChartType } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-spaceutilization',
  templateUrl: './spaceutilization.component.html',
  styleUrls: ['./spaceutilization.component.scss']
})
export class SpaceutilizationComponent implements OnInit {

  @Input()
  public label: string;

  @ContentChild(FormControlName)
  public zoneNames: FormControlName;

  public ngAfterContentInit(): void {

  }
  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;

  locationDropDownList = [];
  selectedItems = [];
  dropdownSettings = {};
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Outbound', 'Space Utilization', Storage.getSessionUser());
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  spaceUtilizationReportForm: FormGroup;
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData;
  products: CompleterData;
  inventoryData: any;
  productData: any;
  suppliersIDs: CompleterData;
  productCategoriesIDs: CompleterData;
  batchNumberIDs: CompleterData;
  serialNumberIDs: CompleterData;
  zones: any;
  locationsIDs: CompleterData
  zoneNameValues: CompleterData;
  grnhistoryResponseList: any;
  rackNameValues: CompleterData;
  formObj = this.configService.getGlobalpayload();
  wareHouseDefaultValueFromHeader: any;
  zonesInfo: any = []
  totalSpace: any;
  uom: any;


  spaceUtilizationResponceList: any;
  spaceUtilizationResponceObjList: any;
  locationCountone: any;
  locationCountTwo: any;
  locationCountThree: any;
  locationCountFour: any;
  totalSpaceReqObj: any;
  totalSpaceUomReqObj: any;
  totalusableReqObj: any;
  totalUsuableSpaceUomReqObj: any;
  objectFields: any;
  showLocationSpaceStatus: any
  showlocationsCount: any
  spaceUtilizationArray: any = []
  countinnerObjLocationNumber: any;
  partialAvailbleList: any;
  completeCountList: any
  UnAvailableList: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  pieChartColors: any = [{
    backgroundColor: ['red', 'green'],
  }];

  public pieChartPlugins: any = [];
  public warehouseCapacityLabels: Label[] = ['Total Locations', 'Available Locations'];
  public warehouseCapacityData: SingleDataSet = [];
  public warehouseCapacityType: ChartType = 'pie';
  public warehouseCapacityLegend = true;
  public warehouseCapacityPlugins = [];

  // Pie Charts for zones
  public zoneLabels: Label[] = ['Unused Capacity', 'Used Capacity'];
  public zone1Data: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;


  barChartcustomColors =
    [
      { name: "2019", value: '#febb00' },
      { name: "2020", value: '#1dd068' },
      { name: "2021", value: '#1dd068' },
      { name: "2022", value: '#febb00' },
    ]
  barChartData = [
    { name: "2019", value: 30 },
    { name: "2020", value: 60 },
    { name: "2021", value: 96 },
    { name: "2022", value: 151 },
  ];
  colorScheme = ['#08DDC1', '#FFDC1B', '#FF5E3A']
  // Turn Over Days
  /*   public turnOverDaysLabels: Label[] = [];
    public turnOverDaysData: any = [
      { data: [], label: 'Quantities' }
    ];
   */
  // Sales Summary
  public salesSummaryLabels: Label[] = [];
  public salesSummaryData: any = [
    { data: [], label: 'Return Count' },
    { data: [], label: 'SO Count' }
  ];

  spaceUtilizationResponceLocationList: any = [];
  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private excelService: ExcelService,
    private reportsService: ReportsService, private completerService: CompleterService, private toastr: ToastrService,
    private fb: FormBuilder, private metaDataService: MetaDataService,
    private commonService: CommonService, private reportsCommonService: ReportsCommonService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
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
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createSpaceUtilizationyReportForm();
    this.fetchAllLocations();
    this.fetchAllZones();
    this.fetchAllRacks();
    this.fetchAllWarehouseDetails();
    this.fetchAllSuppliers();
    // this.fetchMetaData();
  }
  createSpaceUtilizationyReportForm() {
    this.spaceUtilizationReportForm = this.fb.group({
      zoneNames: [null],
      rackNames: [null],
      wareHouseNames: [null],
      locationNames: [null],
      supplierIDNames: [null]
    })
    this.spaceUtilizationReportForm.controls.wareHouseNames.setValue(this.configService.getWarehouse().wareHouseName);
    this.wmsService.spaceUtilizationWareHousepassing = this.configService.getWarehouse().wareHouseName
  }
  /*   fetchMetaData() {
      this.reportsCommonService.fetchAllSuppliers();
      this.reportsCommonService.supplierIDNameValues.subscribe(res => {
        this.supplierIDName = this.completerService.local(res);
      });
    } */
  supplierIDNames = [];
  fetchAllSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierIDNames = response.data.supplierMasters.map(x => x.supplierIDName)
        }
      })
  }
  zoneDropDownList = [];
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones) {
          this.zoneDropDownList = response.data.zones.map(x => x.zoneName)
            ;
        }
      },
      (error) => {
      });
  }
  rackDropDownList = [];
  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.rackDropDownList = response.data.racks.map(rack => rack.rackName);
        }
      },
      (error) => {
      });
  }
  warehousesList: any;
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.warehousesList = response.data.wareHouses;
          this.warehousesList = response.data.wareHouses.map(warehouse => warehouse.wareHouseName);

          this.rerender();
        } else {
          this.warehousesList = [];
        }
      },
      (error) => {
        this.warehousesList = [];
      });
  }

  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locationDropDownList = response.data.locations.map(locationname => locationname.locationName);;
        } else {
        }
      },
      (error) => {
      });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  fetchAllInventories() {
    this.wmsService.findAllInventories('', this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventories) {
          const bIn = response.data.inventories.filter(x => x.batchNumber != null);
          const sIn = response.data.inventories.filter(x => x.serialNumber != null);
          const dupBin = bIn ? bIn.map(x => x.batchNumber) : null;
          this.batchNumberIDs = this.removeDuplicates(dupBin);
          const dupsIn = sIn ? sIn.map(x => x.serialNumber) : null;
          this.serialNumberIDs = this.removeDuplicates(dupsIn);
        } else {
          this.batchNumberIDs = null;
          this.serialNumberIDs = null;
        }
      },
      (error) => {
        this.batchNumberIDs = null;
        this.serialNumberIDs = null;
      });
  }
  locationResponceObj: any;
  generate() {
    const spaceUtilizationFormReq = this.spaceUtilizationReportForm.value;
    spaceUtilizationFormReq["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName,
      spaceUtilizationFormReq["wareHouseID"] = this.configService.getWarehouse().wareHouseID,
      spaceUtilizationFormReq["wareHouseName"] = this.configService.getWarehouse().wareHouseName,
      spaceUtilizationFormReq["wareHouseNames"] = [this.configService.getWarehouse().wareHouseName]
    spaceUtilizationFormReq["organizationIDName"] = this.configService.getOrganization().organizationIDName,
      spaceUtilizationFormReq["organizationID"] = this.configService.getOrganization().organizationID,
      spaceUtilizationFormReq["organizationName"] = this.configService.getOrganization().organizationName,
      this.wmsService.spaceutilizationReportsFormDataPassing = spaceUtilizationFormReq
    this.reportsService.fetchAllSpaceutilizationReport(JSON.stringify(spaceUtilizationFormReq)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.spaceUtilization.locationsList) {
          this.spaceUtilizationResponceLocationList = response.data.spaceUtilization.locationsList;
          this.spaceUtilizationResponceList = response.data.spaceUtilization.spaceUtilizationResponses;
          this.locationResponceObj = response.data.spaceUtilization.locationDimensionsResponse
          this.wmsService.spaceutilizationReportsDisplayTableList = this.spaceUtilizationResponceLocationList;
          if (response.data.spaceUtilization.locationDimensionsResponse != null) {
            this.totalSpaceReqObj = response.data.spaceUtilization.locationDimensionsResponse.totalSpace ? response.data.spaceUtilization.locationDimensionsResponse.totalSpace : null
            this.wmsService.totalSpaceReqObjGetData = this.totalSpaceReqObj;
            this.totalSpaceUomReqObj = response.data.spaceUtilization.locationDimensionsResponse.totalSpaceUom ? response.data.spaceUtilization.locationDimensionsResponse.totalSpaceUom : null
            this.wmsService.totalSpaceUomReqObjGetData = this.totalSpaceUomReqObj;
            this.totalusableReqObj = response.data.spaceUtilization.locationDimensionsResponse.usableSpace ? response.data.spaceUtilization.locationDimensionsResponse.usableSpace : null
            this.wmsService.totalusableReqObjGetData = this.totalusableReqObj;
            this.totalUsuableSpaceUomReqObj = response.data.spaceUtilization.locationDimensionsResponse.usableSpaceUom ? response.data.spaceUtilization.locationDimensionsResponse.usableSpaceUom : null
            this.wmsService.totalUsuableSpaceUomReqObjGetData = this.totalUsuableSpaceUomReqObj;
          }
          else {
            this.totalSpaceReqObj = 0;
            this.totalSpaceUomReqObj = '';
            this.totalusableReqObj = 0;
            this.totalUsuableSpaceUomReqObj = '';
          }
          this.completeCountList = 0;
          this.partialAvailbleList = 0
          this.UnAvailableList = 0
          this.totalLocationCount = 0;
          if (this.spaceUtilizationResponceList != null) {
            this.completeCountList = 0;
            this.partialAvailbleList = 0
            this.UnAvailableList = 0
            this.totalLocationCount = 0;
            console.log(this.completeCountList)
            console.log(this.partialAvailbleList)
            console.log(this.UnAvailableList)
            console.log(this.totalLocationCount)
            const array = this.spaceUtilizationResponceList.map(x => x.locationSpaceStatus)
            if (array.includes('Completely Available')) {
              const completeCOunt = this.spaceUtilizationResponceList.find(x => x.locationSpaceStatus == 'Completely Available').locationsCount
              this.completeCountList = completeCOunt ? completeCOunt : 0
              this.wmsService.completeCounting = this.completeCountList;
              console.log(this.completeCountList);
            } else {
              this.completeCountList = 0
              this.wmsService.completeCounting = this.completeCountList;
            }
            if (array.includes('Partially Available')) {
              const partialAvailble = this.spaceUtilizationResponceList.find(x => x.locationSpaceStatus == 'Partially Available').locationsCount
              this.partialAvailbleList = partialAvailble ? partialAvailble : 0
              this.wmsService.partialCounting = this.partialAvailbleList;
            }
           else {
            this.partialAvailbleList = 0
            this.wmsService.partialCounting = this.partialAvailbleList;
          }
            if (array.includes('UnAvailable')) {
              const UnAvailable = this.spaceUtilizationResponceList.find(x => x.locationSpaceStatus == 'UnAvailable').locationsCount
              this.UnAvailableList = UnAvailable ? UnAvailable : 0
              this.wmsService.notAvailableCounting = this.UnAvailableList;
            }
            else {
              this.UnAvailableList = 0
              this.wmsService.notAvailableCounting = this.UnAvailableList;
            }
            this.totalLocationCount = DecimalUtils.add((DecimalUtils.add(this.completeCountList,this.partialAvailbleList)), this.UnAvailableList);
            this.wmsService.totalCountNumber = this.totalLocationCount;
            this.rerender();
            console.log(this.completeCountList)
            console.log(this.partialAvailbleList)
            console.log(this.UnAvailableList)
            console.log(this.totalLocationCount)
          }
        }
      })
    this.wmsService.spaceutilizationReportsDisplayTableList = this.spaceUtilizationResponceLocationList ? this.spaceUtilizationResponceLocationList : null
    this.wmsService.totalCountNumber = this.totalLocationCount ? this.totalLocationCount : null;
    this.wmsService.notAvailableCounting = this.UnAvailableList ? this.UnAvailableList : null
    this.wmsService.completeCounting = this.completeCountList ? this.completeCountList : null;
    this.wmsService.totalUsuableSpaceUomReqObjGetData = this.totalUsuableSpaceUomReqObj ? this.totalUsuableSpaceUomReqObj : null;
    this.spaceUtilizationResponceLocationList = [];
    this.rerender();
    this.completeCountList === 0;
    this.partialAvailbleList === 0;
    this.UnAvailableList === 0;
    this.totalLocationCount === 0;
    console.log(this.completeCountList)
    console.log(this.partialAvailbleList)
    console.log(this.UnAvailableList)
    console.log(this.totalLocationCount)
  }
  totalLocationCount: any;
  clear() {
    this.spaceUtilizationReportForm.reset();
    this.spaceUtilizationReportForm.controls.wareHouseNames.setValue(this.configService.getWarehouse().wareHouseName);
  }
  /*
  exportAsXLSX() {
    if (this.spaceUtilizationResponceList.length) {
      this.excelService.exportAsExcelFile(this.spaceUtilizationResponceList, 'Space utilization Report', null);
    } else {
      this.toastr.error('No data available');
    }
  } */
  exportAsXLSX() {
    const changedTaskList = this.exportTypeMethod(this.spaceUtilizationResponceLocationList)
    this.excelService.exportAsExcelFile(changedTaskList, 'Space Utilization Reports',
      Constants.EXCEL_IGNORE_FIELDS.SPACEUTILIZATIONREPORTS, this.locationResponceObj, this.spaceUtilizationResponceList);
  }
  exportTypeMethod(data) {
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        if (ele) {
          const obj = {}
          obj['Zone Name'] = ele.zoneInfo.zoneName
          obj['Rack Name'] = ele.rackInfo.rackName
          obj['Level Name'] = ele.levelInfo.levelName
          obj['Column Name'] = ele.columnInfo.columnName
          obj['Location Name'] = ele.locationName
          obj['Total Space'] = ele.totalSpace
          obj['Usable Space'] = ele.usableSpace
          obj['Location Space Status'] = ele.locationSpaceStatus
          arr.push(obj)
        }
        else {
          const obj = {}
          obj['Zone Name'] = null
          obj['Rack Name'] = null
          obj['Level Name'] = null
          obj['Column Name'] = null
          obj['Location Name'] = null
          obj['Total Space'] = null
          obj['Usable Space'] = null
          obj['Location Space Status'] = null
          arr.push(obj)
        }
      })
      return arr
    } else {
      const obj = {}
      obj['Zone Name'] = null
      obj['Rack Name'] = null
      obj['Level Name'] = null
      obj['Column Name'] = null
      obj['Location Name'] = null
      obj['Total Space'] = null
      obj['Usable Space'] = null
      obj['Location Space Status'] = null
      arr.push(obj)
    }
    return arr
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
  generatePDF() {
    if (this.spaceUtilizationResponceLocationList.length > 0) {
      if (this.permissionsList.includes("Update")) {
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        this.toastr.error("User Doesn't have permission");
      }
    }
    else {
      this.toastr.error("No Data to print");
    }
  }
}
