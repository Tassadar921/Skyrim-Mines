import vine from '@vinejs/vine';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

export const resetPasswordValidator = vine.create(
    vine
        .object({
            password: vine.string().regex(PASSWORD_REGEX),
            passwordConfirmation: vine.string(),
        })
        .bail(false)
);
