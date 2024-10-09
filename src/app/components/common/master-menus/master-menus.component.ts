import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-master-menus',
  templateUrl: './master-menus.component.html'
})
export class MasterMenusComponent implements OnInit {
  @Input() navLinks: any = [];
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(
    private translate: TranslateService,
    private configService:ConfigurationService,
    private router:Router
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
