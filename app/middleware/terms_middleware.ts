import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import { inject } from '@adonisjs/core';
import cache from '@adonisjs/cache/services/main';
import TermsVersionRepository, { TERMS_CACHE_KEY, TERMS_CACHE_TAG } from '#repositories/terms_version_repository';
import { isTermsOutdated, isAccountDeactivated, deserializeTermsVersion } from '#helpers/terms_helper';

@inject()
export default class TermsMiddleware {
    constructor(private readonly termsVersionRepository: TermsVersionRepository) {}

    async handle({ auth, response }: HttpContext, next: NextFn) {
        const user = auth.user!;
        const latest = deserializeTermsVersion(
            await cache.getOrSet({
                key: TERMS_CACHE_KEY,
                ttl: '24h',
                tags: [TERMS_CACHE_TAG],
                factory: () => this.termsVersionRepository.getLatest(),
            })
        );

        if (isTermsOutdated(user, latest) && isAccountDeactivated(user, latest)) {
            return response.redirect().toRoute('terms.show');
        }

        return next();
    }
}
