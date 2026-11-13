import { DateTime } from 'luxon';
import { BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

/**
 * Computes the sales forecasts retroactively, as if every past week had been recorded on the dashboard:
 * closing week N forecasts week N+1. Existing forecasts of the covered weeks are replaced.
 *
 *   node ace sales-estimates:backfill                 every complete week (1 → last week)
 *   node ace sales-estimates:backfill --from=8 --to=12
 */
export default class BackfillSalesEstimates extends BaseCommand {
    static commandName = 'sales-estimates:backfill';
    static description = 'Recompute the weekly sales forecasts for past weeks (closing week N forecasts week N+1)';

    static options: CommandOptions = {
        startApp: true,
    };

    @flags.number({ description: 'First closed week to compute from (default: 1)' })
    declare from?: number;

    @flags.number({ description: 'Last closed week (default: last complete week)' })
    declare to?: number;

    async run() {
        // App modules are imported here, not at the top: Ace imports every command file just to read its
        // metadata, before the app (and its database service) is booted.
        const { default: SalesEstimateService } = await import('#services/sales_estimate_service');
        const { getWeekNumber } = await import('#helpers/game_week_helper');
        const { SALES_ESTIMATE_HISTORY_WEEKS } = await import('#helpers/sales_estimate_helper');

        const lastCompleteWeek = getWeekNumber(DateTime.now()) - 1;
        const from = this.from ?? 1;
        const to = this.to ?? lastCompleteWeek;

        if (from < 1 || to < from || to > lastCompleteWeek) {
            this.logger.error(`Invalid range: --from must be >= 1, --to between --from and the last complete week (${lastCompleteWeek}).`);
            this.exitCode = 1;
            return;
        }

        const service = new SalesEstimateService();
        for (let closedWeek = from; closedWeek <= to; closedWeek++) {
            await service.computeAfterClosingWeek(closedWeek);
            this.logger.info(`Week ${closedWeek + 1} forecast computed (from weeks ${Math.max(1, closedWeek - SALES_ESTIMATE_HISTORY_WEEKS + 1)}-${closedWeek})`);
        }

        this.logger.success(`${to - from + 1} forecast(s) computed, up to week ${to + 1}.`);
    }
}
