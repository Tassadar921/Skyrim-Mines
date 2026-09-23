import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import DeliveryRepository from '#repositories/delivery_repository';
import CastellanyTaxRepository from '#repositories/castellany_tax_repository';
import CompanyCapitalSnapshotRepository from '#repositories/company_capital_snapshot_repository';
import CompanyExpenseRepository from '#repositories/company_expense_repository';
import UserRepository from '#repositories/user_repository';
import UserRoleEnum from '#types/enum/user_role_enum';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';
import { updateCastellanyTaxValidator } from '#validators/admin/castellany_tax';
import { storeCompanyCapitalSnapshotValidator } from '#validators/admin/company_capital_snapshot';

const MAX_WEEKS_IN_RECAP = 20;

type WeeklyTotalsBundle = {
    deliveryTotals: { weekNumber: number; totalProfit: number }[];
    expenseTotals: { weekNumber: number; totalAmount: number }[];
};

function computeProfitForWeek(weekNumber: number, totals: WeeklyTotalsBundle): number {
    const deliveriesProfit = totals.deliveryTotals.find((entry) => entry.weekNumber === weekNumber)?.totalProfit ?? 0;
    const expensesAmount = totals.expenseTotals.find((entry) => entry.weekNumber === weekNumber)?.totalAmount ?? 0;

    return deliveriesProfit - expensesAmount;
}

export default class DashboardController {
    constructor(
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly castellanyTaxRepository: CastellanyTaxRepository = new CastellanyTaxRepository(),
        private readonly companyCapitalSnapshotRepository: CompanyCapitalSnapshotRepository = new CompanyCapitalSnapshotRepository(),
        private readonly companyExpenseRepository: CompanyExpenseRepository = new CompanyExpenseRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const currentWeek = getWeekNumber(DateTime.now());

        const [deliveryTotals, expenseTotals, employeeDueAmount, adminDueAmount, castellanyTax, capitalSnapshotsByWeek] = await Promise.all([
            this.deliveryRepository.getWeeklyTotals(),
            this.companyExpenseRepository.getWeeklyTotals(),
            this.userRepository.sumBalanceByRole(UserRoleEnum.STAFF),
            this.userRepository.sumBalanceByRole(UserRoleEnum.ADMIN),
            this.castellanyTaxRepository.get(),
            this.companyCapitalSnapshotRepository.allByWeek(),
        ]);

        const deliveriesByWeek = new Map(deliveryTotals.map((entry) => [entry.weekNumber, entry.totalAmount]));
        const weeklyTotals: WeeklyTotalsBundle = { deliveryTotals, expenseTotals };

        const oldestWeek = Math.max(1, currentWeek - MAX_WEEKS_IN_RECAP + 1);

        const weeklyRecap = [];
        for (let weekNumber = currentWeek; weekNumber >= oldestWeek; weekNumber--) {
            const { start, end } = getWeekRange(weekNumber);
            const profit = computeProfitForWeek(weekNumber, weeklyTotals);
            const capitalSnapshot = capitalSnapshotsByWeek.get(weekNumber);
            const capital = capitalSnapshot ? Number(capitalSnapshot.capital) : null;
            const stockValue = capitalSnapshot ? Number(capitalSnapshot.stockValue) : null;
            // Once a week has been recorded (capital/stock snapshot), its tax and rate are frozen at
            // the value in effect at that time; only un-recorded weeks (normally just the current one)
            // reflect the live castellany tax rate, so changing the rate never rewrites past weeks.
            const weeklyTax = capitalSnapshot ? Number(capitalSnapshot.weeklyTax) : profit * (castellanyTax.rate / 100);
            const taxRate = capitalSnapshot ? capitalSnapshot.taxRate : castellanyTax.rate;
            weeklyRecap.push({
                weekNumber,
                startDate: start.toJSDate().toISOString(),
                endDate: end.toJSDate().toISOString(),
                deliveriesAmount: deliveriesByWeek.get(weekNumber) ?? 0,
                profit,
                weeklyTax,
                taxRate,
                capital,
                stockValue,
                totalCapital: capital !== null && stockValue !== null ? capital + stockValue : null,
            });
        }

        return inertia.render('admin/dashboard', {
            weeklyRecap,
            employeeDueAmount,
            adminDueAmount,
            castellanyTaxRate: castellanyTax.rate,
        });
    }

    public async updateCastellanyTax({ request, response, session, i18n }: HttpContext) {
        const { rate } = await request.validateUsing(updateCastellanyTaxValidator);

        try {
            await this.castellanyTaxRepository.update(rate);
            session.flash('success', i18n.t('messages.admin.dashboard.castellanyTax.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'dashboard.updateCastellanyTax failed');
            session.flash('error', i18n.t('messages.admin.dashboard.castellanyTax.update.error'));
        }

        return response.redirect().back();
    }

    public async storeCapitalSnapshot({ request, response, session, i18n }: HttpContext) {
        const { capital, stockValue } = await request.validateUsing(storeCompanyCapitalSnapshotValidator);
        const weekNumber = getWeekNumber(DateTime.now());

        try {
            const existing = await this.companyCapitalSnapshotRepository.findOneBy({ weekNumber });
            if (existing) {
                session.flash('error', i18n.t('messages.admin.dashboard.capitalSnapshot.store.alreadyExists'));
                return response.redirect().back();
            }

            const [deliveryTotals, expenseTotals, castellanyTax] = await Promise.all([
                this.deliveryRepository.getWeeklyTotals(),
                this.companyExpenseRepository.getWeeklyTotals(),
                this.castellanyTaxRepository.get(),
            ]);

            const profit = computeProfitForWeek(weekNumber, { deliveryTotals, expenseTotals });
            const weeklyTax = profit * (castellanyTax.rate / 100);

            await this.companyCapitalSnapshotRepository.create({
                weekNumber,
                capital: String(capital),
                stockValue: String(stockValue),
                weeklyTax: String(weeklyTax),
                taxRate: castellanyTax.rate,
            });
            session.flash('success', i18n.t('messages.admin.dashboard.capitalSnapshot.store.success'));
        } catch (e) {
            logger.error({ err: e }, 'dashboard.storeCapitalSnapshot failed');
            session.flash('error', i18n.t('messages.admin.dashboard.capitalSnapshot.store.error'));
        }

        return response.redirect().back();
    }
}
