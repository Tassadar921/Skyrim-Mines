import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'orders';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('week_number').nullable();
        });

        this.defer(async (db) => {
            await db.rawQuery(`UPDATE ${this.tableName} SET week_number = FLOOR((((created_at AT TIME ZONE 'UTC')::date - DATE '2026-07-26')) / 7) + 1`);
        });

        this.schema.alterTable(this.tableName, (table) => {
            table.integer('week_number').notNullable().alter();
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('week_number');
        });
    }
}
