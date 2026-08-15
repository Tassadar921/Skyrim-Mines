import db from '@adonisjs/lucid/services/db';
import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import MaterialRepository from '#repositories/material_repository';
import MaterialStockRepository from '#repositories/material_stock_repository';
import UserRepository from '#repositories/user_repository';
import { PICKAXE_MATERIAL_NAME } from '#helpers/pickaxe_helper';

export default class PickaxesController {
    constructor(
        private readonly materialRepository: MaterialRepository = new MaterialRepository(),
        private readonly materialStockRepository: MaterialStockRepository = new MaterialStockRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
    ) {}

    public async take({ auth, response, session, i18n }: HttpContext) {
        try {
            const success = await db.transaction(async (trx) => {
                const material = await this.materialRepository.findOneBy({ name: PICKAXE_MATERIAL_NAME }, [], trx);
                if (!material) return false;

                const taken = await this.materialStockRepository.decrementIfPositive(material.id, trx);
                if (!taken) return false;

                await this.userRepository.incrementPickaxes(auth.user!.id, 1, trx);
                return true;
            });

            if (!success) {
                session.flash('error', i18n.t('messages.pickaxes.take.empty'));
            }
        } catch (e) {
            logger.error({ err: e }, 'pickaxes.take failed');
            session.flash('error', i18n.t('messages.pickaxes.take.error'));
        }

        return response.redirect().back();
    }

    public async deposit({ response, session, i18n }: HttpContext) {
        try {
            const success = await db.transaction(async (trx) => {
                const material = await this.materialRepository.findOneBy({ name: PICKAXE_MATERIAL_NAME }, [], trx);
                if (!material) return false;

                await this.materialStockRepository.increment(material.id, trx);
                return true;
            });

            if (!success) {
                session.flash('error', i18n.t('messages.pickaxes.deposit.error'));
            }
        } catch (e) {
            logger.error({ err: e }, 'pickaxes.deposit failed');
            session.flash('error', i18n.t('messages.pickaxes.deposit.error'));
        }

        return response.redirect().back();
    }
}
