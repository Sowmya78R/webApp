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


@Component({
  selector: 'app-regionwisepurchaseorder',
  templateUrl: './regionwisepurchaseorder.component.html',
  styleUrls: ['./regionwisepurchaseorder.component.scss']
})
export class RegionwisepurchaseorderComponent implements OnInit {

  @Input() regionWiseDataBinding
  single: any[];
  view: any[] = [230, 250];
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';
  showFields = false;
  units: any;
  regionWiseChartHelper: any = [];
  regionWiseChartData: any = [];
  locationWisePurchaseOrderList: any;
  regionWisepurchaseOrderDetailsForm: FormGroup

  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective;

  valueimg: any;
  productChartHelper: any = []
  productChartData: any = []
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private dashboardService: DashboardService,
    private fb: FormBuilder, private dashboardServices: DashboardService,
    private configService: ConfigurationService,
    private translate: TranslateService,
    public ngxSmartModalService: NgxSmartModalService, private excelService: ExcelService, private toastr: ToastrService) {
    this.translate.use(this.language);
    Object.assign(this, {});
    this.dashboardServices.shareFormData.subscribe((data) => {
      this.createregionWisepurchaseOrderDetailsForm();
      this.valueimg = data;
      console.log(data);
      if (data != {}) {
        const customerReq = this.regionWisepurchaseOrderDetailsForm.value;
        this.regionWisepurchaseOrderDetailsForm.controls.type.setValue(data.type);
        this.regionWisepurchaseOrderDetailsForm.controls.expectedDeliveryDateFrom.setValue(data.expectedDeliveryDateFrom);
        this.regionWisepurchaseOrderDetailsForm.controls.expectedDeliveryDateTo.setValue(data.expectedDeliveryDateTo);
        console.log(this.regionWisepurchaseOrderDetailsForm.value.type);
        console.log(this.regionWisepurchaseOrderDetailsForm.value.expectedDeliveryDateFrom);
        console.log(this.regionWisepurchaseOrderDetailsForm.value.expectedDeliveryDateTo);
        console.log(this.regionWisepurchaseOrderDetailsForm.value);
        //  this.callingApiOnDateChanged();
      }
    })
  }
  ngOnInit(): void {
    this.createregionWisepurchaseOrderDetailsForm();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }

  callingApiOnDateChanged() {
  }


  exportAsXLSX() {
    if (this.locationWisePurchaseOrderList && this.locationWisePurchaseOrderList.length > 0) {
      this.excelService.exportAsExcelFile(this.locationWisePurchaseOrderList, 'locationWisePurchaseOrderList', Constants.EXCEL_IGNORE_FIELDS.LOCATIONS);
    } else {
      this.toastr.error('No data found');
    }
  }
  createregionWisepurchaseOrderDetailsForm() {
    this.regionWisepurchaseOrderDetailsForm = this.fb.group({
      type: ['Last 3 Months'],
      expectedDeliveryDateFrom: [''],
      expectedDeliveryDateTo: ['']
    })
  }
  colorScheme = {
    domain: ['#6e7214', '#76b7ac', '#009461', '#814e28', '#2781c7', '#ff0000', '#00ff00', '#0000ff']
  };
  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }
  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }
  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
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
    this.ngxSmartModalService.getModal('regionWisePurchaseOrder').open();

  }
}
