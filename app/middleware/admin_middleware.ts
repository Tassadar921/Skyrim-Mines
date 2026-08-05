import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import UserRoleEnum from '#types/enum/user_role_enum';

export default class AdminMiddleware {
    async handle({ auth, response }: HttpContext, next: NextFn, options: { roles?: UserRoleEnum[] } = {}) {
        const allowedRoles = options.roles ?? [UserRoleEnum.ADMIN];

        if (!auth.user || !allowedRoles.includes(auth.user.role as UserRoleEnum)) {
            return response.redirect().toRoute('home');
        }

        return next();
    }
}
