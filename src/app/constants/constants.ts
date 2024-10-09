import { ConfigurationService } from "../services/integration-services/configuration.service";

export class Constants {
  constructor(public configService: ConfigurationService) { }
  static EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  // static WAREHOUSE_ID = this['configService'].getGlobalpayload();
  static WAREHOUSE_ID = '';
  static BILLTOADDRESS_ID = '5e74c89387bb903a44a3828f';
  static ROLES = [
    {
      value: 'ROLE_SUPER_ADMIN',
      viewValue: 'Super Admin'
    },
    {
      value: 'ROLE_ADMIN',
      viewValue: 'Admin'
    },
  ];
  static EXCEL_IGNORE_FIELDS = {
    LOADINGPLANNINGSCREEN: ['_id'],
    UNLOADINGPLANNINGSCREEN: ['_id'],
    SPACEUTILIZATIONBILLING: ['_id'],
    CREATECYCLECOUNTING: ['_id'],
    SHIPMENTHISTORYREPORTS: ['_id'],
    SPACEUTILIZATIONREPORTS: ['_id'],
    SHIPMENTORDERREPORT: ['_id', '10', '70', '80', '90'],
    NEWSHIPMENTORDERREPORT: ['_id', '10', '70', '80', '90'],
    PACKINGPLANNING: ['_id', 'productMasterID', 'productID', 'productName', 'moq', 'leadTime', 'receivingUnit', 'isActive'
      , 'productMasterID', 'productMasterID', 'productMasterID', 'productMasterID', 'productMasterID', 'productCategoryID', 'productCategory', 'productCategoryName', 'productDescription', 'productConfiguration', 'type', 'dfsCode', 'wmsoLineNumber', 'shippingAddress',
      'expectedDeliveryDate', 'modeOfTransport', 'paymentStatus', 'courierName', 'invoiceType', 'eta', 'shipmentUnit', 'batchNumber', 'shelfLife', 'quantity', 'dispatchQuantity',
      'pickedQuantity', 'totalQuantity', 'totalReturnQuantity', 'returnQuantity', 'updated', 'amount', 'tax1', 'tax2', 'tax3', 'tax4', 'tax5', 'remarks', 'discount', 'invoiceNumber'
      , 'invoiceDate', 'unitPrice', 'customerLabelingConfirmation', 'labelingStatus', 'labelingDate', 'coPackingStatus', 'coPackingDate', 'rePackingStatus', 'rePackingDate'
      , 'packingBillingStatus', 'packingBillingDate', 'labelingBillingStatus', 'labelingBillingDate', 'rePackingBillingStatus', 'rePackingBillingDate', 'coPackingBillingStatus',
      'coPackingBillingDate', 'wayBillNumber', 'convertionType', 'rePackedQuanity', 'grossWeightLossOrGain', 'rePacking',
      'rePackingInfo', 'coPackingInfo', 'labelingInfo', 'lrNumber', 'serviceProviderInfo', 'equipmentInfo', 'vehicleType', 'vehicleInfo', 'billOfEntryNumber',
      'billOfEntryDate', 'billOfEntryNumberDate', 'billOfLandingNumber', 'billOfLandingDate', 'billOfLandingNumberDate',
      'headerID', 'isChecked', 'repackedQty', 'grossWeight', 'packingStatus', 'packingDate', 'packedQuantity',
      'status', 'productCategory', 'inventoryUnit', 'assignedDate', 'dispatchDate', 'createdBy'],
    COPACKINGPLANNING: ['_id', 'productMasterID', 'productID', 'productName', 'moq', 'leadTime', 'receivingUnit', 'isActive'
      , 'productMasterID', 'productMasterID', 'productMasterID', 'productMasterID', 'productMasterID', 'productCategoryID', 'productCategory', 'productCategoryName', 'productDescription', 'productConfiguration', 'type', 'dfsCode', 'wmsoLineNumber', 'shippingAddress',
      'expectedDeliveryDate', 'modeOfTransport', 'paymentStatus', 'courierName', 'invoiceType', 'eta', 'shipmentUnit', 'batchNumber', 'shelfLife', 'quantity', 'dispatchQuantity',
      'pickedQuantity', 'totalQuantity', 'totalReturnQuantity', 'returnQuantity', 'updated', 'amount', 'tax1', 'tax2', 'tax3', 'tax4', 'tax5', 'remarks', 'discount', 'invoiceNumber'
      , 'invoiceDate', 'unitPrice', 'customerLabelingConfirmation', 'labelingStatus', 'labelingDate', 'coPackingStatus', 'coPackingDate', 'rePackingStatus', 'rePackingDate'
      , 'packingBillingStatus', 'packingBillingDate', 'labelingBillingStatus', 'labelingBillingDate', 'rePackingBillingStatus', 'rePackingBillingDate', 'coPackingBillingStatus',
      'coPackingBillingDate', 'wayBillNumber', 'convertionType', 'rePackedQuanity', 'grossWeightLossOrGain', 'rePacking',
      'rePackingInfo', 'coPackingInfo', 'labelingInfo', 'lrNumber', 'serviceProviderInfo', 'equipmentInfo', 'vehicleType', 'vehicleInfo', 'billOfEntryNumber',
      'billOfEntryDate', 'billOfEntryNumberDate', 'billOfLandingNumber', 'billOfLandingDate', 'billOfLandingNumberDate',
      'headerID', 'isChecked', 'repackedQty', 'grossWeight', 'packingStatus', 'packingDate', 'packedQuantity',
      'status', 'productCategory', 'inventoryUnit', 'assignedDate', , 'dispatchDate', 'createdBy'],
    REPACKINGPLANNING: ['_id', 'productMasterID', 'productID', 'productName', 'moq', 'leadTime', 'receivingUnit', 'isActive'
      , 'productMasterID', 'productMasterID', 'productMasterID', 'productMasterID', 'productMasterID', 'productCategoryID', 'productCategory', 'productCategoryName', 'productDescription', 'productConfiguration', 'type', 'dfsCode', 'wmsoLineNumber', 'shippingAddress',
      'expectedDeliveryDate', 'modeOfTransport', 'paymentStatus', 'courierName', 'invoiceType', 'eta', 'shipmentUnit', 'batchNumber', 'shelfLife', 'quantity', 'dispatchQuantity',
      'pickedQuantity', 'totalQuantity', 'totalReturnQuantity', 'returnQuantity', 'updated', 'amount', 'tax1', 'tax2', 'tax3', 'tax4', 'tax5', 'remarks', 'discount', 'invoiceNumber'
      , 'invoiceDate', 'unitPrice', 'customerLabelingConfirmation', 'labelingStatus', 'labelingDate', 'coPackingStatus', 'coPackingDate', 'rePackingStatus', 'rePackingDate'
      , 'packingBillingStatus', 'packingBillingDate', 'labelingBillingStatus', 'labelingBillingDate', 'rePackingBillingStatus', 'rePackingBillingDate', 'coPackingBillingStatus',
      'coPackingBillingDate', 'wayBillNumber', 'convertionType', 'rePackedQuanity', 'grossWeightLossOrGain', 'rePacking',
      'rePackingInfo', 'coPackingInfo', 'labelingInfo', 'lrNumber', 'serviceProviderInfo', 'equipmentInfo', 'vehicleType', 'vehicleInfo', 'billOfEntryNumber',
      'billOfEntryDate', 'billOfEntryNumberDate', 'billOfLandingNumber', 'billOfLandingDate', 'billOfLandingNumberDate',
      'headerID', 'isChecked', 'repackedQty', 'grossWeight', 'packingStatus', 'packingDate', 'packedQuantity',
      'status', 'productCategory', 'inventoryUnit', 'assignedDate', , 'dispatchDate', 'createdBy'],
    LABELLINGPLANNING: ['_id', 'productMasterID', 'productID', 'productName', 'moq', 'leadTime', 'receivingUnit', 'isActive'
      , 'productMasterID', 'productMasterID', 'productMasterID', 'productMasterID', 'productMasterID', 'productCategoryID', 'productCategory', 'productCategoryName', 'productDescription', 'productConfiguration', 'type', 'dfsCode', 'wmsoLineNumber', 'shippingAddress',
      'expectedDeliveryDate', 'modeOfTransport', 'paymentStatus', 'courierName', 'invoiceType', 'eta', 'shipmentUnit', 'batchNumber', 'shelfLife', 'quantity', 'dispatchQuantity',
      'pickedQuantity', 'totalQuantity', 'totalReturnQuantity', 'returnQuantity', 'updated', 'amount', 'tax1', 'tax2', 'tax3', 'tax4', 'tax5', 'remarks', 'discount', 'invoiceNumber'
      , 'invoiceDate', 'unitPrice', 'customerLabelingConfirmation', 'labelingStatus', 'labelingDate', 'coPackingStatus', 'coPackingDate', 'rePackingStatus', 'rePackingDate'
      , 'packingBillingStatus', 'packingBillingDate', 'labelingBillingStatus', 'labelingBillingDate', 'rePackingBillingStatus', 'rePackingBillingDate', 'coPackingBillingStatus',
      'coPackingBillingDate', 'wayBillNumber', 'convertionType', 'rePackedQuanity', 'grossWeightLossOrGain', 'rePacking',
      'rePackingInfo', 'coPackingInfo', 'labelingInfo', 'lrNumber', 'serviceProviderInfo', 'equipmentInfo', 'vehicleType', 'vehicleInfo', 'billOfEntryNumber',
      'billOfEntryDate', 'billOfEntryNumberDate', 'billOfLandingNumber', 'billOfLandingDate', 'billOfLandingNumberDate',
      'headerID', 'isChecked', 'repackedQty', 'grossWeight', 'packingStatus', 'packingDate', 'packedQuantity',
      'status', 'productCategory', 'inventoryUnit', 'assignedDate', , 'dispatchDate', 'createdBy'],
    INTERNALTRANSFERPLANNING: ['_id', '20', 'E0', '00', ':0', 'A0', 'n0', 'i0', 't0', 'h0', 'a0', ' 0', 'N0', '10', 'C0', 'c0', 'e0', 'r0', 'y0', 'L0', '50', 'B0', 'T0'],
    INVENTORY_BY_PRODUCT_REPORT: ['_id', 'inventoryID', 'productMasterID', 'productIDName', 'moq', 'leadTime', 'receivingUnit', 'isActive', 'createdDate', 'productImage',
      'productCategoryID', 'productCategory', 'productCategoryName', 'expiryFlag', 'wareHouseMasterID', 'wareHouseID', 'wareHouseIDName', 'zoneID', 'putawayID', 'rackID', 'levelID', 'levelName', 'binInfo', 'locationID',
      'storageUnit', 'quantityStorageUnit', 'availableUnit', 'lastUpdatedDate', 'expiryDate', 'remainingShelfLife', 'stockValue', 'avgCostPrice', 'inventoryAvailability', 'shelfLife', 'supplierMasterID', 'supplierID',
      'supplierName', 'supplierIDName', 'supplierLocationName', 'serialNumber', 'organizationID', 'organizationName',
      'organizationIDName', 'wareHouseTransferSourceInfo', 'wareHouseTransferType', 'customersSupplierName', 'customersSupplierAddress'],
    INVENTORY_BY_LOCATION_REPORT: ['_id', 'inventoryID', 'productMasterID', 'productIDName', 'moq', 'leadTime', 'receivingUnit', 'isActive', 'createdDate', 'productImage', 'productCategoryID',
      'productCategory', 'productCategoryName', 'expiryFlag', 'wareHouseMasterID', 'wareHouseID', 'zoneID', 'putawayID', 'rackID', 'levelID', 'binInfo', 'locationID',
      'storageUnit', 'quantityStorageUnit', 'availableUnit', 'lastUpdatedDate', 'remainingShelfLife', 'stockValue', 'avgCostPrice', 'inventoryAvailability', 'shelfLife', 'supplierMasterID',
      'supplierID', 'supplierName', 'supplierIDName', 'supplierLocationName', 'serialNumber',
      'organizationID', 'organizationName', 'organizationIDName', 'wareHouseTransferSourceInfo', 'wareHouseTransferType', 'customersSupplierName', 'customersSupplierAddress'],
    GRNSTAGETRANSACTION: ['supplierIDName', 'productIDName', 'productCategoryName', 'productDescription', 'productConfiguration',
      'type', 'dfsCode', 'receivingUnit', 'inventoryUnit', 'receiptDate', 'receivedQuantity', 'orderedQuantity', 'createdDate'
      , 'referenceInvoiceNumber', 'eta', 'serialNumber', 'locationName', 'wayBillNumber', 'invoiceNumber', 'invoiceDate', 'billOfEntryNumber',
      'billOfEntryDate', 'billOfEntryNumberDate', 'billOfLandingNumber', 'billOfLandingDate', 'billOfLandingNumberDate', 'vehicleNumber',
      'vehicleType', 'containerNumber', 'sealNumber', 'transport', 'wareHouseIDName', 'returnOrderType'],
    GRNSTAGESUMMARY: ['supplierIDName', 'wmpoNumber', 'supplierID', 'grnDate', 'expiryDate',
      'mfgDate', 'batchNumber', 'productCategoryName', 'productDescription', 'productConfiguration',
      'type', 'dfsCode', 'receivingUnit', 'inventoryUnit', 'receiptDate', 'orderedQuantity', 'createdDate'
      , 'referenceInvoiceNumber', 'eta', 'serialNumber', 'locationName', 'wayBillNumber', 'invoiceNumber', 'invoiceDate', 'billOfEntryNumber',
      'billOfEntryDate', 'billOfEntryNumberDate', 'billOfLandingNumber', 'billOfLandingDate', 'billOfLandingNumberDate', 'vehicleNumber',
      'vehicleType', 'containerNumber', 'sealNumber', 'transport', 'supplierName', 'productName', 'productCategory'],
    GRNSUMMARY: ['supplierIDName', 'productIDName', 'productDescription', 'productConfiguration',
      'type', 'dfsCode', 'receivingUnit', 'inventoryUnit', 'receiptDate', 'orderedQuantity',
      , 'eta', 'locationName', 'billOfEntryNumber',
      'billOfEntryDate', 'billOfEntryNumberDate', 'billOfLandingNumber', 'billOfLandingDate', 'billOfLandingNumberDate', 'containerNumber', 'sealNumber', 'transport'],
    LEVELS: ['_id', 'rackID', 'columns', 'active', 'storageTypeDescription', 'status', 'organizationID', 'organizationName',
      'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName', 'height', 'width', 'sequenceNumber'],
    LOCATIONS: ['_id', 'wareHouseID', 'zoneID', 'rackID', 'levelID',
      'locationID', 'status', 'binInfo', 'isActive', 'sequenceNumber',
      'active', 'storageTypeDescription',
      'quantity', 'sequence', 'width', 'organizationID', 'organizationName'
      , 'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'],
    PICKING_STRATEGY: ['_id', 'active', 'isActive', 'pickingStrategyName', 'PSID', 'zoneID', 'organizationID'
      , 'organizationName', 'organizationIDName', 'organizationInfo', 'wareHouseInfo', 'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'],
    // PUTAWAY_PLANNING:['_id','grnID','invoiceNumber','userID','putawayExecutive','executiveID','executiveName','wareHouseIDName','wareHouseID','zoneID',
    //   'sequenceNumber','isActive','rackID','levelID','locationID','createdDate','lastUpdatedDate','wareHouseMasterID',
    //   "createdDate",	"lastUpdatedDate",	"completedDate",	"supplierMasterID",	"supplierID"	,"supplierName"	,"supplierIDName",	"productMasterID",	"productID"	,"productName",		"moq"	,"leadTime"	,
    //   "receivingUnit",	"productCategoryID",	"productCategory",	"productCategoryName",	"productType"	,"productClass"	,"orderType",	"storageUnit",	"status",	"batchNumber",	"mfgDate",	"expiryDate"	,
    //   "avgCostPrice",	"serialNumbers",	"quantityType",	"organizationID",	"organizationName",	"organizationIDName"	,
    //   "wareHouseTransferSourceInfo",	"wareHouseTransferType",	"putAwayCompleted",	"isChecked"	,"wareHouseTeamInfo",	"executiveFirstName"	,"executiveLastName"],
    PICKING_PLANNING: ['_id', 'referenceSoNumber', 'soID', 'invoiceNumber', 'createdOn', 'completedDate', 'userID', 'orderType', 'pickingExecutive', 'executiveID',
      'executiveName', 'executiveFirstName', 'executiveLastName', 'startTime', 'endTime', 'deliveryExpDate', 'shipmentTimeSlot', 'wareHouseMasterID', 'wareHouseID',
      'wareHouseIDName', 'zoneID', 'sequenceNumber', 'isActive', 'rackID', 'levelID', 'binInfo', 'locationID', 'customerMasterID', 'customerID', 'customerName',
      'customerIDName', 'organizationIdName', 'wareHouseIdName', 'productMasterID', 'productID', 'productName', 'moq', 'leadTime', 'receivingUnit', 'productDescription',
      'productConfiguration', 'type', 'dfsCode', 'shippingAddress', 'shippingDate', 'lastUpdatedDate', 'title', 'batchNumber', 'quantity', 'reservedQuantity', 'storageUnit',
      'shipmentUnit', 'status', 'modeOfTransport', 'invoiceType', 'shelfLife', 'organizationID', 'organizationName',
      'organizationIDName', 'wareHouseTransferDestinationInfo', 'wareHouseTransferType', 'pickingCompleted', 'isChecked', 'wareHouseTeamInfo', 'completedBy'
      , 'returnOrderType', 'supplierMasterInfo', '10', '20', '00', '11', '30'],
    PUTAWAY_PLANNING: ['_id'],
    PRODUCTS: ['_id', 'productCategoryID', 'InventoryUnit', 'createdDate', 'updatedDate', 'taxGroup',
      'currencyDescription', 'active', 'Location', 'productAttribute1', 'productAttribute2', 'productCategoryInfo',
      'productAttribute3', 'productAttribute4', 'productAttribute5', 'productAttribute6', 'productAttribute7', 'productAttribute8',
      'Active', 'expiryFlag', 'receivingInstruction', 'storageInstruction', 'dispathInstruciton', 'productIDName',
      'organizationID', 'organizationName'
      , 'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName', 'status'],
    SUPPLIERS: ['_id', 'productMasterID', 'taxRegNumber1', 'taxRegNumber2', 'taxGroupDescription',
      'supplierIDName', 'status', 'active', 'organizationID', 'organizationName', 'organizationIDName', 'organizationInfo',
      'wareHouseInfo', 'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'],
    PRODUCTS_BY_SUPPLIERS: ['_id', 'productMasterID', 'finishedSupplierID', 'isActive', 'createdDate',
      'active', 'supplierName', 'supplierType', 'upcEANNumber', 'productID', 'productName', 'organizationID',
      'organizationName', 'organizationIDName', 'organizationInfo', 'wareHouseInfo', 'wareHouseMasterID', 'wareHouseID',
      'wareHouseName', 'wareHouseIDName'],
    RACKS: ['_id', 'zoneID', 'active', 'storageTypeDescription', 'isActive', 'sequenceNumber',
      'supplierIDName', 'storageType', 'sequance', 'organizationID', 'organizationName', 'organizationIDName',
      'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'
    ],
    USERS: ['_id', 'password', 'wrong_pwd_tries', 'profilepic', 'rolesList', 'tenantID'],
    VEHICLES: ['_id', 'equipmentMasterID', 'rcNumber', 'vehicleRegNo',
      , 'vehicleMake', 'vehicleModel', 'yearOfManufacture', 'typeVehicle', 'licensePlate', 'engineNumber', 'registraionState', 'equipmentInfo',
      'maxWeight', 'maxWeightUom', 'maxVolume', 'gpsConfigured', 'gpsDeviceId', 'active', 'maxVolumeUom'
      , 'vehiclePhoto', 'sequenceNumber', 'status', 'equipmentType', 'equipmentID', 'equipmentName', 'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName',
      'organizationInfo',
      'storageTypeDescription', 'status', 'organizationID', 'organizationName', 'organizationIDName'],
    WAREHOUSES: ['_id', 'active', 'wareHouseIDName', 'storageType', 'organizationInfo', 'wareHouseInfo', 'width',
      'storageTypeDescription', 'status', 'organizationID', 'organizationName', 'organizationIDName'],
    WAREHOUSETEAMS: ['_id', 'lastUpdatedDate', 'createdDate', 'active', 'status', 'organizationID', 'organizationName',
      'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName', 'temparatureControl', 'temparature', 'uomTemparature', 'countryName'
      , 'uomEffectiveVolume', 'effectiveVolume', 'uomEffectiveWeight', 'effectiveWeight', 'equipmentPhoto', 'executiveIDName'],
    ZONES: ['_id', 'wareHouseID', 'active', 'storageTypeDescription', 'status', 'storageType', 'wareHouseMasterID', 'wareHouseName', 'wareHouseIDName',
      'organizationID', 'organizationName', 'organizationIDName', 'organizationInfo', 'wareHouseInfo', 'sequence'],
    CUSTOMERS: ['_id', 'customerIDName', 'taxRegNumber1', 'taxRegNumber2',
      'productMasterID', 'active', 'isActive', 'status', 'productIDName', 'customerIDName', 'organizationID', 'organizationName',
      'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'
    ],
    EQUIPMENTS: ['_id', 'equipmentIDName', 'status', 'active', 'organizationID', 'organizationName', 'equipmentIDNameS'
      , 'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'
    ],
    PRODUCTBY_CUSTOMERS: ['_id', 'taxRegNumber1', 'taxRegNumber2', 'active', 'productMasterID', 'createdDate',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName', 'equipmentPhoto', 'effectiveWeight', 'uomEffectiveWeight'
      , 'effectiveVolume', 'countryName', 'temparatureControl', 'temparature', 'uomTemparature'],

    BILL_TO_ADDRESS: ['_id', 'organizationID', 'organizationName', 'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'
    ],
    BILL_OF_RESOURCE: ['_id', 'active', 'productID', 'productName', 'status', 'organizationID', 'organizationName', 'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'
    ],
    PUTAWAY_STRATEGY: ['_id', 'isActive', 'active', 'putawayStrategyName', 'PSID', 'zoneID', 'organizationID', 'organizationName', 'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'
    ],
    PURCHASE_ORDER: ['_id', 'createdDate', 'lastUpdatedDate', 'active', 'supplierMasterID', 'productMasterID', 'raisePO', 'wmpoNumber', 'referencePONumber', 'wareHouseInfo',
      'organizationInfo', 'organizationID', 'organizationName', 'organizationIDName', 'wareHouseIDName', 'wareHouseName', 'wareHouseID', 'wareHouseMasterID',
      'wareHouseTransferSourceInfo', 'wmsPOLineNumber',
      'dispatchOrderQuantity', 'dispathOrderType', 'putawayQuantity', 'remarks', 'status', 'taxGroupDescription', 'poReferenceA',
      'poReferenceB', 'returnQuantity', 'receivedQuantity', 'averageCostPrice', 'moq', 'leadTime', 'customClearanceTime'],
    GOODS_RECEIVING: ["_id", "referencePONumber", "poReferenceA", "poReferenceB",
      "grn", "receiptType", 'supplierMasterID', 'supplierName',
      "grnDate", "grnTime", "wayBillNumber", "createdDate", "lastUpdatedDate", "poID",
      "remarks", "status", "grnRecievingDeliveryDate", "receivedType", "sequenceNumber",
       "productMasterID", "productName", "moq",
      "leadTime", "isActive", "productCategoryID",
      "productCategory", "productCategoryName", "productType", "productClass",
      "inventoryUnit", "lrNumber", "carrierName", "alphaNumeric", "quantity",
      "receivedQuantity", "acceptedQuantity", 'productCategory',
      "unitprice", "amount", "volume", "totalVolume", "totalAmount",
      "exceptedDeliveryDate", "referenceInvoiceNumber", "eta", "avgCostPrice",
      "supplierReturnQuantity", "noOfReturnLocationsRequired", "noOfReceiveLocationsRequired", 'orderType',
      "returnPalletConsideration", "totalReceivedQuantity", "totalReturnQuantity", "receiveLocationAllocationType",
      "returnLocationAllocationType", "updated", "returnLocationsFound", "receiveLocationsFound", "locationFound", "productCategoryInfo"],
    PRODUCT_STRATEGY: ['_id', 'active', 'productCategoryID',
      'putawayStrategyID', 'pickingStrategyID', 'productCategory', 'organizationID', 'organizationName',
      'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'],
    REPLENISHMENT_ORDER: ['_id', 'productMasterID', 'isActive', 'active', 'locationID',
      'moq', 'leadTime', 'receivingUnit', 'productID', 'productName', 'organizationID', 'organizationName'
      , 'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'
    ],
    UOM: ['_id', 'productMasterID', 'isActive', 'productMasterInfo', 'receivingUnit', 'leadTime', 'moq', 'productName', 'productID',
      'organizationID', 'organizationName', 'organizationIDName', 'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName', 'createdDate'],
    COLUMN: ['_id', 'active', 'organizationID', 'organizationName', 'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName', 'sequence'],
    TRANSPORTER: ['_id', 'serviceProviderIDName', 'branchName', 'accountName', 'otherInfo', 'countryName', 'considerEquipment',
      'status', 'equipmentInfo', 'organizationInfo', 'wareHouseInfo', 'currency', 'organizationID', 'organizationName',
      'organizationIDName', 'organizationInfo', 'wareHouseInfo',
      'wareHouseMasterID', 'wareHouseID', 'wareHouseName', 'wareHouseIDName'
    ],
    VEHICLEBYSERVICEPROVIDER: ['_id', 'isActive', 'vehicleInfo',
      'equipmentInfo', 'equipmentMasterID', 'equipmentName', 'equipmentIDName', 'serviceProviderID', 'serviceProviderName'],
    INBOUNDSALESRETURN: ['_id', 'isActive', 'vehicleInfo',
      'equipmentInfo', 'equipmentMasterID', 'equipmentName', 'equipmentIDName', 'serviceProviderID', 'serviceProviderName'],
    INVENTORYTABLE: ['_id', 'productMasterID','isActive', 'productCategoryID', 'wareHouseID',
      'zoneID', 'putawayID', 'rackID', 'levelID', 'binInfo', 'locationID', 'active', 'supplierMasterID', 
      'supplierName','moq', 'leadTime', 'receivingUnit', 'expiryFlag', 'sequenceNumber', 'height', 'width',
       'sequence', 'quantityStorageUnit',
      'availableUnit', 'productCategoryName', 'productType', 'productClass', 'lastUpdatedDate',
      'remainingShelfLife','supplierName', 'wareHouseName', 'zoneName', 'rackName', 'levelName', 'storageUnit',
      'column', 'productCategory'],
    INVENTORYBYTRANSACTIONDETAILS: ['_id', 'supplierMasterID', 'supplierID', 'supplierName', 'customerMasterID', 'customerName', 'organizationIdName', 'wareHouseIdName'
      , 'productMasterID', 'productIDName'],
    GOODS_RECEIVING_REPORTS: ["_id", "wmpoNumber", "referencePONumber", "poReferenceA", "poReferenceB",
      "grn", "receiptType", 'supplierMasterID', 'supplierID', 'supplierName',
      "grnDate", "grnTime", "wayBillNumber", "createdDate", "lastUpdatedDate", "poID",
      "remarks", "status", "grnRecievingDeliveryDate", "receivedType", "sequenceNumber",
      "poLineNumber", "productMasterID", "productID", "productName", "moq",
      "leadTime", "isActive", "productCategoryID",
      "productCategory", "productCategoryName", "productType", "productClass",
      "inventoryUnit", "lrNumber", "carrierName", "alphaNumeric", "quantity",
      "receivedQuantity", "acceptedQuantity", 'productCategory',
      "unitprice", "amount", "volume", "totalVolume", "totalAmount",
      "exceptedDeliveryDate", "referenceInvoiceNumber", "eta", "avgCostPrice",
      "supplierReturnQuantity", "noOfReturnLocationsRequired", "noOfReceiveLocationsRequired", 'orderType',
      "returnPalletConsideration", "totalReceivedQuantity", "totalReturnQuantity", "receiveLocationAllocationType",
      "returnLocationAllocationType", "updated", "returnLocationsFound", "receiveLocationsFound", "locationFound", "productCategoryInfo"],
  };
  static UPLOAD_MANDAT_FIELDS = {
    WAREHOUSE: [],
    INVENTORY: [],
    ZONE: [],
    RACK: [],
    LEVEL: [],
    LOCATION: [],
    VEHICLE: [],
    REPLENISHMENT: [],
    EQUIPMENT: [],
    WAREHOUSETEAM: [],
    CUSTOMER: [],
    SUPPLIER: [],
    PRODUCT: [],
    BILLOFRESOURCE: [],
    PURCHASE_ORDER_HEADER: [],
    PURCHASE_ORDER_LINE: [],
    REPLENISHMENT_ORDER_DATA: [],
    PRODUCT_STRATEGY: [],
    PICKING_STRATEGY_HEADER: [],
    PICKING_STRATEGY_LINE: [],
    PICKING_STRATEGY: ['finishedPickingStrategyName'],
    PUTAWAY_STRATEGY_HEADER: [],
    PUTAWAY_STRATEGY: ['finishedPutawayStrategyName'],
    PUTAWAY_STRATEGY_LINE: [],
    PRODUCT_BY_CUSTOMER_HEADER: ['customerID'],
    PRODUCT_BY_CUSTOMER: [],
    PRODUCT_BY_CUSTOMER_LINE: [],
    PRODUCT_BY_SUPPLIER_HEADER: ['supplierID'],
    PRODUCT_BY_SUPPLIER_LINE: [],
    PRODUCT_BY_SUPPLIER: ['supplierID', 'productID'],
    UOM: [],
    UOM_CONVERSION: [],
    COLUMN: [],
    PRODUCTCATEGORYGROUP: [],
    TRANSPORATOR: [],
    VEHICLEBYRANSPORTER: ['serviceProviderIDName', 'vehicleNumber']
    /*  WAREHOUSE: ['wareHouseID', 'wareHouseName','storageTypeCode','capacity','contactName','email', 'address',
       'city', 'state', 'pin', 'phoneNumber', 'country'],
      ZONE: ['zoneName', 'storageTypeCode', 'wareHouseName', 'capacity', 'height', 'width', 'sequence'],
    ZONE:[],
     RACK: ['zoneName', 'rackName', 'storageTypeCode', 'capacity', 'columnsList', 'height', 'width', 'sequence'],
     LEVEL: ['levelName', 'rackName', 'storageTypeCode', 'capacity', 'columnsList'],
     LOCATION: ['wareHouseName', 'zoneName', 'rackName', 'levelName', 'locationName',
       'storageTypeCode', 'capacity', 'totalSpace', 'usableSpace', 'locationAvailability',
       'column', 'position', 'maxDimensionUom', 'allowableWeight', 'allowableMaxDimension',
       'usableSpaceCheck', 'weightCheck', 'maxDimensionCheck'],
     VEHICLE: ['vehicleNumber', 'vehicleType', 'vehicleName', 'registrationState', 'chasisNumber',
       'vehicleCapacity', 'owner', 'driverName',
       'contactNumber', 'noOfShifts', 'hoursPerShift', 'dayCapacity', 'noOfDaysPerWeek', 'weeklyCappacity',
       'utilization', 'efficency'],
     EQUIPMENT: ['equipmentID', 'equipmentName', 'noofShifts', 'hoursPerShift', 'daysCapacity', 'noOfDaysPerWeek', 'weeklyCapacity',
       'sequenceNumber', 'equipmentIDName'],
     WAREHOUSETEAM: ['executiveName', 'executiveID', 'address', 'country', 'state', 'city', 'phoneNumber', 'email', 'pin', 'workType', 'noOfShifts', 'hoursPerShift',
       'dayCapacity', 'noOfDaysPerWeek', 'weeklyCapacity', 'loginTime', 'logoutTime', 'utilization', 'efficency', 'sequenceNumber',
     ],
     CUSTOMER: ['customerID', 'customerName', 'customerIDName', 'customerType', 'serviceType', 'leadTime', 'taxGroup', 'currency',
       'discountPercentage', 'markupPercentage', 'creditPeriod', 'termsOfPayment', 'taxType', 'spocName', 'spocEmail', 'spocPhoneNumber', 'shipingAddress', 'country', 'state', 'city', 'latitude',
       'longitude', 'phoneNumber', 'email', 'pin', 'bankName', 'accountNumber', 'accountHolderName', 'accountType', 'pan',
       'bankAddress', 'ifscCode'],
     SUPPLIER: ['supplierID', 'supplierName', 'termsOfPayment', 'supplierType', 'leadTime',
       'taxGroup', 'taxType', 'currency', 'address1', 'country', 'state', 'city', 'phoneNumber', 'email', 'pin'],
       PRODUCT:[],
    /*  PRODUCT: ['productID', 'status', 'productName', 'productIDName', 'productCategoryName', 'productClass', 'productType',
       'upcEANNumber', 'inventoryUnit', 'receivingUnit', 'shipmentUnit', 'palletQuantity', 'pickingUnit', 'storageUnit',
       'shelfLife', 'moq', 'reOrderPoint', 'qualityCheck', 'length', 'breadth', 'height', 'weight',
       'volume', 'maxDimension', 'palletSize', 'currency', 'avgSalesPrice', 'avgCostPrice', 'price', 'mrp',
       'productMerge', 'mergeType'],
     BILLOFRESOURCE: ['productIDName', 'productID', 'productName', 'resourceUnit', 'equipment', 'executives', 'vehicle',
       'capacityUnit', 'quantity', 'sequenceNumber',],
     PURCHASE_ORDER_HEADER: ['supplierIDName', 'supplierID', 'supplierName', 'receiptDate', 'receiptType', 'currency', 'poDeliveryDate', 'termsOfPayment',
       'taxGroup'],
     PURCHASE_ORDER_LINE: ['productIDName', 'productID', 'productName', 'units'],
     REPLENISHMENT_ORDER_DATA: ['productID', 'productName', 'productIDName', 'locationName', 'replenishmentQuantity', 'thresholdQuantity'],
     PRODUCT_STRATEGY: ['putawayStrategyName', 'pickingStrategyType', 'pickingStrategyName'],
     PICKING_STRATEGY_HEADER: ['finishedPickingStrategyName', 'pickingStrategyType'],
     PICKING_STRATEGY_LINE: ['zoneName', 'sequenceNumber'],
     PUTAWAY_STRATEGY_HEADER: ['finishedPutawayStrategyName'],
     PUTAWAY_STRATEGY_LINE: ['zoneName', 'sequenceNumber'],
     PRODUCT_BY_CUSTOMER_HEADER: ['customerIDName', 'customerName', 'customerType', 'moq', 'leadTime'],
     PRODUCT_BY_CUSTOMER_LINE: ['productIDName', 'moq', 'leadTime', 'receivingUnit'],
     PRODUCT_BY_SUPPLIER_HEADER: ['supplierIDName', 'supplierName', 'supplierType', 'finishedSupplierID'],
     PRODUCT_BY_SUPPLIER_LINE: ['productIDName', 'moq'],
     UOM: ['unitConversionFrom', 'unitConversionTo', 'conversionFactor', 'productIDName'],
     UOM_CONVERSION: ['unitConversionFrom', 'unitConversionTo', 'conversionFactor'],
     COLUMN: ['column', 'height', 'width', 'sequence'],
     TRANSPORATOR: [],
     VEHICLEBYSERVICEPROVIDER: []*/
  };
  static GEN_INNER_OBJS = {
    WAREHOUSE: {
      storageType: {
        parent: 'storageType',
        child: 'storageTypeCode',
      },
    },
    VEHICLEBYSERVICEPROVIDER: {
      vehiclyByServiceProvider: {

      }
    },
    COLUMN: {
      columnMap: {

      }
    },
    ZONE: {
      wareHouseName: {
        parent: 'wareHouseInfo',
        child: 'wareHouseName'
      },
      storageTypeCode: {
        parent: 'storageType',
        child: 'storageTypeCode',
      },
      supplierIDName: {
        parent: 'supplierMasterInfo',
        child: 'supplierIDName'
      },
    },

    RACK: {
      zoneName: {
        parent: 'zoneInfo',
        child: 'zoneName'
      },

      storageTypeCode: {
        parent: 'storageType',
        child: 'storageTypeCode',
      },
      columnName: {
        parent: 'columnHelper',
        child: 'columnName'
      }
    },
    LEVEL: {
      rackName: {
        parent: 'rackInfo',
        child: 'rackName'
      }, storageTypeCode: {
        parent: 'storageType',
        child: 'storageTypeCode',
      },
      columnName: {
        parent: 'columnHelper',
        child: 'columnName'
      }
    },
    INVENTORYFORPRODUCT: {
      productID: {
        parent: 'productMasterInfo',
        child: 'productID'
      },
     
    },

    INVENTORYNEW: {
      productID: {
        parent: 'productMasterInfo',
        child: 'productID'
      },
      supplierID: {
        parent: 'supplierMasterInfo',
        child: 'supplierID'
      },
    },
    INVENTORY: {
      productID: {
        parent: 'productMasterInfo',
        child: 'productID'
      },
      supplierID: {
        parent: 'supplierMasterInfo',
        child: 'supplierID'
      },
      locationName: {
        parent: 'locationInfo',
        child: 'locationName'
      },
      wareHouseName: {
        parent: 'wareHouseInfo',
        child: 'wareHouseName'
      },
      zoneName: {
        parent: 'zoneInfo',
        child: 'zoneName'
      },
      rackName: {
        parent: 'rackInfo',
        child: 'rackName'
      },
      storageTypeCode: {
        parent: 'storageType',
        child: 'storageTypeCode',
      },
      levelName: {
        parent: 'levelInfo',
        child: 'levelName'
      },
      binName: {
        parent: 'binInfo',
        child: 'binName'
      },
      productCategoryName: {
        parent: 'productCategoryInfo',
        child: 'productCategoryName'
      },
      column: {
        parent: 'column',
        child: 'column'
      }
    },
    LOCATION: {
      zoneName: {
        parent: 'zoneInfo',
        child: 'zoneName'
      },
      rackName: {
        parent: 'rackInfo',
        child: 'rackName'
      },
      storageTypeCode: {
        parent: 'storageType',
        child: 'storageTypeCode',
      }, wareHouseName: {
        parent: 'wareHouseInfo',
        child: 'wareHouseName'
      },
      levelName: {
        parent: 'levelInfo',
        child: 'levelName'
      },
      binName: {
        parent: 'binInfo',
        child: 'binName'
      },
      column: {
        parent: 'column',
        child: 'column'
      }
    },
    PRODUCTCATEGORYGROUP: {},
    TAXES: {},
    REPLENISHMENT: {
      // locationName: {
      //   parent: 'locationInfo',
      //   child: 'locationName'
      // },
      // productMasterInfo:{
      //   parent: '',
      // }
      // productName: {
      //   parent: 'productMasterInfo',
      //   child: 'productName',

      // },
      // productID: {
      //   parent: 'productMasterInfo',
      //   child: 'productID',
      // },
      // productMasterID: {
      //   parent: 'productMasterInfo',
      //   child: 'productMasterID',
      // },
      // productIDName: {
      //   parent: 'productMasterInfo',
      //   child: 'productIDName',
      // },
    },
    WAREHOUSETEAM: {
      /* country: {
        parent: 'country',
        child: 'country'
      },
      workType: {
        parent: 'workType',
        child: 'workType'
      } */
    },

    SUPPLIER: {
      taxGroup: {
        parent: 'taxGroup',
        child: 'taxGroup'
      }
    },
    TRANSPORATOR: {
      address: {

      }


    },

    VEHICLE: {
      equipmentID: {
        parent: 'equipmentInfo',
        child: 'equipmentID'
      }
    },
    UOM: {
      productID: {
        parent: 'productMasterInfo',
        child: 'productID'
      },
    },
    PBS: {
      productID: {
        parent: 'productMasterInfo',
        child: 'productID'
      },
    },
    PBSINFO: {
      supplierID: {
        parent: 'supplierMasterInfo',
        child: 'supplierID'
      },
    },
    PBC: {
      productID: {
        parent: 'productMasterInfo',
        child: 'productID'
      },
    },
    PBCUSTOMER: {
      customerID: {
        parent: 'customerMasterInfo',
        child: 'customerID'
      },
    },    
    PRODUCT: {
      currency: {
        parent: 'currencyMaster',
        child: 'currency'
      },
      productCategoryName: {
        parent: 'productCategoryInfo',
        child: 'productCategoryName'
      }
    },
    PRODUCT_STRATEGY: {
      pickingStrategyName: {
        parent: 'pickingStrategyInfo',
        child: 'pickingStrategyName'
      },
      productCategoryName: {
        parent: 'productCategoryInfo',
        child: 'productCategoryName'
      },
      putawayStrategyName: {
        parent: 'putawayStrategyInfo',
        child: 'putawayStrategyName'
      }
    },
    BILLOFRESOURCE: {
      productID: {
        parent: 'productMasterInfo',
        child: 'productID'
      },
    },
    RELIENISHMENT: {
      productIDName: {
        parent: 'productMasterInfo',
        child: 'productIDName'
      },
      locationName: {
        parent: 'locationInfo',
        child: 'locationName'
      },

    },
    VEHICLEBYTRANSPORTER:{
      serviceProviderID: {
        parent: 'serviceProviderInfo',
        child: 'serviceProviderID'
      },

    }

  };

  static PRODUCT_TYPES = [
    {
      value: 'Finished Product'
    },
    {
      value: 'Semi-Finished Product'
    },
    {
      value: 'WIP'
    },
    {
      value: 'Packing Material'
    },
    {
      value: 'MRO Supply'
    },
    {
      value: 'Others'
    },
  ];
  static CUSTOMER_TYPES = ['Plant', 'Warehouse', 'DC', 'Others'];
  static SUPPLIER_TYPES = ['OEM', 'DC', 'International Supplier', 'Others'];
  static WORK_TYPES = ['Putaway', 'Picking', 'Transfers', 'Cycle Counting', 'Packing', 'Co-Packing', 'Repacking',
    'Labeling', 'Loading', 'Unloading', 'Quality Check', 'GRN', 'Sales', 'Shipment', 'Others'];
  static PAYMENT_MODES = ['Credit Card', 'Debit Card', 'NEFT', 'DD', 'RTGS',
    'IMPS', 'Paypal', 'Wire', 'Online Transfer', 'Cash Remittance', 'Others'];
  static PAYMENT_STATUS = ['Paid', 'Cancelled', 'Refund', 'Incomplete', 'Others'];
  static TAX_TYPES = ['Paid', 'Cancelled', 'Refund', 'Others'];
  static SERVICE_TYPES = ['Paid', 'Cancelled', 'Refund', 'Others'];
  static pick_Direction = ['FIFO', 'LIFO', 'FEFO', 'FMFO', 'ASC', 'DESC'];
  static MERGE_TYPE = ['Same Product', 'Same Product Category', 'Different']
  static PRODUCT_MERGE = ['Yes', 'No']
  static LOCATION_SPACE_STATUS = ['Completly Available', 'Partially Available', 'Unavailable'];


  static footerRouters: {
    masterDataRoutes: [
      {
        id: '001',
        name: 'Product',
        route: '/product'
      }
    ],
    reportRoutes: [
      {
        id: 101,
        name: 'Open Sales Order'
      }
    ]
  };
  static subMenuContent = {
    PURCHASE_ORDER: 'Create your purchase order with supplier and product details to receive products from Supplier.',
    GOODS_RECEIVING_NOTE: 'GRN is created automatically against purchase order to record receiving products from supplier.',
    GOODS_RECEIVING: 'Receive products from supplier against purchase order.',
    CROSS_DOCKING: 'Deliver products to customers directly through crossdocking process.',
    PUTAWAY: 'Move received products from receiving dock to storage location.',
    DAMAGED_STOCK:'Raise Damaged Stock order to suppliers against Inward orders.',
    REPLACEMENT_ORDER:`Raise Replacement orders delivery products against Outward Order.`,
    SALES_ORDER: 'Create your sales order with customer and product details to delivery products.',
    PICKING: 'Move products from storage location to dispatch dock against sales order.',
    SHIPMENT_ORDER: 'Approve shipment order against sales order for shipping products to Customer.',
    REPLENISHMENT: 'Move products from storage location to Picking Area.',
    ADVANCE_SHIPMENT_NOTIFICATION: 'Send notifications automatically to customers for their receiving shipments.',
    INVOICING: 'Print invoice for the orders shipped and settle payments.',
    Outbound_Gate_Entry: 'Print invoice for the orders shipped and settle payments.',
    INBOUND_CAPACITY_PLANNING: 'Manage capacity of Equipment and Resource for the incoming Shipments.',
    OUTBOUND_CAPACITY_PLANNING: 'Manage capacity of Equipment, Vehicle and Resource for the Outgoing Shipments.',
    WAVE_PLANNING: 'Create wave for Picking multiple orders.',

    INVENTORY: 'View Available Inventory in locations by storage unit.',
    INVENTORY_RECEIVING: 'Transfer Inventory to locations by inventory unit.',
    INTERNAL_TRANSFERS: 'Raise Transfer Order from one location to other location.',
    CYCLE_COUNTING: 'Audit inventory accuracy and reconcile errors on an ongoing basis',
    PUTAWAY_PLANNING: 'Manage Putaway list by assigning resources',
    PICKING_PLANNING: 'Manage Picking list by assigning resources',
    INVENTORY_ADJUSTMENTS: 'Adjust Inventory by adding or reducing the products with reason quotes.',
    KANBAN: 'Process of auto replenishment when there is an empty in Kanban.',
    INBOUND_QUALITY_INSPECTION: 'Quality Inspection for Incoming Shipments.',
    OUTBOUND_QUALITY_INSPECTION: 'Quality Inspection for Outgoing Shipments.',
    HOURS_ACCOUNTING: 'Labour expenses in warehouse operations are recorded on hourly basis.',
    EXPENSE_ACCOUNTING: 'All warehouse operations expenses are recorded.',
    WAREHOUSE_LAYOUT: 'Visibility of Available Inventory in locations 123.',
    PACKING: 'Pack for picked products to dispatch dock against sales order.',
    CO_PACKING: 'Pack for picked products to dispatch dock against sales order',
    RE_PACKING: 'Pack for picked products to dispatch dock against sales order',
    LABELLING: 'Pack for picked products to dispatch dock against sales order',
    BILLING_PO: 'Create your purchase order with supplier, pallet positions & charges, VAS charges details to Supplier.',
    BILLING_PO_INVOICE: 'Print invoice for the billing purchase orders and settle payments.',
    PHYSICAL_INVENTORY: 'Perform ABC-XYZ Analysis for Inventory based on usage and criticality.',
    WAREHOUSE_TRANSFER: 'Transfer material from one warehouse to another',
    PURCHASERETURN: 'When the buyer of merchandise, inventory, or other items sends these goods back to the seller.',
    SALES_RETURNS: 'Receive sales returns from customers against sales orders.',
    EMPLOYEE_SCHEDULE: 'Assign employees for the operational tasks proactively',
    EMPLOYEE_PERFORMANCE: 'Monitor employee performance with plan versus actualsMonitor employee performance with plan versus actuals',
    MAINTENANCE_PLANNING: 'IT is trigger for automatically generate a schedule',
    SPACE_UTILIZATION: 'Automatically trigger to generate schedule for space utilization',
    SPACE_UTILIZATION_BILLING: 'Generate billing for space utilization based on actual usage',
    PURCHASE_RETURNS: 'Deliver purchase returns to suppliers against purchase orders',
    EMPLOYEE_TASK: 'Manage tasks assigned to individuals and complete operations',
    THEME_CONFIG: 'Manage tasks assigned to individuals and complete operations',
    ABC_Analysis: 'Generate ABC-XYZ Analysis for Products based on Purchase or Sales Orders',
    AGEING_REPORT: 'Generate Aging report for Available Inventory.',
    ISSUE_INVENTORY: 'Consume Inventory from Warehouse.',
    OUTWARD_CHECKLIST: 'Generate Checklist for Outward Orders after Delivery',
    INWARD_CHECKLIST: 'Generate Checklist for Inward Orders after Delivery',
    PRODUCT_BARCODE: 'Generate & Print Barcode for a product',
    PROCESS_BARCODE: 'Generate & Print Barcode for a Process like Goods Receiving, Putaway, Picking, and Shipment...Etc.',
    USER_BARCODE_CONFIG: 'Authentication access configuration to perform operations only through Barcode Scanner for users.',
    INTEGRATION: 'Transfer Data from WMS to Other Application or Other Application to WMS.',
    PURCHASE_REQUEST: 'Raise purchase indents againts Delivery Order'
  }
  static noDataAvailbleGlobalMsg = {
    noDataAvailble: 'No Data Available to fetch ..Please Check'


  }

}
