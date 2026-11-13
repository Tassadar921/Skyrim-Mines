import { RecurringOrderLineSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Resource from '#models/resource';

export default class RecurringOrderLine extends RecurringOrderLineSchema {
    @belongsTo(() => Resource, { foreignKey: 'resourceId' })
    declare resource: BelongsTo<typeof Resource>;
}
