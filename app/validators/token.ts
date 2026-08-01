import vine from '@vinejs/vine';

export const tokenValidator = vine.create({ token: vine.string().regex(/^[0-9a-f]{64}$/) });
