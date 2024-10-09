import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { DeletionService } from 'src/app/services/integration-services/deletion.service';

@Component({
  selector: 'app-status-config',
  templateUrl: './status-config.component.html',
  styleUrls: ['./status-config.component.scss']
})
export class StatusConfigComponent implements OnInit {
  configPermissionsList = ['View', 'Update', 'Delete'];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  inventoryAdjustmentForm: any = {};
  purchaseOrderForm: any = {};
  internalTransfersForm: any = {}
  cycleCountingForm: any = {}
  wtCreateForm: any = {}
  wtApproveForm: any = {}
  statusForm:any ={}
  formObj = this.configService.getGlobalpayload();
  overAllStatusConfigurations: any = [];

  constructor(private configService: ConfigurationService, private toastr: ToastrService,
    private deleteService: DeletionService, private translate: TranslateService,) {
      this.translate.use(this.language);
    }

  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createForm();
    this.getStatusConfig();
  }
  createForm() {
    this.inventoryAdjustmentForm = {
      "_id": null,
      "name": "Inventory Adjustment",
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      "processStatusStages": [],
    }
    this.purchaseOrderForm = {
      "_id": null,
      "name": "Purchase Order",
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
      "processStatusStages": [],
    },
      this.internalTransfersForm = {
        "_id": null,
        "name": "Internal Transfers",
        "createdDate": null,
        "lastUpdatedDate": null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
        "processStatusStages": [],
      },
      this.cycleCountingForm = {
        "_id": null,
        "name": "Cycle Counting",
        "createdDate": null,
        "lastUpdatedDate": null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
        "processStatusStages": [],
      },
      this.wtCreateForm = {
        "_id": null,
        "name": "Warehouse Transfer Create",
        "createdDate": null,
        "lastUpdatedDate": null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
        "processStatusStages": [],
      },
      this.wtApproveForm = {
        "_id": null,
        "name": "Warehouse Transfer Approve",
        "createdDate": null,
        "lastUpdatedDate": null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
        "processStatusStages": [],
      },
      this.statusForm = {
        "_id": null,
        "name": "Status",
        "createdDate": null,
        "lastUpdatedDate": null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
        "processStatusStages": [],
      }
  }
  onItemAdded(item, type, form, nameValue) {
    switch (type) {
      case 'status': {
        const payload = this[form];
        if (payload.processStatusStages.length == 0) {
          const process = {
            "_id": null,
            "statusSequence": 1,
            "status": item.status
          }
          payload.processStatusStages.push(process);
        }
        else {
          payload.processStatusStages.forEach((element, i) => {
            element.statusSequence = i + 1;
            delete element.value;
          });
        }
        const final = [];
        this.overAllStatusConfigurations.forEach(element => {
          if ((element.name == 'Inventory Adjustment' && form == 'inventoryAdjustmentForm') ||
            (element.name == 'Purchase Order' && form == 'purchaseOrderForm') ||
            (element.name == 'Internal Transfers' && form == 'internalTransfersForm') ||
            (element.name == 'Cycle Counting' && form == 'cycleCountingForm') ||
            (element.name == 'Warehouse Transfer Create' && form == 'wtCreateForm') ||
            (element.name == 'Warehouse Transfer Approve' && form == 'wtApproveForm')||
            (element.name == 'Status' && form == 'statusForm') ) {
            final.push(payload);
          }
          else {
            final.push(element);
          }
        });
        const name = this.overAllStatusConfigurations.find(x => x.name == nameValue);
        if (!name) {
          final.push(payload);
        }
        this.configService.saveOrUpdateStatusConfig(final).subscribe(res => {
          if (res['status'] == 0 && res['data'].processStatusConfigurations) {
            this.toastr.success('Saved Successfully');
            this.getStatusConfig();
          }
        })
      }
        break;
    }
  }
  onItemRemoved(item, type, form, name) {
    console.log(this[form].processStatusStages);
    // this[form].processStatusStages.splice(item.statusSequence, 1);
    if (this[form].processStatusStages.length == 0) {
      this.deleteStatusConfig(form);
    }
    else {
      this.onItemAdded(null, type, form, name);
    }
  }
  deleteStatusConfig(form) {
    this.deleteService.deleteStatusConfig(this[form]._id, this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].processStatusConfiguration) {
        this.toastr.success('Deleted Successfully');
        this.createForm();
        this.getStatusConfig();
      }
    })
  }
  getStatusConfig() {
    this.configService.getAllStatusConfig(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res.data.processStatusConfigurations && res['data'].processStatusConfigurations.length) {
        this.overAllStatusConfigurations = res.data.processStatusConfigurations;
        res['data'].processStatusConfigurations.forEach(element => {
          if (element.name == "Inventory Adjustment") {
            this.inventoryAdjustmentForm = element;
          }
          if (element.name == "Purchase Order") {
            this.purchaseOrderForm = element;
          }
          if (element.name == "Internal Transfers") {
            this.internalTransfersForm = element;
          }
          if (element.name == "Cycle Counting") {
            this.cycleCountingForm = element;
          }
          if (element.name == 'Warehouse Transfer Create') {
            this.wtCreateForm = element
          }
          if (element.name == 'Warehouse Transfer Approve') {
            this.wtApproveForm = element
          }
          if (element.name == 'Status') {
            this.statusForm = element
          }
        });
      }
    })
  }
}