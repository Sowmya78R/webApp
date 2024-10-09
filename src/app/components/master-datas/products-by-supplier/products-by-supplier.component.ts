import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../services/integration-services/wms.service';
import { CompleterService, CompleterData } from 'ng2-completer';
import { ApexService } from '../../../shared/services/apex.service';
import { ToastrService } from 'ngx-toastr';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { ExcelService } from '../../../shared/services/excel.service';
import { Constants } from '../../../constants/constants';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-products-by-supplier',
  templateUrl: './products-by-supplier.component.html'
})
export class ProductsBySupplierComponent implements OnInit, AfterViewInit, OnDestroy {
  PBSForm: FormGroup;
  productBySupplier: any = {
    productMasterInfo: {},
    productMasterInfos: []
  };
  productsBySupplier: any = {
    productMasterInfos: []
  };
  // productsBySupplierData: any = [];
  products: any[] = [];
  suppliers: any[] = [];
  productByCustomerData: any = [];
  failureRecords: any = [];
  missingParams: any;
  isShowOrHideError: any = false;
  id: any;
  supplierID: any;
  productsBySupplierKeys: any = ['#', 'Supplier ID', 'Supplier Name',
    'Product ID/Name', 'Product Description', 'Supplier Type', 'MOQ', 'Lead Time', 'Action'];
  supplierIDNames: any[] = [];
  // productBySupplierDataDownload: any = [];
  productIDNames: any[] = [];
  dataService: CompleterData;
  supplierIDName: CompleterData;
  focusedElement: any;
  isReadMode: any = false;
  supplierTypes: any = Constants.SUPPLIER_TYPES;
  deleteInfo: any;
  units: any;
  receivingUnitValues: CompleterData;
  body = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Product By Supplier', Storage.getSessionUser());
  forPermissionsSubscription: any;
  productLogo: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  showImage: boolean = false;
  currencies: any = [];
  showTooltip: any = false;

  page: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;

  includeExportData: any = [];
  loopToStop: any = null;
  dataPerPage: any = null;

  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private completerService: CompleterService,
    private apexService: ApexService,
    private excelService: ExcelService,
    private customValidators: CustomValidators,
    private util: Util,
    public ngxSmartModalService: NgxSmartModalService,
    private excelRestService: ExcelRestService,
    private toastr: ToastrService, private metaDataService: MetaDataService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    this.apexService.getPanelIconsToggle();
  }
  ngOnInit() {
    this.fetchAllBrandConfigurations();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    document.getElementById("supplierType").setAttribute('disabled', "true")

    /*   this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
        if (data) {
          this.body = this.configService.getGlobalpayload();
          this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Product By Supplier', Storage.getSessionUser());
          // this.rerender();
          this.getPBSForm();
          this.getFunctionsCall();
        }
      }) */
    this.getPBSForm();
    this.getFunctionsCall();
  }

  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {

      this.productsBySupplier = {
        productMasterInfos: []
      };
      this.fetchAllSuppliers();
      this.fetchAllProducts();
      this.fetchAllProductBySuppliersData();
      // this.fetchAllProductBySupplier();
      this.fetchAllUnits();
      this.fetchAllCurrencies();
    }
  }

  ngAfterViewInit(): void {
  }
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      if (this.PBSForm.valid) {
        this.productBySupplier.productMasterInfos = [];
        this.productBySupplier.productMasterInfos.push(this.productBySupplier.productMasterInfo);
        if (!this.productBySupplier._id) {
          this.productBySupplier['organizationInfo'] = this.configService.getOrganization();
          this.productBySupplier['wareHouseInfo'] = this.configService.getWarehouse();
        }
        const reqPayload = Object.assign({}, this.productBySupplier);
        delete reqPayload.productMasterInfo;
        reqPayload.productMasterInfos[0].leadTime = this.PBSForm.controls.productMasterInfo['controls'].leadTime.value;
        reqPayload.productMasterInfos[0].receivingUnit = this.PBSForm.controls.productMasterInfo['controls'].receivingUnit.value;
        reqPayload.productMasterInfos[0].moq = this.PBSForm.controls.productMasterInfo['controls'].moq.value;
        reqPayload.productMasterInfos[0].productDescription = this.PBSForm.controls.productMasterInfo['controls'].productDescription.value;
        reqPayload.productMasterInfos[0].price = this.PBSForm.controls.productMasterInfo['controls'].price.value;
        reqPayload.productMasterInfos[0].currency = this.PBSForm.controls.productMasterInfo['controls'].currency.value;
        // reqPayload.productMasterInfos[0].storageInstruction = this.PBSForm.controls.productMasterInfo['controls'].storageInstruction.value;

        if (this.PBSForm.controls.productMasterInfo['controls'].brandNames.value) {
          reqPayload.productMasterInfos[0].brandNames = this.PBSForm.controls.productMasterInfo['controls'].brandNames.value;
        } else {
          reqPayload.productMasterInfos[0].brandNames = null;
        }
        if (this.productBySupplier && this.productBySupplier._id) {
          this.wmsService.UpdateIndividualProductBySupplier(JSON.stringify(reqPayload)).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data.productBySupplier) {
                this.productsBySupplier = response.data.productBySupplier;
                this.PBSForm.controls.productMasterInfo['controls'].productIDName.setValue(null)
                this.PBSForm.controls.productMasterInfo['controls'].leadTime.setValue(null)
                this.PBSForm.controls.productMasterInfo['controls'].moq.setValue(null)
                this.PBSForm.controls.productMasterInfo['controls'].productDescription.setValue(null)
                this.PBSForm.controls.productMasterInfo['controls'].receivingUnit.setValue(null);
                this.PBSForm.controls.productMasterInfo['controls'].price.setValue(null);
                this.PBSForm.controls.productMasterInfo['controls'].currency.setValue(null);
                this.PBSForm.controls.productMasterInfo['controls'].brandNames.setValue(null);
                this.PBSForm.controls.productMasterInfo['controls'].storageInstruction.setValue(null);
                if (this.showImage) {
                  const element = <HTMLImageElement>(document.getElementById('pLogo'));
                  element.src = null;
                }
                this.fetchAllProductsBySupplierID();
                // this.fetchAllProductBySuppliersData();
                // this.PBSForm.reset();
                document.getElementById("supplierType").setAttribute('disabled', "true")
                this.isReadMode = false;
                this.toastr.success('Updated details successfully');
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
          this.wmsService.saveOrUpdateProductBySupplierData(JSON.stringify(reqPayload)).subscribe(
            (response) => {
              if (response && response.status === 0 && response.data.productBySupplier) {
                this.productsBySupplier = response.data.productBySupplier;
                this.fetchAllProductsBySupplierID();
                // this.fetchAllProductBySuppliersData();
                // this.PBSForm.reset();
                this.PBSForm.controls.productMasterInfo['controls'].productIDName.setValue(null)
                this.PBSForm.controls.productMasterInfo['controls'].leadTime.setValue(null)
                this.PBSForm.controls.productMasterInfo['controls'].moq.setValue(null)
                this.PBSForm.controls.productMasterInfo['controls'].productDescription.setValue(null)
                this.PBSForm.controls.productMasterInfo['controls'].receivingUnit.setValue(null);
                this.PBSForm.controls.productMasterInfo['controls'].price.setValue(null);
                this.PBSForm.controls.productMasterInfo['controls'].currency.setValue(null);
                this.PBSForm.controls.productMasterInfo['controls'].brandNames.setValue(null);
                this.PBSForm.controls.productMasterInfo['controls'].storageInstruction.setValue(null);
                if (this.showImage) {
                  const element = <HTMLImageElement>(document.getElementById('pLogo'));
                  element.src = null;
                }

                this.toastr.success('Details saved successfully');
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
      } else {
        this.toastr.error('All fields required');
      }
    }
    else {
      this.toastr.error('User does not  have permissions');
    }
    this.globalIDs = null
  }
  fetchAllProductBySuppliersData() {
    const form = {
      "page": 1,
      "pageSize": this.itemsPerPage,
      "sortDirection": null, 
      "sortFields": null,
      "searchOnKeys": PaginationConstants.productBySupplierSearchKeys,
      "searchKeyword": this.searchKey,
      "organizationIDName": this.body.organizationIDName,
      "wareHouseIDName": this.body.wareHouseIDName,
    }
    this.wmsService.fetchProductsBySupplierWithPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productBySupplierPaginationResponse.productBySuppliers.length) {
          const total = response.data.productBySupplierPaginationResponse.totalElements;
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
        }
      },
      (error) => {
      });
  }
  fetchAllCurrencies() {
    this.metaDataService.fetchAllCurrencies(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.currencies && response.data.currencies.length) {
          this.currencies = response.data.currencies;
        }
        else {
          this.currencies = [];
        }
      },
      error => {
        this.currencies = [];
      }
    )
  }

  fetchAllProductsBySupplierID(page?) {
    const supplieridname = this.PBSForm.controls.supplierIDName.value;
    if (supplieridname) {
      const form = {
        "page": page ? page : 1,
        "pageSize": this.itemsPerPage,
        "sortDirection": null,
        "sortFields": null,
        "searchOnKeys": PaginationConstants.productBySupplierSearchKeys,
        "searchKeyword": this.searchKey,
        "organizationIDName": this.body.organizationIDName,
        "wareHouseIDName": this.body.wareHouseIDName,
        "supplierIDName": supplieridname
      }
      this.wmsService.fetchProductsBySupplierWithPagination(form).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productBySupplierPaginationResponse.productBySuppliers.length) {
            this.productsBySupplier = response.data.productBySupplierPaginationResponse.productBySuppliers[0];
            // this.productsBySupplierData = response.data.productBySupplier;
            this.totalItems = response.data.productBySupplierPaginationResponse.totalElements;
          } else {
            this.productsBySupplier = {
              productMasterInfos: []
            };
          }
        },
        (error) => {
          this.productsBySupplier = {
            productMasterInfos: []
          };
        });
    }
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
          "searchOnKeys": PaginationConstants.productBySupplierSearchKeys,
          "searchKeyword": this.searchKey,
          "organizationIDName": this.body.organizationIDName,
          "wareHouseIDName": this.body.wareHouseIDName,
        }
        this.wmsService.fetchProductsBySupplierWithPagination(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.productBySupplierPaginationResponse.productBySuppliers.length) {
              this.includeExportData = [...this.includeExportData, ...response.data.productBySupplierPaginationResponse.productBySuppliers];
              this.getAllRecordsToDownload(i);
            }
          })
      }
    }
  }
  fetchAllProducts() {
    this.productIDNames = [];
    this.dataService = this.completerService.local(this.productIDNames);
    this.wmsService.fetchAllProducts(this.body).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
          this.products.forEach(item => {
            this.productIDNames.push(item.productIDName);
          });
          this.dataService = this.completerService.local(this.productIDNames);
        } else {
          this.products = [];
        }
      },
      (error) => {
        this.products = [];
      });
  }
  fetchAllUnits() {
    this.metaDataService.fetchAllUnits(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.units && response.data.units.length) {
          this.units = response.data.units;
          this.receivingUnitValues = response.data.units.map(unitCodes => unitCodes.unitCode);

        }
      },
      error => {
        this.units = [];
      });
  }
  fetchAllSuppliers() {
    this.metaDataService.getImageConfigbyName(this.configService.getGlobalpayload()).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {

        this.showImage = res['data'].imageConfiguration.screenNames.includes('Product by Supplier') ? true : false;
      }
    })
    this.wmsService.fetchAllSupplierDetails(this.body).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
          // this.suppliers.forEach(item => {
          //   this.supplierIDNames.push(item.supplierIDName);
          // });
          this.supplierIDNames = this.suppliers.map(x => x.supplierIDName);
          this.supplierIDName = this.completerService.local(this.supplierIDNames);
        } else {
          this.suppliers = [];
        }
      },
      (error) => {
        this.suppliers = [];
      });
  }
  globalIDs: any;
  edit(data: any, product: any) {
    console.log(data);
    console.log(product);
    this.globalIDs = data._id;
    this.productLogo = null;
    this.fetchAllBrandConfigurations();
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      window.scroll(0, 0);
      this.PBSForm.patchValue({
        supplierID: data.supplierID,
        supplierIDName: data.supplierIDName,
        supplierName: data.supplierName,
        productMasterInfo: {
          productIDName: product.productIDName,
          moq: product.moq,
          productDescription: product.productDescription,
          storageInstruction: product.storageInstruction,
          leadTime: product.leadTime,
          receivingUnit: product.receivingUnit,
          productImage: product.productImage,
          price: product.price,
          currency: product.currency,
          brandNames: product.brandNames
        }
      });
      document.getElementById("supplierType").setAttribute('disabled', "true")
      this.productBySupplier = Object.assign({}, data);
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
      this.getSelected('supplierIDName');
      this.getSelected('productIDName');
    }
    else if (this.permissionsList.includes('View')) {
      this.PBSForm.patchValue({
        supplierID: data.supplierID,
        supplierIDName: data.supplierIDName,
        supplierName: data.supplierName,
        productMasterInfo: {
          productIDName: product.productIDName,
          moq: product.moq,
          productDescription: product.productDescription,
          storageInstruction: product.storageInstruction,
          leadTime: product.leadTime,
          receivingUnit: product.receivingUnit,
          productImage: product.productImage,
          price: product.price,
          currency: product.currency,
          brandNames: product.brandNames
        }
      });
      this.productBySupplier = Object.assign({}, data);
      this.getSelected('supplierIDName');
      // this.getSelected('productIDName');
      this.PBSForm.disable();
    }
  }
  getSelected(type) {
    switch (type) {
      case 'supplierIDName': {
        this.suppliers.forEach(supplier => {
          if (supplier.supplierIDName === this.PBSForm.value.supplierIDName) {
            this.productBySupplier.supplierIDName = supplier.supplierIDName;
            this.productBySupplier.supplierID = supplier.supplierID;
            this.productBySupplier.supplierType = supplier.supplierType;
            this.supplierID = supplier.supplierID;
            this.productBySupplier.supplierName = supplier.supplierName;
            this.PBSForm.patchValue(this.productBySupplier);
            this.fetchAllProductsBySupplierID();
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
        this.products.forEach(product => {

          if (product.productIDName === this.PBSForm.value.productMasterInfo.productIDName) {
            this.productBySupplier.productMasterInfo = {};
            this.productBySupplier.productMasterInfo.productMasterID = product._id;
            this.productBySupplier.productMasterInfo.productIDName = product.productIDName;
            this.productBySupplier.productMasterInfo.productName = product.productName;
            this.productBySupplier.productMasterInfo.productID = product.productID;
            this.productBySupplier.productMasterInfo.productImage = product.productImage;
            if (product.productImage && product.productImage.length > 0) {
              this.fieldsMoveMent();
            }
            else {
              this.fieldsMoveMentAddOns();

            }
            this.productBySupplier.productMasterInfo.moq = product.moq;
            this.productBySupplier.productMasterInfo.productDescription = product.productDescription;
            this.productBySupplier.productMasterInfo.leadTime = product.leadTime;
            this.productBySupplier.productMasterInfo.receivingUnit = product.receivingUnit;
            this.productBySupplier.productMasterInfo.price = product.purchasePrice;
            this.productBySupplier.productMasterInfo.currency = product.currency;
            this.productBySupplier.productMasterInfo.brandNames = product.brandNames;
            this.productBySupplier.productMasterInfo.storageInstruction = product.storageInstruction;

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
            // this.PBSForm.patchValue(this.productBySupplier);
          }
        });
        break;
      }
      default:
        break;
    }
  }

  imageNotAvailble: boolean = true;
  imageAvailble: boolean = false;
  fieldsMoveMent() {
    this.imageNotAvailble = false;
    this.imageAvailble = true;
  }
  fieldsMoveMentAddOns() {
    this.imageNotAvailble = true;
    this.imageAvailble = false;
  }
  clear() {
    this.PBSForm.reset();
    this.isReadMode = false;
    this.productBySupplier = {};
    this.PBSForm.enable();
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
      this.fieldsMoveMentAddOns();
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
      return this.PBSForm.controls[fieldName].valid && this.PBSForm.controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  getPBSForm() {
    this.PBSForm = new FormBuilder().group({
      supplierIDName: ['', this.customValidators.required],
      supplierID: ['', this.customValidators.required],
      supplierName: ['', this.customValidators.required],
      supplierType: ['', this.customValidators.required],
      productMasterInfo: new FormBuilder().group({
        productIDName: ['', this.customValidators.required],
        moq: ['', this.customValidators.required],
        leadTime: [''],
        receivingUnit: [''],
        productImage: [''],
        price: null,
        currency: null,
        brandNames: null,
        productDescription: null,
        storageInstruction: null,
      }),
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
  exportAsXLSX() {
    const data = this.excelService.formatJSONForHeaderLines(this.includeExportData, 'productMasterInfos');
    const changedData = this.exportTypeMethod(data)
    this.excelService.exportAsExcelFile(changedData, 'Product By Suppliers', null);
  }
  brandNamesArray: any = [];
  brandNames: any = [];
  exportTypeMethod(data) {

    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        this.brandNamesArray = [];
        if (k.brandNames) {
          k.brandNames.forEach(x => {
            this.brandNamesArray.push(x)
          })
        }
        this.brandNames = this.brandNamesArray.join(",");
        const obj = {}
        if (k.supplierIDName) {
          let supplierIDs = k.supplierIDName.split(":")[0]
          obj['supplierID'] = supplierIDs
        }
        obj['productID'] = k.productID
        obj['productDescription'] = k.productDescription
        obj['moq'] = k.moq
        obj['leadTime'] = k.leadTime
        obj['receivingUnit'] = k.receivingUnit
        if (k.price) {

          obj['price'] = DecimalUtils.fixedDecimal(Number(k.price), 2)
        }
        else {
          obj['price'] = null

        }
        /*  obj['price'] = k.price */
        obj['currency'] = k.currency
        obj['brandNames'] = this.brandNames;
        obj['storageInstruction'] = k.storageInstruction;
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['supplierIDName'] = null
      obj['productIDName'] = null
      obj['productDescription'] = null
      obj['moq'] = null
      obj['leadTime'] = null
      obj['receivingUnit'] = null
      obj['price'] = null
      obj['currency'] = null
      obj['brandNames'] = null
      obj['storageInstruction'] = null
      arr.push(obj)
    }
    return arr
  }
  ngOnDestroy(): void {
  }
  delete(header, data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.deleteInfo = { name: 'productBySupplier', id: header._id, productMasterID: data.productMasterID };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'productBySupplier') {
      this.fetchAllProductsBySupplierID();
    }
  }
  fetchAllProductBySupplier() {
    if (this.supplierID) {
      this.wmsService.fetchProductsBySupplier(this.supplierID, this.body).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.productBySupplier) {
            this.productsBySupplier = response.data.productBySupplier;
            // this.productsBySupplierData = response.data.productBySupplier;
          } else {
            this.productsBySupplier = {
              productMasterInfos: []
            };
          }
        },
        (error) => {
          this.productsBySupplier = {
            productMasterInfos: []
          };
        });
    }
  }
  getFile() {
    document.getElementById('upfile').click()
  }
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
            k['brandNames'] = this.getBrandFraming(k);
            if (k['supplierID']) {
              data1.push(this.getProductBySupplierHeadersData(k));
              inValidRecord = false
            } else if (!k['supplierIDName']) {
              if (data1.length > 0) {
                data1[data1.length - 1]['productMasterInfos'].push(this.getProductBySupplierLinesData(k))
              }
            } else {
              if (!k['supplierIDName']) {
                inValidRecord = true;
                logs.push(this.getProductBySupplierHeadersData(k));
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
                if (r.productMasterInfos && r.productMasterInfos.length > 0) {
                  r.productMasterInfos.forEach(ele => {
                    if (ele) {
                      Object.keys(ele).forEach((elr, i) => {
                        ele[elr] = typeof (ele[elr]) === 'string' ? ele[elr].trim() : ele[elr];
                      })
                    }
                  })
                }
                const reqDataNew = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.PBSINFO);

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
              r['organizationInfo'] = this.configService.getOrganization();
              r['wareHouseInfo'] = this.configService.getWarehouse();
            });

            data1.forEach(product => {
              let isNullData = false;
              let emptyIndex = [];
              if (product.productMasterInfos && product.productMasterInfos.length > 0) {
                product.productMasterInfos.map((item, index) => {
                  if (!item || item.productID == null) {
                    isNullData = true;
                    emptyIndex.push(index);
                  }
                });
                emptyIndex.forEach(item => {
                  product.productMasterInfos.splice(item, 1);
                });
              }

              if (isNullData) {
                product['productMasterInfo'] = null;
              } else {
                // product['productMasterInfo'] = product.productMasterInfos || null;
              }
            })
            this.excelRestService.saveProductBySupplierBulkdata(data1).subscribe(res => {
              if (res && res.status === 0 && res.data.productBySupplierList && res.data.productBySupplierList.failureList
                && res.data.productBySupplierList.failureList.length > 0 && res.data.productBySupplierList.successList && res.data.productBySupplierList.successList.length > 0) {
                this.failureRecords = res.data.productBySupplierList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.productBySupplierList.duplicateList);

                this.toastr.error('Partially failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.productBySupplierList && res.data.productBySupplierList.failureList && res.data.productBySupplierList.failureList.length > 0) {
                this.failureRecords = res.data.productBySupplierList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.productBySupplierList.duplicateList);

                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.productBySupplierList && res.data.productBySupplierList.failureList && res.data.productBySupplierList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.productBySupplierList && res.data.productBySupplierList.duplicateList && res.data.productBySupplierList.duplicateList.length > 0) {
                  this.failureRecords = res.data.productBySupplierList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                } else {
                  this.fetchAllProductBySupplier();
                  this.toastr.success('Uploaded successfully');
                  this.fetchAllProductBySupplier();
                  this.failureRecords = [];
                }
              } else {
                this.toastr.error('Faild in uploading');
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
      case 'supplierID': {
        const supplierIds = this.suppliers.find(e => e.supplierID == value);

        return supplierIds ? supplierIds : null;
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
  getProductBySupplierHeadersData(k) {
    let obj = {};
    // if (k.productMasterInfo && k.productMasterInfo.length > 0 && k.productMasterInfo.productID == null) {
    //   obj['productMasterInfo'] = null;
    // } else {
    //   obj['productMasterInfo'] = k.productMasterInfo || null;
    // }



    if (typeof k.supplierID === 'string') {
      let supplier = this.mapId('supplierID', k.supplierID.trim());
      if (supplier) {
        obj['supplierIDName'] = supplier.supplierIDName || null;
        obj['supplierID'] = supplier.supplierID || null;
        obj['supplierName'] = supplier.supplierName || null;
        obj['supplierType'] = supplier.supplierType || null;
      } else {
        obj['supplierIDName'] = k.supplierIDName || null;
        obj['supplierID'] = k.supplierID || null;
        obj['supplierName'] = k.supplierName || null;
        obj['supplierType'] = k.supplierType || null;
      }
    } else {
      let supplier = this.mapId('supplierID', k.supplierID);
      if (supplier) {
        obj['supplierIDName'] = supplier.supplierIDName || null;
        obj['supplierID'] = supplier.supplierID || null;
        obj['supplierName'] = supplier.supplierName || null;
        obj['supplierType'] = supplier.supplierType || null;
      } else {
        obj['supplierIDName'] = k.supplierIDName || null;
        obj['supplierID'] = k.supplierID || null;
        obj['supplierName'] = k.supplierName || null;
        obj['supplierType'] = k.supplierType || null;
      }
    }

    obj['organizationInfo'] = this.configService.getOrganization();
    obj['wareHouseInfo'] = this.configService.getWarehouse();
    obj['productMasterInfos'] = [this.getProductBySupplierLinesData(k)];

    return obj;
  }

  getProductBySupplierLinesData(document?) {
    let productobj = {}
    if (typeof document.productID === 'string') {
      let product = this.mapId('productID', document.productID ? document.productID.toString().trim() : null);
      if (document) {
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


        return productobj;
      }
      else {
        let product = this.mapId('productID', document.productID ? document.productID.toString() : null);
        if (document) {
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


          return productobj;
        }

      }
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

  mandatoryCheckForHeaderLines(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      let record = data[0];
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_BY_SUPPLIER;
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
        fileName: "Product By Supplier Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
  formObj = this.configService.getGlobalpayload();
  brandConfigurationsResponceList: any;
  brandConfigureIDs = [];
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
}
