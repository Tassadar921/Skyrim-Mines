import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import UserRepository from '#repositories/user_repository';
import OrganizationRepository from '#repositories/organization_repository';
import FileRepository from '#repositories/file_repository';
import ResourceRepository from '#repositories/resource_repository';
import ResourceDepositRepository from '#repositories/resource_deposit_repository';
import ResourceBuybackRepository from '#repositories/resource_buyback_repository';
import ResourceBarrelAdjustmentRepository from '#repositories/resource_barrel_adjustment_repository';
import UserTransformer from '#transformers/user_transformer';
import OrganizationTransformer from '#transformers/organization_transformer';
import UserRoleEnum from '#types/enum/user_role_enum';
import type OrganizationRoleEnum from '#types/enum/organization_role_enum';
import { isClientOrAuditor } from '#helpers/user_role_helper';
import { computeBarrelQuantity } from '#helpers/resource_barrel_helper';
import { storeUploadedFile, deleteStoredFile } from '#helpers/file_storage_helper';
import { indexUserValidator, updateUserValidator, createUserValidator, updateUserAvatarValidator, updateUserBalanceValidator } from '#validators/admin/users';

/** Roles a foreman (contremaître) is allowed to assign or act on — owner and foreman accounts stay reserved for owners. */
const FOREMAN_ASSIGNABLE_ROLES: UserRoleEnum[] = [UserRoleEnum.STAFF, UserRoleEnum.FORMER_STAFF, UserRoleEnum.CONTRACTOR, UserRoleEnum.CLIENT];

export default class UsersController {
    constructor(
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
        private readonly fileRepository: FileRepository = new FileRepository(),
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly resourceDepositRepository: ResourceDepositRepository = new ResourceDepositRepository(),
        private readonly resourceBuybackRepository: ResourceBuybackRepository = new ResourceBuybackRepository(),
        private readonly resourceBarrelAdjustmentRepository: ResourceBarrelAdjustmentRepository = new ResourceBarrelAdjustmentRepository(),
    ) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search, withoutAvatar, role, enabled } = await request.validateUsing(indexUserValidator);

        const currentSort = sort ?? 'createdAt';
        const currentDir = dir ?? 'desc';
        const currentPage = page ?? 1;

        const [users, resources, depositTotals, buybackTotals, adjustmentTotals] = await Promise.all([
            this.userRepository.paginate({
                page: currentPage,
                perPage: 20,
                sort: currentSort,
                dir: currentDir,
                search,
                withoutAvatar,
                role,
                enabled,
            }),
            this.resourceRepository.all(),
            this.resourceDepositRepository.sumByUserAndResource(),
            this.resourceBuybackRepository.sumByUserAndResource(),
            this.resourceBarrelAdjustmentRepository.sumByUserAndResource(),
        ]);

        const barrelValueForUser = (userId: string): number =>
            resources.reduce((sum, resource) => {
                const key = `${userId}:${resource.id}`;
                const quantity = (depositTotals.get(key) ?? 0) - (buybackTotals.get(key) ?? 0) + (adjustmentTotals.get(key) ?? 0);
                return sum + quantity * Number(resource.buyPrice);
            }, 0);

        return inertia.render('admin/users/index', {
            users: users.all().map((u) => ({ ...new UserTransformer(u).toObject(), avatarUrl: u.avatar?.path ?? null, barrelValue: barrelValueForUser(u.id) })),
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

        const [resources, deposits, buybacks, adjustments] = await Promise.all([
            this.resourceRepository.all(),
            this.resourceDepositRepository.sumByUser(user.id),
            this.resourceBuybackRepository.sumByUser(user.id),
            this.resourceBarrelAdjustmentRepository.sumByUser(user.id),
        ]);

        return inertia.render('admin/users/show', {
            targetUser: { ...new UserTransformer(user).toObject(), avatarUrl: user.avatar?.path ?? null },
            barrelEntries: resources.map((resource) => ({
                resourceId: resource.id,
                resourceName: resource.name,
                resourceType: resource.type,
                quantity: computeBarrelQuantity(resource.id, deposits, buybacks, adjustments),
            })),
        });
    }

    public async updateAvatar({ request, params, response, session, i18n, auth }: HttpContext) {
        const { avatar } = await request.validateUsing(updateUserAvatarValidator);

        try {
            const user = await this.userRepository.findOrFail(params.id);

            if (auth.user!.role === UserRoleEnum.FOREMAN && !FOREMAN_ASSIGNABLE_ROLES.includes(user.role as UserRoleEnum)) {
                session.flash('error', i18n.t('messages.admin.users.update.roleNotAllowed'));
                return response.redirect().back();
            }

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

    public async destroyAvatar({ params, response, session, i18n, auth }: HttpContext) {
        try {
            const user = await this.userRepository.findOrFail(params.id);

            if (auth.user!.role === UserRoleEnum.FOREMAN && !FOREMAN_ASSIGNABLE_ROLES.includes(user.role as UserRoleEnum)) {
                session.flash('error', i18n.t('messages.admin.users.update.roleNotAllowed'));
                return response.redirect().back();
            }

            if (user.avatarId) {
                const file = await this.fileRepository.findOrFail(user.avatarId);
                await this.userRepository.setAvatar(user.id, null);
                await deleteStoredFile(file.path);
                await this.fileRepository.delete(file.id);
            }

            session.flash('success', i18n.t('messages.admin.users.avatar.destroySuccess'));
        } catch (e) {
            logger.error({ err: e }, 'users.destroyAvatar failed');
            session.flash('error', i18n.t('messages.admin.users.avatar.destroyError'));
        }

        return response.redirect().back();
    }

    public async update({ request, params, response, session, i18n, auth }: HttpContext) {
        const data = await request.validateUsing(updateUserValidator);

        try {
            if (auth.user!.role === UserRoleEnum.FOREMAN) {
                const target = await this.userRepository.findOrFail(params.id);
                const targetRoleAllowed = FOREMAN_ASSIGNABLE_ROLES.includes(target.role as UserRoleEnum);
                const newRoleAllowed = FOREMAN_ASSIGNABLE_ROLES.includes(data.role as UserRoleEnum);
                if (!targetRoleAllowed || !newRoleAllowed) {
                    session.flash('error', i18n.t('messages.admin.users.update.roleNotAllowed'));
                    return response.redirect().back();
                }
            }

            await this.userRepository.update(params.id, data);
            session.flash('success', i18n.t('messages.admin.users.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'users.update failed');
            session.flash('error', i18n.t('messages.admin.users.update.error'));
        }

        return response.redirect().back();
    }

    public async updateBalance({ request, params, response, session, i18n, auth }: HttpContext) {
        const { balance } = await request.validateUsing(updateUserBalanceValidator);

        try {
            const user = await this.userRepository.findOrFail(params.id);
            if (user.role !== UserRoleEnum.STAFF && user.role !== UserRoleEnum.FORMER_STAFF && user.role !== UserRoleEnum.ADMIN && user.role !== UserRoleEnum.FOREMAN) {
                session.flash('error', i18n.t('messages.admin.users.balance.notEligible'));
                return response.redirect().back();
            }

            if (auth.user!.role === UserRoleEnum.FOREMAN && !FOREMAN_ASSIGNABLE_ROLES.includes(user.role as UserRoleEnum)) {
                session.flash('error', i18n.t('messages.admin.users.update.roleNotAllowed'));
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

    public async store({ request, response, session, i18n, auth }: HttpContext) {
        const data = await request.validateUsing(createUserValidator);

        try {
            if (auth.user!.role === UserRoleEnum.FOREMAN && !FOREMAN_ASSIGNABLE_ROLES.includes(data.role)) {
                session.flash('error', i18n.t('messages.admin.users.create.roleNotAllowed'));
                return response.redirect().back();
            }

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

            if (auth.user!.role === UserRoleEnum.FOREMAN) {
                const target = await this.userRepository.findOrFail(params.id);
                if (!FOREMAN_ASSIGNABLE_ROLES.includes(target.role as UserRoleEnum)) {
                    session.flash('error', i18n.t('messages.admin.users.update.roleNotAllowed'));
                    return response.redirect().toRoute('admin.users.index');
                }
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
