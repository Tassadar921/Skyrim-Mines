import { DateTime } from 'luxon';
import { type HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';
import logger from '@adonisjs/core/services/logger';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceStockRepository from '#repositories/resource_stock_repository';
import { createDepositValidator, updateDepositValidator } from '#validators/deposits';
import { DEPOSIT_EDIT_WINDOW_MINUTES } from '#helpers/deposit_edit_window_helper';

export default class DepositsController {
    constructor(
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceStockRepository: ResourceStockRepository = new ResourceStockRepository(),
    ) {}

    public async store({ request, auth, response, session, i18n }: HttpContext) {
        const { items } = await request.validateUsing(createDepositValidator);

        if (items.some((item) => (item.soljundQuantity ?? 0) > item.quantity)) {
            session.flash('error', i18n.t('messages.deposits.create.invalidSoljundQuantity'));
            return response.redirect().back();
        }

        try {
            await db.transaction(async (trx) => {
                await this.resourceDepositRepository.createMany(auth.user!.id, items, trx);
                for (const item of items) {
                    if ((item.soljundQuantity ?? 0) > 0) {
                        await this.resourceStockRepository.incrementBarrelSoljundQuantity(item.resourceId, item.soljundQuantity!, trx);
                    }
                }
            });
            session.flash('success', i18n.t('messages.deposits.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'deposits.store failed');
            session.flash('error', i18n.t('messages.deposits.create.error'));
        }

        return response.redirect().back();
    }

    public async update({ params, request, auth, response, session, i18n }: HttpContext) {
        const deposit = await this.resourceDepositRepository.find(params.id);
        const viewer = auth.user!;

        if (!deposit || deposit.userId !== viewer.id) {
            session.flash('error', i18n.t('messages.deposits.update.forbidden'));
            return response.redirect().back();
        }

        if (deposit.createdAt < DateTime.now().minus({ minutes: DEPOSIT_EDIT_WINDOW_MINUTES })) {
            session.flash('error', i18n.t('messages.deposits.update.expired'));
            return response.redirect().back();
        }

        const { resourceId, quantity } = await request.validateUsing(updateDepositValidator);

        try {
            await db.transaction(async (trx) => {
                const { previousResourceId, soljundDelta } = await this.resourceDepositRepository.update(deposit.id, { resourceId, quantity }, trx);
                if (soljundDelta !== 0) {
                    await this.resourceStockRepository.incrementBarrelSoljundQuantity(previousResourceId, soljundDelta, trx);
                }
            });
            session.flash('success', i18n.t('messages.deposits.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'deposits.update failed');
            session.flash('error', i18n.t('messages.deposits.update.error'));
        }

        return response.redirect().back();
    }
}
