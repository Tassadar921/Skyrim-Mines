import BaseRepository from '#repositories/base/base_repository';
import CompanyCapitalSnapshot from '#models/company_capital_snapshot';

export default class CompanyCapitalSnapshotRepository extends BaseRepository<typeof CompanyCapitalSnapshot> {
    constructor() {
        super(CompanyCapitalSnapshot);
    }

    public async allByWeek(): Promise<Map<number, CompanyCapitalSnapshot>> {
        const snapshots = await this.all();

        return new Map(snapshots.map((snapshot) => [snapshot.weekNumber, snapshot]));
    }
}
