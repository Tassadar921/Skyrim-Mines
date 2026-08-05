import vine from '@vinejs/vine';

export const updateResourceStockQuantityValidator = vine.create({
    quantity: vine.number().min(0),
});

export const updateMaterialStockQuantityValidator = vine.create({
    quantity: vine.number().min(0),
});
