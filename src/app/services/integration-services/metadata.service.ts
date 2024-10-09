import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { HttpReq } from '../../shared/common/app.entity';
import { ConfigurationService } from './configuration.service';

@Injectable()
export class MetaDataService {

  REST_TYPE_GET: any = 'GET';
  REST_TYPE_POST: any = 'POST';
  REST_TYPE_PUT: any = 'PUT';
  REST_TYPE_DELETE: any = 'DELETE';
  constructor(private httpService: HttpService) {
  }
  saveOrUpdateStorageType(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('storageTypeMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateStorageType';
    httpReq.showLoader = false;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  savePalletConfiguration(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('palletConfigurationMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePalletConfiguration';
    httpReq.showLoader = false;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllStorageTypes(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'common/services/findAllStorageTypes';
    httpReq.showLoader = true;
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  deleteStorageType(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/storageTypeSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateProductCategory(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('productCategoryMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateProductCategory';
    httpReq.showLoader = false;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateProductSubCategory1(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateProductSubCategory1';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateProductSubCategory2(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateProductSubCategory2';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateProductSubCategory3(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateProductSubCategory3';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllProductCategories(entity) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'common/services/findAllProductCategories';
    httpReq.showLoader = true;
    httpReq.body = entity;
    return this.httpService.restCall(httpReq);
  }
  /*  fetchAllCommonSubCategory(entityBody) {
     const httpReq: HttpReq = new HttpReq();
     httpReq.type = this.REST_TYPE_POST;
     httpReq.contentType = 'applicationJSON';
     httpReq.url = 'common/services/findAllProductSubCategory1s';
     httpReq.body = entityBody;
     return this.httpService.restCall(httpReq);
   } */

  fetchAllCommonSubCategory1s(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllProductSubCategory1s';
    httpReq.showLoader = false;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  fetchAllCommonSubCategory2s(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllProductSubCategory2s';
    httpReq.showLoader = false;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  fetchAllCommonSubCategory3s(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllProductSubCategory3s';
    httpReq.showLoader = false;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }



  /*  fetchAllCommonSubCategory(entity) {
     const httpReq: HttpReq = new HttpReq();
     httpReq.type = this.REST_TYPE_POST;
     httpReq.contentType = 'applicationJSON'
     httpReq.url = 'common/services/findAllProductSubCategory1s';
     httpReq.showLoader = true;
     httpReq.body = entity;
     return this.httpService.restCall(httpReq);
   } */
  deleteProductCategory(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/productCategorySoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteSubCategory1sResponseList(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/deleteProductSubCategory1ByID?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteSubCategory2sResponseList(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded'; 
    httpReq.url = `common/services/deleteProductSubCategory2ByID?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteSubCategory3sResponseList(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/deleteProductSubCategory3ByID?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdatePalletSize(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('palletSizeMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePalletSize';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPalletSizes(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllPalletSize';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  deletePalletSize(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/palletSizeSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateUnit(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('unitMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateUnit';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllUnits(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllUnits';
    httpReq.showLoader = false;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  saveOrUpdateTermOfPayments(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('termsOfPaymentMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateTermsOfPayment';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllTermOfPayments(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllTermsOfPayments';
    httpReq.showLoader = false;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }

  saveOrUpdatePickingType(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('packingTypeMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePackingType';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPickingType(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllPackingType';
    httpReq.showLoader = false;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }


  saveorUpdateShipmentTimeSlot(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('shipmentTimeSlotMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateShipmentTimeSlot';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllShipmentTimeSlots(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllShipmentTimeSlot';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  deleteShipmentTime(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/shipmentTimeSlotSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdatePaymentMode(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('paymentModeMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePaymentMode';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllPaymentMode(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllpaymentMode';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  deletePaymentMode(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/paymentModeSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  saveOrUpdateSalesOrderkWithInventoryDetails(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('salesOrderInventoryConfigurationMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateSalesOrderInventoryConfiguration';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateAutoPutaway(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePutawayGenerationConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateGrnInvoiceConfiguration(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateGrnInvoiceConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdatePickingGenerationConfiguration(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePickingGenerationConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateShipmentGenerationConfiguration(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateShipmentGenerationConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdatePDLocationsConfiguration(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/saveOrUpdateProductDimensionsByLocationConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateProductByCustomerConfig(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = '/configuration/services/saveOrUpdateProductByCustomerMappingConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateProductBySupplierConfig(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = '/configuration/services/saveOrUpdateProductBySupplierMappingConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateProductBySalesOrderConfig(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = '/configuration/services/saveorUpdateSalesOrderPanelViewConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateCopyCustomerToSupplierConfig(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = '/configuration/services/saveOrUpdateCopyCustomerToSupplierConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateGRNUploadConfig(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = '/configuration/services/saveOrUpdateGoodsReceiptReceivedTypeConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdatePutawayQCConfig(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/saveOrUpdatePutawayQualityCheckConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdatePickingQCConfig(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/saveOrUpdatePickingQualityCheckConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  
  saveorUpdateSpaceUtilizationConversionUnitConfiguration(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateSpaceUtilizationConversionUnitConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateDiscountConfiguration(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateDiscountConfirmation';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  /*
    saveOrUpdateSalesOrderkWithInventoryDetails(entityData: any) {
      const httpReq: HttpReq = new HttpReq();
      const formData = new FormData();
      formData.append('salesOrderInventoryConfigurationMap', entityData);
      httpReq.type = this.REST_TYPE_POST;
      httpReq.url = 'common/services/saveorUpdateSalesOrderInventoryConfiguration';
      httpReq.showLoader = true;
      httpReq.body = entityData
      return this.httpService.restCall(httpReq);
    } */

  fetchAllSalesOrderWithInventories(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllSalesOrderInventoryConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  /*   fetchAllSalesOrderWithInventories() {
      const httpReq: HttpReq = new HttpReq();
      httpReq.type = this.REST_TYPE_POST;
      httpReq.url = 'common/services/findAllSalesOrderInventoryConfigurations';
      httpReq.body = {};
      return this.httpService.restCall(httpReq);
    } */

  findAllCountries(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllCounries';
    httpReq.showLoader = true;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }

  saveOrUpdateCountryDetails(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('countryMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveOrUpdateCountry';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }

  deleteCountry(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/countrySoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  fetchAllCurrencies(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllCurrency';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }

  saveorUpdateCurrencies(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('currencyMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateCurrency';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  deleteCurrencies(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/currencySoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }

  /* Equipment Types */

  fetchAllEquipmentTypes(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllEquipmentTypes';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }

  saveorUpdateEquipmentType(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('equipmentTypeMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateEquipmentType';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }

  deleteEquipmentType(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/equipmentTypeDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllTaxGroups(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllTaxGroups';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateTaxGroup(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('taxGroupMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateTaxGroup';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  deleteTaxGroups(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/taxGroupSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllTaxTypes() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON';
    httpReq.url = 'common/services/findAllCountryTaxTypesList';
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  fetchAllTaxTypesByCountryId(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/findCountryTaxTypesByID';
    httpReq.body = `country_id=${id}`;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateTaxTypes(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('countryTaxTypesMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveOrUpdateCountryTaxTypes';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  deleteTaxTypes(taxName) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/countryTaxTypeSoftDelete';
    httpReq.showLoader = false;
    const data = `taxName=${taxName}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteUnit(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/unitSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllRoles(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllRoles';
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateRole(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateRole';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  deleteRole(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/deleteRole?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllTermsAndConditions(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllTermsAndConditionsDetails';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateTermsAndCondition(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveOrUpdateTermsAndConditions';
    httpReq.showLoader = true;
    httpReq.body = `termsAndConditionsMap=${entityData}`;
    return this.httpService.restCall(httpReq);
  }

  deleteTermsAndCondition(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/termsAndConditionsSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteTermsOfPayment(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/termsOfPaymentSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllHomePageText(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllHomePageText';
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  saveorUpdateHomePageText(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveOrUpdateHomePage';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  /*
    saveorUpdateHomePageText(entityData: any) {
      const httpReq: HttpReq = new HttpReq();
      httpReq.contentType = 'formEncoded';
      httpReq.type = this.REST_TYPE_POST;
      httpReq.url = 'common/services/saveOrUpdateHomePage';
      httpReq.showLoader = true;
      httpReq.body = `homePageMap=${entityData}`;
      return this.httpService.restCall(httpReq);
    }
   */
  deleteHomePageText(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    //httpReq.isAcessTokenReq = true;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/homePageSoftDelete';
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false&organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
    /*
        const httpReq: HttpReq = new HttpReq();
        httpReq.type = this.REST_TYPE_POST;
        httpReq.contentType = 'formEncoded';
        httpReq.url = 'common/services/homePageSoftDelete';
        httpReq.showLoader = true;
        const data = `_id=${id}&isActive=false&organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
        httpReq.body = data;
        return this.httpService.restCall(httpReq); */
    /*
        const httpReq: HttpReq = new HttpReq();
        httpReq.type = this.REST_TYPE_POST;
        httpReq.contentType = 'formEncoded';
        httpReq.url = 'common/services/homePageSoftDelete';
        httpReq.showLoader = false;
        const data = `_id=${id}&isActive=false&organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
        httpReq.body = data;
        return this.httpService.restCall(httpReq); */
  }

  fetchAllLoginPageTextForParameters(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'login/services/findAllLoginText';
    httpReq.contentType = 'applicationJSON';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllLoginPageText(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.isAcessTokenReq = true;
    httpReq.url = 'login/services/findAllLoginTextBeforeAuthentication';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateLoginPageText(entityData) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('loginTextMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'login/services/saveOrUpdateLoginText';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);

    /*  const httpReq: HttpReq = new HttpReq();
     httpReq.contentType = 'formEncoded';
     httpReq.isAcessTokenReq = true;
     httpReq.type = this.REST_TYPE_POST;
     httpReq.url = `login/services/saveOrUpdateLoginText?organizationIDName=${details.organizationIDName}&wareHouseIDName=${details.wareHouseIDName}`;
     httpReq.showLoader = true;
     httpReq.body = `loginTextMap=${details}`;
     return this.httpService.restCall(httpReq); */
  }
  saveorUpdateZoneCapacity(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    const formData = new FormData();
    formData.append('zoneCapacityConfigurationMap', entityData);
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateZoneCapacityConfiguration';
    httpReq.showLoader = true;
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllZoneCapacity(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllZoneCapacityConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }

  softDeleteZoneCapacity(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/zoneCapacityConfigurationSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteLoginPageText(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    //httpReq.isAcessTokenReq = true;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'login/services/loginTextSoftDelete';
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false&organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllCrossDockingMap(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllCrossDockingMetaDetails';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }


  saveorUpdateCrossDockingMap(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateCrossDockingMap';
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('crossDockingMap', entityData);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }

  /*
  saveorUpdateCrossDockingMap(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateCrossDockingMap';
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('crossDockingMap', entityData);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  } */
  deleteCrossDockingMap(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/crossDockingMapDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllUOMs() {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllUOMs';
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateUOM(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateCrossDockingMap';
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('crossDockingMap', entityData);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  deleteUOM(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = 'common/services/crossDockingMapSoftDelete';
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  /* Columns */

  saveorUpdateColumns(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'formEncoded';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveOrUpdateColumn';
    httpReq.showLoader = true;
    httpReq.body = `columnMap=${entityData}`;
    return this.httpService.restCall(httpReq);
  }

  deleteColumns(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/columnSoftDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  fetchAllReturnLocationMap(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllReturnLocationMaps';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }

  saveorUpdateReturnLocationMap(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateReturnLocationMap';
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('returnLocationMap', entityData);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }

  uploadImage(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'fileStore/services/uploadSingleFile';
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('file', entityData);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }



  deleteImage(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `fileStore/services/deleteSingleFile?fileName=${id}`;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);

  }
  saveorUpdateLogo(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON';
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateLogo';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  getAllLogos(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllLogos';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  viewImages(id) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `fileStore/services/viewFile?fileName=${id}`;
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
  deleteLogo(logo, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/logoDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${logo._id}&logoName=${logo.logoName}`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  deleteProductImage(fileName) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `fileStore/services/deleteSingleFile?fileName=${fileName}`;
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('file', fileName);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);

  }

  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
  imgGlobalChanged(event, variable, isEvent?) {
    let element = <HTMLImageElement>(document.getElementById(variable))
    if (element) {
      const reader = new FileReader();
      reader.onload = e => element.src = reader.result.toString();
      reader.readAsDataURL(isEvent ? event : event.target.files[0]);
    }
  }
  saveorUpdateLocationAllConfiguration(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePickingLocationAllocationConfiguration';
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('pickingLocationAllocationConfigurationMap', entityData);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateReceiveLocationAllConfiguration(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePutawayLocationAllocationConfiguration';
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('putawayLocationAllocationConfigurationMap', entityData);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateReturnLocationAllConfiguration(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdatePutawayReturnLocationAllocationConfiguration';
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('putawayReturnLocationAllocationConfigurationMap', entityData);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateSerialNumber(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateSerialNumberConfiguration';
    httpReq.showLoader = true;
    const formData = new FormData();
    formData.append('serialNumberConfigurationMap', entityData);
    httpReq.body = formData;
    return this.httpService.restCall(httpReq);
  }
  getAllSerialNumberConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllSerialNumberConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateThirdPartyCustomers(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'common/services/saveorUpdateThirdPartyCustomerConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveImageConfig(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'configuration/services/saveOrUpdateImageConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  saveSourceWarehouseConfig(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'applicationJSON'
    httpReq.url = 'common/services/saveorUpdateWareHouseTransferConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }

  getAllImageConfig(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/findByAllImageConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  getImageConfigbyName(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `configuration/services/findImageConfigurationByImageTypeName?imageTypeName=ForImage&organizationIDName=${encodeURIComponent(entityBody.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityBody.wareHouseIDName)}`;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  getAllThirdpartyCustomers(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllThirdPartyCustomerConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  getAllAutoPutaway(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllPutawayGenerationConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  getLocationAllocationType(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllPickingLocationAllocationConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  getReceiveLocationAllocationType(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllPutawayLocationAllocationConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  getReturnLocationAllocationType(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllPutawayReturnLocationAllocationConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  fetchAllNotifications(entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'reports/getNotifications';
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  /* organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)};` */
  deleteAbcAnalysisClass(id, entityData) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.contentType = 'formEncoded';
    httpReq.url = `common/services/abcAnalysisClassDelete?organizationIDName=${encodeURIComponent(entityData.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityData.wareHouseIDName)}`;
    httpReq.showLoader = false;
    const data = `_id=${id}&isActive=false`;
    httpReq.body = data;
    return this.httpService.restCall(httpReq);
  }
  getAllGrnInvoiceConfiguration(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllGrnInvoiceConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  getAllPickingGenerationsConfiguration(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllPickingGenerationConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllSpaceUtilizationConversionUnitConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllSpaceUtilizationConversionUnitConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllShipmentGenerationConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllShipmentGenerationConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllPDLocationConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/findAllProductDimensionsByLocationConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllCustomerConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/findAllProductByCustomerMappingConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllSupplierConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/findAllProductBySupplierMappingConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllSalesOrderConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/findAllSalesOrderPanelViewConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllCopyCustomerToSupplierConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/findAllCopyCustomerToSupplierConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllGRNUploadConfig(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/findAllGoodsReceiptReceivedTypeConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllPutawayQCConfig(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/findAllPutawayQualityCheckConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  findAllPickingQCConfig(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'configuration/services/findAllPickingQualityCheckConfigurations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  
  findAllDiscountConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllDiscountConfirmations';
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  saveorUpdateBrandConfiguration(entityData: any) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.contentType = 'applicationJSON'
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/saveorUpdateBrandConfiguration';
    httpReq.showLoader = true;
    httpReq.body = entityData;
    return this.httpService.restCall(httpReq);
  }
  fetchAllBrandConfigurations(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'common/services/findAllBrandConfigurations';
    httpReq.showLoader = false;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  fetchAllLocationBarcodes(entityBody) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = 'location/services/findLocationBarcodes';
    httpReq.showLoader = false;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = entityBody;
    return this.httpService.restCall(httpReq);
  }
  
  fetchLocationByBarcode(entityBody,upcNumber) {
    const httpReq: HttpReq = new HttpReq();
    httpReq.type = this.REST_TYPE_POST;
    httpReq.url = `location/services/findLocationByUpcEANNumber?organizationIDName=${encodeURIComponent(entityBody.organizationIDName)}&wareHouseIDName=${encodeURIComponent(entityBody.wareHouseIDName)}&upcEANNumber=${upcNumber}`;
    httpReq.showLoader = false;
    httpReq.contentType = 'applicationJSON'
    httpReq.body = {};
    return this.httpService.restCall(httpReq);
  }
}

