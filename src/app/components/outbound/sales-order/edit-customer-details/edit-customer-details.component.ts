import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { Util } from 'src/app/shared/utils/util';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../../shared/utils/storage';
import { Constants } from 'src/app/constants/constants';
import { CreateSalesOrderService } from 'src/app/services/createSalesOrder.service';
import { OutboundMasterDataService } from 'src/app/services/integration-services/outboundMasterData.service';
import { AppService } from 'src/app/shared/services/app.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-edit-customer-details',
  templateUrl: './edit-customer-details.component.html'
})
export class EditCustomerDetailsComponent implements OnInit, OnDestroy {
  editCustomerDetailsForm: FormGroup;
  customerDetails: any;
  isReadMode: any = false;
  isEditCustomer: any = false;
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  editCustomerDetails: any = {};
  focusedElement: any;
  customerTypes: any = Constants.CUSTOMER_TYPES;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
  forPermissionsSubscription: any;
  statusCheck: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  constructor(private toastr: ToastrService, private configService: ConfigurationService,
    private appService: AppService, private outboundProcessService: OutboundProcessService,
    private outboundMasterDataService: OutboundMasterDataService,
    private customValidators: CustomValidators,
    private util: Util,
    private commonMasterDataService: CommonMasterDataService,
    private createSalesOrderService: CreateSalesOrderService,
    private translate: TranslateService) {
    this.translate.use(this.language);
    this.createCustomerDetailsForm();
  }

  ngOnInit() {
    this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Sales Order', Storage.getSessionUser());
      }
    })
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
          }
        })
    }
    if (this.permissionsList.includes('View')) {
      this.createSalesOrderService.customerIDChange.subscribe(data => {
        this.customerDetails = data;
        this.fetchCustomerByID();
      });
      this.createSalesOrderService.clearCustomerCall.subscribe(data => {
        this.isReadMode = false;
        this.isEditCustomer = true;
        this.editCustomerDetailsForm.controls['country'].enable();
        this.editCustomerDetailsForm.controls['customerType'].enable();
        this.editCustomerDetailsForm.reset();
      });
      this.fetchAllCountries();
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
  update() {
    if (this.customerDetails) {
      this.isReadMode = false;
      this.isEditCustomer = true;
      this.editCustomerDetailsForm.controls['country'].enable();
      this.editCustomerDetailsForm.controls['customerType'].enable();
    } else {
      this.toastr.error('Select customer');
    }
  }
  save() {
    const id = this.customerDetails.customerMasterID;
    this.customerDetails._id = id;
    delete this.customerDetails.customerMasterID;
    const finalCustomerDetails = { ...this.customerDetails, ...this.editCustomerDetails, ...this.editCustomerDetailsForm.value };
    delete finalCustomerDetails.address;
    if (finalCustomerDetails) {
      this.outboundMasterDataService.saveOrUpdateCustomer(JSON.stringify(finalCustomerDetails)).subscribe(
        (response) => {
          if (!!response && response.status === 0 && response.data.customer) {
            this.customerDetails = response.data.customer;
            this.editCustomerDetailsForm.patchValue(response.data.customer);
            this.isEditCustomer = false;
            this.isReadMode = true;
            this.toastr.success('Customer details updated.');
          } else {
            this.toastr.error('Failed in updating customer details.');
          }
        },
        (error) => {
          this.toastr.error('Failed in updating customer details.');
        }
      );
    } else {
      this.toastr.error('Failed in updating customer details.');
    }
  }
  fetchCustomerByID() {
    this.outboundMasterDataService.fetchCustomerByID(this.customerDetails.customerMasterID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customer) {
          this.editCustomerDetails = response.data.customer;
          this.editCustomerDetailsForm.patchValue(response.data.customer);
          this.editCustomerDetailsForm.controls['country'].disable();
          this.editCustomerDetailsForm.controls['customerType'].disable();
          this.isReadMode = true;
          this.isEditCustomer = false;
        } else {
          this.editCustomerDetailsForm.patchValue({});
        }
      },
      (error) => {
        this.editCustomerDetailsForm.patchValue({});
      }
    );
  }
  cancel() {
    this.fetchCustomerByID();
  }
  redirectToCustomerMasterData() {
    if (this.permissionsList.includes('Update')) {
      if (this.customerDetails && this.customerDetails.customerMasterID) {
        this.appService.navigate('masterdata/customer', { id: this.customerDetails.customerMasterID });
      } else {
        this.toastr.error('select customer');
      }
    }
    else {
      this.toastr.success("User doesn't have Permissions.")
    }
  }
  getSelectedValue(type, value) {
    switch (type) {
      case 'Country': {
        if (value) {
          for (let i = 0; i < this.countries.length; i++) {
            if (this.countries[i].name === value) {
              this.fetchAllStatesByCountryID(this.countries[i]._id);
              break;
            }
          }
        }
        break;
      }
      case 'State': {
        if (value) {
          for (let i = 0; i < this.states.length; i++) {
            if (this.states[i].name === value) {
              this.fetchAllCitiesByStateID(this.states[i]._id);
              break;
            }
          }
        }
        break;
      }
    }
  }
  fetchAllCountries() {
    this.commonMasterDataService.fetchAllCountries(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.countries) {
        this.countries = response.data.countries;
        // if (this.editCustomerDetails && this.editCustomerDetails.country) {
        //   this.getSelectedValue('Country', this.editCustomerDetails.country);
        // }
      } else {
        this.countries = [];
      }
    }, error => {
      this.countries = [];
    });
  }
  fetchAllStatesByCountryID(id: any) {
    this.commonMasterDataService.fetchAllStatesByCountryID(id).subscribe(response => {
      if (response && response.status === 0 && response.data.states) {
        this.states = response.data.states;
        if (this.editCustomerDetails && this.editCustomerDetails.state) {
          this.getSelectedValue('State', this.editCustomerDetails.state);
        }
      } else {
        this.states = [];
      }
    }, error => {
      this.states = [];
    });
  }
  fetchAllCitiesByStateID(id: any) {
    this.commonMasterDataService.fetchAllCitiesByStateID(id).subscribe(response => {
      if (response && response.status === 0 && response.data.cities) {
        this.cities = response.data.cities;
      } else {
        this.cities = [];
      }
    }, error => {
      this.cities = [];
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
  createCustomerDetailsForm() {
    this.editCustomerDetailsForm = new FormBuilder().group({
      customerID: ['', this.customValidators.required],
      customerName: ['', this.customValidators.required],
      customerType: ['', this.customValidators.required],
      email: ['', this.customValidators.validateSkrillEmail()],
      country: ['', this.customValidators.required],
      state: ['', this.customValidators.required],
      city: ['', this.customValidators.required],
      spocEmail: ['', this.customValidators.validateSkrillEmail()],
      spocPhoneNumber: ['', this.customValidators.required],
      spocName: ['', this.customValidators.required],
    });
  }
}
