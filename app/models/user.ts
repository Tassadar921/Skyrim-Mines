import { UserSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import File from '#models/file';

export default class User extends UserSchema {
    @belongsTo(() => File, { foreignKey: 'avatarId' })
    declare avatar: BelongsTo<typeof File>;
}
