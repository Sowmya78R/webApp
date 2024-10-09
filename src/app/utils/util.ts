import { Storage } from './storage';
import { FormControl, FormGroup } from '@angular/forms';

export class Util {

  static GetSessionUser(): any {
    return Storage.getSessionUser();
  }
  static GetParamString(data: JSON) {
    let returnValue = '';
    if (data) {
      for (const key of Object.keys(data)) {
        if (data[key] && data[key] != null && data[key] !== '') {
          returnValue = returnValue === '' ? '?' : returnValue + '&'
          returnValue = returnValue + key + '=' + data[key];
        }
      }
    }
    return returnValue;
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  shouldShowErrors(controlFormNField, formName): boolean {
    let control;
    if (controlFormNField === 'expMonth' || controlFormNField === 'expYear') {
      control = formName.get('expDate').get(controlFormNField);
    } else {
      control = formName.controls[controlFormNField];
    }
    return control &&
      control.errors &&
      (control.dirty || control.touched);
  }

  isControlValid(controlFormNField, formName): boolean {
    const control = formName.controls[controlFormNField];
    return control && !control.errors && (control.dirty || control.touched);
  }

  getErrorMessage(controlFormNField, formName): string {
    let control;
    if (controlFormNField === 'expMonth' || controlFormNField === 'expYear') {
      control = formName.get('expDate').get(controlFormNField);
    } else {
      control = formName.controls[controlFormNField];
    }
    return control.errors.message;
  }

  isButtonDisabled(formName): boolean {
    return formName.invalid || formName.pending;
  }

  removeAllFormFieldsValidation(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsUntouched({ onlySelf: true });
        control.markAsPristine({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.removeAllFormFieldsValidation(control);
      }
    });
  }

  getButtonClass(formName, formSubmitted): string {
    let className = '';
    if (formName.invalid || formName.pending || formSubmitted) {
      className = 'btn-additional';
    } else if (!formName.invalid && !formName.pending) {
      className = 'btn-primary';
    }
    return className;
  }
}


