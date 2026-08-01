import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName = 'users';

    async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.timestamp('accepted_terms_at').nullable().after('accepted_terms_and_conditions');
        });
    }

    async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('accepted_terms_at');
        });
    }
}
