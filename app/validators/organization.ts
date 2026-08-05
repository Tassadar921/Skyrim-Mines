import vine from '@vinejs/vine';
import OrganizationRoleEnum from '#types/enum/organization_role_enum';

export const storeOrganizationMemberValidator = vine.create({
    mode: vine.enum(['new', 'existing']).optional(),
    userId: vine.string().uuid().optional(),
    discordId: vine.string().trim().minLength(1).maxLength(32).optional(),
    username: vine.string().trim().minLength(1).maxLength(50).optional(),
    role: vine.enum(Object.values(OrganizationRoleEnum)),
});

export const updateOrganizationMemberRoleValidator = vine.create({
    role: vine.enum([OrganizationRoleEnum.STAFF, OrganizationRoleEnum.ADMIN]),
});
