import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Constants } from 'src/app/constants/constants';
import { EditShippingDetails } from 'src/app/entities/createPurchaseOrder/editShippingDetails.entity';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Storage } from '../../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-shipping-details',
  templateUrl: './edit-shipping-details.component.html'
})
export class EditShippingDetailsComponent implements OnInit, OnDestroy {
  editShippingData: any;
  isEditShippingDetails: any = false;
  isReadMode: any = false;
  countries: any[] = [];
  states: any[] = [];
  focusedElement: any;
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Purchase Order', Storage.getSessionUser());
  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;
  raisedPOCheck: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private appService: AppService, private configService: ConfigurationService,
    private wmsService: WMSService,
    private commonMasterDataService: CommonMasterDataService,
    private toastr: ToastrService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    this.editShippingData = new EditShippingDetails();
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
      this.wmsService.fetchPurchaseOrderByIDPagination(form).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.purchaseOrderPaginationResponse.purchaseOrder) {
            this.raisedPOCheck = response.data.purchaseOrderPaginationResponse.purchaseOrder.raisePO;
          }
        })
    }
    this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Purchase Order', Storage.getSessionUser());
        this.formObj = this.configService.getGlobalpayload();
        this.editShippingData = new EditShippingDetails();
        this.getCalls();
      }
    })
    this.getCalls();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  getCalls() {
    if (this.permissionsList.includes('View')) {
      this.fetchShippingDetails();
      this.fetchAllCountries();
      this.getDisabledFields();
    }
  }
  makeThisDisabled: boolean = false;

  ngOnDestroy(): void {
    this.forPermissionsSubscription.unsubscribe();
  }

  getDisabledFields() {
    if (this.permissionsList.includes('View')) {
      this.isReadMode = true;
      this.makeThisDisabled = true
    }
    else {
      this.isReadMode = false;
      this.makeThisDisabled = false

    }
  }
  fetchShippingDetails() {
    this.wmsService.fetchWareHouseDetailsByID(Constants.WAREHOUSE_ID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse) {
          this.isReadMode = true;
          this.isEditShippingDetails = false;
          this.editShippingData = response.data.wareHouse;
        } else {
          this.editShippingData = {};
        }
      },
      (error) => {
        this.editShippingData = {};
      });
  }
  redirectToWareHouse() {
    if (this.permissionsList.includes('Update')) {
      if (Constants.WAREHOUSE_ID && this.permissionsList.includes('Update')) {
        this.appService.navigate('/masterdata/warehouse', { id: Constants.WAREHOUSE_ID });
      }
    }
    else {
      this.toastr.error("User doesnt have permission");
    }

  }
  update() {
    if (this.permissionsList.includes('Update')) {
      this.isReadMode = false;
      this.isEditShippingDetails = true;
    }
    else {
      this.toastr.error('user doesnt have permission');
    }
  }
  save() {
    if (this.permissionsList.includes('Update')) {
      this.wmsService.saveOrUpdateWareHouseData(JSON.stringify(this.editShippingData)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouse) {
            this.editShippingData = response.data.wareHouse;
            this.isEditShippingDetails = false;
            this.isReadMode = true;
            this.toastr.success('Details updated successfully');
          } else {
            this.toastr.error('Failed in updating details');
          }
        },
        (error) => {
        }
      );
    }
    else {
      this.toastr.error("User Doesnt have permission");
    }
  }
  cancel() {
    if (this.permissionsList.includes('Update')) {
      this.fetchShippingDetails();
    }
    else {
      this.toastr.error("user doesnt have permissions")
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
  }
}
