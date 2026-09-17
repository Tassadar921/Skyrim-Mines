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

    private static readonly EMPTY_STOCK = { quantityPurchased: 0 };

    public async incrementPurchasedQuantity(resourceId: string, quantity: number, trx?: TransactionClientContract): Promise<void> {
        const stock = await this.firstOrNew({ resourceId }, { resourceId, ...ResourceStockRepository.EMPTY_STOCK }, trx);
        stock.quantityPurchased += quantity;
        await stock.save();
    }

    public async overrideQuantities(overrides: { resourceId: string; quantityPurchased: number }[], trx?: TransactionClientContract): Promise<void> {
        for (const { resourceId, quantityPurchased } of overrides) {
            const stock = await this.firstOrNew({ resourceId }, { resourceId, ...ResourceStockRepository.EMPTY_STOCK }, trx);
            stock.quantityPurchased = quantityPurchased;
            await stock.save();
        }
    }
}
