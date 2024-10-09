
export class TransporaterEntity {
    _id: string;
    TransporterID: string;
    TransporterName: string;
    TransporterIDName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pin: string;
    phoneNumber: string;
    country: string;
    status: string;
    emailID: string;
    spocName: string;
    spocNumber: string;
    spocEmailID: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    accountType: string;
    IFSCCode: string;
    bankAddress: string;


    constructor() {
        this.TransporterID = '';
        this.TransporterName = '';
        this.TransporterIDName = '';
        this.email = '';
        this.address = '';
        this.city = '';
        this.state = '';
        this.pin = '';
        this.phoneNumber = '';
        this.country = '';
        this.emailID = '';
        this.spocName = '';
        this.spocNumber = ''
        this.spocEmailID = '';
        this.bankName = '';
        this.accountNumber = '';
        this.accountType = '';
        this.IFSCCode = '';
        this.bankAddress = '';
        this.status = 'Active';
    }
}
