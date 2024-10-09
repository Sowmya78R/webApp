import { WareHouseInfo } from './common/warehouse';
import { StorageType } from './common/storageType'; 
import { SupplierMasterInfo } from './common/supplier';

export class ZoneMasterDataEntity {
    _id: string;
    zoneName: string;
    wareHouseInfo: any = new WareHouseInfo();
    storageType: any = new StorageType();
    supplierMasterInfo:any = new SupplierMasterInfo();
    capacity: number;
    status: string;
    height: number;
    width: number;
    sequence: number;
    xcoordinate: number;
    ycoordinate: number;
    constructor() {
        this.zoneName = '';
        this.capacity = 0;
        this.status = 'Active';
    }
}

