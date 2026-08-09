import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'castellanies';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.renameColumn('commission_rate', 'commission_amount');
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.renameColumn('commission_amount', 'commission_rate');
        });
    }
}
