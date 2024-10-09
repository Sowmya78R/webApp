import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { CompleterData } from 'ng2-completer';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { BarcodeService } from 'src/app/services/barcode.service';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';
import { MetaDataService } from 'src/app/services/integration-services/metadata.service';
import { WMSService } from 'src/app/services/integration-services/wms.service';

@Component({
  selector: 'app-product-bconfig',
  templateUrl: './product-bconfig.component.html',
  styleUrls: ['./product-bconfig.component.scss']
})
export class ProductBConfigComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  productIdNames: CompleterData;
  productsData: any = [];
  formObj = this.configService.getGlobalpayload();
  unitCodes: CompleterData;
  overAllRecords: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTrigger2: any = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  deleteInfo: any;
  logoImage: any;
  @Output() emitTripSheet: any = new EventEmitter<any>();
  selectAllCheckboxValue: boolean = false;
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");

  totalItems: any;
  page: number = 1;
  itemsPerPage: any = 5;
  searchKey: any = null;

  constructor(private fb: FormBuilder, private configService: ConfigurationService,
    private wmsService: WMSService, private metaDataService: MetaDataService,
    private bService: BarcodeService, private toastr: ToastrService,
    private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,) {
    this.translate.use(this.language);
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.configService.forLanguage$.subscribe(data => {
      this.language = data;
      this.direction = (this.language == 'ar') ? "rtl" : "ltr";
      this.translate.use(this.language);
    })
    this.createForm();
    this.fetchAllProducts();
    this.fetchAllUnits();
    this.get();
  }

  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  createForm() {
    this.productForm = this.fb.group({
      "_id": null,
      "productMasterInfo": new FormBuilder().group({
        "productID": null,
        "productIDName": null,
        "productName": null,
        "productMasterID": null,
      }),
      "unitCode": null,
      "upcEANNumber": null,
      "createdDate": null,
      "lastUpdatedDate": null,
      "wareHouseInfo": this.configService.getWarehouse(),
      "organizationInfo": this.configService.getOrganization(),
    })
  }
  fetchAllProducts() {
    this.wmsService.fetchAllProducts(this.formObj).subscribe(
      (response) => {
        if (response && response.status === 0 && response.data.productMasters) {
          this.productsData = response.data.productMasters;
          this.productIdNames = this.productsData.map(x => x.productIDName);
        } else {
          this.productsData = [];
        }
      },
      (error) => {
        this.productsData = [];
      });
  }
  fetchAllUnits() {
    this.metaDataService.fetchAllUnits(this.formObj).subscribe(
      response => {
        if (response && response.status === 0 && response.data.units && response.data.units.length) {
          this.unitCodes = response.data.units.map(x => x.unitCode);
        }
      },
      error => {
      });
  }
  onSelectProduct(event) {
    if (event) {
      const filteredProduct = this.productsData.find(x => x.productIDName === event.originalObject);
      this.productForm.controls.productMasterInfo.patchValue(filteredProduct);
      this.productForm.controls.productMasterInfo['controls'].productMasterID.patchValue(filteredProduct._id);

    }
  }
  save() {
    const form = this.productForm.value;
    if (!form.upcEANNumber || (form.upcEANNumber && form.upcEANNumber.length == 12)) {
      this.bService.saveOrUpdateProductBarcode(form).subscribe(res => {
        if (res['status'] === 0 && res['data']['productBarcodeConfiguration']) {
          this.toastr.success("Saved Successfully");
          this.rerender();
          this.get();
          this.clear();
        }
      })
    }
    else {
      this.toastr.error('UPCEANNumber should be 12 digits');
    }
  }
  clear() {
    this.createForm();
  }
  get(page?) {
    // const form = {
    //   "organizationIDName": this.formObj.organizationIDName,
    //   "wareHouseIDName": this.formObj.wareHouseIDName,
    //   "page": page ? page : 1,
    //   "pageSize": this.itemsPerPage
    // }
    // this.bService.fetchAllProductsBarcodeWithPagination(form).subscribe(res => {
    //   // productBarcodeConfigurationBarcodePaginationResponse
    this.bService.fetchAllProductsBarcode(this.formObj).subscribe(res => {
      if (res['status'] === 0 && res['data']['productBarcodeConfigurations'].length > 0) {
        this.overAllRecords = res['data']['productBarcodeConfigurations'];
        this.overAllRecords.forEach(element => {
          element['isChecked'] = false;
        });
        this.dtTrigger.next();
      }
      else {
        this.overAllRecords = [];
        this.dtTrigger.next();
      }
    })
  }
  selectAllData(event) {
    this.bService.printArray = [];
    if (event.target.checked) {
      this.overAllRecords.forEach(element => {
        element.isChecked = true;
        this.bService.printArray.push(element);
      });
    }
    else {
      this.bService.printArray = [];
      this.overAllRecords.forEach(element => {
        element.isChecked = false;
      });
    }
  }
  read(event, data) {
    if (event.target.checked) {
      data.isChecked = true;
      this.bService.printArray.push(data);
    }
    else {
      data.isChecked = false;
      this.bService.printArray = this.bService.printArray.filter(x => x.upcEANNumber != data.upcEANNumber);
    }
    this.selectAllCheckboxValue = this.overAllRecords.every(function (item: any) {
      return item.isChecked == true;
    })
  }
  delete(id) {
    this.deleteInfo = { name: 'productBarcodeConfig', id: id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  getConfirmation(status) {
    if (status === 'Yes') {
      this.rerender();
      this.get();
    }
  }
  generatePDF() {
    console.log(this.bService.printArray);
    this.emitTripSheet.emit();
    setTimeout(() => {
      window.print();
    }, 300);
  }
}
