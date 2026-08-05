import vine from '@vinejs/vine';

export const indexDeliveryValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['deliveredAt', 'week']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    week: vine.number().min(1).optional(),
});
