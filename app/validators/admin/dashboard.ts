import vine from '@vinejs/vine';

export const invalidateTermsValidator = vine.create({
    gracePeriodDays: vine.number().min(1).max(365),
    note: vine.string().trim().maxLength(500).optional().nullable(),
});
