import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import transmit from '@adonisjs/transmit/services/main';
import DeliveryRepository from '#repositories/delivery_repository';
import { indexDeliveryValidator } from '#validators/admin/deliveries';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';

function formatBuybackSuccessMessage(i18n: HttpContext['i18n'], baseMessage: string, buybackSummary: { resourceName: string; quantity: number }[]): string {
    if (!buybackSummary.length) return baseMessage;

    return `${baseMessage} ${i18n.t('messages.admin.orderArchives.create.buybackSummary', {
        details: buybackSummary.map((entry) => `${entry.quantity} ${entry.resourceName}`).join(', '),
    })}`;
}

const PER_PAGE = 20;

export default class LivraisonsController {
    constructor(private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository()) {}

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
                startDate: start.toJSDate().toISOString(),
                endDate: end.toJSDate().toISOString(),
                deliveryCount: entry?.deliveryCount ?? 0,
                totalAmount: entry?.totalAmount ?? 0,
            });
        }

        return inertia.render('admin/livraisons/index', {
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
        });
    }

    public async destroy({ params, response, session, i18n }: HttpContext) {
        await this.deliveryRepository.destroy(params.id);
        transmit.broadcast('to-deliver', {});
        session.flash('success', i18n.t('messages.livraisons.delete.success'));
        return response.redirect().back();
    }

    public async deductStock({ params, response, session, i18n }: HttpContext) {
        try {
            const { alreadyDeducted, buybackSummary } = await this.deliveryRepository.deductStockForDelivery(params.id);
            if (alreadyDeducted) {
                session.flash('error', i18n.t('messages.admin.livraisons.deductStock.alreadyDeducted'));
                return response.redirect().back();
            }

            session.flash('success', formatBuybackSuccessMessage(i18n, i18n.t('messages.admin.livraisons.deductStock.success'), buybackSummary));
        } catch (e) {
            logger.error({ err: e }, 'livraisons.deductStock failed');
            session.flash('error', i18n.t('messages.admin.livraisons.deductStock.error'));
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

            const baseMessage = i18n.t('messages.admin.livraisons.deductStock.allSuccess', { count: deliveries.length });
            const combinedSummary = [...combinedByResource.entries()].map(([resourceName, quantity]) => ({ resourceName, quantity }));

            session.flash('success', formatBuybackSuccessMessage(i18n, baseMessage, combinedSummary));
        } catch (e) {
            logger.error({ err: e }, 'livraisons.deductStockAll failed');
            session.flash('error', i18n.t('messages.admin.livraisons.deductStock.error'));
        }

        return response.redirect().back();
    }
}
