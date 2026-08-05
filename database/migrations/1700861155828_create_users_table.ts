import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'users';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.string('discord_id', 32).notNullable().unique();
            table.string('username', 50).notNullable();
            table.string('role').notNullable();
            table.boolean('enabled').notNullable().defaultTo(true);
            table.decimal('balance', 10, 2).notNullable().defaultTo(0);
            table.timestamp('last_login_at').nullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
