import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { WMSService } from '../../../../services/integration-services/wms.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr'; import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompleterData } from 'ng2-completer';
import { Constants } from 'src/app/constants/constants';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { Router } from '@angular/router';
import { BarcodeService } from 'src/app/services/barcode.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-put-away-table',
  templateUrl: './put-away-table.component.html'
})
export class PutAwayTableComponent implements OnInit {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  putawayPlanningForm: FormGroup
  zonesIDs: CompleterData
  locations: any;
  locationIDs: CompleterData;
  putAwaysList: any = [];
  usersList: any;
  userIDs: CompleterData;
  wareHouseTeamsListIDs: CompleterData;
  responseValues: any;
  putAwaySaveList: any;
  userValues: any = [];
  selectedDocuments = [];
  WMPOs: any[];
  selectAllCheckboxValue: boolean = false;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Workforce Putaway', Storage.getSessionUser());
  makeThisDisable: Boolean = false;
  forPermissionsSubscription: any;
  assignedEmployeeIDName: any;
  completionDate: any;
  reqobj: any;
  thirdPartyCustomersCheckAllocation = 'No';
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  overAllPO: any = [];
  wmpoFilteredObj: any = null;
  orderTypeDropdown = ['Purchase Order', 'Sales Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns', 'Putaway Damaged Stock'];
  supplierIds: any = [];
  customerIds: any = [];
  wareHouseIds: any = [];
  storageValues: any = null;
  showTooltip: any = false;
  putawayQCConfig: any = 'No';
  subscription: Subscription;
  @Input() item = '';
  valueimg: any;
  fetchUserLoginIDName: any;
  hideTaskDetails: boolean = false;
  page: number = 1;
  itemsPerPage: any = 5;
  totalItems: any = null;
  searchKey: any = null;
  overAllBarcodeData: any = [];
  barcodePermissionUser: boolean = false;
  globalProduct: any = null;
  globalLocation: any = null;
  includeExportData: any = [];
  loopToStop: any = null;
  dataPerPage: any = null;
  barcodeInfo: any = null;

  constructor(private fb: FormBuilder, private wmsService: WMSService, private excelService: ExcelService,
    private metaDataService: MetaDataService, private IBMDService: InboundMasterDataService,
    private commonmasterdataservice: CommonMasterDataService, private datepipe: DatePipe,
    private toastr: ToastrService, private configService: ConfigurationService, private bService: BarcodeService,
    private translate: TranslateService, private router: Router, private ngxSmartModalService: NgxSmartModalService) {
    if (this.router.url.includes(`/employeeTask/employeeTaskputaway`)) {
      this.hideTaskDetails = true;
    }
    this.createputawayPlanningForm();
    this.translate.use(this.language);
    this.subscription = null
    if (this.router.url.includes(`/employeeTask/employeeTaskputaway`)) {
      this.subscription = this.wmsService.selectedValueSubject.subscribe((data) => {
        if (data) {
          this.valueimg = data;
          if (this.router.url.includes(`/employeeTask/employeeTaskputaway`)) {
            this.getCallOnDropDownChange(this.valueimg);
          }
          this.item = this.valueimg
        } else {
          const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
          this.fetchUserLoginIDName = loginUserRole;
          this.getCallOnPageLoad();
        }
      });
    }
  }

  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    this.disableField();
    this.fetchAllZones();
    this.fetchAllSuppliers();
    this.fetchAllWarehouseTeams();
    this.fetchAllExecutionIDName();
    this.fetchPutawayQCConfig();
    this.fetchProductConfig();
    this.fetchConfigurations();
    this.storageValues = sessionStorage.getItem('idInfo');
    if (this.storageValues) {
      this.putawayPlanningForm.controls.orderType.setValue(JSON.parse(this.storageValues).receiptType);
      this.putawayPlanningForm.controls.fullWmpoNumber.setValue(JSON.parse(this.storageValues).fullWmpoNumber);
      this.putawayPlanningForm.controls.wmpoNumber.setValue(JSON.parse(this.storageValues).wmpoNumber);
      this.putawayPlanningForm.controls.wmpoNumberPrefix.setValue(JSON.parse(this.storageValues).wmpoNumberPrefix);
    }
    if (this.router.url.includes('employeeSchedule/putawayPlanning')) {
      this.fetchAllPutawaysBySupplierID('All');
      this.fetchAllPurAwayPlanningDetails();
    }
    else {
      if (!this.router.url.includes(`/employeeTask/employeeTaskputaway`)) {
        this.fetchAllPutawaysBySupplierID('Purchase Order', 'key');
      }
    }
  }

  fetchPutawayQCConfig() {
    this.metaDataService.findAllPutawayQCConfig(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.putawayQualityCheckConfigurations && res.data.putawayQualityCheckConfigurations.length > 0) {
        this.putawayQCConfig = res.data.putawayQualityCheckConfigurations[0].qualityCheck;
      }
      else {
        this.putawayQCConfig = "No";
      }
    })
  }
  fetchAllSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (r) => {
        if (r && r.status === 0 && r.data.supplierMasters) {
          this.supplierIds = r.data.supplierMasters.map(x => x.supplierIDName);
        }
      })
    this.IBMDService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers.length > 0) {
          this.customerIds = response.data.customers.map(x => x.customerIDName);
        }
      })
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseIds = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
  }
  disableField() {
    if (this.permissionsList.includes('Update')) {
      this.makeThisDisable = false
    }
    else {
      this.makeThisDisable = true
    }
  }
  ngOnDestroy(): void {
    sessionStorage.removeItem('idInfo');
    // this.forPermissionsSubscription.unsubscribe();
  }
  fetchAllPutawaysBySupplierID(oType, key?) {
    if (!key) {
      this.putawayPlanningForm.controls.fullWmpoNumber.setValue(null);
      this.putawayPlanningForm.controls.wmpoNumber.setValue(null);
      this.putawayPlanningForm.controls.wmpoNumberPrefix.setValue(null);
    }
    this.WMPOs = [];
    this.putAwaysList = [];
    const form = this.configService.getGlobalpayload();
    form['supplierID'] = '';
    form['orderType'] = (oType == 'All') ? null : oType;
    form['status'] = "Open";
    this.wmsService.fetchAllPutawaysBySupplierID(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putaways.length > 0) {
          this.overAllPO = response.data.putaways;
          this.getPutawayWMPOS(response.data.putaways);
        } else {
          this.overAllPO = [];
          this.getPutawayWMPOS(null);
        }
      },
      (error) => {
      });
  }
  getPutawayWMPOS(data) {
    this.WMPOs = [];
    if (data) {
      data.forEach(line => {
        if (line.fullWmpoNumber && this.WMPOs.indexOf(line.fullWmpoNumber) === -1 && (line.putAwayCompleted === false)) {
          this.WMPOs.push(line.fullWmpoNumber);
        }
      });
    }
  }
  createputawayPlanningForm() {
    this.putawayPlanningForm = this.fb.group({
      _id: this.fb.array([]),
      wmpoNumber: null,
      fullWmpoNumber: null,
      wmpoNumberPrefix: null,
      zoneName: [''],
      locationName: [''],
      executiveIDName: [null],
      orderType: 'Purchase Order',
      supplierIDName: null,
      customerIDName: null,
      wareHouseTransferSourceInfoWareHouseIDName: null
    })
  }
  empName: any;
  empUserID: any;
  updateActualQty(attr, event) {
    if (event) {
      if (DecimalUtils.greaterThanOrEqual(attr.quantity, DecimalUtils.add(event, attr.totalActualPutawayQuantity))) {
        const formJson = attr;
        formJson.plannedCompletionDate = formJson.plannedCompletionDate ? new Date(formJson.plannedCompletionDate) : null;
        formJson.actualPutawayQuantity = event;
        const findedIndex = this.selectedDocuments.findIndex(x => x._id == attr._id);
        if ((findedIndex && findedIndex != -1) || findedIndex == 0) {
          this.selectedDocuments[findedIndex].actualPutawayQuantity = event;
        }
        this.commonmasterdataservice.updatePutawayAssignedTo([formJson]).subscribe(data => {
          if (data.status == 0 && data.data.putaway) {
            this.reset();
            this.selectAllCheckboxValue = false;
            this.completionDate = null;
            this.toastr.success("Success");
          }
        })
      }
      else {
        this.toastr.error('Actual Quantity Should be Less than or equal to Quantity');
        event = null;
        attr.actualPutawayQuantity = null;
        const findedIndex = this.selectedDocuments.findIndex(x => x._id == attr._id);
        if ((findedIndex && findedIndex != -1) || findedIndex == 0) {
          this.selectedDocuments[findedIndex].actualPutawayQuantity = null;
        }
      }
    }
  }
  assignPlannedDate(attr, event) {
    if (event) {
      const formJson = attr;
      formJson.plannedCompletionDate = new Date(event)
      // if (formJson.startTime && formJson.plannedCompletionDate > new Date(formJson.startTime) || !formJson.startTime) {
      this.commonmasterdataservice.updatePutawayAssignedTo([formJson]).subscribe(data => {
        if (data.status == 0 && data.data.putaway) {
          this.reset();
          this.selectAllCheckboxValue = false;
          this.completionDate = null;
          this.toastr.success("Assigned Successfully");
        }
      })
      // }
      // else {
      //   attr.plannedCompletionDate = null;
      //   this.toastr.error("Planned Completion Date should be greater than StartDate")
      // }
    }
    else {
      attr.plannedCompletionDate = null;
      this.commonmasterdataservice.updatePutawayAssignedTo([attr]).subscribe(data => { })
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
        this.commonmasterdataservice.performPutaway([attr]).subscribe(data => {
          if (data.status == 0) {
            this.toastr.success('Completed successfully');
            this.page = 1;
            this.reset();
            if (this.router.url.includes(`/employeeTask/employeeTaskputaway`)) {
              this.updateData();
            }
          }
          else {
            this.toastr.error(data['statusMsg']);
          }
        })
      }
      else {
        this.commonmasterdataservice.updatePutawayAssignedTo([attr]).subscribe(data => {
          if (data.status == 0 && data.data.putaway) {
            attr.putawayExecutive = data.data.putaway.putawayExecutive;
            attr.assignedDate = data.data.putaway.assignedDate;
            attr.plannedCompletionDate = attr.plannedCompletionDate ?
              this.datepipe.transform(new Date(attr.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss')
              : null;
            this.selectAllCheckboxValue = false;
            event ? this.toastr.success("Assigned User Successfully") :
              (forStatus ? ((attr.endTime) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
            this.completionDate = null;
            if (attr.endTime) {
              this.reset();
            }
          }
          else {
            this.toastr.error("Failed to Assign")
          }
        })
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  updateData() {
    this.wmsService.updateData({ 'currentUser': this.valueimg });
  }
  multiStart(key) {
    if (this.permissionsList.includes('Update')) {
      if (this.selectedDocuments.length > 0) {
        const arr = this.selectAllCheckboxValue ? 'includeExportData' : 'putAwaysList';
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
              if (yesArray ? !yesArray.actualPutawayQuantity : !element.actualPutawayQuantity) {
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
            this.putAwaysList.forEach(element => {
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
            this.putAwaysList.forEach(element => {
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
  naviagteToStock() {
    sessionStorage.setItem('historyRoute', this.router.url);
    if (this.router.url.includes(`employeeTask/employeeTaskputaway`)) {
      this.router.navigate(['/v1/workforce/employeeTask/putawayHistory']);
    }
    else {
      this.router.navigate(['/putawayHistory']);
    }
  }
  multiStartConti(key) {
    this.selectedDocuments.forEach(element => {
      element["endTime"] = (key == 'status') ? new Date() : null;
      element["startTime"] = (key == 'status') ? element.startTime : new Date();
      element.plannedCompletionDate = this.completionDate ? new Date(this.completionDate) : (element.plannedCompletionDate ? new Date(element.plannedCompletionDate) : null);
    });
    if (key == 'status') {
      this.commonmasterdataservice.performPutaway(this.selectedDocuments).subscribe(data => {
        if (data.status == 0) {
          this.toastr.success('Completed successfully');
          this.selectedDocuments = [];
          this.includeExportData = [];
          this.selectAllCheckboxValue = false;
          this.assignedEmployeeIDName = null;
          this.completionDate = null;
          this.page = 1;
          this.reset();
        }
        else {
          this.toastr.error(data['statusMsg']);
        }
      })
    }
    else {
      this.commonmasterdataservice.updatePutawayAssignedTo(this.selectedDocuments).subscribe(data => {
        if (data.status == 0 && data.data.putaway) {
          key == 'status' ? this.toastr.success("Completed Successfully") : this.toastr.success("Started Successfully");
          this.selectedDocuments = [];
          this.includeExportData = [];
          this.selectAllCheckboxValue = false;
          this.assignedEmployeeIDName = null;
          this.completionDate = null;
          this.page = 1;
          this.reset();
        }
        else {
          this.toastr.error("Failed to Assign")
        }
      })
    }
  }
  assignEmployeeforMulti() {
    if (this.permissionsList.includes('Update')) {
      if (this.selectedDocuments.length > 0) {
        let wareHouseIDNameDetails = this.warehouseTeams.find(x => x.executiveIDName == this.assignedEmployeeIDName);
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
          // if ((element.startTime && element.plannedCompletionDate && element.plannedCompletionDate > new Date(element.startTime)) || !element.startTime || !element.plannedCompletionDate) {
          // }
          // else {
          //   element.plannedCompletionDate = null;
          // }
        });
        this.commonmasterdataservice.updatePutawayAssignedTo(this.selectedDocuments).subscribe(data => {
          if (data.status == 0 && data.data.putaway) {
            this.toastr.success("Assigned Successfully");
            this.selectedDocuments = [];
            this.includeExportData = [];
            this.selectAllCheckboxValue = false;
            this.assignedEmployeeIDName = null;
            this.completionDate = null;
            this.reset();
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
  onStatusChange(key, data) {
    if (this.permissionsList.includes('Update')) {
      if (key == 'startTime' && !data.actualPutawayQuantity) {
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
        if ((key == 'status' && data.actualPutawayQuantity) || (key != 'status')) {
          this.intoEmployee(data, wareHouseValue, obj, key);
        }
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  reset() {
    this.fetchAllPurAwayPlanningDetails(null, this.page);
    this.wmsService.fieldsData = {}
  }
  resetOnly() {
    this.createputawayPlanningForm();
    this.putawayPlanningForm.controls.orderType.setValue('Purchase Order');
    this.fetchAllPutawaysBySupplierID('Purchase Order');
    this.wmsService.fieldsData = {};
    this.putAwaysList = [];
    this.selectedDocuments = [];
    this.includeExportData = [];
    this.selectAllCheckboxValue = false;
    this.WMPOs = [];
  }
  /*
    exportAsXLSX() {

      if (this.permissionsList.includes('Update')) {
        if (this.putAwaysList.length) {
          console.log(this.putAwaysList);
          const changedPutawayList = this.exportTypeMethod(this.putAwaysList)
          this.excelService.exportAsExcelFile(changedPutawayList, 'PutawayPlanning-Data', Constants.EXCEL_IGNORE_FIELDS.PUTAWAY_PLANNING);
        } else {
          this.toastr.error('No data available');
        }
      }
      else {
        this.toastr.error("User doesn't have Permissions.")
      }
    }
   */
  exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      if (this.putAwaysList.length) {
        const changedColumnList = this.exportTypeMethod(this.putAwaysList)
        this.excelService.exportAsExcelFile(changedColumnList, 'putaway', Constants.EXCEL_IGNORE_FIELDS.PUTAWAY_PLANNING);
      } else {
        this.toastr.error('No data available');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['WMPONumber'] = k.wmpoNumber
        obj['PutawayNumber'] = k.putawayNumber
        if (k.wareHouseTeamInfo) {
          obj['Assigned By'] = k.putawayExecutive
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
        obj['Supplier Customer Name'] = k.supplierCustomerName
        obj['Supplier Customer Address'] = k.supplierCustomerAddress
        obj['ProductIDName'] = k.productMasterInfo.productIDName
        obj['UOM'] = k.inventoryUnit
        obj['Quantity'] = DecimalUtils.fixedDecimal(Number(k.quantity), 2)
        if (k.supplierMasterInfo) {
          obj['Supplier ID Name'] = k.supplierMasterInfo.supplierIDName
        }
        else {
          obj['Supplier ID Name'] = null
        }
        obj['Expiry Date'] = k.expiryDate ? this.datepipe.transform(new Date(k.expiryDate), 'dd/MM/yyyy') : null
        obj['Batch Number'] = k.batchNumber
        obj['Manufacture Date'] = k.mfgDate ? this.datepipe.transform(new Date(k.mfgDate), 'dd/MM/yyyy') : null
        obj['WareHouseName'] = k.wareHouseInfo.wareHouseName
        obj['ZoneName'] = k.zoneInfo.zoneName
        obj['RackName'] = k.rackInfo.rackName
        obj['LevelName'] = k.levelInfo.levelName
        obj['columnName'] = k.columnInfo.columnName
        obj['LocationName'] = k.locationName
        obj['invoiceNumber'] = k.invoiceNumber
        obj['invoiceDate'] = k.invoiceDate ? this.datepipe.transform(new Date(k.invoiceDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['billOfEntryNumber'] = k.billOfEntryNumber
        obj['billOfEntryDate'] = k.billOfEntryDate ? this.datepipe.transform(new Date(k.billOfEntryDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['bondNumber'] = k.bondNumber
        obj['bondDate'] = k.bondDate ? this.datepipe.transform(new Date(k.bondDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['CreatedDate'] = k.createdDate ? this.datepipe.transform(new Date(k.createdDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['StartDate'] = k.startTime ? this.datepipe.transform(new Date(k.startTime), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Planned Completion Date'] = k.plannedCompletionDate ? this.datepipe.transform(new Date(k.plannedCompletionDate), 'dd/MM/yyyy HH:mm:ss') : null
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['WMPONumber'] = null
      obj['PutawayNumber'] = null
      obj['Assigned Date'] = null
      obj['Supplier Customer Name'] = null
      obj['Supplier Customer Address'] = null
      obj['ProductIDName'] = null
      obj['Quantity'] = null
      obj['InventoryUnit'] = null
      obj['WareHouseName'] = null
      obj['ZoneName'] = null
      obj['RackName'] = null
      obj['LevelName'] = null
      obj['columnName'] = null
      obj['LocationName'] = null
      obj['invoiceNumber'] = null
      obj['invoiceDate'] = null
      obj['billOfEntryNumber'] = null
      obj['billOfEntryDate'] = null
      obj['bondNumber'] = null
      obj['bondDate'] = null
      obj['WareHouseName'] = null
      obj['CreatedDate'] = null
      obj['StartDate'] = null
      obj['Planned Completion Date'] = null
      arr.push(obj)
    }
    return arr

  }
  fetchAllLocations() {
    this.putawayPlanningForm.controls.locationName.setValue(null);
    this.wmsService.fetchAllLocations(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locations = response.data.locations;
          const locationFilter = response.data.locations.filter(z => z.zoneInfo.zoneName === this.putawayPlanningForm.controls.zoneName.value)
          this.locationIDs = locationFilter.map(b => b.locationName);
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
          this.zonesIDs = response.data.zones.map(zonename => zonename.zoneName);
        }
      },
      (error) => {
      });

    this.metaDataService.getAllThirdpartyCustomers(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
        this.wmsService.passingDataforThirdPartyCheckPutawayPlanning = this.thirdPartyCustomersCheckAllocation
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
  }
  setWmpoNumber(event) {
    if (event) {
      this.wmpoFilteredObj = this.overAllPO.find(x => x.fullWmpoNumber == event.originalObject);
      this.putawayPlanningForm.controls.wmpoNumber.setValue(this.wmpoFilteredObj.wmpoNumber);
      this.putawayPlanningForm.controls.wmpoNumberPrefix.setValue(this.wmpoFilteredObj.wmpoNumberPrefix);
      this.putawayPlanningForm.controls.orderType.setValue(this.wmpoFilteredObj.orderType);
    }
    else {
      this.wmpoFilteredObj = null;
      this.putawayPlanningForm.controls.wmpoNumber.setValue(null);
      this.putawayPlanningForm.controls.wmpoNumberPrefix.setValue(null);
      // this.putawayPlanningForm.controls.orderType.setValue(null);
    }
  }
  getDataForFilters() {
    this.reqobj = this.putawayPlanningForm.value;
    const printFieldsArray = {
      "wmpoNumber": this.reqobj.wmpoNumber, "zoneName": this.reqobj.zoneName,
      "locationName": this.reqobj.locationName, "executiveIDName": this.reqobj.executiveIDName,
      "orderType": this.reqobj.orderType,
      "page": 1,
      "pageSize": 5,
    }
    this.wmsService.fieldsData = printFieldsArray
    this.selectAllCheckboxValue = false;
    this.selectedDocuments = [];
    this.includeExportData = [];
    this.fetchAllPurAwayPlanningDetails();
  }
  fetchAllPurAwayPlanningDetails(payload?, page?) {
    this.wmsService.printPutawayPlanningTableData = [];
    const formValues = this.putawayPlanningForm.value;
    if ((this.router.url.includes('employeeSchedule/putawayPlanning')) || (this.router.url.includes('employeeTask/employeeTaskputaway')) || (formValues.orderType && formValues.fullWmpoNumber)) {
      let final = Object.assign(formValues, this.formObj);
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
      final["searchOnKeys"] = PaginationConstants.putawaySearchArray;
      final["searchKeyword"] = this.searchKey
      this.wmsService.fetchAllPutAwayPlanningTableData(payload ? payload : final).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.putawayPaginationResponse.putaways.length > 0) {
            this.putAwaysList = response.data.putawayPaginationResponse.putaways;
            this.totalItems = response.data.putawayPaginationResponse.totalElements
            this.wmsService.printPutawayPlanningTableData = this.putAwaysList;
            let selectedCheckIDs = [];
            if (this.selectedDocuments.length > 0) {
              selectedCheckIDs = this.selectedDocuments.map(x => x._id);
            }
            this.putAwaysList.forEach(element => {
              if (this.putawayQCConfig == 'No') {
                element.actualPutawayQuantity = element.quantity;
              }
              element.forPBarcode = null;
              element.forLBarcode = null;
              element.isChecked = false;
              if (this.selectAllCheckboxValue) {
                element.isChecked = true;
              }
              if (selectedCheckIDs.includes(element._id)) {
                element.isChecked = true;
              }
              element.plannedCompletionDate = element.plannedCompletionDate ?
                this.datepipe.transform(new Date(element.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss')
                : null;
            });

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
            this.putAwaysList = [];
            this.totalItems = null;
          }
        },
        (error) => {
        });
    }
    else {
      this.toastr.error('Enter Manditory');
      this.putAwaysList = [];
    }
  }
  getCallOnPageLoad() {
    const reqPutawayObj = {
      executiveIDName: this.fetchUserLoginIDName,
      locationName: null,
      zoneName: null,
      // wmpoNumber: null,
      "page": 1,
      "pageSize": 5,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPurAwayPlanningDetails(reqPutawayObj);
  }
  getCallOnDropDownChange(user) {
    const reqPutawayObj = {
      executiveIDName: user,
      locationName: null,
      zoneName: null,
      "page": 1,
      "pageSize": 5,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPurAwayPlanningDetails(reqPutawayObj);
  }

  onDocumentSelect(event, data) {
    //if (this.permissionsList.includes('Update')) {
    if (event.target.checked) {
      data.isChecked = true;
      this.selectedDocuments.push(data)
    }
    else {
      data.isChecked = false;
      this.selectedDocuments = this.selectedDocuments.filter(x => x._id != data._id);
    }
    // this.selectAllCheckboxValue = this.putAwaysList.every(function (item: any) {
    //   return item.isChecked == true;
    // })
    // }
    /*  else {
       this.toastr.error("User doesn't have Permissions.");
       data.isChecked = false;
       event.target.checked = false;
     } */

  }

  selectAllData(event) {
    // if (this.permissionsList.includes('Update')) {

    this.selectedDocuments = [];
    if (event.target.checked) {
      this.putAwaysList.forEach(element => {
        element.isChecked = true;
        this.selectedDocuments.push(element);
      });
    }
    else {
      this.selectedDocuments = [];
      this.putAwaysList.forEach(element => {
        element.isChecked = false;
      });
    }
    if (this.includeExportData.length == 0 && event.target.checked) {
      this.getAllPutawayLists();
    }
    else if (this.includeExportData.length && event.target.checked) {
      this.selectedDocuments = this.includeExportData;
    }
  }


  getAllPutawayLists(index?) {
    if (!index) {
      this.includeExportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      console.log(this.includeExportData);
      if (this.selectAllCheckboxValue) {
        this.includeExportData.forEach(element => {
          if (this.putawayQCConfig == 'No') {
            element.actualPutawayQuantity = element.quantity;
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
        const formValues = this.putawayPlanningForm.value;
        let final = Object.assign(formValues, this.formObj);
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
        final["searchOnKeys"] = PaginationConstants.putawaySearchArray;
        final["searchKeyword"] = this.searchKey
        this.wmsService.fetchAllPutAwayPlanningTableData(final).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.putawayPaginationResponse.putaways.length > 0) {
              this.includeExportData = [...this.includeExportData, ...response.data.putawayPaginationResponse.putaways];
              this.getAllPutawayLists(i);
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
  wareHouseTeamsList: any;
  fetchAllExecutionIDName() {
    const form = this.formObj;
    form["workType"] = "Putaway"
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
    const form = this.formObj;
    form["workType"] = "Putaway"
    this.commonmasterdataservice.fetchAllWarehouseTeams(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.warehouseTeams = response.data.wareHouseTeams;
        }
      })
  }

  generatePDF() {
    if (this.permissionsList.includes('Update')) {
      if (this.wmsService.printPutawayPlanningTableData.length > 0) {
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 500);
      }
      else {
        this.toastr.error("No Data found to print");
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
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
  scanSuccessHandler(event) {
    this.ngxSmartModalService.getModal('scannerModalForWebCam').close();
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
    // console.log(event);
    if (event && event.length == 12) {
      const filterBarcode = this.overAllBarcodeData.find(x => x.upcEANNumber == event);
      if (filterBarcode && filterBarcode.productMasterInfo.productIDName === data.productMasterInfo.productIDName && filterBarcode.unitCode == data.inventoryUnit) {
        if (this.putawayQCConfig == 'No') {
          if (!data.startTime) {
            this.onStatusChange('startTime', data);
          }
          else {
            this.toastr.error('Already Started');
          }
        }
        else {
          data.actualPutawayQuantity = data.actualPutawayQuantity ? (DecimalUtils.add(data.actualPutawayQuantity, 1)) : 1;
          if (DecimalUtils.equals(data.actualPutawayQuantity, DecimalUtils.valueOf(1))) {
            this.onStatusChange('startTime', data);
          }
          else {
            this.updateActualQty(data, data.actualPutawayQuantity);
          }
        }
      }
      else {
        this.toastr.error('No matching product');
      }
      data.forPBarcode = null;
    }
    else {
      if (data.forPBarcode && data.forPBarcode.length > 12) {
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
            if (data.startTime) {
              if (data.actualPutawayQuantity) {
                this.onStatusChange('status', data);
              }
              else {
                this.toastr.error('Enter Quantity to Proceed');
              }
            }
            else {
              this.toastr.error('Select Product to start');
            }
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

  getBarcodeEvent(status) {
    if (status) {
      if (this.globalProduct) {
        this.globalProduct.forPBarcode = status;
      }
      if (this.globalLocation) {
        this.globalLocation.forLBarcode = status;
      }
      this.scanSuccessHandler(status);
    }
  }
}

