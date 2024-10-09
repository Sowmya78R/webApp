import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { EditProductLines } from '../../../../../entities/createPurchaseOrder/editProductLines.entity';
import { AppService } from '../../../../../shared/services/app.service';
import { CreatePurchaseOrderService } from '../../../../../services/createPurchaseOrder.service';
import { WMSService } from '../../../../../services/integration-services/wms.service';
import { ToastrService } from 'ngx-toastr';
import { MetaDataService } from '../../../../../services/integration-services/metadata.service';
import { Constants } from '../../../../../constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../../shared/utils/storage';
@Component({
  selector: 'app-edit-product-lines',
  templateUrl: './edit-product-lines.component.html'
})
export class EditProductLinesComponent implements OnInit, OnChanges, OnDestroy {
  editProductLinesData: any;
  productDetails: any = {};
  isReadMode: any = false;
  isEditProduct: any = false;
  units: any = [];
  productTypes: any[] = Constants.PRODUCT_TYPES;
  productCategories: any[] = [];
  @Input() isClearPOLine: any;
  focusedElement: any;
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Purchase Order', Storage.getSessionUser());
  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;

  constructor(private appService: AppService, private configService: ConfigurationService,
    private createPurchaseOrderService: CreatePurchaseOrderService,
    private metaDataService: MetaDataService,
    private wmsService: WMSService,
    private toastr: ToastrService) {
    this.editProductLinesData = new EditProductLines();
    this.getDisablePanel();
  }

  ngOnInit() {
    this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Purchase Order', Storage.getSessionUser());
        this.editProductLinesData = new EditProductLines();
        this.getDisablePanel();
        this.findAllUnits();
      }
    })
    this.createPurchaseOrderService.clearproductLine.subscribe(data => {
      this.clearEditPOLine()
    })
    this.getCalls();
  }
  getCalls() {
    if (this.permissionsList.includes('View')) {
      this.findAllUnits();
      this.createPurchaseOrderService.productIDChange.subscribe(data => {
        this.productDetails = data;
        this.fetchProductDetailsByID();
        this.fetchAllProductCategories();
      });
    }
  }
  formNotInViewMode: boolean = false;
  ngOnDestroy(): void {
    this.forPermissionsSubscription.unsubscribe();
  }
  getDisablePanel() {
    if (this.permissionsList.includes('View') && this.appService.getParam('id')) {
      this.formNotInViewMode = true
      this.isReadMode = true;
    }
    else {
      this.formNotInViewMode = false;
      this.isReadMode = false;
    }
  }

  ngOnChanges() {
    this.clearEditPOLine();
  }
  clearEditPOLine() {
    this.editProductLinesData = new EditProductLines();
    this.isReadMode = false;
  }
  redirectToProductMasterData() {
    if (this.productDetails && (this.productDetails.productMasterID || this.productDetails._id) && this.permissionsList.includes('Update')) {
      this.appService.navigate('/masterdata/product', { id: (this.productDetails.productMasterID || this.productDetails._id) });
    } else {
      this.toastr.error('select supplier and product');
    }
  }
  fetchProductDetailsByID() {
    if ((this.productDetails.productMasterID || this.productDetails._id)) {
      this.wmsService.fetchProductDetailsById((this.productDetails.productMasterID || this.productDetails._id), this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productMaster) {
            this.isReadMode = true;
            this.isEditProduct = false;
            this.editProductLinesData = response.data.productMaster;
          } else {
            // this.toastr.error('Product details not found');
          }
        },
        (error) => {

        });
    }
  }
  update() {
    if (this.permissionsList.includes('Update')) {
      this.isReadMode = false;
      this.isEditProduct = true;
    }
    else {
      this.toastr.error("user Doesnt have permission");
    }

  }
  save() {
    if (this.permissionsList.includes('Update')) {
      this.getProductCategory(this.editProductLinesData.productCategoryInfo.productCategoryName);
      this.wmsService.productMasterData(JSON.stringify(this.editProductLinesData)).subscribe((response) => {
        if (response && response.status === 0) {
          this.fetchProductDetailsByID();
          this.toastr.success('Details updated successfully');
          this.isEditProduct = false;
          this.isReadMode = true;
        } else {
          this.toastr.error('Failed in updating details');
        }
      },
        (error) => {

        });
    }
    else {
      this.toastr.error("user Doesnt have permission");
    }
  }
  findAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
      else {
        this.units = [];
      }
    },
      (error: any) => {
        this.units = [];
      });
  }
  cancel() {
    if (this.permissionsList.includes('Update')) {
      this.fetchProductDetailsByID();
    }
    else {
      this.toastr.error('User Doesnt have permission');
    }

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
          this.editProductLinesData.productCategoryInfo.productCategoryID = productCategory._id;
          this.editProductLinesData.productCategoryInfo.productCategory = productCategory.productCategory;
          this.editProductLinesData.productCategoryInfo.productCategoryName = productCategory.productCategoryName;
        }
      });
    }
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.invalid && fieldName.touched;
    }
  }
}
