import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'user_tokens';

    async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table): void => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('type', 50).notNullable();
            table.string('token_hash', 64).notNullable().unique();
            table.timestamp('expires_at').notNullable();
            table.timestamp('created_at').notNullable();
        });
    }

    async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
