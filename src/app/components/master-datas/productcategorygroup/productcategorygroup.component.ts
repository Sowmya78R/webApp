import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/constants/constants';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { ExcelRestService } from 'src/app/services/integration-services/excel-rest.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { Storage } from '../../../shared/utils/storage';

@Component({
  selector: 'app-productcategorygroup',
  templateUrl: './productcategorygroup.component.html',
  styleUrls: ['./productcategorygroup.component.scss']
})
export class ProductcategorygroupComponent implements OnInit {

  permissionsList = this.configService.getPermissions('mainFunctionalitiesForMasters', 'Master', 'Product Category Group', Storage.getSessionUser());
  arr1: any = []
  isSub2Disable: boolean = false
  isSub3Disable: boolean = false
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;


  productCategoryGroupForm: FormGroup;
  focusedElement: any;
  thirdArr: any = [];
  firstArr: any[];
  secondArr: any[];
  firstLevel: any = [];
  secondLevel: any = [];
  firstValue = []
  updatedData: any = [];
  exisitingRecord: any = null;
  isShowOrHideError: any = false;
  missingParams: string;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private configService: ConfigurationService, public ngxSmartModalService: NgxSmartModalService,
    private toastr: ToastrService, private excelService: ExcelService,
    private metaDataService: MetaDataService, private fb: FormBuilder, private excelRestService: ExcelRestService,
    private wmsService: WMSService,
    private translate: TranslateService,) { 
      this.translate.use(this.language);
    }

  subCategory1ListIDs: any = []
  subCategory2ListIDs: any = []
  subCategory3ListIDs: any = []
  formObj = this.configService.getGlobalpayload();
  failureRecords: any = []
  dropdownSettings = {};
  deleteInfo: any = { name: null, id: null, subID: null };
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      language: {
        lengthMenu: 'Show _MENU_ Entries',
      }
    };
    this.dropdownSettings = {
      multiselect: false,
      singleSelection: false,
      idField: '_id',
      textField: 'column',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createproductCategoryGroupForm();
    this.fetchingCommonSubCategory1s();
    this.fetchingCommonSubCategory2s();
    this.fetchingCommonSubCategory3s();
    this.fetchAllProductCategories();
    this.fetchAllProductCategoryGroupsDetails();
  }
  createproductCategoryGroupForm() {
    this.productCategoryGroupForm = this.fb.group({
      "_id": null,
      "productCategoryName": null,
      "hierarchyLevel": 0,
      childProductSubCategories: null,
      dummySub1: null,
      dummySub2: null,
      dummySub3: null,
      // productSubCategory2Names: [null],
      // productSubCategory3Names: [null],
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse()
    })
  }
  getSelectedValue(event) {
    const form = this.productCategoryGroupForm.value
    form.productCategoryName = event.originalObject
    form.hierarchyLevel = 0
    console.log(form)
  }
  getData() {
    const form = this.productCategoryGroupForm.value
    console.log(form)
  }
  onFocusForElement(element) {
    if (this.focusedElement !== element) {
      this.focusedElement = element;
    }
  }
  onFocusOutForElement() {
    this.focusedElement = undefined;
  }
  productSubCategory1Names: any = []
  productSubCategory2Names: any = []
  productSubCategory3Names: any = []

  productSubCategoryone = [];

  fetchingCommonSubCategory1s() {
    this.metaDataService.fetchAllCommonSubCategory1s(this.formObj).subscribe(
      response => {
        console.log(response);
        if (response && response.status === 0 && response.data.productSubCategory1s) {
          this.subCategory1ListIDs = response.data.productSubCategory1s.map(x => x.productSubCategory1Name);
        }
      })
  }
  fetchingCommonSubCategory2s() {
    this.metaDataService.fetchAllCommonSubCategory2s(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory2s) {
          this.subCategory2ListIDs = response.data.productSubCategory2s.map(x => x.productSubCategory2Name);
        }
      })
  }
  fetchingCommonSubCategory3s() {
    this.metaDataService.fetchAllCommonSubCategory3s(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.productSubCategory3s) {
          this.subCategory3ListIDs = response.data.productSubCategory3s.map(x => x.productSubCategory3Name);
        }
      })
  }
  productCategoriesIDa: CompleterData
  fetchAllProductCategories() {
    this.wmsService.fetchAllProductCategories(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategories && response.data.productCategories.length > 0) {
          this.productCategoriesIDa = response.data.productCategories.map(product => product.productCategoryName)
        } else {

        }
      },
      (error) => {
      });
  }
  getUpdatedData(event: any) {
    if (event) {
      const form = this.productCategoryGroupForm.value
      let data = this.productCategoryGroupsResponseList.filter(k => k.productCategoryName === form.productCategoryName)
      this.firstLevel = []

      if (data[0]) {
        this.updatedData = data[0]
        this.productCategoryGroupForm.patchValue(data[0])
        data[0].childProductSubCategories.forEach(ele => {
          this.firstLevel.push(ele.productSubCategoryName)
          this.secondLevel = []
          if (ele.childProductSubCategories && ele.childProductSubCategories.length > 0) {
            ele.childProductSubCategories.forEach(s => {
              this.secondLevel.push(s.productSubCategoryName)
              let thirdArr: any = []
              if (s.childProductSubCategories && s.childProductSubCategories.length > 0) {
                s.childProductSubCategories.forEach(m => {
                  thirdArr.push(m.productSubCategoryName)
                })
                //  this.productCategoryGroupForm.controls.dummySub3.setValue(thirdArr)
              }
            })
            //this.productCategoryGroupForm.controls.dummySub2.setValue(this.secondLevel)
          }
        })
        this.productCategoryGroupForm.controls.dummySub1.setValue(this.firstLevel)
      }
    }
  }

  getSub2DropdownDisable() {
    const form = this.productCategoryGroupForm.value;
    if (form.dummySub1 != null && form.dummySub1.length > 1) {
      this.isSub2Disable = true;
      this.isSub3Disable = true;
      this.productCategoryGroupForm.controls.dummySub2.setValue(null);
      this.productCategoryGroupForm.controls.dummySub3.setValue(null);
    } else {
      this.isSub2Disable = false;
      this.isSub3Disable = false;
      if (form.dummySub1 && form.dummySub1.length == 1) {
        const child = this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == form.dummySub1[0]);
        if (child) {
          this.productCategoryGroupForm.controls.dummySub2.setValue(child.childProductSubCategories.map(x => x.productSubCategoryName));
          this.getSub3DropdownDisable();
        }
        else {
          this.productCategoryGroupForm.controls.dummySub2.setValue(null);
          this.productCategoryGroupForm.controls.dummySub3.setValue(null);
          // this.isSub2Disable = false;
          // this.isSub3Disable = false;
        }
      }
      else if (form.dummySub1 == null || form.dummySub1.length == 0) {
        this.productCategoryGroupForm.controls.dummySub2.setValue(null);
        this.productCategoryGroupForm.controls.dummySub3.setValue(null);
        this.isSub2Disable = true;
        this.isSub3Disable = true;
      }
    }
  }
  getSub3DropdownDisable() {
    const data = this.productCategoryGroupForm.value;
    if (data.dummySub2 != null && data.dummySub2.length > 1) {
      this.isSub3Disable = true;
      this.productCategoryGroupForm.controls.dummySub3.setValue(null);
    } else {
      if (data.dummySub2 == null || data.dummySub2.length == 0) {
        this.isSub3Disable = true;
        this.productCategoryGroupForm.controls.dummySub3.setValue(null);
      }
      else if (data.dummySub2.length == 1) {
        this.isSub3Disable = false;
        const child = this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == data.dummySub1[0]);
        if (child) {
          const child1 = child.childProductSubCategories.find(x => x.productSubCategoryName == data.dummySub2[0]);
          if (child1 && child1.childProductSubCategories) {
            this.productCategoryGroupForm.controls.dummySub3.setValue(child1.childProductSubCategories.map(x => x.productSubCategoryName));
            this.isSub3Disable = false;
          }
          else {
            this.productCategoryGroupForm.controls.dummySub3.setValue(null);
            // this.isSub3Disable = true;
          }
        }
        else {
          this.productCategoryGroupForm.controls.dummySub3.setValue(null);
          // this.isSub3Disable = true;
        }

      }
      else {
        this.isSub3Disable = false;
      }
    }
  }
  dataFraming() {
    const form = this.productCategoryGroupForm.value
    this.thirdArr = []
    if (form.dummySub3 && form.dummySub3.length > 0) {
      form.dummySub3.forEach((ele, i) => {
        let obj = {}
        obj['_id'] = null;
        obj['hierarchyLevel'] = 3
        obj['productSubCategoryName'] = ele;
        obj['childProductSubCategories'] = null;
        this.thirdArr.push(obj)
      })
    } else {
      this.thirdArr = null
    }
    this.secondArr = []
    if (form.dummySub2 && form.dummySub2.length > 0) {
      form.dummySub2.forEach((ele, i) => {
        // let _idObj = null;
        // if (this.exisitingRecord) {
        //   this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == ele);
        // }
        let obj = {}
        // obj['_id'] = _idObj ? _idObj._id : null;
        obj['hierarchyLevel'] = 2
        obj['productSubCategoryName'] = ele
        obj['childProductSubCategories'] = this.thirdArr
        this.secondArr.push(obj)
      })
    } else {
      this.secondArr = null
    }
    this.firstArr = []
    if (form.dummySub1 && form.dummySub1.length > 0) {
      form.dummySub1.forEach((ele, i) => {
        let _idObj = null;
        if (this.exisitingRecord) {
          _idObj = this.exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == ele);
        }
        let obj = {}
        obj['_id'] = _idObj ? _idObj._id : null;
        obj['hierarchyLevel'] = 1
        obj['productSubCategoryName'] = ele
        obj['childProductSubCategories'] = this.secondArr
        this.firstArr.push(obj)
      })
      this.productCategoryGroupForm.controls.childProductSubCategories.setValue(this.firstArr)
    }
    delete form.dummySub1
    delete form.dummySub2
    delete form.dummySub3
  }
  save() {
    if ((this.permissionsList.includes("Update") && this.globalIDs) || (this.permissionsList.includes("Create") && !this.globalIDs)) {
    this.dataFraming()
    const form = this.productCategoryGroupForm.value;
    delete form.dummySub1
    delete form.dummySub2
    delete form.dummySub3
    form._id = this.exisitingRecord ? this.exisitingRecord._id : null;
    if (form._id) {
      if ((this.exisitingRecord.childProductSubCategories[0].productSubCategoryName == form.childProductSubCategories[0].productSubCategoryName) && this.exisitingRecord.childProductSubCategories[0].childProductSubCategories) {
        const newOnes = form.childProductSubCategories[0].childProductSubCategories.map(x => x.productSubCategoryName);
        this.exisitingRecord.childProductSubCategories[0].childProductSubCategories.forEach(ele => {
          if (newOnes.includes(ele.productSubCategoryName)) {
            form.childProductSubCategories[0].childProductSubCategories.forEach(child1 => {
              if (ele.productSubCategoryName == child1.productSubCategoryName) {
                let child2: any = null;
                if (child1.childProductSubCategories && ele.childProductSubCategories) {
                  child2 = [...child1.childProductSubCategories, ...ele.childProductSubCategories];
                }
                else if (!child1.childProductSubCategories) {
                  child2 = ele.childProductSubCategories;
                }
                else if (!ele.childProductSubCategories) {
                  child2 = child1.childProductSubCategories;
                }


                // Declare a new array
                let newArray = [];

                // Declare an empty object
                let uniqueObject = {};

                // Loop for the array elements
                for (let i in child2) {

                  // Extract the title
                  let objTitle = child2[i]['productSubCategoryName'];

                  // Use the title as the index
                  uniqueObject[objTitle] = child2[i];
                }

                // Loop to push unique object into array
                for (let i in uniqueObject) {
                  newArray.push(uniqueObject[i]);
                }

                // Display the unique objects
                console.log(newArray);
                // }


                child1.childProductSubCategories = newArray
              }
            });
          }
          else {
            form.childProductSubCategories[0].childProductSubCategories.push(ele);
          }
        });
      }
      // console.log(form);
      this.wmsService.updateProductCategorygroup(form).subscribe((response) => {
        if (response && response.status === 0 && response.data.productCategoryGroup) {
          this.toastr.success(response.statusMsg);
          this.fetchAllProductCategoryGroupsDetails();
          this.clear();
        }
      })
    } else {
      this.wmsService.saveProductCategorygroup(form).subscribe((response) => {
        if (response && response.status === 0 && response.data.productCategoryGroup) {
          this.toastr.success(response.statusMsg);
          this.fetchAllProductCategoryGroupsDetails();
          this.clear();
        }
      })
    }
  }
  else {
    this.toastr.error("User doesn't have Permissions.")
  }
  this.globalIDs = null
  }
  clear() {
    this.productCategoryGroupForm.reset();
    this.isSub2Disable = false
    this.isSub3Disable = false
    // this.subCategory1ListIDs = []
    // this.subCategory2ListIDs = []
    // this.subCategory3ListIDs = []
    this.createproductCategoryGroupForm();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  productCategoryGroupsResponseList: any = []
  fetchAllProductCategoryGroupsDetails() {
    this.wmsService.fetchAllProductCategoryGroups(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productCategoryGroups && response.data.productCategoryGroups) {
          this.productCategoryGroupsResponseList = response.data.productCategoryGroups
          this.rerender();
        } else {
          this.productCategoryGroupsResponseList = []
        }
      })
  }
  getSelectedCategory(event) {
    if (event) {
      const exisitingRecord = this.productCategoryGroupsResponseList.find(x => x.productCategoryName == event.originalObject);
      this.exisitingRecord = exisitingRecord;
      if (exisitingRecord) {
        this.productCategoryGroupForm.controls.dummySub1.setValue(exisitingRecord.childProductSubCategories.map(x => x.productSubCategoryName));
        this.getSub2DropdownDisable();
        if (this.productCategoryGroupForm.controls.dummySub1.value.length == 1) {
          const exisitingChild1Record = exisitingRecord.childProductSubCategories.find(x => x.productSubCategoryName == this.productCategoryGroupForm.controls.dummySub1.value[0]);
          if (exisitingChild1Record && exisitingChild1Record.childProductSubCategories) {
            this.productCategoryGroupForm.controls.dummySub2.setValue(exisitingChild1Record.childProductSubCategories.map(x => x.productSubCategoryName));
            this.getSub3DropdownDisable();
            if (this.productCategoryGroupForm.controls.dummySub2.value.length == 1) {
              const exisitingChild2Record = exisitingChild1Record.childProductSubCategories.find(x => x.productSubCategoryName == this.productCategoryGroupForm.controls.dummySub2.value[0]);
              if (exisitingChild2Record && exisitingChild2Record.childProductSubCategories) {
                this.productCategoryGroupForm.controls.dummySub3.setValue(exisitingChild2Record.childProductSubCategories.map(x => x.productSubCategoryName));
              }
            }
          }
        }
      }
    }
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  id: any;
  globalIDs:any;
  edit(data) {
    this.globalIDs=data._id

    this.productCategoryGroupForm.patchValue(data);
    let firstArr: any = []
    let thisrdArr: any = []
    let secondArr: any = []
    if (data.childProductSubCategories.length > 0) {
      data.childProductSubCategories.forEach(ele => {
        firstArr.push(ele.productSubCategoryName)
        if (ele.childProductSubCategories != null && ele.childProductSubCategories.length > 0) {
          ele.childProductSubCategories.forEach(s => {
            secondArr.push(s.productSubCategoryName)
            if (s.childProductSubCategories != null && s.childProductSubCategories.length > 0) {
              s.childProductSubCategories.forEach(m => {
                thisrdArr.push(m.productSubCategoryName)
              })
              this.productCategoryGroupForm.controls.dummySub3.setValue(thisrdArr)
            } else {
              this.productCategoryGroupForm.controls.dummySub3.setValue(null)
            }
          })
          this.productCategoryGroupForm.controls.dummySub2.setValue(secondArr)
        } else {
          this.productCategoryGroupForm.controls.dummySub2.setValue(null)
        }
      })
      this.productCategoryGroupForm.controls.dummySub1.setValue(firstArr)
    } else {
      this.productCategoryGroupForm.controls.dummySub1.setValue(null)
    }
  }

  delete(data: any, sub?) {
    this.deleteInfo = { name: 'productCategoryGroup', id: data._id, subID: (sub ? sub._id : null) };
    this.ngxSmartModalService.getModal('deletePopup').open();

  }
  delete1(header, childIndex?, child1Index?, child2Index?) {
    if ((child2Index || child2Index == 0)) {
      header.childProductSubCategories[childIndex].childProductSubCategories[child1Index].childProductSubCategories.splice(child2Index, 1);
    }
    else if (!child2Index && (child1Index || child1Index == 0)) {
      header.childProductSubCategories[childIndex].childProductSubCategories.splice(child1Index, 1);
    }
    else if (!child2Index && !child1Index && (childIndex || childIndex == 0)) {
      header.childProductSubCategories.splice(childIndex, 1);
    }
    this.wmsService.updateProductCategorygroup(header).subscribe((response) => {
      if (response && response.status === 0 && response.data.productCategoryGroup) {
        this.toastr.success("Deleted Successfully");
        this.fetchAllProductCategoryGroupsDetails();
        this.clear();
      }
    })
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.fetchAllProductCategoryGroupsDetails();
    }
  }
  afterUsingClear() {
    return {
      "organizationInfo": this.configService.getOrganization(),
      "wareHouseInfo": this.configService.getWarehouse()
    }
  }
  exportAsXLSX() {
    const changedTaskList = this.exportTypeMethod(this.productCategoryGroupsResponseList)
    this.excelService.exportAsExcelFile(changedTaskList, 'Product Category group', null)
  }
  // exportTypeMethod(data) {
  //   const arr = [];
  //   if (data && data.length > 0) {
  //     data.forEach(ele => {
  //       let obj = {}
  //       let firstArr: any = []
  //       obj['productCategoryName'] = ele.productCategoryName
  //       if (ele.childProductSubCategories && ele.childProductSubCategories.length > 0) {
  //         ele.childProductSubCategories.forEach(s => {
  //           firstArr.push(s.productSubCategoryName)
  //         })
  //       }
  //       let secondArr = []
  //       if (ele.childProductSubCategories && ele.childProductSubCategories.length > 0) {
  //         ele.childProductSubCategories.forEach(s => {
  //           if (s.childProductSubCategories && s.childProductSubCategories.length > 0) {
  //             s.childProductSubCategories.forEach(m => {
  //               secondArr.push(m.productSubCategoryName)
  //             })
  //           }
  //         })
  //       }
  //       let thirdArr = []
  //       if (ele.childProductSubCategories && ele.childProductSubCategories.length > 0) {
  //         ele.childProductSubCategories.forEach(s => {
  //           if (s.childProductSubCategories && s.childProductSubCategories.length > 0) {
  //             s.childProductSubCategories.forEach(m => {
  //               if (m.childProductSubCategories && m.childProductSubCategories.length > 0) {
  //                 m.childProductSubCategories.forEach(n => {
  //                   thirdArr.push(n.productSubCategoryName)
  //                 })
  //               }
  //             })
  //           }
  //         })
  //       }
  //       let a: any
  //       if (firstArr && firstArr.length > 0) {
  //         a = firstArr.join(",")
  //       } else {
  //         a = null
  //       }
  //       let b: any
  //       if (secondArr && secondArr.length > 0) {
  //         b = secondArr.join(",")
  //       } else {
  //         b = null
  //       }
  //       let c: any
  //       if (thirdArr && thirdArr.length > 0) {
  //         c = thirdArr.join(",")
  //       } else {
  //         c = null
  //       }
  //       obj['subCategory1'] = a
  //       obj['subCategory2'] = b
  //       obj['subCategory3'] = c
  //       arr.push(obj)
  //     })
  //   } else {
  //     let obj = {}
  //     obj['productCategoryName'] = null
  //     obj['subCategory1'] = null
  //     obj['subCategory2'] = null
  //     obj['subCategory3'] = null
  //     arr.push(obj)
  //   }
  //   console.log(arr)
  //   return arr
  // }
  exportTypeMethod(data) {
    const arr = [];
    if (data && data.length > 0) {
      data.forEach((ele, z) => {
        if (ele.childProductSubCategories && ele.childProductSubCategories.length > 0) {
          ele.childProductSubCategories.forEach((el, o) => {
            if (el.childProductSubCategories && el.childProductSubCategories.length > 0) {
              el.childProductSubCategories.forEach((m, n) => {
                if (m.childProductSubCategories && m.childProductSubCategories.length > 0) {
                  m.childProductSubCategories.forEach((s, i) => {
                    if (i === 0) {
                      let obj = {}
                      obj['productCategoryName'] = (o == 0 && n == 0) ? ele.productCategoryName : null
                      obj['subCategory1'] = (n == 0) ? el.productSubCategoryName : null
                      obj['subCategory2'] = m.productSubCategoryName
                      obj['subCategory3'] = s.productSubCategoryName
                      arr.push(obj)
                    } else {
                      let obj = {}
                      obj['productCategoryName'] = null
                      obj['subCategory1'] = null
                      obj['subCategory2'] = null
                      obj['subCategory3'] = s.productSubCategoryName
                      arr.push(obj)
                    }
                  })
                } else {
                  if (n === 0) {
                    let obj = {}
                    obj['productCategoryName'] = ele.productCategoryName
                    obj['subCategory1'] = el.productSubCategoryName
                    obj['subCategory2'] = m.productSubCategoryName
                    obj['subCategory3'] = null
                    arr.push(obj)
                  } else {
                    let obj = {}
                    obj['productCategoryName'] = null
                    obj['subCategory1'] = null
                    obj['subCategory2'] = m.productSubCategoryName
                    obj['subCategory3'] = null
                    arr.push(obj)
                  }
                }
              })
            } else {
              console.log(ele.childProductSubCategories.length)
              if (o === 0) {
                let obj = {}
                obj['productCategoryName'] = ele.productCategoryName
                obj['subCategory1'] = el.productSubCategoryName
                obj['subCategory2'] = null
                obj['subCategory3'] = null
                arr.push(obj)
              } else {
                let obj = {}
                obj['productCategoryName'] = null
                obj['subCategory1'] = el.productSubCategoryName
                obj['subCategory2'] = null
                obj['subCategory3'] = null
                arr.push(obj)
              }
            }
          })
        }
      })
    }
    console.log(arr)
    return arr
  }
  getFile() {
    document.getElementById('upfile').click();
  }
  uploadExcel = async (event) => {
    if (event.target.files && event.target.files[0]) {
      this.isShowOrHideError = false;
      await this.excelService.generateJsonUsingExcel(event);

    }
  }
  mandatoryCheckForHeaderLines(data) {
    const missingParamsArray = ['Please refer below to enter mandatory fields for each row in excel sheet \n'];
    if (data && data.length > 0) {
      let record = data[0];
      const requiredParams = Constants.UPLOAD_MANDAT_FIELDS.PRODUCT_BY_CUSTOMER
      const missingParams = requiredParams.filter((param: any) => !(!!record[param]));
      if (missingParams.length > 0) {
        missingParamsArray.push(`Row No. ${1} - ${missingParams.join(', ').replace(',', ' ')} \n`);
      }

    }
    return missingParamsArray;
  }

  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };
  dyanmicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement("a");
    }
    const element = this.setting.element.dynamicDownload;
    const fileType =
      arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
    element.setAttribute(
      "href",
      `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
    );
    element.setAttribute("download", arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
  getSub1Framing(k) {
    if (k.subCategory1) {
      const subArr = k.subCategory1.replace(/\, /gi, ',').split(',');
      console.log(subArr)
      return subArr;
    } else {
      const subArr = null;
      return subArr;
    }
  }
  getSub2Framing(k) {
    if (k.subCategory2) {
      const subArr = k.subCategory2.replace(/\, /gi, ',').split(',');
      console.log(subArr)
      return subArr;
    } else {
      const subArr = null;
      return subArr;
    }
  }
  getSub3Framing(k) {
    if (k.subCategory3) {
      const subArr = k.subCategory3.replace(/\, /gi, ',').split(',');
      console.log(subArr)
      return subArr;
    } else {
      const subArr = null;
      return subArr;
    }
  }
}
