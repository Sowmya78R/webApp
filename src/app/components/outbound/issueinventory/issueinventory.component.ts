import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { TabHeadingDirective } from 'ngx-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DecimalUtils } from 'src/app/constants/decimal';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-issueinventory',
  templateUrl: './issueinventory.component.html',
  styleUrls: ['./issueinventory.component.scss']
})
export class IssueinventoryComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  formObj = this.configService.getGlobalpayload();
  productsResponseList: any;
  tableHeadings: any = ['S.No', 'Include', 'Action', 'Transaction ID', 'Location Name', 'Product ID', 'Product Name', 'Product Description',
    'Brand Name', 'Available Quantity', 'Issued Quantity', 'Reason', 'Created By', 'Approved By/Rejected By', 'Completed Date']
  productCategoriesResponseList: any;
  productCategoryValuesIDs: CompleterData
  productListValuesIDs: CompleterData
  issuesInventoryForm: FormGroup;
  linesArray: any = [];
  inventoryHelpersArray: any;
  inventoryHelpers: any = [];
  pickupLocations: any = [];
  obj: any = null;
  globalIndex: any = null;
  locationType: any = 'All';
  locAllocation: any = 'Manual';
  selectedLineIndex: any = null;
  selectedLine: any = null;
  status: any;
  selectAllCheckboxValue: boolean = false;
  selectAllLinesVariable: boolean = false;
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
  productCategories: any = [];
  showTooltip: any = false;

  categoriesList: any = [];
  subList1: any = []
  subList3: any = []
  subList2: any = [];
  productCategoryGroupsResponseList: any = [];
  exisitingRecord: any = null;
  isSub1Disable: boolean = false;
  isSub2Disable: boolean = false
  isSub3Disable: boolean = false
  products: any = [];
  failureRecords: any = [];
  exportData: any = [];
  loopToStopLoc: any = null;
  dataPerPageLoc: number;

  page: number = 1;
  itemsPerPage = 5;
  totalItemsLoc: any;
  searchKey: any = null;
  sortDirection: any = null;


  loopToStop: any = null;
  dataPerPage: number;
  totalItems: any;
  issueAllData: any = [];
  selectedLinesArray: any = [];

  createInssuesInventoryForm() {
    this.issuesInventoryForm = this.fb.group({
      productIDNames: null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      productCategoryNames: null,
      subcatgory1: null,
      subcatgory2: null,
      subcatgory3: null
    })
  }
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  issueInventoryTableFetch: any = [];
  remarksGlobal: any = null;


  constructor(private wmsService: WMSService, private metaDataService: MetaDataService,
    private configService: ConfigurationService,
    private outboundProcessService: OutboundProcessService,
    private fb: FormBuilder, private toastr: ToastrService,
    private ngxSmartModalService: NgxSmartModalService, private excelService: ExcelService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createInssuesInventoryForm();
    this.fetchAllProductCategories();
    this.fetchAllProducts();
    this.fetchAllProductCategoryGroupsDetails();
    this.fetchAllInventoryIssues();
    this.filter();
    this.fetchPickingAllocationTpe();
    this.fetchAllLocationsPagination();
  }
  fetchAllProductCategoryGroupsDetails() {
    this.wmsService.fetchAllProductCategoryGroups(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategoryGroups && response.data.productCategoryGroups) {
          this.productCategoryGroupsResponseList = response.data.productCategoryGroups
        }
      })
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.productCategories = response.data.productCategories
          this.categoriesList = response.data.productCategories.map(x => x.productCategoryName);
        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
    this.metaDataService.fetchAllCommonSubCategory1s(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory1s) {
          this.subList1 = response.data.productSubCategory1s.map(x => x.productSubCategory1Name);
        }
        else {
          this.subList1 = [];
        }
      },
      error => {
        this.subList1 = [];
      }
    );


    this.metaDataService.fetchAllCommonSubCategory2s(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory2s) {
          this.subList2 = response.data.productSubCategory2s.map(x => x.productSubCategory2Name);
        }
        else {
          this.subList2 = [];
        }
      },
      error => {
        this.subList2 = [];
      }
    );


    this.metaDataService.fetchAllCommonSubCategory3s(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory3s) {
          this.subList3 = response.data.productSubCategory3s.map(x => x.productSubCategory3Name);
        }
        else {
          this.subList3 = [];
        }
      },
      error => {
        this.subList3 = [];
      }
    );
  }
  getCategoryName() {
    if (this.issuesInventoryForm.controls.productCategoryNames.value) {
      this.getDropdownDatas();
      const form = this.issuesInventoryForm.value;
      if (form.productCategoryNames && form.productCategoryNames.length > 1) {
        this.isSub3Disable = true;
        this.isSub2Disable = true;
        this.isSub1Disable = true;
        this.issuesInventoryForm.controls.subcatgory1.setValue(null);
        this.issuesInventoryForm.controls.subcatgory2.setValue(null);
        this.issuesInventoryForm.controls.subcatgory3.setValue(null);
      }
      else {
        this.isSub3Disable = false;
        this.isSub2Disable = false;
        this.isSub1Disable = false;
      }
    }
  }
  getDropdownDatas() {
    const final = {
      "productCategoryNames": this.issuesInventoryForm.controls.productCategoryNames.value,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "productCategoryHierarchies": this.heirarchiesFraming()
    }
    this.issuesInventoryForm.controls.productIDNames.setValue(null);
    this.wmsService.getProductFiltersData(final).subscribe(res => {
      if (res['status'] == 0 && res['data'].productFilterResponse) {
        this.productListValuesIDs = res['data'].productFilterResponse.productIDNames;
      }
    })
  }
  getExistingCategory() {
    const form = this.issuesInventoryForm.value;
    if (form.productCategoryNames && form.productCategoryNames.length == 1) {
      this.exisitingRecord = this.productCategoryGroupsResponseList.find(k => k.productCategoryName === form.productCategoryNames[0])

      if (this.exisitingRecord && form.subcatgory1 && form.subcatgory1.length == 1) {
        this.isSub2Disable = false;
        const child = this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == form.subcatgory1[0]);

        if (child) {
          this.issuesInventoryForm.controls.subcatgory2.setValue(child.childProductSubCategories.map(x => x.productSubCategoryName));
          this.getSub3DropdownDisable();
        }
        else {
          this.issuesInventoryForm.controls.subcatgory2.setValue(null);
          this.issuesInventoryForm.controls.subcatgory3.setValue(null);
        }
      }
      else {
        if (form.subcatgory1 && form.subcatgory1.length > 1) {
          this.isSub2Disable = true;
          this.isSub3Disable = true;
        }
        else {
          this.isSub2Disable = false;
          this.isSub3Disable = false;
        }
        this.issuesInventoryForm.controls.subcatgory2.setValue(null);
        this.issuesInventoryForm.controls.subcatgory3.setValue(null);
      }
    }
    else {
      this.issuesInventoryForm.controls.subcatgory1.setValue(null);
      this.issuesInventoryForm.controls.subcatgory2.setValue(null);
      this.issuesInventoryForm.controls.subcatgory3.setValue(null);
    }
    this.getDropdownDatas();
  }
  getSub3DropdownDisable() {
    this.getDropdownDatas();
    const data = this.issuesInventoryForm.value;
    if (data.subcatgory2 != null && data.subcatgory2.length > 1) {
      this.issuesInventoryForm.controls.subcatgory3.setValue(null);
      this.isSub3Disable = true;
    } else {
      if (data.subcatgory2 == null || data.subcatgory2.length == 0) {
        this.issuesInventoryForm.controls.subcatgory3.setValue(null);
      }
      else if (data.subcatgory2.length == 1) {
        this.isSub3Disable = false;
        if (this.exisitingRecord) {
          const child = this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == data.subcatgory1[0]);
          if (child) {
            const child1 = child.childProductSubCategories.find(x => x.productSubCategoryName == data.subcatgory2[0]);
            if (child1 && child1.childProductSubCategories) {
              this.issuesInventoryForm.controls.subcatgory3.setValue(child1.childProductSubCategories.map(x => x.productSubCategoryName));
              this.getDropdownDatas();
            }
            else {
              this.issuesInventoryForm.controls.subcatgory3.setValue(null);
            }
          }
          else {
            this.isSub3Disable = true;
            this.issuesInventoryForm.controls.subcatgory3.setValue(null);
          }
        }
      }
      else {
      }
    }
  }
  clear() {
    this.issuesInventoryForm.reset();
    this.createInssuesInventoryForm();
    this.isSub1Disable = false;
    this.isSub2Disable = false;
    this.isSub3Disable = false;
    this.remarksGlobal = null;
    this.getData();
  }
  getData() {
    this.rerender();
    this.dtTrigger2.next();
    this.filter();
    this.fetchAllProducts();
  }
  filter() {
    let form = {};
    form['productIDNames'] = this.issuesInventoryForm.value.productIDNames,
      form["productCategoryNames"] = this.issuesInventoryForm.controls.productCategoryNames.value,
      form["productCategoryHierarchies"] = this.heirarchiesFraming(),
      form["organizationIDName"] = this.formObj.organizationIDName,
      form["wareHouseIDName"] = this.formObj.wareHouseIDName
    this.outboundProcessService.firstTable(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryIssueList) {
          this.linesArray = response.data.inventoryIssueList;
          this.linesArray.forEach(ele => {
            ele['isChecked'] = (ele.issueQuantity && ele.remarks) ? true : false
          })
          this.dtTrigger.next();
        }
        else {
          this.toastr.error("No Data Availble to Fetch");
          this.dtTrigger.next();
        }
      })
  }
  heirarchiesFraming() {
    const form = this.issuesInventoryForm.value;
    if (form.productCategoryNames && (!form.subcatgory1 && !form.subcatgory2 && !form.subcatgory3)) {
      return null;
    }
    else {
      if (!form.productCategoryNames && (!form.subcatgory1 && !form.subcatgory2 && !form.subcatgory3)) {
        return null;
      }
      else {
        let arr: any = []
        let obj = {
          "hierarchyLevel": 0,
          "productSubCategoryNames": this.issuesInventoryForm.controls.productCategoryNames.value,
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
        return arr;
      }
    }
  }
  openModalRecievedLocations(fromTable, i) {
    this.selectedLine = fromTable;
    this.selectedLineIndex = i;
    if (fromTable && fromTable.issueQuantity) {
      this.ngxSmartModalService.getModal('pickupLocationsModal').open();
      this.getLocations({
        "productMasterID": fromTable.productMasterInfo.productMasterID,
        "productID": fromTable.productMasterInfo.productID,
        "productName": fromTable.productMasterInfo.productName,
        "productIDName": fromTable.productMasterInfo.productIDName
      })
    }
    else {
      this.toastr.error("Enter Manditory Fields!!")
    }
  }
  getLocations(data) {
    const final = Object.assign(data, this.formObj);
    const ffValues = this.selectedLine;
    const updatedLocationsList = (this.locAllocation == 'Auto') ? null : ffValues.inventoryHelpers;
    this.wmsService.getManualLocationsForWarehouseTransfer(final).subscribe(res => {
      if (res && res.status === 0 && res.data.inventoryHelpers && res.data.inventoryHelpers.length > 0) {
        this.pickupLocations = res.data.inventoryHelpers;

        this.pickupLocations.forEach(x => {
          x['isEdit'] = false;
          x['isChecked'] = false;
        });

        if (updatedLocationsList && updatedLocationsList.length > 0) {
          updatedLocationsList.forEach(element => {
            this.pickupLocations.forEach(picele => {
              if (element._id == picele._id) {
                picele['pickedQuantity'] = element.pickedQuantity;
                picele['isEdit'] = true;
                picele['isChecked'] = true;
              }
            });
          });
        }
      }
      else {
        if (res.status == 2) {
          this.toastr.error(res.statusMsg);
        }
        this.pickupLocations = [];
      }
    })
  }
  read1(event, data1) {
    this.pickupLocations.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.pickupLocations.find(x => x.isEdit == true);
      if (currentItem && (currentItem.pickedQuantity == null)) {
        this.toastr.warning('Enter Picked Quantity');
      }
      this.pickupLocations.map(element => element.isEdit = false);
      data1.isEdit = true;
      if (currentItem && currentItem.pickedQuantity) {
        if (event.target.checked && data1.pickedQuantity) {
          data1.isChecked = event.target.value;
        }
        else if (event.target.checked && !data1.pickedQuantity) {
          data1.isChecked = event.target.value;
          data1.isEdit = true;
        }
        else {
          data1.isChecked = false;
          data1.isEdit = false;
          data1['pickedQuantity'] = '';
        }
      }
    }
    else {
      data1.isChecked = false;
      data1.isEdit = false;
      data1.pickedQuantity = null;
    }
    this.pickupLocations.forEach(element => {
      if (element.pickedQuantity) {
        element.isChecked = true;
      }
    });
  }
  savequantity(value, data) {
    if (value == null || (typeof (value) == 'string' ? value.trim() : value) == '') {
      data.isEdit = false;
      data['pickedQuantity'] = '';
      data['isChecked'] = false;
    }
    else {
      if (DecimalUtils.greaterThanOrEqual(data.quantityInventoryUnit, value)) {
        data['pickedQuantity'] = value;
        data['isChecked'] = true;
      }
      else {
        data.isEdit = false;
        data['pickedQuantity'] = '';
        data['isChecked'] = false;
        this.toastr.error('Pickup Quantity should be less than or equal to Available Quantity')
      }
    }
  }
  savePickupLocations() {
    let count: any = 0;
    this.pickupLocations.forEach(element => {
      if (element.isChecked) {
        count = DecimalUtils.add(count, element.pickedQuantity);
      }
    });
    if (DecimalUtils.equals(count, this.selectedLine.issueQuantity)) {
      this.ngxSmartModalService.getModal('pickupLocationsModal').close();
      this.toastr.success('Saved');
      let filteredRecieveLocations = [];
      filteredRecieveLocations = this.pickupLocations.filter(x => x.isChecked == true);

      this.linesArray[this.selectedLineIndex].inventoryHelpers = filteredRecieveLocations;

    }
    else {
      this.toastr.error("Selected Locations Quantity should be equal Transfered Quantity");
    }
  }
  resetRecieveLocations() {
    this.getLocations({
      "productMasterID": this.selectedLine.productMasterInfo.productMasterID,
      "productID": this.selectedLine.productMasterInfo.productID,
      "productName": this.selectedLine.productMasterInfo.productName,
      "productIDName": this.selectedLine.productMasterInfo.productIDName
    })

  }

  selectAllData(event, arr) {
    console.log(arr);
    if (event.target.checked) {
      this[arr].forEach(element => {
        if (element.status != 'Completed' && element.status != 'Rejected') {
          element.isChecked = true;
        }
        else {
          element.isChecked = false;
        }
      });
    }
    else {
      this[arr].forEach(element => {
        element.isChecked = false;
      });
    }
  }
  selectAllDataForSecond(event, arr) {
    if (event.target.checked) {
      this[arr].forEach(element => {
        if (element.status != 'Completed' && element.status != 'Rejected') {
          element.isChecked = true;
        }
        else {
          element.isChecked = false;
        }
      });
    }
    if (this.issueAllData.length == 0) {
      this.getAllissueInventories();
    }
    else {
      if (event.target.checked) {
        this.selectedLinesArray = this.issueAllData;
      }
      else {
        this.selectedLinesArray = [];
      }
    }
  }
  getAllissueInventories(index?) {
    if (!index) {
      this.issueAllData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      console.log(this.issueAllData);
      this.issueAllData.forEach(element => {
        element.isChecked = true;
        if (element.status != 'Completed' || element.status != 'Rejected') {
          this.selectedLinesArray.push(element);
        }
      });
    }
    else {
      if (((i == 1) || (i != 1 && this.issueAllData.length > 0)) && i <= this.loopToStop) {
        const form = {
          "page": i,
          "pageSize": this.dataPerPage,
          "searchKeyword": this.searchKey,
          "searchOnKeys": PaginationConstants.issueInventorySearchOnKeysWithPagination,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName,
          "issueStatus": (this.newObj.issueStatus === 'All') ? null : this.newObj.issueStatus,
          "status": this.newReqObj.status
        }
        this.globalStatus = this.newReqObj.status
        this.outboundProcessService.secondTable(form).subscribe((response) => {
          if (response && response.status === 0 && response.data.inventoryIssuePaginationResponse.inventoryIssues) {
            this.issueAllData = [...this.issueAllData, ...response.data.inventoryIssuePaginationResponse.inventoryIssues];
            this.getAllissueInventories(i);
          }
        })
      }
    }
  }

  onSelect(event, data) {
    if (event.target.checked) {
      data.isChecked = true
    } else {
      data.isChecked = false;
    }
    this.selectAllLinesVariable = this.linesArray.every(function (item: any) {
      return item.isChecked == true;
    })
  }
  fetchPickingAllocationTpe() {
    this.metaDataService.getLocationAllocationType(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.pickingLocationAllocationConfigurations && res.data.pickingLocationAllocationConfigurations.length > 0) {
        this.locAllocation = res.data.pickingLocationAllocationConfigurations[0].pickingLocationAllocationType;
      }
      else {
        this.locAllocation = "Manual";
      }
    })
  }
  globalData: any;
  onCheckBoxSelect(event, data) {
    if (event.target.checked) {
      data.isChecked = true
      this.selectedLinesArray.push(data);
    } else {
      data.isChecked = false;
      this.selectedLinesArray = this.selectedLinesArray.filter(x => x._id != data._id);
    }
    // this.selectAllCheckboxValue = this.issueInventoryTableFetch.every(function (item: any) {
    //   return item.isChecked == true;
    // })
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
          this.productListValuesIDs = response.data.productMasters.map(prod => prod.productIDName);
        }
      })
  }


  getFirstTableData(event, data, val, i) {
    data[val] = (val == 'issueQuantity') ? DecimalUtils.valueOf(event.target.value) : event.target.value;
    if (!data.remarks) {
      data.remarks = this.remarksGlobal;
    }
    if (data.issueQuantity && data.remarks) {
      this.linesArray[i].isChecked = true;
    }
    else {
      this.linesArray[i].isChecked = false;
    }

  }
  globalArray: any = []

  addRemarkstoLine() {
    if (this.remarksGlobal) {
      this.linesArray.forEach((element, i) => {
        if (element.issueQuantity && !element.remarks) {
          element.remarks = this.remarksGlobal;
          this.linesArray[i].isChecked = true;
        }
      });
    }
  }

  firstTableSave() {

    const arr = this.linesArray.filter(x => x.isChecked);
    if (arr.length > 0) {
      const dontProceed = arr.find(x => (!x.issueQuantity || !x.remarks || (this.locAllocation == 'Manual' && (!x.inventoryHelpers || x.inventoryHelpers.length == 0)) || (this.locAllocation == 'Auto' && x.inventoryHelpers)));
      if (dontProceed) {
        this.toastr.error("Enter Manditory For selected Lines");
      }
      else {
        arr.forEach(element => {
          delete element.isChecked;
          if (this.locAllocation == 'Auto') {
            element.inventoryHelpers = null;
          }
          else {
            element.locationAllocationType = 'Manual';
          }
        });
        this.outboundProcessService.saveOrUpdateInventoryIssue(arr).subscribe((response) => {
          if (response && response.status === 0 && response.data.inventoryIssue) {
            this.toastr.success("Saved Successfully")
            this.remarksGlobal = null;
            this.rerender();
            this.filter();
            this.fetchAllInventoryIssues();
          }
        })
      }
    }
    else {
      this.toastr.error("Select Atleast One line");
    }

  }
  validateDecimal(arr, key, i) {
    this[arr][i][key] = DecimalUtils.enterLimitedDecimals(this[arr][i][key], 10);

  }
  statusSave(arr, event, status?) {

    let proceed = true;
    let finalValue = []
    if (event) {
      arr.status = event.target.value;
      delete arr.isChecked;
      finalValue = [arr];
    }
    else {
      // const selectedArray = this.issueInventoryTableFetch.filter(x => x.isChecked);
      const selectedArray = this.selectedLinesArray.filter(x => x.isChecked);
      if (selectedArray.length > 0) {
        selectedArray.forEach(element => {
          element.status = status;
          delete element.isChecked;
        });
        finalValue = selectedArray;
      }
      else {
        this.toastr.error("Select Atleast One line");
        proceed = false;
      }
    }
    if (proceed) {
      this.outboundProcessService.saveOrUpdateInventoryIssue(finalValue).subscribe((response) => {
        if (response && response.status === 0 && response.data.inventoryIssue) {
          this.toastr.success("Changed Status");
          this.rerender();
          this.filter();
          this.fetchAllInventoryIssues();
          if (!event) {
            this.selectedLinesArray = [];
            this.issueAllData = [];
            this.selectAllCheckboxValue = false;
          }
        }
      })
    }
  }
  getChangedStatus() {
    this.rerender();
    this.dtTrigger.next();
    this.fetchAllInventoryIssues();
  }
  fetchAllD(page, event) {
    if (event) {
      this.fetchAllInventoryIssues(page, event.target.value);
    }
  }
  sortFields: any = null;
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['inventoryTransactionBindArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.fetchAllInventoryIssues(this.page, this.itemsPerPage);
  }
  newObj = { issueStatus: 'Open' };
  newReqObj = {
    status: 'Created'
  }

  fetchAllInventoryIssues(page?, pageSize?) {
    const form = {
      "page": page ? page : 1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": PaginationConstants.issueInventorySearchOnKeysWithPagination,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "issueStatus": (this.newObj.issueStatus === 'All') ? null : this.newObj.issueStatus,
      "status": this.newReqObj.status
    }
    this.globalStatus = this.newReqObj.status
    this.outboundProcessService.secondTable(form).subscribe((response) => {
      if (response && response.status === 0 && response.data.inventoryIssuePaginationResponse.inventoryIssues) {
        this.issueInventoryTableFetch = response.data.inventoryIssuePaginationResponse.inventoryIssues;
        this.totalItems = response.data.inventoryIssuePaginationResponse.totalElements;
        let selectedCheckIDs = [];
        if (this.selectedLinesArray.length > 0) {
          selectedCheckIDs = this.selectedLinesArray.map(x => x._id);
        }
        this.issueInventoryTableFetch.forEach(element => {
          element.isChecked = false;
          if ((element.status != 'Completed' && element.status != 'Rejected')) {
            if (this.selectAllCheckboxValue) {
              element.isChecked = true;
            }
            if (selectedCheckIDs.includes(element._id)) {
              element.isChecked = true;
            }
          }
        });
        const lengthofTotalItems = this.totalItems.toString().length;
        const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        count.forEach(el => {
          if (lengthofTotalItems == el) {
            let value: any = 1 + this.configService.addZerosMethod(el);
            this.dataPerPage = parseInt(value);
          }
        });
        const n: any = (this.totalItems / this.dataPerPage).toString()
        let m = n.split('.')
        if (m[1]) {
          this.loopToStop = parseInt(m[0]) + 1
        } else {
          this.loopToStop = parseInt(m[0])
        }
        this.dtTrigger2.next();
      }
    })
  }
  globalStatus: any;
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger2.unsubscribe();
  }
  uploadExcel(event) {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      if (file) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = async (e) => {
          const arrayBuffer: any = fileReader.result;
          const fileData = new Uint8Array(arrayBuffer);
          const arr = new Array();
          for (let i = 0; i !== fileData.length; ++i) { arr[i] = String.fromCharCode(fileData[i]); }
          const bstr = arr.join('');
          const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
          if (jsonData && jsonData.length > 0) {
            const missingParamsArray = [];
            let data1 = [];
            jsonData.forEach((k, index) => {
              if (k['Product ID'] && k['Inventory ID']) {
                data1.push(this.getFormat(k));
              }
              else if (!k['Product ID'] && k['Inventory ID']) {
                data1[data1.length - 1]['inventoryHelpers'].push(this.linesArray1(k));
              }
              else {
                data1.push(this.getFormat(k))
              }
            })
            // if (missingParamsArray.length > 0) {
            //   this.missingParams = missingParamsArray;
            // }
            if (data1.length > 0) {
              console.log(data1);
              this.wmsService.issueInventoryExcel(data1).subscribe(res => {
                if (res && res.status === 0 && res.data.inventoryIssueResponseMap && res.data.inventoryIssueResponseMap.inventoryIssueSuccessExcelList &&
                  res.data.inventoryIssueResponseMap.inventoryIssueSuccessExcelList.length > 0) {
                  this.toastr.success('Uploaded successfully');
                  this.fetchAllInventoryIssues(1);
                  this.failureRecords = [];
                }
                else if (res && (res.status === 2 || res.status == 0) && res.data.inventoryIssueResponseMap && res.data.inventoryIssueResponseMap.inventoryIssueFailureExcelList &&
                  res.data.inventoryIssueResponseMap.inventoryIssueFailureExcelList.length > 0 && res.data.inventoryIssueResponseMap.inventoryIssueSuccessExcelList &&
                  res.data.inventoryIssueResponseMap.inventoryIssueSuccessExcelList.length > 0) {
                  this.failureRecords = res.data.inventoryIssueResponseMap.inventoryIssueFailureExcelList;
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.fetchAllInventoryIssues(1);
                }
                else if (res && (res.status === 2 || res.status == 0) && res.data.inventoryIssueResponseMap && res.data.inventoryIssueResponseMap.inventoryIssueFailureExcelList &&
                  res.data.inventoryIssueResponseMap.inventoryIssueFailureExcelList.length > 0) {
                  this.failureRecords = res.data.inventoryIssueResponseMap.inventoryIssueFailureExcelList;
                  this.toastr.error('Failed in uploading, Please download log for reasons');
                }
                else {
                  this.toastr.error('Failed in uploading');
                  this.failureRecords = [];
                }
              })
            }
          }
        }
      }
    }
  }
  mapID(ID, key) {
    if (key == 'Prod') {
      const filteredProd = this.products.find(x => x.productID == ID);
      return {
        "productMasterID": filteredProd ? filteredProd._id : null,
        "productID": ID,
        "productName": filteredProd ? filteredProd.productName : null,
        "productIDName": filteredProd ? filteredProd.productIDName : null,
        "moq": filteredProd ? filteredProd.moq : null,
        "leadTime": filteredProd ? filteredProd.leadTime : null,
        "receivingUnit": filteredProd ? filteredProd.receivingUnit : null,
        "productImage": filteredProd ? filteredProd.productImage : null,
        "price": filteredProd ? filteredProd.price : null,
        "currency": filteredProd ? filteredProd.currency : null,
        "markup": filteredProd ? filteredProd.markup : null,
        "markupType": filteredProd ? filteredProd.markupType : null,
        "productSubCategory1Names": filteredProd ? filteredProd.productSubCategory1Names : null,
        "productSubCategory2Names": filteredProd ? filteredProd.productSubCategory2Names : null,
        "productSubCategory3Names": filteredProd ? filteredProd.productSubCategory3Names : null,
        "productCategoryGroupDetail": filteredProd ? filteredProd.productCategoryGroupDetail : null,
        "brandNames": filteredProd ? filteredProd.brandNames : null,
        "productDescription": filteredProd ? filteredProd.productDescription : null,
        "storageInstruction": filteredProd ? filteredProd.storageInstruction : null,
      }

    }
    else if (key == 'Loc') {
      const filteredLoc = this.exportData.find(x => x.locationName == ID);
      return {
        "locationID": filteredLoc ? filteredLoc._id : null,
        "locationName": ID
      }
    }
  }
  getFormat(k) {
    let obj = {};
    obj['productMasterInfo'] = k['Product ID'] ? this.mapID(k['Product ID'], 'Prod') : null;
    obj['brandName'] = k['Brand Name'] ? k['Brand Name'] : null;
    obj['inventoryUnit'] = k['Inventory Unit'] ? k['Inventory Unit'] : null;
    obj['issueQuantity'] = k['Total Issue Quantity'] ? k['Total Issue Quantity'] : null;
    obj['remarks'] = k['Remarks'] ? k['Remarks'] : null;
    obj['organizationInfo'] = this.configService.getOrganization();
    obj['wareHouseInfo'] = this.configService.getWarehouse();
    obj['inventoryHelpers'] = k['Inventory ID'] ? [this.linesArray1(k)] : [];
    obj['locationAllocationType'] = k['Inventory ID'] ? 'Manual' : 'Auto';
    return obj;
  }
  linesArray1(doc) {
    let fullID = null;
    if (doc['inventoryIDPrefix']) {
      fullID = doc['inventoryIDPrefix'].trim();
    }
    if (doc['Inventory ID']) {
      if (fullID) {
        fullID = fullID + doc['Inventory ID'].toString().trim();
      }
      else {
        fullID = doc['Inventory ID'].toString().trim();
      }
    }
    let obj = {
      "locationInfo": doc['Location Name'] ? this.mapID(doc['Location Name'], 'Loc') : null,
      "pickedQuantity": doc['Issue Qty'] ? doc['Issue Qty'] : null,
      inventoryIDPrefix: doc['inventoryIDPrefix'] ? doc['inventoryIDPrefix'].trim() : null,
      "inventoryID": doc['Inventory ID'] ? doc['Inventory ID'] : null,
      fullInventoryID: fullID,
    }
    return obj
  }
  downloadLogFile() {
    let htmlText = '';
    if (this.failureRecords) {
      htmlText = this.failureRecords.toString().replace(/,/g, '\r\n');;
    }
    this.dyanmicDownloadByHtmlTag({
      fileName: "Issue Inventory Error Details",
      text: htmlText
    });
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

  exportAsXLSX() {
    const changedTaskList = this.exportTypeMethod();
    this.excelService.exportAsExcelFile(changedTaskList, 'Issue Inventory', null);
  }
  exportTypeMethod() {
    const arr = []
    const obj = {}
    obj['Product ID'] = null;
    obj['Inventory Unit'] = null;
    obj['Brand Name'] = null;
    obj['Total Issue Quantity'] = null
    obj['Remarks'] = null
    obj['inventoryIDPrefix'] = null
    obj['Inventory ID'] = null
    obj['Location Name'] = null
    obj['Issue Qty'] = null
    arr.push(obj)
    return arr
  }
  fetchAllLocationsPagination() {
    const form = {
      "page": 1,
      "pageSize": 10,
      "searchKeyword": null,
      "searchOnKeys": null,
      "sortDirection": null,
      "sortFields": null,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName
    }
    this.wmsService.fetchAllLocationsWithPaginations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locationPaginationResponse.locations) {
          this.totalItemsLoc = response.data.locationPaginationResponse.totalElements;

          const lengthofTotalItems = this.totalItemsLoc.toString().length;
          const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          count.forEach(el => {
            if (lengthofTotalItems == el) {
              let value: any = 1 + this.configService.addZerosMethod(el);
              this.dataPerPageLoc = parseInt(value);
            }
          });
          const n: any = (this.totalItemsLoc / this.dataPerPageLoc).toString()
          let m = n.split('.')
          if (m[1]) {
            this.loopToStopLoc = parseInt(m[0]) + 1
          } else {
            this.loopToStopLoc = parseInt(m[0])
          }
          this.getAllLocationsForDownload();
        } else {
        }
      },
      (error) => {
      });
  }
  getAllLocationsForDownload(index?) {
    if (!index) {
      this.exportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStopLoc) {
      // console.log(this.exportData);
    }
    else {
      if (((i == 1) || (i != 1 && this.exportData.length > 0)) && i <= this.loopToStopLoc) {
        const form = {
          "page": i,
          "pageSize": this.dataPerPageLoc,
          "searchKeyword": null,
          "searchOnKeys": null,
          "sortDirection": null,
          "sortFields": null,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }

        this.wmsService.fetchAllLocationsWithPaginations(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.locationPaginationResponse.locations) {
              this.exportData = [...this.exportData, ...response.data.locationPaginationResponse.locations];
              this.getAllLocationsForDownload(i);
            }
          })
      }
    }
  }
}
