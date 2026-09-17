import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    public async up(): Promise<void> {
        this.schema.alterTable('resource_deposits', (table) => {
            table.dropColumn('soljund_quantity');
        });

        this.schema.alterTable('resource_buybacks', (table) => {
            table.dropColumn('soljund_quantity');
        });

        this.schema.alterTable('resource_stocks', (table) => {
            table.dropColumn('quantity_purchased_soljund');
            table.dropColumn('quantity_barrel_soljund');
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable('resource_deposits', (table) => {
            table.integer('soljund_quantity').notNullable().defaultTo(0);
        });

        this.schema.alterTable('resource_buybacks', (table) => {
            table.integer('soljund_quantity').notNullable().defaultTo(0);
        });

        this.schema.alterTable('resource_stocks', (table) => {
            table.integer('quantity_purchased_soljund').notNullable().defaultTo(0);
            table.integer('quantity_barrel_soljund').notNullable().defaultTo(0);
        });
    }
}
