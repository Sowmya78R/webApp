import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DeletionService } from '../../../services/integration-services/deletion.service';
import { MetaDataService } from '../../../services/integration-services/metadata.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { AppService } from 'src/app/shared/services/app.service';

@Component({
  selector: 'app-delete-popup',
  templateUrl: './delete-popup.component.html'
})
export class DeletePopupComponent implements OnInit, OnChanges {
  @Input() getInfo: any;
  @Output() sendConfirmation = new EventEmitter();
  info: any;
  details = {}
  constructor(
    public ngxSmartModalService: NgxSmartModalService, private appService: AppService,
    private deletionService: DeletionService,
    private metaDataService: MetaDataService,
    private toastr: ToastrService, private configService: ConfigurationService) {
  }
  ngOnChanges() {
    this.info = this.getInfo;
    this.details = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
    }
  }
  ngOnInit() {
  }
  delete() {
    switch (this.info.name) {
      case 'Vehicle': {
        this.deletionService.deleteVehicleRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'BillOfResources': {
        this.deletionService.deleteBillOfResourceRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'Customer': {
        this.deletionService.deleteCustomerRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'Product': {
        this.deletionService.deleteProductRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'Supplier': {
        this.deletionService.deleteSupplierRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'serviceProvider': {
        this.deletionService.deleteServiceProvider(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'vehicleByTranporter': {
        this.deletionService.deleteVehicleByServiceProvider(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {
          }
        );
        break;
      }
      case 'equipment': {
        console.log(this.details);
        this.deletionService.deleteEquipmentRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'billToAddress': {
        console.log(this.details);
        this.deletionService.deleteBillToAddressRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'level': {
        this.deletionService.deleteLevelRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'location': {
        this.deletionService.deleteLocationRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {
          }
        );
        break;
      }
      case 'pickingStrategy': {
        this.deletionService.deletePickingStrategyRecord(this.info.id, this.info.zoneID, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'productStrategy': {
        this.deletionService.deleteProductStrategyRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'putawayStrategy': {
        this.deletionService.deletePutawayStrategyRecord(this.info.id, this.info.zoneID, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'packingTypeDelete': {
        this.deletionService.deletePackigTypeRecordDetails(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'rack': {
        this.deletionService.deleteRackRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'zone': {
        this.deletionService.deleteZoneRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'warehouseTeam': {
        this.deletionService.deleteWarehouseTeamRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'warehouse': {
        this.deletionService.deleteWarehouseRecord(this.info.id).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'userConfig': {
        this.deletionService.deleteUserRecord(this.info.id).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'replenishment': {
        this.deletionService.deleteReplenishmentRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'storageTypeCode': {

        this.metaDataService.deleteStorageType(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'productCategory': {
        this.metaDataService.deleteProductCategory(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'productSubCategory1sResponseList': {
        this.metaDataService.deleteSubCategory1sResponseList(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'productSubCategory2sResponseList': {
        this.metaDataService.deleteSubCategory2sResponseList(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'productSubCategory3sResponseList': {
        this.metaDataService.deleteSubCategory3sResponseList(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'shipmentTimeSlotName': {
        this.metaDataService.deleteShipmentTime(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'paymentModeName': {
        this.metaDataService.deletePaymentMode(this.info.id, this.details).subscribe(
          response => {

            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'palletSizeName': {
        this.metaDataService.deletePalletSize(this.info.id, this.details).subscribe(
          response => {

            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'Country': {
        this.metaDataService.deleteCountry(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'currency': {
        this.metaDataService.deleteCurrencies(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'deleteEquipment': {
        this.metaDataService.deleteEquipmentType(this.info.id, this.details).subscribe(
          response => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
            /*  this.populateDeletionStatus(response, this.info.name); */
          },
          error => { }
        );
        break;
      }

      case 'taxGroup': {
        this.metaDataService.deleteTaxGroups(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'taxType': {
        this.metaDataService.deleteTaxTypes(this.info.id).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'unitCode': {
        this.metaDataService.deleteUnit(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'role': {
        this.metaDataService.deleteRole(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }

      case 'termsAndConditions': {
        this.metaDataService.deleteTermsAndCondition(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }

      case 'termOfPayment': {
        this.metaDataService.deleteTermsOfPayment(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }

      case 'homePage': {
        this.metaDataService.deleteHomePageText(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }

      case 'column': {
        this.metaDataService.deleteColumns(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'loginText': {
        this.metaDataService.deleteLoginPageText(this.info.id, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'productBySupplier': {
        this.deletionService.deleteProductBySupplierRecord(this.info.id, this.info.productMasterID, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'productsByCustomer': {
        this.deletionService.deleteProductByCustomerRecord(this.info.id, this.info.productMasterID, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'billingPo': {
        this.deletionService.deleteBillingPORecord(this.info.id).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'UOM': {
        this.deletionService.deleteUOMRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'returnLocationMap': {
        this.deletionService.deleteReturnLocationMap(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'locationName': {
        this.metaDataService.deleteCrossDockingMap(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'zoneCapacityName': {
        this.metaDataService.softDeleteZoneCapacity(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'abcanalysisclass': {
        this.metaDataService.deleteAbcAnalysisClass(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'organization': {
        this.deletionService.deleteOrganization(this.info.id).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'wareHouseConfig': {
        this.deletionService.deleteWareHouseConfig(this.info.id).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'salesOrder': {
        const final = { "lineId": this.info.id, "id": this.appService.getParam('id') };
        this.deletionService.deleteSalesOrder((this.appService.getParam('id') ? final : { "lineId": '', "id": this.info.id }), this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'purchaseOrder': {
        const final = { "lineId": this.info.id, "id": this.appService.getParam('id') };
        this.deletionService.deletePurchaseOrder((this.appService.getParam('id') ? final : { "lineId": null, "id": this.info.id }), this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'wareHouseTransfer': {
        this.deletionService.deleteWareHouseTransfer(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'productBarcodeConfig': {
        this.deletionService.deleteProdBConfig(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'processBarcodeConfig': {
        this.deletionService.deleteProcesssBConfig(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'userBarcodeAccessConfig': {
        this.deletionService.deleteUserBarcodeAccess(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'accountingSpaceUtilization': {
        this.deletionService.deleteAccountinSpaceUtilizationtRecord(this.info.id, this.details).subscribe(
          (response) => {
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'grNote': {
        this.deletionService.deleteGRNote(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'salesReturn': {
        this.deletionService.deleteSalesReturn(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'Taxes': {
        this.deletionService.deleteTaxMaster(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'State': {
        this.deletionService.deleteStateMaster(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'damagedStock': {
        this.deletionService.deleteDamagedStock(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'replacementOrder': {
        this.deletionService.deleteReplacementOrder(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'schedulesScreenConfiguration': {
        this.deletionService.deleteSchedulerScreenDetails(this.info, this.details).subscribe(
          (response) => {
            /*  this.populateDeletionStatus(response, 'Yes'); */
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'applicationUrl': {
        this.deletionService.deleteApplicationUrlDetails(this.info.id).subscribe(
          (response) => {
            /*  this.populateDeletionStatus(response, 'Yes'); */
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }
      case 'financialYearConfig': {
        this.deletionService.deleteFinancialYearConfigDetails(this.info.id, this.details).subscribe(
          (response) => {
            /*  this.populateDeletionStatus(response, 'Yes'); */
            if (response && response.status === 0) {
              this.toastr.success('Deleted successfully');
              this.sendConfirmation.emit('Yes');
            } else {
              this.toastr.error('Failed in deleting');
            }
          },
          (error) => {

          }
        );
        break;
      }

      case 'purchaseReturn': {
        this.deletionService.deletePurchaseReturn(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'productCategoryGroup': {
        this.deletionService.deleteProductCategoryGroup(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'brandConfigurationResponceList': {
        this.deletionService.deleteBrandConfiguration(this.info, this.details).subscribe(
          (response) => {
            this.populateDeletionStatus(response, 'Yes');
          },
          (error) => {

          }
        );
        break;
      }
      case 'promotions': {
        this.deletionService.deletePromotions(this.info, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
      case 'promotionPolicy': {
        this.deletionService.deletePromotionsPolicys(this.info, this.details).subscribe(
          response => {
            this.populateDeletionStatus(response, this.info.name);
          },
          error => { }
        );
        break;
      }
    }
  }
  undo() {
    this.sendConfirmation.emit(this.info.name);
  }
  populateDeletionStatus(response, type) {
    if (response && response.status === 0) {
      this.toastr.success('Deleted successfully');
      this.sendConfirmation.emit(type);
    }
    else if (response.status == 2) {
      this.toastr.error(response.statusMsg);
    }
    else {
      this.toastr.error('Failed in deleting');
    }
  }
}
