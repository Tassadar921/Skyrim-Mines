import BaseRepository from '#repositories/base/base_repository';
import LargeOrderSetting from '#models/large_order_setting';

export default class LargeOrderSettingRepository extends BaseRepository<typeof LargeOrderSetting> {
    constructor() {
        super(LargeOrderSetting);
    }

    public async get(): Promise<LargeOrderSetting> {
        return LargeOrderSetting.firstOrCreate({}, { thresholdQuantity: 0 });
    }

    public async update(thresholdQuantity: number): Promise<LargeOrderSetting> {
        const setting = await this.get();
        setting.thresholdQuantity = thresholdQuantity;
        await setting.save();
        return setting;
    }
}
