import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    public async up(): Promise<void> {
        // Fixed weekly orders: delivered every week on the same day and time, mirrored as a shared weekly agenda event.
        this.schema.createTable('recurring_orders', (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.string('label', 100).notNullable();
            // ISO weekday (1 = Monday … 7 = Sunday) and "HH:mm" delivery time.
            table.smallint('weekday').notNullable();
            table.string('time', 5).notNullable();
            table.uuid('created_by_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
            table.uuid('agenda_event_id').nullable().references('id').inTable('agenda_events').onDelete('SET NULL');

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });

        this.schema.createTable('recurring_order_lines', (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('recurring_order_id').notNullable().references('id').inTable('recurring_orders').onDelete('CASCADE');
            table.uuid('resource_id').notNullable().references('id').inTable('resources').onDelete('CASCADE');
            table.integer('quantity').notNullable();
            table.decimal('unit_price', 10, 2).notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['recurring_order_id', 'resource_id']);
        });
    }

    public async down(): Promise<void> {
        this.schema.dropTable('recurring_order_lines');
        this.schema.dropTable('recurring_orders');
    }
}
