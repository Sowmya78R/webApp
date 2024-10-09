import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root'
})
export class CreateSalesOrderService {
  customerIDChange: Subject<any> = new Subject<any>();
  productIDChange: Subject<any> = new Subject<any>();
  productAdded: Subject<any> = new Subject<any>();
  productToEdit: Subject<any> = new Subject<any>();
  clearCustomerCall: Subject<any> = new Subject<any>();
  clearProductCall: Subject<any> = new Subject<any>();
  public createSalesOrderReq = {
    wmsoNumber: null,
    referenceSONumber: null,
    customerMasterInfo: {
      _id: null,
      customerID: null,
      customerName: null,
      customerIDName: null
    },
    "organizationInfo": {
      "_id": null,
      "organizationID": null,
      "organizationName": null,
      "organizationIDName": null
    },
    "wareHouseInfo": {
      "wareHouseMasterID": null,
      "wareHouseID": null,
      "wareHouseName": null,
      "wareHouseIDName": null
    },
    "wareHouseTransferDestinationInfo": {
      "wareHouseTransferTransactionID": null,
      "wareHouseID": null,
      "wareHouseName": null,
      "wareHouseIDName": null,
      "wareHouseTransferMasterID": null,
      "organizationIDName": null,
      "organizationID": null,
      "organizationName": null,
      "fullWareHouseTransferTransactionID": null,
      "wareHouseTransferTransactionIDPrefix": null,
    },
    soReferenceA: null,
    soReferenceB: null,
    shipTO: null,
    orderType: 'Sales Order',
    soOrderDate: null,
    deliveryExpDate: null,
    address1: null,
    address2: null,
    invoiceType: null,
    phoneNumber: null,
    email: null,
    taxType: null,
    taxGroup: null,
    vehicleNumber: null,
    modeOfTransport: null,
    currency: null,
    paymentStatus: null,
    courierName: null,
    orderDiscount: null,
    paymentMode: null,
    termsOfPayment: null,
    advanceAmount: null,
    orderTakenBy: null,
    quantity: null,
    storageUnit: null,
    inventoryUnit: null,
    mrp: null,
    unitPrice: null,
    tax1: null,
    tax2: null,
    tax3: null,
    tax4: null,
    tax5: null,
    discount: null,
    amount: null,
    totalQuantity: null,
    totalAmount: null,
    status: 'open',
    shipmentTimeSlot: null
  };
  salesOrderLines: any = [];
  constructor() { }
  public createCustomerIDNameChange(data: any) {
    this.customerIDChange.next(data);
  }
  public createSOProductIDChange(data: any) {
    this.productIDChange.next(data);
  }
  public productAddedToService(data: any) {
    this.productAdded.next(data);
  }
  public editSOLines(data: any) {
    this.productToEdit.next(data);
  }
  public clearCustomerDetails() {
    this.clearCustomerCall.next(true);
  }
  public clearProductDetails() {
    this.clearProductCall.next(true);
  }
  getDateFromMilliSec(data) {
    let date = new Date(data);
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}