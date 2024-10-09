import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalwithTenDigits'
})
export class DecimalwithTenDigitsPipe implements PipeTransform {
  transform(value1): any {
    if (value1) {
      if (value1.toString().includes('.')) {
        const [beforeDot, afterDot] = value1.toString().split('.');
        const afterDotTrimmed = afterDot.slice(0, 10);
        return beforeDot + '.' + afterDotTrimmed;
      } else {
        return value1
      }
    }
  }

}