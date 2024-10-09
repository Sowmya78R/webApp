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
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';


@Component({
  selector: 'app-multidimensionalanalysis',
  templateUrl: './multidimensionalanalysis.component.html',
  styleUrls: ['./multidimensionalanalysis.component.scss']
})
export class MultidimensionalanalysisComponent implements OnInit {
  arr: any = [];
  headersArrayDate: any = [];
  productCoefficientInfoArr: any = [];
  overAllDates: any = [];
  entryFieldsArrayData: any = [];
  multiDimentionalAnalysisForm: FormGroup
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dataService: CompleterData;
  selectedCriteria: any;
  productCategories: any;
  locations: any;
  products: any;
  abcGroupList: any;
  abcAnalysisGroupsArr: any = [];
  displayNewProviderList: any[];
  valueimg: any;
  formObj = this.configService.getGlobalpayload();

  constructor(private dashboardService: DashboardService,private wmsService:WMSService,
    private fb: FormBuilder,private configService:ConfigurationService,
    private completerService:CompleterService,public ngxSmartModalService:NgxSmartModalService) {
   Object.assign(this, {});
   this.wmsService.abcDataSharing.subscribe((data) => {
     this.createMultiDimentionalAnalysisForm();

     this.valueimg = data;
    console.log(data);
     if (data) {
       const customerReq = this.multiDimentionalAnalysisForm.value;
      this.multiDimentionalAnalysisForm.controls.fromDate.setValue(data.fromDate);
       this.multiDimentionalAnalysisForm.controls.toDate.setValue(data.toDate);
      console.log(this.multiDimentionalAnalysisForm.value.fromDate);
      console.log(this.multiDimentionalAnalysisForm.value.toDate);
       this.generate();
     }
   })
 }
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    let startDate: ''
    let endDate: ''
    let interval: 1;
    this.getDates(startDate, endDate, interval)
    this.fetchAllProductCategories();
    this.fetchAllLocations();
    this.fetchAllProducts();
    this.createMultiDimentionalAnalysisForm();
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
  createMultiDimentionalAnalysisForm() {
    this.multiDimentionalAnalysisForm = this.fb.group({
      fromDate: [''],
      toDate: ['']
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
  generate() {
    const abcFormRequest = this.multiDimentionalAnalysisForm.value;
    abcFormRequest['organizationIdName'] = this.configService.getOrganization().organizationIDName;
    abcFormRequest['wareHouseIdName'] = this.configService.getWarehouse().wareHouseIDName;
    this.wmsService.fetchAllABCAnalyisGroup(JSON.stringify(abcFormRequest)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.abcGroup) {
          this.abcGroupList = response.data.abcGroup;
          console.log(this.abcGroupList);
          this.abcGroupList.abcAnalysisMatrixInfo.forEach((abcmatrix, i) => {
            let objReq = {}
            if (i == 0) {
              objReq['isheaderShow'] = true;
            }
            objReq['name'] = abcmatrix.name;
            objReq['productID'] = abcmatrix.products;
            this.finalArr.push(objReq)
          })
          this.abcAnalysisGroupsArr = this.abcGroupList.abcAnalysisGroups;
          this.abcGroupList.abcAnalysisGroups.forEach(abcanalysisgroup => {
            if(abcanalysisgroup.productCoefficientInfo !=null && abcanalysisgroup.productCoefficientInfo !=undefined)
            {
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

         if(pList != null && pList != undefined){
          console.log(pList['quantity'])
          info[element] = pList['quantity'];
         }
         else{

         }
        console.log(info[element])
         console.log(info)

        })
      })
      dummyArr.push(info)
    })
    this.arr = dummyArr
     console.log(this.arr)
     this.dtTrigger.next();

  }
  clearFields() {
    this.multiDimentionalAnalysisForm.reset();
  }
  getCriteria(criteria: any) {
    this.selectedCriteria = criteria;
    const filteredData = [];
    if (this.selectedCriteria === 'productCategory' && this.productCategories.length > 0) {
      this.productCategories.forEach(category => {
        filteredData.push(category.productCategoryName);
      });
    }
    else if (this.selectedCriteria === 'ProductType') {
      this.productsTypes.forEach(type => {
        filteredData.push(type.nameeddddd);
      })
    }
    else if (this.selectedCriteria === 'product' && this.products.length > 0) {
      this.products.forEach(product => {
        filteredData.push(product.productIDName);
      });
    }
    this.dataService = this.completerService.local(filteredData);
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;

          //  this.rerender();
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
  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locations = response.data.locations;
        } else {
          this.locations = [];
        }
      },
      (error) => {
        this.locations = [];
      });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }


}
