import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { InboundMasterDataService } from '../../../services/integration-services/inboundMasterData.service';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ApexService } from '../../../shared/services/apex.service';
import { ProductByCustomer } from '../../../entities/productByCustomer.entity';
import { DataTableDirective } from 'angular-datatables';
import { Util } from 'src/app/shared/utils/util';
import { Constants } from '../../../constants/constants';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
@Component({
  selector: 'app-product-by-customer',
  templateUrl: './product-by-customer.component.html'
})
export class ProductByCustomerComponent implements OnInit, OnDestroy, AfterViewInit {
  productByCustomer: any = {
    productMasterInfo: {},
    productMasterInfos: []

  };
  productsByCustomer: any = {
    productMasterInfos: []
  };

  products: any[] = [];
  customers: any[] = [];
  productByCustomerForm: FormGroup;
  id: any;
  customerID: any;

  customerTypes: any[] = Constants.CUSTOMER_TYPES;
  // productByCustomerData: any = [];
  failureRecords: any = [];
  missingParams: any;
  isShowOrHideError: any = false;
  zonesData: any = [];

  isReadMode: any = false;
  deleteInfo: any;
  productIDNameValues: CompleterData;
  customerIDNameValues: CompleterData;
  storageTypeValues: CompleterData;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Product By Customer', Storage.getSessionUser());
  forPermissionsSubscription: any;
  productLogo: any;
  showImage: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  brandConfigurationsResponceList: any = []
  brandConfigureIDs: any = []
  showTooltip: any = false;

  page: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;

  includeExportData: any = [];
  loopToStop: any = null;
  dataPerPage: any = null;

  focusedElement: any;

  constructor(private apexService: ApexService, private configService: ConfigurationService,
    private wmsService: WMSService,
    private IBMDService: InboundMasterDataService,
    private excelService: ExcelService,
    private completerService: CompleterService,
    private commonService: CommonService,
    private util: Util,
    private excelRestService: ExcelRestService,
    public ngxSmartModalService: NgxSmartModalService,
    private toastr: ToastrService, private metaDataService: MetaDataService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    this.productByCustomer = new ProductByCustomer();
  }
  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.productsByCustomer = {
        productMasterInfos: []
      };
      this.apexService.getPanelIconsToggle();
      this.fetchAllProducts();
      this.fetchAllCustomers();
      this.fetchAllUnits();
      this.createProductByCustomerForm();
      this.fetchAllProductByCustomerData();
      this.fetchAllBrandConfigurations();

    }
  }
  receivingUnitValues: CompleterData;
  units: any;
  fetchAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.units.length) {
          this.units = response.data.units;
          this.receivingUnitValues = response.data.units.map(unitCodes => unitCodes.unitCode);
        }
      },
      error => {
        this.units = [];
      });
  }
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      this.productByCustomer.productMasterInfos = [];
      this.productByCustomer.productMasterInfos.push(this.productByCustomer.productMasterInfo);
      const reqPayload = Object.assign({}, this.productByCustomer);
      delete reqPayload.productMasterInfo;
      reqPayload.productMasterInfos[0].leadTime = this.productByCustomerForm.controls.leadTime.value;
      reqPayload.productMasterInfos[0].receivingUnit = this.productByCustomerForm.controls.receivingUnit.value;
      reqPayload.productMasterInfos[0].moq = this.productByCustomerForm.controls.moq.value;
      reqPayload.productMasterInfos[0].markup = this.productByCustomerForm.controls.markup.value;
      reqPayload.productMasterInfos[0].markupType = this.productByCustomerForm.controls.markupType.value;
      if (this.productByCustomerForm.controls.brandNames.value && this.productByCustomerForm.controls.brandNames.value.length > 0) {
        reqPayload.productMasterInfos[0].brandNames = this.productByCustomerForm.controls.brandNames.value;
      } else {
        reqPayload.productMasterInfos[0].brandNames = null;
      } reqPayload.customerType = this.productByCustomerForm.controls.customerType.value;
      delete reqPayload.markupType;
      delete reqPayload.brandNames;
      delete reqPayload.markupPercentage;
      delete reqPayload.markup;
      if (this.productByCustomer && this.productByCustomer._id) {
        this.IBMDService.UpdateIndividualProductByCustomer(JSON.stringify(reqPayload)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.productByCustomer) {
              this.productsByCustomer = response.data.productByCustomer;
              this.toastr.success('Updated details successfully');
              this.isReadMode = false;
              this.productByCustomerForm.controls.productIDName.setValue(null)
              this.productByCustomerForm.controls.leadTime.setValue(null)
              this.productByCustomerForm.controls.moq.setValue(null)
              this.productByCustomerForm.controls.receivingUnit.setValue(null)
              this.productByCustomerForm.controls.brandNames.setValue(null)
              this.productByCustomerForm.controls.markupType.setValue(null)
              this.productByCustomerForm.controls.markup.setValue(null)
              this.brandConfigureIDs = []
              if (this.showImage) {
                const element = <HTMLImageElement>(document.getElementById('pLogo'));
                element.src = null;
              }
              // this.productByCustomerForm.reset();
              this.fetchAllProductsByCustomerID();
              // this.fetchAllProductByCustomerData();
            } else if (response && response.status === 2 && response.statusMsg) {
              this.toastr.error(response.statusMsg);
            } else {
              this.toastr.error('Failed in updating details');
            }
          },
          (error) => {
            this.toastr.error('Failed in updating details');
          });
      } else {
        reqPayload['organizationInfo'] = this.configService.getOrganization();
        reqPayload['wareHouseInfo'] = this.configService.getWarehouse();
        this.IBMDService.saveOrUpdateProductByCustomer(JSON.stringify(reqPayload)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.productByCustomer) {
              this.productsByCustomer = response.data.productByCustomer;
              this.toastr.success('Details saved successfully');
              this.isReadMode = false;
              this.productByCustomerForm.controls.productIDName.setValue(null)
              this.productByCustomerForm.controls.leadTime.setValue(null)
              this.productByCustomerForm.controls.moq.setValue(null)
              this.productByCustomerForm.controls.receivingUnit.setValue(null)
              this.productByCustomerForm.controls.brandNames.setValue(null)
              this.productByCustomerForm.controls.markupType.setValue(null)
              this.productByCustomerForm.controls.markup.setValue(null)
              if (this.showImage) {
                const element = <HTMLImageElement>(document.getElementById('pLogo'));
                element.src = null;
              }
              //this.productByCustomerForm.reset();
              this.fetchAllProductsByCustomerID();
              // this.fetchAllProductByCustomerData();
            } else if (response && response.status === 2 && response.statusMsg) {
              this.toastr.error(response.statusMsg);
            } else {
              this.toastr.error('Failed in saving');
            }
          },
          (error) => {
            this.toastr.error('Failed in saving');
          });
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
    this.globalIDs = null;
  }

  fetchAllProductsByCustomerID(page?) {
    const customeridname = this.productByCustomerForm.controls.customerIDName.value;
    if (customeridname) {
      const form = {
        "page": page ? page : 1,
        "pageSize": this.itemsPerPage,
        "sortDirection": null,
        "sortFields": null,
        "searchOnKeys": PaginationConstants.productByCustomerSearchOnKeys,
        "searchKeyword": this.searchKey,
        "organizationIDName": this.formObj.organizationIDName,
        "wareHouseIDName": this.formObj.wareHouseIDName,
        "customerIDName": customeridname,
      }
      this.IBMDService.fetchProductByCustomerByIDWithPagination(form).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productByCustomerPaginationResponse.productByCustomers.length) {
            this.productsByCustomer = response.data.productByCustomerPaginationResponse.productByCustomers[0];
            this.totalItems = response.data.productByCustomerPaginationResponse.totalElements;
          } else {
            this.productsByCustomer = {
              productMasterInfos: []
            };
          }
        },
        (error) => {
          this.productsByCustomer = {
            productMasterInfos: []
          };
        });
    }
  }
  fetchAllProductByCustomerData() {
    const form = {
      "page": 1,
      "pageSize": this.itemsPerPage,
      "sortDirection": null,
      "sortFields": null,
      "searchOnKeys": null,
      "searchKeyword": this.searchKey,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
    }
    this.IBMDService.fetchProductByCustomerByIDWithPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productByCustomerPaginationResponse.productByCustomers.length) {
          const total = response.data.productByCustomerPaginationResponse.totalElements;
          const lengthofTotalItems = total.toString().length;
          const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          count.forEach(el => {
            if (lengthofTotalItems == el) {
              let value: any = 1 + this.configService.addZerosMethod(el);
              this.dataPerPage = parseInt(value);
            }
          });
          const n: any = (total / this.dataPerPage).toString()
          let m = n.split('.')
          if (m[1]) {
            this.loopToStop = parseInt(m[0]) + 1
          } else {
            this.loopToStop = parseInt(m[0])
          }
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllProducts() {
    this.metaDataService.getImageConfigbyName(this.configService.getGlobalpayload()).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Product by Customer') ? true : false;
      }
    })
    this.productIDNameValues = this.completerService.local(
      this.commonService.getFiltValuesFromArrayOfObjs([], 'productIDName'));
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
          this.productIDNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.productMasters, 'productIDName'));
        } else {
          this.products = [];
        }
      },
      (error) => {
        this.products = [];
      });
  }

  fetchAllCustomers() {
    this.IBMDService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers) {
          this.customers = response.data.customers;
          this.customerIDNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.customers, 'customerIDName'));
        } else {
          this.customers = [];
        }
      },
      (error) => {
        this.customers = [];
      });
  }
  globalIDs: any;
  edit(data: any, product: any, key?) {
    this.globalIDs = data._id;
    this.fetchAllBrandConfigurations();
    this.productLogo = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      window.scroll(0, 0);
      this.productByCustomerForm.patchValue({
        customerID: data.customerID,
        customerIDName: data.customerIDName,
        customerName: data.customerName,
        customerType: data.customerType,
        // productIDName: product.productIDName,
        // leadTime: product.leadTime,
        // receivingUnit: product.receivingUnit,
        // // status: data.status,
        // moq: product.moq
      });
      this.productByCustomerForm.controls.leadTime.setValue(product.leadTime)
      this.productByCustomerForm.controls.productIDName.setValue(product.productIDName)
      this.productByCustomerForm.controls.moq.setValue(product.moq)
      this.productByCustomerForm.controls.receivingUnit.setValue(product.receivingUnit);
      this.productByCustomerForm.controls.productImage.setValue(product.productImage);
      this.productByCustomerForm.controls.markup.setValue(product.markup);
      this.productByCustomerForm.controls.markupType.setValue(product.markupType);
      this.productByCustomerForm.controls.brandNames.setValue(product.brandNames);
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

      this.productByCustomer = Object.assign({}, data);
      if (key) {
        this.getSelected('customerIDName');
        this.getSelected('productIDName');
        this.getSelected('productIDName', product.productIDName);
      }

    }
    else if (this.permissionsList.includes('View')) {
      this.productByCustomerForm.disable();
      window.scroll(0, 0);
      this.productByCustomerForm.patchValue({
        customerID: data.customerID,
        customerIDName: data.customerIDName,
        customerName: data.customerName,
        customerType: data.customerType,
        //  productIDName: product.productIDName,
        // leadTime: product.leadTime,
        status: data.status,
        brandNames: data.brandNames
        // moq: product.moq
      });
      this.productByCustomerForm.controls.leadTime.setValue(product.leadTime)
      this.productByCustomerForm.controls.productIDName.setValue(product.productIDName)
      this.productByCustomerForm.controls.moq.setValue(product.moq)
      this.productByCustomerForm.controls.receivingUnit.setValue(product.receivingUnit);
      this.productByCustomerForm.controls.productImage.setValue(product.productImage);
      this.productByCustomerForm.controls.markup.setValue(product.markup);
      this.productByCustomerForm.controls.markupType.setValue(product.markupType);
      this.productByCustomerForm.controls.brandNames.setValue(product.brandNames);
      this.productByCustomer = Object.assign({}, data);
      if (key) {
        this.getSelected('customerIDName');
        this.getSelected('productIDName');
        this.getSelected('productIDName', product.productIDName);
      }

    }
  }
  getSelected(type, value?) {
    switch (type) {
      case 'customerIDName': {
        this.customers.forEach(customer => {
          if (customer.customerIDName === this.productByCustomerForm.value.customerIDName) {
            this.productByCustomer.customerIDName = customer.customerIDName;
            this.productByCustomer.customerID = customer.customerID;
            this.productByCustomer.customerType = customer.customerType;
            this.customerID = customer.customerID;
            this.productByCustomer.customerName = customer.customerName;
            this.productByCustomerForm.patchValue(this.productByCustomer);
            this.productsByCustomer = {
              productMasterInfos: []
            };
            this.fetchAllProductsByCustomerID();
            this.isReadMode = true;
          }
        });
        break;
      }
      case 'productIDName': {
        this.productLogo = null;
        if (this.showImage) {
          const element = <HTMLImageElement>(document.getElementById('pLogo'));
          element.src = null;
        }

        // if (this.productsByCustomer && this.productsByCustomer.productMasterInfos.find(x => x.productIDName == this.productByCustomerForm.value.productIDName)) {
        //   this.edit(this.productsByCustomer, this.productsByCustomer.productMasterInfos.find(x => x.productIDName == this.productByCustomerForm.value.productIDName));
        // }
        // else {
        this.products.forEach(product => {
          if (product.productIDName === this.productByCustomerForm.value.productIDName) {
            this.productByCustomer.productMasterInfo = {};
            this.productByCustomer.productMasterInfo.productMasterID = product._id;
            this.productByCustomer.productMasterInfo.productIDName = product.productIDName;
            this.productByCustomer.productMasterInfo.productName = product.productName;
            this.productByCustomer.productMasterInfo.productID = product.productID;
            this.productByCustomer.productMasterInfo.leadTime = product.leadTime;
            this.productByCustomer.productMasterInfo.moq = product.moq;
            this.productByCustomer.productMasterInfo.productImage = product.productImage;

            this.productByCustomer.markup = product.markup;
            this.productByCustomer.markupType = product.markupType;

            this.productByCustomer.productMasterInfo.receivingUnit = product.receivingUnit;
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
            if (product.productImage) {
              this.onImageAvailble();
            }
            else {
              this.onNonAvailbleImage();

            }
            // this.productByCustomerForm.controls.leadTime.setValue(product.leadTime);
            // this.productByCustomerForm.controls.moq.setValue(product.moq);
            // this.productByCustomerForm.controls.receivingUnit.setValue(product.receivingUnit);

          }
        });
        // }
        break;
      }
      default:
        break;
    }
  }
  clear() {
    this.productByCustomerForm.reset();
    this.productByCustomer = {};
    this.isReadMode = false;
    this.productByCustomerForm.enable();
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
      this.onNonAvailbleImage();
    }
  }
  createProductByCustomerForm() {
    this.productByCustomerForm = new FormBuilder().group({
      customerID: ['', Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      customerName: ['', Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      customerType: ['', Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      customerIDName: ['', Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      productIDName: ['', Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      productImage: [''],
      leadTime: [''],
      // status: ['', Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      moq: ['', Validators.compose([null, Validators.required, Validators.maxLength(99)])],
      markup: null,
      markupType: null,
      brandNames: null,
      receivingUnit: [''],
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
      }
    });
  }
  ngOnDestroy(): void {
  }
  ngAfterViewInit(): void {
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
      return this.productByCustomerForm.controls[fieldName].valid && this.productByCustomerForm.controls[fieldName].touched;
    }
  }
  delete(header, data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'productsByCustomer', id: header._id, productMasterID: data.productMasterID };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'productsByCustomer') {
      this.fetchAllProductsByCustomerID();
    }
  }
  exportAsXLSX() {
    const data = this.excelService.formatJSONForHeaderLines(this.includeExportData, 'productMasterInfos');
    const changedData = this.exportTypeMethod(data)
    this.excelService.exportAsExcelFile(changedData, 'Product By Customer', null);
  }
  exportTypeMethod(data) {

    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        let brandArr: any = []
        const obj = {}
        if (k.customerIDName) {
          let customerIDs = k.customerIDName.split(":")[0]
          obj['customerID'] = customerIDs
        }
        obj['productID'] = k.productID
        if (k.brandNames && k.brandNames.length > 0) {
          brandArr = k.brandNames.join(",")
          obj['brandNames'] = brandArr;
        }
        else {
          obj['brandNames'] = null
        }
        obj['moq'] = k.moq
        obj['leadTime'] = k.leadTime
        obj['receivingUnit'] = k.receivingUnit
        if (k.markup) {

          obj['markup'] = DecimalUtils.fixedDecimal(Number(k.markup), 2)
        }
        else {
          obj['markup'] = null

        }
        /*  obj['markup'] = k.markup */
        obj['markupType'] = k.markupType
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['customerID'] = null
      obj['productID'] = null
      obj['brandNames'] = null
      obj['moq'] = null
      obj['leadTime'] = null
      obj['receivingUnit'] = null
      obj['markup'] = null
      obj['markupType'] = null
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
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        const data1 = [];
        const logs = [];
        // const missingParamsArray = [];
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
            k['brandNames'] = this.getBrandFraming(k);
            if (k['customerID']) {

              data1.push(this.getProductByCustomerHeadersData(k));
              inValidRecord = false
            } else if (!k['customerID']) {
              if (data1.length > 0) {
                data1[data1.length - 1]['productMasterInfos'].push(this.getProductBycustomerLinesData(k))
              }
            } else {
              if (!k['customerID']) {
                inValidRecord = true;
                logs.push(this.getProductByCustomerHeadersData(k));
                const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_BY_CUSTOMER_HEADER;
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
                if (r.productMasterInfos && r.productMasterInfos.length > 0) {
                  r.productMasterInfos.forEach(ele => {
                    if (ele) {
                      Object.keys(ele).forEach((elr, i) => {
                        ele[elr] = typeof (ele[elr]) === 'string' ? ele[elr].trim() : ele[elr];
                      })
                    }
                  })
                }
                const reqDataNew = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.PBCUSTOMER);

                reqDataNew.forEach(j => {

                  const reqDataForProduct = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.PBS);

                  reqDataForProduct.forEach(k => {
                    if (k.productID) {
                      let produc = this.mapId('productID', k.productID);

                      if (produc) {

                        k['productMasterInfo']['productID'] = produc.productID
                        k['productMasterInfo']['productName'] = produc.productName;
                        k['productMasterInfo']['productMasterID'] = produc._id;
                        k['productMasterInfo']['productIDName'] = produc.productIDName;
                      } else {
                        k['productMasterInfo']['productID'] = null
                        k['productMasterInfo']['productName'] = null;
                        k['productMasterInfo']['productMasterID'] = null;
                        k['productMasterInfo']['productIDName'] = k.productID;
                      }
                    }
                  })
                })
              });

            });
            this.excelRestService.saveProductByCustomerBulkdata(data1).subscribe(res => {
              if (res && res.status === 0 && res.data.productByCustomerList && res.data.productByCustomerList.failureList && res.data.productByCustomerList.failureList.length > 0 && res.data.productByCustomerList.successList && res.data.productByCustomerList.successList.length > 0) {
                this.failureRecords = res.data.productByCustomerList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.productByCustomerList.duplicateList);

                this.toastr.error('Partially failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.productByCustomerList && res.data.productByCustomerList.failureList && res.data.productByCustomerList.failureList.length > 0) {
                this.failureRecords = res.data.productByCustomerList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.productByCustomerList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.productByCustomerList && res.data.productByCustomerList.failureList && res.data.productByCustomerList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.productByCustomerList && res.data.productByCustomerList.duplicateList && res.data.productByCustomerList.duplicateList.length > 0) {
                  this.failureRecords = res.data.productByCustomerList.duplicateList;

                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                } else {
                  this.toastr.success('Uploaded successfully');
                  this.productByCustomer = {};
                  this.failureRecords = [];
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
  mapId(type, value) {
    switch (type) {
      case 'productID': {
        const productIds = this.products.find(e => e.productID == value);

        return productIds ? productIds : null;
      }
      case 'customerID': {
        const customerIds = this.customers.find(e => e.customerID == value);

        return customerIds ? customerIds : null;
      }
    }
  }
  getBrandFraming(k) {
    if (k.brandNames) {
      const brandsArr = k.brandNames.replace(/\, /gi, ',').split(',');
      return brandsArr;
    } else {
      const brandsArr = null;
      return brandsArr;
    }
  }
  getProductByCustomerHeadersData(k) {
    let obj = {}
    if (typeof k.customerID === 'string') {


      let customer = this.mapId('customerID', k.customerID.trim());
      if (customer) {
        obj['customerIDName'] = customer.customerIDName ? customer.customerIDName : null,
          obj['customerID'] = customer.customerID ? customer.customerID : null,
          obj['customerName'] = customer.customerName ? customer.customerName : null,
          obj['customerType'] = customer.customerType ? customer.customerType : null
      }
      else if (k) {
        obj['customerIDName'] = k.customerIDName ? k.customerIDName : null,
          obj['customerID'] = k.customerID ? k.customerID : null,
          obj['customerName'] = k.customerName ? k.customerName : null,
          obj['customerType'] = k.customerType ? k.customerType : null
      }
      obj['organizationInfo'] = this.configService.getOrganization(),
        obj['wareHouseInfo'] = this.configService.getWarehouse(),
        obj['productMasterInfos'] = [this.getProductBycustomerLinesData(k)]
      return obj;
    }
    else {
      let customer = this.mapId('customerID', k.customerID);
      if (customer) {
        obj['customerIDName'] = customer.customerIDName ? customer.customerIDName : null,
          obj['customerID'] = customer.customerID ? customer.customerID : null,
          obj['customerName'] = customer.customerName ? customer.customerName : null,
          obj['customerType'] = customer.customerType ? customer.customerType : null
      }
      else if (k) {
        obj['customerIDName'] = k.customerIDName ? k.customerIDName : null,
          obj['customerID'] = k.customerID ? k.customerID : null,
          obj['customerName'] = k.customerName ? k.customerName : null,
          obj['customerType'] = k.customerType ? k.customerType : null
      }
      obj['organizationInfo'] = this.configService.getOrganization(),
        obj['wareHouseInfo'] = this.configService.getWarehouse(),
        obj['productMasterInfos'] = [this.getProductBycustomerLinesData(k)]
      return obj;

    }
  }
  getProductBycustomerLinesData(document?) {
    let productobj = {}

    if (typeof document.productID === 'string') {
      if (document) {
        let product = this.mapId('productID', document.productID ? document.productID.toString().trim() : null);
        if (product) {
          productobj["productIDName"] = product ? product.productIDName : null,
            productobj["productID"] = product ? product.productID : null
          productobj["productName"] = product ? product.productName : null,
            productobj["productMasterID"] = product ? product._id : null,
            productobj["markup"] = document ? document.markup ? document.markup.toString() : null : null,
            productobj["markupType"] = document ? document.markupType : null,
            productobj["brandNames"] = document ? document.brandNames : null,
            productobj["moq"] = document ? document.moq ? document.moq.toString() : null : null,
            productobj["leadTime"] = document ? document.leadTime ? document.leadTime.toString() : null : null,
            productobj["receivingUnit"] = document ? document.receivingUnit : null
        }
        else if (document) {
          productobj["productIDName"] = document.productIDName ? document.productIDName : null,
            productobj["moq"] = document.moq ? document.moq.toString() : null,
            productobj["leadTime"] = document.leadTime ? document.leadTime.toString() : null,
            productobj["receivingUnit"] = document.moq ? document.receivingUnit : null,
            productobj["productID"] = document.productID ? document.productID : null
          productobj["productName"] = document.productName ? document.productName : null,
            productobj["productMasterID"] = document._id ? document._id : null,
            productobj["markup"] = document.markup ? document.markup.toString() : null,
            productobj["markupType"] = document.markupType ? document.markupType : null,
            productobj["brandNames"] = document.brandNames ? document.brandNames : null
        }
      }
      return productobj;
    }
    else {
      if (document) {
        let product = this.mapId('productID', document.productID ? document.productID.toString().trim() : null);
        if (product) {
          productobj["productIDName"] = product ? product.productIDName : null,
            productobj["productID"] = product ? product.productID : null
          productobj["productName"] = product ? product.productName : null,
            productobj["productMasterID"] = product ? product._id : null,
            productobj["markup"] = document ? document.markup ? document.markup.toString() : null : null,
            productobj["markupType"] = document ? document.markupType : null,
            productobj["brandNames"] = document ? document.brandNames : null,
            productobj["moq"] = document ? document.moq.toString() : null,
            productobj["leadTime"] = document ? document.leadTime ? document.leadTime.toString() : null : null,
            productobj["receivingUnit"] = document ? document.receivingUnit : null
        }
        else if (document) {
          productobj["productIDName"] = document.productIDName ? document.productIDName : null,
            productobj["moq"] = document.moq ? document.moq.toString() : null,
            productobj["leadTime"] = document.leadTime ? document.leadTime.toString() : null,
            productobj["receivingUnit"] = document.moq ? document.receivingUnit : null,
            productobj["productID"] = document.productID ? document.productID : null
          productobj["productName"] = document.productName ? document.productName : null,
            productobj["productMasterID"] = document._id ? document._id : null,
            productobj["markup"] = document.markup ? document.markup.toString() : null,
            productobj["markupType"] = document.markupType ? document.markupType : null,
            productobj["brandNames"] = document.brandNames ? document.brandNames : null
        }
      }
      return productobj;

    }
  }
  fetchAllBrandConfigurations() {
    this.metaDataService.fetchAllBrandConfigurations(this.formObj).subscribe(
      (response) => {
        if (!!response && response.status === 0 && response.data.brandConfigurations) {
          this.brandConfigurationsResponceList = response.data.brandConfigurations;
          this.brandConfigureIDs = response.data.brandConfigurations.map(x => x.brandName);

        } else {
          this.brandConfigurationsResponceList = [];
        }
      },
      (error) => {
        this.brandConfigurationsResponceList = [];
      });
  }
  // mapId(type, value) {
  //   switch (type) {
  //     case 'productMasterID': {
  //       const product = this.products.find(w => w.productIDName === value.trim())
  //       return product && product._id ? product._id : null;
  //     }
  //     case 'productID': {
  //       const product = this.products.find(w => w.productIDName === value.trim())
  //       return product && product.productID ? product.productID : null;
  //     }
  //     case 'productName': {
  //       const product = this.products.find(w => w.productIDName === value.trim())
  //       return product && product.productName ? product.productName : null;
  //     }
  //     case 'customerID': {
  //       const customer = this.customers.find(w => w.customerIDName === value.trim())
  //       return customer && customer.customerID ? customer.customerID : null;
  //     }
  //     case 'customerName': {
  //       const customer = this.customers.find(w => w.customerIDName === value.trim())
  //       return customer && customer.customerName ? customer.customerName : null;
  //     }
  //     case 'customerType': {
  //       const customer = this.customers.find(w => w.customerIDName === value.trim())
  //       return customer && customer.customerType ? customer.customerType : null;
  //     }
  //   }
  // }
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

  mandatoryCheckForHeaderLines(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      let record = data[0];
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_BY_CUSTOMER
      const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
      if (missingParams.length > 0) {
        missingParamsArray.push(`Row No. ${1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
      }

    }
    return missingParamsArray;
  }

  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Product By Customer Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }

  rightImageAvailble: boolean = false;
  leftImageAvailble: boolean = true;
  onImageAvailble() {
    this.rightImageAvailble = true;
    this.leftImageAvailble = false;
  }
  onNonAvailbleImage() {
    this.rightImageAvailble = false;
    this.leftImageAvailble = true;
  }
  getAllRecordsToDownload(index) {
    if (!index) {
      this.includeExportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      this.exportAsXLSX();
    }
    else {
      if (((i == 1) || (i != 1 && this.includeExportData.length > 0)) && i <= this.loopToStop) {
        const form = {
          "page": i,
          "pageSize": this.dataPerPage,
          "sortDirection": null,
          "sortFields": null,
          "searchOnKeys": null,
          "searchKeyword": this.searchKey,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName,
        }
        this.IBMDService.fetchProductByCustomerByIDWithPagination(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.productByCustomerPaginationResponse.productByCustomers.length) {
              this.includeExportData = [...this.includeExportData, ...response.data.productByCustomerPaginationResponse.productByCustomers];
              this.getAllRecordsToDownload(i);
            }
          })
      }
    }
  }

}

