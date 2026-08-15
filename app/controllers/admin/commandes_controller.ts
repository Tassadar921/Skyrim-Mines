import { type HttpContext } from '@adonisjs/core/http';
import transmit from '@adonisjs/transmit/services/main';
import OrderRepository from '#repositories/order_repository';
import DeliveryRepository from '#repositories/delivery_repository';
import OrderStatusEnum from '#types/enum/order_status_enum';
import { indexOrderValidator } from '#validators/admin/orders';

const PER_PAGE = 20;

export default class CommandesController {
    constructor(
        private readonly orderRepository: OrderRepository = new OrderRepository(),
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
    ) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search, status } = await request.validateUsing(indexOrderValidator);

        const currentSort = sort ?? 'createdAt';
        const currentDir = dir ?? 'desc';
        const currentPage = page ?? 1;

        const orders = await this.orderRepository.paginate({
            page: currentPage,
            perPage: PER_PAGE,
            sort: currentSort,
            dir: currentDir,
            search,
            status,
        });

        return inertia.render('admin/commandes/index', {
            orders: await Promise.all(
                orders.all().map(async (order) => {
                    const remaining = await this.deliveryRepository.remainingQuantities(order.id);
                    const remainingByLine = new Map(remaining.map((line) => [line.orderLineId, line]));

                    return {
                        id: order.id,
                        number: order.number,
                        requesterName: order.requesterName,
                        organizationName: order.organizationName,
                        status: order.status,
                        totalAmount: Number(order.totalAmount),
                        createdAt: order.createdAt.toISO()!,
                        fileUrl: order.file?.path ?? null,
                        lines: order.lines.map((line) => ({
                            resourceName: line.resourceName,
                            resourceType: line.resourceType,
                            quantity: line.quantity,
                            unitPrice: Number(line.unitPrice),
                            totalPrice: Number(line.totalPrice),
                            deliveredQuantity: remainingByLine.get(line.id)?.deliveredQuantity ?? 0,
                            remainingQuantity: remainingByLine.get(line.id)?.remainingQuantity ?? line.quantity,
                        })),
                    };
                }),
            ),
            meta: {
                total: orders.total,
                currentPage: orders.currentPage,
                lastPage: orders.lastPage,
                perPage: orders.perPage,
            },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir, status: status ?? '' },
        });
    }

    public async validate({ params, response, session, i18n }: HttpContext) {
        const success = await this.orderRepository.transitionStatus(params.id, [OrderStatusEnum.PENDING], OrderStatusEnum.TO_DELIVER);
        if (success) transmit.broadcast('to-deliver', {});
        session.flash(success ? 'success' : 'error', i18n.t(success ? 'messages.commandes.validate.success' : 'messages.commandes.validate.error'));
        return response.redirect().back();
    }

    public async cancel({ params, response, session, i18n }: HttpContext) {
        const success = await this.orderRepository.transitionStatus(params.id, [OrderStatusEnum.PENDING, OrderStatusEnum.TO_DELIVER], OrderStatusEnum.CANCELLED);
        if (success) transmit.broadcast('to-deliver', {});
        session.flash(success ? 'success' : 'error', i18n.t(success ? 'messages.commandes.cancel.success' : 'messages.commandes.cancel.error'));
        return response.redirect().back();
    }
}
