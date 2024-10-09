
export const NavConstants = {
  INBOUND: '/inbound',
  OUTBOUND: '/outbound',
  MASTERDATA: 'masterdata',
  LOGIN: '/login',
  SERVER_ERROR: '/v1/serverError',
  PURCHASE_ORDER: '/v1/inbound/maintainPurchaseOrder',
  CREATE_PURCHASE_ORDER: '/v1/inbound/createPurchaseOrder',
  // GOODS_RECEIVING_NOTE: '/inbound/goodsReceivingNote',
  GOODS_RECEIVING: '/v1/inbound/maintainGoodsReceipt',
  SALES_RETURNS: 'v1/inbound/sales-returns',
  EDIT_GOODS_RECEIPT: '/v1/inbound/editGoodsReceipt',
  CROSS_DOCKING: '/v1/inbound/crossDocking',
  GOODS_RECEIVING_NOTE: '/v1/inbound/goodsReceiptNote',
  PURCHASERETURN: '/v1/outbound/purchase-returns',
  SALESRETURNS: '/v1/inbound/salesReturns',
  FLOW_THRU: '/inbound/flowThru',
  PUTAWAY: '/v1/inbound/putaway',
  DAMAGED_STOCK: '/v1/inbound/damagedStock',
  REPLACEMENT_ORDER: '/v1/outbound/replacementOrder',
  SALES_ORDER: '/v1/outbound/maintainSalesOrder',
  CREATE_SALES_ORDER: '/v1/outbound/createSalesOrder',
  PICKING: '/v1/outbound/picking',
  SHIPMENT_ORDER: '/v1/outbound/maintainShipmentOrder',
  EDIT_SHIPMENT_ORDER: '/v1/outbound/editShipmentOrder',
  REPLENISHMENT: '/v1/outbound/replenishmentHistory',
  PURCHASE_RETURNS: '/purchaseReturns',
  PURCHASE_RETURN: '/purchaseReturns',
  ADVANCE_SHIPMENT_NOTIFICATION: '/outbound/advanceShipmentNotify',
  INVOICING: '/v1/outbound/maintainInvoicing',
  Outbound_Gate_Entry: '/v1/outbound/outboundGateEntry',
  ISSUE_INVENTORY: '/issueInventory',
  PLANNING_ISSUE_INVENTORY: '/issueInventory',
  OUTBOUND_RETURNS: '/returns/outboundReturns',
  INBOUND_CAPACITY_PLANNING: '/v1/planning/inboundCapacityPlanning',
  EMPLOYEE_SCHEDULE: '/v1/workforce/employeeSchedule',
  EMPLOYEE_PERFORMANCE: '/v1/workforce/employeePerformance',
  EMPLOYEE_TASK: '/v1/workforce/employeeTask',
  MAINTENANCE_PLANNING: '/v1/planning/maintenance_planning',
  PUTAWAY_PLANNING: '/v1/planning/employeeSchedule/putawayPlanning',
  PICKING_PLANNING: '/v1/planning/employeeSchedule/pickingPlanning',
  OUTBOUND_SCHEDULING: '/planning/outboundScheduling',
  OUTBOUND_CAPACITY_PLANNING: '/v1/planning/outboundCapacityPlanning',
  WAVE_PLANNING: '/planning/wavePlanning',
  INBOUND_QUALITY_INSPECTION: '/quality/inboundQualityInspection',
  OUTBOUND_QUALITY_INSPECTION: '/quality/outboundQualityInspection',
  INVENTORY: '/v1/inventory',
  INVENTORY_RECEIVING: '/v1/inventory/inventoryReceiving',
  INTERNAL_TRANSFERS: '/v1/inventory/internalTransfers',
  CYCLE_COUNTING: '/v1/inventory/maintaincyclecounting',
  // WAREHOUSE_TRANSFER: '/v1/inventory/wareHouseTransfer',
  WAREHOUSE_TRANSFER: '/wareHouseTransfer',
  INBOUND_WAREHOUSE_TRANSFER: '/wareHouseTransfer',
  OUTBOUND_WAREHOUSE_TRANSFER: '/wareHouseTransfer',
  PLANNING_WAREHOUSE_TRANSFER: '/wareHouseTransfer',

  PHYSICAL_INVENTORY: '/v1/inventory/physicalInventory',
  ABC_Analysis: '/v1/inventory/abcAnalysis',
  AGEING_REPORT: '/v1/inventory/ageingReport',
  // OVER_ALL_INVENTORY:'/v1/inventory/overAllInventory',
  INVENTORY_ADJUSTMENTS: '/v1/inventory/inventoryAdjustments',
  //ABC_ANALYSIS: '/v1/inventory/maintainAbcAnalysis',
  KANBAN: '/inventory/kanban',
  HOURS_ACCOUNTING: '/accounting/hoursAccounting',
  EXPENSE_ACCOUNTING: '/accounting/expenseAccounting',
  WAREHOUSE_LAYOUT: '/warehouseLayout',
  KPI_CONFIGURATIONS: '/kpiConfigurations',
  REPORT_CONFIGURATIONS: '/reportConfigurations',
  WAREHOUSE_PERMISSIONS: '/warehousePermissions',
  PARAMETER_CONFIGURATION: '/parameterConfigurations',
  PROCESS_CONFIGURATION: '/processConfigurations',
  VALUE_ADDED_SERVICES: '/valueAddedServices',
  PACKING: '/v1/vas/packing',
  CO_PACKING: '/v1/vas/co-packing',
  RE_PACKING: '/v1/vas/re-packing',
  LABELLING: '/v1/vas/labelling',
  BILLING_PO: '/v1/vas/billing-po',
  BILLING_PO_INVOICE: '/v1/vas/billing-po-invoice',
  SPACE_UTILIZATION: '/v1/vas/spaceUtilization',
  SPACE_UTILIZATION_BILLING: '/v1/vas/spaceUtilizationBilling',
  SCHEDULER_SCREEN: '/v1/vas/schedulerScreen',
  PRODUCT_BARCODE: '/v1/barcode/productConfig',
  PROCESS_BARCODE: '/v1/barcode/processConfig',
  USER_BARCODE_CONFIG: '/v1/barcode/userConfig',
  INWARD_CHECKLIST: '/v1/inbound/Inward',
  OUTWARD_CHECKLIST: '/v1/outbound/outward',
  THEME_CONFIG: '/config/themeConfig',
  INTEGRATION: '',
  PURCHASE_REQUEST: '/v1/inbound/purchase-request',
}
export const MasterDataNavConstants = [
  {
    name: 'Product',
    route: '/masterdata/product',
    header: 'Master Data List'
  },
  {
    name: 'Supplier',
    route: '/masterdata/supplier'
  },
  {
    name: 'Product By Supplier',
    route: '/masterdata/productBySupplier'
  },
  {
    name: 'Customer',
    route: '/masterdata/customer'
  },
  {
    name: 'Product By Customer',
    route: '/masterdata/productByCustomer'
  },
  {
    name: 'Warehouse',
    route: '/masterdata/warehouse'
  },
  {
    name: 'Zone',
    route: '/masterdata/zone'
  },
  {
    name: 'Column',
    route: '/masterdata/column'
  },
  {
    name: 'Rack',
    route: '/masterdata/rack'
  },

  {
    name: 'Level',
    route: '/masterdata/level'
  },
  {
    name: 'Location',
    route: '/masterdata/location'
  },
  {
    name: 'Vehicle',
    route: '/masterdata/vehicle'
  },
  {
    name: 'Equipment',
    route: '/masterdata/equipment'
  },
  {
    name: 'Executives',
    route: '/masterdata/warehouseTeam'
  },
  {
    name: 'Transporter',
    route: '/masterdata/Transporator'
  },
  {
    name: 'UOM Conversion',
    route: '/masterdata/uom-conversion'
  },
  {
    name: 'Product Strategy',
    route: '/masterdata/productStrategy'
  },
  {
    name: 'Putaway Strategy',
    route: '/masterdata/putawayStrategy'
  },
  {
    name: 'Picking Strategy',
    route: '/masterdata/pickingStrategy'
  },
  {
    name: 'Replenishment',
    route: '/masterdata/replenishment'
  },

  {
    name: 'Bill of Resources',
    route: '/masterdata/billOfResources'
  },
  {
    name: 'Bill To Address',
    route: '/masterdata/billToAddress'
  },
  {
    name: 'Vehicle By Transporter',
    route: '/masterdata/vehicclebytransporator'
  },
  {
    name: 'ABC-XYZ Class',
    route: '/masterdata/abcAnalysisClass'
  },
  {
    name: 'Organization',
    route: '/masterdata/organization'
  },
  {
    name: 'Tax',
    route: '/masterdata/tax'
  },
  {
    name: 'Product Category Group',
    route: '/masterdata/productCategoryGroup'
  },
  {
    name: 'State',
    route: '/masterdata/state'
  },
  {
    name: 'Promotions',
    route: '/masterdata/promotion'
  },
  {
    name: 'Promotion Policy',
    route: '/masterdata/promotion-policy'
  },
];
export const ReportsNavConstants = [
  {
    name: 'Goods Receiving',
    route: '/reports/goodsReceiving',
    header: 'Reports List'
  },
  {
    name: 'Putaway',
    route: '/reports/putaway'
  },
  {
    name: 'Inventory Summary',
    route: '/reports/inventory'
  },
  {
    name: 'Picking',
    route: '/reports/picking'
  },
  // {
  //     name: 'Pick List',
  //     route: '/reports/picklist'
  // },
  {
    name: 'Cycle Counting',
    route: '/reports/cycleCounting'
  },
  {
    name: 'Inventory Adjustments',
    route: '/reports/inventoryAdjustments'
  },
  {
    name: 'Open Sales Order',
    route: '/reports/openSalesOrder'
  },
  {
    name: 'Shipment',
    route: '/reports/shipment'
  },
  /*  {
       name: 'Returns',
       route: '/reports/returnOrder'
   }, */
  {
    name: 'Shipment Order',
    route: '/reports/Newshipmentorder'
  },
  {
    name: 'GRN Stage Transaction',
    route: '/reports/grnStageTransaction'
  },
  {
    name: 'GRN Stage Summary',
    route: '/reports/grnStageSummary'
  },
  {
    name: 'GRN Summary',
    route: '/reports/grnSummary'
  },
  // {
  //     name: 'Inventory',
  //     route: '/reports/inventoryReport'
  // },
  {
    name: 'Inventory by Location',
    route: '/reports/inventoryByLocationReport'
  },
  {
    name: 'Inventory by Product',
    route: '/reports/inventoryByProductReport'
  },
  {
    name: 'Inventory Transaction',
    route: '/reports/inventoryTransactionReport'
  },
  {
    name: 'Inventory Transaction Details',
    route: '/reports/inventoryTransactionDetailsReport'
  },
  {
    name: 'GRN History',
    route: '/reports/grnHistory'
  },
  {
    name: 'Shipment History',
    route: '/reports/shipmentHistory'
  },
  {
    name: 'Space Utilization History',
    route: '/reports/spaceutilizationHistory'
  },
  {
    name: 'Space Utilization',
    route: '/reports/spaceutilizationReports'
  },
  {
    name: 'Inventory',
    route: '/reports/inventory-report'
  },
  {
    name: 'ABC Anaiysis',
    route: '/reports/spaceutilizationReports'
  },
  {
    name: 'Ageing Report',
    route: '/reports/ageingReport'
  },
  {
    name: 'Location Availability',
    route: '/reports/locationAvailability'
  },
  {
    name: 'Putaway History',
    route: '/reports/putawayHistory'
  },
  {
    name: 'Picking History',
    route: '/reports/pickingHistory'
  }
];

export const ConfigurationNavConstants = [
  {
    name: 'Parameters',
    route: '/config/parameters',
    header: 'Configurations'
  },
  {
    name: 'Process Groups',
    route: '/config/processGroups'
  },
  {
    name: 'Process Permissions',
    route: '/config/processPermissions'
  },
  {
    name: 'Login Monitor',
    route: '/config/loginMonitor'
  },
  {
    name: 'KPI Config',
    route: '/config/kpi'
  },
  {
    name: 'Reports Config',
    route: '/config/report'
  },
  {
    name: 'Masters Config',
    route: '/config/master'
  },
  {
    name: 'User Config',
    route: '/config/user'
  },
  {
    name: 'Warehouse Config',
    route: '/config/warehouse'
  },
  {
    name: 'Process Config',
    route: '/config/inventory'
  },
  {
    name: 'Cycle Counting Config',
    route: '/config/cycleCounting'
  },
  {
    name: 'Notification Config',
    route: '/config/notificationConfig'
  },
  {
    name: 'Scheduler',
    route: '/config/schedularScreen'
  },
  {
    name: 'Application URL Config',
    route: '/config/applicationConfig'
  },
  {
    name: 'Space Zone Config',
    route: '/config/spaceZoneConfig'
  },
  {
    name: 'Theme Config',
    route: '/config/themeConfig'
  },
  {
    name: 'Login Theme Config',
    route: '/config/logintheme-config'
  },
  {
    name: 'Status Config',
    route: '/config/statusConfig'
  },
  {
    name: 'Prefix Config',
    route: '/config/orderSequenceConfig'
  },
  {
    name: 'Financial Config',
    route: '/config/financialConfig'
  }
];

export const dashboardsNavConstants = [
  {
    name: 'Overall Dashboard',
    route: '/dashboard/overAllDashboard',
    header: 'Configurations'
  },
  {
    name: 'Space Utilization',
    route: '/dashboard/spaceUtilization'
  },
  {
    name: 'Inbound',
    route: '/dashboard/inbound'
  },
  {
    name: 'Outbound',
    route: '/dashboard/outbound'
  },
  {
    name: 'Sales Analytics',
    route: '/dashboard/salesAnalytics'
  },
  {
    name: 'Purchase Analytics',
    route: '/dashboard/purchaseAnalytics'
  },
  {
    name: 'ABC Analysis',
    route: '/dashboard/AbcAnalysis'
  },
  {
    name: 'Inventory',
    route: '/dashboard/Inventory'
  },
  {
    name: 'Order Rate',
    route: '/dashboard/orderRateTypeDashboard'
  },
  {
    name: 'Employee',
    route: '/dashboard/employeeInboundOutBoundDashboard'
  },
  {
    name: 'Daily Operations',
    route: '/dashboard/dailyOperationBasedDashboard'
  },

];
