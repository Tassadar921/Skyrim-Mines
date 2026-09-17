import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import BaseRepository from '#repositories/base/base_repository';
import ResourceRecipeLine from '#models/resource_recipe_line';

export type RecipeLineInput = { materialId: string | null; ingredientResourceId: string | null; quantity: number };

export default class ResourceRecipeLineRepository extends BaseRepository<typeof ResourceRecipeLine> {
    constructor() {
        super(ResourceRecipeLine);
    }

    public async findByResource(resourceId: string): Promise<ResourceRecipeLine[]> {
        return ResourceRecipeLine.query().where('resourceId', resourceId);
    }

    public async replaceLines(resourceId: string, lines: RecipeLineInput[], trx?: TransactionClientContract): Promise<void> {
        const run = async (client: TransactionClientContract) => {
            await ResourceRecipeLine.query({ client }).where('resourceId', resourceId).delete();
            for (const line of lines) {
                await ResourceRecipeLine.create({ resourceId, materialId: line.materialId, ingredientResourceId: line.ingredientResourceId, quantity: line.quantity }, { client });
            }
        };

        if (trx) {
            await run(trx);
        } else {
            await db.transaction(run);
        }
    }

    /**
     * Manufacturing cost per lingot (sum of quantity * ingredient buyPrice). A resource absent
     * from the returned map has no recipe defined yet.
     */
    public async sumCostByResourceIds(resourceIds: string[]): Promise<Map<string, number>> {
        if (!resourceIds.length) return new Map();

        const rows = await db
            .from('resource_recipe_lines')
            .leftJoin('materials', 'materials.id', 'resource_recipe_lines.material_id')
            .leftJoin('resources as ingredient_resources', 'ingredient_resources.id', 'resource_recipe_lines.ingredient_resource_id')
            .whereIn('resource_recipe_lines.resource_id', resourceIds)
            .select('resource_recipe_lines.resource_id as resourceId')
            .select(db.raw('SUM(resource_recipe_lines.quantity * COALESCE(materials.buy_price, ingredient_resources.buy_price)) as cost'))
            .groupBy('resource_recipe_lines.resource_id');

        return new Map(rows.map((row) => [row.resourceId, Number(row.cost)]));
    }

    public async computeCost(resourceId: string): Promise<number | null> {
        const costs = await this.sumCostByResourceIds([resourceId]);
        return costs.get(resourceId) ?? null;
    }
}
