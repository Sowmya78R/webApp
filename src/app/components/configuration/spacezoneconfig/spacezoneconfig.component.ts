import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-spacezoneconfig',
  templateUrl: './spacezoneconfig.component.html',
  styleUrls: ['./spacezoneconfig.component.scss']
})
export class SpacezoneconfigComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  sZoneConfig: FormGroup;
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
  formObj = this.configService.getGlobalpayload();
  getAllDataList: any = [];
  zoneNames: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private toastr: ToastrService, private wmsService: WMSService,
    public ngxSmartModalService: NgxSmartModalService, private commonService: CommonService,  private translate: TranslateService,) {
      this.translate.use(this.language);
    }

  ngOnInit() {
    this.createForm();
    this.fetchAllSupplierDetails();
    this.fetchAllZones();
    this.get();
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
  createForm() {
    this.sZoneConfig = this.fb.group({
      _id: null,
      "supplierIDName": null,
      "zoneNames": null,
      "createdBy": null,
      "createdDate": null,
    })
  }
  suppierValueDetailsIds: CompleterData
  fetchAllSupplierDetails() {
    this.wmsService.fetchAllSupplierDetails(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.supplierMasters) {
          this.suppierValueDetailsIds = response.data.supplierMasters.map(x => x.supplierIDName);

          // this.rerender();
        }
      },
      (error) => {
        //  this.suppliersList = [];
      });
  }
  zoneValueDetailsIds: CompleterData;
  fetchAllZones() {
    this.wmsService.fetchAllZones(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0) {
          // this.rerender();
          if (response.data.zones.length > 0) {
            this.zoneValueDetailsIds = response.data.zones.map(y => y.zoneName);
          } else {
            // this.zoneValueDetailsIds = [];
          }
        } else {
          // this.zones = [];
        }
      },
      (error) => {
        //  this.zones = [];
      });
  }



  deleteInfo: any;
  delete(data: any) {
    this.deleteInfo = { name: 'schedulesScreenConfiguration', id: data._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllSupplierDetails();
    }
  }
  clear() {
    this.createForm();
    this.zoneNames = [];
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
  save() {
    const form = this.sZoneConfig.value;
    form["organizationInfo"] = this.configService.getOrganization();
    form["wareHouseInfo"] = this.configService.getWarehouse();
    form['zoneNames'] = this.zoneNames;
    this.configService.saveOrUpdateSUConfig(form).subscribe(data => {
      if (data['status'] == 0 && data['data'].spaceUtilizationConfiguration) {
        this.toastr.success(data.statusMsg);
        this.clear();
        this.get();
      }

    })
  }
  get() {
    this.configService.getAllSUConfig(this.formObj).subscribe(data => {
      console.log(data)
      if (data['status'] == 0 && data.data.spaceUtilizationConfigurations) {
        this.getAllDataList = data.data.spaceUtilizationConfigurations;
      }
    })
  }
  edit(data) {
    this.sZoneConfig.patchValue(data);
    console.log(data);
    this.zoneNames = data.zoneNames;
  }
}
