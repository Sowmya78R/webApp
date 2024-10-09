import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportprint',
  templateUrl: './reportprint.component.html',
  styleUrls: ['./reportprint.component.scss']
})
export class ReportprintComponent implements OnInit {
  tripInput = false;
  selectedValue: any;
  employeePerformanceRouting:any;
  constructor(private router: Router) {
    this.selectedValue = router.url.split('/')[4]
    this.employeePerformanceRouting = router.url.split('/')[3]
  }
  ngOnInit() {
  }
  trigeerTripSheet() {
    this.tripInput = true
    setTimeout(() => {
      this.tripInput = false;
    }, 200)
  }
}
