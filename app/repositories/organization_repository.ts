import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import Organization from '#models/organization';
import User from '#models/user';
import OrganizationRoleEnum from '#types/enum/organization_role_enum';

export default class OrganizationRepository extends BaseRepository<typeof Organization> {
    constructor() {
        super(Organization);
    }

    public async all(): Promise<Organization[]> {
        return Organization.query().orderBy('name', 'asc');
    }

    public async allWithStats(): Promise<{ id: string; name: string; memberCount: number; ownerUsernames: string[] }[]> {
        const organizations = await this.all();
        const members = await User.query().whereNotNull('organizationId').select('id', 'username', 'organizationId', 'organizationRole');

        return organizations.map((organization) => {
            const organizationMembers = members.filter((member) => member.organizationId === organization.id);
            const owners = organizationMembers.filter((member) => member.organizationRole === OrganizationRoleEnum.OWNER);

            return {
                id: organization.id,
                name: organization.name,
                memberCount: organizationMembers.length,
                ownerUsernames: owners.map((owner) => owner.username),
            };
        });
    }

    public async findOrFail(id: string): Promise<Organization> {
        return Organization.findOrFail(id);
    }

    public async create(data: { name: string }): Promise<Organization> {
        return Organization.create({ name: data.name });
    }

    public async update(id: string, data: { name: string }): Promise<Organization> {
        const organization = await Organization.findOrFail(id);
        organization.name = data.name;
        await organization.save();
        return organization;
    }

    public async delete(id: string): Promise<void> {
        await db.transaction(async (trx) => {
            // organization_id is cleared automatically (ON DELETE SET NULL), but organization_role
            // is a plain column with no FK tied to it, so it must be cleared explicitly here to avoid
            // leaving members with a dangling role once the organization is gone.
            await User.query({ client: trx }).where('organizationId', id).update({ organizationRole: null });

            const organization = await Organization.query({ client: trx }).where('id', id).firstOrFail();
            await organization.useTransaction(trx).delete();
        });
    }
}
