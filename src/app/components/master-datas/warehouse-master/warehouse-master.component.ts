import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { WareHouseEntity } from '../../../entities/wareHouseMasterData.entity';
import { ApexService } from '../../../shared/services/apex.service';
import { Subject } from 'rxjs/Subject';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { FormArray, FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { AppService } from '../../../shared/services/app.service';
import { Constants } from '../../../constants/constants';
import { DataTableDirective } from 'angular-datatables';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { CompleterData, CompleterService } from 'ng2-completer';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '../../../shared/utils/storage';

@Component({
  selector: 'app-warehouse-master',
  templateUrl: './warehouse-master.component.html'
})
export class WarehouseMasterComponent implements OnInit, OnDestroy {
  @ViewChild('WHForm') WHForm: NgForm;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  warehouses: any[] = [];
  wareHouseDetails: any;
  storageTypes: any[] = [];
  focusedElement: any;

  statuss: any = ['Active', 'In Active'];
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  isReadMode: any = false;
  missingParams: any;
  isShowOrHideError: any = false;
  failureRecords: any = [];
  storageTypeIDs: CompleterData;
  storageTypeValues: CompleterData;
  orgData: any = [];
  orgIDNames: CompleterData;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Warehouse', Storage.getSessionUser());
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  statesData: any = [];
  statesList: any = [];
  addressKeys = [{ name: 'Ship to Address', key: 'shipToAddresses' },
  { name: 'Ship from Address', key: 'shipFromAddresses' },
  { name: 'Bill to Address', key: 'billToAddresses' }]
  // shipToAddresses: any = [];
  // shipFromAddresses: any = [];
  // billToAddresses: any = [];
  selectedAddress: any = 'Ship to Address';
  addressGroup: FormGroup;
  shipToAddresses: FormArray;
  shipFromAddresses: FormArray;
  billToAddresses: FormArray;


  constructor(private apexService: ApexService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService, private fb: FormBuilder,
    private excelService: ExcelService,
    private appService: AppService,
    private toastr: ToastrService,
    private excelRestService: ExcelRestService,
    private commonMasterDataService: CommonMasterDataService,
    private metaDataService: MetaDataService,
    private commonService: CommonService, private completerService: CompleterService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    console.log(this.language);
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
    this.role = Storage.getSessionUser().authorities[0].authority;
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      console.log(this.language);
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    if ((this.role == 'ROLE_CLIENT' || this.role == 'ROLE_SUPER_ADMIN') && this.permissionsList.length == 0) {
      this.permissionsList = ['View', 'Update', 'Delete'];
    }
    this.getFunctionCalls();

  }
  getFunctionCalls() {
    if (this.permissionsList.includes('View')) {
      this.wareHouseDetails = new WareHouseEntity();
      this.createForm();
      // this.addShipToLine('shipToAddresses');
      // this.addShipToLine('shipFromAddresses');
      // this.addShipToLine('billToAddresses');
      this.fetchAllWarehouseDetails();
      this.fetchAllStorageTypes();
      this.fetchAllOrganizations();
      this.fetchAllCountries();
      this.fetchAllStates();
      this.apexService.getPanelIconsToggle();
      this.fetchWareHouseDetailsByID();
    }
  }
  createForm(key?) {
    this.addressGroup = this.fb.group({
      shipToAddresses: this.fb.array(key ? [] : [this.createShipTOArray()]),
      shipFromAddresses: this.fb.array([]),
      billToAddresses: this.fb.array([])
    })
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
      this[select] = <FormArray>this.addressGroup.controls[select];
      this[select].push(this.createShipTOArray(ele ? ele : null));
    }
    else {
      this.toastr.error("user doesnt have permission")
    }
  }
  removeShipToLine(index, array) {
    if (this.permissionsList.includes('Delete')) {
      this[array] = this.addressGroup.controls[array] as FormArray;
      this[array].removeAt(index);
    }
    else {
      this.toastr.error("user doesnt have permission")
    }

  }
  getDefaultEvent(event, array, i) {
    this[array] = <FormArray>this.addressGroup.controls[array];
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
    const addressForm = this.addressGroup.value;
    switch (this.selectedAddress) {
      case 'Ship to Address': {
        if (addressForm.shipToAddresses.length) {
          addressForm.shipToAddresses.forEach((ele, i) => {
            if (addressForm.shipToAddresses.length != 1 && !ele.name) {
              this['shipToAddresses'] = <FormArray>this.addressGroup.controls['shipToAddresses'];
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
              this['shipFromAddresses'] = <FormArray>this.addressGroup.controls['shipFromAddresses'];
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
              this['billToAddresses'] = <FormArray>this.addressGroup.controls['billToAddresses'];
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
  getWareHouseIDName() {
    this.WHForm.controls.wareHouseIDName.setValue
      (`${this.WHForm.value.wareHouseID}:${this.WHForm.value.wareHouseName}`);
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.warehouses = response.data.wareHouses;
          this.rerender();
        } else {
          this.warehouses = [];
        }
      },
      (error) => {
        this.warehouses = [];
      });
  }
  makeThisDisabled: boolean = false;
  makeReadOnly: boolean = false;
  editWHDetails(details: any) {
    let arr = [];
    if (this.statesData.length) {
      this.statesData.forEach(element => {
        arr = [...arr, ...element.stateNames];
      });
    }
    this.statesList = [...new Set(arr)];
    console.log(this.statesList);
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.createForm('clearAll');
      this.makeThisDisabled = false;
      this.makeReadOnly = false;
      if (!details.organizationInfo) {
        details.organizationInfo = {
          "_id": null,
          "organizationID": null,
          "organizationName": null,
          "organizationIDName": null
        }
      }
      this.isReadMode = true;
      this.wareHouseDetails = Object.assign({}, details);
      this.selectedAddress = 'Ship to Address';
      if (details.shipToAddresses && details.shipToAddresses.length) {
        details.shipToAddresses.forEach(element => {
          this.addShipToLine(element, 'shipToAddresses')
        });
      }
      if (details.shipFromAddresses && details.shipFromAddresses.length) {
        details.shipFromAddresses.forEach(element => {
          this.addShipToLine(element, 'shipFromAddresses')
        });
      }
      if (details.billToAddresses && details.billToAddresses.length) {
        details.billToAddresses.forEach(element => {
          this.addShipToLine(element, 'billToAddresses')
        });
      }

      // this.shipToAddresses = [];
      // this.shipFromAddresses = [];
      // this.billToAddresses = [];
      // if (details.shipToAddresses && details.shipToAddresses.length) {
      //   // details.shipToAddresses.forEach(el => {
      //   //   this.shipToAddresses.push(this.createShipTOArray(el));
      //   // });
      //   this.shipToAddresses = details.shipToAddresses;
      // }
      // if (details.shipFromAddresses && details.shipFromAddresses.length) {
      //   this.shipFromAddresses = details.shipFromAddresses;
      // }
      // if (details.billToAddresses && details.billToAddresses.length) {
      //   this.billToAddresses = details.billToAddresses;
      // }
      window.scroll(0, 0);
    }
    else if (this.permissionsList.includes('View')) {
      this.makeThisDisabled = true;
      this.makeReadOnly = true;
      this.wareHouseDetails = Object.assign({}, details);
      window.scroll(0, 0);

    }
  }
  save(WHForm: NgForm) {
    if ((this.permissionsList.includes("Update") && this.wareHouseDetails._id) || (this.permissionsList.includes("Create") && !this.wareHouseDetails._id)) {
      const form = this.wareHouseDetails
      if (!form.organizationInfo.organizationIDName) {
        form.organizationInfo = null;
      }
      const arr = this.addressGroup.value;
      form.shipToAddresses = (arr.shipToAddresses && arr.shipToAddresses.length > 0) ? arr.shipToAddresses : null;
      form.shipFromAddresses = (arr.shipFromAddresses && arr.shipFromAddresses.length > 0) ? arr.shipFromAddresses : null;
      form.billToAddresses = (arr.billToAddresses && arr.billToAddresses.length > 0) ? arr.billToAddresses : null;
      if (form.shipToAddresses && form.shipToAddresses.find(x => x.defaultAddress) || !form.shipToAddresses) {
        if (form.shipFromAddresses && form.shipFromAddresses.find(x => x.defaultAddress) || !form.shipFromAddresses) {
          if (form.billToAddresses && form.billToAddresses.find(x => x.defaultAddress) || !form.billToAddresses) {
            Object.keys(form).forEach((el, i) => {
              form[el] = typeof (form[el]) === 'string' ? form[el].trim() : form[el];
            })
            this.saveContinution(WHForm, form);
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
  }
  saveContinution(WHForm, form) {
    this.wmsService.saveOrUpdateWareHouseData(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.wareHouseDetails = {
            storageType: {}
          };
          this.wareHouseDetails.organizationInfo = {
            "_id": null,
            "organizationID": null,
            "organizationName": null,
            "organizationIDName": null
          }
          this.isReadMode = false;
          if (this.appService.getParam('id')) {
            this.appService.navigate('/masterdata/warehouse', null);
          }
          WHForm.form.reset();
          this.fetchAllWarehouseDetails();
          this.WHForm.controls.status.setValue('Active')
          this.toastr.success('Ware house details updated.');
          this.createForm();
          this.selectedAddress = 'Ship to Address';
        } else if (response && response.status === 2 && response.statusMsg) {
          this.toastr.error(response.statusMsg);
        } else {
          this.toastr.error('Failed in updating ware house details.');
        }
      },
      (error) => {
        this.toastr.error('Failed in updating ware house details.');
      }
    );
  }
  fetchWareHouseDetailsByID() {
    if (this.appService.getParam('id')) {
      this.wmsService.fetchWareHouseDetailsByID(this.appService.getParam('id'), this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.wareHouse) {
            this.wareHouseDetails = response.data.wareHouse;
          }
        },
        (error) => {
        }
      );
    }
  }
  clearWHDate(WHForm: NgForm) {
    this.createForm();
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.wareHouseDetails = {
      storageType: {}
    };
    this.isReadMode = false;
    // WHForm.form.reset();
    this.wareHouseDetails = new WareHouseEntity();
    this.WHForm.controls.status.setValue('Active');

    this.selectedAddress = 'Ship to Address';
    // this.shipToAddresses = [];
    // this.addShipToLine('shipToAddresses');
    // this.addShipToLine('shipFromAddresses');
    // this.addShipToLine('billToAddresses');
  }

  fetchAllStorageTypes() {

    this.metaDataService.fetchAllStorageTypes(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.storageTypes) {
          if (response.data.storageTypes.length > 0) {
            this.storageTypes = response.data.storageTypes;
            this.storageTypeValues = this.completerService.local(
              this.commonService.getFiltValuesFromArrayOfObjs(response.data.storageTypes, 'storageTypeCode'));
          } else {
            this.storageTypes = [];
          }
        } else {
          this.storageTypes = [];
        }
      },
      (error) => {
        this.storageTypes = [];
      });
  }
  /* fetchAllStorageTypes() {
    this.inboundMasterDataService.fetchAllStorageTypes().subscribe(
      (response) => {
        if (response && response.status === 0) {
          if (response.data.storageTypes.length > 0) {
            this.storageTypes = response.data.storageTypes;
            this.storageTypeValues = this.completerService.local(
              this.commonService.getFiltValuesFromArrayOfObjs(response.data.storageTypes, 'storageTypeCode'));
          } else {
            this.storageTypes = [];
          }
        } else {
          this.storageTypes = [];
        }
      },
      (error) => {
        this.storageTypes = [];
      });
  }
 */
  /*  fetchAllStorageTypes() {
     this.inboundMasterDataService.fetchAllStorageTypes().subscribe(
     (response) => {
       if (response && response.status === 0) {
         if (response.data.storageTypes.length > 0) {
           this.storageTypes = response.data.storageTypes;
           this.storageTypeIDs = response.data.storageTypes.map(storagetype =>storagetype.storageTypeCode)
          // console.log(this.storageTypes)

         } else {
           this.storageTypes = [];
           this.toastr.success('No storage types found');
         }
       } else {
         this.storageTypes = [];
       }
     },
     (error) => {
       this.storageTypes = [];
     });
   }*/
  getSelectedValue(type, value) {
    if (value) {
      switch (type) {
        case 'storageType': {
          this.storageTypes.forEach(storageType => {
            if (storageType.storageTypeCode === value.originalObject) {
              this.wareHouseDetails.storageType._id = storageType._id;
              this.wareHouseDetails.storageType.storageTypeCode = storageType.storageTypeCode;
              this.wareHouseDetails.storageType.storageTypeDescription = storageType.storageTypeDescription;
            }
          });
          break;
        }
        case 'organizationInfo': {
          const orgDetails = this.orgData.find(x => x.organizationIDName == value.originalObject);
          this.wareHouseDetails.organizationInfo._id = orgDetails._id;
          this.wareHouseDetails.organizationInfo.organizationID = orgDetails.organizationID;
          this.wareHouseDetails.organizationInfo.organizationName = orgDetails.organizationName;
          this.wareHouseDetails.organizationInfo.organizationIDName = orgDetails.organizationIDName;
          break;
        }
      }
    }
  }
  fetchAllOrganizations() {
    this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['organizations'].length > 0) {
        this.orgData = res['data']['organizations'];
        this.orgIDNames = res['data']['organizations'].map(x => x.organizationIDName);
      }
      else {
        this.orgData = [];
      }
    })
  }

  /* getSelectedValue(type, value) {
    switch (type) {
      case 'storageType': {
        this.storageTypes.forEach(storageType => {
          if (storageType.storageTypeCode === value) {
            this.wareHouseDetails.storageType._id = storageType._id;
            this.wareHouseDetails.storageType.storageTypeCode = storageType.storageTypeCode;
            this.wareHouseDetails.storageType.storageTypeDescription = storageType.storageTypeDescription;
          }
        });
        break;
      }
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
  } */
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
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.valid && fieldName.touched;
    }
  }
  fetchAllCountries() {
    this.commonMasterDataService.fetchAllCountries(this.formObj).subscribe(response => {
      console.log(this.formObj)
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
  fetchAllStatesByCountryID(id: any) {
    this.commonMasterDataService.fetchAllStatesByCountryID(id).subscribe(response => {
      if (response && response.status === 0 && response.data.states) {
        this.states = response.data.states;
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
  exportAsXLSX() {
    this.warehouses.forEach(el => {
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
        el['allAddresses'] = []
      }
    })
    const data = this.excelService.formatJSONForHeaderLines(this.warehouses, 'allAddresses');
    const changedData = this.exportTypeMethod(data)
    this.excelService.exportAsExcelFile(changedData, 'Warehouses', null);
    //const changedWareHouseList = this.exportTypeMethod(this.warehouses)
    // this.excelService.exportAsExcelFile(changedWareHouseList, 'Warehouses', null);
  }
  exportTypeMethod(data) {
    console.log(data)
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['wareHouseID'] = k.finishedwareHouseID
        obj['wareHouseName'] = k.wareHouseName
        if (k.storageType) {
          obj['storageType'] = k.storageType.storageTypeCode
        } else {
          obj['storageType'] = null
        }
        obj["wareHouseType"] = k.wareHouseType
        obj['capacity'] = k.capacity
        obj['markupPercentage'] = k.markupPercentage
        obj['taxExemption'] = k.taxExemption
        obj['height'] = k.height
        obj['panNumber'] = k.panNumber
        obj['gstNumber'] = k.gstNumber
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
      obj['wareHouseID'] = null
      obj['wareHouseName'] = null
      obj['storageTypeCode'] = null
      obj['capacity'] = null
      obj["wareHouseType"] = null
      obj['markupPercentage'] = null
      obj['taxExemption'] = null
      obj['height'] = null
      obj['panNumber'] = null
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

  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'warehouse', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")

    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllWarehouseDetails();
    }
  }

  getFile() {
    document.getElementById('upfile').click();
  }
  // uploadExcel = async (event) => {
  //   if (event.target.files && event.target.files[0]) {
  //     this.isShowOrHideError = false;
  //     await this.excelService.generateJsonUsingExcel(event);
  //     setTimeout(() => {
  //       const jsonData = this.excelService.getJsonData();
  //       if (jsonData.length > 0) {
  //         event.target.value = '';
  //         const missingParamsArray = this.mandatoryCheck(jsonData);
  //         if (missingParamsArray.length > 1) {
  //           this.failureRecords = missingParamsArray;
  //           this.missingParams = missingParamsArray.join(', ');
  //           this.toastr.error('Please download log file to fill mandatory fields');
  //         } else {
  //           const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.WAREHOUSE);
  //           reqData.forEach(r => {
  //             r['organizationInfo'] = this.configService.getOrganization();
  //             r['wareHouseInfo'] = this.configService.getWarehouse();
  //           });

  //           this.excelRestService.saveWHBulkdata(reqData).subscribe(res => {
  //             if (res && res.status === 0 && res.data.warehouselist && res.data.warehouselist.failureList &&
  //               res.data.warehouselist.failureList.length > 0 && res.data.warehouselist.successList &&
  //               res.data.warehouselist.successList.length > 0) {
  //               this.failureRecords = res.data.warehouselist.failureList;
  //               this.failureRecords = this.failureRecords.concat(res.data.warehouselist.duplicateList);
  //               this.toastr.error('Partially failed in uploading, Please download log for reasons');
  //               this.fetchAllWarehouseDetails();
  //             } else if (res && res.status === 0 && res.data.warehouselist && res.data.warehouselist.failureList
  //               && res.data.warehouselist.failureList.length > 0) {
  //               this.failureRecords = res.data.warehouselist.failureList;
  //               this.failureRecords = this.failureRecords.concat(res.data.warehouselist.duplicateList);
  //               this.toastr.error('Failed in uploading, Please download log for reasons');
  //             } else if (res && res.status === 0 && res.data.warehouselist && res.data.warehouselist.failureList && res.data.warehouselist.failureList.length === 0) {
  //               if (res && res.status === 0 && res.data.warehouselist && res.data.warehouselist.duplicateList && res.data.warehouselist.duplicateList.length > 0) {
  //                 this.failureRecords = res.data.warehouselist.duplicateList;
  //                 this.toastr.error('Duplicates present in the excel, Please download log file.');
  //                 this.fetchAllWarehouseDetails();

  //               } else {

  //                 this.fetchAllWarehouseDetails();
  //                 this.rerender();
  //                 this.toastr.success('Uploaded successfully');
  //                 this.failureRecords = [];
  //                 this.getFunctionForOnlyCall();
  //                 this.fetchAllWarehouseDetails();
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
            if (k['wareHouseID']) {
              data1.push(this.getAllAddressessLinesData(k));
              inValidRecord = false
            } else if (!k['wareHouseID']) {
              if (data1.length > 0) {
                data1[data1.length - 1]['allAddresses'].push(this.getProductBySupplierLinesData(k))
              }
            } else {
              if (!k['wareHouseID']) {
                inValidRecord = true;
                logs.push(this.getAllAddressessLinesData(k));
                const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_BY_SUPPLIER_HEADER;
                const missingParams = requiredParams.filter((param: any) => !(!!k[param]));
                if (missingParams.length > 0) {
                  missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', '\r\n')} \r\n`);
                }
                return;
              }
            }

          })
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
              console.log(r)
              let a: any = []
              let b: any = []
              let c: any = []
              r.allAddresses.forEach(m => {
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
            this.excelRestService.saveWHBulkdata(data1).subscribe(res => {
              if (res && res.status === 0 && res.data.warehouselist && res.data.warehouselist.failureList &&
                res.data.warehouselist.failureList.length > 0 && res.data.warehouselist.successList &&
                res.data.warehouselist.successList.length > 0) {
                this.failureRecords = res.data.warehouselist.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.warehouselist.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllWarehouseDetails();
              } else if (res && res.status === 0 && res.data.warehouselist && res.data.warehouselist.failureList
                && res.data.warehouselist.failureList.length > 0) {
                this.failureRecords = res.data.warehouselist.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.warehouselist.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.warehouselist && res.data.warehouselist.failureList && res.data.warehouselist.failureList.length === 0) {
                if (res && res.status === 0 && res.data.warehouselist && res.data.warehouselist.duplicateList && res.data.warehouselist.duplicateList.length > 0) {
                  this.failureRecords = res.data.warehouselist.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllWarehouseDetails();

                } else {

                  this.fetchAllWarehouseDetails();
                  this.rerender();
                  this.toastr.success('Uploaded successfully');
                  this.failureRecords = [];
                  this.getFunctionForOnlyCall();
                  this.fetchAllWarehouseDetails();
                }
              } else {
                this.toastr.error('Failed in uploading');



                this.failureRecords = [];
              }
            }, error => { })
          }
        }
      }, 500)
    }
  }
  getAllAddressessLinesData(k) {
    return {
      "wareHouseID": k.wareHouseID,
      "wareHouseName": k.wareHouseName,
      "wareHouseIDName": k.wareHouseID + ":" + k.wareHouseName,
      "wareHouseType": k.wareHouseType,
      "storageTypeCode": this.mapId("storageTypeCode", k.storageType),
      "capacity": k.capacity,
      "markupPercentage": k.markupPercentage,
      "taxExemption": k.taxExemption,
      "height": k.height,
      "allAddresses": [this.getProductBySupplierLinesData(k)]
    }
  }
  getProductBySupplierLinesData(document?) {
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
  getFunctionForOnlyCall() {
    this.fetchAllWarehouseDetails();

  }
  mapId(type, value) {
    switch (type) {
      case 'storageTypeCode': {
        const storage = this.storageTypes.find(w => w.storageTypeCode === value);
        return storage && storage ? storage : null;
      }
    }
  }

  mandatoryCheckForHeaderLines(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      let record = data[0];
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.WAREHOUSE;
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
        fileName: "Warehouse Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
    if (this.missingParams) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Warehouse Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }

}
