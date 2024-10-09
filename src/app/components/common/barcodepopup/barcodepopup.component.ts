import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-barcodepopup',
  templateUrl: './barcodepopup.component.html',
  styleUrls: ['./barcodepopup.component.scss']
})
export class BarcodepopupComponent implements OnInit {
  @Input() getBarcodeInfo: any;
  @Output() sendBarcodeConfirmation = new EventEmitter();
  scannerEnable: any = false;

  constructor(private ngxSmartModalService: NgxSmartModalService) { }

  ngOnInit() {
  }
  ngOnChanges() {
    if (this.getBarcodeInfo) {
      this.scannerEnable = this.getBarcodeInfo.toggle;
    }
  }
  closeScanner() {
    this.scannerEnable = false;
    this.ngxSmartModalService.getModal('scannerModalForWebCam').close();
  }
  scanSuccessHandler(event) {
    this.scannerEnable = false;
    this.sendBarcodeConfirmation.emit(event);
  }

}
