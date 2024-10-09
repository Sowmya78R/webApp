import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';

@Component({
  selector: 'app-grnpdf',
  templateUrl: './grnpdf.component.html',
  styleUrls: ['./grnpdf.component.scss']
})
export class GrnpdfComponent implements OnInit {
  grManagementLines: any = [];
  formObj = this.configService.getGlobalpayload();
  grnManagement: any= []
  orgData: any = [];
  constructor(
    private wmsService: WMSService,
    private configService: ConfigurationService,
    private excelRestService: ExcelRestService,
    private metaDataService: MetaDataService,
    private appService: AppService,
  ) { }
  organizationidonly: any;
  organizationnameonly: any;
  organizationidnameonly: any;

  ngOnInit() {
    this.getGoodsReceiptManagementByID();
    this.fetchLogo();
    this.fetchAllOrganizations();
    this.organizationidonly = this.configService.getOrganization().organizationID
    this.organizationnameonly = this.configService.getOrganization().organizationName,
      this.organizationidnameonly = this.configService.getOrganization().organizationIDName
  }
  
  
  getGoodsReceiptManagementByID() {
    if (this.appService.getParam('id')) {
      this.wmsService.fetchGoodsReceiptManagementByID(this.appService.getParam('id'), this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.goodsReceiptManagement) {
            this.grManagementLines = response.data.goodsReceiptManagement.goodsReceiptManagementLines;
            this.grnManagement =  response.data.goodsReceiptManagement
            console.log(this.grnManagement)
            
          }
          else {
            this.grManagementLines = [];
        
          }
        },
        (error) => {
          this.grManagementLines = [];
        }
      );
    }
    else {
      this.grManagementLines = [];
    
    }
  }
  organizationAddressOnly: any;
  orgResponseList: any;
  fetchAllOrganizations() {
    this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['organizations'].length > 0) {
        this.orgResponseList = res['data']['organizations'];
        const fetchWareHousAddressObject = this.orgResponseList.find(add => add.organizationName === this.configService.getOrganization().organizationName)
        this.organizationAddressOnly = fetchWareHousAddressObject.address;
        this.orgData = res['data']['organizations'].find(x=>x.organizationIDName === this.formObj.organizationIDName);
      }
    })
  }
  logoList = { "_id": null, "logoName": null };
  logoImage: any;
  fetchLogo() {
    this.metaDataService.getAllLogos(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.logos && res.data.logos.length > 0) {
        this.logoList = res.data.logos[0];
        const fileNames = JSON.parse(JSON.stringify(this.logoList.logoName));
        this.metaDataService.viewImages(fileNames).subscribe(data => {
          this.logoImage = 'data:text/plain;base64,' + data['data']['resource'];
          this.logoImage = this.metaDataService.dataURLtoFile(this.logoImage, fileNames);
          this.metaDataService.imgGlobalChanged(this.logoImage, 'logoImage', true);
        });
      }
      else {
        this.logoList = { "_id": null, "logoName": null };
      }
    })
  }
}
