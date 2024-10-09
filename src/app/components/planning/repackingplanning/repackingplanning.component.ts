import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/constants/constants';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InternaltransfersService } from 'src/app/services/integration-services/internaltransfers.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
@Component({
  selector: 'app-repackingplanning',
  templateUrl: './repackingplanning.component.html',
  styleUrls: ['./repackingplanning.component.scss']
})
export class RepackingplanningComponent implements OnInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  WMSOs: any = [];
  formObj = this.configService.getGlobalpayload();
  selectAllCheckboxValue: boolean = false;
  selectedDocuments: any = [];
  forSearchEmp: any = null;
  fullWmsoNumber: any = null;
  assignedEmployeeIDName: any = null;
  wareHouseTeamsListIDs: CompleterData;
  wareHouseTeamsList: any = [];
  rePackingData: any = [];
  completionDate: any = null;
  makeThisDisable: boolean = false;
  showTooltip: any = false;
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
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Workforce Co Packing', Storage.getSessionUser());
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  pickingsData: any = [];
  wmsoFilteredObj: any = null;

  constructor(private configService: ConfigurationService, private excelService: ExcelService, private commonDataService: CommonMasterDataService, private toastr: ToastrService
    , private outboundProcessService: OutboundProcessService, private datepipe: DatePipe,
    private internaltransfersService: InternaltransfersService, private wmsService: WMSService,
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
    if (this.permissionsList.includes('Update')) {
      this.makeThisDisable = false
    }
    else {
      this.makeThisDisable = true
    }
    this.fetchwmsoNumbers();
    this.fetchAllExecutionIDName();
    this.get();
  }
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  fetchwmsoNumbers() {
    this.outboundProcessService.fetchAllPickings(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickings) {
          this.getWMSOS(response.data.pickings);
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllExecutionIDName() {
    const form = this.formObj;
    form["workType"] = "Repacking";
    this.commonDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
  }
  getWMSOS(data) {
    this.WMSOs = [];
    if (data) {
      data.forEach(line => {
        if (line.fullWmsoNumber && this.WMSOs.indexOf(line.fullWmsoNumber) === -1 && (line.pickingCompleted === true)) {
          this.WMSOs.push(line.fullWmsoNumber);
        }
      });
    }
  }
  setWmsoNumber(event) {
    if (event) {
      this.wmsoFilteredObj = this.pickingsData.find(x => x.fullWmsoNumber == event.originalObject);
    }
    else {
      this.wmsoFilteredObj = null;
    }
  }

  getDataForFilters() {
    const bindingRePackingObj = {
      "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
      "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
      "forSearchEmp": this.forSearchEmp
    }
    this.wmsService.repackingPlanningobjData = bindingRePackingObj
    this.selectAllCheckboxValue = false;
    this.selectedDocuments = [];
    this.rerender();
    this.get({
      "assignedTos": this.forSearchEmp, "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
      "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
      "wmsoNumberPrefix": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumberPrefix : null,
      "orderType": this.wmsoFilteredObj ? this.wmsoFilteredObj.orderType : null,
    });
  }
  get(key?) {
    const form = Object.assign(this.formObj, { "status": "Open" }, key)
    this.internaltransfersService.fetchAllPlanningRePacking(form).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.rePackingData = this.linesFraming(res['data']['shipmentOrders']);
        this.wmsService.dataPassingRePackingData = this.rePackingData;
        this.dtTrigger.next();
      }
      else {
        this.rePackingData = [];
        this.dtTrigger.next();
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
              a.fullWmsoNumber = so.fullWmsoNumber
              a.isChecked = false;
              if (a.rePackingInfo) {
              }
              else {
                a.rePackingInfo = {}
              }
              a.rePackingInfo.status = 'Open';
              a.rePackingInfo.plannedCompletionDate = a.rePackingInfo.plannedCompletionDate ?
                this.datepipe.transform(new Date(a.rePackingInfo.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null
              products.push(a);
            });
          }
        }
      });
      return products
    }
  }
  onDocumentSelect(event, data) {
    if (event.target.checked) {
      data.isChecked = true;
      this.selectedDocuments.push(data);
    }
    else {
      data.isChecked = false;
      this.selectedDocuments = this.selectedDocuments.filter(x => x._id != data._id);
    }
    this.selectAllCheckboxValue = this.rePackingData.every(function (item: any) {
      return item.isChecked == true;
    })
  }
  selectAllData(event) {
    this.selectedDocuments = [];
    if (event.target.checked) {
      this.rePackingData.forEach(element => {
        element.isChecked = true;
        this.selectedDocuments.push(element);
      });
    }
    else {
      this.selectedDocuments = [];
      this.rePackingData.forEach(element => {
        element.isChecked = false;
      });
    }
  }
  multiStart(key) {
    if (this.permissionsList.includes('Update')) {
      if (this.selectedDocuments.length > 0) {
        if (key == 'startDate') {
          let proceed: Boolean = true;
          this.selectedDocuments.forEach(element => {
            if (proceed) {
              if (this.rePackingData.find(x => x._id == element._id && x.headerID == element.headerID).rePackingInfo.startDate) {
                proceed = false;
              }
            }
          });
          proceed ? this.assignEmployeeforMulti(key) : this.toastr.error("Selected Data Already Started");
        }
        else {
          let proceed: Boolean = true;
          this.selectedDocuments.forEach(element => {
            if (proceed) {
              if (!this.rePackingData.find(x => x._id == element._id && x.headerID == element.headerID).rePackingInfo.startDate) {
                proceed = false;
              }
            }
          });
          proceed ? this.assignEmployeeforMulti(key) : this.toastr.error("Selected Data Not Yet Start");
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
  assignEmployeeforMulti(key?) {
    if (this.permissionsList.includes('Update')) {
      if (this.selectedDocuments.length > 0) {
        if (key) {
          this.selectedDocuments.forEach(element => {
            element.rePackingInfo["endDate"] = (key == 'status') ? new Date() : null,
              element.rePackingInfo["startDate"] = (key == 'status') ? element.rePackingInfo.startDate : new Date()
          });
        }
        else {
          this.selectedDocuments.forEach(element => {
            if (this.assignedEmployeeIDName && this.assignedEmployeeIDName.length > 0) {
              element.rePackingInfo['assignedTo'] = this.assignedEmployeeIDName
            }
            if (this.completionDate) {
              element.rePackingInfo["plannedCompletionDate"] = new Date(this.completionDate)
            }
          });
        }
        let formBody = [];
        this.selectedDocuments.forEach(attr => {
          attr.rePackingInfo.plannedCompletionDate = attr.rePackingInfo.plannedCompletionDate ? new Date(attr.rePackingInfo.plannedCompletionDate) : null
          formBody.push({
            _id: attr.headerID,
            shipmentOrderLines: [{
              _id: attr._id,
              rePackingInfo: attr.rePackingInfo
            }]
          })
        });
        this.internaltransfersService.updatePlanningRePacking(formBody).subscribe(data => {
          if (data.status == 0 && data.data.shipmentOrderRespObj) {
            (!key) ? this.toastr.success("Saved Successfully") : (key == 'status' ? this.toastr.success("Completed Successfully") : this.toastr.success("Started Successfully"));
            this.selectedDocuments = [];
            this.selectAllCheckboxValue = false;
            this.assignedEmployeeIDName = null;
            this.completionDate = null;
            this.reset();
          }
          else if (data && data.status === 2) {
            this.toastr.error(data.statusMsg);
            this.selectedDocuments = [];
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
      const obj = {
        "endDate": (key == 'status') ? new Date() : null,
        "startDate": (key == 'status') ? data.rePackingInfo.startDate : new Date(),
      }
      data.rePackingInfo.startDate = obj.startDate;
      data.rePackingInfo.endDate = obj.endDate;
      this.intoEmployee(data, null, 'yes');
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  intoEmployee(attr, event?, forStatus?) {
    console.log(forStatus)
    if (this.permissionsList.includes('Update')) {
      attr.rePackingInfo.plannedCompletionDate = attr.rePackingInfo.plannedCompletionDate ? new Date(attr.rePackingInfo.plannedCompletionDate) : null
      const formBody = {
        _id: attr.headerID,
        shipmentOrderLines: [{
          _id: attr._id,
          rePackingInfo: attr.rePackingInfo
        }]
      }
      this.internaltransfersService.updatePlanningRePacking([formBody]).subscribe(res => {
        if (res['status'] == 0 && res['data']['shipmentOrderRespObj']) {
          attr.rePackingInfo.assignedBy = res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].rePackingInfo.assignedBy;
          attr.rePackingInfo.assignedDate = res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].rePackingInfo.assignedDate;
          attr.rePackingInfo.plannedCompletionDate = res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].rePackingInfo.plannedCompletionDate ?
            this.datepipe.transform(new Date(res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].rePackingInfo.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null;
          this.selectAllCheckboxValue = false;
          event ? this.toastr.success("Assigned User Successfully") :
            (forStatus ? ((attr.rePackingInfo.endDate) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
          this.completionDate = null;
          if (attr.rePackingInfo.endDate) {
            this.reset();
          }
        }
        else if (res && res.status === 2) {
          this.toastr.error(res.statusMsg);
          this.reset();
        }
      })
    }
  }
  /*
  exportAsXLSX(){
    if (this.rePackingData.length) {
      this.excelService.exportAsExcelFile(this.rePackingData, 'Re-Packing Data', Constants.EXCEL_IGNORE_FIELDS.REPACKINGPLANNING);
    } else {
      this.toastr.error('No data available');
    }
  } */


  exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      if (this.rePackingData.length) {
        const changedTaskList = this.exportTypeMethod(this.rePackingData)
        this.excelService.exportAsExcelFile(changedTaskList, 'Re-PackingData', Constants.EXCEL_IGNORE_FIELDS.REPACKINGPLANNING)
      }
      else {
        this.toastr.error('No data available');
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  exportTypeMethod(data) {
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        const obj = {}
        obj['WMSO Number'] = ele.fullWmsoNumber

        obj['Assigned By'] = ele.rePackingInfo.assignedBy
        obj['Assigned Date'] = ele.rePackingInfo.assignedDate ? this.datepipe.transform(new Date(ele.rePackingInfo.assignedDate), 'yyyy-dd-MM HH:mm:ss') : null
        if (ele.rePackingInfo.assignedTo) {
          ele.rePackingInfo.assignedTo.forEach(fetchAssignedTo => {
            fetchAssignedTo
            obj['Assigned To'] = fetchAssignedTo
          })
        }
        else {
          obj['Assigned To'] = null
        }
        obj['Product ID Name'] = ele.productMasterInfo.productIDName
        obj['brandName'] = ele.brandName
        obj['UOM'] = ele.inventoryUnit
        obj['Order Quantity'] = DecimalUtils.fixedDecimal(Number(ele.quantity),2);
        obj['Picked Quantity'] = DecimalUtils.fixedDecimal(Number(ele.pickedQuantity),2);
        obj['Convertion Type'] = ele.convertionType
        obj['Re-Packed Quantity'] = ele.rePackingInfo.repackedQty
        obj['Gain Weight Loss/Gain'] = ele.rePackingInfo.grossWeight
        obj['Packing Type'] = ele.rePackingInfo.packingType
        obj['Packing Meterial'] = ele.rePackingInfo.packingMeterial
        obj['Created Date'] = ele.createdDate ? this.datepipe.transform(new Date(ele.createdDate), 'yyyy-dd-MM HH:mm:ss') : null
        obj['startDate'] = ele.rePackingInfo.startDate ? this.datepipe.transform(new Date(ele.rePackingInfo.startDate), 'yyyy-dd-MM HH:mm:ss') : null
        obj['Planned Completion Date'] = ele.rePackingInfo.plannedCompletionDate ? this.datepipe.transform(new Date(ele.rePackingInfo.plannedCompletionDate), 'yyyy-dd-MM HH:mm:ss') : null
        arr.push(obj)
      })
    } else {
      let obj = {}
      obj['WMSO Number'] = null
      obj['Assigned By'] = null
      obj['Assigned Date'] = null
      obj['Product ID Name'] = null
      obj['Order Quantity'] = null
      obj['Picked Quantity'] = null
      obj['Convertion Type'] = null
      obj['Re-Packed Quantity'] = null
      obj['Gain Weight Loss/Gain'] = null
      obj['Packing Type'] = null
      obj['Packing Meterial'] = null
      obj['Created Date'] = null
      obj['startDate'] = null
      obj['Planned Completion Date'] = null
      arr.push(obj)
    }
    return arr
  }


  generatePDF() {
    if (this.permissionsList.includes('Update')) {
      if (this.wmsService.dataPassingRePackingData.length > 0) {
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 300);
      }
      else {
        this.toastr.error("No Data found to print");
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }

  /*  generatePDF() {
     if (this.permissionsList.includes('Update')) {
       this.emitTripSheet.emit();
       setTimeout(() => {
         window.print();
       }, 300);
     }
     else {
       this.toastr.error("User doesn't have Permissions.")
     }
   } */
  reset() {
    this.rerender();
    this.get();
  }
  resetOnly() {
    this.forSearchEmp = null;
    this.fullWmsoNumber = null;
    this.selectAllCheckboxValue = null;
    this.completionDate = null;
    this.rerender();
    this.get({ "assignedTos": [], "wmsoNumber": null });
    this.wmsService.repackingPlanningobjData = [];
  }
}
