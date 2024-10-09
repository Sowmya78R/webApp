import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-history-pdf',
  templateUrl: './history-pdf.component.html',
  styleUrls: ['./history-pdf.component.scss']
})
export class HistoryPDFComponent implements OnInit {
  selectedValue: any;
  logoList = { "_id": null, "logoName": null };
  logoImage: any;
  formObj = this.configService.getGlobalpayload();
  constructor(private router: Router, private metaDataService: MetaDataService,
    private configService: ConfigurationService,
    public wmsService: WMSService,) {
    this.selectedValue = router.url;
  }
  ngOnInit() {
    this.fetchLogo();
  }
  fetchLogo() {
    this.metaDataService.getAllLogos(this.formObj).subscribe(res => {
      if (res.status == 0 && res.data.logos && res.data.logos.length > 0) {
        this.logoList = res.data.logos[0];
        const fileNames = JSON.parse(JSON.stringify(this.logoList.logoName));
        this.metaDataService.viewImages(fileNames).subscribe(data => {
          this.logoImage = 'data:text/plain;base64,' + data['data']['resource'];

          this.logoImage = this.metaDataService.dataURLtoFile(this.logoImage, fileNames);
          this.metaDataService.imgGlobalChanged(this.logoImage, 'logoImage', true);
        });
      }
      else {
        this.logoList = { "_id": null, "logoName": null };
      }
    })
  }
}
