import { BaseSchema } from '@adonisjs/lucid/schema';

const UNIQUE_OWNER_INDEX = 'users_single_owner_per_organization';

export default class extends BaseSchema {
    protected tableName: string = 'users';

    public async up(): Promise<void> {
        this.defer(async (db) => {
            await db.rawQuery(`DROP INDEX IF EXISTS ${UNIQUE_OWNER_INDEX}`);
        });
    }

    public async down(): Promise<void> {
        this.defer(async (db) => {
            await db.rawQuery(`CREATE UNIQUE INDEX ${UNIQUE_OWNER_INDEX} ON ${this.tableName} (organization_id) WHERE organization_role = 'owner'`);
        });
    }
}
