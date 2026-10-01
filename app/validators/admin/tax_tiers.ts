import vine from '@vinejs/vine';

export const updateTaxTiersValidator = vine.create({
    tiers: vine
        .array(
            vine.object({
                upperBound: vine.number().min(0).nullable(),
                rate: vine.number().min(0).max(100).withoutDecimals(),
            }),
        )
        .minLength(1),
});
