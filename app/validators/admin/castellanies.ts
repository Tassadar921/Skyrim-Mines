import vine from '@vinejs/vine';

export const indexCastellanyValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['name']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
});

export const createCastellanyValidator = vine.create({
    name: vine.string().trim().minLength(1).maxLength(100),
    commissionAmount: vine.number().min(0).withoutDecimals(),
    largeOrderFeeRate: vine.number().min(0).max(100).withoutDecimals(),
});

export const updateCastellanyValidator = createCastellanyValidator;
