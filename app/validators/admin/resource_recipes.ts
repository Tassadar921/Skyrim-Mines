import vine from '@vinejs/vine';

export const updateResourceRecipeValidator = vine.create({
    materials: vine.array(
        vine.object({
            materialId: vine.string().uuid(),
            quantity: vine.number().min(0),
        }),
    ),
    resources: vine.array(
        vine.object({
            resourceId: vine.string().uuid(),
            quantity: vine.number().min(0),
        }),
    ),
});
