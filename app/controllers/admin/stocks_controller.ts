import { type HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';
import logger from '@adonisjs/core/services/logger';
import ResourceRepository from '#repositories/resource_repository';
import MaterialRepository from '#repositories/material_repository';
import ResourceStockRepository from '#repositories/resource_stock_repository';
import MaterialStockRepository from '#repositories/material_stock_repository';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceBarrelAdjustmentRepository from '#repositories/resource_barrel_adjustment_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import MaterialTransformer from '#transformers/material_transformer';
import { updateStocksValidator } from '#validators/admin/stocks';
import { DOLINE_MATERIAL_NAME } from '#helpers/doline_helper';
import { MOONSTONE_RESOURCE_NAME } from '#helpers/moonstone_helper';
import { computeBarrelQuantity } from '#helpers/resource_barrel_helper';

export default class StocksController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly materialRepository: MaterialRepository = new MaterialRepository(),
        private readonly resourceStockRepository: ResourceStockRepository = new ResourceStockRepository(),
        private readonly materialStockRepository: MaterialStockRepository = new MaterialStockRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBarrelAdjustmentRepository: ResourceBarrelAdjustmentRepository = new ResourceBarrelAdjustmentRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const [resources, materials, resourceStocks, materialStocks, resourceDepositTotals, resourceBuybackTotals, resourceAdjustmentTotals] = await Promise.all([
            this.resourceRepository.all(),
            this.materialRepository.all(),
            this.resourceStockRepository.all(),
            this.materialStockRepository.all(),
            this.resourceDepositRepository.sumByResource(),
            this.resourceBuybackRepository.sumByResource(),
            this.resourceBarrelAdjustmentRepository.sumByResource(),
        ]);

        const resourceStockByResourceId = new Map(resourceStocks.map((s) => [s.resourceId, s]));
        const materialStockByMaterialId = new Map(materialStocks.map((s) => [s.materialId, s]));

        return inertia.render('admin/stocks/index', {
            resources: resources.map((r) => ({
                ...new ResourceTransformer(r).toObject(),
                quantityBarrel: computeBarrelQuantity(r.id, resourceDepositTotals, resourceBuybackTotals, resourceAdjustmentTotals),
                quantityPurchased: resourceStockByResourceId.get(r.id)?.quantityPurchased ?? 0,
                quantityPurchasedSoljund: resourceStockByResourceId.get(r.id)?.quantityPurchasedSoljund ?? 0,
                soljundQuantity: resourceStockByResourceId.get(r.id)?.quantityBarrelSoljund ?? 0,
            })),
            materials: materials.map((m) => ({
                ...new MaterialTransformer(m).toObject(),
                quantity: materialStockByMaterialId.get(m.id)?.quantity ?? 0,
            })),
            dolineMaterialName: DOLINE_MATERIAL_NAME,
            moonstoneResourceName: MOONSTONE_RESOURCE_NAME,
        });
    }

    public async update({ request, response, session, i18n }: HttpContext) {
        const { dolineQuantity, resources } = await request.validateUsing(updateStocksValidator);

        try {
            await db.transaction(async (trx) => {
                const doline = await this.materialRepository.findOneBy({ name: DOLINE_MATERIAL_NAME });
                if (doline) {
                    await this.materialStockRepository.setQuantity(doline.id, dolineQuantity, trx);
                }
                await this.resourceStockRepository.overrideQuantities(resources, trx);
            });
            session.flash('success', i18n.t('messages.admin.stocks.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'admin.stocks.update failed');
            session.flash('error', i18n.t('messages.admin.stocks.update.error'));
        }

        return response.redirect().back();
    }
}
