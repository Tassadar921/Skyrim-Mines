import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'sales_estimates';

    public async up(): Promise<void> {
        // Sales forecast for a week, computed when the previous week is recorded on the dashboard:
        // per resource, the trimmed mean of the quantities sold over the last complete weeks.
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.integer('target_week_number').notNullable();
            table.integer('based_on_week_number').notNullable();
            table.integer('history_weeks').notNullable();
            table.uuid('resource_id').notNullable().references('id').inTable('resources').onDelete('CASCADE');
            table.string('resource_name').notNullable();
            table.string('resource_type').notNullable();
            table.decimal('estimated_sales', 12, 2).notNullable();
            // Ores only: direct sales plus the ore going into the ingots expected to sell (recipes).
            table.decimal('estimated_ore_need', 12, 2).nullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['target_week_number', 'resource_id']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
