import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'files';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.string('path', 255).notNullable();
            table.string('original_name', 255).notNullable();
            table.string('mime_type', 100).notNullable();
            table.integer('size').notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
