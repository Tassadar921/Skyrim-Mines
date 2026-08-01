import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

export default class HoneypotMiddleware {
    async handle({ request, response, session, i18n }: HttpContext, next: NextFn, options: { flashKey: string }) {
        if (request.input('website')) {
            session.flash('success', i18n.t(options.flashKey, {}));
            return response.redirect().back();
        }
        await next();
    }
}
