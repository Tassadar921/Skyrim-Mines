import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'delivery_lines';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.decimal('profit', 10, 2).nullable();
        });

        this.defer(async (db) => {
            await db.rawQuery(`
                UPDATE delivery_lines
                SET profit = (delivery_lines.unit_price - resources.buy_price) * delivery_lines.quantity
                FROM resources
                WHERE resources.id = delivery_lines.resource_id
            `);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('profit');
        });
    }
}
