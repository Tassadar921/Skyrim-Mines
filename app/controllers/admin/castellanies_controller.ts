import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import CastellanyRepository from '#repositories/castellany_repository';
import CastellanyTransformer from '#transformers/castellany_transformer';
import { createCastellanyValidator, updateCastellanyValidator, indexCastellanyValidator } from '#validators/admin/castellanies';

export default class CastellaniesController {
    constructor(private readonly castellanyRepository: CastellanyRepository = new CastellanyRepository()) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search } = await request.validateUsing(indexCastellanyValidator);

        const currentSort = sort ?? 'name';
        const currentDir = dir ?? 'asc';
        const currentPage = page ?? 1;

        const castellanies = await this.castellanyRepository.paginate({
            page: currentPage,
            perPage: 20,
            sort: currentSort,
            dir: currentDir,
            search,
        });

        return inertia.render('admin/castellanies/index', {
            castellanies: castellanies.all().map((castellany) => new CastellanyTransformer(castellany).toObject()),
            meta: {
                total: castellanies.total,
                currentPage: castellanies.currentPage,
                lastPage: castellanies.lastPage,
                perPage: castellanies.perPage,
            },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir },
        });
    }

    public async create({ inertia }: HttpContext) {
        return inertia.render('admin/castellanies/create', {});
    }

    public async store({ request, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(createCastellanyValidator);
        try {
            await this.castellanyRepository.create(data);
            session.flash('success', i18n.t('messages.admin.castellanies.create.success'));
            return response.redirect().toRoute('admin.castellanies.index');
        } catch (e) {
            logger.error({ err: e }, 'castellanies.store failed');
            session.flash('error', i18n.t('messages.admin.castellanies.create.error'));
            return response.redirect().back();
        }
    }

    public async show({ inertia, params }: HttpContext) {
        const castellany = await this.castellanyRepository.findOrFail(params.id);
        return inertia.render('admin/castellanies/show', {
            castellany: new CastellanyTransformer(castellany).toObject(),
        });
    }

    public async update({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(updateCastellanyValidator);
        try {
            await this.castellanyRepository.update(params.id, data);
            session.flash('success', i18n.t('messages.admin.castellanies.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'castellanies.update failed');
            session.flash('error', i18n.t('messages.admin.castellanies.update.error'));
        }
        return response.redirect().back();
    }

    public async destroy({ params, response, session, i18n }: HttpContext) {
        try {
            await this.castellanyRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.castellanies.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'castellanies.destroy failed');
            session.flash('error', i18n.t('messages.admin.castellanies.destroy.error'));
        }
        return response.redirect().toRoute('admin.castellanies.index');
    }
}
