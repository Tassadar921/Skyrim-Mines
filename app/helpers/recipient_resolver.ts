import { type HttpContext } from '@adonisjs/core/http';
import type OrganizationRepository from '#repositories/organization_repository';
import type UserRepository from '#repositories/user_repository';
import type OrganizationRoleEnum from '#types/enum/organization_role_enum';
import { isAdminOrForeman, isClientOrAuditor } from '#helpers/user_role_helper';

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

    if ((mode === 'thirdPartyClient' || mode === 'thirdPartyOrganization') && !isAdminOrForeman(user.role)) {
        return null;
    }

    switch (mode) {
        case 'myOrganization': {
            if (!user.organizationId) return null;
            if (options.organizationRoles && !options.organizationRoles.includes(user.organizationRole as OrganizationRoleEnum)) return null;
            const organization = await deps.organizationRepository.findEnabled(user.organizationId);
            // A disabled organization can't order anymore: its members order in their own name.
            if (!organization) return { organizationId: null, organizationName: null, recipientUserId: user.id, requesterName: user.username };
            return { organizationId: organization.id, organizationName: organization.name, recipientUserId: user.id, requesterName: user.username };
        }
        case 'myself': {
            return { organizationId: null, organizationName: null, recipientUserId: user.id, requesterName: user.username };
        }
        case 'thirdPartyClient': {
            if (!data.recipientClientId) return null;
            const client = await deps.userRepository.findOrFail(data.recipientClientId);
            if (!isClientOrAuditor(client.role)) return null;

            // A member of a disabled organization is treated as an independent client.
            const organization = client.organizationId && data.recipientScope !== 'personal' ? await deps.organizationRepository.findEnabled(client.organizationId) : null;
            if (organization) {
                return { organizationId: organization.id, organizationName: organization.name, recipientUserId: client.id, requesterName: client.username };
            }
            return { organizationId: null, organizationName: null, recipientUserId: client.id, requesterName: client.username };
        }
        case 'thirdPartyOrganization': {
            if (!data.recipientOrganizationId) return null;
            const organization = await deps.organizationRepository.findEnabled(data.recipientOrganizationId);
            if (!organization) return null;
            return { organizationId: organization.id, organizationName: organization.name, recipientUserId: null, requesterName: user.username };
        }
        default:
            return null;
    }
}
