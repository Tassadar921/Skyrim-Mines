import { DateTime } from 'luxon';
import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import Order from '#models/order';
import OrderLine from '#models/order_line';
import OrderStatusEnum from '#types/enum/order_status_enum';
import { getWeekNumber } from '#helpers/game_week_helper';

export type OrderLineInput = {
    resourceId: string;
    resourceName: string;
    resourceType: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
};

export default class OrderRepository extends BaseRepository<typeof Order> {
    constructor() {
        super(Order);
    }

    public async findOrFail(id: string): Promise<Order> {
        return Order.query().where('id', id).preload('file').preload('lines').firstOrFail();
    }

    public async paginate(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string }) {
        const { page, perPage, sort, dir, search } = params;
        const allowedSorts: Record<string, string> = {
            number: 'number',
            createdAt: 'created_at',
            requesterName: 'requester_name',
            totalAmount: 'total_amount',
        };
        const sortColumn = allowedSorts[sort] ?? 'created_at';

        const q = Order.query().preload('file').preload('lines').orderBy(sortColumn, dir);
        if (search) {
            q.where((builder) => {
                builder.whereILike('requesterName', `%${search}%`).orWhereILike('organizationName', `%${search}%`);
            });
        }
        return q.paginate(page, perPage);
    }

    public async createWithLines(data: {
        userId: string;
        organizationId: string | null;
        organizationName: string | null;
        recipientUserId: string | null;
        requesterName: string;
        totalAmount: number;
        lines: OrderLineInput[];
        weekNumber?: number;
    }): Promise<Order> {
        return db.transaction(async (trx) => {
            const order = await Order.create(
                {
                    userId: data.userId,
                    organizationId: data.organizationId,
                    organizationName: data.organizationName,
                    recipientUserId: data.recipientUserId,
                    requesterName: data.requesterName,
                    totalAmount: String(data.totalAmount),
                    weekNumber: data.weekNumber ?? getWeekNumber(DateTime.now()),
                },
                { client: trx },
            );

            for (const line of data.lines) {
                await OrderLine.create(
                    {
                        orderId: order.id,
                        resourceId: line.resourceId,
                        resourceName: line.resourceName,
                        resourceType: line.resourceType,
                        quantity: line.quantity,
                        unitPrice: String(line.unitPrice),
                        totalPrice: String(line.totalPrice),
                    },
                    { client: trx },
                );
            }

            // `number` is assigned by a database sequence and isn't hydrated back onto the
            // in-memory instance returned by create(), so it must be re-fetched explicitly.
            return Order.query({ client: trx }).where('id', order.id).firstOrFail();
        });
    }

    public async paginateForRecipient(recipientUserId: string, params: { page: number; perPage: number }) {
        const { page, perPage } = params;
        return Order.query().where('recipientUserId', recipientUserId).whereNull('organizationId').preload('file').preload('lines').orderBy('created_at', 'desc').paginate(page, perPage);
    }

    public async setFile(id: string, fileId: string): Promise<void> {
        await Order.query().where('id', id).update({ fileId });
    }

    public async findToDeliver(): Promise<Order[]> {
        return Order.query().where('status', OrderStatusEnum.TO_DELIVER).preload('file').preload('lines').orderBy('created_at', 'asc');
    }

    public async transitionStatus(id: string, from: OrderStatusEnum[], to: OrderStatusEnum): Promise<boolean> {
        const order = await Order.findOrFail(id);
        if (!from.includes(order.status as OrderStatusEnum)) return false;

        order.status = to;
        await order.save();
        return true;
    }
}
