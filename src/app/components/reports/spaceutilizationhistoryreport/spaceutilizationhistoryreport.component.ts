import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Constants } from 'src/app/constants/constants';
import { CompleterData, CompleterService } from 'ng2-completer';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { ToastrService } from 'ngx-toastr';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportsCommonService } from 'src/app/services/reports-common.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-spaceutilizationhistoryreport',
  templateUrl: './spaceutilizationhistoryreport.component.html',
  styleUrls: ['./spaceutilizationhistoryreport.component.scss']
})
export class SpaceutilizationhistoryreportComponent implements OnInit {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;


  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  spaceUtilizationHistoryReportForm: FormGroup;
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData;
  products: CompleterData;
  inventoryData: any;
  productData: any;
  suppliersIDs: CompleterData;
  productCategoriesIDs: CompleterData;
  batchNumberIDs: CompleterData;
  serialNumberIDs: CompleterData;
  zones: any;
  locationsIDs: CompleterData
  zoneNameValues: CompleterData;
  grnhistoryResponseList: any;
  rackNameValues: CompleterData;
  formObj = this.configService.getGlobalpayload();
  wareHouseDefaultValueFromHeader: any;
  zonesInfo: any = []
  totalSpace: any;
  uom: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private excelService: ExcelService,
    private reportsService: ReportsService, private completerService: CompleterService, private toastr: ToastrService,
    private fb: FormBuilder, private metaDataService: MetaDataService,
    private commonService: CommonService, private reportsCommonService: ReportsCommonService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
    this.configService.shareFormData.subscribe(
      (response) => {
        console.log(response);
      })
  }


  ngOnInit() {
    let data = sessionStorage.getItem("myDropDoownData");
    console.log(data);
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
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
    this.createGrnHistoryReportForm();
    this.fetchAllProducts();
    this.fetchAllSupplierDetails();
    this.fetchAllProductCategories();
    this.fetchAllInventories();
    this.fetchAllLocations();
    this.configService['newDropDownValue'] = this.configService.wareHouseDropdown[0];
    this.wareHouseDefaultValueFromHeader = this.configService['newDropDownValue'];
    console.log(this.wareHouseDefaultValueFromHeader);
    console.log(this.configService['newDropDownValue']);
    let warehouseName = [this.configService.getWarehouse().wareHouseName]
    this.spaceUtilizationHistoryReportForm.controls.wareHouseNames.setValue(warehouseName);
    console.log(this.spaceUtilizationHistoryReportForm.value.wareHouseNames)
    //this.spaceUtilizationHistoryReportForm.controls.wareHouseNames.setValue(data);
    this.fetchAllColumns();
    this.fetchAllZones();
    this.fetchAllRacks();

  }

  /* fetchMetaData() {
    this.reportsCommonService.fetchAllZones();
    this.reportsCommonService.zoneNameValues.subscribe(res => {
      this.zoneNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllRacks();
    this.reportsCommonService.rackNameValues.subscribe(res => {
      this.rackNameValues = this.completerService.local(res);
    });
  } */
  zoneDropDownList = [];
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones) {
          this.zoneDropDownList = response.data.zones.map(x => x.zoneName)
          console.log(response.data.zones);
        }
      },
      (error) => {
      });
  }
  rackDropDownList = [];
  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.rackDropDownList = response.data.racks.map(rack => rack.rackName);
          console.log(response.data.racks);
        }
      },
      (error) => {
        // this.rackNames.next([]);
      });
  }
  createGrnHistoryReportForm() {
    this.spaceUtilizationHistoryReportForm = this.fb.group({
      wareHouseNames: [null],
      zoneNames: [null],
      rackNames: [null],
      supplierIDNames: [null],
      locationNames: [null],
      transactionDateTimeFrom: null,
      transactionDateTimeTo: null,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "wareHouseID": this.configService.getWarehouse().wareHouseID,
      "wareHouseName": this.configService.getWarehouse().wareHouseName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "organizationID": this.configService.getOrganization().organizationID,
      "organizationName": this.configService.getOrganization().organizationName,


    })
  }
  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locationsIDs = response.data.locations.map(locationname => locationname.locationName);
          this.dropdownList = response.data.locations.map(locationname => locationname.locationName);;
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllProductCategories() {
    this.metaDataService.fetchAllProductCategories({
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
    }).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length) {
          this.productCategoriesIDs = response.data.productCategories.map(category => category.productCategoryName);
        }
      },
      error => {
      }
    );
  }
  fetchAllProducts() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters.map(productID => productID.productIDName);
        } else {
        }
      },
      (error) => {
      });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  fetchAllInventories() {
    this.wmsService.findAllInventories('', this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventories) {
          const bIn = response.data.inventories.filter(x => x.batchNumber != null);
          const sIn = response.data.inventories.filter(x => x.serialNumber != null);
          const dupBin = bIn ? bIn.map(x => x.batchNumber) : null;
          this.batchNumberIDs = this.removeDuplicates(dupBin);
          const dupsIn = sIn ? sIn.map(x => x.serialNumber) : null;
          this.serialNumberIDs = this.removeDuplicates(dupsIn);
        } else {
          this.batchNumberIDs = null;
          this.serialNumberIDs = null;
        }
      },
      (error) => {
        this.batchNumberIDs = null;
        this.serialNumberIDs = null;
      });
  }
  spaceUtilizationResponceList: any;
  generate() {
    const spaceUtilizationFormReq = this.spaceUtilizationHistoryReportForm.value;
    this.spaceUtilizationHistoryReportForm.value.transactionDateTimeFrom = this.spaceUtilizationHistoryReportForm.value.transactionDateTimeFrom ? new Date(this.spaceUtilizationHistoryReportForm.value.transactionDateTimeFrom) : null;
    this.spaceUtilizationHistoryReportForm.value.transactionDateTimeTo = this.spaceUtilizationHistoryReportForm.value.transactionDateTimeTo ? new Date(this.spaceUtilizationHistoryReportForm.value.transactionDateTimeTo) : null;
    //this.spaceUtilizationHistoryReportForm.controls.wareHouseNames.setValue(this.configService['newDropDownValue']);
    /*  this.spaceUtilizationHistoryReportForm.value.wareHouseNames  = [this.spaceUtilizationHistoryReportForm.value.wareHouseNames];
     this.spaceUtilizationHistoryReportForm.value.zoneNames  = [this.spaceUtilizationHistoryReportForm.value.zoneNames];
     this.spaceUtilizationHistoryReportForm.value.rackNames  = [this.spaceUtilizationHistoryReportForm.value.rackNames];
     this.spaceUtilizationHistoryReportForm.value.supplierIDNames  = [this.spaceUtilizationHistoryReportForm.value.supplierIDNames];
     this.spaceUtilizationHistoryReportForm.value.locationNames  = [this.spaceUtilizationHistoryReportForm.value.locationNames]; */
    // spaceUtilizationFormReq['organizationInfo'] = this.configService.getOrganization();
    // spaceUtilizationFormReq['wareHouseInfo'] = this.configService.getWarehouse();
    console.log(this.spaceUtilizationHistoryReportForm.value);
    this.wmsService.spaceutilizationHistoryFormDataPassing = this.spaceUtilizationHistoryReportForm.value
    this.reportsService.fetchAllSpaceutilizationHistoryReport(JSON.stringify(this.spaceUtilizationHistoryReportForm.value)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.spaceUtilization) {

          this.spaceUtilizationResponceList = response.data.spaceUtilization;
          // this.wmsService.spaceutilizationHistoryDisplayTableList = this.spaceUtilizationResponceList
          this.totalSpace = this.spaceUtilizationResponceList[0].locationDimensionsResponse.totalSpace
          this.uom = this.spaceUtilizationResponceList[0].locationDimensionsResponse.usedSpaceUom
          this.spaceUtilizationResponceList.forEach(k => {
            this.zonesInfo.push(k.zoneSpaceUtilizations)
            console.log(this.zonesInfo)
            this.wmsService.spaceutilizationHistoryDisplayTableList = this.zonesInfo[0];
          })
          console.log(response.data.spaceUtilization);
          this.rerender();
        } else {
          this.toastr.error('Enter valid data');
        }
      },
      (error) => {
      });
  }
  supplierDropDownList: any;
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliersIDs = response.data.supplierMasters.map(supplier => supplier.supplierIDName);
          this.supplierDropDownList = response.data.supplierMasters.map(supplier => supplier.supplierIDName);

        }
      },
      (error) => {
      });
  }
  clear() {
    this.spaceUtilizationHistoryReportForm.reset();
  }
  exportAsXLSX() {
    if (this.productData.length) {
      this.excelService.exportAsExcelFile(this.productData, 'Space utilization History Report', null);
    } else {
      this.toastr.error('No data available');
    }
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
  isFormVisible = false
  onDropDownChange(data) {
    if (data === "Custom Dates") {
      this.isFormVisible = true
    }
    else {
      this.isFormVisible = false
    }
  }
  columns: any;
  fetchAllColumns() {
    this.wmsService.fetchAllColumns(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.columns.length) {
          this.columns = response.data.columns;
          this.dropdownList = response.data.columns;
        }
      },
      error => {
        this.columns = [];
      }
    )
  }
  generatePDF() {
    if (this.zonesInfo[0]) {
      this.emitTripSheet.emit();
      setTimeout(() => {
        window.print();
      }, 300);
    }
    else {
      this.toastr.error("No Data to Print.")
    }
  }
}
