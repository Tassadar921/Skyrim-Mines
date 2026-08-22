import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'resource_stocks';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('quantity_barrel_soljund').notNullable().defaultTo(0);
        });

        this.defer(async (db) => {
            await db.rawQuery(`
                WITH net AS (
                    SELECT resource_id, SUM(soljund) AS total
                    FROM (
                        SELECT resource_id, soljund_quantity AS soljund FROM resource_deposits
                        UNION ALL
                        SELECT resource_id, -soljund_quantity AS soljund FROM resource_buybacks
                    ) x
                    GROUP BY resource_id
                )
                INSERT INTO resource_stocks (id, resource_id, quantity_purchased, quantity_purchased_soljund, quantity_barrel_soljund, created_at, updated_at)
                SELECT uuidv7(), net.resource_id, 0, 0, net.total, now(), now()
                FROM net
                ON CONFLICT (resource_id) DO UPDATE SET quantity_barrel_soljund = EXCLUDED.quantity_barrel_soljund
            `);
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('quantity_barrel_soljund');
        });
    }
}
