import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import ResourceRepository from '#repositories/resource_repository';
import UserRepository from '#repositories/user_repository';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceBarrelAdjustmentRepository from '#repositories/resource_barrel_adjustment_repository';
import { updateBarrelQuantityValidator } from '#validators/admin/tonneau';

export default class TonneauController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBarrelAdjustmentRepository: ResourceBarrelAdjustmentRepository = new ResourceBarrelAdjustmentRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const [resources, users, depositTotals, buybackTotals, adjustmentTotals] = await Promise.all([
            this.resourceRepository.all(),
            this.userRepository.all(),
            this.resourceDepositRepository.sumByUserAndResource(),
            this.resourceBuybackRepository.sumByUserAndResource(),
            this.resourceBarrelAdjustmentRepository.sumByUserAndResource(),
        ]);

        const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
        const userById = new Map(users.map((user) => [user.id, user]));
        const keys = new Set([...depositTotals.keys(), ...buybackTotals.keys(), ...adjustmentTotals.keys()]);

        const entries = [...keys]
            .map((key) => {
                const [userId, resourceId] = key.split(':');
                const resource = resourceById.get(resourceId);
                const user = userById.get(userId);
                if (!resource || !user) return null;

                const quantity = (depositTotals.get(key) ?? 0) - (buybackTotals.get(key) ?? 0) + (adjustmentTotals.get(key) ?? 0);

                return {
                    userId,
                    username: user.username,
                    resourceId,
                    resourceName: resource.name,
                    resourceType: resource.type,
                    quantity,
                };
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null && entry.quantity !== 0)
            .sort((a, b) => a.username.localeCompare(b.username) || a.resourceName.localeCompare(b.resourceName));

        return inertia.render('admin/tonneau/index', { entries });
    }

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

            session.flash('success', i18n.t('messages.admin.tonneau.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'tonneau.update failed');
            session.flash('error', i18n.t('messages.admin.tonneau.update.error'));
        }

        return response.redirect().back();
    }
}
