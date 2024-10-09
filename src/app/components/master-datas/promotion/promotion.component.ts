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
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss']
})
export class PromotionComponent implements OnInit {
  promotionForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  id: any;
  promotionInfo: any = {};
  failureRecords: any = [];
  isShowOrHideError: any = false;
  isReadMode: any = false;

  promotionList: any = [];
  missingParams: string;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Column', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  constructor(private toastr: ToastrService, private configService: ConfigurationService,
    private excelService: ExcelService,
    private wmsService: WMSService,private datepipe:DatePipe,
    private excelRestService: ExcelRestService,
    public ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,
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
      this.createPromotionForm();
      this.fetchAllPromotions();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
    const req = this.promotionForm.value;
    if (this.id) {
      req._id = this.id;
    }
    this.wmsService.saveorUpdatePromotions(JSON.stringify(req)).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.fetchAllPromotions();
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
    else{
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  fetchAllPromotions() {
    this.wmsService.fetchAllPromotions(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.promotions ) {
          this.promotionList = response.data.promotions;
          this.rerender();
        }
      },
      (error) => {
      });
  }
  makeReadOnly: boolean = false;
  globalIDs:any;
  edit(record) {
    this.globalIDs = record._id;

    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.id = record._id;
      record.validFrom = record.validFrom ?this.datepipe.transform(new Date(record.validFrom), 'yyyy-MM-dd') : null
      record.validTo = record.validTo ?this.datepipe.transform(new Date(record.validTo), 'yyyy-MM-dd') : null
      this.promotionForm.patchValue(record);
      this.makeReadOnly = false;
      this.isReadMode = true;

      window.scroll(0, 0)
    }
    else if (this.permissionsList.includes('View')) {
      this.promotionForm.patchValue(record);
      this.makeReadOnly = true;
      window.scroll(0, 0)
    }
  }
  clear() {
    this.promotionForm.reset();
    this.id = undefined;
    this.makeReadOnly = false;
    this.isReadMode = false
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.promotionInfo = { name: 'promotions', id: data._id, type: '' };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'promotions') {
      this.fetchAllPromotions();
    }
  }

  exportAsXLSX() {
    const changedColumnList = this.exportTypeMethod(this.promotionList)
  }
  exportTypeMethod(data) {
    const arr = []
  }
  createPromotionForm() {
    this.promotionForm = new FormBuilder().group({
      _id: null,
      promotionName: null,
      validFrom: null,
      validTo: null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse()
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
