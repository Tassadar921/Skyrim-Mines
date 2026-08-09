import { DateTime } from 'luxon';

export const GAME_WEEK_ONE_START = DateTime.fromObject({ year: 2026, month: 7, day: 27 }, { zone: 'utc' });

export function getWeekNumber(date: DateTime): number {
    const day = date.setZone('utc').startOf('day');
    const diffDays = Math.floor(day.diff(GAME_WEEK_ONE_START, 'days').days);

    return Math.floor(diffDays / 7) + 1;
}

export function getWeekRange(weekNumber: number): { start: DateTime; end: DateTime } {
    const start = GAME_WEEK_ONE_START.plus({ weeks: weekNumber - 1 });

    return { start, end: start.plus({ days: 6 }).endOf('day') };
}
