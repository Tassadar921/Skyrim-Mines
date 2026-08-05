import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import User from '#models/user';
import UserRoleEnum from '#types/enum/user_role_enum';
import type OrganizationRoleEnum from '#types/enum/organization_role_enum';

export default class UserRepository extends BaseRepository<typeof User> {
    constructor() {
        super(User);
    }

    public async paginate(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string; withoutAvatar?: boolean }) {
        const { page, perPage, sort, dir, search, withoutAvatar } = params;
        const allowedSorts: Record<string, string> = {
            username: 'username',
            createdAt: 'created_at',
        };
        const sortColumn = allowedSorts[sort] ?? 'created_at';

        const q = User.query().preload('avatar').orderBy(sortColumn, dir);
        if (search) {
            q.whereILike('username', `%${search}%`);
        }
        if (withoutAvatar) {
            q.whereNull('avatarId');
        }
        return q.paginate(page, perPage);
    }

    public async findOrFail(id: string): Promise<User> {
        return User.findOrFail(id);
    }

    public async findWithAvatar(id: string): Promise<User> {
        return User.query().where('id', id).preload('avatar').firstOrFail();
    }

    public async setAvatar(id: string, avatarId: string | null): Promise<void> {
        await User.query().where('id', id).update({ avatarId });
    }

    public async findByDiscordId(discordId: string): Promise<User | null> {
        return User.findBy('discordId', discordId);
    }

    /**
     * Company staff shown on the public "Organigramme" page: admins, staff and contractors
     * (owners, employees and extras). Auditors and clients are not part of the org chart.
     */
    public async findForOrgChart(): Promise<User[]> {
        return User.query().whereIn('role', [UserRoleEnum.ADMIN, UserRoleEnum.STAFF, UserRoleEnum.CONTRACTOR]).where('enabled', true).preload('avatar').orderBy('username', 'asc');
    }

    public async create(data: { discordId: string; username: string; role: UserRoleEnum; organizationId?: string | null; organizationRole?: OrganizationRoleEnum | null }): Promise<User> {
        return User.create({
            discordId: data.discordId,
            username: data.username,
            role: data.role,
            enabled: true,
            organizationId: data.organizationId ?? null,
            organizationRole: data.organizationRole ?? null,
        });
    }

    public async update(id: string, data: { username: string; role: UserRoleEnum; enabled: boolean }): Promise<User> {
        const user = await User.findOrFail(id);
        user.username = data.username;
        user.role = data.role;
        user.enabled = data.enabled;
        await user.save();
        return user;
    }

    public async incrementBalance(id: string, amount: number, trx?: TransactionClientContract): Promise<void> {
        const query = trx ? User.query({ client: trx }) : User.query();
        await query.where('id', id).increment('balance', amount);
    }

    public async findMembersForOrganization(organizationId: string): Promise<User[]> {
        return User.query().where('organizationId', organizationId).orderBy('organizationRole', 'asc').orderBy('username', 'asc');
    }

    /**
     * Independent clients: not staff/admin/auditor/contractor of the company, and not already tied to an organization.
     */
    public async findEligibleIndependentClients(): Promise<User[]> {
        return User.query().where('role', UserRoleEnum.CLIENT).whereNull('organizationId').orderBy('username', 'asc');
    }

    /**
     * All clients, whether independent or already tied to an organization. Used by staff/admins
     * to pick a third-party recipient when requesting a quote on someone else's behalf.
     */
    public async findAllClients(): Promise<User[]> {
        return User.query().where('role', UserRoleEnum.CLIENT).orderBy('username', 'asc');
    }

    public async attachToOrganization(id: string, organizationId: string, organizationRole: OrganizationRoleEnum): Promise<void> {
        await User.query().where('id', id).update({ organizationId, organizationRole });
    }

    public async removeFromOrganization(id: string): Promise<void> {
        const user = await User.findOrFail(id);
        user.organizationId = null;
        user.organizationRole = null;
        await user.save();
    }

    public async updateOrganizationRole(id: string, organizationRole: OrganizationRoleEnum): Promise<void> {
        const user = await User.findOrFail(id);
        user.organizationRole = organizationRole;
        await user.save();
    }
}
