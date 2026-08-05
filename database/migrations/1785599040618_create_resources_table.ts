import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'resources';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.string('name', 100).notNullable();
            table.string('type').notNullable();
            table.decimal('buy_price', 10, 2).notNullable();
            table.decimal('sell_price', 10, 2).notNullable();
            table.integer('order').notNullable().defaultTo(0);

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['name', 'type']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
