import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { WMSService } from 'src/app/services/integration-services/wms.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-abcgroup',

  templateUrl: './abcgroup.component.html',
  styleUrls: ['./abcgroup.component.scss']
})
export class AbcgroupComponent implements OnInit {
  deleteInfo:any;
  statuss: any = ['Active', 'In Active'];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  abcGroupForm:FormGroup;
  abcGroupsList: any;
  id:any;
  constructor(private fb:FormBuilder,
    private wmsService:WMSService,private toastr:ToastrService,private ngxSmartModalService:NgxSmartModalService) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
    };
    this.createAbcGroupForm();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  clear()
  {
    this.id = '';
    this.abcGroupForm.reset();
   // this.abcGroupForm.get('status').setValue('Active');
  }


  fetchAllAbcGroup() {
    this.wmsService.fetchAllAbcGroup().subscribe(response => {
      if (response && response.status === 0 && response.data.abcGroups) {
        this.abcGroupsList = response.data.abcGroups;
        this.dtTrigger.next();
      } else {
        this.abcGroupsList = [];
      }
    }, error => {
      this.abcGroupsList = [];
    });
  }
  edit(data)
  {
    this.id = data._id;
    this.abcGroupForm.patchValue(data);
    window.scroll(0, 0);
    this.abcGroupForm.get('status').patchValue('Active');
  }
  delete(data)
  {
    this.deleteInfo = { name: 'abcGroup', id: data._id };
    this.ngxSmartModalService.getModal('deletePopup').open();
  }
  createAbcGroupForm()
  {
    this.abcGroupForm=this.fb.group({
      abcGroup:[''],
      className:[''],
      classDescription:[''],
      priority:[''],
      status:['']
    })  
  }
  saveAbcGroup() {
    if (this.id) {
      this.abcGroupForm.value._id = this.id;
    }
    this.wmsService.saveOrUpdateServiceProvider(JSON.stringify(this.abcGroupForm.value)).subscribe(
      (response) => {
        if (response && response.status === 0) {
          this.abcGroupForm.reset();
          this.fetchAllAbcGroup();
          this.toastr.success("Abc Group details Saved");
        } else if (response && response.status === 2 && response.statusMsg) {
          this.toastr.error(response.statusMsg);
        } else {
          this.toastr.error('Failed in updating Abc Group details.');
        }
      },
      (error) => {
        this.toastr.error('Failed in updating Abc Group details.');
      }
    );
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
      dtInstance.destroy();
    });
  }


}
