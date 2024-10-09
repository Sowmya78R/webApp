import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { Storage } from '../../../shared/utils/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-themeconfig',
  templateUrl: './themeconfig.component.html',
  styleUrls: ['./themeconfig.component.scss']
})
export class ThemeconfigComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  sZoneConfig: FormGroup;
  formObj = this.configService.getGlobalpayload();
  getAllDataList: any = [];
  zoneNames: any = [];
  themeConfigScreenForm: FormGroup;
  arr: any = [];
  organizationResponseList: any = []
  warehouses: any;
  wareHouseIDNAmeIDs: CompleterData;
  wareHouseListResponse: any = []
  homeTitleColor: any;
  menuPageTitle: any;
  headerMenuFontColor: any;
  footerMenuFontColor: any;
  homePageHeaderImg: any;
  homePageTextArray: any = []
  homePageHeaderImageOnly: any = []
  homePageFooterArr: any = [];
  homePageTittleArr: any = []
  menuPageFooterArr: any = [];
  menuPageTitleColor: any;
  menuFontColor: any;
  saveButton: any;
  clearButton: any;
  tableColor: any;
  tableHeaderFontColor: any;
  panelColor: any;
  panelFontColor: any;
  deleteAndScrollColor: any;
  hometestVariable: boolean = false
  childWareHouseDropdown: any;
  childOrganizationDropdown: any = null
  getDropdownData: any;
  organizationValuesIDs: CompleterData;
  wareHouseValuesIds: any;
  menuPageTitleArr: any;
  homeTitle: any;
  homepageSideTitleHeading: any;
  homePageText: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private fb: FormBuilder, private configService: ConfigurationService, private metaDataService: MetaDataService,
    private toastr: ToastrService, private wmsService: WMSService, private commonMasterDataService: CommonMasterDataService,
    public ngxSmartModalService: NgxSmartModalService, private commonService: CommonService,
     private excelRestService: ExcelRestService,  private translate: TranslateService,) {
      this.translate.use(this.language);
    }
  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.fetchAllWarehouseDetails();
    this.fetchAllOrganizations();
    this.createThemeConfigForm();
    this.fetchThemeConfig();
    this.get()
  }
  createThemeConfigForm() {
    this.themeConfigScreenForm = this.fb.group({
      _id: null,
      name: null,
      "wareHouseInfo": this.configService.getWarehouse(),
      "organizationInfo": this.configService.getOrganization(),
      createdDate: null,
      lastUpdatedDate: null,
      themeProcesses: [null],
    })
  }
  fetchAllOrganizations() {
    this.excelRestService.fetchAllOrganizations({}).subscribe(res => {
      if (res['status'] == 0 && res['data']['organizations'].length > 0) {
        this.organizationResponseList = res['data']['organizations'];
      }
    })
  }
  get() {
    this.commonMasterDataService.findAllWareHouseConfigurations({ "userIDName": Storage.getSessionItem('userDetails').userIDName }).subscribe(data => {
      if (data['status'] == 0 && data['data']['wareHouseConfigurations'].length > 0) {
        this.getWareHouseConfiguratioonsList = data['data']['wareHouseConfigurations'];
        this.getDropdownData = data['data']['wareHouseConfigurations'][0].wareHouseFunctionalities;
        console.log(this.getDropdownData);
        const arr: any = [...new Set(data['data'].wareHouseConfigurations[0].wareHouseFunctionalities.map(x => x.organizationInfo.organizationIDName))];
        console.log(arr);
        this.organizationValuesIDs = arr;
      }
    })
  }
  getWareHouseConfiguratioonsList: any;
  getWareHouses(event) {
    let data = this.organizationResponseList.find(k => k.organizationIDName === event.originalObject)
    if (data) {
      let obj = {}
      obj['organizationID'] = data.organizationID
      obj['organizationName'] = data.organizationName
      obj['organizationIDName'] = data.organizationIDName
      obj['_id'] = data._id
      this.themeConfigScreenForm.controls.organizationInfo.setValue(obj)
    }
    const arr: any = [];
    this.wareHouseValuesIds = arr;
    if (event.originalObject) {
      this.getDropdownData.forEach(element => {
        if (element.organizationInfo.organizationIDName == event.originalObject) {
          arr.push(element.wareHouseInfo.wareHouseIDName);
        }
      });
      this.wareHouseValuesIds = arr;
    }
  }
  fetchAllWarehouseDetails() {
    this.wmsService.fetchAllWarehouses(this.formObj).subscribe((response) => {
      if (response && response.status === 0 && response.data.wareHouses) {
        this.wareHouseListResponse = response['data']['wareHouses'];
      } else {
        this.wareHouseListResponse = []
      }
    })
  }
  getWareHousesInfo(event) {
    let data = this.wareHouseListResponse.find(k => k.wareHouseIDName === event.originalObject)
    if (data) {
      let obj = {}
      obj['wareHouseID'] = data.wareHouseID
      obj['wareHouseIDName'] = data.wareHouseIDName
      obj['wareHouseName'] = data.wareHouseName
      obj['wareHouseMasterID'] = data.wareHouseMasterID
      this.themeConfigScreenForm.controls.wareHouseInfo.setValue(obj)
    }
  }
  uploadFiles(event, val) {
    if (val === 'Home Page Header Image') {
      if (event && event.target.files) {
        this.metaDataService.uploadImage(event.target.files[0]).subscribe(data => {
          if (data['data']['fileName']) {
            this.homePageTextArray = []
            let obj = {}
            obj['processValue'] = data['data']['fileName']
            obj['name'] = val
            const index = this.arr.findIndex(k => k.name === val)
            if (index != -1) {
              this.arr[index] = obj
            } else {
              this.arr.push(obj)
            }
            this.homePageTextArray.push(data['data']['fileName'])
            this.hometestVariable = true
          }
        })
      }
    }
    if (val === 'Home Page Header Image Only') {
      if (event && event.target.files) {
        this.metaDataService.uploadImage(event.target.files[0]).subscribe(data => {
          if (data['data']['fileName']) {
            this.homePageHeaderImageOnly = []
            let obj = {}
            obj['processValue'] = data['data']['fileName']
            obj['name'] = val
            const index = this.arr.findIndex(k => k.name === val)
            if (index != -1) {
              this.arr[index] = obj
            } else {
              this.arr.push(obj)
            }
            this.homePageHeaderImageOnly.push(data['data']['fileName'])
           // this.hometestVariable = true
          }
        })
      }
    }
     else if (val === 'Home Page Footer Image') {
      this.homePageFooterArr = []
      if (event && event.target.files) {
        this.metaDataService.uploadImage(event.target.files[0]).subscribe(data => {
          if (data['data']['fileName']) {
            let obj = {}
            obj['processValue'] = data['data']['fileName']
            obj['name'] = val
            const index = this.arr.findIndex(k => k.name === val)
            if (index != -1) {
              this.arr[index] = obj
            } else {
              this.arr.push(obj)
            }
            this.homePageFooterArr.push(data['data']['fileName'])
          }
        })
      }
    } else if (val === 'Menu Page Logo') {
      this.homePageTittleArr = []
      if (event && event.target.files) {
        this.metaDataService.uploadImage(event.target.files[0]).subscribe(data => {
          if (data['data']['fileName']) {
            let obj = {}
            obj['processValue'] = data['data']['fileName']
            obj['name'] = val
            const index = this.arr.findIndex(k => k.name === val)
            if (index != -1) {
              this.arr[index] = obj
            } else {
              this.arr.push(obj)
            }
            this.homePageTittleArr.push(data['data']['fileName'])
          }
        })
      }
    } else if (val === 'Menu Page Footer Image') {
      this.menuPageFooterArr = []
      if (event && event.target.files) {
        this.metaDataService.uploadImage(event.target.files[0]).subscribe(data => {
          if (data['data']['fileName']) {
            let obj = {}
            obj['processValue'] = data['data']['fileName']
            obj['name'] = val
            const index = this.arr.findIndex(k => k.name === val)
            if (index != -1) {
              this.arr[index] = obj
            } else {
              this.arr.push(obj)
            }
            this.menuPageFooterArr.push(data['data']['fileName'])
          }
        })
      }
    } else if (val === 'Home Page Title') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    }
    else if (val === 'Home Page Title') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Home Page Text') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Home page Side Title Heading') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    }
    else if (val === 'Home Page Title color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Organization Font Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }

    } else if (val === 'Header Menu Font Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }

    } else if (val === 'Footer Menu Font Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Menu Page Title Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Menu Font Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Save Button') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Clear Button') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Table Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Table Header Font Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Panel Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Panel Font Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Delete And Scroll Color') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    }
    this.themeConfigScreenForm.controls.themeProcesses.patchValue(this.arr)
  }
  deleteImageMethod(fileName, name) {
    if (name === 'Home Page Header Image') {
      this.homePageTextArray = []
      let obj = {}
      obj['processValue'] = ''
      obj['name'] = name
      const index = this.arr.findIndex(k => k.name === name)
      if (index != -1) {
        this.arr[index] = obj
      }
    }
    if (name === 'Home Page Header Image Only') {
      this.homePageHeaderImageOnly = []
      let obj = {}
      obj['processValue'] = ''
      obj['name'] = name
      const index = this.arr.findIndex(k => k.name === name)
      if (index != -1) {
        this.arr[index] = obj
      }
    } else if (name === 'Home Page Footer Image') {
      this.homePageFooterArr = []
      let obj = {}
      obj['processValue'] = ''
      obj['name'] = name
      const index = this.arr.findIndex(k => k.name === name)
      if (index != -1) {
        this.arr[index] = obj
      }
      // (i && i == 0) ? this[arrayName] = [] : (arrayName ? this[arrayName].splice(i, 1) : '');
    } else if (name === 'Menu Page Logo') {
      this.homePageTittleArr = []
      let obj = {}
      obj['processValue'] = ''
      obj['name'] = name
      const index = this.arr.findIndex(k => k.name === name)
      if (index != -1) {
        this.arr[index] = obj
      }
    } else if (name === 'Menu Page Footer Image') {
      this.menuPageFooterArr = []
      let obj = {}
      obj['processValue'] = ''
      obj['name'] = name
      const index = this.arr.findIndex(k => k.name === name)
      if (index != -1) {
        this.arr[index] = obj
      }
    }
  }
  save() {
    const form = this.themeConfigScreenForm.value;
    this.configService.saveorUpdateThemeConfigDetails(form).subscribe(response => {
      if (response && response.status === 0 && response.data.themeConfiguration) {
        this.toastr.success(response.statusMsg);

      } else {
        this.warehouses = [];
      }
    },
      (error) => {
        this.warehouses = [];
      });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
  fetchThemeConfig() {
    this.arr = []
    this.homePageTextArray = []
    this.homePageHeaderImageOnly = []
    this.menuPageFooterArr = []
    this.homePageFooterArr = []
    this.homePageTittleArr = []
    let formReq = {};
    formReq["organizationIDName"] = this.configService.getOrganization().organizationIDName
    formReq["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    this.configService.findAllThemeConfigurations(formReq).subscribe(response => {
      if (response && response.status === 0 && response.data.themeConfigurations) {
        this.themeConfigScreenForm.patchValue(response.data.themeConfigurations[0])
        this.arr = response.data.themeConfigurations[0].themeProcesses
        console.log(response.data.themeConfigurations);
        console.log(this.arr);
        this.themeConfigScreenForm.controls.themeProcesses.patchValue(this.arr)
        console.log(this.themeConfigScreenForm.value)
        this.arr.forEach(ele => {
          if (ele.name === 'Home Page Header Image') {
            this.homePageTextArray.push(ele.processValue)
          } if (ele.name === 'Home Page Header Image Only') {
            this.homePageHeaderImageOnly.push(ele.processValue)
          } else if (ele.name === 'Home Page Footer Image') {
            this.homePageFooterArr.push(ele.processValue)
          } else if (ele.name === 'Menu Page Logo') {
            this.homePageTittleArr.push(ele.processValue)
          } else if (ele.name === 'Menu Page Footer Image') {
            this.menuPageFooterArr.push(ele.processValue)
          } else if (ele.name === 'Home Page Title color') {
            this.homeTitleColor = ele.processValue
          } else if (ele.name === 'Organization Font Color') {
            this.menuPageTitle = ele.processValue
          } else if (ele.name === 'Header Menu Font Color') {
            this.headerMenuFontColor = ele.processValue
          } else if (ele.name === 'Footer Menu Font Color') {
            this.footerMenuFontColor = ele.processValue
          } else if (ele.name === 'Menu Page Title Color') {
            this.menuPageTitleColor = ele.processValue
          } else if (ele.name === 'Menu Font Color') {
            this.menuFontColor = ele.processValue
          } else if (ele.name === 'Save Button') {
            this.saveButton = ele.processValue
          } else if (ele.name === 'Home Page Title') {
            this.homeTitle = ele.processValue
          } else if (ele.name === 'Home page Side Title Heading') {
            this.homepageSideTitleHeading = ele.processValue
          } else if (ele.name === 'Home Page Text') {
            this.homePageText = ele.processValue
          } else if (ele.name === 'Table Color') {
            this.tableColor = ele.processValue
          } else if (ele.name === 'Table Header Font Color') {
            this.tableHeaderFontColor = ele.processValue
          } else if (ele.name === 'Panel Color') {
            this.panelColor = ele.processValue
          } else if (ele.name === 'Panel Font Color') {
            this.panelFontColor = ele.processValue
          } else if (ele.name === 'Delete And Scroll Color') {
            this.deleteAndScrollColor = ele.processValue
          }
        })
        if (this.homePageTextArray.lenth > 0) {
          this.hometestVariable = true
        } else {
          this.hometestVariable = true
        }
      } else {
        this.warehouses = [];
      }
    },
      (error) => {
        this.warehouses = [];
      });
  }
}
