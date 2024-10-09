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
  selector: 'app-copackingplanning',
  templateUrl: './copackingplanning.component.html',
  styleUrls: ['./copackingplanning.component.scss']
})
export class CopackingplanningComponent implements OnInit, OnDestroy {

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
  coPackingData: any = [];
  completionDate: any = null;
  makeThisDisable: boolean = false;
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
  showTooltip: any = false;

  constructor(private configService: ConfigurationService,
    private commonDataService: CommonMasterDataService, private toastr: ToastrService, private excelService: ExcelService
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
          this.pickingsData = response.data.pickings;
          this.getWMSOS(response.data.pickings);
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllExecutionIDName() {
    const form = this.formObj;
    form["workType"] = "Co-Packing";
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
    const bindingcoPackingObj = {
      "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
      "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
      "forSearchEmp": this.forSearchEmp
    }
    this.wmsService.coPackingPlanningobjData = bindingcoPackingObj
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
    this.internaltransfersService.fetchAllPlanningCoPacking(form).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.coPackingData = this.linesFraming(res['data']['shipmentOrders']);
        this.wmsService.passpackingCoPlanningData = this.coPackingData;
        this.dtTrigger.next();
      }
      else {
        this.coPackingData = [];
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
              if (a.coPackingInfo) {
              }
              else {
                a.coPackingInfo = {}
              }
              a.coPackingInfo['status'] = 'Open';
              a.coPackingInfo['plannedCompletionDate'] = a.coPackingInfo.plannedCompletionDate ?
                this.datepipe.transform(new Date(a.coPackingInfo.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null
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
    this.selectAllCheckboxValue = this.coPackingData.every(function (item: any) {
      return item.isChecked == true;
    })
  }
  selectAllData(event) {
    this.selectedDocuments = [];
    if (event.target.checked) {
      this.coPackingData.forEach(element => {
        element.isChecked = true;
        this.selectedDocuments.push(element);
      });
    }
    else {
      this.selectedDocuments = [];
      this.coPackingData.forEach(element => {
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
              if (this.coPackingData.find(x => x._id == element._id && x.headerID == element.headerID).coPackingInfo.startDate) {
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
              if (!this.coPackingData.find(x => x._id == element._id && x.headerID == element.headerID).coPackingInfo.startDate) {
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
            element.coPackingInfo["endDate"] = (key == 'status') ? new Date() : null,
              element.coPackingInfo["startDate"] = (key == 'status') ? element.coPackingInfo.startDate : new Date()
          });
        }
        else {
          this.selectedDocuments.forEach(element => {
            if (this.assignedEmployeeIDName && this.assignedEmployeeIDName.length > 0) {
              element.coPackingInfo['assignedTo'] = this.assignedEmployeeIDName
            }
            if (this.completionDate) {
              element.coPackingInfo["plannedCompletionDate"] = new Date(this.completionDate)
            }
          });
        }
        let formBody = [];
        this.selectedDocuments.forEach(attr => {
          attr.coPackingInfo.plannedCompletionDate = attr.coPackingInfo.plannedCompletionDate ? new Date(attr.coPackingInfo.plannedCompletionDate) : null

          formBody.push({
            _id: attr.headerID,
            shipmentOrderLines: [{
              _id: attr._id,
              coPackingInfo: attr.coPackingInfo
            }]
          })
        });
        this.internaltransfersService.updatePlanningCoPacking(formBody).subscribe(data => {
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
    console.log(key);
    console.log(data);
    if (this.permissionsList.includes('Update')) {
      const obj = {
        "endDate": (key == 'status') ? new Date() : null,
        "startDate": (key == 'status') ? data.coPackingInfo.startDate : new Date(),
      }
      data.coPackingInfo.startDate = obj.startDate;
      data.coPackingInfo.endDate = obj.endDate;
      this.intoEmployee(data, null, 'yes');

    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  intoEmployee(attr, event?, forStatus?) {
    console.log(attr);
    console.log(event);
    console.log(forStatus);
    if (this.permissionsList.includes('Update')) {
      attr.coPackingInfo.plannedCompletionDate = attr.coPackingInfo.plannedCompletionDate ? new Date(attr.coPackingInfo.plannedCompletionDate) : null
      const formBody = {
        _id: attr.headerID,
        shipmentOrderLines: [{
          _id: attr._id,
          coPackingInfo: attr.coPackingInfo
        }]
      }
      console.log(formBody)
      this.internaltransfersService.updatePlanningCoPacking([formBody]).subscribe(res => {
        if (res['status'] == 0 && res['data']['shipmentOrderRespObj']) {
          attr.coPackingInfo.assignedBy = res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].coPackingInfo.assignedBy;
          attr.coPackingInfo.assignedDate = res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].coPackingInfo.assignedDate;
          attr.coPackingInfo.plannedCompletionDate = res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].coPackingInfo.plannedCompletionDate ?
            this.datepipe.transform(new Date(res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].coPackingInfo.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null;
          this.selectAllCheckboxValue = false;
          event ? this.toastr.success("Assigned User Successfully") :
            (forStatus ? ((attr.coPackingInfo.endDate) ? (this.toastr.success('Completed successfully')) :
              this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
          this.completionDate = null;
          if (attr.coPackingInfo.endDate) {
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
    this.get({
      "assignedTos": [], "wmsoNumber": null, "fullWmsoNumber": null, "wmsoNumberPrefix": null,
      "orderType": null
    });
    this.wmsService.coPackingPlanningobjData = []
  }
  /*  exportAsXLSX(){
     if (this.coPackingData.length) {
       this.excelService.exportAsExcelFile(this.coPackingData, 'coPackingPlanning-Data', Constants.EXCEL_IGNORE_FIELDS.COPACKINGPLANNING);
     } else {
       this.toastr.error('No data available');
     }
   } */

  exportAsXLSX() {
    console.log(this.coPackingData);
    if (this.permissionsList.includes('Update')) {
      if (this.coPackingData.length) {

        const changedTaskList = this.exportTypeMethod(this.coPackingData)
        this.excelService.exportAsExcelFile(changedTaskList, 'co-PackingData', Constants.EXCEL_IGNORE_FIELDS.COPACKINGPLANNING)
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
        obj['Assigned By'] = ele.coPackingInfo.assignedBy
        obj['Assigned Date'] = ele.coPackingInfo.assignedDate ? this.datepipe.transform(new Date(ele.coPackingInfo.assignedDate), 'yyyy-dd-MM HH:mm:ss') : null
        if (ele.coPackingInfo.assignedTo) {
          ele.coPackingInfo.assignedTo.forEach(fetchAssignedTo => {
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
        obj['Re-Packing Quantity'] = ele.coPackingInfo.repackedQty
        obj['Packing Type'] = ele.coPackingInfo.packingType
        obj['Packing Meterial'] = ele.coPackingInfo.packingMeterial
        obj['Created Date'] = ele.createdDate ? this.datepipe.transform(new Date(ele.createdDate), 'yyyy-dd-MM HH:mm:ss') : null
        obj['startDate'] = ele.coPackingInfo.startDate ? this.datepipe.transform(new Date(ele.coPackingInfo.startDate), 'yyyy-dd-MM HH:mm:ss') : null
        obj['Planned Completion Date'] = ele.coPackingInfo.plannedCompletionDate ? this.datepipe.transform(new Date(ele.coPackingInfo.plannedCompletionDate), 'yyyy-dd-MM HH:mm:ss') : null
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
      obj['Re-Packing Quantity'] = null
      obj['Packing Type'] = null
      obj['Packing Material'] = null
      obj['Created Date'] = null
      obj['startDate'] = null
      obj['Planned Completion Date'] = null

      arr.push(obj)
    }
    return arr
  }


  generatePDF() {
    if (this.permissionsList.includes('Update')) {
      if (this.wmsService.passpackingCoPlanningData.length > 0) {
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


  /*
  generatePDF() {
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
}
