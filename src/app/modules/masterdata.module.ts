import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WMSService } from '../services/integration-services/wms.service';
import { MasterDataRoutingModule } from '../routes/master-routing.module';
import { InboundMasterDataService } from '../services/integration-services/inboundMasterData.service';

import { WarehouseMasterComponent } from '../components/master-datas/warehouse-master/warehouse-master.component';
import { RackMasterComponent } from '../components/master-datas/rack-master/rack-master.component';
import { ZoneMasterComponent } from '../components/master-datas/zone-master/zone-master.component';
import { LevelMasterComponent } from '../components/master-datas/level-master/level-master.component';
import { LocationMasterComponent } from '../components/master-datas/location-master/location-master.component';
import { ProductStrategyComponent } from '../components/master-datas/product-strategy/product-strategy.component';
import { PutawayStrategyComponent } from '../components/master-datas/putaway-strategy/putaway-strategy.component';
import { PickingStrategyComponent } from '../components/master-datas/picking-strategy/picking-strategy.component';
import { CustomerMasterComponent } from '../components/master-datas/customer-master/customer-master.component';
import { ProductByCustomerComponent } from '../components/master-datas/product-by-customer/product-by-customer.component';
import { VehicleComponent } from '../components/master-datas/vehicle/vehicle.component';
import { WarehouseTeamComponent } from '../components/master-datas/warehouse-team/warehouse-team.component';
import { ProductsBySupplierComponent } from 'src/app/components/master-datas/products-by-supplier/products-by-supplier.component';
import { EquipmentMasterComponent } from '../components/master-datas/equipment-master/equipment-master.component';
import { BillOfResourcesComponent } from '../components/master-datas/bill-of-resources/bill-of-resources.component';
import { ReplenishmentOrderComponent } from '../components/master-datas/replenishment-order/replenishment-order.component';
import { ProductComponent } from '../components/master-datas/product/product.component';
import { SupplierComponent } from '../components/master-datas/supplier/supplier.component';
import { UomConversionComponent } from '../components/master-datas/uom-conversion/uom-conversion.component';
import { SharedModule } from '../shared/shared.module';
import { TransporterComponent } from '../components/master-datas/transporter/transporter.component';
import { VehiclebytransporterComponent } from '../components/master-datas/vehiclebytransporter/vehiclebytransporter.component';
import { ColumnComponent } from '../components/master-datas/column/column.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule } from '@angular/router';
import { AbcgroupComponent } from '../components/master-datas/abcgroup/abcgroup.component';
import { AbcanalysysclassComponent } from '../components/master-datas/abcanalysysclass/abcanalysysclass.component';
import { OrganizationComponent } from '../components/master-datas/organization/organization.component';
import { TaxesComponent } from '../components/master-datas/taxes/taxes.component';
import { ProductcategorygroupComponent } from '../components/master-datas/productcategorygroup/productcategorygroup.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NzTreeSelectModule } from 'ng-zorro-antd';
import { CountryStateComponent } from '../components/master-datas/country-state/country-state.component';
import { PromotionComponent } from '../components/master-datas/promotion/promotion.component';
import { PromotionPolicyComponent } from '../components/master-datas/promotion-policy/promotion-policy.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MainLocationComponent } from '../components/master-datas/main-location/main-location.component';
import { PrintLocationComponent } from '../components/master-datas/print-location/print-location.component';
//import { InwardoutwardchecklistComponent } from '../components/master-datas/inwardoutwardchecklist/inwardoutwardchecklist.component';


@NgModule({
  declarations: [
    WarehouseMasterComponent,
    RackMasterComponent,
    ZoneMasterComponent,
    LevelMasterComponent,
    LocationMasterComponent,
    ProductStrategyComponent,
    PutawayStrategyComponent,
    PickingStrategyComponent,
    CustomerMasterComponent,
    ProductByCustomerComponent,
    VehicleComponent,
    WarehouseTeamComponent,
    ProductsBySupplierComponent,
    EquipmentMasterComponent,
    BillOfResourcesComponent,
    ReplenishmentOrderComponent,
    ProductComponent,
    SupplierComponent,
    UomConversionComponent,
    TransporterComponent,
    VehiclebytransporterComponent,
    ColumnComponent,
    AbcgroupComponent,
    AbcanalysysclassComponent,
    OrganizationComponent,
    TaxesComponent,
    ProductcategorygroupComponent,
    CountryStateComponent,
    PromotionPolicyComponent,
    PromotionComponent,
    MainLocationComponent,
    PrintLocationComponent,
  ],
  imports: [
    SharedModule,
    MasterDataRoutingModule,
    RouterModule,
    NgMultiSelectDropDownModule.forRoot(),
    NzTreeSelectModule,
    NgxPaginationModule
  ],
  providers: [DatePipe,
    InboundMasterDataService,
    WMSService
  ]
})
export class MasterDataModule { }
