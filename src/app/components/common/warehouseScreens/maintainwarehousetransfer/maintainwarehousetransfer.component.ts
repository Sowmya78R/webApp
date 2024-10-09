import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/constants/constants';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Storage } from 'src/app/shared/utils/storage';
import * as FileSaver from 'file-saver';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { DecimalUtils } from 'src/app/constants/decimal';

@Component({
  selector: 'app-maintainwarehousetransfer',
  templateUrl: './maintainwarehousetransfer.component.html',
  styleUrls: ['./maintainwarehousetransfer.component.scss']
})
export class MaintainwarehousetransferComponent implements OnInit, OnDestroy {
  whTransferForm: FormGroup;
  sourceWareHouses: CompleterData;
  productsData: CompleterData;
  products: any = [];
  warehousesData: any = [];
  wareHouseTransferLine: FormGroup;
  destinationFormObj = this.configService.getGlobalpayload();
  globalFormObj = this.configService.getGlobalpayload();
  sourceFormObj = {};
  allocationType: any = 'Manual';
  returnShowValues: any;
  units: any = [];
  idForUpdate = this.appService.getParam('id');
  pickupLocationValues: CompleterData;
  pickupLocations: any = [];
  returnALLocations: any[];
  batchNumberIDs: CompleterData;
  serialNumberIDs: CompleterData;
  enableTransfer: Boolean = true;
  overAllLines: any = [];
  deleteInfo: any;
  permissionsList: any = null;
  globalIdforDelete: any = null;
  productLogo: any;
  showImage: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  productCategories: any = [];
  taxData: any = [];
  taxIDs: any = [];
  uomConversions: any = [];
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  tempMoq: number = 0;
  priceFromBE: number = 0;
  taxExemption: any = '';
  showTable: boolean = true;
  editShippingDetailsFrom: FormGroup;
  editShippingDetailsTo: FormGroup;
  isReadMode: boolean = true;
  expectedDeliveryDate: any = null;
  inSource: boolean = false;
  selectedLine: any = null;
  selectedLineIndex: any = null;
  uploadFiles: any = [];
  createPermissionToggle: any = false;
  approvePermissionToggle: any = false;
  createStatusObj = { 'status': null, 'statusSequence': null };
  createTotalStatusCount: number = 0;
  approveStatusObj = { 'status': null, 'statusSequence': null };
  approveTotalStatusCount: number = 0;
  showDraft: Boolean = false;
  showApprove: Boolean = false;
  noApprovals: Boolean = false;
  sourcenoApprovals: Boolean = false;
  overAllShipTo: any = null;
  overAllBillTo: any = null;
  showTooltip: any = false;
  shipTOAddressDropdown: any = [];
  billTOAddressDropdown: any = [];
  createPage: any = 1;
  itemsPerPageCreate: any = 10;
  createTotalItems: any;
  searchKey: any = null;

  constructor(private configService: ConfigurationService, private fb: FormBuilder, private metaDataService: MetaDataService,
    private wmsService: WMSService, private mData: MetaDataService, private datepipe: DatePipe, private excelService: ExcelService,
    private appService: AppService, private toastr: ToastrService, private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService, private commonMasterDataService: CommonMasterDataService) {
    this.translate.use(this.language);
    if (sessionStorage.getItem('module') === 'Inbound') {
      this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inbound', 'Inbound Warehouse Transfer', Storage.getSessionUser());
    }
    else if (sessionStorage.getItem('module') === 'Outbound') {
      this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Outbound', 'Outbound Warehouse Transfer', Storage.getSessionUser());
    }
    else {
      this.permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inventory', 'Warehouse Transfer', Storage.getSessionUser());
    }
  }

  ngOnInit() {
    this.createForm();
    this.createLinesForm();
    this.getPermissions();
    this.createShippingDetailsForm();
    this.fetchAllProductCategories();
    this.fetchAllWarehouseDetails();
    if (this.idForUpdate) {
      this.editbyId(this.idForUpdate, 1);
    }
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  setJsonto(event, key) {
    if (event) {
      if (key == 'shipToAddress') {
        const shiTo = this.shipTOAddressDropdown.find(x => x.name == event.target.value);
        this.whTransferForm.controls.shipToAddress.setValue(shiTo);
        this.overAllLines.forEach((element, i) => {
          element.shipToAddress = shiTo;
        })
      }
      else {
        const bilTo = this.billTOAddressDropdown.find(x => x.name == event.target.value);
        this.whTransferForm.controls.billToAddress.setValue(bilTo);
        this.overAllLines.forEach((element, i) => {
          element.billToAddress = bilTo;
        })
      }
      const form = this.whTransferForm.value;
      form['wareHouseTransferLines'] = this.overAllLines;
      this.wmsService.getWarehouseTransferPriceMulti(form).subscribe(res => {
        // console.log(res);
        if (res['status'] == 0 && res['data'].wareHouseTransfer) {
          this.overAllLines = JSON.parse(JSON.stringify(res['data'].wareHouseTransfer.wareHouseTransferLines));

          this.overAllLines.forEach((ele, i) => {
            ele.expectedDeliveryDate = ele.expectedDeliveryDate ? this.datepipe.transform(new Date(ele.expectedDeliveryDate), 'yyyy-MM-dd') : null
            // ele['shipFromAddressDropdown'] = this.warehousesData.find(x => x.wareHouseIDName == ele.sourceWareHouseInfo.wareHouseIDName).shipFromAddresses;
            // ele.shipFromAddress = ele['shipFromAddressDropdown'].find(x => x.defaultAddress);
            this.calculate(ele, i);
            if (i == this.overAllLines.length) {
              this.calculateNetAmount();
            }
          })
        }
      })
    }
  }
  setshipFrominTable(event, i, data) {
    const obj1 = this.warehousesData.find(x => x.wareHouseIDName == data.sourceWareHouseInfo.wareHouseIDName);
    this.wmsService.fetchAllWarehouses({ "wareHouseIDName": obj1.wareHouseIDName, "organizationIDName": obj1.organizationInfo.organizationIDName }).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          const obj = response.data.wareHouses[0]['shipFromAddresses'].find(x => x.name == event.target.value);
          if (obj) {
            this.overAllLines.forEach((ele, index) => {
              if (ele.sourceWareHouseInfo.wareHouseIDName == data.sourceWareHouseInfo.wareHouseIDName) {
                ele.shipFromAddress = obj;
                this.overAllLines[i]['shipFromAddresses'] = response.data.wareHouses[0].shipFromAddresses;
                this.overAllLines[index]['shipFromAddresses'] = response.data.wareHouses[0].shipFromAddresses;
              }
            });
            data.shipFromAddress = obj;
            this.overAllLines[i].shipFromAddress = obj ? obj : null;
          }
        }
      })
  }
  getPermissions(destinationObj?) {
    this.configService.getAllInventoryConfiguration(destinationObj ? destinationObj : this.globalFormObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['processConfigurations'] && res['data']['processConfigurations'].length > 0) {
        if (res['data']['processConfigurations'].find(x => x.name == 'Warehouse Transfer Create')) {
          const havePermission = res['data']['processConfigurations'].find(x => x.name == 'Warehouse Transfer Create');
          if (havePermission && havePermission.processStatusPolicies && havePermission.processStatusPolicies.length > 0) {
            this.createTotalStatusCount = havePermission.processStatusPolicies.length;
            const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).authorities[0].authority;
            const loginUser = JSON.parse(sessionStorage.getItem('dli-wms-user')).username;
            havePermission.processStatusPolicies.forEach(outer => {
              const rolesStatusIndex = outer.statusRoleConfigurations.findIndex(x => x.role.roleName == loginUserRole);
              if (rolesStatusIndex != -1 && !this.createPermissionToggle) {
                const listOfUsers = outer.statusRoleConfigurations[rolesStatusIndex].userInfos.map(x => x.email);
                this.createPermissionToggle = (listOfUsers.includes(loginUser)) ? true : false;
                if (this.createPermissionToggle) {
                  this.createStatusObj = { 'status': outer.status, 'statusSequence': outer.statusSequence };
                  this.createTotalStatusCount = havePermission.processStatusPolicies.length;
                }
                if (!listOfUsers || (listOfUsers && listOfUsers.length == 0)) {
                  this.noApprovals = true;
                }
                // else {
                //   this.createTotalStatusCount = 0;
                //   if (destinationObj) {
                //     this.createTotalStatusCount = havePermission.processStatusPolicies.length;
                //   }
                // }
              }
              else {
                this.createPermissionToggle = this.createPermissionToggle ? this.createPermissionToggle : false;
                // if (!this.createPermissionToggle) {
                //   this.createTotalStatusCount = 0;
                //   if (destinationObj) {
                //     this.createTotalStatusCount = havePermission.processStatusPolicies.length;
                //   }
                // }
              }
            });
          }
          else {
            this.noApprovals = true;
            this.createPermissionToggle = false;
            this.createTotalStatusCount = 1;
            if (destinationObj) {
              this.createTotalStatusCount = havePermission.processStatusPolicies.length;
            }
          }
        }
        else {
          this.noApprovals = true;
          this.createPermissionToggle = false;
          this.createTotalStatusCount = 1;
        }
      }
      else {
        this.noApprovals = true;
        this.createPermissionToggle = false;
        this.createTotalStatusCount = 1;
      }
      console.log(this.createPermissionToggle);
      console.log(this.createTotalStatusCount);
    })
  }
  createShippingDetailsForm() {
    this.editShippingDetailsFrom = new FormBuilder().group({
      contactName: [''],
      phoneNumber: [''],
      email: [''],
      address: [''],
      city: [''],
      country: [''],
      state: [''],
      pin: [''],
    });
    this.editShippingDetailsTo = new FormBuilder().group({
      contactName: [''],
      phoneNumber: [''],
      email: [''],
      address: [''],
      city: [''],
      country: [''],
      state: [''],
      pin: [''],
    });
  }
  setDeliveryDate(event) {
    if (event && this.overAllLines.length > 0) {
      this.overAllLines.forEach(element => {
        element.expectedDeliveryDate = event.target.value;
      });
    }
  }
  fetchShippingDetails() {
    this.wmsService.fetchWareHouseDetailsByID(Constants.WAREHOUSE_ID, this.globalFormObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouse) {
          this.editShippingDetailsTo.patchValue(response.data.wareHouse);
        } else {
        }
      },
      (error) => {
      });
    this.wmsService.fetchAllWarehouses({ "wareHouseIDName": this.sourceFormObj['wareHouseIDName'] }).subscribe(res => {
      if (res['status'] == 0 && res.data.wareHouses) {
        this.editShippingDetailsFrom.patchValue(res.data.wareHouses[0]);
      }
    })
  }
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.productCategories = response.data.productCategories;
        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
  editbyId(id, page) {
    // const _id = id ? id : this.idForUpdate;
    const form = {
      "page": page ? page : 1,
      "pageSize": this.itemsPerPageCreate,
      "sortDirection": null,
      "sortFields": null,
      "searchOnKeys": null,
      "searchKeyword": null,
      _id: id ? id : this.idForUpdate,
      "organizationIDName": this.destinationFormObj.organizationIDName,
      "wareHouseIDName": this.destinationFormObj.wareHouseIDName,
    }

    this.wmsService.getWTDetailsByIDPaginations(form).subscribe(data => {
      if (data['status'] == 0 && data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer) {
        this.createTotalItems = data['data'].wareHouseTransferPaginationResponse.totalElements
        if (data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.sourceWareHouseInfo) {
          if (this.globalFormObj.wareHouseIDName == data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.sourceWareHouseInfo.wareHouseIDName) {
            this.inSource = true;
          }
          else {
            this.inSource = false;
          }
        }
        else {
          this.inSource = false;
        }
        this.overAllLines = JSON.parse(JSON.stringify(data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.wareHouseTransferLines));

        this.overAllLines.forEach(ele => {
          ele.expectedDeliveryDate = ele.expectedDeliveryDate ? this.datepipe.transform(new Date(ele.expectedDeliveryDate), 'yyyy-MM-dd') : null
          // ele['shipFromAddressDropdown'] = this.warehousesData.find(x => x.wareHouseIDName == ele.sourceWareHouseInfo.wareHouseIDName).shipFromAddresses;
          // ele.shipFromAddress = ele.shipFromAddress ? ele.shipFromAddress : ele['shipFromAddressDropdown'].find(x => x.defaultAddress);
        })
        if (!data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.sourceWareHouseInfo || !data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.sourceWareHouseInfo.wareHouseIDName) {
          data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.sourceWareHouseInfo = {
            wareHouseID: null,
            wareHouseIDName
              :
              null,
            wareHouseMasterID
              :
              null,
            wareHouseName
              :
              null
          }
        }
        this.whTransferForm.patchValue(data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer);
        // this.findAllTaxes();
        this.findAllUOMS();
        if (data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.proofOfDeliveryFiles && data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.proofOfDeliveryFiles.length > 0) {
          this.uploadFiles = data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.proofOfDeliveryFiles
        }
        if (this.whTransferForm.controls.statusStages.value.length > 0 && this.whTransferForm.controls.statusStages.value[this.whTransferForm.controls.statusStages.value.length - 1].statusSequence < (this.createTotalStatusCount + 1)) {
          this.showDraft = true;
        }
        else {
          this.showApprove = true;
          const arr = this.whTransferForm.controls.statusStages.value.map(x => x.status);
          if (arr.includes('Approved') || arr.includes('Rejected')) {
            this.showApprove = false;
          }
          this.inSource = true;
          if (this.globalFormObj.wareHouseIDName != data['data'].wareHouseTransferPaginationResponse.wareHouseTransfer.sourceWareHouseInfo.wareHouseIDName) {
            this.inSource = false;
          }
        }
        if (this.inSource) {
          let destinationObj = {};
          destinationObj['wareHouseIDName'] = this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseIDName;
          destinationObj['organizationIDName'] = this.whTransferForm.controls.destinationOrganizationInfo.value.organizationIDName;

          this.getPermissions(destinationObj);
        }
        this.shipTOAddressDropdown = this.warehousesData.find(x => x.wareHouseIDName == this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseIDName).shipToAddresses;

        const shiTo = this.shipTOAddressDropdown.find(x => x.defaultAddress);
        if (!this.whTransferForm.controls.shipToAddress.value) {
          this.whTransferForm.controls.shipToAddress.setValue(shiTo);
        }
        this.overAllShipTo = this.whTransferForm.controls.shipToAddress.value.name;

        this.billTOAddressDropdown = this.warehousesData.find(x => x.wareHouseIDName == this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseIDName).billToAddresses;
        const bilTo = this.billTOAddressDropdown.find(x => x.defaultAddress);
        if (!this.whTransferForm.controls.billToAddress.value) {
          this.whTransferForm.controls.billToAddress.setValue(bilTo);
        }
        this.overAllBillTo = this.whTransferForm.controls.billToAddress.value.name;


        this.overAllLines.forEach((element, i) => {
          element.shipToAddress = this.whTransferForm.controls.shipToAddress.value;
          element.billToAddress = this.whTransferForm.controls.billToAddress.value;
          this.calculate(element, i);
          if (i == this.overAllLines.length) {
            this.calculateNetAmount();
          }
        });
        // if (this.whTransferForm.controls.status.value == 'Confirmed') {
        //   this.whTransferForm.disable();
        //   this.wareHouseTransferLine.disable();
        // }
        this.framingSourceObj(this.whTransferForm.value.sourceWareHouseInfo.wareHouseIDName);
        this.fetchShippingDetails();
      }
      else {
        this.appService.navigate('/wareHouseTransfer');
      }
    })
  }
  ngOnDestroy(): void {
  }
  setOrderQty() {
    this.overAllLines.forEach((element, i) => {
      element.orderQuantity = element.customerOrderQuantity;
      this.calculateTransferQty(element, i)
    });
  }
  createForm() {
    this.whTransferForm = this.fb.group({
      _id: null,
      raiseWTStatus: null,
      wareHouseTransferTransactionID: null,
      wareHouseTransferTransactionIDPrefix: null,
      fullWareHouseTransferTransactionID: null,
      organizationInfo: this.configService.getOrganization(),
      wareHouseInfo: this.configService.getWarehouse(),
      destinationWareHouseInfo: this.fb.group(this.configService.getWarehouse()),
      wareHouseTransferLines: [],
      draftApproval: null,
      backOrder: null,
      sourceWareHouseInfo: this.fb.group({
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      }),
      statusStages: [],
      statusStage: null,
      createdDate: null,
      totalNetAmount: null,
      shipToAddress: null,
      shipFromAddress: null,
      billToAddress: null,
      proofOfDeliveryFiles: null,
      wareHouseTransferRequestFromInfo: {
        "_id": null,
        "wareHouseTransferTransactionID": null,
        fullWareHouseTransferTransactionID: null,
        wareHouseTransferTransactionIDPrefix: null,
      }, confirmedBy: null,
      confirmedDate
        :
        null,

      createdBy
        : null,
      rejectedBy
        :
        null,
      rejectedDate
        :
        null,
      wareHouseTransferRequestToInfo
        :
        null,
      sourceOrganizationInfo: null,
      destinationOrganizationInfo: null,

      totalDiscount
        :
        null,
      totalDiscountAmount
        :
        null,
      totalGrossAmount
        :
        null,
      totalSaleTaxes
        :
        null,
      totalTaxAmount
        :
        null,
      totalTaxPercentage
        :
        null
    })
  }

  createLinesForm() {
    this.wareHouseTransferLine = this.fb.group(
      {
        "_id": null,
        "productMasterInfo": this.fb.group({
          "productMasterID": null,
          "productID": null,
          "productName": null,
          "productIDName": null,
          "moq": null,
          "leadTime": null,
          "receivingUnit": null,
          "isActive": true,
          "price": null
        }),
        productCategoryInfo: this.fb.group({
          productCategoryID: null,
          productCategory: null,
          productCategoryName: null
        }),
        productImage: null,
        "quantityInventoryUnit": null,
        "transferQuantity": null,
        "orderQuantity": null,
        "discount": null,
        "unitPrice": null,
        "orderUnitPrice": null,
        "grossAmount": null,
        "saleTaxes": null,
        "taxAmount": null,
        "netAmount": null,
        "taxPercentage": null,
        "discountAmount": null,
        "currency": null,
        "customerOrderQuantity": null,
        // "markupPercentage": null,
        "shipmentUnit": null,
        "inventoryUnit": null,
        "inventoryHelpers": [[]],
        "locationAllocationType": this.allocationType,
        "requestedDate": this.datepipe.transform(new Date(), 'yyyy-MM-dd')
      }
    )
  }
  calculate(fromTable?, i?) {
    let amount: any = 0;
    let taxes: any = 0;
    let taxPercentage: any = 0;
    const soLine = fromTable ? fromTable : this.wareHouseTransferLine.value;
    let qty: any = null;
    // if (this.globalFormObj.wareHouseIDName != this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName) {
    //   qty = soLine.customerOrderQuantity;
    // }
    // if (this.globalFormObj.wareHouseIDName == this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName) {
    //   qty = soLine.orderQuantity;
    // }
    if (!this.inSource) {
      qty = soLine.customerOrderQuantity;
    }
    if (this.inSource) {
      qty = soLine.orderQuantity;
    }
    if (soLine.orderUnitPrice && qty) {
      amount = DecimalUtils.multiply(soLine.orderUnitPrice, qty);
      if (fromTable) {
        this.overAllLines[i]['grossAmount'] = amount;
      }
      else {
        this.wareHouseTransferLine.controls.grossAmount.setValue(amount);
      }
      if (soLine.discount) {
        amount = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(soLine.discount, 100)), amount);

        if (fromTable) {
          this.overAllLines[i]['discountAmount'] = (DecimalUtils.subtract(this.overAllLines[i].grossAmount, amount))
        }
        else {
          this.wareHouseTransferLine.controls.discountAmount.setValue((DecimalUtils.subtract(this.wareHouseTransferLine.controls.grossAmount.value, amount)));
        }
      }
      if (this.taxExemption && this.taxExemption == 'Yes') {
        soLine.taxAmount = 0;
        this.wareHouseTransferLine.controls.taxAmount.setValue(0);
        this.wareHouseTransferLine.controls.saleTaxes.setValue(null);
        soLine.saleTaxes = [];
      }

      if (fromTable && soLine.taxExemption == 'Yes') {
        this.overAllLines[i]['taxAmount'] = 0;
        this.overAllLines[i]['saleTaxes'] = [];
      }
      if (soLine.saleTaxes && soLine.saleTaxes.length > 0) {
        soLine.saleTaxes.forEach(el => {
          if (fromTable) {
            taxPercentage = DecimalUtils.add(taxPercentage, el.taxPercentage);
            this.overAllLines[i]['taxPercentage'] = taxPercentage
          }
          else {
            let filter = this.taxData.find(x => x.taxNamePercentage == el);
            taxPercentage = DecimalUtils.add(taxPercentage, (filter ? filter.taxPercentage : 0));
            this.wareHouseTransferLine.controls.taxPercentage.setValue(taxPercentage);
          }

        });
        // soLine.taxAmount = ((amount * (1 + (taxPercentage) / 100)) - amount);
        soLine.taxAmount = DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(taxPercentage, 100), 1), amount), amount);

        if (fromTable) {
          this.overAllLines[i]['taxAmount'] = soLine.taxAmount;
        }
        else {
          this.wareHouseTransferLine.controls.taxAmount.setValue(soLine.taxAmount);
        }
        taxes = soLine.taxAmount;
      }
      else {
        this.overAllLines[i]['taxAmount'] = 0;

      }
      if (fromTable) {
        this.overAllLines[i]['netAmount'] = (DecimalUtils.add(amount, taxes));
        this.calculateNetAmount();
      }
      else {
        this.wareHouseTransferLine.controls.netAmount.setValue(DecimalUtils.add(amount, taxes));
      }
    }
    else {
      if (fromTable) {
        this.overAllLines[i]['netAmount'] = null;
        this.overAllLines[i]['grossAmount'] = null;
        this.overAllLines[i]['taxAmount'] = null;
        this.overAllLines[i]['taxPercentage'] = null;
        this.overAllLines[i]['discountAmount'] = null;
        this.calculateNetAmount();
      }
      else {
        this.wareHouseTransferLine.controls.netAmount.setValue(null);
        this.wareHouseTransferLine.controls.grossAmount.setValue(null);
        this.wareHouseTransferLine.controls.taxAmount.setValue(null);
        this.wareHouseTransferLine.controls.taxPercentage.setValue(null);
        this.wareHouseTransferLine.controls.discountAmount.setValue(null);
      }
    }

  }
  totalAmountWithDecimals: any;
  calculateNetAmount() {
    let totalAmount: any = 0;
    let grossAmount: any = 0;
    let taxAmount: any = 0;
    let discount: any = 0;
    let discountAmount: any = 0;
    let taxPercentage: any = 0;
    let saleTaxes = [];
    if (this.overAllLines.length > 0) {
      this.overAllLines.forEach(product => {
        totalAmount = DecimalUtils.add(totalAmount, product.netAmount);
        grossAmount = DecimalUtils.add(grossAmount, product.grossAmount);
        taxAmount = DecimalUtils.add(taxAmount, product.taxAmount);
        if (product.discount && product.discountAmount) {
          discount = DecimalUtils.add(discount, product.discount);
          discountAmount = DecimalUtils.add(discountAmount, product.discountAmount);
        }
        taxPercentage = DecimalUtils.add(taxPercentage, product.taxPercentage);
        if (product.saleTaxes && product.saleTaxes.length) {
          saleTaxes = [...saleTaxes, ...product.saleTaxes];
        }
      });
    }
    let grouped = saleTaxes.reduce(
      (result: any, currentValue: any) => {
        (result[currentValue['taxNamePercentage']] = result[currentValue['taxNamePercentage']] || []).push(currentValue);
        return result;
      }, {});
    this.whTransferForm.controls.totalNetAmount.setValue(totalAmount);
    this.whTransferForm.controls.totalGrossAmount.setValue(grossAmount);
    this.whTransferForm.controls.totalTaxAmount.setValue(taxAmount);
    this.whTransferForm.controls.totalDiscount.setValue(discount);
    this.whTransferForm.controls.totalDiscountAmount.setValue(discountAmount);
    this.whTransferForm.controls.totalTaxPercentage.setValue(taxPercentage);
    if (grouped) {
      this.whTransferForm.controls.totalSaleTaxes.setValue(null);
      const form = [];
      const headers = Object.keys(grouped);
      headers.forEach(element => {
        let taxA: any = 0;
        grouped[element].forEach(tax => {
          taxA = DecimalUtils.add(taxA, tax.taxAmount);
        });
        form.push({
          taxAmount: taxA,
          taxName: element.split(':')[0],
          taxNamePercentage: element,
          taxPercentage: element.split(':')[1],
        })
        this.whTransferForm.controls.totalSaleTaxes.setValue(form);
      });
    }

    this.totalAmountWithDecimals = totalAmount.toFixed(2);
  }
  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      // this.globalIdforDelete = data;
      this.deleteInfo = { name: 'wareHouseTransfer', id: this.whTransferForm.value._id, lineID: data._id };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }

  getConfirmation(status) {
    if (status === 'Yes') {
      this.editbyId(this.idForUpdate, this.createPage);
    }
  }
  // getConfirmation(status) { //for Panel View//
  //   if (status === 'Yes') {
  //     if (this.whTransferForm.controls.wareHouseTransferLines.value.length > 0) {
  //       this.whTransferForm.controls.wareHouseTransferLines.value.forEach((line, index) => {
  //         if (line._id === this.globalIdforDelete) {
  //           this.whTransferForm.controls.wareHouseTransferLines.value.splice(index, 1);
  //         }
  //       });
  //     }
  //   }
  // }
  reset() {
    this.createLinesForm();
    this.returnShowValues = null;
    // this.allocationType = 'Manual';
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    this.whTransferForm.controls.wareHouseTransferLines.setValue(JSON.parse(JSON.stringify(this.overAllLines)));
  }
  edit(data) {
    this.productLogo = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    this.reset();
    data.locationAllocationType = this.allocationType;
    if (!data.productCategoryInfo) {
      data.productCategoryInfo = {
        productCategoryID: null,
        productCategory: null,
        productCategoryName: null
      }
    }
    this.wareHouseTransferLine.patchValue(data);
    if (data.saleTaxes && data.saleTaxes.length > 0) {
      this.wareHouseTransferLine.controls.saleTaxes.patchValue(data.saleTaxes.map(x => x.taxNamePercentage));
      this.taxData = data.saleTaxes;
    }
    if (data.productImage && this.showImage) {
      const fileNames = JSON.parse(JSON.stringify(data.productImage));
      this.metaDataService.viewImages(fileNames).subscribe(data => {
        if (data['status'] == 0) {
          this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
          this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
          this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
        }
      });
    }
    this.wareHouseTransferLine.controls.requestedDate.patchValue(data.requestedDate ? this.datepipe.transform(new Date(data.requestedDate), 'yyyy-MM-dd') : this.datepipe.transform(new Date(), 'yyyy-MM-dd'))
    if (this.wareHouseTransferLine.controls.inventoryHelpers.value) {
      const updatedLocationsList = this.wareHouseTransferLine.controls.inventoryHelpers.value;
      this.returnShowValues = (updatedLocationsList.length > 0) ? updatedLocationsList.map(x => x.locationInfo.locationName).toString() : '';
    }
    if (this.whTransferForm.controls.wareHouseTransferLines.value.length > 0) {
      this.whTransferForm.controls.wareHouseTransferLines.value.forEach((line, index) => {
        if (line._id === data._id) {
          this.whTransferForm.controls.wareHouseTransferLines.value.splice(index, 1);
        }
      });
    }
    // if (this.globalFormObj.wareHouseIDName != this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName) {
    //   this.fetchPrice();
    // }
  }
  fetchPickingAllocationTpe() {
    this.allocationType = 'Manual'
    this.mData.getLocationAllocationType(this.sourceFormObj).subscribe(res => {
      if (res.status == 0 && res.data.pickingLocationAllocationConfigurations && res.data.pickingLocationAllocationConfigurations.length > 0) {
        this.allocationType = res.data.pickingLocationAllocationConfigurations[0].pickingLocationAllocationType;
        this.wareHouseTransferLine.controls.locationAllocationType.setValue(res.data.pickingLocationAllocationConfigurations[0].pickingLocationAllocationType);
        if (this.overAllLines) {
          this.overAllLines.forEach(element => {
            if (!element.locationAllocationType) {
              element.locationAllocationType = res.data.pickingLocationAllocationConfigurations[0].pickingLocationAllocationType;
            }
          });
        }
      }
    })
  }
  fetchAllWarehouseDetails() {
    this.metaDataService.getImageConfigbyName(this.configService.getGlobalpayload()).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Warehouse Transfer') ? true : false;
      }
    })
    this.wmsService.fetchAllWarehouses({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.warehousesData = JSON.parse(JSON.stringify(response.data.wareHouses));
          this.sourceWareHouses = response.data.wareHouses.map(x => x.wareHouseIDName);
          if (this.sourceWareHouses['length'] > 0) {
            const abc: any = this.sourceWareHouses;
            this.sourceWareHouses = abc.filter(x => x != this.whTransferForm.controls.destinationWareHouseInfo.value.wareHouseIDName)
          }
        }
      })
  }
  openModalRecievedLocations(fromTable?, line?, i?) {
    this.selectedLine = fromTable ? line : null;
    if (this.permissionsList.includes('Update')) {
      this.selectedLineIndex = i;
      const value = fromTable ? line : this.wareHouseTransferLine.value;
      if (value && value.transferQuantity) {
        const productDetails = this.products.find(x => x.productIDName == value.productMasterInfo.productIDName);
        this.ngxSmartModalService.getModal('pickupLocationsModal').open();
        this.getLocations({
          "productMasterID": productDetails._id,
          "productID": productDetails.productID,
          "productName": productDetails.productName,
          "productIDName": productDetails.productIDName,
          "brandName": value.brandName
        });
      }
      else {
        this.toastr.error("Enter Manditory Fields!!")
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  framingSourceObj(event) {
    if (event) {
      const wareHouseDetails = this.warehousesData.find(x => x.wareHouseIDName == event);
      this.whTransferForm.controls.sourceWareHouseInfo.patchValue(wareHouseDetails);
      this.whTransferForm.controls.sourceWareHouseInfo['controls'].wareHouseMasterID.patchValue(wareHouseDetails._id);
      this.sourceFormObj['wareHouseIDName'] = wareHouseDetails.wareHouseIDName;
      this.sourceFormObj['organizationIDName'] = wareHouseDetails.organizationInfo.organizationIDName;
      this.getProductDetails();
      this.getApprovalConfig();
      if (this.globalFormObj.wareHouseIDName == this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName) {
        this.fetchPickingAllocationTpe();
      }
    }
    else {
      this.whTransferForm.controls.sourceWareHouseInfo.patchValue({
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      })
    }
  }
  getApprovalConfig() {
    this.configService.getAllInventoryConfiguration(this.sourceFormObj).subscribe(response => {
      if (response['status'] == 0 && response['data']['processConfigurations'] && response['data']['processConfigurations'].length > 0) {
        if (response['data']['processConfigurations'].find(x => x.name == 'Warehouse Transfer Approve')) {
          const havePermission = response['data']['processConfigurations'].find(x => x.name == 'Warehouse Transfer Approve');
          if (havePermission && havePermission.processStatusPolicies && havePermission.processStatusPolicies.length > 0) {
            const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).authorities[0].authority;
            const loginUser = JSON.parse(sessionStorage.getItem('dli-wms-user')).username;
            havePermission.processStatusPolicies.forEach(outer => {
              const rolesStatusIndex = outer.statusRoleConfigurations.findIndex(x => x.role.roleName == loginUserRole);
              if (rolesStatusIndex != -1 && !this.approvePermissionToggle) {
                const listOfUsers = outer.statusRoleConfigurations[rolesStatusIndex].userInfos.map(x => x.email);
                this.approvePermissionToggle = (listOfUsers.includes(loginUser)) ? true : false;
                if (this.approvePermissionToggle) {
                  this.approveStatusObj = { 'status': outer.status, 'statusSequence': outer.statusSequence };
                  this.approveTotalStatusCount = havePermission.processStatusPolicies.length;
                  if (this.whTransferForm.controls.statusStages.value[this.whTransferForm.controls.statusStages.value.length - 1].statusSequence >= (this.createTotalStatusCount + 1 + this.approveTotalStatusCount)) {
                    this.showApprove = false;
                  }
                }
                else {
                  this.approveTotalStatusCount = 0;
                }
                if (!listOfUsers || (listOfUsers && listOfUsers.length == 0)) {
                  this.sourcenoApprovals = true;
                }
              }
              else {
                this.approvePermissionToggle = this.approvePermissionToggle ? this.approvePermissionToggle : false;
                if (!this.approvePermissionToggle) {
                  this.approveTotalStatusCount = 0;
                }
              }
            });
          }
          else {
            this.sourcenoApprovals = true;
            this.approvePermissionToggle = false;
            this.approveTotalStatusCount = 1;
          }
        }
        else {
          this.sourcenoApprovals = true;
          this.approvePermissionToggle = false;
          this.approveTotalStatusCount = 1;
        }
      }
      else {
        this.sourcenoApprovals = true;
        this.approvePermissionToggle = false;
        this.approveTotalStatusCount = 1;
      }
    })
  }
  onProductIDNameChange(event) {
    this.productLogo = null;
    this.tempMoq = 0;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
    }
    if (event) {
      const productDetails = this.products.find(x => x.productIDName == event.originalObject);
      this.wareHouseTransferLine.controls.productMasterInfo.patchValue(productDetails);
      this.wareHouseTransferLine.controls.productMasterInfo['controls'].productMasterID.setValue(productDetails._id);
      this.wareHouseTransferLine.controls.inventoryUnit.patchValue(productDetails.inventoryUnit);
      this.wareHouseTransferLine.controls.productImage.patchValue(productDetails.productImage);
      this.tempMoq = productDetails.moq;
      if (productDetails.saleTaxes && productDetails.saleTaxes.length > 0) {
        this.wareHouseTransferLine.controls.saleTaxes.patchValue(productDetails.saleTaxes.map(x => x.taxNamePercentage));
        this.taxData = productDetails.saleTaxes;
        // this.calculateTaxPercentage();
      }
      if (productDetails.productImage && this.showImage) {
        const fileNames = JSON.parse(JSON.stringify(productDetails.productImage));
        this.metaDataService.viewImages(fileNames).subscribe(data => {
          if (data['status'] == 0) {
            this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
            this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
            this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
          }
        });
      }
      this.getQty({
        "productMasterID": productDetails._id,
        "productID": productDetails.productID,
        "productName": productDetails.productName,
        "productIDName": productDetails.productIDName
      });
      this.fetchPrice();
      this.calculateTaxPercentage();
      if (this.globalFormObj.wareHouseIDName == this.whTransferForm.controls.sourceWareHouseInfo.value.wareHouseIDName) {
        this.fetchAllInventories();
      }
    }
  }
  calculateTaxPercentage() {
    if (this.wareHouseTransferLine.controls.saleTaxes.value && this.wareHouseTransferLine.controls.saleTaxes.value.length > 0) {
      this.wareHouseTransferLine.controls.taxAmount.setValue(0);
      this.calculate();
    }
    else {
      this.wareHouseTransferLine.controls.taxAmount.setValue(0);
      this.calculate();
    }
  }
  findAllUOMS() {
    // let form = this.destinationFormObj;
    // if (this.inSource) {
    //   form['countryName'] = this.whTransferForm.value.shipFromAddress ? this.whTransferForm.value.shipFromAddress.country : null
    //   form['stateName'] = this.whTransferForm.value.shipFromAddress ? this.whTransferForm.value.shipFromAddress.state : null
    // }
    // else {
    //   form['countryName'] = this.whTransferForm.value.shipToAddress ? this.whTransferForm.value.shipToAddress.country : null
    //   form['stateName'] = this.whTransferForm.value.shipToAddress ? this.whTransferForm.value.shipToAddress.state : null
    // }
    // this.wmsService.fetchTaxes(form).subscribe(res => {
    //   if (res['status'] == 0 && res['data'].taxMasters) {
    //     this.taxData = res['data'].taxMasters;
    //     this.taxIDs = this.taxData.map(x => x.taxNamePercentage);
    //   }
    //   else {
    //     this.taxData = [];
    //     this.taxIDs = this.taxData;
    //   }
    // })
    this.commonMasterDataService.fetchAllUOMConversion(this.sourceFormObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.uoms) {
          this.uomConversions = response.data.uoms;
        }
      },
      (error) => {
      });
    this.fetchAllUnits();
  }
  getTaxJson(taxNamePercentage, qty, discount) {
    const filteredtax = this.taxData.find(x => x.taxNamePercentage == taxNamePercentage);
    if (discount) {
      qty = DecimalUtils.multiply(DecimalUtils.subtract(1, DecimalUtils.divide(discount, 100)), qty);
    }
    return {
      _id: filteredtax._id,
      taxName: filteredtax.taxName,
      taxPercentage: filteredtax.taxPercentage,
      taxNamePercentage: filteredtax.taxNamePercentage,
      taxAmount: DecimalUtils.subtract(DecimalUtils.multiply(DecimalUtils.add(DecimalUtils.divide(filteredtax.taxPercentage, 100), 1), qty), qty)
    }
  }
  fetchPrice() {
    this.priceFromBE = 0;
    this.taxExemption = null;
    let formValue = {};
    formValue = this.whTransferForm.value;
    const formLine = this.wareHouseTransferLine.value;
    if (formLine.saleTaxes && formLine.saleTaxes.length > 0) {
      const purchase = JSON.parse(JSON.stringify(formLine.saleTaxes));
      formLine.saleTaxes = [];
      purchase.forEach(inner => {
        formLine.saleTaxes.push(this.getTaxJson(inner, formLine.grossAmount, formLine.discount));
      });
    }
    formValue['wareHouseTransferLines'] = [formLine];
    this.wmsService.fetchProductTransferSalePrice(formValue).subscribe(data => {
      if (data.status == 0 && data.data.wareHouseTransferPricingResponse) {
        this.wareHouseTransferLine.controls.unitPrice.setValue(data.data.wareHouseTransferPricingResponse.unitPrice);
        this.priceFromBE = data.data.wareHouseTransferPricingResponse.unitPrice;
        // this.wareHouseTransferLine.controls.markupPercentage.setValue(data.data.wareHouseTransferPricingResponse.markupPercentage);
        this.taxExemption = data.data.wareHouseTransferPricingResponse.taxExemption;
        this.calculate();
      }
      else {
        this.wareHouseTransferLine.controls.unitPrice.setValue(null);
      }
    })
  }
  getProductsList(event) {
    if (event && event != '-Select--' && event != "null") {
      this.productsData = this.products.filter(x => x.productCategoryInfo.productCategoryName == event).map(x => x.productIDName);
      this.getProductCategory(event);
    }
    else {
      this.productsData = this.products.map(x => x.productIDName);
      this.wareHouseTransferLine.controls.productCategoryInfo['controls'].productCategoryID.setValue(null);
      this.wareHouseTransferLine.controls.productCategoryInfo['controls'].productCategory.setValue(null);

    }
  }
  getProductCategory(value) {
    if (this.productCategories) {
      this.productCategories.forEach(productCategory => {
        if (productCategory.productCategoryName === value) {
          this.wareHouseTransferLine.controls.productCategoryInfo['controls'].productCategoryID.setValue(productCategory._id);
          this.wareHouseTransferLine.controls.productCategoryInfo['controls'].productCategory.setValue(productCategory.productCategory);
        }
      });
    }
  }
  calculateTransferQty(line, i) {
    this.selectedLineIndex = i;
    line.inventoryHelpers = null;
    let CF = null;
    if (line.inventoryUnit == line.shipmentUnit) {
      CF = DecimalUtils.valueOf(1);
    }
    else {
      const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === line.shipmentUnit &&
        uom.unitConversionTo === line.inventoryUnit && uom.productMasterInfo.productIDName === line.productMasterInfo.productIDName);
      CF = filteredUOMConversion ? filteredUOMConversion.conversionFactor : null;
    }
    if (CF) {
      line['transferQuantity'] = DecimalUtils.multiply(line.orderQuantity, CF);
    }
    else {
      if (line.uomConversionAvailability == 'Yes') {
        this.toastr.error("No Matching Unit Conversion Factor.");
      }
      else {
        line['transferQuantity'] = null;
      }
    }
    this.calculate(line, i);
  }
  orderQuantityValidation(data, event) {
    if (DecimalUtils.greaterThanOrEqual(data.customerOrderQuantity, DecimalUtils.valueOf(event.target.value))) {
      data.orderQuantity = DecimalUtils.valueOf(event.target.value)
    } else {
      data.orderQuantity = ''
      this.toastr.error('Please enter value below the Customer Order quantity')
    }
    // if (data.transferQuantity > data.quantityInventoryUnit) {
    //   this.toastr.error("Inventory not available for this product");
    //   data.orderQuantity = ''
    //   data.transferQuantity = ''

    // }
  }
  getCFCount(line, i) {
    if (line.uomConversionAvailability != 'Yes' && line.transferQuantity && line.orderQuantity) {
      const conversionFactor = DecimalUtils.divide(line.transferQuantity, line.orderQuantity);
      line.unitPrice = DecimalUtils.divide(line.orderUnitPrice, conversionFactor);
    }
  }
  calculateReceivedQty(key, fromTable?) {
    let formData = fromTable ? fromTable : this.wareHouseTransferLine.value;
    const filteredProduct = this.products.find(product => product.productIDName === formData.productMasterInfo.productIDName);
    if (filteredProduct && filteredProduct.inventoryUnit && formData.shipmentUnit) {
      let CF = null;
      if (filteredProduct.inventoryUnit == formData.shipmentUnit) {
        CF = DecimalUtils.valueOf(1);
      }
      else {
        const filteredUOMConversion = this.uomConversions.find(uom => uom.unitConversionFrom === formData.shipmentUnit &&
          uom.unitConversionTo === filteredProduct.inventoryUnit && uom.productMasterInfo.productIDName === filteredProduct.productIDName);
        CF = filteredUOMConversion ? filteredUOMConversion.conversionFactor : null;
      }
      if (CF) {
        if (key) {
          this.wareHouseTransferLine.controls.transferQuantity.setValue(DecimalUtils.multiply(this.wareHouseTransferLine.controls.orderQuantity.value, CF));
        }
        else {
          this.wareHouseTransferLine.controls.orderUnitPrice.setValue(DecimalUtils.multiply(this.priceFromBE, CF));
        }
      } else {
        this.toastr.error('No matching Unit Conversion Factor');
      }
      this.calculate();
    }
  }

  getProductDetails() {
    this.wmsService.fetchAllProducts(this.sourceFormObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
          this.productsData = this.products.map(x => x.productIDName);
        }
      })
  }
  fetchAllUnits() {
    this.mData.fetchAllUnits(this.sourceFormObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.units && response.data.units.length) {
          this.units = response.data.units;
        }
        else {
          this.units = [];
        }
      },
      error => {
        this.units = [];
      });
  }

  reject(fromTable?, create?) {
    if (this.permissionsList.includes('Update')) {
      if (fromTable) {
        this.whTransferForm.value.wareHouseTransferLines = this.overAllLines;
      }
      const form = this.whTransferForm.value;
      if (create) {
        if (this.noApprovals) {
          this.rejectContinution(form, create);
        }
        else {
          if (form.statusStages[form.statusStages.length - 1].statusSequence == this.createStatusObj.statusSequence) {
            this.rejectContinution(form, create);
          }
          else {
            this.toastr.error("No Scope for Return")
          }
        }
      }
      else {
        if (this.sourcenoApprovals) {
          this.rejectContinution(form, create);
        }
        else {
          if (form.statusStages[form.statusStages.length - 1].statusSequence == this.approveStatusObj.statusSequence) {
            this.rejectContinution(form, create);
          }
          else {
            this.toastr.error("No Scope for Return")
          }
        }
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  rejectContinution(form, create) {
    form.statusStage = {
      status: 'Rejected',
      statusSequence: this.createStatusObj.statusSequence + 1
    }
    this.wmsService.rejectWareHouseRequest(form, create).subscribe(res => {
      if (res['status'] == 0) {
        this.toastr.success("Rejected Successfully");
        this.appService.navigate('/wareHouseTransfer');
      }
      else if (res['status'] == 2) {
        this.toastr.error(res['statusMsg']);
      }
      else {
        this.toastr.error(res['statusMsg']);
      }
    })
  }
  updateDraft() {
    const form = this.whTransferForm.value;
    if (!form.sourceWareHouseInfo || !form.sourceWareHouseInfo.wareHouseIDName) {
      form.sourceWareHouseInfo = null;
    }
    form['wareHouseTransferLines'] = this.overAllLines;
    this.wmsService.updateWareHouseTransfer(form).subscribe(res => {
      this.toastr.success("Updated Successfully");
    })
  }
  update() {
    const form = this.whTransferForm.value;
    if (!form.sourceWareHouseInfo || !form.sourceWareHouseInfo.wareHouseIDName) {
      form.sourceWareHouseInfo = null;
    }
    form['wareHouseTransferLines'] = this.overAllLines;
    form['proofOfDeliveryFiles'] = this.uploadFiles;
    this.wmsService.updateWareHouseTransfer(form).subscribe(res => {
      this.toastr.success("Updated Successfully");
    })
  }
  save() {
    if (this.permissionsList.includes('Update')) {
      const form = this.whTransferForm.value;
      if (this.noApprovals) {
        form.statusStage = {
          status: 'Confirmed',
          statusSequence: null,
        }
        this.saveContinution(form);
      }
      else {
        if (form.statusStages[form.statusStages.length - 1].statusSequence == this.createStatusObj.statusSequence) {
          form.statusStage = {
            status: this.createStatusObj.status,
            statusSequence: this.createStatusObj.statusSequence + 1
          }
          this.saveContinution(form);
        }
        else {
          this.toastr.error('No Scope for Create');
        }
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  saveContinution(form) {
    if (!form.sourceWareHouseInfo || !form.sourceWareHouseInfo.wareHouseIDName) {
      form.sourceWareHouseInfo = null;
    }
    if (this.showTable) {
      form['wareHouseTransferLines'] = this.overAllLines;
      this.overAllLines.forEach(element => {
        if (element.expectedDeliveryDate) {
          element.expectedDeliveryDate = new Date(element.expectedDeliveryDate);
        }
      });
      this.wmsService.saveorUpdateWareHouseTransfer(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].wareHouseTransfer) {
          this.toastr.success("Created Successfully");
          this.appService.navigate('/wareHouseTransfer');
        }
      })
    }
    // else {
    //   if (form.sourceWareHouseInfo.wareHouseIDName && this.wareHouseTransferLine.value.productMasterInfo.productIDName) {
    //     form.wareHouseTransferLines = [this.wareHouseTransferLine.value];
    //     // if (this.tempMoq > -1 && form.wareHouseTransferLines[0].orderQuantity >= this.tempMoq) {
    //     if (form.wareHouseTransferLines && form.wareHouseTransferLines.length > 0) {
    //       form.wareHouseTransferLines.forEach(outer => {
    //         if (outer.saleTaxes && outer.saleTaxes.length > 0) {
    //           const purchase = JSON.parse(JSON.stringify(outer.saleTaxes));
    //           outer.saleTaxes = [];
    //           purchase.forEach(inner => {
    //             outer.saleTaxes.push(this.getTaxJson(inner, outer.grossAmount, outer.discount));
    //           });
    //         }
    //       });
    //     }
    //     form.wareHouseTransferLines[0].locationAllocationType = null;
    //     if (form._id) {
    //       if (this.globalFormObj.wareHouseIDName == form.sourceWareHouseInfo.wareHouseIDName && form.wareHouseTransferLines[0].locationAllocationType == 'Manual' && (form.wareHouseTransferLines[0].inventoryHelpers == null || form.wareHouseTransferLines[0].inventoryHelpers == 'null' ||
    //         form.wareHouseTransferLines[0].inventoryHelpers.length == 0)) {
    //         this.toastr.error("Select Locations");
    //       }
    //       else {
    //         this.wmsService.updateWareHouseTransfer(form).subscribe(res => {
    //           this.toastr.success("Updated Successfully");
    //           this.reset();
    //           const jsonValues = this.globalFormObj;
    //           jsonValues['wareHouseTransferTransactionID'] = res['data'].WareHouseTransfer.wareHouseTransferTransactionID;
    //           this.wmsService.getWareHouseTransferDetails(jsonValues).subscribe(response => {
    //             if (response['status'] == 0 && response['data'].wareHouseTransfers && response['data'].wareHouseTransfers.length > 0) {
    //               this.editbyId(response['data'].wareHouseTransfers[0]._id);
    //             }
    //           })
    //         })
    //       }
    //     }
    //     else {
    //       form.wareHouseTransferLines[0].locationAllocationType = null;
    //       this.wmsService.saveorUpdateWareHouseTransfer(form).subscribe(res => {
    //         if (res['status'] == 0 && res['data'].wareHouseTransfer) {
    //           this.toastr.success("Saved Successfully");
    //           this.reset();
    //           const jsonValues = this.globalFormObj;
    //           jsonValues['wareHouseTransferTransactionID'] = res['data'].wareHouseTransfer.wareHouseTransferTransactionID;
    //           this.wmsService.getWareHouseTransferDetails(jsonValues).subscribe(response => {
    //             if (response['status'] == 0 && response['data'].wareHouseTransfers && response['data'].wareHouseTransfers.length > 0) {
    //               this.editbyId(response['data'].wareHouseTransfers[0]._id);
    //             }
    //           })
    //         }
    //       })
    //     }
    //     // } else {
    //     //   this.toastr.error('Order Quantity should be greater than or equal to moq');
    //     // }
    //   }
    //   else {
    //     this.toastr.error("Enter Manditory Fields");
    //   }
    // }
  }
  navigate() {
    this.appService.navigate('/createWareHouseTransfer', { id: this.whTransferForm.controls._id.value });
  }
  validate(fromTable) {
    if (this.permissionsList.includes('Update')) {
      const form = this.whTransferForm.value;
      if (this.sourcenoApprovals) {
        this.whTransferForm.controls.statusStage.setValue({
          status: 'Approved',
          statusSequence: null
        })
        this.validateContinution(fromTable);
      }
      else {
        if ((form.statusStages[form.statusStages.length - 1].statusSequence - (this.createTotalStatusCount)) == this.approveStatusObj.statusSequence) {
          this.whTransferForm.controls.statusStage.setValue({
            status: this.approveStatusObj.status,
            statusSequence: form.statusStages[form.statusStages.length - 1].statusSequence + 1
          })
          this.validateContinution(fromTable);
        }
        else {
          this.toastr.error('No Scope for Approve');
        }
      }
    }
  }
  validateContinution(fromTable?) {
    if (this.permissionsList.includes('Update')) {
      if (fromTable) {
        this.overAllLines.forEach(element => {
          if (element.expectedDeliveryDate) {
            element.expectedDeliveryDate = new Date(element.expectedDeliveryDate);
          }
        });
        this.whTransferForm.value.wareHouseTransferLines = this.overAllLines;
      }
      const arr = this.whTransferForm.value.wareHouseTransferLines;
      const findValue = arr.find(x => x.transferQuantity);
      let proceed = findValue ? true : false;
      if (proceed) {
        if (arr.length > 0) {
          let proceed: boolean = true;
          if (!(this.globalFormObj.wareHouseIDName == this.whTransferForm.value.destinationWareHouseInfo.wareHouseIDName)) {
            arr.forEach(el => {
              if (!el.orderQuantity) {
                el.locationAllocationType = 'Auto';
                el.inventoryHelpers = null;
                el.orderQuantity = 0;
                el.transferQuantity = 0;
              }
              if (proceed && ((fromTable ? el.locationAllocationType : this.allocationType) == 'Manual') && (el.inventoryHelpers == null || el.inventoryHelpers == "null"
                || el.inventoryHelpers.length == 0)) {
                proceed = false;
              }
            });
          }
          if (proceed) {
            const form = this.whTransferForm.value;
            if (!form.sourceWareHouseInfo || !form.sourceWareHouseInfo.wareHouseIDName) {
              form.sourceWareHouseInfo = null;
            }
            this.wmsService.validateWareHouseTransfer(form).subscribe(res => {
              if (res['status'] == 0 && res['data'].inventoryValidationDetails) {
                const statusMsg = res['data'].inventoryValidationDetails;
                if (statusMsg['productStrategyMessage']) {
                  this.toastr.error(statusMsg.productStrategyMessage);
                }
                else if (statusMsg['inventoryAvailability']) {
                  if (statusMsg['inventoryAvailability'] == 'Yes') {
                    this.enableTransfer = false;
                    this.transfer('fromTable');
                    // this.toastr.success('Inventory Available for Transfer')
                  }
                  else {
                    this.ngxSmartModalService.getModal('closePOPopup').open();
                    const viewData = `No Inventory Available,Do you want to Approve?`;
                    this.ngxSmartModalService.setModalData(viewData, 'closePOPopup');
                  }
                }
                else if (statusMsg['pickingStrategyMessage']) {
                  this.toastr.error(statusMsg.pickingStrategyMessage);
                }
                else {
                  // this.toastr.error('No Inventory Availablity');
                  this.ngxSmartModalService.getModal('closePOPopup').open();
                  const viewData = `No Inventory Available,Do you want to Approve?`;
                  this.ngxSmartModalService.setModalData(viewData, 'closePOPopup');
                }
              }
              else {
                // this.toastr.error('No Inventory Availablity');
                this.ngxSmartModalService.getModal('closePOPopup').open();
                const viewData = `No Inventory Available,Do you want to Approve?`;
                this.ngxSmartModalService.setModalData(viewData, 'closePOPopup');
              }
            })
          }
          else {
            this.toastr.error("Enter Locations for Manual Type")
          }
        }
        else {
          this.toastr.error("No Data to Validate");
        }
      }
      else {
        this.toastr.error("Enter Quantities to Validate");
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  confirm(fromTable) {
    this.whTransferForm.controls.statusStage.setValue(null);
    this.transfer(fromTable);
  }
  transfer(fromTable?) {
    if (this.permissionsList.includes('Update')) {
      if (fromTable) {
        this.overAllLines.forEach(element => {
          if (element.expectedDeliveryDate) {
            element.expectedDeliveryDate = new Date(element.expectedDeliveryDate);
          }
          if (!element.orderQuantity) {
            element.locationAllocationType = 'Auto';
            element.inventoryHelpers = null;
            element.orderQuantity = 0;
            element.transferQuantity = 0;
          }
        });
        this.whTransferForm.value.wareHouseTransferLines = this.overAllLines;
      }
      const form = this.whTransferForm.value;
      if (!form.sourceWareHouseInfo || !form.sourceWareHouseInfo.wareHouseIDName) {
        form.sourceWareHouseInfo = null;
      }
      this.wmsService.transferWareHouse(form).subscribe(res => {
        if (res['status'] == 0) {
          if (res['statusMsg']) {
            this.toastr.success(res['statusMsg']);
          }
          else {
            this.toastr.success('Success');
          }
          this.appService.navigate('/wareHouseTransfer');
        }
        else if (res['status'] == 2) {
          this.toastr.error(res['statusMsg']);
        }
        else {
          this.toastr.error(res['statusMsg']);
        }
      })
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getQty(data) {
    const final = Object.assign(data, this.sourceFormObj);
    this.wmsService.getAvailInventory(final).subscribe(res => {
      if (res['status'] == 0 && res['data']['inventoryAvailabilityMap']) {
        this.wareHouseTransferLine.controls.quantityInventoryUnit.patchValue(res['data']['inventoryAvailabilityMap'].totalQuantityInventoryUnit);
      }
      else {
        this.wareHouseTransferLine.controls.quantityInventoryUnit.patchValue(null);
      }
    })
  }
  returnLocationsByLocationName(event) {
    if (event) {
      this.pickupLocations = this.pickupLocations.filter(x => x.locationInfo.locationName == event.originalObject);
    }
    else {
      this.pickupLocations = this.returnALLocations
    }
  }
  returnLocationsByBatchNumber(event) {
    if (event) {
      this.pickupLocations = this.pickupLocations.filter(x => x.batchNumber == event.originalObject);
    }
    else {
      this.pickupLocations = this.returnALLocations
    }
  }
  returnLocationsBySerialNumber(event) {
    if (event) {
      this.pickupLocations = this.pickupLocations.filter(x => x.serialNumber == event.originalObject);
    }
    else {
      this.pickupLocations = this.returnALLocations
    }
  }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }
  fetchAllInventories() {
    this.wmsService.findAllInventories('', this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventories) {
          const bIn = response.data.inventories.filter(x => x.batchNumber != null);
          const sIn = response.data.inventories.filter(x => x.serialNumber != null);
          const dupBin = bIn ? bIn.map(x => x.batchNumber) : null;
          this.batchNumberIDs = this.removeDuplicates(dupBin);
          const dupsIn = sIn ? sIn.map(x => x.serialNumber) : null;
          this.serialNumberIDs = this.removeDuplicates(dupsIn);
        } else {
          this.batchNumberIDs = null;
          this.serialNumberIDs = null;
        }
      },
      (error) => {
        this.batchNumberIDs = null;
        this.serialNumberIDs = null;
      });
  }
  getLocations(data) {
    const final = Object.assign(data, this.sourceFormObj);
    const ffValues = (this.showTable && this.selectedLine) ? this.selectedLine : this.wareHouseTransferLine.value;
    const updatedLocationsList = ffValues.inventoryHelpers;
    this.wmsService.getManualLocationsForWarehouseTransfer(final).subscribe(res => {
      if (res && res.status === 0 && res.data.inventoryHelpers && res.data.inventoryHelpers.length > 0) {
        this.pickupLocations = res.data.inventoryHelpers;
        this.returnALLocations = this.pickupLocations;
        this.pickupLocationValues = this.pickupLocations.map(x => x.locationInfo.locationName);
        this.pickupLocations.forEach(x => {
          x['isEdit'] = false;
          x['isChecked'] = false;
        });
        if (updatedLocationsList && updatedLocationsList.length > 0) {
          updatedLocationsList.forEach(element => {
            this.pickupLocations.forEach(picele => {
              if (element._id == picele._id) {
                picele['pickedQuantity'] = element.pickedQuantity;
                picele['isEdit'] = true;
                picele['isChecked'] = true;
              }
            });
          });
        }
      }
      else {
        if (res.status == 2) {
          this.toastr.error(res.statusMsg);
        }
        this.pickupLocations = [];
      }
    })
  }
  read1(event, data1) {
    this.pickupLocations.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.pickupLocations.find(x => x.isEdit == true);
      if (currentItem && (currentItem.pickedQuantity == null)) {
        this.toastr.warning('Enter Picked Quantity');
      }
      this.pickupLocations.map(element => element.isEdit = false);
      data1.isEdit = true;
      if (currentItem && currentItem.pickedQuantity) {
        if (event.target.checked && data1.pickedQuantity) {
          data1.isChecked = event.target.value;
        }
        else if (event.target.checked && !data1.pickedQuantity) {
          data1.isChecked = event.target.value;
          data1.isEdit = true;
        }
        else {
          data1.isChecked = false;
          data1.isEdit = false;
          data1['pickedQuantity'] = '';
        }
      }
    }
    else {
      data1.isChecked = false;
      data1.isEdit = false;
      data1.pickedQuantity = null;
    }
    this.pickupLocations.forEach(element => {
      if (element.pickedQuantity) {
        element.isChecked = true;
      }
    });
  }
  saveAllocationType(key, fromTable?, data?) {
    if (fromTable) {
      data['locationAllocationType'] = (key == 'Manual') ? 'Auto' : "Manual";
    }
    else {
      this.allocationType = (key == 'Manual') ? 'Auto' : "Manual";
      this.wareHouseTransferLine.controls.locationAllocationType.setValue((key == 'Manual') ? 'Auto' : "Manual");
    }
  }
  savequantity(value, data) {
    if (value == null || (typeof (value) == 'string' ? value.trim() : value) == '') {
      data.isEdit = false;
      data['pickedQuantity'] = '';
      data['isChecked'] = false;
    }
    else {
      if (DecimalUtils.greaterThanOrEqual(data.quantityInventoryUnit, value)) {
        data['pickedQuantity'] = value;
        data['isChecked'] = true;
      }
      else {
        data.isEdit = false;
        data['pickedQuantity'] = '';
        data['isChecked'] = false;
        this.toastr.error('Pickup Quantity should be less than or equal to Available Quantity')
      }
    }
  }
  savePickupLocations() {
    let count: any = 0;
    this.pickupLocations.forEach(element => {
      if (element.isChecked) {
        count = DecimalUtils.add(count, element.pickedQuantity)
      }
    });
    if (DecimalUtils.equals(count, ((this.showTable && this.selectedLine) ? this.selectedLine.transferQuantity : this.wareHouseTransferLine.controls.transferQuantity.value))) {
      this.ngxSmartModalService.getModal('pickupLocationsModal').close();
      this.toastr.success('Saved');
      let filteredRecieveLocations = [];
      filteredRecieveLocations = this.pickupLocations.filter(x => x.isChecked == true);
      if (filteredRecieveLocations.length > 0) {
        this.returnShowValues = filteredRecieveLocations.map(x => x.locationInfo.locationName).toString();
        filteredRecieveLocations.forEach(element => {
          delete element.isEdit;
          delete element.isChecked;
        });
      }
      if (this.showTable && this.selectedLine && (this.selectedLineIndex || this.selectedLineIndex >= 0)) {
        this.overAllLines[this.selectedLineIndex].inventoryHelpers = filteredRecieveLocations;
      }
      else {
        this.wareHouseTransferLine.controls.inventoryHelpers.setValue(filteredRecieveLocations);
      }
    }
    else {
      this.toastr.error("Selected Locations Quantity should be equal Transfered Quantity");
    }
  }
  validateDecimal(key, i) {
    this.overAllLines[i][key] = DecimalUtils.enterLimitedDecimals(this.overAllLines[i][key]);
  }
  resetRecieveLocations() {
    const value = (this.showTable && this.selectedLine) ? this.selectedLine.productMasterInfo.productIDName : this.wareHouseTransferLine.controls.productMasterInfo.value.productIDName
    const productDetails = this.products.find(x => x.productIDName == value);
    this.getLocations({
      "productMasterID": productDetails._id,
      "productID": productDetails.productID,
      "productName": productDetails.productName,
      "productIDName": productDetails.productIDName,
      "brandName": value.brandName
    });
    this.returnShowValues = null;
  }
  uploadMultipleFiles(event) {
    for (let i = 0; i < event.target.files.length; i++) {
      this.metaDataService.uploadImage(event.target.files[i]).subscribe(res => {
        this.uploadFiles.push(res['data']['fileName']);
      });
    }

  }
  downloadFile(pdfName: string) {
    let pdfUrl = '';
    const fileNames = JSON.parse(JSON.stringify(pdfName));
    this.metaDataService.viewImages(fileNames).subscribe(res => {
      pdfUrl = 'data:text/plain;base64,' + res.data.resource;
      FileSaver.saveAs(this.excelService.dataURLtoFile(pdfUrl, fileNames), pdfName);
    });
  }
  deleteImageMethod(fileName, i?) {
    this.metaDataService.deleteImage(fileName).subscribe(res => {
      if (res['status'] == 0) {
        this.uploadFiles = []
      }
    })
  }
  generatePDF() {
    setTimeout(() => {
      window.print();
    }, 800);
  }
}
