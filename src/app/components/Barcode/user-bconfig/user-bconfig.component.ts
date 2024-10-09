import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { BarcodeService } from 'src/app/services/barcode.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-user-bconfig',
  templateUrl: './user-bconfig.component.html',
  styleUrls: ['./user-bconfig.component.scss']
})
export class UserBConfigComponent implements OnInit {
  purchaseOrderForm: FormGroup;
  goodsReceivingForm: FormGroup;
  putawayForm: FormGroup;
  salesOrderForm: FormGroup;
  pickingForm: FormGroup;
  shipmentOrderForm: FormGroup;
  invoiceForm: FormGroup;
  replenishmentForm: FormGroup;
  purchaseReturnsForm: FormGroup;
  salesReturnsForm: FormGroup;
  warehouseTransfersForm: FormGroup;
  inboundCapacityPlanningForm: FormGroup;
  outboundCapacityPlanningForm: FormGroup;
  packingForm: FormGroup;
  repackingForm: FormGroup;
  copackingForm: FormGroup;
  labellingForm: FormGroup;
  internalTransfersForm: FormGroup;
  inventoryAdjustmentsForm: FormGroup;
  cycleCountingForm: FormGroup;
  inventoryForm: FormGroup;
  damagedStockForm: FormGroup;
  replacementOrderForm:FormGroup;
  formObj = this.configService.getGlobalpayload();
  rolesList: any = [];
  usersList: any = [];
  allUsersList: any = [];
  completeResponse = [];
  dropdownList: any = [];
  popupData: any = null;
  adjustments: any = {};
  transfers: any = {};
  physicalCounting: any = {}
  purchaseReturn: any = {}
  cycleCounting: any = {}
  shipmentOrder: any = {};
  invoice: any = {};
  replishments: any = {}
  purchaseReturns1: any = {}
  salesReturns: any = {}
  warehouseTransfers: any = {};
  inboundPlanning: any = {};
  outboundPlanning: any = {}
  packings: any = {}
  repackings: any = {}
  labellings: any = {};
  copackings: any = {};
  internalTranfers: any = {}
  inventoryAdjustments: any = {}
  cycleCountings1: any = {}
  inventorys: any = {}
  damagedStockList:any = {};
  replacementOrderList:any ={}
  selected: any = [];
  transferSelected: any = [];
  physicalSelected: any = [];
  damagedStockObj: any = [];
  cycleCountingSelected: any = [];
  purchaseReturnSelected: any = [];
  shipmentOrderSelected: any = [];
  invoiceSelected: any = [];
  purchaseReturn1Selected: any = [];
  replenishmentSelected: any = [];
  salesReturnsSelected: any = [];
  warehouseTransfersSelected: any = [];
  inboundPlanningSelected: any = [];
  outboundPlanningSelected: any = [];
  packingSelected: any = [];
  repackingSelected: any = [];
  copackingSelected: any = [];
  labellingSelected: any = [];
  internalTransfersSelected: any = [];
  inventoryAdjustmentsSelected: any = [];
  cycleCounting1Selected: any = [];
  inventorySelected: any = [];
  damageStockSelected:any = [];
  replacementOrderSelected:any=[]
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
  configPermissionsList: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  constructor(private configService: ConfigurationService, private metaDataService: MetaDataService,
    private common: CommonMasterDataService, private fb: FormBuilder, private bService: BarcodeService,
    private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) { 
      this.translate.use(this.language);
    }

  ngOnInit() {

    this.configPermissionsList = this.configService.getPermissions('mainFunctionalities', 'Barcode', "User Barcode Config", Storage.getSessionUser());
    if (this.getClientRole() && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View', 'Update', 'Delete'];
    }
    if (this.configPermissionsList.includes('View')) {
      this.createItem();
      this.fetchAllRoles();
      this.findAllUsersforIds();
      this.fetchConfigurations();
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  getClientRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  createItem() {
    this.purchaseOrderForm = this.fb.group({
      "_id": null,
      "name": 'Purchase Order',
      "roleConfigurations": this.fb.array([]),
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.salesOrderForm = this.fb.group({
      "_id": null,
      "name": 'Sales Order',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.goodsReceivingForm = this.fb.group({
      "_id": null,
      "name": 'Goods Receiving',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.putawayForm = this.fb.group({
      "_id": null,
      "name": 'Putaway',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.pickingForm = this.fb.group({
      "_id": null,
      "name": 'Picking',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.shipmentOrderForm = this.fb.group({
      "_id": null,
      "name": 'Shipment Order',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.invoiceForm = this.fb.group({
      "_id": null,
      "name": 'Invoice',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.replenishmentForm = this.fb.group({
      "_id": null,
      "name": 'Replenishment',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.purchaseReturnsForm = this.fb.group({
      "_id": null,
      "name": 'Purchase Returns',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.salesReturnsForm = this.fb.group({
      "_id": null,
      "name": 'Sales Returns',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.warehouseTransfersForm = this.fb.group({
      "_id": null,
      "name": 'Warehouse Transfers',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.inboundCapacityPlanningForm = this.fb.group({
      "_id": null,
      "name": 'Inbound Capacity Planning',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.outboundCapacityPlanningForm = this.fb.group({
      "_id": null,
      "name": 'Outbound Capacity Planning',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.packingForm = this.fb.group({
      "_id": null,
      "name": 'Packing',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.copackingForm = this.fb.group({
      "_id": null,
      "name": 'Co-packing',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.repackingForm = this.fb.group({
      "_id": null,
      "name": 'Re-packing',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.labellingForm = this.fb.group({
      "_id": null,
      "name": 'Labeling',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.internalTransfersForm = this.fb.group({
      "_id": null,
      "name": 'Internal Transfers',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.inventoryAdjustmentsForm = this.fb.group({
      "_id": null,
      "name": 'Inventory Adjustments',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.cycleCountingForm = this.fb.group({
      "_id": null,
      "name": 'Cycle Counting',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.inventoryForm = this.fb.group({
      "_id": null,
      "name": 'Inventory',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.damagedStockForm = this.fb.group({
      "_id": null,
      "name": 'Damaged Stock',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
    this.replacementOrderForm = this.fb.group({
      "_id": null,
      "name": 'Replacement Order',
      "roleConfigurations": this.fb.array([]),
      users: [[]],
      "createdDate": null,
      "lastUpdatedDate": null,
      "role": this.fb.group({
        "_id": null,
        "roleName": null,
        "tenatID": null
      }),
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse()
    })
  }
  findAllUsersforIds() {
    this.common.fetchAllUsers().subscribe(data => {
      if (data.status == 0 && data.data.users) {
        this.allUsersList = data.data.users;
      }
    })
  }
  fetchAllRoles() {
    this.metaDataService.fetchAllRoles(this.formObj).subscribe(
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
  getUsers(role, form) {
    switch (form) {
      case 'purchaseOrderForm': {
        this.selected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'goodsReceivingForm': {
        this.transferSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'putawayForm': {
        this.physicalSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'salesOrderForm': {
        this.cycleCountingSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'pickingForm': {
        this.purchaseReturnSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'shipmentOrderForm': {
        this.shipmentOrderSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      } case 'invoiceForm': {
        this.invoiceSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      } case 'replenishmentForm': {
        this.replenishmentSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      } case 'purchaseReturnsForm': {
        this.purchaseReturn1Selected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      } case 'warehouseTransfersForm': {
        this.warehouseTransfersSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'inboundCapacityPlanningForm': {
        this.inboundPlanningSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'outboundCapacityPlanningForm': {
        this.outboundPlanningSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'packingForm': {
        this.packingSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'repackingForm': {
        this.repackingSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'copackingForm': {
        this.copackingSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'labellingForm': {
        this.labellingSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'internalTransfersForm': {
        this.internalTransfersSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'inventoryAdjustmentsForm': {
        this.inventoryAdjustmentsSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'cycleCountingForm': {
        this.cycleCounting1Selected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'inventoryForm': {
        this.inventorySelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;

      }
      case 'damagedStockForm': {
        this.damageStockSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'replacementOrderForm': {
        this.replacementOrderSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
      case 'salesReturnsForm': {
        this.salesReturnsSelected = [];
        this[form].controls.roleConfigurations.setValue([]);
        break;
      }
    }

    this.common.fetchUsersbyRoleID(this.formObj, role).subscribe(response => {
      if (response && response['status'] === 0 && response['data'].users) {
        this.usersList = response.data.users;
        this.dropdownList = response.data.users.map(x => x.userIDName);
      }
    })
    this[form].controls.roleConfigurations.value.push({ 'role': this[form].controls.role.value });
    if (form == 'purchaseOrderForm' && this.adjustments && this.adjustments.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.adjustments.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.selected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
      // getSavedUserofRole ? this.purchaseOrderForm.controls.roleConfigurations.patchValue(this.adjustments.roleConfigurations) : ''
    }
    if (form == 'goodsReceivingForm' && this.transfers && this.transfers.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.transfers.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.transferSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
      // getSavedUserofRole ? this.goodsReceivingForm.controls.roleConfigurations.patchValue(this.transfers.roleConfigurations) : ''
    }
    if (form == 'putawayForm' && this.physicalCounting && this.physicalCounting.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.physicalCounting.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.physicalSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
      // getSavedUserofRole ? this.putawayForm.controls.roleConfigurations.patchValue(this.physicalCounting.roleConfigurations) : ''
    }
    if (form == 'salesOrderForm' && this.cycleCounting && this.cycleCounting.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.cycleCounting.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.cycleCountingSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
      // getSavedUserofRole ? this.salesOrderForm.controls.roleConfigurations.patchValue(this.cycleCounting.roleConfigurations) : ''
    }
    if (form == 'pickingForm' && this.purchaseReturn && this.purchaseReturn.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.purchaseReturn.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.purchaseReturnSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
      // getSavedUserofRole ? this.pickingForm.controls.roleConfigurations.patchValue(this.purchaseReturn.roleConfigurations) : ''
    }
    if (form == 'shipmentOrderForm' && this.shipmentOrder && this.shipmentOrder.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.shipmentOrder.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.shipmentOrderSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'invoiceForm' && this.invoice && this.invoice.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.invoice.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.invoiceSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'replenishmentForm' && this.replishments && this.replishments.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.replishments.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.replenishmentSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'purchaseReturnsForm' && this.purchaseReturns1 && this.purchaseReturns1.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.purchaseReturns1.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.purchaseReturn1Selected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'salesReturnsForm' && this.salesReturns && this.salesReturns.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.salesReturns.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.salesReturnsSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'warehouseTransfersForm' && this.warehouseTransfers && this.warehouseTransfers.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.warehouseTransfers.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.warehouseTransfersSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'inboundCapacityPlanningForm' && this.inboundPlanning && this.inboundPlanning.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.inboundPlanning.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.inboundPlanningSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'outboundCapacityPlanningForm' && this.outboundPlanning && this.outboundPlanning.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.outboundPlanning.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.outboundPlanningSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'packingForm' && this.packings && this.packings.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.packings.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.packingSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'copackingForm' && this.copackings && this.copackings.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.copackings.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.copackingSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'repackingForm' && this.repackings && this.repackings.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.repackings.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.repackingSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'labellingForm' && this.labellings && this.labellings.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.labellings.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.labellingSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'internalTransfersForm' && this.internalTranfers && this.internalTranfers.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.internalTranfers.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.internalTransfersSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'inventoryAdjustmentsForm' && this.inventoryAdjustments && this.inventoryAdjustments.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.inventoryAdjustments.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.inventoryAdjustmentsSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'cycleCountingForm' && this.cycleCountings1 && this.cycleCountings1.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.cycleCountings1.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.cycleCounting1Selected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'inventoryForm' && this.inventorys && this.inventorys.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.inventorys.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.inventorySelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'damagedStockForm' && this.damagedStockList && this.damagedStockList.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.damagedStockList.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      console.log(getSavedUserofRole);
      this.damageStockSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
    if (form == 'replacementOrderForm' && this.replacementOrderList && this.replacementOrderList.roleConfigurations.length > 0) {
      const getSavedUserofRole = this.replacementOrderList.roleConfigurations.find(x => x.role.roleName == this[form].controls.role.value.roleName)
      this.replacementOrderSelected = getSavedUserofRole ? getSavedUserofRole.userInfos.map(x => x.userIDName) : [];
    }
  }
  mapId(key, name) {
    if (key == 'user') {
      const vehicleDetals = this.allUsersList.find(x => x.userIDName == name);
      if (vehicleDetals) {
        return {
          "_id": vehicleDetals._id,
          "userID": vehicleDetals.userID,
          "name": vehicleDetals.name,
          "userIDName": vehicleDetals.userIDName,
          "email": vehicleDetals.email
        }
      }
    }
  }

  setUserstoForm(items: any, formName) {
    if (items) {
      const form = this[formName].value;
      let formUserValue = [];
      formUserValue = (formName == 'purchaseOrderForm') ? this.selected :
        (formName == 'goodsReceivingForm') ? this.transferSelected :
          (formName == 'putawayForm') ? this.physicalSelected :
            (formName == 'salesOrderForm') ? this.cycleCountingSelected :
              (formName == 'pickingForm') ? this.purchaseReturnSelected :
                (formName == 'shipmentOrderForm') ? this.shipmentOrderSelected :
                  (formName == 'invoiceForm') ? this.invoiceSelected :
                    (formName == 'replenishmentForm') ? this.replenishmentSelected :
                      (formName == 'purchaseReturnsForm') ? this.purchaseReturn1Selected :
                        (formName == 'warehouseTransfersForm') ? this.warehouseTransfersSelected :
                          (formName == 'inboundCapacityPlanningForm') ? this.inboundPlanningSelected :
                            (formName == 'outboundCapacityPlanningForm') ? this.outboundPlanningSelected :
                              (formName == 'packingForm') ? this.packingSelected :
                                (formName == 'copackingForm') ? this.copackingSelected :
                                  (formName == 'repackingForm') ? this.repackingSelected :
                                    (formName == 'labellingForm') ? this.labellingSelected :
                                      (formName == 'internalTransfersForm') ? this.internalTransfersSelected :
                                        (formName == 'inventoryAdjustmentsForm') ? this.inventoryAdjustmentsSelected :
                                          (formName == 'cycleCountingForm') ? this.cycleCounting1Selected :
                                            (formName == 'inventoryForm') ? this.inventorySelected :
                                            (formName == 'damagedStockForm') ? this.damageStockSelected :
                                            (formName == 'replacementOrderForm') ? this.replacementOrderSelected :
                                              (formName == 'salesReturnsForm') ? this.salesReturnsSelected : '';
      const getRoleIndex = form.roleConfigurations.findIndex(x => x.role.roleName == form.role.roleName);
      if (getRoleIndex != -1) {
        form.roleConfigurations[getRoleIndex]['userInfos'] = formUserValue;
      }
    }
  }
  finalFramingArray(form, globalArray) {
    delete form.role;
    let spliceIndex = []
    form.roleConfigurations.forEach((el, i) => {
      if (el.userInfos) {
        el['dummy'] = el.userInfos;
        el.userInfos = [];
        if (el.dummy && el.dummy.length > 0) {
          el.dummy.forEach(element => {

            const abc = this.mapId('user', element);
            abc ? el['userInfos'].push(abc) : '';
          });
        }
        delete el.dummy;
      }
      else {
        spliceIndex.push(i);
      }
    })
    if (spliceIndex.length > 0) {
      spliceIndex.forEach(indexValue => {
        form.roleConfigurations.splice(indexValue, 1);
      });
    }

    if (globalArray && globalArray.roleConfigurations && globalArray.roleConfigurations.length > 0) {
      const dummyForms = JSON.parse(JSON.stringify(form.roleConfigurations));
      globalArray.roleConfigurations.forEach((element, i) => {
        const findIndex = dummyForms.findIndex(x => x.role.roleName == element.role.roleName);
        if (findIndex != -1) {
          globalArray.roleConfigurations.splice(i, 1);
        }
      });
      globalArray.roleConfigurations.forEach(element => {
        form.roleConfigurations.push(element);
      });
    }
    return form;
  }

  save() {
    if (this.configPermissionsList.includes('Update')) {
      const final = [];
      final.push(this.finalFramingArray(this.purchaseOrderForm.value, this.adjustments));
      final.push(this.finalFramingArray(this.goodsReceivingForm.value, this.transfers));
      final.push(this.finalFramingArray(this.putawayForm.value, this.physicalCounting));
      final.push(this.finalFramingArray(this.salesOrderForm.value, this.cycleCounting));
      final.push(this.finalFramingArray(this.pickingForm.value, this.purchaseReturn));
      final.push(this.finalFramingArray(this.shipmentOrderForm.value, this.shipmentOrder));
      final.push(this.finalFramingArray(this.invoiceForm.value, this.invoice));
      final.push(this.finalFramingArray(this.replenishmentForm.value, this.replishments));
      final.push(this.finalFramingArray(this.purchaseReturnsForm.value, this.purchaseReturns1));
      final.push(this.finalFramingArray(this.salesReturnsForm.value, this.salesReturns));
      final.push(this.finalFramingArray(this.warehouseTransfersForm.value, this.warehouseTransfers));
      final.push(this.finalFramingArray(this.inboundCapacityPlanningForm.value, this.inboundPlanning));
      final.push(this.finalFramingArray(this.outboundCapacityPlanningForm.value, this.outboundPlanning));
      final.push(this.finalFramingArray(this.packingForm.value, this.packings));
      final.push(this.finalFramingArray(this.copackingForm.value, this.copackings));
      final.push(this.finalFramingArray(this.repackingForm.value, this.repackings));
      final.push(this.finalFramingArray(this.labellingForm.value, this.labellings));
      final.push(this.finalFramingArray(this.inventoryAdjustmentsForm.value, this.inventoryAdjustments));
      final.push(this.finalFramingArray(this.internalTransfersForm.value, this.internalTranfers));
      final.push(this.finalFramingArray(this.cycleCountingForm.value, this.cycleCountings1));
      final.push(this.finalFramingArray(this.inventoryForm.value, this.inventorys));
      final.push(this.finalFramingArray(this.damagedStockForm.value,this.damagedStockList))
      final.push(this.finalFramingArray(this.replacementOrderForm.value,this.replacementOrderList))
      this.bService.saveOrUpdateBarcodeAccess(final).subscribe(data => {
        if (data['status'] == 0 && data['data']['processBarcodeAccessConfigurations']) {
          this.toastr.success('Saved Successfully');
          this.clear();
        }
      })
    }
    else {
      this.toastr.error("User doesn't have Permissions")
    }
  }
  fetchConfigurations() {
    this.bService.fetchAllBarcodeAccess(this.formObj).subscribe(data => {
      if (data['status'] == 0 && data['data']['processBarcodeAccessConfigurations']) {
        this.completeResponse = data['data']['processBarcodeAccessConfigurations'];
        this.adjustments = this.completeResponse.find(x => x.name == 'Purchase Order');
        this.adjustments ? this.purchaseOrderForm.patchValue(this.adjustments) : '';
        this.cycleCounting = this.completeResponse.find(x => x.name == 'Sales Order');
        this.cycleCounting ? this.salesOrderForm.patchValue(this.cycleCounting) : '';
        this.transfers = this.completeResponse.find(x => x.name == 'Goods Receiving');
        this.transfers ? this.goodsReceivingForm.patchValue(this.transfers) : '';
        this.physicalCounting = this.completeResponse.find(x => x.name == 'Putaway');
        this.physicalCounting ? this.putawayForm.patchValue(this.physicalCounting) : '';
        this.purchaseReturn = this.completeResponse.find(x => x.name == 'Picking');
        this.purchaseReturn ? this.pickingForm.patchValue(this.purchaseReturn) : '';
        this.shipmentOrder = this.completeResponse.find(x => x.name == 'Shipment Order');
        this.shipmentOrder ? this.shipmentOrderForm.patchValue(this.shipmentOrder) : '';
        this.invoice = this.completeResponse.find(x => x.name == 'Invoice');
        this.invoice ? this.invoiceForm.patchValue(this.invoice) : '';
        this.replishments = this.completeResponse.find(x => x.name == 'Replenishment');
        this.replishments ? this.replenishmentForm.patchValue(this.replishments) : '';
        this.purchaseReturns1 = this.completeResponse.find(x => x.name == 'Purchase Returns');
        this.purchaseReturns1 ? this.purchaseReturnsForm.patchValue(this.purchaseReturns1) : '';
        this.salesReturns = this.completeResponse.find(x => x.name == 'Sales Returns');
        this.salesReturns ? this.salesReturnsForm.patchValue(this.salesReturns) : '';
        this.warehouseTransfers = this.completeResponse.find(x => x.name == 'Warehouse Transfers');
        this.warehouseTransfers ? this.warehouseTransfersForm.patchValue(this.warehouseTransfers) : '';
        this.inboundPlanning = this.completeResponse.find(x => x.name == 'Inbound Capacity Planning');
        this.inboundPlanning ? this.inboundCapacityPlanningForm.patchValue(this.inboundPlanning) : '';
        this.outboundPlanning = this.completeResponse.find(x => x.name == 'Outbound Capacity Planning');
        this.outboundPlanning ? this.outboundCapacityPlanningForm.patchValue(this.outboundPlanning) : '';
        this.packings = this.completeResponse.find(x => x.name == 'Packing');
        this.packings ? this.packingForm.patchValue(this.packings) : '';
        this.copackings = this.completeResponse.find(x => x.name == 'Co-packing');
        this.copackings ? this.copackingForm.patchValue(this.copackings) : '';
        this.repackings = this.completeResponse.find(x => x.name == 'Re-packing');
        this.repackings ? this.repackingForm.patchValue(this.repackings) : '';
        this.labellings = this.completeResponse.find(x => x.name == 'Labeling');
        this.labellings ? this.labellingForm.patchValue(this.labellings) : '';
        this.internalTranfers = this.completeResponse.find(x => x.name == 'Internal Transfers');
        this.internalTranfers ? this.internalTransfersForm.patchValue(this.internalTranfers) : '';
        this.inventoryAdjustments = this.completeResponse.find(x => x.name == 'Inventory Adjustments');
        this.inventoryAdjustments ? this.inventoryAdjustmentsForm.patchValue(this.inventoryAdjustments) : '';
        this.cycleCountings1 = this.completeResponse.find(x => x.name == 'Cycle Counting');
        this.cycleCountings1 ? this.cycleCountingForm.patchValue(this.cycleCountings1) : '';
        this.inventorys = this.completeResponse.find(x => x.name == 'Inventory');
        console.log(this.inventorys);
        this.inventorys ? this.inventoryForm.patchValue(this.inventorys) : '';
        this.damagedStockList = this.completeResponse.find(x => x.name == 'Damaged Stock');
        this.damagedStockList ? this.damagedStockForm.patchValue(this.damagedStockList) : '';
        this.replacementOrderList = this.completeResponse.find(x => x.name == 'Replacement Order');
        this.replacementOrderList ? this.replacementOrderForm.patchValue(this.replacementOrderList) : '';
      }
      else {
      }
    })
  }
  getTable(key) {
    this.popupData = null;
    this.popupData = this[key];
    this.ngxSmartModalService.getModal('spaceUtilization').open();
  }
  clear() {
    this.completeResponse = [];
    this.physicalCounting = null;
    this.purchaseReturn = null;
    this.transfers = null;
    this.cycleCounting = null;
    this.adjustments = null;
    this.shipmentOrder = null;
    this.invoice = null;
    this.replishments = null;
    this.purchaseReturns1 = null;
    this.salesReturns = null;
    this.warehouseTransfers = null;
    this.inboundPlanning = null;
    this.outboundPlanning = null;
    this.packings = null;
    this.copackings = null;
    this.repackings = null;
    this.labellings = null;
    this.internalTranfers = null;
    this.inventoryAdjustments = null;
    this.cycleCountings1 = null;
    this.inventorys = null;
    this.damagedStockList  = null
    this.replacementOrderList = null
    this.selected = [];
    this.transferSelected = [];
    this.physicalSelected = [];
    this.cycleCountingSelected = [];
    this.purchaseReturnSelected = [];
    this.shipmentOrderSelected = [];
    this.invoiceSelected = [];
    this.replenishmentSelected = [];
    this.purchaseReturn1Selected = [];
    this.salesReturnsSelected = [];
    this.warehouseTransfersSelected = [];
    this.inboundPlanningSelected = [];
    this.outboundPlanningSelected = [];
    this.packingSelected = [];
    this.repackingSelected = [];
    this.copackingSelected = [];
    this.labellingSelected = [];
    this.internalTransfersSelected = [];
    this.inventoryAdjustmentsSelected = [];
    this.cycleCounting1Selected = [];
    this.inventorySelected = [];
    this.damageStockSelected = [];  
    this.replacementOrderSelected = []  
    this.purchaseReturnsForm.reset();
    this.salesReturnsForm.reset();
    this.purchaseOrderForm.reset();
    this.goodsReceivingForm.reset();
    this.putawayForm.reset();
    this.pickingForm.reset();
    this.shipmentOrderForm.reset();
    this.invoiceForm.reset();
    this.replenishmentForm.reset();
    this.salesOrderForm.reset();
    this.warehouseTransfersForm.reset();
    this.inboundCapacityPlanningForm.reset();
    this.outboundCapacityPlanningForm.reset();
    this.packingForm.reset();
    this.copackingForm.reset();
    this.repackingForm.reset();
    this.labellingForm.reset();
    this.internalTransfersForm.reset();
    this.inventoryAdjustmentsForm.reset();
    this.cycleCountingForm.reset();
    this.inventoryForm.reset();
    this.damagedStockForm.reset();
    this.replacementOrderForm.reset();
    
    this.fetchConfigurations();
  }
}
