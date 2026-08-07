import vine from '@vinejs/vine';

export const updateCastellanyTaxValidator = vine.create({
    rate: vine.number().min(0).max(100).withoutDecimals(),
});
