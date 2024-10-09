import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { Ng2CompleterModule } from 'ng2-completer';
import { TagInputModule } from 'ngx-chips';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { HttpService } from '../shared/services/http.service';
import { AppService } from '../shared/services/app.service';
import { CommonService } from './services/common.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import { Util } from 'src/app/shared/utils/util';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpInterceptorService } from '../shared/services/http-interceptor.service';
import { UserGuard } from '../shared/route-guards/user.guard';
import { BillToAddressComponent } from '../components/master-datas/bill-to-address/bill-to-address.component';
import { OutboundMasterDataService } from '../services/integration-services/outboundMasterData.service';
import { DeletePopupComponent } from '../components/common/delete-popup/delete-popup.component';
import { DeletionService } from '../services/integration-services/deletion.service';
import { ConfigurationService } from '../services/integration-services/configuration.service';
import { WMSService } from '../services/integration-services/wms.service';
import { OutboundProcessService } from '../services/integration-services/outboundProcess.service';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalreportprintingComponent } from './globalreportprinting/globalreportprinting.component';
import { GlobalmainprintComponent } from './globalmainprint/globalmainprint.component';
import { SpaceutilizationbillingComponent } from '../components/value-added-services/spaceutilizationbilling/spaceutilizationbilling.component';
import { CreatecyclecountingComponent } from '../components/inventory/createcyclecounting/createcyclecounting.component';
import { InwardComponent } from '../components/inbound/inward/inward.component';
import { OutwardComponent } from '../components/outbound/outward/outward.component';
import { MaintainInvoicingComponent } from '../components/outbound/invoicing/maintain-invoicing/maintain-invoicing.component';
import { NzTreeSelectModule } from 'ng-zorro-antd';
import { NgxPaginationModule } from 'ngx-pagination';
import { decimalPipe } from './pipes/filter.pipe';
import { PurchaseRequestComponent } from '../components/inbound/purchase-request/purchase-request.component';
import { DecimalwithThreeDigitsPipe } from './pipes/decimalwith-three-digits.pipe';
import { DecimalwithTenDigitsPipe } from './pipes/tenDigitsDecimals.pipe';
import { ComboBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { GrnExcelsComponent } from '../components/common/grn-excels/grn-excels.component';
import { PutAwayTableComponent } from '../components/inbound/put-away/put-away-table/put-away-table.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { PickingnewversionComponent } from '../components/outbound/picking/pickingnewversion/pickingnewversion.component';
import { HistoryMainComponent } from '../components/common/history-main/history-main.component';
import { PutawaymanagementComponent } from '../components/inbound/put-away/putawaymanagement/putawaymanagement.component';
import { HistoryPDFComponent } from '../components/common/history-pdf/history-pdf.component';
import { PickingHistoryComponent } from '../components/outbound/picking/picking-history/picking-history.component';
import { BarcodepopupComponent } from '../components/common/barcodepopup/barcodepopup.component';

// import { MainCreatepopdfComponent } from '../components/inbound/purchase-order/main-createpopdf/main-createpopdf.component';


@NgModule({
  declarations: [
    BillToAddressComponent,
    DeletePopupComponent,
    GlobalreportprintingComponent,
    GlobalmainprintComponent,
    SpaceutilizationbillingComponent,
    CreatecyclecountingComponent,
    InwardComponent,
    OutwardComponent,
    BarcodepopupComponent,
    MaintainInvoicingComponent,
    PurchaseRequestComponent,
    decimalPipe,
    DecimalwithThreeDigitsPipe,
    DecimalwithTenDigitsPipe,
    GrnExcelsComponent,
    PutAwayTableComponent,
    PickingnewversionComponent,
    PutawaymanagementComponent,
    PickingHistoryComponent,
    HistoryMainComponent,
    HistoryPDFComponent
  ],
  imports: [
    CommonModule,
    // BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NgxSmartModalModule.forChild(),
    NgMultiSelectDropDownModule.forRoot(),
    Ng2CompleterModule,
    TagInputModule,
    NgxChartsModule,
    ChartsModule,
    TranslateModule,
    NgxPaginationModule,
    ComboBoxModule,
    ZXingScannerModule
  ],
  providers: [
    HttpService,
    AppService,
    CustomValidators,
    CommonService,
    OutboundMasterDataService,
    DeletionService,
    OutboundProcessService,
    WMSService,
    Util,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    UserGuard
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NgxSmartModalModule,
    Ng2CompleterModule,
    NgMultiSelectDropDownModule,
    TranslateModule,
    TagInputModule,
    NgxChartsModule,
    ChartsModule,
    BillToAddressComponent,
    DeletePopupComponent,
    NzTreeSelectModule,
    NgxPaginationModule,
    decimalPipe,
    DecimalwithThreeDigitsPipe,
    DecimalwithTenDigitsPipe,
    ComboBoxModule,
    GrnExcelsComponent,
    PutAwayTableComponent,
    PickingnewversionComponent,
    ZXingScannerModule,
    HistoryMainComponent,
    PickingHistoryComponent,
    PutawaymanagementComponent,
    HistoryPDFComponent,
    BarcodepopupComponent
  ]
})
export class SharedModule { }
// "ng-multiselect-dropdown": "^0.2.10"
