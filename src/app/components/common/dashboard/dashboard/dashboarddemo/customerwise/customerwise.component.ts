import { Component, OnInit, ViewChild, Input, ViewChildren, QueryList } from '@angular/core';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';



@Component({
  selector: 'app-customerwise',
  templateUrl: './customerwise.component.html',
  styleUrls: ['./customerwise.component.scss']
})
export class CustomerwiseComponent implements OnInit {

  @Input() newValueToPass;

  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;

  public single: any = [];
  view: any[] = [230, 230];
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';
  showFields = false;
  units: any;
  customerDetailsForm: FormGroup
  valueimg: any;
  customerWiseResponseList: any;
  putawayChartData: any = [];
  putawayChartHelper: any = [];
  customerWiseListResponce: any;
  newArrayCreation: any = []
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private dashboardService: DashboardService,
    private fb: FormBuilder, private dashboardServices: DashboardService,
    public ngxSmartModalService: NgxSmartModalService, private excelService: ExcelService, 
    private toastr: ToastrService, private configService: ConfigurationService,
    private translate: TranslateService,) { 
      this.translate.use(this.language);  
  }
  
  ngOnInit(): void {
    this.customerDetailsForm = this.fb.group({
      type: [''],
      expectedDeliveryDateFrom: [''],
      expectedDeliveryDateTo: [''],
    })
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  exportAsXLSX() {
    if (this.customerWiseListResponce && this.customerWiseListResponce.length > 0) {
      this.excelService.exportAsExcelFile(this.customerWiseListResponce, 'customerWise', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }
  colorScheme = {
    domain: ['#6e7214', '#76b7ac', '#009461', '#814e28', '#2781c7', '#ff0000', '#00ff00', '#0000ff']
  };
  onSelect(data): void {
    // console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }
  onActivate(data): void {
    //console.log('Activate', JSON.parse(JSON.stringify(data)));
  }
  onDeactivate(data): void {
    //console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
  changeOfType(data) {
    if (data === "Custom Dates") {
      this.showFields = true;
    }
    else {
      this.showFields = false;
    }
  }
  openModalPopUp() {
    this.ngxSmartModalService.getModal('customerWiseSalesOrder').open();
  }
  ngAfterViewInit(): void {
    this.dtTrigger2.next();
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
    this.dtTrigger2.unsubscribe();
  }
}
