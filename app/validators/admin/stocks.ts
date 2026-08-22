import vine from '@vinejs/vine';

export const updateStocksValidator = vine.create({
    dolineQuantity: vine.number().min(0),
    resources: vine.array(
        vine.object({
            resourceId: vine.string(),
            quantityPurchased: vine.number().min(0),
            quantityPurchasedSoljund: vine.number().min(0),
            quantityBarrelSoljund: vine.number().min(0),
        }),
    ),
});
