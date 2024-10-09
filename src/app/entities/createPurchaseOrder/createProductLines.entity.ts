export class CreateProductLines {
  productID: string;
  productName: string;
  upcEANNumber: string;
  quantity: number;
  units: string;
  // tax1: number;
  // tax3: number;
  // tax4: number;
  unitPrice: number;
  currency: string;
  discount: number;
  // tax2: number;
  productImage: null;
  receivingUnit: string;
  eta: Date;
  wmsPOLineNumber: number;
  createdBy: string;
  createdDate: Date;
  taxAmount: number;
  grossAmount: number;
  netAmount: number;
  purchaseTaxes: any;
  orderUnitPrice: number;
  brandNames: null;
  productDescription: null;
  storageInstruction: null;
  brandName: string;
  hsnCode: any = null;
  shipmentOrderLineID: any = null;
  uomConversionAvailability: any = null;

  constructor() {
    this.productID = '';
    this.productName = '';
    this.upcEANNumber = '';
    this.quantity = null;
    this.units = '';
    this.brandNames = null
    this.brandName = ''
    // this.tax1 = null;
    // this.tax2 = null;
    // this.tax3 = null;
    // this.tax4 = null;
    this.netAmount = null;
    this.receivingUnit = null;
    this.eta = null;
    this.wmsPOLineNumber = null;
    this.createdBy = null;
    this.createdDate = null;
    this.productImage = null;
    this.grossAmount = null;
    this.taxAmount = null;
    this.purchaseTaxes = null;
    this.orderUnitPrice = null;
    this.hsnCode = null;
    this.productDescription = null;
    this.storageInstruction = null;
    this.shipmentOrderLineID = null;
    this.uomConversionAvailability = null;
  }
}

