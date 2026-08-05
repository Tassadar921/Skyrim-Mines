import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'deliveries';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
            table.uuid('delivered_by_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
            table.timestamp('delivered_at').notNullable();
            table.integer('delivered_week_number').notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
