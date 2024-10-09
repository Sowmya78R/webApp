import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ApexService } from 'src/app/shared/services/apex.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-financialyearconfig',
  templateUrl: './financialyearconfig.component.html',
  styleUrls: ['./financialyearconfig.component.scss']
})
export class FinancialyearconfigComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  financialYearConfigForm: FormGroup;
  id: any;
  formObj = this.configService.getGlobalpayload();
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private fb: FormBuilder, private configService: ConfigurationService, private datePipe: DatePipe,
    private toastr: ToastrService, private wmsService: WMSService,
    public ngxSmartModalService: NgxSmartModalService,
    private commonService: CommonService, private apexService: ApexService, private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createfinancialYearConfigForm();
    this.fetchAllFinancialYearConfigDetails();
  }
  createfinancialYearConfigForm() {
    this.financialYearConfigForm = this.fb.group({
      "financialYearName": null,
      "financialYearStartDate": null,
      "financialYearEndDate": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      "isActive": true
    })
  }
  save() {
    const financialReq = this.financialYearConfigForm.value;
    financialReq.financialYearStartDate = financialReq.financialYearStartDate ? new Date(financialReq.financialYearStartDate) : '';
    financialReq.financialYearEndDate = financialReq.financialYearEndDate ? new Date(financialReq.financialYearEndDate) : '';
    if (this.id) { financialReq._id = this.id; }
    this.wmsService.SaveOrUpdateFinancialYearConfig(financialReq).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.financialYearConfiguration) {
          this.toastr.success(response.statusMsg);
          this.fetchAllFinancialYearConfigDetails();
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
    this.financialYearConfigForm.reset();
    this.createfinancialYearConfigForm();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  financialResponseList: any;

  fetchAllFinancialYearConfigDetails() {
    this.wmsService.fetchAllFinancialYearConfig(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.financialYearConfigurations) {
          this.financialResponseList = response.data.financialYearConfigurations;
          console.log(this.financialResponseList);
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
    this.deleteInfo = { name: 'financialYearConfig', id: data._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllFinancialYearConfigDetails();
    }
  }
  edit(data) {
    console.log(data);
    this.id = data._id;
    data.financialYearStartDate = data.financialYearStartDate ? this.apexService.getDateFromMilliSec(data.financialYearStartDate) : null;
    data.financialYearEndDate = data.financialYearEndDate ? this.apexService.getDateFromMilliSec(data.financialYearEndDate) : null;
    this.financialYearConfigForm.patchValue(data);
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
