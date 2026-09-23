import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import UserTransformer from '#transformers/user_transformer';
import SiteSettingRepository from '#repositories/site_setting_repository';
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware';

const DEFAULT_LOGO_URL = '/logo.png';

export default class InertiaMiddleware extends BaseInertiaMiddleware {
    private readonly siteSettingRepository = new SiteSettingRepository();

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

        const siteSetting = await this.siteSettingRepository.getWithLogo();

        /**
         * Data shared with all Inertia pages. Make sure you are using
         * transformers for rich data-types like Models.
         */
        return {
            errors: ctx.inertia.always(this.getValidationErrors(ctx)),
            flash: ctx.inertia.always({
                error: error ?? session?.flashMessages.get('error'),
                success: session?.flashMessages.get('success'),
            }),
            user: ctx.inertia.always(auth?.user ? new UserTransformer(auth.user).toObject() : undefined),
            logoUrl: ctx.inertia.always(siteSetting.logoFile?.path ?? DEFAULT_LOGO_URL),
            subtitle: ctx.inertia.always(siteSetting.subtitle ?? undefined),
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
