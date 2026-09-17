import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'barrel_rentals';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.decimal('weekly_rent', 10, 2).notNullable().defaultTo(0);

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['user_id']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
