import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'site_settings';

    public async up(): Promise<void> {
        // Permanences setting: how long each permanence lasts, from its slot time.
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('permanence_duration_minutes').notNullable().defaultTo(60);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('permanence_duration_minutes');
        });
    }
}
