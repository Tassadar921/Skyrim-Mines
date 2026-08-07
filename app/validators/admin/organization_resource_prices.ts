import vine from '@vinejs/vine';

export const upsertOrganizationResourcePriceValidator = vine.create({
    sellPrice: vine.number().min(0),
});
