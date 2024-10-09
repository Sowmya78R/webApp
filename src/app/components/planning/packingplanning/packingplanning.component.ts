import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, QueryList, ViewChild, ViewChildren, EventEmitter, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-packingplanning',
  templateUrl: './packingplanning.component.html',
  styleUrls: ['./packingplanning.component.scss']
})
export class PackingplanningComponent implements OnInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  showTooltip: any = false;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  WMSOs: any = [];
  uniqueArrayList :any;
  formObj = this.configService.getGlobalpayload();
  selectAllCheckboxValue: boolean = false;
  selectedDocuments: any = [];
  forSearchEmp: any = null;
  fullWmsoNumber: any = null;
  assignedEmployeeIDName: any = null;
  wareHouseTeamsListIDs: CompleterData;
  wareHouseTeamsList: any = [];
  packingData: any = [];
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
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Workforce Picking', Storage.getSessionUser());
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  pickingsData: any = [];
  wmsoFilteredObj: any = null;

  constructor(private configService: ConfigurationService,
    private commonDataService: CommonMasterDataService,
    private toastr: ToastrService, private outboundProcessService: OutboundProcessService,
    private internaltransfersService: InternaltransfersService,
    private excelService: ExcelService, private wmsService: WMSService, private datepipe: DatePipe,
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
    this.disableField();
    this.fetchwmsoNumbers();
    this.fetchAllExecutionIDName();
    this.get();
  }
  disableField() {
    if (this.permissionsList.includes('Update')) {
      this.makeThisDisable = false
    }
    else {
      this.makeThisDisable = true
    }
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
    form["workType"] = "Packing";
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
    const bindingObj = {
      "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
      "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
      "forSearchEmp": this.forSearchEmp
    }
    this.wmsService.packingPlanningobjData = bindingObj
    this.selectAllCheckboxValue = false;
    this.selectedDocuments = [];
    this.rerender();
    this.get({ "assignedTos": this.forSearchEmp,  "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
    "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
    "wmsoNumberPrefix": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumberPrefix : null,
    "orderType": this.wmsoFilteredObj ? this.wmsoFilteredObj.orderType : null, });
  }

  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  get(key?,page?) {
    const form = Object.assign(this.formObj, { "status": "Open" }, key)
    form['page'] = page ? page : 1
    form['pageSize'] = this.itemsPerPage
    form['searchKeyword'] = this.searchKey
    form['searchOnKeys'] = null
    form['sortDirection'] = this.sortDirection
    form['sortFields'] = this.sortFields
    this.internaltransfersService.fetchAllPlanningPacking(form).subscribe(res => {
      if (res['status'] == 0 && res['data']['shipmentOrders']) {
        this.packingData = this.linesFraming(res['data']['shipmentOrders']);

       // this.wmsService.passpackingPlanningData = this.packingData;
       // this.dtTrigger.next();
      }
      else {
        this.packingData = [];
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
              if (a.packingInfo) {
              }
              else {
                a.packingInfo = {}
              }
              a.packingInfo.status = 'Open';
              a.packingInfo.plannedCompletionDate = a.packingInfo.plannedCompletionDate ?
                this.datepipe.transform(new Date(a.packingInfo.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null
              products.push(a);
            });
          }
        }
      });
      return products
    }
  }
  selectAllData(event) {
    this.selectedDocuments = [];
    if (event.target.checked) {
      this.packingData.forEach(element => {
        element.isChecked = true;
        this.selectedDocuments.push(element);
      });
    }
    else {
      this.selectedDocuments = [];
      this.packingData.forEach(element => {
        element.isChecked = false;
      });
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
    this.selectAllCheckboxValue = this.packingData.every(function (item: any) {
      return item.isChecked == true;
    })
  }

  multiStart(key) {
    if (this.permissionsList.includes('Update')) {
      if (this.selectedDocuments.length > 0) {
        if (key == 'startDate') {
          let proceed: Boolean = true;
          this.selectedDocuments.forEach(element => {
            if (proceed) {
              if (this.packingData.find(x => x._id == element._id && x.headerID == element.headerID).packingInfo.startDate) {
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
              if (!this.packingData.find(x => x._id == element._id && x.headerID == element.headerID).packingInfo.startDate) {
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
        console.log(this.selectedDocuments);
        if (key) {
          this.selectedDocuments.forEach(element => {
            element.packingInfo["endDate"] = (key == 'status') ? new Date() : null,
              element.packingInfo["startDate"] = (key == 'status') ? element.packingInfo.startDate : new Date()
          });
        }
        else {
          this.selectedDocuments.forEach(element => {
            if (this.assignedEmployeeIDName && this.assignedEmployeeIDName.length > 0) {
              element.packingInfo['assignedTo'] = this.assignedEmployeeIDName
            }
            if (this.completionDate) {
              element.packingInfo["plannedCompletionDate"] = new Date(this.completionDate)
            }
          });
        }
        let formBody = [];
        this.selectedDocuments.forEach(attr => {
          attr.packingInfo.plannedCompletionDate = attr.packingInfo.plannedCompletionDate ? new Date(attr.packingInfo.plannedCompletionDate) : null
          formBody.push({
            _id: attr.headerID,
            shipmentOrderLines: [{
              _id: attr._id,
              packingInfo: attr.packingInfo
            }]
          })
        });
        this.internaltransfersService.updatePlanningPacking(formBody).subscribe(data => {
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
        "startDate": (key == 'status') ? data.packingInfo.startDate : new Date(),
      }
      data.packingInfo.startDate = obj.startDate;
      data.packingInfo.endDate = obj.endDate;
      this.intoEmployee(data, null, 'yes');
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  intoEmployee(attr, event?, forStatus?) {
    if (this.permissionsList.includes('Update')) {
      attr.packingInfo.plannedCompletionDate = attr.packingInfo.plannedCompletionDate ? new Date(attr.packingInfo.plannedCompletionDate) : null
      const formBody = {
        _id: attr.headerID,
        shipmentOrderLines: [{
          _id: attr._id,
          packingInfo: attr.packingInfo
        }]
      }
      this.internaltransfersService.updatePlanningPacking([formBody]).subscribe(res => {
        if (res['status'] == 0 && res['data']['shipmentOrderRespObj']) {
          attr.packingInfo.assignedBy = res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].packingInfo.assignedBy;
          attr.packingInfo.assignedDate = res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].packingInfo.assignedDate;
          attr.packingInfo.plannedCompletionDate = res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].packingInfo.plannedCompletionDate ?
            this.datepipe.transform(new Date(res['data']['shipmentOrderRespObj']['shipmentOrderLines'][0].packingInfo.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null;
          this.selectAllCheckboxValue = false;
          event ? this.toastr.success("Assigned User Successfully") :
            (forStatus ? ((attr.packingInfo.endDate) ? (this.toastr.success('Completed successfully')) :
              this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
          this.completionDate = null;
          if (attr.packingInfo.endDate) {
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
    this.get({ "assignedTos": [], "wmsoNumber": null });
    this.wmsService.packingPlanningobjData = []

  }

  /*  exportAsXLSX(){
     if (this.packingData.length) {
       this.excelService.exportAsExcelFile(this.packingData, 'PackinggPlanning-Data', Constants.EXCEL_IGNORE_FIELDS.PACKINGPLANNING);
     } else {
       this.toastr.error('No data available');
     }
   } */
  exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      if (this.packingData && this.packingData.length > 0) {
        const changedTaskList = this.exportTypeMethod(this.packingData);
        this.excelService.exportAsExcelFile(changedTaskList, 'PackingData', Constants.EXCEL_IGNORE_FIELDS.PACKINGPLANNING)
      }
      else {
        this.toastr.error("No Data Found");
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
        obj['Assigned By'] = ele.packingInfo.assignedBy
        obj['Assigned Date'] = ele.packingInfo.assignedDate ? this.datepipe.transform(new Date(ele.packingInfo.assignedDate), 'yyyy-dd-MM HH:mm:ss') : null
        if (ele.packingInfo.assignedTo) {
          ele.packingInfo.assignedTo.forEach(fetchAssignedTo => {
            fetchAssignedTo
            obj['Assigned To'] = fetchAssignedTo
          })
        }
        else {
          obj['Assigned To'] = null
        }
        obj['Product ID Name'] = ele.productMasterInfo.productIDName
        obj['Brand Name'] = ele.brandName
        obj['UOM'] = ele.inventoryUnit
        obj['Quantity'] = DecimalUtils.fixedDecimal(Number(ele.quantity),2);
        obj['Picked Quantity'] = DecimalUtils.fixedDecimal(Number(ele.pickedQuantity),2)
        obj['Packed Quantity'] = DecimalUtils.fixedDecimal(Number(ele.ele.packingInfo.packedQuantity),2);
        obj['Packing Type'] = ele.packingInfo.packingType
        obj['Packing Meterial'] = ele.packingInfo.packingMeterial
        obj['Created Date'] = ele.createdDate ? this.datepipe.transform(new Date(ele.createdDate), 'yyyy-dd-MM HH:mm:ss') : null
        obj['startDate'] = ele.packingInfo.startDate ? this.datepipe.transform(new Date(ele.packingInfo.startDate), 'yyyy-dd-MM HH:mm:ss') : null
        /*    obj['endDate'] = ele.endDate */
        obj['Planned Completion Date'] = ele.packingInfo.plannedCompletionDate ? this.datepipe.transform(new Date(ele.packingInfo.plannedCompletionDate), 'yyyy-dd-MM HH:mm:ss') : null
        arr.push(obj)
      })
    } else {
      let obj = {}
      obj['WMSO Number'] = null
      obj['Assigned By'] = null
      obj['Assigned Date'] = null
      obj['Product ID Name'] = null
      obj['Quantity'] = null
      obj['Picked Quantity'] = null
      obj['Packed Quantity'] = null
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
      if (this.wmsService.passpackingPlanningData.length > 0) {
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 300);
      }
      else {
        this.toastr.error("No data is there to print");
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }

}
