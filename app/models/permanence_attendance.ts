import { PermanenceAttendanceSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import User from '#models/user';

export default class PermanenceAttendance extends PermanenceAttendanceSchema {
    @belongsTo(() => User, { foreignKey: 'userId' })
    declare user: BelongsTo<typeof User>;
}
