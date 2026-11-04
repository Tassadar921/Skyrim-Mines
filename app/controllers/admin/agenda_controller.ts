import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import AgendaEventRepository from '#repositories/agenda_event_repository';
import { assignAgendaEventValidator, indexAgendaEventValidator, storeAgendaEventValidator, type AGENDA_VIEWS } from '#validators/admin/agenda_events';
import { GAME_TIMEZONE } from '#helpers/game_week_helper';
import type AgendaEvent from '#models/agenda_event';

const LOCAL_DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm";

type AgendaView = (typeof AGENDA_VIEWS)[number];

/** Displayed range for a view around the anchor date, plus the anchors of the previous / next period. Weeks run Monday to Sunday. */
function resolveRange(view: AgendaView, anchor: DateTime): { start: DateTime; end: DateTime; previous: DateTime; next: DateTime } {
    if (view === 'month') {
        const monthStart = anchor.startOf('month');
        return { start: monthStart.startOf('week'), end: monthStart.endOf('month').endOf('week'), previous: monthStart.minus({ months: 1 }), next: monthStart.plus({ months: 1 }) };
    }
    if (view === 'week') {
        return { start: anchor.startOf('week'), end: anchor.endOf('week'), previous: anchor.minus({ weeks: 1 }), next: anchor.plus({ weeks: 1 }) };
    }
    return { start: anchor.startOf('day'), end: anchor.endOf('day'), previous: anchor.minus({ days: 1 }), next: anchor.plus({ days: 1 }) };
}

type AgendaEventInput = {
    title: string;
    description?: string | null;
    isShared: boolean;
    allDay: boolean;
    startsAt: string;
    endsAt: string;
    recursWeekly: boolean;
    recurrenceEndsOn?: string | null;
};

type ParsedSchedule = { startsAt: DateTime; endsAt: DateTime; recursWeekly: boolean; recurrenceEndsOn: DateTime | null };

/**
 * Turns the naive Europe/Paris form values into a valid schedule; all-day events span whole days (end day included).
 * A weekly event must last less than a week (occurrences can't overlap) and its last day can't precede its first one.
 */
function parseSchedule(data: AgendaEventInput): { schedule: ParsedSchedule } | { error: 'invalidRange' | 'invalidRecurrence' } {
    let startsAt = DateTime.fromISO(data.startsAt, { zone: GAME_TIMEZONE });
    let endsAt = DateTime.fromISO(data.endsAt, { zone: GAME_TIMEZONE });
    if (!startsAt.isValid || !endsAt.isValid) return { error: 'invalidRange' };

    if (data.allDay) {
        startsAt = startsAt.startOf('day');
        endsAt = endsAt.endOf('day');
    }
    if (endsAt < startsAt) return { error: 'invalidRange' };

    if (!data.recursWeekly) return { schedule: { startsAt, endsAt, recursWeekly: false, recurrenceEndsOn: null } };

    const recurrenceEndsOn = data.recurrenceEndsOn ? DateTime.fromISO(data.recurrenceEndsOn, { zone: GAME_TIMEZONE }) : null;
    if (endsAt.diff(startsAt, 'days').days >= 7) return { error: 'invalidRecurrence' };
    if (recurrenceEndsOn && (!recurrenceEndsOn.isValid || recurrenceEndsOn.toISODate()! < startsAt.toISODate()!)) return { error: 'invalidRecurrence' };

    return { schedule: { startsAt, endsAt, recursWeekly: true, recurrenceEndsOn } };
}

/**
 * Occurrences of an event overlapping [from, to]: the event itself, or each weekly repetition of it.
 * Weeks are added in Europe/Paris wall-clock time, so a 9:00 meeting stays at 9:00 across DST changes.
 */
function occurrencesInRange(event: AgendaEvent, from: DateTime, to: DateTime): { startsAt: DateTime; endsAt: DateTime }[] {
    const firstStart = event.startsAt.setZone(GAME_TIMEZONE);
    const firstEnd = event.endsAt.setZone(GAME_TIMEZONE);
    if (!event.recursWeekly) return [{ startsAt: firstStart, endsAt: firstEnd }];

    const lastDay = event.recurrenceEndsOn?.toISODate() ?? null;
    const occurrences = [];
    // Skip straight to the last weeks that may still overlap the range start.
    const skippedWeeks = Math.max(0, Math.floor(from.diff(firstEnd, 'weeks').weeks));
    for (let week = skippedWeeks; ; week++) {
        const startsAt = firstStart.plus({ weeks: week });
        if (startsAt > to || (lastDay && startsAt.toISODate()! > lastDay)) break;
        const endsAt = firstEnd.plus({ weeks: week });
        if (endsAt >= from) occurrences.push({ startsAt, endsAt });
    }

    return occurrences;
}

function serializeOccurrence(event: AgendaEvent, occurrence: { startsAt: DateTime; endsAt: DateTime }, userId: string) {
    const startsAt = occurrence.startsAt.toFormat(LOCAL_DATE_TIME_FORMAT);
    return {
        id: event.id,
        occurrenceKey: `${event.id}:${startsAt}`,
        title: event.title,
        description: event.description,
        isShared: event.isShared,
        allDay: event.allDay,
        startsAt,
        endsAt: occurrence.endsAt.toFormat(LOCAL_DATE_TIME_FORMAT),
        // The series itself, which is what the edit form changes.
        seriesStartsAt: event.startsAt.setZone(GAME_TIMEZONE).toFormat(LOCAL_DATE_TIME_FORMAT),
        seriesEndsAt: event.endsAt.setZone(GAME_TIMEZONE).toFormat(LOCAL_DATE_TIME_FORMAT),
        recursWeekly: event.recursWeekly,
        recurrenceEndsOn: event.recurrenceEndsOn?.toISODate() ?? null,
        needsAssignee: event.isShared && event.needsAssignee,
        assigneeName: event.assignedTo?.username ?? null,
        ownerName: event.owner?.username ?? null,
        isOwner: event.ownerId === userId,
    };
}

export default class AgendaController {
    constructor(private readonly agendaEventRepository: AgendaEventRepository = new AgendaEventRepository()) {}

    public async index({ inertia, request, auth }: HttpContext) {
        const payload = await request.validateUsing(indexAgendaEventValidator);
        const user = auth.user!;
        const view: AgendaView = payload.view ?? 'week';

        const now = DateTime.now().setZone(GAME_TIMEZONE);
        const requestedDate = payload.date ? DateTime.fromISO(payload.date, { zone: GAME_TIMEZONE }) : now;
        const anchor = (requestedDate.isValid ? requestedDate : now).startOf('day');
        const { start, end, previous, next } = resolveRange(view, anchor);

        const days: string[] = [];
        for (let day = start; day <= end; day = day.plus({ days: 1 })) {
            days.push(day.toISODate()!);
        }

        const [events, unassignedEvents] = await Promise.all([this.agendaEventRepository.visibleInRange(user.id, start, end), this.agendaEventRepository.unassigned(now)]);

        return inertia.render('admin/agenda/index', {
            view,
            date: anchor.toISODate()!,
            previousDate: previous.toISODate()!,
            nextDate: next.toISODate()!,
            today: now.toISODate()!,
            days,
            events: events
                .flatMap((event) => occurrencesInRange(event, start, end).map((occurrence) => serializeOccurrence(event, occurrence, user.id)))
                .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
            // Shown whatever the period on screen, each at its next occurrence (or the ongoing one).
            unassignedEvents: unassignedEvents
                .flatMap((event) => {
                    const [nextOccurrence] = occurrencesInRange(event, now, now.plus({ weeks: 2 }));
                    return nextOccurrence ? [serializeOccurrence(event, nextOccurrence, user.id)] : [];
                })
                .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
        });
    }

    public async store({ request, response, session, i18n, auth }: HttpContext) {
        const data = await request.validateUsing(storeAgendaEventValidator);
        const parsed = parseSchedule(data);
        if ('error' in parsed) {
            session.flash('error', i18n.t(`messages.admin.agenda.${parsed.error}`));
            return response.redirect().back();
        }

        try {
            await this.agendaEventRepository.create({
                ownerId: auth.user!.id,
                title: data.title,
                description: data.description || null,
                isShared: data.isShared,
                allDay: data.allDay,
                ...parsed.schedule,
                needsAssignee: data.isShared && data.needsAssignee,
                assignedToId: null,
            });
            session.flash('success', i18n.t('messages.admin.agenda.store.success'));
        } catch (e) {
            logger.error({ err: e }, 'agenda.store failed');
            session.flash('error', i18n.t('messages.admin.agenda.store.error'));
        }

        return response.redirect().back();
    }

    public async update({ params, request, response, session, i18n, auth }: HttpContext) {
        const data = await request.validateUsing(storeAgendaEventValidator);
        const user = auth.user!;
        const event = await this.agendaEventRepository.findVisible(params.id, user.id);
        if (!event) {
            session.flash('error', i18n.t('messages.admin.agenda.notFound'));
            return response.redirect().back();
        }

        const parsed = parseSchedule(data);
        if ('error' in parsed) {
            session.flash('error', i18n.t(`messages.admin.agenda.${parsed.error}`));
            return response.redirect().back();
        }

        try {
            // Any owner may edit a shared event, but only its creator can switch it between personal and shared.
            const isShared = event.ownerId === user.id ? data.isShared : event.isShared;
            // Flagging it "to assign" again releases whoever had taken it.
            const needsAssignee = isShared && data.needsAssignee;
            await this.agendaEventRepository.update(event, {
                title: data.title,
                description: data.description || null,
                isShared,
                allDay: data.allDay,
                ...parsed.schedule,
                needsAssignee,
                assignedToId: needsAssignee ? null : event.assignedToId,
            });
            session.flash('success', i18n.t('messages.admin.agenda.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'agenda.update failed');
            session.flash('error', i18n.t('messages.admin.agenda.update.error'));
        }

        return response.redirect().back();
    }

    public async assign({ params, request, response, session, i18n, auth }: HttpContext) {
        const { mode } = await request.validateUsing(assignAgendaEventValidator);
        const user = auth.user!;
        const event = await this.agendaEventRepository.findVisible(params.id, user.id);
        if (!event) {
            session.flash('error', i18n.t('messages.admin.agenda.notFound'));
            return response.redirect().back();
        }
        if (!event.isShared || !event.needsAssignee) {
            session.flash('error', i18n.t('messages.admin.agenda.assign.alreadyTaken'));
            return response.redirect().back();
        }

        try {
            await this.agendaEventRepository.assign(event, user, mode);
            session.flash('success', i18n.t(`messages.admin.agenda.assign.${mode}`));
        } catch (e) {
            logger.error({ err: e }, 'agenda.assign failed');
            session.flash('error', i18n.t('messages.admin.agenda.assign.error'));
        }

        return response.redirect().back();
    }

    public async destroy({ params, response, session, i18n, auth }: HttpContext) {
        const event = await this.agendaEventRepository.findVisible(params.id, auth.user!.id);
        if (!event) {
            session.flash('error', i18n.t('messages.admin.agenda.notFound'));
            return response.redirect().back();
        }

        try {
            await this.agendaEventRepository.delete(event);
            session.flash('success', i18n.t('messages.admin.agenda.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'agenda.destroy failed');
            session.flash('error', i18n.t('messages.admin.agenda.destroy.error'));
        }

        return response.redirect().back();
    }
}
