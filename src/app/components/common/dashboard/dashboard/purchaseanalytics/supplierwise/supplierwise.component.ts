import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common'; 
 

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
  selector: 'app-supplierwise',
  templateUrl: './supplierwise.component.html',
  styleUrls: ['./supplierwise.component.scss']
})
export class SupplierwiseComponent implements OnInit {
  single: any[];
  view: any[] = [200, 200];
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';
  showFields = false;
  units: any;
  regionWiseDetailsForm: FormGroup
  valueimg: any;

  constructor(private dashboardService: DashboardService, private fb: FormBuilder, private dashboardServices: DashboardService) {
    Object.assign(this, { single });
    this.dashboardServices.shareFormData.subscribe((data) => {
      this.createregionWiseDetailsForm();

      this.valueimg = data;
      console.log(data);
      if (data != {}) {
        const customerReq = this.regionWiseDetailsForm.value;
        this.regionWiseDetailsForm.controls.type.setValue(data.type);       
        this.regionWiseDetailsForm.controls.expectedDeliveryDateFrom.setValue(data.expectedDeliveryDateFrom);
        this.regionWiseDetailsForm.controls.expectedDeliveryDateTo.setValue(data.expectedDeliveryDateTo);
        console.log(this.regionWiseDetailsForm.value.type);
        console.log(this.regionWiseDetailsForm.value.expectedDeliveryDateFrom);
        console.log(this.regionWiseDetailsForm.value.expectedDeliveryDateTo);
      }
    })
  }
  callingApiOnDateChanged() { 
    this.dashboardService.fetchAllCustomerWiseDetails(this.regionWiseDetailsForm.value).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units; 
      }
    },
      (error: any) => {
      });
  }
  ngOnInit(): void {
   // this.callingApiData();
    this.createregionWiseDetailsForm();
  }

  createregionWiseDetailsForm() {
    this.regionWiseDetailsForm = this.fb.group({
      type: [''],
      expectedDeliveryDateFrom: [''],
      expectedDeliveryDateTo: ['']
    })
  }
 /*  callingApiData() {
    this.dashboardService.fetchAllCustomerWiseDetails(this.regionWiseDetailsForm.value).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {
      });
  } */
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
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

}
