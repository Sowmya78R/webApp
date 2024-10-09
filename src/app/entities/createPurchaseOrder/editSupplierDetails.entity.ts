export class EditSupplierDetails {
    supplierID: string;
    supplierName: string;
    supplierEmailID: string;
    supplierType: string;
    city: string;
    state: string;
    country: string;
    email: string;
    constructor() {
        this.supplierID = '';
        this.supplierName = '';
        this.supplierEmailID = '';
        this.supplierType = null;
        this.city = '';
        this.state = '';
        this.country = null;
        this.email = '';
    }
}