import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import MaterialRepository from '#repositories/material_repository';
import MaterialTransformer from '#transformers/material_transformer';
import { createMaterialValidator, updateMaterialValidator, reorderMaterialsValidator, indexMaterialValidator } from '#validators/admin/materials';

export default class MaterialsController {
    constructor(private readonly materialRepository: MaterialRepository = new MaterialRepository()) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search } = await request.validateUsing(indexMaterialValidator);

        const currentDir = dir ?? 'asc';
        const currentPage = page ?? 1;

        const materials = await this.materialRepository.paginate({
            page: currentPage,
            perPage: 20,
            sort,
            dir: currentDir,
            search,
        });

        return inertia.render('admin/materials/index', {
            materials: materials.all().map((m) => new MaterialTransformer(m).toObject()),
            meta: {
                total: materials.total,
                currentPage: materials.currentPage,
                lastPage: materials.lastPage,
                perPage: materials.perPage,
            },
            filters: { search: search ?? '', sort: sort ?? '', dir: currentDir },
        });
    }

    public async create({ inertia }: HttpContext) {
        return inertia.render('admin/materials/create', {});
    }

    public async store({ request, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(createMaterialValidator);

        try {
            await this.materialRepository.create({
                name: data.name,
                buyPrice: String(data.buyPrice),
            });
            session.flash('success', i18n.t('messages.admin.materials.create.success'));
            return response.redirect().toRoute('admin.materials.index');
        } catch (e) {
            logger.error({ err: e }, 'materials.store failed');
            session.flash('error', i18n.t('messages.admin.materials.create.error'));
            return response.redirect().back();
        }
    }

    public async show({ inertia, params }: HttpContext) {
        const material = await this.materialRepository.findOrFail(params.id);

        return inertia.render('admin/materials/show', {
            material: new MaterialTransformer(material).toObject(),
        });
    }

    public async update({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(updateMaterialValidator);

        try {
            await this.materialRepository.update(params.id, {
                name: data.name,
                buyPrice: String(data.buyPrice),
            });
            session.flash('success', i18n.t('messages.admin.materials.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'materials.update failed');
            session.flash('error', i18n.t('messages.admin.materials.update.error'));
        }

        return response.redirect().back();
    }

    public async reorder({ request, response, session, i18n }: HttpContext) {
        const { items } = await request.validateUsing(reorderMaterialsValidator);

        try {
            await this.materialRepository.reorder(items);
        } catch (e) {
            logger.error({ err: e }, 'materials.reorder failed');
            session.flash('error', i18n.t('messages.admin.materials.update.error'));
        }

        return response.redirect().back();
    }

    public async destroy({ params, response, session, i18n }: HttpContext) {
        try {
            await this.materialRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.materials.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'materials.destroy failed');
            session.flash('error', i18n.t('messages.admin.materials.destroy.error'));
        }

        return response.redirect().toRoute('admin.materials.index');
    }
}
