import { type DateTime } from 'luxon';
import BaseRepository from '#repositories/base/base_repository';
import PermanenceAttendance from '#models/permanence_attendance';

export default class PermanenceAttendanceRepository extends BaseRepository<typeof PermanenceAttendance> {
    constructor() {
        super(PermanenceAttendance);
    }

    /** Who said "I'll be there" for these slots on the given day, oldest first. */
    public async forDay(slotIds: string[], date: DateTime): Promise<PermanenceAttendance[]> {
        if (!slotIds.length) return [];
        return PermanenceAttendance.query().whereIn('permanenceSlotId', slotIds).where('date', date.toISODate()!).preload('user').orderBy('createdAt', 'asc');
    }

    public async findForUser(slotId: string, date: DateTime, userId: string): Promise<PermanenceAttendance | null> {
        return PermanenceAttendance.query().where('permanenceSlotId', slotId).where('date', date.toISODate()!).where('userId', userId).first();
    }
}
