import vine from '@vinejs/vine';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

export const registerValidator = vine.create({
    username: vine.string().trim().minLength(2).maxLength(50),
    email: vine.string().trim().email().maxLength(100),
    password: vine.string().regex(PASSWORD_REGEX),
    passwordConfirmation: vine.string(),
    acceptedTerms: vine.boolean(),
});
