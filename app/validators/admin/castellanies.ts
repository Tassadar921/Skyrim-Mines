import vine from '@vinejs/vine';

export const createCastellanyValidator = vine.create({
    name: vine.string().trim().minLength(1).maxLength(100),
    commissionAmount: vine.number().min(0).withoutDecimals(),
    largeOrderFeeRate: vine.number().min(0).max(100).withoutDecimals(),
});

export const updateCastellanyValidator = createCastellanyValidator;
