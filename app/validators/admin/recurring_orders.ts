import vine from '@vinejs/vine';

export const storeRecurringOrderValidator = vine.create({
    label: vine.string().trim().minLength(1).maxLength(100),
    /** ISO weekday: 1 = Monday … 7 = Sunday. */
    weekday: vine.number().withoutDecimals().min(1).max(7),
    time: vine.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    lines: vine
        .array(
            vine.object({
                resourceId: vine.string().uuid(),
                quantity: vine.number().withoutDecimals().min(1),
                unitPrice: vine.number().min(0),
            }),
        )
        .minLength(1),
});
