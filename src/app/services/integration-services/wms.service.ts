import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable()
export class WMSService {

  // passingVisibleData:any;

  passingDatafromCopacking: any;
  private dataSubject = new BehaviorSubject<any>(null);
  data$: Observable<any> = this.dataSubject.asObservable();
  getPutawayManagementList: any;



  updateData(data: any) {
    this.dataSubject.next(data);
  }

  /* CreatePO Component Passing Data */
  passingCreatePOData: any = []
  passedData: any = []
  PutawayTableList : any = []
  putawayHistoryDataPassing:any = []
  passedSupplierDetails: any = []
  passPurchasetOrderDetails = [];
  /* End */
  fieldsData: any = []
  pickingTableData: any = []
  pickingfieldsData: any = []
  assignedEmployee: any;
  completionPlannedDate: any;
  dataPassingInterTransfer: any = []
  passEmployeeIDNameValue: any = []
  wareHouseData: any = []
  passpackingCoPlanningData: any = []
  dataPassingRePackingData: any = []
  dataPassingLabellingData: any = []
  packingPlanningobjData: any = []
  repackingPlanningobjData: any = []
  coPackingPlanningobjData: any = []
  labelingPlanningobjData: any = []
  receivedThirdPartySpaceUtilizationObject: {};
  dataPassinspaceUtilizationBillingResponse: any = [];
  getFormDetails: any = [];
  PassEmployeeIDNameValue: any = [];
  PassCycleCounting: any = [];
  passTableData: any = [];
  passingFormDataValue: any = [];
  /*  goods receiving Reports pasing Variables */
  goodsReceivingReportsFormDataPassing: any = [];
  goodsReceivingReportsDisplayTableList: any = []
  goodsRecevingThirdPartyCustomerCheckAlocation: any;
  passingCalculationData: any;
  /* PutAway Form And Table */
  putawayFormDataPassing: any = []
  putAwaygReportsDisplayTableList: any = []
  /* Return Order Form And Table */
  returnOrderyFormDataPassing: any = []
  returnOrdergReportsDisplayTableList: any = [];
  /* Grn Stage Transaction Form And Table */
  grnStageTransactionFormDataPassing: any = [];
  grnStageTransactionReportsDisplayTableList: any = [];
  grnStageTransactionThirdPartyCustomersCheckAllocation: any;

  /*Grn Stage Summary Transaction Form And Table */
  grnStageSummaryFormDataPassing: any = []
  grnStageSummaryReportsDisplayTableList: any = [];
  /*Grn  Summary Transaction Form And Table */
  grnSummaryFormDataPassing: any = []
  grnsummaryreportrgirdPartCustomerCheckAllocation: any;
  grnSummaryReportsDisplayTableList: any = [];
  /*Grn  History Form And Table */
  grnHistoryFormDataPassing: any = []
  grnHistoryyReportsDisplayTableList: any = [];
  grnHistoryReportthirdPartyCustomersCheckAllocation: any;
  datePassingHideAndShow: any;
  totalProductWiseQtyObj = {}
  /*Inventory Summary Form And Table */
  inventorySummaryFormDataPassing: any = []
  inventorySummaryyReportsDisplayTableList: any = [];
  /*cycle Counting Form And Table */
  cycleCountingFormDataPassing: any = [];
  cycleCountingReportsDisplayTableList: any = [];
  /*Inventory Adjustments Form And Table */
  inventoryAdjustmentsFormDataPassing: any = [];
  inventoryAdjustmentssDisplayTableList: any = [];
  /*Inventory By Location Form And Table */
  inventoryByLocationFormDataPassing: any = [];
  inventoryByLocationsDisplayTableList: any = [];

  /* Remaining Reports  */
  /*Inventory By product Form And Table */
  inventoryByProductReportFormDataPassing: any = [];
  inventoryByProductReportsDisplayTableList: any = [];

  /*inventory Transaction Report Form And Table */
  inventoryTransactionReportReportFormDataPassing: any = [];
  inventoryTransactionReportDisplayTableList: any = [];

  /* inventory Transaction Details Report Form And Table*/
  inventoryTransactionDetailsReportFormDataPassing: any = [];
  inventoryTransactionDetailsReporttDisplayTableList: any = [];

  /* openSalesOrder Report Form And Table*/
  openSalesOrderFormDataPassing: any = [];
  openSalesOrderDisplayTableList: any = [];

  /*picking Report Form And Table*/
  pickingrFormDataPassing: any = [];
  pickingDisplayTableList: any = [];

  /*shipment  Form And Table*/
  shipmentFormDataPassing: any = [];
  shipmentDisplayTableList: any = [];
  shipmentReportthirdPartyCustomersCheckAllocation: any;

  /*New shipment order Form And Table*/
  makeThisVisible: any;
  NewshipmentorderFormDataPassing: any = [];
  NewshipmentorderDisplayTableList: any = [];
  newShipmentReportthirdPartyCustomersCheckAllocation: any;

  /*Shipment History Form And Table*/
  shipmentHistoryFormDataPassing: any = [];
  shipmentHistoryDisplayTableList: any = [];
  shipmentHistoryReportthirdPartyCustomersCheckAllocation: any;
  shipmentHistoryObjDisplay: any;

  /*spaceutilization History Form And Table*/
  spaceutilizationHistoryFormDataPassing: any = [];
  spaceutilizationHistoryDisplayTableList: any = [];

  /*spaceutilization Reports Form And Table*/
  spaceutilizationReportsFormDataPassing: any = [];
  spaceutilizationReportsDisplayTableList: any = [];
  spaceUtilizationWareHousepassing: any;

  // Locationavalibility
  locationavailabilityfromdatapassing: any = []
  locationavailabilityDisplayTableList: any = [];
  /* Invoiceing Main Screns */
  invoicingFirstTable: any;
  invoicingThirdPartyCheck: any;

  invoicingSecondTable: any;
  invoicingserialNumberCheckConfig

  /*Calculation SpaceUtilization*/

  /* Putaway planning Logo Image Display  */
  passingPutawayPlanningLogoImage: any;
  /* Putaway planning Logo Image Display  */


  completeCounting: any;
  partialCounting: any;
  notAvailableCounting: any;
  totalCountNumber: any;
  totalSpaceReqObjGetData: any;
  totalSpaceUomReqObjGetData: any;
  totalusableReqObjGetData: any
  totalUsuableSpaceUomReqObjGetData: any;
  dataPassingLoadingData: any;
  loadingformDataPassing: any;
  dataPassingUnLoadingData: any;
  unloadingformDataPassing: any;
  passpackingPlanningData: any;
  /* Goods Receiving Reports*/

  goodsReceivingShowFields: any;
  goodsReceivingReturnsFields: any;

  employeePerformanceFormDatapassing: any = [];

  passingPutawayEmployeePerformanceDataTableList: any = [];

  passingPickingEmployeePerformanceDataTableList: any = [];

  passingInternalTransfersEmployeePerformanceDataTableList: any = [];

  passingPackingListEmployeePerformanceDataTableList: any = [];

  passingrePackingListEmployeePerformanceDataTableList: any = [];

  passingcoPackingListEmployeePerformanceDataTableList: any = [];

  passingLabellingListEmployeePerformanceDataTableList: any = [];

  passingLoadingListEmployeePerformanceDataTableList: any = [];

  passingUnLoadingListEmployeePerformanceDataTableList: any = [];

  passingGRNListEmployeePerformanceDataTableList: any = [];

  passingShipmentOrderDataEmployeePerformanceDataTableList: any = []

  passingUnLoadingEmployeePerformanceDataTableList: any = [];

  passingGRNEmployeePerformanceDataTableList: any = [];

  passingSalesListDataEmployeePerformanceDataTableList: any = [];

  passingLabellingDataListInEmployeePerformance: any = [];

  passingInwardQualityCheckListInEmployeePerformance: any = [];

  passingOutwardQualityCheckInEmployeePerformance: any = [];

  public passingOrderRateDashboardData: any = new BehaviorSubject({});

  public NewshareFormData: any = new BehaviorSubject({});

  public abcDataSharing: any = new BehaviorSubject({});
  /* Employee Schedule */
  /* PutAway Planning */
  passingDataforThirdPartyCheckPutawayPlanning: any;
  printPutawayPlanningTableData = []


  passCurrentFormData: any;

  /* Print Data for Inward ChecLIst */
  inwardCheckListFormPassingData: any;
  goodsReceiptPrintResponseList: any;
  vehicleType: any;
  vehicleNumber: any;
  invoiceDate: any;
  packagingListAvailable: any;
  putawayDoneBy: any;
  putawayDoneDate: any;
  numberOfLines: any;
  orderedQuantity: any;
  numberOfDamagedLines: any;
  damagedQuantity: any;
  informedAboutDamage: any;
  containerNumber: any;
  invoiceTotalQuantity: any;
  customerDispatchQuantity: any;
  serObjectFOrTypeOFShipment = {}
  emptyVehicleWeight: any;
  waybillNumber: any;
  conditionOfParcel: any;
  remarks: any;
  verifiedBySupervisor: any;
  supervisorSignature: any;
  verifiedDate: any;
  docketNumber: any;
  typeOfShipment: any;
  supplierIDName: any;
  customerIDName: any;
  wareHouseIDName: any;
  completedDate: any;
  assignedTo: any;
  totalSupplierReceivedQuantity: any;
  lrNumber: any;
  modalReqPasssingData: {};
  passingInwardCheckListFormData: any;
  /* OutWard CheckList Data Print */
  outwardCheckListFormPassingData: any;

  modalReqOutWardFormPasssingData: any;
  passingOutWardCheckListFormData: any;
  outBoundObjPassingData = {}

  outBoundPickedBy: any
  outBoundTypeOfShipment: any;
  outBoundinvoiceDate: any;
  outBoundnumberOfLines: any;
  outBoundorderedQuantity: any;
  outBoundvehicleNumber: any;
  outBoundvehicleType: any;
  outBoundwaybillNumberDate: any;
  outBoundwaybillNumber: any;
  outBoundconditionOfParcel: any;
  outBoundremarks: any;
  outBoundshipToCustomer: any;
  outBoundweight: any;
  outBoundhandDeliveryInPerson: any;
  outBoundhandDeliveryInPersonDate: any;
  outBounddocketNumber: any;
  outBoundverifiedBy: any;
  outBoundcheckedBy: any;
  outBounddispatchQuantity: any;
  outBoundInvoiceQty: any;
  outBoundcustomersCustomerName: any;
  printOutwardCheckListData: any;
  outboundAssignedTo: any;
  outBoundvehicleDate: any;

  /* Employee Performance Details */
  dataPassingFortotalNetActualWorkDuration: any;
  dataPassingtotalNetDelayedTime: any;
  dataPassingTotalNetEarlyTime: any;
  dataPassingFortotalNetPlannedWorkDuration; any;

  /* Employees Perforance  */
  /* Unloading Screens */
  unLoadingScreensDataPassing: any;
  /* Inward Quality Check */
  overAllInwardShipQualityCheckDataDataPassing: any;
  /* Over All Grn Data Passing */
  overAllGRNDataPassing: any;
  /* Over all putaway */
  overAllPutawayDataPassing: any;
  /* Sales Order */
  overAllSalesorderDataPassing: any;
  /* overAllPickingData */
  overAllPickingDataPassing: any;
  /* overAllOutwardShipQualityCheckData */
  overAllOutwardShipQualityCheckDataPassing: any;
  /* Packing */
  overAllPackingDatapPassing: any;
  /* overAllRePackingData */
  overAllRePackingDataPassing: any;
  /* overAllCopackingData */
  overAllCopackingDataPassing: any;
  /* overAllLabellingData */
  overAllLabellingDataPassing: any;
  /* overAllShipmentOrderData */
  overAllShipmentOrderDataPassing: any;
  /* overAllOutwardShipLoadUnloadData */
  overAllOutwardShipLoadUnloadDataPassing: any;
  /* overAllInternalTransfersData */
  overAllInternalTransfersDataPassing: any;

  /* Purchase Request  */
  getValues: [];
  passingTableData: [];
  passingtotalquantityToOrder: any
  passingtotalcustomerQuantityToOrder: any
  passingtotalactualQuantityToOrder: any;


  public selectedValueSubject: BehaviorSubject<string> = new BehaviorSubject(null);

  setSelectedValue(selectedValue: string) {
    this.selectedValueSubject.next(selectedValue);
  }
  getSelectedValue(): Observable<string> {
    return this.selectedValueSubject.asObservable();
  }
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }
  productMasterData(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('productMasterMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'product/services/saveorUpdateProductMaster';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllProductsWithPaginations(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'product/services/findAllProductMastersWithPagination';
    // httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllProducts(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'product/services/findAllProductList';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchAllABCAnalyisGroup(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('abcGroupFilterMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = '';
    httpReq.url = 'common/services/getABCGroupByDateRange';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }


  fetchAllCycleCounting() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/findAllCycleCounting';
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  //cycleCounting
  fetchCycleCountingNew(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'common/services/findAllWareHouses';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  deleteProductDetailsByID(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'product/services/removeProductDetailsByID';
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateProductBySupplierData(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('productBySupplierMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = '';
    httpReq.url = 'product/services/saveorUpdateProductBySupplier';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  UpdateIndividualProductBySupplier(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'product/services/updateIndividualProductBySupplier';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveSupplierMasterData(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('supplierMasterMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'supplier/services/saveorUpdateSupplierMaster';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllSupplierDetails(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'supplier/services/findAllSupplierList';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  fetchOrderIDsForInvType(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/findInventoryTransactionOrderNumbersWithPagination';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  fetchAllLocationIndividualDetailss(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/findLocationAvailabilityReportFilters';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }

  fetchSupplierDetailsById(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `supplier/services/findSupplierDetailsByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchProductDetailsById(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `product/services/findProductDetailsByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchProductsBySupplier(entityData, details) {
    const encodedSyntax = encodeURIComponent(entityData);
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `product/services/findProductBySupplierBySupplierIDName?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `supplierIDName=${encodedSyntax}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchProductsBySupplierWithPagination(form){
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'product/services/findAllProductBySuppliersWithPagination';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = form;
    return this.httpService.restCall(httpReq);
  }

  fetchAllProductBySupplierData(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'product/services/findByAllProductBySuppliers';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchWareHouseDetailsByID(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/findWareHouseByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  saveOrUpdateWareHouseData(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('wareHouseMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateWareHouse';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdatePurchaseOrderData(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('purchaseOrderMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'purchaseorder/services/saveorUpdatePurchaseOrder';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  updateIndividualLineinPO(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'purchaseorder/services/updateIndividualPurchaseOrderLinesByID';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateRaisePO(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `purchaseorder/services/saveorUpdateRaisePO?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  rejectRaisePO(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `purchaseorder/services/rejectPurchaseOrder`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchPurchaseOrderByID(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `purchaseorder/services/findPurchaseOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  fetchPurchaseOrderByIDPagination(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `purchaseorder/services/findPurchaseOrderByIDWithPagination`
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPurchaseOrders(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'purchaseorder/services/findAllPurchaseOrders';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findAllPurchaseOrdersWithPagination(entityData, header?) {
    let url = `purchaseorder/services/findAllPurchaseOrdersWithPagination`;
    if (header) {
      url = `purchaseorder/services/findAllPurchaseOrdersWithPaginationOnHeader`
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllGoodsReceipts(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findAllGoodsReceipts';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findAllGoodsReceiptsWithPagination(entityData, header?) {
    let url = `goodsReceipt/services/findAllGoodsReceiptsWithPagination`
    if (header) {
      url = `goodsReceipt/services/findAllGoodsReceiptsWithPaginationOnHeader`
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  /* findAllGoodsReceiptManagementsWithPagination(entityData,details,page,pageSize) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `goodsReceipt/services/findAllGoodsReceiptManagementsWithPagination?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}page=${page}pageSize=${pageSize}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  } */
  getPurchaseReturnsOrderIDS(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findGoodsReceiptsToPurchaseReturns';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  goodsreceivingImportExcel(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/goodsReceiptExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  purchaseOrderImportExcel(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'purchaseorder/services/uploadPurchaseOrderExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  soUploadExcel(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'salesOrder/services/uploadSalesOrderExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  ITExcel(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'internalTransfer/services/uploadInternalTransferExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  
  issueInventoryExcel(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'salesOrder/services/uploadInventoryIssueExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  gateEntryExcel(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/uploadGoodsReceiptNoteExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllReceiveLocations(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/findAvailableReceiveLocationsForGoodsReceipt';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllReceiveLocationsWithPagination(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/findAvailableReceiveLocationsForGoodsReceiptWithPagination';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchCheckRecieveLoc(locName, locNameQuantity, pId, quantity, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `goodsReceipt/services/checkReceiveLocationsValidations?locationName=${locName}&locationNameQty=${locNameQuantity}&productMasterID=${pId}&quantity=${quantity}&organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = false;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  fetchAllReturnLocation(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/findAvailableReturnLocationsForGoodsReceiptWithPagination';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPickupLocations(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'salesOrder/services/findAvailableInventoriesForPickingWithPagination';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  fetchProductSalePrice(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'salesOrder/services/findProductSalePrice';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchProductTransferSalePrice(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'internalTransfer/services/findProductSalePriceDetails';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  checkInventoryinSalesOrder(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'salesOrder/services/validateInventoryAvailability';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  checkInvoiceForGRN(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/checkInvoiceStatus';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllReturnLocations() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/findAvailableReturnLocations';
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  // fetchGoodsReceiptByID(entityData, details) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.contentType = 'formEncoded';
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.url = `goodsReceipt/services/findGoodsReceiptByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
  //   httpReq.showLoader = true;
  //   const data = `_id=${entityData}`;
  //   httpReq.body = data;
  //   return this.httpService.restCall(httpReq);
  // }
  fetchGoodsReceiptByID(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `goodsReceipt/services/findGoodsReceiptByIDWithPagination`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchGRNLocations(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `goodsReceipt/services/findGoodsReceiptWithLocations`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchGoodsReceiptManagementByID(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `goodsReceipt/services/findGoodsReceiptManagementByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchGoodsReceiptManagementByIDPagination(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `goodsReceipt/services/findGoodsReceiptManagementByIDWithPagination`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateGoodsReceipt(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('goodsReceiptMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/saveorUpdateGoodsReceipt';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  updateIndividualGoodsReceipt(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/performGoodsReceive';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updateIndividualGoodsReceiptManagement(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/performGoodsReceiptManagement';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
 
  validateGRNLocations(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/validateGoodsReceiptLocations';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  validateGRNManagementLocations(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/validateGoodsReceiptManagementLocations';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  locationBasedOnProductWithZoneMapping(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findLocationBasedonProductWIthZoneMapping';
    httpReq.showLoader = true;
    const data = `productID=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  findAllPutawaySoftLocationsByGoodsReceiptByID(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `goodsReceipt/services/findAllPutawaySoftLocationsByGoodsReceiptID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `goodsReceiptID=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  insertPutAwayDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'putaway/services/insertPutawayDetails';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPutawaysBySupplierID(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'putaway/services/findAllPutawayBySupplierId';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  // Ware House Master Data
  fetchAllWarehouses(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'common/services/findAllWareHouses';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllWarehousesByGlobal(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'common/services/findAllWareHouseTransferConfigurations';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  // fetchWareHouses() {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.url = 'common/services/findAllWareHouses';
  //   httpReq.showLoader = true;
  //   httpReq.body = { 'pageNumber': "0", "pageSize": "10" };
  //   return this.httpService.restCall(httpReq);
  // }
  // saveOrUpdateWareHouseDetails(entityData) {
  //   const httpReq: HttpReq = new HttpReq();
  //   const formData = new FormData();
  //   formData.append('wareHouseMap', entityData);
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.url = 'common/services/saveorUpdateWareHouse';
  //   httpReq.showLoader = true;
  //   httpReq.body = formData;
  //   return this.httpService.restCall(httpReq);
  // }
  fetchAllZones(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'common/services/findAllZones';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchPallet(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllPalletConfigurations';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateZoneDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('zoneMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateZone';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllRacks(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'common/services/findAllRacks';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateRackDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('rackMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateRack';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllLevels(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllLevels';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateLevelDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('levelMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateLevel';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllLocations(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllLocations';
    httpReq.contentType = 'applicationJSON';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllLocationsWithPaginations(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'location/services/findAllLocationsWithPagination';
    httpReq.contentType = 'applicationJSON';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  filterLocationAvailbility(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/findLocationAvailabilityReport';
    httpReq.contentType = 'applicationJSON';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllLocationsById(idEntity, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `common/services/findLocationByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${idEntity}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAvailableLocations(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAvailableLocations';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateLocationDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('locationMasterMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateLocationMaster';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateProductStrategyDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('productStrategyMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateProductStrategy';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllProductStrategies(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllProductStrategies';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllProductCategories(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllProductCategories';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateProductCategory(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('productCategoryMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateProductCategory';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdatePutawayStrategyDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('putawayStrategyMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePutawayStrategy';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPutawayStrategies(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllPutawayStrategies';
    httpReq.showLoader = true;
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPutawayStrategyByID(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/findPutawayStrategyByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  UpdateIndividualPutawayStrategyByID(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'putaway/services/updateIndividualPutawayStrategyByID';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdatePickingStrategyDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('pickingStrategyMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePickingStrategy';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPickingStrategies(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllPickingStrategies';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchPickingStrategyByID(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/findPickingStrategyByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  UpdateIndividualPickingStrategyByID(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'picking/services/updateIndividualPickingStrategyByID';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findPORecentHistoryBySupplierID(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `purchaseorder/services/findPORecentHistoryBySupplierID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `supplierID=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  // Inventory
  saveOrUpdateInventoryDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('inventoryMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/saveorUpdateInventory';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  // completePutawaySerives(entityData) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.url = 'putaway/services/completePutaway';
  //   httpReq.showLoader = true;
  //   httpReq.contentType = 'applicationJSON';
  //   httpReq.body = entityData;
  //   return this.httpService.restCall(httpReq);
  // }
  saveOrUpdateInventoryRecieving(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('inventoryReceiveMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/saveorUpdateInventoryReceiving'
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  updateInventoryy(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/updateInventory';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findAllInventories(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `inventory/services/findAllInventories`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  findInventoriesForIT(details){
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `internalTransfer/services/findAvailableSourceInventoriesForInternalTransfer`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  findAllInventoriesWithPaginations(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `inventory/services/findAllInventoriesWithPagination`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  findUniqueInventoryLocations(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `inventory/services/findUniqueInventoryLocationNames?productIDName=${encodeURIComponent(details.productIDName)}&organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    return this.httpService.restCall(httpReq);
  }
  findAllInventoryReceivings() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/';
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  findAllWareHouseLayoutDetails(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `inventory/services/findWareHouseLayoutDetails?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  findWareHouseLayout(payload) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = `dashboards/findWareHouseLayout`;
    httpReq.showLoader = true;
    httpReq.body = payload;
    return this.httpService.restCall(httpReq);
  }
  findWareHouseLayoutforSupplierLogin(payload) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = `dashboards/findWareHouseLayoutBySupplier`;
    httpReq.showLoader = true;
    httpReq.body = payload;
    return this.httpService.restCall(httpReq);
  }

  getLocStatusInLayout(payload) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = `dashboards/findLocationSpaceUtilizationDetails`;
    httpReq.showLoader = true;
    httpReq.body = payload;
    return this.httpService.restCall(httpReq);
  }
  getSpaceUtilization(payload) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = `dashboards/findSpaceUtilization`;
    httpReq.showLoader = true;
    httpReq.body = payload;
    return this.httpService.restCall(httpReq);
  }
  fetchAllCrossDockingHistoryDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `salesOrder/services/findAllCrossDockingHistoryDetails`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  // advance Shipment Invoice
  saveOrUpdateAdvanceShipmentNotice(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('gateEntryMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateGateEntry';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllAdvanceShipmentNotice() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllGateEntrys';
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  fetchAllServiceProvider(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllServiceProviders';
    httpReq.showLoader = false;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  // Save Transportor

  saveOrUpdateServiceProvider(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('serviceProviderMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateServiceProvider';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }


  /* Find  All Vehicle Master */

  fetchAllVehicleMaster() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllVehicleMaster';
    httpReq.showLoader = false;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }

  /* Vehicle By Service provider */


  fetchAllVehicleServiceProvider(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `common/services/findAllVehicleByServiceProviders?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateVehiicleByupdateServiceProvider(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('VehicleByServiceProviderMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateVehicleByServiceProvider';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchServiceProviderServiceById(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/findVehicleByServiceProviderByID';
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateColumns(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveOrUpdateColumn';
    httpReq.showLoader = true;
    httpReq.body = `columnMap=${entityData}`;
    return this.httpService.restCall(httpReq);
  }
  fetchAllColumns(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllColumns';
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  saveTaxes(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveTaxMaster';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updateTaxes(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateTaxMaster';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchTaxes(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllTaxMasters';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchTaxesforOrder(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findTaxMasters';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateStates(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateCountryStateMaster';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchStates(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllCountryStateMasters';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPickingAnalysis(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'picking/services/openPickings';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  SaveUpdatePutAwayPlanningDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'putaway/services/updatePutawayAssignedTo';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  // SavePickingAnalysDetails(entityData) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.url = 'picking/services/updatePickingAssignedTo';
  //   httpReq.showLoader = true;
  //   httpReq.contentType = 'applicationJSON';
  //   httpReq.body = entityData;
  //   return this.httpService.restCall(httpReq);
  // }
  fetchAllEmployeeView() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'picking/services/openPickings';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  fetchInventoriesForSalesOrders(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'salesOrder/services/findSalesOrderLinesByCustomer';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }

  fetchAllEmployeeViewForPicking(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `picking/services/openPickingsForUser?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }

  fetchAllEmployeeViewForPutAway(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `putaway/services/openPutawaysForUser?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }

  // fetchAllPickingPlanningTableData(entityData) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.url = 'picking/services/pickingPlanning';
  //   httpReq.showLoader = true;
  //   httpReq.contentType = 'applicationJSON';
  //   httpReq.body = entityData;
  //   return this.httpService.restCall(httpReq);

  // }

  fetchAllPickingPlanningTableData(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'picking/services/pickingPlanning';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPickingWithPagination(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'picking/services/pickingPlanningWithPagination';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPickings(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'picking/services/findAllPickings';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  
  fetchAllPutAwayPlanningTableData(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'putaway/services/putawayPlanningWithPagination';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  putawayManagement(entityData){
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'putaway/services/putawayManagementPlanningWithPagination';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPickingManagementPlanning(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'picking/services/pickingManagementPlanningWithPagination';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  
  fetchAllPickingManagement(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'picking/services/findAllPickingManagementsWithPagination';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInventoryTransaction(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/findAllInventoryTransactions';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInventoryTransactionWithPagination(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/findAllInventoryTransactionsWithPagination';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInventoryTransactionDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/findAllInventoryTransactionDetails';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInventoryTransactionDetailsPagination(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/findAllInventoryTransactionDetailsWithPagination';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchAllAbcAnalysisClass(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllABCAnalysisClasses';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateAbcAnalysisClass(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('abcAnalysisClassMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateABCAnalysisClass';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }

  saveAbcGroup(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('dateRangeMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'wms/common/services/getABCGroupByDateRange';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllAbcGroup() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllABCGroup';
    httpReq.showLoader = false;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }

  fetchAllAbcAnalysisData(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('dateRangeMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/getABCGroupByDateRange';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  /*
  fetchAllAbcAnalysisData(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('datesMap', entityData);
    httpReq.url = 'wms/common/services/getABCGroupByDateRange';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  } */


  fetchAllAbcAnalysisDetails() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllABCGroup';
    httpReq.showLoader = false;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);

  }

  saveorUpdateWareHouseTransfer(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/saveorUpdateWareHouseTransfer';
    httpReq.showLoader = false;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  updateWareHouseTransfer(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/updateSourceWareHouseTransfer';
    httpReq.showLoader = false;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updateDraft(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/draftWareHouseTransferUpdate';
    httpReq.showLoader = false;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  getWareHouseTransferDetails(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/findAllWareHouseTransfers';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  
  getWTDetailsHeaderWithPaginations(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/findAllWareHouseTransfersWithPaginationOnHeader';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  getWareHouseTransferDetailsWithPaginations(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/findAllWareHouseTransfersWithPagination';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  getWareHouseTransferDetailsbyId(entityData, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `internalTransfer/services/findWareHouseTransferByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getWTDetailsByIDPaginations(entityData){
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `internalTransfer/services/findWareHouseTransferByIDWithPagination`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  validateWareHouseTransfer(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/validateWareHouseTransferDetails';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  transferWareHouse(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/transferWareHouseDetails';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  rejectWareHouseRequest(jsonBody, form) {
    let url = 'internalTransfer/services/rejectWareHouseTransfer';
    if (form) {
      url = url + `Creation`
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  getAvailInventory(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/getAvailableInventory';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  getWarehouseTransferLines(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    // httpReq.url = 'internalTransfer/services/findWareHouseTransferLines';
    httpReq.url = 'internalTransfer/services/findWareHouseTransferLinesWithPagination';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  getNewWarehouseTransferLines(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    // httpReq.url = 'internalTransfer/services/findNewWareHouseTransferLines';
    httpReq.url = 'internalTransfer/services/findNewWareHouseTransferLinesWithPagination';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  getWarehouseTransferPriceMulti(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/getWareHouseTransferPricingDetails';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  getProductFiltersData(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'product/services/findProductFilters';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  saveDraftWarehouseTransfer(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/draftWareHouseTransfer';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  getManualLocationsForWarehouseTransfer(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/findAvailableInventoryDetails';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  getInventoryDetailsWithPagination(jsonBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'internalTransfer/services/findAvailableInventoryDetailsWithPagination';
    httpReq.showLoader = false;
    httpReq.body = jsonBody;
    return this.httpService.restCall(httpReq);
  }
  viewProductImages(fileName) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    // formData.append('fileName', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `fileStore/services/viewFile?fileName=${fileName}`;
    httpReq.showLoader = true;
    // httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  saveThirdPartySpaceUtilization(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'thirdParty/services/saveThirdPartySpaceUtilization';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  generateSpaceUtilization(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'thirdParty/services/generateThirdPartySpaceUtilization';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchThirdPartySpaceUtilization(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'thirdParty/services/findAllThirdPartySpaceUtilizationsWithPagination';
    /*  httpReq.url = 'thirdParty/services/findAllThirdPartySpaceUtilizations'; */
    httpReq.showLoader = false;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updateThirdPartySpaceUtilization(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'thirdParty/services/updateThirdPartySpaceUtilization';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllBillingSpaceUtiliztion(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'thirdParty/services/findThirdPartySpaceUtilizationReport';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  /* Oder Rate Volume Filter Dashboard */

  fetchAllPutawayInboundOutboundDashboardsGraphDetail(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPutawaysCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInternalTransferInboundOutboundDashboardsGraphDetail(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findInternalTransfersCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInternalAdjustmentsInboundOutboundDashboardsGraphDetail(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findInventoryAdjustmentsCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPickingInboundOutboundDashboardsGraphDetail(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPickingsCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPackingOutboundDashboardsGraphDetail(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPackingShipmentOrderCountOverview';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllRepackingInboundOutboundDashboardsGraphDetail(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findRePackingShipmentOrderCountOverview';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllCopackingInboundOutboundDashboardsGraphDetail(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findCoPackingShipmentOrderCountOverview';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllLabelligInboundOutboundDashboardsGraphDetail(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findLabelingShipmentOrderCountOverview';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllCycleCountingDashboardsGraphDetail(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPickingsCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  /* Daily Operation */

  goodsReceiptNotesDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findGoodsReceiptNotesCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  putawayCompletedDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPutawaysCompletedCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  pickingCompletedDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPickingsCompletedCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  purchaseOrderDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPurchaseOrdersCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  salesOrderDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findSalesOrdersCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  shipmentOrderDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findShipmentOrdersCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  replishmentOrderHistoryDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findReplenishmentOrderHistorysCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  goodsReceiptCountDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findGoodsReceiptsCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  packingShipmentOrdersDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPackingShipmentOrdersCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  rePackingShipmentOrdersDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findRePackingShipmentOrdersCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  coPackingShipmentOrdersDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findCoPackingShipmentOrdersCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  labellingDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findLabelingShipmentOrdersCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  tableObjectCountDailyOperationsDashboard(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findOrdersCount';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  /* Inward Check List  */
  fetchAllInwardCheckListData(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findInwardCheckList';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllOutwardCheckListData(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findOutwardCheckList';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  /* Scheduler Screen Details */
  savOrUpdateScreenDetailsScreensDetails(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'thirdParty/services/saveorUpdateThirdPartySpaceUtilizationScheduleConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchALLScreenDetailsScreensDetails(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'thirdParty/services/findAllThirdPartySpaceUtilizationScheduleConfigurations';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  SaveOrUpdateApplicationUrl(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/saveorUpdateApplicationURL';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  SaveOrUpdateFinancialYearConfig(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/saveOrUpdateFinancialYearConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllApplicationUrl(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllApplicationURLs';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllFinancialYearConfig(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/findAllFinancialYearConfigurations';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchFinancialYearConfigByDates(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/findFinancialYearConfigurationByDates';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  saveProductCategorygroup(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'product/services/saveorUpdateProductCategoryGroup';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  updateProductCategorygroup(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'product/services/updateProductCategoryGroup';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }

  fetchAllProductCategoryGroups(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'product/services/findAllProductCategoryGroups';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdatePromotions(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/saveorUpdatePromotion';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPromotions(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllPromotions';
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdatePromotionsPolicy(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/saveorUpdatePromotionPolicy';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPromotionsPolicy(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllPromotionPolicys';
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  generatePurchaseRequest(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'purchaserequisition/services/findPurchaseOrderRequisitions';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  generatePOFromPR(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'purchaserequisition/services/generatePurchaseOrder';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
}
