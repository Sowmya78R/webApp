import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common'; 
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';
 
export var single = [
 
];
@Component({
  selector: 'app-supplierwisepurchase',
  templateUrl: './supplierwisepurchase.component.html',
  styleUrls: ['./supplierwisepurchase.component.scss']
})
export class SupplierwisepurchaseComponent implements OnInit {

  @Input() supplierWiseDataBinding
  single: any[];
  view: any[] = [230, 250];
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';
  showFields = false;
  units: any;
  supplierWisePurchaseForm: FormGroup 
  valueimg: any;
  supplierChartData: any = [];
  supplierChartHelper: any = [];
  supplierWiseResponse:any;
  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  ngOnInit(): void {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createsupplierWisePurchaseFormDetailsForm();
  }
  constructor(private dashboardService: DashboardService,
     private fb: FormBuilder, private dashboardServices: DashboardService,
     private configService: ConfigurationService,
     private translate: TranslateService,
     public ngxSmartModalService:NgxSmartModalService,private excelService:ExcelService,private toastr:ToastrService) {
      this.translate.use(this.language);
    Object.assign(this, { single });
    this.dashboardServices.shareFormData.subscribe((data) => { 
      this.createsupplierWisePurchaseFormDetailsForm();
      this.valueimg = data;
   
      if (data != {}) {
        const customerReq = this.supplierWisePurchaseForm.value;
        this.supplierWisePurchaseForm.controls.type.setValue(data.type);       
        this.supplierWisePurchaseForm.controls.expectedDeliveryDateFrom.setValue(data.expectedDeliveryDateFrom);
        this.supplierWisePurchaseForm.controls.expectedDeliveryDateTo.setValue(data.expectedDeliveryDateTo);
       
       // this.callingApiOnDateChanged();
      }
    })
  }
  ngAfterViewInit(): void { 
   // this.dtTrigger.next();
  }
  exportAsXLSX() {
    if (this.supplierWiseResponse && this.supplierWiseResponse.length > 0) {
      this.excelService.exportAsExcelFile(this.supplierWiseResponse, 
        'supplierWiseResponse', 
      Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }
  callingApiOnDateChanged() {
   // this.dtTrigger.next()
    this.dashboardService.fetchAllSupplierWisePurchaseOrders(this.supplierWisePurchaseForm.value).subscribe(response => {
      if (response && response.status === 0 && response.data.supplierWisePurchaseOrderResponseList) {
        this.supplierWiseResponse = response.data.supplierWisePurchaseOrderResponseList;
      const supplierWiseResponse = response.data.supplierWisePurchaseOrderResponseList;
    //  this.dtTrigger.next()
      supplierWiseResponse.forEach( resp => {
        this.supplierChartHelper.push(
       { name:  resp.supplierIDName, value: resp.quantity })
       })
       this.supplierChartData = this.supplierChartHelper;
      }
    },
      (error: any) => {
      })
  }
  createsupplierWisePurchaseFormDetailsForm() {
    this.supplierWisePurchaseForm = this.fb.group({
      type:['Last 3 Months'],
      expectedDeliveryDateFrom: [''],
      expectedDeliveryDateTo: ['']
    })
  }
  colorScheme = {
    domain: ['#6e7214','#76b7ac','#009461','#814e28','#2781c7','#ff0000','#00ff00','#0000ff']
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
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  
  openModalPopUp()
  {
    this.ngxSmartModalService.getModal('supplierWisePurchase').open();
  
  }

}
