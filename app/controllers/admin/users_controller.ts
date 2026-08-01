import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import UserRepository from '#repositories/user_repository';
import UserTransformer from '#transformers/user_transformer';
import { indexUserValidator, updateUserValidator } from '#validators/admin/users';

export default class UsersController {
    constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search } = await request.validateUsing(indexUserValidator);

        const currentSort = sort ?? 'createdAt';
        const currentDir = dir ?? 'desc';
        const currentPage = page ?? 1;

        const users = await this.userRepository.paginate({
            page: currentPage,
            perPage: 20,
            sort: currentSort,
            dir: currentDir,
            search,
        });

        return inertia.render('admin/users/index', {
            users: users.all().map((u) => new UserTransformer(u).toObject()),
            meta: {
                total: users.total,
                currentPage: users.currentPage,
                lastPage: users.lastPage,
                perPage: users.perPage,
            },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir },
        });
    }

    public async show({ inertia, params }: HttpContext) {
        const user = await this.userRepository.findOrFail(params.id);

        return inertia.render('admin/users/show', {
            user: new UserTransformer(user).toObject(),
        });
    }

    public async exportData({ params, response }: HttpContext) {
        const user = await this.userRepository.findOrFail(params.id);

        const data = {
            export_date: new Date().toISOString(),
            account: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.createdAt.toISO(),
                updated_at: user.updatedAt?.toISO() ?? null,
            },
        };

        const filename = `export-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;
        response.header('Content-Disposition', `attachment; filename="${filename}"`);
        response.header('Content-Type', 'application/json');
        return response.send(JSON.stringify(data, null, 2));
    }

    public async update({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(updateUserValidator);

        try {
            await this.userRepository.update(params.id, data);
            session.flash('success', i18n.t('messages.admin.users.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'users.update failed');
            session.flash('error', i18n.t('messages.admin.users.update.error'));
        }

        return response.redirect().back();
    }
}
