import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'agenda_events';

    public async up(): Promise<void> {
        // Weekly recurrence: the event repeats every 7 days from its first occurrence, optionally until a given day (included).
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean('recurs_weekly').notNullable().defaultTo(false);
            table.date('recurrence_ends_on').nullable();
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('recurs_weekly');
            table.dropColumn('recurrence_ends_on');
        });
    }
}
