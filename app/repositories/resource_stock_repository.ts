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

    private static readonly EMPTY_STOCK = { quantityPurchased: 0, quantityPurchasedSoljund: 0, quantityBarrelSoljund: 0 };

    public async incrementPurchasedQuantity(resourceId: string, quantity: number, soljundQuantity: number = 0, trx?: TransactionClientContract): Promise<void> {
        const stock = await this.firstOrNew({ resourceId }, { resourceId, ...ResourceStockRepository.EMPTY_STOCK }, trx);
        stock.quantityPurchased += quantity;
        stock.quantityPurchasedSoljund += soljundQuantity;
        await stock.save();
    }

    public async incrementBarrelSoljundQuantity(resourceId: string, delta: number, trx?: TransactionClientContract): Promise<void> {
        if (delta === 0) return;
        const stock = await this.firstOrNew({ resourceId }, { resourceId, ...ResourceStockRepository.EMPTY_STOCK }, trx);
        stock.quantityBarrelSoljund += delta;
        await stock.save();
    }

    public async overrideQuantities(
        overrides: { resourceId: string; quantityPurchased: number; quantityPurchasedSoljund: number; quantityBarrelSoljund: number }[],
        trx?: TransactionClientContract,
    ): Promise<void> {
        for (const { resourceId, quantityPurchased, quantityPurchasedSoljund, quantityBarrelSoljund } of overrides) {
            const stock = await this.firstOrNew({ resourceId }, { resourceId, ...ResourceStockRepository.EMPTY_STOCK }, trx);
            stock.quantityPurchased = quantityPurchased;
            stock.quantityPurchasedSoljund = quantityPurchasedSoljund;
            stock.quantityBarrelSoljund = quantityBarrelSoljund;
            await stock.save();
        }
    }
}
