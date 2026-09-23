import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'site_settings';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('subtitle', 255).nullable();
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('subtitle');
        });
    }
}
