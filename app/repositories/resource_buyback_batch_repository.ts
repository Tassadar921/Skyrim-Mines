import { DateTime } from 'luxon';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import ResourceBuybackBatch from '#models/resource_buyback_batch';
import { getWeekNumber } from '#helpers/game_week_helper';

export default class ResourceBuybackBatchRepository extends BaseRepository<typeof ResourceBuybackBatch> {
    constructor() {
        super(ResourceBuybackBatch);
    }

    public async createBatch(trx?: TransactionClientContract): Promise<ResourceBuybackBatch> {
        const payload = { weekNumber: getWeekNumber(DateTime.now()) };
        return trx ? ResourceBuybackBatch.create(payload, { client: trx }) : ResourceBuybackBatch.create(payload);
    }
}
