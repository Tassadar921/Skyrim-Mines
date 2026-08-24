import vine from '@vinejs/vine';

export const updateStocksValidator = vine.create({
    materials: vine.array(
        vine.object({
            materialId: vine.string(),
            quantity: vine.number().min(0),
        }),
    ),
    resources: vine.array(
        vine.object({
            resourceId: vine.string(),
            quantityPurchased: vine.number().min(0),
            quantityPurchasedSoljund: vine.number().min(0),
            quantityBarrelSoljund: vine.number().min(0),
        }),
    ),
});
