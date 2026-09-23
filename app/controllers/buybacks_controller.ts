import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import db from '@adonisjs/lucid/services/db';
import transmit from '@adonisjs/transmit/services/main';
import ResourceRepository from '#repositories/resource_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceBuybackBatchRepository from '#repositories/resource_buyback_batch_repository';
import ResourceStockRepository from '#repositories/resource_stock_repository';
import { createBuybackValidator } from '#validators/buybacks';

export default class BuybacksController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBuybackBatchRepository: ResourceBuybackBatchRepository = new ResourceBuybackBatchRepository(),
        private readonly resourceStockRepository: ResourceStockRepository = new ResourceStockRepository(),
    ) {}

    public async store({ request, response, session, i18n }: HttpContext) {
        const { items } = await request.validateUsing(createBuybackValidator);
        const requested = items.filter((item) => item.quantity > 0);

        if (!requested.length) {
            return response.redirect().back();
        }

        try {
            const resources = await this.resourceRepository.all();
            const resourceById = new Map(resources.map((r) => [r.id, r]));

            await db.transaction(async (trx) => {
                const batch = await this.resourceBuybackBatchRepository.createBatch(trx);

                for (const item of requested) {
                    const resource = resourceById.get(item.resourceId);
                    if (!resource) continue;

                    const quantity = await this.resourceBuybackRepository.buybackResourceFromBarrel({
                        resourceId: item.resourceId,
                        requestedQuantity: item.quantity,
                        buyPrice: Number(resource.buyPrice),
                        batchId: batch.id,
                        trx,
                    });
                    if (quantity <= 0) continue;

                    await this.resourceStockRepository.incrementPurchasedQuantity(item.resourceId, quantity, trx);
                }
            });

            transmit.broadcast('barrel', {});
            session.flash('success', i18n.t('messages.buybacks.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'buybacks.store failed');
            session.flash('error', i18n.t('messages.buybacks.create.error'));
        }

        return response.redirect().back();
    }
}
