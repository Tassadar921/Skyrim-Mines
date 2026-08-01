import vine from '@vinejs/vine';
import UserRoleEnum from '#types/enum/user_role_enum';

export const indexUserValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['username', 'email', 'createdAt']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
});

export const updateUserValidator = vine.create({
    username: vine.string().trim().maxLength(50),
    role: vine.enum(Object.values(UserRoleEnum)),
    enabled: vine.boolean(),
});
