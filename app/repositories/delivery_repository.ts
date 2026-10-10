import { DateTime } from 'luxon';
import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import Delivery from '#models/delivery';
import DeliveryLine from '#models/delivery_line';
import Order from '#models/order';
import Resource from '#models/resource';
import ResourceRecipeLineRepository from '#repositories/resource_recipe_line_repository';
import ResourceStockRepository from '#repositories/resource_stock_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceBuybackBatchRepository from '#repositories/resource_buyback_batch_repository';
import OrderStatusEnum from '#types/enum/order_status_enum';
import ResourceTypeEnum from '#types/enum/resource_type_enum';
import { getWeekNumber } from '#helpers/game_week_helper';

export type RemainingLine = {
    orderLineId: string;
    resourceId: string | null;
    resourceName: string;
    resourceType: string;
    unitPrice: number;
    orderedQuantity: number;
    deliveredQuantity: number;
    remainingQuantity: number;
};

export type DeliveryLineInput = {
    orderLineId: string;
    quantity: number;
};

export default class DeliveryRepository extends BaseRepository<typeof Delivery> {
    constructor(
        private readonly resourceRecipeLineRepository: ResourceRecipeLineRepository = new ResourceRecipeLineRepository(),
        private readonly resourceStockRepository: ResourceStockRepository = new ResourceStockRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBuybackBatchRepository: ResourceBuybackBatchRepository = new ResourceBuybackBatchRepository(),
    ) {
        super(Delivery);
    }

    public async findOrFail(id: string): Promise<Delivery> {
        return Delivery.query().where('id', id).preload('order').preload('lines').firstOrFail();
    }

    public async remainingQuantities(orderId: string): Promise<RemainingLine[]> {
        const order = await Order.query().where('id', orderId).preload('lines').firstOrFail();

        const deliveredRows = await db
            .from('delivery_lines')
            .join('deliveries', 'deliveries.id', 'delivery_lines.delivery_id')
            .where('deliveries.order_id', orderId)
            .select('delivery_lines.order_line_id as orderLineId')
            .sum('delivery_lines.quantity as delivered')
            .groupBy('delivery_lines.order_line_id');
        const deliveredByLine = new Map(deliveredRows.map((row) => [row.orderLineId, Number(row.delivered)]));

        return order.lines.map((line) => {
            const deliveredQuantity = deliveredByLine.get(line.id) ?? 0;
            return {
                orderLineId: line.id,
                resourceId: line.resourceId,
                resourceName: line.resourceName,
                resourceType: line.resourceType,
                unitPrice: Number(line.unitPrice),
                orderedQuantity: line.quantity,
                deliveredQuantity,
                remainingQuantity: line.quantity - deliveredQuantity,
            };
        });
    }

    public async createForOrder(
        orderId: string,
        deliveredByUserId: string,
        lines: DeliveryLineInput[],
        options: { deliveredAt?: DateTime; castellanyId?: string | null; stockDeducted?: boolean } = {},
    ): Promise<Delivery | null> {
        const remaining = await this.remainingQuantities(orderId);
        const remainingByLine = new Map(remaining.map((line) => [line.orderLineId, line]));

        const validLines = lines
            .map((input) => {
                const line = remainingByLine.get(input.orderLineId);
                if (!line || input.quantity <= 0 || input.quantity > line.remainingQuantity) return null;
                return { ...line, quantity: input.quantity };
            })
            .filter((line): line is NonNullable<typeof line> => line !== null);

        if (!validLines.length) return null;

        const resourceIds = [...new Set(validLines.map((line) => line.resourceId).filter((id): id is string => id !== null))];
        const resources = resourceIds.length ? await Resource.query().whereIn('id', resourceIds) : [];
        const buyPriceById = new Map(resources.map((resource) => [resource.id, Number(resource.buyPrice)]));

        const lingotIds = resources.filter((resource) => resource.type === ResourceTypeEnum.LINGOT).map((resource) => resource.id);
        const recipeCostById = await this.resourceRecipeLineRepository.sumCostByResourceIds(lingotIds);

        const linesWithProfit = validLines.map((line) => {
            const cost = !line.resourceId ? null : line.resourceType === ResourceTypeEnum.LINGOT ? (recipeCostById.get(line.resourceId) ?? null) : (buyPriceById.get(line.resourceId) ?? null);
            const profit = cost === null ? null : (line.unitPrice - cost) * line.quantity;
            return { ...line, profit };
        });

        const castellanyId = options.castellanyId ?? null;

        const deliveredAt = options.deliveredAt ?? DateTime.now();
        const delivery = await db.transaction(async (trx) => {
            const created = await Delivery.create(
                {
                    orderId,
                    deliveredByUserId,
                    deliveredAt,
                    deliveredWeekNumber: getWeekNumber(deliveredAt),
                    castellanyId,
                    stockDeducted: options.stockDeducted ?? false,
                },
                { client: trx },
            );

            for (const line of linesWithProfit) {
                await DeliveryLine.create(
                    {
                        deliveryId: created.id,
                        orderLineId: line.orderLineId,
                        resourceId: line.resourceId,
                        resourceName: line.resourceName,
                        resourceType: line.resourceType,
                        quantity: line.quantity,
                        unitPrice: String(line.unitPrice),
                        profit: line.profit === null ? null : String(line.profit),
                    },
                    { client: trx },
                );
            }

            return created;
        });

        const stillRemaining = await this.remainingQuantities(orderId);
        const fullyDelivered = stillRemaining.every((line) => line.remainingQuantity <= 0);
        if (fullyDelivered) {
            await Order.query().where('id', orderId).update({ status: OrderStatusEnum.DELIVERED });
        }

        return delivery;
    }

    /**
     * Deducts a delivery's lines from the company's purchased stock, buying back any shortfall
     * from the barrel (same logic as the order-archiving "déduire quantités" checkbox). No-op if
     * the delivery was already marked as deducted.
     */
    public async deductStockForDelivery(deliveryId: string): Promise<{ alreadyDeducted: boolean; buybackSummary: { resourceName: string; quantity: number }[] }> {
        const buybackSummary: { resourceName: string; quantity: number }[] = [];
        let alreadyDeducted = false;

        await db.transaction(async (trx) => {
            const delivery = await Delivery.query({ client: trx }).where('id', deliveryId).preload('lines').forUpdate().firstOrFail();
            if (delivery.stockDeducted) {
                alreadyDeducted = true;
                return;
            }

            const resourceIds = [...new Set(delivery.lines.map((line) => line.resourceId).filter((id): id is string => id !== null))];
            const resources = resourceIds.length ? await Resource.query({ client: trx }).whereIn('id', resourceIds) : [];
            const resourceById = new Map(resources.map((resource) => [resource.id, resource]));

            let batchId: string | null = null;
            for (const line of delivery.lines) {
                if (!line.resourceId || line.quantity <= 0) continue;

                const takenFromStock = await this.resourceStockRepository.decrementPurchasedQuantity(line.resourceId, line.quantity, trx);
                const shortfall = line.quantity - takenFromStock;
                if (shortfall <= 0) continue;

                const resource = resourceById.get(line.resourceId);
                if (!resource) continue;

                if (!batchId) {
                    const batch = await this.resourceBuybackBatchRepository.createBatch(trx);
                    batchId = batch.id;
                }

                const boughtBack = await this.resourceBuybackRepository.buybackResourceFromBarrel({
                    resourceId: line.resourceId,
                    requestedQuantity: shortfall,
                    buyPrice: Number(resource.buyPrice),
                    batchId,
                    trx,
                });
                if (boughtBack > 0) {
                    buybackSummary.push({ resourceName: line.resourceName, quantity: boughtBack });
                }
            }

            delivery.stockDeducted = true;
            await delivery.save();
        });

        return { alreadyDeducted, buybackSummary };
    }

    /**
     * Marks a delivery as stock-deducted without touching stock or buying back from the barrel —
     * for cases where the deduction was already handled manually elsewhere.
     */
    public async markStockDeducted(deliveryId: string): Promise<{ alreadyDeducted: boolean }> {
        const delivery = await Delivery.findOrFail(deliveryId);
        if (delivery.stockDeducted) return { alreadyDeducted: true };

        delivery.stockDeducted = true;
        await delivery.save();

        return { alreadyDeducted: false };
    }

    public async findNotStockDeducted(): Promise<Delivery[]> {
        return Delivery.query().where('stockDeducted', false);
    }

    public async countNotStockDeducted(): Promise<number> {
        const result = await Delivery.query().where('stockDeducted', false).count('* as total').first();
        return Number(result?.$extras.total ?? 0);
    }

    public async destroy(id: string): Promise<void> {
        const delivery = await Delivery.findOrFail(id);
        const orderId = delivery.orderId;
        await delivery.delete();

        const order = await Order.findOrFail(orderId);
        if (order.status === OrderStatusEnum.DELIVERED) {
            order.status = OrderStatusEnum.TO_DELIVER;
            await order.save();
        }
    }

    public async paginate(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string; week?: number }) {
        const { page, perPage, sort, dir, search, week } = params;
        const allowedSorts: Record<string, string> = {
            deliveredAt: 'deliveries.delivered_at',
            week: 'deliveries.delivered_week_number',
            requesterName: 'orders.requester_name',
        };
        const sortColumn = allowedSorts[sort] ?? 'deliveries.delivered_at';

        const q = Delivery.query().preload('order').preload('lines').preload('castellany');

        if (sort === 'requesterName') {
            q.join('orders', 'orders.id', 'deliveries.order_id').select('deliveries.*');
        }

        q.orderBy(sortColumn, dir);

        if (week) {
            q.where('deliveredWeekNumber', week);
        }
        if (search) {
            q.whereHas('order', (orderQuery) => {
                orderQuery.where((builder) => {
                    builder.whereILike('requesterName', `%${search}%`).orWhereILike('organizationName', `%${search}%`);
                });
            });
        }

        return q.paginate(page, perPage);
    }

    public async getWeeklyQuantityTotals(): Promise<Map<number, { totalQuantity: number; byOre: { resourceName: string; quantity: number }[] }>> {
        const rows = await db
            .from('deliveries')
            .join('delivery_lines', 'delivery_lines.delivery_id', 'deliveries.id')
            .select('deliveries.delivered_week_number as weekNumber', 'delivery_lines.resource_name as resourceName', 'delivery_lines.resource_type as resourceType')
            .sum('delivery_lines.quantity as quantity')
            .groupBy('deliveries.delivered_week_number', 'delivery_lines.resource_name', 'delivery_lines.resource_type');

        const result = new Map<number, { totalQuantity: number; byOre: { resourceName: string; quantity: number }[] }>();
        for (const row of rows) {
            const quantity = Number(row.quantity);
            const entry = result.get(row.weekNumber) ?? { totalQuantity: 0, byOre: [] };
            entry.totalQuantity += quantity;
            if (row.resourceType === ResourceTypeEnum.MINERAI) {
                entry.byOre.push({ resourceName: row.resourceName, quantity });
            }
            result.set(row.weekNumber, entry);
        }

        return result;
    }

    public async getWeeklyTotals(): Promise<{ weekNumber: number; deliveryCount: number; totalAmount: number; totalProfit: number }[]> {
        const rows = await db
            .from('deliveries')
            .join('delivery_lines', 'delivery_lines.delivery_id', 'deliveries.id')
            .select('deliveries.delivered_week_number as weekNumber')
            .countDistinct('deliveries.id as deliveryCount')
            .select(db.raw('SUM(delivery_lines.quantity * delivery_lines.unit_price) as "totalAmount"'))
            .select(db.raw('SUM(delivery_lines.profit) as "totalProfit"'))
            .groupBy('deliveries.delivered_week_number');

        return rows.map((row) => ({
            weekNumber: row.weekNumber,
            deliveryCount: Number(row.deliveryCount),
            totalAmount: Number(row.totalAmount ?? 0),
            totalProfit: Number(row.totalProfit ?? 0),
        }));
    }
}
