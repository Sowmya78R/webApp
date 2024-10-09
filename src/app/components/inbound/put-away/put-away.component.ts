import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WMSService } from '../../../services/integration-services/wms.service';
import { ExcelService } from '../../../shared/services/excel.service';
import { ApexService } from '../../../shared/services/apex.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-put-away',
  templateUrl: './put-away.component.html'
})
export class PutAwayComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  // public pieChartLabels:string[] = ['Chrome', 'Safari', 'Firefox','Internet Explorer','Other'];
  // public pieChartData:number[] = [40, 20, 20 , 10,10];
  // public pieChartType:string = 'pie';
  // // events
  // public chartClicked(e:any):void {
  //   console.log(e);
  // }
  // public chartHovered(e:any):void {
  //   console.log(e);
  // }
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(public ngxSmartModalService: NgxSmartModalService,
    private configService: ConfigurationService,
    private apexService: ApexService, private translate: TranslateService,) {
    this.translate.use(this.language);
    this.apexService.getPanelIconsToggle();
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }
}
