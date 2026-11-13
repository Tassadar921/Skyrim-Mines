import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import SalesEstimate from '#models/sales_estimate';

export type SalesEstimateInput = {
    resourceId: string;
    resourceName: string;
    resourceType: string;
    estimatedSales: number;
    estimatedOreNeed: number | null;
};

export default class SalesEstimateRepository extends BaseRepository<typeof SalesEstimate> {
    constructor() {
        super(SalesEstimate);
    }

    /** Replaces the whole forecast of a week (recording the previous week again recomputes it). */
    public async replaceForWeek(targetWeekNumber: number, basedOnWeekNumber: number, historyWeeks: number, rows: SalesEstimateInput[]): Promise<void> {
        await db.transaction(async (trx) => {
            await SalesEstimate.query({ client: trx }).where('targetWeekNumber', targetWeekNumber).delete();
            for (const row of rows) {
                await SalesEstimate.create(
                    {
                        targetWeekNumber,
                        basedOnWeekNumber,
                        historyWeeks,
                        resourceId: row.resourceId,
                        resourceName: row.resourceName,
                        resourceType: row.resourceType,
                        estimatedSales: String(row.estimatedSales),
                        estimatedOreNeed: row.estimatedOreNeed === null ? null : String(row.estimatedOreNeed),
                    },
                    { client: trx },
                );
            }
        });
    }

    /** Every forecast row, most recent target week first. */
    public async allByTargetWeekDesc(): Promise<SalesEstimate[]> {
        return SalesEstimate.query().orderBy('targetWeekNumber', 'desc');
    }
}
