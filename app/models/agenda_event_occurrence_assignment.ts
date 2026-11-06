import { AgendaEventOccurrenceAssignmentSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import User from '#models/user';

export default class AgendaEventOccurrenceAssignment extends AgendaEventOccurrenceAssignmentSchema {
    @belongsTo(() => User, { foreignKey: 'userId' })
    declare user: BelongsTo<typeof User>;
}
