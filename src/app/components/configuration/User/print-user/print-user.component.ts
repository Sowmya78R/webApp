import { Component, Input, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-print-user',
  templateUrl: './print-user.component.html',
  styleUrls: ['./print-user.component.scss']
})
export class PrintUserComponent implements OnInit {
  constructor(public configService: ConfigurationService) { }

  ngOnInit() {
  }

}
