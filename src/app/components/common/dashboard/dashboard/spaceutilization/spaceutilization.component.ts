import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Constants } from 'src/app/constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../../shared/utils/storage';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-spaceutilization',
  templateUrl: './spaceutilization.component.html',
  styleUrls: ['./spaceutilization.component.scss']
})

export class SpaceutilizationComponent implements OnInit, OnDestroy {

  zone1: any = [{ name: 'Used Capacity', value: 'red' }, { name: 'Unused Capacity', value: 'red' }];
  zone2: any = [{ name: 'Used Capacity', value: 'red' }, { name: 'Unused Capacity', value: 'red' }];
  zone3: any = [{ name: 'Used Capacity', value: 'red' }, { name: 'Unused Capacity', value: 'red' }];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  // Pie Charts for zones
  public zoneLabels: Label[] = ['Unused Capacity', 'Used Capacity'];
  public zone1Data: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  // Warehouse Capacity
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };

  public pieChartPlugins: any = [];
  public warehouseCapacityLabels: Label[] = ['Completely Available ', 'Partially Available', 'Un-Available'];
  public warehouseCapacityData: SingleDataSet = [];
  public warehouseCapacityType: ChartType = 'pie';
  public warehouseCapacityLegend = true;
  // storagePopupData: any = [];
  locDimension: any = null;
  pieChartColors: any = [{
    backgroundColor: ['#08DDC1', '#FFDC1B', '#FF5E3A'],
  }];
  public warehouseCapacityPlugins = [];

  colorScheme = {
    domain: ['#08DDC1', '#FFDC1B', '#FF5E3A']
  };

  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;

  permissionsList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Space Utilization', 'Warehouse Capacity', Storage.getSessionUser());
  zoneCapacityPermissionList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Space Utilization', 'Zone Capacity', Storage.getSessionUser());
  zones: any;
  zoneNameArrayList: any = []
  dashboardArrayList: any = []
  xoneDashboardCount: any = []
  zoneDetailList: any;
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };
  // dataService: any = [];
  // supplierIDName: any;
  dataService: CompleterData;
  supplierIDName: any = null;
  utilizationHeader: any = null;
  arrValue: any = []
  countValue: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  constructor(
    private dashboardService: DashboardService, private configService: ConfigurationService,
    private wmsService: WMSService, private ngxSmartModalService: NgxSmartModalService,
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
    if (this.getRole()) {
      this.permissionsList = ['View', 'Update', 'Delete'];
      this.zoneCapacityPermissionList = ['View','Update','Delete'];
    }
    this.getFunctionsCall();
  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  getFunctionsCall() {
    // if (this.permissionsList.includes('View')) {
      this.fetchSuppliers();
      // this.fetchWarehouseDetails();
      // this.fetchWarehouseCapacity(this.configService.getWarehouse().wareHouseName);
      this.fetchSpaceutilizationDetails();
      this.fetchZonesCapacity();
    // }
  }

  fetchSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters.length) {
          this.dataService = response.data.supplierMasters.map(x => x.supplierIDName);
        } else {
        }
      },
      (error) => {
      });
  }
  fetchWarehouseDetails() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchWareHouseDetailsByID(Constants.WAREHOUSE_ID, this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse && response.data.wareHouse.address) {
          this.fetchWarehouseCapacity(response.data.wareHouse.wareHouseName)
        }
      },
      (error) => {
      });
  }
  onSupplierChange(event) {
    this.supplierIDName = event ? event.originalObject : null;
    this.fetchZonesCapacity();
  }
  fetchWarehouseCapacity(wareHouseName) {

    const data = [];
    this.dashboardService.fetchWarehouseCapacity(wareHouseName, this.formObj).subscribe(
      (response) => {

        if (response && response.status === 0 && response.data.wareHouseCapacity) {
          /*   data.push(response.data.wareHouseCapacity.wareHouseTotalLocations);
            data.push(response.data.wareHouseCapacity.wareHouseLoacationAvailable);
            this.warehouseCapacityData = data; */

        }
      },
      (error) => {
      });
  }

  getSpaceUtilizationResposeList: any;
  fetchSpaceutilizationDetails() {
    const data = {};
    data['organizationIDName'] = this.formObj.organizationIDName;
    data['wareHouseIDNames'] = [this.formObj.wareHouseIDName];
    data['supplierIDNames'] = this.supplierIDName ? [this.supplierIDName] : null;
    this.dashboardService.fetchSpaceUtilisationForGraphy(data).subscribe(
      (response) => {

        if (response && response.status === 0 && response.data.zoneSpaceUtilizations) {
          let comp = 0;
          let partial = 0;
          let unavail = 0;
          response.data.zoneSpaceUtilizations.forEach(innerElement => {
            innerElement.spaceUtilizationResponses.forEach(outerElement => {
              if (outerElement.locationSpaceStatus === 'Completely Available') {
                comp += outerElement.locationsCount;
              }
              if (outerElement.locationSpaceStatus === 'Partially Available') {
                partial += outerElement.locationsCount;
              }
              if (outerElement.locationSpaceStatus === 'UnAvailable') {
                unavail += outerElement.locationsCount;
              }
              //     if (outerElement.locationSpaceStatus == 'UnAvailable') {
              //       this.warehouseCapacityData[2] = outerElement.locationsCount;
              //     }
              //     else if (outerElement.locationSpaceStatus == 'Completely Available') {
              //       this.arrValue.push(outerElement.locationsCount)
              //     }
              //     else {
              //       this.warehouseCapacityData[1] = outerElement.locationsCount;
              //     }
              //     this.countValue = this.arrValue.reduce((total, number) => total + number)
              //     this.warehouseCapacityData[0] = this.countValue;
            })
          })
          // this.warehouseCapacityData = [5,1,2] [completely,parially,uncoa]
          this.warehouseCapacityData = [comp, partial, unavail]

        }
      })
  }
  getDimensions(data) {

    this.utilizationHeader = data.zoneName;
    this.locDimension = data.locationDimensionsResponse;
    this.ngxSmartModalService.getModal('utilPopup').open();
    // this.storagePopupData = [];
    // const store = data['data'].wareHouseLayoutSpaceUtilization.spaceUtilizationResponses;
    // const Available = store.find(x => x.locationSpaceStatus == 'Completely Available');
    // const Partial = store.find(x => x.locationSpaceStatus == 'Partially Available');
    // const UnAvaiable = store.find(x => x.locationSpaceStatus == 'UnAvailable');
    // if (Available) {
    //   this.storagePopupData.push(Available);
    // }
    // if (Partial) {
    //   this.storagePopupData.push(Partial);
    // }
    // if (UnAvaiable) {
    //   this.storagePopupData.push(UnAvaiable);
    // }
  }
  fetchZonesCapacity() {
    const data = {};
    data['organizationIDName'] = this.formObj.organizationIDName;
    data['wareHouseIDNames'] = [this.formObj.wareHouseIDName];
    data['supplierIDNames'] = this.supplierIDName ? [this.supplierIDName] : null;
    this.dashboardService.fetchSpaceUtilisationForGraphy(data).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zoneSpaceUtilizations) {
          const finalArray = response.data.zoneSpaceUtilizations;
          this.zoneNameArrayList = [];
          finalArray.forEach(element => {
            let obj = {};
            obj['zoneName'] = element.zoneName;
            obj['locationDimensionsResponse'] = element.locationDimensionsResponse;
            obj['zoneDashboard'] = [];
            if (element.spaceUtilizationResponses && element.spaceUtilizationResponses.length > 0) {
              element.spaceUtilizationResponses.forEach(el => {
                if (el.locationSpaceStatus == 'Completely Available') {
                  obj['zoneDashboard'].push({ name: 'Completely Available', value: el.locationsCount })
                }
                else{
                  obj['zoneDashboard'].push({ name: 'Completely Available', value: 0 })
                }
                if (el.locationSpaceStatus == 'Partially Available') {
                  obj['zoneDashboard'].push({ name: 'Partially Available', value: el.locationsCount })
                }
                else{
                  obj['zoneDashboard'].push({ name: 'Partially Available', value: 0 })
                }
                if (el.locationSpaceStatus == 'UnAvailable') {
                  obj['zoneDashboard'].push({ name: 'UnAvailable', value: el.locationsCount })
                }
                else{
                  obj['zoneDashboard'].push({ name: 'UnAvailable', value: 0 })
                }
              });
            }
            this.zoneNameArrayList.push(obj);
          });

          //   response.data.zoneSpaceUtilizations.forEach(zone => {
          //    let names = {}
          //    names = zone.zoneName
          //     this.zoneNameArrayList.push(names);
          //     this.zoneDetailList = zone.spaceUtilizationResponses
          //     let aryList = []
          //    zone.spaceUtilizationResponses.forEach(innerZone =>{
          //     let objListComp = {}
          //     let objListPartial = {}
          //     let objListUnavailable = {}
          //     objListComp = {name:innerZone.locationSpaceStatus,value: innerZone.locationsCount}
          //           aryList.push(objListComp)
          //     // switch(innerZone.locationSpaceStatus){
          //     //   case "Completely Available":
          //     //     //
          //     //       objListComp = {name:innerZone.locationSpaceStatus,value: innerZone.locationsCount}
          //     //       aryList.push(objListComp)
          //     //       break;
          //     //   case "Partially Available":
          //     //    //
          //     //     objListPartial ={name:innerZone.locationSpaceStatus, value: innerZone.locationsCount}
          //     //     aryList.push(objListPartial)
          //     //   break;
          //     //   case "UnAvailable":
          //     //
          //     //     objListUnavailable ={name:innerZone.locationSpaceStatus, value: innerZone.locationsCount}
          //     //     aryList.push(objListUnavailable)
          //     //   break;
          //     //   default:
          //     //     objListComp = {};
          //     //     objListPartial={};
          //     //     objListUnavailable={}
          //     // }
          //  //

          //     this.zoneDashboard.push(aryList)
          //   //

          //   });
          // })
        }
      },
      (error) => {
      });
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
}

/* import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { Subject, forkJoin } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { WmsCommonService } from 'src/app/services/wms-common.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ToastrService } from 'ngx-toastr';
import { Constants } from 'src/app/constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../../shared/utils/storage';

@Component({
  selector: 'app-spaceutilization',
  templateUrl: './spaceutilization.component.html',
  styleUrls: ['./spaceutilization.component.scss']
})

export class SpaceutilizationComponent implements OnInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  // Pie Charts for zones
  public zoneLabels: Label[] = ['Unused Capacity', 'Used Capacity'];
  public zone1Data: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
   // Warehouse Capacity
   public pieChartOptions: ChartOptions = {
    responsive: true,
  };

  public pieChartPlugins: any = [];
  public warehouseCapacityLabels: Label[] = ['Total Locations', 'Available Locations'];
  public warehouseCapacityData: SingleDataSet = [];
  public warehouseCapacityType: ChartType = 'pie';
  public warehouseCapacityLegend = true;
  pieChartColors: any = [{
    backgroundColor: ['rgba(0,0,255,0.3)', 'rgba(255,0,0,0.3)'],
  }];
  public warehouseCapacityPlugins = [];
  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;
  permissionsList = this.configService.getPermissionsForDashboard('kpiConfigurationFunctionalities', 'Overall Dashboard', 'Purchase Orders', Storage.getSessionUser());
  constructor(
    private dashboardService: DashboardService, private configService: ConfigurationService,
    private wmsCommonService: WmsCommonService,
    private wmsService: WMSService,
    private toastr: ToastrService) { }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
  this.getFunctionsCall();
  }
  getFunctionsCall(){
    if (this.permissionsList.includes('View')) {
      this.fetchWarehouseDetails();
      this.fetchWarehouseCapacity(this.configService.getWarehouse().wareHouseName);
      this.fetchSpaceutilizationDetails();
    }
  }
  fetchWarehouseDetails() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchWareHouseDetailsByID(Constants.WAREHOUSE_ID,this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse && response.data.wareHouse.address) {

          this.fetchWarehouseCapacity(response.data.wareHouse.wareHouseName)
        }
      },
      (error) => {
      });
  }

  fetchWarehouseCapacity(wareHouseName) {

    const data = [];
    this.dashboardService.fetchWarehouseCapacity(wareHouseName, this.formObj).subscribe(
      (response) => {

        if (response && response.status === 0 && response.data.wareHouseCapacity) {
          data.push(response.data.wareHouseCapacity.wareHouseTotalLocations);
          data.push(response.data.wareHouseCapacity.wareHouseLoacationAvailable);
          this.warehouseCapacityData = data;
        }
      },
      (error) => {
      });
  }

  getSpaceUtilizationResposeList:any;
  fetchSpaceutilizationDetails() {
    this.dashboardService.fetchSpaceUtilisationForGraphy({},this.formObj).subscribe(
      (response) => {

        if (response && response.status === 0 && response.data.wareHouseLayoutSpaceUtilization) {
          this.getSpaceUtilizationResposeList = response.data.wareHouseLayoutSpaceUtilization

          this.getSpaceUtilizationResposeList.spaceUtilizationResponses.forEach({

          })
        }
      })
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
}

 */
