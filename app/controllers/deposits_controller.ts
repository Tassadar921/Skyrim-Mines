import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import { createDepositValidator } from '#validators/deposits';

export default class DepositsController {
    constructor(private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository()) {}

    public async store({ request, auth, response, session, i18n }: HttpContext) {
        const { items } = await request.validateUsing(createDepositValidator);

        try {
            await this.resourceDepositRepository.createMany(auth.user!.id, items);
            session.flash('success', i18n.t('messages.deposits.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'deposits.store failed');
            session.flash('error', i18n.t('messages.deposits.create.error'));
        }

        return response.redirect().back();
    }
}
