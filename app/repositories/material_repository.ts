import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import Material from '#models/material';

export default class MaterialRepository extends BaseRepository<typeof Material> {
    constructor() {
        super(Material);
    }

    public async all(): Promise<Material[]> {
        return Material.query().orderBy('order', 'asc');
    }

    public async paginate(params: { page: number; perPage: number; sort?: string; dir: 'asc' | 'desc'; search?: string }) {
        const { page, perPage, sort, dir, search } = params;
        const allowedSorts: Record<string, string> = {
            name: 'name',
        };
        const sortColumn = sort ? allowedSorts[sort] : undefined;

        const q = Material.query();
        if (search) {
            q.whereILike('name', `%${search}%`);
        }
        if (sortColumn) {
            q.orderBy(sortColumn, dir);
        } else {
            q.orderBy('order', 'asc');
        }
        return q.paginate(page, perPage);
    }

    public async findOrFail(id: string): Promise<Material> {
        return Material.findOrFail(id);
    }

    public async create(data: { name: string; buyPrice: string }): Promise<Material> {
        const last = await Material.query().orderBy('order', 'desc').first();

        return Material.create({
            name: data.name,
            buyPrice: data.buyPrice,
            order: last ? last.order + 1 : 0,
        });
    }

    public async update(id: string, data: { name: string; buyPrice: string }): Promise<Material> {
        const material = await Material.findOrFail(id);
        material.name = data.name;
        material.buyPrice = data.buyPrice;
        await material.save();
        return material;
    }

    public async reorder(items: { id: string; order: number }[]): Promise<void> {
        await db.transaction(async (trx) => {
            for (const item of items) {
                await Material.query({ client: trx }).where('id', item.id).update({ order: item.order });
            }
        });
    }

    public async delete(id: string): Promise<void> {
        const material = await Material.findOrFail(id);
        await material.delete();
    }
}
