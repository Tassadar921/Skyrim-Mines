const LOCALE = 'fr-FR';
const TIME_ZONE = 'Europe/Paris';

/** Full date, e.g. "14/10/2026". */
export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(LOCALE, { timeZone: TIME_ZONE });
}

/**
 * Day + month only, e.g. "14/10" — used for game-week range badges (Monday -> Sunday).
 * Takes a plain "YYYY-MM-DD" calendar date and reformats it with string slicing, never through
 * `new Date()` + a timeZone option: that round-trip re-interprets the value as an instant and can
 * shift it onto the adjacent calendar day, which would silently break the Monday-Sunday week grid.
 */
export function formatShortDate(isoDate: string): string {
    const [, month, day] = isoDate.split('-');
    return `${day}/${month}`;
}

/** Same calendar-date-safe reformatting as {@link formatShortDate}, but keeping the year: "DD/MM/YYYY". */
export function formatCalendarDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

/** Full date + time, e.g. "14/10/2026 09:41:00". */
export function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString(LOCALE, { timeZone: TIME_ZONE });
}
