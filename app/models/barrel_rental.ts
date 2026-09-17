import { BarrelRentalSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import User from '#models/user';

export default class BarrelRental extends BarrelRentalSchema {
    @belongsTo(() => User, { foreignKey: 'userId' })
    declare user: BelongsTo<typeof User>;
}
