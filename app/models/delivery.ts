import { DeliverySchema } from '#database/schema';
import { belongsTo, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import Order from '#models/order';
import DeliveryLine from '#models/delivery_line';
import Castellany from '#models/castellany';
import User from '#models/user';

export default class Delivery extends DeliverySchema {
    @belongsTo(() => Order, { foreignKey: 'orderId' })
    declare order: BelongsTo<typeof Order>;

    @hasMany(() => DeliveryLine, { foreignKey: 'deliveryId' })
    declare lines: HasMany<typeof DeliveryLine>;

    @belongsTo(() => Castellany, { foreignKey: 'castellanyId' })
    declare castellany: BelongsTo<typeof Castellany>;

    @belongsTo(() => User, { foreignKey: 'deliveredByUserId' })
    declare deliveredBy: BelongsTo<typeof User>;
}
