import { BaseSchema } from '@adonisjs/lucid/schema';
import UserRoleEnum from '#types/enum/user_role_enum';

export default class extends BaseSchema {
    protected tableName: string = 'users';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.string('username', 50).notNullable();
            table.string('email', 100).notNullable().unique();
            table.string('password').nullable();
            table.string('role').notNullable().defaultTo(UserRoleEnum.USER);
            table.boolean('enabled').defaultTo(false);
            table.boolean('accepted_terms_and_conditions').defaultTo(false);

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
