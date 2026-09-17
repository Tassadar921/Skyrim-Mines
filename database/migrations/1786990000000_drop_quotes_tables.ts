import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    public async up(): Promise<void> {
        this.schema.dropTable('quote_lines');
        this.schema.dropTable('quotes');
    }

    public async down(): Promise<void> {
        this.schema.createTable('quotes', (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));
            table.specificType('number', 'serial').notNullable();
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('SET NULL');
            table.string('organization_name', 100).nullable();
            table.uuid('recipient_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
            table.string('requester_name', 50).notNullable();
            table.decimal('total_amount', 10, 2).notNullable();
            table.uuid('file_id').nullable().references('id').inTable('files').onDelete('SET NULL');
            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
            table.unique(['number']);
        });

        this.schema.createTable('quote_lines', (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));
            table.uuid('quote_id').notNullable().references('id').inTable('quotes').onDelete('CASCADE');
            table.uuid('resource_id').nullable().references('id').inTable('resources').onDelete('SET NULL');
            table.string('resource_name', 100).notNullable();
            table.string('resource_type', 20).notNullable();
            table.integer('quantity').notNullable();
            table.decimal('unit_price', 10, 2).notNullable();
            table.decimal('total_price', 10, 2).notNullable();
            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }
}
