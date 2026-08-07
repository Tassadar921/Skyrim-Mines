import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'organization_resource_prices';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('organization_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
            table.uuid('resource_id').notNullable().references('id').inTable('resources').onDelete('CASCADE');
            table.decimal('sell_price', 10, 2).notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['organization_id', 'resource_id']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
