import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-globalreportprinting',
  templateUrl: './globalreportprinting.component.html',
  styleUrls: ['./globalreportprinting.component.scss']
})
export class GlobalreportprintingComponent implements OnInit {
  tripInput = false;
  selectedValue: any;
  splitAgain : any;
  constructor(private router: Router) {
    this.selectedValue = router.url.split('/')[3]
    console.log(router.url)
    console.log(this.selectedValue)
    this.splitAgain = this.selectedValue.split('?')[0]
    console.log(this.splitAgain);
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
