export class StorageType {
    _id: string;
    storageTypeCode: string;
    storageTypeDescription: string;
    organizationInfo: object;
    wareHouseInfo: object;

    constructor() {
        this._id = '';
        this.storageTypeCode = '';
        this.storageTypeDescription = '';
    }
}
export class organizationInfo {
    _id: string;
    organizationID: string;
    organizationName: string;
    organizationIDName: string;
    constructor() {
        this._id = '';
        this.organizationID = '';
        this.organizationName = '';
        this.organizationIDName = '';
    }
}