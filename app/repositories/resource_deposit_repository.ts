import { type DateTime } from 'luxon';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import ResourceDeposit from '#models/resource_deposit';

export default class ResourceDepositRepository extends BaseRepository<typeof ResourceDeposit> {
    constructor() {
        super(ResourceDeposit);
    }

    public async createMany(userId: string, items: { resourceId: string; quantity: number }[], trx?: TransactionClientContract): Promise<void> {
        const deposits = items.filter((item) => item.quantity > 0);
        if (!deposits.length) return;

        const run = async (client: TransactionClientContract) => {
            for (const item of deposits) {
                await ResourceDeposit.create({ userId, resourceId: item.resourceId, quantity: item.quantity }, { client });
            }
        };

        if (trx) {
            await run(trx);
        } else {
            await db.transaction(run);
        }
    }

    public async findRecentByUser(userId: string, since: DateTime): Promise<ResourceDeposit[]> {
        return ResourceDeposit.query().where('userId', userId).where('createdAt', '>=', since.toSQL()!).orderBy('createdAt', 'desc');
    }

    public async update(id: string, payload: { resourceId: string; quantity: number }, trx?: TransactionClientContract): Promise<void> {
        const deposit = trx ? await ResourceDeposit.query({ client: trx }).where('id', id).firstOrFail() : await ResourceDeposit.findOrFail(id);

        deposit.resourceId = payload.resourceId;
        deposit.quantity = payload.quantity;
        await deposit.save();
    }

    public async delete(id: string, trx?: TransactionClientContract): Promise<void> {
        const deposit = trx ? await ResourceDeposit.query({ client: trx }).where('id', id).firstOrFail() : await ResourceDeposit.findOrFail(id);
        await deposit.delete();
    }

    public async sumByResource(): Promise<Map<string, number>> {
        const rows = await ResourceDeposit.query().select('resourceId').sum('quantity as total').groupBy('resourceId');

        return new Map(rows.map((row) => [row.resourceId, Number(row.$extras.total)]));
    }

    public async sumByUserForResource(resourceId: string): Promise<Map<string, number>> {
        const rows = await ResourceDeposit.query().where('resourceId', resourceId).select('userId').sum('quantity as total').groupBy('userId');

        return new Map(rows.map((row) => [row.userId, Number(row.$extras.total)]));
    }

    public async sumByUser(userId: string): Promise<Map<string, number>> {
        const rows = await ResourceDeposit.query().where('userId', userId).select('resourceId').sum('quantity as total').groupBy('resourceId');

        return new Map(rows.map((row) => [row.resourceId, Number(row.$extras.total)]));
    }

    public async sumByUserAndResource(): Promise<Map<string, number>> {
        const rows = await ResourceDeposit.query().select('userId', 'resourceId').sum('quantity as total').groupBy('userId', 'resourceId');

        return new Map(rows.map((row) => [`${row.userId}:${row.resourceId}`, Number(row.$extras.total)]));
    }

    public async sumForUserAndResource(userId: string, resourceId: string): Promise<number> {
        const result = await ResourceDeposit.query().where('userId', userId).where('resourceId', resourceId).sum('quantity as total').first();

        return Number(result?.$extras.total ?? 0);
    }
}
