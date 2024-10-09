import { ProductMasterInfo } from '../entities/common/product';
import { ProductCategoryInfo } from '../entities/common/productCategory'
import { Customer } from './common/customer';
import { vehicle } from './vehicle.entity';

export class ShipmentOrder {
    _id: string;
    wmsoNumber: string;
    referenceSONumber: string;
    referencePONumber: string;
    shipmentOrderNumber: number;
    orderType: string;
    orderDate: any;
    customerMasterInfo: any = new Customer();
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
    }
    supplierMasterInfo: {
        supplierMasterID: null,
        supplierID: null,
        supplierName: null,
        supplierIDName: null
    }
    wareHouseTransferType: null;
    remarks: string;
    salesOrderDate: any;
    totalAmount: number;
    status: string;
    orderTime: any;
    shipmentTimeSlot: any;

    shipmentOrderLines: any[] = [];
    soID: string;
    deliveryExpDate: number;
    invoiceType: any;
    locationName: any;
    organizationInfo: any;
    wareHouseInfo: any;
    totalNetAmount: any;
    shipToAddress: any;
    shipFromAddress: any;
    billToAddress: any = null;
    totalDiscount: any = null;
    totalDiscountAmount: any = null;
    totalGrossAmount: any = null;
    totalSaleTaxes: any = null;
    totalTaxAmount: any = null;
    totalTaxPercentage: any = null;
    fullWmsoNumber: any = null;
    wmsoNumberPrefix: any = null;
    driverName: any = null;
    driverPhoneNumber: any = null;
    exBondDate: any = null;
    exBondNumber: any = null;
    createdDate:any=null;

    constructor(order: any) {
        this.wmsoNumber = order.wmsoNumber;
        this.fullWmsoNumber = order.fullWmsoNumber;
        this.exBondDate = order.exBondDate;
        this.exBondNumber = order.exBondNumber;
        this.wmsoNumberPrefix = order.wmsoNumberPrefix;
        this.referenceSONumber = (order.referenceSoNumber || order.referenceSONumber) || null;
        this.referencePONumber = order.referencePONumber;
        this.orderType = order.orderType || '';
        this.orderDate = order.orderDate ? new Date(order.orderDate) : '';
        this.shipmentOrderNumber = order.shipmentOrderNumber || null;
        this.customerMasterInfo = order.customerMasterInfo;
        this.supplierMasterInfo = order.supplierMasterInfo;
        this.wareHouseTransferDestinationInfo = order.wareHouseTransferDestinationInfo;
        this.shipmentTimeSlot = order.shipmentTimeSlot ? order.shipmentTimeSlot : '';
        this.salesOrderDate = order.salesOrderDate ? new Date(order.salesOrderDate) : '';
        this.status = 'Open';
        this.shipmentOrderLines = [];
        this.remarks = order.remarks || '';
        this.totalAmount = order.totalAmount || null;
        this.orderTime = order.orderTime ? new Date(order.orderTime) : '';
        this.soID = order.soID;
        this.deliveryExpDate = order.deliveryExpDate;
        this.invoiceType = order.invoiceType;
        this.locationName = order.locationName;
        this.organizationInfo = order.organizationInfo;
        this.wareHouseInfo = order.wareHouseInfo;
        this.totalNetAmount = order.totalNetAmount;
        this.wareHouseTransferType = order.wareHouseTransferType;
        this.shipToAddress = order.shipToAddress;
        this.shipFromAddress = order.shipFromAddress;
        this.billToAddress = order.billToAddress;
        this.totalDiscount = order.totalDiscount;
        this.totalDiscountAmount = order.totalDiscountAmount;
        this.totalGrossAmount = order.totalGrossAmount;
        this.totalSaleTaxes = order.totalSaleTaxes;
        this.totalTaxAmount = order.totalTaxAmount;
        this.totalTaxPercentage = order.totalTaxPercentage;
        this.driverName = order.driverName;
        this.driverPhoneNumber = order.driverPhoneNumber;
        this.createdDate = order.createdDate;
    }
}

export class EditShipmentOrderLine {
    wmsoLineNumber: number;
    vehicleInfo: any = new vehicle();
    productMasterInfo: any = new ProductMasterInfo();
    productCategoryInfo: any = new ProductCategoryInfo();
    shippingAddress: string;
    expectedDeliveryDate: any;
    modeOfTransport: string;
    paymentStatus: string;
    invoiceType: string;
    invoiceNumber: number;
    batchNumber: string;
    serialNumber: string;
    mfgDate: any;
    expiryDate: any;
    inventoryUnit: string;
    // serialNumbers: any = [];
    // batchNumbers: any = [];
    shelfLife: number;
    quantity: number;
    orderQuantity: number;
    dispatchQuantity: number;
    customerDispatchQuantity: number;
    pickedQuantity: number;
    customerConfirmation: string;
    courierName: string;
    discount: number;
    netAmount: number;
    totalQuantity: number;
    updated: boolean;
    eta: Date;
    _id: string;
    remarks: string;
    productConfiguration: string;
    productDescription: string;
    storageInstruction: string;
    type: string;
    dfsCode: string;
    shipmentUnit: string;
    lrNumber: any = null;
    serviceProviderInfo: any = null;
    equipmentInfo: any = null;
    vehicleType: any = null;

    billOfEntryNumber: any = null;
    billOfEntryDate: Date;
    billOfEntryNumberDate: any = null;
    billOfLandingNumber: any = null;
    billOfLandingDate: Date;
    billOfLandingNumberDate: any = null;
    dispatchDate: Date;

    invoiceDate: any = null;
    coPackingBillingDate: any = null;
    coPackingBillingStatus: any = null;
    coPackingDate: any = null;
    coPackingInfo: any = null;
    coPackingStatus: any = null;
    convertionType: any = null;
    customerLabelingConfirmation: any = null;
    // expectedDeliveryDate: any = null;
    grossWeightLossOrGain: any = null;
    labelingBillingDate: any = null;
    labelingBillingStatus: any = null;
    labelingDate: any = null;
    labelingInfo: any = null;
    labelingStatus: any = null;
    packingBillingDate: any = null;
    packingBillingStatus: any = null;
    packingDate: any = null;
    packingInfo: any = null;
    packingStatus: any = null;
    rePackedQuanity: any = null;
    rePacking: any = null;
    rePackingBillingDate: any = null;
    rePackingBillingStatus: any = null;
    rePackingDate: any = null;
    rePackingInfo: any = null;
    rePackingStatus: any = null;
    unitPrice: any = null;
    wayBillNumber: any = null;
    createdBy: any = null;
    createdDate: any = null
    productImage: any = null;
    taxAmount: any = null;
    grossAmount: any = null;
    saleTaxes: any = null;
    orderUnitPrice: number;
    currency: null;
    brandName: any = null;
    hsnCode: any = null;
    customerQuantity: any = null;
    customerPickedQuantity: any = null;
    status: any = null;
    totalCustomerDispatchQuantity: any = null;
    totalDispatchQuantity: any = null;
    taxPercentage: any = null;
    discountAmount: any = null;
    uomConversionAvailability: any = null;
    exBondDate: any = null;
    exBondNumber: any = null;
    referenceBillOfEntryDate
        :
        null
    referenceBillOfEntryNumber
        :
        null
    referenceBillOfEntryNumberDate
        :
        null
    referenceBillOfLandingDate
        :
        null
    referenceBillOfLandingNumber
        :
        null
    referenceBillOfLandingNumberDate
        :
        null
    referenceBondDate
        :
        null
    referenceBondNumber
        :
        null
    referenceContainerNumber
        :
        null
    referenceVehicleInfo: null
    referenceEquipmentInfo: null
    referenceInvoiceDate
        :
        null
    referenceInvoiceNumber
        :
        null
    referenceLrNumber
        :
        null
    referencePackingRemarks
        :
        null
    referenceServiceProviderInfo
        :
        null
    referenceVehicleNumber
        :
        null
    referenceVehicleType
        :
        null
    referenceWayBillNumber
        :
        null

    constructor(shipmentLine: any) {
        this._id = shipmentLine._id;
        this.productCategoryInfo = shipmentLine.productCategoryInfo;
        this.productMasterInfo = shipmentLine.productMasterInfo;
        this.vehicleInfo = shipmentLine.vehicleInfo;
        this.exBondDate = shipmentLine.exBondDate;
        this.exBondNumber = shipmentLine.exBondNumber;
        this.shippingAddress = shipmentLine.shippingAddress || '';
        this.expectedDeliveryDate = shipmentLine.expectedDeliveryDate ? new Date(shipmentLine.expectedDeliveryDate) : '';
        this.modeOfTransport = shipmentLine.modeOfTransport || '';
        this.paymentStatus = shipmentLine.paymentStatus || '';
        this.invoiceType = shipmentLine.invoiceType || '';
        this.createdBy = shipmentLine.createdBy || '';
        this.createdDate = shipmentLine.createdDate || '';
        this.invoiceNumber = shipmentLine.invoiceNumber || null;
        this.shelfLife = shipmentLine.shelfLife || null;
        this.batchNumber = shipmentLine.batchNumber || null;
        this.serialNumber = shipmentLine.serialNumber || null;
        this.mfgDate = shipmentLine.mfgDate || null;
        this.expiryDate = shipmentLine.expiryDate || null;
        this.inventoryUnit = shipmentLine.inventoryUnit || '';
        this.productConfiguration = shipmentLine.productConfiguration || '';
        this.productDescription = shipmentLine.productDescription || null;
        this.storageInstruction = shipmentLine.storageInstruction || null;
        this.type = shipmentLine.type || '';
        this.dfsCode = shipmentLine.dfsCode || '';
        // this.serialNumbers = shipmentLine.serialNumbers || '';
        // this.batchNumbers = shipmentLine.batchNumbers || null;
        this.quantity = shipmentLine.quantity || null;
        this.orderQuantity = shipmentLine.orderQuantity || null;
        this.dispatchQuantity = shipmentLine.dispatchQuantity || null;
        this.customerDispatchQuantity = shipmentLine.customerDispatchQuantity || null;
        this.pickedQuantity = shipmentLine.pickedQuantity;
        this.customerConfirmation = shipmentLine.customerConfirmation;
        this.wmsoLineNumber = shipmentLine.wmsoLineNumber || null;
        this.courierName = '';
        this.discount = shipmentLine.discount;
        this.discountAmount = shipmentLine.discountAmount;
        this.taxPercentage = shipmentLine.taxPercentage;
        this.netAmount = shipmentLine.netAmount;
        this.totalQuantity = null;
        this.eta = shipmentLine.expectedDeliveryDate ? new Date(shipmentLine.expectedDeliveryDate) : null;
        this.shipmentUnit = shipmentLine.shipmentUnit || '';
        this.remarks = shipmentLine.remarks || '';
        this.lrNumber = shipmentLine.lrNumber || null;
        this.serviceProviderInfo = shipmentLine.serviceProviderInfo || null;
        this.equipmentInfo = shipmentLine.equipmentInfo || null;
        this.vehicleType = shipmentLine.vehicleType || null;
        this.vehicleInfo = shipmentLine.vehicleInfo || null;
        // this.productCategoryInfo = shipmentLine.ProductCategoryInfo || null;
        this.billOfEntryNumber = shipmentLine.billOfEntryNumber || null;
        this.billOfEntryDate = shipmentLine.billOfEntryDate || null;
        this.billOfEntryNumberDate = shipmentLine.billOfEntryNumberDate || null;
        this.billOfLandingNumber = shipmentLine.billOfLandingNumber || null;
        this.billOfLandingDate = shipmentLine.billOfLandingDate || null;
        this.billOfLandingNumberDate = shipmentLine.billOfLandingNumberDate || null;
        this.dispatchDate = (shipmentLine.dispatchDate ? new Date(shipmentLine.dispatchDate) : null) || null;
        this.invoiceDate = shipmentLine.invoiceDate || null;
        this.grossWeightLossOrGain = shipmentLine.grossWeightLossOrGain;
        this.labelingBillingDate = shipmentLine.labelingBillingDate;
        this.labelingBillingStatus = shipmentLine.labelingBillingStatus;
        this.labelingDate = shipmentLine.labelingDate;
        this.labelingInfo = shipmentLine.labelingInfo;
        this.labelingStatus = shipmentLine.labelingStatus;
        this.packingBillingDate = shipmentLine.packingBillingDate;
        this.packingBillingStatus = shipmentLine.packingBillingStatus;
        this.packingDate = shipmentLine.packingDate;
        this.packingInfo = shipmentLine.packingInfo;
        this.packingStatus = shipmentLine.packingStatus;
        this.rePackedQuanity = shipmentLine.rePackedQuanity;
        this.rePacking = shipmentLine.rePacking;
        this.rePackingBillingDate = shipmentLine.rePackingBillingDate;
        this.rePackingBillingStatus = shipmentLine.rePackingBillingStatus;
        this.rePackingDate = shipmentLine.rePackingDate;
        this.rePackingInfo = shipmentLine.rePackingInfo;
        this.rePackingStatus = shipmentLine.rePackingStatus;
        this.unitPrice = shipmentLine.unitPrice;
        this.wayBillNumber = shipmentLine.wayBillNumber;
        this.coPackingBillingDate = shipmentLine.coPackingBillingDate;
        this.coPackingBillingStatus = shipmentLine.coPackingBillingStatus;
        this.coPackingDate = shipmentLine.coPackingDate;
        this.coPackingInfo = shipmentLine.coPackingInfo;
        this.coPackingStatus = shipmentLine.coPackingStatus;
        this.convertionType = shipmentLine.convertionType;
        this.customerLabelingConfirmation = shipmentLine.customerLabelingConfirmation;
        this.productImage = shipmentLine.productImage;
        this.taxAmount = shipmentLine.taxAmount;
        this.grossAmount = shipmentLine.grossAmount;
        this.saleTaxes = shipmentLine.saleTaxes;
        this.orderUnitPrice = shipmentLine.orderUnitPrice;
        this.currency = shipmentLine.currency;
        this.brandName = shipmentLine.brandName;
        this.hsnCode = shipmentLine.hsnCode;
        this.customerQuantity = shipmentLine.customerQuantity;
        this.customerPickedQuantity = shipmentLine.customerPickedQuantity;
        this.status = shipmentLine.status;
        this.totalCustomerDispatchQuantity = shipmentLine.totalCustomerDispatchQuantity;
        this.totalDispatchQuantity = shipmentLine.totalDispatchQuantity;
        this.uomConversionAvailability = shipmentLine.uomConversionAvailability;
        this.referenceBillOfEntryDate = shipmentLine.referenceBillOfEntryDate;
        this.referenceBillOfEntryNumber = shipmentLine.referenceBillOfEntryNumber;
        this.referenceBillOfEntryNumberDate = shipmentLine.referenceBillOfEntryNumberDate;
        this.referenceBillOfLandingDate = shipmentLine.referenceBillOfLandingDate;
        this.referenceBillOfLandingNumber = shipmentLine.referenceBillOfLandingNumber;
        this.referenceBillOfLandingNumberDate = shipmentLine.referenceBillOfLandingNumberDate;
        this.referenceBondDate = shipmentLine.referenceBondDate;
        this.referenceBondNumber = shipmentLine.referenceBondNumber;
        this.referenceVehicleInfo = shipmentLine.referenceVehicleInfo;
        this.referenceEquipmentInfo = shipmentLine.referenceEquipmentInfo;
        this.referenceContainerNumber = shipmentLine.referenceContainerNumber;
        this.referenceInvoiceDate = shipmentLine.referenceInvoiceDate;
        this.referenceInvoiceNumber = shipmentLine.referenceInvoiceNumber;
        this.referenceLrNumber = shipmentLine.referenceLrNumber;
        this.referencePackingRemarks = shipmentLine.referencePackingRemarks;
        this.referenceServiceProviderInfo = shipmentLine.referenceServiceProviderInfo;
        this.referenceVehicleNumber = shipmentLine.referenceVehicleNumber;
        this.referenceVehicleType = shipmentLine.referenceVehicleType;
        this.referenceWayBillNumber = shipmentLine.referenceWayBillNumber
    }
}
