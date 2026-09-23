import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import TaxBracket from '#models/tax_bracket';

export type TaxBracketInput = { upperBound: number | null; rate: number };

export default class TaxBracketRepository extends BaseRepository<typeof TaxBracket> {
    constructor() {
        super(TaxBracket);
    }

    public async all(): Promise<TaxBracket[]> {
        return TaxBracket.query().orderBy('order', 'asc');
    }

    public async replaceAll(brackets: TaxBracketInput[], trx?: TransactionClientContract): Promise<void> {
        const run = async (client: TransactionClientContract) => {
            await TaxBracket.query({ client }).delete();
            for (const [index, bracket] of brackets.entries()) {
                await TaxBracket.create({ order: index, upperBound: bracket.upperBound === null ? null : String(bracket.upperBound), rate: bracket.rate }, { client });
            }
        };

        if (trx) {
            await run(trx);
        } else {
            await db.transaction(run);
        }
    }
}
