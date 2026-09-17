import BaseRepository from '#repositories/base/base_repository';
import CompanyExpense from '#models/company_expense';

export default class CompanyExpenseRepository extends BaseRepository<typeof CompanyExpense> {
    constructor() {
        super(CompanyExpense);
    }

    public async paginate(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string; week?: number }) {
        const { page, perPage, sort, dir, search, week } = params;
        const allowedSorts: Record<string, string> = { title: 'title', amount: 'amount', week: 'weekNumber', createdAt: 'createdAt' };
        const sortColumn = allowedSorts[sort] ?? 'createdAt';

        const q = CompanyExpense.query();
        if (search) {
            q.whereILike('title', `%${search}%`);
        }
        if (week) {
            q.where('weekNumber', week);
        }
        q.orderBy(sortColumn, dir);

        return q.paginate(page, perPage);
    }

    public async getWeeklyTotals(): Promise<{ weekNumber: number; totalAmount: number }[]> {
        const rows = await CompanyExpense.query().select('weekNumber').sum('amount as totalAmount').groupBy('weekNumber');

        return rows.map((row) => ({ weekNumber: row.weekNumber, totalAmount: Number(row.$extras.totalAmount) }));
    }

    public async create(data: { weekNumber: number; title: string; label: string; amount: string }): Promise<CompanyExpense> {
        return CompanyExpense.create(data);
    }

    public async delete(id: string): Promise<void> {
        const expense = await CompanyExpense.findOrFail(id);
        await expense.delete();
    }
}
