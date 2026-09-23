import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import BarrelRental from '#models/barrel_rental';

export type BarrelRentalStatus = 'vacant' | 'upToDate' | 'late';

export type BarrelRentalRow = {
    id: string;
    label: string;
    price: number;
    userId: string | null;
    username: string | null;
    role: string | null;
    lastPaidWeek: number | null;
    totalPaid: number;
    paymentCount: number;
    status: BarrelRentalStatus;
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
        status?: BarrelRentalStatus;
        currentWeek: number;
    }): Promise<{ rows: BarrelRentalRow[]; total: number }> {
        const { page, perPage, dir, search, status, currentWeek } = params;

        const rawRows = await db
            .from('barrel_rentals')
            .leftJoin('users', 'users.id', 'barrel_rentals.user_id')
            .leftJoin('barrel_rental_payments', 'barrel_rental_payments.rental_id', 'barrel_rentals.id')
            .select('barrel_rentals.id as id', 'barrel_rentals.label as label', 'barrel_rentals.price as price', 'barrel_rentals.user_id as userId', 'users.username as username', 'users.role as role')
            .max('barrel_rental_payments.week_number as lastPaidWeek')
            .sum('barrel_rental_payments.amount_paid as totalPaid')
            .count('barrel_rental_payments.id as paymentCount')
            .groupBy('barrel_rentals.id', 'barrel_rentals.label', 'barrel_rentals.price', 'barrel_rentals.user_id', 'users.username', 'users.role');

        let rows: BarrelRentalRow[] = rawRows.map((row) => {
            const price = Number(row.price);
            const lastPaidWeek = row.lastPaidWeek === null ? null : Number(row.lastPaidWeek);
            const rowStatus: BarrelRentalStatus = !row.userId ? 'vacant' : price === 0 || (lastPaidWeek !== null && lastPaidWeek >= currentWeek) ? 'upToDate' : 'late';

            return {
                id: row.id,
                label: row.label,
                price,
                userId: row.userId,
                username: row.username,
                role: row.role,
                lastPaidWeek,
                totalPaid: Number(row.totalPaid ?? 0),
                paymentCount: Number(row.paymentCount ?? 0),
                status: rowStatus,
            };
        });

        if (search) {
            const needle = search.toLowerCase();
            rows = rows.filter((row) => row.label.toLowerCase().includes(needle) || (row.username?.toLowerCase().includes(needle) ?? false));
        }

        if (status) {
            rows = rows.filter((row) => row.status === status);
        }

        rows.sort((a, b) => {
            const comparison = a.label.toLowerCase().localeCompare(b.label.toLowerCase());
            return dir === 'asc' ? comparison : -comparison;
        });

        const total = rows.length;
        const start = (page - 1) * perPage;

        return { rows: rows.slice(start, start + perPage), total };
    }

    public async findOrFail(id: string): Promise<BarrelRental> {
        return BarrelRental.query().where('id', id).preload('user').firstOrFail();
    }

    public async create(data: { label: string; price: string; userId: string | null }): Promise<BarrelRental> {
        return BarrelRental.create(data);
    }

    public async update(id: string, data: { label: string; price: string; userId: string | null }): Promise<BarrelRental> {
        const rental = await BarrelRental.findOrFail(id);
        rental.label = data.label;
        rental.price = data.price;
        rental.userId = data.userId;
        await rental.save();
        return rental;
    }

    public async delete(id: string): Promise<void> {
        const rental = await BarrelRental.findOrFail(id);
        await rental.delete();
    }
}
