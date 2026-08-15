import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import LicenseSubscriber from '#models/license_subscriber';
import type UserRoleEnum from '#types/enum/user_role_enum';

export type LicenseSubscriberRow = {
    id: string;
    username: string;
    role: string;
    lastPaidWeek: number | null;
    totalPaid: number;
    paymentCount: number;
    isUpToDate: boolean;
};

export default class LicenseSubscriberRepository extends BaseRepository<typeof LicenseSubscriber> {
    constructor() {
        super(LicenseSubscriber);
    }

    public async paginate(params: {
        page: number;
        perPage: number;
        sort: string;
        dir: 'asc' | 'desc';
        search?: string;
        role?: UserRoleEnum;
        status?: 'upToDate' | 'late';
        currentWeek: number;
    }): Promise<{ rows: LicenseSubscriberRow[]; total: number }> {
        const { page, perPage, dir, search, role, status, currentWeek } = params;

        const query = db
            .from('license_subscribers')
            .join('users', 'users.id', 'license_subscribers.user_id')
            .leftJoin('license_payments', 'license_payments.subscriber_id', 'license_subscribers.id')
            .select('license_subscribers.id as id', 'users.username as username', 'users.role as role')
            .max('license_payments.week_number as lastPaidWeek')
            .sum('license_payments.amount_paid as totalPaid')
            .count('license_payments.id as paymentCount')
            .groupBy('license_subscribers.id', 'users.username', 'users.role');

        if (role) {
            query.where('users.role', role);
        }

        const rawRows = await query;

        let rows: LicenseSubscriberRow[] = rawRows.map((row) => {
            const lastPaidWeek = row.lastPaidWeek === null ? null : Number(row.lastPaidWeek);
            return {
                id: row.id,
                username: row.username,
                role: row.role,
                lastPaidWeek,
                totalPaid: Number(row.totalPaid ?? 0),
                paymentCount: Number(row.paymentCount ?? 0),
                isUpToDate: lastPaidWeek !== null && lastPaidWeek >= currentWeek,
            };
        });

        if (search) {
            const needle = search.toLowerCase();
            rows = rows.filter((row) => row.username.toLowerCase().includes(needle));
        }

        if (status === 'upToDate') {
            rows = rows.filter((row) => row.isUpToDate);
        } else if (status === 'late') {
            rows = rows.filter((row) => !row.isUpToDate);
        }

        rows.sort((a, b) => {
            const comparison = a.username.toLowerCase().localeCompare(b.username.toLowerCase());
            return dir === 'asc' ? comparison : -comparison;
        });

        const total = rows.length;
        const start = (page - 1) * perPage;

        return { rows: rows.slice(start, start + perPage), total };
    }

    public async findOrFail(id: string): Promise<LicenseSubscriber> {
        return LicenseSubscriber.query().where('id', id).preload('user').firstOrFail();
    }

    public async create(data: { userId: string }): Promise<LicenseSubscriber> {
        return LicenseSubscriber.create({ userId: data.userId });
    }

    public async delete(id: string): Promise<void> {
        const subscriber = await LicenseSubscriber.findOrFail(id);
        await subscriber.delete();
    }
}
