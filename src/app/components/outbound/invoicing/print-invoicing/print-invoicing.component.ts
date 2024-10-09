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
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-print-invoicing',
  templateUrl: './print-invoicing.component.html',
  styleUrls: ['./print-invoicing.component.scss']
})
export class PrintInvoicingComponent implements OnInit {

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
  editSourceCustomerDetails: any = {}
  invoiceData: any = {};
  billToAddressData: any = {};
  formObj = this.configService.getGlobalpayload();
  productDetails: any = [];
  hsnCodeArray: any = [];
  totalAmontArray: any = []
  totalValue: any;
  toatTaxAmount: any;
  toatTax: any;
  wareHouseList: any;
  wareHouseId: any;
  dispatchDate: any;
  wareHouseTransdetails: any = {}
  supplierDetails: any = {};
  orgData: any = [];
  showFooter: boolean = false;
  dummy: boolean = true;
  totalNetAmount: any = 0;

  constructor(
    private wmsService: WMSService, public configService: ConfigurationService,
    private commonMasterDataService: CommonMasterDataService,
    private outboundMasterDataService: OutboundMasterDataService,
    private outboundProcessService: OutboundProcessService,
    private appService: AppService,
    private emitterService: EmitterService,
    private metaDataService: MetaDataService, private excelRestService: ExcelRestService
  ) {
    // var beforePrint = function () {
    //   this.showFooter = true;
    //   console.log('Functionality to run before printing.');
    // };
    // window.onbeforeprint = beforePrint;
  }



  ngOnInit() {
    //this.convertFunctions();
    this.id = this.appService.getParam('id');
    this.wareHouseList = JSON.parse(sessionStorage.getItem('dli-wms-user'));

    this.fetchInvoiceByID();
    this.emitterService.invoicePriceValueUpdated.subscribe(data => {
      this.fetchInvoiceByID();
      this.fetchLogo();
    });
    this.fetchAllBillToAdresses();
  }
  getArray(prod, i) {
    if (this.productDetails[i].taxDetailsList) {
      return this.productDetails[i].taxDetailsList.filter(x => x.taxName == prod);
    }
    else {
      return 0
    }
  }
  newTotalNetAmountobj: any;
  totalNetAmountobj: any;
  finalSalesobjectArray: any = [];
  fetchData: any;
  innerLines: any;
  productDetailsobj: any;
  getSingleObject: any;
  
  fetchInvoiceByID() {
    if (this.id) {
      this.outboundProcessService.fetchInvoiceByID(this.id, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.invoice) {
            this.invoiceData = response.data.invoice;

            this.invoiceData.invoiceOrderLines.forEach((getObject, i) => {
              this.getSingleObject = getObject.storageInstruction;
              getObject.dummyValue = i;
            })
            console.log(this.invoiceData.invoiceOrderLines);
            this.invoiceData.financialYearName = null;
            const pId = this.formObj;
            pId['dateFrom'] = new Date(this.invoiceData.invoiceDate);
            pId['dateTo'] = new Date(this.invoiceData.invoiceDate);
            this.wmsService.fetchFinancialYearConfigByDates(pId).subscribe(res => {
              if (res && res['status'] == 0 && res['data'].financialYearConfiguration) {
                this.invoiceData.financialYearName = res['data'].financialYearConfiguration.financialYearName
              }
            })
            const form = JSON.parse(JSON.stringify(this.formObj));
            form['wmsoNumber'] = this.invoiceData.wmsoNumber;
            form['wmsoNumberPrefix'] = this.invoiceData.wmsoNumberPrefix;
            form['fullWmsoNumber'] = this.invoiceData.fullWmsoNumber;
            form['orderType'] = this.invoiceData.orderType;
            this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
              if (res['status'] == 0 && res['data']['organizations'].length > 0) {
                this.orgData = res['data']['organizations'].find(x => x.organizationIDName === this.formObj.organizationIDName);

              }
            })
            this.outboundProcessService.fetchInvoiceReport(form).subscribe(res => {
              if (res['status'] == 0 && res['data'].invoiceResponse) {
                this.productDetails = res['data'].invoiceResponse.invoiceResponseLines;

                let i = res['data'].invoiceResponse.invoiceResponseLines.length
                let m = (i - 1)
                this.dispatchDate = this.productDetails[m].dispatchDate
                this.productDetailsobj = res['data'].invoiceResponse;

                if (this.productDetails) {
                  this.productDetails.forEach(el => {
                    // if (el.saleTaxes && el.saleTaxes.length > 0) {
                    //   const taxNames: any = [...el.saleTaxes.map(x => x.taxName)]
                    //   this.finalSalesobjectArray = [...new Set(taxNames)];
                    //   // this.calculateTotalPart(this.productDetails);

                    // }
                    
                    if (el.taxDetailsList && el.taxDetailsList.length > 0) {
                      const taxNames: any = [...el.taxDetailsList.map(x => x.taxName)]
                      this.finalSalesobjectArray = [...new Set(taxNames)];
                    }
                  });
                  this.calculateTotal(this.productDetails);
                  this.totalNetAmount = res['data'].invoiceResponse.totalNetAmount;
                }
              }
              else {
                this.productDetails = [];
              }
            })
            this.outboundProcessService.fetchInvoiceReport(form).subscribe(res1 => {
              if (res1['status'] == 0 && res1['data'].invoiceResponse) {
                this.hsnCodeArray = res1['data'].invoiceResponse.invoiceResponseLines;
                this.totalAmontArray = this.hsnCodeArray.map(k => k.grossAmount)
                let taxArray = this.hsnCodeArray.map(k => k.totalTaxPercentage)
                let taxAmountArray = this.hsnCodeArray.map(k => k.totalTaxAmount)
                this.totalValue = this.totalAmontArray.reduce((k, m) => k + Number(m), 0)
                this.toatTax = taxArray.reduce((k, m) => k + Number(m), 0)
                this.toatTaxAmount = taxAmountArray.reduce((k, m) => k + Number(m), 0)
              }
              else {
                this.hsnCodeArray = [];
              }
            })
            this.innerLines = this.productDetails;
            this.totalNetAmountobj = this.invoiceData.totalNetAmount;
            this.newTotalNetAmountobj = this.toWords.convert(this.totalNetAmountobj);

            this.fetchSourceWareHouseDetailsByID(response.data.invoice.wareHouseInfo);
            if (response.data.invoice.orderType == 'Sales Order') {
              this.invoiceCustomerDetails = response.data.invoice.customerMasterInfo;
              this.fetchCustomerByID();
            }
            else if (response.data.invoice.orderType == 'WareHouseTransfer' || response.data.invoice.orderType == 'WareHouseTransfer Returns') {
              this.invoiceCustomerDetails = response.data.invoice.wareHouseTransferDestinationInfo;
              this.fetchWareHouseDetailsByID(response.data.invoice.wareHouseTransferDestinationInfo);

            }
            else if (response.data.invoice.orderType == 'Purchase Returns') {
              this.invoiceCustomerDetails = response.data.invoice.supplierMasterInfo;
              this.fetchSupplierDetailsById(response.data.invoice.supplierMasterInfo.supplierMasterID);
            }
          }
        },
        (error) => {
        });
    }
  }
  finalTotalArray: any[] = [];
  calculateTotal(productDet) {
    this.finalTotalArray = [];
    if (this.finalSalesobjectArray.length) {
      this.finalSalesobjectArray.forEach(tax => {
        this.finalTotalArray.push({
          taxName: tax,
          totalTaxAmount: 0
        })
      });
      this.finalTotalArray.forEach(el => {
        productDet.forEach(element => {
          element.taxDetailsList.forEach(tDet => {
            if (tDet.taxName == el.taxName) {
              el.totalTaxAmount = DecimalUtils.add(el.totalTaxAmount, tDet.taxAmount)
            }
          });
        });
      });
    }
  }

  calculateTotalPart(data) {

    this.finalTotalArray = [];
    if (this.productDetails) {
      this.productDetails.forEach(el => {
        if (el.saleTaxes && el.saleTaxes.length > 0) {
          const taxAmount: number[] = el.saleTaxes.map(x => x.taxAmount);
          const totalTaxAmount: number = taxAmount.reduce((total, value) => total + value, 0);

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


  fetchCustomerByID() {
    this.outboundMasterDataService.fetchCustomerByID(this.invoiceCustomerDetails.customerMasterID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customer) {
          this.editCustomerDetails = response.data.customer;
        }
      },
      (error) => {
      }
    );
  }
  fetchWareHouseDetailsByID(data) {
    console.log(data);
    let obj = {
      "organizationIDName": data.organizationIDName,
      "wareHouseIDName": data.wareHouseIDName
    }
    console.log(this.wareHouseId);
    if (data.wareHouseID) {
      this.wmsService.fetchAllWarehouses(obj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouses) {
            this.wareHouseTransdetails = response.data.wareHouses[0];
            console.log(this.wareHouseTransdetails);

          }
        },
        (error) => {
        }
      );
    }
  }
  fetchSourceWareHouseDetailsByID(data) {
    console.log(data);
    if (data.wareHouseMasterID) {
      this.wmsService.fetchWareHouseDetailsByID(data.wareHouseMasterID, this.formObj).subscribe(
        (response) => {
          console.log(data.wareHouseMasterID);
          if (response && response.status === 0 && response.data.wareHouse) {

            this.wareHouseDetails = response.data.wareHouse;

            if (data.wareHouseID) {


              this.editSourceCustomerDetails = response.data.wareHouse;
            }
          }
        },
        (error) => {
        }
      );
    }
  }
  fetchSupplierDetailsById(ID) {
    this.wmsService.fetchSupplierDetailsById(ID, this.formObj).subscribe(
      (response) => {
        if (response && response.data.supplierMaster) {
          this.supplierDetails = response.data.supplierMaster;
        }
      })
  }
  /*  fetchBillToAddressByID() {
     this.commonMasterDataService.fetchBillToAddressByID(Constants.BILLTOADDRESS_ID, this.formObj).subscribe(
       (response) => {
         if (response && response.status === 0 && response.data.BillToAddress) {
           this.billToAddressData = response.data.BillToAddress;
         }
       },
       (error) => {
       }
     );
   } */
  billToAddressDataList: any;
  fetchBillToAddressByID(_id?) {
    this.commonMasterDataService.fetchBillToAddressByID(_id ? _id : this.billToAddressData[0]._id, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.BillToAddress) {
          this.billToAddressDataList = response.data.BillToAddress

        }
      },
      (error) => {
      }
    );
  }

  fetchAllBillToAdresses() {
    this.billToAddressData = [];
    this.commonMasterDataService.fetchAllBillToAdresses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.BillToAddressList && response.data.BillToAddressList.length > 0) {
          this.billToAddressData = response.data.BillToAddressList;
          this.fetchBillToAddressByID();
        } else {
          this.billToAddressData = [];
        }
      },
      (error) => {
        this.billToAddressData = [];
      });
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
