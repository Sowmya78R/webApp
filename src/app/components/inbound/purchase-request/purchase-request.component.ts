import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DecimalUtils } from 'src/app/constants/decimal';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { OutboundMasterDataService } from 'src/app/services/integration-services/outboundMasterData.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-purchase-request',
  templateUrl: './purchase-request.component.html',
  styleUrls: ['./purchase-request.component.scss']
})
export class PurchaseRequestComponent implements OnInit, OnDestroy {
  @Output() emitTripSheet: any = new EventEmitter<any>();
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  PRForm: FormGroup;
  orderTypeDropdown = ['Sales Order', 'WareHouseTransfer'];
  includeCheck: boolean = true;
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
  formObj = this.configService.getGlobalpayload();
  productIDs: any = [];
  productCategories: any = [];

  categoriesList: any = [];
  subList1: any = []
  subList3: any = []
  subList2: any = [];
  exisitingRecord: any = null;
  isSub1Disable: boolean = false;
  isSub2Disable: boolean = false
  isSub3Disable: boolean = false
  productCategoryGroupsResponseList: any = [];
  wareHouseIDs: any = [];
  customerIDs: any = [];
  supplierIDNamesMasters: any = [];
  overAll: any = null;
  table1Array: any = [];
  units: any = [];
  suppliers: any = [];
  uomConversions: any = [];
  supplierIDName: any = null;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger1: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  expectedDeliveryDate: any = null;
  selectAllCheckboxValue: boolean = false;
  secondTableArr: any = [];

  constructor(
    private configService: ConfigurationService, private fb: FormBuilder, private wmsService: WMSService,
    private translate: TranslateService, private metaDataService: MetaDataService, private datepipe: DatePipe,
    private outboundMasterDataService: OutboundMasterDataService, private toastr: ToastrService,
    private commonMasterDataService: CommonMasterDataService
  ) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.createForm();
    this.fetchAllProducts();
    this.fetchAll();
    this.fetchAllProductCategories();
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
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger1.unsubscribe();
  }
  getDataForFilters(fromClear) {
    if (this.overAll) {
      this.rerender();
    }
    this.getDetails(fromClear);
  }
  getCategoryName() {
    if (this.PRForm.controls.productCategoryNames.value) {
      this.getDropdownDatas();
      const form = this.PRForm.value;
      if (form.productCategoryNames && form.productCategoryNames.length > 1) {
        this.isSub3Disable = true;
        this.isSub2Disable = true;
        this.isSub1Disable = true;
        this.PRForm.controls.subcatgory1.setValue(null);
        this.PRForm.controls.subcatgory2.setValue(null);
        this.PRForm.controls.subcatgory3.setValue(null);
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
      "productCategoryNames": this.PRForm.controls.productCategoryNames.value,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,
      "productCategoryHierarchies": this.heirarchiesFraming()
    }
    this.PRForm.controls.productIDNames.setValue(null);
    this.wmsService.getProductFiltersData(final).subscribe(res => {
      if (res['status'] == 0 && res['data'].productFilterResponse) {
        this.productIDs = res['data'].productFilterResponse.productIDNames;
      }
    })
  }

  createForm() {
    this.PRForm = this.fb.group({
      "productIDNames": null, //array here
      "productCategoryHierarchies": null,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "orderTypes": null, //array here
      "includeInventory": null,
      "dateFrom": null,
      "dateTo": null,
      productCategoryNames: null,
      subcatgory1: null,
      subcatgory2: null,
      subcatgory3: null,
      "destinationWareHouseIDNames": null,
      "customerIDNames": null,
      supplierIDName: null
    })
  }
  fetchAll() {
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseIDs = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
    this.outboundMasterDataService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers) {
          this.customerIDs = response.data.customers.map(x => x.customerIDName);
        }
      },
      (error) => {
      });
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.units && response.data.units.length) {
          this.units = response.data.units;
        }
        else {
          this.units = [];
        }
      },
      error => {
        this.units = [];
      });
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
          this.supplierIDNamesMasters = this.suppliers.map(x => x.supplierIDName);
        }
      })
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters.length > 0) {
          this.productIDs = response.data.productMasters.map(x => x.productIDName);
        }
      })
    this.commonMasterDataService.fetchAllUOMConversion(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.uoms) {
          this.uomConversions = response.data.uoms;
        }
      },
      (error) => {
      });
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategoryGroups(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategoryGroups && response.data.productCategoryGroups) {
          this.productCategoryGroupsResponseList = response.data.productCategoryGroups
        }
      })
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
  getExistingCategory() {
    const form = this.PRForm.value;
    if (form.productCategoryNames && form.productCategoryNames.length == 1) {
      this.exisitingRecord = this.productCategoryGroupsResponseList.find(k => k.productCategoryName === form.productCategoryNames[0])

      if (this.exisitingRecord && form.subcatgory1 && form.subcatgory1.length == 1) {
        this.isSub2Disable = false;
        const child = this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == form.subcatgory1[0]);

        if (child) {
          this.PRForm.controls.subcatgory2.setValue(child.childProductSubCategories.map(x => x.productSubCategoryName));
          this.getSub3DropdownDisable();
        }
        else {
          this.PRForm.controls.subcatgory2.setValue(null);
          this.PRForm.controls.subcatgory3.setValue(null);
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
        this.PRForm.controls.subcatgory2.setValue(null);
        this.PRForm.controls.subcatgory3.setValue(null);
      }
    }
    else {
      this.PRForm.controls.subcatgory1.setValue(null);
      this.PRForm.controls.subcatgory2.setValue(null);
      this.PRForm.controls.subcatgory3.setValue(null);
    }
    this.getDropdownDatas();
  }
  getSub3DropdownDisable() {
    this.getDropdownDatas();
    const data = this.PRForm.value;
    if (data.subcatgory2 != null && data.subcatgory2.length > 1) {
      this.PRForm.controls.subcatgory3.setValue(null);
      this.isSub3Disable = true;
    } else {
      if (data.subcatgory2 == null || data.subcatgory2.length == 0) {
        this.PRForm.controls.subcatgory3.setValue(null);
      }
      else if (data.subcatgory2.length == 1) {
        this.isSub3Disable = false;
        if (this.exisitingRecord) {
          const child = this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == data.subcatgory1[0]);
          if (child) {
            const child1 = child.childProductSubCategories.find(x => x.productSubCategoryName == data.subcatgory2[0]);
            if (child1 && child1.childProductSubCategories) {
              this.PRForm.controls.subcatgory3.setValue(child1.childProductSubCategories.map(x => x.productSubCategoryName));
              this.getDropdownDatas();
            }
            else {
              this.PRForm.controls.subcatgory3.setValue(null);
            }
          }
          else {
            this.isSub3Disable = true;
            this.PRForm.controls.subcatgory3.setValue(null);
          }
        }
      }
      else {
      }
    }
  }
  heirarchiesFraming() {
    const form = this.PRForm.value;
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
          "productSubCategoryNames": this.PRForm.controls.productCategoryNames.value,
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
  getSupplier(event) {
    if (event) {
      this.supplierIDName = event.originalObject;
    }
  }
  frameSupplierJson(event) {
    if (event) {
      if (this.suppliers) {
        const suppy = this.suppliers.find(x => x.supplierIDName == event);
        return {
          supplierID: suppy.supplierID, supplierName: suppy.supplierName,
          supplierMasterID: suppy._id, supplierIDName: event
        }
      }
      else {
        return null
      }
    }
  }
  getDetails(fromClear?) {

    if (this.PRForm.value.supplierIDName || fromClear) {
      const form = JSON.parse(JSON.stringify(this.PRForm.value));
      this.wmsService.getValues = form
      console.log(this.wmsService.getValues);
      form["productCategoryHierarchies"] = this.heirarchiesFraming();
      form['includeInventory'] = this.includeCheck;
      form['dateTo'] = form['dateTo'] ? new Date(form['dateTo']) : null;
      form['dateFrom'] = form['dateFrom'] ? new Date(form['dateFrom']) : null;
      delete form.subcatgory1;
      delete form.subcatgory2;
      delete form.subcatgory3;
      this.wmsService.generatePurchaseRequest(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].purchaseRequisitionOverallResponse) {
          this.overAll = res['data'].purchaseRequisitionOverallResponse;

          if (this.overAll.purchaseRequisitions && this.overAll.purchaseRequisitions.length) {
            this.table1Array = this.frameTableData();
            this.dtTrigger.next();
          }
          else {
            this.table1Array = [];
            this.dtTrigger.next();
          }
          if (this.overAll.purchaseRequisitionHelpers && this.overAll.purchaseRequisitionHelpers.length) {
            this.overAll.purchaseRequisitionHelpers.forEach(el => {
              el.select = false;
              if (el.expectedDeliveryDate) {
                el.expectedDeliveryDate = this.datepipe.transform(new Date(el.expectedDeliveryDate), 'yyyy-MM-dd');
              }
            });
            this.secondTableArr = JSON.parse(JSON.stringify(this.overAll.purchaseRequisitionHelpers));
            this.wmsService.passingTableData = this.secondTableArr;
            this.calculatingTheTotal(this.secondTableArr);

            this.dtTrigger1.next();
          }
          else {
            this.dtTrigger1.next();
          }
        }
        else {
          this.overAll = null;
          this.dtTrigger.next();
          this.dtTrigger1.next();
        }
      })
    }
    else {
      this.toastr.error('Supplier Manditory');
    }
  }

  unitChange(event, data, i) {
    this.calculateReceivedQty(event, data, i);
  }
  calculateReceivedQty(event, line, i) {
    if (line && line.inventoryUnit && line.orderUnit) {
      const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === line.shipmentUnit &&
        uom.unitConversionTo === line.orderUnit && uom.productMasterInfo.productIDName === line.productMasterInfo.productIDName);
      if (filteredUOMConversion) {
        line.actualQuantityToOrder = DecimalUtils.multiply(this.secondTableArr[i].customerQuantityToOrder , filteredUOMConversion.conversionFactor);
        this.setSelect(true, line, i);
      }
      else {
        this.toastr.error('No Matching Unit Factor');
        this.setSelect(false, line, i);
      }
    }
  }
  setSelect(event, data, i) {
    data['select'] = event;
    this.selectAllCheckboxValue = this.overAll.purchaseRequisitionHelpers.every(function (item: any) {
      return item.select == true;
    })
  }
  selectAllData(event) {
    if (event.target.checked) {
      this.overAll.purchaseRequisitionHelpers.forEach(element => {
        element.select = true;
      });
    }
    else {
      this.overAll.purchaseRequisitionHelpers.forEach(element => {
        element.select = false;
      });
    }
  }
  clear() {
    this.createForm();
    this.getDataForFilters('fromClear');
    this.supplierIDName = null;
    this.expectedDeliveryDate = null;
    this.selectAllCheckboxValue = false;
    this.isSub1Disable = false;
    this.isSub2Disable = false;
    this.isSub3Disable = false;
    this.fetchAllProducts();
  }
  setDeliveryDate(event) {
    if (event && this.overAll.purchaseRequisitionHelpers.length > 0) {
      this.overAll.purchaseRequisitionHelpers.forEach(element => {
        element.expectedDeliveryDate = event.target.value;
      });
    }
  }
  frameTableData() {
    const arr = [];
    this.overAll.purchaseRequisitions.forEach(outer => {
      outer.purchaseRequisitionLines.forEach(child => {
        const obj = child;
        obj['orderType'] = outer.orderType;
        obj['customerMasterInfo'] = outer.customerMasterInfo;
        obj['wareHouseTransferDestinationInfo'] = outer.wareHouseTransferDestinationInfo;
        obj['fullOrderNumber'] = outer.fullOrderNumber;
        obj['orderNumber'] = outer.orderNumber;
        arr.push(obj);
      });
    });
    return arr
  }
  createPO() {
    const linesArray = this.overAll.purchaseRequisitionHelpers.filter(x => x.select);
    if (this.supplierIDName && linesArray.length > 0) {
      linesArray.forEach(el => {
        if (el.expectedDeliveryDate) {
          el.expectedDeliveryDate = new Date(el.expectedDeliveryDate);
        }
      });
      const obj = {
        'supplierMasterInfo': this.frameSupplierJson(this.supplierIDName),
        'purchaseRequestLines': linesArray,
        'organizationInfo': this.configService.getOrganization(),
        'wareHouseInfo': this.configService.getWarehouse()
      }
      this.wmsService.generatePOFromPR(obj).subscribe(res => {
        if (res['status'] == 0 && res['data'].purchaseOrder) {
          this.toastr.success(res['statusMsg']);
          this.clear();
        }
      })
    }
    else {
      this.toastr.error("Enter Manditory");
    }
  }

  generatePDF() {
      this.emitTripSheet.emit();
      setTimeout(() => {
        window.print();
      }, 300);
    }
  
    totalquantityToOrder:any
    totalcustomerQuantityToOrder:any
    totalactualQuantityToOrder:any
  calculatingTheTotal(data)
  {
    if (data) {
      let quantityToOrder = data.map(k => k.quantityToOrder)
      this.totalquantityToOrder = quantityToOrder.reduce((k, m) => k + Number(m), 0)
      let customerQuantityToOrder = data.map(k => k.customerQuantityToOrder)
      this.totalcustomerQuantityToOrder = customerQuantityToOrder.reduce((k, m) => k + Number(m), 0)
      let actualQuantityToOrder = data.map(k => k.actualQuantityToOrder)
      this.totalactualQuantityToOrder = actualQuantityToOrder.reduce((k, m) => k + Number(m), 0)
      this.wmsService.passingtotalquantityToOrder = this.totalquantityToOrder
      this.wmsService.passingtotalcustomerQuantityToOrder = this.totalcustomerQuantityToOrder
      this.wmsService.passingtotalactualQuantityToOrder = this.totalactualQuantityToOrder
      
      console.log(this.wmsService.passingtotalquantityToOrder)
      console.log(this.wmsService.passingtotalcustomerQuantityToOrder)
      console.log(this.wmsService.passingtotalactualQuantityToOrder)   
    }
  }
}

