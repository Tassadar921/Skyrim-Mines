import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'order_lines';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
            table.uuid('resource_id').nullable().references('id').inTable('resources').onDelete('SET NULL');
            table.string('resource_name', 100).notNullable();
            table.string('resource_type', 20).notNullable();
            table.integer('quantity').notNullable();
            table.decimal('unit_price', 10, 2).notNullable();
            table.decimal('total_price', 10, 2).notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
