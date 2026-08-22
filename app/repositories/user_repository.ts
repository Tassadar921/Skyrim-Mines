import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import User from '#models/user';
import LicenseSubscriber from '#models/license_subscriber';
import Quote from '#models/quote';
import Order from '#models/order';
import ResourceBuyback from '#models/resource_buyback';
import ResourceDeposit from '#models/resource_deposit';
import UserRoleEnum from '#types/enum/user_role_enum';
import type OrganizationRoleEnum from '#types/enum/organization_role_enum';

export default class UserRepository extends BaseRepository<typeof User> {
    constructor() {
        super(User);
    }

    public async paginate(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string; withoutAvatar?: boolean; role?: UserRoleEnum; enabled?: string }) {
        const { page, perPage, sort, dir, search, withoutAvatar, role, enabled } = params;
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
        if (role) {
            q.where('role', role);
        }
        if (enabled === 'true' || enabled === 'false') {
            q.where('enabled', enabled === 'true');
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

    public async incrementPickaxes(id: string, amount: number, trx?: TransactionClientContract): Promise<void> {
        const query = trx ? User.query({ client: trx }) : User.query();
        await query.where('id', id).increment('pickaxes', amount);
    }

    /**
     * Manual override of the amount owed to a user, restricted to staff/admins by the caller
     * (only they can ever legitimately be owed money by the company).
     */
    public async setBalance(id: string, balance: number): Promise<User> {
        const user = await User.findOrFail(id);
        user.balance = balance.toFixed(2);
        await user.save();
        return user;
    }

    /**
     * Current amount owed by the company to users of a given role, i.e. the running
     * balance right now — not attributable to a given week (see setBalance/incrementBalance).
     */
    public async sumBalanceByRole(role: UserRoleEnum): Promise<number> {
        const result = await User.query().where('role', role).sum('balance as total').first();
        return Number(result?.$extras.total ?? 0);
    }

    public async findMembersForOrganization(organizationId: string): Promise<User[]> {
        return User.query().where('organizationId', organizationId).orderBy('organizationRole', 'asc').orderBy('username', 'asc');
    }

    /**
     * Independent clients or auditors: not staff/admin/contractor of the company, and not already tied to an organization.
     */
    public async findEligibleIndependentClients(): Promise<User[]> {
        return User.query().whereIn('role', [UserRoleEnum.CLIENT, UserRoleEnum.AUDITOR]).whereNull('organizationId').orderBy('username', 'asc');
    }

    /**
     * All clients and auditors, whether independent or already tied to an organization. Used by staff/admins
     * to pick a third-party recipient when requesting a quote on someone else's behalf.
     */
    public async findAllClients(): Promise<User[]> {
        return User.query().whereIn('role', [UserRoleEnum.CLIENT, UserRoleEnum.AUDITOR]).orderBy('username', 'asc');
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

    /**
     * Contractors and clients not already enrolled in the license tracking roster.
     */
    public async findEligibleForLicenseSubscription(): Promise<User[]> {
        return User.query().whereIn('role', [UserRoleEnum.CONTRACTOR, UserRoleEnum.CLIENT]).whereNotIn('id', LicenseSubscriber.query().select('userId')).orderBy('username', 'asc');
    }

    /**
     * True if deleting this user would cascade-delete business records (quotes, orders, resource
     * buybacks/deposits, license subscription). Those relations are ON DELETE CASCADE, so deletion
     * must be blocked whenever any of them exist to avoid silently wiping accounting history.
     */
    public async hasLinkedRecords(id: string): Promise<boolean> {
        const [quote, order, buyback, deposit, licenseSubscriber] = await Promise.all([
            Quote.query().where('userId', id).first(),
            Order.query().where('userId', id).first(),
            ResourceBuyback.query().where('userId', id).first(),
            ResourceDeposit.query().where('userId', id).first(),
            LicenseSubscriber.query().where('userId', id).first(),
        ]);

        return Boolean(quote || order || buyback || deposit || licenseSubscriber);
    }

    public async delete(id: string): Promise<void> {
        const user = await User.findOrFail(id);
        await user.delete();
    }
}
