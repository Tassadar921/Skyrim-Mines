import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import db from '@adonisjs/lucid/services/db';
import transmit from '@adonisjs/transmit/services/main';
import ResourceRepository from '#repositories/resource_repository';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceBuybackBatchRepository from '#repositories/resource_buyback_batch_repository';
import ResourceStockRepository from '#repositories/resource_stock_repository';
import MaterialRepository from '#repositories/material_repository';
import MaterialStockRepository from '#repositories/material_stock_repository';
import UserRepository from '#repositories/user_repository';
import { createBuybackValidator } from '#validators/buybacks';
import { MOONSTONE_RESOURCE_NAME } from '#helpers/moonstone_helper';
import { DOLINE_MATERIAL_NAME } from '#helpers/doline_helper';
import ResourceTypeEnum from '#types/enum/resource_type_enum';

function allocateProportionally(total: number, weights: Map<string, number>): Map<string, number> {
    const totalWeight = [...weights.values()].reduce((sum, weight) => sum + weight, 0);
    const result = new Map<string, number>();
    if (total <= 0 || totalWeight <= 0) return result;

    const remainders: { key: string; remainder: number }[] = [];
    let allocated = 0;

    for (const [key, weight] of weights) {
        const raw = (total * weight) / totalWeight;
        const floor = Math.floor(raw);
        result.set(key, floor);
        remainders.push({ key, remainder: raw - floor });
        allocated += floor;
    }

    remainders.sort((a, b) => b.remainder - a.remainder);
    let remaining = total - allocated;
    for (const { key } of remainders) {
        if (remaining <= 0) break;
        result.set(key, (result.get(key) ?? 0) + 1);
        remaining -= 1;
    }

    return result;
}

export default class BuybacksController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBuybackBatchRepository: ResourceBuybackBatchRepository = new ResourceBuybackBatchRepository(),
        private readonly resourceStockRepository: ResourceStockRepository = new ResourceStockRepository(),
        private readonly materialRepository: MaterialRepository = new MaterialRepository(),
        private readonly materialStockRepository: MaterialStockRepository = new MaterialStockRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
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

                    const [depositedByUser, boughtBackByUser] = await Promise.all([
                        this.resourceDepositRepository.sumByUserForResource(item.resourceId),
                        this.resourceBuybackRepository.sumByUserForResource(item.resourceId),
                    ]);

                    const outstandingByUser = new Map<string, number>();
                    for (const [userId, deposited] of depositedByUser) {
                        const outstanding = deposited - (boughtBackByUser.get(userId) ?? 0);
                        if (outstanding > 0) outstandingByUser.set(userId, outstanding);
                    }

                    const totalOutstanding = [...outstandingByUser.values()].reduce((sum, qty) => sum + qty, 0);
                    const quantity = Math.min(item.quantity, totalOutstanding);
                    if (quantity <= 0) continue;

                    const allocations = allocateProportionally(quantity, outstandingByUser);
                    const buyPrice = Number(resource.buyPrice);

                    const isMoonstoneOre = resource.name === MOONSTONE_RESOURCE_NAME && resource.type === ResourceTypeEnum.MINERAI;
                    let soljundQuantity = 0;
                    let soljundAllocations = new Map<string, number>();
                    if (isMoonstoneOre) {
                        const [depositedSoljund, boughtBackSoljund] = await Promise.all([
                            this.resourceDepositRepository.sumSoljundQuantityForResource(item.resourceId),
                            this.resourceBuybackRepository.sumSoljundQuantityForResource(item.resourceId),
                        ]);
                        const outstandingSoljund = Math.max(0, depositedSoljund - boughtBackSoljund);
                        soljundQuantity = Math.min(item.soljundQuantity ?? 0, quantity, outstandingSoljund);
                        soljundAllocations = allocateProportionally(soljundQuantity, allocations);
                    }

                    const buybackEntries: { batchId: string; userId: string; resourceId: string; quantity: number; amount: number; soljundQuantity: number }[] = [];
                    for (const [userId, allocatedQuantity] of allocations) {
                        if (allocatedQuantity <= 0) continue;
                        const amount = allocatedQuantity * buyPrice;
                        buybackEntries.push({
                            batchId: batch.id,
                            userId,
                            resourceId: item.resourceId,
                            quantity: allocatedQuantity,
                            amount,
                            soljundQuantity: soljundAllocations.get(userId) ?? 0,
                        });
                        await this.userRepository.incrementBalance(userId, amount, trx);
                    }

                    await this.resourceBuybackRepository.createMany(buybackEntries, trx);
                    await this.resourceStockRepository.incrementPurchasedQuantity(item.resourceId, quantity, trx);

                    if (soljundQuantity > 0) {
                        const dolineMaterial = await this.materialRepository.findOneBy({ name: DOLINE_MATERIAL_NAME }, [], trx);
                        if (dolineMaterial) {
                            await this.materialStockRepository.increment(dolineMaterial.id, trx, soljundQuantity);
                        }
                    }
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
