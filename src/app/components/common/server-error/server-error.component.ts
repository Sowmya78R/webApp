import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html'
})
export class ServerErrorComponent implements OnInit {
  loginPageText: any;
  yesChangeTemplate: boolean = false;
  
  constructor(private metaDataService: MetaDataService,private configService:ConfigurationService) { }

  ngOnInit() {
    if (window.location.href.includes('sps.fruisce.in/wms')) {
      this.yesChangeTemplate = true;
    }
    this.fetchAllLoginPageText();
  }
  defaultText: any = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
  standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled`;

 /*  defaultText: any = `Smart Plate Solutions.......`; */
  fetchAllLoginPageText() {
    this.metaDataService.fetchAllLoginPageText({}).subscribe(
      response => {
        if (response && response.status === 0 && response.data.LoginText && response.data.LoginText.length) {
          this.loginPageText = response.data.LoginText[0].loginText;
        }
      },
      error => {
      });
  }

}
