import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root'
})
export class CreatePurchaseOrderService {
  supplierIDChange: Subject<any> = new Subject<any>();
  productIDChange: Subject<any> = new Subject<any>();
  poLineAdded: Subject<any> = new Subject<any>();
  editPOLines: Subject<any> = new Subject<any>();
  clearproductLine: Subject<any> = new Subject<any>();
  public createPurchaseOrder: any = {
    wmpoNumber: null,
    wmpoNumberPrefix: null,
    fullWmpoNumber: null,
    referencePONumber: null,
    poDeliveryDate: null,
    receiptDate: null,
    receiptType: null,
    termsOfPayment: null,
    currency: null,
    taxGroup: {
      _id: null,
      taxGroup: '',
      taxGroupDescription: null
    },
    supplierMasterInfo: {
      supplierMasterID: null,
      supplierID: '',
      supplierName: null,
      supplierIDName: null
    },
    poReferenceA: null,
    poReferenceB: null,
    shipTOAddress: null,
    purchaseOrderLines: [],
    remarks: 'NA',
    totalAmount: null,
    status: 'open',
    termsAndConditions: 'NA',
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
    }
  };
  constructor() { }
  public createPOSupplierIDChange(data: any) {
    this.supplierIDChange.next(data);
  }
  public createPOProductIDChange(data: any) {
    this.productIDChange.next(data);
  }
  public poLineAddition(data: any) {
    this.poLineAdded.next(data);
  }
  public editPOLinesMethod(data: any) {
    this.editPOLines.next(data);
  }
  public clearProductDetails() {
    this.clearproductLine.next(true);
  }
  getDateFromMilliSec(data) {
    let date = new Date(data);
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}
