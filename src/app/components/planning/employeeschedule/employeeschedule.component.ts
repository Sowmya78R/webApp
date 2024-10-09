import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { WmsCommonService } from 'src/app/services/wms-common.service';

@Component({
  selector: 'app-employeeschedule',
  templateUrl: './employeeschedule.component.html',
  styleUrls: ['./employeeschedule.component.scss']
})
export class EmployeescheduleComponent implements OnInit {
  arr = [{ name: 'Putaway Planning', link: 'putawayPlanning' }, { name: 'Picking Planning', link: 'pickingPlanning' },
  { name: 'Internal Transfer', link: 'internalTransferPlanning' }, { name: 'Packing', link: 'packingPlanning' },
  { name: 'Re-Packing', link: 'rePackingPlanning' }, { name: 'Co-Packing', link: 'coPackingPlanning' },
  { name: 'Labelling', link: 'labellingPlanning' },
  { name: 'Loading', link: 'loadingPlanning' },
  { name: 'UnLoading', link: 'unloadingPlanning' }];
  formObj = this.configService.getGlobalpayload();
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private router: Router, private configService: ConfigurationService,
    private translate: TranslateService,) { 
      this.translate.use(this.language);
    }

  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    const user = JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo;
    const navLinks = (user.userPermissionWareHouseFunctionality.find(x => x.organizationInfo.organizationIDName == this.formObj.organizationIDName && x.wareHouseInfo.wareHouseIDName == this.formObj.wareHouseIDName)).mainFunctionalities;

    if (navLinks.length > 0) {
      const findObj = navLinks.find(x => x.name == 'Workforce');
      console.log(findObj);
      if (findObj && findObj.subFunctionalities && findObj.subFunctionalities.length > 0) {
        this.arr = [];
        if (findObj.subFunctionalities.find(x => x.name == 'Workforce Putaway')) {
          this.arr.push({ name: 'Putaway Planning', link: 'putawayPlanning' });
        }
        if (findObj.subFunctionalities.find(x => x.name == 'Workforce Picking')) {
          this.arr.push({ name: 'Picking Planning', link: 'pickingPlanning' });
        }
        if (findObj.subFunctionalities.find(x => x.name == 'Workforce Internal Transfer')) {
          this.arr.push({ name: 'Internal Transfer', link: 'internalTransferPlanning' });
        }
        if (findObj.subFunctionalities.find(x => x.name == 'Workforce Packing')) {
          this.arr.push({ name: 'Packing', link: 'packingPlanning' });
        }
        if (findObj.subFunctionalities.find(x => x.name == 'Workforce Re Packing')) {
          this.arr.push({ name: 'Re-Packing', link: 'rePackingPlanning' });
        }
        if (findObj.subFunctionalities.find(x => x.name == 'Workforce Co Packing')) {
          this.arr.push({ name: 'Co-Packing', link: 'coPackingPlanning' });
        }
        if (findObj.subFunctionalities.find(x => x.name == 'Workforce Labelling')) {
          this.arr.push({ name: 'Labelling', link: 'labellingPlanning' });
        }
        if (findObj.subFunctionalities.find(x => x.name == 'Workforce Loading')) {
          this.arr.push({ name: 'Loading', link: 'loadingPlanning' });
        }
        if (findObj.subFunctionalities.find(x => x.name == 'Workforce Unloading')) {
          this.arr.push({ name: 'UnLoading', link: 'unloadingPlanning' });
        }


        if (this.router.url.split('/')[4]) {
          this.router.navigate(['/v1/workforce/employeeSchedule/' + this.router.url.split('/')[4]]);
        }
        else {
          this.router.navigate(['/v1/workforce/employeeSchedule/' + this.arr[0].link]);
        }
      }
    }
  }
}
