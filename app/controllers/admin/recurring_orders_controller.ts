import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import RecurringOrderRepository from '#repositories/recurring_order_repository';
import ResourceRepository from '#repositories/resource_repository';
import RecurringOrderAgendaService from '#services/recurring_order_agenda_service';
import ResourceTransformer from '#transformers/resource_transformer';
import { storeRecurringOrderValidator } from '#validators/admin/recurring_orders';

/** Fixed weekly orders, each mirrored as a shared weekly event in the owners' agenda. */
export default class RecurringOrdersController {
    constructor(
        private readonly recurringOrderRepository: RecurringOrderRepository = new RecurringOrderRepository(),
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly recurringOrderAgendaService: RecurringOrderAgendaService = new RecurringOrderAgendaService(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const [orders, resources] = await Promise.all([this.recurringOrderRepository.allWithLines(), this.resourceRepository.all()]);
        const position = new Map(resources.map((resource, index) => [resource.id, index]));

        return inertia.render('admin/recurring-orders/index', {
            orders: orders.map((order) => ({
                id: order.id,
                label: order.label,
                weekday: order.weekday,
                time: order.time,
                lines: [...order.lines]
                    .sort((a, b) => (position.get(a.resourceId) ?? 0) - (position.get(b.resourceId) ?? 0))
                    .map((line) => ({ resourceId: line.resourceId, resourceName: line.resource.name, resourceType: line.resource.type, quantity: line.quantity, unitPrice: Number(line.unitPrice) })),
            })),
            resources: resources.map((resource) => new ResourceTransformer(resource).toObject()),
        });
    }

    public async store({ request, response, session, i18n, auth }: HttpContext) {
        const { lines, ...data } = await request.validateUsing(storeRecurringOrderValidator);
        if (this.hasDuplicateResources(lines)) {
            session.flash('error', i18n.t('messages.admin.recurringOrders.duplicateResource'));
            return response.redirect().back();
        }

        try {
            const order = await this.recurringOrderRepository.createWithLines({ ...data, createdByUserId: auth.user!.id }, lines);
            await this.recurringOrderAgendaService.sync(order, auth.user!.id, i18n);
            session.flash('success', i18n.t('messages.admin.recurringOrders.store.success'));
        } catch (e) {
            logger.error({ err: e }, 'recurringOrders.store failed');
            session.flash('error', i18n.t('messages.admin.recurringOrders.store.error'));
        }

        return response.redirect().back();
    }

    public async update({ params, request, response, session, i18n, auth }: HttpContext) {
        const { lines, ...data } = await request.validateUsing(storeRecurringOrderValidator);
        if (this.hasDuplicateResources(lines)) {
            session.flash('error', i18n.t('messages.admin.recurringOrders.duplicateResource'));
            return response.redirect().back();
        }

        try {
            const existing = await this.recurringOrderRepository.findWithLines(params.id);
            const order = await this.recurringOrderRepository.updateWithLines(existing, data, lines);
            await this.recurringOrderAgendaService.sync(order, auth.user!.id, i18n);
            session.flash('success', i18n.t('messages.admin.recurringOrders.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'recurringOrders.update failed');
            session.flash('error', i18n.t('messages.admin.recurringOrders.update.error'));
        }

        return response.redirect().back();
    }

    public async destroy({ params, response, session, i18n }: HttpContext) {
        try {
            const order = await this.recurringOrderRepository.findWithLines(params.id);
            await this.recurringOrderAgendaService.remove(order);
            await order.delete();
            session.flash('success', i18n.t('messages.admin.recurringOrders.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'recurringOrders.destroy failed');
            session.flash('error', i18n.t('messages.admin.recurringOrders.destroy.error'));
        }

        return response.redirect().back();
    }

    private hasDuplicateResources(lines: { resourceId: string }[]): boolean {
        return new Set(lines.map((line) => line.resourceId)).size !== lines.length;
    }
}
