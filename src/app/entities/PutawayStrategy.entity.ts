import { ZoneInfo } from './common/zone';
export class PutawayStrategyEntity {
    _id: string;
    putawayStrategyName: string;
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
}
