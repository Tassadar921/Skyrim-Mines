import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'resource_deposits';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('soljund_quantity').notNullable().defaultTo(0);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('soljund_quantity');
        });
    }
}
