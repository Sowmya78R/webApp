export class ZoneInfo {
    zoneID: string;
    zoneName: string;
    sequenceNumber: number;
    constructor() {
        this.zoneID = '';
        this.zoneName = '';
        this.sequenceNumber = 0;
    }
}

export class PickingStrategyEntity {
    _id: string;
    pickingStrategyName: string;
    pickingStrategyType: string;
    zoneInfo: any = new ZoneInfo();
    zoneInfos: Array<object>;
    "organizationInfo": {
        "_id": null,
        "organizationID": null,
        "organizationName": null,
        "organizationIDName": null
      };
      "wareHouseInfo": {
        "wareHouseMasterID": null,
        "wareHouseID": null,
        "wareHouseName": null,
        "wareHouseIDName": null
      }
    constructor() {
        this.pickingStrategyName = '';
        this.pickingStrategyType = '';
    }
}
