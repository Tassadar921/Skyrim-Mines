import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'deliveries';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean('stock_deducted').notNullable().defaultTo(false);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('stock_deducted');
        });
    }
}
