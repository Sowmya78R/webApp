import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-printing-barcode',
  templateUrl: './printing-barcode.component.html',
  styleUrls: ['./printing-barcode.component.scss']
})
export class PrintingBarcodeComponent implements OnInit {
  tripInput = false;
  constructor() { }

  ngOnInit() {
  }
  trigeerTripSheet() {
    this.tripInput = true
    setTimeout(() => {
      this.tripInput = false;
    }, 200)
  }

}
