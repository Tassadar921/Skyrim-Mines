import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import ResourceStock from '#models/resource_stock';

export default class ResourceStockRepository extends BaseRepository<typeof ResourceStock> {
    constructor() {
        super(ResourceStock);
    }

    public async all(): Promise<ResourceStock[]> {
        return ResourceStock.query();
    }

    public async setPurchasedQuantity(resourceId: string, quantity: number): Promise<ResourceStock> {
        const stock = await this.firstOrNew({ resourceId }, { resourceId, quantityPurchased: 0 });
        stock.quantityPurchased = quantity;
        await stock.save();
        return stock;
    }

    public async incrementPurchasedQuantity(resourceId: string, quantity: number, trx?: TransactionClientContract): Promise<void> {
        const stock = await this.firstOrNew({ resourceId }, { resourceId, quantityPurchased: 0 }, trx);
        stock.quantityPurchased += quantity;
        await stock.save();
    }
}
