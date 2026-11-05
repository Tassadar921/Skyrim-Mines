import { DateTime } from 'luxon';
import { type HttpContext } from '@adonisjs/core/http';
import ResourceRepository from '#repositories/resource_repository';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceBarrelAdjustmentRepository from '#repositories/resource_barrel_adjustment_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import { computeBarrelQuantity } from '#helpers/resource_barrel_helper';
import { DEPOSIT_EDIT_WINDOW_MINUTES } from '#helpers/deposit_edit_window_helper';

export default class HomeController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBarrelAdjustmentRepository: ResourceBarrelAdjustmentRepository = new ResourceBarrelAdjustmentRepository(),
    ) {}

    public async index({ inertia, auth }: HttpContext) {
        const user = auth.user;

        const [resources, depositTotals, buybackTotals, adjustmentTotals, myDepositTotals, myBuybackTotals, myAdjustmentTotals] = await Promise.all([
            this.resourceRepository.all(),
            this.resourceDepositRepository.sumByResource(),
            this.resourceBuybackRepository.sumByResource(),
            this.resourceBarrelAdjustmentRepository.sumByResource(),
            user ? this.resourceDepositRepository.sumByUser(user.id) : new Map<string, number>(),
            user ? this.resourceBuybackRepository.sumByUser(user.id) : new Map<string, number>(),
            user ? this.resourceBarrelAdjustmentRepository.sumByUser(user.id) : new Map<string, number>(),
        ]);

        const myDeposits = user ? await this.resourceDepositRepository.findRecentByUser(user.id, DateTime.now().minus({ minutes: DEPOSIT_EDIT_WINDOW_MINUTES })) : [];

        return inertia.render('home', {
            resources: resources.map((r) => ({
                ...new ResourceTransformer(r).toObject(),
                quantityBarrel: computeBarrelQuantity(r.id, depositTotals, buybackTotals, adjustmentTotals),
                myQuantityBarrel: computeBarrelQuantity(r.id, myDepositTotals, myBuybackTotals, myAdjustmentTotals),
            })),
            myDeposits: myDeposits.map((deposit) => ({
                id: deposit.id,
                resourceId: deposit.resourceId,
                quantity: deposit.quantity,
                createdAt: deposit.createdAt.toISO()!,
            })),
        });
    }
}
