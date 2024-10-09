import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { Subject, forkJoin } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { WmsCommonService } from 'src/app/services/wms-common.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ToastrService } from 'ngx-toastr';
import { Constants } from 'src/app/constants/constants';
import { FormBuilder, FormGroup } from '@angular/forms';

export var single = [
 
]; 

@Component({
  selector: 'app-dashboarddemo',
  templateUrl: './dashboarddemo.component.html',
  styleUrls: ['./dashboarddemo.component.scss']
})

export class DashboarddemoComponent implements OnInit {
  ngOnInit(): void {
    //Called after ngOnInit when the component's or directive's content has been initialized.
    //Add 'implements AfterContentInit' to the class.
    
  }
 /*  showFields = false;
  units: any;
  dashboardDetailsForm:FormGroup;
  
  ngOnInit(): void {
    this.createcustomerDetailsForm();
  }
  constructor(private dashboardService:DashboardService,private fb:FormBuilder,
    private dashboardsService:DashboardService)
  {

    Object.assign(this, { single });
  }

  onTypeChange()
  {
    this.dashboardsService.shareFormData.next(this.dashboardDetailsForm.value);
  } 

 createcustomerDetailsForm()
 {
   this.dashboardDetailsForm = this.fb.group({
     type:[''],
     expectedDeliveryDateFrom:[''],
     expectedDeliveryDateTo:['']
   })
 }

  callingApiOnDateChanged(){
    this.dashboardService.fetchAllCustomerWiseDetails(this.dashboardDetailsForm.value).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {
      });
  }
 /*  callingApiData()
  {
      this.dashboardService.fetchAllCustomerWiseDetails().subscribe(response => {
        if (response && response.status === 0 && response.data.units) {
          this.units = response.data.units;
        }
      },
        (error: any) => {
        });
    } 
  changeOfType(data)
  {
    if(data === "Custom Dates")
    {
      this.showFields = true;
    }
    else{
      this.showFields = false;

    }

  }
  
  single: any[];
  multi: any[] = [
    {
      name: 'Red',
      series: [
        {
          name: 1000,
          value: 100000
        },
        {
          name: 800,
          value: 70000
        },
        {
          name: 600,
          value: 20444
        }
      ]
    },
    {
      name: 'Green',
      series: [
        {
          name: 15,
          value: 20
        },
        {
          name: 30,
          value: 80
        },
        {
          name: 45,
          value: 190
        }
      ]
    }
  ];
  view: any[] = [700, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Number';
  showYAxisLabel = true;
  yAxisLabel = 'Color Value';
  timeline = true;

  colorScheme = {
    domain: ['red', 'green']
  };

  line, area
  autoScale = true;


  onSelect(event) {
  console.log(event);
  }
 */
}
