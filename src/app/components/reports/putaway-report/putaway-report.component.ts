import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { ReportsCommonService } from '../../../services/reports-common.service';
import { ReportsService } from '../../../services/integration-services/reports.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { DatePipe } from '@angular/common';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { TranslateService } from '@ngx-translate/core';
import { PaginationConstants } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-putaway-report',
  templateUrl: './putaway-report.component.html'
})
export class PutawayReportComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  putawayForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  warehouseNameValues: CompleterData;
  zoneNameValues: CompleterData;
  racks: any = [];
  levels: any = [];
  locations: any = [];
  rackNameValues: CompleterData;
  levelNameValues: CompleterData;
  locationNameValues: CompleterData;
  customerIDNameValues: CompleterData;
  supplierIDNames: CompleterData;
  putawayData: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inbound', 'Putaway', Storage.getSessionUser());
    putAwayReport: any = ['S.No', 'Putaway No', 'WMPO Number', 'Supplier/Customer/Warehouse IDName', 'Product ID'
    ,'Product Name', 'Product Description', 'Brand Name', 'UOM', 'Putaway Quantity', 'Total Actual Putaway Quantity'
    , 'Balanced Putaway Quantity', 'Expiry Date', 'Manufacture Date', 'Batch Number', 'Zone Name','Rack Name','Level Name',
    'Column Name','Location Name',
  'Invoice Number','Invoice Date','BOE No','BOE Date','Bond Number','Bond Date',
  'Created On','Start Time','End Time','Planned Completion Date','Status'];
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private toastr: ToastrService, private wmsService: WMSService,
    private reportsService: ReportsService, private datepipe: DatePipe,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService, private configService: ConfigurationService, private commonMasterDataService: CommonMasterDataService,
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
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createPutawayForm();
      this.fetchMetaData();
      this.fetchAllWarehouseTeams();

    }
  }

  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
 
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['putaAwayReportSortKeysArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.generate(this.page, this.itemsPerPage);
  }
  warehouseTeamsList: any;
  wareHouseListValuesIDs: CompleterData;
  fetchAllWarehouseTeams() {
    this.commonMasterDataService.fetchAllWarehouseTeams(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.warehouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseListValuesIDs = response.data.wareHouseTeams.map(executiveidname => executiveidname.executiveIDName)
        }
      })
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  }
  dataPerPage: number;
  exportData: any = [];
  exportDataForPrintPDf: any = [];
  getAllPutAwayForDownload(index?) {
    if (!index) {
      this.exportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      this.exportAsXLSX();
    }
    else {
      if (((i == 1) || (i != 1 && this.exportData.length > 0)) && i <= this.loopToStop) {
        const form = {
          "page": i,
          "pageSize": this.dataPerPage,
          "searchKeyword": this.searchKey,
          "searchOnKeys": PaginationConstants.putawayReportSearchArray,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }
        this.reportsService.fetchPutawayReport(JSON.stringify(form)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.putawayReportPaginationResponse.putaways) {
              this.exportData = [...this.exportData, ...response.data.putawayReportPaginationResponse.putaways];
              this.getAllPutAwayForDownload(i);
            } 
          })
      }
    }
  }
  loopToStop: any = null;
  generate(page?,pageSize?) {
    this.putawayForm.value.zoneName = this.putawayForm.value.zoneName ? this.putawayForm.value.zoneName : null;
    this.putawayForm.value.rackName = this.putawayForm.value.rackName ? this.putawayForm.value.rackName : null;
    this.putawayForm.value.levelName = this.putawayForm.value.levelName ? this.putawayForm.value.levelName : null;
    this.putawayForm.value.locationName = this.putawayForm.value.locationName ? this.putawayForm.value.locationName : null;
    const form = this.putawayForm.value;
    this.wmsService.putawayFormDataPassing = form;
    if (this.putawayForm.value.status === 'All') {
      form['status'] = null
    }
    else {
      form['status'] = this.putawayForm.value.status
    }
    form['page'] = page ? page : 1
    form['pageSize'] = this.itemsPerPage
    form['searchKeyword'] = this.searchKey
    form['searchOnKeys'] = PaginationConstants.putawayReportSearchArray
    form['sortDirection'] = this.sortDirection
    form['sortFields'] = this.sortFields 
   
    this.reportsService.fetchPutawayReport(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putawayReportPaginationResponse.putaways) {
          this.putawayData = response.data.putawayReportPaginationResponse.putaways;
         
         // this.wmsService.putAwaygReportsDisplayTableList = this.putawayData;
          this.putawayData.forEach(element => {
            element.isChecked = false;
          });
          this.totalItems = response.data.putawayReportPaginationResponse.totalElements;

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
        } else {
          this.locations = [];
        }
       
      },
      (error) => {
      });
  }
  clear() {
    this.putawayForm.reset();
    this.createPutawayForm()
  }
  exportAsXLSX(key?) {
      if (key) {
        const changedTaskList = this.exportTypeMethod(null)
        this.excelService.exportAsExcelFile(changedTaskList, 'Putaway-Report',null);
      } else {
        const changedTaskList = this.exportTypeMethod(this.exportData)
        this.excelService.exportAsExcelFile(changedTaskList, 'Putaway-Report', null);
      }  
  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['Putaway Number'] = k.putawayNumber
        obj['Wmpo Number'] = k.wmpoNumber
        obj['Supplier ID Name'] = k.supplierMasterInfo.supplierIDName
        obj['Product ID'] = k.productID
        obj['Product Name'] = k.productName
        obj['Product Description'] = k.productDescription
        obj['UOM'] = k.inventoryUnit
        obj['Quantity'] = k.quantity
        obj['Total Actual Putaway Quantity'] = k.totalActualPutawayQuantity
        obj['Balanced Putaway Quantity'] = k.balancePutawayQuantity
        obj['expiryDate'] = k.expiryDate ? this.datepipe.transform(new Date(k.expiryDate), 'dd/MM/yyyy') : null
        obj['manufactureDate'] = k.mfgDate ? this.datepipe.transform(new Date(k.mfgDate), 'dd/MM/yyyy') : null
        obj['batchNumber'] = k.batchNumber
        obj['Zone Name'] = k.zoneInfo.zoneName
        obj['Rack Name'] = k.rackInfo.rackName
        obj['Level Name'] = k.levelInfo.levelName
        obj['column Name'] = k.columnInfo.columnName
        obj['Location Name'] = k.locationName
        obj['Invoice Number'] = k.invoiceNumber
        obj['Invoice Date'] = k.invoiceDate ? this.datepipe.transform(new Date(k.invoiceDate), 'dd/MM/yyyy') : null
        obj['BOE No'] = k.billOfEntryNumber
        obj['BOE Date'] = k.billOfEntryDate ? this.datepipe.transform(new Date(k.billOfEntryDate), 'dd/MM/yyyy') : null
        obj['Bond Number'] = k.bondNumber
        obj['Bond Date'] = k.bondDate ? this.datepipe.transform(new Date(k.bondDate), 'dd/MM/yyyy') : null
        obj['Created Date'] = k.createdDate ? this.datepipe.transform(new Date(k.createdDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Start Time'] = k.startTime ? this.datepipe.transform(new Date(k.startTime), 'dd/MM/yyyy HH:mm:ss') : null
        obj['End Time'] = k.endTime ? this.datepipe.transform(new Date(k.endTime), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Planned Completion Date'] = k.plannedCompletionDate ? this.datepipe.transform(new Date(k.assignedDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Status'] = k.status
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['Putaway Number'] = null
      obj['Wmpo Number'] = null
      obj['Supplier ID Name'] = null
      obj['Product ID'] = null
      obj['Product Name'] = null
      obj['Product Description'] = null
      obj['UOM'] = null
      obj['Quantity'] = null
      obj['Total Actual Putaway Quantity'] = null
      obj['Balanced Putaway Quantity'] = null
      obj['expiryDate'] = null
      obj['manufactureDate'] = null
      obj['batchNumber'] = null
      obj['Zone Name'] = null
      obj['Rack Name'] = null
      obj['Level Name'] = null
      obj['column Name'] = null
      obj['Location Name'] = null
      obj['Invoice Number'] = null
      obj['Invoice Date'] = null
      obj['BOE No'] = null
      obj['BOE Date'] = null
      obj['Bond Number'] = null
      obj['Bond Date'] = null
      obj['Created Date'] = null
      obj['Start Time'] = null
      obj['End Time'] = null
      // obj['Assigned Date'] = null
      // obj['Completed By'] = null
      // obj['Putaway Executive'] = null
      obj['Planned Completion Date'] = null
      obj['Status'] = null
      arr.push(obj)
    }
    return arr
  }
  getSelectedValue(event, key) {
    if (event) {

      switch (key) {
        case 'zone': {
          const filteredRacks = this.racks.filter(x => x.zoneInfo.zoneName === event.originalObject);
          this.rackNameValues = filteredRacks ? filteredRacks.map(x => x.rackName) : [];
          break;
        }
        case 'rack': {
          const filteredLevels = this.levels.filter(x => x.zoneInfo.zoneName === this.putawayForm.controls.zoneName.value && x.rackInfo.rackName === event.originalObject);
          this.levelNameValues = filteredLevels ? filteredLevels.map(x => x.levelName) : [];
          break;
        }
        case 'level': {
          const filteredLocations = this.locations.filter(x => x.zoneInfo.zoneName === this.putawayForm.controls.zoneName.value && x.rackInfo.rackName === this.putawayForm.controls.rackName.value && x.levelInfo.levelName === event.originalObject);
          this.locationNameValues = filteredLocations ? filteredLocations.map(x => x.locationName) : [];
          break;
        }
      }
    }
    else {
      const empty: any = [];
      switch (key) {
        case 'zone': {
          this.putawayForm.controls.rackName.setValue(null);
          this.putawayForm.controls.levelName.setValue(null);
          this.putawayForm.controls.locationName.setValue(null);
          this.rackNameValues = empty;
          this.levelNameValues = empty;
          this.locationNameValues = empty;
          break;
        }
        case 'rack': {
          this.putawayForm.controls.levelName.setValue(null);
          this.putawayForm.controls.locationName.setValue(null);
          this.levelNameValues = empty;
          this.locationNameValues = empty;
          break;
        }
        case 'level': {
          this.putawayForm.controls.locationName.setValue(null);
          this.locationNameValues = empty;
          break;
        }
      }
    }
  }
  fetchMetaData() {
    // this.reportsCommonService.fetchAllWarehouses();
    // this.reportsCommonService.warehouseNameValues.subscribe(res => {
    //   this.warehouseNameValues = this.completerService.local(res);
    // });
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.warehouseNameValues = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
    this.reportsCommonService.fetchAllCustomers();
    this.reportsCommonService.customerIDNameValues.subscribe(res => {
      this.customerIDNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllSuppliers();
    this.reportsCommonService.supplierIDNameValues.subscribe(res => {
      this.supplierIDNames = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllZones();
    this.reportsCommonService.zoneNameValues.subscribe(res => {
      this.zoneNameValues = this.completerService.local(res);
    });
    // this.reportsCommonService.fetchAllRacks();
    // this.reportsCommonService.rackNameValues.subscribe(res => {
    //   this.rackNameValues = this.completerService.local(res);
    // });
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.racks = response.data.racks;
        } else {
          this.racks = [];
        }
      },
      (error) => {
        this.racks = [];
      });
    this.wmsService.fetchAllLevels(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.levels) {
          this.levels = response.data.levels;
        }
      })
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
    // this.reportsCommonService.fetchAllLevels();
    // this.reportsCommonService.levelNameValues.subscribe(res => {
    //   this.levelNameValues = this.completerService.local(res);
    // });
    // this.reportsCommonService.fetchAllLocations();
    // this.reportsCommonService.locationNameValues.subscribe(res => {
    //   this.locationNameValues = this.completerService.local(res);
    // });
  }
  makeEmpty() {
    this.putawayForm.controls.wareHouseTransferSourceInfoWareHouseIDName.setValue(null);
    this.putawayForm.controls.supplierIDName.setValue(null);
    this.putawayForm.controls.customerIDName.setValue(null);
  }
  createPutawayForm() {
    this.putawayForm = new FormBuilder().group({
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      // wareHouseName: [null],
      zoneName: [null],
      rackName: [null],
      levelName: [null],
      locationName: [null],
      toDate: [null],
      fromDate: [null],
      executiveIDName: [null],
      completedBy: [null],
      status: ['All'],
      wareHouseTransferSourceInfoWareHouseIDName: null,
      orderType: 'Purchase Order',
      supplierIDName: null,
      customerIDName: null,
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
    // this.forPermissionsSubscription.unsubscribe();
  }

 /*  generatePDF() {
    if (this.putawayData.length > 0) {
      if (this.permissionsList.includes('Update')) {
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 300);
      }
      else {
        this.toastr.error("User doesn't have Permissions.")
      }
    }
    else {
      this.toastr.error("No Data to Print.")

    }
  } */
  /*   generatePDF(){
      if()
      if (this.permissionsList.includes('Update')) {
        this.emitTripSheet.emit();
        setTimeout(() => {
          window.print();
        }, 300);
    }
      else {
        this.toastr.error("User doesn't have Permissions.")
      }
    } */
   
    finalArray: any = [];
    totalItemsB: any;
    loopToStopB: any = null;
    dataPerPageB: number;
  

    generatePDF() {
      this.finalArray = []; // Reset finalArray to collect all data
      this.loopToStopB = null;
      this.totalItemsB = null;
      this.dataPerPageB = null;
      this.getAllPutAwayForPrintPDF();
  }
  getAllPutAwayForPrintPDF(index?) {
      if (!index) {
          this.exportDataForPrintPDf = [];
      }
      let i = index ? index + 1 : 1;
      if (i > this.loopToStop) {
          this.wmsService.putAwaygReportsDisplayTableList = this.exportDataForPrintPDf;
          setTimeout(() => {
              this.openPrintDialog();
          }, 500);
      } else {
          if (((i == 1) || (i != 1 && this.exportDataForPrintPDf.length > 0)) && i <= this.loopToStop) {
              const form = {
                  "page": i,
                  "pageSize": this.dataPerPage,
                  "searchKeyword": this.searchKey,
                  "searchOnKeys": PaginationConstants.putawayReportSearchArray,
                  "sortDirection": this.sortDirection,
                  "sortFields": this.sortFields,
                  "organizationIDName": this.formObj.organizationIDName,
                  "wareHouseIDName": this.formObj.wareHouseIDName
              };
              this.reportsService.fetchPutawayReport(JSON.stringify(form)).subscribe(
                  (response) => {
                      if (response && response.status === 0 && response.data.putawayReportPaginationResponse) {
                          this.exportDataForPrintPDf = [...this.exportDataForPrintPDf, ...response.data.putawayReportPaginationResponse.putaways];
                          this.getAllPutAwayForPrintPDF(i);
                      }
                  });
          }
      }
  }  
  openPrintDialog() {
      window.print();
  }
  
  
 
  
 
  
  
    
  
    
}
