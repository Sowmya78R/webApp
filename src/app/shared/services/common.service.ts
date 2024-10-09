import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class CommonService {
  constructor() {
  }
  getFilteredData(key: any, value: any, sourceArray: any, parentKey?: any, diffKey?: any, specificKeys?: any) {
    let response: any;
    if (!!diffKey) {
        response = sourceArray.filter( (data: any) => value === data[key]);
        return response.shift()[diffKey];
    } else if (!!parentKey) {
      response = sourceArray.filter( (data: any) => value === data[parentKey][key]);
      return response.shift()[parentKey];
    } else {
        response = sourceArray.find( (data: any) => value === data[key]);
        return this.getFilteredFieldsFromObj(response, specificKeys);
    }
  }
  getFilteredFieldsFromObj(sourceObj: any, specificKeys: any) {
    return specificKeys.reduce((accumulator: any, currentValue: any) => ({ ...accumulator, [currentValue]: sourceObj[currentValue] }), {});
  }
  replaceName(obj: any, sourceKey: any, destKey: any) {
    for (const key in obj) {
      if (sourceKey === key) {
        obj[destKey] = obj[sourceKey];
        delete obj[sourceKey];
        return obj;
      }
    }
  }
  getProductBWDates(data) {
    if (data.fromDate && data.toDate) {
      return data.products.filter(product =>
        new Date(product[data.currentDate]) >= data.fromDate && new Date(product[data.currentDate]) <= data.toDate);
    }
  }
  getFilteredObjectsFromArray(sourceArray: any, key: any, value: any) {
    if (sourceArray && key && value) {
      return sourceArray.filter( (obj: any) => obj[key] === value);
    } else {
      return [];
    }
  }
  getFiltValuesFromArrayOfObjs(srcArray: any, key: any, subKey?: any) {
    const destArray = [];
    srcArray.forEach( (item: any) => {
      for (const objKey in item) {
        if (typeof item[key] === 'string' && objKey === key && destArray.indexOf(item[key]) === -1) {
          destArray.push(item[key]);
        } else if (typeof item[key] === 'number' && objKey === key && destArray.indexOf(item[key]) === -1) {
          destArray.push(item[key]);
        } else if (item[key] && typeof item[key] === 'object' && objKey === key && destArray.indexOf(item[key][subKey]) === -1) {
          destArray.push(item[key][subKey]);
        }
      }
    });
    return destArray;
  }
  getNoOfDaysBWTwoDates(srcDate, destDate) {
    const sourceDate = new Date(srcDate);
    const destinationDate = new Date(destDate);
    if (sourceDate <= destDate) {
      const diffInTime = destinationDate.getTime() - sourceDate.getTime();
      return diffInTime / (1000 * 3600 * 24);
    } else {
      return null;
    }
  }
  getEndStringWithCapitalCase(srcStr) {
    const srcArr = srcStr.split(/(?=[A-Z])/);
    return `${srcStr.charAt(0).toUpperCase()}${srcArr[0].slice(1)} ${srcArr[1]}`;
  }
  getSelectedValuesFromArrayOfObjs(srcArray: any, key: any, extraKeys?: any) {
    const destArray = [];
    if( srcArray !=null){
    srcArray.forEach( (item: any) => {
      if (item && item[key] && typeof item[key] === 'string') {
        const destObj = {_id: item._id, [key]: item[key]};
        if (!!extraKeys) {
          extraKeys.forEach(extraKey => {
            destObj[extraKey] = item[extraKey];
          });
        }
        destArray.push(destObj);
      }
    });
  }
    return this.removeDuplicatesFromArray(destArray, key);
  }
  removeDuplicatesFromArray(srcArray: any, prop) {
    const newArray = [];
    const lookupObject  = {};
    if (srcArray.length > 0) {
      for (var i in srcArray) {
        lookupObject[srcArray[i][prop]] = srcArray[i];
      }
      for (i in lookupObject) {
          newArray.push(lookupObject[i]);
      }
    }
    return newArray;
  }

  imgGlobalChanged(event, variable, isEvent?) {
    let element = <HTMLImageElement> (document.getElementById(variable));
    const reader = new FileReader();
  //  reader.onload = e => element.src = reader.result.toString();
    reader.readAsDataURL(isEvent ? event : event.target.files[0]);
  }
  getTimeFromMilliSec(data) {
    const date = new Date(data);
    const hours = ('0' + date.getHours()).slice(-2);
    const mins = ('0' + date.getMinutes()).slice(-2);
    return `${hours}:${mins}`;
  }

}
