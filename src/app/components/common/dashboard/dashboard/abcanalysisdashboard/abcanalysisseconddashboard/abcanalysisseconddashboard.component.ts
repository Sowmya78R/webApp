import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { formatDate } from 'ngx-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';

@Component({
  selector: 'app-abcanalysisseconddashboard',
  templateUrl: './abcanalysisseconddashboard.component.html',
  styleUrls: ['./abcanalysisseconddashboard.component.scss']
})

export class AbcanalysisseconddashboardComponent implements OnInit {

  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective;
  isViewToggle:boolean = true;
  isToggle:boolean = true;
  valueimg:any;
  abcAnalsisSecondDashboardForm:FormGroup;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private dashboardService: DashboardService,
    private fb: FormBuilder,
    public ngxSmartModalService: NgxSmartModalService,
    private excelService: ExcelService,
    private toastr: ToastrService, private wmsService: WMSService,private configService:ConfigurationService, private translate: TranslateService,) {
      this.translate.use(this.language);
      this.wmsService.NewshareFormData.subscribe((response) => {
        this.createabcAnalsisSecondDashboardForm();
        this.valueimg = response;
        if(this.valueimg){
          console.log(this.valueimg)
          this.abcAnalsisSecondDashboardForm.controls.fromDate.setValue(response.fromDate);
          this.abcAnalsisSecondDashboardForm.controls.toDate.setValue(response.toDate);
          console.log(this.abcAnalsisSecondDashboardForm.value);
        }
        else{
        }
        })
  }
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
   this.createabcAnalsisSecondDashboardForm();
  }
  createabcAnalsisSecondDashboardForm() {
    this.abcAnalsisSecondDashboardForm = this.fb.group({
      fromDate: [null],
      toDate: [null]
    })
  }
  expandToggle() {
    this.isToggle = !this.isToggle;
  }
  expandToggle1() {
    this.isViewToggle =!this.isViewToggle;
  }
  openModalPopUp() {
    this.ngxSmartModalService.getModal('purchaseAnalyticsOrder').open();
  }

}
