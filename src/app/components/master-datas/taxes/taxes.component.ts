import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Storage } from '../../../shared/utils/storage';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss']
})
export class TaxesComponent implements OnInit {
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Tax', Storage.getSessionUser());
  taxForm: FormGroup;
  getData: any = [];
  deleteInfo: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  failureRecords: any = [];
  isShowOrHideError: boolean = false
  missingParams: string;
  dropdownSettingsforCountry = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  selectedCountries: any = null;
  dropdownList: any = [];
  statesList: any = [];
  statesData: any = [];
  stateDisabled = true;
  countryDisabled = false;
  selectedStates: any = null;
  selectedRecord: any = null;

  constructor(private configService: ConfigurationService, private fb: FormBuilder,
    private wmsService: WMSService, private toastr: ToastrService,
    private excelService: ExcelService,
    private excelRestService: ExcelRestService,
    private ngxSmartModalService: NgxSmartModalService, private commonMasterDataService: CommonMasterDataService) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        lengthMenu: 'Show _MENU_ Entries',
      }
    };
    this.createForm();
    this.fetchAllCountries();
    this.fetchAllStates();
    this.findAll();
  }
  createForm() {
    this.taxForm = this.fb.group({
      "taxName": [null, Validators.required],
      "taxPercentage": [null, Validators.required],
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      _id: null,
      createdDate: null,
      lastUpdatedDate: null,
      taxNamePercentage: null,
      "hsnCode": null,
      "countryName": null,
      "stateNames": null
    })
  }
  fetchAllStates() {
    this.wmsService.fetchStates(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].countryStateMasters) {
        this.statesData = res['data'].countryStateMasters;
      }
    })
  }
  fetchAllCountries() {
    this.commonMasterDataService.fetchAllCountries(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.countries) {
        this.dropdownList = response.data.countries.map(x => x.name);
      } else {
      }
    }, error => {
    });
  }
  getStates() {
    if (this.selectedCountries && this.selectedCountries.length == 1) {
      this.stateDisabled = false;
      const filteredRec = this.statesData.find(x => x.countryName == this.selectedCountries[0]);
      this.statesList = filteredRec.stateNames
    }
    else {
      this.stateDisabled = true;
      this.selectedStates = null;
    }
  }
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || 
    (this.permissionsList.includes("Create") && !this.globalIDs)) {
    let form = this.taxForm.value;
    if (form._id) {
      form = this.selectedRecord;
      form['taxName'] = this.taxForm.value.taxName;
      form['taxPercentage'] = this.taxForm.value.taxPercentage;
      form['taxNamePercentage'] = form['taxName'] + ':' + form['taxPercentage'];
      this.wmsService.updateTaxes(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].taxMaster) {
          this.toastr.success(res['statusMsg']);
          this.rerender();
          this.findAll();
          this.createForm();
          this.selectedCountries = null;
          this.selectedStates = null;
          this.stateDisabled = true;
          this.countryDisabled = false;
        }
      })
    }
    else {
      form['taxNamePercentage'] = form['taxName'] + ':' + form['taxPercentage'];
      form['countryName'] = (this.selectedCountries && this.selectedCountries.length > 0) ? this.selectedCountries[0] : null;
      form['stateNames'] = this.selectedStates;
      this.wmsService.saveTaxes(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].insert) {
          this.toastr.success(res['statusMsg']);
          this.rerender();
          this.findAll();
          this.createForm();
          this.selectedCountries = null;
          this.selectedStates = null;
          this.stateDisabled = true;
          this.countryDisabled = false;
        }
      })
    }
  }
  else{
    this.toastr.error("User doesn't have Permissions.");

  }
  this.globalIDs = null;
}
  findAll() {
    this.wmsService.fetchTaxes(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].taxMasters) {
        this.getData = res['data'].taxMasters;
        this.dtTrigger.next();
      }
      else {
        this.getData = [];
      }
    })
  }
  globalIDs:any;
  edit(data) {
    this.globalIDs = data._id
    this.taxForm.patchValue(data);
    this.selectedRecord = data;
    this.selectedCountries = [data.countryName];
    this.selectedStates = [data.stateName];
    this.stateDisabled = true;
    this.countryDisabled = true;
  }
  clear() {
    this.createForm();
    this.selectedCountries = null;
    this.selectedStates = null;
    this.stateDisabled = false;
    this.countryDisabled = false;
  }
  delete(data) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'Taxes', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.rerender();
      this.findAll();
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
  exportAsXLSX() {
    const changedTaxList = this.exportTypeMethod(this.getData)
    this.excelService.exportAsExcelFile(changedTaxList, 'Tax Master', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['countryName'] = k.countryName
        obj['stateName'] = k.stateName
        obj['hsnCode'] = k.hsnCode
        obj['taxName'] = k.taxName
        if(k.taxPercentage){

          obj['taxPercentage'] = DecimalUtils.fixedDecimal(Number(k.taxPercentage),2)
         }
         else{
          obj['taxPercentage'] = null

         }
     /*    obj['taxPercentage'] = k.taxPercentage */
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['countryName'] = null
      obj['stateName'] = null
      obj['hsnCode'] = null
      obj['taxName'] = null
      obj['taxPercentage'] = null
      arr.push(obj)
    }
    return arr
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        if (jsonData.length > 0) {
          event.target.value = '';
          const missingParamsArray = this.mandatoryCheck(jsonData);
          if (missingParamsArray.length > 1) {
            this.failureRecords = missingParamsArray;
            this.missingParams = missingParamsArray.join(', ');
            this.toastr.error('Please download log file to fill mandatory fields');
          } else {
            const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.TAXES);
            reqData.forEach(r => {
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r['taxNamePercentage'] = r['taxName'] + ':' + r['taxPercentage'];
              if(r.hscCode){
                r['hscCode'] = r.hsnCode
              }
              else{
                r['hscCode'] = null

              }
              r.taxPercentage = r.taxPercentage ? r.taxPercentage.toString():null
            });
            this.excelRestService.taxExcelUpload(reqData).subscribe(res => {
              if (res && res.status === 0 && res.data.taxMasterList && res.data.taxMasterList.failureList &&
                res.data.taxMasterList.failureList.length > 0 && res.data.taxMasterList.successList &&
                res.data.taxMasterList.successList.length > 0) {
                this.failureRecords = res.data.taxMasterList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.taxMasterList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.rerender();
                this.findAll();
              } else if (res && res.status === 0 && res.data.taxMasterList && res.data.taxMasterList.failureList && res.data.taxMasterList.failureList.length > 0) {
                this.failureRecords = res.data.taxMasterList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.taxMasterList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.taxMasterList && res.data.taxMasterList.failureList && res.data.taxMasterList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.taxMasterList && res.data.taxMasterList.duplicateList && res.data.taxMasterList.duplicateList.length > 0) {
                  this.failureRecords = res.data.taxMasterList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                } else {
                  this.rerender();
                  this.findAll();
                  this.toastr.success('Uploaded successfully');
                  this.failureRecords = [];
                }
              } else {
                this.toastr.error('Failed in uploading');
                this.failureRecords = [];
              }
            },
              error => { });
          }
        }
      }, 500);
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        console.log(record);
        if (record['columnName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.COLUMN;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArray;
  }

  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };
  dyanmicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement("a");
    }
    const element = this.setting.element.dynamicDownload;
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Tax Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}
