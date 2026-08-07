import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'organizations';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.uuid('castellany_id').nullable().references('id').inTable('castellanies').onDelete('SET NULL');
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('castellany_id');
        });
    }
}
