import vine from '@vinejs/vine';
import ResourceTypeEnum from '#types/enum/resource_type_enum';

export const indexTonneauValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['username', 'resourceName']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    resourceType: vine.enum(Object.values(ResourceTypeEnum)).optional(),
});

export const updateBarrelQuantityValidator = vine.create({
    userId: vine.string().uuid(),
    resourceId: vine.string().uuid(),
    quantity: vine.number().min(0),
});
