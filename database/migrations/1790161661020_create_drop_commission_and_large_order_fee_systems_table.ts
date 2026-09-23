import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    public async up(): Promise<void> {
        this.schema.alterTable('deliveries', (table) => {
            table.dropColumn('commission_amount');
            table.dropColumn('large_order_fee_amount');
        });

        this.schema.alterTable('castellanies', (table) => {
            table.dropColumn('commission_amount');
            table.dropColumn('large_order_fee_rate');
        });

        this.schema.dropTable('large_order_settings');
    }

    public async down(): Promise<void> {
        this.schema.createTable('large_order_settings', (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));
            table.integer('threshold_quantity').notNullable().defaultTo(0);
            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });

        this.schema.alterTable('castellanies', (table) => {
            table.integer('commission_amount').notNullable().defaultTo(0);
            table.integer('large_order_fee_rate').notNullable().defaultTo(0);
        });

        this.schema.alterTable('deliveries', (table) => {
            table.decimal('commission_amount', 10, 2).notNullable().defaultTo(0);
            table.decimal('large_order_fee_amount', 10, 2).notNullable().defaultTo(0);
        });
    }
}
