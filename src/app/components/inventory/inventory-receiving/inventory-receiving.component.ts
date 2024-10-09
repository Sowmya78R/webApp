import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ApexService } from '../../../shared/services/apex.service';
import { InternaltransfersService } from '../../../services/integration-services/internaltransfers.service';
import { ToastrService } from 'ngx-toastr';
import { WMSService } from '../../../services/integration-services/wms.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-inventory-receiving',
  templateUrl: './inventory-receiving.component.html'
})
export class InventoryReceivingComponent implements OnInit {
  inventoryReceivingForm: FormGroup;
  focusedElement: any;
  products: any = [];
  internalTransfers: any = [];
  productMasterInfo: any = {};
  supplierID: any = '';
  inventories: any = [];
  productIDNames: any = [];
  dataService: CompleterData;
  inventoryReq: any = {};
  inventoryKeys: any = ['#', 'Product ID/Name', 'Zone Name', 'Location Name', 'Quantity Inventory Unit', 'Available Quantity'];
  internalTransferKeys: any = ['#', 'Product ID/Name', 'Source Location',
    'Destination Location', 'Transfer Quantity', 'Reason', 'Start Date', 'End Date', 'Status'];
  inventoryReceivingKeys: any = ['#', 'Transaction No', 'Location ID/Name', 'Product ID/Name', 'Product Type', 'Product Class', 'Supplier ID/Name', 'MFG Date',
    'Expiry Date', 'Batch No', 'Quantity Inventory Unit', 'Reserved Quantity'];
  dtOptions: DataTables.Settings = {};
  dtTrigger: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  filteredInventoryByProduct: any = [];
  locationNames: CompleterData;
  productCategories: any[] = [];
  locations: any = [];
  inventoryReceivings: any = [];
  formObj = this.configService.getGlobalpayload();
  constructor(private apexService: ApexService, private configService: ConfigurationService,
    private toastr: ToastrService,
    private wmsService: WMSService,
    private customValidators: CustomValidators,
    private util: Util,
    private commonService: CommonService,
    private completerService: CompleterService,
    private internaltransfersService: InternaltransfersService) {
    this.apexService.getPanelIconsToggle();
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5
    };
    this.createInventoryReceivingForm();
    this.fetchAllProductCategories();
    this.fetchAllProducts();
    this.fetchAllLocations();
    this.fetchAllInventories();
  }
  onProductIDNameChange() {
    if (this.inventoryReceivingForm.value.productMasterInfo.productIDName && this.products.length > 0) {
      this.products.forEach(product => {
        if (product.productIDName === this.inventoryReceivingForm.value.productMasterInfo.productIDName) {
          this.inventoryReceivingForm.controls.productType.setValue(product.productType);
          this.inventoryReceivingForm.controls.productClass.setValue(product.productClass);
          this.inventoryReceivingForm.controls.productCategoryInfo['controls']['productCategoryName'].setValue(product.productCategoryInfo.productCategoryName);
        }
      });
      // this.filteredInventoryByProduct = [];
      // this.inventories.forEach(inventory => {
      //   if (inventory.productMasterInfo && inventory.productMasterInfo.productIDName === this.inventoryReceivingForm.value.productMasterInfo.productIDName) {
      //     this.filteredInventoryByProduct.push(inventory);
      //   }
      // });
    }
  }
  save() {
    this.inventoryReq = { ...this.inventoryReceivingForm.value };
    const specificFields = ['_id', 'productID', 'productName', 'productIDName'];
    this.inventoryReq.productMasterInfo = this.commonService.getFilteredData('productIDName', this.inventoryReceivingForm.value.productMasterInfo.productIDName, this.products, null, null, specificFields);
    this.inventoryReq.productMasterInfo = this.commonService.replaceName(this.inventoryReq.productMasterInfo, '_id', 'productMasterID');
    this.locations.forEach(location => {
      if (location.locationName === this.inventoryReq.locationInfo.locationName) {
        this.inventoryReq.wareHouseInfo = location.wareHouseInfo;
        this.inventoryReq.zoneInfo = location.zoneInfo;
        this.inventoryReq.rackInfo = location.rackInfo;
        this.inventoryReq.levelInfo = location.levelInfo;
        this.inventoryReq.columnInfo = location.columnInfo;
        this.inventoryReq.locationInfo = { locationID: location._id, locationName: location.locationName }
      }
    });
    this.products.forEach(product => {
      if (this.inventoryReq.productMasterInfo.productIDName === product.productIDName) {
        this.inventoryReq.inventoryUnit = product.inventoryUnit;
        this.inventoryReq.storageUnit = product.storageUnit;
      }
    });
    this.saveOrUpdateInventory();
  }
  clear() {
    this.inventoryReceivingForm.reset();
  }
  saveOrUpdateInventory() {
    if (this.inventoryReq) {
      this.wmsService.saveOrUpdateInventoryRecieving(JSON.stringify(this.inventoryReq)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.inventory) {
            this.toastr.success('Updated inventory successfully');
            this.inventoryReceivingForm.reset();
            // this.fetchAllInventories();
          } else if (response && response.status === 2) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in saving details');
          }
        },
        (error) => {
          this.toastr.error('Failed in saving details');
        });
    }
  }
  fetchAllLocations() {
    this.wmsService.fetchAvailableLocations(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locations = response.data.locations;
          this.locationNames = response.data.locations.map(x => x.locationName);
          // this.locationNames = this.completerService.local(response.data.locations.filter(loc => loc.locationAvailability === true), 'locationName', 'locationName');
        }
      });
  }
  fetchAllInventories() {
    this.wmsService.findAllInventories(this.supplierID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventories) {
          this.inventories = response.data.inventories;
          this.filteredInventoryByProduct = response.data.inventories;
          // const locationNames = [];
          // this.inventories.forEach(item => {
          //   for (const subkey in item) {
          //     if (subkey === 'locationInfo' && locationNames.indexOf(item[subkey]['locationName']) === -1) {
          //       locationNames.push(item[subkey]['locationName']);
          //     }
          //   }
          // });
          // this.locationNames = this.completerService.local(locationNames);
        } else {
          this.inventories = [];
        }
      },
      (error) => {
        this.inventories = [];
      });
  }
  fetchAllInventoryReceivings() {
    this.wmsService.findAllInventoryReceivings().subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryReceives) {
          this.inventoryReceivings = response.data.inventoryReceives;
          this.rerender();
        }
      },
      (error) => {
        this.products = [];
      });
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters.length > 0) {
          this.products = response.data.productMasters;
          this.products.forEach(item => {
            for (const subkey in item) {
              if (subkey === 'productIDName' && this.productIDNames.indexOf(item[subkey]) === -1) {
                this.productIDNames.push(item[subkey]);
              }
            }
          });
          this.dataService = this.completerService.local(this.productIDNames);
        } else {
          this.dataService = this.completerService.local(this.productIDNames);
        }
      },
      (error) => {
        this.products = [];
      });
  }
  createInventoryReceivingForm() {
    this.inventoryReceivingForm = new FormBuilder().group({
      locationInfo: new FormBuilder().group({
        locationName: ['', this.customValidators.required],
      }),
      productMasterInfo: new FormBuilder().group({
        productIDName: ['', this.customValidators.required],
      }),
      productType: ['', this.customValidators.required],
      productClass: ['', this.customValidators.required],
      productCategoryInfo: new FormBuilder().group({
        productCategoryName: ['', this.customValidators.required],
      }),
      mfgDate: ['', this.customValidators.required],
      expiryDate: ['', this.customValidators.required],
      batchNumber: [''],
      quantityInventoryUnit: ['', this.customValidators.required],
      availableQuantity: [''],
      reservedQuantity: ['']
    });
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName, formName, parentName?) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else if (parentName) {
      return this.inventoryReceivingForm.controls[parentName]['controls'][fieldName].invalid && this.inventoryReceivingForm.controls[parentName]['controls'][fieldName].touched;
    } else {
      return this.util.shouldShowErrors(fieldName, formName);
    }
  }
  shouldShowSuccess(fieldName, parentName?) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else if (parentName) {
      return this.inventoryReceivingForm.controls[parentName]['controls'][fieldName].valid && this.inventoryReceivingForm.controls[parentName]['controls'][fieldName].touched;
    }
    else {
      return this.inventoryReceivingForm.controls[fieldName].valid && this.inventoryReceivingForm.controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.productCategories = response.data.productCategories;
        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
}
