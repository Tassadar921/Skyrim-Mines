import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'castellanies';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('large_order_fee_rate').notNullable().defaultTo(0);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('large_order_fee_rate');
        });
    }
}
