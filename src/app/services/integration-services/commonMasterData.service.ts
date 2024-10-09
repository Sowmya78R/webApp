import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonMasterDataService {

  PassEmployeeIDNameValue: any;

  public defaultUserIDName: any = new BehaviorSubject({});

  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) { }
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
  fetchAllVehicles(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllVehicleMaster';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateWarehouseTeam(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('wareHouseTeamMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateWareHouseTeam';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllWarehouseTeams(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllWareHouseTeams';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllExecutionIDName(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findWareHouseTeamsByWorkType';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateUserConfig(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'login/services/saveorUpdateUser';
    // httpReq.isAcessTokenReq = true;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateRoleUser(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    // httpReq.url = 'common/services/saveorUpdateUserRegistration';
    httpReq.url = 'login/services/saveorUpdateUser'
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  fetchAllUsers() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'login/services/findAllUsers';
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  fetchUsersbyRoleID(entityData, role) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `login/services/findUsersByRoleName?roleName=${role}`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchUserDetailsByEmail(email) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'login/services/findUserDetailsByEmail';
    httpReq.showLoader = true;
    httpReq.body = `email=${email}`;
    return this.httpService.restCall(httpReq);
  }

  fetchUserDetailsforReset(email) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'login/services/findUserDetailsByEmailToResetPassword';
    httpReq.isAcessTokenReq = true;
    httpReq.showLoader = true;
    httpReq.body = `email=${email}`;
    return this.httpService.restCall(httpReq);
  }
  fetchUserDetailsByRoleInfo() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/findUserDetailsByRoleInfo';
    httpReq.showLoader = true;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }

  fetchAllCountries(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/getAllCountries';
    httpReq.showLoader = false;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }


  fetchAllStatesByCountryID(id) {
    const encodedSyntax = encodeURIComponent(id);
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/getAllStatesByCountryID';
    httpReq.showLoader = false;
    httpReq.body = `countryID=${encodedSyntax}`;
    return this.httpService.restCall(httpReq);
  }
  fetchAllCitiesByStateID(id) {
    const encodedSyntax = encodeURIComponent(id);
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/getAllCitiesByStateCodeID';
    httpReq.showLoader = false;
    httpReq.body = `stateID=${encodedSyntax}`;
    return this.httpService.restCall(httpReq);
  }
  fetchAllRoles(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllRoles';
    httpReq.showLoader = false;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  fetchAllEquipments(details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `capacityplanning/findAllEquipmentMaster`;
    httpReq.showLoader = true;
    httpReq.body = details;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateEquipmentDetails(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('equipmentMasterMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'capacityplanning/saveOrUpdateEquipmentMaster';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllBillOfResources(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'capacityplanning/findAllBillOfResourcesList';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateBillOfResources(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('billofResourcesMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'capacityplanning/saveOrUpdateBillOfResources';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllBillToAdresses(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllBillToAddress';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateBillToAddresses(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('billToAddressMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateBillToAddress';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchBillToAddressByID(id, details) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/findBillToAddressByID?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}`;
    httpReq.showLoader = true;
    httpReq.body = `_id=${id}`;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateUOMConversion(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('uomMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'uom/services/saveorUpdateUOM';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllUOMConversion(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'uom/services/findAllUOMS';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  updatePutawayAssignedTo(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    // httpReq.url = 'putaway/services/assignResourcesToPutaway';
    httpReq.url = `putaway/services/updatePutaway`;
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  performPutaway(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'putaway/services/performPutaway';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  performPicking(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'picking/services/performPicking';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  updatePickingAssignedTo(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'picking/services/assignResourcesToPicking';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  //warehouseconfig
  findOrgHierarchy(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `common/services/findOrganizationHierarchy?organizationID=${data}`;
    httpReq.showLoader = true;
    return this.httpService.restCall(httpReq);
  }
  findOrgandWarehouseByUserIdName(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `configuration/services/findWareHousesByUserIDName?userIDName=${data}`;
    httpReq.showLoader = true;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateWarehouseConfig(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/saveorUpdateWareHouseConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findAllWareHouseConfigurations(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'configuration/services/findAllWareHouseConfigurations';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  findWHConfigbyUId(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `configuration/services/findWareHouseConfigurationByUserIDName?userIDName=${id}`;
    httpReq.showLoader = true;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateGRNote(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/saveorUpdateGoodsReceiptNote';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllGRNotesWithOutPagination(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findAllGoodsReceiptNotes';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  fetchAllGRNote(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findAllGoodsReceiptNotesWithPagination';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  fetchGRNoteById(details: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `goodsReceipt/services/findGoodsReceiptNoteByInvoiceNumber?organizationIDName=${encodeURIComponent(details.organizationIDName)}&wareHouseIDName=${encodeURIComponent(details.wareHouseIDName)}&invoiceNumber=${details.invoiceNumber}`;
    httpReq.showLoader = true;
    // httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  createSalesReturn(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'shipmentOrder/services/createSalesReturnByWmsoNumber';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllSalesReturns(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'shipmentOrder/services/findAllSalesReturns';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  confirmSalesReturn(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'shipmentOrder/services/confirmSalesReturnByWmsoNumber';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchIDforSalesReturns(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'shipmentOrder/services/findShipmentOrdersForSalesReturn';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  salesReturnById(id, details) {
    const body = {
      "organizationIDName": details.organizationIDName,
      "wareHouseIDName": details.wareHouseIDName,
      "wmsoNumber": id.wmsoNumber, "fullWmsoNumber": id.fullWmsoNumber, "wmsoNumberPrefix": id.wmsoNumberPrefix
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `shipmentOrder/services/findShipmentOrderSalesReturnByWmsoNumber`;
    httpReq.showLoader = true;
    httpReq.body = body;
    return this.httpService.restCall(httpReq);
  }
  purchaseReturnsByWMpoNumber(id, details) {
    const data = {
      "organizationIDName": details.organizationIDName,
      "wareHouseIDName": details.wareHouseIDName,
      "wmpoNumber": id.wmpoNumber,
      "orderType": id.orderType,
      "fullWmpoNumber": id.fullWmpoNumber,
      "wmpoNumberPrefix": id.wmpoNumberPrefix,
    }
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `goodsReceipt/services/findGoodsReceiptPurchaseReturnByWmpoNumber`;
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  createPurchaseReturn(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/createPurchaseReturnByWmsoNumber';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPurchaseReturns(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/findAllPurchaseReturns';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  confirmPurchaseReturn(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/confirmPurchaseReturnByWmsoNumber';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  damagedStockByWMpoNumber(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `putaway/services/findPutwaysToProcessDamagedStocks`;
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  createDamagedStock(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `putaway/services/persistOrUpdatePutawayDamagedStock`;
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllDamagedStocks(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'putaway/services/findAllPutawayDamagedStocksWithPaginationOnHeader';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  confirmDamagedStock(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'putaway/services/confirmPutawayDamagedStock';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  replacementOrderByWmsoNumber(data) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `picking/services/findPickingsToProcessReplacementOrders`;
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  returnLocForPutawayWithPgination(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'putaway/services/findAvailableReturnLocationsForPutawayWithPagination';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  createReplacementOrder(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `picking/services/persistOrUpdateReplacementOrder`;
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllReplacementStocks(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'picking/services/findAllReplacementOrdersWithPaginationOnHeader';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  validateROrder(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'picking/services/validateReplacementOrderDetails';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  confirmReplacementOrder(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'picking/services/confirmReplacementOrder';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchNotificationConfigUserListByRoleName(entityData, role) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `login/services/findUsersByRoleName?roleName=${role}`;
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  /* Save Update Outward Check List */
  saveorUpdateOutWardCheckList(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/saveorUpdateGoodsReceiptNote';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateIntWardCheckList(data: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'goodsReceipt/services/saveorUpdateGoodsReceiptNote';
    httpReq.showLoader = true;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchUserBarcodes(payload) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = `login/services/findUserBarcodes`;
    httpReq.showLoader = true;
    httpReq.body = payload;
    return this.httpService.restCall(httpReq);
  }
}
