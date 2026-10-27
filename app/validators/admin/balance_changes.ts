import vine from '@vinejs/vine';
import BalanceChangeActionEnum from '#types/enum/balance_change_action_enum';

export const indexBalanceChangeValidator = vine.create({
    page: vine.number().min(1).optional(),
    sort: vine.enum(['createdAt', 'week', 'username', 'changedBy']).optional(),
    dir: vine.enum(['asc', 'desc']).optional(),
    search: vine.string().trim().maxLength(100).optional(),
    week: vine.number().min(1).optional(),
    action: vine.enum(Object.values(BalanceChangeActionEnum)).optional(),
});
