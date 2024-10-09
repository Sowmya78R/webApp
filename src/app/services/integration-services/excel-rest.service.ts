import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable({
  providedIn: 'root'
})
export class ExcelRestService {
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }

  saveWHBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/warehouseExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveZoneBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/zoneExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveRackBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/rackExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveLevelBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/levelExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  saveLocationBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/locationExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveLocationBulkdataNew(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/uploadLocations';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveVehicleBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/vehicleExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveEquipmentBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/equipmentExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveTeamBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/WareHouseTeam';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveCustomerBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/customerExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveSupplierBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/supplierExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveProductBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/productMasterExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveProductBulkdataNew(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/productMasterExcelUpdate';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  savePurchaseOrderBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/purchaseOrderExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveReplenishmentUploaddata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/replenishmentOrderMapExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveProductStrategyBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/productStrategyExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  savePickingStrategyBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/pickingStrategyExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  savePutawayStrategyBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/putawayStrategyExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveProductByCustomerBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/productByCustomerExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveProductBySupplierBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/productBySupplierExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveUOMBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/uomConversionExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  saveBORBulkdata(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/billofResourcesExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  TransportorUploadExcel(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/serviceProviderExcelUpload';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  columnExcelUpload(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/columnExcelUpload';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  vehicleByServiceProviderExcelUpload(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/vehicleByServiceProviderExcelUpload';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  inventoriesByExcelUpload(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'inventory/services/inventoryExcelUpload';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateOrganization(data: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('organizationMap', JSON.stringify(data));
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveOrUpdateOrganization';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllOrganizations(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllOrganizations';
    httpReq.showLoader = false;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  taxExcelUpload(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/taxMasterExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  productCategoryGroupExcelUpload(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON',
      httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/excelUpload/productCategoryGroupExcel';
    httpReq.showLoader = false;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

}

