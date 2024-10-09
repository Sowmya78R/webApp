import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompleterData } from 'ng2-completer';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-overallinventory',
  templateUrl: './overallinventory.component.html',
  styleUrls: ['./overallinventory.component.scss']
})
export class OverallinventoryComponent implements OnInit {

  permissionsList = this.configService.getPermissions('mainFunctionalities',
    'Inventory', 'Over All Inventory', Storage.getSessionUser());

  /*  constructor(private wmsService: WMSService,
     private configService: ConfigurationService,
     private excelRestService: ExcelRestService) { } */
  overAllForm: FormGroup;
  formObj = this.configService.getGlobalpayload();
  allWarehouses: any = [];
  wareHouseValuesIds: CompleterData;
  userRelatedDetails: any = [];
  overAll: any = null;
  columnNames: any = [];
  headers: any = [];
  getDropdownData: any = [];
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  supplierIDNameIdValues: any = [];
  suppliers: any = [];
  supplierIDNames: any = [];

  constructor(private wmsService: WMSService,
    private configService: ConfigurationService, private commonMasterDataService: CommonMasterDataService,
    private dashboardSer: DashboardService, private excelRestService: ExcelRestService,
    private fb: FormBuilder,
    private translate: TranslateService,) { 
      this.translate.use(this.language);
    }

  ngOnInit() {
    this.createForm();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    // this.overAllForm.controls.organizationIDName.setValue(this.formObj.organizationIDName);
    // this.overAllForm.controls.wareHouseIDName.setValue(this.formObj.wareHouseIDName);
    this.fetchAllWarehouseDetails();
    this.fetchAllOrganizations();
    // this.fetchAllProducts();
    this.fetchAllProductCategories();
    this.get();
    this.fetchAllSupplierDetails();
  }
  createForm() {
    this.overAllForm = this.fb.group({
      "wareHouseIDName": [null, Validators.required],
      "organizationIDName": [null, Validators.required],
      productIDNames: null,
      productCategoryNames: null

    })
  }
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllProductBySupplierData(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productBySuppliers) {
          this.suppliers = response.data.productBySuppliers;
          this.supplierIDNameIdValues = response.data.productBySuppliers.map(sup => sup.supplierIDName);
        }
      }
    );
  }
  fetchAllProductBySupplier() {
    let arr: any = [];
    if (this.supplierIDNames.length > 0) {
      this.supplierIDNames.forEach(element => {
        const abc = this.suppliers.find(x => x.supplierIDName == element);
        if (abc) {
          arr = [...new Set([...abc.productMasterInfos.map(x => x.productIDName)])];
          this.productValuesIds = arr;
        }
      });
    }
    else {
      this.productValuesIds = arr;
    }
  }
  makeDisableTheFomOnViewOnly() {
    if (this.permissionsList.includes('View') && this.permissionsList.includes('Update')) {
      // this.outwardCheckListForm.enable();
    }
    else if (this.permissionsList.includes('View')) {
      // this.outwardCheckListForm.disable();
    }
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          // this.wareHouseValuesIds = response.data.wareHouses.map(warehouse => warehouse.wareHouseName);
          this.allWarehouses = response.data.wareHouses;
        } else {
        }
      },
      (error) => {
      });
  }
  organizationValuesIDs: CompleterData
  fetchAllOrganizations() {
    this.excelRestService.fetchAllOrganizations({}).subscribe(res => {
      this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
        if (res['status'] == 0 && res['data']['organizations'].length > 0) {
          // this.organizationValuesIDs = res.data.organizations.map(orgName => orgName.organizationIDName)
        }
      })
    })
  }
  productCategoryValuesIds: CompleterData
  productValuesIds: CompleterData
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.productValuesIds = response.data.productMasters.map(prod => prod.productIDName);
        }
      })
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategoryValuesIds = response.data.productCategories.map(x => x.productCategory);
          console.log(response.data.productCategories);
        } else {
        }
      },
      (error) => {
      });
  }

  get() {
    // this.commonMasterDataService.findOrgandWarehouseByUserIdName(Storage.getSessionItem('userDetails').userIDName).subscribe(res => {
    //   if (res['status'] == 0 && res['data']['organizationWareHouseHelpers']) {
    //     this.userRelatedDetails = res['data']['organizationWareHouseHelpers'];
    //     const orgData = res['data']['organizationWareHouseHelpers'].map(x => x.organizationInfo);
    //     this.organizationValuesIDs = orgData.map(x => x.organizationIDName);
    //     // this.warehouses = this.userRelatedDetails.find(x => x.organizationInfo.organizationIDName == this.orgData[0].organizationIDName).wareHouses;
    //     // this.wareHouseIDNames = this.warehouses.map(x => x.wareHouseIDName);
    //   }
    // })
    this.commonMasterDataService.findAllWareHouseConfigurations({ "userIDName": Storage.getSessionItem('userDetails').userIDName }).subscribe(data => {
      if (data['status'] == 0 && data['data']['wareHouseConfigurations'].length > 0) {
        this.getDropdownData = data['data']['wareHouseConfigurations'][0].wareHouseFunctionalities;
        const arr: any = [...new Set(data['data'].wareHouseConfigurations[0].wareHouseFunctionalities.map(x => x.organizationInfo.organizationIDName))];
        this.organizationValuesIDs = arr;
      }
    })
  }
  getWareHouses() {
    const arr: any = [];
    this.wareHouseValuesIds = arr;
    this.overAllForm.controls.wareHouseIDName.setValue(null);
    const event = this.overAllForm.controls.organizationIDName.value;
    if (event && event.length > 0) {
      this.getDropdownData.forEach(element => {
        event.forEach(org => {
          if (element.organizationInfo.organizationIDName == org) {
            arr.push(element.wareHouseInfo.wareHouseIDName);
          }
        });
      });
      this.wareHouseValuesIds = arr;
    }
  }
  generate() {
    const form = this.overAllForm.value;
    if (form.organizationIDName && form.organizationIDName.length > 0 && form.wareHouseIDName && form.wareHouseIDName.length > 0) {
      form['organizationWareHouseCombinations'] = [];
      form.wareHouseIDName.forEach(element => {
        const org = this.getDropdownData.find(x => x.wareHouseInfo.wareHouseIDName == element)
        form['organizationWareHouseCombinations'].push({
          "wareHouseIDName": element,
          "organizationIDName": org.organizationInfo.organizationIDName,
        })
      });
    }
    delete form.organizationIDName;
    delete form.wareHouseIDName;
    this.columnNames = [];
    this.overAll = null;
    this.dashboardSer.fetchOverAllInventoryReport(form).subscribe(res => {
      // res =
      // {
      //   "status": 0,
      //   "statusMsg": "fetching overall inventory details successfully",
      //   "errorCode": null,
      //   "data": {
      //     "overallInventoryMap": {
      //       "overallInventoryResponse": {
      //         "grandTotalQuantityInventoryUnit": 160.0,
      //         "grandTotalAvailableQuantity": 160.0,
      //         "grandTotalReservedQuantity": 0.0,
      //         "grandTotalOnOrderQuantity": 0.0,
      //         "overallInventoryProductHelpers": [
      //           {
      //             "productMasterInfo": {
      //               "productMasterID": "64e311cf4ae32fd4b54e3fe4",
      //               "productID": "643876",
      //               "productName": "TANG ORANGE 4L (500g) NEW",
      //               "productIDName": "643876:TANG ORANGE 4L (500g) NEW",
      //               "moq": null,
      //               "leadTime": null,
      //               "receivingUnit": null,
      //               "isActive": true,
      //               "createdDate": null,
      //               "productImage": null,
      //               "price": null,
      //               "currency": null
      //             },
      //             "productCategoryInfo": {
      //               "productCategoryID": "64e3118a4ae32fd4b54e3fe1",
      //               "productCategory": "Powder Beverage",
      //               "productCategoryName": "Powder Beverage"
      //             },
      //             "inventoryUnit": "JAR",
      //             "overallInventoryOrganizationWareHouseInfos": [
      //               {
      //                 "organizationIDName": "O1001:HYD",
      //                 "wareHouseIDName": "1000:UTL Logistics Pvt Ltd",
      //                 "quantityInventoryUnit": 80.0,
      //                 "availableQuantity": 80.0,
      //                 "reservedQuantity": 0.0,
      //                 "onOrderQuantity": 0.0,
      //                 "inventoryUnit": null
      //               }
      //             ],
      //             "totalQuantityInventoryUnit": 80.0,
      //             "totalAvailableQuantity": 80.0,
      //             "totalReservedQuantity": 0.0,
      //             "totalOnOrderQuantity": 0.0
      //           },
      //           {
      //             "productMasterInfo": {
      //               "productMasterID": "64e30fc64ae32fd4b54e3fc4",
      //               "productID": "642980",
      //               "productName": "BOURNVITA SHKTI 500GJR+150GOREO FRE",
      //               "productIDName": "642980:BOURNVITA SHKTI 500GJR+150GOREO FRE",
      //               "moq": null,
      //               "leadTime": null,
      //               "receivingUnit": null,
      //               "isActive": true,
      //               "createdDate": null,
      //               "productImage": null,
      //               "price": null,
      //               "currency": null
      //             },
      //             "productCategoryInfo": {
      //               "productCategoryID": "64e30f1f4ae32fd4b54e3fba",
      //               "productCategory": "ALL DRINKS",
      //               "productCategoryName": "ALL DRINKS"
      //             },
      //             "inventoryUnit": "JAR",
      //             "overallInventoryOrganizationWareHouseInfos": [
      //               {
      //                 "organizationIDName": "O1001:HYD",
      //                 "wareHouseIDName": "1000:UTL Logistics Pvt Ltd",
      //                 "quantityInventoryUnit": 80.0,
      //                 "availableQuantity": 80.0,
      //                 "reservedQuantity": 0.0,
      //                 "onOrderQuantity": 0.0,
      //                 "inventoryUnit": null
      //               }
      //             ],
      //             "totalQuantityInventoryUnit": 80.0,
      //             "totalAvailableQuantity": 80.0,
      //             "totalReservedQuantity": 0.0,
      //             "totalOnOrderQuantity": 0.0
      //           }
      //         ]
      //       },
      //       "organizationWareHouseQuantityHelperMap": {
      //         "O1001:HYD#1000:UTL Logistics Pvt Ltd": {
      //           "quantityInventoryUnit": 160.0,
      //           "availableQuantity": 160.0,
      //           "reservedQuantity": 0.0,
      //           "onOrderQuantity": 0.0
      //         }
      //       }
      //     }
      //   }
      // }
      // if (res.status == 0 && res.data.overallInventoryMap) {
      //   this.overAll = res['data'].overallInventoryMap;
      //   this.overAll.overallInventoryResponseList.forEach((element, i) => {
      //     if (element.overallInventoryProductHelpers && element.overallInventoryProductHelpers.length > 0) {
      //       element.overallInventoryProductHelpers.forEach(prodCat => {
      //         prodCat.wareHouseIDName = element.wareHouseIDName;
      //         prodCat.overAllElementIndex = i;
      //       });
      //     }
      //     this.columnNames.push(...element.overallInventoryProductHelpers);
      //   });
      // }

      if (res.status == 0 && res.data.overallInventoryMap) {
        this.overAll = res['data'].overallInventoryMap;
        this.headers = Object.keys(this.overAll.organizationWareHouseQuantityHelperMap);
        this.overAll.overallInventoryResponse.overallInventoryProductHelpers.forEach(element => {
          element.dummyOrgWareInfos = [];
          this.headers.forEach(head => {
            const indexValue = element.overallInventoryOrganizationWareHouseInfos.findIndex(x => (x.organizationIDName + '#DELIMIT#' + x.wareHouseIDName) == head)
            if (indexValue != -1) {
              element.dummyOrgWareInfos.push(element.overallInventoryOrganizationWareHouseInfos[indexValue]);
            }
            else {
              element.dummyOrgWareInfos.push({
                "availableQuantity": 0,
                "inventoryUnit": 0,
                "onOrderQuantity": 0,
                "quantityInventoryUnit": 0,
                "reservedQuantity": 0,
                "organizationIDName": head.split('#')[0],
                "wareHouseIDName": head.split('#')[1],
              })
            }

            // element.overallInventoryOrganizationWareHouseInfos.forEach(ele => {
            //   const prodValue = ele.organizationIDName + '#' + ele.wareHouseIDName;

            // });
          });
        });
        console.log(this.overAll);
        // this.overAll.overallInventoryResponseList.forEach((element, i) => {
        //   if (element.overallInventoryProductHelpers && element.overallInventoryProductHelpers.length > 0) {
        //     element.overallInventoryProductHelpers.forEach(prodCat => {
        //       prodCat.wareHouseIDName = element.wareHouseIDName;
        //       prodCat.overAllElementIndex = i;
        //     });
        //   }
        //   this.columnNames.push(...element.overallInventoryProductHelpers);
        // });
      }
    })
  }
  getValue(prod, i) {
    const prodValue = prod.organizationIDName + '#' + prod.wareHouseIDName;
    if (this.headers[i] === prodValue) {
      return true
    }
    else {
      return false
    }
  }
  clear() {
    this.createForm();
    this.overAll = null;
    this.columnNames = [];
    this.supplierIDNames = [];
  }
}
