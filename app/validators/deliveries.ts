import vine from '@vinejs/vine';

export const createDeliveryValidator = vine.create({
    lines: vine.array(
        vine.object({
            orderLineId: vine.string().uuid(),
            quantity: vine.number().min(0),
        }),
    ),
    castellanyId: vine.string().uuid().nullable().optional(),
});
