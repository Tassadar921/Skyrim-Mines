import { type HttpContext } from '@adonisjs/core/http';
import type OrganizationRepository from '#repositories/organization_repository';
import type UserRepository from '#repositories/user_repository';
import type OrganizationRoleEnum from '#types/enum/organization_role_enum';
import { isStaffOrAdmin, isClientOrAuditor } from '#helpers/user_role_helper';

export type RecipientData = {
    recipientMode?: 'myOrganization' | 'myself' | 'thirdPartyClient' | 'thirdPartyOrganization';
    recipientClientId?: string;
    recipientOrganizationId?: string;
    recipientScope?: 'organization' | 'personal';
};

export type ResolvedRecipient = {
    organizationId: string | null;
    organizationName: string | null;
    recipientUserId: string | null;
    requesterName: string;
};

export async function resolveRecipient(
    auth: HttpContext['auth'],
    data: RecipientData,
    deps: { organizationRepository: OrganizationRepository; userRepository: UserRepository },
    options: { organizationRoles?: OrganizationRoleEnum[] } = {},
): Promise<ResolvedRecipient | null> {
    const user = auth.user!;
    const mode = data.recipientMode ?? (user.organizationId ? 'myOrganization' : 'myself');

    if ((mode === 'thirdPartyClient' || mode === 'thirdPartyOrganization') && !isStaffOrAdmin(user.role)) {
        return null;
    }

    switch (mode) {
        case 'myOrganization': {
            if (!user.organizationId) return null;
            if (options.organizationRoles && !options.organizationRoles.includes(user.organizationRole as OrganizationRoleEnum)) return null;
            const organization = await deps.organizationRepository.findOrFail(user.organizationId);
            return { organizationId: organization.id, organizationName: organization.name, recipientUserId: user.id, requesterName: user.username };
        }
        case 'myself': {
            return { organizationId: null, organizationName: null, recipientUserId: user.id, requesterName: user.username };
        }
        case 'thirdPartyClient': {
            if (!data.recipientClientId) return null;
            const client = await deps.userRepository.findOrFail(data.recipientClientId);
            if (!isClientOrAuditor(client.role)) return null;

            if (client.organizationId && data.recipientScope !== 'personal') {
                const organization = await deps.organizationRepository.findOrFail(client.organizationId);
                return { organizationId: organization.id, organizationName: organization.name, recipientUserId: client.id, requesterName: client.username };
            }
            return { organizationId: null, organizationName: null, recipientUserId: client.id, requesterName: client.username };
        }
        case 'thirdPartyOrganization': {
            if (!data.recipientOrganizationId) return null;
            const organization = await deps.organizationRepository.findOrFail(data.recipientOrganizationId);
            return { organizationId: organization.id, organizationName: organization.name, recipientUserId: null, requesterName: user.username };
        }
        default:
            return null;
    }
}
