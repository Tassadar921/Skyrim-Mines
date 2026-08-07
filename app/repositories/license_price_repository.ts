import BaseRepository from '#repositories/base/base_repository';
import LicensePrice from '#models/license_price';

export default class LicensePriceRepository extends BaseRepository<typeof LicensePrice> {
    constructor() {
        super(LicensePrice);
    }

    public async get(): Promise<LicensePrice> {
        return LicensePrice.firstOrCreate({}, { citizenPrice: '0', nonCitizenPrice: '0' });
    }

    public async update(data: { citizenPrice: number; nonCitizenPrice: number }): Promise<LicensePrice> {
        const prices = await this.get();
        prices.citizenPrice = String(data.citizenPrice);
        prices.nonCitizenPrice = String(data.nonCitizenPrice);
        await prices.save();
        return prices;
    }
}
