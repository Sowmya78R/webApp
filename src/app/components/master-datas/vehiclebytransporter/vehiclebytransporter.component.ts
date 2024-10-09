/* Neweest One */

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CompleterData, CompleterService } from 'ng2-completer';
import { EmitterService } from 'src/app/services/emitter.service';
import { ToastrService } from 'ngx-toastr';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AppService } from 'src/app/shared/services/app.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { Constants } from 'src/app/constants/constants';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { Storage } from '../../../shared/utils/storage';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vehiclebytransporter',
  templateUrl: './vehiclebytransporter.component.html',
  styleUrls: ['./vehiclebytransporter.component.scss']
})
export class VehiclebytransporterComponent implements OnInit, OnDestroy {
  actionButton = 'Save'
  vehicleByServiceProviderForm: FormGroup
  missingParams: any;
  isShowOrHideError: any = false;
  failureRecords: any = [];
  vehicleLines: FormArray;
  vehicleByServiceProviderInfo: any = {};
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  providerIDs: CompleterData;
  selectedDocuments: any[] = [];
  isReadMode: any = false;
  sparePartDetails: any[] = [];
  filteredData: any;
  serviceproviderDescription: any = [];
  newProvidersData: any = [];
  serviceProvider: any;
  id: any;
  vehicleMasters: any;
  vehicleDetail: FormArray;
  uncheck: any;
  deleteInfo: any;
  vehicleByServiceProvider: any;
  equipmentMasters: any;
  vehicleByService: any;
  sparePartsData: any;
  serviceProviders: any = [];
  excelData: any = [];
  formObj = this.configService.getGlobalpayload();
  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Vehicle By Transporter', Storage.getSessionUser());
  forPermissionsSubscription: any;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  role: any;
  constructor(private fb: FormBuilder, private wmsService: WMSService,
    private emitterService: EmitterService,
    private completerService: CompleterService,
    private toastr: ToastrService,
    public ngxSmartModalService: NgxSmartModalService, private excelService: ExcelService,
    private excelRestService: ExcelRestService, private configService: ConfigurationService,
    private translate: TranslateService,) {
      this.translate.use(this.language);
     }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        lengthMenu: 'Show _MENU_ Entries',
      }
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.getFunctionCalls()
  }
  getFunctionCalls() {
    if (this.permissionsList.includes('View')) {
      this.fetchData();
      this.createServicepproviderForm();
      this.fetchAllServiceProviderDetails();
      this.FetchAllVehicleMaster();
      this.fetchAllServiceProvider();
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  displayNewProviderList: any = [];

  fetchAllServiceProviderDetails() {
    this.wmsService.fetchAllVehicleServiceProvider(this.formObj).subscribe(data => {
      if (data.status === 0 && data.data.vehicleByServiceProviders) {
        const array = data.data.vehicleByServiceProviders
        let newArray = []
        array.forEach((outerElement, i) => {
          if (outerElement.vehicleLines) {
            outerElement.vehicleLines.forEach((innerElement, index) => {
              let info = {}
              if (index == 0) {
                info['isShow'] = true;
                 info['index'] = i + 1;
                 info['_id'] = outerElement._id;
                 info['serviceProviderID'] = outerElement.serviceProviderID;
                 info['serviceProviderIDName'] = outerElement.serviceProviderIDName;
                 info['serviceProviderName'] = outerElement.serviceProviderName
              }else{
              info['isShow'] = false;
              info['index'] = '';
              info['_id'] =''
              info['serviceProviderID'] = ''
              info['serviceProviderIDName'] = '';
              info['serviceProviderName'] =''
              }
              info['vehicleNumber'] = innerElement.vehicleInfo.vehicleNumber;
              info['vehicleType'] = innerElement.vehicleType;
              info['equipmentID'] = innerElement.equipmentInfo.equipmentID;
              info['equipmentType'] = innerElement.equipmentType;
              newArray.push(info)
            });
           
          }
          else {
            let info = {}
            info['isShow'] = true;
            const length = newArray.length;
            info['index'] = (length == 0) ? 0 : (newArray[length - 1].index) + 1
            info['_id'] = outerElement._id;
            info['_id'] = outerElement._id;
              info['serviceProviderID'] = outerElement.serviceProviderID;
              info['serviceProviderIDName'] = outerElement.serviceProviderIDName;
              info['serviceProviderName'] = outerElement.serviceProviderName
              info['vehicleNumber'] = null
              info['vehicleType'] = null
              info['equipmentID'] = null
              info['equipmentType'] = null
            newArray.push(info)
          }
        });
        console.log(newArray, 'data')
        this.newProvidersData = newArray;
        this.rerender();
      }
      else {
        this.newProvidersData = []
      }
    })
  }

  /* FetchAllServiceProviderDetails() {
    this.wmsService.fetchAllVehicleServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.vehicleByServiceProviders) {
        this.newProvidersData = response.data.vehicleByServiceProviders;

        console.log(this.newProvidersData);
        this.excelData = this.newProvidersData;
        console.log(this.newProvidersData);
        this.displayNewProviderList = this.excelService.formatJSONForHeaderLines
          (this.newProvidersData, 'vehicleLines');
        this.rerender();
      } else {
      }
    }, error => {
    });
  } */
  createServicepproviderForm() {
    this.vehicleByServiceProviderForm = this.fb.group({
      _id: '',
      serviceProviderIDName: [''],
      serviceProviderID: ['', Validators.required],
      serviceProviderName: [''],
      vehicleLines: this.fb.array([])
    })
  }
  lineArray(document) {
    console.log(document);
    return this.fb.group({
      vehicleInfo: {
        _id: document._id,
        vehicleNumber: document.vehicleNumber
      },
      _id: null,
      vehicleType: document.vehicleType,
      equipmentType: document.equipmentType,
      equipmentInfo:
      {
        equipmentMasterID: document.equipmentInfo.equipmentMasterID ? document.equipmentInfo.equipmentMasterID : null,
        equipmentID: document.equipmentInfo.equipmentID ? document.equipmentInfo.equipmentID : null,
        equipmentName: document.equipmentInfo.equipmentName ? document.equipmentInfo.equipmentName : null,
        equipmentIDName: document.equipmentInfo.equipmentIDName ? document.equipmentInfo.equipmentIDName : null,
        equipmentType: document.equipmentInfo.equipmentType ? document.equipmentInfo.equipmentType : null,
      }
    })
  }
  fetchAllServiceProvider() {
    this.wmsService.fetchAllServiceProvider(this.formObj).subscribe(response => {
      if (response && response.status === 0 && response.data.serviceProviders) {
        this.serviceProviders = response.data.serviceProviders;
      } else {
        this.serviceProviders = [];
      }
    }, error => {
      this.serviceProviders = [];
    });
  }
  FetchAllVehicleMaster() {
    this.wmsService.fetchAllVehicleMaster().subscribe(response => {
      if (response && response.status === 0 && response.data.vehicleMasters) {
        this.vehicleMasters = response.data.vehicleMasters;
        console.log(this.vehicleMasters);
        this.vehicleMasters.map(x => {
          x['isEdit'] = false;
          x['isChecked'] = false;
          x['requiredQuantity'] = null;
        })
        const formArray = this.vehicleByServiceProviderForm.get('vehicleLines') as FormArray
        formArray.value.forEach(element => {
          this.vehicleMasters.forEach(sData => {
            sData['isChecked'] = true;
          });
        });
      }
    },
      (error) => {
      });
  }
  resetFields() {
    this.vehicleByServiceProviderForm.reset();
    const form = this.vehicleByServiceProviderForm.get('vehicleLines') as FormArray;
    while (form.length !== 0) {
      form.removeAt(0);
    }
    this.selectedDocuments = [];
    this.vehicleMasters = [];
    this.FetchAllVehicleMaster();
    this.vehicleByServiceProviderForm.enable();
  }

  delete(data: any) {
    if (this.permissionsList.includes('Delete')) {
      console.log(data);
      this.deleteInfo = { name: 'vehicleByTranporter', id: data.headerId };
      this.ngxSmartModalService.getModal('deletePopup').open();
    }
    else {
      this.toastr.error("User doesn't have Permissions.")
    }
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllServiceProviderDetails();
    }
  }
  deleteLines(data: any) {
    console.log(data);
    this.deleteInfo = { name: 'vehicleByTranporter', id: data._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  arrraySpareParts(element) {
    console.log(element)
    this.vehicleLines = this.vehicleByServiceProviderForm.get('vehicleLines') as FormArray;
    this.vehicleLines.push(this.lineArray(element));

  }
  save() {
    if (this.selectedDocuments) {
      this.selectedDocuments.forEach(element => {
        this.arrraySpareParts(element);
      });
    } 
    const data = this.vehicleByServiceProviderForm.value;
     
  
      data['organizationInfo'] = this.configService.getOrganization();
      data['wareHouseInfo'] = this.configService.getWarehouse();   
      this.wmsService.saveOrUpdateVehiicleByupdateServiceProvider(JSON.stringify(data)).subscribe(
        (response) => {
          if (response.status === 0) {
            this.id = '';
            this.fetchAllServiceProviderDetails();
            this.toastr.success('Service Provider Inserted successfully');
            this.resetFields();
          } else {
            this.toastr.error('Failed in inserting Service Provider');
          }
        },
        (error) => {
          this.toastr.success('Failed in inserting Service Provider');
        });
    
   
    this.globalIDs = null
  }
  onDocumentSelect(event, data) {
    if (event.target.checked) {
      this.selectedDocuments.push(data)
      console.log(this.selectedDocuments);

    }
    else {
      this.selectedDocuments = this.selectedDocuments.filter(x => x.serviceProviderId != data.serviceProviderId)
    }
  }
  updateService(service) {
    this.actionButton = "Update"
    console.log(service)
    const data = JSON.parse(JSON.stringify(service))
    this.selectedDocuments = [];
    const formArray = this.vehicleByServiceProviderForm.get('vehicleLines') as FormArray
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
    data.vehicleLines.forEach(element => {
      this.arrraySpareParts(element);
    })
    this.selectedDocuments = data.vehicleLines;
    this.fetchItemByServiceById(data._id);
  }
  fetchItemByServiceById(_id) {
    this.wmsService.fetchServiceProviderServiceById(_id).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.vehicleByServiceProvider) {
          this.vehicleByService = response.data.vehicleByServiceProvider;
          this.vehicleByServiceProviderForm.patchValue(this.vehicleByService);
          this.isReadMode = true;
          this.getDetailstoUpdate(this.vehicleByService);

          this.dtTrigger.next();
        } else {
          this.vehicleByService = {};
          this.isReadMode = true;
          this.toastr.error('No records found, Please create');
        }
      });
  }
  getDetailstoUpdate(service) {
    const data = JSON.parse(JSON.stringify(service))
    this.selectedDocuments = [];
    const formArray = this.vehicleByServiceProviderForm.get('vehicleLines') as FormArray;
    formArray.removeAt(0);
    this.dtTrigger.next();
    data.vehicleLines.forEach(element => {
      this.arrraySpareParts(element);
    })
    this.selectedDocuments = data.vehicleLines;
    this.getAllSparePartsData();
  }
  getAllSparePartsData() {
    this.wmsService.fetchAllVehicleServiceProvider(this.formObj).subscribe(
      (response) => {
        this.sparePartsData = response['data']['vehicleByServiceProviders'];
        this.sparePartsData.map(x => {
          x['isChecked'] = false;
        })
        if (this.actionButton == 'UPDATE') {
          const formArray = this.vehicleByServiceProviderForm.get('vehicleLines') as FormArray
          formArray.value.forEach(element => {
            console.log(element);
            this.sparePartsData.forEach(sData => {
              console.log(sData);
              if (element._id === sData._id) {
                sData['isChecked'] = true;
                this.dtTrigger.next();
              }
            });
          });
        }
      },
      (error) => {
      });
  }
  globalIDs : any;
  edit(data) {
    this.globalIDs = data._id
    if (this.permissionsList.includes('Update') && this.permissionsList.includes('View')) {
      this.vehicleByServiceProviderForm.patchValue(data);
    }
    else if (this.permissionsList.includes('View')) {
      this.vehicleByServiceProviderForm.disable();
      this.vehicleByServiceProviderForm.patchValue(data);
    }
  }
  fetchData() {
    this.emitterService.fetchAllServiceProvider();
    this.emitterService.serviceproviderIDsDescription.subscribe(res => {
      this.serviceproviderDescription = res;
      this.providerIDs = this.completerService.local(res, 'serviceProviderIDName', 'serviceProviderIDName');
    });
  }
  onChangeServiceProviderIDName() {
    if (this.vehicleByServiceProviderForm.value.serviceProviderIDName) {
      const selectedObj = this.emitterService
        .findObjFromArrayOfObjects(this.serviceproviderDescription, 'serviceProviderIDName',
          this.vehicleByServiceProviderForm.value.serviceProviderIDName);
      this.vehicleByServiceProviderForm.patchValue(selectedObj);
    }
  }

  exportAsXLSX() {
    if (this.newProvidersData.length > 0) {
      console.log(this.newProvidersData)
      const changedTaskList = this.exportTypeMethod(this.newProvidersData)
      console.log(changedTaskList)
      this.excelService.exportAsExcelFile(changedTaskList, 'VehicleByTransporter', Constants.EXCEL_IGNORE_FIELDS.VEHICLEBYSERVICEPROVIDER);
    } else {
      this.toastr.error('No data found');
    }
  }

  exportTypeMethod(data) {
    const arr = [];
    data.forEach(ele => {
      if (ele.vehicleLines && ele.vehicleLines.length > 0 && ele.vehicleLines != null && ele.vehicleLines != undefined) {
        ele.vehicleLines.forEach((vehele, index) => {
          let equipType = "";
          if (vehele.equipmentInfo != null) {
            equipType = vehele.equipmentType
            const obj = {}
            if (index === 0) {
              obj['serviceProviderIDName'] = ele.serviceProviderIDName
              obj['serviceProviderID'] = ele.serviceProviderID
              obj['serviceProviderName'] = ele.serviceProviderName
              obj['vehicleNumber'] = vehele.vehicleNumber
              obj['vehicleType'] = vehele.vehicleType
              obj['equipmentID'] = vehele.equipmentInfo.equipmentID
              obj['equipmentType'] = vehele.equipmentType
              arr.push(obj)
            } else {
              obj['serviceProviderIDName'] = null
              obj['serviceProviderID'] = null
              obj['serviceProviderName'] = null
              obj['vehicleNumber'] = vehele.vehicleNumber
              obj['vehicleType'] = vehele.vehicleType
              obj['equipmentID'] = vehele.equipmentInfo.equipmentID
              obj['equipmentType'] = vehele.equipmentType
              arr.push(obj)
            }
          }
        })
      }
      else {
        console.log(ele)
        const obj = {}
        if(ele.serviceProviderIDName){
          let serviceprovi = ele.serviceProviderIDName.split(":")[0];
          console.log(serviceprovi);
          obj['serviceProviderID'] = serviceprovi.toString();
        }
        obj['vehicleNumber'] = null
        obj['vehicleType'] = null
        obj['equipmentID'] = null
        obj['equipmentType'] = null
        arr.push(obj)
      }
    })
    return arr
  }


  /*
  exportAsXLSX() {
    if (this.newProvidersData && this.newProvidersData.length > 0) {
      this.excelService.exportAsExcelFile(this.newProvidersData, 'vehicle By Transporter', Constants.EXCEL_IGNORE_FIELDS.VEHICLEBYSERVICEPROVIDER);
    } else {
      this.toastr.error('No data found');
    }
  } */
  getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        console.log(jsonData);
        const data1 = [];
        const logs = [];
        //  const missingParamsArray = [];
        this.missingParams = null;
        let invalidRecord = false


        const missingParamsArray = this.mandatoryCheckForHeaderLines(jsonData);
        console.log(missingParamsArray)
        if (missingParamsArray.length > 1) {
          this.failureRecords = missingParamsArray;
          this.missingParams = missingParamsArray.join(', ');
          this.toastr.error('Please download log file to fill mandatory fields');
        }
        jsonData.forEach((s, index) => {
          console.log(s)
          if (s['serviceProviderIDName']) {
            data1.push(this.getVehicleByTransporterHeadersData(s))
          }
          else if (!s['serviceProviderIDName']) {
            if (data1.length > 0) {
              data1[data1.length - 1]['vehicleLines'].push(this.vehicleByTransporterLinesData(s))
            } else if (invalidRecord) {
              logs[data1.length - 1]['vehicleLines'].push(this.vehicleByTransporterLinesData(s))
            }
          }
          else {
            if (!s['serviceProviderIDName']) {
              invalidRecord = true;
              logs.push(this.getVehicleByTransporterHeadersData(s));
              const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.VEHICLEBYRANSPORTER;
              const missingParams = requiredParams.filter((param: any) => !(!!s[param]));
              if (missingParams.length > 0) {
                missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', '\r\n')} \r\n`);
              }
            }
          }
          const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.VEHICLE);
          console.log(JSON.stringify(reqData));
          reqData.forEach(r => {
            console.log(r);
              let serviceProviderRecord = this.mapId('serviceProviderID', r.serviceProviderID);
              console.log(serviceProviderRecord)
              if (serviceProviderRecord) {
                r['serviceProviderID'] = serviceProviderRecord.serviceProviderID
                r['serviceProviderName'] = serviceProviderRecord.serviceProviderName
                r['serviceProviderIDName'] = serviceProviderRecord.serviceProviderIDName
              } else {
                r['serviceProviderID'] = r.serviceProdivderID ? r.serviceProdivderID : null
                r['serviceProviderName'] = null
                r['serviceProviderIDName'] = null
              }
        })
        })
        if (data1.length > 0) {
          data1.forEach(r => {
            r['organizationInfo'] = this.configService.getOrganization();
            r['wareHouseInfo'] = this.configService.getWarehouse();
          });
          this.excelRestService.vehicleByServiceProviderExcelUpload(data1).subscribe(res => {
            if (res && res.status === 0 && res.data.vehicleByServiceProviderList && res.data.vehicleByServiceProviderList.failureList && res.data.vehicleByServiceProviderList.failureList.length > 0 && res.data.sucessExcelList && res.data.sucessExcelList.length > 0) {
              this.failureRecords = res.data.vehicleByServiceProviderList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.vehicleByServiceProviderList.duplicateList);
              console.log(this.failureRecords);
              this.toastr.error('Partially failed in uploading, Please download log for reasons');
            } else if (res && res.status === 0 && res.data.vehicleByServiceProviderList && res.data.vehicleByServiceProviderList.failureList && res.data.vehicleByServiceProviderList.failureList.length > 0) {
              this.failureRecords = res.data.vehicleByServiceProviderList.failureList;
              this.failureRecords = this.failureRecords.concat(res.data.vehicleByServiceProviderList.duplicateList);
              console.log(this.failureRecords);
              this.toastr.error('Failed in uploading, Please download log for reasons');
            } else if (res && res.status === 0 && res.data.vehicleByServiceProviderList && res.data.vehicleByServiceProviderList.failureList && res.data.vehicleByServiceProviderList.failureList.length === 0) {
              if (res && res.status === 0 && res.data.vehicleByServiceProviderList && res.data.vehicleByServiceProviderList.duplicateList && res.data.vehicleByServiceProviderList.duplicateList.length > 0) {
                this.failureRecords = res.data.vehicleByServiceProviderList.duplicateList;
                console.log(this.failureRecords);
                this.toastr.error('Duplicates present in the excel, Please download log file.');
              } else {
                this.fetchAllServiceProviderDetails();
                this.toastr.success('Uploaded successfully');
                this.failureRecords = [];
              }
            } else {
              this.toastr.error('Faild in uploading');
              this.failureRecords = [];
            }
          }, error => { })
        }
      }, 500)
    }
  }

  getVehicleByTransporterHeadersData(s) {
    let serviceProvider = this.mapId('serviceProviderID',s.serviceProviderID.trim());
    if(serviceProvider){
    return {
      "serviceProviderID":  serviceProvider.serviceProviderID,
      "serviceProviderName": serviceProvider.serviceProviderName,
      "serviceProviderIDName":  serviceProvider.serviceProviderIDName,
      "vehicleLines": [this.vehicleByTransporterLinesData(s)]
    }
  }
}
  vehicleByTransporterLinesData(document?) {
    if (document) {
      return {
        "vehicleType": document.vehicleType,
        "equipmentType": document.equipmentType,
        'vehicleInfo': {
          "vehicleID": document.vehicleID,
          "vehicleNumber": document.vehicleNumber
        },
        "equipmentInfo": {
          "equipmentMasterID": this.mapId("equipmentMasterID", document.equipmentType),
          "equipmentID": this.mapId("equipmentID", document.equipmentType),
          "equipmentName": this.mapId("equipmentName", document.equipmentType),

        }
      }
    }
  }
  mapId(type, value) {
    switch (type) {
      case 'serviceProviderID': {
        const serviceproviderids = this.serviceProviders.find(e => e.serviceProviderID === value);
        return serviceproviderids && serviceproviderids ? serviceproviderids : null;
      }
     
    }
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
  mandatoryCheckForHeaderLines(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      let record = data[0];
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.VEHICLEBYRANSPORTER
      const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
      if (missingParams.length > 0) {
        missingParamsArray.push(`Row No. ${1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
      }
    }
    return missingParamsArray;
  }
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "Vehicle By Service Provider Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
   // this.forPermissionsSubscription.unsubscribe();
  }
  /*
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  } */
  /*
   rerender(): void {
     this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
       this.dtTrigger.next();
       dtInstance.destroy();
     });
   } */
  /*  ngOnDestroy(): void {
     this.dtTrigger.unsubscribe();
   }
  */

}
/* Upload Excel */
/*  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);
      setTimeout(() => {
        const jsonData = this.excelService.getJsonData();
        if (jsonData.length > 0) {
          event.target.value = '';
          const missingParamsArray = this.mandatoryCheck(jsonData);
          if (missingParamsArray.length > 1) {
            this.failureRecords = missingParamsArray;
            this.missingParams = missingParamsArray.join(', ');
            this.toastr.error('Please download log file to fill mandatory fields');
          } else {
            const reqData = this.excelService.generateInnerObjs(jsonData, Constants.GEN_INNER_OBJS.VEHICLEBYSERVICEPROVIDER);
            this.excelRestService.vehicleByServiceProviderExcelUpload(reqData).subscribe( res => {
              if (res && res.status === 0 && res.data.vehicleByServiceProviderList && res.data.vehicleByServiceProviderList.failureList &&
                res.data.vehicleByServiceProviderList.failureList.length > 0 && res.data.vehicleByServiceProviderList.successList &&
                res.data.vehicleByServiceProviderList.successList.length > 0) {
                this.failureRecords = res.data.vehicleByServiceProviderList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.vehicleByServiceProviderList.duplicateList);
                this.toastr.error('Partially failed in uploading, Please download log for reasons');
                this.FetchAllServiceProviderDetails();
              } else if (res && res.status === 0 && res.data.vehicleByServiceProviderList && res.data.vehicleByServiceProviderList.failureList && res.data.vehicleByServiceProviderList.failureList.length > 0) {
                this.failureRecords = res.data.vehicleByServiceProviderList.failureList;
                this.failureRecords = this.failureRecords.concat(res.data.vehicleByServiceProviderList.duplicateList);
                this.toastr.error('Failed in uploading, Please download log for reasons');
              } else if (res && res.status === 0 && res.data.vehicleByServiceProviderList && res.data.vehicleByServiceProviderList.failureList && res.data.vehicleByServiceProviderList.failureList.length === 0) {
                if (res && res.status === 0 && res.data.vehicleByServiceProviderList && res.data.vehicleByServiceProviderList.duplicateList && res.data.vehicleByServiceProviderList.duplicateList.length > 0) {
                  this.failureRecords = res.data.vehicleByServiceProviderList.duplicateList;
                  this.toastr.error('Duplicates present in the excel, Please download log file.');
                  this.FetchAllServiceProviderDetails();
                } else {
                 this.FetchAllServiceProviderDetails();
                  this.toastr.success('Uploaded successfully');
                  this.failureRecords = [];
                }
              } else {
                this.toastr.error('Failed in uploading');
                this.failureRecords = [];
              }
            },
            error => {});
          }
        }
      }, 500);
    }
  }
  mandatoryCheck(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        console.log(record)
        if (record['wareHouseName']) {
          const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.VEHICLEBYSERVICEPROVIDER;
          const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
          if (missingParams.length > 0) {
            missingParamsArray.push(`Row No. ${index + 1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
          }
        }
      });
    }
    return missingParamsArray;
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
  downloadLogFile() {
    if (this.failureRecords) {
      this.dyanmicDownloadByHtmlTag({
        fileName: "UOM Error Reasons",
        text: this.failureRecords.toString().replace(/,/g, '\n')
      });
    }
  } */
/* Bsc Table Design */
/*
  getDataSource() {
    this.newProvidersData.forEach((outerElement, index) => {
      if (outerElement.vehicleLines && outerElement.vehicleLines.length > 0) {
        outerElement.vehicleLines.forEach((innerElement, i) => {
          let info = {};
          info['vehicleNumber'] = innerElement.vehicleInfo.vehicleNumber;
          info['equipmentType'] = innerElement.equipmentType;
          info['vehicleType'] = innerElement.vehicleType;
          info['equipmentID'] = innerElement.equipmentInfo.equipmentID;
          info['equipmentIDName'] = innerElement.equipmentInfo.equipmentIDName;
          info['equipmentMasterID'] = innerElement.equipmentInfo.equipmentMasterID;
          info['equipmentName'] = innerElement.equipmentInfo.equipmentName;
          info['equipmentType'] = innerElement.equipmentInfo.equipmentType;
          this.newArray.push(info);
        })
      }
     /*  else {
        let info = {};
          info['vehicleNumber'] = innerElement.vehicleInfo.vehicleNumber;
          info['equipmentType'] = innerElement.equipmentType;
          info['vehicleType'] = innerElement.vehicleType;
          info['equipmentID'] = innerElement.equipmentInfo.equipmentID;
          info['equipmentIDName'] = innerElement.equipmentInfo.equipmentIDName;
          info['equipmentMasterID'] = innerElement.equipmentInfo.equipmentMasterID;
          info['equipmentName'] = innerElement.equipmentInfo.equipmentName;
          info['equipmentType'] = innerElement.equipmentInfo.equipmentType;

      }
    })
    return this.newArray;
  }
 */
