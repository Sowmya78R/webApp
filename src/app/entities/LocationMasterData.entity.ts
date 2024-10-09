import { WareHouseInfo } from './common/warehouse';
import { ZoneInfo } from './common/zone';
import { RackInfo } from './common/rack';
import { LevelInfo } from './common/level';
import { StorageType } from './common/storageType';
export class LocationMasterDataEntity {
  locationName: string;
  sequenceNumber: number;
  wareHouseInfo: any = new WareHouseInfo();
  zoneInfo: any = new ZoneInfo();
  rackInfo: any = new RackInfo();
  levelInfo: any = new LevelInfo();
  storageType: any = new StorageType();
  // column: any = { column: '' };
  columnInfo: any = {
    _id: '',
    columnName: ''
  }
  capacity: number;

  length: number;
  lengthUom: string;

  breadth: number;
  breadthUom: string;

  height: number;
  heightUom: string;

  weight: number;
  weightUom: string;

  volume: number;
  volumeUom: string;

  totalSpace: number;
  totalSpaceUom: string;

  usableSpace: number;
  usableSpaceUom: string;
  locationSpaceStatus: string;

  locationAvailability: string;
  allowableMaxDimension: number;
  allowableMaxDimensionUom: string;
  allowableWeight: number;
  allowableWeightUom: string;
  status: string;
  locationMerge: string;
  weightCheck: string;
  maxDimensionCheck: string;
  usableSpaceCheck: string;

  maxDimension: number;
  maxDimensionUom: string;
  position: string;
  constructor() {

    this.locationName = '';
    this.locationSpaceStatus = '';
    this.sequenceNumber = 0;
    this.maxDimension = 0;
    this.allowableMaxDimension = 0;
    this.allowableMaxDimensionUom = '';
    this.maxDimensionUom = '';
    this.length = 0;
    this.lengthUom = '';
    this.breadth = 0;
    this.breadthUom = '';
    this.height = 0;
    this.heightUom = '';
    this.weight = 0;
    this.weightUom = '';
    this.allowableWeight = 0;
    this.allowableWeightUom = '';
    this.allowableWeight = 0;
    this.allowableWeightUom = '';
    this.totalSpace = 0;
    this.totalSpaceUom = '';
    this.capacity = 0;
    this.locationMerge = '';
    this.usableSpace = 0;
    this.usableSpaceUom = '';
    this.locationAvailability = "true"
    this.status = 'Active';
    this.position = null;
    this.weightCheck = null;
    this.maxDimensionCheck = null;
    this.usableSpaceCheck = null;
  }
}