import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable({
  providedIn: 'root'
})
export class InboundProcessService {
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }
  closePO(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `goodsReceipt/services/closeGoodsReceiptByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${details._id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  // closePO(entityData: any,details) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.contentType = 'formEncoded';
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.url = `purchaseorder/services/closePurchaseOrder?organizationIDName=${details.organizationIDName}&wareHouseIDName=${details.wareHouseIDName}`;
  //   httpReq.showLoader = true;
  //   const data = `_id=${entityData}`;
  //   httpReq.body = data;
  //   return this.httpService.restCall(httpReq);
  // }
  updatePutawayStatus(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'putaway/services/updatePutAwayStatus';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
}



