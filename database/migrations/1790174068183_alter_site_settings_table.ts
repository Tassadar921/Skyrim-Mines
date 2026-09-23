import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'site_settings';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('tax_system', 20).notNullable().defaultTo('flat');
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('tax_system');
        });
    }
}
