import vine from '@vinejs/vine';

export const indexOrderValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['number', 'createdAt', 'requesterName', 'totalAmount']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
});
