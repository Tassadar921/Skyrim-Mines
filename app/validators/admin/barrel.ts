import vine from '@vinejs/vine';

export const updateBarrelQuantityValidator = vine.create({
    userId: vine.string().uuid(),
    resourceId: vine.string().uuid(),
    quantity: vine.number().min(0),
});
