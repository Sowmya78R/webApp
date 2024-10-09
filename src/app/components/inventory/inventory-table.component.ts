import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/services/integration-services/configuration.service';

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html'
})
export class InventoryTableComponent implements OnInit {
  arr: any = [
    { name: 'Inventory', link: '' },
    { name: 'InventorinventoryTablesy By Location', link: 'inventoryByLocation' },
    { name: 'Inventory By Product', link: 'inventoryByProduct' },
    { name: 'Inventory Product Totals', link: 'inventoryproductTotals' },
    { name: 'Inventory Transactions', link: 'inventoryTransaction' },
    { name: 'Inventory Transaction Details', link: 'inventoryTransactionDetails' },
    { name: 'Over All Inventory', link: 'overAllInventory' }]
  formObj = this.configService.getGlobalpayload();
  language = this.configService.language;
  direction = ((this.language == 'ar') ? "rtl" : "ltr");
  constructor(private router: Router, private configService: ConfigurationService,
    private translate: TranslateService,) { 
    this.translate.use(this.language);
  }
  ngOnInit() {
    const user =  JSON.parse(sessionStorage.getItem('dli-wms-user')).userPermissionFunctionalityInfo;
    const navLinks = (user.userPermissionWareHouseFunctionality.find(x => x.organizationInfo.organizationIDName == this.formObj.organizationIDName && x.wareHouseInfo.wareHouseIDName == this.formObj.wareHouseIDName)).mainFunctionalities;
    if (navLinks.length > 0) {
      const findObj = navLinks.find(x => x.name == 'Inventory');
      this.arr = [];
      if (findObj.subFunctionalities.find(x => x.name == 'Inventory')) {
        this.arr.push({ name: 'Inventory', link: 'lists/inventoryTables' });
      }
      if (findObj.subFunctionalities.find(x => x.name == 'Inventory by Location')) {
        this.arr.push({ name: 'Inventory By Location', link: 'lists/inventoryByLocation' });
      }
      if (findObj.subFunctionalities.find(x => x.name == 'Inventory by Product')) {
        this.arr.push({ name: 'Inventory By Product', link: 'lists/inventoryByProduct' });
      }
      if (findObj.subFunctionalities.find(x => x.name == 'Inventory Item Totals')) {
        this.arr.push({ name: 'Inventory Product Totals', link: 'lists/inventoryproductTotals' });
      }
      if (findObj.subFunctionalities.find(x => x.name == 'Inventory Transactions')) {
        this.arr.push({ name: 'Inventory Transactions', link: 'lists/inventoryTransaction' });
      }
      if (findObj.subFunctionalities.find(x => x.name == 'Inventory Transactions Details')) {
        this.arr.push({ name: 'Inventory Transaction Details', link: 'lists/inventoryTransactionDetails' });
      }
      if (findObj.subFunctionalities.find(x => x.name == "Over All Inventory")) {
        this.arr.push({ name: "Over All Inventory", link: 'lists/overAllInventory' });
      }

      if (this.router.url.split('/')[4]) {
        this.router.navigate(['/v1/inventory/lists/' + this.router.url.split('/')[4]]);
      }
      else {
        this.router.navigate(['/v1/inventory/' + this.arr[0].link]);
      }
      this.configService.forLanguage$.subscribe(data => {
        this.language = data;
        this.direction = (this.language == 'ar') ? "rtl" : "ltr";
        this.translate.use(this.language);
      })
    }

    console.log(this.arr);
  }
}
