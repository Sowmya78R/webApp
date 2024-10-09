import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-picking-history',
  templateUrl: './picking-history.component.html',
  styleUrls: ['./picking-history.component.scss']
})
export class PickingHistoryComponent implements OnInit {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  pickingPlanningForm: FormGroup;
  locationIDs: CompleterData;
  locations: any;
  userValues: any;
  userIDs: CompleterData;
  zoneIDs: CompleterData;
  wmsoIDs: CompleterData;
  wareHouseTeamsListIDs: CompleterData;
  pickingsList: any = [];
  selectAllCheckboxValue: boolean = false;
  usersList: any;
  statuss: any = ['Active', 'In Active'];
  selectedDocuments: any = [];
  WMSOs: any = [];
  formObj = this.configService.getGlobalpayload();
  assignedEmployeeIDName: any;
  // permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Workforce Picking', Storage.getSessionUser());
  permissionsList = ['View', 'Create', 'Update', 'Delete'];
  forPermissionsSubscription: any;
  reqobj: any;
  thirdPartyCustomersCheckAllocation: any = 'No';
  completionDate: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  overAllSO: any = [];
  wmsoFilteredObj: any = null;
  customerIDs: CompleterData;
  productIDs: CompleterData;
  orderTypeDropdown = ['Sales Order', 'Purchase Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns', 'Replacement Order'];
  supplierIds: any = [];
  wareHouseIds: any = [];
  storageValues: any = null;
  putawayQCConfig: any = 'No';
  page: number = 1;
  itemsPerPage = 5;
  totalItems: any = null;
  searchKey: any = null;
  subscription: Subscription;
  @Input() item = '';
  valueimg: any;
  fetchUserLoginIDName: any;

  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private wmsService: WMSService, private metaDataService: MetaDataService, private commonmasterdataservice: CommonMasterDataService,
    private toastr: ToastrService, private IBMDService: InboundMasterDataService, private datepipe: DatePipe,
    private translate: TranslateService, private router: Router) {
    this.translate.use(this.language);
    this.createPickingPlanningForm();
    this.subscription = null
    if (this.router.url.includes(`/employeeTask/employeeTaskpicking`)) {

      this.subscription = this.wmsService.selectedValueSubject.subscribe((data) => {
        if (data) {
          this.valueimg = data;
          if (this.router.url.includes(`/employeeTask/employeeTaskpicking`)) {
            this.getCallDataOnDropDownChange(this.valueimg)
          }
          this.item = this.valueimg
        } else {
          const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
          this.fetchUserLoginIDName = loginUserRole;
          this.getCallDataOnPageLoad();
        }
      });
    }
  }
  getCallDataOnDropDownChange(user) {
    const inputData = {
      "zoneName": null,
      "locationName": null,
      "executiveIDName": user,
      "page": 1,
      "pageSize": 5,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPickingPlanningTableData(1, inputData);
  }
  getCallDataOnPageLoad() {
    const inputData = {
      "zoneName": null,
      "locationName": null,
      "page": 1,
      "pageSize": 5,
      "executiveIDName": this.fetchUserLoginIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPickingPlanningTableData(1, inputData);
  }


  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.getFunctionsCall();
  }
  makeThisDisable: boolean;
  showTooltip: any = false;

  getFunctionsCall() {
    // if (this.permissionsList.includes('View')) {
    this.disableField();
    this.fetchAllZones();
    this.getAllUsers();
    this.fetchAllExecutionIDName();
    this.storageValues = sessionStorage.getItem('idInfos');
    this.fetchAllWarehouseTeams();
    this.fetchAllCustomers();
    this.fetchAllProducts();
    if (sessionStorage.getItem('historyRoute').includes('employeeSchedule/putawayPlanning')) {
      this.fetchwmsoNumbers(this.storageValues ? JSON.parse(this.storageValues).orderType : 'Sales Order');
      this.fetchAllPickingPlanningTableData(1);
    }
    else {
      this.fetchwmsoNumbers('Sales Order','key');
 
    }
  }
  // ngAfterViewInit(): void {
  //   this.dtTrigger.next();
  // }
  disableField() {
    if (this.permissionsList.includes('Update')) {
      this.makeThisDisable = false
    }
    else {
      this.makeThisDisable = true
    }
  }

  // fetchPutawayQCConfig() {
  //   this.metaDataService.findAllPutawayQCConfig(this.formObj).subscribe(res => {
  //     if (res.status == 0 && res.data.putawayQualityCheckConfigurations && res.data.putawayQualityCheckConfigurations.length > 0) {
  //       this.putawayQCConfig = res.data.putawayQualityCheckConfigurations[0].qualityCheck;
  //     }
  //     else {
  //       this.putawayQCConfig = "No";
  //     }
  //   })
  // }

  fetchAllCustomers() {
    this.IBMDService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.customers.length > 0) {
          // this.customers = response.data.customers;
          this.customerIDs = response.data.customers.map(x => x.customerIDName);
        } else {
          // this.customers = [];
        }
      },
      (error) => {
        // this.customers = [];
      });
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (r) => {
        if (r && r.status === 0 && r.data.supplierMasters) {
          this.supplierIds = r.data.supplierMasters.map(x => x.supplierIDName);
        }
      })
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseIds = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          // this.productsData = response.data.productMasters;
          this.productIDs = response.data.productMasters.map(x => x.productIDName);
        } else {
          // this.productsData = [];
        }
      },
      (error) => {
        // this.productsData = [];
      });
  }

  createPickingPlanningForm() {
    this.pickingPlanningForm = this.fb.group({
      _id: this.fb.array([]),
      wmsoNumber: [null],
      zoneName: [null],
      locationName: [null],
      executiveIDName: [null],
      fullWmsoNumber: null,
      orderType: 'Sales Order',
      wmsoNumberPrefix: null,
      customerIDName: null,
      productIDName: null,
      supplierIDName: null,
      wareHouseTransferDestinationInfoWareHouseIDName: null
    })
  }
  fetchwmsoNumbers(oType, FromFE?) {
    this.pickingPlanningForm.controls.fullWmsoNumber.setValue(null);
    this.pickingPlanningForm.controls.wmsoNumberPrefix.setValue(null);
    this.pickingPlanningForm.controls.wmsoNumber.setValue(null);
    this.WMSOs = [];
    this.pickingsList = [];
    const data = JSON.parse(JSON.stringify(this.formObj));
    data['customerID'] = null;
    data['orderType'] = oType;

    this.wmsService.fetchAllPickings(data).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickings.length > 0) {
          this.overAllSO = response.data.pickings;
          this.getWMSOS(response.data.pickings);
        } else {
          this.overAllSO = [];
          this.getWMSOS(null);
        }
        if (this.storageValues && !FromFE) {
          this.pickingPlanningForm.controls.orderType.setValue(JSON.parse(this.storageValues).orderType);
          this.pickingPlanningForm.controls.wmsoNumber.setValue(JSON.parse(this.storageValues).fullWmsoNumber);
          this.setWmsoNumber(JSON.parse(this.storageValues).fullWmsoNumber);
        }
        else {
          this.setWmsoNumber();
        }
      },
      (error) => {
      });
  }

  getWMSOS(data) {
    this.WMSOs = [];
    if (data) {
      data.forEach(line => {
        if (line.fullWmsoNumber && this.WMSOs.indexOf(line.fullWmsoNumber) === -1) {
          this.WMSOs.push(line.fullWmsoNumber);
        }
      });
    }
  }
  setWmsoNumber(event?) {
    if (event) {
      this.wmsoFilteredObj = this.overAllSO.find(x => x.fullWmsoNumber == event);
    }
    else {
      this.wmsoFilteredObj = null;
    }
  }




  getAllUsers() {
    this.commonmasterdataservice.fetchUserDetailsByRoleInfo().subscribe(data => {
      if (data.status == 0 && data.data.users && data.data.users.length > 0) {
        this.usersList = data.data.users;
        this.userIDs = this.usersList.map(x => x.userIDName);
      }
      else {
        this.usersList = [];
      }
    })
  }


  resetOnly() {
    this.createPickingPlanningForm();
    this.pickingPlanningForm.controls.orderType.setValue('Sales Order');
    this.pickingsList = [];
    this.totalItems = null;
  }

  wareHouseTeamsList: any;
  fetchAllExecutionIDName() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    form["workType"] = "Picking"

    this.commonmasterdataservice.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
  }
  warehouseTeams: any;
  fetchAllWarehouseTeams() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    form["workType"] = "Picking"
    this.commonmasterdataservice.fetchAllWarehouseTeams(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.warehouseTeams = response.data.wareHouseTeams;
        }
      })
  }


  getDataForFilters(page) {
    this.selectAllCheckboxValue = false;
    this.selectedDocuments = [];
    this.fetchAllPickingPlanningTableData(page);
  }
  fetchAllPickingPlanningTableData(page, payload?) {
    this.wmsService.pickingTableData = [];
    const oType = this.pickingPlanningForm.controls.orderType.value;
    const inputData = {
      "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
      "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
      "wmsoNumberPrefix": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumberPrefix : null,
      "orderType": oType,
      "zoneName": this.pickingPlanningForm.controls.zoneName.value,
      "locationName": this.pickingPlanningForm.controls.locationName.value,
      "executiveIDName": this.pickingPlanningForm.controls.executiveIDName.value,
      "productIDName": this.pickingPlanningForm.controls.productIDName.value,
      "customerIDName": this.pickingPlanningForm.controls.customerIDName.value,
      "supplierIDName": this.pickingPlanningForm.controls.supplierIDName.value,
      "wareHouseTransferDestinationInfoWareHouseIDName": this.pickingPlanningForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.value,
      "page": page ? page : this.page,
      "pageSize": this.itemsPerPage,
    }
    if ((sessionStorage.getItem('historyRoute').includes('employeeSchedule/pickingPlanning')) || (inputData.orderType && inputData.fullWmsoNumber)) {
      this.wmsService.pickingfieldsData = inputData
      const final = Object.assign(inputData, this.formObj);

      this.wmsService.fetchAllPickingManagement(payload ? payload : final).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.pickingManagementPaginationResponse.pickingManagements.length > 0) {
            this.pickingsList = this.frameJSON(response.data.pickingManagementPaginationResponse.pickingManagements);
            this.totalItems = response.data.pickingManagementPaginationResponse.totalElements;
          }
          else {
            this.pickingsList = [];
          }
        },
        (error) => {
        });
    }
    else {
      this.toastr.error('Enter Manditory');
      this.pickingsList = [];
    }
  }

  frameJSON(data) {
    let arr = [];
    const dummyData = JSON.parse(JSON.stringify(data));
    dummyData.forEach(element => {
      element.plannedCompletionDate = element.plannedCompletionDate ? this.datepipe.transform(new Date(element.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null;
      element.isChecked = false;
      arr.push(element);
    });
    return arr
  }

  fetchAllLocations() {
    this.pickingPlanningForm.controls.locationName.setValue(null);
    this.wmsService.fetchAllLocations(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locations = response.data.locations;
          const locationFilter = response.data.locations.filter(z => z.zoneInfo.zoneName ===
            this.pickingPlanningForm.controls.zoneName.value)
          this.locationIDs = locationFilter.map(b => b.locationName)
        } else {
          this.locations = [];
        }
      },
      (error) => {
        this.locations = [];
      });
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones.length > 0) {
          this.zoneIDs = response.data.zones.map(zonename => zonename.zoneName);
        }
      },
      (error) => {
      });
    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
  }


}
