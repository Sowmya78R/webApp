import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { InboundMasterDataService } from 'src/app/services/integration-services/inboundMasterData.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';

@Component({
  selector: 'app-putawaymanagement',
  templateUrl: './putawaymanagement.component.html',
  styleUrls: ['./putawaymanagement.component.scss']
})
export class PutawaymanagementComponent implements OnInit {
  putAwaysList: any = [];
  putawayPlanningForm: FormGroup;
  orderTypeDropdown = ['Purchase Order', 'Sales Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns', 'Putaway Damaged Stock'];
  formObj = this.configService.getGlobalpayload();
  supplierIds: any = [];
  customerIds: any = [];
  wareHouseIds: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  overAllPO: any = [];
  zonesIDs: CompleterData
  locations: any;
  locationIDs: CompleterData;
  usersList: any;
  userIDs: CompleterData;
  wareHouseTeamsListIDs: CompleterData;
  responseValues: any;
  putAwaySaveList: any;
  userValues: any = [];
  selectedDocuments = [];
  WMPOs: any = [];
  wareHouseTeamsList: any = [];
  @Input() isReportView: boolean = false;
  page: number = 1;
  itemsPerPage = 5;
  totalItems: any = null;
  searchKey: any = null;
  @Output() emitTripSheet: any = new EventEmitter<any>();
  wmpoFilteredObj: any = null;
  subscription: Subscription;
  @Input() item = '';
  valueimg: any;
  fetchUserLoginIDName: any;
  permissionsList: any;
  loopToStop: any = null;
  dataPerPage: number;
  loopToStopB: any = null;
  dataPerPageB: number;
  finalArray: any = [];
  totalItemsB: any;
  isReportScreen: boolean= false

  constructor(private fb: FormBuilder, private wmsService: WMSService, private IBMDService: InboundMasterDataService,
    private commonmasterdataservice: CommonMasterDataService, private router: Router,
    private datepipe: DatePipe,
    private excelService: ExcelService,
    private toastr: ToastrService, private configService: ConfigurationService) {
    this.createputawayPlanningForm();
    this.subscription = null
    if (this.router.url.includes(`/employeeTask/employeeTaskputaway`)) {
      this.subscription = this.wmsService.selectedValueSubject.subscribe((data) => {
        if (data) {
          this.valueimg = data;
          if (this.router.url.includes(`/employeeTask/employeeTaskputaway`)) {
            this.getCallOnDropDownChange(this.valueimg);
          }
          this.item = this.valueimg
        } else {
          const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo.userInfo.userIDName;
          this.fetchUserLoginIDName = loginUserRole;
          this.getCallOnPageLoad();
        }
      });
    }
  }

  ngOnInit() {
    console.log(this.router.url)
    if (this.router.url.includes('/reports/putawayHistory')) {
      this.isReportScreen= true
    } else {
      this.isReportScreen= false
    }
    this.fetchAllZones();
    this.fetchAllSuppliers();
    this.fetchAllExecutionIDName();
    if (sessionStorage.getItem('historyRoute').includes('employeeSchedule/putawayPlanning')) {
      this.fetchAllPutawaysBySupplierID('All');
      //this.fetchAllPutawayDetails(1);
    }
    else {
      this.fetchAllPutawaysBySupplierID('Purchase Order', 'key');
    }
  }
  getCallOnDropDownChange(user) {
    const reqPutawayObj = {
      executiveIDName: user,
      locationName: null,
      zoneName: null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPutawayDetails(1, reqPutawayObj);
  }
  fetchAllD(page, event) {
    if (event) {
      this.fetchAllPutawayDetails(page, event.target.value);
    }
  }
  getCallOnPageLoad() {
    const reqPutawayObj = {
      executiveIDName: this.fetchUserLoginIDName,
      locationName: null,
      zoneName: null,
      // wmpoNumber: null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllPutawayDetails(1, reqPutawayObj);
  }
  fetchAllPutawaysBySupplierID(oType, key?) {
    if (!key) {
      this.putawayPlanningForm.controls.fullWmpoNumber.setValue(null);
      this.putawayPlanningForm.controls.wmpoNumber.setValue(null);
      this.putawayPlanningForm.controls.wmpoNumberPrefix.setValue(null);
    }
    this.WMPOs = [];
    this.putAwaysList = [];
    const form = this.configService.getGlobalpayload();
    form['supplierID'] = '';
    form['orderType'] = (oType == 'All') ? null : oType;
    this.wmsService.fetchAllPutawaysBySupplierID(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putaways.length > 0) {
          this.overAllPO = response.data.putaways;
          this.getPutawayWMPOS(response.data.putaways);
        } else {
          this.overAllPO = [];
          this.getPutawayWMPOS(null);
        }
      },
      (error) => {
      });
  }
  getPutawayWMPOS(data) {
    this.WMPOs = [];
    if (data) {
      data.forEach(line => {
        if (line.fullWmpoNumber && this.WMPOs.indexOf(line.fullWmpoNumber) === -1) {
          this.WMPOs.push(line.fullWmpoNumber);
        }
      });
    }
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones.length > 0) {
          this.zonesIDs = response.data.zones.map(zonename => zonename.zoneName);
        }
      },
      (error) => {
      });
  }
  fetchAllSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (r) => {
        if (r && r.status === 0 && r.data.supplierMasters) {
          this.supplierIds = r.data.supplierMasters.map(x => x.supplierIDName);
        }
      })
    this.IBMDService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers.length > 0) {
          this.customerIds = response.data.customers.map(x => x.customerIDName);
        }
      })
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseIds = response.data.wareHouses.map(x => x.wareHouseIDName);
        }
      })
  }
  fetchAllExecutionIDName() {
    const form = this.formObj;
    form["workType"] = "Putaway"
    this.commonmasterdataservice.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
  }
  resetOnly() {
    this.createputawayPlanningForm();
    this.putawayPlanningForm.controls.orderType.setValue('Purchase Order');
    this.fetchAllPutawaysBySupplierID('Purchase Order');
    this.wmsService.fieldsData = {};
    this.putAwaysList = [];
    this.WMPOs = [];
  }

  createputawayPlanningForm() {
    this.putawayPlanningForm = this.fb.group({
      _id: this.fb.array([]),
      wmpoNumber: null,
      fullWmpoNumber: null,
      wmpoNumberPrefix: null,
      zoneName: [''],
      locationName: [''],
      executiveIDName: [null],
      orderType: 'Purchase Order',
      supplierIDName: null,
      customerIDName: null,
      wareHouseTransferSourceInfoWareHouseIDName: null,
      organizationIDName: this.configService.getGlobalpayload().organizationIDName,
      wareHouseIDName: this.configService.getGlobalpayload().wareHouseIDName,
    })
  }

  fetchAllPutawayDetails(page?, payload?) {
    const formValues = this.putawayPlanningForm.value;
    formValues.page = page ? page : 1;
    formValues.pageSize = this.itemsPerPage;
    formValues["searchKeyword"] = this.searchKey;
    formValues["searchOnKeys"] = null;
    formValues["sortDirection"] = null;
    formValues["sortFields"] = null
    if ((sessionStorage.getItem('historyRoute').includes('employeeSchedule/putawayPlanning'))
      || (formValues.orderType && formValues.fullWmpoNumber)) {
      this.wmsService.putawayManagement(payload ? payload : formValues).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.putawayManagementPaginationResponse.putawayManagements.length > 0) {
            this.putAwaysList = response.data.putawayManagementPaginationResponse.putawayManagements;
            this.totalItems = response.data.putawayManagementPaginationResponse.totalElements;
            this.wmsService.PutawayTableList = this.putAwaysList
            const form = this.putawayPlanningForm.value;
            this.wmsService.putawayHistoryDataPassing = form
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

          }
          else {
            this.putAwaysList = [];
          }
        },
        (error) => {
        });
    }
    else {
      this.toastr.error('Enter Manditory');
      this.putAwaysList = [];
    }
  }
  setWmpoNumber(event) {
    if (event) {
      this.wmpoFilteredObj = this.overAllPO.find(x => x.fullWmpoNumber == event.originalObject);
      this.putawayPlanningForm.controls.wmpoNumber.setValue(this.wmpoFilteredObj.wmpoNumber);
      this.putawayPlanningForm.controls.wmpoNumberPrefix.setValue(this.wmpoFilteredObj.wmpoNumberPrefix);
      this.putawayPlanningForm.controls.orderType.setValue(this.wmpoFilteredObj.orderType);
    }
    else {
      this.wmpoFilteredObj = null;
      this.putawayPlanningForm.controls.wmpoNumber.setValue(null);
      this.putawayPlanningForm.controls.wmpoNumberPrefix.setValue(null);
      // this.putawayPlanningForm.controls.orderType.setValue(null);
    }
  }

  // generatePDF() {
  //   if (this.putAwaysList.length > 0) {
  //     this.emitTripSheet.emit();
  //     setTimeout(() => {
  //       window.print();
  //     }, 500);
  //   }
  //   else {
  //     this.toastr.error("No Data to Print.")

  //   }
  // }
  async exportAsXLSX() {
    try {
      const response = await this.fetchAllDataForExport();
      if (response && response.status === 0 && response.data.putawayManagementPaginationResponse.putawayManagements.length > 0) {
        const allData = response.data.putawayManagementPaginationResponse.putawayManagements;
        const changedPutawayList = this.exportTypeMethod(allData);
        this.excelService.exportAsExcelFile(changedPutawayList, 'Putaway History', null);
      } else {
        this.toastr.error('No data available');
      }
    } catch (error) {
      this.toastr.error('Failed to fetch data for export');
    }
  }

  exportTypeMethod(data) {
    const arr = []
    if (data && data.length > 0) {
      data.forEach(k => {
        const obj = {}
        obj['WMPO Number'] = k.fullWmpoNumber
        obj['Putaway Number'] = k.fullPutawayNumber
        obj['Status'] = k.status
        obj['Start Date'] = k.startTime ? this.datepipe.transform(new Date(k.startTime), 'dd/MM/yyyy HH:mm:ss') : null
        obj['End Date'] = k.endTime ? this.datepipe.transform(new Date(k.endTime), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Planned Completion Date'] = k.plannedCompletionDate ? this.datepipe.transform(new Date(k.plannedCompletionDate), 'dd/MM/yyyy HH:mm:ss') : null
        obj['Assigned By'] = k.putawayExecutive
        obj['Assigned To'] = k.executiveIDName
        obj['Product ID'] = k.productMasterInfo.productID
        obj['Product Name'] = k.productMasterInfo.productName
        obj['Product Description'] = k.productDescription
        obj['Brand Name'] = k.brandName
        obj['UOM'] = k.inventoryUnit
        obj['Quantity'] = k.quantity
        obj['Actual Putaway Quantity'] = k.actualPutawayQuantity,
          obj['Zone Name'] = k.zoneInfo.zoneName
        obj['Rack Name'] = k.rackInfo.rackName
        obj['Level Name'] = k.levelInfo.levelName
        obj['Column Name'] = k.columnInfo.columnName
        obj['Location Name'] = k.locationInfo.locationName
        obj['Invoice Number'] = k.invoiceNumber
        obj['Invoice Date'] = k.invoiceDate ? this.datepipe.transform(new Date(k.invoiceDate), 'dd/MM/yyyy') : null,
          obj['BOE No'] = k.billOfEntryNumber
        obj['BOE Date'] = k.billOfEntryDate ? this.datepipe.transform(new Date(k.billOfEntryDate), 'dd/MM/yyyy') : null,
          obj['Bond Number'] = k.bondNumber
        obj['Bond Date'] = k.bondDate ? this.datepipe.transform(new Date(k.bondDate), 'dd/MM/yyyy') : null,
          obj['Create Date'] = k.createdDate ? this.datepipe.transform(new Date(k.createdDate), 'dd/MM/yyyy HH:mm:ss') : null,
          arr.push(obj)
      })
    } else {
      const obj = {}
      obj['WMPO Number'] = null
      obj['Putaway Number'] = null
      obj['Status'] = null
      obj['Start Date'] = null
      obj['End Date'] = null
      obj['Planned Completion Date'] = null
      obj['Assigned By'] = null
      obj['Assigned To'] = null
      obj['Product ID'] = null
      obj['Product Name'] = null
      obj['Product Description'] = null
      obj['Brand Name'] = null
      obj['UOM'] = null
      obj['Quantity'] = null
      obj['Actual Putaway Quantity'] = null
      obj['Zone Name'] = null
      obj['Rack Name'] = null
      obj['Level Name'] = null
      obj['Column Name'] = null
      obj['Location Name'] = null
      obj['Invoice Number'] = null
      obj['Invoice Date'] = null
      obj['BOE No'] = null
      obj['BOE Date'] = null
      obj['Bond Number'] = null
      obj['Bond Date'] = null
      obj['Create Date'] = null
      arr.push(obj)
    }
    return arr

  }

  fetchAllDataForExport() {
    const formValues = { ...this.putawayPlanningForm.value };
    formValues.page = 1;
    formValues.pageSize = this.totalItems;
    formValues["searchKeyword"] = this.searchKey;
    formValues["searchOnKeys"] = null;
    formValues["sortDirection"] = null;
    formValues["sortFields"] = null;

    return this.wmsService.putawayManagement(formValues).toPromise();
  }
  generatePDF() {
    if (this.putAwaysList && this.putAwaysList.length > 0) {
      this.fetchAllDataForPDF();
    } else {
      this.toastr.error("No data available to print");
    }
  }
  fetchAllDataForPDF(page: number = 1, accumulatedData: any[] = []) {
    const formValues = { ...this.putawayPlanningForm.value };
    formValues.page = page;
    formValues.pageSize = this.itemsPerPage; 
    formValues["searchKeyword"] = this.searchKey;
    formValues["searchOnKeys"] = null;
    formValues["sortDirection"] = null;
    formValues["sortFields"] = null;

    this.wmsService.putawayManagement(formValues).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.putawayManagementPaginationResponse.putawayManagements.length > 0) {
          const currentData = response.data.putawayManagementPaginationResponse.putawayManagements;
          accumulatedData = [...accumulatedData, ...currentData];

          const totalItems = response.data.putawayManagementPaginationResponse.totalElements;
          const totalPages = Math.ceil(totalItems / this.itemsPerPage);

          if (page < totalPages) {            
            this.fetchAllDataForPDF(page + 1, accumulatedData);
          } else {
            this.wmsService.PutawayTableList = accumulatedData;
            setTimeout(() => {
              window.print();  
            }, 300);
          }
        } else {
          this.toastr.error("No data available to print");
        }
      },
      (error) => {
        this.toastr.error("Error fetching data for PDF");
      }
    );
  }


  getAllDataForPrint(index?) {
    if (!index) {
      this.putAwaysList = [];
    }
    if (this.dataPerPageB && this.loopToStopB) {
      let i = index ? index + 1 : 1;
      if (i > this.loopToStopB) {

      }
      else {
        if (((i == 1) || (i != 1 && this.putAwaysList.length > 0)) && i <= this.loopToStopB) {
          const form = {
            "page": i,
            "pageSize": this.dataPerPageB,
            "organizationIDName": this.formObj.organizationIDName,
            "wareHouseIDName": this.formObj.wareHouseIDName
          }
          this.wmsService.putawayManagement(form).subscribe(res => {
            if (res['status'] == 0 && res['data'].putawayManagementPaginationResponse) {
              this.putAwaysList = [...this.putAwaysList, ...res['data'].putawayManagementPaginationResponse.putawayManagements];
              this.getAllDataForPrint(i);
              if (i == this.loopToStopB) {
                this.wmsService.PutawayTableList = this.putAwaysList;
                setTimeout(() => {
                  window.print();
                }, 300);
              }
            }
          })
        }
      }
    }
    else {
      const payload = {
        'page': 1, 'pageSize': 10,
        "organizationIDName": this.formObj.organizationIDName,
        "wareHouseIDName": this.formObj.wareHouseIDName,

      }
      this.wmsService.putawayManagement(payload).subscribe(res => {
        if (res['status'] == 0 && res['data'].putawayManagementPaginationResponse) {
          this.finalArray = res['data'].putawayManagementPaginationResponse.putawayManagements;
          this.totalItemsB = res['data'].putawayManagementPaginationResponse.totalElements;
          if (this.totalItemsB <= 10) {
            this.wmsService.PutawayTableList = this.finalArray;

            setTimeout(() => {
              window.print();
            }, 300);
          }
          else {
            const lengthofTotalItems = this.totalItemsB.toString().length;
            const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            count.forEach(el => {
              if (lengthofTotalItems == el) {
                let value: any = 1 + this.configService.addZerosMethod(el);
                this.dataPerPageB = parseInt(value);
              }
            });
            const n: any = (this.totalItemsB / this.dataPerPageB).toString()
            let m = n.split('.')
            if (m[1]) {
              this.loopToStopB = parseInt(m[0]) + 1
            } else {
              this.loopToStopB = parseInt(m[0])
            }
            this.getAllDataForPrint();
          }
        }
      })
    }
  }

  
}
