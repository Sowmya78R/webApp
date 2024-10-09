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
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-return-order',
  templateUrl: './return-order.component.html'
})
export class ReturnOrderComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() emitTripSheet: any = new EventEmitter<any>();
  tripInput: any;
  returnOrderForm: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  productIDNameValues: CompleterData;
  returnOrderData: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('reportsFunctionalities',
    'Inbound', 'Returns', Storage.getSessionUser());
  returnOrderKeys: any = ['S.No', 'WMSO Number', 'Product ID', 'Product Name', 'Return Quantity', 'Return Date','ETA Date'];
  forPermissionsSubscription: any;

  constructor(
    private toastr: ToastrService,private datepipe: DatePipe,
    private reportsService: ReportsService,
    private excelService: ExcelService,
    private reportsCommonService: ReportsCommonService,
    private completerService: CompleterService,
    private configService: ConfigurationService,private wmsService:WMSService
  ) { }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    // this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
    //   if (data) {
    //     this.formObj = this.configService.getGlobalpayload();
    //     this.permissionsList = this.configService.getPermissions('reportsFunctionalities',
    //       'Inbound', 'Returns', Storage.getSessionUser());
    //     this.getFunctionsCall();
    //   }
    // })
    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.createReturnOrderForm();
      this.fetchMetaData();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  generate() {
    this.returnOrderForm.value.fromDate = this.returnOrderForm.value.fromDate ? new Date(this.returnOrderForm.value.fromDate) : null;
    this.returnOrderForm.value.toDate = this.returnOrderForm.value.toDate ? new Date(this.returnOrderForm.value.toDate) : null;
    this.returnOrderForm.value.productIDName = this.returnOrderForm.value.productIDName ? (this.returnOrderForm.value.productIDName) : null;
    this.wmsService.returnOrderyFormDataPassing = this.returnOrderForm.value
    this.reportsService.fetchAllReturnOrderReport(JSON.stringify(this.returnOrderForm.value)).subscribe(
      response => {

        if (response && response.status === 0 && response.data.returnOrderList) {
          this.returnOrderData = response.data.returnOrderList;
          this.wmsService.returnOrdergReportsDisplayTableList = this.returnOrderData;
          // this.returnOrderForm.reset();
          this.rerender();
        } else {
          this.toastr.error('enter valid Data');
        }
      },
      error => { }
    );
  }
  clear() {
    this.returnOrderForm.reset();
    this.createReturnOrderForm();
  }
  exportAsXLSX() {
    if (this.returnOrderData.length) {
      const changedReturnOrderList = this.exportTypeMethod(this.returnOrderData)
      this.excelService.exportAsExcelFile(changedReturnOrderList, 'ReturnOrder-Report', null);
    } else {
      this.toastr.error('No data avaliable');
    }
  }
  exportTypeMethod(data){
    const arr = []
    if(data && data.length > 0) {
      data.forEach(k=> {
        const obj = {}
        obj['poReferenceA'] = k.poReferenceA
        obj['productID'] = k.productID
        obj['productName'] = k.productName
        obj['returnQuantity'] = k.returnQuantity
        obj['returnDate'] = k.returnDate ? this.datepipe.transform(new Date(k.returnDate), 'yyyy-MM-dd') : null
        obj['grnDate'] = k.grnDate ? this.datepipe.transform(new Date(k.grnDate), 'yyyy-MM-dd') : null
        arr.push(obj)
      })
    } else {
      const obj = {}
      obj['poReferenceA'] =null
      obj['productID'] = null
      obj['productName'] = null
      obj['returnQuantity'] = null
      obj['returnDate'] = null
      obj['grnDate'] =null
      arr.push(obj)
    }
    return arr
  }
  fetchMetaData() {
    this.reportsCommonService.fetchAllProducts();
    this.reportsCommonService.productIDNameValues.subscribe(res => {
      this.productIDNameValues = this.completerService.local(res);

    });
  }
  createReturnOrderForm() {
    this.returnOrderForm = new FormBuilder().group({
      productIDName: [null],
      toDate: [null],
      fromDate: [null],
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,

    });
  }
  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
   // this.forPermissionsSubscription.unsubscribe();
  }
  generatePDF(){
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
}
