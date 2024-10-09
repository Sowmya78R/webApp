import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetaDataService } from '../../../services/integration-services/metadata.service';
import { ToastrService } from 'ngx-toastr';
import { Storage } from '../../../shared/utils/storage';
import { WMSService } from '../../../services/integration-services/wms.service';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { AppService } from 'src/app/shared/services/app.service';
import { BarcodeService } from 'src/app/services/barcode.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DeletionService } from 'src/app/services/integration-services/deletion.service';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html'
})
export class ParametersComponent implements OnInit, OnDestroy {
  locations: any = [];
  locationNameValues: CompleterData;
  crossDockingMapping: any = '';
  storageTypes: any = [];
  productCategories: any = [];
  /* SubCategory1: any = [];
  SubCategory2: any = [];
  SubCategory3: any = []; */
  shipmentTimeSlots: any = [];
  paymentModes: any = [];
  palletSizes: any = [];
  countries: any = [];
  salesorderWithInventory: any = []
  currencies: any = [];
  columns: any = [];
  equipmentType: any = [];
  taxGroups: any = [];
  countryTaxTypesList: any = [];
  units: any = [];
  termOfPayments: any = [];
  rolesList: any = [];
  termsOfConditions: any = [];
  crossDockingMappings: any = [];
  returnLocationMappings: any[] = [];
  crossDockingMappingsForRef: any = [];
  pickingTypes: any = [];
  role: any;
  termsAndConditionsForPO: any = [];
  termsAndConditionsForSO: any = [];
  termsAndConditionsForInvoice: any = [];
  homePageTexts: any = [];
  loginPageTexts: any = [];
  deleteInfo: any = { name: '', _id: '' };
  zones: any = [];
  zoneValues: CompleterData;
  returnLocations: any;
  palletFormValue = { _id: null, palletConsideration: null, isActive: true };
  palletConfigurationToggle: boolean = false;
  logoList = { "_id": null, "logoName": null };
  locAllocation = { "_id": null, "pickingLocationAllocationType": "Manual", "isActive": true }
  locReceiveAllocation = { "_id": null, "putawayLocationAllocationType": "Manual", "isActive": true }
  locReturnAllocation = { "_id": null, "putawayReturnLocationAllocationType": "Manual", "isActive": true }
  serialNumberAllocation = { "_id": null, "serialNumberCheck": "No", "isActive": true }
  reqObjsalesOrderWithInventory = { "_id": null, "inventoryCheck": "yes", "isActive": true }
  thirdPartyCustomersCheckAllocation = { "_id": null, "thirdPartyCustomersCheck": "No", "isActive": true }
  barcodeConfigAllocation = { "_id": null, "barcodeCheck": "No", "isActive": true }
  autoPutaway = { "_id": null, "putawayGeneration": "No" }
  grnInvoiceConfigurations = { "_id": null, "grnInvoiceConfirmation": "No" }
  pickingGenerationConfigurations = { "_id": null, "pickingGeneration": "No" }
  spaceUtilizationConversionUnitConfigurations = { "_id": null, "unitCode": "No" }
  shipmentGenerationConfigurations = { "_id": null, "shipmentGeneration": "No" }
  productDimensionByLocationConfigurations = { "_id": null, "calculateDimensions": "No" }
  productDimensionByCustomerConfigurations = { "_id": null, "mapping": "No" }
  productDimensionBySupplierConfigurations = { "_id": null, "mapping": "No" }
  productDimensionBySalesOrderConfigurations = { "_id": null, "viewType": "No" }
  copyCustomerToSuppliersConfigurations = { "_id": null, "copy": "No" }
  grnUploadConfig = { "_id": null, "receivedType": "No" }
  putawayQC = { "_id": null, "qualityCheck": "No" };
  pickingQC = { "_id": null, "qualityCheck": "No" };
  discountConfigurations = { "_id": null, "discountConfirmationCheck": "No" }
  zoneCapacityData: any = []
  productSubCategory1sResponseList: any = [];
  productSubCategory2sResponseList: any = [];
  productSubCategory3sResponseList: any = [];
  brandConfigurationResponceList: any = [];
  body: {};
  formObj = this.configService.getGlobalpayload();
  forPermissionsSubscription: any;
  configPermissionsList: any = [];
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  imageselected: any = [];
  wareHouseselected: any = []
  imageDropdown: any = ['Product', 'Purchase Order', 'Goods Receiving', 'Sales Order', 'Shipment Order', 'Invoicing',
    'Internal Transfers', 'Inventory Adjustments', 'Warehouse Transfer', 'Product by Supplier', 'Product by Customer',
    'Replenishment', 'Bill of Resources']
  imageJSON: any = {};
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  warehousesData: any = []
  destinationWarehouse = this.configService.getWarehouse()
  sourceWareHouses: any = []
  wareHouseForm: FormGroup;
  wareHouseResponceList: any = []
  wareHouseData: any = []
  conversionForm: FormGroup;
  constructor(
    private toastr: ToastrService, private wmsService: WMSService,
    private commonService: CommonService, private completerService: CompleterService,
    private metaDataService: MetaDataService, public ngxSmartModalService: NgxSmartModalService,
    private configService: ConfigurationService, private deletionS: DeletionService,
    private bService: BarcodeService, private fb: FormBuilder,
    private translate: TranslateService,
  ) {
    this.translate.use(this.language);

  }

  ngOnInit() {
    this.configPermissionsList = this.configService.getConfigurationPermissions('mainFunctionalities', 'Parameters', this.getRole());
    if (this.getRole() && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View', 'Update', 'Delete'];
    }
    if (this.configPermissionsList.includes('View')) {
      this.getAllCalls();
      this.forPermissionsSubscription = this.configService.forParameters$.subscribe(data => {
        if (data) {
          this.getAllCalls();
        }
      })
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  ngOnDestroy(): void {
    if (this.configPermissionsList.includes('View')) {
      this.forPermissionsSubscription.unsubscribe();
    }
  }
  getAllCalls() {
    this.createWarehouseForm();
    this.createConversionForm();
    this.body = {
      // "wareHouseID": this.configService.getWarehouse().wareHouseID,
      // "wareHouseName": this.configService.getWarehouse().wareHouseName,
      // "organizationID": this.configService.getOrganization().organizationID,
      // "organizationName": this.configService.getOrganization().organizationName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.fetchAllStorageTypes();
    this.fetchAllProductCategories();
    this.fetchingCommonSubCategory1s();
    this.fetchingCommonSubCategory2s();
    this.fetchingCommonSubCategory3s();
    this.fetchingAllBrandConfigurations();
    this.fetchAllShipmentTimeSlots();
    this.fetchAllPaymentMode();
    this.fetchAllPalletSizes();
    this.fetchAllCountries();
    this.fetchAllCurrencies();
    this.fetchAllEquipmentType();
    this.fetchAllColumns();
    this.fetchAllTaxGroups();
    this.fetchAllTaxTypes();
    this.fetchAllUnits();
    this.fetchAllTermOfPayments();
    this.fetchAllPickingType();
    this.fetchAllTermsAndConditions();
    this.fetchAllRoles();
    this.fetchAllHomePageText();
    this.fetchAllLoginPageText();
    this.fetchAllLocations();
    this.fetchAllCrossDockingMap();
    this.fetchAllReturnLocationMap();
    this.fetchAllZones();
    this.fetchPalletConfiguration();
    this.fetchAllLogos();
    this.fetchPickingAllocationTpe();
    this.fetchReceiveAllocationType();
    this.fetchReturnAllocationType();
    this.fetchZoneCapacity();
    this.fetchAllSerialNumbers();
    this.fetchAllSalesOrderWithinventoriesDetails();
    this.fetchAllThirdParty();
    this.fetchImageConfig();
    this.fetchAllWareHouses();
    this.fetchAllWareHousesConfigurations()
    this.fetchBarcodeConfig();
    this.fetchAllAutoPutaway();
    this.fetchGrnInvoiceConfiguration();
    this.fetchPickingConfigrationGenerations();
    this.fetchAllSpaceUtilizationConversionUnit();
    this.fetchAllShipmentGenerationConfigurations();
    this.fetchAllDiscountConfigurations()
    this.fetchAllPDbyLocationsConfigurations();
    this.fetchAllPDbyCustomerConfigurations();
    this.fetchAllPDbySupplierConfigurations();
    this.fetchAllPDbySalesOrderConfigurations();
    this.fetchAllCopyCustomerToSupplierConfigurations();
    this.fetchGrnUploadConfig();
    this.fetchPutawayQCConfig();
    this.fetchPickingQCConfig();
  }
  imageFramedJSON() {
    this.imageJSON = {
      "_id": null,
      "imageTypeName": 'ForImage',
      "screenNames": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
  }
  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.body).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locations = response.data.locations;
          this.locationNameValues = this.completerService.local(
            this.commonService.getFiltValuesFromArrayOfObjs(response.data.locations, 'locationName'));
        }
      },
      (error) => {
      });
  }
  getLocationValue(data) {

    const locationInfo = { locationID: '', locationName: '' };
    for (let i = 0; i < this.locations.length; i++) {
      if (data && data.originalObject && this.locations[i].locationName === data.originalObject) {
        locationInfo.locationID = this.locations[i]._id;
        locationInfo.locationName = this.locations[i].locationName;
        const final = {};
        final['locationInfo'] = locationInfo;
        final['wareHouseInfo'] = this.configService.getWarehouse();
        final['organizationInfo'] = this.configService.getOrganization()
        this.metaDataService.saveorUpdateCrossDockingMap(JSON.stringify(final)).subscribe(response => {
          if (response.status == 0 || response.data.crossDockingMap) {
            this.toastr.success('Saved Successfully');
            this.fetchAllCrossDockingMap();
          }
          else {
            if (response.status == 2) {
              this.toastr.error(response.statusMsg);
            }
          }
        },
          error => { }
        );
        break;
      }
    }
  }
  /*
    getLocationValue(data) {
      const locationInfo = { locationID: '', locationName: '' };
      for (let i = 0; i < this.locations.length; i++) {
        if (this.locations[i].locationName === data.originalObject) {
          locationInfo.locationID = this.locations[i]._id;
          locationInfo.locationName = this.locations[i].locationName;
          this.metaDataService.saveorUpdateCrossDockingMap(JSON.stringify({ locationInfo })).subscribe(response => {
                this.fetchAllCrossDockingMap();
              },
              error => { }
            );
          break;
        }
      }
    } */
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.body).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones) {
          this.zones = response.data.zones;
          this.zoneValues = this.completerService.local(response.data.zones, 'zoneName', 'zoneName');
        }
      },
      (error) => {
      });
  }
  fetchPalletConfiguration() {
    this.wmsService.fetchPallet(this.body).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.palletConfigurations && response.data.palletConfigurations.length > 0) {
          this.palletFormValue = response.data.palletConfigurations[0];
          this.palletConfigurationToggle = this.palletFormValue.palletConsideration == 'Yes' ? true : false;
        }
        else {
          this.palletConfigurationToggle = false;
        }
      },
      (error) => {
        this.palletConfigurationToggle = false;
      });
  }
  fetchAllLogos() {
    this.metaDataService.getAllLogos(this.body).subscribe(res => {
      if (res.status == 0 && res.data.logos && res.data.logos.length > 0) {
        this.logoList = res.data.logos[0];
      }
      else {
        this.logoList = { "_id": null, "logoName": null };
      }
    })
  }
  fetchPickingAllocationTpe() {
    this.metaDataService.getLocationAllocationType(this.body).subscribe(res => {
      if (res.status == 0 && res.data.pickingLocationAllocationConfigurations && res.data.pickingLocationAllocationConfigurations.length > 0) {
        this.locAllocation = res.data.pickingLocationAllocationConfigurations[0];
      }
      else {
        this.locAllocation = { "_id": null, "pickingLocationAllocationType": "Manual", "isActive": true }
        if (!this.locAllocation._id) {
          this.saveAllocationType('Auto');
        }
      }
    })
  }
  fetchImageConfig() {
    this.metaDataService.getAllImageConfig(this.body).subscribe(res => {
      if (res['status'] == 0 && res['data']['imageConfigurations'] && res['data']['imageConfigurations'].length > 0) {
        this.imageJSON = res['data'].imageConfigurations[0];
        this.imageselected = this.imageJSON.screenNames;
      }
      else {
        this.imageFramedJSON();
      }
    })
  }
  fetchAllWareHouses() {
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseResponceList = response.data.wareHouses;
          this.warehousesData = response.data.wareHouses;
          this.sourceWareHouses = response.data.wareHouses.map(x => x.wareHouseIDName);
          if (this.sourceWareHouses['length'] > 0) {
            const abc: any = this.sourceWareHouses;
            this.sourceWareHouses = abc.filter(x => x != this.destinationWarehouse.wareHouseIDName)
            this.warehousesData = this.sourceWareHouses;
          }
        }
      })
  }
  fetchAllWareHousesConfigurations() {
    const data = this.configService.getGlobalpayload()
    this.wmsService.fetchAllWarehousesByGlobal(data).subscribe((response) => {
      if (response && response.status === 0 && response.data.wareHouseTransferConfigurations && response.data.wareHouseTransferConfigurations.length > 0) {
        this.wareHouseData = response.data.wareHouseTransferConfigurations;
        this.wareHouseData.forEach(ele => {
          if (ele.sourceOrganizationWareHouseInfos && ele.sourceOrganizationWareHouseInfos.length > 0) {
            this.wareHouseForm.patchValue(ele)
            this.wareHouseselected = ele.sourceOrganizationWareHouseInfos.map(x => x.wareHouseInfo.wareHouseIDName)
          }
        })
      }
    })
  }
  fetchReceiveAllocationType() {
    this.metaDataService.getReceiveLocationAllocationType(this.body).subscribe(res => {
      if (res.status == 0 && res.data.putawayLocationAllocationConfigurations && res.data.putawayLocationAllocationConfigurations.length > 0) {
        this.locReceiveAllocation = res.data.putawayLocationAllocationConfigurations[0];
      }
      else {
        this.locReceiveAllocation = { "_id": null, "putawayLocationAllocationType": "Manual", "isActive": true }
        if (!this.locReceiveAllocation._id) {
          this.saveReceiveAllocationType('Auto');
        }
      }
    })
  }
  saveSerialConfiguration(key) {
    this.serialNumberAllocation.serialNumberCheck = (key == 'No') ? 'Yes' : "No";
    this.serialNumberAllocation["wareHouseInfo"] = this.configService.getWarehouse();
    this.serialNumberAllocation["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateSerialNumber(JSON.stringify(this.serialNumberAllocation)).subscribe(data => {
      if (data.status == 0 && data.data.serialNumberConfiguration) {
        this.serialNumberAllocation = data.data.serialNumberConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  saveThirdpartyConfig(key) {
    this.thirdPartyCustomersCheckAllocation.thirdPartyCustomersCheck = (key == 'No') ? 'Yes' : "No";
    this.thirdPartyCustomersCheckAllocation["wareHouseInfo"] = this.configService.getWarehouse();
    this.thirdPartyCustomersCheckAllocation["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateThirdPartyCustomers(JSON.stringify(this.thirdPartyCustomersCheckAllocation)).subscribe(data => {
      if (data.status == 0 && data.data.thirdPartyCustomerConfiguration) {
        this.thirdPartyCustomersCheckAllocation = data.data.thirdPartyCustomerConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }

  saveAutoPutawayConfig(key) {
    this.autoPutaway.putawayGeneration = (key == 'No') ? 'Yes' : "No";
    this.autoPutaway["wareHouseInfo"] = this.configService.getWarehouse();
    this.autoPutaway["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateAutoPutaway(JSON.stringify(this.autoPutaway)).subscribe(data => {
      if (data.status == 0 && data.data.putawayGenerationConfiguration) {
        this.autoPutaway = data.data.putawayGenerationConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  savePickingConfigrationGenerations(key) {
    this.pickingGenerationConfigurations.pickingGeneration = (key == 'No') ? 'Yes' : "No";
    this.pickingGenerationConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
    this.pickingGenerationConfigurations["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdatePickingGenerationConfiguration(JSON.stringify(this.pickingGenerationConfigurations)).subscribe(data => {
      if (data.status == 0 && data.data.pickingGenerationConfiguration) {
        this.pickingGenerationConfigurations = data.data.pickingGenerationConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  saveGrnInvoiceConfiguration(key) {
    this.grnInvoiceConfigurations.grnInvoiceConfirmation = (key == 'No') ? 'Yes' : "No";
    this.grnInvoiceConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
    this.grnInvoiceConfigurations["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateGrnInvoiceConfiguration(JSON.stringify(this.grnInvoiceConfigurations)).subscribe(data => {

      if (data.status == 0 && data.data.grnInvoiceConfiguration) {
        this.grnInvoiceConfigurations = data.data.grnInvoiceConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  createConversionForm() {
    this.conversionForm = this.fb.group({
      "_id": null,
      "unitCode": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      "createdDate": null,
      "lastUpdatedDate": null
    })
  }
  saveConversionUnitConfig(event) {
    if (event) {
      const form = this.conversionForm.value;
      if (form.unitCode == "null") {
        form.unitCode = null;
      }
      this.metaDataService.saveorUpdateSpaceUtilizationConversionUnitConfiguration(form).subscribe(data => {
        if (data.status == 0 && data.data.spaceUtilizationConversionUnitConfiguration) {
          this.spaceUtilizationConversionUnitConfigurations = data.data.spaceUtilizationConversionUnitConfiguration;
          this.toastr.success(data.statusMsg);
        }
      })
    }
  }
  // saveorUpdateSpaceUtilizationConversionUnitConfiguration(key) {
  //   this.spaceUtilizationConversionUnitConfigurations.unitCode = (key == 'No') ? 'Yes' : "No";
  //   this.spaceUtilizationConversionUnitConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
  //   this.spaceUtilizationConversionUnitConfigurations["organizationInfo"] = this.configService.getOrganization();
  //   this.metaDataService.saveorUpdateSpaceUtilizationConversionUnitConfiguration(JSON.stringify(this.spaceUtilizationConversionUnitConfigurations)).subscribe(data => {
  //     if (data.status == 0 && data.data.spaceUtilizationConversionUnitConfiguration) {
  //       this.spaceUtilizationConversionUnitConfigurations = data.data.spaceUtilizationConversionUnitConfiguration;
  //       this.toastr.success(data.statusMsg);
  //     }
  //   })
  // }
  saveorUpdateDiscountConfiguration(key) {
    this.discountConfigurations.discountConfirmationCheck = (key == 'No') ? 'Yes' : "No";
    this.discountConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
    this.discountConfigurations["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateDiscountConfiguration(JSON.stringify(this.discountConfigurations)).subscribe(data => {
      if (data.status == 0 && data.data.discountConfirmation) {
        this.discountConfigurations = data.data.discountConfirmation;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  saveorUpdateShipmentGenerationConfiguration(key) {
    this.shipmentGenerationConfigurations.shipmentGeneration = (key == 'No') ? 'Yes' : "No";
    this.shipmentGenerationConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
    this.shipmentGenerationConfigurations["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateShipmentGenerationConfiguration(JSON.stringify(this.shipmentGenerationConfigurations)).subscribe(data => {

      if (data.status == 0 && data.data.shipmentGenerationConfiguration) {
        this.shipmentGenerationConfigurations = data.data.shipmentGenerationConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  saveorUpdatePDByLocationsConfiguration(key) {
    this.productDimensionByLocationConfigurations.calculateDimensions = (key == 'No') ? 'Yes' : "No";
    this.productDimensionByLocationConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
    this.productDimensionByLocationConfigurations["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdatePDLocationsConfiguration(JSON.stringify(this.productDimensionByLocationConfigurations)).subscribe(data => {
      if (data.status == 0 && data.data.productDimensionsByLocationConfiguration) {
        this.productDimensionByLocationConfigurations = data.data.productDimensionsByLocationConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }

  saveorUpdateProductByCustomerDimansionConfig(key) {
    this.productDimensionByCustomerConfigurations.mapping = (key == 'No') ? 'Yes' : "No";
    this.productDimensionByCustomerConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
    this.productDimensionByCustomerConfigurations["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateProductByCustomerConfig(JSON.stringify(this.productDimensionByCustomerConfigurations))
      .subscribe(data => {
        if (data.status == 0 && data.data.productByCustomerMappingConfiguration) {
          this.productDimensionByCustomerConfigurations = data.data.productByCustomerMappingConfiguration;
          this.toastr.success(data.statusMsg);
        }
      })
  }


  saveorUpdateProductBySupplierDimansionConfig(key) {
    this.productDimensionBySupplierConfigurations.mapping = (key == 'No') ? 'Yes' : "No";
    this.productDimensionBySupplierConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
    this.productDimensionBySupplierConfigurations["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateProductBySupplierConfig(JSON.stringify(this.productDimensionBySupplierConfigurations))
      .subscribe(data => {
        if (data.status == 0 && data.data.productBySupplierMappingConfiguration) {
          this.productDimensionBySupplierConfigurations = data.data.productBySupplierMappingConfiguration;
          this.toastr.success(data.statusMsg);
        }
      })
  }
  saveorUpdateSalesOrderDimensionConfig(key) {
    this.productDimensionBySalesOrderConfigurations.viewType = (key == 'No') ? 'Yes' : "No";
    this.productDimensionBySalesOrderConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
    this.productDimensionBySalesOrderConfigurations["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateProductBySalesOrderConfig(JSON.stringify(this.productDimensionBySalesOrderConfigurations))
      .subscribe(data => {
        if (data.status == 0 && data.data.salesOrderPanelViewConfiguration) {
          this.productDimensionBySalesOrderConfigurations = data.data.salesOrderPanelViewConfiguration;
          this.toastr.success(data.statusMsg);
        }
      })
  }
  saveorUpdateCopyCustomerToSuppliers(key) {
    this.copyCustomerToSuppliersConfigurations.copy = (key == 'No') ? 'Yes' : "No";
    this.copyCustomerToSuppliersConfigurations["wareHouseInfo"] = this.configService.getWarehouse();
    this.copyCustomerToSuppliersConfigurations["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateCopyCustomerToSupplierConfig(JSON.stringify(this.copyCustomerToSuppliersConfigurations))
      .subscribe(data => {
        if (data.status == 0 && data.data.copyCustomerToSupplierConfiguration) {
          this.copyCustomerToSuppliersConfigurations = data.data.copyCustomerToSupplierConfiguration;
          this.toastr.success(data.statusMsg);
        }
      })
  }
  saveGRNUploadConfig(key) {
    this.grnUploadConfig.receivedType = (key == 'No') ? 'Yes' : "No";
    this.grnUploadConfig["wareHouseInfo"] = this.configService.getWarehouse();
    this.grnUploadConfig["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateGRNUploadConfig(JSON.stringify(this.grnUploadConfig))
      .subscribe(data => {
        if (data.status == 0 && data.data.goodsReceiptReceivedTypeConfiguration) {
          this.grnUploadConfig = data.data.goodsReceiptReceivedTypeConfiguration;
          this.toastr.success(data.statusMsg);
        }
      })
  }
  savePutawayQConfig(key) {
    this.putawayQC.qualityCheck = (key == 'No') ? 'Yes' : "No";
    this.putawayQC["wareHouseInfo"] = this.configService.getWarehouse();
    this.putawayQC["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdatePutawayQCConfig(JSON.stringify(this.putawayQC))
      .subscribe(data => {
        if (data.status == 0 && data.data.putawayQualityCheckConfiguration) {
          this.putawayQC = data.data.putawayQualityCheckConfiguration;
          this.toastr.success(data.statusMsg);
        }
      })
  }
  savePickingQConfig(key) {
    this.pickingQC.qualityCheck = (key == 'No') ? 'Yes' : "No";
    this.pickingQC["wareHouseInfo"] = this.configService.getWarehouse();
    this.pickingQC["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdatePickingQCConfig(JSON.stringify(this.pickingQC))
      .subscribe(data => {
        if (data.status == 0 && data.data.pickingQualityCheckConfiguration) {
          this.pickingQC = data.data.pickingQualityCheckConfiguration;
          this.toastr.success(data.statusMsg);
        }
      })
  }
  saveBarcodeConfig(key) {
    this.barcodeConfigAllocation.barcodeCheck = (key == 'No') ? 'Yes' : "No";
    this.barcodeConfigAllocation["wareHouseInfo"] = this.configService.getWarehouse();
    this.barcodeConfigAllocation["organizationInfo"] = this.configService.getOrganization();
    this.bService.saveOrUpdateBarcodeConfig(JSON.stringify(this.barcodeConfigAllocation)).subscribe(data => {
      if (data.status == 0 && data.data.barcodeConfiguration) {
        this.barcodeConfigAllocation = data.data.barcodeConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  fetchAllSerialNumbers() {
    this.metaDataService.getAllSerialNumberConfigurations(this.body).subscribe(res => {
      if (res.status == 0 && res.data.serialNumberConfigurations && res.data.serialNumberConfigurations.length > 0) {
        this.serialNumberAllocation = res.data.serialNumberConfigurations[0];
      }
      else {
        this.serialNumberAllocation = { "_id": null, "serialNumberCheck": "No", "isActive": true }
        if (!this.serialNumberAllocation._id) {
          this.saveSerialConfiguration('Yes');
        }
      }
    })
  }
  fetchAllThirdParty() {
    this.metaDataService.getAllThirdpartyCustomers(this.body).subscribe(res => {
      if (res.status == 0 && res.data.thirdPartyCustomerConfigurations && res.data.thirdPartyCustomerConfigurations.length > 0) {
        this.thirdPartyCustomersCheckAllocation = res.data.thirdPartyCustomerConfigurations[0];
      }
      else {
        this.thirdPartyCustomersCheckAllocation = { "_id": null, "thirdPartyCustomersCheck": "No", "isActive": true }
        if (!this.thirdPartyCustomersCheckAllocation._id) {
          this.saveThirdpartyConfig('Yes');
        }
      }
    })
  }
  fetchAllAutoPutaway() {
    this.metaDataService.getAllAutoPutaway(this.body).subscribe(res => {
      if (res.status == 0 && res.data.putawayGenerationConfigurations && res.data.putawayGenerationConfigurations.length > 0) {
        this.autoPutaway = res.data.putawayGenerationConfigurations[0];
      }
      else {
        this.autoPutaway = { "_id": null, "putawayGeneration": "No" };
        if (!this.autoPutaway._id) {
          this.saveAutoPutawayConfig('Yes');
        }
      }
    })
  }

  fetchGrnInvoiceConfiguration() {
    this.metaDataService.getAllGrnInvoiceConfiguration(this.body).subscribe(res => {
      if (res.status == 0 && res.data.grnInvoiceConfigurations && res.data.grnInvoiceConfigurations.length > 0) {
        this.grnInvoiceConfigurations = res.data.grnInvoiceConfigurations[0];
      }
      else {
        this.grnInvoiceConfigurations = { "_id": null, "grnInvoiceConfirmation": "No" }
        if (!this.grnInvoiceConfigurations._id) {
          this.saveGrnInvoiceConfiguration('Yes');
        }
      }
    })
  }
  fetchPickingConfigrationGenerations() {
    this.metaDataService.getAllPickingGenerationsConfiguration(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.pickingGenerationConfigurations && res.data.pickingGenerationConfigurations.length > 0) {
        this.pickingGenerationConfigurations = res.data.pickingGenerationConfigurations[0];
      }
      else {
        this.pickingGenerationConfigurations = { "_id": null, "pickingGeneration": "No" };
        if (!this.pickingGenerationConfigurations._id) {
          this.savePickingConfigrationGenerations('Yes');
        }
      }
    })
  }
  spaceUtilizationConversionUnitConfiguration: any;
  fetchAllSpaceUtilizationConversionUnit() {
    this.metaDataService.findAllSpaceUtilizationConversionUnitConfigurations(this.body).subscribe(res => {
      if (res.status == 0 && res.data.spaceUtilizationConversionUnitConfigurations && res.data.spaceUtilizationConversionUnitConfigurations.length) {
        // this.spaceUtilizationConversionUnitConfiguration = res.data.spaceUtilizationConversionUnitConfigurations[0];
        this.conversionForm.patchValue(res.data.spaceUtilizationConversionUnitConfigurations[0]);
      }
      else {
        // this.spaceUtilizationConversionUnitConfiguration = { "_id": null, "unitCode": "No" };
        // if (!this.spaceUtilizationConversionUnitConfiguration._id) {
        //   this.saveorUpdateSpaceUtilizationConversionUnitConfiguration('Yes');
        // }
      }
    })
  }
  fetchAllShipmentGenerationConfigurations() {
    this.metaDataService.findAllShipmentGenerationConfigurations(this.body).subscribe(res => {
      if (res.status == 0 && res.data.shipmentGenerationConfigurations && res.data.shipmentGenerationConfigurations.length > 0) {
        this.shipmentGenerationConfigurations = res.data.shipmentGenerationConfigurations[0];
      }
      else {
        this.shipmentGenerationConfigurations = { "_id": null, "shipmentGeneration": "No" };
        if (!this.shipmentGenerationConfigurations._id) {
          this.saveorUpdateShipmentGenerationConfiguration('Yes');
        }
      }
    })
  }
  fetchAllPDbyLocationsConfigurations() {
    this.metaDataService.findAllPDLocationConfigurations(this.body).subscribe(res => {
      if (res.status == 0 && res.data.productDimensionsByLocationConfigurations && res.data.productDimensionsByLocationConfigurations.length > 0) {
        this.productDimensionByLocationConfigurations = res.data.productDimensionsByLocationConfigurations[0];
      }
      else {
        this.productDimensionByLocationConfigurations = { "_id": null, "calculateDimensions": "No" };
        if (!this.productDimensionByLocationConfigurations._id) {
          this.saveorUpdatePDByLocationsConfiguration('Yes');
        }
      }
    })
  }
  fetchAllPDbyCustomerConfigurations() {
    this.metaDataService.findAllCustomerConfigurations(this.body).subscribe(res => {
      if (res.status == 0 && res.data.productByCustomerMappingConfigurations && res.data.productByCustomerMappingConfigurations.length > 0) {
        this.productDimensionByCustomerConfigurations = res.data.productByCustomerMappingConfigurations[0];
      }
      else {
        this.productDimensionByCustomerConfigurations = { "_id": null, "mapping": "No" };
        if (!this.productDimensionByCustomerConfigurations._id) {
          this.saveorUpdateProductByCustomerDimansionConfig('Yes');
        }
      }
    })
  }
  fetchAllPDbySupplierConfigurations() {
    this.metaDataService.findAllSupplierConfigurations(this.body).subscribe(res => {
      if (res.status == 0 && res.data.productBySupplierMappingConfigurations && res.data.productBySupplierMappingConfigurations.length > 0) {
        this.productDimensionBySupplierConfigurations = res.data.productBySupplierMappingConfigurations[0];
      }
      else {
        this.productDimensionBySupplierConfigurations = { "_id": null, "mapping": "No" };
        if (!this.productDimensionBySupplierConfigurations._id) {
          this.saveorUpdateProductBySupplierDimansionConfig('Yes');
        }
      }
    })
  }
  fetchAllPDbySalesOrderConfigurations() {
    this.metaDataService.findAllSalesOrderConfigurations(this.body).subscribe(res => {
      if (res.status == 0 && res.data.salesOrderPanelViewConfigurations && res.data.salesOrderPanelViewConfigurations.length > 0) {
        this.productDimensionBySalesOrderConfigurations = res.data.salesOrderPanelViewConfigurations[0];
      }
      else {
        this.productDimensionBySalesOrderConfigurations = { "_id": null, "viewType": "No" };
        if (!this.productDimensionBySalesOrderConfigurations._id) {
          this.saveorUpdateSalesOrderDimensionConfig('Yes');
        }
      }
    })
  }
  fetchGrnUploadConfig() {
    this.metaDataService.findAllGRNUploadConfig(this.body).subscribe(res => {
      if (res.status == 0 && res.data.goodsReceiptReceivedTypeConfigurations && res.data.goodsReceiptReceivedTypeConfigurations.length > 0) {
        this.grnUploadConfig = res.data.goodsReceiptReceivedTypeConfigurations[0];
      }
      else {
        this.grnUploadConfig = { "_id": null, "receivedType": "No" };
        if (!this.grnUploadConfig._id) {
          this.saveGRNUploadConfig('Yes');
        }
      }
    })
  }
  fetchPutawayQCConfig() {
    this.metaDataService.findAllPutawayQCConfig(this.body).subscribe(res => {
      if (res.status == 0 && res.data.putawayQualityCheckConfigurations && res.data.putawayQualityCheckConfigurations.length > 0) {
        this.putawayQC = res.data.putawayQualityCheckConfigurations[0];
      }
      else {
        this.putawayQC = { "_id": null, "qualityCheck": "No" };
        if (!this.putawayQC._id) {
          this.savePutawayQConfig('Yes');
        }
      }
    })
  }
  fetchPickingQCConfig() {
    this.metaDataService.findAllPickingQCConfig(this.body).subscribe(res => {
      if (res.status == 0 && res.data.pickingQualityCheckConfigurations && res.data.pickingQualityCheckConfigurations.length > 0) {
        this.pickingQC = res.data.pickingQualityCheckConfigurations[0];
      }
      else {
        this.pickingQC = { "_id": null, "qualityCheck": "No" };
        if (!this.pickingQC._id) {
          this.savePickingQConfig('Yes');
        }
      }
    })
  }
  fetchAllCopyCustomerToSupplierConfigurations() {
    this.metaDataService.findAllCopyCustomerToSupplierConfigurations(this.body).subscribe(res => {
      if (res.status == 0 && res.data.copyCustomerToSupplierConfigurations && res.data.copyCustomerToSupplierConfigurations.length > 0) {
        this.copyCustomerToSuppliersConfigurations = res.data.copyCustomerToSupplierConfigurations[0];
      }
      else {
        this.copyCustomerToSuppliersConfigurations = { "_id": null, "copy": "No" };
        if (!this.copyCustomerToSuppliersConfigurations._id) {
          this.saveorUpdateCopyCustomerToSuppliers('Yes');
        }
      }
    })
  }
  fetchAllDiscountConfigurations() {
    this.metaDataService.findAllDiscountConfigurations(this.body).subscribe(res => {
      if (res.status == 0 && res.data.discountConfirmations && res.data.discountConfirmations.length > 0) {
        this.discountConfigurations = res.data.discountConfirmations[0];
      }
      else {
        this.discountConfigurations = { "_id": null, "discountConfirmationCheck": "No" };
        if (!this.discountConfigurations._id) {
          this.saveorUpdateDiscountConfiguration('Yes');
        }
      }
    })
  }
  fetchBarcodeConfig() {
    this.bService.fetchAllBarcodeConfig(this.body).subscribe(res => {
      if (res.status == 0 && res.data.barcodeConfigurations && res.data.barcodeConfigurations.length > 0) {
        this.barcodeConfigAllocation = res.data.barcodeConfigurations[0];
      }
      else {
        this.barcodeConfigAllocation = { "_id": null, "barcodeCheck": "No", "isActive": true }
        if (!this.barcodeConfigAllocation._id) {
          this.saveBarcodeConfig('Yes');
        }
      }
    })
  }
  salesOrderInventoryListResponce: any;
  salesOrderInventoryResponceList: any;
  saveSalesOrderWithinventory(key) {
    this.reqObjsalesOrderWithInventory.inventoryCheck = (key == 'No') ? 'Yes' : "No";
    this.reqObjsalesOrderWithInventory["wareHouseInfo"] = this.configService.getWarehouse();
    this.reqObjsalesOrderWithInventory["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveOrUpdateSalesOrderkWithInventoryDetails(JSON.stringify(this.reqObjsalesOrderWithInventory)).subscribe(data => {
      if (data.status == 0 && data.data.salesOrderInventoryConfiguration) {
        this.reqObjsalesOrderWithInventory = data.data.salesOrderInventoryConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  fetchAllSalesOrderWithinventoriesDetails() {
    this.metaDataService.fetchAllSalesOrderWithInventories(this.body).subscribe(res => {
      if (res.status == 0 && res.data.salesOrderInventoryConfigurations && res.data.salesOrderInventoryConfigurations.length > 0) {
        this.reqObjsalesOrderWithInventory = res.data.salesOrderInventoryConfigurations[0];
      }
      else {
        this.reqObjsalesOrderWithInventory = { "_id": null, "inventoryCheck": "No", "isActive": true }
        if (this.reqObjsalesOrderWithInventory._id) {
          this.saveSalesOrderWithinventory('Yes');
        }
      }
    })
  }




  fetchReturnAllocationType() {
    this.metaDataService.getReturnLocationAllocationType(this.body).subscribe(res => {
      if (res.status == 0 && res.data.putawayReturnLocationAllocationConfigurations && res.data.putawayReturnLocationAllocationConfigurations.length > 0) {
        this.locReturnAllocation = res.data.putawayReturnLocationAllocationConfigurations[0];
      }
      else {
        this.locReturnAllocation = { "_id": null, "putawayReturnLocationAllocationType": "Manual", "isActive": true };
        if (!this.locReturnAllocation._id) {
          this.saveReturnAllocationType('Auto');
        }
      }
    })
  }
  fetchZoneCapacity() {
    this.metaDataService.fetchAllZoneCapacity(this.body).subscribe(res => {
      if (res.status == 0 && res.data.zoneCapacityConfigurations && res.data.zoneCapacityConfigurations.length > 0) {
        this.zoneCapacityData = res.data.zoneCapacityConfigurations;
      }
      else {
        this.zoneCapacityData = []
      }
    })
  }


  getReturnLocationValue(data) {
    const zoneInfo = { zoneID: '', zoneName: '' };
    for (let i = 0; i < this.zones.length; i++) {
      if (data && data.originalObject && this.zones[i].zoneName === data.originalObject.zoneName) {
        zoneInfo.zoneID = this.zones[i]._id;
        zoneInfo.zoneName = this.zones[i].zoneName;
        const final = {};
        final['zoneInfo'] = zoneInfo;
        final['wareHouseInfo'] = this.configService.getWarehouse();
        final['organizationInfo'] = this.configService.getOrganization()
        this.metaDataService.saveorUpdateReturnLocationMap(JSON.stringify(final)).subscribe(response => {
          if (response.status == 0 || response.data.returnLocationMaps) {
            this.toastr.success('Saved Successfully');
            this.fetchAllReturnLocationMap();
          }
          else {
            if (response.status == 2) {
              this.toastr.error(response.statusMsg);
              // this.palletConfigurationToggle = false;
            }
          }
          // this.toastr.success('Saved Successfully');

        },
          error => { }
        );
        break;
      }
    }
  }
  savePalletConfiguration(event) {
    this.palletFormValue['palletConsideration'] = (event.target.checked) ? 'Yes' : 'No';
    this.palletFormValue["wareHouseInfo"] = this.configService.getWarehouse();
    this.palletFormValue["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.savePalletConfiguration(JSON.stringify(this.palletFormValue)).subscribe(res => {
      if (res.status == 0 && res.data.palletConfiguration) {
        this.toastr.success('Saved Successfully');
        this.fetchPalletConfiguration();
        this.palletConfigurationToggle = false;
      }
      else {
        if (res.status == 2) {
          this.toastr.error(res.statusMsg);
          this.palletConfigurationToggle = false;
        }
      }
    })
  }
  saveAllocationType(key) {
    this.locAllocation.pickingLocationAllocationType = (key == 'Manual') ? 'Auto' : "Manual";
    this.locAllocation["wareHouseInfo"] = this.configService.getWarehouse();
    this.locAllocation["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateLocationAllConfiguration(JSON.stringify(this.locAllocation)).subscribe(data => {
      if (data.status == 0 && data.data.pickingLocationAllocationConfiguration) {
        this.locAllocation = data.data.pickingLocationAllocationConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  saveReceiveAllocationType(key) {
    this.locReceiveAllocation.putawayLocationAllocationType = (key == 'Manual') ? 'Auto' : "Manual";
    this.locReceiveAllocation["wareHouseInfo"] = this.configService.getWarehouse();
    this.locReceiveAllocation["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateReceiveLocationAllConfiguration(JSON.stringify(this.locReceiveAllocation)).subscribe(data => {
      if (data.status == 0 && data.data.putawayLocationAllocationConfiguration) {
        this.locReceiveAllocation = data.data.putawayLocationAllocationConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }



  saveReturnAllocationType(key) {
    this.locReturnAllocation.putawayReturnLocationAllocationType = (key == 'Manual') ? 'Auto' : "Manual";
    this.locReturnAllocation["wareHouseInfo"] = this.configService.getWarehouse();
    this.locReturnAllocation["organizationInfo"] = this.configService.getOrganization();
    this.metaDataService.saveorUpdateReturnLocationAllConfiguration(JSON.stringify(this.locReturnAllocation)).subscribe(data => {
      if (data.status == 0 && data.data.putawayReturnLocationAllocationConfiguration) {
        this.locReturnAllocation = data.data.putawayReturnLocationAllocationConfiguration;
        this.toastr.success(data.statusMsg);
      }
    })
  }
  onItemAdded(item, type) {
    switch (type) {
      case 'storageTypeCode': {
        const form = {
          storageTypeCode: item.storageTypeCode,
          storageTypeDescription: item.storageTypeCode,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService.saveOrUpdateStorageType(JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllStorageTypes();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'productCategory': {
        const form = {
          productCategoryName: item.productCategoryName,
          productCategory: item.productCategoryName,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService.saveOrUpdateProductCategory(JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllProductCategories();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'productSubCategory1sResponseList': {
        const productSubCategory1 = {
          productSubCategory1Name: item.productSubCategory1Name,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService.saveorUpdateProductSubCategory1(JSON.stringify(productSubCategory1))
          .subscribe(
            response => {
              this.fetchingCommonSubCategory1s();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'productSubCategory2sResponseList': {
        const productSubCategory2 = {
          productSubCategory2Name: item.productSubCategory2Name,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService.saveorUpdateProductSubCategory2(JSON.stringify(productSubCategory2))
          .subscribe(
            response => {
              this.fetchingCommonSubCategory2s();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'productSubCategory3sResponseList': {
        const productSubCategory3 = {
          productSubCategory3Name: item.productSubCategory3Name,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService.saveorUpdateProductSubCategory3(JSON.stringify(productSubCategory3))
          .subscribe(
            response => {
              this.fetchingCommonSubCategory3s();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'brandConfigurationResponceList': {
        const brandConfigurationForm = {
          "brandName": item.brandName,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        console.log(brandConfigurationForm);
        this.metaDataService.saveorUpdateBrandConfiguration(JSON.stringify(brandConfigurationForm))
          .subscribe(
            response => {
              this.fetchingAllBrandConfigurations();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'shipmentTime': {
        const form = {
          shipmentTimeSlotName: item.shipmentTimeSlotName,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService
          .saveorUpdateShipmentTimeSlot(
            JSON.stringify(form)
          )
          .subscribe(
            response => {
              this.fetchAllShipmentTimeSlots();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'paymentMode': {
        const form = {
          paymentModeName: item.paymentModeName,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService
          .saveorUpdatePaymentMode(
            JSON.stringify(form)
          )
          .subscribe(
            response => {
              this.fetchAllPaymentMode();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'palletSize': {
        const form = {
          palletSizeName: item.palletSizeName,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService
          .saveOrUpdatePalletSize(
            JSON.stringify(form)
          )
          .subscribe(
            response => {
              this.fetchAllPalletSizes();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'country': {
        const form = {
          name: item.name,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService
          .saveOrUpdateCountryDetails(
            JSON.stringify(form)
          )
          .subscribe(
            response => {
              this.fetchAllCountries();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }


      case 'Currency': {
        const form = {
          currency: item.currency,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService
          .saveorUpdateCurrencies(
            JSON.stringify(form)
          )
          .subscribe(
            response => {
              this.fetchAllCurrencies();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'equipType': {
        const form = {
          name: item.name,
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService.saveorUpdateEquipmentType(
          JSON.stringify(form)
        )
          .subscribe(
            response => {
              this.fetchAllEquipmentType();
              this.showSaveMsg(response);
            },
            error => {
              this.toastr.error('Duplicate Found');
            }
          );
        break;
      }
      case 'taxGroup': {
        const form = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          taxGroup: item.taxGroup,
          taxGroupDescription: item.taxGroup
        }
        this.metaDataService
          .saveorUpdateTaxGroup(
            JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllTaxGroups();
              this.showSaveMsg(response);
            },
            error => {
              this.toastr.error('Duplicate Found');
            });
        break;
      }
      case 'taxType': {
        this.metaDataService
          .saveorUpdateTaxTypes(
            JSON.stringify({ country_id: this.countryTaxTypesList.country_id, taxTypes: item.taxTypes })
          )
          .subscribe(
            response => {
              this.fetchAllTaxTypes();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'unit': {
        const form = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          unitCode: item.unitCode
        }
        this.metaDataService.saveOrUpdateUnit(JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllUnits();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'term': {
        const form = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          termsOfPaymentCode: item.termsOfPaymentCode
        }
        this.metaDataService.saveOrUpdateTermOfPayments(JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllTermOfPayments();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'pickingType': {
        const form = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          packingTypeName: item.packingTypeName
        }
        this.metaDataService.saveOrUpdatePickingType(JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllPickingType();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'role': {
        const form = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          roleName: item.roleName
        }
        this.metaDataService
          .saveorUpdateRole(
            JSON.stringify(form)
          )
          .subscribe(
            response => {
              this.fetchAllRoles();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'termsAndConditionsForPO': {
        const form = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          termsAndConditions: item.termsAndConditions, type: 'po'
        }
        this.metaDataService.saveorUpdateTermsAndCondition(JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllTermsAndConditions();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'termsAndConditionsForSO': {
        const form = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          termsAndConditions: item.termsAndConditions, type: 'so'
        }
        this.metaDataService.saveorUpdateTermsAndCondition(JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllTermsAndConditions();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'termsAndConditionsForInvoice': {
        const form = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          termsAndConditions: item.termsAndConditions, type: 'invoice'
        }
        this.metaDataService.saveorUpdateTermsAndCondition(JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllTermsAndConditions();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'locationName': {
        const locationInfo = { locationID: '', locationName: '' };
        for (let i = 0; i < this.locations.length; i++) {
          if (this.locations[i].locationName === item.locationName) {
            locationInfo.locationID = this.locations[i]._id;
            locationInfo.locationName = this.locations[i].locationName;
            this.metaDataService.saveorUpdateCrossDockingMap(JSON.stringify({ crossDockingMap: { locationInfo } }))
              .subscribe(
                response => {
                  this.fetchAllCrossDockingMap();
                },
                error => { }
              );
          }
          break;
        }
        break;
      }
      case 'homePageText': {
        const form = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          homePage: item.homePage
        }
        this.metaDataService.saveorUpdateHomePageText(JSON.stringify(form))
          .subscribe(
            response => {
              this.fetchAllHomePageText();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'column': {
        this.metaDataService.saveorUpdateColumns(JSON.stringify({ column: item.column }))
          .subscribe(
            response => {
              this.fetchAllColumns();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'loginText': {
        const formReq = {
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
          loginText: item.loginText
        }
        this.metaDataService.saveorUpdateLoginPageText(JSON.stringify(formReq))
          .subscribe(
            response => {
              this.fetchAllLoginPageText();
              this.showSaveMsg(response);
            },
            error => { }
          );
        break;
      }
      case 'zoneCapacityName': {
        const formValue = {
          "_id": null,
          "zoneCapacity": parseInt(this.zoneCapacityData[0].zoneCapacity),
          "wareHouseInfo": this.configService.getWarehouse(),
          "organizationInfo": this.configService.getOrganization(),
        }
        this.metaDataService.saveorUpdateZoneCapacity(JSON.stringify(formValue))
          .subscribe(
            response => {
              this.showSaveMsg(response);
              this.fetchZoneCapacity();
            },
            error => { }
          );
        break;
      }
    }
  }
  onItemRemoved(item, type) {
    if (item && item._id && type) {
      this.deleteInfo = { name: type, id: item._id };
    } else if (item && item.zoneID && type) {
      const zone = this.returnLocations.find(z => z.zoneInfo.zoneName === item.zoneName);
      this.deleteInfo = { name: type, id: zone._id };
    }
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  getConfirmation(type) {
    switch (type) {
      case 'storageTypeCode': this.fetchAllStorageTypes(); break;
      case 'productCategory': this.fetchAllProductCategories(); break;
      case 'shipmentTimeSlotName': this.fetchAllShipmentTimeSlots(); break;
      case 'paymentModeName': this.fetchAllPaymentMode(); break;
      case 'palletSizeName': this.fetchAllPalletSizes(); break;
      case 'Country': this.fetchAllCountries(); break;
      case 'currency': this.fetchAllCurrencies(); break;
      case 'deleteEquipment': this.fetchAllEquipmentType(); break;
      case 'taxGroup': this.fetchAllTaxGroups(); break;
      case 'taxType': this.fetchAllTaxTypes(); break;
      case 'unitCode': this.fetchAllUnits(); break;
      case 'termOfPayment': this.fetchAllTermOfPayments(); break;
      case 'pickingType': this.fetchAllPickingType(); break;
      case 'role': this.fetchAllRoles(); break;
      case 'termsAndConditions': this.fetchAllTermsAndConditions(); break;
      case 'homePage': this.fetchAllHomePageText(); break;
      case 'column': this.fetchAllColumns(); break;
      case 'loginText': this.fetchAllLoginPageText(); break;
      case 'returnLocationMap': this.fetchAllReturnLocationMap(); break;
      case 'locationName': this.fetchAllCrossDockingMap(); break;
      case 'zoneCapacityName': this.fetchZoneCapacity(); break;
      case 'productSubCategory1sResponseList': this.fetchingCommonSubCategory1s(); break;
      case 'productSubCategory2sResponseList': this.fetchingCommonSubCategory2s(); break;
      case 'productSubCategory3sResponseList': this.fetchingCommonSubCategory3s(); break;
      case 'brandConfigurationResponceList': this.fetchingAllBrandConfigurations(); break;

    }
  }
  fetchAllStorageTypes() {
    this.metaDataService.fetchAllStorageTypes(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.storageTypes && response.data.storageTypes.length) {
          this.storageTypes = response.data.storageTypes;
        }
        else {
          this.storageTypes = [];
        }
      },
      error => {
        this.storageTypes = [];
      }
    );
  }

  fetchAllProductCategories() {
    this.metaDataService.fetchAllProductCategories(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length) {
          this.productCategories = response.data.productCategories;
        }
        else {
          this.productCategories = [];
        }
      },
      error => {
        this.productCategories = [];
      }
    );
  }

  fetchingCommonSubCategory1s() {
    this.metaDataService.fetchAllCommonSubCategory1s(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory1s) {
          this.productSubCategory1sResponseList = response.data.productSubCategory1s;
        }
        else {
          this.productSubCategory1sResponseList = [];
        }
      },
      error => {
        this.productSubCategory1sResponseList = [];
      }
    );
  }

  fetchingCommonSubCategory2s() {
    this.metaDataService.fetchAllCommonSubCategory2s(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory2s) {
          this.productSubCategory2sResponseList = response.data.productSubCategory2s;
        }
        else {
          this.productSubCategory2sResponseList = [];
        }
      },
      error => {
        this.productSubCategory2sResponseList = [];
      }
    );
  }

  fetchingCommonSubCategory3s() {
    this.metaDataService.fetchAllCommonSubCategory3s(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory3s) {
          this.productSubCategory3sResponseList = response.data.productSubCategory3s;
        }
        else {
          this.productSubCategory3sResponseList = [];
        }
      },
      error => {
        this.productSubCategory3sResponseList = [];
      }
    );
  }
  fetchingAllBrandConfigurations() {
    this.metaDataService.fetchAllBrandConfigurations(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.brandConfigurations) {
          this.brandConfigurationResponceList = response.data.brandConfigurations;

        }
        else {
          this.brandConfigurationResponceList = [];
        }
      },
      error => {
        this.brandConfigurationResponceList = [];
      }
    );
  }
  /*   subCategory() {
      this.metaDataService.fetchAllProductCategories(this.body).subscribe(
        response => {
          if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length) {
            this.productCategories = response.data.productCategories;
          }
          else {
            this.productCategories = [];
          }
        },
        error => {
          this.productCategories = [];
        }
      );
    } */
  fetchAllShipmentTimeSlots() {
    this.metaDataService.fetchAllShipmentTimeSlots(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.shipmentTimeSlots && response.data.shipmentTimeSlots.length) {
          this.shipmentTimeSlots = response.data.shipmentTimeSlots;
        }
        else {
          this.shipmentTimeSlots = [];
        }
      },
      error => {
        this.shipmentTimeSlots = [];
      }
    );
  }
  fetchAllPaymentMode() {
    this.metaDataService.fetchAllPaymentMode(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.paymentModes && response.data.paymentModes.length) {
          this.paymentModes = response.data.paymentModes;
        }
        else {
          this.paymentModes = [];
        }
      },
      error => {
        this.paymentModes = [];
      }
    );
  }
  fetchAllPalletSizes() {
    this.metaDataService.fetchAllPalletSizes(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.palletSizes && response.data.palletSizes.length) {
          this.palletSizes = response.data.palletSizes;
        }
        else {
          this.palletSizes = [];
        }
      },
      error => {
        this.palletSizes = [];
      }
    );
  }
  fetchAllCountries() {
    this.metaDataService.findAllCountries(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.countries && response.data.countries.length) {
          this.countries = response.data.countries;
        }
        else {
          this.countries = [];
        }
      },
      error => {
        this.countries = [];
      }
    );
  }
  fetchAllCurrencies() {
    this.metaDataService.fetchAllCurrencies(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.currencies && response.data.currencies.length) {
          this.currencies = response.data.currencies;
        }
        else {
          this.currencies = [];
        }
      },
      error => {
        this.currencies = [];
      }
    )
  }

  fetchAllEquipmentType() {
    this.metaDataService.fetchAllEquipmentTypes(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.equipmentTypes && response.data.equipmentTypes.length) {
          this.equipmentType = response.data.equipmentTypes;
        }
        else {
          this.equipmentType = [];
        }
      },
      error => {
        this.equipmentType = [];
      }
    )
  }

  fetchAllColumns() {
    this.wmsService.fetchAllColumns(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.columns && response.data.columns.length) {
          this.columns = response.data.columns;
        }
      },
      error => {
        this.columns = [];
      }
    )
  }
  fetchAllTaxGroups() {
    this.metaDataService.fetchAllTaxGroups(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.taxGroups && response.data.taxGroups.length) {
          this.taxGroups = response.data.taxGroups;
        }
        else {
          this.taxGroups = [];
        }
      },
      error => {
        this.taxGroups = [];
      }
    )
  }
  fetchAllTaxTypes() {
    this.metaDataService.fetchAllTaxTypes().subscribe(
      response => {
        if (response && response.status === 0 && response.data.countryTaxTypesList && response.data.countryTaxTypesList.length) {
          this.countryTaxTypesList = response.data.countryTaxTypesList;
        }
      },
      error => {
        this.countryTaxTypesList = [];
      });
  }

  fetchAllUnits() {
    this.metaDataService.fetchAllUnits(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.units && response.data.units.length) {
          this.units = response.data.units;
        }
        else {
          this.units = [];
        }
      },
      error => {
        this.units = [];
      });
  }

  fetchAllTermOfPayments() {
    this.metaDataService.fetchAllTermOfPayments(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.termsOfPayments && response.data.termsOfPayments.length) {
          this.termOfPayments = response.data.termsOfPayments;
        }
        else {
          this.termOfPayments = [];
        }
      },
      error => {
        this.termOfPayments = [];
      });
  }
  fetchAllPickingType() {
    this.metaDataService.fetchAllPickingType(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.packingTypes && response.data.packingTypes.length) {
          this.pickingTypes = response.data.packingTypes;
        }
        else {
          this.pickingTypes = [];
        }
      },
      error => {
        this.pickingTypes = [];
      });

  }
  fetchAllCrossDockingMap() {
    this.metaDataService.fetchAllCrossDockingMap(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.crossDockingMaps) {
          this.crossDockingMappingsForRef = response.data.crossDockingMaps;
          const crossDockingMappings = [];
          response.data.crossDockingMaps.forEach(map => {
            map['locationInfo']['_id'] = map._id;
            crossDockingMappings.push(map.locationInfo);
          });
          this.crossDockingMappings = crossDockingMappings;
        }
        else {
          this.crossDockingMappings = [];
        }
      },
      error => {
        this.crossDockingMappings = [];
      });
  }
  fetchAllReturnLocationMap() {
    this.metaDataService.fetchAllReturnLocationMap(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.returnLocationMaps) {
          this.returnLocations = response.data.returnLocationMaps;
          const returnLocationMappings = [];
          response.data.returnLocationMaps.forEach(map => {
            returnLocationMappings.push(map.zoneInfo);
          });
          this.returnLocationMappings = returnLocationMappings;
        }
        else {
          this.returnLocationMappings = [];
        }
      },
      error => {
      });
  }
  fetchAllTermsAndConditions() {
    this.termsAndConditionsForPO = [];
    this.termsAndConditionsForSO = [];
    this.termsAndConditionsForInvoice = [];
    this.metaDataService.fetchAllTermsAndConditions(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.TermsAndConditions && response.data.TermsAndConditions.length) {
          response.data.TermsAndConditions.forEach(termsAndCondition => {
            if (termsAndCondition.type === 'po') {
              this.termsAndConditionsForPO.push(termsAndCondition);
            } else if (termsAndCondition.type === 'so') {
              this.termsAndConditionsForSO.push(termsAndCondition);
            } else {
              this.termsAndConditionsForInvoice.push(termsAndCondition);
            }
          });
        }
        else {
          this.termsAndConditionsForPO = [];
        }
      },
      error => {
        this.termsAndConditionsForPO = [];
      });
  }
  fetchAllRoles() {
    this.metaDataService.fetchAllRoles(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.roles && response.data.roles.length) {
          this.rolesList = response.data.roles;
        }
        else {
          this.rolesList = [];
        }
      },
      error => {
        this.rolesList = [];
      });
  }
  fetchAllHomePageText() {
    this.metaDataService.fetchAllHomePageText(this.body).subscribe(
      response => {
        if (response && response.status === 0 && response.data.HomePageText && response.data.HomePageText.length) {
          this.homePageTexts = response.data.HomePageText;
        }
        else {
          this.homePageTexts = [];
        }
      },
      error => {
        this.homePageTexts = [];
      });
  }
  fetchAllLoginPageText() {
    this.metaDataService.fetchAllLoginPageTextForParameters({}).subscribe(
      response => {
        if (response && response.status === 0 && response.data.LoginText && response.data.LoginText.length) {
          this.loginPageTexts = response.data.LoginText;
        }
        else {
          this.loginPageTexts = [];
        }
      },
      error => {
        this.loginPageTexts = [];
      });
  }
  getRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_CLIENT', 'ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  showSaveMsg(response) {
    if (response && response.status === 0) {
      this.toastr.success('Saved successfully');
    } else if (response && response.status === 2) {
      this.toastr.error(response.statusMsg);
    } else {
      this.toastr.error('Failed in saving');
    }
  }
  showDeleteMsg(response) {
    if (response && response.status === 0) {
      this.toastr.success('Deleted successfully');
    } else if (response && response.status === 2) {
      this.toastr.error(response.statusMsg);
    } else {
      this.toastr.error('Failed in deleting');
    }
  }

  uploadFiles(event) {
    if (event && event.target.files) {
      this.metaDataService.uploadImage(event.target.files[0]).subscribe(res => {
        if (res['status'] == 0 && res['data']['fileName']) {
          const form = {
            "_id": this.logoList._id ? this.logoList._id : null,
            "logoName": res['data']['fileName'],
            "organizationInfo": this.configService.getOrganization(),
            "wareHouseInfo": this.configService.getWarehouse(),
          }
          this.metaDataService.saveorUpdateLogo(form).subscribe(data => {
            if (data.status == 0 && data.data.logo) {
              if (form._id) {
                this.deleteImageMethod(this.logoList.logoName);
              }
              this.toastr.success('Saved Successfully');
              this.logoList = data.data.logo;
            }
            else {
              this.toastr.error("Failed");
              this.deleteImageMethod(res['data']['fileName']);
            }
          })
        }
      })
    }
  }

  deleteApplicationLogo() {
    this.metaDataService.deleteLogo(this.logoList, this.body).subscribe(data => {
      if (data.status == 0) {
        this.toastr.success("Deleted Successfully");
        this.deleteImageMethod(this.logoList.logoName);
        this.logoList = { "_id": null, "logoName": null };
      }
      else {
        this.toastr.error("Failed");
      }
    })
  }
  deleteImageMethod(fileName) {
    this.metaDataService.deleteImage(fileName).subscribe(res => {
    })
  }
  imageConfigSave(event) {
    this.imageJSON.screenNames = this.imageselected;
    this.metaDataService.saveImageConfig(this.imageJSON).subscribe(res => {
      if (res['status'] == 0 && res['data']['imageConfiguration']) {
        this.fetchImageConfig();
      }
    })
  }
  createWarehouseForm() {
    this.wareHouseForm = this.fb.group(
      {
        _id: null,
        destinationWareHouseInfo: this.configService.getWarehouse(),
        sourceOrganizationWareHouseInfos: null,
        destinationOrganizationInfo: this.configService.getOrganization(),
        organizationInfo: this.configService.getOrganization(),
        wareHouseInfo: this.configService.getWarehouse(),
        dummyValue: [null]
      })
  }
  sourceWarehouseConfigSave() {
    let arr: any = []
    this.wareHouseselected.forEach(el => {
      this.wareHouseResponceList.forEach(ele => {
        if (ele.wareHouseIDName === el) {
          let org = {
            "wareHouseMasterID": ele._id,
            "wareHouseID": ele.wareHouseID,
            "wareHouseName": ele.wareHouseName,
            "wareHouseIDName": ele.wareHouseIDName
          }
          const obje = {
            "organizationInfo": this.configService.getOrganization(),
            "wareHouseInfo": org
          }
          arr.push(obje)
        }
      })
    })
    if (arr.length > 0) {
      this.wareHouseForm.controls.sourceOrganizationWareHouseInfos.patchValue(arr)
      const form = this.wareHouseForm.value
      delete form.dummyValue
      this.metaDataService.saveSourceWarehouseConfig(form).subscribe(res => {
        if (res['status'] == 0 && res['data']['wareHouseTransferConfiguration']) {
          this.toastr.success("Saved Successfully");
          this.fetchAllWareHousesConfigurations();
        }
      })
    }
    else {
      this.deletionS.deleteSourceWarehouses(this.formObj, this.wareHouseForm.value._id).subscribe(res => {
        if (res['status'] == 0 && res['data']['wareHouseTransferConfiguration']) {
          this.toastr.success("Deleted Successfully");
          this.fetchAllWareHousesConfigurations();
        }
      })
    }
  }

}

