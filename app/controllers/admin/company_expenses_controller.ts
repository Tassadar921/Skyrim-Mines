import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import CompanyExpenseRepository from '#repositories/company_expense_repository';
import { indexCompanyExpenseValidator, storeCompanyExpenseValidator } from '#validators/admin/company_expenses';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';

const PER_PAGE = 20;

export default class CompanyExpensesController {
    constructor(private readonly companyExpenseRepository: CompanyExpenseRepository = new CompanyExpenseRepository()) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search, week } = await request.validateUsing(indexCompanyExpenseValidator);

        const currentSort = sort ?? 'createdAt';
        const currentDir = dir ?? 'desc';
        const currentPage = page ?? 1;

        const expenses = await this.companyExpenseRepository.paginate({ page: currentPage, perPage: PER_PAGE, sort: currentSort, dir: currentDir, search, week });

        const currentWeek = getWeekNumber(DateTime.now());
        const rawWeeklyTotals = await this.companyExpenseRepository.getWeeklyTotals();
        const weeklyTotalsByWeek = new Map(rawWeeklyTotals.map((entry) => [entry.weekNumber, entry]));

        const weeklyTotals = [];
        for (let weekNumber = currentWeek; weekNumber >= 1; weekNumber--) {
            const { start, end } = getWeekRange(weekNumber);
            const entry = weeklyTotalsByWeek.get(weekNumber);
            weeklyTotals.push({
                weekNumber,
                startDate: start.toJSDate().toISOString(),
                endDate: end.toJSDate().toISOString(),
                totalAmount: entry?.totalAmount ?? 0,
            });
        }

        return inertia.render('admin/expenses/index', {
            expenses: expenses.all().map((expense) => ({
                id: expense.id,
                weekNumber: expense.weekNumber,
                title: expense.title,
                label: expense.label,
                amount: Number(expense.amount),
                createdAt: expense.createdAt.toISO()!,
            })),
            meta: { total: expenses.total, currentPage: expenses.currentPage, lastPage: expenses.lastPage, perPage: expenses.perPage },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir, week: week ?? null },
            currentWeek,
            weeklyTotals,
        });
    }

    public async store({ request, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(storeCompanyExpenseValidator);

        try {
            await this.companyExpenseRepository.create({ weekNumber: data.weekNumber, title: data.title, label: data.label, amount: String(data.amount) });
            session.flash('success', i18n.t('messages.admin.expenses.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'expenses.store failed');
            session.flash('error', i18n.t('messages.admin.expenses.create.error'));
        }

        return response.redirect().back();
    }

    public async destroy({ params, response, session, i18n }: HttpContext) {
        try {
            await this.companyExpenseRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.expenses.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'expenses.destroy failed');
            session.flash('error', i18n.t('messages.admin.expenses.destroy.error'));
        }

        return response.redirect().back();
    }
}
