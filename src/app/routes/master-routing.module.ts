import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
import { UserGuard } from '../shared/route-guards/user.guard';
import { ReplenishmentOrderComponent } from '../components/master-datas/replenishment-order/replenishment-order.component';
import { EquipmentMasterComponent } from '../components/master-datas/equipment-master/equipment-master.component';
import { BillOfResourcesComponent } from '../components/master-datas/bill-of-resources/bill-of-resources.component';
import { BillToAddressComponent } from '../components/master-datas/bill-to-address/bill-to-address.component';
import { ProductComponent } from '../components/master-datas/product/product.component';
import { SupplierComponent } from '../components/master-datas/supplier/supplier.component';
import { UomConversionComponent } from '../components/master-datas/uom-conversion/uom-conversion.component';
import { TransporterComponent } from '../components/master-datas/transporter/transporter.component';
import { VehiclebytransporterComponent } from '../components/master-datas/vehiclebytransporter/vehiclebytransporter.component';
import { ColumnComponent } from '../components/master-datas/column/column.component';
import { AbcgroupComponent } from '../components/master-datas/abcgroup/abcgroup.component';
import { AbcanalysysclassComponent } from '../components/master-datas/abcanalysysclass/abcanalysysclass.component';
import { OrganizationComponent } from '../components/master-datas/organization/organization.component';
import { TaxesComponent } from '../components/master-datas/taxes/taxes.component';
import { ProductcategorygroupComponent } from '../components/master-datas/productcategorygroup/productcategorygroup.component';
import { CountryStateComponent } from '../components/master-datas/country-state/country-state.component';
import { PromotionComponent } from '../components/master-datas/promotion/promotion.component';
import { PromotionPolicyComponent } from '../components/master-datas/promotion-policy/promotion-policy.component';
import { MainLocationComponent } from '../components/master-datas/main-location/main-location.component';

const routes: Routes = [
  { path: '', redirectTo: 'product', pathMatch: 'full' },
  { path: 'product', component: ProductComponent, canActivate: [UserGuard] },
  { path: 'supplier', component: SupplierComponent, canActivate: [UserGuard] },
  { path: 'productBySupplier', component: ProductsBySupplierComponent, canActivate: [UserGuard] },
  { path: 'warehouse', component: WarehouseMasterComponent, canActivate: [UserGuard] },
  { path: 'rack', component: RackMasterComponent, canActivate: [UserGuard] },
  { path: 'zone', component: ZoneMasterComponent, canActivate: [UserGuard] },
  { path: 'level', component: LevelMasterComponent, canActivate: [UserGuard] },
  { path: 'location', component: MainLocationComponent, canActivate: [UserGuard] },
  { path: 'productStrategy', component: ProductStrategyComponent, canActivate: [UserGuard] },
  { path: 'putawayStrategy', component: PutawayStrategyComponent, canActivate: [UserGuard] },
  { path: 'pickingStrategy', component: PickingStrategyComponent, canActivate: [UserGuard] },
  { path: 'customer', component: CustomerMasterComponent, canActivate: [UserGuard] },
  { path: 'productByCustomer', component: ProductByCustomerComponent, canActivate: [UserGuard] },
  { path: 'vehicle', component: VehicleComponent, canActivate: [UserGuard] },
  { path: 'warehouseTeam', component: WarehouseTeamComponent, canActivate: [UserGuard] },
  { path: 'equipment', component: EquipmentMasterComponent },
  { path: 'billOfResources', component: BillOfResourcesComponent },
  { path: 'replenishment', component: ReplenishmentOrderComponent },
  { path: 'billToAddress', component: BillToAddressComponent },
  { path: 'uom-conversion', component: UomConversionComponent },
  { path: 'Transporator', component: TransporterComponent },
  { path: 'vehicclebytransporator', component: VehiclebytransporterComponent },
  { path: 'column', component: ColumnComponent },
  { path: 'abcGroup', component: AbcgroupComponent },
  { path: 'abcAnalysisClass', component: AbcanalysysclassComponent },
  { path: 'organization', component: OrganizationComponent },
  { path: 'tax', component: TaxesComponent },
  { path: 'productCategoryGroup', component: ProductcategorygroupComponent },
  { path: 'state', component: CountryStateComponent },
  { path: 'promotion', component: PromotionComponent },
  { path: 'promotion-policy', component: PromotionPolicyComponent }

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDataRoutingModule { }
