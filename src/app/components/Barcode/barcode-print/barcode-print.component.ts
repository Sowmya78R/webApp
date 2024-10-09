import { Component, Input, OnInit } from '@angular/core';
import { BarcodeService } from 'src/app/services/barcode.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';

@Component({
  selector: 'app-barcode-print',
  templateUrl: './barcode-print.component.html',
  styleUrls: ['./barcode-print.component.scss']
})
export class BarcodePrintComponent implements OnInit {
  logoImage: any;
  finalArray: any = [];
  @Input() set tripInput(value: boolean) {

    if (value && this.bService.printArray.length > 0) {
      this.finalArray = [];
      const localArray = this.bService.printArray;
      // const localArray = [
      //   {
      //     "_id": "64bbb50d4ae32fdc7d223057",
      //     "productMasterInfo": {
      //       "productMasterID": "63db53e04ae32f9322841d98",
      //       "productID": "2",
      //       "productName": "TANG ORANGE 4L (500g) NEW",
      //       "productIDName": "2:TANG ORANGE 4L (500g) NEW",
      //       "moq": null,
      //       "leadTime": null,
      //       "receivingUnit": null,
      //       "isActive": true,
      //       "createdDate": null,
      //       "productImage": null
      //     },
      //     "unitCode": "PCS",
      //     "upcEANNumber": 488255340549,
      //     "createdDate": null,
      //     "lastUpdatedDate": null,
      //     "organizationInfo": {
      //       "_id": "637dad114ae32f73bedcd112",
      //       "organizationID": "ORG1",
      //       "organizationName": "Hyderabad",
      //       "organizationIDName": "ORG1:Hyderabad"
      //     },
      //     "wareHouseInfo": {
      //       "wareHouseMasterID": "637db2784ae32f73bedcd11a",
      //       "wareHouseID": "Utl",
      //       "wareHouseName": "Logicstics",
      //       "wareHouseIDName": "Utl:Logicstics"
      //     }
      //   },
      //   {
      //     "_id": "64bbb5184ae32fdc7d223058",
      //     "productMasterInfo": {
      //       "productMasterID": "63e33a264ae32fab47a3e040",
      //       "productID": "333",
      //       "productName": "FIVE STAR 24G FLOWPACKX40U IN OUTER",
      //       "productIDName": "333:FIVE STAR 24G FLOWPACKX40U IN OUTER",
      //       "moq": null,
      //       "leadTime": null,
      //       "receivingUnit": null,
      //       "isActive": true,
      //       "createdDate": null,
      //       "productImage": null
      //     },
      //     "unitCode": "PCS",
      //     "upcEANNumber": 429993478576,
      //     "createdDate": null,
      //     "lastUpdatedDate": null,
      //     "organizationInfo": {
      //       "_id": "637dad114ae32f73bedcd112",
      //       "organizationID": "ORG1",
      //       "organizationName": "Hyderabad",
      //       "organizationIDName": "ORG1:Hyderabad"
      //     },
      //     "wareHouseInfo": {
      //       "wareHouseMasterID": "637db2784ae32f73bedcd11a",
      //       "wareHouseID": "Utl",
      //       "wareHouseName": "Logicstics",
      //       "wareHouseIDName": "Utl:Logicstics"
      //     }
      //   },
      //   {
      //     "_id": "64bbc9bc4ae32fa3ca7188d7",
      //     "productMasterInfo": {
      //       "productMasterID": "63e33a264ae32fab47a3e03e",
      //       "productID": "111",
      //       "productName": "BOURNVITA SHKTI 500GJR+150GOREO FRE",
      //       "productIDName": "111:BOURNVITA SHKTI 500GJR+150GOREO FRE",
      //       "moq": null,
      //       "leadTime": null,
      //       "receivingUnit": null,
      //       "isActive": true,
      //       "createdDate": null,
      //       "productImage": null
      //     },
      //     "unitCode": "BOX",
      //     "upcEANNumber": 497529793268,
      //     "createdDate": null,
      //     "lastUpdatedDate": null,
      //     "organizationInfo": {
      //       "_id": "637dad114ae32f73bedcd112",
      //       "organizationID": "ORG1",
      //       "organizationName": "Hyderabad",
      //       "organizationIDName": "ORG1:Hyderabad"
      //     },
      //     "wareHouseInfo": {
      //       "wareHouseMasterID": "637db2784ae32f73bedcd11a",
      //       "wareHouseID": "Utl",
      //       "wareHouseName": "Logicstics",
      //       "wareHouseIDName": "Utl:Logicstics"
      //     }
      //   },
      //   {
      //     "_id": "64bbc9d44ae32fa3ca7188d8",
      //     "productMasterInfo": {
      //       "productMasterID": "63db55034ae32f9322841d9a",
      //       "productID": "4",
      //       "productName": "Kit Kat",
      //       "productIDName": "4:Kit Kat",
      //       "moq": null,
      //       "leadTime": null,
      //       "receivingUnit": null,
      //       "isActive": true,
      //       "createdDate": null,
      //       "productImage": null
      //     },
      //     "unitCode": "PCS",
      //     "upcEANNumber": 551334540850,
      //     "createdDate": null,
      //     "lastUpdatedDate": null,
      //     "organizationInfo": {
      //       "_id": "637dad114ae32f73bedcd112",
      //       "organizationID": "ORG1",
      //       "organizationName": "Hyderabad",
      //       "organizationIDName": "ORG1:Hyderabad"
      //     },
      //     "wareHouseInfo": {
      //       "wareHouseMasterID": "637db2784ae32f73bedcd11a",
      //       "wareHouseID": "Utl",
      //       "wareHouseName": "Logicstics",
      //       "wareHouseIDName": "Utl:Logicstics"
      //     }
      //   }
      // ]
      localArray.forEach((el, index) => {
        this.finalArray.push({ 'productIDName': el.productMasterInfo.productIDName, 'unit': el.unitCode, 'logoImage': null, 'upcEANNumber': el.upcEANNumber })
        this.bService.fetchBarcodeByEAN(el.upcEANNumber).subscribe(res => {
          if (res['status'] == 0 && res['data']['barcodeName']) {
            const fileNames = JSON.parse(JSON.stringify(res['data']['barcodeName']));
            this.metaDataService.viewImages(fileNames).subscribe(data => {
              if (data['data'].resource) {
                this.finalArray[index].logoImage = 'data:text/plain;base64,' + data['data']['resource'];
                this.finalArray[index].logoImage = this.metaDataService.dataURLtoFile(this.finalArray[index].logoImage, fileNames);
                this.metaDataService.imgGlobalChanged(this.finalArray[index].logoImage, `logoImage${index}`, true);
              }
            });
          }
        })
      });
    }
  }
  constructor(private metaDataService: MetaDataService, private bService: BarcodeService) { }

  ngOnInit() {

  }

}
