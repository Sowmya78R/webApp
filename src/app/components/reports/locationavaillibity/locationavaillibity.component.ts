import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData, CompleterService } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ReportsService } from 'src/app/services/integration-services/reports.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ReportsCommonService } from 'src/app/services/reports-common.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { Util } from 'src/app/shared/utils/util';

@Component({
  selector: 'app-locationavaillibity',
  templateUrl: './locationavaillibity.component.html',
  styleUrls: ['./locationavaillibity.component.scss']
})
export class LocationavaillibityComponent implements OnInit {


  locationDropDownList = [];
  selectedItems = [];
  dropdownSettings = {};

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  locationAvailbilityForm: FormGroup;
  productTypes: any = Constants.PRODUCT_TYPES;
  categoryDrop: CompleterData;
  products: CompleterData;
  inventoryData: any;
  productData: any;
  suppliersIDs: CompleterData;
  productCategoriesIDs: CompleterData;
  batchNumberIDs: CompleterData;
  serialNumberIDs: CompleterData;
  zones: any;
  locationsIDs: CompleterData
  zoneNameValues: CompleterData;
  grnhistoryResponseList: any;
  rackNameValues: CompleterData;
  formObj = this.configService.getGlobalpayload();
  wareHouseDefaultValueFromHeader: any;
  zonesInfo: any = []
  totalSpace: any;
  uom: any;




  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;



  spaceUtilizationResponceLocationList: any = [];
  constructor(private wmsService: WMSService, private configService: ConfigurationService,
    private util: Util,
    private excelService: ExcelService,
    private reportsService: ReportsService, private completerService: CompleterService, private toastr: ToastrService,
    private fb: FormBuilder, private metaDataService: MetaDataService,
    private commonService: CommonService, private reportsCommonService: ReportsCommonService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }
  ngOnInit() {
    this.fetchLLocationType();
    this.fetchAllProducts();
    this.fetchAllProductCategories();
    this.dropdownSettings = {
      multiselect: false,
      singleSelection: false,
      idField: '_id',
      textField: 'column',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createlocationAvailbilityForm();
    this.fetchAllLocations();
    this.fetchAllZones();
    this.fetchAllRacks();
    this.fetchAllWarehouseDetails();
    this.fetchAllSuppliers();
  }
  locationsTypeArray: any[] = ['Receive', 'Return']
  createlocationAvailbilityForm() {
    this.locationAvailbilityForm = this.fb.group({
      productIDName: [null,Validators.required],
      supplierIDName: [null],
      zoneName: [null],
      rackName: [null],
      locationName: [null],
      organizationIDName: this.configService.getOrganization().organizationIDName,
      wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
      locationType: [null,Validators.required],
    })
    //  this.locationAvailbilityForm.controls.wareHouseNames.setValue(this.configService.getWarehouse().wareHouseName);
    //this.wmsService.spaceUtilizationWareHousepassing = this.configService.getWarehouse().wareHouseName
  }

  productCategories: any;
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategories = response.data.productCategories;
          this.categoryDrop = response.data.productCategories.map(categoryname => categoryname.productCategoryName);

        } else {
          this.productCategories = [];
        }
      },
      (error) => {
        this.productCategories = [];
      });
  }
  productIDNameValues: any = [];
  getZoneListIDs :any=[]
  fetchAllProducts() {
    const form = {
      "organizationIDName": this.configService.getOrganization().organizationIDName,
      "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName
    }
    this.wmsService.fetchAllProducts(form).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.products = response.data.productMasters;
          console.log(this.products);
          this.productIDNameValues = response.data.productMasters.map(productID => productID.productIDName);

        } else {

        }
      })

  }
  locationTypeList = []
  fetchLLocationType() {
    this.locationTypeList = this.locationsTypeArray.map(locationtype => locationtype)

  }
  globalProductName: any;
  globalSupplierName: any;
  globalZoneName: any;
  globalRackName: any;
  globalLocationName: any;
  globalLocationTypeName: any;


  overALLLocationList: any;
  //getZoneListIDs:CompleterData;
  getLocationListIDs:CompleterData
  getRackListIDs:CompleterData
  getSupplierListIDs:CompleterData
  getSelectedValue(type, data) {
    
    switch (type) {
      case 'productName': {
        if(data!=null){
          this.globalProductName = (data.originalObject) ? (data.originalObject):null;
        }else{
          this.globalProductName = null;
        }
        
       
        let objReq = {
          productIDName: this.globalProductName,
          supplierIDName: this.globalSupplierName ? this.globalSupplierName: null,
          zoneName: this.globalZoneName ? this.globalZoneName: null,
          rackName: this.globalRackName ? this.globalRackName : null,
          locationName: this.globalLocationName ? this.globalLocationName: null,
          organizationIDName: this.configService.getOrganization().organizationIDName,
          wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
          locationType: this.globalLocationTypeName ? this.globalLocationTypeName : null,
        };
        this.locationAvailbilityForm.get('zoneName').setValue(null)
        this.locationAvailbilityForm.get('rackName').setValue(null)
        objReq.zoneName = null;
        objReq.rackName = null;
        this.getZoneListIDs = this.completerService.local([])
        this.getRackListIDs = this.completerService.local([])
        this.getRackListIDs = null
        this.getZoneListIDs = null;
        this.wmsService.fetchAllLocationIndividualDetailss(objReq).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.locationAvailabilityReportFilterResponse) {
              debugger
              this.overALLLocationList = response.data.locationAvailabilityReportFilterResponse;
              this.getZoneListIDs = this.completerService.local([])
              this.getRackListIDs = this.completerService.local([])
              this.getRackListIDs = null
              this.getZoneListIDs = null;
              if(response.data.locationAvailabilityReportFilterResponse.zoneNames){
                      
              //this.getZoneListIDs = response.data.locationAvailabilityReportFilterResponse.zoneNames.map(findZoneList=>findZoneList ? findZoneList:null)
              this.getZoneListIDs = response.data.locationAvailabilityReportFilterResponse.zoneNames;
            }
            if(response.data.locationAvailabilityReportFilterResponse.supplierIDNames){
              this.getSupplierListIDs = response.data.locationAvailabilityReportFilterResponse.supplierIDNames.map(findSupplierList=>findSupplierList)
            }
          }
          }
        );
        break;
      }
      case 'supplierName': {
        if(data!=null){
          this.globalSupplierName = (data.originalObject) ? (data.originalObject):null;
        }else{
          this.globalSupplierName = null;
        }
        this.getRackListIDs = this.completerService.local(null);
        let objReq = {
          productIDName: this.globalProductName ? this.globalProductName: null,
          supplierIDName: this.globalSupplierName,
          zoneName: this.globalZoneName ? this.globalZoneName: null,
          rackName: this.globalRackName ? this.globalRackName : null,
          locationName: this.globalLocationName ? this.globalLocationName: null,
          organizationIDName: this.configService.getOrganization().organizationIDName,
          wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
          locationType: this.globalLocationTypeName ? this.globalLocationTypeName : null,
        };
        this.locationAvailbilityForm.get('zoneName').setValue(null)
        this.locationAvailbilityForm.get('rackName').setValue(null)
        this.locationAvailbilityForm.get('locationName').setValue(null)
        objReq.zoneName = null;
        objReq.rackName = null;
        objReq.locationName = null
        this.wmsService.fetchAllLocationIndividualDetailss(objReq).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.locationAvailabilityReportFilterResponse) {
              this.overALLLocationList = response.data.locationAvailabilityReportFilterResponse;
              debugger
              this.getZoneListIDs = null
              this.getZoneListIDs = response.data.locationAvailabilityReportFilterResponse.zoneNames.map(findZoneList=>findZoneList ? findZoneList:null)
            }
           
          }
        );
        break;
      }
      case 'zoneNames': {
        if(data!=null){
          this.globalZoneName = (data.originalObject) ? (data.originalObject):null;
        }else{
          this.globalZoneName = null;
        }
        
        let objReq = {
          productIDName: this.globalProductName ? this.globalProductName: null,
          supplierIDName: this.globalSupplierName ? this.globalSupplierName: null,
          zoneName:this.globalZoneName,
          rackName: this.globalRackName ? this.globalRackName : null,
          locationName: this.globalLocationName ? this.globalLocationName: null,
          organizationIDName: this.configService.getOrganization().organizationIDName,
          wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
          locationType: this.globalLocationTypeName ? this.globalLocationTypeName : null,
        };
        this.wmsService.fetchAllLocationIndividualDetailss(objReq).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.locationAvailabilityReportFilterResponse) {
              debugger
              this.overALLLocationList = response.data.locationAvailabilityReportFilterResponse;
              this.getZoneListIDs = this.completerService.local([])
              this.getRackListIDs = this.completerService.local([])
              this.getRackListIDs = null
              this.getZoneListIDs = null;
              this.getZoneListIDs = response.data.locationAvailabilityReportFilterResponse.zoneNames.map(findZoneList=>findZoneList ? findZoneList:null)
           
              this.getRackListIDs = this.completerService.local(null);
              if(response.data.locationAvailabilityReportFilterResponse.rackNames){
                this.getRackListIDs = response.data.locationAvailabilityReportFilterResponse.rackNames.map(findRackList=>findRackList ? findRackList:null )

              }
                
             
            }
          }
        );
        break;
      }
      case 'rackNames': {
        if(data!=null){
          this.globalRackName = (data.originalObject) ? (data.originalObject):null;
        }else{
          this.globalRackName = null;
        }
        let objReq = {
          productIDName: this.globalProductName ? this.globalProductName: null,
          supplierIDName: this.globalSupplierName ? this.globalSupplierName: null,
          zoneName: this.globalZoneName ? this.globalZoneName : null,
          rackName:this.globalRackName,
          locationName: this.globalLocationName ? this.globalLocationName: null,
          organizationIDName: this.configService.getOrganization().organizationIDName,
          wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
          locationType: this.globalLocationTypeName ? this.globalLocationTypeName : null,
        };
        this.wmsService.fetchAllLocationIndividualDetailss(objReq).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.locationAvailabilityReportFilterResponse) {
              this.overALLLocationList = response.data.locationAvailabilityReportFilterResponse;
              this.getLocationListIDs = response.data.locationAvailabilityReportFilterResponse.locationNames.map(findLocationList=>findLocationList)
            }
          }
        );
        break;
      }
      case 'locationTypes': {
  this.clearExceptLocationType()     
        this.globalLocationTypeName = data.target.value;
       
        let objReq = {
          productIDName: this.globalProductName ? this.globalProductName: null,
          supplierIDName: this.globalSupplierName ? this.globalSupplierName: null,
          zoneName: this.globalZoneName ? this.globalZoneName : null,
          rackName: this.globalRackName ? this.globalRackName : null,
          locationName: this.globalLocationName ? this.globalLocationName: null,
          organizationIDName: this.configService.getOrganization().organizationIDName,
          wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
          locationType: data.target.value ? data.target.value : null
        };
        this.wmsService.fetchAllLocationIndividualDetailss(objReq).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.locationAvailabilityReportFilterResponse) {
              this.overALLLocationList = response.data.locationAvailabilityReportFilterResponse;
              this.getLocationListIDs = response.data.locationAvailabilityReportFilterResponse.locationNames.map(findLocationList=>findLocationList)
            }
          
          }
        );
        break;
      }
      case 'locationNames': {
        if(data!=null){
          this.globalLocationName = (data.originalObject) ? (data.originalObject):null;
        }else{
          this.globalLocationName = null;
        }
        let objReq = {
          productIDName: this.globalProductName ? this.globalProductName: null,
          supplierIDName: this.globalSupplierName ? this.globalSupplierName: null,
          zoneName: this.globalZoneName ? this.globalZoneName : null,
          rackName: this.globalRackName ? this.globalRackName : null,
          locationName: this.globalLocationName ? this.globalLocationName: null,
          organizationIDName: this.configService.getOrganization().organizationIDName,
          wareHouseIDName: this.configService.getWarehouse().wareHouseIDName,
          locationType: this.globalLocationTypeName ? this.globalLocationTypeName : null 
        };
        this.wmsService.fetchAllLocationIndividualDetailss(objReq).subscribe(
          (response) => {
            if (response && response.status === 0 && response.data.locationAvailabilityReportFilterResponse) {
              debugger
              this.overALLLocationList = response.data.locationAvailabilityReportFilterResponse;
              this.getZoneListIDs = response.data.locationAvailabilityReportFilterResponse.zoneNames.map(findZoneList=>findZoneList)
            }
          }
        );
        break;
      }
    }
  } 

  clearExceptLocationType(){     
      this.locationAvailbilityForm.get('productIDName').setValue(null)
      this.locationAvailbilityForm.get('supplierIDName').setValue(null)
      this.locationAvailbilityForm.get('zoneName').setValue(null)
      this.locationAvailbilityForm.get('rackName').setValue(null)
      this.locationAvailbilityForm.get('locationName').setValue(null)    
  }
  supplierIDNames = [];
  overALLSupplierList: any;
  fetchAllSuppliers() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.overALLSupplierList = response.data.supplierMasters;
          console.log(this.overALLSupplierList);
          this.supplierIDNames = response.data.supplierMasters.map(x => x.supplierIDName)

        }
      })
  }
  zoneDropDownList = [];
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.zones) {
          this.zoneDropDownList = response.data.zones.map(x => x.zoneName)
            ;
        }
      },
      (error) => {
      });
  }
  rackDropDownList = [];
  fetchAllRacks() {
    this.wmsService.fetchAllRacks(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.racks) {
          this.rackDropDownList = response.data.racks.map(rack => rack.rackName);
        }
      },
      (error) => {
      });
  }
  warehousesList: any;
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.warehousesList = response.data.wareHouses;
          this.warehousesList = response.data.wareHouses.map(warehouse => warehouse.wareHouseName);

          this.rerender();
        } else {
          this.warehousesList = [];
        }
      },
      (error) => {
        this.warehousesList = [];
      });
  }

  fetchAllLocations() {
    this.wmsService.fetchAllLocations(this.configService.getGlobalpayload()).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.locationDropDownList = response.data.locations.map(locationname => locationname.locationName);;
        } else {
        }
      },
      (error) => {
      });
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
  }
  clear(){
    this.locationAvailbilityForm.reset();
    this.createlocationAvailbilityForm();
  }
  firstArray:any;
  secondArray:any;
  finalArray:any= []
  filter() {
    this.wmsService.filterLocationAvailbility(this.locationAvailbilityForm.value).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.locations) {
          this.firstArray = response.data.locations.completelyAvailableLocations;
          this.secondArray = response.data.locations.partiallyAvailableLocations;
          this.finalArray = [...this.firstArray,...this.secondArray];
          const form = JSON.parse(JSON.stringify(this.locationAvailbilityForm.value));
          console.log(this.finalArray);
          this.rerender();
          this.wmsService.locationavailabilityfromdatapassing = form
          this.wmsService.locationavailabilityDisplayTableList = this.finalArray
        } else {
        }
      },
      (error) => {
      });
  } 
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName, formName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.util.shouldShowErrors(fieldName, formName);
    }
  }
  focusedElement: any;
  shouldShowSuccess(fieldName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.locationAvailbilityForm.controls[fieldName].valid && this.locationAvailbilityForm.controls[fieldName].touched;
    }
  }
  generatePDF() {
    setTimeout(() => {
      window.print();
    }, 800);
  }  
}

