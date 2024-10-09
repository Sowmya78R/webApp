import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ApexService } from '../../../shared/services/apex.service';
import { InternaltransfersService } from '../../../services/integration-services/internaltransfers.service';
import { ToastrService } from 'ngx-toastr';
import { WMSService } from '../../../services/integration-services/wms.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { Constants } from '../../../constants/constants';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from 'src/app/shared/utils/storage';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { PaginationConstants, inventoryAdjustmentHead } from 'src/app/constants/paginationConstants';
import { DatePipe } from '@angular/common';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-inventory-adjustments',
  templateUrl: './inventory-adjustments.component.html'
})
export class InventoryAdjustmentsComponent implements OnInit, OnDestroy {
  inventoryAdjustmentsKeys: any = ['S.No','Image', 'Status', 'Transaction ID', 'Location Name','Product ID','Product Name',
  'Product Description','UOM','BrandName','Product Purchase Price','Received Quantity/Quantity Inventory Unit',
  'Available Quantity','Reserved Quantity','Adjusted Quantity','Reason']
  inventories: any = [];
  supplierID: any = '';
  inventoryAdjustmentForm: FormGroup;
  focusedElement: any;
  products: any = [];
  productIDNames: CompleterData;
  dataService: CompleterData;
  inventoryAdjustments: any = [];
  productMasterInfo: any = {};
  productCategories: any[] = [];
  id: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  inventoryKeys: any = ['', '', '', '', '', '', '', ''];

  locationsByInventories: any = [];
  productTypes: any = Constants.PRODUCT_TYPES;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  filteredInventoryListByProduct: any = [];
  isReadMode: any = false;
  inventoryReceivingForm: FormGroup;
  inventoryReq: any = {};
  locationNames: CompleterData;
  locations: any = [];
  supplierList: any = [];
  supplierIDNames: any[] = [];
  supplierService: CompleterData;
  serialNumberCheck = 'No';
  sNumber: any = null;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inventory', 'Inventory Adjustments', Storage.getSessionUser());
  permissionToggle: any = false;
  forPermissionsSubscription: any;
  productLogo: any;
  showImage: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  productsofSupplier: any = [];
  priceToggle: any = true;
  currencies: any = [];
  brandNames: any = [];
  statusObj = { 'status': null, 'statusSequence': null };
  // totalStatusCount: any = null;
  isVisible: boolean = true
  page: number = 1;
  secondPage:number = 1;
  itemsPerPage = 5;
  totalItems: any;
  totalItemsList:any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  showTooltip: any = false;
  tableHeadings: any = ['Sr.No', 'Product ID', 'Zone Name', 'Location Name', 'Quantity Inventory Unit',
   'Available Quantity', 'Reserved Quantity','Batch Number','Manufactured Date','Created Date','Expiry Date','Serial Number','Action']
  shelfLife: any = null;
  lastApprovalStatusName: any = null;
  statusDropdown: any = ['Created', 'Completed'];
  statuses: any = ['Created', 'Completed'];

  constructor(private apexService: ApexService, private configService: ConfigurationService,
    private toastr: ToastrService, private metaDataService: MetaDataService,
    private wmsService: WMSService, private datePipe: DatePipe,
    private customValidators: CustomValidators,
    private util: Util,
    private commonService: CommonService,
    private completerService: CompleterService,
    private internaltransfersService: InternaltransfersService,
    public ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    this.createInventoryAdjustmentsForm();
    this.apexService.getPanelIconsToggle();
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
    this.getFunctionsCall();
  }
  myObj={
    status:"All"
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.getPermissions();
      this.createInventoryReceivingForm();
      this.fetchAllInventories();
      this.fetchAllCurrencies();
      this.fetchAllLocations();
      this.fetchAllProducts();
      this.fetchAllInventoryAdjustments(this.second,this.itemsPerPage);
      this.fetchAllProductCategories();
      this.fetchAllSupplierDetails();
    }
  }
  getPermissions() {
    // findInventoryConfigPermissions
    this.configService.getAllInventoryConfiguration(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['processConfigurations'] && res['data']['processConfigurations'].length > 0) {
        if (res['data']['processConfigurations'].find(x => x.name == 'Inventory Adjustments')) {
          const havePermission = res['data']['processConfigurations'].find(x => x.name == 'Inventory Adjustments');
          if (havePermission && havePermission.processStatusPolicies && havePermission.processStatusPolicies.length > 0) {
            // this.totalStatusCount = havePermission.processStatusPolicies.length + 1;
            const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).authorities[0].authority;
            const loginUser = JSON.parse(sessionStorage.getItem('dli-wms-user')).username;
            this.lastApprovalStatusName = havePermission.processStatusPolicies.find(x => x.statusSequence == (Math.max(...havePermission.processStatusPolicies.map(o => o.statusSequence)))).status
            havePermission.processStatusPolicies.forEach(outer => {
              const rolesStatusIndex = outer.statusRoleConfigurations.findIndex(x => x.role.roleName == loginUserRole);
              if (rolesStatusIndex != -1 && !this.permissionToggle) {
                const listOfUsers = outer.statusRoleConfigurations[rolesStatusIndex].userInfos.map(x => x.email);
                this.permissionToggle = (listOfUsers.includes(loginUser)) ? true : false;
                if (this.permissionToggle) {
                  this.statusObj = { 'status': outer.status, 'statusSequence': outer.statusSequence }
                }
              }
              else {
                this.permissionToggle = this.permissionToggle ? this.permissionToggle : false;
              }
            });
          }
          else {
            this.permissionToggle = false;
            // this.totalStatusCount = 1;
          }
        }
        else {
          this.permissionToggle = false;
          // this.totalStatusCount = 1;
        }
      }
      else {
        this.permissionToggle = false;
        // this.totalStatusCount = 1;
      }
    })

    this.metaDataService.getImageConfigbyName(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Inventory Adjustments') ? true : false;
      }
    })
  }
  getSerialNumbers() {
    this.inventoryReceivingForm.controls.serialNumbers.patchValue(this.sNumber.split(','));
  }
  createInventoryReceivingForm() {
    this.inventoryReceivingForm = new FormBuilder().group({
      locationInfo: new FormBuilder().group({
        locationName: ['', this.customValidators.required],
      }),
      productMasterInfo: new FormBuilder().group({
        productIDName: ['', this.customValidators.required],
      }),
      productType: null,
      productClass: null,
      productImage: null,
      productCategoryInfo: new FormBuilder().group({
        "productCategoryID": null,
        "productCategory": null,
        productCategoryName: ['', this.customValidators.required],
      }),
      supplierMasterInfo: new FormBuilder().group({
        supplierID: [''],
        supplierIDName: ['', this.customValidators.required],
        supplierMasterID: [''],
        supplierName: [''],
      }),
      mfgDate: [''],
      expiryDate: [''],
      batchNumber: [''],
      brandName: null,
      productDescription: null,
      storageInstruction: null,
      serialNumbers: [],
      receiveQuantity: ['', this.customValidators.required],
      reservedQuantity: [''],
      productPurchasePrice: null,
      currency: null,
      packingRemarks: null
    });
  }
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierList = response.data.supplierMasters;
          this.supplierList.forEach(item => {
            for (const subkey in item) {
              if (subkey === 'supplierIDName') {
                this.supplierIDNames.push(item[subkey]);
              }
            }
          });
          this.supplierService = this.completerService.local(this.supplierIDNames);
          this.onSupplierIDNameChange();
        } else {
          this.supplierService = this.completerService.local(this.supplierIDNames);
        }
      },
      (error) => {
        this.supplierList = [];
      });
  }
  onSupplierIDNameChange() {
    const sup = this.inventoryReceivingForm.controls.supplierMasterInfo.value;
    if (sup && sup.supplierIDName && sup.supplierIDName !== null) {
      this.supplierList.forEach((supplier) => {
        if (supplier.supplierIDName === sup.supplierIDName) {
          this.inventoryReceivingForm.controls.supplierMasterInfo.patchValue(supplier);
          this.inventoryReceivingForm.controls.supplierMasterInfo['controls'].supplierMasterID.setValue(supplier._id);
        }
      });
      this.fetchAllProductsBySupplier();
    }
  }
  validateDecimal(key, form) {
    this[form].controls[key].setValue(DecimalUtils.enterLimitedDecimals(this[form].controls[key].value,10));
  }
  selectFinal() {
   // this.rerender();
   this.fetchAllInventoryAdjustments(this.second,this.itemsPerPage);
  }
  statusSave(inventoryAdjustment, event) {
    if (this.permissionsList.includes('Update')) {
      // inventoryAdjustment.status = event.target.value;
      if (event) {
        inventoryAdjustment.statusStage = {
          status: event.target.value,
          statusSequence: this.statusObj.statusSequence + 1
        }
      }
      else {
        inventoryAdjustment.statusStage = {
          status: 'Completed',
          // statusSequence: this.totalStatusCount + 1
          statusSequence: (inventoryAdjustment.statusStages[inventoryAdjustment.statusStages.length - 1].statusSequence) + 1

        }
      }
      delete inventoryAdjustment.dummyStage;
      delete inventoryAdjustment.isViewToggle;
      delete inventoryAdjustment.showComplete;
      delete inventoryAdjustment.isCompleteorReject;
      this.internaltransfersService.saveOrUpdateInventoryAdjustment(JSON.stringify(inventoryAdjustment)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.inventoryAdjustment) {
            this.toastr.success("Saved Successfully");
            this.fetchAllInventoryAdjustments(this.second,this.itemsPerPage);
            this.fetchAllInventories();
           // this.rerender();
          }
          else {
            this.toastr.error(response.statusMsg);
            const value = (event.target.value == 'Approved' || event.target.value == 'Rejected') ? 'Created' : 'Approved';
            event.target.value = value;
          }
        })
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
      event.target.value = inventoryAdjustment.status;
    }
  }
  hello() {
    this.isVisible = false
  }
  save() {
    if (this.permissionsList.includes('Update')) {
      const formDetails = this.inventoryAdjustmentForm.value;
      if (this.serialNumberCheck == 'Yes' && formDetails.adjustedQuantity > 1) {
        this.toastr.error('Adjusted Quantity should be less than or equal to 1')
      }
      else {
        this.saveContinution();
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  saveContinution() {
    this.inventoryAdjustmentForm.controls.adjustmentType.setValue('INVENTORY ADJUSTMENT');
    const inventoryAdjustmentData = this.inventoryAdjustmentForm.value;
    if (inventoryAdjustmentData.adjustedQuantity !== inventoryAdjustmentData.availableQuantity) {
      const specificFields = ['_id', 'productID', 'productName', 'productIDName'];
      inventoryAdjustmentData.productMasterInfo = this.commonService.getFilteredData('productIDName',
        this.inventoryAdjustmentForm.value.productMasterInfo.productIDName, this.products, null, null, specificFields);
      inventoryAdjustmentData.productMasterInfo = this.commonService.replaceName(inventoryAdjustmentData.productMasterInfo,
        '_id', 'productMasterID');
      inventoryAdjustmentData.locationInfo =
        this.commonService.getFilteredData('locationName', inventoryAdjustmentData.locationInfo.locationName,
          this.inventories, 'locationInfo');
      // inventoryAdjustmentData.productCategoryInfo =
      //   this.commonService.getFilteredData('productCategoryName', inventoryAdjustmentData.productCategoryInfo.productCategoryName,
      //     this.products, 'productCategoryInfo');
      // inventoryAdjustmentData.status = 'Open';
      inventoryAdjustmentData.wareHouseInfo = this.configService.getWarehouse();
      inventoryAdjustmentData.organizationInfo = this.configService.getOrganization();
      if (this.id) {
        inventoryAdjustmentData._id = this.id;
        // inventoryAdjustmentData.status = 'Closed';
      }
      this.internaltransfersService.saveOrUpdateInventoryAdjustment(JSON.stringify(inventoryAdjustmentData)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.inventoryAdjustment) {
           // this.rerender();
           this.fetchAllInventoryAdjustments(this.second,this.itemsPerPage);
            this.fetchAllInventories();
            this.inventoryAdjustmentForm.reset();
            this.priceToggle = true;
            if (this.showImage) {
              const element = <HTMLImageElement>(document.getElementById('pLogo'));
              element.src = null;
            }
            this.inventoryAdjustmentForm.controls.adjustmentType.setValue('INVENTORY ADJUSTMENT');
            this.id = '';
            this.isReadMode = false;
            this.toastr.success('Saved Successfully');
          } else if (response && response.status === 2) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in adjusting');
          }
        },
        (error) => {
          this.toastr.error('Failed in saving details');
        }
      );
    } else {
      this.toastr.error('Adjusted quantity and available quantity can\'t be same');
    }
  }
  changeUpToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  changeDownToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  clear() {
    this.inventoryAdjustmentForm.reset();
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    this.inventoryAdjustmentForm.controls.adjustmentType.setValue('INVENTORY ADJUSTMENT');
  }
  edit(data) {
    this.id = data._id;
    this.inventoryAdjustmentForm.patchValue(data);
    this.isReadMode = true;
    this.inventoryAdjustmentForm.controls.productType.disable();
    this.inventoryAdjustmentForm.controls.productClass.disable();
    this.inventoryAdjustmentForm.controls.productType.disable();
    // this.inventoryAdjustmentForm.controls.productCategoryInfo['controls'].productCategoryName.disable();
    window.scroll(0, 0);
  }
  onProductIDSelect(event) {
    this.productLogo = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('prdLogo'));
      element.src = null;
    }
    if (event && this.inventoryReceivingForm.value.productMasterInfo.productIDName && this.products.length > 0) {
      const product = this.products.find(x => x.productIDName === this.inventoryReceivingForm.value.productMasterInfo.productIDName);
      if (product) {
        this.inventoryReceivingForm.controls.productType.setValue(product.productType);
        this.inventoryReceivingForm.controls.productClass.setValue(product.productClass);
        this.inventoryReceivingForm.controls.productImage.setValue(product.productImage);
        this.shelfLife = product ? product.shelfLife : null;
        this.inventoryReceivingForm.controls.productCategoryInfo.patchValue(product.productCategoryInfo);
        if (product.productImage && this.showImage) {
          const fileNames = JSON.parse(JSON.stringify(product.productImage));
          this.metaDataService.viewImages(fileNames).subscribe(data => {
            if (data['status'] == 0) {
              let productLogo: any = 'data:text/plain;base64,' + data['data']['resource'];
              productLogo = this.metaDataService.dataURLtoFile(productLogo, fileNames);
              this.metaDataService.imgGlobalChanged(productLogo, 'prdLogo', true);
            }
          });
        }
        const filteredSupplierProduct = this.productsofSupplier.find(x => x.productIDName === this.inventoryReceivingForm.value.productMasterInfo.productIDName);
        this.inventoryReceivingForm.controls.productPurchasePrice.setValue(filteredSupplierProduct.price);
        this.inventoryReceivingForm.controls.currency.setValue(filteredSupplierProduct.currency);
        this.serialNumberCheck = product.serialNumberCheck ? product.serialNumberCheck : 'No';
        this.brandNames = filteredSupplierProduct ? filteredSupplierProduct.brandNames : [];
        this.inventoryReceivingForm.controls.productDescription.setValue(filteredSupplierProduct.productDescription);
        this.inventoryReceivingForm.controls.storageInstruction.setValue(filteredSupplierProduct.storageInstruction);

      }
      else {
        this.shelfLife = null;
      }
    }
    else {
      this.serialNumberCheck = 'No';
    }
  }
  getExpiryDate(event) {
    if (event && this.shelfLife) {
      let result = new Date(event);
      result.setDate(result.getDate() + this.shelfLife);
      this.inventoryReceivingForm.controls.expiryDate.setValue(this.datePipe.transform(new Date(result), 'yyyy-MM-dd'));
    }
    else {
      this.inventoryReceivingForm.controls.expiryDate.setValue(null);
    }
  }
  inventoryByLocationName(event) {
    this.filteredInventoryListByProduct = [];
    if (event) {
      this.filteredInventoryListByProduct = this.inventories.filter(x => x.locationInfo.locationName == event.originalObject);
    }
    else {
      this.filteredInventoryListByProduct = this.inventories;
    }
  }
  onLocationNameChange(locName?) {
    if (locName.inventoryAvailability) {
      this.productLogo = null;
      if (this.showImage) {
        const element = <HTMLImageElement>(document.getElementById('pLogo'));
        element.src = null;
      }
      if (this.permissionsList.includes('Update')) {
        const locationName = locName ? locName.locationInfo.locationName : this.inventoryAdjustmentForm.value.locationInfo.locationName;
        const inventoryInfoDetails = { "_id": locName._id };
        this.inventoryAdjustmentForm.patchValue({
          locationInfo: locName.locationInfo,
          inventoryInfo: inventoryInfoDetails,
          productMasterInfo: locName.productMasterInfo,
          productImage: locName.productImage,
          quantityInventoryUnit: locName.quantityInventoryUnit,
          inventoryUnit: locName.inventoryUnit,
          availableQuantity: locName.availableQuantity,
          reservedQuantity: locName.reservedQuantity,
          productType: locName.productType,
          productClass: locName.productClass,
          productCategoryInfo: locName.productCategoryInfo,
          productPurchasePrice: locName.productPurchasePrice,
          currency: locName.currency,
          brandName: locName.brandName,
          packingRemarks: locName.packingRemarks,
          productDescription: locName.productDescription,
          storageInstruction: locName.storageInstruction,
        });
        if (locName.productImage && this.showImage) {
          const fileNames = JSON.parse(JSON.stringify(locName.productImage));
          this.metaDataService.viewImages(fileNames).subscribe(data => {
            if (data['status'] == 0) {
              this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
              this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
              this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
            }
          });
        }
        if (locationName) {
          this.isReadMode = true;
          this.inventoryAdjustmentForm.controls.productType.disable();
          this.inventoryAdjustmentForm.controls.productClass.disable();
        }
      }
      else {
        this.toastr.error("User doesn't have Permissions.");
      }
    }
    else {
      this.toastr.error("It is Blocked.");
    }
  }
  openCreateModal() {
    if (this.permissionsList.includes('Update')) {
      this.ngxSmartModalService.getModal('openModal').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
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
  fetchAllLocations() {
    this.wmsService.fetchAvailableLocations(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locations = response.data.locations;
          this.locationNames = response.data.locations.map(x => x.locationName);
        }
      });
  }
  fetchAllDfirst(first, event) {
    if (first) {
      this.fetchAllInventories(first, event.target.value);
    }
  }
  fetchAllDsecond(second, event) {
    if (second){
      this.fetchAllInventoryAdjustments(second, event.target.value);
    }
  }
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = inventoryAdjustmentHead['internalInventoryArrays'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.fetchAllInventories(this.first, this.itemsPerPage);
  }
  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = inventoryAdjustmentHead['inventoryAdjustmentArrays'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.fetchAllInventoryAdjustments(this.second,this.newItemsPerPage)
  }
  first:number = 1
  fetchAllInventories(first?,pageSize?) {
    const form = {
      "page": first ? first : 1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": PaginationConstants.inventory,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName 
    }
    this.wmsService.findAllInventoriesWithPaginations(this.supplierID, form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryPaginationResponse.inventories) {
          this.inventories = response.data.inventoryPaginationResponse.inventories;
          this.filteredInventoryListByProduct = response.data.inventoryPaginationResponse.inventories;
          this.totalItemsList = response.data.inventoryPaginationResponse.totalElements;
          this.locationsByInventories = this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.inventoryPaginationResponse.inventories, 'locationInfo', 'locationName');
          this.dataService = this.completerService.local(this.locationsByInventories);
        } else {
          this.inventories = [];
        }
      },
      (error) => {
        this.inventories = [];
      });
  }
  newItemsPerPage:number = 10;
  second:number = 1;
  getStatus: any;
  fetchAllInventoryAdjustments(second?,pageSize?) {
    console.log(second);
    const form = {
      "page": second ? second : 1,
      "pageSize": this.newItemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": PaginationConstants.inventoryAdjustmentSearchOnKeysWithPagination,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "status":this.myObj.status === 'All' ? null : this.myObj.status
    }
    console.log(form);
    this.internaltransfersService.fetchAllInventoryAdjustmentsWithPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryAdjustmentPaginationResponse.inventoryAdjustments) {
          this.inventoryAdjustments = response.data.inventoryAdjustmentPaginationResponse.inventoryAdjustments;
          this.totalItems = response.data.inventoryAdjustmentPaginationResponse.totalElements;
          this.inventoryAdjustments.forEach(element => {
            element.dummyStage = null;
            element['isViewToggle'] = false;
            if(element.statusStages){
              const stats = element.statusStages.map(x => x.status);
              element['showComplete'] = false;
              if ((this.lastApprovalStatusName && stats.includes(this.lastApprovalStatusName)) || !this.lastApprovalStatusName) {
                element['showComplete'] = true;
              }
              if (stats.includes('System Completed')) {
                element['showComplete'] = false;
              }
              element['isCompleteorReject'] = false;
              if (stats.includes('Completed') || stats.includes('Rejected') || stats.includes('System Completed')) {
                element['isCompleteorReject'] = true;
              }
            }           
          });
          this.dtTrigger.next();
        } else {
          this.inventoryAdjustments = [];
        }
      },
      (error) => {
        this.inventoryAdjustments = [];
      });
  }
  clearCreateForm() {
    this.inventoryReceivingForm.reset();
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('prdLogo'));
      element.src = null;
    }
  }
  saveReceive() {
    this.inventoryReq = { ...this.inventoryReceivingForm.value };
    const specificFields = ['_id', 'productID', 'productName', 'productIDName'];
    this.inventoryReq.productMasterInfo = this.commonService.getFilteredData('productIDName', this.inventoryReceivingForm.value.productMasterInfo.productIDName, this.products, null, null, specificFields);
    this.inventoryReq.productMasterInfo = this.commonService.replaceName(this.inventoryReq.productMasterInfo, '_id', 'productMasterID');
    if (this.inventoryReq.brandName == "null") {
      this.inventoryReq.brandName = null;
    }
    this.locations.forEach(location => {
      if (location.locationName === this.inventoryReq.locationInfo.locationName) {
        this.inventoryReq.organizationInfo = location.organizationInfo;
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
    if (this.serialNumberCheck == 'Yes' && this.inventoryReq.receiveQuantity != 0) {
      if (this.inventoryReq.serialNumbers && this.inventoryReq.serialNumbers.length != 0) {
        if (this.inventoryReq.receiveQuantity == this.inventoryReq.serialNumbers.length) {
          this.saveOrUpdateInventory();
        }
        else {
          this.toastr.error('Enter All Serial Numbers');
        }
      }
      else {
        this.toastr.error('Enter Serial Numbers');
      }
    }
    else {
      this.saveOrUpdateInventory();
    }

  }
  saveOrUpdateInventory() {
    console.log(this.inventoryReq);
    if (this.inventoryReq) {
      this.wmsService.saveOrUpdateInventoryRecieving(JSON.stringify(this.inventoryReq)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.inventoryReceive) {
            this.clearCreateForm();
            this.ngxSmartModalService.getModal('openModal').close();
            this.toastr.success('Saved Successfully');
            this.sNumber = null;
            this.fetchAllInventoryAdjustments(this.second,this.itemsPerPage);
            this.fetchAllInventories();
          //  this.rerender();
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
  fetchAllProductsBySupplier() {
    this.wmsService.fetchProductsBySupplier(this.inventoryReceivingForm.value.supplierMasterInfo.supplierIDName, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productBySupplier &&
          response.data.productBySupplier.productMasterInfos) {
          this.productsofSupplier = response.data.productBySupplier.productMasterInfos;
          this.productIDNames = this.productsofSupplier.map(x => x.productIDName);
        } else {
          this.productsofSupplier = [];
          this.productIDNames = this.productsofSupplier;
        }
      },
      (error) => {
        this.productsofSupplier = [];
        this.productIDNames = this.productsofSupplier;
      });
  }
  fetchAllProducts() {
    this.products = this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters.length > 0) {
          this.products = response.data.productMasters;
          this.productIDNames = response.data.productMasters.map(x => x.productIDName);
          // this.products.forEach(item => {
          //   for (const subkey in item) {
          //     if (subkey === 'productIDName') {
          //       this.productIDNames.push(item[subkey]);
          //     }
          //   }
          // });
          // this.dataService = this.completerService.local(this.productIDNames);
        } else {
          // this.dataService = this.completerService.local(this.productIDNames);
        }
      },
      (error) => {
        this.products = [];
      });
  }
  createInventoryAdjustmentsForm() {
    this.inventoryAdjustmentForm = new FormBuilder().group({
      productMasterInfo: new FormBuilder().group({
        productIDName: [null, this.customValidators.required],
        productID: [null],
        productName: [null]
      }),
      productType: [null, this.customValidators.required],
      productClass: ['', this.customValidators.required],
      productImage: [''],
      productDescription: null,
      storageInstruction: null,
      productCategoryInfo: new FormBuilder().group({
        productCategoryName: [null, this.customValidators.required],
        productCategory: [null],
        productCategoryID: [null]
      }),
      locationInfo: new FormBuilder().group({
        locationName: [null, this.customValidators.required],
      }),
      inventoryInfo: new FormBuilder().group({
        _id: [null],
      }),
      adjustmentType: ['INVENTORY ADJUSTMENT', this.customValidators.required],
      adjustedQuantity: null,
      quantityInventoryUnit: [''],
      brandName: null,
      inventoryUnit: null,
      availableQuantity: [''],
      reservedQuantity: [''],
      "inventoryReceiveInfo": null,
      "serialNumber": null,
      // approvedBy: null,
      // approvedDate: null,
      // rejectedBy: null,
      // rejectedDate: null,
      // completedBy: null,
      // completedDate: null,
      productPurchasePrice: null,
      currency: null,
      reason: ['', this.customValidators.required],
      "addition": null,
      "reduction": null,
      packingRemarks: null,
    });
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  calculateAdjustedQty(formValue, value) {
    if (value) {
      const qty = this.inventoryAdjustmentForm.controls.quantityInventoryUnit.value
      if (formValue == 'addition') {
        if (DecimalUtils.greaterThan(value, 0)) {
          this.inventoryAdjustmentForm.controls.reduction.setValue(null);
          this.inventoryAdjustmentForm.controls.adjustedQuantity.setValue(DecimalUtils.add(qty, value));
          this.getValue(this.inventoryAdjustmentForm.controls.adjustedQuantity.value);
          this.getPriceToggle();
        } else {
          this.inventoryAdjustmentForm.controls.addition.setValue(null)
        }
      }
      else {
        if (DecimalUtils.lessThanOrEqual(value, qty)) {
          if (DecimalUtils.greaterThan(value, 0)) {
            this.inventoryAdjustmentForm.controls.addition.setValue(null);
            this.inventoryAdjustmentForm.controls.adjustedQuantity.setValue(DecimalUtils.subtract(qty, value));
            this.getValue(this.inventoryAdjustmentForm.controls.adjustedQuantity.value);
            this.getPriceToggle();
          } else {
            this.inventoryAdjustmentForm.controls.reduction.setValue(null)
          }
        }
        else {
          this.toastr.error("Reduced Quantity Should be less than Quantity Inventory Unit");
          this.inventoryAdjustmentForm.controls.reduction.setValue(null);
        }
      }
    }
  }
  getValue(value) {
    // var pattern = /[ `!@#$%^&*()_+\=\[\]{};':"\\|<>\/?~-A-Za-z]/;
    // var pattern = /^[A-Za-z `!@#$%^&*()_+\=\[\]{};':"\\|<>\/?]+$/;
    // if (value && pattern.test(value)) {
    //   this.inventoryAdjustmentForm.controls.adjustedQuantity.setValue(null);
    // }
    // else {
    const qty = this.inventoryAdjustmentForm.controls.availableQuantity.value;
    if (value && DecimalUtils.equals(qty, value)) {
      this.inventoryAdjustmentForm.controls.adjustedQuantity.setValue(null);
      this.toastr.error("Same Quanitity can't be Adjusted.");
    }
    // }
  }
  getPriceToggle() {
    let a = this.inventoryAdjustmentForm.controls.adjustedQuantity.value;
    let b = this.inventoryAdjustmentForm.controls.quantityInventoryUnit.value;
    if (a && b) {
      this.priceToggle = (DecimalUtils.greaterThan(a, b)) ? false : true;
    }
  }
  fetchAllCurrencies() {
    this.metaDataService.fetchAllCurrencies(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.currencies && response.data.currencies.length) {
          this.currencies = response.data.currencies;
        }
        else {
          this.currencies = [];
        }
      },
      error => {
        this.currencies = [];
      }
    )
  }

  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  // shouldShowErrors(fieldName, formName) {
  //   if (this.focusedElement && this.focusedElement === fieldName) {
  //     return false;
  //   } else {
  //     return this.util.shouldShowErrors(fieldName, formName);
  //   }
  // }
  shouldShowErrors(fieldName, form, formName?, parentName?) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else if (parentName) {
      return this[formName].controls[parentName]['controls'][fieldName].invalid && this[formName].controls[parentName]['controls'][fieldName].touched;
    } else {
      return this.util.shouldShowErrors(fieldName, form);
    }
  }
  // shouldShowSuccess(fieldName) {
  //   if (this.focusedElement && this.focusedElement === fieldName) {
  //     return false;
  //   } else {
  //     return this.inventoryAdjustmentForm.controls[fieldName].valid && this.inventoryAdjustmentForm.controls[fieldName].touched;
  //   }
  // }
  shouldShowSuccess(fieldName, formName, parentName?) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else if (parentName) {
      return this[formName].controls[parentName]['controls'][fieldName].valid && this[formName].controls[parentName]['controls'][fieldName].touched;
    }
    else {
      return this[formName].controls[fieldName].valid && this[formName].controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

}
