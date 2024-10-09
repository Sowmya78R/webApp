import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';

@Component({
  selector: 'app-main-createpopdf',
  templateUrl: './main-createpopdf.component.html',
  styleUrls: ['./main-createpopdf.component.scss']
})
export class MainCreatepopdfComponent implements OnInit {
  wareHouseDetails: any = []
  formObj = this.configService.getGlobalpayload();
  id = this.appService.getParam('id');
  supplierList: any[];
  supplierMaster: any;
  supplierIDNames: any;
  dataService: any;
  completerService: any;
  wareHouseId: any;
  constructor(private wmsService: WMSService,
    private configService: ConfigurationService, private appService: AppService,) { }

  ngOnInit() {
    console.log('hello')
    console.log(this.id)
    this.findPurchaseOrderByID()
  }
  findPurchaseOrderByID() {
    const form = {
      'organizationIDName': this.formObj.organizationIDName,
      'wareHouseIDName': this.formObj.wareHouseIDName,
      "page": 1,
      "pageSize": 5,
      "sortDirection": null,
      "sortFields": null,
      "searchOnKeys": null,
      "searchKeyword": null,
      _id: this.appService.getParam('id')
    }
    this.wmsService.fetchPurchaseOrderByIDPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrderPaginationResponse.purchaseOrder) {
          this.wareHouseId = response.data.purchaseOrderPaginationResponse.purchaseOrder.wareHouseInfo.wareHouseMasterID
          this.fetchWareHouseDetailsByID()
        }
      })
  }
  fetchAllSupplierDetails() {
    this.supplierList = [];
    this.supplierIDNames = [];
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierList = response.data.supplierMasters;
          this.wmsService.passingCreatePOData = this.supplierMaster.find(x => x != null)

          console.log(this.wmsService.passingCreatePOData);
          console.log(this.id)
          if (this.id) {
            this.rerender();
            this.findPurchaseOrderByID();
          }
        } else {
          this.dataService = this.completerService.local(this.supplierIDNames);
        }
      },
      (error) => {
        this.supplierList = [];
      });
  }
  rerender() {
    throw new Error('Method not implemented.');
  }
  fetchWareHouseDetailsByID() {
    if (this.id) {
      this.wmsService.fetchWareHouseDetailsByID(this.wareHouseId, this.formObj).subscribe(
        (response) => {
          console.log(response);
          if (response && response.status === 0 && response.data.wareHouse) {
            this.wareHouseDetails = response.data.wareHouse;
            this.wmsService.wareHouseData = this.wareHouseDetails
            console.log(this.wareHouseDetails);
          }
        },
        (error) => {
        }
      );
    }
  }
}
