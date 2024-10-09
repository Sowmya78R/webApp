import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { NavConstants } from '../constants/nav.constants';
import { Constants } from '../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class WmsCommonService {
  supplierIDChange: Subject<any> = new Subject<any>();
  public addProductMasterData = {
    productAttributes: {
      productCategoryInfo: {}
    },
    productCurrency: {},
    planingDetails: {},
    productInstruction: {},
    productUnits: {},
    productDimensions: {}
  };
  public addSupplierMasterData = {
    supplierAttributes: {
      poExpiryDate: new Date(),
      taxGroup: {}
    },
    supplierBankDetails: {},
    supplierAdditionalDetails: {},
    supplierAddress: {}
  };
  public addProductBySupplierMasterData = {
    supplierDetails: {
      _id: null,
      supplierID: null
    },
    productDetails: {
      productMasterID: null,
      productID: null,
      productName: null
    },
    allProducts: []
  };
  public createPurchaseOrder = {
    wmpoNumber: null,
    referencePONumber: null,
    orderDeliveryDate: null,
    termsOfPayments: null,
    supplierMasterInfo: {
      _id: null,
      supplierID: null,
      supplierName: null,
      supplierIDName: null
    },
    poReferenceA: null,
    poReferenceB: null,
    shipTOAddress: null,
    purchaseOrderLines: [],
    remarks: null,
    termsAndConditions: null
  };
  constructor() { }
  public createPOSupplierIDChange(data: any) {
    this.supplierIDChange.next(data);
  }
  getDateFromMilliSec(data) {
    if (data) {
      const date = new Date(data);
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    } else {
      return;
    }
  }

  getDateFromMilliSecAddDay(data) {
    if (data) {
      const date = new Date(data);
      const addedDate = date.setDate(date.getDate() + 1);
      const final = new Date(addedDate);
      const year = final.getFullYear();
      const month = ('0' + (final.getMonth() + 1)).slice(-2);
      const day = ('0' + final.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    } else {
      return;
    }
  }

  getNavigationLinksWithRoutes(navLinks) {
    if (navLinks) {
      navLinks.forEach((process, i) => {
        const subFunctionalities = process.subFunctionalities;
        navLinks[i].route = `/subMenu/${process.name.toLowerCase()}`;
        subFunctionalities.forEach((subProcess, j) => {
          for (const navLink in NavConstants) {
            if (subProcess && subProcess.name && subProcess.name.toLowerCase() === navLink.split('_').join(' ').toLowerCase()) {
              navLinks[i].subFunctionalities[j].route = NavConstants[navLink];
              navLinks[i].subFunctionalities[j].content = Constants.subMenuContent[navLink];
            }
          }
        });
      });
      return navLinks;
    }
  }
  getQuantites(productsArrayList, totalCapacityPlanningByDay) {
    productsArrayList.forEach((product, i) => {
      totalCapacityPlanningByDay.forEach((tProduct, j) => {
        const eta = tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate
        const ordQuantity = tProduct.orderedQuantity ? tProduct.orderedQuantity : tProduct.quantity
        if (eta) {
          // tProduct.productQuantityList.forEach(uProduct => {
          if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day1.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day1.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day2.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day2.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day3.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day3.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day4.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day5.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day5.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day5.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day6.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day6.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day7.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day7.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day8.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day8.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day9.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day9.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day10.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day10.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day11.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day11.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day12.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day12.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day13.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day13.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day14.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day14.quantity = ordQuantity
          } else if (new Date(tProduct.eta ? tProduct.eta : tProduct.expectedDeliveryDate).getDate() === new Date(product.day15.date).getDate()
            && product.name === tProduct.productIDName) {
            productsArrayList[i].day15.quantity = ordQuantity
          }
          // });
        }
      });
    });
    return productsArrayList;
  }
  // getQuantites(productsArrayList, totalCapacityPlanningByDay) {
  //   productsArrayList.forEach((product, i) => {
  //     totalCapacityPlanningByDay.forEach((tProduct, j) => {
  //       if (tProduct.productQuantityList) {
  //         tProduct.productQuantityList.forEach(uProduct => {
  //           if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day1.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day1.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day2.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day2.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day3.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day3.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day4.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day5.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day5.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day5.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day6.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day6.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day7.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day7.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day8.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day8.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day9.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day9.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day10.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day10.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day11.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day11.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day12.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day12.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day13.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day13.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day14.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day14.quantity = uProduct.quantity;
  //           } else if (new Date(tProduct.deliveryDate).getDate() === new Date(product.day15.date).getDate()
  //             && product.name === uProduct.productIDName) {
  //             productsArrayList[i].day15.quantity = uProduct.quantity;
  //           }
  //         });
  //       }
  //     });
  //   });
  //   return productsArrayList;
  // }
  getQuantitesForYearWiseMonthWiseInventories(productsArrayList, data) {
    productsArrayList.forEach((product, i) => {
      data.forEach((tProduct, j) => {
        if (tProduct.productQuantityList) {
          tProduct.productQuantityList.forEach(uProduct => {
            if (tProduct.month === product.january.month && product.name === uProduct.productName) {
              productsArrayList[i].january.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.febuary.month && product.name === uProduct.productName) {
              productsArrayList[i].febuary.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.march.month && product.name === uProduct.productName) {
              productsArrayList[i].march.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.april.month && product.name === uProduct.productName) {
              productsArrayList[i].april.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.may.month && product.name === uProduct.productName) {
              productsArrayList[i].may.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.june.month && product.name === uProduct.productName) {
              productsArrayList[i].june.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.july.month && product.name === uProduct.productName) {
              productsArrayList[i].july.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.august.month && product.name === uProduct.productName) {
              productsArrayList[i].august.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.september.month && product.name === uProduct.productName) {
              productsArrayList[i].september.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.october.month && product.name === uProduct.productName) {
              productsArrayList[i].october.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.november.month && product.name === uProduct.productName) {
              productsArrayList[i].november.quantity = uProduct.productQuantity;
            } else if (tProduct.month === product.december.month && product.name === uProduct.productName) {
              productsArrayList[i].december.quantity = uProduct.productQuantity;
            }
          });
        }
      });
    });
    return productsArrayList;
  }
  getEquipmentAndExecutiveCount(arrayList, totalCapacityPlanningByDay, planingType) {
    let equipmentsAndExecutives = [];
    if (planingType === 'outbound') {
      equipmentsAndExecutives = ['equipmentRequired', 'equipmentAvailable', 'equipmentRemaining', 'executivesRequired',
        'executivesAvailable', 'executivesRemaining', 'vehiclesRequired', 'vehiclesAvailable', 'vehiclesRemaining'];
    } else {
      equipmentsAndExecutives = ['equipmentRequired', 'equipmentAvailable', 'equipmentRemaining', 'executivesRequired',
        'executivesAvailable', 'executivesRemaining'];
    }
    arrayList.forEach((product, i) => {
      totalCapacityPlanningByDay.forEach((data, j) => {
        if (data.equipmentRequired) {
          equipmentsAndExecutives.forEach(jdata => {
            if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day1.date).getDate()
              && product.name === jdata) {
              arrayList[i].day1.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day2.date).getDate()
              && product.name === jdata) {
              arrayList[i].day2.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day3.date).getDate()
              && product.name === jdata) {
              arrayList[i].day3.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day4.date).getDate()
              && product.name === jdata) {
              arrayList[i].day5.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day5.date).getDate()
              && product.name === jdata) {
              arrayList[i].day5.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day6.date).getDate()
              && product.name === jdata) {
              arrayList[i].day6.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day7.date).getDate()
              && product.name === jdata) {
              arrayList[i].day7.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day8.date).getDate()
              && product.name === jdata) {
              arrayList[i].day8.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day9.date).getDate()
              && product.name === jdata) {
              arrayList[i].day9.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day10.date).getDate()
              && product.name === jdata) {
              arrayList[i].day10.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day11.date).getDate()
              && product.name === jdata) {
              arrayList[i].day11.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day12.date).getDate()
              && product.name === jdata) {
              arrayList[i].day12.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day13.date).getDate()
              && product.name === jdata) {
              arrayList[i].day13.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day14.date).getDate()
              && product.name === jdata) {
              arrayList[i].day14.quantity = data[jdata];
            } else if (new Date(data.eta ? data.eta : data.expectedDeliveryDate).getDate() === new Date(product.day15.date).getDate()
              && product.name === jdata) {
              arrayList[i].day15.quantity = data[jdata];
            }
          });
        }
      });
    });
    return arrayList;
  }
}
