import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    public async up(): Promise<void> {
        this.schema.dropTable('license_payments');
        this.schema.dropTable('license_subscribers');
        this.schema.dropTable('license_prices');
    }

    public async down(): Promise<void> {
        this.schema.createTable('license_prices', (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));
            table.decimal('citizen_price', 10, 2).notNullable();
            table.decimal('non_citizen_price', 10, 2).notNullable();
            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });

        this.schema.createTable('license_subscribers', (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
            table.unique(['user_id']);
        });

        this.schema.createTable('license_payments', (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));
            table.uuid('subscriber_id').notNullable().references('id').inTable('license_subscribers').onDelete('CASCADE');
            table.integer('week_number').notNullable();
            table.boolean('is_citizen').notNullable();
            table.decimal('amount_paid', 10, 2).notNullable();
            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
            table.unique(['subscriber_id', 'week_number']);
        });
    }
}
