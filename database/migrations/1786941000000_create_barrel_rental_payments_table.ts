import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'barrel_rental_payments';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('rental_id').notNullable().references('id').inTable('barrel_rentals').onDelete('CASCADE');
            table.integer('week_number').notNullable();
            table.decimal('amount_paid', 10, 2).notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['rental_id', 'week_number']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
