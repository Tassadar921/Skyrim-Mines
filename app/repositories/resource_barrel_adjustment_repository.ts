import BaseRepository from '#repositories/base/base_repository';
import ResourceBarrelAdjustment from '#models/resource_barrel_adjustment';

export default class ResourceBarrelAdjustmentRepository extends BaseRepository<typeof ResourceBarrelAdjustment> {
    constructor() {
        super(ResourceBarrelAdjustment);
    }

    public async sumByUserAndResource(): Promise<Map<string, number>> {
        const rows = await ResourceBarrelAdjustment.query().select('userId', 'resourceId').sum('delta as total').groupBy('userId', 'resourceId');

        return new Map(rows.map((row) => [`${row.userId}:${row.resourceId}`, Number(row.$extras.total)]));
    }

    public async sumForUserAndResource(userId: string, resourceId: string): Promise<number> {
        const result = await ResourceBarrelAdjustment.query().where('userId', userId).where('resourceId', resourceId).sum('delta as total').first();

        return Number(result?.$extras.total ?? 0);
    }
}
