import { ZoneInfo } from './common/zone';
import { StorageType } from './common/storageType';
export class RackMasterDataEntity {
    _id: string;
    rackName: string;
    zoneInfo: any = new ZoneInfo();
    storageType: any = new StorageType();
    capacity: number;
    status: string;
    columnHelpers: any;
    mode: string;
    height: number;
    width: number;
    sequence: number;
    columnDirection:string;
    xcoordinate: number;
    ycoordinate: number;

    constructor() {
        this.rackName = '';
        this.capacity = 0;
        this.status = 'Active';
        this.columnHelpers= [];
        this.mode = null;
    }
}