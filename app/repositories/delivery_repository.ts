import { DateTime } from 'luxon';
import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import Delivery from '#models/delivery';
import DeliveryLine from '#models/delivery_line';
import Order from '#models/order';
import Resource from '#models/resource';
import ResourceRecipeLineRepository from '#repositories/resource_recipe_line_repository';
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
    constructor(private readonly resourceRecipeLineRepository: ResourceRecipeLineRepository = new ResourceRecipeLineRepository()) {
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
        options: { deliveredAt?: DateTime; castellanyId?: string | null } = {},
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
