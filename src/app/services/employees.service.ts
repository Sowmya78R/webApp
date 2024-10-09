import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpReq } from '../shared/common/app.entity';
import { HttpService } from '../shared/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }

  fetchAllemployesPutAwayPerformance(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'putaway/services/findPutawayManagementEmployeePerformanceReport';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
}
fetchAllemployesPicKingPerformance(entityData) {
  const httpReq: HttpReq = new HttpReq();
  httpReq.type = this.REST_TYPE_POST;
  httpReq.contentType = 'applicationJSON';
  httpReq.url = 'picking/services/findPickingEmployeePerformanceReport';
  httpReq.showLoader = true;
  httpReq.body = entityData;
  return this.httpService.restCall(httpReq);
}
fetchAllemployesInternalTransferPerformance(entityData) {
  const httpReq: HttpReq = new HttpReq();
  httpReq.type = this.REST_TYPE_POST;
  httpReq.contentType = 'applicationJSON';
  httpReq.url = 'internalTransfer/services/findInternalTransferEmployeePerformanceReport';
  httpReq.showLoader = true;
  httpReq.body = entityData;
  return this.httpService.restCall(httpReq);
}
fetchAllemployesPackingPerformance(entityData) {
  const httpReq: HttpReq = new HttpReq();
  httpReq.type = this.REST_TYPE_POST;
  httpReq.contentType = 'applicationJSON';
  httpReq.url = 'shipmentOrder/services/findPackingShipmentOrderEmployeePerformanceReport';
  httpReq.showLoader = true;
  httpReq.body = entityData;
  return this.httpService.restCall(httpReq);
}
fetchAllemployesRePackingPerformance(entityData) {
  const httpReq: HttpReq = new HttpReq();
  httpReq.type = this.REST_TYPE_POST;
  httpReq.contentType = 'applicationJSON';
  httpReq.url = 'shipmentOrder/services/findRePackingShipmentOrderEmployeePerformanceReport';
  httpReq.showLoader = true;
  httpReq.body = entityData;
  return this.httpService.restCall(httpReq);
}
fetchAllemployesCoPackingPerformance(entityData) {
  const httpReq: HttpReq = new HttpReq();
  httpReq.type = this.REST_TYPE_POST;
  httpReq.contentType = 'applicationJSON';
  httpReq.url = 'shipmentOrder/services/findCoPackingShipmentOrderEmployeePerformanceReport';
  httpReq.showLoader = true;
  httpReq.body = entityData;
  return this.httpService.restCall(httpReq);
}
fetchAllemployesLabellingPerformance(entityData) {
  const httpReq: HttpReq = new HttpReq();
  httpReq.type = this.REST_TYPE_POST;
  httpReq.contentType = 'applicationJSON';
  httpReq.url = 'shipmentOrder/services/findLabelingShipmentOrderEmployeePerformanceReport';
  httpReq.showLoader = true;
  httpReq.body = entityData;
  return this.httpService.restCall(httpReq);
}
fetchAllemployesLoadingPerformance(entityData) {
  const httpReq: HttpReq = new HttpReq();
  httpReq.type = this.REST_TYPE_POST;
  httpReq.contentType = 'applicationJSON';
  httpReq.url = 'goodsReceipt/services/findGoodsReceiptNoteEmployeePerformanceReport';
  httpReq.showLoader = true;
  httpReq.body = entityData;
  return this.httpService.restCall(httpReq);
}
fetchAllemployesUnLoadingPerformance(entityData) {
  const httpReq: HttpReq = new HttpReq();
  httpReq.type = this.REST_TYPE_POST;
  httpReq.contentType = 'applicationJSON';
  httpReq.url = 'goodsReceipt/services/findGoodsReceiptNoteEmployeePerformanceReport';
  httpReq.showLoader = true;
  httpReq.body = entityData;
  return this.httpService.restCall(httpReq);
}



}
