import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from '../../../shared/services/common.service';
import { PlanningService } from '../../../services/integration-services/planning.service';
import { WmsCommonService } from '../../../services/wms-common.service';
import { DashboardService } from '../../../services/integration-services/dashboard.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from 'src/app/shared/utils/storage';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inbound-capacity',
  templateUrl: './inbound-capacity.component.html'
})
export class InboundCapacityComponent implements OnInit, AfterViewInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  purchaseOrders: any = [];
  filteredProducts: any = [];
  poLineKeys: any = ['S.No', 'WMPO Number', 'Product ID/Name', 'UOM', 'Supplier/Warehouse IDName', 'Receipt Date', 'Expected Delivery Date', 'Quantity', 'Receipt Type'];
  dayWiseKeys: any = [];
  dayWiseKeysForEE: any = [];
  totalCapacityPlanningByDay: any = [];
  currentDate: any = Date.now();
  productsList: any = [];
  equipmentsAndExecutivesList: any = [];
  formObj = this.configService.getGlobalpayload();
  inboundCapacityPlanningList = this.configService.getPermissions('mainFunctionalities', 'Planning', 'Inbound Capacity Planning', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  constructor(
    private planningService: PlanningService, private datePipe: DatePipe,
    private wmsCommonService: WmsCommonService,
    private commonService: CommonService,
    private dashboardService: DashboardService, private configService: ConfigurationService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
    }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.dayWiseKeys = ['Product'];
    const arr: any = [new Date()];
    for (let i = 0; i < 14; i++) {
      const newDate = this.addOneDay(new Date(arr[arr.length - 1]));
      arr.push(newDate);
    }
    this.dayWiseKeys = this.dayWiseKeys.concat(arr);

    this.dayWiseKeysForEE = ['Equipments/Executives'];
    const arr1: any = [new Date()];
    for (let i = 0; i < 14; i++) {
      const newDate = this.addOneDay(new Date(arr1[arr1.length - 1]));
      arr1.push(newDate);
    }
    this.dayWiseKeysForEE = this.dayWiseKeysForEE.concat(arr1);

    this.getFunctionsCall();
  }
  getFunctionsCall() {
    if (this.inboundCapacityPlanningList.includes('View')) {
      this.fetchOrders();
      this.fetchAllInboundCapacityPlanning();
    }
  }
  fetchOrders() {
    this.planningService.findOrdersforInbound(this.formObj).subscribe(res => {
      console.log(res);
      if (res['status'] == 0 && res['data']['goodsReceipts']) {
        this.purchaseOrders = res['data']['goodsReceipts'];
        this.getFinalProducts();
      } else {
        this.purchaseOrders = [];
      }
    })
  }
  addOneDay(date) {
    date.setDate(date.getDate() + 1);
    return date;
  }

  fetchAllPurchaseOrders() {
    const form = {
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName
    }
    this.dashboardService.findAllActivePurchaseOrders(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrderList) {
          this.purchaseOrders = response.data.purchaseOrderList;
          this.getFinalProducts();
        }
      },
      (error) => {
        this.purchaseOrders = [];
      });
  }
  getFinalProducts() {
    const products = [];
    this.purchaseOrders.forEach(po => {
      for (const key in po) {
        if (key && key === 'goodsReceiptLines') {
          po[key].forEach(a => {
            a.fullWmpoNumber = po.fullWmpoNumber ? po.fullWmpoNumber : po.wmpoNumber;
            a.IDName = (po.wareHouseTransferSourceInfo && po.wareHouseTransferSourceInfo.wareHouseIDName )? po.wareHouseTransferSourceInfo.wareHouseIDName :
              ((po.supplierMasterInfo && po.supplierMasterInfo.supplierIDName) ?
               po.supplierMasterInfo.supplierIDName : ((po.customerMasterInfo && po.customerMasterInfo.customerIDName) ? po.customerMasterInfo.customerIDName : ''));
            a.receiptDate = po.receiptDate;
            a.receiptType = po.receiptType;
            a.poDeliveryDate = po[key].eta;
            a.quantity = po[key].orderedQuantity;
            a.units = po[key].inventoryUnit;
            products.push(a);
          });
        }
      }
    });
    this.filteredProducts = products;
  }
  fetchAllInboundCapacityPlanning() {
    this.planningService.fetchInboundCapacityPlanning(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inboundCapacityProductPlanList.length) {
          this.totalCapacityPlanningByDay = response.data.inboundCapacityProductPlanList;
          this.formatCapacityPlanningData();
        }
      },
      (error) => {

      });
    this.planningService.findResourcePlanningforInbound(this.formObj).subscribe(
      (res) => {
        if (res && res.status === 0 && res.data.inboundCapacityResourcesPlanList) {
          this.formatCapacityPlanningDataForEquipments(res.data.inboundCapacityResourcesPlanList);
        }
      },
      (error) => {

      });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    // this.forPermissionsSubscription.unsubscribe();
  }
  formatCapacityPlanningData() {
    let productsList = [];
    let productsArrayList = [];
    productsList = [...new Set(this.totalCapacityPlanningByDay.map(x => x.productIDName))];

    // this.totalCapacityPlanningByDay.forEach(day => {
    //   if (day.productQuantityList) {
    //     day.productQuantityList.forEach(product => {
    //       if (productsList.indexOf(product.productIDName) === -1) {
    //         productsList.push(product.productIDName);
    //       }
    //     });
    //   }
    // });
    productsList.forEach(product => {
      productsArrayList.push({
        name: product,
        day1: { date: this.currentDate, quantity: null },
        day2: { date: this.getDateFromMilliSeconds(), quantity: null },
        day3: { date: this.getDateFromMilliSeconds(), quantity: null },
        day4: { date: this.getDateFromMilliSeconds(), quantity: null },
        day5: { date: this.getDateFromMilliSeconds(), quantity: null },
        day6: { date: this.getDateFromMilliSeconds(), quantity: null },
        day7: { date: this.getDateFromMilliSeconds(), quantity: null },
        day8: { date: this.getDateFromMilliSeconds(), quantity: null },
        day9: { date: this.getDateFromMilliSeconds(), quantity: null },
        day10: { date: this.getDateFromMilliSeconds(), quantity: null },
        day11: { date: this.getDateFromMilliSeconds(), quantity: null },
        day12: { date: this.getDateFromMilliSeconds(), quantity: null },
        day13: { date: this.getDateFromMilliSeconds(), quantity: null },
        day14: { date: this.getDateFromMilliSeconds(), quantity: null },
        day15: { date: this.getDateFromMilliSeconds(), quantity: null },
      });
      this.currentDate = Date.now();
    });
    productsArrayList = this.wmsCommonService.getQuantites(productsArrayList, this.totalCapacityPlanningByDay);
    this.productsList = productsArrayList;
  }
  formatCapacityPlanningDataForEquipments(response) {
    const equipmentsAndExecutives = ['equipmentRequired', 'equipmentAvailable', 'equipmentRemaining', 'executivesRequired',
      'executivesAvailable', 'executivesRemaining'];
    let equipmentsAndExecutivesArrayList = [];
    equipmentsAndExecutives.forEach(name => {
      equipmentsAndExecutivesArrayList.push({
        name,
        day1: { date: this.currentDate, quantity: null },
        day2: { date: this.getDateFromMilliSeconds(), quantity: null },
        day3: { date: this.getDateFromMilliSeconds(), quantity: null },
        day4: { date: this.getDateFromMilliSeconds(), quantity: null },
        day5: { date: this.getDateFromMilliSeconds(), quantity: null },
        day6: { date: this.getDateFromMilliSeconds(), quantity: null },
        day7: { date: this.getDateFromMilliSeconds(), quantity: null },
        day8: { date: this.getDateFromMilliSeconds(), quantity: null },
        day9: { date: this.getDateFromMilliSeconds(), quantity: null },
        day10: { date: this.getDateFromMilliSeconds(), quantity: null },
        day11: { date: this.getDateFromMilliSeconds(), quantity: null },
        day12: { date: this.getDateFromMilliSeconds(), quantity: null },
        day13: { date: this.getDateFromMilliSeconds(), quantity: null },
        day14: { date: this.getDateFromMilliSeconds(), quantity: null },
        day15: { date: this.getDateFromMilliSeconds(), quantity: null },
      });
      this.currentDate = Date.now();
    });
    equipmentsAndExecutivesArrayList = this.wmsCommonService.getEquipmentAndExecutiveCount
      (equipmentsAndExecutivesArrayList, response, 'inbound');
    equipmentsAndExecutivesArrayList.forEach(e => {
      e.name = this.commonService.getEndStringWithCapitalCase(e.name);
    });
    this.equipmentsAndExecutivesList = equipmentsAndExecutivesArrayList.slice();
    console.log(this.equipmentsAndExecutivesList);
  }
  getDateFromMilliSeconds() {
    this.currentDate = this.currentDate + 86400000;
    return this.currentDate;
  }
}
