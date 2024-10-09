import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DashboardService } from 'src/app/services/integration-services/dashboard.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-aegingreport',
  templateUrl: './aegingreport.component.html',
  styleUrls: ['./aegingreport.component.scss']
})
export class AegingreportComponent implements OnInit {


  locationDropDownList = [];
  selectedItems = [];
  dropdownSettings = {};
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  supplierIDNames = [];
  organizationDropDownList = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  rackDropDownList = [];
  wareHouseDropDownList = [];
  locationResponceObj: any;
  totalLocationCount: any;
  formObj = this.configService.getGlobalpayload();
  ageingForm: FormGroup;
  columnNames: any = [];
  overAll: any = null;
  categoryCheck: boolean = true;
  priceCheck: boolean = true;
  headers: any = [];
  productCategoriesResponseList: [];

  spaceUtilizationResponceLocationList: any = [];
  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private dashboardSer: DashboardService, private excelRestService: ExcelRestService,
    private fb: FormBuilder, private translate: TranslateService,) { 
      this.translate.use(this.language);
    }

  ngOnInit() {
    this.dropdownSettings = {
      multiselect: false,
      singleSelection: false,
      idField: '_id',
      textField: 'column',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createForm();
    this.ageingForm.controls.organizationIDName.setValue(this.formObj.organizationIDName);
    this.ageingForm.controls.wareHouseIDName.setValue(this.formObj.wareHouseIDName);
    this.fetchAllLocations();
    this.fetchAllOrganizations();
    this.fetchAllWarehouseDetails();
    this.fetchAllProducts();
    this.fetchAllSupplierDetails();
    this.fetchAllProductCategories();
  }
  createForm() {
    this.ageingForm = this.fb.group({
      "wareHouseIDName": [null, Validators.required],
      "organizationIDName": [null, Validators.required],
      "dateType": [null, Validators.required],
      "dateValue": [null, Validators.required],
      "expiryDateFrom": null,
      "createdDateFrom": null,
      "mfgDateFrom": null,
      includeProductCategory: 'Yes',
      "productIDNames": null,
      "productCategoryNames": null,
      "supplierIDNames": null
    })
  }

  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategoriesResponseList = response.data.productCategories.map(x => x.productCategoryName);
        } else {
        }
      },
      (error) => {
      });
  }
  supplierIDNameIdValues: CompleterData
  suppliersResponseList: any;
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliersResponseList = response.data.supplierMasters;
          this.supplierIDNameIdValues = response.data.supplierMasters.map(sup => sup.supplierIDName);
          this.rerender();
        }
      },
      (error) => {
        // this.suppliers = [];
      });
  }
  productsResponseList: [];
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.productsResponseList = response.data.productMasters.map(prod => prod.productIDName);
        }
      })
  }
  organizationArrayList = [];
  fetchAllOrganizations() {
    this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['organizations'].length > 0) {
        this.organizationDropDownList = res['data']['organizations'].map(orgData => orgData.organizationIDName);


      }
    })
  }

  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseDropDownList = response.data.wareHouses.map(warehousename => warehousename.wareHouseIDName);

        }
      })
  }
  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locationDropDownList = response.data.locations.map(locationname => locationname.locationName);;
        } else {
        }
      },
      (error) => {
      });
  }
  ngAfterViewInit(): void {
    // this.dtTrigger.next();
  }
  clear() {
    this.overAll = null;
    this.columnNames = [];
    this.ageingForm.reset();
    this.ageingForm.controls.organizationIDName.setValue(this.formObj.organizationIDName);
    this.ageingForm.controls.wareHouseIDName.setValue(this.formObj.wareHouseIDName);
    this.categoryCheck = true;
    this.priceCheck = true;
  }
  change(value) {
    if (this.ageingForm.valid) {
      this.generate(value ? 'Yes' : 'No');
    }
  }
  generate(checkedValue) {
    const form = JSON.parse(JSON.stringify(this.ageingForm.value));
    if (form.dateType == 'By Date Of Purchase') {
      form['createdDateTo'] = form.dateValue;
    }
    else if (form.dateType == 'By Manufacture Date') {
      form['mfgDateTo'] = form.dateValue;
    }
    else if (form.dateType == 'To be Expired') {
      form['expiryDateFrom'] = form.dateValue;
    }
    else if (form.dateType == 'By Expiry Date') {
      form['expiryDateTo'] = form.dateValue;
    }
    form['organizationWareHouseCombinations'] = [{
      "wareHouseIDName": form.wareHouseIDName,
      "organizationIDName": form.organizationIDName,
    }];
    form["includeProductCategory"] = checkedValue ? checkedValue : (this.categoryCheck ? "Yes" : "No");
    delete form.dateValue;
    delete form.wareHouseIDName;
    delete form.organizationIDName;
    this.overAll = null;
    this.headers = [];
    this.dashboardSer.fetchAgeingReport(form).subscribe(res => {
      if (res['status'] == 0 && res['data'].inventoryAgeingMap['inventoryAgeingResponse']) {
        this.overAll = res['data'].inventoryAgeingMap;
        this.headers = Object.keys(this.overAll.abcClassInventoryAgeningMap);
        if (form["includeProductCategory"] === 'Yes') {
          this.overAll.inventoryAgeingResponse.productCategoryInventoryAgeings.forEach(element => {
            element.dummyabcClassInventoryAgenings = [];
            this.headers.forEach(head => {
              const indexValue = element.abcClassInventoryAgenings.findIndex(x => x.className == head);
              if (indexValue != -1) {
                element.dummyabcClassInventoryAgenings.push(element.abcClassInventoryAgenings[indexValue]);
              }
              else {
                element.dummyabcClassInventoryAgenings.push({
                  "className": head,
                  "fromDate": null,
                  "toDate": null,
                  "remainingRange": null,
                  "quantityInventoryUnit": 0,
                  "availableQuantity": null,
                  "reservedQuantity": null,
                  "quantityInventoryUnitValue": 0,
                  "availableQuantityValue": null,
                  "reservedQuantityValue": null
                })
              }
            });
            element.productInventoryAgeings.forEach(product => {
              product.dummyabcClassInventoryAgenings = [];
              this.headers.forEach(head => {
                const indexValue = product.abcClassInventoryAgenings.findIndex(x => x.className == head);
                if (indexValue != -1) {
                  product.dummyabcClassInventoryAgenings.push(product.abcClassInventoryAgenings[indexValue]);
                }
                else {
                  product.dummyabcClassInventoryAgenings.push({
                    "className": head,
                    "fromDate": null,
                    "toDate": null,
                    "remainingRange": null,
                    "quantityInventoryUnit": 0,
                    "availableQuantity": null,
                    "reservedQuantity": null,
                    "quantityInventoryUnitValue": 0,
                    "availableQuantityValue": null,
                    "reservedQuantityValue": null
                  })
                }
              });
            });
          });
        }
        else {
          this.overAll.inventoryAgeingResponse.productInventoryAgeings.forEach(product => {
            product.dummyabcClassInventoryAgenings = [];
            this.headers.forEach(head => {
              const indexValue = product.abcClassInventoryAgenings.findIndex(x => x.className == head);
              if (indexValue != -1) {
                product.dummyabcClassInventoryAgenings.push(product.abcClassInventoryAgenings[indexValue]);
              }
              else {
                product.dummyabcClassInventoryAgenings.push({
                  "className": head,
                  "fromDate": null,
                  "toDate": null,
                  "remainingRange": null,
                  "quantityInventoryUnit": 0,
                  "availableQuantity": null,
                  "reservedQuantity": null,
                  "quantityInventoryUnitValue": 0,
                  "availableQuantityValue": null,
                  "reservedQuantityValue": null
                })
              }
            });
          });
        }
      }
      // else {
      //   if (res['status'] == 0 && res['data'].inventoryAgeingMap['inventoryAgeingResponseList']) {
      //     // this.overAll = res['data'].inventoryAgeingMap;
      //     // this.overAll.inventoryAgeingResponseList.forEach((element, i) => {
      //     //   if (element.inventoryAgeings && element.inventoryAgeings.length > 0) {
      //     //     element.inventoryAgeings.forEach(prodCat => {
      //     //       prodCat.className = element.className;
      //     //       prodCat.overAllElementIndex = i;
      //     //     });
      //     //   }
      //     //   this.columnNames.push(...element.inventoryAgeings);
      //     // });
      //   }
      // }
    })
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}
