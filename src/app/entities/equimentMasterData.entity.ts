
export class EquimentEntity {
    _id: string;
    equipmentName: string;
    equipmentIDName:string;
    equipmentType: string;
    noofShifts: string;
    hoursPerShift: number;
    daysCapacity: number;
    noOfDaysPerWeek: number;
    weeklyCapacity: number;
    length: number;
    uomLength:string;
    width: number;
    uomWidth:string;
    height: number;
    uomHeight:string;
    volume: number;
    uomVolume:string;
    weight: number;
    uomWeight:string;
    utilization: string;
    efficiency: number;
    sequenceNumber: number;
    equipmentRate: number;
    status: string = 'Active';
    constructor()
    {
       
    }
}
