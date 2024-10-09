import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { AuthReqService } from '../../../services/integration-services/auth-req.service';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../shared/services/app.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  focusedElement: any;
  loginPageText: any;
  yesChangeTemplate: boolean = false;
  
  constructor(private util: Util,private metaDataService:MetaDataService,
              private authService: AuthReqService,
              private toastr: ToastrService,
              private appService: AppService,
              private customValidators: CustomValidators) { }

  ngOnInit() {
    if (window.location.href.includes('sps.fruisce.in/wms')) {
      this.yesChangeTemplate = true;
    }
    this.createForm();
    this.fetchAllLoginPageText();
  }
  send() {
    this.authService.sendEmail({email: this.forgotPasswordForm.value.email}).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.status && response.data.status.status === 'true') {
          console.log(response)
          this.toastr.success('Sent successfully, Please check mail');
          this.appService.navigate('/login', null);
        } else {
          this.toastr.error(response.statusMsg)
        }
      },
      (error) => {

      });
  }
  clear() {
    this.forgotPasswordForm.reset();
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  shouldShowErrors(fieldName, formName) {
    if (this.focusedElement && this.focusedElement === fieldName) {
      return false;
    } else {
      return this.util.shouldShowErrors(fieldName, formName);
    }
  }
  createForm() {
    this.forgotPasswordForm = new FormBuilder().group({
      email: [null, this.customValidators.validateSkrillEmail()],
    });
  }
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
