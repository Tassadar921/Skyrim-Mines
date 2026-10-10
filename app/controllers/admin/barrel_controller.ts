import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceBarrelAdjustmentRepository from '#repositories/resource_barrel_adjustment_repository';
import { updateBarrelQuantityValidator } from '#validators/admin/barrel';

export default class BarrelController {
    constructor(
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBarrelAdjustmentRepository: ResourceBarrelAdjustmentRepository = new ResourceBarrelAdjustmentRepository(),
    ) {}

    public async update({ request, auth, response, session, i18n }: HttpContext) {
        const { userId, resourceId, quantity } = await request.validateUsing(updateBarrelQuantityValidator);

        try {
            const [deposited, boughtBack, adjusted] = await Promise.all([
                this.resourceDepositRepository.sumForUserAndResource(userId, resourceId),
                this.resourceBuybackRepository.sumForUserAndResource(userId, resourceId),
                this.resourceBarrelAdjustmentRepository.sumForUserAndResource(userId, resourceId),
            ]);

            const current = deposited - boughtBack + adjusted;
            const delta = quantity - current;

            if (delta !== 0) {
                await this.resourceBarrelAdjustmentRepository.create({ userId, resourceId, adminId: auth.user!.id, delta });
            }

            session.flash('success', i18n.t('messages.admin.barrel.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'barrel.update failed');
            session.flash('error', i18n.t('messages.admin.barrel.update.error'));
        }

        return response.redirect().withQs().back();
    }
}
