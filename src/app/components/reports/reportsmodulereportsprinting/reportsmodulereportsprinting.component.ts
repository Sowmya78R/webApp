import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportsmodulereportsprinting',
  templateUrl: './reportsmodulereportsprinting.component.html',
  styleUrls: ['./reportsmodulereportsprinting.component.scss']
})
export class ReportsmodulereportsprintingComponent implements OnInit {

  tripInput = false;
  selectedValue: any;
  constructor(private router: Router) {
    this.selectedValue = router.url.split('/')[2]
    console.log(router.url)
    console.log(this.selectedValue)
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
