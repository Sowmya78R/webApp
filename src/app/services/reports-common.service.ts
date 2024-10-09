import { Injectable } from '@angular/core';
import { WMSService } from './integration-services/wms.service';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from '../shared/services/common.service';
import { OutboundMasterDataService } from './integration-services/outboundMasterData.service';
import { MetaDataService } from '../services/integration-services/metadata.service';
import { ConfigurationService } from './integration-services/configuration.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsCommonService {
  private supplierIDNames: BehaviorSubject<any> = new BehaviorSubject([]);
  private productIDNames: BehaviorSubject<any> = new BehaviorSubject([]);
  private customerIDNames: BehaviorSubject<any> = new BehaviorSubject([]);
  private warehouseNames: BehaviorSubject<any> = new BehaviorSubject([]);
  private zoneNames: BehaviorSubject<any> = new BehaviorSubject([]);
  private rackNames: BehaviorSubject<any> = new BehaviorSubject([]);
  private levelNames: BehaviorSubject<any> = new BehaviorSubject([]);
  private locationNames: BehaviorSubject<any> = new BehaviorSubject([]);
  private locationNamesByInventory: BehaviorSubject<any> = new BehaviorSubject([]);
  private units: BehaviorSubject<any> = new BehaviorSubject([]);



  private serviceProviderIDs: BehaviorSubject<any> = new BehaviorSubject([]); 
  serviceProviderValues = this.serviceProviderIDs.asObservable();

  supplierIDNameValues = this.supplierIDNames.asObservable();
  productIDNameValues = this.productIDNames.asObservable();
  customerIDNameValues = this.customerIDNames.asObservable();
  warehouseNameValues = this.warehouseNames.asObservable();
  zoneNameValues = this.zoneNames.asObservable();
  rackNameValues = this.rackNames.asObservable();
  levelNameValues = this.levelNames.asObservable();
  locationNameValues = this.locationNames.asObservable();
  locationNamesByInventoryValues = this.locationNamesByInventory.asObservable();
  unitsValues = this.units.asObservable();
  formObj = this.configService.getGlobalpayload();

  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private outboundMasterDataService: OutboundMasterDataService,
    private metaDataService: MetaDataService,
    private commonService: CommonService) { }



  FetchAllServiceProviderDetails() {
    this.wmsService.fetchAllVehicleServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.vehicleByServiceProviders) {
        this.serviceProviderIDs.next(this.commonService.getFiltValuesFromArrayOfObjs
          (response.data.vehicleByServiceProviders, 'serviceProviderIDName'));

      }
    })
  }

  fetchAllSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.supplierIDNames.next(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.supplierMasters, 'supplierIDName'));
        }
      },
      (error) => {
        this.supplierIDNames.next([]);
      });
  }
  fetchAllCustomers() {
    this.outboundMasterDataService.fetchAllCustomers(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.customers) {
          this.customerIDNames.next(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.customers, 'customerIDName'));
        }
      },
      (error) => {
        this.customerIDNames.next([]);
      });
  }

  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.productIDNames.next(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.productMasters, 'productIDName'));
        }
      },
      (error) => {
        this.productIDNames.next([]);
      });
  }
  fetchAllWarehouses() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.warehouseNames.next(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.wareHouses, 'wareHouseName'));
        }
      },
      (error) => {
        this.warehouseNames.next([]);
      });
  }
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones) {
          this.zoneNames.next(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.zones, 'zoneName'));
        }
      },
      (error) => {
        this.zoneNames.next([]);
      });
  }
  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.rackNames.next(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.racks, 'rackName'));
        }
      },
      (error) => {
        this.rackNames.next([]);
      });
  }
  fetchAllLevels() {
    this.wmsService.fetchAllLevels(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.levels) {
          this.levelNames.next(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.levels, 'levelName'));
        }
      },
      (error) => {
        this.levelNames.next([]);
      });
  }
  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locationNames.next(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.locations, 'locationName'));
        }
      },
      (error) => {
        this.locationNames.next([]);
      });
  }
  fetchAllInventories() {
    this.wmsService.findAllInventories('', this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventories) {
          this.locationNamesByInventory.next(this.commonService.getFiltValuesFromArrayOfObjs
            (response.data.inventories, 'locationName'));
        }
      },
      (error) => {
        this.locationNamesByInventory.next([]);
      });
  }
  fetchAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.units) {
          this.units.next(response.data.units);
        }
      },
      (error) => {
        this.units.next([]);
      });
  }
  
}
