import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import ResourceRepository from '#repositories/resource_repository';
import OrderRepository from '#repositories/order_repository';
import DeliveryRepository from '#repositories/delivery_repository';
import OrganizationRepository from '#repositories/organization_repository';
import OrganizationResourcePriceRepository from '#repositories/organization_resource_price_repository';
import UserRepository from '#repositories/user_repository';
import CastellanyRepository from '#repositories/castellany_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import CastellanyTransformer from '#transformers/castellany_transformer';
import OrganizationRoleEnum from '#types/enum/organization_role_enum';
import { createOrderArchiveValidator } from '#validators/admin/order_archives';
import { resolveRecipient } from '#helpers/recipient_resolver';
import { getWeekNumber, getWeekRange } from '#helpers/game_week_helper';

const ORGANIZATION_ORDER_ROLES = [OrganizationRoleEnum.OWNER, OrganizationRoleEnum.ADMIN];

export default class OrderArchivesController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly orderRepository: OrderRepository = new OrderRepository(),
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
        private readonly organizationResourcePriceRepository: OrganizationResourcePriceRepository = new OrganizationResourcePriceRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly castellanyRepository: CastellanyRepository = new CastellanyRepository(),
    ) {}

    public async create({ inertia }: HttpContext) {
        const [resources, clientUsers, allOrganizations, allResourcePrices, castellanies] = await Promise.all([
            this.resourceRepository.all(),
            this.userRepository.findAllClients(),
            this.organizationRepository.all(),
            this.organizationResourcePriceRepository.allGroupedByOrganization(),
            this.castellanyRepository.all(),
        ]);
        const organizationNameById = new Map(allOrganizations.map((organization) => [organization.id, organization.name]));
        const organizationCastellanyById = new Map(allOrganizations.map((organization) => [organization.id, organization.castellanyId]));

        const currentWeek = getWeekNumber(DateTime.now());
        const availableWeeks = [];
        for (let weekNumber = currentWeek; weekNumber >= 1; weekNumber--) {
            const { start, end } = getWeekRange(weekNumber);
            availableWeeks.push({ weekNumber, startDate: start.toJSDate().toISOString(), endDate: end.toJSDate().toISOString() });
        }

        return inertia.render('admin/commandes/archive', {
            resources: resources.map((resource) => new ResourceTransformer(resource).toObject()),
            clients: clientUsers.map((client) => ({
                id: client.id,
                username: client.username,
                organizationId: client.organizationId,
                organizationName: client.organizationId ? (organizationNameById.get(client.organizationId) ?? null) : null,
                defaultCastellanyId: client.organizationId ? (organizationCastellanyById.get(client.organizationId) ?? null) : null,
            })),
            organizations: allOrganizations.map((organization) => ({ id: organization.id, name: organization.name, castellanyId: organization.castellanyId })),
            organizationResourcePrices: allResourcePrices,
            castellanies: castellanies.map((castellany) => new CastellanyTransformer(castellany).toObject()),
            currentWeek,
            availableWeeks,
        });
    }

    public async store({ request, auth, response, session, i18n }: HttpContext) {
        const { items, orderWeek, deliveryWeek, castellanyId, ...recipientData } = await request.validateUsing(createOrderArchiveValidator);
        const requestedItems = items.filter((item) => item.quantity > 0);

        if (!requestedItems.length) {
            session.flash('error', i18n.t('messages.admin.orderArchives.create.error'));
            return response.redirect().back();
        }

        const currentWeek = getWeekNumber(DateTime.now());

        if (orderWeek > currentWeek) {
            session.flash('error', i18n.t('messages.admin.orderArchives.create.invalidOrderWeek'));
            return response.redirect().back();
        }

        if (deliveryWeek < orderWeek || deliveryWeek > currentWeek) {
            session.flash('error', i18n.t('messages.admin.orderArchives.create.invalidDeliveryWeek'));
            return response.redirect().back();
        }

        try {
            const recipient = await resolveRecipient(
                auth,
                recipientData,
                { organizationRepository: this.organizationRepository, userRepository: this.userRepository },
                { organizationRoles: ORGANIZATION_ORDER_ROLES },
            );
            if (!recipient) {
                session.flash('error', i18n.t('messages.admin.orderArchives.create.error'));
                return response.redirect().back();
            }
            const { organizationId, organizationName, recipientUserId, requesterName } = recipient;

            const resources = await this.resourceRepository.all();
            const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
            const priceOverrides = organizationId ? await this.organizationResourcePriceRepository.findMapForOrganization(organizationId) : new Map<string, number>();

            const lines = requestedItems
                .map((item) => {
                    const resource = resourceById.get(item.resourceId);
                    if (!resource) return null;

                    const unitPrice = priceOverrides.get(resource.id) ?? Number(resource.sellPrice);
                    return {
                        resourceId: resource.id,
                        resourceName: resource.name,
                        resourceType: resource.type,
                        quantity: item.quantity,
                        unitPrice,
                        totalPrice: unitPrice * item.quantity,
                    };
                })
                .filter((line): line is NonNullable<typeof line> => line !== null);

            if (!lines.length) {
                session.flash('error', i18n.t('messages.admin.orderArchives.create.error'));
                return response.redirect().back();
            }

            const totalAmount = lines.reduce((sum, line) => sum + line.totalPrice, 0);
            const admin = auth.user!;

            const order = await this.orderRepository.createWithLines({
                userId: admin.id,
                organizationId,
                organizationName,
                recipientUserId,
                requesterName,
                totalAmount,
                lines,
                weekNumber: orderWeek,
            });

            const remaining = await this.deliveryRepository.remainingQuantities(order.id);
            const deliveryLines = remaining.map((line) => ({ orderLineId: line.orderLineId, quantity: line.remainingQuantity }));
            const deliveredAt = getWeekRange(deliveryWeek).start;

            await this.deliveryRepository.createForOrder(order.id, admin.id, deliveryLines, { deliveredAt, castellanyId: castellanyId ?? null });

            session.flash('success', i18n.t('messages.admin.orderArchives.create.success'));
            return response.redirect().toRoute('admin.commandes.index');
        } catch (e) {
            logger.error({ err: e }, 'orderArchives.store failed');
            session.flash('error', i18n.t('messages.admin.orderArchives.create.error'));
            return response.redirect().back();
        }
    }
}
