import { Component, OnInit, ViewChild, QueryList, OnDestroy, AfterViewInit } from '@angular/core';
import { TransporaterEntity } from 'src/app/entities/transporter.entity';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Util } from 'src/app/shared/utils/util';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { CompleterService, CompleterData } from 'ng2-completer';
import { typeSourceSpan } from '@angular/compiler';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-transporter',
  templateUrl: './transporter.component.html',
  styleUrls: ['./transporter.component.scss']
})
export class TransporterComponent implements OnInit, OnDestroy, AfterViewInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  id: any;
  @ViewChild(DataTableDirective)
  focusedElement: any;
  transportorForm: FormGroup
  transporatorDetails: any;
  statuss: any = ['Active', 'In Active'];
  countries: any[] = [];
  serviceProviders: any;
  transporterKeys: any = ['', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '',
    ''];
  missingParams: any;
  isShowOrHideError: any = false;
  isDisabled:boolean = true
  isReadMode: any = false;
  failureRecords: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Transporter', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private commonMasterDataService: CommonMasterDataService
    , private wmsService: WMSService, private fb: FormBuilder,
    private toastr: ToastrService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private util: Util, private excelService: ExcelService, private excelRestService: ExcelRestService,
    private translate: TranslateService,) { 
      this.translate.use(this.language);
    }

  ngOnInit() {
    this.createTransportorForm();
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
   /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
      if (data) {
        this.formObj = this.configService.getGlobalpayload();
        this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Transporter', Storage.getSessionUser());
        this.getFunctioncalls();
      }
    }) */
    this.getFunctioncalls()
  }
  getFunctioncalls() {
    if (this.permissionsList.includes('View')) {
      this.fetchAllCountries();
      this.fetchAllServiceProvider();
    }
  }
  createTransportorForm() {
    this.transportorForm = this.fb.group({
      serviceProviderID: ['', Validators.required],
      serviceProviderName: ['', Validators.required],
      serviceProviderIDName: [''],
      status: ['Active', Validators.required],
      address: this.fb.group({
        addressLine: [''],
        city: [''],
        state: [''],
        country: [''],
        pin: [''],
        emailId: [''],
        mobileNumber: ['']
      }),
      contactDetails: this.fb.array([
        this.lineArray()
      ]),
      paymentDetails: this.fb.group({
        bankName: [''],
        branchName: [''],
        accountName: [''],
        accountNumber: [''],
        ifsc: [''],
        currency: [''],
        accountHolderName: [''],
        accountType: [''],
        bankAddress: [''],
        panNumber: ['']
      }),
    })
  }
  lineArray(): FormGroup {
    return this.fb.group({
      name: [''],
      phoneNumber: [''],
      emailAddress: ['']
    })
  }
  saveTransportor() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const reqForm = this.transportorForm.value
      if (this.id) {
        this.transportorForm.value._id = this.id;
      }
      reqForm['organizationInfo'] = this.configService.getOrganization();
      reqForm['wareHouseInfo'] = this.configService.getWarehouse();
      this.wmsService.saveOrUpdateServiceProvider(JSON.stringify(reqForm)).subscribe(
        (response) => {
          if (response && response.status === 0) {
           
            this.transportorForm.reset();
            this.fetchAllServiceProvider();
            this.transportorForm.get('status').setValue('Active');
            this.toastr.success("Service provider details Saved");
            this.id = '';
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in updating Service provider details.');
          }
        },
        (error) => {
          this.toastr.error('Failed in updating Service provider details.');
        }
      );
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
    this.isReadMode = false;
  }
  getServiceIDName() {
    this.transportorForm.controls.serviceProviderIDName.setValue
      (`${this.transportorForm.value.serviceProviderID}:${this.transportorForm.value.serviceProviderName}`);
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  edit(service) {
    console.log(service);
    this.globalIDs = service._id;    
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.id = service._id;
      this.isReadMode = true
      this.transportorForm.patchValue(service);
      window.scroll(0, 0);
      this.transportorForm.get('status').patchValue('Active');
    }
    else if (this.permissionsList.includes('View')) {
      this.transportorForm.patchValue(service);
      window.scroll(0, 0);
      this.transportorForm.disable();
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
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  fetchAllServiceProvider() {
    this.wmsService.fetchAllServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.serviceProviders) {
        this.serviceProviders = response.data.serviceProviders;
        this.rerender();
      } else {
        this.serviceProviders = [];
      }
    }, error => {
      this.serviceProviders = [];
    });
  }
  delete(data) {
    if (this.permissionsList.includes('Delete')) {
      console.log(this.permissionsList);
      this.deleteInfo = { name: 'serviceProvider', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllServiceProvider();
    }
  }
  clearFields() {

    this.id = '';
    this.isReadMode = false
    this.transportorForm.reset();
    this.transportorForm.get('status').setValue('Active');
    this.transportorForm.enable();
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName, formName, parentName?) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else if (parentName) {
      return this.transportorForm.controls[parentName]['controls'][fieldName].invalid && this.transportorForm.controls[parentName]['controls'][fieldName].touched;
    } else {
      return this.util.shouldShowErrors(fieldName, formName);
    }
  }
  shouldShowSuccess(fieldName, parentName?) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else if (parentName) {
      return this.transportorForm.controls[parentName]['controls'][fieldName].valid && this.transportorForm.controls[parentName]['controls'][fieldName].touched;
    }
    else {
      return this.transportorForm.controls[fieldName].valid && this.transportorForm.controls[fieldName].touched;
    }

  }

  /*
  exportAsXLSX() {
    if (this.serviceProviders && this.serviceProviders.length > 0) {
      const data = this.excelService.formatJSONForHeaderLines(this.serviceProviders, 'Transporter');
      this.excelService.exportAsExcelFile(this.serviceProviders, 'Transporter', Constants.EXCEL_IGNORE_FIELDS.TRANSPORTER);
    } else {
      this.toastr.error('No data found');
    }
  } */

  exportAsXLSX() {


    const changedTaskList = this.exportTypeMethod(this.serviceProviders)
    console.log(changedTaskList)
    this.excelService.exportAsExcelFile(changedTaskList, 'TRANSPORTER', Constants.EXCEL_IGNORE_FIELDS.TRANSPORTER);

  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = [];
    if (data && data != null && data.length > 0) {
      data.forEach(ele => {
        console.log(ele)
        const obj = {}
        if (ele.contactDetails && ele.contactDetails != null && ele.contactDetails != undefined
          && ele.contactDetails.length > 0) {
          ele.contactDetails.forEach((contactDetail, index) => {
            console.log(contactDetail);
            if (contactDetail) {
              if (index === 0) {
                obj['serviceProviderIDName'] = ele.serviceProviderIDName
                obj['serviceProviderID'] = ele.serviceProviderID
                obj['serviceProviderName'] = ele.serviceProviderName
                if (ele.address) {
                  obj['addressLine'] = ele.address.addressLine
                  obj['city'] = ele.address.city
                  obj['state'] = ele.address.state
                  obj['country'] = ele.address.country
                  obj['mobileNumber'] = ele.address.mobileNumber
                  obj['emailId'] = ele.address.emailId
                  obj['pin'] = ele.address.pin
                }
                if (ele.contactDetails) {
                  obj['name'] = contactDetail.name
                  obj['phoneNumber'] = contactDetail.phoneNumber
                  obj['emailAddress'] = contactDetail.emailAddress
                  obj['designation'] = contactDetail.designation
                }
                if (ele.equipmentInfo) {
                  obj['vehicleNumber'] = ele.equipmentInfo.vehicleNumber
                }
                obj['vehicleType'] = ele.vehicleType
                obj['considerEquipment'] = ele.considerEquipment
                obj['organizationInfo'] = ele.organizationInfo
                obj['otherInfo'] = ele.otherInfo
                obj['status'] = ele.status
                if (ele.paymentDetails) {
                  obj['accountNumber'] = ele.paymentDetails.accountNumber
                  obj['accountHolderName'] = ele.paymentDetails.accountHolderName
                  obj['accountType'] = ele.paymentDetails.accountType
                  obj['ifsc'] = ele.paymentDetails.ifsc
                  obj['bankAddress'] = ele.paymentDetails.bankAddress
                  obj['accountName'] = ele.paymentDetails.accountName
                  obj['bankName'] = ele.paymentDetails.bankName
                  obj['branchName'] = ele.paymentDetails.branchName
                  obj['currency'] = ele.paymentDetails.currency
                  obj['panNumber'] = ele.paymentDetails.panNumber
                }
                arr.push(obj)
              }
              else {
                obj['designation'] = contactDetail.designation
                obj['emailAddress'] = contactDetail.emailAddress
                obj['name'] = contactDetail.name
                obj['phoneNumber'] = contactDetail.phoneNumber
                obj['serviceProviderIDName'] = null
                obj['serviceProviderID'] = null
                obj['serviceProviderName'] = null
                obj['vehicleNumber'] = null
                obj['vehicleType'] = null
                obj['considerEquipment'] = null
                obj['organizationInfo'] = null
                obj['otherInfo'] = null
                obj['status'] = null

                obj['addressLine'] = null
                obj['city'] = null
                obj['country'] = null
                obj['emailId'] = null
                obj['mobileNumber'] = null
                obj['pin'] = null
                obj['state'] = null

                obj['accountHolderName'] = null
                obj['accountName'] = null
                obj['accountNumber'] = null
                obj['accountType'] = null
                obj['bankAddress'] = null
                obj['bankName'] = null
                obj['branchName'] = null
                obj['currency'] = null
                obj['ifsc'] = null
                obj['panNumber'] = null
                arr.push(obj)
              }
            }
          })
        }
        else {
          obj['designation'] = null
          obj['emailAddress'] = null
          obj['name'] = null
          obj['phoneNumber'] = null


          obj['serviceProviderIDName'] = ele.serviceProviderIDName
          obj['serviceProviderID'] = ele.serviceProviderID
          obj['serviceProviderName'] = ele.serviceProviderName
          if (ele.address) {
            obj['addressLine'] = ele.address.addressLine
            obj['city'] = ele.address.city
            obj['state'] = ele.address.state
            obj['country'] = ele.address.country
            obj['mobileNumber'] = ele.address.mobileNumber
            obj['emailId'] = ele.address.emailId
            obj['pin'] = ele.address.pin
          }
          if (ele.contactDetails) {
            obj['name'] = ele.contactDetails.name
            obj['phoneNumber'] = ele.contactDetails.phoneNumber
            obj['emailAddress'] = ele.contactDetails.emailAddress
            obj['designation'] = ele.contactDetails.designation
          }
          if (ele.equipmentInfo) {
            obj['vehicleNumber'] = ele.equipmentInfo.vehicleNumber
          }
          obj['vehicleType'] = ele.vehicleType
          obj['considerEquipment'] = ele.considerEquipment
          obj['organizationInfo'] = ele.organizationInfo
          obj['otherInfo'] = ele.otherInfo
          obj['status'] = ele.status
          if (ele.paymentDetails) {
            obj['accountNumber'] = ele.paymentDetails.accountNumber
            obj['accountHolderName'] = ele.paymentDetails.accountHolderName
            obj['accountType'] = ele.paymentDetails.accountType
            obj['ifsc'] = ele.paymentDetails.ifsc
            obj['bankAddress'] = ele.paymentDetails.bankAddress
            obj['accountName'] = ele.paymentDetails.accountName
            obj['bankName'] = ele.paymentDetails.bankName
            obj['branchName'] = ele.paymentDetails.branchName
            obj['currency'] = ele.paymentDetails.currency
            obj['panNumber'] = ele.paymentDetails.panNumber
          }
          arr.push(obj)
        }

      })
    }
    else {
      const obj = {}
      obj['serviceProviderIDName'] = null;
      obj['serviceProviderID'] = null
      obj['serviceProviderName'] = null
      obj['vehicleNumber'] = null
      obj['vehicleType'] = null
      obj['equipmentID'] = null
      obj['considerEquipment'] = null
      obj['organizationInfo'] = null
      obj['otherInfo'] = null
      obj['status'] = null

      obj['addressLine'] = null
      obj['city'] = null
      obj['country'] = null
      obj['emailId'] = null
      obj['mobileNumber'] = null
      obj['pin'] = null
      obj['state'] = null

      obj['accountHolderName'] = null
      obj['accountName'] = null
      obj['accountNumber'] = null
      obj['accountType'] = null
      obj['bankAddress'] = null
      obj['bankName'] = null
      obj['branchName'] = null
      obj['currency'] = null
      obj['ifsc'] = null
      obj['panNumber'] = null

      //  obj['designation'] = null
      obj['emailAddress'] = null
      obj['name'] = null
      obj['phoneNumber'] = null

      arr.push(obj)
    }
    return arr
  }




  /*
  exportAsXLSX() {
    if (this.serviceProviders && this.serviceProviders.length > 0) {
      const data = this.excelService.formatJSONForHeaderLines(this.serviceProviders, 'Transporter');
      this.excelService.exportAsExcelFile(this.serviceProviders, 'Transporter', Constants.EXCEL_IGNORE_FIELDS.TRANSPORTER);
    } else {
      this.toastr.error('No data found');
    }
  } */

  /*
  exportAsXLSX() {
    if (this.serviceProviders && this.serviceProviders.length > 0) {
      const data = this.excelService.formatJSONForHeaderLines(this.serviceProviders, 'serviceProviders');
      this.excelService.exportAsExcelFile(data, 'serviceProviders', Constants.EXCEL_IGNORE_FIELDS.TRANSPORTER);
    } else {
      this.toastr.error('No data found');
    }
  }

 */
  getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.TRANSPORATOR
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        if (jsonData.length > 0) {
          event.target.value = '';
          const missingParamsArray = this.mandatoryCheck(jsonData);
          if (missingParamsArray.length > 1) {
            this.failureRecords = missingParamsArray;
            this.missingParams = missingParamsArray.join(', ');
            this.toastr.error('Please download log file to fill mandatory fields');
          } else {
            const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.TRANSPORATOR);
            reqData.forEach(r => {
              console.log(r);
              r['address'] = {
                addressLine: r.addressLine,
                city: r.city,
                state: r.state,
                country: r.country,
                pin: r.pin,
                emailId: r.emailId,
                mobileNumber: r.mobileNumber,
              }
              delete r.addressLine
              delete r.city
              delete r.state
              delete r.country
              delete r.pin
              delete r.emailId
              delete r.mobileNumber
              delete r.countryName
              console.log(r.address);

              r['paymentDetails'] = {
                bankName: r.bankName,
                branchName: r.branchName,
                accountName: r.accountName,
                accountNumber: r.accountNumber? r.accountNumber.toString():null,
                ifsc: r.ifsc,
                emailId: r.emailId,
                currency: r.currency,
                accountHolderName: r.accountHolderName,
                accountType: r.accountType,
                bankAddress: r.bankAddress,
              }
              delete r.bankName
              delete r.branchName
              delete r.accountName
              delete r.accountNumber
              delete r.ifsc
              delete r.emailId
              delete r.currency

              reqData.forEach(r => {
                r['organizationInfo'] = this.configService.getOrganization();
                r['wareHouseInfo'] = this.configService.getWarehouse();
              });
            });
            this.excelRestService.TransportorUploadExcel(reqData).subscribe(res => {
              if (res && res.status === 0 && res.data.serviceProviderList && res.data.serviceProviderList.failureList &&
                res.data.serviceProviderList.failureList.length > 0 && res.data.serviceProviderList.successList &&
                res.data.serviceProviderList.successList.length > 0) {
                this.failureRecords = res.data.serviceProviderList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.serviceProviderList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllServiceProvider();
              } else if (res && res.status === 0 && res.data.serviceProviderList && res.data.serviceProviderList.failureList
                && res.data.serviceProviderList.failureList.length > 0) {
                this.failureRecords = res.data.serviceProviderList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.serviceProviderList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.serviceProviderList && res.data.serviceProviderList.failureList && res.data.serviceProviderList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.serviceProviderList && res.data.serviceProviderList.duplicateList && res.data.serviceProviderList.duplicateList.length > 0) {
                  this.failureRecords = res.data.serviceProviderList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllServiceProvider();
                } else {
                  this.fetchAllServiceProvider();
                  console.log('Upload Sucessfull')
                  this.toastr.success('Uploaded successfully');
                  this.fetchAllServiceProvider();
                  this.fetchAllServiceProvider();
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
      }, 500);
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['name']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.TRANSPORATOR;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
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
        fileName: "Transporter Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
    if (this.missingParams) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Transporter Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
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

}
