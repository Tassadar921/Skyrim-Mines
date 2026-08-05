import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import { indexBuybackValidator } from '#validators/admin/buybacks';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';

const PER_PAGE = 20;

export default class BuybacksController {
    constructor(private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository()) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search, week } = await request.validateUsing(indexBuybackValidator);

        const currentSort = sort ?? 'createdAt';
        const currentDir = dir ?? 'desc';
        const currentPage = page ?? 1;

        const { groups, total } = await this.resourceBuybackRepository.paginateGrouped({
            page: currentPage,
            perPage: PER_PAGE,
            sort: currentSort,
            dir: currentDir,
            search,
            week,
        });

        const details = await this.resourceBuybackRepository.findDetailsForBatches(groups.map((group) => group.batchId));

        const buybacks = groups.map((group) => ({
            ...group,
            details: details
                .filter((detail) => detail.batchId === group.batchId)
                .map((detail) => ({
                    resourceId: detail.resourceId,
                    resourceName: detail.resourceName,
                    username: detail.username,
                    quantity: detail.quantity,
                    unitPrice: detail.amount / detail.quantity,
                    amount: detail.amount,
                })),
        }));

        const currentWeek = getWeekNumber(DateTime.now());
        const rawWeeklyTotals = await this.resourceBuybackRepository.getWeeklyTotals();
        const weeklyTotalsByWeek = new Map(rawWeeklyTotals.map((entry) => [entry.weekNumber, entry]));

        const weeklyTotals = [];
        for (let weekNumber = currentWeek; weekNumber >= 1; weekNumber--) {
            const { start, end } = getWeekRange(weekNumber);
            const entry = weeklyTotalsByWeek.get(weekNumber);
            weeklyTotals.push({
                weekNumber,
                startDate: start.toJSDate().toISOString(),
                endDate: end.toJSDate().toISOString(),
                totalQuantity: entry?.totalQuantity ?? 0,
                totalAmount: entry?.totalAmount ?? 0,
            });
        }

        return inertia.render('admin/buybacks/index', {
            buybacks,
            meta: {
                total,
                currentPage,
                lastPage: Math.max(1, Math.ceil(total / PER_PAGE)),
                perPage: PER_PAGE,
            },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir, week: week ?? null },
            weeklyTotals,
        });
    }
}
