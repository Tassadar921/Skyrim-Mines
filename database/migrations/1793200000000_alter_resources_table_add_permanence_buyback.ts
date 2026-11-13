import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'resources';

    public async up(): Promise<void> {
        // Permanences setting: whether this ore is bought back during permanences.
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean('permanence_buyback').notNullable().defaultTo(false);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('permanence_buyback');
        });
    }
}
