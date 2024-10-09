import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { Constants } from 'src/app/constants/constants';
import { DecimalUtils } from 'src/app/constants/decimal';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { Storage } from '../../../../shared/utils/storage';
import { Router } from '@angular/router';
import { BarcodeService } from 'src/app/services/barcode.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-pickingnewversion',
  templateUrl: './pickingnewversion.component.html',
  styleUrls: ['./pickingnewversion.component.scss']
})
export class PickingnewversionComponent implements OnInit {

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
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Workforce Picking', Storage.getSessionUser());
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
  pickingQCConfig: any = 'No';
  overAllBarcodeData: any = [];
  barcodePermissionUser: boolean = false;
  globalProduct: any = null;
  globalLocation: any = null;
  hideTaskDetails: boolean = false;
  subscription: Subscription;
  @Input() item = '';
  valueimg: any;
  fetchUserLoginIDName: any;
  page: number = 1;
  itemsPerPage: any = 5;
  totalItems: any = null;
  searchKey: any = null;
  includeExportData: any = [];
  loopToStop: any = null;
  dataPerPage: any = null;
  barcodeInfo: any = null;

  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private router: Router, private bService: BarcodeService,
    private wmsService: WMSService, private metaDataService: MetaDataService, private commonmasterdataservice: CommonMasterDataService,
    private toastr: ToastrService, private IBMDService: InboundMasterDataService,
    private excelService: ExcelService, private datepipe: DatePipe,
    private translate: TranslateService, private ngxSmartModalService: NgxSmartModalService) {
    this.translate.use(this.language);
    this.createPickingPlanningForm();
    if (this.router.url.includes(`/employeeTask/employeeTaskpicking`)) {
      this.hideTaskDetails = true;
    }
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
    this.page = 1;
    this.fetchAllPickingPlanningTableData(inputData);
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
    this.page = 1;
    this.fetchAllPickingPlanningTableData(inputData);
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
    this.fetchPutawayQCConfig();
    this.fetchConfigurations();
    this.fetchProductConfig();
    if (this.router.url.includes('employeeSchedule/pickingPlanning')) {
      this.fetchwmsoNumbers(this.storageValues ? JSON.parse(this.storageValues).orderType : 'Sales Order');
      this.fetchAllPickingPlanningTableData();
    }
    else {
      if (!this.router.url.includes(`/employeeTask/employeeTaskpicking`)) {
        this.fetchwmsoNumbers('Sales Order');
      }
    }
  }
  disableField() {
    if (this.permissionsList.includes('Update')) {
      this.makeThisDisable = false
    }
    else {
      this.makeThisDisable = true
    }
  }
  fetchProductConfig() {
    this.bService.fetchAllProductsBarcode(this.formObj).subscribe(res => {
      if (res['status'] === 0 && res['data']['productBarcodeConfigurations'].length > 0) {
        this.overAllBarcodeData = res['data']['productBarcodeConfigurations'];
      }
      else {
        this.overAllBarcodeData = [];
      }
    })
  }
  fetchConfigurations() {
    this.bService.fetchAllBarcodeAccess(this.formObj).subscribe(data => {
      if (data['status'] == 0 && data['data']['processBarcodeAccessConfigurations']) {
        const pType = data['data']['processBarcodeAccessConfigurations'].find(x => x.name == "Putaway");
        if (pType) {
          const haveRole = pType.roleConfigurations.find(x => x.role.roleName == this.configService.userDetails.authorities[0].authority);
          if (haveRole) {
            const existedRole = haveRole.userInfos.find(x => x.email == this.configService.userDetails.username);
            if (existedRole) {
              this.barcodePermissionUser = true;
            }
          }
        }
      }
    })
  }

  fetchPutawayQCConfig() {
    this.metaDataService.findAllPickingQCConfig(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.pickingQualityCheckConfigurations && res.data.pickingQualityCheckConfigurations.length > 0) {
        this.pickingQCConfig = res.data.pickingQualityCheckConfigurations[0].qualityCheck;
      }
      else {
        this.pickingQCConfig = "No";
      }
    })
  }

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

    this.wmsService.fetchAllPickingPlanningTableData(data).subscribe(
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
  updateActualQty(attr, event) {
    if (DecimalUtils.greaterThanOrEqual(attr.pickedQuantity, DecimalUtils.add(event, attr.totalActualPickingQuantity))) {
      const formJson = attr;
      formJson.plannedCompletionDate = formJson.plannedCompletionDate ? new Date(formJson.plannedCompletionDate) : null;
      formJson.actualPickingQuantity = event;
      const findedIndex = this.selectedDocuments.findIndex(x => x._id == attr._id);
      if ((findedIndex && findedIndex != -1) || findedIndex == 0) {
        this.selectedDocuments[findedIndex].actualPickingQuantity = event;
      }
      this.commonmasterdataservice.updatePickingAssignedTo([formJson]).subscribe(data => {
        if (data.status == 0 && data.data.pickingResponseObj) {
          this.fetchAllPickingPlanningTableData(null, this.page);
          this.selectAllCheckboxValue = false;
          this.completionDate = null;
          this.toastr.success("Success");
        }
      })
    }
    else {
      this.toastr.error('Actual Quantity Should be Less than or equal to Quantity');
      event = null;
      attr.actualPickingQuantity = null;
      const findedIndex = this.selectedDocuments.findIndex(x => x._id == attr._id);
      if ((findedIndex && findedIndex != -1) || findedIndex == 0) {
        this.selectedDocuments[findedIndex].actualPickingQuantity = null;
      }
    }
  }

  getWMSOS(data) {
    this.WMSOs = [];
    if (data) {
      data.forEach(line => {
        if (line.fullWmsoNumber && this.WMSOs.indexOf(line.fullWmsoNumber) === -1 && (line.pickingCompleted === false)) {
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

  onDocumentSelect(event, data) {
    //if (this.permissionsList.includes('Update')) {
    if (event.target.checked) {
      data.isChecked = true;
      // if (this.pickingPlanningForm.controls.userIDName.value != null && this.pickingPlanningForm.controls.userIDName.value != '') {
      //   this.pickingPlanningForm['controls'].pickingAssignedTo.setValue(this.pickingPlanningForm.controls.userIDName.value);
      // }
      this.selectedDocuments.push(data);
    }
    else {
      data.isChecked = false;
      this.selectedDocuments = this.selectedDocuments.filter(x => x._id != data._id);
    }
    // this.selectAllCheckboxValue = this.pickingsList.every(function (item: any) {
    //   return item.isChecked == true;
    // })
  }
  /*   else {
      this.toastr.error("User doesn't have Permissions.");
      data.isChecked = false;
      event.target.checked = false;
    } */

  selectAllData(event) {
    this.selectedDocuments = [];
    if (event.target.checked) {
      this.pickingsList.forEach(element => {
        element.isChecked = true;
        this.selectedDocuments.push(element);
      });
    }
    else {
      this.selectedDocuments = [];
      this.pickingsList.forEach(element => {
        element.isChecked = false;
      });
    }
    if (this.includeExportData.length == 0 && event.target.checked) {
      this.getAllPickings();
    }
    else if (this.includeExportData.length && event.target.checked) {
      this.selectedDocuments = this.includeExportData;
    }
  }
  getAllPickings(index?) {
    if (!index) {
      this.includeExportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      if (this.selectAllCheckboxValue) {
        this.includeExportData.forEach(element => {
          if (this.pickingQCConfig == 'No') {
            element.actualPickingQuantity = element.pickedQuantity;
          }
          element.forPBarcode = null;
          element.forLBarcode = null;
          element.isChecked = true;
        });
        this.selectedDocuments = this.includeExportData;
      }
    }
    else {
      if (((i == 1) || (i != 1 && this.includeExportData.length > 0)) && i <= this.loopToStop) {
        const inputData = {
          "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
          "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
          "wmsoNumberPrefix": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumberPrefix : null,
          "orderType": this.pickingPlanningForm.controls.orderType.value,
          "zoneName": this.pickingPlanningForm.controls.zoneName.value,
          "locationName": this.pickingPlanningForm.controls.locationName.value,
          "executiveIDName": this.pickingPlanningForm.controls.executiveIDName.value,
          "productIDName": this.pickingPlanningForm.controls.productIDName.value,
          "customerIDName": this.pickingPlanningForm.controls.customerIDName.value,
          "supplierIDName": this.pickingPlanningForm.controls.supplierIDName.value,
          "wareHouseTransferDestinationInfoWareHouseIDName": this.pickingPlanningForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.value,
        }
        let final: any = Object.assign(inputData, this.formObj);
        final["page"] = i;
        final["pageSize"] = parseInt(this.dataPerPage);
        if (this.hideTaskDetails) {
          final = {}
          final["page"] = i;
          final["pageSize"] = parseInt(this.dataPerPage);
          final['executiveIDName'] = this.valueimg ? this.valueimg : this.fetchUserLoginIDName;
          final['organizationIDName'] = this.formObj.organizationIDName;
          final['wareHouseIDName'] = this.formObj.wareHouseIDName;
        }
        final["searchOnKeys"] = PaginationConstants.pickingSearchArray;
        final["searchKeyword"] = this.searchKey
        this.wmsService.fetchAllPickingWithPagination(final).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.pickingPaginationResponse && response.data.pickingPaginationResponse.pickings.length > 0) {
              this.includeExportData = [...this.includeExportData, ...response.data.pickingPaginationResponse.pickings];
              this.getAllPickings(i);
            }
          })
      }
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
  assignEmployeeforMulti() {
    if (this.permissionsList.includes('Update')) {
      if (this.selectedDocuments.length > 0) {
        let wareHouseIDNameDetails = this.warehouseTeams.find(x => x.executiveIDName == this.assignedEmployeeIDName);
        // let formjson = {};
        let wareH = null;
        if (wareHouseIDNameDetails) {
          wareH = {
            "_id": wareHouseIDNameDetails ? wareHouseIDNameDetails._id : null,
            "executiveID": wareHouseIDNameDetails ? wareHouseIDNameDetails.executiveID : null,
            "executiveName": wareHouseIDNameDetails ? wareHouseIDNameDetails.executiveName : null,
            "executiveIDName": wareHouseIDNameDetails ? wareHouseIDNameDetails.executiveIDName : null,
          }
        }

        this.selectedDocuments.forEach(element => {
          element.plannedCompletionDate = this.completionDate ? new Date(this.completionDate) : (element.plannedCompletionDate ? new Date(element.plannedCompletionDate) : null);
          element.wareHouseTeamInfo = wareH ? wareH : element.wareHouseTeamInfo;
        });
        this.commonmasterdataservice.updatePickingAssignedTo(this.selectedDocuments).subscribe(data => {
          if (data.status == 0 && data.data.pickingResponseObj) {
            this.toastr.success("Assigned Successfully");
            this.selectedDocuments = [];
            this.includeExportData = []
            this.selectAllCheckboxValue = false;
            this.assignedEmployeeIDName = null;
            this.completionDate = null;
            this.fetchAllPickingPlanningTableData(null, this.page);
          }
          else {
            this.toastr.error("Failed to Assign")
          }
        })
      }
      else {
        this.toastr.error("Atleast Select One");
        this.assignedEmployeeIDName = null;
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  /*  else {
     this.assignedEmployeeIDName = null;
     this.toastr.error("User doesn't have Permissions");
   } */


  resetOnly() {
    this.createPickingPlanningForm();
    this.pickingPlanningForm.controls.orderType.setValue('Sales Order');
    this.pickingsList = [];
    this.selectedDocuments = [];
    this.includeExportData = []
    this.selectAllCheckboxValue = false;
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
  openScanner(data, key) {
    if (key == 'product') {
      this.globalProduct = data;
      this.globalLocation = null;
    }
    else {
      this.globalProduct = null;
      this.globalLocation = data;
    }
    this.barcodeInfo = { 'toggle': true };
    this.ngxSmartModalService.getModal('scannerModalForWebCam').open();
  }
  onStatusChange(key, data, fromLoc?) {
    if (this.permissionsList.includes('Update')) {
      if (!data.actualPickingQuantity && !fromLoc) {
        this.toastr.error('Enter Actual Quantity to Start')
      }
      else {
        const wareHouseValue = data.wareHouseTeamInfo ? data.wareHouseTeamInfo.executiveIDName : null;
        const obj = {
          "endTime": (key == 'status') ? new Date() : null,
          "startTime": (key == 'status') ? data.startTime : new Date(),
        }
        data.startTime = obj.startTime;
        data.endTime = obj.endTime;
        this.intoEmployee(data, wareHouseValue, obj, key);
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  assignPlannedDate(attr, event) {
    if (event) {
      // const formjson = {
      //   "_id": [attr._id],
      //   "plannedCompletionDate": new Date(event)
      // }
      const formJson = attr;
      formJson.plannedCompletionDate = new Date(event)
      // const final = Object.assign(formjson, this.formObj)
      this.commonmasterdataservice.updatePickingAssignedTo([formJson]).subscribe(data => {
        if (data.status == 0 && data.data.pickingResponseObj) {
          // attr['plannedCompletionDate'] = this.datepipe.transform(new Date(data.data.pickingResponseObj.plannedCompletionDate), 'dd/MM/yyyy HH:mm:ss');
          // attr.pickingExecutive = data.data.pickingResponseObj.pickingExecutive;
          // attr.assignedDate = data.data.pickingResponseObj.assignedDate;
          this.fetchAllPickingPlanningTableData(null, this.page);
          this.selectAllCheckboxValue = false;
          this.completionDate = null;
          this.toastr.success("Assigned Successfully");
        }
      })
    }
    else {
      attr.plannedCompletionDate = null;
      this.commonmasterdataservice.updatePickingAssignedTo([attr]).subscribe(data => { })
    }
  }
  intoEmployee(attr, event?, forStatus?, key?) {
    if (this.permissionsList.includes('Update')) {
      let wareHouseIDNameDetails = event ? this.warehouseTeams.find(x => x.executiveIDName == event) : null
      let WareH = null;
      if (wareHouseIDNameDetails) {
        WareH = {
          "_id": wareHouseIDNameDetails ? wareHouseIDNameDetails._id : null,
          "executiveID": wareHouseIDNameDetails ? wareHouseIDNameDetails.executiveID : null,
          "executiveName": wareHouseIDNameDetails ? wareHouseIDNameDetails.executiveName : null,
          "executiveIDName": wareHouseIDNameDetails ? wareHouseIDNameDetails.executiveIDName : null,
        }
      }
      attr.wareHouseTeamInfo = WareH;
      attr.plannedCompletionDate = attr.plannedCompletionDate ? new Date(attr.plannedCompletionDate) : null;
      if (key && key == 'status') {
        attr.endTime = new Date();
        this.commonmasterdataservice.performPicking([attr]).subscribe(data => {
          if (data.status == 0) {
            this.toastr.success('Completed successfully');
            this.page = 1;
            this.fetchAllPickingPlanningTableData(null, this.page);
            if (this.router.url.includes(`/employeeTask/employeeTaskpicking`)) {
              this.updateData();
            }
          }
          else {
            this.toastr.error(data['statusMsg']);
          }
        })
      }
      else {
        this.commonmasterdataservice.updatePickingAssignedTo([attr]).subscribe(data => {
          if (data.status == 0 && data.data.pickingResponseObj) {
            attr.pickingExecutive = data.data.pickingResponseObj.pickingExecutive;
            attr.assignedDate = data.data.pickingResponseObj.assignedDate;
            this.selectAllCheckboxValue = false;
            attr.plannedCompletionDate = attr.plannedCompletionDate ?
              this.datepipe.transform(new Date(attr.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss')
              : null;
            event ? this.toastr.success("Assigned User Successfully") :
              (forStatus ? ((attr.endTime) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
            this.completionDate = null;
            if (attr.endTime) {
              this.fetchAllPickingPlanningTableData(null, this.page);
            }
          }
        })
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  updateData() {
    this.wmsService.updateData({ 'currentUser': this.valueimg });
  }
  naviagteToHistory() {
    sessionStorage.setItem('historyRoute', this.router.url);
    if (this.router.url.includes(`employeeTask/employeeTaskpicking`)) {
      this.router.navigate(['/v1/workforce/employeeTask/pickingHistory']);
    }
    else {
      this.router.navigate(['/pickingHistory'])
    }
  }
  multiStart(key) {
    if (this.permissionsList.includes('Update')) {
      this.reqobj = this.pickingPlanningForm.value
      const printFieldsDataArray = {
        "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
        "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null, "zoneName": this.reqobj.zoneName,
        "locationName": this.reqobj.locationName, "executiveIDName": this.reqobj.executiveIDName,
        "customerIDName": this.reqobj.customerIDName, "productIDName": this.reqobj.productIDName
      }
      this.wmsService.pickingfieldsData = printFieldsDataArray
      this.wmsService.assignedEmployee = this.assignedEmployeeIDName
      this.wmsService.completionPlannedDate = this.completionDate
      if (this.selectedDocuments.length > 0) {
        const arr = this.selectAllCheckboxValue ? 'includeExportData' : 'pickingsList';
        if (key == 'startTime') {
          let proceed: Boolean = true;
          let proceedForQty: Boolean = true;
          this.selectedDocuments.forEach(element => {
            const yesArray = this[arr].find(x => x._id == element._id);
            if (proceed) {
              if (yesArray ? yesArray.startTime : element.startTime) {
                proceed = false;
              }
            }
            if (proceedForQty) {
              if (yesArray ? !yesArray.actualPickingQuantity : !element.actualPickingQuantity) {
                proceedForQty = false;
              }
            }
          });
          if (proceed && proceedForQty) {
            this.multiStartConti(key)
          }
          else {
            if (!proceed && !proceedForQty) {
              this.toastr.error("Unable to Start");
            }
            else if (!proceed) {
              this.toastr.error("Selected Data Already Started");
            }
            else if (!proceedForQty) {
              this.toastr.error("Enter Actual Quantity to Start");
            }
            if (this.selectAllCheckboxValue) {
              this.includeExportData = [];
            }
            this.pickingsList.forEach(element => {
              element.isChecked = false;
            });
            this.selectedDocuments = [];
            this.selectAllCheckboxValue = false;
          }
        }
        else {
          let proceed: Boolean = true;
          this.selectedDocuments.forEach(element => {
            const yesArray = this[arr].find(x => x._id == element._id);
            if (proceed) {
              if (yesArray ? !yesArray.startTime : !element.startTime) {
                proceed = false;
              }
            }
          });
          proceed ? this.multiStartConti(key) : this.toastr.error("Selected Data Not Yet Start");
          if (!proceed) {
            if (this.selectAllCheckboxValue) {
              this.includeExportData = [];
            }
            this.pickingsList.forEach(element => {
              element.isChecked = false;
            });
            this.selectedDocuments = [];
            this.selectAllCheckboxValue = false;
          }
        }
      }
      else {
        this.toastr.error("Atleast Select One");
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  multiStartConti(key) {
    this.selectedDocuments.forEach(element => {
      element["endTime"] = (key == 'status') ? new Date() : null;
      element["startTime"] = (key == 'status') ? element.startTime : new Date();
      element.plannedCompletionDate = this.completionDate ? new Date(this.completionDate) : (element.plannedCompletionDate ? new Date(element.plannedCompletionDate) : null);
    });
    if (key == 'status') {
      this.selectedDocuments['_id'] = this.selectedDocuments
      this.commonmasterdataservice.performPicking(this.selectedDocuments).subscribe(data => {
        if (data.status == 0) {
          this.toastr.success('Completed successfully');
          this.selectedDocuments = [];
          this.includeExportData = []
          this.selectAllCheckboxValue = false;
          this.assignedEmployeeIDName = null;
          this.completionDate = null;
          this.page = 1;
          this.fetchAllPickingPlanningTableData(null, this.page);
        }
        else {
          this.toastr.error(data['statusMsg']);
        }
      })
    }
    else {
      this.commonmasterdataservice.updatePickingAssignedTo(this.selectedDocuments).subscribe(data => {
        if (data.status == 0 && data.data.pickingResponseObj) {
          key == 'status' ? this.toastr.success("Completed Successfully") : this.toastr.success("Started Successfully");
          this.selectedDocuments = [];
          this.includeExportData = [];
          this.selectAllCheckboxValue = false;
          this.assignedEmployeeIDName = null;
          this.completionDate = null;
          this.page = 1;
          this.fetchAllPickingPlanningTableData(null, this.page);
        }
        else {
          this.toastr.error("Failed to Assign")
        }
      })
    }
  }
  getDataForFilters(event?, fieldName?) {
    this.selectAllCheckboxValue = false;
    this.selectedDocuments = [];
    this.includeExportData = [];
    this.fetchAllPickingPlanningTableData();
  }
  fetchAllPickingPlanningTableData(payload?, page?) {
    this.wmsService.pickingTableData = [];
    const inputData = {
      "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
      "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
      "wmsoNumberPrefix": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumberPrefix : null,
      "orderType": this.pickingPlanningForm.controls.orderType.value,
      "zoneName": this.pickingPlanningForm.controls.zoneName.value,
      "locationName": this.pickingPlanningForm.controls.locationName.value,
      "executiveIDName": this.pickingPlanningForm.controls.executiveIDName.value,
      "productIDName": this.pickingPlanningForm.controls.productIDName.value,
      "customerIDName": this.pickingPlanningForm.controls.customerIDName.value,
      "supplierIDName": this.pickingPlanningForm.controls.supplierIDName.value,
      "wareHouseTransferDestinationInfoWareHouseIDName": this.pickingPlanningForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.value,
    }
    if ((this.router.url.includes('employeeSchedule/pickingPlanning')) || (this.router.url.includes('employeeTask/employeeTaskpicking')) || (inputData.orderType && inputData.fullWmsoNumber)) {
      this.wmsService.pickingfieldsData = inputData
      let final: any = Object.assign(inputData, this.formObj);
      final["page"] = page ? page : 1;
      final["pageSize"] = parseInt(this.itemsPerPage);
      if (this.hideTaskDetails) {
        final = {}
        final["page"] = page ? page : 1;
        final["pageSize"] = parseInt(this.itemsPerPage);
        final['executiveIDName'] = this.valueimg ? this.valueimg : this.fetchUserLoginIDName;
        final['organizationIDName'] = this.formObj.organizationIDName;
        final['wareHouseIDName'] = this.formObj.wareHouseIDName;
      }
      final["searchOnKeys"] = PaginationConstants.pickingSearchArray;
      final["searchKeyword"] = this.searchKey
      this.wmsService.fetchAllPickingWithPagination(payload ? payload : final).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.pickingPaginationResponse && response.data.pickingPaginationResponse.pickings.length > 0) {
            this.pickingsList = this.frameJSON(response.data.pickingPaginationResponse.pickings);
            this.totalItems = response.data.pickingPaginationResponse.totalElements;
            this.wmsService.pickingTableData = JSON.parse(JSON.stringify(response.data.pickingPaginationResponse.pickings));
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
    let selectedCheckIDs = [];
    if (this.selectedDocuments.length > 0) {
      selectedCheckIDs = this.selectedDocuments.map(x => x._id);
    }
    const dummyData = JSON.parse(JSON.stringify(data));
    dummyData.forEach(element => {
      if (this.pickingQCConfig == 'No') {
        element.actualPickingQuantity = element.pickedQuantity;
      }
      element.forPBarcode = null;
      element.forLBarcode = null;
      element.plannedCompletionDate = element.plannedCompletionDate ? this.datepipe.transform(new Date(element.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null;
      element.isChecked = false;
      if (this.selectAllCheckboxValue) {
        element.isChecked = true;
      }
      if (selectedCheckIDs.includes(element._id)) {
        element.isChecked = true;
      }
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

  ngOnDestroy(): void {
    sessionStorage.removeItem('idInfos');
  }
  /*
  exportAsXLSX() {
    if (this.pickingsList.length) {
      this.excelService.exportAsExcelFile(this.pickingsList, 'PickingPlanning-Data', Constants.EXCEL_IGNORE_FIELDS.PICKING_PLANNING);
    } else {
      this.toastr.error('No data available');
    }
  } */


  /*
    exportAsXLSX() {
      if (this.permissionsList.includes('Update')) {
        if (this.pickingsList.length) {
          console.log(this.pickingsList);
          const changedPutawayList = this.exportTypeMethod(this.pickingsList)
          this.excelService.exportAsExcelFile(changedPutawayList, 'PickingPlanning-Data', Constants.EXCEL_IGNORE_FIELDS.PICKING_PLANNING);
        } else {
          this.toastr.error('No data available');
        }
      }
      else {
        this.toastr.error("User doesn't have Permissions.")
      }
    } */
  /* exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      if (this.pickingsList.length > 0) {
        const changedColumnList = this.exportTypeMethod(this.pickingsList)
        this.excelService.exportAsExcelFile(changedColumnList, 'PickingPlanning-Data', Constants.EXCEL_IGNORE_FIELDS.PICKING_PLANNING);
      }
      else {
        this.toastr.error("No Data found");
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  } */
  exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      if (this.pickingsList.length) {
        const changedColumnList = this.exportTypeMethod(this.pickingsList)
        this.excelService.exportAsExcelFile(changedColumnList, 'pickingsList', Constants.EXCEL_IGNORE_FIELDS.PICKING_PLANNING);
      } else {
        this.toastr.error('No data available');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  globalExpiryDates: any;
  exportTypeMethod(data) {
    console.log(data);
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['wmsoNumber'] = k.wmsoNumber
        obj['pickingNumber'] = k.pickingNumber
        if (k.wareHouseTeamInfo) {
          obj['Assigned By'] = k.pickingExecutive
        } else {
          obj['Assigned By'] = null
        }
        obj['Assigned Date'] = k.assignedDate ? this.datepipe.transform(new Date(k.assignedDate), 'dd/MM/yyyy HH:mm:ss') : null
        if (k.wareHouseTeamInfo === null) {
          obj['Assigned To'] = null
        }
        else {
          obj['Assigned To'] = k.wareHouseTeamInfo.executiveIDName
        }
        obj['ProductIDName'] = k.productMasterInfo ? k.productMasterInfo.productIDName : null
        obj['UOM'] = k.inventoryUnit
        obj['Picked Quantity'] = DecimalUtils.fixedDecimal(Number(k.pickedQuantity), 2)
        obj['customerIDName'] = k.customerMasterInfo ? k.customerMasterInfo.customerIDName : null
        if (k.expiryDates != null) {
          k.expiryDates.forEach(dates => {
            this.globalExpiryDates = dates
            obj['expiryDates'] = this.globalExpiryDates ? this.datepipe.transform(new Date(this.globalExpiryDates), 'dd/MM/yyyy') : null
          })
        }
        if (k.mfgDates != null) {
          k.mfgDates.forEach(mgfDates => {
            obj['Manufacture Date'] = mgfDates ? this.datepipe.transform(new Date(mgfDates), 'dd/MM/yyyy') : null
          })
        }
        // obj['Expiry Dates'] = this.globalExpiryDates ? this.datepipe.transform(new Date(this.globalExpiryDates), 'dd/MM/yyyy') : null
        /*  obj['mfgDates'] = k.mfgDates ? k.mfgDates : null   */
        obj['batchNumbers'] = k.batchNumber
        obj['Customer Customer Name'] = k.customersCustomerName
        obj['Customer Customer Address'] = k.customersCustomerAddress
        obj['WareHouseName'] = k.wareHouseInfo ? k.wareHouseInfo.wareHouseName : null
        obj['ZoneName'] = k.zoneInfo ? k.zoneInfo.zoneName : null
        obj['RackName'] = k.rackInfo ? k.rackInfo.rackName : null
        obj['LevelName'] = k.levelInfo ? k.levelInfo.levelName : null
        obj['Column Name'] = k.columnInfo ? k.columnInfo.columnName : null
        obj['LocationName'] = k.locationInfo ? k.locationInfo.locationName : null
        obj['LocationName'] = k.invoiceNumber
        obj['invoiceDate'] = k.invoiceDate ? this.datepipe.transform(new Date(k.billOfEntryDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['billOfEntryNumber'] = k.billOfEntryNumber
        obj['billOfEntryDate'] = k.billOfEntryDate ? this.datepipe.transform(new Date(k.billOfEntryDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['bondNumber'] = k.bondNumber
        obj['bondDate'] = k.bondDate ? this.datepipe.transform(new Date(k.bondDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['exBondNumber'] = k.exBondNumber
        obj['exBondDate'] = k.exBondDate ? this.datepipe.transform(new Date(k.exBondDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['CreatedDate'] = k.createdDate ? this.datepipe.transform(new Date(k.createdDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['StartDate'] = k.startTime ? this.datepipe.transform(new Date(k.startTime), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Planned Completion Date'] = k.plannedCompletionDate ? this.datepipe.transform(new Date(k.plannedCompletionDate), 'dd/MM/yyyy HH:mm:ss') : null
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['wmsoNumber'] = null
      obj['pickingNumber'] = null
      obj['Assigned Date'] = null
      obj['ProductIDName'] = null
      obj['Picked Quantity'] = null
      obj['InventoryUnit'] = null
      obj['Customer Customer Name'] = null
      obj['Customer Customer Address'] = null
      obj['WareHouseName'] = null
      obj['ZoneName'] = null
      obj['RackName'] = null
      obj['LevelName'] = null
      obj['Column Name'] = null
      obj['LocationName'] = null
      obj['CreatedDate'] = null
      obj['StartDate'] = null
      obj['Planned Completion Date'] = null
      arr.push(obj)
    }
    return arr

  }

  generatePDF() {
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 500);
  }
  getBarcodeEvent(status) {
    if (this.globalProduct) {
      this.globalProduct.forPBarcode = status;
    }
    if (this.globalLocation) {
      this.globalLocation.forLBarcode = status;
    }
    if (status) {
      this.scanSuccessHandler(status);
    }
  }
  scanSuccessHandler(event) {
    if (this.globalProduct) {
      this.isProductAvailable(event, this.globalProduct);
      this.globalProduct = null;
    }
    else {
      this.islocationAvailable(event, this.globalLocation);
      this.globalLocation = null;
    }
  }

  isProductAvailable(event, data) {
    if (event && event.length == 12) {
      const filterBarcode = this.overAllBarcodeData.find(x => x.upcEANNumber == event);
      if (filterBarcode && filterBarcode.productMasterInfo.productIDName === data.productMasterInfo.productIDName && filterBarcode.unitCode == data.inventoryUnit) {
        if (this.pickingQCConfig == 'No') {
          this.onStatusChange('status', data);
        }
        else {
          data.actualPickingQuantity = data.actualPickingQuantity ? (DecimalUtils.add(data.actualPickingQuantity, 1)) : 1;
          if (DecimalUtils.equals(DecimalUtils.add(data.actualPickingQuantity, data.totalActualPickingQuantity), data.pickedQuantity)) {
            this.onStatusChange('status', data);
          }
          else {
            this.updateActualQty(data, data.actualPickingQuantity);
          }
        }
      }
      else {
        this.toastr.error('No matching product');
      }
      data.forPBarcode = null;
    }
    else {
      if (data.forPBarcode.length > 12) {
        event = null;
        data.forPBarcode = null;
        this.toastr.error('Enter valid Product');
      }
    }
  }
  islocationAvailable(event, data) {
    if (event && event.length == 15) {
      this.metaDataService.fetchLocationByBarcode(this.formObj, event).subscribe(res => {
        if (res['status'] == 0 && res['data'].location) {
          if (res['data'].location.locationName === data.locationInfo.locationName) {
            this.onStatusChange('startTime', data, 'fromLoc');
          }
          else {
            data.forLBarcode = null;
            this.toastr.error('No matching Location');
          }
        }
        else {
          data.forLBarcode = null;
          this.toastr.error('No matching Location in Master Data');
        }
      })
      data.forLBarcode = null;
    }
    else {
      // if (data.forLBarcode.length == 12) {
      //   event = null;
      //   data.forLBarcode = null;
      //   this.toastr.error('Enter valid Location');
      // }
    }
  }
}


