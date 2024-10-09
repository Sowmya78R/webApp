import { Injectable } from '@angular/core';
import { HttpReq } from '../shared/common/app.entity';
import { HttpService } from '../shared/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';

  printArray: any = [];

  constructor(private httpService: HttpService) { }

  saveOrUpdateProductBarcode(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'barcode/services/saveOrUpdateProductBarcodeConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchAllProductsBarcode(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'barcode/services/findByAllProductBarcodeConfigurations';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  
  fetchAllProductsBarcodeWithPagination(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'barcode/services/findProductBarcodeConfigurationBarcodes';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
 
  saveOrUpdateProcessBarcode(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'barcode/services/saveOrUpdateProcessBarcodeConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchAllProcessBarcode(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'barcode/services/findByAllProcessBarcodeConfigurations';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateBarcodeAccess(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'barcode/services/saveorUpdateProcessBarcodeAccessConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchAllBarcodeAccess(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'barcode/services/findByAllProcessBarcodeAccessConfigurations';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateBarcodeConfig(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'barcode/services/saveorUpdateBarcodeConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchAllBarcodeConfig(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'barcode/services/findAllBarcodeConfigurations';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchBarcodeByEAN(upcEANNumber) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `barcode/services/generateBarcode?upcEANNumber=${upcEANNumber}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }

  findGRNLinebyBarcodeNumber(data){
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `barcode/services/findGoodsReceiptProductDetailsByBarcode`;
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
}


