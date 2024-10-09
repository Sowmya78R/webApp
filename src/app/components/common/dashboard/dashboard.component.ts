import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  defaultLinks = [
    { name: 'Overall Dashboard', link: 'overAllDashboard' },
    { name: 'Space Utilization', link: 'spaceUtilization' },
    { name: 'Inbound', link: 'inbound' },
    { name: 'Outbound', link: 'outbound' },
    { name: 'Sales Analytics', link: 'salesAnalytics' },
    { name: 'Purchase Analytics', link: 'purchaseAnalytics' },
    { name: 'ABC Analysis', link: 'AbcAnalysis' },
    { name: 'Inventory', link: 'Inventory' },
    { name: 'Order Rate',link: '/dashboard/orderRateTypeDashboard'},
    { name: 'Employee',link: '/dashboard/employeeInboundOutBoundDashboard'},
    { name: 'Daily Operations',link: '/dashboard/dailyOperationBasedDashboard'},


  ]
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor( private configService: ConfigurationService,
    private translate: TranslateService,) { 
      this.translate.use(this.language);
    }

  ngOnInit() {
    const modulesList = this.configService.getModulesList('kpiConfigurationFunctionalities');
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    if (modulesList && modulesList.length > 0) {
      const modules = modulesList.map(x => x.name);
      const dummyLinks = this.defaultLinks;
      this.defaultLinks = [];
      dummyLinks.forEach(element => {
        if (modules.includes(element.name)) {
          this.defaultLinks.push(element);
        }
      });
    }

    else {
      // this.defaultLinks.push(myObj);
    }

  }
}
