import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable({
  providedIn: 'root'
})
export class VASRestService {

  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }
  updateStatusForPackingCoReLabelling(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'shipmentOrder/services/updateShipmentOrderPackingRePackingAndLabelingByID';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateBillingPO(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('billingPurchaseOrderMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'billingpurchaseorder/services/saveorUpdateBillingPurchaseOrder';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  findBillingPurchaseOrderByID(id,details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `billingpurchaseorder/services/findBillingPurchaseOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  findAllBillingPurchaseOrders(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'billingpurchaseorder/services/findAllBillingPurchaseOrders';
    httpReq.showLoader = false;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  updateRaisePO(id,details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `billingpurchaseorder/services/billingPurchaseOrderRaisePO?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&raisePO=true`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  updateBillingPO(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'billingpurchaseorder/services/billingPurchaseOrderBillingPOStatus';
    httpReq.showLoader = true;
    const data = `_id=${id}&billingPOStatus=true`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  
  //   fetchBillingInvoiceDataByInvoice(id) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.contentType = 'formEncoded';
  //   httpReq.url = 'billingpurchaseorder/services/findBillingPurchaseOrderByID';
  //   httpReq.showLoader = true;
  //   const data = `_id=${id}`;
  //   httpReq.body = data;
  //   return this.httpService.restCall(httpReq);
  // }
}
