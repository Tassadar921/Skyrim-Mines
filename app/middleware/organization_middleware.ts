import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import OrganizationRoleEnum from '#types/enum/organization_role_enum';

export default class OrganizationMiddleware {
    async handle({ auth, response }: HttpContext, next: NextFn, options: { roles?: OrganizationRoleEnum[] } = {}) {
        const allowedRoles = options.roles ?? [OrganizationRoleEnum.OWNER];

        if (!auth.user || !auth.user.organizationRole || !allowedRoles.includes(auth.user.organizationRole as OrganizationRoleEnum)) {
            return response.redirect().toRoute('home');
        }

        return next();
    }
}
