import { Component, OnInit, ViewChild, Input, ViewChildren, QueryList } from '@angular/core';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Constants } from 'src/app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';




@Component({
  selector: 'app-productwise',
  templateUrl: './productwise.component.html', 
  styleUrls: ['./productwise.component.scss']
})
export class ProductwiseComponent implements OnInit {

@Input() propertyFunction

@ViewChild(DataTableDirective)
dtOptions: DataTables.Settings = {};
dtTrigger: Subject<any> = new Subject();
dtTrigger2: any = new Subject();
dtTrigger3: any = new Subject();
dtElement: DataTableDirective;
@ViewChildren(DataTableDirective)
dtElements: QueryList<DataTableDirective>;

  single: any[];
  view: any[] = [250, 250];
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';
  showFields = false;
  units: any;
  productWiseDetailsForm: FormGroup
  valueimg: any;
  productWiseChartHelper: any = [];
  productWiseChartData: any = [];
  productWiseResponseList: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private dashboardService: DashboardService,
    private fb: FormBuilder, private dashboardServices: DashboardService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,private excelService:ExcelService,private toastr:ToastrService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
   /*  Object.assign(this, { single });
    this.dashboardServices.shareFormData.subscribe((data) => {
      this.createproductWiseDetailsForm();

      this.valueimg = data;
      //   console.log(data);
      if (data != {}) {
        const customerReq = this.productWiseDetailsForm.value;
        this.productWiseDetailsForm.controls.type.setValue(data.type);
        this.productWiseDetailsForm.controls.expectedDeliveryDateFrom.setValue(data.expectedDeliveryDateFrom);
        this.productWiseDetailsForm.controls.expectedDeliveryDateTo.setValue(data.expectedDeliveryDateTo);
        // console.log(this.productWiseDetailsForm.value.type);
        //  console.log(this.productWiseDetailsForm.value.expectedDeliveryDateFrom);
        //  console.log(this.productWiseDetailsForm.value.expectedDeliveryDateTo);
      //  this.callingApiOnDateChanged()
      }
    }) */
  }
  
  exportAsXLSX() {
    if (this.productWiseResponseList && this.productWiseResponseList.length > 0) {
      this.excelService.exportAsExcelFile(this.productWiseResponseList, 'periodWiseSalesOrderList', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }
 
  ngOnInit(): void {
    this.productWiseDetailsForm = this.fb.group({
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
 
  colorScheme = {
    domain: ['#6e7214', '#76b7ac', '#009461', '#814e28', '#2781c7', '#ff0000', '#00ff00', '#0000ff']
  };
  onSelect(data): void {
    // console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }
  onActivate(data): void {
    // console.log('Activate', JSON.parse(JSON.stringify(data)));
  }
  onDeactivate(data): void {
    //  console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
  openModalPopUp() {
    this.ngxSmartModalService.getModal('productWiseSalesOrder').open();
  }
  
  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTrigger2.next();
    this.dtTrigger3.next();
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
    this.dtTrigger3.unsubscribe();
  }

}
