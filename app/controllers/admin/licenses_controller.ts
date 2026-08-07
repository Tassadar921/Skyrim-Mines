import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import LicensePriceRepository from '#repositories/license_price_repository';
import LicenseSubscriberRepository from '#repositories/license_subscriber_repository';
import LicensePaymentRepository from '#repositories/license_payment_repository';
import UserRepository from '#repositories/user_repository';
import UserTransformer from '#transformers/user_transformer';
import UserRoleEnum from '#types/enum/user_role_enum';
import { updateLicensePricesValidator } from '#validators/admin/license_prices';
import { storeLicenseSubscriberValidator } from '#validators/admin/license_subscribers';
import { storeLicensePaymentValidator } from '#validators/admin/license_payments';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';

const LICENSE_ELIGIBLE_ROLES = [UserRoleEnum.CONTRACTOR, UserRoleEnum.CLIENT];

export default class LicensesController {
    constructor(
        private readonly licensePriceRepository: LicensePriceRepository = new LicensePriceRepository(),
        private readonly licenseSubscriberRepository: LicenseSubscriberRepository = new LicenseSubscriberRepository(),
        private readonly licensePaymentRepository: LicensePaymentRepository = new LicensePaymentRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const prices = await this.licensePriceRepository.get();
        const subscribers = await this.licenseSubscriberRepository.all();
        const summaries = await this.licensePaymentRepository.summaryBySubscriber();
        const eligibleUsers = await this.userRepository.findEligibleForLicenseSubscription();

        const currentWeek = getWeekNumber(DateTime.now());
        const rawWeeklyTotals = await this.licensePaymentRepository.getWeeklyTotals();
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
                paymentCount: entry?.paymentCount ?? 0,
            });
        }

        return inertia.render('admin/licenses/index', {
            prices: { citizenPrice: Number(prices.citizenPrice), nonCitizenPrice: Number(prices.nonCitizenPrice) },
            subscribers: subscribers.map((subscriber) => {
                const summary = summaries.get(subscriber.id);
                return {
                    id: subscriber.id,
                    username: subscriber.user.username,
                    role: subscriber.user.role,
                    lastPaidWeek: summary?.lastPaidWeek ?? null,
                    totalPaid: summary?.totalPaid ?? 0,
                    paymentCount: summary?.paymentCount ?? 0,
                };
            }),
            eligibleUsers: eligibleUsers.map((user) => new UserTransformer(user).toObject()),
            currentWeek,
            weeklyTotals,
        });
    }

    public async updatePrices({ request, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(updateLicensePricesValidator);

        try {
            await this.licensePriceRepository.update(data);
            session.flash('success', i18n.t('messages.admin.licenses.prices.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'licenses.updatePrices failed');
            session.flash('error', i18n.t('messages.admin.licenses.prices.update.error'));
        }

        return response.redirect().back();
    }

    public async storeSubscriber({ request, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(storeLicenseSubscriberValidator);

        try {
            let userId: string;

            if (data.mode === 'existing') {
                if (!data.userId) {
                    session.flash('error', i18n.t('messages.admin.licenses.subscribers.create.missingUser'));
                    return response.redirect().back();
                }

                const target = await this.userRepository.findOrFail(data.userId);
                if (!LICENSE_ELIGIBLE_ROLES.includes(target.role as UserRoleEnum)) {
                    session.flash('error', i18n.t('messages.admin.licenses.subscribers.create.userNotEligible'));
                    return response.redirect().back();
                }

                userId = target.id;
            } else {
                if (!data.discordId || !data.username || !data.role) {
                    session.flash('error', i18n.t('messages.admin.licenses.subscribers.create.missingFields'));
                    return response.redirect().back();
                }

                if (await this.userRepository.findByDiscordId(data.discordId)) {
                    session.flash('error', i18n.t('messages.admin.licenses.subscribers.create.discordIdTaken'));
                    return response.redirect().back();
                }

                const user = await this.userRepository.create({ discordId: data.discordId, username: data.username, role: data.role });
                userId = user.id;
            }

            await this.licenseSubscriberRepository.create({ userId });
            session.flash('success', i18n.t('messages.admin.licenses.subscribers.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'licenses.storeSubscriber failed');
            session.flash('error', i18n.t('messages.admin.licenses.subscribers.create.error'));
        }

        return response.redirect().back();
    }

    public async showSubscriber({ inertia, params }: HttpContext) {
        const subscriber = await this.licenseSubscriberRepository.findOrFail(params.id);
        const payments = await this.licensePaymentRepository.findForSubscriber(params.id);
        const prices = await this.licensePriceRepository.get();
        const currentWeek = getWeekNumber(DateTime.now());

        const availableWeeks = [currentWeek, currentWeek + 1, currentWeek + 2, currentWeek + 3].map((weekNumber) => {
            const { start, end } = getWeekRange(weekNumber);
            return { weekNumber, startDate: start.toJSDate().toISOString(), endDate: end.toJSDate().toISOString() };
        });

        return inertia.render('admin/licenses/show', {
            subscriber: {
                id: subscriber.id,
                username: subscriber.user.username,
                role: subscriber.user.role,
            },
            payments: payments.map((payment) => ({
                id: payment.id,
                weekNumber: payment.weekNumber,
                isCitizen: payment.isCitizen,
                amountPaid: Number(payment.amountPaid),
                createdAt: payment.createdAt.toISO()!,
            })),
            prices: { citizenPrice: Number(prices.citizenPrice), nonCitizenPrice: Number(prices.nonCitizenPrice) },
            currentWeek,
            availableWeeks,
        });
    }

    public async destroySubscriber({ params, response, session, i18n }: HttpContext) {
        try {
            await this.licenseSubscriberRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.licenses.subscribers.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'licenses.destroySubscriber failed');
            session.flash('error', i18n.t('messages.admin.licenses.subscribers.destroy.error'));
        }

        return response.redirect().toRoute('admin.licenses.index');
    }

    public async storePayment({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(storeLicensePaymentValidator);

        try {
            await this.licenseSubscriberRepository.findOrFail(params.id);
            await this.licensePaymentRepository.create({ subscriberId: params.id, weekNumber: data.weekNumber, isCitizen: data.isCitizen, amountPaid: String(data.amountPaid) });
            session.flash('success', i18n.t('messages.admin.licenses.payments.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'licenses.storePayment failed');
            session.flash('error', i18n.t('messages.admin.licenses.payments.create.error'));
        }

        return response.redirect().back();
    }

    public async destroyPayment({ params, response, session, i18n }: HttpContext) {
        try {
            await this.licensePaymentRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.licenses.payments.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'licenses.destroyPayment failed');
            session.flash('error', i18n.t('messages.admin.licenses.payments.destroy.error'));
        }

        return response.redirect().back();
    }
}
