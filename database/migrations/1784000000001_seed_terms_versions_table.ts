import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName = 'terms_versions';

    async up(): Promise<void> {
        // Epoch ensures all existing accepted_terms_at values are after it.
        // Users with null accepted_terms_at (never accepted) are immediately deactivated (grace_period_days = 0).
        await this.db.table(this.tableName).insert({
            invalidated_at: new Date('1970-01-01T00:00:00.000Z'),
            grace_period_days: 0,
            note: 'Initial CGU version',
            created_at: new Date(),
        });
    }

    async down(): Promise<void> {
        await this.db.from(this.tableName).where('note', 'Initial CGU version').delete();
    }
}
