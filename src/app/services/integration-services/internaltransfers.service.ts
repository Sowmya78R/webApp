import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable({
  providedIn: 'root'
})
export class InternaltransfersService {


  //dataPassingInterTransfer:[];
  dataPassingPackingPlanning: any = [];
  dataPassingcoPacking: any = [];
  dataPassingRePacking: any = [];
  dataPassingLabelling: any = [];
  dataPassingInterTransfer: any = []
  passEmployeeIDNameValue: [];




  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }
  saveInternalTransfer(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'internalTransfer/services/saveInternalTransfer';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateInternalTransfer(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('internalTransferMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'internalTransfer/services/saveInternalTransfer';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllTransferPlanning(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'internalTransfer/services/findInternalTransfersToPlan';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updateplanningTransfers(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'internalTransfer/services/assignResourcesToInternalTransfer';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPlanningPacking(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/findPackingPlanShipmentOrdersWithPagination';
    /* httpReq.url = 'shipmentOrder/services/findPackingPlanShipmentOrders'; */
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updatePlanningPacking(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/assignResourcesToShipmentOrderPacking';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPlanningRePacking(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/findRePackingPlanShipmentOrders';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updatePlanningRePacking(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/assignResourcesToShipmentOrderRePacking';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPlanningCoPacking(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/findCoPackingPlanShipmentOrders';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updatePlanningCoPacking(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/assignResourcesToShipmentOrderCoPacking';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPlanningLabelling(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/findLabelingPlanShipmentOrders';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updatePlanningLabelling(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/assignResourcesToShipmentOrderLabeling';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInternalTransfers(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'internalTransfer/services/findAllInternalTransfers';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findAllInternalTransfersWithPagination(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'internalTransfer/services/findAllInternalTransfersWithPagination';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateCycleCounting(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('cycleCountingMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'cycleCounting/services/saveorUpdateCycleCounting';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllCycleCountings() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'cycleCounting/services/findAllCycleCountings';
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateInventoryAdjustment(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('inventoryAdjustmentMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/saveorUpdateInventoryAdjustment';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInventoryAdjustments(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `inventory/services/findAllInventoryAdjustments`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchAllInventoryAdjustmentsWithPagination(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `inventory/services/findAllInventoryAdjustmentsWithPagination`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchGRNEmployeeTask(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/findGoodsReceiptNotesToPlan';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updateLoadingPlanning(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'goodsReceipt/services/assignResourcesToGoodsReceiptNote';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
}