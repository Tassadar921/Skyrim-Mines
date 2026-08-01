import vine from '@vinejs/vine';

export const loginValidator = vine.create({
    email: vine.string().trim().email().maxLength(100),
    password: vine.string().trim(),
    acceptTerms: vine.boolean().optional(),
});

export const forgotPasswordValidator = vine.create({
    email: vine.string().trim().email().maxLength(100),
});
