import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData, CompleterService } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InternaltransfersService } from 'src/app/services/integration-services/internaltransfers.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ApexService } from 'src/app/shared/services/apex.service';
import { Storage } from 'src/app/shared/utils/storage';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-internaltransferplanning',
  templateUrl: './internaltransferplanning.component.html',
  styleUrls: ['./internaltransferplanning.component.scss']
})
export class InternaltransferplanningComponent implements OnInit, OnDestroy {


  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  internalTransferForm: FormGroup;
  focusedElement: any;
  products: any = [];
  internalTransfers: any = [];
  productMasterInfo: any = {};
  supplierID: any = '';
  inventories: any = [];
  productIDNames: any = [];
  dataService: CompleterData;
  internalTransferReq: any = {};
  inventoryKeys: any = ['#', 'Product ID/Name', 'Zone Name', 'Location Name', 'Quantity Inventory Unit', 'Available Quantity', 'Reserved Quantity'];
  internalTransferKeys: any = ['#', 'Transaction ID', 'Product ID/Name', 'Source Location',
    'Destination Location', 'Transfer Quantity', 'Reason', 'Start Date', 'End Date', 'Status'];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  filteredInventoryByProduct: any = [];
  locationNames: CompleterData;
  destinationLocationNames: CompleterData;
  locationMaster: any = [];
  permissionToggle: any = false;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Workforce', 'Workforce Internal Transfer', Storage.getSessionUser());
  forPermissionsSubscription: any;
  itData: any = [];
  makeThisDisable: boolean = false;
  selectAllCheckboxValue: boolean = false;
  selectedDocuments: any = [];
  wareHouseTeamsListIDs: CompleterData;
  wareHouseTeamsList: any = [];
  assignedEmployeeIDName: any = null;
  forSearchEmp: any = null;
  completionDate: any = null;
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
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private apexService: ApexService, private configService: ConfigurationService,
    private toastr: ToastrService, private commonDataService: CommonMasterDataService,
    private internaltransfersService: InternaltransfersService, private wmsService: WMSService,
    private excelService: ExcelService, private datepipe: DatePipe,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    this.apexService.getPanelIconsToggle();
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
    this.fetchAllExecutionIDName();
    if (this.permissionsList.includes('Update')) {
      this.makeThisDisable = false
    }
    else {
      this.makeThisDisable = true
    }
    this.get();
  }
  getDataForFilters() {
    const internalTransferObject = {
      "forSearchEmp": this.forSearchEmp
    }
    this.selectAllCheckboxValue = false;
    this.selectedDocuments = [];
    this.rerender();
    this.get({ "assignedTos": this.forSearchEmp });
    this.wmsService.passEmployeeIDNameValue = internalTransferObject;
  }
  get(key?) {
    this.wmsService.dataPassingInterTransfer = [];
    const form = Object.assign(this.formObj, { "status": "Approved" }, key)
    this.internaltransfersService.fetchAllTransferPlanning(form).subscribe(res => {
      if (res['status'] == 0 && res['data']['internalTransfers'].length > 0) {
        this.itData = res['data']['internalTransfers'];
        this.wmsService.dataPassingInterTransfer = JSON.parse(JSON.stringify(this.itData));
        this.itData.forEach(element => {
          element.isChecked = false;
          element.plannedCompletionDate = element.plannedCompletionDate ?
            this.datepipe.transform(new Date(element.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss')
            : null;
        });
        this.dtTrigger.next();
      }
      else {
        this.itData = [];
        this.dtTrigger.next();
      }
    })
  }
  fetchAllExecutionIDName() {
    const form = this.formObj;
    form["workType"] = "Transfers"
    this.commonDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
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
    this.selectAllCheckboxValue = this.itData.every(function (item: any) {
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
              if (this.itData.find(x => x._id == element._id).startDate) {
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
              if (!this.itData.find(x => x._id == element._id).startDate) {
                proceed = false;
                if (key == 'status') {
                  element['statusStage'] = {
                    status: 'Completed',
                    statusSequence: (element.statusStages[element.statusStages.length - 1].statusSequence) + 1
                  }
                }
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
  changePlannedDate(attr, event) {
    if (event) {
      const form = attr;
      form['plannedCompletionDate'] = new Date(event);
      this.internaltransfersService.updateplanningTransfers([form]).subscribe(data => {
        if (data.status == 0 && data.data.internalTransfer) {
          attr['plannedCompletionDate'] = this.datepipe.transform(new Date(data.data.internalTransfer.plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss');
          this.toastr.success("Assigned Successfully");
          this.selectedDocuments = [];
          this.selectAllCheckboxValue = false;
          this.assignedEmployeeIDName = null;
          this.completionDate = null;
        }
        else if (data && data.status === 2) {
          this.toastr.error(data.statusMsg);
          this.selectedDocuments = [];
          this.selectAllCheckboxValue = false;
          this.assignedEmployeeIDName = null;
          this.completionDate = null;
        }
        else {
          this.toastr.error("Failed to Assign")
        }
      })
    }
    else {
      attr.plannedCompletionDate = null;
      this.internaltransfersService.updateplanningTransfers([attr]).subscribe(data => {
        if (data.status == 0 && data.data.internalTransfer) { }
      })
    }
  }
  assignEmployeeforMulti(key?) {
    if (this.permissionsList.includes('Update')) {
      if (this.selectedDocuments.length > 0) {
        if (key) {
          this.selectedDocuments.forEach(element => {
            element["endDate"] = (key == 'status') ? new Date() : element.endDate;
            element["startDate"] = (key == 'status') ? element.startDate : new Date();
            element['plannedCompletionDate'] = element.plannedCompletionDate ? new Date(element.plannedCompletionDate) : null;
          });
        }
        else {
          this.selectedDocuments.forEach(element => {
            if (this.assignedEmployeeIDName && this.assignedEmployeeIDName.length > 0) {
              element['assignedTo'] = element.endDate ? null : this.assignedEmployeeIDName;
            }
            if (this.completionDate) {
              element["plannedCompletionDate"] = new Date(this.completionDate);
            }
            else {
              element['plannedCompletionDate'] = element.plannedCompletionDate ? new Date(element.plannedCompletionDate) : null;
            }
          });
        }
        this.internaltransfersService.updateplanningTransfers(this.selectedDocuments).subscribe(data => {
          if (data.status == 0 && data.data.internalTransfer) {
            (!key) ? this.toastr.success("Assigned Successfully") : (key == 'status' ? this.toastr.success("Completed Successfully") : this.toastr.success("Started Successfully"));
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
        "startDate": (key == 'status') ? data.startDate : new Date(),
      }
      if (key == 'status') {
        data['statusStage'] = {
          status: 'Completed',
          statusSequence: (data.statusStages[data.statusStages.length - 1].statusSequence) + 1
        }
      }
      data.startDate = obj.startDate;
      data.endDate = obj.endDate;
      this.intoEmployee(data, null, 'yes');
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  intoEmployee(attr, event?, forStatus?) {
    if (this.permissionsList.includes('Update')) {
      const body = attr
      body['plannedCompletionDate'] = attr.plannedCompletionDate ? new Date(attr.plannedCompletionDate) : null;
      this.internaltransfersService.updateplanningTransfers([body]).subscribe(res => {
        if (res['status'] == 0 && res['data']['internalTransfer']) {
          attr.assignedBy = res['data'].internalTransfer.assignedBy;
          attr.assignedDate = res['data'].internalTransfer.assignedDate;
          this.selectAllCheckboxValue = false;
          event ? this.toastr.success("Assigned User Successfully") :
            (forStatus ? ((attr.endDate) ? (this.toastr.success('Completed successfully')) : this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully"));
          attr.plannedCompletionDate = res['data']['internalTransfer'].plannedCompletionDate ?
            this.datepipe.transform(new Date(res['data']['internalTransfer'].plannedCompletionDate), 'yyyy-MM-dd HH:mm:ss') : null;
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
  }
  selectAllData(event) {
    this.selectedDocuments = [];
    if (event.target.checked) {
      this.itData.forEach(element => {
        element.isChecked = true;
        this.selectedDocuments.push(element);
      });
    }
    else {
      this.selectedDocuments = [];
      this.itData.forEach(element => {
        element.isChecked = false;
      });
    }
  }
  reset() {
    this.rerender();
    this.get();
  }
  resetOnly() {
    this.forSearchEmp = null;
    this.selectAllCheckboxValue = null;
    this.completionDate = null;
    this.rerender();
    this.wmsService.passEmployeeIDNameValue = []
    this.get({ "assignedTos": [] });
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
  /*  exportAsXLSX() {
     //console.log(Array.isArray(this.itData));
     if (this.itData.length) {
       console.log(this.itData)
       this.excelService.exportAsExcelFile(this.itData, 'internalTransfer-Data', Constants.EXCEL_IGNORE_FIELDS.INTERNALTRANSFERPLANNING);
     } else {
       this.toastr.error('No data available');
     }
   } */
  exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      if (this.itData.length) {
        console.log(this.itData);
        const changedTaskList = this.exportTypeMethod(this.itData)
        this.excelService.exportAsExcelFile(changedTaskList, 'internalTransfer-Data', Constants.EXCEL_IGNORE_FIELDS.INTERNALTRANSFERPLANNING)
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
        obj['Assigned By'] = ele.assignedBy
        obj['Assigned Date'] = ele.assignedDate ? this.datepipe.transform(new Date(ele.assignedDate), 'yyyy-dd-MM HH:mm:ss') : null
        if (ele.assignedTo) {
          ele.assignedTo.forEach(fetchAssignedTo => {
            obj['Assigned To'] = fetchAssignedTo
          })
        }
        else {
          obj['Assigned To'] = null
        }
        obj['Created By'] = ele.createdBy
        obj['Approved By'] = ele.approvedBy
        obj['Product ID Name'] = ele.productMasterInfo.productIDName
        obj['Transfer Quantity'] =  DecimalUtils.fixedDecimal(Number(ele.transferQuantity),2);
        obj['Quantity Inventory Unit'] = ele.quantityInventoryUnit
        obj['Source Location Name'] = ele.sourceLocation.locationName
        obj['Destination Location Name'] = ele.destinationLocation.locationName
        obj['Created Date'] = ele.createdDate ? this.datepipe.transform(new Date(ele.createdDate), 'yyyy-dd-MM HH:mm:ss') : null
        obj['Start Date'] = ele.startDate ? this.datepipe.transform(new Date(ele.startDate), 'yyyy-dd-MM HH:mm:ss') : null
        obj['Planned Completion Date'] = ele.plannedCompletionDate ? this.datepipe.transform(new Date(ele.plannedCompletionDate), 'yyyy-dd-MM HH:mm:ss') : null
        arr.push(obj)
      })
    } else {
      let obj = {}
      obj['Assigned By'] = null
      obj['Assigned Date'] = null
      obj['Created By'] = null
      obj['Approved By'] = null
      obj['Product ID Name'] = null
      obj['Transfer Quantity'] = null
      obj['Quantity Inventory Unit'] = null
      obj['Source Location Name'] = null
      obj['Destination Location Name'] = null
      obj['Created Date'] = null
      obj['Start Date'] = null
      obj['Planned Completion Date'] = null
      arr.push(obj)
    }
    return arr
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  generatePDF() {
    if (this.permissionsList.includes('Update')) {
      if (this.wmsService.dataPassingInterTransfer.length > 0) {
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 500);
      }
      else {
        this.toastr.error("No data to print");
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }

}
