import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ComponentFactoryResolver } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { EmitterService } from '../../../services/emitter.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { MetaDataService } from '../../../services/integration-services/metadata.service';
import { CommonMasterDataService } from '../../../services/integration-services/commonMasterData.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { Constants } from '../../../constants/constants';
import { WMSService } from '../../../services/integration-services/wms.service';
import { CommonService } from '../../../shared/services/common.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-uom-conversion',
  templateUrl: './uom-conversion.component.html'
})
export class UomConversionComponent implements OnInit, OnDestroy {
  uomConversionForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  units: CompleterData;
  id: any;
  uomConversions: any = [];
  uomInfo: any = {};
  failureRecords: any = [];
  isShowOrHideError: any = false;
  isReadMode: any = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  products: any;
  productIDNameValues: CompleterData;
  focusedElement: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'UOM Conversion', Storage.getSessionUser());
  forPermissionsSubscription: any;

  constructor(private toastr: ToastrService, private configService: ConfigurationService,
    private emitterService: EmitterService,
    private excelService: ExcelService,
    private wmsService: WMSService,
    private metaDataService: MetaDataService,
    private commonService: CommonService,
    private excelRestService: ExcelRestService,
    public ngxSmartModalService: NgxSmartModalService,
    private commonMasterDataService: CommonMasterDataService,
    private completerService: CompleterService,
    private translate:TranslateService,) {
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
    this.getFunctionCalls()
  }
  getFunctionCalls() {
    if (this.permissionsList.includes('View')) {
      this.createUOMConversionForm();
      this.fetchMetaData();
      this.fetchAllUOMs();
      this.fetchAllProducts();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const req = this.uomConversionForm.value;
      if (this.uomConversionForm.value.conversionFactor <= 0) {
        this.toastr.error("The Conversion Factor Quantity should be greater than zero.");
      }
      else{

      
      if (this.id) {
        req._id = this.id;
      }
      if (req.productMasterInfo.productIDName) {
        req.productMasterInfo = this.commonService.getFilteredData('productIDName', this.uomConversionForm.value.productMasterInfo.productIDName, this.products,
          null, null, ['productIDName', 'productName', 'productID', '_id']);
        req.productMasterInfo.productMasterID = req.productMasterInfo._id;
        delete req.productMasterInfo._id;
      }
      req['organizationInfo'] = this.configService.getOrganization();
      req['wareHouseInfo'] = this.configService.getWarehouse();
      this.commonMasterDataService.saveOrUpdateUOMConversion(JSON.stringify(req)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.uom) {
            this.fetchAllUOMs();
            this.rerender();
            this.clear();
            this.toastr.success('Saved successfully');
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in saving details');
          }
        },
        (error) => {
        });
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  fetchAllUOMs() {
    this.commonMasterDataService.fetchAllUOMConversion(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.uoms) {
          this.uomConversions = response.data.uoms;
          this.rerender();
        }
      },
      (error) => {
      });
  }
  fetchAllProducts() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
          this.productIDNameValues = this.completerService.local(response.data.productMasters, 'productIDName', 'productIDName');
        }
      },
      (error) => {
      });
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  edit(record) {
    this.globalIDs = record._id
    window.scroll(0,0);
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.id = record._id;
      record.productMasterInfo = record.productMasterInfo === null ? { productIDName: null } : record.productMasterInfo;
      this.uomConversionForm.patchValue(record);
      this.uomConversionForm.controls.productIDName.disable
      this.makeThisDisabled = false;
      this.isReadMode = true
    }
    else if (this.permissionsList.includes('View')) {
      this.uomConversionForm.patchValue(record);
      this.makeReadOnly = true;
      this.makeThisDisabled = true;
      this.uomConversionForm.disable();
    }
  }
  clear() {
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.isReadMode = false
    this.uomConversionForm.reset();
    this.id = undefined;
    this.uomConversionForm.enable();
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.uomInfo = { name: 'UOM', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllUOMs();
    }
  }
  exportAsXLSX() {
    const changedUOMConversionList = this.exportTypeMethod(this.uomConversions)
    this.excelService.exportAsExcelFile(changedUOMConversionList, 'UOM-Conversions', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        if (k.productMasterInfo.productID) {
          obj['productID'] = k.productMasterInfo.productID
        } else {
          obj['productID'] = null
        }
        obj['unitConversionFrom'] = k.unitConversionFrom
        obj['unitConversionTo'] = k.unitConversionTo

        if (k.conversionFactor) {
          obj['conversionFactor'] = DecimalUtils.fixedDecimal(Number(k.conversionFactor),2)
        } else {
          obj['conversionFactor'] = null
        }

       /*  obj['conversionFactor'] = k.conversionFactor */
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['productID'] = null
      obj['unitConversionFrom'] = null
      obj['unitConversionTo'] = null
      obj['conversionFactor'] = null
      arr.push(obj)
    }
    return arr
  }
  fetchMetaData() {
    this.emitterService.fetchAllUnits();
    this.emitterService.unitValues.subscribe(res => {
      this.units = this.completerService.local(res, 'unitCode', 'unitCode');
    });
  }
  createUOMConversionForm() {
    this.uomConversionForm = new FormBuilder().group({
      productMasterInfo: new FormBuilder().group({
        productIDName: [''],
      }),
      unitConversionFrom: [null, Validators.required],
      unitConversionTo: [null, Validators.required],
      conversionFactor: [null, Validators.required],
    });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
  }
  getFile() {
    document.getElementById('upfile').click();
  }

  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.failureRecords = [];
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        const endArray = [];
        event.target.value = '';
        console.log(jsonData)
        const missingParamsArray = this.mandatoryCheck(jsonData);
        console.log(jsonData)
        if (missingParamsArray.length > 1) {
          this.failureRecords = missingParamsArray;
          this.toastr.error('Please download log file to fill mandatory fields');
          //console.log(jsonData)
        } else {
          const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.UOM);
          console.log(JSON.stringify(reqData));
          reqData.forEach(r => {
            if (r.productID) {
              let produc = this.mapId('productID', r.productMasterInfo.productID);
              console.log(produc);
              if (produc) {
                console.log(produc)
                r['productMasterInfo']['productID'] = produc.productID
                r['productMasterInfo']['productName'] = produc.productName;
                r['productMasterInfo']['productMasterID'] = produc._id;
                r['productMasterInfo']['productIDName'] = produc.productIDName;
              } else {
                r['productMasterInfo']['productID'] = r.productID;
                r['productMasterInfo']['productName'] = null;
                r['productMasterInfo']['productMasterID'] = null;
                r['productMasterInfo']['productIDName'] = null
              }
            delete r['productID']
            }
            else{
            //  alert("else");
              r['productMasterInfo'] = null
            }
            reqData.forEach(r => {
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
              r.conversionFactor = r.conversionFactor ? r.conversionFactor.toString():null

              //delete r['productID']
            });

          });
          
          console.log(reqData);
          this.excelRestService.saveUOMBulkdata(reqData).subscribe(res => {
            if (res && res.status === 0 && res.data.uomConversionList && res.data.uomConversionList.failureList &&
              res.data.uomConversionList.failureList.length > 0 && res.data.uomConversionList.successList &&
              res.data.uomConversionList.successList.length > 0) {
              this.failureRecords = res.data.uomConversionList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.uomConversionList.duplicateList);
              this.toastr.error('Partially failed in uploading, Please download log for reasons');
              this.fetchAllUOMs();
            } else if (res && res.status === 0 && res.data.uomConversionList && res.data.uomConversionList.failureList && res.data.uomConversionList.failureList.length > 0) {
              this.failureRecords = res.data.uomConversionList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.uomConversionList.duplicateList);
              this.toastr.error('Failed in uploading, Please download log for reasons');
            } else if (res && res.status === 0 && res.data.uomConversionList && res.data.uomConversionList.failureList && res.data.uomConversionList.failureList.length === 0) {
              if (res && res.status === 0 && res.data.uomConversionList && res.data.uomConversionList.duplicateList && res.data.uomConversionList.duplicateList.length > 0) {
                this.failureRecords = res.data.uomConversionList.duplicateList;
                this.toastr.error('Duplicates present in the excel, Please download log file.');
                this.fetchAllUOMs();
              } else {
                this.fetchAllUOMs();
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
      }, 500);
    }
  }

  mapId(type, value) {
    switch (type) {    
      case 'productID': {
        const productIds = this.products.find(e => e.productID == value);
        console.log(productIds)
        return productIds ? productIds : null;
      }
      case 'productMasterID': {
        const product = this.products.find(e => e.productID === value);
        return product && product._id ? product._id : null;
      }

    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['unitConversionFrom']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.UOM;
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
        fileName: "UOM Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
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
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return fieldName.valid && fieldName.touched;
    }
  }

}
