import { DateTime } from 'luxon';

/** Original, hard-coded start of week 1 — also the earliest date an admin can move week 1 to. */
export const DEFAULT_GAME_WEEK_ONE_START = DateTime.fromObject({ year: 2026, month: 7, day: 27 }, { zone: 'utc' });

/** Timezone in which the game week rolls over (Monday 00:00 local time). */
export const GAME_TIMEZONE = 'Europe/Paris';

let weekOneStart = DEFAULT_GAME_WEEK_ONE_START;

/** Overrides the in-memory start-of-week-1 date, used by the admin-configurable setting. Pass null to reset to the default. */
export function setWeekOneStart(date: DateTime | null): void {
    weekOneStart = date?.setZone('utc').startOf('day') ?? DEFAULT_GAME_WEEK_ONE_START;
}

export function getWeekOneStart(): DateTime {
    return weekOneStart;
}

export function getWeekNumber(date: DateTime): number {
    // Take the calendar day as seen in GAME_TIMEZONE, then anchor it at UTC midnight to compare with weekOneStart.
    const day = DateTime.fromISO(date.setZone(GAME_TIMEZONE).toISODate()!, { zone: 'utc' });
    const diffDays = Math.floor(day.diff(weekOneStart, 'days').days);

    return Math.floor(diffDays / 7) + 1;
}

export function getWeekRange(weekNumber: number): { start: DateTime; end: DateTime } {
    const start = weekOneStart.plus({ weeks: weekNumber - 1 });

    return { start, end: start.plus({ days: 6 }).endOf('day') };
}
