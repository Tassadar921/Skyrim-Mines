import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import BarrelRentalPayment from '#models/barrel_rental_payment';

export default class BarrelRentalPaymentRepository extends BaseRepository<typeof BarrelRentalPayment> {
    constructor() {
        super(BarrelRentalPayment);
    }

    public async findForRental(rentalId: string): Promise<BarrelRentalPayment[]> {
        return BarrelRentalPayment.query().where('rentalId', rentalId).orderBy('weekNumber', 'desc');
    }

    public async getWeeklyTotals(): Promise<{ weekNumber: number; totalAmount: number; paymentCount: number }[]> {
        const rows = await db.from('barrel_rental_payments').select('week_number as weekNumber').sum('amount_paid as totalAmount').count('* as paymentCount').groupBy('week_number');

        return rows.map((row) => ({ weekNumber: row.weekNumber, totalAmount: Number(row.totalAmount), paymentCount: Number(row.paymentCount) }));
    }

    public async create(data: { rentalId: string; weekNumber: number; amountPaid: string }): Promise<BarrelRentalPayment> {
        return BarrelRentalPayment.create(data);
    }

    public async delete(id: string): Promise<void> {
        const payment = await BarrelRentalPayment.findOrFail(id);
        await payment.delete();
    }
}
