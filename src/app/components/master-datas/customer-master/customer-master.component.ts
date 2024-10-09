import { Component, OnInit, ViewChild, OnDestroy, EventEmitter, Output, AfterViewInit, } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { Customer } from '../../../entities/customer.entity';
import { Util } from 'src/app/shared/utils/util';
import { ApexService } from '../../../shared/services/apex.service';
import { InboundMasterDataService } from '../../../services/integration-services/inboundMasterData.service';
import { AppService } from '../../../shared/services/app.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { Constants } from '../../../constants/constants';
import { MetaDataService } from '../../../services/integration-services/metadata.service';
import { WMSService } from '../../../services/integration-services/wms.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-customer-master',
  templateUrl: './customer-master.component.html'
})
export class CustomerMasterComponent implements OnInit, OnDestroy, AfterViewInit {
  customer: any;
  customerForm: FormGroup;
  id: any = '';
  focusedElement: any;
  countries: any = [];
  customerTypes: any = Constants.CUSTOMER_TYPES;
  currencies: any = [];
  taxGroups: any = [];
  taxTypes: any = Constants.TAX_TYPES;
  serviceTypes: any = Constants.SERVICE_TYPES;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  customers: any = [];
  statuss: any = ['Active', 'InActive'];
  @Output() sendCustomer: any = new EventEmitter<any>();
  termsOfPayments: any = [];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  equipmentIdValues: any = [];
  failureRecords: any = [];
  isReadMode: any = false;
  missingParams: any;
  isShowOrHideError: any = false;
  termOfPayments: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Customer', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  statesData: any = [];
  statesList: any = [];
  selectedAddress: any = 'Ship to Address';
  shipToAddresses: FormArray;
  shipFromAddresses: FormArray;
  billToAddresses: FormArray;
  addressKeys = [{ name: 'Ship to Address', key: 'shipToAddresses' },
  { name: 'Ship from Address', key: 'shipFromAddresses' },
  { name: 'Bill to Address', key: 'billToAddresses' }]
  constructor(private apexService: ApexService, private fb: FormBuilder,
    public ngxSmartModalService: NgxSmartModalService,
    private IBMDService: InboundMasterDataService,
    private excelService: ExcelService,
    private metaDataService: MetaDataService,
    private commonMasterDataService: CommonMasterDataService,
    private appService: AppService,
    private util: Util, private configService: ConfigurationService,
    private excelRestService: ExcelRestService,
    private toastr: ToastrService,
    private translate: TranslateService, private wmsService: WMSService) {
    this.translate.use(this.language);

    this.customer = new Customer();
  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        lengthMenu: 'Show _MENU_ Entries',
      }
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    /*   this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
        if (data) {
          this.formObj = this.configService.getGlobalpayload();
          this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Customer', Storage.getSessionUser());
          this.getFunctionsCall();
        }
      }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.apexService.getPanelIconsToggle();
      this.createCustomerForm();
      this.fetchCustomerByID();
      this.fetchAllCountries();
      this.fetchAllStates();
      this.getAllCurrencies();
      this.fetchAllTaxGroups();
      this.fetchAllCustomers();
      this.fetchAllTermOfPayments();
    }
  }
  fetchAllTermOfPayments() {
    this.metaDataService.fetchAllTermOfPayments(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.termsOfPayments.length) {
          this.termOfPayments = response.data.termsOfPayments;
        }
      },
      error => {
        this.termOfPayments = [];
      });
  }
  createShipTOArray(details?) {
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
  addShipToLine(ele?, selected?) {
    if (this.permissionsList.includes('Update')) {
      let keys = this.addressKeys.find(k => k.name == this.selectedAddress).key
      const select = selected ? selected : keys;
      this[select] = <FormArray>this.customerForm.controls[select];
      this[select].push(this.createShipTOArray(ele ? ele : null));
    }
    else {
      this.toastr.error("user doesnt have permission")
    }
  }
  removeShipToLine(index, array) {
    if (this.permissionsList.includes('Delete')) {
      this[array] = <FormArray>this.customerForm.controls[array];
      this[array].removeAt(index)
    }
    else {
      this.toastr.error("user doesnt have permission")
    }

  }
  selectedAddressMethod() {
    const addressForm = this.customerForm.value;
    switch (this.selectedAddress) {
      case 'Ship to Address': {
        if (addressForm.shipToAddresses.length) {
          addressForm.shipToAddresses.forEach((ele, i) => {
            if (addressForm.shipToAddresses.length != 1 && !ele.name) {
              this['shipToAddresses'] = <FormArray>this.customerForm.controls['shipToAddresses'];
              this['shipToAddresses'].removeAt(i);
            }
          });
        }
        else {
          this.addShipToLine();
        }
        break;
      }
      case 'Ship from Address': {
        if (addressForm.shipFromAddresses.length) {
          addressForm.shipFromAddresses.forEach((ele, i) => {
            if (addressForm.shipFromAddresses.length != 1 && !ele.name) {
              this['shipFromAddresses'] = <FormArray>this.customerForm.controls['shipFromAddresses'];
              this['shipFromAddresses'].removeAt(i);
            }
          });
        }
        else {
          this.addShipToLine();
        }
        break;
      }
      case 'Bill to Address': {
        if (addressForm.billToAddresses.length) {
          addressForm.billToAddresses.forEach((ele, i) => {
            if (addressForm.billToAddresses.length != 1 && !ele.name) {
              this['billToAddresses'] = <FormArray>this.customerForm.controls['billToAddresses'];
              this['billToAddresses'].removeAt(i);
            }
          });
        }
        else {
          this.addShipToLine();
        }
        break;
      }
    }
  }
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      this.customer = this.customerForm.value;
      if (this.id) {
        this.customer._id = this.id;
      }
      else {
        this.customer['organizationInfo'] = this.configService.getOrganization();
        this.customer['wareHouseInfo'] = this.configService.getWarehouse();
      }
      this.customer.shipToAddresses = (this.customer.shipToAddresses && this.customer.shipToAddresses.length > 0) ? this.customer.shipToAddresses : null;
      this.customer.shipFromAddresses = (this.customer.shipFromAddresses && this.customer.shipFromAddresses.length > 0) ? this.customer.shipFromAddresses : null;
      this.customer.billToAddresses = (this.customer.billToAddresses && this.customer.billToAddresses.length > 0) ? this.customer.billToAddresses : null;
      if (this.customer.shipToAddresses && this.customer.shipToAddresses.find(x => x.defaultAddress) || !this.customer.shipToAddresses) {
        if (this.customer.shipFromAddresses && this.customer.shipFromAddresses.find(x => x.defaultAddress) || !this.customer.shipFromAddresses) {
          if (this.customer.billToAddresses && this.customer.billToAddresses.find(x => x.defaultAddress) || !this.customer.billToAddresses) {
            this.saveContinution(this.customer);
          }
          else {
            this.toastr.error('Set Default Address in billToAddresses');
          }
        }
        else {
          this.toastr.error('Set Default Address in shipFromAddresses');
        }
      }
      else {
        this.toastr.error('Set Default Address in ShipToAddresses');
      }

    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null;
  }
  saveContinution(customer) {
    this.IBMDService.saveOrUpdateCustomer(JSON.stringify(customer)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customer) {
          this.clear();
          this.isReadMode = false;
          this.id = '';
          this.rerender();
          this.fetchAllCustomers();
          this.toastr.success(response.statusMsg);
          /*  this.toastr.success('Saved successfully'); */
          if (this.appService.getParam('id')) {
            this.appService.navigate('/masterdata/customer', null);
          }
        } else if (response && response.status === 2 && response.statusMsg) {
          this.toastr.error(response.statusMsg);
        } else {
          this.toastr.error('Failed in saving');
        }
      },
      (error) => {
        this.toastr.error('Failed in saving');
      }
    );
  }
  clear() {
    // if (this.customerForm.value.shipToAddresses.length) {
    //   for (let i = 0; i < this.customerForm.value.shipToAddresses.length; i++) {
    //     this.removeShipToLine(i, 'shipToAddresses');
    //   }
    // }
    // this.customerForm.reset();
    this.createCustomerForm();
    this.customerForm.get('status').setValue('Active');
    window.scroll(0, 0);
    this.isReadMode = false;
    this.configService.forPermissions.next(false);
    this.customerForm.enable();
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.id = ''
    this.customerForm.patchValue({
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.selectedAddress = 'Ship to Address';
    // this.addShipToLine();
  }
  fetchCustomerByID() {
    if (this.appService.getParam('id')) {
      this.IBMDService.fetchCustomerByID(this.appService.getParam('id'), this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.customer) {
            this.getCustomer(response.data.customer);
            this.rerender();
          } else {
            this.customer = {};
          }
        },
        (error) => {
          this.customer = {};
        }
      );
    }
  }
  getCustomerIDName() {
    this.customerForm.controls.customerIDName.setValue(`${this.customerForm.value.customerID}:${this.customerForm.value.customerName}`);
  }
  getCustomer(customer: any) {
    this.id = customer._id;
    this.customerForm.patchValue(customer);
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
  fetchAllStates() {
    this.wmsService.fetchStates(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].countryStateMasters) {
        this.statesData = res['data'].countryStateMasters;
      }
    })
  }
  getStates(event) {
    const filteredRec = this.statesData.find(x => x.countryName == event);
    this.statesList = filteredRec ? filteredRec.stateNames : [];
  }
  fetchAllCustomers() {
    this.IBMDService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.customers.length > 0) {
          this.customers = response.data.customers;
          this.rerender();
        } else {
          this.customers = [];
        }
      },
      (error) => {
        this.customers = [];
      });
  }
  createCustomerForm(key?) {
    this.customerForm = new FormBuilder().group({
      customerID: ['', Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      customerName: ['', Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      customerIDName: ['', Validators.compose([null, Validators.maxLength(99)])],
      customerType: [null, Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      serviceType: [null],
      // shipingAddress: ['', [Validators.required]],
      // email: ['', Validators.compose([null, Validators.maxLength(99)])],
      // phoneNumber: ['', Validators.compose([null, Validators.maxLength(10)])],
      creditPeriod: [''],
      panNumber: [''],
      gstNumber: null,
      // country: [null, Validators.compose([null, Validators.maxLength(99)])],
      // state: [''],
      // city: [''],
      // pin: ['', Validators.compose([null, Validators.maxLength(10)])],
      taxGroup: [null, Validators.compose([null, Validators.maxLength(99)])],
      taxType: [''],
      currency: [null, Validators.compose([null, Validators.maxLength(99)])],
      markupPercentage: [''],
      discountPercentage: [''],
      spocName: [''],
      spocPhoneNumber: [''],
      spocEmail: [''],
      bankName: ['', Validators.compose([null, Validators.maxLength(99)])],
      accountNumber: ['', Validators.compose([null, Validators.maxLength(99)])],
      accountHolderName: ['', Validators.compose([null, Validators.maxLength(99)])],
      accountType: ['', Validators.compose([null, Validators.maxLength(10)])],
      ifscCode: [''],
      bankAddress: [''],
      status: ['Active', Validators.compose([null, Validators.maxLength(99)])],
      latitude: [''],
      longitude: [''],
      leadTime: [null],
      termsOfPayment: [null, Validators.compose([null, Validators.maxLength(99)])],
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      shipToAddresses: this.fb.array(key ? [] : [this.createShipTOArray()]),
      shipFromAddresses: this.fb.array([]),
      billToAddresses: this.fb.array([])
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
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.customerForm.controls[fieldName].valid && this.customerForm.controls[fieldName].touched;
    }
  }
  getAllCurrencies() {
    this.metaDataService.fetchAllCurrencies(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.currencies) {
          this.currencies = response.data.currencies;
        } else {
          this.currencies = [];
        }
      },
      (error) => {
        this.currencies = [];
      });
  }
  fetchAllTaxGroups() {
    this.metaDataService.fetchAllTaxGroups(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.taxGroups) {
          this.taxGroups = response.data.taxGroups;
        } else {
          this.taxGroups = [];
        }
      },
      (error) => {
        this.taxGroups = [];
      });
  }
  exportAsXLSX() {
    this.IBMDService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.customers = response.data.customers;
          console.log(this.customers)
          this.customers.forEach(el => {
            let arr = []
            if (el.shipToAddresses && el.shipToAddresses.length > 0) {
              el.shipToAddresses.forEach(m => {
                m['type'] = "shipToAddresses"
                arr.push(m)
              })
            }
            if (el.shipFromAddresses && el.shipFromAddresses.length > 0) {
              el.shipFromAddresses.forEach(m => {
                m['type'] = "shipFromAddresses"
                arr.push(m)
              })
            }
            if (el.billToAddresses && el.billToAddresses.length > 0) {
              el.billToAddresses.forEach(m => {
                m['type'] = "billToAddresses"
                arr.push(m)
              })
            }
            if (arr && arr.length > 0) {
              el['allAddresses'] = arr
            } else {
              el['allAddresses'] = null
            }
          })
          const data = this.excelService.formatJSONForHeaderLines(this.customers, 'allAddresses');
          const changedSupplierList = this.exportTypeMethod(data)
          this.excelService.exportAsExcelFile(changedSupplierList, 'Customers', null);
        } else {
          this.customers = [];
        }
      },
    );
  }
  getDefaultEvent(event, array, i) {
    this[array] = <FormArray>this.customerForm.controls[array];
    if (event.target.checked) {
      this[array].controls.forEach((element, index) => {
        if (i == index) {
          element.controls.defaultAddress.setValue(true);
        }
        else {
          element.controls.defaultAddress.setValue(false);
        }
      });
    }
  }
  exportTypeMethod(data) {
    console.log(data);   
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['customerID'] = k.finishedCustomerID ? k.finishedCustomerID : null       
        obj['customerName'] = k.customerName
        obj['customerType'] = k.customerType
        obj['leadTime'] = k.leadTime
        obj['latitude'] = k.latitude
        obj['longitude'] = k.longitude
        obj['creditPeriod'] = k.creditPeriod
        obj['GST'] = k.gstNumber
        obj['panNumber'] = k.panNumber
        obj['taxType'] = k.taxType
        obj['markupPercentage'] = k.markupPercentage
        obj['currency'] = k.currency
        obj['discountPercentage'] = k.discountPercentage
        obj['spocName'] = k.spocName
        obj['spocPhoneNumber'] = k.spocPhoneNumber
        obj['spocEmail'] = k.spocEmail
        obj['bankName'] = k.bankName
        obj['accountNumber'] = k.accountNumber
        obj['accountHolderName'] = k.accountHolderName
        obj['accountType'] = k.accountType
        obj['ifscCode'] = k.ifscCode
        obj['bankAddress'] = k.bankAddress
        obj['taxGroup'] = k.taxGroup
        obj['serviceType'] = k.serviceType
        obj['termsOfPayment'] = k.termsOfPayment
        // obj['shipingAddress'] = k.shipingAddress
        // obj['email'] = k.email
        // obj['phoneNumber'] = k.phoneNumber
        // obj['country'] = k.country
        // obj['state'] = k.state
        // obj['city'] = k.city
        // obj['pin'] = k.pin
        obj['type'] = k.type
        obj['name'] = k.name
        obj['email'] = k.email
        obj['address'] = k.address
        obj['city'] = k.city
        obj['state'] = k.state
        obj['pin'] = k.pin
      //  obj['phoneNumber'] = k.contactDetails.phoneNumber ? k.contactDetails.phoneNumber:null
      ////  obj['alternativePhoneNumber'] = k.contactDetails.alternativePhoneNumber ? k.contactDetails.alternativePhoneNumber:null
      //  obj['contactName'] = k.contactDetails.contactName ? k.contactDetails.contactName : null
        obj['country'] = k.country
        obj['defaultAddress'] = k.defaultAddress
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['customerID'] = null
      obj['customerName'] = null
      obj['customerType'] = null
      obj['leadTime'] = null
      obj['latitude'] = null
      obj['longitude'] = null
      obj['creditPeriod'] = null
      obj['GST'] = null
      obj['panNumber'] = null
      obj['taxType'] = null
      obj['markupPercentage'] = null
      obj['currency'] = null
      obj['discountPercentage'] = null
      obj['spocName'] = null
      obj['spocPhoneNumber'] = null
      obj['spocEmail'] = null
      obj['bankName'] = null
      obj['accountNumber'] = null
      obj['accountHolderName'] = null
      obj['accountType'] = null
      obj['ifscCode'] = null
      obj['bankAddress'] = null
      obj['taxGroup'] = null
      obj['termsOfPayment'] = null
      obj['shipingAddress'] = null
      // obj['email'] = null
      // obj['phoneNumber'] = null
      // obj['country'] = null
      // obj['state'] = null
      // obj['city'] = null
      // obj['pin'] = null
      obj['type'] = null
      obj['name'] = null
      obj['email'] = null
      obj['address'] = null
      obj['city'] = null
      obj['state'] = null
      obj['pin'] = null
      obj['phoneNumber'] = null
      obj['alternativePhoneNumber'] = null
      obj['contactName'] = null
      obj['country'] = null
      obj['defaultAddress'] = null
      arr.push(obj)
    }
    return arr
  }
  fetchAllTermsOfPayment() {
    this.metaDataService.fetchAllTermOfPayments(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.termsOfPayments) {
          this.termsOfPayments = response.data.termsOfPayments;
        } else {
          this.termsOfPayments = [];
        }
      },
      (error) => {
        this.termsOfPayments = [];
      });
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs: any;
  edit(customer: any) {
    this.globalIDs = customer._id
    let arr = [];
    if (this.statesData.length) {
      this.statesData.forEach(element => {
        arr = [...arr, ...element.stateNames];
      });
    }
    this.statesList = [...new Set(arr)];
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      // if (this.customerForm.value.shipToAddresses.length) {
      //   for (let i = 0; i < this.customerForm.value.shipToAddresses.length; i++) {
      //     this.removeShipToLine(i, 'shipToAddresses');
      //   }
      // }
      // if (this.customerForm.value.shipFromAddresses.length) {
      //   for (let i = 0; i < this.customerForm.value.shipFromAddresses.length; i++) {
      //     this.removeShipToLine(i, 'shipFromAddresses');
      //   }
      // }
      // if (this.customerForm.value.billToAddresses.length) {
      //   for (let i = 0; i < this.customerForm.value.billToAddresses.length; i++) {
      //     this.removeShipToLine(i, 'billToAddresses');
      //   }
      // }
      this.createCustomerForm('clear');
      window.scroll(0, 0);
      if (!customer.shipToAddresses) {
        customer.shipToAddresses = []
      }
      if (!customer.shipFromAddresses) {
        customer.shipFromAddresses = []
      }
      if (!customer.billToAddresses) {
        customer.billToAddresses = []
      }
      this.customerForm.patchValue(customer);
      this.id = customer._id;
      this.isReadMode = true;
      this.customer = customer;
      this.sendCustomer.emit(customer);
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
      this.selectedAddress = 'Ship to Address';
      if (customer.shipToAddresses && customer.shipToAddresses.length) {
        customer.shipToAddresses.forEach(element => {
          this.addShipToLine(element, 'shipToAddresses')
        });
      }
      else {
        this.addShipToLine();
      }
      if (customer.shipFromAddresses && customer.shipFromAddresses.length) {
        customer.shipFromAddresses.forEach(element => {
          this.addShipToLine(element, 'shipFromAddresses')
        });
      }
      if (customer.billToAddresses && customer.billToAddresses.length) {
        customer.billToAddresses.forEach(element => {
          this.addShipToLine(element, 'billToAddresses')
        });
      }
    }
    else if (this.permissionsList.includes('View')) {
      window.scroll(0, 0);
      this.customerForm.patchValue(customer);
      this.makeReadOnly = true;
      this.makeThisDisabled = true;
      this.customerForm.disable();
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.customer = { name: 'Customer', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllCustomers();
    }
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
    // this.forPermissionsSubscription.unsubscribe();
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  // uploadExcel = async (event) => {
  //   if (event.target.files && event.target.files[0]) {
  //     this.isShowOrHideError = false;
  //     const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.CUSTOMER;
  //     await this.excelService.generateJsonUsingExcel(event);
  //     setTimeout(() => {
  //       const jsonData = this.excelService.getJsonData();
  //     
  //       if (jsonData.length > 0) {
  //         event.target.value = '';
  //         const missingParamsArray = this.mandatoryCheck(jsonData);
  //      
  //         if (missingParamsArray.length > 1) {
  //           this.failureRecords = missingParamsArray;
  //           this.missingParams = missingParamsArray.join(', ');
  //           this.toastr.error('Please download log file to fill mandatory fields');
  //         } else {
  //           const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.LEVEL);
  //         
  //           reqData.forEach(r => {
  //        
  //           });
  //         
  //           reqData.forEach(r => {
  //             r['organizationInfo'] = this.configService.getOrganization();
  //             r['wareHouseInfo'] = this.configService.getWarehouse();
  //             r['gstNumber'] = r.GST;
  //           });
  //           this.excelRestService.saveCustomerBulkdata(reqData).subscribe(res => {
  //             if (res && res.status === 0 && res.data.customerList && res.data.customerList.failureList &&
  //               res.data.customerList.failureList.length > 0 && res.data.customerList.successList &&
  //               res.data.customerList.successList.length > 0) {
  //               this.failureRecords = res.data.customerList.failureList;
  //               this.failureRecords = this.failureRecords.concat(res.data.customerList.duplicateList);
  //               this.toastr.error('Partially failed in uploading, Please download log for reasons');
  //               this.fetchAllCustomers();
  //             } else if (res && res.status === 0 && res.data.customerList && res.data.customerList.failureList && res.data.customerList.failureList.length > 0) {
  //               this.failureRecords = res.data.customerList.failureList;
  //               this.failureRecords = this.failureRecords.concat(res.data.customerList.duplicateList);
  //               this.toastr.error('Failed in uploading, Please download log for reasons');
  //             } else if (res && res.status === 0 && res.data.customerList && res.data.customerList.failureList && res.data.customerList.failureList.length === 0) {
  //               if (res && res.status === 0 && res.data.customerList && res.data.customerList.duplicateList && res.data.customerList.duplicateList.length > 0) {
  //                 this.failureRecords = res.data.customerList.duplicateList;
  //                 this.toastr.error('Duplicates present in the excel, Please download log file.');
  //                 this.fetchAllCustomers();
  //               } else {
  //                 this.fetchAllCustomers();
  //                 this.toastr.success('Uploaded successfully');
  //                 this.failureRecords = [];
  //               }
  //             } else {
  //               this.toastr.error('Failed in uploading');
  //               this.failureRecords = [];
  //             }
  //           },
  //             error => { });
  //         }
  //       }
  //     }, 500);
  //   }
  // }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        const data1 = [];
        const logs = [];
        this.missingParams = null;
        let inValidRecord = false;
        const missingParamsArray = this.mandatoryCheckForHeaderLines(jsonData);
        if (missingParamsArray.length > 1) {
          this.failureRecords = missingParamsArray;
          this.missingParams = missingParamsArray.join(', ');
          this.toastr.error('Please download log file to fill mandatory fields');
        }
        else {
          jsonData.forEach((k, index) => {
            if (!k['customerName'] && k['type'] === 'shipToAddresses') {
              k['customerName'] = null;
              data1.push(this.getAllAddressessLinesData(k));
              inValidRecord = false
            }
            if (!k['customerID'] && k['type'] === 'shipToAddresses') {
              k['customerID'] = null;
              data1.push(this.getAllAddressessLinesData(k));
              inValidRecord = false
            }
            if (k['customerID']) {
              data1.push(this.getAllAddressessLinesData(k));
              inValidRecord = false
            } else if (!k['customerID']) {
            //  data1.push(this.getAllAddressessLinesData(k));
              if (data1.length > 0) {
                if (k['type'] && k['type'] == 'shipToAddresses') {
                  data1.push(this.getAllAddressessLinesData(k));
                } else {
                  data1[data1.length - 1]['allAddresses'].push(this.getCustomerHeaderData(k));
                }
              }
            } else {
              if (!k['customerID']) {
                inValidRecord = true;
                logs.push(this.getAllAddressessLinesData(k));
                const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_BY_CUSTOMER_HEADER;
                const missingParams = requiredParams.filter((param: any) => !(!!k[param]));
                if (missingParams.length > 0) {
                  missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', '\r\n')} \r\n`);
                }
                return;
              }
            }
          })
          let isValidAddress = true;
          if (data1.length > 0) {
            data1.forEach(r => {
              Object.keys(r).forEach((el, i) => {
                r[el] = typeof (r[el]) === 'string' ? r[el].trim() : r[el];
                if (r.allAddresses && r.allAddresses.length > 0) {
                  r.allAddresses.forEach(ele => {
                    Object.keys(ele).forEach((elr, i) => {
                      ele[elr] = typeof (ele[elr]) === 'string' ? ele[elr].trim() : ele[elr];
                    })
                  })
                }
              });
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r['gstNumber'] = r.GST;
             
              let a: any = []
              let b: any = []
              let c: any = []
              r.allAddresses.forEach(m => {
                if (m.defaultAddress !== true && m.defaultAddress !== false) {
                  isValidAddress = false;
                }
                if (m.type === 'shipToAddresses') {
                  delete m.type
                  a.push(m)
                } else if (m.type === 'shipFromAddresses') {
                  delete m.type
                  b.push(m)
                } else if (m.type === 'billToAddresses') {
                  delete m.type
                  c.push(m)
                }
              })
              if (a && a.length > 0) {
                r['shipToAddresses'] = a
              } else {
                r['shipToAddresses'] = null
              }
              if (b && b.length > 0) {
                r['shipFromAddresses'] = b
              } else {
                r['shipFromAddresses'] = null
              }
              if (c && c.length > 0) {
                r['billToAddresses'] = c
              } else {
                r['billToAddresses'] = null
              }
              delete r.allAddresses
            });
            if (!isValidAddress) {
              this.toastr.error('Failed In Uploading..Please downoad Log File for reason ');
              this.failureRecords = ['Default address Must be TRUE Or False.'];
              return;
            }
            this.excelRestService.saveCustomerBulkdata(data1).subscribe(res => {
              if (res && res.status === 0 && res.data.customerList && res.data.customerList.failureList &&
                res.data.customerList.failureList.length > 0 && res.data.customerList.successList &&
                res.data.customerList.successList.length > 0) {
                this.failureRecords = res.data.customerList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.customerList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllCustomers();
              } else if (res && res.status === 0 && res.data.customerList && res.data.customerList.failureList && res.data.customerList.failureList.length > 0) {
                this.failureRecords = res.data.customerList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.customerList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.customerList && res.data.customerList.failureList && res.data.customerList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.customerList && res.data.customerList.duplicateList && res.data.customerList.duplicateList.length > 0) {
                  this.failureRecords = res.data.customerList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllCustomers();
                } else {
                  this.fetchAllCustomers();
                  this.toastr.success('Uploaded successfully');
                  this.failureRecords = [];
                }
              } else {
                this.toastr.error('Failed in uploading');
                this.failureRecords = [];
              }
            },
              error => { });
          }
        }
      }, 500)
    }
  }
  getAllAddressessLinesData(k) {
    console.log(k);
    let customerobj = {}
    if (k) {
      customerobj['customerID'] = k ? k.customerID :  null,
      customerobj['customerName'] =  k ? k.customerName : null,
      customerobj['customerType'] = k.customerType ? k.customerType : null
      customerobj['leadTime'] = k.leadTime ? k.leadTime : null
      customerobj['latitude'] = k.latitude ? k.latitude : null
      customerobj['longitude'] = k.longitude ? k.longitude : null
      customerobj['creditPeriod'] = k.creditPeriod ? k.creditPeriod : null
      customerobj['GST'] = k.GST ? k.GST : null
      customerobj['panNumber'] = k.panNumber ? k.panNumber : null
      customerobj['taxType'] = k.taxType ? k.taxType : null
      customerobj['markupPercentage'] = k.markupPercentage ? k.markupPercentage : null
      customerobj['currency'] = k.currency ? k.currency : null
      customerobj['discountPercentage'] = k.discountPercentage ? k.discountPercentage : null
      customerobj['spocName'] = k.spocName ? k.spocName : null
      customerobj['spocPhoneNumber'] = k.spocPhoneNumber ? k.spocPhoneNumber : null
      customerobj['spocEmail'] = k.spocEmail ? k.spocEmail : null
      customerobj['bankName'] = k.bankName ? k.bankName : null
      customerobj['accountNumber'] = k.accountNumber ? k.accountNumber : null
      customerobj['accountHolderName'] = k.accountHolderName ? k.accountHolderName : null
      customerobj['accountType'] = k.accountType ? k.accountType : null
      customerobj['scCode'] = k.scCode ? k.scCode : null
      customerobj['bankAddress'] = k.bankAddress ? k.bankAddress : null
      customerobj['taxGroup'] = k.taxGroup ? k.taxGroup : null
      customerobj['serviceType'] = k.serviceType ? k.serviceType : null
      customerobj['termsOfPayment'] = k.termsOfPayment ? k.termsOfPayment : null
      customerobj["allAddresses"] = [this.getCustomerHeaderData(k)]
      return customerobj
    }
    else{
      customerobj['customerID'] = k ? k.customerID : null,
      customerobj['customerName'] =  k ?  k.customerName : null
      return customerobj
    }
  }
  getCustomerHeaderData(document?) {
    let addressobj={}
    console.log(document)
    if (document) {
      addressobj['customerID'] = document ? document.customerID : null,
      addressobj['customerName'] = document ? document.customerName :  null,
      addressobj['address'] = document.address ? document.address : null;
      addressobj['city'] = document.city ? document.city : null;
      addressobj['contactDetails'] = {
          'alternativePhoneNumber': document.alternativePhoneNumber ? document.alternativePhoneNumber : null,
          'phoneNumber': document.phoneNumber ? document.phoneNumber : null,
          'contactName': document.contactName ? document.contactName : null,
          'email': document.email ? document.email : null
      };
      addressobj['country'] = document.country ? document.country : null;
      addressobj['defaultAddress'] = document.defaultAddress ? document.defaultAddress : null;
      addressobj['state'] = document.state ? document.state : null;
      addressobj['name'] = document.name ? document.name : null;
      addressobj['type'] = document.type ? document.type : null;
      addressobj['pin'] = document.pin ? document.pin : null;
    }
    return addressobj
  }
  mapId(type, value) {
    switch (type) {
      case 'taxes': {
        const tax = this.taxGroups.find(w => w.taxGroup === value);
        return tax && tax ? tax : null;
      }
    }
  }
  mandatoryCheckForHeaderLines(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      let record = data[0];
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.CUSTOMER;
      const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
      if (missingParams.length > 0) {
        missingParamsArray.push(`Row No. ${1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
      }

    }
    return missingParamsArray;
  }


  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };
  dyanmicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement("a");
    }
    const element = this.setting.element.dynamicDownload;
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Customer Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}
