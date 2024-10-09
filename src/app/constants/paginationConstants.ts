import { productCategoryInfo } from "../entities/common/product";

export class inventoryTransactionDetails {
  static InventoryTransactionDetailsKeys = ['inventoryTransactionDetailsID', 'supplierIDName', 'customerIDName', 'wareHouseIDName',
    'transactionType', 'transactionDateTime', 'inventoryUnit', 'orderID', 'lineNumber', 'productID', 'productName', 'mfgDate', 'expiryDate',
    'batchNumber', 'zoneName', 'rackName', 'columnName', 'levelName', 'locationName'];


  static InventoryTransactionBindArray = [
    { key: 'Inventory Transaction Details ID', name: 'inventoryTransactionDetailsID' },
    { key: 'Supplier ID Name', name: 'supplierIDName' },
    { key: 'Customer ID Name', name: 'customerIDName' },
    { key: 'WareHouse ID Name', name: 'wareHouseIDName' },
    { key: 'Inventory Unit', name: 'inventoryUnit' },
    { key: 'Total Quantity', name: 'totalQuantity' },
    { key: 'Transaction Type', name: 'transactionType' },
    { key: 'Transaction Date Time', name: 'transactionDateTime' },
    { key: 'Status', name: 'status' },
    { key: 'Inventory Transaction ID', name: 'inventoryTransactionID' },
    { key: 'Order ID', name: 'orderID' },
    { key: 'Line Number', name: 'lineNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Quantity', name: 'quantity' },
    { key: 'MfgDate', name: 'mfgDate' },
    { key: 'ExpiryDate', name: 'expiryDate' },
    { key: 'BatchNumber', name: 'batchNumber' },
    { key: 'Product Purchase Price', name: 'productPurchasePrice' },
    { key: 'Product Sale Price', name: 'productSalePrice' },
    { key: 'Currency', name: 'currency' },
    { key: 'Zone Name', name: 'zoneName' },
    { key: 'Rack Name', name: 'rackName' },
    { key: 'Column Name', name: 'columnName' },
    { key: 'Level Name', name: 'levelName' },
    { key: 'Location Name', name: 'locationName' },
    { key: 'Product Category Name', name: 'productCategoryName' },
    { key: 'Product SubCategory1 Name', name: 'productSubCategory1Name' },
    { key: 'Product SubCategory2 Name', name: 'productSubCategory2Name' },
    { key: 'Product SubCategory3 Name', name: 'productSubCategory3Name' }
  ]
}
export class purchaseOrderHeader {
  static purchaseOrderHeaderSearchKeys = ['fullWmpoNumber', 'supplierName', 'wareHouseTransferSourceInfoWareHouseName', 'customerName', 'receiptType', 'receiptDate',
    'totalNetAmount', 'poDeliveryDate']
  static purchaseOrderLinesSearchKeys = ['fullWmpoNumber', 'wmsPOLineNumber', 'productID', 'productName',
    'productDescription', 'brandName', 'quantity']
  static purchaseOrderSearcByIDhKeys = ['fullWmpoNumber', 'wmsPOLineNumber', 'productID', 'productName',
    'productDescription', 'brandName', 'quantity']
  /* 'productID', 'productName', 'units', 'brandName' */
  static purchaseOrderArrays = [
    { key: 'PO Number', name: 'wmpoNumber' },
    { key: 'Supplier/Customer/Warehouse', name: 'supplierName' },
    { key: 'Supplier/Customer/Warehouse', name: 'wareHouseTransferSourceInfoWareHouseName' },
    { key: 'Supplier/Customer/Warehouse', name: 'customerName' },
    { key: 'Receipt Type', name: 'receiptType' },
    { key: 'Receipt Date', name: 'receiptDate' },
    { key: 'confirmedBy', name: 'confirmedBy' },
    { key: 'Delivery Date', name: 'poDeliveryDate' },
    { key: 'Total Amount', name: 'totalNetAmount' },
    { key: 'Stage Status', name: 'stagesStatus' }
  ]

  static purchaseOrderLinesSortingFields = [
    { key: 'PO Number', name: 'fullWmpoNumber' },
    { key: 'PO Line No', name: 'wmsPOLineNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'UOM', name: 'units' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'Order Quantity', name: 'quantity' },
    { key: 'ETA', name: 'eta' },
  ]
}
export class internalTransferHeader {
  static internalTransferHeaderKeys = ['productIDName', 'zoneName', 'locationName', 'quantityInventoryUnit',
    'availableQuantity', 'reservedQuantity', 'batchNumber', 'serialNumber']
  static internalTransferInventoryArrays = [

    { key: 'Product ID', name: 'productIDName' },
    { key: 'Zone Name', name: 'zoneName' },
    { key: 'Location Name', name: 'locationName' },
    { key: 'Quantity Inventory Unit', name: 'quantityInventoryUnit' },
    { key: 'Available Quantity', name: 'availablequantity' },
    { key: 'Reserved Quantity', name: 'reservedQuantity' },
    { key: 'Batch Number', name: 'batchNumber' },
    { key: 'Serial Number', name: 'serialNumber' }
  ]
  static internalTransferArrays = [

    { key: 'Status', name: 'Status' },
    { key: 'Transaction ID', name: 'fullInternalTransferTransactionID' },
    { key: 'Assigned To', name: 'assignedTo' },
    { key: 'Assigned By', name: 'assignedBy' },
    { key: 'Product ID/Name', name: 'productIDName' },
    { key: 'Source Location', name: 'locationName' },
    { key: 'Destination Location', name: 'locationName' },
    { key: 'Transfer Quantity', name: 'transferQuantity' },
    { key: 'Reason', name: 'reason' },
    { key: 'Start Date', name: 'startDate' },
    { key: 'End Date', name: 'endDate' }
  ]
}

export class inventoryAdjustmentHead {
  static internalAdjustmentRightSideTableKeys = ['productIDName', 'zoneName', 'locationName', 'quantityInventoryUnit',
    'availableQuantity', 'reservedQuantity', 'batchNumber', 'serialNumber']
  static internalInventoryArrays = [
    { key: 'Product ID', name: 'productIDName' },
    { key: 'Zone Name', name: 'zoneName' },
    { key: 'Location Name', name: 'locationName' },
    { key: 'Quantity Inventory Unit', name: 'quantityInventoryUnit' },
    { key: 'Available Quantity', name: 'availablequantity' },
    { key: 'Reserved Quantity', name: 'reservedQuantity' },
    { key: 'Batch Number', name: 'batchNumber' },
    { key: 'Serial Number', name: 'serialNumber' },
    { key: 'Manufactured Date', name: 'mfgDate' },
    { key: 'Created Date', name: 'createdDate' },
    { key: 'Expiry Date', name: 'expiryDate' },
    { key: 'Serial Number', name: 'serialNumber' }
  ]


  static inventoryAdjustmentArrays = [
    { key: 'Status', name: 'Status' },
    { key: 'Transaction ID', name: 'fullInventoryAdjustmentTransactionID' },
    { key: 'Location Name', name: 'locationName' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'UOM', name: 'inventoryUnit' },
    { key: 'BrandName', name: 'brandName' },
    { key: 'Product Purchase Price', name: 'productPurchasePrice' },
    { key: 'Received Quantity/Quantity Inventory Unit', name: 'adjustedQuantity' },
    { key: 'Available Quantity', name: 'availableQuantity' },
    { key: 'Reserved Quantity', name: 'reservedQuantity' },
    { key: 'Adjusted Quantity', name: 'adjustedQuantity' },
    { key: 'Reason', name: 'reason' },

  ]


}





export class gateEntryForInboundHead {
  static gateEntryInboundSearchKeys = ['productIDName', 'zoneName', 'locationName', 'quantityInventoryUnit',
    'availableQuantity', 'reservedQuantity', 'batchNumber', 'serialNumber']
  static gateEntrySortFieldsArrays = [
    { key: 'Invoice Number', name: 'invoiceNumber' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'supplierIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'customerIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'wareHouseTransferSourceInfoWareHouseIDName' },
    { key: 'Gate In D&T', name: 'gateInDate' },
    { key: 'Gate Out D&T', name: 'gateOutDate' },
    { key: 'Order ID', name: 'fullWmpoNumber' },
    { key: 'Invoice Date', name: 'invoiceDate' },
    { key: 'Vehicle Number', name: 'vehicleNumber' },
    { key: 'Vehicle Type', name: 'vehicleType' },
    { key: 'Transporter', name: 'serviceProviderIDName' },
    { key: 'Carrier Name', name: 'equipmentID' },
    { key: 'LR Number', name: 'waybillNumber' },
    { key: 'Invoice Qty', name: 'invoiceTotalQuantity' },
    { key: 'Assigned To', name: 'assignedTo' },
    { key: 'Assigned By', name: 'assignedBy' },
    { key: 'Start Time', name: 'startDate' },
    { key: 'End Time', name: 'endDate' },
    { key: 'Completed By', name: 'completedBy' },
    { key: 'Planned Completion Date', name: 'plannedCompletionDate' },
    { key: 'Unloading Status', name: 'status' },
    { key: 'Assigned To', name: 'qualityCheckAssignedTo' },
    { key: 'Assigned By', name: 'qualityCheckAssignedBy' },
    { key: 'Start Time', name: 'qualityCheckStartDate' },
    { key: 'End Time', name: 'qualityCheckEndDate' },
    { key: 'Completed By', name: 'qualityCheckCompletedBy' },
    { key: 'Planned Completion Date', name: 'grnPlannedCompletionDate' },
    { key: 'Quality Check Status', name: 'status' },
    { key: 'Assigned To', name: 'grnAssignedTo' },
    { key: 'Assigned By', name: 'grnAssignedBy' },
    { key: 'Start Time', name: 'grnStartDate' },
    { key: 'End Time', name: 'grnEndDate' },
    { key: 'Completed By', name: 'grnCompletedBy' },
    { key: 'Planned Completion Date', name: 'grnPlannedCompletionDate' },
    { key: 'GRN Status', name: 'status' },
    { key: 'Status', name: 'status' },
  ]
}
export class gateEntryForOutBoundHead {
  static gateEntryOutBoundSearchKeys = ['productIDName', 'zoneName', 'locationName', 'quantityInventoryUnit',
    'availableQuantity', 'reservedQuantity', 'batchNumber', 'serialNumber']
  static gateEntrySortFieldsArrays = [
    { key: 'Invoice Number', name: 'invoiceNumber' },
    { key: 'Gate In D&T', name: 'gateInDate' },
    { key: 'Gate Out D&T', name: 'gateOutDate' },
    { key: 'Order ID', name: 'fullWmpoNumber' },
    { key: 'Invoice Date', name: 'invoiceDate' },
    { key: 'Vehicle Number', name: 'vehicleNumber' },
    { key: 'Vehicle Type', name: 'vehicleType' },
    { key: 'Transporter', name: 'serviceProviderIDName' },
    { key: 'Carrier Name', name: 'equipmentID' },
    { key: 'LR Number', name: 'waybillNumber' },
    { key: 'Invoice Qty', name: 'invoiceTotalQuantity' },
    { key: 'Assigned To', name: 'assignedTo' },
    { key: 'Assigned By', name: 'assignedBy' },
    { key: 'Start Time', name: 'startDate' },
    { key: 'End Time', name: 'endDate' },
    { key: 'Completed By', name: 'completedBy' },
    { key: 'Planned Completion Date', name: 'plannedCompletionDate' },
    { key: 'Unloading Status', name: 'status' },
    { key: 'Assigned To', name: 'qualityCheckAssignedTo' },
    { key: 'Assigned By', name: 'qualityCheckAssignedBy' },
    { key: 'Start Time', name: 'qualityCheckStartDate' },
    { key: 'End Time', name: 'qualityCheckEndDate' },
    { key: 'Completed By', name: 'qualityCheckCompletedBy' },
    { key: 'Planned Completion Date', name: 'grnPlannedCompletionDate' },
    { key: 'Quality Check Status', name: 'status' },
    { key: 'Assigned To', name: 'grnAssignedTo' },
    { key: 'Assigned By', name: 'grnAssignedBy' },
    { key: 'Start Time', name: 'grnStartDate' },
    { key: 'End Time', name: 'grnEndDate' },
    { key: 'Completed By', name: 'grnCompletedBy' },
    { key: 'Planned Completion Date', name: 'grnPlannedCompletionDate' },
    { key: 'GRN Status', name: 'status' },
    { key: 'Status', name: 'status' },
  ]
}

export class salesOrderrHeader {
  static salesOrderHeaderSearchOnKeys = ['fullWmsoNumber', 'confirmedBy',
    'customersCustomerName', 'customersCustomerAddress', 'customerName',
    'wareHouseTransferDestinationInfoWareHouseName', 'supplierName'];

  static salesOrderLinesSearchOnKeys = ['fullWmsoNumber', 'productID', 'productName', 'wmsoLineNumber',
    'brandName', 'orderQuantity', 'productDescription', 'expectedDeliveryDate', 'batchNumbers'];

  static salesOrderByIDSearchOnKeysKeys = ['fullWmsoNumber', 'productID', 'productName', 'wmsoLineNumber',
    'brandName', 'orderQuantity', 'productDescription', 'expectedDeliveryDate', 'batchNumbers'];



  /*   static salesOrderByIDSearchOnKeysKeys = ['fullWmsoNumber', 'productID', 'productName', 'wmsoLineNumber',
  'brandName', 'orderQuantity', 'expectedDeliveryDate', 'batchNumbers', 'productDescription', 'exBondNumber', 'exBondDate']; */
  static salesOrderHeaderSortFieldsArrays = [
    { key: 'WMSO Number', name: 'fullWmsoNumber' },
    { key: 'Customer/Supplier/Warehouse', name: 'customerName' },
    { key: 'Customer/Supplier/Warehouse', name: 'supplierName' },
    { key: 'Customer/Supplier/Warehouse', name: 'wareHouseTransferDestinationInfoWareHouseName' },
    { key: 'Customer Customer Name', name: 'customersCustomerName' },
    { key: 'Customer Customer Address', name: 'customersCustomerAddress' },
    { key: 'Order Type', name: 'orderType' },
    { key: 'Order Date', name: 'soOrderDate' },
    { key: 'Confirmed By', name: 'confirmedBy' },
    { key: 'Confirmed Date', name: 'confirmedDate' },
    { key: 'Total Amount', name: 'totalNetAmount' },
    { key: 'Status', name: 'status' },

  ]
  static salesOrderLinesSortFieldsArrays = [
    { key: 'SO Number', name: 'fullWmsoNumber' },
    { key: 'SO Line No', name: 'wmsoLineNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand', name: 'brandName' },
    { key: 'UOM', name: 'shipmentUnit' },
    { key: 'Customer Order Quantity', name: 'orderQuantity' },
    { key: 'Batch Numbers', name: 'batchNumbers' },
    { key: 'Serial Number', name: 'serialNumbers' },
    { key: 'Expected Delivery Date', name: 'expectedDeliveryDate' },
  ]
  static createSalesOrderSortFieldsArrays = [
    { key: 'WMSO Number', name: 'wmsoLineNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand', name: 'brandName' },
    { key: 'Batch Number', name: 'batchno' },
    { key: 'UOM', name: 'shipmentUnit' },
    { key: 'Customer Order Quantity', name: 'orderUnitPrice' },
    { key: 'Serial Number', name: 'serialNumber' },
    { key: 'Unit Price', name: 'orderUnitPrice' },
    { key: 'Discount', name: 'discount' },
    { key: 'Gross Amount', name: 'grossAmount' },
    { key: 'Tax Amount', name: 'taxAmount' },
    { key: 'Amount', name: 'netAmount' },
    { key: 'Location Names', name: 'locationName' },
    { key: 'Ex Bond Number', name: 'exBondNumber' },
    { key: 'Ex Bond Date', name: 'exBondDate' },
    { key: 'Remarks', name: 'remarks' },
  ]
}

export class ValueAddedServiceScrees {

  static packingSearchOnKeys = ['fullWmsoNumber', 'supplierName',
    'wareHouseTransferDestinationInfoWareHouseName', 'customerName', 'customersCustomerName', 'customersCustomerAddress',
    'confirmedBy']
  static rePackingSearchOnKeys = ['fullWmsoNumber', 'supplierName',
    'wareHouseTransferDestinationInfoWareHouseName', 'customerName', 'customersCustomerName', 'customersCustomerAddress',
    'confirmedBy']
  static coPackingSearchOnKeys = ['fullWmsoNumber', 'supplierName',
    'wareHouseTransferDestinationInfoWareHouseName', 'customerName', 'customersCustomerName', 'customersCustomerAddress',
    'confirmedBy']
  static labelingSearchOnKeys = ['fullWmsoNumber', 'supplierName',
    'wareHouseTransferDestinationInfoWareHouseName', 'customerName', 'customersCustomerName', 'customersCustomerAddress',
    'confirmedBy']

  static valueAddedServicePackingSortFieldArrays = [
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'Assigned To', name: 'assignedTo' },
    { key: 'Assigned By', name: 'assignedBy' },
    { key: 'UOM', name: 'shipmentUnit' },
    { key: 'Order Qty', name: 'quantity' },
    { key: 'Picked Qty', name: 'pickedQuantity' },
    { key: 'Convertion Type', name: 'convertionType' },
    { key: 'Repacked Quantity', name: 'repackedQty' },
    { key: 'Gain weight (loss/gain)', name: 'grossWeight' },
    { key: 'Packing Type', name: 'packingType' },
    { key: 'Packing Material', name: 'packingMeterial' },
    { key: 'Start Time', name: 'startDate' },
    { key: 'End Time', name: 'endDate' },
    { key: 'Completed By', name: 'completedBy' },
    { key: 'Planned Completion Date', name: 'plannedCompletionDate' },
  ]
  static valueAddedServiceRePackingSortFieldArrays = [
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'Assigned To', name: 'assignedTo' },
    { key: 'Assigned By', name: 'assignedBy' },
    { key: 'UOM', name: 'shipmentUnit' },
    { key: 'Order Qty', name: 'quantity' },
    { key: 'Picked Qty', name: 'pickedQuantity' },
    { key: 'Convertion Type', name: 'convertionType' },
    { key: 'Repacked Quantity', name: 'repackedQty' },
    { key: 'Gain weight (loss/gain)', name: 'grossWeight' },
    { key: 'Packing Type', name: 'packingType' },
    { key: 'Packing Material', name: 'packingMeterial' },
    { key: 'Start Time', name: 'startDate' },
    { key: 'End Time', name: 'endDate' },
    { key: 'Completed By', name: 'completedBy' },
    { key: 'Planned Completion Date', name: 'plannedCompletionDate' },
  ]
  static valueAddedServiceCoPackingSortFieldArrays = [
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'Assigned To', name: 'assignedTo' },
    { key: 'Assigned By', name: 'assignedBy' },
    { key: 'UOM', name: 'shipmentUnit' },
    { key: 'Order Qty', name: 'quantity' },
    { key: 'Picked Qty', name: 'pickedQuantity' },
    { key: 'Convertion Type', name: 'convertionType' },
    { key: 'Repacked Quantity', name: 'repackedQty' },
    { key: 'Gain weight (loss/gain)', name: 'grossWeight' },
    { key: 'Packing Type', name: 'packingType' },
    { key: 'Packing Material', name: 'packingMeterial' },
    { key: 'Start Time', name: 'startDate' },
    { key: 'End Time', name: 'endDate' },
    { key: 'Completed By', name: 'completedBy' },
    { key: 'Planned Completion Date', name: 'plannedCompletionDate' },
  ]
  static valueAddedServiceLabellingSortFieldArrays = [
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'Assigned To', name: 'assignedTo' },
    { key: 'Assigned By', name: 'assignedBy' },
    { key: 'UOM', name: 'shipmentUnit' },
    { key: 'Order Qty', name: 'quantity' },
    { key: 'Picked Qty', name: 'pickedQuantity' },
    { key: 'Convertion Type', name: 'convertionType' },
    { key: 'Repacked Quantity', name: 'repackedQty' },
    { key: 'Gain weight (loss/gain)', name: 'grossWeight' },
    { key: 'Packing Type', name: 'packingType' },
    { key: 'Packing Material', name: 'packingMeterial' },
    { key: 'Start Time', name: 'startDate' },
    { key: 'End Time', name: 'endDate' },
    { key: 'Completed By', name: 'completedBy' },
    { key: 'Planned Completion Date', name: 'plannedCompletionDate' },
  ]

}


export class shipmentOrderHead {

  static shipmentHeaderSearchOnKeys = ['fullWmsoNumber', 'supplierName',
    'wareHouseTransferDestinationInfoWareHouseName', 'customerName', 'customersCustomerName', 'customersCustomerAddress',
    'confirmedBy']
  static shipmentLinesSearchOnKeys = ['fullWmsoNumber', 'productID', 'productName', 'wmsoLineNumber', 'brandName',
    'orderQuantity', 'expectedDeliveryDate', 'batchNumber', 'productDescription']

  static shipmentByIDSearchOnKeys = ['fullWmsoNumber', 'productID', 'productName', 'productIDName', 'wmsoLineNumber', 'brandName',
    'orderQuantity', 'expectedDeliveryDate', 'batchNumber', 'productDescription']

  static shipmentByManagementByIDSearchOnKeys = ['fullWmsoNumber', 'productID', 'productName', 'wmsoLineNumber', 'brandName',
    'orderQuantity', 'expectedDeliveryDate', 'batchNumber', 'productDescription']

  /*   static shipmentByIDSearchOnKeys = ['fullWmsoNumber', 'productID', 'productName', 'wmsoLineNumber', 'brandName',
      'orderQuantity', 'expectedDeliveryDate', 'batchNumber', 'productDescription',
      'bondNumber', 'bondDate', 'exBondNumber', 'exBondDate',
      'referenceBillOfEntryNumber', 'referenceBillOfEntryDate',
      'referenceBondNumber', 'referenceBondDate', 'exBondNumber', 'exBondDate']
  
    static shipmentByManagementByIDSearchOnKeys = ['fullWmsoNumber', 'productID', 'productName', 'wmsoLineNumber', 'brandName',
      'orderQuantity', 'expectedDeliveryDate', 'batchNumber', 'productDescription',
      'bondNumber', 'bondDate', 'exBondNumber', 'exBondDate',
      'referenceBillOfEntryNumber', 'referenceBillOfEntryDate',
      'referenceBondNumber', 'referenceBondDate', 'exBondNumber', 'exBondDate']
    static shipmentHeaderSortFieldArrays = [
      { key: 'SO Number', name: 'wmsoLineNumber' },
      { key: 'Customer/Supplier/Warehouse', name: 'customerName' },
      { key: 'Customer/Supplier/Warehouse', name: 'supplierName' },
      { key: 'Customer/Supplier/Warehouse', name: 'wareHouseTransferDestinationInfoWareHouseName' },
      { key: 'Customers Customer Name', name: 'customersCustomerName' },
      { key: 'Customers Customer Address', name: 'customersCustomerAddress' },
      { key: 'Order Type', name: 'orderType' },
      { key: 'Order Date', name: 'salesOrderDate' },
      { key: 'Closed By', name: 'closedBy' },
      { key: 'Closed Date', name: 'closedDate' },
      { key: 'Status', name: 'status' }
       'bondNumber', 'bondDate', 'exBondNumber', 'exBondDate',
       'referenceBillOfEntryNumber','referenceBillOfEntryDate',
       'referenceBondNumber','referenceBondDate','exBondNumber','exBondDate'] */

  /*      static shipmentByManagementByIDSearchOnKeys = ['fullWmsoNumber', 'productID', 'productName', 'wmsoLineNumber', 'brandName',
       'orderQuantity', 'expectedDeliveryDate', 'batchNumber', 'productDescription',
        'bondNumber', 'bondDate', 'exBondNumber', 'exBondDate',
        'referenceBillOfEntryNumber','referenceBillOfEntryDate',
        'referenceBondNumber','referenceBondDate','exBondNumber','exBondDate'] */
  static shipmentHeaderSortFieldArrays = [
    { key: 'SO Number', name: 'wmsoLineNumber' },
    { key: 'Customer/Supplier/Warehouse', name: 'customerName' },
    { key: 'Customer/Supplier/Warehouse', name: 'supplierName' },
    { key: 'Customer/Supplier/Warehouse', name: 'wareHouseTransferDestinationInfoWareHouseName' },
    { key: 'Customers Customer Name', name: 'customersCustomerName' },
    { key: 'Customers Customer Address', name: 'customersCustomerAddress' },
    { key: 'Order Type', name: 'orderType' },
    { key: 'Order Date', name: 'salesOrderDate' },
    { key: 'Closed By', name: 'closedBy' },
    { key: 'Closed Date', name: 'closedDate' },
    { key: 'Status', name: 'status' }
  ]
  static shipmentLinesSortFieldsrArrays = [
    { key: 'SO Number', name: 'fullWmsoNumber' },
    { key: 'SO Line No', name: 'wmsoLineNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand', name: 'brandName' },
    { key: 'Batch Number', name: 'batchNumber' },
    { key: 'UOM', name: 'shipmentUnit' },
    { key: 'Customer Order Quantity', name: 'orderQuantity' },
    { key: 'Dispatch Quantity', name: 'totalCustomerDispatchQuantity' },
    { key: 'Serial Number', name: 'serialNumbers' },
    { key: 'Expected Delivery Date', name: 'expectedDeliveryDate' },
    { key: 'Dispatch Date', name: 'dispatchDate' },
  ]
}

export class shipmentOrderManagementHeader {
  static shipmentOrderManagementKeys = ['wmsoLineNumber', 'productID', 'productName', 'shipmentUnit', 'orderQuantity'
    , 'customerDispatchQuantity', 'batchNumber', 'serialNumber', 'orderUnitPrice', 'discount', 'grossAmount', 'taxAmount', 'netAmount'
    , 'eta', 'dispatchDate', 'invoiceDate', 'vehicleNumber', 'wayBillNumber', 'remarks']

  static shipmentOrderManagementArrays = [
    { key: 'WMSO Line Number', name: 'wmsoLineNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'UOM', name: 'UOM' },
    { key: 'Customer Order Quantity', name: 'CustomerOrderQuantity' },
    { key: 'Shipped Quantity', name: 'shippedQuantity' },
    { key: 'Batch Number', name: 'batchNumber' },
    { key: 'OrderUnitPrice', name: 'OrderUnitPrice' },
    { key: 'Discount', name: 'Discount' },
    { key: 'Gross Amount', name: 'grossAmount' },
    { key: 'Tax Amount', name: 'taxAmount' },
    { key: 'Amount', name: 'Amount' },
    { key: 'Expected Delivery Date', name: 'expectedDeliveryDate' },
    { key: 'Dispatch Date', name: 'dispatchDate' },
    { key: 'Invoice Number & Date', name: 'invoiceNumber&Date' },
    { key: 'Vehicle Number', name: 'vehicleNumber' },
    { key: 'WayBill Number', name: 'wayBillNumber' },
    { key: 'Remarks', name: 'Remarks' }
  ]
}
export class PaginationConstants {
  static product = ['productID', 'productName', 'hsnCode', 'productConfiguration', 'upcEANNumber', 'productType', 'productClass'
    , 'inventoryUnit', 'receivingUnit', 'productIDName', "productCategoryName",
    'shipmentUnit', 'length', 'lengthUom', 'breadth', 'breadthUom', 'height', 'heightUom', 'volume', 'volumeUom', 'weight', 'weightUom'
    , 'maxDimension', 'maxDimensionUom', 'price'
    , 'palletQuantity', 'palletSize', 'currency', 'brandNames', 'purchasePrice', 'avgCostPrice', 'salePrice', 'mrp', 'productMerge', 'expiryFlag', 'mergeType',
    'leadTime', 'moq'
    , 'pickingDirection', 'location', 'reOrderPoint', 'qualityCheck', 'creationDate', 'shelfLife', 'pricingMethod',
    'wareHouseIDName', 'blockInventory', 'markup', 'packageType', 'markupType', 'status'];

  static productBySupplierSearchKeys = ['productID', 'productName', 'productDescription', 'moq', 'brandNames', 'price']

  static productByCustomerSearchOnKeys = ['productID', 'productName', 'brandNames', 'markupType']

  static productBindArray = [
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' }, { key: 'Product Configuration ', name: 'productConfiguration' },
    { key: 'DFS Code', name: 'dfsCode' }, { key: 'Type', name: 'type' },
    { key: 'HSN Code', name: 'hsnCode' }, { key: 'UPC EANNumber', name: 'upcEANNumber' },
    { key: 'Product Type', name: 'productType' },
    { key: 'Product Class', name: 'productClass' }, { key: 'Product CategoryName ', name: 'productCategoryName' },
    { key: 'Inventory Unit', name: 'inventoryUnit' }, { key: 'Receiving Unit', name: 'receivingUnit' },
    { key: 'Picking Unit', name: 'pickingUnit' }, { key: 'productIDName', name: 'productIDName' },
    { key: 'Shipment Unit', name: 'shipmentUnit' }, { key: 'length ', name: 'length' },
    { key: 'Length UOM', name: 'lengthUom' }, { key: 'Breadth', name: 'breadth' },
    { key: 'Breadth UOM', name: 'breadthUom' }, { key: 'Height', name: 'height' },
    { key: 'Height UOM', name: 'heightUom' },
    { key: 'Volume', name: 'volume' }, { key: 'Volume UOM ', name: 'volumeUom' },
    { key: 'Weight', name: 'weight' }, { key: 'Weight UOM', name: 'weightUom' },
    { key: 'Max Dimension', name: 'maxDimension' }, { key: 'Max Dimension UOM', name: 'maxDimensionUom' },
    { key: 'Pallet Quantity', name: 'palletQuantity' },
    { key: 'Pallet Size', name: 'palletSize' }, { key: 'Currency', name: 'currency' },
    { key: 'Brand Configure', name: 'brandNames' }, { key: 'Purchase Price', name: 'purchasePrice' },
    { key: 'Sale Price', name: 'salePrice' }, { key: 'MRP', name: 'mrp' },
    { key: 'Avg Cost Price', name: 'avgCostPrice' }, { key: 'Product Merge ', name: 'productMerge' },
    { key: 'Expiry Flag', name: 'expiryFlag' }, { key: 'Merge Type', name: 'mergeType' },
    { key: 'Lead Time', name: 'leadTime' }, { key: 'MOQ', name: 'moq' },
    { key: 'Picking Direction', name: 'pickingDirection' }, { key: 'location ', name: 'location' },
    { key: 'Reorder Point', name: 'reOrderPoint' }, { key: 'Quality Check', name: 'qualityCheck' },
    { key: 'Creation Date', name: 'creationDate' }, { key: 'Shelf Life', name: 'shelfLife' }, { key: 'Pricing Method', name: 'pricingMethod' },
    { key: 'Sales Tax', name: 'taxNamePercentage' }, { key: 'Source WareHouse Tax', name: 'wareHouseIDName' }, { key: 'Sales Tax', name: 'taxNamePercentage' },
    { key: 'Block Inventory', name: 'blockInventory' }, { key: 'Markup', name: 'markup' }, { key: 'Status', name: 'status' }, { key: 'Markup Type', name: 'markupType' }
  ]

  static goodsReceiptInBoundScreen = ['invoiceNumber', 'invoiceDate', 'qualityCheckAssignedTo', 'qualityCheckAssignedDate',
    'qualityCheckAssignedBy', 'assignedTo', 'assignedBy', 'completedBy', 'shipmentOrderAssignedTo', 'shipmentOrderAssignedDate',
    'shipmentOrderAssignedBy', 'shipmentOrderAssignedDate', 'grnAssignedTo', 'grnAssignedDate', 'grnAssignedBy', 'grnCompletedBy',
    'supplierIDName', 'customerIDName', 'wareHouseIDName'];

  static goodsReceiptOutBoundScreen = ['invoiceNumber', 'invoiceDate', 'qualityCheckAssignedTo', 'qualityCheckAssignedDate',
    'qualityCheckAssignedBy', 'assignedTo', 'assignedBy', 'completedBy', 'shipmentOrderAssignedTo', 'shipmentOrderAssignedDate',
    'shipmentOrderAssignedBy', 'shipmentOrderAssignedDate', 'grnAssignedTo', 'grnAssignedDate', 'grnAssignedBy', 'grnCompletedBy',
    'supplierIDName', 'customerIDName', 'wareHouseIDName'];

  static inventory = ['productID', 'productName', 'productIDName', 'inventoryUnit', 'brandName', 'mfgDate', 'expiryDate', 'batchNumber', 'quantityInventoryUnit',
    'availableQuantity', 'reservedQuantity', 'supplierIDName', 'locationName', 'zoneName', 'rackName', 'levelName', 'columnName', 'packingRemarks',
    'productPurchasePrice', 'currency', 'productType', 'productClass', 'createdDate', 'productCategoryName']

  static inventoryBindArray =
    [
      { key: 'Inventory ID', name: 'fullInventoryID' },
      { key: 'Product ID', name: 'productID' },
      { key: 'Product Name', name: 'productName' },
      { key: 'Product Description', name: 'productDescription' },
      { key: 'UOM', name: 'inventoryUnit' },
      { key: 'Brand Name', name: 'brandName' },
      { key: 'Mfg Date', name: 'mfgDate' },
      { key: 'Expiry Date', name: 'expiryDate' },
      { key: 'Batch Number', name: 'batchNumber' },
      { key: 'Serial Number', name: 'serialNumber' },
      { key: 'Quantity Inventory Unit', name: 'quantityInventoryUnit' },
      { key: 'Available Quantity', name: 'availableQuantity' },
      { key: 'Reserved Quantity', name: 'reservedQuantity' },
      { key: 'Supplier/Warehouse IDName', name: 'supplierIDName' },
      { key: 'Supplier/Warehouse IDName', name: 'wareHouseTransferSourceInfoWareHouseIDName' },
      { key: 'locationName', name: 'locationName' },
      { key: 'Zone Name', name: 'zoneName' },
      { key: 'Rack Name', name: 'rackName' },
      { key: 'Level Name', name: 'levelName' },
      { key: 'Column', name: 'columnName' },
      { key: 'Remarks', name: 'packingRemarks' },
      { key: 'Product Purchase Price', name: 'productPurchasePrice' },
      { key: 'product Category', name: 'productCategoryName' },
      { key: 'Product Type', name: 'productType' },
      { key: 'Product Class', name: 'productClass' },
      { key: 'Bill Of Entry No', name: 'billOfEntryNumber' },
      { key: 'Bill Of Entry Date', name: 'billOfEntryDate' },
      { key: 'Invoice Number', name: 'invoiceNumber' },
      { key: 'Invoice Date', name: 'invoiceDate' },
      { key: 'Created Date', name: 'createdDate' },
      { key: 'Inventory Availabilty', name: 'inventoryAvailability' },
      { key: 'Currency', name: 'currency' },
    ]
  static inventoryTransaction = ['inventoryTransactionID', 'supplierIDName', 'customerIDName', 'wareHouseIDName', 'orderID',
    'lineNumber', 'inventoryUnit', 'productIDName', 'productDescription', 'brandName', 'quantity', 'mfgDate', 'expiryDate', 'batchNumber',
    'productPurchasePrice', 'productSalePrice', 'zoneName',
    'rackName', 'levelName', 'columnName', 'locationName']

  static inventoryTransactionBindArray = [{ key: 'Transaction ID', name: 'inventoryTransactionID' }, { key: 'Supplier/Customer/Warehouse', name: 'supplierIDName' },
  { key: 'Supplier/Customer/Warehouse', name: 'customerIDName' }, { key: 'Supplier/Customer/Warehouse ', name: 'wareHouseIDName' },
  { key: 'Order ID', name: 'orderID' }, { key: 'Line No', name: 'lineNumber' },
  { key: 'Inventory Unit', name: 'inventoryUnit' }, { key: 'Currency', name: 'currency' }, { key: 'Product ID/Name', name: 'productIDName' },
  { key: 'Product Description', name: 'productDescription' }, { key: 'Brand Name ', name: 'brandName' },
  { key: 'Quantity', name: 'quantity' }, { key: 'Mfg Date', name: 'mfgDate' },
  { key: 'Expiry Date', name: 'expiryDate' }, { key: 'Product Sale Price', name: 'productSalePrice' }, { key: 'Product Purchase Price', name: 'productPurchasePrice' },
    , { key: 'Batch Number', name: 'batchNumber' }, { key: 'Zone Name', name: 'zoneName' }, { key: 'Rack Name', name: 'rackName' },
  { key: 'Level Name', name: 'levelName' }, { key: 'Column Name', name: 'columnName' }, { key: 'Location Name', name: 'locationName' }, { key: 'Product Category', name: 'productCategoryName' }, { key: 'Product Category 1', name: 'productSubCategory1Name' },
  { key: 'Product Category 2', name: 'productSubCategory2Name' }, { key: 'Product Category 3', name: 'productSubCategory3Name' }]

  static cycleCountingTableKeys = ['cycleCountingNumber', 'cycleCountingCode', 'criteriaType', 'actualCycleCountingDate', 'plannedCycleCountingDate'];

  static cycleCountingTableArrays = [
    { key: 'Cycle Counting Code', name: 'cycleCountingCode' },
    { key: 'Criteria Type', name: 'criteriaType' },
    { key: 'Planned Schedule Date', name: 'plannedScheduleDate' },
    { key: 'Actual Cycle Counting Date', name: 'actualCycleCountingDate' },
    { key: 'Created By', name: 'createdBy' },
    { key: 'Created Date', name: 'createdDate' },
    { key: 'Confirmed By', name: 'confirmedBy' },
    { key: 'Confirmed Date', name: 'confirmedDate' },
    { key: 'Status', name: 'status' }
  ]

  static wareHouseTransferHeaderSearchOnKeys = ['fullWareHouseTransferTransactionID', 'fullWmsoNumber',
    'destinationWareHouseInfoWareHouseID', 'createdDate', 'totalNetAmount', 'deliveryExpDate'];

  static wareHouseTransferLinesSearchOnKeys = ['productID', 'productName', 'fullWareHouseTransferTransactionID', 'fullWmsoNumber',
    'productDescription', 'expectedDeliveryDate', 'createdBy', 'sourceWareHouseInfoWareHouseID'];

  static wareHouseTransferHeaderSortKeys = [
    { key: 'Transaction ID', name: 'fullWareHouseTransferTransactionID' },
    { key: 'Order Number', name: 'fullWmsoNumber' },
    { key: 'Destination Warehouse', name: 'wareHouseID' },
    { key: 'Created Date', name: 'createdDate' },
    { key: 'Dispatch Date', name: 'deliveryExpDate' },
    { key: 'Total Amount', name: 'totalNetAmount' },
    { key: 'Order Status', name: 'status' }
  ]
  static wareHouseTransferLinesSortKeys = [
    { key: 'Transaction ID', name: 'fullWareHouseTransferTransactionID' },
    { key: 'Order Number', name: 'fullWmsoNumber' },
    { key: 'Source Warehouse', name: 'wareHouseIDName' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Specification', name: 'productDescription' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'UOM', name: 'shipmentUnit' },
    { key: 'Customer Order Quantity', name: 'customerOrderQuantity' },
    { key: 'Dispatch Quantity', name: 'orderQuantity' },
    { key: 'Expected Delivery Date', name: 'expectedDeliveryDate' },
    { key: 'Created By', name: 'createdBy' },


  ]

  static invoiceHeaderSearchOnKeys = ['fullWmsoNumber', 'status', 'customerName', 'supplierName', 'wareHouseTransferDestinationInfoWareHouseName']

  static invoiceLinesSearchOnKeys = ['fullWmsoNumber', 'productID', 'productName', 'shipmentUnit', 'brandName',
    'productDescription', 'batchNumber']

  static invoiceByIDSearchOnKeys = ['fullWmsoNumber', 'productID', 'productName', 'shipmentUnit', 'brandName', 'customerDispatchQuantity',
    'productDescription', 'batchNumber']


  static invoiceHeaderSortFieldsArray = [
    { key: 'SO Number', name: 'fullWmsoNumber' },
    { key: 'Invoice Number', name: 'fullInvoiceNumber' },
    { key: 'Customer/Supplier/Warehouse', name: 'customerName' },
    { key: 'Customer/Supplier/Warehouse', name: 'wareHouseTransferDestinationInfoWareHouseName' },
    { key: 'Customer/Supplier/Warehouse', name: 'supplierName' },
    { key: 'Customers Customer Name', name: 'customersCustomerName' },
    { key: 'Customers Customer Address', name: 'customersCustomerAddress' },
    { key: 'Total Amount', name: 'totalNetAmount' },
    { key: 'Status', name: 'status' }
  ]
  static invoiceLinesSortFieldsArray = [
    { key: 'SO Number', name: 'fullWmsoNumber' },
    { key: 'SO Line No', name: 'wmsoLineNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'UOM', name: 'shipmentUnit' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'Batch Number', name: 'batchNumber' },
    { key: 'Shipment Quantity', name: 'customerDispatchQuantity' },
    { key: 'Expected Delivery Date', name: 'expectedDeliveryDate' },
    { key: 'Dispatch Date', name: 'dispatchDate' },
    { key: 'Amount', name: 'netAmount' }
  ]

  static goodsReceiptHeaderSearchOnKeys = ['fullWmpoNumber', 'supplierName', 'wareHouseTransferSourceInfoWareHouseName',
    'customerName', 'receiptType', 'receiptDate', 'customersSupplierName', 'customersSupplierAddress', 'wareHouseName',
    'status'];

  static goodsReceiptLinesSearchOnKeys = ['fullWmpoNumber', 'productID', 'productName', 'brandName',
    'orderedQuantity', 'eta', 'grnDate', 'productDescription'];

  static goodsReceiptByIDSearchOnKeys = ['fullWmpoNumber', 'productID', 'productName', 'brandName',
    'orderedQuantity', 'eta', 'grnDate', 'productDescription']



  static goodsReceiptHeaderArray = [
    { key: 'PO Number', name: 'wmpoNumber' },
    { key: 'Invoice Number', name: 'invoiceNumber' },
    { key: 'Customer/Supplier/Warehouse', name: 'customerName' },
    { key: 'Customer/Supplier/WareHouse', name: 'wareHouseTransferSourceInfoWareHouseName' },
    { key: 'Customer/Supplier/WareHouse', name: 'supplierName' },
    { key: 'Customers Supplier Name', name: 'customersSupplierName' },
    { key: 'Customers Supplier Address', name: 'customersSupplierAddress' },
    { key: 'Receipt Type', name: 'receiptType' },
    { key: 'Receipt Date', name: 'receiptDate' },
    { key: 'Closed By', name: 'closedBy' },
    { key: 'Closed Date', name: 'closedDate' },
    { key: 'Status', name: 'status' }
  ]
  static goodsReceiptLinesArray = [
    { key: 'PO Number', name: 'fullWmpoNumber' },
    { key: 'PO Line No', name: 'poLineNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'UOM', name: 'receivingUnit' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'Order Quantity', name: 'receiptType' },
    { key: 'Total Supplier Received Quantity', name: 'totalSupplierReceivedQuantity' },
    { key: 'Total Supplier Return Quantity', name: 'totalSupplierReceivedQuantity' },
    { key: 'Serial Number', name: 'serialNumbers' },
    { key: 'GRN Date', name: 'grnDate' },
    { key: 'ETA', name: 'eta' },
  ]

  static goodsReceiptByIDArray = [
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'GRN Date', name: 'grnDate' },
    { key: 'MFG Date', name: 'mfgDate' },
    { key: 'Expiry Date', name: 'expiryDate' },
    { key: 'Batch No', name: 'batchNumber' },
    { key: 'Serial Number', name: 'serialNumbers' },
    { key: 'Supplier IDName', name: 'supplierIDName' },
    { key: 'Order Quantity', name: 'orderedQuantity' },
    { key: 'Supplier Receivable Quantity', name: 'supplierReceivableQuantity' },
    { key: 'Supplier Received Qty', name: 'supplierReceivedQuantity' },
    { key: 'Received Qty', name: 'receivedQuantity' },
    { key: 'Order Unit Price', name: 'orderUnitPrice' },
    { key: 'Receive Location Names', name: 'receiveLocationAllocation' },
    { key: 'Supplier Return Quantity', name: 'supplierReturnQuantity' },
    { key: 'Returned Qty', name: 'returnQuantity' },
    { key: 'Return Location AllocationType', name: 'returnLocationAllocationType' }
  ]

  static goodsReceiptManagementByIDArray = [
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'UOM', name: 'receivingUnit' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'GRN Date', name: 'grnDate' },
    { key: 'MFG Date', name: 'mfgDate' },
    { key: 'Expiry Date', name: 'expiryDate' },
    { key: 'Batch No', name: 'batchNumber' },
    { key: 'Serial Number', name: 'serialNumbers' },
    { key: 'Shipped Quantit', name: 'shippedQuantity' },
    { key: 'Order Unit Price', name: 'orderUnitPrice' },
    { key: 'Gross Amount', name: 'grossAmount' },
    { key: 'Tax Amount', name: 'taxAmount' },
    { key: 'Discount', name: 'discount' },
    { key: 'Amount', name: 'netAmount' },
    { key: 'Supplier Received Qty', name: 'supplierReceivedQuantity' },
    { key: 'Supplier Return Qty', name: 'supplierReturnQuantity' },
    { key: 'Supplier Receivable Qty', name: 'supplierReceivableQuantity' },
    { key: 'Total Supplier Received Quantity', name: 'totalSupplierReceivedQuantity' },
    { key: 'Total Supplier Return Quantity', name: 'totalSupplierReturnQuantity' },
    { key: 'Invoice No & Date', name: 'invoiceNumber' },
    { key: 'LR Number', name: 'lrNumber' },
    { key: 'Vehicle Number', name: 'vehicleNumber' },
    { key: 'Container Number', name: 'equipmentIDName' },
    { key: 'BOE No & Date', name: 'billOfEntryNumber' },
    { key: 'BOL No & Date', name: 'billOfLandingNumber' },
    { key: 'Bond Number', name: 'bondNumber' },
    { key: 'Bond Date', name: 'bondDate' },
    { key: 'Receive Location Name', name: 'locationName' },
    { key: 'Receive Location AllocationType', name: 'receiveLocationAllocationType' },
    { key: 'Return Location Name', name: 'locationName' },
    { key: 'Return Location AllocationType', name: 'returnLocationAllocationType' },
    { key: 'Location Availablity', name: 'returnLocationAllocationType' }

  ]



  static goodsReceiptManagementHeader = ['productID', 'productName', 'productDescription', 'receivingUnit', 'grnDate', 'mfgDate', 'expiryDate', 'batchNumber', 'serialNumbers',
    'shippedQuantity', 'orderUnitPrice', 'grossAmount', 'taxAmount', 'discount', 'netAmount', 'supplierReceivedQuantity', 'supplierReturnQuantity', 'supplierReceivableQuantity',
    'totalSupplierReceivedQuantity', 'totalSupplierReturnQuantity', 'invoiceNumber', 'invoiceDate', 'wayBillNumber', 'vehicleNumber', 'containerNumber', 'billOfEntryNumber',
    , 'billOfEntryDate', 'billOfLandingNumber', 'line.billOfLandingDate', 'locationName', 'returnLocationAllocationType'];

  static goodsReceiptManagementArray = [
    { key: 'PO Number', name: 'wmpoNumber' },
    { key: 'Invoice Number', name: 'invoiceNumber' },
    { key: 'Customer/Supplier/WareHouse', name: 'customerName' },
    { key: 'Customer/Supplier/WareHouse', name: 'wareHouseName' },
    { key: 'Customer/Supplier/WareHouse', name: 'supplierName' },
    { key: 'customers Supplier Name', name: 'customersSupplierName' },
    { key: 'customers Supplier Address', name: 'customersSupplierAddress' },
    { key: 'Receipt Type', name: 'receiptType' },
    { key: 'Receipt Date', name: 'receiptDate' },
    { key: 'Closed By', name: 'closedBy' },
    { key: 'Closed Date', name: 'closedDate' },
    { key: 'status', name: 'status' }
  ]
  static cycleCountingBindArray = [
    { key: 'Product IDName', name: 'productIDName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'Location', name: 'locationName' },
    { key: 'Available Quantity', name: 'availableQuantity' },
    { key: 'Quantity Inventory Unit', name: 'quantityInventoryUnit' },
    { key: 'Inventory Unit', name: 'inventoryUnit' },
    { key: 'Variance', name: 'variance' },
    { key: 'Variance %', name: 'variancePercentage' }, { key: 'Price', name: 'price' }]

  static createcycleCountingArray = [
    { key: 'Product IDName', name: 'productIDName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Location', name: 'locationName' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'Available Quantity', name: 'availableQuantity' },
    { key: 'Quantity Inventory Unit', name: 'quantityInventoryUnit' },
    { key: 'Inventory Unit', name: 'inventoryUnit' },
    { key: 'Variance', name: 'variance' },
    { key: 'Variance %', name: 'variancePercentage' },
    { key: 'Price', name: 'price' }]

  static location = ['wareHouseName', 'rackName', 'zoneName', 'columnName', 'levelName', 'position', 'locationName', 'capacity',
    'storageType', 'locationMerge', 'locationAvailability', 'locationSpaceStatus', 'totalSpace', 'usableSpace', 'length', 'lengthUom',
    'breadth', 'breadthUom', 'height', 'heightUom', 'weight', 'weightUom', 'allowableWeight', 'allowableWeightUom', 'maxDimension',
    'maxDimensionUom', 'allowableMaxDimension', 'allowableMaxDimensionUom', 'usableSpaceCheck', 'weightCheck', 'maxDimensionCheck', 'blockLocation']
  /*  static location = ['wareHouseName','zoneName','rackName', 'columnName','levelName','position','locationName','capacity',
  'storageType','locationMerge','locationAvailability','locationSpaceStatus','totalSpace','usableSpace','length','lengthUom',
  'breadth','breadthUom','height','heightUom','weight','weightUom','allowableWeight','allowableWeightUom','maxDimension',
  'maxDimensionUom','allowableMaxDimension','allowablemaxDimensionUom','usableSpaceCheck','weightCheck','maxDimensionCheck','blockLocation',
  'status']  */


  static locationBindArray = [
    { key: 'Warehouse Name', name: 'wareHouseName' },
    { key: 'Zone Name', name: 'zoneName' },
    { key: 'Rack Name', name: 'rackName' },
    { key: 'Column Name', name: 'columnName' },
    { key: 'Level Name', name: 'levelName' },
    { key: 'Position', name: 'position' },
    { key: 'Location Name', name: 'locationName' },
    { key: 'Capacity', name: 'capacity' },
    { key: 'Storage Type', name: 'storageType' },
    { key: 'Location Merge', name: 'locationMerge' },
    { key: 'Location Availability', name: 'locationAvailability' },
    { key: 'Location Space Status', name: 'locationSpaceStatus' },
    { key: 'Total Space', name: 'totalSpace' },
    { key: 'Usable Space', name: 'usableSpace' },
    { key: 'Length', name: 'length' },
    { key: 'Length UOM', name: 'lengthUom' },
    { key: 'Breadth', name: 'breadth' },
    { key: 'Breadth UOM', name: 'breadthUom' },
    { key: 'Height', name: 'height' },
    { key: 'Height UOM', name: 'heightUom' },
    { key: 'Weight', name: 'weight' },
    { key: 'Weight UOM', name: 'weightUom' },
    { key: 'Allowable Weight', name: 'allowableWeight' },
    { key: 'Allowable Weight UOM', name: 'allowableWeightUom' },
    { key: 'Max Dimension', name: 'maxDimension' },
    { key: 'Max Dimension UOM', name: 'maxDimensionUom' },
    { key: 'Allowable Max Dimension', name: 'allowableMaxDimension' },
    { key: 'Allowable Max Dimension UOM', name: 'allowablemaxDimensionUom' },
    { key: 'Usable Space Check', name: 'usableSpaceCheck' },
    { key: 'Weight Check', name: 'weightCheck' },
    { key: 'Max Dimension Check', name: 'maxDimensionCheck' },
    { key: 'Block Location', name: 'blockLocation' },
    { key: 'Status', name: 'status' }
  ]
  /* Picking Rport */

  static pickingReportSortKeysArray = [ 
   
    { key: 'Supplier/Customer/Warehouse IDName', name: 'supplierIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'customerIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'wareHouseTransferSourceInfoWareHouseIDName' },
    { key: 'Picking Number', name: 'pickingNumber' },
    { key: 'WMSO Number', name: 'wmsoNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'UOM', name: 'inventoryUnit' },
    { key: 'Picking Quantity', name: 'pickedQuantity' },
    { key: 'Total Actual Picking Quantity', name: 'totalActualPickingQuantity' },
    { key: 'Balanced Picking Quantity', name: 'balancePickingQuantity' },
    { key: 'Expiry Date', name: 'expiryDate' },
    { key: 'Manufacture Date', name: 'mfgDate' },
    { key: 'Batch Number', name: 'batchNumber' },
    { key: 'Zone Name', name: 'zoneName' },
    { key: 'Rack Name', name: 'rackName' },
    { key: 'Level Name', name: 'levelName' },
    { key: 'Column Name', name: 'columnName'},
    { key: 'Location Name', name: 'locationName'},
    { key: 'Invoice Number', name: 'invoiceNumber'},
    { key: 'Invoice Date', name: 'invoiceDate'},
    { key: 'BOE No', name: 'billOfEntryNumber'},
    { key: 'BOE Date', name: 'billOfEntryDate'},
    { key: 'Bond Number', name: 'bondNumber'},
    { key: 'Bond Date', name: 'bondDate'},
    { key: 'Created On', name: 'createdDate'},
    { key: 'Start Time', name: 'startTime'},
    { key: 'End Time', name: 'endTime'},
    { key: 'Planned Completion Date',name: 'plannedCompletionDate' },
    { key: 'Status', name: 'status' }
  ]
  static pickingReportSearchArray = ['pickingNumber', 'wmsoNumber', 'supplierIDName', 'productID', 'productName', 'productDescription'
    , 'brandName', 'expiryDate', 'mfgDate', 'batchNumber', 'zoneName', 'rackName', 'levelName', 'columnName', 'locationName', 'invoiceNumber', 'invoiceDate', 'billOfEntryNumber'
    , 'billOfEntryDate', 'bondNumber', 'bondDate', 'createdDate', "exBondNumber", "exBondDate"]

  /* static pickingReportSearchArray = ['pickingNumber', 'wmsoNumber', 'supplierIDName', 'productID', 'productName', 'productDescription'
    , 'brandName', 'expiryDate', 'mfgDate', 'batchNumber', 'zoneName', 'rackName', 'levelName', 'columnName', 'locationName', 'invoiceNumber', 'invoiceDate', 'billOfEntryNumber'
    , 'billOfEntryDate', 'bondNumber', 'bondDate', 'createdDate'] */

  /* PutAway Report  */

  static putaAwayReportSortKeysArray = [
    { key: 'Putaway No', name: 'putawayNumber' },
    { key: 'WMPO Number', name: 'wmpoNumber' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'supplierIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'customerIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'wareHouseTransferSourceInfoWareHouseIDName' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'Brand Name', name: 'brandName' },
    { key: 'UOM', name: 'inventoryUnit' },
    { key: 'Putaway Quantity', name: 'quantity' },
    { key: 'Total Actual Putaway Quantity', name: 'totalActualPutawayQuantity' },
    { key: 'Balanced Putaway Quantity', name: 'balancePutawayQuantity' },
    { key: 'Expiry Date', name: 'expiryDate' },
    { key: 'Manufacture Date', name: 'mfgDate' },
    { key: 'Batch Number', name: 'batchNumber' },
    { key: 'Zone Name', name: 'zoneName' },
    { key: 'Rack Name', name: 'rackName' },
    { key: 'Level Name', name: 'levelName' },
    { key: 'Column Name', name: 'columnName' },
    { key: 'Location Name', name: 'locationName' },
    { key: 'Invoice Number', name: 'invoiceNumber' },
    { key: 'Invoice Date', name: 'invoiceDate' },
    { key: 'BOE No', name: 'billOfEntryNumber' },
    { key: 'BOE Date', name: 'billOfEntryDate' },
    { key: 'Bond Number', name: 'bondNumber' },
    { key: 'Bond Date', name: 'bondDate' },
    { key: 'Created On', name: 'createdDate' },
    { key: 'Start Time', name: 'startTime' },
    { key: 'End Time', name: 'endTime' },
    { key: 'Planned Completion Date', name: 'plannedCompletionDate' },
    { key: 'Status', name: 'status' }
  ]
  static putawayReportSearchArray = ['putawayNumber', 'fullWmpoNumber', 'supplierIDName', 'productID', 'productName', 'productDescription'
    , 'brandName', 'expiryDate', 'mfgDate'
    , 'batchNumber', 'zoneName', 'rackName', 'levelName', 'columnName', 'locationName', 'invoiceNumber', 'invoiceDate', 'billOfEntryNumber'
    , 'billOfEntryDate', 'bondNumber', 'bondDate', 'createdDate']


  static putawaySearchArray = ["wmpoNumber", "fullPutawayNumber", "fullWmpoNumber", "putawayNumber",
    "putawayExecutive", "productID", "productName", "productDescription", "brandName", "mfgDate", "expiryDate",
    "batchNumber", "supplierIDName", "customerIDName", "wareHouseTransferSourceInfoWareHouseIDName", "zoneName",
    "rackName", "levelName", "columnName", "locationName", "invoiceDate", "invoiceNumber", "billOfEntryDate",
    "billOfEntryNumber", "bondDate", "bondNumber"]

  static shipmentReportOrderSortFieldsrrays = [
    { key: 'Supplier/Customer/Warehouse IDName', name: 'supplierIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'customerIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'wareHouseIDName' },
    { key: 'Dispatch Date', name: 'dispatchDate' },
    { key: 'WMSO Number', name: 'wmsoNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'Product Description', name: 'productDescription' },
    { key: 'UOM', name: 'inventoryUnit' },
    { key: 'Product Category Name', name: 'productCategoryName' },
    { key: 'Order Quantity', name: 'quantity' },
    { key: 'Shipped Quantity', name: 'dispatchQuantity' },
    { key: 'Total Dispatched Quantity', name: 'totalCustomerDispatchQuantity' },
    { key: 'Batch Number', name: 'batchNumbers' },
    { key: 'Invoice Date', name: 'invoiceDate' },
    { key: 'Customers Customer Name', name: 'customersCustomerName' },
    { key: 'Customers Customer Address', name: 'customersCustomerAddress' },
    { key: 'Order Unit Price', name: 'orderUnitPrice' },
    { key: 'Tax Amount', name: 'taxAmount' },
    { key: 'Gross Amount', name: 'grossAmount' },
    { key: 'Net Amount', name: 'netAmount' },
    { key: 'Invoice Number', name: 'invoiceNumber' },
    { key: 'BOE No', name: 'referenceBillOfEntryNumber' },
    { key: 'BOE Date', name: 'referenceBillOfEntryDate' },
    { key: 'Bond Number', name: 'referenceBondNumber' },
    { key: 'Bond Date', name: 'referenceBondDate' },
    { key: 'Ex Bond Number', name: 'exBondNumber' },
    { key: 'Ex Bond Date', name: 'exBondDate' },
    { key: 'Order Date', name: 'orderDate' }
  ]
  static shipmentReportSearchOnKeysArray = ["productID", "productName", "productIDName", "productCategoryName", "wareHouseID",
    "wareHouseName", "wareHouseIDName", "supplierID", "supplierName", "supplierIDName", "organizationID", "organizationName", "organizationIDName",
    "wareHouseTransferDestinationInfoWareHouseTransferTransactionID", "wareHouseTransferDestinationInfoWareHouseID", "wareHouseTransferDestinationInfoWareHouseName",
    "wareHouseTransferDestinationInfoWareHouseIDName", "customerID", "customerName", "customerIDName", "orderQuantity", "expectedDeliveryDate", "batchNumber",
    "brandName", "wmsoLineNumber", "productDescription", "shipmentUnit"]
  static GoodsReceivingReportSortKeysArray = [

    { key: 'GRN Date', name: 'grnDate' },
    { key: 'WMPO Number', name: 'wmpoNumber' },
    { key: 'Reference PO Number', name: 'referencePONumber' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'supplierIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'customerIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'wareHouseIDName' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'UOM', name: 'receivingUnit' },
    { key: 'Order Quantity', name: 'orderedQuantity' },
    { key: 'Total Supplier Received Quantity', name: 'totalSupplierReceivedQuantity' },
    { key: 'Total Supplier Return Quantity', name: 'totalSupplierReturnQuantity' },
    { key: 'Total Supplier Receivable Quantity', name: 'supplierReceivableQuantity' },
    { key: 'Order Unit Price', name: 'orderUnitPrice' },
    { key: 'Tax Amount', name: 'taxAmount' },
    { key: 'Gross Amount', name: 'grossAmount' },
    { key: 'Net Amount', name: 'netAmount' },
    { key: 'Customer’s Supplier Name', name: 'customersSupplierName' },
    { key: 'Customer’s Supplier Address', name: 'customersSupplierAddress' },
    { key: 'Status', name: 'status' }
  ]
  static GoodsReceivingReportSearchOnKeys = ["fullWmpoNumber", "productID", "productName", "productIDName", "productCategoryName", "wareHouseID",
    "wareHouseName", "wareHouseIDName", "supplierID", "supplierName", "supplierIDName", "organizationID", "organizationName", "organizationIDName",
    "wareHouseTransferSourceInfoWareHouseTransferTransactionID", "wareHouseTransferSourceInfoWareHouseID", "wareHouseTransferSourceInfoWareHouseName",
    "wareHouseTransferSourceInfoWareHouseIDName", "customerID", "customerName", "customerIDName", "grnDate", "status", "brandName"];
  /*  static putawaySearchArray = ["wmpoNumber", "fullPutawayNumber", "fullWmpoNumber", "putawayNumber",
     "putawayExecutive", "productID", "productName", "productDescription", "brandName", "mfgDate", "expiryDate",
     "batchNumber", "supplierIDName", "customerIDName", "wareHouseTransferSourceInfoWareHouseIDName", "zoneName",
     "rackName", "levelName", "columnName", "locationName", "invoiceDate", "invoiceNumber", "billOfEntryDate",
     "billOfEntryNumber", "bondDate", "bondNumber"] */

  static pickingSearchArray = ["wmsoNumber", "fullPickingNumber", "fullWmsoNumber", "pickingNumber",
    "pickingExecutive", "productID", "productName", "productDescription", "brandName", "mfgDate", "expiryDate",
    "batchNumber", "supplierIDName", "customerIDName", "wareHouseTransferDestinationInfoWareHouseIDName", "zoneName",
    "rackName", "levelName", "columnName", "locationName", "invoiceDate", "invoiceNumber", "billOfEntryDate",
    "billOfEntryNumber", "bondDate", "bondNumber"]


  static GrnSummaryReportSortKeysArray = [
    { key: 'Supplier/Customer/Warehouse IDName', name: 'supplierIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'customerIDName' },
    { key: 'Supplier/Customer/Warehouse IDName', name: 'wareHouseIDName' },
    { key: 'WMPO Number', name: 'wmpoNumber' },
    { key: 'PO Reference Number', name: 'referenceInvoiceNumber' },
    { key: 'Product ID', name: 'productID' },
    { key: 'Product Name', name: 'productName' },
    { key: 'UOM', name: 'receivingUnit' },
    { key: 'Product Category', name: 'productCategoryName' },
    { key: 'Order Quantity', name: 'orderedQuantity' },
    { key: 'Total Supplier Received Quantity', name: 'totalSupplierReceivedQuantity' },
    { key: 'Total Supplier Return Quantity', name: 'totalSupplierReturnQuantity' },
    { key: 'Serial Number', name: 'serialNumbers' },
    { key: 'Batch Number', name: 'batchNumber' },
    { key: 'MFG Date', name: 'mfgDate' },
    { key: 'Expiry Date', name: 'expiryDate' },
    { key: 'Invoice Number', name: 'invoiceNumber' },
    { key: 'Invoice Date', name: 'invoiceDate' },
    { key: 'LR Number', name: 'lrNumber' },
    { key: 'Vehicle Number', name: 'vehicleNumber' },
    { key: 'Vehicle Type', name: 'vehicleType' },
    { key: 'BOE No', name: 'billOfEntryNumber' },
    { key: 'Bond Number', name: 'bondNumber' },
    { key: 'Bond Date', name: 'bondDate' },
    { key: 'BOL No', name: 'billOfLandingNumber' },
    { key: 'BOE Date', name: 'billOfEntryDate' },
    { key: 'BOL Date', name: 'billOfLandingDate' },
    { key: 'Customers Supplier Name', name: 'customersSupplierName' },
    { key: 'Customers supplier Address', name: 'customersSupplierAddress' },
    { key: 'Created By', name: 'createdBy' },
    { key: 'GRN Date', name: 'grnDate' },
    { key: 'Order Unit Price', name: 'orderUnitPrice' },
    { key: 'Tax Amount', name: 'taxAmount' },
    { key: 'Gross Amount', name: 'grossAmount' },
    { key: 'Net Amount', name: 'netAmount' },
    { key: 'Status', name: 'status' }
  ]

  static grnSummaryReportSearchKeys = ["productID"]
  /* Inventory Adjusment main screens search On keys  */
  static inventoryAdjustmentSearchOnKeysWithPagination = ["productID", "productName", "productIDName",
    "adjustedQuantity", "reason", "fullInventoryAdjustmentTransactionID", "inventoryUnit"]

  static internalTransferSearchOnKeysWithPagination = ["productID", "productName", "productIDName", "assignedTo", "assignedBy",
    "sourceLocationName", "destinationLocationName", "reason", "fullInternalTransferTransactionID"]

  /* issues Inventory main Screen Under Planning Modules */
  static issueInventorySearchOnKeysWithPagination = ["productID", "productName", "productDescription", "fullInventoryIssueTransactionID"]

  /*   static internalTransferSearchOnKeysWithPagination = ["productID", "productName", "productIDName", 
  "productCategoryName", "wareHouseID",
      "wareHouseName", "wareHouseIDName", "organizationID", "organizationName", "organizationIDName", "reason", "assignedTo", "assignedBy",
      "sourceLocationID", "sourceLocationName", "destinationLocationID", "destinationLocationName"] */
}

