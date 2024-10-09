class ProductMasterInfo {
  productMasterID: string;
  productID: string;
  productIDName: string;
  productName: string;
}
export class ProductByCustomer {
  _id: string;
  customerID: string;
  customerName: string;
  customerIDName: string;
  productMasterInfos: Array<object>;
  productMasterInfo: object = new ProductMasterInfo();
}

