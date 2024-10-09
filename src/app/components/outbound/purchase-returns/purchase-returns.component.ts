import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ApexService } from 'src/app/shared/services/apex.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-purchase-returns',
  templateUrl: './purchase-returns.component.html',
  styleUrls: ['./purchase-returns.component.scss']
})
export class PurchaseReturnsComponent implements OnInit {
  formObj = this.configService.getGlobalpayload();
  goodsReceiptsData: any = [];
  wmpoIDs: CompleterData;
  purchaseReturnsForm: FormGroup;
  purchaseReturnPermissionList: any = null;
  linesArray: any = [];
  PRData: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  pickupLocations: any = [];
  obj: any = null;
  globalIndex: any = null;
  deleteInfo: any;
  inventoryHelpersArray: any = [];
  locationType: any = 'All';
  permissionToggle: any = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  taxData: any = [];

  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private fb: FormBuilder, private commonService: CommonMasterDataService, private apexService: ApexService,
    private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    if (sessionStorage.getItem('module') === 'Outbound') {
      this.purchaseReturnPermissionList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Purchase Returns', Storage.getSessionUser());
    }
    else if (sessionStorage.getItem('module') === 'Asset') {
      this.purchaseReturnPermissionList = this.configService.getPermissions('mainFunctionalities', 'Asset', 'Purchase Return', Storage.getSessionUser());
    }
  }

  ngOnInit() {
    this.createForm();
    // this.fetchAllGR();
    this.getIDDropdowns();
    this.getPReturns();
    this.disableTheFields();
    this.getPermissions();
    this.findAllTaxes();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  readOnlyMode: boolean = false;
  disableMe: boolean = false

  getPermissions() {
    this.configService.getAllInventoryConfiguration(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['processConfigurations'] && res['data']['processConfigurations'].length > 0) {
        if (res['data']['processConfigurations'].find(x => x.name == 'Purchase Receive Location')) {
          const havePermission = res['data']['processConfigurations'].find(x => x.name == 'Purchase Receive Location');
          if (havePermission.processStatusPolicies && havePermission.processStatusPolicies.length > 0) {
            havePermission.processStatusPolicies.forEach(ele => {
              const rolePermissionsArray = ele.statusRoleConfigurations[0].role.roleName
              const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).authorities[0].authority;
              this.permissionToggle = rolePermissionsArray.includes(loginUserRole) ? true : false;
            })
          }
        }
        else {
          this.permissionToggle = false;
        }
      }
    })
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
  disableTheFields() {
    if (this.purchaseReturnPermissionList.includes('View') && this.purchaseReturnPermissionList.includes('Update')) {
      this.readOnlyMode = false
      this.disableMe = false;
      /*  this.purchaseReturnsForm.controls.receiptDate.disable();
       this.purchaseReturnsForm.controls.supplierID.disable();
       this.purchaseReturnsForm.controls.supplierName.disable();
       this.purchaseReturnsForm.controls.customersSupplierName.disable();
       this.purchaseReturnsForm.controls.customersSupplierAddress.disable(); */
    }
    else if (this.purchaseReturnPermissionList.includes('View')) {
      this.readOnlyMode = true;
      this.disableMe = true;
      /*  this.purchaseReturnsForm.controls.receiptDate.enable();
       this.purchaseReturnsForm.controls.supplierID.enable();
       this.purchaseReturnsForm.controls.supplierName.enable();
       this.purchaseReturnsForm.controls.customersSupplierName.enable();
       this.purchaseReturnsForm.controls.customersSupplierAddress.enable() */
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
  changeOrderType(event) {
    this.clear();
    this.purchaseReturnsForm.controls.orderType.setValue(event);
    this.getIDDropdowns();
  }
  getIDDropdowns() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    form['orderType'] = this.purchaseReturnsForm.controls.orderType.value;
    this.wmsService.getPurchaseReturnsOrderIDS(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceipts) {
          this.goodsReceiptsData = response.data.goodsReceipts;
          this.wmpoIDs = response.data.goodsReceipts.map(x => x.fullWmpoNumber);
        }
      },
      (error) => {

      });
  }
  createForm() {
    this.purchaseReturnsForm = this.fb.group({
      _id: null,
      wmpoNumber: null,
      fullWmpoNumber: null,
      fullWmprNumber: null,
      wmpoNumberPrefix: null,
      wmprNumber: null,
      wmprNumberPrefix: null,
      createdDate: null,
      organizationInfo: this.configService.getOrganization(),
      purchaseReturnLines: null,
      purchaseReturnStatus: null,
      receiptType: null,
      receiptDate: null,
      status: null,
      orderType: ['Purchase Order'],
      customersSupplierAddress: null,
      customersSupplierName: null,
      supplierMasterInfo: this.fb.group({
        supplierMasterID: null,
        supplierID: null,
        supplierIDName: null,
        supplierName: null
      }),
      wareHouseInfo: this.configService.getWarehouse(),
      wareHouseTransferSourceInfo: this.fb.group({
        wareHouseID: null,
        wareHouseIDName: null,
        wareHouseName: null,
        wareHouseTransferTransactionID: null,
        "wareHouseTransferMasterID": null,
        "organizationIDName": null,
        "organizationID": null,
        "organizationName": null,
        "fullWareHouseTransferTransactionID": null,
        "wareHouseTransferTransactionIDPrefix": null,
      }),
      wareHouseTransferType: null,
      billToAddress: null,
      shipToAddress: null,
      shipFromAddress: null,
      "totalGrossAmount": null,
      "totalNetAmount": null,
      "totalTaxAmount": null,
      "totalDiscount": null,
      "totalDiscountAmount": null,
      "totalPurchaseTaxes": null,
      "totalTaxPercentage": null
    })
  }

  onWMPONoChange(event) {
    if (event) {
      const form = this.purchaseReturnsForm.value;
      const filteredObj = this.goodsReceiptsData.find(x => x.fullWmpoNumber == event.originalObject)
      form.wmpoNumber = filteredObj.wmpoNumber;
      form.wmpoNumberPrefix = filteredObj.wmpoNumberPrefix;
      this.purchaseReturnsForm.controls.wmpoNumber.setValue(form.wmpoNumber);
      this.purchaseReturnsForm.controls.wmpoNumberPrefix.setValue(form.wmpoNumberPrefix);
      this.commonService.purchaseReturnsByWMpoNumber(form, this.formObj).subscribe(data => {
        if (data['status'] == 0 && data['data']['purchaseReturn']) {
          const PRresponse = data['data']['purchaseReturn'];
          if (!PRresponse.supplierMasterInfo) {
            PRresponse.supplierMasterInfo = {
              supplierMasterID: null,
              supplierID: null,
              supplierIDName: null,
              supplierName: null
            }
          }
          if (!PRresponse.wareHouseTransferSourceInfo) {
            PRresponse.wareHouseTransferSourceInfo = {
              wareHouseID: null,
              wareHouseIDName: null,
              wareHouseName: null,
              wareHouseTransferTransactionID: null,
              "wareHouseTransferMasterID": null,
              "organizationIDName": null,
              "organizationID": null,
              "organizationName": null,
              "fullWareHouseTransferTransactionID": null,
              "wareHouseTransferTransactionIDPrefix": null,
            }
          }
          this.purchaseReturnsForm.patchValue(PRresponse);
          // this.purchaseReturnsForm.controls._id.patchValue(null);
          if (PRresponse.receiptDate) {
            this.purchaseReturnsForm.controls.receiptDate.patchValue(new Date(PRresponse.receiptDate));
          }
          this.linesArray = PRresponse.purchaseReturnLines;
          this.linesArray.forEach(el => {
            el['isChecked'] = null;
            el['returnQuantity'] = null;
            el['isEdit'] = false;
          });
        }
      })
    }
  }
  validateDecimal(key, i) {
    this.linesArray[i][key] = (DecimalUtils.enterLimitedDecimals(this.linesArray[i][key]));
  }

  generate() {
    if (((this.purchaseReturnPermissionList.includes("Update")) && this.globalIDs) || (this.purchaseReturnPermissionList.includes("Create") && !this.globalIDs)) {
      const final = this.purchaseReturnsForm.value;
      if (!final.wareHouseTransferSourceInfo && !final.wareHouseTransferSourceInfo.wareHouseIDName) {
        final.wareHouseTransferSourceInfo = null;
      }
      if (!final.supplierMasterInfo && !final.supplierMasterInfo.supplierIDName) {
        final.supplierMasterInfo = null;
      }
      final['purchaseReturnLines'] = this.linesArray.filter(x => x.isChecked);
      if (final['purchaseReturnLines'] && final['purchaseReturnLines'].length > 0) {
        const arr = final['purchaseReturnLines'];
        let proceed: Boolean = true;
        arr.forEach(element => {
          if (element.eta) {
            element.eta = new Date(element.eta);
          }
          if (proceed) {
            if (element.returnQuantity &&
              (DecimalUtils.lessThanOrEqual(element.returnQuantity, (DecimalUtils.add(element.totalReturnQuantity, element.totalReceivedQuantity)))) ||
              (element.totalActualReturnQuantity &&
                (DecimalUtils.subtract((DecimalUtils.add(element.totalReturnQuantity, element.totalReceivedQuantity)), element.totalActualReturnQuantity)
                ))) {
              const arr3 = element.returnInventoryHelpers.map(x => x.pickedQuantity);
              const arr1 = element.receiveInventoryHelpers.map(x => x.pickedQuantity);
              const arr2 = arr3.concat(arr1);
              let sum: any = "0";
              if (arr2.length > 0) {
                arr2.forEach(element => {
                  sum = DecimalUtils.add(sum, element);
                });
              }
              // const sum = arr2.reduce((acc, cur) => acc + cur, 0);
              proceed = (DecimalUtils.equals(element.returnQuantity, sum)) ? true : false;
            }
            else {
              // proceed = false;
              proceed = element.returnQuantity ? false : proceed;
            }
          }
        });
        if (proceed) {
          this.commonService.createPurchaseReturn(final).subscribe(res => {
            if (res['status'] == 0 && res['data']['purchaseReturn']) {
              this.toastr.success("Created Successfully");
              this.edit(res['data']['purchaseReturn']);
              this.getPurchases();
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
      this.toastr.error('User doent have permission');
    }
  }
  clear() {
    this.linesArray = [];
    this.purchaseReturnsForm.enable();
    this.createForm();
  }
  globalIDs:any;
  edit(data) {
    this.globalIDs = data._id;
    if (this.purchaseReturnPermissionList.includes('Update')) {
      if (data.purchaseReturnStatus == 'Confirmed') {
        this.purchaseReturnsForm.disable();
      }
      else {
        this.purchaseReturnsForm.enable();
      }
      if (!data.supplierMasterInfo) {
        data.supplierMasterInfo = {
          supplierMasterID: null,
          supplierID: null,
          supplierIDName: null,
          supplierName: null
        }
      }
      if (!data.wareHouseTransferSourceInfo) {
        data.wareHouseTransferSourceInfo = {
          wareHouseID: null,
          wareHouseIDName: null,
          wareHouseName: null,
          wareHouseTransferTransactionID: null,
          "wareHouseTransferMasterID": null,
          "organizationIDName": null,
          "organizationID": null,
          "organizationName": null,
          "fullWareHouseTransferTransactionID": null,
          "wareHouseTransferTransactionIDPrefix": null,
        }
      }
      this.purchaseReturnsForm.patchValue(data);
      this.purchaseReturnsForm.controls.fullWmpoNumber.setValue(data.wmpoNumberPrefix + data.wmpoNumber);
      this.linesArray = data.purchaseReturnLines;
      this.linesArray.forEach(el => {
        el['isChecked'] = true;
        el['isEdit'] = true;
        el['eta'] = el['eta'] ? this.apexService.getDateFromMilliSec(el.eta) : null;
      });
    }
    else {
      this.toastr.error('user doesnt have permission');
    }
  }
  getPReturns() {
    this.commonService.fetchAllPurchaseReturns(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['purchaseReturns'] && res['data']['purchaseReturns']) {
        this.PRData = res['data']['purchaseReturns'];
        this.dtTrigger.next();
      }
    })
  }
  onSelect(event, data) {
    data['returnQuantity'] = null;
    data['eta'] = data['eta'] ? this.apexService.getDateFromMilliSec(data.eta) : null;
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
    if (this.purchaseReturnPermissionList.includes('Update')) {
      data[key] = value;
    }
    else {
      this.toastr.error('user doesnt have permission');
    }
  }
  savequantity(value, data, key) {
    if (this.purchaseReturnPermissionList.includes('Update')) {
      if (value && DecimalUtils.lessThanOrEqual(value, (DecimalUtils.add(data.totalReturnQuantity, data.totalReceivedQuantity)))) {

        if (data.totalActualReturnQuantity) {
          // if (((data.totalReturnQuantity + data.totalReceivedQuantity) - data.totalActualReturnQuantity) >= value) {
          if (DecimalUtils.greaterThanOrEqual(DecimalUtils.subtract((DecimalUtils.add(data.totalReturnQuantity, data.totalReceivedQuantity)), data.totalActualReturnQuantity), value)) {
            data[key] = value;
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
          data[key] = value;
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
        this.toastr.error("Return Quantity should not be greater than Total Return Quantity");
      }
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
  }
  getOnlyLocations(event) {
    if (event == 'Receive') {
      this.pickupLocations = JSON.parse(JSON.stringify(this.linesArray[this.globalIndex].receiveInventoryHelpers));
    }
    else if (event == 'Return') {
      this.pickupLocations = JSON.parse(JSON.stringify(this.linesArray[this.globalIndex].returnInventoryHelpers));
    }
    else {
      this.pickupLocations = JSON.parse(JSON.stringify(this.inventoryHelpersArray));
    }
  }
  openModalRecievedLocations(data, i) {
    if (this.permissionToggle) {
      this.inventoryHelpersArray = this.linesArray[i].receiveInventoryHelpers.concat(this.linesArray[i].returnInventoryHelpers)
    }
    else {
      this.inventoryHelpersArray = this.linesArray[i].returnInventoryHelpers;
    }
    this.pickupLocations = JSON.parse(JSON.stringify(this.inventoryHelpersArray));
    this.obj = data;
    this.globalIndex = i;
    this.locationType = 'All';
    if (this.pickupLocations.length > 0) {
      this.pickupLocations.forEach(x => {
        x['isEdit'] = x.pickedQuantity ? true : false;
        x['isChecked'] = x.pickedQuantity ? true : false;
      });
    }
    if (data.returnQuantity) {
      this.ngxSmartModalService.getModal('pickupLocationsModal').open();
    }
    else {
      this.toastr.error("Enter Return Quantity!!")
    }
  }
  read1(event, data1) {
    this.pickupLocations.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.pickupLocations.find(x => x.isEdit == true);
      if (currentItem && (currentItem.pickedQuantity == null)) {
        this.toastr.warning('Please enter Picked Quantity');
      }
      this.pickupLocations.map(element => element.isEdit = false);
      data1.isEdit = true;
      if (currentItem && currentItem.pickedQuantity) {
        if (event.target.checked && data1.pickedQuantity) {
          data1.isChecked = event.target.value;
        }
        else if (event.target.checked && !data1.pickedQuantity) {
          data1.isChecked = event.target.value;
          data1.isEdit = true;
        }
        else {
          data1.isChecked = false;
          data1.isEdit = false;
          data1['pickedQuantity'] = '';
        }
      }
    }
    else {
      data1.isChecked = false;
      data1.isEdit = false;
      data1.pickedQuantity = null;
    }
    this.pickupLocations.forEach(element => {
      if (element.pickedQuantity) {
        element.isChecked = true;
      }
    });
  }
  savePicked(value, data) {
    if (this.purchaseReturnPermissionList.includes('Update')) {
      if (value == null || (typeof (value) == 'string' ? value.trim() : value) == '') {
        data.isEdit = false;
        data['pickedQuantity'] = '';
        data['isChecked'] = false;
      }
      else {
        if (DecimalUtils.greaterThanOrEqual(data.quantityInventoryUnit, value)) {
          data['pickedQuantity'] = value;
          data['isChecked'] = true;
        }
        else {
          data.isEdit = false;
          data['pickedQuantity'] = '';
          data['isChecked'] = false;
          this.toastr.error('Pickup Quantity should be less than or equal to Available Quantity')
        }
      }
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
  }
  savePickupLocations() {
    let count: any = 0;
    this.pickupLocations.forEach(element => {
      if (element.isChecked) {
        count = DecimalUtils.add(count, element.pickedQuantity)
      }
    });
    if (count == this.obj.returnQuantity) {
      this.ngxSmartModalService.getModal('pickupLocationsModal').close();
      this.toastr.success('Saved');
      let filteredRecieveLocations = [];
      filteredRecieveLocations = this.pickupLocations.filter(x => x.isChecked == true);
      if (filteredRecieveLocations.length > 0) {
        filteredRecieveLocations.forEach(element => {
          delete element.isEdit;
          delete element.isChecked;
        });
        this.linesArray[this.globalIndex].returnInventoryHelpers.forEach(el => {
          filteredRecieveLocations.forEach(innerEle => {
            el['pickedQuantity'] = (el._id === innerEle._id) ? innerEle.pickedQuantity : el.pickedQuantity;
          });
        });
        if (this.permissionToggle) {
          this.linesArray[this.globalIndex].receiveInventoryHelpers.forEach(el => {
            filteredRecieveLocations.forEach(innerEle => {
              el['pickedQuantity'] = (el._id === innerEle._id) ? innerEle.pickedQuantity : el.pickedQuantity;
            });
          });
        }
      }
    }
    else {
      this.toastr.error("Selected Locations Quantity should be equal to entered Return Quantity");
    }
  }
  resetRecieveLocations() {
    if (this.pickupLocations.length > 0) {
      this.pickupLocations.forEach(x => {
        x['isEdit'] = false;
        x['isChecked'] = false;
        x['pickedQuantity'] = null;
      });
    }
  }
  getPurchases() {
    this.rerender();
    this.getPReturns();
  }
  delete(data: any) {
    if (this.purchaseReturnPermissionList.includes('Delete')) {
      if (data.purchaseReturnStatus != 'Confirmed') {
        this.deleteInfo = { name: 'purchaseReturn', id: data._id };
        this.ngxSmartModalService.getModal('deletePopup').open();
      }
      else {
        this.toastr.error("No Scope for Delete");
      }
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.clear();
      this.getPurchases();
    }
  }

  confirm() {
    if (this.purchaseReturnPermissionList.includes('Update')) {
      const final = this.purchaseReturnsForm.value;
      if (!final.wareHouseTransferSourceInfo.wareHouseIDName) {
        final.wareHouseTransferSourceInfo = null;
      }
      if (!final.supplierMasterInfo.supplierIDName) {
        final.supplierMasterInfo = null;
      }
      final['purchaseReturnLines'] = this.linesArray.filter(x => x.isChecked);
      if (final['purchaseReturnLines'] && final['purchaseReturnLines'].length > 0) {
        final.purchaseReturnLines.forEach(el => {
          if (el.returnInventoryHelpers && el.returnInventoryHelpers.length > 0) {
            let removereturnIndex = [];
            el.returnInventoryHelpers.forEach((re, i) => {
              if (re.pickedQuantity) { }
              else {
                removereturnIndex.push(i);
              }
            });
            removereturnIndex.reverse();
            if (removereturnIndex.length) {
              removereturnIndex.forEach(rem => {
                el.returnInventoryHelpers.splice(rem, 1);
              });
            }

          }
          if (el.receiveInventoryHelpers && el.receiveInventoryHelpers.length > 0) {
            let removereceiveIndex = [];
            el.receiveInventoryHelpers.forEach((re, i) => {
              if (re.pickedQuantity) { }
              else {
                removereceiveIndex.push(i);
              }
            });
            removereceiveIndex.reverse();
            if (removereceiveIndex.length) {
              removereceiveIndex.forEach(rem => {
                el.receiveInventoryHelpers.splice(rem, 1);
              });
            }
          }
        });
        const arr = final['purchaseReturnLines'];
        let proceed: Boolean = true;
        let totalAmount: any = 0;
        let grossAmount: any = 0;
        let taxAmount: any = 0;
        let discount: any = 0;
        let discountAmount: any = 0;
        let taxPercentage: any = 0;
        let purchaseTaxes = [];
        arr.forEach(element => {
          if (element.eta) {
            element.eta = new Date(element.eta);
          }
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
            if (soLine.purchaseTaxes && soLine.purchaseTaxes.length > 0) {
              soLine.purchaseTaxes.forEach(el => {
                el.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(el.taxPercentage, 100), 1), amount), amount);
                taxPercentage = DecimalUtils.add(taxPercentage, (el.taxPercentage ? el.taxPercentage : 0))
              });
              element.taxPercentage = taxPercentage;

              soLine.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);;
              element.taxAmount = soLine.taxAmount;
              taxes = soLine.taxAmount;
            }
            element.netAmount = DecimalUtils.add(amount, taxes);
          }
          if (proceed) {
            if (DecimalUtils.lessThanOrEqual(element.returnQuantity,
              (DecimalUtils.add(element.totalReturnQuantity, element.totalReceivedQuantity) || (element.totalActualReturnQuantity &&
                (DecimalUtils.subtract(DecimalUtils.add(element.totalReturnQuantity, element.totalReceivedQuantity),
                  element.totalActualReturnQuantity)))))) {
              const arr3 = element.returnInventoryHelpers.map(x => x.pickedQuantity);
              const arr1 = element.receiveInventoryHelpers.map(x => x.pickedQuantity);
              const arr2 = arr3.concat(arr1);
              let sum: any = "0";
              if (arr2.length > 0) {
                arr2.forEach(element => {
                  sum = DecimalUtils.add(sum, element);
                });
              }
              proceed = (DecimalUtils.equals(element.returnQuantity, sum)) ? true : false;
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
          if (element.purchaseTaxes && element.purchaseTaxes.length) {
            purchaseTaxes = [...purchaseTaxes, ...element.purchaseTaxes];
          }
        });
        let grouped = purchaseTaxes.reduce(
          (result: any, currentValue: any) => {
            (result[currentValue['taxNamePercentage']] = result[currentValue['taxNamePercentage']] || []).push(currentValue);
            return result;
          }, {});
        final['totalNetAmount'] = totalAmount;
        final['totalGrossAmount'] = grossAmount;
        final['totalTaxAmount'] = taxAmount;
        final['totalDiscount'] = discount;
        final['totalDiscountAmount'] = discountAmount;
        final['totalTaxPercentage'] = taxPercentage;
        if (grouped) {
          final['totalPurchaseTaxes'] = [];
          const headers = Object.keys(grouped);
          headers.forEach(element => {
            let taxA: any = 0;
            grouped[element].forEach(tax => {
              taxA = DecimalUtils.add(taxA, tax.taxAmount);
            });
            final['totalPurchaseTaxes'].push({
              taxAmount: taxA,
              taxName: element.split(':')[0],
              taxNamePercentage: element,
              taxPercentage: element.split(':')[1],
            })
          });
        }
        if (proceed) {
          this.commonService.confirmPurchaseReturn(final).subscribe(res => {
            if (res['status'] == 0) {
              this.clear();
              this.toastr.success("Confirmed Successfully");
              this.getPurchases();
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
        this.toastr.error("Enter Return Quanity in Orders for Conform");
      }
    }
    else {
      this.toastr.error('User doenst hvav permission');
    }
  }
}
