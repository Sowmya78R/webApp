import { ProductCategoryInfo } from '../common/productCategory';
export class EditProductLines {
    productID: string;
    productName: string;
    upcEANNumber: string;
    supplierCode: string;
    inventoryUnit: string = null;
    productType: string = null;
    productCategoryInfo: object = new ProductCategoryInfo();
    receivingUnit: string = null;
    pickingUnit: string = null;
    shipmentUnit: string = null;
}