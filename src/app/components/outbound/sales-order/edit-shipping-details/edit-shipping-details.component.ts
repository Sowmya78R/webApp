import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Util } from 'src/app/shared/utils/util';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { Constants } from 'src/app/constants/constants';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-soedit-shipping-details',
  templateUrl: './edit-shipping-details.component.html'
})
export class SOEditShippingDetailsComponent implements OnInit, OnDestroy {
  editShippingDetailsForm: FormGroup;
  editShippingData: any;
  isEditShippingDetails: any = false;
  isReadMode: any = true;
  countries: any[] = [];
  focusedElement: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
  forPermissionsSubscription: any;
  statusCheck: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  idData: any = null;

  constructor(private toastr: ToastrService, private configService: ConfigurationService,
    private appService: AppService, private outboundProcessService: OutboundProcessService,
    private commonMasterDataService: CommonMasterDataService,
    private util: Util,
    private wmsService: WMSService,
    private translate: TranslateService) {
    this.translate.use(this.language);
    this.createShippingDetailsForm();
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
            this.idData = response.data.salesOrderPaginationResponse.salesOrder;
            this.statusCheck = response.data.salesOrderPaginationResponse.salesOrder.raiseSOStatus;
            this.createShippingDetailsForm();
          }
          else {
            this.outboundProcessService.fetchInvoiceByID(this.appService.getParam('id'), this.formObj).subscribe(
              (response) => {
                if (response && response.status === 0 && response.data.invoice) {
                  this.idData = response.data.invoice;
                  this.statusCheck = response.data.invoice.status === 'Close' ? true : false;
                  this.createShippingDetailsForm();
                }
              })
          }
        })
    }

    this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
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
      this.getDisablePanel();
    }
  }
  ngOnDestroy(): void {
    this.forPermissionsSubscription.unsubscribe();
  }
  getDisablePanel() {
    if (this.permissionsList.includes('View') && this.permissionsList.includes('Update')) {
      this.editShippingDetailsForm.enable();
      this.isReadMode = false;

    }
    else if (this.permissionsList.includes('View') && this.appService.getParam('id')) {
      this.editShippingDetailsForm.disable();
      this.isReadMode = true;
    }
  }

  fetchShippingDetails() {
    this.wmsService.fetchWareHouseDetailsByID(Constants.WAREHOUSE_ID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse) {
          this.isReadMode = true;
          this.isEditShippingDetails = false;
          this.editShippingData = response.data.wareHouse;
          this.editShippingDetailsForm.patchValue(response.data.wareHouse);
          this.editShippingDetailsForm.controls['country'].disable();
        } else {
          this.editShippingData = {};
        }
      },
      (error) => {
        this.editShippingData = {};
      });
  }
  redirectToWareHouseData() {
    if (this.permissionsList.includes('Update')) {
      if (Constants.WAREHOUSE_ID) {
        this.appService.navigate('/masterdata/warehouse', { id: Constants.WAREHOUSE_ID });
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  update() {
    if (this.permissionsList.includes('Update')) {
      this.isReadMode = false;
      this.isEditShippingDetails = true;
      this.editShippingDetailsForm.controls['country'].enable();
    }
    else {
      this.toastr.error("user Doesn't have permission ");
    }
  }
  save() {
    if (this.permissionsList.includes('Update')) {
      const editShippingData = { ...this.editShippingData, ...this.editShippingDetailsForm.value };
      this.wmsService.saveOrUpdateWareHouseData(JSON.stringify(editShippingData)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouse) {
            this.editShippingData = response.data.wareHouse;
            this.editShippingDetailsForm.patchValue(response.data.wareHouse);
            this.isEditShippingDetails = false;
            this.isReadMode = true;
            this.toastr.success('Updated successfully');
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
  cancel() {
    if (this.permissionsList.includes('Update')) {
      this.fetchShippingDetails();
    }
    else {
      this.toastr.error("User doesnt have permission");
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
  createShippingDetailsForm() {
    if (this.idData) {
      this.editShippingDetailsForm = this.createShipFromArray(this.idData.shipFromAddress);
    }
    else {
      this.editShippingDetailsForm = this.createShipFromArray();
    }
    // this.editShippingDetailsForm = new FormBuilder().group({
    //   contactName: [''],
    //   phoneNumber: [''],
    //   email: [''],
    //   address: [''],
    //   city: [''],
    //   country: [''],
    //   state: [''],
    //   pin: [''],
    //   "organizationInfo": {
    //     "_id": null,
    //     "organizationID": null,
    //     "organizationName": null,
    //     "organizationIDName": null
    //   }
    // });
  }
  createShipFromArray(details?) {
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

}
