import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Storage } from '../utils/storage';
import { AppService } from '../../shared/services/app.service';

@Injectable()
export class UserGuard implements  CanActivate {
  accessToken: any;
  constructor(private appService: AppService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (Storage.getAccessToken()) {
      this.accessToken = Storage.getAccessToken();
      return true;
    } else {
      this.appService.navigate('/');
      return false;
    }
  }
}
