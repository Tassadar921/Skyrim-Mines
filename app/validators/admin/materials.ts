import vine from '@vinejs/vine';

export const createMaterialValidator = vine.create({
    name: vine.string().trim().minLength(1).maxLength(100),
    buyPrice: vine.number().min(0),
});

export const updateMaterialValidator = createMaterialValidator;

export const reorderMaterialsValidator = vine.create({
    items: vine.array(
        vine.object({
            id: vine.string().uuid(),
            order: vine.number().min(0),
        }),
    ),
});
