import { I18n } from '@adonisjs/i18n';
import i18nManager from '@adonisjs/i18n/services/main';
import type { NextFn } from '@adonisjs/core/types/http';
import { type HttpContext, RequestValidator } from '@adonisjs/core/http';

export default class LanguageMiddleware {
    static {
        RequestValidator.messagesProvider = (ctx: HttpContext) => {
            return ctx.i18n.createMessagesProvider();
        };
    }

    async handle(ctx: HttpContext, next: NextFn) {
        ctx.i18n = i18nManager.locale('fr');
        ctx.containerResolver.bindValue(I18n, ctx.i18n);

        await next();
    }
}

declare module '@adonisjs/core/http' {
    export interface HttpContext {
        i18n: I18n;
    }
}
