import { SiteSettingSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import File from '#models/file';

export default class SiteSetting extends SiteSettingSchema {
    @belongsTo(() => File, { foreignKey: 'logoFileId' })
    declare logoFile: BelongsTo<typeof File>;
}
