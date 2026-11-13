import { DateTime } from 'luxon';
import { GAME_TIMEZONE } from '#helpers/game_week_helper';
import type PermanenceSlot from '#models/permanence_slot';

/** Allowed length of a permanence, in minutes. */
export const PERMANENCE_MIN_DURATION = 30;
export const PERMANENCE_MAX_DURATION = 120;

/** Start and end (Europe/Paris) of a weekly slot on a given day: from its time, for its own duration. */
export function permanenceWindow(slot: PermanenceSlot, day: DateTime): { startsAt: DateTime; endsAt: DateTime } {
    const [hour, minute] = slot.time.split(':').map(Number);
    const startsAt = day.setZone(GAME_TIMEZONE).startOf('day').set({ hour, minute });
    return { startsAt, endsAt: startsAt.plus({ minutes: slot.durationMinutes }) };
}

/** Today's slots (Europe/Paris) that are not over yet, with their window. */
export function upcomingPermanencesToday(slots: PermanenceSlot[], now: DateTime = DateTime.now().setZone(GAME_TIMEZONE)) {
    return slots
        .filter((slot) => slot.weekday === now.weekday)
        .map((slot) => ({ slot, ...permanenceWindow(slot, now) }))
        .filter((permanence) => permanence.endsAt > now);
}
