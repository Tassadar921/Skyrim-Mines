import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'company_capital_snapshots';

    public async up(): Promise<void> {
        // Highest tax bracket reached by the week's profit under the marginal brackets system (1-based position + its rate),
        // frozen alongside the tax so later bracket edits don't rewrite past weeks. Null for other tax systems or no profit.
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('top_bracket_index').nullable();
            table.integer('top_bracket_rate').nullable();
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('top_bracket_index');
            table.dropColumn('top_bracket_rate');
        });
    }
}
