import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Constants } from 'src/app/constants/constants';
import { EditSupplierDetails } from 'src/app/entities/createPurchaseOrder/editSupplierDetails.entity';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Storage } from '../../../../shared/utils/storage';
import { CreatePurchaseOrderService } from 'src/app/services/createPurchaseOrder.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-edit-supplier-details',
  templateUrl: './edit-supplier-details.component.html'
})
export class EditSupplierDetailsComponent implements OnInit, OnChanges, OnDestroy {
  editSupplierData: any = {};
  isEditSupplier: any = false;
  isReadMode: any = false;
  supplierData: any;
  @Input() isClearPOHeader: any;
  focusedElement: any;
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  supplierTypes: any = Constants.SUPPLIER_TYPES;
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Purchase Order', Storage.getSessionUser());
  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;
  raisedPOCheck: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private appService: AppService, private configService: ConfigurationService,
    private CreatePurchaseOrderService: CreatePurchaseOrderService,
    private wmsService: WMSService,
    private commonMasterDataService: CommonMasterDataService,
    private toastr: ToastrService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
    this.editSupplierData = new EditSupplierDetails();
  }

  ngOnInit() {
    this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Purchase Order', Storage.getSessionUser());
        this.formObj = this.configService.getGlobalpayload();
        this.editSupplierData = new EditSupplierDetails();
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
      this.CreatePurchaseOrderService.supplierIDChange.subscribe(data => {
        if (data) {
          this.supplierData = data;
          this.fetchSupplierDetailsById();
          this.fetchAllCountries();
        }
      });
    }
  }
  ngOnDestroy(): void {
    this.forPermissionsSubscription.unsubscribe();
  }

  ngOnChanges() {
    this.getClearPOHeader();
  }
  redirectToSupplierMasterData() {
    if (this.permissionsList.includes('Update')) {
      if (this.supplierData && this.supplierData.supplierMasterID && this.permissionsList.includes('Update')) {
        this.appService.navigate('/masterdata/supplier', { id: this.supplierData.supplierMasterID });
      } else {
        this.toastr.error('Select Supplier');
      }
    }
    else {
      this.toastr.error("User doesnt have Ppermissions");
    }

  }
  fetchSupplierDetailsById() {
    this.wmsService.fetchSupplierDetailsById(this.supplierData.supplierMasterID, this.formObj).subscribe(
      (response) => {
        if (response && response.data.supplierMaster) {
          this.isReadMode = true;
          this.isEditSupplier = false;
          this.editSupplierData = response.data.supplierMaster;
        }
        else {
          this.isReadMode = false;
          this.isEditSupplier = false;
          this.editSupplierData = new EditSupplierDetails();
        }
      },
      (error) => {

      });
  }
  update() {
    if (this.permissionsList.includes('Update')) {
      this.isReadMode = false;
      this.isEditSupplier = true;
    }
    else {
      this.toastr.error("User Doesnt have permission");
    }

  }
  save() {
    if (this.permissionsList.includes('Update')) {
      this.wmsService.saveSupplierMasterData(JSON.stringify(this.editSupplierData)).subscribe((response) => {
        if (response && response.status === 0) {
          // this.editSupplierData = response.data.supplierMaster;
          this.fetchSupplierDetailsById();
          this.toastr.success('Details updated successfully');
          this.isEditSupplier = false;
          this.isReadMode = true;
        } else {
          this.toastr.error('Failed in updating details');
        }
      },
        (error) => {

        });
    }
    else {
      this.toastr.error("User Dooesnt have permission ")
    }
  }
  cancel() {
    this.fetchSupplierDetailsById();
  }
  getClearPOHeader() {
    if (this.isClearPOHeader && this.isClearPOHeader.isClearPOHeader === true) {
      this.editSupplierData = new EditSupplierDetails();
      this.isReadMode = false;
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
        if (this.editSupplierData && this.editSupplierData.country) {
          this.getSelectedValue('Country', this.editSupplierData.country);
        }
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
        if (this.editSupplierData && this.editSupplierData.state) {
          this.getSelectedValue('State', this.editSupplierData.state);
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
}
