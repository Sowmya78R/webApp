import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Util } from 'src/app/shared/utils/util';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { AuthReqService } from '../../../services/integration-services/auth-req.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../../../shared/services/app.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './update-password.component.html'
})
export class UpdatePasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  focusedElement: any;
  email: any;
  passwordType = "password"
  passwordTypeC = 'password';
  loginPageText: any = null;
  yesChangeTemplate: boolean = false;
  
  constructor(private util: Util,
    private authService: AuthReqService, private metaDataService: MetaDataService,
    private toastr: ToastrService,
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    private customValidators: CustomValidators, private commonMasterDataService: CommonMasterDataService) { }

  ngOnInit() {
    if (window.location.href.includes('sps.fruisce.in/wms')) {
      this.yesChangeTemplate = true;
    }
    this.createForm();
    this.fetchAllLoginPageText();
    this.fetchEmailAndValidate();
    this.checkLinkExpired();
  }
  checkLinkExpired() {
    this.commonMasterDataService.fetchUserDetailsforReset(this.resetPasswordForm.controls.email.value).subscribe(data => {
      if (data.status == 0 && data.data.users) {
        var currentTimeInMilliseconds = Date.now();
        if (data.data.users.tokenExpiry >= currentTimeInMilliseconds) {
        }
        else {
          this.toastr.error("Password Link Expired!!");
          this.appService.navigate('/login', null);
          this.resetPasswordForm.reset();
        }
      }
    })
  }
  update() {
    const req = {
      // btoa
      email: this.resetPasswordForm.value.email,
      password: this.resetPasswordForm.value.password
    };
    if (this.resetPasswordForm.value.password === this.resetPasswordForm.value.confirmPassword) {
      this.authService.resetPassword(req).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.status && response.data.status === true) {
            this.toastr.success('Updated successfully, Please Login');
            this.appService.navigate('/login', null);
            this.resetPasswordForm.reset();
          } else {
            this.toastr.error('Failed in sending');
          }
        },
        (error) => {
        });
    } else {
      this.toastr.error('Password and Confirm password should be same');
    }
  }
  clear() {
    this.resetPasswordForm.reset();
  }
  showPassword() {
    this.passwordType = (this.passwordType == 'password') ? 'text' : 'password';
  }
  showPasswordC() {
    this.passwordTypeC = (this.passwordTypeC == 'password') ? 'text' : 'password';
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
      email: [null, this.customValidators.validateSkrillEmail()],
      password: [null, this.customValidators.required],
      confirmPassword: [null],
    });
  }
  fetchEmailAndValidate() {
    let email = '';
    if (this.appService.getParam('id')) {
      email = this.appService.getParam('id');
      this.email = atob(email.replace('%3D', '='));
      this.resetPasswordForm.controls.email.setValue(this.email);
    }
    // this.authService.validateEmail(this.activatedRoute.snapshot.paramMap.get('id')).subscribe(
    //   (response) => {
    //     if (response && response.status === 0 && response.data.status && response.data.status.status === 'true') {
    //       this.resetPasswordForm.controls.email.setValue(this.email);
    //     } else {
    //       this.toastr.error('Invalid email');
    //     }
    //   },
    //   (error) => {

    //   });
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
