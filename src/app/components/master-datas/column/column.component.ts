import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../../../shared/services/excel.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { Constants } from '../../../constants/constants';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss']
})
export class ColumnComponent implements OnInit, OnDestroy {
  columnForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  id: any;
  columnInfo: any = {};
  failureRecords: any = [];
  isShowOrHideError: any = false;
  isReadMode: any = false;

  columns: any = [];
  missingParams: string;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Column', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private toastr: ToastrService, private configService: ConfigurationService,
    private excelService: ExcelService,
    private wmsService: WMSService,
    private excelRestService: ExcelRestService,
    public ngxSmartModalService: NgxSmartModalService,
    private translate:TranslateService,
  ) {
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
  /*   this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Column', Storage.getSessionUser());
        this.formObj = this.configService.getGlobalpayload();
        this.getFunctionsCall();
      }
    }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createColumnForm();
      this.fetchAllColumns();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  save() {
     if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const req = this.columnForm.value;
      if (this.id) {
        req._id = this.id;
      }
      req['organizationInfo'] = this.configService.getOrganization();
      req['wareHouseInfo'] = this.configService.getWarehouse();
      this.wmsService.saveorUpdateColumns(JSON.stringify(req)).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.fetchAllColumns();
            this.rerender();
            this.clear();
            this.toastr.success(response.statusMsg);
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in saving details');
          }
        },
        (error) => {
        });
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  fetchAllColumns() {
    this.wmsService.fetchAllColumns(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.columns) {
          this.columns = response.data.columns;
          this.rerender();
        }
      },
      (error) => {
      });
  }
  makeReadOnly: boolean = false;
  globalIDs:any;
  edit(record) {
    this.globalIDs = record._id

    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.id = record._id;
      this.columnForm.patchValue(record);
      this.makeReadOnly = false;
      this.isReadMode = true;

      window.scroll(0, 0)
    }
    else if (this.permissionsList.includes('View')) {
      this.columnForm.patchValue(record);
      this.makeReadOnly = true;
      window.scroll(0, 0)
    }
  }
  clear() {
    this.columnForm.reset();
    this.id = undefined;
    this.makeReadOnly = false;
    this.isReadMode = false
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.columnInfo = { name: 'column', id: data._id, type: '' };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'column') {
      this.fetchAllColumns();
    }
  }
  exportAsXLSX() {
    const changedColumnList = this.exportTypeMethod(this.columns)
    this.excelService.exportAsExcelFile(changedColumnList, 'Columns', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['columnName'] = k.columnName
        if(k.height){
          obj['height'] = DecimalUtils.fixedDecimal(Number(k.height),2)
         }
         else{
          obj['height'] = null
         }


         if(k.width){
          obj['width'] = DecimalUtils.fixedDecimal(Number(k.width),2)
         }
         else{
          obj['width'] = null
         }

        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['columnName'] =null
      obj['height'] = null
      obj['width'] =null
      arr.push(obj)
    }
    return arr
  }
  createColumnForm() {
    this.columnForm = new FormBuilder().group({
      columnName: ['',[Validators.required]],
      height: [null],
      width: [null],
      sequence: [null],
    });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
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
            const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.COLUMN);
            reqData.forEach(r => {
              console.log(r);
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r.height=r.height? r.height.toString():null
              r.width = r.width? r.width.toString():null
            });
            this.excelRestService.columnExcelUpload(reqData).subscribe(res => {
              if (res && res.status === 0 && res.data.columnList && res.data.columnList.failureList &&
                res.data.columnList.failureList.length > 0 && res.data.columnList.successList &&
                res.data.columnList.successList.length > 0) {
                this.failureRecords = res.data.columnList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.columnList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllColumns();
              } else if (res && res.status === 0 && res.data.columnList && res.data.columnList.failureList && res.data.columnList.failureList.length > 0) {
                this.failureRecords = res.data.columnList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.columnList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.columnList && res.data.columnList.failureList && res.data.columnList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.columnList && res.data.columnList.duplicateList && res.data.columnList.duplicateList.length > 0) {
                  this.failureRecords = res.data.columnList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                } else {
                  this.fetchAllColumns();

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
        fileName: "Column Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}
