import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import DeliveryRepository, { type DeliveryStatValues } from '#repositories/delivery_repository';
import ResourceRepository from '#repositories/resource_repository';
import SalesEstimateRepository from '#repositories/sales_estimate_repository';
import SalesEstimateService from '#services/sales_estimate_service';
import type Resource from '#models/resource';
import ResourceTypeEnum from '#types/enum/resource_type_enum';
import { indexDeliveryValidator } from '#validators/admin/deliveries';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';

function formatBuybackSuccessMessage(i18n: HttpContext['i18n'], baseMessage: string, buybackSummary: { resourceName: string; quantity: number }[]): string {
    if (!buybackSummary.length) return baseMessage;

    return `${baseMessage} ${i18n.t('messages.admin.orderArchives.create.buybackSummary', {
        details: buybackSummary.map((entry) => `${entry.quantity} ${entry.resourceName}`).join(', '),
    })}`;
}

const PER_PAGE = 20;

export default class VentesController {
    constructor(
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly salesEstimateRepository: SalesEstimateRepository = new SalesEstimateRepository(),
        private readonly salesEstimateService: SalesEstimateService = new SalesEstimateService(),
    ) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search, week } = await request.validateUsing(indexDeliveryValidator);

        const currentSort = sort ?? 'deliveredAt';
        const currentDir = dir ?? 'desc';
        const currentPage = page ?? 1;

        const deliveries = await this.deliveryRepository.paginate({
            page: currentPage,
            perPage: PER_PAGE,
            sort: currentSort,
            dir: currentDir,
            search,
            week,
        });

        const currentWeek = getWeekNumber(DateTime.now());
        const pendingStockDeductionCount = await this.deliveryRepository.countNotStockDeducted();
        const rawWeeklyTotals = await this.deliveryRepository.getWeeklyTotals();
        const weeklyTotalsByWeek = new Map(rawWeeklyTotals.map((entry) => [entry.weekNumber, entry]));

        const weeklyTotals = [];
        for (let weekNumber = currentWeek; weekNumber >= 1; weekNumber--) {
            const { start, end } = getWeekRange(weekNumber);
            const entry = weeklyTotalsByWeek.get(weekNumber);
            weeklyTotals.push({
                weekNumber,
                startDate: start.toISODate()!,
                endDate: end.toISODate()!,
                deliveryCount: entry?.deliveryCount ?? 0,
                totalAmount: entry?.totalAmount ?? 0,
            });
        }

        // Statistics tab: ore totals and per-week breakdowns, always ordered like the resources
        // list (never raw Map iteration order) and zero-filled so colors/positions stay stable
        // across weeks regardless of which ores actually had deliveries that week.
        const allResources = await this.resourceRepository.all();
        const ores = allResources.filter((resource) => resource.type === ResourceTypeEnum.MINERAI).map((resource) => ({ resourceId: resource.id, resourceName: resource.name }));
        const weeklyStats = await this.deliveryRepository.getWeeklyOreStats();
        const emptyValues = { quantity: 0, saleValue: 0, profit: 0 };

        type OreStat = { resourceId: string; resourceName: string } & DeliveryStatValues;
        const weeklyOreStats: { weekNumber: number; total: DeliveryStatValues; byOre: OreStat[] }[] = [];
        for (let weekNumber = currentWeek; weekNumber >= 1; weekNumber--) {
            const entry = weeklyStats.get(weekNumber);
            const byOreForWeek = new Map(entry?.byOre.map((ore) => [ore.resourceId, ore]) ?? []);
            weeklyOreStats.push({
                weekNumber,
                total: entry?.total ?? emptyValues,
                byOre: ores.map((ore) => {
                    const values = byOreForWeek.get(ore.resourceId);
                    return { ...ore, quantity: values?.quantity ?? 0, saleValue: values?.saleValue ?? 0, profit: values?.profit ?? 0 };
                }),
            });
        }

        const oreTotals = ores.map((ore): OreStat => {
            const totals = { ...ore, ...emptyValues };
            for (const weekEntry of weeklyOreStats) {
                const values = weekEntry.byOre.find((entry) => entry.resourceId === ore.resourceId);
                totals.quantity += values?.quantity ?? 0;
                totals.saleValue += values?.saleValue ?? 0;
                totals.profit += values?.profit ?? 0;
            }
            return totals;
        });

        return inertia.render('admin/ventes/index', {
            deliveries: deliveries.all().map((delivery) => {
                const lines = delivery.lines.map((line) => {
                    const unitPrice = Number(line.unitPrice);

                    return {
                        resourceName: line.resourceName,
                        resourceType: line.resourceType,
                        quantity: line.quantity,
                        unitPrice,
                        totalPrice: line.quantity * unitPrice,
                        profit: line.profit === null ? null : Number(line.profit),
                    };
                });

                return {
                    id: delivery.id,
                    deliveredAt: delivery.deliveredAt.toISO()!,
                    weekNumber: delivery.deliveredWeekNumber,
                    orderNumber: delivery.order.number,
                    requesterName: delivery.order.requesterName,
                    organizationName: delivery.order.organizationName,
                    castellanyName: delivery.castellany?.name ?? null,
                    archivedByName: delivery.deliveredBy?.username ?? null,
                    stockDeducted: delivery.stockDeducted,
                    lines,
                    totalProfit: lines.reduce((sum, line) => sum + (line.profit ?? 0), 0),
                };
            }),
            meta: {
                total: deliveries.total,
                currentPage: deliveries.currentPage,
                lastPage: deliveries.lastPage,
                perPage: deliveries.perPage,
            },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir, week: week ?? null },
            weeklyTotals,
            pendingStockDeductionCount,
            stats: { ores, oreTotals, weeklyOreStats, salesEstimates: await this.salesEstimates(allResources, currentWeek) },
        });
    }

    /**
     * Every sales forecast (computed when a week is recorded), most recent first: each ore's estimated total need
     * next to the actual one (ore sold + ore in the ingots sold), in the resources list order.
     */
    private async salesEstimates(resources: Resource[], currentWeek: number) {
        const rows = await this.salesEstimateRepository.allByTargetWeekDesc();
        if (!rows.length) return [];

        const weeks = [...new Set(rows.map((row) => row.targetWeekNumber))];
        const [actualNeeds, minimumNeeds] = await Promise.all([this.salesEstimateService.actualOreNeeds(Math.min(...weeks), Math.max(...weeks)), this.salesEstimateService.recurringOrderOreNeeds()]);
        const position = new Map(resources.map((resource, index) => [resource.id, index]));

        return weeks.map((week) => {
            const weekRows = rows
                .filter((row) => row.targetWeekNumber === week && row.resourceType === ResourceTypeEnum.MINERAI)
                .sort((a, b) => (position.get(a.resourceId) ?? Infinity) - (position.get(b.resourceId) ?? Infinity));
            const actual = actualNeeds.get(week);

            return {
                targetWeekNumber: week,
                basedOnWeekNumber: weekRows[0]?.basedOnWeekNumber ?? week - 1,
                historyWeeks: weekRows[0]?.historyWeeks ?? 0,
                // Actual sales of a week still running (or to come) are partial.
                isInProgress: week >= currentWeek,
                ores: weekRows.map((row) => ({
                    resourceId: row.resourceId,
                    resourceName: row.resourceName,
                    // Fixed weekly orders as they stand today, the same for every week.
                    minimumOreNeed: minimumNeeds.get(row.resourceId) ?? 0,
                    estimatedOreNeed: Number(row.estimatedOreNeed ?? 0),
                    actualOreNeed: actual?.get(row.resourceId) ?? 0,
                })),
            };
        });
    }

    public async destroy({ params, response, session, i18n }: HttpContext) {
        try {
            await this.deliveryRepository.destroy(params.id);
            session.flash('success', i18n.t('messages.admin.ventes.delete.success'));
        } catch (e) {
            logger.error({ err: e }, 'ventes.destroy failed');
            session.flash('error', i18n.t('messages.admin.ventes.delete.error'));
        }

        return response.redirect().back();
    }

    public async deductStock({ params, response, session, i18n }: HttpContext) {
        try {
            const { alreadyDeducted, buybackSummary } = await this.deliveryRepository.deductStockForDelivery(params.id);
            if (alreadyDeducted) {
                session.flash('error', i18n.t('messages.admin.ventes.deductStock.alreadyDeducted'));
                return response.redirect().back();
            }

            session.flash('success', formatBuybackSuccessMessage(i18n, i18n.t('messages.admin.ventes.deductStock.success'), buybackSummary));
        } catch (e) {
            logger.error({ err: e }, 'ventes.deductStock failed');
            session.flash('error', i18n.t('messages.admin.ventes.deductStock.error'));
        }

        return response.redirect().back();
    }

    public async markStockDeducted({ params, response, session, i18n }: HttpContext) {
        try {
            const { alreadyDeducted } = await this.deliveryRepository.markStockDeducted(params.id);
            if (alreadyDeducted) {
                session.flash('error', i18n.t('messages.admin.ventes.deductStock.alreadyDeducted'));
                return response.redirect().back();
            }

            session.flash('success', i18n.t('messages.admin.ventes.deductStock.markedSuccess'));
        } catch (e) {
            logger.error({ err: e }, 'ventes.markStockDeducted failed');
            session.flash('error', i18n.t('messages.admin.ventes.deductStock.error'));
        }

        return response.redirect().back();
    }

    public async deductStockAll({ response, session, i18n }: HttpContext) {
        try {
            const deliveries = await this.deliveryRepository.findNotStockDeducted();
            const combinedByResource = new Map<string, number>();

            for (const delivery of deliveries) {
                const { buybackSummary } = await this.deliveryRepository.deductStockForDelivery(delivery.id);
                for (const entry of buybackSummary) {
                    combinedByResource.set(entry.resourceName, (combinedByResource.get(entry.resourceName) ?? 0) + entry.quantity);
                }
            }

            const baseMessage = i18n.t('messages.admin.ventes.deductStock.allSuccess', { count: deliveries.length });
            const combinedSummary = [...combinedByResource.entries()].map(([resourceName, quantity]) => ({ resourceName, quantity }));

            session.flash('success', formatBuybackSuccessMessage(i18n, baseMessage, combinedSummary));
        } catch (e) {
            logger.error({ err: e }, 'ventes.deductStockAll failed');
            session.flash('error', i18n.t('messages.admin.ventes.deductStock.error'));
        }

        return response.redirect().back();
    }
}
