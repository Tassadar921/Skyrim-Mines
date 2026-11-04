import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'agenda_events';

    public async up(): Promise<void> {
        // Owners' agenda: personal events are only visible to their creator, shared ones to every owner.
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('owner_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.boolean('is_shared').notNullable().defaultTo(false);
            table.string('title', 100).notNullable();
            table.text('description').nullable();
            table.boolean('all_day').notNullable().defaultTo(false);
            table.timestamp('starts_at').notNullable();
            table.timestamp('ends_at').notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.index(['starts_at', 'ends_at']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
