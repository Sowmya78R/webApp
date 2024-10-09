import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CompleterService, CompleterData } from 'ng2-completer';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DatePipe } from '@angular/common';
import { Storage } from 'src/app/shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-abcanalysis',
  templateUrl: './abcanalysis.component.html',
  styleUrls: ['./abcanalysis.component.scss']
})
export class AbcanalysisComponent implements OnInit {
  arr: any = [];

  headersArrayDate: any = [];
  productCoefficientInfoArr: any = [];
  overAllDates: any = [];
  entryFieldsArrayData: any = [];
  ABCGroupForm: FormGroup
  /*   dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective; */
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger1: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  dataService: CompleterData;
  selectedCriteria: any = [];
  productCategories: any = [];
  products: any = [];
  abcGroupList: any = [];
  abcAnalysisGroupsArr: any = [];
  displayNewProviderList: any[];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities',
    'Inventory', 'ABC Analysis', Storage.getSessionUser());

  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private completerService: CompleterService,
    private fb: FormBuilder, private datepipe: DatePipe,
    private translate: TranslateService,) {
      this.translate.use(this.language); 
  }
  ngOnInit(): void {
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
    /*   let startDate: ''
      let endDate: ''
      let interval: 1;
      this.getDates(startDate, endDate, interval) */
       this.fetchAllProductCategories();
       this.fetchAllProducts(); 
    this.createABCGroupForm();
  }
  OnDataChange() {
    this.wmsService.abcDataSharing.next(this.ABCGroupForm.value);
  }
  cycleCountingCriterias: any = [
    { value: 'product', viewValue: 'Product Name' },
    { value: 'ProductType', viewValue: 'Product Type' },
    { value: 'productCategory', viewValue: 'Product Category' },
  ];
  productsTypes = [
    { nameeddddd: 'FINISHED PRODUCT' },
    { nameeddddd: 'SEMI-FINISHED PRODUCT' }
  ]
  createABCGroupForm() {
    this.ABCGroupForm = this.fb.group({
      fromDate: [this.datepipe.transform(new Date().setDate(new Date().getDate()), '2023-01-01')],
      toDate: [this.datepipe.transform(new Date().setDate(new Date().getDate()), '2023-03-04')],

    })
  }
  getDates(startDate, endDate, interval) {
    const duration = endDate - startDate;
    const steps = duration / interval;
    this.overAllDates = (Array.from({ length: steps + 1 }, (v, i) => startDate.valueOf() + (interval * i)))
  }
  sortedArray: any = [];
  ngAfterViewInit(): void {
  }
  finalArr: any = []

  callingGrnerateFunction() {
    this.generate();
  }
  generate() {

    const abcFormRequest = this.ABCGroupForm.value;
    abcFormRequest["organizationIdName"] = this.configService.getOrganization().organizationIDName,
      abcFormRequest["wareHouseIdName"] = this.configService.getWarehouse().wareHouseIDName

    this.wmsService.fetchAllABCAnalyisGroup(JSON.stringify(abcFormRequest)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.abcGroup) {
          this.abcGroupList = response.data.abcGroup;
          console.log(this.abcGroupList);
          this.finalArr = [];
          this.abcGroupList.abcAnalysisMatrixInfo.forEach((abcmatrix, i) => {

            let objReq = {}

            if (i == 0) {
              objReq['isheaderShow'] = true;
            }
            objReq['name'] = abcmatrix.name;
            objReq['productID'] = abcmatrix.products;
            this.finalArr.push(objReq)
            console.log(this.finalArr)
          })
          this.abcAnalysisGroupsArr = this.abcGroupList.abcAnalysisGroups;
          this.abcGroupList.abcAnalysisGroups.forEach(abcanalysisgroup => {
            if (abcanalysisgroup.productCoefficientInfo != null && abcanalysisgroup.productCoefficientInfo != undefined) {
              abcanalysisgroup.productCoefficientInfo.forEach(innerElement => {
                Object.keys(this.overAllDates) == innerElement.deliveryExpDate
                this.headersArrayDate.push(innerElement.deliveryExpDate)
              })
            }
          })
          this.sortedArray = this.headersArrayDate.sort((e1, e2) => e1 - e2);
          console.log(this.sortedArray);
          let minDateInMillis = this.sortedArray[0];
          let maxDateInMillis = this.sortedArray[this.sortedArray.length - 1];
          const dayFormInMillis = 1000 * 60 * 60 * 24;
          this.getDates(minDateInMillis, maxDateInMillis, dayFormInMillis);

          this.tableDisplayLogic();

        } else {
          this.abcGroupList = [];
        }
      },
      (error) => {
        this.abcGroupList = [];
      });
  }
  tableDisplayLogic() {
    const dummyArr = []
    this.abcAnalysisGroupsArr.forEach((x, iIndex) => {
      const abcGroupObj = x;
      const info = {}
      info['isShow'] = false;
      info['productID'] = abcGroupObj.productMasterInfo.productID;
      info['productIDName'] = abcGroupObj.productMasterInfo.productIDName;
      info['usage'] = abcGroupObj.usage;
      info['idDetails'] = [];
      this.overAllDates.forEach((element, index) => {
        console.log(element);
        this.abcAnalysisGroupsArr.forEach(abcanalysisgroup => {
          console.log(abcanalysisgroup.productCoefficientInfo)
          const pList = abcanalysisgroup.productCoefficientInfo.find(y => y.productID == abcGroupObj.productMasterInfo.productID
            && y.deliveryExpDate === element);
          console.log(pList)

          if (pList != null && pList != undefined) {
            console.log(pList['quantity'])
            info[element] = pList['quantity'];
          }
          else {
          }
          console.log(info[element])
          console.log(info)

        })
      })
      dummyArr.push(info)

    })
    this.arr = dummyArr

    this.rerender();
    console.log(this.arr)
    this.dtTrigger.next();
    this.dtTrigger1.next();
    this.dtTrigger2.next();


  }
  clearFields() {
    this.ABCGroupForm.reset();
  }
  filteredData: any = [];

  getCriteria(criteria: any) {

    this.selectedCriteria = criteria;
    if (this.selectedCriteria === 'productCategory' && this.productCategories.length > 0) {
      this.productCategories.forEach(category => {
        this.filteredData.push(category.productCategoryName);
      });
    }
    else if (this.selectedCriteria === 'ProductType') {
      this.productsTypes.forEach(type => {
        this.filteredData.push(type.nameeddddd);
      })
    }
    else if (this.selectedCriteria === 'product' && this.products.length > 0) {
      this.products.forEach(product => {
        this.filteredData.push(product.productIDName);
      });
    }
    this.dataService = this.completerService.local(this.filteredData);
    this.filteredData = [];
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
        } else {
          this.products = [];
        }
      },
      (error) => {
        this.products = [];
      });
  }
  manipulateOriginalData(value, key, data) {
    this.entryFieldsArrayData = []
    data[key] = parseInt(value);
    data.idDetails.forEach(element => {
      if (parseInt(value) == 0 && element[data.subset.bindValue] === 0) {
      }
      else {
        if (value && element.period == key) {
          element[data.subset.bindValue] = parseInt(value);
          this.entryFieldsArrayData.push(element)
          // this.save();
        }
      }
    });
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategories = response.data.productCategories;
        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger1.unsubscribe();
    this.dtTrigger2.unsubscribe();
  }

  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }


}
