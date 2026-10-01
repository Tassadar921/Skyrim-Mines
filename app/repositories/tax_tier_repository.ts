import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import TaxTier from '#models/tax_tier';

export type TaxTierInput = { upperBound: number | null; rate: number };

export default class TaxTierRepository extends BaseRepository<typeof TaxTier> {
    constructor() {
        super(TaxTier);
    }

    public async all(): Promise<TaxTier[]> {
        return TaxTier.query().orderBy('order', 'asc');
    }

    public async replaceAll(tiers: TaxTierInput[], trx?: TransactionClientContract): Promise<void> {
        const run = async (client: TransactionClientContract) => {
            await TaxTier.query({ client }).delete();
            for (const [index, tier] of tiers.entries()) {
                await TaxTier.create({ order: index, upperBound: tier.upperBound === null ? null : String(tier.upperBound), rate: tier.rate }, { client });
            }
        };

        if (trx) {
            await run(trx);
        } else {
            await db.transaction(run);
        }
    }
}
