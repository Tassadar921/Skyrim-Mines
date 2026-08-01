import vine from '@vinejs/vine';

export const updateProfileValidator = vine.create({
    username: vine.string().trim().minLength(2).maxLength(50),
});
