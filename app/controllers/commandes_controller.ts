import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import transmit from '@adonisjs/transmit/services/main';
import ResourceRepository from '#repositories/resource_repository';
import OrderRepository from '#repositories/order_repository';
import DeliveryRepository from '#repositories/delivery_repository';
import OrganizationRepository from '#repositories/organization_repository';
import OrganizationResourcePriceRepository from '#repositories/organization_resource_price_repository';
import UserRepository from '#repositories/user_repository';
import FileRepository from '#repositories/file_repository';
import type Order from '#models/order';
import ResourceTransformer from '#transformers/resource_transformer';
import OrganizationRoleEnum from '#types/enum/organization_role_enum';
import OrderStatusEnum from '#types/enum/order_status_enum';
import { createOrderValidator } from '#validators/orders';
import { generateDocumentPdf, COMPANY_NAME } from '#helpers/document_pdf_helper';
import { storeGeneratedFile } from '#helpers/file_storage_helper';
import { isStaffOrAdmin } from '#helpers/user_role_helper';
import { resolveRecipient } from '#helpers/recipient_resolver';

const PER_PAGE = 20;
const ORGANIZATION_ORDER_ROLES = [OrganizationRoleEnum.OWNER, OrganizationRoleEnum.ADMIN];

export default class CommandesController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly orderRepository: OrderRepository = new OrderRepository(),
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
        private readonly organizationResourcePriceRepository: OrganizationResourcePriceRepository = new OrganizationResourcePriceRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly fileRepository: FileRepository = new FileRepository(),
    ) {}

    private async buildLines(order: Order) {
        const remaining = await this.deliveryRepository.remainingQuantities(order.id);
        const remainingByLine = new Map(remaining.map((line) => [line.orderLineId, line]));

        return order.lines.map((line) => ({
            resourceName: line.resourceName,
            resourceType: line.resourceType,
            quantity: line.quantity,
            unitPrice: Number(line.unitPrice),
            totalPrice: Number(line.totalPrice),
            deliveredQuantity: remainingByLine.get(line.id)?.deliveredQuantity ?? 0,
            remainingQuantity: remainingByLine.get(line.id)?.remainingQuantity ?? line.quantity,
        }));
    }

    public async index({ inertia, auth, request }: HttpContext) {
        const viewer = auth.user!;
        const page = request.input('page', 1);

        const orders = await this.orderRepository.paginateForRecipient(viewer.id, { page, perPage: PER_PAGE });

        return inertia.render('commandes/index', {
            orders: await Promise.all(
                orders.all().map(async (order) => ({
                    id: order.id,
                    number: order.number,
                    requesterName: order.requesterName,
                    status: order.status,
                    totalAmount: Number(order.totalAmount),
                    createdAt: order.createdAt.toISO()!,
                    fileUrl: order.file?.path ?? null,
                    lines: await this.buildLines(order),
                })),
            ),
            meta: {
                total: orders.total,
                currentPage: orders.currentPage,
                lastPage: orders.lastPage,
                perPage: orders.perPage,
            },
        });
    }

    public async create({ inertia, auth }: HttpContext) {
        const user = auth.user!;
        const resources = await this.resourceRepository.all();

        let organizationId: string | null = null;
        let organizationName: string | null = null;
        if (user.organizationId && ORGANIZATION_ORDER_ROLES.includes(user.organizationRole as OrganizationRoleEnum)) {
            const organization = await this.organizationRepository.findOrFail(user.organizationId);
            organizationId = organization.id;
            organizationName = organization.name;
        }

        const allowThirdParty = isStaffOrAdmin(user.role);
        let clients: { id: string; username: string; organizationId: string | null; organizationName: string | null }[] = [];
        let organizations: { id: string; name: string }[] = [];
        let organizationResourcePrices: Record<string, Record<string, number>> = {};

        if (allowThirdParty) {
            const [clientUsers, allOrganizations, allResourcePrices] = await Promise.all([
                this.userRepository.findAllClients(),
                this.organizationRepository.all(),
                this.organizationResourcePriceRepository.allGroupedByOrganization(),
            ]);
            const organizationNameById = new Map(allOrganizations.map((organization) => [organization.id, organization.name]));

            clients = clientUsers.map((client) => ({
                id: client.id,
                username: client.username,
                organizationId: client.organizationId,
                organizationName: client.organizationId ? (organizationNameById.get(client.organizationId) ?? null) : null,
            }));
            organizations = allOrganizations.map((organization) => ({ id: organization.id, name: organization.name }));
            organizationResourcePrices = allResourcePrices;
        } else if (organizationId) {
            const ownResourcePrices = await this.organizationResourcePriceRepository.findMapForOrganization(organizationId);
            organizationResourcePrices = { [organizationId]: Object.fromEntries(ownResourcePrices) };
        }

        return inertia.render('commandes/create', {
            resources: resources.map((resource) => new ResourceTransformer(resource).toObject()),
            organizationId,
            organizationName,
            canRequestForThirdParty: allowThirdParty,
            clients,
            organizations,
            organizationResourcePrices,
        });
    }

    public async store({ request, auth, response, session, i18n }: HttpContext) {
        const { items, ...recipientData } = await request.validateUsing(createOrderValidator);
        const requestedItems = items.filter((item) => item.quantity > 0);

        if (!requestedItems.length) {
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
                session.flash('error', i18n.t('messages.commandes.create.error'));
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
                return response.redirect().back();
            }

            const totalAmount = lines.reduce((sum, line) => sum + line.totalPrice, 0);
            const user = auth.user!;

            const order = await this.orderRepository.createWithLines({
                userId: user.id,
                organizationId,
                organizationName,
                recipientUserId,
                requesterName,
                totalAmount,
                lines,
            });

            const pdfBuffer = await generateDocumentPdf({
                documentLabel: 'Commande',
                footerText: `Commande réalisée par la ${COMPANY_NAME}`,
                number: order.number,
                organizationName,
                requesterName,
                createdAt: order.createdAt,
                lines,
                totalAmount,
            });

            const filename = `cmc_commande_${order.number}.pdf`;
            const path = await storeGeneratedFile(pdfBuffer, 'uploads/commandes', filename);
            const file = await this.fileRepository.create({
                path,
                originalName: filename,
                mimeType: 'application/pdf',
                size: pdfBuffer.byteLength,
            });

            await this.orderRepository.setFile(order.id, file.id);

            session.flash('success', i18n.t('messages.commandes.create.success'));
            return response.redirect().toRoute('commandes.show', { id: order.id });
        } catch (e) {
            logger.error({ err: e }, 'commandes.store failed');
            session.flash('error', i18n.t('messages.commandes.create.error'));
            return response.redirect().back();
        }
    }

    public async show({ inertia, params, auth, response, session, i18n }: HttpContext) {
        const order = await this.orderRepository.findOrFail(params.id);
        const viewer = auth.user!;

        const isRecipient = order.recipientUserId === viewer.id;
        const isSameOrganization = order.organizationId !== null && order.organizationId === viewer.organizationId;
        if (!isStaffOrAdmin(viewer.role) && !isRecipient && !isSameOrganization) {
            session.flash('error', i18n.t('messages.commandes.show.forbidden'));
            return response.redirect().toRoute('home');
        }

        return inertia.render('commandes/show', {
            order: {
                id: order.id,
                number: order.number,
                organizationName: order.organizationName,
                requesterName: order.requesterName,
                status: order.status,
                totalAmount: Number(order.totalAmount),
                createdAt: order.createdAt.toISO()!,
                fileUrl: order.file?.path ?? null,
                lines: await this.buildLines(order),
            },
        });
    }

    public async cancel({ params, auth, response, session, i18n }: HttpContext) {
        const order = await this.orderRepository.findOrFail(params.id);
        const viewer = auth.user!;

        const isRecipient = order.recipientUserId === viewer.id;
        const isSameOrganization = order.organizationId !== null && order.organizationId === viewer.organizationId;
        if (!isStaffOrAdmin(viewer.role) && !isRecipient && !isSameOrganization) {
            session.flash('error', i18n.t('messages.commandes.show.forbidden'));
            return response.redirect().toRoute('home');
        }

        const success = await this.orderRepository.transitionStatus(order.id, [OrderStatusEnum.PENDING, OrderStatusEnum.TO_DELIVER], OrderStatusEnum.CANCELLED);
        if (success) transmit.broadcast('to-deliver', {});
        session.flash(success ? 'success' : 'error', i18n.t(success ? 'messages.commandes.cancel.success' : 'messages.commandes.cancel.error'));
        return response.redirect().back();
    }
}
