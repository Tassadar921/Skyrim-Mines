import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'organizations';

    public async up(): Promise<void> {
        // A disabled organization only remains visible in the back-office organizations table.
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean('enabled').notNullable().defaultTo(true);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('enabled');
        });
    }
}
