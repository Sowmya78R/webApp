import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Login } from 'src/app/entities/login.entity';
import { AuthReqService } from 'src/app/services/integration-services/auth-req.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { ApexService } from 'src/app/shared/services/apex.service';
import { AppService } from 'src/app/shared/services/app.service';
import { CustomValidators } from 'src/app/shared/utils/custom-validator';
import { Util } from 'src/app/shared/utils/util';

@Component({
  selector: 'app-newlogin',
  templateUrl: './newlogin.component.html',
  styleUrls: ['./newlogin.component.scss']
})
export class NewloginComponent implements OnInit {
  signinGroup: FormGroup;
  submitted = false;
  user: Login;
  userResponse: any;
  errorResponse: any = '';
  focusedElement: any;
  viewPassword: any = false;
  loginPageText: any;
  defaultText: any = `Smart Plate Solutions.......`;
  passwordType = "password"
  constructor(private formBuilder: FormBuilder,
    private authReqService: AuthReqService,
    private appService: AppService,
    private metaDataService: MetaDataService,
    private customValidators: CustomValidators,
    private util: Util, private configService: ConfigurationService,
    private apexService: ApexService) { }

  ngOnInit() {
    this.createLoginForm();
    this.fetchAllLoginPageText();
  }

  createLoginForm() {
    this.signinGroup = this.formBuilder.group({
      username: ['', this.customValidators.validateSkrillEmail()],
      password: ['', this.customValidators.required]
    });
  }
  // superadmin1@dli.com/superadmin@123
  get formInstance() {
    return this.signinGroup.controls;
  }
  showPassword() {
    this.passwordType = (this.passwordType == 'password') ? 'text' : 'password'
  }
  loginCTA() {
    if (this.signinGroup.valid) {
      this.user = this.signinGroup.value;
      this.authReqService.getBusinessUnitorLogin(this.user['username']).subscribe(data => {
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
              this.apexService.showLoader(false);
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
      })
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
