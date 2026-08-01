import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { DateTime } from 'luxon';
import UserTokenRepository from '#repositories/user_token_repository';
import UserTokenTypeEnum from '#types/enum/user_token_type_enum';
import User from '#models/user';
import { tokenValidator } from '#validators/token';

export default class EmailVerificationController {
    constructor(private readonly tokenRepository: UserTokenRepository = new UserTokenRepository()) {}

    public async show({ request, response, session, auth, i18n }: HttpContext) {
        const qs = await request.validateUsing(tokenValidator, { data: request.qs() }).catch(() => null);
        const token = qs ? await this.tokenRepository.findValid(qs.token, UserTokenTypeEnum.EMAIL_VERIFICATION) : null;

        if (!token) {
            session.flash('error', i18n.t('messages.emailVerification.invalidToken'));
            return response.redirect().toRoute('home');
        }

        try {
            const user = await User.findOrFail(token.userId);
            user.enabled = true;
            user.lastLoginAt = DateTime.now();
            await user.save();

            await this.tokenRepository.consume(qs!.token, UserTokenTypeEnum.EMAIL_VERIFICATION);
            await auth.use('web').login(user);

            session.flash('success', i18n.t('messages.emailVerification.success'));
            return response.redirect().toRoute('home');
        } catch (e) {
            logger.error({ err: e }, 'emailVerification failed');
            session.flash('error', i18n.t('messages.emailVerification.error'));
            return response.redirect().toRoute('home');
        }
    }
}
