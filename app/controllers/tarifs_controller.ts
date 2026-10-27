import { type HttpContext } from '@adonisjs/core/http';
import ResourceRepository from '#repositories/resource_repository';
import OrganizationResourcePriceRepository from '#repositories/organization_resource_price_repository';
import OrganizationRepository from '#repositories/organization_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import UserRoleEnum from '#types/enum/user_role_enum';

export default class TarifsController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly organizationResourcePriceRepository: OrganizationResourcePriceRepository = new OrganizationResourcePriceRepository(),
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
    ) {}

    public async index({ inertia, auth }: HttpContext) {
        const resources = await this.resourceRepository.all();
        const isClient = auth.user!.role === UserRoleEnum.CLIENT;

        const organization = isClient && auth.user!.organizationId ? await this.organizationRepository.findEnabled(auth.user!.organizationId) : null;
        const customPrices = organization ? await this.organizationResourcePriceRepository.findMapForOrganization(organization.id) : new Map<string, number>();

        return inertia.render('tarifs', {
            isClient,
            resources: resources.map((r) => {
                const base = new ResourceTransformer(r).toObject();
                return isClient ? { ...base, sellPrice: customPrices.get(r.id) ?? base.sellPrice } : base;
            }),
        });
    }
}
