import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import { DateTime } from 'luxon';
import User from '#models/user';
import UserTokenTypeEnum from '#types/enum/user_token_type_enum';

export default class UserToken extends BaseModel {
    static table = 'user_tokens';

    @column({ isPrimary: true })
    declare id: string;

    @column()
    declare userId: string;

    @column()
    declare type: UserTokenTypeEnum;

    @column()
    declare tokenHash: string;

    @column.dateTime()
    declare expiresAt: DateTime;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @belongsTo(() => User, { foreignKey: 'userId' })
    declare user: BelongsTo<typeof User>;
}
