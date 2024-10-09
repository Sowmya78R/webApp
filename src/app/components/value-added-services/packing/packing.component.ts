import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { OutboundProcessService } from '../../../services/integration-services/outboundProcess.service';
import { CommonService } from '../../../shared/services/common.service';
import { VASRestService } from '../../../services/integration-services/vas-rest.service';
import { ToastrService } from 'ngx-toastr';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ValueAddedServiceScrees } from 'src/app/constants/paginationConstants';
@Component({
  selector: 'app-packing',
  templateUrl: './packing.component.html',
  styles: [`table{
    width: max-content!important;
}
table,tr,th,td{
    width:max-content!important
}
.multiselect-dropdown,.dropdown-btn{
  width:200px!important
}`]
})
export class PackingComponent implements OnInit, AfterViewInit {


  showTooltip = false;

  wmsoNumbers: CompleterData;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  reqObj: any = { customerID: '', fromDate: null, toDate: null };
  wmsoNumber: any;
  shipmentOrders: any = [];
  shipmentOrderLines: any = [];
  customerID: any;
  selectedDocuments: any = [];
  customerName: any;
  filteredSO: any;
  products: any = [];
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Value-Added', 'Packing', Storage.getSessionUser());
  forPermissionsSubscription: any;
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };
  wareHouseTeamsListIDs: CompleterData;
  wareHouseTeamsList: any = [];
  formObj = this.configService.getGlobalpayload();
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  // selectAllCheckboxValue: any = false;

  constructor(
    private completerService: CompleterService, private configService: ConfigurationService,
    private outboundProcessService: OutboundProcessService, private datePipe: DatePipe,
    private commonService: CommonService, private commonDataService: CommonMasterDataService,
    private vasRestService: VASRestService,
    private toastr: ToastrService,
    private wmsService: WMSService,
    private translate: TranslateService,
  ) {
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
      this.fetchAllShipmentOrders();
      this.fetchAllExecutionIDName();
      this.fetchAllProducts();
    }
    this.getDisableEnableFields();
  }
  makeThisDsiable: boolean = false;

  fetchAllExecutionIDName() {
    const form = Object.assign(this.formObj, { 'workType': "Packing" });
    this.commonDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
  }
  getDisableEnableFields() {
    if (this.permissionsList.includes('View') && this.permissionsList.includes('Update')) {
      console.log(this.permissionsList)
      this.makeThisDsiable = false;
    }
    else if (this.permissionsList.includes('View')) {
      this.makeThisDsiable = true;
    }
  }
  intoEmployee(event, attr,) {
    if (this.permissionsList.includes('Update')) {
      if(attr.packingInfo.assignedTo.length > 0){
        this.toastr.success("User assigned successfully");
      }

      else{
        this.toastr.success("No user Assigned ");
      }
      if (!event.relatedTarget) {
        this.onStatusChange(attr);
      }
    }
    else {
      this.toastr.error("user doesn't have permission")
    }
  }
  onStatusChange(product, key?) {
    console.log(product)
    console.log(key)
    if (this.permissionsList.includes('Update')) {
      if (key) {
        product.packingInfo.startDate = (key == 'status') ? product.packingInfo.startDate : new Date();
        product.packingInfo.endDate = (key == 'status') ? new Date() : null;
        product.packingInfo.status = (key == 'status') ? 'Closed' : 'Open';
      }
      product.packingInfo.plannedCompletionDate = product.packingInfo.plannedCompletionDate ? new Date(product.packingInfo.plannedCompletionDate) : null;
      const form = {
        _id: this.filteredSO._id,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
        shipmentOrderLines: [
          {
            _id: product._id,
            packingInfo: product.packingInfo
          }
        ]
      }
      console.log(form);
      this.vasRestService.updateStatusForPackingCoReLabelling(form).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.shipmentOrder) {
            if(product.packingInfo.startDate && product.packingInfo.endDate){
              this.toastr.success("Completed Successfully")
            }
            else if(product.packingInfo.startDate){
              this.toastr.success("started succefssfuly");

            }
            // this.toastr.success('Completed successfully');
            /* event ? this.toastr.success("Assigned User Successfully") :
              (forStatus ? ((product.packingInfo.endDate) ? (this.toastr.success('Completed successfully')) :
                this.toastr.success('Started successfully')) : this.toastr.success("endDateUser Removed Successfully")); */

            this.selectedDocuments = [];
            this.fetchAllShipmentOrders();
          } else {
            this.toastr.error('Failed in completing');
          }
        },
        (error) => {
        });
    }
    else {
      this.toastr.error("User doesn't have permission");

    }
  }
  getPackingType(_product) {
    if (_product && _product.productMasterInfo && _product.productMasterInfo.productMasterID) {
      const product = this.products.find(product => product._id === _product.productMasterInfo.productMasterID);
      if (product && product.packageType) {
        return product.packageType;
      }
    }
    return undefined;
  }




  onWMSONoChange() {
    if (this.wmsoNumber) {
      const filteredSO = this.shipmentOrders.find(order => order.fullWmsoNumber === (this.wmsoNumber));
      if (filteredSO && filteredSO.hasOwnProperty('shipmentOrderLines')) {
        this.filteredSO = filteredSO;
        this.customerID = filteredSO.customerMasterInfo.customerID;
        this.customerName = filteredSO.customerMasterInfo.customerName;
        filteredSO['shipmentOrderLines'].forEach(line => {
          console.log(line);
          line['isChecked'] = false;
          if (line && line.packingInfo === null) {
            line.packingInfo = { status: 'Open', endDate: null };
          }
          else {
            if (line.packingInfo.plannedCompletionDate) {
              line.packingInfo.plannedCompletionDate = this.datePipe.transform(line.packingInfo.plannedCompletionDate, 'yyyy-MM-dd HH:mm')
            }
          }
        });
        this.shipmentOrderLines = filteredSO['shipmentOrderLines'];
        console.log(this.shipmentOrderLines);
        this.rerender();
      }
    }
  }
  onDocumentSelect(event, data) {
    this.shipmentOrderLines.map(element => element.isChecked = false);
    this.selectedDocuments = [];
    if (event.target.checked) {
      data.isChecked = true;
      this.selectedDocuments.push(data);
    }
    else {
      data.isChecked = false;
      this.selectedDocuments = this.selectedDocuments.filter(x => x._id != data._id);
    }
    // this.selectAllCheckboxValue = this.shipmentOrderLines.every(function (item: any) {
    //   return item.isChecked == true;
    // })
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
        }
      },
      (error) => {
      });
  }

  /* Pagination Concept */
  fetchAllD(page, event) {
    if (event) {
      this.fetchAllShipmentOrders(page, event.target.value);
    }
  }
  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = ValueAddedServiceScrees['valueAddedServicePackingSortFieldArrays'].find(x => x.key == headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.fetchAllShipmentOrders(1, this.itemsPerPage);
    }
    else {
    }
  }
  sortDirection: any = null;
  sortFields: any = null;
  page: number = 1;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;
  pageHeader: number = 1;
  fetchAllShipmentOrders(page?, pageSize?) {
    const form =
    {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "page": page ? page : 1,
      "pageSize": 100,
      "searchKeyword": this.searchKey,
      "searchOnKeys": null,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
    }
    this.outboundProcessService.findAllShipmentOrdersWithPagination(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrderPaginationResponse.shipmentOrders) {
          this.shipmentOrders = response.data.shipmentOrderPaginationResponse.shipmentOrders.filter(order => order.status === 'Open');
          this.wmsoNumbers = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(this.shipmentOrders, 'fullWmsoNumber'));
          this.onWMSONoChange();
        }
      },
      (error) => {
      });
  }

  /* 
  fetchAllShipmentOrders() {
    this.reqObj['organizationIDName'] = this.configService.getOrganization().organizationIDName;
    this.reqObj['wareHouseIDName'] = this.configService.getWarehouse().wareHouseIDName;
    this.outboundProcessService.fetchAllShipmentOrders(JSON.stringify(this.reqObj)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrders) {
          this.shipmentOrders = response.data.shipmentOrders.filter(order => order.status === 'Open');
          this.wmsoNumbers = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(this.shipmentOrders, "fullWmsoNumber"));
          this.onWMSONoChange();
        }
      },
      (error) => {
      });
  } */
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
    //this.forPermissionsSubscription.unsubscribe();
  }

}
