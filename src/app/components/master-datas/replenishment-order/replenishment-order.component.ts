import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { WMSService } from '../../../services/integration-services/wms.service';
import { CommonService } from '../../../shared/services/common.service';
import { CompleterService, CompleterData } from 'ng2-completer';
import { OutboundProcessService } from '../../../services/integration-services/outboundProcess.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Constants } from '../../../constants/constants'
import { ExcelService } from '../../../shared/services/excel.service';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
@Component({
  selector: 'app-replenishment-order',
  templateUrl: './replenishment-order.component.html'
})
export class ReplenishmentOrderComponent implements OnInit, AfterViewInit, OnDestroy {
  replenishmentOrderForm: FormGroup;
  focusedElement: any;
  replenishmentOrders: any = [];
  productIDNameValues: CompleterData;
  locationNameValues: CompleterData;
  missingParams: any;
  replenishmentInfo: any = {};
  isShowOrHideError: any = false;
  failureRecords: any = [];
  id: any;
  locations: any = [];
  products: any = [];
  productMasterID: any;
  locationID: any;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  deleteInfo: any;
  isReadMode: any = false;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Replenishment', Storage.getSessionUser());
  forPermissionsSubscription: any;
  productLogo: any;
  showImage: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  brandConfigurationsResponceList: any=[]
  brandConfigureIDs: any=[]

  constructor(private toastr: ToastrService, private configService: ConfigurationService,
    private wmsService: WMSService, private metaDataService: MetaDataService,
    public ngxSmartModalService: NgxSmartModalService,
    private completerService: CompleterService,
    private outboundProcessService: OutboundProcessService,
    private excelService: ExcelService,
    private excelRestService: ExcelRestService,
    private commonService: CommonService,
    private translate: TranslateService,) {
    this.createReplenishmentOrderForm();
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
    /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
       if (data) {
         this.formObj = this.configService.getGlobalpayload();
         this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Replenishment', Storage.getSessionUser());
         this.getFunctionCalls()
       }
     }) */
    this.getFunctionCalls()
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })

  
  }

  getFunctionCalls() {
    if (this.permissionsList.includes('View')) {
      this.findAllReplenishmentOrderMetaDetails();
      this.fetchMetaData();
      this.fetchAllBrandConfigurations()
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  save() {
    
 if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      this.replenishmentInfo = this.replenishmentOrderForm.value;
      if (this.replenishmentOrderForm.value.replenishmentQuantity <= 0) {
        this.toastr.error("The Replenishment quantity should be greater than zero.");
      }
      else{

      
      this.replenishmentInfo.productMasterInfo.productMasterID = this.productMasterID;
      this.replenishmentInfo.locationInfo.locationID = this.locationID;
      this.replenishmentInfo = this.replenishmentOrderForm.value;
      if (this.id) {
        this.replenishmentInfo._id = this.id;
      }
      else {
        this.replenishmentInfo['organizationInfo'] = this.configService.getOrganization();
        this.replenishmentInfo['wareHouseInfo'] = this.configService.getWarehouse();
      }
      this.outboundProcessService.saveOrUpdateReplenishmentOrder(JSON.stringify(this.replenishmentInfo)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.replenishmentOrderMap) {
            this.toastr.success('Saved successfully');
            this.replenishmentOrderForm.reset();
            if (this.showImage) {
              const element = <HTMLImageElement>(document.getElementById('pLogo'));
              element.src = null;
            }
            this.findAllReplenishmentOrderMetaDetails();
            this.id = ''
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
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  edit(data) {
    this.globalIDs = data._id
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.makeReadOnly = false;
      this.makeThisDisabled = false;
      this.isReadMode = true
      this.locationID = data.locationInfo.locationID;
      this.productMasterID = data.productMasterInfo.productMasterID;
      this.replenishmentOrderForm.patchValue(data);
      if (data.productImage && this.showImage) {
        const fileNames = JSON.parse(JSON.stringify(data.productImage));
        this.metaDataService.viewImages(fileNames).subscribe(data => {
          if (data['status'] == 0) {
            this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
            this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
            this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
          }
        });
      }
      this.id = data._id;
      window.scroll(0, 0);
    }
    else if (this.permissionsList.includes('View')) {
      this.replenishmentOrderForm.patchValue(data);
      this.makeReadOnly = true;
      this.makeThisDisabled = true;

    }
  }
  clear() {
    this.replenishmentOrderForm.reset();
    this.isReadMode = false
    this.id = ''
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
  }
  createReplenishmentOrderForm() {
    this.replenishmentOrderForm = new FormBuilder().group({
      productMasterInfo: new FormBuilder().group({
        productIDName: ['', Validators.required],
        productID: [''],
        productName: [''],
      }),
      locationInfo: new FormBuilder().group({
        locationName: ['', [Validators.required]],
      }),
      productImage: null,
      replenishmentQuantity: ['', [Validators.required]],
      thresholdQuantity: [''],
      areaReplenishmentAllows: ['true'],
      reason: [''],
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
      brandNames: null,
    });
  }
  findAllReplenishmentOrderMetaDetails() {
    this.outboundProcessService.fetchReplenishmentOrders(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.replenishmentOrderMaps) {
          this.replenishmentOrders = response.data.replenishmentOrderMaps;
          this.rerender();
        } else {
          this.replenishmentOrders = [];
        }
      },
      (error) => {
        this.replenishmentOrders = [];
      });
  }
  fetchMetaData() {
    this.wmsService.fetchAllLocations(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locations = response.data.locations;
          this.locationNameValues = this.completerService.local(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.locations, 'locationName'));
        } else {
          this.locations = [];
        }
      },
      (error) => {
        this.locations = [];
      });
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
          this.productIDNameValues = this.completerService.local(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.productMasters, 'productIDName'));
        } else {
          this.products = [];
        }
      },
      (error) => {
        this.products = [];
      });
    this.metaDataService.getImageConfigbyName(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Replenishment') ? true : false;
      }
    })
  }
  getSelectedValue(type) {
    switch (type) {
      case 'productIDName': {
        this.products.forEach(product => {
          if (product.productIDName === this.replenishmentOrderForm.value.productMasterInfo.productIDName) {
            this.productMasterID = product._id;
            this.replenishmentOrderForm.controls['productMasterInfo']['controls'].productID.setValue(product.productID);
            this.replenishmentOrderForm.controls['productMasterInfo']['controls'].productName.setValue(product.productName);
            this.replenishmentOrderForm.controls.productImage.setValue(product.productImage);
            if (product.productImage && this.showImage) {
              const fileNames = JSON.parse(JSON.stringify(product.productImage));
              this.metaDataService.viewImages(fileNames).subscribe(data => {
                if (data['status'] == 0) {
                  this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
                  this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
                  this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
                }
              });
            }
          }
        });
        break;
      }
      case 'locationName': {
        this.locations.forEach(location => {
          if (location.locationName === this.replenishmentOrderForm.value.locationInfo.locationName) {
            this.locationID = location._id;
          }
        });
        break;
      }
    }
  }
  /*  isButtonDisabled(formName) {
     return this.util.isButtonDisabled(formName);
   } */
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'replenishment', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.findAllReplenishmentOrderMetaDetails();
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
    // this.forPermissionsSubscription.unsubscribe();
  }
  exportAsXLSX() {
    const changedReplanishmentOrderList = this.exportTypeMethod(this.replenishmentOrders)
    this.excelService.exportAsExcelFile(changedReplanishmentOrderList, 'Replenishment Order', null);
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        let brandArr:any = []
        obj['productIDName'] = k.productMasterInfo.productIDName
        obj['createdDate'] = k.createdDate
        obj['locationName'] = k.locationInfo.locationName

        if (k.replenishmentQuantity) {
          obj['replenishmentQuantity'] = DecimalUtils.fixedDecimal(Number(k.replenishmentQuantity),2)
        } else {
          obj['replenishmentQuantity'] = null
        }

       /*  obj['replenishmentQuantity'] = k.replenishmentQuantity */
        obj['thresholdQuantity'] = k.thresholdQuantity
        obj['areaReplenishmentAllows'] = k.areaReplenishmentAllows
        obj['reason'] = k.reason
        if (k.brandNames && k.brandNames.length > 0) {
          brandArr = k.brandNames.join(",")
          obj['brandNames'] = brandArr;
        }
        else {
          obj['brandNames'] = null
        }
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['productIDName'] = null
      obj['createdDate'] = null
      obj['locationName'] = null
      obj['replenishmentQuantity'] = null
      obj['thresholdQuantity'] = null
      obj['areaReplenishmentAllows'] = null
      obj['reason'] = null,
      obj['brandNames'] = null
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
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.REPLENISHMENT;
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
            const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.RELIENISHMENT);
            reqData.forEach(r => {
              let projectInfo = r.productMasterInfo ? this.mapId('productID', r.productMasterInfo.productIDName) : null;
              if (projectInfo) {
                r['productMasterInfo']['productID'] = projectInfo.productID;
                r['productMasterInfo']['productName'] = projectInfo.productName;
                r['productMasterInfo']['productMasterID'] = projectInfo._id;
                r['productMasterInfo']['productIDName'] = projectInfo.productIDName;
              }
              else {
                r['productMasterInfo'] = {}
                r['productMasterInfo']['productID'] = null;
                r['productMasterInfo']['productName'] = null;
                r['productMasterInfo']['productMasterID'] = null
                r['productMasterInfo']['productIDName'] = r.productIDName;
              }
              let locationinfo = r.locationInfo ? this.mapId('locationID', r.locationInfo.locationName) : null;
              if (locationinfo) {
                r['locationInfo']['locationID'] = locationinfo._id
                r['locationInfo']['locationName'] = locationinfo.locationName
              } else {
                r['locationInfo'] = {};
                r['locationInfo']['locationID'] = null
                r['locationInfo']['locationName'] = r.locationName
              }
              r['brandNames'] = this.getBrandFraming(r);
              delete r.productIDName
              delete r.locationName
              reqData.forEach(r => {
                r['organizationInfo'] = this.configService.getOrganization();
                r['wareHouseInfo'] = this.configService.getWarehouse();
                r.replenishmentQuantity = r.replenishmentQuantity ? r.replenishmentQuantity.toString():null
                
                r.thresholdQuantity = r.thresholdQuantity ? r.thresholdQuantity.toString():null
              });
            });
            console.log(JSON.stringify(reqData));
            this.excelRestService.saveReplenishmentUploaddata(reqData).subscribe(res => {
              if (res && res.status === 0 && res.data.replenishmentOrderMapList && res.data.replenishmentOrderMapList.failureList &&
                res.data.replenishmentOrderMapList.failureList.length > 0 && res.data.replenishmentOrderMapList.successList &&
                res.data.replenishmentOrderMapList.successList.length > 0) {
                this.failureRecords = res.data.replenishmentOrderMapList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.replenishmentOrderMapList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.findAllReplenishmentOrderMetaDetails();
              } else if (res && res.status === 0 && res.data.replenishmentOrderMapList && res.data.replenishmentOrderMapList.failureList && res.data.replenishmentOrderMapList.failureList.length > 0) {
                this.failureRecords = res.data.replenishmentOrderMapList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.replenishmentOrderMapList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.replenishmentOrderMapList && res.data.replenishmentOrderMapList.failureList && res.data.replenishmentOrderMapList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.replenishmentOrderMapList && res.data.replenishmentOrderMapList.duplicateList && res.data.replenishmentOrderMapList.duplicateList.length > 0) {
                  this.failureRecords = res.data.replenishmentOrderMapList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.findAllReplenishmentOrderMetaDetails();
                } else {
                  this.findAllReplenishmentOrderMetaDetails();
                  this.toastr.success('Uploaded successfully');
                  this.rerender();
                  this.findAllReplenishmentOrderMetaDetails();
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
  fetchAllBrandConfigurations() {
    this.metaDataService.fetchAllBrandConfigurations(this.formObj).subscribe((response) => {
        if (!!response && response.status === 0 && response.data.brandConfigurations) {
          this.brandConfigurationsResponceList = response.data.brandConfigurations;
          this.brandConfigureIDs = response.data.brandConfigurations.map(x => x.brandName);
          /*   console.log(response.data.brandConfigurations); */
        } else {
          this.brandConfigurationsResponceList = [];
        }
      })

  }
  getBrandFraming(k) {
    if (k.brandNames) {
      const brandsArr = k.brandNames.replace(/\, /gi, ',').split(',');
      console.log(brandsArr)
      return brandsArr;
    } else {
      const brandsArr =null;
      return brandsArr;
    }
  }
  mapId(type, value) {
    switch (type) {
      case 'locationID': {
        const location = this.locations.find(e => e.locationName === value);
        return location ? location : null;
      }
      // case 'locationName': {
      //   const location = this.locations.find(e => e.locationName === value);
      //   return location && location.locationName ? location.locationName : null;
      // }
      case 'productID': {
        console.log(this.products)
        const product = this.products.find(e => e.productIDName === value);
        return product ? product : null;
      }
      // case 'productName': {
      //   const product = this.products.find(e => e.productIDName === value);
      //   return product && product.productName ? product.productName : null;
      // }
      // case 'productMasterID': {
      //   const product = this.products.find(e => e.productIDName === value);
      //   return product && product._id ? product._id : null;
      // }
      // case 'productIDName': {
      //   const product = this.products.find(e => e.productIDName === value);
      //   return product && product.productIDName ? product.productIDName : null;

      // }
    }
  }

  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['productID'] && record['productName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.REPLENISHMENT_ORDER_DATA.concat(Constants.UPLOAD_MANDAT_FIELDS.REPLENISHMENT_ORDER_DATA);
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        } else {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.REPLENISHMENT_ORDER_DATA;
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
        fileName: "Replenishment Error Reasons",
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
  };

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
            const { areaReplenishmentAllows, locationName, productID, productIDName, productName,
              reason, replenishmentQuantity, thresholdQuantity } = record;
            if (record['productID'] && record['productName']) {
              endArray.push({
                thresholdQuantity, replenishmentQuantity, reason,areaReplenishmentAllows,
                locationInfo: { locationID: this.mapLocationMasterID(locationName), locationName},
                productMasterInfo: {
                  productMasterID: this.mapProductMasterID(productID),
                  productID,
                  productName,
                  productIDName
                },
              });
            }
          });
          if (endArray && endArray.length > 0) {
            this.excelRestService.saveReplenishmentUploaddata(endArray).subscribe(res => {
              if (res && res.status === 0 && res.data.replenishmentOrderMapList && res.data.replenishmentOrderMapList.failureList &&
                res.data.replenishmentOrderMapList.failureList.length > 0 && res.data.replenishmentOrderMapList.successList &&
                res.data.replenishmentOrderMapList.successList.length > 0) {
                this.failureRecords = res.data.replenishmentOrderMapList.failureList;
                this.failureRecords = res.data.replenishmentOrderMapList.duplicateList.concat(this.failureRecords);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.findAllReplenishmentOrderMetaDetails();
              } else if (res && res.status === 0 && res.data.replenishmentOrderMapList && res.data.replenishmentOrderMapList.failureList && res.data.replenishmentOrderMapList.failureList.length > 0) {
                this.failureRecords = res.data.replenishmentOrderMapList.failureList;
                this.failureRecords = res.data.replenishmentOrderMapList.duplicateList.concat(this.failureRecords);
                console.log(this.failureRecords);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.replenishmentOrderMapList && res.data.replenishmentOrderMapList.failureList && res.data.replenishmentOrderMapList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.replenishmentOrderMapList && res.data.replenishmentOrderMapList.duplicateList && res.data.replenishmentOrderMapList.duplicateList.length > 0) {
                  this.failureRecords = res.data.replenishmentOrderMapList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.findAllReplenishmentOrderMetaDetails();
                } else {
                  this.findAllReplenishmentOrderMetaDetails();
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
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        if (record['productID'] && record['productName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.REPLENISHMENT_ORDER_DATA.concat(Constants.UPLOAD_MANDAT_FIELDS.REPLENISHMENT_ORDER_DATA);
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        } else {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.REPLENISHMENT_ORDER_DATA;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArray;
  }

  mapProductMasterID(productID) {
    if (productID && this.products.length > 0) {
      const filteredProduct = this.products.find(product => product.productID === productID);
      if (filteredProduct && filteredProduct._id) {
        return filteredProduct._id;
      }
    }
  }
  mapLocationMasterID(locationName) {
    if (locationName && this.locations.length > 0) {
      const filteredLocation = this.locations.find(location => location.locationName === locationName);
      if (filteredLocation && filteredLocation._id) {
        return filteredLocation._id;
      }
    }
  } */
}
