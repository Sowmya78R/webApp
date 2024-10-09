import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-pdfputway',
  templateUrl: './pdfputway.component.html',
  styleUrls: ['./pdfputway.component.scss']
})
export class PdfputwayComponent implements OnInit {

  formObj = this.configService.getGlobalpayload();
  selectedValue: any;
  organizationidonly: any;
  organizationnameonly: any;
  organizationidnameonly: any;
  warehouseidonly: any;
  warehousenameonly: any;
  warehouseidnameonly: any;
  employeePerformanceRouting:any;
  logoList = { "_id": null, "logoName": null };
  logoImage: any;
  angainLogoIamge :any;
  wareHouseIDName: any;
  @Input() set tripInput(value: boolean) {
  }
  constructor( private router: Router,private wmsService: WMSService, private excelRestService: ExcelRestService,
    private metaDataService: MetaDataService, private configService: ConfigurationService,) {
      this.selectedValue = router.url.split('/')[4];

      this.employeePerformanceRouting = router.url.split('/')[3]
    }
    ngOnInit() {
      this.organizationidonly = this.configService.getOrganization().organizationID
      this.organizationnameonly = this.configService.getOrganization().organizationName,
        this.organizationidnameonly = this.configService.getOrganization().organizationIDName
      this.warehouseidonly = this.configService.getWarehouse().wareHouseID
      this.warehousenameonly = this.configService.getWarehouse().wareHouseName
      this.wareHouseIDName = this.configService.getWarehouse().wareHouseIDName
      this.fetchLogo();
      this.fetchAllWarehouseDetails();
      this.fetchAllOrganizations();
    }
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
  warehouses:any = []=[];
  globalWarehouseDetails:any;
  wareHouseAddressOnly:any;
  organizationAddressOnly:any;
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.warehouses = response.data.wareHouses;
          this.globalWarehouseDetails = this.warehouses
          const fetchWareHousAddressObject = this.globalWarehouseDetails.find(add =>add.wareHouseName === this.configService.getWarehouse().wareHouseName)
          this.wareHouseAddressOnly = fetchWareHousAddressObject.address;
        } else {
          this.warehouses = [];
        }
      },
      (error) => {
        this.warehouses = [];
      });
  }
  orgResponseList:any;
  fetchAllOrganizations() {
      this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
        if (res['status'] == 0 && res['data']['organizations'].length > 0) {
          this.orgResponseList = res['data']['organizations'];
          const fetchWareHousAddressObject = this.orgResponseList.find(add =>add.organizationName === this.configService.getOrganization().organizationName)
          this.organizationAddressOnly = fetchWareHousAddressObject.address;
        }
      })

  }

}
