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
  selector: 'app-logintheme-config',
  templateUrl: './logintheme-config.component.html',
  styleUrls: ['./logintheme-config.component.scss']
})
export class LoginthemeConfigComponent implements OnInit {
  loginThemeConfiForm: FormGroup;
  arr: any = []
  loginPageLogoArr: any = [];
  loginPageBackgroundImgArr: any = [];
  loginPageText: any
  loginPageTitle: any
  loginPageImgArr: any = [];
  applicationURLsResponseList: any = []
  applicationUrlList: any = []
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private fb: FormBuilder, private configService: ConfigurationService, private metaDataService: MetaDataService,
    private toastr: ToastrService, private wmsService: WMSService, private commonMasterDataService: CommonMasterDataService,
    public ngxSmartModalService: NgxSmartModalService, private commonService: CommonService,
    private excelRestService: ExcelRestService, private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createThemeConfigForm()
    this.fetchAllAPplicationUrlDetails()
  }
  createThemeConfigForm() {
    this.loginThemeConfiForm = this.fb.group({
      _id: null,
      applicationURL: null,
      // "wareHouseInfo": this.configService.getWarehouse(),
      // "organizationInfo": this.configService.getOrganization(),
      createdDate: null,
      lastUpdatedDate: null,
      loginThemeProcesses: [null],
    })
  }
  fetchAllAPplicationUrlDetails() {
    this.wmsService.fetchAllApplicationUrl({}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.applicationURLs) {
          this.applicationURLsResponseList = response.data.applicationURLs;
          this.applicationUrlList = this.applicationURLsResponseList.map(k => k.applicationURL)
        } else {
          this.applicationURLsResponseList = []
        }
      })
  }
  uploadFiles(event, val) {
    if (val === 'Login Page Logo') {
      if (event && event.target.files) {
        this.metaDataService.uploadImage(event.target.files[0]).subscribe(data => {
          if (data['data']['fileName']) {
            this.loginPageLogoArr = []
            let obj = {}
            obj['processValue'] = data['data']['fileName']
            obj['name'] = val
            const index = this.arr.findIndex(k => k.name === val)
            if (index != -1) {
              this.arr[index] = obj
            } else {
              this.arr.push(obj)
            }
            this.loginPageLogoArr.push(data['data']['fileName'])
          }
        })
      }
    } else if (val === 'Login Page Background Image') {
      if (event && event.target.files) {
        this.metaDataService.uploadImage(event.target.files[0]).subscribe(data => {
          if (data['data']['fileName']) {
            this.loginPageBackgroundImgArr = []
            let obj = {}
            obj['processValue'] = data['data']['fileName']
            obj['name'] = val
            const index = this.arr.findIndex(k => k.name === val)
            if (index != -1) {
              this.arr[index] = obj
            } else {
              this.arr.push(obj)
            }
            this.loginPageBackgroundImgArr.push(data['data']['fileName'])
          }
        })
      }
    } else if (val === 'Login Page Title') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Login Page Text') {
      let obj = {}
      obj['processValue'] = event.target.value
      obj['name'] = val
      const index = this.arr.findIndex(k => k.name === val)
      if (index != -1) {
        this.arr[index] = obj
      } else {
        this.arr.push(obj)
      }
    } else if (val === 'Login Page Image') {
      if (event && event.target.files) {
        this.metaDataService.uploadImage(event.target.files[0]).subscribe(data => {
          if (data['data']['fileName']) {
            this.loginPageImgArr = []
            let obj = {}
            obj['processValue'] = data['data']['fileName']
            obj['name'] = val
            const index = this.arr.findIndex(k => k.name === val)
            if (index != -1) {
              this.arr[index] = obj
            } else {
              this.arr.push(obj)
            }
            this.loginPageImgArr.push(data['data']['fileName'])
          }
        })
      }
      this.loginThemeConfiForm.controls.loginThemeProcesses.patchValue(this.arr)
    }
  }
  deleteImageMethod(fileName, name) {
    if (name === 'Login Page Logo') {
      this.loginPageLogoArr = []
      let obj = {}
      obj['processValue'] = ''
      obj['name'] = name
      const index = this.arr.findIndex(k => k.name === name)
      if (index != -1) {
        this.arr[index] = obj
      }
    } else if (name === 'Login Page Background Image') {
      this.loginPageBackgroundImgArr = []
      let obj = {}
      obj['processValue'] = ''
      obj['name'] = name
      const index = this.arr.findIndex(k => k.name === name)
      if (index != -1) {
        this.arr[index] = obj
      }
    } else if (name === 'Login Page Image') {
      this.loginPageImgArr = []
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
    const form = this.loginThemeConfiForm.value;
    this.configService.saveorUpdateLoginThemeConfigDetails(form).subscribe(data => {
      if (data && data.status === 0 && data.data['loginThemeConfiguration']) {
        //this.clear()
        this.toastr.success(data.statusMsg);
      }
    })
  }
  // findAllLoginThemeConfiData(){
  //   let obj ={}
  //   this.configService.findAllLoginThemeConfigurations(obj).subscribe(response => {
  //     if (response && response.status === 0 && response.data.themeConfigurations) {

  //       this.arr = response.data.themeConfigurations[0].loginThemeProcesses
  //     }
  //   })
  // }
  clear() {
    this.loginThemeConfiForm.reset()
    this.arr = []
    this.loginPageTitle = ''
    this.loginPageBackgroundImgArr = []
    this.loginPageImgArr = []
    this.loginPageLogoArr = []
    this.loginPageText = ''
  }
}
