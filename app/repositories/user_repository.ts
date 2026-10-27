import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import { DateTime } from 'luxon';
import db from '@adonisjs/lucid/services/db';
import User from '#models/user';
import UserBalanceChange from '#models/user_balance_change';
import { getWeekNumber } from '#helpers/game_week_helper';
import BalanceChangeActionEnum from '#types/enum/balance_change_action_enum';
import BarrelRental from '#models/barrel_rental';
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
            lastActivity: 'last_activity',
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
        return User.query()
            .whereIn('role', [UserRoleEnum.ADMIN, UserRoleEnum.FOREMAN, UserRoleEnum.STAFF, UserRoleEnum.CONTRACTOR])
            .where('enabled', true)
            .preload('avatar')
            .orderBy('username', 'asc');
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

    /** Ids of the users who share the common part of a split buyback: every enabled miner and foreman. */
    public async findSharedBuybackPoolIds(trx?: TransactionClientContract): Promise<string[]> {
        const query = trx ? User.query({ client: trx }) : User.query();
        const users = await query.whereIn('role', [UserRoleEnum.STAFF, UserRoleEnum.FOREMAN]).where('enabled', true).orderBy('username', 'asc').select('id');
        return users.map((user) => user.id);
    }

    public async incrementBalance(id: string, amount: number, trx?: TransactionClientContract): Promise<void> {
        const query = trx ? User.query({ client: trx }) : User.query();
        await query.where('id', id).increment('balance', amount);
    }

    /**
     * Manual override of the amount owed to a user, restricted to staff/admins by the caller
     * (only they can ever legitimately be owed money by the company). Logs the change in the
     * balance history (skipped when the amount doesn't change).
     */
    public async setBalance(id: string, balance: number, change: { action: BalanceChangeActionEnum; changedBy: User }): Promise<User> {
        return db.transaction(async (trx) => {
            const user = await User.query({ client: trx }).where('id', id).forUpdate().firstOrFail();
            await this.applyLoggedBalance(user, balance, { ...change, rollbackOfId: null }, trx);
            return user;
        });
    }

    /**
     * Reverts a manual balance change by applying its opposite delta to the user's *current* balance
     * (so anything credited since — deliveries, other edits — is kept), and logs it as a rollback entry.
     * Each change can only be reverted once, and rollback entries themselves can't be reverted.
     */
    public async rollbackBalanceChange(changeId: string, changedBy: User): Promise<'ok' | 'notAllowed' | 'negative'> {
        return db.transaction(async (trx) => {
            const change = await UserBalanceChange.query({ client: trx }).where('id', changeId).forUpdate().firstOrFail();
            if (change.rolledBackAt || change.action === BalanceChangeActionEnum.ROLLBACK || !change.userId) {
                return 'notAllowed';
            }

            const user = await User.query({ client: trx }).where('id', change.userId).forUpdate().firstOrFail();
            const revertedBalance = Number(user.balance) - (Number(change.newBalance) - Number(change.previousBalance));
            if (revertedBalance < 0) {
                return 'negative';
            }

            await this.applyLoggedBalance(user, revertedBalance, { action: BalanceChangeActionEnum.ROLLBACK, changedBy, rollbackOfId: change.id }, trx);
            change.rolledBackAt = DateTime.now();
            await change.useTransaction(trx).save();

            return 'ok';
        });
    }

    private async applyLoggedBalance(
        user: User,
        balance: number,
        change: { action: BalanceChangeActionEnum; changedBy: User; rollbackOfId: string | null },
        trx: TransactionClientContract,
    ): Promise<void> {
        const previousBalance = user.balance;
        user.balance = balance.toFixed(2);
        await user.useTransaction(trx).save();

        if (Number(previousBalance) === Number(user.balance)) {
            return;
        }

        await UserBalanceChange.create(
            {
                userId: user.id,
                username: user.username,
                changedByUserId: change.changedBy.id,
                changedByUsername: change.changedBy.username,
                action: change.action,
                previousBalance,
                newBalance: user.balance,
                weekNumber: getWeekNumber(DateTime.now()),
                rollbackOfId: change.rollbackOfId,
            },
            { client: trx },
        );
    }

    /**
     * Current amount owed by the company to users of a given role, i.e. the running
     * balance right now — not attributable to a given week (see setBalance/incrementBalance).
     */
    public async sumBalanceByRole(role: UserRoleEnum): Promise<number> {
        const result = await User.query().where('role', role).sum('balance as total').first();
        return Number(result?.$extras.total ?? 0);
    }

    public async findByRole(role: UserRoleEnum): Promise<User[]> {
        return User.query().where('role', role).orderBy('username', 'asc');
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
     * to pick a third-party recipient when placing an order on someone else's behalf.
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
     * Every user not yet a tenant on another barrel — open to any role. Pass `excludeRentalId`
     * (the barrel being edited) so that barrel's own current tenant stays selectable.
     */
    public async findEligibleForBarrelRental(excludeRentalId?: string): Promise<User[]> {
        const tenantedQuery = BarrelRental.query().select('userId').whereNotNull('userId');
        if (excludeRentalId) tenantedQuery.whereNot('id', excludeRentalId);

        return User.query().whereNotIn('id', tenantedQuery).orderBy('username', 'asc');
    }

    /**
     * True if deleting this user would cascade-delete business records (orders, resource
     * buybacks/deposits). Those relations are ON DELETE CASCADE, so deletion must be blocked
     * whenever any of them exist to avoid silently wiping accounting history.
     */
    public async hasLinkedRecords(id: string): Promise<boolean> {
        const [order, buyback, deposit] = await Promise.all([
            Order.query().where('userId', id).first(),
            ResourceBuyback.query().where('userId', id).first(),
            ResourceDeposit.query().where('userId', id).first(),
        ]);

        return Boolean(order || buyback || deposit);
    }

    public async delete(id: string): Promise<void> {
        const user = await User.findOrFail(id);
        await user.delete();
    }
}
