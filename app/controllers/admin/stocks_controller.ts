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
import UserRepository from '#repositories/user_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import MaterialTransformer from '#transformers/material_transformer';
import { updateStocksValidator, updateBarrelTotalValidator } from '#validators/admin/stocks';
import { computeBarrelQuantity } from '#helpers/resource_barrel_helper';
import { distributeEvenly, distributeProportionally } from '#helpers/barrel_redistribution_helper';
import UserRoleEnum from '#types/enum/user_role_enum';

export default class StocksController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly materialRepository: MaterialRepository = new MaterialRepository(),
        private readonly resourceStockRepository: ResourceStockRepository = new ResourceStockRepository(),
        private readonly materialStockRepository: MaterialStockRepository = new MaterialStockRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBarrelAdjustmentRepository: ResourceBarrelAdjustmentRepository = new ResourceBarrelAdjustmentRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
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
            })),
            materials: materials.map((m) => ({
                ...new MaterialTransformer(m).toObject(),
                quantity: materialStockByMaterialId.get(m.id)?.quantity ?? 0,
            })),
        });
    }

    public async update({ request, response, session, i18n }: HttpContext) {
        const { materials, resources } = await request.validateUsing(updateStocksValidator);

        try {
            await db.transaction(async (trx) => {
                await this.materialStockRepository.overrideQuantities(materials, trx);
                await this.resourceStockRepository.overrideQuantities(resources, trx);
            });
            session.flash('success', i18n.t('messages.admin.stocks.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'admin.stocks.update failed');
            session.flash('error', i18n.t('messages.admin.stocks.update.error'));
        }

        return response.redirect().back();
    }

    public async updateBarrelTotal({ request, params, auth, response, session, i18n }: HttpContext) {
        const { quantity: targetTotal } = await request.validateUsing(updateBarrelTotalValidator);
        const resourceId = params.resourceId;

        try {
            const staffUsers = await this.userRepository.findByRole(UserRoleEnum.STAFF);
            if (!staffUsers.length) {
                session.flash('error', i18n.t('messages.admin.stocks.barrel.update.noStaff'));
                return response.redirect().back();
            }

            const [depositTotals, buybackTotals, adjustmentTotals, staffDeposits, staffBuybacks, staffAdjustments] = await Promise.all([
                this.resourceDepositRepository.sumByResource(),
                this.resourceBuybackRepository.sumByResource(),
                this.resourceBarrelAdjustmentRepository.sumByResource(),
                this.resourceDepositRepository.sumByUserForResource(resourceId),
                this.resourceBuybackRepository.sumByUserForResource(resourceId),
                this.resourceBarrelAdjustmentRepository.sumByUserForResource(resourceId),
            ]);

            const currentTotal = computeBarrelQuantity(resourceId, depositTotals, buybackTotals, adjustmentTotals);
            const delta = targetTotal - currentTotal;

            if (delta === 0) {
                return response.redirect().back();
            }

            const staffUserIds = staffUsers.map((user) => user.id);
            const staffQuantityByUserId = new Map(staffUserIds.map((id) => [id, (staffDeposits.get(id) ?? 0) - (staffBuybacks.get(id) ?? 0) + (staffAdjustments.get(id) ?? 0)]));
            const staffTotal = [...staffQuantityByUserId.values()].reduce((sum, quantity) => sum + quantity, 0);

            if (delta < 0 && Math.abs(delta) > staffTotal) {
                session.flash('error', i18n.t('messages.admin.stocks.barrel.update.insufficientStaffStock'));
                return response.redirect().back();
            }

            const adjustments = delta > 0 ? distributeEvenly(staffUserIds, delta) : distributeProportionally(staffQuantityByUserId, Math.abs(delta));
            const adminId = auth.user!.id;

            await db.transaction(async (trx) => {
                for (const [userId, amount] of adjustments) {
                    if (amount === 0) continue;
                    await this.resourceBarrelAdjustmentRepository.create({ userId, resourceId, adminId, delta: delta > 0 ? amount : -amount }, trx);
                }
            });

            session.flash('success', i18n.t('messages.admin.stocks.barrel.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'admin.stocks.updateBarrelTotal failed');
            session.flash('error', i18n.t('messages.admin.stocks.barrel.update.error'));
        }

        return response.redirect().back();
    }
}
