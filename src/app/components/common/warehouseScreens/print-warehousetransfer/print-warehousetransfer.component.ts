import { Component, OnInit } from '@angular/core';
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
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-print-warehousetransfer',
  templateUrl: './print-warehousetransfer.component.html',
  styleUrls: ['./print-warehousetransfer.component.scss']
})
export class PrintWarehousetransferComponent implements OnInit {
  toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
    }
  });
  formObj = this.configService.getGlobalpayload();
  idForUpdate = this.appService.getParam('id');
  destinationFormObj = this.configService.getGlobalpayload();
  overAllLines: any = []
  warehouseTransferData: any = []
  inSource: boolean = false;
  wareHouseDetails: any = {}
  destinationWareHouseDetails: any = {}
  finalSalesobjectArray: any = [];
  totalNetAmountobj: any;
  newTotalNetAmountobj: any;
  totalValue: any;
  organizationAddressOnly: any;
  orgData: any;
  whDefaultData: any = null;

  constructor(
    private wmsService: WMSService, private configService: ConfigurationService, private apexService: ApexService,
    private commonMasterDataService: CommonMasterDataService, private CreatePurchaseOrderService: CreatePurchaseOrderService,
    private appService: AppService, private excelRestService: ExcelRestService,
    private emitterService: EmitterService,
    private metaDataService: MetaDataService
  ) { }

  ngOnInit() {
    this.fetchLogo()
    this.editbyId()
    this.fetchAllOrganizations()
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
  totalDecimalValue: any;
  editbyId() {
    const _id = this.idForUpdate;
    this.wmsService.getWareHouseTransferDetailsbyId(_id, this.destinationFormObj).subscribe(data => {
      if (data['status'] == 0 && data['data'].wareHouseTransfer) {
        this.warehouseTransferData = data['data'].wareHouseTransfer
        this.warehouseTransferData.financialYearName = null;
        const pId = this.formObj;
        pId['dateFrom'] = new Date(this.warehouseTransferData.createdDate);
        pId['dateTo'] = new Date(this.warehouseTransferData.createdDate);
        this.wmsService.fetchFinancialYearConfigByDates(pId).subscribe(res => {
          if (res && res['status'] == 0 && res['data'].financialYearConfiguration) {
            this.warehouseTransferData.financialYearName = res['data'].financialYearConfiguration.financialYearName
          }
        })
        this.destinationWareHouseDetails = this.warehouseTransferData.shippingToAddress
        this.wareHouseDetails = this.warehouseTransferData.shippingFromAddress
        this.totalNetAmountobj = this.warehouseTransferData.totalNetAmount;
        this.newTotalNetAmountobj = this.totalNetAmountobj ? this.toWords.convert(this.totalNetAmountobj) : null;
        this.overAllLines = JSON.parse(JSON.stringify(data['data'].wareHouseTransfer.wareHouseTransferLines));
        this.getDefaultWareHouse();
        let totAmount: any = 0, totTaxAmount: any = 0, totalTax: any = 0
        this.overAllLines.forEach((item: any) => {
          totAmount = DecimalUtils.add(totAmount, item.grossAmount);
          totTaxAmount = DecimalUtils.add(totTaxAmount, item.taxAmount);
          totalTax = DecimalUtils.add(totalTax, item.taxPercentage);
        });

        this.overAllLines['totalGross'] = DecimalUtils.showLimitedDecimals(totAmount);
        this.overAllLines['totalTaxAmount'] = DecimalUtils.showLimitedDecimals(totTaxAmount);
        this.overAllLines['totalTax'] = DecimalUtils.showLimitedDecimals(totalTax);
        //  console.log('this.overAllLines after..',this.overAllLines);

        if (this.overAllLines && this.overAllLines.length > 0) {
          this.overAllLines.forEach(el => {
            if (el.saleTaxes && el.saleTaxes.length > 0) {
              const taxNames: any = [...el.saleTaxes.map(x => x.taxName)]
              this.finalSalesobjectArray = [...new Set(taxNames)];

              console.log(this.finalSalesobjectArray)
              this.calculateTotalPart(this.overAllLines);
            }
          });

          let netAmount = this.overAllLines.map(k => k.netAmount)
          this.totalValue = netAmount.reduce((k, m) => k + Number(m), 0)
          this.totalDecimalValue = this.totalValue.toFixed(2);

        }
        this.fetchWareHouseDetailsByID()
        this.fetchDestinationWareHouseDetailsByID()
      }
    })
  }


  finalTotalArray: any[] = [];
  calculateTotalPart(data) {
    console.log(this.overAllLines);
    this.finalTotalArray = [];
    if (this.overAllLines) {
      this.overAllLines.forEach(el => {
        if (el.saleTaxes && el.saleTaxes.length > 0) {
          const taxAmount: number[] = el.saleTaxes.map(x => x.taxAmount);
          const totalTaxAmount: number = taxAmount.reduce((total, value) => total + value, 0);
          console.log("Total Tax Amount for Element:", totalTaxAmount);
          el.saleTaxes.forEach(tax => {
            this.finalSalesobjectArray.forEach(gst => {
              let index = this.finalTotalArray.findIndex(x => x.taxName === gst);
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
  }
  fetchWareHouseDetailsByID() {
    if (this.warehouseTransferData && this.warehouseTransferData.sourceWareHouseInfo) {
      this.wmsService.fetchWareHouseDetailsByID(this.warehouseTransferData.sourceWareHouseInfo.wareHouseMasterID, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouse) {
            this.wareHouseDetails = response.data.wareHouse;
          }
        },
        (error) => {
        }
      );
    }
  }
  getDefaultWareHouse() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse) {
          this.whDefaultData = response.data.wareHouse[0];
        }
      },
      (error) => {
      }
    );
  }
  fetchDestinationWareHouseDetailsByID() {
    this.wmsService.fetchWareHouseDetailsByID(this.warehouseTransferData.destinationWareHouseInfo.wareHouseMasterID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse) {
          this.destinationWareHouseDetails = response.data.wareHouse;
        }
      },
      (error) => {
      }
    );
  }
  getArray(prod, i) {
    return this.overAllLines[i].saleTaxes.filter(x => x.taxName == prod);
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
