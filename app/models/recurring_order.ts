import { RecurringOrderSchema } from '#database/schema';
import { belongsTo, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import User from '#models/user';
import RecurringOrderLine from '#models/recurring_order_line';

export default class RecurringOrder extends RecurringOrderSchema {
    @hasMany(() => RecurringOrderLine, { foreignKey: 'recurringOrderId' })
    declare lines: HasMany<typeof RecurringOrderLine>;

    @belongsTo(() => User, { foreignKey: 'createdByUserId' })
    declare createdBy: BelongsTo<typeof User>;
}
