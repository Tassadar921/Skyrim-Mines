import BaseRepository from '#repositories/base/base_repository';
import UserBalanceChange from '#models/user_balance_change';
import type BalanceChangeActionEnum from '#types/enum/balance_change_action_enum';

export default class UserBalanceChangeRepository extends BaseRepository<typeof UserBalanceChange> {
    constructor() {
        super(UserBalanceChange);
    }

    public async paginate(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string; week?: number; action?: BalanceChangeActionEnum }) {
        const { page, perPage, sort, dir, search, week, action } = params;
        const allowedSorts: Record<string, string> = { createdAt: 'createdAt', week: 'weekNumber', username: 'username', changedBy: 'changedByUsername' };
        const sortColumn = allowedSorts[sort] ?? 'createdAt';

        const q = UserBalanceChange.query();
        if (search) {
            q.where((sub) => sub.whereILike('username', `%${search}%`).orWhereILike('changedByUsername', `%${search}%`));
        }
        if (week) {
            q.where('weekNumber', week);
        }
        if (action) {
            q.where('action', action);
        }
        q.orderBy(sortColumn, dir).orderBy('createdAt', 'desc');

        return q.paginate(page, perPage);
    }
}
