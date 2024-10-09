import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';

@Injectable()
export class DeletionService {
  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }
  deleteVehicleRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/vehicleSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteCustomerRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `customer/services/customerSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteProductRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `product/services/productSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteSupplierRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `supplier/services/supplierSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteServiceProvider(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/serviceProviderDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  deleteVehicleByServiceProvider(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/vehicleByServiceProviderSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteProductBySupplierRecord(id, productMasterID, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `product/services/productBySupplierSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false&productMasterID=${productMasterID}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteProductByCustomerRecord(id, productMasterID, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `product/services/productByCustomerSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false&productMasterID=${productMasterID}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteWarehouseRecord(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/wareHouseSoftDelete';
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteZoneRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/zoneSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteRackRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/rackSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteLevelRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/levelSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteLocationRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/locationSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteProductStrategyRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/productStrategySoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deletePutawayStrategyRecord(id, zoneId, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/putawayStrategySoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false&zoneID=${zoneId}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  deletePickingStrategyRecord(id, zoneID, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/pickingStrategySoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false&zoneID=${zoneID}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  deletePackigTypeRecordDetails(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/packingTypeSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false&`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteWarehouseTeamRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/warehouseTeamSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteUserRecord(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/userSoftDelete';
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteReplenishmentRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/replenishmentOrderMapSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  deleteEquipmentRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `capacityplanning/equipmentMasterSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteBillToAddressRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/BillToAddressSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteBillOfResourceRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `capacityplanning/billOfResourcesSoftDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteBillingPORecord(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'billingpurchaseorder/services/billingPurchaseOrderDelete';
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteUOMRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `uom/services/uomDelete?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteReturnLocationMap(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/returnLocationMapSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteOrganization(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/organizationSoftDelete';
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteTaxMaster(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `common/services/deleteTaxMasterByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteStateMaster(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `common/services/deleteCountryStateMasterByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteDamagedStock(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `putaway/services/deletePutawayDamagedStock?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteReplacementOrder(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `picking/services/deleteReplacementOrder?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteWareHouseConfig(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'configuration/services/wareHouseConfigurationDelete';
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  deleteSalesOrder(data, details) {
    let url = `salesOrder/services/deleteSalesOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    if (data.lineId) {
      url = `salesOrder/services/deleteSalesOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&wmsoLineNumber=${data.lineId}&_id=${data.id}`;
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }

  deletePurchaseOrder(data, details) {
    let url = `purchaseorder/services/deletePurchaseOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    if (data.lineId) {
      url = `purchaseorder/services/deletePurchaseOrderByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&purchaseOrderLine_id=${data.lineId}&_id=${data.id}`;
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteProdBConfig(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `barcode/services/deleteProductBarcodeConfiguration?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteProcesssBConfig(data, details) {
    // const det = {
    //   "_id": data.id,
    //   "organizationIDName": details.organizationIDName,
    //   "wareHouseIDName": details.wareHouseIDName,
    //   "processName": data.processName
    // }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `barcode/services/deleteProcessBarcodeConfigurationByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}&processName=${data.processName}`;
    // httpReq.url = `barcode/services/deleteProcessBarcodeConfigurationByID`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }

  deleteUserBarcodeAccess(data, details) {
    // const det = {
    //   "_id": data.id,
    //   "organizationIDName": details.organizationIDName,
    //   "wareHouseIDName": details.wareHouseIDName,
    //   "processName": data.processName
    // }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `barcode/services/deleteProcessBarcodeAccessConfiguration?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}&userIDName=${data.userIDName}`;
    // httpReq.url = `barcode/services/deleteProcessBarcodeConfigurationByID`;
    httpReq.showLoader = true;
    // httpReq.body = det;
    return this.httpService.restCall(httpReq);
  }
  deleteWareHouseTransfer(data, details) {
    let url = `internalTransfer/services/deleteWareHouseTransferByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`
    if (data.lineID) {
      url += `&wareHouseTransferLine_id=${data.lineID}`
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteAccountinSpaceUtilizationtRecord(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `/thirdParty/services/deleteThirdPartySpaceUtilizationByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteGRNote(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `goodsReceipt/services/deleteGoodsReceiptNoteByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }


  deleteSalesReturn(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `shipmentOrder/services/deleteSalesReturnByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deletePurchaseReturn(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `goodsReceipt/services/deletePurchaseReturnByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteSchedulerScreenDetails(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `thirdParty/services/deleteThirdPartySpaceUtilizationScheduleConfigurationByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  /*  (data) {
     const httpReq: HttpReq = new HttpReq();
     httpReq.type = this.REST_TYPE_POST;
     httpReq.contentType = 'applicationJSON';
     httpReq.url = 'common/services/deleteApplicationURLByID';
     httpReq.showLoader = true;
     httpReq.body = {};
     return this.httpService.restCall(httpReq);
   }
   (/* data) {
     const httpReq: HttpReq = new HttpReq();
     httpReq.type = this.REST_TYPE_POST;
     httpReq.contentType = 'applicationJSON';
     httpReq.url = `common/services/deleteApplicationURLByID=${data.id}`;
     httpReq.showLoader = true;
     httpReq.body = {};
     return this.httpService.restCall(httpReq);
   } */
  deleteApplicationUrlDetails(id,) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/deleteApplicationURLByID';
    httpReq.showLoader = true;
    const data = `_id=${id}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteFinancialYearConfigDetails(id,details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `configuration/services/deleteFinancialYearConfiguration?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    const data = `_id=${id}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  deleteSourceWarehouses(details,id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `common/services/deleteWareHouseTransferConfigurationByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${id}`;
    httpReq.showLoader = true;
    httpReq.body = null;
    return this.httpService.restCall(httpReq);
  }
  deleteProductCategoryGroup(data, details) {
    let url: any = `product/services/deleteProductCategoryGroupByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`
    if (data.subID) {
      url = url + `&line_id=${data.subID}`
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = url;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteBrandConfiguration(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `common/services/deleteBrandConfigurationByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deletePromotions(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `common/services/deletePromotionByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deletePromotionsPolicys(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `common/services/deletePromotionPolicyByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data.id}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteStatusConfig(data, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `configuration/services/deleteProcessStatusConfiguration?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&_id=${data}`;
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
}

