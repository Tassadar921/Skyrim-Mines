import { type DateTime } from 'luxon';
import type User from '#models/user';
import BaseRepository from '#repositories/base/base_repository';
import AgendaEvent from '#models/agenda_event';
import AgendaEventOccurrenceAssignment from '#models/agenda_event_occurrence_assignment';

type AgendaEventPayload = {
    title: string;
    description: string | null;
    isShared: boolean;
    allDay: boolean;
    startsAt: DateTime;
    endsAt: DateTime;
    recursWeekly: boolean;
    recurrenceEndsOn: DateTime | null;
    needsAssignee: boolean;
    assignedToId: string | null;
};

/** "personal": the event moves to the taker's own agenda; "shared": it stays shared, with the taker recorded as handling it. */
export type AgendaAssignMode = 'personal' | 'shared';

export default class AgendaEventRepository extends BaseRepository<typeof AgendaEvent> {
    constructor() {
        super(AgendaEvent);
    }

    /**
     * Events the given owner can see (their personal ones + every shared one) that may overlap [from, to]:
     * one-off events overlapping it, and weekly series started before its end and not finished before its start.
     * Weekly series still have to be expanded into occurrences by the caller.
     */
    public async visibleInRange(userId: string, from: DateTime, to: DateTime): Promise<AgendaEvent[]> {
        return AgendaEvent.query()
            .where((query) => query.where('isShared', true).orWhere('ownerId', userId))
            .where('startsAt', '<=', to.toJSDate())
            .where((query) =>
                query
                    .where('endsAt', '>=', from.toJSDate())
                    .orWhere((series) => series.where('recursWeekly', true).where((until) => until.whereNull('recurrenceEndsOn').orWhere('recurrenceEndsOn', '>=', from.toISODate()!))),
            )
            .preload('owner')
            .preload('assignedTo')
            .preload('occurrenceAssignments', (assignments) => assignments.preload('user'))
            .orderBy('startsAt', 'asc');
    }

    /** Shared events still waiting for an owner to take them, as long as they are not over (a weekly series counts until its last day). */
    public async unassigned(now: DateTime): Promise<AgendaEvent[]> {
        return AgendaEvent.query()
            .where('isShared', true)
            .where('needsAssignee', true)
            .where((query) =>
                query
                    .where('endsAt', '>=', now.toJSDate())
                    .orWhere((series) => series.where('recursWeekly', true).where((until) => until.whereNull('recurrenceEndsOn').orWhere('recurrenceEndsOn', '>=', now.toISODate()!))),
            )
            .preload('owner')
            .preload('occurrenceAssignments', (assignments) => assignments.preload('user'))
            .orderBy('startsAt', 'asc');
    }

    /** Takes one occurrence of a weekly series; false when someone already took it (the unique key also guards concurrent takes). */
    public async assignOccurrence(event: AgendaEvent, occurrenceDate: DateTime, user: User): Promise<boolean> {
        const existing = await AgendaEventOccurrenceAssignment.query().where('agendaEventId', event.id).where('occurrenceDate', occurrenceDate.toISODate()!).first();
        if (existing) return false;

        try {
            await AgendaEventOccurrenceAssignment.create({ agendaEventId: event.id, occurrenceDate, userId: user.id });
            return true;
        } catch {
            return false;
        }
    }

    public async assign(event: AgendaEvent, user: User, mode: AgendaAssignMode): Promise<AgendaEvent> {
        event.merge({ needsAssignee: false, assignedToId: user.id });
        if (mode === 'personal') event.merge({ ownerId: user.id, isShared: false });
        return event.save();
    }

    /** Back to "to assign"; an event moved to the taker's personal agenda is shared again (it stays owned by them). */
    public async release(event: AgendaEvent): Promise<AgendaEvent> {
        return event.merge({ isShared: true, needsAssignee: true, assignedToId: null }).save();
    }

    public async releaseOccurrence(event: AgendaEvent, occurrenceDate: DateTime): Promise<void> {
        await AgendaEventOccurrenceAssignment.query().where('agendaEventId', event.id).where('occurrenceDate', occurrenceDate.toISODate()!).delete();
    }

    public async findVisible(id: string, userId: string): Promise<AgendaEvent | null> {
        return AgendaEvent.query()
            .where('id', id)
            .where((query) => query.where('isShared', true).orWhere('ownerId', userId))
            .first();
    }

    public async update(event: AgendaEvent, data: AgendaEventPayload): Promise<AgendaEvent> {
        return event.merge(data).save();
    }

    public async delete(event: AgendaEvent): Promise<void> {
        await event.delete();
    }
}
