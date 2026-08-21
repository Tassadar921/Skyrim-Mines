import vine from '@vinejs/vine';

export const updateDolineStockQuantityValidator = vine.create({
    quantity: vine.number().min(0),
});
