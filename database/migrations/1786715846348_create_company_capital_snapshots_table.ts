import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'company_capital_snapshots';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.integer('week_number').notNullable();
            table.decimal('capital', 10, 2).notNullable();
            table.decimal('stock_value', 10, 2).notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['week_number']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
