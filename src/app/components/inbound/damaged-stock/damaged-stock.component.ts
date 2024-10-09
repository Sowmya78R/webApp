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
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { BarcodeService } from 'src/app/services/barcode.service';

@Component({
  selector: 'app-damaged-stock',
  templateUrl: './damaged-stock.component.html',
  styleUrls: ['./damaged-stock.component.scss']
})
export class DamagedStockComponent implements OnInit {
  formObj = this.configService.getGlobalpayload();
  goodsReceiptsData: any = [];
  wmpoIDs: CompleterData;
  damagedStockForm: FormGroup;
  damagedStockPermissionList: any = ['View', 'Create', 'Update', 'Delete'];
  linesArray: any = [];
  PRData: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  returnLocations: any = [];
  obj: any = null;
  globalIndex: any = null;
  selectedProductID: any = null;
  deleteInfo: any;
  locationType: any = 'All';
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  taxData: any = [];
  orderTypeDropdown = ['Purchase Order', 'WareHouseTransfer'];
  putAwaysList: any = [];
  WMPOs: any[];
  overAllPO: any = [];
  lineQuantity: any = null;

  totalItemsForReturn: any;
  pageForTableForReturn: number = 1;
  itemsPerPageForReturn: any = 5;
  searchKeyForReturn: any = null;

  totalItemsForHeader: any;
  pageForTableForHeader: number = 1;
  itemsPerPageForHeader: any = 5;
  searchKeyForHeader: any = null;

  selectedReturnRecords: any = [];
  finalReturnLocations: any = [];
  finalArray: any = [];
  locReturnAllocation: any = 'Manual';

  barcodePermissionUser: boolean = false;
  overAllBarcodeData: any = [];
  barcodeInfo: any = null;
  globalProduct: any = null;


  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private fb: FormBuilder, private commonService: CommonMasterDataService, private apexService: ApexService,
    private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService, private metaDataService: MetaDataService,
    private bService: BarcodeService) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.createForm();
    // this.fetchAllGR();
    this.getIDDropdowns();
    this.fetchConfigurations();
    this.fetchDamagedStock();
    // this.disableTheFields();
    this.findAllTaxes();
    this.fetchAllPutawaysBySupplierID('Purchase Order', 'key');
    this.fetchReturnAllocationType();
    this.fetchProductConfig();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  readOnlyMode: boolean = false;
  disableMe: boolean = false

  fetchReturnAllocationType() {
    this.metaDataService.getReturnLocationAllocationType(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.putawayReturnLocationAllocationConfigurations && res.data.putawayReturnLocationAllocationConfigurations.length > 0) {
        this.locReturnAllocation = res.data.putawayReturnLocationAllocationConfigurations[0].putawayReturnLocationAllocationType;
      }
    })
  }
  fetchConfigurations() {
    this.bService.fetchAllBarcodeAccess(this.formObj).subscribe(data => {
      if (data['status'] == 0 && data['data']['processBarcodeAccessConfigurations']) {
        const pType = data['data']['processBarcodeAccessConfigurations'].find(x => x.name == "Damaged Stock");
        if (pType) {
          const haveRole = pType.roleConfigurations.find(x => x.role.roleName == this.configService.userDetails.authorities[0].authority);
          if (haveRole) {
            const existedRole = haveRole.userInfos.find(x => x.email == this.configService.userDetails.username);
            if (existedRole) {
              this.barcodePermissionUser = true;
            }
          }
        }
      }
    })
  }
  fetchAllPutawaysBySupplierID(oType, key?) {
    if (!key) {
      this.damagedStockForm.controls.fullWmpoNumber.setValue(null);
      this.damagedStockForm.controls.wmpoNumber.setValue(null);
      this.damagedStockForm.controls.wmpoNumberPrefix.setValue(null);
    }
    this.WMPOs = [];
    this.putAwaysList = [];
    const form = this.configService.getGlobalpayload();
    form['supplierID'] = '';
    form['orderType'] = oType;
    form['status'] = "Open";
    this.wmsService.fetchAllPutawaysBySupplierID(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putaways.length > 0) {
          this.overAllPO = response.data.putaways;
          this.getPutawayWMPOS(response.data.putaways);
        } else {
          this.overAllPO = [];
          this.getPutawayWMPOS(null);
        }
      },
      (error) => {
      });
  }

  getPutawayWMPOS(data) {
    this.WMPOs = [];
    if (data) {
      data.forEach(line => {
        if (line.fullWmpoNumber && this.WMPOs.indexOf(line.fullWmpoNumber) === -1 && (line.putAwayCompleted === false)) {
          this.WMPOs.push(line.fullWmpoNumber);
        }
      });
    }
  }
  setWmpoNumber(event) {
    if (event) {
      const wmpoFilteredObj = this.overAllPO.find(x => x.fullWmpoNumber == event.originalObject);
      this.damagedStockForm.controls.wmpoNumber.setValue(wmpoFilteredObj.wmpoNumber);
      this.damagedStockForm.controls.wmpoNumberPrefix.setValue(wmpoFilteredObj.wmpoNumberPrefix);
      this.damagedStockForm.controls.orderType.setValue(wmpoFilteredObj.orderType);
      this.fetchAllPutawayDetails();
    }
    else {
      this.damagedStockForm.controls.wmpoNumber.setValue(null);
      this.damagedStockForm.controls.wmpoNumberPrefix.setValue(null);
    }
  }
  fetchAllPutawayDetails(id?) {
    const form = this.damagedStockForm.value;
    const formPayload = {
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "wmpoNumber": form.wmpoNumber,
      "orderType": form.orderType,
      "fullWmpoNumber": form.fullWmpoNumber,
      "wmpoNumberPrefix": form.wmpoNumberPrefix,
      "id": id ? id : null
    }
    this.commonService.damagedStockByWMpoNumber(formPayload).subscribe(data => {
      if (data['status'] == 0 && data['data'].putawayDamagedStocks.length > 0) {
        this.damagedStockForm.patchValue(data['data'].putawayDamagedStocks[0]);
        this.damagedStockForm.controls.orderType.patchValue(form.orderType);
        this.linesArray = data['data'].putawayDamagedStocks[0].putawayDamagedStockLines;
        this.linesArray.forEach(el => {
          el.forBarcode = null;
          delete el.productImageResource;
          el['saveRecentReturn'] = false;
          el['savedReturnLocations'] = (formPayload.id) ? el.returnLocationHelpers : [];
          el['isChecked'] = el.returnPutawayQuantity ? true : false;
          if (formPayload.id) {
            el['returnPutawayQuantity'] = el.returnPutawayQuantity ? el.returnPutawayQuantity : null;
          }
          el['isEdit'] = el.returnPutawayQuantity ? true : false;
          el['returnLocationAllocationType'] = el['returnLocationAllocationType'] ? el['returnLocationAllocationType'] : this.locReturnAllocation;
        });
      }
    })
  }

  saveAllocationType(type, i) {
    if (!this.damagedStockForm.controls.confirmed.value) {
      if (i || i == 0) {
        this.linesArray[i].returnLocationAllocationType = ((type == 'Manual') ? 'Auto' : "Manual");
      }
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
  disableTheFields() {
    if (this.damagedStockPermissionList.includes('View') && this.damagedStockPermissionList.includes('Update')) {
      this.readOnlyMode = false
      this.disableMe = false;
      /*  this.damagedStockForm.controls.receiptDate.disable();
       this.damagedStockForm.controls.supplierID.disable();
       this.damagedStockForm.controls.supplierName.disable();
       this.damagedStockForm.controls.customersSupplierName.disable();
       this.damagedStockForm.controls.customersSupplierAddress.disable(); */
    }
    else if (this.damagedStockPermissionList.includes('View')) {
      this.readOnlyMode = true;
      this.disableMe = true;
      /*  this.damagedStockForm.controls.receiptDate.enable();
       this.damagedStockForm.controls.supplierID.enable();
       this.damagedStockForm.controls.supplierName.enable();
       this.damagedStockForm.controls.customersSupplierName.enable();
       this.damagedStockForm.controls.customersSupplierAddress.enable() */
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
    this.damagedStockForm.controls.orderType.setValue(event);
    this.getIDDropdowns();
  }
  getIDDropdowns() {
    const form = JSON.parse(JSON.stringify(this.formObj));
    form['orderType'] = this.damagedStockForm.controls.orderType.value;
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
    this.damagedStockForm = this.fb.group({
      _id: null,
      wmpoNumber: null,
      fullWmpoNumber: null,
      wmpoNumberPrefix: null,
      orderType: 'Purchase Order',
      customersSupplierAddress: null,
      customersSupplierName: null,
      confirmed: null,
      createdDate: null,
      fullPutawayDamagedStockNumber: null,
      lastUpdatedDate: null,
      organizationInfo: this.configService.getOrganization(),
      putawayDamagedStockNumber: null,
      putawayDamagedStockNumberPrefix: null,
      wareHouseInfo: this.configService.getWarehouse(),
      supplierMasterInfo: this.fb.group({
        supplierMasterID: null,
        supplierID: null,
        supplierIDName: null,
        supplierName: null
      }),
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
    })
  }


  validateDecimal(key, i) {
    this.linesArray[i][key] = (DecimalUtils.enterLimitedDecimals(this.linesArray[i][key]));
  }

  generate() {
    if (((this.damagedStockPermissionList.includes("Update")) && this.globalIDs) || (this.damagedStockPermissionList.includes("Create") && !this.globalIDs)) {
      // const final = this.damagedStockForm.value;
      // if (!final.wareHouseTransferSourceInfo && !final.wareHouseTransferSourceInfo.wareHouseIDName) {
      //   final.wareHouseTransferSourceInfo = null;
      // }
      // if (!final.supplierMasterInfo && !final.supplierMasterInfo.supplierIDName) {
      //   final.supplierMasterInfo = null;
      // }
      const final = this.damagedStockForm.value;
      if (!final.wareHouseTransferSourceInfo && !final.wareHouseTransferSourceInfo.wareHouseIDName) {
        final.wareHouseTransferSourceInfo = null;
      }
      if (!final.supplierMasterInfo && !final.supplierMasterInfo.supplierIDName) {
        final.supplierMasterInfo = null;
      }
      final['putawayDamagedStockLines'] = this.linesArray.filter(x => x.isChecked);
      if (final.putawayDamagedStockLines && final.putawayDamagedStockLines.length > 0) {
        const arr = final.putawayDamagedStockLines;
        let proceed: Boolean = true;
        arr.forEach(element => {
          if (proceed) {
            let arr3 = [];
            if (element.returnLocationHelpers && element.returnLocationHelpers.length > 0) {
              arr3 = element.returnLocationHelpers.map(x => x.quantity);
            }
            let sum: any = "0";
            if (element.returnLocationAllocationType == 'Manual') {
              if (arr3.length == 0) {
                this.toastr.error('Enter Locations');
                sum = 0;
              }
              if (arr3.length > 0) {
                arr3.forEach(element => {
                  sum = DecimalUtils.add(sum, element);
                });
              }
            }
            else {
              sum = element.returnPutawayQuantity;
              element.returnLocationHelpers = null;
            }
            proceed = (DecimalUtils.equals(element.returnPutawayQuantity, sum)) ? true : false;
            // }
            // else {
            //   return proceed = false;
            // }
          }
        });
        if (proceed) {
          this.commonService.createDamagedStock(final).subscribe(res => {
            if (res['status'] == 0 && res['data']['putawayDamagedStockObj']) {
              this.toastr.success("Created Successfully");
              this.edit(res['data']['putawayDamagedStockObj']);
              this.fetchDamagedStock();
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
    this.damagedStockForm.enable();
    this.createForm();
  }
  globalIDs: any;
  edit(data) {
    this.globalIDs = data._id;
    if (this.damagedStockPermissionList.includes('Update')) {
      if (data.confirmed) {
        this.damagedStockForm.disable();
      }
      else {
        this.damagedStockForm.enable();
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
      this.damagedStockForm.patchValue(data);
      if (data.confirmed) {
        this.linesArray = data.putawayDamagedStockLines;
        this.linesArray.forEach(el => {
          delete el.productImageResource;
          el['saveRecentReturn'] = false;
          el['savedReturnLocations'] = el.returnLocationHelpers;
          el['isChecked'] = true;
          el['isEdit'] = false;
          el['forBarcode'] = null;
        })
      }
      else {
        this.fetchAllPutawayDetails(data._id);
      }

    }
    else {
      this.toastr.error('user doesnt have permission');
    }
  }
  fetchDamagedStock(page?) {
    const form = this.formObj;
    form['page'] = page ? page : this.pageForTableForHeader;
    form['pageSize'] = this.itemsPerPageForHeader;
    this.commonService.fetchAllDamagedStocks(form).subscribe(res => {
      if (res['status'] == 0 && res['data']['putawayDamagedStockPaginationResponse'] && res['data']['putawayDamagedStockPaginationResponse'].putawayDamagedStocks.length > 0) {
        this.totalItemsForHeader = res.data.putawayDamagedStockPaginationResponse.totalElements;
        this.finalArray = res['data']['putawayDamagedStockPaginationResponse'].putawayDamagedStocks;
      }
      else {
        this.totalItemsForHeader = null;
        this.finalArray = [];
      }
    })
  }
  onSelect(event, data) {
    data['returnPutawayQuantity'] = null;
    if (event) {
      data['isEdit'] = true;
      data['isChecked'] = event;
    }
    else {
      data['isEdit'] = false;
      data['isChecked'] = event;
    }
  }
  savequantity(value, data, key, gotoGenerate?) {
    if (this.damagedStockPermissionList.includes('Update')) {
      const Qty = (data.balancePutawayQuantity == null) ? data.quantity : data.balancePutawayQuantity;
      if (DecimalUtils.greaterThanOrEqual(Qty, value)) {
        data[key] = value;
        if (data.returnPutawayQuantity) {
          data['isChecked'] = true;
          if (gotoGenerate) {
            this.generate();
          }
        }
        else {
          data['isChecked'] = false;
        }
      }
      else {
        this.toastr.error("Return Quantity should not be Greater than balance Quantity");
        data['isChecked'] = false;
        data['returnPutawayQuantity'] = null;
        data['isEdit'] = false
      }
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
  }
  openModalRecievedLocations(data, i) {
    if (this.linesArray[i].returnPutawayQuantity && this.linesArray[i].returnPutawayQuantity != 0) {
      const previousIndex = this.globalIndex;
      this.globalIndex = i;
      if (previousIndex != this.globalIndex) {
        this.finalReturnLocations = [];
      }
      if (this.linesArray[i].saveRecentReturn == false) {
        this.finalReturnLocations = JSON.parse(JSON.stringify(this.linesArray[i].savedReturnLocations));
      }
      else {
        this.finalReturnLocations = JSON.parse(JSON.stringify(this.linesArray[i].returnLocationHelpers));
      }
      this.pageForTableForReturn = 1;
      this.lineQuantity = this.linesArray[i].returnPutawayQuantity + ' ' + this.linesArray[i].inventoryUnit;

      this.selectedReturnRecords = JSON.parse(JSON.stringify(this.finalReturnLocations));
      if (this.linesArray[i].returnPutawayQuantity != 0) {
        this.fetchAllReturnLocations(data, null, 'true');
      }
    }
    else {
      this.toastr.error("Enter Return Quantity!!");
      this.globalIndex = -1;
    }
  }

  closeEvent(modalType) {
    if ((this.globalIndex != -1 || this.globalIndex == 0) && (this.finalReturnLocations && this.finalReturnLocations.length > 0)) {
      this.linesArray[this.globalIndex].returnLocationHelpers = this.finalReturnLocations;
    }
    this.ngxSmartModalService.getModal('returnLocationsModal').close();
  }
  validateLocationDecimal(arr, i) {
    this[arr][i].quantity = DecimalUtils.enterLimitedDecimals(this[arr][i].quantity);
  }
  read1(event, data1) {
    this.returnLocations.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.returnLocations.find(x => x.isEdit == true);
      if (currentItem && (currentItem.quantity == null)) {
        this.toastr.warning('Please enter Picked Quantity');
      }
      this.returnLocations.map(element => element.isEdit = false);
      data1.isEdit = true;
      if (currentItem && currentItem.quantity) {
        if (event.target.checked && data1.quantity) {
          data1.isChecked = event.target.value;
        }
        else if (event.target.checked && !data1.quantity) {
          data1.isChecked = event.target.value;
          data1.isEdit = true;
        }
        else {
          data1.isChecked = false;
          data1.isEdit = false;
          data1['quantity'] = '';
        }
      }
    }
    else {
      data1.isChecked = false;
      data1.isEdit = false;
      data1.quantity = null;
    }
    if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
      this.selectedReturnRecords = this.selectedReturnRecords.filter(x => x._id != data1._id);
    }
    if (this.globalIndex != -1 || this.globalIndex == 0) {
      if (this.linesArray[this.globalIndex].returnLocationHelpers && this.linesArray[this.globalIndex].returnLocationHelpers.length > 0) {
        this.linesArray[this.globalIndex].returnLocationHelpers = this.linesArray[this.globalIndex].returnLocationHelpers.filter(x => x._id != data1._id);
      }
    }
    this.returnLocations.forEach(element => {
      if (element.quantity) {
        element.isChecked = true;
      }
    });
  }
  savequantity1(value, data, key) {
    const arr = (key == 'Receive') ? 'selectedReceiveRecords' : 'selectedReturnRecords';
    if (data.usableSpaceCheck != 'Yes') {
      data['quantity'] = value;
      data['isChecked'] = true;
      if (data.maxDimensionCheck == 'Yes' || data.weightCheck == 'Yes') {
        this.onDocumentSelect(true, data);
      }
    }
    else {
      if (DecimalUtils.greaterThanOrEqual(data.allowableQuantity, value)) {
        data['quantity'] = value;
        data['isChecked'] = true;
        if (!this[arr]) {
          this[arr] = [];
        }
        if (this[arr] && this[arr].length > 0) {
          const FI = this[arr].findIndex(x => x._id == data._id)
          if (FI != -1 && (!data.quantity || data.quantity == "0")) {
            this[arr] = this[arr].filter(x => x._id != x._id);
          }
          else {
            if (FI == -1) {
              if (data.quantity && data.quantity != "0") {
                this[arr].push(data);
              }
            }
            else {
              if (data.quantity && data.quantity != "0") {
                this[arr][FI].quantity = data.quantity;
              }
            }
          }
        }
        else {
          if (data.quantity && data.quantity != "0") {
            this[arr].push(data);
          }
        }
        if (data.maxDimensionCheck == 'Yes' || data.weightCheck == 'Yes') {
          this.onDocumentSelect(true, data);
        }
      }
      else {
        data.isEdit = false;
        data['quantity'] = '';
        data['isChecked'] = false;
        this.toastr.error('Required Quantity should be less than Quantity')
      }
    }
  }
  onDocumentSelect(event, form) {
    if (event && form.quantity) {
      const locName = form.locationName + ':' + form.allowableQuantity;
      const pID = this.linesArray[this.globalIndex].productMasterInfo.productMasterID;
      // (this.hidePanel || this.isAllocateObject) ? this.linesArray[this.globalIndex].productMasterInfo.productMasterID : this.receivingForm.controls.productMasterInfo.value.productMasterID;
      this.wmsService.fetchCheckRecieveLoc(form.locationName, locName, pID,
        form.quantity, this.formObj).subscribe(res => {
          if (res.status == '0' && res.data.locationValidations) {
            if (res.data.locationValidations.validMaxDimension && res.data.locationValidations.validWeight) {
              form.isChecked = event;
            }
            else {
              form.quantity = '';
              form.isEdit = false;
              // this.toastr.error('Unable to Add')
              this.toastr.error('Received Quantity Should not be greather than Order Quantity')
              form.isChecked = false;
            }
          }
        })
    }
    else {
      if (event) {
        delete form.isChecked;
        this.toastr.error('Enter Required Quantity')
      }
      else {
        form.isEdit = false;
        form['quantity'] = '';
      }
    }
  }
  saveReturnLocations() {
    let count: any = 0;
    if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
      this.selectedReturnRecords.forEach(element => {
        count = DecimalUtils.add(count, element.quantity);
      });
    }
    else {
      this.returnLocations.forEach(element => {
        if (element.isChecked) {
          count = DecimalUtils.add(count, element.quantity);
        }
      });
    }
    let dummyCount = this.linesArray[this.globalIndex].returnPutawayQuantity;
    if (DecimalUtils.equals(count, dummyCount)) {
      this.ngxSmartModalService.getModal('returnLocationsModal').close();
      this.toastr.success('Saved');
      let filteredReturnLocations = (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) ? this.selectedReturnRecords : this.returnLocations.filter(x => x.isChecked == true);
      if (filteredReturnLocations.length > 0) {
        // this.returnShowValues = filteredReturnLocations.map(x => x.locationName).toString();
        filteredReturnLocations.forEach(element => {
          delete element.isEdit;
          delete element.isChecked;
        });
      }
      if (this.globalIndex != -1 || this.globalIndex == 0) {
        this.linesArray[this.globalIndex].saveRecentReturn = true;
        this.linesArray[this.globalIndex].returnLocationHelpers = filteredReturnLocations;
      }
      this.finalReturnLocations = JSON.parse(JSON.stringify(filteredReturnLocations));
      this.selectedReturnRecords = [];
    }
    else {
      this.toastr.error("Selected Locations Quantity should be equal Return Quantity");
      this.finalReturnLocations = [];
    }
  }
  resetRecieveLocations(key) {
    this.returnLocations.forEach(x => {
      x['isEdit'] = false;
      x['isChecked'] = false;
      x['quantity'] = null;
    });
  }
  returnLocForTablePagination(pageForTableForReturn, fromselectEntries?) {
    if (fromselectEntries) {
      this.pageForTableForReturn = 1;
    }
    let filteredReturnLocations = [];
    filteredReturnLocations = this.returnLocations.filter(x => x.isChecked == true && x.quantity);
    if (this.linesArray[this.globalIndex].saveRecentReturn) {
      this.selectedReturnRecords = this.linesArray[this.globalIndex].returnLocationHelpers;
    }
    if (filteredReturnLocations.length > 0) {
      filteredReturnLocations.forEach(element => {
        delete element.isEdit;
        delete element.isChecked;
      });
      const dummy = this.selectedReturnRecords;
      if (dummy && dummy.length > 0) {
        filteredReturnLocations.forEach(element => {
          const findIndex = this.selectedReturnRecords.findIndex(srr => srr._id == element._id);
          if (findIndex == -1) {
            this.selectedReturnRecords.push(element);
          }
          else {
            this.selectedReturnRecords[findIndex].quantity = element.quantity;
          }
        })
      }
      else {
        this.selectedReturnRecords = filteredReturnLocations;
      }
      if (this.globalIndex != -1 || this.globalIndex == 0) {

        this.linesArray[this.globalIndex].returnLocationHelpers = this.selectedReturnRecords;
      }
    }
    this.fetchAllReturnLocations(this.linesArray[this.globalIndex], pageForTableForReturn);
  }
  fetchAllReturnLocations(data, page?, showError?) {
    this.returnLocations = [];
    this.fetchReturnLocationsForTable(data, page, showError);
  }
  fetchReturnLocationsForTable(data, page, showError) {
    const form = {
      'organizationIDName': this.formObj.organizationIDName,
      'wareHouseIDName': this.formObj.wareHouseIDName,
      "locationPage": page ? page : 1,
      "locationPageSize": this.itemsPerPageForReturn,
      "productMasterID": data.productMasterInfo.productMasterID,
    }
    this.commonService.returnLocForPutawayWithPgination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putawayLocationsResponse.locationHelpers && response.data.putawayLocationsResponse.locationHelpers.length > 0) {
          const obj = response.data.putawayLocationsResponse;
          if (showError) {
            this.ngxSmartModalService.getModal('returnLocationsModal').open();
            this.totalItemsForReturn = response['data'].putawayLocationsResponse.totalElements;
          }
          if (obj.locationHelpers && obj.locationHelpers.length > 0) {
            obj.locationHelpers.forEach(x => {
              x['isEdit'] = false;
              x['isChecked'] = false;
              if (x.quantity) {
                x.isChecked = true;
              }
            });
          }
          let locationHelpers = null;
          this.returnLocations = obj.locationHelpers;
          this.totalItemsForReturn = obj.totalElements;
          if (this.globalIndex != -1 || this.globalIndex == 0) {
            if (this.linesArray[this.globalIndex].returnLocationHelpers && this.linesArray[this.globalIndex].returnLocationHelpers.length > 0) {
              locationHelpers = this.linesArray[this.globalIndex].returnLocationHelpers.map(x => x._id);
            }
          }
          // if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
          //   locationHelpers = this.selectedReturnRecords.map(x => x._id);
          // }
          this.returnLocations.forEach(x => {
            x['isEdit'] = false;
            x['isChecked'] = false;
            x['quantity'] = null;
            if (locationHelpers && locationHelpers.length > 0 && locationHelpers.includes(x._id)) {
              let existed = null;
              // if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
              //   existed = this.selectedReturnRecords.find(y => y._id == x._id);
              // }
              // else {
              existed = this.linesArray[this.globalIndex].returnLocationHelpers.find(y => y._id == x._id);
              // }
              x['isEdit'] = true;
              x['isChecked'] = true;
              x['quantity'] = existed.quantity;
            }
          });
        }
        else {
          this.totalItemsForReturn = null;
          this.returnLocations = [];
          this.toastr.error("No Locations");
        }
      })
  }
  delete(data: any) {
    if (this.damagedStockPermissionList.includes('Delete')) {
      if (!data.confirmed) {
        this.deleteInfo = { name: 'damagedStock', id: data._id };
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
      this.fetchDamagedStock();
    }
  }

  confirm() {
    if (this.damagedStockPermissionList.includes('Update')) {
      const final = this.damagedStockForm.value;
      if (!final.wareHouseTransferSourceInfo.wareHouseIDName) {
        final.wareHouseTransferSourceInfo = null;
      }
      if (!final.supplierMasterInfo.supplierIDName) {
        final.supplierMasterInfo = null;
      }
      final['putawayDamagedStockLines'] = this.linesArray.filter(x => x.isChecked);
      if (final.putawayDamagedStockLines && final.putawayDamagedStockLines.length > 0) {
        const arr = final.putawayDamagedStockLines;
        let proceed: Boolean = true;
        arr.forEach(element => {
          if (proceed) {
            let arr3 = [];
            if (element.returnLocationHelpers && element.returnLocationHelpers.length > 0) {
              arr3 = element.returnLocationHelpers.map(x => x.quantity);
            }
            let sum: any = "0";
            if (element.returnLocationAllocationType == 'Manual') {
              if (arr3.length == 0) {
                this.toastr.error('Enter Locations');
                sum = 0;
              }
              if (arr3.length > 0) {
                arr3.forEach(element => {
                  sum = DecimalUtils.add(sum, element);
                });
              }
            }
            else {
              sum = element.returnPutawayQuantity;
              element.returnLocationHelpers = null;
            }
            proceed = (DecimalUtils.equals(element.returnPutawayQuantity, sum)) ? true : false;

            // }
            // else {
            //   return proceed = false;
            // }
          }
        });

        if (proceed) {
          // final.forEach(element => {
          //   if(!element._id && this.finalArray.length){
          //     const id = this.finalArray.find(x=>x.)
          //   }
          // });
          this.commonService.confirmDamagedStock(final).subscribe(res => {
            if (res['status'] == 0 && res.data['putawayDamagedStockObj']) {
              this.clear();
              this.toastr.success("Confirmed Successfully");
              this.fetchDamagedStock();
            }
            else {
              this.toastr.error(res['statusMsg']);
            }
          })
        }
        else {
          this.toastr.error("Enter Proper Details")
        }
        // }
        // else {
        //   this.toastr.error("Enter Return Quanity in Orders for Conform");
        // }
      }
      else {
        this.toastr.error("User doesn't have permission");
      }
    }
  }
  fetchProductConfig() {
    this.bService.fetchAllProductsBarcode(this.formObj).subscribe(res => {
      if (res['status'] === 0 && res['data']['productBarcodeConfigurations'].length > 0) {
        this.overAllBarcodeData = res['data']['productBarcodeConfigurations'];
      }
      else {
        this.overAllBarcodeData = [];
      }
    })
  }
  isProductAvailable(event, data) {
    if (event && event.length == 12) {
      const filterBarcode = this.overAllBarcodeData.find(x => x.upcEANNumber == event);
      if (filterBarcode && filterBarcode.productMasterInfo.productIDName === data.productMasterInfo.productIDName && filterBarcode.unitCode == data.inventoryUnit) {
        data.returnPutawayQuantity = data.returnPutawayQuantity ? (DecimalUtils.add(data.returnPutawayQuantity, 1)) : 1;
        this.savequantity(data.returnPutawayQuantity, data, 'returnPutawayQuantity', 'gotoGenerate')
      }
      else {
        this.toastr.error('No matching product');
      }
      data.forBarcode = null;
    }
  }
  openScanner(data) {
    this.globalProduct = data;
    this.barcodeInfo = { 'toggle': true };
    this.ngxSmartModalService.getModal('scannerModalForWebCam').open();
  }
  getBarcodeEvent(status) {
    if (status) {
      if (this.globalProduct) {
        this.globalProduct.forBarcode = status;
      }
      this.isProductAvailable(status, this.globalProduct);
    }
  }
}
