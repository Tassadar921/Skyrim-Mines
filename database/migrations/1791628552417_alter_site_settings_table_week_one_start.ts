import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'site_settings';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.date('week_one_start').nullable();
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('week_one_start');
        });
    }
}
