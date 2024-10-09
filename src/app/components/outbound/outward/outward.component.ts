import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CompleterData, CompleterService } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
import { ComboBoxComponent, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import { Query, DataManager } from '@syncfusion/ej2-data';

@Component({
  selector: 'app-outward',
  templateUrl: './outward.component.html',
  styleUrls: ['./outward.component.scss']
})
export class OutwardComponent implements OnInit {

  qualityCheckAssgnedToArray: any[] = [];
  pickingCheckListInfoArray: any[] = [];


  @Output() emitTripSheet: any = new EventEmitter<any>();
  filteredSOObj: any = null;
  orderType: any = "Sales Order";
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  dummyInv: any = null;
  page = 1;
  @ViewChild('grRemote')
  public dropdownObj1: ComboBoxComponent;
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

  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private commonMasterData: CommonMasterDataService, private completerService: CompleterService,
    private outboundProcessService: OutboundProcessService, private datepipe: DatePipe,
    private toastr: ToastrService, private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Outward Checklist', Storage.getSessionUser());
  formObj = this.configService.getGlobalpayload();
  outwardCheckListForm: FormGroup
  orderTypeDropdown = ['Sales Order', 'Purchase Returns', 'WareHouseTransfer', 'WareHouseTransfer Returns'];

  ngOnInit() {
    // this.outwardCheckListForm.reset();
    this.getCalls()
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  getCalls() {
    this.createForm();
    this.findAllSalesOrders();
    this.fetchAllInvoiceNumber();
    this.fetchAllVehicles();
    this.fetchAllEquipments();
    this.fetchAllServiceProvider();
    this.makeDisableTheFomOnViewOnly()
  }
  makeDisableTheFomOnViewOnly() {
    if (this.permissionsList.includes('View') && this.permissionsList.includes('Update')) {
      this.outwardCheckListForm.enable();
    }
    else if (this.permissionsList.includes('View')) {
      this.outwardCheckListForm.disable();
    }
  }
  createForm() {
    this.outwardCheckListForm = new FormBuilder().group({
      invoiceDate: [null],
      invoiceQuantity: [null],
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
      waybillNumberDate: [null],
      waybillNumber: [''],
      conditionOfParcel: [null],
      remarks: [null],
      customersCustomerName: [null],
      emptyVehicleWeight: [null],
      handDeliveryInPerson: [null],
      handDeliveryInPersonDate: [null],
      pickedBy: [null],
      supervisorSignature: [null],
      verifiedDate: [null],
      docketNumber: [null],
      customerIDName: [null],
      supplierIDName: null,
      wareHouseIDName: null,
      verifiedBy: [null],
      checkedBy: [null],
      dispatchQuantity: [null],
      customerDispatchQuantity: null,
      typeOfShipment: [null],
      receivedQuantity: [null],
      assignedTo: [null],
      outwardCheckListForm: [null],
      qualityCheckAssignedTo: [null],
      invoiceQty: [null],
      vehicleDate: this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd')
    });
  }
  fetchInvoiceNumber: any;
  fetchInvoiceDataIds: any = [];
  fetchAllInvoiceNumber() {
    this.formObj['noteType'] = 'Outward Shipment';
    this.formObj['page'] = 1;
    this.formObj['pageSize'] = 10;
      this.commonMasterData.fetchAllGRNote(this.formObj).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes) {
            this.fetchInvoiceNumber = response.data.goodsReceiptNotePaginationResponse.goodsReceiptNotes;
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
              noteType: 'Outward Shipment',
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
  setInvoiceId(event) {
    this.modalReq.invoiceNumber = null;
    this.dummyInv = null;
    this.createForm();
    this.modalReq.invoiceNumber = null
    if (event) {
      this.filteredSOObj = this.salesOrdersResponseList.find(x => x.fullWmsoNumber == this.modalReq.orderId);
      

      // this.fetchInvoiceDataIds = this.fetchInvoiceNumber.filter(x => x.fullWmsoNumber == this.filteredSOObj.fullWmsoNumber).map(x => x.invoiceNumber);
      const form = {
        'noteType': 'Outward Shipment',
        'fullWmsoNumber': this.filteredSOObj.fullWmsoNumber,
        'organizationIDName': this.formObj.organizationIDName,
        'wareHouseIDName': this.formObj.wareHouseIDName
      }
      this.commonMasterData.fetchAllGRNotesWithOutPagination(form).subscribe(res => {
        console.log(res)
        if (res['status'] == 0 && res['data'].goodsReceiptNotes && res['data'].goodsReceiptNotes.length) {
          this.fetchInvoiceDataIds =  res['data'].goodsReceiptNotes.map((v, i) => ({ text: v.invoiceNumber, id: i }));
        }
      })
    }
   
  }
  salesOrdersResponseList: any;
  wmsoNumberCompleterDataIDs: CompleterData;
  reqObj = {};
  findAllSalesOrders() {
    this.modalReq.orderId = null;
    this.modalReq.invoiceNumber = null;
    this.dummyInv = null;
    const arr: any = []
    this.wmsoNumberCompleterDataIDs = this.completerService.local(null);
    const sentObj = {
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      'orderType': this.orderType
    }
    this.outboundProcessService.fetchAllSalesOrders(sentObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.salesOrders.length > 0) {
          this.salesOrdersResponseList = response.data.salesOrders;
          const arr = response.data.salesOrders.map(salesOrder => salesOrder.fullWmsoNumber);
          this.wmsoNumberCompleterDataIDs = arr;
        } else {
          this.salesOrdersResponseList = []
          this.wmsoNumberCompleterDataIDs = this.completerService.local(null);

        }
      },
      (error) => {
        // this.salesOrders = [];
      });
  }
  modalReq = {
    orderId: null,
    invoiceNumber: null,
    orderType:'Sales Order'
  }
  goodsReceiptResponceList: any;
  printOutwardCheckListData: any;
  getSelect(type, event) {
    if (event && event.itemData) {
      this.modalReq.invoiceNumber = event.itemData.text;
      this.wmsService.passingOutWardCheckListFormData = {}
      this.getSelectedValue(type, event.itemData.text);
      this.dummyInv = null;
    }
  }
  getSelectedValue(type, value, val1?) {
    switch (type) {
      // case 'orderId': {
      //   if (value.originalObject == this.orderID) {
      //     const sendOutWardNewReq = {
      //       "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      //       "organizationIDName": this.configService.getOrganization().organizationIDName,
      //       "noteType": "Outward Shipment",
      //       "wmsoNumber": this.orderID,
      //       "invoiceNumber": this.modalReq.invoiceNumber
      //     }
      //     this.wmsService.fetchAllOutwardCheckListData(sendOutWardNewReq).subscribe((response) => {
      //       console.log(response);
      //       if (response && response.status === 0 && response.data.goodsReceiptNote) {
      //         this.goodsReceiptResponceList = response.data.goodsReceiptNote;
      //         delete this.goodsReceiptResponceList.packagingListAvailable
      //         delete this.goodsReceiptResponceList.putawayDoneBy
      //         delete this.goodsReceiptResponceList.putawayDoneDate
      //         delete this.goodsReceiptResponceList.numberOfLines
      //         delete this.goodsReceiptResponceList.orderedQuantity
      //         delete this.goodsReceiptResponceList.numberOfDamagedLines
      //         delete this.goodsReceiptResponceList.dispatchQuantity
      //         delete this.goodsReceiptResponceList.damagedQuantity
      //         delete this.goodsReceiptResponceList.informedAboutDamage
      //         delete this.goodsReceiptResponceList.vehicleNumber
      //         delete this.goodsReceiptResponceList.vehicleType
      //         delete this.goodsReceiptResponceList.containerNumber
      //         delete this.goodsReceiptResponceList.invoiceTotalQuantity
      //         delete this.goodsReceiptResponceList.emptyVehicleWeight
      //         delete this.goodsReceiptResponceList.waybillNumber
      //         delete this.goodsReceiptResponceList.waybillNumberDate
      //         delete this.goodsReceiptResponceList.conditionOfParcel
      //         delete this.goodsReceiptResponceList.remarks
      //         delete this.goodsReceiptResponceList.pickedBy
      //         delete this.goodsReceiptResponceList.supervisorSignature
      //         delete this.goodsReceiptResponceList.verifiedDate
      //         delete this.goodsReceiptResponceList.docketNumber
      //         delete this.goodsReceiptResponceList.verifiedBy
      //         delete this.goodsReceiptResponceList.checkedBy
      //         delete this.goodsReceiptResponceList.handDeliveryInPerson
      //         delete this.goodsReceiptResponceList.handDeliveryInPersonDate
      //         delete this.goodsReceiptResponceList.typeOfShipment
      //         delete this.goodsReceiptResponceList.invoiceQty
      //         delete this.goodsReceiptResponceList.customersCustomerName
      //       }
      //       else {
      //       }
      //     })
      //   }
      // }
      case 'invoiceNumber': {
        this.goodsReceiptResponceList = null;
        this.wmsService = null;
        if ((value || val1) == this.modalReq.invoiceNumber) {
          const sendNewReq = {
            "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
            "organizationIDName": this.configService.getOrganization().organizationIDName,
            "noteType": "Outward Shipment",
            "wmsoNumber": this.filteredSOObj.wmsoNumber,
            "fullWmsoNumber": this.filteredSOObj.fullWmsoNumber,
            "wmsoNumberPrefix": this.filteredSOObj.wmsoNumberPrefix,
            "invoiceNumber": this.modalReq.invoiceNumber,
            "orderType": this.filteredSOObj.orderType
          }
          this.wmsService.fetchAllOutwardCheckListData(sendNewReq).subscribe((response) => {
            this.goodsReceiptResponceList = null;
            this.wmsService = null;
            if (response && response.status === 0 && response.data.goodsReceiptNote) {
              this.goodsReceiptResponceList = response.data.goodsReceiptNote;
              this.wmsService.vehicleNumber = this.goodsReceiptResponceList.vehicleInfo.vehicleNumber
              this.outwardCheckListForm.patchValue(this.goodsReceiptResponceList);
              this.outwardCheckListForm.get('waybillNumberDate').setValue(this.goodsReceiptResponceList.waybillNumberDate ?
                this.datepipe.transform(new Date(this.goodsReceiptResponceList.waybillNumberDate), 'yyyy-MM-dd') : null)
              var date = this.goodsReceiptResponceList.handDeliveryInPersonDate;
              var d = new Date(date);
              var ds = d.toLocaleString();
              console.log(ds);
              this.outwardCheckListForm.get('handDeliveryInPersonDate').setValue(this.goodsReceiptResponceList.handDeliveryInPersonDate ?
                this.datepipe.transform(new Date(this.goodsReceiptResponceList.handDeliveryInPersonDate), 'yyyy-MM-dd') : null)
              this.wmsService.outBoundinvoiceDate = this.goodsReceiptResponceList.invoiceDate
              this.wmsService.outBoundnumberOfLines = this.goodsReceiptResponceList.numberOfLines
              this.wmsService.outBoundorderedQuantity = this.goodsReceiptResponceList.orderedQuantity
              this.wmsService.outBoundvehicleNumber = this.goodsReceiptResponceList.vehicleInfo.vehicleNumber
              this.wmsService.outBoundvehicleType = this.goodsReceiptResponceList.vehicleType
              this.wmsService.outBoundwaybillNumberDate = this.goodsReceiptResponceList.waybillNumberDate
              this.wmsService.outBoundwaybillNumber = this.goodsReceiptResponceList.waybillNumber
              this.wmsService.outBoundconditionOfParcel = this.goodsReceiptResponceList.conditionOfParcel
              this.wmsService.outBoundshipToCustomer = this.goodsReceiptResponceList.invoiceDate
              this.wmsService.outBoundweight = this.goodsReceiptResponceList.emptyVehicleWeight
              this.wmsService.outBoundhandDeliveryInPerson = this.goodsReceiptResponceList.handDeliveryInPerson
              this.wmsService.outBoundhandDeliveryInPersonDate = this.goodsReceiptResponceList.handDeliveryInPersonDate
              this.wmsService.outBounddocketNumber = this.goodsReceiptResponceList.docketNumber
              this.wmsService.outBoundverifiedBy = this.goodsReceiptResponceList.verifiedBy
              this.wmsService.outBoundcheckedBy = this.goodsReceiptResponceList.checkedBy
              this.wmsService.outBoundremarks = this.goodsReceiptResponceList.remarks
              this.wmsService.outBoundPickedBy = this.goodsReceiptResponceList.pickedBy
              this.wmsService.outBoundTypeOfShipment = this.goodsReceiptResponceList.typeOfShipment
              this.wmsService.outBoundcustomersCustomerName = this.goodsReceiptResponceList.customersCustomerName
              this.wmsService.outBounddispatchQuantity = this.goodsReceiptResponceList.dispatchQuantity
              this.wmsService.outBoundvehicleDate = this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd')
              this.wmsService.outBoundInvoiceQty = this.goodsReceiptResponceList.invoiceTotalQuantity
              this.wmsService.customerDispatchQuantity = this.goodsReceiptResponceList.customerDispatchQuantity
              this.printOutwardCheckListData = response.data.goodsReceiptNote;


              this.wmsService.printOutwardCheckListData = this.printOutwardCheckListData;
              delete this.goodsReceiptResponceList.packagingListAvailable
              delete this.goodsReceiptResponceList.putawayDoneBy
              delete this.goodsReceiptResponceList.putawayDoneDate
              delete this.goodsReceiptResponceList.numberOfLines
              delete this.goodsReceiptResponceList.dispatchQuantity
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
              delete this.goodsReceiptResponceList.waybillNumberDate
              delete this.goodsReceiptResponceList.conditionOfParcel
              delete this.goodsReceiptResponceList.remarks
              delete this.goodsReceiptResponceList.pickedBy
              delete this.goodsReceiptResponceList.supervisorSignature
              delete this.goodsReceiptResponceList.verifiedDate
              delete this.goodsReceiptResponceList.docketNumber
              delete this.goodsReceiptResponceList.verifiedBy
              delete this.goodsReceiptResponceList.checkedBy
              delete this.goodsReceiptResponceList.handDeliveryInPerson
              delete this.goodsReceiptResponceList.handDeliveryInPersonDate
              delete this.goodsReceiptResponceList.typeOfShipment;
              delete this.goodsReceiptResponceList.customersCustomerName

              console.log(this.goodsReceiptResponceList)
              console.log(this.goodsReceiptResponceList.waybillNumberDate);
              const model = JSON.parse(JSON.stringify(this.modalReq));
              model.orderId = this.filteredSOObj.wmsoNumber;
              this.wmsService.modalReqOutWardFormPasssingData = model;

              console.log(this.outwardCheckListForm.value);

              this.outwardCheckListForm.get('invoiceDate').setValue(this.goodsReceiptResponceList.invoiceDate
                ? this.datepipe.transform(new Date(this.goodsReceiptResponceList.invoiceDate), 'yyyy-MM-dd') : null)

              this.outwardCheckListForm.get('vehicleNumber').setValue(this.goodsReceiptResponceList.vehicleInfo.vehicleNumber)
              this.outwardCheckListForm.get('customerIDName').setValue(this.goodsReceiptResponceList.customerMasterInfo ? this.goodsReceiptResponceList.customerMasterInfo.customerIDName : null);
              this.outwardCheckListForm.get('supplierIDName').setValue(this.goodsReceiptResponceList.supplierMasterInfo ? this.goodsReceiptResponceList.supplierMasterInfo.supplierIDName : null);
              this.outwardCheckListForm.get('wareHouseIDName').setValue(this.goodsReceiptResponceList.wareHouseTransferDestinationInfo ? this.goodsReceiptResponceList.wareHouseTransferDestinationInfo.wareHouseIDName : null);

              this.wmsService.passingOutWardCheckListFormData = this.outwardCheckListForm.value;

              /* Picking Checking List Info */
              console.log(this.goodsReceiptResponceList.pickingCheckListInfos)
              if (this.outwardCheckListForm.controls.assignedTo != null) {
                this.pickingCheckListInfoArray = this.goodsReceiptResponceList.pickingCheckListInfos.map(pickingCheckList => pickingCheckList.assignedTo)
                this.wmsService.outboundAssignedTo = [...new Set(this.goodsReceiptResponceList.pickingCheckListInfos.map(pickingCheckList => pickingCheckList.assignedTo))]
                console.log(this.pickingCheckListInfoArray);
                this.outwardCheckListForm.controls.assignedTo.patchValue([...new Set(this.pickingCheckListInfoArray)])
                // const bIn = this.goodsReceiptResponceList.pickingCheckListInfos.filter(x => x.assignedTo != null);
                // console.log(bIn);
                // const dupBin = bIn ? bIn.map(x => x.assignedTo) : null;
                //console.log(bIn);
                // this.pickingCheckListInfoArray = this.removeDuplicates(dupBin);
                // this.outwardCheckListForm.controls.assignedTo.patchValue(this.pickingCheckListInfoArray.toString());
                //this.wmsService.outboundAssignedTo = this.pickingCheckListInfoArray ? this.pickingCheckListInfoArray.toString():null

              }
              else {
                this.outwardCheckListForm.value.assignedTo.setValue(null);
              }
              /* Quality Chec kAssigne To */
              this.qualityCheckAssgnedToArray = this.goodsReceiptResponceList.qualityCheckAssignedTo ? this.goodsReceiptResponceList.qualityCheckAssignedTo.map(putawayDoneBy => putawayDoneBy) : null;
              console.log(this.qualityCheckAssgnedToArray);
              this.outwardCheckListForm.controls.checkedBy.patchValue(this.qualityCheckAssgnedToArray ? this.qualityCheckAssgnedToArray.toString() : null);
              this.outwardCheckListForm.get('containerNumber').setValue(this.goodsReceiptResponceList.equipmentInfo.equipmentID)
              this.outwardCheckListForm.get('verifiedDate').setValue(this.goodsReceiptResponceList.verifiedDate
                ? this.datepipe.transform(new Date(this.goodsReceiptResponceList.verifiedDate), 'yyyy-MM-dd') : null)
              if (this.goodsReceiptResponceList.verifiedDate) {
                this.outwardCheckListForm.get('verifiedDate').setValue(this.goodsReceiptResponceList.verifiedDate
                  ? this.datepipe.transform(new Date(this.goodsReceiptResponceList.verifiedDate), 'yyyy-MM-dd') : null)
              }
            }
            else {

            }
          })
        }
      }
    }
  }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  save() {
    this.outwardCheckListForm.get('assignedTo').setValue(null)
    //  this.outwardCheckListForm.value.assignedTo.setValue(null);
    const form = this.outwardCheckListForm.value;
    const objReq = Object.assign(this.outwardCheckListForm.value, this.goodsReceiptResponceList);
    this.outwardCheckListForm.patchValue(this.goodsReceiptResponceList);
    this.commonMasterData.saveorUpdateOutWardCheckList(objReq).subscribe(res => {
      if (res['status'] == 0 && res['data']['goodsReceiptNote']) {
        (form._id) ? this.toastr.success("Updated Successfully") : this.toastr.success("Saved Successfully");
      }
    })
    this.outwardCheckListForm.get('invoiceDate').setValue(this.goodsReceiptResponceList.invoiceDate
      ? this.datepipe.transform(new Date(this.goodsReceiptResponceList.invoiceDate), 'yyyy-MM-dd') : null)
    if (this.outwardCheckListForm.controls.assignedTo != null) {
      this.pickingCheckListInfoArray = this.goodsReceiptResponceList.pickingCheckListInfos.map(pickingCheckList => pickingCheckList.assignedTo)
      //console.log(this.pickingCheckListInfoArray);
      //const bIn = this.goodsReceiptResponceList.pickingCheckListInfos.filter(x => x.assignedTo != null);
      //console.log(bIn);
      // const dupBin = bIn ? bIn.map(x => x.assignedTo) : null;
      // console.log(bIn);
      //this.pickingCheckListInfoArray = this.removeDuplicates(dupBin);
      this.outwardCheckListForm.controls.assignedTo.patchValue([...new Set(this.pickingCheckListInfoArray)])
      this.wmsService.outboundAssignedTo = [...new Set(this.goodsReceiptResponceList.pickingCheckListInfos.map(pickingCheckList => pickingCheckList.assignedTo))]
      this.wmsService.outBoundTypeOfShipment = ''
    }
    else {
      this.outwardCheckListForm.value.assignedTo.setValue(null);
    }
    this.wmsService.outBoundObjPassingData = this.outwardCheckListForm.value;

    this.outwardPrintCheckListPrintingPassingData();

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
  generatePDF() {
    if (this.outwardCheckListForm.value.invoiceDate && this.goodsReceiptResponceList.length > 0) {
      this.emitTripSheet.emit();
      setTimeout(() => {
        window.print();
      }, 300);
    }
    else {
      this.toastr.error("Please select the Invoice Number");
    }
  }
  outwardPrintCheckListPrintingPassingData() {
    this.wmsService.outwardCheckListFormPassingData = this.outwardCheckListForm.value;
    console.log(this.wmsService.outwardCheckListFormPassingData);
    this.wmsService.outBoundinvoiceDate = this.goodsReceiptResponceList.invoiceDate
    this.wmsService.outBoundnumberOfLines = this.goodsReceiptResponceList.numberOfLines
    this.wmsService.outBoundorderedQuantity = this.goodsReceiptResponceList.orderedQuantity
    this.wmsService.outBoundvehicleNumber = this.goodsReceiptResponceList.vehicleInfo.vehicleNumber
    this.wmsService.outBoundvehicleType = this.goodsReceiptResponceList.vehicleType
    this.wmsService.outBoundwaybillNumberDate = this.goodsReceiptResponceList.waybillNumberDate
    this.wmsService.outBoundwaybillNumber = this.goodsReceiptResponceList.waybillNumber
    this.wmsService.outBoundconditionOfParcel = this.goodsReceiptResponceList.conditionOfParcel
    this.wmsService.outBoundshipToCustomer = this.goodsReceiptResponceList.invoiceDate
    this.wmsService.outBoundweight = this.goodsReceiptResponceList.emptyVehicleWeight
    this.wmsService.outBoundhandDeliveryInPerson = this.goodsReceiptResponceList.handDeliveryInPerson
    this.wmsService.outBoundhandDeliveryInPersonDate = this.goodsReceiptResponceList.handDeliveryInPersonDate
    this.wmsService.outBounddocketNumber = this.goodsReceiptResponceList.docketNumber
    this.wmsService.outBoundverifiedBy = this.goodsReceiptResponceList.verifiedBy
    this.wmsService.outBoundcheckedBy = this.goodsReceiptResponceList.checkedBy
    this.wmsService.outBoundremarks = this.goodsReceiptResponceList.remarks
    this.wmsService.outBoundPickedBy = this.goodsReceiptResponceList.pickedBy
    this.wmsService.outBoundcustomersCustomerName = this.goodsReceiptResponceList.customersCustomerName
    this.wmsService.outBounddispatchQuantity = this.goodsReceiptResponceList.dispatchQuantity
    this.wmsService.outBoundvehicleDate = this.datepipe.transform(new Date().setDate(new Date().getDate()), 'yyyy-MM-dd')
    this.wmsService.outBoundInvoiceQty = this.goodsReceiptResponceList.invoiceTotalQuantity
    this.wmsService.printOutwardCheckListData = this.printOutwardCheckListData;

  }
  clear() {
    this.outwardCheckListForm.reset()
    const arr: any = []
    // this.wmpoNumberCompleterDataIDs = this.completerService.local(
    //   this.commonService.getFiltValuesFromArrayOfObjs(arr, 'rackName'));

    this.wmsoNumberCompleterDataIDs = arr
    this.orderType = "Sales Order"
    this.getCalls()
  }

}
