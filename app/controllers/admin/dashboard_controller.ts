import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import DeliveryRepository from '#repositories/delivery_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import LicensePaymentRepository from '#repositories/license_payment_repository';
import CastellanyTaxRepository from '#repositories/castellany_tax_repository';
import UserRoleEnum from '#types/enum/user_role_enum';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';
import { updateCastellanyTaxValidator } from '#validators/admin/castellany_tax';

const MAX_WEEKS_IN_RECAP = 20;

export default class DashboardController {
    constructor(
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly licensePaymentRepository: LicensePaymentRepository = new LicensePaymentRepository(),
        private readonly castellanyTaxRepository: CastellanyTaxRepository = new CastellanyTaxRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const currentWeek = getWeekNumber(DateTime.now());

        const [deliveryTotals, buybackTotals, licenseTotals, employeeDueTotals, castellanyTax] = await Promise.all([
            this.deliveryRepository.getWeeklyTotals(),
            this.resourceBuybackRepository.getWeeklyTotals(),
            this.licensePaymentRepository.getWeeklyTotals(),
            this.resourceBuybackRepository.getWeeklyTotalsByRole(UserRoleEnum.STAFF),
            this.castellanyTaxRepository.get(),
        ]);

        const deliveriesByWeek = new Map(deliveryTotals.map((entry) => [entry.weekNumber, entry.totalAmount]));
        const deliveriesProfitByWeek = new Map(deliveryTotals.map((entry) => [entry.weekNumber, entry.totalProfit]));
        const buybacksByWeek = new Map(buybackTotals.map((entry) => [entry.weekNumber, entry.totalAmount]));
        const licensesByWeek = new Map(licenseTotals.map((entry) => [entry.weekNumber, entry.totalAmount]));
        const employeeDueByWeek = new Map(employeeDueTotals.map((entry) => [entry.weekNumber, entry.totalAmount]));

        const oldestWeek = Math.max(1, currentWeek - MAX_WEEKS_IN_RECAP + 1);

        const weeklyRecap = [];
        for (let weekNumber = currentWeek; weekNumber >= oldestWeek; weekNumber--) {
            const { start, end } = getWeekRange(weekNumber);
            const licensesAmount = licensesByWeek.get(weekNumber) ?? 0;
            const profit = (deliveriesProfitByWeek.get(weekNumber) ?? 0) + licensesAmount;
            weeklyRecap.push({
                weekNumber,
                startDate: start.toJSDate().toISOString(),
                endDate: end.toJSDate().toISOString(),
                deliveriesAmount: deliveriesByWeek.get(weekNumber) ?? 0,
                profit,
                weeklyTax: profit * (castellanyTax.rate / 100),
                buybacksAmount: buybacksByWeek.get(weekNumber) ?? 0,
                licensesAmount,
                employeeDueAmount: employeeDueByWeek.get(weekNumber) ?? 0,
            });
        }

        return inertia.render('admin/dashboard', { weeklyRecap, castellanyTaxRate: castellanyTax.rate });
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
}
