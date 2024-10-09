import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { Subject, Subscription } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InternaltransfersService } from 'src/app/services/integration-services/internaltransfers.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { WmsCommonService } from 'src/app/services/wms-common.service';

@Component({
  selector: 'app-employeenewtask',
  templateUrl: './employeenewtask.component.html',
  styleUrls: ['./employeenewtask.component.scss']
})
export class EmployeenewtaskComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;

  formObj = this.configService.getGlobalpayload();
  wareHouseTeamsList: any = []
  wareHouseTeamsListIDs: CompleterData;
  employeeTaskForm: FormGroup;
  searchstr: any
  fetchUserLoginIDName: any;
  subs: Subscription;
  currentItem: any = null;
  showDropdown: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  data: any

  megaGlobalEvent: any;
  constructor(private configService: ConfigurationService, private commonDataService: CommonMasterDataService,
    private fb: FormBuilder, private wmsCommonService: WmsCommonService,
    private translate: TranslateService, private wmsService: WMSService, private internaltransfersService: InternaltransfersService) {
    this.translate.use(this.language);
    this.wmsService.data$.subscribe(data => {
      this.data = JSON.stringify(data)
      if (data) {
        this.fetchEmployeeTaskPutaway(data.currentUser);
        this.fetchEmployeeTaskPicking(data.currentUser);
        this.fetchEmployeeTaskInternalTransfer(this.globalEvent);
        this.fetchEmployeeTaskPacking(this.globalEvent);
        this.fetchEmployeeTaskCopacking(this.globalEvent);
        this.fetchEmployeeTaskRepacking(this.globalEvent);
        this.fetchEmployeeTaskLabeling(this.globalEvent);
        this.fetchEmployeeTaskLoading(this.globalEvent);
        this.fetchEmployeeTaskUnLoading(this.globalEvent);

      }
    });
  }

  ngOnInit(): void {
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole;
    this.currentItem = this.fetchUserLoginIDName;
    const navLinks = this.wmsCommonService.getNavigationLinksWithRoutes(this.configService.getModulesList('mainFunctionalities'));
    const workForceModule = navLinks.find(x => x.name == 'Workforce');
    if (workForceModule && workForceModule.subFunctionalities.length) {
      const sub = workForceModule.subFunctionalities.find(x => x.name == 'Workforce Putaway' || x.name == 'Workforce Picking' || x.name == 'Workforce Internal Transfer' || x.name == 'Workforce Packing' || x.name == 'Workforce Re-Packing' || x.name == 'Workforce Labeling' || x.name == 'Workforce Loading' || x.name == 'Workforce Unloading' || x.name == 'Workforce Co-Packing' || x.name == 'Employee Tasks');
      this.showDropdown = sub ? true : false;
    }
    this.fetchAllExecutionIDName();
    this.createEmployeeNewTaskForm();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.fetchDefaultEmployeeTaskPutaway();
    this.fetchDefaultEmployeeTaskPicking();
    this.fetchDefaultEmployeeTaskInternalTransfer();
    this.fetchDefaultEmployeeTaskPacking();
    this.fetchDefaultEmployeeTaskCopacking();
    this.fetchDefaultEmployeeTaskRepacking();
    this.fetchDefaultEmployeeTaskLabeling();
    this.fetchDefaultEmployeeTaskLoading();
    this.fetchDefaultEmployeeTaskUnLoading();
    // this.onEmployeeChange(this.currentItem);
    this.wmsService.selectedValueSubject.next(this.currentItem);

  }
  createEmployeeNewTaskForm() {
    this.employeeTaskForm = this.fb.group({
      assignedTos: this.fetchUserLoginIDName
    })
  }
  fetchAllExecutionIDName() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    form["workType"] = "Picking"
    this.commonDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
        }
      })
  }

  labellingData: any;
  rePackingData: any;
  coPackingData: any;
  packingData: any;
  pickingsList: any;
  putAwaysList: any;
  globalEvent: any;
  onEmployeeChange(event) {
    this.globalEvent = event.target.value
    this.wmsService.selectedValueSubject.next(event.target.value);
    this.fetchEmployeeTaskPutaway(event.target.value)
    this.fetchEmployeeTaskPicking(event.target.value)
    this.fetchEmployeeTaskInternalTransfer(event.target.value)
    this.fetchEmployeeTaskPacking(event.target.value)
    this.fetchEmployeeTaskCopacking(event.target.value)
    this.fetchEmployeeTaskRepacking(event.target.value)
    this.fetchEmployeeTaskLabeling(event.target.value)
    this.fetchEmployeeTaskLoading(event.target.value)
    this.fetchEmployeeTaskUnLoading(event.target.value)

  }
  fetchDefaultEmployeeTaskPutaway() {

    const reqPutawayObj = {
      executiveIDName: this.fetchUserLoginIDName,
      locationName: null,
      zoneName: null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "page": 1,
      "pageSize": 5
    }
    this.putAwaysList = [];
    this.wmsService.fetchAllPutAwayPlanningTableData(reqPutawayObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putawayPaginationResponse.putaways) {
          this.arr[0].totalength = response.data.putawayPaginationResponse.totalElements;
        }
        else {
          this.arr[0].totalength = "0";
        }
      },
      (error) => {
      });
  }
  fetchDefaultEmployeeTaskPicking() {
    const inputData = {
      "zoneName": null,
      "locationName": null,
      "executiveIDName": this.fetchUserLoginIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.pickingsList = [];
    this.wmsService.fetchAllPickingPlanningTableData(inputData).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickings) {
          this.pickingsList = response.data.pickings;
          this.arr[1].totalength = this.pickingsList.length

        }
        else {
          this.pickingsList = [];

        }
      },
      (error) => {
      });
  }

  fetchDefaultEmployeeTaskInternalTransfer() {
    const internalTransferReq = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Transfers",
      "status": "Approved",
      "assignedTos": [this.fetchUserLoginIDName]
    }
    this.itData = [];
    this.internaltransfersService.fetchAllTransferPlanning(internalTransferReq).subscribe(res => {
      if (res['status'] == 0 && res['data']['internalTransfers']) {
        this.itData = res['data']['internalTransfers'];
        this.arr[2].totalength = this.itData.length;
      }
      else {
        this.itData = [];
      }

    })
  }

  fetchDefaultEmployeeTaskPacking() {
    const reqPackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Packing",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName]
    }
    this.packingData = [];
    this.internaltransfersService.fetchAllPlanningPacking(reqPackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.packingData = this.linesFraming(res['data']['shipmentOrders']);
        this.arr[3].totalength = this.packingData.length;
      }
      else {
        this.packingData = [];

      }
    })
  }
  linesFraming(json) {
    const shipmentOrders = json;
    const products = [];
    if (shipmentOrders) {
      shipmentOrders.forEach((so) => {
        for (const key in so) {
          if (so.shipmentOrderLines && key === 'shipmentOrderLines') {
            so[key].forEach(a => {
              a.headerID = so._id;
              a.wmsoNumber = so.wmsoNumber;
              a.isChecked = false;
              a.packingInfo.status = 'Open';
              products.push(a);
            });
          }
        }
      });
      return products
    }
  }

  fetchDefaultEmployeeTaskCopacking() {
    const CoPacking = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Co-Packing",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName]
    }
    this.coPackingData = [];
    this.internaltransfersService.fetchAllPlanningCoPacking(CoPacking).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.coPackingData = this.linesFramingCoPacking(res['data']['shipmentOrders']);
        this.arr[4].totalength = this.coPackingData.length;

      }
      else {
        this.coPackingData = [];
      }
    })
  }
  fetchDefaultEmployeeTaskRepacking() {
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole;
    const reqRePackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Repacking",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName]
    }
    this.rePackingData = [];
    this.internaltransfersService.fetchAllPlanningRePacking(reqRePackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.rePackingData = this.linesFramingRepacking(res['data']['shipmentOrders']);
        this.arr[5].totalength = this.rePackingData.length;
      }
      else {
        this.rePackingData = [];

      }
    })
  }
  itData: any;
  fetchDefaultEmployeeTaskLabeling() {
    const lebellingPlanning = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Labeling",
      "status": "Open",
      "assignedTos": [this.fetchUserLoginIDName]
    }
    this.labellingData = [];
    this.internaltransfersService.fetchAllPlanningLabelling(lebellingPlanning).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders'].length > 0) {
        this.labellingData = this.linesFramingLabelling(res['data']['shipmentOrders']);
        this.arr[6].totalength = this.labellingData.length;

      }
      else {
        this.labellingData = [];

      }
    })
  }
  loadingList: any;
  fetchDefaultEmployeeTaskLoading() {
    const form = {
      "organizationIDName": this.configService.getGlobalpayload().organizationIDName,
      "wareHouseIDName": this.configService.getGlobalpayload().wareHouseIDName,
      "assignedTos": [this.fetchUserLoginIDName],
      "status": "GATE IN",
      "noteType": "Outward Shipment"
    }
    this.loadingList = [];
    this.internaltransfersService.fetchGRNEmployeeTask(form).subscribe(res => {
      if (res.status == 0 && res.data.goodsReceiptNotes) {
        this.loadingList = res.data.goodsReceiptNotes.filter(x => !x.endDate)
        this.arr[7].totalength = this.loadingList.length
      }
      else {
        this.loadingList = [];
      }
    })
  }
  fetchDefaultEmployeeTaskUnLoading() {
    const form = {
      "organizationIDName": this.configService.getGlobalpayload().organizationIDName,
      "wareHouseIDName": this.configService.getGlobalpayload().wareHouseIDName,
      "assignedTos": [this.fetchUserLoginIDName],
      "status": "GATE IN",
      "noteType": "Inward Shipment"
    }
    this.internaltransfersService.fetchGRNEmployeeTask(form).subscribe(res => {
      if (res.status == 0 && res.data.goodsReceiptNotes) {
        this.loadingList = res.data.goodsReceiptNotes
        this.loadingList = res.data.goodsReceiptNotes.filter(x => !x.endDate)
        this.arr[8].totalength = this.loadingList.length
      }
      else {
        this.loadingList = [];
      }
    })
  }

  /* On User Call Details  */
  fetchEmployeeTaskPutaway(user) {
    const reqPutawayObj = {
      executiveIDName: user,
      locationName: null,
      zoneName: null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "page": 1,
      "pageSize": 5
    }
    console.log(reqPutawayObj);
    this.wmsService.fetchAllPutAwayPlanningTableData(reqPutawayObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putawayPaginationResponse.putaways) {
          this.arr[0].totalength = response.data.putawayPaginationResponse.totalElements;
        }
        else {
          this.arr[0].totalength = "0";
        }
      },
      (error) => {
      });
  }
  fetchEmployeeTaskPicking(user) {
    const inputData = {
      "zoneName": null,
      "locationName": null,
      "executiveIDName": user,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.pickingsList = [];
    this.wmsService.fetchAllPickingPlanningTableData(inputData).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickings) {
          this.pickingsList = response.data.pickings;
          this.arr[1].totalength = this.pickingsList.length
          this.dtTrigger.next();
        }
        else {
          this.pickingsList = [];

        }
      },
      (error) => {
      });
  }
  fetchEmployeeTaskInternalTransfer(user) {
    const internalTransferReq = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Transfers",
      "status": "Approved",
      "assignedTos": [user]
    }
    this.itData = [];
    this.internaltransfersService.fetchAllTransferPlanning(internalTransferReq).subscribe(res => {
      if (res['status'] == 0 && res['data']['internalTransfers']) {
        this.itData = res['data']['internalTransfers'];
        this.arr[2].totalength = this.itData.length;
      }
      else {
        this.itData = [];
      }
    })
  }

  fetchEmployeeTaskPacking(user) {
    const reqPackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Packing",
      "status": "Open",
      "assignedTos": [user]
    }
    this.packingData = []
    this.internaltransfersService.fetchAllPlanningPacking(reqPackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.packingData = this.linesFramingPacking(res['data']['shipmentOrders']);
        this.arr[3].totalength = this.packingData.length
      }
      else {
        this.packingData = []

      }
    })
  }

  linesFramingPacking(json) {
    const shipmentOrders = json;
    const products = [];
    if (shipmentOrders) {
      shipmentOrders.forEach((so) => {
        for (const key in so) {
          if (so.shipmentOrderLines && key === 'shipmentOrderLines') {
            so[key].forEach(a => {
              a.headerID = so._id;
              a.wmsoNumber = so.wmsoNumber;
              a.isChecked = false;
              a.packingInfo.status = 'Open';
              products.push(a);
            });
          }
        }
      });
      return products
    }
  }
  fetchEmployeeTaskCopacking(user) {
    const CoPacking = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Co-Packing",
      "status": "Open",
      "assignedTos": [user]
    }
    this.coPackingData = [];
    this.internaltransfersService.fetchAllPlanningCoPacking(CoPacking).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.coPackingData = this.linesFramingCoPacking(res['data']['shipmentOrders']);
        this.arr[4].totalength = this.coPackingData.length;
      }
      else {
        this.coPackingData = [];

      }
    })
  }
  linesFramingCoPacking(json) {
    const shipmentOrders = json;
    const products = [];
    if (shipmentOrders) {
      shipmentOrders.forEach((so) => {
        for (const key in so) {
          if (so.shipmentOrderLines && key === 'shipmentOrderLines') {
            so[key].forEach(a => {
              a.headerID = so._id;
              a.wmsoNumber = so.wmsoNumber;
              a.isChecked = false;
              a.coPackingInfo.status = 'Open';
              products.push(a);
            });
          }
        }
      });
      return products
    }
  }
  fetchEmployeeTaskRepacking(user) {
    const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
    this.fetchUserLoginIDName = loginUserRole;

    const reqRePackingObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Repacking",
      "status": "Open",
      "assignedTos": [user]
    }
    this.rePackingData = [];
    this.internaltransfersService.fetchAllPlanningRePacking(reqRePackingObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        // this.rePackingData =res['data']['shipmentOrders'];
        this.rePackingData = this.linesFramingRepacking(res['data']['shipmentOrders']);
        this.arr[5].totalength = this.rePackingData.length
      }
      else {
        this.rePackingData = [];

      }
    })
  }
  linesFramingRepacking(json) {
    const shipmentOrders = json;
    const products = [];
    if (shipmentOrders) {
      shipmentOrders.forEach((so) => {
        for (const key in so) {
          if (so.shipmentOrderLines && key === 'shipmentOrderLines') {
            so[key].forEach(a => {
              a.headerID = so._id;
              a.wmsoNumber = so.wmsoNumber;
              a.isChecked = false;
              a.rePackingInfo.status = 'Open';
              products.push(a);
            });
          }
        }
      });
      return products
    }
  }


  fetchEmployeeTaskLabeling(user) {
    const lebellingPlanning = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "workType": "Labeling",
      "status": "Open",
      "assignedTos": [user]
    }
    this.labellingData = [];
    this.internaltransfersService.fetchAllPlanningLabelling(lebellingPlanning).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.labellingData = this.linesFramingLabelling(res['data']['shipmentOrders']);
        this.arr[6].totalength = this.labellingData.length
      }
      else {
        this.labellingData = [];

      }
    })

  }

  linesFramingLabelling(json) {
    const shipmentOrders = json;
    const products = [];
    if (shipmentOrders) {
      shipmentOrders.forEach((so) => {
        for (const key in so) {
          if (so.shipmentOrderLines && key === 'shipmentOrderLines') {
            so[key].forEach(a => {
              a.headerID = so._id;
              a.wmsoNumber = so.wmsoNumber;
              a.isChecked = false;
              if (a.labelingInfo) {
                a.labelingInfo['status'] = 'Open';
              }
              else {
                a.labelingInfo = {};
                a.labelingInfo['status'] = 'Open'
              }
              products.push(a);
            });
          }
        }
      });
      return products
    }
  }
  fetchEmployeeTaskLoading(user) {
    const form = {
      "organizationIDName": this.configService.getGlobalpayload().organizationIDName,
      "wareHouseIDName": this.configService.getGlobalpayload().wareHouseIDName,
      "assignedTos": [user],
      "status": "GATE IN",
      "noteType": "Outward Shipment"
    }
    this.loadingList = [];
    this.internaltransfersService.fetchGRNEmployeeTask(form).subscribe(res => {
      if (res.status == 0 && res.data.goodsReceiptNotes) {
        this.loadingList = res.data.goodsReceiptNotes
        this.loadingList = res.data.goodsReceiptNotes.filter(x => !x.endDate)
        this.arr[7].totalength = this.loadingList.length
      }
      else {
        this.loadingList = [];
      }
    })
  }
  fetchEmployeeTaskUnLoading(user) {
    const form = {
      "organizationIDName": this.configService.getGlobalpayload().organizationIDName,
      "wareHouseIDName": this.configService.getGlobalpayload().wareHouseIDName,
      "assignedTos": [user],
      "status": "GATE IN",
      "noteType": "Inward Shipment"
    }
    this.loadingList = [];
    this.internaltransfersService.fetchGRNEmployeeTask(form).subscribe(res => {
      if (res.status == 0 && res.data.goodsReceiptNotes) {
        this.loadingList = res.data.goodsReceiptNotes.filter(x => !x.endDate)
        this.arr[8].totalength = this.loadingList.length

      }
      else {
        this.loadingList = [];
      }
    })
  }
  arr = [{ name: 'Putaway', link: 'employeeTaskputaway', img: 'assets/subMenusIcons/Putaway.svg' },
  { name: 'Picking', link: 'employeeTaskpicking', img: 'assets/subMenusIcons/Picking.svg' },
  { name: 'Transfer', link: 'employeeTaskinternalTransfer', img: 'assets/subMenusIcons/Internal Transfers.svg' },
  { name: 'Packing', link: 'employeeTaskpacking', img: 'assets/subMenusIcons/Packing.svg' },
  { name: 'CoPacking', link: 'employeeTaskcoPacking', img: 'assets/subMenusIcons/Co Packing.svg' },
  { name: 'RePacking', link: 'employeeTaskrePacking', img: 'assets/subMenusIcons/Re Packing.svg' },
  { name: 'Labelling', link: 'employeeTasklabelling', img: 'assets/subMenusIcons/Labelling.svg' },
  { name: 'Loading', link: 'employeeTaskloading', img: 'assets/subMenusIcons/loading.svg' },
  { name: 'UnLoading', totalength: '0', link: 'employeeTaskunloading', img: 'assets/subMenusIcons/unloading.svg' },
  { name: 'PutawayHistory', link: 'putawayHistory' },{ name: 'PickingHistory', link: 'pickingHistory' }];
}
