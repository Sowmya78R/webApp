import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { AuthReqService } from '../../../services/integration-services/auth-req.service';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../shared/services/app.service';
import { Storage } from '../../../shared/utils/storage';
import { ApexService } from '../../../shared/services/apex.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  focusedElement: any;
  email: any;
  passwordType = "password"
  passwordTypeC = 'password';
  loginPageText: any = null;
  yesChangeTemplate: boolean = false;
  
  constructor(private util: Util, private metaDataService: MetaDataService,
    private authService: AuthReqService,
    private toastr: ToastrService,
    private appService: AppService,
    private apexService: ApexService,
    private customValidators: CustomValidators) { }

  ngOnInit() {
    if (window.location.href.includes('sps.fruisce.in/wms')) {
      this.yesChangeTemplate = true;
    }
    this.createForm();
    this.fetchAllLoginPageText();
    this.email = Storage.getSessionUser();
    this.resetPasswordForm.controls.email.setValue(this.email.username);
  }
  showPassword() {
    this.passwordType = (this.passwordType == 'password') ? 'text' : 'password';
  }
  showPasswordC() {
    this.passwordTypeC = (this.passwordTypeC == 'password') ? 'text' : 'password';
  }
  update() {
    const req = {
      email: this.resetPasswordForm.controls.email.value,
      password: this.resetPasswordForm.controls.password.value,
      newPassword: this.resetPasswordForm.controls.newPassword.value
    };
    if (this.resetPasswordForm.value.newPassword === this.resetPasswordForm.value.confirmPassword) {
      this.authService.changePassword(req).subscribe(
        (response) => {
          if (response && response.status === 0) {
            this.toastr.success('Updated successfully, Please Login');
            Storage.clearSession();
            this.apexService.sessionUserEmit('');
            this.appService.navigate('/login', null);
            this.resetPasswordForm.reset();
          }
          else if (response && response.status === 2) {
            this.toastr.error(response.statusMsg);
          }
          else {
            this.toastr.error('Failed in sending');
          }
        },
        (error) => {
        });
    } else {
      this.toastr.error("Password and Confirm password doesn't Matched!");
    }
  }
  clear() {
    this.resetPasswordForm.reset();
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
    this.resetPasswordForm = new FormBuilder().group({
      email: [null, this.customValidators.required],
      password: [null, this.customValidators.required],
      newPassword: [null, this.customValidators.required],
      confirmPassword: [null, this.customValidators.required],
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
