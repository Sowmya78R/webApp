import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-maintenanceplanning',
  templateUrl: './maintenanceplanning.component.html',
  styleUrls: ['./maintenanceplanning.component.scss']
})
export class MaintenanceplanningComponent implements OnInit {
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(
    private translate: TranslateService,
    private configService: ConfigurationService,
  ) { 
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
  }

}
