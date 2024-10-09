import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';
import { BehaviorSubject } from 'rxjs';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  constructor(private httpService: HttpService, private configService: ConfigurationService) { }

  public shareFormData: any = new BehaviorSubject({});

  formObj = this.configService.getGlobalpayload();




  // public shareFormData: any = new BehaviorSubject({});

  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';

  findAllDashboardCountList(orgIDName, warehouseIDName, orderType) {
    const body = { "orderType": orderType };
    // if (orderType === 'WareHouseTransfer') {
    body['organizationIDName'] = orgIDName;
    body['wareHouseIDName'] = warehouseIDName;
    // }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `dashboards/findAllDashboardCountList?organizationIDName=${encodeURIComponent(orgIDName)}&wareHouseIDName=${encodeURIComponent(warehouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = body;
    return this.httpService.restCall(httpReq);
  }
  findAllPutawayAndPickingCountList(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `dashboards/completeAndIncompleteputAwayAndPickingList?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  findAllActivePurchaseOrders(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPurchaseOrdersForDashboard';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  /*  const httpReq: HttpReq = new HttpReq();
   httpReq.type = this.REST_TYPE_POST;
   httpReq.contentType = 'formEncoded';
   httpReq.url = `purchaseorder/services/fetchAllPurchaseOrders?organizationIDName=${orgIDName}&wareHouseIDName=${wareHouseIDName}`;
   httpReq.showLoader = true;
   httpReq.body = `recieptType=${type}`;
   return this.httpService.restCall(httpReq); */

  findAllActiveShipmentOrders(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `shipmentOrder/services/fetchAllActiveShipmentOrders`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findAllZoneCapacity(orgIDName, wareHouseIDName) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `dashboards/totalZoneCapacity?organizationIDName=${encodeURIComponent(orgIDName)}&wareHouseIDName=${encodeURIComponent(wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  findTopProductsInInvetory(orgIDName, wareHouseIDName) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `dashboards/topProductsInInventory?organizationIDName=${encodeURIComponent(orgIDName)}&wareHouseIDName=${encodeURIComponent(wareHouseIDName)}`;;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  findTopSellingProducts(orgIDName, wareHouseIDName) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `dashboards/topSellingProducts?organizationIDName=${encodeURIComponent(orgIDName)}&wareHouseIDName=${encodeURIComponent(wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  fetchStockInInventory(details, supplierIDName) {
    const bodyValues = details;
    bodyValues["supplierIDName"] = supplierIDName;
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `dashboards/stockInInventory?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = bodyValues;
    return this.httpService.restCall(httpReq);
  }
  fetchYearWiseMonthWiseInventory(year) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('dateString', year);
    formData.append('wareHouseIDName', this.configService.getWarehouse().wareHouseIDName);
    formData.append('organizationIDName', this.configService.getOrganization().organizationIDName);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'dashboards/YearAndMonthProductWiseTotalQuantityInventory';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }

  fetchYearWiseProductWiseTotalQuantityInventory(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    // const formData = new FormData();
    // formData.append('dateString', null);
    // formData.append('organizationIDName', details.organizationIDName);
    // formData.append('wareHouseIDName', details.wareHouseIDName);
    httpReq.url = `dashboards/YearWiseProductWiseTotalQuantityInventory?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&dateString=null&orderType=${details.orderType}`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchYearWiseSalesAndReturnOrderSummary(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `dashboards/yearWiseSalesAndReturnOrderSummary?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    // httpReq.body = {"orderType":details.orderType}
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchWarehouseCapacity(warehouseName, details) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('wareHouseName', warehouseName);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `dashboards/wareHouseCapacityLoacationWise?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchInventoryAccuracy(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findInventoryAccuracy';
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
 /*  fetchInventoryAccuracy(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'dashboards/findInventoryAccuracy';
    httpReq.showLoader = true;
    httpReq.body = `datesMap=${data}`;
    re turn this.httpService.restCall(httpReq);
  }*/
  /* Inbound DashBoard */
  fetchAllPendingGoodsReceiving(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `reports/findPendingReceivingGoodsReceiptOrderDetails?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPendingPutawaySoftLocationDetails(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `reports/findPendingPutawaySoftLocationDetails?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }

  findPendingLocationAllocationGoodsReceiptManagementOrderDetails(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `reports/findPendingLocationAllocationGoodsReceiptManagementOrderDetails?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  findALLPendingPutaway(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `reports/findPendingPutawayDetails?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = details
    return this.httpService.restCall(httpReq);
  }

  /* Outbound Sales Order */
  fetchAllPendingSalesOrder(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `reports/findPendingSalesOrderDetails?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`
    httpReq.showLoader = true;
    httpReq.body = { "orderType": details.orderType };
    return this.httpService.restCall(httpReq);
  }
  fetchAllPendingShipmentDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/findPendingShipmentOrderDetails';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPendingPickingDetails(orgIDName, wareHouseIDName, orderType) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `reports/findPendingPickingDetails?organizationIDName=${encodeURIComponent(orgIDName)}&wareHouseIDName=${encodeURIComponent(wareHouseIDName)}`;;
    httpReq.showLoader = true;
    httpReq.body = { "orderType": orderType }
    return this.httpService.restCall(httpReq);
  }
  spaceUtilizationDetails() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/wareHouseWiseSpaceUtilization';
    httpReq.showLoader = true;
    httpReq.body = {}
    return this.httpService.restCall(httpReq);
  }
  fetchAllCustomerWiseDetails(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findOrderTypeResourceWiseSalesOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllProductWiseSalesOrderDetails(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductWiseSalesOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllSupplierWisePurchaseOrders(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findOrderTypeResourceWisePurchaseOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllSupplierWisePurchaseReturn(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findOrderTypeResourceWiseGoodsReceiptManagements';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllSupplierWisePurchaseReceived(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findOrderTypeResourceWiseGoodsReceiptManagements';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }

  fetchAllProductWisePurchaseOrders(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductWisePurchaseOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }


  fetchAllProductWisePurchaseReturns(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductWiseGoodsReceiptManagements';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }

  fetchAllProductWisePurchaseReceived(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductWiseGoodsReceiptManagements';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllCategoryWisePurchaseOrders(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductCategoryWisePurchaseOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllCategoryWisePurchaseReturns(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductCategoryWiseGoodsReceiptManagements';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllCategoryWisePurchaseReceived(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductCategoryWiseGoodsReceiptManagements';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllCategoryWiseSalesOrder(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductCategoryWiseSalesOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAlllocationWisePurchaseOrder(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findLocationWisePurchaseOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAlllocationWisePurchaseReturn(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findLocationWiseGoodsReceiptManagements';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAlllocationWisePurchaseReceived(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findLocationWiseGoodsReceiptManagements';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAlllocationiseSalesOrder(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findLocationWiseSalesOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllSalesOrderGraph(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findSalesOrdersVsDate';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllSalesAnalyticsShipmentOrderGraph(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findShipmentOrdersVsDate';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  // fetchAllShipmentOrderGraph(entity: any) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.contentType = 'applicationJSON';
  //   httpReq.url = 'dashboards/findShipmentOrdersVsDate';
  //   httpReq.showLoader = true;
  //   httpReq.body = entity
  //   return this.httpService.restCall(httpReq);
  // }

  fetchAllShipmentOrderLocationWiseGraph(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findLocationWiseShipmentOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }

  fetchAllShipmentOrderCategoryWiseGraph(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductCategoryWiseShipmentOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllShipmentOrderCustomernWiseGraph(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findOrderTypeResourceWiseShipmentOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllShipmentOrderProductWiseGraph(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findProductWiseShipmentOrders';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }

  fetchAllPurchaseOrderGraph(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findPurchaseOrdersVsDate';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchAllPurchaseReceivedGraph(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findGoodsReceiptManagementsVsDate';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }

  fetchAllPurchaseReturnGraph(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findGoodsReceiptManagementsVsDate';
    httpReq.showLoader = true;
    httpReq.body = entity
    return this.httpService.restCall(httpReq);
  }
  fetchSpaceUtilisationForGraphy(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findZoneSpaceUtilization';
    httpReq.showLoader = true;
    httpReq.body = data
    return this.httpService.restCall(httpReq);
  }
  fetchOrderFillRateDetails(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findShipmentOrdersVolumeVsDate';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchPerfectVolumeVsDate(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findShipmentOrdersPerfectVolumeVsDate';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  
  fetchonTimeDeliveryVolVsDate(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/findShipmentOrdersOntimeDeliveryVolumeVsDate';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAgeingReport(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/inventoryAgeingReport';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchOverAllInventoryReport(entity: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/overallInventoryReport';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
}
