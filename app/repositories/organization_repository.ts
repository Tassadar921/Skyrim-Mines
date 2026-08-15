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

    public async paginate(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string }): Promise<{
        data: { id: string; name: string; memberCount: number; ownerUsernames: string[] }[];
        total: number;
        currentPage: number;
        lastPage: number;
        perPage: number;
    }> {
        const { page, perPage, sort, dir, search } = params;
        const allowedSorts: Record<string, string> = {
            name: 'name',
        };
        const sortColumn = allowedSorts[sort] ?? 'name';

        const q = Organization.query().orderBy(sortColumn, dir);
        if (search) {
            q.whereILike('name', `%${search}%`);
        }
        const organizations = await q.paginate(page, perPage);
        const organizationIds = organizations.all().map((organization) => organization.id);

        const members = organizationIds.length ? await User.query().whereIn('organizationId', organizationIds).select('id', 'username', 'organizationId', 'organizationRole') : [];

        return {
            data: organizations.all().map((organization) => {
                const organizationMembers = members.filter((member) => member.organizationId === organization.id);
                const owners = organizationMembers.filter((member) => member.organizationRole === OrganizationRoleEnum.OWNER);

                return {
                    id: organization.id,
                    name: organization.name,
                    memberCount: organizationMembers.length,
                    ownerUsernames: owners.map((owner) => owner.username),
                };
            }),
            total: organizations.total,
            currentPage: organizations.currentPage,
            lastPage: organizations.lastPage,
            perPage: organizations.perPage,
        };
    }

    public async findOrFail(id: string): Promise<Organization> {
        return Organization.findOrFail(id);
    }

    public async create(data: { name: string; castellanyId?: string | null }): Promise<Organization> {
        return Organization.create({ name: data.name, castellanyId: data.castellanyId ?? null });
    }

    public async update(id: string, data: { name: string; castellanyId?: string | null }): Promise<Organization> {
        const organization = await Organization.findOrFail(id);
        organization.name = data.name;
        organization.castellanyId = data.castellanyId ?? null;
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
