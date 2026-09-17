import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import BarrelRental from '#models/barrel_rental';

export type BarrelRentalRow = {
    id: string;
    username: string;
    role: string;
    weeklyRent: number;
    lastPaidWeek: number | null;
    totalPaid: number;
    paymentCount: number;
    isUpToDate: boolean;
};

export default class BarrelRentalRepository extends BaseRepository<typeof BarrelRental> {
    constructor() {
        super(BarrelRental);
    }

    public async paginate(params: {
        page: number;
        perPage: number;
        sort: string;
        dir: 'asc' | 'desc';
        search?: string;
        status?: 'upToDate' | 'late';
        currentWeek: number;
    }): Promise<{ rows: BarrelRentalRow[]; total: number }> {
        const { page, perPage, dir, search, status, currentWeek } = params;

        const rawRows = await db
            .from('barrel_rentals')
            .join('users', 'users.id', 'barrel_rentals.user_id')
            .leftJoin('barrel_rental_payments', 'barrel_rental_payments.rental_id', 'barrel_rentals.id')
            .select('barrel_rentals.id as id', 'users.username as username', 'users.role as role', 'barrel_rentals.weekly_rent as weeklyRent')
            .max('barrel_rental_payments.week_number as lastPaidWeek')
            .sum('barrel_rental_payments.amount_paid as totalPaid')
            .count('barrel_rental_payments.id as paymentCount')
            .groupBy('barrel_rentals.id', 'users.username', 'users.role', 'barrel_rentals.weekly_rent');

        let rows: BarrelRentalRow[] = rawRows.map((row) => {
            const weeklyRent = Number(row.weeklyRent);
            const lastPaidWeek = row.lastPaidWeek === null ? null : Number(row.lastPaidWeek);
            return {
                id: row.id,
                username: row.username,
                role: row.role,
                weeklyRent,
                lastPaidWeek,
                totalPaid: Number(row.totalPaid ?? 0),
                paymentCount: Number(row.paymentCount ?? 0),
                isUpToDate: weeklyRent === 0 || (lastPaidWeek !== null && lastPaidWeek >= currentWeek),
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

    public async findOrFail(id: string): Promise<BarrelRental> {
        return BarrelRental.query().where('id', id).preload('user').firstOrFail();
    }

    public async create(data: { userId: string; weeklyRent: string }): Promise<BarrelRental> {
        return BarrelRental.create(data);
    }

    public async updateRent(id: string, weeklyRent: string): Promise<BarrelRental> {
        const rental = await BarrelRental.findOrFail(id);
        rental.weeklyRent = weeklyRent;
        await rental.save();
        return rental;
    }

    public async delete(id: string): Promise<void> {
        const rental = await BarrelRental.findOrFail(id);
        await rental.delete();
    }
}
