
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ApexService } from '../../../shared/services/apex.service';
import { ProductStrategyEntity } from '../../../entities/productStrategy.entity';
import { NgForm } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Constants } from '../../../constants/constants';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-strategy',
  templateUrl: './product-strategy.component.html'
})
export class ProductStrategyComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('productStrategyForm') ngForm: NgForm;
  productCategories: any[] = [];
  productStrategies: any[] = [];
  pickingStrategies: any[] = [];
  putawayStrategies: any[] = [];
  strategyTypeDropdown: any = [];
  failureRecords: any = [];
  missingParams: any;
  isShowOrHideError: any = false;
  productCategory: any;
  productStrategyData: any;
  focusedElement: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Product Strategy', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  constructor(private apexService: ApexService, private configService: ConfigurationService,
    public ngxSmartModalService: NgxSmartModalService,
    private wmsService: WMSService,
    private excelRestService: ExcelRestService,
    private excelService: ExcelService,
    private toastr: ToastrService,
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
         this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Product Strategy', Storage.getSessionUser());
         this.getFunctionaCall()
       }
     }) */
    this.getFunctionaCall();


  }
  getFunctionaCall() {
    if (this.permissionsList.includes('View')) {
      this.fetchAllProductCategories();
      this.fetchAllProductStrategies();
      this.fetchAllPickingStrategies();
      this.fetchAllPutawayStrategies();
      this.productStrategyData = new ProductStrategyEntity();
      this.apexService.getPanelIconsToggle();
    }
  }
  save(productStrategyForm: NgForm) {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      if (!this.productStrategyData._id) {
        this.productStrategyData['organizationInfo'] = this.configService.getOrganization();
        this.productStrategyData['wareHouseInfo'] = this.configService.getWarehouse();
      }
      this.wmsService.saveOrUpdateProductStrategyDetails(JSON.stringify(this.productStrategyData)).subscribe(
        (response) => {
          if (!!response && response.status === 0) {
            this.productStrategyData = {
              productCategoryInfo: {},
              putawayStrategyInfo: {},
              pickingStrategyInfo: {}
            };
            this.fetchAllProductStrategies();
            this.toastr.success('Product Strategy updated.');
            this.makeThisDisabled = false;
            productStrategyForm.form.reset();
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in updating product strategy.');
          }
        },
        (error) => {
          this.toastr.error('Failed in updating product strategy.');
        }
      );
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  newObject = {}
  globalIDs:any;
  editProductStrategyDetails(details) {
    this.globalIDs = details._id

    console.log(details);
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      if (details.putawayStrategyInfo) {
        this.getSelectedValue('pickingStrategyName', details.pickingStrategyInfo.pickingStrategyName)
        this.productStrategyData = Object.assign({}, details);
      } else {
        details.putawayStrategyInfo = { putawayStrategyName: '' };
        this.productStrategyData = Object.assign({}, details);
        details.putawayStrategyInfo = { putawayStrategyName: '' };
      }

      window.scroll(0, 0);
      this.makeReadOnly = false;
      this.makeThisDisabled = true;

    }
    else {
      this.productStrategyData = Object.assign({}, details);
      window.scroll(0, 0);
      this.makeReadOnly = true;
      this.makeThisDisabled = true;
    }
  }
  /*   editProductStrategyDetails(details) {
    console.log(details)
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.productStrategyData = Object.assign({}, details);

      if (details.putawayStrategyInfo) {
        this.productStrategyData = Object.assign({}, details.putawayStrategyInfo);
        this.productStrategyData = Object.assign({}, details.pickingStrategyInfo);
        this.productStrategyData = Object.assign({}, details.productCategoryInfo);
        details.putawayStrategyInfo = {};
        details.pickingStrategyInfo = {};
        details.productCategoryInfo = {};
        details.putawayStrategyInfo = null;
        details.pickingStrategyInfo = null;
        details.productCategoryInfo = null;
      }
      window.scroll(0, 0);
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
    }
    else {
      this.productStrategyData = Object.assign({}, details);
      window.scroll(0, 0);
      this.makeReadOnly = true;
      this.makeThisDisabled = true;





       if(!details.putawayStrategyInfo)
   {
    delete details.putawayStrategyInfo.putawayStrategyID
    console.log(details.putawayStrategyInfo.putawayStrategyID);
    details = {
      putawayStrategyInfo:details.putawayStrategyInfo ? details.putawayStrategyInfo:null
    };
   }
   else if(!details.pickingStrategyInfo)
   {
    details = {
      pickingStrategyInfo:   this.productStrategyData.pickingStrategyInfo ? this.productStrategyData.pickingStrategyInfo:null
    };
   }
  else if(!details.productCategoryInfo)
   {
    details = {
      productCategoryInfo:   this.productStrategyData.productCategoryInfo ?this.productStrategyData.productCategoryInfo:null
    };
   }
   else{
    alert()

   }
    }
  } */
  clearProductStrategyData(productStrategyForm: NgForm) {
    this.makeReadOnly = false;
    this.makeThisDisabled = false;
    this.productStrategyData = {
      productCategoryInfo: {},
      putawayStrategyInfo: {},
      pickingStrategyInfo: {}
    };
    productStrategyForm.form.reset();
  }
  getSelectedValue(type, value) {
    switch (type) {
      case 'productCategory': {
        this.productCategories.forEach(product => {
          if (product.productCategoryName === value) {
            this.productStrategyData.productCategoryInfo.productCategoryID = product._id;
            this.productStrategyData.productCategoryInfo.productCategory = product.productCategory;
          }
        });
        break;
      }
      case 'putawayStrategyName': {
        this.putawayStrategies.forEach(strategy => {
          if (strategy.putawayStrategyName === value) {
            this.productStrategyData.putawayStrategyInfo.putawayStrategyID = strategy._id;
            this.productStrategyData.putawayStrategyInfo.putawayStrategyName = strategy.putawayStrategyName;
          }
        });
        break;
      }
      case 'pickingStrategyName': {
        this.pickingStrategies.forEach(strategy => {
          if (strategy.pickingStrategyName === value) {
            this.productStrategyData.pickingStrategyInfo.pickingStrategyID = strategy._id;
            this.productStrategyData.pickingStrategyInfo.pickingStrategyName = strategy.pickingStrategyName;
          }
        });
        this.strategyTypeDropdown = this.pickingStrategies.filter(x => x.pickingStrategyName == this.productStrategyData.pickingStrategyInfo.pickingStrategyName);
        break;
      }
      case 'pickingStrategyType': {
        this.pickingStrategies.forEach(strategy => {
          if (strategy.pickingStrategyType === value) {
            this.productStrategyData.pickingStrategyType = strategy.pickingStrategyType;
          }
        });
        break;
      }
      default:
        break;
    }
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0) {
          this.productCategories = response.data.productCategories;

        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
  fetchAllProductStrategies() {
    this.wmsService.fetchAllProductStrategies(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0) {
          this.productStrategies = response.data.productStrategies;
          this.rerender();
        } else {
          this.productStrategies = [];
        }
      },
      (error) => {
        this.productStrategies = [];
      });
  }
  fetchAllPickingStrategies() {
    this.wmsService.fetchAllPickingStrategies(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0) {
          this.pickingStrategies = response.data.pickingStrategies;

        } else {
          this.pickingStrategies = [];
        }
      },
      (error) => {
        this.pickingStrategies = [];
      });
  }
  fetchAllPutawayStrategies() {
    this.wmsService.fetchAllPutawayStrategies(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.putawayStrategies = response.data.putawayStrategies;
        } else {
          this.putawayStrategies = [];
        }
      },
      (error) => {
        this.putawayStrategies = [];
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
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'productStrategy', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllProductStrategies();
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
    //this.forPermissionsSubscription.unsubscribe();
  }
  exportAsXLSX() {
    const changedProductStrategy = this.exportTypeMethod(this.productStrategies)
    this.excelService.exportAsExcelFile(changedProductStrategy, 'Product Strategy', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['productCategoryName'] = k.productCategoryInfo.productCategoryName
        if (k.putawayStrategyInfo) {
          obj['putawayStrategyName'] = k.putawayStrategyInfo.putawayStrategyName
        } else {
          obj['putawayStrategyName'] = null
        }
        obj['pickingStrategyName'] = k.pickingStrategyInfo.pickingStrategyName
        obj['pickingStrategyType'] = k.pickingStrategyType
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['productCategoryName'] = null
      obj['putawayStrategyName'] = null
      obj['pickingStrategyName'] = null
      obj['pickingStrategyType'] = null
      arr.push(obj)
    }
    return arr
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.VEHICLE;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        console.log(jsonData);
        if (jsonData.length > 0) {
          event.target.value = '';
          const missingParamsArray = this.mandatoryCheck(jsonData);
          console.log(jsonData);
          if (missingParamsArray.length > 1) {
            this.failureRecords = missingParamsArray;
            this.missingParams = missingParamsArray.join(', ');
            this.toastr.error('Please download log file to fill mandatory fields');
          } else {
            const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.PRODUCT_STRATEGY);
            console.log(JSON.stringify(reqData));
            reqData.forEach(r => {
              console.log(r);
              if (r.putawayStrategyInfo != null && r.putawayStrategyInfo.putawayStrategyName != null) {
                r['putawayStrategyInfo']['putawayStrategyID'] = this.mapId('putawaystrategyid', r.putawayStrategyInfo.putawayStrategyName);
              }
              if (r.productCategoryInfo != null && r.productCategoryInfo.productCategoryName != null) {
                r['productCategoryInfo']['productCategoryID'] = this.mapId('productCategoryName', r.productCategoryInfo.productCategoryName);
              }
              if (r.pickingStrategyInfo != null && r.pickingStrategyInfo.pickingStrategyName != null) {
                r['pickingStrategyInfo']['pickingStrategyID'] = this.mapId('pickingStrategyID', r.pickingStrategyInfo.pickingStrategyName);
              }
              if (r.pickingStrategyInfo != null && r.pickingStrategyInfo.pickingStrategyName != null) {
                r['pickingStrategyInfo']['pickingStrategyType'] = this.mapId('pickingStrategyType', r.pickingStrategyInfo.pickingStrategyName);
              }
              reqData.forEach(r => {
                r['organizationInfo'] = this.configService.getOrganization();
                r['wareHouseInfo'] = this.configService.getWarehouse();
                r.sequenceNumber = r.sequenceNumber ? r.sequenceNumber.toString():null
              });
            });
            console.log(JSON.stringify(reqData));
            this.excelRestService.saveProductStrategyBulkdata(reqData).subscribe(res => {
              console.log((reqData));
              if (res && res.status === 0 && res.data.productStrategyList && res.data.productStrategyList.failureList &&
                res.data.productStrategyList.failureList.length > 0 && res.data.productStrategyList.successList &&
                res.data.productStrategyList.successList.length > 0) {
                this.failureRecords = res.data.productStrategyList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.productStrategyList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllProductStrategies();
              } else if (res && res.status === 0 && res.data.productStrategyList && res.data.productStrategyList.failureList && res.data.productStrategyList.failureList.length > 0) {
                this.failureRecords = res.data.productStrategyList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.productStrategyList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.productStrategyList && res.data.productStrategyList.failureList && res.data.productStrategyList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.productStrategyList && res.data.productStrategyList.duplicateList && res.data.productStrategyList.duplicateList.length > 0) {
                  this.failureRecords = res.data.productStrategyList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllProductStrategies();
                } else {
                  this.fetchAllProductStrategies();
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
      }, 500);
    }
  }

  mapId(type, value) {
    switch (type) {
      case 'putawaystrategyid': {
        console.log(this.putawayStrategies)
        const putaway = this.putawayStrategies.find(e => e.putawayStrategyName === value)
        return putaway && putaway._id ? putaway._id : null;
      }
      case 'productCategoryName': {
        const category = this.productCategories.find(w => w.productCategoryName === value);
        return category && category._id ? category._id : null;
      }
      case 'pickingStrategyID': {
        const picking = this.pickingStrategies.find(w => w.pickingStrategyName === value);
        return picking && picking._id ? picking._id : null;
      }
      case 'pickingStrategyType': {
        console.log(this.pickingStrategies);
        const pickingstrategytype = this.pickingStrategies.find(w => w.pickingStrategyName === value);
        return pickingstrategytype && pickingstrategytype.pickingStrategyType ? pickingstrategytype.pickingStrategyType : null;
      }
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['vehicleNumber']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_STRATEGY;
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
        fileName: "Product Strategy Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
    if (this.missingParams) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Product Strategy Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }


}

/* Upload Excel  */

/*  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.failureRecords = [];
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        const endArray = [];
        event.target.value ='';
        const missingParamsArray = this.mandatoryCheck(jsonData);
        if (missingParamsArray.length > 1) {
          this.failureRecords = missingParamsArray;
          this.toastr.error('Please download log file to fill mandatory fields');
        } else {
          jsonData.forEach(record => {
            const { productCategoryName, pickingStrategyType, putawayStrategyName, pickingStrategyName} = record;
            endArray.push({
              pickingStrategyInfo: {
                pickingStrategyID: this.mapPickingStragetyID(pickingStrategyName, '_id'),
                pickingStrategyName,
              },
              pickingStrategyType,
              productCategoryInfo: {
                productCategoryID: this.mapProductCategoryID(productCategoryName),
                productCategoryName,
              },
              putawayStrategyInfo: {
                putawayStrategyName,
                putawayStrategyID: this.mapPutawayStragetyID(putawayStrategyName)
              }
            });
          });
          if (endArray && endArray.length > 0) {
            this.excelRestService.saveProductStrategyBulkdata(endArray).subscribe(res => {
              if (res && res.status === 0 && res.data.productStrategyList && res.data.productStrategyList.failureList &&
                res.data.productStrategyList.failureList.length > 0 && res.data.productStrategyList.successList &&
                res.data.productStrategyList.successList.length > 0) {
                this.failureRecords = res.data.productStrategyList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.productStrategyList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllProductStrategies();
              } else if (res && res.status === 0 && res.data.productStrategyList && res.data.productStrategyList.failureList && res.data.productStrategyList.failureList.length > 0) {
                this.failureRecords = res.data.productStrategyList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.productStrategyList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.productStrategyList && res.data.productStrategyList.failureList && res.data.productStrategyList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.productStrategyList && res.data.productStrategyList.duplicateList && res.data.productStrategyList.duplicateList.length > 0) {
                  this.failureRecords = res.data.productStrategyList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllProductStrategies();
                } else {
                  this.fetchAllProductStrategies();
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

      }, 500);
    }
  }
  mapPutawayStragetyID(strategyName) {
    if (strategyName && this.putawayStrategies.length > 0) {
      const filteredPutaway = this.putawayStrategies.find(strategy => strategy.putawayStrategyName === strategyName);
      return filteredPutaway._id;
    }
  }
  mapProductCategoryID(categoryName) {
    if (categoryName && this.productCategories.length > 0) {
      const filteredCategory = this.productCategories.find(category => category.productCategoryName === categoryName);
      return filteredCategory._id;
    }
  }
  mapPickingStragetyID(strategyName, type) {
    if (strategyName && this.pickingStrategies.length > 0) {
      const filteredPicking = this.pickingStrategies.find(strategy => strategy.pickingStrategyName === strategyName);
      if (filteredPicking && type === '_id') {
        return filteredPicking._id;
      } else if (filteredPicking && type === 'type') {
        return filteredPicking.pickingStrategyType;
      }
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['productCategoryID'] && record['productCategoryName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_STRATEGY.concat(Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_STRATEGY);
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        } else {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_STRATEGY;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArray;
  }
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Product Strategy Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
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
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  }; */

