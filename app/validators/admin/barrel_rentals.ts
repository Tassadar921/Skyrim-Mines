import vine from '@vinejs/vine';

export const indexBarrelRentalValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['label']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    status: vine.enum(['vacant', 'upToDate', 'late']).optional(),
});

export const storeBarrelRentalValidator = vine.create({
    label: vine.string().trim().minLength(1).maxLength(100),
    price: vine.number().min(0),
    userId: vine.string().uuid().nullable(),
});

export const updateBarrelRentalValidator = storeBarrelRentalValidator;
