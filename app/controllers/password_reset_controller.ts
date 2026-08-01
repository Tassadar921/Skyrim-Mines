import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import UserTokenRepository from '#repositories/user_token_repository';
import UserTokenTypeEnum from '#types/enum/user_token_type_enum';
import User from '#models/user';
import { resetPasswordValidator } from '#validators/password_reset';
import { tokenValidator } from '#validators/token';

export default class PasswordResetController {
    constructor(private readonly tokenRepository: UserTokenRepository = new UserTokenRepository()) {}

    public async show({ inertia, request, response, session, i18n }: HttpContext) {
        const qs = await request.validateUsing(tokenValidator, { data: request.qs() }).catch(() => null);
        const token = qs ? await this.tokenRepository.findValid(qs.token, UserTokenTypeEnum.PASSWORD_RESET) : null;

        if (!token) {
            session.flash('error', i18n.t('messages.passwordReset.invalidToken'));
            return response.redirect().toRoute('home');
        }

        return inertia.render('password_reset', { token: qs!.token });
    }

    public async update({ request, response, session, i18n }: HttpContext) {
        const qs = await request.validateUsing(tokenValidator, { data: request.qs() }).catch(() => null);
        const token = qs ? await this.tokenRepository.findValid(qs.token, UserTokenTypeEnum.PASSWORD_RESET) : null;

        if (!token) {
            session.flash('error', i18n.t('messages.passwordReset.invalidToken'));
            return response.redirect().toRoute('home');
        }

        const { password, passwordConfirmation } = await request.validateUsing(resetPasswordValidator);

        if (password !== passwordConfirmation) {
            session.flash('error', i18n.t('messages.passwordReset.passwordMismatch'));
            return response.redirect().back();
        }

        try {
            const user = await User.findOrFail(token.userId);
            user.password = password;
            await user.save();

            await this.tokenRepository.consume(qs!.token, UserTokenTypeEnum.PASSWORD_RESET);

            session.flash('success', i18n.t('messages.passwordReset.success'));
            return response.redirect().toRoute('login');
        } catch (e) {
            logger.error({ err: e }, 'passwordReset.update failed');
            session.flash('error', i18n.t('messages.passwordReset.error'));
            return response.redirect().back();
        }
    }
}
