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
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
 

export var single = [
  {
    "name": "Germany",
    "value": 8940000
  },
  {
    "name": "USA",
    "value": 5000000
  },
  {
    "name": "France",
    "value": 7200000
  },
  {
    "name": "UK",
    "value": 6200000
  }
];



@Component({
  selector: 'app-categorywisepurchase', 
  templateUrl: './categorywisepurchase.component.html', 
  styleUrls: ['./categorywisepurchase.component.scss']
})
export class CategorywisepurchaseComponent implements OnInit {

  @Input() categoryWiseDataBinding
  single: any[];
  view: any[] = [230,250];
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';
  showFields = false;
  units: any;
  
  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective;

  productCategoryWiseHelper: any= []
  productCategoryWiseData : any;
  productCategoryWiseList:any;
  categoryWiseDetailsForm: FormGroup
  valueimg: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private dashboardService: DashboardService, 
    private fb: FormBuilder, private dashboardServices: DashboardService,
    private configService: ConfigurationService,
    private translate: TranslateService,
    public ngxSmartModalService:NgxSmartModalService,private excelService:ExcelService,private toastr:ToastrService) {
      this.translate.use(this.language);
    Object.assign(this, { single });
    this.dashboardServices.shareFormData.subscribe((data) => {
      this.createcategoryWiseDetailsForm();
      this.valueimg = data;
    
      if (data != {}) {
        const customerReq = this.categoryWiseDetailsForm.value;
        this.categoryWiseDetailsForm.controls.type.setValue(data.type);       
        this.categoryWiseDetailsForm.controls.expectedDeliveryDateFrom.setValue(data.expectedDeliveryDateFrom);
        this.categoryWiseDetailsForm.controls.expectedDeliveryDateTo.setValue(data.expectedDeliveryDateTo);
      
    //  this. callingApiOnDateChanged();
      }
    })
  }  
  ngOnInit(): void {
    this.createcategoryWiseDetailsForm();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  //  this.callingApiOnDateChanged();
  }
  
  callingApiOnDateChanged() { 
    this.dashboardService.fetchAllCategoryWisePurchaseOrders(this.categoryWiseDetailsForm.value).subscribe(response => {
      if (response && response.status === 0 && response.data.productCategoryWisePurchaseOrderResponseList) {
        this.productCategoryWiseList = response.data.productCategoryWisePurchaseOrderResponseList;
        const productCategoryWiseResponse = response.data.productCategoryWisePurchaseOrderResponseList;
        productCategoryWiseResponse.forEach(resp => {
          this.productCategoryWiseHelper.push(
            { name: resp.productCategoryName, value: resp.quantity })
        })
        this.productCategoryWiseData = this.productCategoryWiseHelper;
       
      }
    },
      (error: any) => {
      })
  }
  createcategoryWiseDetailsForm() {
    this.categoryWiseDetailsForm = this.fb.group({
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
  
  ngAfterViewInit(): void {
    
   // this.dtTrigger.next();
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
    this.ngxSmartModalService.getModal('purchaseCategoryWise').open();
  }
  
  exportAsXLSX() {
    if (this.productCategoryWiseList && this.productCategoryWiseList.length > 0) {
      this.excelService.exportAsExcelFile(this.productCategoryWiseList, 'productCategoryWiseList', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }

}
