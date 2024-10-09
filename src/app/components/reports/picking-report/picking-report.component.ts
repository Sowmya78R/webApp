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
  selector: 'app-picking-report',
  templateUrl: './picking-report.component.html'
})
export class PickingReportComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  pickingReportForm: FormGroup;
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
  pickingData: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Outbound', 'Picking', Storage.getSessionUser());
  PickingReport: any = ['S.No', 'Supplier/Customer/Warehouse IDName', 'Picking Number','WMSO Number', 'Serial Number','Product ID'
    , 'Product Name', 'Product Description', 'Brand Name', 'UOM', 'Expiry Date', 'Manufacture Date',
    'Batch Number', 'Zone Name', 'Rack Name', 'Level Name',
    'Column Name', 'Location Name', 'Bond Number', 'Bond Date', 'Picking Quantity',
    'Total Actual Picking Quantity'
    , 'Balanced Picking Quantity',
    'Created On', 'Start Time', 'End Time', 'Planned Completion Date', 'Status'];
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;

  constructor(private toastr: ToastrService, private datepipe: DatePipe,
    private reportsService: ReportsService, private wmsService: WMSService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService, private configService: ConfigurationService,
    private commonMasterDataService: CommonMasterDataService,
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
    this.getInventoryDetails();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createpickingReportForm();
      this.fetchMetaData();
      this.fetchAllWarehouseTeams();
    }
  }
  fetchAllD(page, event) {
    if (event) {
      this.generate(page, event.target.value);
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;


  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['pickingReportSortKeysArray'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.generate(this.page, this.itemsPerPage);
  }
  finalArray: any = [];
  totalItemsB: any;
  loopToStopB: any = null;
  dataPerPageB: number;
  dataPerPage: number;
  exportData: any = [];
  exportDataForPrintPDf: any = [];
  loopToStop: any = null;

  getAllPickingForDownload(index?) {
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
          "searchOnKeys": PaginationConstants.pickingReportSearchArray,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }
        this.reportsService.fetchPickingReport(JSON.stringify(form)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.pickingReportPaginationResponse) {
              this.exportData = [...this.exportData, ...response.data.pickingReportPaginationResponse.pickingReportResponseList];
              this.getAllPickingForDownload(i);
            }
          })
      }
    }
  }
  generate(page?, pageSize?) {
    this.pickingReportForm.value.wareHouseName = this.pickingReportForm.value.wareHouseName ? this.pickingReportForm.value.wareHouseName : null;
    this.pickingReportForm.value.zoneName = this.pickingReportForm.value.zoneName ? this.pickingReportForm.value.zoneName : null;
    this.pickingReportForm.value.rackName = this.pickingReportForm.value.rackName ? this.pickingReportForm.value.rackName : null;
    this.pickingReportForm.value.levelName = this.pickingReportForm.value.levelName ? this.pickingReportForm.value.levelName : null;
    this.pickingReportForm.value.locationName = this.pickingReportForm.value.locationName ? this.pickingReportForm.value.locationName : null;
    this.pickingReportForm.value.fromDate = this.pickingReportForm.value.fromDate ? new Date(this.pickingReportForm.value.fromDate) : null;
    this.pickingReportForm.value.toDate = this.pickingReportForm.value.toDate ? new Date(this.pickingReportForm.value.toDate) : null;
    this.pickingReportForm.value.status = this.pickingReportForm.value.status === 'All' ? null : this.pickingReportForm.value.status;
    const form = this.pickingReportForm.value;
    this.wmsService.pickingrFormDataPassing = form
    
    form['page'] = page ? page : 1
    form['pageSize'] = this.itemsPerPage
    form['searchKeyword'] = this.searchKey
    form['searchOnKeys'] = PaginationConstants.pickingReportSearchArray
    form['sortDirection'] = this.sortDirection
    form['sortFields'] = this.sortFields

    this.reportsService.fetchPickingReport(JSON.stringify(form)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickingReportPaginationResponse) {
          this.pickingData = response.data.pickingReportPaginationResponse.pickingReportResponseList;

          this.pickingData.forEach(element => {
            element.isChecked = false;
          });
          this.totalItems = response.data.pickingReportPaginationResponse.totalElements;
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
    this.createpickingReportForm();
  }
  exportAsXLSX(key?) {
    if (key) {
      const changedTaskList = this.exportTypeMethod(null)
      this.excelService.exportAsExcelFile(changedTaskList, 'Picking-Report', null);
    } else {
      const changedTaskList = this.exportTypeMethod(this.exportData)
      this.excelService.exportAsExcelFile(changedTaskList, 'Picking-Report', null);
    }
  }
  /*  exportAsXLSX() {
     if (this.pickingData.length) {
       const changedPickingData = this.exportTypeMethod(this.pickingData)
       this.excelService.exportAsExcelFile(changedPickingData, 'Picking-Report', null);
     } else {
       this.toastr.error('No data available');
     }
   } */
  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        if (k.expiryDates != null) {
          k.expiryDates.forEach((el, i) => {
            if (i === 0) {
              const obj = {}
              if (k.supplierMasterInfo != null || k.customerMasterInfo != null || k.wareHouseTransferDestinationInfo != null) {
                obj['Supplier/Customer/WareHouse ID Name'] = k.supplierMasterInfo ? k.supplierMasterInfo.supplierIDName : null + '' + k.customerMasterInfo ? k.customerMasterInfo.customerIDName : null + ' ' + k.wareHouseTransferDestinationInfo ? k.wareHouseTransferDestinationInfo.wareHouseIDName : null
              }
              else {
                obj['Supplier/Customer/WareHouse ID Name'] = null
              }
              obj['Picking Number'] = k.pickingNumber
              obj['Wmso Number'] = k.wmsoNumber
              obj['Product ID'] = k.productID
              obj['Product Name'] = k.productName
              obj['Product Description'] = k.productDescription
              obj['Brand Name'] = k.brandName
              obj['UOM'] = k.inventoryUnit
              obj['Expiry Date'] = el ? this.datepipe.transform(new Date(el), 'dd/MM/yyyy') : null

              if (k.mfgDates != null) {
                k.expiryDates.forEach(getManuDates => {
                  obj['Manufacturing Date'] = getManuDates ? this.datepipe.transform(new Date(el), 'dd/MM/yyyy') : null
                })
              }
              if (k.batchNumbers != null) {
                k.batchNumbers.forEach(batchNumber => {
                  obj['Batch Number'] = batchNumber
                })
              }
              // obj['Assigned To'] = k.wareHouseTeamInfo ? k.wareHouseTeamInfo.executiveIDName : null
              // obj['Assigned Date'] = k.assignedDate ? this.datepipe.transform(new Date(k.assignedDate), 'dd/MM/yyyy HH:mm:ss') : null
              // obj['Completed By'] = k.completedBy
              obj['Zone Name'] = k.zoneInfo ? k.zoneInfo.zoneName : null
              obj['Rack Name'] = k.rackInfo ? k.rackInfo.rackName : null
              obj['Level Name'] = k.levelInfo ? k.levelInfo.levelName : null
              obj['Column Name'] = k.columnInfo ? k.columnInfo.columnName : null
              obj['Location Name'] = k.locationName
              obj['Ex Bond Number'] = k.exBondNumber
              obj['Ex Bond Date'] = k.exBondDate
              obj['Picked Quantity'] = k.pickedQuantity
              obj['Total Actual Picking Quantity'] = k.totalActualPickingQuantity
              obj['Balanced Picking Quantity'] = k.balancePickingQuantity
              obj['Created On'] = k.createdDate ? this.datepipe.transform(new Date(k.createdDate), 'dd/MM/yyyy HH:mm:ss') : null
              obj['Start Time'] = k.startTime ? this.datepipe.transform(new Date(k.startTime), 'dd/MM/yyyy HH:mm:ss') : null
              obj['End Time'] = k.endTime ? this.datepipe.transform(new Date(k.endTime), 'dd/MM/yyyy HH:mm:ss') : null
              obj['Planned Completion Date'] = k.plannedCompletionDate ? this.datepipe.transform(new Date(k.plannedCompletionDate), 'dd/MM/yyyy HH:mm:ss') : null
              obj['Status'] = k.status
              arr.push(obj)
            } else {
              const obj = {}
              obj['Expiry Date'] = el ? this.datepipe.transform(new Date(el), 'dd/MM/yyyy') : null
              obj['Picking Number'] = null
              obj['Wmso Number'] = null
              obj['Product ID'] = null
              obj['Product Name'] = null
              obj['Product Description'] = null
              obj['Brand Name'] = null
              // obj['Assigned To'] = null
              // obj['Assigned Date'] = null
              // obj['Completed By'] = null

              obj['quantity'] = null
              obj['Zone Name'] = null
              obj['Rack Name'] = null
              obj['Level Name'] = null
              obj['Column Name'] = null
              obj['Location Name'] = null
              obj['Ex Bond Number'] = null
              obj['Ex Bond Date'] = null
              obj['Picked Quantity'] = null
              obj['Total Actual Picking Quantity'] = null
              obj['Balanced Picking Quantity'] = null
              obj['Created On'] = null
              obj['Start Time'] = null
              obj['End Time'] = null
              obj['Planned Completion Date'] = null
              obj['Status'] = null
              arr.push(obj)
            }
          })
        } else {
          const obj = {}
          if (k.supplierMasterInfo != null || k.customerMasterInfo != null || k.wareHouseTransferDestinationInfo != null) {
            obj['Supplier/Customer/WareHouse ID Name'] = k.supplierMasterInfo ? k.supplierMasterInfo.supplierIDName : null + '' + k.customerMasterInfo ? k.customerMasterInfo.customerIDName : null + ' ' + k.wareHouseTransferDestinationInfo ? k.wareHouseTransferDestinationInfo.wareHouseIDName : null
          }
          else {
            obj['Supplier/Customer/WareHouse ID Name'] = null
          }
          obj['Picking Number'] = k.pickingNumber
          obj['Wmso Number'] = k.wmsoNumber
          obj['Product ID'] = k.productID
          obj['Product Name'] = k.productName
          obj['Product Description'] = k.productDescription
          obj['Brand Name'] = k.brandName
          obj['UOM'] = k.inventoryUnit
          obj['Expiry Date'] = null
          if (k.mfgDates != null) {
            k.expiryDates.forEach(getManuDates => {
              obj['Manufacturing Date'] = getManuDates ? this.datepipe.transform(new Date(getManuDates), 'dd/MM/yyyy') : null
            })
            //obj['Expiry Date'] = k.expiryDate ? this.datepipe.transform(new Date(k.expiryDate), 'dd/MM/yyyy') : null
          }
          if (k.batchNumbers != null) {
            k.batchNumbers.forEach(batchNumber => {
              obj['Batch Number'] = batchNumber
            })
            //obj['Expiry Date'] = k.expiryDate ? this.datepipe.transform(new Date(k.expiryDate), 'dd/MM/yyyy') : null
          }
          //  obj['Manufacture Date'] = k.mfgDate ? this.datepipe.transform(new Date(k.mfgDate), 'dd/MM/yyyy') : null
          // obj['Batch Number'] = k.batchNumber
          // obj['Assigned To'] = k.wareHouseTeamInfo ? k.wareHouseTeamInfo.executiveIDName : null
          // obj['Assigned Date'] = k.assignedDate ? this.datepipe.transform(new Date(k.assignedDate), 'dd/MM/yyyy HH:mm:ss') : null
          // obj['Completed By'] = k.completedBy
          obj['Zone Name'] = k.zoneInfo.zoneName
          obj['Rack Name'] = k.rackInfo.rackName
          obj['Level Name'] = k.levelInfo.levelName
          obj['Column Name'] = k.columnInfo.columnName
          obj['Location Name'] = k.locationName
          obj['Ex Bond Number'] = k.exBondNumber
          obj['Ex Bond Date'] = k.exBondDate
          obj['Picked Quantity'] = k.pickedQuantity
          obj['Total Actual Picking Quantity'] = k.totalActualPickingQuantity
          obj['Balanced Picking Quantity'] = k.balancePickingQuantity
          obj['Inventory Unit'] = k.inventoryUnit
          obj['Created On'] = k.createdDate ? this.datepipe.transform(new Date(k.createdDate), 'dd/MM/yyyy HH:mm:ss') : null
          obj['Start Time'] = k.startTime ? this.datepipe.transform(new Date(k.startTime), 'dd/MM/yyyy HH:mm:ss') : null
          obj['End Time'] = k.endTime ? this.datepipe.transform(new Date(k.endTime), 'dd/MM/yyyy HH:mm:ss') : null
          obj['Planned Completion Date'] = k.plannedCompletionDate ? this.datepipe.transform(new Date(k.plannedCompletionDate), 'dd/MM/yyyy HH:mm:ss') : null
          obj['Status'] = k.status
          arr.push(obj)
        }
      })
      console.log(arr)
    } else {
      const obj = {}
      obj['Picking Number'] = null
      obj['Wmso Number'] = null
      obj['Product ID'] = null
      obj['Product Name'] = null
      obj['Product Description'] = null
      obj['Brand Name'] = null
      obj['UOM'] = null
      // obj['Assigned To'] = null
      // obj['Assigned Date'] = null
      // obj['Completed By'] = null

      obj['quantity'] = null
      obj['Zone Name'] = null
      obj['Rack Name'] = null
      obj['Level Name'] = null
      obj['Column Name'] = null
      obj['Location Name'] = null
      obj['Ex Bond Number'] = null
      obj['Ex Bond Date'] = null
      obj['Picked Quantity'] = null
      obj['Total Actual Picking Quantity'] = null
      obj['Balanced Picking Quantity'] = null
      obj['Created On'] = null
      obj['Start Time'] = null
      obj['End Time'] = null
      obj['Planned Completion Date'] = null
      obj['Status'] = null
      arr.push(obj)
    }
    return arr
  }
  fetchMetaData() {
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.warehouseNameValues = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
    this.reportsCommonService.fetchAllZones();
    this.reportsCommonService.zoneNameValues.subscribe(res => {
      this.zoneNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllCustomers();
    this.reportsCommonService.customerIDNameValues.subscribe(res => {
      this.customerIDNameValues = this.completerService.local(res);
    });
    this.reportsCommonService.fetchAllSuppliers();
    this.reportsCommonService.supplierIDNameValues.subscribe(res => {
      this.supplierIDNames = this.completerService.local(res);
    });
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
  }
  makeEmpty() {
    this.pickingReportForm.controls.wareHouseTransferDestinationInfoWareHouseIDName.setValue(null);
    this.pickingReportForm.controls.supplierIDName.setValue(null);
    this.pickingReportForm.controls.customerIDName.setValue(null);
  }
  createpickingReportForm() {
    this.pickingReportForm = new FormBuilder().group({
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
      wareHouseTransferDestinationInfoWareHouseIDName: null,
      orderType: 'Sales Order',
      supplierIDName: null,
      customerIDName: null,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
    });
  }
  warehouseTeamsList: any;
  wareHouseListValuesIDs: CompleterData;
  fetchAllWarehouseTeams() {
    this.commonMasterDataService.fetchAllWarehouseTeams(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.warehouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseListValuesIDs = response.data.wareHouseTeams.map(executiveidname => executiveidname.executiveIDName)
          console.log(this.warehouseTeamsList);
        }
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
    //this.forPermissionsSubscription.unsubscribe();
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
          const filteredLevels = this.levels.filter(x => x.zoneInfo.zoneName === this.pickingReportForm.controls.zoneName.value && x.rackInfo.rackName === event.originalObject);
          this.levelNameValues = filteredLevels ? filteredLevels.map(x => x.levelName) : [];
          break;
        }
        case 'level': {
          const filteredLocations = this.locations.filter(x => x.zoneInfo.zoneName === this.pickingReportForm.controls.zoneName.value && x.rackInfo.rackName === this.pickingReportForm.controls.rackName.value && x.levelInfo.levelName === event.originalObject);
          this.locationNameValues = filteredLocations ? filteredLocations.map(x => x.locationName) : [];
          break;
        }
      }
    }
    else {
      const empty: any = [];
      switch (key) {
        case 'zone': {
          this.pickingReportForm.controls.rackName.setValue(null);
          this.pickingReportForm.controls.levelName.setValue(null);
          this.pickingReportForm.controls.locationName.setValue(null);
          this.rackNameValues = empty;
          this.levelNameValues = empty;
          this.locationNameValues = empty;
          break;
        }
        case 'rack': {
          this.pickingReportForm.controls.levelName.setValue(null);
          this.pickingReportForm.controls.locationName.setValue(null);
          this.levelNameValues = empty;
          this.locationNameValues = empty;
          break;
        }
        case 'level': {
          this.pickingReportForm.controls.locationName.setValue(null);
          this.locationNameValues = empty;
          break;
        }
      }
    }
  }

  /*
  generatePDF(){
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 300);
} */

  /* generatePDF() {
    if (this.pickingData.length > 0) {
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
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  interexpdates: any;
  getInventoryDetails() {
    this.reportsService.fetchPickingReport(JSON.stringify(this.pickingReportForm.value)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.pickingReportResponseList) {
          const bIn = response.data.pickingReportResponseList.filter(x => x.expiryDates != null);

          console.log(response.data.pickingReportResponseList);
          console.log(bIn);
          const dupBin = bIn.map(x => x.expiryDates)
          console.log(dupBin)
          this.interexpdates = this.removeDuplicates(dupBin);
          console.log(this.interexpdates);
        } else {
        }
      },
      (error) => {
      });
  }

  generatePDF() {
    this.finalArray = []; // Reset finalArray to collect all data
    this.loopToStopB = null;
    this.totalItemsB = null;
    this.dataPerPageB = null;
    this.getAllPickingForPrintPDF();
  }
  getAllPickingForPrintPDF(index?) {
    if (!index) {
      this.exportDataForPrintPDf = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      this.wmsService.pickingDisplayTableList = this.exportDataForPrintPDf;
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
        this.reportsService.fetchPickingReport(JSON.stringify(form)).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.pickingReportPaginationResponse) {
              this.exportDataForPrintPDf = [...this.exportDataForPrintPDf, ...response.data.pickingReportPaginationResponse.pickingReportResponseList];
              this.getAllPickingForPrintPDF(i);
            }
          });
      }
    }
  }
  openPrintDialog() {
    window.print();
  }

}
