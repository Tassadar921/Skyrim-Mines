import { UserBalanceChangeSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import User from '#models/user';

export default class UserBalanceChange extends UserBalanceChangeSchema {
    @belongsTo(() => User, { foreignKey: 'userId' })
    declare user: BelongsTo<typeof User>;

    @belongsTo(() => User, { foreignKey: 'changedByUserId' })
    declare changedBy: BelongsTo<typeof User>;
}
