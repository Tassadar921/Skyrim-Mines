import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import RecurringOrder from '#models/recurring_order';
import RecurringOrderLine from '#models/recurring_order_line';

export type RecurringOrderInput = { label: string; weekday: number; time: string };
export type RecurringOrderLineInput = { resourceId: string; quantity: number; unitPrice: number };

export default class RecurringOrderRepository extends BaseRepository<typeof RecurringOrder> {
    constructor() {
        super(RecurringOrder);
    }

    /** Week order: Monday first, then by time. */
    public async allWithLines(): Promise<RecurringOrder[]> {
        return RecurringOrder.query()
            .preload('lines', (lines) => lines.preload('resource'))
            .orderBy('weekday', 'asc')
            .orderBy('time', 'asc');
    }

    public async findWithLines(id: string): Promise<RecurringOrder> {
        return RecurringOrder.query()
            .where('id', id)
            .preload('lines', (lines) => lines.preload('resource'))
            .firstOrFail();
    }

    public async createWithLines(data: RecurringOrderInput & { createdByUserId: string }, lines: RecurringOrderLineInput[]): Promise<RecurringOrder> {
        const order = await db.transaction(async (trx) => {
            const created = await RecurringOrder.create(data, { client: trx });
            await this.insertLines(created.id, lines, trx);
            return created;
        });
        return this.findWithLines(order.id);
    }

    /** Replaces the order's fields and all its lines. */
    public async updateWithLines(order: RecurringOrder, data: RecurringOrderInput, lines: RecurringOrderLineInput[]): Promise<RecurringOrder> {
        await db.transaction(async (trx) => {
            order.useTransaction(trx);
            await order.merge(data).save();
            await RecurringOrderLine.query({ client: trx }).where('recurringOrderId', order.id).delete();
            await this.insertLines(order.id, lines, trx);
        });
        return this.findWithLines(order.id);
    }

    public async setAgendaEvent(order: RecurringOrder, agendaEventId: string | null): Promise<void> {
        await order.merge({ agendaEventId }).save();
    }

    private async insertLines(recurringOrderId: string, lines: RecurringOrderLineInput[], trx: TransactionClientContract) {
        for (const line of lines) {
            await RecurringOrderLine.create({ recurringOrderId, resourceId: line.resourceId, quantity: line.quantity, unitPrice: String(line.unitPrice) }, { client: trx });
        }
    }
}
