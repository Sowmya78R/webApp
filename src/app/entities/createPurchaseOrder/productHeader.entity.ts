import { SupplierMasterInfo, organizationInfo, wareHouseInfo, wareHouseTransferSourceInfo, taxGroup } from '../../entities/common/supplier';

export class ProductHeader {
    supplierMasterInfo: any = new SupplierMasterInfo();
    wareHouseTransferSourceInfo: any = new wareHouseTransferSourceInfo();
    taxGroup: any = new taxGroup();
    poReferenceA: string = null;
    poReferenceB: string = null;
    receiptDate: Date;
    poDeliveryDate: Date;
    receiptType: any = 'Purchase Order';
    returnOrderType: any = false;
    wareHouseTransferType: any = false;
    wmpoNumber: string;
    referencePONumber: string = null;
    fullWmpoNumber: string;
    wmpoNumberPrefix: string;
    shipToAddress: any = {
        "name": null,
        "address": null,
        "city": null,
        "pin": null,
        "state": null,
        "country": null,
        "defaultAddress": null,
        "contactDetail": {

            "phoneNumber": null,
            "alternativePhoneNumber": null,
            "contactName": null,
            "email": null,
        }
    };
    shipFromAddress: any = {
        "name": null,
        "address": null,
        "city": null,
        "pin": null,
        "state": null,
        "country": null,
        "defaultAddress": null,
        "contactDetail": {

            "phoneNumber": null,
            "alternativePhoneNumber": null,
            "contactName": null,
            "email": null,
        }
    };
    billToAddress: any = {
        "name": null,
        "address": null,
        "city": null,
        "pin": null,
        "state": null,
        "country": null,
        "defaultAddress": null,
        "contactDetail": {

            "phoneNumber": null,
            "alternativePhoneNumber": null,
            "contactName": null,
            "email": null,
        }
    };
    termsOfPayment: string = null;
    currency: string = null;
    // confirmedBy: string = null;
    // confirmedDate: Date;
    // closedBy: string = null;
    // closedDate: Date;
    capacity: number;
    organizationInfo: any = new organizationInfo();
    wareHouseInfo: any = new wareHouseInfo();
    "totalGrossAmount" = null;
    "totalNetAmount" = null;
    "totalTaxAmount" = null;
    "totalDiscount" = null;
    "totalDiscountAmount" = null;
    "totalPurchaseTaxes" = null;
    "totalTaxPercentage" = null;
    statusStages: any = [];
    statusStage: any = null;
    shipmentOrderMasterID: null;
}
