import { Component, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { OutboundProcessService } from 'src/app/services/integration-services/outboundProcess.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-warehouse-layout',
  templateUrl: './warehouse-layout.component.html',
  styleUrls: ['./warehouse-layout.component.scss']
})
export class WarehouseLayoutComponent implements OnInit {

  payloadJSON = {
    "selectCategory": 'Stock',
    "executiveIDName": null,
    "type": 'Stock Available',
    "supplierIDName": null,
    "productIDName": null,
    "serialNumber": null,
    "batchNumber": null
  }
  finalArrayObj: any = null;
  warehouseData: any = [];

  searchCategories: any = ['Stock Available', 'Going To Expire', 'Expired', 'Reserved Inventory', 'Quarentine'];
  storagePopupData: any = [];
  utilizationHeader: any;
  locDimension: any = null;
  locationStatus: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  supplierData: any = [];
  productsData: any = [];
  productStatusValues: any = [];
  batchNumberIDs: CompleterData;
  serialNumberIDs: CompleterData;
  users: any = [];
  StockCategoryType: any = null;
  pickingCategoryType: any = null;
  putawayCategoryType: any = null;
  formObj = this.configService.getGlobalpayload();
  wareHouseTeamsList: any = [];
  wareHouseLayoutModules = this.configService.getPermissions('mainFunctionalities', 'Layout', '', Storage.getSessionUser(), 'getModules');
  stockPermissionsList: any = [];
  putawayPermissionsList: any = [];
  pickingPermisionsList: any = [];
  supplierIDName: any = null;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  public getScreenWidth: any;
  public getScreenHeight: any;
  constructor(private wmsService: WMSService, private ngxSmartModalService: NgxSmartModalService,
    private excelService: ExcelService, private commonMasterDataService: CommonMasterDataService,
    private toastr: ToastrService, private outboundProcessService: OutboundProcessService,
    private configService: ConfigurationService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  onHover(event) {
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    if (event && event.target && event.target.firstElementChild) {
      if (vh - event.y > 160) {
        event.target.firstElementChild.classList.remove('topAllign')
        event.target.firstElementChild.classList.add('bottomAllign')
      } else {
        event.target.firstElementChild.classList.remove('bottomAllign')
        event.target.firstElementChild.classList.add('topAllign')
      }
      if (vw - event.x > 300) {
        event.target.firstElementChild.classList.remove('rightAllign')
        event.target.firstElementChild.classList.add('leftAllign')
      } else {
        event.target.firstElementChild.classList.remove('leftAllign')
        event.target.firstElementChild.classList.add('rightAllign')
      }
    }
  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.getSupplierDetails();
    this.getProductDetails();
    this.getInventoryDetails();
    this.getUsersDetails();
    // this.getResult();
  }
  // @HostListener('window:resize', ['$event'])
  // onWindowResize() {
  //   this.getScreenWidth = window.innerWidth;
  //   this.getScreenHeight = window.innerHeight;
  //   console.log(this.getScreenWidth);
  //   console.log(this.getScreenHeight);
  // }
  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  resetFilters() {
    this.payloadJSON = {
      "selectCategory": null,
      "executiveIDName": null,
      "type": null,
      "supplierIDName": this.supplierIDName,
      "productIDName": null,
      "serialNumber": null,
      "batchNumber": null
    }
    this.finalArrayObj = null;
    this.warehouseData = [];
    this.StockCategoryType = false;
    this.pickingCategoryType = false;
    this.putawayCategoryType = false;
  }
  // getPromoStyles() {
  //     return '10px';
  // }
  getSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          const suppliers = response.data.supplierMasters;
          this.supplierData = suppliers.map(x => x.supplierIDName);
          let role;
          const user = Storage.getSessionUser();
          if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
            role = user.authorities[0].authority;
            this.supplierIDName = (role === 'SUPPLIER') ? suppliers.find(x => x.supplierEmailID == user.username).supplierIDName : null;
            this.payloadJSON.supplierIDName = this.supplierIDName;
          }
          if (this.wareHouseLayoutModules.length > 0) {
            let boolean = false;
            this.wareHouseLayoutModules.forEach(element => {
              if (element.name == 'Stock') {
                this.stockPermissionsList = element.permissions ? element.permissions.map(x => x.permissionName) : [];
                boolean == false ? this.setTypevalue('Stock') : '';
                this.StockCategoryType = (boolean == false) ? true : null;
                boolean = true;
              }
              if (element.name == 'Layout Putaway') {
                this.putawayPermissionsList = element.permissions ? element.permissions.map(x => x.permissionName) : [];
                boolean == false ? this.setTypevalue('Putaway') : '';
                this.putawayCategoryType = (boolean == false) ? true : null;
                boolean = true;
              }
              if (element.name == 'LayoutPicking') {
                this.pickingPermisionsList = element.permissions ? element.permissions.map(x => x.permissionName) : [];
                boolean == false ? this.setTypevalue('Picking') : '';
                this.pickingCategoryType = (boolean == false) ? true : null;
                boolean = true;
              }
            });
          }
        }
      })
  }
  getProductDetails() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          const products = response.data.productMasters;
          this.productsData = products.map(x => x.productIDName);
        }
      })
  }
  getUsersDetails() {
    this.commonMasterDataService.fetchUserDetailsByRoleInfo().subscribe(data => {
      if (data.status == 0 && data.data.users && data.data.users.length > 0) {
        this.users = data.data.users;
      }
      else {
        this.users = [];
      }
    })
    // let role = null;
    // const user = Storage.getSessionUser();
    // if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
    //   role = user.authorities[0].authority;
    // }
    // this.commonMasterDataService.fetchUserDetailsByRoleInfo().subscribe(
    //   (response) => {
    //     if (response && response.status === 0 && response.data.users) {
    //       this.users = response.data.users;
    //       if (['ROLE_CLIENT'].includes(role)) {
    //         this.users = response.data.users.filter(user =>
    //           user.rolesList && user.rolesList[0] && user.rolesList[0].roleName !== 'ROLE_CLIENT');
    //       }
    //     } else {
    //       this.users = [];
    //     }
    //   },
    //   (error) => {
    //     this.users = [];
    //   });
  }
  fetchAllWarehouseTeams(workType) {
    const form = JSON.parse(JSON.stringify(this.formObj));
    form["workType"] = workType;
    this.commonMasterDataService.fetchAllExecutionIDName(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouseTeams) {
          this.wareHouseTeamsList = response.data.wareHouseTeams;
          // this.wareHouseTeamsListIDs = this.wareHouseTeamsList.map(x => x.executiveIDName);
        }
      })
  }
  removeDuplicates(arr) {
    return arr.filter((el, i, a) => i === a.indexOf(el));
  }

  getInventoryDetails() {
    this.wmsService.findAllInventories('', this.formObj).subscribe(
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
  hide: boolean = true;
  setTypevalue(keyValue) {
    this.fetchAllWarehouseTeams(keyValue);
    this.payloadJSON = {
      "selectCategory": keyValue,
      "executiveIDName": null,
      "type": null,
      "supplierIDName": this.supplierIDName,
      "productIDName": null,
      "serialNumber": null,
      "batchNumber": null
    }
    if (keyValue == 'Stock') {
      this.payloadJSON.type = 'Stock Available';
      this.hide = true
    }
    if (keyValue == 'Putaway') {
      this.hide = false
    }
    if (keyValue == 'Picking') {
      this.hide = false
    }
    this.getResult();

  }
  getDataForFilters(name, key, zone) {
    this.rerender();
    this.getLocSpaceDetails(name, key, zone);
  }

  getLocSpaceDetails(name, key, zone) {
    this.locationStatus = [];
    const form = {
      "zoneNames": (key == 'zone') ? [name] : ((key == 'rack') ? [zone] : null),
      "rackNames": (key == 'rack') ? [name] : null,
      "locationNames": null,
    }
    const final = Object.assign(form, this.formObj);
    this.wmsService.getLocStatusInLayout(final).subscribe(data => {
      if (data['status'] == 0 && data['data'].locationSpaceUtilizationList) {
        this.locationStatus = data['data'].locationSpaceUtilizationList;
        this.dtTrigger.next();
        this.ngxSmartModalService.getModal('spaceUtilization').open();
      }
    })
  }
  getProductUtilization(name, key, zone) {
    this.productStatusValues = [];
    if (this.stockPermissionsList.includes('Update')) {
      const form = {
        "zoneNames": (key == 'zone') ? [name] : ((key == 'rack') ? [zone] : null),
        "rackNames": (key == 'rack') ? [name] : null,
        "locationNames": null
      }
      const final = Object.assign(form, this.formObj);
      this.wmsService.getLocStatusInLayout(final).subscribe(data => {
        if (data['status'] == 0 && data['data'].locationSpaceUtilizationList) {
          const locationStatus = data['data'].locationSpaceUtilizationList;
          this.productStatusValues = this.excelService.formatJSONForHeaderLines(locationStatus, 'locationQuantityHelpers');
          this.ngxSmartModalService.getModal('productPopup').open();
          this.rerender();
          this.dtTrigger.next();
        }
      })
    }
    else {
      this.toastr.error("user doesnt have Permissions")
    }
  }
  showrawUnits: any;
  getSpaceUtil(name, key) {
    if (this.stockPermissionsList.includes('Update')) {
      this.utilizationHeader = name;
      const form = {
        "zoneNames": (key == 'zone') ? [name] : null,
        "rackNames": (key == 'rack') ? [name] : null,
        "wareHouseNames": (key == 'warehouse') ? [name] : null,
        "locationNames": null
      }
      const final = Object.assign(form, this.formObj);
      this.wmsService.getSpaceUtilization(final).subscribe(data => {
        if (data['status'] == 0 && data['data'].wareHouseLayoutSpaceUtilization.locationDimensionsResponse) {
          this.storagePopupData = [];
          this.showrawUnits = data['data'].wareHouseLayoutSpaceUtilization.locationDimensionsResponse.totalSpaceUom;
          const store = data['data'].wareHouseLayoutSpaceUtilization.spaceUtilizationResponses;
          const Available = store.find(x => x.locationSpaceStatus == 'Completely Available');
          const Partial = store.find(x => x.locationSpaceStatus == 'Partially Available');
          const UnAvaiable = store.find(x => x.locationSpaceStatus == 'UnAvailable');
          if (Available) {
            this.storagePopupData.push(Available);
          }
          if (Partial) {
            this.storagePopupData.push(Partial);
          }
          if (UnAvaiable) {
            this.storagePopupData.push(UnAvaiable);
          }
          this.locDimension = data['data'].wareHouseLayoutSpaceUtilization.locationDimensionsResponse;
          this.ngxSmartModalService.getModal('utilPopup').open();
        }
        else {
          this.storagePopupData = [];
          this.locDimension = null;
          this.toastr.error('No Data Found.')
        }
      })

    }
    else {
      this.toastr.error("user doesnt have permission")
    }

  }
  getResult() {
    const final = Object.assign(this.payloadJSON, this.formObj);
    if (this.supplierIDName) {
      this.wmsService.findWareHouseLayoutforSupplierLogin(final).subscribe(data => {
        if (data['status'] == "0" && data['data']['wareHouseLayout']) {
          this.finalArrayObj = data['data']['wareHouseLayout'].wareHouseLayoutWareHouseDetails[0];
          this.warehouseData = this.finalArrayObj.wareHouseLayoutZoneDetails;
          this.filterRacksData();
        }
      })
    }
    else {
      this.wmsService.findWareHouseLayout(final).subscribe(data => {
        if (data['status'] == "0" && data['data']['wareHouseLayout']) {
          this.finalArrayObj = data['data']['wareHouseLayout'].wareHouseLayoutWareHouseDetails[0];
          this.warehouseData = this.finalArrayObj.wareHouseLayoutZoneDetails;
          this.filterRacksData();
        }
        console.log(this.finalArrayObj);
      })
    }
  }
  filterRacksData() {
    if (this.warehouseData && this.warehouseData[0] && this.warehouseData[0].wareHouseLayoutRackDetails) {
      this.warehouseData.forEach((zone, i) => {
        zone.wareHouseLayoutRackDetails.forEach((rack, j) => {
          rack.wareHouseLayoutColumnDetails.forEach((column, k) => {
            if (rack.columnDirection == 'Left') {
              column['backLeft'] = parseInt(column.xcoordinate) - parseInt(column.width) - 3;
              column['backTop'] = column.ycoordinate;
            }
            if (rack.columnDirection == 'Top') {
              column['backLeft'] = column.xcoordinate;
              column['backTop'] = parseInt(column.ycoordinate) - parseInt(column.height) - 3;
            }
            if (rack.columnDirection == 'Right') {
              column['backLeft'] = parseInt(column.xcoordinate) + parseInt(column.width) + 3;
              column['backTop'] = column.ycoordinate;
            }
            if (rack.columnDirection == 'Bottom') {
              column['backLeft'] = column.xcoordinate;
              column['backTop'] = parseInt(column.ycoordinate) + parseInt(column.height) + 3;
            }
            let frontLocations = [];
            let backLocations = [];
            if (rack.mode === '1deep') {
              frontLocations = column.wareHouseLayoutLevelDetails;
            } else {
              column.wareHouseLayoutLevelDetails.forEach(level => {
                if (level && level.locationName === null) {
                  frontLocations.push(level);
                  backLocations.push(level);
                } else {
                  if (level.position == 'Front') {
                    frontLocations.push(level);
                  }
                  if (level.position == 'Back') {
                    backLocations.push(level);
                  }
                }
              })
              if (frontLocations.length != backLocations.length) {
                frontLocations.forEach(front => {
                  if (column.wareHouseLayoutLevelDetails.find(x => x.levelID == front.levelID && x.position == 'Back')) {

                  }
                  else {
                    backLocations.push({
                      "levelID": front.levelID, "levelName": front.levelName, locationID: null, locationName: null,
                      position: null, select: null, wareHouseLayoutInventoryDetails: null, wareHouseLayoutPickingDetails: null, wareHouseLayoutPutawayDetails: null, wareHouseLayoutPutawaySoftLocationDetails: null
                    });

                  }
                });
              }


              // backLocations.forEach((element, i) => {
              //   if (element.position == 'Front') {
              //     if (backLocations.find(x => x.levelID == element.levelID && x.locationName == element.locationName && element.position == 'Back')) {
              //       backLocations.splice(i, 1);
              //     }
              //   }
              // })

              // backLocations.push(level);

              // if (level.position == 'Front') {
              //   frontLocations.push(level);
              // }
              // else {
              //   if (!level.position){
              //     frontLocations.push(level);
              //   }
              // }
              // if (level.position == 'Back') {
              //   backLocations.push(level);
              // }
              // else {
              //   if (!level.position){
              //     backLocations.push(level);
              //   }
              // }
              // })
              // frontLocations.forEach((element, i) => {
              //   if (element.position == 'Back') {
              //     frontLocations.splice(i, 1);
              //   }
              // });
              // backLocations.forEach((element, i) => {
              //   if (backLocations.find(x => x.levelID == element.levelID && x.locationName == element.locationName && element.position == 'Back')) {
              //     const indexValue = backLocations.findIndex(x => x.levelID == element.levelID && x.locationName == element.locationName && element.position == 'Front');
              //     (indexValue != -1) ? backLocations.splice(indexValue, 1) : '';
              //   }
              // });
              // frontLocations = column.wareHouseLayoutLevelDetails;
              // backLocations = column.wareHouseLayoutLevelDetails;
              // column.wareHouseLayoutLevelDetails.forEach(location => {
              // frontLocations.push(location);
              // // backLocations.push(location);
              // if (location.position == 'Front') {
              //   const index = frontLocations.findIndex((x => x.levelID == location.levelID && x.locationID == location.locationID && x.position == 'Back'))
              //   if (index != -1) {
              //     frontLocations.splice(index, 1);
              //   }
              // }
              // else if (location.position == 'Back') {
              //   const index = frontLocations.findIndex((x => x.levelID == location.levelID && x.locationID == location.locationID && x.position == 'Front'))
              //   if (index != -1) {
              //     backLocations.splice(index, 1);
              //   }
              // }

              // else {
              //   frontLocations.push(location);
              //   backLocations.push(location);
              // }


              // });
            }
            this.warehouseData[i].wareHouseLayoutRackDetails[j].wareHouseLayoutColumnDetails[k].frontLocations = frontLocations.reverse();
            this.warehouseData[i].wareHouseLayoutRackDetails[j].wareHouseLayoutColumnDetails[k].backLocations = backLocations.reverse();
            // console.log(this.warehouseData[i].wareHouseLayoutRackDetails[j].wareHouseLayoutColumnDetails[k]);
          });
        });
      });
    }
  }
  onStatusChange(key, putawayLine) {
    if ((this.payloadJSON.selectCategory == 'Stock' && this.stockPermissionsList.includes('Update')) ||
      (this.payloadJSON.selectCategory == 'Putaway' && this.putawayPermissionsList.includes('Update')) ||
      (this.payloadJSON.selectCategory == 'Picking' && this.pickingPermisionsList.includes('Update'))) {
      // const jsonData = {
      //   "putawayNumber": putawayLine.putawayNumber,
      //   "endTime": (key == 'status') ? new Date() : null,
      //   "startTime": (key == 'status') ? putawayLine.startTime : new Date(),
      //   "isPutAwayCompleted": (key == 'status') ? true : false
      // }
      // const final = Object.assign(jsonData, this.formObj);
      // this.wmsService.completePutawaySerives([putawayLine]).subscribe(

      putawayLine['endTime'] = (key == 'status') ? new Date() : null;
      putawayLine['startTime'] = (key == 'status') ? putawayLine.startTime : new Date();
      putawayLine['putAwayCompleted'] = (key == 'status') ? true : false
      this.commonMasterDataService.updatePutawayAssignedTo([putawayLine]).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.putawayResponseObj) {
            this.getResult();
            (key == 'status') ? this.toastr.success('Completed successfully') : this.toastr.success('Started successfully');
          } else {
            this.toastr.error('Failed in completing');
          }
        },
        (error) => {
          this.toastr.error('Failed in completing');
        });
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  updateStatus(key, attribute) {
    if ((this.payloadJSON.selectCategory == 'Stock' && this.stockPermissionsList.includes('Update')) ||
      (this.payloadJSON.selectCategory == 'Putaway' && this.putawayPermissionsList.includes('Update')) ||
      (this.payloadJSON.selectCategory == 'Picking' && this.pickingPermisionsList.includes('Update'))) {
      // const jsonData = {
      //   "wmsoNumber": attribute.wmsoNumber,
      //   "endTime": (key == 'status') ? new Date() : null,
      //   "startTime": (key == 'status') ? attribute.startTime : new Date(),
      //   "isPickingCompleted": (key == 'status') ? true : false,
      //   "pickingNumber": attribute.pickingNumber
      // }
      // const final = Object.assign(jsonData, this.formObj);
      // this.outboundProcessService.updatePickAllStatus(final).subscribe(
      attribute['endTime'] = (key == 'status') ? new Date() : null;
      attribute['startTime'] = (key == 'status') ? attribute.startTime : new Date();
      attribute['pickingCompleted'] = (key == 'status') ? true : false

      this.commonMasterDataService.updatePickingAssignedTo([attribute]).subscribe(
        (response) => {
          if (response.status == 0 && response.data.pickingResponseObj) {
            (key == 'status') ? this.toastr.success('Completed successfully') : this.toastr.success('Started successfully');
            this.getResult();
          }
          else {
            this.toastr.error('Failed in completing');
          }
        },
        (error) => {
          this.toastr.error('Failed in completing');
        });
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getSelectBoolean(frontLocations) {
    const arrays = frontLocations.map(x => x.select);
    return arrays.includes('Yes');
  }
  callResultMethod(key, value) {
    if (key) {
      this.payloadJSON = {
        "selectCategory": 'Stock',
        "executiveIDName": null,
        "type": null,
        "supplierIDName": this.supplierIDName,
        "productIDName": null,
        "serialNumber": null,
        "batchNumber": null
      }
      this.payloadJSON[key] = value;
      this.getResult();
    }
  }

}
