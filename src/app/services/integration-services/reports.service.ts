import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable()
export class ReportsService {
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }

  myListhere :any;

  fetchGoodsReceivingReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('goodsRecievingReportMap', data);
    httpReq.url = 'reports/goodsRecievingReport';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchInventoryReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('inventorySummaryMap', data);
    httpReq.url = 'reports/inventorySummaryReport';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchPutawayReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('putAwayReportMap', data);
    httpReq.url = 'reports/putAwayReport';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchPickListReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('pickListReportMap', data);
    httpReq.url = 'reports/pickListReport';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchPickingReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('pickingReportMap', data);
    httpReq.url = 'reports/pickingReport';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchShipmentOrderReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('shipmentOrderReportMap', data);
    httpReq.url = 'reports/shipmentOrderReport';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllReturnOrderReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('returnOrderReportMap', data);
    httpReq.url = 'reports/returnOrderReport';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchInventoryAdjustmentReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('inventoryAdjustmentReportMap', data);
    httpReq.url = 'reports/inventoryAdjustmentReport';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  // fetchCycleCountingReport(data) {
  //   const httpReq: HttpReq = new HttpReq();
  //   httpReq.type = this.REST_TYPE_POST;
  //   const formData = new FormData();
  //   formData.append('cycleCountingReportMap', data);
  //   httpReq.url = 'reports/cycleCountingReport';
  //   httpReq.showLoader = true;
  //   httpReq.body = formData;
  //   return this.httpService.restCall(httpReq);
  // }
  
  fetchCycleCountingReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/findCycleCountingReport';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchOpenSalesOrderReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    const formData = new FormData();
    formData.append('openSaleOrderReportMap', data);
    httpReq.url = 'reports/openSaleOrderReport';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  /* Invetory Reports  */

  fetchInventoryByLocation(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'reports/inventoryByLocationReport';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  fetchInventoryByProduct(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'reports/inventoryByProductReport';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  fetchAllGrnHistoryReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'reports/findGoodsReceiptManagementHistoryReport';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllShipmentOrderHistoryReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/findShipmentOrderHistoryReport';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  /*   const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/findShipmentOrderHistoryReport';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq); */
  }
  fetchProductTotal(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/inventoryProductTotalsReport';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  /* New Three Reports */
 /*
  fetchrGRNStageTransaction(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'reports/findGoodsReceiptStageReportDetails';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  } */

  fetchrGRNStageTransaction(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/findGoodsReceiptStageReportDetails';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  fetchGRNSummary(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/findGoodsReceiptSummaryReportWithPagination';
   /*  httpReq.url = 'reports/findGoodsReceiptSummaryReport'; */
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  fetchrGRNStageSummary(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/findGoodsReceiptStageReportDetailsByProductGrouping';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  /*
  fetchrGRNStageSummary(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = "application/json"
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'reports/findGoodsReceiptStageReportDetailsByProductGrouping';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  } */
  fetchNewShipmentOrderReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/shipmentOrderSerialNumberWiseReport';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllSpaceutilizationHistoryReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'dashboards/wareHouseWiseSpaceUtilizationHistory';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllSpaceutilizationReport(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'reports/findOverallSpaceUtilization';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

}
