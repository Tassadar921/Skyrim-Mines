import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import Resource from '#models/resource';
import type ResourceTypeEnum from '#types/enum/resource_type_enum';

export default class ResourceRepository extends BaseRepository<typeof Resource> {
    constructor() {
        super(Resource);
    }

    public async all(): Promise<Resource[]> {
        return Resource.query().orderBy('type', 'asc').orderBy('order', 'asc');
    }

    public async findOrFail(id: string): Promise<Resource> {
        return Resource.findOrFail(id);
    }

    public async create(data: { name: string; type: ResourceTypeEnum; buyPrice: string; sellPrice: string }): Promise<Resource> {
        const last = await Resource.query().where('type', data.type).orderBy('order', 'desc').first();

        return Resource.create({
            name: data.name,
            type: data.type,
            buyPrice: data.buyPrice,
            sellPrice: data.sellPrice,
            order: last ? last.order + 1 : 0,
        });
    }

    public async update(id: string, data: { name: string; type: ResourceTypeEnum; buyPrice: string; sellPrice: string }): Promise<Resource> {
        const resource = await Resource.findOrFail(id);
        resource.name = data.name;
        resource.type = data.type;
        resource.buyPrice = data.buyPrice;
        resource.sellPrice = data.sellPrice;
        await resource.save();
        return resource;
    }

    public async reorder(items: { id: string; order: number }[]): Promise<void> {
        await db.transaction(async (trx) => {
            for (const item of items) {
                await Resource.query({ client: trx }).where('id', item.id).update({ order: item.order });
            }
        });
    }

    public async delete(id: string): Promise<void> {
        const resource = await Resource.findOrFail(id);
        await resource.delete();
    }
}
