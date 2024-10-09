import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';

@Component({
  selector: 'app-maingrnpdf',
  templateUrl: './maingrnpdf.component.html',
  styleUrls: ['./maingrnpdf.component.scss']
})
export class MaingrnpdfComponent implements OnInit {

  grManagementLines: any = [];
  formObj = this.configService.getGlobalpayload();
  grnManagement: any;


  constructor(
    private wmsService: WMSService,
    private configService: ConfigurationService,
    private appService: AppService,
  ) { }

  ngOnInit() {
    // this.getGoodsReceiptManagementByID();
  }
  // getGoodsReceiptManagementByID() {
  //   if (this.appService.getParam('id')) {
  //     this.wmsService.fetchGoodsReceiptManagementByID(this.appService.getParam('id'), this.formObj).subscribe(
  //       (response) => {
  //         if (response && response.status === 0 && response.data.goodsReceiptManagement) {
  //           this.grManagementLines = response.data.goodsReceiptManagement.goodsReceiptManagementLines;
  //           this.grnManagement =  response.data.goodsReceiptManagement
  //           console.log(this.grManagementLines)
  //         }
  //         else {
  //           this.grManagementLines = [];
        
  //         }
  //       },
  //       (error) => {
  //         this.grManagementLines = [];
  //       }
  //     );
  //   }
  //   else {
  //     this.grManagementLines = [];
    
  //   }
  // }


}
