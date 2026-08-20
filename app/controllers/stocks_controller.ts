import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import ResourceRepository from '#repositories/resource_repository';
import MaterialRepository from '#repositories/material_repository';
import ResourceStockRepository from '#repositories/resource_stock_repository';
import MaterialStockRepository from '#repositories/material_stock_repository';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import MaterialTransformer from '#transformers/material_transformer';
import { updateResourceStockQuantityValidator, updateMaterialStockQuantityValidator } from '#validators/stocks';

export default class StocksController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly materialRepository: MaterialRepository = new MaterialRepository(),
        private readonly resourceStockRepository: ResourceStockRepository = new ResourceStockRepository(),
        private readonly materialStockRepository: MaterialStockRepository = new MaterialStockRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const [resources, materials, resourceStocks, materialStocks, resourceDepositTotals, resourceBuybackTotals, soljundDepositTotals, soljundBuybackTotals] = await Promise.all([
            this.resourceRepository.all(),
            this.materialRepository.all(),
            this.resourceStockRepository.all(),
            this.materialStockRepository.all(),
            this.resourceDepositRepository.sumByResource(),
            this.resourceBuybackRepository.sumByResource(),
            this.resourceDepositRepository.sumSoljundQuantityByResource(),
            this.resourceBuybackRepository.sumSoljundQuantityByResource(),
        ]);

        const resourceStockByResourceId = new Map(resourceStocks.map((s) => [s.resourceId, s]));
        const materialStockByMaterialId = new Map(materialStocks.map((s) => [s.materialId, s]));

        return inertia.render('stocks', {
            resources: resources.map((r) => ({
                ...new ResourceTransformer(r).toObject(),
                quantityBarrel: (resourceDepositTotals.get(r.id) ?? 0) - (resourceBuybackTotals.get(r.id) ?? 0),
                quantityPurchased: resourceStockByResourceId.get(r.id)?.quantityPurchased ?? 0,
                soljundQuantity: (soljundDepositTotals.get(r.id) ?? 0) - (soljundBuybackTotals.get(r.id) ?? 0),
            })),
            materials: materials.map((m) => ({
                ...new MaterialTransformer(m).toObject(),
                quantity: materialStockByMaterialId.get(m.id)?.quantity ?? 0,
            })),
        });
    }

    public async updateResourceQuantity({ request, params, response, session, i18n }: HttpContext) {
        const { quantity } = await request.validateUsing(updateResourceStockQuantityValidator);

        try {
            await this.resourceStockRepository.setPurchasedQuantity(params.id, quantity);
        } catch (e) {
            logger.error({ err: e }, 'stocks.updateResourceQuantity failed');
            session.flash('error', i18n.t('messages.stocks.update.error'));
        }

        return response.redirect().back();
    }

    public async updateMaterialQuantity({ request, params, response, session, i18n }: HttpContext) {
        const { quantity } = await request.validateUsing(updateMaterialStockQuantityValidator);

        try {
            await this.materialStockRepository.setQuantity(params.id, quantity);
        } catch (e) {
            logger.error({ err: e }, 'stocks.updateMaterialQuantity failed');
            session.flash('error', i18n.t('messages.stocks.update.error'));
        }

        return response.redirect().back();
    }
}
