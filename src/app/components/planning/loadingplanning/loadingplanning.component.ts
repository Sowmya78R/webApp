import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

@Component({
  selector: 'app-loadingplanning',
  templateUrl: './loadingplanning.component.html',
  styleUrls: ['./loadingplanning.component.scss']
})
export class LoadingplanningComponent implements OnInit {

  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Workforce Picking', Storage.getSessionUser());

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
  wmsoFilteredObj: any = null;
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
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  pickingsData: any = [];
  showTooltip: any = false;

  constructor(private configService: ConfigurationService,
    private commonDataService: CommonMasterDataService,
    private toastr: ToastrService
    , private outboundProcessService: OutboundProcessService,
    private internaltransfersService: InternaltransfersService,
    private excelService: ExcelService, private wmsService: WMSService,
    private commonMasterDataService: CommonMasterDataService, private fb: FormBuilder, private datepipe: DatePipe,
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
    // this.createLoadingPlanningForm();
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
  // createLoadingPlanningForm() {
  //   // this.loadingPlanningForm = this.fb.group({
  //   //   assignedTo: [null],
  //   //   plannedCompletionDate: [null]
  //   // })
  // }
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
      "forSearchEmp": this.forSearchEmp,
      "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
    }
    this.wmsService.loadingformDataPassing = bindingObj
    this.selectAllCheckboxValue = false;
    this.selectedDocuments = [];
    this.rerender();
    this.get({
      "assignedTos": this.forSearchEmp,
      "wmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumber : null,
      "fullWmsoNumber": this.wmsoFilteredObj ? this.wmsoFilteredObj.fullWmsoNumber : null,
      "wmsoNumberPrefix": this.wmsoFilteredObj ? this.wmsoFilteredObj.wmsoNumberPrefix : null,
      "orderType": this.wmsoFilteredObj ? this.wmsoFilteredObj.orderType : null,
    });
  }
  goodsReceiptNotesList = [];
  get(key?) {
    const form = Object.assign(this.formObj, { "status": "GATE IN", "noteType": "Outward Shipment" }, key)
    this.commonDataService.fetchAllGRNote(form).subscribe(res => {
      if (res.status == 0 && res.data.goodsReceiptNotes.length) {
        this.goodsReceiptNotesList = res.data.goodsReceiptNotes.filter(x => !x.endDate);
        this.wmsService.dataPassingLoadingData = this.goodsReceiptNotesList;
        console.log(this.wmsService.dataPassingLoadingData);
        this.goodsReceiptNotesList.forEach(el => {
          el.isChecked = false;
          el.plannedCompletionDate = el.plannedCompletionDate ?
            this.datepipe.transform(new Date(el.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null
        });
        this.dtTrigger.next();
      }
      else {
        this.dtTrigger.next();
      }
    })
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
    this.selectAllCheckboxValue = this.goodsReceiptNotesList.every(function (item: any) {
      return item.isChecked == true;
    })
  }
  multiStart(key) {
    if (this.selectedDocuments.length > 0) {
      console.log(this.selectedDocuments);
      if (key == 'startDate') {
        let proceed: Boolean = true;
        this.selectedDocuments.forEach(element => {
          if (proceed) {
            if (this.goodsReceiptNotesList.find(x => x._id == element._id).startDate) {
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
            if (!this.goodsReceiptNotesList.find(x => x._id == element._id).startDate) {
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
  isActive: boolean = false
  assignEmployeeforMulti(key?) {
    if (this.selectedDocuments.length > 0) {
      if (key) {
        this.selectedDocuments.forEach(element => {
          element["endDate"] = (key == 'status') ? new Date() : element.endDate;
          element["startDate"] = (key == 'status') ? element.startDate : new Date();
          element["plannedCompletionDate"] = element.plannedCompletionDate ? new Date(element.plannedCompletionDate) : null;
        });
      }
      else {
        this.selectedDocuments.forEach(element => {
          if (this.assignedEmployeeIDName && this.assignedEmployeeIDName.length > 0) {
            element['assignedTo'] = this.assignedEmployeeIDName
          }
          if (this.completionDate) {
            element["plannedCompletionDate"] = new Date(this.completionDate)
          }
          element["plannedCompletionDate"] = element.plannedCompletionDate ? new Date(element.plannedCompletionDate) : null;
        });
      }
      this.internaltransfersService.updateLoadingPlanning(this.selectedDocuments).subscribe(data => {
        if (data.status == 0 && data.data.goodsReceiptNote) {
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
  onStatusChange(key, data) {
    const obj = {
      "endDate": (key == 'status') ? new Date() : null,
      "startDate": (key == 'status') ? data.startDate : new Date(),
    }
    data.startDate = obj.startDate;
    data.endDate = obj.endDate;
    this.intoEmployee(data, null, 'yes');
  }
  globalValue1: any;
  globalAttribute: any;
  intoEmployee(attr, event?, forStatus?) {
    const body = attr
    body['plannedCompletionDate'] = attr.plannedCompletionDate ? new Date(attr.plannedCompletionDate) : null;
    this.internaltransfersService.updateLoadingPlanning([body]).subscribe(res => {
      if (res['status'] == 0 && res['data']['goodsReceiptNote']) {
        this.selectAllCheckboxValue = false;
        event ? this.toastr.success("Assigned User Successfully") :
          (forStatus ? ((attr.endDate) ? (this.toastr.success('Completed successfully')) :
            this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
        attr.assignedBy = res['data']['goodsReceiptNote'].assignedBy;
        attr.assignedDate = res['data']['goodsReceiptNote'].assignedDate;
        attr.plannedCompletionDate = attr.plannedCompletionDate ?
          this.datepipe.transform(new Date(attr.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null
        this.completionDate = null;
        if (attr.endDate) {
          this.reset();
        }
      }
      else if (res && res.status === 2) {
        this.toastr.error(res.statusMsg);
        this.reset();
      }
    })
  }
  enableButton: boolean = false;
  selectAllData(event) {
    this.selectedDocuments = [];
    if (event.target.checked) {
      this.goodsReceiptNotesList.forEach(element => {
        element.isChecked = true;
        this.selectedDocuments.push(element);
      });
    }
    else {
      this.selectedDocuments = [];
      this.goodsReceiptNotesList.forEach(element => {
        element.isChecked = false;
      });
    }

  }
  assignPlannedDate(data, event) {
    const formJSON = data;
    formJSON['plannedCompletionDate'] = formJSON.plannedCompletionDate ? new Date(formJSON.plannedCompletionDate) : '';
    this.internaltransfersService.updateLoadingPlanning([formJSON]).subscribe(res => {
      if (res['status'] == 0 && res['data']['goodsReceiptNote']) {
        data.plannedCompletionDate = data.plannedCompletionDate ?
          this.datepipe.transform(new Date(data.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null
        this.selectAllCheckboxValue = false;
        this.completionDate = null;
        this.toastr.success("Assigned Successfully");
      }
    })
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
  }
  exportAsXLSX() {
    if (this.goodsReceiptNotesList.length) {
      this.excelService.exportAsExcelFile(this.goodsReceiptNotesList, 'loading Planning-Data', Constants.EXCEL_IGNORE_FIELDS.LOADINGPLANNINGSCREEN);
    } else {
      this.toastr.error('No data available');
    }
  }
  generatePDF() {
    if (this.permissionsList.includes('Update')) {
      if (this.goodsReceiptNotesList.length > 0) {
        console.log(this.goodsReceiptNotesList.length);
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 500);
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
