import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ConfigurationService } from '../../../services/integration-services/configuration.service';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { Storage } from '../../../shared/utils/storage';

@Component({
  selector: 'app-login-monitor',
  templateUrl: './login-monitor.component.html'
})
export class LoginMonitorComponent implements OnInit, AfterViewInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  activites: any[] = [];
  activityKeys: any = ['S.No', 'Email', 'Role', 'Login Time', 'Logout Time'];
  configPermissionsList: any = [];
  constructor(private configurationService: ConfigurationService) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.configPermissionsList = this.configurationService.getConfigurationPermissions('mainFunctionalities', 'Login Monitor',this.getClientRole());
    if (this.getClientRole() && this.configPermissionsList.length == 0) {
      this.configPermissionsList = ['View', 'Update', 'Delete'];
    }
    if (this.configPermissionsList.includes('View')) {
      this.getAllLoginActivites();
    }
  }
  getClientRole() {
    let role;
    const user = Storage.getSessionUser();
    if (user && user.authorities && user.authorities[0] && user.authorities[0].authority) {
      role = user.authorities[0].authority;
      return ['ROLE_CLIENT','ROLE_SUPER_ADMIN'].includes(role);
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  getAllLoginActivites() {
    this.configurationService.getLoginActivities().subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.oauthAccessTokenActivitiy) {
          this.activites = response.data.oauthAccessTokenActivitiy;
          this.rerender();
        }
      },
      (error) => {

      });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
