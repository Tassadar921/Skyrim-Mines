import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName = 'terms_versions';

    async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));
            table.timestamp('invalidated_at').notNullable();
            table.integer('grace_period_days').notNullable().defaultTo(30);
            table.string('note', 500).nullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }

    async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
