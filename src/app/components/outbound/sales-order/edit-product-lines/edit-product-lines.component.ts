import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Util } from 'src/app/shared/utils/util';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { Constants } from 'src/app/constants/constants';
import { CreateSalesOrderService } from 'src/app/services/createSalesOrder.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-soedit-product-lines',
  templateUrl: './edit-product-lines.component.html'
})
export class SOEditProductLinesComponent implements OnInit, OnDestroy {
  editProductLinesForm: FormGroup;
  editProductLinesData: any = {};
  productCategories: any[] = [];
  productDetails: any;
  isReadMode: any = false;
  isEditProduct: any = false;
  finalProductMaster: any = {};
  focusedElement: any;
  productTypes: any = Constants.PRODUCT_TYPES;
  units: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  statusCheck: boolean = false;
  constructor(private toastr: ToastrService, private configService: ConfigurationService,
    private wmsService: WMSService, private outboundProcessService: OutboundProcessService,
    private customValidators: CustomValidators,
    private util: Util,
    private metaDataService: MetaDataService,
    private appService: AppService,
    private createSalesOrderService: CreateSalesOrderService,
    private translate: TranslateService) {
    this.translate.use(this.language);
    this.createProductLinesForm();
  }

  ngOnInit() {
    if (this.appService.getParam('id')) {
      const form = {
        'organizationIDName': this.formObj.organizationIDName,
        'wareHouseIDName': this.formObj.wareHouseIDName,
        "page": 1,
        "pageSize": 5,
        "sortDirection": null,
        "sortFields": null,
        "searchOnKeys": null,
        "searchKeyword": null,
        _id: this.appService.getParam('id')
      }
      this.outboundProcessService.fetchSalesOrderByID(form).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.salesOrderPaginationResponse.salesOrder) {
            this.statusCheck = response.data.salesOrderPaginationResponse.salesOrder.raiseSOStatus;
            if (this.statusCheck) {
              this.editProductLinesForm.disable();
            }
          }
        })
    }
    this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
      }
    })
    if (this.permissionsList.includes('View')) {
      this.fetchAllProductCategories();
      this.createSalesOrderService.productIDChange.subscribe(data => {
        this.productDetails = data;
        this.fetchProductDetailsByID();
        this.findAllUnits();
      });
      this.createSalesOrderService.clearProductCall.subscribe(data => {
        this.editProductLinesForm.reset();
        this.isReadMode = false;
        this.editProductLinesForm.controls['productCategoryInfo']['controls'].productCategoryName.enable();
        this.editProductLinesForm.controls.productType.enable();
        this.editProductLinesForm.controls.inventoryUnit.enable();
        this.editProductLinesForm.controls.receivingUnit.enable();
        this.editProductLinesForm.controls.pickingUnit.enable();
        this.editProductLinesForm.controls.shipmentUnit.enable();
      });
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  ngOnDestroy(): void {
    this.forPermissionsSubscription.unsubscribe();
  }
  fetchProductDetailsByID() {
    this.wmsService.fetchProductDetailsById(this.productDetails.productMasterID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMaster) {
          this.editProductLinesForm.patchValue(response.data.productMaster);
          this.editProductLinesData = response.data.productMaster;
          this.isReadMode = true;
          this.isEditProduct = false;
          this.editProductLinesForm.controls['productCategoryInfo']['controls'].productCategoryName.disable();
          this.editProductLinesForm.controls.productType.disable();
          this.editProductLinesForm.controls.inventoryUnit.disable();
          this.editProductLinesForm.controls.receivingUnit.disable();
          this.editProductLinesForm.controls.pickingUnit.disable();
          this.editProductLinesForm.controls.shipmentUnit.disable();
        } else {
          this.editProductLinesForm.patchValue({});
        }
      },
      (error) => {
        this.editProductLinesForm.patchValue({});
      });
  }
  update() {
    if (this.permissionsList.includes('Update')) {
      if (this.productDetails) {
        this.isReadMode = false;
        this.isEditProduct = true;
        this.editProductLinesForm.controls['productCategoryInfo']['controls'].productCategoryName.enable();
        this.editProductLinesForm.controls.productType.enable();
        this.editProductLinesForm.controls.inventoryUnit.enable();
        this.editProductLinesForm.controls.receivingUnit.enable();
        this.editProductLinesForm.controls.pickingUnit.enable();
        this.editProductLinesForm.controls.shipmentUnit.enable();
      } else {
        this.toastr.error('Select product');
      }
    }
  }
  redirectToProductMasterData() {
    if (this.permissionsList.includes('Update')) {
      if (this.productDetails && this.productDetails.productMasterID) {
        this.appService.navigate('/masterdata/product', { id: this.productDetails.productMasterID });
      } else {
        this.toastr.error('select supplier and product');
      }
    }
    else {
      this.toastr.error("user doesnt have permissions");
    }
  }
  save() {
    if (this.permissionsList.includes('Update')) {
      this.finalProductMaster = { ...this.editProductLinesData, ...this.editProductLinesForm.value };
      this.getProductCategory(this.editProductLinesForm.value.productCategoryInfo.productCategoryName);
      if (this.finalProductMaster) {
        delete this.finalProductMaster.supplierCode;
        this.wmsService.productMasterData(JSON.stringify(this.finalProductMaster)).subscribe((response) => {
          if (response && response.status === 0) {
            this.fetchProductDetailsByID();
            this.toastr.success('Details updated successfully');
            this.isEditProduct = false;
            this.isReadMode = true;
            this.editProductLinesForm.controls['productCategoryInfo']['controls'].productCategoryName.disable();
            this.editProductLinesForm.controls.productType.disable();
            this.editProductLinesForm.controls.inventoryUnit.disable();
            this.editProductLinesForm.controls.receivingUnit.disable();
            this.editProductLinesForm.controls.pickingUnit.disable();
            this.editProductLinesForm.controls.shipmentUnit.disable();
          } else {
            this.toastr.error('Failed in updating details');
          }
        },
          (error) => {
          });
      }
    }
    else {
      this.toastr.error("user doesnt have permissions");
    }
  }
  cancel() {
    this.fetchProductDetailsByID();
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategories = response.data.productCategories;
        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
  getProductCategory(value) {
    if (this.productCategories) {
      this.productCategories.forEach(productCategory => {
        if (productCategory.productCategoryName === value) {
          this.finalProductMaster.productCategoryInfo.productCategoryID = productCategory._id;
          this.finalProductMaster.productCategoryInfo.productCategory = productCategory.productCategory;
          this.finalProductMaster.productCategoryInfo.productCategoryName = productCategory.productCategoryName;
        }
      });
    }
  }
  findAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {

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
  shouldShowErrors(fieldName, formName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.util.shouldShowErrors(fieldName, formName);
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  createProductLinesForm() {
    this.editProductLinesForm = new FormBuilder().group({
      productID: ['', this.customValidators.required],
      productName: ['', this.customValidators.required],
      upcEANNumber: ['', this.customValidators.required],
      inventoryUnit: ['', this.customValidators.required],
      productType: ['', this.customValidators.required],
      receivingUnit: ['', this.customValidators.required],
      pickingUnit: ['', this.customValidators.required],
      shipmentUnit: ['', this.customValidators.required],
      productCategoryInfo: new FormBuilder().group({
        productCategoryName: ['', this.customValidators.required],
      })
    });
  }
}
