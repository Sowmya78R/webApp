import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { WMSService } from '../../../services/integration-services/wms.service';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { ApexService } from '../../../shared/services/apex.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { VASRestService } from '../../../services/integration-services/vas-rest.service';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../shared/services/app.service';
import { EmitterService } from '.././../../services/emitter.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { DecimalUtils } from 'src/app/constants/decimal';
@Component({
  selector: 'app-billing-po-invoice',
  templateUrl: './billing-po-invoice.component.html',
  styles: [`
    fieldSet {
      margin-inline-start: 2px;
      margin-inline-end: 2px;
      padding-block-start: 0.35em;
      padding-inline-start: 0.75em;
      padding-inline-end: 0.75em;
      padding-block-end: 0.625em;
      min-inline-size: min-content;
      border-width: 2px;
      border-style: groove;
      border-color: #15d6ce;
      border-image: initial;
    }
    legend {
      display: block;
      max-width: 7.8rem;
      font-size: 16px;
      padding-inline-start: 2px;
      padding-inline-end: 2px;
      border-width: initial;
      border-style: none;
      border-color: initial;
      border-image: initial;
      margin-bottom: 0px;
      font-weight: 500;
    }
    .fa-trash {
      font-size: 18px;
      margin-bottom: 5px;
      padding: 6px 12px;
      cursor: pointer;
    }

  `]
})
export class BillingPoInvoiceComponent implements OnInit, OnDestroy {
  billingPOForm: FormGroup;
  packingMaterialForm: FormGroup;
  labourChargesForm: FormGroup;
  palletPositionHiredForm: FormGroup;
  additionalPalletPositionHiredForm: FormGroup;
  flatRateForm: FormGroup;
  variableRateForm: FormGroup;
  mechanicalRateForm: FormGroup;
  suppliers: any = [];
  supplierIDNames: CompleterData;
  supplierIDName: any;
  supplierMasterInfo: any = {};
  wareHouseInfo: any = {};
  organizationInfo: any = {};
  flatRateLoading: any;
  mechanicalRate: FormArray;
  packingMaterialList: FormArray;
  labourChargesList: FormArray;
  totalAmount: any = 0;
  vehicles: any = [];
  equipments: any = [];
  loading: FormArray;
  unloading: FormArray;
  vehicleTypes: any = [];
  equipmentTypes: any = [];
  id: any;
  billingPurchaseOrder: any = {};
  purchaseOrderIds: CompleterData;
  selectedPurchaseOrderId: any;
  billingPurchaseOrders: any = [];
  warehouseTeams: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Billing', 'Billing PO Invoice', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  loadingTotal: number = null;
  unLoadingTotal: any = null;
  packingTotal: number = null;
  labourChargesTotal: number = null;

  constructor(
    private wmsService: WMSService,
    private completerService: CompleterService,
    private emitterService: EmitterService,
    private fb: FormBuilder,
    private apexService: ApexService, private configService: ConfigurationService,
    private commonMasterDataService: CommonMasterDataService,
    private vasRestService: VASRestService,
    private toastr: ToastrService,
    private appService: AppService,
    private translate: TranslateService,
  ) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    /*  this.forPermissionsSubscription = this.configService.forPermissions$.subscribe(data => {
       if (data) {
         this.formObj = this.configService.getGlobalpayload();
         this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Accounting', 'Billing PO Invoice', Storage.getSessionUser());
       }
     }) */
    this.getFunctionCall()
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  getFunctionCall() {
    if (this.permissionsList.includes('View')) {
      this.id = this.appService.getParam('id');
      this.fetchAllSuppliers();
      this.createBillingPOForm();
      this.fetchAllVehicles();
      this.fetchAllEquipments();
      this.findAllBillingPurchaseOrders();
      this.fetchAllWarehouseTeams();
      this.disableFields();
    }
  }
  ngOnDestroy(): void {
    //this.forPermissionsSubscription.unsubscribe();
  }
  disableFields() {
    if (this.permissionsList.includes('View') && this.permissionsList.includes('Update')) {

      this.palletPositionHiredForm.enable();
      this.additionalPalletPositionHiredForm.enable();
      this.flatRateForm.enable();
      this.variableRateForm.enable();
      this.mechanicalRateForm.enable();
      this.packingMaterialForm.enable();
      this.labourChargesForm.enable();
    }
    else if (this.permissionsList.includes('View')) {
      this.palletPositionHiredForm.disable();
      this.additionalPalletPositionHiredForm.disable();
      this.flatRateForm.disable();
      this.variableRateForm.disable();
      this.mechanicalRateForm.disable();
      this.packingMaterialForm.disable();
      this.labourChargesForm.disable();

    }
  }
  save() {
    if (this.permissionsList.includes('Update')) {
      const req = {
        supplierMasterInfo: this.supplierMasterInfo,
        wareHouseInfo: this.wareHouseInfo,
        organizationInfo: this.organizationInfo,
        palletPositionHired: this.palletPositionHiredForm.value,
        additionalPalletPositionHired: this.additionalPalletPositionHiredForm.value,
        flatRate: this.flatRateForm.value,
        variableRate: this.variableRateForm.value,
        // mechanicalRate: this.mechanicalRateForm.value,
        mechanicalRate: {
          ...this.mechanicalRateForm.value,
        },
        ...this.packingMaterialForm.value,
        ...this.labourChargesForm.value
      };
      req.palletPositionHired.contractStartDate = req.palletPositionHired.contractStartDate ? new Date(req.palletPositionHired.contractStartDate) : null;
      req.palletPositionHired.contractEndDate = req.palletPositionHired.contractEndDate ? new Date(req.palletPositionHired.contractEndDate) : null;
      req.additionalPalletPositionHired.contractStartDate = req.additionalPalletPositionHired.contractStartDate ? new Date(req.additionalPalletPositionHired.contractStartDate) : null;
      req.additionalPalletPositionHired.contractEndDate = req.additionalPalletPositionHired.contractEndDate ? new Date(req.additionalPalletPositionHired.contractEndDate) : null;
      delete req.flatRate.loadingFlag;
      delete req.variableRate.loadingFlag;
      delete req.mechanicalRate.loadingFlag;
      req.status = 'Open';
      if (this.id) {
        req._id = this.id;
        req.billingpoNumber = this.billingPurchaseOrder.billingpoNumber;
        req.createdDate = this.billingPurchaseOrder.createdDate;
      }
      else {
        req['organizationInfo'] = this.configService.getOrganization();
        req['wareHouseInfo'] = this.configService.getWarehouse();
      }
      req.totalAmount = this.totalAmount;
      this.vasRestService.saveOrUpdateBillingPO(JSON.stringify(req)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.billingPurchaseOrder) {
            this.toastr.success('Saved successfully');
          } else if (response && response.status === 2 && response.statusMsg) {
            this.toastr.error(response.statusMsg);
          } else {
            this.toastr.error('Failed in saving details');
          }
        },
        (error) => {
          this.toastr.error('Failed in saving details');
        }
      );
    }
    else {
      this.toastr.error("user doesnt have permission")
    }
  }
  updateBillingPO() {
    if (this.permissionsList.includes('Update')) {
      if (this.id) {
        this.vasRestService.updateBillingPO(this.id).subscribe(res => {
          if (res && res.status === 0 && res.data['BillingPurchaseOrder details ']) {
            this.toastr.success('Confirmed successfully');
            this.findAllBillingPurchaseOrders();
            this.clear();

            this.id = this.selectedPurchaseOrderId = undefined;
          } else {
            this.toastr.error('Failed to confirm');
          }
        });
      } else {
        this.toastr.error('Save data before confirming the order');
      }
    }
    else {
      this.toastr.error("user doesnt have permission")
    }

  }
  clear() {
    this.palletPositionHiredForm.reset();
    this.additionalPalletPositionHiredForm.reset();
    this.flatRateForm.reset();
    this.variableRateForm.reset();
    this.mechanicalRateForm.reset();
    this.packingMaterialForm.reset();
    this.labourChargesForm.reset();
    this.id = this.totalAmount = this.supplierIDName = undefined;
    this.supplierMasterInfo = {};
    this.organizationInfo = {};
    this.wareHouseInfo = {}
    this.packingTotal = null;
    this.labourChargesTotal = null;
    this.loadingTotal = null;
    this.unLoadingTotal = null;
  }
  populateAmountPPH() {
    const data = this.palletPositionHiredForm.value;
    if (data.rate && data.totalNoOfDaysBooked && data.palletPositionBooked) {
      this.palletPositionHiredForm.controls.amount.setValue(DecimalUtils.multiply(data.rate, DecimalUtils.multiply(data.totalNoOfDaysBooked, data.palletPositionBooked)));
      this.populateTotalAmount();
    }
  }
  populateAmountAPPH() {
    const data = this.additionalPalletPositionHiredForm.value;
    if (data.rate && data.totalNoOfDaysBooked && data.palletPositionBooked) {
      this.additionalPalletPositionHiredForm.controls.amount.setValue(DecimalUtils.multiply(data.rate, DecimalUtils.multiply(data.totalNoOfDaysBooked, data.palletPositionBooked)));
      this.populateTotalAmount();
    }
  }
  populateAmountFRLoading() {
    const data = this.flatRateForm.value.loading;
    if (data.vehicleRate && data.noOfVehicles) {
      this.flatRateForm.controls['loading']['controls'].amount.setValue(DecimalUtils.multiply(data.vehicleRate, data.noOfVehicles));
      this.populateTotalAmount();
    }
  }

  populateAmountFRUnLoading() {
    const data = this.flatRateForm.value.unloading;
    if (data.vehicleRate && data.noOfVehicles) {
      this.flatRateForm.controls['unloading']['controls'].amount.setValue(DecimalUtils.multiply(data.vehicleRate, data.noOfVehicles))
      this.populateTotalAmount();
    }
  }

  populateAmountVRLoading() {
    const data = this.variableRateForm.value.loading;
    if (data.ratePerHourStaff && data.noOfHoursOccupiedStaff) {
      this.variableRateForm.controls['loading']['controls'].amount.setValue(DecimalUtils.multiply(data.ratePerHourStaff, data.noOfHoursOccupiedStaff))
      this.populateTotalAmount();
    }
  }

  populateAmountVRUnLoading() {
    const data = this.variableRateForm.value.unloading;
    if (data.ratePerHourStaff && data.noOfHoursOccupiedStaff) {
      this.variableRateForm.controls['unloading']['controls'].amount.setValue(DecimalUtils.multiply(data.ratePerHourStaff, data.noOfHoursOccupiedStaff))
      this.populateTotalAmount();
    }
  }

  populateAmountMRLoading(index) {
    const data = this.mechanicalRateForm.value.loading[index];
    if (data.ratePerHourEquipment && data.noOfHoursOccupiedEquipment) {
      this.mechanicalRateForm.controls['loading']['controls'][index]['controls'].amount.setValue(DecimalUtils.multiply(data.ratePerHourEquipment, data.noOfHoursOccupiedEquipment))
      let totalAmount: any = 0;
      this.mechanicalRateForm.value.loading.forEach(line => {
        totalAmount = DecimalUtils.add(totalAmount, line.amount);
      });
      this.mechanicalRateForm.controls.loadingAmount.setValue(totalAmount);
      this.loadingTotal = Number(totalAmount);
      this.populateTotalAmount();
    }
  }

  populateAmountMRUnLoading(index) {
    const data = this.mechanicalRateForm.value.unloading[index];
    if (data.ratePerHourEquipment && data.noOfHoursOccupiedEquipment) {
      this.mechanicalRateForm.controls['unloading']['controls'][index]['controls'].amount.setValue(DecimalUtils.multiply(data.ratePerHourEquipment, data.noOfHoursOccupiedEquipment))
      let totalAmount: any = 0;
      this.mechanicalRateForm.value.unloading.forEach(line => {
        totalAmount = DecimalUtils.add(totalAmount, line.amount);
      });
      this.mechanicalRateForm.controls.unloadingAmount.setValue(totalAmount);
      this.unLoadingTotal = totalAmount;
      this.populateTotalAmount();
    }
  }

  populateAmountPackingMaterial(index) {
    const data = this.packingMaterialForm.value.packingMaterialList[index];
    if (data.sizeOfPackingType && data.ratePerPackingType) {
      this.packingMaterialForm.controls['packingMaterialList']['controls'][index]['controls'].amount.setValue(DecimalUtils.multiply(data.sizeOfPackingType, data.ratePerPackingType))
      let totalAmount: any = 0;
      this.packingMaterialForm.value.packingMaterialList.forEach(line => {
        totalAmount = DecimalUtils.add(totalAmount, line.amount);
      });
      this.packingMaterialForm.controls.packingMaterialAmount.setValue(totalAmount);
      this.packingTotal = Number(totalAmount);
      this.populateTotalAmount();
    }
  }

  populateAmountLabourCharges(index) {
    const data = this.labourChargesForm.value.labourChargesList[index];
    if (data.ratePerHourStaff && data.noOfHoursOccupiedStaff) {
      this.labourChargesForm.controls['labourChargesList']['controls'][index]['controls'].amount.setValue(DecimalUtils.multiply(data.ratePerHourStaff, data.noOfHoursOccupiedStaff))
      let totalAmount: any = 0;
      this.labourChargesForm.value.labourChargesList.forEach(line => {
        totalAmount = DecimalUtils.add(totalAmount, line.amount);
      });
      this.labourChargesForm.patchValue({ labourChargesAmount: totalAmount });
      this.labourChargesTotal = Number(totalAmount);
      this.populateTotalAmount();
    }
  }

  populateTotalAmount() {
    this.totalAmount = this.palletPositionHiredForm.value.amount + this.additionalPalletPositionHiredForm.value.amount +
      this.flatRateForm.value.loading.amount + this.flatRateForm.value.unloading.amount + this.variableRateForm.value.loading.amount +
      this.variableRateForm.value.unloading.amount + this.mechanicalRateForm.value.loadingAmount + this.mechanicalRateForm.value.unloadingAmount
    this.packingMaterialForm.value.packingMaterialAmount + this.labourChargesForm.value.labourChargesAmount;

  }
  onVehicleTypeChange(type) {
    switch (type) {
      case 'flatRateLoading': {
        const vehicle = this.vehicles.find(vehicle => vehicle.typeVehicle === this.flatRateForm.value.loading.vehicleType);
        if (vehicle) {
          this.flatRateForm.controls['loading']['controls'].vehicleRate.setValue(vehicle.vehicleRate);
        }
        break;
      }
      case 'flatRateUnLoading': {
        const vehicle = this.vehicles.find(vehicle => vehicle.typeVehicle === this.flatRateForm.value.unloading.vehicleType);
        if (vehicle) {
          this.flatRateForm.controls['unloading']['controls'].vehicleRate.setValue(vehicle.vehicleRate);
        }
        break;
      }
      case 'variableRateLoading': {
        const vehicle = this.vehicles.find(vehicle => vehicle.typeVehicle === this.variableRateForm.value.loading.vehicleType);
        if (vehicle) {
          this.variableRateForm.controls['loading']['controls'].ratePerHourStaff.setValue(vehicle.vehicleRate);
        }
        break;
      }
      case 'variableRateUnLoading': {
        const vehicle = this.vehicles.find(vehicle => vehicle.typeVehicle === this.variableRateForm.value.unloading.vehicleType);
        if (vehicle) {
          this.variableRateForm.controls['unloading']['controls'].ratePerHourStaff.setValue(vehicle.vehicleRate);
        }
        break;
      }
    }
  }
  onEquipmentTypeChange(type) {
    switch (type) {
      case 'mechanicalRateLoading': {
        const equipment = this.equipments.find(equipment => equipment.typeOfEquipment === this.mechanicalRateForm.value.loading.equipmentType);
        if (equipment) {
          this.mechanicalRateForm.controls['loading']['controls'].ratePerHourEquipment.setValue(equipment.equipmentRate);
        }
        break;
      }
      case 'mechanicalRateUnLoading': {
        const equipment = this.equipments.find(equipment => equipment.typeOfEquipment === this.mechanicalRateForm.value.unloading.equipmentType);
        if (equipment) {
          this.mechanicalRateForm.controls['unloading']['controls'].ratePerHourEquipment.setValue(equipment.equipmentRate);
        }
        break;
      }
    }
  }
  getSelectedSupplierIDName() {
    if (this.supplierIDName) {
      const supplier = this.suppliers.find(supplier => supplier.supplierIDName = this.supplierIDName);
      if (supplier && supplier.supplierName) {
        this.supplierMasterInfo = {
          supplierMasterID: supplier._id,
          supplierID: supplier.supplierID,
          supplierName: supplier.supplierName,
          supplierIDName: supplier.supplierIDName
        };
        supplier.contractStartDate = supplier.contractStartDate ? this.apexService.getDateFromMilliSec(supplier.contractStartDate) : null;
        supplier.contractEndDate = supplier.contractEndDate ? this.apexService.getDateFromMilliSec(supplier.contractEndDate) : null;
        supplier.totalNoOfDaysBooked = this.onChangePopulateTotalNoOfDaysBooked(supplier.period, null);
        this.palletPositionHiredForm.patchValue(supplier);
        this.additionalPalletPositionHiredForm.patchValue({
          uom: supplier.uom,
          rate: supplier.rate,
          period: supplier.period,
          totalNoOfDaysBooked: supplier.totalNoOfDaysBooked
        });
      }
    }
  }
  fetchAllWarehouseTeams() {
    this.commonMasterDataService.fetchAllWarehouseTeams(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.warehouseTeams = response.data.wareHouseTeams;
        }
      },
      (error) => {
      });
  }
  onChangePopulateTotalNoOfDaysBooked(period, type) {
    if (period) {
      switch (period) {
        case '1 Day': {
          if (type === 'pallet') {
            this.palletPositionHiredForm.controls.totalNoOfDaysBooked.setValue(1);
          } else if (type === 'additional') {
            this.additionalPalletPositionHiredForm.controls.totalNoOfDaysBooked.setValue(1);
          }
          return 1;
        }
        case '1 Week': {
          if (type === 'pallet') {
            this.palletPositionHiredForm.controls.totalNoOfDaysBooked.setValue(7);
          } else if (type === 'additional') {
            this.additionalPalletPositionHiredForm.controls.totalNoOfDaysBooked.setValue(7);
          }
          return 7;
        }
        case '1 Fortnight': {
          if (type === 'pallet') {
            this.palletPositionHiredForm.controls.totalNoOfDaysBooked.setValue(14);
          } else if (type === 'additional') {
            this.additionalPalletPositionHiredForm.controls.totalNoOfDaysBooked.setValue(14);
          }
          return 14;
        }
        case '1 Month': {
          if (type === 'pallet') {
            this.palletPositionHiredForm.controls.totalNoOfDaysBooked.setValue(30);
          } else if (type === 'additional') {
            this.additionalPalletPositionHiredForm.controls.totalNoOfDaysBooked.setValue(30);
          }
          return 30;
        }
      }
    }
  }
  fetchAllSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppliers = response.data.supplierMasters;
          let suppliers = [];
          this.suppliers.forEach(item => {
            suppliers.push(item.supplierIDName);
          });
          this.supplierIDNames = this.completerService.local(suppliers);
        }
      },
      (error) => {
      });
  }
  fetchAllVehicles() {
    this.commonMasterDataService.fetchAllVehicles(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.vehicleMasters) {
          this.vehicles = response.data.vehicleMasters;
          response.data.vehicleMasters.forEach(vehicle => {
            this.vehicleTypes.push(vehicle.typeVehicle);
          });
        }
      },
      (error) => {
      });
  }
  getSelectedPurchaseOrderId(event) {
    if (event) {
      if (this.selectedPurchaseOrderId) {
        const a = this.billingPurchaseOrders.find(po => DecimalUtils.equals(po.billingpoNumber, this.selectedPurchaseOrderId));
        if (a && a.billingpoNumber) {
          this.id = a._id;
          this.emitterService.billingInvoiceDataPrints(this.id);
          this.findBillingPurchaseOrderByID();
        }
      }
    }
  }
  findBillingPurchaseOrderByID() {
    if (this.id) {
      this.createBillingPOForm();
      this.vasRestService.findBillingPurchaseOrderByID(this.id, this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.billingPurchaseOrder) {
            this.billingPurchaseOrder = response.data.billingPurchaseOrder;
            this.mechanicalRateForm.controls.loadingAmount.setValue(this.billingPurchaseOrder.mechanicalRate.amount);
            this.mechanicalRateForm.controls.unloadingAmount.setValue(this.billingPurchaseOrder.mechanicalRate.amount);
            this.supplierMasterInfo = this.billingPurchaseOrder.supplierMasterInfo;
            this.supplierIDName = this.billingPurchaseOrder.supplierMasterInfo.supplierIDName;
            this.wareHouseInfo = this.billingPurchaseOrder.wareHouseInfo;
            this.organizationInfo = this.billingPurchaseOrder.organizationInfo;
            this.billingPurchaseOrder.palletPositionHired.contractStartDate =
              this.billingPurchaseOrder.palletPositionHired.contractStartDate ?
                this.apexService.getDateFromMilliSec(this.billingPurchaseOrder.palletPositionHired.contractStartDate) : null;
            this.billingPurchaseOrder.palletPositionHired.contractEndDate =
              this.billingPurchaseOrder.palletPositionHired.contractEndDate ?
                this.apexService.getDateFromMilliSec(this.billingPurchaseOrder.palletPositionHired.contractEndDate) : null;
            this.billingPurchaseOrder.additionalPalletPositionHired.contractStartDate =
              this.billingPurchaseOrder.additionalPalletPositionHired.contractStartDate ?
                this.apexService.getDateFromMilliSec(this.billingPurchaseOrder.additionalPalletPositionHired.contractStartDate) : null;
            this.billingPurchaseOrder.additionalPalletPositionHired.contractEndDate =
              this.billingPurchaseOrder.additionalPalletPositionHired.contractEndDate ?
                this.apexService.getDateFromMilliSec(this.billingPurchaseOrder.additionalPalletPositionHired.contractEndDate) : null;
            this.palletPositionHiredForm.patchValue(this.billingPurchaseOrder.palletPositionHired);
            this.additionalPalletPositionHiredForm.patchValue(this.billingPurchaseOrder.additionalPalletPositionHired);
            this.billingPurchaseOrder.flatRate.loadingFlag = true;
            this.billingPurchaseOrder.variableRate.loadingFlag = true;
            this.billingPurchaseOrder.mechanicalRate.loadingFlag = true;
            this.flatRateForm.patchValue(this.billingPurchaseOrder.flatRate);
            this.variableRateForm.patchValue(this.billingPurchaseOrder.variableRate);
            this.removeLabourChargesLine(0);
            this.removeMechanicalRateListLine(0, '');
            this.removePackingMaterialLine(0);
            this.billingPurchaseOrder.mechanicalRate.loading.forEach(data => {
              this.loading = <FormArray>this.mechanicalRateForm.controls.loading;
              this.loading.push(this.updateMechanicalRate(data));
            });
            this.billingPurchaseOrder.mechanicalRate.unloading.forEach(data => {
              this.unloading = <FormArray>this.mechanicalRateForm.controls.unloading;
              this.unloading.push(this.updateMechanicalRate(data));
            });
            this.mechanicalRateForm.controls.loadingAmount.setValue(this.billingPurchaseOrder.mechanicalRate.loadingAmount);
            this.mechanicalRateForm.controls.unloadingAmount.setValue(this.billingPurchaseOrder.mechanicalRate.unloadingAmount);
            this.billingPurchaseOrder.packingMaterialList.forEach(data => {
              this.packingMaterialList = <FormArray>this.packingMaterialForm.controls.packingMaterialList;
              this.packingMaterialList.push(this.updatePackingMaterial(data));
            });
            this.packingMaterialForm.controls.packingMaterialAmount.setValue(this.billingPurchaseOrder.packingMaterialAmount);
            this.labourChargesForm.controls.labourChargesAmount.setValue(this.billingPurchaseOrder.labourChargesAmount);
            this.billingPurchaseOrder.labourChargesList.forEach(data => {
              this.labourChargesList = <FormArray>this.labourChargesForm.controls.labourChargesList;
              this.labourChargesList.push(this.updateLabourChargesForm(data));
            });
            this.totalAmount = this.billingPurchaseOrder.totalAmount;
            // this.packingMaterialForm.patchValue(this.billingPurchaseOrder);
            // this.labourChargesForm.patchValue(this.billingPurchaseOrder.labourChargesList);
          }
        },
        (error) => {
        });
    }
  }
  fetchAllEquipments() {
    this.commonMasterDataService.fetchAllEquipments(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.equipmentMaster) {
          this.equipments = response.data.equipmentMaster;
          response.data.equipmentMaster.forEach(equipment => {
            this.equipmentTypes.push(equipment.typeOfEquipment);
          });
        }
      },
      (error) => {
      });
  }
  findAllBillingPurchaseOrders() {
    this.vasRestService.findAllBillingPurchaseOrders(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.billingPurchaseOrders) {
          this.billingPurchaseOrders = response.data.billingPurchaseOrders.filter(po => po.raisePO === true);
          // this.purchaseOrderIds = this.completerService.local(this.billingPurchaseOrders, 'billingpoNumber', 'billingpoNumber');
          this.purchaseOrderIds = this.billingPurchaseOrders.map(x => x.billingpoNumber);
        }
      },
      (error) => {
      });
  }
  createBillingPOForm() {
    this.palletPositionHiredForm = new FormBuilder().group({
      uom: [null],
      rate: [null],
      period: [null],
      totalNoOfDaysBooked: [null],
      palletPositionBooked: [null],
      contractStartDate: [null],
      contractEndDate: [null],
      amount: [0],
    });
    this.additionalPalletPositionHiredForm = new FormBuilder().group({
      uom: [null],
      rate: [null],
      period: [null],
      totalNoOfDaysBooked: [null],
      palletPositionBooked: [null],
      contractStartDate: [null],
      contractEndDate: [null],
      amount: [0],
    });
    this.flatRateForm = new FormBuilder().group({
      loadingFlag: [true],
      loading: new FormBuilder().group({
        vehicleType: [null],
        vehicleRate: [null],
        noOfVehicles: [null],
        amount: [0],
      }),
      unloading: new FormBuilder().group({
        vehicleType: [null],
        vehicleRate: [null],
        noOfVehicles: [null],
        amount: [0],
      })
    });
    this.variableRateForm = new FormBuilder().group({
      loadingFlag: [true],
      loading: new FormBuilder().group({
        vehicleType: [null],
        ratePerHourStaff: [null],
        noOfHoursOccupiedStaff: [null],
        amount: [0],
      }),
      unloading: new FormBuilder().group({
        vehicleType: [null],
        ratePerHourStaff: [null],
        noOfHoursOccupiedStaff: [null],
        amount: [0],
      })
    });
    if (this.id) {
      this.packingMaterialForm = this.fb.group({
        packingMaterialList: this.fb.array([]),
        packingMaterialAmount: [0]
      });
      this.labourChargesForm = new FormBuilder().group({
        labourChargesList: this.fb.array([]),
        labourChargesAmount: [0]
      });
      this.mechanicalRateForm = this.fb.group({
        loadingFlag: [true],
        loadingAmount: [0],
        unloadingAmount: [0],
        loading: this.fb.array([]),
        unloading: this.fb.array([])
      })
    } else {
      this.packingMaterialForm = this.fb.group({
        packingMaterialList: this.fb.array([this.createPackingMaterial()]),
        packingMaterialAmount: [0]
      });
      this.labourChargesForm = new FormBuilder().group({
        labourChargesList: this.fb.array([this.createLabourChargesForm()]),
        labourChargesAmount: [0]
      });
      this.mechanicalRateForm = new FormBuilder().group({
        loadingFlag: [true],
        loadingAmount: [0],
        unloadingAmount: [0],
        loading: this.fb.array([this.createMechanicalRate()]),
        unloading: this.fb.array([this.createMechanicalRate()]),
      });
    }
  }
  // mechincal Rate
  addMechanicalRateLine(type) {
    if (this.permissionsList.includes('Update')) {
      if (type === 'loading') {
        this.loading = <FormArray>this.mechanicalRateForm.controls.loading;
        this.loading.push(this.createMechanicalRate());
      } else {
        this.unloading = <FormArray>this.mechanicalRateForm.controls.unloading;
        this.unloading.push(this.createMechanicalRate());
      }
    }
    else {
      this.toastr.error("user doesnt have permission")
    }
  }
  removeMechanicalRateListLine(index, type) {

    this.loading = <FormArray>this.mechanicalRateForm.controls.loading;
    this.loading.removeAt(index);
    this.unloading = <FormArray>this.mechanicalRateForm.controls.unloading;
    this.unloading.removeAt(index);
  }

  createMechanicalRate() {
    return new FormBuilder().group({
      vehicleType: [null],
      equipmentType: [null],
      noOfHoursOccupiedEquipment: [null],
      ratePerHourEquipment: [null],
      amount: [0],
    })
  }


  addPackingMaterialLine() {
    if (this.permissionsList.includes('Update')) {
      this.packingMaterialList = <FormArray>this.packingMaterialForm.controls.packingMaterialList;
      this.packingMaterialList.push(this.createPackingMaterial());
    }
    else {
      this.toastr.error("user doesnt have permission")
    }

  }
  removePackingMaterialLine(index) {
    if (this.permissionsList.includes('View')) {
      this.packingMaterialList = <FormArray>this.packingMaterialForm.controls.packingMaterialList;
      this.packingMaterialList.removeAt(index);
    }
    else {
      this.toastr.error("user doesnt have permission")
    }

  }
  createPackingMaterial() {
    return new FormBuilder().group({
      sizeOfPackingType: [null],
      ratePerPackingType: [null],
      amount: [0],
      packingType: [null],
    });
  }
  updatePackingMaterial(data) {
    return new FormBuilder().group({
      sizeOfPackingType: [data.sizeOfPackingType],
      ratePerPackingType: [data.ratePerPackingType],
      amount: [data.amount],
      packingType: [data.packingType],
    });
  }
  updateMechanicalRate(data) {
    return new FormBuilder().group({
      vehicleType: [data.vehicleType],
      equipmentType: [data.equipmentType],
      noOfHoursOccupiedEquipment: [data.noOfHoursOccupiedEquipment],
      ratePerHourEquipment: [data.ratePerHourEquipment],
      amount: [data.amount],
    });
  }
  addLabourChargesLine() {
    if (this.permissionsList.includes('Update')) {
      this.labourChargesList = <FormArray>this.labourChargesForm.controls.labourChargesList;
      this.labourChargesList.push(this.createLabourChargesForm());
    }
    else {
      this.toastr.error("user doesnt have permission")
    }

  }
  removeLabourChargesLine(index) {
    if (this.permissionsList.includes('View')) {
      this.labourChargesList = <FormArray>this.labourChargesForm.controls.labourChargesList;
      this.labourChargesList.removeAt(index);
    }
    else {
      this.toastr.error("user doesnt have permission")
    }

  }
  createLabourChargesForm() {
    return new FormBuilder().group({
      packingType: [null],
      ratePerHourStaff: [null],
      noOfHoursOccupiedStaff: [null],
      amount: [0]
    });
  }
  updateLabourChargesForm(data) {
    return new FormBuilder().group({
      packingType: [data.packingType],
      ratePerHourStaff: [data.ratePerHourStaff],
      noOfHoursOccupiedStaff: [data.noOfHoursOccupiedStaff],
      amount: [data.amount]
    });
  }
  printBillingInvoicing() {
    if (this.permissionsList.includes('Update')) {
      window.print();
    }
    else {
      this.toastr.error('user doesnt have permission');
    }

  }
}
