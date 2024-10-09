import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable()
export class OutboundMasterDataService {

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
  fetchAllCustomers(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `customer/services/findAllCustomerList?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
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
    formData.append('customerMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'product/services/saveorUpdateProductByCustomer';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchProductCustomerByID(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'customer/services/findProductByCustomerDetailsByID';
    httpReq.showLoader = true;
    const data = `_id=${entityData}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateVehicle(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('vehicleMasterMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateVehicleMaster';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllVehicles() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllVehicleMaster';
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
}
