import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'users';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.uuid('avatar_id').nullable().references('id').inTable('files').onDelete('SET NULL');
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('avatar_id');
        });
    }
}
