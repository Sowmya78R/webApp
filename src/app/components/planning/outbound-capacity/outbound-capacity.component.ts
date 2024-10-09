import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ExcelService } from '../../../shared/services/excel.service';
import { WMSService } from '../../../services/integration-services/wms.service';
import { CommonService } from '../../../shared/services/common.service';
import { PlanningService } from '../../../services/integration-services/planning.service';
import { WmsCommonService } from '../../../services/wms-common.service';
import { OutboundProcessService } from '../../../services/integration-services/outboundProcess.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from 'src/app/shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-outbound-capacity',
  templateUrl: './outbound-capacity.component.html'
})
export class OutboundCapacityComponent implements OnInit, AfterViewInit, OnDestroy {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  salesOrders: any = [];
  filteredProducts: any = [];
  filteredSOProductKeys: any = ['S.No', 'WMSO No', 'Product ID/Name', 'UOM', 'Customer/Warehouse IDName', 'Order Date', 'Expected Delivery Date','Quantity','Order Type'];
  dayWiseKeys: any = ['Product', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11',
    'Day 12', 'Day 13', 'Day 14', 'Day 15'];
  dayWiseKeysForEE: any = ['Equipments/Executives', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11',
    'Day 12', 'Day 13', 'Day 14', 'Day 15'];
  totalCapacityPlanningByDay: any = [];
  currentDate: any = Date.now();
  productsList: any = [];
  equipmentsAndExecutivesList: any = [];
  customerID: any = '';
  soProducts: any = [];
  formObj = this.configService.getGlobalpayload();
  inboundCapacityPlanningList = this.configService.getPermissions('mainFunctionalities', 'Planning', 'Outbound Capacity Planning', Storage.getSessionUser());
  outboundCapacityPlanning
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private excelService: ExcelService,
    private planningService: PlanningService,
    private outboundProcessService: OutboundProcessService,
    private wmsCommonService: WmsCommonService,
    private commonService: CommonService, private configService: ConfigurationService,
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

    this.getFunctionsCall()
  }
  getFunctionsCall() {
    if (this.inboundCapacityPlanningList.includes('View')) {
      this.fetchOrders();
    }
  }
  addOneDay(date) {
    date.setDate(date.getDate() + 1);
    return date;
  }
  fetchOrders() {
    this.planningService.findOrdersforOutbound(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['salesOrderList']) {
        this.salesOrders = res['data']['salesOrderList'];
        this.getFinalProducts();
        this.fetchAllOutboundCapacityPlanning();
      } else {
        this.salesOrders = [];
      }
    })
  }
  // findAllSalesOrders() {
  //   this.outboundProcessService.fetchAllActiveSalesOrders(this.formObj).subscribe(
  //     (response) => {
  //       if (response && response.status === 0 && response.data.activeSalesOrderList) {
  //         this.salesOrders = response.data.activeSalesOrderList;
  //         this.getFinalProducts();
  //       } else {
  //         this.salesOrders = [];
  //       }
  //     },
  //     (error) => {
  //       this.salesOrders = [];
  //     });
  // }
  getFinalProducts() {
    const salesOrders = this.salesOrders;
    const products = [];
    salesOrders.forEach(so => {
      for (const key in so) {
        if (key === 'salesOrderLines') {
          so[key].forEach(a => {
            a.fullWmsoNumber = so.fullWmsoNumber || '';
            a.idName = so.wareHouseTransferDestinationInfo
              ? so.wareHouseTransferDestinationInfo.wareHouseIDName :
              (so.customerMasterInfo ? so.customerMasterInfo.customerIDName : (so.supplierMasterInfo ? so.supplierMasterInfo.supplierIDName : ''));
            a.soOrderDate = so.soOrderDate || '';
            // a.deliveryExpDate = so[key].expectedDeliveryDate;
            a.orderType = so.orderType;
            products.push(a);
          });
        }
      }
    });
    this.soProducts = products;
  }
  fetchAllOutboundCapacityPlanning() {
    this.planningService.fetchOutboundCapacityPlanning(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.outboundCapacityProductPlanList) {
          this.totalCapacityPlanningByDay = response.data.outboundCapacityProductPlanList;
          this.formatCapacityPlanningData();
        }
      },
      (error) => {

      });
    this.planningService.findResourcePlanningforOutbound(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.outboundCapacityResourcesPlanList) {
          this.formatCapacityPlanningDataForEquipments(response.data.outboundCapacityResourcesPlanList);
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
    //this.forPermissionsSubscription.unsubscribe();
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
      'executivesAvailable', 'executivesRemaining', 'vehiclesRequired', 'vehiclesAvailable', 'vehiclesRemaining'];
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
      (equipmentsAndExecutivesArrayList, response, 'outbound');
    equipmentsAndExecutivesArrayList.forEach(e => {
      e.name = this.commonService.getEndStringWithCapitalCase(e.name);
    });
    this.equipmentsAndExecutivesList = equipmentsAndExecutivesArrayList;
  }
  getDateFromMilliSeconds() {
    this.currentDate = this.currentDate + 86400000;
    return this.currentDate;
  }

}
