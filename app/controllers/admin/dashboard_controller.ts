import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import DeliveryRepository from '#repositories/delivery_repository';
import CastellanyTaxRepository from '#repositories/castellany_tax_repository';
import CompanyCapitalSnapshotRepository from '#repositories/company_capital_snapshot_repository';
import CompanyExpenseRepository from '#repositories/company_expense_repository';
import UserRepository from '#repositories/user_repository';
import SiteSettingRepository from '#repositories/site_setting_repository';
import TaxBracketRepository from '#repositories/tax_bracket_repository';
import UserRoleEnum from '#types/enum/user_role_enum';
import TaxSystemEnum from '#types/enum/tax_system_enum';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';
import { computeProgressiveTax } from '#helpers/progressive_tax_helper';
import { updateCastellanyTaxValidator } from '#validators/admin/castellany_tax';
import { storeCompanyCapitalSnapshotValidator } from '#validators/admin/company_capital_snapshot';
import { updateTaxBracketsValidator } from '#validators/admin/tax_brackets';
import type CastellanyTax from '#models/castellany_tax';
import type SiteSetting from '#models/site_setting';
import type TaxBracket from '#models/tax_bracket';

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

function computeLiveTax(profit: number, siteSetting: SiteSetting, castellanyTax: CastellanyTax, taxBrackets: TaxBracket[]): { weeklyTax: number; taxRate: number } {
    if (siteSetting.taxSystem === TaxSystemEnum.PROGRESSIVE) {
        const weeklyTax = computeProgressiveTax(
            profit,
            taxBrackets.map((bracket) => ({ upperBound: bracket.upperBound === null ? null : Number(bracket.upperBound), rate: bracket.rate })),
        );
        const taxRate = profit > 0 ? Math.round((weeklyTax / profit) * 100) : 0;
        return { weeklyTax, taxRate };
    }

    return { weeklyTax: profit * (castellanyTax.rate / 100), taxRate: castellanyTax.rate };
}

export default class DashboardController {
    constructor(
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly castellanyTaxRepository: CastellanyTaxRepository = new CastellanyTaxRepository(),
        private readonly companyCapitalSnapshotRepository: CompanyCapitalSnapshotRepository = new CompanyCapitalSnapshotRepository(),
        private readonly companyExpenseRepository: CompanyExpenseRepository = new CompanyExpenseRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly siteSettingRepository: SiteSettingRepository = new SiteSettingRepository(),
        private readonly taxBracketRepository: TaxBracketRepository = new TaxBracketRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const currentWeek = getWeekNumber(DateTime.now());

        const [deliveryTotals, expenseTotals, employeeDueAmount, adminDueAmount, castellanyTax, siteSetting, taxBrackets, capitalSnapshotsByWeek] = await Promise.all([
            this.deliveryRepository.getWeeklyTotals(),
            this.companyExpenseRepository.getWeeklyTotals(),
            this.userRepository.sumBalanceByRole(UserRoleEnum.STAFF),
            this.userRepository.sumBalanceByRole(UserRoleEnum.ADMIN),
            this.castellanyTaxRepository.get(),
            this.siteSettingRepository.get(),
            this.taxBracketRepository.all(),
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
            // reflect the live tax system, so changing the rate/brackets never rewrites past weeks.
            const { weeklyTax, taxRate } = capitalSnapshot
                ? { weeklyTax: Number(capitalSnapshot.weeklyTax), taxRate: capitalSnapshot.taxRate }
                : computeLiveTax(profit, siteSetting, castellanyTax, taxBrackets);
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
            taxSystem: siteSetting.taxSystem as TaxSystemEnum,
            taxBrackets: taxBrackets.map((bracket) => ({ upperBound: bracket.upperBound === null ? null : Number(bracket.upperBound), rate: bracket.rate })),
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

    public async updateTaxBrackets({ request, response, session, i18n }: HttpContext) {
        const { brackets } = await request.validateUsing(updateTaxBracketsValidator);

        const hasInvalidNullPlacement = brackets.some((bracket, index) => bracket.upperBound === null && index !== brackets.length - 1);
        const isStrictlyIncreasing = brackets.every((bracket, index) => {
            if (index === 0) return true;
            const previous = brackets[index - 1];
            return previous.upperBound !== null && bracket.upperBound !== null ? bracket.upperBound > previous.upperBound : bracket.upperBound === null;
        });

        if (hasInvalidNullPlacement || !isStrictlyIncreasing) {
            session.flash('error', i18n.t('messages.admin.dashboard.taxBrackets.update.invalid'));
            return response.redirect().back();
        }

        try {
            await this.taxBracketRepository.replaceAll(brackets);
            session.flash('success', i18n.t('messages.admin.dashboard.taxBrackets.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'dashboard.updateTaxBrackets failed');
            session.flash('error', i18n.t('messages.admin.dashboard.taxBrackets.update.error'));
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

            const [deliveryTotals, expenseTotals, castellanyTax, siteSetting, taxBrackets] = await Promise.all([
                this.deliveryRepository.getWeeklyTotals(),
                this.companyExpenseRepository.getWeeklyTotals(),
                this.castellanyTaxRepository.get(),
                this.siteSettingRepository.get(),
                this.taxBracketRepository.all(),
            ]);

            const profit = computeProfitForWeek(weekNumber, { deliveryTotals, expenseTotals });
            const { weeklyTax, taxRate } = computeLiveTax(profit, siteSetting, castellanyTax, taxBrackets);

            await this.companyCapitalSnapshotRepository.create({
                weekNumber,
                capital: String(capital),
                stockValue: String(stockValue),
                weeklyTax: String(weeklyTax),
                taxRate,
            });
            session.flash('success', i18n.t('messages.admin.dashboard.capitalSnapshot.store.success'));
        } catch (e) {
            logger.error({ err: e }, 'dashboard.storeCapitalSnapshot failed');
            session.flash('error', i18n.t('messages.admin.dashboard.capitalSnapshot.store.error'));
        }

        return response.redirect().back();
    }
}
