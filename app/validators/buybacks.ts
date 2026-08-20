import vine from '@vinejs/vine';

export const createBuybackValidator = vine.create({
    items: vine.array(
        vine.object({
            resourceId: vine.string().uuid(),
            quantity: vine.number().min(0),
            soljundQuantity: vine.number().min(0).optional(),
        }),
    ),
});
