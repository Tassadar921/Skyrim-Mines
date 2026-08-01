import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName = 'users';

    async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.timestamp('last_login_at').nullable();
            table.timestamp('deletion_warning_sent_at').nullable();
        });
    }

    async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('last_login_at');
            table.dropColumn('deletion_warning_sent_at');
        });
    }
}
