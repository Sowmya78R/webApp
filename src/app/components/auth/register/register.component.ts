import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthReqService } from '../../../services/integration-services/auth-req.service';
import { Login } from '../../../entities/login.entity';
import { AppService } from '../.../../../../shared/services/app.service';
import { CustomValidators } from '../../../shared/utils/custom-validator';
import { Util } from 'src/app/shared/utils/util';
import { ApexService } from 'src/app/shared/services/apex.service';
import { MetaDataService } from '../../../services/integration-services/metadata.service';
import { CommonMasterDataService } from 'src/app/services/integration-services/commonMasterData.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  registerGroup: FormGroup;
  submitted = false;
  user: Login;
  userResponse: any;
  errorResponse: any = '';
  focusedElement: any;
  viewPassword: any = false;
  constructor(
    private formBuilder: FormBuilder,
    private appService: AppService,
    private commonMasterDataService: CommonMasterDataService,
    private customValidators: CustomValidators,
    private util: Util,
    private toastr: ToastrService,
    private apexService: ApexService) { }

  ngOnInit() {
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerGroup = this.formBuilder.group({
      firstName: ['', this.customValidators.required],
      lastName: ['', this.customValidators.required],
      email: ['', this.customValidators.validateSkrillEmail()],
      password: ['', this.customValidators.required]
    });
  }
  get formInstance() {
    return this.registerGroup.controls;
  }
  registerCTA() {
    if (this.registerGroup.valid) {
      this.user = this.registerGroup.value;
      this.commonMasterDataService.saveOrUpdateUserConfig(JSON.stringify(this.user)).subscribe(
        (response) => {
          if (response && response.status === 0 && response.data.users) {
            this.registerGroup.reset();
            this.toastr.success('Registered successfully, Please Login.');
            this.appService.navigate('/login', null);
          } else if (response && response.status === 2 && response.statusMsg) {
            this.errorResponse = response.statusMsg;
          } else {
            this.errorResponse = 'Failed in registering, try again.';
          }
        },
        (error) => {
        }
      );
    }
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
}
