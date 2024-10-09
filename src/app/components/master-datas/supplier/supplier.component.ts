import { Component, OnInit, ViewChild, OnDestroy, EventEmitter, Output, AfterViewInit, } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { Util } from 'src/app/shared/utils/util';
import { ApexService } from '../../../shared/services/apex.service';
import { AppService } from '../../../shared/services/app.service';
import { Constants } from '../../../constants/constants';
import { MetaDataService } from '../../../services/integration-services/metadata.service';
import { WMSService } from '../../../services/integration-services/wms.service';
import { Subject, Subscription } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { WmsCommonService } from '../../../services/wms-common.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html'
})
export class SupplierComponent implements OnInit, AfterViewInit, OnDestroy {
  supplier: any;
  supplierForm: FormGroup;
  id: any = '';
  focusedElement: any;
  isReloadCustTable: any = false;
  countries: any = [];
  customerTypes: any = Constants.CUSTOMER_TYPES;
  currencies: any = [];
  productCategories: any = [];
  units: any = [];
  palletSizes: any = [];
  taxTypes: any = Constants.TAX_TYPES;
  supplierTypes: any = Constants.SUPPLIER_TYPES;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  suppliers: any[] = [];
  statuss: any = ['Active', 'InActive'];
  taxGroups: any = [];
  @Output() sendCustomer: any = new EventEmitter<any>();
  termsOfPayments: any = [];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isReadMode: any = false;
  deleteInfo: any;
  missingParams: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  isShowOrHideError: any = false;
  supplierKeys: any = ['S.No', 'Supplier ID', 'Supplier Name', 'Supplier','GST','Business Head Name', 'Business Head No', 'Business Head Email', 'SPOC Name',
    'SPOC No', 'SPOC Email', 'PAN', 'Bank Name', 'Account No', 'Account Holder Name', 'Account Type', 'IFSC Code', 'Bank Address',
     'Terms Of Payment', 'Supplier Type', 'Currency', 'Lead Time(Days)',
    'Credit Period (Days)', 'UOM', 'Bill Period', 'Rate', 'Rate Per Polycover', 'Rate Per Label', 'Rate Per Carbon box', 'Contract Strate Date', 'Contract End Date',
    'firstName', 'lastName', 'userID', 'emailID', 'Status', 'Action'];

  failureRecords: any[] = [];
  termOfPayments: any;
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Supplier', Storage.getSessionUser());
  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;
  // addValuesCheck: boolean = false;
  statesData: any = [];
  statesList: any = [];
  selectedAddress: any = 'Ship to Address';
  shipToAddresses: FormArray;
  shipFromAddresses: FormArray;
  billToAddresses: FormArray;
  addressKeys =[{name:'Ship to Address',key :'shipToAddresses'},
  {name:'Ship from Address',key :'shipFromAddresses'},
  {name:'Bill to Address',key :'billToAddresses'}]
  constructor(
    public ngxSmartModalService: NgxSmartModalService,
    private excelService: ExcelService, private fb: FormBuilder,
    private wmsService: WMSService, private configService: ConfigurationService,
    private metaDataService: MetaDataService,
    private commonMasterDataService: CommonMasterDataService,
    private wmsCommonService: WmsCommonService,
    private appService: AppService,
    private util: Util,
    private excelRestService: ExcelRestService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {
    this.translate.use(this.language);

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
    /*   this.forPermissionsSubscription= this.configService.forPermissions$.subscribe(data => {
         if (data) {
           this.formObj = this.configService.getGlobalpayload();
           this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Supplier', Storage.getSessionUser());
           this.getFunctionsCall();
         }
       }) */
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createSupplierForm();
      this.fetchAllTaxGroups();
      this.fetchAllCountries();
      this.getAllCurrencies();
      this.fetchAllStates();
      this.fetchAllUnits();
      this.fetchAllSupplierDetails();
      this.fetchAllSupplierDetailsByID();
      this.fetchAllTermOfPayments();
    }
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
      let keys = this.addressKeys.find(k=>k.name == this.selectedAddress).key
      const select = selected ? selected : keys;
      this[select] = <FormArray>this.supplierForm.controls[select];
      this[select].push(this.createShipTOArray(ele ? ele : null));
    }
    else {
      this.toastr.error("user doesnt have permission")
    }
  }
  removeShipToLine(index, array) {
    if (this.permissionsList.includes('Delete')) {
      this[array] = <FormArray>this.supplierForm.controls[array];
      this[array].removeAt(index)
    }
    else {
      this.toastr.error("user doesnt have permission")
    }

  }
  getDefaultEvent(event, array, i) {
    this[array] = <FormArray>this.supplierForm.controls[array];
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
  selectedAddressMethod() {
    const addressForm = this.supplierForm.value;
    switch (this.selectedAddress) {
      case 'Ship to Address': {
        if (addressForm.shipToAddresses.length) {
          addressForm.shipToAddresses.forEach((ele, i) => {
            if (addressForm.shipToAddresses.length != 1 && !ele.name) {
              this['shipToAddresses'] = <FormArray>this.supplierForm.controls['shipToAddresses'];
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
              this['shipFromAddresses'] = <FormArray>this.supplierForm.controls['shipFromAddresses'];
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
              this['billToAddresses'] = <FormArray>this.supplierForm.controls['billToAddresses'];
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
      this.supplier = this.supplierForm.value;
      this.supplier.poExpiryDate = this.supplier.poExpiryDate ? new Date(this.supplier.poExpiryDate) : null;
      this.supplierForm.value.supplierFirstName = this.supplierForm.value.supplierFirstName ? this.supplierForm.value.supplierFirstName : null
      this.supplierForm.value.supplierEmailID = this.supplierForm.value.supplierEmailID ? this.supplierForm.value.supplierEmailID : null
      this.supplierForm.value.supplierUserID = this.supplierForm.value.supplierUserID ? this.supplierForm.value.supplierUserID : null
      this.supplierForm.value.supplierLastName = this.supplierForm.value.supplierLastName ? this.supplierForm.value.supplierLastName : null
      this.supplierForm.value.supplierPassword = this.supplierForm.value.supplierPassword ? this.supplierForm.value.supplierPassword : null
      if (this.id) {
        this.supplier['organizationInfo'] = this.configService.getOrganization();
        this.supplier['wareHouseInfo'] = this.configService.getWarehouse();
      }
      const finalSupplierMasterData = Object.assign({}, this.supplier);
      if (this.id) { finalSupplierMasterData._id = this.id; }
      finalSupplierMasterData['organizationInfo'] = this.configService.getOrganization();
      finalSupplierMasterData['wareHouseInfo'] = this.configService.getWarehouse();
      finalSupplierMasterData.shipToAddresses = (finalSupplierMasterData.shipToAddresses && finalSupplierMasterData.shipToAddresses.length > 0) ? finalSupplierMasterData.shipToAddresses : null;
      finalSupplierMasterData.shipFromAddresses = (finalSupplierMasterData.shipFromAddresses && finalSupplierMasterData.shipFromAddresses.length > 0) ? finalSupplierMasterData.shipFromAddresses : null;
      finalSupplierMasterData.billToAddresses = (finalSupplierMasterData.billToAddresses && finalSupplierMasterData.billToAddresses.length > 0) ? finalSupplierMasterData.billToAddresses : null;
      if (finalSupplierMasterData.shipToAddresses && finalSupplierMasterData.shipToAddresses.find(x => x.defaultAddress) || !finalSupplierMasterData.shipToAddresses) {
        if (finalSupplierMasterData.shipFromAddresses && finalSupplierMasterData.shipFromAddresses.find(x => x.defaultAddress) || !finalSupplierMasterData.shipFromAddresses) {
          if (finalSupplierMasterData.billToAddresses && finalSupplierMasterData.billToAddresses.find(x => x.defaultAddress) || !finalSupplierMasterData.billToAddresses) {
            this.saveContinution(finalSupplierMasterData);
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
    this.readOnlyUserPanel = false;
    this.globalIDs = null
  }
  saveContinution(finalSupplierMasterData) {
    this.wmsService.saveSupplierMasterData(JSON.stringify(finalSupplierMasterData)).subscribe(
      (response) => {
        if (response.status === 0) {
          this.id = '';
          this.isReadMode = false;
          this.createSupplierForm();
          // this.supplierForm.reset();
          // if (this.supplierForm.value.shipToAddresses.length) {
          //   for (let i = 0; i < this.supplierForm.value.shipToAddresses.length; i++) {
          //     this.removeShipToLine(i, 'shipToAddresses');
          //   }
          // }
          this.selectedAddress = 'Ship to Address';
          // this.addShipToLine();
          if (this.appService.getParam('id')) {
            this.appService.navigate('/masterdata/supplier', null);
          }
          this.fetchAllSupplierDetails();
          this.toastr.success(response.statusMsg);
          //  this.toastr.success('Supplier inserted successfully');
        } else if (response && response.status === 2 && response.statusMsg) {
          this.toastr.error(response.statusMsg);
          this.supplierForm.value.supplierFirstName = this.supplierForm.value.supplierFirstName ? this.supplierForm.value.supplierFirstName : null
          this.supplierForm.value.supplierEmailID = this.supplierForm.value.supplierEmailID ? this.supplierForm.value.supplierEmailID : null
          this.supplierForm.value.supplierUserID = this.supplierForm.value.supplierUserID ? this.supplierForm.value.supplierUserID : null
          this.supplierForm.value.supplierLastName = this.supplierForm.value.supplierLastName ? this.supplierForm.value.supplierLastName : null
          this.supplierForm.value.supplierPassword = this.supplierForm.value.supplierPassword ? this.supplierForm.value.supplierPassword : null

        } else {
          this.toastr.error(response.statusMsg);

          this.fetchAllSupplierDetails();
          // this.toastr.error('Failed in updating Supplier details');
        }
      },
      (error) => {
        this.toastr.success('Failed in inserting supplier Details');
      });
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  readOnlyUserPanel: boolean = false;
  globalIDs:any;
  edit(supplier: any) {
    this.globalIDs = supplier._id;
    let arr = [];
    if (this.statesData.length) {
      this.statesData.forEach(element => {
        arr = [...arr, ...element.stateNames];
      });
    }
    this.statesList = [...new Set(arr)];
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      // if (this.supplierForm.value.shipToAddresses.length) {
      //   for (let i = 0; i < this.supplierForm.value.shipToAddresses.length; i++) {
      //     this.removeShipToLine(i, 'shipToAddresses');
      //   }
      // }
      // if (this.supplierForm.value.shipFromAddresses.length) {
      //   for (let i = 0; i < this.supplierForm.value.shipFromAddresses.length; i++) {
      //     this.removeShipToLine(i, 'shipFromAddresses');
      //   }
      // }
      // if (this.supplierForm.value.billToAddresses.length) {
      //   for (let i = 0; i < this.supplierForm.value.billToAddresses.length; i++) {
      //     this.removeShipToLine(i, 'billToAddresses');
      //   }
      // }
      this.createSupplierForm('clearAll');
      window.scroll(0, 0);
      supplier.poExpiryDate = this.wmsCommonService.getDateFromMilliSec(supplier.poExpiryDate);
      supplier.contractStartDate = this.wmsCommonService.getDateFromMilliSec(supplier.contractStartDate);
      supplier.contractEndDate = this.wmsCommonService.getDateFromMilliSec(supplier.contractEndDate);

      this.id = supplier._id;
      this.isReadMode = true;
      this.supplier = supplier;
      if (!supplier.shipToAddresses) {
        supplier.shipToAddresses = []
      }
      if (!supplier.shipFromAddresses) {
        supplier.shipFromAddresses = []
      }
      if (!supplier.billToAddresses) {
        supplier.billToAddresses = []
      }
      if (!supplier.taxGroup) {
        supplier.taxGroup = []
      }
      this.supplierForm.patchValue(supplier);
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
      //  this.readOnlyUserPanel = true;
      this.readOnlyUpdateFields(supplier);
      this.selectedAddress = 'Ship to Address';
      if (supplier.shipToAddresses && supplier.shipToAddresses.length) {
        supplier.shipToAddresses.forEach(element => {
          this.addShipToLine(element, 'shipToAddresses')
        });
      }
      if (supplier.shipFromAddresses && supplier.shipFromAddresses.length) {
        supplier.shipFromAddresses.forEach(element => {
          this.addShipToLine(element, 'shipFromAddresses')
        });
      }
      if (supplier.billToAddresses && supplier.billToAddresses.length) {
        supplier.billToAddresses.forEach(element => {
          this.addShipToLine(element, 'billToAddresses')
        });
      }
    }
    else if (this.permissionsList.includes('View')) {
      this.makeReadOnly = true;
      this.makeThisDisabled = true;
      window.scroll(0, 0);
      this.supplierForm.patchValue(supplier);
      this.supplierForm.disable();
    }
    else {

    }
  }
  readOnlyUpdateFields(supplier) {
    console.log(supplier.supplierFirstName);
    if (supplier.supplierFirstName != null) {
      this.readOnlyUserPanel = true;
    }
    else if (supplier.supplierFirstName == null) {
      this.readOnlyUserPanel = false;
    }
  }
  getSupplierIDName() {
    this.supplierForm.controls.supplierIDName.setValue(`${this.supplierForm.value.supplierID}:${this.supplierForm.value.supplierName}`);
  }
  downloadExcelFile() {
    this.suppliers.forEach(el => {
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
    const data = this.excelService.formatJSONForHeaderLines(this.suppliers, 'allAddresses');
    const changedSupplierList = this.exportTypeMethod(data)
    this.excelService.exportAsExcelFile(changedSupplierList, 'Suppliers', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['supplierID'] = k.finishedSupplierID
        obj['supplierName'] = k.supplierName
        obj['serviceType'] = k.serviceType
        obj['GST'] = k.gstNumber
        obj['businessHeadName'] = k.businessHeadName
        obj['businessHeadNumber'] = k.businessHeadNumber
        obj['businessHeadEmail'] = k.businessHeadEmail
        obj['spocName'] = k.spocName
        obj['spocNumber'] = k.spocNumber
        obj['spocEmail'] = k.spocEmail
        obj['pan'] = k.pan
        obj['panNumber'] = k.panNumber
        obj['bankName'] = k.bankName
        obj['accountNumber'] = k.accountNumber
        obj['accountHolderName'] = k.accountHolderName
        obj['accountType'] = k.accountType
        obj['ifscCode'] = k.ifscCode
        obj['bankAddress'] = k.bankAddress
        obj['supplierType'] = k.supplierType
        if (k.taxGroup) {
          obj['taxGroup'] = k.taxGroup.taxGroup
        } else {
          obj['taxGroup'] = null
        }
        obj['daysRequiredToSupply'] = k.daysRequiredToSupply
        obj['leadTime'] = k.leadTime
        obj['creditPeriod'] = k.creditPeriod
        obj['termsOfPayment'] = k.termsOfPayment
        obj['currency'] = k.currency
        obj['taxType'] = k.taxType
        obj['period'] = k.period
        obj['rate'] = k.rate
        obj['ratePerLabel'] = k.ratePerLabel
        obj['ratePerCarbonBox'] = k.ratePerCarbonBox
        obj['supplierEmailID'] = k.supplierEmailID
        obj['supplierFirstName'] = k.supplierFirstName
        obj['supplierLastName'] = k.supplierLastName
        obj['supplierUserID'] = k.supplierUserID
        obj['supplierPassword'] = k.supplierPassword
        obj['uom'] = k.uom
        obj['period'] = k.period
        obj['rateperPolycover'] = k.ratePerPolycover
        obj['contractstartdate'] = k.contractStartDate
        obj['contractenddate'] = k.contractEndDate
        obj['type'] = k.type
        obj['name'] = k.name
        obj['email'] = k.email
        obj['address'] = k.address
        obj['city'] = k.city
        obj['state'] = k.state
        obj['pin'] = k.pin
        obj['phoneNumber'] = k.contactDetails.phoneNumber
        obj['alternativePhoneNumber'] = k.contactDetails.alternativePhoneNumber
        obj['contactName'] = k.contactDetails.contactName
        obj['country'] = k.country
        obj['defaultAddress'] = k.defaultAddress
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['supplierID'] = null
      obj['supplierName'] = null
      obj['serviceType'] = null
      obj['GST'] = null
      obj['businessHeadName'] = null
      obj['businessHeadNumber'] = null
      obj['businessHeadEmail'] = null
      obj['spocName'] = null
      obj['spocNumber'] = null
      obj['spocEmail'] = null
      obj['pan'] = null
      obj['panNumber'] = null
      obj['bankName'] = null
      obj['accountNumber'] = null
      obj['accountHolderName'] = null
      obj['accountType'] = null
      obj['ifscCode'] = null
      obj['bankAddress'] = null
      obj['supplierType'] = null
      obj['taxGroup'] = null
      obj['daysRequiredToSupply'] = null
      obj['leadTime'] = null
      obj['creditPeriod'] = null
      obj['termsOfPayment'] = null
      obj['currency'] = null
      obj['taxType'] = null
      obj['period'] = null
      obj['rate'] = null
      obj['ratePerLabel'] = null
      obj['ratePerCarbonBox'] = null
      obj['supplierEmailID'] = null
      obj['supplierFirstName'] = null
      obj['supplierLastName'] = null
      obj['supplierUserID'] = null
      obj['supplierPassword'] = null
      obj['uom'] = null
      obj['period'] = null
      obj['rateperPolycover'] = null
      obj['contractstartdate'] = null
      obj['contractenddate'] = null
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
  fetchAllSupplierDetailsByID() {
    if (this.appService.getParam('id')) {
      this.wmsService.fetchSupplierDetailsById(this.appService.getParam('id'), this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.supplierMaster) {
            this.supplier = response.data.supplierMaster;
            this.id = this.supplier._id;
            this.supplier.poExpiryDate = this.wmsCommonService.getDateFromMilliSec(this.supplier.poExpiryDate);
            this.supplierForm.patchValue(this.supplier);
          }
        },
        (error) => {
        });
    }
  }
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
          this.rerender();
        }
      },
      (error) => {
        this.suppliers = [];
      });
  }
  fetchAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.units && response.data.units.length) {
          this.units = response.data.units;
          console.log(this.units)
        }
        else {
          this.units = [];
        }
      },
      error => {
        this.units = [];
      });
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
  fetchAllTaxGroups() {
    this.metaDataService.fetchAllTaxGroups(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0) {
          this.taxGroups = response.data.taxGroups;
        }
      },
      (error) => {
        this.taxGroups = [];
      });
  }


  fetchAllTermOfPayments() {
    this.metaDataService.fetchAllTermOfPayments(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.termsOfPayments && response.data.termsOfPayments.length) {
          this.termOfPayments = response.data.termsOfPayments;
        }
        else {
          this.termOfPayments = [];
        }
      },
      error => {
        this.termOfPayments = [];
      });
  }

  fetchAllTaxTypesByCountryId(selectedTaxGroup) {
    this.taxGroups.forEach(taxGroup => {
      if (taxGroup.taxGroup === selectedTaxGroup) {
      }
    });
    // this.metaDataService.fetchAllTaxTypesByCountryId(countryId).subscribe(
    //   (response) => {
    //     if (!!response && response.status === 0) {
    //       this.taxGroups = response.data.taxGroups;
    //     }
    //   },
    //   (error) => {
    //     this.taxGroups = [];
    //   });
  }
  createSupplierForm(key?) {
    this.supplierForm = new FormBuilder().group({
      supplierID: [null, Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      supplierName: [null, Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      supplierIDName: [null],
      poExpiryDate: [null],
      supplierType: [null, Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      serviceType: [null],
      taxGroup: new FormBuilder().group({
        taxGroup: [null, Validators.compose([null, , Validators.maxLength(99)])],
      }),
      daysRequiredToSupply: [null],
      creditPeriod: [null],
      leadTime: [null, Validators.compose([null, , Validators.maxLength(99)])],
      termsOfPayment: [null, Validators.compose([null, Validators.maxLength(99)])],
      taxType: [null, Validators.compose([null, Validators.maxLength(99)])],
      currency: [null, Validators.compose([null, Validators.maxLength(99)])],
      bankName: [null, Validators.compose([null, Validators.maxLength(99)])],
      accountNumber: [null, Validators.compose([null, Validators.maxLength(99)])],
      accountHolderName: [null, Validators.compose([null, Validators.maxLength(99)])],
      accountType: [null, Validators.compose([null, Validators.maxLength(99)])],
      ifscCode: [null, Validators.compose([null, Validators.maxLength(99)])],
      bankAddress: [null, Validators.compose([null, Validators.maxLength(99)])],
      pan: [null],
      panNumber: [null],
      gstNumber: null,
      businessHeadName: [null],
      businessHeadNumber: [null],
      businessHeadEmail: [null],
      spocName: [null],
      spocNumber: [null],
      spocEmail: [null],
      // address1: [null, Validators.compose([null, Validators.maxLength(99)])],
      // address2: [null],
      // country: [null, Validators.compose([null, Validators.maxLength(99)])],
      // state: [null, Validators.compose([null, Validators.maxLength(99)])],
      // city: [null, Validators.compose([null, Validators.maxLength(99)])],
      // pin: [null, Validators.compose([null, Validators.maxLength(99)])],
      // phoneNumber: [null, Validators.compose([null, Validators.maxLength(99)])],
      // email: [null, Validators.compose([null, Validators.maxLength(99)])],
      status: ['Active', Validators.compose([null, Validators.maxLength(99)])],
      uom: [null],
      period: [null],
      rate: [null],
      ratePerPolycover: [null],
      ratePerLabel: [null],
      ratePerCarbonBox: [null],
      contractStartDate: [null],
      contractEndDate: [null],
      supplierFirstName: [null],
      supplierLastName: [null],
      supplierUserID: [null],
      supplierEmailID: [null],/* Email Chamges */
      supplierPassword: [null],
      "organizationInfo": {
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      },
      "wareHouseInfo": {
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      },
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
      return this.supplierForm.controls[fieldName].valid && this.supplierForm.controls[fieldName].touched;
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
    //  this.forPermissionsSubscription.unsubscribe();
  }
  clear() {
    // if (this.supplierForm.value.shipToAddresses.length) {
    //   for (let i = 0; i < this.supplierForm.value.shipToAddresses.length; i++) {
    //     this.removeShipToLine(i, 'shipToAddresses');
    //   }
    // }
    this.readOnlyUserPanel = false;
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.createSupplierForm();
    this.selectedAddress = 'Ship to Address';
    this.supplierForm.get('status').setValue('Active');
    this.isReadMode = false;
    this.supplierForm.enable();
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'Supplier', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllSupplierDetails();
    }
  }
  getFile() {
    document.getElementById('upfile').click();
  }

  // uploadExcel = async (event) => {
  //   if (event.target.files && event.target.files[0]) {
  //     this.failureRecords = [];
  //     this.isShowOrHideError = false;
  //     await this.excelService.generateJsonUsingExcel(event);
  //     setTimeout(() => {
  //       const jsonData = this.excelService.getJsonData();
  //       const endArray = [];
  //       event.target.value = '';
  //       const missingParamsArray = this.mandatoryCheck(jsonData);
  //       if (missingParamsArray.length > 1) {
  //         this.failureRecords = missingParamsArray;
  //         this.toastr.error('Please download log file to fill mandatory fields');
  //       } else {
  //         const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.SUPPLIER);
  //         reqData.forEach(r => {
  //           r['organizationInfo'] = this.configService.getOrganization();
  //           r['wareHouseInfo'] = this.configService.getWarehouse();
  //           r['gstNumber'] = r.GST;
  //         });
  //         this.excelRestService.saveSupplierBulkdata(reqData).subscribe(res => {
  //           if (res && res.status === 0 && res.data.supplierMasterList && res.data.supplierMasterList.failureList &&
  //             res.data.supplierMasterList.failureList.length > 0 && res.data.supplierMasterList.successList &&
  //             res.data.supplierMasterList.successList.length > 0) {
  //             this.failureRecords = res.data.supplierMasterList.failureList;
  //             this.failureRecords = this.failureRecords.concat(res.data.supplierMasterList.duplicateList);
  //             this.toastr.error('Partially failed in uploading, Please download log for reasons');
  //             this.fetchAllSupplierDetails();
  //           } else if (res && res.status === 0 && res.data.supplierMasterList && res.data.supplierMasterList.failureList && res.data.supplierMasterList.failureList.length > 0) {
  //             this.failureRecords = res.data.supplierMasterList.failureList;
  //             this.failureRecords = this.failureRecords.concat(res.data.supplierMasterList.duplicateList);
  //             this.toastr.error('Failed in uploading, Please download log for reasons');
  //           } else if (res && res.status === 0 && res.data.supplierMasterList && res.data.supplierMasterList.failureList && res.data.supplierMasterList.failureList.length === 0) {
  //             if (res && res.status === 0 && res.data.supplierMasterList && res.data.supplierMasterList.duplicateList && res.data.supplierMasterList.duplicateList.length > 0) {
  //               this.failureRecords = res.data.supplierMasterList.duplicateList;
  //               this.toastr.error('Duplicates present in the excel, Please download log file.');
  //               this.fetchAllSupplierDetails();
  //             } else {
  //               this.fetchAllSupplierDetails();
  //               this.toastr.success('Uploaded successfully');
  //               this.fetchAllSupplierDetails();
  //               this.failureRecords = [];
  //             }
  //           } else {
  //             this.toastr.error('Failed in uploading');
  //             this.failureRecords = [];
  //           }
  //         },
  //           error => { });

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
            if(k.panNumber){
              k['pan'] = k.pan
            }
            else{
              k['pan'] = null
            }
            if(k.panNumber){
              k['panNumber'] = k.panNumber
            }
            else{
            k['panNumber'] = null
            }
            if (!k['supplierName'] && k['type'] === 'shipToAddresses') {
              k['supplierName'] = null;
              data1.push(this.getAllAddressessLinesData(k));
              inValidRecord = false
            }
            if (!k['supplierID'] && k['type'] === 'shipToAddresses') {
              k['supplierID'] = null;
              data1.push(this.getAllAddressessLinesData(k));
              inValidRecord = false
            }
            if (k['supplierID']) {
              data1.push(this.getAllAddressessLinesData(k));
              inValidRecord = false
            } else if (!k['supplierID'] || k['type'] ==='shipToAddresses') {
              if (data1.length > 0) {
                data1[data1.length - 1]['allAddresses'].push(this.getSupplierHeaderData(k))
              }
            } else {
              if (!k['supplierID']) {
                inValidRecord = true;
                logs.push(this.getAllAddressessLinesData(k));
                const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.SUPPLIER;
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
              console.log(r);
              
             
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
              r.daysRequiredToSupply = r.daysRequiredToSupply ? r.daysRequiredToSupply.toString():null
              console.log(r)
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
            console.log(data1)
            this.excelRestService.saveSupplierBulkdata(data1).subscribe(res => {
              if (res && res.status === 0 && res.data.supplierMasterList && res.data.supplierMasterList.failureList &&
                res.data.supplierMasterList.failureList.length > 0 && res.data.supplierMasterList.successList &&
                res.data.supplierMasterList.successList.length > 0) {
                this.failureRecords = res.data.supplierMasterList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.supplierMasterList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllSupplierDetails();
              } else if (res && res.status === 0 && res.data.supplierMasterList && res.data.supplierMasterList.failureList && res.data.supplierMasterList.failureList.length > 0) {
                this.failureRecords = res.data.supplierMasterList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.supplierMasterList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.supplierMasterList && res.data.supplierMasterList.failureList && res.data.supplierMasterList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.supplierMasterList && res.data.supplierMasterList.duplicateList && res.data.supplierMasterList.duplicateList.length > 0) {
                  this.failureRecords = res.data.supplierMasterList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllSupplierDetails();
                } else {
                  this.fetchAllSupplierDetails();
                  this.toastr.success('Uploaded successfully');
                  this.fetchAllSupplierDetails();
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
    return {
      'supplierID': k.supplierID ? k.supplierID :null,
      'supplierName': k.supplierName,
      'serviceType': k.serviceType,
      'GST': k.gstNumber,
      'businessHeadName': k.businessHeadName,
      'businessHeadNumber': k.businessHeadNumber,
      'businessHeadEmail': k.businessHeadEmail,
      'spocName': k.spocName,
      'spocNumber': k.spocNumber,
      'spocEmail': k.spocEmail,
      'pan': k.pan,
      'panNumber': k.panNumber,
      'bankName': k.bankName,
      'accountNumber': k.accountNumber,
      'accountHolderName': k.accountHolderName,
      'accountType': k.accountType,
      'ifscCode': k.ifscCode,
      'bankAddress': k.bankAddress,
      'supplierType': k.supplierType,
      'taxGroup': this.mapId("taxes", k.taxGroup),
      'daysRequiredToSupply': k.daysRequiredToSupply,
      'leadTime': k.leadTime,
      'creditPeriod': k.creditPeriod,
      'termsOfPayment': k.termsOfPayment,
      'currency': k.currency,
      'taxType': k.taxType,
      'rate': k.rate,
      'ratePerLabel': k.ratePerLabel,
      'ratePerCarbonBox': k.ratePerCarbonBox,
      'supplierEmailID': k.supplierEmailID,
      'supplierFirstName': k.supplierFirstName,
      'supplierLastName': k.supplierLastName,
      'supplierUserID': k.supplierUserID,
      'supplierPassword': k.supplierPassword,
      'uom': k.uom,
      "period": k.period,
      'rateperPolycover': k.ratePerPolycover,
      'contractstartdate': k.contractStartDate,
      'contractenddate': k.contractEndDate,
      "allAddresses": [this.getSupplierHeaderData(k)]
    }
  }
  getSupplierHeaderData(document?) {
    if (document) {
      return {
        "address": document.address,
        "city": document.city,
        "contactDetails": {
          "alternativePhoneNumber": document.alternativePhoneNumber,
          "phoneNumber": document.phoneNumber,
          "contactName": document.contactName,
          "email": document.email,
        },
        "country": document.country,
        "defaultAddress": document.defaultAddress,
        "state": document.state,
        "name": document.name,
        "type": document.type,
        "pin": document.pin,
      }
    }
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
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.SUPPLIER;
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
    if (this.missingParams) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Manditory Field Missing",
        text: `Please add missing fields :` + this.missingParams.toString().replace(/,/g, '\n')
      });
    }
    else if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Supplier Uploading  Error Reasons",
        text: `Please check the Errors :` + this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }

}
