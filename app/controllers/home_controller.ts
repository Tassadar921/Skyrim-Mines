import { DateTime } from 'luxon';
import { type HttpContext } from '@adonisjs/core/http';
import ResourceRepository from '#repositories/resource_repository';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import OrderRepository from '#repositories/order_repository';
import DeliveryRepository from '#repositories/delivery_repository';
import OrganizationRepository from '#repositories/organization_repository';
import CastellanyRepository from '#repositories/castellany_repository';
import MaterialRepository from '#repositories/material_repository';
import MaterialStockRepository from '#repositories/material_stock_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import CastellanyTransformer from '#transformers/castellany_transformer';
import { isStaffOrAdmin } from '#helpers/user_role_helper';
import { DEPOSIT_EDIT_WINDOW_MINUTES } from '#helpers/deposit_edit_window_helper';
import { PICKAXE_MATERIAL_NAME } from '#helpers/pickaxe_helper';

export default class HomeController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly orderRepository: OrderRepository = new OrderRepository(),
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
        private readonly castellanyRepository: CastellanyRepository = new CastellanyRepository(),
        private readonly materialRepository: MaterialRepository = new MaterialRepository(),
        private readonly materialStockRepository: MaterialStockRepository = new MaterialStockRepository(),
    ) {}

    public async index({ inertia, auth }: HttpContext) {
        const user = auth.user;
        const isEmployeeOrAdmin = !!user && isStaffOrAdmin(user.role);

        const [resources, depositTotals, buybackTotals, myDepositTotals, myBuybackTotals, pickaxeMaterial] = await Promise.all([
            this.resourceRepository.all(),
            this.resourceDepositRepository.sumByResource(),
            this.resourceBuybackRepository.sumByResource(),
            user ? this.resourceDepositRepository.sumByUser(user.id) : new Map<string, number>(),
            user ? this.resourceBuybackRepository.sumByUser(user.id) : new Map<string, number>(),
            isEmployeeOrAdmin ? this.materialRepository.findOneBy({ name: PICKAXE_MATERIAL_NAME }) : null,
        ]);

        const pickaxeMaterialStock = pickaxeMaterial ? await this.materialStockRepository.findOneBy({ materialId: pickaxeMaterial.id }) : null;
        const pickaxeStock = pickaxeMaterial ? (pickaxeMaterialStock?.quantity ?? 0) : null;

        const ordersToDeliver = isEmployeeOrAdmin ? await this.orderRepository.findToDeliver() : [];

        const myDeposits = user ? await this.resourceDepositRepository.findRecentByUser(user.id, DateTime.now().minus({ minutes: DEPOSIT_EDIT_WINDOW_MINUTES })) : [];

        const [organizations, castellanies] = isEmployeeOrAdmin ? await Promise.all([this.organizationRepository.all(), this.castellanyRepository.all()]) : [[], []];
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
                myQuantityBarrel: (myDepositTotals.get(r.id) ?? 0) - (myBuybackTotals.get(r.id) ?? 0),
            })),
            ordersToDeliver: ordersToDeliverWithRemaining.filter((order) => order.lines.length > 0),
            castellanies: castellanies.map((castellany) => new CastellanyTransformer(castellany).toObject()),
            myDeposits: myDeposits.map((deposit) => ({
                id: deposit.id,
                resourceId: deposit.resourceId,
                quantity: deposit.quantity,
                createdAt: deposit.createdAt.toISO()!,
            })),
            pickaxeStock,
        });
    }
}
