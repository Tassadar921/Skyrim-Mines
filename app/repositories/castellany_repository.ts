import BaseRepository from '#repositories/base/base_repository';
import Castellany from '#models/castellany';

export default class CastellanyRepository extends BaseRepository<typeof Castellany> {
    constructor() {
        super(Castellany);
    }

    public async all(): Promise<Castellany[]> {
        return Castellany.query().orderBy('name', 'asc');
    }

    public async findOrFail(id: string): Promise<Castellany> {
        return Castellany.findOrFail(id);
    }

    public async create(data: { name: string; commissionRate: number; largeOrderFeeRate: number }): Promise<Castellany> {
        return Castellany.create({ name: data.name, commissionRate: data.commissionRate, largeOrderFeeRate: data.largeOrderFeeRate });
    }

    public async update(id: string, data: { name: string; commissionRate: number; largeOrderFeeRate: number }): Promise<Castellany> {
        const castellany = await Castellany.findOrFail(id);
        castellany.name = data.name;
        castellany.commissionRate = data.commissionRate;
        castellany.largeOrderFeeRate = data.largeOrderFeeRate;
        await castellany.save();
        return castellany;
    }

    public async delete(id: string): Promise<void> {
        const castellany = await Castellany.findOrFail(id);
        await castellany.delete();
    }
}
