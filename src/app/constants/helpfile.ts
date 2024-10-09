export const HELP_FILE = {
    MAINTAIN_PURCHASEORDER: {
        MAIN: 'List of purchase orders are displayed with order details in first table and product details in second table.',
        LIST: [
            { ELEM: 'When Order is saved Action column in table shows edit option for editing the order, by Clicking on edit option it navigates to create purchase order screen to edit or confirm purchase order' },
            { ELEM: 'When the order is confirmed it displays as PO Raised.' },
            { ELEM: 'Status of order is displayed as Open when order created, after closing order status changed to Closed' },
            { ELEM: 'Orders filtered by receipt date using date filter, order status selecting dropdown opened, closed, all.' },
            { ELEM: 'Create purchase order is an option for creating new purchase order.' },
            { ELEM: ' Upload Excel option is to upload data through excel.	' },
            { ELEM: ' Download Excel option is to download all purchase order details through excel. ' },
        ]
    },
    CREATE_PURCHASEORDER: {
        MAIN: 'Create Purchase Order with supplier details and product details to receive products from Supplier.',
        LIST: [
            { ELEM: 'Search for the Supplier in the Purchase order Header Panel. By selecting Supplier, fields like Supplier Name, Tax group, Terms of Payments and Currency are displayed reference to supplier from Supplier Master and more details of supplier displayed in Edit more supplier details panel.' },
            { ELEM: 'Receipt Date displays current date, Receipt type as Purchase Order by default.' },
            { ELEM: 'Ship To Address as warehouse address by default. To edit Shipping details in Edit Shipping details panel by clicking on Update button or can edit the Shipping details directly through link Edit more shipping details. Link navigates to Warehouse Master by this can edit details of shipping which or not in the edit more shipping details panel also. ' },
            { ELEM: 'Enter PO Reference No, PO Reference No A, PO Reference No B, Po Delivery Date and click on save button.' },
            { ELEM: 'To edit supplier details in Edit supplier details panel by clicking on Update button or can edit the supplier details directly through link Edit more supplier details. Link navigates to Supplier master by this can edit details of supplier which or not in the edit more supplier details panel also' },
            { ELEM: 'Recent order products displayed in the Recent History panel reference to supplier' },
            { ELEM: 'Search for the product in the Purchase order Lines Panel. By selecting product, fields like product name, UPC EAN Number, Receiving Unit, Unit Price are displayed reference to product from product Master and more details of product displayed in Edit more product details panel.' },
            { ELEM: 'Enter ETA, Order Quantity, Discount, Taxes, Remarks and click on save button. Purchase order line is displayed in the below table. ' },
            { ELEM: 'Purchase order lines allows you to add multiple products. ' },
            { ELEM: 'To edit Product details in Edit product details panel by clicking on Update button or you can edit the product details directly through link Edit more product details. Link navigates to Product Master by this can edit details of product which or not in the edit more product details panel also.' },
            { ELEM: 'Click on Save button for saving order. After saving order can be edited.' },
            { ELEM: 'Click on Raise PO button to confirm the order. After Raise PO order cannot be edited and page navigates to Maintain PO.' },
        ]
    },
    MAINTAIN_GOODSRECEIVING: {
        MAIN: 'List of Goods receiving orders are displayed with order details in header table and product details in lines table.',
        LIST: [
            { ELEM: 'When Order is saved for receiving the order, by Clicking on PO number it navigates to goods receiving screen to receive' },
            { ELEM: 'When the product is received location is allocated for that particular product.' },
            { ELEM: 'Status of order is displayed as Open when the order is created, after closing the order status will be changed to Closed.' },
            { ELEM: 'Orders filtered by receipt date using date filter, order status selecting dropdown opened, closed, all.' },
            { ELEM: 'By using search option also data filtered.' },
            { ELEM: 'When Order is saved Action column in table shows edit option for editing the order, by Clicking on edit option it navigates to goods receiving screen to edit or generate putaway' },
            { ELEM: 'When the order is generated putaway it displays as Putaway generated.' },
            { ELEM: 'Status of order is displayed as Open when order created, after closing order status changed to Closed' },
            { ELEM: 'Orders filtered by receipt date using date filter, order status selecting dropdown opened, closed, all.' },
            { ELEM: 'By using search option also data filtered.' },
            { ELEM: 'While Receiving and returning if locations are not available, products are received but Allocate button is displayed in table for allocated products received or to returned.  ' },
            { ELEM: 'By using reset button the selected dates can be reset' },
            { ELEM: 'Upload Excel option is to upload data through excel.' },
            { ELEM: 'Download Excel option is to download all goods receiving details through excel.' },
        ]
    },
    CREATE_GOODSRECEIVING: {
        MAIN: 'Receive products from suppliers without purchase order.',
        LIST: [
            { ELEM: ' 	Enter GRN details like Supplier ID/Name, Reference PO Number, Receipt Date in Goods Receiving Header.' },
            { ELEM: 'In Goods Receiving Lines panel enter Product ID/Name, GRN Date, receiving unit, LR Number, Carrier Name, MFG Date, Expiry Date, Invoice Number, Reference Invoice Number, Waybill Number, Batch number, Receiving unit, Shipped qty, Remarks to update product details after updating it is displayed in below table. All the products are update in the same way.' },
            { ELEM: 'Receive location and Return location are used to select manually locations ' },
            { ELEM: 'When we click on Receive location and Return location, popup window will open enter required quantity and click on update to allocate quantity. ' },
            { ELEM: 'Click on generate putaway to generate putaway for received products. ' },
        ]
    },
    EDIT_GOODS_RECEIVING: {
        MAIN: 'Receive products from suppliers against purchase order',
        LIST: [
            { ELEM: 'By clicking on PO Number it navigates to goods receiving screen in goods receiving header panel Supplier ID/Name, WMPO Number ,Receipt Date  updated by default, record displays in goods receiving panel with default Product ID/Name, GRN Date, Receiving unit details and enter LR Number, Carrier Name, MFG Date, Expiry Date, Invoice Number, Reference Invoice Number, Waybill Number, Batch number, Receiving unit, Shipped qty, Remarks to update product details after updating it is displayed in summary table. All the products are update in the same way..' },
            { ELEM: 'Receive location and Return location are used to select automatic locations.' },
            { ELEM: 'While receiving and returning if locations are not available, products are received but Allocate button is displayed in table for allocated products received or to returned. ' },
            { ELEM: 'After receiving the goods inventory is updated with product wise Available quantity' },
            { ELEM: '•Click on close PO invoice generated in Distribution warehouse.' },
        ]
    },


    CREATE_GOODS_RECEIVING: {
        MAIN: 'Receive products from suppliers against purchase order',
        LIST: [
            { ELEM: ' 	Enter GRN details like Supplier ID/Name, Reference PO Number, Receipt Date in Goods Receiving Header.   .' },
            { ELEM: ' 	In Goods Receiving Lines panel enter Product ID/Name, GRN Date, receiving unit, LR Number, Carrier Name, MFG Date, Expiry Date, Invoice Number, Reference Invoice Number, Waybill Number, Batch number, Receiving unit, Shipped qty, Remarks to update product details after updating it is displayed in below table. All the products are update in the same way..' },
            { ELEM: ' 	Receive location and Return location are used to select manually locations .' },
            { ELEM: ' 	When we click on Receive location and Return location, popup window will open enter required quantity and click on update to allocate quantity. .' },
            { ELEM: ' 	Click on generate putaway to generate putaway for received products..' },
        ]
    },
    CROSSDOCKING: {
        MAIN: 'Deliver products to customers directly through crossdocking process',
        LIST: [
            { ELEM: ' List of crossdocking records are displayed with details like WMPO Number, WMPO Line Number, Supplier ID, Supplier Name, Receipt Date, PO Delivery Date, WMSO Number, WMSO Line Number, Customer ID, Customer Name, Sales Order Date, Deliver Expected date, Product ID, Product Name, Order Quantity.' }
        ]
    },
    GATE_ENTRY: {
        MAIN: 'Inward & Outward Process',
        LIST: [
            { ELEM: ' 	Enter invoice number and invoice date and invoice quantity. ' },
            { ELEM: ' 	Assign the employees for Unloading, Quality check and GRN task. ' },
            { ELEM: ' 	Invoice and form 38 and LR/AWB/BL   documents   can be attached through upload. ' },
            { ELEM: ' 	Enter the vehicle details and Click on Save button to save the invoice details.' },
            { ELEM: ' 	Once vehicle details updated Gate In button will be enabled.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By default, created and GateIn Status records displayed in below table. ' },
            { ELEM: ' 	Select the task like Unloading, Quality Check and GRN task.' },
            { ELEM: ' 	Edit option is available. Click on invoice number, details should be populated in form.' },
            { ELEM: ' 	Delete option is available to delete the data at Action column in data table.' },
            { ELEM: ' 	Assign the planned completion time for unloading and quality check and GRN task. ' },
            { ELEM: ' 	Click on start the unloading and quality check task, start time should be recorded.' },
            { ELEM: ' 	After completion of the tasks completed time and completed by should be recorded.  ' },
            { ELEM: ' 	When we start the GRN task start time should be recorded and after complete the goods receiving order need to complete the GRN task. ' },
            { ELEM: ' 	Here We have to scope for select the invoice number, which we save invoice details in inward shipment screen ' },
            { ELEM: ' 	After complete the GRN task click on Gate Out   vehicle is gate outed' },
            { ELEM: ' 	Enter invoice number and invoice date and invoice quantity. ' },
            { ELEM: ' 	Assign the employees for Customer Assigned To, Quality check, Loading and Shipment Assigned To task. ' },
            { ELEM: ' 	Invoice and form 38 and LR/AWB/BL   documents   can be attached through upload. ' },
            { ELEM: ' 	Enter the vehicle details and Click on Save button to save the invoice details.' },
            { ELEM: ' 	Once vehicle details updated Gate In button will be enabled.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By default, created and GateIn Status records displayed in below table. ' },
            { ELEM: ' 	Select the task like Unloading, Quality Check and GRN task.' },
            { ELEM: ' 	Edit option is available. Click on invoice number, details should be populated in form.' },
            { ELEM: ' 	Delete option is available to delete the data at Action column in data table.' },
            { ELEM: ' 	Assign the planned completion time for unloading and quality check and GRN task. ' },
            { ELEM: ' 	Click on start the Customer Assigned To, Quality check  and Loading Task, start time should be recorded.' },
            { ELEM: ' 	After completion of the tasks completed time and completed by should be recorded.  ' },
            { ELEM: ' 	When we start the Shipment task start time should be recorded and after complete the Shipment order need to complete the Shipment task.' },
            { ELEM: ' 	Here We have to scope for select the invoice number, which we save invoice details in inward shipment screen ' },
            { ELEM: ' 	After complete the Shipment task click on Gate Out   vehicle is gate outed.' }

        ]
    },



    PUTAWAY: {
        MAIN: 'Moving of receiving products from receiving location to putaway location by the putaway executives',
        LIST: [
            { ELEM: ' 	Click on WMPO Number dropdown it contains open putaway order numbers list' },
            { ELEM: ' 	Select one order number, list of putaway records are displayed in the table with details like, Putaway Number, Created On, User ID, Putaway Executive, Start Time, End Time, Receipt Type, Product ID/Name, Quantity, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Completed Date, Status.' },
            { ELEM: ' 	click on the start option then get the complete button .' },
            { ELEM: ' 	Putaway quantity moved to the location and Inventory gets updated. ' },
            { ELEM: ' 	Graphical representation of putaway shows number of putaway records complete and incomplete. ' },
        ]
    },
    PURCHASE_REQUEST: {
        MAIN: 'Raise Purchase indents for against Customer Order',
        LIST: [
            { ELEM: 'In Purchase request Pannel select Order Type and Supplier from dropdown.' },
            { ELEM: 'Click on Filter Button, selected Order Type wise Products list displayed Order List table' },
            { ELEM: 'Select Inventory Check box to consider the inventory available quantity for calculating the order quantity to request.' },
            { ELEM: 'Received Quantity: Displayed value is received from Supplier.' },
            { ELEM: 'Incoming Order Quantity: Displayed value from purchase order.' },
            { ELEM: 'Quantity Inventory: Displayed quantity from inventory.' },
            { ELEM: 'Customer Order Quantity: Quantity displayed as per Customer order quantity.' },
            { ELEM: 'Quantity to order: Displayed value is Quantity to be request.' },
            { ELEM: '	Indent Request Table.' },
            { ELEM: '	Product list displayed with quantity for request.' },
            { ELEM: 'Enter the Expected Delivery Date and select the products through check box ' },
            { ELEM: '	Click on Generate PO button new Purchase Order is created.' }
        ]
    },
    MAINTAINSALESORDER: {
        MAIN: 'List of sales orders are displayed with order details in first table and product details in second table.',
        LIST: [
            { ELEM: ' 	When Order is saved Action column in table shows edit option for editing the order, by Clicking on edit option it navigates to sales order screen to edit or confirm order 	' },
            { ELEM: ' 	When the order is confirmed it displays as SO Raised. 	' },
            { ELEM: ' 	Status of order is displayed as Open when order created, after closing order status changed to Closed 	' },
            { ELEM: ' 	Orders filtered by order date using date filter, order status selecting dropdown opened, closed, all. 	' },
            { ELEM: ' 	By using search option also data filtered. 	' },
            { ELEM: 'By using reset button the selected dates can be reset' },
            { ELEM: ' 	Create sales order is an option for creating new sales order.' },
        ]
    },
    CREATESALESORDER: {
        MAIN: 'Create sales order with customer details and product details to deliver products to the customers',
        LIST: [
            { ELEM: ' 	Search for the Customer in the Sales order Header Panel. By selecting Customer, fields like Customer ID, Customer Name, Tax group, Currency and Ship To Address are displayed reference to supplier from Supplier Master and more details of supplier displayed in Edit more supplier details panel. 	' },
            { ELEM: ' 	Order Date displays current date, Order type as Sales Order by default.  	' },
            { ELEM: ' 	Ship From Address as warehouse address by default. To edit Shipping details in Edit Shipping details panel by clicking on Update button or can edit the Shipping details directly through link Edit more shipping details. Link navigates to Warehouse Master by this can edit details of shipping which or not in the edit more shipping details panel also.' },
            { ELEM: ' 	Enter SO Reference No, SO Reference No A, SO Reference No B, Delivery Expected Date, Shipment Time Slot, Mode of Transport and click on save button. 	' },
            { ELEM: ' 	To edit customer details in Edit customer details panel by clicking on Update button or can edit the customer details directly through link Edit more customer details. Link navigates to customer master by this can edit details of customer which or not in the edit more supplier details panel also. 	' },
            { ELEM: ' 	Recent order products displayed in the Recent History panel reference to supplier' },
            { ELEM: ' 	Search for the product in the Sales order Lines Panel. By selecting product, fields like product name, UPC EAN Number, Shipment Unit, Unit Price are displayed reference to product from product Master and more details of product displayed in Edit more product details panel.' },
            { ELEM: ' 	Enter Order Quantity, Discount, Taxes, Remarks and click on save button. sales order line is displayed in the below table. ' },
            { ELEM: ' 	sales order lines allow you to add multiple products. ' },
            { ELEM: ' 	To edit Product details in Edit product details panel by clicking on Update button or you can edit the product details directly through link Edit more product details. Link navigates to Product Master by this can edit details of product which or not in the edit more product details panel also.' },
            { ELEM: ' 	Click on Save button for saving order. After saving order can be edited.' },
            { ELEM: ' 	Click on Raise SO button to confirm the order. After Raise SO order cannot be edited and page navigates to Maintain SO.' },
            { ELEM: ' 	Picking locations are used to select manually locations to pick products' },
        ]
    },
    PICKING: {
        MAIN: 'Moving of Outgoing products from Inventory location to shipment location against sales order by picking executives',
        LIST: [
            { ELEM: ' 	Click on WMSO Number dropdown it contains open picking order numbers list.' },
            { ELEM: ' 	Select one order number, list of picking records is displayed in the table with details like picking Number, Created On, User ID, Picking Executive, Start Time, End Time, Receipt Type, Product ID/Name, Quantity, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Completed Date, Status.' },
            { ELEM: ' 	Picking status is updated by selecting completed option in status dropdown.' },
            { ELEM: ' 	Picking quantity removed from the location and Inventory gets updated. 	' },
            { ELEM: ' 	Click on Pick All button to complete order status.	' },
            { ELEM: ' 	Graphical representation of picking shows number of picking records complete and incomplete. ' },

        ]
    },
    MAINTAIN_SHIPMENT_ORDER: {
        MAIN: 'List of Shipment orders are displayed with order details in first table and product details in second table. By completing all picking records Shipment order is created.',
        LIST: [
            { ELEM: ' 	When Order is open Action shows edit option for editing the order, by Clicking on edit option it navigates to shipment order screen to edit or confirm order.' },
            { ELEM: ' 	When the order is confirmed it displays as Shipment Confirmed.' },
            { ELEM: ' 	Orders filtered by Delivery Expected date using date filter, order status selecting dropdown opened, closed, all.' },
            { ELEM: ' 	By using search option also data filtered.' },
            { ELEM: ' 	Orders filtered by Delivery Expected date using date filter, order status selecting dropdown opened, closed, all.' },
        ]
    },

    EMPWF_PICKING_PLANNING: {
        MAIN: 'PICKING PLANNING',
        LIST: [
            { ELEM: 'Picking Generated records are displayed in below table.' },
            { ELEM: 'Filter the Picking List order wise or zone wise or location wise, click on filter selected filter wise Picking list is displayed.' },
            { ELEM: 'Assign employees to complete the Picking task and create the planned competition time o know the employee performance. ' },
            { ELEM: 'Click on start button to Start Picking task and system will record start date & time.' },
            { ELEM: 'Click on Complete button Picking status is updated as completed and complete date & time will get recorded. Picking Executive name also get recorded.' },
            { ELEM: 'Download and Print PDF option is available to download the Picking schedule details' },
        ]
    },
    EMPWF_PUTAWAY_PLANNING: {
        MAIN: 'PUTAWAY PLANNING',
        LIST: [
            { ELEM: 'Putaway Generated records are displayed in below table.' },
            { ELEM: 'Filter the Putaway List order wise or zone wise or location wise, click on filter selected filter wise Putaway list is displayed' },
            { ELEM: 'Assign employees to complete the putaway task and create the planned competition time to know the employee performance. ' },
            { ELEM: 'Click on start button to Start putaway task and system will record start date & time.' },
            { ELEM: 'Click on Complete button Putaway status is updated as completed and complete date & time will get recorded. Putaway Executive name also get recorded.' },
            { ELEM: 'Download and Print PDF option is available to download the putaway schedule details' },
        ]
    },
    EMPWF_INTERNAL_TRANSFER: {
        MAIN: 'INTERNAL TRANSFER',
        LIST: [
            { ELEM: 'Internal transferred records are displayed in below table.' },
            { ELEM: 'Filter the employee wise internal transferred records, click on filter selected filter wise internal transferred records is displayed.' },
            { ELEM: 'Assign employees to complete the internal transfer task and create the planned competition time to know the employee performance. ' },
            { ELEM: 'Click on start button to Start the task and system will record start date & time.' },
            { ELEM: 'Click on Complete button Internal transfer status is updated as completed and complete date & time will get recorded. Executive name also get recorded.' },
            { ELEM: 'Download and Print PDF option is available to download the internal transfers details' },

        ]
    },
    EMPWF_PACKING: {
        MAIN: 'PACKING',
        LIST: [
            { ELEM: 'Packing Generated records are displayed in below table.' },
            { ELEM: 'Filter the sales order wise or employee wise, click on filter selected filter wise Packing list is displayed.' },
            { ELEM: 'Assign employees to complete the Packing task and create the planned competition time to know the employee performance. ' },
            { ELEM: 'Click on start button to Start Packing task and system will record start date & time.' },
            { ELEM: 'Click on Complete button Packing status is updated as completed and complete date & time will get recorded. Packing Executive name also get recorded.' },
            { ELEM: 'Download and Print PDF option is available to download the Packing schedule details.' },

        ]
    },
    EMPWF_CO_PACKING: {
        MAIN: 'CO-PACKING',
        LIST: [
            { ELEM: 'Copacking Generated records are displayed in below table.' },
            { ELEM: 'Filter the sales order wise or employee wise, click on filter selected filter wise Copacking list is displayed.' },
            { ELEM: 'Assign employees to complete the Copacking task and create the planned competition time to know the employee performance. ' },
            { ELEM: 'Click on start button to Start Repacking task and system will record start date & time.' },
            { ELEM: 'Click on Complete button Copacking status is updated as completed and complete date & time will get recorded. Copacking Executive name also get recorded.' },
            { ELEM: 'Download and Print PDF option is available to download the Copacking schedule details.' },
        ]
    },
    EMPWF_RE_PACKING: {
        MAIN: 'RE-PACKING',
        LIST: [
            { ELEM: 'Repacking Generated records are displayed in below table.' },
            { ELEM: 'Filter the sales order wise or employee wise, click on filter selected filter wise Repacking list is displayed.' },
            { ELEM: 'Assign employees to complete the Repacking task and create the planned competition time to know the employee performance. ' },
            { ELEM: 'Click on start button to Start Repacking task and system will record start date & time.' },
            { ELEM: 'Click on Complete button Repacking status is updated as completed and complete date & time will get recorded. Repacking Executive name also get recorded.' },
            { ELEM: 'Download and Print PDF option is available to download the Repacking schedule details.' }

        ]
    },
    EMPWF_LABELLING: {
        MAIN: 'LABELLING',
        LIST: [
            { ELEM: 'Labelling Generated records are displayed in below table.' },
            { ELEM: 'Filter the sales order wise or employee wise, click on filter selected filter wise Labelling list is displayed' },
            { ELEM: 'Assign employees to complete the Labelling task and create the planned competition time to know the employee performance. ' },
            { ELEM: 'Click on start button to Start Repacking task and system will record start date & time.' },
            { ELEM: 'Click on Complete button Labelling status is updated as completed and complete date & time will get recorded. Labelling Executive name also get recorded.' },
            { ELEM: 'Download and Print PDF option is available to download the Labelling schedule details' },
        ]
    },
    EMPWF_LOADING: {
        MAIN: 'LOADING',
        LIST: [
            { ELEM: 'Loading Generated records are displayed in below table.' },
            { ELEM: 'Filter the sales order wise or employee wise, click on filter selected filter wise Loading list is displayed.' },
            { ELEM: 'Assign employees to complete the Loading task and create the planned competition time to know the employee performance. ' },
            { ELEM: 'Click on start button to Start Repacking task and system will record start date & time.' },
            { ELEM: 'Click on Complete button Loading status is updated as completed and complete date & time will get recorded. Loading Executive name also get recorded.' },
            { ELEM: 'Download and Print PDF option is available to download the Loading schedule details' },

        ]
    },
    EMPWF_UN_LOADING: {
        MAIN: 'UN LOADING',
        LIST: [
            { ELEM: 'Unloading Generated records are displayed in below table.' },
            { ELEM: 'Filter the sales order wise or employee wise, click on filter selected filter wise Unloading list is displayed.' },
            { ELEM: 'Assign employees to complete the Unloading task and create the planned competition time to know the employee performance. ' },
            { ELEM: 'Click on start button to Start Repacking task and system will record start date & time.' },
            { ELEM: 'Click on Complete button Unloading status is updated as completed and complete date & time will get recorded. Unloading Executive name also get recorded.' },
            { ELEM: 'Download and Print PDF option is available to download the Unloading schedule details' },
        ]
    },
    EMPWF_EMPLOYEEPERFORMANCE: {
        MAIN: 'EMPLOYEE PERFORMANCE',
        LIST: [
            { ELEM: 'By using date filters employee performance records are displayed as per End Date to From Date.' },
            { ELEM: 'Total Actual Work Duration Calculated as sum of actual duration of all tasks.' },
            { ELEM: 'Total Early time Calculated as sum of Early time of all tasks.' },
            { ELEM: 'Total delayed time Calculated as sum of delayed time of all tasks.' },
            { ELEM: 'Total planned work duration as sum of planned work duration time of all tasks.' },
            { ELEM: 'Actual Work duration means task start time to end to time. ' },
            { ELEM: 'Early time means task completed before planned completion time.' },
            { ELEM: 'Delayed Time calculated by task completed after planned completion time.' },
            { ELEM: 'Planned work' },


        ]
    },
    EMPWF_EMPLOYEE_TASK: {
        MAIN: 'EMPLOYEE TASK',
        LIST: [
            { ELEM: 'Employee wise tasks are displayed.' },

        ]
    },
    SHIPMENT_ORDER: {
        MAIN: 'Approve shipment order to delivery the products to the customer against the sales order and to generate invoice',
        LIST: [
            { ELEM: ' 	Order details like WMSO Number, Customer ID/Name, Order Date displayed by default and enter payment status. Products details in the Shipment history panel.' },
            { ELEM: ' 	By clicking on edit option in Shipment history panel, record displays in shipment panel with default Product ID/Name, Shipment Time Slot, Expected Delivery Date, Invoice Type, Mode of transport Order Quantity, Picked Quantity, Batch Number, Shelf life, Shipment Unit details and enter Shipped Quantity, Remarks to update product details after updating it is displayed in below table. All the products are update in the same way.' },
            { ELEM: ' 	Click on Confirm Shipment.' },


        ]
    },
    MAINTAIN_INVOICING: {
        MAIN: 'List of confirmed Shipment orders are displayed with order details in first table and product details in second table.',
        LIST: [
            { ELEM: ' 	When Invoice is open Action shows edit option for editing Invoice, by Clicking on edit option it navigates to Invoice screen to edit or close invoice or print invoice' },
            { ELEM: ' 	When the Invoice is closed it displays as Closed.' },
            { ELEM: ' 	Orders filtered by Delivery Expected date using date filter, order status selecting dropdown opened, closed, all.' },
            { ELEM: ' 	By using search option also data filtered.' },

        ]
    },
    INVOICING: {
        MAIN: 'Print Invoice for confirmed and payment Settled Shipments for the customers.',
        LIST: [
            { ELEM: ' 	Order details like Invoice Number, Invoicing Date, WMSO Number, Sales Order Date, Customer ID/Name, Customer ID, Customer Name, Payment status are displayed by default in Invoicing Header panel.' },
            { ELEM: ' 	Product details like Product ID, Product Name, Batch Number, Shelf life, Order Quantity, Shipped Unit Price, Quantity, Taxes, Discount, Amount UPC details displayed in below table' },
            { ELEM: ' 	Table contains Edit option for every order line. By clicking on edit option details displayed in Invoicing Lines panel. Unit Price, Discount, Taxes can be edited and click on save to updated details.' },
            { ELEM: ' 	Click on Print option for printing Invoice' },
            { ELEM: ' 	Click on Close Invoice for closing Invoice.' },

        ]
    },

    /*  CROSSDOCKING: {
         MAIN: 'Deliver products to customers directly through crossdocking process.',
         LIST: [
             { ELEM: ' 	List of crossdocking records are displayed with details like WMPO Number, WMPO Line Number, Supplier ID, Supplier Name, Receipt Date, PO Delivery Date, WMSO Number, WMSO Line Number, Customer ID, Customer Name, Sales Order Date, Deliver Expected date, Product ID, Product Name, Order Quantity.' },

         ]
     }, */
    Replenishment: {
        MAIN: 'Moving products from Replenishment Area to Picking Location',
        LIST: [
            { ELEM: ' 	List of replenishment records are displayed with details like Product ID, Product Name, Source Location, Destination Location, Replenishment Quantity, Start Date, End Date.' },
            { ELEM: ' 	Replenishment status is updated by selecting completed option in status dropdown.X' }
        ]
    },

    InventoryMain: {
        MAIN: 'Available Inventory location with product details are viewed..',
        LIST: [
            { ELEM: ' 	List of Inventory records are displayed with details like Product ID/Name, Product Name, Product Category, Product Type, Product Class, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Quantity Inventory Unit, Created Date, Storage Unit, Inventory Unit, Available Quantity, Reserved Quantity, Batch Number, Mfg Date, Expiry Date, Shelf Life, Stock Value, Avg Cost Price, Inventory Availability.' },
        ]
    },
    InventoryByLocation: {
        MAIN: 'Available Inventory by location with product details are viewed.',
        LIST: [
            { ELEM: 'List of Inventory records are displayed with details like Product ID/Name, Product Name, Product Category, Product Type, Product Class, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Quantity Inventory Unit, Created Date, Storage Unit, Inventory Unit, Available Quantity, Reserved Quantity, Batch Number, Mfg Date, Expiry Date, Shelf Life, Stock Value, Avg Cost Price, Inventory Availability.' },
        ]
    },
    InventoryByProduct: {
        MAIN: 'Available Inventory by Product with product details are viewed.',
        LIST: [
            { ELEM: 'List of Inventory records are displayed with product wise available quantity.' },
        ]
    },

    InventoryByProductTotals: {
        MAIN: ' Grand total of Inventory stock are viewed.',
        LIST: [
            { ELEM: 'Grand total of Inventory stock record is displayed with details like Available Quantity, Reserved Quantity, Quantity Inventory Unit' },
        ]
    },
    InventoryByTransaction: {
        MAIN: ' Transactions of all transaction type are viewed.',
        LIST: [
            { ELEM: 'List of Inventory records are displayed with details like Transaction ID, Supplier ID, Order ID, Line ID, Product ID/Name, Product Name, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Quantity Inventory Unit, Transaction Date, Inventory Unit, Available Quantity, Reserved Quantity, Batch Number, Mfg Date, Expiry Date, Transaction Type.' },
        ]
    },
    InventoryByTransactionDetails: {
        MAIN: ' Detailed Transactions of all transaction type are viewed',
        LIST: [
            { ELEM: 'List of Inventory records are displayed with details like Transaction Details ID, Transaction, Transaction ID, Supplier ID, Order ID, Line ID, Product ID/Name, Product Name, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Quantity Inventory Unit, Transaction Date, Inventory Unit, Available Quantity, Reserved Quantity, Batch Number, Mfg Date, Expiry Date, Transaction Type, Status.' },
        ]
    },
    OverAllInventory: {
        MAIN: ' Detailed Transactions of all transaction type are viewed',
        LIST: [
            { ELEM: 'List of Inventory records are displayed with details like Transaction Details ID, Transaction, Transaction ID, Supplier ID, Order ID, Line ID, Product ID/Name, Product Name, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Quantity Inventory Unit, Transaction Date, Inventory Unit, Available Quantity, Reserved Quantity, Batch Number, Mfg Date, Expiry Date, Transaction Type, Status.' },
        ]
    },
    Internal_Transfers: {
        MAIN: 'Raise transfer order from one location to other location with a reason code.',
        LIST: [
            { ELEM: ' 	Select Product from Product ID/Name dropdown, available product locations are displayed in Source Location, Destination Location dropdowns 	' },
            { ELEM: ' 	Select Source Location, Destination Location and enter Transfer Quantity, Reason. 	' },
            { ELEM: ' 	Click on Save option to transfer Quantity.  	' },
            { ELEM: ' 	Quantity gets updated in the Inventory. Internal transfer record is maintained in below table. 	' },
            { ELEM: ' 	Internal Transfer status is updated by selecting completed option in status dropdown.' },

        ]
    },
    Internal_Adjustments: {
        MAIN: 'Adjust Inventory by adding or reducing of products with a reason code.',
        LIST: [
            { ELEM: ' 	Select location from Location Name dropdown, Product ID/Name, Product ID, Product Name, Product Type, Product Class, Product Category, Quantity Inventory Unit, Available Quantity, Reserved Quantity details displayed by default. 	' },
            { ELEM: ' 	Enter Adjusted Quantity, Adjustment Type and Reason. 	' },
            { ELEM: ' 	Click on Save option to Adjust Quantity. 	' },
            { ELEM: ' 	Quantity gets updated in the Inventory. Record is maintained in below Inventory Adjustment Table. 	' },
            { ELEM: ' 	' },

        ]
    },
    Cycle_Counting: {
        MAIN: 'Audit Inventory Accuracy and reconcile errors on an ongoing basis..',
        LIST: [
            { ELEM: ' 	Select Cycle counting criteria from the dropdown, dropdown consists of Warehouse, Product category, Zone, Location. 	' },
            { ELEM: ' 	Based on the selection of cycle counting criteria search option displays list.' },
            { ELEM: ' 	Inventory Details gets filtered based on the criteria. 	' },
            { ELEM: ' 	Click on edit option in the inventory details record to perform cycle counting. 	' },
            { ELEM: ' 	Details like Product ID/Name, Inventory Unit, Batch Number, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Quantity Inventory Unit, Available Quantity, Cycle Counting Executive Name are displayed in Cycle counting panel. 	' },
            { ELEM: ' 	Enter Actual Quantity, Adjustment Type and Reason.' },
            { ELEM: ' 	Click on Save option to perform Cycle Counting. Pop window appears that do you want to perform Inventory Adjustments. Click on Yes.' },
            { ELEM: ' 	Quantity gets updated in the Inventory. Cycle Counting record is maintained in cycle counting table and in Inventory Adjustment table.' },
            { ELEM: ' 	Graphical representation of Cycle Counting shows Inventory Accuracy current month by default, by using date filters Inventory accuracy can also be displayed. ' }

        ]
    },
    Inbound_Capacity_Planning: {
        MAIN: 'Manage Capacity of Equipment and Resource for the Incoming Shipments',
        LIST: [
            { ELEM: ' 	Open Incoming Orders are displayed in the first table with details WMPO Number, Product ID/Name, Supplier ID/Name, Receipt Date, PO Delivery Date, Quantity, Receipt Type.' },
            { ELEM: ' 	15 days from current date, product wise quantity is displayed in the second table. 	' },
            { ELEM: ' 	Based on day wise overall qty for 15 days Equipment Required, Executives required is calculated.' },
            { ELEM: ' 	Equipment Available data comes from Equipment master data and Executives Available comes from WH Team master data.' },
            { ELEM: ' 	Equipment Remaining is calculated as Equipment Available – Equipment Required.' },
            { ELEM: ' 	Executives Remaining is calculated as Executives Available – Executives Required.' }

        ]
    },
    Putaway_Planning: {
        MAIN: 'Putaway Planning',
        LIST: [
            { ELEM: ' Filter Putaway list by selecting WMPO Number, Zone, Location' },
            { ELEM: ' Select Employee and Putaway list to assign ' },
        ]
    },
    Picking_Planning: {
        MAIN: 'Picking Planning',
        LIST: [
            { ELEM: ' 	Filter Picking list by selecting WMSO Number, Zone, Location' },
            { ELEM: ' Select Employee and Picking list to assign ' },
        ]
    },
    Outbound_Capacity_Planning: {
        MAIN: 'Manage Capacity of Equipment, Resource and Vehicle for the Outgoing Shipments',
        LIST: [
            { ELEM: ' 	Open Outgoing Orders are displayed in the first table with details WMSO Number, Product ID/Name, Customer ID/Name, Order Date, SO Delivery Date, Quantity, Order Type. 	' },
            { ELEM: ' 	15 days from current date, product wise quantity is displayed in the second table. 	' },
            { ELEM: ' 	Based on day wise overall qty for 15 days Equipment Required, Executives required, Vehicle required is calculated. 	' },
            { ELEM: ' 	Equipment Available data comes from Equipment master data, Executives Available comes from WH Team master data and Vehicle Available comes from Vehicle master data 	' },
            { ELEM: ' 	Equipment Remaining is calculated as Equipment Available – Equipment Required.' },
            { ELEM: ' 	Executives Remaining is calculated as Executives Available – Executives Required' },
            { ELEM: ' 	Vehicle Remaining is calculated as Vehicle Available – Vehicle Required.' },
            { ELEM: 'By using search option also data filtered.' },

        ]
    },
    WAREHOUSELAYOUT: {
        MAIN: 'Visibility of available Inventory locations with product details.',
        LIST: [
            { ELEM: ' 	Warehouse Layout is displayed with Zones, Racks, Levels and Locations.' },
            { ELEM: ' 	Place cursor on any location it displays with Levels, Location name, product details like Product ID, Product Name, Quantity, Expiry Date, Reserved Quantity.' },
            { ELEM: ' 	If there is no Inventory in the location displays as Empty. ' },
            { ELEM: ' 	Warehouse Layout consists of dropdown with list like Going to Expire, Expired, Stock Available and Quarantine.' },
            { ELEM: ' 	Select Going to Expire, Going to expire products locations are highlighted with orange color.' },
            { ELEM: '	Select Expired, Expired products locations are highlighted with red color.' },
            { ELEM: 'Select Stock Available, Stock Available locations are highlighted with blue color' },
            { ELEM: 'Select Quarantine, reserves products locations are highlighted with gray color.' },
            { ELEM: ' Warehouse layout consists of product search option for searching a product. Select any product, product available location is highlighted with green color.' },
            { ELEM: ' Warehouse layout consists of Supplier search option for searching supplier wise  product.  product available location is highlighted with violet color.' },
            { ELEM: ' Click on space availability icon to display total space available, usable space available, number of completely available locations, number partial available location and not available locations. Space availability can we displayed warehouse wise , Zone wise , rack wise, location wise' },
            { ELEM: ' Click on receiving bay, To view product details which are in pending putaway process.' },
            { ELEM: ' Click on locations icon to view the location details like status, total space and usable space.' },
            { ELEM: ' Select putaway user dropdown will be displayed ,select one user to view the putaway list assign to that user. That locations is highlighted with sky blue colour ' },
            { ELEM: ' Assigned user can login and complete the putaway process by clicking on start and complete buttons' },
            { ELEM: ' Select picking user dropdown will be displayed ,select one user to view the picking  list assign to that user. That locations is highlighted with sky blue colour' },
            { ELEM: ' Assigned user can login and complete the picking  process by clicking on start and complete buttons.' },


        ]
    },
    Product_Master: {
        MAIN: 'Product Master',
        LIST: [
            { ELEM: ' 	Enter product attributes, product dimensions, product units, product currency details, planning details and product instructions 	' },
            { ELEM: ' 	Click on Save option. Record displayed in Product master table. 	' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels. 	' },
            { ELEM: ' 	Upload Excel option is to upload data through excel. 	' },
            { ELEM: ' 	Download Excel option is to download all product details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' }

        ]
    },
    Supplier_Master: {
        MAIN: 'Supplier Master',
        LIST: [
            { ELEM: ' 	Enter supplier attributes, supplier address, supplier additional details, supplier bank details. 	' },
            { ELEM: ' 	Click on Save option. Record displayed in supplier master table.	' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels. 	' },
            { ELEM: ' 	Upload Excel option is to upload data through excel. 	' },
            { ELEM: ' 	Download Excel option is to download all supplier details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' }

        ]
    },
    Rack_Master: {
        MAIN: 'Rack Master',
        LIST: [
            { ELEM: ' 	 	Enter rack attributes in rack attributes panel	' },
            { ELEM: ' 	 	Click on Save option. Record displayed in rack table.	' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels	' },
            { ELEM: ' 	 	In rack maste we have modes 1 deep and 2 deep	' },
            { ELEM: ' 	 	Select 1 deep rack contains single column  location it display front mode only ' },
            { ELEM: ' 	 	Select 2 deep location disaplys front and back locations ' },
            { ELEM: ' 	 	 	Select column dropdown to select the columns and to input dimensions	' },
            { ELEM: ' 	  	Upload Excel option is to upload data through excel.	' },
            { ELEM: ' 	 	 	Download Excel option is to download all zone details through excel. ' },
            { ELEM: ' 	  	Edit and delete options are available at Action column in data table. ' }

        ]
    },
    Column_Master: {
        MAIN: 'Column Master',
        LIST: [
            { ELEM: ' 	 	Enter column  attributes in column attributes panel 	' },
            { ELEM: '  	Click on Save option. Record displayed in column table	' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels. 	' },
            { ELEM: ' 	 	Upload Excel option is to upload data through excel. 	' },
            { ELEM: ' 	 	Download Excel option is to download all zone details through excel.  ' },
            { ELEM: ' 	 	Edit and delete options are available at Action column in data table.' }

        ]
    },
    Customer_Master: {
        MAIN: 'Customer Master',
        LIST: [
            { ELEM: ' 	Enter Customer attributes, Customer address, Customer additional details, Customer bank details. 	' },
            { ELEM: ' 	Click on Save option. Record displayed in Customer master table.	' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels. 	' },
            { ELEM: ' 	Upload Excel option is to upload data through excel. 	' },
            { ELEM: ' 	Download Excel option is to download all Customer details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' }

        ]
    },
    Product_by_Supplier_Master: {
        MAIN: 'Product by Supplier Master',
        LIST: [
            { ELEM: ' 	Enter supplier details, product details. 	' },
            { ELEM: ' 	Click on Save option. Record displayed in product by supplier master table. 	' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels. 	' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },

        ]
    },
    Product_by_Customer_Master: {
        MAIN: 'Product by Customer Master',
        LIST: [
            { ELEM: ' 	Enter customer details, product details' },
            { ELEM: ' 	Click on Save option. Record displayed in product by customer master table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },


        ]
    },
    Warehouse_Master: {
        MAIN: 'Warehouse Master',
        LIST: [
            { ELEM: 'Enter warehouse attributes, warehouse address.' },
            { ELEM: 'Click on Save option. Record displayed in warehouse master table.' },
            { ELEM: 'Click on Clear option, to clear entered details in the panels.' },
            { ELEM: 'Upload Excel option is to upload data through excel.' },
            { ELEM: 'Download Excel option is to download all warehouse details through excel. ' },
            { ELEM: 'Edit and delete options are available at Action column in data table.' }

        ]
    },
    Zone_Master: {
        MAIN: 'Zone Master',
        LIST: [
            { ELEM: ' 	Enter zone attributes in zone attributes panel' },
            { ELEM: ' 	Click on Save option. Record displayed in zone master table' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Upload Excel option is to upload data through excel.    ' },
            { ELEM: ' 	Download Excel option is to download all zone details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' }

        ]
    },
    Level_Master: {
        MAIN: 'Level Master',
        LIST: [
            { ELEM: ' 	Enter level attributes in level attributes panel' },
            { ELEM: ' 	Click on Save option. Record displayed in level master table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Upload Excel option is to upload data through excel.' },
            { ELEM: ' 	Download Excel option is to download all level details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' }

        ]
    },
    Location_Master: {
        MAIN: 'Location Master',
        LIST: [
            { ELEM: ' 	Enter location attributes in location attributes panel.' },
            { ELEM: ' 	Click on Save option. Record displayed in level master table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Upload Excel option is to upload data through excel.' },
            { ELEM: ' 	Download Excel option is to download all level details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' }


        ]
    },
    Product_Strategy: {
        MAIN: 'Product Strategy',
        LIST: [
            { ELEM: ' 	Enter product strategy attributes in putaway strategy attributes panel' },
            { ELEM: ' 	Click on Save option. Record displayed in product strategy table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },


        ]
    },

    Uom_Conversion: {
        MAIN: 'Uom_Conversion',
        LIST: [
            { ELEM: ' 	Select First ProducIDName In the Dropdown' },
            { ELEM: ' 	then,Select the unit  conversion from option in the dropdown.' },
            { ELEM: ' 	Next,Select the "TO" Option from dropdown .' },
            { ELEM: '   Then set the conversion factor accordinng to your requirement' },
            { ELEM: '   Then Click on Save to Save the information' },
            { ELEM: '   Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },
        ]
    },

    Putaway_Strategy: {
        MAIN: 'Putaway Strategy',
        LIST: [
            { ELEM: ' 	Enter putaway strategy attributes and zone details' },
            { ELEM: ' 	Click on Save option. Record displayed in product strategy table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },

        ]
    },
    Picking_Strategy: {
        MAIN: 'Picking Strategy',
        LIST: [
            { ELEM: ' 	Enter picking strategy attributes and zone details.' },
            { ELEM: ' 	Click on Save option. Record displayed in product strategy table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },

        ]
    },
    Vehicle_Master: {
        MAIN: 'Vehicle Master',
        LIST: [
            { ELEM: ' 	Enter vehicle attributes and vehicle details.' },
            { ELEM: ' 	Click on Save option. Record displayed in vehicle master table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Upload Excel option is to upload data through excel.' },
            { ELEM: ' 	Download Excel option is to download all vehicle details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' }

        ]
    },

    Equipment_Master: {
        MAIN: 'Equipment Master',
        LIST: [
            { ELEM: ' 	Enter equipment attributes and equipment details.' },
            { ELEM: ' 	Click on Save option. Record displayed in vehicle master table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Upload Excel option is to upload data through excel.' },
            { ELEM: ' 	Download Excel option is to download all vehicle details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' }

        ]
    },
    Warehouse_Team_Master: {
        MAIN: 'Warehouse Team Master',
        LIST: [
            { ELEM: ' 	Enter executive attributes and executive details.' },
            { ELEM: ' 	Click on Save option. Record displayed in vehicle master table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Upload Excel option is to upload data through excel.' },
            { ELEM: ' 	Download Excel option is to download all vehicle details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' }
        ]
    },
    Organization_Master: {
        MAIN: 'Organization Master',
        LIST: [
            { ELEM: ' 	 	Enter organization details, Organization address details .' },
            { ELEM: ' 	 	Click on Save option. Record displayed in organization table.' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	 	Edit and delete options are available at Action column in data table.' },
            { ELEM: '  	   Upload Excel option is to upload data through excel.. ' },
            { ELEM: ' 	 	Download Excel option is to download all organization details through excel. ' }
        ]
    },
    Bill_of_Resources: {
        MAIN: 'Bill of Resources',
        LIST: [
            { ELEM: ' 	Enter bill of resources header and bill of resources lines.' },
            { ELEM: ' 	Click on Save option. Record displayed in bill of resource table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },
            { ELEM: ' 	 	Download Excel option is to download all bill of resources details through excel. ' }

        ]
    },
    Bill_to_Address: {
        MAIN: 'Bill to Address',
        LIST: [
            { ELEM: ' 	Enter bill to address in bill to address panel.' },
            { ELEM: ' 	Click on Save option. Record displayed in bill of Address table.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },
            { ELEM: ' 	 	Download Excel option is to download all bill to address details through excel. ' }
        ]
    },
    Replenishment_MASTER: {
        MAIN: 'Replenishment MASTER',
        LIST: [
            { ELEM: ' 	Enter replenishment details in replenishment panel.' },
            { ELEM: ' 	Click on Save option. Record displayed in replenishment table' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Upload Excel option is to upload data through excel.' },
            { ELEM: ' 	Download Excel option is to download all replenishment details through excel. ' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },
            { ELEM: 'By using search option also data filtered.' },

        ]
    },
    State_MASTER: {
        MAIN: 'State_Master',
        LIST: [
            { ELEM: 'Click on Country dropdown button list of countries is displayed, select country and enter State name.' },
            { ELEM: 'Click on Save option. Record displayed in Country Sate table.' },
            { ELEM: 'Click on Clear option, to clear entered details in the panel.' },
        ]
    },
    Tax_MASTER: {
        MAIN: 'Tax_Master',
        LIST: [
            { ELEM: 'Enter state wise Taxe percentages with Tax name in tax panel details.' },
            { ELEM: 'Click on Save option. Record displayed in tax table.' },
            { ELEM: 'Click on Clear option, to clear entered details in the panel.' },
            { ELEM: 'Download Excel option is to download all tax details through excel.' },
            { ELEM: 'Edit and delete options are available at Action column in data table.' }
        ]
    },
    Product__Category_Group_MASTER: {
        MAIN: 'Product Category Group',
        LIST: [
            { ELEM: 'Enter Product category group details with hierarchy level wise.' },
            { ELEM: 'Click on Save option. Record displayed in tax table.' },
            { ELEM: 'Click on Clear option, to clear entered details in the panel.' },
            { ELEM: 'Download Excel option is to download all tax details through excel.' },
            { ELEM: 'Edit and delete options are available at Action column in data table.' }
        ]
    },
    Goods_Receiving: {
        MAIN: 'Goods Receiving',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of goods receiving.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Supplier ID/Name, Product ID/Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like WMPO Number, Reference PO Number, Product ID, Product Name, Supplier ID/Name, Order Quantity, Received Quantity, Batch Number, GRN Date, MFG Date, Receipt Date.' },
            { ELEM: ' 	Download Excel option is to download all Goods receiving details through excel. ' },

        ]
    },
    Putaway: {
        MAIN: 'Putaway',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of putaway.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like Putaway No, Product ID, Product Name, Location Name, Putaway Quantity, Putaway Executive, Created On, Completed Date, Start Time, End Time, Status' },
            { ELEM: ' 	Download Excel option is to download all putaway details through excel. ' },

        ]
    },
    Purchase_Return: {
        MAIN: 'Returning the products against Purchase Order wise to Supplier.',
        LIST: [
            { ELEM: 'Order type is displayed as Purchase order by default.' },
            { ELEM: 'Selected order type related List of Orders are displayed in PO number search button.' },
            { ELEM: 'Once order is selected Supplier ID and Supplier Name displayed in header panel and lines table is displayed.' },
            { ELEM: 'Click on check box and enter the return quantity. Return and Receive quantity should be equal to selected location quantity. ' },
            { ELEM: 'When click on Receive location and Return location, popup window will open enter required quantity and click on save.' },
            { ELEM: 'Click on Create button to create the order. Once order is created, status is displayed as Created in order table.' },
            { ELEM: 'Once creation is completed Confirm button is Enabled.' },
            { ELEM: 'Click on Confirm button to confirm the return Quantity and status changes to confirmed in order table.' },
            { ELEM: 'When the returned quantity is confirmed, Picklist is generated against Purchase Return Order. ' },
        ]
    },
    Sales_Return: {
        MAIN: 'Receiving the products from Customer against the Sales Return order.',
        LIST: [
            { ELEM: 'Click on SO Number search button list of sales Orders are displayed.' },
            { ELEM: 'Selected order related Customer details are updated by default in header panel.' },
            { ELEM: 'ETA date is displayed as current date by default.' },
            { ELEM: 'Click on Create button to create the order. Once order is created, status is displayed as Created in order table.' },
            { ELEM: 'Once creation is completed Confirm button is Enabled.' },
            { ELEM: 'Click on Confirm button to confirm the return Quantity and status changes to confirmed in order table.' },
            { ELEM: 'When the returned quantity is confirmed, Picklist is generated against Purchase Return Order. ' },
        ]
    },
    Returns: {
        MAIN: 'Returns',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of goods receiving' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Supplier ID/Name, Product ID/Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like WMSO Number, Product ID, Product Name, return Quantity, Return Date' },
            { ELEM: ' 	Download Excel option is to download all Goods receiving details through excel. ' },

        ]
    },
    Inventory_Summary_Report: {
        MAIN: 'Inventory Summary Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of Inventory.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like Putaway No, Product ID, Product Name, Quantity, Batch Number, Location Name, Created Date.' },
            { ELEM: ' 	Download Excel option is to download all Inventory details through excel. ' },

        ]
    },

    Cycle_Counting_Report: {
        MAIN: 'Cycle Counting Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of Cycle Counting.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details Cycle Counting Number, Cycle Counting Criteria, Created Date, Cycle Counting Date, Product ID/Name, Batch Number, Actual Quantity, Available Quantity, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name.' },
            { ELEM: ' 	Download Excel option is to download all cycle counting details through excel. ' },

        ]
    },
    INVENTORY_BY_PRODUCT: {
        MAIN: 'Inventory By Product',
        LIST: [
            { ELEM: 'Available Inventory by product details is viewed.' },
            { ELEM: 'List of Inventory records are displayed with product wise available quantity.' },

        ]
    },
    Issue_Inventory: {
        MAIN: 'Issue_Inventory',
        LIST: [
            { ELEM: 'Item wise available quantity is displayed.' },
            { ELEM: 'By using Filter button filtered the particular product wise or product category wise.' },
            { ELEM: 'By using clear button clear the filters.' },
            { ELEM: 'Select the particular product category and click on filter button products list is displayed as per category wise.' },
            { ELEM: 'Enter the issued quantity at particular locations. Issued quantity should be equal to selected location Quantity and enter the remarks.' },
            { ELEM: 'Inventory Issued button is to create the order. Click on inventory issued order status is created.' },
            { ELEM: 'By using Status filtered the particular status wise like Created, Approved, Completed and Rejected issued items.' },
            { ELEM: 'By default, created filter is displayed in status. When filter is created status Approved and Reject buttons enable.' },
            { ELEM: 'When status is Approved filter complete button is enabled.' },
        ]
    },

    wareHouseTransfer: {
        MAIN: 'wareHouseTransfer',
        LIST: [
            { ELEM: 'List of Warehouse Transfer orders are displayed with order details in header table and items details displayed in lines table' },
            { ELEM: '	When Request is Created, Order status is displayed as “Created” state.' },
            { ELEM: '	When the order is approved, order status changes to “Conformed” state' },
            { ELEM: '	When picking is completed, order status changes to “Picked” state.' },
            { ELEM: '	When shipment is conformed, order status changes to “In Transit” state.' },
            { ELEM: '	When receiving the Items, order status changes to “Completed” state.' },
            { ELEM: '	When the order is rejected, order status changes to “Rejected” state.' },
            { ELEM: '	By using search option also data filtered.' },
        ]
    },
    WT_Create_Order: {
        MAIN: 'Create Warehouse Transfer',
        LIST: [
            { ELEM: 'Raise transfer order from customer warehouse to warehouse.' },
            { ELEM: 'Product list is displayed by default from destination warehouse..' },
            { ELEM: 'By using filters Product ID/Name and Product category to filter the product list. ' },
            { ELEM: 'By using Clear button, the selected filters are cleared..' },
            { ELEM: 'Select products and click on Add to cart selected products are added in Cart..' },
            { ELEM: 'After adding the products in cart View cart button is highlighted. Click on View cart button page navigates to create order screen.' },
            { ELEM: 'Enter the expected delivery date automatically date is assigned to all items..' },
            { ELEM: 'By using Add items button to add more products. Click on Add items button it navigates to products summary screen.' },
            { ELEM: 'Add more products into add to cart and click on view cart it navigates to create order screen.' },
            { ELEM: 'By click on Update button to update the product details.' },
            { ELEM: 'By click on Print PDF, pdf document is displayed with order details.' },
            { ELEM: 'Click on Create order button the order is created. Once the order is created page navigates to maintains screen.' },
            { ELEM: 'Once the order is created, warehouse transfer request is transferred to distribution warehouse.' },
            { ELEM: 'When transferred order is conformed, Automatically GRN is created in warehouse.' },
        ]

    },
    WT_Order_Summary: {
        MAIN: 'Order Sumary',
        LIST: [
            { ELEM: 'Select Order, it navigates to request order summary screen, requested products are displayed in table.' },
            { ELEM: 'Click on Customer Order Qty = Order Qty to confirm order with requested Quantity by customer.' },
            { ELEM: 'Click on Update button to updated the product details.' },
            { ELEM: 'Click on Reject button, Order is Rejected' },
            { ELEM: 'Click on Approve button, order is confirmed and page navigates to maintains screen.' },
            { ELEM: 'When the Order is approved Picklist is generated against Order.' },
        ]

    },

    Inventory_Adjustments_Report: {
        MAIN: 'Inventory Adjustments Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of Inventory Adjustments.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Product ID/Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details Product ID, Product Name, Product Category, Created Date, Adjusted Quantity, Available Quantity, Reserved Quantity, Location Name, Inventory Adjustment Type, Completed Date.' },
            { ELEM: ' 	Download Excel option is to download all Inventory Adjustments details through excel. ' },

        ]
    },
    Picking: {
        MAIN: 'Picking',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of picking.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like Picking No, Product ID, Product Name, Location Name, Picking Quantity, Picking Executive, Created On, Completed Date, Start Time, End Time, Status' },
            { ELEM: ' 	Download Excel option is to download all picking details through excel. ' },

        ]
    },
    Picking_List: {
        MAIN: 'Picking List',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of picking' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like Picking No, Product ID, Product Name, Location Name, Picking Quantity, Picking Executive, Created On, Completed Date, Start Time, End Time, Status' },
            { ELEM: ' 	Download Excel option is to download all picking details through excel. ' },

        ]
    },
    Shipment: {
        MAIN: 'Shipment',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of shipment.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels' },
            { ELEM: ' 	By using filters Customer ID/Name, Product ID/Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like WMSO Number, Reference SO Number, Product ID, Product Name, Customer ID, Customer Name, Order Quantity, Shipped Quantity, Batch Number, Order Date, created Date.' },
            { ELEM: ' 	Download Excel option is to download all Shipping details through excel. ' },

        ]
    },
    Parameters: {
        MAIN: 'Parameters',
        LIST: [
            { ELEM: ' 	+ Tag option is for entering the details of parameters and click on enter to save record' },
            { ELEM: ' 	Cancel option is to clear the data.' },


        ]
    },
    Prefix_Config: {
        MAIN: 'Prefix Config',
        LIST: [
            { ELEM: 'Enter the Prefix name and Starting order number to generate the Order Number with this configured Starting Number for all Screens like Purchase order, Sales order, Inventory, Inventory Transaction, Inventory Transaction Details, Putaway, Picking, Sales Returns, Warehouse Transfers, Purchase Returns, Inventory Adjustments, Issue Inventory, Warehouse transfer Returns, Invoice, Internal Transfers, Cycle Counting, Cross Docking, Issue Inventory Picking.' },
            { ELEM: 'Click On Save Button to save the Order Sequence Numbers.' },
        ]
    },
    Financial_Configuration: {
        MAIN: 'Financial Year Configuration',
        LIST: [
            { ELEM: 'Enter the Period Name, Financial Year Start Date and Financial Year End Date.' },
            { ELEM: 'Click on Save Button to save the Financial Year.' },
        ]
    },
    Notification_Configuration: {
        MAIN: 'Notification_Configuration',
        LIST: [
            { ELEM: 'Click on Purchase Order role dropdown and select role, select users against that role click on save. Saved users can be viewed in the table icon.' },
            { ELEM: 'Click on Putaway dropdown list and select role, select users against that role click on save. saved users can be viewed in the table icon' },
            { ELEM: 'Click on Sales order role dropdown list and select role, select users against that role click on save. Saved users can be viewed in the table icon.' },
            { ELEM: 'Click on Picking role dropdown list and select role, select users against that role click on save. Saved users can be viewed in the table icon ' },
            { ELEM: 'Click on Expired role dropdown list and select role, select users against that role click on save. Saved users can be viewed in the table icon ' },
            { ELEM: 'Click on Going to expire role dropdown list and select role, select users against that role click on save. Saved users can be viewed in the table icon' },
            { ELEM: 'Click on Zone Capacity role dropdown list and select role, select users against that role click on save. Saved users can be viewed in the table icon ' },
            { ELEM: 'Click on Save option. Record displayed in inventory configuration table.' },
            { ELEM: 'Click on Clear option, to clear entered details in the fields.' },
        ]
    },

    Process_Groups: {
        MAIN: 'Process Group',
        LIST: [
            { ELEM: ' 	 User selection in dropdown list ' },
            { ELEM: ' 	List of process groups are displayed with check list' },
            { ELEM: ' 	Select the check the process groups to be assigned to that role     ' },
            { ELEM: ' 	Click on Update button to save.' },


        ]
    },
    Process_Permissions: {
        MAIN: 'Process Permissions',
        LIST: [
            { ELEM: ' 	 User selection in dropdown list ' },
            { ELEM: ' 	List of process groups with process names are displayed with check list' },
            { ELEM: ' 	 Select the check the process to be assigned to that role      ' },
            { ELEM: ' 	Click on Update button to save.' },


        ]
    },
    WAREHOUSE_CONFIGURATION: {
        MAIN: 'Warehouse Configuration',
        LIST: [
            { ELEM: ' 	Click on user dropdown list and select user   ' },
            { ELEM: ' 	 	Click on Organisation id dropdown list and select the organization ' },
            { ELEM: ' 	 	Click on Warehouseid/name  dropdown list and select warehouse  ' },
            { ELEM: ' 	 	Click on default warehouse id/name dropdown and select one ' },
            { ELEM: ' 	 	Click on Save option. Record displayed in warehouse  configuration table   ' },
            { ELEM: ' 	 	 	Click on Clear option, to clear entered details in the fields  ' },
            { ELEM: ' 	 	 	Click on edit option to give view ,update, delete permissions  ' },
            { ELEM: ' 	 	 	Delete option is used to delete the warehouse configure  available at Action column in data table' },

        ]
    },
    INVENTORY_CONFIGURATION: {
        MAIN: 'Inventory Configuration',
        LIST: [
            { ELEM: ' 	 	Click on Inventory adjustment role dropdown and select role, select users against that role click on save. Saved users can be viewed in the table icon   ' },
            { ELEM: ' 	 	 	Click on Internal Transfers role dropdown list and select role, select users against that role click on save. saved users can be viewed in the table icon ' },
            { ELEM: ' 	 	 	Click on Physical Inventory role dropdown list and select role, select users against that role click on save. Saved users can be viewed in the table icon.  ' },
            { ELEM: ' 	 	 	Click on Cycle counting role dropdown list and select role, select users against that role click on save. Saved users can be viewed in the table icon  ' },
            { ELEM: ' 	 	 	Click on Save option. Record displayed in inventory configuration table.   ' },
            { ELEM: ' 	 	  	Click on Clear option, to clear entered details in the fields.  ' },
        ]
    },

    Report_Configuration: {
        MAIN: 'Report Configuration',
        LIST: [
            { ELEM: ' 	 	User selection point in dropdown list .' },
            { ELEM: ' 	 	List of process name, report names are displayed with check list.' },
            { ELEM: ' 	 	Select the check the report name to be assigned to that role.' },
            { ELEM: ' 	 	Click on Update button to save' },


        ]
    },
    Master_Configuration: {
        MAIN: 'Master Configuration',
        LIST: [
            { ELEM: ' 	 	User selection point in dropdown list ' },
            { ELEM: ' 	 	List of process name, master names are displayed with check list' },
            { ELEM: ' 	 	Select the check the master name to be assigned to that role  ' },
            { ELEM: '  	Click on Update button to save.' },


        ]
    },
    KPI_Configuration: {
        MAIN: 'KPI Configuration',
        LIST: [
            { ELEM: ' 	 	User selection point in dropdown list ' },
            { ELEM: ' 	 	List of process name, KPI names are displayed with check list' },
            { ELEM: '  	Select the check the KPI name to be assigned to that role  ' },
            { ELEM: ' 	Click on Update button to save.' },


        ]
    },
    User_Configurations: {
        MAIN: 'User Configurations',
        LIST: [
            { ELEM: ' 	 	Enter User profile and contact details.' },
            { ELEM: 'User selection point in dropdown list ' },
            { ELEM: ' 	 	Click on Save option. Record displayed in user configuration table.' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels ' },
            { ELEM: ' 	    Edit and delete options are available at Action column in data table.' },

        ]
    },
    login_monitor: {
        MAIN: 'Monitor the Login Part',
        LIST: [
            { ELEM: 'User selection point in dropdown list ' },
        ]
    },
    CYCLE_COUNTING_CONFIG_: {
        MAIN: 'CYCLE COUNTING CONFIG',
        LIST: [
            { ELEM: 'Enter the Cycle Counting Code and select Criteria type like Product Category, Warehouse, Zone, Product Name, Zone, Location, Supplier. ' },
            { ELEM: 'Click on Schedule Button, Popup window will be open to scheduling cycle counting process.' },
            { ELEM: 'Schedule Job displays as Days by default.' },
            { ELEM: 'Enter the recurrence number to scheduling the next Cycle Counting Day and Start date and End date and time. If click on No End Date check box, Continually Cycle counting process will create otherwise cycle counting continued until end date.' },
            { ELEM: 'Click on days check box those are working Days remaining are holidays' },
            { ELEM: 'Click on Save to save the data.' },
            { ELEM: 'Click on Clear to clear the data.' },
            { ELEM: 'By default, status displayed as Created.' },
            { ELEM: 'Select status Confirm to confirm the Cycle Counting Schedule.' }
        ]
    },
    STATUS_CONFIGURATION: {
        MAIN: 'Status COnfiguration',
        LIST: [
            { ELEM: 'Enter the status for all these process Inventory Adjustments, Purchase order, Internal Transfers, Cycle Counting, Warehouse Transfer Create, Warehouse Transfer Approve and Status.' },
        ]
    },
    BillingPO: {
        MAIN: 'Billing to supplier based on Contract Start and contract End Date ',
        LIST: [
            { ELEM: ' 	Billing based on Pallet Position Hired, Additional Pallet Position Hired, Flat Rate, Variable Rate, Mechanical rate, Packing Material, labour Charges' },

        ]
    },
    BillingPOInvoice: {
        MAIN: 'Print Invoice for confirmed Billing PO for the Supplier.',
        LIST: [
            { ELEM: '	Billing Po Invoice is generated based on Billing PO created to the supplier' },
            { ELEM: '	Select Purchase order Id to view the Billing details' },
            { ELEM: 'Click on Print Invoice to print Invoice ' },
        ]
    },
    Packing: {
        MAIN: 'Pack for picked products to dispatch against Sales Order.',
        LIST: [
            { ELEM: ' 	Select the WMSO No, products in the order are displayed in table below' },
            { ELEM: ' 	Enter Packed Qty, Packaging Type, and Packing Material.' },
            { ELEM: ' 	Update status as Completed after completing Packing' },
        ]
    },
    RePacking: {
        MAIN: 'Pack for picked products to dispatch against Sales Order.',
        LIST: [
            { ELEM: ' 	Select the WMSO No, products in the order are displayed in table below' },
            { ELEM: ' 	Enter Repacked Qty, Packaging Type and Packing Material.' },
            { ELEM: ' 	Update status as Completed after completing Repacking' },
        ]
    },
    CoPacking: {
        MAIN: 'Pack for picked products to dispatch against Sales Order.',
        LIST: [
            { ELEM: ' 	Select the WMSO No, products in the order are displayed in table below' },
            { ELEM: ' 	Enter Repacked Qty, Packaging Type and Packing Material.' },
            { ELEM: ' 	Update status as Completed after completing Repacking' },
        ]
    },
    Labeling: {
        MAIN: '',
        LIST: [
            { ELEM: ' 	Select the WMSO No, products in the order are displayed in table below' },
            { ELEM: ' 	 	Enter Customer Confirmation, Packaging Type and Packing Material.' },
            { ELEM: ' 	Update status as Completed after completing Repacking' },
        ]
    },
    Transporter: {

        MAIN: 'Transporter',
        LIST: [
            { ELEM: '  	Enter transporter attributes, transporter address, transporter additional details, transporter bank details.' },
            { ELEM: '  	Click on Save option. Record displayed in transporter table.' },
            { ELEM: '   	Upload Excel option is to upload data through excel.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },
            { ELEM: ' 	 	Download Excel option is to download all organization details through excel. ' }
        ]
    },
    Vehicle_By_Transporter: {
        MAIN: 'Vehicle By Transporter',
        LIST: [
            { ELEM: 'Enter Service ProVider details' },
            { ELEM: 'Tag the respected vehicle number and vehicle id with the service provider name .' },
            { ELEM: 'There is a option to select to select multiple check Box from the list' },
            { ELEM: 'Save the Required Details for Future Use.' },
            { ELEM: '   	Upload Excel option is to upload data through excel.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	Edit and delete options are available at Action column in data table.' },
            { ELEM: ' 	 	Download Excel option is to download all organization details through excel. ' }
        ]
    },
    ABCXYZ_Master: {
        MAIN: 'ABCXYZ_Master',
        LIST: [
            { ELEM: '.Enter ABC class analysis panel details ' },
            { ELEM: '.Click on Save option. Record displayed in ABC-XYZ table' },
            { ELEM: ' Click on Clear option, to clear entered details in the panel.' },
            { ELEM: 'Download Excel option is to download all ABC-XYZ details through excel.' },
            { ELEM: ' Edit and delete options are available at Action column in data table.' }
        ]
    },
}
export const SUBMENU_HELP_FILE = {
    INBOUND: {
        MAIN: 'INBOUND',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },
    OUTBOUND: {
        MAIN: 'OUTBOUND',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },
    INVENTORY: {
        MAIN: 'INVENTORY',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },
    BILLING: {
        MAIN: 'BILLING',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },
    PLANNING_SUBMENU: {
        MAIN: 'PLANNING',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },
    QUALITY: {
        MAIN: 'QUALITY',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },
    ACCOUNTING: {
        MAIN: 'ACCOUNTING',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },
    VALUEADDEDSERVICE: {
        MAIN: 'VALUE ADDED SERVICE',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen.' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },
    WAREHOUSELAYOUT_SUBMENU: {
        MAIN: 'WAREHOUSE LAYOUT',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },
    WORKFORCE_MODULE_SUBMENU: {
        MAIN: 'Work Force Module',
        LIST: [
            { ELEM: 'By selecting menu from home page, it navigates to respective submenu screen' },
            { ELEM: 'Select the submenu to navigate to the respective screen' }
        ]
    },


}

export const HOMEPAGE_HELP_FILE = {
    HOMEPAGE: {
        MAIN: 'Home Page',
        LIST: [
            { ELEM: 'Left Side of the screen has client logo with home text.' },
            { ELEM: 'Middle of the screen contains Modules to navigate to the screens' },
            { ELEM: 'Footer contains Master data, Reports, Dashboard, Configurations, Employee view.' },
            { ELEM: 'Right side of the screen has Notifications and Quick Analytics' },
            { ELEM: 'Header of the screen contains Help icon, user details along with reset password option ' }
        ]

    }
}
export const DASHBOARDS_HELP_FILE = {
    OVER_ALLDASHBOARDS: {
        MAIN: 'Over All dashboard',
        LIST: [
            { ELEM: 'Graphical representation of all incoming orders, putaway, Inventory, sales orders, picking, warehouse capacity, zone capacity, Outgoing Shipments are displayed. ' }
        ]

    },
    SPACE_UTILIZATION_DASHBOARD: {
        MAIN: 'space Utilization',
        LIST: [
            { ELEM: ' 	Overall space is avilalable in warehouse wise ,zone wise displayed  in graph ' },
            { ELEM: ' 	Total space ,usable space,no.of completely available ,partial available unavailable location information displayed in graph ' }
        ]

    },
    INBOUND_DASHBOARD: {
        MAIN: 'Inbound',
        LIST: [
            { ELEM: ' 	 	All inbound pending and delayed records are displayed here ' },
            { ELEM: ' 	 	Pending goods receiving records are displayed in pending goods receiving panel by delayed days ' },
            { ELEM: ' 	 	 	Pending products location allocation are displayed in pending products location allocation panel by delayed days ' },
            { ELEM: ' 	 	 	Pending putaway generation records are displayed in pending putaway generation panel by delayed days  ' },
            { ELEM: ' 	 	 	Pending putaway  records are displayed in pending putaway panel by pending delayed days. ' },
        ]
    },
    OUTBOUND_DASHBOARD: {
        MAIN: 'Outbound',
        LIST: [
            { ELEM: ' 	 	 	All outbound  pending and delayed records are displayed here  ' },
            { ELEM: ' 	 	 	Pending sales order records are displayed in pending sales order panel by delayed days ' },
            { ELEM: ' 	 	 	 	Pending shipment records are displayed in pending pending shipment panel by delayed days ' },
            { ELEM: ' 	 	 	 	Pending picking records displayed in pending picking panel by delayed days   ' },
        ]
    },
    SALES_ANALYTIS_DASHBOARD: {
        MAIN: 'Sales Analytics',
        LIST: [
            { ELEM: ' 	Sales order and shipment order graphs are generated by order wise,region wise,customer wise,product wise and category wise  ' },
            { ELEM: ' 	Graphs are generated  by using filters like last 3 months,last 6 weeks,last 6 montths,last 12 months,previous month,current month to current date,last quarter,finanacial year to date,previous financial year  ,custom dates.' },
        ]
    },
    PURCHASE_ANALYTIS_DASHBOARD: {
        MAIN: 'Purchase Analytics',
        LIST: [
            { ELEM: '	Purcahse order and purchase returns and purchase receive graphs are generated by Order wise,region wise,supplier wise,product wise and category wise   ' },
            { ELEM: ' 	Graphs are generated by using filters like ,last 3 months,last 6 weeks,last 6 months,last 12 months,previous month,current month to current date last quarter,financial year to date,previous financial year,custom dates.' },
        ]
    },
    ABC_ANALYSIS_DASHBOARD: {
        MAIN: 'ABC Analysis',
        LIST: [
            { ELEM: '	ABC graphs are generated based on sales demand and by configured class groups ' },
            { ELEM: '  	Select from and to dates to display the graphs.' },
            { ELEM: ' 	ABC-XYZ graph generated based on sales demand and by configured class groups.' }

        ]
    },
    INVENTORY_DASHBOARD: {
        MAIN: 'Inventory_Dashboard',
        LIST: [
            { ELEM: '	Graphical representation of Stock in Inventory, Inventory accuracy, Turnover days, Top products in inventory, cycle counting, Inventory adjustments, are displayed here.' },
            { ELEM: '  	Total inventory qty and expired products quantities are displayed.' },

        ]
    },
    EMPLOYEE_DASHBOARD: {
        MAIN: 'Employee Dashboard',
        LIST: [
            { ELEM: '	Click on filter like date wise, employee wise task pending, completed and In-process tasks count will display.' },
            { ELEM: '  	Graphical representation of employee tasks pending, completed , In-process count.' },
        ]
    },
    Daily_Operations: {
        MAIN: 'Daily Operations',
        LIST: [
            { ELEM: '	Click on filter with date wise or order wise daily operations displayed. ' },
            { ELEM: '  	Inbound & Outbound Order status Today Dashboard shows count of all operations as per filter date wise in table format.' },
            { ELEM: ' 	Graphical representation of all Inbound operations like unloading, inbound quality check, Purchase order, Good Receiving, Putaway completed count displayed.' },
            { ELEM: ' 	Graphical representation of all outbound operations like sales order, Replenishment order Picking completed outbound quality check, Packing, Labelling, Loading and Shipment order completed count displayed.' }
        ]
    },
    Order_Rate_Dashboard: {
        MAIN: 'Order Rate Dashboard',
        LIST: [
            { ELEM: '	Select the types like year wise, month wise or Day wise and customer wise or order type wise ' },
            { ELEM: '  	Click on Filter to filter the data with selected filter wise' },
            { ELEM: ' 	Order Fill Rate graph represents total number of products completely dispatched.' },
            { ELEM: ' 	Order Fill Rate Percentage Graph represents Percentage of the Total number of products completely dispatched.' },
            { ELEM: ' 	Volume Fill Rate graph represents total dispatched quantity.' },
            { ELEM: ' 	Volume Fill Rate Percentage graph represents Percentage of the dispatched quantity.' },
            { ELEM: ' 	On time Delivery graph represents total number of products delivered on time.' },
            { ELEM: ' 	On time Delivery Percentage graph represents percentage of total number of products delivered on time.' },
            { ELEM: ' 	Perfect order rate graph represents number of products delivered perfectly.' },
            { ELEM: ' 	Perfect order rate percentage graph represents percentage number of products delivered perfectly.' },
            { ELEM: ' 	Perfect volume rate graph represents total quantity dispatched perfectly.' },
            { ELEM: ' 	Perfect volume rate percentage graph represents percentage total quantity dispatched perfectly.' }
        ]
    },
}
export const REPORTS_HELP_FILE = {
    GOODSRECEIVING_REPORTS: {
        MAIN: 'Goods Receiving Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of goods receiving.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Supplier ID/Name, Product ID/Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like WMPO Number, Reference PO Number, Product ID, Product Name, Supplier ID/Name, Order Quantity, Received Quantity, Batch Number, GRN Date, MFG Date, Receipt Date.' },
            { ELEM: ' 	Download Excel option is to download all Goods receiving details through excel. ' }
        ]

    },
    GRN_STAGE_TRANSACTION_REPORTS: {
        MAIN: 'GRN Stage Transaction Report',
        LIST: [
            { ELEM: ' 	 	Click on Generate button to display records of GRN Stage Transaction ' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	 	By using  filters Supplier ID/Name, Product ID/Name, From and To date  and location not allocated,pending putaway generation,pending putaway can also generate report' },
            { ELEM: ' 	 	Report contains details like WMPO Number, Reference PO Number, Product ID, Product Name, Supplier ID/Name,  received quantity Batch Number, GRN Date, MFG Date, Receipt Date,status.' },
            { ELEM: ' 	 	Download Excel option is to download all GRN Stage Transaction details through excel.  ' }
        ]
    },
    GRN_STAGE_SUMMARY_REPORTS: {
        MAIN: 'GRN Stage Summary Report',
        LIST: [
            { ELEM: ' 	 	Click on Generate button to display records of GRN Stage Summary ' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	 	By using  filters Product ID/Name and location not allocated,pending putaway generation,pending putaway can also generate report' },
            { ELEM: ' 	 	Report contains details like Product ID, Product Name,Received quantity.' },
            { ELEM: ' 	 	Download Excel option is to download all GRN Stage Summary details through excel.  ' }
        ]
    },
    GRN_SUMMARY_REPORTS: {
        MAIN: 'GRN Summary Report',
        LIST: [
            { ELEM: ' 	 	Click on Generate button to display records of GRN Summary ' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	 	 	By using filters Supplier id/name,product id/name,Not received,completely received,partially received,serial number,From and To date can also generate report.' },
            { ELEM: ' 	 	 	Report contains details like  Product ID, Product Name, Supplier ID/Name, Product description,product configuration,dfs code,type,serial number,invoice number,invoice date,location name , Received Quantity,Bill of entry no/date,Bill of landing number,vehicle type,vehicle number,container number,LR.No,way bill number, GRN Date, MFG Date, expiry  Date,status.' },
            { ELEM: ' 	 	Download Excel option is to download all GRN Summary details through excel.  ' }
        ]
    },
    GRN_HISTORY: {
        MAIN: 'GRN History Report',
        LIST: [
            { ELEM: ' 	 	Click on Generate button to display records of GRN History ' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	 	By using filters Supplier id/name,product id/name,category,region,last 6 weeks,last 3 months,last 12 months,previous month,current month to current date,last quarter,financial year to date,previous financial year,custom dates can also generate report.' },
            { ELEM: ' 	Report contains details like product id/name,supplier id/name,category,region,received quantity.' },
            { ELEM: ' 	 	Download Excel option is to download all GRN History details through excel.  ' }
        ]
    },
    INVENTORY_BY_PRODUCT: {
        MAIN: 'Inventory By Product Report',
        LIST: [
            { ELEM: ' 	 	Click on Generate button to display records of Inventory By Product ' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	 	 	By using  Zone name,product id/name,category,Supplier,Batch number,Product type,serial number  can also generate the report ' },
            { ELEM: ' 	 	List of Inventory records are displayed with details like Product id ,product name,product type,serial number,Ctegory,type,warehouse name,zone name,rack name,level name,available quantity ,reserved quantity,Batch number ,Mfg data,Expiry date' },
            { ELEM: ' 	 	Download Excel option is to download all Inventory By Product details through excel.  ' }
        ]
    },
    INVENTORY_BY_LOCATION_Report: {
        MAIN: 'Inventory By Location Report',
        LIST: [
            { ELEM: ' 	List of Inventory records are displayed with details like Product ID/Name, Product Name, Product Category, Product Type, Product Class, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Quantity Inventory Unit, Created Date, Storage Unit, Inventory Unit, Available Quantity, Reserved Quantity, Batch Number, Mfg Date, Expiry Date, Shelf Life, Stock Value, Avg Cost Price, Inventory Availability.' },
            { ELEM: ' 	 	 	By using filtersProduct ID/Name, Product Category, Product Type, Warehouse Name, Zone Name, Rack Name, Location Name, can also generate report' },
            { ELEM: ' 	 	Download Excel option is to download all Inventory Transaction  details through excel.  ' }

        ]
    },
    INVENTORY_TRANSACTION_REPORTS: {
        MAIN: 'Inventory Transaction Report',
        LIST: [
            { ELEM: ' 	 	Click on Generate button to display records of Inventory Transaction ' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	 	 	By using filters Transaction type,Product ,Order ID, Zone Name, Rack Name,  Location Name, From and To date can also generate report' },
            { ELEM: ' 	 	 	List of Inventory records are displayed with details like Transaction ID, Supplier ID, Order ID, Line ID, Product ID/Name, Product Name, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Quantity Inventory Unit, Transaction Date, Inventory Unit, Available Quantity, Reserved Quantity, Batch Number, Mfg Date, Expiry Date, Transaction Type.' },
            { ELEM: ' 	 	Download Excel option is to download all Inventory Transaction  details through excel.  ' }
        ]
    },
    INVENTORY_TRANSACTION_DETAILS_REPORTS: {
        MAIN: 'Inventory Transaction Details Report',
        LIST: [
            { ELEM: ' 	 	Click on Generate button to display records of Inventory Transaction Details' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	  	By using filters Transaction type,Product, Order ID, Zone Name, Rack Name,  Location Name, From and To date can also generate report' },
            { ELEM: '	 	 	List of Inventory records are displayed with details like Transaction Details ID, Transaction, Transaction ID, Supplier ID, Order ID, Line ID, Product ID/Name, Product Name, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, Quantity Inventory Unit, Transaction Date, Inventory Unit, Available Quantity, Reserved Quantity, Batch Number, Mfg Date, Expiry Date, Transaction Type, Status.' },
            { ELEM: ' 	 	Download Excel option is to download all Inventory Transaction  details through excel.  ' }
        ]
    },
    OPEN_SALES_ORDER_REPORTS: {
        MAIN: 'Open Sales Order Report',
        LIST: [
            { ELEM: ' 	 	 	Click on Generate button to display records of open sales order list.' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	   	By using filters customer id/name,product id/name ,from and to dates can also generate the report' },
            { ELEM: '	 	List of open sales order records are displayed with details like wmso number,product id,product name,customer id ,customer name,order qty,order date,expected delivery date' },
            { ELEM: ' 	 	 	Download Excel option is to download all open sales order   through excel.  ' }
        ]
    },
    SHIPMENT_ORDER_REPORTS: {
        MAIN: 'Shipment Order Report',
        LIST: [
            { ELEM: ' 	 	 	 	Click on Generate button to display records of shipment Order.' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	    	By using filters Customer ID/Name, Product ID/Name, From and To date can also generate report' },
            { ELEM: '	 	 	List of serial number records are  displayed  details like WMSO Number, Reference SO Number, Product ID, Product Name, Customer ID, Customer Name, Order Quantity, Shipped Quantity, Batch Number, Order Date, created Date.' },
            { ELEM: ' 	 	 	Download Excel option is to download all shipping orders  through excel.  ' }
        ]
    },
    SHIPMENT_HISTORY_REPORTS: {
        MAIN: 'Shipment History Report',
        LIST: [
            { ELEM: ' 	 	 	 	Click on Generate button to display records of shipment Order.' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	    	 	By using filters Customer ID/Name, Product ID/Name, Last 6 weeks,last 3 months,last 12 months,previous month,current month to current date,last quarter,Financial year to date,previous financial year,custom dates. can also generate report' },
            { ELEM: '	 	 	 	Reports contains details like S.No ,Product id,Product name,quantity' },
            { ELEM: ' 	 	 	Download Excel option is to download all shipping orders  through excel.  ' }
        ]
    },
    SHIPMENT_REPORTS: {
        MAIN: 'Shipment  Report',
        LIST: [
            { ELEM: ' 	 	 	 	Click on Generate button to display records of shipment.' },
            { ELEM: ' 	 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	    	 	By using filters Customer ID/Name, Product ID/Name, From and To date can also generate report' },
            { ELEM: '	 	 	 	Report contains details like WMSO Number, Reference SO Number, Product ID, Product Name, Customer ID, Customer Name, Order Quantity, Shipped Quantity, Batch Number, Order Date, created Date.' },
            { ELEM: ' 	 	 	Download Excel option is to download all shipping   through excel.  ' }
        ]
    },
    PUTAWAY: {
        MAIN: 'putaway Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of putaway' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like Putaway No, Product ID, Product Name, Location Name, Putaway Quantity, Putaway Executive, Created On, Completed Date, Start Time, End Time, Status' },
            { ELEM: ' 	Download Excel option is to download all putaway details through excel. ' }
        ]

    },
    RETURNS: {
        MAIN: 'Returns Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of goods receiving.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Supplier ID/Name, Product ID/Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like WMSO Number, Product ID, Product Name, return Quantity, Return Date' },
            { ELEM: ' 	Download Excel option is to download all Goods receiving details through excel. ' },
        ]

    },
    INVENTORY_SUMMARY: {
        MAIN: 'Inventory Summary Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of Inventory.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like Putaway No, Product ID, Product Name, Quantity, Batch Number, Location Name, Created Date.' },
            { ELEM: ' 	Download Excel option is to download all Inventory details through excel. ' },
        ]

    },
    CYCLE_COUNTING: {
        MAIN: 'Cycle Counting Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of Cycle Counting.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details Cycle Counting Number, Cycle Counting Criteria, Created Date, Cycle Counting Date, Product ID/Name, Batch Number, Actual Quantity, Available Quantity, Warehouse Name, Zone Name, Rack Name, Level Name, Location Name.' },
            { ELEM: ' 	Download Excel option is to download all cycle counting details through excel. ' },
        ]

    },
    INVENTORY_ADJUSTMENT: {
        MAIN: 'Inventory Adjustment Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of Inventory Adjustments.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Product ID/Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details Product ID, Product Name, Product Category, Created Date, Adjusted Quantity, Available Quantity, Reserved Quantity, Location Name, Inventory Adjustment Type, Completed Date.' },
            { ELEM: ' 	Download Excel option is to download all Inventory Adjustments details through excel. ' },
        ]

    },

    PICKING: {
        MAIN: 'Picking Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of picking.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like Picking No, Product ID, Product Name, Location Name, Picking Quantity, Picking Executive, Created On, Completed Date, Start Time, End Time, Status' },
            { ELEM: ' 	Download Excel option is to download all picking details through excel. ' },
        ]

    },
    PICKLIST: {
        MAIN: 'Picking List Report',
        LIST: [
            { ELEM: ' 	 	Click on Generate button to display records of picking.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Warehouse Name, Zone Name, Rack Name, Level Name, Location Name, From and To date can also generate report' },
            { ELEM: ' 	Report contains details like Picking No, Product ID, Product Name, Location Name, Picking Quantity, Picking Executive, Created On, Completed Date, Start Time, End Time, Status ' },
            { ELEM: ' 	Download Excel option is to download all picking details through excel. ' },
        ]
    },
    SPACE_UTILIZATION_REPORT: {
        MAIN: 'Space Utilization Report',
        LIST: [
            { ELEM: ' 	Click on Generate button to display records of confirm Space utilization.' },
            { ELEM: ' 	Click on Clear option, to clear entered details in the panels.' },
            { ELEM: ' 	By using filters Zone Name, Supplier ID/Name, Location Name, Rack Name generate report.' },
            { ELEM: ' 	Download Excel option is to download all Space Utilization Report details through excel. ' },
        ]
    },


}
