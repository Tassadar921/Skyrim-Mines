import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import UserRepository from '#repositories/user_repository';
import OrganizationRepository from '#repositories/organization_repository';
import FileRepository from '#repositories/file_repository';
import UserTransformer from '#transformers/user_transformer';
import OrganizationTransformer from '#transformers/organization_transformer';
import UserRoleEnum from '#types/enum/user_role_enum';
import type OrganizationRoleEnum from '#types/enum/organization_role_enum';
import { isClientOrAuditor } from '#helpers/user_role_helper';
import { storeUploadedFile, deleteStoredFile } from '#helpers/file_storage_helper';
import { indexUserValidator, updateUserValidator, createUserValidator, updateUserAvatarValidator, updateUserBalanceValidator } from '#validators/admin/users';

export default class UsersController {
    constructor(
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
        private readonly fileRepository: FileRepository = new FileRepository(),
    ) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search, withoutAvatar, role, enabled } = await request.validateUsing(indexUserValidator);

        const currentSort = sort ?? 'createdAt';
        const currentDir = dir ?? 'desc';
        const currentPage = page ?? 1;

        const users = await this.userRepository.paginate({
            page: currentPage,
            perPage: 20,
            sort: currentSort,
            dir: currentDir,
            search,
            withoutAvatar,
            role,
            enabled,
        });

        return inertia.render('admin/users/index', {
            users: users.all().map((u) => ({ ...new UserTransformer(u).toObject(), avatarUrl: u.avatar?.path ?? null })),
            meta: {
                total: users.total,
                currentPage: users.currentPage,
                lastPage: users.lastPage,
                perPage: users.perPage,
            },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir, withoutAvatar: withoutAvatar ?? false, role: role ?? 'all', enabled: enabled ?? 'all' },
        });
    }

    public async show({ inertia, params }: HttpContext) {
        const user = await this.userRepository.findWithAvatar(params.id);

        return inertia.render('admin/users/show', {
            targetUser: { ...new UserTransformer(user).toObject(), avatarUrl: user.avatar?.path ?? null },
        });
    }

    public async updateAvatar({ request, params, response, session, i18n }: HttpContext) {
        const { avatar } = await request.validateUsing(updateUserAvatarValidator);

        try {
            const user = await this.userRepository.findOrFail(params.id);
            const previousAvatarId = user.avatarId;

            const path = await storeUploadedFile(avatar, 'uploads/avatars');
            const file = await this.fileRepository.create({
                path,
                originalName: avatar.clientName,
                mimeType: `${avatar.type}/${avatar.subtype}`,
                size: avatar.size,
            });

            await this.userRepository.setAvatar(params.id, file.id);

            if (previousAvatarId) {
                const previousFile = await this.fileRepository.findOrFail(previousAvatarId);
                await deleteStoredFile(previousFile.path);
                await this.fileRepository.delete(previousAvatarId);
            }

            session.flash('success', i18n.t('messages.admin.users.avatar.success'));
        } catch (e) {
            logger.error({ err: e }, 'users.updateAvatar failed');
            session.flash('error', i18n.t('messages.admin.users.avatar.error'));
        }

        return response.redirect().back();
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

    public async updateBalance({ request, params, response, session, i18n }: HttpContext) {
        const { balance } = await request.validateUsing(updateUserBalanceValidator);

        try {
            const user = await this.userRepository.findOrFail(params.id);
            if (user.role !== UserRoleEnum.STAFF && user.role !== UserRoleEnum.ADMIN) {
                session.flash('error', i18n.t('messages.admin.users.balance.notEligible'));
                return response.redirect().back();
            }

            await this.userRepository.setBalance(params.id, balance);
            session.flash('success', i18n.t('messages.admin.users.balance.success'));
        } catch (e) {
            logger.error({ err: e }, 'users.updateBalance failed');
            session.flash('error', i18n.t('messages.admin.users.balance.error'));
        }

        return response.redirect().back();
    }

    public async create({ inertia }: HttpContext) {
        const organizations = await this.organizationRepository.all();

        return inertia.render('admin/users/create', {
            organizations: organizations.map((o) => new OrganizationTransformer(o).toObject()),
        });
    }

    public async store({ request, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(createUserValidator);

        try {
            if (await this.userRepository.findByDiscordId(data.discordId)) {
                session.flash('error', i18n.t('messages.admin.users.create.discordIdTaken'));
                return response.redirect().back();
            }

            let organizationId: string | null = null;
            let organizationRole: OrganizationRoleEnum | null = null;

            if (isClientOrAuditor(data.role) && (data.organizationMode === 'existing' || data.organizationMode === 'new')) {
                organizationRole = (data.organizationRole as OrganizationRoleEnum) ?? null;

                if (!organizationRole) {
                    session.flash('error', i18n.t('messages.admin.users.create.missingOrganization'));
                    return response.redirect().back();
                }

                if (data.organizationMode === 'existing') {
                    if (!data.organizationId) {
                        session.flash('error', i18n.t('messages.admin.users.create.missingOrganization'));
                        return response.redirect().back();
                    }

                    organizationId = data.organizationId;
                } else {
                    if (!data.organizationName) {
                        session.flash('error', i18n.t('messages.admin.users.create.missingOrganization'));
                        return response.redirect().back();
                    }

                    const organization = await this.organizationRepository.create({ name: data.organizationName });
                    organizationId = organization.id;
                }
            }

            await this.userRepository.create({
                discordId: data.discordId,
                username: data.username,
                role: data.role,
                organizationId,
                organizationRole,
            });

            session.flash('success', i18n.t('messages.admin.users.create.success'));
            return response.redirect().toRoute('admin.users.index');
        } catch (e) {
            logger.error({ err: e }, 'users.store failed');
            session.flash('error', i18n.t('messages.admin.users.create.error'));
            return response.redirect().back();
        }
    }

    public async destroy({ params, response, session, i18n, auth }: HttpContext) {
        try {
            if (auth.user?.id === params.id) {
                session.flash('error', i18n.t('messages.admin.users.destroy.self'));
                return response.redirect().toRoute('admin.users.index');
            }

            if (await this.userRepository.hasLinkedRecords(params.id)) {
                session.flash('error', i18n.t('messages.admin.users.destroy.linked'));
                return response.redirect().toRoute('admin.users.index');
            }

            await this.userRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.users.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'users.destroy failed');
            session.flash('error', i18n.t('messages.admin.users.destroy.error'));
        }

        return response.redirect().toRoute('admin.users.index');
    }
}
