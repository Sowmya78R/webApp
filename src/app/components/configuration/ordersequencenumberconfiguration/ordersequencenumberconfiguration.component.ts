import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-ordersequencenumberconfiguration',
  templateUrl: './ordersequencenumberconfiguration.component.html',
  styleUrls: ['./ordersequencenumberconfiguration.component.scss']
})
export class OrdersequencenumberconfigurationComponent implements OnInit {

  orderSequencNumberForm: FormGroup;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private cdRef: ChangeDetectorRef, private toastr: ToastrService, private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  purchaseOrderForm: any = {};
  salesOrderForm: any = {};
  wareHouseTransferForm: any = {};
  purchaseReturnForm: any = {};
  wareHouseTransferReturnForm: any = {};
  invoiceForm: any = {};
  inventoryForm: any = {};
  inventoryTransactionForm: any = {};
  inventoryTransactionDetailsForm: any = {};
  inventoryAdjustmentForm: any = {};
  internalTransferForm: any = {};
  cycleCountingForm: any = {};
  putawayForm: any = {};
  pickingForm: any = {};
  inventoryIssueForm: any = {};
  replishmentOrderHistoryForm: any = {};
  crossDockingHistoryForm: any = {};
  inventoryIssuePickingForm: any = {};
  salesReturnForm: any = {};
  ;
  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createForm();
    this.getPrefixConfig();
    this.callingFormArray();
  }
  createForm() {
    this.purchaseOrderForm = {
      "_id": null,
      "name": "Purchase Order",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.salesOrderForm = {
      "_id": null,
      "name": "Sales Order",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    },
      this.wareHouseTransferForm = {
        "_id": null,
        "name": "Warehouse Transfer",
        "prefix": null,
        "startNumber": null,
        "createdDate": null,
        "lastUpdatedDate": null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
      },
      this.purchaseReturnForm = {
        "_id": null,
        "name": "Purchase Return",
        "prefix": null,
        "startNumber": null,
        "createdDate": null,
        "lastUpdatedDate": null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
      },
      this.wareHouseTransferReturnForm = {
        "_id": null,
        "name": "Warehouse Transfer Return",
        "prefix": null,
        "startNumber": null,
        "createdDate": null,
        "lastUpdatedDate": null,
        "organizationInfo": this.configService.getOrganization(),
        "wareHouseInfo": this.configService.getWarehouse(),
      }
    this.invoiceForm = {
      "_id": null,
      "name": "Invoice",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.inventoryForm = {
      "_id": null,
      "name": "Inventory",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.inventoryTransactionForm = {
      "_id": null,
      "name": "Inventory Transaction",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.inventoryTransactionDetailsForm = {
      "_id": null,
      "name": "Inventory Transaction Details",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.inventoryAdjustmentForm = {
      "_id": null,
      "name": "Inventory Adjustment",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.internalTransferForm = {
      "_id": null,
      "name": "Internal Transfer",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.cycleCountingForm = {
      "_id": null,
      "name": "Cycle Counting",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.putawayForm = {
      "_id": null,
      "name": "Putaway",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.pickingForm = {
      "_id": null,
      "name": "Picking",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.inventoryIssueForm = {
      "_id": null,
      "name": "Inventory Issue",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.replishmentOrderHistoryForm = {
      "_id": null,
      "name": "Replenishment Order History",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.crossDockingHistoryForm = {
      "_id": null,
      "name": "Cross Docking History",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.inventoryIssuePickingForm = {
      "_id": null,
      "name": "Inventory Issue Picking",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
    this.salesReturnForm = {
      "_id": null,
      "name": "Sales Return",
      "prefix": null,
      "startNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse(),
    }
  }
  finalFramedArray: any = []
  callingFormArray() {
    this.finalFramedArray.push(this.purchaseOrderForm);
    this.finalFramedArray.push(this.salesOrderForm);
    this.finalFramedArray.push(this.wareHouseTransferForm);
    this.finalFramedArray.push(this.purchaseReturnForm);
    this.finalFramedArray.push(this.wareHouseTransferReturnForm);
    this.finalFramedArray.push(this.invoiceForm);
    this.finalFramedArray.push(this.inventoryForm);
    this.finalFramedArray.push(this.inventoryTransactionForm);
    this.finalFramedArray.push(this.inventoryTransactionDetailsForm);
    this.finalFramedArray.push(this.inventoryAdjustmentForm);
    this.finalFramedArray.push(this.internalTransferForm);
    this.finalFramedArray.push(this.cycleCountingForm);
    this.finalFramedArray.push(this.putawayForm);
    this.finalFramedArray.push(this.pickingForm);
    this.finalFramedArray.push(this.inventoryIssueForm);
    this.finalFramedArray.push(this.replishmentOrderHistoryForm);
    this.finalFramedArray.push(this.crossDockingHistoryForm);
    this.finalFramedArray.push(this.inventoryIssuePickingForm);
    this.finalFramedArray.push(this.salesReturnForm);
  }

  save() {
    this.configService.savePrefixConfig(this.finalFramedArray).subscribe(res => {

      if (res['status'] == 0) {
        this.processStatusConfigurationsList = res.data.orderSequenceNumberConfigurations;
        this.toastr.success(res.statusMsg);
        this.getPrefixConfig();
      }
    })
  }
  formObj = this.configService.getGlobalpayload();
  processStatusConfigurationsList: any;
  getPrefixConfig() {
    this.configService.getALLOrderSequenceNumberConfig(this.formObj).subscribe(res => {

      if (res['status'] == 0) {
        this.processStatusConfigurationsList = res.data.orderSequenceNumberConfigurations;

        res.data.orderSequenceNumberConfigurations.forEach(element => {

          const purchaseOrderElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Purchase Order");
          const salesOrderElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Sales Order");
          const salesReturnElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Sales Return");
          const wareHouseTransferReturnElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Warehouse Transfer Return");
          const wareHouseTransferElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Warehouse Transfer");
          const PurchaseReturnElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Purchase Return");
          const InvoiceElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Invoice");
          const inventoryElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Inventory");
          const inventoryTransactionElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Inventory Transaction");
          const inventoryTransactionDetailsElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Inventory Transaction Details");
          const inventoryAdjustmentElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Inventory Adjustment");
          const internalTransferElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Internal Transfer");
          const cycleCountingElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Cycle Counting");
          const putawayElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Putaway");
          const pickingElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Picking");
          const inventoryIssueElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Inventory Issue");
          const replenishmentOrderHistoryElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Replenishment Order History");
          const crossDockingHistoryElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Cross Docking History");
          const inventoryIssuePickingElement = res.data.orderSequenceNumberConfigurations.find(element => element.name === "Inventory Issue Picking");

          if (purchaseOrderElement) {
            this.purchaseOrderForm = { ...purchaseOrderElement }; // Copy the element to avoid mutating the original object
            this.purchaseOrderForm = purchaseOrderElement;
          }
          if (salesOrderElement) {
            this.salesOrderForm = { ...salesOrderElement }; // Copy the element to avoid mutating the original object
            this.salesOrderForm = salesOrderElement;
          }
          if (wareHouseTransferElement) {
            this.wareHouseTransferForm = { ...wareHouseTransferElement }; // Copy the element to avoid mutating the original object
            this.wareHouseTransferForm = wareHouseTransferElement;
          }
          if (PurchaseReturnElement) {
            this.purchaseReturnForm = { ...PurchaseReturnElement }; // Copy the element to avoid mutating the original object
            this.purchaseReturnForm = PurchaseReturnElement;
          }
          if (wareHouseTransferReturnElement) {
            this.wareHouseTransferReturnForm = { ...wareHouseTransferReturnElement }; // Copy the element to avoid mutating the original object
            this.wareHouseTransferReturnForm = wareHouseTransferReturnElement;
          }
          if (InvoiceElement) {
            this.invoiceForm = { ...InvoiceElement }; // Copy the element to avoid mutating the original object
            this.invoiceForm = InvoiceElement;
          }
          if (inventoryElement) {
            this.inventoryForm = { ...inventoryElement }; // Copy the element to avoid mutating the original object
            this.inventoryForm = inventoryElement;
          }
          if (inventoryTransactionElement) {
            this.inventoryTransactionForm = { ...inventoryTransactionElement }; // Copy the element to avoid mutating the original object
            this.inventoryTransactionForm = inventoryTransactionElement;
          }
          if (inventoryTransactionDetailsElement) {
            this.inventoryTransactionDetailsForm = { ...inventoryTransactionDetailsElement }; // Copy the element to avoid mutating the original object
            this.inventoryTransactionDetailsForm = inventoryTransactionDetailsElement;
          }
          if (inventoryAdjustmentElement) {
            this.inventoryAdjustmentForm = { ...inventoryAdjustmentElement }; // Copy the element to avoid mutating the original object
            this.inventoryAdjustmentForm = inventoryAdjustmentElement;
          }
          if (internalTransferElement) {
            this.internalTransferForm = { ...internalTransferElement }; // Copy the element to avoid mutating the original object
            this.internalTransferForm = internalTransferElement;
          }
          if (cycleCountingElement) {
            console.log(cycleCountingElement)
            console.log(this.cycleCountingForm)
            this.cycleCountingForm = { ...cycleCountingElement }; // Copy the element to avoid mutating the original object
            this.cycleCountingForm = cycleCountingElement;
          }

          if (putawayElement) {
            this.putawayForm = { ...putawayElement }; // Copy the element to avoid mutating the original object
            this.putawayForm = putawayElement;
          }
          if (pickingElement) {
            this.pickingForm = { ...pickingElement }; // Copy the element to avoid mutating the original object
            this.pickingForm = pickingElement;
          }
          if (inventoryIssueElement) {
            this.inventoryIssueForm = { ...inventoryIssueElement }; // Copy the element to avoid mutating the original object
            this.inventoryIssueForm = inventoryIssueElement;
          }
          if (replenishmentOrderHistoryElement) {
            this.replishmentOrderHistoryForm = { ...replenishmentOrderHistoryElement }; // Copy the element to avoid mutating the original object
            this.replishmentOrderHistoryForm = replenishmentOrderHistoryElement;
          }
          if (crossDockingHistoryElement) {
            this.crossDockingHistoryForm = { ...crossDockingHistoryElement }; // Copy the element to avoid mutating the original object
            this.crossDockingHistoryForm = crossDockingHistoryElement;
          }
          if (inventoryIssuePickingElement) {
            this.inventoryIssuePickingForm = { ...inventoryIssuePickingElement }; // Copy the element to avoid mutating the original object
            this.inventoryIssuePickingForm = inventoryIssuePickingElement;
          }
          if (salesReturnElement) {
            this.salesReturnForm = { ...salesReturnElement }; // Copy the element to avoid mutating the original object
            this.salesReturnForm = salesReturnElement;
          }
        })
      }
    })

  }
}
