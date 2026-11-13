import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    public async up(): Promise<void> {
        // Each permanence slot now has its own duration (30 min to 2 h), replacing the single global one,
        // whose current value (clamped to that range) is copied onto the existing slots.
        this.schema.alterTable('permanence_slots', (table) => {
            table.integer('duration_minutes').notNullable().defaultTo(60);
        });

        this.defer(async (db) => {
            const setting = await db.from('site_settings').select('permanence_duration_minutes').first();
            const duration = Math.min(120, Math.max(30, setting?.permanence_duration_minutes ?? 60));
            await db.from('permanence_slots').update({ duration_minutes: duration });
        });

        this.schema.alterTable('site_settings', (table) => {
            table.dropColumn('permanence_duration_minutes');
        });
    }

    public async down(): Promise<void> {
        this.schema.alterTable('site_settings', (table) => {
            table.integer('permanence_duration_minutes').notNullable().defaultTo(60);
        });
        this.schema.alterTable('permanence_slots', (table) => {
            table.dropColumn('duration_minutes');
        });
    }
}
