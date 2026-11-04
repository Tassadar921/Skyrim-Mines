import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'agenda_events';

    public async up(): Promise<void> {
        // Shared events can be flagged "to assign" until an owner takes them over; assigned_to_id remembers who did.
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean('needs_assignee').notNullable().defaultTo(false);
            table.uuid('assigned_to_id').nullable().references('id').inTable('users').onDelete('SET NULL');
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign(['assigned_to_id']);
            table.dropColumn('assigned_to_id');
            table.dropColumn('needs_assignee');
        });
    }
}
