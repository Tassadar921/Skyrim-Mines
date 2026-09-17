import vine from '@vinejs/vine';

export const indexBarrelRentalValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['username']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    status: vine.enum(['upToDate', 'late']).optional(),
});

export const storeBarrelRentalValidator = vine.create({
    userId: vine.string().uuid(),
    weeklyRent: vine.number().min(0),
});

export const updateBarrelRentalValidator = vine.create({
    weeklyRent: vine.number().min(0),
});
