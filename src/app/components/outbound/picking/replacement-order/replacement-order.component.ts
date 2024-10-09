import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { DecimalUtils } from 'src/app/constants/decimal';
import { BarcodeService } from 'src/app/services/barcode.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-replacement-order',
  templateUrl: './replacement-order.component.html',
  styleUrls: ['./replacement-order.component.scss']
})
export class ReplacementOrderComponent implements OnInit {
  rcForm: FormGroup;
  orderTypeDropdown = ['Sales Order', 'WareHouseTransfer'];
  formObj = this.configService.getGlobalpayload();
  WMSOs: any = [];
  pickingsList: any = [];
  overAllSO: any = [];
  linesArray: any = [];
  pickLocAllocation: any = 'Manual';
  globalIDs: any;
  permissionList = ['View', 'Create', 'Update', 'Delete'];

  totalItemsForReturn: any;
  pageForTableForReturn: number = 1;
  itemsPerPageForReturn: any = 5;
  searchKeyForReturn: any = null;

  totalItemsForHeader: any;
  pageForTableForHeader: number = 1;
  itemsPerPageForHeader: any = 5;
  searchKeyForHeader: any = null;

  finalArray: any = [];
  deleteInfo: any;
  selectedReturnRecords: any = [];
  finalReturnLocations: any = [];
  globalIndex: any = null;
  returnLocations: any = [];
  lineQuantity: any = null;

  barcodePermissionUser: boolean = false;
  overAllBarcodeData: any = [];
  barcodeInfo: any = null;
  globalProduct: any = null;

  constructor(private fb: FormBuilder, private configService: ConfigurationService, private ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService, private commonService: CommonMasterDataService,private bService: BarcodeService,
    private metaDataService: MetaDataService, private toastr: ToastrService) { }

  ngOnInit() {
    this.createPickingPlanningForm();
    this.fetchConfigurations();
    this.fetchPickingAllocationType();
    this.fetchReplacementOrders();
    this.fetchwmsoNumbers('Sales Order');
    this.fetchProductConfig();
  }
  createPickingPlanningForm() {
    this.rcForm = this.fb.group({
      _id: null,
      wmsoNumber: null,
      fullWmsoNumber: null,
      orderType: 'Sales Order',
      wmsoNumberPrefix: null,
      confirmed: null,
      createdDate: null,
      fullReplacementOrderNumber: null,
      lastUpdatedDate: null,
      organizationInfo: this.configService.getOrganization(),
      referenceSoNumber: null,
      replacementOrderNumber: null,
      replacementOrderNumberPrefix: null,
      soID: null,
      wareHouseInfo: this.configService.getWarehouse(),
    })
  }
  fetchConfigurations() {
    this.bService.fetchAllBarcodeAccess(this.formObj).subscribe(data => {
      if (data['status'] == 0 && data['data']['processBarcodeAccessConfigurations']) {
        const pType = data['data']['processBarcodeAccessConfigurations'].find(x => x.name == "Replacement Order");
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
  fetchwmsoNumbers(oType) {
    this.rcForm.controls.fullWmsoNumber.setValue(null);
    this.rcForm.controls.wmsoNumberPrefix.setValue(null);
    this.rcForm.controls.wmsoNumber.setValue(null);
    this.WMSOs = [];
    this.pickingsList = [];
    const data = JSON.parse(JSON.stringify(this.formObj));
    data['orderType'] = oType;

    this.wmsService.fetchAllPickingPlanningTableData(data).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickings.length > 0) {
          this.overAllSO = response.data.pickings;
          this.getWMSOS(response.data.pickings);
        } else {
          this.overAllSO = [];
          this.getWMSOS(null);
        }
        this.setWmsoNumber();
      },
      (error) => {
      });
  }
  getWMSOS(data) {
    this.WMSOs = [];
    if (data) {
      data.forEach(line => {
        if (line.fullWmsoNumber && this.WMSOs.indexOf(line.fullWmsoNumber) === -1 && (line.pickingCompleted === false)) {
          this.WMSOs.push(line.fullWmsoNumber);
        }
      });
    }
  }
  setWmsoNumber(event?) {
    if (event) {
      const wmsoFilteredObj = this.overAllSO.find(x => x.fullWmsoNumber == event);
      this.rcForm.controls.wmsoNumber.setValue(wmsoFilteredObj.wmsoNumber);
      this.rcForm.controls.wmsoNumberPrefix.setValue(wmsoFilteredObj.wmsoNumberPrefix);
      this.rcForm.controls.orderType.setValue(wmsoFilteredObj.orderType);
      this.fetchAllPickingDetails();
    }
    else {
      this.rcForm.controls.wmsoNumber.setValue(null);
      this.rcForm.controls.wmsoNumberPrefix.setValue(null);
    }
  }
  fetchAllPickingDetails(id?) {
    const form = this.rcForm.value;
    const formPayload = {
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "wmsoNumber": form.wmsoNumber,
      "orderType": form.orderType,
      "fullWmsoNumber": form.fullWmsoNumber,
      "wmsoNumberPrefix": form.wmsoNumberPrefix,
      "id": id ? id : null
    }
    this.commonService.replacementOrderByWmsoNumber(formPayload).subscribe(data => {
      if (data['status'] == 0 && data['data'].replacementOrders.length > 0) {
        this.rcForm.patchValue(data['data'].replacementOrders[0]);
        this.rcForm.controls.orderType.patchValue(form.orderType);
        this.linesArray = data['data'].replacementOrders[0].replacementOrderLines;
        if (formPayload.id) {
          this.linesArray.forEach(el => {
            delete el.productImageResource;
            el['forBarcode'] = null;
            el['saveRecentReturn'] = false;
            el['savedReturnLocations'] = el.inventoryHelpers;
            el['isChecked'] = el.replacementOrderQuantity ? true : false;
            el['isEdit'] = el.replacementOrderQuantity ? true : false;
            el['locationAllocationType'] = el['locationAllocationType'] ? el['locationAllocationType'] : this.pickLocAllocation;
          });
        }
        else {
          this.linesArray.forEach(el => {
            delete el.productImageResource;
            el['forBarcode'] = null;
            el['saveRecentReturn'] = false;
            el['savedReturnLocations'] = [];
            el['isChecked'] = el.replacementOrderQuantity ? true : false;
            el['replacementOrderQuantity'] = el.replacementOrderQuantity ? el.replacementOrderQuantity : null;
            el['isEdit'] = el.replacementOrderQuantity ? true : false;
            el['locationAllocationType'] = el['locationAllocationType'] ? el['locationAllocationType'] : this.pickLocAllocation;
          });
        }
      }
    })
  }
  fetchPickingAllocationType() {
    this.metaDataService.getLocationAllocationType(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.pickingLocationAllocationConfigurations && res.data.pickingLocationAllocationConfigurations.length > 0) {
        this.pickLocAllocation = res.data.pickingLocationAllocationConfigurations[0].pickingLocationAllocationType;
      }
      else {
        this.pickLocAllocation = 'Manual';
      }
    })
  }
  onSelect(event, data) {
    data['replacementOrderQuantity'] = null;
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
    if (this.permissionList.includes('Update')) {
      const Qty = (data.balancePickingQuantity == null) ? data.pickedQuantity : data.balancePickingQuantity;
      if (DecimalUtils.greaterThanOrEqual(Qty, value)) {
        data[key] = value;
        if (data.replacementOrderQuantity) {
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
        this.toastr.error("Return Quantity should not be greater than balance Quantity");
        data['isChecked'] = false;
        data['replacementOrderQuantity'] = null;
        data['isEdit'] = false
      }
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
  }
  saveAllocationType(type, i) {
    if (!this.rcForm.controls.confirmed.value) {
      if (i || i == 0) {
        this.linesArray[i].locationAllocationType = ((type == 'Manual') ? 'Auto' : "Manual");
      }
    }
  }
  openModalRecievedLocations(data, i) {
    if (this.linesArray[i].replacementOrderQuantity && this.linesArray[i].replacementOrderQuantity != 0) {
      const previousIndex = this.globalIndex;
      this.globalIndex = i;
      if (previousIndex != this.globalIndex) {
        this.finalReturnLocations = [];
      }
      if (this.linesArray[i].saveRecentReturn == false) {
        this.finalReturnLocations = JSON.parse(JSON.stringify(this.linesArray[i].savedReturnLocations));
      }
      this.pageForTableForReturn = 1;
      this.lineQuantity = this.linesArray[i].replacementOrderQuantity + ' ' + this.linesArray[i].inventoryUnit;
      this.selectedReturnRecords = JSON.parse(JSON.stringify(this.finalReturnLocations));
      if (this.linesArray[i].replacementOrderQuantity != 0) {
        this.fetchAllReturnLocations(data, null, 'true');
      }
    }
    else {
      this.toastr.error("Enter Return Quantity!!");
      this.globalIndex = -1;
    }
  }
  returnLocForTablePagination(pageForTableForReturn, fromselectEntries?) {
    if (fromselectEntries) {
      this.pageForTableForReturn = 1;
    }
    let filteredReturnLocations = [];
    filteredReturnLocations = this.returnLocations.filter(x => x.isChecked == true && x.pickedQuantity);
    if (this.linesArray[this.globalIndex].saveRecentReturn) {
      this.selectedReturnRecords = this.linesArray[this.globalIndex].inventoryHelpers;
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
            this.selectedReturnRecords[findIndex].pickedQuantity = element.pickedQuantity;
          }
        })
      }
      else {
        this.selectedReturnRecords = filteredReturnLocations;
      }
      if (this.globalIndex != -1 || this.globalIndex == 0) {

        this.linesArray[this.globalIndex].inventoryHelpers = this.selectedReturnRecords;
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
      "page": page ? page : 1,
      "pageSize": this.itemsPerPageForReturn,
      "productMasterID": data.productMasterInfo.productMasterID,
      "productID": data.productMasterInfo.productID,
      "productName": data.productMasterInfo.productName,
      "productIDName": data.productMasterInfo.productIDName,
      "brandName": data.productMasterInfo.brandName
    }
    this.wmsService.getInventoryDetailsWithPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryPaginationResponse.inventoryHelpers && response.data.inventoryPaginationResponse.inventoryHelpers.length > 0) {
          const obj = response.data.inventoryPaginationResponse;
          if (showError) {
            this.ngxSmartModalService.getModal('returnLocationsModal').open();
            this.totalItemsForReturn = response['data'].inventoryPaginationResponse.totalElements;
          }
          if (obj.inventoryHelpers && obj.inventoryHelpers.length > 0) {
            obj.inventoryHelpers.forEach(x => {
              x['isEdit'] = false;
              x['isChecked'] = false;
              if (x.pickedQuantity) {
                x.isChecked = true;
              }
            });
          }
          let inventoryHelpers = null;
          this.returnLocations = obj.inventoryHelpers;
          this.totalItemsForReturn = obj.totalElements;
          if (this.globalIndex != -1 || this.globalIndex == 0) {
            if (this.linesArray[this.globalIndex].inventoryHelpers && this.linesArray[this.globalIndex].inventoryHelpers.length > 0) {
              inventoryHelpers = this.linesArray[this.globalIndex].inventoryHelpers.map(x => x._id);
            }
          }
          // if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
          //   inventoryHelpers = this.selectedReturnRecords.map(x => x._id);
          // }
          this.returnLocations.forEach(x => {
            x['isEdit'] = false;
            x['isChecked'] = false;
            x['pickedQuantity'] = null;
            if (inventoryHelpers && inventoryHelpers.length > 0 && inventoryHelpers.includes(x._id)) {
              let existed = null;
              // if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
              //   existed = this.selectedReturnRecords.find(y => y._id == x._id);
              // }
              // else {
              existed = this.linesArray[this.globalIndex].inventoryHelpers.find(y => y._id == x._id);
              // }
              x['isEdit'] = true;
              x['isChecked'] = true;
              x['pickedQuantity'] = existed.pickedQuantity;
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
  validateDecimal(key, i) {
    this.linesArray[i][key] = (DecimalUtils.enterLimitedDecimals(this.linesArray[i][key]));
  }
  closeEvent(modalType) {
    if ((this.globalIndex != -1 || this.globalIndex == 0) && this.finalReturnLocations.length > 0) {
      this.linesArray[this.globalIndex].inventoryHelpers = this.finalReturnLocations;
    }
    this.ngxSmartModalService.getModal('returnLocationsModal').close();
  }
  generate() {
    if (((this.permissionList.includes("Update")) && this.globalIDs) || (this.permissionList.includes("Create") && !this.globalIDs)) {
      const final = this.rcForm.value;
      // if (!final.wareHouseTransferSourceInfo && !final.wareHouseTransferSourceInfo.wareHouseIDName) {
      //   final.wareHouseTransferSourceInfo = null;
      // }
      // if (!final.supplierMasterInfo && !final.supplierMasterInfo.supplierIDName) {
      //   final.supplierMasterInfo = null;
      // }
      final['replacementOrderLines'] = this.linesArray.filter(x => x.isChecked);
      if (final.replacementOrderLines && final.replacementOrderLines.length > 0) {
        const arr = final.replacementOrderLines;
        let proceed: Boolean = true;
        arr.forEach(element => {
          if (proceed) {
            let arr3 = [];
            if (element.inventoryHelpers && element.inventoryHelpers.length > 0) {
              arr3 = element.inventoryHelpers.map(x => x.pickedQuantity);
            }
            let sum: any = "0";
            if (element.locationAllocationType == 'Manual') {
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
              sum = element.replacementOrderQuantity;
              element.inventoryHelpers = null;
            }
            proceed = (DecimalUtils.equals(element.replacementOrderQuantity, sum)) ? true : false;

          }
        });
        if (proceed) {
          this.commonService.createReplacementOrder(final).subscribe(res => {
            if (res['status'] == 0 && res['data']['replacementOrderObj']) {
              this.toastr.success("Created Successfully");
              this.edit(res['data']['replacementOrderObj']);
              this.fetchReplacementOrders();
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
  read1(event, data1) {
    this.returnLocations.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.returnLocations.find(x => x.isEdit == true);
      if (currentItem && (currentItem.pickedQuantity == null)) {
        this.toastr.warning('Please enter Picked Quantity');
      }
      this.returnLocations.map(element => element.isEdit = false);
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
    if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
      this.selectedReturnRecords = this.selectedReturnRecords.filter(x => x._id != data1._id);
    }
    if (this.globalIndex != -1 || this.globalIndex == 0) {
      if (this.linesArray[this.globalIndex].inventoryHelpers && this.linesArray[this.globalIndex].inventoryHelpers.length > 0) {
        this.linesArray[this.globalIndex].inventoryHelpers = this.linesArray[this.globalIndex].inventoryHelpers.filter(x => x._id != data1._id);
      }
    }
    this.returnLocations.forEach(element => {
      if (element.pickedQuantity) {
        element.isChecked = true;
      }
    });
  }
  savequantity1(value, data, key) {
    const arr = (key == 'Receive') ? 'selectedReceiveRecords' : 'selectedReturnRecords';
    if (data.usableSpaceCheck != 'Yes') {
      data['pickedQuantity'] = value;
      data['isChecked'] = true;
      if (data.maxDimensionCheck == 'Yes' || data.weightCheck == 'Yes') {
        this.onDocumentSelect(true, data);
      }
    }
    else {
      if (DecimalUtils.greaterThanOrEqual(data.allowableQuantity, value)) {
        data['pickedQuantity'] = value;
        data['isChecked'] = true;
        if (!this[arr]) {
          this[arr] = [];
        }
        if (this[arr] && this[arr].length > 0) {
          const FI = this[arr].findIndex(x => x._id == data._id)
          if (FI != -1 && (!data.pickedQuantity || data.pickedQuantity == "0")) {
            this[arr] = this[arr].filter(x => x._id != x._id);
          }
          else {
            if (FI == -1) {
              if (data.pickedQuantity && data.pickedQuantity != "0") {
                this[arr].push(data);
              }
            }
            else {
              if (data.pickedQuantity && data.pickedQuantity != "0") {
                this[arr][FI].pickedQuantity = data.pickedQuantity;
              }
            }
          }
        }
        else {
          if (data.pickedQuantity && data.pickedQuantity != "0") {
            this[arr].push(data);
          }
        }
        if (data.maxDimensionCheck == 'Yes' || data.weightCheck == 'Yes') {
          this.onDocumentSelect(true, data);
        }
      }
      else {
        data.isEdit = false;
        data['pickedQuantity'] = '';
        data['isChecked'] = false;
        this.toastr.error('Required Quantity should be less than Quantity')
      }
    }
  }
  validateLocationDecimal(arr, i) {
    this[arr][i].pickedQuantity = DecimalUtils.enterLimitedDecimals(this[arr][i].pickedQuantity);
  }
  onDocumentSelect(event, form) {
    if (event && form.pickedQuantity) {
      const locName = form.locationName + ':' + form.allowableQuantity;
      const pID = this.linesArray[this.globalIndex].productMasterInfo.productMasterID;
      // (this.hidePanel || this.isAllocateObject) ? this.linesArray[this.globalIndex].productMasterInfo.productMasterID : this.receivingForm.controls.productMasterInfo.value.productMasterID;
      this.wmsService.fetchCheckRecieveLoc(form.locationName, locName, pID,
        form.pickedQuantity, this.formObj).subscribe(res => {
          if (res.status == '0' && res.data.locationValidations) {
            if (res.data.locationValidations.validMaxDimension && res.data.locationValidations.validWeight) {
              form.isChecked = event;
            }
            else {
              form.pickedQuantity = '';
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
        form['pickedQuantity'] = '';
      }
    }
  }
  saveLocations() {
    let count: any = 0;
    if (this.selectedReturnRecords && this.selectedReturnRecords.length > 0) {
      this.selectedReturnRecords.forEach(element => {
        count = DecimalUtils.add(count, element.pickedQuantity);
      });
    }
    else {
      this.returnLocations.forEach(element => {
        if (element.isChecked) {
          count = DecimalUtils.add(count, element.pickedQuantity);
        }
      });
    }
    let dummyCount = this.linesArray[this.globalIndex].replacementOrderQuantity;
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
        this.linesArray[this.globalIndex].inventoryHelpers = filteredReturnLocations;
      }
      this.finalReturnLocations = JSON.parse(JSON.stringify(this.selectedReturnRecords));
      this.selectedReturnRecords = [];
    }
    else {
      this.toastr.error("Selected Locations Quantity should be equal Return Quantity");
      this.finalReturnLocations = [];
    }
  }
  resetLocations(key) {
    this.returnLocations.forEach(x => {
      x['isEdit'] = false;
      x['isChecked'] = false;
      x['pickedQuantity'] = null;
    });
  }
  clear() {
    this.linesArray = [];
    this.rcForm.enable();
    this.createPickingPlanningForm();
  }
  edit(data) {
    this.globalIDs = data._id;
    if (this.permissionList.includes('Update')) {
      if (data.confirmed) {
        this.rcForm.disable();
      }
      else {
        this.rcForm.enable();
      }
      this.rcForm.patchValue(data);
      if (data.confirmed) {
        this.linesArray = data.replacementOrderLines;
        this.linesArray.forEach(el => {
          delete el.productImageResource;
          el['forBarcode'] = null;
          el['saveRecentReturn'] = false;
          el['savedReturnLocations'] = el.inventoryHelpers;
          el['isChecked'] = true;
          el['isEdit'] = false;
        })
      }
      else {
        this.fetchAllPickingDetails(data._id);
      }

    }
    else {
      this.toastr.error('user doesnt have permission');
    }
  }
  fetchReplacementOrders(page?) {
    const form = this.formObj;
    form['page'] = page ? page : this.pageForTableForHeader;
    form['pageSize'] = this.itemsPerPageForHeader;
    this.commonService.fetchAllReplacementStocks(form).subscribe(res => {
      if (res['status'] == 0 && res['data']['replacementOrderPaginationResponse'] && res['data']['replacementOrderPaginationResponse'].replacementOrders.length > 0) {
        this.totalItemsForHeader = res.data.replacementOrderPaginationResponse.totalElements;
        this.finalArray = res['data']['replacementOrderPaginationResponse'].replacementOrders;
      }
      else {
        this.totalItemsForHeader = null;
        this.finalArray = [];
      }
    })
  }
  delete(data: any) {
    if (this.permissionList.includes('Delete')) {
      if (!data.confirmed) {
        this.deleteInfo = { name: 'replacementOrder', id: data._id };
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
      this.fetchReplacementOrders();
    }
  }
  validate() {
    if (this.permissionList.includes('Update')) {
      const final = this.rcForm.value;
      final['replacementOrderLines'] = this.linesArray.filter(x => x.isChecked);
      if (final.replacementOrderLines && final.replacementOrderLines.length > 0) {
        const arr = final.replacementOrderLines;
        let proceed: Boolean = true;
        arr.forEach(element => {
          if (proceed) {
            let arr3 = [];
            if (element.inventoryHelpers && element.inventoryHelpers.length > 0) {
              arr3 = element.inventoryHelpers.map(x => x.pickedQuantity);
            }
            let sum: any = "0";
            if (element.locationAllocationType == 'Manual') {
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
              sum = element.replacementOrderQuantity;
              element.inventoryHelpers = null;
            }
            proceed = (DecimalUtils.equals(element.replacementOrderQuantity, sum)) ? true : false;

          }
        });

        if (proceed) {
          this.commonService.validateROrder(final).subscribe(res => {
            if (res['status'] == 0 && res['data'].inventoryValidationDetails) {
              const statusMsg = res['data'].inventoryValidationDetails;
              if (statusMsg['inventoryAvailability'] == 'Yes') {
                this.confirm(final);
              }
              else {
                this.toastr.error("No Inventory Available");
              }
            }
            else {
              this.toastr.error("No Inventory Available");
            }
          })
        }
        else {
          this.toastr.error("Enter Proper Details")
        }
      }
      else {
        this.toastr.error("User doesn't have permission");
      }
    }
  }
  confirm(final) {
    this.commonService.confirmReplacementOrder(final).subscribe(res => {
      if (res['status'] == 0 && res.data['replacementOrderObj']) {
        this.clear();
        this.toastr.success("Confirmed Successfully");
        this.fetchReplacementOrders();
      }
      else {
        this.toastr.error(res['statusMsg']);
      }
    })
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
        data.replacementOrderQuantity = data.replacementOrderQuantity ? (DecimalUtils.add(data.replacementOrderQuantity, 1)) : 1;
        this.savequantity(data.replacementOrderQuantity, data, 'replacementOrderQuantity', 'gotoGenerate')
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
