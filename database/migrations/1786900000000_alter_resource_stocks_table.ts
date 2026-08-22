import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'resource_stocks';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('quantity_purchased_soljund').notNullable().defaultTo(0);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('quantity_purchased_soljund');
        });
    }
}
