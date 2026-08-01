import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import User from '#models/user';
import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
import cache from '@adonisjs/cache/services/main';
import { loginValidator } from '#validators/auth';
import TermsVersionRepository, { TERMS_CACHE_KEY, TERMS_CACHE_TAG } from '#repositories/terms_version_repository';
import { isTermsOutdated, isAccountDeactivated, deserializeTermsVersion } from '#helpers/terms_helper';

@inject()
export default class AuthController {
    constructor(private readonly termsVersionRepository: TermsVersionRepository = new TermsVersionRepository()) {}

    public async logout({ auth, response, session, i18n }: HttpContext) {
        await auth.use('web').logout();
        session.flash('success', i18n.t('messages.auth.logout.success'));
        return response.redirect().toRoute('home');
    }

    public async login({ request, auth, response, session, i18n }: HttpContext) {
        const { email, password, acceptTerms } = await request.validateUsing(loginValidator);

        try {
            const user: User = await User.verifyCredentials(email, password);

            if (!user.enabled) {
                session.flash('error', i18n.t('messages.auth.login.notEnabled'));
                return response.redirect().back();
            }

            const latest = deserializeTermsVersion(
                await cache.getOrSet({
                    key: TERMS_CACHE_KEY,
                    ttl: '24h',
                    tags: [TERMS_CACHE_TAG],
                    factory: () => this.termsVersionRepository.getLatest(),
                })
            );
            if (isTermsOutdated(user, latest) && isAccountDeactivated(user, latest)) {
                if (!acceptTerms) {
                    session.flash('requireTermsAcceptance', true);
                    return response.redirect().back();
                }
                user.acceptedTermsAt = DateTime.now();
                await user.save();
            }

            await auth.use('web').login(user);
            user.lastLoginAt = DateTime.now();
            await user.save();
            return response.redirect().toRoute('home');
        } catch (e) {
            logger.warn({ err: e }, 'auth.login failed');
            session.flash('error', i18n.t('messages.auth.login.error'));
            return response.redirect().back();
        }
    }
}
