import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import OrganizationRepository from '#repositories/organization_repository';
import UserRepository from '#repositories/user_repository';
import ResourceRepository from '#repositories/resource_repository';
import OrganizationResourcePriceRepository from '#repositories/organization_resource_price_repository';
import CastellanyRepository from '#repositories/castellany_repository';
import UserTransformer from '#transformers/user_transformer';
import OrganizationTransformer from '#transformers/organization_transformer';
import ResourceTransformer from '#transformers/resource_transformer';
import CastellanyTransformer from '#transformers/castellany_transformer';
import UserRoleEnum from '#types/enum/user_role_enum';
import { isClientOrAuditor } from '#helpers/user_role_helper';
import { createOrganizationValidator, updateOrganizationValidator, storeOrganizationMemberValidator, updateOrganizationMemberRoleValidator } from '#validators/admin/organizations';
import { upsertOrganizationResourcePriceValidator } from '#validators/admin/organization_resource_prices';

export default class OrganizationsController {
    constructor(
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly organizationResourcePriceRepository: OrganizationResourcePriceRepository = new OrganizationResourcePriceRepository(),
        private readonly castellanyRepository: CastellanyRepository = new CastellanyRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const organizations = await this.organizationRepository.allWithStats();

        return inertia.render('admin/organizations/index', { organizations });
    }

    public async create({ inertia }: HttpContext) {
        const castellanies = await this.castellanyRepository.all();

        return inertia.render('admin/organizations/create', {
            castellanies: castellanies.map((castellany) => new CastellanyTransformer(castellany).toObject()),
        });
    }

    public async store({ request, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(createOrganizationValidator);

        try {
            const organization = await this.organizationRepository.create(data);
            session.flash('success', i18n.t('messages.admin.organizations.create.success'));
            return response.redirect().toRoute('admin.organizations.show', { id: organization.id });
        } catch (e) {
            logger.error({ err: e }, 'organizations.store failed');
            session.flash('error', i18n.t('messages.admin.organizations.create.error'));
            return response.redirect().back();
        }
    }

    public async show({ inertia, params }: HttpContext) {
        const organization = await this.organizationRepository.findOrFail(params.id);
        const members = await this.userRepository.findMembersForOrganization(params.id);
        const eligibleUsers = await this.userRepository.findEligibleIndependentClients();
        const resources = await this.resourceRepository.all();
        const resourcePrices = await this.organizationResourcePriceRepository.findForOrganization(params.id);
        const customSellPrices = Object.fromEntries(resourcePrices.map((price) => [price.resourceId, Number(price.sellPrice)]));
        const castellanies = await this.castellanyRepository.all();

        return inertia.render('admin/organizations/show', {
            organization: new OrganizationTransformer(organization).toObject(),
            members: members.map((member) => new UserTransformer(member).toObject()),
            eligibleUsers: eligibleUsers.map((user) => ({ id: user.id, username: user.username })),
            resources: resources.map((resource) => new ResourceTransformer(resource).toObject()),
            customSellPrices,
            castellanies: castellanies.map((castellany) => new CastellanyTransformer(castellany).toObject()),
        });
    }

    public async update({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(updateOrganizationValidator);

        try {
            await this.organizationRepository.update(params.id, data);
            session.flash('success', i18n.t('messages.admin.organizations.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'organizations.update failed');
            session.flash('error', i18n.t('messages.admin.organizations.update.error'));
        }

        return response.redirect().back();
    }

    public async destroy({ params, response, session, i18n }: HttpContext) {
        try {
            await this.organizationRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.organizations.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'organizations.destroy failed');
            session.flash('error', i18n.t('messages.admin.organizations.destroy.error'));
        }

        return response.redirect().toRoute('admin.organizations.index');
    }

    public async storeMember({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(storeOrganizationMemberValidator);

        try {
            if (data.mode === 'existing') {
                if (!data.userId) {
                    session.flash('error', i18n.t('messages.admin.organizations.members.create.missingUser'));
                    return response.redirect().back();
                }

                const target = await this.userRepository.findOrFail(data.userId);
                if (!isClientOrAuditor(target.role) || target.organizationId) {
                    session.flash('error', i18n.t('messages.admin.organizations.members.create.userNotEligible'));
                    return response.redirect().back();
                }

                await this.userRepository.attachToOrganization(data.userId, params.id, data.role);
            } else {
                if (!data.discordId || !data.username) {
                    session.flash('error', i18n.t('messages.admin.organizations.members.create.missingFields'));
                    return response.redirect().back();
                }

                if (await this.userRepository.findByDiscordId(data.discordId)) {
                    session.flash('error', i18n.t('messages.admin.organizations.members.create.discordIdTaken'));
                    return response.redirect().back();
                }

                await this.userRepository.create({
                    discordId: data.discordId,
                    username: data.username,
                    role: UserRoleEnum.CLIENT,
                    organizationId: params.id,
                    organizationRole: data.role,
                });
            }

            session.flash('success', i18n.t('messages.admin.organizations.members.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'organizations.storeMember failed');
            session.flash('error', i18n.t('messages.admin.organizations.members.create.error'));
        }

        return response.redirect().back();
    }

    public async destroyMember({ params, response, session, i18n }: HttpContext) {
        try {
            const target = await this.userRepository.findOrFail(params.memberId);

            if (target.organizationId !== params.id) {
                session.flash('error', i18n.t('messages.admin.organizations.members.destroy.error'));
                return response.redirect().back();
            }

            await this.userRepository.removeFromOrganization(params.memberId);
            session.flash('success', i18n.t('messages.admin.organizations.members.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'organizations.destroyMember failed');
            session.flash('error', i18n.t('messages.admin.organizations.members.destroy.error'));
        }

        return response.redirect().back();
    }

    public async updateMemberRole({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(updateOrganizationMemberRoleValidator);

        try {
            const target = await this.userRepository.findOrFail(params.memberId);

            if (target.organizationId !== params.id) {
                session.flash('error', i18n.t('messages.admin.organizations.members.updateRole.error'));
                return response.redirect().back();
            }

            await this.userRepository.updateOrganizationRole(params.memberId, data.role);
            session.flash('success', i18n.t('messages.admin.organizations.members.updateRole.success'));
        } catch (e) {
            logger.error({ err: e }, 'organizations.updateMemberRole failed');
            session.flash('error', i18n.t('messages.admin.organizations.members.updateRole.error'));
        }

        return response.redirect().back();
    }

    public async updateResourcePrice({ request, params, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(upsertOrganizationResourcePriceValidator);

        try {
            await this.organizationResourcePriceRepository.upsert(params.id, params.resourceId, data.sellPrice);
            session.flash('success', i18n.t('messages.admin.organizations.resourcePrices.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'organizations.updateResourcePrice failed');
            session.flash('error', i18n.t('messages.admin.organizations.resourcePrices.update.error'));
        }

        return response.redirect().back();
    }

    public async destroyResourcePrice({ params, response, session, i18n }: HttpContext) {
        try {
            await this.organizationResourcePriceRepository.delete(params.id, params.resourceId);
            session.flash('success', i18n.t('messages.admin.organizations.resourcePrices.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'organizations.destroyResourcePrice failed');
            session.flash('error', i18n.t('messages.admin.organizations.resourcePrices.destroy.error'));
        }

        return response.redirect().back();
    }
}
