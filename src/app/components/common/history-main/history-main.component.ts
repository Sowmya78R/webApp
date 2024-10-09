import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-history-main',
  templateUrl: './history-main.component.html',
  styleUrls: ['./history-main.component.scss']
})
export class HistoryMainComponent implements OnInit {
  selectedValue: any;
  isReportView: boolean = false;

  constructor(private router: Router,private route: ActivatedRoute) {
    this.selectedValue = router.url;
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.isReportView = data['isReportView'];
      console.log(this.isReportView ? 'Report View' : 'History View');
    });
  }

}
