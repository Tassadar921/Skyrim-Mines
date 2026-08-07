import BaseRepository from '#repositories/base/base_repository';
import OrganizationResourcePrice from '#models/organization_resource_price';

export default class OrganizationResourcePriceRepository extends BaseRepository<typeof OrganizationResourcePrice> {
    constructor() {
        super(OrganizationResourcePrice);
    }

    public async findForOrganization(organizationId: string): Promise<OrganizationResourcePrice[]> {
        return this.findBy({ organizationId });
    }

    public async findMapForOrganization(organizationId: string): Promise<Map<string, number>> {
        const prices = await this.findForOrganization(organizationId);
        return new Map(prices.map((price) => [price.resourceId, Number(price.sellPrice)]));
    }

    public async allGroupedByOrganization(): Promise<Record<string, Record<string, number>>> {
        const prices = await this.all();
        const grouped: Record<string, Record<string, number>> = {};

        for (const price of prices) {
            grouped[price.organizationId] ??= {};
            grouped[price.organizationId][price.resourceId] = Number(price.sellPrice);
        }

        return grouped;
    }

    public async upsert(organizationId: string, resourceId: string, sellPrice: number): Promise<OrganizationResourcePrice> {
        const existing = await this.findOneBy({ organizationId, resourceId });
        if (existing) {
            existing.sellPrice = String(sellPrice);
            await existing.save();
            return existing;
        }

        return this.create({ organizationId, resourceId, sellPrice: String(sellPrice) });
    }

    public async delete(organizationId: string, resourceId: string): Promise<void> {
        const existing = await this.findOneBy({ organizationId, resourceId });
        if (existing) await existing.delete();
    }
}
