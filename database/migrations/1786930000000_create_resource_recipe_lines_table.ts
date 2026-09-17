import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    protected tableName: string = 'resource_recipe_lines';

    public async up(): Promise<void> {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('uuidv7()'));

            table.uuid('resource_id').notNullable().references('id').inTable('resources').onDelete('CASCADE');
            table.uuid('material_id').nullable().references('id').inTable('materials').onDelete('CASCADE');
            table.uuid('ingredient_resource_id').nullable().references('id').inTable('resources').onDelete('CASCADE');
            table.integer('quantity').notNullable();

            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();

            table.unique(['resource_id', 'material_id']);
            table.unique(['resource_id', 'ingredient_resource_id']);
        });

        this.schema.raw(`
            ALTER TABLE ${this.tableName}
            ADD CONSTRAINT resource_recipe_lines_exactly_one_ingredient CHECK (
                (material_id IS NOT NULL AND ingredient_resource_id IS NULL) OR
                (material_id IS NULL AND ingredient_resource_id IS NOT NULL)
            )
        `);
    }

    public async down(): Promise<void> {
        this.schema.dropTable(this.tableName);
    }
}
