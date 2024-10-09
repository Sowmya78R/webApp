import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DecimalUtils } from 'src/app/constants/decimal';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';

import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { Storage } from '../../../shared/utils/storage';



@Component({
  selector: 'app-schedulerscreenconfiguration',
  templateUrl: './schedulerscreenconfiguration.component.html',
  styleUrls: ['./schedulerscreenconfiguration.component.scss']
})
export class SchedulerscreenconfigurationComponent implements OnInit {

  permissionsList = this.configService.getPermissions('mainFunctionalities', 'Configurations', 'Scheduler', Storage.getSessionUser());

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  schedulerDetailsForm: FormGroup
  formObj = this.configService.getGlobalpayload();
  organizationValuesIDs: CompleterData
  wareHouseValuesIds: CompleterData
  anyvariabletaken: any;
  id: any;
  dropdownSettings = {};
  organizationValuesIDResponseList: any;
  arr: any = []
  wareHouseArr: any = []
  finalArr: any = [];
  getDropdownData: any = [];

  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private toastr: ToastrService, private wmsService: WMSService, private commonMasterDataService: CommonMasterDataService,
    public ngxSmartModalService: NgxSmartModalService, private commonService: CommonService,
    private excelRestService: ExcelRestService) { }

  ngOnInit() {
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
    this.createschedulerDetailsForm();
    // this.fetchAllOrganizations();
    this.get();
    // this.fetchAllWarehouseDetails();
    this.fetchAllSchedulerDetails();
  }
  fetchAllOrganizations() {
    this.excelRestService.fetchAllOrganizations(this.formObj).subscribe(res => {
      if (res['status'] == 0 && res['data']['organizations'].length > 0) {
        this.organizationValuesIDs = res.data.organizations.map(orgName => orgName.organizationName)
        this.organizationValuesIDResponseList = res.data.organizations
      }
    })
  }
  get() {
    this.commonMasterDataService.findAllWareHouseConfigurations({ "userIDName": Storage.getSessionItem('userDetails').userIDName }).subscribe(data => {
      if (data['status'] == 0 && data['data']['wareHouseConfigurations'].length > 0) {
        this.getDropdownData = data['data']['wareHouseConfigurations'][0].wareHouseFunctionalities;
        const arr: any = [...new Set(data['data'].wareHouseConfigurations[0].wareHouseFunctionalities.map(x => x.organizationInfo.organizationIDName))];
        this.organizationValuesIDs = arr;
      }
    })
  }
  wareHouseDropDownList: [];
  wareHouseDropDownResponseList: any;
  getDemoObj: any;
  fetchAllWarehouseDetails() {
    this.getDemoObj = this.formObj
    const newObjCreation = Object.assign(this.getDemoObj, this.formObj);
    delete this.getDemoObj.wareHouseIDName
    console.log(this.getDemoObj);
    console.log(newObjCreation);
    this.wmsService.fetchAllWarehouses(this.getDemoObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.wareHouses) {
          this.wareHouseDropDownList = response.data.wareHouses.map(warehouse => warehouse.wareHouseName);
          this.wareHouseDropDownResponseList = response.data.wareHouses;
        } else {
        }
      },
      (error) => {
      });
  }
  getWareHouses() {
    const arr: any = [];
    this.wareHouseDropDownList = arr;
    this.schedulerDetailsForm.controls.dummywareHouse.setValue(null);
    const event = this.schedulerDetailsForm.controls.dummyOrg.value;
    if (event && event.length > 0) {
      this.getDropdownData.forEach(element => {
        event.forEach(org => {
          if (element.organizationInfo.organizationIDName == org) {
            arr.push(element.wareHouseInfo.wareHouseIDName);
          }
        });
      });
      this.wareHouseDropDownList = arr;
    }
  }
  createschedulerDetailsForm() {
    this.schedulerDetailsForm = this.fb.group({
      taskName: [null],
      scheduleTime: [null],
      'organizationInfo': {
        "_id": this.configService.getOrganization()._id,
        "organizationID": this.configService.getOrganization().organizationID,
        "organizationIDName": this.configService.getOrganization().organizationIDName,
        "organizationName": this.configService.getOrganization().organizationName,
      },
      'wareHouseInfo': {
        "wareHouseMasterID": this.configService.getWarehouse().wareHouseMasterID,
        "wareHouseID": this.configService.getWarehouse().wareHouseID,
        "wareHouseIDName": this.configService.getWarehouse().wareHouseIDName,
        "wareHouseName": this.configService.getWarehouse().wareHouseName,
      },
      dummyOrg: [null],
      dummywareHouse: [null],
      organizationWareHouseInfos: [null]
    });
  }
  getData() {
    const form = this.schedulerDetailsForm.value;
    // if (form.dummyOrg && form.dummywareHouse) {
    //   this.finalArr = []
    //   let data: any = this.organizationValuesIDResponseList.find(k => k.organizationName === form.dummyOrg)
    //   let organizationobj = {}
    //   if (data) {
    //     organizationobj = {
    //       _id: data._id,
    //       organizationID: data.organizationID,
    //       organizationIDName: data.organizationIDName,
    //       organizationName: data.organizationName,
    //     }
    //   }
    //   form.dummywareHouse.forEach((v, i) => {
    //     let newData: any = this.wareHouseDropDownResponseList.find(s => s.wareHouseName === v)
    //     console.log(newData);
    //     let wareHouseobj = {}
    //     if (newData) {
    //       wareHouseobj = {
    //         wareHouseMasterID: newData._id,
    //         wareHouseID: newData.wareHouseID,
    //         wareHouseIDName: newData.wareHouseIDName,
    //         wareHouseName: newData.wareHouseName
    //       }
    //     }
    //     if (i === 0) {
    //       let objects = {}
    //       objects['organizationInfo'] = organizationobj
    //       objects['wareHouseInfo'] = wareHouseobj
    //       this.finalArr.push(objects)
    //     } else {
    //       let objects = {}
    //       objects['organizationInfo'] = organizationobj
    //       objects['wareHouseInfo'] = wareHouseobj
    //       this.finalArr.push(objects)
    //     }
    //   })
    // }
    // console.log(this.finalArr)
    // this.schedulerDetailsForm.controls.organizationWareHouseInfos.patchValue(this.finalArr)
    if (form.dummyOrg && form.dummyOrg.length > 0 && form.dummywareHouse && form.dummywareHouse.length > 0) {
      form['organizationWareHouseInfos'] = [];
      form.dummywareHouse.forEach(element => {
        const org = this.getDropdownData.find(x => x.wareHouseInfo.wareHouseIDName == element)
        form['organizationWareHouseInfos'].push({
          "wareHouseInfo": org.wareHouseInfo,
          "organizationInfo": org.organizationInfo,
        })
      });
    }
  }
  save() {
    // this.getData();
    const schedulerReq = this.schedulerDetailsForm.value;
    delete schedulerReq.dummyOrg
    delete schedulerReq.dummywareHouse
    if (this.schedulerDetailsForm.value.scheduleTime) {
      const loginTimeFormValue = this.schedulerDetailsForm.value.scheduleTime;
      var loginTimeInput = new Date();
      loginTimeInput.setHours(loginTimeFormValue.split(':')[0]);
      loginTimeInput.setMinutes(loginTimeFormValue.split(':')[1]);
      loginTimeInput.setSeconds(0);
      this.schedulerDetailsForm.patchValue({
        scheduleTime: loginTimeInput,
      });
      schedulerReq['scheduleTime'] = loginTimeInput;
      console.log(schedulerReq);
    }
    if (this.id) { schedulerReq._id = this.id; }
    console.log(JSON.stringify(schedulerReq))
    this.wmsService.savOrUpdateScreenDetailsScreensDetails(schedulerReq).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.thirdPartySpaceUtilizationScheduleConfiguration) {
          this.toastr.success(response.statusMsg);
          this.clear();
          this.fetchAllSchedulerDetails();
        } else if (response && response.status === 2) {
          this.toastr.error(response.statusMsg);
          if (this.schedulerDetailsForm.value.scheduleTime) {
            const loginTimeFormValue = this.schedulerDetailsForm.value.scheduleTime;
            let timeZone = loginTimeFormValue.toLocaleDateString();
            console.log(timeZone);
            var loginTimeInput = new Date();
            loginTimeInput.setHours(loginTimeFormValue.split(':')[0]);
            loginTimeInput.setMinutes(loginTimeFormValue.split(':')[1]);
            loginTimeInput.setSeconds(0);
            this.schedulerDetailsForm.patchValue({
              scheduleTime: loginTimeInput,
            });
            schedulerReq['scheduleTime'] = loginTimeInput;
            console.log(schedulerReq);
          }
          else {

          }
        } else {
          this.toastr.error('Failed in saving details');
        }
      },
      (error) => {
      });
    this.fetchAllSchedulerDetails();
  }
  thirdPartySpaceUtilizationScheduleConfigurationsResponseList: any;
  clear() {
    this.schedulerDetailsForm.reset();
    this.schedulerDetailsForm.get("scheduleTime").setValue(null);
  }
  fetchAllSchedulerDetails() {
    console.log(this.formObj);
    this.formObj["wareHouseIDName"] = this.configService.getWarehouse().wareHouseIDName
    this.wmsService.fetchALLScreenDetailsScreensDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.thirdPartySpaceUtilizationScheduleConfigurations) {
          this.thirdPartySpaceUtilizationScheduleConfigurationsResponseList = response.data.thirdPartySpaceUtilizationScheduleConfigurations;
          console.log(this.thirdPartySpaceUtilizationScheduleConfigurationsResponseList);
          //  this.dtTrigger.next();
          this.rerender();
        } else {
        }
      },
      (error) => {
      });
  }
  deleteInfo: any;
  delete(data: any) {
    this.deleteInfo = { name: 'schedulesScreenConfiguration', id: data._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllSchedulerDetails();
    }
  }
  dummyArray: any = []
  edit(data) {
    console.log(data);
    this.dummyArray = [];
    this.id = data._id;
    if (DecimalUtils.valueOf(data.scheduleTime)) {
      data.scheduleTime = this.commonService.getTimeFromMilliSec(data.scheduleTime);
    }
    this.schedulerDetailsForm.patchValue(data);
    this.schedulerDetailsForm.controls.dummyOrg.setValue([...new Set(data.organizationWareHouseInfos.map(x => x.organizationInfo.organizationIDName))]);
    this.getWareHouses();
    setTimeout(() => {
      this.schedulerDetailsForm.controls.dummywareHouse.setValue(data.organizationWareHouseInfos.map(x => x.wareHouseInfo.wareHouseIDName));
    }, 500)
    // data.organizationWareHouseInfos.forEach(setEditValue =>
    // if (data != null) {
    //   this.schedulerDetailsForm.controls.dummyOrg.setValue(data.organizationWareHouseInfos[0].organizationInfo.organizationName ? data.organizationWareHouseInfos[0].organizationInfo.organizationName : null)
    // }
    // data.organizationWareHouseInfos.forEach(ele => {
    //   this.dummyArray.push(ele.wareHouseInfo.wareHouseName);
    //   console.log(this.schedulerDetailsForm.controls.dummywareHouse);
    // })
    // this.schedulerDetailsForm.controls.dummywareHouse.patchValue(this.dummyArray ? this.dummyArray : null);

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
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
}
