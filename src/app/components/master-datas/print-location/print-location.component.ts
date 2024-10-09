import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-print-location',
  templateUrl: './print-location.component.html',
  styleUrls: ['./print-location.component.scss']
})
export class PrintLocationComponent implements OnInit {

  constructor(public configService: ConfigurationService) { }

  ngOnInit() {
  }

}
