import { organizationInfo, StorageType } from './common/storageType';
export class WareHouseEntity {
    _id: string;
    wareHouseName: string;
    wareHouseIDName: string;
    capacity: string;
    // contactName: string;
    storageType: any = new StorageType();
    // email: string;
    // address: string;
    // city: string;
    // state: string;
    // pin: string;
    // phoneNumber: string;
    // country: string;
    status: string;
    organizationInfo: any = new organizationInfo();
    wareHouseID: any;
    height: number;
    wareHouseType: string;
    taxExemption: boolean;
    markupPercentage: number;
    panNumber: any;
    gstNumber: any;
    constructor() {
        this.wareHouseName = '';
        this.wareHouseIDName = '';
        this.capacity = '';
        // this.contactName = '';
        // this.email = '';
        // this.address = '';
        // this.city = '';
        // this.state = '';
        // this.pin = '';
        // this.phoneNumber = '';
        // this.country = '';
        this.status = 'Active';
        this.wareHouseID = '';
        this.wareHouseType = null;
        this.taxExemption = null;
        this.markupPercentage = null;
        this.gstNumber =null;
        this.panNumber = null;
    }
}
