import { Component, Input, OnInit } from '@angular/core';
import { Storage } from '../../../../shared/utils/storage';
import { WMSService } from '../../../../services/integration-services/wms.service';
import { OutboundMasterDataService } from '../../../../services/integration-services/outboundMasterData.service';
import { OutboundProcessService } from '../../../../services/integration-services/outboundProcess.service';
import { AppService } from '../../../../shared/services/app.service';
import { CommonMasterDataService } from '../../../../services/integration-services/commonMasterData.service';
import { Constants } from '../../../../constants/constants';
import { EmitterService } from '../.././../../services/emitter.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ToWords } from 'to-words';
import { ApexService } from 'src/app/shared/services/apex.service';
import { CreatePurchaseOrderService } from 'src/app/services/createPurchaseOrder.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';





@Component({
  selector: 'app-createpopdf',
  templateUrl: './createpopdf.component.html',
  styleUrls: ['./createpopdf.component.scss']
})
export class CreatepopdfComponent implements OnInit {
  @Input() item: any = ''
  toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
    }
  });

  id: any;
  wareHouseDetails: any = {};
  invoiceCustomerDetails: any = {};
  editCustomerDetails: any = {};
  invoiceData: any = {};
  billToAddressData: any = {};
  formObj = this.configService.getGlobalpayload();
  supplierList: any[];
  supplierIDNames: any[];
  completerService: any;
  dataService: any;
  raisedPOCheck: any;
  productHeaderData: any;
  orgData: any = [];
  productsPOLines: any;
  supplierMasterInfo: any;
  dtTrigger: any;
  finalPurchaseobjectArray: any = [];
  totaltaxamountobj: any;
  totalValue: any;
  totalgrossamount: any;
  responseData: any = {}
  constructor(
    private wmsService: WMSService, private configService: ConfigurationService, private apexService: ApexService,
    private commonMasterDataService: CommonMasterDataService, private CreatePurchaseOrderService: CreatePurchaseOrderService,
    private appService: AppService, private excelRestService: ExcelRestService,
    private emitterService: EmitterService,
    private metaDataService: MetaDataService
  ) { }

  organizationidonly: any;
  organizationnameonly: any;
  organizationidnameonly: any;

  warehouseidonly: any;
  warehousenameonly: any;
  warehouseidnameonly: any;
  wareHouseIDName: any;

  ngOnInit() {
    this.id = this.appService.getParam('id');
    this.findPurchaseOrderByID();
    this.fetchLogo();
    this.fetchAllOrganizations();
    this.fetchAllWarehouseDetails();
    this.organizationidonly = this.configService.getOrganization().organizationID
    this.organizationnameonly = this.configService.getOrganization().organizationName,
      this.organizationidnameonly = this.configService.getOrganization().organizationIDName
    this.warehouseidonly = this.configService.getWarehouse().wareHouseID
    this.warehousenameonly = this.configService.getWarehouse().wareHouseName
    this.wareHouseIDName = this.configService.getWarehouse().wareHouseIDName
  }
  newTotalNetAmountobj: any;
  totalNetAmountobj: any;
  fetchWareHouseDetailsByID(ID?) {
    const wareHouseID = ID ? ID : Storage.getSessionUser().wareHouseInfo.wareHouseID;

    if (wareHouseID) {
      this.wmsService.fetchWareHouseDetailsByID(this.id, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouse) {
            this.wareHouseDetails = response.data.wareHouse;

            const Details = this.wareHouseDetails;


            if (ID) {
              this.productHeaderData = response.data.wareHouse;
            }
          }
        },
        (error) => {
        }
      );
    }
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

  prurchaseOrderLinesArray: any = [];
  printTotalNetAmount: any;
  taxPercentageobj: any;
  findPurchaseOrderByID() {
    this.wmsService.fetchPurchaseOrderByID(this.id, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrder) {
          const responseData = JSON.parse(JSON.stringify(response.data.purchaseOrder));
          this.wmsService.passedData = responseData;
          this.responseData = responseData
          this.totalNetAmountobj = responseData.totalNetAmount;
          this.taxPercentageobj = responseData.taxPercentage;

          this.newTotalNetAmountobj = this.toWords.convert(this.totalNetAmountobj);
          this.prurchaseOrderLinesArray = responseData.purchaseOrderLines;
          console.log(this.prurchaseOrderLinesArray);
          if (this.prurchaseOrderLinesArray) {
            this.prurchaseOrderLinesArray.forEach(el => {
              if (el.purchaseTaxes && el.purchaseTaxes.length > 0) {
                const taxNames: any = [...el.purchaseTaxes.map(x => x.taxName)]
                this.finalPurchaseobjectArray = [...new Set(taxNames)];
                console.log("purchase array" + this.finalPurchaseobjectArray);
                this.calculateTotalPart(this.prurchaseOrderLinesArray);
              }
            });

            let taxAmount = this.prurchaseOrderLinesArray.map(k => k.taxAmount)
            this.totalValue = taxAmount.reduce((k, m) => k + Number(m), 0)
          }
          if (this.prurchaseOrderLinesArray) {
            let grossAmount = this.prurchaseOrderLinesArray.map(k => k.grossAmount)
            this.totalgrossamount = grossAmount.reduce((k, m) => k + Number(m), 0)
            let totalTaxAmount = this.prurchaseOrderLinesArray.map(k => k.grossAmount)
            this.totalgrossamount = grossAmount.reduce((k, m) => k + Number(m), 0)
          }


          this.printTotalNetAmount = responseData.totalNetAmount;
          this.raisedPOCheck = responseData.raisePO;
          this.getSupplierDetailsById();
          // this.wmsService.passedData = responseData;

          this.productHeaderData = JSON.parse(JSON.stringify(responseData));
          if (responseData.taxGroup && responseData.taxGroup.taxGroup) {
            this.productHeaderData.taxGroup = {
              _id: responseData.taxGroup._id,
              taxGroup: responseData.taxGroup.taxGroup,
              taxGroupDescription: responseData.taxGroup.taxGroupDescription,
            }
          }
          else {
            this.productHeaderData.taxGroup = {
              _id: null,
              taxGroup: null,
              taxGroupDescription: null,
            }
          }
          if (this.productHeaderData.supplierMasterInfo && this.productHeaderData.supplierMasterInfo.supplierIDName) {
            this.supplierMasterInfo = responseData.supplierMasterInfo
          }
          this.productsPOLines = responseData.purchaseOrderLines;
          // this.dtTrigger.next();
          if (responseData.supplierMasterInfo && responseData.supplierMasterInfo.supplierIDName != null) {
            this.productHeaderData.supplierMasterInfo.supplierIDName = responseData.supplierMasterInfo.supplierIDName;
          } else {
            this.productHeaderData.supplierMasterInfo = {};
            this.productHeaderData.supplierMasterInfo.supplierIDName = '';
          }
          this.productHeaderData.poDeliveryDate =
            this.apexService.getDateFromMilliSec(responseData.poDeliveryDate);
          this.productHeaderData.receiptDate =
            this.apexService.getDateFromMilliSec(responseData.receiptDate);
        } else {
          this.productHeaderData = {};

        }
      },
      (error) => {
        this.productHeaderData = {};
      });
  }
  newArrray:any[]=[]
  globalTotalValue: any;
  globalSGSTValue: any;
  globalCGSTValue:any;
  globalIGSTValue:any;
  finalTotalArray:any[]=[];
  nextArray:any;
  calculateTotalPart(data) {
    this.finalTotalArray = [];
    if (this.prurchaseOrderLinesArray) {
  this.prurchaseOrderLinesArray.forEach(el => {
    if  (el.purchaseTaxes && el.purchaseTaxes.length > 0) {
      const taxAmount: number[] = el.purchaseTaxes.map(x => x.taxAmount);const totalTaxAmount: number = taxAmount.reduce((total, value) => total + value, 0);
      console.log("Total Tax Amount for Element:", totalTaxAmount);
      el.purchaseTaxes.forEach(tax => {
        this.finalPurchaseobjectArray.forEach(gst => {
          let index =  this.finalTotalArray.findIndex(x => x.taxName === gst);
          if (tax.taxName === gst) {
            if (index === -1) {
              let obj = {
                taxName: gst,
                totalTaxAmount: tax.taxAmount
              };
              this.finalTotalArray.push(obj);
            } else {
              this.finalTotalArray[index].totalTaxAmount = this.finalTotalArray[index].totalTaxAmount + tax.taxAmount;
            }
          }
        });
      });
    }

  });
}


     console.log(data);
    let totalValue = 0;
    if (data.length > 1) {
      data.forEach(item => {
        totalValue += item.taxAmount;
        console.log(totalValue);
        this.globalTotalValue = totalValue
        console.log(this.globalTotalValue)
      })
      console.log(this.globalTotalValue)
    } else {
      data.forEach(item => {
        totalValue = item.taxAmount;
        this.globalTotalValue = totalValue
      })
      console.log(this.globalTotalValue)
    }
  }
  getArray(prod, i) {

    if (this.prurchaseOrderLinesArray[i].purchaseTaxes) {
      return this.prurchaseOrderLinesArray[i].purchaseTaxes.filter(x => x.taxName == prod);
    }
    else {
      return 0
    }
  }

  /*  return this.prurchaseOrderLinesArray[i].purchaseTaxes.filter(x => x.taxName == prod ? x => x.taxName == prod :null); */

  supplierData: any;
  getSupplierDetailsById() {
    this.CreatePurchaseOrderService.supplierIDChange.subscribe(data => {
      if (data) {
        this.supplierData = data;
        this.fetchSupplierDetailsById();
        // this.fetchAllCountries();
      }
    });
  }
  printSupplierDetails: any = {};
  fetchSupplierDetailsById() {
    this.wmsService.fetchSupplierDetailsById(this.supplierData.supplierMasterID, this.formObj).subscribe(
      (response) => {
        if (response && response.data.supplierMaster) {
          this.printSupplierDetails = response.data.supplierMaster
          // console.log(this.printSupplierDetails)
        }
        else {
        }
      },
      (error) => {
      });
  }
  warehouses: any = [] = [];
  globalWarehouseDetails: any;
  wareHouseAddressOnly: any;
  wareHouseIdGstNumber:any;
  organizationAddressOnly: any;
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.warehouses = response.data.wareHouses;
          this.globalWarehouseDetails = this.warehouses
          const fetchWareHousAddressObject = this.globalWarehouseDetails.find(add => add.wareHouseName === this.configService.getWarehouse().wareHouseName)
          console.log(fetchWareHousAddressObject)
          this.wareHouseAddressOnly = fetchWareHousAddressObject.address;
          this.wareHouseIdGstNumber = fetchWareHousAddressObject.gstNumber;
        } else {
          this.warehouses = [];
        }
      },
      (error) => {
        this.warehouses = [];
      });
  }
  orgResponseList: any;
  fetchAllOrganizations() {
    this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['organizations'].length > 0) {
        this.orgResponseList = res['data']['organizations'];
        const fetchWareHousAddressObject = this.orgResponseList.find(add => add.organizationName === this.configService.getOrganization().organizationName)
        this.organizationAddressOnly = fetchWareHousAddressObject.address;
        this.orgData = res['data']['organizations'].find(x => x.organizationIDName === this.formObj.organizationIDName);
      }
    })
  }
}
