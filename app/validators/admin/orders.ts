import vine from '@vinejs/vine';
import OrderStatusEnum from '#types/enum/order_status_enum';

export const indexOrderValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['number', 'createdAt', 'requesterName', 'organizationName', 'totalAmount']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    status: vine.enum(Object.values(OrderStatusEnum)).optional(),
});
