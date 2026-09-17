import vine from '@vinejs/vine';

export const indexCompanyExpenseValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['title', 'amount', 'week', 'createdAt']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    week: vine.number().min(1).optional(),
});

export const storeCompanyExpenseValidator = vine.create({
    weekNumber: vine.number().min(1),
    title: vine.string().trim().minLength(1).maxLength(100),
    label: vine.string().trim().minLength(1).maxLength(255),
    amount: vine.number().min(0),
});
