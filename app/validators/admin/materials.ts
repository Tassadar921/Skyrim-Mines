import vine from '@vinejs/vine';

export const indexMaterialValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['name']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
});

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
