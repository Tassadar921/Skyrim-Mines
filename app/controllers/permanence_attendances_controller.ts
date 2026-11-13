import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import transmit from '@adonisjs/transmit/services/main';
import PermanenceSlotRepository from '#repositories/permanence_slot_repository';
import PermanenceAttendanceRepository from '#repositories/permanence_attendance_repository';
import AgendaEventRepository from '#repositories/agenda_event_repository';
import UserRoleEnum from '#types/enum/user_role_enum';
import { GAME_TIMEZONE } from '#helpers/game_week_helper';
import { upcomingPermanencesToday } from '#helpers/permanence_helper';

/** "I'll be there" on the landing page, for owners and foremen, on a permanence day. */
export default class PermanenceAttendancesController {
    constructor(
        private readonly permanenceSlotRepository: PermanenceSlotRepository = new PermanenceSlotRepository(),
        private readonly permanenceAttendanceRepository: PermanenceAttendanceRepository = new PermanenceAttendanceRepository(),
        private readonly agendaEventRepository: AgendaEventRepository = new AgendaEventRepository(),
    ) {}

    public async store({ params, auth, response, session, i18n }: HttpContext) {
        const user = auth.user!;
        const now = DateTime.now().setZone(GAME_TIMEZONE);
        const slots = await this.permanenceSlotRepository.forWeekday(now.weekday);
        // Only today's permanences that are not over can be joined.
        const permanence = upcomingPermanencesToday(slots, now).find((candidate) => candidate.slot.id === params.slotId);
        if (!permanence) {
            session.flash('error', i18n.t('messages.permanences.attendance.notAvailable'));
            return response.redirect().back();
        }

        if (await this.permanenceAttendanceRepository.findForUser(permanence.slot.id, now, user.id)) {
            return response.redirect().back();
        }

        try {
            // Owners get the permanence in their personal agenda.
            const agendaEvent =
                user.role === UserRoleEnum.ADMIN
                    ? await this.agendaEventRepository.create({
                          ownerId: user.id,
                          title: i18n.t('messages.permanences.attendance.agendaTitle'),
                          description: null,
                          isShared: false,
                          allDay: false,
                          startsAt: permanence.startsAt,
                          endsAt: permanence.endsAt,
                          recursWeekly: false,
                          recurrenceEndsOn: null,
                          needsAssignee: false,
                          assignedToId: null,
                      })
                    : null;

            await this.permanenceAttendanceRepository.create({ permanenceSlotId: permanence.slot.id, date: now.startOf('day'), userId: user.id, agendaEventId: agendaEvent?.id ?? null });

            transmit.broadcast('permanences', {});
            if (agendaEvent) transmit.broadcast('agenda', {});
            session.flash('success', i18n.t(agendaEvent ? 'messages.permanences.attendance.joinedWithAgenda' : 'messages.permanences.attendance.joined'));
        } catch (e) {
            logger.error({ err: e }, 'permanenceAttendances.store failed');
            session.flash('error', i18n.t('messages.permanences.attendance.error'));
        }

        return response.redirect().back();
    }

    /** Changed plans: withdraws, and removes the agenda event created for it if it is still there. */
    public async destroy({ params, auth, response, session, i18n }: HttpContext) {
        const user = auth.user!;
        const now = DateTime.now().setZone(GAME_TIMEZONE);
        const attendance = await this.permanenceAttendanceRepository.findForUser(params.slotId, now, user.id);
        if (!attendance) return response.redirect().back();

        try {
            const agendaEvent = attendance.agendaEventId ? await this.agendaEventRepository.findVisible(attendance.agendaEventId, user.id) : null;
            if (agendaEvent) await this.agendaEventRepository.delete(agendaEvent);
            await attendance.delete();

            transmit.broadcast('permanences', {});
            if (agendaEvent) transmit.broadcast('agenda', {});
            session.flash('success', i18n.t('messages.permanences.attendance.left'));
        } catch (e) {
            logger.error({ err: e }, 'permanenceAttendances.destroy failed');
            session.flash('error', i18n.t('messages.permanences.attendance.error'));
        }

        return response.redirect().back();
    }
}
