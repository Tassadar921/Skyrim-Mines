import BaseRepository from '#repositories/base/base_repository';
import PermanenceSlot from '#models/permanence_slot';

export default class PermanenceSlotRepository extends BaseRepository<typeof PermanenceSlot> {
    constructor() {
        super(PermanenceSlot);
    }

    /** Week order: Monday first, then by time. */
    public async allOrdered(): Promise<PermanenceSlot[]> {
        return PermanenceSlot.query().orderBy('weekday', 'asc').orderBy('time', 'asc');
    }

    public async forWeekday(weekday: number): Promise<PermanenceSlot[]> {
        return PermanenceSlot.query().where('weekday', weekday).orderBy('time', 'asc');
    }

    public async exists(weekday: number, time: string): Promise<boolean> {
        return !!(await PermanenceSlot.query().where('weekday', weekday).where('time', time).first());
    }

    public async updateDuration(id: string, durationMinutes: number): Promise<PermanenceSlot> {
        const slot = await PermanenceSlot.findOrFail(id);
        return slot.merge({ durationMinutes }).save();
    }

    public async delete(id: string): Promise<void> {
        const slot = await PermanenceSlot.findOrFail(id);
        await slot.delete();
    }
}
