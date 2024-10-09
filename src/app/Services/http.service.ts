import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Util } from '../utils/util';
import { Storage } from '../utils/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpReq } from '../Entities/app.entity';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
  })
export class HttpService {

    headers: HttpHeaders;
    private CONTENT_APPLICATION_URLENCODED: any = 'application/x-www-form-urlencoded';
    private CONTENT_APPLICATION_JSON: any = 'application/json';
    API_ENDPOINT: string = environment.apiUrl;
    constructor(private http: HttpClient) {
        this.http = http;
    }
    showLoader(show: boolean) {
        // this.apexService.showLoader(show);
    }
    restCall(httpReq: HttpReq) {
        if (httpReq.showLoader && httpReq.showLoader === true) {
            this.showLoader(true);
        }
        return this.restService(httpReq);
    }

    restService(httpReq: HttpReq) {
        if (httpReq.type === 'GET') {
            return this.getMethod(httpReq);
        } else if (httpReq.type === 'POST') {
            return this.postMethod(httpReq);
        } else if (httpReq.type === 'PUT') {
            return this.putMethod(httpReq);
        } else if (httpReq.type === 'DELETE') {
            return this.deleteMethod(httpReq);
        }
    }
    getMethod(httpReq: HttpReq): Observable<any> {
        const paramString = Util.GetParamString(httpReq.body ? httpReq.body : {});
        const url = environment.apiUrl + httpReq.url + paramString;
        return this.http.get(url, { headers: this.headers }).pipe(
            map(
                (resp: any) => {
                    if (httpReq.showLoader && httpReq.showLoader === true) {
                        this.showLoader(false);
                    }
                    return resp;
                })
        );
    }

    postMethod(httpReq: HttpReq): Observable<HttpResponse<object>> {
        let header: any;
        const url = httpReq.isAcessTokenReq ? environment.apiUrl + httpReq.url :
            environment.apiUrl + httpReq.url + (httpReq.url.includes('?') ? '&access_token=' : '?access_token=') + this.getAccessToken();
        if (httpReq.contentType === 'formEncoded') {
            header = new HttpHeaders({ 'Content-Type': this.CONTENT_APPLICATION_URLENCODED });
        } else if (httpReq.contentType === 'applicationJSON') {
            header = new HttpHeaders({ 'Content-Type': this.CONTENT_APPLICATION_JSON });
        }
        return this.http.post(url, httpReq.body, { headers: header }).pipe(
            map(
                (resp: any) => {
                    if (httpReq.showLoader && httpReq.showLoader === true) {
                        this.showLoader(false);
                    }
                    return resp;
                },
                (error: Error) => {
                    if (httpReq.showLoader && httpReq.showLoader === true) {
                        this.showLoader(false);
                    }
                    // return error;
                }
            )
        );
    }

    putMethod(httpReq: HttpReq): Observable<HttpResponse<object>> {
        const url = 'https://jobportall.herokuapp.com/' + httpReq.url;
        return this.http.put(url, httpReq.body, { headers: this.headers }).pipe(
            map(
                (resp: any) => {
                    if (httpReq.showLoader && httpReq.showLoader === true) {
                        this.showLoader(false);
                    }
                    if (resp.status === 1) {
                        return resp.data;
                    } else {
                        // this.errorMessage(resp.error);
                        return null;
                    }
                },
                (error: Error) => {
                    console.log('error Message :' + JSON.stringify(error));
                }
            )
        );
    }
    getAuthToken(httpReq: HttpReq) {
        const url = environment.apiUrl + httpReq.url;
        let header;
        if (httpReq.contentType === 'formEncoded') {
            header = new HttpHeaders({ 'Content-Type': this.CONTENT_APPLICATION_URLENCODED });
        }
        if (httpReq.showLoader && httpReq.showLoader === true) {
            this.showLoader(true);
        }
        return this.http.post(url, httpReq.body, { headers: header }).pipe(map(
            (res: any) => {
                if (httpReq.showLoader && httpReq.showLoader === true) {
                    this.showLoader(false);
                }
                Storage.setAccessToken(res.access_token);
                Storage.setSessionUser(res);
                // this.apexService.sessionUserEmit(res);
                return res;
            },
            (err: Error) => {
                if (httpReq.showLoader && httpReq.showLoader === true) {
                    this.showLoader(false);
                }
                return err;
            }
        ));
    }
    deleteMethod(httpReq: HttpReq): Observable<HttpResponse<object>> {
        const paramString = Util.GetParamString(httpReq.body ? httpReq.body.data : {});
        const url = this.API_ENDPOINT + httpReq.url + paramString;
        return this.http.delete(url, { headers: this.headers }).pipe(
            map(
                (resp: any) => {
                    if (httpReq.showLoader && httpReq.showLoader === true) {
                        // this.showLoader(false);
                    }
                    if (resp.status === 1) {
                        return resp.data;
                    } else {
                        // this.errorMessage(resp.error);
                        return null;
                    }
                }
            )
        );
    }
    getAccessToken() {
        return Storage.getAccessToken();
    }
}
