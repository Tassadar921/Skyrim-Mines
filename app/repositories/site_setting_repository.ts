import BaseRepository from '#repositories/base/base_repository';
import SiteSetting from '#models/site_setting';
import type TaxSystemEnum from '#types/enum/tax_system_enum';

export default class SiteSettingRepository extends BaseRepository<typeof SiteSetting> {
    constructor() {
        super(SiteSetting);
    }

    public async get(): Promise<SiteSetting> {
        return SiteSetting.firstOrCreate({}, {});
    }

    public async getWithLogo(): Promise<SiteSetting> {
        const setting = await this.get();
        await setting.load('logoFile');
        return setting;
    }

    public async updateLogo(logoFileId: string | null): Promise<SiteSetting> {
        const setting = await this.get();
        setting.logoFileId = logoFileId;
        await setting.save();
        return setting;
    }

    public async updateSubtitle(subtitle: string | null): Promise<SiteSetting> {
        const setting = await this.get();
        setting.subtitle = subtitle;
        await setting.save();
        return setting;
    }

    public async updateTaxSystem(taxSystem: TaxSystemEnum): Promise<SiteSetting> {
        const setting = await this.get();
        setting.taxSystem = taxSystem;
        await setting.save();
        return setting;
    }
}
