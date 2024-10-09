import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppService } from '../../shared/services/app.service';
import { NavConstants } from '../../constants/nav.constants';
import { ApexService } from '../services/apex.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(
    private appService: AppService,
    private toastr: ToastrService,
    private apexService: ApexService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq: any = req.clone();
    return next.handle(authReq).pipe(tap(
      (response: any) => {
        // if (response && response.body.status === 2) {
        //   this.toastr.error('Record already exist');
        // }
      },
      (error: any) => {
        if (error.status === 400 && error.error.error === 'invalid_grant') {
        } else {
          this.showLoader(false);
          this.appService.navigate(NavConstants.SERVER_ERROR);
        }
      }));
  }
  showLoader(show: boolean) {
    this.apexService.showLoader(show);
  }
  // private appendAccessToken() {
  //   const accessToken = Storage.getAccessToken();
  //   let headers: HttpHeaders = new HttpHeaders();
  //   headers = headers.set('access_token', accessToken);
  //   return {headers};
  // }
}
