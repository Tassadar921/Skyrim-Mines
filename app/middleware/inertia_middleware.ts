import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import { inject } from '@adonisjs/core';
import UserTransformer from '#transformers/user_transformer';
import TermsVersionRepository from '#repositories/terms_version_repository';
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware';
import cache from '@adonisjs/cache/services/main';
import { isTermsOutdated, isAccountDeactivated, deserializeTermsVersion } from '#helpers/terms_helper';
import { TERMS_CACHE_KEY, TERMS_CACHE_TAG } from '#repositories/terms_version_repository';

@inject()
export default class InertiaMiddleware extends BaseInertiaMiddleware {
    constructor(private readonly termsVersionRepository: TermsVersionRepository) {
        super();
    }

    async share(ctx: HttpContext) {
        /**
         * The share method is called everytime an Inertia page is rendered. In
         * certain cases, a page may get rendered before the session middleware
         * or the auth middleware are executed. For example: During a 404 request.
         *
         * In that case, we must always assume that HttpContext is not fully hydrated
         * with all the properties
         */
        const { session, auth } = ctx as Partial<HttpContext>;

        /**
         * Fetching the first error from the flash messages
         */
        const errorsBag = session?.flashMessages.get('errorsBag') ?? {};
        const error: string | undefined = Object.keys(errorsBag)
            .filter((code: string): boolean => code !== 'E_VALIDATION_ERROR')
            .map((code: string) => errorsBag[code])[0];

        const latestTermsVersion = auth?.user
            ? deserializeTermsVersion(
                  await cache.getOrSet({
                      key: TERMS_CACHE_KEY,
                      ttl: '24h',
                      tags: [TERMS_CACHE_TAG],
                      factory: () => this.termsVersionRepository.getLatest(),
                  })
              )
            : null;
        const outdated = auth?.user ? isTermsOutdated(auth.user, latestTermsVersion) : false;
        const deactivated = outdated ? isAccountDeactivated(auth!.user!, latestTermsVersion) : false;

        /**
         * Data shared with all Inertia pages. Make sure you are using
         * transformers for rich data-types like Models.
         */
        return {
            errors: ctx.inertia.always(this.getValidationErrors(ctx)),
            flash: ctx.inertia.always({
                error: error ?? session?.flashMessages.get('error'),
                success: session?.flashMessages.get('success'),
                requireTermsAcceptance: session?.flashMessages.get('requireTermsAcceptance') ?? false,
            }),
            user: ctx.inertia.always(auth?.user ? new UserTransformer(auth.user).toObject() : undefined),
            termsOutdated: ctx.inertia.always(outdated),
            termsDeactivated: ctx.inertia.always(deactivated),
        };
    }

    async handle(ctx: HttpContext, next: NextFn) {
        await this.init(ctx);

        const output = await next();
        this.dispose(ctx);

        return output;
    }
}

declare module '@adonisjs/inertia/types' {
    type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>;
    export interface SharedProps extends MiddlewareSharedProps {}
}
