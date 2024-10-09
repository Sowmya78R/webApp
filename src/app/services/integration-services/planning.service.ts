import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable()
export class PlanningService {
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }
  // fetchInboundCapacityPlanning(details) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.contentType = 'applicationJSON';
  //   httpReq.url = `capacityplanning/inboundCapacityPlanningByDay?organizationIDName=${details.organizationIDName}&wareHouseIDName=${details.wareHouseIDName}`;
  //   httpReq.showLoader = true;
  //   httpReq.body = {};
  //   return this.httpService.restCall(httpReq);
  // }
  
  fetchInboundCapacityPlanning(details) {
    details['status'] = 'Open';
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `goodsReceipt/services/findProductDetailsOfInboundCapacityPlan`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  findOrdersforInbound(entity: any) {
    entity['status'] = 'Open';
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findGoodsReceiptForInboundCapacityPlan';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  findResourcePlanningforInbound(entity: any) {
    entity['status'] = 'Open';
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findResourceDetailsOfInboundCapacityPlan';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  findOrdersforOutbound(entity: any) {
    entity['status'] = 'Open';
    // entity['raiseSOStatus'] = 'Open';
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'salesOrder/services/findSalesOrdersForOutboundCapacityPlan';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  // fetchOutboundCapacityPlanning(details) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   httpReq.contentType = 'applicationJSON';
  //   httpReq.url = `capacityplanning/outBoundCapacityPlanningByDay?organizationIDName=${details.organizationIDName}&wareHouseIDName=${details.wareHouseIDName}`;
  //   httpReq.showLoader = true;
  //   httpReq.body = {};
  //   return this.httpService.restCall(httpReq);
  // }
  fetchOutboundCapacityPlanning(details) {
    details['status'] = 'Open';
    // details['raiseSOStatus'] = 'Open';
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `salesOrder/services/findProductDetailsOfOutboundCapacityPlan`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  findResourcePlanningforOutbound(entity: any) {
    entity['status'] = 'Open';
    // details['raiseSOStatus'] = 'Open';
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'salesOrder/services/findResourceDetailsOfOutboundCapacityPlan';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
}
