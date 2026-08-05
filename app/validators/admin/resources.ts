import vine from '@vinejs/vine';
import ResourceTypeEnum from '#types/enum/resource_type_enum';

export const createResourceValidator = vine.create({
    name: vine.string().trim().minLength(1).maxLength(100),
    type: vine.enum(Object.values(ResourceTypeEnum)),
    buyPrice: vine.number().min(0),
    sellPrice: vine.number().min(0),
});

export const updateResourceValidator = createResourceValidator;

export const reorderResourcesValidator = vine.create({
    items: vine.array(
        vine.object({
            id: vine.string().uuid(),
            order: vine.number().min(0),
        }),
    ),
});
