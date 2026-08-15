import BaseRepository from '#repositories/base/base_repository';
import Castellany from '#models/castellany';

export default class CastellanyRepository extends BaseRepository<typeof Castellany> {
    constructor() {
        super(Castellany);
    }

    public async all(): Promise<Castellany[]> {
        return Castellany.query().orderBy('name', 'asc');
    }

    public async paginate(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string }) {
        const { page, perPage, sort, dir, search } = params;
        const allowedSorts: Record<string, string> = {
            name: 'name',
        };
        const sortColumn = allowedSorts[sort] ?? 'name';

        const q = Castellany.query().orderBy(sortColumn, dir);
        if (search) {
            q.whereILike('name', `%${search}%`);
        }
        return q.paginate(page, perPage);
    }

    public async findOrFail(id: string): Promise<Castellany> {
        return Castellany.findOrFail(id);
    }

    public async create(data: { name: string; commissionAmount: number; largeOrderFeeRate: number }): Promise<Castellany> {
        return Castellany.create({ name: data.name, commissionAmount: data.commissionAmount, largeOrderFeeRate: data.largeOrderFeeRate });
    }

    public async update(id: string, data: { name: string; commissionAmount: number; largeOrderFeeRate: number }): Promise<Castellany> {
        const castellany = await Castellany.findOrFail(id);
        castellany.name = data.name;
        castellany.commissionAmount = data.commissionAmount;
        castellany.largeOrderFeeRate = data.largeOrderFeeRate;
        await castellany.save();
        return castellany;
    }

    public async delete(id: string): Promise<void> {
        const castellany = await Castellany.findOrFail(id);
        await castellany.delete();
    }
}
