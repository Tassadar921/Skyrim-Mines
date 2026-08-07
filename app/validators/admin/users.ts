import vine from '@vinejs/vine';
import UserRoleEnum from '#types/enum/user_role_enum';
import OrganizationRoleEnum from '#types/enum/organization_role_enum';

export const indexUserValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['username', 'createdAt']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    withoutAvatar: vine.boolean().optional(),
});

export const updateUserValidator = vine.create({
    username: vine.string().trim().maxLength(50),
    role: vine.enum(Object.values(UserRoleEnum)),
    enabled: vine.boolean(),
});

export const updateUserBalanceValidator = vine.create({
    balance: vine.number().min(0),
});

export const updateUserAvatarValidator = vine.create({
    avatar: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }),
});

export const createUserValidator = vine.create({
    discordId: vine.string().trim().minLength(1).maxLength(32),
    username: vine.string().trim().minLength(1).maxLength(50),
    role: vine.enum(Object.values(UserRoleEnum)),
    organizationMode: vine.enum(['existing', 'new']).optional(),
    organizationId: vine.string().uuid().optional(),
    organizationName: vine.string().trim().minLength(1).maxLength(100).optional(),
    organizationRole: vine.enum(Object.values(OrganizationRoleEnum)).optional(),
});
