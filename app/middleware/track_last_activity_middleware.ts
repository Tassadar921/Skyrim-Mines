import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import User from '#models/user';

/**
 * Stamps every authenticated request (including plain GETs) onto the user's `last_activity`,
 * for all roles — originally requested to track auditor activity, but applied uniformly.
 * Runs after silent auth, so `ctx.auth.user` is already resolved if a session exists.
 */
export default class TrackLastActivityMiddleware {
    async handle(ctx: HttpContext, next: NextFn) {
        if (ctx.auth.user) {
            const userId = ctx.auth.user.id;
            User.query()
                .where('id', userId)
                .update({ lastActivity: DateTime.now() })
                .catch((e) => logger.error({ err: e }, 'trackLastActivity.update failed'));
        }

        return next();
    }
}
