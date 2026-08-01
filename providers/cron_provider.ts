import type { ApplicationService } from '@adonisjs/core/types';
import logger from '@adonisjs/core/services/logger';

function scheduleDailyAt(hour: number, task: () => Promise<void>): void {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    setTimeout(() => {
        task();
        setInterval(task, 24 * 60 * 60 * 1000);
    }, next.getTime() - now.getTime());
}

export default class CronProvider {
    constructor(protected app: ApplicationService) {}

    async ready() {
        // Only run scheduled tasks in the HTTP server process, not in Ace commands
        if (this.app.getEnvironment() !== 'web') return;

        scheduleDailyAt(3, async () => {
            logger.info('cron: starting inactive account cleanup');
            try {
                const { default: InactiveAccountService } = await import('#services/inactive_account_service');
                await InactiveAccountService.runCleanup();
            } catch (e) {
                logger.error({ err: e }, 'cron: inactive account cleanup failed');
            }
        });

        logger.info('cron: scheduled inactive account cleanup at 03:00 daily');
    }
}
