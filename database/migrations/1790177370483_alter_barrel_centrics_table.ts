import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'barrel_rentals';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('label', 100).notNullable().defaultTo('');
            table.renameColumn('weekly_rent', 'price');
        });

        this.schema.alterTable(this.tableName, (table) => {
            table.dropUnique(['user_id']);
            table.dropForeign(['user_id']);
        });

        this.schema.alterTable(this.tableName, (table) => {
            table.uuid('user_id').nullable().alter();
        });

        this.schema.alterTable(this.tableName, (table) => {
            table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign(['user_id']);
        });

        this.schema.alterTable(this.tableName, (table) => {
            table.uuid('user_id').notNullable().alter();
        });

        this.schema.alterTable(this.tableName, (table) => {
            table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.unique(['user_id']);
        });

        this.schema.alterTable(this.tableName, (table) => {
            table.renameColumn('price', 'weekly_rent');
            table.dropColumn('label');
        });
    }
}
