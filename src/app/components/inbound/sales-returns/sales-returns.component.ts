import { DatePipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/constants/constants';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { ApexService } from 'src/app/shared/services/apex.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { DecimalUtils } from 'src/app/constants/decimal';
 

@Component({
  selector: 'app-sales-returns',
  templateUrl: './sales-returns.component.html',
  styleUrls: ['./sales-returns.component.scss']
})
export class SalesReturnsComponent implements OnInit {

  showTooltip = false;
  salesForm: FormGroup;
  wmsoNumbers: CompleterData;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Sales Returns', Storage.getSessionUser());
  SRData: any = [];
  wmsoLinesArray = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  deleteInfo: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  taxData: any = [];
  overAllSO: any = [];
  sID: any = null;

  constructor(private apexService: ApexService, public ngxSmartModalService: NgxSmartModalService,
    private configService: ConfigurationService, private fb: FormBuilder,
    private commonService: CommonMasterDataService, private toastr: ToastrService, private excelService: ExcelService, private datepipe: DatePipe,
    private translate: TranslateService, private wmsService: WMSService) {
    this.translate.use(this.language);
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
    this.getFunctionCall();
  }
  getFunctionCall() {
    if (this.permissionsList.includes('View')) {
      this.createForm();
      this.fetchWmsoNumbersList();
      this.findAllTaxes();
      this.getAll();
      this.disableTheFields();
    }
  }
  // changeOrderType(event) {
  //   this.clear();
  //   this.salesForm.controls.orderType.setValue(event);
  //   this.fetchWmsoNumbersList();
  // }
  readOnlyMode: boolean = false;
  disableMe: boolean = false
  disableTheFields() {
    if (this.permissionsList.includes('View') && this.permissionsList.includes('Update')) {
      this.readOnlyMode = false
      this.disableMe = false;
      /*  this.salesForm.controls.orderType.enable();
       this.salesForm.controls.customerID.disable();
       this.salesForm.controls.customersCustomerName.disable();
       this.salesForm.controls.customersCustomerAddress.disable(); */
    }
    else if (this.permissionsList.includes('View')) {


      this.readOnlyMode = true;
      this.disableMe = true;
      /*  this.salesForm.controls.orderType.enable();
       this.salesForm.controls.customerID.enable();
       this.salesForm.controls.customersCustomerName.enable();
       this.salesForm.controls.customersCustomerAddress.enable(); */
    }
  }
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger2.unsubscribe();
  }
  createForm() {
    this.salesForm = this.fb.group({
      _id: null,
      wmsoNumber: null,
      fullWmsoNumber: null,
      wmsoNumberPrefix: null,
      wmsrNumber: null,
      wmsrNumberPrefix: null,
      fullWmsrNumber: null,
      customerMasterInfo: this.fb.group(
        {
          customerID: null,
          customerIDName: null,
          customerMasterID: null,
          customerName: null
        }),
      customersCustomerName: null,
      customersCustomerAddress: null,
      "wareHouseInfo": this.configService.getWarehouse(),
      "organizationInfo": this.configService.getOrganization(),
      "salesReturnLines": null,
      "status": null,
      "salesReturnStatus": null,
      billToAddress: null,
      shipToAddress: null,
      shipFromAddress: null,
      "totalGrossAmount": null,
      "totalNetAmount": null,
      "totalTaxAmount": null,
      "totalDiscount": null,
      "totalDiscountAmount": null,
      "totalSaleTaxes": null,
      "totalTaxPercentage": null,
      orderType: null,
    })
  }
  /*
  exportAsXLSX() {
    if (this.thirdPartySpaceUtilizationResponceList) {
      console.log(this.thirdPartySpaceUtilizationObjResponce)
      const changedTaskList = this.exportTypeMethod(this.thirdPartySpaceUtilizationObjResponce)
      this.excelService.exportAsExcelFile(changedTaskList, 'Third Party Space Utilization',
       Constants.EXCEL_IGNORE_FIELDS.VEHICLEBYSERVICEPROVIDER,this.thirdPartySpaceUtilizationObjResponce);
    } else {
      this.toastr.error('No data found');
    }
  }

  exportTypeMethod(data) {
    const arr = [];
    data.thirdPartySpaceUtilizations.forEach(ele => {
      if (ele) {
        console.log(ele);
        const obj = {}
        obj['supplierIDName'] = ele.supplierIDName
        obj['date'] = ele.date ? this.datepipe.transform(new Date(ele.date), 'yyyy-dd-MM') : null
        obj['in'] = ele.in
        obj['out'] = ele.out
        obj['openingBalance'] = ele.openingBalance
        obj['occupied'] = ele.occupied
        obj['openingBalanceUom'] = ele.openingBalanceUom
        obj['pallet'] = ele.pallet
        arr.push(obj)
        console.log(obj)
      }
      else {
        const obj = {}
        obj['supplierIDName'] = null
        obj['date'] = null
        obj['in'] =  null
        obj['out'] = null
        obj['openingBalance'] = null
        obj['openingBalanceUom'] = null
        obj['occupied'] = null
        obj['pallet'] = null
        arr.push(obj)
      }
    })
    return arr
  }
 */
  fetchWmsoNumbersList() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    form['orderType'] = "Sales Order";
    // form['orderType'] = this.salesForm.controls.orderType.value;
    this.commonService.fetchIDforSalesReturns(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderList.length) {
          this.overAllSO = response.data.shipmentOrderList;
          // this.wmsoNumbers = (response.data.shipmentOrderList.filter(x => x.orderType == this.salesForm.controls.orderType.value)).map(x => x.wmsoNumber);
          this.wmsoNumbers = response.data.shipmentOrderList.map(x => x.fullWmsoNumber);
        }
      },
      (error) => {
      });
  }
  salesReturnList: any;
  onWMSONoChange(event) {
    if (event) {
      const form = this.salesForm.value;
      const filteredObj = this.overAllSO.find(x => x.fullWmsoNumber == form.fullWmsoNumber);
      this.sID = filteredObj.wmsoNumber;
      form['wmsoNumber'] = this.sID;
      form['fullWmsoNumber'] = filteredObj.fullWmsoNumber;
      form['wmsoNumberPrefix'] = filteredObj.wmsoNumberPrefix;
      this.commonService.salesReturnById(form, this.formObj).subscribe(data => {
        if (data['status'] == 0 && data['data']['salesReturn']) {
          this.salesReturnList = data['data']['salesReturn'];
          this.salesForm.patchValue(data['data']['salesReturn']);
          // this.salesForm.controls.wmsoNumber.patchValue(this.overAllSO.find(x => x.wmsoNumber == data['data']['salesReturn'].wmsoNumber).fullWmsoNumber);
          this.salesForm.controls._id.patchValue(null);
          this.salesReturnList = data['data']['salesReturn'].salesReturnLines;
          this.wmsoLinesArray = data['data']['salesReturn'].salesReturnLines;
          console.log(this.wmsoLinesArray);
          this.wmsoLinesArray.forEach(el => {
            el['isChecked'] = null;
            el['returnQuantity'] = null;
            el['isEdit'] = false;
          });
        }
      })
    }
  }
  onSelect(event, data) {
    data['returnQuantity'] = null;
    data['expectedDeliveryDate'] = data['expectedDeliveryDate'] ? this.apexService.getDateFromMilliSec(data.expectedDeliveryDate) : null;
    if (event) {
      data['isEdit'] = true;
      data['isChecked'] = event;
    }
    else {
      data['isEdit'] = false;
      data['isChecked'] = event;
    }
  }
  saveETADate(value, data, key) {
    if (this.permissionsList.includes('Update')) {
      data[key] = value;
    }
    else {
      this.toastr.error('user doesnt have permission');
    }
  }
  validateDecimal(key, i) {
    this.wmsoLinesArray[i][key] = (DecimalUtils.enterLimitedDecimals(this.wmsoLinesArray[i][key],10));
  }
  savequantity(value, data, key) {
    if (this.permissionsList.includes('Update')) {
      if (value && DecimalUtils.lessThanOrEqual(value, data.customerDispatchQuantity)) {
        if (data.totalReturnQuantity) {
          if (DecimalUtils.greaterThanOrEqual((DecimalUtils.subtract(data.customerDispatchQuantity, data.totalReturnQuantity)), value)) {
            data[key] = DecimalUtils.valueOf(value);
            if (data.returnQuantity) {
              data['isChecked'] = true;
            }
            else {
              data['isChecked'] = false;
            }
          }
          else {
            this.toastr.error("Return Quantity Greater..Unable to return");
            data['isChecked'] = false;
            data['returnQuantity'] = null;
            data['isEdit'] = false
          }
        }
        else {
          data[key] = DecimalUtils.valueOf(value);
          if (data.returnQuantity) {
            data['isChecked'] = true;
          }
          else {
            data['isChecked'] = false;
          }
        }
      }
      else {
        data['isChecked'] = false;
        data['returnQuantity'] = null;
        data['isEdit'] = false
        this.toastr.error("Return Quantity should not be greater than Shipped Quantity");

      }
    }
    else {
      this.toastr.error('user doesnt have permission');
    }

  }
  generate() {
    if (((this.permissionsList.includes("Update")) && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const final = this.salesForm.value;
      final['wmsoNumber'] = this.sID;
      final['salesReturnLines'] = this.wmsoLinesArray;
      const atleastHaveOneQty = final['salesReturnLines'].find(x => x.returnQuantity);
      if (atleastHaveOneQty && final['salesReturnLines'] && final['salesReturnLines'].length > 0) {
        const arr = final['salesReturnLines'];
        let proceed: Boolean = true;
        arr.forEach(element => {
          if (element.expectedDeliveryDate) {
            element.expectedDeliveryDate = new Date(element.expectedDeliveryDate);
          }
          if (proceed) {
            if (element.returnQuantity &&
              DecimalUtils.lessThanOrEqual(element.returnQuantity, (element.customerDispatchQuantity || (element.totalReturnQuantity &&
                DecimalUtils.subtract(element.customerDispatchQuantity, element.totalReturnQuantity))))) {
              proceed = true;
            }
            else {
              proceed = element.returnQuantity ? false : proceed;
            }
          }
        });
        if (proceed) {
          final['salesReturnLines'].forEach(el => {
            el['customerReturnQuantity'] = el.returnQuantity;
          });
          this.commonService.createSalesReturn(final).subscribe(res => {
            if (res['status'] == 0 && res['data']['salesReturn']) {
              this.toastr.success("Created Successfully");
              this.edit(res['data']['salesReturn']);
              this.getSales();
            }
            else {
              if (res['status'] == 2) {
                this.toastr.error(res['statusMsg']);
              }
            }
          })
        }
        else {
          this.toastr.error("Enter Proper Details")
        }
      }
      else {
        this.toastr.error("Enter Return Quanity in Orders for create");
      }
    }
    else {
      this.toastr.error("User doesnt have permission");
    }

  }
  clear() {
    this.salesForm.enable();
    this.createForm();
    this.wmsoLinesArray = [];
  }
  getSales() {
    this.rerender();
    // this.dtTrigger2.next();
    this.getAll();
  }
  getAll() {
    this.commonService.fetchAllSalesReturns(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['salesReturns'] && res['data']['salesReturns']) {
        this.SRData = res['data']['salesReturns'];

        console.log(this.SRData);
        this.dtTrigger.next();
      }
    })
  }
  exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      if (this.SRData.length > 0) {
        console.log(this.SRData)
        const changedTaskList = this.exportTypeMethod(this.SRData)
        console.log(changedTaskList)
        this.excelService.exportAsExcelFile(changedTaskList, 'Sales Return Data', Constants.EXCEL_IGNORE_FIELDS.INBOUNDSALESRETURN);
      } else {
        this.toastr.error('No data found');
      }
    }
    else {
      this.toastr.error('user doesnt have permission');
    }
  }
  exportTypeMethod(data) {
    const arr = [];
    data.forEach(ele => {
      console.log(ele);
      if (ele.salesReturnLines && ele.salesReturnLines.length > 0 && ele.salesReturnLines != null && ele.salesReturnLines != undefined) {
        ele.salesReturnLines.forEach((salesreturnLines, index) => {
          const obj = {}
          if (index === 0) {
            obj['Wmso Number'] = ele.wmsoNumber
            obj['Customer ID'] = ele.customerMasterInfo.customerID
            obj['Customer ID Name'] = ele.customerMasterInfo.customerIDName
            obj['Customer Name'] = ele.customerMasterInfo.customerName
            obj['Delivery Exp Date'] = ele.deliveryExpDate ? this.datepipe.transform(new Date(ele.deliveryExpDate), 'yyyy-dd-MM') : null
            obj['Order Type'] = ele.orderType
            obj['Sales Return Status'] = ele.salesReturnStatus
            obj['Status'] = ele.status
            obj['Batch Number'] = salesreturnLines.batchNumber
            obj['Dfs Code'] = salesreturnLines.dfsCode
            obj['Dispatch Quantity'] = salesreturnLines.dispatchQuantity
            obj['Eta'] = salesreturnLines.eta ? this.datepipe.transform(new Date(ele.eta), 'yyyy-dd-MM') : null
            obj['Expected Delivery Date'] = salesreturnLines.expectedDeliveryDate ? this.datepipe.transform(new Date(ele.expectedDeliveryDate), 'yyyy-dd-MM') : null
            obj['Picked Quantity'] = salesreturnLines.pickedQuantity
            obj['Product Category Name'] = salesreturnLines.productCategoryInfo.productCategoryName
            obj['Product Configuration'] = salesreturnLines.productConfiguration
            obj['product Description'] = salesreturnLines.productDescription
            obj['Dispatch Quantity'] = salesreturnLines.dispatchQuantity
            obj['Product ID'] = salesreturnLines.productMasterInfo.productID
            obj['Product Name'] = salesreturnLines.productMasterInfo.productName
            obj['Product ID Name'] = salesreturnLines.productMasterInfo.productIDName
            obj['Quantity'] = salesreturnLines.quantity
            obj['Return Quantity'] = salesreturnLines.returnQuantity
            obj['Shipment Unit'] = salesreturnLines.shipmentUnit
            obj['Shipping Address'] = salesreturnLines.shippingAddress
            obj['Total Quantity'] = salesreturnLines.totalQuantity
            obj['Total Return Quantity'] = salesreturnLines.totalReturnQuantity
            obj['Type'] = salesreturnLines.type
            obj['Wmso Line Number'] = salesreturnLines.wmsoLineNumber
            obj['Storage Instruction'] = salesreturnLines.storageInstruction
            arr.push(obj)
          } else {
            obj['Wmso Number'] = null
            obj['Customer ID'] = null
            obj['Customer ID Name'] = null
            obj['Customer Name'] = null
            obj['Delivery Exp Date'] = null
            obj['Order Type'] = null
            obj['Sales Return Status'] = null
            obj['Status'] = null
            obj['Batch Number'] = salesreturnLines.batchNumber
            obj['Dfs Code'] = salesreturnLines.dfsCode
            obj['Dispatch Quantity'] = salesreturnLines.dispatchQuantity
            obj['Eta'] = salesreturnLines.eta ? this.datepipe.transform(new Date(ele.eta), 'yyyy-dd-MM') : null
            obj['Expected Delivery Date'] = salesreturnLines.expectedDelivery ? this.datepipe.transform(new Date(ele.expectedDelivery), 'yyyy-dd-MM') : null
            obj['Picked Quantity'] = salesreturnLines.pickedQuantity
            obj['Product Category Name'] = salesreturnLines.productCategoryInfo.productCategoryName
            obj['Product Configuration'] = salesreturnLines.productConfiguration
            obj['Product Description'] = salesreturnLines.productDescription
            obj['Dispatch Quantity'] = salesreturnLines.dispatchQuantity
            obj['Product ID'] = salesreturnLines.productMasterInfo.productID
            obj['Product Name'] = salesreturnLines.productMasterInfo.productName
            obj['Product ID Name'] = salesreturnLines.productMasterInfo.productIDName
            obj['Quantity'] = salesreturnLines.quantity
            obj['Return Quantity'] = salesreturnLines.returnQuantity
            obj['Shipment Unit'] = salesreturnLines.shipmentUnit
            obj['Shipping Address'] = salesreturnLines.shippingAddress
            obj['Total Quantity'] = salesreturnLines.totalQuantity
            obj['Total Return Quantity'] = salesreturnLines.totalReturnQuantity
            obj['Type'] = salesreturnLines.type
            obj['WmsoLine Number'] = salesreturnLines.wmsoLineNumber
            obj['Storage Instruction'] = salesreturnLines.storageInstruction
            arr.push(obj)
          }
        })
      }
      else {
        const obj = {}
        obj['WmsoNumber'] = ele.wmsoNumber
        obj['Customer ID'] = ele.customerMasterInfo.customerID
        obj['CustomerIDName'] = ele.customerMasterInfo.customerIDName
        obj['Customer Name'] = ele.customerMasterInfo.customerName
        obj['Delivery Exp Date'] = ele.deliveryExpDate
        obj['Order Type'] = ele.orderType
        obj['Sales Return Status'] = ele.salesReturnStatus
        obj['Status'] = ele.status
        obj['Batch Number'] = null
        obj['Dfs Code'] = null
        obj['Dispatch Quantity'] = null
        obj['Eta'] = null
        obj['Expected Delivery Date'] = null
        obj['Picked Quantity'] = null
        obj['ProductCategory Name'] = null
        obj['Product Configuration'] = null
        obj['Product Description'] = null
        obj['Dispatch Quantity'] = null
        obj['Product ID'] = null
        obj['Product Name'] = null
        obj['Product ID Name'] = null
        obj['Quantity'] = null
        obj['Return Quantity'] = null
        obj['Shipment Unit'] = null
        obj['Shipping Address'] = null
        obj['Total Quantity'] = null
        obj['Total Return Quantity'] = null
        obj['Type'] = null
        obj['Wmso Line Number'] = null
        obj['Storage Instruction'] = null;
        arr.push(obj)
      }
    })
    return arr
  }


globalIDs:any;
  edit(data) {
    this.globalIDs = data._id
    if (this.permissionsList.includes('Update')) {
      if (data.salesReturnStatus == 'Confirmed') {
        this.salesForm.disable();
      }
      else {
        this.salesForm.enable();
      }
      this.salesForm.patchValue(data);
      this.wmsoLinesArray = data.salesReturnLines;
      this.wmsoLinesArray.forEach(el => {
        if (el.returnQuantity) {
          el['isChecked'] = true;
          // el['returnQuantity'] = null;
          el['expectedDeliveryDate'] = el['expectedDeliveryDate'] ? this.apexService.getDateFromMilliSec(el.expectedDeliveryDate) : null;
          el['isEdit'] = true;
        }
      });
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      if (data.salesReturnStatus != 'Confirmed') {
        this.deleteInfo = { name: 'salesReturn', id: data._id };
        this.ngxSmartModalService.getModal('deletePopup').open();
      }
      else {
        this.toastr.error("No Scope for Delete");
      }
    } else {
      this.toastr.error('user doesnt have permission');
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.clear();
      this.getSales();
    }
  }
  findAllTaxes() {
    this.wmsService.fetchTaxes(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].taxMasters) {
        this.taxData = res['data'].taxMasters;
      }
      else {
        this.taxData = [];
      }
    })
  }
  confirm() {
    if (this.permissionsList.includes('Update')) {
      const form = this.salesForm.value;
      form['wmsoNumber'] = this.sID;
      form['salesReturnLines'] = this.wmsoLinesArray.filter(x => x.isChecked);
      if (form['salesReturnLines'] && form['salesReturnLines'].length > 0) {
        const arr = form['salesReturnLines'];
        let proceed: Boolean = true;
        let totalAmount: any = 0;
        let grossAmount: any = 0;
        let taxAmount: any = 0;
        let discount: any = 0;
        let discountAmount: any = 0;
        let taxPercentage: any = 0;
        let saleTaxes = [];
        arr.forEach(element => {

          let amount: any = 0;
          let taxes: any = 0;
          let taxPercentage: any = 0;
          const soLine = element;
          if (soLine.unitPrice && soLine.returnQuantity) {
            amount = DecimalUtils.multiply(soLine.unitPrice, soLine.returnQuantity);

            element.grossAmount = amount;

            if (soLine.discount) {
              amount = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(soLine.discount, 100)), amount);
              element.discountAmount = (DecimalUtils.subtract(element.grossAmount, amount));
            }
            if (soLine.saleTaxes && soLine.saleTaxes.length > 0) {
              soLine.saleTaxes.forEach(el => {
                el.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(el.taxPercentage, 100), 1), amount), amount);
                taxPercentage = DecimalUtils.add(taxPercentage, (el.taxPercentage ? el.taxPercentage : 0));
              });
              element.taxPercentage = taxPercentage;
              soLine.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);

              element.taxAmount = soLine.taxAmount;
              taxes = soLine.taxAmount;
            }
            element.netAmount = DecimalUtils.add(amount, taxes);
          }

          if (element.expectedDeliveryDate) {
            element.expectedDeliveryDate = new Date(element.expectedDeliveryDate);
          }
          if (proceed) {
            if (element.returnQuantity &&
              DecimalUtils.lessThanOrEqual(element.returnQuantity, (element.customerDispatchQuantity || (element.totalReturnQuantity &&
                DecimalUtils.subtract(element.customerDispatchQuantity, element.totalReturnQuantity))))) {
              proceed = true;
            }
            else {
              proceed = element.returnQuantity ? false : proceed;
            }
          }
          totalAmount = DecimalUtils.add(totalAmount, element.netAmount);
          grossAmount = DecimalUtils.add(grossAmount, element.grossAmount);
          taxAmount = DecimalUtils.add(taxAmount, element.taxAmount);
          if (element.discount && element.discountAmount) {
            discount = DecimalUtils.add(discount, element.discount);
            discountAmount = DecimalUtils.add(discountAmount, element.discountAmount);
          }
          taxPercentage = DecimalUtils.add(taxPercentage, element.taxPercentage);
          if (element.saleTaxes && element.saleTaxes.length) {
            saleTaxes = [...saleTaxes, ...element.saleTaxes];
          }
        });
        let grouped = saleTaxes.reduce(
          (result: any, currentValue: any) => {
            (result[currentValue['taxNamePercentage']] = result[currentValue['taxNamePercentage']] || []).push(currentValue);
            return result;
          }, {});
        form['totalNetAmount'] = totalAmount;
        form['totalGrossAmount'] = grossAmount;
        form['totalTaxAmount'] = taxAmount;
        form['totalDiscount'] = discount;
        form['totalDiscountAmount'] = discountAmount;
        form['totalTaxPercentage'] = taxPercentage;
        if (grouped) {
          form['totalSaleTaxes'] = [];
          const headers = Object.keys(grouped);
          headers.forEach(element => {
            let taxA: any = 0;
            grouped[element].forEach(tax => {
              taxA = DecimalUtils.add(taxA, tax.taxAmount);
            });
            form['totalSaleTaxes'].push({
              taxAmount: taxA,
              taxName: element.split(':')[0],
              taxNamePercentage: element,
              taxPercentage: element.split(':')[1],
            })
          });
        }
        if (proceed) {
          form['salesReturnLines'].forEach(el => {
            el['customerReturnQuantity'] = el.returnQuantity;
          });
          this.commonService.confirmSalesReturn(form).subscribe(res => {
            if (res['status'] == 0) {
              this.clear();
              this.toastr.success("Confirmed Successfully");
              this.getSales();
            }
            else {
              if (res['status'] == 2) {
                this.toastr.error(res['statusMsg']);
              }
            }
          })
        }
        else {
          this.toastr.error("Enter Proper Return Quantity")
        }
      }
      else {
        this.toastr.error("Enter Return Quanity in Orders for Conform");
      }
    }
    else {
      this.toastr.error('user doesnt have permission')
    }
  }
}
