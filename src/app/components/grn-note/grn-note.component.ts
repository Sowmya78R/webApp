import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import * as FileSaver from 'file-saver';
import { Storage } from '../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { PaginationConstants, gateEntryForInboundHead } from 'src/app/constants/paginationConstants';

@Component({
  selector: 'app-grn-note',
  templateUrl: './grn-note.component.html',
  styleUrls: ['./grn-note.component.scss']
})

export class GrnNoteComponent implements OnInit, OnDestroy, AfterViewInit {
  dtOptions: DataTables.Settings = {};
  GRNoteForm: FormGroup;
  focusedElement: any;
  suppliers: any = [];
  dtTrigger: Subject<any> = new Subject();
  advanceShipments: any = [];
  id: any = [];
  advanceShipmentInfo: any;
  supplierIDNames: CompleterData;
  supplierIDName: any;
  advanceShipmentKeys: any = ['S.No', 'Gate Entry ID', 'Order Number', 'Gate Entry Date/Time', 'Gate Exit Date/Time', 'Invoice Number',
    'Invoice Date', 'Transpoter', 'Carrier Name', 'LR Number', 'State Tax Type', 'Number Of Boxes',
    'Invoice Total Quantity', 'Empty Vehicle Weight', 'Status', 'Action'];
  @ViewChild(DataTableDirective)

  dtElement: DataTableDirective;
  noteType: any = 'Inward Shipment';
  form38ImagesArray = [];
  invoiceImagesArray: any = [];
  lrImagesArray: any = [];
  vehicles: any = [];
  equipments: any = [];
  serviceProviders: any = [];
  containerIDS: CompleterData;
  vehicleIDs: CompleterData;
  dummyContainer: any = null;
  dummyVehicle: any = null;
  spDummyID: any = null;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', "Goods Receiving Note", Storage.getSessionUser());
  noteData: any = [];
  deleteInfo: any;
  allFiles: any = [];
  units: any = [];
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };
  wareHouseTeamsListIDs: CompleterData;
  qualityCheckIDs: CompleterData;
  grnCheckIds: CompleterData;
  salesCheckIDs: CompleterData;
  shipmentCheckIDs: CompleterData;
  spIDs: CompleterData;
  shipmentOrders: any = [];
  wmsoNumbers: CompleterData;
  selectedEmp: any = null;
  selectedEmpforQualityCheck: any = null;
  selectedEmpforGRN: any = null;
  selectedEmpforSales: any = null;
  selectedEmpforShipment: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  statusDropdown: any = ['Created', 'GATE IN', 'GATE OUT'];
  statuses: any = ['Created', 'Gate In'];
  clickEventsubscription: Subscription;


  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<any>;


  constructor(private metaDataService: MetaDataService, private wmsService: WMSService, private configService: ConfigurationService,
    private toastr: ToastrService, private commonMasterDataService: CommonMasterDataService, private datePipe: DatePipe,
    private excelService: ExcelService, private outboundProcessService: OutboundProcessService,
    public ngxSmartModalService: NgxSmartModalService,
    private customValidators: CustomValidators,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    this.clickEventsubscription = this.configService.getClickEvent().subscribe(() => {
      this.getAll(1, 10);
    })
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
    this.getAllFunctions();
  }
  getAllFunctions() {
    console.log(this.permissionsList);
    this.permissionsList.includes('View')
    {
      this.createAdvanceShipmentForm();
      this.fetchAllVehicles();
      this.fetchAllEquipments();
      this.fetchAllServiceProvider();
      this.fetchAllShipmentOrders();
      this.findAllUnits();
      this.fetchAllExecutionIDName('Unloading');
      this.getAll(this.page, this.itemsPerPage, this.statuses);
      this.getEnableDisableFunction();
    }
    const value = 'created';
    const checked = false;


    this.onCheckBoxClick(checked, value);
  }
  makeThisDisabled: boolean = false;
  getEnableDisableFunction() {

    if (this.permissionsList.includes("View") && this.permissionsList.includes('Update')) {
      this.makeThisDisabled = false
    }
    else if (this.permissionsList.includes("View")) {
      this.makeThisDisabled = true
    }
  }


  onWMSONoChange(event) {
    if (event) {
      const filteredOne = this.shipmentOrders.find(x => x.wmsoNumber == event.originalObject)
      if (filteredOne) {
        this.GRNoteForm.controls.invoiceNumber.patchValue(filteredOne.invoiceNumber);
        if (filteredOne.equipmentInfo) {
          this.GRNoteForm.controls.carrierName.patchValue(filteredOne.equipmentInfo.equipmentID);
        }
        if (filteredOne.serviceProviderInfo) {
          this.GRNoteForm.controls.serviceProviderIDName.patchValue(filteredOne.serviceProviderInfo.serviceProviderIDName);
        }
        if (filteredOne.vehicleInfo) {
          this.GRNoteForm.controls.vehicleNumber.patchValue(filteredOne.vehicleInfo.vehicleNumber);
        }
        this.GRNoteForm.controls.vehicleType.patchValue(filteredOne.vehicleType);
        if (filteredOne.invoiceDate) {
          this.GRNoteForm.controls.invoiceDate.patchValue(this.datePipe.transform(filteredOne.invoiceDate, 'yyyy-MM-dd'));
        }
        this.GRNoteForm.controls.lrNumber.patchValue(filteredOne.lrNumber);
        // modeofTransport
      }
    }
  }
  setTo(event) {
    if (event) {
      this.GRNoteForm.controls.assignedTo.setValue(this.selectedEmp);
      this.GRNoteForm.controls.qualityCheckAssignedTo.setValue(this.selectedEmpforQualityCheck);
      this.GRNoteForm.controls.grnAssignedTo.setValue(this.selectedEmpforGRN);
      this.GRNoteForm.controls.salesOrderAssignedTo.setValue(this.selectedEmpforSales);
      this.GRNoteForm.controls.shipmentOrderAssignedTo.setValue(this.selectedEmpforShipment);
    }
  }
  // noteData: any[] = []; // Assuming this is your data array
  reqObj = {
    status: 'Sales' // Default status or initial value
  };
  statusOptions = [
    { label: 'UnLoading', value: 'UnLoading', color: 'grey' },
    { label: 'Quality Check', value: 'Quality Check', color: 'ourCommonColor' },
    { label: 'GRN', value: 'GRN', color: 'darkcyan' }
    // Add more status options as needed
  ];
  scrollRight(value, type): void {
    switch (value) {
      case 'Loading': {
        document.getElementById('My_Loadingtd').scrollIntoView();
        window.scrollTo(0, 500);
        break;
      }
      case 'Quality Check': {
        if (type == 'outward') {
          document.getElementById('My_qctd').scrollIntoView();
          window.scrollTo(0, 500);
        }
        else {
          document.getElementById('My_qcInwardtd').scrollIntoView();
          window.scrollTo(0, 500);
        }
        break;
      }
      case 'Sales': {
        document.getElementById('My_td').scrollIntoView();
        window.scrollTo(0, 500);
        break;
      }
      case 'Shipment': {
        document.getElementById('My_Shipmenttd').scrollIntoView();
        window.scrollTo(0, 500);
        break;
      }
      case 'UnLoading': {
        document.getElementById('My_Unloadingtd').scrollIntoView();
        window.scrollTo(0, 500);
        break;
      }
      case 'GRN': {
        document.getElementById('My_GRNtd').scrollIntoView();
        window.scrollTo(0, 500);
        break;
      }
    }

  }

  showLrNumber = true
  showWayBillNumber = false
  showLoading = false
  showAssignedTo = true
  changeNoteType(type, noteValue) {
    if (type === 'Unloading') {
      this.showLrNumber = true
      this.showAssignedTo = true
      this.showWayBillNumber = false
      this.showLoading = false
    }
    else if (type === 'Loading') {
      this.showLrNumber = false
      this.showAssignedTo = false
      this.showWayBillNumber = true
      this.showLoading = true
    }
    else {

    }

    this.createAdvanceShipmentForm();
    this.noteType = noteValue;
    this.selectedEmp = null;
    this.selectedEmpforGRN = null;
    this.selectedEmpforQualityCheck = null;
    this.selectedEmpforSales = null;
    this.selectedEmpforShipment = null;
    this.fetchAllExecutionIDName(type);
    this.getAll();
  }
  fetchAllExecutionIDName(type) {
    const dummyForm = JSON.parse(JSON.stringify(this.formObj));
    // dummyForm['workType'] = type;
    this.commonMasterDataService.fetchAllExecutionIDName(dummyForm).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          const wareHouseTeamsList = response.data.wareHouseTeams.filter(x => x.workTypes.includes(type));
          this.wareHouseTeamsListIDs = wareHouseTeamsList.map(x => x.executiveIDName);
          const ware1 = response.data.wareHouseTeams.filter(x => x.workTypes.includes('Quality Check'));
          this.qualityCheckIDs = ware1.map(x => x.executiveIDName);
          const ware2 = response.data.wareHouseTeams.filter(x => x.workTypes.includes('GRN'));
          this.grnCheckIds = ware2.map(x => x.executiveIDName);
          const ware3 = response.data.wareHouseTeams.filter(x => x.workTypes.includes('Sales'));
          this.salesCheckIDs = ware3.map(x => x.executiveIDName);
          const ware4 = response.data.wareHouseTeams.filter(x => x.workTypes.includes('Shipment'));
          this.shipmentCheckIDs = ware4.map(x => x.executiveIDName);
        }
      })
  }
  findAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.units) {
        this.units = response.data.units;
      }
    },
      (error: any) => {

      });
  }
  fetchAllShipmentOrders() {
    // this.outboundProcessService.fetchAllShipmentOrders(JSON.stringify(this.formObj)).subscribe(
    //   (response) => {
    //     if (response && response.status === 0 && response.data.shipmentOrders) {
    //       this.shipmentOrders = response.data.shipmentOrders.filter(order => order.status === 'Open');
    //       this.wmsoNumbers = this.shipmentOrders.map(x => x.wmsoNumber);
    //     }
    //   },
    //   (error) => {
    // });
  }
  fetchAllServiceProvider() {
    this.wmsService.fetchAllServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.serviceProviders) {
        this.serviceProviders = response.data.serviceProviders;
        this.spIDs = response.data.serviceProviders.map(x => x.serviceProviderIDName);
      } else {
        this.serviceProviders = [];
      }
    }, error => {
      this.serviceProviders = [];
    });
  }
  createAdvanceShipmentForm() {
    this.GRNoteForm = new FormBuilder().group({
      "_id": null,
      "noteType": this.noteType,
      "wmpoNumber": null,
      "wmpoNumberPrefix": null,
      "fullWmpoNumber": null,
      "wmsoNumber": null,
      "wmsoNumberPrefix": null,
      "fullWmsoNumber": null,
      "referencePONumber": null,
      "poReferenceA": null,
      "poReferenceB": null,
      "invoiceNumber": [null, this.customValidators.required],
      "waybillNumber": null,
      "lrNumber": null,
      "invoiceDate": [null, this.customValidators.required],
      "vehicleType": null,
      "vehicleNumber": null,
      "carrierName": null,
      "gateInDate": null,
      "gateOutDate": null,
      "invoiceFiles": null,
      "formFiles": null,
      "lrFiles": null,
      "wareHouseInfo": this.configService.getWarehouse(),
      "organizationInfo": this.configService.getOrganization(),
      "assignedTo": null,
      "assignedBy": null,
      "createdBy": null,
      "createdDate": null,
      "completedBy": null,
      "completedDate": null,
      "plannedCompletionDate": null,
      "assignedDate": null,
      "status": null,
      "startDate": null,
      "endDate": null,
      "stateTaxType": null,
      "emptyVehicleWeight": null,
      "supplierMasterInfo": null,
      "customerMasterInfo": null,
      "quantityNumber": null,
      "quantityNumberUom": null,
      "serviceProviderIDName": null,
      "invoiceTotalQuantity": [null, this.customValidators.required],
      "invoiceTotalQuantityUom": [null, this.customValidators.required],
      "emptyVehicleWeightUom": null,
      "wareHouseTransferSourceInfo": null,
      "wareHouseTransferDestinationInfo": null,
      grnAssignedBy
        :
        null,
      grnAssignedDate
        :
        null,
      grnAssignedTo
        :
        null,
      grnCompletedBy
        :
        null,
      grnCompletedDate
        :
        null,
      grnCreatedBy
        :
        null,
      grnCreatedDate
        :
        null,
      grnEndDate
        :
        null,
      grnPlannedCompletionDate
        :
        null,
      grnStartDate
        :
        null,
      qualityCheckAssignedBy
        :
        null,
      qualityCheckAssignedDate
        :
        null,
      qualityCheckAssignedTo
        :
        null,
      qualityCheckCompletedBy
        :
        null,
      qualityCheckCompletedDate
        :
        null,
      qualityCheckCreatedBy
        :
        null,
      qualityCheckCreatedDate
        :
        null,
      qualityCheckEndDate
        :
        null,
      qualityCheckPlannedCompletionDate
        :
        null,
      qualityCheckStartDate
        :
        null,
      salesOrderAssignedBy
        :
        null,
      salesOrderAssignedDate
        :
        null,
      salesOrderAssignedTo
        :
        null,
      salesOrderCompletedBy
        :
        null,
      salesOrderCompletedDate
        :
        null,
      salesOrderCreatedBy
        :
        null,
      salesOrderCreatedDate
        :
        null,
      salesOrderEndDate
        :
        null,
      salesOrderPlannedCompletionDate
        :
        null,
      salesOrderStartDate
        :
        null,
      shipmentOrderAssignedBy
        :
        null,
      shipmentOrderAssignedDate
        :
        null,
      shipmentOrderAssignedTo
        :
        null,
      shipmentOrderCompletedBy
        :
        null,
      shipmentOrderCompletedDate
        :
        null,
      shipmentOrderCreatedBy
        :
        null,
      shipmentOrderCreatedDate
        :
        null,
      shipmentOrderEndDate
        :
        null,
      shipmentOrderPlannedCompletionDate
        :
        null,
      shipmentOrderStartDate
        :
        null,
      billOfEntryNumber: null,
      billOfEntryDate: null,
      billOfEntryNumberDate: null,
      billOfLandingNumber: null,
      billOfLandingDate: null,
      billOfLandingNumberDate: null
    });
  }
  getConcatDateNumber(key) {
    const formLine = this.GRNoteForm.value;
    if (key == 'Entry' && formLine.billOfEntryNumber && formLine.billOfEntryDate) {
      this.GRNoteForm.controls.billOfEntryNumberDate.setValue(formLine.billOfEntryNumber + ':' + formLine.billOfEntryDate);
    }
    if (key == 'Landing' && formLine.billOfLandingNumber && formLine.billOfLandingDate) {
      this.GRNoteForm.controls.billOfLandingNumberDate.setValue(formLine.billOfLandingNumber + ':' + formLine.billOfLandingDate);
    }
  }
  fetchAllVehicles() {
    this.commonMasterDataService.fetchAllVehicles(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.vehicleMasters) {
          this.vehicles = response.data.vehicleMasters;
          this.vehicleIDs = response.data.vehicleMasters.map(x => x.vehicleNumber);
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
          this.containerIDS = response.data.equipmentMaster.map(x => x.equipmentID);
        } else {
          this.equipments = [];
        }
      },
      (error) => {
        this.equipments = [];
      });
  }
  setSearchValueToText(event, keyName) {
    if (event) {
      this.GRNoteForm.controls[keyName].setValue(event.originalObject);
      const fined = this.vehicles.find(x => x.vehicleNumber == event.originalObject);
      if (fined != null && fined != undefined) {
        this.GRNoteForm.controls.vehicleType.setValue(fined.vehicleType);
      }
      this.dummyVehicle = null;
      this.dummyContainer = null;
      this.spDummyID = null;
    }
  }
  setVehicleType() {
    const fined = this.vehicles.find(x => x.vehicleNumber == this.GRNoteForm.controls.vehicleNumber.value);
    if (fined) {
      this.GRNoteForm.controls.vehicleType.setValue(fined.vehicleType);
    }
    else {
      this.GRNoteForm.controls.vehicleType.setValue(null);
    }
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  uploadMultipleFiles(event, arrayName) {
    if (this.permissionsList.includes('Update')) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.metaDataService.uploadImage(event.target.files[i]).subscribe(res => {
          this[arrayName].push(res['data']['fileName']);
        });
      }
    }
    else {
      this.toastr.error("User doesn't have permission");
    }
  }

  deleteImageMethod(fileName, i?, arrayName?) {
    this.metaDataService.deleteImage(fileName).subscribe(res => {
      if (res['status'] == 0) {
        (i && i == 0) ? this[arrayName] = [] : (arrayName ? this[arrayName].splice(i, 1) : '');
      }
    })
  }
  // downloadFile(file) {
  //   this.metaDataService.viewImages(file).subscribe((res: any) => {
  //     if (res['status'] == 0) {
  //       this.excelService.downloadGlobalFiles(res.resource, file);
  //     }
  //   })
  // }
  downloadFile(pdfName: string) {
    let pdfUrl = '';
    const fileNames = JSON.parse(JSON.stringify(pdfName));
    this.metaDataService.viewImages(fileNames).subscribe(res => {
      pdfUrl = 'data:text/plain;base64,' + res.data.resource;
      FileSaver.saveAs(this.excelService.dataURLtoFile(pdfUrl, fileNames), pdfName);
    });
  }
  mapId(key, name) {
    if (key == 'vehicle') {
      const vehicleDetals = this.vehicles.find(x => x.vehicleNumber == name);
      if (vehicleDetals) {
        return { _id: vehicleDetals._id, vehicleNumber: vehicleDetals.vehicleNumber }
      }
      else {
        return { _id: null, vehicleNumber: name }
      }
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
          serviceProviderID: null,
          "serviceProviderName": null,
          "serviceProviderIDName": name,
        }
      }

    }
  }
  onStatusChange(product, key?, variable?) {
    let a = 'startDate';
    let b = 'endDate';
    let c = 'plannedCompletionDate';
    if (variable == 'Quality Check') {
      a = 'qualityCheckStartDate';
      b = 'qualityCheckEndDate';
      c = 'qualityCheckPlannedCompletionDate';
    }
    else if (variable == 'GRN') {
      a = 'grnStartDate';
      b = 'grnEndDate';
      c = 'grnPlannedCompletionDate';
    }
    else if (variable == 'Sales') {
      a = 'salesOrderStartDate';
      b = 'salesOrderEndDate';
      c = 'salesOrderPlannedCompletionDate';
    }
    else if (variable == 'Shipment') {
      a = 'shipmentOrderStartDate';
      b = 'shipmentOrderEndDate';
      c = 'shipmentOrderPlannedCompletionDate';
    }
    if (this.permissionsList.includes('Update')) {
      if (key) {
        product[a] = (key == 'eDate') ? product[a] : new Date();
        product[b] = (key == 'eDate') ? new Date() : null;
      }
      product[c] = product[c] ? new Date(product[c]) : null;
      this.save(product, variable);
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
  }

  save(key?, plan?, statusGate?) {
    if (((this.permissionsList.includes("Update")) && this.globalID) || (this.permissionsList.includes("Create") && !this.globalID)) {
      const form = key ? key : this.GRNoteForm.value;
      if (form.plannedCompletionDate) {
        form["plannedCompletionDate"] = new Date(form.plannedCompletionDate);
      }
      if (form.qualityCheckPlannedCompletionDate) {
        form["qualityCheckPlannedCompletionDate"] = new Date(form.qualityCheckPlannedCompletionDate);
      }
      if (form.grnPlannedCompletionDate) {
        form["grnPlannedCompletionDate"] = new Date(form.grnPlannedCompletionDate);
      }
      if (form.salesOrderPlannedCompletionDate) {
        form["salesOrderPlannedCompletionDate"] = new Date(form.salesOrderPlannedCompletionDate);
      }
      if (form.shipmentOrderPlannedCompletionDate) {
        form["shipmentOrderPlannedCompletionDate"] = new Date(form.shipmentOrderPlannedCompletionDate);
      }
      if (!key) {
        form.noteType = this.noteType;
        form.vehicleInfo = this.mapId('vehicle', form.vehicleNumber);
        delete form.vehicleNumber;
        form.equipmentInfo = this.mapId('equipment', form.carrierName);
        delete form.carrierName;
        form.serviceProviderInfo = this.mapId('serviceInfo', form.serviceProviderIDName);
        delete form.serviceProviderIDName;
        form.lrFiles = this.lrImagesArray;
        form.invoiceFiles = this.invoiceImagesArray;
        form.formFiles = this.form38ImagesArray;
      }
      // form.gateInDate = form.gateInDate ? form.gateInDate : new Date();
      // form.gateOutDate = (key && !plan) ? new Date() : null;
      form.gateInDate = form.gateInDate ? form.gateInDate : ((statusGate == 'gateIn') ? new Date() : null);
      form.gateOutDate = form.gateOutDate ? form.gateOutDate : ((statusGate == 'gateOut') ? new Date() : null);
      this.commonMasterDataService.saveorUpdateGRNote(form).subscribe(res => {
        if (res['status'] == 0 && res['data']['goodsReceiptNote']) {
          (form._id) ? this.toastr.success("Updated Successfully") : this.toastr.success("Saved Successfully");
          /*  this.getAll(plan,); */
          this.getAll(this.page, this.itemsPerPage, this.statuses);
          this.clear();
        }
      })
    }
    else {
      this.toastr.error("user doesn't have permission");
    }
    this.globalID = null
  }
  clear() {
    if (!this.GRNoteForm.controls._id.value) {
      const arr = this.lrImagesArray.concat(this.invoiceImagesArray, this.form38ImagesArray);
      if (arr.length > 0) {
        arr.forEach(element => {
          this.deleteImageMethod(element);
        });
      }
    }
    this.createAdvanceShipmentForm();
    this.lrImagesArray = [];
    this.invoiceImagesArray = [];
    this.form38ImagesArray = [];
    this.selectedEmp = null;
    this.selectedEmpforGRN = null;
    this.selectedEmpforQualityCheck = null;
    this.selectedEmpforSales = null;
    this.selectedEmpforShipment = null;
    this.makeThisDisabled = false;
  }


  fetchAllDFirst(first, event) {
    if (first) {
      this.getAll(first, event.target.value, this.statuses);
    }
  }

  page: number = 1;
  itemsPerPage = 10;
  totalItems: any;
  searchKey: any = null;
  sortDirection: any = 'DESC';
  sortFields: any = null;

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  tableHeadings: any = ['S.No', 'Invoice Number', 'Gate In D&T', 'Gate Out D&T', 'Order ID', 'Supplier/Customer/Warehouse IDName',
    'Invoice Date', 'Vehicle Number', 'Vehicle Type', 'Transporter', 'LR Number', 'Invoice Qty', 'Assigned To', 'Assigned By', 'Start Time',
    'End Time', 'Completed By', 'Planned Completion Date', 'Sales Status', 'Assigned To', 'Assigned By', 'Start Time', 'End Time',
    'Completed By', 'Planned Completion Date', 'Quality Check Status', 'Assigned To', 'Assigned By', 'Start Time', 'End Time', 'Completed By'
    , 'Planned Completion Date', 'Loading Status', 'Assigned To', 'Assigned By', 'Start Time', 'End Time', 'Completed By', 'Shipment Status'
    , 'Status', 'Action'];

  tableHeadingsForGateOut: any = ['S.No', 'Invoice Number', 'Gate In D&T', 'Gate Out D&T', 'Order ID'
    , 'Supplier/Customer/Warehouse IDName', 'Invoice Date', 'Vehicle Number', 'Vehicle Type', 'Transporter', 'Carrier Name', 'LR Number', 'Invoice Qty', 'Assigned To', 'Assigned By'
    , 'Start Time', 'End Time', 'Completed By', 'Planned Completion Date', 'Unloading Status', 'Assigned To', 'Assigned By', 'Start Time', 'End Time',
    'Completed By', 'Planned Completion Date', 'Quality Check Status', 'Assigned To', 'Assigned By', 'Start Time', 'End Time', 'Completed By'
    , 'Planned Completion Date', 'GRN Status', 'Status', 'Action'];

  setDirection(type, headerName) {
    this.sortDirection = type;
    let arr: any = gateEntryForInboundHead['gateEntrySortFieldsArrays'].filter(x => x.key == headerName);
    if (arr.length > 1) {
      this.sortFields = arr.map(x => x.name);
    }
    else {
      this.sortFields = [arr[0].name];
    }
    this.getAll(this.page, this.itemsPerPage, this.statuses);
  }


  key: any;
  onCheckBoxClick(checked: boolean, value: string) {
    console.log(checked);
    console.log(value);
    if (checked) {
      this.statuses.push(value);
    } else {
      if (this.statuses) {
        this.statuses = this.statuses.filter(item => item !== value);
      }
    }
    this.getAll(this.page, this.key, this.statuses.length > 0 ? this.statuses : null);
  }

  getAll(page?: number, key?: any, statuses?: string[]) {
    const form = {
      "transactionType": null,
      "orderID": null,
      "transactionDateTimeFrom": null,
      "transactionDateTimeTo": null,
      "page": page ? page : 1,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": PaginationConstants.goodsReceiptInBoundScreen,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      'noteType': this.noteType,
      // 'statuses': statuses && statuses.length > 0 ? statuses : null,
      statuses: null,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
    };


    this.commonMasterDataService.fetchAllGRNote(form).subscribe(res => {
      if (res['status'] == 0 && res['data']['goodsReceiptNotePaginationResponse']['goodsReceiptNotes']) {
        this.noteData = res['data']['goodsReceiptNotePaginationResponse']['goodsReceiptNotes']
        this.noteData.forEach(ele => {
          ele.plannedCompletionDate = ele.plannedCompletionDate ? this.datePipe.transform(new Date(ele.plannedCompletionDate), 'yyyy-MM-dd HH:mm') : null;
          ele.qualityCheckPlannedCompletionDate = ele.qualityCheckPlannedCompletionDate ? this.datePipe.transform(new Date(ele.qualityCheckPlannedCompletionDate), 'yyyy-MM-dd HH:mm') : null;
          ele.grnPlannedCompletionDate = ele.grnPlannedCompletionDate ? this.datePipe.transform(new Date(ele.grnPlannedCompletionDate), 'yyyy-MM-dd HH:mm') : null;
          ele.salesOrderPlannedCompletionDate = ele.salesOrderPlannedCompletionDate ? this.datePipe.transform(new Date(ele.salesOrderPlannedCompletionDate), 'yyyy-MM-dd HH:mm') : null;
          ele.shipmentOrderPlannedCompletionDate = ele.shipmentOrderPlannedCompletionDate ? this.datePipe.transform(new Date(ele.shipmentOrderPlannedCompletionDate), 'yyyy-MM-dd HH:mm') : null;
        });
        this.totalItems = res.data.goodsReceiptNotePaginationResponse.totalElements;
        console.log(this.totalItems);
        //   this.rerender();
        setTimeout(() => {
          let value = this.noteType;
          if (this.noteType == 'Outward Shipment') {
            value = 'Outward';
          }


          this.scrollRight(key, value);
        }, 500);
      }
      else {
        this.noteData = [];
      }
    })
  }
  globalID: any;
  edit(data) {
    console.log(data);
    this.globalID = data._id
    window.scroll(0, 0);
    this.noteType = data.noteType;
    if (data.lrFiles && data.lrFiles.length > 0) {
      this.lrImagesArray = data.lrFiles;
    }
    if (data.invoiceFiles && data.invoiceFiles.length > 0) {
      this.invoiceImagesArray = data.invoiceFiles;
    }
    if (data.formFiles && data.formFiles.length > 0) {
      this.form38ImagesArray = data.formFiles;
    }
    this.GRNoteForm.patchValue(data);
    if (data.invoiceDate) {
      this.GRNoteForm.controls.invoiceDate.patchValue(this.datePipe.transform(data.invoiceDate, 'yyyy-MM-dd'));
    }
    if (data.billOfLandingDate) {
      this.GRNoteForm.controls.billOfLandingDate.patchValue(this.datePipe.transform(data.billOfLandingDate, 'yyyy-MM-dd'));
    }
    if (data.billOfEntryDate) {
      this.GRNoteForm.controls.billOfEntryDate.patchValue(this.datePipe.transform(data.billOfEntryDate, 'yyyy-MM-dd'));
    }
    if (data.vehicleInfo) {
      this.GRNoteForm.controls.vehicleNumber.patchValue(data.vehicleInfo.vehicleNumber);
    }
    if (data.equipmentInfo) {
      this.GRNoteForm.controls.carrierName.patchValue(data.equipmentInfo.equipmentID);
    }
    if (data.serviceProviderInfo) {
      this.GRNoteForm.controls.serviceProviderIDName.patchValue(data.serviceProviderInfo.serviceProviderIDName);
    }

    if (data.assignedTo && data.assignedTo.length > 0) {
      this.selectedEmp = data.assignedTo
    }
    if (data.qualityCheckAssignedTo && data.qualityCheckAssignedTo.length > 0) {
      this.selectedEmpforQualityCheck = data.qualityCheckAssignedTo
    }
    if (data.grnAssignedTo && data.grnAssignedTo.length > 0) {
      this.selectedEmpforGRN = data.grnAssignedTo
    }
    if (data.salesOrderAssignedTo && data.salesOrderAssignedTo.length > 0) {
      this.selectedEmpforSales = data.salesOrderAssignedTo
    }
    if (data.shipmentOrderAssignedTo && data.shipmentOrderAssignedTo.length > 0) {
      this.selectedEmpforShipment = data.shipmentOrderAssignedTo
    }
    this.makeThisDisabled = (data.endDate || data.gateOutDate) ? true : false;

    this.getEntryDetails = Object.assign({}, data);

  }
  getEntryDetails: any;
  getConfirmation(status) {
    if (status === 'Yes') {
      this.getAll(this.page, this.itemsPerPage, this.statuses);
      if (this.allFiles.length > 0) {
        this.allFiles.forEach(element => {
          this.deleteImageMethod(element);
        });
      }
    }
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      if (!data.gateOutDate && !data.startDate) {
        this.deleteInfo = { name: 'grNote', id: data._id };
        this.allFiles = [];
        this.allFiles.push(...data.lrFiles, ...data.invoiceFiles, ...data.formFiles);
        this.ngxSmartModalService.getModal('deletePopup').open();
      }
      else {
        this.toastr.error("No Scope for Delete");
      }
    }
    else {
      this.toastr.error("User doesn't have permission ")
    }
  }
}
