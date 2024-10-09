import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../../../shared/services/excel.service';
import { CommonMasterDataService } from '../../../services/integration-services/commonMasterData.service';
import { Constants } from '../../../constants/constants';
import { Router } from '@angular/router';
import { AppService } from '../../../shared/services/app.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-bill-to-address',
  templateUrl: './bill-to-address.component.html'
})
export class BillToAddressComponent implements OnInit, AfterViewInit, OnDestroy {
  billToAddressForm: FormGroup;
  focusedElement: any;
  dataService: CompleterData;
 
  statuss: any = ['Active', 'InActive'];
  billToAddressData: any = [];
  billToAddressInfo: any;
  id: any;
  inventoryUnits: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  countries: any = [];
  showOnlyForm: any = false;
  isReadMode: any = true;
  isEditBillToAddress: any = false;
  isShowOrHideError: boolean;
  missingParams: string;
  failureRecords: any;
  deleteInfo: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Bill To Address', Storage.getSessionUser());
  outBoundInvoicingPermissionList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Invoicing', Storage.getSessionUser());
  forPermissionsSubscription: any;
  raisedStatus: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private toastr: ToastrService, private outboundProcessService: OutboundProcessService,
    private excelService: ExcelService, private configService: ConfigurationService,
    private commonMasterDataService: CommonMasterDataService,
    private router: Router,
    private appService: AppService, private excelRestService: ExcelRestService,
    public ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) {
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
    /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
       if (data) {
         this.formObj = this.configService.getGlobalpayload();
         this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Bill To Address', Storage.getSessionUser());
         this.billToAddressData = [];
         this.rerender();
         this.getFunctionCalls()
       }
     }) */
    this.getFunctionCalls()
    this.getDisabledPanel();
  }
  getFunctionCalls() {
    if (this.permissionsList.includes('View') || this.outBoundInvoicingPermissionList.includes('View')) {
      this.createBillToAddressForm();
      this.fetchAllCountries();
      this.fetchAllBillToAdresses();
      this.onDetectRoute();
    }
  }
  getDisabledPanel() {
    if (this.outBoundInvoicingPermissionList.includes('Update') && this.outBoundInvoicingPermissionList.includes('View')) {
      this.billToAddressForm.enable();
    }
    else if (this.outBoundInvoicingPermissionList.includes('View')) {
      this.billToAddressForm.disable();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
globalIDs:any;
  edit(details: any) {
    this.globalIDs = details._id;
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      window.scroll(0, 360);
      this.billToAddressForm.enable();
      this.billToAddressInfo = Object.assign({}, details);
      this.id = this.billToAddressInfo._id;
      this.billToAddressForm.patchValue(this.billToAddressInfo);
    }
    else if (this.permissionsList.includes('View')) {
      window.scroll(0, 360);
      this.billToAddressInfo = Object.assign({}, details);
      this.billToAddressForm.patchValue(this.billToAddressInfo);
      this.billToAddressForm.disable();
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'billToAddress', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.rerender()
      this.fetchAllBillToAdresses();
    }
  }
  saveOutBoundInvoicing() {
    if (this.outBoundInvoicingPermissionList.includes("Update")) {
      const billToAddressInfo = this.billToAddressForm.value;
      if (this.id) {
        billToAddressInfo['_id'] = this.id;
      }
      billToAddressInfo['organizationInfo'] = this.configService.getOrganization();
      billToAddressInfo['wareHouseInfo'] = this.configService.getWarehouse();
      this.commonMasterDataService.saveOrUpdateBillToAddresses(JSON.stringify(billToAddressInfo)).subscribe(
        (response) => {
          if (response && response.status === 0 && (response.data.BillToAddress || response.data.dbbillToAddress)) {
            if (this.showOnlyForm) {
              this.fetchBillToAddressByID(response.data.BillToAddress ? response.data.BillToAddress._id : response.data.dbbillToAddress._id);
              this.billToAddressForm.controls.country.disable();
              this.isReadMode = true;
              this.isEditBillToAddress = false;
            } else {
              this.fetchAllBillToAdresses();
              this.billToAddressForm.reset();
            }
            // if (this.appService.getParam('id')) {
            //   this.appService.navigate('/masterdata/billToAddress', null);
            // }
            if (this.id) {
              this.id = '';
              this.toastr.success('Updated successfully');
            } else {
              this.toastr.success('Saved successfully');
            }
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in saving details');
          }
        },
        (error) => {
          this.toastr.error('Failed in saving details');
        }
      );
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  save() {
   if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const billToAddressInfo = this.billToAddressForm.value;
      if (this.id) {
        this.billToAddressInfo._id = this.id;
      }
      billToAddressInfo['organizationInfo'] = this.configService.getOrganization();
      billToAddressInfo['wareHouseInfo'] = this.configService.getWarehouse();
      this.commonMasterDataService.saveOrUpdateBillToAddresses(JSON.stringify(billToAddressInfo)).subscribe(
        (response) => {
          if (response && response.status === 0 && (response.data.BillToAddress || response.data.dbbillToAddress)) {
            if (this.showOnlyForm) {
              this.fetchBillToAddressByID();
              this.billToAddressForm.controls.country.disable();
              this.isReadMode = true;
              this.isEditBillToAddress = false;
            } else {
              this.fetchAllBillToAdresses();
              this.billToAddressForm.reset();
            }
            if (this.appService.getParam('id')) {
              this.appService.navigate('/masterdata/billToAddress', null);
            }
            if (this.id) {
              this.id = '';
              this.toastr.success('Updated successfully');
            } else {
              this.toastr.success('Saved successfully');
            }
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in saving details');
          }
        },
        (error) => {
          this.toastr.error('Failed in saving details');
        }
      );
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  updateEditBillToAddress() {
    if (this.outBoundInvoicingPermissionList.includes('Update') && this.outBoundInvoicingPermissionList.includes('View')) {
      this.isReadMode = false;
      this.isEditBillToAddress = true;
      this.billToAddressForm.controls.country.enable();
    }
    else if (this.outBoundInvoicingPermissionList.includes('View')) {
      this.billToAddressForm.disable();
      this.toastr.error("user doesnt have permissions")
    }
  }
  clear() {
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.billToAddressForm.reset();
    this.billToAddressForm.enable();
  }
  cancelEditBillToAddress() {
    if (this.outBoundInvoicingPermissionList.includes('Update') && this.outBoundInvoicingPermissionList.includes('View')) {
      this.fetchBillToAddressByID();
      this.isReadMode = true;
      this.isEditBillToAddress = false;
      this.billToAddressForm.enable();
    }
    else if (this.outBoundInvoicingPermissionList.includes('View')) {
      this.billToAddressForm.disable();
    }
  }
  cancelOutboundEditBillToAddress() {
    if (this.outBoundInvoicingPermissionList.includes('Update') && this.outBoundInvoicingPermissionList.includes('View')) {
      this.fetchBillToAddressByID();
      this.isReadMode = true;
      this.isEditBillToAddress = false;
      this.billToAddressForm.enable();
    }
    else if (this.outBoundInvoicingPermissionList.includes('View')) {
      this.billToAddressForm.disable();
    }
  }

  fetchAllBillToAdresses() {
    this.billToAddressData = [];
    this.commonMasterDataService.fetchAllBillToAdresses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.BillToAddressList && response.data.BillToAddressList.length > 0) {
          this.billToAddressData = response.data.BillToAddressList;
          this.rerender();
          this.fetchBillToAddressByID();
        } else {
          this.billToAddressData = [];
        }
      },
      (error) => {
        this.billToAddressData = [];
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
  fetchBillToAddressByID(_id?) {
    if (this.showOnlyForm || this.appService.getParam('id')) {
      this.commonMasterDataService.fetchBillToAddressByID(_id ? _id : this.billToAddressData[0]._id, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.BillToAddress) {
            this.outboundProcessService.fetchInvoiceByID(this.appService.getParam('id'), this.formObj).subscribe(
              (response) => {
                if (response && response.status === 0 && response.data.invoice) {
                  this.raisedStatus = response.data.invoice.status === 'Close' ? true : false;
                  if (this.raisedStatus) {
                    this.billToAddressForm.disable();
                  }
                }
              })
            this.billToAddressForm.patchValue(response.data.BillToAddress);
            this.id = response.data.BillToAddress._id;
            if (this.showOnlyForm) {
              this.billToAddressForm.controls.country.disable();
            }
          }
        },
        (error) => {
        }
      );
    }
  }
  redirectToBillToAddress() {
    if (this.outBoundInvoicingPermissionList.includes('Update')) {
      if (this.id) {
        this.appService.navigate('masterdata/billToAddress', { id: this.id });
      }
      else {
        this.appService.navigate('masterdata/billToAddress', null);
      }
    }
    else {
      this.toastr.error("User doesn't have permission")
    }
  }
  createBillToAddressForm() {
    this.billToAddressForm = new FormBuilder().group({
      shippingFrom: [null],
      address: [null],
      state: [''],
      city: [null],
      country: [null],
      phoneNumber: [null],
      email: [null],
      pin: [null]
    });
  }
  rerender(): void {
    if (!this.showOnlyForm) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        this.dtTrigger.next();
        dtInstance.destroy();
      });
    }
  }
  exportAsXLSX() {
    const changedBillToAddressList = this.exportTypeMethod(this.billToAddressData)
    this.excelService.exportAsExcelFile(changedBillToAddressList, 'BillToAddress-Data', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['shippingFrom'] = k.shippingFrom
        obj['address'] = k.address
        obj['state'] = k.state
        obj['city'] = k.city
        obj['country'] = k.country
        obj['phoneNumber'] = k.phoneNumber
        obj['email'] = k.email
        obj['pin'] = k.pin
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['shippingFrom'] = null
      obj['address'] = null
      obj['state'] = null
      obj['city'] = null
      obj['country'] = null
      obj['phoneNumber'] = null
      obj['email'] = null
      obj['pin'] = null
      arr.push(obj)
    }
    return arr
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        console.log(jsonData)
        if (jsonData.length > 0) {
          event.target.value = '';
          const firstObj = jsonData[0];
          const missingParams = requiredParams.filter((param: any) => !(!!firstObj[param]));
          if (missingParams.length) {
            this.missingParams = missingParams.join(', ');
            this.isShowOrHideError = true;
          } else {

            this.excelRestService.saveProductBulkdata(jsonData).subscribe(res => {
              if (res && res.status === 0 && res.data.productMasterList && (res.data.productMasterList.failureList
                && res.data.productMasterList.failureList.length > 0) || (res.data.productMasterList.duplicateList
                  && res.data.productMasterList.duplicateList.length > 0)) {
                const failureRecordsList = res.data.productMasterList.failureList;
                const duplicateRecords = res.data.productMasterList.duplicateList;
                this.failureRecords.push(failureRecordsList);
                this.failureRecords.push(duplicateRecords);
                this.toastr.error('Failed in uploading, Please download log for reasons');
                this.fetchAllBillToAdresses();
              } else if (res && res.status === 0 && res.data.productMasterList &&
                res.data.productMasterList.failureList && res.data.productMasterList.failureList.length === 0
                && res.data.productMasterList.duplicateList && res.data.productMasterList.duplicateList.length === 0) {
                /*  this.fetchAllProducts(); */
                this.fetchAllBillToAdresses();
                this.toastr.success('Uploaded successfully');
                this.failureRecords = [];
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
        fileName: "Product Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
  }
  onDetectRoute() {
    if (this.router.url.includes('/outbound/editInvoicing')) {
      this.showOnlyForm = true;
    } else {
      this.showOnlyForm = false;
    }
  }
}
