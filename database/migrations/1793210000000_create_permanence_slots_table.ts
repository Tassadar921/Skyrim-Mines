import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'permanence_slots';

    public async up(): Promise<void> {
        // Fixed weekly permanence times: a weekday (ISO, 1 = Monday … 7 = Sunday) and an "HH:mm" time.
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.smallint('weekday').notNullable();
            table.string('time', 5).notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['weekday', 'time']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
