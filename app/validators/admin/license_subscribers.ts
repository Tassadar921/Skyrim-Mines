import vine from '@vinejs/vine';
import UserRoleEnum from '#types/enum/user_role_enum';

export const storeLicenseSubscriberValidator = vine.create({
    mode: vine.enum(['new', 'existing']).optional(),
    userId: vine.string().uuid().optional(),
    discordId: vine.string().trim().minLength(1).maxLength(32).optional(),
    username: vine.string().trim().minLength(1).maxLength(50).optional(),
    role: vine.enum([UserRoleEnum.CONTRACTOR, UserRoleEnum.CLIENT]).optional(),
});
