import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CompleterService, CompleterData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { WmsCommonService } from 'src/app/services/wms-common.service';
import { Storage } from '../../../shared/utils/storage';
import { CommonService } from 'src/app/shared/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';

@Component({
  selector: 'app-inward',
  templateUrl: './inward.component.html',
  styleUrls: ['./inward.component.scss']
})
export class InwardComponent implements OnInit {

  @ViewChild("grRemote")
  public instance: ComboBoxComponent;
  @ViewChild('grRemote')
  @ViewChild("inwardRemote")
  public inputSize: number = 10;
  public dropdownObj1: ComboBoxComponent;
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Inward Checklist', Storage.getSessionUser());
  @Output() emitTripSheet: any = new EventEmitter<any>();
  inwardForm: FormGroup;
  inwardCheckList: any = [];
  productHeaderData: any;
  supplierList: any;
  filteredPOObj: any;
  language = this.configService.language;
  disablePrintBtn=false;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  //supplierMasterInfo: { supplierMasterID: any; supplierID: any; supplierIDName: any; supplierName: any; };
  constructor(private wmsService: WMSService, private configService: ConfigurationService, private datepipe: DatePipe,
    private commonMasterData: CommonMasterDataService, private wmsCommonService: WmsCommonService, private toastr: ToastrService,
    private completerService: CompleterService, private commonService: CommonService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  zoneNameValues: CompleterData;
  formObj = this.configService.getGlobalpayload();
  isInputDisabled: boolean;
  orderType: any = "Purchase Order";
  orderTypeDropdown = ['Purchase Order', 'Sales Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns'];
  dummyInv: any = null;
  page = 1;

  public array = new Array(100).fill(null);
  public data = this.array.map((v, i) => ({ text: i, id: i }));

  // bind the Query instance to query property
  public query: Query = new Query().take(10);
  public fields: Object = {
    text: 'text', value: 'id', itemCreated: (e: any) => {
      highlightSearch(e.item, (this as any).queryString, true, 'Contains');
    }
  };
  // public fields: Object = { text: 'text', value: 'id' };
  paginationStop: boolean = false;

  ngOnInit() {
    this.getCalls()
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }

  getCalls() {
    this.createForm();
    this.fetchAllInvoiceNumber();
    this.fetchAllPurchaseOrders();
    this.fetchAllServiceProvider()
    this.fetchAllEquipments();
    this.fetchAllVehicles();
    this.isInputDisabled = true;
    this.makeDisableTheFomOnViewOnly();
  }

  ngAfterViewInit(): void {
    this.onCreated();
  }
 
  onCreated(): void {
    let inputElement: HTMLInputElement;
    if (this.instance === undefined) {
      inputElement.size = this.inputSize;
    } else {
      console.log(this.instance);
      inputElement = this.instance.element.firstElementChild.children[1] as HTMLInputElement;
      inputElement.addEventListener("keydown", (args) => {
        // Your keydown logic here
      });
      if (inputElement.value.length && inputElement.value.length > this.inputSize) {   
        inputElement.size = inputElement.value.length;
        console.log(inputElement.size);
        console.log(inputElement.value.length);
      } else {
        inputElement.size = this.inputSize;
      }
    }
  }
  makeDisableTheFomOnViewOnly() {
    if (this.permissionsList.includes('View') && this.permissionsList.includes('Update')) {
      this.inwardForm.enable();
    }
    else if (this.permissionsList.includes('View')) {
      this.inwardForm.disable();
    }
  }
  onFiltering(e, key) {
    let query: Query = new Query();
    query = (e.text !== '') ? query.where('text', 'contains', e.text, true) : query;
    e.updateData(this[key], query);
  }
  onOpen1(args, key) {
    if (!this.paginationStop) {
      let start: number = 10;
      let end: number = 20;
      let listElement: HTMLElement = (this[key] as any).list;
      listElement.addEventListener('scroll', () => {
        if (
          listElement.scrollTop + listElement.offsetHeight + 1 >=
          listElement.scrollHeight
        ) {
          let filterQuery = new Query();
          if (!this.paginationStop) {
            this.page += 1;
            const form = {
              noteType: 'Inward Shipment',
              "page": this.page,
              "pageSize": 10,
              "organizationIDName": this.formObj.organizationIDName,
              "wareHouseIDName": this.formObj.wareHouseIDName,
            }
            this.commonMasterData.fetchAllGRNote(form).subscribe(res => {
              if (res['status'] == 0 && res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes']) {
                // this.grnotesData = res['data'].goodsReceiptNotePaginationResponse['goodsReceiptNotes'].filter(x => !x.wmpoNumber);
                // this.fetchInvoiceDataIds = this.grnotesData.map(x => x.invoiceNumber);
                this.fetchInvoiceNumber = [...this.fetchInvoiceNumber, ...res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes];
                this.paginationStop = res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes.length == 0 ? true : false;
                if (!this.paginationStop) {
                  const arr = res.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes;
                  // if (arr && arr.length > 0) {
                  if (this.fetchInvoiceDataIds.length > 0) {
                    let index = this.fetchInvoiceDataIds.length;
                    arr.forEach((v, i) => {
                      i = index;
                      if (!this.fetchInvoiceDataIds.find(x => x.text == v.invoiceNumber)) {
                        this.fetchInvoiceDataIds.push({ text: v.invoiceNumber, id: i });
                        index += 1;
                      }
                    });
                  }
                  else {
                    this.fetchInvoiceDataIds = arr.map((v, i) => ({ text: v.invoiceNumber, id: i }));
                  }
                  new DataManager(this.fetchInvoiceDataIds)
                    .executeQuery(filterQuery.range(start, end))
                    .then((event: any) => {
                      start = end;
                      end += 10;
                      this[key].addItem(
                        event.result as {
                          [key: string]: Object;
                        }[]
                      );
                    })
                    .catch((e: Object) => { });
                  // }
                }
              }
              else {
                this.fetchInvoiceDataIds = [];
              }
            })
          }
        }
      });
    }
  }
  createForm() {
    this.inwardForm = new FormBuilder().group({
      invoiceDate: [null],
      packagingListAvailable: [null],
      putawayDoneBy: [null],
      putawayDoneDate: [null],
      numberOfLines: [null],
      orderedQuantity: [null],
      numberOfDamagedLines: [null],
      damagedQuantity: [null],
      informedAboutDamage: [null],
      vehicleNumber: [null],
      vehicleType: [null],
      containerNumber: [null],
      invoiceTotalQuantity: [null],
      emptyVehicleWeight: [null],
      waybillNumber: [null],
      conditionOfParcel: [null],
      remarks: [null],
      verifiedBySupervisor: [null],
      supervisorSignature: [null],
      verifiedDate: [null],
      docketNumber: [null],
      supplierIDName: [null],
      customerIDName: null,
      wareHouseIDName: null,
      completedDate: [null],
      completedBy: [null],
      totalSupplierReceivedQuantity: [null],
      typeOfShipment: [null],
      lrNumber: [null]
    });
   // this.disablePrintBtn =true;
  }
  generatePDF(): void {
    console.log(this.makeThisNull)
   if(this.makeThisNull === undefined || this.makeThisNull === null)
   {
    this.toastr.error("No Data Availble to Print");
   }
   else{
    if(!this.disablePrintBtn){
      this.emitTripSheet.emit();
      this.printDocument();
    }
   
   }    
  }
  private printDocument(): void {
    setTimeout(() => {
      window.print();
    }, 300);
  }
  fetchInvoiceNumber: any;
  fetchInvoiceDataIds: any = [];
  // countList: any;
  fetchAllInvoiceNumber() {
    this.formObj['noteType'] = 'Inward Shipment';
    this.formObj['page'] = 1
    this.formObj['pageSize'] = 10;
    this.commonMasterData.fetchAllGRNote(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes) {
          this.fetchInvoiceNumber = response.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes
          // this.countList = this.fetchInvoiceNumber.filter(countNumber => countNumber.invoiceNumber);
          // this.fetchInvoiceDataIds = this.fetchInvoiceNumber.map(fetchInvoiceNumber => fetchInvoiceNumber.invoiceNumber)
          // this.inwardForm.patchValue(this.fetchInvoiceNumber);
          const arr = response.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes;
          if (this.fetchInvoiceDataIds.length > 0) {
            let index = this.fetchInvoiceDataIds.length;
            arr.forEach((v, i) => {
              i = index;
              if (!this.fetchInvoiceDataIds.find(x => x.text == v.invoiceNumber)) {
                this.fetchInvoiceDataIds.push({ text: v.invoiceNumber, id: i });
                index += 1;
              }
            });
          }
          else {
            this.fetchInvoiceDataIds = arr.map((v, i) => ({ text: v.invoiceNumber, id: i }));
          }
        }
      })
  }
  setInvoiceId(event) {
    this.modalReq.invoiceNumber = null;
    this.dummyInv = null;
    this.makeThisNull=null;
    
    this.createForm();
    if (event) {
      this.filteredPOObj = this.purchaseOrdersRespnseList.find(x => x.fullWmpoNumber == this.modalReq.orderId);
      // this.fetchInvoiceDataIds = this.fetchInvoiceNumber.filter(x => x.fullWmpoNumber == this.filteredPOObj.fullWmpoNumber).map(x => x.invoiceNumber);
      const form = {
        'noteType': 'Inward Shipment',
        'fullWmpoNumber': this.filteredPOObj.fullWmpoNumber,
        'organizationIDName': this.formObj.organizationIDName,
        'wareHouseIDName': this.formObj.wareHouseIDName
      }
      this.commonMasterData.fetchAllGRNotesWithOutPagination(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].goodsReceiptNotes && res['data'].goodsReceiptNotes.length) {
          this.fetchInvoiceDataIds =  res['data'].goodsReceiptNotes.map((v, i) => ({ text: v.invoiceNumber, id: i }));
        }
      })
    }
    // else {
    //   this.modalReq.invoiceNumber = null;
    //   this.createForm();
    // }
  }
  clear() {
    this.inwardForm.reset();
    this.dummyInv = null;
    const arr: any = []
    // this.wmpoNumberCompleterDataIDs = this.completerService.local(
    //   this.commonService.getFiltValuesFromArrayOfObjs(arr, 'rackName'));

    this.wmpoNumberCompleterDataIDs = arr
    this.orderType = "Purchase Order"
    this.getCalls()
  }
  purchaseOrdersRespnseList: any = []
  wmpoNumberCompleterDataIDs: CompleterData;
  fetchAllPurchaseOrders() {
    this.modalReq.orderId = null;
    this.modalReq.invoiceNumber = null;
    this.dummyInv = null;
    const arr: any = []
    this.wmpoNumberCompleterDataIDs = this.completerService.local(null);
    const sentObj = {
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      'orderType': this.orderType
    }
    this.wmsService.fetchAllPurchaseOrders(sentObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.purchaseOrders.length > 0) {
          this.purchaseOrdersRespnseList = response.data.purchaseOrders
          const arr = this.purchaseOrdersRespnseList.map(getPONumber => getPONumber.fullWmpoNumber);
          this.wmpoNumberCompleterDataIDs = arr;
        } else {
          this.purchaseOrdersRespnseList = []
          this.wmpoNumberCompleterDataIDs = this.completerService.local(arr);
        }
      },
      (error) => {
      });
  }
  modalReq = {
    orderId: null,
    invoiceNumber: null,
    customerName: null,
    orderType:'Purchase Order'
  }
  customerDetailsDataIDs: CompleterData;
  goodsReceiptResponceList: any;
  dataService: CompleterData;

  goodsReceiptPrintResponseList :any = []
  putAwayDoneByIds: any[] = [];
  completedDateObj: [] = [];
  makeThisNull:any;
  getSelect(type, event) {
   
    if (event && event.itemData) {
      this.modalReq.invoiceNumber = event.itemData.text;
      this.wmsService.inwardCheckListFormPassingData = {}
      console.log(this.wmsService.inwardCheckListFormPassingData)
      this.getSelectedValue(type, event.itemData.text);
      this.dummyInv = null;
      this.globleLevelObject = null;
      this.makeThisNull = null;

      console.log(this.globleLevelObject);
    }
  }
  globleLevelObject:any;
  getSelectedValue(type, value, val1?) {
    if (value != null) {
      switch (type) {
        case 'invoiceNumber': {        
          if ((value || val1) == this.modalReq.invoiceNumber) {
            const sendNewReq = {
              "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
              "organizationIDName": this.configService.getOrganization().organizationIDName,
              "noteType": "Inward Shipment",
              "wmpoNumber": this.filteredPOObj.wmpoNumber,
              "fullWmpoNumber": this.filteredPOObj.fullWmpoNumber,
              "wmpoNumberPrefix": this.filteredPOObj.wmpoNumberPrefix,
              "invoiceNumber": this.modalReq.invoiceNumber,
              "orderType": this.orderType,
            }
            this.wmsService.fetchAllInwardCheckListData(sendNewReq).subscribe((response) => {
              if (response && response.status === 0 && response.data.goodsReceiptNote) {
                this.disablePrintBtn=false;
                this.makeThisNull = response.data.goodsReceiptNote
                this.goodsReceiptResponceList = response.data.goodsReceiptNote;
                this.goodsReceiptPrintResponseList = response.data.goodsReceiptNote;
                this.wmsService.modalReqPasssingData = this.modalReq;
                this.inwardForm.get("typeOfShipment").setValue(this.goodsReceiptPrintResponseList.typeOfShipment);
                this.inwardForm.patchValue(this.goodsReceiptResponceList);
                console.log(this.inwardForm)
                console.log(this.goodsReceiptResponceList)
                this.inwardForm.get('lrNumber').setValue(this.goodsReceiptPrintResponseList.lrNumber);
                this.inwardForm.get('verifiedDate').setValue(this.goodsReceiptResponceList.verifiedDate
                  ? this.datepipe.transform(new Date(this.goodsReceiptResponceList.verifiedDate), 'yyyy-MM-dd') : null)
                this.wmsService.vehicleNumber = this.goodsReceiptResponceList.vehicleInfo.vehicleNumber
                this.wmsService.vehicleType = this.goodsReceiptPrintResponseList.vehicleType
                this.wmsService.invoiceDate = this.goodsReceiptPrintResponseList.invoiceDate
                this.wmsService.containerNumber = this.goodsReceiptResponceList.equipmentInfo.equipmentID
                this.wmsService.packagingListAvailable = this.goodsReceiptPrintResponseList.packagingListAvailable
                this.wmsService.putawayDoneBy = this.goodsReceiptPrintResponseList.putawayDoneBy
                this.wmsService.putawayDoneDate = this.goodsReceiptPrintResponseList.putawayDoneDate
                this.wmsService.numberOfLines = this.goodsReceiptPrintResponseList.numberOfLines
                this.wmsService.orderedQuantity = this.goodsReceiptPrintResponseList.orderedQuantity
                this.wmsService.numberOfDamagedLines = this.goodsReceiptPrintResponseList.numberOfDamagedLines
                this.wmsService.damagedQuantity = this.goodsReceiptPrintResponseList.damagedQuantity
                this.wmsService.informedAboutDamage = this.goodsReceiptPrintResponseList.informedAboutDamage
                this.wmsService.invoiceTotalQuantity = this.goodsReceiptPrintResponseList.invoiceTotalQuantity
                this.wmsService.emptyVehicleWeight = this.goodsReceiptPrintResponseList.emptyVehicleWeight
                this.wmsService.lrNumber = this.goodsReceiptPrintResponseList.lrNumber
                this.wmsService.conditionOfParcel = this.goodsReceiptPrintResponseList.conditionOfParcel
                this.wmsService.remarks = this.goodsReceiptPrintResponseList.remarks
                this.wmsService.verifiedBySupervisor = this.goodsReceiptPrintResponseList.verifiedBySupervisor
                this.wmsService.supervisorSignature = this.goodsReceiptPrintResponseList.supervisorSignature
                this.wmsService.verifiedDate = this.goodsReceiptPrintResponseList.verifiedDate
                this.wmsService.docketNumber = this.goodsReceiptPrintResponseList.docketNumber
                this.wmsService.typeOfShipment = this.goodsReceiptPrintResponseList.typeOfShipment
                this.wmsService.supplierIDName = this.goodsReceiptPrintResponseList.supplierMasterInfo ? this.goodsReceiptPrintResponseList.supplierMasterInfo.supplierIDName : null
                this.wmsService.customerIDName = this.goodsReceiptPrintResponseList.customerMasterInfo ? this.goodsReceiptPrintResponseList.customerMasterInfo.customerIDName : null
                this.wmsService.wareHouseIDName = this.goodsReceiptPrintResponseList.wareHouseTransferSourceInfo ? this.goodsReceiptPrintResponseList.wareHouseTransferSourceInfo.wareHouseIDName : null
                this.wmsService.completedDate = this.goodsReceiptPrintResponseList.putawayCheckListInfos.map(compldDate => compldDate.completedDate).toString();
                this.wmsService.assignedTo = this.goodsReceiptPrintResponseList.putawayCheckListInfos.map(asinegndTo => asinegndTo.assignedTo).toString();
                delete this.goodsReceiptResponceList.typeOfShipment
                this.wmsService.totalSupplierReceivedQuantity = this.goodsReceiptPrintResponseList.totalSupplierReceivedQuantity;
                delete this.goodsReceiptResponceList.packagingListAvailable
                delete this.goodsReceiptResponceList.totalSupplierReceivedQuantity
                delete this.goodsReceiptResponceList.putawayDoneBy
                delete this.goodsReceiptResponceList.putawayDoneDate
                delete this.goodsReceiptResponceList.numberOfLines
                delete this.goodsReceiptResponceList.orderedQuantity
                delete this.goodsReceiptResponceList.numberOfDamagedLines
                delete this.goodsReceiptResponceList.damagedQuantity
                delete this.goodsReceiptResponceList.informedAboutDamage
                delete this.goodsReceiptResponceList.vehicleNumber
                delete this.goodsReceiptResponceList.vehicleType
                delete this.goodsReceiptResponceList.containerNumber
                delete this.goodsReceiptResponceList.invoiceTotalQuantity
                delete this.goodsReceiptResponceList.emptyVehicleWeight
                delete this.goodsReceiptResponceList.waybillNumber
                delete this.goodsReceiptResponceList.conditionOfParcel
                delete this.goodsReceiptResponceList.remarks
                delete this.goodsReceiptResponceList.verifiedBySupervisor
                delete this.goodsReceiptResponceList.supervisorSignature
                delete this.goodsReceiptResponceList.docketNumber
                delete this.goodsReceiptResponceList.verifiedDate
                this.inwardForm.get('invoiceDate').setValue(this.goodsReceiptResponceList.invoiceDate
                  ? this.datepipe.transform(new Date(this.goodsReceiptResponceList.invoiceDate), 'yyyy-MM-dd') : null)
                this.inwardForm.get('vehicleNumber').setValue(this.goodsReceiptResponceList.vehicleInfo ? this.goodsReceiptResponceList.vehicleInfo.vehicleNumber : null)
                this.inwardForm.get('supplierIDName').setValue(this.goodsReceiptResponceList.supplierMasterInfo ? this.goodsReceiptResponceList.supplierMasterInfo.supplierIDName : null)
                this.inwardForm.get('containerNumber').setValue(this.goodsReceiptResponceList.equipmentInfo.equipmentID)
                this.inwardForm.get('customerIDName').setValue(this.goodsReceiptResponceList.customerMasterInfo ? this.goodsReceiptResponceList.customerMasterInfo.customerIDName : null)
                this.inwardForm.get('wareHouseIDName').setValue(this.goodsReceiptResponceList.wareHouseTransferSourceInfo ? this.goodsReceiptResponceList.wareHouseTransferSourceInfo.wareHouseIDName : null)
                this.wmsService.modalReqPasssingData = this.modalReq;
                this.wmsService.passingInwardCheckListFormData = this.inwardForm.value;


                this.putAwayDoneByIds = this.goodsReceiptResponceList.putawayCheckListInfos.map(putawayDoneBy => putawayDoneBy.assignedTo)

                const bIn = this.goodsReceiptResponceList.putawayCheckListInfos.filter(x => x.assignedTo != null);

                const dupBin = bIn ? bIn.map(x => x.assignedTo) : null;

                this.putAwayDoneByIds = this.removeDuplicates(dupBin);
                this.goodsReceiptPrintResponseList.putawayCheckListInfos.forEach(putawayDate => {
                  this.inwardForm.controls.completedDate.setValue(putawayDate.completedDate ? this.datepipe.transform(new Date(putawayDate.completedDate), 'yyyy-MM-dd') : null)
                  this.wmsService.completedDate = putawayDate.completedDate
                });
                this.inwardForm.controls.completedBy.patchValue(this.putAwayDoneByIds.toString());
                this.wmsService.assignedTo = this.putAwayDoneByIds;
              }
              else {
                this.makeThisNull=null;
                this.disablePrintBtn=false;
              }
            })
          
          }
          else {
            this.createForm();
          }
        }
      }
     
    }
   
  }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  globalDateValue: any;
  getSelectedDateValue(type, value) {
    if (value.originalObject) {
      const getDateValue = this.goodsReceiptResponceList.putawayCheckListInfos.find(putawayDoneBy => putawayDoneBy.completedBy === value.originalObject)
      this.globalDateValue = getDateValue.completedDate
      this.inwardForm.controls.completedDate.setValue(getDateValue.completedDate
        ? this.datepipe.transform(new Date(getDateValue.completedDate), 'yyyy-MM-dd') : null)
    }
    this.wmsService.assignedTo = value.originalObject;
    this.wmsService.completedDate = this.globalDateValue;
  }
  save() {

   this.wmsService.vehicleType = null
    if (this.permissionsList.includes('Update')) {
      const form = this.inwardForm.value;

      const objReq = Object.assign(this.inwardForm.value, this.goodsReceiptResponceList);
      this.inwardForm.patchValue(this.goodsReceiptResponceList);
      this.commonMasterData.saveorUpdateIntWardCheckList(objReq).subscribe(res => {
        if (res['status'] == 0 && res['data']['goodsReceiptNote']) {
          (form._id) ? this.toastr.success("Updated Successfully") : this.toastr.success("Saved Successfully");
          
        }
      })
      this.inwardForm.get('invoiceDate').setValue(this.goodsReceiptResponceList.invoiceDate
        ? this.datepipe.transform(new Date(this.goodsReceiptResponceList.invoiceDate), 'yyyy-MM-dd') : null)

      this.putAwayDoneByIds = this.goodsReceiptResponceList.putawayCheckListInfos.map(putawayDoneBy => putawayDoneBy.assignedTo)
      const bIn = this.goodsReceiptResponceList.putawayCheckListInfos.filter(x => x.assignedTo != null);
      const dupBin = bIn ? bIn.map(x => x.assignedTo) : null;
      this.putAwayDoneByIds = this.removeDuplicates(dupBin);
      this.goodsReceiptPrintResponseList.putawayCheckListInfos.forEach(putawayDate => {
        this.inwardForm.controls.completedDate.setValue(putawayDate.completedDate ? this.datepipe.transform(new Date(putawayDate.completedDate), 'yyyy-MM-dd') : null)
      });
      this.inwardForm.controls.completedBy.patchValue(this.putAwayDoneByIds);
      this.wmsService.serObjectFOrTypeOFShipment = this.inwardForm.value;
      this.passingDataInServiceAfterSave();
    }
    else {
      this.toastr.error('User doesnt have permission');
    }
    this.goodsReceiptResponceList = null    
  }
  passingDataInServiceAfterSave() {
  
    //this.wmsService.serObjectFOrTypeOFShipment = this.inwardForm.value;

    this.wmsService.inwardCheckListFormPassingData = null
    this.wmsService.remarks = ''
    this.goodsReceiptPrintResponseList.remarks = null
    this.wmsService.inwardCheckListFormPassingData = this.inwardForm.value;
    this.wmsService.inwardCheckListFormPassingData.typeOfShipment = this.inwardForm.value.typeOfShipment
    this.wmsService.vehicleNumber = this.goodsReceiptResponceList.vehicleInfo.vehicleNumber
    this.wmsService.vehicleType = this.goodsReceiptPrintResponseList.vehicleType
    this.wmsService.invoiceDate = this.goodsReceiptPrintResponseList.invoiceDate
    this.wmsService.containerNumber = this.goodsReceiptResponceList.equipmentInfo.equipmentID
    this.wmsService.packagingListAvailable = this.goodsReceiptPrintResponseList.packagingListAvailable
    this.wmsService.putawayDoneBy = this.goodsReceiptPrintResponseList.putawayDoneBy
    this.wmsService.putawayDoneDate = this.goodsReceiptPrintResponseList.putawayDoneDate
    this.wmsService.numberOfLines = this.goodsReceiptPrintResponseList.numberOfLines
    this.wmsService.orderedQuantity = this.goodsReceiptPrintResponseList.orderedQuantity
    this.wmsService.numberOfDamagedLines = this.goodsReceiptPrintResponseList.numberOfDamagedLines
    this.wmsService.damagedQuantity = this.goodsReceiptPrintResponseList.damagedQuantity
    this.wmsService.informedAboutDamage = this.goodsReceiptPrintResponseList.informedAboutDamage
    this.wmsService.invoiceTotalQuantity = this.goodsReceiptPrintResponseList.invoiceTotalQuantity
    this.wmsService.emptyVehicleWeight = this.goodsReceiptPrintResponseList.emptyVehicleWeight
    this.wmsService.lrNumber = this.goodsReceiptPrintResponseList.lrNumber
    this.wmsService.conditionOfParcel = this.goodsReceiptPrintResponseList.conditionOfParcel
    this.wmsService.remarks = this.goodsReceiptPrintResponseList.remarks
    this.wmsService.verifiedBySupervisor = this.goodsReceiptPrintResponseList.verifiedBySupervisor
    this.wmsService.supervisorSignature = this.goodsReceiptPrintResponseList.supervisorSignature
    this.wmsService.verifiedDate = this.goodsReceiptPrintResponseList.verifiedDate
    this.wmsService.docketNumber = this.goodsReceiptPrintResponseList.docketNumber
    this.wmsService.typeOfShipment = this.goodsReceiptPrintResponseList.typeOfShipment
    this.wmsService.completedDate = this.goodsReceiptPrintResponseList.putawayCheckListInfos.map(compldDate => compldDate.completedDate).toString();
    this.wmsService.supplierIDName = this.goodsReceiptPrintResponseList.supplierMasterInfo ? this.goodsReceiptPrintResponseList.supplierMasterInfo.supplierIDName : null
    this.wmsService.customerIDName = this.goodsReceiptPrintResponseList.customerMasterInfo ? this.goodsReceiptPrintResponseList.customerMasterInfo.customerIDName : null
    this.wmsService.wareHouseIDName = this.goodsReceiptPrintResponseList.wareHouseTransferSourceInfo ? this.goodsReceiptPrintResponseList.wareHouseTransferSourceInfo.wareHouseIDName : null


    this.wmsService.assignedTo = [...new Set(this.goodsReceiptPrintResponseList.putawayCheckListInfos.map(asinegndTo => asinegndTo.assignedTo))]

    delete this.goodsReceiptResponceList.typeOfShipment
    this.wmsService.totalSupplierReceivedQuantity = this.goodsReceiptPrintResponseList.totalSupplierReceivedQuantity;
    this.goodsReceiptResponceList = null;
    this.goodsReceiptPrintResponseList = null;
    this.goodsReceiptResponceList = [];
    this.goodsReceiptPrintResponseList = [];

  }
  vehicles: any;
  fetchAllVehicles() {
    this.commonMasterData.fetchAllVehicles(this.formObj).subscribe(
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
  equipments: any;
  fetchAllEquipments() {
    this.commonMasterData.fetchAllEquipments(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.equipmentMaster) {
          this.equipments = response.data.equipmentMaster;

        } else {

        }
      },
      (error) => {

      });
  }
  serviceProviders: any;
  fetchAllServiceProvider() {
    this.wmsService.fetchAllServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.serviceProviders) {
        this.serviceProviders = response.data.serviceProviders;

      } else {

      }
    }, error => {

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
 
   
}

