import { DateTime } from 'luxon';

/** Original, hard-coded start of week 1 — also the earliest date an admin can move week 1 to. */
export const DEFAULT_GAME_WEEK_ONE_START = DateTime.fromObject({ year: 2026, month: 7, day: 27 }, { zone: 'utc' });

let weekOneStart = DEFAULT_GAME_WEEK_ONE_START;

/** Overrides the in-memory start-of-week-1 date, used by the admin-configurable setting. Pass null to reset to the default. */
export function setWeekOneStart(date: DateTime | null): void {
    weekOneStart = date?.setZone('utc').startOf('day') ?? DEFAULT_GAME_WEEK_ONE_START;
}

export function getWeekOneStart(): DateTime {
    return weekOneStart;
}

export function getWeekNumber(date: DateTime): number {
    const day = date.setZone('utc').startOf('day');
    const diffDays = Math.floor(day.diff(weekOneStart, 'days').days);

    return Math.floor(diffDays / 7) + 1;
}

export function getWeekRange(weekNumber: number): { start: DateTime; end: DateTime } {
    const start = weekOneStart.plus({ weeks: weekNumber - 1 });

    return { start, end: start.plus({ days: 6 }).endOf('day') };
}
