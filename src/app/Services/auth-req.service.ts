import { Injectable } from '@angular/core'
import { HttpService } from './http.service';
import { Storage } from '../utils/storage';
import { HttpReq } from '../Entities/app.entity';

@Injectable({
    providedIn: 'root'
})
export class AuthReqService {
    REST_TYPE_GET: any = 'GET';
    REST_TYPE_POST: any = 'POST';
    REST_TYPE_PUT: any = 'PUT';
    REST_TYPE_DELETE: any = 'DELETE';
    id: string | undefined;
    constructor(private httpService: HttpService) {
        this.getUserId();
    }
    getUserId() {
        if (Storage.getSessionUser()) {
            this.id = Storage.getSessionUser().id;
        }
    }
    getBusinessUnitorLogin(email: any) {
        const httpReq: HttpReq = new HttpReq();
        httpReq.type = this.REST_TYPE_POST;
        httpReq.url = `login/services/findUserBusinessUnitByEmail?email=${email}`;
        httpReq.body = {};
        httpReq.isAcessTokenReq = true;
        return this.httpService.restCall(httpReq);
    }
    signIn(entityData: any, businessUnit: any) {
        const httpReq: HttpReq = new HttpReq();
        const data =
            `grant_type=password&client_id=restapp&client_secret=restapp&username=${entityData.username}&password=${entityData.password}`;
        httpReq.type = this.REST_TYPE_POST;
        httpReq.url = businessUnit ? `oauth/token?businessUnit=${businessUnit}` : 'oauth/token';
        httpReq.contentType = 'formEncoded';
        httpReq.showLoader = true;
        httpReq.body = data;
        return this.httpService.getAuthToken(httpReq);
    }
    sendEmail(data: any) {
        const httpReq: HttpReq = new HttpReq();
        httpReq.type = this.REST_TYPE_POST;
        httpReq.url = 'login/services/forgotPassword';
        httpReq.contentType = 'applicationJSON';
        httpReq.isAcessTokenReq = true;
        httpReq.showLoader = true;
        httpReq.body = data;
        return this.httpService.restCall(httpReq);
    }
    validateEmail(data: any) {
        const httpReq: HttpReq = new HttpReq();
        httpReq.type = this.REST_TYPE_GET;
        httpReq.url = 'resetParam';
        httpReq.contentType = 'applicationJSON';
        httpReq.showLoader = true;
        httpReq.body = { email: data };
        return this.httpService.restCall(httpReq);
    }
    changePassword(data: any) {
        const httpReq: HttpReq = new HttpReq();
        httpReq.type = this.REST_TYPE_POST;
        httpReq.url = 'login/services/changePassword';
        httpReq.contentType = 'applicationJSON';
        httpReq.showLoader = true;
        httpReq.body = data;
        return this.httpService.restCall(httpReq);
    }
    resetPassword(data: any) {
        const httpReq: HttpReq = new HttpReq();
        httpReq.type = this.REST_TYPE_POST;
        httpReq.url = 'login/services/resetPassword';
        httpReq.contentType = 'applicationJSON';
        httpReq.showLoader = true;
        httpReq.isAcessTokenReq = true;
        httpReq.body = data;
        return this.httpService.restCall(httpReq);
    }
    logout(data: any) {
        const httpReq: HttpReq = new HttpReq();
        httpReq.type = this.REST_TYPE_POST;
        httpReq.url = 'login/services/oauth/token/revoke';
        httpReq.contentType = 'formEncoded';
        httpReq.showLoader = true;
        httpReq.body = `token=${data}`;
        return this.httpService.restCall(httpReq);
    }
    getBusinessUnitWithBarcode(barcode: any) {
        const httpReq: HttpReq = new HttpReq();
        httpReq.type = this.REST_TYPE_POST;
        httpReq.url = `login/services/findUserBusinessUnitByOriginalBarcode?barcode=${barcode}`;
        httpReq.body = {};
        httpReq.isAcessTokenReq = true;
        return this.httpService.restCall(httpReq);
    }
}
