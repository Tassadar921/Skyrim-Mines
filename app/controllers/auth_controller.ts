import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { DateTime } from 'luxon';
import UserRepository from '#repositories/user_repository';

export default class AuthController {
    constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

    public async logout({ auth, response, session, i18n }: HttpContext) {
        await auth.use('web').logout();
        session.flash('success', i18n.t('messages.auth.logout.success'));
        return response.redirect().toRoute('home');
    }

    public async discordRedirect({ ally }: HttpContext) {
        return ally.use('discord').redirect();
    }

    public async discordCallback({ ally, auth, response, session, i18n }: HttpContext) {
        const discord = ally.use('discord');

        if (discord.accessDenied() || discord.stateMisMatch() || discord.hasError()) {
            session.flash('error', i18n.t('messages.auth.login.error'));
            return response.redirect().toRoute('login');
        }

        try {
            const discordUser = await discord.user();

            const user = await this.userRepository.findByDiscordId(discordUser.id);

            if (!user) {
                session.flash('error', i18n.t('messages.auth.login.unknownAccount'));
                return response.redirect().toRoute('login');
            }

            if (!user.enabled) {
                session.flash('error', i18n.t('messages.auth.login.notEnabled'));
                return response.redirect().toRoute('login');
            }

            user.lastLoginAt = DateTime.now();
            await user.save();

            await auth.use('web').login(user);
            return response.redirect().toRoute('home');
        } catch (e) {
            logger.warn({ err: e }, 'auth.discordCallback failed');
            session.flash('error', i18n.t('messages.auth.login.error'));
            return response.redirect().toRoute('login');
        }
    }
}
