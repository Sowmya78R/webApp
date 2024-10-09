import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../../shared/services/app.service';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../../shared/utils/custom-validator';
import { OutboundProcessService } from '../../../../services/integration-services/outboundProcess.service';
import { Constants } from '../../../../constants/constants';
import { WmsCommonService } from '../../../../services/wms-common.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { OutboundMasterDataService } from '../../../../services/integration-services/outboundMasterData.service';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { MetaDataService } from '../../../../services/integration-services/metadata.service';
import { EmitterService } from '../.././../../services/emitter.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
@Component({
  selector: 'app-edit-invoicing',
  templateUrl: './edit-invoicing.component.html'
})
export class EditInvoicingComponent implements OnInit, AfterViewInit, OnDestroy {
  editInvoicingForm: FormGroup;
  shippingToForm: FormGroup;
  paymentStatus: any = Constants.PAYMENT_STATUS;
  invoiceLinesData: any = [];
  id: any;
  countries: any = [];
  isReadMode: any = false;
  isEditCustomer: any = false;
  editCustomerDetails: any = {};
  customerDetails: any = {};
  invoiceCustomerDetails: any = {};
  supplierById: any = {};
  wareHouseById: any = {};
  invoiceLineData: any;
  invoiceData: any;
  totalAmount: any = 0;
  lineKeys: any = ['S.No', 'Product ID', 'Product Name', 'Batch Number', 'Shelf Life', 'Order Quantity',
    'Shipped Quantity', 'Unit Price', 'Tax1', 'Tax2', 'Tax3', 'Tax4', 'Tax5', 'Discount', 'Amount', 'Action'];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  termsAndConditions: any;
  isReadModeM: any = false;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Invoicing', Storage.getSessionUser());
  forPermissionsSubscription: any;
  serialNumberAllocation: any = 'No';
  sNumber: any = null;
  bNumber: any = null;
  thirdPartyCustomersCheckAllocation: any = "No";
  productLogo: any;
  showImage: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  raisedStatus: boolean = false;
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  showCurrency: any;
  taxData: any = [];
  taxIDs: any = [];
  isEditBillToAddress: any = false;
  showTooltip: any = false;

  constructor(private toastr: ToastrService,
    private appService: AppService,
    private customValidators: CustomValidators, private configService: ConfigurationService,
    private emitterService: EmitterService, private wmsService: WMSService,
    private metaDataService: MetaDataService, private fb: FormBuilder,
    private wmsCommonService: WmsCommonService,
    private commonMasterDataService: CommonMasterDataService,
    private outboundProcessService: OutboundProcessService,
    private outboundMasterDataService: OutboundMasterDataService, private translate: TranslateService,) {
    this.translate.use(this.language);
    this.createInvoicingForm();
  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Invoicing', Storage.getSessionUser());
      }
    })
    if (this.permissionsList.includes('View')) {
      this.id = this.appService.getParam('id');
      this.fetchAllCountries();
      this.fetchAllTermsAndConditions();
      this.fetchInvoiceByID();
      this.disableFieldsOnEdit();
      // this.findAllTaxes();
    }
  }
  // findAllTaxes() {
  //   this.wmsService.fetchTaxes(this.formObj).subscribe(res => {
  //     if (res['status'] == 0 && res['data'].taxMasters) {
  //       this.taxData = res['data'].taxMasters;
  //       this.taxIDs = this.taxData.map(x => x.taxNamePercentage);
  //     }
  //     else {
  //       this.taxData = [];
  //       this.taxIDs = this.taxData;
  //     }
  //   })
  // }
  calculateTaxPercentage() {
    this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.taxAmount.setValue(0);
    this.calculate();

    // if (this.editInvoicingForm.value.invoiceOrderLines[0].saleTaxes && this.editInvoicingForm.value.invoiceOrderLines[0].saleTaxes.length > 0) {
    //   this.editInvoicingForm.value.invoiceOrderLines[0].taxAmount = 0;
    //   this.calculate();
    // }
    // else {
    //   this.editInvoicingForm.value.invoiceOrderLines[0].taxAmount = 0;
    //   this.calculate();
    // }
  }
  disableFieldsOnEdit() {
    if (!this.permissionsList.includes('Update')) {
      this.shippingToForm.disable();
      this.editInvoicingForm.get('invoiceOrderLines').disable();
      this.editInvoicingForm.disable();
    }
    // else if (this.permissionsList.includes('Update')) {
    //   this.shippingToForm.enable();
    //   this.editInvoicingForm.get('invoiceOrderLines').enable();
    //   this.editInvoicingForm.enable();
    // }

  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  redirectToCustomerMasterData() {
    if (this.permissionsList.includes('Update')) {
      if (this.invoiceData.orderType == 'Sales Order') {
        if (this.invoiceCustomerDetails && this.invoiceCustomerDetails.customerMasterID) {
          this.appService.navigate('masterdata/customer', { id: this.invoiceCustomerDetails.customerMasterID });
        } else {
          this.toastr.error('select customer');
        }
      }
      else if (this.invoiceData.orderType == 'WareHouseTransfer' || this.invoiceData.orderType == 'WareHouseTransfer Returns') {
        if (this.invoiceData.wareHouseTransferDestinationInfo.wareHouseMasterID) {
          this.appService.navigate('masterdata/warehouse', { id: this.invoiceData.wareHouseTransferDestinationInfo.wareHouseMasterID });
        } else {
          this.toastr.error('select WareHouse');
        }
      }
      else if (this.invoiceData.orderType == 'Purchase Returns') {
        if (this.invoiceData.supplierMasterInfo.supplierMasterID) {
          this.appService.navigate('/masterdata/supplier', { id: this.invoiceData.supplierMasterInfo.supplierMasterID });
        } else {
          this.toastr.error('select Supplier');
        }
      }
    }
    else {
      this.toastr.error("user Doesnt have permissions");
    }

  }
  updateCustomer() {
    if (this.permissionsList.includes('Update')) {
      this.isReadMode = false;
      this.isEditCustomer = true;
      // this.shippingToForm.controls['country'].enable();
      this.editInvoicingForm.controls.shipToAddress['controls']['country'].enable();

    }
    else {
      this.toastr.error("User Doesn't have permission");
    }
  }
  updateMainHeader() {
    if (this.invoiceData.orderType == 'Sales Order') {
      this.saveCustomer();
    }
    else if (this.invoiceData.orderType == 'WareHouseTransfer' || this.invoiceData.orderType == 'WareHouseTransfer Returns') {
      this.saveWareHouse();
    }
    else if (this.invoiceData.orderType == 'Purchase Returns') {
      this.saveSupplier();
    }
  }
  saveWareHouse() {
    if (this.permissionsList.includes('Update')) {
      const form = this.shippingToForm.value;
      this.wareHouseById['address'] = form.shipingAddress;
      this.wareHouseById['country'] = form.country;
      this.wareHouseById['state'] = form.state;
      this.wareHouseById['city'] = form.city;
      this.wareHouseById['pin'] = form.pin;
      this.wareHouseById['phoneNumber'] = form.phoneNumber;
      this.wmsService.saveOrUpdateWareHouseData(JSON.stringify(this.wareHouseById)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouse) {
            // this.wareHouseById = response.data.wareHouse;
            // this.shippingToForm.patchValue(response.data.wareHouse);
            this.isEditCustomer = false;
            this.isReadMode = true;
            this.shippingToForm.controls['country'].disable();
            this.toastr.success('Supplier details updated.');
          } else {
            this.toastr.error('Failed in updating details');
          }
        },
        (error) => {

        }
      );
    }
    else {
      this.toastr.error("User Dosen't have permission");
    }
  }
  saveSupplier() {
    if (this.permissionsList.includes('Update')) {
      const form = this.shippingToForm.value;
      this.supplierById['address1'] = form.shipingAddress;
      this.supplierById['country'] = form.country;
      this.supplierById['state'] = form.state;
      this.supplierById['city'] = form.city;
      this.supplierById['pin'] = form.pin;
      this.supplierById['phoneNumber'] = form.phoneNumber;
      this.wmsService.saveSupplierMasterData(JSON.stringify(this.supplierById)).subscribe((response) => {
        if (response && response.status === 0) {
          // this.supplierById = response.data.supplier;
          // this.shippingToForm.patchValue(response.data.supplier);
          this.isEditCustomer = false;
          this.isReadMode = true;
          this.shippingToForm.controls['country'].disable();
          this.toastr.success('Supplier details updated.');
        } else {
          this.toastr.error('Failed in updating details');
        }
      },
        (error) => {

        });
    }
    else {
      this.toastr.error("User Dooesnt have permission ")
    }
  }
  saveCustomer() {
    if (this.permissionsList.includes('Update')) {
      const id = this.customerDetails.customerMasterID;
      this.customerDetails._id = id;
      delete this.customerDetails.customerMasterID;
      const finalCustomerDetails = { ...this.customerDetails, ...this.editCustomerDetails };
      finalCustomerDetails.shipToAddresses.forEach(element => {
        if (element.name == this.editInvoicingForm.controls.shipToAddress.value.name) {
          // element = Object.assign({}, this.editInvoicingForm.controls.shipToAddress.value)
          const form = this.editInvoicingForm.controls.shipToAddress.value;
          element.address = form.address;
          element.city = form.city;
          element.contactDetails = form.contactDetails;
          element.country = form.country;
          element.pin = form.pin;
          element.state = form.state
        }
      });
      if (finalCustomerDetails) {
        this.outboundMasterDataService.saveOrUpdateCustomer(JSON.stringify(finalCustomerDetails)).subscribe(
          (response) => {
            if (!!response && response.status === 0 && response.data.customer) {
              this.customerDetails = response.data.customer;
              // this.shippingToForm.patchValue(response.data.customer);
              this.isEditCustomer = false;
              this.isReadMode = true;
              this.editInvoicingForm.controls.shipToAddress['controls']['country'].disable();
              this.toastr.success('Customer details updated.');
            } else {
              this.toastr.error('Failed in updating customer details.');
            }
          },
          (error) => {
            this.toastr.error('Failed in updating customer details.');
          }
        );
      } else {
        this.toastr.error('Failed in updating customer details.');
      }
    }
    else {
      this.toastr.error("User Doesn't have permissions")
    }
  }
  cancelCustomer() {
    if (this.permissionsList.includes('Update')) {
      this.fetchCustomerByID();
    }
  }
  fetchCustomerByID() {
    this.outboundMasterDataService.fetchCustomerByID((this.customerDetails.customerMasterID ||
      this.invoiceCustomerDetails.customerMasterID), this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.customer) {
            this.editCustomerDetails = response.data.customer;
            // this.shippingToForm.patchValue(response.data.customer);
            this.editInvoicingForm.controls.shipToAddress['controls']['country'].disable();
            this.isReadMode = true;
            this.isEditCustomer = false;
          } else {
            this.shippingToForm.patchValue({});
          }
        },
        (error) => {
          this.shippingToForm.patchValue({});
        }
      );
  }
  fetchWareHouseDetailsByID(ID?) {
    const wareHouseID = ID;
    if (wareHouseID) {
      this.wmsService.fetchWareHouseDetailsByID(wareHouseID, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouse) {
            this.wareHouseById = response.data.wareHouse;
            this.shippingToForm.patchValue(response.data.wareHouse);
            this.shippingToForm.controls.shipingAddress.patchValue(response.data.wareHouse.address)
            this.shippingToForm.controls['country'].disable();
            this.isReadMode = true;
            this.isEditCustomer = false;
          }
          else {
            this.shippingToForm.patchValue({});
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
        if (response && response.status === 0 && response.data.supplierMaster) {
          this.shippingToForm.patchValue(response.data.supplierMaster);
          this.supplierById = response.data.supplierMaster;
          this.shippingToForm.controls.shipingAddress.patchValue(response.data.supplierMaster.address1)
          this.shippingToForm.controls['country'].disable();
          this.isReadMode = true;
          this.isEditCustomer = false;
        }
        else {
          this.shippingToForm.patchValue({});
        }
      })
  }
  getTaxJson(taxNamePercentage, qty, discount) {
    const filteredtax = this.taxData.find(x => x.taxNamePercentage == taxNamePercentage);
    if (discount) {
      qty = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(discount, 100)), qty);
    }
    return {
      _id: filteredtax._id,
      taxName: filteredtax.taxName,
      taxPercentage: filteredtax.taxPercentage,
      taxNamePercentage: filteredtax.taxNamePercentage,
      taxAmount: DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(filteredtax.taxPercentage, 100), 1), qty), qty)
    }
  }
  save() {
    if (this.permissionsList.includes('Update')) {
      const req = this.editInvoicingForm.value;
      let totalAmount: any = 0;
      let grossAmount: any = 0;
      let taxAmount: any = 0;
      let discount: any = 0;
      let discountAmount: any = 0;
      let taxPercentage: any = 0;
      let saleTaxes = [];
      if (req.invoiceOrderLines.length > 0) {
        req.invoiceOrderLines.forEach(product => {
          if (product.brandName == "") {
            product.brandName = null;
          }
          if (product.saleTaxes && product.saleTaxes.length > 0) {
            const purchase = JSON.parse(JSON.stringify(product.saleTaxes));
            product.saleTaxes = [];
            purchase.forEach(inner => {
              if (typeof (inner) == 'string') {
                product.saleTaxes.push(this.getTaxJson(inner, product.grossAmount, product.discount));
              }
              else {
                product.saleTaxes.push(inner);
              }
            });
          }
          totalAmount = DecimalUtils.add(totalAmount, product.netAmount);
          grossAmount = DecimalUtils.add(grossAmount, product.grossAmount);
          taxAmount = DecimalUtils.add(taxAmount, product.taxAmount);
          if (product.discount && product.discountAmount) {
            discount = DecimalUtils.add(discount, product.discount);
            discountAmount = DecimalUtils.add(discountAmount, product.discountAmount);
          }
          taxPercentage = DecimalUtils.add(taxPercentage, product.taxPercentage);
          if (product.saleTaxes && product.saleTaxes.length) {
            saleTaxes = [...saleTaxes, ...product.saleTaxes];
          }
        });
      }
      let grouped = saleTaxes.reduce(
        (result: any, currentValue: any) => {
          (result[currentValue['taxNamePercentage']] = result[currentValue['taxNamePercentage']] || []).push(currentValue);
          return result;
        }, {});
      req['totalNetAmount'] = totalAmount;
      req['totalGrossAmount'] = grossAmount;
      req['totalTaxAmount'] = taxAmount;
      req['totalDiscount'] = discount;
      req['totalDiscountAmount'] = discountAmount;
      req['totalTaxPercentage'] = taxPercentage;
      if (grouped) {
        req['totalSaleTaxes'] = [];
        const headers = Object.keys(grouped);
        headers.forEach(element => {
          let taxA: any = 0;
          grouped[element].forEach(tax => {
            taxA = DecimalUtils.add(taxA, tax.taxAmount);
          });
          req['totalSaleTaxes'].push({
            taxAmount: taxA,
            taxName: element.split(':')[0],
            taxNamePercentage: element,
            taxPercentage: element.split(':')[1],
          })
        });
      }
      if (req.customerMasterInfo && !req.customerMasterInfo.customerIDName) {
        req.customerMasterInfo = null;
      }
      if (req.wareHouseTransferDestinationInfo && !req.wareHouseTransferDestinationInfo.wareHouseIDName) {
        req.wareHouseTransferDestinationInfo = null;
      }
      if (req.supplierMasterInfo && !req.supplierMasterInfo.supplierIDName) {
        req.supplierMasterInfo = null;
      }
      req._id = this.id;
      req.soID = this.invoiceData.soID;
      req.invoiceOrderLines[0]._id = this.invoiceLineData._id;
      req.invoiceOrderLines[0].pickedQuantity = this.invoiceLineData.pickedQuantity;
      req.invoiceOrderLines[0].productMasterInfo.productMasterID = this.invoiceLineData.productMasterID;
      // delete req.invoiceOrderLines[0].netAmount;
      // delete req.invoiceOrderLines[0].unitPrice;
      delete req.invoiceNumber;
      delete req.totalAmount;
      req.salesOrderDate = req.salesOrderDate ? new Date(req.salesOrderDate) : null;
      req.invoiceDate = req.invoiceDate ? new Date(req.invoiceDate) : null;
      // req.customerMasterInfo.customerMasterID = this.invoiceCustomerDetails.customerMasterID;
      delete req.invoiceDate;

      if (req.shipToAddress && !req.shipToAddress.name) {
        req.shipToAddress = null;
      }
      if (req.billToAddress && !req.billToAddress.name) {
        req.billToAddress = null;
      }
      if (req.shipFromAddress && !req.shipFromAddress.name) {
        req.shipFromAddress = null;
      }
      this.outboundProcessService.UpdateIndividualInvoiceLineByID(req).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.editInvoicingForm.controls.invoiceOrderLines.reset();
            this.isReadModeM = false;
            this.sNumber = null;
            this.bNumber = null;
            if (this.showImage) {
              const element = <HTMLImageElement>(document.getElementById('pLogo'));
              element.src = null;
            }
            this.fetchInvoiceByID();
            this.emitterService.invoicePriceUpdated('updated');
            this.toastr.success('Updated successfully');
          } else {
            this.toastr.error('Failed in updating');
          }
        },
        (error) => {
          this.toastr.error('Failed in updating');
        });
    }
    else {
      this.toastr.error("User doesn't have permission");
    }
  }
  clear() {
    if (this.permissionsList.includes('View')) {
      this.editInvoicingForm.controls.invoiceOrderLines.reset();
      if (this.showImage) {
        const element = <HTMLImageElement>(document.getElementById('pLogo'));
        element.src = null;
      }
      this.isReadModeM = false;
      this.sNumber = null;
      this.bNumber = null;
    }
  }
  edit(data) {
    if (data.saleTaxes && data.saleTaxes.length > 0) {
      this.taxData = data.saleTaxes;
      data.saleTaxes = data.saleTaxes.map(x => x.taxNamePercentage);
    }
    this.productLogo = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    data['taxAmount'] = data.totalTaxAmount;
    const mockData = {
      invoiceOrderLines: [data]
    };
    this.invoiceLineData = { _id: data._id, productMasterID: data.productMasterInfo.productMasterID, pickedQuantity: data.pickedQuantity };
    if (data.productImage && this.showImage) {
      const fileNames = JSON.parse(JSON.stringify(data.productImage));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        if (data['status'] == 0) {
          this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
          this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
          this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
        }
      });
    }
    this.editInvoicingForm.patchValue(mockData);
    this.isReadModeM = true;
    window.scroll(0, 450);
    // }
    // else {
    //   this.toastr.error('User doesnt have permissions');

    // }


  }
  closeInvoice() {
    if (this.permissionsList.includes('Update')) {
      if (this.id) {
        this.outboundProcessService.closeInvoicing(this.id, this.formObj).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.invoices) {
              this.toastr.success('Closed successfully');
              this.appService.navigate('/v1/outbound/maintainInvoicing', null);
            } else {
              this.toastr.error('Failed in closing');
            }
          });
      } else {
        this.toastr.error('No invoice found');
      }
    }
    else {
      this.toastr.error("User doesn't have permissions");

    }
  }
  calculate() {
    let amount: any = 0;
    let taxes: any = 0;
    let taxPercentage: any = 0;
    const soLine = this.editInvoicingForm.value.invoiceOrderLines[0];
    if (soLine.orderUnitPrice && soLine.customerDispatchQuantity) {
      amount = DecimalUtils.multiply(soLine.orderUnitPrice, soLine.customerDispatchQuantity);
      this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.grossAmount.setValue(amount);


      if (soLine.discount) {
        amount = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(soLine.discount, 100)), amount);
        const discountAmount = DecimalUtils.subtract(this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.grossAmount.value, amount)
        this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.discountAmount.setValue(discountAmount);
      }
      if (soLine.saleTaxes && soLine.saleTaxes.length > 0) {
        soLine.saleTaxes.forEach(el => {
          const filter = this.taxData.find(x => x.taxNamePercentage == el);
          taxPercentage = DecimalUtils.add(taxPercentage, (filter ? filter.taxPercentage : 0));
        });
        this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.taxPercentage.setValue(taxPercentage);

        soLine.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);
        this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.taxAmount.setValue(soLine.taxAmount);
        taxes = soLine.taxAmount;
      }
      this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.netAmount.setValue(DecimalUtils.add(amount, taxes));
    }
    else {
      this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.netAmount.setValue(null);
      this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.grossAmount.setValue(null);
      this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.taxAmount.setValue(null);
      this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.taxPercentage.setValue(null);
      this.editInvoicingForm.controls.invoiceOrderLines['controls'][0].controls.discountAmount.setValue(null);

    }
  }
  fetchInvoiceByID() {
    this.productLogo = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    if (this.id) {
      this.outboundProcessService.fetchInvoiceByID(this.id, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.invoice) {
            this.raisedStatus = response.data.invoice.status === 'Close' ? true : false;
            if (this.raisedStatus) {
              this.editInvoicingForm.disable();
              this.shippingToForm.disable();
            }
            if (!response.data.invoice.customerMasterInfo) {
              response.data.invoice.customerMasterInfo = {
                customerIDName: null,
                customerID: null,
                customerName: null,
                customerMasterInfo: null
              }
            }
            if (!response.data.invoice.wareHouseTransferDestinationInfo) {
              response.data.invoice["wareHouseTransferDestinationInfo"] = {
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
            if (!response.data.invoice.supplierMasterInfo) {
              response.data.invoice.supplierMasterInfo = {
                supplierMasterID: null,
                supplierID: null,
                supplierName: null,
                supplierIDName: null
              }
            }
            if (!response.data.invoice.shipToAddress) {
              response.data.invoice.shipToAddress = {
                "name": null,
                "address": null,
                "city": null,
                "pin": null,
                "state": null,
                "country": null,
                "defaultAddress": null,
                "contactDetail": {

                  "phoneNumber": null,
                  "alternativePhoneNumber": null,
                  "contactName": null,
                  "email": null,
                }
              };
            }
            if (!response.data.invoice.shipFromAddress) {
              response.data.invoice.shipFromAddress = {
                "name": null,
                "address": null,
                "city": null,
                "pin": null,
                "state": null,
                "country": null,
                "defaultAddress": null,
                "contactDetail": {

                  "phoneNumber": null,
                  "alternativePhoneNumber": null,
                  "contactName": null,
                  "email": null,
                }
              };
            }
            if (!response.data.invoice.billToAddress) {
              response.data.invoice.billToAddress = {
                "name": null,
                "address": null,
                "city": null,
                "pin": null,
                "state": null,
                "country": null,
                "defaultAddress": null,
                "contactDetail": {

                  "phoneNumber": null,
                  "alternativePhoneNumber": null,
                  "contactName": null,
                  "email": null,
                }
              };
            }
            const header = Object.assign({}, response.data.invoice);
            delete header.invoiceOrderLines;
            delete header.salesOrderDate;
            const form = JSON.parse(JSON.stringify(this.formObj));
            form['wmsoNumber'] = response.data.invoice.wmsoNumber;
            form['wmsoNumberPrefix'] = response.data.invoice.wmsoNumberPrefix;
            form['fullWmsoNumber'] = response.data.invoice.fullWmsoNumber;
            form['orderType'] = response.data.invoice.orderType;
            this.outboundProcessService.fetchInvoiceReport(form).subscribe(res => {
              if (res['status'] == 0 && res['data'].invoiceResponse) {
                this.invoiceLinesData = res['data'].invoiceResponse.invoiceResponseLines;
                this.rerender();
                this.totalAmount = 0;
                this.invoiceLinesData.forEach(line => {
                  this.showCurrency = line.currency;
                  this.totalAmount = DecimalUtils.add(this.totalAmount, line.netAmount);
                });
                // }
              }
            })
            this.invoiceCustomerDetails = response.data.invoice.customerMasterInfo;
            this.invoiceData = response.data.invoice;
            this.editInvoicingForm.patchValue(header);
            if (header.productImage && this.showImage) {
              const fileNames = JSON.parse(JSON.stringify(header.productImage));
              this.metaDataService.viewImages(fileNames).subscribe(data => {
                if (data['status'] == 0) {
                  this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
                  this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
                  this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
                }
              });
            }
            this.editInvoicingForm.controls.salesOrderDate.setValue(
              response.data.invoice.salesOrderDate ? this.wmsCommonService.getDateFromMilliSec(response.data.invoice.salesOrderDate)
                : null);
            this.editInvoicingForm.controls.invoiceDate.setValue(
              header.invoiceDate ? this.wmsCommonService.getDateFromMilliSec(header.invoiceDate) : null);
            this.editInvoicingForm.controls.paymentStatus.disable();
            if (header.customerMasterInfo.customerIDName) {
              this.fetchCustomerByID();
            }
            if (header.wareHouseTransferDestinationInfo.wareHouseIDName) {
              this.fetchWareHouseDetailsByID(header.wareHouseTransferDestinationInfo.wareHouseMasterID);
            }
            if (header.supplierMasterInfo.supplierIDName) {
              this.fetchSupplierDetailsById(header.supplierMasterInfo.supplierMasterID);
            }
            this.rerender();
          }
        },
        (error) => {
        });
    }
  }
  fetchAllCountries() {
    this.commonMasterDataService.fetchAllCountries(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.countries) {
        this.countries = response.data.countries;
      } else {
        this.countries = [];
      }
    }, error => {
      this.countries = [];
    });
    this.metaDataService.getAllThirdpartyCustomers(this.configService.getGlobalpayload()).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0].thirdPartyCustomersCheck;
      }
      else {
        this.thirdPartyCustomersCheckAllocation = 'No';
      }
    })
    this.metaDataService.getImageConfigbyName(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Invoicing') ? true : false;
      }
    })
  }
  createInvoicingForm() {
    const invoiceLineForm = new FormBuilder().group({
      productMasterInfo: new FormBuilder().group({
        productID: ['', this.customValidators.required],
        productIDName: ['', this.customValidators.required],
        productName: ['', this.customValidators.required],
      }),
      batchNumber: [null, this.customValidators.required],
      brandName: [''],
      productImage: [''],
      hsnCode: null,
      serialNumber: null,
      lrNumber: null,
      inventoryUnit: null,
      wmsoLineNumber: null,
      productDescription: null,
      storageInstruction: null,
      "mfgDate": null,
      "expiryDate": null,
      shelfLife: ['', this.customValidators.required],
      quantity: ['', this.customValidators.required],
      dispatchQuantity: ['', this.customValidators.required],
      customerDispatchQuantity: null,
      unitPrice: ['', this.customValidators.required],
      orderUnitPrice: null,
      discount: ['', this.customValidators.required],
      saleTaxes: null,
      grossAmount: null,
      taxAmount: null,
      discountAmount: null,
      taxPercentage: null,
      orderQuantity: null,
      // tax1: ['', this.customValidators.required],
      // tax2: ['', this.customValidators.required],
      // tax3: ['', this.customValidators.required],
      // tax4: ['', this.customValidators.required],
      // tax5: ['', this.customValidators.required],
      netAmount: ['', this.customValidators.required],
      exBondDate: null,
      exBondNumber: null, referenceBillOfEntryDate
        :
        null,
      referenceBillOfEntryNumber
        :
        null,
      referenceBillOfEntryNumberDate
        :
        null,
      referenceBillOfLandingDate
        :
        null,
      referenceBillOfLandingNumber
        :
        null,
      referenceBillOfLandingNumberDate
        :
        null,
      referenceBondDate
        :
        null,
      referenceBondNumber
        :
        null,
      referenceContainerNumber
        :
        null,
      referenceEquipmentInfo
        :
        null,
      referenceVehicleInfo: null,
      referenceInvoiceDate
        :
        null,
      referenceInvoiceNumber
        :
        null,
      referenceLrNumber
        :
        null,
      referencePackingRemarks
        :
        null,
      referenceServiceProviderInfo
        :
        null,
      referenceVehicleNumber
        :
        null,
      referenceVehicleType
        :
        null,
      referenceWayBillNumber
        :
        null
    });
    this.editInvoicingForm = new FormBuilder().group({
      wmsoNumber: ['', this.customValidators.required],
      fullWmsoNumber: null,
      exBondDate: null,
      exBondNumber: null,
      referenceSONumber: null,
      referencePONumber: null,
      wmsoNumberPrefix: null,
      invoiceNumber: ['', this.customValidators.required],
      fullInvoiceNumber: null,
      invoiceNumberPrefix: null,
      driverName: null,
      driverPhoneNumber: null,
      salesOrderDate: ['', this.customValidators.required],
      customerMasterInfo: new FormBuilder().group({
        customerMasterID: [''],
        customerIDName: ['', this.customValidators.required],
        customerID: ['', this.customValidators.required],
        customerName: ['', this.customValidators.required],
      }),
      "wareHouseTransferType": null,
      "wareHouseTransferDestinationInfo": new FormBuilder().group({
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
      }),
      "organizationInfo": {
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      },
      "wareHouseInfo": {
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      },
      paymentStatus: ['', this.customValidators.required],
      invoiceDate: ['', this.customValidators.required],
      totalAmount: ['', this.customValidators.required],
      orderType: ['Sales Order'],
      uomConversionAvailability: null,
      customersCustomerAddress: null,
      customersCustomerName: null,
      supplierMasterInfo: new FormBuilder().group({
        supplierMasterID: null,
        supplierID: null,
        supplierName: null,
        supplierIDName: null
      }),
      invoiceOrderLines: new FormBuilder().array([invoiceLineForm]),
      shipToAddress: this.createShipTOArray(),
      shipFromAddress: this.createShipTOArray(),
      billToAddress: this.createShipTOArray(),
      totalDiscount: null,
      totalDiscountAmount: null,
      totalGrossAmount: null,
      totalSaleTaxes: null,
      totalTaxAmount: null,
      totalTaxPercentage: null,
    });
    this.shippingToForm = new FormBuilder().group({
      shipingAddress: ['', this.customValidators.required],
      country: ['', this.customValidators.required],
      state: ['', this.customValidators.required],
      city: ['', this.customValidators.required],
      pin: ['', this.customValidators.required],
      phoneNumber: ['', this.customValidators.required],
    });
  }
  createShipTOArray(details?) {
    return new FormBuilder().group({
      "name": details ? details.name : null,
      "address": details ? details.address : null,
      "city": details ? details.city : null,
      "pin": details ? details.pin : null,
      "state": details ? details.state : null,
      "country": details ? details.country : null,
      "defaultAddress": details ? details.defaultAddress : false,
      "contactDetails": new FormBuilder().group({
        "phoneNumber": details ? details.contactDetails.phoneNumber : null,
        "alternativePhoneNumber": details ? details.contactDetails.alternativePhoneNumber : null,
        "contactName": details ? details.contactDetails.contactName : null,
        "email": details ? details.contactDetails.email : null,
      })
    })
  }
  get InvoiceOrderLines(): FormArray {
    return this.editInvoicingForm.get('invoiceOrderLines') as FormArray
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.forPermissionsSubscription.unsubscribe();
  }
  fetchAllTermsAndConditions() {
    this.metaDataService.fetchAllTermsAndConditions(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.TermsAndConditions.length) {
          for (let i = 0; i < response.data.TermsAndConditions.length; i++) {
            if (response.data.TermsAndConditions[i].type === 'invoice') {
              this.termsAndConditions = response.data.TermsAndConditions[i].termsAndConditions;
              break;
            }
          }
        }
      },
      error => {
      });

    this.metaDataService.getAllSerialNumberConfigurations(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberAllocation = res.data.serialNumberConfigurations[0].serialNumberCheck;
      }
      else {
        this.serialNumberAllocation = 'No';
      }
    })
  }
  printInvoice() {
    if (this.permissionsList.includes('Update')) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
    else {
      this.toastr.error("User doesn't have permissions");
    }
  }

}
