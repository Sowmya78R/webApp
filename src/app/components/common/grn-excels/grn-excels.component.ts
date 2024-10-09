import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import * as XLSX from 'xlsx';
import { GrnNoteComponent } from '../../grn-note/grn-note.component';
import { GateentryoutboundComponent } from '../../outbound/gateentryoutbound/gateentryoutbound.component';

@Component({
  selector: 'app-grn-excels',
  templateUrl: './grn-excels.component.html',
  styleUrls: ['./grn-excels.component.scss']
})
export class GrnExcelsComponent implements OnInit {
  permissionsList: any = ['View', 'Create', 'Update', 'Delete'];
  formObj = this.configService.getGlobalpayload();
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  failureRecords: any = [];
  noteType: any = null;
  totalItems: any = null;
  exportData: any = [];
  loopToStop: any = null;
  dataPerPage: number;
  vehicles: any = [];
  equipments: any = [];
  serviceProviders: any = [];

  constructor(private configService: ConfigurationService, private translate: TranslateService,
    private router: Router, private commonMasterDataService: CommonMasterDataService,
    private excelService: ExcelService, private wmsService: WMSService, private toastr: ToastrService) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    if (this.router.url.includes('inbound')) {
      this.noteType = 'Inward Shipment'
    }
    else if (this.router.url.includes('outbound')) {
      this.noteType = 'Outward Shipment'
    }
    this.fetchAllVehicles();
    this.fetchAllEquipments();
    this.fetchAllServiceProvider();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      if (file) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = async (e) => {
          const arrayBuffer: any = fileReader.result;
          const fileData = new Uint8Array(arrayBuffer);
          const arr = new Array();
          for (let i = 0; i !== fileData.length; ++i) { arr[i] = String.fromCharCode(fileData[i]); }
          const bstr = arr.join('');
          const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
          if (jsonData && jsonData.length > 0) {
            const missingParamsArray = [];
            let data1 = [];
            jsonData.forEach((k, index) => {
              data1.push(this.getFormat(k));
            })
            if (data1.length > 0) {
              console.log(data1);
              this.wmsService.gateEntryExcel(data1).subscribe(res => {
                if (res && (res.status === 2 || res.status == 0) && res.data.goodsReceiptNoteResponseMap && res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteFailureExcelList &&
                  res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteFailureExcelList.length > 0 && res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteSuccessExcelList &&
                  res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteSuccessExcelList.length > 0) {
                  this.failureRecords = res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteFailureExcelList;
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.configService.sendClickEvent();
                }
                else if (res && (res.status === 2 || res.status == 0) && res.data.goodsReceiptNoteResponseMap && res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteFailureExcelList &&
                  res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteFailureExcelList.length > 0) {
                  this.failureRecords = res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteFailureExcelList;
                  this.toastr.error('Failed in uploading, Please download log for reasons');
                }
                else if (res && res.status === 0 && res.data.goodsReceiptNoteResponseMap && res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteSuccessExcelList &&
                  res.data.goodsReceiptNoteResponseMap.goodsReceiptNoteSuccessExcelList.length > 0) {
                  this.toastr.success('Uploaded successfully');
                  this.configService.sendClickEvent();
                  this.failureRecords = [];
                }
                else {
                  this.toastr.error('Failed in uploading');
                  this.failureRecords = [];
                }
              })
            }
          }
        }
      }
    }
  }
  addOneDay(date) {
    date.setDate(date.getDate() + 1);
    return date;
  }
  getFormat(k) {
    let fullID = null;
    let assignEmps: any = [];
    let qcAssignEmps: any = [];
    let salesAssignEmps: any = [];
    let shipmentAssignEmps: any = [];
    let grnAssignEmps: any = [];

    if (k['AssignedTo'] && k['AssignedTo'].toString().includes(',')) {
      assignEmps = k['AssignedTo'].toString().split(',');
    }
    else {
      assignEmps = k['AssignedTo'] ? [k['AssignedTo']] : null;
    }
    if (k['QualityCheck AssignedTo'] && k['QualityCheck AssignedTo'].toString().includes(',')) {
      qcAssignEmps = k['QualityCheck AssignedTo'].toString().split(',');
    }
    else {
      qcAssignEmps = k['QualityCheck AssignedTo'] ? [k['QualityCheck AssignedTo']] : null;
    }
    if (this.noteType == 'Inward Shipment') {
      if (k['wmpoNumberPrefix']) {
        fullID = k['wmpoNumberPrefix'].trim();
      }
      if (k['wmpoNumber']) {
        if (fullID) {
          fullID = fullID + k['wmpoNumber'].toString().trim();
        }
        else {
          fullID = k['wmpoNumber'].toString().trim();
        }
      }
      if (k['GRN AssignedTo'] && k['GRN AssignedTo'].toString().includes(',')) {
        grnAssignEmps = k['GRN AssignedTo'].toString().split(',');
      }
      else {
        grnAssignEmps = k['GRN AssignedTo'] ? [k['GRN AssignedTo']] : null;
      }
    }
    if (this.noteType == 'Outward Shipment') {
      if (k['wmsoNumberPrefix']) {
        fullID = k['wmsoNumberPrefix'].trim();
      }
      if (k['wmsoNumber']) {
        if (fullID) {
          fullID = fullID + k['wmsoNumber'].toString().trim();
        }
        else {
          fullID = k['wmsoNumber'].toString().trim();
        }
      }
      if (k['Sales AssignedTo'] && k['Sales AssignedTo'].toString().includes(',')) {
        salesAssignEmps = k['Sales AssignedTo'].toString().split(',');
      }
      else {
        salesAssignEmps = k['Sales AssignedTo'] ? [k['Sales AssignedTo']] : null;
      }
      if (k['Shipment AssignedTo'] && k['Shipment AssignedTo'].toString().includes(',')) {
        shipmentAssignEmps = k['Shipment AssignedTo'].toString().split(',');
      }
      else {
        shipmentAssignEmps = k['Shipment AssignedTo'] ? [k['Shipment AssignedTo']] : null;
      }
    }
    let obj = {};
    obj['noteType'] = this.noteType;
    obj['organizationInfo'] = this.configService.getOrganization();
    obj['wareHouseInfo'] = this.configService.getWarehouse();
    obj['invoiceNumber'] = k['Invoice Number'] ? k['Invoice Number'] : null;
    obj['wmpoNumberPrefix'] = k['wmpoNumberPrefix'] ? k['wmpoNumberPrefix'].trim() : null;
    obj['wmpoNumber'] = k['wmpoNumber'] ? k['wmpoNumber'] : null;
    obj['fullWmpoNumber'] = fullID;
    obj['wmsoNumberPrefix'] = k['wmsoNumberPrefix'] ? k['wmsoNumberPrefix'].trim() : null;
    obj['wmsoNumber'] = k['wmsoNumber'] ? k['wmsoNumber'] : null;
    obj['fullWmsoNumber'] = fullID;
    obj['invoiceDate'] = k['Invoice Date'] ? this.addOneDay(new Date(k['Invoice Date'])) : null;
    obj['vehicleInfo'] = k['Vehicle Number'] ? this.mapId(k['Vehicle Number'], 'vehicle') : null;
    obj['vehicleType'] = k['Vehicle Type'] ? k['Vehicle Type'] : (k['Vehicle Number'] ? this.mapId(k['Vehicle Number'], 'vehicleType') : null);
    obj['equipmentInfo'] = k['Carrier Name'] ? this.mapId(k['Carrier Name'], 'equipment') : null;
    obj['serviceProviderInfo'] = k['Transporter'] ? this.mapId(k['Transporter'], 'serviceInfo') : null;
    obj['lrNumber'] = k['Lr Number'] ? k['Lr Number'] : null;
    obj['billOfEntryNumber'] = k['BillOf Entry Number'] ? k['BillOf Entry Number'] : null;
    obj['billOfLandingNumber'] = k['BillOf Landing Number'] ? k['BillOf Landing Number'] : null;
    obj['billOfEntryDate'] = k['BillOf Entry Date'] ? this.addOneDay(new Date(k['BillOf Entry Date'])) : null;
    obj['billOfLandingDate'] = k['BillOf Landing Date'] ? this.addOneDay(new Date(k['BillOf Landing Date'])) : null;
    obj['billOfEntryNumberDate'] = (obj['billOfEntryDate'] && obj['billOfEntryNumber']) ? (obj['billOfEntryNumber'] + ':' + obj['billOfEntryDate']) : null;
    obj['billOfLandingNumberDate'] = (obj['billOfLandingDate'] && obj['billOfLandingNumber']) ? (obj['billOfLandingNumber'] + ':' + obj['billOfLandingDate']) : null;
    obj['waybillNumber'] = k['WayBill Number'] ? k['WayBill Number'] : null;
    obj['invoiceTotalQuantity'] = k['Invoice Quantity'] ? k['Invoice Quantity'] : null;
    obj['invoiceTotalQuantityUom'] = k['InvoiceQty UOM'] ? k['InvoiceQty UOM'] : null;

    obj['assignedTo'] = assignEmps;
    obj['startDate'] = k['startDate'] ? this.addOneDay(new Date(k['startDate'])) : null;
    obj['endDate'] = k['endDate'] ? this.addOneDay(new Date(k['endDate'])) : null;
    obj['plannedCompletionDate'] = k['plannedCompletionDate'] ? this.addOneDay(new Date(k['plannedCompletionDate'])) : null;

    obj['qualityCheckAssignedTo'] = qcAssignEmps;
    obj['qualityCheckStartDate'] = k['QualityCheck StartDate'] ? this.addOneDay(new Date(k['QualityCheck StartDate'])) : null;
    obj['qualityCheckEndDate'] = k['QualityCheck EndDate'] ? this.addOneDay(new Date(k['QualityCheck EndDate'])) : null;
    obj['qualityCheckPlannedCompletionDate'] = k['QualityCheck PlannedCompletionDate'] ? this.addOneDay(new Date(k['QualityCheck PlannedCompletionDate'])) : null;

    obj['grnAssignedTo'] = grnAssignEmps;
    obj['grnStartDate'] = k['GRN StartDate'] ? this.addOneDay(new Date(k['GRN StartDate'])) : null;
    obj['grnEndDate'] = k['GRN EndDate'] ? this.addOneDay(new Date(k['GRN EndDate'])) : null;
    obj['grnPlannedCompletionDate'] = k['GRN PlannedCompletionDate'] ? this.addOneDay(new Date(k['GRN PlannedCompletionDate'])) : null;

    obj['salesOrderAssignedTo'] = salesAssignEmps;
    obj['salesOrderStartDate'] = k['Sales StartDate'] ? this.addOneDay(new Date(k['Sales StartDate'])) : null;
    obj['salesOrderEndDate'] = k['Sales EndDate'] ? this.addOneDay(new Date(k['Sales EndDate'])) : null;
    obj['salesOrderPlannedCompletionDate'] = k['Sales PlannedCompletionDate'] ? this.addOneDay(new Date(k['Sales PlannedCompletionDate'])) : null;

    obj['shipmentOrderAssignedTo'] = shipmentAssignEmps;
    obj['shipmentOrderStartDate'] = k['Shipment StartDate'] ? this.addOneDay(new Date(k['Shipment StartDate'])) : null;
    obj['shipmentOrderEndDate'] = k['Shipment EndDate'] ? this.addOneDay(new Date(k['Shipment EndDate'])) : null;
    obj['shipmentOrderPlannedCompletionDate'] = k['Shipment PlannedCompletionDate'] ? this.addOneDay(new Date(k['Shipment PlannedCompletionDate'])) : null;

    return obj;
  }
  mapId(name, key) {
    if (key == 'vehicle') {
      const vehicleDetals = this.vehicles.find(x => x.vehicleNumber == name);
      if (vehicleDetals) {
        return { _id: vehicleDetals._id, vehicleNumber: vehicleDetals.vehicleNumber }
      }
      else {
        return { _id: null, vehicleNumber: name }
      }
    }
    if (key == 'vehicleType') {
      const vehicleDetals = this.vehicles.find(x => x.vehicleNumber == name);
      return vehicleDetals ? vehicleDetals.vehicleType : null;
    }
    if (key == 'equipment') {
      const equipmentDetails = this.equipments.find(x => x.equipmentID == name);
      if (equipmentDetails) {
        return {
          equipmentMasterID: equipmentDetails._id, equipmentID: equipmentDetails.equipmentID,
          "equipmentName": equipmentDetails.equipmentName,
          "equipmentIDName": equipmentDetails.equipmentIDName,
          "equipmentType": equipmentDetails.equipmentType
        }
      }
      else {
        return {
          equipmentMasterID: null, equipmentID: name, "equipmentName": null,
          "equipmentIDName": null,
          "equipmentType": null
        }
      }
    }
    if (key == 'serviceInfo') {
      const spDetails = this.serviceProviders.find(x => x.serviceProviderIDName == name);
      if (spDetails) {
        return {
          serviceProviderMasterID: spDetails._id,
          serviceProviderID: spDetails.serviceProviderID,
          "serviceProviderName": spDetails.serviceProviderName,
          "serviceProviderIDName": spDetails.serviceProviderIDName
        }
      }
      else {
        return {
          serviceProviderMasterID: null,
          serviceProviderID: name,
          "serviceProviderName": null,
          "serviceProviderIDName": null,
        }
      }

    }
  }
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };
  dyanmicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement("a");
    }
    const element = this.setting.element.dynamicDownload;
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: `${this.noteType} GateEntry Error Reasons`,
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
    // if (this.missingParams) {
    //   this.dyanmicDownloadByHtmlTag({
    //     fileName: "Zone Error Reasons",
    //     text: this.failureRecords.toString().replace(/,/g, '\n')
    //   });
    // }
  }
  exportAsXLSX() {
    const changedZonesList = this.exportTypeMethod();
    this.excelService.exportAsExcelFile(changedZonesList, `${this.noteType} Gate Entry `, null);
  }
  exportTypeMethod() {
    const arr = [];
    if (this.noteType == 'Inward Shipment') {
      const obj = {};
      obj['Invoice Number'] = null;
      obj['wmpoNumberPrefix'] = null;
      obj['wmpoNumber'] = null;
      obj['Invoice Date'] = null;
      obj['Vehicle Number'] = null;
      obj['Vehicle Type'] = null;
      obj['Transporter'] = null;
      obj['Carrier Name'] = null;
      obj['Lr Number'] = null;
      obj['Invoice Quantity'] = null;
      obj['InvoiceQty UOM'] = null;
      obj['BillOf Entry Number'] = null;
      obj['BillOf Entry Date'] = null;
      obj['BillOf Landing Number'] = null;
      obj['BillOf Landing Date'] = null;
      obj['AssignedTo'] = null;
      obj['startDate'] = null;
      obj['endDate'] = null;
      obj['plannedCompletionDate'] = null;
      obj['QualityCheck AssignedTo'] = null;
      obj['QualityCheck StartDate'] = null;
      obj['QualityCheck EndDate'] = null;
      obj['QualityCheck PlannedCompletionDate'] = null;
      obj['GRN AssignedTo'] = null;
      obj['GRN StartDate'] = null;
      obj['GRN EndDate'] = null;
      obj['GRN PlannedCompletionDate'] = null;
      arr.push(obj);
    }
    else if (this.noteType == 'Outward Shipment') {
      const obj = {};
      obj['Invoice Number'] = null;
      obj['wmsoNumberPrefix'] = null;
      obj['wmsoNumber'] = null;
      obj['Invoice Date'] = null;
      obj['Vehicle Number'] = null;
      obj['Vehicle Type'] = null;
      obj['Transporter'] = null;
      obj['Carrier Name'] = null;
      obj['WayBill Number'] = null;
      obj['Invoice Quantity'] = null;
      obj['InvoiceQty UOM'] = null;
      obj['AssignedTo'] = null;
      obj['startDate'] = null;
      obj['endDate'] = null;
      obj['plannedCompletionDate'] = null;
      obj['Sales AssignedTo'] = null;
      obj['Sales StartDate'] = null;
      obj['Sales EndDate'] = null;
      obj['Sales PlannedCompletionDate'] = null;
      obj['QualityCheck AssignedTo'] = null;
      obj['QualityCheck StartDate'] = null;
      obj['QualityCheck EndDate'] = null;
      obj['QualityCheck PlannedCompletionDate'] = null;
      obj['Shipment AssignedTo'] = null;
      obj['Shipment StartDate'] = null;
      obj['Shipment EndDate'] = null;
      obj['Shipment PlannedCompletionDate'] = null;
      arr.push(obj);
    }
    return arr;;
  }
  fetchAllVehicles() {
    this.commonMasterDataService.fetchAllVehicles(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.vehicleMasters) {
          this.vehicles = response.data.vehicleMasters;
        } else {
          this.vehicles = [];
        }
      },
      (error) => {
        this.vehicles = [];
      });
  }
  fetchAllEquipments() {
    this.commonMasterDataService.fetchAllEquipments(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.equipmentMaster) {
          this.equipments = response.data.equipmentMaster;
        } else {
          this.equipments = [];
        }
      },
      (error) => {
        this.equipments = [];
      });
  }
  fetchAllServiceProvider() {
    this.wmsService.fetchAllServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.serviceProviders) {
        this.serviceProviders = response.data.serviceProviders;
      } else {
        this.serviceProviders = [];
      }
    }, error => {
      this.serviceProviders = [];
    });
  }
}
