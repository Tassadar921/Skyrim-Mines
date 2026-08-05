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
}
