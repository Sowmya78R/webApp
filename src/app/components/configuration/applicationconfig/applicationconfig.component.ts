import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-applicationconfig',
  templateUrl: './applicationconfig.component.html',
  styleUrls: ['./applicationconfig.component.scss']
})
export class ApplicationconfigComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  applicationURLConfigForm: FormGroup;
  id: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private toastr: ToastrService, private wmsService: WMSService,
    public ngxSmartModalService: NgxSmartModalService, private commonService: CommonService, private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createapplicationURLConfigForm();
    this.fetchAllAPplicationUrlDetails();
  }
  createapplicationURLConfigForm() {
    this.applicationURLConfigForm = this.fb.group({
      applicationURL: null,
      createdDate: null,
      lastUpdatedDate: null
    });
  }
  save() {
    const applicationUrlReq = this.applicationURLConfigForm.value;
    if (this.id) { applicationUrlReq._id = this.id; }
    this.wmsService.SaveOrUpdateApplicationUrl(applicationUrlReq).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.applicationURL) {
          this.toastr.success(response.statusMsg);
          this.fetchAllAPplicationUrlDetails();
          this.clear();
          this.id = ''
        } else if (response && response.status === 2) {
          this.toastr.error(response.statusMsg);
        } else {
          this.toastr.error('Failed in saving details');
        }
      },
      (error) => {
      });
  }
  clear() {
    this.applicationURLConfigForm.reset();
    // this.applicationURLConfigForm.get("scheduleTime").setValue(null);
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  applicationURLsResponseList: any;
  formObj = this.configService.getGlobalpayload();
  fetchAllAPplicationUrlDetails() {
    this.wmsService.fetchAllApplicationUrl({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.applicationURLs) {
          this.applicationURLsResponseList = response.data.applicationURLs;
          console.log(this.applicationURLsResponseList);
          // this.dtTrigger.next();
          this.rerender();
        } else {
        }
      },
      (error) => {
      });
  }
  deleteInfo: any;
  delete(data: any) {
    console.log(data);
    this.deleteInfo = { name: 'applicationUrl', id: data._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllAPplicationUrlDetails();
    }
  }
  edit(data) {
    console.log(data);
    this.id = data._id;
    this.applicationURLConfigForm.patchValue(data);
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

}
