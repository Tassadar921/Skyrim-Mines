import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'company_capital_snapshots';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.decimal('weekly_tax', 10, 2).notNullable().defaultTo(0);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('weekly_tax');
        });
    }
}
