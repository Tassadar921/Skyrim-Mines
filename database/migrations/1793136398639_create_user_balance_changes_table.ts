import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'user_balance_changes';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            // Usernames are snapshotted so the history stays readable after an account is deleted.
            table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
            table.string('username', 50).notNullable();
            table.uuid('changed_by_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
            table.string('changed_by_username', 50).notNullable();

            table.string('action', 20).notNullable();
            table.decimal('previous_balance', 10, 2).notNullable();
            table.decimal('new_balance', 10, 2).notNullable();
            table.integer('week_number').notNullable();

            // A rollback is logged as its own entry pointing at the change it reverts; the reverted change gets rolled_back_at set so it can't be reverted twice.
            table.uuid('rollback_of_id').nullable().references('id').inTable('user_balance_changes').onDelete('SET NULL');
            table.timestamp('rolled_back_at').nullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.index(['created_at']);
            table.index(['user_id']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
