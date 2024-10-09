import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { BarcodeService } from 'src/app/services/barcode.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-process-bconfig',
  templateUrl: './process-bconfig.component.html',
  styleUrls: ['./process-bconfig.component.scss']
})
export class ProcessBConfigComponent implements OnInit, OnDestroy, AfterViewInit {
  dropdownList = ['Purchase Order', 'Goods Receiving', 'Putaway', 'Sales Order', 'Picking', 'Shipment Order', 'Invoice', 'Replenishment',
    'Purchase Returns', 'Sales Returns', 'Warehouse Transfers', 'Inbound Capacity Planning', 'Outbound Capacity Planning',
    'Packing', 'Labeling', 'Repacking', 'Co-Packing', 'Internal Transfers', 'Inventory Adjustments', 'Cycle Counting', 'Inventory'];
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
  selectedProcess: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  deleteInfo: any;
  formObj = this.configService.getGlobalpayload();
  overAllRecords: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  constructor(private configService: ConfigurationService, private barcodeService: BarcodeService,
    private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
     }

  ngAfterViewInit(): void {
    // this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
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
    this.get();
  }
  frameJson(el) {
    return {
      "_id": null,
      "processName": el,
      "upcEANNumber": null
    }

  }
  get() {
    this.barcodeService.fetchAllProcessBarcode(this.formObj).subscribe(res => {
      if (res['status'] === 0 && res['data']['processBarcodeConfigurations'].length > 0) {
        this.overAllRecords = res['data']['processBarcodeConfigurations'];
        this.dtTrigger.next();
      }
      else {
        this.overAllRecords = [];
      }
    })
  }
  save() {
    console.log(this.selectedProcess);
    const payload = {
      "wareHouseInfo": this.configService.getWarehouse(),
      "organizationInfo": this.configService.getOrganization(),
      processBarcodeConfigurationLines: []
    }
    if (this.selectedProcess.length > 0) {
      this.selectedProcess.forEach(element => {
        payload['processBarcodeConfigurationLines'].push(this.frameJson(element))
      })
    };
    console.log(payload);
    this.barcodeService.saveOrUpdateProcessBarcode(payload).subscribe(res => {
      if (res['status'] === 0 && res['data']['processBarcodeConfiguration']) {
        this.toastr.success("Saved Successfully");
        this.rerender();
        this.get();
        this.clear();
      }

    })

  }
  clear() {
    this.selectedProcess = [];
  }
  delete(name) {
    this.deleteInfo = { name: 'processBarcodeConfig', processName: name, id: this.overAllRecords[0]._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.rerender();
      this.get();
    }
  }

}
