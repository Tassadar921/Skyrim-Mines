import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import BarrelRentalRepository from '#repositories/barrel_rental_repository';
import BarrelRentalPaymentRepository from '#repositories/barrel_rental_payment_repository';
import UserRepository from '#repositories/user_repository';
import UserTransformer from '#transformers/user_transformer';
import { indexBarrelRentalValidator, storeBarrelRentalValidator, updateBarrelRentalValidator } from '#validators/admin/barrel_rentals';
import { storeBarrelRentalPaymentValidator } from '#validators/admin/barrel_rental_payments';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';

export default class BarrelRentalsController {
    constructor(
        private readonly barrelRentalRepository: BarrelRentalRepository = new BarrelRentalRepository(),
        private readonly barrelRentalPaymentRepository: BarrelRentalPaymentRepository = new BarrelRentalPaymentRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
    ) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search, status } = await request.validateUsing(indexBarrelRentalValidator);

        const currentSort = sort ?? 'username';
        const currentDir = dir ?? 'asc';
        const currentPage = page ?? 1;
        const perPage = 20;

        const eligibleUsers = await this.userRepository.findEligibleForBarrelRental();
        const currentWeek = getWeekNumber(DateTime.now());

        const { rows: rentals, total } = await this.barrelRentalRepository.paginate({
            page: currentPage,
            perPage,
            sort: currentSort,
            dir: currentDir,
            search,
            status,
            currentWeek,
        });

        const rawWeeklyTotals = await this.barrelRentalPaymentRepository.getWeeklyTotals();
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

        return inertia.render('admin/barrel-rentals/index', {
            rentals,
            meta: { total, currentPage, lastPage: Math.max(1, Math.ceil(total / perPage)), perPage },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir, status: status ?? '' },
            eligibleUsers: eligibleUsers.map((user) => new UserTransformer(user).toObject()),
            currentWeek,
            weeklyTotals,
        });
    }

    public async store({ request, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(storeBarrelRentalValidator);

        try {
            await this.barrelRentalRepository.create({ userId: data.userId, weeklyRent: String(data.weeklyRent) });
            session.flash('success', i18n.t('messages.admin.barrelRentals.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'barrelRentals.store failed');
            session.flash('error', i18n.t('messages.admin.barrelRentals.create.error'));
        }

        return response.redirect().back();
    }

    public async show({ inertia, params }: HttpContext) {
        const rental = await this.barrelRentalRepository.findOrFail(params.id);
        const payments = await this.barrelRentalPaymentRepository.findForRental(params.id);
        const currentWeek = getWeekNumber(DateTime.now());

        const availableWeeks = [currentWeek, currentWeek + 1, currentWeek + 2, currentWeek + 3].map((weekNumber) => {
            const { start, end } = getWeekRange(weekNumber);
            return { weekNumber, startDate: start.toJSDate().toISOString(), endDate: end.toJSDate().toISOString() };
        });

        return inertia.render('admin/barrel-rentals/show', {
            rental: {
                id: rental.id,
                username: rental.user.username,
                role: rental.user.role,
                weeklyRent: Number(rental.weeklyRent),
            },
            payments: payments.map((payment) => ({
                id: payment.id,
                weekNumber: payment.weekNumber,
                amountPaid: Number(payment.amountPaid),
                createdAt: payment.createdAt.toISO()!,
            })),
            currentWeek,
            availableWeeks,
        });
    }

    public async updateRent({ request, params, response, session, i18n }: HttpContext) {
        const { weeklyRent } = await request.validateUsing(updateBarrelRentalValidator);

        try {
            await this.barrelRentalRepository.updateRent(params.id, String(weeklyRent));
            session.flash('success', i18n.t('messages.admin.barrelRentals.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'barrelRentals.updateRent failed');
            session.flash('error', i18n.t('messages.admin.barrelRentals.update.error'));
        }

        return response.redirect().back();
    }

    public async destroy({ params, response, session, i18n }: HttpContext) {
        try {
            await this.barrelRentalRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.barrelRentals.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'barrelRentals.destroy failed');
            session.flash('error', i18n.t('messages.admin.barrelRentals.destroy.error'));
        }

        return response.redirect().toRoute('admin.barrelRentals.index');
    }

    public async storePayment({ request, params, response, session, i18n }: HttpContext) {
        const { weekNumber } = await request.validateUsing(storeBarrelRentalPaymentValidator);

        try {
            const rental = await this.barrelRentalRepository.findOrFail(params.id);
            await this.barrelRentalPaymentRepository.create({ rentalId: rental.id, weekNumber, amountPaid: rental.weeklyRent });
            session.flash('success', i18n.t('messages.admin.barrelRentals.payments.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'barrelRentals.storePayment failed');
            session.flash('error', i18n.t('messages.admin.barrelRentals.payments.create.error'));
        }

        return response.redirect().back();
    }

    public async destroyPayment({ params, response, session, i18n }: HttpContext) {
        try {
            await this.barrelRentalPaymentRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.barrelRentals.payments.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'barrelRentals.destroyPayment failed');
            session.flash('error', i18n.t('messages.admin.barrelRentals.payments.destroy.error'));
        }

        return response.redirect().back();
    }
}
