import BaseRepository from '#repositories/base/base_repository';
import CastellanyTax from '#models/castellany_tax';

export default class CastellanyTaxRepository extends BaseRepository<typeof CastellanyTax> {
    constructor() {
        super(CastellanyTax);
    }

    public async get(): Promise<CastellanyTax> {
        return CastellanyTax.firstOrCreate({}, { rate: 0 });
    }

    public async update(rate: number): Promise<CastellanyTax> {
        const tax = await this.get();
        tax.rate = rate;
        await tax.save();
        return tax;
    }
}
