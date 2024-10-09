import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ApexService } from '../../../shared/services/apex.service';
import { InternaltransfersService } from '../../../services/integration-services/internaltransfers.service';
import { ToastrService } from 'ngx-toastr';
import { WMSService } from '../../../services/integration-services/wms.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { CompleterService, CompleterData } from 'ng2-completer';
import { CommonService } from '../../../shared/services/common.service';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { Storage } from 'src/app/shared/utils/storage';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { PaginationConstants, internalTransferHeader } from 'src/app/constants/paginationConstants';
import { DecimalUtils } from 'src/app/constants/decimal';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExcelService } from 'src/app/shared/services/excel.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-interal-transfers',
  templateUrl: './internal-transfers.component.html'
})
export class InternalTransfersComponent implements OnInit, OnDestroy, AfterViewInit {
  internalTransferForm: FormGroup;
  focusedElement: any;
  products: any = [];
  internalTransfers: any = [];
  productMasterInfo: any = {};
  supplierID: any = '';
  inventories: any = [];
  productIDNames: any = [];
  dataService: CompleterData;
  internalTransferReq: any = {};
  inventoryKeys: any = ['', '', '', '', '', '', ''];
  internalTransferKeys: any = ['', '', '', '',
    '', '', '',
    '', '', '', '', '', '', ''];
  dtOptions: DataTables.Settings = {};
  dtTrigger: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  filteredInventoryByProduct: any = [];
  locationNames: any = [];
  sourceLocations: any = [];
  destinationLocationNames: any = [];
  locationMaster: any = [];
  permissionToggle: any = false;
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Inventory', 'Internal Transfers', Storage.getSessionUser());
  forPermissionsSubscription: any;
  wareHouseTeamsListIDs: CompleterData;
  wareHouseTeamsList: any = [];
  dropdownSettings = {
    multiselect: false,
    singleSelection: false,
    idField: '_id',
    textField: 'users',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };
  noPermissions: Boolean = false;
  productLogo: any;
  showImage: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  availabilityInventoryData: any = [];
  statusObj = { 'status': null, 'statusSequence': null };
  // totalStatusCount: any = null;
  lastApprovalStatusName: any = null;
  showTooltip: any = false;
  tableHeadings: any = ['Sr.No', 'Product ID', 'Zone Name', 'Location Name'
    , 'Quantity Inventory Unit', 'Available Quantity', 'Reserved Quantity', 'Batch Number', 'Serial Number']
  tableHeadingsForPopup: any = ['Include', 'Product ID', 'Zone Name',
    'Location Name', 'Transfer Quantity', 'Reason',
    'Quantity Inventory Unit', 'Available Quantity', 'Reserved Quantity', 'Invoice Number', 'Invoice Date', 'BOE Number',
    'BOE Date', 'BOND Number', 'BOND Date']
  statusDropdown: any = ['Created', 'Completed'];
  statuses: any = ['Created', 'Completed'];

  internalTransfersHeading: any = ['S.No', 'Status', 'Transaction ID', 'Assigned To', 'Assigned By', 'Product ID/Name', 'Source Location',
    'Destination Location', 'Transfer Quantity', 'Reason', 'Start Date', 'End Date']
  pickupLocations: any = [];
  returnShowValues: any = null;
  failureRecords: any = [];
  exportData: any = [];
  loopToStop: any = null;
  dataPerPage: number;


  constructor(private apexService: ApexService, private configService: ConfigurationService,
    private toastr: ToastrService, private commonDataService: CommonMasterDataService,
    private wmsService: WMSService, private metaDataService: MetaDataService,
    private customValidators: CustomValidators, private excelService: ExcelService,
    private util: Util, private ngxSmartModalService: NgxSmartModalService,
    private commonService: CommonService,
    private completerService: CompleterService,
    private internaltransfersService: InternaltransfersService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
    this.apexService.getPanelIconsToggle();
  }

  ngOnInit() {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.getFunctionsCall();
    this.noPermissions = (this.permissionsList.includes('Update')) ? false : true;
  }
  getFunctionsCall() {
    if (this.permissionsList.includes('View')) {
      this.getPermissions();
      this.createInternalTransfersForm();
      this.fetchAllExecutionIDName();
      this.fetchAllProducts();
      this.fetchAllInventories(this.first, this.itemsPerPage);
      this.fetchAllLocations();
      this.fetchAllLocationsPagination(1, 10);

    }
  }
  changeTableAPI() {

  }
  fetchAllExecutionIDName() {
    const form = this.formObj;
    form["workType"] = "Transfers"
    this.commonDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
    this.metaDataService.getImageConfigbyName(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Internal Transfers') ? true : false;
      }
    })
  }
  getPermissions() {
    this.configService.getAllInventoryConfiguration(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['processConfigurations'] && res['data']['processConfigurations'].length > 0) {
        if (res['data']['processConfigurations'].find(x => x.name == 'Internal Transfers')) {
          const havePermission = res['data']['processConfigurations'].find(x => x.name == 'Internal Transfers');
          if (havePermission && havePermission.processStatusPolicies && havePermission.processStatusPolicies.length > 0) {
            // this.totalStatusCount = havePermission.processStatusPolicies.length + 1;
            const loginUserRole = JSON.parse(sessionStorage.getItem('dli-wms-user')).authorities[0].authority;
            const loginUser = JSON.parse(sessionStorage.getItem('dli-wms-user')).username;
            this.lastApprovalStatusName = havePermission.processStatusPolicies.find(x => x.statusSequence == (Math.max(...havePermission.processStatusPolicies.map(o => o.statusSequence)))).status
            this.findAllInternalTransfers();
            havePermission.processStatusPolicies.forEach(outer => {
              const rolesStatusIndex = outer.statusRoleConfigurations.findIndex(x => x.role.roleName == loginUserRole);
              if (rolesStatusIndex != -1 && !this.permissionToggle) {
                const listOfUsers = outer.statusRoleConfigurations[rolesStatusIndex].userInfos.map(x => x.email);
                this.permissionToggle = (listOfUsers.includes(loginUser)) ? true : false;
                if (this.permissionToggle) {
                  this.statusObj = { 'status': outer.status, 'statusSequence': outer.statusSequence };

                }
              }
              else {
                this.permissionToggle = this.permissionToggle ? this.permissionToggle : false;
              }
            });
          }
          else {
            this.findAllInternalTransfers();
            this.lastApprovalStatusName = null;
            this.permissionToggle = false;
          }
        }
        else {
          this.findAllInternalTransfers();
          this.permissionToggle = false;
        }
      }
      else {
        this.permissionToggle = false;
        this.findAllInternalTransfers();
      }
    })

    this.metaDataService.getImageConfigbyName(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data'].imageConfiguration) {
        this.showImage = res['data'].imageConfiguration.screenNames.includes('Inventory Adjustments') ? true : false;
      }
    })
  }
  intoEmployee(event, attr) {
    if (this.permissionsList.includes('Update')) {
      if (!event.relatedTarget) {
        this.internalTransferReq = attr;
        delete this.internalTransferReq.dummyStage
        delete this.internalTransferReq.isViewToggle
        this.assignResources();
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  save() {
    if (this.permissionsList.includes('Update')) {
      this.internalTransferReq = { ...this.internalTransferForm.value };
      if (this.internalTransferReq.inventoryAllocationType == 'Auto' && (!this.internalTransferReq.sourceLocation || !this.internalTransferReq.reason)) {
        this.toastr.error("Enter Manditory")
      }
      else {
        const specificFields = ['_id', 'productID', 'productName', 'productIDName'];
        if (this.internalTransferReq.sourceLocation === this.internalTransferReq.destinationLocation) {
          this.toastr.error("Source & destination locations can't be same");
        } else {
          this.internalTransferReq.productMasterInfo = this.commonService.getFilteredData('productIDName', this.internalTransferForm.value.productIDName, this.products, null, null, specificFields);
          this.internalTransferReq.productMasterInfo = this.commonService.replaceName(this.internalTransferReq.productMasterInfo, '_id', 'productMasterID');
          if (this.internalTransferReq.sourceLocation) {
            this.internalTransferReq.sourceLocation = this.sourceLocations.find(x => x.locationName == this.internalTransferReq.sourceLocation);
            // this.commonService.getFilteredData('locationName', this.internalTransferReq.sourceLocation, this.locationMaster, 'locationInfo');
          }
          this.internalTransferReq.destinationLocation = this.commonService.getFilteredData('locationName', this.internalTransferReq.destinationLocation, this.locationMaster, 'locationInfo');
          delete this.internalTransferReq.productIDName;
          if (this.internalTransferReq.inventoryAllocationType == 'Manual' && (this.internalTransferReq.internalTransferSourceInventories == null ||
            this.internalTransferReq.internalTransferSourceInventories == 'null' ||
            this.internalTransferReq.internalTransferSourceInventories.length == 0)) {
            this.toastr.error('Select Locations');
          }
          else {
            if (this.internalTransferReq.inventoryAllocationType == 'Auto') {
              this.internalTransferReq.internalTransferSourceInventories = null;
            }
            this.saveOrUpdateInternalTransfers();
          }
        }
      }
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  clear() {
    this.createInternalTransfersForm();
    this.returnShowValues = null;
    if (this.showImage) {
      const element = <HTMLImageElement>(document.getElementById('pLogo'));
      element.src = null;
      this.onNonAvailbleImage();
    }
  }
  statusSave(inventoryAdjustment, event) {
    if (this.permissionsList.includes('Update')) {
      if (event) {
        inventoryAdjustment.statusStage = {
          status: event.target.value,
          statusSequence: this.statusObj.statusSequence + 1
        }
      }
      delete inventoryAdjustment.dummyStage;
      delete inventoryAdjustment.isViewToggle;
      this.internalTransferReq = inventoryAdjustment;
      this.assignResources();
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
      event.target.value = inventoryAdjustment.status;
    }
  }
  onStatusChange(inventory: any, status: any, event?) {
    this.first = this.globalPageNumber
    if (this.permissionsList.includes('Update')) {
      this.internalTransferReq = inventory;
      if (status == 'startDate') {
        this.internalTransferReq['startDate'] = new Date();

      }
      else if (status == 'status') {
        this.internalTransferReq['endDate'] = new Date();
        this.internalTransferReq.statusStage = {
          status: 'Completed',
          statusSequence: (this.internalTransferReq.statusStages[this.internalTransferReq.statusStages.length - 1].statusSequence) + 1
        }
      }
      delete this.internalTransferReq.dummyStage;
      delete this.internalTransferReq.isViewToggle;
      this.assignResources();
      // this.fetchAllInventories(this.first, this.itemsPerPage);
      //  this.findAllInternalTransfers(this.second, this.itemsPerPageInternalTransfers);
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
      if (event) {
        event.target.value = inventory.status;
      }
    }
  }
  validateDecimal(key) {
    this.internalTransferForm.controls[key].setValue(DecimalUtils.enterLimitedDecimals(this.internalTransferForm.controls[key].value, 10));
  }
  assignResources() {
    this.internaltransfersService.updateplanningTransfers([this.internalTransferReq]).subscribe(data => {
      if (data.status == 0 && data.data.internalTransfer) {
        this.toastr.success("Success")
      }
      else {
        this.toastr.error(data['statusMsg']);
      }
      this.findAllInternalTransfers(this.second, this.itemsPerPageInternalTransfers)
      this.fetchAllInventories(this.first, this.itemsPerPage);
    })
  }
  changeUpToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  changeDownToggle(data) {
    data.isViewToggle = !data.isViewToggle;
  }
  mapID(ID, key) {
    if (key == 'Prod') {
      const filteredProd = this.products.find(x => x.productID == ID);
      return {
        "productMasterID": filteredProd ? filteredProd._id : null,
        "productID": ID,
        "productName": filteredProd ? filteredProd.productName : null,
        "productIDName": filteredProd ? filteredProd.productIDName : null,
        "moq": filteredProd ? filteredProd.moq : null,
        "leadTime": filteredProd ? filteredProd.leadTime : null,
        "receivingUnit": filteredProd ? filteredProd.receivingUnit : null,
        "productImage": filteredProd ? filteredProd.productImage : null,
        "price": filteredProd ? filteredProd.price : null,
        "currency": filteredProd ? filteredProd.currency : null,
        "markup": filteredProd ? filteredProd.markup : null,
        "markupType": filteredProd ? filteredProd.markupType : null,
        "productSubCategory1Names": filteredProd ? filteredProd.productSubCategory1Names : null,
        "productSubCategory2Names": filteredProd ? filteredProd.productSubCategory2Names : null,
        "productSubCategory3Names": filteredProd ? filteredProd.productSubCategory3Names : null,
        "productCategoryGroupDetail": filteredProd ? filteredProd.productCategoryGroupDetail : null,
        "brandNames": filteredProd ? filteredProd.brandNames : null,
        "productDescription": filteredProd ? filteredProd.productDescription : null,
        "storageInstruction": filteredProd ? filteredProd.storageInstruction : null
      }
    }
    else if (key == 'Loc') {
      const filteredLoc = this.exportData.find(x => x.locationName == ID);
      return {
        "locationID": filteredLoc ? filteredLoc._id : null,
        "locationName": ID
      }
    }
  }
  onProductIDNameChange() {
    const filteredProd = this.products.find(x => x.productIDName == this.internalTransferForm.controls.productIDName.value);
    if (filteredProd) {
      this.internalTransferForm.controls.productImage.setValue(filteredProd.productImage);
      if (filteredProd.productImage && this.showImage) {
        const fileNames = JSON.parse(JSON.stringify(filteredProd.productImage));
        this.metaDataService.viewImages(fileNames).subscribe(data => {
          if (data['status'] == 0) {
            this.productLogo = 'data:text/plain;base64,' + data['data']['resource'];
            if (this.productLogo) {
              this.onImageAvailble();
            }
            else {
              this.onNonAvailbleImage();

            }
            this.productLogo = this.metaDataService.dataURLtoFile(this.productLogo, fileNames);
            this.metaDataService.imgGlobalChanged(this.productLogo, 'pLogo', true);
          }
        });

      }
      this.searchKey = this.internalTransferForm.controls.productIDName.value;
      this.fetchAllInventories(this.first, this.itemsPerPage);

    }
    else {
      this.searchKey = null

    }
  }
  saveOrUpdateInternalTransfers() {
    if (this.internalTransferReq) {
      this.internaltransfersService.saveOrUpdateInternalTransfer(JSON.stringify(this.internalTransferReq)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.internalTransfer) {
            this.toastr.success('Saved successfully');
            this.findAllInternalTransfers(this.second, this.itemsPerPageInternalTransfers);
            this.fetchAllInventories(this.first, this.itemsPerPage);
            this.createInternalTransfersForm();
            this.returnShowValues = null;
            this.searchKey = null
            if (this.showImage) {
              const element = <HTMLImageElement>(document.getElementById('pLogo'));
              element.src = null;
            }
          } else if (response && response.status === 2) {
            this.toastr.error(response.statusMsg);
            this.findAllInternalTransfers(this.second, this.itemsPerPageInternalTransfers)
          } else {
            this.toastr.error('Failed in saving details');
          }
        },
        (error) => {
          this.toastr.error('Failed in saving details');
        });
    }
  }

  fetchAllDFirst(first, event) {
    console.log(first)
    console.log(event.target.value)
    if (first) {
      this.fetchAllInventories(first, Number(event.target.value));
      this.itemsPerPage = Number(event.target.value)
    }
    const target = event.target as HTMLSelectElement;
    const itemsPerPage = Number(target.value);
    this.fetchAllInventories(this.page, itemsPerPage);

    /*    if (first) {
         this.fetchAllInventories(first, event.target.value);
       } */
  }
  onItemsPerPageChange(second, event) {
    console.log(second)
    console.log(event.target.value)
    if (second) {
      this.itemsPerPageInternalTransfers = Number(event.target.value);
      this.findAllInternalTransfers(second, Number(event.target.value));
    }
    //  const target = event.target as HTMLSelectElement;
    // const itemsPerPage = Number(target.value);
    // this.findAllInternalTransfers(this.page, itemsPerPageInternalTransfers);
  }

  setDirection(type, headerName, header) {
    this.sortDirection = type;
    let arr: any = internalTransferHeader['internalTransferInventoryArrays'].find(x => x.key === headerName);
    this.sortFields = [arr.name];
    if (header) {
      this.fetchAllInventories(this.first, this.itemsPerPage);
    }
    else {
      this.findAllInternalTransfers(this.second, this.itemsPerPageInternalTransfers)
    }
  }
  setDirection1(type, headerName) {
    this.sortDirection = type;
    let arr: any = internalTransferHeader['internalTransferArrays'].find(x => x.key === headerName);
    this.sortFields = [arr.name];
    if (headerName) {
      this.findAllInternalTransfers(this.second, this.itemsPerPageInternalTransfers)
    }
  }
  second: number = 1
  myObj = {
    status: "All"
  }
  findAllInternalTransfers(second?, pageSize?) {
    const myReqObj = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
      'status': this.myObj.status === 'All' ? null : this.myObj.status,
      "workType": "Tranfers",
      "page": second ? second : 1,
      "pageSize": this.itemsPerPageInternalTransfers,
      "searchKeyword": this.searchKeyInternalTransfer,
      
      "searchOnKeys": PaginationConstants.internalTransferSearchOnKeysWithPagination,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
    }
    this.internaltransfersService.findAllInternalTransfersWithPagination(myReqObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.internalTransferPaginationResponse.internalTransfers) {
          this.internalTransfers = response.data.internalTransferPaginationResponse.internalTransfers;
          this.totalItems = response.data.internalTransferPaginationResponse.totalElements;
          this.internalTransfers.forEach(element => {
            element.dummyStage = null;
            element['isViewToggle'] = false;
            const stats = element.statusStages.map(x => x.status);
            element['showComplete'] = false;
            if ((this.lastApprovalStatusName && stats.includes(this.lastApprovalStatusName)) || !this.lastApprovalStatusName) {
              element['showComplete'] = true;
            }
            element['isCompleteorReject'] = false;
            if (stats.includes('Completed') || stats.includes('Rejected')) {
              element['isCompleteorReject'] = true;
            }
          });
          console.log(this.internalTransfers);
          //   this.rerender();
        } else {
          this.internalTransfers = [];
        }
      },
      (error) => {
        this.internalTransfers = [];
      });
  }
  page: number = 1;
  first: number = 1;
  itemsPerPage = 5;
  itemsPerPageInternalTransfers = 5;
  totalItems: any;
  totalItemsList: any;
  searchKey: any = null;
  searchKeyInternalTransfer: any = null;
  sortDirection: any = 'DESC';
  sortFields: any = null;
  globalPageNumber: any;
  fetchAllInventories(first?, pageSize?) {
    const form = {
      "page": first ? first : 3,
      "pageSize": this.itemsPerPage,
      "searchKeyword": this.searchKey,
      "searchOnKeys": PaginationConstants.inventory,
      "sortDirection": this.sortDirection,
      "sortFields": this.sortFields,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName
    }
    this.globalPageNumber = this.first
    console.log(this.itemsPerPage);
    this.wmsService.findAllInventoriesWithPaginations(this.supplierID, form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.inventoryPaginationResponse.inventories) {
          this.inventories = response.data.inventoryPaginationResponse.inventories;
          this.availabilityInventoryData = response.data.inventoryPaginationResponse.inventories.filter(x => x.inventoryAvailability == true);
          this.filteredInventoryByProduct = response.data.inventoryPaginationResponse.inventories;
          this.totalItemsList = response.data.inventoryPaginationResponse.totalElements;
          this.uniqueLocations();
        } else {
          this.inventories = [];
          this.availabilityInventoryData = [];
        }
      },
      (error) => {
        this.inventories = [];
        this.availabilityInventoryData = [];
      });
  }
  uniqueLocations() {
    this.locationNames = [];
    const form = this.formObj;
    form['productIDName'] = this.internalTransferForm.controls.productIDName.value;
    this.wmsService.findUniqueInventoryLocations(form).subscribe(res => {
      if (res['status'] == 0 && res['data'].uniqueLocationNames) {
        this.sourceLocations = res['data'].uniqueLocationNames;
        this.locationNames = res['data'].uniqueLocationNames.map(x => x.locationName);
      }
    })
  }
  getAllLocationsForDownload(index?) {
    if (!index) {
      this.exportData = [];
    }
    let i = index ? index + 1 : 1;
    if (i > this.loopToStop) {
      console.log(this.exportData);
    }
    else {
      if (((i == 1) || (i != 1 && this.exportData.length > 0)) && i <= this.loopToStop) {
        const form = {
          "page": i,
          "pageSize": this.dataPerPage,
          "searchKeyword": this.searchKey,
          "searchOnKeys": null,
          "sortDirection": this.sortDirection,
          "sortFields": this.sortFields,
          "organizationIDName": this.formObj.organizationIDName,
          "wareHouseIDName": this.formObj.wareHouseIDName
        }

        this.wmsService.fetchAllLocationsWithPaginations(form).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.locationPaginationResponse.locations) {
              this.exportData = [...this.exportData, ...response.data.locationPaginationResponse.locations];
              this.getAllLocationsForDownload(i);
            }
          })
      }
    }
  }
  fetchAllLocations() {
    const form = {};
    form['organizationIDName'] = this.formObj.organizationIDName;
    form['wareHouseIDName'] = this.formObj.wareHouseIDName;
    form['sourceLocationName'] = this.internalTransferForm.controls.sourceLocation.value;
    form['sourceLocationNameOperatorType'] = 'ne';
    this.wmsService.fetchAvailableLocations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locationMaster = response.data.locations;
          this.destinationLocationNames = response.data.locations.map(x => x.locationName);
          this.locationMaster.forEach(element => {
            element['locationInfo'] = {
              locationID: element._id,
              locationName: element.locationName
            }
          });
        } else {
        }
      },
      (error) => {
      });
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters.length > 0) {
          this.products = response.data.productMasters;
          this.products.forEach(item => {
            for (const subkey in item) {
              if (subkey === 'productIDName' && this.productIDNames.indexOf(item[subkey]) === -1) {
                this.productIDNames.push(item[subkey]);
              }
            }
          });
          this.dataService = this.completerService.local(this.productIDNames);
        } else {
          this.dataService = this.completerService.local(this.productIDNames);
        }
      },
      (error) => {
        this.products = [];
      });
  }
  fetchAllLocationsPagination(page?, pageSize?) {
    const form = {
      "page": 1,
      "pageSize": 10,
      "searchKeyword": null,
      "searchOnKeys": PaginationConstants.location,
      "sortDirection": null,
      "sortFields": null,
      "organizationIDName": this.formObj.organizationIDName,
      "wareHouseIDName": this.formObj.wareHouseIDName
    }
    this.wmsService.fetchAllLocationsWithPaginations(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locationPaginationResponse.locations) {
          this.totalItems = response.data.locationPaginationResponse.totalElements;

          const lengthofTotalItems = this.totalItems.toString().length;
          const count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          count.forEach(el => {
            if (lengthofTotalItems == el) {
              let value: any = 1 + this.configService.addZerosMethod(el);
              this.dataPerPage = parseInt(value);
            }
          });
          const n: any = (this.totalItems / this.dataPerPage).toString()
          let m = n.split('.')
          if (m[1]) {
            this.loopToStop = parseInt(m[0]) + 1
          } else {
            this.loopToStop = parseInt(m[0])
          }
          this.getAllLocationsForDownload();
        } else {
        }
      },
      (error) => {
      });
  }
  createInternalTransfersForm() {
    this.internalTransferForm = new FormBuilder().group({
      productIDName: [null, this.customValidators.required],
      sourceLocation: null,
      productImage: null,
      destinationLocation: [null, this.customValidators.required],
      transferQuantity: [null, this.customValidators.required],
      reason: null,
      'organizationInfo': this.configService.getOrganization(),
      'wareHouseInfo': this.configService.getWarehouse(),
      inventoryAllocationType: 'Auto',
      internalTransferSourceInventories: [[]],
    });
  }
  openModalRecievedLocations() {
    if (this.internalTransferForm.controls.productIDName.value && this.internalTransferForm.controls.transferQuantity.value && this.internalTransferForm.controls.destinationLocation.value) {
      this.pickupLocations = [];
      const updatedLocationsList = this.internalTransferForm.controls.internalTransferSourceInventories.value;
      this.ngxSmartModalService.getModal('pickupLocationsModal').open();
      const form = this.formObj;
      form['productIDName'] = this.searchKey;
      form['destinationLocationName'] = this.internalTransferForm.controls.destinationLocation.value;
      this.wmsService.findInventoriesForIT(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].internalTransferSourceInventorys) {
          this.pickupLocations = res['data'].internalTransferSourceInventorys;
          this.pickupLocations.forEach(x => {
            x['isChecked'] = false;
            x['isEdit'] = false;
          });
          if (updatedLocationsList && updatedLocationsList.length > 0) {
            updatedLocationsList.forEach(element => {
              this.pickupLocations.forEach(picele => {
                if (element._id == picele._id) {
                  picele['transferQuantity'] = element.transferQuantity;
                  picele['reason'] = element.reason;
                  picele['isEdit'] = true;
                  picele['isChecked'] = true;
                }
              });
            });
          }
        }
      })
    }
    else {
      this.toastr.error('Select Manditory');
    }
  }
  validateLocationDecimal(i) {
    this.pickupLocations[i].transferQuantity = DecimalUtils.enterLimitedDecimals(this.pickupLocations[i].transferQuantity);
  }
  savequantity(value, data) {
    if (value == null || value == 0 || value == "0" || (typeof (value) == 'string' ? value.trim() : value) == '') {
      data.isEdit = false;
      data['transferQuantity'] = '';
      data['isChecked'] = false;
    }
    else {
      if (DecimalUtils.greaterThanOrEqual(data.quantityInventoryUnit, value)) {
        data['transferQuantity'] = value;
        data['isChecked'] = true;
      }
      else {
        data.isEdit = false;
        data['transferQuantity'] = '';
        data['isChecked'] = false;
        this.toastr.error('Transfer Quantity should be less than or equal to Available Quantity')
      }
    }
  }
  savePickupLocations() {
    let count: any = 0;
    this.pickupLocations.forEach(element => {
      if (element.isChecked) {
        count = DecimalUtils.add(count, element.transferQuantity);
      }
    });
    let countValue = this.internalTransferForm.controls.transferQuantity.value;
    if (DecimalUtils.equals(count, countValue)) {
      this.ngxSmartModalService.getModal('pickupLocationsModal').close();
      this.toastr.success('Saved');
      let filteredRecieveLocations = [];
      filteredRecieveLocations = this.pickupLocations.filter(x => x.isChecked == true);
      filteredRecieveLocations.forEach(element => {
        delete element.isChecked;
        delete element.isEdit;
      });
      this.returnShowValues = filteredRecieveLocations.map(x => x.locationInfo.locationName).toString();
      this.internalTransferForm.controls.internalTransferSourceInventories.setValue(filteredRecieveLocations);
    }
    else {
      this.toastr.error("Selected Quantity should be equal to transfer Quantity");
    }
  }
  resetRecieveLocations() {
    if (this.permissionsList.includes('Update')) {
      this.returnShowValues = null;
      const form = this.formObj;
      form['productIDName'] = this.searchKey;
      this.wmsService.findInventoriesForIT(form).subscribe(res => {
        if (res['status'] == 0 && res['data'].internalTransferSourceInventorys) {
          this.pickupLocations = res['data'].internalTransferSourceInventorys;
          this.pickupLocations.forEach(x => {
            x['isChecked'] = false;
            x['isEdit'] = false;
          });
        }
      })
    }
    else {
      this.toastr.error("user doesnt have permmission");
    }
  }
  read1(event, data1) {
    this.pickupLocations.map(element => element.isChecked = false);
    if (event.target.checked) {
      const currentItem = this.pickupLocations.find(x => x.isEdit == true);
      if (currentItem && (currentItem.transferQuantity == null)) {
        this.toastr.warning('Please enter Quantity');
      }
      this.pickupLocations.map(element => element.isEdit = false);
      data1.isEdit = true;
      if (currentItem && currentItem.transferQuantity) {
        if (event.target.checked && data1.transferQuantity) {
          data1.isChecked = event.target.value;
        }
        else if (event.target.checked && !data1.transferQuantity) {
          data1.isChecked = event.target.value;
          data1.isEdit = true;
        }
        else {
          data1.isChecked = false;
          data1.isEdit = false;
          data1['transferQuantity'] = '';
        }
      }
    }
    else {
      data1.isChecked = false;
      data1.isEdit = false;
      data1.transferQuantity = null;
    }
    this.pickupLocations.forEach(element => {
      if (element.transferQuantity) {
        element.isChecked = true;
      }
    });
  }
  saveAllocationType(key) {
    this.internalTransferForm.controls.inventoryAllocationType.setValue((key == 'Manual') ? 'Auto' : "Manual");
    this.internalTransferForm.controls.destinationLocation.setValue(null);
    this.internalTransferForm.controls.sourceLocation.setValue(null);
    if (key == 'Auto') {
      this.fetchAllLocations();
    }
    else {
      this.destinationLocationNames = [];
    }
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.util.shouldShowErrors(fieldName, this.internalTransferForm);
    }
  }
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.internalTransferForm.controls[fieldName].valid && this.internalTransferForm.controls[fieldName].touched;
    }
  }
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    //this.forPermissionsSubscription.unsubscribe();
  }

  leftSideText: boolean = false;
  rightSideText: boolean = true;
  onImageAvailble() {
    this.leftSideText = true;
    this.rightSideText = false;
  }
  onNonAvailbleImage() {
    this.leftSideText = false;
    this.rightSideText = true;
  }

  uploadExcel(event) {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      if (file) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = async (e) => {
          const arrayBuffer: any = fileReader.result;
          const fileData = new Uint8Array(arrayBuffer);
          const arr = new Array();
          for (let i = 0; i !== fileData.length; ++i) { arr[i] = String.fromCharCode(fileData[i]); }
          const bstr = arr.join('');
          const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
          if (jsonData && jsonData.length > 0) {
            const missingParamsArray = [];
            let data1 = [];
            jsonData.forEach((k, index) => {
              if (k['Product ID'] && k['Inventory ID']) {
                data1.push(this.getFormat(k));
              }
              else if (!k['Product ID'] && k['Inventory ID']) {
                data1[data1.length - 1]['internalTransferSourceInventories'].push(this.linesArray(k));
              }
              else {
                data1.push(this.getFormat(k))
              }
            })
            // if (missingParamsArray.length > 0) {
            //   this.missingParams = missingParamsArray;
            // }
            if (data1.length > 0) {
              this.wmsService.ITExcel(data1).subscribe(res => {
                if (res && res.status === 0 && res.data.internalTransferResponseMap && res.data.internalTransferResponseMap.internalTransferSuccessExcelList &&
                  res.data.internalTransferResponseMap.internalTransferSuccessExcelList.length > 0) {
                  this.toastr.success('Uploaded successfully');
                  this.findAllInternalTransfers();
                  this.failureRecords = [];
                }
                else if (res && (res.status === 2 || res.status == 0) && res.data.internalTransferResponseMap && res.data.internalTransferResponseMap.internalTransferFailureExcelList &&
                  res.data.internalTransferResponseMap.internalTransferFailureExcelList.length > 0 && res.data.internalTransferResponseMap.internalTransferSuccessExcelList &&
                  res.data.internalTransferResponseMap.internalTransferSuccessExcelList.length > 0) {
                  this.failureRecords = res.data.internalTransferResponseMap.internalTransferFailureExcelList;
                  this.toastr.error('Partially failed in uploading, Please download log for reasons');
                  this.findAllInternalTransfers();
                }
                else if (res && (res.status === 2 || res.status == 0) && res.data.internalTransferResponseMap && res.data.internalTransferResponseMap.internalTransferFailureExcelList &&
                  res.data.internalTransferResponseMap.internalTransferFailureExcelList.length > 0) {
                  this.failureRecords = res.data.internalTransferResponseMap.internalTransferFailureExcelList;
                  this.toastr.error('Failed in uploading, Please download log for reasons');
                }
                else {
                  this.toastr.error('Failed in uploading');
                  this.failureRecords = [];
                }
              })
            }
          }
        }
      }
    }
  }
  getFormat(k) {
    let obj = {};
    obj['productMasterInfo'] = k['Product ID'] ? this.mapID(k['Product ID'], 'Prod') : null;
    obj['sourceLocation'] = k['Header Source location'] ? this.mapID(k['Header Source location'], 'Loc') : null;
    obj['destinationLocation'] = k['Destination Location'] ? this.mapID(k['Destination Location'], 'Loc') : null;
    obj['transferQuantity'] = k['Total Transfer Quantity'] ? k['Total Transfer Quantity'] : null;
    obj['reason'] = k['Reason'] ? k['Reason'] : null;
    obj['organizationInfo'] = this.configService.getOrganization();
    obj['wareHouseInfo'] = this.configService.getWarehouse();
    obj['internalTransferSourceInventories'] = k['Inventory ID'] ? [this.linesArray(k)] : [];
    obj['inventoryAllocationType'] = k['Inventory ID'] ? 'Manual' : 'Auto';
    return obj;
  }
  linesArray(doc) {
    let fullID = null;
    if (doc['inventoryIDPrefix']) {
      fullID = doc['inventoryIDPrefix'].trim();
    }
    if (doc['Inventory ID']) {
      if (fullID) {
        fullID = fullID + doc['Inventory ID'].toString().trim();
      }
      else {
        fullID = doc['Inventory ID'].toString().trim();
      }
    }
    let obj = {
      "locationInfo": doc['Source Location'] ? this.mapID(doc['Source Location'], 'Loc') : null,
      "transferQuantity": doc['Transfer Qty'] ? doc['Transfer Qty'] : null,
      "reason": doc['Line Reason'] ? doc['Line Reason'] : null,
      inventoryIDPrefix: doc['inventoryIDPrefix'] ? doc['inventoryIDPrefix'].trim() : null,
      "inventoryID": doc['Inventory ID'] ? doc['Inventory ID'] : null,
      fullInventoryID: fullID,
    }
    return obj
  }
  downloadLogFile() {
    let htmlText = '';
    if (this.failureRecords) {
      htmlText = this.failureRecords.toString().replace(/,/g, '\r\n');;
    }
    this.dyanmicDownloadByHtmlTag({
      fileName: "Internal Transfers Error Details",
      text: htmlText
    });
  }
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };
  dyanmicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement("a");
    }
    const element = this.setting.element.dynamicDownload;
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  exportAsXLSX() {
    if (this.permissionsList.includes('Update')) {
      const changedTaskList = this.exportTypeMethod();
      this.excelService.exportAsExcelFile(changedTaskList, 'Internal Transfer', null);
    }
    else {
      this.toastr.error("User doesn't have Permissions.");
    }
  }
  exportTypeMethod() {
    const arr = []
    const obj = {}
    obj['Product ID'] = null;
    obj['Destination Location'] = null;
    obj['Header Source location'] = null
    obj['Total Transfer Quantity'] = null
    obj['Reason'] = null
    obj['inventoryIDPrefix'] = null
    obj['Inventory ID'] = null
    obj['Source Location'] = null
    obj['Transfer Qty'] = null
    obj['Line Reason'] = null
    arr.push(obj)
    return arr
  }
}
