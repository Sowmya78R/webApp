import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthReqService } from '../../Services/auth-req.service';
import { ConfigurationService } from '../../Services/configuration.service';
import { AppService } from '../../Services/app.service';
import { Util } from '../../utils/util';
import { CommonModule } from '@angular/common';
// import { CustomValidators } from '../../utils/custom-validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  signinGroup: FormGroup;
  submitted = false;
  user: any = null;
  //   {
  //     email: string;
  //     password: string;
  // }
  userResponse: any;
  errorResponse: any = '';
  focusedElement: any;
  viewPassword: any = false;
  loginPageText: any;
  defaultText: any = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
   standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled`;
  passwordType = "password";
  yesChangeTemplate: boolean = false;
  constructor(private formBuilder: FormBuilder,
    private authReqService: AuthReqService,
    private appService: AppService,
    private util: Util, private configService: ConfigurationService) { }
  // private customValidators: CustomValidators,
  ngOnInit() {

    /* Demo Purse this commint is  */
    this.createLoginForm();
    this.fetchAllLoginPageText();
    if (window.location.href.includes('sps.fruisce.com/wms')) {
      this.yesChangeTemplate = true;
    }
  }

  createLoginForm() {
    this.signinGroup = this.formBuilder.group({
      username: null,
      password: null
    });
  }
  // superadmin1@dli.com/superadmin@123
  get formInstance() {
    return this.signinGroup.controls;
  }
  showPassword() {
    this.passwordType = (this.passwordType == 'password') ? 'text' : 'password'
  }
  getBarcode() {
    // if (this.signinGroup.value.username.includes('BAR:') && this.signinGroup.value.username.length == 12) {
    //   this.loginCTA('key');
    // }
  }
  loginCTA(key?) {
    if (key) {
      if (key) {
        this.signinGroup.controls.username.patchValue(encodeURIComponent(this.signinGroup.controls.username.value));
        this.signinGroup.controls.password.setValue(this.signinGroup.controls.username.value);
        const formValues = this.signinGroup.value;
        formValues['barcode'] = 'barcode';
        this.user = formValues;
        this.authReqService.getBusinessUnitWithBarcode(this.signinGroup.controls.username.value).subscribe(res => {
          this.loginContinue(res);
        })
      }
    }
    else {
      if (this.signinGroup.valid) {
        this.user = this.signinGroup.value;
        this.authReqService.getBusinessUnitorLogin(this.user['username']).subscribe(data => {
          this.loginContinue(data);
        })
      }
    }
  }
  loginContinue(data) {
    if (data['status'] == 0 && data['data']['users']) {
      sessionStorage.setItem('businessUnit', data['data']['users'].businessUnit);
      this.authReqService.signIn(this.user, data['data']['users'].businessUnit).subscribe(
        (response: any) => {
          this.userResponse = response;
          if (response.authorities[0].authority == 'ROLE_SUPER_ADMIN') {
            this.configService.findAllFunctionalitiesByRoleID('ROLE_TEMPLATE').subscribe(
              (res) => {
                if (res && res.status === 0 && res.data.functionality && res.data.functionality.mainFunctionalities) {
                  response['functionality'] = res.data.functionality;
                  this.configService.role = response.authorities[0].authority;
                  sessionStorage.setItem('role', 'ROLE_SUPER_ADMIN');
                  const value = JSON.parse(sessionStorage.getItem('dli-wms-user'));
                  value['functionality'] = res.data.functionality;
                  sessionStorage.setItem('dli-wms-user', JSON.stringify(value));
                  this.getExtra(response, data)
                }
              })
          }
          else {
            this.configService.role = null;
            this.getExtra(response, data);
          }
        },
        (err: any) => {
          // this.apexService.showLoader(false);
          if (err && err.error && err.error.error && err.error.error.indexOf('invalid_grant') !== -1) {
            this.errorResponse = 'Invalid username/password, try again.';
          } else {
            this.errorResponse = 'Your login attempt was not successful try again.';
          }
        });
    }
    else {
      this.errorResponse = 'Invalid username/password, try again.';
    }
  }
  getExtra(response, data) {
    this.configService.userDetails = response;
    this.configService.organizationValue = data['data']['users'].organizationInfo.organizationIDName;
    if (response.wareHouseConfiguration && response.wareHouseConfiguration.wareHouseFunctionalities.length > 0) {
      this.configService.organizationDropdown = response.wareHouseConfiguration.wareHouseFunctionalities.map(x => x.organizationInfo.organizationIDName);
      this.configService.wareHouseDropdown = response.wareHouseConfiguration.wareHouseFunctionalities.map(x => x.wareHouseInfo.wareHouseIDName);
      this.configService.organizationValue = response.wareHouseConfiguration.defaultOrganizationInfo.organizationIDName;
      this.configService.wareHouseValue = response.wareHouseConfiguration.defaultWareHouseInfo.wareHouseIDName;
    }
    this.appService.navigate('/homepage', null);

  }
  register() {
    this.appService.navigate('/register', null);
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
    if (this.errorResponse) { this.errorResponse = ''; }
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
  getErrorMessage(fieldName, formName) {
    return this.util.getErrorMessage(fieldName, formName);
  }
  isButtonDisabled(formName) {
    return this.util.isButtonDisabled(formName);
  }
  isControlValid(fieldName, formName) {
    return this.util.isControlValid(fieldName, formName);
  }

  fetchAllLoginPageText() {
    this.configService.fetchAllLoginPageText({}).subscribe(
      response => {
        if (response && response.status === 0 && response.data.LoginText && response.data.LoginText.length) {
          this.loginPageText = response.data.LoginText[0].loginText;
        }
      },
      error => {
      });
  }
}
