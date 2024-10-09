import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../../../shared/services/excel.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExcelRestService } from '../../../services/integration-services/excel-rest.service';
import { Constants } from '../../../constants/constants';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { CompleterDropdown } from 'ng2-completer/src/directives/ctr-completer';
@Component({
  selector: 'app-promotion-policy',
  templateUrl: './promotion-policy.component.html',
  styleUrls: ['./promotion-policy.component.scss']
})
export class PromotionPolicyComponent implements OnInit {
  promotionPolicyForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  id: any;
  promotionPolicyInfo: any = {};
  failureRecords: any = [];
  isShowOrHideError: any = false;
  isReadMode: any = false
  destinationFormObj = this.configService.getGlobalpayload();
  globalFormObj = this.configService.getGlobalpayload();
  promotionList: any = [];
  missingParams: string;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Column', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  promotionData: CompleterDropdown
  subList1: any = [];
  subList2: any = [];
  subList3: any = [];
  filterdList: any = []
  categoriesList: any = []
  bransLists: any = []
  newProductlist: any = []
  focusedElement: any;
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  productsList: any = []
  arr: any = [];
  promotionPoliciesList: any=[]
  constructor(private toastr: ToastrService, private configService: ConfigurationService,
    private excelService: ExcelService, private fb: FormBuilder,
    private wmsService: WMSService,
    private excelRestService: ExcelRestService,
    public ngxSmartModalService: NgxSmartModalService,
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
    this.createPromotionPolicyForm();
    this.fetchAllPromotions();
    this.fetchAllProducts()
    this.fetchAllPromotionPolicys()
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.productsList = response.data.productMasters;
          this.getProductFiltersData()
        }
      })
  }
  fetchAllPromotions() {
    this.wmsService.fetchAllPromotions(this.formObj).subscribe((response) => {
      if (response && response.status === 0 && response.data.promotions) {
        this.promotionList = response.data.promotions;
        this.promotionData = this.promotionList.map(k => k.promotionName)
      } else {
        this.promotionList = []
      }
    })
  }
  getPromoInfo(event) {
    let data = this.promotionList.find(x => x.promotionName == event.originalObject);
    console.log(data);
    if (data) {
      let obj = {
        "_id": data._id,
        "promotionName": data.promotionName
      }
      console.log(obj);
      this.promotionPolicyForm.controls.promotionInfo.setValue(obj)
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
    const req = this.promotionPolicyForm.value;
    delete req.brandNames
    delete req.productIDName
    delete req.productCategoryName
    delete req.subcatgory1
    delete req.subcatgory2
    delete req.subcatgory3
    delete req.productCategoryGroupDetail
    if (this.id) {
      req._id = this.id;
    }
    this.wmsService.saveorUpdatePromotionsPolicy(JSON.stringify(req)).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.fetchAllPromotionPolicys();
          this.rerender();
          this.clear();
          this.toastr.success(response.statusMsg);
        } else if (response && response.status === 2 && response.statusMsg) {
          this.toastr.error(response.statusMsg);
        } else {
          this.toastr.error('Failed in saving details');
        }
      },
      (error) => {
      });
  }
  else{
    this.toastr.error("User doesn't have Permissions.")
  }
}

  fetchAllPromotionPolicys() {
    this.wmsService.fetchAllPromotionsPolicy(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.promotionPolicys) {
          this.promotionPoliciesList = response.data.promotionPolicys;
          console.log(this.promotionPoliciesList);
          this.rerender();
        }
      },
      (error) => {
      });
  }
  makeReadOnly: boolean = false;
  globalIDs:any;
  edit(record) {
    this.globalIDs = record._id;
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.id = record._id;
      this.promotionPolicyForm.patchValue(record);
    if(record.productMasterInfos && record.productMasterInfos.length > 0){
     const arr = record.productMasterInfos.map(k=>k.productIDName)
     this.promotionPolicyForm.controls.productIDName.patchValue(arr)
    }
      this.makeReadOnly = false;
      this.isReadMode = true;
      window.scroll(0, 0)
    }
    else if (this.permissionsList.includes('View')) {
      this.promotionPolicyForm.patchValue(record);
      this.makeReadOnly = true;
      window.scroll(0, 0)
    }
  }
  clear() {
    this.promotionPolicyForm.reset();
    this.id = undefined;
    this.makeReadOnly = false;
    this.isReadMode = false
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      this.promotionPolicyInfo = { name: 'promotionPolicy', id: data._id, type: '' };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'promotionPolicy') {
      this.fetchAllPromotions();
    }
  }

  exportAsXLSX() {
    const changedColumnList = this.exportTypeMethod(this.promotionList)
  }
  exportTypeMethod(data) {
    const arr = []
  }
  createPromotionPolicyForm() {
    this.promotionPolicyForm = new FormBuilder().group({
      _id: null,
      promotionInfo: new FormBuilder().group({
        _id: null,
        promotionName: null
      }),
      "promotionCondition": null,
      "comparisonType": null,
      "comparisonValue": null,
      "productMasterInfos": null,
      "discountType": null,
      "discount": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      // dummy fields
      "brandNames": null,
      "productIDName": null,
      "productCategoryName": null,
      "subcatgory1": null,
      "subcatgory2": null,
      "subcatgory3": null,
      "productCategoryGroupDetail": null,
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

  }

  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        console.log(record);
        if (record['columnName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.COLUMN;
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
        fileName: "Column Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
  getProductFiltersData(val?) {
    if (val == 'category') {
    } else {
      this.getCategoriesFraming()
    }
    this.subList1 = []
    this.subList2 = []
    this.subList3 = []
    const final = {
      "productIDNames": this.promotionPolicyForm.controls.productIDName.value,
      "productCategoryNames": this.promotionPolicyForm.controls.productCategoryName.value,
      "organizationIDName": this.destinationFormObj.organizationIDName,
      "wareHouseIDName": this.destinationFormObj.wareHouseIDName,
      "productIDName": null,
      "productCategoryName": null,
      "productCategoryGroupDetail": null,
      "brandNames": this.promotionPolicyForm.controls.brandNames.value,
      "productCategoryHierarchies": null
    }
    this.wmsService.getProductFiltersData(final).subscribe(res => {
      if (res['status'] == 0 && res['data'].productFilterResponse) {
        this.filterdList = res['data'].productFilterResponse;
        console.log(this.filterdList);
        this.categoriesList = this.filterdList.productCategoryNames
        this.bransLists = this.filterdList.brandNames
        this.newProductlist = this.filterdList.productIDNames
        if (this.newProductlist && this.newProductlist.length > 0) {
          this.arr = []
          this.newProductlist.forEach(ele => {
            let data = this.productsList.filter(k => k.productIDName === ele)
            if (data && data.length > 0) {
              let obj = {
                "productMasterID": data[0]._id,
                "productID": data[0].productID,
                "productName": data[0].productName,
                "productIDName": data[0].productIDName
              }
              this.arr.push(obj)
            }
          })
          this.promotionPolicyForm.controls.productMasterInfos.patchValue(this.arr)
        }
        if (this.filterdList.productCategoryHierarchies && this.filterdList.productCategoryHierarchies.length > 0) {
          this.filterdList.productCategoryHierarchies.forEach(ele => {
            if (ele.hierarchyLevel === 1) {
              this.subList1 = ele.productSubCategoryNames
            } else if (ele.hierarchyLevel === 2) {
              this.subList2 = ele.productSubCategoryNames
            } else if (ele.hierarchyLevel === 3) {
              this.subList3 = ele.productSubCategoryNames
            }

          })
        }
        // this.rerender()

      }

    })
  }
  getCategoriesFraming() {
    const form = this.promotionPolicyForm.value
    let arr: any = []
    let obj = {
      "hierarchyLevel": 0,
      "productSubCategoryNames": this.promotionPolicyForm.controls.productCategoryName.value
    }
    arr.push(obj)
    if (form.subcatgory1 && form.subcatgory1.length > 0) {
      let obj = {
        "hierarchyLevel": 1,
        "productSubCategoryNames": form.subcatgory1
      }
      arr.push(obj)
    }
    if (form.subcatgory2 && form.subcatgory2.length > 0) {
      let obj = {
        "hierarchyLevel": 2,
        "productSubCategoryNames": form.subcatgory2
      }
      arr.push(obj)
    }
    if (form.subcatgory3 && form.subcatgory3.length > 0) {
      let obj = {
        "hierarchyLevel": 3,
        "productSubCategoryNames": form.subcatgory3
      }
      arr.push(obj)
    }
    this.promotionPolicyForm.controls.productCategoryGroupDetail.patchValue(arr)
    console.log( this.promotionPolicyForm.controls.productCategoryGroupDetail);
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  getProductInfo() {
    const form = this.promotionPolicyForm.value
    console.log(form.productIDName);
    if (form.productIDName && form.productIDName.length > 0) {
      this.arr = []
      form.productIDName.forEach(ele => {
        let data = this.productsList.filter(k => k.productIDName === ele)
        console.log(data);
        if (data && data.length > 0) {
          let obj = {
            "productMasterID": data[0]._id,
            "productID": data[0].productID,
            "productName": data[0].productName,
            "productIDName": data[0].productIDName
          }
          this.arr.push(obj)
        }
      })
      this.promotionPolicyForm.controls.productMasterInfos.patchValue(this.arr)
    }
  }
}
