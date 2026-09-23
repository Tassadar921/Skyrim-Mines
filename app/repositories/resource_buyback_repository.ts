import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import ResourceBuyback from '#models/resource_buyback';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBarrelAdjustmentRepository from '#repositories/resource_barrel_adjustment_repository';
import UserRepository from '#repositories/user_repository';
import { allocateProportionally } from '#helpers/buyback_allocation_helper';

export type BuybackResourceLine = {
    resourceId: string;
    resourceName: string;
    quantity: number;
    amount: number;
};

export type BuybackGroup = {
    batchId: string;
    createdAt: string;
    weekNumber: number;
    totalQuantity: number;
    totalAmount: number;
    resources: BuybackResourceLine[];
};

export type BuybackDetail = {
    batchId: string;
    resourceId: string;
    resourceName: string;
    username: string;
    quantity: number;
    amount: number;
};

export default class ResourceBuybackRepository extends BaseRepository<typeof ResourceBuyback> {
    constructor(
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBarrelAdjustmentRepository: ResourceBarrelAdjustmentRepository = new ResourceBarrelAdjustmentRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
    ) {
        super(ResourceBuyback);
    }

    /**
     * Buys back up to `requestedQuantity` of a resource from whatever players have outstanding
     * in the barrel, allocated proportionally to their holdings and paid out immediately.
     * Returns the quantity actually bought back (may be less than requested if the barrel
     * doesn't hold enough).
     */
    public async buybackResourceFromBarrel(params: { resourceId: string; requestedQuantity: number; buyPrice: number; batchId: string; trx: TransactionClientContract }): Promise<number> {
        const { resourceId, requestedQuantity, buyPrice, batchId, trx } = params;
        if (requestedQuantity <= 0) return 0;

        const [depositedByUser, boughtBackByUser, adjustedByUser] = await Promise.all([
            this.resourceDepositRepository.sumByUserForResource(resourceId),
            this.sumByUserForResource(resourceId),
            this.resourceBarrelAdjustmentRepository.sumByUserForResource(resourceId),
        ]);

        const userIds = new Set([...depositedByUser.keys(), ...boughtBackByUser.keys(), ...adjustedByUser.keys()]);
        const outstandingByUser = new Map<string, number>();
        for (const userId of userIds) {
            const outstanding = (depositedByUser.get(userId) ?? 0) - (boughtBackByUser.get(userId) ?? 0) + (adjustedByUser.get(userId) ?? 0);
            if (outstanding > 0) outstandingByUser.set(userId, outstanding);
        }

        const totalOutstanding = [...outstandingByUser.values()].reduce((sum, qty) => sum + qty, 0);
        const quantity = Math.min(requestedQuantity, totalOutstanding);
        if (quantity <= 0) return 0;

        const allocations = allocateProportionally(quantity, outstandingByUser);
        const buybackEntries: { batchId: string; userId: string; resourceId: string; quantity: number; amount: number }[] = [];
        for (const [userId, allocatedQuantity] of allocations) {
            if (allocatedQuantity <= 0) continue;
            const amount = allocatedQuantity * buyPrice;
            buybackEntries.push({ batchId, userId, resourceId, quantity: allocatedQuantity, amount });
            await this.userRepository.incrementBalance(userId, amount, trx);
        }

        await this.createMany(buybackEntries, trx);
        return quantity;
    }

    public async createMany(entries: { batchId: string; userId: string; resourceId: string; quantity: number; amount: number }[], trx?: TransactionClientContract): Promise<void> {
        if (!entries.length) return;

        const payloads = entries.map((entry) => ({ ...entry, amount: String(entry.amount) }));

        if (trx) {
            for (const payload of payloads) {
                await ResourceBuyback.create(payload, { client: trx });
            }
            return;
        }

        await db.transaction(async (newTrx) => {
            for (const payload of payloads) {
                await ResourceBuyback.create(payload, { client: newTrx });
            }
        });
    }

    public async sumByResource(): Promise<Map<string, number>> {
        const rows = await ResourceBuyback.query().select('resourceId').sum('quantity as total').groupBy('resourceId');

        return new Map(rows.map((row) => [row.resourceId, Number(row.$extras.total)]));
    }

    public async sumByUserForResource(resourceId: string): Promise<Map<string, number>> {
        const rows = await ResourceBuyback.query().where('resourceId', resourceId).select('userId').sum('quantity as total').groupBy('userId');

        return new Map(rows.map((row) => [row.userId, Number(row.$extras.total)]));
    }

    public async sumByUser(userId: string): Promise<Map<string, number>> {
        const rows = await ResourceBuyback.query().where('userId', userId).select('resourceId').sum('quantity as total').groupBy('resourceId');

        return new Map(rows.map((row) => [row.resourceId, Number(row.$extras.total)]));
    }

    public async sumByUserAndResource(): Promise<Map<string, number>> {
        const rows = await ResourceBuyback.query().select('userId', 'resourceId').sum('quantity as total').groupBy('userId', 'resourceId');

        return new Map(rows.map((row) => [`${row.userId}:${row.resourceId}`, Number(row.$extras.total)]));
    }

    public async sumForUserAndResource(userId: string, resourceId: string): Promise<number> {
        const result = await ResourceBuyback.query().where('userId', userId).where('resourceId', resourceId).sum('quantity as total').first();

        return Number(result?.$extras.total ?? 0);
    }

    public async paginateGrouped(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string; week?: number }): Promise<{
        groups: BuybackGroup[];
        total: number;
    }> {
        const { page, perPage, sort, dir, search, week } = params;

        const query = db
            .from('resource_buybacks')
            .join('resource_buyback_batches', 'resource_buyback_batches.id', 'resource_buybacks.batch_id')
            .join('resources', 'resources.id', 'resource_buybacks.resource_id')
            .select(
                'resource_buybacks.batch_id as batchId',
                'resource_buybacks.resource_id as resourceId',
                'resources.name as resourceName',
                'resource_buyback_batches.created_at as createdAt',
                'resource_buyback_batches.week_number as weekNumber',
            )
            .sum('resource_buybacks.quantity as quantity')
            .sum('resource_buybacks.amount as amount')
            .groupBy('resource_buybacks.batch_id', 'resource_buybacks.resource_id', 'resources.name', 'resource_buyback_batches.created_at', 'resource_buyback_batches.week_number');

        if (week) {
            query.where('resource_buyback_batches.week_number', week);
        }

        const rows = await query;

        const groupsByBatch = new Map<string, BuybackGroup>();
        for (const row of rows) {
            const quantity = Number(row.quantity);
            const amount = Number(row.amount);

            let group = groupsByBatch.get(row.batchId);
            if (!group) {
                group = { batchId: row.batchId, createdAt: new Date(row.createdAt).toISOString(), weekNumber: row.weekNumber, totalQuantity: 0, totalAmount: 0, resources: [] };
                groupsByBatch.set(row.batchId, group);
            }

            group.resources.push({ resourceId: row.resourceId, resourceName: row.resourceName, quantity, amount });
            group.totalQuantity += quantity;
            group.totalAmount += amount;
        }

        let allGroups = Array.from(groupsByBatch.values());
        for (const group of allGroups) {
            group.resources.sort((a, b) => a.resourceName.localeCompare(b.resourceName));
        }

        if (search) {
            const needle = search.toLowerCase();
            allGroups = allGroups.filter((group) => group.resources.some((resource) => resource.resourceName.toLowerCase().includes(needle)));
        }

        const allowedSorts: Record<string, (group: BuybackGroup) => string | number> = {
            createdAt: (group) => group.createdAt,
            week: (group) => group.weekNumber,
            resource: (group) => group.resources.map((resource) => resource.resourceName).join(', '),
            quantity: (group) => group.totalQuantity,
            amount: (group) => group.totalAmount,
        };
        const sortValue = allowedSorts[sort] ?? allowedSorts.createdAt;
        allGroups.sort((a, b) => {
            const valueA = sortValue(a);
            const valueB = sortValue(b);
            const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            return dir === 'asc' ? comparison : -comparison;
        });

        const total = allGroups.length;
        const start = (page - 1) * perPage;
        const groups = allGroups.slice(start, start + perPage);

        return { groups, total };
    }

    public async getWeeklyTotals(): Promise<{ weekNumber: number; totalQuantity: number; totalAmount: number }[]> {
        const rows = await db
            .from('resource_buybacks')
            .join('resource_buyback_batches', 'resource_buyback_batches.id', 'resource_buybacks.batch_id')
            .select('resource_buyback_batches.week_number as weekNumber')
            .sum('resource_buybacks.quantity as totalQuantity')
            .sum('resource_buybacks.amount as totalAmount')
            .groupBy('resource_buyback_batches.week_number');

        return rows.map((row) => ({ weekNumber: row.weekNumber, totalQuantity: Number(row.totalQuantity), totalAmount: Number(row.totalAmount) }));
    }

    public async findDetailsForBatches(batchIds: string[]): Promise<BuybackDetail[]> {
        if (!batchIds.length) return [];

        const rows = await db
            .from('resource_buybacks')
            .join('users', 'users.id', 'resource_buybacks.user_id')
            .join('resources', 'resources.id', 'resource_buybacks.resource_id')
            .select(
                'resource_buybacks.batch_id as batchId',
                'resource_buybacks.resource_id as resourceId',
                'resources.name as resourceName',
                'users.username as username',
                'resource_buybacks.quantity as quantity',
                'resource_buybacks.amount as amount',
            )
            .whereIn('resource_buybacks.batch_id', batchIds);

        return rows.map((row) => ({
            batchId: row.batchId,
            resourceId: row.resourceId,
            resourceName: row.resourceName,
            username: row.username,
            quantity: row.quantity,
            amount: Number(row.amount),
        }));
    }
}
