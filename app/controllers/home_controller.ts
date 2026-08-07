import { type HttpContext } from '@adonisjs/core/http';
import ResourceRepository from '#repositories/resource_repository';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import OrderRepository from '#repositories/order_repository';
import DeliveryRepository from '#repositories/delivery_repository';
import OrganizationRepository from '#repositories/organization_repository';
import CastellanyRepository from '#repositories/castellany_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import CastellanyTransformer from '#transformers/castellany_transformer';
import { isStaffOrAdmin } from '#helpers/user_role_helper';

export default class HomeController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly orderRepository: OrderRepository = new OrderRepository(),
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
        private readonly castellanyRepository: CastellanyRepository = new CastellanyRepository(),
    ) {}

    public async index({ inertia, auth }: HttpContext) {
        const [resources, depositTotals, buybackTotals] = await Promise.all([
            this.resourceRepository.all(),
            this.resourceDepositRepository.sumByResource(),
            this.resourceBuybackRepository.sumByResource(),
        ]);

        const user = auth.user;
        const canDeliver = !!user && isStaffOrAdmin(user.role);
        const ordersToDeliver = canDeliver ? await this.orderRepository.findToDeliver() : [];

        const [organizations, castellanies] = canDeliver ? await Promise.all([this.organizationRepository.all(), this.castellanyRepository.all()]) : [[], []];
        const organizationCastellanyById = new Map(organizations.map((organization) => [organization.id, organization.castellanyId]));

        const ordersToDeliverWithRemaining = await Promise.all(
            ordersToDeliver.map(async (order) => {
                const remaining = await this.deliveryRepository.remainingQuantities(order.id);
                return {
                    id: order.id,
                    number: order.number,
                    requesterName: order.requesterName,
                    organizationName: order.organizationName,
                    defaultCastellanyId: order.organizationId ? (organizationCastellanyById.get(order.organizationId) ?? null) : null,
                    lines: remaining
                        .filter((line) => line.remainingQuantity > 0)
                        .map((line) => ({
                            orderLineId: line.orderLineId,
                            resourceName: line.resourceName,
                            resourceType: line.resourceType,
                            unitPrice: line.unitPrice,
                            orderedQuantity: line.orderedQuantity,
                            remainingQuantity: line.remainingQuantity,
                        })),
                };
            }),
        );

        return inertia.render('home', {
            resources: resources.map((r) => ({
                ...new ResourceTransformer(r).toObject(),
                quantityBarrel: (depositTotals.get(r.id) ?? 0) - (buybackTotals.get(r.id) ?? 0),
            })),
            ordersToDeliver: ordersToDeliverWithRemaining.filter((order) => order.lines.length > 0),
            castellanies: castellanies.map((castellany) => new CastellanyTransformer(castellany).toObject()),
        });
    }
}
