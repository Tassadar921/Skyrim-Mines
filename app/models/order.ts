import { OrderSchema } from '#database/schema';
import { belongsTo, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import File from '#models/file';
import OrderLine from '#models/order_line';

export default class Order extends OrderSchema {
    @belongsTo(() => File, { foreignKey: 'fileId' })
    declare file: BelongsTo<typeof File>;

    @hasMany(() => OrderLine, { foreignKey: 'orderId' })
    declare lines: HasMany<typeof OrderLine>;
}
