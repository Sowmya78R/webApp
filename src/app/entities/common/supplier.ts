export class SupplierMasterInfo {
    supplierMasterID: string;
    supplierID: string;
    supplierIDName: string;
    supplierName: string;
    constructor() {
        this.supplierMasterID = null;
        this.supplierID = null;
        this.supplierIDName = null;
        this.supplierName = null;
    }
}
export class taxGroup {
    _id: string;
    taxGroup: string;
    taxGroupDescription: string;
    constructor() {
        this._id = null;
        this.taxGroup = null;
        this.taxGroupDescription = null;
    }
}
export class organizationInfo {
    "_id": string;
    "organizationID": string;
    "organizationName": string;
    "organizationIDName": string
    constructor() {
        this._id = '';
        this.organizationID = '';
        this.organizationName = '';
        this.organizationIDName = '';
    }
}
export class wareHouseInfo {
    wareHouseMasterID: string;
    wareHouseID: string;
    wareHouseName: string;
    wareHouseIDName: string;
    constructor() {
        this.wareHouseMasterID = '';
        this.wareHouseID = '';
        this.wareHouseName = '';
        this.wareHouseIDName = '';
    }
}
export class wareHouseTransferSourceInfo {
    wareHouseTransferTransactionID: string;
    wareHouseID: string;
    wareHouseName: string;
    wareHouseIDName: string;
    wareHouseTransferMasterID: string;
    organizationIDName: string;
    organizationID: string;
    organizationName: string;
    fullWareHouseTransferTransactionID: string;
    wareHouseTransferTransactionIDPrefix: string;

    constructor() {
        this.wareHouseTransferTransactionID = null;
        this.wareHouseID = null;
        this.wareHouseName = null;
        this.wareHouseIDName = null;
        this.wareHouseTransferMasterID = null;
        this.organizationIDName = null;
        this.organizationID = null;
        this.organizationName = null;
        this.fullWareHouseTransferTransactionID = null;
        this.wareHouseTransferTransactionIDPrefix = null;
    }
}