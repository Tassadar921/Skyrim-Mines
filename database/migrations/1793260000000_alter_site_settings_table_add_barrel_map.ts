import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'site_settings';

    public async up(): Promise<void> {
        // Barrel rentals: uploaded map of the mine with the numbered barrels, shown above the rentals table.
        this.schema.alterTable(this.tableName, (table) => {
            table.uuid('barrel_map_file_id').nullable().references('id').inTable('files').onDelete('SET NULL');
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign(['barrel_map_file_id']);
            table.dropColumn('barrel_map_file_id');
        });
    }
}
