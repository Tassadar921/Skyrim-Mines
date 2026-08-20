import { type TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import MaterialStock from '#models/material_stock';

export default class MaterialStockRepository extends BaseRepository<typeof MaterialStock> {
    constructor() {
        super(MaterialStock);
    }

    public async all(): Promise<MaterialStock[]> {
        return MaterialStock.query();
    }

    public async setQuantity(materialId: string, quantity: number): Promise<MaterialStock> {
        const stock = await this.firstOrNew({ materialId }, { materialId, quantity: 0 });
        stock.quantity = quantity;
        await stock.save();
        return stock;
    }

    public async decrementIfPositive(materialId: string, trx: TransactionClientContract): Promise<boolean> {
        const stock = await MaterialStock.query({ client: trx }).where('materialId', materialId).forUpdate().first();
        if (!stock || stock.quantity <= 0) return false;

        stock.quantity -= 1;
        await stock.save();
        return true;
    }

    public async increment(materialId: string, trx: TransactionClientContract, amount: number = 1): Promise<void> {
        const stock = await this.firstOrNew({ materialId }, { materialId, quantity: 0 }, trx);
        stock.quantity += amount;
        await stock.save();
    }
}
