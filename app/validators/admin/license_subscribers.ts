import vine from '@vinejs/vine';
import UserRoleEnum from '#types/enum/user_role_enum';

export const indexLicenseSubscriberValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['username']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    role: vine.enum([UserRoleEnum.CONTRACTOR, UserRoleEnum.CLIENT]).optional(),
    status: vine.enum(['upToDate', 'late']).optional(),
});

export const storeLicenseSubscriberValidator = vine.create({
    mode: vine.enum(['new', 'existing']).optional(),
    userId: vine.string().uuid().optional(),
    discordId: vine.string().trim().minLength(1).maxLength(32).optional(),
    username: vine.string().trim().minLength(1).maxLength(50).optional(),
    role: vine.enum([UserRoleEnum.CONTRACTOR, UserRoleEnum.CLIENT]).optional(),
});
