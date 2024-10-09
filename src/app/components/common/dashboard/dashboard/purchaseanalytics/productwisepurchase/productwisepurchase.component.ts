import { Component, OnInit, ViewChild, Input, ViewChildren, QueryList } from '@angular/core';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-productwisepurchase',
  templateUrl: './productwisepurchase.component.html',
  styleUrls: ['./productwisepurchase.component.scss']
})
export class ProductwisepurchaseComponent implements OnInit {

  @Input() ProductWiseDataBinding
  single: any[];
  /*  @ViewChild(DataTableDirective)
   dtOptions: DataTables.Settings = {};
   dtTrigger: Subject<any> = new Subject();
   dtElement: DataTableDirective; */
  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective;
  @ViewChild(DataTableDirective)
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;

  dtTrigger1: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  dtTrigger4: Subject<any> = new Subject<any>();
  dtTrigger5: Subject<any> = new Subject<any>();
  dtTrigger6: Subject<any> = new Subject<any>();
  dtTrigger7: Subject<any> = new Subject<any>();
  view: any[] = [230, 250];
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';
  showFields = false;
  units: any;
  productWiseDetailsForm: FormGroup
  valueimg: any;
  productChartHelper: any = []
  productChartData: any = []
  productWiseResponseList: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private dashboardService: DashboardService, private fb: FormBuilder,
    private dashboardServices: DashboardService,
    private configService: ConfigurationService,
    private translate: TranslateService,
    public ngxSmartModalService: NgxSmartModalService, private excelService: ExcelService, private toastr: ToastrService) {
      this.translate.use(this.language);
    Object.assign(this, {});
    this.dashboardServices.shareFormData.subscribe((data) => {
      this.createProductWiseDetailsForm();
      this.valueimg = data;
     
      if (data != {}) {
        const customerReq = this.productWiseDetailsForm.value;
        this.productWiseDetailsForm.controls.type.setValue(data.type);
        this.productWiseDetailsForm.controls.expectedDeliveryDateFrom.setValue(data.expectedDeliveryDateFrom);
        this.productWiseDetailsForm.controls.expectedDeliveryDateTo.setValue(data.expectedDeliveryDateTo);
       
      }
    })
  }
  ngOnInit(): void {
    this.createProductWiseDetailsForm();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    //  this.callingApiOnDateChanged();
  }
  exportAsXLSX() {
    if (this.productWiseResponseList && this.productWiseResponseList.length > 0) {
      this.excelService.exportAsExcelFile(this.productWiseResponseList, 'productWise', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }//
  callingApiOnDateChanged() {
    this.dashboardService.fetchAllProductWisePurchaseOrders(this.productWiseDetailsForm.value).subscribe(response => {
      if (response && response.status === 0 && response.data.productWisePurchaseOrderResponseList) {
        this.productWiseResponseList = response.data.productWisePurchaseOrderResponseList;
      
        const productWiseResponse = response.data.productWisePurchaseOrderResponseList;
        productWiseResponse.map(resp => {
          this.productChartHelper.push(
            { name: resp.productName, value: resp.quantity })
        })
        this.productChartData = this.productChartHelper;
       
      }
    },
      (error: any) => {
      })
  }
  createProductWiseDetailsForm() {
    this.productWiseDetailsForm = this.fb.group({
      type: ['Last 3 Months'],

      expectedDeliveryDateFrom: [''],
      expectedDeliveryDateTo: ['']
    })
  }
  colorScheme = {
    domain: ['#6e7214', '#76b7ac', '#009461', '#814e28', '#2781c7', '#ff0000', '#00ff00', '#0000ff']
  };
  onSelect(data): void {
    
  }
  onActivate(data): void {
   
  }
  onDeactivate(data): void {
   
  }
  changeOfType(data) {
    if (data === "Custom Dates") {
      this.showFields = true;
    }
    else {
      this.showFields = false;
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger3.next();
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
   
    this.dtTrigger3.unsubscribe();
  }
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance)
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
    });
    setTimeout(() => {
     
      this.dtTrigger3.next();
    });
  }
  openModalPopUp() {
    this.ngxSmartModalService.getModal('productWisePurchaseOrder').open();
  }
}
