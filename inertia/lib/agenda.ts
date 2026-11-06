/**
 * One occurrence of an event (a weekly event yields one per week shown); `id` is the event's, `occurrenceKey` is unique per occurrence.
 * Dates are naive Europe/Paris values: "YYYY-MM-DD" for days, "YYYY-MM-DDTHH:mm" for event bounds.
 */
export type AgendaEvent = {
    id: string;
    occurrenceKey: string;
    title: string;
    description: string | null;
    isShared: boolean;
    allDay: boolean;
    startsAt: string;
    endsAt: string;
    /** Bounds of the first occurrence, edited by the form. */
    seriesStartsAt: string;
    seriesEndsAt: string;
    recursWeekly: boolean;
    recurrenceEndsOn: string | null;
    /** Shared event waiting for an owner to say "I'll handle it". */
    needsAssignee: boolean;
    /** Whether it can be taken now: at most a week before it starts, and not over yet. */
    canTake: boolean;
    /** Day from which it can be taken, while still to assign. */
    takeableFrom: string | null;
    /** Owner who took the event over, if any. */
    assigneeName: string | null;
    /** The viewer took it and it is not over yet: they can hand it back. */
    canRelease: boolean;
    ownerName: string | null;
    isOwner: boolean;
};

export type AgendaView = 'month' | 'week' | 'day';

export const AGENDA_TIME_ZONE = 'Europe/Paris';
export const MINUTES_PER_DAY = 24 * 60;

export function dayOf(dateTime: string): string {
    return dateTime.slice(0, 10);
}

export function minutesOf(dateTime: string): number {
    return Number(dateTime.slice(11, 13)) * 60 + Number(dateTime.slice(14, 16));
}

export function formatMinutes(minutes: number): string {
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Whether the event covers part of the day; a timed event ending at exactly midnight does not spill onto the next day. */
function touchesDay(event: AgendaEvent, day: string): boolean {
    const startDay = dayOf(event.startsAt);
    const endDay = dayOf(event.endsAt);
    if (day < startDay || day > endDay) return false;
    return event.allDay || day === startDay || day !== endDay || minutesOf(event.endsAt) > 0;
}

/** Events touching the given day: all-day ones first, then by start time. */
export function eventsOnDay(events: AgendaEvent[], day: string): AgendaEvent[] {
    return events.filter((event) => touchesDay(event, day)).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.startsAt.localeCompare(b.startsAt));
}

/** Events still to assign stand out in red with a dashed outline: someone has to take them. */
export function eventClasses(event: AgendaEvent): string {
    if (event.needsAssignee) return 'bg-destructive/15 font-medium text-destructive outline-1 outline-dashed outline-destructive -outline-offset-1 hover:bg-destructive/25';
    return event.isShared ? 'bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 dark:text-amber-300' : 'bg-primary/15 text-primary hover:bg-primary/25';
}

export function eventBorderClass(event: AgendaEvent): string {
    if (event.needsAssignee) return 'border-destructive';
    return event.isShared ? 'border-amber-500' : 'border-primary';
}

export function eventDotClass(event: AgendaEvent): string {
    if (event.needsAssignee) return 'bg-destructive';
    return event.isShared ? 'bg-amber-500' : 'bg-primary';
}

/** Parses a calendar date as UTC midnight so date maths never shifts it onto another day. */
function toUtcDate(day: string): Date {
    const [year, month, date] = day.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, date));
}

export function formatDay(day: string, options: Intl.DateTimeFormatOptions): string {
    return toUtcDate(day).toLocaleDateString('fr-FR', { ...options, timeZone: 'UTC' });
}

export function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Current calendar day and minute of the day in Europe/Paris, whatever the browser's timezone. */
export function parisNow(): { day: string; minutes: number } {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', { timeZone: AGENDA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
            .formatToParts(new Date())
            .map((part) => [part.type, part.value]),
    );
    return { day: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}
