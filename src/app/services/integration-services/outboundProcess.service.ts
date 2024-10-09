import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable()
export class OutboundProcessService {
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }
  saveOrUpdateSalesOrder(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('salesOrderMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'salesOrder/services/saveorUpdateSalesOrder';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }

  updateSalesOrder(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'salesOrder/services/updateSalesOrder';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  updateIndividualLineinSalesOrder(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'salesOrder/services/updateIndividualSalesOrderLinesByID';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchAllSalesOrders(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'salesOrder/services/findAllSalesOrders';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findAllSalesOrdersWithPagination(entityData: any, header?) {
    let url = `salesOrder/services/findAllSalesOrdersWithPagination`;
    if (header) {
      url = `salesOrder/services/findAllSalesOrdersWithPaginationOnHeader`;
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllActiveSalesOrders(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'salesOrder/services/fetchAllSalesOrders';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  // fetchSalesOrderByID(entityData: any, details) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.contentType = 'formEncoded';
  //   httpReq.url = `salesOrder/services/findSalesOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
  //   httpReq.showLoader = true;
  //   httpReq.body = `_id=${entityData}`;
  //   return this.httpService.restCall(httpReq);
  // }
  fetchSalesOrderByID(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `salesOrder/services/findSalesOrderByIDWithPagination`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchSalesOrderByIDWithPagination(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `salesOrder/services/findSalesOrderByIDWithPagination`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateRaiseSO(entityData: any, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `salesOrder/services/saveorUpdateRaiseSO?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `soID=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  validateRaiseSO(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `salesOrder/services/validateInventoryAvailabilityWithSalesOrder`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  validateBackOrder(details: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `shipmentOrder/services/validateBackOrder?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${details._id}`;
    httpReq.showLoader = true;
    // httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  checkInventoryforSalesOrder(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `salesOrder/services/findInventoryWithSalesOrder`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findSORecentHistoryByCustomerID(entityData: any, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `salesOrder/services/findSORecentHistoryByCustomerID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `customerID=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPickings(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'picking/services/findAllPickings';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllShipmentOrders(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'shipmentOrder/services/findAllShipmentOrderByCustomerID';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findAllShipmentOrdersWithPagination(entityData: any, header?) {
    let url = `shipmentOrder/services/findAllShipmentOrdersWithPagination`;
    if (header) {
      url = `shipmentOrder/services/findAllShipmentOrdersWithPaginationOnHeader`
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchShipmentOrderByID(entityData: any, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `shipmentOrder/services/findShipmentOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = `_id=${entityData}`;
    return this.httpService.restCall(httpReq);
  }
  fetchShipmentOrderByIDPagination(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `shipmentOrder/services/findShipmentOrderByIDWithPagination`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  // fetchShipmentOrderManagementByID(entityData: any, details) {
  //   const bodyJ = { _id: entityData }
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.contentType = 'formEncoded';
  //   httpReq.url = `shipmentOrder/services/findShipmentOrderManagementByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
  //   httpReq.showLoader = true;
  //   httpReq.body = `_id=${entityData}`;
  //   return this.httpService.restCall(httpReq);
  // }
  fetchShipmentOrderManagementByID(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `shipmentOrder/services/findShipmentOrderManagementByIDWithPagination`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchShipmentOrderManagementByWMSONumber(entityData: any, details) {
    const bodyJ = { _id: entityData }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `shipmentOrder/services/findShipmentOrderManagementByWmsoNumber?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&wmsoNumber=${entityData.wmsoNumber}`;
    httpReq.showLoader = true;
    return this.httpService.restCall(httpReq);
  }
  updateIndividualShipmentOrder(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/updateIndividualShipmentOrderByID';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  updateShipmentOrder(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/updateShipmentOrder';
    httpReq.showLoader = true;
    const data = entityData;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  closeSalesOrder(entityData: any, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `salesOrder/services/closeSalesOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdatePicking(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'picking/services/saveorUpdatePicking';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateShipmentOrder(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('shipmentOrderMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/saveorUpdateShipmentOrder';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  closeShipmentOrderByID(entityData: any, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `shipmentOrder/services/closeShipmentOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData._id}&isBackOrder=${entityData.isBackOrder}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  // updatePickAllStatus(entityData: any) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.contentType = 'applicationJSON';
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.url = 'picking/services/updatePickingStatus';
  //   httpReq.showLoader = true;
  //   const data = entityData;
  //   httpReq.body = data;
  //   return this.httpService.restCall(httpReq);
  // }
  findAllReplenishmentOrderHistoryDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'salesOrder/services/findAllReplenishmentOrderHistoryDetails';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchReplenishmentOrders(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllReplenishmentOrderMetaDetails';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateReplenishmentOrder(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('replenishmentOrderMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'product/services/saveOrUpdateReplenishmentOrder';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  updateReplenishmentOrderHistory(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'salesOrder/services/updateReplenishmentOrderHistory';
    httpReq.showLoader = true;
    httpReq.body = `_id=${data.id}&status=${data.status}`;
    return this.httpService.restCall(httpReq);
  }
  fetchInvoiceByID(entityData: any, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `shipmentOrder/services/findInvoiceByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = `_id=${entityData}`;
    return this.httpService.restCall(httpReq);
  }
  fetchInvoiceReport(body) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `shipmentOrder/services/findInvoiceByProductGroup`;
    httpReq.showLoader = true;
    httpReq.body = body;
    return this.httpService.restCall(httpReq);
  }
  fetchInvoiceReporthsnCode(body) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `shipmentOrder/services/findInvoiceByHsnCodeGroup`;
    httpReq.showLoader = true;
    httpReq.body = body;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInvoices(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'shipmentOrder/services/findAllInvoice';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInvoicesWithPagination(entityData, header?) {
    let url = `shipmentOrder/services/findInvoicesWithPaginationByProductGrouping`;
    if (header) {
      url = `shipmentOrder/services/findAllInvoicesWithPaginationOnHeader`;
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  UpdateIndividualInvoiceLineByID(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'shipmentOrder/services/updateIndividualInvoiceByID';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  closeInvoicing(entityData: any, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `shipmentOrder/services/closeInvoice?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
   firstTable(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'salesOrder/services/findInventoryIssueDetails';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  // saveOrUpdateInventoryIssue(entityData: any) {
  //   const httpReq: HttpReq = new HttpReq();
  //   const formData = new FormData();
  //   formData.append('replenishmentOrderMap', entityData);
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.url = 'product/services/saveOrUpdateInventoryIssue';
  //   httpReq.showLoader = true;
  //   httpReq.body = formData;
  //   return this.httpService.restCall(httpReq);
  // }
  saveOrUpdateInventoryIssue(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'salesOrder/services/saveorUpdateInventoryIssue';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  secondTable(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    /*  httpReq.url = 'salesOrder/services/findAllInventoryIssues'; */
    httpReq.url = 'salesOrder/services/findAllInventoryIssuesWithPagination';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
}

