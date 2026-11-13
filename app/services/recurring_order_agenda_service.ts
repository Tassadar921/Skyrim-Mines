import { DateTime } from 'luxon';
import transmit from '@adonisjs/transmit/services/main';
import type { I18n } from '@adonisjs/i18n';
import AgendaEventRepository from '#repositories/agenda_event_repository';
import RecurringOrderRepository from '#repositories/recurring_order_repository';
import { GAME_TIMEZONE } from '#helpers/game_week_helper';
import type RecurringOrder from '#models/recurring_order';

/** Length given to the agenda event of a delivery. */
const DELIVERY_EVENT_MINUTES = 60;

function formatAmount(value: number): string {
    return value.toFixed(2);
}

/** Next delivery on or after `from` (Europe/Paris): the order's weekday and time, this week or the next. */
function nextDelivery(order: RecurringOrder, from: DateTime): DateTime {
    const [hour, minute] = order.time.split(':').map(Number);
    const candidate = from
        .startOf('week')
        .plus({ days: order.weekday - 1 })
        .set({ hour, minute });
    return candidate >= from ? candidate : candidate.plus({ weeks: 1 });
}

/**
 * Keeps each fixed weekly order mirrored as a shared weekly agenda event: the label as title and, as description,
 * the goods to sell with their unit price and the total expected.
 */
export default class RecurringOrderAgendaService {
    constructor(
        private readonly agendaEventRepository: AgendaEventRepository = new AgendaEventRepository(),
        private readonly recurringOrderRepository: RecurringOrderRepository = new RecurringOrderRepository(),
    ) {}

    /** Order lines must be loaded with their resource. */
    public describe(order: RecurringOrder, i18n: I18n): string {
        const lines = order.lines.map((line) =>
            i18n.t('messages.admin.recurringOrders.agenda.line', {
                quantity: line.quantity,
                resource: line.resource.name,
                unitPrice: formatAmount(Number(line.unitPrice)),
                total: formatAmount(line.quantity * Number(line.unitPrice)),
            }),
        );
        const total = order.lines.reduce((sum, line) => sum + line.quantity * Number(line.unitPrice), 0);

        return [i18n.t('messages.admin.recurringOrders.agenda.goods'), ...lines, '', i18n.t('messages.admin.recurringOrders.agenda.total', { total: formatAmount(total) })].join('\n');
    }

    /**
     * Creates the event, or updates it after the order changed. An update keeps the event's first week, so past
     * deliveries stay in the agenda, and moves the series to the new weekday and time.
     */
    public async sync(order: RecurringOrder, userId: string, i18n: I18n): Promise<void> {
        const now = DateTime.now().setZone(GAME_TIMEZONE);
        const existing = order.agendaEventId ? await this.agendaEventRepository.find(order.agendaEventId) : null;
        const startsAt = existing ? nextDelivery(order, existing.startsAt.setZone(GAME_TIMEZONE).startOf('week')) : nextDelivery(order, now);

        const payload = {
            title: order.label,
            description: this.describe(order, i18n),
            isShared: true,
            allDay: false,
            startsAt,
            endsAt: startsAt.plus({ minutes: DELIVERY_EVENT_MINUTES }),
            recursWeekly: true,
            recurrenceEndsOn: null,
            needsAssignee: false,
            assignedToId: null,
        };

        if (existing) {
            await this.agendaEventRepository.update(existing, payload);
        } else {
            const event = await this.agendaEventRepository.create({ ownerId: userId, ...payload });
            await this.recurringOrderRepository.setAgendaEvent(order, event.id);
        }

        transmit.broadcast('agenda', {});
    }

    /** The order is deleted: past deliveries stay in the agenda (the series just stops), a series not started yet goes. */
    public async remove(order: RecurringOrder): Promise<void> {
        const event = order.agendaEventId ? await this.agendaEventRepository.find(order.agendaEventId) : null;
        if (!event) return;

        const today = DateTime.now().setZone(GAME_TIMEZONE).startOf('day');
        if (event.startsAt < today) {
            await event.merge({ recurrenceEndsOn: today.minus({ days: 1 }) }).save();
        } else {
            await this.agendaEventRepository.delete(event);
        }

        transmit.broadcast('agenda', {});
    }
}
