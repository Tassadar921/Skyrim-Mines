import { AgendaEventSchema } from '#database/schema';
import { belongsTo, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import User from '#models/user';
import AgendaEventOccurrenceAssignment from '#models/agenda_event_occurrence_assignment';

export default class AgendaEvent extends AgendaEventSchema {
    @belongsTo(() => User, { foreignKey: 'ownerId' })
    declare owner: BelongsTo<typeof User>;

    @belongsTo(() => User, { foreignKey: 'assignedToId' })
    declare assignedTo: BelongsTo<typeof User>;

    /** Weekly "to assign" events only: who handles each occurrence. */
    @hasMany(() => AgendaEventOccurrenceAssignment, { foreignKey: 'agendaEventId' })
    declare occurrenceAssignments: HasMany<typeof AgendaEventOccurrenceAssignment>;
}
