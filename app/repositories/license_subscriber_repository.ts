import BaseRepository from '#repositories/base/base_repository';
import LicenseSubscriber from '#models/license_subscriber';

export default class LicenseSubscriberRepository extends BaseRepository<typeof LicenseSubscriber> {
    constructor() {
        super(LicenseSubscriber);
    }

    public async all(): Promise<LicenseSubscriber[]> {
        return LicenseSubscriber.query().preload('user').orderBy('createdAt', 'asc');
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
