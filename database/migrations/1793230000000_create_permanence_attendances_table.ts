import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'permanence_attendances';

    public async up(): Promise<void> {
        // "I'll be there" for one permanence (a slot on a given day). Owners also get an event in their agenda.
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('permanence_slot_id').notNullable().references('id').inTable('permanence_slots').onDelete('CASCADE');
            table.date('date').notNullable();
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.uuid('agenda_event_id').nullable().references('id').inTable('agenda_events').onDelete('SET NULL');

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['permanence_slot_id', 'date', 'user_id']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
