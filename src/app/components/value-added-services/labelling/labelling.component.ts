import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { DatePipe } from '@angular/common';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { TranslateService } from '@ngx-translate/core';
import { ValueAddedServiceScrees } from 'src/app/constants/paginationConstants';
@Component({
  selector: 'app-labelling',
  templateUrl: './labelling.component.html'
})
export class LabellingComponent implements OnInit, OnDestroy {
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
  customerName: any;
  products: any = [];
  filteredSO: any = {};
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Value-Added', "Labelling", Storage.getSessionUser());
  forPermissionsSubscription: any;
  selectedDocuments: any = [];
  wareHouseTeamsListIDs: CompleterData;
  wareHouseTeamsList: any = [];
  formObj = this.configService.getGlobalpayload();
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  constructor(
    private completerService: CompleterService, private configService: ConfigurationService,
    private outboundProcessService: OutboundProcessService,
    private datePipe: DatePipe,
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
      this.fetchAllExecutionIDName();
      this.fetchAllShipmentOrders(this.page,this.pageSize);
     this.fetchAllProducts();
    }
    this.getDisableEnableFields();
  }
  makeThisDsiable: boolean = false;
  getDisableEnableFields() {
    if (this.permissionsList.includes('View') && this.permissionsList.includes('Update')) {
      this.makeThisDsiable = false;
    }

    else if (this.permissionsList.includes('View')) {
      this.makeThisDsiable = true;
    }
  }
  fetchAllExecutionIDName() {
    const form = Object.assign(this.formObj, { 'workType': "Labeling" });
    this.commonDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
  }
  intoEmployee(event, attr) {
    if (this.permissionsList.includes('Update')) {
      if(attr.labelingInfo.assignedTo.length > 0){
        this.toastr.success("User assigned successfully");
      }
      else{
        this.toastr.success("No user Assigned ");
      }
    if (!event.relatedTarget) {
      this.onStatusChange(attr);
    }
  }
  else{
    this.toastr.error("user doesn't have permission");
  }
  }
  onStatusChange(product, key?) {
    if (this.permissionsList.includes('Update')) {
    if (key) {
      product.labelingInfo.startDate = (key == 'status') ? product.labelingInfo.startDate : new Date();
      product.labelingInfo.endDate = (key == 'status') ? new Date() : null;
      product.labelingInfo.status = (key == 'status') ? 'Closed' : 'Open';
    }
    product.labelingInfo.plannedCompletionDate = product.labelingInfo.plannedCompletionDate ? new Date(product.labelingInfo.plannedCompletionDate) : null;
    const form = {
      _id: this.filteredSO._id,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      shipmentOrderLines: [
        {
          _id: product._id,
          labelingInfo: product.labelingInfo
        }
      ]
    }
    this.vasRestService.updateStatusForPackingCoReLabelling(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrder) {
          if(product.labelingInfo.startDate && product.labelingInfo.endDate){
            this.toastr.success("Completed Successfully")
          }
          else if(product.labelingInfo.startDate){
            this.toastr.success("started succefssfuly");
          }
          /*  this.toastr.success('Completed successfully'); */
         /*  event ? this.toastr.success("Assigned User Successfully") :
          (forStatus ? ((product.labelingInfo.endDate) ? (this.toastr.success('Completed successfully')) :
           this.toastr.success('Started successfully')) : this.toastr.success("User Removed Successfully")); */
          this.selectedDocuments = [];
          this.fetchAllShipmentOrders();
        } else {
          this.toastr.error('Failed in completing');
        }
      },
      (error) => {
      });
    }
    else{
      this.toastr.error("use doesn't have permission")
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
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
        }
      },
      (error) => {
      });
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
        this.customerID = filteredSO.customerMasterInfo.customerID;
        this.customerName = filteredSO.customerMasterInfo.customerName;
        this.filteredSO = filteredSO;
        filteredSO['shipmentOrderLines'].forEach(line => {
          line['isChecked'] = false;
          if (line && line.labelingInfo === null) {
            line.labelingInfo = { status: 'Open', endDate: null };
          }
          else {
            if (line.labelingInfo.plannedCompletionDate) {
              line.labelingInfo.plannedCompletionDate = this.datePipe.transform(line.labelingInfo.plannedCompletionDate, 'yyyy-MM-dd HH:mm')
            }
          }
        });
        this.shipmentOrderLines = filteredSO['shipmentOrderLines'];
       // this.rerender();
      }
    }
    else if (!this.wmsoNumber) {

      console.log(this.shipmentOrderLines);
    }
  }

  
  
  /* Pagination Concept */
  fetchAllD(page, event) {
    if (event) {
      this.fetchAllShipmentOrders(page, event.target.value);
    }
  }
  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = ValueAddedServiceScrees['valueAddedServiceLabellingSortFieldArrays'].find(x => x.key == headerName);
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
  pageSize = 100;
  itemsPerPage = 5;
  totalItems: any;
  searchKey: any = null;
  pageHeader: number = 1;
  fetchAllShipmentOrders(page?,pageSize?) {
    console.log(page,pageSize)
    const form =
    {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "page": page ? page : 1,
      "pageSize": pageSize? pageSize:100,
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

 /*  fetchAllShipmentOrders() {
    this.reqObj['organizationIDName'] = this.configService.getOrganization().organizationIDName;
    this.reqObj['wareHouseIDName'] = this.configService.getWarehouse().wareHouseIDName;
    this.outboundProcessService.fetchAllShipmentOrders(JSON.stringify(this.reqObj)).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.shipmentOrders) {
          this.shipmentOrders = response.data.shipmentOrders.filter(order => order.status === 'Open');
          console.log(this.shipmentOrders);
          this.wmsoNumbers = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(this.shipmentOrders, 'fullWmsoNumber'));
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
