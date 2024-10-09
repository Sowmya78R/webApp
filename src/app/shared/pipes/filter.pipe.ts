import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalFilter'
})
// export class FilterPipe implements PipeTransform {

//   transform(items: any[], searchText: any): any {
//     if (!items || !searchText) {
//       return items;
//     } else {
//       return items.filter(item => item.supplierIDName.indexOf(searchText) !== -1);
//     }
//   }
// }
export class decimalPipe implements PipeTransform {
  transform(value1): any {
    if (value1) {
      if (value1.toString().includes('.')) {
        const [beforeDot, afterDot] = value1.toString().split('.');
        const afterDotTrimmed = afterDot.slice(0, 2);
        return beforeDot + '.' + afterDotTrimmed;
      } else {
        return value1
      }
    }
  }
}

