import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    public async up(): Promise<void> {
        // Optional split of a resource's buy price: `miner_share` goes to the depositor, `shared_share` is split
        // equally between every other active miner/foreman. Both are null when the split is disabled.
        this.schema.alterTable('resources', (table) => {
            table.boolean('buyback_split_enabled').notNullable().defaultTo(false);
            table.decimal('miner_share', 10, 2).nullable();
            table.decimal('shared_share', 10, 2).nullable();
        });

        // Portion of `amount` that went to the shared pool instead of the depositor.
        this.schema.alterTable('resource_buybacks', (table) => {
            table.decimal('shared_amount', 10, 2).notNullable().defaultTo(0);
        });

        this.schema.createTable('resource_buyback_shares', (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('resource_buyback_id').notNullable().references('id').inTable('resource_buybacks').onDelete('CASCADE');
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.decimal('amount', 10, 2).notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.index(['resource_buyback_id']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable('resource_buyback_shares');
        this.schema.alterTable('resource_buybacks', (table) => {
            table.dropColumn('shared_amount');
        });
        this.schema.alterTable('resources', (table) => {
            table.dropColumn('buyback_split_enabled');
            table.dropColumn('miner_share');
            table.dropColumn('shared_share');
        });
    }
}
