/** Allowed permanence lengths, in minutes: 30 min to 2 h by quarter hours (same bounds as the server). */
export const PERMANENCE_DURATIONS = [30, 45, 60, 75, 90, 105, 120];
export const DEFAULT_PERMANENCE_DURATION = 60;

/** "1 h", "1 h 30", "45 min": permanence durations as shown in the back office. */
export function formatDuration(minutes: number, t: (key: string, values?: Record<string, unknown>) => string): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) return t('admin.permanences.durations.minutes', { minutes: rest });
    if (!rest) return t('admin.permanences.durations.hours', { hours });
    return t('admin.permanences.durations.hoursMinutes', { hours, minutes: String(rest).padStart(2, '0') });
}

/** End of a slot starting at "HH:mm" and lasting `minutes`, as "HH:mm" (wraps past midnight). */
export function addMinutesToTime(time: string, minutes: number): string {
    const [hour, minute] = time.split(':').map(Number);
    const total = (hour * 60 + minute + minutes) % (24 * 60);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
