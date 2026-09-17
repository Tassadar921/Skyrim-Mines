import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import ResourceRepository from '#repositories/resource_repository';
import MaterialRepository from '#repositories/material_repository';
import ResourceRecipeLineRepository from '#repositories/resource_recipe_line_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import MaterialTransformer from '#transformers/material_transformer';
import ResourceTypeEnum from '#types/enum/resource_type_enum';
import { updateResourceRecipeValidator } from '#validators/admin/resource_recipes';

export default class ResourceRecipesController {
    constructor(
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly materialRepository: MaterialRepository = new MaterialRepository(),
        private readonly resourceRecipeLineRepository: ResourceRecipeLineRepository = new ResourceRecipeLineRepository(),
    ) {}

    public async edit({ inertia, params }: HttpContext) {
        const resource = await this.resourceRepository.findOrFail(params.id);

        const [materials, allResources, recipeLines] = await Promise.all([this.materialRepository.all(), this.resourceRepository.all(), this.resourceRecipeLineRepository.findByResource(params.id)]);

        const materialQuantityById = new Map(recipeLines.filter((line) => line.materialId).map((line) => [line.materialId as string, line.quantity]));
        const resourceQuantityById = new Map(recipeLines.filter((line) => line.ingredientResourceId).map((line) => [line.ingredientResourceId as string, line.quantity]));

        return inertia.render('admin/resources/recipe', {
            resource: new ResourceTransformer(resource).toObject(),
            materials: materials.map((material) => ({ ...new MaterialTransformer(material).toObject(), quantity: materialQuantityById.get(material.id) ?? 0 })),
            ingredientResources: allResources
                .filter((r) => r.type === ResourceTypeEnum.MINERAI)
                .map((r) => ({ ...new ResourceTransformer(r).toObject(), quantity: resourceQuantityById.get(r.id) ?? 0 })),
        });
    }

    public async update({ request, params, response, session, i18n }: HttpContext) {
        const { materials, resources } = await request.validateUsing(updateResourceRecipeValidator);

        try {
            const lines = [
                ...materials.filter((m) => m.quantity > 0).map((m) => ({ materialId: m.materialId, ingredientResourceId: null, quantity: m.quantity })),
                ...resources.filter((r) => r.quantity > 0).map((r) => ({ materialId: null, ingredientResourceId: r.resourceId, quantity: r.quantity })),
            ];
            await this.resourceRecipeLineRepository.replaceLines(params.id, lines);
            session.flash('success', i18n.t('messages.admin.resources.recipe.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'resourceRecipes.update failed');
            session.flash('error', i18n.t('messages.admin.resources.recipe.update.error'));
        }

        return response.redirect().back();
    }
}
