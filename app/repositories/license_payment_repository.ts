import db from '@adonisjs/lucid/services/db';
import BaseRepository from '#repositories/base/base_repository';
import LicensePayment from '#models/license_payment';

export default class LicensePaymentRepository extends BaseRepository<typeof LicensePayment> {
    constructor() {
        super(LicensePayment);
    }

    public async findForSubscriber(subscriberId: string): Promise<LicensePayment[]> {
        return LicensePayment.query().where('subscriberId', subscriberId).orderBy('weekNumber', 'desc');
    }

    public async summaryBySubscriber(): Promise<Map<string, { lastPaidWeek: number; totalPaid: number; paymentCount: number }>> {
        const rows = await db
            .from('license_payments')
            .select('subscriber_id as subscriberId')
            .max('week_number as lastPaidWeek')
            .sum('amount_paid as totalPaid')
            .count('* as paymentCount')
            .groupBy('subscriber_id');

        return new Map(rows.map((row) => [row.subscriberId, { lastPaidWeek: Number(row.lastPaidWeek), totalPaid: Number(row.totalPaid), paymentCount: Number(row.paymentCount) }]));
    }

    public async getWeeklyTotals(): Promise<{ weekNumber: number; totalAmount: number; paymentCount: number }[]> {
        const rows = await db.from('license_payments').select('week_number as weekNumber').sum('amount_paid as totalAmount').count('* as paymentCount').groupBy('week_number');

        return rows.map((row) => ({ weekNumber: row.weekNumber, totalAmount: Number(row.totalAmount), paymentCount: Number(row.paymentCount) }));
    }

    public async create(data: { subscriberId: string; weekNumber: number; isCitizen: boolean; amountPaid: string }): Promise<LicensePayment> {
        return LicensePayment.create(data);
    }

    public async delete(id: string): Promise<void> {
        const payment = await LicensePayment.findOrFail(id);
        await payment.delete();
    }
}
