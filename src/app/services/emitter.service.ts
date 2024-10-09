import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MetaDataService } from './integration-services/metadata.service';
import { CommonService } from '../shared/services/common.service';
import { WMSService } from './integration-services/wms.service';
import { CommonMasterDataService } from './integration-services/commonMasterData.service';
import { ConfigurationService } from './integration-services/configuration.service';

@Injectable({
  providedIn: 'root'
})
export class EmitterService {


  private serviceproviderIDs: BehaviorSubject<any> = new BehaviorSubject([]);
  serviceproviderIDsDescription = this.serviceproviderIDs.asObservable();

  private invoicePriceUpdate: BehaviorSubject<any> = new BehaviorSubject([]);
  invoicePriceValueUpdated = this.invoicePriceUpdate.asObservable();

  private billingPoInvoicing: BehaviorSubject<any> = new BehaviorSubject([]);
  billingInvoiceDataPrint = this.billingPoInvoicing.asObservable();

  private productIDs: BehaviorSubject<any> = new BehaviorSubject([]);
  producttDescriptionValues = this.productIDs.asObservable();

  private equipmentiIDs: BehaviorSubject<any> = new BehaviorSubject([]);
  equipmentDescriptionValues = this.equipmentiIDs.asObservable();


  private userIDs: BehaviorSubject<any> = new BehaviorSubject([]);
  userValues = this.userIDs.asObservable();

  private units: BehaviorSubject<any> = new BehaviorSubject([]);
  unitValues = this.units.asObservable();
  ServiceproviderIDsDetails: any;

  constructor(
    private metaDataService: MetaDataService, private configService: ConfigurationService,
    private commonService: CommonService,
    private wmsService: WMSService, private commonMasterDataService: CommonMasterDataService
  ) { }
  invoicePriceUpdated(data) {
    this.invoicePriceUpdate.next(data);
  }
  billingInvoiceDataPrints(data) {
    this.billingPoInvoicing.next(data);
  }

  fetchAllProducts() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          console.log(response.data.productMasters);
          this.productIDs.next(this.commonService.getSelectedValuesFromArrayOfObjs
            (response.data.productMasters, 'productIDName', ['productIDName', 'equipmentType']));
        }
      })
  }
  fetchAllEquipments() {
    this.commonMasterDataService.fetchAllEquipments(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.equipmentMaster) {
          console.log(response.data.equipmentMaster);
          this.equipmentiIDs.next(this.commonService.getSelectedValuesFromArrayOfObjs
            (response.data.equipmentMaster, 'equipmentIDName', ['equipmentIDName', 'equipmentType']));
        } else {
        }
      },
      (error) => {
        console.log(error)
      });
  }
  findAllEmployeeIDName() {
    this.commonMasterDataService.fetchUserDetailsByRoleInfo().subscribe(response => {
      if (response && response.status === 0 && response.data.users) {
        this.userIDs.next(this.commonService.getSelectedValuesFromArrayOfObjs
          (response.data.users, 'userID', ['_id', 'userID', 'firstName', 'name', 'email']));
      }
    },
      (error) => {
      });
  }
  /* 
  fetchAllEquipmentType() {
    this.metaDataService.fetchAllEquipmentTypes().subscribe(
      response => {
        if (response && response.status === 0 && response.data.equipmentTypes) {
          console.log(response.data.equipmentTypes)
          this.equipmentiIDs.next(this.commonService.getSelectedValuesFromArrayOfObjs
         (response.data.equipmentTypes, 'name'));          
        }
      },
      error => {
      }
    )
  } */
  fetchAllUnits() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.metaDataService.fetchAllUnits(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.units) {
          this.units.next(this.commonService.getSelectedValuesFromArrayOfObjs
            (response.data.units, 'unitCode')); 
        }
      },
      (error) => {
      });
  }
  fetchAllServiceProvider() {
    this.wmsService.fetchAllServiceProvider(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.serviceProviders) {
          this.serviceproviderIDs.next(this.commonService.getSelectedValuesFromArrayOfObjs
            (response.data.serviceProviders, 'serviceProviderIDName', ['serviceProviderID', 'serviceProviderName']));
        }
      },
      (error) => {
      });
  }
  findObjFromArrayOfObjects(srcArray: any, searchKey: any, value: any) {
    if (searchKey && value && srcArray && srcArray.length > 0) {
      return srcArray.find(obj => obj[searchKey] === value);
    } else {
      return { [searchKey]: value };
    }
  }
}

