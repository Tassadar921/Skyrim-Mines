import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import DeliveryRepository from '#repositories/delivery_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import LicensePaymentRepository from '#repositories/license_payment_repository';
import CastellanyTaxRepository from '#repositories/castellany_tax_repository';
import LargeOrderSettingRepository from '#repositories/large_order_setting_repository';
import UserRoleEnum from '#types/enum/user_role_enum';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';
import { updateCastellanyTaxValidator } from '#validators/admin/castellany_tax';
import { updateLargeOrderSettingValidator } from '#validators/admin/large_order_setting';

const MAX_WEEKS_IN_RECAP = 20;

export default class DashboardController {
    constructor(
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly licensePaymentRepository: LicensePaymentRepository = new LicensePaymentRepository(),
        private readonly castellanyTaxRepository: CastellanyTaxRepository = new CastellanyTaxRepository(),
        private readonly largeOrderSettingRepository: LargeOrderSettingRepository = new LargeOrderSettingRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const currentWeek = getWeekNumber(DateTime.now());

        const [deliveryTotals, commissionTotals, largeOrderFeeTotals, buybackTotals, licenseTotals, employeeDueTotals, castellanyTax, largeOrderSetting] = await Promise.all([
            this.deliveryRepository.getWeeklyTotals(),
            this.deliveryRepository.getWeeklyCommissionTotals(),
            this.deliveryRepository.getWeeklyLargeOrderFeeTotals(),
            this.resourceBuybackRepository.getWeeklyTotals(),
            this.licensePaymentRepository.getWeeklyTotals(),
            this.resourceBuybackRepository.getWeeklyTotalsByRole(UserRoleEnum.STAFF),
            this.castellanyTaxRepository.get(),
            this.largeOrderSettingRepository.get(),
        ]);

        const deliveriesByWeek = new Map(deliveryTotals.map((entry) => [entry.weekNumber, entry.totalAmount]));
        const deliveriesProfitByWeek = new Map(deliveryTotals.map((entry) => [entry.weekNumber, entry.totalProfit]));
        const commissionsByWeek = new Map(commissionTotals.map((entry) => [entry.weekNumber, entry.totalCommission]));
        const largeOrderFeesByWeek = new Map(largeOrderFeeTotals.map((entry) => [entry.weekNumber, entry.totalFee]));
        const buybacksByWeek = new Map(buybackTotals.map((entry) => [entry.weekNumber, entry.totalAmount]));
        const licensesByWeek = new Map(licenseTotals.map((entry) => [entry.weekNumber, entry.totalAmount]));
        const employeeDueByWeek = new Map(employeeDueTotals.map((entry) => [entry.weekNumber, entry.totalAmount]));

        const oldestWeek = Math.max(1, currentWeek - MAX_WEEKS_IN_RECAP + 1);

        const weeklyRecap = [];
        for (let weekNumber = currentWeek; weekNumber >= oldestWeek; weekNumber--) {
            const { start, end } = getWeekRange(weekNumber);
            const licensesAmount = licensesByWeek.get(weekNumber) ?? 0;
            const commissionsAmount = commissionsByWeek.get(weekNumber) ?? 0;
            const largeOrderFeesAmount = largeOrderFeesByWeek.get(weekNumber) ?? 0;
            const grossProfit = (deliveriesProfitByWeek.get(weekNumber) ?? 0) + licensesAmount;
            const profit = grossProfit + largeOrderFeesAmount - commissionsAmount;
            weeklyRecap.push({
                weekNumber,
                startDate: start.toJSDate().toISOString(),
                endDate: end.toJSDate().toISOString(),
                deliveriesAmount: deliveriesByWeek.get(weekNumber) ?? 0,
                commissionsAmount,
                largeOrderFeesAmount,
                profit,
                weeklyTax: profit * (castellanyTax.rate / 100),
                buybacksAmount: buybacksByWeek.get(weekNumber) ?? 0,
                licensesAmount,
                employeeDueAmount: employeeDueByWeek.get(weekNumber) ?? 0,
            });
        }

        return inertia.render('admin/dashboard', {
            weeklyRecap,
            castellanyTaxRate: castellanyTax.rate,
            largeOrderThresholdQuantity: largeOrderSetting.thresholdQuantity,
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

    public async updateLargeOrderSetting({ request, response, session, i18n }: HttpContext) {
        const { thresholdQuantity } = await request.validateUsing(updateLargeOrderSettingValidator);

        try {
            await this.largeOrderSettingRepository.update(thresholdQuantity);
            session.flash('success', i18n.t('messages.admin.dashboard.largeOrderSetting.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'dashboard.updateLargeOrderSetting failed');
            session.flash('error', i18n.t('messages.admin.dashboard.largeOrderSetting.update.error'));
        }

        return response.redirect().back();
    }
}
