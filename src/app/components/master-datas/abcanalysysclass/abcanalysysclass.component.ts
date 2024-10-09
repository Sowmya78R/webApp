import { Component, OnInit, ViewChild, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Util } from 'src/app/shared/utils/util';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-abcanalysysclass',
  templateUrl: './abcanalysysclass.component.html',
  styleUrls: ['./abcanalysysclass.component.scss']
})
export class AbcanalysysclassComponent implements OnInit, OnDestroy {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  abcAnalysisClassesList: any;
  abcAnalysisClassForm: FormGroup;
  id: any;
  deleteInfo: any;
  statuss: any = ['Active', 'InActive']
  focusedElement: any;
  isReadMode: any = false;
  abcAnalysisClassFormInfo: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'ABC-XYZ Class', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;


  constructor(private wmsService: WMSService,
    private fb: FormBuilder, private toastr: ToastrService
    , private ngxSmartModalService: NgxSmartModalService,
    private util: Util, private excelService: ExcelService, private configService: ConfigurationService,
    private translate: TranslateService,) {
      this.translate.use(this.language);

     }

  ngOnInit() {
    this.createAbcAnalysisClassForm();
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
   /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'ABC-XYZ Class', Storage.getSessionUser());
        this.getFunctionCalls()
      }
    }) */
    this.getFunctionCalls()
  }
  getFunctionCalls() {
    if (this.permissionsList.includes('View')) {
      this. createAbcAnalysisClassForm();
      this.fetchAllAbcAnalysisClass();
    }
  }
  onChange(data) {
    console.log(data);
    if (data == '1: Active') {
      this.abcAnalysisClassForm.controls.status.setValue('true');
    }
    else {
      this.abcAnalysisClassForm.controls.status.setValue('false');
    }
  }
  createAbcAnalysisClassForm() {
    this.abcAnalysisClassForm = this.fb.group({
      className: ['', [Validators.required]],
      classDescription: [''],
      value: ['',[Validators.required]],
      status: ['Active', Validators.compose([null,Validators.required, Validators.maxLength(99)])],
      type: ['',[Validators.required]]
    })
  }
  exportAsXLSX() {
    const changedABCClassList = this.exportTypeMethod(this.abcAnalysisClassesList)
    this.excelService.exportAsExcelFile(changedABCClassList, 'abcAnalysisClassesList', null);
  }
  exportTypeMethod(data) {
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        if (ele && ele != null && ele != undefined) {
          const obj = {}
          obj['classDescription'] = ele.classDescription
          obj['className'] = ele.className
          obj['status'] = ele.status
          obj['value'] = ele.value
          obj['type'] = ele.type
          arr.push(obj)
        }
      })
    }
    else {
      const obj = {}
      obj['classDescription'] = null
      obj['className'] = null
      obj['status'] = null
      obj['value'] = null
      obj['type'] = null
      arr.push(obj)
    }
    return arr
  }


  /* save() {
    if (this.permissionsList.includes("Update")) {
    const abcAnalysisClassFormInfo = this.abcAnalysisClassForm.value;
    if (this.id) {
      this.abcAnalysisClassFormInfo._id = this.id;
    }
    abcAnalysisClassFormInfo['organizationInfo'] = this.configService.getOrganization();
    abcAnalysisClassFormInfo['wareHouseInfo'] = this.configService.getWarehouse();
    this.wmsService.saveorUpdateAbcAnalysisClass(JSON.stringify(abcAnalysisClassFormInfo)).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.toastr.success('Saved successfully');
          this.abcAnalysisClassForm.get('status').setValue('Active')
          this.fetchAllAbcAnalysisClass();
          this.abcAnalysisClassForm.reset();
          this.id = '';
        } else if (response && response.status === 2 && response.statusMsg) {
          this.toastr.error(response.statusMsg);
        } else {
          this.toastr.error('Failed in saving details');
        }
      },
      (error) => {
        this.toastr.error('Failed in saving details');
      }
    );
    }
    else{
      this.toastr.error("User doesn't have Permissions.")
    }
  } */
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const abcValuesReq = this.abcAnalysisClassForm.value;
      if (this.id) {
        abcValuesReq._id = this.id;
      }
      abcValuesReq['organizationInfo'] = this.configService.getOrganization();
      abcValuesReq['wareHouseInfo'] = this.configService.getWarehouse();
      this.wmsService.saveorUpdateAbcAnalysisClass(JSON.stringify(abcValuesReq)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.abcAnalysisClass) {
            this.clear();
            this.id = '';
            this.rerender();
            this.fetchAllAbcAnalysisClass();
            this.toastr.success(response.statusMsg);
            console.log(response.statusMsg)
            console.log(response)

          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in saving');
          }
        },
        (error) => {
          this.toastr.error('Failed in saving');
        }
      );
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  clear() {
    this.id = '';
    this.isReadMode = false;
    this.abcAnalysisClassForm.reset();
    this.abcAnalysisClassForm.get('status').setValue('Active');
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  fetchAllAbcAnalysisClass() {
    this.wmsService.fetchAllAbcAnalysisClass(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.abcAnalysisClasses) {
        this.abcAnalysisClassesList = response.data.abcAnalysisClasses;
        console.log(this.abcAnalysisClassesList);
        this.rerender();
      } else {
        this.abcAnalysisClassesList = [];
      }
    },
      (error) => {
        this.abcAnalysisClassesList = [];
      });
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  edit(data) {
    this.globalIDs = data._id;;
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.id = data._id;
      this.abcAnalysisClassForm.patchValue(data);
      window.scroll(0, 0);
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
      this.isReadMode = true;
    }
    else if (this.permissionsList.includes('View')) {
      this.abcAnalysisClassForm.patchValue(data);
      window.scroll(0, 0);
      this.abcAnalysisClassForm.disable();
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'abcanalysisclass', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllAbcAnalysisClass();
    }
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
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName, formName, parentName?) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else if (parentName) {
      return this.abcAnalysisClassForm.controls[parentName]['controls'][fieldName].invalid && this.abcAnalysisClassForm.controls[parentName]['controls'][fieldName].touched;
    } else {
      return this.util.shouldShowErrors(fieldName, formName);
    }
  }
  shouldShowSuccess(fieldName, parentName?) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else if (parentName) {
      return this.abcAnalysisClassForm.controls[parentName]['controls'][fieldName].valid && this.abcAnalysisClassForm.controls[parentName]['controls'][fieldName].touched;
    }
    else {
      return this.abcAnalysisClassForm.controls[fieldName].valid && this.abcAnalysisClassForm.controls[fieldName].touched;
    }
  }
}

