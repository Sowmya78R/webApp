import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable()
export class InboundMasterDataService {

  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }
  saveOrUpdateCustomer(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('customerMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'customer/services/saveorUpdateCustomer';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllCustomers(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `customer/services/findAllCustomerList?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  fetchCustomerByID(entityData,details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `customer/services/findCustomerDetailsByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateProductByCustomer(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('productByCustomerMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'product/services/saveorUpdateProductByCustomer';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  UpdateIndividualProductByCustomer(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'product/services/updateIndividualProductByCustomer';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllProductByCustomers(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'product/services/findByAllProductByCustomers';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchProductByCustomerByIDWithPagination(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'product/services/findAllProductByCustomersWithPagination';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchProductCustomerByID(entityData,details) {
    const encodedSyntax = encodeURIComponent(entityData);
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `product/services/findProductByCustomerByCustomerIDName?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `customerIDName=${encodedSyntax}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
}
