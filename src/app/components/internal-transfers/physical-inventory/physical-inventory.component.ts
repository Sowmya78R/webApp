import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ApexService } from '../../../shared/services/apex.service';
import { InternaltransfersService } from '../../../services/integration-services/internaltransfers.service';
import { ToastrService } from 'ngx-toastr';
import { WMSService } from '../../../services/integration-services/wms.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AppService } from '../../../shared/services/app.service';
import { DashboardService } from '../../../services/integration-services/dashboard.service';
import { Storage } from '../../../shared/utils/storage';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
@Component({
  selector: 'app-physical-inventory',
  templateUrl: './physical-inventory.component.html'
})
export class PhysicalInventoryComponent implements OnInit, OnDestroy {

  focusedElement: any;
  cycleCountingForm: FormGroup;
  supplierID: any = '';
  inventories: any = [];
  filteredInventories: any = [];
  dataService: CompleterData;
  selectedCriteria: any;
  editCCReq: any = {};
  isReadMode: any = false;
  cycleCountingCriterias: any = [
    { value: 'productCategory', viewValue: 'Product Category' },
    { value: 'wareHouse', viewValue: 'Warehouse' },
    { value: 'zone', viewValue: 'Zone' },
    { value: 'location', viewValue: 'Location' }
  ];
  inventoryKeys: any = ['#', 'Product ID', 'Product Name', 'Product ID/Name', 'Product Category', 'Product Type', 'Product Class',
    'Inventory Unit', 'Warehouse Name', 'Zone Name', 'Rack Name', 'Level Name', 'Location Name', 'Quantity Inventory Unit',
    'Available Quantity', 'Reserved Quantity', 'Batch Number', 'Expiry Date', 'Shelf Life', 'Action'];

  cycleCountingKeys: any = ['S.No', 'Cycle Counting Number', 'Cycle Counting Criteria', 'Created Date', 'Product ID/Name',
    'Batch Number', 'Actual Quantity', 'Available Quantity', 'Cycle Counting Executive', 'Warehouse Name', 'Zone Name', 'Rack Name',
    'Level Name', 'Location Name', 'Status'];
  dtOptions: DataTables.Settings = {};
  dtTrigger: any = new Subject();
  dtTrigger2: any = new Subject();

  @ViewChild('callActualQuantity') callActualQuantity: ElementRef;
  locations: any[] = [];
  report: any = {};
  productCategories: any[] = [];
  infoValue: any;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  ccReqLine: any = {};
  cycleCountingData: any[] = [];
  // Cycle Counting Graph
  inventoryAccuracySingle: any[];
  inventoryAccuracyView: any[] = [350, 250];
  inventoryAccuracylegend: any = false;
  inventoryAccuracylegendPosition: any = 'below';
  inventoryAccuracycolorScheme = {
    domain: ['#5AA454']
  };
  maxValue: any = 100;
  minValue: any = 0;
  toDate: any = new Date();
  fromDate: any = new Date().setDate(this.toDate.getDate() - 30);
  serialNumberCheck = 'No';
  formObj = this.configService.getGlobalpayload();
  products: any = [];
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inventory', 'Physical Inventory', Storage.getSessionUser());
  constructor(private apexService: ApexService, private configService: ConfigurationService,
    private toastr: ToastrService,
    private wmsService: WMSService,
    private customValidators: CustomValidators,
    private util: Util, private metaDataService: MetaDataService,
    private dashboardService: DashboardService,
    private appService: AppService,
    private commonService: CommonService,
    public ngxSmartModalService: NgxSmartModalService,
    private completerService: CompleterService,
    private internaltransfersService: InternaltransfersService) {
    this.apexService.getPanelIconsToggle();
    this.createCycleCountingForm();
  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5
    };
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    this.fetchAllCycleCounting();
    this.fetchAllProductCategories();
    this.fetchAllProducts();
    this.fetchAllInventories();
    this.fetchAllLocations();
    this.fetchInventoryAccuracyGraph();
  }

  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters.length > 0) {
          this.products = response.data.productMasters;
        }
      })
  }
  edit(inventory: any) {
    const specificFields = ['productMasterInfo', 'wareHouseInfo', 'zoneInfo', 'rackInfo',
      'levelInfo', 'locationInfo', 'inventoryUnit', 'batchNumber', 'quantityInventoryUnit', 'availableQuantity', 'inventoryInfo'];
    inventory['inventoryInfo'] = { "_id": inventory['_id'] }
    this.editCCReq = this.commonService.getFilteredFieldsFromObj(inventory, specificFields);
    this.cycleCountingForm.patchValue(this.editCCReq);
    const filteredProd = this.products.find(prod => prod.productIDName === this.editCCReq.productMasterInfo.productIDName);
    this.serialNumberCheck = filteredProd ? (filteredProd.serialNumberCheck ? filteredProd.serialNumberCheck : 'No') : 'No';

    const userDetails = Storage.getSessionItem('userDetails');
    this.cycleCountingForm.controls.cycleCountingExecutive.setValue(`${userDetails.firstName} ${userDetails.lastName}`);
    this.isReadMode = true;
    this.callActualQuantity.nativeElement.focus();
  }
  save() {
    this.ccReqLine = this.editCCReq;
    this.ccReqLine.actualQuantity = this.cycleCountingForm.value.actualQuantity;
    this.ccReqLine.availableQuantity = this.cycleCountingForm.value.availableQuantity;
    this.ccReqLine.cycleCountingExecutive = this.cycleCountingForm.value.cycleCountingExecutive;
    if (this.serialNumberCheck == 'Yes' && this.ccReqLine.actualQuantity > 1) {
      this.toastr.error('Actual Quantity should be less than or equal to 1')
    }
    else {
      if (this.ccReqLine.availableQuantity === this.ccReqLine.actualQuantity) {
        this.dtTrigger2.unsubscribe();
        this.fetchAllCycleCounting();
        this.toastr.error('Actual and available quantity should not be same');
      } else if (!this.selectedCriteria) {
        this.toastr.error('Please Select Cycle counting criteria');
      } else {
        this.ngxSmartModalService.getModal('cycleCountingPopup').open();
        const viewData = `Do you want to perform inventory adjustments ?`;
        this.ngxSmartModalService.setModalData(viewData, 'cycleCountingPopup');
      }
    }
  }
  getValue(value) {
    var pattern = /[ `!@#$%^&*()_+\=\[\]{};':"\\|<>\/?~-]/;
    if (value && pattern.test(value)) {
      this.cycleCountingForm.controls.actualQuantity.setValue(null);
    }
  }
  saveInInventoryAdjustment() {
    const ccReq = {
      cycleCountingCriteria: this.selectedCriteria ? `${this.selectedCriteria}Info` : '',
      cycleCountingLines: []
    };
    ccReq.cycleCountingLines.push(this.ccReqLine);
    this.internaltransfersService.saveOrUpdateCycleCounting(JSON.stringify(ccReq)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.cycleCounting) {
          this.cycleCountingForm.reset();
          this.isReadMode = false;
          if (this.ccReqLine) {
            const inventoryAdjustmentReq = {
              productMasterInfo: this.ccReqLine.productMasterInfo,
              adjustedQuantity: this.ccReqLine.actualQuantity,
              availableQuantity: this.ccReqLine.availableQuantity,
              quantityInventoryUnit: this.ccReqLine.quantityInventoryUnit,
              locationInfo: this.ccReqLine.locationInfo,
              inventoryInfo: this.ccReqLine.inventoryInfo,
              wareHouseInfo: this.configService.getWarehouse(),
              organizationInfo: this.configService.getOrganization(),
              productCategoryInfo: {
                productCategoryName: ''
              },
              productClass: '',
              productType: '',
              adjustmentType: 'CYCLE COUNTING',
              status: 'Open'
            };
            this.inventories.forEach(inventory => {
              if (inventory.productMasterInfo.productID === inventoryAdjustmentReq.productMasterInfo.productID) {
                inventoryAdjustmentReq.productClass = inventory.productClass;
                inventoryAdjustmentReq.productType = inventory.productType;
                inventoryAdjustmentReq.productCategoryInfo = inventory.productCategoryInfo;
              }
            });
            this.internaltransfersService.saveOrUpdateInventoryAdjustment(JSON.stringify(inventoryAdjustmentReq)).subscribe(
              (resp) => {
                if (resp && resp.status === 0 && resp.data.inventoryAdjustment) {
                  this.appService.navigate('/v1/inventory/inventoryAdjustments', null);
                } else if (response && response.status === 2) {
                  this.toastr.error(response.statusMsg);
                } else {
                  this.toastr.error('Failed in saving details');
                }
              },
              (error) => {
                this.toastr.error('Failed in saving details');
              });
          }
        } else if (response && response.status === 2) {
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
  clear() {
    this.cycleCountingForm.reset();
  }
  onInfoChange(ccHeaderForm: any) {
    if (ccHeaderForm && ccHeaderForm.infoValue && ccHeaderForm.infoValue.length > 1 && this.inventories.length > 0) {
      const filteredInventory = [];
      this.inventories.forEach(inventory => {
        if (inventory[`${this.selectedCriteria}Info`][`${this.selectedCriteria}Name`] === ccHeaderForm.infoValue) {
          filteredInventory.push(inventory);
        }
      });
      this.rerender();
      this.filteredInventories = [];
      this.filteredInventories = filteredInventory;
    } else {
      this.toastr.error('No data in inventory');
    }
  }
  getCriteria(criteria: any) {
    this.selectedCriteria = criteria;
    const filteredData = [];
    if (this.selectedCriteria === 'productCategory' && this.productCategories.length > 0) {
      this.productCategories.forEach(category => {
        filteredData.push(category.productCategoryName);
      });
    } else if (this.selectedCriteria === 'location' && this.locations.length > 0) {
      this.locations.forEach(location => {
        filteredData.push(location.locationName);
      });
    } else {
      this.locations.forEach(location => {
        if (filteredData.indexOf(location[`${criteria}Info`][`${criteria}Name`]) === -1) {
          filteredData.push(location[`${criteria}Info`][`${criteria}Name`]);
        }
      });
    }
    this.dataService = this.completerService.local(filteredData);
  }
  fetchAllInventories() {
    this.wmsService.findAllInventories(this.supplierID, this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventories) {
          this.dtTrigger.next();
          this.inventories = response.data.inventories;
          this.filteredInventories = response.data.inventories;
        } else {
          this.inventories = [];
        }
      },
      (error) => {
        this.inventories = [];
      });
  }
  fetchAllCycleCounting() {
    this.wmsService.fetchAllCycleCounting().subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.cycleCountingList) {
          this.cycleCountingData = response.data.cycleCountingList;
          this.dtTrigger2.next();
        } else {
          this.cycleCountingData = [];
        }
      },
      (error) => {
        this.cycleCountingData = [];
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
  fetchInventoryAccuracyGraph() {
    const data = [];
    const datesObj = { fromDate: this.fromDate, toDate: this.toDate };
    this.dashboardService.fetchInventoryAccuracy(JSON.stringify(datesObj)).subscribe(
      (response) => {
        if (response && response.status === 0) {
          data.push({ name: '', value: response.data.inventoryaccuracy });
          this.inventoryAccuracySingle = data;
        }
      },
      (error) => {
      });
  }
  getDate(dateRef: any, dateValue: any) {
    if (dateRef === 'fromDate') {
      this.fromDate = new Date(dateValue);
    } else if (dateRef === 'toDate') {
      this.toDate = new Date(dateValue);
    }
  }
  filterDataFromDates() {
    if (this.fromDate <= this.toDate) {
      const dateObj = { fromDate: this.fromDate, toDate: this.toDate };
      this.fetchInventoryAccuracyGraph();
    } else {
      this.toastr.error('Select valid date difference');
    }
  }
  reset() {
    this.toDate = new Date();
    this.fromDate = new Date().setDate(this.toDate.getDate() - 30);
    this.fetchInventoryAccuracyGraph();
  }
  createCycleCountingForm() {
    this.cycleCountingForm = new FormBuilder().group({
      productMasterInfo: new FormBuilder().group({
        productIDName: ['', this.customValidators.required]
      }),
      inventoryUnit: ['', this.customValidators.required],
      batchNumber: [''],
      actualQuantity: [null, this.customValidators.required],
      quantityInventoryUnit: [null],
      availableQuantity: [null],
      wareHouseInfo: new FormBuilder().group({
        wareHouseName: ['', this.customValidators.required],
      }),
      inventoryInfo: new FormBuilder().group({
        _id: [null],
      }),
      zoneInfo: new FormBuilder().group({
        zoneName: ['', this.customValidators.required],
      }),
      rackInfo: new FormBuilder().group({
        rackName: ['', this.customValidators.required],
      }),
      levelInfo: new FormBuilder().group({
        levelName: ['', this.customValidators.required],
      }),
      locationInfo: new FormBuilder().group({
        locationName: ['', this.customValidators.required],
      }),
      cycleCountingExecutive: ['']
    });
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
      return this.cycleCountingForm.controls[fieldName].valid && this.cycleCountingForm.controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
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
    this.dtTrigger.next();
    this.dtTrigger2.next();
  }

}
