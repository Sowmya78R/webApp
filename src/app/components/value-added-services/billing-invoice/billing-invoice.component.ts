import { Component, OnInit } from '@angular/core';
import { Storage } from '../../../shared/utils/storage';
import { AppService } from '../../../shared/services/app.service';
import { Constants } from '../../../constants/constants';
import { EmitterService } from '.././../../services/emitter.service';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { VASRestService } from '../../../services/integration-services/vas-rest.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
@Component({
  selector: 'app-billing-invoice',
  templateUrl: './billing-invoice.component.html',
  styleUrls: ['./billing-invoice.component.scss']
})
export class BillingInvoiceComponent implements OnInit {
  packingMaterialsData: any = [];
  labourChargesListData: any = [];
  mechanicalRateDataUnloading: any;
  mechanicalRateDataLoading: any;
  billingData: any = {
    palletPositionHired: {},
    additionalPalletPositionHired: {},
    flatRate: {
      loading: {},
      unloading: {}
    },
    variableRate: {
      loading: {},
      unloading: {}
    },
    mechanicalRate: {
      loading: {},
      unloading: {}
    },
    packingMaterialList: [],
    labourChargesList: [],
    totalAmount: ''
  };
  id: any;
  formObj = this.configService.getGlobalpayload();
  constructor(
    private appService: AppService,private configService:ConfigurationService,
    private emitterService: EmitterService,
    private vasRestService: VASRestService,
    public ngxSmartModalService: NgxSmartModalService,
  ) { }

  ngOnInit() {
    this.id = this.appService.getParam('id');
    this.fetchBillingInvoicingData();
    this.emitterService.billingInvoiceDataPrint.subscribe(id => {
      this.id = id;
      this.fetchBillingInvoicingData();
    })
  }
  fetchBillingInvoicingData() {
    if (this.id) {
      this.vasRestService.findBillingPurchaseOrderByID(this.id,this.formObj).subscribe((response) => {
        if (response && response.status === 0 && response.data.billingPurchaseOrder) {
          this.billingData = response.data.billingPurchaseOrder;
          this.packingMaterialsData = response.data.billingPurchaseOrder.packingMaterialList;
          this.labourChargesListData = response.data.billingPurchaseOrder.labourChargesList;
          this.mechanicalRateDataLoading = response.data.billingPurchaseOrder.mechanicalRate.loading;
          this.mechanicalRateDataUnloading = response.data.billingPurchaseOrder.mechanicalRate.unloading;
        }
      })
    }
  }


}
