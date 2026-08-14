import vine from '@vinejs/vine';

export const createDepositValidator = vine.create({
    items: vine.array(
        vine.object({
            resourceId: vine.string().uuid(),
            quantity: vine.number().min(0),
            soljundQuantity: vine.number().min(0).optional(),
        }),
    ),
});

export const updateDepositValidator = vine.create({
    resourceId: vine.string().uuid(),
    quantity: vine.number().min(1),
});
