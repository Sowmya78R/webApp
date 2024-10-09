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
  selector: 'app-categorywise',
  templateUrl: './categorywise.component.html',
  styleUrls: ['./categorywise.component.scss']
})
export class CategorywiseComponent implements OnInit {

  @Input() dataToBind

  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  dtTrigger3: any = new Subject();
  dtTrigger4: any = new Subject();
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;


  single: any[];
  view: any[] = [230,250];
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';
  showFields = false;
  units: any;
  categoryWiseSalesOrderDetailsForm: FormGroup
  valueimg: any;
  productCategoryWiseSalesOrderHelper: any= [];
  productCategoryWiseSalesOrderData : any;
  categoryWiseResponceList:any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private dashboardService: DashboardService, private fb: FormBuilder,
    private dashboardServices: DashboardService,
    private configService: ConfigurationService,
    private translate: TranslateService,
    public ngxSmartModalService:NgxSmartModalService,private toastr:ToastrService,
    private excelService:ExcelService) {
      this.translate.use(this.language);
    Object.assign(this, { single });
    this.dashboardServices.shareFormData.subscribe((data) => {
     // this.createcategoryWiseDetailsForm();
      this.valueimg = data;
 
      if (data != {}) {
        //const customerReq = this.categoryWiseSalesOrderDetailsForm.value;
       // this.categoryWiseSalesOrderDetailsForm.controls.type.setValue(data.type);       
       // this.categoryWiseSalesOrderDetailsForm.controls.expectedDeliveryDateFrom.setValue(data.expectedDeliveryDateFrom);
       // this.categoryWiseSalesOrderDetailsForm.controls.expectedDeliveryDateTo.setValue(data.expectedDeliveryDateTo);
     //   console.log(this.categoryWiseSalesOrderDetailsForm.value.type);
      //  console.log(this.categoryWiseSalesOrderDetailsForm.value.expectedDeliveryDateFrom);
       // console.log(this.categoryWiseSalesOrderDetailsForm.value.expectedDeliveryDateTo);
      //  this.callingApiOnDateChanged();
      }
    })
  }

  ngOnInit(): void {
    this.categoryWiseSalesOrderDetailsForm = this.fb.group({
      type:['Last 3 Months'],
      expectedDeliveryDateFrom: [''],
      expectedDeliveryDateTo: ['']
    })
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
 
 /*  callingApiOnDateChanged() { 
    this.dashboardService.fetchAllCategoryWiseSalesOrder(this.categoryWiseSalesOrderDetailsForm.value).subscribe(response => {
      if (response && response.status === 0 && response.data.productCategoryWiseSalesOrderResponseList) {
        const categoriesSalesOrderWiseList = response.data.productCategoryWiseSalesOrderResponseList;
        this.categoryWiseResponceList = response.data.productCategoryWiseSalesOrderResponseList;
        categoriesSalesOrderWiseList.map(resp => {
          this.productCategoryWiseSalesOrderHelper.push(
            { name: resp.productCategoryName, value: resp.quantity })
        })
        this.productCategoryWiseSalesOrderData = this.productCategoryWiseSalesOrderHelper;
      }
    },
      (error: any) => {
      })
  }
  */
  createcategoryWiseDetailsForm() {
    this.categoryWiseSalesOrderDetailsForm = this.fb.group({
      type:['Last 3 Months'],
      expectedDeliveryDateFrom: [''],
      expectedDeliveryDateTo: ['']
    })
  }

  colorScheme = {
    domain: ['#6e7214','#76b7ac','#009461','#814e28','#2781c7','#ff0000','#00ff00','#0000ff']
};
  onSelect(data): void {
 //   console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }
  onActivate(data): void {
 //   console.log('Activate', JSON.parse(JSON.stringify(data)));
  }
  onDeactivate(data): void {
 //   console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
 /*  changeOfType(data) {
    if (data === "Custom Dates") {
      this.showFields = true;
    }
    else {
      this.showFields = false;
    }
  }  */
 
  openModalPopUp() {
    this.ngxSmartModalService.getModal('categoryWiseSalesOrder').open();
  }
  exportAsXLSX() {
    if (this.categoryWiseResponceList && this.categoryWiseResponceList.length > 0) {
      this.excelService.exportAsExcelFile(this.categoryWiseResponceList, 'categoryWise', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }
  
  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTrigger2.next();
    this.dtTrigger3.next();
    this.dtTrigger4.next();
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
    this.dtTrigger4.unsubscribe();
  }


}
