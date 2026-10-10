import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'company_capital_snapshots';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean('donation_reduction').notNullable().defaultTo(false);
            table.boolean('sponsorship_reduction').notNullable().defaultTo(false);
            table.boolean('privilege_reduction').notNullable().defaultTo(false);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('donation_reduction');
            table.dropColumn('sponsorship_reduction');
            table.dropColumn('privilege_reduction');
        });
    }
}
