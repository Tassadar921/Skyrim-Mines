import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'deliveries';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.uuid('castellany_id').nullable().references('id').inTable('castellanies').onDelete('SET NULL');
            table.decimal('commission_amount', 10, 2).notNullable().defaultTo(0);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('castellany_id');
            table.dropColumn('commission_amount');
        });
    }
}
