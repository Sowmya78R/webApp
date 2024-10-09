import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';


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
  selector: 'app-regionwise',
  templateUrl: './regionwise.component.html',
  styleUrls: ['./regionwise.component.scss']
})
export class RegionwiseComponent implements OnInit {
  @Input() dataToDisplay;

  @ViewChild(DataTableDirective)
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtElement: DataTableDirective;

  single: any[];
  view: any[] = [250, 250];
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';
  showFields = false;
  units: any;
  regionWiseDetailsForm: FormGroup
  valueimg: any;
  locationWiseSalesOrderHelper: any = [];
  locationWiseSalesOrderData: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private dashboardService: DashboardService,
    private configService: ConfigurationService,
    private translate: TranslateService,
    private fb: FormBuilder, private dashboardServices: DashboardService, public ngxSmartModalService: NgxSmartModalService) {
      this.translate.use(this.language);
    Object.assign(this, { single });
    this.dashboardServices.shareFormData.subscribe((data) => {
    })
  }
  ngOnInit(): void {
    this.regionWiseDetailsForm = this.fb.group({
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
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  openModalPopUp() {
    this.ngxSmartModalService.getModal('regionWiseSalesOrder').open();
  }

}
