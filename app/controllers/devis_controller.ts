import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import ResourceRepository from '#repositories/resource_repository';
import QuoteRepository from '#repositories/quote_repository';
import OrganizationRepository from '#repositories/organization_repository';
import UserRepository from '#repositories/user_repository';
import FileRepository from '#repositories/file_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import { createQuoteValidator } from '#validators/quotes';
import { generateDocumentPdf, COMPANY_NAME } from '#helpers/document_pdf_helper';
import { storeGeneratedFile } from '#helpers/file_storage_helper';
import { isStaffOrAdmin } from '#helpers/user_role_helper';
import { resolveRecipient } from '#helpers/recipient_resolver';

const PER_PAGE = 20;

export default class DevisController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly quoteRepository: QuoteRepository = new QuoteRepository(),
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly fileRepository: FileRepository = new FileRepository(),
    ) {}

    public async index({ inertia, auth, request }: HttpContext) {
        const viewer = auth.user!;
        const page = request.input('page', 1);

        const quotes = await this.quoteRepository.paginateForRecipient(viewer.id, { page, perPage: PER_PAGE });

        return inertia.render('devis/index', {
            quotes: quotes.all().map((quote) => ({
                id: quote.id,
                number: quote.number,
                requesterName: quote.requesterName,
                totalAmount: Number(quote.totalAmount),
                createdAt: quote.createdAt.toISO()!,
                fileUrl: quote.file?.path ?? null,
                lines: quote.lines.map((line) => ({
                    resourceName: line.resourceName,
                    resourceType: line.resourceType,
                    quantity: line.quantity,
                    unitPrice: Number(line.unitPrice),
                    totalPrice: Number(line.totalPrice),
                })),
            })),
            meta: {
                total: quotes.total,
                currentPage: quotes.currentPage,
                lastPage: quotes.lastPage,
                perPage: quotes.perPage,
            },
        });
    }

    public async create({ inertia, auth }: HttpContext) {
        const user = auth.user!;
        const resources = await this.resourceRepository.all();

        let organizationName: string | null = null;
        if (user.organizationId) {
            const organization = await this.organizationRepository.findOrFail(user.organizationId);
            organizationName = organization.name;
        }

        const allowThirdParty = isStaffOrAdmin(user.role);
        let clients: { id: string; username: string; organizationName: string | null }[] = [];
        let organizations: { id: string; name: string }[] = [];

        if (allowThirdParty) {
            const [clientUsers, allOrganizations] = await Promise.all([this.userRepository.findAllClients(), this.organizationRepository.all()]);
            const organizationNameById = new Map(allOrganizations.map((organization) => [organization.id, organization.name]));

            clients = clientUsers.map((client) => ({
                id: client.id,
                username: client.username,
                organizationName: client.organizationId ? (organizationNameById.get(client.organizationId) ?? null) : null,
            }));
            organizations = allOrganizations.map((organization) => ({ id: organization.id, name: organization.name }));
        }

        return inertia.render('devis/create', {
            resources: resources.map((resource) => new ResourceTransformer(resource).toObject()),
            organizationName,
            canRequestForThirdParty: allowThirdParty,
            clients,
            organizations,
        });
    }

    public async store({ request, auth, response, session, i18n }: HttpContext) {
        const { items, ...recipientData } = await request.validateUsing(createQuoteValidator);
        const requestedItems = items.filter((item) => item.quantity > 0);

        if (!requestedItems.length) {
            return response.redirect().back();
        }

        try {
            const resources = await this.resourceRepository.all();
            const resourceById = new Map(resources.map((resource) => [resource.id, resource]));

            const lines = requestedItems
                .map((item) => {
                    const resource = resourceById.get(item.resourceId);
                    if (!resource) return null;

                    const unitPrice = Number(resource.sellPrice);
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

            const recipient = await resolveRecipient(auth, recipientData, { organizationRepository: this.organizationRepository, userRepository: this.userRepository });
            if (!recipient) {
                session.flash('error', i18n.t('messages.devis.create.error'));
                return response.redirect().back();
            }
            const { organizationId, organizationName, recipientUserId, requesterName } = recipient;

            const quote = await this.quoteRepository.createWithLines({
                userId: user.id,
                organizationId,
                organizationName,
                recipientUserId,
                requesterName,
                totalAmount,
                lines,
            });

            const pdfBuffer = await generateDocumentPdf({
                documentLabel: 'Devis',
                footerText: `Devis réalisé par la ${COMPANY_NAME}`,
                number: quote.number,
                organizationName,
                requesterName,
                createdAt: quote.createdAt,
                lines,
                totalAmount,
            });

            const filename = `cmc_devis_${quote.number}.pdf`;
            const path = await storeGeneratedFile(pdfBuffer, 'uploads/devis', filename);
            const file = await this.fileRepository.create({
                path,
                originalName: filename,
                mimeType: 'application/pdf',
                size: pdfBuffer.byteLength,
            });

            await this.quoteRepository.setFile(quote.id, file.id);

            session.flash('success', i18n.t('messages.devis.create.success'));
            return response.redirect().toRoute('devis.show', { id: quote.id });
        } catch (e) {
            logger.error({ err: e }, 'devis.store failed');
            session.flash('error', i18n.t('messages.devis.create.error'));
            return response.redirect().back();
        }
    }

    public async show({ inertia, params, auth, response, session, i18n }: HttpContext) {
        const quote = await this.quoteRepository.findOrFail(params.id);
        const viewer = auth.user!;

        const isRecipient = quote.recipientUserId === viewer.id;
        const isSameOrganization = quote.organizationId !== null && quote.organizationId === viewer.organizationId;
        if (!isStaffOrAdmin(viewer.role) && !isRecipient && !isSameOrganization) {
            session.flash('error', i18n.t('messages.devis.show.forbidden'));
            return response.redirect().toRoute('home');
        }

        return inertia.render('devis/show', {
            quote: {
                id: quote.id,
                number: quote.number,
                organizationName: quote.organizationName,
                requesterName: quote.requesterName,
                totalAmount: Number(quote.totalAmount),
                createdAt: quote.createdAt.toISO()!,
                fileUrl: quote.file?.path ?? null,
                lines: quote.lines.map((line) => ({
                    resourceName: line.resourceName,
                    resourceType: line.resourceType,
                    quantity: line.quantity,
                    unitPrice: Number(line.unitPrice),
                    totalPrice: Number(line.totalPrice),
                })),
            },
        });
    }
}
