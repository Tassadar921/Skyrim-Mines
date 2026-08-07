import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import UserRepository from '#repositories/user_repository';
import OrganizationRepository from '#repositories/organization_repository';
import UserTransformer from '#transformers/user_transformer';
import OrganizationTransformer from '#transformers/organization_transformer';
import UserRoleEnum from '#types/enum/user_role_enum';
import OrganizationRoleEnum from '#types/enum/organization_role_enum';
import { isClientOrAuditor } from '#helpers/user_role_helper';
import { storeOrganizationMemberValidator, updateOrganizationMemberRoleValidator } from '#validators/organization';

export default class OrganizationController {
    constructor(
        private readonly userRepository: UserRepository = new UserRepository(),
        private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
    ) {}

    public async show({ inertia, auth }: HttpContext) {
        const organizationId = auth.user!.organizationId!;

        const organization = await this.organizationRepository.findOrFail(organizationId);
        const members = await this.userRepository.findMembersForOrganization(organizationId);
        const eligibleUsers = await this.userRepository.findEligibleIndependentClients();

        return inertia.render('organization/show', {
            organization: new OrganizationTransformer(organization).toObject(),
            members: members.map((member) => new UserTransformer(member).toObject()),
            eligibleUsers: eligibleUsers.map((user) => ({ id: user.id, username: user.username })),
        });
    }

    public async storeMember({ request, auth, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(storeOrganizationMemberValidator);
        const actingRole = auth.user!.organizationRole as OrganizationRoleEnum;
        const organizationId = auth.user!.organizationId!;

        if (data.role === OrganizationRoleEnum.OWNER || (actingRole === OrganizationRoleEnum.ADMIN && data.role !== OrganizationRoleEnum.STAFF)) {
            session.flash('error', i18n.t('messages.organization.members.create.forbiddenRole'));
            return response.redirect().back();
        }

        try {
            if (data.mode === 'existing') {
                if (!data.userId) {
                    session.flash('error', i18n.t('messages.organization.members.create.missingUser'));
                    return response.redirect().back();
                }

                const target = await this.userRepository.findOrFail(data.userId);
                if (!isClientOrAuditor(target.role) || target.organizationId) {
                    session.flash('error', i18n.t('messages.organization.members.create.userNotEligible'));
                    return response.redirect().back();
                }

                await this.userRepository.attachToOrganization(data.userId, organizationId, data.role);
            } else {
                if (!data.discordId || !data.username) {
                    session.flash('error', i18n.t('messages.organization.members.create.missingFields'));
                    return response.redirect().back();
                }

                if (await this.userRepository.findByDiscordId(data.discordId)) {
                    session.flash('error', i18n.t('messages.organization.members.create.discordIdTaken'));
                    return response.redirect().back();
                }

                await this.userRepository.create({
                    discordId: data.discordId,
                    username: data.username,
                    role: UserRoleEnum.CLIENT,
                    organizationId,
                    organizationRole: data.role,
                });
            }

            session.flash('success', i18n.t('messages.organization.members.create.success'));
        } catch (e) {
            logger.error({ err: e }, 'organization.storeMember failed');
            session.flash('error', i18n.t('messages.organization.members.create.error'));
        }

        return response.redirect().back();
    }

    public async destroyMember({ params, auth, response, session, i18n }: HttpContext) {
        const actingRole = auth.user!.organizationRole as OrganizationRoleEnum;
        const organizationId = auth.user!.organizationId!;

        if (params.id === auth.user!.id) {
            session.flash('error', i18n.t('messages.organization.members.destroy.cannotTargetSelf'));
            return response.redirect().back();
        }

        try {
            const target = await this.userRepository.findOrFail(params.id);

            const canManageTarget =
                target.organizationId === organizationId &&
                target.organizationRole !== OrganizationRoleEnum.OWNER &&
                (actingRole === OrganizationRoleEnum.OWNER || target.organizationRole === OrganizationRoleEnum.STAFF);

            if (!canManageTarget) {
                session.flash('error', i18n.t('messages.organization.members.destroy.forbiddenRole'));
                return response.redirect().back();
            }

            await this.userRepository.removeFromOrganization(params.id);
            session.flash('success', i18n.t('messages.organization.members.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'organization.destroyMember failed');
            session.flash('error', i18n.t('messages.organization.members.destroy.error'));
        }

        return response.redirect().back();
    }

    public async updateMemberRole({ request, params, auth, response, session, i18n }: HttpContext) {
        const data = await request.validateUsing(updateOrganizationMemberRoleValidator);
        const organizationId = auth.user!.organizationId!;

        if (params.id === auth.user!.id) {
            session.flash('error', i18n.t('messages.organization.members.updateRole.cannotTargetSelf'));
            return response.redirect().back();
        }

        try {
            const target = await this.userRepository.findOrFail(params.id);

            if (target.organizationId !== organizationId || target.organizationRole === OrganizationRoleEnum.OWNER) {
                session.flash('error', i18n.t('messages.organization.members.updateRole.error'));
                return response.redirect().back();
            }

            await this.userRepository.updateOrganizationRole(params.id, data.role);
            session.flash('success', i18n.t('messages.organization.members.updateRole.success'));
        } catch (e) {
            logger.error({ err: e }, 'organization.updateMemberRole failed');
            session.flash('error', i18n.t('messages.organization.members.updateRole.error'));
        }

        return response.redirect().back();
    }
}
