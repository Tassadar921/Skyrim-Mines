import vine from '@vinejs/vine';

export const indexQuoteValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['number', 'createdAt', 'requesterName', 'organizationName', 'totalAmount']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
});
