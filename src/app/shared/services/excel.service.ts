import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { BehaviorSubject } from 'rxjs';
import * as XLSX from 'xlsx';
import { WmsCommonService } from '../../services/wms-common.service';
import { data } from 'jquery';
import { DecimalUtils } from 'src/app/constants/decimal';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  private jsonEvent: BehaviorSubject<any> = new BehaviorSubject([]);
  jsonData = this.jsonEvent.asObservable();
  data: any;
  completeCountList: any;
  partialAvailbleList: any;
  UnAvailableList: any;
  constructor(private wmsCommonService: WmsCommonService) { }
  public async exportAsExcelFile(json: any[], excelFileName: string, fieldsToDelete: Array<string>, forTotals?, newArrayList?) {
    const data = await this.formatJSON(json, fieldsToDelete);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    if (forTotals && excelFileName == 'Third Party Space Utilization') {
      XLSX.utils.sheet_add_json(worksheet, [
        { A: 'Total', B: '', C: forTotals.totalIn, D: forTotals.totalOut, E: forTotals.totalOpeningBalance, F: forTotals.totalOccupied, G: '' }
      ], { header: ["A", "B", "C", "D", "E", "F", "G"], skipHeader: true, origin: -1 });
    }
    if (forTotals && excelFileName == 'Shipment History Reports') {
      XLSX.utils.sheet_add_json(worksheet, [
        { A: 'Total', B: forTotals.totalProductWiseQty }
      ], { header: ["A", "B", "C", "D", "E", "F", "G"], skipHeader: true, origin: 1 });
    }
    if (forTotals && excelFileName == 'Space Utilization Reports') {
      newArrayList.forEach(innerElement => {

        const array = newArrayList.map(x => x.locationSpaceStatus)
        if (array.includes('Completely Available')) {
          const completeCOunt = newArrayList.find(x => x.locationSpaceStatus == 'Completely Available').locationsCount

          this.completeCountList = completeCOunt ? completeCOunt : 0

        }
        if (array.includes('Partially Available')) {
          const partialAvailble = newArrayList.find(x => x.locationSpaceStatus == 'Partially Available').locationsCount

          this.partialAvailbleList = partialAvailble ? partialAvailble : 0

        }
        if (array.includes('UnAvailable')) {
          const UnAvailable = newArrayList.find(x => x.locationSpaceStatus == 'UnAvailable').locationsCount

          this.UnAvailableList = UnAvailable ? UnAvailable : 0

        }
      })
      if (this.completeCountList == undefined && this.completeCountList == null) {
        this.completeCountList = 0
      }
      else if (this.partialAvailbleList == undefined && this.partialAvailbleList == null) {
        this.partialAvailbleList = 0
      }
      else if (this.UnAvailableList == undefined) {
        this.UnAvailableList = 0
      } else {
        this.completeCountList = this.completeCountList
        this.partialAvailbleList = this.partialAvailbleList
        this.UnAvailableList = this.UnAvailableList
      }
      let value = this.completeCountList + this.partialAvailbleList + this.UnAvailableList

      XLSX.utils.sheet_add_json(worksheet, [
        { A: 'Completely Availble', B: this.completeCountList },
        { A: 'Partial Availble', B: this.partialAvailbleList },
        { A: 'Not Availble', B: this.UnAvailableList },

        { A: 'Total Count', B: value },
      ], { header: ["A", "B", "C", "D", "E", "F", "G"], skipHeader: true, origin: -1 });



      XLSX.utils.sheet_add_json(worksheet, [
        { A: 'Total Space', B: forTotals.totalSpace },
        { A: 'Total Usuable Space', B: DecimalUtils.showLimitedDecimals(forTotals.usableSpace) }

      ], { header: ["A", "B", "C", "D", "E", "F", "G"], skipHeader: true, origin: -1 });

    }
    //console.log("worksheet", worksheet, forTotals, excelFileName)
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '-' + new Date().getTime() + EXCEL_EXTENSION);
  }
  formatJSON(data: any, fieldsToDelete: Array<string>) {
    const formatedData = [];
    const fieldsToDate = ['poExpiryDate', 'createdOn', 'createdDate', 'loginTime', 'logoutTime',
      'poDeliveryDate', 'receiptDate', 'eta', 'customClearanceTime', 'mfgDate', 'expiryDate', 'grnDate',
      'contractStartDate', 'contractEndDate'];
    if (Array.isArray(data)) {
      data.forEach(object => {
        const a: any = {};
        for (const key in object) {
          if (Array.isArray(object[key])) {
            object[key].forEach((obj, index) => {
              if (obj && obj.length > 0) {
                for (const innerKey of obj) {
                  a[`${innerKey}${index}`] = obj[innerKey];
                }
              }
            });
          } else if (object[key] instanceof Object) {
            Object.assign(a, object[key]);
          } else if (fieldsToDate.indexOf(key) > -1) {
            a[key] = object[key] ? this.wmsCommonService.getDateFromMilliSec(object[key]) : null;
          } else {
            const b = {};
            b[key] = object[key];
            Object.assign(a, b);
          }
        }
        if (fieldsToDelete) {
          fieldsToDelete.forEach(field => {
            if (field === 'productCategoryName') {
              a['productCategory'] = a[field];
            }
            if (a.hasOwnProperty(field)) {
              delete a[field];
            }
          });
        }
        formatedData.push(a);
      });
    }
    return formatedData;
  }
  generateJsonUsingExcel(event, inv?) {
    const file: File = event.target.files[0];
    if (file) {

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = async (e) => {
        const arrayBuffer: any = fileReader.result;
        const fileData = new Uint8Array(arrayBuffer);
        const arr = new Array();
        for (let i = 0; i !== fileData.length; ++i) { arr[i] = String.fromCharCode(fileData[i]); }
        const bstr = arr.join('');
        // , cellDates: true
        let workbook = null;
        if (inv) {
          workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
        }
        else {
          workbook = XLSX.read(bstr, { type: 'binary' });
        }
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = await XLSX.utils.sheet_to_json(worksheet, { raw: true });
        // this.jsonEvent.next(jsonData);
        return this.setJsonData(jsonData);
      };
    }
  }
  setJsonData(jsonData: any) {
    this.data = jsonData;
  }
  getJsonData() {
    return this.data;
  }
  generateInnerObjs(data, keysToCreate) {
    data.forEach((obj, index) => {
     /*  Object.keys(obj).forEach((el, i) => {
        obj[el] = typeof (obj[el]) === 'string' ? obj[el].trim() : obj[el];
      }); */
      Object.keys(keysToCreate).forEach(key => {
        if (Object.keys(obj).includes(key)) {
          obj[keysToCreate[key].parent] = { [keysToCreate[key].child]: obj[key] };
        }
      });
    });
    return data;
  }
  generateInnerProdutObjs(data, keysToCreate) {
    data.forEach((obj, index) => {
     /*  Object.keys(obj).forEach((el, i) => {
        obj[el] = typeof (obj[el]) === 'string' ? obj[el].trim() : obj[el];
      }); */
      Object.keys(keysToCreate).forEach(key => {
        if (Object.keys(obj).includes(key)) {
          obj[keysToCreate[key].parent] = { [keysToCreate[key].child]: obj[key] };
        }
      });
    });
    return data;
  }
  deleteUnRequiredParams(a, fieldsToDelete: any) {
    if (fieldsToDelete) {
      a.forEach(b => {
        fieldsToDelete.forEach(field => {
          if (b.hasOwnProperty(field)) {
            delete b[field];
          }
        });
      })
      return a;
    }
  }
  formatJSONForHeaderLines(data, linesArrayName) {
    console.log(data)
    console.log(linesArrayName);
    const filteredHeaderArray = [];
    data.forEach(obj => {
      const b = {};
      for (let key in obj) {
        if (key !== linesArrayName) {
          b[key] = obj[key]
        }
        if (key == '_id' && ['vehicleLines'].includes(linesArrayName) && ['wareHouseTransferLines'].includes(linesArrayName)) {
          b['headerId'] = obj._id;
        }
        if (key == '_id' && ['vehicleLines'].includes(linesArrayName)) {
          b['id'] = obj._id;
        }

        if (key == 'supplierID' && ['productMasterInfos'].includes(linesArrayName)) {
          b['finishedSupplierID'] = {
            finishedSupplierID: obj['supplierID']['supplierID'],
            finishedSupplierName: obj['supplierID']['supplierID']
          }
          delete b['supplierID'];
        }
        if (key == 'supplierID' && ['productMasterInfos'].includes(linesArrayName)) {
          b['finishedSupplierID'] = { finishedSupplierID: obj['supplierID']['supplierID'], finishedSupplierName: obj['supplierID']['supplierID'] }
          delete b['supplierID'];
        }
        if (key == 'productID' && ['customerMasterInfos'].includes(linesArrayName)) {
          b['finishedProductID'] = { finishedProductID: obj['supplierID']['supplierID'], finishedProductName: obj['productID']['productID'] }
          delete b['productID'];
        }
        if (key == 'pickingStrategyName' && ['zoneInfos'].includes(linesArrayName)) {
          b['finishedPickingStrategyName'] = obj['pickingStrategyName']
          delete b['pickingStrategyName'];
        }
        if (key == 'putawayStrategyName' && ['zoneInfos'].includes(linesArrayName)) {
          b['finishedPutawayStrategyName'] = obj['putawayStrategyName']
          delete b['putawayStrategyName'];
        }
        if (key == 'customerID' && ['productMasterInfos'].includes(linesArrayName)) {
          b['finishedCustomerID'] = obj['customerID']
          delete b['customerID'];
        }
        if (key == 'supplierID' && ['productMasterInfos'].includes(linesArrayName)) {
          b['finishedSupplierID'] = obj['supplierID']
          delete b['supplierID'];
        }
        if (key == 'name' && ['products'].includes(linesArrayName)) {
          b['finishedName'] = obj['name']
          delete b['name'];
        }
        if (key == 'wareHouseID' && ['allAddresses'].includes(linesArrayName)) {
          b['finishedwareHouseID'] = obj['wareHouseID']
          delete b['wareHouseID'];
        }
        if (key == 'supplierID' && ['allAddresses'].includes(linesArrayName)) {
          b['finishedSupplierID'] = obj['supplierID']
          delete b['supplierID'];
        }
        if (key == 'customerID' && ['allAddresses'].includes(linesArrayName)) {
          b['finishedCustomerID'] = obj['customerID']
          delete b['customerID'];
        }
      }
      filteredHeaderArray.push(b);
    });
    data.forEach(obj => {
      const b = {};
      for (let key in obj) {
        if (key !== linesArrayName) {
          b[key] = obj[key]
        }
        if (key === 'termsOfPayment') {
          b[key] = obj[key];
        }
      }
      filteredHeaderArray.push(b);
    });
    const formattedArray = [];
    data.forEach((obj, index) => {
      for (let key in obj) {
        if (key === linesArrayName) {
          if (obj[linesArrayName] && obj[linesArrayName].length > 0) {
            obj[linesArrayName].forEach((line, j) => {
              if (j === 0) {
                const { receiptDate, termsOfPayment, ...filteredLine } = line;
                formattedArray.push({ ...filteredHeaderArray[index], ...filteredLine });
              } else {
                formattedArray.push({ ...line });
              }
            });
          }
        }
      }
    });
    return formattedArray;
  }
  downloadGlobalFiles(res, file) {
    var arr = res,
      mime = 'data',
      bstr = atob(arr),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const data = new File([u8arr], file, { type: mime })
    FileSaver.saveAs(data, file);

  }
  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }
}
