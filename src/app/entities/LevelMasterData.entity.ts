import { RackInfo, ZoneInfo } from './common/rack';
import { StorageType } from './common/storageType';
export class LevelMasterDataEntity {
    _id: string;
    levelName: string;
    rackInfo: any = new RackInfo();
    zoneInfo: any = new ZoneInfo();
    storageType: any = new StorageType();
    capacity: number;
    status: string;
    columnHelpers: any;
    columns: [];
    constructor() {
        this.columnHelpers = [];
        this.status = 'Active';
    }
}
