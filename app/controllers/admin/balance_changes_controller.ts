import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import UserBalanceChangeRepository from '#repositories/user_balance_change_repository';
import UserRepository from '#repositories/user_repository';
import type BalanceChangeActionEnum from '#types/enum/balance_change_action_enum';
import { indexBalanceChangeValidator } from '#validators/admin/balance_changes';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';

const PER_PAGE = 20;

export default class BalanceChangesController {
    constructor(
        private readonly userBalanceChangeRepository: UserBalanceChangeRepository = new UserBalanceChangeRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
    ) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search, week, action } = await request.validateUsing(indexBalanceChangeValidator);

        const currentSort = sort ?? 'createdAt';
        const currentDir = dir ?? 'desc';
        const currentPage = page ?? 1;

        const changes = await this.userBalanceChangeRepository.paginate({ page: currentPage, perPage: PER_PAGE, sort: currentSort, dir: currentDir, search, week, action });

        const weeks = [];
        for (let weekNumber = getWeekNumber(DateTime.now()); weekNumber >= 1; weekNumber--) {
            const { start, end } = getWeekRange(weekNumber);
            weeks.push({ weekNumber, startDate: start.toISODate()!, endDate: end.toISODate()! });
        }

        return inertia.render('admin/balance-changes/index', {
            changes: changes.all().map((change) => ({
                id: change.id,
                userId: change.userId,
                username: change.username,
                changedByUserId: change.changedByUserId,
                changedByUsername: change.changedByUsername,
                action: change.action as `${BalanceChangeActionEnum}`,
                previousBalance: Number(change.previousBalance),
                newBalance: Number(change.newBalance),
                weekNumber: change.weekNumber,
                createdAt: change.createdAt.toISO()!,
                rolledBack: change.rolledBackAt !== null,
            })),
            meta: { total: changes.total, currentPage: changes.currentPage, lastPage: changes.lastPage, perPage: changes.perPage },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir, week: week ?? null, action: action ?? null },
            weeks,
        });
    }

    public async rollback({ params, response, session, i18n, auth }: HttpContext) {
        try {
            const result = await this.userRepository.rollbackBalanceChange(params.id, auth.user!);
            const messages = {
                ok: ['success', 'messages.admin.balanceChanges.rollback.success'],
                notAllowed: ['error', 'messages.admin.balanceChanges.rollback.notAllowed'],
                negative: ['error', 'messages.admin.balanceChanges.rollback.negative'],
            } as const;
            const [type, key] = messages[result];
            session.flash(type, i18n.t(key));
        } catch (e) {
            logger.error({ err: e }, 'balanceChanges.rollback failed');
            session.flash('error', i18n.t('messages.admin.balanceChanges.rollback.error'));
        }

        return response.redirect().back();
    }
}
