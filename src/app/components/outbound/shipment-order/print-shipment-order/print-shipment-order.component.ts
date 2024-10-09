import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { OutboundMasterDataService } from 'src/app/services/integration-services/outboundMasterData.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { WmsCommonService } from 'src/app/services/wms-common.service';
import { AppService } from 'src/app/shared/services/app.service';

@Component({
  selector: 'app-print-shipment-order',
  templateUrl: './print-shipment-order.component.html',
  styleUrls: ['./print-shipment-order.component.scss']
})
export class PrintShipmentOrderComponent implements OnInit {
  formObj = this.configService.getGlobalpayload();
  soID: any;
  eSOForm: FormGroup;
  isShipmentConfirmed: any = false;
  shipmentOrder: any;
  shipmentOrderLines: any;
  salesOrderID: any;
  header: any = {
    customerMasterInfo: {
      customerID: ''
    },
    "wareHouseTransferDestinationInfo": {
      "wareHouseTransferTransactionID": null,
      "wareHouseID": null,
      "wareHouseName": null,
      "wareHouseIDName": null,
      "wareHouseTransferMasterID": null,
      "organizationIDName": null,
      "organizationID": null,
      "organizationName": null,
      "fullWareHouseTransferTransactionID": null,
      "wareHouseTransferTransactionIDPrefix": null,
    },
    supplierMasterInfo: {
      supplierMasterID: null,
      supplierID: null,
      supplierName: null,
      supplierIDName: null
    },
    orderType: 'Sales Order'
  };
  raisedStatus: boolean = false;
  responseData: any = {};
  whData: any = null;
  supplierDetails: any = null;
  editCustomerDetails: any = null;
  wareHouseDetails: any = null;
  dispatchDate: any;

  constructor(
    private metaDataService: MetaDataService, private wmsService: WMSService,
    public configService: ConfigurationService,
    private appService: AppService, private outboundMasterDataService: OutboundMasterDataService,
    private outboundProcessService: OutboundProcessService,
    private wmsCommonService: WmsCommonService,
  ) {

  }

  ngOnInit() {
    this.fetchLogo();
    this.soID = this.appService.getParam('id');
    this.fetchShipmentOrderByID();
    this.fetchWH();
  }
  fetchWH() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse) {
          this.whData = response.data.wareHouse[0];
        }
      },
      (error) => {
      }
    );
  }
  fetchShipmentOrderByID() {
    if (this.soID) {
      this.outboundProcessService.fetchShipmentOrderByID(this.soID, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.shipmentOrder) {
            this.raisedStatus = response.data.shipmentOrder.status != 'Open' ? true : false;
            this.shipmentOrder = response.data.shipmentOrder;
            if (this.shipmentOrder && this.shipmentOrder.status === 'Closed') { this.isShipmentConfirmed = true; }
            if (!response.data.shipmentOrder.customerMasterInfo) {
              response.data.shipmentOrder.customerMasterInfo = {
                customerIDName: null,
                customerID: null,
                customerName: null,
                customerMasterID: null
              }
            }
            if (!response.data.shipmentOrder.supplierMasterInfo) {
              response.data.shipmentOrder.supplierMasterInfo = {
                supplierMasterID: null,
                supplierID: null,
                supplierName: null,
                supplierIDName: null
              }
            }
            if (!response.data.shipmentOrder.wareHouseTransferDestinationInfo) {
              response.data.shipmentOrder["wareHouseTransferDestinationInfo"] = {
                "wareHouseTransferTransactionID": null,
                "wareHouseID": null,
                "wareHouseName": null,
                "wareHouseIDName": null,
                "wareHouseTransferMasterID": null,
                "organizationIDName": null,
                "organizationID": null,
                "organizationName": null,
                "fullWareHouseTransferTransactionID": null,
                "wareHouseTransferTransactionIDPrefix": null,
              }
            }
            this.header = response.data.shipmentOrder;
            this.header.vehicleNumber = null;
            this.header.serviceProviderIDName = null;
            if (response.data.shipmentOrder.vehicleInfo) {
              this.header.vehicleNumber = response.data.shipmentOrder.vehicleInfo.vehicleNumber
            }
            if (response.data.shipmentOrder.serviceProviderInfo) {
              this.header.serviceProviderIDName = response.data.shipmentOrder.serviceProviderInfo.serviceProviderIDName
            }
            this.header.orderDate = this.header.salesOrderDate ?
              this.wmsCommonService.getDateFromMilliSec(this.header.salesOrderDate) : this.header.salesOrderDate;
            this.header.invoiceDate = this.header.invoiceDate ?
              this.wmsCommonService.getDateFromMilliSec(this.header.invoiceDate) : this.header.invoiceDate;

            this.salesOrderID = this.shipmentOrder.soID;
            this.shipmentOrderLines = response.data.shipmentOrder.shipmentOrderLines;
            let a = this.shipmentOrderLines.length-1
            this.dispatchDate=this.shipmentOrderLines[a].dispatchDate
            console.log(this.dispatchDate)
            if (response.data.shipmentOrder.orderType == 'Sales Order') {
              this.fetchCustomerByID(response.data.shipmentOrder.customerMasterInfo.customerMasterID);
            }
            else if (response.data.shipmentOrder.orderType == 'WareHouseTransfer' || response.data.shipmentOrder.orderType == 'WareHouseTransfer Returns') {
              this.fetchWareHouseDetailsByID(response.data.shipmentOrder.wareHouseTransferDestinationInfo);

            }
            else if (response.data.shipmentOrder.orderType == 'Purchase Returns') {
              this.fetchSupplierDetailsById(response.data.shipmentOrder.supplierMasterInfo.supplierMasterID);
            }

          } else {

          }
        },
        (error) => {
          this.shipmentOrderLines = [];
        }
      );
    }
  }
  fetchCustomerByID(ID) {
    this.outboundMasterDataService.fetchCustomerByID(ID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customer) {
          this.editCustomerDetails = response.data.customer;
        }
      },
      (error) => {
      }
    );
  }
  fetchSupplierDetailsById(ID) {
    this.wmsService.fetchSupplierDetailsById(ID, this.formObj).subscribe(
      (response) => {
        if (response && response.data.supplierMaster) {
          this.supplierDetails = response.data.supplierMaster;
        }
      })
  }
  fetchWareHouseDetailsByID(data) {
    let obj = {
      "organizationIDName": data.organizationIDName,
      "wareHouseIDName": data.wareHouseIDName
    }
    // if (this.wareHouseId) {
    this.wmsService.fetchAllWarehouses(obj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseDetails = response.data.wareHouses[0];
          // if (data.wareHouseID) {
          //   this.wareHouseTransdetails = response.data.wareHouse;
          // }
        }
      },
      (error) => {
      }
    );
    // }
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
