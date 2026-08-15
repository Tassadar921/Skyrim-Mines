import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import ResourceRepository from '#repositories/resource_repository';
import ResourceTransformer from '#transformers/resource_transformer';
import ResourceTypeEnum from '#types/enum/resource_type_enum';
import { createResourceValidator, updateResourceValidator, reorderResourcesValidator, indexResourceValidator } from '#validators/admin/resources';

export default class ResourcesController {
    constructor(private readonly resourceRepository: ResourceRepository = new ResourceRepository()) {}

    public async index({ inertia, request }: HttpContext) {
        const { mineraiPage, lingotPage, sort, dir, search } = await request.validateUsing(indexResourceValidator);

        const currentDir = dir ?? 'asc';
        const mineraiCurrentPage = mineraiPage ?? 1;
        const lingotCurrentPage = lingotPage ?? 1;

        const [minerais, lingots] = await Promise.all([
            this.resourceRepository.paginate({ type: ResourceTypeEnum.MINERAI, page: mineraiCurrentPage, perPage: 20, sort, dir: currentDir, search }),
            this.resourceRepository.paginate({ type: ResourceTypeEnum.LINGOT, page: lingotCurrentPage, perPage: 20, sort, dir: currentDir, search }),
        ]);

        return inertia.render('admin/resources/index', {
            minerais: {
                resources: minerais.all().map((r) => new ResourceTransformer(r).toObject()),
                meta: { total: minerais.total, currentPage: minerais.currentPage, lastPage: minerais.lastPage, perPage: minerais.perPage },
            },
            lingots: {
                resources: lingots.all().map((r) => new ResourceTransformer(r).toObject()),
                meta: { total: lingots.total, currentPage: lingots.currentPage, lastPage: lingots.lastPage, perPage: lingots.perPage },
            },
            filters: { search: search ?? '', sort: sort ?? '', dir: currentDir },
        });
    }

    public async create({ inertia }: HttpContext) {
        return inertia.render('admin/resources/create', {});
    }

    public async store({ request, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(createResourceValidator);

        try {
            await this.resourceRepository.create({
                name: data.name,
                type: data.type,
                buyPrice: String(data.buyPrice),
                sellPrice: String(data.sellPrice),
            });
            session.flash('success', i18n.t('messages.admin.resources.create.success'));
            return response.redirect().toRoute('admin.resources.index');
        } catch (e) {
            logger.error({ err: e }, 'resources.store failed');
            session.flash('error', i18n.t('messages.admin.resources.create.error'));
            return response.redirect().back();
        }
    }

    public async show({ inertia, params }: HttpContext) {
        const resource = await this.resourceRepository.findOrFail(params.id);

        return inertia.render('admin/resources/show', {
            resource: new ResourceTransformer(resource).toObject(),
        });
    }

    public async update({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(updateResourceValidator);

        try {
            await this.resourceRepository.update(params.id, {
                name: data.name,
                type: data.type,
                buyPrice: String(data.buyPrice),
                sellPrice: String(data.sellPrice),
            });
            session.flash('success', i18n.t('messages.admin.resources.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'resources.update failed');
            session.flash('error', i18n.t('messages.admin.resources.update.error'));
        }

        return response.redirect().back();
    }

    public async reorder({ request, response, session, i18n }: HttpContext) {
        const { items } = await request.validateUsing(reorderResourcesValidator);

        try {
            await this.resourceRepository.reorder(items);
        } catch (e) {
            logger.error({ err: e }, 'resources.reorder failed');
            session.flash('error', i18n.t('messages.admin.resources.update.error'));
        }

        return response.redirect().back();
    }

    public async destroy({ params, response, session, i18n }: HttpContext) {
        try {
            await this.resourceRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.resources.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'resources.destroy failed');
            session.flash('error', i18n.t('messages.admin.resources.destroy.error'));
        }

        return response.redirect().toRoute('admin.resources.index');
    }
}
