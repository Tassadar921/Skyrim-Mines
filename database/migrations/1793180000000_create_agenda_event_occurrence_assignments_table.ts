import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'agenda_event_occurrence_assignments';

    public async up(): Promise<void> {
        // A weekly "to assign" event is taken week by week: each row says who handles one occurrence (by its start day).
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('agenda_event_id').notNullable().references('id').inTable('agenda_events').onDelete('CASCADE');
            table.date('occurrence_date').notNullable();
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['agenda_event_id', 'occurrence_date']);
        });

        // Weekly series taken over as a whole (shared or moved to the taker's personal agenda) go back to "to assign":
        // they are now taken one occurrence at a time. The owner of a series moved to a personal agenda stays the taker.
        this.defer(async (db) => {
            await db.from('agenda_events').where('recurs_weekly', true).whereNotNull('assigned_to_id').update({ is_shared: true, needs_assignee: true, assigned_to_id: null });
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
