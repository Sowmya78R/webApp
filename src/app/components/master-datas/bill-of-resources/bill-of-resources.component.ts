import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../../../shared/services/excel.service';
import { Constants } from '../../../constants/constants';
import { CommonMasterDataService } from '../../../services/integration-services/commonMasterData.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { CommonService } from 'src/app/shared/services/common.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
@Component({
  selector: 'app-bill-of-resources',
  templateUrl: './bill-of-resources.component.html'
})
export class BillOfResourcesComponent implements OnInit, AfterViewInit, OnDestroy {
  billOfResourceForm: FormGroup;
  focusedElement: any;
  dataService: CompleterData;

  statuss: any = ['Active', 'InActive'];
  billofResourcesData: any = [];
  billofResourceInfo: any;
  id: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  missingParams: any;
  isShowOrHideError: any = false;
  failureRecords: any = [];
  ProductMasterIDs: CompleterData;
  inventoryUnitIDs: CompleterData;
  resourceUnitIDs: CompleterData;
  productList: any;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Bill of Resources', Storage.getSessionUser());
  forPermissionsSubscription: any;
  productLogo: any;
  showImage: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  showTooltip: any = false;

  constructor(
    private toastr: ToastrService, private configService: ConfigurationService,
    private excelService: ExcelService, private commonService: CommonService,
    public ngxSmartModalService: NgxSmartModalService, private metaDataService: MetaDataService,
    private commonMasterDataService: CommonMasterDataService,
    private excelRestService: ExcelRestService,
    private completerService: CompleterService,
    private wmsService: WMSService,
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
         this.permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Bill of Resources', Storage.getSessionUser());
         this.getFunctioncalls()
       }
     }) */
    this.getFunctioncalls()
  }
  getFunctioncalls() {
    if (this.permissionsList.includes('View')) {
      this.findAllProducts();
      this.createBillOfResourceForm();
      this.fetchAllBillOfResources();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  products:any = [];
  findAllProducts() {
    this.dataService = this.completerService.local(
      this.commonService.getFiltValuesFromArrayOfObjs([], 'productIDName'));
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
          this.dataService = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.productMasters, 'productIDName'));
        } else {
        }
      },
      (error) => {
      });
    this.metaDataService.getImageConfigbyName(this.configService.getGlobalpayload()).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Bill of Resources') ? true : false;
      }
    })
    // this.reportsCommonService.fetchAllProducts();
    // this.reportsCommonService.productIDNameValues.subscribe(res => {
    //   this.dataService = this.completerService.local(res);
    // });
    // this.reportsCommonService.fetchAllUnits();
    // this.reportsCommonService.unitsValues.subscribe(res => {
    //   this.inventoryUnits = res;
    // });
  }
  fetchAllProducts() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.productLogo = null;
          if (this.showImage) {
            const element = <HTMLImageElement>(document.getElementById('pLogo'));
            element.src = null;
          }
          this.productList = response.data.productMasters;
          this.billOfResourceForm.controls.inventoryUnit.setValue(this.productList.find(inventoryUnit =>
            inventoryUnit.productIDName === this.billOfResourceForm.controls.productIDName.value).inventoryUnit);
          this.billOfResourceForm.controls.resourceUnit.setValue(this.productList.find(resourceUnit =>
            resourceUnit.productIDName === this.billOfResourceForm.controls.productIDName.value).resourceUnit);
          const product = this.productList.find(resourceUnit =>
            resourceUnit.productIDName === this.billOfResourceForm.controls.productIDName.value)
          this.billOfResourceForm.controls.productImage.setValue(product.productImage);
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
      })
  }
  makeReadOnly: boolean = false;
  makeThisDisabled: boolean = false;
  globalIDs:any;
  edit(details: any) {
    this.globalIDs = details._id;

    this.productLogo = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    if (details.productImage && this.showImage) {
      const fileNames = JSON.parse(JSON.stringify(details.productImage));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        if (data['status'] == 0) {
          this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
          this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
          this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
        }
      });
    }
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.id = details._id;
      window.scroll(0, 600);
      this.billofResourceInfo = Object.assign({}, details);
      this.billOfResourceForm.patchValue(this.billofResourceInfo);
      this.billOfResourceForm.enable();
      window.scroll(0, 0)
    }
    else if (this.permissionsList.includes('View')) {
      window.scroll(0, 600);
      this.billofResourceInfo = Object.assign({}, details);
      this.billOfResourceForm.patchValue(this.billofResourceInfo);
      this.billOfResourceForm.disable();
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.billofResourceInfo = { name: 'BillOfResources', id: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllBillOfResources();
    }
  }
  save() {
   if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
      const billofResourceInfo = this.billOfResourceForm.value;
      if (this.id) {
        this.billOfResourceForm.value._id = this.id;
      }
      billofResourceInfo['organizationInfo'] = this.configService.getOrganization();
      billofResourceInfo['wareHouseInfo'] = this.configService.getWarehouse();
      this.commonMasterDataService.saveOrUpdateBillOfResources(JSON.stringify(billofResourceInfo)).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.fetchAllBillOfResources();
            this.toastr.success('Saved successfully');
            this.billOfResourceForm.reset();
            if (this.showImage) {
              const element = <HTMLImageElement>(document.getElementById('pLogo'));
              element.src = null;
            }
            this.billOfResourceForm.controls.status.setValue('Active')
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
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
    this.globalIDs = null
  }
  clear() {
    if (this.permissionsList.includes('Update')) {
      this.billOfResourceForm.reset();
      this.billOfResourceForm.get('status').setValue('Active');
      this.billOfResourceForm.enable();
      this.id = ''
      if (this.showImage) {
        const element = <HTMLImageElement>(document.getElementById('pLogo'));
        element.src = null;
      }
    }
    else {
      this.toastr.error("User Doesnt have permission")
    }

  }
  autoRetrieveData() {
    if (this.billOfResourceForm.value && this.billOfResourceForm.controls.productIDName !== null) {
      if (this.productList != null && this.productList != undefined && this.productList != "") {
        this.productList.forEach((product) => {
          console.log(product);
          if (product.productIDName == this.billOfResourceForm.controls.productIDName.value) {
            this.billOfResourceForm.controls.inventoryUnit.setValue(product.inventoryUnit ? product.inventoryUnit : null)
            this.billOfResourceForm.controls.resourceUnit.setValue(product.resourceUnit ? product.resourceUnit : null)
          }
        });
      }
    }
  }
  fetchAllBillOfResources() {
    this.commonMasterDataService.fetchAllBillOfResources(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.billofResources) {
          this.billofResourcesData = response.data.billofResources;
          console.log(this.billofResourcesData)
          this.rerender();
        } else {
          this.billofResourcesData = [];
        }
      },
      (error) => {
        this.billofResourcesData = [];
      });
  }
  onProductChange() {
    if (this.billOfResourceForm.value.productIDName) {
      const product = this.billOfResourceForm.value.productIDName.split(':');
      this.billOfResourceForm.controls.productID.setValue(product[0]);
      this.billOfResourceForm.controls.productName.setValue(product[1]);
    }
  }
  exportAsXLSX() {
    this.commonMasterDataService.fetchAllBillOfResources(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.billofResourcesData = response.data.billofResources;
          const changedBillOfResourceData = this.exportTypeMethod(this.billofResourcesData)
          this.excelService.exportAsExcelFile(changedBillOfResourceData, 'billofResources', null);
        } else {
          this.billofResourcesData = [];
        }
      },
      (error) => {
        this.billofResourcesData = [];
      });
  }
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['productID'] = k.productID
        obj['inventoryUnit'] = k.inventoryUnit
        obj['resourceUnit'] = k.resourceUnit
        obj['sequenceNumber'] = k.sequenceNumber
        obj['executives'] = k.executives
        obj['equipment'] = k.equipment
        obj['vehicle'] = k.vehicle
        obj['capacityUnit'] = k.capacityUnit
        if(k.quantity){

          obj['quantity'] = DecimalUtils.fixedDecimal(Number(k.quantity),2)
         }
         else{
          obj['quantity'] = null

         }
      /*   obj['quantity'] = k.quantity */
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['productID'] = null
      obj['inventoryUnit'] = null
      obj['resourceUnit'] = null
      obj['sequenceNumber'] = null
      obj['executives'] = null
      obj['equipment'] = null
      obj['vehicle'] = null
      obj['capacityUnit'] = null
      obj['quantity'] = null
      arr.push(obj)
    }
    return arr
  }
  createBillOfResourceForm() {
    this.billOfResourceForm = new FormBuilder().group({
      productID: [null],
      productName: [null],
      productIDName: ['', Validators.required],
      productImage: null,
      inventoryUnit: [null],
      resourceUnit: [null],
      sequenceNumber: [null],
      executives: [null],
      equipment: [null],
      vehicle: [null],
      capacityUnit: [null],
      quantity: ['', Validators.required],
      status: ['Active', Validators.required]
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
  myVariable: any = [];
  pickTheVariable: any = []
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.BILLOFRESOURCE;
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
            console.log(jsonData);
            jsonData.forEach(pickVariable => {
              if (pickVariable.productIDName && pickVariable.productIDName != null && pickVariable.productIDName != undefined) {
                this.pickTheVariable = pickVariable.productIDName.split(":")
                console.log(this.pickTheVariable)
                pickVariable.productID = this.pickTheVariable[0];
                pickVariable.productName = this.pickTheVariable[1];
              }
             // let reqData = this.excelService.generateInnerObjs(jsonData, null);
              jsonData.forEach(r => {
                
                if (r.productID) {
                  let produc = this.mapId('productID', r.productID);
                  console.log(produc);
                  if (produc) {
                    console.log(produc)
                    r['productID'] = produc.productID
                    r['productName'] = produc.productName;
                    r['productMasterID'] = produc._id;
                    r['productIDName'] = produc.productIDName;
                  } else {
                    r['productID'] = r.productID
                    r['productName'] = null;
                    r['productMasterID'] = null;
                    r['productIDName'] = null
                  }
                }
                r['organizationInfo'] = this.configService.getOrganization();
                r['wareHouseInfo'] = this.configService.getWarehouse();
                r.sequenceNumber = r.sequenceNumber ? r.sequenceNumber.toString() : null
                r.executives = r.executives ? r.executives.toString() : null
                r.equipment = r.equipment ? r.equipment.toString() : null
                r.vehicle = r.vehicle ? r.vehicle.toString() : null
                r.quantity = r.quantity ? r.quantity.toString() : null

                //delete r['productID']
              });
            })
            this.excelRestService.saveBORBulkdata(jsonData).subscribe(res => {
              if (res && res.status === 0 && res.data.billofResourcesList && res.data.billofResourcesList.failureList &&
                res.data.billofResourcesList.failureList.length > 0 && res.data.billofResourcesList.successList &&
                res.data.billofResourcesList.successList.length > 0) {
                this.failureRecords = res.data.billofResourcesList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.billofResourcesList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.fetchAllBillOfResources();
              } else if (res && res.status === 0 && res.data.billofResourcesList && res.data.billofResourcesList.failureList && res.data.billofResourcesList.failureList.length > 0) {
                this.failureRecords = res.data.billofResourcesList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.billofResourcesList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.billofResourcesList && res.data.billofResourcesList.failureList && res.data.billofResourcesList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.billofResourcesList && res.data.billofResourcesList.duplicateList && res.data.billofResourcesList.duplicateList.length > 0) {
                  this.failureRecords = res.data.billofResourcesList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.fetchAllBillOfResources();
                } else {
                  this.fetchAllBillOfResources();
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
        if (record) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.BILLOFRESOURCE;
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
        fileName: "Bill Of Resources Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
}
