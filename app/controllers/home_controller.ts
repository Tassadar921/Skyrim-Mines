import { DateTime } from 'luxon';
import { type HttpContext } from '@adonisjs/core/http';
import ResourceRepository from '#repositories/resource_repository';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceBarrelAdjustmentRepository from '#repositories/resource_barrel_adjustment_repository';
import PermanenceSlotRepository from '#repositories/permanence_slot_repository';
import PermanenceAttendanceRepository from '#repositories/permanence_attendance_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import { computeBarrelQuantity } from '#helpers/resource_barrel_helper';
import { DEPOSIT_EDIT_WINDOW_MINUTES } from '#helpers/deposit_edit_window_helper';
import { isAdminOrForeman } from '#helpers/user_role_helper';
import { GAME_TIMEZONE } from '#helpers/game_week_helper';
import { upcomingPermanencesToday } from '#helpers/permanence_helper';
import type User from '#models/user';

export default class HomeController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBarrelAdjustmentRepository: ResourceBarrelAdjustmentRepository = new ResourceBarrelAdjustmentRepository(),
        private readonly permanenceSlotRepository: PermanenceSlotRepository = new PermanenceSlotRepository(),
        private readonly permanenceAttendanceRepository: PermanenceAttendanceRepository = new PermanenceAttendanceRepository(),
    ) {}

    /** Today's permanences still to come (or ongoing) with who will be there; owners and foremen only, null otherwise. */
    private async permanencesToday(user: User | undefined) {
        if (!user || !isAdminOrForeman(user.role)) return null;

        const now = DateTime.now().setZone(GAME_TIMEZONE);
        const slots = await this.permanenceSlotRepository.forWeekday(now.weekday);
        const permanences = upcomingPermanencesToday(slots, now);
        const attendances = await this.permanenceAttendanceRepository.forDay(
            permanences.map((permanence) => permanence.slot.id),
            now,
        );

        return permanences.map((permanence) => {
            const attendees = attendances.filter((attendance) => attendance.permanenceSlotId === permanence.slot.id);
            return {
                slotId: permanence.slot.id,
                startsAt: permanence.startsAt.toFormat('HH:mm'),
                endsAt: permanence.endsAt.toFormat('HH:mm'),
                attendees: attendees.map((attendance) => ({ id: attendance.userId, username: attendance.user.username, role: attendance.user.role })),
                isAttending: attendees.some((attendance) => attendance.userId === user.id),
            };
        });
    }

    public async index({ inertia, auth }: HttpContext) {
        const user = auth.user;

        const [resources, depositTotals, buybackTotals, adjustmentTotals, myDepositTotals, myBuybackTotals, myAdjustmentTotals] = await Promise.all([
            this.resourceRepository.all(),
            this.resourceDepositRepository.sumByResource(),
            this.resourceBuybackRepository.sumByResource(),
            this.resourceBarrelAdjustmentRepository.sumByResource(),
            user ? this.resourceDepositRepository.sumByUser(user.id) : new Map<string, number>(),
            user ? this.resourceBuybackRepository.sumByUser(user.id) : new Map<string, number>(),
            user ? this.resourceBarrelAdjustmentRepository.sumByUser(user.id) : new Map<string, number>(),
        ]);

        const myDeposits = user ? await this.resourceDepositRepository.findRecentByUser(user.id, DateTime.now().minus({ minutes: DEPOSIT_EDIT_WINDOW_MINUTES })) : [];

        return inertia.render('home', {
            resources: resources.map((r) => ({
                ...new ResourceTransformer(r).toObject(),
                quantityBarrel: computeBarrelQuantity(r.id, depositTotals, buybackTotals, adjustmentTotals),
                myQuantityBarrel: computeBarrelQuantity(r.id, myDepositTotals, myBuybackTotals, myAdjustmentTotals),
            })),
            permanencesToday: await this.permanencesToday(user),
            myDeposits: myDeposits.map((deposit) => ({
                id: deposit.id,
                resourceId: deposit.resourceId,
                quantity: deposit.quantity,
                createdAt: deposit.createdAt.toISO()!,
            })),
        });
    }
}
