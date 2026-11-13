import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import BarrelRentalRepository from '#repositories/barrel_rental_repository';
import BarrelRentalPaymentRepository from '#repositories/barrel_rental_payment_repository';
import UserRepository from '#repositories/user_repository';
import SiteSettingRepository from '#repositories/site_setting_repository';
import FileRepository from '#repositories/file_repository';
import UserTransformer from '#transformers/user_transformer';
import { indexBarrelRentalValidator, storeBarrelRentalValidator, updateBarrelMapValidator, updateBarrelRentalValidator } from '#validators/admin/barrel_rentals';
import { storeUploadedFile, deleteStoredFile } from '#helpers/file_storage_helper';
import { storeBarrelRentalPaymentValidator } from '#validators/admin/barrel_rental_payments';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';

export default class BarrelRentalsController {
    constructor(
        private readonly barrelRentalRepository: BarrelRentalRepository = new BarrelRentalRepository(),
        private readonly barrelRentalPaymentRepository: BarrelRentalPaymentRepository = new BarrelRentalPaymentRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly siteSettingRepository: SiteSettingRepository = new SiteSettingRepository(),
        private readonly fileRepository: FileRepository = new FileRepository(),
    ) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search, status } = await request.validateUsing(indexBarrelRentalValidator);

        const currentSort = sort ?? 'label';
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
                startDate: start.toISODate()!,
                endDate: end.toISODate()!,
                totalAmount: entry?.totalAmount ?? 0,
                paymentCount: entry?.paymentCount ?? 0,
            });
        }

        const siteSetting = await this.siteSettingRepository.getWithBarrelMap();

        return inertia.render('admin/barrel-rentals/index', {
            barrelMapUrl: siteSetting.barrelMapFile?.path ?? null,
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
            await this.barrelRentalRepository.create({ label: data.label, price: String(data.price), userId: data.userId });
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
        const eligibleUsers = await this.userRepository.findEligibleForBarrelRental(params.id);

        const availableWeeks = [currentWeek, currentWeek + 1, currentWeek + 2, currentWeek + 3].map((weekNumber) => {
            const { start, end } = getWeekRange(weekNumber);
            return { weekNumber, startDate: start.toISODate()!, endDate: end.toISODate()! };
        });

        return inertia.render('admin/barrel-rentals/show', {
            rental: {
                id: rental.id,
                label: rental.label,
                price: Number(rental.price),
                userId: rental.userId,
                username: rental.user?.username ?? null,
                role: rental.user?.role ?? null,
            },
            payments: payments.map((payment) => ({
                id: payment.id,
                weekNumber: payment.weekNumber,
                amountPaid: Number(payment.amountPaid),
                createdAt: payment.createdAt.toISO()!,
            })),
            currentWeek,
            availableWeeks,
            eligibleUsers: eligibleUsers.map((user) => new UserTransformer(user).toObject()),
        });
    }

    public async update({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(updateBarrelRentalValidator);

        try {
            await this.barrelRentalRepository.update(params.id, { label: data.label, price: String(data.price), userId: data.userId });
            session.flash('success', i18n.t('messages.admin.barrelRentals.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'barrelRentals.update failed');
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
            if (!rental.userId) {
                session.flash('error', i18n.t('messages.admin.barrelRentals.payments.create.noTenant'));
                return response.redirect().back();
            }

            await this.barrelRentalPaymentRepository.create({ rentalId: rental.id, weekNumber, amountPaid: rental.price });
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

    /** Uploads (or replaces) the mine map with the numbered barrels; the previous image is deleted. */
    public async updateMap({ request, response, session, i18n }: HttpContext) {
        const { map } = await request.validateUsing(updateBarrelMapValidator);

        try {
            const siteSetting = await this.siteSettingRepository.get();
            const previousMapFileId = siteSetting.barrelMapFileId;

            const path = await storeUploadedFile(map, 'uploads/barrel-map');
            const file = await this.fileRepository.create({ path, originalName: map.clientName, mimeType: `${map.type}/${map.subtype}`, size: map.size });
            await this.siteSettingRepository.updateBarrelMap(file.id);

            if (previousMapFileId) await this.deleteMapFile(previousMapFileId);

            session.flash('success', i18n.t('messages.admin.barrelRentals.map.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'barrelRentals.updateMap failed');
            session.flash('error', i18n.t('messages.admin.barrelRentals.map.update.error'));
        }

        return response.redirect().back();
    }

    public async destroyMap({ response, session, i18n }: HttpContext) {
        try {
            const siteSetting = await this.siteSettingRepository.get();
            const mapFileId = siteSetting.barrelMapFileId;
            if (mapFileId) {
                await this.siteSettingRepository.updateBarrelMap(null);
                await this.deleteMapFile(mapFileId);
            }

            session.flash('success', i18n.t('messages.admin.barrelRentals.map.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'barrelRentals.destroyMap failed');
            session.flash('error', i18n.t('messages.admin.barrelRentals.map.destroy.error'));
        }

        return response.redirect().back();
    }

    private async deleteMapFile(fileId: string): Promise<void> {
        const file = await this.fileRepository.findOrFail(fileId);
        await deleteStoredFile(file.path);
        await this.fileRepository.delete(file.id);
    }
}
