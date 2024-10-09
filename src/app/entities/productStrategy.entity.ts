import { ProductCategoryInfo } from './common/productCategory';
import { PickingStrategyInfo } from './common/pickingStrategy';
import { PutawayStrategyInfo } from './common/putawayStrategy';
export class ProductStrategyEntity {
    _id: string;
    productCategoryInfo: any = new ProductCategoryInfo();
    putawayStrategyInfo: any = new PutawayStrategyInfo();
    pickingStrategyInfo: any = new PickingStrategyInfo();
    pickingStrategyType: string;
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
