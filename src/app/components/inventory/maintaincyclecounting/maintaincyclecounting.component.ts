import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { PaginationConstants } from 'src/app/constants/paginationConstants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Storage } from 'src/app/shared/utils/storage';

@Component({
  selector: 'app-maintaincyclecounting',
  templateUrl: './maintaincyclecounting.component.html',
  styleUrls: ['./maintaincyclecounting.component.scss']
})
export class MaintaincyclecountingComponent implements OnInit {
  ccData: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  formObj = this.configService.getGlobalpayload();
  role: any = null;
  tableHeadings = ['S.No', 'Cycle Counting Code', 'Criteria Type', 'Planned Schedule Date', 'Actual Cycle Counting Date', 'Status', 'Action',]
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inventory', 'Cycle Counting', Storage.getSessionUser());
  permissionToggle: any = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = null;
  sortFields: any = null;
  constructor(private router: Router, private appService: AppService,
    private configService: ConfigurationService, private toastr: ToastrService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.role = Storage.getSessionUser().authorities[0].authority;
    if (this.permissionsList.includes('View')) {
      this.fetchData(1, this.itemsPerPage);
      this.getPermissions();
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  getPermissions() {
    this.configService.findInventoryConfigPermissions(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['processConfigurations'] && res['data']['processConfigurations'].length > 0) {
        console.log(res['data']['processConfigurations']);
        if (res['data']['processConfigurations'].find(x => x.name == 'Cycle Counting')) {
          const rolePermissionsArray = res['data']['processConfigurations'].find(x => x.name == 'Cycle Counting').roleConfigurations.map(x => x.role.roleName);
          const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).authorities[0].authority;
          this.permissionToggle = rolePermissionsArray.includes(loginUserRole) ? true : false;
        }
        else {
          this.permissionToggle = false;
        }
      }
    })
  }

  
  fetchAllD(page, event) {
    if (event) {
      this.fetchData(page, event.target.value);
    }
  }
  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = PaginationConstants['cycleCountingTableArrays'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    this.fetchData(this.page, this.itemsPerPage);
  }
  cycleCountingCriterias: any = [
    { value: 'productCategory', viewValue: 'Product Category' },
    { value: 'wareHouse', viewValue: 'Warehouse' },
    { value: 'zone', viewValue: 'Zone' },
    { value: 'location', viewValue: 'Location' },
    { value: 'product', viewValue: 'Product' },
    { value: 'supplier', viewValue: 'Supplier' }
  ];
  reqObj={
    plannedScheduleDateFrom:null,
    plannedScheduleDateTo: null,
    actualCycleCountingDateFrom:null,
    actualCycleCountingDateTo:null,
    status:"All",
    criteriaType:null,
  }
  
  forValidDateDifferenceactualCycleCountingFrom(data){
    if(data){
      this.makePlannedScheduledDateDisable = true
    } 
    if(data === ''){
      this.reqObj.actualCycleCountingDateFrom = null
    }
    if(this.reqObj.actualCycleCountingDateFrom &&  this.reqObj.actualCycleCountingDateTo)
    {
    if(this.reqObj.actualCycleCountingDateFrom <=  this.reqObj.actualCycleCountingDateTo)
    {   
    }
    else{
      this.toastr.error("please select Valid Date Difference");
      this.reqObj.actualCycleCountingDateFrom = null,
      this.reqObj.actualCycleCountingDateTo = null
      this.makePlannedScheduledDateDisable = false
    }
  }
  else  if(this.reqObj.actualCycleCountingDateFrom ===null &&  this.reqObj.actualCycleCountingDateTo ===null){
    this.makePlannedScheduledDateDisable = false
  }
  }
  forValidDateDifferenceactualCycleCountingTo(data){
    if(data){
      this.makePlannedScheduledDateDisable = true
    } 
    if(data === ''){
      this.reqObj.actualCycleCountingDateTo = null
    }
    if(this.reqObj.actualCycleCountingDateFrom &&  this.reqObj.actualCycleCountingDateTo)
    {
    if(this.reqObj.actualCycleCountingDateFrom <=  this.reqObj.actualCycleCountingDateTo)
    {   
    }
    else{
      this.toastr.error("please select Valid Date Difference");
      this.reqObj.actualCycleCountingDateFrom = null,
      this.reqObj.actualCycleCountingDateTo = null
      this.makePlannedScheduledDateDisable = false
    }
  }
  else  if(this.reqObj.actualCycleCountingDateFrom ===null &&  this.reqObj.actualCycleCountingDateTo ===null){
    this.makePlannedScheduledDateDisable = false
  }
  }
  makePlannedScheduledDateDisable:boolean;
  makeActualScheduledDateDisable:boolean;
  forValidDateDifferenceplannedScheduleDateFromDateFrom(data){
    if(data){
      this.makeActualScheduledDateDisable = true;
    }    
    if(data === '')
    {
      this.reqObj.plannedScheduleDateFrom = null;
    }
    if(this.reqObj.plannedScheduleDateFrom &&  this.reqObj.plannedScheduleDateTo)
    {
    if(this.reqObj.plannedScheduleDateFrom <=  this.reqObj.plannedScheduleDateTo)
    {   
    }
    else{
      this.toastr.error("please select Valid Date Difference");
      this.reqObj.plannedScheduleDateFrom = null,
      this.reqObj.plannedScheduleDateTo = null
      this.makeActualScheduledDateDisable = false;
    }
  }
  else if(this.reqObj.plannedScheduleDateFrom === null  &&  this.reqObj.plannedScheduleDateTo === null){
    this.makeActualScheduledDateDisable = false;
  }
  }
  forValidDateDifferenceplannedScheduleDateFromDateTo(data){
    console.log(data);
    if(data){
      this.makeActualScheduledDateDisable = true;
    }    
    if(data === '')
    {
      this.reqObj.plannedScheduleDateTo = null;
    }
    if(this.reqObj.plannedScheduleDateFrom &&  this.reqObj.plannedScheduleDateTo)
    {
    if(this.reqObj.plannedScheduleDateFrom <=  this.reqObj.plannedScheduleDateTo)
    {   
    }
    else{
      this.toastr.error("please select Valid Date Difference");
      this.reqObj.plannedScheduleDateFrom = null,
      this.reqObj.plannedScheduleDateTo = null
      this.makeActualScheduledDateDisable = false;
    }
  }
  else if(this.reqObj.plannedScheduleDateFrom === null  &&  this.reqObj.plannedScheduleDateTo === null){
    this.makeActualScheduledDateDisable = false;

  }
  }


 
  backtoNormal(){
      this.reqObj={
        plannedScheduleDateFrom:null,
        plannedScheduleDateTo: null,
        actualCycleCountingDateFrom:null,
        actualCycleCountingDateTo:null,
        status:"Created",
        criteriaType:null,
      }
      this.makeActualScheduledDateDisable = false;
      this.makePlannedScheduledDateDisable = false;
      this.selectParedDates();
    }
    selectParedDates() {
      const { reqObj } = this;
      if (reqObj.plannedScheduleDateFrom || reqObj.plannedScheduleDateTo)   {
        if (!reqObj.plannedScheduleDateTo) {
          this.toastr.error("Select Planned Scheduled  Date To As well");
        } else if ((!reqObj.plannedScheduleDateFrom)){
          this.toastr.error("Select Planned Scheuled Date From as well");
        }
        else{
          console.log(reqObj);
          this.fetchData(1,1);
        }
      }  else if (reqObj.actualCycleCountingDateFrom || reqObj.actualCycleCountingDateTo) {
        console.log(this.reqObj);
        if (!reqObj.actualCycleCountingDateTo) {
          this.toastr.error("Select actual scheduled Date To as well");
        } else if (!reqObj.actualCycleCountingDateFrom) {
          this.toastr.error("Select actual scheduled Date From as Well ");
        }
        else{
          console.log(reqObj);
          this.fetchData(1,1);
        }
      } else {
        this.fetchData(1,1);
      }
    }  
    /* selectParedDates(){
      if(this.reqObj.plannedScheduleDateFrom && this.reqObj.plannedScheduleDateTo === null )
      {
        this.toastr.error("select Planned Scheduled To Date as Well")
      }
      else if (this.reqObj.plannedScheduleDateTo && this.reqObj.plannedScheduleDateFrom === null)
      {
          this.toastr.error("select Planned Scheduled From Date as Well")
      }
      else if (this.reqObj.actualCycleCountingDateFrom && this.reqObj.actualCycleCountingDateTo === null)
      {
        this.toastr.error("select Actual Scheduled To Date as Well")
      }
      else if (this.reqObj.actualCycleCountingDateTo && this.reqObj.actualCycleCountingDateFrom === null)
      {
        this.toastr.error("select Actual Scheduled From Date as Well")
      }
      else{
        this.fetchData(1,1);
      }
  
    } */
  fetchData(page?, pageSize?) {
    const form = {
      "page": page?page:1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      // "searchOnKeys": PaginationConstants.cycleCountingTableKeys,
      "searchOnKeys":null,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName,     
      "plannedScheduleDateFrom":this.reqObj.plannedScheduleDateFrom,
      "plannedScheduleDateTo": this.reqObj.plannedScheduleDateTo,
      "actualCycleCountingDateFrom":this.reqObj.actualCycleCountingDateFrom,
      "actualCycleCountingDateTo":this.reqObj.actualCycleCountingDateTo,
      "status": this.reqObj.status === 'All' ? null : this.reqObj.status,
      "criteriaType": this.reqObj.criteriaType,
    }
    this.configService.getAllInventoryCountingWithPaginations(form).subscribe(res => {
      if (res['status'] == 0 && res['data']['inventoryCountingPaginationResponse']['inventoryCountings']) {
        this.ccData = res['data']['inventoryCountingPaginationResponse']['inventoryCountings'];
        this.ccData.forEach(ele => {
          ele['isViewToggle'] = false
        })
        this.totalItems = res['data']['inventoryCountingPaginationResponse'].totalElements;
      }
    })
  }
  changeUpToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  changeDownToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
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

  navigate(id?) {
    if (this.permissionsList.includes('Create')) {
      if (id) {
        this.appService.navigate('/v1/inventory/createcyclecounting', { id: id });
      }
      else {
        this.router.navigate(['/v1/inventory/createcyclecounting']);
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  /*
  exportAsXLSX() {
    const changedProductList = this.exportTypeMethod(this.products)
    this.excelService.exportAsExcelFile(changedProductList, 'products', null);
  }
  exportTypeMethod(data) {
    console.log(data);
    const arr = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        console.log(ele);
        const obj = {}
        obj['productID'] = ele.productID
        obj['productName'] = ele.productName
        obj['productDescription'] = ele.productDescription
        obj['productConfiguration'] = ele.productConfiguration
        obj['dfsCode'] = ele.dfsCode
        obj['type'] = ele.type
        obj['hsnCode'] = ele.hsnCode
        obj['upcEANNumber'] = ele.upcEANNumber
        obj['productType'] = ele.productType
        obj['productClass'] = ele.productClass
        if (ele.productCategoryInfo) {
          obj['productCategoryName'] = ele.productCategoryInfo.productCategoryName
        } else {
          obj['productCategoryName'] = null
        }
        obj['avgCostPrice'] = ele.avgCostPrice
        obj['avgSalesPrice'] = ele.avgSalesPrice
        obj['breadth'] = ele.breadth
        obj['breadthUom'] = ele.breadthUom
        obj['batchNumber'] = ele.batchNumber
        obj['currency'] = ele.currency
        obj['dispatchInstruciton'] = ele.dispathInstruciton
        obj['expiryFlag'] = ele.expiryFlag
        obj['height'] = ele.height
        obj['heightUom'] = ele.heightUom
        obj['inventoryUnit'] = ele.inventoryUnit
        obj['leadTime'] = ele.leadTime
        obj['length'] = ele.length
        obj['lengthUom'] = ele.lengthUom
        obj['maxDimension'] = ele.maxDimension
        obj['maxDimensionUom'] = ele.maxDimensionUom
        obj['mergeType'] = ele.mergeType
        obj['moq'] = ele.moq
        obj['packageType'] = ele.packageType
        obj['palletQuantity'] = ele.palletQuantity
        obj['palletSize'] = ele.palletSize
        obj['pickingDirection'] = ele.pickingDirection
        obj['pickingUnit'] = ele.pickingUnit
        obj['price'] = ele.price
        obj['productMerge'] = ele.productMerge
        obj['qualityCheck'] = ele.qualityCheck
        obj['reOrderPoint'] = ele.reOrderPoint
        obj['receivingInstruction'] = ele.receivingInstruction
        obj['receivingUnit'] = ele.receivingUnit
        obj['serialNumberCheck'] = ele.serialNumberCheck
        obj['shelfLife'] = ele.shelfLife
        obj['shipmentUnit'] = ele.shipmentUnit
        obj['storageInstruction'] = ele.storageInstruction
        obj['storageUnit'] = ele.storageUnit
        obj['taxGroup'] = ele.taxGroup
        obj['updatedDate'] = ele.updatedDate ? this.datepipe.transform(new Date(ele.updatedDate), 'yyyy-dd-MM') : null
        obj['volume'] = ele.volume
        obj['volumeUom'] = ele.volumeUom
        obj['storageUnit'] = ele.storageUnit
        obj['weight'] = ele.weight
        obj['weightUom'] = ele.weightUom
        arr.push(obj)
        console.log(arr)
      })
    }
    else {
      const obj = {}

      obj['productID'] = null
      obj['productName'] = null
      obj['productDescription'] = null
      obj['productConfiguration'] = null
      obj['dfsCode'] = null
      obj['type'] = null
      obj['hsnCode'] = null
      obj['upcEANNumber'] = null
      obj['productType'] = null
      obj['productClass'] = null
      obj['productCategoryName'] = null
      obj['avgCostPrice'] = null
      obj['avgSalesPrice'] = null
      obj['breadth'] = null
      obj['breadthUom'] = null
      obj['batchNumber'] = null
      obj['currency'] = null
      obj['dispatchInstruciton'] = null
      obj['expiryFlag'] = null
      obj['height'] = null
      obj['heightUom'] = null
      obj['inventoryUnit'] = null
      obj['leadTime'] = null
      obj['length'] = null
      obj['lengthUom'] = null
      obj['maxDimension'] = null
      obj['maxDimensionUom'] = null
      obj['mergeType'] = null
      obj['moq'] = null
      obj['packageType'] = null
      obj['palletQuantity'] = null
      obj['palletSize'] = null
      obj['pickingDirection'] = null
      obj['pickingUnit'] = null
      obj['price'] = null
      obj['productMerge'] = null
      obj['qualityCheck'] = null
      obj['reOrderPoint'] = null
      obj['receivingInstruction'] = null
      obj['receivingUnit'] = null
      obj['serialNumberCheck'] = null
      obj['shelfLife'] = null
      obj['shipmentUnit'] = null
      obj['storageInstruction'] = null
      obj['storageUnit'] = null
      obj['taxGroup'] = null
      obj['updatedDate'] = null
      obj['volume'] = null
      obj['volumeUom'] = null
      obj['storageUnit'] = null
      obj['weight'] = null
      obj['weightUom'] = null
      arr.push(obj)
    }
    return arr
  } */

}
