import { BaseSchema } from '@adonisjs/lucid/schema';

const UNIQUE_OWNER_INDEX = 'users_single_owner_per_organization';

export default class extends BaseSchema {
    protected tableName: string = 'users';

    public async up(): Promise<void> {
        this.schema.alterTable(this.tableName, (table) => {
            table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('SET NULL');
            table.string('organization_role').nullable();
        });

        this.defer(async (db) => {
            await db.rawQuery(`CREATE UNIQUE INDEX ${UNIQUE_OWNER_INDEX} ON ${this.tableName} (organization_id) WHERE organization_role = 'owner'`);
        });
    }

    public async down(): Promise<void> {
        this.defer(async (db) => {
            await db.rawQuery(`DROP INDEX IF EXISTS ${UNIQUE_OWNER_INDEX}`);
        });

        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('organization_role');
            table.dropColumn('organization_id');
        });
    }
}
