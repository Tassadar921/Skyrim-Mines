import { AgendaEventSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import User from '#models/user';

export default class AgendaEvent extends AgendaEventSchema {
    @belongsTo(() => User, { foreignKey: 'ownerId' })
    declare owner: BelongsTo<typeof User>;

    @belongsTo(() => User, { foreignKey: 'assignedToId' })
    declare assignedTo: BelongsTo<typeof User>;
}
